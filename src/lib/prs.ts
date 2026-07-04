/**
 * Promotion Readiness Score (PRS) — SINGLE SOURCE OF TRUTH.
 *
 * Canonical definition: magppie_ld_portal.docx §9.1.5 (mirrored in
 * Kimi_Agent/magppie_ld_portal_sec09.md). Reconciled 2026-07-02 per the gap
 * analysis (LD_Portal_Gap_Analysis.docx §2.1): previously schema.sql said
 * {skills, certs, tenure, manager_eval} with no weights, BUILD_PROMPT.md §13
 * matched it, and Career.tsx / MyLearning.tsx hardcoded "72%" with no formula.
 *
 * EVERYTHING that displays or computes PRS must import from this file.
 * The SQL mirror lives in supabase/migrations/0008_prs_canonical.sql
 * (public.compute_prs) — if you change weights here, change them there too.
 */

/** 100-point scale across four weighted components (docx §9.1.5). */
export const PRS_WEIGHTS = {
  /** Skill Completion — demonstrated proficiency vs. role requirements. */
  skills: 35,
  /** Certification Achievement — all mandatory certifications at required level. */
  certifications: 25,
  /** Performance Rating — from the last two review scores
   *  (formerly called `manager_eval` in schema.sql; renamed in 0008). */
  performance: 25,
  /** Tenure & Experience — time-in-role and cross-functional exposure. */
  tenure: 15,
} as const

export type PrsComponent = keyof typeof PRS_WEIGHTS

/** Default threshold for vertical promotion. Individual career paths may set
 *  a higher bar (e.g. 78 for Purchase Manager and HR Manager — see
 *  seed_templates/career_paths.csv `prs_threshold`). */
export const PRS_PROMOTION_THRESHOLD = 75

export const PRS_BANDS = [
  { min: 75, label: 'Ready for Promotion' },
  { min: 60, label: 'Development in Progress' },
  { min: 0, label: 'Early Stage' },
] as const

/** Per-component attainment, each 0–100 (% of that component achieved). */
export interface PrsBreakdown {
  skills: number
  certifications: number
  performance: number
  tenure: number
}

function clampPct(v: number): number {
  return Math.min(100, Math.max(0, v))
}

/** Weighted 0–100 PRS from per-component attainment percentages. */
export function computePrs(breakdown: PrsBreakdown): number {
  const total = (Object.keys(PRS_WEIGHTS) as PrsComponent[]).reduce(
    (sum, key) => sum + (clampPct(breakdown[key]) / 100) * PRS_WEIGHTS[key],
    0,
  )
  return Math.round(total)
}

/** Points earned per component (for breakdown displays: "26.3 / 35"). */
export function prsComponentPoints(
  breakdown: PrsBreakdown,
): Record<PrsComponent, { earned: number; max: number }> {
  const out = {} as Record<PrsComponent, { earned: number; max: number }>
  for (const key of Object.keys(PRS_WEIGHTS) as PrsComponent[]) {
    out[key] = {
      earned: Math.round((clampPct(breakdown[key]) / 100) * PRS_WEIGHTS[key] * 10) / 10,
      max: PRS_WEIGHTS[key],
    }
  }
  return out
}

export function prsBand(score: number): string {
  for (const band of PRS_BANDS) {
    if (score >= band.min) return band.label
  }
  return PRS_BANDS[PRS_BANDS.length - 1].label
}

export const PRS_COMPONENT_LABELS: Record<PrsComponent, string> = {
  skills: 'Skill Completion',
  certifications: 'Certification Achievement',
  performance: 'Performance Rating',
  tenure: 'Tenure & Experience',
}
