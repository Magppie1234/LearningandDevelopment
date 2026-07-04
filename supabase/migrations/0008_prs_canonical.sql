-- ===========================================================================
-- 0008 — PRS reconciliation: canonical weights + component naming
-- ---------------------------------------------------------------------------
-- Source of truth: magppie_ld_portal.docx §9.1.5. PRS is a 100-point score:
--   Skill Completion 35 · Certification Achievement 25 · Performance Rating 25
--   · Tenure & Experience 15. Promotion threshold >= 75 (career paths may set
--   higher, e.g. 78); 60–74 "Development in Progress"; < 60 "Early Stage".
--
-- Reconciliation (gap analysis §2.1): 0001_base_schema.sql documented the
-- promotion_readiness.breakdown keys as {skills, certs, tenure, manager_eval}
-- with no weights. Canonical keys are now
--   {skills, certifications, performance, tenure}
-- ("manager_eval" -> "performance": the docx defines the 25-point component
-- as the last two performance-review scores). The TypeScript mirror is
-- src/lib/prs.ts in ld-portal-next — keep both in sync.
-- ===========================================================================

comment on column promotion_readiness.breakdown is
  'Per-component attainment 0-100: {skills, certifications, performance, tenure}. '
  'Weights: skills 35, certifications 25, performance 25, tenure 15 '
  '(magppie_ld_portal.docx §9.1.5). Score column = public.compute_prs(breakdown). '
  'Mirror: ld-portal-next/src/lib/prs.ts.';

-- Migrate any existing rows from the legacy key names.
update promotion_readiness
set breakdown = breakdown
  - 'certs' - 'manager_eval'
  || jsonb_build_object(
       'certifications', coalesce(breakdown->'certs', '0'::jsonb),
       'performance',    coalesce(breakdown->'manager_eval', '0'::jsonb)
     )
where breakdown ? 'certs' or breakdown ? 'manager_eval';

-- Canonical scoring function — the DB-side mirror of computePrs().
create or replace function public.compute_prs(p_breakdown jsonb)
returns int
language sql immutable
as $$
  select round(
      least(100, greatest(0, coalesce((p_breakdown->>'skills')::numeric, 0)))         / 100.0 * 35
    + least(100, greatest(0, coalesce((p_breakdown->>'certifications')::numeric, 0))) / 100.0 * 25
    + least(100, greatest(0, coalesce((p_breakdown->>'performance')::numeric, 0)))    / 100.0 * 25
    + least(100, greatest(0, coalesce((p_breakdown->>'tenure')::numeric, 0)))         / 100.0 * 15
  )::int
$$;

comment on function public.compute_prs(jsonb) is
  'Canonical PRS formula (35/25/25/15). Keep in sync with ld-portal-next/src/lib/prs.ts.';

-- Keep score consistent with breakdown automatically.
create or replace function public.sync_prs_score()
returns trigger
language plpgsql
as $$
begin
  new.score := public.compute_prs(new.breakdown);
  new.computed_at := now();
  return new;
end $$;

create trigger trg_sync_prs_score
  before insert or update of breakdown on promotion_readiness
  for each row execute function public.sync_prs_score();
