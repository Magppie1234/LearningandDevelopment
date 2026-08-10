'use client'

import Link from 'next/link'
import { BookX } from 'lucide-react'
import { DataTable, Notice, Section, StatusBadge, type Column } from '@/components/ds'
import { CiPageFrame } from './CiShell'
import { useCi } from './CiContext'
import { NotMeasurable, SampleSizeNote } from './CiPrimitives'
import { CiChartFrame, IntensityHeatmap, RankedBars } from './CiCharts'
import {
  customerCallCounts,
  emergingItems,
  faqAggregates,
  faqByRegionMatrix,
  type FaqRow,
} from '@/lib/call-intelligence/metrics'
import type { FaqCategoryId } from '@/data/call-intelligence/taxonomy'

/**
 * FAQs & Knowledge Gaps — page 3.
 *
 * The decision this page drives is editorial: what to publish, script or
 * train. So the ranking that leads is not "most asked" but "most asked that we
 * answer badly", and the two FAQs with no approved knowledge-base article are
 * called out rather than quietly scored — accuracy on those is deliberately
 * unscorable (§4), and pretending otherwise would invent a number.
 */

export default function FaqsKnowledgeGaps() {
  const { periodLabel, comparisonLabel, hrefWithFilters } = useCi()

  return (
    <CiPageFrame
      title="FAQs & Knowledge Gaps"
      question="Which questions come up often enough to be worth answering before the customer has to ask — and which ones are we answering badly?"
    >
      {(data) => {
        const corpusCounts = customerCallCounts(data.corpus)
        const rows = faqAggregates(data.calls, data.prevCalls, corpusCounts)
        const emerging = emergingItems(rows)
        const noKb = rows.filter((r) => !r.hasKbArticle)
        const worstAnswered = rows
          .filter((r) => r.callCount >= 3)
          .slice()
          .sort((a, b) => b.unansweredRate - a.unansweredRate)
          .slice(0, 8)

        const topFaqIds = rows.slice(0, 6).map((r) => r.faqId) as FaqCategoryId[]
        const matrix = faqByRegionMatrix(data.calls, topFaqIds)

        const columns: Column<FaqRow>[] = [
          {
            key: 'question',
            header: 'Question',
            sortable: true,
            value: (r) => r.shortLabel,
            cell: (r) => (
              <span className="min-w-0">
                <Link
                  href={hrefWithFilters('/call-intelligence/explorer', { faqId: [r.faqId] })}
                  className="text-[13px] text-ink-primary hover:text-accent-copper font-medium"
                >
                  {r.shortLabel}
                </Link>
                <span className="block text-[11px] text-ink-tertiary truncate max-w-[280px]">
                  {r.standardQuestion}
                </span>
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
            key: 'trend',
            header: 'Vs prior',
            sortable: true,
            align: 'right',
            nowrap: true,
            value: (r) => r.trendPct,
            cell: (r) => (
              <span
                className={
                  r.trendPct === null
                    ? 'text-[11px] text-ink-tertiary'
                    : r.trendPct > 0
                      ? 'tnum text-warning-fg'
                      : 'tnum text-ink-secondary'
                }
              >
                {r.trendPct === null ? 'new' : `${r.trendPct > 0 ? '+' : ''}${r.trendPct}%`}
              </span>
            ),
          },
          {
            key: 'unanswered',
            header: 'Unanswered',
            sortable: true,
            align: 'right',
            nowrap: true,
            value: (r) => r.unansweredRate,
            cell: (r) => (
              <span
                className={
                  r.unansweredRate > 25 ? 'tnum text-danger-fg font-medium' : 'tnum text-ink-primary'
                }
                title={`${r.unanswered} unanswered and ${r.partiallyAnswered} partially answered out of ${r.callCount}`}
              >
                {r.unansweredRate}%
              </span>
            ),
          },
          {
            key: 'response',
            header: 'Answer time',
            sortable: true,
            align: 'right',
            nowrap: true,
            secondary: true,
            value: (r) => r.avgResponseTimeSec,
            cell: (r) =>
              r.avgResponseTimeSec === null ? (
                <span className="text-[11px] text-ink-tertiary">never answered</span>
              ) : (
                <span className="tnum">{r.avgResponseTimeSec}s</span>
              ),
          },
          {
            key: 'accuracy',
            header: 'Answer accuracy',
            sortable: true,
            align: 'right',
            nowrap: true,
            value: (r) => r.avgAccuracy,
            cell: (r) =>
              r.avgAccuracy === null ? (
                <span
                  className="text-[11px] text-ink-tertiary"
                  title="No approved knowledge-base article covers this question, so there is nothing to check the answer against (§4)."
                >
                  Not scorable — no KB article
                </span>
              ) : (
                <span className="tnum">{r.avgAccuracy}</span>
              ),
          },
          {
            key: 'conversion',
            header: 'Order rate',
            sortable: true,
            align: 'right',
            nowrap: true,
            secondary: true,
            value: (r) => r.conversionPct,
            cell: (r) =>
              r.conversionPct === null ? (
                <span className="text-[11px] text-ink-tertiary">no CRM-linked calls</span>
              ) : (
                <span className="tnum">
                  {r.conversionPct}%{' '}
                  <span className="text-[11px] text-ink-tertiary">
                    of {r.conversionDenominator}
                  </span>
                </span>
              ),
          },
          {
            key: 'owner',
            header: 'Owner',
            sortable: true,
            secondary: true,
            value: (r) => r.owner,
            cell: (r) => <span className="text-[12px] text-ink-secondary">{r.owner}</span>,
          },
        ]

        return (
          <div className="space-y-5">
            {noKb.length > 0 && (
              <Notice tone="warning" icon={BookX}>
                <strong>
                  {noKb.length} of {rows.length} questions asked this period have no approved
                  knowledge-base article.
                </strong>{' '}
                Answer accuracy cannot be scored for {noKb.map((r) => r.shortLabel).join(', ')} —
                there is nothing approved to check the answer against. Relevance and completeness
                are still scored. Authoring these articles is the single highest-leverage fix on
                this page.
              </Notice>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
              <CiChartFrame
                title="Most-asked questions"
                question="Where is the contact centre spending its breath?"
                period={periodLabel}
                comparisonPeriod={comparisonLabel}
                unit="calls containing the question"
                provenance="ai_inferred"
                isEmpty={rows.length === 0}
                denominatorNote={`Out of ${data.calls.length} analysable calls · counted once per call, never once per mention (§4)`}
              >
                <RankedBars
                  rows={rows.slice(0, 10).map((r) => ({
                    id: r.faqId,
                    label: r.shortLabel,
                    value: r.callCount,
                    valueLabel: `${r.callCount} (${r.pctOfCalls}%)`,
                    sampleSize: r.callCount,
                    deltaLabel:
                      r.trendPct === null ? 'new this period' : `${r.trendPct > 0 ? '+' : ''}${r.trendPct}% vs prior`,
                    tone: r.hasKbArticle ? 'info' : 'warning',
                    href: hrefWithFilters('/call-intelligence/explorer', { faqId: [r.faqId] }),
                    title: r.standardQuestion,
                  }))}
                />
              </CiChartFrame>

              <CiChartFrame
                title="Worst-answered questions"
                question="Which questions do we field often and handle badly? This is the training and scripting queue."
                period={periodLabel}
                comparisonPeriod={comparisonLabel}
                unit="% of occurrences left unanswered"
                provenance="ai_inferred"
                isEmpty={worstAnswered.length === 0}
                emptyHeadline="No question was asked three or more times"
                emptySupport="A question needs at least three occurrences before an unanswered rate means anything. Widen the period."
                denominatorNote="Minimum 3 occurrences before a question appears here"
                footnote="Unanswered means the agent never gave a substantive reply — not that the reply was wrong. Accuracy is a separate column in the table below."
              >
                <RankedBars
                  max={100}
                  rows={worstAnswered.map((r) => ({
                    id: r.faqId,
                    label: r.shortLabel,
                    value: r.unansweredRate,
                    valueLabel: `${r.unansweredRate}% (${r.unanswered}/${r.callCount})`,
                    sampleSize: r.callCount,
                    deltaLabel: r.hasKbArticle ? undefined : 'no approved KB article',
                    tone: r.unansweredRate > 25 ? 'danger' : 'warning',
                    href: hrefWithFilters('/call-intelligence/explorer', { faqId: [r.faqId] }),
                  }))}
                />
              </CiChartFrame>
            </div>

            <Section
              title="Where each question is being asked"
              description="Questions per 100 calls in each region, so a small region's spike is comparable with a large region's baseline."
              meta={`${periodLabel} · compared with ${comparisonLabel} · top ${topFaqIds.length} questions`}
            >
              {matrix.regions.length === 0 ? (
                <p className="text-xs text-ink-secondary">No regional data in this window.</p>
              ) : (
                <IntensityHeatmap
                  rowLabel="Region"
                  columnLabel="Question"
                  rows={matrix.regions.map((region) => {
                    const cell = matrix.cells.find((c) => c.region === region)
                    return { id: region, label: region, note: `n=${cell?.total ?? 0}` }
                  })}
                  columns={topFaqIds.map((id) => ({
                    id,
                    label: rows.find((r) => r.faqId === id)?.shortLabel ?? id,
                  }))}
                  cell={(regionId, faqId) => {
                    const c = matrix.cells.find((x) => x.region === regionId)
                    const v = c?.values.find((x) => x.faqId === faqId)
                    if (!v || !c || c.total === 0) return null
                    return {
                      value: v.per100,
                      display: String(v.per100),
                      title: `${regionId} · ${faqId}: ${v.count} of ${v.denominator} calls (${v.per100} per 100)`,
                    }
                  }}
                />
              )}
              <p className="mt-3 text-[11px] text-ink-tertiary">
                Cells are per 100 calls, not raw counts — a region with 38 calls and one with 58
                cannot be compared on raw counts. Each row prints its own denominator.
              </p>
            </Section>

            {emerging.length > 0 && (
              <Section
                title={`Emerging questions (${emerging.length})`}
                description="Questions that rose by more than 50% against the comparison period, or appeared for the first time. These are the ones to answer on the website before the volume lands in the contact centre."
                meta={`${periodLabel} vs ${comparisonLabel} · minimum 3 calls`}
              >
                <ul className="space-y-3">
                  {emerging.map((r) => (
                    <li key={r.faqId} className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[13px] font-medium text-ink-primary">
                            {r.shortLabel}
                          </span>
                          <StatusBadge
                            size="sm"
                            tone={r.hasKbArticle ? 'warning' : 'danger'}
                            label={r.trendPct === null ? 'New this period' : `+${r.trendPct}%`}
                          />
                          {!r.hasKbArticle && (
                            <StatusBadge size="sm" tone="danger" label="No KB article" />
                          )}
                        </div>
                        <p className="text-[12px] text-ink-secondary mt-0.5">{r.recommendation}</p>
                        <p className="text-[11px] text-ink-tertiary mt-0.5">
                          {r.callCount} calls this period, {r.prevCallCount} previously · owner{' '}
                          {r.owner} · example:{' '}
                          <Link
                            href={`/call-intelligence/explorer/${r.sampleCallId}`}
                            className="text-accent-copper hover:underline"
                          >
                            {r.sampleCallId}
                          </Link>
                        </p>
                      </div>
                      <SampleSizeNote n={r.callCount} />
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            <Section
              title="Every question asked this period"
              description="Sortable and exportable. Answer accuracy is blank wherever no approved article exists to check against — that is a real gap, not a missing number."
              meta={`${periodLabel} · compared with ${comparisonLabel} · ${rows.length} distinct questions across ${data.calls.length} calls`}
              padded={false}
            >
              <DataTable
                rows={rows}
                columns={columns}
                rowKey={(r) => r.faqId}
                pageSize={12}
                exportName="sunroof-faqs"
                searchPlaceholder="Search questions and owners…"
                caption="Questions asked, with answer quality and ownership"
                emptyHeadline="No questions identified"
                emptySupport="No call in the current filter set contained an identifiable customer question."
              />
            </Section>

            {rows.every((r) => r.avgAccuracy === null) && rows.length > 0 && (
              <NotMeasurable reason="none of the questions asked this period have an approved knowledge-base article, so answer accuracy is unscorable across the board." />
            )}
          </div>
        )
      }}
    </CiPageFrame>
  )
}
