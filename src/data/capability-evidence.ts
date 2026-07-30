/**
 * DEMO capability evidence — the input the role-readiness engine runs on until
 * the real assessment, practical-observation and manager-rating tables are
 * live.
 *
 * Deterministic by construction: every value derives from a string hash of
 * (member, competency), and the reference date is the fixed `DEMO_AS_OF`
 * constant rather than `new Date()`. Same output on the server and in the
 * browser, same output on every refresh — no hydration mismatch and no
 * dashboard that changes its story between two loads.
 *
 * Evidence is shaped by tenure, because that is what actually drives a real
 * roster: a person who joined three weeks ago has attempts and nothing
 * observed; a person three years in has observations that are starting to
 * expire.
 *
 * Live mode replaces this file with reads from assessment attempts, practical
 * evaluations, evidence submissions and manager ratings. The engine
 * (src/lib/role-readiness.ts) does not change.
 */

import { COMPETENCIES, type Competency } from './competencies'
import { criticalityOf, requiresPractical } from './competency-policy'
import { requirementsForRole } from './role-requirements'
import {
  WORKFORCE,
  daysBetween,
  memberById,
  type WorkforceMember,
} from './workforce'
import {
  assessReadiness,
  type CohortMember,
  type CompetencyEvidence,
  type PracticalStatus,
  type ReadinessVerdict,
} from '@/lib/role-readiness'

/**
 * Reference "today" for all demo capability data. Fixed on purpose — see the
 * file header. Live mode passes the real date into the engine instead.
 */
export const DEMO_AS_OF = '2026-07-30'

/** Demo data flag — pages reading this file must say so on screen (§24). */
export const EVIDENCE_IS_DEMO = true

/** Stable 0…1 from a seed string. */
function rand(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 100000) / 100000
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00.000Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Clamp to the §7 proficiency scale. */
function clamp(n: number): number {
  return Math.max(0, Math.min(5, Math.round(n)))
}

/**
 * Curated demo stories. The generator alone produces a plausible spread but
 * not a legible one, so a handful of people are pinned to the states a
 * reviewer needs to see working: a hard critical block, a practical sitting
 * with an assessor, expired validation, and a clean role-ready record.
 * Documented rather than hidden — this is demo curation, not a rule.
 */
type Story = 'blocked_critical' | 'awaiting_assessor' | 'expired' | 'ready' | 'brand_new'

const STORIES: Record<string, Story> = {
  'wf-bd-03': 'blocked_critical', // Aarav Sharma — the signed-in demo learner
  'wf-bd-04': 'ready',
  'wf-bd-05': 'brand_new',
  'wf-qc-02': 'awaiting_assessor',
  'wf-qc-03': 'brand_new',
  'wf-pr-03': 'expired',
  'wf-in-04': 'brand_new',
  'wf-sl-03': 'ready',
  'wf-po-02': 'awaiting_assessor',
}

interface Band {
  /** Probability a knowledge attempt exists at all. */
  knowledge: number
  /** Probability it passed, given an attempt. */
  pass: number
  /** Probability a manager rating exists. */
  manager: number
  /** Manager rating when it exists. */
  managerRating: [number, number]
  /** Practical outcome probabilities, cumulative: competent, then pending. */
  practicalCompetent: number
  practicalPending: number
}

/** Evidence maturity by tenure — the shape of a real roster. */
function bandFor(daysInRole: number): Band {
  if (daysInRole < 45) {
    return {
      knowledge: 0.35,
      pass: 0.6,
      manager: 0.05,
      managerRating: [2, 2],
      practicalCompetent: 0.0,
      practicalPending: 0.15,
    }
  }
  if (daysInRole < 180) {
    return {
      knowledge: 0.85,
      pass: 0.8,
      manager: 0.5,
      managerRating: [2, 3],
      practicalCompetent: 0.3,
      practicalPending: 0.55,
    }
  }
  if (daysInRole < 540) {
    return {
      knowledge: 0.95,
      pass: 0.9,
      manager: 0.8,
      managerRating: [3, 4],
      practicalCompetent: 0.65,
      practicalPending: 0.8,
    }
  }
  return {
    knowledge: 1,
    pass: 0.94,
    manager: 0.92,
    managerRating: [3, 5],
    practicalCompetent: 0.82,
    practicalPending: 0.9,
  }
}

function assessorFor(member: WorkforceMember): string {
  return memberById(member.managerId)?.name ?? 'Department Head'
}

