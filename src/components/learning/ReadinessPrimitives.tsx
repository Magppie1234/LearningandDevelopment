'use client'

import { cn } from '@/lib/utils'
import { AlertTriangle, CheckCircle2, Circle, Clock, HelpCircle } from 'lucide-react'
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

export const CARD = 'rounded-2xl bg-white/70 dark:bg-white/5 border border-[rgba(0,59,70,0.08)]'

/** §7 proficiency scale — the labels the whole portal quotes. */
export const PROFICIENCY_LABEL = [
  'Not assessed',
  'Awareness',
  'Guided',
  'Independent',
  'Advanced',
  'Expert / Coach',
] as const

const STATUS_STYLE: Record<ReadinessStatus, { chip: string; dot: string; icon: typeof Circle }> = {
  role_ready: {
    chip: 'bg-surface-sage/25 text-ink-primary border-surface-sage/40',
    dot: 'bg-surface-sage',
    icon: CheckCircle2,
  },
  developing: {
    chip: 'bg-accent-gold/20 text-ink-primary border-accent-gold/40',
    dot: 'bg-accent-gold',
    icon: Clock,
  },
  not_role_ready: {
    chip: 'bg-surface-rose/30 text-ink-primary border-surface-rose/50 font-semibold',
    dot: 'bg-surface-rose',
    icon: AlertTriangle,
  },
  not_assessed: {
    chip: 'bg-[rgba(0,59,70,0.06)] text-ink-secondary border-[rgba(0,59,70,0.12)]',
    dot: 'bg-ink-tertiary',
    icon: HelpCircle,
  },
  no_framework: {
    chip: 'bg-transparent text-ink-tertiary border-dashed border-[rgba(0,59,70,0.2)]',
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
    cls: 'bg-surface-rose/30 text-ink-primary',
    title: 'Approved critical — a gap here blocks role readiness.',
  },
  proposed: {
    label: 'Critical (proposed)',
    cls: 'bg-accent-gold/20 text-ink-secondary',
    title:
      'Sample – Requires SME Approval. Would block role readiness once the Department Head approves it.',
  },
  unset: {
    label: 'Criticality not set',
    cls: 'bg-[rgba(0,59,70,0.06)] text-ink-tertiary',
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
              filled ? 'bg-accent-copper' : 'bg-[rgba(0,59,70,0.1)]',
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
  competent: { label: 'Practical: competent', cls: 'bg-surface-sage/25 text-ink-primary' },
  pending: { label: 'Practical: with assessor', cls: 'bg-surface-blue/25 text-ink-primary' },
  not_yet: { label: 'Practical: not yet competent', cls: 'bg-surface-rose/25 text-ink-primary' },
  none: { label: 'Practical: not started', cls: 'bg-[rgba(0,59,70,0.06)] text-ink-secondary' },
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

/** Demo-data notice. §24: demo data is never presented as operational data. */
export function DemoDataNotice({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-xs text-ink-secondary bg-accent-gold/15 border border-accent-gold/40 rounded-xl px-4 py-2.5">
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
