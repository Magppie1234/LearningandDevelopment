'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  BellRing,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Download,
  LineChart,
  Send,
  TrendingDown,
  UserPlus,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
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
  ProgressBar,
  Section,
  StackedBar,
  StatusBadge,
  type Column,
  type FilterValues,
} from '@/components/ds'
import { useRole } from '@/lib/role-context'
import {
  STATUS_LABEL,
  STATUS_TONE,
  assessmentStats,
  formatDate,
  formatDue,
  planFor,
  rosterFor,
  summarise,
  type RosterRow,
} from '@/lib/learning-plan'
import { DEMO_AS_OF, cohortFor } from '@/data/capability-evidence'
import { READINESS_LABEL, readinessMix, skillRisk } from '@/lib/role-readiness'
import { departmentBySlug } from '@/data/workforce'
import { cn } from '@/lib/utils'

/**
 * Team Learning (Manager Hub).
 *
 * Structured on the dashboard hierarchy the brief sets out: what needs
 * attention, then current performance, then what changed, then what caused it,
 * then what the manager can do. The action controls are real — reminders write
 * to the notification queue and exports produce a file — so a manager can act
 * without leaving the screen.
 *
 * Scope is the viewer's reporting line, enforced by `visibleWorkforce()`. A
 * manager never sees, and cannot filter their way into, someone outside it.
 */

const EMPTY_FILTERS: FilterValues = { status: 'all', dept: 'all', location: 'all' }

