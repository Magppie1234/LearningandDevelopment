/**
 * Day 0–90 onboarding journey — app-side mirror of
 * seed_templates/onboarding_tasks.csv (schema: migration 0010).
 * Four phases, each ending in a gated checkpoint; a phase unlocks only when
 * the previous phase's checkpoint is done (public.onboarding_unlocked_phase
 * is the DB-side equivalent). Department tasks shown here are the demo
 * user's (business-development); live mode filters by profile.department_id.
 */

export interface OnboardingTask {
  id: string
  title: string
  kind: 'task' | 'policy_ack' | 'tool_setup' | 'course' | 'assignment'
  dayStart: number
  dayEnd: number
  phase: 1 | 2 | 3 | 4
  isCheckpoint: boolean
  departmentSlug: string | null
}

export const ONBOARDING_PHASES: Record<number, { title: string; window: string }> = {
  1: { title: 'Arrival & Setup', window: 'Day 0–7' },
  2: { title: 'Foundation', window: 'Day 8–30' },
  3: { title: 'Applied Practice', window: 'Day 31–60' },
  4: { title: 'Full Ramp', window: 'Day 61–90' },
}

export const ONBOARDING_TASKS: OnboardingTask[] = [
  { id: 'ob-01', title: 'Welcome to Magppie — watch intro', kind: 'course', dayStart: 0, dayEnd: 1, phase: 1, isCheckpoint: false, departmentSlug: null },
  { id: 'ob-02', title: 'Read & acknowledge Code of Conduct', kind: 'policy_ack', dayStart: 0, dayEnd: 2, phase: 1, isCheckpoint: false, departmentSlug: null },
  { id: 'ob-03', title: 'Read & acknowledge Leave & Attendance Policy', kind: 'policy_ack', dayStart: 0, dayEnd: 2, phase: 1, isCheckpoint: false, departmentSlug: null },
  { id: 'ob-04', title: 'Set up your work email signature', kind: 'tool_setup', dayStart: 0, dayEnd: 3, phase: 1, isCheckpoint: false, departmentSlug: null },
  { id: 'ob-05', title: 'Set up CRM access and profile', kind: 'tool_setup', dayStart: 1, dayEnd: 5, phase: 1, isCheckpoint: false, departmentSlug: 'business-development' },
  { id: 'ob-cp1', title: 'Day 7 checkpoint: manager 1:1 — setup complete & learning path assigned', kind: 'task', dayStart: 7, dayEnd: 7, phase: 1, isCheckpoint: true, departmentSlug: null },
  { id: 'ob-06', title: 'Complete Product Knowledge course', kind: 'course', dayStart: 3, dayEnd: 21, phase: 2, isCheckpoint: false, departmentSlug: 'business-development' },
  { id: 'ob-07', title: 'Complete all mandatory Level 1 courses for your role', kind: 'course', dayStart: 8, dayEnd: 28, phase: 2, isCheckpoint: false, departmentSlug: null },
  { id: 'ob-cp2', title: 'Day 30 checkpoint: pass Level 1 (Foundation) certification quiz', kind: 'task', dayStart: 30, dayEnd: 30, phase: 2, isCheckpoint: true, departmentSlug: null },
  { id: 'ob-08', title: 'Submit first practice calling assignment', kind: 'assignment', dayStart: 31, dayEnd: 45, phase: 3, isCheckpoint: false, departmentSlug: 'business-development' },
  { id: 'ob-09', title: 'Complete recommended courses for your role', kind: 'course', dayStart: 31, dayEnd: 55, phase: 3, isCheckpoint: false, departmentSlug: null },
  { id: 'ob-cp3', title: 'Day 60 checkpoint: first practical assignment approved by manager', kind: 'task', dayStart: 60, dayEnd: 60, phase: 3, isCheckpoint: true, departmentSlug: null },
  { id: 'ob-10', title: 'Shadow a senior colleague and log takeaways', kind: 'task', dayStart: 61, dayEnd: 80, phase: 4, isCheckpoint: false, departmentSlug: null },
  { id: 'ob-cp4', title: 'Day 90 checkpoint: role-readiness review with manager + PRS baseline recorded', kind: 'task', dayStart: 90, dayEnd: 90, phase: 4, isCheckpoint: true, departmentSlug: null },
]
