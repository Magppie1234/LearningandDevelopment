/**
 * Workforce & department registry — the cohort every capability dashboard
 * filters (L&D OS spec §13: department, role, job level, location, manager,
 * employment type, cohort).
 *
 * DEMO DATA. Every person below is a placeholder so the readiness engine,
 * Skills Passport and Manager Hub can be operated and reviewed before the
 * HRMS import runs. Nothing here is real Magppie employee data — the spec's
 * acceptance criteria forbid presenting demo data as operational data, so
 * `WORKFORCE_IS_DEMO` is exported and every page that reads this file must
 * say so on screen. Live mode replaces this with the HRMS employee import
 * (Keka / Zoho People) via the same shapes.
 *
 * Department slugs match `Competency.departmentSlug` in the Competency
 * Dictionary so requirements resolve without a mapping table.
 */

export type FrameworkStatus = 'built' | 'pending'

export interface Department {
  /** Matches Competency.departmentSlug where a framework exists. */
  slug: string
  /** Spec §2 department name. */
  name: string
  /** Short label for dense tables and chips. */
  shortName: string
  /** Department Head — approves role competencies and certification rules (§4). */
  head: string
  /** Department Learning Champion, primary and backup (§4 requires both). */
  champion: string
  backupChampion: string
  /**
   * 'built'  — competencies exist in the Competency Dictionary.
   * 'pending' — spec §2 names the department but no competency framework has
   *   been authored yet. Surfaced honestly on dashboards as a coverage gap
   *   rather than filled with invented competencies.
   */
  frameworkStatus: FrameworkStatus
}

export const DEPARTMENTS: Department[] = [
  {
    slug: 'business-development',
    name: 'Telecalling / Business Development',
    shortName: 'BD',
    head: 'Head — Business Development',
    champion: 'BD Team Lead',
    backupChampion: 'Senior BD Executive',
    frameworkStatus: 'built',
  },
  {
    slug: 'sales',
    name: 'Sales',
    shortName: 'Sales',
    head: 'Head — Sales',
    champion: 'Sales Manager',
    backupChampion: 'Senior Sales Consultant',
    frameworkStatus: 'built',
  },
  {
    slug: 'pre-design',
    name: 'Pre-Design',
    shortName: 'Pre-Design',
    head: 'Head — Design',
    champion: 'Pre-Design Lead',
    backupChampion: 'Senior Pre-Designer',
    frameworkStatus: 'pending',
  },
  {
    slug: 'post-design',
    name: 'Post-Design',
    shortName: 'Post-Design',
    head: 'Head — Design',
    champion: 'Post-Design Lead',
    backupChampion: 'Senior Post-Designer',
    frameworkStatus: 'built',
  },
  {
    slug: 'installation',
    name: 'Installation Managers',
    shortName: 'Installation',
    head: 'Head — Projects & Installation',
    champion: 'Installation Lead',
    backupChampion: 'Senior Installation Manager',
    frameworkStatus: 'built',
  },
  {
    slug: 'purchase',
    name: 'Purchase',
    shortName: 'Purchase',
    head: 'Head — Purchase',
    champion: 'Purchase Manager',
    backupChampion: 'Senior Purchase Executive',
    frameworkStatus: 'built',
  },
  {
    slug: 'quality-control',
    name: 'Quality Control',
    shortName: 'QC',
    head: 'Head — Quality',
    champion: 'QC Manager',
    backupChampion: 'Senior QC Inspector',
    frameworkStatus: 'built',
  },
  {
    slug: 'factory-production',
    name: 'Production',
    shortName: 'Production',
    head: 'Factory Head',
    champion: 'Production Manager',
    backupChampion: 'Shift Supervisor',
    frameworkStatus: 'built',
  },
  {
    slug: 'planning',
    name: 'Planning',
    shortName: 'Planning',
    head: 'Factory Head',
    champion: 'Planning Manager',
    backupChampion: 'Senior Planner',
    frameworkStatus: 'pending',
  },
  {
    slug: 'dispatch',
    name: 'Dispatch',
    shortName: 'Dispatch',
    head: 'Factory Head',
    champion: 'Dispatch Manager',
    backupChampion: 'Packing Supervisor',
    frameworkStatus: 'pending',
  },
  {
    slug: 'inventory-warehouse',
    name: 'Store / Factory Operations',
    shortName: 'Store',
    head: 'Factory Head',
    champion: 'Store Manager',
    backupChampion: 'Senior Store Keeper',
    frameworkStatus: 'built',
  },
  {
    slug: 'hr-admin',
    name: 'Human Resources',
    shortName: 'HR',
    head: 'Chief Human Resources Officer',
    champion: 'HR Learning Programme Owner',
    backupChampion: 'HR Business Partner',
    frameworkStatus: 'built',
  },
  {
    slug: 'technology',
    name: 'Technology',
    shortName: 'Technology',
    head: 'Chief Technology Officer',
    champion: 'Technology Lead',
    backupChampion: 'Senior Engineer',
    frameworkStatus: 'pending',
  },
  {
    slug: 'accounts-finance',
    name: 'Finance',
    shortName: 'Finance',
    head: 'Chief Financial Officer',
    champion: 'Finance Manager',
    backupChampion: 'Senior Accounts Executive',
    frameworkStatus: 'built',
  },
  {
    slug: 'administration',
    name: 'Administration',
    shortName: 'Admin',
    head: 'Chief Human Resources Officer',
    champion: 'Admin Manager',
    backupChampion: 'Admin Executive',
    frameworkStatus: 'pending',
  },
  {
    slug: 'customer-experience',
    name: 'Customer Experience',
    shortName: 'CX',
    head: 'Chief Operating Officer',
    champion: 'CX Manager',
    backupChampion: 'Senior CX Executive',
    frameworkStatus: 'built',
  },
  {
    slug: 'marketing',
    name: 'Marketing',
    shortName: 'Marketing',
    head: 'Chief Marketing Officer',
    champion: 'Marketing Manager',
    backupChampion: 'Senior Marketing Executive',
    frameworkStatus: 'built',
  },
  {
    slug: 'leadership',
    name: 'Leadership Development',
    shortName: 'Leadership',
    head: 'Executive Sponsor',
    champion: 'HR Learning Programme Owner',
    backupChampion: 'Chief Human Resources Officer',
    frameworkStatus: 'built',
  },
]

