'use client'

import { useMemo } from 'react'
import { BD_MODULES } from '@/data/bd-academy'
import { FAQ_ITEMS, faqTypeCounts, type FaqItem } from '@/lib/bd-faq/faq-data'
import FaqVisual from '@/components/bd-faq/FaqVisual'
import FaqAccordion from '@/components/bd-faq/FaqAccordion'

/**
 * BD Academy FAQ — every source question rendered through the FaqVisual
 * dispatcher, grouped by the module its category belongs to. Plain
 * single-fact answers collapse into one accordion per group; every
 * diagram-typed question gets its own visual card.
 */

const MODULE_ORDER = ['bd-m7', 'bd-m8', 'bd-m4', 'bd-m10']

function moduleTitle(id: string): string {
  return BD_MODULES.find((m) => m.id === id)?.title ?? id
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

export default function BdFaqPage() {
  const grouped = useMemo(() => {
    const map = new Map<string, FaqItem[]>()
    for (const item of FAQ_ITEMS) {
      const key = item.module ?? 'other'
      map.set(key, [...(map.get(key) ?? []), item])
    }
    return map
  }, [])

  const counts = faqTypeCounts()

  return (
    <div className="max-w-[880px] mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-ink-primary">Business development FAQ</h1>
        <p className="mt-1 text-[13px] text-ink-secondary">
          All {FAQ_ITEMS.length} questions from the master training document, shown as interactive
          visuals where the answer has a shape — flows, decisions, comparisons, charts and cards —
          and as expandable Q&A everywhere else.
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

      {MODULE_ORDER.map((moduleId) => {
        const items = grouped.get(moduleId)
        if (!items?.length) return null
        return <Section key={moduleId} moduleId={moduleId} items={items} />
      })}
    </div>
  )
}
