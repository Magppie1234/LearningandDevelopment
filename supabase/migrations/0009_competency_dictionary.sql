-- ===========================================================================
-- 0009 — Competency dictionary (gap analysis §3.1, item 1)
-- ---------------------------------------------------------------------------
-- Extends the existing `skills` table (0001) into the master competency
-- dictionary rather than creating a parallel table. 91 competencies across
-- all 13 academies were extracted VERBATIM from the academy course-module
-- tables (Kimi_Agent/magppie_ld_portal_sec02–04.md); the app-side mirror is
-- ld-portal-next/src/data/competencies.ts and rows are seeded from it by
-- ld-portal-next/scripts/seed-competencies.ts (idempotent upsert by slug).
-- ===========================================================================

create type competency_type as enum ('technical', 'process', 'behavioral', 'leadership');

alter table skills
  add column slug            text unique,
  add column academy         text,
  add column department_slug text,
  add column competency_type competency_type,
  add column core_topics     text,
  add column outcome         text,
  add column is_seed         boolean not null default false;

comment on table skills is
  'Master competency dictionary. One row per academy course-module competency '
  '(91 seeded across 13 academies) plus any admin-added skills. '
  'Proficiency measured on the 1-5 scale in proficiency_levels; '
  'user_skills.current_level references that scale (0 = not assessed).';

-- The 5-point proficiency scale (defined here for the first time — no formal
-- scale existed in the source docs). Aligned in spirit with the 5-level
-- certification framework (Foundation → Trainer).
create table proficiency_levels (
  level       int primary key check (level between 1 and 5),
  name        text not null,
  description text not null
);

insert into proficiency_levels (level, name, description) values
 (1, 'Awareness',   'Knows the concepts and vocabulary; has completed foundational coursework; cannot yet perform unaided.'),
 (2, 'Assisted',    'Performs the competency under supervision or with reference materials; errors are caught by others.'),
 (3, 'Independent', 'Performs reliably and unaided to SOP standard in routine situations; meets the outcome bar defined for the competency.'),
 (4, 'Advanced',    'Handles non-routine and complex scenarios; optimizes the process; the go-to person within the team.'),
 (5, 'Master',      'Recognized expert; mentors others, designs training and assessments, and improves the standard itself.');

alter table proficiency_levels enable row level security;
create policy "proficiency_read" on proficiency_levels
  for select using (auth.uid() is not null);
create policy "proficiency_write" on proficiency_levels
  for all using (public.is_admin()) with check (public.is_admin());
