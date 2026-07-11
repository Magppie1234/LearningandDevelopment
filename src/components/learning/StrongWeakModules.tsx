'use client'

import { Sparkles, Target, RotateCcw, XCircle } from 'lucide-react'
import type { ModuleProgressRow } from '@/lib/learning-dashboard-client'

/**
 * Strong vs weak modules by quiz performance (spec §4). Classifies the modules
 * a learner has actually attempted:
 *   strong — completed with a high best score
 *   weak   — low score, unpassed, or needing retakes
 * Each row shows the best score, how many times the quiz was retaken, and how
 * many attempts failed. Dark "Obsidian" (warm-stone) surface.
 */

const STRONG_MIN = 85 // best score % to count as strong
const WEAK_MAX = 70 // best score % below this counts as weak

interface Item {
  key: string
  label: string
  score: number | null
  attempts: number
  retaken: number
  failed: number
}

function toItem(p: ModuleProgressRow, label: string): Item {
  const attempts = p.attempt_count
  return {
    key: `${p.academy_id}:${p.module_id}`,
    label,
    score: p.best_score_pct ?? null,
    attempts,
    retaken: Math.max(0, attempts - 1),
    failed: p.failed_attempts ?? 0,
  }
}

function Row({ item, tone }: { item: Item; tone: 'strong' | 'weak' }) {
  const color = tone === 'strong' ? 'rgb(var(--stone-sage))' : '#e0a04a'
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.04] px-3 py-2">
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-medium text-stone-ivory truncate">{item.label}</span>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-stone-ivory/55 mt-0.5">
          {item.score != null && (
            <span style={{ color }} className="font-semibold">
              Best {item.score}%
            </span>
          )}
          {item.retaken > 0 && (
            <span className="inline-flex items-center gap-1">
              <RotateCcw size={10} /> Retaken {item.retaken}×
            </span>
          )}
          {item.failed > 0 && (
            <span className="inline-flex items-center gap-1" style={{ color: '#e0a04a' }}>
              <XCircle size={10} /> {item.failed} failed
            </span>
          )}
          {item.retaken === 0 && item.failed === 0 && item.attempts > 0 && (
            <span>Passed first try</span>
          )}
        </span>
      </span>
    </div>
  )
}

export default function StrongWeakModules({
  progress,
  labelFor,
}: {
  progress: ModuleProgressRow[]
  labelFor: (moduleId: string) => string
}) {
  const attempted = progress.filter((p) => p.attempt_count > 0)
  if (attempted.length === 0) return null

  const strong = attempted
    .filter((p) => p.status === 'completed' && (p.best_score_pct ?? 0) >= STRONG_MIN && (p.failed_attempts ?? 0) === 0)
    .map((p) => toItem(p, labelFor(p.module_id)))

  const weak = attempted
    .filter(
      (p) =>
        (p.best_score_pct ?? 0) < WEAK_MAX ||
        (p.failed_attempts ?? 0) > 0 ||
        p.status !== 'completed',
    )
    .map((p) => toItem(p, labelFor(p.module_id)))

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* Strong */}
      <div className="rounded-2xl border border-white/10 bg-stone-espresso p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={15} style={{ color: 'rgb(var(--stone-sage))' }} />
          <h3 className="text-sm font-semibold text-stone-ivory">Strong modules</h3>
        </div>
        {strong.length > 0 ? (
          <div className="space-y-2">
            {strong.map((it) => (
              <Row key={it.key} item={it} tone="strong" />
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-stone-ivory/45">
            No strong modules yet — score {STRONG_MIN}%+ on a quiz to land here.
          </p>
        )}
      </div>

      {/* Weak / focus */}
      <div className="rounded-2xl border border-white/10 bg-stone-espresso p-5">
        <div className="flex items-center gap-2 mb-3">
          <Target size={15} style={{ color: '#e0a04a' }} />
          <h3 className="text-sm font-semibold text-stone-ivory">Needs focus</h3>
        </div>
        {weak.length > 0 ? (
          <div className="space-y-2">
            {weak.map((it) => (
              <Row key={it.key} item={it} tone="weak" />
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-stone-ivory/45">
            Nothing flagged — you&apos;re passing your quizzes cleanly.
          </p>
        )}
      </div>
    </div>
  )
}
