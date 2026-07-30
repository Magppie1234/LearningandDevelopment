'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  BookOpenCheck,
  CalendarClock,
  ClipboardList,
  FileClock,
  Gauge,
  Languages,
  PlugZap,
  UserX,
  Users,
} from 'lucide-react'
import { readinessMix } from '@/lib/role-readiness'
import {
  DEMO_AS_OF,
  cohortFor,
  onboardingDay,
  timeToProficiencyDays,
  wholeWorkforceCohort,
} from '@/data/capability-evidence'
import {
  DEPARTMENTS,
  WORKFORCE,
  daysBetween,
  membersOfDepartment,
  memberById,
} from '@/data/workforce'
import { COMPETENCIES } from '@/data/competencies'
import { READINESS_BANKS } from '@/data/readiness-banks'
import { MAP_FLOWS, stagesOf } from '@/data/process-learning-map'
import { documents } from '@/data/knowledge'
import {
  CARD,
  CriticalityChip,
  DemoDataNotice,
  KpiTile,
  ReadinessMixBar,
} from '@/components/learning/ReadinessPrimitives'

/**
 * HR / L&D Control Centre (L&D OS spec §13D).
 *
 * The HR Learning Programme Owner's operating console: is everyone mapped,
 * who is overdue, which cohorts are on plan, which Learning Champions are
 * overloaded, and which content is stale. Where a §13D feed is not yet
 * instrumented (integrations, search gaps, translations) the panel says so
 * instead of showing simulated numbers — §24 forbids demo data posing as
 * operational data.
 */

/**
 * Content review SLA baseline. Sample – Requires SME Approval: the Governance
 * page owns the approved cadence; 365 days is the §10 starting point.
 */
const REVIEW_SLA_DAYS = 365

