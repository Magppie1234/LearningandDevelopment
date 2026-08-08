/**
 * Sunroof Call Intelligence — deterministic mock dataset.
 *
 * DEMO DATA ONLY. Generated from the authored scenarios in scenarios.ts with a
 * seeded PRNG, so every run of the app produces byte-identical numbers and a
 * KPI can be reconciled against a transcript by hand.
 *
 * Design rule: nothing is asserted at the aggregate level. FAQ counts, sentiment
 * phases, talk ratios, response times and evidence timestamps are all COMPUTED
 * from the generated transcript turns. If the transcript does not support an
 * insight, the insight is not produced.
 *
 * Replace this module with a real adapter (see service.ts) — do not import it
 * from production code paths (§16).
 */

import {
  CAMPAIGNS,
  COMPETITORS,
  CRM_STAGES,
  CUSTOMER_SEGMENTS,
  EMPLOYEES,
  FAQ_BY_ID,
  GEOS,
  LEAD_SOURCES,
  MODEL_VERSIONS,
  PRODUCTS,
  PRODUCT_SERIES,
  TAXONOMY_VERSION,
  TEAM_BY_ID,
  type Campaign,
  type CrmStage,
  type CustomerSegment,
  type FaqCategoryId,
  type Language,
  type LeadSource,
} from './taxonomy'
import { SCENARIOS, type Scenario, type TurnSpec } from './scenarios'
import type {
  CallRecord,
  ComplianceFlagId,
  ExtractedCommitment,
  ExtractedFaq,
  ExtractedObjection,
  QualityComponents,
  RecommendedAction,
  TranscriptTurn,
} from '@/lib/call-intelligence/types'

/** The clock the whole demo is anchored to. */
export const DEMO_NOW = '2026-08-03T18:30:00.000Z'
/** Primary window = last 28 days; comparison = the 28 before it. */
export const DEMO_PERIOD_DAYS = 28

/* ── Deterministic PRNG ───────────────────────────────────────────────────── */

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20260803)
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)]
const between = (lo: number, hi: number) => lo + rand() * (hi - lo)
const chance = (p: number) => rand() < p
const round = (n: number, dp = 2) => Number(n.toFixed(dp))
const clamp = (n: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, n))

/* ── Customers ────────────────────────────────────────────────────────────── */

const FIRST = ['Rahul', 'Priyanka', 'Sameer', 'Anjali', 'Vikas', 'Neha', 'Arjun', 'Kavita', 'Manish', 'Divya', 'Sanjay', 'Pooja', 'Rohan', 'Shruti', 'Aditya', 'Ritu', 'Nikhil', 'Swati', 'Gaurav', 'Meenakshi']
const LAST = ['Agarwal', 'Menon', 'Chatterjee', 'Rao', 'Kapoor', 'Bose', 'Sinha', 'Pillai', 'Bhatt', 'Trivedi', 'Ghosh', 'Saxena', 'Mehta', 'Chauhan', 'Naidu']

export interface MockCustomer {
  id: string
  name: string
  phoneMasked: string
  geoIndex: number
  segment: CustomerSegment
  leadSource: LeadSource
  campaign: Campaign
  /** true = a CRM record exists, so outcomes can be verified. */
  crmLinked: boolean
}

function buildCustomers(): MockCustomer[] {
  const out: MockCustomer[] = []
  for (let i = 0; i < 150; i += 1) {
    // Deliberate stress cases so the UI is proven against real-world messiness.
    const longName = i === 7
    const name = longName
      ? 'Lakshminarayanan Venkataraghavan Subramanian-Krishnamoorthy'
      : `${pick(FIRST)} ${pick(LAST)}`
    out.push({
      id: `CUST-${String(1000 + i)}`,
      name,
      phoneMasked: `+91 ●●●●● ${String(10000 + Math.floor(rand() * 89999)).slice(-5)}`,
      geoIndex: i % 13 === 0 ? 12 : Math.floor(rand() * (GEOS.length - 1)),
      segment: pick(CUSTOMER_SEGMENTS.filter((s) => s !== 'Unknown')) as CustomerSegment,
      leadSource: pick(LEAD_SOURCES),
      campaign: pick(CAMPAIGNS),
      crmLinked: chance(0.72),
    })
  }
  return out
}

