/**
 * KPI Dictionary — every learning KPI the dashboards show, with its
 * definition, formula, numerator/denominator, owner and source (L&D OS spec
 * §13). Dashboards must render these definitions verbatim so a number can
 * always be traced to how it was calculated.
 *
 * Learning hours and logins are ACTIVITY information, never evidence of
 * capability — they are excluded from this dictionary's capability KPIs.
 */

export interface KpiDefinition {
  id: string
  name: string
  definition: string
  formula: string
  numerator: string
  denominator: string
  owner: string
  source: string
  notes?: string
}

export const KPI_DICTIONARY: KpiDefinition[] = [
  {
    id: 'required-completion-rate',
    name: 'Required Completion Rate',
    definition: 'Share of mandatory assignments that have been completed.',
    formula: 'Required assignments completed ÷ required assignments due',
    numerator: 'Required assignments completed',
    denominator: 'Required assignments due',
    owner: 'HR Learning Programme Owner',
    source: 'Portal enrolments & progress',
  },
  {
    id: 'on-time-completion',
    name: 'On-Time Completion',
    definition: 'Share of mandatory assignments finished by their due date.',
    formula: 'Assignments completed by due date ÷ required assignments due',
    numerator: 'Assignments completed on or before due date',
    denominator: 'Required assignments due',
    owner: 'HR Learning Programme Owner',
    source: 'Portal enrolments & progress',
  },
  {
    id: 'first-attempt-pass-rate',
    name: 'First-Attempt Pass Rate',
    definition: 'How many learners pass an assessment on their first valid attempt.',
    formula: 'Learners passing first valid attempt ÷ learners making a first valid attempt',
    numerator: 'Learners passing the first valid attempt',
    denominator: 'Learners making a first valid attempt',
    owner: 'MIS / Analytics Owner',
    source: 'Assessment attempts (history is never overwritten)',
  },
  {
    id: 'skill-gap',
    name: 'Skill Gap',
    definition: 'Distance between the required and the verified proficiency for a competency.',
    formula: 'max(0, required proficiency − verified proficiency)',
    numerator: 'Required proficiency − verified proficiency (floored at 0)',
    denominator: '—',
    owner: 'Department Head',
    source: 'Competency validations',
    notes: 'Verified proficiency comes from validated assessment, never from averaged self-ratings.',
  },
  {
    id: 'skill-coverage',
    name: 'Skill Coverage',
    definition: 'Share of applicable employees at or above required verified proficiency.',
    formula: 'Employees at/above required verified proficiency ÷ applicable employees',
    numerator: 'Employees at or above required verified proficiency',
    denominator: 'Applicable employees',
    owner: 'Department Head',
    source: 'Competency validations',
  },
  {
    id: 'compliance-coverage',
    name: 'Compliance Coverage',
    definition: 'Share of employees holding every valid mandatory certification for their role.',
    formula: 'Employees with all valid mandatory certifications ÷ applicable employees',
    numerator: 'Employees holding all valid mandatory certifications',
    denominator: 'Applicable employees',
    owner: 'HR Learning Programme Owner',
    source: 'Certification register',
  },
  {
    id: 'time-to-proficiency',
    name: 'Time to Proficiency',
    definition: 'How long it takes a new joiner or role-mover to become role certified.',
    formula: 'Median days from joining/role start to role certification',
    numerator: 'Days from start to role certification (median across cohort)',
    denominator: '—',
    owner: 'HR Learning Programme Owner',
    source: 'HRMS start dates + certification register',
  },
  {
    id: 'workplace-application-rate',
    name: 'Workplace Application Rate',
    definition: 'Whether learning is actually being applied on the job.',
    formula: 'Successful workplace validations ÷ workplace validations due',
    numerator: 'Successful workplace validations',
    denominator: 'Workplace validations due',
    owner: 'Reporting Managers (aggregated by MIS Owner)',
    source: 'Manager observations & practical evidence',
  },
  {
    id: 'content-freshness',
    name: 'Content Freshness',
    definition: 'Share of active content reviewed within its review SLA.',
    formula: 'Active content reviewed within SLA ÷ active content',
    numerator: 'Active content items reviewed within their SLA',
    denominator: 'All active content items',
    owner: 'Department Learning Champions',
    source: 'Content register (review dates)',
  },
  {
    id: 'role-readiness',
    name: 'Role Readiness',
    definition: 'Validated competency coverage for a role, gated on critical competencies.',
    formula: 'Validated coverage, with a mandatory "Not Ready" gate when any critical competency is missing',
    numerator: 'Validated competencies at required level',
    denominator: 'Required competencies for the role',
    owner: 'Department Head',
    source: 'Competency validations',
    notes: 'Any missing critical competency forces "Not Role Ready" regardless of the overall average.',
  },
  {
    id: 'weighted-skill-risk',
    name: 'Weighted Skill Risk',
    definition: 'Prioritises which gaps matter most to the business.',
    formula: 'Skill gap × competency criticality × affected employee count',
    numerator: 'Gap × criticality × headcount affected',
    denominator: '—',
    owner: 'MIS / Analytics Owner',
    source: 'Competency validations + role matrix',
  },
]

/** Filters every dashboard must support (§13). */
export const DASHBOARD_FILTERS = [
  'Company / legal entity',
  'Department',
  'Role',
  'Job level',
  'Location',
  'Office / store / factory',
  'Team',
  'Manager',
  'Employment type',
  'Cohort',
  'Course / path',
  'Competency',
  'Certification',
  'Mandatory / optional',
  'Status',
  'Language',
  'Content version',
  'Date range',
] as const
