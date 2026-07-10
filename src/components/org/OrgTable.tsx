'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Search, X, Plus, CornerDownRight } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { cn } from '@/lib/utils'
import { ORG_COLORS, type OrgPosition, type OrgTier } from '@/data/org-chart'
import { useOrgStore } from '@/lib/org-store'
import { PositionEditor } from './PositionEditor'

/**
 * Tabular view of the org structure — every position as a row, indented by
 * hierarchy with expand/collapse chevrons, a tier chip, the branch colour,
 * assignee chips (click + to assign people, same editor as the flow chart)
 * and a "Reports to" column. A search box flattens the table to matching
 * rows so anyone can be found in two keystrokes.
 */

const TIER_LABEL: Record<OrgTier, string> = {
  board: 'Board',
  md_ceo: 'MD / CEO',
  c_suite: 'C-Suite',
  department: 'Department',
  position: 'Role',
}

interface Row {
  position: OrgPosition
  depth: number
  hasChildren: boolean
  /** Branch accent inherited from the C-Suite ancestor (board rows use espresso). */
  branchColor: string | null
}

function AssigneeChips({ position, color }: { position: OrgPosition; color: string | null }) {
  const roster = useOrgStore((s) => s.roster)
  const assignments = useOrgStore(
    useShallow((s) => s.assignments.filter((a) => a.positionId === position.id)),
  )
  const removeAssignment = useOrgStore((s) => s.removeAssignment)

  function nameFor(a: { employeeId: string | null; customName: string | null }) {
    if (a.employeeId) return roster.find((e) => e.id === a.employeeId)?.name ?? 'Unknown'
    return a.customName ?? 'Unknown'
  }

  const soft = color ? `${color}1e` : 'rgba(0,59,70,0.07)'
  const text = color ?? 'inherit'

  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {assignments.map((a) => (
        <span
          key={a.id}
          className="inline-flex items-center gap-1 rounded-full pl-2.5 pr-1 py-0.5 text-xs font-medium text-ink-primary"
          style={{ backgroundColor: soft, color: text }}
        >
          {nameFor(a)}
          <button
            type="button"
            aria-label={`Remove ${nameFor(a)}`}
            onClick={(e) => {
              e.stopPropagation()
              removeAssignment(a.id)
            }}
            className="rounded-full p-0.5 hover:bg-black/10 transition-colors"
          >
            <X size={10} />
          </button>
        </span>
      ))}
      <PositionEditor position={position}>
        <button
          type="button"
          aria-label={`Add person to ${position.title}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-0.5 rounded-full border border-dashed border-[rgba(0,59,70,0.22)] px-2 py-0.5 text-[11px] font-medium text-ink-tertiary hover:border-ink-secondary hover:text-ink-secondary transition-colors"
        >
          <Plus size={10} />
          {assignments.length === 0 && 'Add'}
        </button>
      </PositionEditor>
    </span>
  )
}

export function OrgTable() {
  const positions = useOrgStore((s) => s.positions)
  const roster = useOrgStore((s) => s.roster)
  const assignments = useOrgStore((s) => s.assignments)
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set())
  const [q, setQ] = useState('')

  const byParent = useMemo(() => {
    const map = new Map<string | null, OrgPosition[]>()
    for (const p of positions) {
      const list = map.get(p.parentId) ?? []
      list.push(p)
      map.set(p.parentId, list)
    }
    for (const list of map.values()) list.sort((a, b) => a.sortOrder - b.sortOrder)
    return map
  }, [positions])

  const parentTitle = useMemo(() => {
    const titles = new Map<string, string>()
    for (const p of positions) titles.set(p.id, p.title)
    return (p: OrgPosition) =>
      p.parentId ? titles.get(p.parentId) ?? '—' : p.tier === 'board' ? '—' : 'Board of Directors'
  }, [positions])

  /** People names per position id (for search). */
  const peopleFor = useMemo(() => {
    const names = new Map<string, string[]>()
    for (const a of assignments) {
      const name = a.employeeId
        ? roster.find((e) => e.id === a.employeeId)?.name ?? ''
        : a.customName ?? ''
      if (!name) continue
      const list = names.get(a.positionId) ?? []
      list.push(name)
      names.set(a.positionId, list)
    }
    return names
  }, [assignments, roster])

  const rows = useMemo(() => {
    const board = (byParent.get(null) ?? []).filter((p) => p.tier === 'board')
    const cSuite = (byParent.get(null) ?? []).filter((p) => p.tier === 'c_suite')

    const out: Row[] = []
    const walk = (p: OrgPosition, depth: number, branchColor: string | null) => {
      const children = byParent.get(p.id) ?? []
      out.push({ position: p, depth, hasChildren: children.length > 0, branchColor })
      if (expanded.has(p.id)) {
        for (const child of children) walk(child, depth + 1, branchColor)
      }
    }

    for (const b of board) out.push({ position: b, depth: 0, hasChildren: false, branchColor: null })
    for (const c of cSuite) walk(c, 0, ORG_COLORS[c.color ?? 'blue'].bar)

    return out
  }, [byParent, expanded])

  /** Search flattens the whole tree and filters by title / department / person. */
  const searchRows = useMemo(() => {
    if (!q.trim()) return null
    const needle = q.trim().toLowerCase()
    const colorOf = new Map<string, string | null>()
    const resolveColor = (p: OrgPosition): string | null => {
      if (colorOf.has(p.id)) return colorOf.get(p.id) ?? null
      let color: string | null = null
      if (p.tier === 'c_suite') color = ORG_COLORS[p.color ?? 'blue'].bar
      else if (p.parentId) {
        const parent = positions.find((x) => x.id === p.parentId)
        color = parent ? resolveColor(parent) : null
      }
      colorOf.set(p.id, color)
      return color
    }
    return positions
      .filter((p) => {
        const people = peopleFor.get(p.id) ?? []
        return (
          p.title.toLowerCase().includes(needle) ||
          (p.department ?? '').toLowerCase().includes(needle) ||
          people.some((n) => n.toLowerCase().includes(needle))
        )
      })
      .map((p): Row => ({ position: p, depth: 0, hasChildren: false, branchColor: resolveColor(p) }))
  }, [q, positions, peopleFor])

  const visible = searchRows ?? rows
  const allExpandableIds = useMemo(
    () => positions.filter((p) => (byParent.get(p.id) ?? []).length > 0).map((p) => p.id),
    [positions, byParent],
  )
  const allOpen = allExpandableIds.every((id) => expanded.has(id))

  return (
    <div className="rounded-2xl border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream shadow-card overflow-hidden">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-[rgba(0,59,70,0.08)]">
        <div className="relative w-[260px] max-w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" size={14} />
          <input
            type="text"
            placeholder="Search positions, departments, people…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full bg-parchment border border-[rgba(0,59,70,0.12)] rounded-lg pl-8 pr-3 py-1.5 text-[13px] text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-ink-primary transition-all"
          />
        </div>
        <button
          type="button"
          onClick={() =>
            setExpanded(allOpen ? new Set() : new Set(allExpandableIds))
          }
          className="ml-auto text-[13px] font-medium text-ink-secondary hover:text-ink-primary transition-colors"
        >
          {allOpen ? 'Collapse all' : 'Expand all'}
        </button>
      </div>

      {/* header */}
      <div className="hidden md:grid grid-cols-[minmax(220px,1.4fr)_110px_minmax(120px,0.9fr)_minmax(180px,1.2fr)_minmax(140px,0.9fr)] gap-3 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary border-b border-[rgba(0,59,70,0.08)] bg-[rgba(0,59,70,0.02)]">
        <span>Position</span>
        <span>Level</span>
        <span>Department</span>
        <span>People</span>
        <span>Reports to</span>
      </div>

      {/* rows */}
      <AnimatePresence initial={false}>
        {visible.map(({ position: p, depth, hasChildren, branchColor }) => {
          const isOpen = expanded.has(p.id)
          const tierChipStyle =
            p.tier === 'board'
              ? { backgroundColor: 'rgba(0,59,70,0.08)', color: 'inherit' }
              : branchColor
                ? { backgroundColor: `${branchColor}1e`, color: branchColor }
                : { backgroundColor: 'rgba(0,59,70,0.06)', color: 'inherit' }
          return (
            <motion.div
              key={p.id}
              layout="position"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'grid grid-cols-1 md:grid-cols-[minmax(220px,1.4fr)_110px_minmax(120px,0.9fr)_minmax(180px,1.2fr)_minmax(140px,0.9fr)] gap-1.5 md:gap-3 items-center px-4 py-2.5 border-b border-[rgba(0,59,70,0.06)] last:border-b-0 transition-colors',
                hasChildren && 'cursor-pointer hover:bg-[rgba(0,59,70,0.025)]',
              )}
              onClick={
                hasChildren
                  ? () =>
                      setExpanded((prev) => {
                        const next = new Set(prev)
                        if (next.has(p.id)) next.delete(p.id)
                        else next.add(p.id)
                        return next
                      })
                  : undefined
              }
            >
              {/* Position (indent + chevron + branch bar) */}
              <span
                className="flex items-center gap-1.5 min-w-0"
                style={{ paddingLeft: searchRows ? 0 : depth * 22 }}
              >
                {hasChildren ? (
                  <ChevronRight
                    size={14}
                    className={cn(
                      'shrink-0 text-ink-tertiary transition-transform duration-200',
                      isOpen && 'rotate-90',
                    )}
                  />
                ) : depth > 0 || searchRows ? (
                  <CornerDownRight size={12} className="shrink-0 text-ink-tertiary/50" />
                ) : (
                  <span className="w-3.5 shrink-0" />
                )}
                <span
                  className="w-1 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: branchColor ?? '#3D3128' }}
                />
                <span
                  className={cn(
                    'truncate text-ink-primary',
                    p.tier === 'board' || p.tier === 'c_suite'
                      ? 'font-serif text-[15px]'
                      : 'text-sm font-medium',
                  )}
                >
                  {p.title}
                </span>
              </span>

              {/* Level */}
              <span>
                <span
                  className="inline-block rounded-lg px-2 py-0.5 text-[11px] font-medium text-ink-secondary"
                  style={tierChipStyle}
                >
                  {TIER_LABEL[p.tier]}
                </span>
              </span>

              {/* Department */}
              <span className="text-[13px] text-ink-secondary truncate">{p.department ?? '—'}</span>

              {/* People */}
              <AssigneeChips position={p} color={branchColor} />

              {/* Reports to */}
              <span className="text-[12px] text-ink-tertiary truncate">{parentTitle(p)}</span>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {visible.length === 0 && (
        <p className="px-4 py-10 text-center text-sm text-ink-tertiary">
          No positions match “{q}”.
        </p>
      )}
    </div>
  )
}
