'use client'

import { useLayoutEffect, useState, type MutableRefObject, type RefObject } from 'react'

type Point = { x: number; y: number }
type Segment = { key: string; d: string }

/**
 * Measures a parent box and a single row of child boxes (all descendants of
 * `containerRef`) and derives SVG path segments for a classic org-chart
 * branch: a trunk drop from the parent, a horizontal bar, and a vertical drop
 * into each child. Recomputes on any size change — window resize, sidebar
 * collapse, or a card expanding — via ResizeObserver on the container, so it
 * stays correct without manual invalidation.
 */
export function useTreeConnectors(
  containerRef: RefObject<HTMLElement | null>,
  parentRef: RefObject<HTMLElement | null>,
  childRefs: MutableRefObject<Map<string, HTMLElement>>,
  orderedChildIds: string[],
) {
  const [segments, setSegments] = useState<Segment[]>([])

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    function recompute() {
      const containerEl = containerRef.current
      const parentEl = parentRef.current
      if (!containerEl || !parentEl) return
      const containerRect = containerEl.getBoundingClientRect()
      const parentRect = parentEl.getBoundingClientRect()

      const parentBottom: Point = {
        x: parentRect.left + parentRect.width / 2 - containerRect.left,
        y: parentRect.bottom - containerRect.top,
      }

      const children = orderedChildIds
        .map((id) => childRefs.current.get(id))
        .filter((el): el is HTMLElement => Boolean(el))
      if (children.length === 0) {
        setSegments([])
        return
      }

      const tops: Point[] = children.map((el) => {
        const r = el.getBoundingClientRect()
        return { x: r.left + r.width / 2 - containerRect.left, y: r.top - containerRect.top }
      })

      const midY = parentBottom.y + (tops[0].y - parentBottom.y) / 2
      const segs: Segment[] = [
        { key: 'trunk', d: `M ${parentBottom.x} ${parentBottom.y} L ${parentBottom.x} ${midY}` },
      ]

      if (tops.length === 1) {
        segs.push({ key: 'solo', d: `M ${parentBottom.x} ${midY} L ${tops[0].x} ${tops[0].y}` })
      } else {
        const xs = tops.map((p) => p.x)
        const minX = Math.min(...xs)
        const maxX = Math.max(...xs)
        segs.push({ key: 'bar', d: `M ${minX} ${midY} L ${maxX} ${midY}` })
        tops.forEach((p, i) => {
          segs.push({ key: `drop-${i}`, d: `M ${p.x} ${midY} L ${p.x} ${p.y}` })
        })
      }

      setSegments(segs)
    }

    recompute()
    const ro = new ResizeObserver(recompute)
    ro.observe(container)
    window.addEventListener('resize', recompute)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', recompute)
    }
    // orderedChildIds is joined below to compare by content, not reference —
    // .map() upstream creates a fresh array each render otherwise.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, parentRef, childRefs, orderedChildIds.join('|')])

  return segments
}

export function TreeConnectorSvg({ segments }: { segments: Segment[] }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
      {segments.map((s) => (
        <path key={s.key} d={s.d} stroke="rgba(0,59,70,0.22)" strokeWidth={1.5} fill="none" />
      ))}
    </svg>
  )
}
