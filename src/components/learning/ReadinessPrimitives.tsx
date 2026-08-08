'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { AlertTriangle, CheckCircle2, Circle, Clock, HelpCircle, Info } from 'lucide-react'
import {
  CHANNEL_LABEL,
  READINESS_LABEL,
  type Channel,
  type ReadinessStatus,
  type ValidatedCompetency,
} from '@/lib/role-readiness'
import type { Criticality } from '@/data/competency-policy'

/**
 * Shared readiness UI primitives — used by the Skills Passport, the Manager
 * Hub and (later) the department and executive views, so a status colour or a
 * proficiency scale never means two different things in two places.
 */

/** Kept as a string constant for the many call sites; matches ds `CARD_BASE`. */
export const CARD = 'rounded-2xl bg-parchment border border-hairline/10 shadow-card'

/** §7 proficiency scale — the labels the whole portal quotes. */
export const PROFICIENCY_LABEL = [
  'Not assessed',
  'Awareness',
  'Guided',
  'Independent',
  'Advanced',
  'Expert / Coach',
] as const

/**
 * Readiness states mapped onto the portal's semantic status ramp, so
 * "role ready" is the same green here as "completed" is everywhere else.
 * These previously used muted brand tans (sage / rose / gold), which read as
 * decorative rather than as status and were nearly indistinguishable from one
 * another at badge size.
 */
const STATUS_STYLE: Record<ReadinessStatus, { chip: string; dot: string; icon: typeof Circle }> = {
  role_ready: {
    chip: 'bg-success-bg text-success-fg border-success/25',
    dot: 'bg-success',
    icon: CheckCircle2,
  },
  developing: {
    chip: 'bg-warning-bg text-warning-fg border-warning/25',
    dot: 'bg-warning',
    icon: Clock,
  },
  not_role_ready: {
    chip: 'bg-danger-bg text-danger-fg border-danger/30 font-semibold',
    dot: 'bg-danger',
    icon: AlertTriangle,
  },
  not_assessed: {
    chip: 'bg-sem-neutral-bg text-sem-neutral-fg border-[rgb(var(--rule)/0.12)]',
    dot: 'bg-sem-neutral',
    icon: HelpCircle,
  },
  no_framework: {
    chip: 'bg-transparent text-ink-tertiary border-dashed border-[rgb(var(--rule)/0.2)]',
    dot: 'bg-transparent border border-ink-tertiary',
    icon: Circle,
  },
}

export function ReadinessBadge({
  status,
  size = 'md',
  className,
}: {
  status: ReadinessStatus
  size?: 'sm' | 'md'
  className?: string
}) {
  const s = STATUS_STYLE[status]
  const Icon = s.icon
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border whitespace-nowrap',
        size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
        s.chip,
        className,
      )}
    >
      <Icon size={size === 'sm' ? 11 : 13} className="flex-shrink-0" />
      {READINESS_LABEL[status]}
    </span>
  )
}

export function ReadinessDot({ status }: { status: ReadinessStatus }) {
  return (
    <span
      aria-hidden
      className={cn('inline-block w-2.5 h-2.5 rounded-full flex-shrink-0', STATUS_STYLE[status].dot)}
    />
  )
}

const CRITICALITY_STYLE: Record<Criticality, { label: string; cls: string; title: string }> = {
  approved: {
    label: 'Critical',
    cls: 'bg-danger-bg text-danger-fg',
    title: 'Approved critical — a gap here blocks role readiness.',
  },
  proposed: {
    label: 'Critical (proposed)',
    cls: 'bg-warning-bg text-warning-fg',
    title:
      'Sample – Requires SME Approval. Would block role readiness once the Department Head approves it.',
  },
  unset: {
    label: 'Criticality not set',
    cls: 'bg-[rgb(var(--rule)/0.06)] text-ink-tertiary',
    title: 'No approved critical / non-critical status on record yet (§7).',
  },
}

export function CriticalityChip({ criticality }: { criticality: Criticality }) {
  const c = CRITICALITY_STYLE[criticality]
  return (
    <span className={cn('text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap', c.cls)} title={c.title}>
      {c.label}
    </span>
  )
}

/**
 * Required vs validated on the 0–5 scale. The required level is marked, so a
 * bar that stops short of the marker reads as a gap without needing a legend.
 */
export function ProficiencyMeter({
  required,
  validated,
  self,
  className,
}: {
  required: number
  validated: number
  self?: number | null
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[1, 2, 3, 4, 5].map((step) => {
        const filled = validated >= step
        const isTarget = required === step
        return (
          <span
            key={step}
            className={cn(
              'h-2 w-4 rounded-sm',
              filled ? 'bg-accent-copper' : 'bg-[rgb(var(--rule)/0.1)]',
              isTarget && 'ring-2 ring-ink-primary/50 ring-offset-1 ring-offset-transparent',
            )}
            title={
              isTarget
                ? `Required: ${step} — ${PROFICIENCY_LABEL[step]}`
                : `${step} — ${PROFICIENCY_LABEL[step]}`
            }
          />
        )
      })}
      <span className="ml-1.5 text-xs text-ink-secondary whitespace-nowrap">
        {validated}/{required}
      </span>
      {self != null && self > validated && (
        <span
          className="text-[11px] text-ink-tertiary whitespace-nowrap"
          title="Learner self-rating. Shown for the coaching conversation — never counted toward validated proficiency (§7)."
        >
          · self {self}
        </span>
      )}
    </div>
  )
}

