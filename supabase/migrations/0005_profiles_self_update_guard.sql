-- Stage 1: prevent a suspended user from self-updating (incl. self-reactivation),
-- while still allowing pending_setup -> active during onboarding. Role stays locked.
drop policy "profiles_self_update" on profiles;
create policy "profiles_self_update" on profiles
  for update using (id = auth.uid() and status <> 'suspended')
  with check (id = auth.uid() and role = public.app_role());