export type EmploymentType = 'Permanent' | 'Contract' | 'Apprentice'

/** Demo locations — replaced by the HRMS location master in live mode. */
export const LOCATIONS = [
  'Head Office',
  'Experience Centre',
  'Factory',
  'Client Sites',
] as const

export type Location = (typeof LOCATIONS)[number]

export interface WorkforceMember {
  id: string
  name: string
  departmentSlug: string
  role: string
  /** Job level: 1 Executive, 2 Manager, 3 Head — drives required proficiency. */
  level: 1 | 2 | 3
  /** Reporting manager. Null only for department heads. */
  managerId: string | null
  location: Location
  employmentType: EmploymentType
  /** ISO date. Role start = joining date in demo mode. */
  joinedOn: string
  /** Onboarding cohort, when the person joined as part of one. */
  cohort?: string
}

/**
 * Demo workforce. Deliberately uneven: some people are role-ready, some are
 * blocked on a single critical competency, some are brand new, and a few sit
 * in departments whose competency framework has not been authored yet — that
 * is what the dashboards exist to surface.
 */
export const WORKFORCE: WorkforceMember[] = [
  // ── Telecalling / Business Development ────────────────────────────────
  { id: 'wf-bd-01', name: 'Nikhil Bhandari', departmentSlug: 'business-development', role: 'Head — Business Development', level: 3, managerId: null, location: 'Head Office', employmentType: 'Permanent', joinedOn: '2021-04-12' },
  { id: 'wf-bd-02', name: 'Farida Qureshi', departmentSlug: 'business-development', role: 'BD Team Lead', level: 2, managerId: 'wf-bd-01', location: 'Head Office', employmentType: 'Permanent', joinedOn: '2022-08-01' },
  { id: 'wf-bd-03', name: 'Aarav Sharma', departmentSlug: 'business-development', role: 'BD Executive', level: 1, managerId: 'wf-bd-02', location: 'Head Office', employmentType: 'Permanent', joinedOn: '2026-05-18', cohort: 'May 2026 intake' },
  { id: 'wf-bd-04', name: 'Ishita Bose', departmentSlug: 'business-development', role: 'BD Executive', level: 1, managerId: 'wf-bd-02', location: 'Head Office', employmentType: 'Permanent', joinedOn: '2025-11-03' },
  { id: 'wf-bd-05', name: 'Tarun Pillai', departmentSlug: 'business-development', role: 'BD Executive', level: 1, managerId: 'wf-bd-02', location: 'Head Office', employmentType: 'Contract', joinedOn: '2026-07-06', cohort: 'July 2026 intake' },

  // ── Sales ─────────────────────────────────────────────────────────────
  { id: 'wf-sl-01', name: 'Rohan Kulkarni', departmentSlug: 'sales', role: 'Head — Sales', level: 3, managerId: null, location: 'Experience Centre', employmentType: 'Permanent', joinedOn: '2020-02-17' },
  { id: 'wf-sl-02', name: 'Anjali Menon', departmentSlug: 'sales', role: 'Sales Manager', level: 2, managerId: 'wf-sl-01', location: 'Experience Centre', employmentType: 'Permanent', joinedOn: '2023-01-09' },
  { id: 'wf-sl-03', name: 'Dev Chauhan', departmentSlug: 'sales', role: 'Sales Consultant', level: 1, managerId: 'wf-sl-02', location: 'Experience Centre', employmentType: 'Permanent', joinedOn: '2025-06-23' },
  { id: 'wf-sl-04', name: 'Nandita Rao', departmentSlug: 'sales', role: 'Sales Consultant', level: 1, managerId: 'wf-sl-02', location: 'Experience Centre', employmentType: 'Permanent', joinedOn: '2026-06-15', cohort: 'June 2026 intake' },

  // ── Pre-Design (framework pending) ────────────────────────────────────
  { id: 'wf-pd-01', name: 'Shreya Kamath', departmentSlug: 'pre-design', role: 'Pre-Design Lead', level: 2, managerId: null, location: 'Head Office', employmentType: 'Permanent', joinedOn: '2023-09-11' },
  { id: 'wf-pd-02', name: 'Imran Sheikh', departmentSlug: 'pre-design', role: 'Pre-Designer', level: 1, managerId: 'wf-pd-01', location: 'Head Office', employmentType: 'Permanent', joinedOn: '2026-03-02' },

  // ── Post-Design ───────────────────────────────────────────────────────
  { id: 'wf-po-01', name: 'Kavya Reddy', departmentSlug: 'post-design', role: 'Post-Design Lead', level: 2, managerId: null, location: 'Head Office', employmentType: 'Permanent', joinedOn: '2022-05-30' },
  { id: 'wf-po-02', name: 'Siddharth Jain', departmentSlug: 'post-design', role: 'Post Designer', level: 1, managerId: 'wf-po-01', location: 'Head Office', employmentType: 'Permanent', joinedOn: '2024-10-14' },
  { id: 'wf-po-03', name: 'Ayesha Khan', departmentSlug: 'post-design', role: 'Post Designer', level: 1, managerId: 'wf-po-01', location: 'Head Office', employmentType: 'Permanent', joinedOn: '2026-04-20', cohort: 'April 2026 intake' },

  // ── Installation ──────────────────────────────────────────────────────
  { id: 'wf-in-01', name: 'Manish Yadav', departmentSlug: 'installation', role: 'Head — Projects & Installation', level: 3, managerId: null, location: 'Client Sites', employmentType: 'Permanent', joinedOn: '2019-11-25' },
  { id: 'wf-in-02', name: 'Prakash Naidu', departmentSlug: 'installation', role: 'Installation Manager', level: 2, managerId: 'wf-in-01', location: 'Client Sites', employmentType: 'Permanent', joinedOn: '2023-03-06' },
  { id: 'wf-in-03', name: 'Zoya Ansari', departmentSlug: 'installation', role: 'Installation Manager', level: 2, managerId: 'wf-in-01', location: 'Client Sites', employmentType: 'Permanent', joinedOn: '2026-02-09' },
  { id: 'wf-in-04', name: 'Gurpreet Sandhu', departmentSlug: 'installation', role: 'Installation Supervisor', level: 1, managerId: 'wf-in-02', location: 'Client Sites', employmentType: 'Contract', joinedOn: '2026-06-01', cohort: 'June 2026 intake' },

  // ── Purchase ──────────────────────────────────────────────────────────
  { id: 'wf-pu-01', name: 'Sanjay Trivedi', departmentSlug: 'purchase', role: 'Purchase Manager', level: 2, managerId: null, location: 'Factory', employmentType: 'Permanent', joinedOn: '2021-07-19' },
  { id: 'wf-pu-02', name: 'Reena Dutta', departmentSlug: 'purchase', role: 'Purchase Executive', level: 1, managerId: 'wf-pu-01', location: 'Factory', employmentType: 'Permanent', joinedOn: '2025-01-27' },

  // ── Quality Control ───────────────────────────────────────────────────
  { id: 'wf-qc-01', name: 'Deepa Rao', departmentSlug: 'quality-control', role: 'QC Manager', level: 2, managerId: null, location: 'Factory', employmentType: 'Permanent', joinedOn: '2020-10-05' },
  { id: 'wf-qc-02', name: 'Suresh Iyer', departmentSlug: 'quality-control', role: 'QC Inspector', level: 1, managerId: 'wf-qc-01', location: 'Factory', employmentType: 'Permanent', joinedOn: '2024-02-12' },
  { id: 'wf-qc-03', name: 'Lalita Barman', departmentSlug: 'quality-control', role: 'QC Inspector', level: 1, managerId: 'wf-qc-01', location: 'Factory', employmentType: 'Apprentice', joinedOn: '2026-07-13', cohort: 'July 2026 intake' },

  // ── Production ────────────────────────────────────────────────────────
  { id: 'wf-pr-01', name: 'Anil Kapoor', departmentSlug: 'factory-production', role: 'Factory Head', level: 3, managerId: null, location: 'Factory', employmentType: 'Permanent', joinedOn: '2018-06-04' },
  { id: 'wf-pr-02', name: 'Priya Nair', departmentSlug: 'factory-production', role: 'Production Manager', level: 2, managerId: 'wf-pr-01', location: 'Factory', employmentType: 'Permanent', joinedOn: '2022-11-21' },
  { id: 'wf-pr-03', name: 'Karan Shah', departmentSlug: 'factory-production', role: 'CNC Operator', level: 1, managerId: 'wf-pr-02', location: 'Factory', employmentType: 'Permanent', joinedOn: '2024-08-19' },
  { id: 'wf-pr-04', name: 'Bhaskar Ghosh', departmentSlug: 'factory-production', role: 'Edge-Banding Operator', level: 1, managerId: 'wf-pr-02', location: 'Factory', employmentType: 'Contract', joinedOn: '2026-05-25', cohort: 'May 2026 intake' },

  // ── Planning (framework pending) ──────────────────────────────────────
  { id: 'wf-pl-01', name: 'Harsh Vora', departmentSlug: 'planning', role: 'Planning Manager', level: 2, managerId: 'wf-pr-01', location: 'Factory', employmentType: 'Permanent', joinedOn: '2023-06-12' },

  // ── Dispatch (framework pending) ──────────────────────────────────────
  { id: 'wf-di-01', name: 'Rakesh Solanki', departmentSlug: 'dispatch', role: 'Dispatch Manager', level: 2, managerId: 'wf-pr-01', location: 'Factory', employmentType: 'Permanent', joinedOn: '2022-02-28' },
  { id: 'wf-di-02', name: 'Neha Chandel', departmentSlug: 'dispatch', role: 'Packing Supervisor', level: 1, managerId: 'wf-di-01', location: 'Factory', employmentType: 'Permanent', joinedOn: '2026-01-16' },

  // ── Store / Factory Operations ────────────────────────────────────────
  { id: 'wf-st-01', name: 'Vikram Singh', departmentSlug: 'inventory-warehouse', role: 'Store Manager', level: 2, managerId: 'wf-pr-01', location: 'Factory', employmentType: 'Permanent', joinedOn: '2021-12-08' },
  { id: 'wf-st-02', name: 'Mohit Rawat', departmentSlug: 'inventory-warehouse', role: 'Store Keeper', level: 1, managerId: 'wf-st-01', location: 'Factory', employmentType: 'Permanent', joinedOn: '2025-09-01' },

  // ── Human Resources ───────────────────────────────────────────────────
  { id: 'wf-hr-01', name: 'Ritu Malhotra', departmentSlug: 'hr-admin', role: 'HR Business Partner', level: 2, managerId: null, location: 'Head Office', employmentType: 'Permanent', joinedOn: '2022-03-14' },
  { id: 'wf-hr-02', name: 'Pooja Saxena', departmentSlug: 'hr-admin', role: 'HR Executive', level: 1, managerId: 'wf-hr-01', location: 'Head Office', employmentType: 'Permanent', joinedOn: '2025-07-07' },

  // ── Technology (framework pending) ────────────────────────────────────
  { id: 'wf-te-01', name: 'Arjun Verma', departmentSlug: 'technology', role: 'Technology Lead', level: 2, managerId: null, location: 'Head Office', employmentType: 'Permanent', joinedOn: '2023-04-24' },

  // ── Finance ───────────────────────────────────────────────────────────
  { id: 'wf-fi-01', name: 'Meena Gupta', departmentSlug: 'accounts-finance', role: 'Finance Manager', level: 2, managerId: null, location: 'Head Office', employmentType: 'Permanent', joinedOn: '2021-09-20' },
  { id: 'wf-fi-02', name: 'Amit Desai', departmentSlug: 'accounts-finance', role: 'Accounts Executive', level: 1, managerId: 'wf-fi-01', location: 'Head Office', employmentType: 'Permanent', joinedOn: '2024-05-13' },

  // ── Administration (framework pending) ────────────────────────────────
  { id: 'wf-ad-01', name: 'Salim Baig', departmentSlug: 'administration', role: 'Admin Manager', level: 2, managerId: null, location: 'Head Office', employmentType: 'Permanent', joinedOn: '2020-08-11' },

  // ── Customer Experience ───────────────────────────────────────────────
  { id: 'wf-cx-01', name: 'Trisha Sen', departmentSlug: 'customer-experience', role: 'CX Manager', level: 2, managerId: null, location: 'Head Office', employmentType: 'Permanent', joinedOn: '2023-11-06' },
  { id: 'wf-cx-02', name: 'Yash Bhatt', departmentSlug: 'customer-experience', role: 'CX Executive', level: 1, managerId: 'wf-cx-01', location: 'Head Office', employmentType: 'Permanent', joinedOn: '2026-04-06', cohort: 'April 2026 intake' },

  // ── Marketing ─────────────────────────────────────────────────────────
  { id: 'wf-mk-01', name: 'Sneha Joshi', departmentSlug: 'marketing', role: 'Marketing Manager', level: 2, managerId: null, location: 'Head Office', employmentType: 'Permanent', joinedOn: '2022-07-25' },
  { id: 'wf-mk-02', name: 'Kabir Grewal', departmentSlug: 'marketing', role: 'Marketing Executive', level: 1, managerId: 'wf-mk-01', location: 'Head Office', employmentType: 'Permanent', joinedOn: '2025-03-17' },
]

