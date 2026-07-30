'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  AlertTriangle,
  CalendarClock,
  FileWarning,
  Gauge,
  LineChart,
  ShieldCheck,
  Target,
  Users,
} from 'lucide-react'
import { readinessMix, skillRisk } from '@/lib/role-readiness'
import {
  DEMO_AS_OF,
  cohortFor,
  timeToProficiencyDays,
  wholeWorkforceCohort,
} from '@/data/capability-evidence'
import { DEPARTMENTS, membersOfDepartment } from '@/data/workforce'
import { MAP_FLOWS, stagesOf } from '@/data/process-learning-map'
import {
  CARD,
  CriticalityChip,
  DemoDataNotice,
  KpiTile,
  ReadinessMixBar,
} from '@/components/learning/ReadinessPrimitives'

/**
 * Executive Dashboard (L&D OS spec §13E).
 *
 * Deliberately short: the executive question is not "how much learning
 * happened" but "where can the business not deliver, and who owns fixing it".
 * Learning hours and logins are excluded (§13 — activity, not capability), and
 * business-result trends are withheld until operational KPI mappings are wired
 * (§14 forbids claiming training caused a business result without limitations
 * shown).
 *
 * All numbers come from the same readiness engine as every other view, so
 * drill-down always reconciles (§24).
 */

