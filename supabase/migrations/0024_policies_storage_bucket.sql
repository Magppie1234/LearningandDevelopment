-- ===========================================================================
-- 0024 — `policies` storage bucket for official HR policy documents
-- ---------------------------------------------------------------------------
-- Public READ so a policy PDF can be embedded and downloaded in the portal
-- without an auth round-trip. There is deliberately NO public INSERT policy.
--
-- That differs from the older public buckets here (psm-photos, sm-photos),
-- which each carry an INSERT policy granted to `public` — meaning anyone who
-- knows the project URL can write into them. For files that are official HR
-- policy, world-writable is the wrong default: a planted file would be served
-- from the same trusted path as the real policy.
--
-- Uploads therefore go through the Supabase dashboard or a service-role key,
-- both of which bypass RLS. That is enough for a document set that changes a
-- few times a year, and it keeps the write path in named hands.
--
-- No allowed_mime_types filter: every other bucket in this project leaves it
-- null, and a too-narrow list rejects a legitimate upload with an error that
-- reads like a bug. The 25 MB ceiling is the guard instead.
-- ===========================================================================

insert into storage.buckets (id, name, public, file_size_limit)
values ('policies', 'policies', true, 26214400)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit;

drop policy if exists "policies public read" on storage.objects;
create policy "policies public read" on storage.objects
  for select to public using (bucket_id = 'policies');
