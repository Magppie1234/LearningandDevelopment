'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

/**
 * Fallback expandable Q&A for single-fact answers, built on the shadcn
 * Accordion (Radix — keyboard navigation comes with it). Q56's source
 * recommendation line stays bold, exactly as reviewed in BdFaqAccordion.
 */

const Q56_BOLD = 'We do not recommend sliding wardrobes.'

function AnswerText({ answer }: { answer: string }) {
  if (answer.startsWith(Q56_BOLD)) {
    return (
      <p className="text-[13px] text-ink-secondary leading-relaxed">
        <strong className="text-ink-primary">{Q56_BOLD}</strong>
        {answer.slice(Q56_BOLD.length)}
      </p>
    )
  }
  return <p className="text-[13px] text-ink-secondary leading-relaxed">{answer}</p>
}

export default function FaqAccordion({
  items,
}: {
  items: { id: string; question: string; answer: string; qNum?: number }[]
}) {
  return (
    <Accordion
      type="single"
      collapsible
      className="rounded-[12px] border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream overflow-hidden"
    >
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id} className="border-[rgba(0,59,70,0.06)]">
          <AccordionTrigger className="px-4 py-3 text-[13.5px] font-medium text-ink-primary hover:no-underline hover:bg-[rgba(0,59,70,0.02)] rounded-none">
            <span className="flex items-baseline gap-3">
              {item.qNum ? (
                <span className="w-8 shrink-0 text-[11px] font-normal text-ink-tertiary tabular-nums">
                  Q{item.qNum}
                </span>
              ) : null}
              {item.question}
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pl-[44px]">
            <AnswerText answer={item.answer} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