interface Intervention {
  title: string
  detail: string
  owner: string
  due: string
  status: 'Open' | 'In progress'
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00.000Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export default function ExecutiveDashboard() {
  const cohort = useMemo(() => wholeWorkforceCohort(), [])
  const mix = useMemo(() => readinessMix(cohort), [cohort])
  const risk = useMemo(() => skillRisk(cohort), [cohort])
  const ttp = useMemo(() => timeToProficiencyDays(cohort), [cohort])

  const criticalGapCount = cohort.reduce((n, c) => n + c.verdict.criticalBlockers.length, 0)
  const expiredCritical = cohort.reduce(
    (n, c) => n + c.verdict.expired.filter((r) => r.blocksReadiness).length,
    0,
  )
  const expiryExposure = cohort.reduce(
    (n, c) => n + c.verdict.expired.length + c.verdict.expiringSoon.length,
    0,
  )

  /** Per-department readiness — the §13E comparison view. */
  const byDepartment = useMemo(
    () =>
      DEPARTMENTS.map((dept) => {
        const members = membersOfDepartment(dept.slug)
        const deptCohort = cohortFor(members)
        return {
          dept,
          headcount: members.length,
          mix: readinessMix(deptCohort),
          criticalGaps: deptCohort.reduce((n, c) => n + c.verdict.criticalBlockers.length, 0),
          expired: deptCohort.reduce((n, c) => n + c.verdict.expired.length, 0),
        }
      })
        .filter((d) => d.headcount > 0)
        .sort((a, b) => a.mix.readyPct - b.mix.readyPct),
    [],
  )

  /** Content-health: authored process stages with no linked competencies (§13E). */
  const unlinkedStages = useMemo(() => {
    let unlinked = 0
    let total = 0
    for (const flow of MAP_FLOWS) {
      for (const stage of stagesOf(flow)) {
        total += 1
        if (stage.learning.competencyIds.length === 0) unlinked += 1
      }
    }
    return { unlinked, total }
  }, [])

  /**
   * Priority interventions (§13E): derived from the same computed risks shown
   * above — never hand-typed numbers — each with an accountable owner and a
   * due date. Status moves when the owner acts; nothing here self-completes.
   */
  const interventions = useMemo<Intervention[]>(() => {
    const list: Intervention[] = []
    const pendingFrameworks = DEPARTMENTS.filter(
      (d) => d.frameworkStatus === 'pending' && membersOfDepartment(d.slug).length > 0,
    )
    if (pendingFrameworks.length > 0) {
      list.push({
        title: `Author competency frameworks for ${pendingFrameworks.length} departments`,
        detail: `${pendingFrameworks.map((d) => d.shortName).join(', ')} have staff but no authored role competencies — their readiness is unmeasurable (§7).`,
        owner: 'Department Heads + HR Learning Programme Owner',
        due: addDays(DEMO_AS_OF, 45),
        status: 'In progress',
      })
    }
    const topRisk = risk.filter((r) => r.criticality === 'approved')[0]
    if (topRisk) {
      const dept = DEPARTMENTS.find((d) => d.slug === topRisk.departmentSlug)
      list.push({
        title: `Close the ${topRisk.name} critical gap`,
        detail: `${topRisk.affected} of ${topRisk.applicable} applicable people short — the highest weighted skill risk in the company.`,
        owner: dept ? dept.head : 'Department Head',
        due: addDays(DEMO_AS_OF, 30),
        status: 'Open',
      })
    }
    if (expiredCritical > 0) {
      list.push({
        title: `Recertify ${expiredCritical} expired critical validations`,
        detail:
          'Capability on approved-critical competencies is no longer verified — these gate role readiness until revalidated (§12).',
        owner: 'Reporting Managers, tracked by HR',
        due: addDays(DEMO_AS_OF, 21),
        status: 'Open',
      })
    }
    if (unlinkedStages.unlinked > 0) {
      list.push({
        title: `Link ${unlinkedStages.unlinked} process stages to competencies`,
        detail: `${unlinkedStages.unlinked} of ${unlinkedStages.total} Process Learning Map stages have no linked competencies, so capability against them cannot be measured (§5).`,
        owner: 'Department Learning Champions',
        due: addDays(DEMO_AS_OF, 60),
        status: 'In progress',
      })
    }
    return list
  }, [risk, expiredCritical, unlinkedStages])

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
          <LineChart size={14} /> Executive Dashboard
        </p>
        <h1 className="mt-2 text-2xl md:text-3xl font-semibold text-ink-primary">
          Capability risk, company-wide
        </h1>
        <p className="mt-2 text-sm text-ink-secondary max-w-2xl">
          Where the business cannot yet deliver, and who owns fixing it. Learning hours and logins
          are not shown — they are activity, not capability (§13).
        </p>
      </header>

      <DemoDataNotice />

      {/* ── KPI strip ────────────────────────────────────────────────── */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiTile
          label="Workforce role ready"
          value={`${mix.readyPct}%`}
          sub={`${mix.role_ready} of ${mix.total - mix.no_framework} with a framework`}
          meta={meta(
            'Role-ready employees ÷ employees with an authored competency framework',
            'Executive Sponsor',
          )}
          tone={mix.readyPct >= 70 ? 'good' : mix.readyPct >= 40 ? 'warn' : 'bad'}
          icon={Gauge}
        />
        <KpiTile
          label="Critical skill gaps"
          value={String(criticalGapCount)}
          sub="Approved-critical competencies below required"
          meta={meta(
            'Count of approved-critical competencies below required level, company-wide',
            'Department Heads',
          )}
          tone={criticalGapCount === 0 ? 'good' : 'bad'}
          icon={ShieldCheck}
        />
        <KpiTile
          label="Compliance exposure"
          value={String(expiredCritical)}
          sub="Expired validations on critical competencies"
          meta={meta(
            'Approved-critical competencies whose validation has lapsed — no current verified evidence',
            'HR Learning Programme Owner',
          )}
          tone={expiredCritical === 0 ? 'good' : 'bad'}
          icon={AlertTriangle}
        />
        <KpiTile
          label="Expiry exposure"
          value={String(expiryExposure)}
          sub="All validations expired or expiring in 90 days"
          meta={meta(`Validations expired, or expiring within 90 days of ${DEMO_AS_OF}`, 'HR Learning Programme Owner')}
          tone={expiryExposure === 0 ? 'good' : 'warn'}
          icon={CalendarClock}
        />
        <KpiTile
          label="Time to proficiency"
          value={ttp.median == null ? 'No data' : `${ttp.median}d`}
          sub={ttp.median == null ? 'No role-ready cohort yet' : `Median, n=${ttp.sampleSize}`}
          meta={meta(
            'Median days from role start to role-ready, among role-ready employees',
            'HR Learning Programme Owner',
          )}
          icon={Users}
        />
      </section>

      {/* ── Department comparison ────────────────────────────────────── */}
      <section className={cn(CARD, 'p-5')}>
        <h3 className="text-sm font-semibold text-ink-primary">Readiness by department</h3>
        <p className="text-[11px] text-ink-tertiary mt-0.5 mb-3">
          Least-ready first. A department with no authored framework reports “unmeasurable”, not a
          flattering blank (§24). Detail per department is in the{' '}
          <Link href="/department" className="underline hover:text-ink-primary">
            Department Dashboard
          </Link>
          .
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-xs">
            <thead>
              <tr className="text-left text-ink-tertiary">
                <th className="font-medium py-1.5 pr-3">Department</th>
                <th className="font-medium py-1.5 pr-3 text-right">People</th>
                <th className="font-medium py-1.5 pr-3 w-[34%]">Readiness mix</th>
                <th className="font-medium py-1.5 pr-3 text-right">Ready</th>
                <th className="font-medium py-1.5 pr-3 text-right">Critical gaps</th>
                <th className="font-medium py-1.5 text-right">Expired</th>
              </tr>
            </thead>
            <tbody>
              {byDepartment.map(({ dept, headcount, mix: m, criticalGaps, expired }) => (
                <tr key={dept.slug} className="border-t border-[rgba(0,59,70,0.06)]">
                  <td className="py-2 pr-3 text-ink-primary whitespace-nowrap">{dept.name}</td>
                  <td className="py-2 pr-3 text-right text-ink-secondary">{headcount}</td>
                  <td className="py-2 pr-3">
                    {dept.frameworkStatus === 'pending' ? (
                      <span className="text-[11px] text-ink-tertiary italic">
                        No framework authored — unmeasurable
                      </span>
                    ) : (
                      <ReadinessMixBar mix={m} />
                    )}
                  </td>
                  <td className="py-2 pr-3 text-right text-ink-secondary">
                    {dept.frameworkStatus === 'pending' ? '—' : `${m.readyPct}%`}
                  </td>
                  <td
                    className={cn(
                      'py-2 pr-3 text-right',
                      criticalGaps > 0 ? 'text-surface-rose font-medium' : 'text-ink-secondary',
                    )}
                  >
                    {dept.frameworkStatus === 'pending' ? '—' : criticalGaps}
                  </td>
                  <td className="py-2 text-right text-ink-secondary">
                    {dept.frameworkStatus === 'pending' ? '—' : expired}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Top weighted risks ───────────────────────────────────────── */}
      <section className={cn(CARD, 'p-5')}>
        <h3 className="text-sm font-semibold text-ink-primary">Top capability risks</h3>
        <p className="text-[11px] text-ink-tertiary mt-0.5 mb-3">
          Weighted skill risk = total gap × criticality weight × people affected (§13). The order
          to fix things in.
        </p>
        <div className="space-y-2">
          {risk.slice(0, 8).map((r) => {
            const dept = DEPARTMENTS.find((d) => d.slug === r.departmentSlug)
            return (
              <div
                key={r.competencyId}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-[rgba(0,59,70,0.06)] last:border-0 pb-2 last:pb-0"
              >
                <span className="flex-[1_1_170px] min-w-0">
                  <span className="block text-sm text-ink-primary truncate">
                    {r.name}
                    {dept && <span className="text-ink-tertiary"> · {dept.shortName}</span>}
                  </span>
                  <span className="flex items-center gap-1.5 mt-0.5">
                    <CriticalityChip criticality={r.criticality} />
                    <span className="text-[11px] text-ink-tertiary">
                      {r.affected} of {r.applicable} short · coverage {r.coveragePct}%
                    </span>
                  </span>
                </span>
                <span className="w-24 flex-shrink-0">
                  <span
                    className="block h-2 rounded-full bg-accent-copper"
                    style={{
                      width: `${Math.max(6, Math.round((r.weightedRisk / (risk[0]?.weightedRisk || 1)) * 100))}%`,
                    }}
                  />
                </span>
                <span className="text-xs text-ink-secondary w-8 text-right flex-shrink-0">
                  {r.weightedRisk}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Priority interventions (§13E) ────────────────────────────── */}
      <section className={cn(CARD, 'p-5')}>
        <h3 className="text-sm font-semibold text-ink-primary flex items-center gap-2">
          <Target size={15} className="text-accent-copper" /> Priority interventions
        </h3>
        <p className="text-[11px] text-ink-tertiary mt-0.5 mb-3">
          Derived from the computed risks above — each with an accountable owner and a due date.
          Status changes only when the owner acts.
        </p>
        <div className="space-y-3">
          {interventions.map((item) => (
            <div
              key={item.title}
              className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 border-b border-[rgba(0,59,70,0.06)] last:border-0 pb-3 last:pb-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink-primary">{item.title}</p>
                <p className="text-[11px] text-ink-tertiary mt-0.5">{item.detail}</p>
              </div>
              <div className="flex flex-wrap sm:flex-col items-center sm:items-end gap-2 sm:gap-1 sm:flex-shrink-0">
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-ink-primary text-parchment sm:text-right">
                  {item.owner}
                </span>
                <span className="text-[11px] text-ink-tertiary whitespace-nowrap">
                  Due {item.due} ·{' '}
                  <span
                    className={cn(
                      item.status === 'Open' ? 'text-surface-rose' : 'text-accent-copper',
                    )}
                  >
                    {item.status}
                  </span>
                </span>
              </div>
            </div>
          ))}
          {interventions.length === 0 && (
            <p className="text-sm text-ink-tertiary">No open capability interventions.</p>
          )}
        </div>
      </section>

      {/* ── Business results — honest absence (§14) ──────────────────── */}
      <section className={cn(CARD, 'p-5 border-dashed')}>
        <h3 className="text-sm font-semibold text-ink-primary flex items-center gap-2">
          <FileWarning size={15} className="text-accent-copper" /> Business-result trends
        </h3>
        <p className="text-xs text-ink-secondary mt-1.5 max-w-2xl">
          Not shown yet. Operational KPI mappings (§17 — CRM conversion, first-pass yield, snag
          rates) are not wired to the portal, and §14 forbids presenting a business trend as a
          training outcome without comparison period, sample size, related changes and a
          correlation warning. This panel activates when the integrations land — it will not be
          filled with illustrative numbers.
        </p>
      </section>

      <p className="text-[11px] text-ink-tertiary">
        Capability ratings are developmental. §19: they must not be the sole basis for
        compensation, promotion or disciplinary decisions.
      </p>
    </div>
  )
}
