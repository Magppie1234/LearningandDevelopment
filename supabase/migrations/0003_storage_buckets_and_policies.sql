-- Four PRIVATE buckets. Object-key convention: first path segment = owner uid
-- for per-user buckets (avatars, assignments); = entity id for content buckets.
insert into storage.buckets (id, name, public) values
  ('course-content','course-content', false),
  ('assignments','assignments', false),
  ('knowledge','knowledge', false),
  ('avatars','avatars', false)
on conflict (id) do nothing;

-- AVATARS: owner manages own folder; admins may read.
create policy "avatars_owner_rw" on storage.objects
  for all to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_admin_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'avatars' and public.is_admin());

-- ASSIGNMENTS: owner manages own folder; admins read now, reviewer read added in Stage 4.
create policy "assignments_owner_rw" on storage.objects
  for all to authenticated
  using (bucket_id = 'assignments' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'assignments' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "assignments_admin_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'assignments' and public.is_admin());

-- COURSE-CONTENT: authors/admins write; authenticated read (signed URLs server-side).
create policy "course_content_read" on storage.objects
  for select to authenticated using (bucket_id = 'course-content');
create policy "course_content_author_write" on storage.objects
  for all to authenticated
  using (bucket_id = 'course-content' and public.can_author())
  with check (bucket_id = 'course-content' and public.can_author());

-- KNOWLEDGE: admins write; authenticated read for now (refined to kc access in Stage 7).
create policy "knowledge_read" on storage.objects
  for select to authenticated using (bucket_id = 'knowledge');
create policy "knowledge_admin_write" on storage.objects
  for all to authenticated
  using (bucket_id = 'knowledge' and public.is_admin())
  with check (bucket_id = 'knowledge' and public.is_admin());
