-- ===========================================================================
-- 0023 — Fix on_module_attempt(): cast status literals to the enum
-- ---------------------------------------------------------------------------
-- WHAT WAS BROKEN
--   module_progress.status is of type module_progress_status, but both CASE
--   expressions in on_module_attempt() yielded `text`: a CASE whose branches
--   are all unknown string literals resolves to text, and Postgres will not
--   implicitly coerce text into an enum. Every insert into module_attempts
--   therefore aborted inside the trigger with
--
--     42804: column "status" is of type module_progress_status
--            but expression is of type text
--
--   This is not an edge case — it is EVERY quiz submission, for every learner.
--   Nothing could be recorded, so no module_progress rollup, no insight
--   summary, and no certificate could ever be issued. It went unnoticed because
--   module_attempts had zero rows: the path had never successfully run once.
--
-- WHAT THIS CHANGES
--   The casts, and only the casts. The branch logic, the conflict target and
--   the recompute call are byte-for-byte the original. The enum's labels
--   (not_started, in_progress, completed) already matched the literals — the
--   values were never wrong, only their type.
--
--   Only the INSERT's CASE was actually broken (both branches unknown literals).
--   The UPDATE's CASE resolved fine via its enum `else` branch; its literals are
--   cast too, so the expression cannot silently degrade to text if that branch
--   is ever edited.
-- ===========================================================================

create or replace function public.on_module_attempt()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  insert into module_progress (user_id, academy_id, module_id, status, attempt_count, last_accessed_at, updated_at)
  values (new.user_id, new.academy_id, new.module_id,
          (case when new.passed then 'completed' else 'in_progress' end)::module_progress_status,
          1, now(), now())
  on conflict (user_id, academy_id, module_id)
  do update set attempt_count = module_progress.attempt_count + 1,
                -- This CASE already resolved correctly (its `else` branch is
                -- the enum column itself, so the literals coerce to match).
                -- Cast the literals anyway so the intent is explicit and the
                -- expression cannot silently degrade to text if the `else`
                -- branch is ever edited.
                status = case
                           when new.passed then 'completed'::module_progress_status
                           when module_progress.status = 'not_started' then 'in_progress'::module_progress_status
                           else module_progress.status
                         end,
                last_accessed_at = now(),
                updated_at = now();

  perform public.recompute_insight_summary(new.user_id, new.academy_id, new.module_id);
  return new;
end;
$function$;
