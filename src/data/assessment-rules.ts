/**
 * Assessment & certification operating rules — the assessment engine's
 * ground rules from the L&D OS spec (§11–12). Thresholds are configurable
 * starting recommendations, subject to SME approval — never a hardcoded
 * universal pass percentage.
 */

export const ASSESSMENT_TYPES = [
  'Diagnostic',
  'Formative',
  'Summative',
  'Scenario / case',
  'Role-play',
  'Simulation',
  'System / CRM simulation',
  'Work sample',
  'Practical observation',
  'Call audit',
  'Assignment',
  'Certification',
  'Recertification',
  'Delayed retention check',
  'Workplace behaviour validation',
] as const

export interface ThresholdRecommendation {
  id: string
  scope: string
  threshold: string
  rationale: string
}

/** Configurable starting recommendations — each needs SME approval to go live. */
export const THRESHOLD_RECOMMENDATIONS: ThresholdRecommendation[] = [
  {
    id: 'general-knowledge',
    scope: 'General role-knowledge assessment',
    threshold: '80%',
    rationale: 'Baseline mastery for role knowledge; below this, targeted remediation beats a retake.',
  },
  {
    id: 'compliance',
    scope: 'Compliance / high-risk knowledge',
    threshold: '90%',
    rationale: 'Regulatory and safety-adjacent knowledge tolerates less error.',
  },
  {
    id: 'critical-items',
    scope: 'Critical safety or irreversible-risk items',
    threshold: 'All critical items correct',
    rationale: 'A high average cannot compensate for missing a life-safety or irreversible-loss item.',
  },
  {
    id: 'practical',
    scope: 'Practical assessment',
    threshold: 'Competent on every critical criterion',
    rationale: 'Practical failure can never be compensated for by a high quiz score.',
  },
]

/** Non-negotiable engine rules (§11). */
export const ASSESSMENT_RULES = [
  'Test one clear idea per item, in realistic Magppie scenarios',
  'Randomise from approved pools; shuffle options where appropriate',
  'Never expose the complete question bank after failure',
  'Record all attempts — history is never overwritten or silently edited',
  'Practical failure cannot be compensated for by a high quiz score',
  'Critical safety, quality, finance-control and customer-risk items may require mandatory correct responses',
  'Provide accommodations: captions, screen-reader support, additional time',
  'Proctoring only where justified by risk',
  'Store the pass threshold with its rationale, approving panel, pilot evidence and review date',
] as const

/** What every assessment blueprint must contain (§11). */
export const BLUEPRINT_FIELDS = [
  'Competencies and objectives',
  'Question / evidence count',
  'Weight by competency',
  'Recall / understanding / application / analysis / judgement distribution',
  'Difficulty distribution',
  'Critical questions / criteria',
  'Total and section thresholds',
  'Practical evidence requirement',
  'Assessor requirement',
  'Attempts and cooldown',
  'Remediation',
  'Expiry and recertification rules',
] as const

/** What certification can require, and what the credential stores (§12). */
export const CERTIFICATION_REQUIREMENTS = [
  'Mandatory learning completed',
  'Knowledge assessment passed',
  'Practical assessment passed',
  'Workplace evidence accepted',
  'Manager approval',
  'Required observation period completed',
] as const

export const CERTIFICATION_LEVELS = [
  { level: 'Foundation', meaning: 'Core knowledge for the role verified' },
  { level: 'Role Certified', meaning: 'Knowledge + practical capability validated on the job' },
  { level: 'Advanced', meaning: 'Handles exceptions and improves the process' },
  { level: 'Coach / Assessor', meaning: 'Defines standards and certifies others' },
] as const

/**
 * Product names (Gold, Elite, Signature) are never used as employee
 * certification levels — product tiers describe kitchens, not people.
 */
export const CERTIFICATION_NAMING_RULE =
  'Do not use product series names (Gold, Elite, Signature) as employee certification levels.'
