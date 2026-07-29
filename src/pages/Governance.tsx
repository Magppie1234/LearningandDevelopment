'use client'

import { cn } from '@/lib/utils'
import { Landmark, CalendarClock, FileCheck2, RefreshCcw, Users } from 'lucide-react'
import {
  GOVERNANCE_ROLES,
  GOVERNANCE_CADENCE,
  PUBLISH_METADATA_FIELDS,
  CONTENT_WORKFLOW,
  LEARNING_CYCLE,
} from '@/data/governance'

const SCOPE_STYLE: Record<string, string> = {
  executive: 'bg-accent-gold/25 text-ink-primary',
  programme: 'bg-surface-blue/25 text-ink-primary',
  department: 'bg-surface-sage/25 text-ink-primary',
  quality: 'bg-surface-rose/25 text-ink-primary',
  operations: 'bg-[rgba(0,59,70,0.08)] text-ink-primary',
}

export default function Governance() {
  return (
    <div className="max-w-4xl mx-auto px-5 py-8 space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-accent-copper flex items-center gap-2">
          <Landmark size={14} /> L&D Governance
        </p>
        <h1 className="mt-2 text-2xl md:text-3xl font-semibold text-ink-primary">
          Systemised learning, <em className="italic">without</em> an L&D Manager
        </h1>
        <p className="mt-2 text-sm text-ink-secondary max-w-2xl">
          Magppie runs a federated human-governance model: twelve named roles share the learning
          responsibility, a fixed cadence keeps it honest, and nothing publishes without an owner,
          source, version and approval. AI drafts; humans approve.
        </p>
      </header>

      {/* Learning cycle */}
      <section className="rounded-2xl bg-white/70 dark:bg-white/5 border border-[rgba(0,59,70,0.08)] p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-primary mb-3">
          <RefreshCcw size={15} className="text-accent-copper" /> The learning cycle
        </h2>
        <div className="flex flex-wrap items-center gap-1.5">
          {LEARNING_CYCLE.map((step, i) => (
            <span key={step} className="flex items-center gap-1.5">
              <span className="text-sm px-3 py-1 rounded-full bg-ink-primary text-parchment">{step}</span>
              {i < LEARNING_CYCLE.length - 1 && <span className="text-ink-tertiary text-xs">›</span>}
            </span>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-primary mb-3">
          <Users size={15} className="text-accent-copper" /> Governance roles
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {GOVERNANCE_ROLES.map((r) => (
            <article key={r.id} className="rounded-2xl bg-white/70 dark:bg-white/5 border border-[rgba(0,59,70,0.08)] p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-ink-primary">{r.title}</h3>
                <span className={cn('text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full', SCOPE_STYLE[r.scope])}>
                  {r.scope}
                </span>
              </div>
              <ul className="mt-2 space-y-1">
                {r.responsibilities.map((resp) => (
                  <li key={resp} className="text-xs text-ink-secondary flex gap-1.5">
                    <span className="text-accent-copper mt-0.5 flex-shrink-0">•</span>
                    {resp}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* Cadence */}
      <section>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-primary mb-3">
          <CalendarClock size={15} className="text-accent-copper" /> Review cadence
        </h2>
        <div className="space-y-2">
          {GOVERNANCE_CADENCE.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl bg-white/70 dark:bg-white/5 border border-[rgba(0,59,70,0.08)] px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-accent-copper sm:w-24 flex-shrink-0">
                {c.frequency}
              </span>
              <span className="text-sm font-medium text-ink-primary sm:w-64 flex-shrink-0">{c.name}</span>
              <span className="text-xs text-ink-secondary">{c.purpose}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Publishing rules */}
      <section className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white/70 dark:bg-white/5 border border-[rgba(0,59,70,0.08)] p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-primary mb-3">
            <FileCheck2 size={15} className="text-accent-copper" /> Every published object carries
          </h2>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {PUBLISH_METADATA_FIELDS.map((f) => (
              <li key={f} className="text-xs text-ink-secondary flex gap-1.5">
                <span className="text-surface-sage mt-0.5 flex-shrink-0">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-white/70 dark:bg-white/5 border border-[rgba(0,59,70,0.08)] p-5">
          <h2 className="text-sm font-semibold text-ink-primary mb-3">Content lifecycle</h2>
          <ol className="space-y-1.5">
            {CONTENT_WORKFLOW.map((step, i) => (
              <li key={step} className="text-xs text-ink-secondary flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[rgba(0,59,70,0.08)] text-ink-primary flex items-center justify-center text-[10px] font-semibold flex-shrink-0">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  )
}
