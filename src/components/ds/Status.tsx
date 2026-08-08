'use client'

import type { ReactNode } from 'react'
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  CircleDashed,
  Clock,
  PlayCircle,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * The portal's status vocabulary — one component, five meanings, used
 * everywhere a state is shown.
 *
 * Two rules this file exists to enforce:
 *  1. A tone always means the same thing. `danger` is overdue/failed/expired
 *     and nothing else; `warning` is "approaching", never "bad".
 *  2. Colour is never the only signal. Every badge renders an icon AND a word,
 *     so the state survives greyscale, colour-blindness and a photocopier.
 */

export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const TONE_ICON: Record<Tone, LucideIcon> = {
  success: CheckCircle2,
  warning: Clock,
  danger: AlertTriangle,
  info: PlayCircle,
  neutral: CircleDashed,
}

/** Tint + text pairs. Each -fg on its -bg clears 4.5:1 in both themes. */
const TONE_CHIP: Record<Tone, string> = {
  success: 'bg-success-bg text-success-fg border-success/25',
  warning: 'bg-warning-bg text-warning-fg border-warning/25',
  danger: 'bg-danger-bg text-danger-fg border-danger/30',
  info: 'bg-info-bg text-info-fg border-info/25',
  neutral: 'bg-sem-neutral-bg text-sem-neutral-fg border-hairline/15',
}

const TONE_SOLID: Record<Tone, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  neutral: 'bg-sem-neutral',
}

const TONE_TEXT: Record<Tone, string> = {
  success: 'text-success-fg',
  warning: 'text-warning-fg',
  danger: 'text-danger-fg',
  info: 'text-info-fg',
  neutral: 'text-ink-secondary',
}

export function toneFill(tone: Tone): string {
  return TONE_SOLID[tone]
}

export function toneText(tone: Tone): string {
  return TONE_TEXT[tone]
}

/**
 * Status badge. `label` is mandatory — there is no icon-only variant, because
 * an icon alone is not an accessible status.
 */
export function StatusBadge({
  tone,
  label,
  icon,
  size = 'md',
  title,
  className,
}: {
  tone: Tone
  label: string
  /** Override the tone's default icon when a more literal one reads better. */
  icon?: LucideIcon
  size?: 'sm' | 'md'
  title?: string
  className?: string
}) {
  const Icon = icon ?? TONE_ICON[tone]
  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap',
        size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
        TONE_CHIP[tone],
        className,
      )}
    >
      <Icon size={size === 'sm' ? 11 : 13} className="flex-shrink-0" aria-hidden />
      {label}
    </span>
  )
}

/**
 * Period-over-period delta. `goodDirection` matters: a fall in overdue count is
 * good, a fall in completion is not — so direction and tone are decided
 * separately and never conflated.
 */
export function DeltaPill({
  delta,
  unit = 'pp',
  goodDirection = 'up',
  periodLabel,
  className,
}: {
  /** Signed change vs the previous period. Null when there is no baseline. */
  delta: number | null
  unit?: string
  goodDirection?: 'up' | 'down'
  periodLabel?: string
  className?: string
}) {
  if (delta == null) {
    return (
      <span className={cn('text-[11px] text-ink-tertiary whitespace-nowrap', className)}>
        No prior period
      </span>
    )
  }
  const flat = Math.abs(delta) < 0.05
  const rising = delta > 0
  const good = flat ? null : rising === (goodDirection === 'up')
  const Icon = flat ? ArrowRight : rising ? ArrowUpRight : ArrowDownRight
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[11px] font-medium whitespace-nowrap tnum',
        good == null ? 'text-ink-tertiary' : good ? 'text-success-fg' : 'text-danger-fg',
        className,
      )}
      title={periodLabel ? `Change vs ${periodLabel}` : undefined}
    >
      <Icon size={12} className="flex-shrink-0" aria-hidden />
      {flat ? 'No change' : `${rising ? '+' : ''}${delta.toFixed(1)}${unit}`}
      {periodLabel && <span className="text-ink-tertiary font-normal">vs {periodLabel}</span>}
    </span>
  )
}

/**
 * A labelled progress bar. Always renders the number next to the bar — a bar
 * on its own is a decoration, not a measurement.
 */
export function ProgressBar({
  value,
  tone = 'info',
  label,
  showValue = true,
  size = 'md',
  className,
}: {
  /** 0–100. Clamped. */
  value: number
  tone?: Tone
  label?: string
  showValue?: boolean
  size?: 'sm' | 'md'
  className?: string
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className={cn(
          'flex-1 rounded-full bg-[rgb(var(--rule)/0.1)] overflow-hidden',
          size === 'sm' ? 'h-1.5' : 'h-2',
        )}
      >
        <div
          className={cn('h-full rounded-full transition-[width] duration-500', TONE_SOLID[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showValue && (
        <span className="text-xs font-medium text-ink-secondary tnum w-9 text-right flex-shrink-0">
          {pct}%
        </span>
      )}
    </div>
  )
}

/**
 * Stacked composition bar — completion mix, readiness mix. Segments carry a
 * title so each slice is inspectable, and a legend is rendered separately by
 * the caller so the bar itself stays thin.
 */
export function StackedBar({
  segments,
  total,
  className,
}: {
  segments: { tone: Tone; value: number; label: string }[]
  total: number
  className?: string
}) {
  if (total <= 0) {
    return (
      <div
        className={cn('h-2 rounded-full bg-[rgb(var(--rule)/0.08)]', className)}
        title="No data"
      />
    )
  }
  return (
    <div className={cn('flex h-2 rounded-full overflow-hidden bg-[rgb(var(--rule)/0.08)]', className)}>
      {segments.map((s) =>
        s.value === 0 ? null : (
          <span
            key={s.label}
            className={cn('h-full', TONE_SOLID[s.tone])}
            style={{ width: `${(s.value / total) * 100}%` }}
            title={`${s.label}: ${s.value} of ${total}`}
          />
        ),
      )}
    </div>
  )
}

export function Legend({
  items,
  className,
}: {
  items: { tone: Tone; label: string; value?: ReactNode }[]
  className?: string
}) {
  return (
    <ul className={cn('flex flex-wrap items-center gap-x-4 gap-y-1.5', className)}>
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5 text-[11px] text-ink-secondary">
          <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', TONE_SOLID[i.tone])} aria-hidden />
          {i.label}
          {i.value != null && <span className="text-ink-primary font-medium tnum">{i.value}</span>}
        </li>
      ))}
    </ul>
  )
}
