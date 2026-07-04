-- ===========================================================================
-- 0012 — Skill-gap engine (gap analysis §3.2, item 1)
-- ---------------------------------------------------------------------------
-- required proficiency per (position, competency); gap = required − current
-- (user_skills.current_level). TS mirror: ld-portal-next/src/lib/skill-gap.ts.
-- ===========================================================================

create table role_competency_requirements (
  id            uuid primary key default gen_random_uuid(),
  position_id   uuid not null references positions(id) on delete cascade,
  competency_id uuid not null references skills(id) on delete cascade,
  required_level int not null check (required_level between 1 and 5),
  unique (position_id, competency_id)
);
create index on role_competency_requirements(position_id);

alter table role_competency_requirements enable row level security;
create policy "rcr_read" on role_competency_requirements
  for select using (auth.uid() is not null);
create policy "rcr_write" on role_competency_requirements
  for all using (public.is_admin()) with check (public.is_admin());

-- Per-employee gaps against their own position's requirements. RLS of the
-- underlying tables still applies to the view (security_invoker).
create view employee_skill_gaps
with (security_invoker = true) as
select
  p.id as user_id,
  s.id as competency_id,
  s.slug,
  s.name,
  s.competency_type,
  rcr.required_level,
  coalesce(us.current_level, 0) as current_level,
  rcr.required_level - coalesce(us.current_level, 0) as gap
from profiles p
join role_competency_requirements rcr on rcr.position_id = p.position_id
join skills s on s.id = rcr.competency_id
left join user_skills us on us.user_id = p.id and us.skill_id = s.id
where rcr.required_level > coalesce(us.current_level, 0);

comment on view employee_skill_gaps is
  'gap = required − current per competency; only positive gaps. '
  'TS mirror: ld-portal-next/src/lib/skill-gap.ts computeGaps().';
