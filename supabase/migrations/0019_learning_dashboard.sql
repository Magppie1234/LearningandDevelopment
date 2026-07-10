-- =====================================================================
-- 0019_learning_dashboard.sql
-- Personal Learning Dashboard — session time-tracking, per-module progress
-- rollups, computed insight summaries (weak/strong topics + trend), and
-- manager academy-scoping.
--
-- Roles: this migration does NOT create a new roles table. The base schema
-- already ships `user_role` (super_admin, management, l_and_d_admin, manager,
-- trainer, employee) plus app_role()/is_admin()/is_manager_of(). We map:
--   learner  = employee (and anyone viewing their own rows)
--   manager  = manager / management  (scoped by profiles.manager_id AND/OR
--              the new manager_academy_scope table)
--   admin    = super_admin / l_and_d_admin / management  (is_admin())
--
-- Scoping is enforced at the RLS layer: a learner can only read/write their
-- own rows; managers/admins get SELECT-only on the rows they oversee, which is
-- what makes the "viewing" flows physically read-only (no session writes, no
-- reset) against another learner's data — the DB rejects the write regardless
-- of what any UI does.
--
-- module_id is an opaque per-academy key (e.g. 'bd-m1'), kept as text because
-- module identity differs by academy (BD content lives in the ld.* schema with
-- string keys, not a shared uuid `modules` table). academy_id is a real FK.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. ENUMS
-- ---------------------------------------------------------------------
create type learning_activity_type as enum ('study','video','quiz');
create type module_progress_status as enum ('not_started','in_progress','completed');
create type learning_trend         as enum ('improving','plateaued','declining');

-- ---------------------------------------------------------------------
-- 2. MANAGER ACADEMY SCOPE  (which academies a manager oversees)
-- Admins ignore this table entirely (is_admin() = all academies).
-- ---------------------------------------------------------------------
create table manager_academy_scope (
  user_id     uuid not null references profiles(id) on delete cascade,
  academy_id  uuid not null references academies(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, academy_id)
);
create index on manager_academy_scope(academy_id);

-- ---------------------------------------------------------------------
-- 3. LEARNING SESSIONS  (raw time-tracking; rolled up into module_progress)
-- ---------------------------------------------------------------------
create table learning_sessions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references profiles(id) on delete cascade,
  academy_id             uuid not null references academies(id) on delete cascade,
  module_id              text not null,
  activity_type          learning_activity_type not null,
  started_at             timestamptz not null default now(),
  ended_at               timestamptz,
  -- Accumulated active seconds (idle time is excluded by the client engine
  -- before it is written here via heartbeats).
  duration_seconds       int not null default 0 check (duration_seconds >= 0),
  video_position_seconds int,          -- last playback position (resume), nullable
  scroll_position        int,          -- last reading scroll % (resume), nullable
  idle_flag              boolean not null default false,
  archived_at            timestamptz,  -- set on module reset; excluded from rollups
  created_at             timestamptz not null default now()
);
create index on learning_sessions(user_id, academy_id);
create index on learning_sessions(user_id, module_id);
create index on learning_sessions(user_id, academy_id, module_id) where archived_at is null;

-- ---------------------------------------------------------------------
-- 4. MODULE ATTEMPTS  (every quiz attempt is its own row — never overwritten)
-- Complements the existing quiz-centric quiz_attempts table with the
-- module/topic-tag breakdown the insight engine needs.
-- ---------------------------------------------------------------------
create table module_attempts (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references profiles(id) on delete cascade,
  academy_id         uuid not null references academies(id) on delete cascade,
  module_id          text not null,
  attempt_number     int not null check (attempt_number >= 1),
  score_pct          int check (score_pct between 0 and 100),
  passed             boolean,
  time_taken_seconds int,
  -- [{ "question_id": "...", "topic_tag": "...", "correct": true }]
  question_breakdown jsonb not null default '[]'::jsonb,
  attempted_at       timestamptz not null default now(),
  archived_at        timestamptz,   -- set on module reset; excluded from insights
  created_at         timestamptz not null default now()
);
create index on module_attempts(user_id, academy_id, module_id) where archived_at is null;

-- ---------------------------------------------------------------------
-- 5. MODULE PROGRESS  (one row per user+academy+module; rolled-up state)
-- ---------------------------------------------------------------------
create table module_progress (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references profiles(id) on delete cascade,
  academy_id               uuid not null references academies(id) on delete cascade,
  module_id                text not null,
  status                   module_progress_status not null default 'not_started',
  last_position            int,          -- video secs OR scroll %, per last_position_kind
  last_position_kind       text check (last_position_kind in ('video','scroll')),
  total_time_spent_seconds int not null default 0 check (total_time_spent_seconds >= 0),
  attempt_count            int not null default 0,
  last_accessed_at         timestamptz,
  updated_at               timestamptz not null default now(),
  unique (user_id, academy_id, module_id)
);
create index on module_progress(user_id, academy_id);

