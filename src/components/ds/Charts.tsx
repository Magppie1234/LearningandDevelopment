'use client'

import { useId, type ReactNode } from 'react'
import Link from 'next/link'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { BarChart3, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Empty } from './Controls'
import { CARD_BASE } from './Surface'
import type { Tone } from './Status'

/**
 * Charts, restricted to the three shapes that help someone decide something:
 * a line for a trend, a horizontal bar for a comparison, a heat cell for a
 * gap matrix. No doughnuts, no 3D, no decorative series.
 *
 * `ChartFrame` enforces what the brief requires of every chart: title,
 * reporting period, units, an empty state and — where one exists — a
 * drill-down. A chart without a period and a unit is not interpretable.
 */

const TONE_VAR: Record<Tone, string> = {
  success: 'var(--sem-success)',
  warning: 'var(--sem-warning)',
  danger: 'var(--sem-danger)',
  info: 'var(--sem-info)',
  neutral: 'var(--sem-neutral)',
}

function rgbOf(tone: Tone): string {
  return `rgb(${TONE_VAR[tone]})`
}

export function ChartFrame({
  title,
  period,
  unit,
  legend,
  drillHref,
  drillLabel = 'View detail',
  isEmpty,
  emptyHeadline = 'No data for this period',
  emptySupport = 'Nothing has been recorded in the selected range. Widen the date range or clear filters.',
  children,
  className,
}: {
  title: string
  /** e.g. "Last 6 months to Jul 2026" — mandatory reporting context. */
  period: string
  /** e.g. "% of assigned courses completed". */
  unit: string
  legend?: ReactNode
  drillHref?: string
  drillLabel?: string
  isEmpty?: boolean
  emptyHeadline?: string
  emptySupport?: string
  children: ReactNode
  className?: string
}) {
  return (
    <figure className={cn(CARD_BASE, 'p-5 m-0', className)}>
      <figcaption className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-ink-primary leading-tight">{title}</h3>
          <p className="text-[11px] text-ink-tertiary mt-0.5">
            {period} · {unit}
          </p>
        </div>
        {drillHref && (
          <Link
            href={drillHref}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-accent-copper hover:underline flex-shrink-0"
          >
            {drillLabel}
            <ChevronRight size={12} aria-hidden />
          </Link>
        )}
      </figcaption>
      {isEmpty ? (
        <Empty compact icon={BarChart3} headline={emptyHeadline} support={emptySupport} />
      ) : (
        <>
          {children}
          {legend && <div className="mt-3">{legend}</div>}
        </>
      )}
    </figure>
  )
}

const AXIS = {
  stroke: 'rgb(var(--m-ink-tertiary))',
  fontSize: 11,
}

function TooltipBox({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
  unit?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-hairline/15 bg-parchment px-3 py-2 shadow-elevated text-xs">
      {label && <p className="font-medium text-ink-primary mb-1">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2 text-ink-secondary">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: p.color }}
            aria-hidden
          />
          {p.name}:{' '}
          <span className="font-medium text-ink-primary tnum">
            {p.value}
            {unit}
          </span>
        </p>
      ))}
    </div>
  )
}

/** Trend over time. One or two series maximum — more is a table. */
export function TrendLine({
  data,
  xKey,
  series,
  unitSuffix = '%',
  height = 200,
  yDomain = [0, 100],
}: {
  data: Record<string, string | number>[]
  xKey: string
  series: { key: string; name: string; tone: Tone }[]
  unitSuffix?: string
  height?: number
  yDomain?: [number, number] | undefined
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid stroke="rgb(var(--rule)/0.08)" vertical={false} />
          <XAxis dataKey={xKey} tickLine={false} axisLine={false} {...AXIS} />
          <YAxis
            tickLine={false}
            axisLine={false}
            domain={yDomain}
            tickFormatter={(v) => `${v}${unitSuffix}`}
            {...AXIS}
          />
          <Tooltip content={<TooltipBox unit={unitSuffix} />} cursor={{ stroke: 'rgb(var(--rule)/0.2)' }} />
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={rgbOf(s.tone)}
              strokeWidth={2}
              dot={{ r: 2.5, strokeWidth: 0, fill: rgbOf(s.tone) }}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * Horizontal comparison bars. Horizontal because category labels are
 * department and role names — long words that a vertical axis mangles.
 */
export function CompareBars({
  data,
  categoryKey,
  valueKey,
  tone = 'info',
  unitSuffix = '%',
  height,
  max = 100,
}: {
  data: Record<string, string | number>[]
  categoryKey: string
  valueKey: string
  tone?: Tone
  unitSuffix?: string
  height?: number
  max?: number
}) {
  const h = height ?? Math.max(140, data.length * 30 + 24)
  return (
    <div style={{ height: h }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 4 }}>
          <CartesianGrid stroke="rgb(var(--rule)/0.08)" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, max]}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}${unitSuffix}`}
            {...AXIS}
          />
          <YAxis
            type="category"
            dataKey={categoryKey}
            tickLine={false}
            axisLine={false}
            width={128}
            {...AXIS}
          />
          <Tooltip content={<TooltipBox unit={unitSuffix} />} cursor={{ fill: 'rgb(var(--rule)/0.04)' }} />
          <Bar dataKey={valueKey} fill={rgbOf(tone)} radius={[0, 4, 4, 0]} barSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * Skill-gap heatmap. Intensity encodes gap size; the number is printed in
 * every cell, so the colour is reinforcement rather than the only signal.
 */
export function Heatmap({
  rows,
  columns,
  cell,
  rowLabel,
  columnLabel,
  className,
}: {
  rows: { id: string; label: string }[]
  columns: { id: string; label: string }[]
  /** Returns null where the pairing is not measurable. */
  cell: (rowId: string, columnId: string) => { value: number; title: string } | null
  rowLabel: string
  columnLabel: string
  className?: string
}) {
  const id = useId()
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="border-collapse text-[11px]">
        <caption className="sr-only">
          {rowLabel} by {columnLabel}
        </caption>
        <thead>
          <tr>
            <th scope="col" className="sticky left-0 z-10 bg-parchment px-2 py-1.5 text-left text-ink-tertiary font-medium">
              {rowLabel}
            </th>
            {columns.map((c) => (
              <th
                key={c.id}
                scope="col"
                className="px-1.5 py-1.5 text-ink-tertiary font-medium align-bottom"
              >
                <span className="block w-[62px] leading-tight">{c.label}</span>
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
              </th>
              {columns.map((c) => {
                const v = cell(r.id, c.id)
                if (!v) {
                  return (
                    <td key={c.id} className="p-0.5">
                      <div
                        className="h-8 rounded border border-dashed border-hairline/15 grid place-items-center text-ink-tertiary"
                        title={`${r.label} · ${c.label}: not measurable`}
                      >
                        —
                      </div>
                    </td>
                  )
                }
                // 0 = no gap (success tint) … 100 = full gap (danger).
                const t = Math.max(0, Math.min(100, v.value)) / 100
                const tone: Tone = t === 0 ? 'success' : t < 0.34 ? 'warning' : 'danger'
                return (
                  <td key={`${id}-${c.id}`} className="p-0.5">
                    <div
                      className="h-8 rounded grid place-items-center font-medium tnum"
                      style={{
                        backgroundColor: `rgb(${TONE_VAR[tone]} / ${0.12 + t * 0.55})`,
                        color: t > 0.55 ? 'white' : 'rgb(var(--m-ink-primary))',
                      }}
                      title={v.title}
                    >
                      {v.value}
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
