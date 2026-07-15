'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Award, ChevronDown, AlertTriangle, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  IMMERSION_MODULES,
  IMMERSION_PHASES,
  IMMERSION_RULES,
  type ImmersionModule,
  type ImmersionStatus,
} from '@/data/immersion-programme'

/**
 * Magppie Immersion Programme tracker (/onboarding/immersion) — the team's
 * Google Sheet as a living tracker: 14 modules, 4 colour-coded phases,
 * click-to-cycle status (persisted locally), expandable module detail, and
 * the sheet's own sequence rules. Phases unlock in order, mirroring the
 * sheet's "complete in phase sequence" rule.
 */

const STORAGE_KEY = 'magppie-immersion-progress-v1'

const STATUS_META: Record<ImmersionStatus, { label: string; bg: string; fg: string }> = {
  not_started: { label: 'Not started', bg: '#F2F2F2', fg: '#6b6b6b' },
  in_progress: { label: 'In progress', bg: '#FFF3CD', fg: '#8a6d1a' },
  completed: { label: 'Completed', bg: '#D4EDDA', fg: '#1E7C45' },
}

const NEXT: Record<ImmersionStatus, ImmersionStatus> = {
  not_started: 'in_progress',
  in_progress: 'completed',
  completed: 'not_started',
}

function Detail({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-tertiary">{label}</p>
      <p className="text-[12.5px] text-ink-secondary leading-relaxed mt-0.5">{text}</p>
    </div>
  )
}

