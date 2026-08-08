/**
 * Sunroof Call Intelligence — global filter model (§12).
 *
 * One filter object drives every page. It is serialised into the URL query so a
 * drill-down is shareable, and it is the same shape the server-side query layer
 * will accept when the API lands (see service.ts).
 */

import type { CallFilters, CallRecord } from './types'
import { DEMO_NOW, DEMO_PERIOD_DAYS } from '@/data/call-intelligence/mock-dataset'
import { customerSentimentScore, isAnalysable, purchaseReadinessScore, readinessBand } from './scoring'

const dayMs = 86400_000

export function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/** Default window: last 28 days, compared with the 28 days before it (§15). */
export function defaultFilters(): CallFilters {
  const now = new Date(DEMO_NOW)
  const to = new Date(now)
  const from = new Date(now.getTime() - (DEMO_PERIOD_DAYS - 1) * dayMs)
  const compareTo = new Date(from.getTime() - dayMs)
  const compareFrom = new Date(compareTo.getTime() - (DEMO_PERIOD_DAYS - 1) * dayMs)
  return {
    from: isoDay(from),
    to: isoDay(to),
    compareFrom: isoDay(compareFrom),
    compareTo: isoDay(compareTo),
    brand: [],
    businessUnit: [],
    productSeriesId: [],
    productId: [],
    direction: [],
    callPurpose: [],
    campaign: [],
    leadSource: [],
    teamId: [],
    managerName: [],
    employeeId: [],
    region: [],
    state: [],
    city: [],
    language: [],
    customerSegment: [],
    crmStage: [],
    callOutcome: [],
    sentiment: [],
    readiness: [],
    faqId: [],
    topic: [],
    objectionId: [],
    minDurationSec: null,
    maxDurationSec: null,
    actionStatus: [],
    slaStatus: [],
    complianceFlag: [],
    confidenceMode: 'analysable_only',
    search: '',
  }
}

/** Keys the filter chip bar treats as multi-select lists. */
export const LIST_FILTER_KEYS = [
  'brand', 'businessUnit', 'productSeriesId', 'productId', 'direction', 'callPurpose',
  'campaign', 'leadSource', 'teamId', 'managerName', 'employeeId', 'region', 'state',
  'city', 'language', 'customerSegment', 'crmStage', 'callOutcome', 'sentiment',
  'readiness', 'faqId', 'topic', 'objectionId', 'actionStatus', 'slaStatus', 'complianceFlag',
] as const satisfies readonly (keyof CallFilters)[]

export function activeFilterCount(f: CallFilters): number {
  let n = 0
  for (const k of LIST_FILTER_KEYS) n += (f[k] as string[]).length
  if (f.minDurationSec != null) n += 1
  if (f.maxDurationSec != null) n += 1
  if (f.search.trim()) n += 1
  if (f.confidenceMode === 'all') n += 1
  return n
}

const inList = (list: string[], value: string | null) =>
  list.length === 0 || (value !== null && list.includes(value))

function withinDay(iso: string, from: string, to: string): boolean {
  const d = iso.slice(0, 10)
  return d >= from && d <= to
}

