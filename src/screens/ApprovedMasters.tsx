'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ShieldCheck, ShieldAlert, BadgeCheck, Ban, AlertOctagon } from 'lucide-react'
import {
  MASTER_SECTIONS,
  PRODUCT_MASTER,
  PRICE_MASTER,
  CLAIMS_MASTER,
  WARRANTY_MASTER,
  TERMINOLOGY_MASTER,
  SAMPLE_LABEL,
  type MasterSectionId,
  type MasterMeta,
} from '@/data/approved-masters'

function MetaFooter({ meta }: { meta: MasterMeta }) {
  return (
    <div className="mt-3 pt-3 border-t border-[rgb(var(--rule)/0.06)] flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-ink-tertiary">
      <span>v{meta.version}</span>
      <span>Owner: {meta.owner}</span>
      <span>Source: {meta.source}</span>
      <span>Effective: {meta.effectiveDate}</span>
      <span>Review: {meta.reviewDate}</span>
    </div>
  )
}

function SampleBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-accent-gold/25 text-ink-primary font-medium">
      <ShieldAlert size={11} /> {SAMPLE_LABEL}
    </span>
  )
}

const USAGE_BADGE = {
  'approved-wording': { icon: BadgeCheck, label: 'Approved wording', cls: 'bg-surface-sage/25 text-ink-primary' },
  restricted: { icon: AlertOctagon, label: 'Restricted', cls: 'bg-accent-gold/25 text-ink-primary' },
  prohibited: { icon: Ban, label: 'Prohibited', cls: 'bg-surface-rose/30 text-ink-primary' },
} as const

export default function ApprovedMasters() {
  const [section, setSection] = useState<MasterSectionId>('products')

  return (
    <div className="max-w-4xl mx-auto px-5 py-8 space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-accent-copper flex items-center gap-2">
          <ShieldCheck size={14} /> Approved Masters
        </p>
        <h1 className="mt-2 text-2xl md:text-3xl font-semibold text-ink-primary">
          One version-controlled source of <em className="italic">truth</em>
        </h1>
        <p className="mt-2 text-sm text-ink-secondary max-w-2xl">
          Product series, prices, inclusions, claims, warranties and terminology must come from
          this master — never from memory or from public pages, which currently carry differing
          references. Every lesson, pitch and AI answer cites a record and version from here.
        </p>
      </header>

      <div className="rounded-xl border border-surface-rose/40 bg-surface-rose/10 px-4 py-3 text-sm text-ink-secondary">
        <strong className="text-ink-primary">Safeguard:</strong> treat all product benefits,
        scientific statements, prices, guarantees, specifications, load capacities, timelines and
        health claims as <em>company-approved claims</em>, not independently verified facts. AI
        may never invent, expand or modify a claim. Nothing below is citable in client
        communication until its status moves from Sample to Approved by a named SME and approver.
      </div>

      <div className="flex gap-2 flex-wrap">
        {MASTER_SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors',
              section === s.id
                ? 'bg-ink-primary text-parchment'
                : 'bg-[rgb(var(--rule)/0.06)] text-ink-secondary hover:text-ink-primary',
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {section === 'products' &&
          PRODUCT_MASTER.map((r) => (
            <article key={r.id} className="rounded-2xl bg-white/70 dark:bg-white/5 border border-[rgb(var(--rule)/0.08)] p-5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="text-lg font-semibold text-ink-primary">{r.series} Series</h2>
                <SampleBadge />
              </div>
              <p className="mt-2 text-sm text-ink-secondary">{r.positioning}</p>
              <p className="mt-1.5 text-sm text-ink-secondary">
                <span className="font-medium text-ink-primary">Construction:</span> {r.construction}
              </p>
              <p className="mt-1.5 text-xs text-ink-tertiary italic">{r.notes}</p>
              <MetaFooter meta={r.meta} />
            </article>
          ))}

        {section === 'prices' &&
          PRICE_MASTER.map((r) => (
            <article key={r.id} className="rounded-2xl bg-white/70 dark:bg-white/5 border border-[rgb(var(--rule)/0.08)] p-5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="text-lg font-semibold text-ink-primary">{r.series}</h2>
                <SampleBadge />
              </div>
              <p className="mt-2 text-sm text-ink-secondary">
                <span className="font-medium text-ink-primary">Basis:</span> {r.priceBasis}
              </p>
              <p className="mt-1 text-sm text-ink-secondary">
                <span className="font-medium text-ink-primary">Indicative price:</span> {r.indicativePrice}
              </p>
              <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-ink-tertiary mb-1">Inclusions</p>
                  <ul className="space-y-0.5 text-ink-secondary">
                    {r.inclusions.map((i) => (
                      <li key={i}>• {i}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-ink-tertiary mb-1">Exclusions</p>
                  <ul className="space-y-0.5 text-ink-secondary">
                    {r.exclusions.map((i) => (
                      <li key={i}>• {i}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <MetaFooter meta={r.meta} />
            </article>
          ))}

        {section === 'claims' &&
          CLAIMS_MASTER.map((r) => {
            const badge = USAGE_BADGE[r.usage]
            return (
              <article key={r.id} className="rounded-2xl bg-white/70 dark:bg-white/5 border border-[rgb(var(--rule)/0.08)] p-5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <span className={cn('inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium', badge.cls)}>
                    <badge.icon size={11} /> {badge.label}
                  </span>
                  <SampleBadge />
                </div>
                <p className="mt-2.5 text-sm font-medium text-ink-primary">{r.claim}</p>
                <p className="mt-1.5 text-sm text-ink-secondary">{r.guidance}</p>
                <MetaFooter meta={r.meta} />
              </article>
            )
          })}

        {section === 'warranty' &&
          WARRANTY_MASTER.map((r) => (
            <article key={r.id} className="rounded-2xl bg-white/70 dark:bg-white/5 border border-[rgb(var(--rule)/0.08)] p-5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="text-base font-semibold text-ink-primary">{r.item}</h2>
                <SampleBadge />
              </div>
              <p className="mt-2 text-sm text-ink-secondary">
                <span className="font-medium text-ink-primary">Coverage:</span> {r.coverage}
              </p>
              <p className="mt-1 text-sm text-ink-secondary">
                <span className="font-medium text-ink-primary">Duration:</span> {r.duration}
              </p>
              <MetaFooter meta={r.meta} />
            </article>
          ))}

        {section === 'terminology' &&
          TERMINOLOGY_MASTER.map((r) => (
            <article key={r.id} className="rounded-2xl bg-white/70 dark:bg-white/5 border border-[rgb(var(--rule)/0.08)] p-5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="text-base font-semibold text-ink-primary">{r.term}</h2>
                <SampleBadge />
              </div>
              <p className="mt-2 text-sm text-ink-secondary">{r.definition}</p>
              <p className="mt-1.5 text-sm text-ink-secondary">
                <span className="font-medium text-surface-rose">Avoid:</span> {r.avoid}
              </p>
              <MetaFooter meta={r.meta} />
            </article>
          ))}
      </div>
    </div>
  )
}
