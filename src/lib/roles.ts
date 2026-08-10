/**
 * Roles, permissions and the information architecture.
 *
 * Before this file the portal had no role concept at all: `auth.tsx` exposed a
 * single identity and every navigation entry — Manager Hub, Executive
 * Dashboard, HR Control Centre, Content Admin — was linked for everyone. This
 * module is the authorisation model: it decides which sections a person sees,
 * which routes they may open, and what scope of people their dashboards cover.
 *
 * Pure data + pure functions. No React, no `Date.now()` — so a server render
 * and a client render agree.
 */

import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  Award,
  BadgeCheck,
  BarChart3,
  Bot,
  BookOpen,
  Building2,
  ClipboardList,
  Compass,
  FileCog,
  GraduationCap,
  Headphones,
  Home,
  Landmark,
  Library,
  LineChart,
  Map,
  Network,
  Route,
  Settings,
  ShieldCheck,
  Users,
  Workflow,
} from 'lucide-react'
import { WORKFORCE, type WorkforceMember, memberById } from '@/data/workforce'

/* ──────────────────────────────  ROLES  ─────────────────────────────── */

export type Role = 'employee' | 'manager' | 'hod' | 'ld_admin' | 'leadership'

export const ROLES: Role[] = ['employee', 'manager', 'hod', 'ld_admin', 'leadership']

export const ROLE_LABEL: Record<Role, string> = {
  employee: 'Employee',
  manager: 'Manager',
  hod: 'Head of Department',
  ld_admin: 'L&D Administrator',
  leadership: 'Leadership',
}

export const ROLE_DESCRIPTION: Record<Role, string> = {
  employee: 'Your own learning, skills and certifications.',
  manager: 'Your direct reports and their learning line.',
  hod: 'Your whole department, its framework and its risk.',
  ld_admin: 'Courses, assessments, assignments, users and content quality.',
  leadership: 'Company-wide capability risk and the action queue.',
}

/**
 * Everyone sees their own learning. Roles are additive on top of that, which
 * is why a manager still has a My Learning section — managers are learners.
 */
export const ROLE_INHERITS: Record<Role, Role[]> = {
  employee: ['employee'],
  manager: ['employee', 'manager'],
  hod: ['employee', 'manager', 'hod'],
  ld_admin: ['employee', 'ld_admin'],
  leadership: ['employee', 'manager', 'hod', 'leadership'],
}

export function hasRole(actual: Role, required: Role): boolean {
  return ROLE_INHERITS[actual].includes(required)
}

/* ────────────────────────────  PERMISSIONS  ─────────────────────────── */

export type Permission =
  /** See any dashboard covering people other than yourself. */
  | 'view_team'
  /** See a whole department rather than only a reporting line. */
  | 'view_department'
  /** See company-wide roll-ups across every department. */
  | 'view_company'
  /** Assign learning, send reminders, reassign assessments. */
  | 'assign_learning'
  /** Create/edit courses, paths, assessments, question banks. */
  | 'manage_content'
  /** Map users to roles and manage permissions. */
  | 'manage_users'
  /** Set certification rules, validity and governance policy. */
  | 'manage_governance'

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  employee: [],
  manager: ['view_team', 'assign_learning'],
  hod: ['view_team', 'view_department', 'assign_learning'],
  ld_admin: [
    'view_team',
    'view_department',
    'view_company',
    'assign_learning',
    'manage_content',
    'manage_users',
    'manage_governance',
  ],
  leadership: ['view_team', 'view_department', 'view_company'],
}

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}

/* ─────────────────────  INFORMATION ARCHITECTURE  ───────────────────── */

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
  /** Minimum role that may see this entry. */
  requires: Role
  /** One line used by global search and the collapsed-rail tooltip. */
  hint: string
  /** Extra paths that should light this entry as active. */
  matches?: string[]
}

export interface NavGroup {
  /** Null renders the items ungrouped at the top (Home). */
  title: string | null
  items: NavItem[]
}

/**
 * The portal's information architecture. Grouped into five bands so a
 * 22-entry flat list becomes something scannable: what I can look up, what
 * I'm doing, what I'm accountable for, and how the platform is run.
 *
 * Knowledge leads. Reference material (SOPs, process flow, onboarding, the
 * assistant) is what people reach for mid-task and many times a day, whereas
 * an assigned course is a scheduled commitment — so the library sits above
 * the courseware rather than below it.
 */
