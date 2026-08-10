'use client'

import Link from 'next/link'
import { DataTable, Section, StatusBadge, TrendLine, type Column } from '@/components/ds'
import { CiPageFrame } from './CiShell'
import { useCi } from './CiContext'
import { MetricCard, MetricGrid, SampleSizeNote, TextSentimentCaveat } from './CiPrimitives'
import { CiChartFrame, RankedBars } from './CiCharts'
import {
  emotionAverages,
  executiveKpis,
  sentimentByDimension,
  themeAggregates,
  volumeSentimentTrend,
  type Metric,
  type ThemeRow,
} from '@/lib/call-intelligence/metrics'
import { customerSentimentScore } from '@/lib/call-intelligence/scoring'
import { TEAM_BY_ID } from '@/data/call-intelligence/taxonomy'

/**
 * Customer Voice & Sentiment — page 2.
 *
 * The question is "what do customers feel and expect", so the page leads with
 * themes in the customer's own words and keeps every sentiment number labelled
 * as text-derived. It also carries the corpus's built-in trap: politeness is
 * not intent, and the two are plotted side by side to make that visible rather
 * than asserted.
 */

const THEME_KINDS = [
  { key: 'painPoints' as const, label: 'Pain points', tone: 'danger' as const },
  { key: 'dissatisfaction' as const, label: 'Dissatisfaction', tone: 'warning' as const },
  { key: 'expectations' as const, label: 'Expectations', tone: 'info' as const },
  { key: 'featureRequests' as const, label: 'Feature requests', tone: 'info' as const },
  { key: 'appreciation' as const, label: 'Appreciation', tone: 'success' as const },
]

