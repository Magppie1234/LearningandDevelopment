import { COMPETENCIES } from '@/data/competencies'
import type { CompetencyRequirement, CurrentLevel } from '@/lib/skill-gap'

/**
 * Role → required-proficiency map, derived (not invented) from the
 * competency dictionary + the level rules used in learning_paths.csv:
 *   Level 1 role  → all competencies of its own academy @ 3 (Independent)
 *   Level 2 role  → own academy @ 4 (Advanced)
 *   Level 3 role  → own academy @ 4 + leadership academy @ 3
 * DB mirror: role_competency_requirements (migration 0012), seeded by
 * scripts/seed-role-requirements.ts once a live DB exists.
 */
export function requirementsForRole(
  departmentSlug: string,
  level: 1 | 2 | 3,
): CompetencyRequirement[] {
  const own = COMPETENCIES.filter((c) => c.departmentSlug === departmentSlug).map(
    (c) => ({ competencyId: c.id, required: level === 1 ? 3 : 4 }),
  )
  if (level < 3 || departmentSlug === 'leadership') return own
  const leadership = COMPETENCIES.filter((c) => c.departmentSlug === 'leadership').map(
    (c) => ({ competencyId: c.id, required: 3 }),
  )
  return [...own, ...leadership]
}

/**
 * Demo-mode current proficiency levels. Deterministic (stable across
 * SSR/refresh — no randomness) via a small string hash; replaced by
 * user_skills reads in live mode.
 */
function hashLevel(seed: string, min = 1, max = 4): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  return min + (Math.abs(h) % (max - min + 1))
}

export function demoCurrentLevels(
  personKey: string,
  departmentSlug: string,
): CurrentLevel[] {
  return COMPETENCIES.filter(
    (c) => c.departmentSlug === departmentSlug || c.departmentSlug === 'leadership',
  ).map((c) => ({
    competencyId: c.id,
    current: hashLevel(`${personKey}:${c.id}`),
  }))
}

/** The signed-in demo user: Business Development Executive (Level 1). */
export const DEMO_USER_DEPARTMENT = 'business-development'
export const demoUserRequirements = requirementsForRole(DEMO_USER_DEPARTMENT, 1)
export const demoUserCurrentLevels = demoCurrentLevels('aarav-sharma', DEMO_USER_DEPARTMENT)
