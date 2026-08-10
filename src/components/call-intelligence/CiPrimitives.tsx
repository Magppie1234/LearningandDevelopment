'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  BadgeCheck,
  ChevronRight,
  Cpu,
  Database,
  Info,
  Layers,
  Quote,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CARD_BASE, DeltaPill, StatusBadge, type Tone } from '@/components/ds'
import {
  formatMetric,
  type Metric,
  type MetricProvenance,
} from '@/lib/call-intelligence/metrics'
import type { Evidence, Provenance } from '@/lib/call-intelligence/types'
import { sampleConfidence } from '@/data/call-intelligence/taxonomy'

/**
 * Call Intelligence UI primitives.
 *
 * These exist on top of the portal design system rather than beside it: a KPI
 * here is a `ds/Kpi` plus the four things the brief makes non-negotiable and a
 * generic tile has no concept of —
 *
 *   1. a denominator on every percentage (§15),
 *   2. a provenance badge, so an AI guess never wears the same clothes as a
 *      CRM fact (§13),
 *   3. the comparison period stated, not implied (§15),
 *   4. a route back to the transcript turn the number came from (§13).
 *
 * Anything that cannot satisfy those renders as "not measurable" instead of a
 * number — see `NotMeasurable`. A zero that means "we couldn't tell" is the
 * single most expensive lie a dashboard can tell.
 */

/* ── Provenance ───────────────────────────────────────────────────────────── */

const PROVENANCE_META: Record<
  MetricProvenance | Provenance,
  { label: string; tone: Tone; icon: typeof Cpu; title: string }
> = {
  crm_verified: {
    label: 'CRM-verified',
    tone: 'success',
    icon: BadgeCheck,
    title: 'Confirmed in the CRM / order system. A fact, not an inference.',
  },
  ai_inferred: {
    label: 'AI-inferred',
    tone: 'warning',
    icon: Cpu,
    title:
      'Extracted from the transcript by a model. Not verified by any system of record — treat as a signal, not a fact.',
  },
  human_corrected: {
    label: 'Human-corrected',
    tone: 'info',
    icon: BadgeCheck,
    title: 'A manager reviewed and corrected the AI output on this record.',
  },
  not_available: {
    label: 'Not available',
    tone: 'neutral',
    icon: Database,
    title: 'No upstream system supplies this yet.',
  },
  system: {
    label: 'System',
    tone: 'neutral',
    icon: Database,
    title: 'Counted directly from telephony / transcription logs.',
  },
  mixed: {
    label: 'Mixed sources',
    tone: 'info',
    icon: Layers,
    title: 'Combines system counts with AI-extracted fields. Read the formula before quoting it.',
  },
}

/**
 * The badge that keeps §13 honest. AI-inferred is deliberately amber and
 * CRM-verified deliberately green: the two must never be scannable as the same
 * class of number.
 */
export function ProvenanceBadge({
  provenance,
  size = 'sm',
  className,
}: {
  provenance: MetricProvenance | Provenance
  size?: 'sm' | 'md'
  className?: string
}) {
  const p = PROVENANCE_META[provenance]
  return (
    <StatusBadge
      tone={p.tone}
      icon={p.icon}
      label={p.label}
      size={size}
      title={p.title}
      className={className}
    />
  )
}

/* ── Confidence & sample size ─────────────────────────────────────────────── */

/** Extraction confidence, 0–1. Below 0.7 the record is out of the aggregates. */
export function ConfidenceChip({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  const percent = Math.round(value * 100)
  const tone: Tone = value >= 0.85 ? 'success' : value >= 0.7 ? 'warning' : 'danger'
  return (
    <span
      title={`Extraction confidence ${percent}%. Below 70% the call is excluded from management aggregates.`}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium tnum whitespace-nowrap',
        tone === 'success' && 'bg-success-bg text-success-fg border-success/25',
        tone === 'warning' && 'bg-warning-bg text-warning-fg border-warning/25',
        tone === 'danger' && 'bg-danger-bg text-danger-fg border-danger/30',
        className,
      )}
    >
      {percent}% confidence
    </span>
  )
}

/**
 * Sample-size qualifier. Printed next to every rate computed on a segment, so
 * a 100% built on four calls can never be read as a trend (§5).
 */
export function SampleSizeNote({
  n,
  noun = 'calls',
  className,
}: {
  n: number
  noun?: string
  className?: string
}) {
  const s = sampleConfidence(n)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[11px] whitespace-nowrap',
        s.level === 'low' ? 'text-danger-fg' : 'text-ink-tertiary',
        className,
      )}
      title={
        s.level === 'low'
          ? `Only ${n} ${noun} in this group — below the 20-call minimum, so this rate is not a trend.`
          : `${n} ${noun} in this group — ${s.label.toLowerCase()}.`
      }
    >
      n={n} · {s.label}
    </span>
  )
}

