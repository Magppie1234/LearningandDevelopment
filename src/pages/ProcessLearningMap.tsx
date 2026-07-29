'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Search,
  Map,
  Building2,
  UserRound,
  Timer,
  AlertTriangle,
  ClipboardCheck,
  Gauge,
  GraduationCap,
  ChevronDown,
  ShieldAlert,
} from 'lucide-react'
import { MAP_FLOWS, stagesOf, competenciesFor, type MapStage, type RiskLevel } from '@/data/process-learning-map'

const RISK_STYLE: Record<RiskLevel, { label: string; cls: string }> = {
  low: { label: 'Low risk', cls: 'bg-surface-sage/20 text-ink-primary' },
  medium: { label: 'Medium risk', cls: 'bg-accent-gold/20 text-ink-primary' },
  high: { label: 'High risk', cls: 'bg-surface-rose/25 text-ink-primary' },
  critical: { label: 'Critical', cls: 'bg-surface-rose/40 text-ink-primary font-semibold' },
}

function StageDetail({ stage }: { stage: MapStage }) {
  const { learning, step } = stage
  const comps = competenciesFor(learning)
  return (
    <div className="grid gap-4 md:grid-cols-2 pt-4">
      <div className="space-y-3">
        <div className="flex items-start gap-2.5">
          <Building2 size={16} className="mt-0.5 text-accent-copper flex-shrink-0" />
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-tertiary">Owner department</p>
            <p className="text-sm text-ink-primary">{learning.department}</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <UserRound size={16} className="mt-0.5 text-accent-copper flex-shrink-0" />
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-tertiary">Role responsible</p>
            <p className="text-sm text-ink-primary">{learning.role}</p>
            <p className="text-xs text-ink-tertiary mt-0.5">Escalation: {learning.escalation}</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Timer size={16} className="mt-0.5 text-accent-copper flex-shrink-0" />
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-tertiary">SLA / TAT baseline</p>
            <p className="text-sm text-ink-primary">{learning.sla}</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <ClipboardCheck size={16} className="mt-0.5 text-accent-copper flex-shrink-0" />
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-tertiary">Assessment method</p>
            <p className="text-sm text-ink-primary">{learning.assessmentMethod}</p>
          </div>
        </div>
        {learning.kpis.length > 0 && (
          <div className="flex items-start gap-2.5">
            <Gauge size={16} className="mt-0.5 text-accent-copper flex-shrink-0" />
            <div>
              <p className="text-xs uppercase tracking-wide text-ink-tertiary">Linked KPIs</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {learning.kpis.map((k) => (
                  <span key={k} className="text-xs px-2 py-0.5 rounded-full bg-surface-blue/20 text-ink-primary">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="space-y-3">
        {step.disp && step.disp.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-tertiary mb-1.5">
              Dispositions & required captures
            </p>
            <div className="flex flex-wrap gap-1.5">
              {step.disp.map((d) => (
                <span
                  key={d.label}
                  className="text-xs px-2 py-0.5 rounded-full bg-[rgba(0,59,70,0.06)] text-ink-secondary"
                  title={d.desc}
                >
                  {d.label}
                </span>
              ))}
            </div>
          </div>
        )}
        {learning.commonMistakes.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-tertiary mb-1.5 flex items-center gap-1.5">
              <AlertTriangle size={13} className="text-surface-rose" /> Common mistakes
            </p>
            <ul className="space-y-1">
              {learning.commonMistakes.map((m) => (
                <li key={m} className="text-sm text-ink-secondary flex gap-2">
                  <span className="text-surface-rose mt-1 flex-shrink-0">•</span>
                  {m}
                </li>
              ))}
            </ul>
          </div>
        )}
        {comps.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-tertiary mb-1.5 flex items-center gap-1.5">
              <GraduationCap size={13} /> Linked competencies
            </p>
            <ul className="space-y-1">
              {comps.map((c) => (
                <li key={c.id} className="text-sm text-ink-secondary">
                  <span className="font-medium text-ink-primary">{c.name}</span> — {c.academy}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProcessLearningMap() {
  const [flowId, setFlowId] = useState(MAP_FLOWS[0].id)
  const [query, setQuery] = useState('')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const flow = MAP_FLOWS.find((f) => f.id === flowId) ?? MAP_FLOWS[0]
  const stages = useMemo(() => stagesOf(flow), [flow])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return stages
    return stages.filter(
      (s) =>
        s.step.t.toLowerCase().includes(q) ||
        s.step.d.toLowerCase().includes(q) ||
        s.learning.department.toLowerCase().includes(q) ||
        s.learning.role.toLowerCase().includes(q),
    )
  }, [stages, query])

  const byPhase = useMemo(() => {
    const groups: { name: string; color: string; stages: MapStage[] }[] = []
    for (const s of filtered) {
      const last = groups[groups.length - 1]
      if (last && last.name === s.phaseName) last.stages.push(s)
      else groups.push({ name: s.phaseName, color: s.phaseColor, stages: [s] })
    }
    return groups
  }, [filtered])

  return (
    <div className="max-w-5xl mx-auto px-5 py-8 space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-accent-copper flex items-center gap-2">
          <Map size={14} /> Process Learning Map
        </p>
        <h1 className="mt-2 text-2xl md:text-3xl font-semibold text-ink-primary">
          Every stage, taught — from lead to <em className="italic">order closed</em>
        </h1>
        <p className="mt-2 text-sm text-ink-secondary max-w-2xl">
          Click any stage to see who owns it, the SLA, the risk, the mistakes to avoid, how
          capability is assessed, and the competencies it maps to. The sequence is a configurable
          baseline from the live Magppie Process Flow — the approved process owner can change it.
        </p>
      </header>

      <div className="flex items-center gap-2 text-xs text-ink-secondary bg-accent-gold/15 border border-accent-gold/40 rounded-xl px-4 py-2.5">
        <ShieldAlert size={15} className="text-accent-copper flex-shrink-0" />
        SLA, ownership and assessment baselines are <strong className="mx-1">Sample – Requires SME Approval</strong>
        until validated by each Department Learning Champion.
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="flex gap-2">
          {MAP_FLOWS.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setFlowId(f.id)
                setOpenIndex(null)
              }}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                f.id === flowId
                  ? 'bg-ink-primary text-parchment'
                  : 'bg-[rgba(0,59,70,0.06)] text-ink-secondary hover:text-ink-primary',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 sm:max-w-xs sm:ml-auto">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stages, roles, departments…"
            className="w-full pl-9 pr-3 py-2 rounded-full bg-[rgba(0,59,70,0.05)] text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-accent-copper/40"
          />
        </div>
      </div>

      {byPhase.length === 0 && (
        <p className="text-sm text-ink-tertiary py-8 text-center">No stages match “{query}”.</p>
      )}

      {byPhase.map((group) => (
        <section key={`${flow.id}-${group.name}-${group.stages[0]?.index}`}>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-primary mb-3">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: group.color }} />
            {group.name}
            <span className="text-xs font-normal text-ink-tertiary">{group.stages.length} stages</span>
          </h2>
          <div className="space-y-2">
            {group.stages.map((s) => {
              const open = openIndex === s.index
              const risk = RISK_STYLE[s.learning.risk]
              return (
                <div
                  key={s.index}
                  className="rounded-2xl bg-white/70 dark:bg-white/5 border border-[rgba(0,59,70,0.08)] overflow-hidden"
                >
                  <button
                    onClick={() => setOpenIndex(open ? null : s.index)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left"
                  >
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-parchment flex-shrink-0"
                      style={{ backgroundColor: group.color }}
                    >
                      {s.index + 1}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-ink-primary truncate">{s.step.t}</span>
                      <span className="block text-xs text-ink-tertiary truncate">
                        {s.learning.department} · {s.learning.role}
                      </span>
                    </span>
                    <span className={cn('text-[11px] px-2 py-0.5 rounded-full flex-shrink-0', risk.cls)}>
                      {risk.label}
                    </span>
                    <ChevronDown
                      size={16}
                      className={cn('text-ink-tertiary transition-transform flex-shrink-0', open && 'rotate-180')}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-4 pb-4 border-t border-[rgba(0,59,70,0.06)]">
                          <p className="text-sm text-ink-secondary pt-3">{s.step.d}</p>
                          <StageDetail stage={s} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
