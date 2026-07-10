'use client'

import { useMemo, useState } from 'react'
import { ChevronRight, TrendingUp, TrendingDown, Minus, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRoster, formatDuration, type RosterRow } from '@/lib/learning-dashboard-client'

/**
 * Admin bird's-eye roster (`/admin/learners`): every learner × academy the
 * caller may see (RLS: admin = all; unrestricted, unlike the manager scope).
 * Sortable + filterable; a row opens that learner's read-only dashboard.
 *
 * Names/academy titles resolve once a Supabase project + profiles/academies
 * are wired; in demo mode the roster is empty (503) and the notice explains it.
 */

type SortKey = 'completionPct' | 'totalTimeSeconds' | 'lastActiveAt'
const TREND_ICON = { improving: TrendingUp, plateaued: Minus, declining: TrendingDown } as const
const TREND_COLOR = {
  improving: 'var(--status-ontrack)',
  plateaued: 'var(--status-risk)',
  declining: 'var(--status-overdue)',
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
        <h1 className="font-serif text-4xl font-normal text-ink-primary">Learner roster</h1>
        <p className="text-sm text-ink-secondary mt-2">
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
                ? 'bg-ink-primary text-parchment'
                : 'bg-[rgba(0,59,70,0.06)] text-ink-secondary hover:bg-[rgba(0,59,70,0.1)]',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {load.status === 'unconfigured' && (
        <div className="rounded-2xl border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream p-6 text-sm text-ink-secondary">
          The roster goes live once Supabase + auth are configured. In demo mode there is a single
          local identity, so there are no other learners to list.
        </div>
      )}
      {load.status === 'error' && (
        <div className="rounded-2xl border-[0.5px] border-[rgba(186,117,23,0.4)] bg-accent-copper/5 p-6 text-sm text-ink-secondary">
          Couldn&apos;t load the roster: {load.message}
        </div>
      )}

      {load.status === 'ready' && (
        <div className="rounded-2xl border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream shadow-card overflow-hidden">
          <div className="hidden md:grid grid-cols-[1.4fr_1fr_120px_120px_130px_140px] gap-3 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary border-b border-[rgba(0,59,70,0.08)] bg-[rgba(0,59,70,0.02)]">
            <span>Learner</span>
            <span>Academy</span>
            <button type="button" onClick={() => toggleSort('completionPct')} className="flex items-center gap-1 hover:text-ink-secondary">
              Completion <ArrowUpDown size={11} />
            </button>
            <button type="button" onClick={() => toggleSort('totalTimeSeconds')} className="flex items-center gap-1 hover:text-ink-secondary">
              Time <ArrowUpDown size={11} />
            </button>
            <span>Trend</span>
            <button type="button" onClick={() => toggleSort('lastActiveAt')} className="flex items-center gap-1 hover:text-ink-secondary">
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
                className="w-full grid grid-cols-1 md:grid-cols-[1.4fr_1fr_120px_120px_130px_140px] gap-1.5 md:gap-3 items-center px-4 py-3 text-left border-b border-[rgba(0,59,70,0.06)] last:border-b-0 hover:bg-[rgba(0,59,70,0.03)] transition-colors"
              >
                <span className="text-sm font-medium text-ink-primary truncate">
                  {nameForUser?.(r.userId) ?? r.userId}
                </span>
                <span className="text-[13px] text-ink-secondary truncate">
                  {labelForAcademy?.(r.academyId) ?? r.academyId}
                </span>
                <span className="flex items-center gap-2">
                  <span className="flex-1 h-1.5 rounded-full bg-[rgba(0,59,70,0.07)] overflow-hidden max-w-[70px]">
                    <span className="block h-full rounded-full" style={{ width: `${r.completionPct}%`, backgroundColor: 'var(--status-ontrack)' }} />
                  </span>
                  <span className="text-[12px] font-semibold text-ink-secondary tabular-nums">{r.completionPct}%</span>
                </span>
                <span className="text-[13px] text-ink-secondary tabular-nums">{formatDuration(r.totalTimeSeconds)}</span>
                <span className="inline-flex items-center gap-1.5 text-[13px]" style={{ color: r.trend ? TREND_COLOR[r.trend] : 'rgb(var(--m-ink-tertiary))' }}>
                  <TrendIcon size={14} />
                  {r.trend ?? '—'}
                </span>
                <span className="flex items-center justify-between text-[12px] text-ink-tertiary">
                  {r.lastActiveAt ? new Date(r.lastActiveAt).toLocaleDateString() : '—'}
                  <ChevronRight size={15} className="text-ink-tertiary/60" />
                </span>
              </button>
            )
          })}
          {rows.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-ink-tertiary">No learners match this filter.</p>
          )}
        </div>
      )}
    </div>
  )
}
