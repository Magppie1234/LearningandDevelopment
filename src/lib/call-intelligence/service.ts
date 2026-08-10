/**
 * Sunroof Call Intelligence — data-service layer (§16).
 *
 * The UI talks ONLY to this module. It never imports the mock dataset directly.
 * Swapping to live systems = implementing the six adapter interfaces below and
 * changing `activeSource` — no page component changes.
 *
 * Every method is async and paginated so the same call signatures work against
 * a real server-side query layer (§15: server-side filtering and pagination).
 */

import type {
  ActionRecord,
  AlertRecord,
  CallFilters,
  CallRecord,
  Page,
} from './types'
import { applyComparisonFilters, applyFilters, applyFiltersIgnoringConfidence } from './filters'
import { buildActions } from './actions'
import { buildAlerts } from './alerts'
import { maskCall, scopeCalls, type Viewer } from './rbac'

/* ────────────────────────────────────────────────────────────────────────────
 * Adapter contracts — what each upstream system must provide.
 * ────────────────────────────────────────────────────────────────────────── */

export interface TelephonyAdapter {
  /** Call metadata: id, parties, direction, duration, recording pointer. */
  listCalls(from: string, to: string): Promise<CallRecord[]>
  /** Signed URL for playback. Must be short-lived. */
  getRecordingUrl(callId: string): Promise<string | null>
}

export interface TranscriptionAdapter {
  /** Speaker-separated transcript + per-turn confidence for one call. */
  getTranscript(callId: string): Promise<CallRecord['transcript']>
}

export interface CrmAdapter {
  /** Verified outcome for a call. Returns nulls when no CRM record is linked. */
  getOutcome(callId: string): Promise<CallRecord['crm']>
}

export interface TaskAdapter {
  createTask(action: ActionRecord): Promise<{ url: string }>
  updateTask(actionId: string, patch: Partial<ActionRecord>): Promise<void>
}

export interface OrderAdapter {
  getOrderValue(customerId: string): Promise<number | null>
}

export interface ComplaintAdapter {
  getComplaint(callId: string): Promise<{ logged: boolean; severity: 'critical' | 'major' | 'minor' | null }>
}

export interface DataSource {
  id: string
  label: string
  /** false = clearly-labelled demo data (§16). */
  isLive: boolean
  lastRefreshedAt: string
  getAllCalls(): Promise<CallRecord[]>
}

/* ────────────────────────────────────────────────────────────────────────────
 * Mock source — demo data, explicitly labelled.
 * ────────────────────────────────────────────────────────────────────────── */

let mockCache: CallRecord[] | null = null

export const mockSource: DataSource = {
  id: 'mock',
  label: 'Demo corpus (generated, not real customer calls)',
  isLive: false,
  lastRefreshedAt: '2026-08-03T18:30:00.000Z',
  async getAllCalls() {
    if (!mockCache) {
      // Lazy import keeps the demo corpus out of any bundle that never asks
      // for it, and makes the production swap a one-line change.
      const mod = await import('@/data/call-intelligence/mock-dataset')
      mockCache = mod.MOCK_CALLS
    }
    return mockCache
  },
}

/**
 * The live source is intentionally NOT implemented. It throws rather than
 * silently returning demo numbers — a dashboard that quietly shows mock data
 * as if it were production is worse than one that fails loudly (§16).
 */
export const liveSource: DataSource = {
  id: 'live',
  label: 'Live (telephony + STT + CRM) — not yet connected',
  isLive: true,
  lastRefreshedAt: '',
  async getAllCalls(): Promise<CallRecord[]> {
    throw new Error(
      'Live data source is not connected. Implement TelephonyAdapter, TranscriptionAdapter, ' +
        'CrmAdapter, TaskAdapter, OrderAdapter and ComplaintAdapter, then register them here. ' +
        'See docs/call-intelligence/api-and-integrations.md.',
    )
  },
}

export const DATA_SOURCES: DataSource[] = [mockSource, liveSource]

/** Switch to `liveSource` once the adapters are implemented. */
export const activeSource: DataSource = mockSource

/* ────────────────────────────────────────────────────────────────────────────
 * Query facade — what the pages actually call.
 * ────────────────────────────────────────────────────────────────────────── */

export interface Dataset {
  /** Primary-period calls, scoped + masked + confidence-gated. */
  calls: CallRecord[]
  /** Same window & dimensions but WITHOUT the confidence gate (coverage denominators). */
  allCalls: CallRecord[]
  /** Comparison-period equivalents. */
  prevCalls: CallRecord[]
  prevAllCalls: CallRecord[]
  actions: ActionRecord[]
  alerts: AlertRecord[]
  /** Full corpus after scoping — for repeat-contact and customer-history maths. */
  corpus: CallRecord[]
  lastRefreshedAt: string
  sourceLabel: string
  isLive: boolean
}

export async function loadDataset(filters: CallFilters, viewer: Viewer): Promise<Dataset> {
  const raw = await activeSource.getAllCalls()
  const scoped = scopeCalls(raw, viewer).map((c) => maskCall(c, viewer))

  const calls = applyFilters(scoped, filters)
  const allCalls = applyFiltersIgnoringConfidence(scoped, filters)
  const prevCalls = applyComparisonFilters(scoped, filters)
  const prevAllCalls = applyComparisonFilters(scoped, { ...filters, confidenceMode: 'all' })

  const actions = buildActions(calls)
  const alerts = buildAlerts({ calls, prevCalls, actions })

  return {
    calls,
    allCalls,
    prevCalls,
    prevAllCalls,
    actions,
    alerts,
    corpus: scoped,
    lastRefreshedAt: activeSource.lastRefreshedAt,
    sourceLabel: activeSource.label,
    isLive: activeSource.isLive,
  }
}

export async function getCall(callId: string, viewer: Viewer): Promise<CallRecord | null> {
  const raw = await activeSource.getAllCalls()
  const found = raw.find((c) => c.callId === callId)
  if (!found) return null
  const [scopedRow] = scopeCalls([found], viewer)
  return scopedRow ? maskCall(scopedRow, viewer) : null
}

/* ── Sorting & pagination (the shape a server query layer will implement) ─── */

export interface QueryOptions<T> {
  page: number
  pageSize: number
  sortKey?: keyof T | null
  sortDir?: 'asc' | 'desc'
}

export function paginate<T>(rows: T[], opts: QueryOptions<T>): Page<T> {
  const { page, pageSize, sortKey, sortDir = 'desc' } = opts
  let sorted = rows
  if (sortKey) {
    sorted = [...rows].sort((a, b) => {
      const av = a[sortKey] as unknown
      const bv = b[sortKey] as unknown
      if (av === bv) return 0
      if (av === null || av === undefined) return 1
      if (bv === null || bv === undefined) return -1
      const cmp = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }
  const start = (page - 1) * pageSize
  return {
    rows: sorted.slice(start, start + pageSize),
    total: sorted.length,
    page,
    pageSize,
  }
}

/* ── Export (§12) ─────────────────────────────────────────────────────────── */

export function toCsv<T extends Record<string, unknown>>(rows: T[], columns: { key: keyof T; header: string }[]): string {
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const head = columns.map((c) => esc(c.header)).join(',')
  const body = rows.map((r) => columns.map((c) => esc(r[c.key])).join(',')).join('\n')
  return `${head}\n${body}`
}

export function downloadCsv(filename: string, csv: string): void {
  if (typeof window === 'undefined') return
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
