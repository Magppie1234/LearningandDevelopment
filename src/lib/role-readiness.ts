/**
 * Role-readiness engine (L&D OS spec §7, §12, §13).
 *
 * The one rule this file exists to enforce: **a watched video and a passed
 * quiz are not capability.** §7 forbids averaging self-ratings into a
 * competence number, so the five evidence channels are kept apart and each
 * one sets a CEILING on validated proficiency. The final number is the lowest
 * ceiling — never a mean, and never above what has actually been verified.
 *
 * Pure logic only: no demo data, no React, no Date.now(). Evidence comes in as
 * an argument and `asOf` is always passed explicitly, so a server render and a
 * client render of the same inputs produce the same output.
 *
 * Proficiency scale (§7):
 *   0 Not assessed · 1 Awareness · 2 Guided · 3 Independent · 4 Advanced
 *   5 Expert / Coach
 */

import type { Competency } from '@/data/competencies'
import type { CompetencyRequirement } from '@/lib/skill-gap'
import {
  blocksReadiness,
  criticalityOf,
  requiresPractical,
  type Criticality,
} from '@/data/competency-policy'

/* ────────────────────────────  EVIDENCE  ─────────────────────────────── */

export type PracticalStatus =
  /** Assessed and competent. */
  | 'competent'
  /** Assessed, not competent yet — remediation, then reassessment. */
  | 'not_yet'
  /** Evidence submitted, awaiting the assessor. */
  | 'pending'
  /** Nothing submitted. */
  | 'none'

export type WorkProductStatus = 'accepted' | 'returned' | 'pending'

export interface KnowledgeEvidence {
  scorePct: number
  passed: boolean
  /** ISO date of the attempt that counts. */
  takenOn: string
  attempts: number
}

export interface PracticalEvidence {
  status: PracticalStatus
  /** §11: a practical failure cannot be compensated for by a high quiz score. */
  criticalCriteriaMet: boolean
  assessor: string
  /** ISO date. Null while status is 'none'. */
  assessedOn: string | null
  /** Rubric this observation was scored against. */
  rubricId?: string
}

/**
 * One competency's evidence for one person. Every channel is optional
 * because "no evidence" is a real, reportable state — not a zero to average.
 */
export interface CompetencyEvidence {
  competencyId: string
  /** Learner self-rating 0–5. Displayed, never counted toward validation. */
  self: number | null
  /** Reporting manager's observed rating 0–5. */
  manager: number | null
  managerRatedOn?: string | null
  knowledge: KnowledgeEvidence | null
  practical: PracticalEvidence | null
  workProduct: WorkProductStatus | null
}

/* ─────────────────────────────  CEILINGS  ────────────────────────────── */

export type Channel = 'manager' | 'knowledge' | 'practical' | 'workProduct'

export const CHANNEL_LABEL: Record<Channel, string> = {
  manager: 'Manager observation',
  knowledge: 'Knowledge assessment',
  practical: 'Practical assessment',
  workProduct: 'Work-product evidence',
}

/**
 * Independent (3) means "performs correctly without supervision". Only the
 * reporting manager can attest to unsupervised performance, so with no manager
 * rating on file the ceiling is Guided (2) however well the learner tested.
 */
function managerCeiling(e: CompetencyEvidence): number {
  return e.manager == null ? 2 : e.manager
}

/**
 * A knowledge assessment proves recall and judgement, not execution: passing
 * it opens Advanced (4), and only a high pass opens 5. No attempt or a failed
 * attempt holds the competency at Awareness (1).
 */
function knowledgeCeiling(e: CompetencyEvidence): number {
  const k = e.knowledge
  if (!k) return 1
  if (!k.passed) return 1
  return k.scorePct >= 90 ? 5 : 4
}

/**
 * Where a practical observation is required, nothing above Guided (2) is
 * available until an assessor has marked the person competent with every
 * critical criterion met.
 */
