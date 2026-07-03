-- =====================================================================
-- Magppie Learning & Development Portal — Supabase schema (starter)
-- Postgres 15+ / Supabase. Apply as the first migration, then extend.
-- Covers: enums, core tables, domain-restricted auth, RLS, seed data.
-- NOTE: This is a solid foundation. Claude Code should extend/migrate it
--       (generate TS types after applying). Review RLS before production.
-- =====================================================================

create extension if not exists "pgcrypto";
-- Enable for AI semantic search (optional; safe to leave enabled):
create extension if not exists "vector";

-- ---------------------------------------------------------------------
-- 1. ENUMS
-- ---------------------------------------------------------------------
create type user_role as enum
  ('super_admin','management','l_and_d_admin','manager','trainer','employee');

create type profile_status as enum
  ('pending_setup','active','suspended');

create type department_group as enum
  ('client_facing','operations','support_growth');

create type content_type as enum
  ('video','interactive','sop_document','quiz','assignment',
   'assessment','case_study','live_session','practical_project');

create type publish_status as enum ('draft','published','archived');

create type enrollment_status as enum
  ('not_started','in_progress','completed','expired');

create type assignment_status as enum
  ('assigned','submitted','under_review','approved','needs_revision');

create type knowledge_category as enum
  ('sop','policy','process_document','product_catalog','installation_manual',
   'quality_standard','training_video','template','checklist','technical_drawing');

create type access_level as enum
  ('all_employees','department','managers','admins');

create type cert_status as enum
  ('not_started','course_completed','assessment_passed','practical_passed',
   'pending_approval','issued','expired','revoked');

create type question_type as enum ('mcq','multi_select','true_false','short_answer');

-- ---------------------------------------------------------------------
-- 2. DOMAIN ALLOW-LIST (data-driven; editable by super_admin)
-- ---------------------------------------------------------------------
create table allowed_email_domains (
  domain      text primary key check (domain = lower(domain)),
  created_at  timestamptz not null default now()
);
insert into allowed_email_domains(domain) values ('mymagppie.com'), ('magppie.com');

-- ---------------------------------------------------------------------
-- 3. ORG STRUCTURE
-- ---------------------------------------------------------------------
create table departments (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  slug        text not null unique,
  grp         department_group not null,
  description text,
  sort_order  int default 0,
  created_at  timestamptz not null default now()
);

