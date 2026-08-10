'use client'

import Link from 'next/link'
import { DataTable, Notice, Section, StatusBadge, type Column } from '@/components/ds'
import { CiPageFrame } from './CiShell'
import { useCi } from './CiContext'
import { MetricCard, MetricGrid, NotMentioned, ProvenanceBadge } from './CiPrimitives'
import { CiChartFrame, IntensityHeatmap, ProvenanceFunnel, RankedBars } from './CiCharts'
import {
  callToOrderFunnel,
  executiveKpis,
  objectionAggregates,
  tallyValues,
  type Metric,
  type ObjectionRow,
} from '@/lib/call-intelligence/metrics'
import { OBJECTIONS, THRESHOLDS } from '@/data/call-intelligence/taxonomy'

/**
 * Sales & Objection Intelligence — page 5.
 *
 * The rule that shapes this page is §6: **loss reasons come from the CRM, full
 * stop.** The model's read on why a customer hesitated is genuinely useful for
 * coaching, so it is shown — but in a separate panel, labelled as inference,
 * and never in the same table as the CRM's own loss reason. Merging the two is
 * how a dashboard ends up telling the board a story the CRM does not support.
 */

export default function SalesObjections() {
  const { periodLabel, comparisonLabel, hrefWithFilters } = useCi()

  return (
    <CiPageFrame
      title="Sales & Objection Intelligence"
      question="What is blocking conversion — which objections come up, who handles them well, and what does the CRM say we actually lost on?"
    >
      {(data) => {
        const kpis = executiveKpis({
          calls: data.calls,
          allCalls: data.allCalls,
          prevCalls: data.prevCalls,
          prevAllCalls: data.prevAllCalls,
          actions: data.actions,
        })
        const byKey = new Map<string, Metric>(kpis.map((m) => [m.key, m]))
        const rows = objectionAggregates(data.calls, data.prevCalls)
        const funnel = callToOrderFunnel(data.calls)

        // CRM loss reasons — the only loss reasons management quotes (§6).
        const lostCalls = data.calls.filter(
          (c) => c.crm.provenance === 'crm_verified' && c.crm.crmLossReason,
        )
        const crmLossReasons = tallyValues(lostCalls.map((c) => c.crm.crmLossReason as string))

        // The model's separate, clearly-labelled read.
        const aiHesitations = tallyValues(
          data.calls.map((c) => c.signals.aiHesitationSummary).filter((s): s is string => Boolean(s)),
        )

        const competitors = tallyValues(data.calls.flatMap((c) => c.signals.competitorMentions))
        const discountRequests = data.calls.filter((c) => c.signals.discountRequested).length
        const crossSell = tallyValues(data.calls.flatMap((c) => c.signals.crossSellOpportunities))

        const regions = Array.from(new Set(data.calls.map((c) => c.region))).sort()
        const topObjections = rows.slice(0, 6)

        const columns: Column<ObjectionRow>[] = [
          {
            key: 'objection',
            header: 'Objection',
            sortable: true,
            value: (r) => r.label,
            cell: (r) => (
              <span className="min-w-0">
                <Link
                  href={hrefWithFilters('/call-intelligence/explorer', {
                    objectionId: [r.objectionId],
                  })}
                  className="text-[13px] font-medium text-ink-primary hover:text-accent-copper"
                >
                  {r.label}
                </Link>
                <span className="block text-[11px] text-ink-tertiary">{r.family}</span>
              </span>
            ),
          },
          {
            key: 'calls',
            header: 'Calls',
            sortable: true,
            align: 'right',
            nowrap: true,
            value: (r) => r.callCount,
            cell: (r) => (
              <span className="tnum">
                {r.callCount}{' '}
                <span className="text-[11px] text-ink-tertiary">of {r.denominator}</span>
              </span>
            ),
          },
          {
            key: 'intensity',
            header: 'Avg intensity',
            sortable: true,
            align: 'right',
            nowrap: true,
            secondary: true,
            value: (r) => r.avgIntensity,
            cell: (r) => (
              <span className="tnum" title="1 = passing mention, 2 = firm, 3 = blocking">
                {r.avgIntensity}/3
              </span>
            ),
          },
          {
            key: 'resolution',
            header: 'Resolved',
            sortable: true,
            align: 'right',
            nowrap: true,
            value: (r) => r.resolutionRate,
            cell: (r) => (
              <span
                className={
                  r.resolutionRate < 40 ? 'tnum text-danger-fg font-medium' : 'tnum text-ink-primary'
                }
                title={`${r.resolved} resolved, ${r.partiallyResolved} partial, ${r.unresolved} unresolved`}
              >
                {r.resolutionRate}%
              </span>
            ),
          },
          {
            key: 'technique',
            header: 'Best technique',
            secondary: true,
            value: (r) => r.topTechniques[0]?.technique ?? '',
            cell: (r) => {
              const best = r.topTechniques.slice().sort((a, b) => b.resolvedPct - a.resolvedPct)[0]
              return best ? (
                <span className="text-[12px]">
                  {best.technique.replace(/_/g, ' ')}{' '}
                  <span className="text-ink-tertiary tnum">
                    ({best.resolvedPct}% of {best.count})
                  </span>
                </span>
              ) : (
                <span className="text-[11px] text-ink-tertiary">no technique recorded</span>
              )
            },
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
            key: 'loss',
            header: 'CRM loss reasons',
            secondary: true,
            value: (r) => r.crmLossReasons.map((x) => x.reason).join('; '),
            cell: (r) =>
              r.crmLossReasons.length === 0 ? (
                <span className="text-[11px] text-ink-tertiary">none recorded</span>
              ) : (
                <span className="text-[12px]">
                  {r.crmLossReasons.map((x) => `${x.reason} (${x.count})`).join(', ')}
                </span>
              ),
          },
          {
            key: 'trend',
            header: 'Vs prior',
            sortable: true,
            align: 'right',
            nowrap: true,
            value: (r) => r.trendPct,
            cell: (r) => (
              <span className="tnum text-ink-secondary">
                {r.trendPct === null ? 'new' : `${r.trendPct > 0 ? '+' : ''}${r.trendPct}%`}
              </span>
            ),
          },
        ]

        return (
          <div className="space-y-5">
            <MetricGrid columns={5}>
              {['high_intent', 'call_to_opportunity', 'call_to_order', 'revenue_influenced', 'with_next_action'].map(
                (k) => {
                  const m = byKey.get(k)
                  return m ? (
                    <MetricCard key={k} metric={m} comparisonLabel={comparisonLabel} />
                  ) : null
                },
              )}
            </MetricGrid>

            <div className="grid gap-4 lg:grid-cols-2">
              <CiChartFrame
                title="Call to order"
                question="Where does the pipeline leak, and where does the evidence change hands from AI to CRM?"
                period={periodLabel}
                comparisonPeriod={comparisonLabel}
                unit="calls at each stage"
                provenance="mixed"
                isEmpty={data.calls.length === 0}
                footnote="The marked break is where the base changes from analysed calls to CRM-linked calls. Percentages either side of it are not comparable."
              >
                <ProvenanceFunnel stages={funnel} />
              </CiChartFrame>

              <CiChartFrame
                title="Objections by frequency and resolution"
                question="Which objection is both common and badly handled?"
                period={periodLabel}
                comparisonPeriod={comparisonLabel}
                unit="calls where the objection was raised"
                provenance="ai_inferred"
                isEmpty={rows.length === 0}
                denominatorNote={`Out of ${data.calls.length} analysable calls`}
                footnote="Bar colour is the resolution rate, not the frequency: a long red bar is a common objection we are losing."
              >
                <RankedBars
                  rows={rows.slice(0, 10).map((r) => ({
                    id: r.objectionId,
                    label: r.label,
                    value: r.callCount,
                    valueLabel: `${r.callCount} · ${r.resolutionRate}% resolved`,
                    sampleSize: r.callCount,
                    deltaLabel:
                      r.trendPct === null ? 'new this period' : `${r.trendPct > 0 ? '+' : ''}${r.trendPct}% vs prior`,
                    tone:
                      r.resolutionRate < 40 ? 'danger' : r.resolutionRate < 70 ? 'warning' : 'success',
                    href: hrefWithFilters('/call-intelligence/explorer', {
                      objectionId: [r.objectionId],
                    }),
                  }))}
                />
              </CiChartFrame>
            </div>

            {/* ── The §6 separation, made structural ──────────────────── */}
            <div className="grid gap-4 lg:grid-cols-2">
              <Section
                title="Why we lost — CRM"
                description="The CRM's own loss reason field. This is the only loss reason that appears in a management view."
                meta={
                  <span className="inline-flex items-center gap-2">
                    <ProvenanceBadge provenance="crm_verified" />
                    <span>
                      {lostCalls.length} lost deals with a recorded reason, out of{' '}
                      {data.calls.filter((c) => c.crm.provenance === 'crm_verified').length} CRM-linked
                      calls
                    </span>
                  </span>
                }
              >
                {crmLossReasons.length === 0 ? (
                  <p className="text-xs text-ink-secondary">
                    No CRM-linked call in this window has a loss reason recorded. That is a CRM
                    hygiene gap, and nothing has been inferred to fill it.
                  </p>
                ) : (
                  <RankedBars
                    rows={crmLossReasons.map(([reason, count]) => ({
                      id: reason,
                      label: reason,
                      value: count,
                      valueLabel: `${count} of ${lostCalls.length}`,
                      tone: 'danger' as const,
                    }))}
                  />
                )}
              </Section>

              <Section
                title="Why the model thinks they hesitated"
                description="Useful for coaching. Not a loss reason, never reported as one, and never merged with the CRM panel beside it."
                meta={
                  <span className="inline-flex items-center gap-2">
                    <ProvenanceBadge provenance="ai_inferred" />
                    <span>Inference from transcript wording across {data.calls.length} calls</span>
                  </span>
                }
              >
                {aiHesitations.length === 0 ? (
                  <p className="text-xs text-ink-secondary">
                    The model did not surface a hesitation pattern in this window.
                  </p>
                ) : (
                  <RankedBars
                    rows={aiHesitations.slice(0, 8).map(([reason, count]) => ({
                      id: reason,
                      label: reason,
                      value: count,
                      valueLabel: `${count} calls`,
                      tone: 'warning' as const,
                    }))}
                  />
                )}
                <Notice tone="info" className="mt-3">
                  These two panels will disagree, and that is the point. When they disagree
                  consistently, either the CRM reason codes or the extraction prompt needs work —
                  the dashboard&apos;s job is to surface the disagreement, not to average it away.
                </Notice>
              </Section>
            </div>

            <Section
              title="Objection pressure by region"
              description="The same objection can be a pricing problem in one region and a trust problem in another. Cells are calls per region, with the region's own denominator on the row."
              meta={`${periodLabel} · compared with ${comparisonLabel}`}
            >
              {regions.length === 0 || topObjections.length === 0 ? (
                <p className="text-xs text-ink-secondary">Not enough data to build the matrix.</p>
              ) : (
                <IntensityHeatmap
                  rowLabel="Region"
                  columnLabel="Objection"
                  rows={regions.map((region) => ({
                    id: region,
                    label: region,
                    note: `n=${data.calls.filter((c) => c.region === region).length}`,
                  }))}
                  columns={topObjections.map((o) => ({ id: o.objectionId, label: o.label }))}
                  cell={(regionId, objectionId) => {
                    const regionCalls = data.calls.filter((c) => c.region === regionId)
                    if (regionCalls.length === 0) return null
                    const n = regionCalls.filter((c) =>
                      c.objections.some((o) => o.objectionId === objectionId),
                    ).length
                    const per100 = Math.round((n / regionCalls.length) * 1000) / 10
                    return {
                      value: per100,
                      display: String(per100),
                      title: `${regionId} · ${objectionId}: ${n} of ${regionCalls.length} calls (${per100} per 100)`,
                    }
                  }}
                />
              )}
            </Section>

            <div className="grid gap-4 lg:grid-cols-3">
              <Section
                title="Competitors named"
                description="Who customers bring up unprompted."
                meta={`${data.calls.length} analysable calls`}
              >
                {competitors.length === 0 ? (
                  <NotMentioned />
                ) : (
                  <RankedBars
                    rows={competitors.map(([name, count]) => ({
                      id: name,
                      label: name,
                      value: count,
                      valueLabel: `${count}`,
                      tone: 'warning' as const,
                    }))}
                  />
                )}
              </Section>

              <Section
                title="Discount pressure"
                description="Calls where the customer explicitly asked for a discount."
                meta="Any discount above the approved matrix raises a critical alert"
              >
                <p className="text-[28px] font-semibold tnum text-ink-primary">
                  {discountRequests}
                </p>
                <p className="text-[11px] text-ink-tertiary">
                  of {data.calls.length} analysable calls (
                  {data.calls.length ? Math.round((discountRequests / data.calls.length) * 100) : 0}%)
                </p>
                <Notice tone="warning" className="mt-3">
                  The <code>unapproved_discount</code> alert rule needs the real approved discount
                  matrix before it can fire correctly. Until commercial signs that off, the rule uses
                  a placeholder threshold.
                </Notice>
              </Section>

              <Section
                title="Cross-sell openings"
                description="Adjacent needs the customer raised themselves."
                meta="AI-inferred — a prompt for the agent, not a forecast"
              >
                {crossSell.length === 0 ? (
                  <NotMentioned />
                ) : (
                  <RankedBars
                    rows={crossSell.slice(0, 6).map(([name, count]) => ({
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
              title={`All ${rows.length} objections`}
              description="Sortable and exportable. Resolution is AI-assessed from the exchange; order rate and loss reasons are CRM-verified and carry their own denominators."
              meta={`${periodLabel} · compared with ${comparisonLabel} · ${OBJECTIONS.length} objection types in the taxonomy, ${rows.length} seen this period`}
              padded={false}
            >
              <DataTable
                rows={rows}
                columns={columns}
                rowKey={(r) => r.objectionId}
                pageSize={12}
                exportName="sunroof-objections"
                searchPlaceholder="Search objections…"
                caption="Objections raised, with resolution rate and CRM outcome"
                emptyHeadline="No objections recorded"
                emptySupport="No call in the current filter set contained an identifiable objection."
              />
            </Section>

            <Notice tone="info">
              <strong>High purchase readiness is not a forecast.</strong> Readiness ≥{' '}
              {THRESHOLDS.highIntentScore} means the conversation contained the signals of a live
              opportunity — a stated need, a timeline, an agreed next step. It has not been
              back-tested against historical conversions, so it must not be multiplied by an average
              order value and presented as pipeline (§7).
            </Notice>
          </div>
        )
      }}
    </CiPageFrame>
  )
}