export default function HrControlCentre() {
  const cohort = useMemo(() => wholeWorkforceCohort(), [])
  const ttp = useMemo(() => timeToProficiencyDays(cohort), [cohort])

  /** §13D: unmapped employees — staff in departments with no authored framework. */
  const unmapped = useMemo(
    () =>
      WORKFORCE.filter(
        (m) =>
          DEPARTMENTS.find((d) => d.slug === m.departmentSlug)?.frameworkStatus === 'pending',
      ),
    [],
  )
  const mappedCohort = useMemo(
    () => cohort.filter((c) => c.verdict.status !== 'no_framework'),
    [cohort],
  )

  /** People whose approved-critical validations are all current. */
  const compliant = useMemo(
    () =>
      mappedCohort.filter(
        (c) => !c.verdict.expired.some((r) => r.blocksReadiness) && c.verdict.criticalBlockers.length === 0,
      ),
    [mappedCohort],
  )

  /** Overdue recertifications, most critical first. */
  const overdue = useMemo(() => {
    const rows: {
      memberId: string
      name: string
      role: string
      competency: string
      criticality: 'approved' | 'proposed' | 'unset'
      dueOn: string
      daysOverdue: number
      owner: string
    }[] = []
    for (const { member, verdict } of cohort) {
      for (const r of verdict.expired) {
        rows.push({
          memberId: member.id,
          name: member.name,
          role: member.role,
          competency: r.name,
          criticality: r.criticality,
          dueOn: r.nextValidationOn ?? '—',
          daysOverdue: r.nextValidationOn ? daysBetween(r.nextValidationOn, DEMO_AS_OF) : 0,
          owner: memberById(member.managerId)?.name ?? 'Department Head',
        })
      }
    }
    const weight = { approved: 0, proposed: 1, unset: 2 } as const
    return rows.sort(
      (a, b) => weight[a.criticality] - weight[b.criticality] || b.daysOverdue - a.daysOverdue,
    )
  }, [cohort])

  /** Onboarding cohorts (§13D) — grouped by intake, on-plan by construction. */
  const intakes = useMemo(() => {
    const groups = new Map<string, typeof cohort>()
    for (const c of cohort) {
      if (!c.member.cohort) continue
      const list = groups.get(c.member.cohort) ?? []
      list.push(c)
      groups.set(c.member.cohort, list)
    }
    return [...groups.entries()]
      .map(([intake, list]) => ({
        intake,
        // Chronological by the cohort's earliest joining date — the label
        // ("May 2026 intake") does not sort correctly as a string.
        startedOn: list.reduce((min, c) => (c.member.joinedOn < min ? c.member.joinedOn : min), '9999'),
        mix: readinessMix(list),
        members: list.map((c) => ({
          ...c,
          day: onboardingDay(c.member),
        })),
      }))
      .sort((a, b) => a.startedOn.localeCompare(b.startedOn))
  }, [cohort])

  /** Learning Champion workload (§13D): people + authoring debt per champion. */
  const championLoad = useMemo(() => {
    const linkedAnywhere = new Set<string>()
    for (const flow of MAP_FLOWS) {
      for (const stage of stagesOf(flow)) {
        for (const id of stage.learning.competencyIds) linkedAnywhere.add(id)
      }
    }
    return DEPARTMENTS.map((dept) => {
      const members = membersOfDepartment(dept.slug)
      const deptCompetencies = COMPETENCIES.filter((c) => c.departmentSlug === dept.slug)
      const unlinked = deptCompetencies.filter((c) => !linkedAnywhere.has(c.id)).length
      const noBank = !READINESS_BANKS[dept.slug]
      // Workload = people served + competencies still to link + a flat load for
      // a missing bank or framework. A ranking heuristic, not a KPI — labelled
      // as such in the UI.
      const load =
        members.length +
        unlinked * 2 +
        (noBank ? 4 : 0) +
        (dept.frameworkStatus === 'pending' ? 6 : 0)
      return { dept, members: members.length, unlinked, noBank, load }
    })
      .filter((c) => c.members > 0)
      .sort((a, b) => b.load - a.load)
  }, [])

  /** Content freshness (§13 formula) from knowledge-document review dates. */
  const freshness = useMemo(() => {
    const active = documents.length
    const fresh = documents.filter((d) => daysBetween(d.updatedAt, DEMO_AS_OF) <= REVIEW_SLA_DAYS)
    const stale = documents
      .map((d) => ({ doc: d, age: daysBetween(d.updatedAt, DEMO_AS_OF) }))
      .filter((x) => x.age > REVIEW_SLA_DAYS)
      .sort((a, b) => b.age - a.age)
    return { active, freshCount: fresh.length, stale }
  }, [])

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
          <ClipboardList size={14} /> HR / L&D Control Centre
        </p>
        <h1 className="mt-2 text-2xl md:text-3xl font-semibold text-ink-primary">
          The learning operation, end to end
        </h1>
        <p className="mt-2 text-sm text-ink-secondary max-w-2xl">
          Coverage, escalations, cohorts, champion workload and content health — the console the
          HR Learning Programme Owner runs the system from (§4). Panels whose data feed is not yet
          wired say so; nothing here is simulated.
        </p>
      </header>

      <DemoDataNotice />

      {/* ── KPI strip ────────────────────────────────────────────────── */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiTile
          label="Employees mapped"
          value={`${WORKFORCE.length - unmapped.length}/${WORKFORCE.length}`}
          sub="Have a role competency framework"
          meta={meta(
            'Employees in departments with an authored framework ÷ all employees',
            'HR Learning Programme Owner',
            'Workforce registry + Competency Dictionary',
          )}
          tone={unmapped.length === 0 ? 'good' : 'warn'}
          icon={Users}
        />
        <KpiTile
          label="Critical compliance"
          value={
            mappedCohort.length === 0
              ? '—'
              : `${Math.round((compliant.length / mappedCohort.length) * 100)}%`
          }
          sub={`${compliant.length} of ${mappedCohort.length} with all critical validations current`}
          meta={meta(
            'Employees with no approved-critical gap and no expired critical validation ÷ employees with a framework',
            'HR Learning Programme Owner',
          )}
          tone={compliant.length === mappedCohort.length ? 'good' : 'warn'}
          icon={Gauge}
        />
        <KpiTile
          label="Overdue revalidations"
          value={String(overdue.length)}
          sub="Validations past their revalidation date"
          meta={meta(
            `Validations whose next-validation date is before ${DEMO_AS_OF}`,
            'Reporting Managers, escalated by HR',
          )}
          tone={overdue.length === 0 ? 'good' : 'bad'}
          icon={CalendarClock}
        />
        <KpiTile
          label="Content freshness"
          value={
            freshness.active === 0
              ? '—'
              : `${Math.round((freshness.freshCount / freshness.active) * 100)}%`
          }
          sub={`${freshness.freshCount} of ${freshness.active} documents inside the review SLA`}
          meta={meta(
            `Active documents reviewed within ${REVIEW_SLA_DAYS} days ÷ active documents. SLA baseline is Sample – Requires SME Approval (§10)`,
            'Department Learning Champions',
            'Knowledge Hub document registry',
          )}
          tone={freshness.freshCount === freshness.active ? 'good' : 'warn'}
          icon={BookOpenCheck}
        />
        <KpiTile
          label="Time to proficiency"
          value={ttp.median == null ? 'No data' : `${ttp.median}d`}
          sub={ttp.median == null ? 'No role-ready cohort yet' : `Median, n=${ttp.sampleSize}`}
          meta={meta(
            'Median days from role start to role-ready, among role-ready employees',
            'HR Learning Programme Owner',
          )}
          icon={FileClock}
        />
      </section>

      {/* ── Unmapped employees (§13D) ────────────────────────────────── */}
      <section className={cn(CARD, 'p-5')}>
        <h3 className="text-sm font-semibold text-ink-primary flex items-center gap-2">
          <UserX size={15} className="text-accent-copper" /> Unmapped employees
        </h3>
        <p className="text-[11px] text-ink-tertiary mt-0.5 mb-3">
          Staff whose department has no authored competency framework — they cannot be assigned a
          role path, assessed or certified until it exists (§7). Fixing the framework fixes every
          person in it.
        </p>
        {unmapped.length === 0 ? (
          <p className="text-sm text-ink-tertiary">Every employee has a role framework.</p>
        ) : (
          <div className="space-y-1.5">
            {unmapped.map((m) => {
              const dept = DEPARTMENTS.find((d) => d.slug === m.departmentSlug)
              return (
                <div
                  key={m.id}
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-xs border-b border-[rgba(0,59,70,0.06)] last:border-0 pb-1.5 last:pb-0"
                >
                  <span className="text-ink-primary">{m.name}</span>
                  <span className="text-ink-tertiary">{m.role}</span>
                  <span className="ml-auto text-ink-tertiary">
                    {dept?.name} — owner: {dept?.head}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── Overdue & escalations ────────────────────────────────────── */}
      <section className={cn(CARD, 'p-5')}>
        <h3 className="text-sm font-semibold text-ink-primary">Overdue revalidations</h3>
        <p className="text-[11px] text-ink-tertiary mt-0.5 mb-3">
          Most critical and longest-overdue first. The escalation path is reporting manager →
          Department Head → HR (§4); recording a chase never changes a score (§19).
        </p>
        {overdue.length === 0 ? (
          <p className="text-sm text-ink-tertiary">Nothing is overdue.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-xs">
              <thead>
                <tr className="text-left text-ink-tertiary">
                  <th className="font-medium py-1.5 pr-3">Employee</th>
                  <th className="font-medium py-1.5 pr-3">Competency</th>
                  <th className="font-medium py-1.5 pr-3">Criticality</th>
                  <th className="font-medium py-1.5 pr-3 text-right">Due</th>
                  <th className="font-medium py-1.5 pr-3 text-right">Days over</th>
                  <th className="font-medium py-1.5">Chase owner</th>
                </tr>
              </thead>
              <tbody>
                {overdue.slice(0, 12).map((r) => (
                  <tr
                    key={`${r.memberId}:${r.competency}`}
                    className="border-t border-[rgba(0,59,70,0.06)]"
                  >
                    <td className="py-2 pr-3 text-ink-primary whitespace-nowrap">
                      {r.name} <span className="text-ink-tertiary">· {r.role}</span>
                    </td>
                    <td className="py-2 pr-3 text-ink-secondary">{r.competency}</td>
                    <td className="py-2 pr-3">
                      <CriticalityChip criticality={r.criticality} />
                    </td>
                    <td className="py-2 pr-3 text-right text-ink-secondary whitespace-nowrap">
                      {r.dueOn}
                    </td>
                    <td
                      className={cn(
                        'py-2 pr-3 text-right',
                        r.daysOverdue > 90 ? 'text-surface-rose font-medium' : 'text-ink-secondary',
                      )}
                    >
                      {r.daysOverdue}
                    </td>
                    <td className="py-2 text-ink-secondary whitespace-nowrap">{r.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {overdue.length > 12 && (
              <p className="mt-2 text-[11px] text-ink-tertiary text-center">
                Showing the 12 most urgent of {overdue.length}.
              </p>
            )}
          </div>
        )}
      </section>

      {/* ── Onboarding cohorts (§13D) ────────────────────────────────── */}
      <section className={cn(CARD, 'p-5')}>
        <h3 className="text-sm font-semibold text-ink-primary">Onboarding cohorts</h3>
        <p className="text-[11px] text-ink-tertiary mt-0.5 mb-3">
          Intake groups inside or recently out of the 0/30/60/90-day plan (§20). A new joiner who
          is not yet role-ready is on plan — the day counter says which review is next.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          {intakes.map(({ intake, mix, members }) => (
            <div key={intake} className="rounded-xl bg-[rgba(0,59,70,0.03)] p-4">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-medium text-ink-primary">{intake}</p>
                <p className="text-[11px] text-ink-tertiary">
                  {mix.role_ready}/{mix.total - mix.no_framework} ready
                </p>
              </div>
              <ReadinessMixBar mix={mix} className="mt-2" />
              <ul className="mt-2.5 space-y-1">
                {members.map(({ member, verdict, day }) => (
                  <li key={member.id} className="flex flex-wrap items-baseline gap-x-2 text-xs">
                    <span className="text-ink-primary">{member.name}</span>
                    <span className="text-ink-tertiary">{member.role}</span>
                    <span className="ml-auto text-ink-tertiary">
                      {day != null ? `day ${day} of 90` : 'past day 90'} · {verdict.coveragePct}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {intakes.length === 0 && (
            <p className="text-sm text-ink-tertiary">No intake cohorts on record.</p>
          )}
        </div>
      </section>

      {/* ── Champion workload (§13D) ─────────────────────────────────── */}
      <section className={cn(CARD, 'p-5')}>
        <h3 className="text-sm font-semibold text-ink-primary">Learning Champion workload</h3>
        <p className="text-[11px] text-ink-tertiary mt-0.5 mb-3">
          People served plus authoring debt (unlinked competencies, missing question bank, missing
          framework). A ranking heuristic to balance load — not a performance score (§19).
        </p>
        <div className="space-y-2">
          {championLoad.slice(0, 8).map(({ dept, members, unlinked, noBank, load }) => (
            <div
              key={dept.slug}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-[rgba(0,59,70,0.06)] last:border-0 pb-2 last:pb-0"
            >
              <span className="flex-[1_1_170px] min-w-0">
                <span className="block text-sm text-ink-primary truncate">
                  {dept.champion} <span className="text-ink-tertiary">· {dept.shortName}</span>
                </span>
                <span className="text-[11px] text-ink-tertiary">
                  {members} {members === 1 ? 'person' : 'people'}
                  {dept.frameworkStatus === 'pending' && ' · framework not authored'}
                  {unlinked > 0 && ` · ${unlinked} competencies unlinked`}
                  {noBank && dept.frameworkStatus === 'built' && ' · no question bank'}
                </span>
              </span>
              <span className="w-24 flex-shrink-0">
                <span
                  className="block h-2 rounded-full bg-accent-copper"
                  style={{
                    width: `${Math.max(8, Math.round((load / (championLoad[0]?.load || 1)) * 100))}%`,
                  }}
                />
              </span>
              <span className="text-xs text-ink-secondary w-8 text-right flex-shrink-0">{load}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Content due for review ───────────────────────────────────── */}
      <section className={cn(CARD, 'p-5')}>
        <h3 className="text-sm font-semibold text-ink-primary">Content due for review</h3>
        <p className="text-[11px] text-ink-tertiary mt-0.5 mb-3">
          Knowledge Hub documents past the {REVIEW_SLA_DAYS}-day review SLA, oldest first. Stale
          guidance is a §10 risk: it keeps being followed until it is re-approved or retired.
        </p>
        {freshness.stale.length === 0 ? (
          <p className="text-sm text-ink-tertiary">Everything is inside its review window.</p>
        ) : (
          <div className="space-y-1.5">
            {freshness.stale.slice(0, 6).map(({ doc, age }) => (
              <div
                key={doc.id}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-xs border-b border-[rgba(0,59,70,0.06)] last:border-0 pb-1.5 last:pb-0"
              >
                <span className="text-ink-primary min-w-0 flex-[1_1_200px] truncate">
                  {doc.title}
                </span>
                <span className="text-ink-tertiary">{doc.department}</span>
                <span className="ml-auto text-ink-tertiary whitespace-nowrap">
                  updated {doc.updatedAt} · {age} days ago
                </span>
              </div>
            ))}
            {freshness.stale.length > 6 && (
              <p className="text-[11px] text-ink-tertiary text-center pt-1">
                + {freshness.stale.length - 6} more in the{' '}
                <Link href="/knowledge" className="underline hover:text-ink-primary">
                  Knowledge Center
                </Link>
              </p>
            )}
          </div>
        )}
      </section>

      {/* ── Not yet instrumented — honest empty states (§24) ─────────── */}
      <section className="grid md:grid-cols-2 gap-4">
        <div className={cn(CARD, 'p-5 border-dashed')}>
          <h3 className="text-sm font-semibold text-ink-primary flex items-center gap-2">
            <PlugZap size={15} className="text-accent-copper" /> Data syncs
          </h3>
          <p className="text-xs text-ink-secondary mt-1.5">
            No integrations are wired yet (§17): HRMS employee import, Zoho CRM, telephony and the
            factory systems are pending. Sync failures and unmapped-record alerts surface here once
            they run — this panel will not show simulated sync health.
          </p>
        </div>
        <div className={cn(CARD, 'p-5 border-dashed')}>
          <h3 className="text-sm font-semibold text-ink-primary flex items-center gap-2">
            <Languages size={15} className="text-accent-copper" /> Translation & search gaps
          </h3>
          <p className="text-xs text-ink-secondary mt-1.5">
            Content is English-only; the Hindi track (§18) has not started, so translation status
            is 0 of {freshness.active} documents — a backlog, not a bug. Repeated-search-failure
            logging activates with AI-assistant telemetry and is not simulated.
          </p>
        </div>
      </section>

      <p className="text-[11px] text-ink-tertiary">
        Capability ratings are developmental. §19: they must not be the sole basis for
        compensation, promotion or disciplinary decisions. Cohort detail is in the{' '}
        <Link href="/manager" className="underline hover:text-ink-primary">
          Manager Hub
        </Link>{' '}
        and{' '}
        <Link href="/department" className="underline hover:text-ink-primary">
          Department Dashboard
        </Link>
        .
      </p>
    </div>
  )
}
