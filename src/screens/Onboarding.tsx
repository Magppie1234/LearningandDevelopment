'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, User2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ALL_CHECKLIST_TASKS,
  CHECKLIST_HEADER_FIELDS,
  ONBOARDING_CHECKLIST,
  ONBOARDING_VIDEO,
  TOTAL_CHECKLIST_TASKS,
  type ChecklistPhase,
} from '@/data/onboarding-checklist'

/**
 * Onboarding roadmap — the real MAGPPIE New Hire Onboarding Checklist.
 *
 * Five phases run left to right, alternating above and below a central path,
 * each in its own colour. Deliberately FLAT: no shadows, no gradients standing
 * in for depth, no 3D. Colour and position do the work.
 *
 * Phase cards are sized by their real task count, so Day 1 (ten of the sixteen
 * tasks) reads as the dense block it actually is. An even five-across layout
 * would misrepresent a process that is this front-loaded.
 *
 * Status is real, not decorative: ticks persist to localStorage, the same
 * mechanism the previous Day-0–90 view used. Live mode has somewhere to go —
 * onboarding_tasks / onboarding_progress exist in migration 0001 — but nothing
 * writes to them yet, so this is per-browser rather than per-employee.
 */

/** v2: the task set changed wholesale, so v1's ids would never match. */
const STORAGE_KEY = 'magppie-onboarding-progress-v2'

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
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
      } catch {
        /* storage unavailable — the tick still works for this session */
      }
      return next
    })
  }

  const doneCount = useMemo(
    () => ALL_CHECKLIST_TASKS.filter((t) => done.has(t.id)).length,
    [done],
  )
  const pct = Math.round((doneCount / TOTAL_CHECKLIST_TASKS) * 100)

  if (!hydrated) return null

  return (
    <div className="mx-auto max-w-[1180px] space-y-8">
      <header className="border-b border-[rgb(var(--rule)/0.08)] pb-6">
        <p className="text-xs uppercase tracking-[0.22em] text-accent-copper">Onboarding</p>
        <h1 className="mt-2 font-serif text-4xl font-normal text-ink-primary">
          Your first month at Magppie
        </h1>
        <p className="mt-2 max-w-[640px] text-sm text-ink-secondary">
          The New Hire Onboarding Checklist — {TOTAL_CHECKLIST_TASKS} tasks across five phases,
          from the day before you join to your first month review. Most of it happens on Day 1.
        </p>

        <div className="mt-5 flex items-center gap-3">
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-cream">
            <div
              className="h-full rounded-full bg-surface-sage transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="tabular-nums text-sm font-semibold text-ink-primary">
            {doneCount}/{TOTAL_CHECKLIST_TASKS}
          </span>
        </div>
      </header>

      {/* ── The roadmap ─────────────────────────────────────────────────
          Horizontal scroll rather than shrinking cards: sixteen real task
          lines stay readable, which matters more than fitting on one screen. */}
      <section aria-label="Onboarding roadmap" className="overflow-x-auto pb-2">
        {/* Three grid rows: cards above, the path itself, cards below. The
            path is a real row rather than a 50% offset, so it stays a single
            straight line no matter how uneven the card heights are — and they
            are very uneven, by design. */}
        <div
          className="grid min-w-[1100px] gap-x-5 px-1"
          style={{ gridTemplateColumns: 'repeat(5, minmax(200px, 1fr))' }}
        >
          {ONBOARDING_CHECKLIST.map((phase, i) => {
            const above = i % 2 === 0
            return (
              <div
                key={`${phase.id}-card`}
                style={{ gridRow: above ? 1 : 3, gridColumn: i + 1 }}
                className={cn('flex flex-col', above ? 'justify-end' : 'justify-start')}
              >
                {above && <PhaseCard phase={phase} index={i} done={done} onToggle={toggle} />}
                {!above && <div className="h-10 w-px self-center" style={{ backgroundColor: phase.color }} />}
                {above && <div className="h-10 w-px self-center" style={{ backgroundColor: phase.color }} />}
                {!above && <PhaseCard phase={phase} index={i} done={done} onToggle={toggle} />}
              </div>
            )
          })}

          {/* The path, spanning every column. */}
          <div
            aria-hidden
            style={{ gridRow: 2, gridColumn: '1 / -1' }}
            className="h-px w-full bg-[rgb(var(--rule)/0.25)]"
          />
          {/* One node per phase, sitting on the path. */}
          {ONBOARDING_CHECKLIST.map((phase, i) => {
            const allDone = phase.tasks.every((t) => done.has(t.id))
            return (
              <div
                key={`${phase.id}-node`}
                aria-hidden
                style={{ gridRow: 2, gridColumn: i + 1 }}
                className="flex items-center justify-center"
              >
                <span
                  className="h-3 w-3 rounded-full border-2"
                  style={{
                    borderColor: phase.color,
                    backgroundColor: allDone ? phase.color : '#fff',
                  }}
                />
              </div>
            )
          })}
        </div>
      </section>

      {/* ── The walkthrough film ────────────────────────────────────── */}
      <OnboardingFilm />

      {/* ── The record the checklist keeps per hire ─────────────────── */}
      <section className="rounded-2xl border border-[rgb(var(--rule)/0.12)] p-5">
        <h2 className="text-sm font-semibold text-ink-primary">New hire record</h2>
        <p className="mt-0.5 text-[12px] text-ink-tertiary">
          Captured at the top of the checklist. Not wired to the HRMS import yet, so these stay
          blank rather than showing invented details.
        </p>
        <dl className="mt-3 grid gap-x-8 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {CHECKLIST_HEADER_FIELDS.map((f) => (
            <div key={f} className="flex items-baseline gap-2 border-b border-dashed border-[rgb(var(--rule)/0.15)] pb-1.5">
              <dt className="text-[12px] text-ink-tertiary">{f}</dt>
              <dd className="ml-auto text-[12px] text-ink-tertiary/60">—</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="text-[11px] text-ink-tertiary">
        Ticks are saved in this browser only. Per-employee tracking needs the onboarding_progress
        table wiring up — nothing writes to it yet.
      </p>
    </div>
  )
}