/** What is holding the number down — the channels at the ceiling. */
export function CappingReason({ row }: { row: ValidatedCompetency }) {
  if (row.gap === 0 && !row.cappedByExpiry) return null
  const parts: string[] = []
  if (row.cappedByExpiry) parts.push('Validation expired')
  for (const c of row.cappedBy) parts.push(CHANNEL_LABEL[c as Channel])
  if (parts.length === 0) return null
  return (
    <span className="text-[11px] text-ink-tertiary">
      Held at {row.validated} by: {parts.join(' · ')}
    </span>
  )
}

const PRACTICAL_STYLE: Record<ValidatedCompetency['practicalStatus'], { label: string; cls: string }> = {
  competent: { label: 'Practical: competent', cls: 'bg-success-bg text-success-fg' },
  pending: { label: 'Practical: with assessor', cls: 'bg-info-bg text-info-fg' },
  not_yet: { label: 'Practical: not yet competent', cls: 'bg-danger-bg text-danger-fg' },
  none: { label: 'Practical: not started', cls: 'bg-sem-neutral-bg text-sem-neutral-fg' },
  not_required: { label: 'No practical required', cls: 'bg-transparent text-ink-tertiary' },
}

export function PracticalChip({ row }: { row: ValidatedCompetency }) {
  const s = PRACTICAL_STYLE[row.practicalStatus]
  return (
    <span
      className={cn('text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap', s.cls)}
      title={row.practicalReason ?? undefined}
    >
      {s.label}
    </span>
  )
}

export interface KpiMeta {
  formula: string
  source: string
  owner: string
  asOf: string
}

/**
 * KPI tile with its definition one tap away — §13 requires every dashboard
 * number to disclose formula, source, owner and refresh time in place.
 */
export function KpiTile({
  label,
  value,
  sub,
  meta,
  tone = 'neutral',
  icon: Icon,
}: {
  label: string
  value: string
  sub: string
  meta: KpiMeta
  tone?: 'neutral' | 'warn' | 'bad' | 'good'
  icon: typeof Circle
}) {
  const [open, setOpen] = useState(false)
  const toneCls =
    tone === 'bad'
      ? 'text-danger-fg'
      : tone === 'warn'
        ? 'text-accent-copper'
        : tone === 'good'
          ? 'text-success-fg'
          : 'text-ink-primary'
  return (
    <div className={cn(CARD, 'p-4')}>
      <p className="flex items-start gap-2 text-xs uppercase tracking-wide text-ink-tertiary min-h-[2.25rem]">
        <Icon size={14} className="text-accent-copper flex-shrink-0 mt-0.5" /> {label}
      </p>
      <p className={cn('text-2xl font-semibold leading-none', toneCls)}>{value}</p>
      <p className="text-[11px] text-ink-tertiary mt-1">{sub}</p>
      <button
        onClick={() => setOpen(!open)}
        className="mt-2 text-[11px] text-ink-secondary hover:text-ink-primary inline-flex items-center gap-1"
      >
        <Info size={11} /> {open ? 'Hide definition' : 'How is this calculated?'}
      </button>
      {open && (
        <div className="mt-1.5 text-[11px] text-ink-tertiary space-y-0.5 border-t border-[rgb(var(--rule)/0.06)] pt-1.5">
          <p>
            <strong className="text-ink-secondary">Formula:</strong> {meta.formula}
          </p>
          <p>
            <strong className="text-ink-secondary">Source:</strong> {meta.source}
          </p>
          <p>
            <strong className="text-ink-secondary">Owner:</strong> {meta.owner}
          </p>
          <p>
            <strong className="text-ink-secondary">As of:</strong> {meta.asOf}
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Readiness mix as one stacked bar — the same five states and colours
 * everywhere a cohort is summarised.
 */
export function ReadinessMixBar({
  mix,
  className,
}: {
  mix: Record<ReadinessStatus, number> & { total: number }
  className?: string
}) {
  const order: ReadinessStatus[] = [
    'role_ready',
    'developing',
    'not_role_ready',
    'not_assessed',
    'no_framework',
  ]
  if (mix.total === 0) {
    return <div className={cn('h-2 rounded-full bg-[rgb(var(--rule)/0.06)]', className)} />
  }
  return (
    <div className={cn('flex h-2 rounded-full overflow-hidden bg-[rgb(var(--rule)/0.06)]', className)}>
      {order.map((s) => {
        const n = mix[s]
        if (n === 0) return null
        return (
          <span
            key={s}
            className={cn('h-full', STATUS_STYLE[s].dot)}
            style={{ width: `${(n / mix.total) * 100}%` }}
            title={`${READINESS_LABEL[s]}: ${n} of ${mix.total}`}
          />
        )
      })}
    </div>
  )
}

/** Demo-data notice. §24: demo data is never presented as operational data. */
export function DemoDataNotice({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-xs text-warning-fg bg-warning-bg border border-warning/25 rounded-xl px-4 py-2.5">
      <AlertTriangle size={15} className="text-accent-copper flex-shrink-0 mt-0.5" />
      <span>
        <strong>Demo workforce data.</strong> Names, roles, assessment results and observations on
        this page are placeholders so the readiness rules can be reviewed before the HRMS import
        runs. Nothing here is real employee data.
        {children}
      </span>
    </div>
  )
}