function evidenceForCompetency(
  member: WorkforceMember,
  competency: Competency,
  daysInRole: number,
  story: Story | undefined,
  index: number,
): CompetencyEvidence {
  const band = bandFor(daysInRole)
  const seed = `${member.id}:${competency.id}`
  const rKnow = rand(`k:${seed}`)
  const rPass = rand(`p:${seed}`)
  const rMgr = rand(`m:${seed}`)
  const rPrac = rand(`x:${seed}`)
  const rWork = rand(`w:${seed}`)
  const practicalRequired = requiresPractical(competency).required

  // When this evidence was last recorded. Skewed recent (rand², not rand) —
  // a tenured person's record is mostly current with a revalidation backlog
  // at the tail, which is what makes the expiry view worth looking at.
  const window = Math.min(daysInRole, 540)
  const r = rand(`d:${seed}`)
  const daysAgo = Math.floor(r * r * window)
  const candidate = addDays(DEMO_AS_OF, -daysAgo)
  const evidenceDate = candidate < member.joinedOn ? addDays(member.joinedOn, 14) : candidate

  const hasKnowledge = rKnow < band.knowledge
  const passed = hasKnowledge && rPass < band.pass
  const scorePct = hasKnowledge
    ? passed
      ? 78 + Math.floor(rand(`s:${seed}`) * 22)
      : 48 + Math.floor(rand(`s:${seed}`) * 30)
    : 0
  const attempts = hasKnowledge ? (passed ? (rPass > 0.65 ? 2 : 1) : 1 + Math.floor(rPass * 2)) : 0

  const hasManager = rMgr < band.manager
  const [lo, hi] = band.managerRating
  const managerRating = hasManager ? clamp(lo + rMgr * (hi - lo)) : null

  let practicalStatus: PracticalStatus = 'none'
  if (practicalRequired) {
    if (rPrac < band.practicalCompetent) practicalStatus = 'competent'
    else if (rPrac < band.practicalPending) practicalStatus = 'pending'
    else practicalStatus = rPrac > 0.95 ? 'not_yet' : 'none'
  }
  let criticalCriteriaMet = practicalStatus === 'competent' ? rand(`c:${seed}`) < 0.9 : false

  let workProduct: CompetencyEvidence['workProduct'] = null
  if (rWork < 0.18) workProduct = rWork < 0.12 ? 'accepted' : 'pending'

  // ── Curated overrides (see STORIES) ─────────────────────────────────────
  let managerRatedOn: string | null = hasManager ? evidenceDate : null
  let practicalAssessedOn: string | null =
    practicalStatus === 'none' ? null : practicalStatus === 'pending' ? evidenceDate : evidenceDate
  let knowledgeTakenOn = evidenceDate

  if (story === 'brand_new') {
    // Nothing observed yet — the honest state for a first-week joiner.
    return {
      competencyId: competency.id,
      self: index % 3 === 0 ? clamp(2 + rand(`f:${seed}`) * 2) : null,
      manager: null,
      managerRatedOn: null,
      knowledge:
        index < 2 && hasKnowledge
          ? { scorePct, passed, takenOn: knowledgeTakenOn, attempts: Math.max(1, attempts) }
          : null,
      practical: practicalRequired
        ? { status: 'none', criticalCriteriaMet: false, assessor: assessorFor(member), assessedOn: null }
        : null,
      workProduct: null,
    }
  }

  if (story === 'ready') {
    return {
      competencyId: competency.id,
      self: clamp((managerRating ?? 4) + 1),
      manager: Math.max(4, managerRating ?? 4),
      managerRatedOn: evidenceDate,
      knowledge: { scorePct: Math.max(88, scorePct), passed: true, takenOn: knowledgeTakenOn, attempts: 1 },
      practical: practicalRequired
        ? {
            status: 'competent',
            criticalCriteriaMet: true,
            assessor: assessorFor(member),
            assessedOn: evidenceDate,
          }
        : null,
      workProduct: workProduct === 'pending' ? 'accepted' : workProduct,
    }
  }

  if (story === 'blocked_critical') {
    // The block: tested well, never observed. Everything else on this person's
    // record is strong — which is the whole point. A high score on every quiz
    // plus one unobserved critical competency is still Not Role Ready (§7).
    return {
      competencyId: competency.id,
      self: 4,
      manager: null,
      managerRatedOn: null,
      knowledge: { scorePct: 92, passed: true, takenOn: knowledgeTakenOn, attempts: 1 },
      practical: practicalRequired
        ? { status: 'none', criticalCriteriaMet: false, assessor: assessorFor(member), assessedOn: null }
        : null,
      workProduct: null,
    }
  }

  if (story === 'awaiting_assessor' && practicalRequired && index % 2 === 0) {
    practicalStatus = 'pending'
    criticalCriteriaMet = false
    practicalAssessedOn = evidenceDate
  }

  if (story === 'expired') {
    // Validated long ago, never revalidated — evidence has gone stale.
    const stale = addDays(member.joinedOn, 30)
    knowledgeTakenOn = stale
    managerRatedOn = hasManager ? stale : null
    practicalAssessedOn = practicalStatus === 'none' ? null : stale
  }

  return {
    competencyId: competency.id,
    self: clamp((managerRating ?? 2) + 1 + rand(`f:${seed}`)),
    manager: managerRating,
    managerRatedOn,
    knowledge: hasKnowledge
      ? { scorePct, passed, takenOn: knowledgeTakenOn, attempts }
      : null,
    practical: practicalRequired
      ? {
          status: practicalStatus,
          criticalCriteriaMet,
          assessor: assessorFor(member),
          assessedOn: practicalAssessedOn,
        }
      : null,
    workProduct,
  }
}

