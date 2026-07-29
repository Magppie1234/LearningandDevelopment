'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Activity,
  Gauge,
  Workflow,
  ClipboardCheck,
  Zap,
  ShieldAlert,
  Award,
  ListChecks,
  AlertTriangle,
} from 'lucide-react'
import { KPI_DICTIONARY, DASHBOARD_FILTERS } from '@/data/kpi-dictionary'
import { AUTOMATED_WORKFLOWS, NON_TRAINING_ROOT_CAUSES } from '@/data/automated-workflows'
import {
  ASSESSMENT_TYPES,
  THRESHOLD_RECOMMENDATIONS,
  ASSESSMENT_RULES,
  BLUEPRINT_FIELDS,
  CERTIFICATION_REQUIREMENTS,
  CERTIFICATION_LEVELS,
  CERTIFICATION_NAMING_RULE,
} from '@/data/assessment-rules'

const TABS = [
  { id: 'kpis', label: 'KPI Dictionary', icon: Gauge },
  { id: 'workflows', label: 'Automated Workflows', icon: Workflow },
  { id: 'assessment', label: 'Assessment & Certification', icon: ClipboardCheck },
] as const

type TabId = (typeof TABS)[number]['id']

const card = 'rounded-2xl bg-white/70 dark:bg-white/5 border border-[rgba(0,59,70,0.08)]'

function KpiTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-ink-secondary bg-accent-gold/15 border border-accent-gold/40 rounded-xl px-4 py-2.5">
        <ShieldAlert size={15} className="text-accent-copper flex-shrink-0" />
        Learning hours and logins are activity information, never evidence of capability. Every
        dashboard number must trace back to one of these definitions.
      </div>
      <div className="space-y-3">
        {KPI_DICTIONARY.map((k) => (
          <article key={k.id} className={cn(card, 'p-5')}>
            <h3 className="text-base font-semibold text-ink-primary">{k.name}</h3>
            <p className="mt-1 text-sm text-ink-secondary">{k.definition}</p>
            <p className="mt-2 text-sm font-mono text-ink-primary bg-[rgba(0,59,70,0.05)] rounded-lg px-3 py-2 overflow-x-auto">
              {k.formula}
            </p>
            <div className="mt-3 grid sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-ink-tertiary">
              <span>
                <strong className="text-ink-secondary">Numerator:</strong> {k.numerator}
              </span>
              <span>
                <strong className="text-ink-secondary">Denominator:</strong> {k.denominator}
              </span>
              <span>
                <strong className="text-ink-secondary">Owner:</strong> {k.owner}
              </span>
              <span>
                <strong className="text-ink-secondary">Source:</strong> {k.source}
              </span>
            </div>
            {k.notes && <p className="mt-2 text-xs italic text-ink-tertiary">{k.notes}</p>}
          </article>
        ))}
      </div>
      <div className={cn(card, 'p-5')}>
        <h3 className="text-sm font-semibold text-ink-primary mb-2">
          Filters every dashboard must support
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {DASHBOARD_FILTERS.map((f) => (
            <span key={f} className="text-xs px-2.5 py-1 rounded-full bg-[rgba(0,59,70,0.06)] text-ink-secondary">
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function WorkflowsTab() {
  return (
    <div className="space-y-4">
      {AUTOMATED_WORKFLOWS.map((w) => (
        <article key={w.id} className={cn(card, 'p-5')}>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <h3 className="text-base font-semibold text-ink-primary">{w.name}</h3>
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-surface-blue/20 text-ink-primary">
              <Zap size={12} /> {w.trigger}
            </span>
          </div>
          <ol className="mt-3 flex flex-wrap items-center gap-1.5">
            {w.steps.map((s, i) => (
              <li key={s} className="flex items-center gap-1.5">
                <span className="text-xs px-2.5 py-1 rounded-full bg-[rgba(0,59,70,0.06)] text-ink-secondary">
                  {s}
                </span>
                {i < w.steps.length - 1 && <span className="text-ink-tertiary text-xs">›</span>}
              </li>
            ))}
          </ol>
          <ul className="mt-3 space-y-1">
            {w.guards.map((g) => (
              <li key={g} className="text-xs text-ink-secondary flex gap-1.5">
                <ShieldAlert size={13} className="text-accent-copper mt-0.5 flex-shrink-0" />
                {g}
              </li>
            ))}
          </ul>
        </article>
      ))}
      <div className={cn(card, 'p-5')}>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-primary mb-2">
          <AlertTriangle size={15} className="text-accent-copper" /> Non-training root causes
        </h3>
        <p className="text-xs text-ink-secondary mb-2.5">
          A performance gap is not automatically a training gap. Before assigning learning, the
          incident workflow checks these causes — each routes to its owner, not to a course:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {NON_TRAINING_ROOT_CAUSES.map((c) => (
            <span key={c} className="text-xs px-2.5 py-1 rounded-full bg-surface-rose/15 text-ink-secondary">
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function AssessmentTab() {
  return (
    <div className="space-y-4">
      <div className={cn(card, 'p-5')}>
        <h3 className="text-sm font-semibold text-ink-primary mb-3">
          Pass thresholds — configurable starting recommendations
        </h3>
        <p className="text-xs text-ink-secondary mb-3">
          There is no universal pass percentage. Each threshold is stored with its rationale,
          approving panel, pilot evidence and review date, and needs SME approval to go live.
        </p>
        <div className="space-y-2">
          {THRESHOLD_RECOMMENDATIONS.map((t) => (
            <div key={t.id} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 border-b border-[rgba(0,59,70,0.06)] last:border-0 pb-2 last:pb-0">
              <span className="text-sm font-semibold text-accent-copper sm:w-56 flex-shrink-0">{t.threshold}</span>
              <span className="text-sm text-ink-primary sm:w-72 flex-shrink-0">{t.scope}</span>
              <span className="text-xs text-ink-tertiary">{t.rationale}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className={cn(card, 'p-5')}>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-primary mb-2">
            <ListChecks size={15} className="text-accent-copper" /> Engine rules
          </h3>
          <ul className="space-y-1.5">
            {ASSESSMENT_RULES.map((r) => (
              <li key={r} className="text-xs text-ink-secondary flex gap-1.5">
                <span className="text-surface-sage mt-0.5 flex-shrink-0">✓</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
        <div className={cn(card, 'p-5')}>
          <h3 className="text-sm font-semibold text-ink-primary mb-2">Every blueprint contains</h3>
          <ul className="space-y-1.5">
            {BLUEPRINT_FIELDS.map((f) => (
              <li key={f} className="text-xs text-ink-secondary flex gap-1.5">
                <span className="text-accent-copper mt-0.5 flex-shrink-0">•</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={cn(card, 'p-5')}>
        <h3 className="text-sm font-semibold text-ink-primary mb-2">Assessment types</h3>
        <div className="flex flex-wrap gap-1.5">
          {ASSESSMENT_TYPES.map((t) => (
            <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-[rgba(0,59,70,0.06)] text-ink-secondary">
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className={cn(card, 'p-5')}>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-primary mb-2">
          <Award size={15} className="text-accent-copper" /> Certification
        </h3>
        <p className="text-xs text-ink-secondary mb-2.5">
          A quiz is never the only proof of competence for operational roles. Certification may
          require:
        </p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {CERTIFICATION_REQUIREMENTS.map((r) => (
            <span key={r} className="text-xs px-2.5 py-1 rounded-full bg-surface-sage/20 text-ink-secondary">
              {r}
            </span>
          ))}
        </div>
        <div className="space-y-1.5 mb-3">
          {CERTIFICATION_LEVELS.map((l) => (
            <div key={l.level} className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3">
              <span className="text-sm font-medium text-ink-primary sm:w-36 flex-shrink-0">{l.level}</span>
              <span className="text-xs text-ink-tertiary">{l.meaning}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-ink-secondary bg-surface-rose/10 border border-surface-rose/30 rounded-lg px-3 py-2">
          {CERTIFICATION_NAMING_RULE}
        </p>
      </div>
    </div>
  )
}

export default function LearningOps() {
  const [tab, setTab] = useState<TabId>('kpis')

  return (
    <div className="max-w-4xl mx-auto px-5 py-8 space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-accent-copper flex items-center gap-2">
          <Activity size={14} /> Learning Ops
        </p>
        <h1 className="mt-2 text-2xl md:text-3xl font-semibold text-ink-primary">
          The rules the system <em className="italic">runs on</em>
        </h1>
        <p className="mt-2 text-sm text-ink-secondary max-w-2xl">
          How every KPI is calculated, which workflows run automatically, and the assessment and
          certification rules that keep a watched video from counting as capability.
        </p>
      </header>

      <div className="flex gap-2 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors',
              tab === t.id
                ? 'bg-ink-primary text-parchment'
                : 'bg-[rgba(0,59,70,0.06)] text-ink-secondary hover:text-ink-primary',
            )}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'kpis' && <KpiTab />}
      {tab === 'workflows' && <WorkflowsTab />}
      {tab === 'assessment' && <AssessmentTab />}
    </div>
  )
}