function practicalCeiling(e: CompetencyEvidence, required: boolean): number {
  if (!required) return 5
  const p = e.practical
  if (!p || p.status === 'none' || p.status === 'pending') return 2
  if (p.status === 'not_yet') return 2
  return p.criticalCriteriaMet ? 5 : 2
}

/**
 * Work-product evidence is only requested for some competencies. Requested
 * and still pending holds at Independent (3); returned for rework holds at
 * Guided (2).
 */
function workProductCeiling(e: CompetencyEvidence): number {
  if (e.workProduct == null) return 5
  if (e.workProduct === 'accepted') return 5
  return e.workProduct === 'pending' ? 3 : 2
}

/** Default recertification interval — configurable per §12, not a hard rule. */
const REVALIDATION_MONTHS = { critical: 12, standard: 24 } as const

function addMonths(iso: string, months: number): string {
  const d = new Date(`${iso}T00:00:00.000Z`)
  d.setUTCMonth(d.getUTCMonth() + months)
  return d.toISOString().slice(0, 10)
}

function latestDate(dates: (string | null | undefined)[]): string | null {
  const valid = dates.filter((d): d is string => Boolean(d))
  if (valid.length === 0) return null
  return valid.reduce((a, b) => (a > b ? a : b))
}

/* ─────────────────────  VALIDATED COMPETENCY ROW  ────────────────────── */

export interface ValidatedCompetency {
  competencyId: string
  name: string
  type: Competency['type']
  academy: string
  departmentSlug: string
  required: number
  /** Final validated proficiency = lowest ceiling. Never an average. */
  validated: number
  /** required − validated, floored at 0. */
  gap: number
  /** Learner self-rating, shown alongside — excluded from `validated`. */
  self: number | null
  ceilings: Record<Channel, number>
  /** Channels sitting at the minimum — i.e. what is actually holding it back. */
  cappedBy: Channel[]
  /**
   * True when expired validation — not a channel — is what is holding the
   * number down. Expired evidence is not current evidence (§24).
   */
  cappedByExpiry: boolean
  criticality: Criticality
  /** Only approved criticality gates readiness. */
  blocksReadiness: boolean
  practicalRequired: boolean
  practicalReason: string | null
  practicalStatus: PracticalStatus | 'not_required'
  validatedOn: string | null
  nextValidationOn: string | null
  /** True when nextValidationOn has passed — evidence is stale (§12). */
  expired: boolean
  /** True when validation expires within 90 days (§13 B/E exposure view). */
  expiringSoon: boolean
}

const EMPTY_EVIDENCE = (competencyId: string): CompetencyEvidence => ({
  competencyId,
  self: null,
  manager: null,
  knowledge: null,
  practical: null,
  workProduct: null,
})

/**
 * Resolve one competency to a validated row. `asOf` is required so expiry is
 * deterministic across server and client renders.
 */
