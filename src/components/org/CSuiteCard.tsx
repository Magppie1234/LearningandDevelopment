'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, X, Plus } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { ORG_COLORS, type OrgPosition } from '@/data/org-chart'
import { useOrgStore } from '@/lib/org-store'
import { PositionEditor } from './PositionEditor'
import { DepartmentList } from './DepartmentBlock'
import { AddPositionButton } from './AddPositionButton'

export function useDescendantIds(rootId: string) {
  const positions = useOrgStore((s) => s.positions)
  return useMemo(() => {
    const ids = new Set<string>()
    let grew = true
    while (grew) {
      grew = false
      for (const p of positions) {
        if (p.parentId && (p.parentId === rootId || ids.has(p.parentId)) && !ids.has(p.id)) {
          ids.add(p.id)
          grew = true
        }
      }
    }
    return ids
  }, [positions, rootId])
}

export function CSuiteCard({ position }: { position: OrgPosition }) {
  const [expanded, setExpanded] = useState(false)
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

  const subtitleParts: string[] = []
  if (departmentCount > 0) subtitleParts.push(`${departmentCount} department${departmentCount === 1 ? '' : 's'}`)
  subtitleParts.push(`${teamMemberCount} team member${teamMemberCount === 1 ? '' : 's'}`)

  return (
    <div className="rounded-[12px] bg-cream border-[0.5px] border-[rgba(0,59,70,0.14)] dark:border-[rgba(255,255,255,0.1)] overflow-hidden transition-shadow duration-200 hover:shadow-card">
      {/* Colored accent bar + header row */}
      <div className="flex items-stretch">
        <div className="w-1.5 shrink-0" style={{ backgroundColor: color.bar }} />
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex-1 flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-black/[0.02] transition-colors"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-serif text-lg text-ink-primary">{position.title}</p>
              <span
                className="text-[11px] font-medium px-2 py-0.5 rounded-lg"
                style={{ backgroundColor: color.soft, color: color.text }}
              >
                {position.department}
              </span>
            </div>
            <p className="text-xs text-ink-tertiary mt-1">{subtitleParts.join(' · ')}</p>
          </div>

          <ChevronDown
            size={20}
            className={`shrink-0 text-ink-tertiary transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Assignee chips (executive[s] holding this C-suite title) */}
      <div className="px-5 pb-4 pt-0 -mt-1 flex flex-wrap items-center gap-1.5">
        {assignments.map((a) => (
          <span
            key={a.id}
            className="inline-flex items-center gap-1 rounded-full pl-2.5 pr-1 py-1 text-xs font-medium"
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
              <X size={11} />
            </button>
          </span>
        ))}
        <PositionEditor position={position}>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-[rgba(0,59,70,0.2)] px-2.5 py-1 text-xs font-medium text-ink-tertiary hover:border-ink-secondary hover:text-ink-secondary transition-colors"
          >
            <Plus size={11} /> Add
          </button>
        </PositionEditor>
      </div>

      {/* Expanded: departments + roles */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
            className="overflow-hidden border-t border-[rgba(0,59,70,0.08)]"
          >
            <div className="p-4 space-y-3 bg-[rgba(0,59,70,0.015)]">
              <DepartmentList cSuiteId={position.id} />
              <div className="pt-1">
                <AddPositionButton
                  parentId={position.id}
                  tier="department"
                  department={null}
                  label="Add Department"
                  className="w-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
