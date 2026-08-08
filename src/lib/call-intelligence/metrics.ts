/**
 * Sunroof Call Intelligence — metric definitions and aggregation (§2–§8, §15).
 *
 * Rules this module enforces so the UI cannot get them wrong:
 *  • Every percentage carries its numerator AND denominator (§15).
 *  • Every metric carries its formula, source and provenance (§13).
 *  • AI-inferred and CRM-verified numbers never share a denominator.
 *  • A rate over a small sample is returned with its sample size so the UI can
 *    label it "not a trend" (§5).
 */

import {
  ACTION_TYPE_BY_ID,
  COMPLIANCE_BY_ID,
  FAQ_BY_ID,
  MEANINGFUL_OUTCOMES,
  OBJECTION_BY_ID,
  THRESHOLDS,
  sampleConfidence,
  type FaqCategoryId,
  type ObjectionId,
} from '@/data/call-intelligence/taxonomy'
import type { ActionRecord, CallRecord } from './types'
import {
  agentQualityScore,
  customerSentimentScore,
  purchaseReadinessScore,
  readinessBand,
  round1,
  sentimentImproved,
} from './scoring'

/* ── Metric envelope ──────────────────────────────────────────────────────── */

export type MetricUnit = 'count' | 'percent' | 'score' | 'currency' | 'seconds'
export type MetricProvenance = 'ai_inferred' | 'crm_verified' | 'system' | 'mixed'

export interface Metric {
  key: string
  label: string
  value: number
  unit: MetricUnit
  /** Numerator/denominator are mandatory for every percentage (§15). */
  numerator: number | null
  denominator: number | null
  formula: string
  source: string
  owner: string
  provenance: MetricProvenance
  /** Same metric over the comparison window; null when not comparable. */
  prev: number | null
  tone: 'good' | 'warn' | 'bad' | 'neutral'
  /** Higher is better? Drives the direction arrow. */
  higherIsBetter: boolean | null
  note?: string
}

export function formatMetric(m: Metric): string {
  if (m.unit === 'percent') return `${round1(m.value)}%`
  if (m.unit === 'currency') return formatInr(m.value)
  if (m.unit === 'score') return `${round1(m.value)}`
  if (m.unit === 'seconds') return `${Math.round(m.value)}s`
  return m.value.toLocaleString('en-IN')
}

export function formatInr(n: number): string {
  if (n >= 1e7) return `₹${round1(n / 1e7)} Cr`
  if (n >= 1e5) return `₹${round1(n / 1e5)} L`
  if (n >= 1000) return `₹${Math.round(n / 1000)}K`
  return `₹${Math.round(n)}`
}

export function deltaPct(m: Metric): number | null {
  if (m.prev === null || m.prev === 0) return null
  return round1(((m.value - m.prev) / Math.abs(m.prev)) * 100)
}

const pct = (num: number, den: number) => (den === 0 ? 0 : round1((num / den) * 100))
const uniq = <T,>(xs: T[]) => Array.from(new Set(xs))

/* ── Primitive counters ───────────────────────────────────────────────────── */

export interface CallCounts {
  total: number
  transcribed: number
  meaningful: number
  uniqueCustomers: number
  positive: number
  neutral: number
  negative: number
  improved: number
  unresolvedNegative: number
  highIntent: number
  withNextAction: number
  unansweredQuestions: number
  criticalComplaints: number
  complianceCritical: number
  crmLinked: number
  opportunities: number
  orders: number
  revenueInr: number
  avgQuality: number
  avgSentiment: number
  avgReadiness: number
}

export function countCalls(calls: CallRecord[]): CallCounts {
  let transcribed = 0, meaningful = 0, positive = 0, neutral = 0, negative = 0
  let improved = 0, unresolvedNegative = 0, highIntent = 0, withNextAction = 0
  let unansweredQuestions = 0, criticalComplaints = 0, complianceCritical = 0
  let crmLinked = 0, opportunities = 0, orders = 0, revenueInr = 0
  let qualitySum = 0, qualityN = 0, sentimentSum = 0, readinessSum = 0

  for (const c of calls) {
    if (c.transcriptAvailable) transcribed += 1
    if (MEANINGFUL_OUTCOMES.includes(c.callOutcome)) meaningful += 1

    const s = customerSentimentScore(c.customerSentiment)
    if (s.band === 'positive') positive += 1
    else if (s.band === 'neutral') neutral += 1
    else negative += 1
    sentimentSum += s.overall

    if (sentimentImproved(c.customerSentiment)) improved += 1
    if (c.unresolvedNegative) unresolvedNegative += 1

    const r = purchaseReadinessScore(c.readinessComponents)
    readinessSum += r
    if (r >= THRESHOLDS.highIntentScore) highIntent += 1

    if (c.commitments.some((x) => x.party === 'employee')) withNextAction += 1
    unansweredQuestions += c.faqs.filter((f) => f.answerStatus === 'unanswered').length

    if (c.crm.complaintLogged && c.crm.complaintSeverity === 'critical') criticalComplaints += 1
    if (c.complianceFlags.some((f) => COMPLIANCE_BY_ID[f]?.critical)) complianceCritical += 1

    if (c.crm.provenance === 'crm_verified') {
      crmLinked += 1
      if (c.crm.opportunityCreated) opportunities += 1
      if (c.crm.orderPlaced) {
        orders += 1
        revenueInr += c.crm.orderValueInr ?? 0
      }
    }

    // Quality is only meaningful on calls that had a conversation.
    if (c.transcript.length > 2) {
      qualitySum += agentQualityScore(c).score
      qualityN += 1
    }
  }

  return {
    total: calls.length,
    transcribed,
    meaningful,
    uniqueCustomers: uniq(calls.map((c) => c.customerId)).length,
    positive, neutral, negative, improved, unresolvedNegative, highIntent,
    withNextAction, unansweredQuestions, criticalComplaints, complianceCritical,
    crmLinked, opportunities, orders, revenueInr,
    avgQuality: qualityN ? round1(qualitySum / qualityN) : 0,
    avgSentiment: calls.length ? round1(sentimentSum / calls.length) : 0,
    avgReadiness: calls.length ? round1(readinessSum / calls.length) : 0,
  }
}

