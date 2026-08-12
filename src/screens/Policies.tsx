'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CalendarDays, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { acknowledgePolicies, readOnboarding } from '@/lib/onboarding-progress'
import {
  FESTIVAL_LIST,
  POLICY_DOC_SOURCE,
  POLICY_SECTIONS,
  POLICY_TOC,
} from '@/data/policies'

/**
 * MAGPPIE Policies & Code of Conduct.
 *
 * One continuously scrollable document, top to bottom, in the source's own
 * order. Deliberately NO accordions and no collapsing — everything is visible
 * and searchable with the browser's own find, which is what people actually
 * reach for in a policy document.
 *
 * The jump-links at the top are the one concession to 34 pages of scrolling:
 * they only scroll, they never hide anything, so the "simple scroll" rule
 * holds. They were flagged as optional and are cheap — a filter over the same
 * section list, not a second navigation model.
 *
 * Text is verbatim from the PDF (see data/policies.ts). Do not summarise it
 * here: the wording is the company's own and is load-bearing.
 */
export default function Policies() {
  const [showHolidays, setShowHolidays] = useState(false)
  return (
    <div className="mx-auto max-w-[820px] space-y-8 pb-16">
      <header className="border-b border-[rgb(var(--rule)/0.1)] pb-6">
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-tertiary transition-colors hover:text-ink-primary"
        >
          <ArrowLeft size={13} /> Back to Onboarding
        </Link>
        <h1 className="mt-3 font-serif text-4xl font-normal text-ink-primary">
          Policies &amp; Code of Conduct
        </h1>
        <p className="mt-2 text-sm text-ink-secondary">
          The full MAGPPIE policy document, reproduced as written. Use your browser&rsquo;s find
          (⌘F) to search it.
        </p>
        <p className="mt-1 text-[11px] text-ink-tertiary">Source: {POLICY_DOC_SOURCE}</p>
        {/* The holiday table is a lookup, not a read-through — it opens as a
            modal instead of sitting at the end of 34 pages of scroll. */}
        <button
          type="button"
          onClick={() => setShowHolidays(true)}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-accent-copper/45 bg-accent-copper/5 px-4 py-2 text-[13px] font-semibold text-accent-copper transition-colors hover:bg-accent-copper/10"
        >
          <CalendarDays size={14} /> View holiday list
        </button>
      </header>

      {/* Jump links — scrolling only; nothing is hidden or collapsed. */}
      <nav
        aria-label="Jump to section"
        className="sticky top-2 z-10 rounded-2xl border border-[rgb(var(--rule)/0.12)] bg-parchment/95 px-4 py-3 backdrop-blur-[2px]"
      >
        <p className="text-[10px] uppercase tracking-[0.18em] text-ink-tertiary">Jump to</p>
        <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1.5">
          {POLICY_TOC.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="text-[12px] font-medium text-ink-secondary underline-offset-2 transition-colors hover:text-accent-copper hover:underline"
              >
                {s.num} {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <article className="space-y-7">
        {POLICY_SECTIONS.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-24">
            <h2
              className={cn(
                'text-ink-primary',
                s.kind === 'major'
                  ? 'border-b border-[rgb(var(--rule)/0.12)] pb-2 font-serif text-[26px] font-normal'
                  : s.kind === 'policy'
                    ? 'mt-4 text-[17px] font-bold uppercase tracking-wide text-accent-copper'
                    : s.kind === 'sub'
                      ? 'mt-2 text-[15px] font-bold'
                      : // numbered list item inside a policy — body weight
                        'mt-1 text-[13.5px] font-semibold',
              )}
            >
              {s.num && <span className="text-ink-tertiary">{s.num} </span>}
              {s.title}
            </h2>
            {s.paras.length > 0 && (
              <div className="mt-2.5 space-y-2.5">
                {s.paras.map((p, i) => (
                  <p key={i} className="text-[13.5px] leading-relaxed text-ink-secondary">
                    {p}
                  </p>
                ))}
              </div>
            )}
          </section>
        ))}

      </article>

      <AcknowledgeGate />

      {showHolidays && <HolidayModal onClose={() => setShowHolidays(false)} />}
    </div>
  )
}

/**
 * Holiday list as a modal rather than more scroll: it is a lookup table people
 * come back to, not something you read once in sequence, so it does not belong
 * buried at the end of 34 pages.
 */
function HolidayModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Festival list"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[82vh] w-full max-w-[560px] overflow-y-auto rounded-2xl bg-white p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl text-ink-primary">Festival List</h2>
            <p className="mt-0.5 text-[12px] text-ink-tertiary">
              {FESTIVAL_LIST.length} holidays. Those marked * are reserved (floating) holidays.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-ink-tertiary transition-colors hover:bg-cream hover:text-ink-primary"
          >
            <X size={18} />
          </button>
        </div>

        <table className="mt-4 w-full text-[13px]">
          <thead>
            <tr className="text-left text-ink-tertiary">
              <th className="py-1.5 pr-3 font-medium">No.</th>
              <th className="py-1.5 pr-3 font-medium">Holiday</th>
              <th className="py-1.5 pr-3 font-medium">Date</th>
              <th className="py-1.5 pr-3 font-medium">Day</th>
              <th className="py-1.5 font-medium">Type</th>
            </tr>
          </thead>
          <tbody>
            {FESTIVAL_LIST.map((f) => {
              const reserved = f.name.includes('*')
              return (
                <tr key={f.n} className="border-t border-[rgb(var(--rule)/0.08)]">
                  <td className="py-1.5 pr-3 tabular-nums text-ink-tertiary">{f.n}</td>
                  <td className="py-1.5 pr-3 text-ink-primary">{f.name.replace(/\*/g, '')}</td>
                  <td className="py-1.5 pr-3 text-ink-secondary">{f.date}</td>
                  <td className="py-1.5 pr-3 text-ink-secondary">{f.day}</td>
                  <td className="py-1.5">
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-medium',
                        reserved
                          ? 'bg-accent-gold/20 text-accent-copper'
                          : 'bg-surface-sage/25 text-ink-secondary',
                      )}
                    >
                      {reserved ? 'Reserved' : 'Fixed'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/**
 * The acknowledgment gate.
 *
 * Real, not decorative: until this is confirmed the Onboarding checklist stays
 * locked (see Onboarding.tsx). It writes into the same onboarding record that
 * tracks task completion rather than into a separate flag, so "have they
 * acknowledged" is answered from the same place as "how far along are they".
 *
 * Once given it is never overwritten — re-reading the document later does not
 * reset or re-date the acknowledgment.
 */
function AcknowledgeGate() {
  const [checked, setChecked] = useState(false)
  const [ackAt, setAckAt] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setAckAt(readOnboarding().policiesAcknowledgedAt)
    setHydrated(true)
  }, [])

  if (!hydrated) return null

  if (ackAt) {
    return (
      <section className="rounded-2xl border-2 border-surface-sage/50 bg-surface-sage/10 p-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink-primary">
          <Check size={17} className="text-surface-sage" />
          You have acknowledged these policies
        </p>
        <p className="mt-1 text-[12px] text-ink-tertiary">
          Recorded {new Date(ackAt).toLocaleString()}. Your onboarding checklist is unlocked.
        </p>
        <Link
          href="/onboarding"
          className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent-copper hover:underline"
        >
          Continue onboarding <ArrowRight size={14} />
        </Link>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border-2 border-accent-copper/45 bg-accent-copper/5 p-5">
      <h2 className="text-sm font-semibold text-ink-primary">Acknowledgment required</h2>
      <p className="mt-1 max-w-[560px] text-[12.5px] text-ink-secondary">
        Your onboarding checklist stays locked until you confirm you have read these policies.
      </p>
      <label className="mt-3 flex cursor-pointer items-start gap-2.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-0.5 h-4 w-4 flex-shrink-0 accent-[color:var(--tw-color-accent-copper,#B8703F)]"
        />
        <span className="text-[13.5px] text-ink-primary">
          I have read and understood these policies
        </span>
      </label>
      <button
        type="button"
        disabled={!checked}
        onClick={() => setAckAt(acknowledgePolicies())}
        className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-accent-copper px-5 py-2.5 text-[13.5px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Confirm <ArrowRight size={15} />
      </button>
      <p className="mt-2.5 text-[11px] text-ink-tertiary">
        Saved in this browser. It is not sent to a server — per-employee records need the
        onboarding_progress table wiring up, so this is not yet an auditable record of acceptance.
      </p>
    </section>
  )
}
