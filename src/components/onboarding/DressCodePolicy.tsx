'use client'

import { useState } from 'react'
import {
  BadgeCheck,
  Check,
  ChevronDown,
  Download,
  Droplets,
  Hand,
  Ruler,
  RotateCcw,
  Scissors,
  Shirt,
  Users,
  Wind,
  X,
} from 'lucide-react'
import {
  DRESS_CODE_PDF,
  DRESS_CODE_SECTIONS,
  DRESS_CODE_SELF_CHECK,
  type PolicyIcon,
  type PolicySection,
} from '@/data/dress-code-policy'
import { cn } from '@/lib/utils'

/**
 * The Dress Code Policy, inside Day 1's Policies view.
 *
 * Rebuilt against the updated deck. Structure follows how people actually use
 * a policy: scan seven headings, open the one you need. Only one section is
 * open at a time, so the list of headings stays visible as a map instead of
 * scrolling away under expanded text.
 *
 * Wording is the deck's verbatim (see data/dress-code-policy.ts). This is an
 * official HR policy: the interface may reorganise it, but nothing here may
 * reword it.
 *
 * Two deliberate absences:
 *   - No "I have read and understood" gate. It was removed from the Policies
 *     view on purpose and is not reintroduced here.
 *   - The self-check is NOT persisted, NOT scored and gates nothing. It is a
 *     reflection prompt; recording it would turn it into an assessment.
 */

const GREEN = '#3d7350'
const GREEN_SOFT = '#e4efe8'
const RED = '#9b2c2c'
const RED_SOFT = '#f7e8e8'
const GOLD = '#7a5f13'

const ICONS: Record<PolicyIcon, typeof BadgeCheck> = {
  badge: BadgeCheck,
  shirt: Shirt,
  ruler: Ruler,
  users: Users,
  scissors: Scissors,
  hand: Hand,
  droplet: Droplets,
  wind: Wind,
}

