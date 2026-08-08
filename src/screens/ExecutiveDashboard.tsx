'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  FileWarning,
  ShieldAlert,
  TrendingDown,
  Users,
} from 'lucide-react'
import {
  Button,
  ChartFrame,
  CompareBars,
  DataTable,
  Drawer,
  Empty,
  FilterBar,
  Kpi,
  KpiGrid,
  Legend,
  Notice,
  PageHeader,
  Section,
  StackedBar,
  StatusBadge,
  type Column,
  type FilterValues,
} from '@/components/ds'
import {
  assessmentStats,
  formatDate,
  rosterFor,
  summarise,
  type RosterRow,
} from '@/lib/learning-plan'
import { DEMO_AS_OF, cohortFor, timeToProficiencyDays } from '@/data/capability-evidence'
import { READINESS_LABEL, readinessMix, skillRisk } from '@/lib/role-readiness'
import { DEPARTMENTS, WORKFORCE, membersOfDepartment } from '@/data/workforce'
import { criticalityOf } from '@/data/competency-policy'
import { cn } from '@/lib/utils'

/**
 * Management Analytics — the one screen leadership reads in 30 seconds.
 *
 * Ordered strictly by the dashboard hierarchy: what needs attention, then the
 * headline position, then where the risk sits, then what caused it, then the
 * action queue with a named owner for every entry.
 *
 * Two rules this page holds to. First, an unmeasurable department reports
 * "unmeasurable" — a department with no authored competency framework is an
 * authoring gap, not a 0% learning result, and averaging it in would hide the
 * real problem behind a softer one. Second, no metric is shown that the portal
 * cannot currently compute: monthly trend and training ROI need historical
 * snapshots and cost data that do not exist yet, so they carry an honest empty
 * state naming the missing input rather than a plausible invented line.
 */

type DeptRow = {
  slug: string
  name: string
  people: number
  hasFramework: boolean
  readyPct: number | null
  completionPct: number | null
  compliancePct: number | null
  overduePeople: number
  overdueItems: number
  expiring: number
  criticalGaps: number
  notAssessed: number
}

const EMPTY_FILTERS: FilterValues = { framework: 'all', location: 'all' }