-- ---------------------------------------------------------------------
-- 6. INSIGHT SUMMARY  (computed/cached; recalculated after each attempt)
-- ---------------------------------------------------------------------
create table insight_summary (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  academy_id    uuid not null references academies(id) on delete cascade,
  module_id     text not null,
  weak_topics   jsonb not null default '[]'::jsonb,   -- topic_tags wrong ≥50% of attempts
  strong_topics jsonb not null default '[]'::jsonb,   -- topic_tags 100% correct across ≥2 attempts
  trend         learning_trend,                        -- last-3-attempt score direction
  updated_at    timestamptz not null default now(),
  unique (user_id, academy_id, module_id)
);

-- =====================================================================
-- 7. RBAC HELPER — manager academy scope (SECURITY DEFINER, no RLS recursion)
-- =====================================================================
create or replace function public.manages_academy(p_academy uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.manager_academy_scope
    where user_id = auth.uid() and academy_id = p_academy
  );
$$;

-- True when the current user may VIEW p_user's learning data for p_academy:
-- their own data, a direct report (profiles.manager_id), an academy in their
-- manager scope, or an admin (all).
create or replace function public.can_view_learning(p_user uuid, p_academy uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select
    p_user = auth.uid()
    or public.is_admin()
    or public.is_manager_of(p_user)
    or public.manages_academy(p_academy);
$$;

-- =====================================================================
-- 8. INSIGHT ENGINE — recompute one module's summary from its attempts
-- =====================================================================
create or replace function public.recompute_insight_summary(
  p_user uuid, p_academy uuid, p_module text
) returns void language plpgsql security definer set search_path = public as $$
declare
  v_weak   jsonb := '[]'::jsonb;
  v_strong jsonb := '[]'::jsonb;
  v_trend  learning_trend;
  v_scores int[];
  v_first  int;
  v_last   int;
begin
  -- Per (attempt, topic) correctness: a topic is "correct in an attempt" only
  -- if every question carrying that tag was correct in that attempt.
  with attempt_rows as (
    select id, question_breakdown
    from module_attempts
    where user_id = p_user and academy_id = p_academy and module_id = p_module
      and archived_at is null
  ),
  topic_per_attempt as (
    select ar.id as attempt_id,
           qb->>'topic_tag' as topic,
           bool_and(coalesce((qb->>'correct')::boolean, false)) as topic_correct
    from attempt_rows ar
    cross join lateral jsonb_array_elements(ar.question_breakdown) as qb
    where (qb ? 'topic_tag') and nullif(qb->>'topic_tag','') is not null
    group by ar.id, qb->>'topic_tag'
  ),
  topic_stats as (
    select topic,
           count(*)                                 as appeared,
           count(*) filter (where not topic_correct) as wrong
    from topic_per_attempt
    group by topic
  )
  select
    coalesce(jsonb_agg(to_jsonb(topic) order by topic) filter (where wrong * 2 >= appeared), '[]'::jsonb),
    coalesce(jsonb_agg(to_jsonb(topic) order by topic) filter (where wrong = 0 and appeared >= 2), '[]'::jsonb)
  into v_weak, v_strong
  from topic_stats;

  -- Trend from the last three scored attempts (oldest→newest within the window).
  select array_agg(score_pct order by attempted_at)
  into v_scores
  from (
    select score_pct, attempted_at
    from module_attempts
    where user_id = p_user and academy_id = p_academy and module_id = p_module
      and archived_at is null and score_pct is not null
    order by attempted_at desc
    limit 3
  ) t;

  if v_scores is null or array_length(v_scores, 1) < 2 then
    v_trend := null;
  else
    v_first := v_scores[1];
    v_last  := v_scores[array_length(v_scores, 1)];
    if v_last - v_first > 5 then
      v_trend := 'improving';
    elsif v_last - v_first < -5 then
      v_trend := 'declining';
    else
      v_trend := 'plateaued';
    end if;
  end if;

  insert into insight_summary (user_id, academy_id, module_id, weak_topics, strong_topics, trend, updated_at)
  values (p_user, p_academy, p_module, v_weak, v_strong, v_trend, now())
  on conflict (user_id, academy_id, module_id)
  do update set weak_topics = excluded.weak_topics,
                strong_topics = excluded.strong_topics,
                trend = excluded.trend,
                updated_at = now();
end;
$$;

-- After every attempt: bump progress.attempt_count, mark accessed, recompute insight.
create or replace function public.on_module_attempt() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into module_progress (user_id, academy_id, module_id, status, attempt_count, last_accessed_at, updated_at)
  values (new.user_id, new.academy_id, new.module_id,
          case when new.passed then 'completed' else 'in_progress' end,
          1, now(), now())
  on conflict (user_id, academy_id, module_id)
  do update set attempt_count = module_progress.attempt_count + 1,
                status = case
                           when new.passed then 'completed'
                           when module_progress.status = 'not_started' then 'in_progress'
                           else module_progress.status
                         end,
                last_accessed_at = now(),
                updated_at = now();

  perform public.recompute_insight_summary(new.user_id, new.academy_id, new.module_id);
  return new;
end;
$$;

create trigger trg_on_module_attempt
after insert on module_attempts
for each row execute function public.on_module_attempt();

-- On session close (ended_at set, non-idle): roll active duration into
-- module_progress and capture the resume position.
create or replace function public.on_session_close() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.ended_at is not null and (old.ended_at is null or old.duration_seconds is distinct from new.duration_seconds) then
    insert into module_progress (
      user_id, academy_id, module_id, status,
      last_position, last_position_kind,
      total_time_spent_seconds, last_accessed_at, updated_at
    ) values (
      new.user_id, new.academy_id, new.module_id, 'in_progress',
      case when new.activity_type = 'video' then new.video_position_seconds else new.scroll_position end,
      case when new.activity_type = 'video' then 'video' else 'scroll' end,
      new.duration_seconds, now(), now()
    )
    on conflict (user_id, academy_id, module_id)
    do update set
      total_time_spent_seconds = module_progress.total_time_spent_seconds + new.duration_seconds,
      last_position = coalesce(
        case when new.activity_type = 'video' then new.video_position_seconds else new.scroll_position end,
        module_progress.last_position),
      last_position_kind = case when new.activity_type = 'video' then 'video' else 'scroll' end,
      status = case when module_progress.status = 'not_started' then 'in_progress' else module_progress.status end,
      last_accessed_at = now(),
      updated_at = now();
  end if;
  return new;
end;
$$;

create trigger trg_on_session_close
after update of ended_at, duration_seconds on learning_sessions
for each row execute function public.on_session_close();

-- =====================================================================
-- 9. RESET — archive attempts/sessions (never hard-delete) and zero progress
-- =====================================================================
create or replace function public.reset_module_progress(p_academy uuid, p_module text)
returns void language plpgsql security definer set search_path = public as $$
begin
  -- Only the owner may reset their own module (defence in depth beyond RLS).
  update module_attempts
    set archived_at = now()
    where user_id = auth.uid() and academy_id = p_academy and module_id = p_module and archived_at is null;
  update learning_sessions
    set archived_at = now()
    where user_id = auth.uid() and academy_id = p_academy and module_id = p_module and archived_at is null;
  update module_progress
    set status = 'not_started', last_position = null, last_position_kind = null,
        total_time_spent_seconds = 0, attempt_count = 0, last_accessed_at = null, updated_at = now()
    where user_id = auth.uid() and academy_id = p_academy and module_id = p_module;
  delete from insight_summary
    where user_id = auth.uid() and academy_id = p_academy and module_id = p_module;
end;
$$;

-- =====================================================================
-- 10. ROW LEVEL SECURITY
-- Learners: full read/write on their own rows.
-- Managers/admins: SELECT-only on rows they oversee (read-only viewing).
-- =====================================================================
alter table manager_academy_scope enable row level security;
alter table learning_sessions     enable row level security;
alter table module_attempts       enable row level security;
alter table module_progress       enable row level security;
alter table insight_summary       enable row level security;

-- manager_academy_scope: a manager sees their own scope; admins manage all.
create policy "mas_self_read"  on manager_academy_scope
  for select using (user_id = auth.uid() or public.is_admin());
create policy "mas_admin_write" on manager_academy_scope
  for all using (public.is_admin()) with check (public.is_admin());

-- learning_sessions
create policy "ls_self_write" on learning_sessions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "ls_oversight_read" on learning_sessions
  for select using (public.can_view_learning(user_id, academy_id));

-- module_attempts
create policy "ma_self_write" on module_attempts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "ma_oversight_read" on module_attempts
  for select using (public.can_view_learning(user_id, academy_id));

-- module_progress
create policy "mp_self_write" on module_progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "mp_oversight_read" on module_progress
  for select using (public.can_view_learning(user_id, academy_id));

-- insight_summary
create policy "is_self_write" on insight_summary
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "is_oversight_read" on insight_summary
  for select using (public.can_view_learning(user_id, academy_id));

-- =====================================================================
-- 11. GRANTS
-- =====================================================================
grant select, insert, update, delete on
  manager_academy_scope, learning_sessions, module_attempts, module_progress, insight_summary
  to authenticated;
grant execute on function
  public.manages_academy(uuid),
  public.can_view_learning(uuid, uuid),
  public.recompute_insight_summary(uuid, uuid, text),
  public.reset_module_progress(uuid, text)
  to authenticated;
