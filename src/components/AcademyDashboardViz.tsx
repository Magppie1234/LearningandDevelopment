'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle, ClipboardCheck, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Shared building blocks for the academy learning dashboards (BD, Sales, …):
 * KPI cards, the progress bar chart, the status pictograph and stat tiles.
 * Status colors are the app's reserved status tokens so both themes stay
 * on-brand, and identity never rides on color alone — every colored mark is
 * paired with an icon and a text label.
 */

export const STATUS_VIZ = {
  passed: { color: 'var(--status-ontrack)', label: 'Completed', icon: CheckCircle2 },
  inProgress: { color: 'rgb(var(--m-accent-copper))', label: 'In progress', icon: ClipboardCheck },
  notStarted: { color: 'rgb(var(--m-ink-tertiary))', label: 'Not started', icon: Circle },
} as const

export type StatusKey = keyof typeof STATUS_VIZ

/* ─────────────────── hero band ─────────────────── */
export function DashHero({
  color,
  image,
  backHref,
  backLabel,
  title,
  subtitle,
  ring,
}: {
  color: string
  image?: string
  backHref: string
  backLabel: string
  title: string
  subtitle: string
  /** Overall completion 0–100, shown as a ring on the right. */
  ring: number
}) {
  const size = 108
  const strokeWidth = 9
  const r = (size - strokeWidth) / 2
  const C = 2 * Math.PI * r
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl p-7 sm:p-8"
      style={{ backgroundColor: `${color}1c` }}
    >
      {/* soft decorative glow in the academy color */}
      <div
        aria-hidden
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-40 blur-3xl pointer-events-none"
        style={{ backgroundColor: `${color}55` }}
      />
      <div className="relative flex flex-wrap items-center gap-6">
        <div className="flex-1 min-w-[240px]">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-sm text-ink-tertiary hover:text-ink-primary transition-colors mb-3"
          >
            ← {backLabel}
          </Link>
          <div className="flex items-center gap-4">
            {image && (
              <img
                src={image}
                alt=""
                className="w-14 h-14 rounded-full object-cover border-2 shrink-0"
                style={{ borderColor: color }}
              />
            )}
            <h1 className="font-serif text-4xl font-normal text-ink-primary">{title}</h1>
          </div>
          <p className="text-sm text-ink-secondary mt-3 max-w-[560px]">{subtitle}</p>
        </div>
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,59,70,0.08)" strokeWidth={strokeWidth} />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="var(--status-ontrack)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C - (ring / 100) * C}
              style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xl font-bold text-ink-primary tabular-nums">{ring}%</p>
            <p className="text-[9px] font-medium uppercase tracking-wide text-ink-tertiary">Complete</p>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

/* ─────────────────── KPI card (pill label + value) ─────────────────── */
export function KpiCard({
  icon: Icon,
  pillColor,
  label,
  value,
  sub,
  delay = 0,
}: {
  icon: LucideIcon
  pillColor: string
  label: string
  value: string
  sub?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="rounded-2xl border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream p-5 flex flex-col items-center text-center shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300"
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center mb-3 border"
        style={{
          borderColor: pillColor,
          color: pillColor,
          backgroundColor: `color-mix(in srgb, ${pillColor} 10%, transparent)`,
        }}
      >
        <Icon size={19} />
      </div>
      <span
        className="inline-block rounded-full px-3.5 py-1 text-[11px] font-semibold text-parchment"
        style={{ backgroundColor: pillColor }}
      >
        {label}
      </span>
      <p className="mt-3 text-xl font-bold text-ink-primary tabular-nums leading-tight">{value}</p>
      {sub && <p className="text-[11px] text-ink-tertiary mt-1">{sub}</p>}
    </motion.div>
  )
}

/* ─────────────────── bar chart ─────────────────── */
export interface BarDatum {
  id: string
  /** short x-axis label, e.g. "M1" or "C1" */
  label: string
  /** 0–100, or null for "not attempted / no data" */
  pct: number | null
  /** tooltip lines */
  lines: string[]
}

