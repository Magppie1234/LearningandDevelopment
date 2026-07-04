import type { Competency } from '@/data/competencies'

/**
 * Skill-gap engine (gap analysis §3.2, item 1).
 * Core number everything else builds on: for each competency a role requires,
 * gap = required proficiency − current proficiency (1–5 scale from
 * proficiency_levels; 0 = not assessed). DB mirror: employee_skill_gaps view
 * in migration 0012 — keep semantics in sync.
 */

export interface CompetencyRequirement {
  /** skills.slug / Competency.id */
  competencyId: string
  /** Required proficiency 1–5 for the role. */
  required: number
}

export interface CurrentLevel {
  competencyId: string
  /** Current proficiency 0–5 (0 = not assessed). */
  current: number
}

export interface SkillGap {
  competencyId: string
  name: string
  type: Competency['type']
  academy: string
  required: number
  current: number
  /** required − current, only > 0 entries are returned. */
  gap: number
  /** gap × type weight — orders the development plan. */
  priority: number
}

/** Behavioral/leadership gaps close slower, so equal-size gaps rank higher. */
const TYPE_PRIORITY_WEIGHT: Record<Competency['type'], number> = {
  technical: 1,
  process: 1,
  behavioral: 1.2,
  leadership: 1.3,
}

export function computeGaps(
  requirements: CompetencyRequirement[],
  currentLevels: CurrentLevel[],
  dictionary: Competency[],
): SkillGap[] {
  const currentById = new Map(currentLevels.map((c) => [c.competencyId, c.current]))
  const dictById = new Map(dictionary.map((d) => [d.id, d]))

  const gaps: SkillGap[] = []
  for (const req of requirements) {
    const dict = dictById.get(req.competencyId)
    if (!dict) continue // requirement references an unknown competency — skip, don't invent
    const current = currentById.get(req.competencyId) ?? 0
    const gap = req.required - current
    if (gap <= 0) continue
    gaps.push({
      competencyId: req.competencyId,
      name: dict.name,
      type: dict.type,
      academy: dict.academy,
      required: req.required,
      current,
      gap,
      priority: gap * TYPE_PRIORITY_WEIGHT[dict.type],
    })
  }
  return gaps.sort((a, b) => b.priority - a.priority)
}

/** % of required proficiency already met — feeds the PRS skills component. */
export function skillAttainmentPct(
  requirements: CompetencyRequirement[],
  currentLevels: CurrentLevel[],
): number {
  if (requirements.length === 0) return 100
  const currentById = new Map(currentLevels.map((c) => [c.competencyId, c.current]))
  let met = 0
  let needed = 0
  for (const req of requirements) {
    needed += req.required
    met += Math.min(currentById.get(req.competencyId) ?? 0, req.required)
  }
  return needed === 0 ? 100 : Math.round((met / needed) * 100)
}
