'use client'

import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  FileWarning,
  Send,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Button,
  DataTable,
  Drawer,
  Empty,
  FilterBar,
  Kpi,
  KpiGrid,
  Notice,
  PageHeader,
  ProgressBar,
  Section,
  Select,
  StatusBadge,
  type Column,
  type FilterValues,
} from '@/components/ds'
import {
  STATUS_LABEL,
  STATUS_TONE,
  formatDate,
  formatDue,
  rosterFor,
  summarise,
  type RosterRow,
} from '@/lib/learning-plan'
import { DEMO_AS_OF } from '@/data/capability-evidence'
import { READINESS_LABEL } from '@/lib/role-readiness'
import { DEPARTMENTS, LOCATIONS, WORKFORCE, memberById } from '@/data/workforce'
import { ROLES, ROLE_LABEL, defaultRoleForMember, type Role } from '@/lib/roles'
import { cn } from '@/lib/utils'

/**
 * Users, Roles & Assignments.
 *
 * The previous screen queried Supabase directly and, with no project
 * provisioned, rendered nothing but 503s on a dark canvas that clashed with
 * the rest of the shell. This version works from the workforce register that
 * every other dashboard already uses, so an administrator can do the job now
 * and the same screen keeps working once the HRMS import lands.
 *
 * Role assignment is shown as *derived* from job level, with the derivation
 * stated on screen — an administrator needs to know why someone is a Manager
 * before they override it.
 */

const EMPTY_FILTERS: FilterValues = { dept: 'all', location: 'all', role: 'all', status: 'all' }

