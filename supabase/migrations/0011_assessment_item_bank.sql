-- ===========================================================================
-- 0011 — Assessment item bank (§3.1, item 5)
-- ---------------------------------------------------------------------------
-- Course-independent question bank that makes the 5-level certification
-- framework testable. Items are tagged by competency (skills.id from 0009)
-- and by target certification level (certification_levels 1–5). Distinct
-- from quiz_questions (0001), which stays as the per-course quiz delivery
-- table; assessments draw from this bank.
--
-- SECURITY (CLAUDE.md rule "Don't put correct quiz answers in client
-- payloads"): employees can NEVER select from this table. Only trainers and
-- admins read it; assessment delivery to employees must go through a server
-- endpoint that strips `correct` and `explanation`.
-- ===========================================================================

create type assessment_item_type as enum ('mcq', 'scenario', 'short_answer');
create type assessment_item_status as enum ('draft', 'in_review', 'published', 'retired');

create table assessment_items (
  id             uuid primary key default gen_random_uuid(),
  competency_id  uuid not null references skills(id) on delete cascade,
  cert_level     int not null references certification_levels(level),
  item_type      assessment_item_type not null,
  status         assessment_item_status not null default 'draft',
  question       text not null,
  -- mcq: {"options": ["...","...","...","..."]}; scenario: {"context": "..."};
  -- short_answer: {} — shape depends on item_type.
  body           jsonb not null default '{}'::jsonb,
  -- mcq: {"index": 2}; scenario/short_answer: {"rubric": "..."} — NEVER sent
  -- to employees; see RLS below.
  correct        jsonb not null default '{}'::jsonb,
  explanation    text,
  is_seed        boolean not null default false,
  -- Phase 3 will add AI-drafted items; they enter as status='draft' with
  -- source='ai' and MUST pass human review before status='published'.
  source         text not null default 'human' check (source in ('human', 'ai')),
  created_by     uuid references profiles(id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index on assessment_items(competency_id);
create index on assessment_items(cert_level);
create index on assessment_items(status);

alter table assessment_items enable row level security;

-- Trainers and above may read the bank (including answers) for authoring and
-- review. Employees get items only via a server endpoint using the service
-- role, which must strip `correct`/`explanation` before responding.
create policy "items_trainer_read" on assessment_items
  for select using (
    public.app_role() in ('trainer','l_and_d_admin','management','super_admin')
  );
create policy "items_admin_write" on assessment_items
  for all using (public.is_admin()) with check (public.is_admin());
create policy "items_trainer_insert" on assessment_items
  for insert with check (
    public.app_role() in ('trainer','l_and_d_admin','super_admin')
  );

-- Publishing gate: AI-sourced items cannot go straight to published.
create or replace function public.enforce_item_review()
returns trigger
language plpgsql
as $$
begin
  if new.source = 'ai' and new.status = 'published'
     and (old is null or old.status not in ('in_review')) then
    raise exception 'AI-drafted items must pass in_review before publishing';
  end if;
  new.updated_at := now();
  return new;
end $$;

create trigger trg_enforce_item_review
  before insert or update on assessment_items
  for each row execute function public.enforce_item_review();
