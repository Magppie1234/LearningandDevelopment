'use client'

import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import type { FaqEdge, FaqNode } from '@/lib/bd-faq/faq-data'

/**
 * SVG decision tree: one root decision node branching into labelled paths,
 * leaves are outcomes. Outcome tone drives the accent — positive outcomes get
 * the on-track status colour, muted ones stay quiet — so colour encodes the
 * recommendation, not decoration. Same data contract as FlowChart
 * (nodes + edges), laid out by depth from the root.
 */

const NODE_W = 200
const NODE_H = 56
const GAP_X = 24
const GAP_Y = 52

function depthsFrom(nodes: FaqNode[], edges: FaqEdge[]) {
  const incoming = new Map<string, number>()
  nodes.forEach((n) => incoming.set(n.id, 0))
  edges.forEach((e) => incoming.set(e.to, (incoming.get(e.to) ?? 0) + 1))
  const children = new Map<string, string[]>()
  edges.forEach((e) => children.set(e.from, [...(children.get(e.from) ?? []), e.to]))

  const depth = new Map<string, number>()
  const queue = nodes.filter((n) => (incoming.get(n.id) ?? 0) === 0).map((n) => ({ id: n.id, d: 0 }))
  while (queue.length) {
    const { id, d } = queue.shift()!
    if ((depth.get(id) ?? -1) >= d) continue
    depth.set(id, d)
    for (const c of children.get(id) ?? []) queue.push({ id: c, d: d + 1 })
  }
  return depth
}

function visual(node: FaqNode, isOpen: boolean) {
  if (node.kind === 'decision') {
    return {
      fill: 'rgba(184,112,63,0.12)',
      stroke: isOpen ? 'rgb(var(--m-accent-copper))' : 'rgba(184,112,63,0.45)',
      text: 'rgb(var(--m-ink-primary))',
    }
  }
  if (node.kind === 'outcome') {
    if (node.tone === 'muted') {
      return { fill: 'rgba(0,59,70,0.05)', stroke: 'rgba(0,59,70,0.2)', text: 'rgb(var(--m-ink-tertiary))' }
    }
    return { fill: 'var(--status-ontrack-bg)', stroke: 'var(--status-ontrack-fg)', text: 'var(--status-ontrack-fg)' }
  }
  return {
    fill: isOpen ? 'rgba(184,112,63,0.1)' : 'rgba(0,59,70,0.04)',
    stroke: isOpen ? 'rgb(var(--m-accent-copper))' : 'rgba(0,59,70,0.16)',
    text: 'rgb(var(--m-ink-primary))',
  }
}

export default function DecisionTree({
  nodes,
  edges,
  onNodeClick,
  ariaTitle = 'Decision tree diagram',
  ariaDescription = 'A decision tree with branches leading to outcomes.',
}: {
  nodes: FaqNode[]
  edges: FaqEdge[]
  onNodeClick?: (id: string) => void
  ariaTitle?: string
  ariaDescription?: string
}) {
  const uid = useId()
  const [openId, setOpenId] = useState<string | null>(null)

  const depth = depthsFrom(nodes, edges)
  const rows: FaqNode[][] = []
  nodes.forEach((n) => {
    const d = depth.get(n.id) ?? 0
    rows[d] = rows[d] ?? []
    rows[d].push(n)
  })
  const layers = rows.filter(Boolean)

  const rowWidths = layers.map((row) => row.length * NODE_W + (row.length - 1) * GAP_X)
  const width = Math.max(...rowWidths, NODE_W)
  const height = layers.length * NODE_H + (layers.length - 1) * GAP_Y

  const pos = new Map<string, { x: number; y: number }>()
  layers.forEach((row, r) => {
    const startX = (width - rowWidths[r]) / 2
    row.forEach((n, i) => pos.set(n.id, { x: startX + i * (NODE_W + GAP_X), y: r * (NODE_H + GAP_Y) }))
  })

  function toggle(id: string) {
    setOpenId((cur) => (cur === id ? null : id))
    onNodeClick?.(id)
  }

  const openNode = nodes.find((n) => n.id === openId)

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-labelledby={`${uid}-title ${uid}-desc`}
        className="w-full h-auto"
        style={{ maxWidth: Math.min(width, 680) }}
      >
        <title id={`${uid}-title`}>{ariaTitle}</title>
        <desc id={`${uid}-desc`}>{ariaDescription}</desc>

        {edges.map((e, i) => {
          const from = pos.get(e.from)
          const to = pos.get(e.to)
          if (!from || !to) return null
          const x1 = from.x + NODE_W / 2
          const y1 = from.y + NODE_H
          const x2 = to.x + NODE_W / 2
          const y2 = to.y
          const midY = (y1 + y2) / 2
          return (
            <g key={i}>
              <path
                d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                fill="none"
                stroke="rgba(0,59,70,0.3)"
                strokeWidth={1.5}
              />
              {e.label && (
                <text
                  x={(x1 + x2) / 2}
                  y={midY - 4}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={600}
                  className="fill-ink-tertiary"
                >
                  {e.label}
                </text>
              )}
            </g>
          )
        })}

        {nodes.map((n) => {
          const p = pos.get(n.id)
          if (!p) return null
          const isOpen = openId === n.id
          const v = visual(n, isOpen)
          const clickable = Boolean(n.detail)
          return (
            <g
              key={n.id}
              transform={`translate(${p.x}, ${p.y})`}
              tabIndex={clickable ? 0 : -1}
              role={clickable ? 'button' : undefined}
              aria-label={n.title}
              aria-expanded={clickable ? isOpen : undefined}
              className={clickable ? 'cursor-pointer' : undefined}
              onClick={clickable ? () => toggle(n.id) : undefined}
              onKeyDown={
                clickable
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        toggle(n.id)
                      }
                    }
                  : undefined
              }
            >
              <rect
                width={NODE_W}
                height={NODE_H}
                rx={n.kind === 'decision' ? 28 : 12}
                fill={v.fill}
                stroke={v.stroke}
                strokeWidth={isOpen ? 1.75 : 1}
              />
              <text
                x={NODE_W / 2}
                y={n.subtitle ? NODE_H / 2 - 6 : NODE_H / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={13}
                fontWeight={600}
                style={{ fill: v.text }}
              >
                {n.title}
              </text>
              {n.subtitle && (
                <text
                  x={NODE_W / 2}
                  y={NODE_H / 2 + 12}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={11}
                  className="fill-ink-tertiary"
                >
                  {n.subtitle}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      <AnimatePresence initial={false}>
        {openNode?.detail && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-[10px] border-[0.5px] border-accent-copper/30 bg-accent-copper/[0.05] px-3.5 py-3 flex items-start gap-2">
              <ChevronRight size={14} className="mt-0.5 shrink-0 text-accent-copper" />
              <p className="text-[13px] text-ink-secondary leading-relaxed">{openNode.detail}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
