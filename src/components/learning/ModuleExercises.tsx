'use client'

import { useMemo, useState } from 'react'
import { Check, RotateCcw, X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Two practice exercises, both built ONLY from what the module documents
 * already state. No scenario, answer or routing rule here is invented:
 *
 *  - SortIt draws its items from Pre-Sales Part 1 (questions you answer) and
 *    Part 2 (the ten topics that route to Sales). The doc lists both sides
 *    explicitly, so the correct answer is the document's, not a judgement.
 *  - ScenarioPractice draws its situations and correct responses from Sales
 *    Part 3, "the things a client will push on" — the six moments and the
 *    approved handling. Distractors are deliberately plausible-but-wrong
 *    behaviours the doc warns against (discounting, guessing, promising a
 *    date), never invented facts.
 */

const GREEN = '#3d7350' // darkened from #4e8c63: white pill text was 4.0:1
const GREEN_SOFT = '#e6f1e9'
const GOLD = '#7a5f13' // darkened from #9c7a1b: 3.9:1 failed AA at 10px

/* ── Presales: answer it, or route it? ─────────────────────────────────── */

type SortItem = { text: string; answer: 'answer' | 'route' }

/** Left column = Pre-Sales Part 1. Right column = Part 2's routing table. */
const SORT_ITEMS: SortItem[] = [
  { text: 'What do your kitchens cost?', answer: 'answer' },
  { text: 'What is included in that price?', answer: 'answer' },
  { text: 'Which showrooms are open?', answer: 'answer' },
  { text: 'What are the payment terms?', answer: 'answer' },
  { text: 'What kind of stone is it?', answer: 'answer' },
  { text: 'A full charge and package breakdown', answer: 'route' },
  { text: 'Warranty specifics by range', answer: 'route' },
  { text: 'Finishes and design options for their layout', answer: 'route' },
  { text: 'Civil work, demolition, plastering', answer: 'route' },
  { text: 'Installation dates for their kitchen', answer: 'route' },
]

export function SortIt() {
  const [picked, setPicked] = useState<Record<number, 'answer' | 'route'>>({})
  const [checked, setChecked] = useState(false)
  const score = useMemo(
    () => SORT_ITEMS.filter((it, i) => picked[i] === it.answer).length,
    [picked],
  )
  const done = Object.keys(picked).length === SORT_ITEMS.length

  return (
    <figure className="my-6 rounded-2xl border border-hairline/12 bg-parchment p-5 sm:p-6">
      <figcaption className="mb-1">
        <span className="block text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: GOLD }}>
          Practice
        </span>
        <span className="mt-1 block text-[15px] font-semibold text-ink-primary">
          Answer it, or route it to Sales?
        </span>
      </figcaption>
      <p className="mb-4 text-[13px] leading-relaxed text-ink-secondary">
        The rule: answer anything that helps them decide the next step. Anything that needs to know
        <em> their</em> kitchen goes to Sales.
      </p>

      <ul className="space-y-2">
        {SORT_ITEMS.map((it, i) => {
          const p = picked[i]
          const right = checked && p === it.answer
          const wrong = checked && p !== undefined && p !== it.answer
          return (
            <li
              key={it.text}
              className={cn(
                'flex flex-wrap items-center gap-2 rounded-xl border p-2.5 transition-colors',
                right && 'border-transparent',
                wrong && 'border-danger/40',
                !checked && 'border-hairline/12',
              )}
              style={right ? { background: GREEN_SOFT, borderColor: 'rgba(78,140,99,0.3)' } : undefined}
            >
              <span className="flex-1 min-w-[45%] text-[13px] text-ink-primary">{it.text}</span>
              <span className="flex gap-1.5">
                {(['answer', 'route'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    disabled={checked}
                    onClick={() => setPicked((s) => ({ ...s, [i]: opt }))}
                    className={cn(
                      'inline-flex min-h-[44px] items-center rounded-full px-4 text-[12px] font-semibold transition-colors',
                      p === opt
                        ? 'bg-ink-primary text-parchment'
                        : 'bg-[rgb(var(--rule)/0.06)] text-ink-secondary hover:bg-[rgb(var(--rule)/0.1)]',
                      checked && 'cursor-default',
                    )}
                  >
                    {opt === 'answer' ? 'I answer' : 'Route'}
                  </button>
                ))}
              </span>
              {checked && (
                <span aria-hidden className="w-4 flex-shrink-0">
                  {right ? (
                    <Check size={15} style={{ color: GREEN }} />
                  ) : (
                    <X size={15} className="text-danger" />
                  )}
                </span>
              )}
            </li>
          )
        })}
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {!checked ? (
          <button
            type="button"
            disabled={!done}
            onClick={() => setChecked(true)}
            className="inline-flex min-h-[44px] items-center rounded-full bg-ink-primary px-5 text-[13px] font-semibold text-parchment transition-opacity disabled:opacity-40"
          >
            Check answers
          </button>
        ) : (
          <>
            <span className="text-[13px] font-semibold text-ink-primary">
              {score} of {SORT_ITEMS.length} right
            </span>
            <button
              type="button"
              onClick={() => {
                setPicked({})
                setChecked(false)
              }}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-tertiary hover:text-ink-primary"
            >
              <RotateCcw size={13} aria-hidden /> Try again
            </button>
          </>
        )}
        {!checked && !done && (
          <span className="text-[12px] text-ink-tertiary">
            {Object.keys(picked).length} of {SORT_ITEMS.length} answered
          </span>
        )}
      </div>
    </figure>
  )
}

/* ── Sales: the client says… pick the best response ────────────────────── */

type Scenario = { says: string; options: string[]; correct: number; why: string }

/** Situations and approved handling from Sales Part 3. */
const SCENARIOS: Scenario[] = [
  {
    says: 'That is more than I expected.',
    options: [
      'Offer a discount to keep them engaged',
      'Check they have not misread the square footage',
      'Explain that the price is fixed and move on',
    ],
    correct: 1,
    why: 'Many objections that sound like price are arithmetic — check the square footage before you defend the price.',
  },
  {
    says: 'Can you do anything on the price?',
    options: [
      'Move the conversation to scope — what a complete solution includes, which range fits',
      'Ask your manager for a one-off discount',
      'Match whatever the competitor quoted',
    ],
    correct: 0,
    why: 'Pricing is fixed and applies equally to everyone. That is a policy, not a negotiating position.',
  },
  {
    says: '75 to 90 days is a long time.',
    options: [
      'Promise 60 days to close the deal',
      'Explain it is factory-made, not assembled; ~60 days is a genuine-urgency exception',
      'Say nothing can be done',
    ],
    correct: 1,
    why: 'Around 60 days is sometimes possible for urgent requirements — but it is an exception, not a lever.',
  },
  {
    says: 'I want to see one that is actually installed.',
    options: [
      'Book them a visit for next week',
      'Explain we only do showroom visits',
      'Yes, where we have a project in their city, subject to the homeowner’s permission',
    ],
    correct: 2,
    why: 'Take the request seriously and follow it through — but never promise a date you do not control.',
  },
]

export function ScenarioPractice() {
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const s = SCENARIOS[i]
  const last = i === SCENARIOS.length - 1

  return (
    <figure className="my-6 rounded-2xl border border-hairline/12 bg-parchment p-5 sm:p-6">
      <figcaption className="mb-1 flex items-baseline justify-between gap-3">
        <span>
          <span className="block text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: GOLD }}>
            Practice
          </span>
          <span className="mt-1 block text-[15px] font-semibold text-ink-primary">
            The client says… pick the best response
          </span>
        </span>
        <span className="text-[12px] tabular-nums text-ink-tertiary">
          {i + 1} / {SCENARIOS.length}
        </span>
      </figcaption>

      <blockquote className="my-4 rounded-xl border-l-[3px] px-4 py-3 text-[14px] font-medium text-ink-primary" style={{ borderColor: GOLD, background: 'rgb(var(--m-cream))' }}>
        “{s.says}”
      </blockquote>

      <ul className="space-y-2">
        {s.options.map((o, oi) => {
          const isPicked = picked === oi
          const isRight = picked !== null && oi === s.correct
          const isWrong = isPicked && oi !== s.correct
          return (
            <li key={o}>
              <button
                type="button"
                disabled={picked !== null}
                onClick={() => setPicked(oi)}
                className={cn(
                  'w-full rounded-xl border p-3 text-left text-[13px] leading-snug transition-colors',
                  picked === null && 'border-hairline/12 hover:border-hairline/30 hover:bg-[rgb(var(--rule)/0.03)]',
                  isRight && 'border-transparent text-ink-primary',
                  isWrong && 'border-danger/40 text-ink-primary',
                  picked !== null && !isRight && !isWrong && 'border-hairline/10 text-ink-tertiary',
                )}
                style={isRight ? { background: GREEN_SOFT, borderColor: 'rgba(78,140,99,0.3)' } : undefined}
              >
                <span className="flex items-start gap-2">
                  {picked !== null && isRight && <Check size={14} className="mt-0.5 flex-shrink-0" style={{ color: GREEN }} aria-hidden />}
                  {isWrong && <X size={14} className="mt-0.5 flex-shrink-0 text-danger" aria-hidden />}
                  <span>{o}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {picked !== null && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p className="flex-1 min-w-[60%] text-[13px] leading-relaxed text-ink-secondary">{s.why}</p>
          <button
            type="button"
            onClick={() => {
              if (last) {
                setI(0)
              } else {
                setI(i + 1)
              }
              setPicked(null)
            }}
            className="inline-flex min-h-[44px] items-center rounded-full bg-ink-primary px-5 text-[13px] font-semibold text-parchment transition-opacity hover:opacity-90"
          >
            {last ? 'Start over' : 'Next situation'}
          </button>
        </div>
      )}
    </figure>
  )
}