export const MOCK_CUSTOMERS = buildCustomers()

/* ── Employee skill profiles ──────────────────────────────────────────────── */

/**
 * A stable per-employee quality delta so team/agent comparisons mean something.
 * Deliberately NOT correlated with tenure, gender or region — the score must
 * reflect behaviour on the call only (§13).
 */
const EMPLOYEE_DELTA: Record<string, number> = {
  'emp-01': 9, 'emp-02': -3, 'emp-03': -11, 'emp-04': 11, 'emp-05': 1,
  'emp-06': 6, 'emp-07': -7, 'emp-08': -13, 'emp-09': 4, 'emp-10': -2,
}

/* ── Transcript construction ──────────────────────────────────────────────── */

interface BuiltTranscript {
  turns: TranscriptTurn[]
  durationSec: number
  interruptions: number
  longestSilenceSec: number
  agentTalkSec: number
  customerTalkSec: number
}

function buildTranscript(
  scenario: Scenario,
  ctx: { name: string; city: string; agent: string; product: string },
  language: Language,
  baseConfidence: number,
): BuiltTranscript {
  const turns: TranscriptTurn[] = []
  let cursor = 0
  let interruptions = 0
  let longestSilence = 0
  let agentTalk = 0
  let customerTalk = 0

  const useHindi = language === 'Hindi' && scenario.turns.some((t) => t.hi)

  scenario.turns.forEach((spec, i) => {
    const english = spec.t
      .replace(/\{name\}/g, ctx.name)
      .replace(/\{city\}/g, ctx.city)
      .replace(/\{agent\}/g, ctx.agent)
      .replace(/\{product\}/g, ctx.product)
    const original = useHindi && spec.hi
      ? spec.hi.replace(/\{name\}/g, ctx.name).replace(/\{city\}/g, ctx.city).replace(/\{agent\}/g, ctx.agent)
      : english

    // Speaking rate ~2.6 words/sec, floor of 2.5s per turn.
    const words = english.split(/\s+/).length
    const dur = Math.max(2.5, round(words / 2.6 + between(-0.4, 0.9), 1))

    // Gap before this turn: usually short; occasionally a real silence.
    const gap = i === 0 ? 0 : chance(0.08) ? round(between(4, 11), 1) : round(between(0.2, 1.6), 1)
    if (gap > longestSilence) longestSilence = gap
    // A negative gap models an interruption (speaker starts before the last ends).
    const overlap = i > 0 && chance(0.09)
    if (overlap) interruptions += 1

    const startSec = round(cursor + (overlap ? -0.8 : gap), 1)
    const endSec = round(startSec + dur, 1)
    cursor = endSec

    if (spec.s === 'agent') agentTalk += dur
    else customerTalk += dur

    turns.push({
      index: i,
      speaker: spec.s,
      startSec: Math.max(0, startSec),
      endSec,
      text: original,
      translation: useHindi && spec.hi ? english : null,
      sentiment: round(clamp(spec.sent + between(-0.06, 0.06), -1, 1), 2),
      confidence: round(clamp(baseConfidence + between(-0.09, 0.06), 0, 1), 2),
    })
  })

  return {
    turns,
    durationSec: Math.round(cursor + between(3, 14)),
    interruptions,
    longestSilenceSec: round(longestSilence, 1),
    agentTalkSec: round(agentTalk, 1),
    customerTalkSec: round(customerTalk, 1),
  }
}

/** Mean of a numeric slice; 0 for an empty slice. */
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)

/** Split customer turns into opening / middle / closing thirds (§3). */
function sentimentPhases(turns: TranscriptTurn[], speaker: 'customer' | 'agent') {
  const vals = turns.filter((t) => t.speaker === speaker).map((t) => t.sentiment)
  if (vals.length === 0) return { opening: 0, middle: 0, closing: 0, overall: 0 }
  const third = Math.max(1, Math.ceil(vals.length / 3))
  return {
    opening: round(mean(vals.slice(0, third)), 3),
    middle: round(mean(vals.slice(third, third * 2)), 3),
    closing: round(mean(vals.slice(-third)), 3),
    overall: round(mean(vals), 3),
  }
}

/* ── Extraction from the built transcript ─────────────────────────────────── */