export function validateCompetency(
  competency: Competency,
  required: number,
  evidence: CompetencyEvidence | undefined,
  asOf: string,
): ValidatedCompetency {
  const e = evidence ?? EMPTY_EVIDENCE(competency.id)
  const practical = requiresPractical(competency)

  const ceilings: Record<Channel, number> = {
    manager: managerCeiling(e),
    knowledge: knowledgeCeiling(e),
    practical: practicalCeiling(e, practical.required),
    workProduct: workProductCeiling(e),
  }

  const hasAnyEvidence =
    e.manager != null ||
    e.knowledge != null ||
    (e.practical != null && e.practical.status !== 'none') ||
    e.workProduct != null

  const criticality = criticalityOf(competency.id)
  const validatedOn = hasAnyEvidence
    ? latestDate([e.managerRatedOn, e.knowledge?.takenOn, e.practical?.assessedOn])
    : null
  const months =
    criticality === 'unset' ? REVALIDATION_MONTHS.standard : REVALIDATION_MONTHS.critical
  const nextValidationOn = validatedOn ? addMonths(validatedOn, months) : null
  const expired = Boolean(nextValidationOn && nextValidationOn < asOf)

  /**
   * Expired validation drops the competency back to Guided (2): the person may
   * well still be capable, but nobody has verified it inside the revalidation
   * window, so the portal cannot keep reporting Independent or above.
   */
  const EXPIRY_CEILING = 2
  const lowest = Math.min(...(Object.values(ceilings) as number[]))
  const effective = expired ? Math.min(lowest, EXPIRY_CEILING) : lowest
  const validated = hasAnyEvidence ? Math.max(0, Math.min(5, effective)) : 0
  const cappedBy = hasAnyEvidence
    ? (Object.keys(ceilings) as Channel[]).filter((c) => ceilings[c] === effective)
    : []

  return {
    competencyId: competency.id,
    name: competency.name,
    type: competency.type,
    academy: competency.academy,
    departmentSlug: competency.departmentSlug,
    required,
    validated,
    gap: Math.max(0, required - validated),
    self: e.self,
    ceilings,
    cappedBy,
    cappedByExpiry: hasAnyEvidence && expired && lowest > EXPIRY_CEILING,
    criticality,
    blocksReadiness: blocksReadiness(competency.id),
    practicalRequired: practical.required,
    practicalReason: practical.reason,
    practicalStatus: practical.required ? (e.practical?.status ?? 'none') : 'not_required',
    validatedOn,
    nextValidationOn,
    expired,
    expiringSoon: Boolean(
      nextValidationOn && nextValidationOn >= asOf && nextValidationOn <= addMonths(asOf, 3),
    ),
  }
}

/* ───────────────────────────  ROLE VERDICT  ──────────────────────────── */

export type ReadinessStatus =
  /** Every required competency validated at or above target. */
  | 'role_ready'
  /** Gaps remain, but none of them is an approved-critical competency. */
  | 'developing'
  /** At least one approved-critical competency is short — hard gate (§7). */
  | 'not_role_ready'
  /** No verified evidence at all yet. */
  | 'not_assessed'
  /** The role has no competency framework authored — nothing to be ready for. */
  | 'no_framework'

export interface NextAction {
  label: string
  /** Who has to act — a readiness gap is not always the learner's to close. */
  owner: 'Learner' | 'Reporting Manager' | 'Assessor' | 'Department Head' | 'HR'
}

export interface ReadinessVerdict {
  status: ReadinessStatus
  /** Employees' competencies at or above required ÷ required competencies. */
  coveragePct: number
  rows: ValidatedCompetency[]
  gaps: ValidatedCompetency[]
  /** Approved-critical gaps — these are what force 'not_role_ready'. */
  criticalBlockers: ValidatedCompetency[]
  /** Proposed-critical gaps — would block once the Department Head approves. */
  wouldBlockOnApproval: ValidatedCompetency[]
  expired: ValidatedCompetency[]
  expiringSoon: ValidatedCompetency[]
  /** Practical observations submitted and waiting on an assessor. */
  awaitingAssessor: ValidatedCompetency[]
  nextAction: NextAction | null
  /**
   * True when the verdict rests on competencies whose criticality has not been
   * approved. The verdict is still shown, flagged as provisional (§24).
   */
  provisional: boolean
}

export const READINESS_LABEL: Record<ReadinessStatus, string> = {
  role_ready: 'Role ready',
  developing: 'Developing',
  not_role_ready: 'Not role ready',
  not_assessed: 'Not assessed',
  no_framework: 'No framework',
}

