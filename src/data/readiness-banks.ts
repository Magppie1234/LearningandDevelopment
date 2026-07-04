/**
 * Readiness Check question banks — the cross-academy confidence/behaviour
 * self-assessment (NOT the mastery quiz; there are no right/wrong answers).
 *
 * One reusable component consumes these banks by academy slug. Content is
 * verbatim from the build prompt and mirrors the ld.readiness_questions /
 * ld.competency_lesson_map tables (the persistent copy). The app reads this
 * local bank in demo mode, exactly like bd-academy.ts mirrors academy_modules.
 */

export interface ReadinessOption {
  label: string
  isIdeal: boolean
}

export interface ReadinessQuestion {
  id: string
  text: string
  type: 'likert' | 'multiple_choice'
  options?: ReadinessOption[] // multiple_choice only
  competencyTag: string
  /** True when a HIGH score is the concern, not a low one (e.g. timeline integrity). */
  invertScoring?: boolean
}

export interface CompetencyLesson {
  competencyTag: string
  /** module_key to deep-link into, or null when no lesson exists yet. */
  recommendedLesson: string | null
  lessonLabel: string
}

export interface ReadinessBank {
  academySlug: string
  academyName: string
  /** module deep-link base, e.g. /academy/business-development/modules?module= */
  lessonHrefBase: string | null
  questions: ReadinessQuestion[]
  lessonMap: CompetencyLesson[]
}

const BD: ReadinessBank = {
  academySlug: 'business-development',
  academyName: 'Business Development',
  lessonHrefBase: '/academy/business-development/modules?module=',
  questions: [
    {
      id: 'bd-r1',
      text: 'When a customer pushes back on price, how calm do you stay while pivoting to value?',
      type: 'likert',
      competencyTag: 'objection_handling_price',
    },
    {
      id: 'bd-r2',
      text: 'After you reveal the price, what do you usually do?',
      type: 'multiple_choice',
      options: [
        { label: 'Keep talking to fill the silence', isIdeal: false },
        { label: 'Pause and wait for their reaction', isIdeal: true },
        { label: 'Immediately offer a discount', isIdeal: false },
        { label: 'Rush to the next topic', isIdeal: false },
      ],
      competencyTag: 'pacing_discipline',
    },
    {
      id: 'bd-r3',
      text: 'How natural does the WHO / formaldehyde health story feel when you say it, versus sounding scripted?',
      type: 'likert',
      competencyTag: 'script_fluency',
    },
    {
      id: 'bd-r4',
      text: 'How confident are you responding to “I’ve never heard of Magppie”?',
      type: 'likert',
      competencyTag: 'trust_objection',
    },
    {
      id: 'bd-r5',
      text: 'How often do you catch yourself using a flagged word like “discount”, “carcinogen”, or “yearly cleaning” mid-call?',
      type: 'multiple_choice',
      options: [
        { label: 'Never', isIdeal: true },
        { label: 'Rarely', isIdeal: true },
        { label: 'Sometimes', isIdeal: false },
        { label: 'Often', isIdeal: false },
      ],
      competencyTag: 'compliance_language',
    },
  ],
  lessonMap: [
    { competencyTag: 'objection_handling_price', recommendedLesson: 'bd-m6', lessonLabel: 'Module 6 · Objection Handling Playbook' },
    { competencyTag: 'pacing_discipline', recommendedLesson: 'bd-m9', lessonLabel: 'Module 9 · Customer Communication Standards' },
    { competencyTag: 'script_fluency', recommendedLesson: 'bd-m5', lessonLabel: 'Module 5 · The Complete Sales Pitch (verbatim script)' },
    { competencyTag: 'trust_objection', recommendedLesson: 'bd-m1', lessonLabel: 'Module 1 · The Magppie Story (trust timeline)' },
    { competencyTag: 'compliance_language', recommendedLesson: 'bd-m9', lessonLabel: 'Module 9 · Forbidden words & replacements' },
  ],
}

const SALES: ReadinessBank = {
  academySlug: 'sales',
  academyName: 'Sales',
  // Sales academy is still placeholder content, so focus areas honestly say
  // "lesson coming" rather than deep-link to a fake course (no filler).
  lessonHrefBase: null,
  questions: [
    {
      id: 'sa-r1',
      text: 'When a lead goes cold after the first call, what’s your instinct?',
      type: 'multiple_choice',
      options: [
        { label: 'Chase aggressively with daily calls', isIdeal: false },
        { label: 'Wait for them to come back', isIdeal: false },
        { label: 'One thoughtful follow-up, then a structured cadence', isIdeal: true },
        { label: 'Move on entirely', isIdeal: false },
      ],
      competencyTag: 'followup_discipline',
    },
    {
      id: 'sa-r2',
      text: 'How confident are you quoting the exact price range without hesitating or rounding it wrong?',
      type: 'likert',
      competencyTag: 'price_confidence',
    },
    {
      id: 'sa-r3',
      text: 'How often do you find yourself stretching a delivery timeline just to close a deal faster?',
      type: 'likert',
      competencyTag: 'timeline_integrity',
      invertScoring: true,
    },
    {
      id: 'sa-r4',
      text: 'How do you feel when a customer compares you to a cheaper competitor?',
      type: 'likert',
      competencyTag: 'competitive_positioning',
    },
    {
      id: 'sa-r5',
      text: 'How consistently do you log a call’s outcome in CRM the same day?',
      type: 'multiple_choice',
      options: [
        { label: 'Always', isIdeal: true },
        { label: 'Usually', isIdeal: true },
        { label: 'Sometimes', isIdeal: false },
        { label: 'Rarely', isIdeal: false },
      ],
      competencyTag: 'crm_hygiene',
    },
  ],
  lessonMap: [
    { competencyTag: 'followup_discipline', recommendedLesson: null, lessonLabel: 'Follow-up cadence — coming with the Sales academy build' },
    { competencyTag: 'price_confidence', recommendedLesson: null, lessonLabel: 'Price-quoting confidence — coming with the Sales academy build' },
    { competencyTag: 'timeline_integrity', recommendedLesson: null, lessonLabel: 'Timeline integrity — flagged for manager visibility' },
    { competencyTag: 'competitive_positioning', recommendedLesson: null, lessonLabel: 'Competitive positioning — coming with the Sales academy build' },
    { competencyTag: 'crm_hygiene', recommendedLesson: null, lessonLabel: 'CRM hygiene — coming with the Sales academy build' },
  ],
}

export const READINESS_BANKS: Record<string, ReadinessBank> = {
  'business-development': BD,
  sales: SALES,
}

export function readinessBankFor(academySlug: string): ReadinessBank | undefined {
  return READINESS_BANKS[academySlug]
}

/** Friendly labels for the competency tags (used in strength/focus badges). */
export const COMPETENCY_LABELS: Record<string, string> = {
  objection_handling_price: 'Price objections',
  pacing_discipline: 'Pacing discipline',
  script_fluency: 'Script fluency',
  trust_objection: 'Building trust',
  compliance_language: 'Compliant language',
  followup_discipline: 'Follow-up discipline',
  price_confidence: 'Price confidence',
  timeline_integrity: 'Timeline integrity',
  competitive_positioning: 'Competitive positioning',
  crm_hygiene: 'CRM hygiene',
}
