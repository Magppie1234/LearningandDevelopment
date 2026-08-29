-- ===========================================================================
-- 0022 — Backfill public.profiles for users who signed up before the trigger
-- ---------------------------------------------------------------------------
-- WHAT WAS BROKEN
--   auth.users held 16 accounts (all created 14–22 Jun 2026) while
--   public.profiles held zero. public.handle_new_user — the trigger that
--   mirrors a new signup into profiles — only landed with ld_0001_base_schema
--   on 10 Jul 2026, so every account predating it never got a profile row.
--
-- WHY IT MATTERS
--   module_attempts.user_id, module_progress.user_id, learning_sessions.user_id,
--   enrollments.user_id and ~25 other columns are FKs onto profiles.id. With no
--   profile row, the very first quiz submission from any of these 16 accounts
--   fails on a foreign-key violation — the learner cannot record an attempt,
--   earn a certificate, or appear in the dashboard at all.
--
-- WHAT THIS DOES
--   Exactly what the trigger would have done, and nothing more: same columns,
--   same coalesce order for the display name, same 'pending_setup' status so
--   these accounts still go through normal profile setup. It does NOT guess a
--   role, department, manager or joining date — those are HR's to set, and
--   inventing them would put wrong data in front of real employees.
--
--   Idempotent (`on conflict do nothing`) and safe to re-run. Soft-deleted
--   accounts are skipped.
-- ===========================================================================

insert into public.profiles (id, email, full_name, avatar_url, status)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
  u.raw_user_meta_data->>'avatar_url',
  'pending_setup'
from auth.users u
where u.deleted_at is null
  and u.email is not null
on conflict (id) do nothing;
