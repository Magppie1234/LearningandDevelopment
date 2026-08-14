-- ---------------------------------------------------------------------
-- 0020 — Individual learner progress: one source of truth
--
-- WHY THIS EXISTS. The dashboard and the certificate currently compute from
-- two entirely disconnected places:
--
--   dashboard    src/data/capability-evidence.ts  — a static TypeScript
--                fixture (EVIDENCE_IS_DEMO = true). Competency evidence has
--                NO table anywhere in the schema.
--   certificate  bd-progress-store / sales-progress-store — zustand `persist`,
--                i.e. browser localStorage, key magppie-bd-progress-v1.
--
-- Neither reads `module_attempts`, which has existed since 0019 with exactly
-- the right per-attempt shape and is written only by the live quiz-submit
-- path. So the two are not merely at risk of disagreeing — structurally they
-- already do: KnowledgeEvidence carries scorePct / passed / takenOn / attempts,
-- the same facts a module attempt records, with no key joining them. They are
-- two unrelated records of the same real-world event.
--
-- This migration adds the three things missing to make one dataset:
--
--   1. module_certifications   the locked first-passing result + post-pass
--                              activity, derived from module_attempts
--   2. competency_evidence     the dashboard's missing source, with its
--                              knowledge channel POINTING AT an attempt row
--                              rather than restating it
--   3. learner_progress_snapshots  point-in-time history, so a trend chart
--                              can read stored fact instead of reconstruction
--
-- DEPENDENCY, STATED PLAINLY: this schema is correct and empty. The portal
-- runs behind one seeded demo identity, so there is no per-person data to put
-- in it until real authentication distinguishes users. A correct schema with
-- nothing behind it is not a working feature, and should not be reported as
-- one.
-- ---------------------------------------------------------------------

-- ---------------------------------------------------------------------
-- 1. CERTIFIED MODULE RESULT
--
-- One row per learner per module. `module_attempts` stays the immutable log;
-- this is the derived, locked verdict — the first attempt that passed.
--
-- The lock is enforced in the database, not just in application code: the
-- trigger below refuses to move certified_attempt_id, certified_score_pct or
-- certified_at once set. Application-side rules get bypassed by the next
-- caller who forgets them; a constraint does not.
-- ---------------------------------------------------------------------
create table module_certifications (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references profiles(id) on delete cascade,
  academy_id            uuid not null references academies(id) on delete cascade,
  module_id             text not null,

  -- The attempt that earned it. FK, not a copy: the score on a certificate
  -- and the score in the attempt log cannot drift apart if there is only one
  -- of them.
  certified_attempt_id  uuid references module_attempts(id) on delete restrict,
  certified_score_pct   int check (certified_score_pct between 0 and 100),
  certified_at          timestamptz,

  -- Activity AFTER certification. Tracking only. Nothing here may ever be
  -- read as, or feed into, the certified result.
  retakes_after_pass    int not null default 0 check (retakes_after_pass >= 0),
  rewatches_after_pass  int not null default 0 check (rewatches_after_pass >= 0),
  last_activity_at      timestamptz,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  unique (user_id, module_id),

  -- Certified means certified: all three facts arrive together or none do.
  constraint certified_is_whole check (
    (certified_attempt_id is null and certified_score_pct is null and certified_at is null)
    or
    (certified_attempt_id is not null and certified_score_pct is not null and certified_at is not null)
  )
);
create index on module_certifications(user_id);
create index on module_certifications(user_id, module_id);

-- Refuse to overwrite a certification. A later, better attempt does not
-- replace it; that is the entire rule.
create or replace function lock_module_certification()
returns trigger language plpgsql as $$
begin
  if old.certified_attempt_id is not null and (
       new.certified_attempt_id is distinct from old.certified_attempt_id
    or new.certified_score_pct  is distinct from old.certified_score_pct
    or new.certified_at         is distinct from old.certified_at
  ) then
    raise exception
      'module_certifications: certified result is immutable once set (user %, module %). Record later activity in retakes_after_pass / rewatches_after_pass instead.',
      old.user_id, old.module_id;
  end if;
  new.updated_at := now();
  return new;
end $$;

create trigger trg_lock_module_certification
  before update on module_certifications
  for each row execute function lock_module_certification();