function pickNextAction(v: {
  criticalBlockers: ValidatedCompetency[]
  gaps: ValidatedCompetency[]
  expired: ValidatedCompetency[]
  awaitingAssessor: ValidatedCompetency[]
}): NextAction | null {
  // Ordered by who is actually blocking, not by who is easiest to notify.
  const blocker = v.criticalBlockers[0]
  if (blocker) {
    // Nothing attempted is a different situation from something failed, and
    // gets a different instruction.
    if (blocker.validated === 0) {
      return { label: `Start the ${blocker.name} learning path`, owner: 'Learner' }
    }
    if (blocker.practicalStatus === 'pending') {
      return { label: `Assessor to close the practical observation for ${blocker.name}`, owner: 'Assessor' }
    }
    if (blocker.cappedBy.includes('knowledge')) {
      return { label: `Pass the ${blocker.name} knowledge assessment`, owner: 'Learner' }
    }
    if (blocker.cappedBy.includes('practical')) {
      return { label: `Book the ${blocker.name} practical observation`, owner: 'Reporting Manager' }
    }
    if (blocker.cappedBy.includes('manager')) {
      return { label: `Manager observation pending for ${blocker.name}`, owner: 'Reporting Manager' }
    }
    return { label: `Close the ${blocker.name} gap`, owner: 'Reporting Manager' }
  }
  const stale = v.expired[0]
  if (stale) return { label: `Recertify ${stale.name} — validation has expired`, owner: 'Learner' }
  const waiting = v.awaitingAssessor[0]
  if (waiting) {
    return { label: `Assessor to review submitted evidence for ${waiting.name}`, owner: 'Assessor' }
  }
  const gap = v.gaps[0]
  if (gap) {
    if (gap.validated === 0) {
      return { label: `Start the ${gap.name} learning path`, owner: 'Learner' }
    }
    if (gap.cappedBy.includes('knowledge')) {
      return { label: `Complete the ${gap.name} assessment`, owner: 'Learner' }
    }
    if (gap.cappedBy.includes('manager')) {
      return { label: `Manager observation pending for ${gap.name}`, owner: 'Reporting Manager' }
    }
    return { label: `Close the ${gap.name} gap`, owner: 'Learner' }
  }
  return null
}

/**
 * The verdict for one person against one role.
 *
 * `requirements` come from the role master (see role-requirements.ts) and
 * `dictionary` from the Competency Dictionary — a requirement naming a
 * competency the dictionary does not define is skipped, never invented.
 */
export function assessReadiness(
  requirements: CompetencyRequirement[],
  evidence: CompetencyEvidence[],
  dictionary: Competency[],
  asOf: string,
): ReadinessVerdict {
  const dictById = new Map(dictionary.map((d) => [d.id, d]))
  const evidenceById = new Map(evidence.map((e) => [e.competencyId, e]))

  const rows: ValidatedCompetency[] = []
  for (const req of requirements) {
    const comp = dictById.get(req.competencyId)
    if (!comp) continue
    rows.push(validateCompetency(comp, req.required, evidenceById.get(req.competencyId), asOf))
  }

  if (rows.length === 0) {
    return {
      status: 'no_framework',
      coveragePct: 0,
      rows: [],
      gaps: [],
      criticalBlockers: [],
      wouldBlockOnApproval: [],
      expired: [],
      expiringSoon: [],
      awaitingAssessor: [],
      nextAction: {
        label: 'Author the role competency framework before readiness can be measured',
        owner: 'Department Head',
      },
      provisional: false,
    }
  }

  const gaps = rows
    .filter((r) => r.gap > 0)
    .sort((a, b) => Number(b.blocksReadiness) - Number(a.blocksReadiness) || b.gap - a.gap)
  const criticalBlockers = gaps.filter((r) => r.blocksReadiness)
  const wouldBlockOnApproval = gaps.filter((r) => r.criticality === 'proposed')
  const expired = rows.filter((r) => r.expired)
  const expiringSoon = rows.filter((r) => r.expiringSoon)
  const awaitingAssessor = rows.filter((r) => r.practicalStatus === 'pending')

  const met = rows.filter((r) => r.gap === 0).length
  const coveragePct = Math.round((met / rows.length) * 100)
  const anyEvidence = rows.some((r) => r.validated > 0)

  let status: ReadinessStatus
  if (!anyEvidence) status = 'not_assessed'
  else if (criticalBlockers.length > 0 || expired.some((r) => r.blocksReadiness)) {
    status = 'not_role_ready'
  } else if (gaps.length === 0) status = 'role_ready'
  else status = 'developing'

  return {
    status,
    coveragePct,
    rows,
    gaps,
    criticalBlockers,
    wouldBlockOnApproval,
    expired,
    expiringSoon,
    awaitingAssessor,
    nextAction: pickNextAction({ criticalBlockers, gaps, expired, awaitingAssessor }),
    provisional: rows.some((r) => r.criticality !== 'approved'),
  }
}

