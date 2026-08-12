'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CalendarDays, ChevronDown, FileText, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import KitchenBackdrop from '@/components/KitchenBackdrop'
import {
  FESTIVAL_LIST,
  POLICY_DOC_SOURCE,
  POLICY_SECTIONS,
  type PolicySection,
} from '@/data/policies'

/**
 * MAGPPIE Policies & Code of Conduct — an index of headings you open, not a
 * 34-page wall you scroll.
 *
 * Someone looking for the maternity leave policy wants that policy, not to
 * scroll past thirty pages to reach it. Headings are therefore the interface:
 * click "Maternity Leave" and only that policy opens. This deliberately
 * replaces the earlier continuous-scroll layout.
 *
 * Section 7 nests two levels deep in the source (7.3 Attendance & Leave →
 * 7.3 c) Leave Policy), so the tree mirrors that rather than flattening it.
 * Numbered list items inside a policy stay part of that policy's body — they
 * are steps within it, not policies of their own.
 *
 * Text is verbatim from the PDF (see data/policies.ts). Do not summarise it
 * here: the wording is the company's own and is load-bearing.
 *
 * Themed to match Onboarding: the same Soft Greens tones over the same moving
 * blue kitchen backdrop, so the two pages read as one flow.
 */

/** Soft Greens — the same family as the onboarding phases. */
const TONES = ['#8CA3B2', '#A9B183', '#B7C7AE', '#8CA687', '#6E8A6B', '#6F8899', '#8CA3B2']
const INK_DARK = new Set(['#A9B183', '#B7C7AE'])
const inkFor = (tone: string) => (INK_DARK.has(tone) ? '#2B2420' : '#FFFFFF')

interface PolicyGroup {
  section: PolicySection
  children: PolicySection[]
}
interface MajorNode {
  section: PolicySection
  tone: string
  /** Populated only for section 7. */
  groups: PolicyGroup[]
}

/** Rebuild the source's two-level nesting from the flat section list. */
function buildTree(): MajorNode[] {
  const majors: MajorNode[] = []
  let major: MajorNode | null = null
  let group: PolicyGroup | null = null
  let sub: PolicySection | null = null

  for (const s of POLICY_SECTIONS) {
    if (s.kind === 'major') {
      major = { section: { ...s, paras: [...s.paras] }, tone: TONES[majors.length % TONES.length], groups: [] }
      majors.push(major)
      group = null
      sub = null
    } else if (s.kind === 'policy') {
      group = { section: { ...s, paras: [...s.paras] }, children: [] }
      major?.groups.push(group)
      sub = null
    } else if (s.kind === 'sub') {
      sub = { ...s, paras: [...s.paras] }
      group?.children.push(sub)
    } else {
      // A numbered step inside a policy: folded into that policy's body so it
      // does not masquerade as a policy of its own.
      const line = `${s.num} ${s.title}`.trim()
      if (sub) sub.paras.push(line, ...s.paras)
      else if (group) group.section.paras.push(line, ...s.paras)
      else if (major) major.section.paras.push(line, ...s.paras)
    }
  }
  return majors
}

