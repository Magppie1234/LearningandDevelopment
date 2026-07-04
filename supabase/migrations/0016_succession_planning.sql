-- ===========================================================================
-- 0016 — Succession planning layer (§3.2, item 5)
-- ---------------------------------------------------------------------------
-- Rolls individual PRS up to "who can backfill this role". Critical roles
-- are flagged (docx sec09 governance: Critical Role ID, annual); candidates
-- rank by PRS with a readiness classification. Management-only visibility.
-- ===========================================================================

create type succession_readiness as enum ('ready_now', 'ready_soon', 'develop');

create table critical_roles (
  id           uuid primary key default gen_random_uuid(),
  position_id  uuid not null references positions(id) on delete cascade,
  incumbent_id uuid references profiles(id) on delete set null,
  risk_note    text,
  flagged_at   timestamptz not null default now(),
  unique (position_id)
);

create table succession_candidates (
  id               uuid primary key default gen_random_uuid(),
  critical_role_id uuid not null references critical_roles(id) on delete cascade,
  candidate_id     uuid not null references profiles(id) on delete cascade,
  readiness        succession_readiness not null default 'develop',
  notes            text,
  added_at         timestamptz not null default now(),
  unique (critical_role_id, candidate_id)
);
create index on succession_candidates(critical_role_id);

alter table critical_roles        enable row level security;
alter table succession_candidates enable row level security;

-- Succession data is sensitive: management tier only (not regular managers).
create policy "cr_mgmt_read" on critical_roles
  for select using (public.app_role() in ('management','l_and_d_admin','super_admin'));
create policy "cr_admin_write" on critical_roles
  for all using (public.is_admin()) with check (public.is_admin());
create policy "sc_mgmt_read" on succession_candidates
  for select using (public.app_role() in ('management','l_and_d_admin','super_admin'));
create policy "sc_admin_write" on succession_candidates
  for all using (public.is_admin()) with check (public.is_admin());

-- Classification rule (docx PRS bands): >=75 ready_now, 60-74 ready_soon,
-- else develop. Kept as a function so the app and reports agree.
create or replace function public.succession_readiness_for(p_score int)
returns succession_readiness
language sql immutable
as $$
  select case
    when p_score >= 75 then 'ready_now'::succession_readiness
    when p_score >= 60 then 'ready_soon'::succession_readiness
    else 'develop'::succession_readiness
  end
$$;
