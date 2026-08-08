/**
 * Learning plan — the layer that turns a capability verdict into things a
 * person can actually do next.
 *
 * The portal had two disconnected worlds: a rigorous competency/readiness
 * engine (`role-readiness.ts`) that knew what a person could do but never said
 * what to go and learn, and an academy/course catalogue that knew what could be
 * learned but not who needed it. This module joins them.
 *
 * Everything here is DERIVED — nothing is invented. Every item traces to a
 * required competency from the role framework, and every date traces to the
 * member's joining date plus a stated policy window. Where a fact is genuinely
 * unknown (how long a course takes, whether a video was watched) it is left
 * absent rather than filled in, so the UI can say "not recorded" instead of
 * printing a fabricated number.
 *
 * Pure: no React, no `Date.now()`. `asOf` is always passed explicitly so a
 * server render and a client render of the same inputs agree.
 */

import { COMPETENCIES, type Competency } from '@/data/competencies'
import { criticalityOf } from '@/data/competency-policy'
import {
  DEMO_AS_OF,
  evidenceFor,
  onboardingDay,
  verdictFor,
} from '@/data/capability-evidence'
import { academies, type Academy } from '@/data/academies'
import { daysBetween, departmentBySlug, type WorkforceMember } from '@/data/workforce'
import { requirementsForRole } from '@/data/role-requirements'
import type { ReadinessVerdict, ValidatedCompetency } from '@/lib/role-readiness'

/* ───────────────────────────  DUE-DATE POLICY  ──────────────────────── */

/**
 * How long a person has, from their role start date, to reach the required
 * level on a competency. Stated as policy so a due date is explainable to the
 * learner rather than appearing from nowhere.
 *
 * Approved-critical competencies gate role readiness, so they carry the
 * shortest window; competencies whose criticality has not yet been approved
 * get the longest, because the business has not committed to them.
 */
export const DUE_WINDOW_DAYS = {
  critical: 60,
  proposed: 90,
  standard: 180,
} as const

export const DUE_POLICY_NOTE =
  'Due dates are derived from role start date + a window set by competency criticality: ' +
  `${DUE_WINDOW_DAYS.critical} days for approved-critical, ${DUE_WINDOW_DAYS.proposed} days for proposed-critical, ` +
  `${DUE_WINDOW_DAYS.standard} days otherwise.`

