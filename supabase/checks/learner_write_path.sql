-- ===========================================================================
-- Learner write-path smoke test — safe to run against production.
-- ---------------------------------------------------------------------------
-- Everything happens inside a transaction that ALWAYS rolls back, so no rows
-- are kept. Run it after any change to the learning triggers, RLS policies, or
-- the module_progress / module_attempts schema.
--
-- WHY THIS EXISTS
--   Two defects (missing profile rows, and an uncast enum in on_module_attempt)
--   made it impossible for any learner to record an attempt. Neither surfaced
--   for months because module_attempts had zero rows — nothing ever exercised
--   the path, so nothing ever failed loudly. This is that exercise.
--
-- EXPECTED OUTPUT — 6 rows, every `detail` as noted:
--   backfill: users without a profile        0
--   attempt inserted under RLS               yes
--   attempt visible to owner                 3
--   module_progress status                   completed
--   module_progress attempts                 3
--   blocked writing for another user         42501
-- ===========================================================================
begin;
create temp table check_result(step text, detail text) on commit drop;

-- 1. Every auth user has a profile (the FK ~25 learner columns depend on).
insert into check_result
select 'backfill: users without a profile',
       count(*)::text
from auth.users u
where u.deleted_at is null
  and not exists (select 1 from public.profiles p where p.id = u.id);

-- 2. The write path, as a real authenticated learner with RLS enforced.
do $$
declare v_uid uuid; v_aid uuid; v_status text; v_cnt int; v_seen int;
begin
  select id into v_uid from profiles limit 1;
  select id into v_aid from academies limit 1;

  perform set_config('request.jwt.claims',
    json_build_object('sub', v_uid, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';

  -- fail -> pass -> fail. The last one must NOT undo 'completed': the
  -- certificate locks on the first passing attempt.
  insert into module_attempts (user_id, academy_id, module_id, attempt_number, score_pct, passed, question_breakdown)
  values (v_uid, v_aid, 'smoke', 1, 40, false, '[{"question_id":"q1","topic":"t","correct":false}]'::jsonb);
  insert into module_attempts (user_id, academy_id, module_id, attempt_number, score_pct, passed, question_breakdown)
  values (v_uid, v_aid, 'smoke', 2, 88, true,  '[{"question_id":"q1","topic":"t","correct":true}]'::jsonb);
  insert into module_attempts (user_id, academy_id, module_id, attempt_number, score_pct, passed, question_breakdown)
  values (v_uid, v_aid, 'smoke', 3, 30, false, '[]'::jsonb);

  select count(*) into v_seen from module_attempts where module_id = 'smoke';
  select status::text, attempt_count into v_status, v_cnt
    from module_progress where module_id = 'smoke';

  execute 'reset role';
  insert into check_result values
    ('attempt inserted under RLS', 'yes'),
    ('attempt visible to owner',   v_seen::text),
    ('module_progress status',     coalesce(v_status, '<null>')),
    ('module_progress attempts',   coalesce(v_cnt::text, '<null>'));
exception when others then
  execute 'reset role';
  insert into check_result values ('FAILED', sqlstate || ' ' || sqlerrm);
end $$;

-- 3. RLS actually enforces — without this the test above proves nothing.
do $$
declare v_me uuid; v_other uuid; v_aid uuid;
begin
  select id into v_me    from profiles order by id limit 1;
  select id into v_other from profiles order by id desc limit 1;
  select id into v_aid   from academies limit 1;

  perform set_config('request.jwt.claims',
    json_build_object('sub', v_me, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  begin
    insert into module_attempts (user_id, academy_id, module_id, attempt_number, score_pct, passed)
    values (v_other, v_aid, 'negative', 1, 100, true);
    execute 'reset role';
    insert into check_result values ('WROTE FOR ANOTHER USER', 'RLS NOT ENFORCING');
  exception when others then
    execute 'reset role';
    insert into check_result values ('blocked writing for another user', sqlstate);
  end;
end $$;

select * from check_result;
rollback;
