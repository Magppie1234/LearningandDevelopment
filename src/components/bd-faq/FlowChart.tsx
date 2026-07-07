'use client'

import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FaqEdge, FaqNode } from '@/lib/bd-faq/faq-data'

/**
 * Vertical top-down process flow, rendered as inline SVG so it scales and
 * themes with the page (no <img>, no rasterised diagram). Nodes are laid out
 * in layers by BFS distance from the root(s), so a chain of N steps stacks
 * top-to-bottom and any side-branch nodes share a row automatically.
 *
 * Purely data-driven — every label, edge and detail comes from the `nodes`/
 * `edges` props (see lib/bd-faq/faq-data.ts). This component has no
 * knowledge of which FAQ it's rendering.
 */

const NODE_W = 216
const NODE_H = 60
const GAP_X = 20
const GAP_Y = 46

function layerNodes(nodes: FaqNode[], edges: FaqEdge[]): FaqNode[][] {
  const incoming = new Map<string, number>()
  nodes.forEach((n) => incoming.set(n.id, 0))
  edges.forEach((e) => incoming.set(e.to, (incoming.get(e.to) ?? 0) + 1))

  const childrenOf = new Map<string, string[]>()
  edges.forEach((e) => childrenOf.set(e.from, [...(childrenOf.get(e.from) ?? []), e.to]))

  const rowOf = new Map<string, number>()
  const roots = nodes.filter((n) => (incoming.get(n.id) ?? 0) === 0)
  const queue: { id: string; row: number }[] = roots.map((r) => ({ id: r.id, row: 0 }))
  while (queue.length) {
    const { id, row } = queue.shift()!
    if ((rowOf.get(id) ?? -1) >= row) continue
    rowOf.set(id, row)
    for (const childId of childrenOf.get(id) ?? []) queue.push({ id: childId, row: row + 1 })
  }
  let maxRow = 0
  rowOf.forEach((r) => { if (r > maxRow) maxRow = r })
  nodes.forEach((n) => { if (!rowOf.has(n.id)) rowOf.set(n.id, ++maxRow) })

  const rows: FaqNode[][] = []
  nodes.forEach((n) => {
    const r = rowOf.get(n.id) ?? 0
    rows[r] = rows[r] ?? []
    rows[r].push(n)
  })
  return rows.filter(Boolean)
}

function nodeVisual(node: FaqNode, isOpen: boolean) {
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

export default function FlowChart({
  nodes,
  edges,
  onNodeClick,
  ariaTitle = 'Process flow diagram',
  ariaDescription = 'A step-by-step flow chart.',
}: {
  nodes: FaqNode[]
  edges: FaqEdge[]
  onNodeClick?: (id: string) => void
  ariaTitle?: string
  ariaDescription?: string
}) {
  const uid = useId()
  const [openId, setOpenId] = useState<string | null>(null)
  const rows = layerNodes(nodes, edges)

  const rowWidths = rows.map((row) => row.length * NODE_W + (row.length - 1) * GAP_X)
  const width = Math.max(...rowWidths, NODE_W)
  const height = rows.length * NODE_H + (rows.length - 1) * GAP_Y

  const pos = new Map<string, { x: number; y: number }>()
  rows.forEach((row, r) => {
    const rowWidth = rowWidths[r]
    const startX = (width - rowWidth) / 2
    row.forEach((n, i) => {
      pos.set(n.id, { x: startX + i * (NODE_W + GAP_X), y: r * (NODE_H + GAP_Y) })
    })
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
        style={{ maxWidth: Math.min(width, 640) }}
      >
        <title id={`${uid}-title`}>{ariaTitle}</title>
        <desc id={`${uid}-desc`}>{ariaDescription}</desc>
        <defs>
          <marker
            id={`${uid}-arrow`}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" fill="rgba(0,59,70,0.35)" />
          </marker>
        </defs>

        {edges.map((e, i) => {
          const from = pos.get(e.from)
          const to = pos.get(e.to)
          if (!from || !to) return null
          const x1 = from.x + NODE_W / 2
          const y1 = from.y + NODE_H
          const x2 = to.x + NODE_W / 2
          const y2 = to.y
          return (
            <g key={i}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(0,59,70,0.35)"
                strokeWidth={1.5}
                markerEnd={`url(#${uid}-arrow)`}
              />
              {e.label && (
                <text
                  x={(x1 + x2) / 2 + 8}
                  y={(y1 + y2) / 2}
                  className="fill-ink-tertiary"
                  fontSize={11}
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
          const v = nodeVisual(n, isOpen)
          return (
            <g
              key={n.id}
              transform={`translate(${p.x}, ${p.y})`}
              tabIndex={0}
              role="button"
              aria-label={n.subtitle ? `${n.title} — ${n.subtitle}` : n.title}
              aria-expanded={isOpen}
              className="cursor-pointer"
              onClick={() => toggle(n.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  toggle(n.id)
                }
              }}
            >
              <rect
                width={NODE_W}
                height={NODE_H}
                rx={12}
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
            <div
              className={cn(
                'mt-3 rounded-[10px] border-[0.5px] border-accent-copper/30 bg-accent-copper/[0.05] px-3.5 py-3 flex items-start gap-2',
              )}
            >
              <ChevronRight size={14} className="mt-0.5 shrink-0 text-accent-copper" />
              <p className="text-[13px] text-ink-secondary leading-relaxed">{openNode.detail}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
