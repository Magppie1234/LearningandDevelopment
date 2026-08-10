'use client'

import { type ReactNode } from 'react'
import Link from 'next/link'
import {
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import { BarChart3, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CARD_BASE, Empty, type Tone } from '@/components/ds'
import { ProvenanceBadge, SampleSizeNote } from './CiPrimitives'
import type { FunnelStage } from '@/lib/call-intelligence/metrics'

/**
 * Charts for Call Intelligence.
 *
 * The portal design system already owns the line, the horizontal bar and the
 * gap heatmap. This module adds the three shapes the brief needs that it does
 * not have — a ranked bar that prints counts against a denominator, a scatter
 * with named quadrants, and a funnel that shows where the denominator changes
 * from AI-inferred to CRM-verified — and it wraps all of them in a frame that
 * makes §15 structural rather than optional:
 *
 *   every chart states its period AND its comparison period.
 *
 * `CiChartFrame` takes both as required props. A chart that cannot name its
 * baseline does not get drawn.
 */

const TONE_VAR: Record<Tone, string> = {
  success: 'var(--sem-success)',
  warning: 'var(--sem-warning)',
  danger: 'var(--sem-danger)',
  info: 'var(--sem-info)',
  neutral: 'var(--sem-neutral)',
}

const rgbOf = (tone: Tone) => `rgb(${TONE_VAR[tone]})`

/* ── Frame ────────────────────────────────────────────────────────────────── */

export function CiChartFrame({
  title,
  question,
  period,
  comparisonPeriod,
  unit,
  denominatorNote,
  provenance,
  legend,
  drillHref,
  drillLabel = 'Open in Call Explorer',
  isEmpty,
  emptyHeadline = 'Nothing recorded in this period',
  emptySupport = 'No calls in the selected window match the current filters. Widen the date range or clear a filter.',
  footnote,
  children,
  className,
}: {
  title: string
  /** The decision this visual serves. Optional but strongly encouraged. */
  question?: string
  period: string
  /** Required by §15 — the baseline is never implied. */
  comparisonPeriod: string
  unit: string
  /** What the numbers are out of. */
  denominatorNote?: ReactNode
  provenance?: 'ai_inferred' | 'crm_verified' | 'system' | 'mixed'
  legend?: ReactNode
  drillHref?: string
  drillLabel?: string
  isEmpty?: boolean
  emptyHeadline?: string
  emptySupport?: string
  footnote?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <figure className={cn(CARD_BASE, 'p-5 m-0 min-w-0', className)}>
      <figcaption className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-ink-primary leading-tight">{title}</h3>
          {question && <p className="text-xs text-ink-secondary mt-1 max-w-2xl">{question}</p>}
          <p className="text-[11px] text-ink-tertiary mt-1">
            {period} · {unit}
          </p>
          <p className="text-[11px] text-ink-tertiary">
            Compared with {comparisonPeriod}
          </p>
          {denominatorNote && (
            <p className="text-[11px] text-ink-tertiary mt-0.5">{denominatorNote}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          {provenance && <ProvenanceBadge provenance={provenance} />}
          {drillHref && (
            <Link
              href={drillHref}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-accent-copper hover:underline"
            >
              {drillLabel}
              <ChevronRight size={12} aria-hidden />
            </Link>
          )}
        </div>
      </figcaption>

      {isEmpty ? (
        <Empty compact icon={BarChart3} headline={emptyHeadline} support={emptySupport} />
      ) : (
        <>
          {children}
          {legend && <div className="mt-3">{legend}</div>}
          {footnote && (
            <p className="mt-3 pt-2.5 border-t border-hairline/8 text-[11px] text-ink-tertiary leading-snug">
              {footnote}
            </p>
          )}
        </>
      )}
    </figure>
  )
}

/* ── Ranked bars ──────────────────────────────────────────────────────────── */

export interface RankedBarRow {
  id: string
  label: string
  /** Bar length driver. */
  value: number
  /** Printed at the end of the bar — usually the raw count. */
  valueLabel: string
  /** Sample size behind this row, printed so a rate is never naked (§15). */
  sampleSize?: number
  /** Period-over-period movement, in the row's own unit. */
  deltaLabel?: string
  tone?: Tone
  href?: string
  title?: string
}

/**
 * Horizontal ranked bars, hand-drawn rather than Recharts.
 *
 * Recharts' vertical BarChart truncates long category labels and gives no
 * room for the count + sample-size + delta trio the brief requires on every
 * row. A flex row does all three and stays legible on a phone.
 */
export function RankedBars({
  rows,
  max,
  className,
}: {
  rows: RankedBarRow[]
  /** Shared scale. Defaults to the largest value present. */
  max?: number
  className?: string
}) {
  const ceiling = max ?? Math.max(1, ...rows.map((r) => r.value))
  return (
    <ul className={cn('space-y-2.5', className)}>
      {rows.map((r) => {
        const width = Math.max(1.5, (r.value / ceiling) * 100)
        const inner = (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[13px] text-ink-primary min-w-0 truncate">{r.label}</span>
              <span className="text-[13px] font-medium text-ink-primary tnum whitespace-nowrap flex-shrink-0">
                {r.valueLabel}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-[rgb(var(--rule)/0.08)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{ width: `${width}%`, backgroundColor: rgbOf(r.tone ?? 'info') }}
                />
              </div>
            </div>
            {(r.sampleSize !== undefined || r.deltaLabel) && (
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                {r.sampleSize !== undefined && <SampleSizeNote n={r.sampleSize} />}
                {r.deltaLabel && (
                  <span className="text-[11px] text-ink-tertiary tnum">{r.deltaLabel}</span>
                )}
              </div>
            )}
          </>
        )
        return (
          <li key={r.id} title={r.title}>
            {r.href ? (
              <Link
                href={r.href}
                className="block rounded-lg -mx-2 px-2 py-1 hover:bg-[rgb(var(--rule)/0.04)] transition-colors"
              >
                {inner}
              </Link>
            ) : (
              <div className="py-1">{inner}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

/* ── Intensity heatmap ────────────────────────────────────────────────────── */

/**
 * Two-dimensional comparison. Distinct from the design system's `Heatmap`,
 * whose ramp is gap-shaped (0 = good = green). Here a high number is simply a
 * high number — the ramp is single-hue intensity, and the value is printed in
 * every cell so colour is never the only signal (§15).
 */
export function IntensityHeatmap({
  rows,
  columns,
  cell,
  rowLabel,
  columnLabel,
  className,
}: {
  rows: { id: string; label: string; note?: string }[]
  columns: { id: string; label: string }[]
  /** null = not measurable for this pairing. */
  cell: (rowId: string, columnId: string) => { value: number; display: string; title: string } | null
  rowLabel: string
  columnLabel: string
  className?: string
}) {
  let peak = 0
  for (const r of rows) {
    for (const c of columns) {
      const v = cell(r.id, c.id)
      if (v && v.value > peak) peak = v.value
    }
  }
  const ceiling = Math.max(1, peak)

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="border-collapse text-[11px]">
        <caption className="sr-only">
          {rowLabel} by {columnLabel}
        </caption>
        <thead>
          <tr>
            <th
              scope="col"
              className="sticky left-0 z-10 bg-parchment px-2 py-1.5 text-left text-ink-tertiary font-medium"
            >
              {rowLabel}
            </th>
            {columns.map((c) => (
              <th key={c.id} scope="col" className="px-1.5 py-1.5 text-ink-tertiary font-medium align-bottom">
                <span className="block w-[68px] leading-tight">{c.label}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <th
                scope="row"
                className="sticky left-0 z-10 bg-parchment px-2 py-1 text-left font-medium text-ink-primary whitespace-nowrap"
              >
                {r.label}
                {r.note && <span className="block font-normal text-ink-tertiary">{r.note}</span>}
              </th>
              {columns.map((c) => {
                const v = cell(r.id, c.id)
                if (!v) {
                  return (
                    <td key={c.id} className="p-0.5">
                      <div
                        className="h-9 rounded border border-dashed border-hairline/20 grid place-items-center text-ink-tertiary"
                        title={`${r.label} · ${c.label}: not measurable`}
                      >
                        —
                      </div>
                    </td>
                  )
                }
                const t = Math.min(1, v.value / ceiling)
                return (
                  <td key={c.id} className="p-0.5">
                    <div
                      className="h-9 rounded grid place-items-center font-medium tnum"
                      style={{
                        backgroundColor: `rgb(var(--m-accent-copper) / ${0.08 + t * 0.62})`,
                        color: t > 0.55 ? 'white' : 'rgb(var(--m-ink-primary))',
                      }}
                      title={v.title}
                    >
                      {v.display}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ── Quadrant scatter ─────────────────────────────────────────────────────── */

export interface ScatterPoint {
  name: string
  x: number
  y: number
  /** Bubble size driver — usually the sample size. */
  size: number
  denominator: number
  group?: string
}

function ScatterTooltip({
  active,
  payload,
  xLabel,
  yLabel,
}: {
  active?: boolean
  payload?: { payload: ScatterPoint }[]
  xLabel: string
  yLabel: string
}) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="rounded-lg border border-hairline/15 bg-parchment px-3 py-2 shadow-elevated text-xs">
      <p className="font-medium text-ink-primary mb-1">{p.name}</p>
      {p.group && <p className="text-ink-tertiary mb-1">{p.group}</p>}
      <p className="text-ink-secondary tnum">
        {xLabel}: <span className="font-medium text-ink-primary">{p.x}</span>
      </p>
      <p className="text-ink-secondary tnum">
        {yLabel}: <span className="font-medium text-ink-primary">{p.y}</span>
      </p>
      <p className="text-ink-tertiary tnum mt-1">n = {p.denominator}</p>
    </div>
  )
}

/**
 * Relationship plot with named quadrants.
 *
 * The quadrant labels are the point: an unlabelled scatter asks the reader to
 * infer what the top-right corner means. Every point carries its own
 * denominator in the tooltip, and points below the minimum sample size are
 * filtered out by the caller, not drawn faintly and hoped about.
 */
export function QuadrantScatter({
  points,
  xLabel,
  yLabel,
  xMid,
  yMid,
  quadrants,
  height = 300,
  xDomain = [0, 100],
  yDomain = [0, 100],
}: {
  points: ScatterPoint[]
  xLabel: string
  yLabel: string
  xMid: number
  yMid: number
  /** Clockwise from top-right. */
  quadrants: { topRight: string; bottomRight: string; bottomLeft: string; topLeft: string }
  height?: number
  xDomain?: [number, number]
  yDomain?: [number, number]
}) {
  return (
    <div>
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 12, bottom: 18, left: -10 }}>
            <CartesianGrid stroke="rgb(var(--rule)/0.08)" />
            <XAxis
              type="number"
              dataKey="x"
              name={xLabel}
              domain={xDomain}
              tickLine={false}
              axisLine={false}
              stroke="rgb(var(--m-ink-tertiary))"
              fontSize={11}
              label={{
                value: xLabel,
                position: 'insideBottom',
                offset: -10,
                fill: 'rgb(var(--m-ink-tertiary))',
                fontSize: 11,
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name={yLabel}
              domain={yDomain}
              tickLine={false}
              axisLine={false}
              stroke="rgb(var(--m-ink-tertiary))"
              fontSize={11}
            />
            <ZAxis type="number" dataKey="size" range={[40, 300]} />
            <ReferenceLine x={xMid} stroke="rgb(var(--rule)/0.35)" strokeDasharray="4 4" />
            <ReferenceLine y={yMid} stroke="rgb(var(--rule)/0.35)" strokeDasharray="4 4" />
            <Tooltip
              content={<ScatterTooltip xLabel={xLabel} yLabel={yLabel} />}
              cursor={{ strokeDasharray: '3 3' }}
            />
            <Scatter data={points} fill={rgbOf('info')}>
              {points.map((p) => (
                <Cell
                  key={p.name}
                  fill={
                    p.x >= xMid && p.y >= yMid
                      ? rgbOf('success')
                      : p.x < xMid && p.y < yMid
                        ? rgbOf('danger')
                        : rgbOf('info')
                  }
                  fillOpacity={0.7}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        <div>
          <dt className="inline text-ink-tertiary">Top-left: </dt>
          <dd className="inline text-ink-secondary">{quadrants.topLeft}</dd>
        </div>
        <div>
          <dt className="inline text-ink-tertiary">Top-right: </dt>
          <dd className="inline text-ink-secondary">{quadrants.topRight}</dd>
        </div>
        <div>
          <dt className="inline text-ink-tertiary">Bottom-left: </dt>
          <dd className="inline text-ink-secondary">{quadrants.bottomLeft}</dd>
        </div>
        <div>
          <dt className="inline text-ink-tertiary">Bottom-right: </dt>
          <dd className="inline text-ink-secondary">{quadrants.bottomRight}</dd>
        </div>
      </dl>
    </div>
  )
}

/* ── Funnel ───────────────────────────────────────────────────────────────── */

/**
 * Call-to-order funnel.
 *
 * §13's hardest rule lives here: the first three stages are AI-inferred and the
 * last two are CRM-verified, and they do NOT share a denominator. Rather than
 * quietly rebasing, the funnel draws a visible break at the stage where the
 * denominator switches and says so in words. A funnel that hides that break is
 * how "AI says 40% were high intent" turns into "we lost 40% of our pipeline".
 */
export function ProvenanceFunnel({
  stages,
  className,
}: {
  stages: FunnelStage[]
  className?: string
}) {
  const first = stages[0]?.value ?? 1
  return (
    <ol className={cn('space-y-1', className)}>
      {stages.map((s, i) => {
        const prior = stages[i - 1]
        // A funnel "chains" when each stage is measured out of the one above
        // it. The break that matters is where it stops chaining — where the
        // base changes from analysed calls to CRM-linked calls. Testing the
        // provenance *label* instead would flag system→mixed→ai_inferred as
        // breaks too, and three warnings mean the reader ignores all three.
        const breaks = Boolean(prior) && s.denominator !== prior.value
        const width = Math.max(6, (s.value / Math.max(1, first)) * 100)
        const tone: Tone =
          s.provenance === 'crm_verified' ? 'success' : s.provenance === 'ai_inferred' ? 'warning' : 'info'
        return (
          <li key={s.label}>
            {breaks && (
              <div className="flex items-center gap-2 py-2.5" role="separator">
                <span className="h-px flex-1 bg-danger/40" />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-danger-fg whitespace-nowrap">
                  base changes: {prior.value.toLocaleString('en-IN')} → {s.denominator.toLocaleString('en-IN')}
                </span>
                <span className="h-px flex-1 bg-danger/40" />
              </div>
            )}
            <div className="rounded-lg px-3 py-2.5 bg-[rgb(var(--rule)/0.03)]">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="text-[13px] font-medium text-ink-primary">{s.label}</span>
                <span className="flex items-baseline gap-2">
                  <span className="text-[15px] font-semibold text-ink-primary tnum">
                    {s.value.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-ink-tertiary tnum whitespace-nowrap">
                    of {s.denominator.toLocaleString('en-IN')} · {s.pctOfPrevious}%
                  </span>
                </span>
              </div>
              <div className="mt-1.5 h-2.5 rounded-full bg-[rgb(var(--rule)/0.08)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{ width: `${width}%`, backgroundColor: rgbOf(tone) }}
                />
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <ProvenanceBadge provenance={s.provenance} />
                <span className="text-[11px] text-ink-tertiary leading-snug min-w-0">{s.note}</span>
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/* ── Stacked composition row ──────────────────────────────────────────────── */

/** Sentiment / answer-status mix as one labelled bar with counts. */
export function CompositionBar({
  segments,
  total,
  className,
}: {
  segments: { label: string; value: number; tone: Tone }[]
  total: number
  className?: string
}) {
  if (total <= 0) {
    return (
      <div className={cn('h-2.5 rounded-full bg-[rgb(var(--rule)/0.08)]', className)} title="No data" />
    )
  }
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex h-2.5 rounded-full overflow-hidden bg-[rgb(var(--rule)/0.08)]">
        {segments.map((s) =>
          s.value === 0 ? null : (
            <span
              key={s.label}
              className="h-full"
              style={{ width: `${(s.value / total) * 100}%`, backgroundColor: rgbOf(s.tone) }}
              title={`${s.label}: ${s.value} of ${total}`}
            />
          ),
        )}
      </div>
      <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-1.5 text-[11px] text-ink-secondary">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: rgbOf(s.tone) }}
              aria-hidden
            />
            {s.label}
            <span className="text-ink-primary font-medium tnum">
              {s.value} ({total ? Math.round((s.value / total) * 100) : 0}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
