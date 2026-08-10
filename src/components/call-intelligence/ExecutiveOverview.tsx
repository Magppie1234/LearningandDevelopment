'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { AlertTriangle, ArrowUpRight } from 'lucide-react'
import { Card, Section, StatusBadge, TrendLine } from '@/components/ds'
import { CiPageFrame } from './CiShell'
import { useCi } from './CiContext'
import {
  MetricCard,
  MetricGrid,
  SampleSizeNote,
  TextSentimentCaveat,
} from './CiPrimitives'
import { CiChartFrame, CompositionBar, ProvenanceFunnel, QuadrantScatter, RankedBars } from './CiCharts'
import {
  agentAggregates,
  callToOrderFunnel,
  countCalls,
  emergingItems,
  emotionAverages,
  executiveKpis,
  faqAggregates,
  objectionAggregates,
  qualityVsConversion,
  regionAggregates,
  volumeSentimentTrend,
  type Metric,
} from '@/lib/call-intelligence/metrics'
import { alertSummary } from '@/lib/call-intelligence/alerts'
import { summariseActions } from '@/lib/call-intelligence/actions'
import { EMPLOYEES, TEAMS, THRESHOLDS } from '@/data/call-intelligence/taxonomy'

/**
 * Executive Overview — page 1 of 10.
 *
 * The brief's first rule for this page: it opens with a decision, not a total.
 * So the KPI bands are ordered by what a Business Head does with them —
 * *act today* first, *commercial* second, *experience* third, and raw volume
 * last, where it belongs as context rather than headline.
 */

/** KPI keys grouped into the order a Business Head reads them. */
const BANDS: { title: string; blurb: string; keys: string[] }[] = [
  {
    title: 'Act today',
    blurb: 'Work that is already owed to a customer, or a risk that cannot wait for the weekly review.',
    keys: ['overdue', 'due_today', 'critical_complaints', 'compliance_alerts', 'unanswered'],
  },
  {
    title: 'Commercial',
    blurb:
      'AI-inferred readiness and CRM-verified outcomes are kept apart on purpose — they do not share a denominator.',
    keys: ['high_intent', 'call_to_opportunity', 'call_to_order', 'revenue_influenced', 'with_next_action'],
  },
  {
    title: 'Customer experience',
    blurb: 'Text-based sentiment across the period, with the share that improved during the call.',
    keys: ['positive', 'neutral', 'negative', 'sentiment_improved', 'avg_quality'],
  },
  {
    title: 'Volume & coverage',
    blurb: 'Context for everything above. How much of what happened did we actually manage to analyse?',
    keys: ['total_calls', 'transcribed', 'coverage', 'unique_customers', 'meaningful'],
  },
]

