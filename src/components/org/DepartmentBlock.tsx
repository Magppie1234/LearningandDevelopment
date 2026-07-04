'use client'

import { useMemo } from 'react'
import { Reorder } from 'framer-motion'
import { GripVertical } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useOrgStore } from '@/lib/org-store'
import type { OrgPosition } from '@/data/org-chart'
import { PositionColumn } from './PositionCard'
import { AddPositionButton } from './AddPositionButton'

/** Column-layout view of one department's positions (one column per role). */
function DepartmentBody({ department }: { department: OrgPosition }) {
  const roles = useOrgStore(
    useShallow((s) =>
      s.positions
        .filter((p) => p.parentId === department.id && p.tier === 'position')
        .sort((a, b) => a.sortOrder - b.sortOrder),
    ),
  )

  return (
    <div className="rounded-2xl bg-card/60 border border-[rgba(0,59,70,0.06)] p-4">
      <p className="text-sm font-semibold text-ink-primary mb-3">{department.title}</p>
      <div className="flex gap-4 overflow-x-auto pb-1">
        {roles.map((role) => (
          <PositionColumn key={role.id} position={role} />
        ))}
        <AddPositionButton
          parentId={department.id}
          tier="position"
          department={department.department}
          label="Add Position"
        />
      </div>
    </div>
  )
}

/**
 * Drag-and-drop reorderable list of a C-Suite exec's departments. Each
 * department is a Reorder.Item wrapping its own expanded column layout.
 */
export function DepartmentList({ cSuiteId }: { cSuiteId: string }) {
  const departments = useOrgStore(
    useShallow((s) =>
      s.positions
        .filter((p) => p.parentId === cSuiteId && p.tier === 'department')
        .sort((a, b) => a.sortOrder - b.sortOrder),
    ),
  )
  const reorderChildren = useOrgStore((s) => s.reorderChildren)

  const orderedIds = useMemo(() => departments.map((d) => d.id), [departments])

  return (
    <Reorder.Group
      axis="y"
      values={orderedIds}
      onReorder={(next) => reorderChildren(cSuiteId, next)}
      className="space-y-3"
    >
      {departments.map((dept) => (
        <Reorder.Item
          key={dept.id}
          value={dept.id}
          className="flex items-start gap-2"
        >
          <span className="mt-4 shrink-0 cursor-grab active:cursor-grabbing text-ink-tertiary/50 hover:text-ink-tertiary transition-colors">
            <GripVertical size={16} />
          </span>
          <div className="flex-1 min-w-0">
            <DepartmentBody department={dept} />
          </div>
        </Reorder.Item>
      ))}
    </Reorder.Group>
  )
}
