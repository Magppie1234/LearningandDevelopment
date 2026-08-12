'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, FileText, User2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ALL_CHECKLIST_TASKS,
  CHECKLIST_HEADER_FIELDS,
  ONBOARDING_CHECKLIST,
  ONBOARDING_VIDEO,
  TOTAL_CHECKLIST_TASKS,
} from '@/data/onboarding-checklist'

/**
 * Onboarding — the real MAGPPIE New Hire Onboarding Checklist, stepped through
 * one phase at a time.
 *
 * Numbered steps 1–5 across the top are both the progress indicator and the
 * navigation: click one, or use next/back. Only the active phase's checklist
 * renders, so the page stays a single readable list instead of a wall of
 * sixteen tasks.
 *
 * Colour is deliberately vivid — a fully saturated hue per phase, carried
 * through the step indicator, the header band and the checklist. The earlier
 * muted set read as flat. Still FLAT though: no shadows, no gradients standing
 * in for depth. Colour does the work, not dimension.
 *
 * Day 1 is not made bigger artificially. It simply has ten tasks where the
 * others have one or two, and stepping through makes that obvious without
 * padding the short phases with invented content.
 */

/** v2: the task set changed wholesale, so v1's ids would never match. */
const STORAGE_KEY = 'magppie-onboarding-progress-v2'

