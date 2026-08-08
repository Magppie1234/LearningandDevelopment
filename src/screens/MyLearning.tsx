'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  GraduationCap,
  History,
  Info,
  Target,
} from 'lucide-react'
import {
  Button,
  DataTable,
  Drawer,
  Empty,
  Kpi,
  KpiGrid,
  Notice,
  PageHeader,
  ProgressBar,
  Section,
  Segmented,
  StatusBadge,
  type Column,
} from '@/components/ds'
import { useRole } from '@/lib/role-context'
import {
  DUE_POLICY_NOTE,
  STATUS_LABEL,
  STATUS_TONE,
  competencyById,
  formatDate,
  formatDue,
  planFor,
  type LearningItem,
} from '@/lib/learning-plan'
import { DEMO_AS_OF } from '@/data/capability-evidence'
import { departmentBySlug } from '@/data/workforce'
import { PROFICIENCY_LABEL } from '@/components/learning/ReadinessPrimitives'
import { cn } from '@/lib/utils'

/**
 * My Learning — every assigned item, its state and what to do about it.
 *
 * The previous version greeted a hardcoded "Sarah", reported "October 2024"
 * and printed fixed counts (7 in progress, 3 certifications, 48h) regardless
 * of who was signed in — sample content presented as live data. Every figure
 * here is derived from the signed-in person's role framework and recorded
 * evidence, and the detail drawer shows exactly which evidence channel is
 * holding each competency back.
 */

type Filter = 'all' | 'mandatory' | 'overdue' | 'in_progress' | 'completed'

const FILTER_LABEL: Record<Filter, string> = {
  all: 'All',
  mandatory: 'Mandatory',
  overdue: 'Overdue',
  in_progress: 'In progress',
  completed: 'Completed',
}

function matches(item: LearningItem, f: Filter): boolean {
  switch (f) {
    case 'mandatory':
      return item.mandatory
    case 'overdue':
      return item.status === 'overdue' || item.status === 'expired'
    case 'in_progress':
      return item.status === 'in_progress' || item.status === 'not_started'
    case 'completed':
      return item.status === 'completed'
    default:
      return true
  }
}