export const NAV: NavGroup[] = [
  {
    title: null,
    items: [
      {
        label: 'Home',
        path: '/',
        icon: Home,
        requires: 'employee',
        hint: 'Your next action, deadlines and progress',
      },
      // Deliberately top-level rather than inside Knowledge: vision and brand
      // story is meant to be the second thing anyone sees, straight after the
      // dashboard and before any section heading.
      {
        label: 'Vision Corner',
        path: '/vision',
        icon: Landmark,
        requires: 'employee',
        hint: 'Magppie’s brand, product and standards',
      },
    ],
  },
  {
    title: 'Knowledge',
    items: [
      {
        label: 'SOP & Knowledge Library',
        path: '/knowledge',
        icon: Library,
        requires: 'employee',
        hint: 'Standard operating procedures and reference material',
      },
      {
        label: 'Process Flow',
        path: '/journey',
        icon: Workflow,
        requires: 'employee',
        hint: 'Order to handover, end to end',
        matches: ['/process-map'],
      },
      {
        label: 'Onboarding',
        path: '/onboarding',
        icon: Map,
        requires: 'employee',
        hint: 'Your first 90 days and the immersion programme',
      },
      {
        label: 'AI Assistant',
        path: '/ai-assistant',
        icon: Bot,
        requires: 'employee',
        hint: 'Answers from the approved training document',
      },
    ],
  },
  {
    title: 'Learn',
    items: [
      {
        label: 'My Learning',
        path: '/my-learning',
        icon: BookOpen,
        requires: 'employee',
        hint: 'Assigned courses, deadlines and learning history',
      },
      {
        label: 'Learning Paths',
        path: '/academies',
        icon: Route,
        requires: 'employee',
        hint: 'Role-based programmes for your department',
        matches: ['/academy'],
      },
      {
        label: 'Course Catalogue',
        path: '/catalogue',
        icon: GraduationCap,
        requires: 'employee',
        hint: 'Every course available to you, with duration and prerequisites',
      },
      {
        label: 'Assessments',
        path: '/assessments',
        icon: ClipboardList,
        requires: 'employee',
        hint: 'Attempts, scores, pass marks and reassessments',
        matches: ['/academies/monthly-quiz'],
      },
    ],
  },
  {
    title: 'Capability',
    items: [
      {
        label: 'Skills & Competencies',
        path: '/skills-passport',
        icon: BadgeCheck,
        requires: 'employee',
        hint: 'Your validated proficiency and what is holding it back',
      },
      {
        label: 'Certifications',
        path: '/certifications',
        icon: Award,
        requires: 'employee',
        hint: 'Certificates earned, validity and what expires next',
      },
      {
        label: 'Career Path',
        path: '/career',
        icon: Compass,
        requires: 'employee',
        hint: 'The next role and the competencies it needs',
      },
    ],
  },
  {
    title: 'Lead',
    items: [
      {
        label: 'Team Learning',
        path: '/manager',
        icon: Users,
        requires: 'manager',
        hint: 'Completion, overdue learning and skill gaps in your line',
      },
      {
        label: 'Department',
        path: '/department',
        icon: Building2,
        requires: 'hod',
        hint: 'Your department’s readiness, framework and trends',
      },
      {
        label: 'Management Analytics',
        path: '/executive',
        icon: LineChart,
        requires: 'leadership',
        hint: 'Company-wide capability risk and the action queue',
      },
      {
        // One entry, ten in-page tabs. The sidebar already carries 22 items;
        // another ten would break its scannability — see
        // docs/call-intelligence/01-information-architecture.md.
        label: 'Call Intelligence',
        path: '/call-intelligence',
        icon: Headphones,
        // Deliberately open at employee level: Call Intelligence runs its own
        // six-role policy (rbac.ts), under which an agent sees their own calls
        // and own scores and nothing else. Gating the whole section at manager
        // here would contradict that and hide a role the feature is built for.
        requires: 'employee',
        hint: 'What customers asked, felt and were promised on calls',
      },
      {
        label: 'Organisation',
        path: '/organization-flow',
        icon: Network,
        requires: 'manager',
        hint: 'Reporting structure and succession cover',
      },
    ],
  },
  {
    title: 'Administer',
    items: [
      {
        label: 'Content & Courses',
        path: '/admin/content',
        icon: FileCog,
        requires: 'ld_admin',
        hint: 'Author courses, paths, assessments and question banks',
      },
      {
        label: 'Users & Roles',
        path: '/admin/learners',
        icon: Users,
        requires: 'ld_admin',
        hint: 'Learner roster, role mapping and assignment',
      },
      {
        label: 'Learning Operations',
        path: '/learning-ops',
        icon: Activity,
        requires: 'ld_admin',
        hint: 'Assignments, reminders, notifications and content reviews',
        matches: ['/control-centre'],
      },
      {
        label: 'Governance',
        path: '/governance',
        icon: ShieldCheck,
        requires: 'ld_admin',
        hint: 'Certification rules, approvals and approved masters',
        matches: ['/masters'],
      },
      {
        label: 'Reports',
        path: '/analytics',
        icon: BarChart3,
        requires: 'hod',
        hint: 'Detailed, exportable learning and capability reports',
      },
      {
        label: 'Settings',
        path: '/settings',
        icon: Settings,
        requires: 'employee',
        hint: 'Notifications, appearance and your profile',
      },
    ],
  },
]