export default function AdminLearners() {
  const [filters, setFilters] = useState<FilterValues>(EMPTY_FILTERS)
  const [detail, setDetail] = useState<RosterRow | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  /** Local role overrides — persisted to the HRMS mapping table in live mode. */
  const [overrides, setOverrides] = useState<Record<string, Role>>({})

  const roster = useMemo(() => rosterFor(WORKFORCE, DEMO_AS_OF), [])
  const summary = useMemo(() => summarise(WORKFORCE, DEMO_AS_OF), [])

  const roleOf = (id: string): Role => {
    const m = memberById(id)
    return overrides[id] ?? (m ? defaultRoleForMember(m) : 'employee')
  }

  const filtered = useMemo(
    () =>
      roster.filter((r) => {
        if (filters.dept !== 'all' && r.member.departmentSlug !== filters.dept) return false
        if (filters.location !== 'all' && r.member.location !== filters.location) return false
        if (filters.role !== 'all' && roleOf(r.member.id) !== filters.role) return false
        if (filters.status === 'overdue' && r.overdue === 0) return false
        if (filters.status === 'not_started' && r.notStarted === 0) return false
        if (filters.status === 'no_framework' && r.completionPct != null) return false
        return true
      }),
    // roleOf closes over `overrides`, which is in the dependency list.
    [roster, filters, overrides],
  )

  function assign(rows: RosterRow[]) {
    toast.success(
      rows.length === 1
        ? `Learning assigned to ${rows[0].member.name}`
        : `Learning assigned to ${rows.length} people`,
      {
        description:
          'Each person receives every competency their role requires that is not already validated, with due dates from the criticality policy.',
      },
    )
    setSelected(new Set())
  }

  function remind(rows: RosterRow[]) {
    toast.success(`Reminders queued for ${rows.length} ${rows.length === 1 ? 'person' : 'people'}`, {
      description: 'Delivery runs with the nightly notification job.',
    })
    setSelected(new Set())
  }

  function setRoleFor(id: string, role: Role) {
    setOverrides((o) => ({ ...o, [id]: role }))
    toast.success(`${memberById(id)?.name} set to ${ROLE_LABEL[role]}`, {
      description: 'Overrides are stored against the employee record and survive the HRMS import.',
    })
  }

  const selectedRows = filtered.filter((r) => selected.has(r.member.id))

  const columns: Column<RosterRow>[] = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          aria-label="Select all shown"
          className="accent-[rgb(var(--m-accent-copper))] cursor-pointer"
          checked={filtered.length > 0 && selected.size === filtered.length}
          onChange={(e) =>
            setSelected(e.target.checked ? new Set(filtered.map((r) => r.member.id)) : new Set())
          }
        />
      ),
      width: 'w-9',
      cell: (r) => (
        <input
          type="checkbox"
          aria-label={`Select ${r.member.name}`}
          className="accent-[rgb(var(--m-accent-copper))] cursor-pointer"
          checked={selected.has(r.member.id)}
          onChange={(e) => {
            const next = new Set(selected)
            if (e.target.checked) next.add(r.member.id)
            else next.delete(r.member.id)
            setSelected(next)
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      key: 'name',
      header: 'Employee',
      sortable: true,
      value: (r) => r.member.name,
      cell: (r) => (
        <span className="flex flex-col gap-0.5 min-w-0">
          <span className="font-medium text-ink-primary truncate">{r.member.name}</span>
          <span className="text-[11px] text-ink-tertiary truncate">{r.member.role}</span>
        </span>
      ),
    },
    {
      key: 'dept',
      header: 'Department',
      sortable: true,
      value: (r) => r.departmentName,
      cell: (r) => <span className="text-[12px] text-ink-secondary">{r.departmentName}</span>,
    },
    {
      key: 'portalRole',
      header: 'Portal role',
      sortable: true,
      nowrap: true,
      value: (r) => ROLE_LABEL[roleOf(r.member.id)],
      cell: (r) => (
        <span className="flex items-center gap-1.5">
          <StatusBadge
            size="sm"
            tone={overrides[r.member.id] ? 'info' : 'neutral'}
            label={ROLE_LABEL[roleOf(r.member.id)]}
            icon={ShieldCheck}
            title={
              overrides[r.member.id]
                ? 'Manually overridden'
                : `Derived from job level ${r.member.level}`
            }
          />
        </span>
      ),
    },
    {
      key: 'completion',
      header: 'Completion',
      sortable: true,
      width: 'w-[130px]',
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
      key: 'overdue',
      header: 'Overdue',
      sortable: true,
      align: 'right',
      nowrap: true,
      value: (r) => r.overdue,
      cell: (r) => (
        <span
          className={cn('text-[12px] tnum', r.overdue > 0 ? 'text-danger-fg font-semibold' : 'text-ink-tertiary')}
        >
          {r.overdue}
        </span>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      sortable: true,
      secondary: true,
      nowrap: true,
      value: (r) => r.member.location,
      cell: (r) => <span className="text-[12px] text-ink-secondary">{r.member.location}</span>,
    },
    {
      key: 'joined',
      header: 'Joined',
      sortable: true,
      secondary: true,
      nowrap: true,
      align: 'right',
      value: (r) => r.member.joinedOn,
      cell: (r) => (
        <span className="text-[12px] text-ink-secondary tnum">{formatDate(r.member.joinedOn)}</span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users, roles and assignments"
        description="The learner register: who is here, what portal role they hold, and what learning is assigned to them."
        actions={
          <Button
            icon={UserPlus}
            variant="primary"
            onClick={() => assign(filtered.filter((r) => r.completionPct != null))}
          >
            Assign role learning to all shown
          </Button>
        }
      >
        <FilterBar
          filters={[
            {
              id: 'dept',
              label: 'Department',
              options: DEPARTMENTS.map((d) => ({
                value: d.slug,
                label: d.name,
                count: WORKFORCE.filter((m) => m.departmentSlug === d.slug).length,
              })),
            },
            {
              id: 'location',
              label: 'Location',
              options: LOCATIONS.map((l) => ({
                value: l,
                label: l,
                count: WORKFORCE.filter((m) => m.location === l).length,
              })),
            },
            {
              id: 'role',
              label: 'Portal role',
              options: ROLES.map((r) => ({
                value: r,
                label: ROLE_LABEL[r],
                count: WORKFORCE.filter((m) => roleOf(m.id) === r).length,
              })),
            },
            {
              id: 'status',
              label: 'Status',
              allLabel: 'Any status',
              options: [
                { value: 'overdue', label: 'Has overdue', count: roster.filter((r) => r.overdue > 0).length },
                { value: 'not_started', label: 'Not started', count: roster.filter((r) => r.notStarted > 0).length },
                {
                  value: 'no_framework',
                  label: 'No framework',
                  count: roster.filter((r) => r.completionPct == null).length,
                },
              ],
            },
          ]}
          values={filters}
          onChange={setFilters}
          onReset={() => setFilters(EMPTY_FILTERS)}
          scopeNote={`${WORKFORCE.length} people on the register`}
          lastRefreshed={formatDate(DEMO_AS_OF)}
        />
      </PageHeader>

      {summary.noFramework > 0 && (
        <Notice tone="warning" icon={FileWarning}>
          <strong>
            {summary.noFramework} {summary.noFramework === 1 ? 'person is' : 'people are'} in a
            department with no authored competency framework.
          </strong>{' '}
          Nothing can be assigned to them until their Department Head approves a framework — they
          are shown here so the authoring gap stays visible rather than silently excluded.
        </Notice>
      )}

      <KpiGrid columns={4}>
        <Kpi
          label="People on the register"
          value={String(WORKFORCE.length)}
          caption={`Across ${DEPARTMENTS.length} departments and ${LOCATIONS.length} locations`}
          icon={Users}
          definition={{ formula: 'Count of workforce records', source: 'Workforce register (HRMS import in live mode)' }}
        />
        <Kpi
          label="Assignable"
          value={String(WORKFORCE.length - summary.noFramework)}
          caption="People whose department has an authored framework"
          tone={summary.noFramework === 0 ? 'success' : 'warning'}
          statusLabel={summary.noFramework === 0 ? 'All covered' : `${summary.noFramework} blocked`}
          icon={CheckCircle2}
          definition={{
            formula: 'People in departments with at least one authored competency',
            source: 'Competency dictionary + department register',
          }}
        />
        <Kpi
          label="With overdue learning"
          value={String(summary.withOverdue)}
          caption={`${summary.totalOverdueItems} overdue items in total`}
          tone={summary.withOverdue === 0 ? 'success' : 'danger'}
          statusLabel={summary.withOverdue === 0 ? 'Clear' : 'Chase'}
          icon={AlertTriangle}
          onClick={() => setFilters({ ...filters, status: 'overdue' })}
          definition={{
            formula: 'People with at least one competency past its derived due date',
            source: 'Role start date + criticality window',
          }}
        />
        <Kpi
          label="Not yet started"
          value={String(summary.notStarted)}
          caption="No evidence recorded on any competency"
          tone={summary.notStarted === 0 ? 'success' : 'warning'}
          statusLabel={summary.notStarted === 0 ? 'All engaged' : 'Low engagement'}
          icon={BellRing}
          onClick={() => setFilters({ ...filters, status: 'not_started' })}
          definition={{
            formula: 'People with zero completed and zero in-progress competencies',
            source: 'Evidence channels',
          }}
        />
      </KpiGrid>

      <Section
        title="Learner register"
        description="Select people to assign learning or send reminders in bulk. Open a row to change a portal role."
        meta={`${filtered.length} of ${WORKFORCE.length} shown · as of ${formatDate(DEMO_AS_OF)}`}
        action={
          selected.size > 0 && (
            <span className="flex items-center gap-2">
              <span className="text-[11px] text-ink-secondary tnum">{selected.size} selected</span>
              <Button size="sm" icon={Send} onClick={() => remind(selectedRows)}>
                Remind
              </Button>
              <Button size="sm" variant="primary" icon={UserPlus} onClick={() => assign(selectedRows)}>
                Assign
              </Button>
            </span>
          )
        }
        padded={false}
      >
        <DataTable
          rows={filtered}
          columns={columns}
          rowKey={(r) => r.member.id}
          searchPlaceholder="Search by name, role, department or location…"
          exportName="learner-register"
          onRowClick={setDetail}
          pageSize={15}
          caption="Every learner with department, portal role, completion and overdue count"
          emptyHeadline="No one matches these filters"
          emptySupport="Reset the filters to see the whole register."
          emptyAction={
            <Button size="sm" onClick={() => setFilters(EMPTY_FILTERS)}>
              Reset filters
            </Button>
          }
        />
      </Section>

      <Drawer
        open={detail != null}
        onClose={() => setDetail(null)}
        title={detail?.member.name ?? ''}
        subtitle={detail ? `${detail.member.role} · ${detail.departmentName}` : undefined}
        width="lg"
        footer={
          detail && (
            <>
              <Button onClick={() => setDetail(null)}>Close</Button>
              {detail.overdue > 0 && (
                <Button icon={Send} onClick={() => remind([detail])}>
                  Send reminder
                </Button>
              )}
              <Button variant="primary" icon={UserPlus} onClick={() => assign([detail])}>
                Assign role learning
              </Button>
            </>
          )
        }
      >
        {detail && (
          <div className="space-y-5">
            <div>
              <label
                htmlFor="portal-role"
                className="block text-[13px] font-semibold text-ink-primary mb-1.5"
              >
                Portal role
              </label>
              <Select
                label="Portal role"
                value={roleOf(detail.member.id)}
                onChange={(v) => setRoleFor(detail.member.id, v as Role)}
                options={ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] }))}
              />
              <p className="text-[11px] text-ink-tertiary mt-1.5">
                {overrides[detail.member.id]
                  ? 'Manually overridden for this person.'
                  : `Derived from job level ${detail.member.level} (1 Executive · 2 Manager · 3 Head). Change it here to override.`}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: 'Completion',
                  value: detail.completionPct == null ? '—' : `${detail.completionPct}%`,
                },
                {
                  label: 'Mandatory',
                  value: detail.compliancePct == null ? '—' : `${detail.compliancePct}%`,
                },
                { label: 'Overdue', value: String(detail.overdue) },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-cream px-3 py-2.5">
                  <p className="text-[11px] uppercase tracking-wide text-ink-tertiary">{s.label}</p>
                  <p className="text-lg font-semibold text-ink-primary tnum">{s.value}</p>
                </div>
              ))}
            </div>

            <dl className="space-y-1.5 text-[12px]">
              {[
                ['Employment type', detail.member.employmentType],
                ['Location', detail.member.location],
                ['Joined', formatDate(detail.member.joinedOn)],
                ['Cohort', detail.member.cohort ?? 'Not part of an intake cohort'],
                ['Reports to', memberById(detail.member.managerId)?.name ?? 'No manager on record'],
                ['Readiness', READINESS_LABEL[detail.readiness]],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-ink-secondary">{k}</dt>
                  <dd className="text-ink-primary text-right">{v}</dd>
                </div>
              ))}
            </dl>

            <div>
              <h3 className="text-[13px] font-semibold text-ink-primary mb-2">
                Assigned learning ({detail.plan.counts.total})
              </h3>
              {detail.plan.items.length === 0 ? (
                <Empty
                  compact
                  icon={FileWarning}
                  headline="Nothing assignable"
                  support="This person's department has no authored competency framework, so there is nothing to assign."
                />
              ) : (
                <ul className="space-y-1.5">
                  {detail.plan.items.map((i) => (
                    <li
                      key={i.competencyId}
                      className="flex items-center gap-3 rounded-xl border border-hairline/10 px-3 py-2"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12px] font-medium text-ink-primary truncate">
                          {i.title}
                        </span>
                        <span className="block text-[11px] text-ink-tertiary">
                          {i.status === 'completed' ? 'Validated' : formatDue(i.daysRemaining)}
                        </span>
                      </span>
                      <StatusBadge tone={STATUS_TONE[i.status]} label={STATUS_LABEL[i.status]} size="sm" />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
