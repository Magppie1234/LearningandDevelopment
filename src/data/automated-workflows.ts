/**
 * Automated workflows — the six lifecycle automations from the L&D OS spec
 * (§20). Each is a trigger plus an ordered chain the portal executes,
 * with guard rules that keep humans in control of consequential steps.
 */

export interface AutomatedWorkflow {
  id: string
  name: string
  trigger: string
  steps: string[]
  guards: string[]
}

export const AUTOMATED_WORKFLOWS: AutomatedWorkflow[] = [
  {
    id: 'new-joiner',
    name: 'New Joiner',
    trigger: 'Employee record created in HRMS',
    steps: [
      'Role, location and manager resolved',
      'Common induction assigned',
      'Role path assigned',
      'Diagnostic assessment',
      'Learning',
      'Practice',
      'Final assessment',
      'On-the-job training',
      'Manager observation',
      'Certification',
      '30/60/90-day application review',
    ],
    guards: [
      'Unmapped role or missing manager routes to HR Administrator instead of guessing',
      'Certification requires practical validation, not just the quiz',
    ],
  },
  {
    id: 'role-transfer',
    name: 'Role Transfer / Promotion',
    trigger: 'New role assigned in HRMS',
    steps: [
      'Existing valid evidence compared against the new role matrix',
      'Bridge gaps identified',
      'Bridge path assigned',
      'Critical gaps validated practically',
      'New role-readiness issued',
      'Historical records retained',
    ],
    guards: [
      'Valid prior certifications carry over — only genuine gaps are assigned',
      'History is never deleted on transfer',
    ],
  },
  {
    id: 'sop-change',
    name: 'New / Revised SOP',
    trigger: 'Change request raised on a source document',
    steps: [
      'Draft',
      'SME review',
      'Independent review',
      'Pilot',
      'Approval',
      'Version published',
      'Affected employees identified',
      'Delta learning assigned',
      'Acknowledgement / assessment',
      'Old version archived',
      'Recertification where required',
    ],
    guards: [
      'Affected courses, questions, job aids and certifications identified automatically',
      "Learners' historical version and attempt records are preserved",
    ],
  },
  {
    id: 'failed-assessment',
    name: 'Failed Assessment',
    trigger: 'Assessment attempt below threshold (or critical item missed)',
    steps: [
      'Topic-level competency gap identified',
      'Targeted remediation assigned',
      'Guided practice',
      'Cooldown',
      'Retake',
      'Manager coaching after repeated failure',
      'Assessor escalation where required',
    ],
    guards: [
      'The full question bank is never exposed after failure',
      'Remediation is required before a retake unlocks',
    ],
  },
  {
    id: 'operational-incident',
    name: 'Operational Incident / Quality Issue',
    trigger: 'Incident or root cause received from operations',
    steps: [
      'Determine whether a genuine skill gap contributed',
      'Assign corrective learning only where appropriate',
      'Practical revalidation',
      'Monitor recurrence',
    ],
    guards: [
      'Non-training root causes (process, system, data, tooling, staffing, incentive) are routed to their owners — training is never the automatic answer',
    ],
  },
  {
    id: 'certification-expiry',
    name: 'Certification Expiry',
    trigger: 'Certification approaching its expiry date',
    steps: [
      'Reminder',
      'Refresher assigned',
      'Recertification',
      'Manager escalation',
      'Expired status if incomplete',
      'Operating restriction where approved policy requires a valid certification',
    ],
    guards: [
      'Expiry and revocation update consistently everywhere the credential is shown',
    ],
  },
]

/** Non-training root causes a performance gap may have (§14). */
export const NON_TRAINING_ROOT_CAUSES = [
  'Missing process',
  'Incorrect system',
  'Poor data',
  'Tool or machine problem',
  'Material problem',
  'Staffing / workload',
  'Unclear responsibility',
  'Incentive conflict',
  'Supervision',
  'Communication',
  'Training / skill gap',
] as const
