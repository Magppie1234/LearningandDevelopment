'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'
import { useLearningProgress, formatDuration } from '@/lib/learning-dashboard-client'
import { summarizeProgress } from '@/lib/learning-summary'
import { useDemoLearningData } from '@/lib/learning-demo-data'

const REAL_AUTH = process.env.NEXT_PUBLIC_REAL_AUTH === '1'

/**
 * Big-picture "welcome back" snapshot — overall completion, time invested,
 * modules in progress, and one plain-language takeaway. Shows once per login
 * (sessionStorage flag), immediately after the home dashboard loads,
 * dismissible in one tap. Learner-facing only — never auto-triggers for a
 * manager/admin reviewing someone's dashboard, and stays silent in demo mode.
 */

const SEEN_KEY = 'ld-overall-popup-seen'

export default function OverallProgressPopup() {
  const load = useLearningProgress({}) // global scope, own data
  const demo = useDemoLearningData() // global demo bridge
  const [open, setOpen] = useState(false)

  const useDemo = !REAL_AUTH && (load.status === 'unauthenticated' || load.status === 'unconfigured')
  const data =
    load.status === 'ready' && !load.readOnly
      ? { progress: load.progress, insights: load.insights }
      : useDemo
        ? { progress: demo.progress, insights: demo.insights }
        : null

  useEffect(() => {
    if (!data || data.progress.length === 0) return
    let seen = false
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === '1'
    } catch {}
    if (!seen) setOpen(true)
    // data identity changes each render; gate on a stable signal instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load.status, demo.progress.length])

  function dismiss() {
    setOpen(false)
    try {
      sessionStorage.setItem(SEEN_KEY, '1')
    } catch {}
  }

  if (!data) return null
  const s = summarizeProgress(data.progress, data.insights)
  const noActivity = s.totalModules > 0 && s.completed === 0 && s.inProgress === 0 && s.totalTimeSeconds === 0

  // Section 7: zero activity gets a "let's get started", not a wall of 0%s.
  const takeaway = noActivity
    ? "You haven't started yet — open any academy and your progress will begin filling in here."
    : `You're ${s.completionPct}% through your learning${
        s.strongestTopic ? `, strongest in ${s.strongestTopic}` : ''
      }${s.weakestTopic ? `, and could use more time on ${s.weakestTopic}` : ''}.`

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4" onClick={dismiss}>
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[440px] rounded-2xl bg-stone-espresso border border-white/10 shadow-2xl p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-accent-copper">
                <Sparkles size={16} />
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em]">Welcome back</span>
              </div>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss"
                className="w-8 h-8 rounded-full flex items-center justify-center text-stone-ivory/50 hover:text-stone-ivory hover:bg-white/[0.06] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <h2 className="font-serif text-2xl text-stone-ivory mt-2">
              {noActivity ? 'Ready when you are' : 'Your progress at a glance'}
            </h2>

            {!noActivity && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { label: 'Complete', value: `${s.completionPct}%` },
                  { label: 'In progress', value: String(s.inProgress) },
                  { label: 'Time invested', value: formatDuration(s.totalTimeSeconds) },
                ].map((k) => (
                  <div key={k.label} className="rounded-[12px] bg-stone-charcoal border border-white/10 p-3 text-center">
                    <p className="text-lg font-bold text-stone-ivory tabular-nums">{k.value}</p>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-stone-ivory/45 mt-0.5">{k.label}</p>
                  </div>
                ))}
              </div>
            )}

            <p className="text-[13px] text-stone-ivory/70 mt-4 leading-relaxed">{takeaway}</p>

            <button
              type="button"
              onClick={dismiss}
              className="mt-5 w-full rounded-full bg-accent-copper py-2.5 text-sm font-semibold text-stone-ink hover:brightness-95 transition"
            >
              Let&apos;s go
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
