/**
 * L&D governance without a dedicated L&D Manager — the federated
 * human-governance model from the L&D Operating System spec (§4).
 * Learning responsibility is systemised and distributed across named roles,
 * with a fixed review cadence and mandatory metadata on every published object.
 */

export interface GovernanceRole {
  id: string
  title: string
  scope: 'executive' | 'programme' | 'department' | 'quality' | 'operations'
  responsibilities: string[]
}

export const GOVERNANCE_ROLES: GovernanceRole[] = [
  {
    id: 'executive-sponsor',
    title: 'Executive Sponsor',
    scope: 'executive',
    responsibilities: [
      'Approves capability priorities and mandatory programmes',
      'Reviews enterprise capability risks',
    ],
  },
  {
    id: 'hr-programme-owner',
    title: 'HR Learning Programme Owner',
    scope: 'programme',
    responsibilities: [
      'Owns the portal operating process (part-time to start)',
      'Coordinates calendars, assignments, compliance and reviews',
    ],
  },
  {
    id: 'learning-champion',
    title: 'Department Learning Champion',
    scope: 'department',
    responsibilities: [
      'One primary and one backup per department',
      'Maintains the department role matrix and learning paths',
      'Coordinates content creation with SMEs',
    ],
  },
  {
    id: 'sme',
    title: 'Subject Matter Expert',
    scope: 'quality',
    responsibilities: ['Validates technical accuracy of SOPs, lessons and answers'],
  },
  {
    id: 'independent-reviewer',
    title: 'Independent Reviewer',
    scope: 'quality',
    responsibilities: [
      'Reviews clarity, usability, bias and assessment quality',
      'Must not always be the content creator',
    ],
  },
  {
    id: 'department-head',
    title: 'Department Head',
    scope: 'department',
    responsibilities: ['Approves role competencies, certification rules and department content'],
  },
  {
    id: 'reporting-manager',
    title: 'Reporting Manager',
    scope: 'operations',
    responsibilities: [
      'Coaches employees',
      'Conducts practical observations and 30/60/90-day reviews',
    ],
  },
  {
    id: 'assessor',
    title: 'Assessor',
    scope: 'quality',
    responsibilities: ['Evaluates role-plays, assignments, work samples and practical evidence'],
  },
  {
    id: 'hr-admin',
    title: 'HR Administrator',
    scope: 'programme',
    responsibilities: ['Manages users, assignments, reminders, calendars and reports'],
  },
  {
    id: 'tech-admin',
    title: 'Technology Administrator',
    scope: 'operations',
    responsibilities: ['Manages integrations, access, security, backups and system health'],
  },
  {
    id: 'mis-owner',
    title: 'MIS / Analytics Owner',
    scope: 'operations',
    responsibilities: ['Owns KPI definitions, data mappings and dashboard reconciliation'],
  },
  {
    id: 'learner',
    title: 'Learner',
    scope: 'operations',
    responsibilities: ['Completes learning, practice, evidence submission and feedback'],
  },
]

export interface CadenceItem {
  id: string
  name: string
  frequency: string
  purpose: string
}

export const GOVERNANCE_CADENCE: CadenceItem[] = [
  {
    id: 'learning-council',
    name: 'Learning Council',
    frequency: 'Monthly',
    purpose: 'Cross-department review of assignments, completions, escalations and priorities.',
  },
  {
    id: 'capability-review',
    name: 'Capability & Skill-Gap Review',
    frequency: 'Quarterly',
    purpose: 'Department Heads review role readiness, critical gaps and intervention owners.',
  },
  {
    id: 'change-review',
    name: 'Change-Triggered Review',
    frequency: 'Immediate',
    purpose: 'Runs after any major product, process, policy or system change — identifies affected content, learners and certifications.',
  },
  {
    id: 'role-review',
    name: 'Role & Competency Review',
    frequency: 'Annual',
    purpose: 'Re-validates every role matrix, proficiency target and certification rule.',
  },
  {
    id: 'quality-review',
    name: 'Assessment-Quality & Content-Health Review',
    frequency: 'Monthly',
    purpose: 'Reviews question performance, failure hotspots, stale sources and broken media.',
  },
]

/** Metadata every published object must carry before it can go live. */
export const PUBLISH_METADATA_FIELDS = [
  'Owner',
  'Backup owner',
  'SME reviewer',
  'Approver',
  'Source document',
  'Version',
  'Effective date',
  'Review date',
  'Expiry date (where applicable)',
  'Target audience',
  'Change log',
  'Approval history',
] as const

/** Content lifecycle from the spec (§10). */
export const CONTENT_WORKFLOW = [
  'Need Identified',
  'Draft',
  'SME Review',
  'Independent Quality Review',
  'Assessment Review',
  'Pilot',
  'Department Head Approval',
  'Publish',
  'Monitor',
  'Revise',
  'Retire',
] as const

/** The learning cycle the whole portal is built around (§3). */
export const LEARNING_CYCLE = [
  'Diagnose',
  'Learn',
  'Practise',
  'Prove',
  'Apply',
  'Coach',
  'Certify',
  'Recertify',
] as const
