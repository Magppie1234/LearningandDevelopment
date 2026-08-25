'use client'

import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Inline visuals for the Pre-Sales and Sales modules.
 *
 * EVERY fact rendered here is lifted from the module text it sits beside —
 * Pre-Sales_Training.docx and Sales_Training.docx in content/source-docs.
 * Nothing is inferred, rounded or filled in. Where a doc leaves a value open
 * (the annual "what changed this year" line), the placeholder is rendered as a
 * placeholder rather than resolved.
 *
 * Styling follows the Process Flow system: white cards, generous space, one
 * quiet accent (gold), small icons, and status colour only where it means
 * something. Green = the approved/included side, grey = the excluded or
 * routed-away side.
 */

const GOLD = '#9c7a1b'
const GOLD_SOFT = '#f5efdf'
const GREEN = '#4e8c63'
const GREEN_SOFT = '#e6f1e9'

/* ── shared shells ─────────────────────────────────────────────────────── */

function Frame({
  label,
  title,
  children,
}: {
  label: string
  title: string
  children: React.ReactNode
}) {
  return (
    <figure className="my-6 rounded-2xl border border-[rgb(var(--rule)/0.12)] bg-parchment p-5 sm:p-6">
      <figcaption className="mb-4">
        <span
          className="block text-[10px] font-bold uppercase tracking-[0.16em]"
          style={{ color: GOLD }}
        >
          {label}
        </span>
        <span className="mt-1 block text-[15px] font-semibold text-ink-primary">{title}</span>
      </figcaption>
      {children}
    </figure>
  )
}

/** One step in a vertical flow, with the connector running through it. */
function Node({
  children,
  tone = 'neutral',
  last,
}: {
  children: React.ReactNode
  tone?: 'neutral' | 'go' | 'stop'
  last?: boolean
}) {
  const dot =
    tone === 'go' ? GREEN : tone === 'stop' ? 'rgba(50,62,72,0.34)' : GOLD
  return (
    <li className="relative pl-7 pb-4 last:pb-0">
      {!last && (
        <span
          aria-hidden
          className="absolute left-[5px] top-4 bottom-0 w-px"
          style={{ background: 'rgba(50,62,72,0.16)' }}
        />
      )}
      <span
        aria-hidden
        className="absolute left-0 top-[5px] h-[11px] w-[11px] rounded-full"
        style={{ background: dot }}
      />
      <div className="text-[13.5px] leading-relaxed text-ink-secondary">{children}</div>
    </li>
  )
}

/* ── 1. Answer-or-route decision chart (Pre-Sales, "The rule for this role") ── */