export default function ExecutiveOverview() {
  const { periodLabel, comparisonLabel, hrefWithFilters, filters } = useCi()

  return (
    <CiPageFrame
      title="Executive Overview"
      question="Where should management intervene this week? Call counts are context — the decision rows come first."
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

        const counts = countCalls(data.calls)
        const trend = volumeSentimentTrend(data.calls, filters.from, filters.to)
        const prevTrend = volumeSentimentTrend(data.prevCalls, filters.compareFrom, filters.compareTo)
        const funnel = callToOrderFunnel(data.calls)
        const faqs = faqAggregates(data.calls, data.prevCalls)
        const objections = objectionAggregates(data.calls, data.prevCalls)
        const regions = regionAggregates(data.calls, data.actions, 'region')
        const agents = agentAggregates(data.calls, EMPLOYEES, TEAMS, data.actions)
        const scatter = qualityVsConversion(agents)
        const emotions = emotionAverages(data.calls)
        const alerts = alertSummary(data.alerts)
        const actions = summariseActions(data.actions)
        const emergingFaqs = emergingItems(faqs).slice(0, 5)
        const emergingObjections = emergingItems(objections).slice(0, 5)

        // Trend chart plots this period against the same-length prior window by
        // day index, because the two windows have different calendar dates and
        // overlaying them by date would draw two disconnected lines (§15).
        const trendData = trend.map((p, i) => ({
          day: `D${i + 1}`,
          date: p.date,
          calls: p.calls,
          previous: prevTrend[i]?.calls ?? 0,
        }))

        return (
          <div className="space-y-5">
            {/* ── The two things that are already on fire ─────────────── */}
            <div className="grid gap-3 md:grid-cols-2">
              <Card className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-[15px] font-semibold text-ink-primary">Alerts open now</h2>
                  <StatusBadge
                    tone={alerts.critical > 0 ? 'danger' : alerts.high > 0 ? 'warning' : 'success'}
                    label={`${alerts.total} open`}
                    size="sm"
                  />
                </div>
                <CompositionBar
                  total={alerts.total}
                  segments={[
                    { label: 'Critical', value: alerts.critical, tone: 'danger' },
                    { label: 'High', value: alerts.high, tone: 'warning' },
                    { label: 'Medium', value: alerts.medium, tone: 'info' },
                    { label: 'Low', value: alerts.low, tone: 'neutral' },
                  ]}
                />
                <p className="text-[11px] text-ink-tertiary">
                  {alerts.awaitingReview} critical alert{alerts.awaitingReview === 1 ? '' : 's'} require
                  human review before any action is taken — nothing here auto-executes (§13).
                </p>
                <Link
                  href={hrefWithFilters('/call-intelligence/alerts')}
                  className="text-[11px] font-medium text-accent-copper hover:underline inline-flex items-center gap-1"
                >
                  Work the alert queue <ArrowUpRight size={12} />
                </Link>
              </Card>

              <Card className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-[15px] font-semibold text-ink-primary">
                    Commitments to customers
                  </h2>
                  <StatusBadge
                    tone={actions.overdue > 0 ? 'danger' : 'success'}
                    label={`${actions.overdue} overdue`}
                    size="sm"
                  />
                </div>
                <CompositionBar
                  total={actions.total}
                  segments={[
                    { label: 'Overdue', value: actions.overdue, tone: 'danger' },
                    { label: 'Due today', value: actions.dueToday, tone: 'warning' },
                    {
                      label: 'On track / met',
                      value: actions.total - actions.overdue - actions.dueToday,
                      tone: 'success',
                    },
                  ]}
                />
                <p className="text-[11px] text-ink-tertiary">
                  {actions.committed} explicitly promised on a call · {actions.recommended} AI-recommended.
                  The two are never merged — only the first is something we owe (§9).
                </p>
                <Link
                  href={hrefWithFilters('/call-intelligence/actions')}
                  className="text-[11px] font-medium text-accent-copper hover:underline inline-flex items-center gap-1"
                >
                  Open the action tracker <ArrowUpRight size={12} />
                </Link>
              </Card>
            </div>

            {/* ── KPI bands ───────────────────────────────────────────── */}
            {BANDS.map((band) => (
              <section key={band.title} className="space-y-2">
                <div>
                  <h2 className="text-[15px] font-semibold text-ink-primary">{band.title}</h2>
                  <p className="text-xs text-ink-secondary max-w-3xl">{band.blurb}</p>
                </div>
                <MetricGrid columns={5}>
                  {band.keys.map((k) => {
                    const m = byKey.get(k)
                    if (!m) return null
                    return (
                      <MetricCard
                        key={k}
                        metric={m}
                        comparisonLabel={comparisonLabel}
                        asOf={new Date(data.lastRefreshedAt).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                        href={
                          k === 'overdue'
                            ? hrefWithFilters('/call-intelligence/actions', { slaStatus: ['overdue'] })
                            : k === 'due_today'
                              ? hrefWithFilters('/call-intelligence/actions', { slaStatus: ['due_today'] })
                              : k === 'negative'
                                ? hrefWithFilters('/call-intelligence/explorer', { sentiment: ['negative'] })
                                : k === 'high_intent'
                                  ? hrefWithFilters('/call-intelligence/explorer', { readiness: ['high'] })
                                  : undefined
                        }
                      />
                    )
                  })}
                </MetricGrid>
                {band.title === 'Customer experience' && <TextSentimentCaveat />}
              </section>
            ))}

            {/* ── Primary visuals ─────────────────────────────────────── */}
            <div className="grid gap-4 lg:grid-cols-2">
              <CiChartFrame
                title="Call volume, period over period"
                question="Is the contact centre getting busier, and is that a demand signal or a service failure?"
                period={periodLabel}
                comparisonPeriod={comparisonLabel}
                unit="calls per day"
                provenance="system"
                isEmpty={trendData.length === 0}
                denominatorNote={`${data.calls.length} analysable calls this period · ${data.prevCalls.length} in the comparison period`}
                footnote="Plotted by day index rather than calendar date, so the two windows line up. Day 1 is the first day of each window."
              >
                <TrendLine
                  data={trendData}
                  xKey="day"
                  unitSuffix=""
                  yDomain={undefined}
                  series={[
                    { key: 'calls', name: periodLabel, tone: 'info' },
                    { key: 'previous', name: comparisonLabel, tone: 'neutral' },
                  ]}
                />
              </CiChartFrame>

              <CiChartFrame
                title="Call to order"
                question="Where does the pipeline actually leak — and where does the evidence stop being AI and start being CRM?"
                period={periodLabel}
                comparisonPeriod={comparisonLabel}
                unit="calls at each stage"
                provenance="mixed"
                isEmpty={data.calls.length === 0}
                footnote="Stages 1–3 are inferred from transcripts; stages 4–5 are read from the CRM. They do not share a denominator, and the break above marks exactly where it changes (§13)."
              >
                <ProvenanceFunnel stages={funnel} />
              </CiChartFrame>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <CiChartFrame
                title="What customers asked about most"
                question="Which questions are frequent enough to be worth answering before the call happens?"
                period={periodLabel}
                comparisonPeriod={comparisonLabel}
                unit="calls containing the question"
                provenance="ai_inferred"
                isEmpty={faqs.length === 0}
                denominatorNote={`Out of ${data.calls.length} analysable calls · each question counted once per call`}
                drillHref={hrefWithFilters('/call-intelligence/faqs')}
                drillLabel="Open FAQs & Knowledge Gaps"
              >
                <RankedBars
                  rows={faqs.slice(0, 8).map((f) => ({
                    id: f.faqId,
                    label: f.shortLabel,
                    value: f.callCount,
                    valueLabel: `${f.callCount} (${f.pctOfCalls}%)`,
                    sampleSize: f.callCount,
                    deltaLabel:
                      f.trendPct === null
                        ? 'new this period'
                        : `${f.trendPct > 0 ? '+' : ''}${f.trendPct}% vs prior`,
                    tone: f.unansweredRate > 25 ? 'danger' : f.hasKbArticle ? 'info' : 'warning',
                    href: hrefWithFilters('/call-intelligence/explorer', { faqId: [f.faqId] }),
                    title: `${f.standardQuestion} — ${f.unanswered} unanswered of ${f.callCount}`,
                  }))}
                />
              </CiChartFrame>

              <CiChartFrame
                title="What blocked the sale"
                question="Which objections come up most, and are we resolving them?"
                period={periodLabel}
                comparisonPeriod={comparisonLabel}
                unit="calls where the objection was raised"
                provenance="ai_inferred"
                isEmpty={objections.length === 0}
                denominatorNote={`Out of ${data.calls.length} analysable calls`}
                drillHref={hrefWithFilters('/call-intelligence/sales')}
                drillLabel="Open Sales & Objections"
              >
                <RankedBars
                  rows={objections.slice(0, 8).map((o) => ({
                    id: o.objectionId,
                    label: o.label,
                    value: o.callCount,
                    valueLabel: `${o.callCount} · ${o.resolutionRate}% resolved`,
                    sampleSize: o.callCount,
                    deltaLabel:
                      o.trendPct === null
                        ? 'new this period'
                        : `${o.trendPct > 0 ? '+' : ''}${o.trendPct}% vs prior`,
                    tone: o.resolutionRate < 40 ? 'danger' : o.resolutionRate < 70 ? 'warning' : 'success',
                    href: hrefWithFilters('/call-intelligence/explorer', { objectionId: [o.objectionId] }),
                  }))}
                />
              </CiChartFrame>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <CiChartFrame
                title="Region performance"
                question="Which region needs a visit — and is the sample big enough to say so?"
                period={periodLabel}
                comparisonPeriod={comparisonLabel}
                unit="% of calls ending negative"
                provenance="mixed"
                isEmpty={regions.length === 0}
                drillHref={hrefWithFilters('/call-intelligence/regional')}
                drillLabel="Open Regional Intelligence"
                footnote={`A region below ${THRESHOLDS.minSampleSize} calls is labelled low-sample and should not be read as a trend.`}
              >
                <RankedBars
                  max={100}
                  rows={regions.map((r) => ({
                    id: r.key,
                    label: r.region,
                    value: r.negativePct,
                    valueLabel: `${r.negativePct}% negative`,
                    sampleSize: r.calls,
                    deltaLabel: `quality ${r.avgQuality} · readiness ${r.avgReadiness}`,
                    tone: r.negativePct > 30 ? 'danger' : r.negativePct > 18 ? 'warning' : 'success',
                    href: hrefWithFilters('/call-intelligence/regional', { region: [r.region] }),
                  }))}
                />
              </CiChartFrame>

              <CiChartFrame
                title="Agent quality against verified conversion"
                question="Does call quality actually convert — and who is the exception worth studying?"
                period={periodLabel}
                comparisonPeriod={comparisonLabel}
                unit="quality score vs CRM-verified order rate"
                provenance="mixed"
                isEmpty={scatter.length === 0}
                emptyHeadline="Not enough CRM-linked calls to plot"
                emptySupport="An agent needs at least 5 CRM-linked calls before their conversion rate is plotted. Widen the period."
                footnote="Conversion is CRM-verified; quality is AI-scored. Agents with fewer than 5 CRM-linked calls are excluded rather than drawn faintly."
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
                    topLeft: 'Converts despite a low quality score — check what the score is missing',
                    topRight: 'Strong on both. Use these calls as coaching material',
                    bottomLeft: 'Coaching priority',
                    bottomRight: 'Good conversations that are not closing — check the follow-up',
                  }}
                />
              </CiChartFrame>
            </div>

            {/* ── Emerging + emotion ──────────────────────────────────── */}
            <div className="grid gap-4 lg:grid-cols-2">
              <Section
                title="Emerging this period"
                description="Questions and objections that rose sharply against the comparison window, or appeared for the first time."
                meta={`${periodLabel} vs ${comparisonLabel} · minimum 3 calls before an item can be called emerging`}
              >
                {emergingFaqs.length === 0 && emergingObjections.length === 0 ? (
                  <p className="text-xs text-ink-secondary">
                    Nothing rose by more than {THRESHOLDS.emergingTrendRise * 100}% against the
                    comparison period. That is a finding, not an empty state.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {emergingFaqs.length > 0 && (
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary mb-2">
                          Questions
                        </h3>
                        <ul className="space-y-2">
                          {emergingFaqs.map((f) => (
                            <li key={f.faqId} className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <Link
                                  href={hrefWithFilters('/call-intelligence/faqs', { faqId: [f.faqId] })}
                                  className="text-[13px] text-ink-primary hover:text-accent-copper"
                                >
                                  {f.shortLabel}
                                </Link>
                                <p className="text-[11px] text-ink-tertiary">
                                  {f.callCount} calls, was {f.prevCallCount} · owner {f.owner}
                                  {!f.hasKbArticle && ' · no approved KB article'}
                                </p>
                              </div>
                              <StatusBadge
                                tone={f.hasKbArticle ? 'warning' : 'danger'}
                                size="sm"
                                label={f.trendPct === null ? 'New' : `+${f.trendPct}%`}
                              />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {emergingObjections.length > 0 && (
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary mb-2">
                          Objections
                        </h3>
                        <ul className="space-y-2">
                          {emergingObjections.map((o) => (
                            <li key={o.objectionId} className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <Link
                                  href={hrefWithFilters('/call-intelligence/sales', {
                                    objectionId: [o.objectionId],
                                  })}
                                  className="text-[13px] text-ink-primary hover:text-accent-copper"
                                >
                                  {o.label}
                                </Link>
                                <p className="text-[11px] text-ink-tertiary">
                                  {o.callCount} calls, was {o.prevCallCount} · {o.resolutionRate}% resolved
                                </p>
                              </div>
                              <StatusBadge
                                tone="warning"
                                size="sm"
                                label={o.trendPct === null ? 'New' : `+${o.trendPct}%`}
                              />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </Section>

              <CiChartFrame
                title="Emotional signals in the language customers used"
                question="What is the emotional weather across the period?"
                period={periodLabel}
                comparisonPeriod={comparisonLabel}
                unit="average signal strength, 0–100"
                provenance="ai_inferred"
                isEmpty={data.calls.length === 0}
                denominatorNote={`Averaged across ${data.calls.length} analysable calls`}
                footnote="Derived from transcript wording only. This is not voice-tone analysis and must never be described as one (§3)."
              >
                <RankedBars
                  max={100}
                  rows={emotions
                    .slice()
                    .sort((a, b) => b.value - a.value)
                    .map((e) => ({
                      id: e.key,
                      label: e.label,
                      value: e.value,
                      valueLabel: `${e.value}`,
                      tone:
                        e.key === 'frustration' || e.key === 'confusion' || e.key === 'hesitation'
                          ? 'warning'
                          : 'success',
                    }))}
                />
                <div className="mt-3">
                  <SampleSizeNote n={data.calls.length} />
                </div>
              </CiChartFrame>
            </div>

            {/* ── The standing caveat ─────────────────────────────────── */}
            <Card className="flex items-start gap-2.5">
              <AlertTriangle size={15} className="text-accent-copper flex-shrink-0 mt-0.5" aria-hidden />
              <div className="space-y-1 text-[11px] text-ink-secondary leading-relaxed">
                <p>
                  <strong className="text-ink-primary">How to read this page.</strong> Purchase
                  readiness is a readiness score, not a conversion probability — it has not been
                  back-tested against historical outcomes (§7). Politeness is not intent: a warm
                  call can score high on sentiment and low on readiness, and the corpus contains a
                  deliberate test case for exactly that. A negative customer is never counted
                  against the agent — the two scores are computed independently and are never
                  correlated on any page (§3).
                </p>
                <p>
                  {counts.unresolvedNegative} call{counts.unresolvedNegative === 1 ? '' : 's'} ended
                  with the customer still negative. Those are in the alert queue, not averaged away
                  here.
                </p>
              </div>
            </Card>
          </div>
        )
      }}
    </CiPageFrame>
  )
}