create table positions (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  department_id    uuid references departments(id) on delete set null,
  level            int default 1,                       -- seniority
  next_position_id uuid references positions(id) on delete set null,
  created_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 4. PROFILES (1:1 with auth.users)
-- ---------------------------------------------------------------------
create table profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  email                 text not null,
  full_name             text,
  avatar_url            text,
  employee_code         text unique,
  role                  user_role not null default 'employee',
  status                profile_status not null default 'pending_setup',
  department_id         uuid references departments(id) on delete set null,
  position_id           uuid references positions(id) on delete set null,
  manager_id            uuid references profiles(id) on delete set null,
  date_of_joining       date,
  onboarding_completed_at timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index on profiles(department_id);
create index on profiles(manager_id);
create index on profiles(role);

-- ---------------------------------------------------------------------
-- 5. ACADEMIES → COURSES → LESSONS
-- ---------------------------------------------------------------------
create table academies (
  id            uuid primary key default gen_random_uuid(),
  department_id uuid not null references departments(id) on delete cascade,
  name          text not null,
  slug          text not null unique,
  description   text,
  icon          text,
  sort_order    int default 0,
  status        publish_status not null default 'draft',
  is_seed       boolean not null default false,
  created_at    timestamptz not null default now()
);

create table courses (
  id                uuid primary key default gen_random_uuid(),
  academy_id        uuid not null references academies(id) on delete cascade,
  title             text not null,
  slug              text not null,
  description       text,
  topics_covered    text[] default '{}',     -- preserves source "Topics Covered"
  learning_outcomes text[] default '{}',     -- preserves source "Learning Outcomes"
  cert_level        int check (cert_level between 1 and 5),
  estimated_minutes int default 0,
  is_mandatory      boolean not null default false,
  sort_order        int default 0,
  status            publish_status not null default 'draft',
  is_seed           boolean not null default false,
  created_at        timestamptz not null default now(),
  unique(academy_id, slug)
);
create index on courses(academy_id);

create table lessons (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references courses(id) on delete cascade,
  title         text not null,
  type          content_type not null default 'sop_document',
  body          text,                 -- markdown/html for reading lessons
  content_url   text,                 -- video / external / storage path
  storage_path  text,                 -- supabase storage object
  duration_min  int default 0,
  sort_order    int default 0,
  is_required   boolean not null default true,
  created_at    timestamptz not null default now()
);
create index on lessons(course_id);

-- ---------------------------------------------------------------------
-- 6. ENROLLMENTS & PROGRESS
-- ---------------------------------------------------------------------
create table enrollments (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  course_id    uuid not null references courses(id) on delete cascade,
  status       enrollment_status not null default 'not_started',
  progress_pct int not null default 0 check (progress_pct between 0 and 100),
  assigned_by  uuid references profiles(id) on delete set null,
  due_at       timestamptz,
  started_at   timestamptz,
  completed_at timestamptz,
  created_at   timestamptz not null default now(),
  unique(user_id, course_id)
);
create index on enrollments(user_id);
create index on enrollments(course_id);

create table lesson_progress (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  lesson_id    uuid not null references lessons(id) on delete cascade,
  completed    boolean not null default false,
  acknowledged boolean not null default false,  -- "read & understood"
  completed_at timestamptz,
  unique(user_id, lesson_id)
);

-- ---------------------------------------------------------------------
-- 7. LIVE SESSIONS & ATTENDANCE
-- ---------------------------------------------------------------------
create table live_sessions (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid references courses(id) on delete cascade,
  title       text not null,
  starts_at   timestamptz not null,
  ends_at     timestamptz,
  join_url    text,
  trainer_id  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);
create table session_attendance (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid not null references live_sessions(id) on delete cascade,
  user_id      uuid not null references profiles(id) on delete cascade,
  attended_pct int default 0 check (attended_pct between 0 and 100),
  unique(session_id, user_id)
);

-- ---------------------------------------------------------------------
-- 8. ASSIGNMENTS & SUBMISSIONS
-- ---------------------------------------------------------------------
create table assignments (
  id              uuid primary key default gen_random_uuid(),
  course_id       uuid references courses(id) on delete cascade,
  title           text not null,
  instructions    text,
  rubric          jsonb default '[]'::jsonb,   -- [{criterion, max_points}]
  max_score       int default 100,
  due_offset_days int,                          -- N days after enrollment, or null
  due_at          timestamptz,                  -- absolute deadline, or null
  submission_type text default 'file' check (submission_type in ('file','text','link','practical_evidence')),
  created_by      uuid references profiles(id) on delete set null,
  status          publish_status not null default 'draft',
  created_at      timestamptz not null default now()
);

create table assignment_submissions (
  id            uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references assignments(id) on delete cascade,
  user_id       uuid not null references profiles(id) on delete cascade,
  status        assignment_status not null default 'submitted',
  text_answer   text,
  file_path     text,                 -- supabase storage object
  link_url      text,
  score         int,
  feedback      text,
  reviewer_id   uuid references profiles(id) on delete set null,
  submitted_at  timestamptz not null default now(),
  reviewed_at   timestamptz,
  unique(assignment_id, user_id)
);
create index on assignment_submissions(user_id);

-- ---------------------------------------------------------------------
-- 9. QUIZZES & ASSESSMENTS
-- ---------------------------------------------------------------------
create table quizzes (
  id               uuid primary key default gen_random_uuid(),
  course_id        uuid references courses(id) on delete cascade,
  lesson_id        uuid references lessons(id) on delete set null,
  title            text not null,
  is_assessment    boolean not null default false,  -- true = certification-grade
  passing_pct      int not null default 80,
  time_limit_min   int,
  attempts_allowed int not null default 2,
  randomize        boolean not null default true,
  created_at       timestamptz not null default now()
);

create table quiz_questions (
  id            uuid primary key default gen_random_uuid(),
  quiz_id       uuid not null references quizzes(id) on delete cascade,
  type          question_type not null default 'mcq',
  prompt        text not null,
  options       jsonb default '[]'::jsonb,   -- [{key,label}]
  correct       jsonb default '[]'::jsonb,   -- keys / accepted answers
  points        int not null default 1,
  needs_review  boolean not null default false,  -- short_answer/case-study
  sort_order    int default 0
);

create table quiz_attempts (
  id           uuid primary key default gen_random_uuid(),
  quiz_id      uuid not null references quizzes(id) on delete cascade,
  user_id      uuid not null references profiles(id) on delete cascade,
  answers      jsonb default '{}'::jsonb,
  score_pct    int,
  passed       boolean,
  started_at   timestamptz not null default now(),
  submitted_at timestamptz
);
create index on quiz_attempts(user_id, quiz_id);

-- ---------------------------------------------------------------------
-- 10. CERTIFICATIONS
-- ---------------------------------------------------------------------
create table certification_levels (
  level                 int primary key check (level between 1 and 5),
  title                 text not null,
  focus_area            text,
  assessment_method     text,
  passing_threshold     text,
  practical_demonstration text,
  validity_months       int                       -- null = no expiry
);

create table certifications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  academy_id    uuid references academies(id) on delete set null,
  level         int not null references certification_levels(level),
  status        cert_status not null default 'not_started',
  credential_id text unique,           -- generated on issue
  approver_id   uuid references profiles(id) on delete set null,
  issued_at     timestamptz,
  expires_at    timestamptz,
  created_at    timestamptz not null default now()
);
create index on certifications(user_id);

