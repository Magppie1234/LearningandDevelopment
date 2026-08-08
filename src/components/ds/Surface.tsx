'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { ChevronRight, Info, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DeltaPill, StatusBadge, type Tone } from './Status'

/**
 * Card, section and KPI surfaces. Everything that draws a boundary in the
 * portal comes from here, so radius, border, padding and elevation are decided
 * once rather than re-improvised per page.
 */

export const CARD_BASE =
  'rounded-2xl bg-parchment border border-hairline/10 shadow-card'

export function Card({
  children,
  className,
  padded = true,
}: {
  children: ReactNode
  className?: string
  padded?: boolean
}) {
  return <div className={cn(CARD_BASE, padded && 'p-5', className)}>{children}</div>
}

/**
 * A titled section of a page. `action` is the section-level control (View all,
 * Export); `meta` is the reporting context — period, units, last refresh —
 * which every chart and table is required to state.
 */
export function Section({
  title,
  description,
  meta,
  action,
  children,
  className,
  bodyClassName,
  padded = true,
}: {
  title: ReactNode
  description?: ReactNode
  meta?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
  padded?: boolean
}) {
  return (
    <section className={cn(CARD_BASE, 'overflow-hidden', className)}>
      <header className="flex flex-wrap items-start justify-between gap-3 px-5 pt-4 pb-3 border-b border-hairline/8">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-ink-primary leading-tight">{title}</h2>
          {description && (
            <p className="text-xs text-ink-secondary mt-1 max-w-2xl">{description}</p>
          )}
          {meta && <p className="text-[11px] text-ink-tertiary mt-1">{meta}</p>}
        </div>
        {action && <div className="flex items-center gap-2 flex-shrink-0">{action}</div>}
      </header>
      <div className={cn(padded && 'p-5', bodyClassName)}>{children}</div>
    </section>
  )
}

/**
 * Page header — the single place a page states what it is. The portal shell
 * shows the route title and breadcrumb, so this carries the *subject line*:
 * what question the page answers, plus page-level actions and filters.
 */
export function PageHeader({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: string
  description?: ReactNode
  actions?: ReactNode
  /** Filter bar or tabs, rendered under the title. */
  children?: ReactNode
  className?: string
}) {
  return (
    <header className={cn('space-y-4', className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-serif text-[26px] sm:text-[30px] leading-tight font-semibold text-ink-primary">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-ink-secondary mt-1.5 max-w-3xl">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </header>
  )
}

export interface MetricDefinition {
  /** How the number is computed, in words a HOD can check. */
  formula: string
  /** Which field / table / system it comes from. */
  source: string
  /** Who owns the definition. */
  owner?: string
}

/**
 * KPI tile — the atom of every dashboard.
 *
 * The brief requires each major KPI to carry value, target, prior-period
 * comparison, direction, status, a short explanation and a drill-down. Those
 * are all optional props rather than a rigid shape, because inventing a target
 * where the business has not set one would be worse than omitting it.
 */
export function Kpi({
  label,
  value,
  unit,
  caption,
  target,
  delta,
  deltaUnit = 'pp',
  goodDirection = 'up',
  periodLabel,
  tone,
  statusLabel,
  icon: Icon,
  definition,
  href,
  onClick,
  className,
}: {
  label: string
  /** Pre-formatted. Use '—' for "not measurable", never 0. */
  value: string
  unit?: string
  /** One short line explaining what the number counts. */
  caption?: string
  target?: string
  delta?: number | null
  deltaUnit?: string
  goodDirection?: 'up' | 'down'
  periodLabel?: string
  tone?: Tone
  statusLabel?: string
  icon?: LucideIcon
  definition?: MetricDefinition
  /** Drill-down destination. */
  href?: string
  onClick?: () => void
  className?: string
}) {
  const [openDef, setOpenDef] = useState(false)

  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-ink-tertiary leading-snug">
          {label}
        </p>
        {Icon && <Icon size={15} className="text-ink-tertiary flex-shrink-0" aria-hidden />}
      </div>

      <p className="mt-2 flex items-baseline gap-1">
        <span className="text-[28px] font-semibold leading-none text-ink-primary tnum">{value}</span>
        {unit && <span className="text-sm text-ink-tertiary">{unit}</span>}
      </p>

      {caption && <p className="text-[11px] text-ink-tertiary mt-1.5 leading-snug">{caption}</p>}

      {(target || delta !== undefined || statusLabel) && (
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {statusLabel && tone && <StatusBadge tone={tone} label={statusLabel} size="sm" />}
          {target && (
            <span className="text-[11px] text-ink-tertiary tnum whitespace-nowrap">
              Target {target}
            </span>
          )}
          {delta !== undefined && (
            <DeltaPill
              delta={delta}
              unit={deltaUnit}
              goodDirection={goodDirection}
              periodLabel={periodLabel}
            />
          )}
        </div>
      )}
    </>
  )

  const interactive = Boolean(href || onClick)

  return (
    <div
      className={cn(
        CARD_BASE,
        'p-4 flex flex-col',
        interactive && 'transition-shadow hover:shadow-raised',
        className,
      )}
    >
      {href ? (
        <Link href={href} className="flex-1 group">
          {body}
          <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-accent-copper">
            View detail
            <ChevronRight size={12} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      ) : onClick ? (
        <button type="button" onClick={onClick} className="flex-1 text-left group">
          {body}
          <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-accent-copper">
            View detail
            <ChevronRight size={12} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </button>
      ) : (
        <div className="flex-1">{body}</div>
      )}

      {definition && (
        <div className="mt-3 pt-2.5 border-t border-hairline/8">
          <button
            type="button"
            onClick={() => setOpenDef((o) => !o)}
            aria-expanded={openDef}
            className="inline-flex items-center gap-1 text-[11px] text-ink-secondary hover:text-ink-primary transition-colors"
          >
            <Info size={11} aria-hidden />
            {openDef ? 'Hide definition' : 'How is this calculated?'}
          </button>
          {openDef && (
            <dl className="mt-2 space-y-1 text-[11px] text-ink-tertiary">
              <div>
                <dt className="inline font-medium text-ink-secondary">Formula: </dt>
                <dd className="inline">{definition.formula}</dd>
              </div>
              <div>
                <dt className="inline font-medium text-ink-secondary">Source: </dt>
                <dd className="inline">{definition.source}</dd>
              </div>
              {definition.owner && (
                <div>
                  <dt className="inline font-medium text-ink-secondary">Owner: </dt>
                  <dd className="inline">{definition.owner}</dd>
                </div>
              )}
            </dl>
          )}
        </div>
      )}
    </div>
  )
}

/** Responsive KPI row. Caps at 5 across so tiles never shrink below legible. */
export function KpiGrid({
  children,
  className,
  columns = 4,
}: {
  children: ReactNode
  className?: string
  columns?: 3 | 4 | 5
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
