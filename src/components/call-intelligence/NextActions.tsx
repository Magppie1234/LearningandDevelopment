'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Clock } from 'lucide-react'
import {
  Card,
  DataTable,
  Notice,
  Section,
  Segmented,
  StatusBadge,
  type Column,
  type Tone,
} from '@/components/ds'
import { CiPageFrame } from './CiShell'
import { useCi } from './CiContext'
import { EvidenceLink, ProvenanceBadge } from './CiPrimitives'
import { CompositionBar, RankedBars } from './CiCharts'
import {
  ACTION_STATUS_LABEL,
  APPROVAL_REQUIRED_ACTIONS,
  SLA_STATUS_LABEL,
  summariseActions,
} from '@/lib/call-intelligence/actions'
import { can } from '@/lib/call-intelligence/rbac'
import type { ActionRecord } from '@/lib/call-intelligence/types'
import { ACTION_TYPE_BY_ID, TEAM_BY_ID } from '@/data/call-intelligence/taxonomy'

/**
 * Next-Action Tracker — page 7.
 *
 * §9's separation is the spine of this page: what an employee **promised the
 * customer on the call** is a debt, and what the model **thinks would be a good
 * idea** is a suggestion. They are counted separately, listed separately, and
 * the SLA clock only runs on the first kind.
 *
 * Nothing here executes. Approving an action is a human act that would hand off
 * to the task system through `TaskAdapter` — which is not connected, and says so
 * rather than pretending the button worked.
 */

const SLA_TONE: Record<string, Tone> = {
  overdue: 'danger',
  due_today: 'warning',
  on_track: 'success',
  met: 'success',
  not_applicable: 'neutral',
}

type Origin = 'all' | 'committed' | 'recommended'

const ORIGINS: { value: Origin; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'committed', label: 'Promised on a call' },
  { value: 'recommended', label: 'AI-recommended' },
]

