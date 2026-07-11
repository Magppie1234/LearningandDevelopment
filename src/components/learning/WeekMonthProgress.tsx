'use client'

import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDuration } from '@/lib/learning-dashboard-client'

/**
 * Time-invested trend with a Week / Month toggle (spec §5/§9). "This week"
 * shows a bar per day; "This month" shows a bar per week — plus the cumulative
 * total for whichever range is selected. The always-visible summary total for
 * both ranges stays on the right. Dark "Obsidian" (warm-stone) surface.
 * Live-computed from learning_sessions in real mode; demo values otherwise.
 * Zero activity → flat bars + 0m, never a placeholder.
 */

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

type Range = 'week' | 'month'

export default function WeekMonthProgress({
  weekByDayMinutes,
  monthByWeekMinutes,
  monthTotalSeconds,
}: {
  weekByDayMinutes: number[]
  monthByWeekMinutes: number[]
  monthTotalSeconds: number
}) {
  const [range, setRange] = useState<Range>('week')
  const [hover, setHover] = useState<number | null>(null)

  const isWeek = range === 'week'
  const bars = isWeek ? weekByDayMinutes : monthByWeekMinutes
  const labels = isWeek ? DAY_LABELS : monthByWeekMinutes.map((_, i) => `W${i + 1}`)
  const max = Math.max(1, ...bars)

  const weekTotalSeconds = weekByDayMinutes.reduce((s, m) => s + m, 0) * 60
  const rangeTotalSeconds = isWeek ? weekTotalSeconds : monthTotalSeconds

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr] gap-3">
      {/* Trend graph with the Week / Month toggle */}
      <div className="rounded-2xl border border-white/10 bg-stone-espresso p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarDays size={15} className="text-stone-ivory/50" />
            <h3 className="text-sm font-semibold text-stone-ivory">
              {isWeek ? 'This week' : 'This month'}
            </h3>
          </div>
          {/* Week / Month segmented toggle */}
          <div className="inline-flex rounded-full border border-white/10 bg-stone-charcoal p-0.5">
            {(['week', 'month'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setRange(r)
                  setHover(null)
                }}
                className={cn(
                  'rounded-full px-3 py-1 text-[11px] font-semibold capitalize transition-colors',
                  range === r
                    ? 'bg-accent-copper text-stone-ink'
                    : 'text-stone-ivory/55 hover:text-stone-ivory',
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-end justify-between gap-2 h-[92px]">
          {bars.map((m, i) => (
            <div
              key={i}
              className="relative flex-1 h-full flex flex-col items-center justify-end gap-1.5"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              {hover === i && m > 0 && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-black/70 px-2 py-1 text-[10px] text-stone-ivory">
                  {m >= 60 ? `${Math.round((m / 60) * 10) / 10}h` : `${m}m`}
                </div>
              )}
              <div
                className="w-full max-w-[24px] rounded-t-[4px] transition-all duration-500"
                style={{
                  height: `${(m / max) * 100}%`,
                  minHeight: m > 0 ? 4 : 2,
                  backgroundColor: m > 0 ? 'rgb(var(--m-accent-copper))' : 'rgba(245,239,230,0.12)',
                  opacity: hover !== null && hover !== i ? 0.5 : 1,
                }}
              />
              <span className="text-[10px] text-stone-ivory/40">{labels[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cumulative headline for the selected range */}
      <div className="rounded-2xl border border-white/10 bg-stone-espresso p-5 flex flex-col justify-center">
        <p className="text-[11px] font-medium uppercase tracking-wide text-stone-ivory/50">
          {isWeek ? 'This week' : 'This month'}
        </p>
        <p className="mt-1 text-3xl font-bold text-stone-ivory tabular-nums">
          {formatDuration(rangeTotalSeconds)}
        </p>
        <p className="text-[12px] text-stone-ivory/45 mt-1">Total time invested</p>
      </div>
    </div>
  )
}
