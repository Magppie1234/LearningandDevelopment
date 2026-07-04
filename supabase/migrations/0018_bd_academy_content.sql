-- ===========================================================================
-- 0018 — Business Development Executive: module content + quiz (BD-only pass)
-- ---------------------------------------------------------------------------
-- Adds the DB-side home for the 10 reviewed BD modules and their 30-question
-- quiz. Source of truth for the actual content/questions is
-- ld-portal-next/src/data/bd-academy.ts (from BD_Academy_Modules_and_Quiz_
-- Bank.md); ld-portal-next/scripts/seed-bd-academy.ts upserts from it.
--
-- Extends (does not duplicate) the assessment_items bank from 0011:
--   * The 5 BD competencies (Product Knowledge, Objection Handling, Pricing
--     Knowledge, Customer Communication, Trust & Credibility) are NOT skills
--     rows, so competency is carried as a text tag; competency_id/cert_level
--     are relaxed to nullable for tag-based batches like this one.
--   * These 30 questions are human-reviewed & approved: they insert as
--     status='published', source='human' and DO NOT pass through the AI
--     review queue (the 0011 trg_enforce_item_review trigger only gates
--     source='ai', so published human rows are unaffected).
-- Scope: Business Development only. No other academy is touched.
-- ===========================================================================

-- ── Module content ──────────────────────────────────────────────────────
create table academy_modules (
  id             uuid primary key default gen_random_uuid(),
  academy_slug   text not null,                 -- 'business-development'
  module_key     text not null,                 -- 'bd-m1' … 'bd-m10'
  number         int not null,
  title          text not null,
  competency_tag text not null,
  summary        text,
  -- Structured content blocks (paragraph/heading/list/callout/table), mirror
  -- of ContentBlock[] in bd-academy.ts. Pricing matrix (Module 8) is stored
  -- as a real table block here, not prose.
  body           jsonb not null default '[]'::jsonb,
  status         content_status not null default 'draft',  -- reuse 0017 enum
  is_seed        boolean not null default false,
  created_at     timestamptz not null default now(),
  unique (academy_slug, module_key)
);
create index on academy_modules(academy_slug);

alter table academy_modules enable row level security;
create policy "academy_modules_read" on academy_modules
  for select using (auth.uid() is not null);
create policy "academy_modules_write" on academy_modules
  for all using (public.is_admin()) with check (public.is_admin());

-- ── Extend the assessment item bank for tag-based batches ────────────────
alter table assessment_items
  add column module_ref     text,   -- academy_modules.module_key, e.g. 'bd-m1'
  add column competency_tag text;   -- e.g. 'Objection Handling'

-- Tag-based questions (like this BD batch) don't map to a skills competency
-- or a certification_level, so relax those NOT NULLs.
alter table assessment_items alter column competency_id drop not null;
alter table assessment_items alter column cert_level    drop not null;

create index on assessment_items(module_ref);

comment on column assessment_items.competency_tag is
  'Free-text competency for tag-based batches (e.g. BD academy: Product '
  'Knowledge / Objection Handling / Pricing Knowledge / Customer '
  'Communication / Trust & Credibility). Prefer competency_id where a skills '
  'row exists.';

-- ── Assignment: which module set the BD academy carries ──────────────────
-- Links the module set to the academy; department-level assignment (BD dept
-- employees) is handled by the existing departments→academy mapping. When the
-- real roster lands, per-employee enrollment rows attach here.
alter table academy_modules
  add column pass_threshold numeric not null default 0.80;  -- 80% per module
