'use client'

import { useState } from 'react'
import { DataTable, Notice, Section, Segmented, StatusBadge, type Column } from '@/components/ds'
import { CiPageFrame } from './CiShell'
import { useCi } from './CiContext'
import { SampleSizeNote } from './CiPrimitives'
import { CiChartFrame, RankedBars } from './CiCharts'
import { regionAggregates, type RegionRow } from '@/lib/call-intelligence/metrics'
import { THRESHOLDS } from '@/data/call-intelligence/taxonomy'

/**
 * Regional Intelligence — page 4.
 *
 * §5's hard rule drives the whole page: a rate computed on a handful of calls
 * is not a regional trend. Every row carries its sample size and its
 * reliability label, low-sample rows are visually demoted rather than hidden,
 * and the city view — where almost every row is below the minimum — says so at
 * the top instead of letting someone screenshot a 100% from nine calls.
 *
 * Geography always comes from CRM fields. It is never inferred from the
 * language the call was held in, the customer's accent or their name (§13).
 */

type Level = 'region' | 'state' | 'city'

const LEVELS: { value: Level; label: string }[] = [
  { value: 'region', label: 'Region' },
  { value: 'state', label: 'State' },
  { value: 'city', label: 'City' },
]

export default function RegionalIntelligence() {
  const { periodLabel, comparisonLabel, hrefWithFilters } = useCi()
  const [level, setLevel] = useState<Level>('region')

  return (
    <CiPageFrame
      title="Regional Intelligence"
      question="Which region needs attention this week — and is the sample large enough to act on?"
    >
      {(data) => {
        const rows = regionAggregates(data.calls, data.actions, level)
        const lowSample = rows.filter((r) => r.sample.level === 'low')

        const columns: Column<RegionRow>[] = [
          {
            key: 'area',
            header: LEVELS.find((l) => l.value === level)?.label ?? 'Area',
            sortable: true,
            value: (r) => r.key,
            cell: (r) => (
              <span className="min-w-0">
                <span className="block text-[13px] font-medium text-ink-primary">{r.key}</span>
                <SampleSizeNote n={r.calls} />
              </span>
            ),
          },
          {
            key: 'calls',
            header: 'Calls',
            sortable: true,
            align: 'right',
            nowrap: true,
            value: (r) => r.calls,
            cell: (r) => <span className="tnum">{r.calls}</span>,
          },
          {
            key: 'negative',
            header: 'Negative',
            sortable: true,
            align: 'right',
            nowrap: true,
            value: (r) => r.negativePct,
            cell: (r) => (
              <span className={r.negativePct > 30 ? 'tnum text-danger-fg font-medium' : 'tnum'}>
                {r.negativePct}%
              </span>
            ),
          },
          {
            key: 'improved',
            header: 'Improved on call',
            sortable: true,
            align: 'right',
            nowrap: true,
            secondary: true,
            value: (r) => r.sentimentImprovedPct,
            cell: (r) => <span className="tnum">{r.sentimentImprovedPct}%</span>,
          },
          {
            key: 'readiness',
            header: 'Avg readiness',
            sortable: true,
            align: 'right',
            nowrap: true,
            value: (r) => r.avgReadiness,
            cell: (r) => <span className="tnum">{r.avgReadiness}</span>,
          },
          {
            key: 'quality',
            header: 'Avg quality',
            sortable: true,
            align: 'right',
            nowrap: true,
            secondary: true,
            value: (r) => r.avgQuality,
            cell: (r) => <span className="tnum">{r.avgQuality}</span>,
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
            key: 'competitor',
            header: 'Competitor / 100',
            sortable: true,
            align: 'right',
            nowrap: true,
            secondary: true,
            value: (r) => r.competitorPer100,
            cell: (r) => <span className="tnum">{r.competitorPer100}</span>,
          },
          {
            key: 'complaints',
            header: 'Complaints / 100',
            sortable: true,
            align: 'right',
            nowrap: true,
            secondary: true,
            value: (r) => r.complaintsPer100,
            cell: (r) => <span className="tnum">{r.complaintsPer100}</span>,
          },
          {
            key: 'topFaq',
            header: 'Top question',
            secondary: true,
            value: (r) => r.topFaq?.label ?? '',
            cell: (r) =>
              r.topFaq ? (
                <span className="text-[12px]">
                  {r.topFaq.label}{' '}
                  <span className="text-ink-tertiary tnum">({r.topFaq.count})</span>
                </span>
              ) : (
                <span className="text-[11px] text-ink-tertiary">none</span>
              ),
          },
          {
            key: 'overdue',
            header: 'Overdue actions',
            sortable: true,
            align: 'right',
            nowrap: true,
            value: (r) => r.overdueActions,
            cell: (r) => (
              <span className={r.overdueActions > 0 ? 'tnum text-danger-fg' : 'tnum'}>
                {r.overdueActions}
              </span>
            ),
          },
        ]

        return (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Segmented
                options={LEVELS}
                value={level}
                onChange={setLevel}
                label="Geographic level"
              />
              <p className="text-[11px] text-ink-tertiary">
                Geography comes from CRM address fields only. It is never inferred from language,
                accent or name (§13).
              </p>
            </div>

            {lowSample.length > 0 && (
              <Notice tone="warning">
                <strong>
                  {lowSample.length} of {rows.length}{' '}
                  {level === 'region' ? 'regions' : level === 'state' ? 'states' : 'cities'} are below
                  the {THRESHOLDS.minSampleSize}-call minimum.
                </strong>{' '}
                Their rates are shown because hiding them would hide the coverage problem, but they
                are labelled &ldquo;low sample&rdquo; and must not be read as trends:{' '}
                {lowSample
                  .slice(0, 8)
                  .map((r) => `${r.key} (${r.calls})`)
                  .join(', ')}
                {lowSample.length > 8 ? ` and ${lowSample.length - 8} more` : ''}.
              </Notice>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
              <CiChartFrame
                title="Where customers end up unhappy"
                question="Which area has the highest share of calls ending negative?"
                period={periodLabel}
                comparisonPeriod={comparisonLabel}
                unit="% of calls ending negative"
                provenance="ai_inferred"
                isEmpty={rows.length === 0}
                denominatorNote={`${data.calls.length} analysable calls across ${rows.length} areas`}
                footnote={`Bars for areas below ${THRESHOLDS.minSampleSize} calls are drawn in neutral grey — the number is real, the trend is not.`}
              >
                <RankedBars
                  max={100}
                  rows={rows.slice(0, 12).map((r) => ({
                    id: r.key,
                    label: r.key,
                    value: r.negativePct,
                    valueLabel: `${r.negativePct}%`,
                    sampleSize: r.calls,
                    tone:
                      r.sample.level === 'low'
                        ? 'neutral'
                        : r.negativePct > 30
                          ? 'danger'
                          : r.negativePct > 18
                            ? 'warning'
                            : 'success',
                    href: hrefWithFilters('/call-intelligence/explorer', {
                      ...(level === 'region' ? { region: [r.region] } : {}),
                      sentiment: ['negative'],
                    }),
                  }))}
                />
              </CiChartFrame>

              <CiChartFrame
                title="Competitor pressure by area"
                question="Where are customers naming a competitor, normalised for call volume?"
                period={periodLabel}
                comparisonPeriod={comparisonLabel}
                unit="competitor mentions per 100 calls"
                provenance="ai_inferred"
                isEmpty={rows.length === 0}
                denominatorNote="Normalised per 100 calls so a big region does not automatically top the chart"
              >
                <RankedBars
                  rows={rows.slice(0, 12).map((r) => ({
                    id: r.key,
                    label: r.key,
                    value: r.competitorPer100,
                    valueLabel: `${r.competitorPer100} / 100 (${r.competitorMentions} total)`,
                    sampleSize: r.calls,
                    tone: r.sample.level === 'low' ? 'neutral' : 'warning',
                  }))}
                />
              </CiChartFrame>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <CiChartFrame
                title="Serviceability dead ends"
                question="Where are we being asked to deliver and cannot?"
                period={periodLabel}
                comparisonPeriod={comparisonLabel}
                unit="calls raising a serviceability objection"
                provenance="ai_inferred"
                isEmpty={rows.every((r) => r.serviceabilityConcerns === 0)}
                emptyHeadline="No serviceability objections in this window"
                emptySupport="No customer raised a location or serviceability blocker in the selected calls."
                footnote="A cluster here is a network-planning input, not a sales problem."
              >
                <RankedBars
                  rows={rows
                    .filter((r) => r.serviceabilityConcerns > 0)
                    .map((r) => ({
                      id: r.key,
                      label: r.key,
                      value: r.serviceabilityConcerns,
                      valueLabel: `${r.serviceabilityConcerns} of ${r.calls}`,
                      sampleSize: r.calls,
                      tone: 'danger' as const,
                    }))}
                />
              </CiChartFrame>

              <CiChartFrame
                title="Follow-through by area"
                question="Where are commitments to customers actually being closed?"
                period={periodLabel}
                comparisonPeriod={comparisonLabel}
                unit="% of actions completed"
                provenance="system"
                isEmpty={rows.every((r) => r.actionCompletionPct === null)}
                emptyHeadline="No actions raised in this window"
                emptySupport="Nothing was promised or recommended on the selected calls."
              >
                <RankedBars
                  max={100}
                  rows={rows
                    .filter((r) => r.actionCompletionPct !== null)
                    .map((r) => ({
                      id: r.key,
                      label: r.key,
                      value: r.actionCompletionPct ?? 0,
                      valueLabel: `${r.actionCompletionPct}% · ${r.overdueActions} overdue`,
                      sampleSize: r.calls,
                      tone:
                        (r.actionCompletionPct ?? 0) < 40
                          ? 'danger'
                          : (r.actionCompletionPct ?? 0) < 70
                            ? 'warning'
                            : 'success',
                    }))}
                />
              </CiChartFrame>
            </div>

            <Section
              title={`${rows.length} ${level === 'region' ? 'regions' : level === 'state' ? 'states' : 'cities'}, full detail`}
              description="Sortable and exportable. Every rate carries the sample it was computed on; conversion is CRM-verified and carries its own smaller denominator."
              meta={`${periodLabel} · compared with ${comparisonLabel} · minimum reliable sample is ${THRESHOLDS.minSampleSize} calls`}
              padded={false}
            >
              <DataTable
                rows={rows}
                columns={columns}
                rowKey={(r) => r.key}
                pageSize={12}
                exportName={`sunroof-${level}-performance`}
                searchPlaceholder="Search areas…"
                caption="Regional performance with sample sizes"
                emptyHeadline="No calls in this window"
                emptySupport="Nothing matches the current filters."
              />
            </Section>

            <Section
              title="Reliability of each area"
              description="Read this before quoting anything above. An area needs 20 calls to be indicative and 60 to be reliable."
              meta="Thresholds are configurable in taxonomy.ts → THRESHOLDS.minSampleSize"
            >
              <ul className="flex flex-wrap gap-2">
                {rows.map((r) => (
                  <li key={r.key}>
                    <StatusBadge
                      size="sm"
                      tone={
                        r.sample.level === 'reliable'
                          ? 'success'
                          : r.sample.level === 'indicative'
                            ? 'warning'
                            : 'danger'
                      }
                      label={`${r.key}: ${r.calls} · ${r.sample.label}`}
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
