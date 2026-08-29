'use client'

import { useState } from 'react'
import { Check, ChevronDown, Download, RotateCcw, X } from 'lucide-react'
import {
  DRESS_CODE_DECK,
  DRESS_CODE_PDF,
  DRESS_CODE_SECTIONS,
  DRESS_CODE_SELF_CHECK,
  type PolicySection,
} from '@/data/dress-code-policy'
import { cn } from '@/lib/utils'

/**
 * The Dress Code Policy, rendered as a readable document rather than a slide
 * dump — accordion sections, a two-column Do/Don't table, and a self-check the
 * learner actually ticks.
 *
 * Wording is the deck's verbatim (see data/dress-code-policy.ts). This is an
 * official HR policy: the interface may reorganise it, but nothing here may
 * reword it.
 *
 * The self-check is intentionally NOT persisted and NOT scored. It is slide
 * 10's "before you head out" prompt — a moment of reflection, not an
 * assessment — so recording it would misrepresent what it is.
 */

const GREEN = '#3d7350'
const GREEN_SOFT = '#e6f1e9'
const GOLD = '#7a5f13'

export default function DressCodePolicy() {
  const [open, setOpen] = useState<Set<string>>(new Set([DRESS_CODE_SECTIONS[0].id]))
  const [checked, setChecked] = useState<Set<number>>(new Set())

  const toggle = (id: string) =>
    setOpen((p) => {
      const n = new Set(p)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })

  const allChecked = checked.size === DRESS_CODE_SELF_CHECK.length

  return (
    <div className="space-y-4">
      <header className="rounded-2xl border border-hairline/12 bg-parchment p-5 sm:p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: GOLD }}>
          MAGPPIE · HR Policy
        </p>
        <h2 className="mt-1.5 font-serif text-2xl text-ink-primary">Dress Code Policy</h2>
        <p className="mt-2 max-w-[62ch] text-[13.5px] leading-relaxed text-ink-secondary">
          Part of the New Joiner Orientation Series. Read it through once, then use the quick
          reference and self-check whenever you need them.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <a
            href={DRESS_CODE_PDF}
            download
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-hairline/20 px-4 text-[13px] font-semibold text-ink-primary transition-colors hover:bg-[rgb(var(--rule)/0.05)]"
          >
            <Download size={15} aria-hidden /> Download the full policy (PDF)
          </a>
          {/* Kept visible rather than hidden: for an official policy it should
              be obvious that a signed-off source document exists. */}
          <a
            href={DRESS_CODE_DECK}
            download
            className="inline-flex min-h-[44px] items-center text-[12.5px] text-ink-secondary underline underline-offset-4 hover:text-ink-primary"
          >
            Original slide deck
          </a>
        </div>
      </header>

      {DRESS_CODE_SECTIONS.map((s, i) => (
        <Section key={s.id} section={s} index={i} open={open.has(s.id)} onToggle={() => toggle(s.id)} />
      ))}

      {/* Slide 10 — the interactive self-check. */}
      <section className="rounded-2xl border border-hairline/12 bg-parchment p-5 sm:p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: GOLD }}>
          Before you head out
        </p>
        <h3 className="mt-1.5 text-[16px] font-semibold text-ink-primary">Your quick self-check</h3>
        <ul className="mt-4 space-y-2">
          {DRESS_CODE_SELF_CHECK.map((q, i) => {
            const on = checked.has(i)
            return (
              <li key={q}>
                <button
                  type="button"
                  onClick={() =>
                    setChecked((p) => {
                      const n = new Set(p)
                      if (n.has(i)) n.delete(i)
                      else n.add(i)
                      return n
                    })
                  }
                  aria-pressed={on}
                  className={cn(
                    'flex min-h-[44px] w-full items-center gap-3 rounded-xl border px-4 text-left text-[13.5px] transition-colors',
                    on ? 'border-transparent text-ink-primary' : 'border-hairline/14 text-ink-secondary hover:bg-[rgb(var(--rule)/0.03)]',
                  )}
                  style={on ? { background: GREEN_SOFT, borderColor: 'rgba(61,115,80,0.3)' } : undefined}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'grid h-[20px] w-[20px] flex-shrink-0 place-items-center rounded-full border-2',
                    )}
                    style={
                      on
                        ? { background: GREEN, borderColor: GREEN }
                        : { borderColor: 'rgb(var(--rule)/0.3)' }
                    }
                  >
                    {on && <Check size={12} color="#fff" />}
                  </span>
                  {q}
                </button>
              </li>
            )
          })}
        </ul>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {allChecked ? (
            <p className="text-[13px] font-semibold" style={{ color: GREEN }}>
              You’re good to go.
            </p>
          ) : (
            <p className="text-[13px] text-ink-tertiary">
              {checked.size} of {DRESS_CODE_SELF_CHECK.length} checked
            </p>
          )}
          {checked.size > 0 && (
            <button
              type="button"
              onClick={() => setChecked(new Set())}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-tertiary hover:text-ink-primary"
            >
              <RotateCcw size={13} aria-hidden /> Reset
            </button>
          )}
        </div>
      </section>
    </div>
  )
}

