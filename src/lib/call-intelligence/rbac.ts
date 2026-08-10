/**
 * Sunroof Call Intelligence — role-based access, masking and audit (§13).
 *
 * Enforcement note: this module defines the policy and applies it in the client
 * for the demo. In production the SAME policy object must be evaluated
 * server-side before rows leave the API — client-side masking alone is not a
 * security control. See docs/call-intelligence/rbac.md.
 */

import type { CallRecord } from './types'

export type RoleId =
  | 'business_head'
  | 'sales_manager'
  | 'service_manager'
  | 'quality_analyst'
  | 'agent'
  | 'compliance_officer'

export type Permission =
  | 'view_all_regions'
  | 'view_own_team'
  | 'view_own_calls'
  | 'view_revenue'
  | 'view_customer_pii'
  | 'view_recording'
  | 'view_agent_scores_all'
  | 'view_agent_scores_own'
  | 'correct_ai_output'
  | 'approve_actions'
  | 'resolve_alerts'
  | 'export_data'
  | 'edit_configuration'

export interface Role {
  id: RoleId
  label: string
  description: string
  permissions: Permission[]
  /** Pages this role can open. Anything else 404s for them. */
  pages: string[]
}

export const ALL_PAGES = [
  'overview', 'voice', 'faqs', 'regional', 'sales', 'quality',
  'actions', 'explorer', 'alerts', 'data-quality',
] as const

export const ROLES: Role[] = [
  {
    id: 'business_head',
    label: 'Business Head',
    description: 'Company-wide view. Sees revenue, all regions and all agent scores.',
    permissions: ['view_all_regions', 'view_revenue', 'view_recording', 'view_agent_scores_all', 'resolve_alerts', 'export_data'],
    pages: [...ALL_PAGES],
  },
  {
    id: 'sales_manager',
    label: 'Sales Manager',
    description: 'Own team only. Coaches agents, approves actions, sees conversion but not company revenue.',
    permissions: ['view_own_team', 'view_recording', 'view_agent_scores_all', 'correct_ai_output', 'approve_actions', 'resolve_alerts', 'export_data'],
    pages: ['overview', 'voice', 'faqs', 'regional', 'sales', 'quality', 'actions', 'explorer', 'alerts'],
  },
  {
    id: 'service_manager',
    label: 'Customer Service Manager',
    description: 'Service team, complaints and escalations. No sales pipeline or revenue.',
    permissions: ['view_own_team', 'view_recording', 'view_agent_scores_all', 'correct_ai_output', 'approve_actions', 'resolve_alerts'],
    pages: ['overview', 'voice', 'faqs', 'regional', 'quality', 'actions', 'explorer', 'alerts'],
  },
  {
    id: 'quality_analyst',
    label: 'Quality Analyst',
    description: 'Scores and coaching across all teams. Customer PII is masked.',
    permissions: ['view_all_regions', 'view_recording', 'view_agent_scores_all', 'correct_ai_output', 'export_data'],
    pages: ['overview', 'voice', 'faqs', 'quality', 'explorer', 'data-quality'],
  },
  {
    id: 'compliance_officer',
    label: 'Compliance Officer',
    description: 'Compliance flags, alerts and the audit log. Full transcript access, no commercial data.',
    permissions: ['view_all_regions', 'view_recording', 'view_customer_pii', 'resolve_alerts', 'edit_configuration'],
    pages: ['overview', 'alerts', 'explorer', 'data-quality'],
  },
  {
    id: 'agent',
    label: 'Employee (Agent)',
    description: 'Own calls and own scores only. Cannot see other agents or company aggregates.',
    permissions: ['view_own_calls', 'view_agent_scores_own'],
    pages: ['voice', 'faqs', 'quality', 'actions', 'explorer'],
  },
]

export const ROLE_BY_ID: Record<RoleId, Role> = Object.fromEntries(ROLES.map((r) => [r.id, r])) as Record<RoleId, Role>

export interface Viewer {
  roleId: RoleId
  /** Used to scope 'view_own_team' / 'view_own_calls'. */
  employeeId: string | null
  teamId: string | null
  name: string
}

export function can(viewer: Viewer, permission: Permission): boolean {
  return ROLE_BY_ID[viewer.roleId].permissions.includes(permission)
}

export function canOpen(viewer: Viewer, page: string): boolean {
  return ROLE_BY_ID[viewer.roleId].pages.includes(page)
}

/** Row-level scoping — applied BEFORE any aggregation, never after (§13). */
export function scopeCalls(calls: CallRecord[], viewer: Viewer): CallRecord[] {
  if (can(viewer, 'view_all_regions')) return calls
  if (can(viewer, 'view_own_team')) return calls.filter((c) => c.teamId === viewer.teamId)
  if (can(viewer, 'view_own_calls')) return calls.filter((c) => c.employeeId === viewer.employeeId)
  return []
}

/**
 * PII masking. Applied to the record itself so a masked value can never leak
 * through a chart tooltip or an export (§13).
 */
export function maskCall(call: CallRecord, viewer: Viewer): CallRecord {
  if (can(viewer, 'view_customer_pii')) return call
  return {
    ...call,
    customerName: maskName(call.customerName),
    customerPhoneMasked: '+91 ●●●●● ●●●●●',
    recordingUrl: can(viewer, 'view_recording') ? call.recordingUrl : null,
    crm: can(viewer, 'view_revenue') ? call.crm : { ...call.crm, orderValueInr: null },
  }
}

export function maskName(name: string): string {
  const parts = name.trim().split(/\s+/)
  return parts
    .map((p, i) => (i === 0 ? p : `${p[0]}${'●'.repeat(Math.max(1, Math.min(6, p.length - 1)))}`))
    .join(' ')
}

/** Digits, card-like and email-like patterns inside transcript text. */
export function maskSensitiveText(text: string): string {
  return text
    .replace(/\b(?:\d[ -]?){12,19}\b/g, '●●●● ●●●● ●●●● ●●●●')
    .replace(/\b\d{6,}\b/g, '●●●●●●')
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '●●●●@●●●●')
}

/* ── Audit log (§13) ──────────────────────────────────────────────────────── */

export interface AuditEntry {
  id: string
  at: string
  actor: string
  role: RoleId
  action:
    | 'view_transcript'
    | 'correct_extraction'
    | 'approve_action'
    | 'reject_action'
    | 'reschedule_action'
    | 'complete_action'
    | 'resolve_alert'
    | 'export'
    | 'change_filters'
  target: string
  detail: string
}

export const AUDITABLE_ACTIONS: AuditEntry['action'][] = [
  'view_transcript', 'correct_extraction', 'approve_action', 'reject_action',
  'reschedule_action', 'complete_action', 'resolve_alert', 'export', 'change_filters',
]

/** Attributes that must never influence any score, ever (§13). */
export const PROHIBITED_SCORING_ATTRIBUTES = [
  'Accent or pronunciation',
  'Gender',
  'Community, religion or caste',
  'Regional or mother-tongue origin',
  'Age',
  'Customer name',
] as const