/* ── Executive KPI set (§2) ───────────────────────────────────────────────── */

export interface KpiInput {
  calls: CallRecord[]
  /** Unfiltered-by-confidence calls in the same window — the coverage denominator. */
  allCalls: CallRecord[]
  prevCalls: CallRecord[]
  prevAllCalls: CallRecord[]
  actions: ActionRecord[]
}

export function executiveKpis(input: KpiInput): Metric[] {
  const c = countCalls(input.calls)
  const p = countCalls(input.prevCalls)
  const totalAll = input.allCalls.length
  const prevTotalAll = input.prevAllCalls.length
  const transcribedAll = input.allCalls.filter((x) => x.transcriptAvailable).length
  const prevTranscribedAll = input.prevAllCalls.filter((x) => x.transcriptAvailable).length

  const dueToday = input.actions.filter((a) => a.slaStatus === 'due_today').length
  const overdue = input.actions.filter((a) => a.slaStatus === 'overdue').length

  const m = (x: Metric): Metric => x

  return [
    m({
      key: 'total_calls', label: 'Total calls', value: totalAll, unit: 'count',
      numerator: null, denominator: null,
      formula: 'Count of call records in the selected period, before any confidence filter.',
      source: 'Telephony (mock adapter)', owner: 'Contact Centre Ops', provenance: 'system',
      prev: prevTotalAll, tone: 'neutral', higherIsBetter: null,
    }),
    m({
      key: 'transcribed', label: 'Successfully transcribed', value: transcribedAll, unit: 'count',
      numerator: transcribedAll, denominator: totalAll,
      formula: 'Calls with a transcript produced ÷ total calls.',
      source: 'Transcription service', owner: 'Contact Centre Ops', provenance: 'system',
      prev: prevTranscribedAll, tone: 'neutral', higherIsBetter: true,
    }),
    m({
      key: 'coverage', label: 'Transcription coverage', value: pct(transcribedAll, totalAll), unit: 'percent',
      numerator: transcribedAll, denominator: totalAll,
      formula: 'Transcribed calls ÷ total calls × 100.',
      source: 'Transcription service', owner: 'Contact Centre Ops', provenance: 'system',
      prev: pct(prevTranscribedAll, prevTotalAll),
      tone: pct(transcribedAll, totalAll) >= 90 ? 'good' : pct(transcribedAll, totalAll) >= 75 ? 'warn' : 'bad',
      higherIsBetter: true,
    }),
    m({
      key: 'unique_customers', label: 'Unique customers', value: c.uniqueCustomers, unit: 'count',
      numerator: null, denominator: null,
      formula: 'Distinct customer/lead IDs across analysable calls.',
      source: 'CRM customer ID on the call record', owner: 'Sales Operations', provenance: 'crm_verified',
      prev: p.uniqueCustomers, tone: 'neutral', higherIsBetter: null,
    }),
    m({
      key: 'meaningful', label: 'Meaningful conversations', value: c.meaningful, unit: 'count',
      numerator: c.meaningful, denominator: c.total,
      formula: 'Calls whose outcome is a real conversation (excludes not-connected, wrong number, dropped) ÷ analysable calls.',
      source: 'Call outcome + transcript', owner: 'Contact Centre Ops', provenance: 'mixed',
      prev: p.meaningful, tone: 'neutral', higherIsBetter: true,
    }),
    m({
      key: 'positive', label: 'Positive sentiment', value: pct(c.positive, c.total), unit: 'percent',
      numerator: c.positive, denominator: c.total,
      formula: 'Calls with customer sentiment score ≥ 60 ÷ analysable calls × 100.',
      source: 'Text sentiment on customer turns only', owner: 'Customer Experience', provenance: 'ai_inferred',
      prev: pct(p.positive, p.total), tone: 'good', higherIsBetter: true,
      note: 'Text-based sentiment. No voice-tone analysis is performed.',
    }),
    m({
      key: 'neutral', label: 'Neutral sentiment', value: pct(c.neutral, c.total), unit: 'percent',
      numerator: c.neutral, denominator: c.total,
      formula: 'Calls with customer sentiment score 40–59 ÷ analysable calls × 100.',
      source: 'Text sentiment on customer turns only', owner: 'Customer Experience', provenance: 'ai_inferred',
      prev: pct(p.neutral, p.total), tone: 'neutral', higherIsBetter: null,
    }),
    m({
      key: 'negative', label: 'Negative sentiment', value: pct(c.negative, c.total), unit: 'percent',
      numerator: c.negative, denominator: c.total,
      formula: 'Calls with customer sentiment score < 40 ÷ analysable calls × 100.',
      source: 'Text sentiment on customer turns only', owner: 'Customer Experience', provenance: 'ai_inferred',
      prev: pct(p.negative, p.total), tone: 'bad', higherIsBetter: false,
    }),
    m({
      key: 'sentiment_improved', label: 'Sentiment improvement rate', value: pct(c.improved, c.total), unit: 'percent',
      numerator: c.improved, denominator: c.total,
      formula: 'Calls where closing sentiment score exceeds opening by ≥ 5 points ÷ analysable calls × 100.',
      source: 'Opening vs closing third of customer turns', owner: 'Customer Experience', provenance: 'ai_inferred',
      prev: pct(p.improved, p.total), tone: 'good', higherIsBetter: true,
    }),
    m({
      key: 'high_intent', label: 'High purchase readiness', value: c.highIntent, unit: 'count',
      numerator: c.highIntent, denominator: c.total,
      formula: `Calls with Purchase Readiness Score ≥ ${THRESHOLDS.highIntentScore} ÷ analysable calls.`,
      source: 'Purchase Readiness Score', owner: 'Sales Head', provenance: 'ai_inferred',
      prev: p.highIntent, tone: 'good', higherIsBetter: true,
      note: 'Readiness, not conversion probability — not yet validated against historical conversions.',
    }),
    m({
      key: 'avg_quality', label: 'Average agent quality', value: c.avgQuality, unit: 'score',
      numerator: null, denominator: c.total,
      formula: 'Weighted mean of the 8 agent-quality parameters, averaged over calls with a real conversation.',
      source: 'Agent Quality Score', owner: 'Quality Team', provenance: 'ai_inferred',
      prev: p.avgQuality, tone: c.avgQuality >= 75 ? 'good' : c.avgQuality >= 65 ? 'warn' : 'bad', higherIsBetter: true,
      note: 'Critical compliance failures are excluded from this average and reported separately.',
    }),
    m({
      key: 'with_next_action', label: 'Calls with a next action', value: pct(c.withNextAction, c.meaningful), unit: 'percent',
      numerator: c.withNextAction, denominator: c.meaningful,
      formula: 'Calls where the employee explicitly committed to a next action ÷ meaningful conversations × 100.',
      source: 'Commitment extraction', owner: 'Sales Head', provenance: 'ai_inferred',
      prev: pct(p.withNextAction, p.meaningful), tone: 'neutral', higherIsBetter: true,
    }),
    m({
      key: 'due_today', label: 'Actions due today', value: dueToday, unit: 'count',
      numerator: dueToday, denominator: input.actions.length,
      formula: 'Open actions whose due date is today.',
      source: 'Action tracker', owner: 'Team Managers', provenance: 'ai_inferred',
      prev: null, tone: dueToday > 0 ? 'warn' : 'good', higherIsBetter: false,
    }),
    m({
      key: 'overdue', label: 'Overdue actions', value: overdue, unit: 'count',
      numerator: overdue, denominator: input.actions.length,
      formula: 'Open actions past their SLA due date.',
      source: 'Action tracker', owner: 'Team Managers', provenance: 'ai_inferred',
      prev: null, tone: overdue > 0 ? 'bad' : 'good', higherIsBetter: false,
    }),
    m({
      key: 'unanswered', label: 'Unanswered questions', value: c.unansweredQuestions, unit: 'count',
      numerator: c.unansweredQuestions, denominator: c.total,
      formula: 'Customer questions with no substantive answer in the transcript. Deduplicated per call.',
      source: 'FAQ extraction', owner: 'Sales Enablement', provenance: 'ai_inferred',
      prev: p.unansweredQuestions, tone: c.unansweredQuestions > 0 ? 'warn' : 'good', higherIsBetter: false,
    }),
    m({
      key: 'critical_complaints', label: 'Critical complaints', value: c.criticalComplaints, unit: 'count',
      numerator: c.criticalComplaints, denominator: c.crmLinked,
      formula: 'Complaints logged in the complaint system with severity = critical, among CRM-linked calls.',
      source: 'Complaint system', owner: 'Service Head', provenance: 'crm_verified',
      prev: p.criticalComplaints, tone: c.criticalComplaints > 0 ? 'bad' : 'good', higherIsBetter: false,
    }),
    m({
      key: 'compliance_alerts', label: 'Critical compliance failures', value: c.complianceCritical, unit: 'count',
      numerator: c.complianceCritical, denominator: c.total,
      formula: 'Calls with ≥ 1 critical compliance flag. Never folded into the quality average.',
      source: 'Compliance detection', owner: 'Compliance Officer', provenance: 'ai_inferred',
      prev: p.complianceCritical, tone: c.complianceCritical > 0 ? 'bad' : 'good', higherIsBetter: false,
      note: 'Every critical flag requires manual review before any action is taken.',
    }),
    m({
      key: 'call_to_opportunity', label: 'Call-to-opportunity', value: pct(c.opportunities, c.crmLinked), unit: 'percent',
      numerator: c.opportunities, denominator: c.crmLinked,
      formula: 'CRM opportunities created ÷ CRM-linked calls × 100. Calls with no CRM record are excluded from both sides.',
      source: 'CRM', owner: 'Sales Operations', provenance: 'crm_verified',
      prev: pct(p.opportunities, p.crmLinked), tone: 'neutral', higherIsBetter: true,
    }),
    m({
      key: 'call_to_order', label: 'Call-to-order', value: pct(c.orders, c.crmLinked), unit: 'percent',
      numerator: c.orders, denominator: c.crmLinked,
      formula: 'CRM orders placed ÷ CRM-linked calls × 100.',
      source: 'CRM / order system', owner: 'Sales Operations', provenance: 'crm_verified',
      prev: pct(p.orders, p.crmLinked), tone: 'neutral', higherIsBetter: true,
    }),
    m({
      key: 'revenue_influenced', label: 'Revenue influenced', value: c.revenueInr, unit: 'currency',
      numerator: c.orders, denominator: c.crmLinked,
      formula: 'Sum of order value on CRM-verified orders linked to a call in this period. Attribution is last-call-touch.',
      source: 'Order system (CRM-verified only)', owner: 'Finance', provenance: 'crm_verified',
      prev: p.revenueInr, tone: 'neutral', higherIsBetter: true,
      note: 'Shown only where a verified CRM order exists. Calls without a CRM link contribute nothing.',
    }),
  ]
}