export default function CustomerVoice() {
  const { periodLabel, comparisonLabel, hrefWithFilters, filters } = useCi()

  return (
    <CiPageFrame
      title="Customer Voice & Sentiment"
      question="What are customers actually saying — what they value, what frustrates them, and what they expect us to do next."
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
        const trend = volumeSentimentTrend(data.calls, filters.from, filters.to)
        const emotions = emotionAverages(data.calls)

        const byRegion = sentimentByDimension(data.calls, (c) => c.region)
        const byTeam = sentimentByDimension(data.calls, (c) => TEAM_BY_ID[c.teamId]?.name ?? c.teamId)
        const bySegment = sentimentByDimension(data.calls, (c) => c.customerSegment)
        const byLanguage = sentimentByDimension(data.calls, (c) => c.language)
        const byProduct = sentimentByDimension(data.calls, (c) => c.productSeriesId ?? 'Not assigned')

        const unresolved = data.calls.filter((c) => c.unresolvedNegative)

        // The anti-politeness check, rendered rather than argued: calls whose
        // sentiment is high but whose readiness is low. If this list is empty
        // the extractor is probably conflating warmth with intent (§7).
        const politeButLow = data.calls
          .filter((c) => {
            const s = customerSentimentScore(c.customerSentiment).overall
            const r = c.readinessComponents
            const readiness =
              (r.needAndFit + r.explicitIntent + r.timeline + r.nextStepCommitment) / 4
            return s >= 65 && readiness <= 40
          })
          .slice(0, 8)

        const trendData = trend.map((p, i) => ({
          day: `D${i + 1}`,
          positive: p.calls ? Math.round((p.positive / p.calls) * 100) : 0,
          negative: p.calls ? Math.round((p.negative / p.calls) * 100) : 0,
        }))

        const themeColumns: Column<ThemeRow>[] = [
          {
            key: 'theme',
            header: 'Theme',
            sortable: true,
            value: (r) => r.theme,
            cell: (r) => <span className="text-[13px]">{r.theme}</span>,
          },
          {
            key: 'count',
            header: 'Calls',
            sortable: true,
            align: 'right',
            nowrap: true,
            value: (r) => r.count,
            cell: (r) => (
              <span className="tnum">
                {r.count}{' '}
                <span className="text-ink-tertiary text-[11px]">of {r.denominator}</span>
              </span>
            ),
          },
          {
            key: 'pct',
            header: 'Share',
            sortable: true,
            align: 'right',
            nowrap: true,
            value: (r) => r.pct,
            cell: (r) => <span className="tnum">{r.pct}%</span>,
          },
          {
            key: 'sample',
            header: 'Example',
            value: (r) => r.sampleCallId,
            cell: (r) => (
              <Link
                href={`/call-intelligence/explorer/${r.sampleCallId}`}
                className="text-accent-copper hover:underline text-[12px]"
              >
                {r.sampleCallId}
              </Link>
            ),
          },
        ]

        return (
          <div className="space-y-5">
            <MetricGrid columns={5}>
              {['positive', 'neutral', 'negative', 'sentiment_improved', 'unique_customers'].map((k) => {
                const m = byKey.get(k)
                return m ? (
                  <MetricCard
                    key={k}
                    metric={m}
                    comparisonLabel={comparisonLabel}
                    href={
                      k === 'negative'
                        ? hrefWithFilters('/call-intelligence/explorer', { sentiment: ['negative'] })
                        : k === 'positive'
                          ? hrefWithFilters('/call-intelligence/explorer', { sentiment: ['positive'] })
                          : undefined
                    }
                  />
                ) : null
              })}
            </MetricGrid>
            <TextSentimentCaveat />

            <div className="grid gap-4 lg:grid-cols-2">
              <CiChartFrame
                title="Sentiment mix over the period"
                question="Is the customer mood moving, and in which direction?"
                period={periodLabel}
                comparisonPeriod={comparisonLabel}
                unit="% of that day's calls"
                provenance="ai_inferred"
                isEmpty={trendData.length === 0}
                denominatorNote={`${data.calls.length} analysable calls across ${trendData.length} days`}
                footnote="Days with no calls show 0% for both series — that is an absence of calls, not an absence of feeling."
              >
                <TrendLine
                  data={trendData}
                  xKey="day"
                  series={[
                    { key: 'positive', name: 'Positive', tone: 'success' },
                    { key: 'negative', name: 'Negative', tone: 'danger' },
                  ]}
                />
              </CiChartFrame>

              <CiChartFrame
                title="Emotional signals in customer language"
                question="Which emotions dominate the wording customers use?"
                period={periodLabel}
                comparisonPeriod={comparisonLabel}
                unit="average signal strength, 0–100"
                provenance="ai_inferred"
                isEmpty={data.calls.length === 0}
                denominatorNote={`Averaged across ${data.calls.length} analysable calls`}
                footnote="Derived from transcript wording only — never from voice tone, pitch or pace. No acoustic model is involved (§3)."
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
                      tone: ['frustration', 'confusion', 'hesitation'].includes(e.key)
                        ? 'warning'
                        : 'success',
                    }))}
                />
              </CiChartFrame>
            </div>

            {/* ── Themes ──────────────────────────────────────────────── */}
            <Section
              title="What customers talked about, in their own words"
              description="Verbatim themes grouped into five kinds. Each row links to a call where the theme appears, so a claim can always be read back in context."
              meta={`${periodLabel} · compared with ${comparisonLabel} · ${data.calls.length} analysable calls`}
              padded={false}
            >
              <div className="grid gap-px bg-hairline/10 md:grid-cols-2">
                {THEME_KINDS.map((kind) => {
                  const rows = themeAggregates(data.calls, kind.key).slice(0, 8)
                  return (
                    <div key={kind.key} className="bg-parchment p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <StatusBadge size="sm" tone={kind.tone} label={kind.label} />
                        <SampleSizeNote n={data.calls.length} />
                      </div>
                      {rows.length === 0 ? (
                        <p className="text-[12px] text-ink-tertiary">
                          Nothing recorded in this category for the selected calls.
                        </p>
                      ) : (
                        <RankedBars
                          rows={rows.map((r) => ({
                            id: r.theme,
                            label: r.theme,
                            value: r.count,
                            valueLabel: `${r.count} (${r.pct}%)`,
                            tone: kind.tone,
                            href: `/call-intelligence/explorer/${r.sampleCallId}`,
                          }))}
                        />
                      )}
                    </div>
                  )
                })}
                <div className="bg-parchment p-4">
                  <h3 className="text-[13px] font-semibold text-ink-primary mb-1">
                    All themes, sortable
                  </h3>
                  <p className="text-[11px] text-ink-tertiary mb-2">
                    Pain points across every call in the current filter set.
                  </p>
                  <DataTable
                    rows={themeAggregates(data.calls, 'painPoints')}
                    columns={themeColumns}
                    rowKey={(r) => r.theme}
                    pageSize={6}
                    searchable={false}
                    exportName="sunroof-pain-points"
                    emptyHeadline="No pain points recorded"
                    emptySupport="No call in the current filter set surfaced a pain point."
                  />
                </div>
              </div>
            </Section>

            {/* ── Sentiment by dimension ──────────────────────────────── */}
            <Section
              title="Sentiment by dimension"
              description="The same score sliced five ways. A group below the 20-call minimum is labelled as low-sample and should not be read as a trend."
              meta={`${periodLabel} · compared with ${comparisonLabel}`}
            >
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {[
                  { title: 'Region', rows: byRegion },
                  { title: 'Team', rows: byTeam },
                  { title: 'Customer segment', rows: bySegment },
                  { title: 'Language', rows: byLanguage },
                  { title: 'Product series', rows: byProduct },
                ].map((group) => (
                  <div key={group.title}>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary mb-2">
                      {group.title}
                    </h3>
                    <RankedBars
                      max={100}
                      rows={group.rows.map((r) => ({
                        id: r.key,
                        label: r.key,
                        value: r.negativePct,
                        valueLabel: `${r.negativePct}% negative`,
                        sampleSize: r.calls,
                        deltaLabel: `${r.improvedPct}% improved during the call`,
                        tone:
                          r.sample.level === 'low'
                            ? 'neutral'
                            : r.negativePct > 30
                              ? 'danger'
                              : r.negativePct > 18
                                ? 'warning'
                                : 'success',
                      }))}
                    />
                  </div>
                ))}
              </div>
            </Section>

            {/* ── The two lists that matter ───────────────────────────── */}
            <div className="grid gap-4 lg:grid-cols-2">
              <Section
                title={`Ended still negative (${unresolved.length})`}
                description="Calls where the customer was negative at the close. These are in the alert queue, not averaged into the sentiment score."
                meta={`Out of ${data.calls.length} analysable calls`}
              >
                {unresolved.length === 0 ? (
                  <p className="text-xs text-ink-secondary">
                    No call in this window ended with the customer still negative.
                  </p>
                ) : (
                  <ul className="space-y-2 max-h-80 overflow-y-auto">
                    {unresolved.slice(0, 20).map((c) => (
                      <li key={c.callId} className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/call-intelligence/explorer/${c.callId}`}
                            className="text-[13px] text-ink-primary hover:text-accent-copper"
                          >
                            {c.customerName}
                          </Link>
                          <p className="text-[11px] text-ink-tertiary truncate">
                            {c.city} · {c.callPurpose} · closing sentiment{' '}
                            {c.customerSentiment.closing}
                          </p>
                        </div>
                        <StatusBadge size="sm" tone="danger" label="Unresolved" />
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              <Section
                title={`Warm but not buying (${politeButLow.length})`}
                description="High text sentiment, low purchase readiness. Politeness is not intent — these calls feel good and are not moving, and treating them as pipeline is how a forecast goes wrong."
                meta="Sentiment ≥ 65 with intent components ≤ 40"
              >
                {politeButLow.length === 0 ? (
                  <p className="text-xs text-ink-secondary">
                    None in this window. Worth checking: if this list is <em>never</em> populated,
                    the extractor is probably reading warmth as intent.
                  </p>
                ) : (
                  <ul className="space-y-2 max-h-80 overflow-y-auto">
                    {politeButLow.map((c) => (
                      <li key={c.callId} className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/call-intelligence/explorer/${c.callId}`}
                            className="text-[13px] text-ink-primary hover:text-accent-copper"
                          >
                            {c.customerName}
                          </Link>
                          <p className="text-[11px] text-ink-tertiary truncate">{c.summary}</p>
                        </div>
                        <StatusBadge
                          size="sm"
                          tone="warning"
                          label={`${customerSentimentScore(c.customerSentiment).overall} / low intent`}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </Section>
            </div>
          </div>
        )
      }}
    </CiPageFrame>
  )
}