export default function Policies() {
  const tree = useMemo(buildTree, [])
  const [showHolidays, setShowHolidays] = useState(false)
  const [open, setOpen] = useState<Set<string>>(new Set())

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <div className="relative">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <KitchenBackdrop veil="blue" parallax />
      </div>

      <div className="mx-auto max-w-[880px] space-y-6 pb-16">
        <header>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeft size={13} /> Back to Onboarding
          </Link>
          <h1 className="mt-3 font-serif text-4xl font-normal text-white">
            Policies &amp; Code of Conduct
          </h1>
          <p className="mt-2 max-w-[620px] text-sm text-white/75">
            Open a heading to read that policy. Everything here is the company&rsquo;s own
            wording, reproduced as written.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowHolidays(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#6E8A6B] px-4 py-2 text-[13px] font-bold text-white transition-opacity hover:opacity-90"
            >
              <CalendarDays size={14} /> View holiday list
            </button>
            <span className="text-[11px] text-white/55">Source: {POLICY_DOC_SOURCE}</span>
          </div>
        </header>

        <div className="space-y-3">
          {tree.map((m) => {
            const isOpen = open.has(m.section.id)
            const ink = inkFor(m.tone)
            const hasGroups = m.groups.length > 0
            return (
              <section key={m.section.id} className="overflow-hidden rounded-2xl">
                <button
                  type="button"
                  onClick={() => toggle(m.section.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left transition-opacity hover:opacity-95"
                  style={{ backgroundColor: m.tone, color: ink }}
                >
                  <span className="font-serif text-[21px]">
                    <span style={{ opacity: 0.6 }}>{m.section.num} </span>
                    {m.section.title}
                  </span>
                  <span
                    className="ml-auto flex items-center gap-2 text-[11.5px]"
                    style={{ opacity: 0.8 }}
                  >
                    {hasGroups ? `${m.groups.length} groups` : `${m.section.paras.length} paras`}
                    <ChevronDown
                      size={17}
                      className={cn('transition-transform', isOpen && 'rotate-180')}
                    />
                  </span>
                </button>

                {isOpen && (
                  <div className="space-y-3 bg-cream px-5 py-4">
                    {m.section.paras.length > 0 && (
                      <div className="space-y-2.5">
                        {m.section.paras.map((p, i) => (
                          <p key={i} className="text-[13.5px] leading-relaxed text-ink-secondary">
                            {p}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Section 7: each group opens to its own list of policies. */}
                    {hasGroups &&
                      m.groups.map((g) => {
                        const gOpen = open.has(g.section.id)
                        return (
                          <div
                            key={g.section.id}
                            className="overflow-hidden rounded-xl border border-[rgb(var(--rule)/0.14)]"
                          >
                            <button
                              type="button"
                              onClick={() => toggle(g.section.id)}
                              aria-expanded={gOpen}
                              className="flex w-full items-center gap-2 bg-white px-4 py-3 text-left transition-colors hover:bg-cream/70"
                            >
                              <span className="text-[13.5px] font-bold uppercase tracking-wide text-ink-primary">
                                <span className="text-ink-tertiary">{g.section.num} </span>
                                {g.section.title}
                              </span>
                              <span className="ml-auto flex items-center gap-2 text-[11px] text-ink-tertiary">
                                {g.children.length} policies
                                <ChevronDown
                                  size={15}
                                  className={cn('transition-transform', gOpen && 'rotate-180')}
                                />
                              </span>
                            </button>

                            {gOpen && (
                              <ul className="divide-y divide-[rgb(var(--rule)/0.08)] bg-cream">
                                {g.children.map((c) => {
                                  const cOpen = open.has(c.id)
                                  return (
                                    <li key={c.id}>
                                      <button
                                        type="button"
                                        onClick={() => toggle(c.id)}
                                        aria-expanded={cOpen}
                                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-white/70"
                                      >
                                        <FileText
                                          size={13}
                                          className="flex-shrink-0 text-ink-tertiary"
                                        />
                                        <span className="text-[13px] font-semibold text-ink-primary">
                                          {c.title}
                                        </span>
                                        <ChevronDown
                                          size={14}
                                          className={cn(
                                            'ml-auto flex-shrink-0 text-ink-tertiary transition-transform',
                                            cOpen && 'rotate-180',
                                          )}
                                        />
                                      </button>
                                      {cOpen && (
                                        <div className="space-y-2.5 bg-white px-4 pb-4 pt-1">
                                          {c.paras.map((p, i) => (
                                            <p
                                              key={i}
                                              className="text-[13px] leading-relaxed text-ink-secondary"
                                            >
                                              {p}
                                            </p>
                                          ))}
                                        </div>
                                      )}
                                    </li>
                                  )
                                })}
                              </ul>
                            )}
                          </div>
                        )
                      })}
                  </div>
                )}
              </section>
            )
          })}
        </div>

        {showHolidays && <HolidayModal onClose={() => setShowHolidays(false)} />}
      </div>
    </div>
  )
}

/**
 * Holiday list as a modal rather than more scroll: it is a lookup table people
 * come back to, not something you read once in sequence.
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
        className="max-h-[82vh] w-full max-w-[560px] overflow-y-auto rounded-2xl bg-cream p-6"
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
            className="rounded-full p-1.5 text-ink-tertiary transition-colors hover:bg-white hover:text-ink-primary"
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
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={
                        reserved
                          ? { backgroundColor: '#A9B18333', color: '#5A6136' }
                          : { backgroundColor: '#8CA68733', color: '#3F5B3C' }
                      }
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