/* ── Trends (§2) ──────────────────────────────────────────────────────────── */

export interface TrendPoint {
  date: string
  calls: number
  positive: number
  neutral: number
  negative: number
  avgSentiment: number | null
  avgQuality: number | null
}

export function volumeSentimentTrend(calls: CallRecord[], from: string, to: string): TrendPoint[] {
  const byDay = new Map<string, CallRecord[]>()
  const start = new Date(`${from}T00:00:00.000Z`).getTime()
  const end = new Date(`${to}T00:00:00.000Z`).getTime()
  for (let t = start; t <= end; t += 86400_000) byDay.set(new Date(t).toISOString().slice(0, 10), [])
  for (const c of calls) {
    const d = c.startedAt.slice(0, 10)
    if (byDay.has(d)) byDay.get(d)!.push(c)
  }
  return Array.from(byDay.entries()).map(([date, rows]) => {
    const k = countCalls(rows)
    return {
      date,
      calls: rows.length,
      positive: k.positive,
      neutral: k.neutral,
      negative: k.negative,
      avgSentiment: rows.length ? k.avgSentiment : null,
      avgQuality: rows.length ? k.avgQuality : null,
    }
  })
}

/* ── FAQ aggregation (§4) ─────────────────────────────────────────────────── */

export interface FaqRow {
  faqId: FaqCategoryId
  standardQuestion: string
  shortLabel: string
  owner: string
  hasKbArticle: boolean
  /** Calls containing the FAQ. Deduplicated within a call (§4). */
  callCount: number
  uniqueCustomers: number
  pctOfCalls: number
  denominator: number
  prevCallCount: number
  trendPct: number | null
  fullyAnswered: number
  partiallyAnswered: number
  unanswered: number
  unansweredRate: number
  avgResponseTimeSec: number | null
  avgSentimentAfter: number | null
  avgRelevance: number
  avgAccuracy: number | null
  repeatContactRate: number
  escalationCount: number
  /** Conversion among CRM-linked calls containing this FAQ. */
  conversionPct: number | null
  conversionDenominator: number
  complaintPct: number | null
  avgConfidence: number
  topRegions: { region: string; count: number }[]
  topProducts: { productSeriesId: string; count: number }[]
  languages: { language: string; count: number }[]
  sampleQuestion: string
  sampleCallId: string
  sampleEvidenceSec: number
  recommendation: string
}