function addDays(iso: string, days: number): string {
  const d = new Date(iso)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function windowFor(competencyId: string): number {
  const c = criticalityOf(competencyId)
  if (c === 'approved') return DUE_WINDOW_DAYS.critical
  if (c === 'proposed') return DUE_WINDOW_DAYS.proposed
  return DUE_WINDOW_DAYS.standard
}

/* ──────────────────────────────  ITEMS  ─────────────────────────────── */

export type ItemStatus = 'completed' | 'overdue' | 'in_progress' | 'not_started' | 'expired'

export interface LearningItem {
  competencyId: string
  title: string
  /** Which academy / learning path teaches this. */
  academy: string
  type: Competency['type']
  status: ItemStatus
  /** True for approved-critical competencies — these block role readiness. */
  mandatory: boolean
  required: number
  validated: number
  /** required − validated, floored at 0. */
  gap: number
  dueOn: string
  /** Negative once overdue. */
  daysRemaining: number
  /** 0–100, derived from validated ÷ required. Not a video watch percentage. */
  progressPct: number
  /** What actually has to happen next, and who has to do it. */
  nextStep: string
  owner: 'Learner' | 'Reporting Manager' | 'Assessor' | 'Department Head' | 'HR'
  /** Where the learner goes to work on it. */
  href: string
  /** Set when validation has lapsed or lapses within 90 days. */
  expiresOn: string | null
  expiringSoon: boolean
  /** Why the number is held where it is — the capping channels, in words. */
  heldBackBy: string | null
}

const CHANNEL_STEP: Record<string, { step: string; owner: LearningItem['owner'] }> = {
  knowledge: {
    step: 'Take the knowledge assessment for this competency',
    owner: 'Learner',
  },
  practical: {
    step: 'Book a practical observation with an assessor',
    owner: 'Assessor',
  },
  manager: {
    step: 'Ask your reporting manager to rate observed performance',
    owner: 'Reporting Manager',
  },
  workProduct: {
    step: 'Submit a real deliverable for review',
    owner: 'Learner',
  },
}

const CHANNEL_WORD: Record<string, string> = {
  knowledge: 'no passed knowledge assessment',
  practical: 'no practical observation on record',
  manager: 'no manager rating on record',
  workProduct: 'no accepted work product',
}

/** Map a department to the academy that teaches it, when one is authored. */
export function academyForDepartment(slug: string): Academy | undefined {
  const dept = departmentBySlug(slug)
  if (!dept) return undefined
  const wanted = dept.name.toLowerCase()
  return academies.find(
    (a) =>
      a.id === slug ||
      a.name.toLowerCase().includes(dept.shortName.toLowerCase()) ||
      wanted.includes(a.name.toLowerCase().replace(/ academy$/, '')),
  )
}

function hrefFor(row: ValidatedCompetency): string {
  // Route to the module surface where one exists, otherwise to the competency
  // detail on the Skills page — never to a dead link.
  if (row.departmentSlug === 'business-development') {
    return '/academy/business-development/modules'
  }
  if (row.departmentSlug === 'sales') return '/academy/sales/modules'
  return `/skills-passport?competency=${encodeURIComponent(row.competencyId)}`
}

function statusOf(row: ValidatedCompetency, dueOn: string, asOf: string): ItemStatus {
  if (row.expired) return 'expired'
  if (row.gap === 0) return 'completed'
  if (dueOn < asOf) return 'overdue'
  return row.validated > 0 ? 'in_progress' : 'not_started'
}

export function itemsFor(
  member: WorkforceMember,
  asOf: string = DEMO_AS_OF,
): LearningItem[] {
  const verdict = verdictFor(member, asOf)
  return verdict.rows
    .map((row) => {
      const dueOn = addDays(member.joinedOn, windowFor(row.competencyId))
      const status = statusOf(row, dueOn, asOf)
      const cap = row.cappedBy[0]
      const stepInfo = cap ? CHANNEL_STEP[cap] : undefined
      const heldBack = row.cappedByExpiry
        ? 'validation has expired'
        : row.cappedBy.length > 0
          ? row.cappedBy.map((c) => CHANNEL_WORD[c] ?? c).join(' and ')
          : null

      return {
        competencyId: row.competencyId,
        title: row.name,
        academy: row.academy,
        type: row.type,
        status,
        mandatory: row.blocksReadiness,
        required: row.required,
        validated: row.validated,
        gap: row.gap,
        dueOn,
        // Signed: positive = days left, negative = days overdue.
        daysRemaining:
          dueOn >= asOf ? daysBetween(asOf, dueOn) : -daysBetween(dueOn, asOf),
        progressPct:
          row.required === 0 ? 100 : Math.round((Math.min(row.validated, row.required) / row.required) * 100),
        nextStep:
          status === 'completed'
            ? 'Validated — nothing outstanding'
            : row.expired
              ? 'Revalidate: evidence is outside the revalidation window'
              : (stepInfo?.step ?? 'Start this competency'),
        owner: status === 'completed' ? 'Learner' : (stepInfo?.owner ?? 'Learner'),
        href: hrefFor(row),
        expiresOn: row.nextValidationOn,
        expiringSoon: row.expiringSoon,
        heldBackBy: heldBack,
      }
    })
    .sort((a, b) => {
      // Overdue first, then mandatory, then soonest due — the order a learner
      // should work through them.
      const rank = (i: LearningItem) =>
        i.status === 'overdue' || i.status === 'expired' ? 0 : i.status === 'completed' ? 3 : i.mandatory ? 1 : 2
      const r = rank(a) - rank(b)
      if (r !== 0) return r
      return a.dueOn.localeCompare(b.dueOn)
    })
}

/* ───────────────────────────  PLAN SUMMARY  ─────────────────────────── */

export interface LearningPlan {
  member: WorkforceMember
  /** Undefined when the department has no authored framework. */
  hasFramework: boolean
  verdict: ReadinessVerdict
  items: LearningItem[]
  /** The single thing to do next. Null when nothing is outstanding. */
  next: LearningItem | null
  counts: {
    total: number
    completed: number
    overdue: number
    expired: number
    inProgress: number
    notStarted: number
    mandatory: number
    mandatoryCompleted: number
  }
  /** Completed ÷ total required competencies. */
  completionPct: number
  /** Mandatory completed ÷ mandatory total — the compliance number. */
  compliancePct: number | null
  /** Day inside the 0–90 onboarding window, or null once past it. */
  onboardingDay: number | null
  /** Competencies whose validation lapses within 90 days. */
  expiringSoon: LearningItem[]
  asOf: string
}

export function planFor(
  member: WorkforceMember,
  asOf: string = DEMO_AS_OF,
): LearningPlan {
  const verdict = verdictFor(member, asOf)
  const items = itemsFor(member, asOf)

  const completed = items.filter((i) => i.status === 'completed').length
  const overdue = items.filter((i) => i.status === 'overdue').length
  const expired = items.filter((i) => i.status === 'expired').length
  const inProgress = items.filter((i) => i.status === 'in_progress').length
  const notStarted = items.filter((i) => i.status === 'not_started').length
  const mandatoryItems = items.filter((i) => i.mandatory)
  const mandatoryCompleted = mandatoryItems.filter((i) => i.status === 'completed').length

  const outstanding = items.filter((i) => i.status !== 'completed')

  return {
    member,
    hasFramework: verdict.status !== 'no_framework' && items.length > 0,
    verdict,
    items,
    next: outstanding[0] ?? null,
    counts: {
      total: items.length,
      completed,
      overdue,
      expired,
      inProgress,
      notStarted,
      mandatory: mandatoryItems.length,
      mandatoryCompleted,
    },
    completionPct: items.length === 0 ? 0 : Math.round((completed / items.length) * 100),
    compliancePct:
      mandatoryItems.length === 0
        ? null
        : Math.round((mandatoryCompleted / mandatoryItems.length) * 100),
    onboardingDay: onboardingDay(member, asOf),
    expiringSoon: items.filter((i) => i.expiringSoon),
    asOf,
  }
}

/* ──────────────────────────  COHORT ROLL-UPS  ───────────────────────── */

export interface CohortSummary {
  people: number
  /** People with at least one item not completed. */
  withOutstanding: number
  /** People with at least one overdue or expired item. */
  withOverdue: number
  /** People who have started nothing at all. */
  notStarted: number
  /** Mean completion across people who have a framework. */
  completionPct: number | null
  /** Mandatory-competency compliance across the cohort. */
  compliancePct: number | null
  /** People whose department has no authored competency framework. */
  noFramework: number
  totalOverdueItems: number
  expiringSoonItems: number
}

/**
 * Cohort roll-up. People in departments with no authored framework are counted
 * separately and excluded from the percentages — averaging them in as zero
 * would report an authoring gap as a learning failure.
 */
export function summarise(
  members: WorkforceMember[],
  asOf: string = DEMO_AS_OF,
): CohortSummary {
  const plans = members.map((m) => planFor(m, asOf))
  const measurable = plans.filter((p) => p.hasFramework)

  let mandatoryTotal = 0
  let mandatoryDone = 0
  let itemsTotal = 0
  let itemsDone = 0
  for (const p of measurable) {
    mandatoryTotal += p.counts.mandatory
    mandatoryDone += p.counts.mandatoryCompleted
    itemsTotal += p.counts.total
    itemsDone += p.counts.completed
  }

  return {
    people: members.length,
    withOutstanding: measurable.filter((p) => p.counts.completed < p.counts.total).length,
    withOverdue: measurable.filter((p) => p.counts.overdue + p.counts.expired > 0).length,
    notStarted: measurable.filter((p) => p.counts.completed === 0 && p.counts.inProgress === 0)
      .length,
    completionPct: itemsTotal === 0 ? null : Math.round((itemsDone / itemsTotal) * 100),
    compliancePct: mandatoryTotal === 0 ? null : Math.round((mandatoryDone / mandatoryTotal) * 100),
    noFramework: plans.length - measurable.length,
    totalOverdueItems: measurable.reduce((n, p) => n + p.counts.overdue + p.counts.expired, 0),
    expiringSoonItems: measurable.reduce((n, p) => n + p.expiringSoon.length, 0),
  }
}

/* ────────────────────────  ASSESSMENT RESULTS  ──────────────────────── */

export interface AssessmentStats {
  /** People with at least one recorded knowledge attempt. */
  learnersAttempted: number
  /** Distinct competency attempts recorded across the cohort. */
  attempts: number
  passed: number
  failed: number
  /** passed ÷ attempts. Null when nothing has been attempted. */
  passRatePct: number | null
  /** Mean best score across recorded attempts. Null when none. */
  averageScorePct: number | null
  /** People who have attempted nothing at all. */
  noAttempts: number
  /** Attempts needing a retake — failed and still short of required. */
  needsReassessment: number
}

/**
 * Assessment results across a cohort, read from the knowledge-evidence channel.
 *
 * Denominators are attempts, not people, and "no attempt" is counted
 * separately rather than folded in as a fail — a cohort where nobody has sat
 * an assessment has no pass rate, and reporting that as 0% would send a
 * manager chasing the wrong problem.
 */
export function assessmentStats(
  members: WorkforceMember[],
  asOf: string = DEMO_AS_OF,
): AssessmentStats {
  let attempts = 0
  let passed = 0
  let scoreSum = 0
  let scoreCount = 0
  let learnersAttempted = 0
  let needsReassessment = 0

  for (const m of members) {
    const rows = evidenceFor(m)
    const mine = rows.filter((r) => r.knowledge != null)
    if (mine.length > 0) learnersAttempted += 1
    for (const r of mine) {
      const k = r.knowledge!
      attempts += 1
      if (k.passed) passed += 1
      else needsReassessment += 1
      scoreSum += k.scorePct
      scoreCount += 1
    }
  }

  return {
    learnersAttempted,
    attempts,
    passed,
    failed: attempts - passed,
    passRatePct: attempts === 0 ? null : Math.round((passed / attempts) * 100),
    averageScorePct: scoreCount === 0 ? null : Math.round(scoreSum / scoreCount),
    noAttempts: members.length - learnersAttempted,
    needsReassessment,
  }
}

/* ─────────────────────────  PER-PERSON ROW  ─────────────────────────── */

/** One row of a team / department roster — what a manager scans. */
export interface RosterRow {
  member: WorkforceMember
  plan: LearningPlan
  departmentName: string
  /** Null when the department framework has not been authored. */
  completionPct: number | null
  compliancePct: number | null
  overdue: number
  notStarted: number
  expiringSoon: number
  readiness: ReadinessVerdict['status']
  /** The action this person is waiting on, and who owns it. */
  nextAction: string
  nextActionOwner: string
  /** True when they are inside their 90-day onboarding window. */
  onboarding: boolean
  /** Best-score average across their recorded attempts, or null. */
  averageScorePct: number | null
}

export function rosterFor(
  members: WorkforceMember[],
  asOf: string = DEMO_AS_OF,
): RosterRow[] {
  return members
    .map((member) => {
      const plan = planFor(member, asOf)
      const stats = assessmentStats([member], asOf)
      return {
        member,
        plan,
        departmentName: departmentBySlug(member.departmentSlug)?.name ?? member.departmentSlug,
        completionPct: plan.hasFramework ? plan.completionPct : null,
        compliancePct: plan.compliancePct,
        overdue: plan.counts.overdue + plan.counts.expired,
        notStarted: plan.counts.notStarted,
        expiringSoon: plan.expiringSoon.length,
        readiness: plan.verdict.status,
        nextAction: plan.verdict.nextAction?.label ?? 'Nothing outstanding',
        nextActionOwner: plan.verdict.nextAction?.owner ?? '—',
        onboarding: plan.onboardingDay != null,
        averageScorePct: stats.averageScorePct,
      }
    })
    .sort((a, b) => {
      // Most at-risk first: overdue, then lowest completion.
      if (b.overdue !== a.overdue) return b.overdue - a.overdue
      return (a.completionPct ?? 101) - (b.completionPct ?? 101)
    })
}

/* ────────────────────────────  DISPLAY  ─────────────────────────────── */

export const STATUS_LABEL: Record<ItemStatus, string> = {
  completed: 'Completed',
  overdue: 'Overdue',
  expired: 'Expired',
  in_progress: 'In progress',
  not_started: 'Not started',
}

export const STATUS_TONE: Record<ItemStatus, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> =
  {
    completed: 'success',
    overdue: 'danger',
    expired: 'danger',
    in_progress: 'info',
    not_started: 'neutral',
  }

/** "12 Aug 2026" — one date format across the whole portal. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/**
 * "in 12 days" / "9 days overdue" / "over 2 years overdue".
 *
 * Rolls up beyond 60 days into months and years. Due dates are derived from
 * role start date, so a long-tenured employee with an unvalidated competency
 * would otherwise read as "1509 days overdue" — a precise number that tells
 * nobody anything and makes the whole figure look broken.
 */
export function formatDue(daysRemaining: number): string {
  if (daysRemaining === 0) return 'Due today'
  const n = Math.abs(daysRemaining)
  const scale =
    n <= 60
      ? `${n} ${n === 1 ? 'day' : 'days'}`
      : n < 365
        ? `${Math.round(n / 30)} months`
        : n < 730
          ? 'over a year'
          : `over ${Math.floor(n / 365)} years`
  return daysRemaining > 0 ? `in ${scale}` : `${scale} overdue`
}

/** Competency lookup for detail views. */
export function competencyById(id: string): Competency | undefined {
  return COMPETENCIES.find((c) => c.id === id)
}

/** Required-competency count for a role, without computing a whole plan. */
export function frameworkSize(member: WorkforceMember): number {
  return requirementsForRole(member.departmentSlug, member.level).length
}

/** Evidence rows, re-exported so pages need one import for the plan layer. */
export { evidenceFor }
