'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
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

        {/* Festival list — a table in the source, kept as one. */}
        <section id="festival-list" className="scroll-mt-24">
          <h2 className="border-b border-[rgb(var(--rule)/0.12)] pb-2 font-serif text-[26px] font-normal text-ink-primary">
            Festival List
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-[13px]">
              <thead>
                <tr className="text-left text-ink-tertiary">
                  <th className="py-1.5 pr-3 font-medium">No.</th>
                  <th className="py-1.5 pr-3 font-medium">Holiday</th>
                  <th className="py-1.5 pr-3 font-medium">Date</th>
                  <th className="py-1.5 font-medium">Day</th>
                </tr>
              </thead>
              <tbody>
                {FESTIVAL_LIST.map((f) => (
                  <tr key={f.n} className="border-t border-[rgb(var(--rule)/0.08)]">
                    <td className="py-1.5 pr-3 tabular-nums text-ink-tertiary">{f.n}</td>
                    <td className="py-1.5 pr-3 text-ink-primary">{f.name}</td>
                    <td className="py-1.5 pr-3 text-ink-secondary">{f.date}</td>
                    <td className="py-1.5 text-ink-secondary">{f.day}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[12px] text-ink-tertiary">* shows RESERVED HOLIDAYS.</p>
        </section>
      </article>
    </div>
  )
}
