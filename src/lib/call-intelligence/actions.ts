/**
 * Sunroof Call Intelligence — Next-Action & Commitment tracker (§9).
 *
 * Two separate origins, never merged:
 *   • 'committed'   — someone explicitly promised this on the call.
 *   • 'recommended' — the rules engine proposes it from the conversation.
 *
 * Hard rule: nothing in here executes. Actions that change commercial reality
 * (discount, disqualify, CRM stage change) are created in `pending_approval`
 * and can only move forward through an explicit human decision (§9).
 */

import {
  ACTION_TYPES,
  ACTION_TYPE_BY_ID,
  EMPLOYEE_BY_ID,
  type ActionTypeId,
} from '@/data/call-intelligence/taxonomy'
import { DEMO_NOW } from '@/data/call-intelligence/mock-dataset'
import type { ActionRecord, ActionStatus, CallRecord, SlaStatus } from './types'

/**
 * Action types the AI may never complete on its own (§9).
 *
 * Derived from the taxonomy rather than hand-listed, so adding a
 * `requiresApproval: true` action type cannot silently skip the gate.
 */
export const APPROVAL_REQUIRED_ACTIONS: ActionTypeId[] = ACTION_TYPES.filter(
  (a) => a.requiresApproval,
).map((a) => a.id)

export function slaStatusFor(dueAt: string, status: ActionStatus, now = DEMO_NOW): SlaStatus {
  if (status === 'completed') return 'met'
  if (status === 'rejected') return 'not_applicable'
  const due = new Date(dueAt).getTime()
  const nowMs = new Date(now).getTime()
  const sameDay = dueAt.slice(0, 10) === now.slice(0, 10)
  if (due < nowMs && !sameDay) return 'overdue'
  if (sameDay) return 'due_today'
  return due < nowMs ? 'overdue' : 'on_track'
}

/**
 * Deterministic pseudo-status so the demo shows a realistic mix of completed /
 * in-progress / pending work without a backing task system. Derived from the
 * action id, so it never changes between renders.
 */
function seededStatus(id: string, requiresApproval: boolean): ActionStatus {
  if (requiresApproval) return 'pending_approval'
  let h = 0
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0
  const r = h % 100
  if (r < 34) return 'completed'
  if (r < 52) return 'in_progress'
  if (r < 60) return 'rescheduled'
  return 'approved'
}

export function buildActions(calls: CallRecord[], now = DEMO_NOW): ActionRecord[] {
  const out: ActionRecord[] = []

  for (const call of calls) {
    const employee = EMPLOYEE_BY_ID[call.employeeId]
    const ownerName = employee?.name ?? 'Unassigned'

    /* ── Committed actions (explicitly promised on the call) ────────────── */
    for (const c of call.commitments) {
      const type = ACTION_TYPE_BY_ID[c.actionTypeId]
      const dueAt =
        c.spokenDueAt ??
        new Date(new Date(call.startedAt).getTime() + type.slaHours * 3600_000).toISOString()
      // A customer promise is tracked, but we never own its SLA.
      const status: ActionStatus =
        c.party === 'customer' ? 'in_progress' : seededStatus(c.id, type.requiresApproval)

      out.push({
        id: c.id,
        callId: call.callId,
        customerId: call.customerId,
        customerName: call.customerName,
        origin: 'committed',
        actionTypeId: c.actionTypeId,
        committedBy: c.party,
        ownerEmployeeId: call.employeeId,
        ownerName,
        teamId: call.teamId,
        region: call.region,
        priority:
          c.actionTypeId === 'escalate_complaint'
            ? 'critical'
            : type.slaHours <= 24
              ? 'high'
              : type.slaHours <= 72
                ? 'medium'
                : 'low',
        dueAt,
        channel: type.defaultChannel,
        reason: `Explicitly promised on the call: “${c.text.slice(0, 140)}”`,
        evidence: c.evidence,
        confidence: c.confidence,
        status,
        slaStatus:
          c.party === 'customer' ? 'not_applicable' : slaStatusFor(dueAt, status, now),
        // No task-system integration yet — this stays null until it is wired.
        crmTaskUrl: null,
      })
    }

    /* ── AI-recommended actions ─────────────────────────────────────────── */
    for (const r of call.recommendedActions) {
      const type = ACTION_TYPE_BY_ID[r.actionTypeId]
      const dueAt = new Date(
        new Date(call.startedAt).getTime() + type.slaHours * 3600_000,
      ).toISOString()
      const status = seededStatus(r.id, type.requiresApproval)
      out.push({
        id: r.id,
        callId: call.callId,
        customerId: call.customerId,
        customerName: call.customerName,
        origin: 'recommended',
        actionTypeId: r.actionTypeId,
        committedBy: null,
        ownerEmployeeId: call.employeeId,
        ownerName,
        teamId: call.teamId,
        region: call.region,
        priority: r.priority,
        dueAt,
        channel: type.defaultChannel,
        reason: r.reason,
        evidence: r.evidence,
        confidence: r.confidence,
        status,
        slaStatus: slaStatusFor(dueAt, status, now),
        crmTaskUrl: null,
      })
    }
  }

  return out.sort((a, b) => a.dueAt.localeCompare(b.dueAt))
}

export interface ActionSummary {
  total: number
  committed: number
  recommended: number
  completed: number
  overdue: number
  dueToday: number
  pendingApproval: number
  completionPct: number
  denominator: number
}

export function summariseActions(actions: ActionRecord[]): ActionSummary {
  const closable = actions.filter((a) => a.slaStatus !== 'not_applicable')
  const completed = actions.filter((a) => a.status === 'completed').length
  return {
    total: actions.length,
    committed: actions.filter((a) => a.origin === 'committed').length,
    recommended: actions.filter((a) => a.origin === 'recommended').length,
    completed,
    overdue: actions.filter((a) => a.slaStatus === 'overdue').length,
    dueToday: actions.filter((a) => a.slaStatus === 'due_today').length,
    pendingApproval: actions.filter((a) => a.status === 'pending_approval').length,
    completionPct: closable.length ? Math.round((completed / closable.length) * 1000) / 10 : 0,
    denominator: closable.length,
  }
}

/** Valid status transitions the UI may offer (§9). */
export const ACTION_TRANSITIONS: Record<ActionStatus, ActionStatus[]> = {
  pending_approval: ['approved', 'rejected'],
  approved: ['in_progress', 'rescheduled', 'rejected'],
  in_progress: ['completed', 'rescheduled', 'rejected'],
  rescheduled: ['in_progress', 'completed', 'rejected'],
  completed: [],
  rejected: [],
}

export const ACTION_STATUS_LABEL: Record<ActionStatus, string> = {
  pending_approval: 'Pending approval',
  approved: 'Approved',
  in_progress: 'In progress',
  completed: 'Completed',
  rejected: 'Rejected',
  rescheduled: 'Rescheduled',
}

export const SLA_STATUS_LABEL: Record<SlaStatus, string> = {
  on_track: 'On track',
  due_today: 'Due today',
  overdue: 'Overdue',
  met: 'Met',
  not_applicable: 'Customer-owned',
}
