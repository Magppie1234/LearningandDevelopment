-- ===========================================================================
-- 0010 — Day 0–90 onboarding journey with gated checkpoints (§3.1, item 3)
-- ---------------------------------------------------------------------------
-- Extends the existing onboarding_tasks/onboarding_progress (0001) from a
-- flat checklist into a phased Day 0–90 journey. Phases end at checkpoint
-- tasks; tasks in a later phase stay locked until the previous phase's
-- checkpoint is done (enforced app-side + by the helper below).
-- Seed structure: seed_templates/onboarding_tasks.csv (extended columns).
-- ===========================================================================

alter table onboarding_tasks
  add column day_start     int not null default 0 check (day_start between 0 and 90),
  add column day_end       int not null default 90 check (day_end between 0 and 90),
  add column phase         int not null default 1 check (phase between 1 and 4),
  add column is_checkpoint boolean not null default false;

alter table onboarding_tasks
  add constraint onboarding_day_window check (day_start <= day_end);

comment on column onboarding_tasks.phase is
  'Journey phase: 1 = Day 0-7 (Arrival & Setup), 2 = Day 8-30 (Foundation), '
  '3 = Day 31-60 (Applied Practice), 4 = Day 61-90 (Full Ramp). '
  'Each phase ends with an is_checkpoint task; later phases are gated on it.';

-- A user may start phase N+1 only when every checkpoint task in phases <= N
-- is done. Returns the highest phase currently unlocked for the user in
-- their department ( + all-staff tasks where department_id is null).
create or replace function public.onboarding_unlocked_phase(p_user uuid)
returns int
language sql stable
as $$
  select coalesce(min(t.phase), 5)
  from onboarding_tasks t
  left join onboarding_progress pr
    on pr.task_id = t.id and pr.user_id = p_user and pr.done
  where t.is_checkpoint
    and pr.id is null
    and (t.department_id is null
         or t.department_id = (select department_id from profiles where id = p_user))
$$;

comment on function public.onboarding_unlocked_phase(uuid) is
  'Highest onboarding phase the user may work in: the earliest phase with an '
  'incomplete checkpoint. Returns 5 (all unlocked) when every checkpoint is done.';
