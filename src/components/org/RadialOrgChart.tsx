'use client'

import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useOrgStore } from '@/lib/org-store'
import { ORG_COLORS, type OrgPosition } from '@/data/org-chart'
import { PositionEditor } from './PositionEditor'

/**
 * Radial org chart — the circular "CEO at the centre" layout (à la the
 * classic Apple/Steve Jobs chart): Founder & MD in the middle, the two
 * board directors floating above on dashed lines, each C-Suite function
 * as a colored card on the inner ring, departments on the middle ring and
 * individual positions on the outer ring, every branch tinted with its
 * C-Suite accent. Nodes stay clickable through the existing PositionEditor,
 * so assign/reassign keeps working exactly as before.
 */

const DEG = Math.PI / 180
/** Board arc reserved at the top of the circle. */
const BOARD_ARC: [number, number] = [-125, -55]
/** C-Suite branches sweep the remaining circle. */
const RING = { csuite: 24, dept: 37.5, pos: 47 } // % of canvas half-width

interface LaidNode {
  p: OrgPosition
  x: number
  y: number
  colorKey?: keyof typeof ORG_COLORS
}
interface Wire {
  x1: number
  y1: number
  x2: number
  y2: number
  color: string
  dashed?: boolean
}

const pt = (angleDeg: number, r: number) => ({
  x: 50 + r * Math.cos(angleDeg * DEG),
  y: 50 + r * Math.sin(angleDeg * DEG),
})

function useNames(positionId: string): string[] {
  const roster = useOrgStore((s) => s.roster)
  const assignments = useOrgStore(
    useShallow((s) => s.assignments.filter((a) => a.positionId === positionId)),
  )
  return assignments
    .map((a) => a.customName ?? roster.find((e) => e.id === a.employeeId)?.name ?? '')
    .filter(Boolean)
}

function NodeShell({
  position,
  className,
  style,
  children,
}: {
  position: OrgPosition
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}) {
  return (
    <PositionEditor position={position} align="center">
      <button
        type="button"
        className={`absolute -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-[1.07] hover:z-20 focus:z-20 ${className ?? ''}`}
        style={style}
      >
        {children}
      </button>
    </PositionEditor>
  )
}

function CenterNode({ position }: { position: OrgPosition }) {
  const names = useNames(position.id)
  return (
    <NodeShell position={position} className="z-10" style={{ left: '50%', top: '50%' }}>
      <span
        className="flex flex-col items-center justify-center w-[132px] h-[132px] rounded-full text-center shadow-elevated"
        style={{ backgroundColor: '#0b3947', border: '3px solid #C88255' }}
      >
        <span className="text-[15px] font-semibold text-[#f3ede2] leading-tight px-3">
          {names[0] ?? 'Unassigned'}
        </span>
        <span className="mt-1 text-[9.5px] uppercase tracking-[0.14em] text-[#f3ede2]/65 px-3 leading-snug">
          {position.title}
        </span>
      </span>
    </NodeShell>
  )
}

function BoardNode({ position, x, y }: { position: OrgPosition; x: number; y: number }) {
  const names = useNames(position.id)
  return (
    <NodeShell position={position} style={{ left: `${x}%`, top: `${y}%` }}>
      <span
        className="flex flex-col items-center justify-center w-[84px] h-[84px] rounded-full text-center bg-cream shadow-card"
        style={{ border: '1.5px dashed rgba(0,59,70,0.4)' }}
      >
        <span className="text-[11.5px] font-semibold text-ink-primary leading-tight px-2">
          {names[0] ?? '—'}
        </span>
        <span className="mt-0.5 text-[8.5px] uppercase tracking-[0.12em] text-ink-tertiary">
          {position.title}
        </span>
      </span>
    </NodeShell>
  )
}

function CSuiteRadialNode({ node }: { node: LaidNode }) {
  const names = useNames(node.p.id)
  const c = ORG_COLORS[node.colorKey ?? 'blue']
  return (
    <NodeShell position={node.p} className="z-10" style={{ left: `${node.x}%`, top: `${node.y}%` }}>
      <span
        className="flex flex-col items-center justify-center w-[150px] min-h-[62px] rounded-xl px-3 py-2.5 text-center shadow-card"
        style={{ backgroundColor: c.soft, border: `1px solid ${c.bar}66`, borderTop: `3.5px solid ${c.bar}` }}
      >
        <span className="text-[11px] font-bold leading-snug" style={{ color: c.text }}>
          {node.p.title}
        </span>
        <span className="mt-0.5 text-[10.5px] text-ink-secondary leading-tight">
          {names.length ? names.join(' · ') : 'Unassigned'}
        </span>
      </span>
    </NodeShell>
  )
}

function RoundNode({ node, size }: { node: LaidNode; size: number }) {
  const names = useNames(node.p.id)
  const c = ORG_COLORS[node.colorKey ?? 'blue']
  return (
    <NodeShell position={node.p} style={{ left: `${node.x}%`, top: `${node.y}%` }}>
      <span
        className="flex flex-col items-center justify-center rounded-full text-center shadow-card"
        style={{
          width: size,
          height: size,
          backgroundColor: c.soft,
          border: `1.5px solid ${c.bar}`,
        }}
      >
        <span className="text-[9.5px] font-bold leading-tight px-1.5" style={{ color: c.text }}>
          {node.p.title}
        </span>
        <span className="text-[8.5px] text-ink-tertiary leading-tight px-1.5 line-clamp-2">
          {names[0] ?? '—'}
        </span>
      </span>
    </NodeShell>
  )
}

