/**
 * Competency policy — criticality and practical-validation requirements
 * (L&D OS spec §7 and §12).
 *
 * Two fields the Competency Dictionary does not yet carry are resolved here,
 * with their provenance kept visible rather than flattened into a boolean:
 *
 *  1. CRITICALITY. §7 requires every competency to record critical /
 *     non-critical status, approved by the Department Head. Today that is
 *     approved for only the competencies the Process Learning Map links to a
 *     high- or critical-risk process stage — a real, traceable derivation.
 *     Everything else is either an explicitly authored PROPOSAL (labelled
 *     "Sample – Requires SME Approval", per §23) or genuinely unset.
 *     The readiness gate blocks on APPROVED criticality only: an unapproved
 *     field must never be presented as current approved guidance (§24).
 *
 *  2. PRACTICAL VALIDATION. §12: for operational roles a quiz is never the
 *     only proof of competence. `requiresPractical()` states the rule and
 *     returns the reason, so a learner can always see why an observation is
 *     being asked for.
 */

import { COMPETENCIES, type Competency } from './competencies'
import { MAP_FLOWS, stagesOf } from './process-learning-map'

export type Criticality = 'approved' | 'proposed' | 'unset'

/**
 * Approved-critical: competencies the Process Learning Map links to a stage
 * whose risk level is high or critical. Derived at module load from the map —
 * change a stage's risk and criticality follows, with no second source to
 * keep in sync.
 */
function deriveApprovedCritical(): Set<string> {
  const ids = new Set<string>()
  for (const flow of MAP_FLOWS) {
    for (const stage of stagesOf(flow)) {
      if (stage.learning.risk === 'high' || stage.learning.risk === 'critical') {
        for (const id of stage.learning.competencyIds) ids.add(id)
      }
    }
  }
  return ids
}

export const APPROVED_CRITICAL_IDS: ReadonlySet<string> = deriveApprovedCritical()

/**
 * Sample – Requires SME Approval.
 *
 * Proposed critical competencies: the ones where getting it wrong is not
 * recoverable by a later stage — statutory exposure, site or machine safety,
 * a measurement that has already been cut, a financial commitment that has
 * already been released, or an approved-claim statement already made to a
 * customer. Each needs its Department Head's approval before it can gate
 * role readiness; until then the portal shows it as a proposal only.
 */
export const PROPOSED_CRITICAL: { competencyId: string; rationale: string }[] = [
  {
    competencyId: 'business-development-product-knowledge',
    rationale: 'Speaks approved product claims to a prospect — an unapproved claim cannot be unsaid.',
  },
  {
    competencyId: 'business-development-crm-usage',
    rationale: 'CRM is the single source of truth; a lead not entered is a lead lost with no audit trail.',
  },
  {
    competencyId: 'sales-sales-process',
    rationale: 'Carries approved pricing, inclusions and closure documentation into a signed order.',
  },
  {
    competencyId: 'sales-opportunity-management',
    rationale: 'Stage and value discipline drives forecast and factory load; silent drift misleads Planning.',
  },
  {
    competencyId: 'post-design-site-measurement',
    rationale: 'A measurement error becomes scrap once the sheet is cut — it cannot be corrected downstream.',
  },
  {
    competencyId: 'post-design-production-handover',
    rationale: 'Incomplete sign-off drawings put the factory into production against the wrong intent.',
  },
  {
    competencyId: 'installation-site-safety',
    rationale: 'Site safety failure risks injury — irreversible harm, not rework.',
  },
  {
    competencyId: 'installation-installation-sops',
    rationale: 'Installed stone cannot be re-fitted without damage; SOP deviation becomes a snag or a replacement.',
  },
  {
    competencyId: 'factory-production-safety-standards',
    rationale: 'Machine safety failure risks injury — irreversible harm, not rework.',
  },
  {
    competencyId: 'factory-production-machine-operations',
    rationale: 'Incorrect machine operation destroys material and can injure the operator.',
  },
  {
    competencyId: 'quality-control-incoming-qc',
    rationale: 'A defect passed at incoming QC is paid for and enters production; escape cost multiplies downstream.',
  },
  {
    competencyId: 'quality-control-final-qc',
    rationale: 'Last gate before the customer sees the product — an escape here is a site complaint.',
  },
  {
    competencyId: 'quality-control-inspection-standards',
    rationale: 'Inconsistent inspection makes every other QC number unreliable.',
  },
  {
    competencyId: 'purchase-purchase-orders',
    rationale: 'Releases a financial commitment to a vendor — cannot be withdrawn without cost.',
  },
  {
    competencyId: 'inventory-warehouse-warehouse-safety',
    rationale: 'Stone slab handling failure risks injury — irreversible harm, not rework.',
  },
  {
    competencyId: 'inventory-warehouse-grn-process',
    rationale: 'GRN accuracy is the basis of stock, payment and traceability; a wrong GRN corrupts all three.',
  },
  {
    competencyId: 'accounts-finance-gst-compliance',
    rationale: 'Statutory filing exposure — a missed or wrong filing carries penalty, not rework.',
  },
  {
    competencyId: 'hr-admin-compliance',
    rationale: 'POSH and statutory obligations — legal exposure with no operational undo.',
  },
  {
    competencyId: 'customer-experience-escalation-matrix',
    rationale: 'A mis-routed escalation burns the SLA clock a customer already lost patience with.',
  },
  {
    competencyId: 'marketing-brand-guidelines',
    rationale: 'Publishes approved claims and terminology; a published wrong claim is public.',
  },
]

