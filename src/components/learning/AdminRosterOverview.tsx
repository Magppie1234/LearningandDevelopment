'use client'

import { useMemo, useState } from 'react'
import { ChevronRight, TrendingUp, TrendingDown, Minus, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRoster, formatDuration, type RosterRow } from '@/lib/learning-dashboard-client'

/**
 * Admin bird's-eye roster (`/admin/learners`): every learner × academy the
 * caller may see (RLS: admin = all; unrestricted, unlike the manager scope).
 * Sortable + filterable; a row opens that learner's read-only dashboard.
 * Dark warm-stone surface, matching the dashboard system.
 */

type SortKey = 'completionPct' | 'totalTimeSeconds' | 'lastActiveAt'
const TREND_ICON = { improving: TrendingUp, plateaued: Minus, declining: TrendingDown } as const
const TREND_COLOR = {
  improving: 'rgb(var(--stone-sage))',
  plateaued: '#e0a04a',
  declining: '#e07a6a',
} as const

export default function AdminRosterOverview({
  onOpenLearner,
  nameForUser,
  labelForAcademy,
}: {
  onOpenLearner?: (userId: string, academyId: string) => void
  nameForUser?: (userId: string) => string
  labelForAcademy?: (academyId: string) => string
}) {
  const load = useRoster()
  const [sortKey, setSortKey] = useState<SortKey>('completionPct')
  const [asc, setAsc] = useState(false)
  const [trendFilter, setTrendFilter] = useState<'all' | 'improving' | 'plateaued' | 'declining'>('all')

  const rows = useMemo(() => {
    if (load.status !== 'ready') return [] as RosterRow[]
    let r = [...load.roster]
    if (trendFilter !== 'all') r = r.filter((x) => x.trend === trendFilter)
    r.sort((a, b) => {
      const av = a[sortKey] ?? 0
      const bv = b[sortKey] ?? 0
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return asc ? cmp : -cmp
    })
    return r
  }, [load, sortKey, asc, trendFilter])

  function toggleSort(k: SortKey) {
    if (k === sortKey) setAsc((v) => !v)
    else {
      setSortKey(k)
      setAsc(false)
    }
  }

  return (
    <div className="max-w-[1100px] mx-auto space-y-5">
      <div>
        <h1 className="font-serif text-4xl font-normal text-stone-ivory">Learner roster</h1>
        <p className="text-sm text-stone-ivory/60 mt-2">
          Every learner across every academy — completion, time invested, and trend at a glance.
          Click a row to open that learner&apos;s read-only dashboard.
        </p>
      </div>

      {/* filters */}
      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'improving', 'plateaued', 'declining'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTrendFilter(t)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors',
              trendFilter === t
                ? 'bg-accent-copper text-stone-ink'
                : 'bg-white/5 text-stone-ivory/70 hover:bg-white/10',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {load.status === 'unconfigured' && (
        <div className="rounded-2xl border border-white/10 bg-stone-espresso p-6 text-sm text-stone-ivory/70">
          The roster goes live once Supabase + auth are configured. In demo mode there is a single
          local identity, so there are no other learners to list.
        </div>
      )}
      {load.status === 'unauthenticated' && (
        <div className="rounded-2xl border border-white/10 bg-stone-espresso p-6 text-sm text-stone-ivory/70">
          Sign in with an admin account to view the roster — guests and learners see no rows here
          (row-level security).
        </div>
      )}
      {load.status === 'error' && (
        <div className="rounded-2xl border border-[rgba(200,130,85,0.4)] bg-accent-copper/10 p-6 text-sm text-stone-ivory/70">
          Couldn&apos;t load the roster: {load.message}
        </div>
      )}

      {load.status === 'ready' && (
        <div className="rounded-2xl border border-white/10 bg-stone-espresso overflow-hidden">
          <div className="hidden md:grid grid-cols-[1.4fr_1fr_120px_120px_130px_140px] gap-3 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-stone-ivory/45 border-b border-white/10 bg-white/[0.03]">
            <span>Learner</span>
            <span>Academy</span>
            <button type="button" onClick={() => toggleSort('completionPct')} className="flex items-center gap-1 hover:text-stone-ivory/80">
              Completion <ArrowUpDown size={11} />
            </button>
            <button type="button" onClick={() => toggleSort('totalTimeSeconds')} className="flex items-center gap-1 hover:text-stone-ivory/80">
              Time <ArrowUpDown size={11} />
            </button>
            <span>Trend</span>
            <button type="button" onClick={() => toggleSort('lastActiveAt')} className="flex items-center gap-1 hover:text-stone-ivory/80">
              Last active <ArrowUpDown size={11} />
            </button>
          </div>

          {rows.map((r) => {
            const TrendIcon = r.trend ? TREND_ICON[r.trend] : Minus
            return (
              <button
                key={`${r.userId}:${r.academyId}`}
                type="button"
                onClick={() => onOpenLearner?.(r.userId, r.academyId)}
                className="w-full grid grid-cols-1 md:grid-cols-[1.4fr_1fr_120px_120px_130px_140px] gap-1.5 md:gap-3 items-center px-4 py-3 text-left border-b border-white/5 last:border-b-0 hover:bg-white/[0.04] transition-colors"
              >
                <span className="text-sm font-medium text-stone-ivory truncate">
                  {nameForUser?.(r.userId) ?? r.userId}
                </span>
                <span className="text-[13px] text-stone-ivory/60 truncate">
                  {labelForAcademy?.(r.academyId) ?? r.academyId}
                </span>
                <span className="flex items-center gap-2">
                  <span className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden max-w-[70px]">
                    <span className="block h-full rounded-full" style={{ width: `${r.completionPct}%`, backgroundColor: 'rgb(var(--stone-sage))' }} />
                  </span>
                  <span className="text-[12px] font-semibold text-stone-ivory/70 tabular-nums">{r.completionPct}%</span>
                </span>
                <span className="text-[13px] text-stone-ivory/60 tabular-nums">{formatDuration(r.totalTimeSeconds)}</span>
                <span className="inline-flex items-center gap-1.5 text-[13px]" style={{ color: r.trend ? TREND_COLOR[r.trend] : 'rgba(245,239,230,0.45)' }}>
                  <TrendIcon size={14} />
                  {r.trend ?? '—'}
                </span>
                <span className="flex items-center justify-between text-[12px] text-stone-ivory/50">
                  {r.lastActiveAt ? new Date(r.lastActiveAt).toLocaleDateString() : '—'}
                  <ChevronRight size={15} className="text-stone-ivory/40" />
                </span>
              </button>
            )
          })}
          {rows.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-stone-ivory/50">No learners match this filter.</p>
          )}
        </div>
      )}
    </div>
  )
}