export default function DressCodePolicy() {
  // One at a time. `null` closes everything; the first section starts open so
  // the section never reads as an empty stack of bars.
  const [openId, setOpenId] = useState<string | null>(DRESS_CODE_SECTIONS[0].id)
  const [checked, setChecked] = useState<Set<number>>(new Set())

  const allChecked = checked.size === DRESS_CODE_SELF_CHECK.length

  return (
    <div className="space-y-3">
      <header className="rounded-2xl border-2 border-hairline/15 bg-parchment p-5 sm:p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: GOLD }}>
          MAGPPIE · HR Policy
        </p>
        <h2 className="mt-1.5 font-serif text-2xl text-ink-primary">Dress Code Policy</h2>
        <p className="mt-2 max-w-[62ch] text-[13.5px] leading-relaxed text-ink-secondary">
          Part of the New Joiner Orientation Series. Scan the headings, open what you need, and keep
          the quick reference and self-check for later.
        </p>
        <a
          href={DRESS_CODE_PDF}
          download
          className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-full border-2 border-hairline/20 px-4 text-[13px] font-semibold text-ink-primary transition-colors hover:bg-[rgb(var(--rule)/0.05)]"
        >
          <Download size={15} aria-hidden /> Download the policy (PDF)
        </a>
      </header>

      {DRESS_CODE_SECTIONS.map((s, i) => (
        <Section
          key={s.id}
          section={s}
          index={i}
          open={openId === s.id}
          onToggle={() => setOpenId((cur) => (cur === s.id ? null : s.id))}
        />
      ))}

      {/* The visual finish, not another accordion. */}
      <section
        className="rounded-2xl border-2 p-5 sm:p-6"
        style={{ background: GREEN_SOFT, borderColor: 'rgba(61,115,80,0.32)' }}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: GREEN }}>
          Before you head out
        </p>
        <h3 className="mt-1.5 text-[17px] font-semibold text-ink-primary">Your quick self-check</h3>
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
                    'flex min-h-[44px] w-full items-center gap-3 rounded-xl border-2 px-4 py-2 text-left text-[13.5px] font-medium transition-colors',
                    on ? 'text-ink-primary' : 'border-transparent bg-parchment text-ink-secondary hover:bg-[rgb(var(--rule)/0.04)]',
                  )}
                  style={on ? { background: '#fff', borderColor: GREEN } : undefined}
                >
                  <span
                    aria-hidden
                    className="grid h-[21px] w-[21px] flex-shrink-0 place-items-center rounded-md border-2"
                    style={
                      on
                        ? { background: GREEN, borderColor: GREEN }
                        : { borderColor: 'rgb(var(--rule)/0.35)' }
                    }
                  >
                    {on && <Check size={13} color="#fff" strokeWidth={3} />}
                  </span>
                  {q}
                </button>
              </li>
            )
          })}
        </ul>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {allChecked ? (
            <p className="text-[14px] font-bold" style={{ color: GREEN }}>
              You’re good to go.
            </p>
          ) : (
            <p className="text-[13px] text-ink-secondary">
              {checked.size} of {DRESS_CODE_SELF_CHECK.length} checked
            </p>
          )}
          {checked.size > 0 && (
            <button
              type="button"
              onClick={() => setChecked(new Set())}
              className="inline-flex min-h-[32px] items-center gap-1.5 text-[13px] font-medium text-ink-secondary hover:text-ink-primary"
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
  return (
    <section className="overflow-hidden rounded-2xl border-2 border-hairline/15 bg-parchment">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`dc-${s.id}`}
          className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-[rgb(var(--rule)/0.04)]"
        >
          <span className="text-[12px] font-bold tabular-nums" style={{ color: GOLD }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="flex-1">
            <span
              className="block text-[10px] font-bold uppercase tracking-[0.14em]"
              style={{ color: GOLD }}
            >
              {s.eyebrow}
            </span>
            <span className="block text-[15px] font-semibold text-ink-primary">{s.title}</span>
          </span>
          <ChevronDown
            size={17}
            aria-hidden
            className={cn(
              'flex-shrink-0 text-ink-secondary transition-transform',
              open && 'rotate-180',
            )}
          />
        </button>
      </h3>

      {open && (
        <div id={`dc-${s.id}`} className="border-t-2 border-hairline/10 px-5 py-5">
          {s.intro && (
            <p className="text-[13.5px] leading-relaxed text-ink-secondary">{s.intro}</p>
          )}

          {s.pullQuote && (
            <blockquote
              className="my-5 border-l-4 pl-4 font-serif text-[19px] leading-snug text-ink-primary sm:text-[21px]"
              style={{ borderColor: GOLD }}
            >
              {s.pullQuote}
            </blockquote>
          )}

          {s.points &&
            (s.pointsAsCards ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {s.points.map((p) => {
                  const Icon = p.icon ? ICONS[p.icon] : BadgeCheck
                  return (
                    <div
                      key={p.label}
                      className="rounded-xl border-2 border-hairline/12 bg-cream p-4"
                    >
                      <Icon size={19} aria-hidden style={{ color: GOLD }} />
                      <p className="mt-2 text-[13.5px] font-bold text-ink-primary">{p.label}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-ink-secondary">{p.text}</p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <ul className={cn('space-y-2.5', (s.intro || s.pullQuote) && 'mt-1')}>
                {s.points.map((p, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-ink-secondary"
                  >
                    <span
                      aria-hidden
                      className="mt-[7px] h-[6px] w-[6px] flex-shrink-0 rounded-full"
                      style={{ background: GOLD }}
                    />
                    <span>
                      {p.label && <span className="font-semibold text-ink-primary">{p.label}. </span>}
                      {p.text}
                    </span>
                  </li>
                ))}
              </ul>
            ))}

          {s.columns && (
            <div className="grid gap-4 sm:grid-cols-2">
              {s.columns.map((c) => (
                <div key={c.heading} className="rounded-xl border-2 border-hairline/12 bg-cream p-4">
                  <p className="text-[12px] font-bold uppercase tracking-wide" style={{ color: GOLD }}>
                    {c.heading}
                  </p>
                  {c.note && (
                    <p className="mt-0.5 text-[11.5px] font-medium text-ink-secondary">{c.note}</p>
                  )}
                  <ul className="mt-3 space-y-2">
                    {c.items.map((it) => (
                      <li
                        key={it}
                        className="flex items-start gap-2 text-[13px] leading-snug text-ink-secondary"
                      >
                        <span
                          aria-hidden
                          className="mt-[6px] h-[5px] w-[5px] flex-shrink-0 rounded-full"
                          style={{ background: GOLD }}
                        />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Do / Don't. Paired rows so each Do sits opposite the Don't it
              answers. On a phone the pair stacks rather than becoming two
              unreadable columns. */}
          {s.pairs && (
            <div>
              <div className="hidden grid-cols-2 gap-3 pb-2 sm:grid">
                <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide" style={{ color: GREEN }}>
                  <Check size={14} strokeWidth={3} aria-hidden /> Do
                </p>
                <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide" style={{ color: RED }}>
                  <X size={14} strokeWidth={3} aria-hidden /> Don’t
                </p>
              </div>
              <ul className="space-y-3">
                {s.pairs.map((p) => (
                  <li key={p.doItem} className="grid gap-2 sm:grid-cols-2 sm:gap-3">
                    <div
                      className="flex items-start gap-2 rounded-xl border-2 p-3 text-[13px] leading-snug text-ink-primary"
                      style={{ background: GREEN_SOFT, borderColor: 'rgba(61,115,80,0.3)' }}
                    >
                      <Check
                        size={15}
                        strokeWidth={3}
                        aria-hidden
                        className="mt-[1px] flex-shrink-0"
                        style={{ color: GREEN }}
                      />
                      <span>
                        <span className="sr-only">Do: </span>
                        {p.doItem}
                      </span>
                    </div>
                    <div
                      className="flex items-start gap-2 rounded-xl border-2 p-3 text-[13px] leading-snug text-ink-primary"
                      style={{ background: RED_SOFT, borderColor: 'rgba(155,44,44,0.28)' }}
                    >
                      <X
                        size={15}
                        strokeWidth={3}
                        aria-hidden
                        className="mt-[1px] flex-shrink-0"
                        style={{ color: RED }}
                      />
                      <span>
                        <span className="sr-only">Don’t: </span>
                        {p.dontItem}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Corrective measures as an ordered two-step sequence — supportive
              in tone, per the deck. Deliberately not styled as a warning. */}
          {s.stages && (
            <ol className="mt-5 space-y-3">
              {s.stages.map((st, i) => (
                <li key={st.label} className="flex gap-3">
                  <span
                    aria-hidden
                    className="grid h-[30px] w-[30px] flex-shrink-0 place-items-center rounded-full border-2 text-[12px] font-bold"
                    style={{ borderColor: GOLD, color: GOLD }}
                  >
                    {i + 1}
                  </span>
                  <div className="rounded-xl border-2 border-hairline/12 bg-cream p-3.5">
                    <p className="text-[13.5px] font-bold text-ink-primary">
                      Stage {i + 1} — {st.label}
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink-secondary">{st.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}

          {s.highlight && (
            <p
              className="mt-4 rounded-xl border-l-4 px-4 py-3 text-[13.5px] font-semibold leading-relaxed text-ink-primary"
              style={{ borderColor: GOLD, background: 'rgb(var(--m-cream))' }}
            >
              {s.highlight}
            </p>
          )}

          {s.footnote && (
            <p
              className="mt-4 rounded-xl px-4 py-3 text-[13px] leading-relaxed text-ink-secondary"
              style={{ background: 'rgb(var(--m-cream))' }}
            >
              {s.footnote}
            </p>
          )}
        </div>
      )}
    </section>
  )
}