const PROPOSED_BY_ID = new Map(PROPOSED_CRITICAL.map((p) => [p.competencyId, p.rationale]))

export function criticalityOf(competencyId: string): Criticality {
  if (APPROVED_CRITICAL_IDS.has(competencyId)) return 'approved'
  if (PROPOSED_BY_ID.has(competencyId)) return 'proposed'
  return 'unset'
}

export function criticalityRationale(competencyId: string): string | null {
  if (APPROVED_CRITICAL_IDS.has(competencyId)) {
    return 'Linked to a high- or critical-risk stage in the Process Learning Map.'
  }
  return PROPOSED_BY_ID.get(competencyId) ?? null
}

/** Only approved criticality may block role readiness (§24). */
export function blocksReadiness(competencyId: string): boolean {
  return criticalityOf(competencyId) === 'approved'
}

/**
 * Departments whose work is performed on a shop floor, a machine or a client
 * site. §12: a quiz can never be the only proof of competence for these.
 */
const OPERATIONAL_DEPARTMENTS = new Set([
  'installation',
  'factory-production',
  'quality-control',
  'inventory-warehouse',
  'post-design',
  'dispatch',
])

/** Customer-facing departments — behaviour is validated by observed role-play. */
const CUSTOMER_FACING_DEPARTMENTS = new Set([
  'business-development',
  'sales',
  'customer-experience',
])

export interface PracticalRequirement {
  required: boolean
  /** Why an observation is required — shown to the learner, never just a flag. */
  reason: string | null
}

export function requiresPractical(competency: Competency): PracticalRequirement {
  if (criticalityOf(competency.id) !== 'unset') {
    return {
      required: true,
      reason: 'Critical competency — capability must be observed, not only answered.',
    }
  }
  if (OPERATIONAL_DEPARTMENTS.has(competency.departmentSlug)) {
    return {
      required: true,
      reason: 'Operational role — performed on the floor or on site, so it is validated on the floor or on site.',
    }
  }
  if (
    CUSTOMER_FACING_DEPARTMENTS.has(competency.departmentSlug) &&
    competency.type === 'behavioral'
  ) {
    return {
      required: true,
      reason: 'Customer-facing behaviour — validated by an assessed role-play or a reviewed live sample.',
    }
  }
  return { required: false, reason: null }
}

/** Governance coverage for a department — feeds the "what is unapproved" panel. */
export interface CriticalityCoverage {
  total: number
  approved: number
  proposed: number
  unset: number
}

export function criticalityCoverage(departmentSlug: string): CriticalityCoverage {
  const comps = COMPETENCIES.filter((c) => c.departmentSlug === departmentSlug)
  let approved = 0
  let proposed = 0
  let unset = 0
  for (const c of comps) {
    const state = criticalityOf(c.id)
    if (state === 'approved') approved += 1
    else if (state === 'proposed') proposed += 1
    else unset += 1
  }
  return { total: comps.length, approved, proposed, unset }
}
