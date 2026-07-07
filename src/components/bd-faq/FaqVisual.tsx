'use client'

import { AlertTriangle } from 'lucide-react'
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
 * the right primitive for its `type`. Non-accordion types show the question
 * as a heading, the visual, then the verbatim source answer beneath it —
 * the diagram illustrates the answer, it never replaces it.
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
  return undefined
}

export default function FaqVisual({ item, className }: { item: FaqItem; className?: string }) {
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
        'rounded-[12px] border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream p-4 sm:p-5',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <p className="text-[14px] font-semibold text-ink-primary leading-snug">
          {item.qNum ? (
            <span className="mr-2 text-[11px] font-normal text-ink-tertiary tabular-nums">
              Q{item.qNum}
            </span>
          ) : null}
          {item.question}
        </p>
        {item.flag && <Flag label={item.flag.label} />}
      </div>

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
  )
}
