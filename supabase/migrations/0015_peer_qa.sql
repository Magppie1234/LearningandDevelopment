-- ===========================================================================
-- 0015 — Peer-to-peer Q&A tied to modules (§3.2, item 4 — 360Learning pattern)
-- ---------------------------------------------------------------------------
-- Lightweight module-scoped Q&A, not a full forum: questions attach to a
-- course; answers can be marked accepted by the asker or a trainer.
-- Surfaces tribal knowledge from experienced staff.
-- ===========================================================================

create table module_questions (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid not null references courses(id) on delete cascade,
  author_id  uuid not null references profiles(id) on delete cascade,
  title      text not null,
  body       text,
  created_at timestamptz not null default now()
);
create index on module_questions(course_id);

create table module_answers (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid not null references module_questions(id) on delete cascade,
  author_id   uuid not null references profiles(id) on delete cascade,
  body        text not null,
  is_accepted boolean not null default false,
  created_at  timestamptz not null default now()
);
create index on module_answers(question_id);

alter table module_questions enable row level security;
alter table module_answers   enable row level security;

create policy "mq_read" on module_questions for select using (auth.uid() is not null);
create policy "mq_insert" on module_questions for insert with check (author_id = auth.uid());
create policy "mq_own_update" on module_questions for update using (author_id = auth.uid() or public.is_admin());
create policy "mq_admin_delete" on module_questions for delete using (public.is_admin());

create policy "ma_read" on module_answers for select using (auth.uid() is not null);
create policy "ma_insert" on module_answers for insert with check (author_id = auth.uid());
-- Accepting: question asker or trainer+ (checked app-side via this policy)
create policy "ma_update" on module_answers for update using (
  author_id = auth.uid()
  or exists (select 1 from module_questions q where q.id = question_id and q.author_id = auth.uid())
  or public.app_role() in ('trainer','l_and_d_admin','super_admin')
);
create policy "ma_admin_delete" on module_answers for delete using (public.is_admin());
