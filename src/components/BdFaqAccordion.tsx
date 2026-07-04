'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, AlertTriangle, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TRAINING_CHUNKS } from '@/data/training-doc'

/**
 * FAQ accordion (§4 of the consolidated build) — the full 62-question bank,
 * verbatim from training-doc.ts (same transcription the RAG corpus uses),
 * grouped under the original category headers. Collapsed by default; click
 * expands in place with a copper active chevron.
 *
 * Special handling preserved exactly as reviewed:
 *  - Q30 (EMI) is explicitly unresolved in the source — rendered with a
 *    visually distinct flag, never as settled fact.
 *  - Q56 (sliding wardrobes) — the recommendation stays bold.
 *
 * Relevant categories link to the §3 visuals instead of duplicating them.
 */

const CATEGORY_LABELS: Record<string, string> = {
  A: 'A. Product & Material',
  B: 'B. Pricing & Cost',
  C: 'C. Company & Trust',
  D: 'D. Process & Timeline',
  E: 'E. Warranty & Service',
  F: 'F. Comparisons',
  G: 'G. Scope & Customisation',
  H: 'H. Stores & Locations',
}

/** Which FAQ categories belong on which module page (mirrors source_section). */
const MODULE_CATEGORIES: Record<string, string[]> = {
  'bd-m7': ['A', 'F', 'G'],
  'bd-m8': ['B', 'D', 'E'],
  'bd-m4': ['C'],
  'bd-m10': ['H'],
}

/** Per-category "see the diagram" links (§4: link, don't duplicate). */
const CATEGORY_DIAGRAM_LINKS: Record<
  string,
  { label: string; moduleId?: string; anchor?: string }
> = {
  A: { label: 'See how SilverStone is made — Module 2 diagram', moduleId: 'bd-m2' },
  B: { label: 'See the material-cost & payment charts below', anchor: 'module-visual' },
  F: { label: 'See the SilverStone vs. alternatives table below', anchor: 'module-visual' },
}

interface FaqItem {
  id: string
  letter: string
  qNum: number
  question: string
  answer: string
}

function faqItems(): FaqItem[] {
  return TRAINING_CHUNKS.filter((c) => c.category === 'faq')
    .map((c) => {
      const m = c.sectionNumber.match(/5\.([A-H])\s+Q(\d+)/)
      return {
        id: c.id,
        letter: m?.[1] ?? '?',
        qNum: Number(m?.[2] ?? 0),
        question: c.sectionTitle,
        answer: c.content,
      }
    })
    .sort((a, b) => a.qNum - b.qNum)
}

export function bdModuleHasFaq(moduleId: string): boolean {
  return moduleId in MODULE_CATEGORIES
}

function FaqAnswer({ item }: { item: FaqItem }) {
  // Q56: the source's recommendation line stays bold, exactly as written.
  if (item.qNum === 56) {
    const bold = 'We do not recommend sliding wardrobes.'
    const rest = item.answer.startsWith(bold) ? item.answer.slice(bold.length) : item.answer
    return (
      <p className="text-[13px] text-ink-secondary leading-relaxed">
        <strong className="text-ink-primary">{bold}</strong>
        {rest}
      </p>
    )
  }
  return <p className="text-[13px] text-ink-secondary leading-relaxed">{item.answer}</p>
}

export default function BdFaqAccordion({
  moduleId,
  onOpenModule,
}: {
  moduleId: string
  onOpenModule?: (moduleId: string) => void
}) {
  const categories = MODULE_CATEGORIES[moduleId] ?? []
  const items = useMemo(() => faqItems(), [])
  const [openId, setOpenId] = useState<string | null>(null)

  if (categories.length === 0) return null

  return (
    <div className="space-y-5">
      {categories.map((letter) => {
        const catItems = items.filter((i) => i.letter === letter)
        if (catItems.length === 0) return null
        const link = CATEGORY_DIAGRAM_LINKS[letter]
        return (
          <div key={letter}>
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">
                {CATEGORY_LABELS[letter]} · {catItems.length} questions
              </p>
              {link && (
                link.moduleId ? (
                  <button
                    type="button"
                    onClick={() => onOpenModule?.(link.moduleId!)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-accent-copper hover:underline"
                  >
                    {link.label} <ArrowUpRight size={11} />
                  </button>
                ) : (
                  <a
                    href={`#${link.anchor}`}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-accent-copper hover:underline"
                  >
                    {link.label} <ArrowUpRight size={11} />
                  </a>
                )
              )}
            </div>

            <div className="rounded-[12px] border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream overflow-hidden divide-y divide-[rgba(0,59,70,0.06)]">
              {catItems.map((item) => {
                const isOpen = openId === item.id
                const isEmiFlag = item.qNum === 30
                return (
                  <div key={item.id}>
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? null : item.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                        isOpen ? 'bg-accent-copper/5' : 'hover:bg-[rgba(0,59,70,0.02)]',
                      )}
                    >
                      <span className="w-9 shrink-0 text-[11px] text-ink-tertiary tabular-nums">
                        Q{item.qNum}
                      </span>
                      <span className="flex-1 text-[13.5px] font-medium text-ink-primary">
                        {item.question}
                      </span>
                      {isEmiFlag && (
                        <span
                          className="shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{
                            backgroundColor: 'var(--status-risk-bg)',
                            color: 'var(--status-risk-fg)',
                          }}
                        >
                          <AlertTriangle size={10} /> Unresolved
                        </span>
                      )}
                      <ChevronDown
                        size={16}
                        className={cn(
                          'shrink-0 transition-transform',
                          isOpen ? 'rotate-180 text-accent-copper' : 'text-ink-tertiary',
                        )}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pl-[52px]">
                            {isEmiFlag && (
                              <p
                                className="mb-2 rounded-[8px] px-3 py-2 text-[12px]"
                                style={{
                                  backgroundColor: 'var(--status-risk-bg)',
                                  color: 'var(--status-risk-fg)',
                                }}
                              >
                                Marked unresolved in the source — check with the finance team
                                before presenting EMI options as settled fact.
                              </p>
                            )}
                            <FaqAnswer item={item} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
