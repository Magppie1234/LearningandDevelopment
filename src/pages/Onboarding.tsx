'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Lock, Flag, BookOpen, Wrench, FileCheck, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ONBOARDING_PHASES,
  ONBOARDING_TASKS,
  type OnboardingTask,
} from '@/data/onboarding-journey'

const KIND_ICONS: Record<OnboardingTask['kind'], typeof BookOpen> = {
  course: BookOpen,
  tool_setup: Wrench,
  policy_ack: FileCheck,
  assignment: ClipboardList,
  task: Circle,
}

const STORAGE_KEY = 'magppie-onboarding-progress-v1'

export default function Onboarding() {
  const [done, setDone] = useState<Set<string>>(new Set())
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setDone(new Set(JSON.parse(raw) as string[]))
    } catch {
      /* fresh start */
    }
    setHydrated(true)
  }, [])

  function toggle(id: string) {
    setDone((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
      return next
    })
  }

  // Gating: phase N+1 unlocks only when phase N's checkpoint is done —
  // mirrors public.onboarding_unlocked_phase (migration 0010).
  const checkpoints = ONBOARDING_TASKS.filter((t) => t.isCheckpoint)
  const firstIncomplete = checkpoints.find((c) => !done.has(c.id))
  const unlockedPhase = firstIncomplete ? firstIncomplete.phase : 5

  const totalTasks = ONBOARDING_TASKS.length
  const doneCount = ONBOARDING_TASKS.filter((t) => done.has(t.id)).length
  const pct = Math.round((doneCount / totalTasks) * 100)

  if (!hydrated) return null

  return (
    <div className="max-w-[860px] mx-auto space-y-8">
      <section className="pb-6 border-b border-[rgba(0,59,70,0.08)]">
        <h1 className="font-serif text-4xl font-normal text-ink-primary">
          Your First 90 Days
        </h1>
        <p className="text-sm text-ink-secondary mt-2 max-w-[620px]">
          Four phases, each ending in a checkpoint with your manager. The next
          phase unlocks when the current checkpoint is complete.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-2.5 bg-cream rounded-full overflow-hidden">
            <div
              className="h-full bg-surface-sage rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-ink-primary tabular-nums">
            {doneCount}/{totalTasks}
          </span>
        </div>
      </section>

      {[1, 2, 3, 4].map((phase) => {
        const locked = phase > unlockedPhase
        const tasks = ONBOARDING_TASKS.filter((t) => t.phase === phase)
        const meta = ONBOARDING_PHASES[phase]
        return (
          <motion.section
            key={phase}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: phase * 0.05 }}
            className={cn(
              'rounded-2xl border bg-cream shadow-card overflow-hidden',
              locked ? 'border-[rgba(0,59,70,0.06)] opacity-60' : 'border-[rgba(0,59,70,0.08)]',
            )}
          >
            <header className="flex items-center justify-between px-5 py-4 border-b border-[rgba(0,59,70,0.06)]">
              <div>
                <p className="text-sm font-semibold text-ink-primary">
                  Phase {phase} — {meta.title}
                </p>
                <p className="text-[11px] text-ink-tertiary mt-0.5">{meta.window}</p>
              </div>
              {locked && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-tertiary">
                  <Lock size={13} /> Complete the previous checkpoint to unlock
                </span>
              )}
            </header>

            <ul className="divide-y divide-[rgba(0,59,70,0.05)]">
              {tasks.map((t) => {
                const Icon = t.isCheckpoint ? Flag : KIND_ICONS[t.kind]
                const isDone = done.has(t.id)
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      disabled={locked}
                      onClick={() => toggle(t.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-5 py-3 text-left transition-colors',
                        locked ? 'cursor-not-allowed' : 'hover:bg-black/[0.02]',
                        t.isCheckpoint && 'bg-[rgba(0,59,70,0.025)]',
                      )}
                    >
                      {isDone ? (
                        <CheckCircle2 size={18} className="shrink-0 text-surface-sage" />
                      ) : (
                        <Circle size={18} className="shrink-0 text-ink-tertiary/40" />
                      )}
                      <span className="flex-1 min-w-0">
                        <span
                          className={cn(
                            'block text-sm truncate',
                            isDone ? 'text-ink-tertiary line-through' : 'text-ink-primary',
                            t.isCheckpoint && 'font-semibold',
                          )}
                        >
                          {t.title}
                        </span>
                        <span className="block text-[10px] text-ink-tertiary mt-0.5">
                          Day {t.dayStart}
                          {t.dayEnd !== t.dayStart && `–${t.dayEnd}`}
                          {t.departmentSlug && ' · Business Development'}
                          {t.isCheckpoint && ' · Checkpoint'}
                        </span>
                      </span>
                      <Icon
                        size={15}
                        className={cn(
                          'shrink-0',
                          t.isCheckpoint ? 'text-accent-gold' : 'text-ink-tertiary/50',
                        )}
                      />
                    </button>
                  </li>
                )
              })}
            </ul>
          </motion.section>
        )
      })}
    </div>
  )
}
