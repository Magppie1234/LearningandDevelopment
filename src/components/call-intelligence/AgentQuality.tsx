'use client'

import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'
import { DataTable, Notice, Section, StatusBadge, type Column } from '@/components/ds'
import { CiPageFrame } from './CiShell'
import { useCi } from './CiContext'
import { NotMeasurable, ProvenanceBadge, SampleSizeNote } from './CiPrimitives'
import { CiChartFrame, IntensityHeatmap, QuadrantScatter, RankedBars } from './CiCharts'
import { agentAggregates, qualityVsConversion, type AgentRow } from '@/lib/call-intelligence/metrics'
import { agentQualityScore, QUALITY_WEIGHTS } from '@/lib/call-intelligence/scoring'
import { PROHIBITED_SCORING_ATTRIBUTES } from '@/lib/call-intelligence/rbac'
import { COMPLIANCE_BY_ID, EMPLOYEES, TEAMS, THRESHOLDS } from '@/data/call-intelligence/taxonomy'

/**
 * Agent Quality — page 6.
 *
 * Three rules from the brief are load-bearing here and are enforced in the
 * layout, not just the copy:
 *
 *  - **A negative customer is not a bad agent.** Customer sentiment and agent
 *    quality are never plotted against each other and never correlated.
 *  - **Critical compliance failures sit beside the score, never inside it.** A
 *    92 with a mis-selling flag is not a good call.
 *  - **Talk metrics only where diarisation is reliable.** Everywhere else the
 *    cell says why it is blank rather than showing a plausible zero.
 */