const FAQ_RECOMMENDATION: Record<string, string> = {
  pricing_discounts: 'Publish an indicative price-band page per series and add a "how we price" script block.',
  payment_finance: 'Create the approved finance/EMI knowledge-base article — this FAQ currently has none.',
  competitor_comparison: 'Author an approved comparison sheet; agents are improvising against competitors.',
  serviceable_locations: 'Publish the serviced-pincode checker on the website and in the agent console.',
  availability: 'Surface live finish lead times to agents so availability answers stop being guesses.',
  warranty_amc: 'Attach the warranty terms PDF to the quotation template so it goes out automatically.',
  product_quality: 'Add the chip/stain/impact explainer with photos to the objection-handling pack.',
  delivery_timeline: 'Standardise the "measurement → handover" timeline slide and script it.',
  series_comparison: 'Add a one-page series comparison to the catalogue send-out.',
  technical_specs: 'Add a technical spec sheet per product to the agent console.',
  customisation: 'Document what is and is not customisable, with price impact.',
  design_drawings_measurement: 'Script the measurement-accuracy explanation; it is asked repeatedly.',
  installation_process: 'Add the installation day-by-day explainer to the pre-booking pack.',
  service_complaint: 'Publish the complaint SLA and escalation path to customers.',
  documents_process: 'Add the booking checklist to the quotation email template.',
  features_benefits: 'Keep the engineered-stone explainer as the standard opening block.',
}

export function faqAggregates(
  calls: CallRecord[],
  prevCalls: CallRecord[],
  allCustomerCallCounts?: Map<string, number>,
): FaqRow[] {
  const denominator = calls.length
  const prevIndex = new Map<FaqCategoryId, number>()
  for (const c of prevCalls) {
    for (const f of dedupeFaqs(c)) prevIndex.set(f.faqId, (prevIndex.get(f.faqId) ?? 0) + 1)
  }

  const groups = new Map<FaqCategoryId, { call: CallRecord; faq: CallRecord['faqs'][number] }[]>()
  for (const c of calls) {
    for (const f of dedupeFaqs(c)) {
      if (!groups.has(f.faqId)) groups.set(f.faqId, [])
      groups.get(f.faqId)!.push({ call: c, faq: f })
    }
  }

  const rows: FaqRow[] = []
  for (const [faqId, hits] of groups.entries()) {
    const def = FAQ_BY_ID[faqId]
    const customers = uniq(hits.map((h) => h.call.customerId))
    const full = hits.filter((h) => h.faq.answerStatus === 'fully_answered').length
    const partial = hits.filter((h) => h.faq.answerStatus === 'partially_answered').length
    const none = hits.filter((h) => h.faq.answerStatus === 'unanswered').length

    const rts = hits.map((h) => h.faq.responseTimeSec).filter((n): n is number => n !== null)
    const sas = hits.map((h) => h.faq.sentimentAfter).filter((n): n is number => n !== null)
    const accs = hits.map((h) => h.faq.answerAccuracy).filter((n): n is number => n !== null)

    const crmLinked = hits.filter((h) => h.call.crm.provenance === 'crm_verified')
    const orders = crmLinked.filter((h) => h.call.crm.orderPlaced).length
    const complaints = crmLinked.filter((h) => h.call.crm.complaintLogged).length

    // Repeat contact = customers who appear on more than one call in the corpus
    // AND asked this FAQ. Uses the full corpus count, not the filtered slice.
    const repeatCustomers = customers.filter((id) => (allCustomerCallCounts?.get(id) ?? 1) > 1).length

    const prev = prevIndex.get(faqId) ?? 0
    const byRegion = tally(hits.map((h) => h.call.region))
    const bySeries = tally(hits.map((h) => h.call.productSeriesId ?? 'unassigned'))
    const byLang = tally(hits.map((h) => h.call.language))
    const sample = hits.find((h) => h.faq.answerStatus === 'unanswered') ?? hits[0]

    rows.push({
      faqId,
      standardQuestion: def.standardQuestion,
      shortLabel: def.shortLabel,
      owner: def.owner,
      hasKbArticle: def.kbArticleId !== null,
      callCount: hits.length,
      uniqueCustomers: customers.length,
      pctOfCalls: pct(hits.length, denominator),
      denominator,
      prevCallCount: prev,
      trendPct: prev === 0 ? null : round1(((hits.length - prev) / prev) * 100),
      fullyAnswered: full,
      partiallyAnswered: partial,
      unanswered: none,
      unansweredRate: pct(none, hits.length),
      avgResponseTimeSec: rts.length ? round1(rts.reduce((a, b) => a + b, 0) / rts.length) : null,
      avgSentimentAfter: sas.length ? round1((sas.reduce((a, b) => a + b, 0) / sas.length) * 100) / 100 : null,
      avgRelevance: round1(hits.reduce((a, h) => a + h.faq.answerRelevance, 0) / hits.length),
      avgAccuracy: accs.length ? round1(accs.reduce((a, b) => a + b, 0) / accs.length) : null,
      repeatContactRate: pct(repeatCustomers, customers.length),
      escalationCount: hits.filter((h) => h.faq.escalationRequired).length,
      conversionPct: crmLinked.length ? pct(orders, crmLinked.length) : null,
      conversionDenominator: crmLinked.length,
      complaintPct: crmLinked.length ? pct(complaints, crmLinked.length) : null,
      avgConfidence: round1((hits.reduce((a, h) => a + h.faq.confidence, 0) / hits.length) * 100) / 100,
      topRegions: byRegion.slice(0, 3).map(([region, count]) => ({ region, count })),
      topProducts: bySeries.slice(0, 3).map(([productSeriesId, count]) => ({ productSeriesId, count })),
      languages: byLang.slice(0, 3).map(([language, count]) => ({ language, count })),
      sampleQuestion: sample.faq.originalQuestion,
      sampleCallId: sample.call.callId,
      sampleEvidenceSec: sample.faq.evidence.timestampSec,
      recommendation: FAQ_RECOMMENDATION[faqId] ?? 'Review with the owning team.',
    })
  }
  return rows.sort((a, b) => b.callCount - a.callCount)
}

