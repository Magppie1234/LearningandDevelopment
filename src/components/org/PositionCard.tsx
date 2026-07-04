'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { PositionEditor } from './PositionEditor'
import { useOrgStore } from '@/lib/org-store'
import type { OrgPosition } from '@/data/org-chart'

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/** One employee-in-a-role card, or the dashed "+ Add Person" placeholder. */
function EmployeeCard({ position }: { position: OrgPosition }) {
  const assignments = useOrgStore(
    useShallow((s) => s.assignments.filter((a) => a.positionId === position.id)),
  )
  const roster = useOrgStore((s) => s.roster)

  if (assignments.length === 0) {
    return (
      <PositionEditor position={position}>
        <button
          type="button"
          className="w-full rounded-xl border-2 border-dashed border-[rgba(0,59,70,0.18)] px-3 py-3 text-xs font-medium text-ink-tertiary hover:border-ink-secondary hover:text-ink-secondary transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus size={14} /> Add Person
        </button>
      </PositionEditor>
    )
  }

  return (
    <div className="space-y-2">
      {assignments.map((a) => {
        const name = a.employeeId
          ? roster.find((e) => e.id === a.employeeId)?.name ?? 'Unknown'
          : a.customName ?? 'Unknown'
        const sub = a.employeeId
          ? roster.find((e) => e.id === a.employeeId)?.department
          : null
        return (
          <PositionEditor position={position} key={a.id}>
            <button
              type="button"
              className="w-full rounded-xl bg-cream border border-[rgba(0,59,70,0.08)] px-3 py-2.5 text-left shadow-xs hover:shadow-card hover:-translate-y-0.5 transition-all flex items-center gap-2.5"
            >
              <span className="w-8 h-8 shrink-0 rounded-full bg-surface-blue flex items-center justify-center text-[11px] font-semibold text-ink-primary">
                {initials(name)}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-ink-primary truncate">
                  {name}
                </span>
                {sub && (
                  <span className="block text-[10px] text-ink-tertiary truncate">{sub}</span>
                )}
              </span>
            </button>
          </PositionEditor>
        )
      })}
    </div>
  )
}

/** A single position column: role title + its employee card(s) + remove control. */
export function PositionColumn({ position }: { position: OrgPosition }) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const removePosition = useOrgStore((s) => s.removePosition)
  const hasAssignments = useOrgStore(
    (s) => s.assignments.some((a) => a.positionId === position.id),
  )

  return (
    <div className="min-w-[168px] flex-1 max-w-[220px]">
      <div className="flex items-center justify-between gap-2 mb-2 px-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary truncate">
          {position.title}
        </p>
        <button
          type="button"
          aria-label={`Remove ${position.title} position`}
          onClick={() => setConfirmOpen(true)}
          className="shrink-0 text-ink-tertiary hover:text-red-600 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <EmployeeCard position={position} />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove &ldquo;{position.title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              {hasAssignments
                ? 'This position currently has someone assigned. Removing it will also remove that assignment. This cannot be undone.'
                : 'This will remove the empty position from the department.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removePosition(position.id)}
              className="bg-red-600 hover:bg-red-700 focus-visible:ring-red-300"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
