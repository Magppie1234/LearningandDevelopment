/**
 * Organization Flow — data model + demo seed.
 *
 * The portal currently runs demo-first (mock data, no live Supabase). This file
 * is the runtime seed; the equivalent DB schema + seed ship in
 * supabase/migrations/0006_org_chart.sql. Shapes intentionally mirror the SQL:
 *   org_positions   -> OrgPosition   (self-referencing hierarchy via parentId)
 *   org_assignments -> OrgAssignment  (employeeId -> profiles.id, or customName)
 * The employee roster mirrors the existing `profiles` table (id/name/department/
 * position) so the assign dropdown reads the same shape a real query would.
 */

export type OrgTier = 'board' | 'md_ceo' | 'c_suite' | 'department' | 'position'

export interface OrgPosition {
  id: string
  title: string
  parentId: string | null
  department: string | null
  tier: OrgTier
  sortOrder: number
  /** c_suite accent key into ORG_COLORS */
  color?: OrgColorKey
}

export interface OrgAssignment {
  id: string
  positionId: string
  employeeId: string | null
  customName: string | null
}

/** Mirrors a row from the existing `profiles` roster table. */
export interface RosterEmployee {
  id: string
  name: string
  department: string
  currentPosition: string
}

export type OrgColorKey =
  | 'purple'
  | 'blue'
  | 'green'
  | 'magenta'
  | 'tan'
  | 'orange'

/**
 * One distinct, muted hue per C-Suite function. The app theme is a warm
 * brown/beige premium palette with no purple/magenta tokens, so these six
 * accents are defined here (kept deliberately desaturated to stay on-brand)
 * rather than as arbitrary one-off values scattered in the component.
 */
export const ORG_COLORS: Record<
  OrgColorKey,
  { bar: string; soft: string; text: string }
> = {
  purple: { bar: '#7c6ca8', soft: '#efeaf6', text: '#4a3f6b' },
  blue: { bar: '#5b7fa6', soft: '#e8eef5', text: '#33506e' },
  green: { bar: '#6f8f6a', soft: '#ebf1ea', text: '#415b3d' },
  magenta: { bar: '#a86a86', soft: '#f5e9ef', text: '#6e3f54' },
  tan: { bar: '#b0916a', soft: '#f3ece1', text: '#6b5333' },
  orange: { bar: '#c07f4f', soft: '#f6ebe1', text: '#7a4a24' },
}

/* ─────────────────────────  DEMO ROSTER (≈ profiles)  ───────────────────── */
export const SEED_ROSTER: RosterEmployee[] = [
  { id: 'emp-01', name: 'Anil Kapoor', department: 'Production', currentPosition: 'AGM' },
  { id: 'emp-02', name: 'Priya Nair', department: 'Production', currentPosition: 'Manager' },
  { id: 'emp-03', name: 'Karan Shah', department: 'Production', currentPosition: 'Executive' },
  { id: 'emp-04', name: 'Deepa Rao', department: 'Quality Control', currentPosition: 'Manager' },
  { id: 'emp-05', name: 'Suresh Iyer', department: 'Quality Control', currentPosition: 'Executive' },
  { id: 'emp-06', name: 'Rahul Mehta', department: 'Operations', currentPosition: 'COO' },
  { id: 'emp-07', name: 'Meena Gupta', department: 'Finance', currentPosition: 'Manager' },
  { id: 'emp-08', name: 'Arjun Verma', department: 'Technology', currentPosition: 'Engineer' },
  { id: 'emp-09', name: 'Sneha Joshi', department: 'Marketing', currentPosition: 'Manager' },
  { id: 'emp-10', name: 'Vikram Singh', department: 'Supply Chain', currentPosition: 'Manager' },
  { id: 'emp-11', name: 'Ritu Malhotra', department: 'People & Culture', currentPosition: 'HRBP' },
  { id: 'emp-12', name: 'Amit Desai', department: 'Accounts', currentPosition: 'Executive' },
]

