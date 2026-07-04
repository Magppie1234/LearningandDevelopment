'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { OrgPosition } from '@/data/org-chart'
import { BoardRow } from './BoardRow'
import { CSuiteNode } from './CSuiteNode'
import { DepartmentList } from './DepartmentBlock'
import { AddPositionButton } from './AddPositionButton'
import { useTreeConnectors, TreeConnectorSvg } from './TreeConnector'

/**
 * Desktop-only branching org-chart tree: the Board of Directors row at the
 * top (the MD/CEO tier was removed 2026-07-02 — C-Suite reports straight to
 * the Board), a trunk-and-branch SVG connector, then a single row of compact
 * C-Suite nodes. Only one node's departments can be open at a time — the
 * panel renders once, below the whole row, so two adjacent 164px-wide nodes
 * never have to fight over overflow width for a multi-column department layout.
 */
export function OrgChartTree({ cSuite }: { cSuite: OrgPosition[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const boardWrapRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef(new Map<string, HTMLDivElement>())

  const orderedIds = cSuite.map((c) => c.id)
  const segments = useTreeConnectors(containerRef, boardWrapRef, nodeRefs, orderedIds)
  const expandedPosition = cSuite.find((c) => c.id === expandedId) ?? null

  return (
    <div ref={containerRef} className="relative">
      <div ref={boardWrapRef}>
        <BoardRow />
      </div>

      <TreeConnectorSvg segments={segments} />

      <div className="flex justify-center gap-4 pt-16">
        {cSuite.map((c) => (
          <div
            key={c.id}
            ref={(el) => {
              if (el) nodeRefs.current.set(c.id, el)
              else nodeRefs.current.delete(c.id)
            }}
          >
            <CSuiteNode
              position={c}
              expanded={expandedId === c.id}
              onToggle={() => setExpandedId((cur) => (cur === c.id ? null : c.id))}
            />
          </div>
        ))}
      </div>

      <AnimatePresence initial={false}>
        {expandedPosition && (
          <motion.div
            key={expandedPosition.id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-6 rounded-2xl border border-[rgba(0,59,70,0.08)] bg-[rgba(0,59,70,0.015)] p-4 space-y-3">
              <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wide px-1">
                {expandedPosition.title} — Departments
              </p>
              <DepartmentList cSuiteId={expandedPosition.id} />
              <AddPositionButton
                parentId={expandedPosition.id}
                tier="department"
                department={null}
                label="Add Department"
                className="w-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