export default function MyLearning() {
  const { member } = useRole()
  const params = useSearchParams()
  const initial = (params?.get('filter') as Filter) ?? 'all'
  const [filter, setFilter] = useState<Filter>(
    (['all', 'mandatory', 'overdue', 'in_progress', 'completed'] as Filter[]).includes(initial)
      ? initial
      : 'all',
  )
  const [detail, setDetail] = useState<LearningItem | null>(null)

  const plan = useMemo(() => (member ? planFor(member, DEMO_AS_OF) : null), [member])

  if (!member || !plan) {
    return (
      <Empty
        icon={BookOpen}
        headline="No employee record linked to this account"
        support="Your learning plan is built from your role's competency framework. Ask your L&D administrator to link your employee record."
      />
    )
  }

  const dept = departmentBySlug(member.departmentSlug)
  const { counts } = plan

  if (!plan.hasFramework) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="My Learning"
          description={`${member.role} · ${dept?.name ?? member.departmentSlug}`}
        />
        <Empty
          icon={Compass}
          headline="Nothing has been assigned to you yet"
          support={`${dept?.name ?? 'Your department'} has no competency framework authored, so there is nothing to assign or measure against. ${dept?.head ?? 'The Department Head'} and ${dept?.champion ?? 'the Learning Champion'} own authoring it.`}
          action={
            <Button href="/catalogue" variant="primary" icon={GraduationCap}>
              Browse the catalogue
            </Button>
          }
        />
      </div>
    )
  }

  const rows = plan.items.filter((i) => matches(i, filter))

  const columns: Column<LearningItem>[] = [
    {
      key: 'title',
      header: 'Competency',
      sortable: true,
      value: (r) => r.title,
      cell: (r) => (
        <span className="flex flex-col gap-1">
          <span className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-ink-primary">{r.title}</span>
            {r.mandatory && <StatusBadge tone="danger" label="Mandatory" size="sm" icon={Target} />}
          </span>
          <span className="text-[11px] text-ink-tertiary">{r.academy}</span>
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      nowrap: true,
      value: (r) => STATUS_LABEL[r.status],
      cell: (r) => <StatusBadge tone={STATUS_TONE[r.status]} label={STATUS_LABEL[r.status]} size="sm" />,
    },
    {
      key: 'progress',
      header: 'Level',
      sortable: true,
      width: 'w-[150px]',
      value: (r) => r.progressPct,
      cell: (r) => (
        <span className="flex items-center gap-2">
          <ProgressBar
            value={r.progressPct}
            tone={r.status === 'overdue' || r.status === 'expired' ? 'danger' : r.progressPct === 100 ? 'success' : 'info'}
            size="sm"
            showValue={false}
            label={`${r.title} progress`}
          />
          <span className="text-[11px] text-ink-secondary tnum whitespace-nowrap">
            {r.validated}/{r.required}
          </span>
        </span>
      ),
    },
    {
      key: 'due',
      header: 'Due',
      sortable: true,
      nowrap: true,
      align: 'right',
      value: (r) => r.dueOn,
      cell: (r) => (
        <span
          className={cn(
            'text-[12px] tnum',
            r.daysRemaining < 0 && r.status !== 'completed'
              ? 'text-danger-fg font-medium'
              : 'text-ink-secondary',
          )}
          title={formatDate(r.dueOn)}
        >
          {r.status === 'completed' ? formatDate(r.dueOn) : formatDue(r.daysRemaining)}
        </span>
      ),
    },
    {
      key: 'next',
      header: 'Next step',
      secondary: true,
      value: (r) => r.nextStep,
      cell: (r) => <span className="text-[12px] text-ink-secondary">{r.nextStep}</span>,
    },
    {
      key: 'owner',
      header: 'Owner',
      secondary: true,
      nowrap: true,
      value: (r) => r.owner,
      cell: (r) => <span className="text-[12px] text-ink-secondary">{r.owner}</span>,
    },
  ]

  const detailCompetency = detail ? competencyById(detail.competencyId) : null

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Learning"
        description={
          <>
            Everything your role requires, what state it is in and what has to happen next.{' '}
            {member.role} · {dept?.name ?? member.departmentSlug}.
          </>
        }
        actions={
          plan.next && (
            <Button href={plan.next.href} variant="primary" icon={ArrowRight}>
              Resume {plan.next.title}
            </Button>
          )
        }
      />

      <KpiGrid columns={4}>
        <Kpi
          label="Assigned"
          value={String(counts.total)}
          caption={`${counts.mandatory} mandatory · ${counts.total - counts.mandatory} recommended`}
          icon={BookOpen}
          definition={{
            formula: 'Competencies your role level requires, from the department framework',
            source: 'Competency dictionary + role requirement rules',
          }}
        />
        <Kpi
          label="Completed"
          value={`${plan.completionPct}%`}
          caption={`${counts.completed} of ${counts.total} validated at required level`}
          tone={plan.completionPct >= 80 ? 'success' : 'warning'}
          statusLabel={plan.completionPct >= 80 ? 'On track' : 'Behind'}
          icon={CheckCircle2}
          definition={{
            formula: 'Competencies validated at or above required level ÷ total required',
            source: 'Recorded evidence across all four validation channels',
          }}
        />
        <Kpi
          label="Overdue"
          value={String(counts.overdue + counts.expired)}
          caption="Past the derived due date, or validation lapsed"
          tone={counts.overdue + counts.expired === 0 ? 'success' : 'danger'}
          statusLabel={counts.overdue + counts.expired === 0 ? 'Clear' : 'Action needed'}
          icon={AlertTriangle}
          definition={{ formula: DUE_POLICY_NOTE, source: 'Role start date + competency criticality' }}
        />
        <Kpi
          label="Expiring in 90 days"
          value={String(plan.expiringSoon.length)}
          caption="Validations needing renewal"
          tone={plan.expiringSoon.length === 0 ? 'success' : 'warning'}
          statusLabel={plan.expiringSoon.length === 0 ? 'None due' : 'Plan renewal'}
          icon={CalendarClock}
          definition={{
            formula: 'Next validation date within 90 days of the reporting date',
            source: 'Evidence date + revalidation window',
          }}
        />
      </KpiGrid>

      <Section
        title="Assigned learning"
        description="Mandatory items block role readiness; recommended items do not."
        meta={`As of ${formatDate(plan.asOf)} · ${DUE_POLICY_NOTE}`}
        action={
          <Segmented
            label="Filter learning"
            value={filter}
            onChange={setFilter}
            options={(Object.keys(FILTER_LABEL) as Filter[]).map((f) => ({
              value: f,
              label: FILTER_LABEL[f],
              count: plan.items.filter((i) => matches(i, f)).length,
            }))}
          />
        }
        padded={false}
      >
        <DataTable
          rows={rows}
          columns={columns}
          rowKey={(r) => r.competencyId}
          searchPlaceholder="Search competencies, status or next step…"
          exportName={`my-learning-${member.name.replace(/\s+/g, '-').toLowerCase()}`}
          onRowClick={setDetail}
          pageSize={12}
          caption="Competencies assigned to you, with status, level and due date"
          emptyHeadline={`Nothing ${FILTER_LABEL[filter].toLowerCase()}`}
          emptySupport={
            filter === 'overdue'
              ? 'Nothing is past its due date. Anything approaching one appears under In progress.'
              : 'No items match this filter. Switch to All to see your full plan.'
          }
          emptyAction={
            filter !== 'all' ? (
              <Button size="sm" onClick={() => setFilter('all')}>
                Show all
              </Button>
            ) : undefined
          }
          rowActions={(r) =>
            r.status === 'completed' ? (
              <span className="text-[11px] text-ink-tertiary">—</span>
            ) : (
              <Button size="sm" href={r.href}>
                {r.owner === 'Learner' ? 'Open' : 'View'}
              </Button>
            )
          }
        />
      </Section>

      {/* Learning history — validated items with a recorded date. */}
      <Section
        title="Learning history"
        description="Competencies you have had validated, most recent first."
        meta={`As of ${formatDate(plan.asOf)}`}
        padded={false}
      >
        {(() => {
          const history = plan.verdict.rows
            .filter((r) => r.validatedOn)
            .sort((a, b) => (b.validatedOn ?? '').localeCompare(a.validatedOn ?? ''))
          if (history.length === 0) {
            return (
              <Empty
                compact
                icon={History}
                headline="No validation history yet"
                support="Once an assessment is passed, a practical observation is recorded or a manager rating is filed, it appears here with its date."
              />
            )
          }
          return (
            <ul className="divide-y divide-hairline/6">
              {history.slice(0, 8).map((h) => (
                <li key={h.competencyId} className="flex items-center gap-3 px-5 py-3">
                  <CheckCircle2
                    size={15}
                    className={cn('flex-shrink-0', h.expired ? 'text-ink-tertiary' : 'text-success')}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium text-ink-primary truncate">
                      {h.name}
                    </span>
                    <span className="block text-[11px] text-ink-tertiary">
                      Validated at level {h.validated} — {PROFICIENCY_LABEL[h.validated]}
                    </span>
                  </span>
                  <span className="text-[11px] text-ink-secondary tnum whitespace-nowrap flex-shrink-0">
                    {formatDate(h.validatedOn)}
                  </span>
                  {h.expired && <StatusBadge tone="danger" label="Expired" size="sm" />}
                </li>
              ))}
            </ul>
          )
        })()}
      </Section>

      {/* Progressive disclosure: the full picture for one competency. */}
      <Drawer
        open={detail != null}
        onClose={() => setDetail(null)}
        title={detail?.title ?? ''}
        subtitle={detail ? `${detail.academy} · ${detail.type} competency` : undefined}
        width="lg"
        footer={
          detail && detail.status !== 'completed' ? (
            <>
              <Button onClick={() => setDetail(null)}>Close</Button>
              <Button variant="primary" href={detail.href}>
                {detail.owner === 'Learner' ? 'Start now' : 'View competency'}
              </Button>
            </>
          ) : (
            <Button onClick={() => setDetail(null)}>Close</Button>
          )
        }
      >
        {detail && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone={STATUS_TONE[detail.status]} label={STATUS_LABEL[detail.status]} />
              {detail.mandatory && <StatusBadge tone="danger" label="Mandatory" icon={Target} />}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-cream px-3 py-2.5">
                <p className="text-[11px] uppercase tracking-wide text-ink-tertiary">Your level</p>
                <p className="text-lg font-semibold text-ink-primary tnum">
                  {detail.validated}
                  <span className="text-ink-tertiary font-normal text-sm">/{detail.required}</span>
                </p>
                <p className="text-[11px] text-ink-tertiary">{PROFICIENCY_LABEL[detail.validated]}</p>
              </div>
              <div className="rounded-xl bg-cream px-3 py-2.5">
                <p className="text-[11px] uppercase tracking-wide text-ink-tertiary">Due</p>
                <p className="text-lg font-semibold text-ink-primary tnum">
                  {formatDate(detail.dueOn)}
                </p>
                <p
                  className={cn(
                    'text-[11px]',
                    detail.daysRemaining < 0 ? 'text-danger-fg' : 'text-ink-tertiary',
                  )}
                >
                  {formatDue(detail.daysRemaining)}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-[13px] font-semibold text-ink-primary">What happens next</h3>
              <p className="text-[13px] text-ink-secondary mt-1">{detail.nextStep}.</p>
              <p className="text-[11px] text-ink-tertiary mt-1">Owned by: {detail.owner}</p>
              {detail.heldBackBy && (
                <Notice tone="info" icon={Info} className="mt-3">
                  Your validated level is held at {detail.validated} by {detail.heldBackBy}. A
                  validated level is never an average — it is the lowest ceiling across the four
                  evidence channels, so closing the weakest channel is what moves the number.
                </Notice>
              )}
            </div>

            {detailCompetency && (
              <>
                <div>
                  <h3 className="text-[13px] font-semibold text-ink-primary">
                    Why this matters for your role
                  </h3>
                  <p className="text-[13px] text-ink-secondary mt-1 leading-relaxed">
                    {detailCompetency.outcome}
                  </p>
                </div>
                <div>
                  <h3 className="text-[13px] font-semibold text-ink-primary">What it covers</h3>
                  <p className="text-[13px] text-ink-secondary mt-1 leading-relaxed">
                    {detailCompetency.coreTopics}
                  </p>
                </div>
              </>
            )}

            {detail.expiresOn && (
              <div>
                <h3 className="text-[13px] font-semibold text-ink-primary">Validity</h3>
                <p className="text-[13px] text-ink-secondary mt-1">
                  Valid until {formatDate(detail.expiresOn)}
                  {detail.expiringSoon && ' — renewal due within 90 days'}.
                </p>
              </div>
            )}

            <div className="pt-1">
              <Link
                href={`/skills-passport?competency=${encodeURIComponent(detail.competencyId)}`}
                className="text-[12px] font-medium text-accent-copper hover:underline inline-flex items-center gap-1"
              >
                <ClipboardCheck size={13} /> See the full evidence record
              </Link>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