-- ---------------------------------------------------------------------
-- 11. SKILLS, CAREER PATHS, PROMOTION READINESS
-- ---------------------------------------------------------------------
create table skills (
  id        uuid primary key default gen_random_uuid(),
  name      text not null unique,
  category  text
);

create table user_skills (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  skill_id      uuid not null references skills(id) on delete cascade,
  current_level int not null default 0 check (current_level between 0 and 5),
  target_level  int not null default 0 check (target_level between 0 and 5),
  updated_at    timestamptz not null default now(),
  unique(user_id, skill_id)
);

create table career_paths (
  id                uuid primary key default gen_random_uuid(),
  current_position  text not null,
  next_position     text not null,
  technical_skills  text[] default '{}',
  leadership_skills text[] default '{}',
  required_certs    text[] default '{}',
  prs_threshold     int not null default 75,
  created_at        timestamptz not null default now()
);

create table promotion_readiness (
  user_id     uuid primary key references profiles(id) on delete cascade,
  score       int not null default 0 check (score between 0 and 100),
  breakdown   jsonb default '{}'::jsonb,    -- {skills, certs, tenure, manager_eval}
  computed_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 12. LEARNING PATH TEMPLATES (role/department-specific onboarding)
-- ---------------------------------------------------------------------
create table learning_path_templates (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  department_id uuid references departments(id) on delete cascade,
  position_id   uuid references positions(id) on delete set null,
  description   text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

create table learning_path_items (
  id           uuid primary key default gen_random_uuid(),
  template_id  uuid not null references learning_path_templates(id) on delete cascade,
  course_id    uuid references courses(id) on delete cascade,
  sort_order   int not null default 0,
  is_mandatory boolean not null default true
);

-- Onboarding checklist (policies to ack, tools to set up, etc.)
create table onboarding_tasks (
  id            uuid primary key default gen_random_uuid(),
  department_id uuid references departments(id) on delete cascade,
  title         text not null,
  description   text,
  kind          text default 'task' check (kind in ('task','policy_ack','tool_setup','course','assignment')),
  link_url      text,
  sort_order    int default 0
);
create table onboarding_progress (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references profiles(id) on delete cascade,
  task_id   uuid not null references onboarding_tasks(id) on delete cascade,
  done      boolean not null default false,
  done_at   timestamptz,
  unique(user_id, task_id)
);

-- ---------------------------------------------------------------------
-- 13. KNOWLEDGE CENTER
-- ---------------------------------------------------------------------
create table knowledge_items (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  category      knowledge_category not null,
  department_id uuid references departments(id) on delete set null,
  body          text,
  file_path     text,
  version       text default 'v1',
  access        access_level not null default 'all_employees',
  tags          text[] default '{}',
  update_freq   text,
  last_reviewed date,
  search_tsv    tsvector,
  embedding     vector(1536),         -- for AI semantic search (optional)
  created_by    uuid references profiles(id) on delete set null,
  created_at    timestamptz not null default now()
);
create index knowledge_search_idx on knowledge_items using gin(search_tsv);
create index on knowledge_items(category);

create or replace function knowledge_tsv_trigger() returns trigger as $$
begin
  new.search_tsv :=
    setweight(to_tsvector('english', coalesce(new.title,'')), 'A') ||
    setweight(to_tsvector('english', array_to_string(new.tags,' ')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.body,'')), 'C');
  return new;
end $$ language plpgsql;
create trigger knowledge_tsv_update before insert or update
  on knowledge_items for each row execute function knowledge_tsv_trigger();

-- ---------------------------------------------------------------------
-- 14. NOTIFICATIONS & AUDIT LOG
-- ---------------------------------------------------------------------
create table notifications (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references profiles(id) on delete cascade,
  kind      text not null,
  title     text not null,
  body      text,
  link_url  text,
  read_at   timestamptz,
  created_at timestamptz not null default now()
);
create index on notifications(user_id, read_at);

create table audit_log (
  id         uuid primary key default gen_random_uuid(),
  actor_id   uuid references profiles(id) on delete set null,
  action     text not null,
  entity     text,
  entity_id  uuid,
  meta       jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- 15. DOMAIN-RESTRICTED AUTH (defense in depth)
-- =====================================================================

-- (a) Helper: is an email's domain allow-listed?
create or replace function public.is_domain_allowed(p_email text)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.allowed_email_domains
    where domain = lower(split_part(p_email, '@', 2))
  );
$$;

-- (b) BEFORE INSERT trigger on auth.users — hard block at DB level.
--     This aborts user creation for non-allowed domains even if the
--     Auth Hook (below) is not configured.
create or replace function public.enforce_email_domain()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_domain_allowed(new.email) then
    raise exception 'Access is restricted to Magppie company accounts (allowed domains only).';
  end if;
  return new;
end $$;

drop trigger if exists trg_enforce_email_domain on auth.users;
create trigger trg_enforce_email_domain
  before insert on auth.users
  for each row execute function public.enforce_email_domain();

-- (c) Auto-provision a profile row on signup (status = pending_setup).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    'pending_setup'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists trg_handle_new_user on auth.users;
create trigger trg_handle_new_user
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- (d) Supabase "Before User Created" Auth Hook (recommended to also enable
--     in Dashboard → Authentication → Hooks, pointing to this function).
--     Returns the event unchanged to allow, or {"error": ...} to reject.
create or replace function public.before_user_created_hook(event jsonb)
returns jsonb language plpgsql as $$
declare
  v_email text := event #>> '{user,email}';
begin
  if v_email is null or not public.is_domain_allowed(v_email) then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 403,
        'message', 'Access is restricted to Magppie company accounts.'
      )
    );
  end if;
  return event;