/** Flat list of every nav entry, for search and route resolution. */
export const NAV_ITEMS: NavItem[] = NAV.flatMap((g) => g.items)

export function navFor(role: Role): NavGroup[] {
  return NAV.map((g) => ({
    ...g,
    items: g.items.filter((i) => hasRole(role, i.requires)),
  })).filter((g) => g.items.length > 0)
}

/** The nav entry a path belongs to — drives active state and breadcrumbs. */
export function navItemForPath(path: string): NavItem | undefined {
  return navMatchForPath(path)?.item
}

/**
 * As `navItemForPath`, but also returns the prefix that actually matched.
 *
 * The two differ whenever an entry is claimed through `matches` rather than
 * its own `path`: /academy/business-development/dashboard resolves to the
 * "Learning Paths" entry, whose `path` is /academies but whose matching prefix
 * is /academy. Callers that trim the prefix to build a breadcrumb need the
 * latter — trimming by `path.length` cuts one character too many and produced
 * trails reading "Usiness development".
 */
export function navMatchForPath(path: string): { item: NavItem; prefix: string } | undefined {
  // Longest prefix wins, so /academy/sales/modules resolves to Learning Paths
  // rather than to Home.
  let best: { item: NavItem; prefix: string } | undefined
  let bestLen = -1
  for (const item of NAV_ITEMS) {
    for (const p of [item.path, ...(item.matches ?? [])]) {
      const hit = p === '/' ? path === '/' : path === p || path.startsWith(`${p}/`)
      if (hit && p.length > bestLen) {
        best = { item, prefix: p }
        bestLen = p.length
      }
    }
  }
  return best
}

/**
 * Route authorisation. Unknown routes are allowed — a page that exists but is
 * not in the nav (a detail view, a legacy alias) must not 403 — but everything
 * reachable from the nav is gated by the role that owns it.
 */
export function canAccessPath(role: Role, path: string): boolean {
  const item = navItemForPath(path)
  if (!item) return true
  return hasRole(role, item.requires)
}

/* ────────────────────────  IDENTITY & SCOPE  ────────────────────────── */

/**
 * The workforce member each demo role signs in as. Real deployments resolve
 * this from the HRMS import via the authenticated user's employee id; the map
 * exists so every role can be reviewed against the same dataset before then.
 */
export const DEMO_IDENTITY: Record<Role, string> = {
  employee: 'wf-bd-03', // Aarav Sharma — BD Executive, mid-onboarding
  manager: 'wf-bd-02', // Farida Qureshi — BD Team Lead, 3 reports
  hod: 'wf-pr-01', // Anil Kapoor — Factory Head, multi-team line
  ld_admin: 'wf-hr-01', // Ritu Malhotra — HR Business Partner
  leadership: 'wf-hr-01', // Executive sponsor view, company-wide scope
}

export function identityFor(role: Role): WorkforceMember | undefined {
  return memberById(DEMO_IDENTITY[role])
}

/**
 * Job level implies a default role, so a real HRMS import lands everyone
 * somewhere sensible without a hand-maintained mapping table.
 */
export function defaultRoleForMember(m: WorkforceMember): Role {
  if (m.level === 3) return 'hod'
  if (m.level === 2) return 'manager'
  return 'employee'
}

/**
 * Which people a role may see. This is the authorisation boundary every
 * dashboard filters through — a manager never falls back to "all employees".
 */
export function visibleWorkforce(role: Role, viewerId: string): WorkforceMember[] {
  if (can(role, 'view_company')) return WORKFORCE
  const viewer = memberById(viewerId)
  if (!viewer) return []
  if (can(role, 'view_department')) {
    return WORKFORCE.filter((m) => m.departmentSlug === viewer.departmentSlug)
  }
  if (can(role, 'view_team')) {
    // Whole reporting line beneath the viewer, not just direct reports.
    const out: WorkforceMember[] = []
    const queue = [viewerId]
    const seen = new Set([viewerId])
    while (queue.length) {
      const cur = queue.shift()!
      for (const m of WORKFORCE) {
        if (m.managerId === cur && !seen.has(m.id)) {
          seen.add(m.id)
          out.push(m)
          queue.push(m.id)
        }
      }
    }
    return out
  }
  return [viewer]
}

/** Human description of the current scope — shown on every scoped dashboard. */
export function scopeLabel(role: Role, viewerId: string): string {
  const n = visibleWorkforce(role, viewerId).length
  if (can(role, 'view_company')) return `All departments — ${n} people`
  const viewer = memberById(viewerId)
  if (can(role, 'view_department')) {
    return `${viewer?.departmentSlug ?? 'Department'} — ${n} people`
  }
  if (can(role, 'view_team')) return `Your reporting line — ${n} ${n === 1 ? 'person' : 'people'}`
  return 'Your own record'
}