function extractFaqs(
  specs: TurnSpec[],
  turns: TranscriptTurn[],
  confidence: number,
): ExtractedFaq[] {
  const out: ExtractedFaq[] = []
  /** Dedupe: the same FAQ asked twice in one call counts ONCE (§4). */
  const seen = new Set<FaqCategoryId>()

  specs.forEach((spec, i) => {
    if (!spec.faq || seen.has(spec.faq)) return
    seen.add(spec.faq)

    // Find the agent turn that answers it — the next agent turn with `answers`.
    let answerIdx = -1
    for (let j = i + 1; j < specs.length; j += 1) {
      if (specs[j].s === 'agent' && specs[j].answers) {
        answerIdx = j
        break
      }
    }
    const status = answerIdx >= 0 ? specs[answerIdx].answers! : 'unanswered'
    const qTurn = turns[i]
    const responseTimeSec =
      answerIdx >= 0 ? round(Math.max(0, turns[answerIdx].startSec - qTurn.endSec), 1) : null

    // Customer sentiment in the 3 turns after the answer — measured, not assumed.
    let sentimentAfter: number | null = null
    if (answerIdx >= 0) {
      const after = turns
        .slice(answerIdx + 1, answerIdx + 4)
        .filter((t) => t.speaker === 'customer')
        .map((t) => t.sentiment)
      sentimentAfter = after.length ? round(mean(after), 2) : null
    }

    const relevance =
      status === 'fully_answered' ? clamp(88 + between(-6, 8)) : status === 'partially_answered' ? clamp(62 + between(-8, 8)) : 12
    // Factual accuracy is ONLY scored against an approved KB article (§4).
    const hasKb = FAQ_BY_ID[spec.faq].kbArticleId !== null
    const accuracy = hasKb && status !== 'unanswered' ? clamp(relevance + between(-8, 6)) : null

    out.push({
      faqId: spec.faq,
      originalQuestion: qTurn.translation ?? qTurn.text,
      kind: spec.t.includes('?') ? 'explicit' : 'implicit',
      answerStatus: status,
      responseTimeSec,
      sentimentAfter,
      answerRelevance: round(relevance, 1),
      answerAccuracy: accuracy === null ? null : round(accuracy, 1),
      escalationRequired: status === 'unanswered',
      confidence: round(clamp(confidence * 100 + between(-6, 4), 40, 99) / 100, 2),
      evidence: { turnIndex: qTurn.index, timestampSec: qTurn.startSec, quote: qTurn.translation ?? qTurn.text },
    })
  })
  return out
}

function extractObjections(
  specs: TurnSpec[],
  turns: TranscriptTurn[],
  confidence: number,
): ExtractedObjection[] {
  const out: ExtractedObjection[] = []
  specs.forEach((spec, i) => {
    if (!spec.obj) return
    let handlerIdx = -1
    for (let j = i + 1; j < specs.length; j += 1) {
      if (specs[j].s === 'agent' && specs[j].handles) {
        handlerIdx = j
        break
      }
    }
    const handled = handlerIdx >= 0 ? specs[handlerIdx].handles! : null

    // Customer reaction = sentiment delta across the exchange, measured.
    const before = turns[i].sentiment
    const afterTurns = turns
      .slice(handlerIdx >= 0 ? handlerIdx + 1 : i + 1, (handlerIdx >= 0 ? handlerIdx : i) + 4)
      .filter((t) => t.speaker === 'customer')
      .map((t) => t.sentiment)
    const reaction = afterTurns.length ? round(mean(afterTurns) - before, 2) : 0

    out.push({
      objectionId: spec.obj,
      intensity: spec.objIntensity ?? 2,
      employeeResponse: handlerIdx >= 0 ? turns[handlerIdx].translation ?? turns[handlerIdx].text : 'No response detected in the transcript.',
      technique: handled?.technique ?? 'No technique detected',
      resolution: handled?.resolution ?? 'unresolved',
      customerReaction: reaction,
      confidence: round(clamp(confidence * 100 + between(-8, 3), 40, 99) / 100, 2),
      evidence: { turnIndex: turns[i].index, timestampSec: turns[i].startSec, quote: turns[i].translation ?? turns[i].text },
    })
  })
  return out
}

