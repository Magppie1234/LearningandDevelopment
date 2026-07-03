'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowDown, Check, X, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BD_MODULES } from '@/data/bd-academy'
import { BdPitchFlowDiagram, BdObjectionTreeDiagram } from '@/components/BdFlowDiagram'

/**
 * Per-module visuals (graphs / flow charts) for the BD academy. EVERY fact,
 * label and number here comes verbatim from the approved module content in
 * bd-academy.ts — where a list/table block exists the data is pulled straight
 * from BD_MODULES so it can never drift; prose-derived facts are held as
 * constants annotated with their source. Nothing is invented.
 *
 * Modules 5 and 6 reuse the existing interactive diagrams in BdFlowDiagram.tsx.
 */

/* ── shared bits ───────────────────────────────────────────── */

function moduleBlocks(id: string) {
  return BD_MODULES.find((m) => m.id === id)?.blocks ?? []
}
function listItems(id: string): string[] {
  const b = moduleBlocks(id).find((x) => x.kind === 'list')
  return b && b.kind === 'list' ? b.items : []
}
function tableBlock(id: string) {
  const b = moduleBlocks(id).find((x) => x.kind === 'table')
  return b && b.kind === 'table' ? b : null
}

const CARD =
  'rounded-[12px] border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream'

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border-[0.5px] border-[rgba(0,59,70,0.14)] bg-[rgba(0,59,70,0.03)] px-2.5 py-1 text-[12px] text-ink-secondary">
      {children}
    </span>
  )
}

/* ── M1 — heritage timeline (click a milestone for detail) ──── */

const M1_MILESTONES = [
  { year: '50+ years', label: 'Group heritage', detail: 'Magppie Group has been in business for over 50 years.' },
  { year: '20+ years', label: 'In kitchens', detail: 'For the past 20+ years, the focus has been kitchens and wardrobes.' },
  { year: 'Late 2016', label: 'First SilverStone kitchen', detail: 'The first SilverStone kitchen was installed in late 2016 — giving 9+ years of real-world performance validation.' },
  { year: 'Feb 2026', label: 'KBIS award', detail: 'Won the Most Unexpected Innovation award at KBIS 2026 in Orlando — the world’s largest kitchen show — alongside Caesarstone and LG.' },
]

function HeritageTimeline() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className={cn(CARD, 'p-5')}>
      <div className="flex items-start gap-1">
        {M1_MILESTONES.map((m, i) => {
          const isOpen = open === i
          return (
            <div key={i} className="flex items-start flex-1 last:flex-none">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="group flex flex-col items-center text-center min-w-[76px]"
              >
                <span
                  className={cn(
                    'w-11 h-11 rounded-full flex items-center justify-center text-[12px] font-semibold transition-colors',
                    isOpen
                      ? 'bg-accent-gold text-ink-primary'
                      : 'bg-accent-gold/15 border border-accent-gold text-ink-primary group-hover:bg-accent-gold/25',
                  )}
                >
                  {i + 1}
                </span>
                <span className="mt-2 text-[13px] font-semibold text-ink-primary leading-tight">{m.year}</span>
                <span className="text-[11px] text-ink-tertiary leading-tight">{m.label}</span>
              </button>
              {i < M1_MILESTONES.length - 1 && (
                <div className="flex-1 h-px bg-accent-gold/40 mx-1 min-w-[16px] mt-[22px]" />
              )}
            </div>
          )
        })}
      </div>
      <AnimatePresence initial={false}>
        {open !== null && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-[13px] text-ink-secondary leading-relaxed pt-4">{M1_MILESTONES[open].detail}</p>
          </motion.div>
        )}
      </AnimatePresence>
      <p className="mt-4 text-center text-[12px] text-ink-tertiary italic">
        One unified story — always lead with this order; click a milestone for detail.
      </p>
    </div>
  )
}

/* ── M2 — SilverStone process flow ─────────────────────────── */

const M2_STEPS = ['Porcelain clay', 'Heated to 1,300°C', 'Infused with silver + copper nano-particles', 'SilverStone']
const M2_PROPS = ['0% wood', 'Non-porous', 'Anti-bacterial', 'Anti-fungal', 'Stain-proof', 'Scratch-resistant', 'Impact-resistant', '100% food-grade']

