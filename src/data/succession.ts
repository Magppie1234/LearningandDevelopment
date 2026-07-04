import { readinessData } from '@/data/analytics'
import { PRS_PROMOTION_THRESHOLD } from '@/lib/prs'

/**
 * Succession planning rollup (§3.2 item 5): individual PRS → org-level
 * backfill visibility. Critical roles come from the real position ladder
 * (positions.csv next_position_title targets); candidates are the employees
 * whose role feeds that position, ranked by computed PRS. Incumbents are
 * [PLACEHOLDER] until the real roster arrives. DB mirror: migration 0016.
 */

export type SuccessionReadiness = 'ready_now' | 'ready_soon' | 'develop'

export function successionReadinessFor(score: number): SuccessionReadiness {
  if (score >= PRS_PROMOTION_THRESHOLD) return 'ready_now'
  if (score >= 60) return 'ready_soon'
  return 'develop'
}

export interface SuccessionRole {
  role: string
  department: string
  incumbent: string // '[PLACEHOLDER]' until roster provided
  candidates: {
    name: string
    currentRole: string
    prs: number
    readiness: SuccessionReadiness
  }[]
}

/** Feeder mapping: which current roles feed each critical role
 *  (from positions.csv next_position_title). */
const CRITICAL_ROLE_FEEDERS: { role: string; department: string; feederRoles: string[] }[] = [
  { role: 'Sales Manager', department: 'Sales', feederRoles: ['Sales Team Lead', 'Sr. Sales Assoc.'] },
  { role: 'QC Team Lead', department: 'Quality Control', feederRoles: ['QC Analyst'] },
  { role: 'Installation Supervisor', department: 'Installation', feederRoles: ['Install Lead'] },
  { role: 'Purchase Manager', department: 'Purchase', feederRoles: ['Purchase Officer'] },
  { role: 'HR Manager', department: 'HR & Admin', feederRoles: ['HR Specialist'] },
  { role: 'Marketing Manager', department: 'Marketing', feederRoles: ['Marketing Coord.'] },
]

export const successionPlan: SuccessionRole[] = CRITICAL_ROLE_FEEDERS.map((cr) => ({
  role: cr.role,
  department: cr.department,
  incumbent: '[PLACEHOLDER]',
  candidates: readinessData
    .filter((e) => cr.feederRoles.includes(e.role))
    .map((e) => ({
      name: e.name,
      currentRole: e.role,
      prs: e.readiness,
      readiness: successionReadinessFor(e.readiness),
    }))
    .sort((a, b) => b.prs - a.prs),
}))

export const successionSummary = {
  criticalRoles: successionPlan.length,
  withReadyNow: successionPlan.filter((r) =>
    r.candidates.some((c) => c.readiness === 'ready_now'),
  ).length,
  uncovered: successionPlan.filter((r) => r.candidates.length === 0).length,
}