/** Numerator ÷ denominator, spelled out. Rule 1 of the brief, as a component. */
export function DenominatorNote({
  numerator,
  denominator,
  noun = 'calls',
  className,
}: {
  numerator: number | null
  denominator: number | null
  noun?: string
  className?: string
}) {
  if (numerator === null || denominator === null) return null
  return (
    <span className={cn('text-[11px] text-ink-tertiary tnum whitespace-nowrap', className)}>
      {numerator.toLocaleString('en-IN')} of {denominator.toLocaleString('en-IN')} {noun}
    </span>
  )
}

/* ── Honest absences ──────────────────────────────────────────────────────── */

/**
 * What a metric renders when the inputs are not trustworthy — unreliable
 * diarisation, no approved KB article, no CRM link. Never a 0, never a dash
 * without a reason (§8, §13).
 */
export function NotMeasurable({
  reason,
  compact = false,
  className,
}: {
  reason: string
  compact?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-start gap-1.5 rounded-lg border border-dashed border-hairline/25 text-ink-tertiary',
        compact ? 'px-2 py-1 text-[11px]' : 'px-3 py-2 text-xs',
        className,
      )}
    >
      <AlertTriangle size={compact ? 11 : 13} className="flex-shrink-0 mt-0.5" aria-hidden />
      <span>
        <span className="font-medium">Not measurable</span> — {reason}
      </span>
    </span>
  )
}

/** A field the customer never raised. Never an average, never a zero (§13). */
export function NotMentioned({ className }: { className?: string }) {
  return (
    <span
      className={cn('text-ink-tertiary italic text-[13px]', className)}
      title="The customer did not raise this on the call. Nothing has been assumed in its place."
    >
      Not mentioned
    </span>
  )
}

/* ── Evidence ─────────────────────────────────────────────────────────────── */

