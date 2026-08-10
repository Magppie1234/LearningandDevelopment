'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Bookmark,
  Check,
  ChevronDown,
  Database,
  Download,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button, CARD_BASE, StatusBadge } from '@/components/ds'
import { useCi } from './CiContext'
import {
  activeFilterCount,
  LIST_FILTER_KEYS,
  periodDays,
  setPeriodDays,
} from '@/lib/call-intelligence/filters'
import { downloadCsv, toCsv } from '@/lib/call-intelligence/service'
import { ROLES } from '@/lib/call-intelligence/rbac'
import type { CallFilters } from '@/lib/call-intelligence/types'
import {
  CALL_OUTCOMES,
  CALL_PURPOSES,
  CAMPAIGNS,
  COMPLIANCE_FLAGS,
  CRM_STAGES,
  CUSTOMER_SEGMENTS,
  EMPLOYEES,
  FAQ_CATEGORIES,
  GEOS,
  LANGUAGES,
  LEAD_SOURCES,
  OBJECTIONS,
  PRODUCT_SERIES,
  REGIONS,
  TEAMS,
} from '@/data/call-intelligence/taxonomy'

/**
 * The persistent filter bar (§12).
 *
 * It is the same object on all ten pages and it writes straight through to the
 * URL, so "show me the North region's unanswered pricing questions" is a link
 * rather than a sequence of clicks someone has to repeat.
 *
 * Two things it refuses to do quietly:
 *  - hide that a filter is on (every active value is a removable chip), and
 *  - change the confidence gate without saying so — switching to "include
 *    low-confidence" moves every denominator on screen, so it is a labelled,
 *    visible state, not a preference buried in a menu.
 */

type ListKey = (typeof LIST_FILTER_KEYS)[number]

interface Group {
  key: ListKey
  label: string
  options: { value: string; label: string }[]
  /** Shown in the compact row rather than behind "More filters". */
  primary?: boolean
}

const asOptions = (values: readonly string[]) => values.map((v) => ({ value: v, label: v }))

function buildGroups(): Group[] {
  const states = Array.from(new Set(GEOS.map((g) => g.state)))
  const cities = GEOS.map((g) => g.city)
  return [
    { key: 'region', label: 'Region', options: asOptions(REGIONS), primary: true },
    {
      key: 'teamId',
      label: 'Team',
      options: TEAMS.map((t) => ({ value: t.id, label: t.name })),
      primary: true,
    },
    {
      key: 'employeeId',
      label: 'Employee',
      options: EMPLOYEES.map((e) => ({ value: e.id, label: e.name })),
      primary: true,
    },
    {
      key: 'productSeriesId',
      label: 'Product series',
      options: PRODUCT_SERIES.map((p) => ({ value: p.id, label: p.name })),
      primary: true,
    },
    {
      key: 'sentiment',
      label: 'Sentiment',
      options: asOptions(['positive', 'neutral', 'negative']),
      primary: true,
    },
    {
      key: 'readiness',
      label: 'Readiness',
      options: asOptions(['high', 'medium', 'low']),
      primary: true,
    },
    { key: 'direction', label: 'Direction', options: asOptions(['inbound', 'outbound']) },
    { key: 'callPurpose', label: 'Call purpose', options: asOptions(CALL_PURPOSES) },
    { key: 'callOutcome', label: 'Call outcome', options: asOptions(CALL_OUTCOMES) },
    { key: 'campaign', label: 'Campaign', options: asOptions(CAMPAIGNS) },
    { key: 'leadSource', label: 'Lead source', options: asOptions(LEAD_SOURCES) },
    { key: 'crmStage', label: 'CRM stage', options: asOptions(CRM_STAGES) },
    { key: 'customerSegment', label: 'Customer segment', options: asOptions(CUSTOMER_SEGMENTS) },
    { key: 'language', label: 'Language', options: asOptions(LANGUAGES) },
    { key: 'state', label: 'State', options: asOptions(states) },
    { key: 'city', label: 'City', options: asOptions(cities) },
    {
      key: 'faqId',
      label: 'Question asked',
      options: FAQ_CATEGORIES.map((f) => ({ value: f.id, label: f.shortLabel })),
    },
    {
      key: 'objectionId',
      label: 'Objection raised',
      options: OBJECTIONS.map((o) => ({ value: o.id, label: o.label })),
    },
    {
      key: 'complianceFlag',
      label: 'Compliance flag',
      options: COMPLIANCE_FLAGS.map((c) => ({ value: c.id, label: c.label })),
    },
  ]
}