export function ProgressBarsChart({
  data,
  refLine,
}: {
  data: BarDatum[]
  refLine?: { pct: number; label: string }
}) {
  const [hover, setHover] = useState<string | null>(null)
  const gridLines = [0, 20, 40, 60, 80, 100]

  return (
    <div>
      <div className="relative h-[190px]">
        {gridLines.map((g) => (
          <div key={g} className="absolute inset-x-0 flex items-center gap-2" style={{ bottom: `${g}%` }}>
            <span className="w-7 text-right text-[10px] text-ink-tertiary tabular-nums -translate-y-1/2">{g}</span>
            <div
              className={cn('flex-1 border-t', refLine && g === refLine.pct && 'border-dashed')}
              style={{
                borderColor:
                  refLine && g === refLine.pct ? 'var(--status-ontrack)' : 'rgba(0,59,70,0.07)',
              }}
            />
          </div>
        ))}
        {refLine && (
          <span
            className="absolute right-0 -translate-y-1/2 rounded px-1.5 py-0.5 text-[9px] font-semibold"
            style={{
              bottom: `${refLine.pct}%`,
              backgroundColor: 'var(--status-ontrack-bg)',
              color: 'var(--status-ontrack-fg)',
            }}
          >
            {refLine.label}
          </span>
        )}
        <div className="absolute inset-y-0 left-9 right-0 flex items-end justify-between gap-[6px] px-1">
          {data.map((d, i) => (
            <div
              key={d.id}
              className="relative flex-1 h-full flex items-end justify-center"
              onMouseEnter={() => setHover(d.id)}
              onMouseLeave={() => setHover(null)}
            >
              {d.pct === null ? (
                <div className="w-full max-w-[26px] h-[3px] rounded-full bg-[rgba(0,59,70,0.10)]" />
              ) : (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(d.pct, 2)}%` }}
                  transition={{ duration: 0.7, delay: 0.05 * i, ease: [0.2, 0.8, 0.2, 1] }}
                  className="w-full max-w-[26px] rounded-t-[4px]"
                  style={{
                    backgroundColor: 'rgb(var(--m-accent-copper))',
                    opacity: hover && hover !== d.id ? 0.45 : 1,
                    transition: 'opacity 0.2s',
                  }}
                />
              )}
              {hover === d.id && (
                <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap rounded-lg bg-ink-primary px-2.5 py-1.5 text-[11px] text-parchment shadow-card pointer-events-none">
                  {d.lines.map((l, li) => (
                    <span key={li} className={cn('block', li === 0 && 'font-semibold')}>
                      {l}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-1.5 ml-9 flex justify-between gap-[6px] px-1">
        {data.map((d) => (
          <span key={d.id} className="flex-1 text-center text-[10px] text-ink-tertiary tabular-nums">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────── pictograph ───────────────────
   One icon per unit (module/course), colored by status — the fastest read
   of "how many taken vs completed". Hover a legend row to spotlight that
   status; hover an icon for details; click to open the unit. */
export interface PictoItem {
  id: string
  href: string
  /** short label under the icon, e.g. "M1" or "C1" */
  label: string
  /** tooltip lines */
  lines: string[]
  status: StatusKey
}

export function Pictograph({
  items,
  icon: Icon,
  counts,
  unitLabel,
  cols = 5,
}: {
  items: PictoItem[]
  icon: LucideIcon
  counts: Record<StatusKey, number>
  unitLabel: string
  cols?: 4 | 5
}) {
  const [hover, setHover] = useState<string | null>(null)
  const [hoverStatus, setHoverStatus] = useState<StatusKey | null>(null)
  const order: StatusKey[] = ['passed', 'inProgress', 'notStarted']

  return (
    <div>
      <p className="text-[28px] font-bold text-ink-primary tabular-nums leading-none">
        {counts.passed}
        <span className="text-base font-semibold text-ink-tertiary">
          {' '}
          of {items.length} {unitLabel}
        </span>
      </p>
      <div className={cn('mt-4 grid gap-2', cols === 5 ? 'grid-cols-5' : 'grid-cols-4')}>
        {items.map((d, i) => {
          const dimmed = hoverStatus !== null && d.status !== hoverStatus
          return (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: dimmed ? 0.3 : 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.04 * i }}
            >
              <Link
                href={d.href}
                onMouseEnter={() => setHover(d.id)}
                onMouseLeave={() => setHover(null)}
                className="relative flex flex-col items-center rounded-xl py-2.5 hover:bg-[rgba(0,59,70,0.04)] transition-colors"
                aria-label={`${d.lines[0]} — ${STATUS_VIZ[d.status].label}`}
              >
                <Icon
                  size={30}
                  strokeWidth={d.status === 'notStarted' ? 1.5 : 2.2}
                  style={{ color: STATUS_VIZ[d.status].color }}
                />
                <span className="mt-1 text-[10px] font-medium text-ink-tertiary tabular-nums">
                  {d.label}
                </span>
                {hover === d.id && (
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap rounded-lg bg-ink-primary px-2.5 py-1.5 text-[11px] text-parchment shadow-card pointer-events-none">
                    {d.lines.map((l, li) => (
                      <span key={li} className={cn('block', li === 0 && 'font-semibold')}>
                        {l}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </motion.div>
          )
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-[rgba(0,59,70,0.08)] space-y-2">
        {order.map((k) => {
          const { color, label, icon: LegendIcon } = STATUS_VIZ[k]
          return (
            <button
              key={k}
              type="button"
              onMouseEnter={() => setHoverStatus(k)}
              onMouseLeave={() => setHoverStatus(null)}
              className="flex items-center gap-2.5 text-left w-full"
            >
              <span className="w-3 h-3 rounded-[3px] shrink-0" style={{ backgroundColor: color }} />
              <LegendIcon size={14} className="shrink-0 text-ink-tertiary" />
              <span className="text-[13px] text-ink-secondary flex-1">{label}</span>
              <span className="text-[13px] font-semibold text-ink-primary tabular-nums">{counts[k]}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ─────────────────── small stat tile ─────────────────── */
export function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-[12px] border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream p-4 shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300">
      <p className="text-2xl font-bold text-ink-primary tabular-nums">{value}</p>
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink-tertiary mt-0.5">{label}</p>
      {sub && <p className="text-[11px] text-ink-tertiary mt-1">{sub}</p>}
    </div>
  )
}

/* ─────────────────── chart card wrapper ─────────────────── */
export function ChartCard({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream p-5 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={16} className="text-ink-tertiary" />
        <h2 className="text-sm font-semibold text-ink-primary">{title}</h2>
      </div>
      {children}
    </div>
  )
}