/** Does this call match everything except the date window? */
function matchesDimensions(c: CallRecord, f: CallFilters): boolean {
  if (!inList(f.brand, c.brand)) return false
  if (!inList(f.businessUnit, c.businessUnit)) return false
  if (!inList(f.productSeriesId, c.productSeriesId)) return false
  if (!inList(f.productId, c.productId)) return false
  if (f.direction.length && !f.direction.includes(c.direction)) return false
  if (!inList(f.callPurpose, c.callPurpose)) return false
  if (!inList(f.campaign, c.campaign)) return false
  if (!inList(f.leadSource, c.leadSource)) return false
  if (!inList(f.teamId, c.teamId)) return false
  if (!inList(f.managerName, c.managerName)) return false
  if (!inList(f.employeeId, c.employeeId)) return false
  if (!inList(f.region, c.region)) return false
  if (!inList(f.state, c.state)) return false
  if (!inList(f.city, c.city)) return false
  if (!inList(f.language, c.language)) return false
  if (!inList(f.customerSegment, c.customerSegment)) return false
  if (!inList(f.crmStage, c.crmStage)) return false
  if (!inList(f.callOutcome, c.callOutcome)) return false

  if (f.sentiment.length && !f.sentiment.includes(customerSentimentScore(c.customerSentiment).band)) return false
  if (f.readiness.length && !f.readiness.includes(readinessBand(purchaseReadinessScore(c.readinessComponents)))) return false

  if (f.faqId.length && !c.faqs.some((q) => f.faqId.includes(q.faqId))) return false
  if (f.objectionId.length && !c.objections.some((o) => f.objectionId.includes(o.objectionId))) return false
  if (f.topic.length && !c.topics.some((t) => f.topic.includes(t))) return false
  if (f.complianceFlag.length && !c.complianceFlags.some((x) => f.complianceFlag.includes(x))) return false

  if (f.minDurationSec != null && c.durationSec < f.minDurationSec) return false
  if (f.maxDurationSec != null && c.durationSec > f.maxDurationSec) return false

  if (f.confidenceMode === 'analysable_only' && !isAnalysable(c)) return false

  const q = f.search.trim().toLowerCase()
  if (q) {
    const hay = [
      c.callId, c.customerName, c.customerId, c.city, c.summary,
      ...c.topics,
      ...c.transcript.map((t) => t.text),
      ...c.transcript.map((t) => t.translation ?? ''),
    ].join(' ').toLowerCase()
    if (!hay.includes(q)) return false
  }
  return true
}

/** Calls in the primary period. */
export function applyFilters(calls: CallRecord[], f: CallFilters): CallRecord[] {
  return calls.filter((c) => withinDay(c.startedAt, f.from, f.to) && matchesDimensions(c, f))
}

/** The same dimension filters over the comparison period (§15). */
export function applyComparisonFilters(calls: CallRecord[], f: CallFilters): CallRecord[] {
  return calls.filter((c) => withinDay(c.startedAt, f.compareFrom, f.compareTo) && matchesDimensions(c, f))
}

/**
 * Everything in the primary window that passes dimension filters BUT ignores the
 * confidence gate — needed by the Data Quality page, which must be able to see
 * exactly what the management aggregates excluded (§13).
 */
export function applyFiltersIgnoringConfidence(calls: CallRecord[], f: CallFilters): CallRecord[] {
  return applyFilters(calls, { ...f, confidenceMode: 'all' })
}

export function periodLabel(f: CallFilters): string {
  return `${f.from} → ${f.to}`
}

export function comparisonLabel(f: CallFilters): string {
  return `${f.compareFrom} → ${f.compareTo}`
}

export function periodDays(f: CallFilters): number {
  return Math.round((new Date(f.to).getTime() - new Date(f.from).getTime()) / dayMs) + 1
}

/** Shift both windows to a new primary length, keeping them adjacent. */
export function setPeriodDays(f: CallFilters, days: number): CallFilters {
  const to = new Date(`${f.to}T00:00:00.000Z`)
  const from = new Date(to.getTime() - (days - 1) * dayMs)
  const compareTo = new Date(from.getTime() - dayMs)
  const compareFrom = new Date(compareTo.getTime() - (days - 1) * dayMs)
  return { ...f, from: isoDay(from), to: isoDay(to), compareFrom: isoDay(compareFrom), compareTo: isoDay(compareTo) }
}

/* ── URL serialisation, so every drill-down is a shareable link ───────────── */

export function filtersToQuery(f: CallFilters): string {
  const d = defaultFilters()
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(f)) {
    // CallFilters has no index signature, so the widening needs `unknown`
    // in between — a direct assertion is rejected as a non-overlapping cast.
    const def = (d as unknown as Record<string, unknown>)[k]
    if (JSON.stringify(v) === JSON.stringify(def)) continue
    if (Array.isArray(v)) params.set(k, v.join('~'))
    else if (v !== null && v !== '') params.set(k, String(v))
  }
  return params.toString()
}

export function queryToFilters(qs: string | URLSearchParams): CallFilters {
  const params = typeof qs === 'string' ? new URLSearchParams(qs) : qs
  const f = defaultFilters()
  for (const [k, raw] of params.entries()) {
    if (!(k in f)) continue
    const key = k as keyof CallFilters
    const current = f[key]
    if (Array.isArray(current)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(f as any)[key] = raw.split('~').filter(Boolean)
    } else if (typeof current === 'number' || current === null) {
      const n = Number(raw)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(f as any)[key] = Number.isFinite(n) ? n : null
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(f as any)[key] = raw
    }
  }
  return f
}