export default function NextActions() {
  const { periodLabel, comparisonLabel, viewer } = useCi()
  const [origin, setOrigin] = useState<Origin>('all')

  return (
    <CiPageFrame
      title="Next-Action Tracker"
      question="What did we promise customers, what is already late, and what does the model suggest we do next?"
    >
      {(data) => {
        const all = data.actions
        const shown = origin === 'all' ? all : all.filter((a) => a.origin === origin)
        const summary = summariseActions(all)
        const committedSummary = summariseActions(all.filter((a) => a.origin === 'committed'))

        const byOwner = new Map<string, { total: number; overdue: number }>()
        for (const a of all) {
          const e = byOwner.get(a.ownerName) ?? { total: 0, overdue: 0 }
          e.total += 1
          if (a.slaStatus === 'overdue') e.overdue += 1
          byOwner.set(a.ownerName, e)
        }
        const owners = Array.from(byOwner.entries()).sort((x, y) => y[1].overdue - x[1].overdue)

        const byType = new Map<string, number>()
        for (const a of all) {
          const label = ACTION_TYPE_BY_ID[a.actionTypeId].label
          byType.set(label, (byType.get(label) ?? 0) + 1)
        }

        const columns: Column<ActionRecord>[] = [
          {
            key: 'origin',
            header: 'Origin',
            sortable: true,
            nowrap: true,
            value: (a) => a.origin,
            cell: (a) => (
              <StatusBadge
                size="sm"
                tone={a.origin === 'committed' ? 'info' : 'neutral'}
                label={a.origin === 'committed' ? `Promised (${a.committedBy})` : 'AI-recommended'}
                title={
                  a.origin === 'committed'
                    ? 'Explicitly promised on the call. This is a debt to the customer and the SLA clock runs on it.'
                    : 'Suggested by the model. Not promised to anyone — no SLA, and it needs a human decision before it becomes work.'
                }
              />
            ),
          },
          {
            key: 'action',
            header: 'Action',
            sortable: true,
            value: (a) => ACTION_TYPE_BY_ID[a.actionTypeId].label,
            cell: (a) => (
              <span className="min-w-0">
                <span className="block text-[13px] font-medium text-ink-primary">
                  {ACTION_TYPE_BY_ID[a.actionTypeId].label}
                </span>
                <span className="block text-[11px] text-ink-tertiary truncate max-w-[260px]">
                  {a.reason}
                </span>
              </span>
            ),
          },
          {
            key: 'customer',
            header: 'Customer',
            sortable: true,
            value: (a) => a.customerName,
            cell: (a) => (
              <Link
                href={`/call-intelligence/explorer/${a.callId}`}
                className="text-[13px] text-accent-copper hover:underline"
              >
                {a.customerName}
              </Link>
            ),
          },
          {
            key: 'owner',
            header: 'Owner',
            sortable: true,
            secondary: true,
            value: (a) => a.ownerName,
            cell: (a) => (
              <span className="min-w-0">
                <span className="block text-[13px]">{a.ownerName}</span>
                <span className="block text-[11px] text-ink-tertiary">
                  {TEAM_BY_ID[a.teamId]?.name ?? a.teamId}
                </span>
              </span>
            ),
          },
          {
            key: 'due',
            header: 'Due',
            sortable: true,
            nowrap: true,
            value: (a) => a.dueAt,
            cell: (a) => (
              <span className="tnum text-[12px] text-ink-secondary">
                {new Date(a.dueAt).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            ),
          },
          {
            key: 'sla',
            header: 'SLA',
            sortable: true,
            nowrap: true,
            value: (a) => a.slaStatus,
            cell: (a) => (
              <StatusBadge
                size="sm"
                tone={SLA_TONE[a.slaStatus] ?? 'neutral'}
                label={SLA_STATUS_LABEL[a.slaStatus]}
                title={
                  a.slaStatus === 'not_applicable'
                    ? 'The customer promised this, not us. Tracked for context — we do not owe it and it is not counted as late.'
                    : undefined
                }
              />
            ),
          },
          {
            key: 'status',
            header: 'Status',
            sortable: true,
            nowrap: true,
            value: (a) => a.status,
            cell: (a) => (
              <span className="inline-flex items-center gap-1.5">
                <span className="text-[12px]">{ACTION_STATUS_LABEL[a.status]}</span>
                {APPROVAL_REQUIRED_ACTIONS.includes(a.actionTypeId) && (
                  <StatusBadge
                    size="sm"
                    tone="warning"
                    label="Needs approval"
                    title="This action type cannot proceed on an AI recommendation alone — a manager must approve it (§9)."
                  />
                )}
              </span>
            ),
          },
          {
            key: 'evidence',
            header: 'Evidence',
            secondary: true,
            value: (a) => a.evidence?.quote ?? '',
            cell: (a) => <EvidenceLink callId={a.callId} evidence={a.evidence} showQuote={false} />,
          },
        ]

        return (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <p className="text-[11px] uppercase tracking-wide text-ink-tertiary">
                  Promised to customers
                </p>
                <p className="mt-1.5 text-[26px] font-semibold tnum text-ink-primary">
                  {summary.committed}
                </p>
                <p className="text-[11px] text-ink-tertiary">
                  {committedSummary.overdue} already late
                </p>
                <div className="mt-2">
                  <ProvenanceBadge provenance="ai_inferred" />
                </div>
                <p className="mt-1.5 text-[11px] text-ink-tertiary leading-snug">
                  Extracted from what was said on the call, with the transcript turn attached to
                  every row.
                </p>
              </Card>
              <Card>
                <p className="text-[11px] uppercase tracking-wide text-ink-tertiary">
                  AI-recommended
                </p>
                <p className="mt-1.5 text-[26px] font-semibold tnum text-ink-primary">
                  {summary.recommended}
                </p>
                <p className="text-[11px] text-ink-tertiary">Suggestions, not obligations</p>
                <div className="mt-2">
                  <ProvenanceBadge provenance="ai_inferred" />
                </div>
                <p className="mt-1.5 text-[11px] text-ink-tertiary leading-snug">
                  Counted separately and never added to the promised total — the two mean different
                  things to a customer.
                </p>
              </Card>
              <Card>
                <p className="text-[11px] uppercase tracking-wide text-ink-tertiary">Overdue</p>
                <p className="mt-1.5 text-[26px] font-semibold tnum text-danger-fg">
                  {summary.overdue}
                </p>
                <p className="text-[11px] text-ink-tertiary">
                  of {summary.denominator} with a live SLA
                </p>
                <div className="mt-2">
                  <CompositionBar
                    total={summary.denominator}
                    segments={[
                      { label: 'Overdue', value: summary.overdue, tone: 'danger' },
                      { label: 'Due today', value: summary.dueToday, tone: 'warning' },
                      {
                        label: 'On track',
                        value: Math.max(
                          0,
                          summary.denominator - summary.overdue - summary.dueToday,
                        ),
                        tone: 'success',
                      },
                    ]}
                  />
                </div>
              </Card>
              <Card>
                <p className="text-[11px] uppercase tracking-wide text-ink-tertiary">
                  Completion rate
                </p>
                <p className="mt-1.5 text-[26px] font-semibold tnum text-ink-primary">
                  {summary.completionPct}%
                </p>
                <p className="text-[11px] text-ink-tertiary">
                  {summary.completed} of {summary.denominator} closable actions
                </p>
                <p className="mt-2 text-[11px] text-ink-tertiary leading-snug">
                  Customer-owned promises are excluded from the denominator — we cannot complete
                  something the customer said they would do.
                </p>
              </Card>
            </div>

            <Notice tone="warning" icon={Clock}>
              <strong>Nothing on this page executes automatically.</strong> No task is created, no
              CRM stage is changed, no discount is applied and no lead is closed from a transcript
              inference (§13). Approving an action here would hand off to the task system through the{' '}
              <code>TaskAdapter</code> contract — which is not connected yet, so the controls are
              read-only rather than fake.
              {!can(viewer, 'approve_actions') && (
                <span className="block mt-1">
                  Your current role ({viewer.roleId.replace(/_/g, ' ')}) cannot approve actions in any
                  case.
                </span>
              )}
            </Notice>

            <div className="grid gap-4 lg:grid-cols-2">
              <Section
                title="Who is carrying the overdue work"
                description="Owners ranked by what is already late. This is a workload question before it is a performance question."
                meta={`${periodLabel} · ${all.length} actions across ${owners.length} owners`}
              >
                {owners.length === 0 ? (
                  <p className="text-xs text-ink-secondary">No actions in this window.</p>
                ) : (
                  <RankedBars
                    rows={owners.map(([name, v]) => ({
                      id: name,
                      label: name,
                      value: v.overdue,
                      valueLabel: `${v.overdue} overdue of ${v.total}`,
                      tone: v.overdue > 0 ? 'danger' : 'success',
                    }))}
                  />
                )}
              </Section>

              <Section
                title="What kind of work this is"
                description="The mix of action types tells you where the operational load sits — quotations, callbacks, site visits or escalations."
                meta={`${all.length} actions · SLA hours are set per action type in the taxonomy`}
              >
                {byType.size === 0 ? (
                  <p className="text-xs text-ink-secondary">No actions in this window.</p>
                ) : (
                  <RankedBars
                    rows={Array.from(byType.entries())
                      .sort((a, b) => b[1] - a[1])
                      .map(([label, count]) => ({
                        id: label,
                        label,
                        value: count,
                        valueLabel: `${count}`,
                        tone: 'info' as const,
                      }))}
                  />
                )}
              </Section>
            </div>

            <Section
              title="The action queue"
              description="Promised and recommended actions, filtered by origin. Every row links back to the transcript turn that produced it."
              meta={`${periodLabel} · compared with ${comparisonLabel}`}
              // Segmented renders a <div role="tablist">, and `meta` renders
              // inside a <p> — nesting them is invalid HTML and trips a
              // hydration error. `action` is the div-hosted slot.
              action={
                <Segmented
                  options={ORIGINS}
                  value={origin}
                  onChange={setOrigin}
                  label="Filter by origin"
                />
              }
              padded={false}
            >
              <DataTable
                rows={shown}
                columns={columns}
                rowKey={(a) => a.id}
                pageSize={15}
                exportName={`sunroof-actions-${origin}`}
                searchPlaceholder="Search customers, owners, action types…"
                caption="Committed and recommended actions with SLA status"
                emptyHeadline="Nothing owed and nothing suggested"
                emptySupport="No call in the current filter set produced a commitment or a recommendation."
              />
            </Section>

            <Section
              title="Actions that always need a human decision"
              description="These action types can never proceed on an AI recommendation alone, regardless of confidence."
              meta="Defined in taxonomy.ts → ACTION_TYPES.requiresApproval"
            >
              <ul className="flex flex-wrap gap-1.5">
                {APPROVAL_REQUIRED_ACTIONS.map((id) => (
                  <li key={id}>
                    <StatusBadge
                      size="sm"
                      tone="warning"
                      icon={CheckCircle2}
                      label={ACTION_TYPE_BY_ID[id].label}
                    />
                  </li>
                ))}
              </ul>
            </Section>
          </div>
        )
      }}
    </CiPageFrame>
  )
}
