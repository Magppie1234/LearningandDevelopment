'use client'

import { X } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useOrgStore } from '@/lib/org-store'
import { PositionEditor } from './PositionEditor'
import { AddPositionButton } from './AddPositionButton'

/** Dark leadership-tier card shared by the Board row and the MD/CEO card. */
function LeadershipCard({ positionId, title }: { positionId: string; title: string }) {
  const roster = useOrgStore((s) => s.roster)
  const assignments = useOrgStore(
    useShallow((s) => s.assignments.filter((a) => a.positionId === positionId)),
  )
  const removeAssignment = useOrgStore((s) => s.removeAssignment)
  const position = useOrgStore((s) => s.positions.find((p) => p.id === positionId))
  if (!position) return null

  function nameFor(a: { employeeId: string | null; customName: string | null }) {
    if (a.employeeId) return roster.find((e) => e.id === a.employeeId)?.name ?? 'Unknown'
    return a.customName ?? 'Unknown'
  }

  return (
    <div className="min-w-[220px] flex-1 max-w-[280px] rounded-[12px] bg-stone-espresso text-stone-ivory px-5 py-4 transition-all duration-200 hover:shadow-elevated hover:-translate-y-0.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-ivory/60">
        {title}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {assignments.length === 0 && (
          <PositionEditor position={position} align="center">
            <button
              type="button"
              className="rounded-full border border-dashed border-parchment/30 px-3 py-1.5 text-xs font-medium text-stone-ivory/70 hover:border-parchment/60 hover:text-stone-ivory transition-colors"
            >
              + Add Person
            </button>
          </PositionEditor>
        )}
        {assignments.map((a) => (
          <span
            key={a.id}
            className="inline-flex items-center gap-1 rounded-full bg-white/10 pl-2.5 pr-1 py-1 text-sm font-medium"
          >
            {nameFor(a)}
            <button
              type="button"
              aria-label={`Remove ${nameFor(a)}`}
              onClick={() => removeAssignment(a.id)}
              className="rounded-full p-0.5 hover:bg-white/20 transition-colors"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        {assignments.length > 0 && (
          <PositionEditor position={position} align="center">
            <button
              type="button"
              aria-label="Add another person"
              className="rounded-full border border-dashed border-parchment/30 px-2 py-1 text-xs text-stone-ivory/70 hover:border-parchment/60 hover:text-stone-ivory transition-colors"
            >
              +
            </button>
          </PositionEditor>
        )}
      </div>
    </div>
  )
}

/** Board of Directors row — supports N directors, not hardcoded to 3. */
export function BoardRow() {
  const boardPositions = useOrgStore(
    useShallow((s) =>
      s.positions.filter((p) => p.tier === 'board').sort((a, b) => a.sortOrder - b.sortOrder),
    ),
  )

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {boardPositions.map((p) => (
        <LeadershipCard key={p.id} positionId={p.id} title={p.title} />
      ))}
      <AddPositionButton
        parentId={null}
        tier="board"
        department={null}
        label="Add Director"
        className="min-w-[220px] max-w-[280px] flex-1 self-stretch flex-col py-4"
      />
    </div>
  )
}

// MDCeoCard removed 2026-07-02 — the MD/CEO tier no longer appears in the
// chart; C-Suite reports directly to the Board of Directors.
