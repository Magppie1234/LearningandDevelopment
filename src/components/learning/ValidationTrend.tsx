'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { TrendPoint } from '@/lib/readiness-trend'

/**
 * Competencies validated over the last few months.
 *
 * Hand-drawn SVG rather than a charting dependency: this is one series of six
 * points on a card, and pulling in a chart library for it would cost more in
 * bundle than the whole feature is worth.
 *
 * The y-axis is deliberately anchored at 0 and at the role's total, not at the
 * data's own min/max. An auto-scaled axis would turn "one competency validated
 * in six months" into a dramatic climb; against the total it reads as what it
 * is. Charts that flatter progress are worse than no chart.
 */
export default function ValidationTrend({
  points,
  height = 132,
}: {
  points: readonly TrendPoint[]
  height?: number
}) {
  const reduceMotion = useReducedMotion()
  if (points.length < 2) return null

  const w = 100 // viewBox units; the SVG scales to its container
  const h = 40
  const padY = 4
  const total = Math.max(1, points[0].total)

  const x = (i: number) => (i / (points.length - 1)) * w
  const y = (v: number) => padY + (1 - v / total) * (h - padY * 2)

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.validated)}`).join(' ')
  const area = `${line} L ${w} ${h} L 0 ${h} Z`

  const first = points[0].validated
  const last = points[points.length - 1].validated
  const delta = last - first

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[11px] text-ink-tertiary">
          {last} of {total} validated
        </p>
        <p className="text-[11px] font-medium text-ink-secondary tnum">
          {delta > 0 ? `+${delta}` : delta === 0 ? 'no change' : delta} over {points.length} months
        </p>
      </div>

      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="mt-2 w-full"
        style={{ height }}
        role="img"
        aria-label={`Competencies validated over the last ${points.length} months, ${first} rising to ${last} of ${total}`}
      >
        <defs>
          <linearGradient id="vt-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4C7C59" stopOpacity="0.22" />
            <stop offset="1" stopColor="#4C7C59" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Full-height reference: the role's total requirement. */}
        <line x1="0" y1={y(total)} x2={w} y2={y(total)} stroke="rgb(var(--rule) / 0.18)" strokeWidth="0.4" />

        <motion.path
          d={area}
          fill="url(#vt-fill)"
          initial={{ opacity: reduceMotion ? 1 : 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.7, delay: 0.2 }}
        />
        <motion.path
          d={line}
          fill="none"
          stroke="#4C7C59"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: reduceMotion ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: reduceMotion ? 0 : 1, ease: 'easeOut' }}
        />
        <circle cx={x(points.length - 1)} cy={y(last)} r="1.6" fill="#4C7C59" vectorEffect="non-scaling-stroke" />
      </svg>

      <div className="mt-1 flex justify-between">
        {points.map((p) => (
          <span key={p.month} className="text-[10px] text-ink-tertiary">
            {p.label}
          </span>
        ))}
      </div>
    </div>
  )
}
