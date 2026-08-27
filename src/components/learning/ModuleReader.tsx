'use client'

import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { ContentBlock } from '@/data/bd-academy'
import { cn } from '@/lib/utils'

/**
 * Turns a flat ContentBlock[] into a navigable, collapsible document.
 *
 * The modules are long — the Sales Client Ownership module alone is 66 blocks
 * and carries all 46 approved answers. Rendered flat that is a wall of text
 * you scroll past rather than read. This splits the list at its own `heading`
 * blocks, puts each run on its own solid panel, and collapses everything but
 * the first so the page opens as a short contents list you expand into.
 *
 * Sections are derived, never authored: no module data changed to support
 * this, so a new module gets the treatment for free and an edited heading
 * moves its section automatically.
 *
 * Panels are SOLID, not frosted. The portal's no-glassmorphism rule still
 * applies, and over a photographic backdrop a blurred translucent panel is
 * exactly where small text starts to lose contrast.
 */

export interface Section {
  id: string
  title: string
  blocks: ContentBlock[]
}

/** Anchor-safe id, and stable across renders because it derives from text. */
export function sectionId(title: string, i: number): string {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return `s${i}-${base || 'section'}`
}

/** Split at heading blocks. Anything before the first heading is the intro. */
export function toSections(blocks: ContentBlock[]): Section[] {
  const out: Section[] = []
  let current: Section | null = null
  blocks.forEach((b) => {
    if (b.kind === 'heading') {
      current = { id: '', title: b.text, blocks: [] }
      out.push(current)
      return
    }
    if (!current) {
      current = { id: '', title: 'Overview', blocks: [] }
      out.push(current)
    }
    current.blocks.push(b)
  })
  return out
    .filter((s) => s.blocks.length > 0)
    .map((s, i) => ({ ...s, id: sectionId(s.title, i) }))
}

export default function ModuleReader({
  blocks,
  renderBlock,
}: {
  blocks: ContentBlock[]
  /** The academy's own Block renderer, passed in so this stays presentational. */
  renderBlock: (b: ContentBlock, i: number) => React.ReactNode
}) {
  const sections = useMemo(() => toSections(blocks), [blocks])
  // First section open, rest closed: the page opens as a contents list.
  const [open, setOpen] = useState<Set<string>>(() => new Set(sections.slice(0, 1).map((s) => s.id)))

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const jump = (id: string) => {
    setOpen((prev) => new Set(prev).add(id)) // expand before scrolling to it
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const allOpen = open.size === sections.length

  if (sections.length < 2) {
    // One section is not a document — render it plainly rather than wrapping a
    // single block list in navigation it does not need.
    return <div className="space-y-3.5">{blocks.map((b, i) => renderBlock(b, i))}</div>
  }

  return (
    <div className="space-y-4">
      {/* In-page nav. Sticky under the app header so it stays reachable in a
          long module; horizontally scrollable rather than wrapping to three
          lines on a phone. */}
      <nav
        aria-label="Sections in this module"
        className="sticky top-14 z-20 -mx-1 rounded-xl border border-hairline/12 bg-parchment px-1 py-2"
      >
        <div className="flex items-center gap-1.5 overflow-x-auto px-1 pb-0.5">
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => jump(s.id)}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-[12.5px] font-medium text-ink-secondary transition-colors hover:bg-[rgb(var(--rule)/0.06)] hover:text-ink-primary"
            >
              {s.title}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setOpen(allOpen ? new Set() : new Set(sections.map((s) => s.id)))}
            className="ml-auto whitespace-nowrap rounded-full border border-hairline/15 px-3 py-1.5 text-[12px] font-semibold text-ink-tertiary transition-colors hover:text-ink-primary"
          >
            {allOpen ? 'Collapse all' : 'Expand all'}
          </button>
        </div>
      </nav>

      {sections.map((s, si) => {
        const isOpen = open.has(s.id)
        return (
          <section
            key={s.id}
            id={s.id}
            // Solid panel per section: this is the "division" that keeps each
            // part legible over the kitchen backdrop.
            className="scroll-mt-24 overflow-hidden rounded-2xl border border-hairline/12 bg-parchment"
          >
            <h3>
              <button
                type="button"
                onClick={() => toggle(s.id)}
                aria-expanded={isOpen}
                aria-controls={`${s.id}-body`}
                className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-[rgb(var(--rule)/0.03)]"
              >
                <span className="text-[11px] font-bold tabular-nums text-ink-tertiary">
                  {String(si + 1).padStart(2, '0')}
                </span>
                <span className="flex-1 text-[15px] font-semibold text-ink-primary">{s.title}</span>
                <ChevronDown
                  size={16}
                  aria-hidden
                  className={cn(
                    'flex-shrink-0 text-ink-tertiary transition-transform duration-200',
                    isOpen && 'rotate-180',
                  )}
                />
              </button>
            </h3>
            {isOpen && (
              <div id={`${s.id}-body`} className="space-y-3.5 border-t border-hairline/10 px-5 py-5">
                {s.blocks.map((b, i) => renderBlock(b, i))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
