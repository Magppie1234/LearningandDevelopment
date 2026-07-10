'use client'

import { Hourglass } from 'lucide-react'
import { useDemoLearningData } from '@/lib/learning-demo-data'

/**
 * Academy-scoped "~X hours remaining" estimate. Rough, pace-based:
 *   (avg time per COMPLETED module in this academy) × (modules not completed).
 * Improves as more modules are completed. With 0 completed it shows a
 * placeholder rather than a guess. Reusable across academies — pass academyId.
 *
 * Light card (sits on the parchment academy dashboards). Reads the demo bridge
 * today; swaps to live module_progress with real auth.
 */
export default function EstimatedCompletionCard({
  academyId,
  academyName,
}: {
  academyId: string
  academyName: string
}) {
  const { progress } = useDemoLearningData(academyId)

  const completed = progress.filter((p) => p.status === 'completed')
  const remaining = progress.filter((p) => p.status !== 'completed').length

  const avgSecPerCompleted = completed.length
    ? completed.reduce((s, p) => s + p.total_time_spent_seconds, 0) / completed.length
    : 0
  const estHours = avgSecPerCompleted ? (avgSecPerCompleted * remaining) / 3600 : 0

  return (
    <div className="rounded-2xl border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream p-5 shadow-card flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-accent-copper/15 flex items-center justify-center shrink-0">
        <Hourglass size={22} className="text-accent-copper" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">
          Estimated time remaining
        </p>
        {completed.length === 0 ? (
          <p className="text-sm text-ink-secondary mt-0.5">
            Estimate available after your first completed module.
          </p>
        ) : remaining === 0 ? (
          <p className="text-sm font-semibold text-ink-primary mt-0.5">
            {academyName} complete — nothing left to finish.
          </p>
        ) : (
          <>
            <p className="text-2xl font-bold text-ink-primary tabular-nums leading-tight mt-0.5">
              ~{estHours < 1 ? `${Math.round(estHours * 60)} min` : `${estHours.toFixed(1)} hours`}
            </p>
            <p className="text-[12px] text-ink-tertiary mt-0.5">
              to finish {academyName} · {remaining} module{remaining === 1 ? '' : 's'} left, at your pace
            </p>
          </>
        )}
      </div>
    </div>
  )
}
