'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Plus, UserPlus, X } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useOrgStore } from '@/lib/org-store'
import { ORG_COLORS, type OrgPosition, type OrgTier } from '@/data/org-chart'

/**
 * Radial org chart, patterned on the classic circular Apple/Steve Jobs
 * layout: Founder & MD at the centre, the two board directors and six
 * C-Suite functions distributed around ring one (directors dashed), every
 * department and position packed onto staggered outer rings inside its
 * branch's sector so the wheel reads dense and even, each branch tinted
 * with its C-Suite accent. The whole wheel sits on Wellness Kitchen
 * photography with a navy veil and tilts in 3D toward the cursor.
 * Clicking any node opens a popup to assign or reassign people and to add
 * a sub-unit beneath it.
 */

const DEG = Math.PI / 180

interface LaidNode {
  p: OrgPosition
  x: number
  y: number
  colorKey?: keyof typeof ORG_COLORS
  dashed?: boolean
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

const CHILD_TIER: Record<OrgTier, OrgTier> = {
  board: 'c_suite',
  md_ceo: 'c_suite',
  c_suite: 'department',
  department: 'position',
  position: 'position',
}

function useNames(positionId: string): string[] {
  const roster = useOrgStore((s) => s.roster)
  const assignments = useOrgStore(
    useShallow((s) => s.assignments.filter((a) => a.positionId === positionId)),
  )
  return assignments
    .map((a) => a.customName ?? roster.find((e) => e.id === a.employeeId)?.name ?? '')
    .filter(Boolean)
}

/* ───────────────────────── node visuals ───────────────────────── */

function NodeButton({
  node,
  onOpen,
  children,
  className,
}: {
  node: LaidNode
  onOpen: (p: OrgPosition) => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(node.p)}
      className={`absolute -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-[1.09] hover:z-30 focus:z-30 ${className ?? ''}`}
      style={{ left: `${node.x}%`, top: `${node.y}%` }}
    >
      {children}
    </button>
  )
}

function CenterNode({ position, onOpen }: { position: OrgPosition; onOpen: (p: OrgPosition) => void }) {
  const names = useNames(position.id)
  return (
    <button
      type="button"
      onClick={() => onOpen(position)}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 transition-transform hover:scale-[1.05]"
      style={{ transform: 'translate(-50%, -50%) translateZ(46px)' }}
    >
      <span
        className="flex flex-col items-center justify-center w-[138px] h-[138px] rounded-full text-center"
        style={{
          backgroundColor: '#0b3947',
          border: '3px solid #C88255',
          boxShadow: '0 24px 60px rgba(0,0,0,0.55), 0 0 0 10px rgba(200,130,85,0.12)',
        }}
      >
        <span className="text-[15px] font-semibold text-[#f3ede2] leading-tight px-3">
          {names[0] ?? 'Unassigned'}
        </span>
        <span className="mt-1 text-[9px] uppercase tracking-[0.16em] text-[#C88255] px-3 leading-snug">
          {position.title}
        </span>
      </span>
    </button>
  )
}

function RingOneNode({ node, onOpen }: { node: LaidNode; onOpen: (p: OrgPosition) => void }) {
  const names = useNames(node.p.id)
  if (node.dashed) {
    // Board director — dashed satellite
    return (
      <NodeButton node={node} onOpen={onOpen} className="z-10">
        <span
          className="flex flex-col items-center justify-center w-[86px] h-[86px] rounded-full text-center backdrop-blur-[2px]"
          style={{ backgroundColor: 'rgba(243,237,226,0.92)', border: '1.5px dashed rgba(11,57,71,0.55)' }}
        >
          <span className="text-[11.5px] font-semibold text-ink-primary leading-tight px-2">{names[0] ?? '—'}</span>
          <span className="mt-0.5 text-[8px] uppercase tracking-[0.12em] text-ink-tertiary">{node.p.title}</span>
        </span>
      </NodeButton>
    )
  }
  const c = ORG_COLORS[node.colorKey ?? 'blue']
  return (
    <NodeButton node={node} onOpen={onOpen} className="z-10">
      <span
        className="flex flex-col items-center justify-center w-[142px] min-h-[58px] rounded-xl px-3 py-2 text-center"
        style={{
          backgroundColor: c.soft,
          borderTop: `3.5px solid ${c.bar}`,
          boxShadow: '0 14px 34px rgba(0,0,0,0.4)',
        }}
      >
        <span className="text-[10.5px] font-bold leading-snug" style={{ color: c.text }}>
          {node.p.title}
        </span>
        <span className="mt-0.5 text-[10px] text-ink-secondary leading-tight">
          {names.length ? names.join(' · ') : 'Unassigned'}
        </span>
      </span>
    </NodeButton>
  )
}

