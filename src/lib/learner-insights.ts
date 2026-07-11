import type { ModuleProgressRow, InsightSummaryRow } from '@/lib/learning-dashboard-api'

/**
 * Insight-first analytics for the learner report. Turns the raw progress +
 * insight rows into decision-support figures: score summary, test analytics,
 * a readiness score, weak-topic revision recommendations, benchmarking against
 * the pass standard, plain-language AI insights, and smart alerts. Every number
 * here is derived from real/demo rows — nothing invented.
 */

const PASS_STANDARD = 80 // % — the module pass mark, used as the benchmark

export interface LearnerInsights {
  attempted: number
  totalAttempts: number
  passed: number
  failed: number
  retaken: number
  avgAttemptsToPass: number | null
  bestScore: number | null
  avgScore: number | null
  lowScore: number | null
  passRate: number // 0..100
  totalTimeSeconds: number
  avgTimeSeconds: number | null
  weakTopics: { topic: string; count: number }[]
  strongTopics: { topic: string; count: number }[]
  trend: 'improving' | 'plateaued' | 'declining' | null
  readiness: number // 0..100
  vsPassStandard: number | null // avgScore - PASS_STANDARD
  passStandard: number
  insights: string[]
  recommendation: string | null
  alerts: { level: 'good' | 'warn' | 'risk'; text: string }[]
}

function freq(lists: string[][]): { topic: string; count: number }[] {
  const m = new Map<string, number>()
  for (const l of lists) for (const t of l) m.set(t, (m.get(t) ?? 0) + 1)
  return [...m.entries()].map(([topic, count]) => ({ topic, count })).sort((a, b) => b.count - a.count)
}

function daysSince(iso: string | null): number | null {
  if (!iso) return null
  const then = new Date(iso).getTime()
  const now = new Date().getTime()
  return Math.floor((now - then) / 86_400_000)
}

export function computeLearnerInsights(
  progress: ModuleProgressRow[],
  insights: InsightSummaryRow[],
): LearnerInsights {
  const attemptedRows = progress.filter((p) => p.attempt_count > 0)
  const attempted = attemptedRows.length
  const totalAttempts = attemptedRows.reduce((s, p) => s + p.attempt_count, 0)
  const passed = progress.filter((p) => p.status === 'completed').length
  const failed = attemptedRows.reduce((s, p) => s + (p.failed_attempts ?? 0), 0)
  const retaken = attemptedRows.filter((p) => p.attempt_count > 1).length

  const scores = attemptedRows.map((p) => p.best_score_pct).filter((v): v is number => v != null)
  const bestScore = scores.length ? Math.max(...scores) : null
  const lowScore = scores.length ? Math.min(...scores) : null
  const avgScore = scores.length ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : null

  const passRate = attempted ? Math.round((passed / attempted) * 100) : 0
  const totalTimeSeconds = progress.reduce((s, p) => s + p.total_time_spent_seconds, 0)
  const avgTimeSeconds = attempted
    ? Math.round(attemptedRows.reduce((s, p) => s + p.total_time_spent_seconds, 0) / attempted)
    : null
  const avgAttemptsToPass = passed ? Math.round((totalAttempts / passed) * 10) / 10 : null

  const weakTopics = freq(insights.map((i) => i.weak_topics))
  const strongTopics = freq(insights.map((i) => i.strong_topics))

  // Dominant trend across modules with a trend.
  const trends = insights.map((i) => i.trend).filter(Boolean) as ('improving' | 'plateaued' | 'declining')[]
  const trendCount = { improving: 0, plateaued: 0, declining: 0 }
  for (const t of trends) trendCount[t]++
  const trend =
    trends.length === 0
      ? null
      : (Object.entries(trendCount).sort((a, b) => b[1] - a[1])[0][0] as LearnerInsights['trend'])

  // Readiness: completion, score, and pass consistency.
  const completionPct = progress.length ? Math.round((passed / progress.length) * 100) : 0
  const readiness = Math.min(
    100,
    Math.round(0.4 * completionPct + 0.4 * (avgScore ?? 0) + 0.2 * passRate),
  )

  const vsPassStandard = avgScore != null ? avgScore - PASS_STANDARD : null

  // Plain-language insights ("so what").
  const insightLines: string[] = []
  if (trend === 'improving') insightLines.push('Your scores are trending up across modules — keep the momentum.')
  if (trend === 'declining') insightLines.push('Your recent scores are slipping — a short revision pass would help.')
  if (avgScore != null && vsPassStandard != null) {
    insightLines.push(
      vsPassStandard >= 0
        ? `Your average of ${avgScore}% is ${vsPassStandard}% above the ${PASS_STANDARD}% pass standard.`
        : `Your average of ${avgScore}% is ${Math.abs(vsPassStandard)}% below the ${PASS_STANDARD}% pass standard.`,
    )
  }
  if (retaken > 0) insightLines.push(`You retook ${retaken} module${retaken === 1 ? '' : 's'} (${failed} failed attempt${failed === 1 ? '' : 's'} total).`)
  if (strongTopics[0]) insightLines.push(`Strongest area: ${strongTopics[0].topic}.`)

  // Recommendation — the single next action.
  const weakest = weakTopics[0]?.topic ?? null
  const recommendation = weakest
    ? `Spend ~2 hours revising ${weakest}, then retake its module quiz.`
    : passed < progress.length
      ? 'Continue your next unstarted module to build coverage.'
      : null

  // Smart alerts.
  const alerts: LearnerInsights['alerts'] = []
  const lastAccessDays = daysSince(
    progress.map((p) => p.last_accessed_at).filter(Boolean).sort().slice(-1)[0] ?? null,
  )
  if (lastAccessDays != null && lastAccessDays >= 15)
    alerts.push({ level: 'risk', text: `No learning activity for ${lastAccessDays} days.` })
  if (trend === 'improving') alerts.push({ level: 'good', text: 'Rapid improvement detected — you’re on an upward trend.' })
  if (trend === 'declining') alerts.push({ level: 'warn', text: 'Consistent decline — coaching or revision recommended.' })
  if (weakest) alerts.push({ level: 'warn', text: `Weak topic needs attention: ${weakest}.` })
  if (readiness >= 80) alerts.push({ level: 'good', text: 'Certification-ready on current performance.' })

  return {
    attempted,
    totalAttempts,
    passed,
    failed,
    retaken,
    avgAttemptsToPass,
    bestScore,
    avgScore,
    lowScore,
    passRate,
    totalTimeSeconds,
    avgTimeSeconds,
    weakTopics,
    strongTopics,
    trend,
    readiness,
    vsPassStandard,
    passStandard: PASS_STANDARD,
    insights: insightLines,
    recommendation,
    alerts,
  }
}