export default function AgentQuality() {
  const { periodLabel, comparisonLabel, hrefWithFilters, viewer } = useCi()

  return (
    <CiPageFrame
      title="Agent Quality & Coaching"
      question="Who needs coaching, on what specifically — and is the sample behind that judgement big enough to be fair to them?"
    >
      {(data) => {
        const rows = agentAggregates(data.calls, EMPLOYEES, TEAMS, data.actions)
        const scatter = qualityVsConversion(rows)

        const withCritical = data.calls.filter(
          (c) => c.transcript.length > 2 && agentQualityScore(c).hasCriticalFailure,
        )
        const criticalByAgent = new Map<string, number>()
        for (const c of withCritical) {
          criticalByAgent.set(c.employeeId, (criticalByAgent.get(c.employeeId) ?? 0) + 1)
        }

        const unreliableDiarisation = data.calls.filter(
          (c) => c.transcript.length > 2 && !c.dynamics.reliable,
        ).length
        const conversational = data.calls.filter((c) => c.transcript.length > 2).length

        const columns: Column<AgentRow>[] = [
          {
            key: 'name',
            header: 'Agent',
            sortable: true,
            value: (r) => r.name,
            cell: (r) => (
              <span className="min-w-0">
                <Link
                  href={hrefWithFilters('/call-intelligence/explorer', { employeeId: [r.employeeId] })}
                  className="text-[13px] font-medium text-ink-primary hover:text-accent-copper"
                >
                  {r.name}
                </Link>
                <span className="block text-[11px] text-ink-tertiary">
                  {r.teamName} · {r.manager}
                </span>
              </span>
            ),
          },
          {
            key: 'calls',
            header: 'Calls scored',
            sortable: true,
            align: 'right',
            nowrap: true,
            value: (r) => r.analysedCalls,
            cell: (r) => (
              <span className="min-w-0">
                <span className="tnum block">
                  {r.analysedCalls}{' '}
                  <span className="text-[11px] text-ink-tertiary">of {r.calls}</span>
                </span>
                <SampleSizeNote n={r.analysedCalls} />
              </span>
            ),
          },
          {
            key: 'quality',
            header: 'Quality',
            sortable: true,
            align: 'right',
            nowrap: true,
            value: (r) => r.avgQuality,
            cell: (r) => (
              <span
                className={
                  r.avgQuality < THRESHOLDS.coachingQualityScore
                    ? 'tnum text-warning-fg font-medium'
                    : 'tnum'
                }
              >
                {r.avgQuality}
              </span>
            ),
          },
          {
            key: 'critical',
            header: 'Critical failures',
            sortable: true,
            align: 'right',
            nowrap: true,
            value: (r) => r.criticalFailures,
            cell: (r) =>
              r.criticalFailures > 0 ? (
                <StatusBadge
                  size="sm"
                  tone="danger"
                  icon={ShieldAlert}
                  label={String(r.criticalFailures)}
                  title="Critical compliance failures. Reported separately — never folded into the quality score (§7)."
                />
              ) : (
                <span className="text-[11px] text-ink-tertiary">none</span>
              ),
          },
          {
            key: 'weakest',
            header: 'Weakest parameter',
            secondary: true,
            value: (r) => r.weakest?.label ?? '',
            cell: (r) =>
              r.weakest ? (
                <span className="text-[12px]">
                  {r.weakest.label} <span className="text-ink-tertiary tnum">({r.weakest.value})</span>
                </span>
              ) : (
                <span className="text-[11px] text-ink-tertiary">—</span>
              ),
          },
          {
            key: 'talk',
            header: 'Talk share',
            sortable: true,
            align: 'right',
            nowrap: true,
            value: (r) => r.avgTalkRatio,
            cell: (r) =>
              r.avgTalkRatio === null ? (
                <span
                  className="text-[11px] text-ink-tertiary"
                  title="Diarisation confidence was below 75% on every scored call for this agent, so talk time cannot be attributed to the right speaker (§8)."
                >
                  Not measurable
                </span>
              ) : (
                <span className="tnum">
                  {Math.round(r.avgTalkRatio * 100)}%{' '}
                  <span className="text-[11px] text-ink-tertiary">
                    ({r.diarisationReliablePct}% reliable)
                  </span>
                </span>
              ),
          },
          {
            key: 'objections',
            header: 'Objections resolved',
            sortable: true,
            align: 'right',
            nowrap: true,
            secondary: true,
            value: (r) => r.objectionResolutionPct,
            cell: (r) =>
              r.objectionResolutionPct === null ? (
                <span className="text-[11px] text-ink-tertiary">none raised</span>
              ) : (
                <span className="tnum">{r.objectionResolutionPct}%</span>
              ),
          },
          {
            key: 'nextAction',
            header: 'Closed with a next step',
            sortable: true,
            align: 'right',
            nowrap: true,
            secondary: true,
            value: (r) => r.nextActionPct,
            cell: (r) => <span className="tnum">{r.nextActionPct}%</span>,
          },
          {
            key: 'conversion',
            header: 'Order rate (CRM)',
            sortable: true,
            align: 'right',
            nowrap: true,
            value: (r) => r.conversionPct,
            cell: (r) =>
              r.conversionPct === null ? (
                <span className="text-[11px] text-ink-tertiary">no CRM-linked calls</span>
              ) : (
                <span className="tnum">
                  {r.conversionPct}%{' '}
                  <span className="text-[11px] text-ink-tertiary">of {r.conversionDenominator}</span>
                </span>
              ),
          },
          {
            key: 'coaching',
            header: 'Coaching focus',
            value: (r) => r.coachingFocus ?? '',
            cell: (r) =>
              r.coachingFocus ? (
                <StatusBadge size="sm" tone="warning" label={r.coachingFocus} />
              ) : (
                <span className="text-[11px] text-ink-tertiary">none flagged</span>
              ),
          },
        ]

        return (
          <div className="space-y-5">
            <Notice tone="info">
              <strong>How these scores are built.</strong> Eight weighted parameters, re-normalised
              whenever one cannot be measured — an unmeasurable parameter neither rewards nor
              penalises the agent. Customer sentiment is <em>not</em> one of the inputs, and does not
              appear anywhere on this page: an agent who handles an angry customer well should score
              well (§3).
            </Notice>

            <div className="grid gap-4 lg:grid-cols-2">
              <CiChartFrame
                title="Quality by agent"
                question="Who is above and below the coaching threshold?"
                period={periodLabel}
                comparisonPeriod={comparisonLabel}
                unit="weighted quality score, 0–100"
                provenance="ai_inferred"
                isEmpty={rows.length === 0}
                denominatorNote={`${conversational} calls with a real conversation, across ${rows.length} agents`}
                footnote={`Agents scoring below ${THRESHOLDS.coachingQualityScore} are flagged for coaching. A low sample is shown as such — three calls is not a performance review.`}
              >
                <RankedBars
                  max={100}
                  rows={rows.map((r) => ({
                    id: r.employeeId,
                    label: r.name,
                    value: r.avgQuality,
                    valueLabel: `${r.avgQuality}`,
                    sampleSize: r.analysedCalls,
                    deltaLabel: r.criticalFailures
                      ? `${r.criticalFailures} critical compliance failure${r.criticalFailures === 1 ? '' : 's'}`
                      : undefined,
                    tone:
                      r.criticalFailures > 0
                        ? 'danger'
                        : r.avgQuality < THRESHOLDS.coachingQualityScore
                          ? 'warning'
                          : 'success',
                    href: hrefWithFilters('/call-intelligence/explorer', {
                      employeeId: [r.employeeId],
                    }),
                  }))}
                />
              </CiChartFrame>

              <CiChartFrame
                title="Quality against verified conversion"
                question="Does a good conversation actually close — and who is the exception worth learning from?"
                period={periodLabel}
                comparisonPeriod={comparisonLabel}
                unit="quality score vs CRM-verified order rate"
                provenance="mixed"
                isEmpty={scatter.length === 0}
                emptyHeadline="Not enough CRM-linked calls to plot"
                emptySupport="An agent needs at least 5 CRM-linked calls before a conversion rate is meaningful. Widen the period or clear filters."
                footnote="Excluded rather than dimmed: agents below 5 CRM-linked calls are not plotted at all, because a faint dot still gets read as a data point."
              >
                <QuadrantScatter
                  points={scatter.map((p) => ({
                    name: p.name,
                    x: p.quality,
                    y: p.conversion,
                    size: p.calls,
                    denominator: p.denominator,
                    group: p.team,
                  }))}
                  xLabel="Agent quality score"
                  yLabel="Order rate (CRM-verified) %"
                  xMid={THRESHOLDS.coachingQualityScore}
                  yMid={
                    scatter.length
                      ? Math.round(scatter.reduce((a, p) => a + p.conversion, 0) / scatter.length)
                      : 50
                  }
                  quadrants={{
                    topLeft: 'Closing without scoring — check what the rubric is missing',
                    topRight: 'Strong on both — use their calls as coaching material',
                    bottomLeft: 'Coaching priority',
                    bottomRight: 'Good conversations that stall — look at the follow-up, not the pitch',
                  }}
                />
              </CiChartFrame>
            </div>

            <Section
              title="Where each agent is strong and weak"
              description="The eight weighted parameters behind the score. Read down a column to find a team-wide gap, across a row to plan one person's coaching."
              meta={`${periodLabel} · compared with ${comparisonLabel} · weights: ${QUALITY_WEIGHTS.map((w) => `${w.label} ${Math.round(w.weight * 100)}%`).join(' · ')}`}
            >
              {rows.length === 0 ? (
                <p className="text-xs text-ink-secondary">No agents have scored calls in this window.</p>
              ) : (
                <IntensityHeatmap
                  rowLabel="Agent"
                  columnLabel="Parameter"
                  rows={rows.map((r) => ({
                    id: r.employeeId,
                    label: r.name,
                    note: `n=${r.analysedCalls}`,
                  }))}
                  columns={QUALITY_WEIGHTS.map((w) => ({ id: w.key, label: w.label }))}
                  cell={(agentId, bucketKey) => {
                    const row = rows.find((r) => r.employeeId === agentId)
                    const v = row?.bucketScores[bucketKey]
                    if (row === undefined || v === undefined) return null
                    return {
                      value: v,
                      display: String(Math.round(v)),
                      title: `${row.name} · ${QUALITY_WEIGHTS.find((w) => w.key === bucketKey)?.label}: ${v} across ${row.analysedCalls} scored calls`,
                    }
                  }}
                />
              )}
            </Section>

            <div className="grid gap-4 lg:grid-cols-2">
              <Section
                title={`Critical compliance failures (${withCritical.length})`}
                description="Reported here and beside each score, never averaged into it. A high quality score with a mis-selling flag is not a good call."
                meta={
                  <span className="inline-flex items-center gap-2">
                    <ProvenanceBadge provenance="ai_inferred" />
                    <span>Out of {conversational} scored calls</span>
                  </span>
                }
              >
                {withCritical.length === 0 ? (
                  <p className="text-xs text-ink-secondary">
                    No critical compliance failure was detected in this window.
                  </p>
                ) : (
                  <ul className="space-y-2 max-h-72 overflow-y-auto">
                    {withCritical.slice(0, 20).map((c) => {
                      const q = agentQualityScore(c)
                      return (
                        <li key={c.callId} className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link
                              href={`/call-intelligence/explorer/${c.callId}`}
                              className="text-[13px] text-ink-primary hover:text-accent-copper"
                            >
                              {EMPLOYEES.find((e) => e.id === c.employeeId)?.name ?? c.employeeId} ·{' '}
                              {c.callId}
                            </Link>
                            <p className="text-[11px] text-danger-fg">
                              {q.criticalFailures.join(' · ')}
                            </p>
                          </div>
                          <span className="text-[11px] text-ink-tertiary tnum whitespace-nowrap">
                            score {q.score}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                )}
                <ul className="mt-3 pt-3 border-t border-hairline/8 flex flex-wrap gap-1.5">
                  {Object.values(COMPLIANCE_BY_ID)
                    .filter((f) => f.critical)
                    .map((f) => (
                      <li key={f.id}>
                        <StatusBadge size="sm" tone="danger" label={f.label} />
                      </li>
                    ))}
                </ul>
              </Section>

              <Section
                title="Conversation dynamics"
                description="Talk ratio, interruptions and silence — but only where the speaker separation can be trusted."
                meta={`${unreliableDiarisation} of ${conversational} scored calls have diarisation below ${THRESHOLDS.minDiarisationConfidence * 100}%`}
              >
                {conversational === 0 ? (
                  <p className="text-xs text-ink-secondary">No scored calls in this window.</p>
                ) : unreliableDiarisation === conversational ? (
                  <NotMeasurable reason="diarisation confidence is below the threshold on every scored call in this window, so no talk metric can be attributed to the right speaker." />
                ) : (
                  <>
                    <RankedBars
                      max={100}
                      rows={rows
                        .filter((r) => r.avgTalkRatio !== null)
                        .map((r) => ({
                          id: r.employeeId,
                          label: r.name,
                          value: Math.round((r.avgTalkRatio ?? 0) * 100),
                          valueLabel: `${Math.round((r.avgTalkRatio ?? 0) * 100)}% agent talk`,
                          sampleSize: r.analysedCalls,
                          deltaLabel: `${r.diarisationReliablePct}% of their calls are measurable`,
                          tone:
                            (r.avgTalkRatio ?? 0) > 0.65
                              ? 'warning'
                              : (r.avgTalkRatio ?? 0) < 0.35
                                ? 'info'
                                : 'success',
                        }))}
                    />
                    <Notice tone="warning" className="mt-3">
                      Agents whose calls are all below the diarisation threshold are absent from this
                      chart rather than shown at 0% — {rows.filter((r) => r.avgTalkRatio === null).length}{' '}
                      of {rows.length} agents. Exposing diarisation confidence from the STT service is
                      a blocking dependency before any talk metric goes into a review.
                    </Notice>
                  </>
                )}
              </Section>
            </div>

            <Section
              title={`All ${rows.length} agents`}
              description="Sortable and exportable. Quality is AI-scored, conversion is CRM-verified, and the two carry different denominators."
              meta={`${periodLabel} · compared with ${comparisonLabel} · viewing as ${viewer.name}`}
              padded={false}
            >
              <DataTable
                rows={rows}
                columns={columns}
                rowKey={(r) => r.employeeId}
                pageSize={12}
                exportName="sunroof-agent-quality"
                searchPlaceholder="Search agents, teams, managers…"
                caption="Agent quality with sample sizes and compliance failures"
                emptyHeadline="No agents in scope"
                emptySupport="Your role scopes this page to your own calls or team. Nothing matches the current filters."
              />
            </Section>

            <Section
              title="Attributes that never influence a score"
              description="Enforced in the scoring model, not left to reviewer discretion. None of these are inputs to any score on this page, and none may be used to explain one."
              meta="Defined in rbac.ts → PROHIBITED_SCORING_ATTRIBUTES"
            >
              <ul className="flex flex-wrap gap-1.5">
                {PROHIBITED_SCORING_ATTRIBUTES.map((a) => (
                  <li key={a}>
                    <StatusBadge size="sm" tone="neutral" label={a} />
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[11px] text-ink-tertiary">
                Tenure is recorded for context in a coaching conversation but is likewise never an
                input to the score — a new joiner is coached differently, not marked differently.
              </p>
            </Section>
          </div>
        )
      }}
    </CiPageFrame>
  )
}