function extractCommitments(
  specs: TurnSpec[],
  turns: TranscriptTurn[],
  callId: string,
  startedAt: string,
  confidence: number,
): ExtractedCommitment[] {
  const out: ExtractedCommitment[] = []
  specs.forEach((spec, i) => {
    if (!spec.commit) return
    const due = spec.commit.dueInHours
      ? new Date(new Date(startedAt).getTime() + spec.commit.dueInHours * 3600_000).toISOString()
      : null
    out.push({
      id: `${callId}-C${i}`,
      actionTypeId: spec.commit.actionTypeId,
      party: spec.commit.party,
      text: turns[i].translation ?? turns[i].text,
      spokenDueAt: due,
      confidence: round(clamp(confidence * 100 + between(-5, 5), 40, 99) / 100, 2),
      evidence: { turnIndex: turns[i].index, timestampSec: turns[i].startSec, quote: turns[i].translation ?? turns[i].text },
    })
  })
  return out
}

/* ── Quality components ───────────────────────────────────────────────────── */

function buildQuality(
  scenario: Scenario,
  delta: number,
  faqs: ExtractedFaq[],
  objections: ExtractedObjection[],
  commitments: ExtractedCommitment[],
  dynamics: { talkToListenRatio: number; reliable: boolean },
): QualityComponents {
  const base = scenario.qualityBase
  const j = () => between(-5, 5)
  const b = (offset = 0) => round(clamp(base + delta + offset + j()), 1)

  // Derived, not asserted: these read off what actually happened on the call.
  const answered = faqs.filter((f) => f.answerStatus !== 'unanswered')
  const relevance = answered.length ? round(mean(answered.map((f) => f.answerRelevance)), 1) : null
  const accuracyScores = faqs.map((f) => f.answerAccuracy).filter((n): n is number => n !== null)
  const accuracy = accuracyScores.length ? round(mean(accuracyScores), 1) : null

  const resolvedObj = objections.filter((o) => o.resolution === 'resolved').length
  const partialObj = objections.filter((o) => o.resolution === 'partially_resolved').length
  const objectionHandling = objections.length
    ? round(clamp(((resolvedObj + partialObj * 0.5) / objections.length) * 100 * 0.75 + base * 0.25 + delta), 1)
    : b()

  const employeeCommitments = commitments.filter((c) => c.party === 'employee')
  const nextStepClarity = employeeCommitments.length
    ? round(clamp(72 + employeeCommitments.length * 9 + delta + j()), 1)
    : round(clamp(base * 0.4 + delta + j()), 1)

  // Listening: penalise a dominant agent, but only when diarisation is reliable.
  const listening = dynamics.reliable
    ? round(clamp(100 - Math.abs(dynamics.talkToListenRatio - 0.45) * 190 + delta * 0.5), 1)
    : b()

  return {
    openingIntroduction: scenario.omissions?.includes('missing_disclosure') ? round(clamp(30 + j()), 1) : b(4),
    permissionToContinue: scenario.omissions?.includes('no_permission_to_continue') ? round(clamp(15 + j()), 1) : b(2),
    discoveryQuestions: b(scenario.id === 'sc-rushed' ? -18 : 0),
    needIdentification: b(scenario.signals.need ? 4 : -20),
    activeListening: listening,
    productKnowledge: b(),
    answerRelevance: relevance ?? b(),
    answerAccuracy: accuracy,
    objectionHandling,
    empathy: b(scenario.endsNegative ? -4 : 2),
    communicationClarity: b(),
    professionalism: b(3),
    scriptAdherence: b(scenario.omissions?.length ? -22 : 0),
    nextStepClarity,
    solutionRelevance: b(scenario.signals.productInterest ? 3 : -12),
  }
}

/* ── Record assembly ──────────────────────────────────────────────────────── */

function weightedScenario(): Scenario {
  const total = SCENARIOS.reduce((s, x) => s + x.weight, 0)
  let r = rand() * total
  for (const s of SCENARIOS) {
    r -= s.weight
    if (r <= 0) return s
  }
  return SCENARIOS[0]
}

function isoMinus(days: number, hourJitter = true): string {
  const base = new Date(DEMO_NOW).getTime() - days * 86400_000
  const h = hourJitter ? Math.floor(between(9, 20)) : 12
  const d = new Date(base)
  d.setUTCHours(h, Math.floor(between(0, 59)), 0, 0)
  return d.toISOString()
}

