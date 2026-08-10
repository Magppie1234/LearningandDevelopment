'use client'

import Link from 'next/link'
import { Section, StatusBadge, type Column, DataTable } from '@/components/ds'
import { CiPageFrame } from './CiShell'
import { useCi } from './CiContext'
import { ConfidenceChip, NotMeasurable, ProvenanceBadge } from './CiPrimitives'
import {
  customerSentimentScore,
  purchaseReadinessScore,
  readinessBand,
  agentQualityScore,
} from '@/lib/call-intelligence/scoring'
import type { CallRecord } from '@/lib/call-intelligence/types'
import { EMPLOYEE_BY_ID, TEAM_BY_ID } from '@/data/call-intelligence/taxonomy'

/**
 * Call Explorer — page 8, and the terminal node of every drill-down.
 *
 * Every KPI, bar and heat cell elsewhere in the section links here with the
 * filter set encoded in the URL, so "which calls are behind this number?" is
 * always one click and always reproducible.
 */

function sentimentTone(band: string) {
  return band === 'positive' ? 'success' : band === 'negative' ? 'danger' : 'neutral'
}

function readinessTone(band: string) {
  return band === 'high' ? 'success' : band === 'medium' ? 'warning' : 'neutral'
}

export default function CallExplorer() {
  const { periodLabel, comparisonLabel } = useCi()

  return (
    <CiPageFrame
      title="Call Explorer"
      question="Find and read a specific call. Everything on the other nine pages resolves down to a row in this table."
    >
      {(data) => {
        const columns: Column<CallRecord>[] = [
          {
            key: 'callId',
            header: 'Call',
            sortable: true,
            nowrap: true,
            value: (c) => c.callId,
            cell: (c) => (
              <Link
                href={`/call-intelligence/explorer/${c.callId}`}
                className="font-medium text-accent-copper hover:underline"
              >
                {c.callId}
              </Link>
            ),
          },
          {
            key: 'startedAt',
            header: 'When',
            sortable: true,
            nowrap: true,
            value: (c) => c.startedAt,
            cell: (c) => (
              <span className="text-ink-secondary tnum">
                {new Date(c.startedAt).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            ),
          },
          {
            key: 'customer',
            header: 'Customer',
            sortable: true,
            value: (c) => c.customerName,
            cell: (c) => (
              <span className="min-w-0">
                <span className="block truncate max-w-[180px]">{c.customerName}</span>
                <span className="block text-[11px] text-ink-tertiary">
                  {c.city} · {c.customerSegment}
                </span>
              </span>
            ),
          },
          {
            key: 'employee',
            header: 'Agent',
            sortable: true,
            secondary: true,
            value: (c) => EMPLOYEE_BY_ID[c.employeeId]?.name ?? c.employeeId,
            cell: (c) => (
              <span className="min-w-0">
                <span className="block truncate">
                  {EMPLOYEE_BY_ID[c.employeeId]?.name ?? c.employeeId}
                </span>
                <span className="block text-[11px] text-ink-tertiary">
                  {TEAM_BY_ID[c.teamId]?.name ?? c.teamId}
                </span>
              </span>
            ),
          },
          {
            key: 'duration',
            header: 'Length',
            sortable: true,
            align: 'right',
            nowrap: true,
            secondary: true,
            value: (c) => c.durationSec,
            cell: (c) => (
              <span className="tnum text-ink-secondary">
                {Math.floor(c.durationSec / 60)}:{String(c.durationSec % 60).padStart(2, '0')}
              </span>
            ),
          },
          {
            key: 'sentiment',
            header: 'Sentiment (text)',
            sortable: true,
            nowrap: true,
            value: (c) => customerSentimentScore(c.customerSentiment).overall,
            cell: (c) => {
              const s = customerSentimentScore(c.customerSentiment)
              return (
                <StatusBadge
                  size="sm"
                  tone={sentimentTone(s.band)}
                  label={`${s.band} ${s.overall}`}
                  title="Text-based sentiment from transcript wording. Not voice-tone analysis."
                />
              )
            },
          },
          {
            key: 'readiness',
            header: 'Readiness',
            sortable: true,
            nowrap: true,
            value: (c) => purchaseReadinessScore(c.readinessComponents),
            cell: (c) => {
              const r = purchaseReadinessScore(c.readinessComponents)
              return (
                <StatusBadge
                  size="sm"
                  tone={readinessTone(readinessBand(r))}
                  label={`${readinessBand(r)} ${r}`}
                  title="Purchase readiness — not a conversion probability (§7)."
                />
              )
            },
          },
          {
            key: 'quality',
            header: 'Agent quality',
            sortable: true,
            nowrap: true,
            secondary: true,
            value: (c) => (c.transcript.length > 2 ? agentQualityScore(c).score : null),
            cell: (c) => {
              if (c.transcript.length <= 2) {
                return <span className="text-[11px] text-ink-tertiary">No conversation</span>
              }
              const q = agentQualityScore(c)
              return (
                <span className="inline-flex items-center gap-1.5">
                  <span className="tnum font-medium">{q.score}</span>
                  {q.hasCriticalFailure && (
                    <StatusBadge
                      size="sm"
                      tone="danger"
                      label="Critical"
                      title={`Critical compliance failure: ${q.criticalFailures.join(', ')}. Reported beside the score, never averaged into it (§7).`}
                    />
                  )}
                </span>
              )
            },
          },
          {
            key: 'outcome',
            header: 'CRM outcome',
            sortable: true,
            secondary: true,
            value: (c) => c.crm.crmLossReason ?? (c.crm.orderPlaced ? 'Order placed' : c.crmStage),
            cell: (c) =>
              c.crm.provenance === 'crm_verified' ? (
                <span className="min-w-0">
                  <span className="block text-[13px]">
                    {c.crm.orderPlaced
                      ? 'Order placed'
                      : c.crm.opportunityCreated
                        ? 'Opportunity'
                        : c.crmStage}
                  </span>
                  {c.crm.crmLossReason && (
                    <span
                      className="block text-[11px] text-ink-tertiary"
                      title="CRM's own loss reason. Never the AI's hesitation summary (§6)."
                    >
                      Lost: {c.crm.crmLossReason}
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-[11px] text-ink-tertiary">Not linked to CRM</span>
              ),
          },
          {
            key: 'confidence',
            header: 'Confidence',
            sortable: true,
            nowrap: true,
            secondary: true,
            value: (c) => c.extractionConfidence,
            cell: (c) =>
              c.transcriptAvailable ? (
                <ConfidenceChip value={c.extractionConfidence} />
              ) : (
                <StatusBadge size="sm" tone="danger" label="Transcription failed" />
              ),
          },
        ]

        return (
          <Section
            title={`${data.calls.length} calls match the current filters`}
            description="Sorting, searching and pagination run over the filtered set. The confidence gate in the filter bar decides whether low-confidence transcripts appear here at all."
            meta={`${periodLabel} · compared with ${comparisonLabel} · ${data.allCalls.length - data.calls.length} excluded by the confidence gate`}
            padded={false}
          >
            <DataTable
              rows={data.calls}
              columns={columns}
              rowKey={(c) => c.callId}
              pageSize={15}
              exportName={`sunroof-calls-${data.calls.length}`}
              searchPlaceholder="Search call ID, customer, agent, city…"
              caption="Calls matching the current Call Intelligence filters"
              emptyHeadline="No calls match these filters"
              emptySupport="Nothing in the selected period matches. Clear a filter or widen the date range in the bar above."
            />
          </Section>
        )
      }}
    </CiPageFrame>
  )
}

/** Shown on the detail page when diarisation is not reliable enough (§8). */
export function TalkMetricsPanel({ call }: { call: CallRecord }) {
  if (!call.dynamics.reliable) {
    return (
      <NotMeasurable reason="diarisation confidence on this call is below 75%, so talk ratio, interruptions and silence cannot be attributed to the right speaker." />
    )
  }
  const d = call.dynamics
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
      <div>
        <dt className="text-[11px] text-ink-tertiary">Agent talk share</dt>
        <dd className="tnum text-ink-primary">{Math.round(d.talkToListenRatio * 100)}%</dd>
      </div>
      <div>
        <dt className="text-[11px] text-ink-tertiary">Interruptions</dt>
        <dd className="tnum text-ink-primary">{d.interruptions}</dd>
      </div>
      <div>
        <dt className="text-[11px] text-ink-tertiary">Longest silence</dt>
        <dd className="tnum text-ink-primary">{d.longestSilenceSec}s</dd>
      </div>
      <div>
        <dt className="text-[11px] text-ink-tertiary">Provenance</dt>
        <dd>
          <ProvenanceBadge provenance="ai_inferred" />
        </dd>
      </div>
    </dl>
  )
}
