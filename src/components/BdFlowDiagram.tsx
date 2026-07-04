'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ArrowDown, Quote } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BD_MODULES } from '@/data/bd-academy'
import { TRAINING_CHUNKS } from '@/data/training-doc'

/**
 * Module 5 — vertical 8-stage pitch flow, click-to-expand. Each stage shows
 * the short summary (from bd-academy.ts) AND the full verbatim call script —
 * the exact Section 3 wording from the master training document, transcribed
 * in training-doc.ts (isVerbatimScript). Nothing paraphrased or invented.
 */

// The 8 pitch stages, in document order (Stage 1 → 8), verbatim.
const PITCH_STAGES = TRAINING_CHUNKS.filter((c) => c.category === 'pitch_flow')

const STAGE_TITLES = [
  'Opening',
  'Discovery & qualification',
  'Problem agitation',
  'Solution introduction',
  'Product deep dive',
  'Budget qualification',
  'Pricing',
  'WhatsApp handoff',
]

/** Pull the "(15 seconds)"-style timing out of the transcribed section title. */
function timingOf(i: number): string | null {
  const m = PITCH_STAGES[i]?.sectionTitle.match(/\(([^)]+)\)/)
  return m ? m[1] : null
}

/** Break the single verbatim string into display lines: each spoken quote,
 *  each [direction], Branch:/Why: label and bullet on its own line. */
function scriptLines(content: string): { text: string; spoken: boolean }[] {
  const marked = content
    .replace(/\s*(\[[^\]]*\])\s*/g, '\n$1\n')
    .replace(/\s*(Branch:|Why:)\s*/g, '\n$1 ')
    .replace(/\s*•\s*/g, '\n• ')
    .replace(/"\s+"/g, '"\n"')
  return marked
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((text) => ({ text, spoken: text.startsWith('"') }))
}