/**
 * The walkthrough film. The roadmap above is its visual spine, so this is a
 * second way through the same content rather than a different story.
 *
 * The .mp4 is reproducible (scripts/gen-onboarding-video.mjs), so a clone
 * without it should say how to get it back rather than showing a dead player —
 * hence the HEAD probe as well as onError, since a <video> error event does
 * not bubble reliably.
 */
function OnboardingFilm() {
  const [failed, setFailed] = useState(false)
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    let alive = true
    const el = ref.current
    const onErr = () => alive && setFailed(true)
    el?.addEventListener('error', onErr)
    fetch(ONBOARDING_VIDEO.src, { method: 'HEAD' })
      .then((r) => {
        if (alive && !r.ok) setFailed(true)
      })
      .catch(() => alive && setFailed(true))
    if (el?.error) setFailed(true)
    return () => {
      alive = false
      el?.removeEventListener('error', onErr)
    }
  }, [])

  return (
    <section className="rounded-2xl border border-[rgb(var(--rule)/0.12)] p-5">
      <h2 className="text-sm font-semibold text-ink-primary">{ONBOARDING_VIDEO.title}</h2>
      <p className="mt-0.5 max-w-[560px] text-[12px] text-ink-tertiary">
        {ONBOARDING_VIDEO.blurb}
      </p>
      <div className="mt-3 overflow-hidden rounded-xl bg-black" style={{ aspectRatio: '16 / 9' }}>
        {!failed ? (
          <video
            ref={ref}
            className="h-full w-full"
            src={ONBOARDING_VIDEO.src}
            controls
            playsInline
            preload="metadata"
            onError={() => setFailed(true)}
          >
            <track
              kind="subtitles"
              srcLang="en"
              label="English"
              src={ONBOARDING_VIDEO.subtitles}
            />
          </video>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="text-sm font-medium text-white">Walkthrough not rendered yet</p>
            <p className="text-[12px] leading-relaxed text-white/70">
              Run{' '}
              <code className="rounded bg-white/15 px-1">node scripts/gen-onboarding-video.mjs</code>{' '}
              — free neural narration, no API key needed.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

/**
 * One phase card: colour-coded, flat, with its real tasks and their owners.
 * Height follows task count — that is what makes Day 1 dominate the row.
 */
function PhaseCard({
  phase,
  index,
  done,
  onToggle,
}: {
  phase: ChecklistPhase
  index: number
  done: Set<string>
  onToggle: (id: string) => void
}) {
  const complete = phase.tasks.filter((t) => done.has(t.id)).length

  return (
    <div className="rounded-2xl border-2 bg-white p-4" style={{ borderColor: phase.color }}>
      <div className="flex items-baseline gap-2">
        <span
          className="rounded-md px-2 py-0.5 text-[11px] font-bold text-white"
          style={{ backgroundColor: phase.color }}
        >
          {index + 1}
        </span>
        <span className="text-sm font-semibold text-ink-primary">{phase.title}</span>
        <span className="ml-auto tabular-nums text-[11px] text-ink-tertiary">
          {complete}/{phase.tasks.length}
        </span>
      </div>
      <p className="mt-0.5 text-[11px] uppercase tracking-wide" style={{ color: phase.color }}>
        {phase.when}
      </p>

      <ul className="mt-3 space-y-1.5">
        {phase.tasks.map((t) => {
          const isDone = done.has(t.id)
          return (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => onToggle(t.id)}
                aria-pressed={isDone}
                className="flex w-full items-start gap-2 rounded-lg px-1.5 py-1 text-left transition-colors hover:bg-cream/70"
              >
                <span
                  aria-hidden
                  className={cn(
                    'mt-[2px] flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2',
                    isDone ? 'text-white' : 'border-[rgb(var(--rule)/0.35)]',
                  )}
                  style={
                    isDone ? { backgroundColor: phase.color, borderColor: phase.color } : undefined
                  }
                >
                  {isDone && <Check size={11} strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      'block text-[12px] leading-snug',
                      isDone ? 'text-ink-tertiary line-through' : 'text-ink-secondary',
                    )}
                  >
                    <span className="tabular-nums text-ink-tertiary">{t.n}. </span>
                    {t.title}
                  </span>
                  <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-ink-tertiary">
                    <User2 size={9} /> {t.owner}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
