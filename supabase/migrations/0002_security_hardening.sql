-- =====================================================================
-- STAGE 0 SECURITY HARDENING (fixes H1-H5 from the planning review)
-- Applied on top of 0001_base_schema.sql.
-- =====================================================================

-- H2: active-status gate -------------------------------------------------
create or replace function public.is_active()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select status = 'active' from public.profiles where id = auth.uid()), false);
$$;

-- Redefine admin/manager helpers to also require the ACTOR be active.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(
    (select role in ('super_admin','l_and_d_admin','management') and status = 'active'
     from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.is_manager_of(p_user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.profiles tgt
    join public.profiles mgr on mgr.id = auth.uid()
    where tgt.id = p_user
      and tgt.manager_id = auth.uid()
      and mgr.status = 'active'
  );
$$;

-- H5: trainer RBAC helpers ----------------------------------------------
create or replace function public.is_trainer()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'trainer' and status = 'active'
                   from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.can_author()
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin() or public.is_trainer();
$$;

create or replace function public.can_review(p_user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin() or public.is_trainer() or public.is_manager_of(p_user);
$$;

-- H5: broaden content-authoring policies to trainers --------------------
drop policy "courses_write" on courses;
create policy "courses_write" on courses for all using (public.can_author()) with check (public.can_author());
drop policy "lessons_write" on lessons;
create policy "lessons_write" on lessons for all using (public.can_author()) with check (public.can_author());
drop policy "assign_write" on assignments;
create policy "assign_write" on assignments for all using (public.can_author()) with check (public.can_author());
drop policy "quiz_write" on quizzes;
create policy "quiz_write" on quizzes for all using (public.can_author()) with check (public.can_author());
drop policy "qq_write" on quiz_questions;
create policy "qq_write" on quiz_questions for all using (public.can_author()) with check (public.can_author());
drop policy "livesessions_write" on live_sessions;
create policy "livesessions_write" on live_sessions for all using (public.can_author()) with check (public.can_author());

-- attendance capture by trainers/admins
drop policy "att_admin" on session_attendance;
create policy "att_write" on session_attendance for all
  using (public.is_admin() or public.is_trainer())
  with check (public.is_admin() or public.is_trainer());

-- reviewers (manager-of-submitter / trainer / admin) grade submissions
drop policy "sub_reviewer_update" on assignment_submissions;
create policy "sub_reviewer_update" on assignment_submissions
  for update using (public.can_review(user_id)) with check (public.can_review(user_id));

-- H3: owner may only RESUBMIT (needs_revision -> submitted); cannot self-approve
drop policy "sub_self_update" on assignment_submissions;
create policy "sub_self_update" on assignment_submissions
  for update using (user_id = auth.uid() and status = 'needs_revision')
  with check (user_id = auth.uid() and status = 'submitted');

-- H4: enrollment progress/status must be server-derived, never client-set
drop policy "enroll_self_write" on enrollments;

-- H1: move correct answers out of client-readable quiz_questions --------
create table quiz_answer_keys (
  question_id uuid primary key references quiz_questions(id) on delete cascade,
  correct     jsonb not null default '[]'::jsonb
);
insert into quiz_answer_keys (question_id, correct)
  select id, correct from quiz_questions
  on conflict (question_id) do nothing;
alter table quiz_questions drop column correct;
alter table quiz_answer_keys enable row level security;
create policy "qak_author_all" on quiz_answer_keys
  for all using (public.can_author()) with check (public.can_author());
