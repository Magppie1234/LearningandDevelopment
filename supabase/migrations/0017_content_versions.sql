-- ===========================================================================
-- 0017 — Content authoring & versioning (§3.2, item 7)
-- ---------------------------------------------------------------------------
-- Version history for governed content (knowledge items + AI training docs).
-- Prevents the RAG assistant citing stale content: the ingestion pipeline
-- must only ingest rows where status='published', and retiring a version
-- flags dependent RAG chunks for re-ingestion.
-- ===========================================================================

create type content_status as enum ('draft', 'in_review', 'published', 'retired');

create table content_versions (
  id             uuid primary key default gen_random_uuid(),
  -- Either a knowledge item or a named external doc (e.g. the AI Bot
  -- Master Training Document) — exactly one of the two.
  knowledge_item_id uuid references knowledge_items(id) on delete cascade,
  external_doc      text,
  version           text not null,           -- e.g. '1.0', '1.1'
  status            content_status not null default 'draft',
  change_note       text,
  authored_by       uuid references profiles(id) on delete set null,
  reviewed_by       uuid references profiles(id) on delete set null,
  created_at        timestamptz not null default now(),
  published_at      timestamptz,
  retired_at        timestamptz,
  check (num_nonnulls(knowledge_item_id, external_doc) = 1),
  unique (knowledge_item_id, version),
  unique (external_doc, version)
);
create index on content_versions(status);

alter table content_versions enable row level security;
create policy "cv_read" on content_versions
  for select using (
    public.app_role() in ('trainer','l_and_d_admin','management','super_admin')
  );
create policy "cv_write" on content_versions
  for all using (public.is_admin()) with check (public.is_admin());

-- Only one published version per document at a time: publishing v(N)
-- retires v(N-1) automatically.
create or replace function public.retire_previous_versions()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'published' and (old is null or old.status <> 'published') then
    new.published_at := now();
    update content_versions
    set status = 'retired', retired_at = now()
    where id <> new.id
      and status = 'published'
      and (
        (new.knowledge_item_id is not null and knowledge_item_id = new.knowledge_item_id)
        or (new.external_doc is not null and external_doc = new.external_doc)
      );
  end if;
  return new;
end $$;

create trigger trg_retire_previous
  before insert or update on content_versions
  for each row execute function public.retire_previous_versions();