const GROUPS = buildGroups()
const GROUP_BY_KEY = Object.fromEntries(GROUPS.map((g) => [g.key, g])) as Record<ListKey, Group>

/* ── Multi-select ─────────────────────────────────────────────────────────── */

function MultiSelect({
  group,
  selected,
  onChange,
}: {
  group: Group
  selected: string[]
  onChange: (next: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const label =
    selected.length === 0
      ? group.label
      : selected.length === 1
        ? (group.options.find((o) => o.value === selected[0])?.label ?? selected[0])
        : `${group.label} · ${selected.length}`

  function toggle(value: string) {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value])
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1.5 h-9 px-2.5 rounded-lg border text-[13px] transition-colors whitespace-nowrap',
            '[@media(pointer:coarse)]:h-11',
            selected.length
              ? 'border-accent-copper/40 bg-accent-copper/10 text-ink-primary font-medium'
              : 'border-hairline/15 bg-parchment text-ink-secondary hover:text-ink-primary',
          )}
        >
          {label}
          <ChevronDown size={13} aria-hidden className="flex-shrink-0 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0 bg-parchment border-hairline/15">
        <div className="max-h-72 overflow-y-auto py-1">
          {group.options.map((o) => {
            const on = selected.includes(o.value)
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => toggle(o.value)}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[13px] text-ink-primary hover:bg-[rgb(var(--rule)/0.05)] transition-colors"
              >
                <span
                  className={cn(
                    'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0',
                    on ? 'bg-accent-copper border-accent-copper' : 'border-hairline/25',
                  )}
                  aria-hidden
                >
                  {on && <Check size={11} className="text-white" />}
                </span>
                <span className="min-w-0 truncate">{o.label}</span>
              </button>
            )
          })}
        </div>
        {selected.length > 0 && (
          <div className="border-t border-hairline/10 p-1.5">
            <Button size="sm" variant="ghost" icon={X} onClick={() => onChange([])}>
              Clear {group.label.toLowerCase()}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

/* ── The bar ──────────────────────────────────────────────────────────────── */

export function CiFilterBar() {
  const {
    filters,
    patchFilters,
    setFilters,
    resetFilters,
    periodLabel,
    comparisonLabel,
    data,
    viewer,
    setViewerRole,
  } = useCi()

  const [showMore, setShowMore] = useState(false)
  const [search, setSearch] = useState(filters.search)
  const activeCount = activeFilterCount(filters)
  const days = periodDays(filters)

  // Debounced search: every keystroke is a URL write, and a URL write is a
  // navigation. 350ms keeps typing smooth without losing the shareable link.
  useEffect(() => setSearch(filters.search), [filters.search])
  useEffect(() => {
    if (search === filters.search) return
    const t = setTimeout(() => patchFilters({ search }), 350)
    return () => clearTimeout(t)
  }, [search, filters.search, patchFilters])

  const chips = useMemo(() => {
    const out: { key: ListKey; value: string; label: string }[] = []
    for (const key of LIST_FILTER_KEYS) {
      const group = GROUP_BY_KEY[key]
      for (const value of filters[key] as string[]) {
        const label = group?.options.find((o) => o.value === value)?.label ?? value
        out.push({ key, value, label: `${group?.label ?? key}: ${label}` })
      }
    }
    return out
  }, [filters])

  function removeChip(key: ListKey, value: string) {
    patchFilters({ [key]: (filters[key] as string[]).filter((v) => v !== value) } as Partial<CallFilters>)
  }

  function exportCalls() {
    if (!data) return
    const csv = toCsv(
      data.calls.map((c) => ({
        callId: c.callId,
        startedAt: c.startedAt,
        customer: c.customerName,
        employee: c.employeeId,
        team: c.teamId,
        region: c.region,
        city: c.city,
        language: c.language,
        durationSec: c.durationSec,
        outcome: c.callOutcome,
        crmStage: c.crmStage,
        extractionConfidence: c.extractionConfidence,
      })),
      [
        { key: 'callId', header: 'Call ID' },
        { key: 'startedAt', header: 'Started at' },
        { key: 'customer', header: 'Customer' },
        { key: 'employee', header: 'Employee' },
        { key: 'team', header: 'Team' },
        { key: 'region', header: 'Region' },
        { key: 'city', header: 'City' },
        { key: 'language', header: 'Language' },
        { key: 'durationSec', header: 'Duration (s)' },
        { key: 'outcome', header: 'Outcome' },
        { key: 'crmStage', header: 'CRM stage' },
        { key: 'extractionConfidence', header: 'Extraction confidence' },
      ],
    )
    downloadCsv(`sunroof-calls-${filters.from}-to-${filters.to}.csv`, csv)
  }

  const primary = GROUPS.filter((g) => g.primary)
  const secondary = GROUPS.filter((g) => !g.primary)

  return (
    <div className={cn(CARD_BASE, 'p-3 sm:p-4 space-y-3')}>
      {/* Period + comparison. The baseline is stated, never inferred (§15). */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] uppercase tracking-wide text-ink-tertiary font-medium mr-1">
          Period
        </span>
        <div className="inline-flex rounded-lg border border-hairline/15 overflow-hidden">
          {[7, 28, 90].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setFilters(setPeriodDays(filters, d))}
              className={cn(
                'px-2.5 h-9 text-[13px] transition-colors [@media(pointer:coarse)]:h-11',
                days === d
                  ? 'bg-accent-copper text-white font-medium'
                  : 'bg-parchment text-ink-secondary hover:text-ink-primary',
              )}
            >
              {d}d
            </button>
          ))}
        </div>
        <input
          type="date"
          aria-label="Period start"
          value={filters.from}
          onChange={(e) => patchFilters({ from: e.target.value })}
          className="h-9 rounded-lg border border-hairline/15 bg-parchment px-2 text-[13px] text-ink-primary focus:border-accent-copper focus:outline-none [@media(pointer:coarse)]:h-11"
        />
        <span className="text-ink-tertiary text-xs">→</span>
        <input
          type="date"
          aria-label="Period end"
          value={filters.to}
          onChange={(e) => patchFilters({ to: e.target.value })}
          className="h-9 rounded-lg border border-hairline/15 bg-parchment px-2 text-[13px] text-ink-primary focus:border-accent-copper focus:outline-none [@media(pointer:coarse)]:h-11"
        />
        <span className="text-[11px] text-ink-tertiary">
          vs <span className="tnum">{comparisonLabel}</span>
        </span>

        <div className="ml-auto flex items-center gap-2">
          <label className="sr-only" htmlFor="ci-role">
            View as role
          </label>
          <select
            id="ci-role"
            value={viewer.roleId}
            onChange={(e) => setViewerRole(e.target.value as typeof viewer.roleId)}
            title="Row-level scoping and PII masking are applied for the selected role (§13)."
            className="h-9 rounded-lg border border-hairline/15 bg-parchment px-2 pr-7 text-[13px] text-ink-primary focus:border-accent-copper focus:outline-none cursor-pointer [@media(pointer:coarse)]:h-11"
          >
            {ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                View as: {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dimensions. */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[180px] max-w-xs flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary pointer-events-none"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transcripts, customers, call IDs…"
            aria-label="Search transcripts, customers and call IDs"
            className="w-full h-9 pl-8 pr-3 rounded-lg border border-hairline/15 bg-parchment text-[13px] text-ink-primary placeholder:text-ink-tertiary focus:border-accent-copper focus:outline-none [@media(pointer:coarse)]:h-11"
          />
        </div>

        {primary.map((g) => (
          <MultiSelect
            key={g.key}
            group={g}
            selected={filters[g.key] as string[]}
            onChange={(next) => patchFilters({ [g.key]: next } as Partial<CallFilters>)}
          />
        ))}

        <Button
          size="sm"
          variant={showMore ? 'primary' : 'secondary'}
          icon={SlidersHorizontal}
          onClick={() => setShowMore((s) => !s)}
        >
          {showMore ? 'Fewer filters' : `More filters (${secondary.length})`}
        </Button>
      </div>

      {showMore && (
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-hairline/8">
          {secondary.map((g) => (
            <MultiSelect
              key={g.key}
              group={g}
              selected={filters[g.key] as string[]}
              onChange={(next) => patchFilters({ [g.key]: next } as Partial<CallFilters>)}
            />
          ))}
        </div>
      )}

      {/* Confidence gate — a labelled state change, because it moves every
          denominator on the page (§13). */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-hairline/8">
        <button
          type="button"
          onClick={() =>
            patchFilters({
              confidenceMode: filters.confidenceMode === 'all' ? 'analysable_only' : 'all',
            })
          }
          className={cn(
            'inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-[12px] transition-colors',
            filters.confidenceMode === 'all'
              ? 'border-warning/30 bg-warning-bg text-warning-fg font-medium'
              : 'border-hairline/15 bg-parchment text-ink-secondary hover:text-ink-primary',
          )}
          title="Calls below 70% transcription or extraction confidence are excluded from management aggregates by default (§13)."
        >
          <ShieldCheck size={13} aria-hidden />
          {filters.confidenceMode === 'all'
            ? 'Including low-confidence transcripts — denominators differ'
            : 'Analysable calls only (confidence ≥ 70%)'}
        </button>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <SavedViewsMenu />
          <Button size="sm" variant="ghost" icon={Download} onClick={exportCalls} disabled={!data}>
            Export calls
          </Button>
          {activeCount > 0 && (
            <Button size="sm" variant="ghost" icon={RotateCcw} onClick={resetFilters}>
              Reset ({activeCount})
            </Button>
          )}
        </div>
      </div>

      {chips.length > 0 && (
        <ul className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-hairline/8">
          {chips.map((c) => (
            <li key={`${c.key}:${c.value}`}>
              <button
                type="button"
                onClick={() => removeChip(c.key, c.value)}
                className="inline-flex items-center gap-1 rounded-full border border-accent-copper/30 bg-accent-copper/10 px-2 py-0.5 text-[11px] text-ink-primary hover:border-accent-copper/60 transition-colors"
              >
                {c.label}
                <X size={11} aria-hidden />
                <span className="sr-only">Remove filter</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="text-[11px] text-ink-tertiary">
        Showing <span className="tnum">{periodLabel}</span>
        {data && (
          <>
            {' '}· <span className="tnum">{data.calls.length}</span> analysable of{' '}
            <span className="tnum">{data.allCalls.length}</span> calls in window
          </>
        )}
      </p>
    </div>
  )
}

function SavedViewsMenu() {
  const { savedViews, saveView, applyView, deleteView } = useCi()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-hairline/15 bg-parchment text-[12px] text-ink-secondary hover:text-ink-primary transition-colors"
        >
          <Bookmark size={13} aria-hidden />
          Saved views{savedViews.length > 0 ? ` (${savedViews.length})` : ''}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-3 bg-parchment border-hairline/15 space-y-2">
        <p className="text-[11px] text-ink-tertiary">
          Saves the current filter set to this browser. Not shared with your team.
        </p>
        <form
          className="flex gap-1.5"
          onSubmit={(e) => {
            e.preventDefault()
            if (!name.trim()) return
            saveView(name.trim())
            setName('')
          }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name this view"
            aria-label="Name this view"
            className="flex-1 h-8 px-2 rounded-lg border border-hairline/15 bg-background text-[13px] text-ink-primary placeholder:text-ink-tertiary focus:border-accent-copper focus:outline-none"
          />
          <Button size="sm" type="submit" variant="primary">
            Save
          </Button>
        </form>
        {savedViews.length === 0 ? (
          <p className="text-[11px] text-ink-tertiary">No saved views yet.</p>
        ) : (
          <ul className="space-y-1 max-h-52 overflow-y-auto">
            {savedViews.map((v) => (
              <li key={v.id} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    applyView(v)
                    setOpen(false)
                  }}
                  className="flex-1 text-left text-[13px] text-ink-primary hover:text-accent-copper truncate px-1.5 py-1 rounded hover:bg-[rgb(var(--rule)/0.04)]"
                >
                  {v.name}
                </button>
                <button
                  type="button"
                  onClick={() => deleteView(v.id)}
                  aria-label={`Delete view ${v.name}`}
                  className="w-7 h-7 rounded flex items-center justify-center text-ink-tertiary hover:text-danger-fg"
                >
                  <Trash2 size={13} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  )
}

/**
 * Governance strip (§16). States what the numbers are, where they came from,
 * when they were last refreshed and — loudly — that this is a demo corpus.
 */
export function GovernanceStrip() {
  const { data, loading, viewer } = useCi()
  if (!data) return null
  const excluded = data.allCalls.length - data.calls.length
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-warning/25 bg-warning-bg px-4 py-2.5 text-[11px] text-warning-fg">
      <StatusBadge
        tone="warning"
        icon={Database}
        size="sm"
        label={data.isLive ? 'Live data' : 'Demo corpus'}
      />
      <span>
        <strong className="font-semibold">{data.sourceLabel}.</strong> No real customer calls, names
        or recordings appear anywhere in this section.
      </span>
      <span className="tnum">
        Last refreshed {new Date(data.lastRefreshedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
      </span>
      <span>
        Scoped as <strong className="font-semibold">{viewer.name}</strong>
      </span>
      {excluded > 0 && (
        <span title="Calls in the window that failed transcription or fell below the confidence gate.">
          <span className="tnum">{excluded}</span> call{excluded === 1 ? '' : 's'} excluded from
          aggregates
        </span>
      )}
      {loading && <span className="animate-pulse">Recalculating…</span>}
    </div>
  )
}