export default function ExecutiveDashboard() {
  const [filters, setFilters] = useState<FilterValues>(EMPTY_FILTERS)
  const [detail, setDetail] = useState<DeptRow | null>(null)

  const scoped = useMemo(
    () =>
      WORKFORCE.filter(
        (m) => filters.location === 'all' || m.location === filters.location,
      ),
    [filters.location],
  )

  const summary = useMemo(() => summarise(scoped, DEMO_AS_OF), [scoped])
  const assess = useMemo(() => assessmentStats(scoped, DEMO_AS_OF), [scoped])
  const cohort = useMemo(() => cohortFor(scoped, DEMO_AS_OF), [scoped])
  const readiness = useMemo(() => readinessMix(cohort), [cohort])
  const ttp = useMemo(() => timeToProficiencyDays(cohort), [cohort])
  const risks = useMemo(() => skillRisk(cohort), [cohort])

  const deptRows = useMemo<DeptRow[]>(() => {
    return DEPARTMENTS.map((d) => {
      const people = membersOfDepartment(d.slug).filter((m) =>
        filters.location === 'all' ? true : m.location === filters.location,
      )
      if (people.length === 0) {
        return {
          slug: d.slug,
          name: d.name,
          people: 0,
          hasFramework: d.frameworkStatus === 'built',
          readyPct: null,
          completionPct: null,
          compliancePct: null,
          overduePeople: 0,
          overdueItems: 0,
          expiring: 0,
          criticalGaps: 0,
          notAssessed: 0,
        }
      }
      const s = summarise(people, DEMO_AS_OF)
      const mix = readinessMix(cohortFor(people, DEMO_AS_OF))
      const built = d.frameworkStatus === 'built' && s.noFramework < people.length
      const criticalGaps = cohortFor(people, DEMO_AS_OF).reduce(
        (n, c) => n + c.verdict.criticalBlockers.length,
        0,
      )
      return {
        slug: d.slug,
        name: d.name,
        people: people.length,
        hasFramework: built,
        readyPct: built ? mix.readyPct : null,
        completionPct: built ? s.completionPct : null,
        compliancePct: built ? s.compliancePct : null,
        overduePeople: s.withOverdue,
        overdueItems: s.totalOverdueItems,
        expiring: s.expiringSoonItems,
        criticalGaps,
        notAssessed: mix.not_assessed,
      }
    })
      .filter((r) => (filters.framework === 'pending' ? !r.hasFramework : true))
      .filter((r) => (filters.framework === 'built' ? r.hasFramework : true))
      .sort((a, b) => {
        // Least ready first — the point of the table is to surface risk.
        if (a.readyPct == null && b.readyPct == null) return b.people - a.people
        if (a.readyPct == null) return -1
        if (b.readyPct == null) return 1
        return a.readyPct - b.readyPct
      })
  }, [filters])

  const unmeasurable = deptRows.filter((r) => !r.hasFramework && r.people > 0)
  const highRisk = deptRows.filter((r) => r.readyPct != null && r.readyPct < 50 && r.people > 0)
  const criticalRisks = risks.filter((r) => criticalityOf(r.competencyId) === 'approved' && r.affected > 0)

  const locations = [...new Set(WORKFORCE.map((m) => m.location))]

  const columns: Column<DeptRow>[] = [
    {
      key: 'name',
      header: 'Department',
      sortable: true,
      value: (r) => r.name,
      cell: (r) => (
        <span className="flex flex-col gap-0.5">
          <span className="font-medium text-ink-primary">{r.name}</span>
          {!r.hasFramework && (
            <span className="text-[11px] text-warning-fg">No framework authored</span>
          )}
        </span>
      ),
    },
    {
      key: 'people',
      header: 'People',
      sortable: true,
      align: 'right',
      nowrap: true,
      value: (r) => r.people,
      cell: (r) => <span className="tnum text-ink-secondary">{r.people}</span>,
    },
    {
      key: 'ready',
      header: 'Role ready',
      sortable: true,
      width: 'w-[150px]',
      value: (r) => r.readyPct,
      cell: (r) =>
        r.readyPct == null ? (
          <span className="text-[11px] text-ink-tertiary italic">Unmeasurable</span>
        ) : (
          <span className="flex items-center gap-2">
            <span className="flex-1 h-1.5 rounded-full bg-[rgb(var(--rule)/0.1)] overflow-hidden">
              <span
                className={cn(
                  'block h-full rounded-full',
                  r.readyPct >= 70 ? 'bg-success' : r.readyPct >= 40 ? 'bg-warning' : 'bg-danger',
                )}
                style={{ width: `${r.readyPct}%` }}
              />
            </span>
            <span className="text-[12px] tnum text-ink-secondary w-9 text-right">{r.readyPct}%</span>
          </span>
        ),
    },
    {
      key: 'compliance',
      header: 'Mandatory',
      sortable: true,
      align: 'right',
      nowrap: true,
      value: (r) => r.compliancePct,
      cell: (r) =>
        r.compliancePct == null ? (
          <span className="text-[11px] text-ink-tertiary">—</span>
        ) : (
          <span
            className={cn(
              'text-[12px] font-medium tnum',
              r.compliancePct === 100 ? 'text-success-fg' : 'text-danger-fg',
            )}
          >
            {r.compliancePct}%
          </span>
        ),
    },
    {
      key: 'critical',
      header: 'Critical gaps',
      sortable: true,
      align: 'right',
      nowrap: true,
      value: (r) => r.criticalGaps,
      cell: (r) => (
        <span className={cn('text-[12px] tnum', r.criticalGaps > 0 ? 'text-danger-fg font-semibold' : 'text-ink-tertiary')}>
          {r.criticalGaps}
        </span>
      ),
    },
    {
      key: 'overdue',
      header: 'Overdue',
      sortable: true,
      align: 'right',
      nowrap: true,
      secondary: true,
      value: (r) => r.overdueItems,
      cell: (r) => <span className="text-[12px] tnum text-ink-secondary">{r.overdueItems}</span>,
    },
    {
      key: 'expiring',
      header: 'Expiring 90d',
      sortable: true,
      align: 'right',
      nowrap: true,
      secondary: true,
      value: (r) => r.expiring,
      cell: (r) => <span className="text-[12px] tnum text-ink-secondary">{r.expiring}</span>,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Capability risk, company-wide"
        description="Where the business cannot yet deliver, who owns fixing it, and what to decide this month. Learning hours and logins are deliberately not shown — they measure activity, not capability."
        actions={
          <Button href="/analytics" icon={ArrowRight}>
            Detailed reports
          </Button>
        }
      >
        <FilterBar
          filters={[
            {
              id: 'framework',
              label: 'Framework',
              allLabel: 'All departments',
              options: [
                { value: 'built', label: 'Framework authored' },
                { value: 'pending', label: 'Framework pending' },
              ],
            },
            {
              id: 'location',
              label: 'Location',
              options: locations.map((l) => ({
                value: l,
                label: l,
                count: WORKFORCE.filter((m) => m.location === l).length,
              })),
            },
          ]}
          values={filters}
          onChange={setFilters}
          onReset={() => setFilters(EMPTY_FILTERS)}
          scopeNote={`${scoped.length} people across ${DEPARTMENTS.length} departments`}
          lastRefreshed={formatDate(DEMO_AS_OF)}
        />
      </PageHeader>

      {/* 1 — What requires attention, in priority order. */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {criticalRisks.length > 0 && (
          <Notice tone="danger" icon={ShieldAlert}>
            <strong>{criticalRisks.length} approved-critical competencies are short.</strong> These
            hard-gate role readiness. Worst:{' '}
            <strong>{criticalRisks[0].name}</strong> — {criticalRisks[0].affected} of{' '}
            {criticalRisks[0].applicable} people below required.
          </Notice>
        )}
        {unmeasurable.length > 0 && (
          <Notice tone="warning" icon={FileWarning}>
            <strong>
              {unmeasurable.length} departments cannot be measured at all
            </strong>{' '}
            ({unmeasurable.reduce((n, d) => n + d.people, 0)} people). No competency framework has
            been authored, so no risk figure for them is real. This is an authoring decision, not a
            learning result.
          </Notice>
        )}
        {highRisk.length > 0 && (
          <Notice tone="danger" icon={TrendingDown}>
            <strong>{highRisk.length} departments are below 50% role ready.</strong> Least ready:{' '}
            {highRisk
              .slice(0, 2)
              .map((d) => `${d.name} (${d.readyPct}%)`)
              .join(', ')}
            .
          </Notice>
        )}
      </div>

      {/* 2 — The headline position. Five numbers, no more. */}
      <KpiGrid columns={5}>
        <Kpi
          label="Workforce role ready"
          value={`${readiness.readyPct}%`}
          caption={`${readiness.role_ready} of ${readiness.total - readiness.no_framework} people with a framework`}
          target="80%"
          tone={readiness.readyPct >= 80 ? 'success' : readiness.readyPct >= 50 ? 'warning' : 'danger'}
          statusLabel={readiness.readyPct >= 80 ? 'At target' : 'Below target'}
          icon={Users}
          href="/analytics"
          definition={{
            formula:
              'People whose every required competency is validated at or above target ÷ people whose department has an authored framework. Departments without a framework are excluded from the denominator.',
            source: 'Competency framework + evidence across four validation channels',
            owner: 'Head of L&D',
          }}
        />
        <Kpi
          label="Mandatory compliance"
          value={summary.compliancePct == null ? '—' : `${summary.compliancePct}%`}
          caption="Approved-critical competencies validated"
          target="100%"
          tone={summary.compliancePct === 100 ? 'success' : 'danger'}
          statusLabel={summary.compliancePct === 100 ? 'Compliant' : 'Non-compliant'}
          icon={ClipboardCheck}
          definition={{
            formula:
              'Approved-critical competencies validated ÷ approved-critical competencies required, company-wide',
            source: 'Competency policy (approved-critical list) + evidence',
            owner: 'Department Heads',
          }}
        />
        <Kpi
          label="Critical skill gaps"
          value={String(criticalRisks.length)}
          caption="Approved-critical competencies below required"
          tone={criticalRisks.length === 0 ? 'success' : 'danger'}
          statusLabel={criticalRisks.length === 0 ? 'None' : 'Intervene'}
          icon={ShieldAlert}
          definition={{
            formula:
              'Distinct approved-critical competencies with at least one person below the required proficiency',
            source: 'Weighted skill-risk roll-up across the workforce',
          }}
        />
        <Kpi
          label="Assessment pass rate"
          value={assess.passRatePct == null ? '—' : `${assess.passRatePct}%`}
          caption={
            assess.attempts === 0
              ? 'No attempts recorded'
              : `${assess.passed} of ${assess.attempts} attempts · avg ${assess.averageScorePct}%`
          }
          target="80%"
          tone={assess.passRatePct == null ? 'neutral' : assess.passRatePct >= 80 ? 'success' : 'warning'}
          statusLabel={assess.passRatePct == null ? 'No data' : assess.passRatePct >= 80 ? 'Healthy' : 'Review'}
          icon={CheckCircle2}
          definition={{
            formula:
              'Passed attempts ÷ recorded attempts. People with no attempt are counted separately, never as failures.',
            source: 'Knowledge-assessment evidence channel',
          }}
        />
        <Kpi
          label="Expiry exposure"
          value={String(summary.expiringSoonItems)}
          caption="Validations lapsing within 90 days"
          tone={summary.expiringSoonItems === 0 ? 'success' : 'warning'}
          statusLabel={summary.expiringSoonItems === 0 ? 'Clear' : 'Schedule renewals'}
          icon={CalendarClock}
          definition={{
            formula: 'Competency validations whose next validation date falls within 90 days',
            source: 'Evidence date + revalidation window (12 months critical, 24 months standard)',
          }}
        />
      </KpiGrid>

      {/* 3 — Where the risk sits. */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Section
          title="Workforce readiness mix"
          description="How the whole company distributes across the five readiness states."
          meta={`${readiness.total} people · as of ${formatDate(DEMO_AS_OF)}`}
          className="lg:col-span-2"
        >
          <StackedBar
            total={readiness.total}
            segments={[
              { tone: 'success', value: readiness.role_ready, label: 'Role ready' },
              { tone: 'warning', value: readiness.developing, label: 'Developing' },
              { tone: 'danger', value: readiness.not_role_ready, label: 'Not role ready' },
              { tone: 'neutral', value: readiness.not_assessed, label: 'Not assessed' },
              { tone: 'neutral', value: readiness.no_framework, label: 'No framework' },
            ]}
          />
          <Legend
            className="mt-3"
            items={[
              { tone: 'success', label: 'Role ready', value: readiness.role_ready },
              { tone: 'warning', label: 'Developing', value: readiness.developing },
              { tone: 'danger', label: 'Not role ready', value: readiness.not_role_ready },
              { tone: 'neutral', label: 'Not assessed', value: readiness.not_assessed },
              { tone: 'neutral', label: 'No framework', value: readiness.no_framework },
            ]}
          />
          <dl className="mt-4 pt-3 border-t border-hairline/8 space-y-2 text-[12px]">
            <div className="flex justify-between gap-3">
              <dt className="text-ink-secondary">Median time to proficiency</dt>
              <dd className="text-ink-primary font-medium tnum">
                {ttp.median == null ? 'Not measurable' : `${ttp.median} days`}
                <span className="text-ink-tertiary font-normal"> (n={ttp.sampleSize})</span>
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-secondary">People with overdue learning</dt>
              <dd className="text-ink-primary font-medium tnum">
                {summary.withOverdue} of {summary.people}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-secondary">People not yet started</dt>
              <dd className="text-ink-primary font-medium tnum">{summary.notStarted}</dd>
            </div>
          </dl>
        </Section>

        <ChartFrame
          className="lg:col-span-3"
          title="Competencies driving the most risk"
          period={`As of ${formatDate(DEMO_AS_OF)}`}
          unit="% of applicable people at or above required level"
          drillHref="/analytics"
          drillLabel="Full skill report"
          isEmpty={risks.length === 0}
          emptyHeadline="No skill risk recorded"
          emptySupport="Either every required competency is validated, or no framework has been authored yet."
        >
          <CompareBars
            data={risks.slice(0, 10).map((r) => ({
              name: r.name.length > 24 ? `${r.name.slice(0, 23)}…` : r.name,
              coverage: r.coveragePct,
            }))}
            categoryKey="name"
            valueKey="coverage"
            tone="danger"
          />
        </ChartFrame>
      </div>

      {/* 4 — Department comparison with drill-down. */}
      <Section
        title="Department performance"
        description="Least ready first. Departments with no authored framework report as unmeasurable rather than as a flattering blank."
        meta={`${deptRows.length} departments · as of ${formatDate(DEMO_AS_OF)}`}
        padded={false}
      >
        <DataTable
          rows={deptRows}
          columns={columns}
          rowKey={(r) => r.slug}
          searchPlaceholder="Search departments…"
          exportName="department-capability"
          onRowClick={setDetail}
          pageSize={20}
          caption="Departments with headcount, readiness, compliance and critical gaps"
          rowActions={(r) => (
            <Button size="sm" variant="ghost" onClick={() => setDetail(r)}>
              View
            </Button>
          )}
        />
      </Section>

      {/* 5 — Management action queue: every entry has a named owner. */}
      <Section
        title="Management action queue"
        description="What leadership has to decide, ordered by how much capability it unblocks."
        meta={`As of ${formatDate(DEMO_AS_OF)}`}
        padded={false}
      >
        {(() => {
          const actions: { title: string; detail: string; owner: string; tone: 'danger' | 'warning'; href: string }[] = []
          for (const d of unmeasurable) {
            actions.push({
              title: `Authorise a competency framework for ${d.name}`,
              detail: `${d.people} people cannot be assessed, assigned or certified until competencies exist. This blocks every downstream metric for the department.`,
              owner: DEPARTMENTS.find((x) => x.slug === d.slug)?.head ?? 'Department Head',
              tone: 'warning',
              href: '/admin/content',
            })
          }
          for (const r of criticalRisks.slice(0, 4)) {
            actions.push({
              title: `Close the critical gap in ${r.name}`,
              detail: `${r.affected} of ${r.applicable} people are below the required level on an approved-critical competency, which hard-gates their role readiness.`,
              owner: 'Head of L&D with the Department Head',
              tone: 'danger',
              href: '/analytics',
            })
          }
          if (summary.expiringSoonItems > 0) {
            actions.push({
              title: `Schedule ${summary.expiringSoonItems} revalidations`,
              detail:
                'These validations lapse within 90 days. Once lapsed, the competency drops back to Guided and readiness falls with it.',
              owner: 'Reporting Managers',
              tone: 'warning',
              href: '/certifications',
            })
          }
          if (actions.length === 0) {
            return (
              <Empty
                compact
                icon={CheckCircle2}
                headline="No management action outstanding"
                support="Every department has an authored framework, no approved-critical competency is short, and nothing lapses within 90 days."
              />
            )
          }
          return (
            <ol className="divide-y divide-hairline/6">
              {actions.map((a, i) => (
                <li key={a.title} className="flex flex-wrap items-start gap-3 px-5 py-3.5">
                  <span
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0 tnum',
                      a.tone === 'danger'
                        ? 'bg-danger-bg text-danger-fg'
                        : 'bg-warning-bg text-warning-fg',
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium text-ink-primary">{a.title}</span>
                    <span className="block text-[12px] text-ink-secondary mt-0.5">{a.detail}</span>
                    <span className="block text-[11px] text-ink-tertiary mt-1">Owner: {a.owner}</span>
                  </span>
                  <Button size="sm" href={a.href}>
                    Open
                  </Button>
                </li>
              ))}
            </ol>
          )
        })()}
      </Section>

      {/* What the portal genuinely cannot compute yet — stated, not faked. */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartFrame
          title="Monthly learning trend"
          period="Requires month-end snapshots"
          unit="% role ready over time"
          isEmpty
          emptyHeadline="No historical series yet"
          emptySupport="The readiness engine computes a point-in-time verdict from current evidence. Plotting a trend needs stored month-end snapshots; the first comparison point appears one reporting period after snapshots are enabled."
        >
          <span />
        </ChartFrame>
        <ChartFrame
          title="Training return on investment"
          period="Requires cost and outcome data"
          unit="₹ return per ₹ invested"
          isEmpty
          emptyHeadline="ROI cannot be calculated from portal data alone"
          emptySupport="ROI needs delivery cost per programme and a linked business outcome (conversion, rework rate, defect rate). Neither is currently fed into the portal, so no figure is shown rather than an estimated one."
        >
          <span />
        </ChartFrame>
      </div>

      {/* Department drill-down. */}
      <Drawer
        open={detail != null}
        onClose={() => setDetail(null)}
        title={detail?.name ?? ''}
        subtitle={detail ? `${detail.people} people` : undefined}
        width="lg"
        footer={
          detail && (
            <>
              <Button onClick={() => setDetail(null)}>Close</Button>
              <Button variant="primary" href={`/department?dept=${detail.slug}`}>
                Open department dashboard
              </Button>
            </>
          )
        }
      >
        {detail && <DepartmentDetail row={detail} />}
      </Drawer>
    </div>
  )
}

function DepartmentDetail({ row }: { row: DeptRow }) {
  const dept = DEPARTMENTS.find((d) => d.slug === row.slug)
  const people = useMemo(() => membersOfDepartment(row.slug), [row.slug])
  const roster = useMemo(() => rosterFor(people, DEMO_AS_OF), [people])

  return (
    <div className="space-y-5">
      {!row.hasFramework && (
        <Notice tone="warning" icon={FileWarning}>
          No competency framework has been authored for this department. Readiness, completion and
          compliance are genuinely unmeasurable until one exists — the blanks below are honest, not
          missing data.
        </Notice>
      )}

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Role ready', value: row.readyPct == null ? '—' : `${row.readyPct}%` },
          { label: 'Mandatory', value: row.compliancePct == null ? '—' : `${row.compliancePct}%` },
          { label: 'Critical gaps', value: String(row.criticalGaps) },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-cream px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-wide text-ink-tertiary">{s.label}</p>
            <p className="text-lg font-semibold text-ink-primary tnum">{s.value}</p>
          </div>
        ))}
      </div>

      {dept && (
        <dl className="space-y-1.5 text-[12px]">
          <div className="flex justify-between gap-3">
            <dt className="text-ink-secondary">Department Head</dt>
            <dd className="text-ink-primary">{dept.head}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-ink-secondary">Learning Champion</dt>
            <dd className="text-ink-primary">{dept.champion}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-ink-secondary">Backup Champion</dt>
            <dd className="text-ink-primary">{dept.backupChampion}</dd>
          </div>
        </dl>
      )}

      <div>
        <h3 className="text-[13px] font-semibold text-ink-primary mb-2">
          People ({roster.length})
        </h3>
        {roster.length === 0 ? (
          <Empty
            compact
            icon={Users}
            headline="Nobody in this department"
            support="No workforce records are mapped to this department yet."
          />
        ) : (
          <ul className="space-y-1.5">
            {roster.map((r: RosterRow) => (
              <li
                key={r.member.id}
                className="flex items-center gap-3 rounded-xl border border-hairline/10 px-3 py-2"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium text-ink-primary truncate">
                    {r.member.name}
                  </span>
                  <span className="block text-[11px] text-ink-tertiary truncate">{r.member.role}</span>
                </span>
                {r.overdue > 0 && (
                  <span className="text-[11px] text-danger-fg tnum whitespace-nowrap">
                    {r.overdue} overdue
                  </span>
                )}
                <StatusBadge
                  size="sm"
                  tone={
                    r.readiness === 'role_ready'
                      ? 'success'
                      : r.readiness === 'not_role_ready'
                        ? 'danger'
                        : r.readiness === 'developing'
                          ? 'warning'
                          : 'neutral'
                  }
                  label={READINESS_LABEL[r.readiness]}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link
        href={`/manager?dept=${row.slug}`}
        className="inline-flex items-center gap-1 text-[12px] font-medium text-accent-copper hover:underline"
      >
        <Building2 size={13} /> See this department&apos;s learning detail
      </Link>
    </div>
  )
}
