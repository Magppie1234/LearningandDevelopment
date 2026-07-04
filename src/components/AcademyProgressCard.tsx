'use client'

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * AcademyProgressCard — the single source for academy/course progress UI
 * (modernization pass §1). Circular SVG ring + status badge instead of flat
 * bars and bare percentages. Colors come from the --status-* CSS variables in
 * globals.css, which carry contrast-checked dark-mode ("Obsidian") values.
 *
 * Status derivation: without due-date data, "overdue" cannot be inferred —
 * pass it explicitly where a real overdue/blocked state exists. Otherwise
 * >=50% reads as on track, anything lower as falling behind.
 */

export type ProgressStatus = 'on_track' | 'falling_behind' | 'overdue'

export function statusFromProgress(progress: number, overdue = false): ProgressStatus {
  if (overdue) return 'overdue'
  return progress >= 50 ? 'on_track' : 'falling_behind'
}

const STATUS_META: Record<ProgressStatus, { label: string; stroke: string; bg: string; fg: string }> = {
  on_track: {
    label: 'On track',
    stroke: 'var(--status-ontrack)',
    bg: 'var(--status-ontrack-bg)',
    fg: 'var(--status-ontrack-fg)',
  },
  falling_behind: {
    label: 'Falling behind',
    stroke: 'var(--status-risk)',
    bg: 'var(--status-risk-bg)',
    fg: 'var(--status-risk-fg)',
  },
  overdue: {
    label: 'Overdue',
    stroke: 'var(--status-overdue)',
    bg: 'var(--status-overdue-bg)',
    fg: 'var(--status-overdue-fg)',
  },
}

export function StatusBadgePill({ status }: { status: ProgressStatus }) {
  const meta = STATUS_META[status]
  return (
    <span
      className="inline-block rounded-lg px-2 py-0.5 text-[11px] font-medium leading-4"
      style={{ backgroundColor: meta.bg, color: meta.fg }}
    >
      {meta.label}
    </span>
  )
}

export function ProgressRing({
  progress,
  status,
  size = 60,
}: {
  progress: number
  status: ProgressStatus
  size?: number
}) {
  const stroke = 5
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const meta = STATUS_META[status]
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} aria-hidden>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--ring-track)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={meta.stroke}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - Math.min(100, Math.max(0, progress)) / 100)}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center font-semibold tabular-nums text-ink-primary"
        style={{ fontSize: size >= 56 ? 13 : 11 }}
      >
        {Math.round(progress)}%
      </span>
    </div>
  )
}

export interface AcademyProgressCardProps {
  title: string
  icon?: LucideIcon
  /** Academy accent for the icon chip (existing per-academy colors). */
  iconColor?: string
  completedModules: number
  totalModules: number
  progress: number
  status?: ProgressStatus
  href?: string
  /** 'card' = standalone bordered card · 'inline' = embed in an existing
   *  card · 'compact' = dense variant for popovers/side panels. */
  variant?: 'card' | 'inline' | 'compact'
  className?: string
}

export default function AcademyProgressCard({
  title,
  icon: Icon = GraduationCap,
  iconColor,
  completedModules,
  totalModules,
  progress,
  status,
  href,
  variant = 'card',
  className,
}: AcademyProgressCardProps) {
  const resolved = status ?? statusFromProgress(progress)
  const compact = variant === 'compact'

  const body = (
    <div className={cn('flex items-center gap-3', !compact && 'gap-4')}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'shrink-0 rounded-lg flex items-center justify-center',
              compact ? 'w-6 h-6' : 'w-8 h-8',
            )}
            style={{ backgroundColor: iconColor ? `${iconColor}22` : 'var(--status-ontrack-bg)' }}
          >
            <Icon size={compact ? 13 : 16} style={{ color: iconColor ?? 'var(--status-ontrack)' }} />
          </span>
          <p
            className={cn(
              'font-semibold text-ink-primary truncate',
              compact ? 'text-[12px]' : 'text-sm',
            )}
          >
            {title}
          </p>
        </div>
        <p className={cn('text-ink-tertiary mt-1', compact ? 'text-[10px]' : 'text-xs')}>
          {completedModules} of {totalModules} modules complete
        </p>
        <div className="mt-1.5">
          <StatusBadgePill status={resolved} />
        </div>
      </div>
      <ProgressRing progress={progress} status={resolved} size={compact ? 48 : 60} />
    </div>
  )

  if (variant === 'inline') return <div className={className}>{body}</div>

  const cardClass = cn(
    'block bg-cream rounded-[12px] border-[0.5px] border-[rgba(0,59,70,0.14)] dark:border-[rgba(255,255,255,0.1)] p-4 transition-shadow duration-200 hover:shadow-card',
    className,
  )
  if (href) {
    return (
      <Link href={href} className={cardClass}>
        {body}
      </Link>
    )
  }
  return <div className={cardClass}>{body}</div>
}