export default function Onboarding() {
  const [done, setDone] = useState<Set<string>>(new Set())
  const [hydrated, setHydrated] = useState(false)
  const [active, setActive] = useState(0)

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

  const phase = ONBOARDING_CHECKLIST[active]
  const phaseDone = phase.tasks.filter((t) => done.has(t.id)).length
  const isFirst = active === 0
  const isLast = active === ONBOARDING_CHECKLIST.length - 1

  return (
    <div className="mx-auto max-w-[900px] space-y-7">
      <header>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.22em] text-accent-copper">Onboarding</p>
            <h1 className="mt-2 font-serif text-4xl font-normal text-ink-primary">
              Your first month at Magppie
            </h1>
          </div>
          {/* The full Code of Conduct is a reference document, not a step —
              hence a link out rather than another phase in the checklist. */}
          <Link
            href="/policies"
            className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border border-[rgb(var(--rule)/0.2)] px-3.5 py-2 text-[13px] font-semibold text-ink-secondary transition-colors hover:border-accent-copper/50 hover:text-accent-copper"
          >
            <FileText size={14} /> Policies
          </Link>
        </div>
        <p className="mt-2 max-w-[640px] text-sm text-ink-secondary">
          The New Hire Onboarding Checklist — {TOTAL_CHECKLIST_TASKS} tasks across five phases,
          from the day before you join to your first month review. Step through them one at a time.
        </p>

        <div className="mt-5 flex items-center gap-3">
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-cream">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, backgroundColor: phase.color }}
            />
          </div>
          <span className="tabular-nums text-sm font-semibold text-ink-primary">
            {doneCount}/{TOTAL_CHECKLIST_TASKS}
          </span>
        </div>
      </header>

      {/* ── Stepper: progress indicator and navigation in one ────────── */}
      <nav aria-label="Onboarding phases">
        <ol className="flex items-start gap-1.5">
          {ONBOARDING_CHECKLIST.map((p, i) => {
            const complete = p.tasks.every((t) => done.has(t.id))
            const isActive = i === active
            return (
              <li key={p.id} className="flex min-w-0 flex-1 flex-col items-center">
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-current={isActive ? 'step' : undefined}
                  className="group flex w-full flex-col items-center gap-1.5 rounded-lg px-1 py-1.5"
                >
                  <span className="flex w-full items-center gap-1.5">
                    {/* connector left */}
                    <span
                      className={cn('h-0.5 flex-1 rounded', i === 0 && 'opacity-0')}
                      style={{ backgroundColor: i <= active ? phase.color : 'rgb(0 0 0 / 0.10)' }}
                    />
                    <span
                      className={cn(
                        'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[13px] font-bold transition-colors',
                        isActive || complete ? 'text-white' : 'text-ink-tertiary',
                      )}
                      style={{
                        backgroundColor: isActive || complete ? p.color : 'rgb(0 0 0 / 0.06)',
                        outline: isActive ? `3px solid ${p.color}33` : undefined,
                      }}
                    >
                      {complete ? <Check size={16} strokeWidth={3} /> : i + 1}
                    </span>
                    <span
                      className={cn('h-0.5 flex-1 rounded', isLastIndex(i) && 'opacity-0')}
                      style={{ backgroundColor: i < active ? phase.color : 'rgb(0 0 0 / 0.10)' }}
                    />
                  </span>
                  <span
                    className={cn(
                      'truncate text-center text-[11px] font-medium leading-tight',
                      isActive ? 'text-ink-primary' : 'text-ink-tertiary',
                    )}
                    style={isActive ? { color: p.color } : undefined}
                  >
                    {p.title}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </nav>

      {/* ── The active phase ─────────────────────────────────────────── */}
      <section
        key={phase.id}
        aria-label={`${phase.title} tasks`}
        className="overflow-hidden rounded-2xl border-2"
        style={{ borderColor: phase.color }}
      >
        <div
          className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-5 py-4"
          style={{ backgroundColor: phase.color }}
        >
          <h2 className="font-serif text-2xl text-white">{phase.title}</h2>
          <span className="text-[12px] uppercase tracking-wide text-white/80">{phase.when}</span>
          <span className="ml-auto tabular-nums text-[12px] font-semibold text-white/90">
            {phaseDone}/{phase.tasks.length} done
          </span>
        </div>

        <ul className="divide-y divide-[rgb(var(--rule)/0.08)] bg-white">
          {phase.tasks.map((t) => {
            const isDone = done.has(t.id)
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => toggle(t.id)}
                  aria-pressed={isDone}
                  className="flex w-full items-start gap-3 px-5 py-3 text-left transition-colors hover:bg-cream/60"
                >
                  <span
                    aria-hidden
                    className={cn(
                      'mt-[1px] flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2',
                      isDone ? 'text-white' : 'border-[rgb(var(--rule)/0.3)]',
                    )}
                    style={
                      isDone ? { backgroundColor: phase.color, borderColor: phase.color } : undefined
                    }
                  >
                    {isDone && <Check size={13} strokeWidth={3} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        'block text-[13.5px] leading-snug',
                        isDone ? 'text-ink-tertiary line-through' : 'text-ink-primary',
                      )}
                    >
                      <span className="tabular-nums text-ink-tertiary">{t.n}. </span>
                      {t.title}
                    </span>
                    <span
                      className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{ backgroundColor: `${phase.color}18`, color: phase.color }}
                    >
                      <User2 size={9} /> {t.owner}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        <div className="flex items-center justify-between gap-3 border-t border-[rgb(var(--rule)/0.08)] bg-white px-5 py-3">
          <button
            type="button"
            onClick={() => setActive((i) => Math.max(0, i - 1))}
            disabled={isFirst}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium text-ink-secondary transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <span className="text-[11px] text-ink-tertiary">
            Phase {active + 1} of {ONBOARDING_CHECKLIST.length}
          </span>
          <button
            type="button"
            onClick={() => setActive((i) => Math.min(ONBOARDING_CHECKLIST.length - 1, i + 1))}
            disabled={isLast}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-35"
            style={{ backgroundColor: phase.color }}
          >
            Next <ArrowRight size={14} />
          </button>
        </div>
      </section>

      <OnboardingFilm />

      <section className="rounded-2xl border border-[rgb(var(--rule)/0.12)] p-5">
        <h2 className="text-sm font-semibold text-ink-primary">New hire record</h2>
        <p className="mt-0.5 text-[12px] text-ink-tertiary">
          Captured at the top of the checklist. Not wired to the HRMS import yet, so these stay
          blank rather than showing invented details.
        </p>
        <dl className="mt-3 grid gap-x-8 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {CHECKLIST_HEADER_FIELDS.map((f) => (
            <div
              key={f}
              className="flex items-baseline gap-2 border-b border-dashed border-[rgb(var(--rule)/0.15)] pb-1.5"
            >
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

const isLastIndex = (i: number) => i === ONBOARDING_CHECKLIST.length - 1

/**
 * The walkthrough film. The onboarding roadmap is its visual spine, so it is a
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
      <p className="mt-0.5 max-w-[560px] text-[12px] text-ink-tertiary">{ONBOARDING_VIDEO.blurb}</p>
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
            <track kind="subtitles" srcLang="en" label="English" src={ONBOARDING_VIDEO.subtitles} />
          </video>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="text-sm font-medium text-white">Walkthrough not rendered yet</p>
            <p className="text-[12px] leading-relaxed text-white/70">
              Run <code className="rounded bg-white/15 px-1">node scripts/gen-onboarding-video.mjs</code>{' '}
              — free neural narration, no API key needed.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
