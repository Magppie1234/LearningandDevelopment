'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'
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
import { EvidenceLink } from './CiPrimitives'
import { CompositionBar, RankedBars } from './CiCharts'
import { ALERT_RULES, ALERT_RULE_BY_ID, ALERT_SLA_HOURS, alertSummary } from '@/lib/call-intelligence/alerts'
import { can } from '@/lib/call-intelligence/rbac'
import type { AlertRecord, AlertSeverity } from '@/lib/call-intelligence/types'

/**
 * Alerts & Escalations — page 9.
 *
 * The one page in the section that is a worklist rather than a report. Sorted
 * by severity then recency, every row carries the rule that fired it, the
 * evidence that triggered it and the response the business has agreed to — so
 * acting on an alert never requires guessing what it meant.
 *
 * Critical alerts are marked as requiring human review before any action. That
 * is a hard rule (§13): the system raises, a person decides.
 */

const SEVERITY_TONE: Record<AlertSeverity, Tone> = {
  critical: 'danger',
  high: 'warning',
  medium: 'info',
  low: 'neutral',
}

type Filter = 'all' | AlertSeverity

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

export default function AlertsEscalations() {
  const { periodLabel, comparisonLabel, viewer } = useCi()
  const [severity, setSeverity] = useState<Filter>('all')

  return (
    <CiPageFrame
      title="Alerts & Escalations"
      question="What must not wait until the weekly review — and who owns it?"
    >
      {(data) => {
        const all = data.alerts
        const shown = severity === 'all' ? all : all.filter((a) => a.severity === severity)
        const summary = alertSummary(all)

        const byRule = new Map<string, number>()
        for (const a of all) byRule.set(a.ruleId, (byRule.get(a.ruleId) ?? 0) + 1)
        const firedRules = Array.from(byRule.entries()).sort((x, y) => y[1] - x[1])
        const silentRules = ALERT_RULES.filter((r) => !byRule.has(r.id))

        const byOwner = new Map<string, number>()
        for (const a of all) byOwner.set(a.ownerName, (byOwner.get(a.ownerName) ?? 0) + 1)

        const columns: Column<AlertRecord>[] = [
          {
            key: 'severity',
            header: 'Severity',
            sortable: true,
            nowrap: true,
            value: (a) => ({ critical: 0, high: 1, medium: 2, low: 3 })[a.severity],
            cell: (a) => (
              <span className="inline-flex flex-col gap-1 items-start">
                <StatusBadge size="sm" tone={SEVERITY_TONE[a.severity]} label={a.severity} />
                {a.requiresManualReview && (
                  <span
                    className="text-[10px] text-ink-tertiary whitespace-nowrap"
                    title="A person must review this before any action is taken (§13)."
                  >
                    human review required
                  </span>
                )}
              </span>
            ),
          },
          {
            key: 'title',
            header: 'Alert',
            sortable: true,
            value: (a) => a.title,
            cell: (a) => (
              <span className="min-w-0">
                <span className="block text-[13px] font-medium text-ink-primary">{a.title}</span>
                <span className="block text-[11px] text-ink-tertiary truncate max-w-[280px]">
                  {a.reason}
                </span>
              </span>
            ),
          },
          {
            key: 'subject',
            header: 'Subject',
            sortable: true,
            value: (a) => a.subject,
            cell: (a) =>
              a.callId ? (
                <Link
                  href={`/call-intelligence/explorer/${a.callId}`}
                  className="text-[13px] text-accent-copper hover:underline"
                >
                  {a.subject}
                </Link>
              ) : (
                <span className="text-[13px]">{a.subject}</span>
              ),
          },
          {
            key: 'owner',
            header: 'Owner',
            sortable: true,
            secondary: true,
            value: (a) => a.ownerName,
            cell: (a) => <span className="text-[12px]">{a.ownerName}</span>,
          },
          {
            key: 'resolveBy',
            header: 'Resolve by',
            sortable: true,
            nowrap: true,
            value: (a) => a.resolveBy,
            cell: (a) => (
              <span className="min-w-0">
                <span className="block tnum text-[12px] text-ink-secondary">
                  {new Date(a.resolveBy).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
                <span className="block text-[11px] text-ink-tertiary">
                  {ALERT_SLA_HOURS[a.severity]}h SLA
                </span>
              </span>
            ),
          },
          {
            key: 'response',
            header: 'Agreed response',
            secondary: true,
            value: (a) => a.recommendedResponse,
            cell: (a) => (
              <span className="text-[12px] text-ink-secondary">{a.recommendedResponse}</span>
            ),
          },
          {
            key: 'evidence',
            header: 'Evidence',
            secondary: true,
            value: (a) => a.evidenceNote,
            cell: (a) =>
              a.callId && a.evidence ? (
                <EvidenceLink callId={a.callId} evidence={a.evidence} showQuote={false} />
              ) : (
                <span className="text-[11px] text-ink-tertiary">{a.evidenceNote}</span>
              ),
          },
        ]

        return (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <p className="text-[11px] uppercase tracking-wide text-ink-tertiary">Open alerts</p>
                <p className="mt-1.5 text-[26px] font-semibold tnum text-ink-primary">
                  {summary.total}
                </p>
                <div className="mt-2">
                  <CompositionBar
                    total={summary.total}
                    segments={[
                      { label: 'Critical', value: summary.critical, tone: 'danger' },
                      { label: 'High', value: summary.high, tone: 'warning' },
                      { label: 'Medium', value: summary.medium, tone: 'info' },
                      { label: 'Low', value: summary.low, tone: 'neutral' },
                    ]}
                  />
                </div>
              </Card>
              <Card>
                <p className="text-[11px] uppercase tracking-wide text-ink-tertiary">
                  Critical, awaiting human review
                </p>
                <p className="mt-1.5 text-[26px] font-semibold tnum text-danger-fg">
                  {summary.awaitingReview}
                </p>
                <p className="text-[11px] text-ink-tertiary">
                  4-hour SLA · nothing acts on these automatically
                </p>
              </Card>
              <Card>
                <p className="text-[11px] uppercase tracking-wide text-ink-tertiary">Rules fired</p>
                <p className="mt-1.5 text-[26px] font-semibold tnum text-ink-primary">
                  {firedRules.length}
                </p>
                <p className="text-[11px] text-ink-tertiary">of {ALERT_RULES.length} configured</p>
                <p className="mt-2 text-[11px] text-ink-tertiary leading-snug">
                  A rule that never fires is either well-behaved or misconfigured. The silent ones are
                  listed at the bottom of this page rather than hidden.
                </p>
              </Card>
              <Card>
                <p className="text-[11px] uppercase tracking-wide text-ink-tertiary">Owners</p>
                <p className="mt-1.5 text-[26px] font-semibold tnum text-ink-primary">
                  {byOwner.size}
                </p>
                <p className="text-[11px] text-ink-tertiary">
                  distinct owners across the open queue
                </p>
                {!can(viewer, 'resolve_alerts') && (
                  <p className="mt-2 text-[11px] text-warning-fg leading-snug">
                    Your role cannot resolve alerts — this is a read-only view for you.
                  </p>
                )}
              </Card>
            </div>

            <Notice tone="danger" icon={ShieldAlert}>
              <strong>Critical alerts require a person.</strong> The system raises them and states
              the agreed response; it never sends the message, applies the credit, changes the CRM
              stage or closes the ticket. Every critical rule here — legal threat, mis-selling,
              unapproved discount, sensitive data exposure, cancellation — is flagged for manual
              review by design (§13).
            </Notice>

            <div className="grid gap-4 lg:grid-cols-2">
              <Section
                title="Which rules are firing"
                description="Volume by rule. A spike in one rule usually means a process problem, not a run of unlucky calls."
                meta={`${periodLabel} · compared with ${comparisonLabel}`}
              >
                {firedRules.length === 0 ? (
                  <p className="text-xs text-ink-secondary">No rule fired in this window.</p>
                ) : (
                  <RankedBars
                    rows={firedRules.map(([ruleId, count]) => {
                      const rule = ALERT_RULE_BY_ID[ruleId as keyof typeof ALERT_RULE_BY_ID]
                      return {
                        id: ruleId,
                        label: rule.label,
                        value: count,
                        valueLabel: `${count}`,
                        deltaLabel: `${rule.defaultOwner} · ${ALERT_SLA_HOURS[rule.severity]}h SLA`,
                        tone: SEVERITY_TONE[rule.severity],
                        title: rule.trigger,
                      }
                    })}
                  />
                )}
              </Section>

              <Section
                title="Where the queue sits"
                description="Open alerts by owner. Concentration in one owner is a capacity problem before it is an escalation problem."
                meta={`${all.length} open alerts`}
              >
                {byOwner.size === 0 ? (
                  <p className="text-xs text-ink-secondary">Nothing open.</p>
                ) : (
                  <RankedBars
                    rows={Array.from(byOwner.entries())
                      .sort((x, y) => y[1] - x[1])
                      .map(([name, count]) => ({
                        id: name,
                        label: name,
                        value: count,
                        valueLabel: `${count}`,
                        tone: 'info' as const,
                      }))}
                  />
                )}
              </Section>
            </div>

            <Section
              title="The queue"
              description="Sorted by severity, then by most recently raised. Each row states the rule, the evidence and the response the business has already agreed to."
              meta={`${periodLabel} · compared with ${comparisonLabel}`}
              // `meta` renders inside a <p>; Segmented is a <div role="tablist">.
              // It belongs in `action`, which is div-hosted.
              action={
                <Segmented
                  options={FILTERS}
                  value={severity}
                  onChange={setSeverity}
                  label="Filter by severity"
                />
              }
              padded={false}
            >
              <DataTable
                rows={shown}
                columns={columns}
                rowKey={(a) => a.id}
                pageSize={15}
                exportName={`sunroof-alerts-${severity}`}
                searchPlaceholder="Search alerts, subjects, owners…"
                caption="Open alerts with severity, owner and SLA"
                emptyHeadline="Nothing needs escalating"
                emptySupport="No rule fired against the calls in the current filter set. That is a good day, not a broken page."
              />
            </Section>

            <Section
              title={`Rules that did not fire (${silentRules.length} of ${ALERT_RULES.length})`}
              description="Listed so a silent rule is a visible fact rather than an assumption. A rule that never fires across a full period is worth checking — either the behaviour genuinely is not happening, or the trigger is wrong."
              meta="Full catalogue in alerts.ts → ALERT_RULES"
            >
              {silentRules.length === 0 ? (
                <p className="text-xs text-ink-secondary">Every configured rule fired this period.</p>
              ) : (
                <ul className="space-y-2">
                  {silentRules.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <StatusBadge size="sm" tone={SEVERITY_TONE[r.severity]} label={r.severity} />
                          <span className="text-[13px] text-ink-primary font-medium">{r.label}</span>
                        </div>
                        <p className="text-[11px] text-ink-tertiary mt-0.5">{r.trigger}</p>
                      </div>
                      <span className="text-[11px] text-ink-tertiary whitespace-nowrap">
                        {r.defaultOwner}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </div>
        )
      }}
    </CiPageFrame>
  )
}