/** Demo data flag — pages must state this on screen (§24). */
export const WORKFORCE_IS_DEMO = true

/** The signed-in demo identity (Aarav Sharma — see src/lib/auth.tsx). */
export const DEMO_USER_ID = 'wf-bd-03'

/** The manager whose team the Manager Hub opens on in demo mode. */
export const DEMO_MANAGER_ID = 'wf-bd-02'

const BY_ID = new Map(WORKFORCE.map((m) => [m.id, m]))
const DEPT_BY_SLUG = new Map(DEPARTMENTS.map((d) => [d.slug, d]))

export function memberById(id: string | null | undefined): WorkforceMember | undefined {
  return id ? BY_ID.get(id) : undefined
}

export function departmentBySlug(slug: string): Department | undefined {
  return DEPT_BY_SLUG.get(slug)
}

export function departmentNameOf(member: WorkforceMember): string {
  return DEPT_BY_SLUG.get(member.departmentSlug)?.name ?? member.departmentSlug
}

/** Direct reports only — the Manager Hub's default scope. */
export function directReportsOf(managerId: string): WorkforceMember[] {
  return WORKFORCE.filter((m) => m.managerId === managerId)
}

/**
 * Everyone below a manager in the reporting chain. Managers must only ever
 * see their own line (§19) — this is the authorisation boundary the hub uses,
 * so it never falls back to "all employees".
 */
export function reportingLineOf(managerId: string): WorkforceMember[] {
  const out: WorkforceMember[] = []
  const queue = [managerId]
  const seen = new Set<string>([managerId])
  while (queue.length > 0) {
    const current = queue.shift()!
    for (const m of WORKFORCE) {
      if (m.managerId === current && !seen.has(m.id)) {
        seen.add(m.id)
        out.push(m)
        queue.push(m.id)
      }
    }
  }
  return out
}

export function membersOfDepartment(slug: string): WorkforceMember[] {
  return WORKFORCE.filter((m) => m.departmentSlug === slug)
}

/** Everyone who manages at least one person — populates the manager picker. */
export function managers(): WorkforceMember[] {
  const managerIds = new Set(WORKFORCE.map((m) => m.managerId).filter(Boolean) as string[])
  return WORKFORCE.filter((m) => managerIds.has(m.id))
}

/** Whole days between two ISO dates (used for tenure and time-to-proficiency). */
export function daysBetween(fromIso: string, toIso: string): number {
  const ms = new Date(toIso).getTime() - new Date(fromIso).getTime()
  return Math.max(0, Math.round(ms / 86_400_000))
}
