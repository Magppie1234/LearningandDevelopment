import { COMPETENCIES } from '@/data/competencies'
import type { SkillGap } from '@/lib/skill-gap'

/**
 * Microlearning nudge layer (§3.2 item 3 — Axonify pattern). One short daily
 * unit targeting the employee's top skill gaps, built ON TOP of existing
 * academy content: each nudge is one core topic of a gapped competency,
 * so nothing is restructured and nothing is invented. Deterministic per
 * (user, date) so SSR/refresh agree. DB log: migration 0014 nudge_log.
 */

export interface DailyNudge {
  competencyId: string
  competencyName: string
  academy: string
  /** The single micro-topic to review today (one item of coreTopics). */
  topic: string
  /** What "done" looks like — the competency's outcome bar. */
  outcome: string
  estimatedMinutes: number
}

function hash(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function todaysNudge(
  gaps: SkillGap[],
  userKey: string,
  date: Date,
): DailyNudge | null {
  if (gaps.length === 0) return null
  const dayKey = date.toISOString().slice(0, 10)
  // Rotate through the top gaps so consecutive days vary but stay targeted.
  const topGaps = gaps.slice(0, Math.min(5, gaps.length))
  const gap = topGaps[hash(`${userKey}:${dayKey}`) % topGaps.length]

  const dict = COMPETENCIES.find((c) => c.id === gap.competencyId)
  if (!dict) return null
  const topics = dict.coreTopics.split(';').map((t) => t.trim()).filter(Boolean)
  const topic = topics[hash(`${userKey}:${dayKey}:topic`) % topics.length]

  return {
    competencyId: dict.id,
    competencyName: dict.name,
    academy: dict.academy,
    topic,
    outcome: dict.outcome,
    estimatedMinutes: 5,
  }
}
