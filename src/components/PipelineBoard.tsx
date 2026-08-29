'use client'

import { useState } from 'react'
import { BOARD, STAGES_WITHOUT_TOUCHPOINTS, HAS_STAGE_HISTORY } from '@/data/pipeline-board'
import type { CrmStage } from '@/data/call-intelligence/taxonomy'
import { cn } from '@/lib/utils'

/**
 * The BD → Sales journey board.
 *
 * Columns are pipeline stages, read left to right along one continuous rule so
 * the whole thing is a single path rather than a row of separate boxes. Inside
 * each column sit the touchpoints recorded at that stage as solid dark cards.
 *
 * COLOUR DISCIPLINE, deliberately: one dark ground for every card, copper used
 * only for the active column and the capture chips. An earlier pass gave each
 * stage its own saturated colour, which turned a process diagram into a
 * rainbow and made the colours carry meaning they do not have — the stages are
 * a sequence, not seven unrelated categories.
 */

const CARD_DARK = '#1B2A32'

export default function PipelineBoard({
  /** Which stage is highlighted. */
  active = 'Qualified',
}: {
  active?: CrmStage
}) {
  const [current, setCurrent] = useState<CrmStage>(active)

  return (
    <section aria-labelledby="board-heading" className="relative overflow-hidden rounded-2xl border border-hairline/12">
      {/* Real installed Magppie kitchen, self-hosted and blurred back into
          texture. The wash has to be heavy here: the columns carry small text
          and a photograph competing with them would cost readability. */}
      <div aria-hidden className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/kitchen/space-1.jpg"
          alt=""
          draggable={false}
          className="h-full w-full object-cover blur-[10px] scale-110 opacity-40 saturate-[0.7] dark:opacity-[0.14]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgb(var(--m-cream)/0.72) 0%, rgb(var(--m-parchment)/0.92) 55%, rgb(var(--m-parchment)/0.97) 100%)',
          }}
        />
      </div>

      <div className="relative p-5 sm:p-7">
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-accent-copper">
          Business Development → Sales
        </p>
        <h2 id="board-heading" className="mt-1.5 font-serif text-2xl sm:text-3xl text-ink-primary">
          How a lead becomes an order
        </h2>
        {/* This used to claim the stage names were "the CRM's own, so what you
            see here is what you see on the record". They are not: of 7,295
            deals in the mirrored CRM, none uses these names. Saying so on the
            page matters more than saying it in a comment — a learner who
            trusted that sentence would go looking for "Qualified" on a record
            and not find it. */}
        <p className="mt-2 text-[13.5px] text-ink-secondary max-w-[64ch]">
          A generic seven-stage funnel, left to right, with the touchpoints recorded at each. These
          are teaching labels, not the stage names on a Magppie record — the live CRM uses its own,
          more operational set (&ldquo;Sent for Approval&rdquo;, &ldquo;Final Handover&rdquo;, and
          around fifty more). Learn the shape of the journey here; read the stage itself off the
          record.
        </p>

        <div className="mt-7 overflow-x-auto pb-2 -mx-1 px-1">
          <ol className="flex items-stretch gap-0 list-none m-0 p-0 min-w-max">
            {BOARD.map((col) => {
              const isActive = col.stage === current
              return (
                <li key={col.stage} className="w-[186px] flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setCurrent(col.stage)}
                    aria-pressed={isActive}
                    className={cn(
                      // flex-col matters: a <button> vertically centres its
                      // content by UA default, which pushed each column's
                      // header down by however tall its cards were and left
                      // the connector node at a different y per column.
                      'group w-full h-full flex flex-col items-stretch justify-start',
                      'text-left rounded-xl px-3 pt-3 pb-4 transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-copper',
                      // The active column gets a light grey wash behind it —
                      // the one piece of the reference worth keeping literally.
                      isActive ? 'bg-[rgb(var(--rule)/0.07)]' : 'hover:bg-[rgb(var(--rule)/0.035)]',
                    )}
                  >
                    {/* Fixed height: the stage name and summary wrap to
                        different line counts, and without this the node sits
                        at a different y in each column and the "one continuous
                        path" reading falls apart. */}
                    <span className="block h-[54px]">
                    <span className="flex items-baseline gap-1.5">
                      <span
                        className={cn(
                          'text-[13.5px] font-semibold leading-tight',
                          isActive ? 'text-accent-copper' : 'text-ink-primary',
                        )}
                      >
                        {col.stage}
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-medium uppercase tracking-wide text-accent-copper/80">
                          now
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-[11.5px] leading-snug text-ink-tertiary">
                      {col.summary}
                    </span>
                    </span>

                    {/* The continuous rule: a node on the line, and the line
                        running through every column so the eye reads one path. */}
                    <span aria-hidden className="relative mt-1 mb-3 flex items-center">
                      <span className="absolute inset-x-[-12px] h-px bg-[rgb(var(--rule)/0.18)]" />
                      <span
                        className={cn(
                          'relative w-2.5 h-2.5 rounded-full border-2',
                          isActive
                            ? 'bg-accent-copper border-accent-copper'
                            : 'bg-parchment border-[rgb(var(--rule)/0.3)]',
                        )}
                      />
                    </span>

                    <span className="block space-y-2">
                      {col.touchpoints.length === 0 ? (
                        <span className="block rounded-lg border border-dashed border-hairline/25 px-2.5 py-3 text-[11.5px] leading-snug text-ink-tertiary">
                          No touchpoint recorded for this stage yet
                        </span>
                      ) : (
                        col.touchpoints.map((tp) => (
                          <span
                            key={tp.title}
                            style={{ backgroundColor: CARD_DARK }}
                            className="block rounded-lg px-3 py-2.5 text-parchment"
                          >
                            <span className="block text-[9.5px] font-semibold uppercase tracking-wider text-parchment/55">
                              {tp.source}
                            </span>
                            <span className="mt-0.5 block text-[12.5px] font-semibold leading-snug">
                              {tp.title}
                            </span>
                            {tp.captures.length > 0 && (
                              <span className="mt-2 flex flex-wrap gap-1">
                                {tp.captures.slice(0, 4).map((c) => (
                                  <span
                                    key={c}
                                    className="rounded px-1.5 py-0.5 text-[10px] leading-tight bg-accent-copper/25 text-parchment"
                                  >
                                    {c}
                                  </span>
                                ))}
                                {tp.captures.length > 4 && (
                                  <span className="px-1 py-0.5 text-[10px] text-parchment/60">
                                    +{tp.captures.length - 4} more
                                  </span>
                                )}
                              </span>
                            )}
                          </span>
                        ))
                      )}
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </div>

        {/* Both gaps stated on the page, not just in a commit message. */}
        <div className="mt-6 pt-5 border-t border-hairline/12 space-y-2.5">
          {STAGES_WITHOUT_TOUCHPOINTS.length > 0 && (
            <p className="text-[12.5px] leading-relaxed text-ink-tertiary">
              <strong className="text-ink-secondary font-semibold">
                {STAGES_WITHOUT_TOUCHPOINTS.length} of {BOARD.length} stages have no touchpoint
                data:
              </strong>{' '}
              {STAGES_WITHOUT_TOUCHPOINTS.join(', ')}. The portal holds this funnel and the
              BD/Sales step definitions, but nothing links the two — so these columns are empty
              rather than filled with a guess at which steps belong where.
            </p>
          )}
          {!HAS_STAGE_HISTORY && (
            <p className="text-[12.5px] leading-relaxed text-ink-tertiary">
              <strong className="text-ink-secondary font-semibold">
                No stage-change history is recorded,
              </strong>{' '}
              so there is no trend line or milestone axis beneath the board. Both need per-deal
              stage timestamps, which no table currently captures.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