function AnswerOrRoute() {
  return (
    <Frame label="Pre-Sales · the rule" title="Do you answer it, or does it go to Sales?">
      <div className="rounded-xl px-4 py-3 text-[13.5px] font-medium text-ink-primary" style={{ background: GOLD_SOFT }}>
        A client asks you something.
      </div>
      <p className="mt-3 mb-3 text-center text-[12.5px] font-semibold text-ink-primary">
        Does answering it need to know <em>their</em> kitchen?
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border p-4" style={{ borderColor: 'rgba(78,140,99,0.3)', background: GREEN_SOFT }}>
          <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: GREEN }}>
            No → answer it
          </p>
          <ul className="mt-2 space-y-1 text-[13px] text-ink-secondary">
            {['Prices', 'Cities', 'Materials', 'Process', 'Payment terms'].map((x) => (
              <li key={x} className="flex items-center gap-2">
                <Check size={13} style={{ color: GREEN }} aria-hidden /> {x}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-[rgb(var(--rule)/0.16)] bg-cream p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-tertiary">
            Yes → route to Sales
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-secondary">
            Capture the floor plan <strong className="text-ink-primary">first</strong>, in the same
            sentence as the handoff.
          </p>
        </div>
      </div>
      <p className="mt-4 rounded-xl border-l-[3px] px-4 py-3 text-[13px] leading-relaxed text-ink-primary" style={{ borderColor: GOLD, background: GOLD_SOFT }}>
        If there is no approved answer, never guess. Offer to have the right person confirm and
        come back.
      </p>
    </Frame>
  )
}

/* ── 2. Price-answer flow (Pre-Sales, Part 1 price section) ───────────── */

function PriceAnswerFlow() {
  return (
    <Frame label="Pre-Sales · Part 1" title="Answering “what does it cost?”">
      <ol className="list-none m-0 p-0">
        <Node>“What does it cost?”</Node>
        <Node tone="go">Priced <strong className="text-ink-primary">per square foot of cabinet area</strong>.</Node>
        <Node tone="go">
          For a 100 sq ft kitchen: roughly <strong className="text-ink-primary">₹6 lakh</strong> (Wellness
          First) up to roughly <strong className="text-ink-primary">₹12 lakh</strong> (Wellness Pro).
        </Node>
        <Node tone="go" last>
          <span className="font-semibold text-ink-primary">Always add this line:</span> 100 square
          feet means the width and height of all the cabinets added together — not the floor area
          of the room.
        </Node>
      </ol>
      <div className="mt-4 rounded-xl border border-[rgb(var(--rule)/0.16)] bg-cream p-4">
        <p className="text-[12.5px] font-semibold text-ink-primary">
          If they ask “what will <em>mine</em> cost?”
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-secondary">
          That needs a quotation, which is not a phone-call answer. Capture the floor plan and
          route to Sales.
        </p>
      </div>
      <p className="mt-3 text-[12.5px] leading-relaxed text-ink-tertiary">
        Skipping the cabinet-area line is why this question goes wrong so often — a client who
        thinks you mean floor area has badly misjudged what their kitchen costs.
      </p>
    </Frame>
  )
}

/* ── 3. Floor-plan capture flow (Pre-Sales, Part 3) ───────────────────── */

const RESISTANCE = [
  {
    why: 'They think it commits them to something',
    fix: '“There is nothing to pay until you have seen a design and a quotation.”',
  },
  {
    why: 'They do not have it to hand, and mean to look later',
    fix: 'Do not end with “send it when you can.” Ask what they have right now — a builder’s PDF, a photo of a printed plan, even a phone photo of the empty room with rough measurements.',
  },
  {
    why: 'They are not sure what you mean by a floor plan',
    fix: 'Tell them what you need: the kitchen area, rough dimensions, where the door and window are, where the plumbing enters.',
  },
]

function FloorPlanFlow() {
  return (
    <Frame label="Pre-Sales · Part 3" title="Getting the floor plan out of the call">
      <div className="space-y-3">
        {RESISTANCE.map((r, i) => (
          <div key={i} className="rounded-xl border border-[rgb(var(--rule)/0.14)] bg-cream/60 p-4">
            <p className="text-[13px] font-semibold text-ink-primary">{r.why}</p>
            <p className="mt-1.5 flex gap-2 text-[13px] leading-relaxed text-ink-secondary">
              <span aria-hidden style={{ color: GOLD }}>→</span>
              <span>{r.fix}</span>
            </p>
          </div>
        ))}
      </div>
      <p className="mt-5 mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-tertiary">
        Also capture, while you have them
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {[
          'What they have today and what is wrong with it',
          'Roughly when they want it done',
          'Whether they have possession yet',
          'Who else is involved in the decision',
        ].map((x) => (
          <li key={x} className="flex items-start gap-2 text-[13px] text-ink-secondary">
            <Check size={13} className="mt-1 flex-shrink-0" style={{ color: GREEN }} aria-hidden />
            {x}
          </li>
        ))}
      </ul>
      <p className="mt-4 rounded-xl px-4 py-3 text-[13px] font-medium text-ink-primary" style={{ background: GOLD_SOFT }}>
        Log it in Zoho before the next call — not at the end of the day. What you remember at 6pm
        is not what happened at 11am.
      </p>
    </Frame>
  )
}

/* ── 4. Sales-ready checklist (Pre-Sales, Part 4) ─────────────────────── */

const SALES_READY = [
  'Floor plan or dimensions captured',
  'Requirement and timeline understood',
  'Budget expectation set honestly against the real range',
  'The next step is booked, not vague',
  'Everything logged in Zoho',
]

function SalesReadyChecklist() {
  return (
    <Frame label="Pre-Sales · Part 4" title="Sales-ready means all five are true">
      <ul className="space-y-2.5">
        {SALES_READY.map((x) => (
          <li key={x} className="flex items-start gap-3 rounded-xl border p-3" style={{ borderColor: 'rgba(78,140,99,0.28)', background: GREEN_SOFT }}>
            <span
              aria-hidden
              className="mt-[1px] grid h-[18px] w-[18px] flex-shrink-0 place-items-center rounded-full"
              style={{ background: GREEN }}
            >
              <Check size={11} color="#fff" />
            </span>
            <span className="text-[13.5px] leading-snug text-ink-primary">{x}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[12.5px] leading-relaxed text-ink-tertiary">
        A warm handover with no floor plan and no logged detail is the most common failure. Sales
        starts from scratch, the client repeats themselves, and the second conversation is worse
        than the first.
      </p>
    </Frame>
  )
}

/* ── 5. Customer journey with payment gates (Sales, Part 4) ───────────── */

const JOURNEY = [
  { step: 'Enquiry and first call', pay: null },
  { step: 'Visit and design', pay: null },
  { step: 'Order booked', pay: '50%', note: 'The moment of commitment. Site measurement comes after this, not before.' },
  { step: 'Drawings frozen', pay: '30%', note: 'Drawings lock and go to the factory. The client should understand this before signing, not after.' },
  { step: 'Manufacturing — 75 to 90 days', pay: null },
  { step: 'Dispatch and install', pay: '20%', note: 'Paid two weeks before dispatch. Routine, unless an earlier conversation was rushed.' },
]

function JourneyWithGates() {
  return (
    <Frame label="Sales · Part 4" title="Owning the client through the three payment stages">
      <ol className="list-none m-0 p-0">
        {JOURNEY.map((j, i) => (
          <Node key={j.step} tone={j.pay ? 'neutral' : 'stop'} last={i === JOURNEY.length - 1}>
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn('text-[13.5px]', j.pay ? 'font-semibold text-ink-primary' : 'text-ink-secondary')}>
                {j.step}
              </span>
              {j.pay && (
                <span
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                  style={{ background: GOLD, color: '#fff' }}
                >
                  Pay {j.pay}
                </span>
              )}
            </div>
            {j.note && <p className="mt-1 text-[12.5px] leading-relaxed text-ink-tertiary">{j.note}</p>}
          </Node>
        ))}
      </ol>
      <p className="mt-4 text-[12.5px] leading-relaxed text-ink-tertiary">
        Before anything is paid, the basic design and quotation cost the client nothing. Say so
        early — the fear of being charged for a conversation is what keeps people from sharing a
        floor plan.
      </p>
    </Frame>
  )
}

/* ── 6. Objection cards (Sales, Part 3) ───────────────────────────────── */

const OBJECTIONS = [
  {
    says: 'That is more than I expected.',
    does: 'Check they have not misread the square footage before you defend the price. Many objections that sound like price are actually arithmetic.',
  },
  {
    says: 'Can you do anything on the price?',
    does: 'Pricing is fixed and applies equally to everyone — a policy, not a negotiating position. Move the conversation to scope: what a complete solution looks like, which range fits, what is genuinely optional.',
  },
  {
    says: '75 to 90 days is a long time.',
    does: 'It is a factory-made kitchen, not an assembled one. Around 60 days is sometimes possible for urgent requirements, but it is an exception, not a lever.',
  },
  {
    says: 'Why is there no wood?',
    does: 'This is not an objection, it is the pitch. Non-porous, no termites, no bacteria, no fungus, silver and copper inside the material rather than coated on. Twenty-five years on that guarantee.',
  },
  {
    says: 'How do I know it will last?',
    does: 'Do not argue — offer. Every kitchen ships with a named Bill of Materials, test certificates can be provided, and we actively want clients to handle and test the material before ordering.',
  },
  {
    says: 'I want to see one that is actually installed.',
    does: 'Yes, where we have a project in their city, subject to the homeowner’s permission. Never promise a date you do not control.',
  },
]

function ObjectionCards() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <Frame label="Sales · Part 3" title="Six moments where the facts are not the problem">
      <div className="space-y-2">
        {OBJECTIONS.map((o, i) => {
          const isOpen = open === i
          return (
            <div
              key={i}
              className={cn(
                'overflow-hidden rounded-xl border transition-colors',
                isOpen ? 'bg-parchment' : 'border-[rgb(var(--rule)/0.14)] bg-cream/60',
              )}
              style={isOpen ? { borderColor: 'rgba(156,122,27,0.4)' } : undefined}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                <span className="flex-1 text-[13.5px] font-semibold text-ink-primary">
                  “{o.says}”
                </span>
                <ChevronDown
                  size={15}
                  aria-hidden
                  className={cn('flex-shrink-0 text-ink-tertiary transition-transform', isOpen && 'rotate-180')}
                />
              </button>
              {isOpen && (
                <p className="px-4 pb-4 text-[13px] leading-relaxed text-ink-secondary">
                  <span className="font-semibold text-ink-primary">You do: </span>
                  {o.does}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </Frame>
  )
}

/* ── 7. Guarantee comparison (Sales, Part 1 warranty) ─────────────────── */

const GUARANTEE = [
  { row: 'Manufacturing defects', first: '5 years', pro: '25 years', same: false },
  { row: 'Termites, bacteria and fungus', first: '25 years', pro: '25 years', same: true },
  { row: 'Complimentary services', first: '1', pro: '5', same: false },
]

function GuaranteeComparison() {
  return (
    <Frame label="Sales · Part 1" title="The guarantee, by range">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr>
              <th className="pb-2 pr-3 font-semibold text-ink-tertiary" />
              <th className="pb-2 px-3 font-semibold text-ink-primary">Wellness First</th>
              <th className="pb-2 pl-3 font-semibold text-ink-primary">Wellness Pro</th>
            </tr>
          </thead>
          <tbody>
            {GUARANTEE.map((g) => (
              <tr
                key={g.row}
                className="border-t border-[rgb(var(--rule)/0.1)]"
                style={g.same ? { background: GREEN_SOFT } : undefined}
              >
                <td className="py-3 pr-3 align-top">
                  <span className="font-medium text-ink-primary">{g.row}</span>
                  {g.same && (
                    <span
                      className="ml-2 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                      style={{ background: GREEN, color: '#fff' }}
                    >
                      Same on both
                    </span>
                  )}
                </td>
                <td className="py-3 px-3 align-top font-semibold text-ink-primary">{g.first}</td>
                <td className="py-3 pl-3 align-top font-semibold text-ink-primary">{g.pro}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[12.5px] leading-relaxed text-ink-tertiary">
        The manufacturing-defect guarantee varies by range. The termite, bacteria and fungus
        guarantee is 25 years either way — state that difference precisely. Paid service continues
        after the complimentary visits.
      </p>
    </Frame>
  )
}

/* ── 8. Visual syllabus index (both modules) ──────────────────────────── */

export interface SyllabusEntry {
  part: string
  title: string
  covers: string
  time: string
}

function SyllabusCards({ entries }: { entries: SyllabusEntry[] }) {
  return (
    <nav aria-label="Syllabus" className="my-6 grid gap-3 sm:grid-cols-2">
      {entries.map((e) => (
        <a
          key={e.part + e.title}
          href={`#${slug(e.title)}`}
          className="group rounded-2xl border border-[rgb(var(--rule)/0.12)] bg-parchment p-4 transition-shadow hover:shadow-elevated"
        >
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: GOLD }}>
              {e.part}
            </span>
            <span className="text-[11px] font-medium text-ink-tertiary">{e.time}</span>
          </div>
          <p className="mt-1.5 text-[14px] font-semibold leading-snug text-ink-primary">{e.title}</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-tertiary">{e.covers}</p>
        </a>
      ))}
    </nav>
  )
}

/** Anchor id for a syllabus target — must match the heading it jumps to. */
export function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

/* ── registry ─────────────────────────────────────────────────────────── */

export const PRESALES_SYLLABUS: SyllabusEntry[] = [
  { part: 'Intro', title: 'What this role actually does', covers: 'The three jobs, why you are not the closer, why a dropped lead is not a dead lead', time: '5 min' },
  { part: 'Intro', title: 'What we know about these calls', covers: 'The recorded-call data, and which three questions cause most of the damage', time: '5 min' },
  { part: 'Intro', title: 'The rule for this role', covers: 'Where your answer stops and Sales begins', time: '5 min' },
  { part: 'Part 1', title: 'What clients ask you', covers: 'The approved answers, ordered by where calls actually fail: price first, then material, coverage, process', time: '40 min' },
  { part: 'Part 2', title: 'What you route to Sales', covers: 'The 10 topics that are not yours, and how to route without losing the lead', time: '10 min' },
  { part: 'Part 3', title: 'The floor plan', covers: 'The part of the job only you can do. Why people resist, and how to solve it inside the call', time: '20 min' },
  { part: 'Part 4', title: 'The handover', covers: 'What sales-ready actually means, and the five things that must be true', time: '10 min' },
  { part: 'Part 5', title: 'The learning path', covers: 'Week one, weeks two to four, month two', time: '15 min' },
  { part: 'Part 6', title: 'Annual refresher', covers: 'Existing team only. Self-check, plus what changed this year', time: 'Yearly' },
  { part: 'Part 7', title: 'Assessment', covers: '15 questions', time: '20 min' },
]

export const SALES_SYLLABUS: SyllabusEntry[] = [
  { part: 'Intro', title: 'What this role actually does', covers: 'What owning a client means, and why guessing is the one thing you may never do', time: '5 min' },
  { part: 'Part 1', title: 'The complete approved answers', covers: 'All 46, grouped: pricing, payment, warranty, materials, inclusions, design, installation, timelines, coverage, credentials, process', time: '60 min' },
  { part: 'Part 2', title: 'The five that actually lose deals', covers: 'The worst-performing questions in the business, from the call data', time: '10 min' },
  { part: 'Part 3', title: 'The things a client will push on', covers: 'Where the facts are not the problem. Six moments and how to handle them', time: '20 min' },
  { part: 'Part 4', title: 'Owning the client through the process', covers: 'The three payment moments, and the four things most often mishandled between them', time: '20 min' },
  { part: 'Part 5', title: 'The learning path', covers: 'Months one to three, in order: know the product, know the process, start selling, own it', time: '15 min' },
  { part: 'Part 6', title: 'Annual refresher', covers: 'Existing team only. Self-check, plus what changed this year', time: 'Yearly' },
  { part: 'Part 7', title: 'Assessment', covers: '16 questions', time: '25 min' },
]

/** Resolved by the `visual` ContentBlock kind. */
export const MODULE_VISUALS: Record<string, () => React.ReactElement> = {
  'presales-syllabus': () => <SyllabusCards entries={PRESALES_SYLLABUS} />,
  'presales-answer-or-route': () => <AnswerOrRoute />,
  'presales-price-flow': () => <PriceAnswerFlow />,
  'presales-floorplan': () => <FloorPlanFlow />,
  'presales-sales-ready': () => <SalesReadyChecklist />,
  'sales-syllabus': () => <SyllabusCards entries={SALES_SYLLABUS} />,
  'sales-journey-gates': () => <JourneyWithGates />,
  'sales-objections': () => <ObjectionCards />,
  'sales-guarantee': () => <GuaranteeComparison />,
}
