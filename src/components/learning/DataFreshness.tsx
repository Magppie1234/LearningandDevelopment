'use client'

import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'

/**
 * Says how current these numbers are, and offers a way to make them current.
 *
 * This replaces a fixed "As of 30 Jul 2026" printed on every card. That date
 * was the reporting date the figures are computed against — a real thing — but
 * printed alone it reads as "last refreshed", which implies a freshness the
 * page did not have.
 *
 * The two modes are deliberately different, because pretending they are the
 * same is the failure this component exists to prevent:
 *
 *   live   — figures are recomputed from records on load, so a wall-clock
 *            "Last updated" is meaningful and Refresh genuinely re-fetches.
 *   sample — the cohort is a fixed fixture. It has a reporting date and no
 *            update time, and Refresh is NOT offered: a button that re-renders
 *            identical fixture data would be pure theatre, and worse than no
 *            button because it manufactures confidence.
 */

export default function DataFreshness({
  source,
  /** The date the figures are computed against (the reporting date). */
  asOfLabel,
  /** Live only: re-fetch. Omitted for sample, where refreshing changes nothing. */
  onRefresh,
  refreshing = false,
}: {
  source: 'live' | 'sample'
  asOfLabel: string
  onRefresh?: () => void
  refreshing?: boolean
}) {
  // Rendered client-side only: a server-rendered clock would hydrate to a
  // different value and, worse, would show the build time as "now".
  const [loadedAt, setLoadedAt] = useState<string | null>(null)
  useEffect(() => {
    if (source !== 'live') return
    setLoadedAt(
      new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
    )
  }, [source, refreshing])

  if (source === 'sample') {
    return (
      <p className="text-[11px] text-ink-tertiary">
        Sample cohort · reporting date {asOfLabel} — a fixed fixture, not a live feed, so it has
        no last-updated time.
      </p>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
      <p className="text-[11px] text-ink-tertiary">
        Last updated {loadedAt ?? '—'} · computed against {asOfLabel}
      </p>
      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1 rounded-full border border-hairline/20 px-2.5 py-1 text-[11px] font-medium text-ink-secondary transition-colors hover:text-ink-primary disabled:opacity-50"
        >
          <RefreshCw size={11} className={refreshing ? 'animate-spin' : undefined} aria-hidden />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      )}
    </div>
  )
}
