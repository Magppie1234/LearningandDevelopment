'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FaqItem } from '@/lib/bd-faq/faq-data'
import FlowChart from './FlowChart'
import DecisionTree from './DecisionTree'
import CompareCards from './CompareCards'
import DataChart from './DataChart'
import CategoryCards from './CategoryCards'
import FaqAccordion from './FaqAccordion'

/**
 * The single dispatcher module pages import: takes one FaqItem and renders
 * the right primitive for its `type`. Every question is click-to-expand:
 * plain answers go through the shadcn Accordion, and visual-typed questions
 * render as a collapsed card whose header toggles the diagram open. The
 * verbatim source answer always renders beneath the visual — the diagram
 * illustrates the answer, it never replaces it.
 */

function Flag({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={{ backgroundColor: 'var(--status-risk-bg)', color: 'var(--status-risk-fg)' }}
    >
      <AlertTriangle size={10} /> {label}
    </span>
  )
}

function chartUnit(item: FaqItem): string | undefined {
  if (item.id === 'faq-q25') return 'rupees per sq. ft.'
  if (item.id === 'faq-q44') return 'years'
  if (item.id === 'faq-q67') return 'rupees per sq. ft.'
  return undefined
}

export default function FaqVisual({ item, className }: { item: FaqItem; className?: string }) {
  const [open, setOpen] = useState(false)

  if (item.type === 'accordion') {
    return (
      <div className={className}>
        <FaqAccordion items={[item]} />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-[12px] border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream overflow-hidden',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 sm:px-5 text-left transition-colors',
          open ? 'bg-accent-copper/5' : 'hover:bg-[rgba(0,59,70,0.02)]',
        )}
      >
        {item.qNum ? (
          <span className="w-9 shrink-0 text-[11px] text-ink-tertiary tabular-nums">
            Q{item.qNum}
          </span>
        ) : null}
        <span className="flex-1 text-[13.5px] font-medium text-ink-primary leading-snug">
          {item.question}
        </span>
        {item.flag && <Flag label={item.flag.label} />}
        <ChevronDown
          size={16}
          className={cn(
            'shrink-0 transition-transform',
            open ? 'rotate-180 text-accent-copper' : 'text-ink-tertiary',
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 sm:px-5 sm:pb-5">
              {item.type === 'flow' && item.nodes && item.edges && (
                <FlowChart
                  nodes={item.nodes}
                  edges={item.edges}
                  ariaTitle={item.question}
                  ariaDescription={`Step-by-step flow: ${item.nodes.map((n) => n.title).join(', then ')}.`}
                />
              )}

              {item.type === 'decision' && item.nodes && item.edges && (
                <DecisionTree
                  nodes={item.nodes}
                  edges={item.edges}
                  ariaTitle={item.question}
                  ariaDescription={`Decision tree with outcomes: ${item.nodes
                    .filter((n) => n.kind === 'outcome')
                    .map((n) => n.title)
                    .join(' or ')}.`}
                />
              )}

              {item.type === 'compare' && item.columns && <CompareCards columns={item.columns} />}

              {item.type === 'chart' && item.chartType && item.chartData && (
                <DataChart chartType={item.chartType} data={item.chartData} unit={chartUnit(item)} />
              )}

              {item.type === 'cards' && item.cards && <CategoryCards cards={item.cards} />}

              <p className="mt-4 border-t-[0.5px] border-[rgba(0,59,70,0.08)] pt-3 text-[12.5px] leading-relaxed text-ink-secondary">
                {item.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