function Section({
  section: s,
  index,
  open,
  onToggle,
}: {
  section: PolicySection
  index: number
  open: boolean
  onToggle: () => void
}) {
  const isDosDonts = s.id === 'dos-donts'
  return (
    <section className="overflow-hidden rounded-2xl border border-hairline/12 bg-parchment">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`dc-${s.id}`}
          className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-[rgb(var(--rule)/0.03)]"
        >
          <span className="text-[11px] font-bold tabular-nums text-ink-tertiary">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="flex-1">
            {s.eyebrow && (
              <span
                className="block text-[10px] font-bold uppercase tracking-[0.14em]"
                style={{ color: GOLD }}
              >
                {s.eyebrow}
              </span>
            )}
            <span className="block text-[15px] font-semibold text-ink-primary">{s.title}</span>
          </span>
          <ChevronDown
            size={16}
            aria-hidden
            className={cn('flex-shrink-0 text-ink-tertiary transition-transform', open && 'rotate-180')}
          />
        </button>
      </h3>

      {open && (
        <div id={`dc-${s.id}`} className="border-t border-hairline/10 px-5 py-5">
          {s.quote && (
            <blockquote
              className="mb-4 rounded-xl border-l-[3px] px-4 py-3 text-[14px] font-medium leading-relaxed text-ink-primary"
              style={{ borderColor: GOLD, background: 'rgb(var(--m-cream))' }}
            >
              “{s.quote}”
            </blockquote>
          )}
          {s.intro && (
            <p className="mb-4 text-[13.5px] leading-relaxed text-ink-secondary">{s.intro}</p>
          )}

          {s.points && (
            <ul className="space-y-2.5">
              {s.points.map((p, i) => (
                <li key={i} className="text-[13.5px] leading-relaxed text-ink-secondary">
                  {p.label && (
                    <span className="font-semibold text-ink-primary">{p.label}. </span>
                  )}
                  {p.text}
                </li>
              ))}
            </ul>
          )}

          {s.columns && (
            <div className="grid gap-4 sm:grid-cols-2">
              {s.columns.map((c) => {
                const isDont = isDosDonts && /don/i.test(c.heading)
                const isDo = isDosDonts && !isDont
                return (
                  <div
                    key={c.heading}
                    className="rounded-xl border p-4"
                    style={
                      isDo
                        ? { background: GREEN_SOFT, borderColor: 'rgba(61,115,80,0.28)' }
                        : isDont
                          ? { background: 'rgb(var(--m-cream))', borderColor: 'rgb(var(--rule)/0.16)' }
                          : { borderColor: 'rgb(var(--rule)/0.14)' }
                    }
                  >
                    <p
                      className="mb-2.5 text-[12px] font-bold uppercase tracking-wide"
                      style={{ color: isDo ? GREEN : isDont ? 'rgb(var(--m-ink-secondary))' : GOLD }}
                    >
                      {c.heading}
                    </p>
                    <ul className="space-y-2">
                      {c.items.map((it) => (
                        <li key={it} className="flex items-start gap-2 text-[13px] leading-snug text-ink-secondary">
                          {isDosDonts && (
                            <span aria-hidden className="mt-0.5 flex-shrink-0">
                              {isDo ? (
                                <Check size={13} style={{ color: GREEN }} />
                              ) : (
                                <X size={13} className="text-ink-tertiary" />
                              )}
                            </span>
                          )}
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          )}

          {s.footnote && (
            <p className="mt-4 rounded-xl px-4 py-3 text-[13px] leading-relaxed text-ink-primary" style={{ background: 'rgb(var(--m-cream))' }}>
              {s.footnote}
            </p>
          )}
        </div>
      )}
    </section>
  )
}
