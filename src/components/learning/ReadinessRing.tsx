'use client'

import { motion, useReducedMotion } from 'framer-motion'

/**
 * Role readiness as a ring rather than a number you have to read.
 *
 * The ring SUPPLEMENTS the figure and the status text; it does not replace
 * them. A percentage alone cannot say whether someone is role ready — a
 * single approved-critical gap holds the verdict at "Not role ready" no
 * matter how high the coverage runs — so the number stays in the middle and
 * the status badge stays beside it. The ring's only job is to make the
 * magnitude land instantly.
 *
 * The arc is tinted by the verdict, not by the percentage, for that same
 * reason: 90% coverage with a critical gap is a red ring, because the honest
 * reading of that state is "blocked", not "nearly there".
 */

const TONE_STROKE = {
  success: '#4C7C59',
  warning: '#B8763F',
  danger: '#B4453C',
  neutral: '#7A736B',
} as const

export type ReadinessTone = keyof typeof TONE_STROKE

export default function ReadinessRing({
  pct,
  tone = 'neutral',
  size = 132,
  stroke = 10,
  label,
}: {
  /** 0–100. Clamped, because a malformed input should not draw a broken arc. */
  pct: number
  tone?: ReadinessTone
  size?: number
  stroke?: number
  /** Small caption under the figure, e.g. "6 of 10 validated". */
  label?: string
}) {
  const reduceMotion = useReducedMotion()
  const safe = Math.max(0, Math.min(100, Number.isFinite(pct) ? pct : 0))

  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const dash = (safe / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        // Rotated so the arc starts at 12 o'clock rather than 3 o'clock.
        style={{ transform: 'rotate(-90deg)' }}
        role="img"
        aria-label={`Role readiness ${Math.round(safe)} percent`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgb(var(--rule) / 0.16)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={TONE_STROKE[tone]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: reduceMotion ? circumference - dash : circumference }}
          animate={{ strokeDashoffset: circumference - dash }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-serif text-[30px] leading-none font-semibold text-ink-primary tnum">
          {Math.round(safe)}%
        </span>
        {label && (
          <span className="mt-1 px-2 text-[10px] leading-tight text-ink-tertiary">{label}</span>
        )}
      </div>
    </div>
  )
}
