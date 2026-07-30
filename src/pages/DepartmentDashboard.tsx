'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  Building2,
  CalendarClock,
  ClipboardCheck,
  Filter,
  Gauge,
  Layers,
  ShieldCheck,
  Users,
  Workflow,
} from 'lucide-react'
import { readinessMix, skillRisk } from '@/lib/role-readiness'
import {
  DEMO_AS_OF,
  cohortFor,
  timeToProficiencyDays,
} from '@/data/capability-evidence'
import {
  DEPARTMENTS,
  membersOfDepartment,
  memberById,
  type WorkforceMember,
} from '@/data/workforce'
import { COMPETENCIES } from '@/data/competencies'
import { READINESS_BANKS } from '@/data/readiness-banks'
import { MAP_FLOWS, stagesOf, type MapStage } from '@/data/process-learning-map'
import {
  CARD,
  CriticalityChip,
  DemoDataNotice,
  KpiTile,
  ReadinessMixBar,
} from '@/components/learning/ReadinessPrimitives'

/**
 * Department Head Dashboard (L&D OS spec §13C).
 *
 * The Department Head's questions, in order: how ready is my department, which
 * critical competencies are uncovered, where does capability break against the
 * actual process, and which authored content is missing. Every number is
 * computed from the same readiness engine the Skills Passport and Manager Hub
 * read, so a total here always reconciles with the row-level records there
 * (§24: dashboard totals reconcile with detailed records).
 *
 * Scope: one department at a time (§19). The selector exists for demo review;
 * in live mode a Department Head lands on their own department, with no way to
 * widen it.
 */

/** §13C learning funnel — each stage is a strict subset of the one before. */
interface Funnel {
  assigned: number
  started: number
  knowledgePassed: number
  practicallyVerified: number
  validated: number
}

const FUNNEL_STAGES: { key: keyof Funnel; label: string; note: string }[] = [
  { key: 'assigned', label: 'Assigned', note: 'Required competency instances across the department' },
  { key: 'started', label: 'Evidence started', note: 'At least one evidence channel recorded' },
  { key: 'knowledgePassed', label: 'Knowledge passed', note: 'Knowledge assessment passed (§11)' },
  {
    key: 'practicallyVerified',
    label: 'Practically verified',
    note: 'Assessor-observed competent, where a practical is required (§12)',
  },
  { key: 'validated', label: 'Validated at required', note: 'Lowest evidence ceiling at or above the required level (§7)' },
]