export default function ImmersionProgramme() {
  const [status, setStatus] = useState<Record<string, ImmersionStatus>>({})
  const [openId, setOpenId] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setStatus(JSON.parse(raw) as Record<string, ImmersionStatus>)
    } catch {
      /* fresh start */
    }
    setHydrated(true)
  }, [])

  function cycle(id: string) {
    setStatus((prev) => {
      const next = { ...prev, [id]: NEXT[prev[id] ?? 'not_started'] }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  // Phase N+1 unlocks when every module of phase N is completed (sheet rule 1).
  const unlockedPhase = useMemo(() => {
    for (let p = 1; p <= 4; p++) {
      const mods = IMMERSION_MODULES.filter((m) => m.phase === p)
      if (!mods.every((m) => status[m.id] === 'completed')) return p
    }
    return 4
  }, [status])

  const doneCount = IMMERSION_MODULES.filter((m) => status[m.id] === 'completed').length
  const pct = Math.round((doneCount / IMMERSION_MODULES.length) * 100)

  if (!hydrated) return null

  return (
    <div className="max-w-[900px] mx-auto space-y-8">
      <section className="pb-6 border-b border-[rgba(0,59,70,0.08)]">
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-1.5 text-sm text-ink-tertiary hover:text-ink-primary transition-colors mb-3"
        >
          <ArrowLeft size={15} /> Onboarding
        </Link>
        <h1 className="font-serif text-4xl font-normal text-ink-primary">Magppie Immersion Programme</h1>
        <p className="text-sm text-ink-secondary mt-2 max-w-[680px]">
          14 modules across 4 phases (~30 working days) — for new joiners and existing employees,
          all departments, Magppie Living &amp; SUNROOOF. Phases unlock in sequence; each module
          needs a reviewer sign-off.
        </p>
        <div className="mt-4 flex items-center gap-3 max-w-[520px]">
          <div className="flex-1 h-2.5 bg-cream rounded-full overflow-hidden">
            <div className="h-full bg-surface-sage rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-sm font-semibold text-ink-primary tabular-nums">
            {doneCount}/{IMMERSION_MODULES.length}
          </span>
        </div>
        {/* Terminology conflict — surfaced, never silently resolved */}
        <div
          className="mt-4 flex items-start gap-2.5 rounded-xl px-4 py-3 max-w-[680px]"
          style={{ backgroundColor: 'var(--status-risk-bg)' }}
        >
          <AlertTriangle size={15} className="shrink-0 mt-0.5" style={{ color: 'var(--status-risk-fg)' }} />
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--status-risk-fg)' }}>
            <strong>[CONFIRM TERMINOLOGY]</strong> — this programme mandates “sintered stone” /
            “nanoparticles” and forbids “Silverstone” / “nanotechnology”, which conflicts with the
            AI Bot Master Training Document (“SilverStone”) the Sales Academy is built on. Awaiting
            leadership guidance on which standard applies where.
          </p>
        </div>
      </section>

      {[1, 2, 3, 4].map((phase) => {
        const meta = IMMERSION_PHASES[phase]
        const mods = IMMERSION_MODULES.filter((m) => m.phase === phase)
        const locked = phase > unlockedPhase
        return (
          <motion.section
            key={phase}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: phase * 0.05 }}
            className={cn(
              'rounded-2xl border overflow-hidden shadow-card',
              locked ? 'border-[rgba(0,59,70,0.06)] opacity-60' : 'border-[rgba(0,59,70,0.08)]',
            )}
            style={{ backgroundColor: meta.bg }}
          >
            <header className="flex items-center justify-between px-5 py-4 border-b border-black/[0.05]">
              <div>
                <p className="text-sm font-semibold" style={{ color: meta.fg }}>
                  Phase {phase} — {meta.title}
                </p>
                <p className="text-[11px] text-ink-tertiary mt-0.5">{meta.blurb}</p>
              </div>
              {locked && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-tertiary">
                  <Lock size={13} /> Complete Phase {phase - 1} to unlock
                </span>
              )}
            </header>

            <ul className="divide-y divide-black/[0.04]">
              {mods.map((m: ImmersionModule) => {
                const s = status[m.id] ?? 'not_started'
                const sm = STATUS_META[s]
                const open = openId === m.id
                return (
                  <li key={m.id} className="bg-white/45">
                    <div className="flex items-center gap-3 px-5 py-3">
                      <span className="text-[11px] font-semibold tabular-nums w-8 shrink-0" style={{ color: meta.fg }}>
                        {m.id}
                      </span>
                      <button
                        type="button"
                        onClick={() => setOpenId(open ? null : m.id)}
                        className="flex-1 min-w-0 text-left group"
                        aria-expanded={open}
                      >
                        <span className="block text-sm font-medium text-ink-primary truncate group-hover:underline">
                          {m.name}
                        </span>
                        <span className="block text-[11px] text-ink-tertiary mt-0.5 truncate">
                          {m.department} · {m.duration} · {m.assessment}
                        </span>
                      </button>
                      <button
                        type="button"
                        disabled={locked}
                        onClick={() => cycle(m.id)}
                        title="Click to change status"
                        className={cn(
                          'shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-transform',
                          locked ? 'cursor-not-allowed' : 'hover:scale-105',
                        )}
                        style={{ backgroundColor: sm.bg, color: sm.fg }}
                      >
                        {sm.label}
                      </button>
                      <ChevronDown
                        size={15}
                        className={cn('shrink-0 text-ink-tertiary transition-transform', open && 'rotate-180')}
                      />
                    </div>
                    {open && (
                      <div className="px-5 pb-4 pl-16 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                        <Detail label="What it is" text={m.description} />
                        <Detail label="You will be able to…" text={m.objective} />
                        <Detail label="Activity / task" text={m.activity} />
                        <Detail label="Submission" text={m.submission} />
                        <Detail label="Evaluation criteria" text={m.evaluation} />
                        {m.notes && <Detail label="Notes" text={m.notes} />}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </motion.section>
        )
      })}

      <section className="rounded-2xl border border-[rgba(0,59,70,0.08)] bg-cream shadow-card p-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink-primary mb-3">
          <Award size={16} className="text-accent-copper" /> Programme rules
        </p>
        <ul className="space-y-1.5">
          {IMMERSION_RULES.map((r, i) => (
            <li key={i} className="text-[12.5px] text-ink-secondary leading-relaxed">
              {i + 1}. {r}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