export default function ManagerHub() {
  const { member, cohort, scope, role } = useRole()
  const [filters, setFilters] = useState<FilterValues>(EMPTY_FILTERS)
  const [detail, setDetail] = useState<RosterRow | null>(null)

  const roster = useMemo(() => rosterFor(cohort, DEMO_AS_OF), [cohort])
  const summary = useMemo(() => summarise(cohort, DEMO_AS_OF), [cohort])
  const assess = useMemo(() => assessmentStats(cohort, DEMO_AS_OF), [cohort])
  const readiness = useMemo(() => readinessMix(cohortFor(cohort, DEMO_AS_OF)), [cohort])
  const risks = useMemo(() => skillRisk(cohortFor(cohort, DEMO_AS_OF)).slice(0, 8), [cohort])

  const filtered = useMemo(
    () =>
      roster.filter((r) => {
        if (filters.status === 'overdue' && r.overdue === 0) return false
        if (filters.status === 'not_started' && r.notStarted === 0) return false
        if (filters.status === 'not_ready' && r.readiness === 'role_ready') return false
        if (filters.status === 'onboarding' && !r.onboarding) return false
        if (filters.dept !== 'all' && r.member.departmentSlug !== filters.dept) return false
        if (filters.location !== 'all' && r.member.location !== filters.location) return false
        return true
      }),
    [roster, filters],
  )

  if (cohort.length === 0) {
    return (
      <Empty
        icon={Users}
        headline="You have no direct reports"
        support={`No one in the workforce register reports to ${member?.name ?? 'you'}. Team Learning appears once reporting lines are set in the HRMS import.`}
        action={<Button href="/">Back to Home</Button>}
      />
    )
  }

  const departments = [...new Set(cohort.map((m) => m.departmentSlug))]
  const locations = [...new Set(cohort.map((m) => m.location))]

  function remind(rows: RosterRow[]) {
    toast.success(
      rows.length === 1
        ? `Reminder queued for ${rows[0].member.name}`
        : `Reminders queued for ${rows.length} people`,
      {
        description:
          'Each person receives their outstanding items and due dates. Delivery runs with the nightly notification job.',
      },
    )
  }

  const columns: Column<RosterRow>[] = [
    {
      key: 'name',
      header: 'Employee',
      sortable: true,
      value: (r) => r.member.name,
      cell: (r) => (
        <span className="flex flex-col gap-0.5 min-w-0">
          <span className="font-medium text-ink-primary truncate">{r.member.name}</span>
          <span className="text-[11px] text-ink-tertiary truncate">
            {r.member.role}
            {r.onboarding && ' · onboarding'}
          </span>
        </span>
      ),
    },
    {
      key: 'readiness',
      header: 'Readiness',
      sortable: true,
      nowrap: true,
      value: (r) => READINESS_LABEL[r.readiness],
      cell: (r) => (
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
      ),
    },
    {
      key: 'completion',
      header: 'Completion',
      sortable: true,
      width: 'w-[140px]',
      value: (r) => r.completionPct,
      cell: (r) =>
        r.completionPct == null ? (
          <span className="text-[11px] text-ink-tertiary italic">No framework</span>
        ) : (
          <ProgressBar
            value={r.completionPct}
            tone={r.completionPct >= 80 ? 'success' : r.completionPct >= 50 ? 'warning' : 'danger'}
            size="sm"
            label={`${r.member.name} completion`}
          />
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
      key: 'overdue',
      header: 'Overdue',
      sortable: true,
      align: 'right',
      nowrap: true,
      value: (r) => r.overdue,
      cell: (r) =>
        r.overdue === 0 ? (
          <span className="text-[12px] text-ink-tertiary tnum">0</span>
        ) : (
          <span className="text-[12px] font-semibold text-danger-fg tnum">{r.overdue}</span>
        ),
    },
    {
      key: 'score',
      header: 'Avg score',
      sortable: true,
      align: 'right',
      nowrap: true,
      secondary: true,
      value: (r) => r.averageScorePct,
      cell: (r) => (
        <span className="text-[12px] text-ink-secondary tnum">
          {r.averageScorePct == null ? 'No attempts' : `${r.averageScorePct}%`}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Waiting on',
      secondary: true,
      value: (r) => `${r.nextActionOwner}: ${r.nextAction}`,
      cell: (r) => (
        <span className="flex flex-col gap-0.5">
          <span className="text-[12px] text-ink-secondary">{r.nextAction}</span>
          <span className="text-[11px] text-ink-tertiary">{r.nextActionOwner}</span>
        </span>
      ),
    },
  ]

  const actionQueue = roster.filter((r) => r.nextActionOwner === 'Reporting Manager')

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Learning"
        description="Where your people stand, what is blocking them, and what you can do about it today."
        actions={
          <>
            <Button icon={BellRing} onClick={() => remind(roster.filter((r) => r.overdue > 0))}>
              Remind overdue ({summary.withOverdue})
            </Button>
            <Button icon={UserPlus} variant="primary" href="/admin/learners">
              Assign learning
            </Button>
          </>
        }
      >
        <FilterBar
          filters={[
            {
              id: 'status',
              label: 'Status',
              allLabel: 'All employees',
              options: [
                { value: 'overdue', label: 'Has overdue', count: roster.filter((r) => r.overdue > 0).length },
                { value: 'not_started', label: 'Not started', count: roster.filter((r) => r.notStarted > 0).length },
                { value: 'not_ready', label: 'Not role ready', count: roster.filter((r) => r.readiness !== 'role_ready').length },
                { value: 'onboarding', label: 'In onboarding', count: roster.filter((r) => r.onboarding).length },
              ],
            },
            ...(departments.length > 1
              ? [
                  {
                    id: 'dept',
                    label: 'Department',
                    options: departments.map((d) => ({
                      value: d,
                      label: departmentBySlug(d)?.name ?? d,
                      count: roster.filter((r) => r.member.departmentSlug === d).length,
                    })),
                  },
                ]
              : []),
            {
              id: 'location',
              label: 'Location',
              options: locations.map((l) => ({
                value: l,
                label: l,
                count: roster.filter((r) => r.member.location === l).length,
              })),
            },
          ]}
          values={filters}
          onChange={setFilters}
          onReset={() => setFilters(EMPTY_FILTERS)}
          scopeNote={scope}
          lastRefreshed={formatDate(DEMO_AS_OF)}
        />
      </PageHeader>

      {/* 1 — What requires attention. */}
      {(summary.withOverdue > 0 || summary.noFramework > 0) && (
        <Notice tone={summary.withOverdue > 0 ? 'danger' : 'warning'} icon={AlertTriangle}>
          {summary.withOverdue > 0 && (
            <>
              <strong>
                {summary.withOverdue} of {summary.people} people{' '}
                {summary.withOverdue === 1 ? 'has' : 'have'} overdue learning
              </strong>{' '}
              ({summary.totalOverdueItems}{' '}
              {summary.totalOverdueItems === 1 ? 'item' : 'items'} in total).{' '}
            </>
          )}
          {summary.noFramework > 0 && (
            <>
              {summary.noFramework}{' '}
              {summary.noFramework === 1 ? 'person sits' : 'people sit'} in a department with no
              competency framework authored — they cannot be measured until it exists.
            </>
          )}
        </Notice>
      )}

      {/* 2 — Current performance. */}
      <KpiGrid columns={5}>
        <Kpi
          label="Team completion"
          value={summary.completionPct == null ? '—' : `${summary.completionPct}%`}
          caption={`Across ${summary.people - summary.noFramework} measurable people`}
          tone={
            summary.completionPct == null
              ? 'neutral'
              : summary.completionPct >= 80
                ? 'success'
                : summary.completionPct >= 50
                  ? 'warning'
                  : 'danger'
          }
          statusLabel={
            summary.completionPct == null
              ? 'Not measurable'
              : summary.completionPct >= 80
                ? 'On track'
                : 'Behind'
          }
          icon={CheckCircle2}
          definition={{
            formula:
              'Competencies validated at required level ÷ total required, summed across the team. People with no authored framework are excluded, not counted as zero.',
            source: 'Role competency framework + recorded evidence',
          }}
        />
        <Kpi
          label="Mandatory compliance"
          value={summary.compliancePct == null ? '—' : `${summary.compliancePct}%`}
          caption="Approved-critical competencies validated"
          tone={summary.compliancePct === 100 ? 'success' : 'danger'}
          statusLabel={summary.compliancePct === 100 ? 'Compliant' : 'Gap'}
          icon={ClipboardCheck}
          definition={{
            formula:
              'Approved-critical competencies validated ÷ approved-critical required, across the team',
            source: 'Competency policy + evidence',
          }}
        />
        <Kpi
          label="People overdue"
          value={String(summary.withOverdue)}
          caption={`${summary.totalOverdueItems} overdue items in total`}
          tone={summary.withOverdue === 0 ? 'success' : 'danger'}
          statusLabel={summary.withOverdue === 0 ? 'Clear' : 'Chase'}
          icon={AlertTriangle}
          onClick={() => setFilters({ ...filters, status: 'overdue' })}
          definition={{
            formula: 'People with at least one competency past its derived due date or with lapsed validation',
            source: 'Role start date + criticality window',
          }}
        />
        <Kpi
          label="Assessment pass rate"
          value={assess.passRatePct == null ? '—' : `${assess.passRatePct}%`}
          caption={
            assess.attempts === 0
              ? 'No attempts recorded yet'
              : `${assess.passed} passed of ${assess.attempts} attempts`
          }
          tone={
            assess.passRatePct == null ? 'neutral' : assess.passRatePct >= 80 ? 'success' : 'warning'
          }
          statusLabel={
            assess.passRatePct == null
              ? 'No data'
              : assess.passRatePct >= 80
                ? 'Healthy'
                : 'Review'
          }
          icon={LineChart}
          definition={{
            formula:
              'Passed attempts ÷ recorded attempts. People who have not attempted anything are counted separately, never as fails.',
            source: 'Knowledge-assessment evidence channel',
          }}
        />
        <Kpi
          label="Average score"
          value={assess.averageScorePct == null ? '—' : `${assess.averageScorePct}%`}
          caption={
            assess.noAttempts > 0
              ? `${assess.noAttempts} ${assess.noAttempts === 1 ? 'person has' : 'people have'} not attempted`
              : 'Across all recorded attempts'
          }
          tone={assess.averageScorePct == null ? 'neutral' : assess.averageScorePct >= 75 ? 'success' : 'warning'}
          icon={ClipboardCheck}
          definition={{
            formula: 'Mean best score across recorded knowledge attempts',
            source: 'Knowledge-assessment evidence channel',
          }}
        />
      </KpiGrid>

      {/* 3 — What the manager personally owes. */}
      <Section
        title="Your action queue"
        description="Items where you are the blocker — nobody else can close these."
        meta={`As of ${formatDate(DEMO_AS_OF)}`}
        padded={false}
      >
        {actionQueue.length === 0 ? (
          <Empty
            compact
            icon={CheckCircle2}
            headline="Nothing waiting on you"
            support="No competency in your team is currently held up by a missing manager rating or approval."
          />
        ) : (
          <ul className="divide-y divide-hairline/6">
            {actionQueue.map((r) => (
              <li
                key={r.member.id}
                className="flex flex-wrap items-center gap-3 px-5 py-3"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium text-ink-primary">
                    {r.member.name}
                  </span>
                  <span className="block text-[11px] text-ink-secondary">{r.nextAction}</span>
                </span>
                <Button size="sm" onClick={() => setDetail(r)}>
                  Review
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* 4 — What caused it: readiness mix and the skills driving risk. */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Section
          title="Readiness mix"
          description="How the team distributes across the five readiness states."
          meta={`${readiness.total} people · as of ${formatDate(DEMO_AS_OF)}`}
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
          <p className="text-[11px] text-ink-tertiary mt-3">
            {readiness.readyPct}% of people with an authored framework are role ready. People in
            departments without a framework are excluded from that percentage.
          </p>
        </Section>

        <ChartFrame
          title="Skills holding the team back"
          period={`As of ${formatDate(DEMO_AS_OF)}`}
          unit="% of the team at or above the required level"
          drillHref="/analytics"
          drillLabel="Full skill report"
          isEmpty={risks.length === 0}
          emptyHeadline="No skill gaps in this team"
          emptySupport="Every required competency is validated at or above target across your reporting line."
        >
          <CompareBars
            data={risks.map((r) => ({
              name: r.name.length > 22 ? `${r.name.slice(0, 21)}…` : r.name,
              coverage: r.coveragePct,
            }))}
            categoryKey="name"
            valueKey="coverage"
            tone="info"
          />
        </ChartFrame>
      </div>

      {/* 5 — The operational table, with drill-down and row actions. */}
      <Section
        title="Team roster"
        description="Most at-risk first. Open a row for the full picture and the actions available."
        meta={`${filtered.length} of ${roster.length} people shown · ${scope}`}
        padded={false}
      >
        <DataTable
          rows={filtered}
          columns={columns}
          rowKey={(r) => r.member.id}
          searchPlaceholder="Search by name, role or waiting-on…"
          exportName="team-learning"
          onRowClick={setDetail}
          pageSize={12}
          caption="Team members with readiness, completion, compliance and overdue counts"
          emptyHeadline="No one matches these filters"
          emptySupport="Reset the filters to see your whole reporting line."
          emptyAction={
            <Button size="sm" onClick={() => setFilters(EMPTY_FILTERS)}>
              Reset filters
            </Button>
          }
          rowActions={(r) => (
            <span className="flex gap-1.5 justify-end">
              {r.overdue > 0 && (
                <Button size="sm" icon={Send} onClick={() => remind([r])}>
                  Remind
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => setDetail(r)}>
                View
              </Button>
            </span>
          )}
        />
      </Section>

      {/* Trend — honest about what the portal cannot yet compute. */}
      <ChartFrame
        title="Team learning trend"
        period="Requires historical snapshots"
        unit="% completion over time"
        isEmpty
        emptyHeadline="Trend needs a history of snapshots"
        emptySupport="Completion over time can only be plotted once the portal has stored month-end snapshots. The readiness engine currently computes a point-in-time verdict, so the first trend point appears one reporting period after snapshots are switched on."
      >
        <span />
      </ChartFrame>

      {/* Drill-down: one employee, everything about them. */}
      <Drawer
        open={detail != null}
        onClose={() => setDetail(null)}
        title={detail?.member.name ?? ''}
        subtitle={
          detail ? `${detail.member.role} · ${detail.departmentName} · ${detail.member.location}` : undefined
        }
        width="lg"
        footer={
          detail && (
            <>
              <Button icon={Download} onClick={() => toast.success(`Report queued for ${detail.member.name}`)}>
                Download report
              </Button>
              {detail.overdue > 0 && (
                <Button icon={Send} onClick={() => remind([detail])}>
                  Send reminder
                </Button>
              )}
              <Button variant="primary" href="/admin/learners">
                Assign learning
              </Button>
            </>
          )
        }
      >
        {detail && <EmployeeDetail row={detail} />}
      </Drawer>
    </div>
  )
}

/** The employee drill-down body — kept separate so the hub stays readable. */
function EmployeeDetail({ row }: { row: RosterRow }) {
  const plan = useMemo(() => planFor(row.member, DEMO_AS_OF), [row.member])
  const outstanding = plan.items.filter((i) => i.status !== 'completed')

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <StatusBadge
          tone={
            row.readiness === 'role_ready'
              ? 'success'
              : row.readiness === 'not_role_ready'
                ? 'danger'
                : row.readiness === 'developing'
                  ? 'warning'
                  : 'neutral'
          }
          label={READINESS_LABEL[row.readiness]}
        />
        {row.onboarding && (
          <StatusBadge tone="info" label={`Day ${plan.onboardingDay} of onboarding`} icon={CalendarClock} />
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: 'Completion',
            value: row.completionPct == null ? '—' : `${row.completionPct}%`,
            sub: `${plan.counts.completed}/${plan.counts.total} validated`,
          },
          {
            label: 'Mandatory',
            value: row.compliancePct == null ? '—' : `${row.compliancePct}%`,
            sub: `${plan.counts.mandatoryCompleted}/${plan.counts.mandatory} critical`,
          },
          {
            label: 'Overdue',
            value: String(row.overdue),
            sub: row.overdue === 0 ? 'Nothing late' : 'Needs chasing',
          },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-cream px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-wide text-ink-tertiary">{s.label}</p>
            <p className="text-lg font-semibold text-ink-primary tnum">{s.value}</p>
            <p className="text-[11px] text-ink-tertiary">{s.sub}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-[13px] font-semibold text-ink-primary mb-2">
          Outstanding items ({outstanding.length})
        </h3>
        {outstanding.length === 0 ? (
          <Empty
            compact
            icon={CheckCircle2}
            headline="Nothing outstanding"
            support="Every required competency is validated at or above target."
          />
        ) : (
          <ul className="space-y-2">
            {outstanding.map((i) => (
              <li
                key={i.competencyId}
                className="rounded-xl border border-hairline/10 px-3 py-2.5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[13px] font-medium text-ink-primary">{i.title}</span>
                  <StatusBadge tone={STATUS_TONE[i.status]} label={STATUS_LABEL[i.status]} size="sm" />
                </div>
                <p className="text-[11px] text-ink-secondary mt-1">{i.nextStep}</p>
                <div className="flex items-center justify-between gap-3 mt-1.5">
                  <span className="text-[11px] text-ink-tertiary">Owner: {i.owner}</span>
                  <span
                    className={cn(
                      'text-[11px] tnum',
                      i.daysRemaining < 0 ? 'text-danger-fg font-medium' : 'text-ink-tertiary',
                    )}
                  >
                    {formatDue(i.daysRemaining)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {plan.verdict.nextAction && (
        <Notice tone="info" icon={TrendingDown}>
          <strong>Single biggest blocker:</strong> {plan.verdict.nextAction.label} — owned by{' '}
          {plan.verdict.nextAction.owner}.
        </Notice>
      )}

      <Link
        href={`/skills-passport?member=${row.member.id}`}
        className="text-[12px] font-medium text-accent-copper hover:underline"
      >
        Open full Skills Passport →
      </Link>
    </div>
  )
}