-- ---------------------------------------------------------------------
-- 2. COMPETENCY EVIDENCE — the dashboard's missing table
--
-- Role readiness runs on five channels, each setting a CEILING, with the
-- validated level being the LOWEST ceiling (never an average). None of them
-- had anywhere to live: src/lib/role-readiness.ts computes over a static
-- fixture. This is that fixture's schema.
--
-- The knowledge channel REFERENCES an attempt rather than restating its score.
-- That single FK is what stops the dashboard and the certificate disagreeing
-- about the same quiz.
-- ---------------------------------------------------------------------
create table competency_evidence (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references profiles(id) on delete cascade,
  competency_id       text not null,

  -- Learner self-rating. Displayed for comparison; never counted toward
  -- validation, per the capability framework.
  self_rating         int check (self_rating between 0 and 5),

  -- Reporting manager's observed rating.
  manager_rating      int check (manager_rating between 0 and 5),
  manager_rated_by    uuid references profiles(id) on delete set null,
  manager_rated_on    date,

  -- Knowledge: the quiz. Points at the attempt; does not duplicate it.
  knowledge_attempt_id uuid references module_attempts(id) on delete set null,

  -- Practical observation. A practical failure cannot be compensated for by a
  -- high quiz score, so criticalCriteriaMet is recorded separately.
  practical_status         text check (practical_status in ('none','failed','partial','passed')),
  practical_critical_met   boolean,
  practical_assessor_id    uuid references profiles(id) on delete set null,
  practical_assessed_on    date,

  -- Work-product sign-off.
  work_product_status      text check (work_product_status in ('none','submitted','approved','rejected')),
  work_product_signed_by   uuid references profiles(id) on delete set null,
  work_product_signed_on   date,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  unique (user_id, competency_id)
);
create index on competency_evidence(user_id);

-- ---------------------------------------------------------------------
-- 3. SNAPSHOTS — the only way a trend chart reads history rather than
--    inferring it
--
-- Nothing in this schema previously stored a point-in-time reading, so a
-- dashboard chart could only ever RECONSTRUCT the past from current evidence
-- dates (which is what src/lib/readiness-trend.ts does today, labelled as
-- such). Reconstruction reads history through today's requirements: if a
-- role's required competencies change, every earlier month silently re-scores.
--
-- A row here is what was true on that date, and stays true afterwards.
--
-- Written by a scheduled job (pg_cron / an edge function on a weekly cadence)
-- — NOT on page load, which would sample whenever someone happened to visit
-- and produce a jagged, attendance-shaped line.
-- ---------------------------------------------------------------------
create table learner_progress_snapshots (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references profiles(id) on delete cascade,
  captured_on           date not null,

  role_readiness_pct    int check (role_readiness_pct between 0 and 100),
  plan_completion_pct   int check (plan_completion_pct between 0 and 100),
  mandatory_compliance_pct int check (mandatory_compliance_pct between 0 and 100),
  competencies_total    int not null default 0,
  competencies_validated int not null default 0,
  overdue_count         int not null default 0,
  expiring_90d_count    int not null default 0,

  -- The verdict at that moment, so history keeps its gating reason. Coverage
  -- alone cannot reproduce "not role ready": a single approved-critical gap
  -- blocks readiness at any percentage, and that fact is unrecoverable later.
  readiness_status      text,

  created_at            timestamptz not null default now(),

  -- One reading per learner per day; a re-run corrects rather than duplicates.
  unique (user_id, captured_on)
);
create index on learner_progress_snapshots(user_id, captured_on desc);

-- ---------------------------------------------------------------------
-- RLS — a learner sees their own record and nothing else.
-- ---------------------------------------------------------------------
alter table module_certifications        enable row level security;
alter table competency_evidence          enable row level security;
alter table learner_progress_snapshots   enable row level security;

create policy "own certifications" on module_certifications
  for select using (auth.uid() = user_id);
create policy "own evidence" on competency_evidence
  for select using (auth.uid() = user_id);
create policy "own snapshots" on learner_progress_snapshots
  for select using (auth.uid() = user_id);

-- Writes are service-role / assessor paths, added with the auth work rather
-- than opened up here. Deliberately no learner-facing insert or update policy:
-- self-certification would defeat the point of evidence.

comment on table module_certifications is
  'Locked first-passing result per learner per module. Derived from module_attempts; immutable once set (see trg_lock_module_certification). Post-pass retakes and rewatches are tracked here but never affect the certified score.';
comment on table competency_evidence is
  'The five evidence channels role readiness is computed from. Knowledge points at a module_attempts row rather than copying its score, so the dashboard and the certificate cannot disagree about the same quiz.';
comment on table learner_progress_snapshots is
  'Point-in-time readings for trend charts. Written by a scheduled job, not on page load. Without these a chart can only reconstruct history from current evidence dates, which re-scores the past whenever requirements change.';