end $$;

grant usage on schema public to supabase_auth_admin;
grant execute on function public.before_user_created_hook(jsonb) to supabase_auth_admin;
grant execute on function public.is_domain_allowed(text) to supabase_auth_admin;
grant all on table public.allowed_email_domains to supabase_auth_admin;

-- =====================================================================
-- 16. RBAC HELPERS (SECURITY DEFINER to avoid RLS recursion)
-- =====================================================================
-- NB: named app_role() (NOT current_role) — current_role is a reserved SQL word.
create or replace function public.app_role()
returns user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(
    (select role in ('super_admin','l_and_d_admin','management')
     from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.is_manager_of(p_user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = p_user and manager_id = auth.uid()
  );
$$;

-- =====================================================================
-- 17. ROW LEVEL SECURITY
-- Enable on every table; policies below show the intended patterns.
-- =====================================================================
alter table profiles                enable row level security;
alter table departments             enable row level security;
alter table positions               enable row level security;
alter table academies               enable row level security;
alter table courses                 enable row level security;
alter table lessons                 enable row level security;
alter table enrollments             enable row level security;
alter table lesson_progress         enable row level security;
alter table live_sessions           enable row level security;
alter table session_attendance      enable row level security;
alter table assignments             enable row level security;
alter table assignment_submissions  enable row level security;
alter table quizzes                 enable row level security;
alter table quiz_questions          enable row level security;
alter table quiz_attempts           enable row level security;
alter table certification_levels    enable row level security;
alter table certifications          enable row level security;
alter table skills                  enable row level security;
alter table user_skills             enable row level security;
alter table career_paths            enable row level security;
alter table promotion_readiness     enable row level security;
alter table learning_path_templates enable row level security;
alter table learning_path_items     enable row level security;
alter table onboarding_tasks        enable row level security;
alter table onboarding_progress     enable row level security;
alter table knowledge_items         enable row level security;
alter table notifications           enable row level security;
alter table audit_log               enable row level security;
alter table allowed_email_domains   enable row level security;

-- ---- profiles ----
create policy "profiles_self_read" on profiles
  for select using (id = auth.uid());
create policy "profiles_manager_read" on profiles
  for select using (manager_id = auth.uid());
create policy "profiles_admin_read" on profiles
  for select using (public.is_admin());
-- Self-update allowed, but role cannot be changed by the user.
-- Uses app_role() (SECURITY DEFINER) to read the existing role without
-- re-triggering RLS on profiles (avoids infinite recursion).
create policy "profiles_self_update" on profiles
  for update using (id = auth.uid())
  with check (id = auth.uid() and role = public.app_role());
create policy "profiles_admin_write" on profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- published catalog: readable by any active employee; writable by admin ----
-- Pattern repeated for departments, positions, academies, courses, lessons,
-- certification_levels, skills, career_paths, learning_path_*, onboarding_tasks.
create policy "catalog_read_dept" on departments for select using (auth.uid() is not null);
create policy "catalog_write_dept" on departments for all using (public.is_admin()) with check (public.is_admin());

create policy "catalog_read_pos" on positions for select using (auth.uid() is not null);
create policy "catalog_write_pos" on positions for all using (public.is_admin()) with check (public.is_admin());

create policy "academies_read" on academies
  for select using (status = 'published' or public.is_admin());
create policy "academies_write" on academies for all using (public.is_admin()) with check (public.is_admin());

create policy "courses_read" on courses
  for select using (status = 'published' or public.is_admin());
create policy "courses_write" on courses for all using (public.is_admin()) with check (public.is_admin());

create policy "lessons_read" on lessons
  for select using (
    public.is_admin() or exists (
      select 1 from courses c where c.id = lessons.course_id and c.status = 'published'));
create policy "lessons_write" on lessons for all using (public.is_admin()) with check (public.is_admin());

create policy "certlevels_read" on certification_levels for select using (auth.uid() is not null);
create policy "certlevels_write" on certification_levels for all using (public.is_admin()) with check (public.is_admin());

create policy "skills_read" on skills for select using (auth.uid() is not null);
create policy "skills_write" on skills for all using (public.is_admin()) with check (public.is_admin());

create policy "careerpaths_read" on career_paths for select using (auth.uid() is not null);
create policy "careerpaths_write" on career_paths for all using (public.is_admin()) with check (public.is_admin());

create policy "lpt_read" on learning_path_templates for select using (auth.uid() is not null);
create policy "lpt_write" on learning_path_templates for all using (public.is_admin()) with check (public.is_admin());
create policy "lpi_read" on learning_path_items for select using (auth.uid() is not null);
create policy "lpi_write" on learning_path_items for all using (public.is_admin()) with check (public.is_admin());

create policy "onbtasks_read" on onboarding_tasks for select using (auth.uid() is not null);
create policy "onbtasks_write" on onboarding_tasks for all using (public.is_admin()) with check (public.is_admin());

create policy "livesessions_read" on live_sessions for select using (auth.uid() is not null);
create policy "livesessions_write" on live_sessions for all using (public.is_admin()) with check (public.is_admin());

-- ---- per-user data: owner + their manager + admin ----
create policy "enroll_own" on enrollments
  for select using (user_id = auth.uid() or public.is_manager_of(user_id) or public.is_admin());
create policy "enroll_self_write" on enrollments
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "enroll_admin_write" on enrollments
  for all using (public.is_admin()) with check (public.is_admin());

create policy "lp_own" on lesson_progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "lp_view" on lesson_progress
  for select using (public.is_manager_of(user_id) or public.is_admin());

create policy "att_own" on session_attendance
  for select using (user_id = auth.uid() or public.is_manager_of(user_id) or public.is_admin());
create policy "att_admin" on session_attendance for all using (public.is_admin()) with check (public.is_admin());

create policy "assign_read" on assignments
  for select using (status = 'published' or public.is_admin());
create policy "assign_write" on assignments for all using (public.is_admin()) with check (public.is_admin());

create policy "sub_own" on assignment_submissions
  for select using (user_id = auth.uid() or public.is_manager_of(user_id) or public.is_admin());
create policy "sub_self_write" on assignment_submissions
  for insert with check (user_id = auth.uid());
create policy "sub_self_update" on assignment_submissions
  for update using (user_id = auth.uid() and status = 'needs_revision') with check (user_id = auth.uid());
create policy "sub_reviewer_update" on assignment_submissions
  for update using (public.is_manager_of(user_id) or public.is_admin());

create policy "quiz_read" on quizzes for select using (auth.uid() is not null);
create policy "quiz_write" on quizzes for all using (public.is_admin()) with check (public.is_admin());
-- Hide correct answers from non-admins at the app layer (select only needed cols).
create policy "qq_read" on quiz_questions for select using (auth.uid() is not null);
create policy "qq_write" on quiz_questions for all using (public.is_admin()) with check (public.is_admin());

create policy "qa_own" on quiz_attempts
  for select using (user_id = auth.uid() or public.is_manager_of(user_id) or public.is_admin());
create policy "qa_self_write" on quiz_attempts
  for insert with check (user_id = auth.uid());
create policy "qa_self_update" on quiz_attempts
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "cert_own" on certifications
  for select using (user_id = auth.uid() or public.is_manager_of(user_id) or public.is_admin());
create policy "cert_admin" on certifications for all using (public.is_admin()) with check (public.is_admin());

create policy "uskill_own" on user_skills
  for select using (user_id = auth.uid() or public.is_manager_of(user_id) or public.is_admin());
create policy "uskill_admin" on user_skills for all using (public.is_admin()) with check (public.is_admin());

create policy "prs_own" on promotion_readiness
  for select using (user_id = auth.uid() or public.is_manager_of(user_id) or public.is_admin());
create policy "prs_admin" on promotion_readiness for all using (public.is_admin()) with check (public.is_admin());

create policy "onbprog_own" on onboarding_progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "onbprog_view" on onboarding_progress
  for select using (public.is_manager_of(user_id) or public.is_admin());

-- ---- knowledge center: access-level aware ----
create policy "kc_read" on knowledge_items for select using (
  public.is_admin()
  or access = 'all_employees'
  or (access = 'managers' and public.app_role() in ('manager','trainer','l_and_d_admin','management','super_admin'))
  or (access = 'department' and department_id = (select department_id from profiles where id = auth.uid()))
);
create policy "kc_write" on knowledge_items for all using (public.is_admin()) with check (public.is_admin());

-- ---- notifications: own only ----
create policy "notif_own" on notifications
  for select using (user_id = auth.uid());
create policy "notif_own_update" on notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---- audit log: admins read; inserts via service role/functions ----
create policy "audit_admin_read" on audit_log for select using (public.is_admin());

-- ---- allowed_email_domains: super_admin only (managed in Admin UI) ----
create policy "domains_superadmin" on allowed_email_domains
  for all using (public.app_role() = 'super_admin')
  with check (public.app_role() = 'super_admin');
create policy "domains_read_admin" on allowed_email_domains
  for select using (public.is_admin());

-- =====================================================================
-- 18. SEED DATA (structural placeholders only — real content via CMS)
-- =====================================================================

-- Certification levels (from the framework)
insert into certification_levels (level,title,focus_area,assessment_method,passing_threshold,practical_demonstration,validity_months) values
 (1,'Foundation','Entry-level knowledge validation, basic competency, role readiness','Quiz-based knowledge check','80%','Supervised task completion in a controlled environment',24),
 (2,'Intermediate','Applied knowledge, problem-solving, independent execution','Theoretical exam with scenario questions','75%','10 consecutive error-free executions of standard workflows',24),
 (3,'Advanced','Complex scenario handling, cross-functional integration','Case-study-based timed assessment','70%','Resolution of 3 complex, documented non-routine scenarios',18),
 (4,'Specialist','Deep domain expertise, innovation, mentorship','Peer-reviewed project submission and panel defense','Panel evaluation','1 innovation project with measurable efficiency gain',18),
 (5,'Trainer','Training delivery, content creation, assessment design','Live training delivery evaluation','90%+ participant satisfaction','Design & deliver 1 complete training module with assessments',12);

-- Departments (13) grouped per framework
insert into departments (name,slug,grp,sort_order) values
 ('Business Development','business-development','client_facing',1),
 ('Sales','sales','client_facing',2),
 ('Post Design','post-design','client_facing',3),
 ('Installation','installation','client_facing',4),
 ('Factory & Production','factory-production','operations',5),
 ('Quality Control','quality-control','operations',6),
 ('Purchase','purchase','operations',7),
 ('Inventory & Warehouse','inventory-warehouse','operations',8),
 ('Accounts & Finance','accounts-finance','support_growth',9),
 ('HR & Admin','hr-admin','support_growth',10),
 ('Marketing','marketing','support_growth',11),
 ('Customer Experience','customer-experience','support_growth',12),
 ('Leadership','leadership','support_growth',13);

-- One academy per department (same name), as drafts to be published later.
insert into academies (department_id,name,slug,description,sort_order,status,is_seed)
select id, name || ' Academy', slug || '-academy',
       'Placeholder academy — add courses & content via Admin CMS.', sort_order, 'draft', true
from departments;

-- Example career paths (from the framework). Extend via seed_templates/career_paths.csv.
insert into career_paths (current_position,next_position,technical_skills,leadership_skills,required_certs,prs_threshold) values
 ('Business Development Executive','Senior BDE',
   '{Lead Qualification,CRM Advanced,Competitor Analysis,Revenue Forecasting}',
   '{Negotiation,Client Presentation,Stakeholder Management}','{BDA Level 3,CRM Level 2}',75),
 ('Junior Designer','Senior Designer',
   '{AutoCAD Advanced,BOQ Preparation,Material Knowledge,Design Standards}',
   '{Client Communication,Revision Management,Junior Mentoring}','{PDA Level 3,BOQ Level 2}',75),
 ('Installation Technician','Installation Supervisor',
   '{Installation SOPs Advanced,Quality Standards,Escalation Management}',
   '{Team Coordination,Site Safety Leadership,Client Handover}','{IA Level 3,Safety Level 2}',75),
 ('QC Inspector','QC Team Lead',
   '{In-Process QC Advanced,Defect Analysis,Corrective Action Planning}',
   '{Quality Reporting,Team Training,Process Improvement}','{QCA Level 3,Defect Analysis Level 2}',75),
 ('Purchase Officer','Purchase Manager',
   '{Vendor Evaluation Advanced,Material Planning,RFQ Optimization}',
   '{Cross-Department Negotiation,Budget Awareness,Supplier Relations}','{PA Level 3,Vendor Mgmt Level 2}',78),
 ('HR Executive','HR Manager',
   '{Performance Management Systems,Compliance Advanced,MIS Reporting}',
   '{Workforce Planning,Engagement Leadership,Coaching}','{HRA Level 3,Performance Mgmt Level 2}',78);

-- NOTE: Course-module placeholders per academy (BD: Product Knowledge, Lead
-- Qualification, ...; Sales: Sales Process, ...; etc.) should be inserted by
-- Claude Code from seed_templates/courses.csv so topics_covered &
-- learning_outcomes are preserved. Keep status='draft', is_seed=true.
