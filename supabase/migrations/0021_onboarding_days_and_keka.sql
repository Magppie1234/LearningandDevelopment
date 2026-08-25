-- ===========================================================================
-- 0021 — Onboarding: Day 1-3 content, Keka reference videos, two assessments
-- ---------------------------------------------------------------------------
-- DB home for the "Welcome to Magppie" onboarding screen. Source of truth for
-- the content stays src/data/onboarding-days.ts; this mirrors it so HR can add
-- or replace a video without a deploy, which is the whole point of the Keka
-- section being a permanent reference rather than a day-one task.
--
-- WHAT IS DELIBERATELY EMPTY
--   * Both assessments insert with ZERO questions. The questions were never
--     supplied. `quizzes.questions_pending` says so explicitly so the UI can
--     render a placeholder instead of an empty quiz that looks broken.
--     Do NOT seed invented questions here.
--   * Day 1/2/3 videos have no source. The only videos that exist are the five
--     in the HR Drive folder, none of which is a welcome, vision or role-intro
--     recording. Their rows carry status 'pending'.
--
-- SLUG NOTE: public.academies uses 'business-development-academy' /
-- 'sales-academy', while the app code uses 'business-development' / 'sales'.
-- That mismatch predates this migration and is NOT resolved here — the Day 3
-- hand-off stores no academy FK precisely so this migration does not depend
-- on which of the two conventions wins.
-- ===========================================================================

-- ── Day content ─────────────────────────────────────────────────────────
create table if not exists onboarding_days (
  id           uuid primary key default gen_random_uuid(),
  day_key      text not null unique,          -- 'day-1' | 'day-2' | 'day-3'
  day_number   int  not null,
  title        text not null,
  blurb        text not null,
  -- Asset slots. `kind` distinguishes a Drive embed from a self-hosted file so
  -- the UI picks the right player; 'pending' renders the placeholder.
  video_kind   text not null default 'pending'
                 check (video_kind in ('pending','drive','self_hosted')),
  video_title  text,
  video_ref    text,                          -- drive file id, or a /assets path
  video_note   text,
  doc_kind     text not null default 'pending'
                 check (doc_kind in ('pending','drive','link','file')),
  doc_title    text,
  doc_ref      text,
  doc_note     text,
  created_at   timestamptz not null default now()
);
alter table onboarding_days enable row level security;
-- Onboarding content is the same for everyone; any signed-in user may read it.
create policy onboarding_days_read on onboarding_days
  for select to authenticated using (true);

insert into onboarding_days
  (day_key, day_number, title, blurb,
   video_kind, video_title, video_note,
   doc_kind, doc_title, doc_ref, doc_note)
values
  ('day-1', 1, 'Welcome & the essentials',
   'Meet the company, then the policies and conduct standards everyone works to.',
   'pending', 'Welcome to Magppie', 'Welcome video not supplied yet.',
   'drive', 'HR Policies & Code of Conduct', '1iz55NNTENP5Afo_H-X4quCNUmR4VH-4Y',
   'Policy briefing recording (840 MB). The written policy PDF has not been supplied.'),
  ('day-2', 2, 'Vision & culture',
   'Where Magppie is going, and the standards behind how we get there.',
   'pending', 'Our vision', 'Vision video not available yet.',
   'pending', 'Vision document', null, 'Vision document not supplied yet.'),
  ('day-3', 3, 'Your role & next steps',
   'Meet your team, pick up the handover, and start your role academy.',
   'pending', 'Your team and your role', 'Team/role intro video not supplied yet.',
   'pending', 'Role handover document', null, 'Role handover document not supplied yet.')
on conflict (day_key) do nothing;

-- ── Keka reference videos ───────────────────────────────────────────────
-- Ordered as they appear in the HR Drive folder. `drive_id is null` means the
-- video does not exist yet and the grid shows a placeholder tile.
create table if not exists onboarding_keka_videos (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  drive_id   text,
  sort_order int  not null,
  note       text,
  created_at timestamptz not null default now(),
  unique (title)
);
alter table onboarding_keka_videos enable row level security;
create policy onboarding_keka_videos_read on onboarding_keka_videos
  for select to authenticated using (true);

insert into onboarding_keka_videos (title, drive_id, sort_order, note) values
  ('Attendance — Keka App',      '1nIE5M6IC6Gt2UWik1EfMB_4gXSs_kRK0', 1, null),
  ('Attendance regularization',  '1jHQgnZSq4TVNwdkt3DoGiJiVeJnvJ35Z', 2, null),
  ('Leave application',          '1y2KmyrwOQAHy_JY_2e2RquVqlb8xwSIC', 3, null),
  ('Monday Weekly-Off',          '1eMCTFyiYsbPpznL0LAxUALJ2VnD6Be_G', 4, null),
  -- Expected by the brief, absent from the folder:
  ('Logging in',           null, 5, 'Not in the HR Drive folder.'),
  ('Logging out',          null, 6, 'Not in the HR Drive folder.'),
  ('Downloading payslips', null, 7, 'Not in the HR Drive folder.')
on conflict (title) do nothing;

-- ── Assessments ─────────────────────────────────────────────────────────
-- Reuse the existing quizzes/quiz_questions/quiz_attempts chain so scoring,
-- insights and the first-passing-attempt certificate rule apply unchanged.
alter table quizzes add column if not exists questions_pending boolean not null default false;
comment on column quizzes.questions_pending is
  'True while a quiz exists but its questions have not been authored. The UI shows a placeholder rather than an empty quiz.';

-- Column names verified against the deployed schema: passing_pct (int,
-- default 80) and is_assessment, not a pass_threshold float.
insert into quizzes (title, is_assessment, passing_pct, questions_pending)
select v.title, true, 80, true
from (values
  ('HR & Code of Conduct assessment'),
  ('Vision assessment')
) as v(title)
where not exists (select 1 from quizzes q where q.title = v.title);
