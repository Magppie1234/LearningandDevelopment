'use client'

import { ChevronDown, X, Plus } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { ORG_COLORS, type OrgPosition } from '@/data/org-chart'
import { useOrgStore } from '@/lib/org-store'
import { PositionEditor } from './PositionEditor'
import { useDescendantIds } from './CSuiteCard'

/**
 * Compact org-chart "node" box for the desktop branching tree layout (see
 * OrgChartTree). Purely presentational for expand state — the department
 * panel for whichever node is selected renders once, below the whole row, in
 * the parent, so two adjacent narrow nodes never fight over overflow space.
 */
export function CSuiteNode({
  position,
  expanded,
  onToggle,
}: {
  position: OrgPosition
  expanded: boolean
  onToggle: () => void
}) {
  const color = ORG_COLORS[position.color ?? 'blue']

  const roster = useOrgStore((s) => s.roster)
  const assignments = useOrgStore(
    useShallow((s) => s.assignments.filter((a) => a.positionId === position.id)),
  )
  const removeAssignment = useOrgStore((s) => s.removeAssignment)

  const descendantIds = useDescendantIds(position.id)
  const departmentCount = useOrgStore(
    (s) => s.positions.filter((p) => p.parentId === position.id && p.tier === 'department').length,
  )
  const teamMemberCount = useOrgStore(
    (s) => s.assignments.filter((a) => descendantIds.has(a.positionId)).length,
  )

  function nameFor(a: { employeeId: string | null; customName: string | null }) {
    if (a.employeeId) return roster.find((e) => e.id === a.employeeId)?.name ?? 'Unknown'
    return a.customName ?? 'Unknown'
  }

  return (
    <div
      className="w-[164px] shrink rounded-2xl bg-cream border shadow-card overflow-hidden transition-shadow"
      style={{
        borderColor: expanded ? color.bar : 'rgba(0,59,70,0.08)',
        boxShadow: expanded ? `0 0 0 2px ${color.bar}` : undefined,
      }}
    >
      <div className="h-1.5" style={{ backgroundColor: color.bar }} />

      <button
        type="button"
        onClick={onToggle}
        className="w-full px-3 pt-3 pb-1.5 text-center hover:bg-black/[0.02] transition-colors"
      >
        <p className="font-serif text-[13px] leading-tight text-ink-primary">{position.title}</p>
        <span
          className="inline-block mt-1.5 text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
          style={{ backgroundColor: color.soft, color: color.text }}
        >
          {position.department}
        </span>
      </button>

      <div className="px-2.5 pb-2 flex flex-wrap items-center justify-center gap-1">
        {assignments.map((a) => (
          <span
            key={a.id}
            className="inline-flex items-center gap-1 rounded-full pl-2 pr-0.5 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: color.soft, color: color.text }}
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
              <X size={8} />
            </button>
          </span>
        ))}
        <PositionEditor position={position} align="center">
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-0.5 rounded-full border border-dashed border-[rgba(0,59,70,0.2)] px-1.5 py-0.5 text-[9px] font-medium text-ink-tertiary hover:border-ink-secondary hover:text-ink-secondary transition-colors"
          >
            <Plus size={8} /> Add
          </button>
        </PositionEditor>
      </div>

      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-center gap-1 py-1.5 border-t border-[rgba(0,59,70,0.06)] text-[9px] text-ink-tertiary hover:text-ink-secondary transition-colors"
      >
        <span className="truncate">
          {departmentCount > 0
            ? `${departmentCount} dept${departmentCount === 1 ? '' : 's'} · ${teamMemberCount}`
            : `${teamMemberCount} member${teamMemberCount === 1 ? '' : 's'}`}
        </span>
        <ChevronDown
          size={11}
          className={`shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>
    </div>
  )
}