export function RadialOrgChart() {
  const positions = useOrgStore((s) => s.positions)

  const layout = useMemo(() => {
    const board = positions.filter((p) => p.tier === 'board').sort((a, b) => a.sortOrder - b.sortOrder)
    const center = board.find((p) => p.title.toLowerCase().includes('managing director')) ?? board[0]
    const boardRest = board.filter((p) => p.id !== center?.id)
    const cSuite = positions.filter((p) => p.tier === 'c_suite').sort((a, b) => a.sortOrder - b.sortOrder)
    const childrenOf = (id: string) =>
      positions.filter((p) => p.parentId === id).sort((a, b) => a.sortOrder - b.sortOrder)

    // Board directors on the reserved top arc, dashed into the centre.
    const boardNodes: LaidNode[] = boardRest.map((p, i) => {
      const a = BOARD_ARC[0] + ((i + 1) / (boardRest.length + 1)) * (BOARD_ARC[1] - BOARD_ARC[0])
      const { x, y } = pt(a, 30)
      return { p, x, y }
    })

    // Angular budget per C-Suite branch, weighted by subtree size.
    const weights = cSuite.map((c) => {
      const depts = childrenOf(c.id)
      const posCount = depts.reduce((n, d) => n + childrenOf(d.id).length, 0)
      return 1.2 + depts.length + posCount * 0.55
    })
    const totalW = weights.reduce((a, b) => a + b, 0)
    const sweepStart = BOARD_ARC[1]
    const sweep = 360 - (BOARD_ARC[1] - BOARD_ARC[0])

    const csNodes: LaidNode[] = []
    const deptNodes: LaidNode[] = []
    const posNodes: LaidNode[] = []
    const wires: Wire[] = []

    let cursor = sweepStart
    cSuite.forEach((c, i) => {
      const span = (weights[i] / totalW) * sweep
      const a0 = cursor
      const a1 = cursor + span
      cursor = a1
      const mid = (a0 + a1) / 2
      const colorKey = c.color ?? 'blue'
      const bar = ORG_COLORS[colorKey].bar
      const cPt = pt(mid, RING.csuite)
      csNodes.push({ p: c, ...cPt, colorKey })
      wires.push({ x1: 50, y1: 50, x2: cPt.x, y2: cPt.y, color: `${bar}88` })

      const depts = childrenOf(c.id)
      depts.forEach((d, di) => {
        const dSpan = span / depts.length
        const d0 = a0 + di * dSpan
        const dMid = d0 + dSpan / 2
        const dPt = pt(dMid, RING.dept)
        deptNodes.push({ p: d, ...dPt, colorKey })
        wires.push({ x1: cPt.x, y1: cPt.y, x2: dPt.x, y2: dPt.y, color: `${bar}66` })

        const posns = childrenOf(d.id)
        posns.forEach((pp, pi) => {
          const pa = posns.length === 1 ? dMid : d0 + ((pi + 0.5) / posns.length) * dSpan
          const pPt = pt(pa, RING.pos)
          posNodes.push({ p: pp, ...pPt, colorKey })
          wires.push({ x1: dPt.x, y1: dPt.y, x2: pPt.x, y2: pPt.y, color: `${bar}4d` })
        })
      })
    })

    const boardWires: Wire[] = boardNodes.map((b) => ({
      x1: 50,
      y1: 50,
      x2: b.x,
      y2: b.y,
      color: 'rgba(0,59,70,0.35)',
      dashed: true,
    }))

    return { center, boardNodes, csNodes, deptNodes, posNodes, wires: [...wires, ...boardWires] }
  }, [positions])

  if (!layout.center) return null

  return (
    <div className="relative mx-auto w-full max-w-[1060px] aspect-square select-none">
      {/* faint orbit guides + connectors */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" aria-hidden>
        {Object.values(RING).map((r) => (
          <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="rgba(0,59,70,0.06)" strokeWidth="0.18" />
        ))}
        {layout.wires.map((w, i) => (
          <line
            key={i}
            x1={w.x1}
            y1={w.y1}
            x2={w.x2}
            y2={w.y2}
            stroke={w.color}
            strokeWidth="0.28"
            strokeDasharray={w.dashed ? '1.4 1.1' : undefined}
          />
        ))}
      </svg>

      <CenterNode position={layout.center} />
      {layout.boardNodes.map((n) => (
        <BoardNode key={n.p.id} position={n.p} x={n.x} y={n.y} />
      ))}
      {layout.csNodes.map((n) => (
        <CSuiteRadialNode key={n.p.id} node={n} />
      ))}
      {layout.deptNodes.map((n) => (
        <RoundNode key={n.p.id} node={n} size={82} />
      ))}
      {layout.posNodes.map((n) => (
        <RoundNode key={n.p.id} node={n} size={64} />
      ))}
    </div>
  )
}
