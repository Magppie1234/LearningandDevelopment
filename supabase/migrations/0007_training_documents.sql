-- ===========================================================================
-- 0007 — AI Bot Training Document knowledge base (RAG)
-- ---------------------------------------------------------------------------
-- Stores chunked, structured content from source training documents (e.g.
-- Magppie_AI_Bot_Master_Training_Document.pdf) for the L&D Portal AI
-- assistant's retrieval-augmented answers. Separate from `knowledge_items`
-- (0001) because the content shape is very different — Q&A pairs, verbatim
-- sales scripts, and pricing tables that must be reproduced closely, not
-- freeform SOP/policy documents.
--
-- pgvector is already enabled (0001_base_schema.sql: create extension "vector").
-- This migration adds the ivfflat similarity index that knowledge_items never
-- got, since we're populating this table's embedding column for real.
-- ===========================================================================

create type training_category as enum (
  'brand_foundation',
  'persona_tone',
  'pitch_flow',
  'objection_handling',
  'faq',
  'dm_templates',
  'handoff_rules',
  'pricing',
  'store_directory',
  'live_call_fixes',
  'cheat_sheet'
);

create table training_documents (
  id                uuid primary key default gen_random_uuid(),
  source_document   text not null,          -- e.g. 'Magppie_AI_Bot_Master_Training_Document.pdf'
  document_version  text not null,          -- e.g. '1.0' — bump on each re-ingest
  chunk_key         text not null,          -- stable id from the source structure, e.g. 'faq-q25'
  section_number    text not null,          -- e.g. '5.B Q25'
  section_title     text not null,
  category          training_category not null,
  content           text not null,
  is_verbatim_script boolean not null default false,
  embedding         vector(1536),           -- null until ingestion runs with a real embedding provider
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  -- Idempotent re-ingestion: same document + version + chunk never duplicates.
  unique (source_document, document_version, chunk_key)
);

create index on training_documents(source_document);
create index on training_documents(category);
-- ivfflat requires rows to exist to pick a sensible `lists` value; safe to
-- create empty, Postgres just won't have anything to bucket yet.
create index training_documents_embedding_idx on training_documents
  using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- ---------------------------------------------------------------------------
-- RLS — read: any authenticated employee (this is internal training content,
-- not customer data). Write: admins only, same pattern as knowledge_items.
-- ---------------------------------------------------------------------------
alter table training_documents enable row level security;

create policy "training_documents_read" on training_documents
  for select using (auth.uid() is not null);
create policy "training_documents_write" on training_documents
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Similarity search RPC — top-N chunks by cosine distance, optionally scoped
-- to a specific source_document. Called from the ingestion/retrieval script
-- once a real embedding provider is configured; see scripts/ingest-training-doc.ts.
-- ---------------------------------------------------------------------------
create or replace function match_training_documents(
  query_embedding vector(1536),
  match_source_document text default null,
  match_count int default 6
)
returns table (
  id uuid,
  chunk_key text,
  section_number text,
  section_title text,
  category training_category,
  content text,
  is_verbatim_script boolean,
  similarity float
)
language sql stable
as $$
  select
    td.id,
    td.chunk_key,
    td.section_number,
    td.section_title,
    td.category,
    td.content,
    td.is_verbatim_script,
    1 - (td.embedding <=> query_embedding) as similarity
  from training_documents td
  where td.embedding is not null
    and (match_source_document is null or td.source_document = match_source_document)
  order by td.embedding <=> query_embedding
  limit match_count
$$;