export function BdPitchFlowDiagram() {
  const module5 = BD_MODULES.find((m) => m.id === 'bd-m5')
  const listBlock = module5?.blocks.find((b) => b.kind === 'list')
  const stages = listBlock && listBlock.kind === 'list' ? listBlock.items : []
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="max-w-[620px] mx-auto">
      {stages.map((detail, i) => {
        const isOpen = openIndex === i
        const script = PITCH_STAGES[i] ? scriptLines(PITCH_STAGES[i].content) : []
        const timing = timingOf(i)
        return (
          <div key={i}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className={cn(
                'w-full flex items-center gap-3 rounded-[12px] border-[0.5px] px-4 py-3 text-left transition-colors',
                isOpen
                  ? 'border-accent-copper bg-accent-copper/10'
                  : 'border-[rgba(0,59,70,0.14)] bg-cream hover:bg-[rgba(0,59,70,0.02)]',
              )}
            >
              <span
                className={cn(
                  'shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold',
                  isOpen ? 'bg-accent-copper text-parchment' : 'bg-[rgba(0,59,70,0.08)] text-ink-secondary',
                )}
              >
                {i + 1}
              </span>
              <span className="flex-1 text-sm font-medium text-ink-primary">
                {STAGE_TITLES[i] ?? `Stage ${i + 1}`}
              </span>
              {timing && <span className="text-[11px] text-ink-tertiary tabular-nums">{timing}</span>}
              <ChevronDown
                size={16}
                className={cn('text-ink-tertiary transition-transform', isOpen && 'rotate-180')}
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
                  <div className="ml-10 px-4 py-3 space-y-3">
                    <p className="text-[13px] text-ink-secondary leading-relaxed">{detail}</p>

                    {script.length > 0 && (
                      <div className="rounded-[10px] border-[0.5px] border-accent-copper/30 bg-accent-copper/[0.05] p-3.5">
                        <p className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-accent-copper mb-2.5">
                          <Quote size={11} /> Full call script — say this word for word
                        </p>
                        <div className="space-y-1.5">
                          {script.map((line, li) =>
                            line.spoken ? (
                              <p key={li} className="text-[13px] text-ink-primary leading-relaxed">
                                {line.text}
                              </p>
                            ) : (
                              <p
                                key={li}
                                className="text-[11.5px] italic text-ink-tertiary leading-relaxed"
                              >
                                {line.text}
                              </p>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {i < stages.length - 1 && (
              <div className="flex justify-start pl-[15px] py-1">
                <ArrowDown size={14} className="text-ink-tertiary/50" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/**
 * Module 6 — objection decision tree. Root "Customer objects" branches to
 * four objection types (per the build spec); each connects to its response
 * strategy. Detail text is pulled directly from the Module 6 list block
 * already in bd-academy.ts by matching quoted objection phrases — same
 * single source as the quiz, no separate/paraphrased copy maintained here.
 * Short labels/strategy names are the ones named literally in the build spec.
 */
const OBJECTION_BRANCHES = [
  { label: 'Too expensive', strategy: 'Lifetime cost', match: 'Too expensive' },
  { label: 'Need to think', strategy: 'Send a video', match: 'Need to think about it' },
  { label: 'Has a vendor', strategy: 'Collaborate', match: 'already have a vendor' },
  { label: 'No showroom', strategy: 'Remote option', match: 'No showroom in my city' },
]

export function BdObjectionTreeDiagram() {
  const module6 = BD_MODULES.find((m) => m.id === 'bd-m6')
  const listBlock = module6?.blocks.find((b) => b.kind === 'list')
  const items = listBlock && listBlock.kind === 'list' ? listBlock.items : []

  function detailFor(match: string): string {
    const item = items.find((it) => it.includes(match))
    if (!item) return ''
    // Items are formatted '"objection" → response text.' — strip the quoted
    // objection prefix so only the response strategy text is shown.
    const arrowIndex = item.indexOf('→')
    return arrowIndex >= 0 ? item.slice(arrowIndex + 1).trim() : item
  }

  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="max-w-[820px] mx-auto">
      {/* Root */}
      <div className="flex justify-center mb-2">
        <div className="rounded-[12px] border-[0.5px] border-[rgba(0,59,70,0.14)] bg-ink-primary text-parchment px-5 py-2.5 text-sm font-semibold">
          Customer objects
        </div>
      </div>
      <div className="flex justify-center">
        <div className="h-6 w-px bg-[rgba(0,59,70,0.2)]" />
      </div>

      {/* Branch row */}
      <div className="relative">
        <div className="hidden sm:block absolute left-0 right-0 top-0 h-px bg-[rgba(0,59,70,0.2)]" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-0">
          {OBJECTION_BRANCHES.map((b, i) => {
            const isOpen = openIndex === i
            return (
              <div key={i} className="flex flex-col items-center">
                <div className="hidden sm:block h-4 w-px bg-[rgba(0,59,70,0.2)]" />
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className={cn(
                    'w-full rounded-[12px] border-[0.5px] px-3 py-2.5 text-center transition-colors',
                    isOpen
                      ? 'border-accent-copper bg-accent-copper/10'
                      : 'border-[rgba(0,59,70,0.14)] bg-cream hover:bg-[rgba(0,59,70,0.02)]',
                  )}
                >
                  <p className="text-[13px] font-medium text-ink-primary">{b.label}</p>
                </button>
                <div className="h-3 w-px bg-[rgba(0,59,70,0.2)]" />
                <div
                  className={cn(
                    'w-full rounded-[10px] px-3 py-2 text-center',
                    isOpen ? 'bg-accent-copper/15' : 'bg-[rgba(0,59,70,0.04)]',
                  )}
                  style={isOpen ? { color: 'var(--status-ontrack-fg)', backgroundColor: 'var(--status-ontrack-bg)' } : undefined}
                >
                  <p className="text-[12px] font-semibold">{b.strategy}</p>
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden w-full"
                    >
                      <p className="text-[12px] text-ink-secondary leading-relaxed pt-2 px-1">
                        {detailFor(b.match)}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