/** One FAQ id counts at most once per call (§4). */
export function dedupeFaqs(call: CallRecord) {
  const seen = new Set<string>()
  return call.faqs.filter((f) => (seen.has(f.faqId) ? false : (seen.add(f.faqId), true)))
}

function tally(values: string[]): [string, number][] {
  const m = new Map<string, number>()
  for (const v of values) m.set(v, (m.get(v) ?? 0) + 1)
  return Array.from(m.entries()).sort((a, b) => b[1] - a[1])
}

export function customerCallCounts(calls: CallRecord[]): Map<string, number> {
  const m = new Map<string, number>()
  for (const c of calls) m.set(c.customerId, (m.get(c.customerId) ?? 0) + 1)
  return m
}

/* ── Objection aggregation (§6) ───────────────────────────────────────────── */

export interface ObjectionRow {
  objectionId: ObjectionId
  label: string
  family: string
  callCount: number
  pctOfCalls: number
  denominator: number
  prevCallCount: number
  trendPct: number | null
  avgIntensity: number
  resolved: number
  partiallyResolved: number
  unresolved: number
  resolutionRate: number
  avgCustomerReaction: number
  topTechniques: { technique: string; count: number; resolvedPct: number }[]
  /** CRM-verified order rate among calls with this objection. */
  conversionPct: number | null
  conversionDenominator: number
  /** CRM loss reasons on lost deals that had this objection. NOT AI-inferred (§6). */
  crmLossReasons: { reason: string; count: number }[]
  sampleCallId: string
  sampleQuote: string
  sampleEvidenceSec: number
}

export function objectionAggregates(calls: CallRecord[], prevCalls: CallRecord[]): ObjectionRow[] {
  const denominator = calls.length
  const prevIndex = new Map<ObjectionId, number>()
  for (const c of prevCalls) {
    for (const id of uniq(c.objections.map((o) => o.objectionId))) {
      prevIndex.set(id, (prevIndex.get(id) ?? 0) + 1)
    }
  }

  const groups = new Map<ObjectionId, { call: CallRecord; obj: CallRecord['objections'][number] }[]>()
  for (const c of calls) {
    const seen = new Set<ObjectionId>()
    for (const o of c.objections) {
      if (seen.has(o.objectionId)) continue
      seen.add(o.objectionId)
      if (!groups.has(o.objectionId)) groups.set(o.objectionId, [])
      groups.get(o.objectionId)!.push({ call: c, obj: o })
    }
  }

  const rows: ObjectionRow[] = []
  for (const [objectionId, hits] of groups.entries()) {
    const def = OBJECTION_BY_ID[objectionId]
    const resolved = hits.filter((h) => h.obj.resolution === 'resolved').length
    const partial = hits.filter((h) => h.obj.resolution === 'partially_resolved').length
    const unresolved = hits.filter((h) => h.obj.resolution === 'unresolved').length
    const crmLinked = hits.filter((h) => h.call.crm.provenance === 'crm_verified')
    const orders = crmLinked.filter((h) => h.call.crm.orderPlaced).length
    const prev = prevIndex.get(objectionId) ?? 0

    const techniqueMap = new Map<string, { n: number; resolved: number }>()
    for (const h of hits) {
      const t = techniqueMap.get(h.obj.technique) ?? { n: 0, resolved: 0 }
      t.n += 1
      if (h.obj.resolution === 'resolved') t.resolved += 1
      techniqueMap.set(h.obj.technique, t)
    }

    const lossReasons = tally(
      crmLinked.map((h) => h.call.crm.crmLossReason).filter((r): r is string => r !== null),
    )

    rows.push({
      objectionId,
      label: def.label,
      family: def.family,
      callCount: hits.length,
      pctOfCalls: pct(hits.length, denominator),
      denominator,
      prevCallCount: prev,
      trendPct: prev === 0 ? null : round1(((hits.length - prev) / prev) * 100),
      avgIntensity: round1(hits.reduce((a, h) => a + h.obj.intensity, 0) / hits.length),
      resolved, partiallyResolved: partial, unresolved,
      resolutionRate: pct(resolved, hits.length),
      avgCustomerReaction: round1((hits.reduce((a, h) => a + h.obj.customerReaction, 0) / hits.length) * 100) / 100,
      topTechniques: Array.from(techniqueMap.entries())
        .sort((a, b) => b[1].n - a[1].n)
        .slice(0, 4)
        .map(([technique, v]) => ({ technique, count: v.n, resolvedPct: pct(v.resolved, v.n) })),
      conversionPct: crmLinked.length ? pct(orders, crmLinked.length) : null,
      conversionDenominator: crmLinked.length,
      crmLossReasons: lossReasons.slice(0, 4).map(([reason, count]) => ({ reason, count })),
      sampleCallId: hits[0].call.callId,
      sampleQuote: hits[0].obj.evidence.quote,
      sampleEvidenceSec: hits[0].obj.evidence.timestampSec,
    })
  }
  return rows.sort((a, b) => b.callCount - a.callCount)
}