function RoundNode({
  node,
  size,
  onOpen,
}: {
  node: LaidNode
  size: number
  onOpen: (p: OrgPosition) => void
}) {
  const names = useNames(node.p.id)
  const c = ORG_COLORS[node.colorKey ?? 'blue']
  return (
    <NodeButton node={node} onOpen={onOpen}>
      <span
        className="flex flex-col items-center justify-center rounded-full text-center"
        style={{
          width: size,
          height: size,
          backgroundColor: c.soft,
          border: `1.5px solid ${c.bar}`,
          boxShadow: '0 10px 26px rgba(0,0,0,0.38)',
        }}
      >
        <span className="text-[9px] font-bold leading-tight px-1.5" style={{ color: c.text }}>
          {node.p.title}
        </span>
        <span className="text-[8px] text-ink-tertiary leading-tight px-1 line-clamp-2">{names[0] ?? '—'}</span>
      </span>
    </NodeButton>
  )
}

/* ───────────────────────── node popup ───────────────────────── */

function OrgNodeModal({ position, onClose }: { position: OrgPosition; onClose: () => void }) {
  const roster = useOrgStore((s) => s.roster)
  const assignments = useOrgStore(
    useShallow((s) => s.assignments.filter((a) => a.positionId === position.id)),
  )
  const addAssignment = useOrgStore((s) => s.addAssignment)
  const removeAssignment = useOrgStore((s) => s.removeAssignment)
  const addPosition = useOrgStore((s) => s.addPosition)
  const children = useOrgStore(
    useShallow((s) => s.positions.filter((p) => p.parentId === position.id)),
  )

  const [query, setQuery] = useState('')
  const [subTitle, setSubTitle] = useState('')
  const [addingSub, setAddingSub] = useState(false)

  const assignedIds = new Set(assignments.map((a) => a.employeeId).filter(Boolean) as string[])
  const q = query.trim().toLowerCase()
  const results = roster
    .filter((e) => !assignedIds.has(e.id))
    .filter((e) => q && (e.name.toLowerCase().includes(q) || e.department.toLowerCase().includes(q)))
    .slice(0, 5)

  const colorKey = position.color ?? 'blue'
  const c = ORG_COLORS[colorKey]

  const nameOf = (a: (typeof assignments)[number]) =>
    a.customName ?? roster.find((e) => e.id === a.employeeId)?.name ?? '—'

  const addSubUnit = () => {
    if (!subTitle.trim()) return
    addPosition({
      parentId: position.id,
      title: subTitle.trim(),
      tier: CHILD_TIER[position.tier],
      department: position.department,
    })
    setSubTitle('')
    setAddingSub(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ backgroundColor: 'rgba(4,20,25,0.74)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={position.title}
    >
      <motion.div
        initial={{ opacity: 0, y: 26, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.97 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[460px] rounded-3xl overflow-hidden shadow-[0_40px_90px_rgba(0,0,0,0.55)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* kitchen backdrop */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/login/kitchen-02.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(190deg, rgba(6,42,51,0.88) 0%, rgba(6,42,51,0.97) 75%)' }}
        />

        <div className="relative px-7 py-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span
                className="inline-block rounded-full px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.16em]"
                style={{ backgroundColor: c.bar, color: '#fff' }}
              >
                {position.tier.replace('_', ' ')}
              </span>
              <h3 className="mt-2.5 font-serif text-2xl text-[#f3ede2] leading-tight">{position.title}</h3>
              {position.department && (
                <p className="mt-1 text-[12px] text-[#f3ede2]/55">{position.department}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[#f3ede2]/70 hover:text-[#f3ede2] hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* assigned people */}
          <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#C88255]">
            Assigned
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {assignments.length === 0 && (
              <span className="text-[12.5px] text-[#f3ede2]/45">No one yet — search below.</span>
            )}
            {assignments.map((a) => (
              <span
                key={a.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[12px] text-[#f3ede2]"
              >
                {nameOf(a)}
                <button
                  type="button"
                  onClick={() => removeAssignment(a.id)}
                  aria-label={`Remove ${nameOf(a)}`}
                  className="text-[#f3ede2]/50 hover:text-[#f3ede2]"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>

          {/* assign someone */}
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 focus-within:border-[#C88255]/70 transition-colors">
            <UserPlus size={14} className="shrink-0 text-[#f3ede2]/45" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query.trim()) {
                  addAssignment(position.id, { customName: query.trim() })
                  setQuery('')
                }
              }}
              placeholder="Search the roster, or type a name and press Enter"
              className="w-full bg-transparent text-[13px] text-[#f3ede2] outline-none placeholder:text-[#f3ede2]/35"
            />
          </div>
          {results.length > 0 && (
            <div className="mt-1.5 rounded-xl border border-white/12 bg-[#062a33] overflow-hidden">
              {results.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => {
                    addAssignment(position.id, { employeeId: e.id })
                    setQuery('')
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2 text-left hover:bg-white/8 transition-colors"
                >
                  <span className="text-[13px] text-[#f3ede2]">{e.name}</span>
                  <span className="text-[11px] text-[#f3ede2]/45">
                    {e.department} · {e.currentPosition}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* sub-units */}
          <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#C88255]">
            Sub-units {children.length > 0 && `· ${children.length}`}
          </p>
          {children.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {children.map((ch) => (
                <span
                  key={ch.id}
                  className="rounded-full border border-white/15 px-3 py-1 text-[11.5px] text-[#f3ede2]/75"
                >
                  {ch.title}
                </span>
              ))}
            </div>
          )}
          {addingSub ? (
            <div className="mt-3 flex items-center gap-2">
              <input
                autoFocus
                value={subTitle}
                onChange={(e) => setSubTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSubUnit()}
                placeholder={`New ${CHILD_TIER[position.tier].replace('_', ' ')} title…`}
                className="flex-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-[13px] text-[#f3ede2] outline-none placeholder:text-[#f3ede2]/35 focus:border-[#C88255]/70 transition-colors"
              />
              <button
                type="button"
                onClick={addSubUnit}
                className="rounded-xl px-4 py-2.5 text-[12px] font-semibold"
                style={{ backgroundColor: '#C88255', color: '#141414' }}
              >
                Add
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAddingSub(true)}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-dashed border-[#C88255]/60 px-4 py-2 text-[12.5px] font-semibold text-[#C88255] hover:bg-[#C88255]/10 transition-colors"
            >
              <Plus size={13} /> Add sub-unit
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ───────────────────────── the wheel ───────────────────────── */

export function RadialOrgChart() {
  const positions = useOrgStore((s) => s.positions)
  const [open, setOpen] = useState<OrgPosition | null>(null)

  // 3D tilt, as on the Vision kitchen walkthrough (gentle — it's a tool).
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const rotateY = useSpring(useTransform(mx, [0, 1], [-4.5, 4.5]), { stiffness: 140, damping: 20 })
  const rotateX = useSpring(useTransform(my, [0, 1], [3.5, -3.5]), { stiffness: 140, damping: 20 })

  const layout = useMemo(() => {
    const board = positions.filter((p) => p.tier === 'board').sort((a, b) => a.sortOrder - b.sortOrder)
    const center = board.find((p) => p.title.toLowerCase().includes('managing director')) ?? board[0]
    const directors = board.filter((p) => p.id !== center?.id)
    const cSuite = positions.filter((p) => p.tier === 'c_suite').sort((a, b) => a.sortOrder - b.sortOrder)
    const childrenOf = (id: string) =>
      positions.filter((p) => p.parentId === id).sort((a, b) => a.sortOrder - b.sortOrder)

    // Ring one = directors (dashed, slim sectors) + C-Suite, sharing the full
    // circle. Sector width follows subtree size with a floor, so the wheel
    // stays dense and even — no reserved empty arcs.
    type Branch = { p: OrgPosition; dashed?: boolean; weight: number }
    const branches: Branch[] = [
      ...directors.map((p) => ({ p, dashed: true, weight: 1.0 })),
      ...cSuite.map((p) => {
        const depts = childrenOf(p.id)
        const posCount = depts.reduce((n, d) => n + childrenOf(d.id).length, 0)
        return { p, weight: Math.max(1, 0.9 + depts.length * 0.9 + posCount * 0.5) }
      }),
    ]
    // Directors together at the top: order = [dir1, dir2, ...cSuite], starting
    // so the director group midpoint sits at -90°.
    const totalW = branches.reduce((a, b) => a + b.weight, 0)
    const dirW = branches.filter((b) => b.dashed).reduce((a, b) => a + b.weight, 0)
    let cursor = -90 - (dirW / totalW) * 180 // centre director group on top

    const ringOne: LaidNode[] = []
    const deptNodes: LaidNode[] = []
    const posNodes: LaidNode[] = []
    const wires: Wire[] = []

    branches.forEach((b) => {
      const span = (b.weight / totalW) * 360
      const a0 = cursor
      const mid = a0 + span / 2
      cursor += span
      const colorKey = b.p.color ?? 'blue'
      const bar = ORG_COLORS[colorKey].bar
      const r1 = b.dashed ? 29 : 21.5
      const bPt = pt(mid, r1)
      ringOne.push({ p: b.p, ...bPt, colorKey, dashed: b.dashed })
      wires.push({
        x1: 50,
        y1: 50,
        x2: bPt.x,
        y2: bPt.y,
        color: b.dashed ? 'rgba(243,237,226,0.4)' : `${bar}bb`,
        dashed: b.dashed,
      })
      if (b.dashed) return

      const depts = childrenOf(b.p.id)
      depts.forEach((d, di) => {
        const dSpan = span / depts.length
        const d0 = a0 + di * dSpan
        const dMid = d0 + dSpan / 2
        const dR = 35 + (di % 2) * 3 // stagger, Apple-style organic rings
        const dPt = pt(dMid, dR)
        deptNodes.push({ p: d, ...dPt, colorKey })
        wires.push({ x1: bPt.x, y1: bPt.y, x2: dPt.x, y2: dPt.y, color: `${bar}99` })

        const posns = childrenOf(d.id)
        posns.forEach((pp, pi) => {
          const pa = posns.length === 1 ? dMid : d0 + ((pi + 0.5) / posns.length) * dSpan
          const pR = 45.5 + (pi % 2) * 4.5
          const pPt = pt(pa, pR)
          posNodes.push({ p: pp, ...pPt, colorKey })
          wires.push({ x1: dPt.x, y1: dPt.y, x2: pPt.x, y2: pPt.y, color: `${bar}73` })
        })
      })
    })

    return { center, ringOne, deptNodes, posNodes, wires }
  }, [positions])

  if (!layout.center) return null

  return (
    <div style={{ perspective: 1400 }}>
      <motion.div
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          mx.set((e.clientX - r.left) / r.width)
          my.set((e.clientY - r.top) / r.height)
        }}
        onMouseLeave={() => {
          mx.set(0.5)
          my.set(0.5)
        }}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative mx-auto w-full max-w-[1060px] aspect-square select-none"
      >
        {/* orbit guides + connectors */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" aria-hidden>
          {[21.5, 36.5, 47.5].map((r) => (
            <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="rgba(243,237,226,0.09)" strokeWidth="0.16" />
          ))}
          {layout.wires.map((w, i) => (
            <line
              key={i}
              x1={w.x1}
              y1={w.y1}
              x2={w.x2}
              y2={w.y2}
              stroke={w.color}
              strokeWidth="0.3"
              strokeDasharray={w.dashed ? '1.3 1.1' : undefined}
            />
          ))}
        </svg>

        <CenterNode position={layout.center} onOpen={setOpen} />
        {layout.ringOne.map((n) => (
          <RingOneNode key={n.p.id} node={n} onOpen={setOpen} />
        ))}
        {layout.deptNodes.map((n) => (
          <RoundNode key={n.p.id} node={n} size={80} onOpen={setOpen} />
        ))}
        {layout.posNodes.map((n) => (
          <RoundNode key={n.p.id} node={n} size={62} onOpen={setOpen} />
        ))}
      </motion.div>

      <AnimatePresence>
        {open && <OrgNodeModal position={open} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </div>
  )
}