/* ─────────────────────────  COHORT ROLL-UPS  ─────────────────────────── */

export interface CohortMember<T> {
  member: T
  verdict: ReadinessVerdict
}

export interface ReadinessMix {
  role_ready: number
  developing: number
  not_role_ready: number
  not_assessed: number
  no_framework: number
  total: number
  /** Role-ready ÷ everyone with a framework. Excludes no_framework (§13 KPI). */
  readyPct: number
}

export function readinessMix<T>(cohort: CohortMember<T>[]): ReadinessMix {
  const mix: ReadinessMix = {
    role_ready: 0,
    developing: 0,
    not_role_ready: 0,
    not_assessed: 0,
    no_framework: 0,
    total: cohort.length,
    readyPct: 0,
  }
  for (const c of cohort) mix[c.verdict.status] += 1
  const applicable = mix.total - mix.no_framework
  mix.readyPct = applicable === 0 ? 0 : Math.round((mix.role_ready / applicable) * 100)
  return mix
}

export interface SkillRiskRow {
  competencyId: string
  name: string
  departmentSlug: string
  criticality: Criticality
  /** People short of the required proficiency. */
  affected: number
  /** Applicable people — the denominator skill coverage is quoted against. */
  applicable: number
  /** Sum of individual gaps. */
  totalGap: number
  /** Coverage = at-or-above-required ÷ applicable, as a percentage. */
  coveragePct: number
  /** totalGap × criticality weight × affected (§13 weighted skill risk). */
  weightedRisk: number
}

/** Approved-critical carries the most weight; unset the least (§13). */
const CRITICALITY_WEIGHT: Record<Criticality, number> = {
  approved: 3,
  proposed: 2,
  unset: 1,
}

/**
 * Weighted skill risk across a cohort, highest risk first. This is the number
 * that decides which capability gap gets attention next.
 */
export function skillRisk<T>(cohort: CohortMember<T>[]): SkillRiskRow[] {
  const acc = new Map<string, SkillRiskRow>()
  for (const { verdict } of cohort) {
    for (const row of verdict.rows) {
      let entry = acc.get(row.competencyId)
      if (!entry) {
        entry = {
          competencyId: row.competencyId,
          name: row.name,
          departmentSlug: row.departmentSlug,
          criticality: row.criticality,
          affected: 0,
          applicable: 0,
          totalGap: 0,
          coveragePct: 0,
          weightedRisk: 0,
        }
        acc.set(row.competencyId, entry)
      }
      entry.applicable += 1
      if (row.gap > 0) {
        entry.affected += 1
        entry.totalGap += row.gap
      }
    }
  }
  const rows = [...acc.values()]
  for (const r of rows) {
    r.coveragePct =
      r.applicable === 0 ? 0 : Math.round(((r.applicable - r.affected) / r.applicable) * 100)
    r.weightedRisk = r.totalGap * CRITICALITY_WEIGHT[r.criticality] * r.affected
  }
  return rows.sort((a, b) => b.weightedRisk - a.weightedRisk)
}

/** Median — returns null for an empty set rather than a misleading 0. */
export function median(values: number[]): number | null {
  if (values.length === 0) return null
  const s = [...values].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 === 0 ? Math.round((s[mid - 1] + s[mid]) / 2) : s[mid]
}
