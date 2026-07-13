'use client'

import { useMemo } from 'react'
import { SALES_MODULES } from '@/data/sales-academy'
import { SALES_FAQ_ITEMS, salesFaqTypeCounts } from '@/lib/sales-faq/faq-data'
import type { FaqItem } from '@/lib/bd-faq/faq-data'
import FaqVisual from '@/components/bd-faq/FaqVisual'
import FaqAccordion from '@/components/bd-faq/FaqAccordion'
import SalesVideoPlayer from '@/components/SalesVideoPlayer'

/**
 * Sales Academy FAQ — built the same way as the BD FAQ: every question runs
 * through the FaqVisual dispatcher, grouped by the Sales module its content
 * comes from. Diagram-shaped answers (flows, decisions, comparisons, charts,
 * cards) get their own visual card; single-fact answers collapse into one
 * accordion per group. All content restates SALES_MODULES verbatim-derived
 * text; the [CONFIRM PAYMENT SPLIT] / [CONFIRM YEAR] / [VERIFY: Red Dot]
 * flags stay visible and unresolved.
 */

const MODULE_ORDER = ['sa-m1', 'sa-m2', 'sa-m3', 'sa-m4', 'sa-m5', 'sa-m6', 'sa-m7', 'sa-m8', 'sa-m10']

function moduleTitle(id: string): string {
  const m = SALES_MODULES.find((x) => x.id === id)
  return m ? `${m.number}. ${m.title}` : id
}

function Section({ moduleId, items }: { moduleId: string; items: FaqItem[] }) {
  const visuals = items.filter((i) => i.type !== 'accordion')
  const plain = items.filter((i) => i.type === 'accordion')
  return (
    <section aria-label={moduleTitle(moduleId)}>
      <h2 className="text-[15px] font-semibold text-ink-primary mb-1">{moduleTitle(moduleId)}</h2>
      <p className="text-[12px] text-ink-tertiary mb-3">
        {items.length} questions · {visuals.length} visual
      </p>
      <div className="space-y-3">
        {visuals.map((item) => (
          <FaqVisual key={item.id} item={item} />
        ))}
        {plain.length > 0 && <FaqAccordion items={plain} />}
      </div>
    </section>
  )
}

export default function SalesFaqPage() {
  const grouped = useMemo(() => {
    const map = new Map<string, FaqItem[]>()
    for (const item of SALES_FAQ_ITEMS) {
      const key = item.module ?? 'other'
      map.set(key, [...(map.get(key) ?? []), item])
    }
    return map
  }, [])

  const counts = salesFaqTypeCounts()

  return (
    <div className="max-w-[880px] mx-auto space-y-8">
      <div>
        <a
          href="/academy/sales/modules"
          className="inline-block mb-2 text-[12.5px] text-ink-tertiary hover:text-ink-primary transition-colors"
        >
          ← Back to the Sales modules
        </a>
        <h1 className="text-xl font-semibold text-ink-primary">Sales Academy FAQ</h1>
        <p className="mt-1 text-[13px] text-ink-secondary">
          {SALES_FAQ_ITEMS.length} questions drawn from the vetted Sales module content, shown as
          interactive visuals where the answer has a shape — flows, decisions, comparisons, charts
          and cards — and as expandable Q&A everywhere else. Unresolved source conflicts stay
          flagged, exactly as they are in the modules.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(Object.entries(counts) as [string, number][]).map(([type, n]) => (
            <span
              key={type}
              className="inline-flex items-center gap-1.5 rounded-full border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream px-2.5 py-1 text-[11.5px] text-ink-secondary"
            >
              <span className="font-semibold text-ink-primary tabular-nums">{n}</span>
              {type}
            </span>
          ))}
        </div>
      </div>

      {/* The objection-handling film — Module 5, the module most of these
          questions get asked against. Questions follow below. */}
      {(() => {
        const m5 = SALES_MODULES.find((m) => m.id === 'sa-m5')
        return m5 ? <SalesVideoPlayer module={m5} /> : null
      })()}

      {MODULE_ORDER.map((moduleId) => {
        const items = grouped.get(moduleId)
        if (!items?.length) return null
        return <Section key={moduleId} moduleId={moduleId} items={items} />
      })}
    </div>
  )
}