function buildCall(i: number): CallRecord {
  const scenario = weightedScenario()
  const customer = MOCK_CUSTOMERS[Math.floor(rand() * MOCK_CUSTOMERS.length)]
  const geo = GEOS[customer.geoIndex]

  // Team is chosen by business unit; sales teams roughly track region so the
  // regional view has signal, but service is national.
  const salesTeamForRegion: Record<string, string> = {
    North: 'team-north-sales', West: 'team-west-sales', South: 'team-south-sales', East: 'team-north-sales',
  }
  const teamId = scenario.businessUnit === 'Customer Service' ? 'team-service' : salesTeamForRegion[geo.region]
  const teamEmployees = EMPLOYEES.filter((e) => e.teamId === teamId)
  const employee = teamEmployees[Math.floor(rand() * teamEmployees.length)]
  const team = TEAM_BY_ID[teamId]

  const product = chance(0.88) ? pick(PRODUCTS) : null
  const series = product ? PRODUCT_SERIES.find((s) => s.id === product.seriesId)! : null

  const daysAgo = between(0, DEMO_PERIOD_DAYS * 2)
  const startedAt = isoMinus(daysAgo)

  // Edge cases, deliberately seeded so the UI states are provably exercised.
  const failedTranscript = i % 47 === 0
  const unknownLanguage = i % 53 === 0
  const lowConfidence = i % 17 === 0

  const language: Language = unknownLanguage
    ? 'Unknown'
    : geo.region === 'South'
      ? pick(['English', 'Tamil', 'Telugu', 'English'])
      : geo.region === 'West'
        ? pick(['Hindi', 'Marathi', 'English'])
        : geo.region === 'East'
          ? pick(['Bengali', 'Hindi', 'English'])
          : pick(['Hindi', 'English', 'Hindi'])

  const transcriptionConfidence = failedTranscript
    ? 0
    : lowConfidence
      ? round(between(0.44, 0.68), 2)
      : round(between(0.78, 0.97), 2)
  const diarisationConfidence = failedTranscript ? 0 : round(clamp(transcriptionConfidence + between(-0.14, 0.05), 0, 1), 2)

  const ctx = {
    name: customer.name.split(' ')[0],
    city: geo.city,
    agent: employee.name.split(' ')[0],
    product: product?.name ?? 'kitchen',
  }

  const built = failedTranscript
    ? { turns: [] as TranscriptTurn[], durationSec: Math.round(between(20, 180)), interruptions: 0, longestSilenceSec: 0, agentTalkSec: 0, customerTalkSec: 0 }
    : buildTranscript(scenario, ctx, language, transcriptionConfidence)

  const callId = `CALL-${String(100000 + i)}`
  const specs = failedTranscript ? [] : scenario.turns

  const faqs = extractFaqs(specs, built.turns, transcriptionConfidence)
  const objections = extractObjections(specs, built.turns, transcriptionConfidence)
  const commitments = extractCommitments(specs, built.turns, callId, startedAt, transcriptionConfidence)

  const diarisationReliable = !failedTranscript && diarisationConfidence >= 0.75 && built.turns.length > 2
  const totalTalk = built.agentTalkSec + built.customerTalkSec
  const dynamics = {
    reliable: diarisationReliable,
    agentTalkSec: built.agentTalkSec,
    customerTalkSec: built.customerTalkSec,
    talkToListenRatio: totalTalk > 0 ? round(built.agentTalkSec / totalTalk, 3) : 0,
    interruptions: built.interruptions,
    longestSilenceSec: built.longestSilenceSec,
  }

  const customerSentiment = sentimentPhases(built.turns, 'customer')
  const employeeSentiment = sentimentPhases(built.turns, 'agent')

  const delta = EMPLOYEE_DELTA[employee.id] ?? 0
  const qualityComponents = buildQuality(scenario, delta, faqs, objections, commitments, dynamics)

  const complianceFlags: ComplianceFlagId[] = []
  for (const spec of specs) if (spec.flag) complianceFlags.push(spec.flag as ComplianceFlagId)
  for (const om of scenario.omissions ?? []) complianceFlags.push(om as ComplianceFlagId)
  if (i % 61 === 0) complianceFlags.push('sensitive_data_exposure')

  // Readiness: scenario base, plus measured next-step evidence and sentiment.
  const employeeCommitmentCount = commitments.filter((c) => c.party === 'employee').length
  const readinessComponents = {
    needAndFit: round(clamp(scenario.readiness.needAndFit + between(-8, 8)), 1),
    explicitIntent: round(clamp(scenario.readiness.explicitIntent + between(-8, 8)), 1),
    timeline: round(clamp(scenario.readiness.timeline + between(-6, 6)), 1),
    nextStepCommitment: round(clamp(employeeCommitmentCount > 0 ? scenario.readiness.nextStepCommitment : Math.min(scenario.readiness.nextStepCommitment, 25)), 1),
    decisionAuthority: round(clamp(scenario.readiness.decisionAuthority + between(-5, 5)), 1),
    budgetReadiness: round(clamp(scenario.readiness.budgetReadiness + between(-6, 6)), 1),
    sentiment: round(clamp(((customerSentiment.overall + 1) / 2) * 100), 1),
  }

  const recommendedActions: RecommendedAction[] = scenario.recommend.map((r, k) => ({
    id: `${callId}-R${k}`,
    actionTypeId: r.actionTypeId,
    reason: r.reason,
    priority: r.priority,
    confidence: round(clamp(transcriptionConfidence * 100 + between(-10, 2), 40, 96) / 100, 2),
    evidence: commitments[0]?.evidence ?? faqs[0]?.evidence ?? objections[0]?.evidence ?? null,
  }))

  // CRM outcomes: only when a CRM record is actually linked (§13).
  const readinessRaw =
    readinessComponents.needAndFit * 0.25 + readinessComponents.explicitIntent * 0.2 +
    readinessComponents.timeline * 0.15 + readinessComponents.nextStepCommitment * 0.15 +
    readinessComponents.decisionAuthority * 0.1 + readinessComponents.budgetReadiness * 0.1 +
    readinessComponents.sentiment * 0.05

  const isSales = scenario.businessUnit === 'Retail Sales'
  const opportunityCreated = customer.crmLinked ? isSales && readinessRaw > 45 && chance(0.72) : null
  const orderPlaced = customer.crmLinked ? Boolean(opportunityCreated) && readinessRaw > 62 && chance(0.34) : null
  const orderValueInr =
    orderPlaced && series
      ? Math.round(between(series.band[0], series.band[1]) / 1000) * 1000
      : orderPlaced
        ? 850_000
        : null

  const crmStage: CrmStage = orderPlaced
    ? 'Won'
    : scenario.id === 'sc-serviceability' || scenario.id === 'sc-polite-low-intent'
      ? pick(['New', 'Contacted'])
      : opportunityCreated
        ? pick(['Qualified', 'Design', 'Quotation', 'Negotiation'])
        : pick(CRM_STAGES.filter((s) => s !== 'Won'))

  const complaintLogged = customer.crmLinked ? scenario.businessUnit === 'Customer Service' && scenario.outcome === 'Complaint logged' : null

  const competitors = scenario.signals.competitors.length
    ? scenario.signals.competitors
    : chance(0.12) ? [pick(COMPETITORS)] : []

  const extractionConfidence = failedTranscript
    ? 0
    : round(clamp(transcriptionConfidence * 0.75 + (built.turns.length > 4 ? 0.2 : 0.05) + between(-0.04, 0.04), 0, 1), 2)

  return {
    callId,
    customerId: customer.id,
    customerName: customer.name,
    customerPhoneMasked: customer.phoneMasked,
    employeeId: employee.id,
    teamId,
    managerName: team.manager,

    startedAt,
    durationSec: built.durationSec,
    direction: scenario.purpose === 'New enquiry' ? (chance(0.45) ? 'inbound' : 'outbound') : chance(0.25) ? 'inbound' : 'outbound',
    callPurpose: scenario.purpose,
    recordingUrl: failedTranscript ? null : `/mock-audio/${callId}.mp3`,

    language,
    transcriptionConfidence,
    diarisationConfidence,
    transcriptAvailable: !failedTranscript,

    brand: 'Sunroof',
    businessUnit: team.businessUnit,
    region: geo.region,
    state: geo.state,
    city: geo.city,
    pincode: geo.pincode,

    productId: product?.id ?? null,
    productSeriesId: series?.id ?? null,
    leadSource: customer.leadSource,
    campaign: customer.campaign,
    crmStage,
    customerSegment: customer.segment,
    callOutcome: failedTranscript ? 'Call dropped' : scenario.outcome,

    transcript: built.turns,

    summary: scenario.summary.replace(/\{city\}/g, geo.city).replace(/\{name\}/g, ctx.name),
    topics: scenario.topics,
    faqs,
    objections,
    commitments,
    recommendedActions,
    signals: {
      customerNeed: { value: scenario.signals.need, confidence: 0.82, provenance: scenario.signals.need ? 'ai_inferred' : 'not_available', evidence: faqs[0]?.evidence ?? null },
      productInterest: { value: scenario.signals.productInterest, confidence: 0.79, provenance: scenario.signals.productInterest ? 'ai_inferred' : 'not_available', evidence: null },
      budgetInr: { value: scenario.signals.budgetInr, confidence: scenario.signals.budgetInr ? 0.88 : 0.4, provenance: scenario.signals.budgetInr ? 'ai_inferred' : 'not_available', evidence: null },
      purchaseTimeline: { value: scenario.signals.timeline, confidence: 0.74, provenance: scenario.signals.timeline ? 'ai_inferred' : 'not_available', evidence: null },
      decisionMaker: { value: scenario.signals.decisionMaker, confidence: 0.71, provenance: scenario.signals.decisionMaker ? 'ai_inferred' : 'not_available', evidence: null },
      requestedQuotation: scenario.signals.requestedQuotation,
      requestedDemo: scenario.signals.requestedDemo,
      requestedSiteVisit: scenario.signals.requestedSiteVisit,
      requestedDesign: scenario.signals.requestedDesign,
      buyingSignals: scenario.signals.buyingSignals,
      crossSellOpportunities: scenario.signals.crossSell,
      competitorMentions: competitors,
      discountRequested: scenario.signals.discountRequested,
      hesitationReasons: scenario.signals.hesitation,
      aiHesitationSummary: scenario.signals.hesitation[0] ?? null,
    },
    themes: scenario.themes,
    emotions: {
      frustration: round(scenario.emotions.frustration ?? 0.1, 2),
      confusion: round(scenario.emotions.confusion ?? 0.15, 2),
      hesitation: round(scenario.emotions.hesitation ?? 0.2, 2),
      urgency: round(scenario.emotions.urgency ?? 0.2, 2),
      trust: round(scenario.emotions.trust ?? 0.5, 2),
      interest: round(scenario.emotions.interest ?? 0.4, 2),
      satisfaction: round(scenario.emotions.satisfaction ?? 0.5, 2),
    },

    customerSentiment,
    employeeSentiment,
    unresolvedNegative: Boolean(scenario.endsNegative) && customerSentiment.closing < -0.15,

    qualityComponents,
    dynamics,
    readinessComponents,
    complianceFlags,

    crm: {
      opportunityCreated,
      orderPlaced,
      orderValueInr,
      paymentStatus: customer.crmLinked ? (orderPlaced ? pick(['part_paid', 'paid', 'pending']) : 'not_applicable') : null,
      complaintLogged,
      complaintSeverity: complaintLogged ? (scenario.id === 'sc-complaint' ? 'critical' : 'major') : null,
      crmLossReason: customer.crmLinked && crmStage === 'Lost' ? pick(['Budget', 'Bought elsewhere', 'Project deferred', 'Not reachable']) : null,
      provenance: customer.crmLinked ? 'crm_verified' : 'not_available',
    },

    extractionConfidence,
    taxonomyVersion: TAXONOMY_VERSION,
    modelVersions: { ...MODEL_VERSIONS },
    correctedBy: i % 71 === 0 ? 'Ritika Malhotra' : null,
    correctedAt: i % 71 === 0 ? isoMinus(between(0, 5), false) : null,
  }
}

/** The full demo corpus. Built once at module load; deterministic. */
export const MOCK_CALLS: CallRecord[] = Array.from({ length: 420 }, (_, i) => buildCall(i)).sort(
  (a, b) => b.startedAt.localeCompare(a.startedAt),
)

export const MOCK_CALL_BY_ID: Record<string, CallRecord> = Object.fromEntries(
  MOCK_CALLS.map((c) => [c.callId, c]),
)
