-- ===========================================================================
-- 0014 — Microlearning nudge log (§3.2, item 3)
-- ---------------------------------------------------------------------------
-- One row per (user, day): which competency micro-topic was nudged and
-- whether it was completed. Generation logic lives app-side
-- (ld-portal-next/src/lib/nudges.ts) on top of the skill-gap engine.
-- ===========================================================================

create table nudge_log (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  nudge_date    date not null,
  competency_id uuid not null references skills(id) on delete cascade,
  topic         text not null,
  completed_at  timestamptz,
  unique (user_id, nudge_date)
);
create index on nudge_log(user_id, nudge_date);

alter table nudge_log enable row level security;
create policy "nudge_own" on nudge_log
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "nudge_manager_read" on nudge_log
  for select using (public.is_manager_of(user_id) or public.is_admin());
