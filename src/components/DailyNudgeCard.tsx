'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Zap, CheckCircle2, Flame } from 'lucide-react'
import { computeGaps } from '@/lib/skill-gap'
import { todaysNudge, type DailyNudge } from '@/lib/nudges'
import { COMPETENCIES } from '@/data/competencies'
import {
  demoUserRequirements,
  demoUserCurrentLevels,
} from '@/data/role-requirements'

/**
 * Daily microlearning nudge card (§3.2 item 3 surfaced per §3.4) + the
 * understated gamification streak chip. Client-only date use keeps SSR clean.
 */
export default function DailyNudgeCard() {
  const [nudge, setNudge] = useState<DailyNudge | null>(null)
  const [doneToday, setDoneToday] = useState(false)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    const gaps = computeGaps(demoUserRequirements, demoUserCurrentLevels, COMPETENCIES)
    setNudge(todaysNudge(gaps, 'aarav-sharma', new Date()))
    const today = new Date().toISOString().slice(0, 10)
    try {
      const log = JSON.parse(localStorage.getItem('magppie-nudge-log-v1') ?? '{}') as Record<string, boolean>
      setDoneToday(!!log[today])
      // streak = consecutive days (incl. today if done)
      let s = 0
      const d = new Date()
      if (!log[today]) d.setDate(d.getDate() - 1)
      for (;;) {
        const key = d.toISOString().slice(0, 10)
        if (!log[key]) break
        s += 1
        d.setDate(d.getDate() - 1)
      }
      if (log[today]) s = Math.max(s, 1)
      setStreak(s)
    } catch {
      /* fresh */
    }
  }, [])

  function markDone() {
    const today = new Date().toISOString().slice(0, 10)
    try {
      const log = JSON.parse(localStorage.getItem('magppie-nudge-log-v1') ?? '{}') as Record<string, boolean>
      log[today] = true
      localStorage.setItem('magppie-nudge-log-v1', JSON.stringify(log))
    } catch {
      /* ignore */
    }
    setDoneToday(true)
    setStreak((s) => Math.max(s + 1, 1))
  }

  if (!nudge) return null

  return (
    <div className="rounded-[12px] bg-cream border-[0.5px] border-[rgba(0,59,70,0.14)] dark:border-[rgba(255,255,255,0.1)] p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-shadow hover:shadow-card">
      <div className="w-11 h-11 shrink-0 rounded-full bg-accent-gold/15 flex items-center justify-center">
        <Zap size={20} className="text-accent-gold" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[11px] font-medium text-ink-tertiary">
            Today’s 5-minute nudge
          </p>
          {streak > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-rose/20 px-2 py-0.5 text-[10px] font-semibold text-ink-secondary">
              <Flame size={10} /> {streak}-day streak
            </span>
          )}
        </div>
        <p className="text-sm font-semibold text-ink-primary mt-1 truncate">
          {nudge.topic}
        </p>
        <p className="text-[11px] text-ink-tertiary mt-0.5 truncate">
          {nudge.competencyName} · {nudge.academy} — targets your top skill gap
        </p>
      </div>
      {doneToday ? (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-surface-sage shrink-0">
          <CheckCircle2 size={15} /> Done for today
        </span>
      ) : (
        <div className="flex gap-2 shrink-0">
          <Link
            href="/academies"
            className="rounded-full border border-[rgba(0,59,70,0.15)] px-3.5 py-2 text-xs font-medium text-ink-primary hover:bg-black/[0.03] transition"
          >
            Open module
          </Link>
          <button
            type="button"
            onClick={markDone}
            className="rounded-full bg-ink-primary px-3.5 py-2 text-xs font-medium text-parchment hover:opacity-90 transition"
          >
            Mark done
          </button>
        </div>
      )}
    </div>
  )
}