/* ─────────────────────────────  POSITIONS  ──────────────────────────────── */
export const SEED_POSITIONS: OrgPosition[] = [
  // Board of Directors
  { id: 'brd-founder-md', title: 'Founder & Managing Director', parentId: null, department: null, tier: 'board', sortOrder: 0 },
  { id: 'brd-dir-1', title: 'Director', parentId: null, department: null, tier: 'board', sortOrder: 1 },
  { id: 'brd-dir-2', title: 'Director', parentId: null, department: null, tier: 'board', sortOrder: 2 },

  // C-Suite (reports directly to the Board — MD/CEO tier removed 2026-07-02)
  { id: 'cs-founders-office', title: "Founder's Office", parentId: null, department: "Founder's Office", tier: 'c_suite', sortOrder: 0, color: 'purple' },
  { id: 'cs-coo', title: 'Chief Operating Officer', parentId: null, department: 'Operations', tier: 'c_suite', sortOrder: 1, color: 'blue' },
  { id: 'cs-cfo', title: 'Chief Financial Officer', parentId: null, department: 'Finance', tier: 'c_suite', sortOrder: 2, color: 'green' },
  { id: 'cs-chro', title: 'Chief Human Resources Officer', parentId: null, department: 'People & Culture', tier: 'c_suite', sortOrder: 3, color: 'magenta' },
  { id: 'cs-cto', title: 'Chief Technology Officer', parentId: null, department: 'Technology', tier: 'c_suite', sortOrder: 4, color: 'tan' },
  { id: 'cs-cmo', title: 'Chief Marketing Officer', parentId: null, department: 'Marketing', tier: 'c_suite', sortOrder: 5, color: 'orange' },

  // Departments under COO
  { id: 'dep-production', title: 'Production', parentId: 'cs-coo', department: 'Production', tier: 'department', sortOrder: 0 },
  { id: 'dep-qc', title: 'Quality Control', parentId: 'cs-coo', department: 'Quality Control', tier: 'department', sortOrder: 1 },
  { id: 'dep-scm', title: 'Supply Chain', parentId: 'cs-coo', department: 'Supply Chain', tier: 'department', sortOrder: 2 },
  // Departments under CFO
  { id: 'dep-accounts', title: 'Accounts', parentId: 'cs-cfo', department: 'Accounts', tier: 'department', sortOrder: 0 },
  // Departments under CHRO
  { id: 'dep-talent', title: 'Talent & HR Ops', parentId: 'cs-chro', department: 'Talent & HR Ops', tier: 'department', sortOrder: 0 },

  // Positions (role columns) — Production
  { id: 'pos-prod-agm', title: 'AGM', parentId: 'dep-production', department: 'Production', tier: 'position', sortOrder: 0 },
  { id: 'pos-prod-mgr', title: 'Manager', parentId: 'dep-production', department: 'Production', tier: 'position', sortOrder: 1 },
  { id: 'pos-prod-exec-1', title: 'Executive', parentId: 'dep-production', department: 'Production', tier: 'position', sortOrder: 2 },
  { id: 'pos-prod-exec-2', title: 'Executive', parentId: 'dep-production', department: 'Production', tier: 'position', sortOrder: 3 },
  // Positions — Quality Control
  { id: 'pos-qc-mgr', title: 'Manager', parentId: 'dep-qc', department: 'Quality Control', tier: 'position', sortOrder: 0 },
  { id: 'pos-qc-exec', title: 'Executive', parentId: 'dep-qc', department: 'Quality Control', tier: 'position', sortOrder: 1 },
  // Positions — Accounts
  { id: 'pos-acc-mgr', title: 'Manager', parentId: 'dep-accounts', department: 'Accounts', tier: 'position', sortOrder: 0 },
]

/* ────────────────────────────  ASSIGNMENTS  ─────────────────────────────── */
export const SEED_ASSIGNMENTS: OrgAssignment[] = [
  // Board — leadership entered as free-text (not app users)
  { id: 'asg-01', positionId: 'brd-founder-md', employeeId: null, customName: 'Vinod Jain' },
  { id: 'asg-02', positionId: 'brd-dir-1', employeeId: null, customName: 'Megha Jain' },
  { id: 'asg-03', positionId: 'brd-dir-2', employeeId: null, customName: 'Vikas Jain' },
  // Founder's Office — multiple members (chips)
  { id: 'asg-05', positionId: 'cs-founders-office', employeeId: null, customName: 'Nitya' },
  { id: 'asg-06', positionId: 'cs-founders-office', employeeId: null, customName: 'Sadhvi' },
  // C-Suite execs
  { id: 'asg-07', positionId: 'cs-coo', employeeId: 'emp-06', customName: null },
  { id: 'asg-08', positionId: 'cs-cfo', employeeId: null, customName: 'Neha Agarwal' },
  // Production roles
  { id: 'asg-09', positionId: 'pos-prod-agm', employeeId: 'emp-01', customName: null },
  { id: 'asg-10', positionId: 'pos-prod-mgr', employeeId: 'emp-02', customName: null },
  { id: 'asg-11', positionId: 'pos-prod-exec-1', employeeId: 'emp-03', customName: null },
  // pos-prod-exec-2 left empty → dashed "+ Add Person"
  // Quality Control roles
  { id: 'asg-12', positionId: 'pos-qc-mgr', employeeId: 'emp-04', customName: null },
  { id: 'asg-13', positionId: 'pos-qc-exec', employeeId: 'emp-05', customName: null },
  // pos-acc-mgr left empty
]