/** All evidence rows for one member, in role-requirement order. */
export function evidenceFor(member: WorkforceMember): CompetencyEvidence[] {
  const requirements = requirementsForRole(member.departmentSlug, member.level)
  const daysInRole = daysBetween(member.joinedOn, DEMO_AS_OF)
  const story = STORIES[member.id]

  // 'blocked_critical' pins the block to the first APPROVED-critical
  // competency — the only kind that actually gates readiness — and leaves the
  // rest of the record strong.
  const blockTargetId =
    story === 'blocked_critical'
      ? requirements.find((r) => criticalityOf(r.competencyId) === 'approved')?.competencyId ?? null
      : null

  const out: CompetencyEvidence[] = []
  let index = 0
  for (const req of requirements) {
    const competency = COMPETENCIES.find((c) => c.id === req.competencyId)
    if (!competency) continue
    const rowStory: Story | undefined =
      story === 'blocked_critical'
        ? competency.id === blockTargetId
          ? 'blocked_critical'
          : 'ready'
        : story
    out.push(evidenceForCompetency(member, competency, daysInRole, rowStory, index))
    index += 1
  }
  return out
}

/**
 * Day number inside the 0/30/60/90-day onboarding window, or null once past
 * it. A new joiner who is not yet role-ready is on plan, not off plan — the
 * Manager Hub separates the two instead of flagging both the same way.
 */
export function onboardingDay(
  member: WorkforceMember,
  asOf: string = DEMO_AS_OF,
): number | null {
  const days = daysBetween(member.joinedOn, asOf)
  return days <= 90 ? days : null
}

const VERDICT_CACHE = new Map<string, ReadinessVerdict>()

/** Readiness verdict for one member — memoised, inputs are immutable. */
export function verdictFor(member: WorkforceMember, asOf: string = DEMO_AS_OF): ReadinessVerdict {
  const key = `${member.id}:${asOf}`
  const cached = VERDICT_CACHE.get(key)
  if (cached) return cached
  const verdict = assessReadiness(
    requirementsForRole(member.departmentSlug, member.level),
    evidenceFor(member),
    COMPETENCIES,
    asOf,
  )
  VERDICT_CACHE.set(key, verdict)
  return verdict
}

export function cohortFor(
  members: WorkforceMember[],
  asOf: string = DEMO_AS_OF,
): CohortMember<WorkforceMember>[] {
  return members.map((member) => ({ member, verdict: verdictFor(member, asOf) }))
}

/** The whole roster — the Executive and HR views' widest cohort. */
export function wholeWorkforceCohort(asOf: string = DEMO_AS_OF): CohortMember<WorkforceMember>[] {
  return cohortFor(WORKFORCE, asOf)
}

/**
 * Median days from role start to role-ready, across members who are role-ready
 * and have a validation date. Null when nobody qualifies — a missing number is
 * reported as missing, never as zero (§13 requires visible denominators).
 */
export function timeToProficiencyDays(
  cohort: CohortMember<WorkforceMember>[],
): { median: number | null; sampleSize: number } {
  const days: number[] = []
  for (const { member, verdict } of cohort) {
    if (verdict.status !== 'role_ready') continue
    const dates = verdict.rows.map((r) => r.validatedOn).filter((d): d is string => Boolean(d))
    if (dates.length === 0) continue
    const certifiedOn = dates.reduce((a, b) => (a > b ? a : b))
    days.push(daysBetween(member.joinedOn, certifiedOn))
  }
  if (days.length === 0) return { median: null, sampleSize: 0 }
  const sorted = [...days].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  const med =
    sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid]
  return { median: med, sampleSize: days.length }
}
