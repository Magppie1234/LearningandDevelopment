import type { ModuleProgressRow, InsightSummaryRow } from '@/lib/learning-dashboard-api'

/** Headline rollup used by the dashboard header and the every-login popup. */
export interface LearningSummary {
  totalModules: number
  completed: number
  inProgress: number
  completionPct: number
  totalTimeSeconds: number
  strongestTopic: string | null
  weakestTopic: string | null
}

function topFrequency(lists: string[][]): string | null {
  const counts = new Map<string, number>()
  for (const list of lists) for (const t of list) counts.set(t, (counts.get(t) ?? 0) + 1)
  let best: string | null = null
  let bestN = 0
  for (const [t, n] of counts) if (n > bestN) [best, bestN] = [t, n]
  return best
}

export function summarizeProgress(
  progress: ModuleProgressRow[],
  insights: InsightSummaryRow[],
): LearningSummary {
  const completed = progress.filter((p) => p.status === 'completed').length
  const inProgress = progress.filter((p) => p.status === 'in_progress').length
  const totalTimeSeconds = progress.reduce((s, p) => s + p.total_time_spent_seconds, 0)
  return {
    totalModules: progress.length,
    completed,
    inProgress,
    completionPct: progress.length ? Math.round((completed / progress.length) * 100) : 0,
    totalTimeSeconds,
    strongestTopic: topFrequency(insights.map((i) => i.strong_topics)),
    weakestTopic: topFrequency(insights.map((i) => i.weak_topics)),
  }
}
