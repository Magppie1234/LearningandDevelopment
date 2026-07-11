'use client'

import { useState } from 'react'
import { CalendarDays, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDuration } from '@/lib/learning-dashboard-client'

/**
 * Time-invested trend with a Week / Month toggle (spec §5/§9). "This week"
 * shows a bar per day; "This month" shows a bar per week — each labelled with
 * the actual calendar month it covers. The Month view has a sub-selector to
 * pick which month (current or a prior one); only the current month carries
 * data in demo mode, prior months read zero honestly.
 * Dark "Obsidian" (warm-stone) surface; live-computed from learning_sessions in
 * real mode, demo values otherwise. Zero activity → flat bars + 0m.
 */

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

type Range = 'week' | 'month'

// Current + previous months (client-side; safe in a 'use client' component).
function monthOptions(): { off: number; label: string; short: string }[] {
  const now = new Date()
  return [0, 1, 2].map((off) => {
    const d = new Date(now.getFullYear(), now.getMonth() - off, 1)
    return {
      off,
      label: d.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      short: d.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
    }
  })
}

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
  const [monthOff, setMonthOff] = useState(0) // 0 = current month
  const [hover, setHover] = useState<number | null>(null)

  const months = monthOptions()
  const currentMonthLabel = months[0].label
  const selectedMonth = months.find((m) => m.off === monthOff) ?? months[0]

  const isWeek = range === 'week'
  // Only the current month has history in demo mode; prior months are zero.
  const monthHasData = monthOff === 0
  const monthWeeks = monthHasData ? monthByWeekMinutes : monthByWeekMinutes.map(() => 0)
  const monthSecs = monthHasData ? monthTotalSeconds : 0

  const bars = isWeek ? weekByDayMinutes : monthWeeks
  const labels = isWeek ? DAY_LABELS : monthWeeks.map((_, i) => `W${i + 1}`)
  const max = Math.max(1, ...bars)

  const weekTotalSeconds = weekByDayMinutes.reduce((s, m) => s + m, 0) * 60
  const rangeTotalSeconds = isWeek ? weekTotalSeconds : monthSecs

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr] gap-3">
      {/* Trend graph with the Week / Month toggle */}
      <div className="rounded-2xl border border-white/10 bg-stone-espresso p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <CalendarDays size={15} className="text-stone-ivory/50 shrink-0" />
            <h3 className="text-sm font-semibold text-stone-ivory truncate">
              {isWeek ? 'This week' : selectedMonth.label}
            </h3>
            {/* In the week view, still say which month we're in. */}
            {isWeek && (
              <span className="text-[11px] text-stone-ivory/40 shrink-0">· {currentMonthLabel}</span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Month sub-selector — only in the Month view */}
            {!isWeek && (
              <div className="relative">
                <select
                  value={monthOff}
                  onChange={(e) => setMonthOff(Number(e.target.value))}
                  aria-label="Choose month"
                  className="appearance-none rounded-full border border-white/10 bg-stone-charcoal pl-3 pr-7 py-1 text-[11px] font-medium text-stone-ivory/80 focus:outline-none focus:border-accent-copper cursor-pointer"
                >
                  {months.map((m) => (
                    <option key={m.off} value={m.off} className="bg-stone-charcoal text-stone-ivory">
                      {m.short}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={12}
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-stone-ivory/40"
                />
              </div>
            )}

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
          {isWeek ? `This week · ${currentMonthLabel}` : selectedMonth.label}
        </p>
        <p className="mt-1 text-3xl font-bold text-stone-ivory tabular-nums">
          {formatDuration(rangeTotalSeconds)}
        </p>
        <p className="text-[12px] text-stone-ivory/45 mt-1">Total time invested</p>
      </div>
    </div>
  )
}