function SilverStoneProcess() {
  return (
    <div className={cn(CARD, 'p-5')}>
      <div className="flex flex-col sm:flex-row sm:items-stretch gap-2">
        {M2_STEPS.map((s, i) => (
          <div key={i} className="flex items-center sm:flex-col sm:items-stretch gap-2 flex-1">
            <div
              className={cn(
                'flex-1 rounded-[10px] px-3 py-3 text-center text-[13px] font-medium',
                i === M2_STEPS.length - 1
                  ? 'bg-accent-gold/15 border border-accent-gold text-ink-primary'
                  : 'bg-[rgba(0,59,70,0.04)] text-ink-secondary',
              )}
            >
              {s}
            </div>
            {i < M2_STEPS.length - 1 && (
              <>
                <ArrowRight size={16} className="hidden sm:block text-ink-tertiary self-center shrink-0" />
                <ArrowDown size={16} className="sm:hidden text-ink-tertiary shrink-0" />
              </>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {M2_PROPS.map((p) => (
          <Chip key={p}>{p}</Chip>
        ))}
      </div>
    </div>
  )
}

/* ── M3 — 7 safety pillars (badge grid, proof always shown) ── */

function SafetyPillars() {
  const items = listItems('bd-m3') // 7 ordered "Title — proof" strings, exact order
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {items.map((raw, i) => {
        const [title, ...rest] = raw.split(' — ')
        const proof = rest.join(' — ')
        return (
          <div
            key={i}
            className="rounded-[12px] border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream px-4 py-3"
          >
            <div className="flex items-center gap-2.5">
              <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold bg-accent-gold/15 border border-accent-gold text-ink-primary">
                {i + 1}
              </span>
              <span className="flex-1 text-sm font-semibold text-ink-primary">{title}</span>
            </div>
            <p className="text-[12.5px] text-ink-secondary leading-relaxed pl-[34px] pt-1">{proof}</p>
          </div>
        )
      })}
    </div>
  )
}

/* ── M4 — award spotlight + clientele ──────────────────────── */

const M4_CLIENTELE = [
  'Mukesh Ambani', 'Anant Ambani', 'M.S. Dhoni', 'Harbhajan Singh', 'Ranbir Kapoor',
  'Shilpa Shetty', 'Chiranjeevi', 'Akhil Akkineni', 'Peyush Bansal', 'Rizwan Sajan',
]

function AwardSpotlight() {
  return (
    <div className="space-y-3">
      <div className={cn(CARD, 'p-5 flex items-start gap-4')}>
        <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-accent-gold/15 border border-accent-gold">
          <ShieldCheck size={22} className="text-ink-primary" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">KBIS 2026 · Orlando, USA</p>
          <p className="text-base font-semibold text-ink-primary">Most Unexpected Innovation</p>
          <p className="text-[13px] text-ink-secondary mt-0.5">
            Won at the world’s largest Kitchen &amp; Bath Industry Show, alongside global leaders Caesarstone and LG.
          </p>
        </div>
      </div>
      <div className={cn(CARD, 'p-4')}>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary mb-2.5">
          Trusted by — use 2–3 names max per call, never read the full list
        </p>
        <div className="flex flex-wrap gap-1.5">
          {M4_CLIENTELE.map((c) => (
            <Chip key={c}>{c}</Chip>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── M7 — SilverStone vs granite vs tiles (comparison table) ── */

// 'y' = yes/has the attribute, 'n' = no, '-' = not stated in the source.
// Attributes framed positively so a check always reads as the better answer.
const M7_COLS = ['SilverStone', 'Granite', 'Tiles'] as const
const M7_ROWS: { attr: string; vals: ('y' | 'n' | '-')[] }[] = [
  { attr: 'Non-porous', vals: ['y', 'n', '-'] },
  { attr: 'Maintenance-free (no polishing)', vals: ['y', 'n', '-'] },
  { attr: 'No grout lines', vals: ['y', '-', 'n'] },
  { attr: 'Food-grade / hygienic', vals: ['y', 'n', 'n'] },
]

function CmpCell({ v }: { v: 'y' | 'n' | '-' }) {
  if (v === 'y')
    return <Check size={16} className="mx-auto" style={{ color: 'var(--status-ontrack-fg)' }} />
  if (v === 'n')
    return <X size={16} className="mx-auto" style={{ color: 'var(--status-overdue-fg)' }} />
  return <span className="text-ink-tertiary">—</span>
}

function ComparisonMatrix() {
  return (
    <div className="space-y-2">
      <div className={cn(CARD, 'overflow-hidden')}>
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b-[0.5px] border-[rgba(0,59,70,0.14)]">
                <th className="text-left font-semibold text-ink-tertiary px-4 py-2.5">Attribute</th>
                {M7_COLS.map((c, i) => (
                  <th
                    key={c}
                    className={cn(
                      'font-semibold px-3 py-2.5 text-center',
                      i === 0 ? 'text-ink-primary bg-accent-gold/10' : 'text-ink-secondary',
                    )}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {M7_ROWS.map((row) => (
                <tr key={row.attr} className="border-b-[0.5px] border-[rgba(0,59,70,0.06)] last:border-0">
                  <td className="text-ink-secondary px-4 py-2.5">{row.attr}</td>
                  {row.vals.map((v, i) => (
                    <td key={i} className={cn('text-center px-3 py-2.5', i === 0 && 'bg-accent-gold/10')}>
                      <CmpCell v={v} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-[11px] text-ink-tertiary px-1">— = not covered in the source material.</p>
      <div className="flex flex-wrap gap-1.5">
        <Chip>Engineered, not natural</Chip>
        <Chip>Hardware load-bearing 100+ kg</Chip>
        <Chip>Baked at 1,300°C</Chip>
      </div>
    </div>
  )
}

/* ── M8 — payment split + guarantees ───────────────────────── */

const M8_PAYMENT = [
  { label: 'Advance', pct: 50, color: 'var(--status-ontrack-fg)' },
  { label: 'Before dispatch', pct: 40, color: 'rgb(var(--m-accent-copper))' },
  { label: 'After installation', pct: 10, color: 'rgba(0,59,70,0.35)' },
]
const M8_GUARANTEES = [
  { label: 'Stone guarantee', years: 25 },
  { label: 'Hardware guarantee', years: 10 },
  { label: 'Lighting guarantee', years: 2 },
]

const M8_MATERIAL = [
  { label: 'Compressed wood', rs: 100, note: '≈ ₹100/sq.ft.', accent: false },
  { label: 'SilverStone', rs: 500, note: '≈ ₹500/sq.ft.', accent: true },
]

function PricingCharts() {
  return (
    <div className="space-y-3">
      <div className={cn(CARD, 'p-5')}>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary mb-1">
          Material cost per sq.ft.
        </p>
        <p className="text-[12px] text-ink-tertiary mb-3">
          The material is ~5× the cost of compressed wood — reframe around lifetime value, not sticker price.
        </p>
        <div className="space-y-2.5">
          {M8_MATERIAL.map((m) => (
            <div key={m.label} className="flex items-center gap-3">
              <span className="w-32 shrink-0 text-[12.5px] text-ink-secondary">{m.label}</span>
              <div className="flex-1 h-4 rounded-full bg-[rgba(0,59,70,0.06)] overflow-hidden">
                <div
                  className={cn('h-full rounded-full', m.accent ? 'bg-accent-gold' : 'bg-[rgba(0,59,70,0.3)]')}
                  style={{ width: `${(m.rs / 500) * 100}%` }}
                />
              </div>
              <span className="w-24 text-right text-[12.5px] font-semibold text-ink-primary tabular-nums">
                {m.note}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={cn(CARD, 'p-5')}>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary mb-3">Payment schedule</p>
        <div className="flex h-8 w-full overflow-hidden rounded-lg">
          {M8_PAYMENT.map((s) => (
            <div
              key={s.label}
              className="flex items-center justify-center text-[11px] font-semibold text-white"
              style={{ width: `${s.pct}%`, backgroundColor: s.color }}
            >
              {s.pct}%
            </div>
          ))}
        </div>
        <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
          {M8_PAYMENT.map((s) => (
            <span key={s.label} className="flex items-center gap-1.5 text-[12px] text-ink-secondary">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
              {s.pct}% {s.label}
            </span>
          ))}
        </div>
      </div>

      <div className={cn(CARD, 'p-5')}>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary mb-3">Guarantees</p>
        <div className="space-y-2.5">
          {M8_GUARANTEES.map((g) => (
            <div key={g.label} className="flex items-center gap-3">
              <span className="w-32 shrink-0 text-[12.5px] text-ink-secondary">{g.label}</span>
              <div className="flex-1 h-2.5 rounded-full bg-[rgba(0,59,70,0.06)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent-gold"
                  style={{ width: `${(g.years / 25) * 100}%` }}
                />
              </div>
              <span className="w-14 text-right text-[12.5px] font-semibold text-ink-primary tabular-nums">
                {g.years} yr{g.years > 1 ? 's' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Chip>Kitchen ₹8,400–10,800/sq.ft.</Chip>
        <Chip>Wardrobe ₹7,320/sq.ft.</Chip>
        <Chip>10×10 kitchen ≈ ₹12–15 lakhs</Chip>
        <Chip>Install in 3–4 months</Chip>
      </div>
    </div>
  )
}

/* ── M9 — forbidden → replacement swaps ────────────────────── */

function CommunicationSwaps() {
  const table = tableBlock('bd-m9') // columns: [Forbidden, Use instead]
  const rows = table?.rows ?? []
  return (
    <div className="space-y-3">
      <div className={cn(CARD, 'p-4')}>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary mb-2">
          Turn statements into questions
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-[13px]">
          <span className="flex-1 rounded-[10px] bg-[rgba(0,59,70,0.04)] px-3 py-2 text-ink-secondary">
            “These are the most commonly used materials.”
          </span>
          <ArrowRight size={16} className="hidden sm:block text-ink-tertiary shrink-0" />
          <ArrowDown size={16} className="sm:hidden text-ink-tertiary" />
          <span
            className="flex-1 rounded-[10px] px-3 py-2"
            style={{ backgroundColor: 'var(--status-ontrack-bg)', color: 'var(--status-ontrack-fg)' }}
          >
            “These are the most commonly used materials, right sir?”
          </span>
        </div>
      </div>

      <div className={cn(CARD, 'p-4')}>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary mb-2.5">
          Forbidden word → what to say instead
        </p>
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 text-[12.5px]">
              <span
                className="sm:w-52 shrink-0 rounded-md px-2.5 py-1.5 line-through"
                style={{ backgroundColor: 'var(--status-overdue-bg)', color: 'var(--status-overdue-fg)' }}
              >
                {r[0]}
              </span>
              <ArrowRight size={14} className="hidden sm:block text-ink-tertiary shrink-0" />
              <span className="flex-1 text-ink-secondary">{r[1]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── M10 — escalation decision flow ────────────────────────── */

const M10_TRIGGERS = [
  'Discount / final-price request',
  'Legal action or a complaint',
  'Custom dimensions (needs CAD review)',
  'Angry customer after two attempts',
  'Partnership / dealership / B2B',
  'Refund or cancellation',
  'A question not covered after two attempts',
]

function EscalationFlow() {
  return (
    <div className={cn(CARD, 'p-5')}>
      <div className="flex flex-col items-center">
        <div className="rounded-[10px] bg-ink-primary text-parchment px-4 py-2 text-[13px] font-semibold">
          Customer situation
        </div>
        <ArrowDown size={16} className="text-ink-tertiary my-1.5" />
        <div className="rounded-[10px] border-[0.5px] border-[rgba(0,59,70,0.14)] bg-[rgba(0,59,70,0.03)] px-4 py-2 text-[13px] font-medium text-ink-primary">
          Does it match any of these 7 triggers?
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {M10_TRIGGERS.map((t) => (
          <div
            key={t}
            className="flex items-start gap-2 rounded-[10px] px-3 py-2 text-[12.5px]"
            style={{ backgroundColor: 'var(--status-risk-bg)' }}
          >
            <ArrowRight size={13} className="mt-0.5 shrink-0" style={{ color: 'var(--status-risk-fg)' }} />
            <span style={{ color: 'var(--status-risk-fg)' }}>{t}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center mt-3">
        <ArrowDown size={16} className="text-ink-tertiary mb-1.5" />
        <div className="rounded-[10px] border border-accent-gold bg-accent-gold/10 px-4 py-2 text-[13px] font-semibold text-ink-primary">
          → Hand off to a human consultant immediately
        </div>
      </div>
    </div>
  )
}

/* ── router ────────────────────────────────────────────────── */

const VISUALS: Record<string, { label: string; render: () => React.ReactElement }> = {
  'bd-m1': { label: 'Company story — the one order to lead with', render: () => <HeritageTimeline /> },
  'bd-m2': { label: 'How SilverStone is made', render: () => <SilverStoneProcess /> },
  'bd-m3': { label: 'The 7 safety pillars — always presented in this order', render: () => <SafetyPillars /> },
  'bd-m4': { label: 'Award & trust at a glance', render: () => <AwardSpotlight /> },
  'bd-m5': { label: 'Pitch flow — click a stage to expand', render: () => <BdPitchFlowDiagram /> },
  'bd-m6': { label: 'Objection decision tree — click a branch to expand', render: () => <BdObjectionTreeDiagram /> },
  'bd-m7': { label: 'SilverStone vs. the alternatives', render: () => <ComparisonMatrix /> },
  'bd-m8': { label: 'Material cost, payment schedule & guarantees', render: () => <PricingCharts /> },
  'bd-m9': { label: 'How to phrase it', render: () => <CommunicationSwaps /> },
  'bd-m10': { label: 'When to escalate to a human', render: () => <EscalationFlow /> },
}

export function bdModuleHasVisual(moduleId: string): boolean {
  return moduleId in VISUALS
}
export function bdModuleVisualLabel(moduleId: string): string {
  return VISUALS[moduleId]?.label ?? ''
}

export default function BdModuleVisual({ moduleId }: { moduleId: string }) {
  const v = VISUALS[moduleId]
  if (!v) return null
  return v.render()
}
