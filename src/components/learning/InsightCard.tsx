'use client'

import { TrendingUp, TrendingDown, Minus, Target, Sparkles } from 'lucide-react'
import type { InsightSummaryRow, ModuleProgressRow, LearningTrend } from '@/lib/learning-dashboard-client'

/**
 * Per-module insight card: a plain-language read of attempt trend and
 * weak/strong topics. Progress is the primary visual (ring), the sentence sits
 * underneath — numbers are never the first thing to parse. Renders only once a
 * learner has ≥1 attempt on the module.
 */

const TREND_META: Record<LearningTrend, { label: string; color: string; icon: typeof TrendingUp }> = {
  improving: { label: 'improving', color: 'var(--status-ontrack)', icon: TrendingUp },
  plateaued: { label: 'plateaued', color: 'var(--status-risk)', icon: Minus },
  declining: { label: 'declining', color: 'var(--status-overdue)', icon: TrendingDown },
}

function Ring({ pct, color }: { pct: number; color: string }) {
  const size = 56
  const sw = 6
  const r = (size - sw) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,59,70,0.08)" strokeWidth={sw} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
          style={{ transition: 'stroke-dashoffset 0.9s ease-out' }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold text-ink-primary tabular-nums">
        {pct}%
      </span>
    </div>
  )
}

function TopicChips({ topics, tone }: { topics: string[]; tone: 'weak' | 'strong' }) {
  if (topics.length === 0) return <span className="text-[12px] text-ink-tertiary">—</span>
  const color = tone === 'weak' ? 'var(--status-risk)' : 'var(--status-ontrack)'
  return (
    <span className="flex flex-wrap gap-1.5">
      {topics.map((t) => (
        <span
          key={t}
          className="inline-block rounded-lg px-2 py-0.5 text-[11px] font-medium"
          style={{ backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`, color }}
        >
          {t}
        </span>
      ))}
    </span>
  )
}

export default function InsightCard({
  moduleLabel,
  progress,
  insight,
  scores,
}: {
  moduleLabel: string
  progress: ModuleProgressRow
  insight?: InsightSummaryRow
  /** Best-known score % for the ring; falls back to completion status. */
  scores?: number[]
}) {
  if (progress.attempt_count < 1) return null

  const bestPct = scores && scores.length ? Math.max(...scores) : progress.status === 'completed' ? 100 : 0
  const trend = insight?.trend ?? null
  const tMeta = trend ? TREND_META[trend] : null
  const scoreTrail = scores && scores.length > 1 ? ` (${scores.join('% → ')}%)` : ''

  return (
    <div className="rounded-2xl border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream p-5 shadow-card">
      <div className="flex items-start gap-4">
        <Ring pct={bestPct} color={tMeta?.color ?? 'var(--status-ontrack)'} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink-primary">{moduleLabel}</p>
          {/* plain-language read */}
          <p className="text-[13px] text-ink-secondary mt-0.5">
            {progress.attempt_count} attempt{progress.attempt_count === 1 ? '' : 's'}
            {tMeta && (
              <>
                {' '}
                — trending{' '}
                <span className="inline-flex items-center gap-1 font-semibold" style={{ color: tMeta.color }}>
                  <tMeta.icon size={13} />
                  {tMeta.label}
                </span>
                {scoreTrail}
              </>
            )}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary mb-1.5">
            <Target size={12} style={{ color: 'var(--status-risk)' }} /> Focus here
          </p>
          <TopicChips topics={insight?.weak_topics ?? []} tone="weak" />
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary mb-1.5">
            <Sparkles size={12} style={{ color: 'var(--status-ontrack)' }} /> You&apos;re strong here
          </p>
          <TopicChips topics={insight?.strong_topics ?? []} tone="strong" />
        </div>
      </div>
    </div>
  )
}