export default function DepartmentDashboard() {
  const [slug, setSlug] = useState('business-development')
  const department = DEPARTMENTS.find((d) => d.slug === slug) ?? DEPARTMENTS[0]
  const members = useMemo(() => membersOfDepartment(department.slug), [department.slug])
  const cohort = useMemo(() => cohortFor(members), [members])
  const mix = useMemo(() => readinessMix(cohort), [cohort])
  const risk = useMemo(() => skillRisk(cohort), [cohort])
  const ttp = useMemo(() => timeToProficiencyDays(cohort), [cohort])

  const criticalGapCount = cohort.reduce((n, c) => n + c.verdict.criticalBlockers.length, 0)
  const practicalsPending = cohort.reduce((n, c) => n + c.verdict.awaitingAssessor.length, 0)
  const expiryExposure = cohort.reduce(
    (n, c) => n + c.verdict.expired.length + c.verdict.expiringSoon.length,
    0,
  )

  /**
   * §13C learning funnel. Built as strict conjunctions so it narrows like a
   * real funnel: a person counted at "practically verified" has also started
   * and passed knowledge. Content-completion (lesson progress) joins this
   * funnel once enrolment tracking is live — it is not invented here.
   */
  const funnel = useMemo<Funnel>(() => {
    const f: Funnel = { assigned: 0, started: 0, knowledgePassed: 0, practicallyVerified: 0, validated: 0 }
    for (const { verdict } of cohort) {
      for (const row of verdict.rows) {
        f.assigned += 1
        const started = row.cappedBy.length > 0 // evidence exists on some channel
        if (!started) continue
        f.started += 1
        const passed = row.ceilings.knowledge >= 4 // knowledge ceiling opens 4 only on a pass
        if (!passed) continue
        f.knowledgePassed += 1
        const practicalOk = row.practicalStatus === 'competent' || row.practicalStatus === 'not_required'
        if (!practicalOk) continue
        f.practicallyVerified += 1
        if (row.gap === 0 && !row.expired) f.validated += 1
      }
    }
    return f
  }, [cohort])

  /** Readiness grouped by role — §13C "readiness by role". */
  const byRole = useMemo(() => {
    const groups = new Map<string, typeof cohort>()
    for (const c of cohort) {
      const list = groups.get(c.member.role) ?? []
      list.push(c)
      groups.set(c.member.role, list)
    }
    return [...groups.entries()]
      .map(([role, list]) => ({ role, mix: readinessMix(list), members: list }))
      .sort((a, b) => a.mix.readyPct - b.mix.readyPct)
  }, [cohort])

  /** Readiness grouped by reporting manager — §13C "by manager". */
  const byManager = useMemo(() => {
    const groups = new Map<string, typeof cohort>()
    for (const c of cohort) {
      if (!c.member.managerId) continue
      const list = groups.get(c.member.managerId) ?? []
      list.push(c)
      groups.set(c.member.managerId, list)
    }
    return [...groups.entries()]
      .map(([managerId, list]) => ({
        manager: memberById(managerId),
        mix: readinessMix(list),
        count: list.length,
      }))
      .filter((g): g is typeof g & { manager: WorkforceMember } => Boolean(g.manager))
      .sort((a, b) => a.mix.readyPct - b.mix.readyPct)
  }, [cohort])

  /**
   * Process-stage capability, grouped. Stages in one phase usually share their
   * competency links (phase-level defaults in the Process Learning Map), so
   * identical rows are collapsed into one entry per (flow, phase, link-set) —
   * eight lead-source stages with the same two competencies read as one line,
   * not eight.
   */
  const processStages = useMemo(() => {
    const deptCompetencyIds = new Set(
      COMPETENCIES.filter((c) => c.departmentSlug === department.slug).map((c) => c.id),
    )
    const groups = new Map<
      string,
      { stage: MapStage; stageCount: number; coveragePct: number | null; linked: number }
    >()
    for (const flow of MAP_FLOWS) {
      for (const stage of stagesOf(flow)) {
        const linkedIds = stage.learning.competencyIds.filter((id) => deptCompetencyIds.has(id))
        if (linkedIds.length === 0) continue
        const key = `${flow.id}:${stage.phaseName}:${[...linkedIds].sort().join(',')}`
        const existing = groups.get(key)
        if (existing) {
          existing.stageCount += 1
          continue
        }
        // Coverage = (member, linked competency) pairs at/above required ÷ pairs.
        let met = 0
        let applicable = 0
        for (const { verdict } of cohort) {
          for (const row of verdict.rows) {
            if (!linkedIds.includes(row.competencyId)) continue
            applicable += 1
            if (row.gap === 0 && !row.expired) met += 1
          }
        }
        groups.set(key, {
          stage,
          stageCount: 1,
          linked: linkedIds.length,
          coveragePct: applicable === 0 ? null : Math.round((met / applicable) * 100),
        })
      }
    }
    return [...groups.values()].sort((a, b) => (a.coveragePct ?? 101) - (b.coveragePct ?? 101))
  }, [cohort, department.slug])

  /** §13C content-coverage gaps — competencies with no authored linkage. */
  const contentGaps = useMemo(() => {
    const linkedAnywhere = new Set<string>()
    for (const flow of MAP_FLOWS) {
      for (const stage of stagesOf(flow)) {
        for (const id of stage.learning.competencyIds) linkedAnywhere.add(id)
      }
    }
    return COMPETENCIES.filter(
      (c) => c.departmentSlug === department.slug && !linkedAnywhere.has(c.id),
    )
  }, [department.slug])

  const bank = READINESS_BANKS[department.slug]

  const meta = (formula: string, owner: string, source = 'Portal competency evidence') => ({
    formula,
    source,
    owner,
    asOf: DEMO_AS_OF,
  })

  return (
    <div className="max-w-5xl mx-auto px-5 py-8 space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-accent-copper flex items-center gap-2">
          <Building2 size={14} /> Department Dashboard
        </p>
        <h1 className="mt-2 text-2xl md:text-3xl font-semibold text-ink-primary">
          Where the department can deliver — and where it cannot yet
        </h1>
        <p className="mt-2 text-sm text-ink-secondary max-w-2xl">
          Verified capability by role, team and process stage, and the authored content still
          missing. Every total here is computed from the same records as the Skills Passport, so
          the numbers reconcile.
        </p>
      </header>

      <DemoDataNotice />

      {/* ── Scope ────────────────────────────────────────────────────── */}
      <section className={cn(CARD, 'p-4 flex flex-col sm:flex-row sm:items-center gap-3')}>
        <label className="text-xs uppercase tracking-wide text-ink-tertiary" htmlFor="dept-select">
          Department
        </label>
        <select
          id="dept-select"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="flex-1 sm:flex-none sm:min-w-[280px] rounded-full bg-[rgba(0,59,70,0.05)] px-4 py-2 text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-accent-copper/40"
        >
          {DEPARTMENTS.map((d) => (
            <option key={d.slug} value={d.slug}>
              {d.name}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-ink-tertiary sm:ml-auto sm:text-right max-w-xs">
          {members.length} {members.length === 1 ? 'person' : 'people'} · Head: {department.head} ·
          Champion: {department.champion}. In live mode a Department Head sees their own department —
          this selector exists for demo review (§19).
        </p>
      </section>

      {department.frameworkStatus === 'pending' && (
        <div className={cn(CARD, 'p-4 border-dashed')}>
          <p className="text-sm text-ink-primary font-medium">
            No competency framework authored for {department.name} yet.
          </p>
          <p className="text-xs text-ink-secondary mt-1">
            Readiness cannot be measured until role competencies exist (§7). This is reported as a
            coverage gap, not filled with invented numbers. Owner: {department.head}, with{' '}
            {department.champion} as Learning Champion.
          </p>
        </div>
      )}

      {/* ── KPI strip ────────────────────────────────────────────────── */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiTile
          label="Role ready"
          value={`${mix.readyPct}%`}
          sub={`${mix.role_ready} of ${mix.total - mix.no_framework} with a framework`}
          meta={meta(
            'Role-ready members ÷ members with an authored competency framework',
            department.head,
          )}
          tone={mix.readyPct >= 70 ? 'good' : mix.readyPct >= 40 ? 'warn' : 'bad'}
          icon={Gauge}
        />
        <KpiTile
          label="Critical gaps"
          value={String(criticalGapCount)}
          sub="Approved-critical competencies below required"
          meta={meta(
            'Count of approved-critical competencies below required level, department-wide',
            department.head,
            'Competency Dictionary + competency policy',
          )}
          tone={criticalGapCount === 0 ? 'good' : 'bad'}
          icon={ShieldCheck}
        />
        <KpiTile
          label="With an assessor"
          value={String(practicalsPending)}
          sub="Practical evidence awaiting a decision"
          meta={meta('Practical observations submitted with no assessor decision', 'Assessor', 'Practical evaluations')}
          tone={practicalsPending === 0 ? 'neutral' : 'warn'}
          icon={ClipboardCheck}
        />
        <KpiTile
          label="Expiry exposure"
          value={String(expiryExposure)}
          sub="Expired, or expiring within 90 days"
          meta={meta(`Validations expired, or expiring within 90 days of ${DEMO_AS_OF}`, department.head)}
          tone={expiryExposure === 0 ? 'good' : 'warn'}
          icon={CalendarClock}
        />
        <KpiTile
          label="Time to proficiency"
          value={ttp.median == null ? 'No data' : `${ttp.median}d`}
          sub={ttp.median == null ? 'Nobody role-ready yet' : `Median, n=${ttp.sampleSize}`}
          meta={meta(
            'Median days from role start to role-ready, among role-ready members',
            'HR Learning Programme Owner',
          )}
          icon={Users}
        />
      </section>

      {/* ── Learning funnel (§13C) ───────────────────────────────────── */}
      <section className={cn(CARD, 'p-5')}>
        <h3 className="text-sm font-semibold text-ink-primary flex items-center gap-2">
          <Filter size={15} className="text-accent-copper" /> Learning funnel
        </h3>
        <p className="text-[11px] text-ink-tertiary mt-0.5 mb-4">
          Each stage is a strict subset of the one before, counted over required competency
          instances (person × competency). Lesson-completion joins the funnel when enrolment
          tracking is live — it is not simulated here.
        </p>
        <div className="space-y-2.5">
          {FUNNEL_STAGES.map(({ key, label, note }) => {
            const value = funnel[key]
            const pct = funnel.assigned === 0 ? 0 : Math.round((value / funnel.assigned) * 100)
            return (
              <div key={key} className="flex items-center gap-2 sm:gap-3">
                <span className="w-[6.5rem] sm:w-40 flex-shrink-0 text-xs text-ink-secondary leading-tight">
                  {label}
                </span>
                <span
                  className="flex-1 min-w-0 h-5 rounded bg-[rgba(0,59,70,0.05)] overflow-hidden"
                  title={note}
                >
                  <span
                    className="block h-full bg-accent-copper/70 rounded"
                    style={{ width: `${Math.max(pct, value > 0 ? 4 : 0)}%` }}
                  />
                </span>
                <span className="w-16 sm:w-20 flex-shrink-0 text-right text-xs text-ink-primary">
                  {value} <span className="text-ink-tertiary">({pct}%)</span>
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Readiness by role and by manager ─────────────────────────── */}
      <section className="grid md:grid-cols-2 gap-4">
        <div className={cn(CARD, 'p-5')}>
          <h3 className="text-sm font-semibold text-ink-primary">Readiness by role</h3>
          <p className="text-[11px] text-ink-tertiary mt-0.5 mb-3">Least-ready roles first.</p>
          <div className="space-y-3">
            {byRole.map(({ role, mix: m }) => (
              <div key={role}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs text-ink-primary truncate">{role}</span>
                  <span className="text-[11px] text-ink-tertiary whitespace-nowrap">
                    {m.role_ready}/{m.total - m.no_framework} ready
                  </span>
                </div>
                <ReadinessMixBar mix={m} className="mt-1" />
              </div>
            ))}
            {byRole.length === 0 && (
              <p className="text-sm text-ink-tertiary">No members in this department.</p>
            )}
          </div>
        </div>
        <div className={cn(CARD, 'p-5')}>
          <h3 className="text-sm font-semibold text-ink-primary">Readiness by manager</h3>
          <p className="text-[11px] text-ink-tertiary mt-0.5 mb-3">
            Direct reports only — the line each manager coaches in the{' '}
            <Link href="/manager" className="underline hover:text-ink-primary">
              Manager Hub
            </Link>
            .
          </p>
          <div className="space-y-3">
            {byManager.map(({ manager, mix: m, count }) => (
              <div key={manager.id}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs text-ink-primary truncate">
                    {manager.name} <span className="text-ink-tertiary">· {count} direct</span>
                  </span>
                  <span className="text-[11px] text-ink-tertiary whitespace-nowrap">
                    {m.role_ready}/{m.total - m.no_framework} ready
                  </span>
                </div>
                <ReadinessMixBar mix={m} className="mt-1" />
              </div>
            ))}
            {byManager.length === 0 && (
              <p className="text-sm text-ink-tertiary">
                Nobody in this department reports to a manager on record.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Critical competency coverage ─────────────────────────────── */}
      <section className={cn(CARD, 'p-5')}>
        <h3 className="text-sm font-semibold text-ink-primary">Critical competency coverage</h3>
        <p className="text-[11px] text-ink-tertiary mt-0.5 mb-3">
          Coverage = members at or above required ÷ applicable members. Ordered by weighted risk
          (gap × criticality × people affected).
        </p>
        <div className="space-y-2">
          {risk
            .filter((r) => r.criticality !== 'unset')
            .slice(0, 8)
            .map((r) => (
              <div
                key={r.competencyId}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-[rgba(0,59,70,0.06)] last:border-0 pb-2 last:pb-0"
              >
                <span className="flex-[1_1_170px] min-w-0">
                  <span className="block text-sm text-ink-primary truncate">{r.name}</span>
                  <span className="flex items-center gap-1.5 mt-0.5">
                    <CriticalityChip criticality={r.criticality} />
                    <span className="text-[11px] text-ink-tertiary">
                      {r.affected} of {r.applicable} short
                    </span>
                  </span>
                </span>
                <span className="w-28 flex-shrink-0">
                  <span className="block h-2 rounded-full bg-[rgba(0,59,70,0.08)] overflow-hidden">
                    <span
                      className={cn(
                        'block h-full rounded-full',
                        r.coveragePct >= 80
                          ? 'bg-surface-sage'
                          : r.coveragePct >= 50
                            ? 'bg-accent-gold'
                            : 'bg-surface-rose',
                      )}
                      style={{ width: `${Math.max(4, r.coveragePct)}%` }}
                    />
                  </span>
                </span>
                <span className="text-xs text-ink-secondary w-10 text-right flex-shrink-0">
                  {r.coveragePct}%
                </span>
              </div>
            ))}
          {risk.filter((r) => r.criticality !== 'unset').length === 0 && (
            <p className="text-sm text-ink-tertiary">
              No critical competencies defined for this department’s roles yet. Owner:{' '}
              {department.head} (§7).
            </p>
          )}
        </div>
      </section>

      {/* ── Process-stage capability heatmap (§13C) ──────────────────── */}
      <section className={cn(CARD, 'p-5')}>
        <h3 className="text-sm font-semibold text-ink-primary flex items-center gap-2">
          <Workflow size={15} className="text-accent-copper" /> Capability against the process
        </h3>
        <p className="text-[11px] text-ink-tertiary mt-0.5 mb-3">
          Process Learning Map stages linked to this department’s competencies, least-covered
          first. Coverage counts (member × linked competency) pairs validated at required.
        </p>
        {processStages.length === 0 ? (
          <p className="text-sm text-ink-tertiary">
            No Process Learning Map stage links to this department’s competencies yet. Linking is
            authored on the{' '}
            <Link href="/process-map" className="underline hover:text-ink-primary">
              Process Learning Map
            </Link>{' '}
            — owner: {department.champion} (§5).
          </p>
        ) : (
          <div className="space-y-2">
            {processStages.slice(0, 10).map(({ stage, stageCount, coveragePct, linked }) => (
              <div
                key={`${stage.flow.id}:${stage.index}`}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-[rgba(0,59,70,0.06)] last:border-0 pb-2 last:pb-0"
              >
                <span className="flex-[1_1_170px] min-w-0">
                  <span className="block text-sm text-ink-primary truncate">
                    {stageCount > 1 ? `${stage.phaseName} (${stageCount} stages)` : stage.step.t}
                  </span>
                  <span className="text-[11px] text-ink-tertiary">
                    {stage.flow.label} · {stage.phaseName} · {linked}{' '}
                    {linked === 1 ? 'competency' : 'competencies'} linked ·{' '}
                    <span
                      className={cn(
                        stage.learning.risk === 'high' ? 'text-surface-rose' : undefined,
                      )}
                    >
                      {stage.learning.risk} risk
                    </span>
                  </span>
                </span>
                <span className="w-28 flex-shrink-0">
                  <span className="block h-2 rounded-full bg-[rgba(0,59,70,0.08)] overflow-hidden">
                    <span
                      className={cn(
                        'block h-full rounded-full',
                        (coveragePct ?? 0) >= 80
                          ? 'bg-surface-sage'
                          : (coveragePct ?? 0) >= 50
                            ? 'bg-accent-gold'
                            : 'bg-surface-rose',
                      )}
                      style={{ width: `${Math.max(4, coveragePct ?? 0)}%` }}
                    />
                  </span>
                </span>
                <span className="text-xs text-ink-secondary w-10 text-right flex-shrink-0">
                  {coveragePct == null ? '—' : `${coveragePct}%`}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Content coverage gaps (§13C) ─────────────────────────────── */}
      <section className={cn(CARD, 'p-5')}>
        <h3 className="text-sm font-semibold text-ink-primary flex items-center gap-2">
          <Layers size={15} className="text-accent-copper" /> Authoring gaps
        </h3>
        <p className="text-[11px] text-ink-tertiary mt-0.5 mb-3">
          Competencies without authored learning or assessment cannot be closed by assigning more
          of what does not exist (§13C). Owner: {department.champion}, approved by{' '}
          {department.head}.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-ink-primary">
              Not linked to any process stage ({contentGaps.length})
            </p>
            {contentGaps.length === 0 ? (
              <p className="text-xs text-ink-tertiary mt-1.5">
                {department.frameworkStatus === 'pending'
                  ? 'No competencies exist for this department yet — the framework itself is the gap (§7).'
                  : 'Every competency in this department is linked to at least one Process Learning Map stage.'}
              </p>
            ) : (
              <ul className="mt-1.5 space-y-1">
                {contentGaps.slice(0, 8).map((c) => (
                  <li key={c.id} className="text-xs text-ink-secondary">
                    {c.name}
                  </li>
                ))}
                {contentGaps.length > 8 && (
                  <li className="text-[11px] text-ink-tertiary">
                    + {contentGaps.length - 8} more
                  </li>
                )}
              </ul>
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-ink-primary">Diagnostic question bank</p>
            {bank ? (
              <p className="text-xs text-ink-secondary mt-1.5">
                {bank.questions.length} questions authored for the {bank.academyName} academy, with{' '}
                {bank.lessonMap.filter((l) => l.recommendedLesson).length} of{' '}
                {bank.lessonMap.length} competency tags linked to a lesson.
              </p>
            ) : (
              <p className="text-xs text-ink-secondary mt-1.5">
                No diagnostic bank authored for this academy yet (§11). Assessments for these roles
                cannot run until one exists — this is an authoring gap, not a learner gap.
              </p>
            )}
          </div>
        </div>
      </section>

      <p className="text-[11px] text-ink-tertiary">
        Capability ratings here are developmental. §19: they must not be the sole basis for
        compensation, promotion or disciplinary decisions. Row-level detail is in the{' '}
        <Link href="/manager" className="underline hover:text-ink-primary">
          Manager Hub
        </Link>{' '}
        and each person’s{' '}
        <Link href="/skills-passport" className="underline hover:text-ink-primary">
          Skills Passport
        </Link>
        .
      </p>
    </div>
  )
}