export function formatTimestamp(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.round(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * The link every AI insight is required to carry (§13). It resolves to the call
 * detail page, scrolled to the exact transcript turn and seeked to the audio
 * timestamp the extractor used.
 */
export function EvidenceLink({
  callId,
  evidence,
  showQuote = true,
  className,
}: {
  callId: string
  evidence: Evidence | null
  showQuote?: boolean
  className?: string
}) {
  if (!evidence) {
    return (
      <span className={cn('text-[11px] text-ink-tertiary', className)}>
        No transcript evidence recorded
      </span>
    )
  }
  return (
    <Link
      href={`/call-intelligence/explorer/${callId}?turn=${evidence.turnIndex}&t=${Math.round(evidence.timestampSec)}`}
      className={cn(
        'group inline-flex items-start gap-1.5 text-[11px] text-ink-secondary hover:text-ink-primary transition-colors',
        className,
      )}
      title={`Open call ${callId} at ${formatTimestamp(evidence.timestampSec)}, turn ${evidence.turnIndex}`}
    >
      <Quote size={11} className="flex-shrink-0 mt-0.5 text-accent-copper" aria-hidden />
      <span className="min-w-0">
        {showQuote && <span className="italic">“{evidence.quote}”</span>}
        <span className="ml-1 whitespace-nowrap text-accent-copper group-hover:underline tnum">
          {formatTimestamp(evidence.timestampSec)}
        </span>
      </span>
    </Link>
  )
}

/* ── Methodology disclosure ───────────────────────────────────────────────── */

/**
 * The "How is this calculated?" disclosure, matching the pattern the portal
 * already uses on `ReadinessPrimitives.KpiTile`. Formula, source and owner come
 * straight off the `Metric` envelope, so the page cannot describe the maths
 * differently from the way the maths was done.
 */
export function MethodDisclosure({
  formula,
  source,
  owner,
  asOf,
  extra,
  className,
}: {
  formula: string
  source: string
  owner: string
  asOf?: string
  extra?: ReactNode
  className?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className={cn('mt-3 pt-2.5 border-t border-hairline/8', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex items-center gap-1 text-[11px] text-ink-secondary hover:text-ink-primary transition-colors"
      >
        <Info size={11} aria-hidden />
        {open ? 'Hide definition' : 'How is this calculated?'}
      </button>
      {open && (
        <dl className="mt-2 space-y-1 text-[11px] text-ink-tertiary">
          <div>
            <dt className="inline font-medium text-ink-secondary">Formula: </dt>
            <dd className="inline">{formula}</dd>
          </div>
          <div>
            <dt className="inline font-medium text-ink-secondary">Source: </dt>
            <dd className="inline">{source}</dd>
          </div>
          <div>
            <dt className="inline font-medium text-ink-secondary">Owner: </dt>
            <dd className="inline">{owner}</dd>
          </div>
          {asOf && (
            <div>
              <dt className="inline font-medium text-ink-secondary">As of: </dt>
              <dd className="inline">{asOf}</dd>
            </div>
          )}
          {extra}
        </dl>
      )}
    </div>
  )
}

/* ── The KPI card ─────────────────────────────────────────────────────────── */

const TONE_VALUE: Record<Metric['tone'], string> = {
  good: 'text-success-fg',
  warn: 'text-warning-fg',
  bad: 'text-danger-fg',
  neutral: 'text-ink-primary',
}

/**
 * Renders one `Metric` from the metrics layer.
 *
 * Delta is computed in the unit that is honest for the metric: percentage
 * *points* for a percentage (a move from 20% to 30% is +10pp, not +50%), and
 * relative percent for counts and scores.
 */
export function MetricCard({
  metric,
  comparisonLabel,
  asOf,
  href,
  noun = 'calls',
  className,
}: {
  metric: Metric
  /** The comparison window, always stated — never implied (§15). */
  comparisonLabel: string
  asOf?: string
  href?: string
  noun?: string
  className?: string
}) {
  const isPercent = metric.unit === 'percent'
  const delta =
    metric.prev === null
      ? null
      : isPercent
        ? Math.round((metric.value - metric.prev) * 10) / 10
        : metric.prev === 0
          ? null
          : Math.round(((metric.value - metric.prev) / Math.abs(metric.prev)) * 1000) / 10

  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-ink-tertiary leading-snug">
          {metric.label}
        </p>
        <ProvenanceBadge provenance={metric.provenance} />
      </div>

      <p className={cn('mt-2 text-[26px] font-semibold leading-none tnum', TONE_VALUE[metric.tone])}>
        {formatMetric(metric)}
      </p>

      <div className="mt-1.5 min-h-[1rem]">
        <DenominatorNote
          numerator={metric.numerator}
          denominator={metric.denominator}
          noun={noun}
        />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <DeltaPill
          delta={delta}
          unit={isPercent ? 'pp' : '%'}
          goodDirection={metric.higherIsBetter === false ? 'down' : 'up'}
          periodLabel={comparisonLabel}
        />
      </div>

      {metric.note && (
        <p className="mt-2 text-[11px] leading-snug text-ink-tertiary">{metric.note}</p>
      )}
    </>
  )

  return (
    <div className={cn(CARD_BASE, 'p-4 flex flex-col', href && 'transition-shadow hover:shadow-raised', className)}>
      {href ? (
        <Link href={href} className="flex-1 group">
          {body}
          <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-accent-copper">
            View calls
            <ChevronRight size={12} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      ) : (
        <div className="flex-1">{body}</div>
      )}
      <MethodDisclosure
        formula={metric.formula}
        source={metric.source}
        owner={metric.owner}
        asOf={asOf}
      />
    </div>
  )
}

/** Responsive grid for MetricCards. */
export function MetricGrid({
  children,
  columns = 4,
  className,
}: {
  children: ReactNode
  columns?: 3 | 4 | 5
  className?: string
}) {
  return (
    <div
      className={cn(
        'grid gap-3 grid-cols-1 sm:grid-cols-2',
        columns === 3 && 'lg:grid-cols-3',
        columns === 4 && 'lg:grid-cols-4',
        columns === 5 && 'lg:grid-cols-3 xl:grid-cols-5',
        className,
      )}
    >
      {children}
    </div>
  )
}

/* ── Standing caveats ─────────────────────────────────────────────────────── */

/**
 * §3 forbids presenting transcript sentiment as tone or emotion detection.
 * Every page that shows a sentiment number carries this line.
 */
export function TextSentimentCaveat({ className }: { className?: string }) {
  return (
    <p className={cn('text-[11px] text-ink-tertiary leading-snug', className)}>
      Sentiment is <strong className="font-medium text-ink-secondary">text-based</strong> — derived
      from transcript wording only. No voice-tone or acoustic emotion analysis is performed, and
      none is implied.
    </p>
  )
}

/** Labels a block of model-written prose as model-written. */
export function AiGeneratedNote({
  what = 'summary',
  className,
}: {
  what?: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[11px] text-ink-tertiary whitespace-nowrap',
        className,
      )}
      title="Generated by a language model from the transcript. Not written or checked by a person unless marked as corrected."
    >
      <Cpu size={11} aria-hidden className="text-accent-copper" />
      AI-generated {what}
    </span>
  )
}