/* ── Regional aggregation (§5) ────────────────────────────────────────────── */

export interface RegionRow {
  key: string
  region: string
  state: string | null
  city: string | null
  calls: number
  uniqueCustomers: number
  avgSentiment: number
  sentimentImprovedPct: number
  negativePct: number
  highIntent: number
  highIntentPer100: number
  avgReadiness: number
  avgQuality: number
  competitorMentions: number
  competitorPer100: number
  complaints: number
  complaintsPer100: number
  serviceabilityConcerns: number
  unansweredFaqRate: number
  topFaq: { label: string; count: number } | null
  topObjection: { label: string; count: number } | null
  conversionPct: number | null
  conversionDenominator: number
  overdueActions: number
  completedActions: number
  actionCompletionPct: number | null
  sample: ReturnType<typeof sampleConfidence>
  topProducts: { productSeriesId: string; count: number }[]
}

export function regionAggregates(
  calls: CallRecord[],
  actions: ActionRecord[],
  level: 'region' | 'state' | 'city' = 'region',
): RegionRow[] {
  const groups = new Map<string, CallRecord[]>()
  for (const c of calls) {
    const key = level === 'region' ? c.region : level === 'state' ? `${c.region} / ${c.state}` : `${c.state} / ${c.city}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(c)
  }

  const rows: RegionRow[] = []
  for (const [key, rows_] of groups.entries()) {
    const k = countCalls(rows_)
    const faqCounts = tally(rows_.flatMap((c) => dedupeFaqs(c).map((f) => FAQ_BY_ID[f.faqId].shortLabel)))
    const objCounts = tally(rows_.flatMap((c) => uniq(c.objections.map((o) => OBJECTION_BY_ID[o.objectionId].label))))
    const totalFaqs = rows_.reduce((a, c) => a + dedupeFaqs(c).length, 0)
    const unansweredFaqs = rows_.reduce((a, c) => a + dedupeFaqs(c).filter((f) => f.answerStatus === 'unanswered').length, 0)
    const competitorMentions = rows_.reduce((a, c) => a + c.signals.competitorMentions.length, 0)
    const complaints = rows_.filter((c) => c.crm.complaintLogged).length
    const serviceability = rows_.filter((c) => c.objections.some((o) => o.objectionId === 'serviceability')).length
    const regionActions = actions.filter((a) => rows_.some((c) => c.callId === a.callId))
    const completed = regionActions.filter((a) => a.status === 'completed').length
    const overdue = regionActions.filter((a) => a.slaStatus === 'overdue').length
    const sampleRow = rows_[0]

    rows.push({
      key,
      region: sampleRow.region,
      state: level === 'region' ? null : sampleRow.state,
      city: level === 'city' ? sampleRow.city : null,
      calls: rows_.length,
      uniqueCustomers: k.uniqueCustomers,
      avgSentiment: k.avgSentiment,
      sentimentImprovedPct: pct(k.improved, rows_.length),
      negativePct: pct(k.negative, rows_.length),
      highIntent: k.highIntent,
      highIntentPer100: round1((k.highIntent / rows_.length) * 100),
      avgReadiness: k.avgReadiness,
      avgQuality: k.avgQuality,
      competitorMentions,
      competitorPer100: round1((competitorMentions / rows_.length) * 100),
      complaints,
      complaintsPer100: round1((complaints / rows_.length) * 100),
      serviceabilityConcerns: serviceability,
      unansweredFaqRate: pct(unansweredFaqs, totalFaqs),
      topFaq: faqCounts[0] ? { label: faqCounts[0][0], count: faqCounts[0][1] } : null,
      topObjection: objCounts[0] ? { label: objCounts[0][0], count: objCounts[0][1] } : null,
      conversionPct: k.crmLinked ? pct(k.orders, k.crmLinked) : null,
      conversionDenominator: k.crmLinked,
      overdueActions: overdue,
      completedActions: completed,
      actionCompletionPct: regionActions.length ? pct(completed, regionActions.length) : null,
      sample: sampleConfidence(rows_.length),
      topProducts: tally(rows_.map((c) => c.productSeriesId ?? 'unassigned')).slice(0, 3).map(([productSeriesId, count]) => ({ productSeriesId, count })),
    })
  }
  return rows.sort((a, b) => b.calls - a.calls)
}

/* ── Agent aggregation (§8) ───────────────────────────────────────────────── */

export interface AgentRow {
  employeeId: string
  name: string
  teamId: string
  teamName: string
  manager: string
  calls: number
  analysedCalls: number
  avgQuality: number
  bucketScores: Record<string, number>
  strongest: { label: string; value: number } | null
  weakest: { label: string; value: number } | null
  criticalFailures: number
  avgSentiment: number
  sentimentImprovedPct: number
  nextActionPct: number
  avgTalkRatio: number | null
  diarisationReliablePct: number
  avgInterruptions: number | null
  avgLongestSilenceSec: number | null
  conversionPct: number | null
  conversionDenominator: number
  unansweredFaqs: number
  objectionResolutionPct: number | null
  coachingFocus: string | null
  sample: ReturnType<typeof sampleConfidence>
}

export function agentAggregates(
  calls: CallRecord[],
  employees: { id: string; name: string; teamId: string }[],
  teams: { id: string; name: string; manager: string }[],
  actions: ActionRecord[],
): AgentRow[] {
  const byEmployee = new Map<string, CallRecord[]>()
  for (const c of calls) {
    if (!byEmployee.has(c.employeeId)) byEmployee.set(c.employeeId, [])
    byEmployee.get(c.employeeId)!.push(c)
  }

  const rows: AgentRow[] = []
  for (const emp of employees) {
    const rows_ = byEmployee.get(emp.id) ?? []
    if (rows_.length === 0) continue
    const conversational = rows_.filter((c) => c.transcript.length > 2)
    const team = teams.find((t) => t.id === emp.teamId)
    const k = countCalls(rows_)

    const bucketTotals = new Map<string, { sum: number; n: number; label: string }>()
    let criticalFailures = 0
    for (const c of conversational) {
      const q = agentQualityScore(c)
      if (q.hasCriticalFailure) criticalFailures += 1
      for (const b of q.buckets) {
        const t = bucketTotals.get(b.key) ?? { sum: 0, n: 0, label: b.label }
        t.sum += b.value
        t.n += 1
        bucketTotals.set(b.key, t)
      }
    }
    const buckets = Array.from(bucketTotals.entries()).map(([key, v]) => ({
      key, label: v.label, value: round1(v.sum / Math.max(1, v.n)),
    }))
    const sorted = [...buckets].sort((a, b) => b.value - a.value)

    const reliable = conversational.filter((c) => c.dynamics.reliable)
    const crmLinked = rows_.filter((c) => c.crm.provenance === 'crm_verified')
    const orders = crmLinked.filter((c) => c.crm.orderPlaced).length
    const objections = conversational.flatMap((c) => c.objections)
    const resolvedObjections = objections.filter((o) => o.resolution === 'resolved').length

    rows.push({
      employeeId: emp.id,
      name: emp.name,
      teamId: emp.teamId,
      teamName: team?.name ?? '—',
      manager: team?.manager ?? '—',
      calls: rows_.length,
      analysedCalls: conversational.length,
      avgQuality: k.avgQuality,
      bucketScores: Object.fromEntries(buckets.map((b) => [b.key, b.value])),
      strongest: sorted[0] ? { label: sorted[0].label, value: sorted[0].value } : null,
      weakest: sorted.at(-1) ? { label: sorted.at(-1)!.label, value: sorted.at(-1)!.value } : null,
      criticalFailures,
      avgSentiment: k.avgSentiment,
      sentimentImprovedPct: pct(k.improved, rows_.length),
      nextActionPct: pct(k.withNextAction, Math.max(1, k.meaningful)),
      avgTalkRatio: reliable.length ? round1((reliable.reduce((a, c) => a + c.dynamics.talkToListenRatio, 0) / reliable.length) * 100) / 100 : null,
      diarisationReliablePct: pct(reliable.length, Math.max(1, conversational.length)),
      avgInterruptions: reliable.length ? round1(reliable.reduce((a, c) => a + c.dynamics.interruptions, 0) / reliable.length) : null,
      avgLongestSilenceSec: reliable.length ? round1(reliable.reduce((a, c) => a + c.dynamics.longestSilenceSec, 0) / reliable.length) : null,
      conversionPct: crmLinked.length ? pct(orders, crmLinked.length) : null,
      conversionDenominator: crmLinked.length,
      unansweredFaqs: rows_.reduce((a, c) => a + c.faqs.filter((f) => f.answerStatus === 'unanswered').length, 0),
      objectionResolutionPct: objections.length ? pct(resolvedObjections, objections.length) : null,
      coachingFocus: sorted.at(-1) && sorted.at(-1)!.value < THRESHOLDS.coachingQualityScore ? sorted.at(-1)!.label : null,
      sample: sampleConfidence(conversational.length),
    })
    void actions
  }
  return rows.sort((a, b) => b.avgQuality - a.avgQuality)
}

/* ── Funnel, themes, emotions ─────────────────────────────────────────────── */

export interface FunnelStage {
  label: string
  value: number
  denominator: number
  pctOfPrevious: number
  provenance: MetricProvenance
  note: string
}

export function callToOrderFunnel(calls: CallRecord[]): FunnelStage[] {
  const total = calls.length
  const meaningful = calls.filter((c) => MEANINGFUL_OUTCOMES.includes(c.callOutcome))
  const highIntent = meaningful.filter((c) => purchaseReadinessScore(c.readinessComponents) >= THRESHOLDS.highIntentScore)
  const crmLinked = calls.filter((c) => c.crm.provenance === 'crm_verified')
  const opps = crmLinked.filter((c) => c.crm.opportunityCreated)
  const orders = crmLinked.filter((c) => c.crm.orderPlaced)

  return [
    { label: 'Calls analysed', value: total, denominator: total, pctOfPrevious: 100, provenance: 'system', note: 'Analysable calls in the period.' },
    { label: 'Meaningful conversations', value: meaningful.length, denominator: total, pctOfPrevious: pct(meaningful.length, total), provenance: 'mixed', note: 'Excludes not-connected, wrong number and dropped calls.' },
    { label: 'High purchase readiness', value: highIntent.length, denominator: meaningful.length, pctOfPrevious: pct(highIntent.length, meaningful.length), provenance: 'ai_inferred', note: `Readiness ≥ ${THRESHOLDS.highIntentScore}. AI-inferred — not a conversion forecast.` },
    { label: 'CRM opportunity created', value: opps.length, denominator: crmLinked.length, pctOfPrevious: pct(opps.length, crmLinked.length), provenance: 'crm_verified', note: `Denominator switches to CRM-linked calls (${crmLinked.length}) — AI and CRM stages never share a denominator.` },
    { label: 'Order placed', value: orders.length, denominator: opps.length, pctOfPrevious: pct(orders.length, opps.length), provenance: 'crm_verified', note: 'Verified orders in the order system.' },
  ]
}

export interface ThemeRow { theme: string; count: number; pct: number; denominator: number; sampleCallId: string }

export function themeAggregates(
  calls: CallRecord[],
  kind: keyof CallRecord['themes'],
): ThemeRow[] {
  const m = new Map<string, { n: number; callId: string }>()
  for (const c of calls) {
    for (const t of c.themes[kind]) {
      const e = m.get(t) ?? { n: 0, callId: c.callId }
      e.n += 1
      m.set(t, e)
    }
  }
  return Array.from(m.entries())
    .map(([theme, v]) => ({ theme, count: v.n, pct: pct(v.n, calls.length), denominator: calls.length, sampleCallId: v.callId }))
    .sort((a, b) => b.count - a.count)
}

export function emotionAverages(calls: CallRecord[]) {
  const keys = ['frustration', 'confusion', 'hesitation', 'urgency', 'trust', 'interest', 'satisfaction'] as const
  const n = Math.max(1, calls.length)
  return keys.map((k) => ({
    key: k,
    label: k[0].toUpperCase() + k.slice(1),
    value: round1((calls.reduce((a, c) => a + c.emotions[k], 0) / n) * 100),
    denominator: calls.length,
  }))
}

/** Sentiment sliced by any dimension of the call record (§3). */
export function sentimentByDimension(
  calls: CallRecord[],
  keyOf: (c: CallRecord) => string,
): { key: string; calls: number; avgSentiment: number; positivePct: number; negativePct: number; improvedPct: number; sample: ReturnType<typeof sampleConfidence> }[] {
  const groups = new Map<string, CallRecord[]>()
  for (const c of calls) {
    const k = keyOf(c)
    if (!groups.has(k)) groups.set(k, [])
    groups.get(k)!.push(c)
  }
  return Array.from(groups.entries())
    .map(([key, rows]) => {
      const k = countCalls(rows)
      return {
        key,
        calls: rows.length,
        avgSentiment: k.avgSentiment,
        positivePct: pct(k.positive, rows.length),
        negativePct: pct(k.negative, rows.length),
        improvedPct: pct(k.improved, rows.length),
        sample: sampleConfidence(rows.length),
      }
    })
    .sort((a, b) => b.calls - a.calls)
}

/** Region × FAQ matrix for the heatmap (§4). */
export function faqByRegionMatrix(calls: CallRecord[], topFaqs: FaqCategoryId[]) {
  const regions = uniq(calls.map((c) => c.region)).sort()
  const cells = regions.map((region) => {
    const rows = calls.filter((c) => c.region === region)
    return {
      region,
      total: rows.length,
      values: topFaqs.map((faqId) => {
        const n = rows.filter((c) => dedupeFaqs(c).some((f) => f.faqId === faqId)).length
        return { faqId, count: n, per100: rows.length ? round1((n / rows.length) * 100) : 0, denominator: rows.length }
      }),
    }
  })
  return { regions, faqs: topFaqs, cells }
}

/** Emerging FAQs / objections: sharp period-over-period rises (§10). */
export function emergingItems<T extends { callCount: number; prevCallCount: number; trendPct: number | null }>(
  rows: T[],
  minCount = 3,
): T[] {
  return rows
    .filter((r) => r.callCount >= minCount && (r.prevCallCount === 0 || (r.trendPct ?? 0) >= THRESHOLDS.emergingTrendRise * 100))
    .sort((a, b) => (b.trendPct ?? 999) - (a.trendPct ?? 999))
}

/* ── Data quality (§13) ───────────────────────────────────────────────────── */

export interface DataQualitySummary {
  total: number
  transcribed: number
  failed: number
  lowConfidence: number
  analysable: number
  excludedPct: number
  unknownLanguage: number
  diarisationUnreliable: number
  corrected: number
  avgTranscriptionConfidence: number
  avgExtractionConfidence: number
  crmLinked: number
  crmLinkedPct: number
  byLanguage: { language: string; calls: number; avgConfidence: number }[]
}

export function dataQualitySummary(allCalls: CallRecord[]): DataQualitySummary {
  const transcribed = allCalls.filter((c) => c.transcriptAvailable)
  const failed = allCalls.length - transcribed.length
  const lowConfidence = transcribed.filter((c) => c.transcriptionConfidence < THRESHOLDS.minTranscriptConfidence).length
  const analysable = transcribed.filter(
    (c) => c.transcriptionConfidence >= THRESHOLDS.minTranscriptConfidence && c.extractionConfidence >= THRESHOLDS.minTranscriptConfidence,
  ).length
  const langMap = new Map<string, CallRecord[]>()
  for (const c of allCalls) {
    if (!langMap.has(c.language)) langMap.set(c.language, [])
    langMap.get(c.language)!.push(c)
  }
  const crmLinked = allCalls.filter((c) => c.crm.provenance === 'crm_verified').length

  return {
    total: allCalls.length,
    transcribed: transcribed.length,
    failed,
    lowConfidence,
    analysable,
    excludedPct: pct(allCalls.length - analysable, allCalls.length),
    unknownLanguage: allCalls.filter((c) => c.language === 'Unknown').length,
    diarisationUnreliable: transcribed.filter((c) => c.diarisationConfidence < THRESHOLDS.minDiarisationConfidence).length,
    corrected: allCalls.filter((c) => c.correctedBy).length,
    avgTranscriptionConfidence: transcribed.length ? round1((transcribed.reduce((a, c) => a + c.transcriptionConfidence, 0) / transcribed.length) * 100) : 0,
    avgExtractionConfidence: transcribed.length ? round1((transcribed.reduce((a, c) => a + c.extractionConfidence, 0) / transcribed.length) * 100) : 0,
    crmLinked,
    crmLinkedPct: pct(crmLinked, allCalls.length),
    byLanguage: Array.from(langMap.entries())
      .map(([language, rows]) => ({
        language,
        calls: rows.length,
        avgConfidence: round1((rows.reduce((a, c) => a + c.transcriptionConfidence, 0) / rows.length) * 100),
      }))
      .sort((a, b) => b.calls - a.calls),
  }
}

/** Quality-vs-conversion scatter input (§2). */
export function qualityVsConversion(agents: AgentRow[]) {
  return agents
    .filter((a) => a.conversionPct !== null && a.conversionDenominator >= 5)
    .map((a) => ({
      name: a.name,
      quality: a.avgQuality,
      conversion: a.conversionPct as number,
      calls: a.calls,
      denominator: a.conversionDenominator,
      team: a.teamName,
    }))
}

export { pct as percentOf, uniq as uniqueValues, tally as tallyValues }
export { ACTION_TYPE_BY_ID }
