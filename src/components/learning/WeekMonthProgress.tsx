'use client'

import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { formatDuration } from '@/lib/learning-dashboard-client'

/**
 * This-week trend (a bar per day) + this-month cumulative total, shown
 * together. Dark "Obsidian" (warm-stone) surface for the home/academy
 * dashboards. Live-computed from learning_sessions in real mode; fed demo
 * values in demo mode. Zero activity → flat bars + 0m, never a placeholder.
 */

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default function WeekMonthProgress({
  weekByDayMinutes,
  monthTotalSeconds,
}: {
  weekByDayMinutes: number[]
  monthTotalSeconds: number
}) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(1, ...weekByDayMinutes)
  const weekTotalMin = weekByDayMinutes.reduce((s, m) => s + m, 0)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr] gap-3">
      {/* This week — daily bars */}
      <div className="rounded-2xl border border-white/10 bg-stone-espresso p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarDays size={15} className="text-stone-ivory/50" />
            <h3 className="text-sm font-semibold text-stone-ivory">This week</h3>
          </div>
          <span className="text-[12px] text-stone-ivory/55 tabular-nums">
            {formatDuration(weekTotalMin * 60)}
          </span>
        </div>
        <div className="flex items-end justify-between gap-2 h-[92px]">
          {weekByDayMinutes.map((m, i) => (
            <div
              key={i}
              className="relative flex-1 h-full flex flex-col items-center justify-end gap-1.5"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              {hover === i && m > 0 && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-black/70 px-2 py-1 text-[10px] text-stone-ivory">
                  {m}m
                </div>
              )}
              <div
                className="w-full max-w-[20px] rounded-t-[4px] transition-all duration-500"
                style={{
                  height: `${(m / max) * 100}%`,
                  minHeight: m > 0 ? 4 : 2,
                  backgroundColor: m > 0 ? 'rgb(var(--m-accent-copper))' : 'rgba(245,239,230,0.12)',
                  opacity: hover !== null && hover !== i ? 0.5 : 1,
                }}
              />
              <span className="text-[10px] text-stone-ivory/40">{DAYS[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* This month — cumulative headline */}
      <div className="rounded-2xl border border-white/10 bg-stone-espresso p-5 flex flex-col justify-center">
        <p className="text-[11px] font-medium uppercase tracking-wide text-stone-ivory/50">This month</p>
        <p className="mt-1 text-3xl font-bold text-stone-ivory tabular-nums">
          {formatDuration(monthTotalSeconds)}
        </p>
        <p className="text-[12px] text-stone-ivory/45 mt-1">Total time invested</p>
      </div>
    </div>
  )
}
