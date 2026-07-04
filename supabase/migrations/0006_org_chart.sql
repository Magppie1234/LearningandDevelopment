-- ===========================================================================
-- 0006 — Organization Flow (org chart) tables
-- ---------------------------------------------------------------------------
-- Interactive hierarchical org chart: Board of Directors -> MD/CEO -> C-Suite
-- -> Departments -> Positions -> Assignments. Positions form a self-referencing
-- tree; assignments FK into the existing `profiles` roster (see 0001_base_
-- schema.sql) and fall back to a free-text name for people who aren't Magppie
-- portal users (e.g. board members / directors), never a duplicate employee
-- table. Read is open to any authenticated user (same pattern as
-- departments/positions in 0001); writes are gated to admins via the existing
-- public.is_admin() helper.
-- ===========================================================================

create type org_tier as enum ('board', 'md_ceo', 'c_suite', 'department', 'position');

create table org_positions (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  parent_position_id uuid references org_positions(id) on delete cascade,
  department        text,
  tier              org_tier not null,
  sort_order        int not null default 0,
  color             text,                     -- accent key (c_suite tier only), e.g. 'purple'
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index on org_positions(parent_position_id);
create index on org_positions(tier);

create table org_assignments (
  id            uuid primary key default gen_random_uuid(),
  position_id   uuid not null references org_positions(id) on delete cascade,
  employee_id   uuid references profiles(id) on delete set null,
  custom_name   text,
  created_at    timestamptz not null default now(),
  constraint org_assignments_has_person
    check (employee_id is not null or custom_name is not null)
);
create index on org_assignments(position_id);
create index on org_assignments(employee_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table org_positions   enable row level security;
alter table org_assignments enable row level security;

create policy "org_positions_read" on org_positions
  for select using (auth.uid() is not null);
create policy "org_positions_write" on org_positions
  for all using (public.is_admin()) with check (public.is_admin());

create policy "org_assignments_read" on org_assignments
  for select using (auth.uid() is not null);
create policy "org_assignments_write" on org_assignments
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Seed — current known leadership hierarchy (2026-07-02: the MD/CEO tier was
-- removed per leadership direction; C-Suite reports directly to the Board.
-- The md_ceo enum value stays for backward compatibility but is unseeded.)
-- ---------------------------------------------------------------------------
do $$
declare
  v_board_founder_md uuid;
  v_board_dir_1       uuid;
  v_board_dir_2       uuid;
  v_cs_founders_office uuid;
  v_cs_coo            uuid;
  v_cs_cfo            uuid;
  v_cs_chro           uuid;
  v_cs_cto            uuid;
  v_cs_cmo            uuid;
begin
  insert into org_positions (title, parent_position_id, department, tier, sort_order)
    values ('Founder & Managing Director', null, null, 'board', 0)
    returning id into v_board_founder_md;
  insert into org_positions (title, parent_position_id, department, tier, sort_order)
    values ('Director', null, null, 'board', 1)
    returning id into v_board_dir_1;
  insert into org_positions (title, parent_position_id, department, tier, sort_order)
    values ('Director', null, null, 'board', 2)
    returning id into v_board_dir_2;

  insert into org_positions (title, parent_position_id, department, tier, sort_order, color)
    values ('Founder''s Office', null, 'Founder''s Office', 'c_suite', 0, 'purple')
    returning id into v_cs_founders_office;
  insert into org_positions (title, parent_position_id, department, tier, sort_order, color)
    values ('Chief Operating Officer', null, 'Operations', 'c_suite', 1, 'blue')
    returning id into v_cs_coo;
  insert into org_positions (title, parent_position_id, department, tier, sort_order, color)
    values ('Chief Financial Officer', null, 'Finance', 'c_suite', 2, 'green')
    returning id into v_cs_cfo;
  insert into org_positions (title, parent_position_id, department, tier, sort_order, color)
    values ('Chief Human Resources Officer', null, 'People & Culture', 'c_suite', 3, 'magenta')
    returning id into v_cs_chro;
  insert into org_positions (title, parent_position_id, department, tier, sort_order, color)
    values ('Chief Technology Officer', null, 'Technology', 'c_suite', 4, 'tan')
    returning id into v_cs_cto;
  insert into org_positions (title, parent_position_id, department, tier, sort_order, color)
    values ('Chief Marketing Officer', null, 'Marketing', 'c_suite', 5, 'orange')
    returning id into v_cs_cmo;

  -- Assignments — board + founder's office members are not (yet) portal
  -- users, so they're seeded as custom_name rather than employee_id.
  insert into org_assignments (position_id, custom_name) values
    (v_board_founder_md, 'Vinod Jain'),
    (v_board_dir_1,       'Megha Jain'),
    (v_board_dir_2,       'Vikas Jain'),
    (v_cs_founders_office, 'Nitya'),
    (v_cs_founders_office, 'Sadhvi');
end $$;
