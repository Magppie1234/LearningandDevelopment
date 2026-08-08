'use client'

import { useMemo, type ReactNode } from 'react'
import { RotateCcw, SlidersHorizontal, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Controls'

/**
 * The portal's filter bar. Every dashboard that scopes data uses this, so a
 * filter behaves the same way on the Manager Hub as on Management Analytics.
 *
 * Two things it guarantees:
 *  - Active filters are always visible as removable chips. A dashboard that
 *    silently hides half its rows behind a filter set three screens ago is the
 *    single most common way people misread a report.
 *  - The reporting context — scope and last refresh — is stated in the same
 *    place on every screen.
 */

export interface FilterOption {
  value: string
  label: string
  /** Optional count shown after the label. */
  count?: number
}

export interface FilterSpec {
  /** Stable id, used as the state key. */
  id: string
  label: string
  options: FilterOption[]
  /** The value meaning "no filter". Defaults to 'all'. */
  allValue?: string
  /** Label for the all-option. Defaults to `All ${label.toLowerCase()}`. */
  allLabel?: string
}

export type FilterValues = Record<string, string>

export function Select({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: FilterOption[]
  className?: string
}) {
  const id = `flt-${label.replace(/\W+/g, '-').toLowerCase()}`
  return (
    <div className={cn('min-w-0', className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'h-9 max-w-[220px] rounded-lg border bg-parchment px-2.5 pr-7 text-[13px] text-ink-primary',
          'focus:border-accent-copper focus:outline-none transition-colors cursor-pointer',
          '[@media(pointer:coarse)]:h-11',
          'border-hairline/15',
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
            {o.count != null ? ` (${o.count})` : ''}
          </option>
        ))}
      </select>
    </div>
  )
}

export function FilterBar({
  filters,
  values,
  onChange,
  onReset,
  scopeNote,
  lastRefreshed,
  extra,
  className,
}: {
  filters: FilterSpec[]
  values: FilterValues
  onChange: (next: FilterValues) => void
  onReset: () => void
  /** e.g. "Your reporting line — 12 people". Tells the user WHAT they're seeing. */
  scopeNote?: ReactNode
  /** Human string, e.g. "30 Jul 2026". Required context for every dashboard. */
  lastRefreshed?: string
  /** Extra controls (saved views, date range, export). */
  extra?: ReactNode
  className?: string
}) {
  const active = useMemo(
    () =>
      filters
        .map((f) => {
          const all = f.allValue ?? 'all'
          const v = values[f.id] ?? all
          if (v === all) return null
          const opt = f.options.find((o) => o.value === v)
          return { id: f.id, label: f.label, value: opt?.label ?? v, allValue: all }
        })
        .filter(Boolean) as { id: string; label: string; value: string; allValue: string }[],
    [filters, values],
  )

  return (
    <div className={cn('space-y-2.5', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal size={14} className="text-ink-tertiary flex-shrink-0" aria-hidden />
        {filters.map((f) => {
          const all = f.allValue ?? 'all'
          return (
            <Select
              key={f.id}
              label={f.label}
              value={values[f.id] ?? all}
              onChange={(v) => onChange({ ...values, [f.id]: v })}
              options={[
                { value: all, label: f.allLabel ?? `All ${f.label.toLowerCase()}` },
                ...f.options,
              ]}
            />
          )
        })}
        {extra}
        {active.length > 0 && (
          <Button size="sm" variant="ghost" icon={RotateCcw} onClick={onReset}>
            Reset filters
          </Button>
        )}
      </div>

      {(active.length > 0 || scopeNote || lastRefreshed) && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {active.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => onChange({ ...values, [a.id]: a.allValue })}
              className="inline-flex items-center gap-1.5 rounded-full border border-accent-copper/30 bg-accent-copper/10 pl-2.5 pr-1.5 py-1 text-[11px] text-ink-primary hover:bg-accent-copper/15 transition-colors"
            >
              <span className="text-ink-tertiary">{a.label}:</span>
              <span className="font-medium">{a.value}</span>
              <X size={11} aria-label={`Remove ${a.label} filter`} />
            </button>
          ))}
          {scopeNote && <span className="text-[11px] text-ink-tertiary">{scopeNote}</span>}
          {lastRefreshed && (
            <span className="text-[11px] text-ink-tertiary ml-auto whitespace-nowrap">
              Data as of {lastRefreshed}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

/** Segmented tab control — for switching a view, not for filtering data. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: { value: T; label: string; count?: number }[]
  value: T
  onChange: (v: T) => void
  label: string
  className?: string
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        'inline-flex items-center gap-0.5 p-0.5 rounded-lg bg-cream border border-hairline/10',
        className,
      )}
    >
      {options.map((o) => {
        const on = o.value === value
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={on}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              'px-3 py-1.5 rounded-[7px] text-xs font-medium transition-colors whitespace-nowrap',
              '[@media(pointer:coarse)]:py-2.5',
              on
                ? 'bg-parchment text-ink-primary shadow-xs'
                : 'text-ink-secondary hover:text-ink-primary',
            )}
          >
            {o.label}
            {o.count != null && (
              <span className={cn('ml-1.5 tnum', on ? 'text-ink-tertiary' : 'text-ink-tertiary')}>
                {o.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
