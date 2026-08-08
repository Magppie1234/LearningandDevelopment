/**
 * Sunroof Call Intelligence — scoring methodology (§7).
 *
 * Three INDEPENDENT scores. They are never blended, never used as proxies for
 * one another, and each one states its own limitation:
 *
 *  1. Customer Sentiment Score — how the customer felt. Transcript text only.
 *  2. Purchase Readiness Score — how ready this customer is to buy. NOT a
 *     conversion probability: it has not been validated against historical
 *     conversions (see PURCHASE_READINESS_VALIDATION).
 *  3. Agent Quality Score — how well the agent ran the conversation. Critical
 *     compliance failures are reported SEPARATELY and never averaged in.
 *
 * Every weight table below is exported so the UI can render the methodology
 * rather than restating it in prose that can drift out of sync.
 */

import type {
  CallRecord,
  QualityComponents,
  ReadinessComponents,
  SentimentPhases,
} from './types'
import { COMPLIANCE_BY_ID, THRESHOLDS } from '@/data/call-intelligence/taxonomy'

const clamp = (n: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, n))
export const round1 = (n: number) => Math.round(n * 10) / 10

/* ────────────────────────────────────────────────────────────────────────────
 * 1. Customer Sentiment Score
 * ────────────────────────────────────────────────────────────────────────── */

/** Maps a −1..+1 text-sentiment mean onto a 0..100 score. */
export function sentimentToScore(s: number): number {
  return round1(clamp(((s + 1) / 2) * 100))
}

export interface SentimentScore {
  opening: number
  closing: number
  overall: number
  /** closing − opening, in score points. Positive = improved. */
  shift: number
  band: 'positive' | 'neutral' | 'negative'
}

export const SENTIMENT_BANDS = {
  positive: 'Overall score ≥ 60',
  neutral: 'Overall score 40–59',
  negative: 'Overall score < 40',
} as const

export function customerSentimentScore(phases: SentimentPhases): SentimentScore {
  const opening = sentimentToScore(phases.opening)
  const closing = sentimentToScore(phases.closing)
  const overall = sentimentToScore(phases.overall)
  return {
    opening,
    closing,
    overall,
    shift: round1(closing - opening),
    band: overall >= 60 ? 'positive' : overall >= 40 ? 'neutral' : 'negative',
  }
}

/** A call "improved" when closing sentiment beats opening by ≥ 5 points. */
export const SENTIMENT_IMPROVEMENT_THRESHOLD = 5

export function sentimentImproved(phases: SentimentPhases): boolean {
  const s = customerSentimentScore(phases)
  return s.shift >= SENTIMENT_IMPROVEMENT_THRESHOLD
}

export function sentimentDeteriorated(phases: SentimentPhases): boolean {
  const s = customerSentimentScore(phases)
  return s.shift <= -SENTIMENT_IMPROVEMENT_THRESHOLD
}

/* ────────────────────────────────────────────────────────────────────────────
 * 2. Purchase Readiness Score
 * ────────────────────────────────────────────────────────────────────────── */

export const READINESS_WEIGHTS: {
  key: keyof ReadinessComponents
  label: string
  weight: number
  note: string
}[] = [
  { key: 'needAndFit', label: 'Need and product fit', weight: 0.25, note: 'A stated need mapped to a product we sell.' },
  { key: 'explicitIntent', label: 'Explicit buying intent', weight: 0.2, note: 'Explicit words only. Politeness is not intent (§3).' },
  { key: 'timeline', label: 'Purchase timeline', weight: 0.15, note: 'Stated timeframe; "Not mentioned" scores 0, not an average.' },
  { key: 'nextStepCommitment', label: 'Next-step commitment', weight: 0.15, note: 'A concrete agreed next step, not a vague "I will think".' },
  { key: 'decisionAuthority', label: 'Decision-making authority', weight: 0.1, note: 'Sole / joint / not the decision maker.' },
  { key: 'budgetReadiness', label: 'Budget readiness', weight: 0.1, note: 'A budget figure or band actually spoken.' },
  { key: 'sentiment', label: 'Sentiment', weight: 0.05, note: 'Deliberately the smallest weight — a warm call is not a sale.' },
]

export const PURCHASE_READINESS_VALIDATION = {
  validatedAgainstConversions: false,
  statement:
    'This is a Purchase Readiness Score, not a conversion probability. It has not been ' +
    'back-tested against historical CRM conversions. Once ≥ 2 quarters of matched ' +
    'call → order outcomes exist, calibration can be run and this statement replaced ' +
    'with the measured lift.',
} as const

export function purchaseReadinessScore(c: ReadinessComponents): number {
  const total = READINESS_WEIGHTS.reduce((sum, w) => sum + clamp(c[w.key]) * w.weight, 0)
  return round1(clamp(total))
}

export function readinessBand(score: number): 'high' | 'medium' | 'low' {
  if (score >= THRESHOLDS.highIntentScore) return 'high'
  if (score >= 40) return 'medium'
  return 'low'
}

/* ────────────────────────────────────────────────────────────────────────────
 * 3. Agent Quality Score
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Spec weights (§7). Two spec buckets aggregate more than one measured
 * parameter, so the members are declared here rather than hidden in the code:
 *   • "Discovery and need identification" = discoveryQuestions + needIdentification
 *   • "Product and FAQ handling"          = productKnowledge + answerRelevance + answerAccuracy
 *   • "Professionalism and empathy"       = professionalism + empathy + communicationClarity
 * Members are averaged, then the bucket weight is applied.
 */
export const QUALITY_WEIGHTS: {
  key: string
  label: string
  weight: number
  members: (keyof QualityComponents)[]
}[] = [
  { key: 'discovery', label: 'Discovery & need identification', weight: 0.2, members: ['discoveryQuestions', 'needIdentification'] },
  { key: 'solution', label: 'Solution relevance', weight: 0.15, members: ['solutionRelevance'] },
  { key: 'product_faq', label: 'Product & FAQ handling', weight: 0.15, members: ['productKnowledge', 'answerRelevance', 'answerAccuracy'] },
  { key: 'objection', label: 'Objection handling', weight: 0.15, members: ['objectionHandling'] },
  { key: 'next_step', label: 'Next-step clarity', weight: 0.15, members: ['nextStepClarity'] },
  { key: 'listening', label: 'Listening behaviour', weight: 0.1, members: ['activeListening'] },
  { key: 'opening', label: 'Opening & introduction', weight: 0.05, members: ['openingIntroduction', 'permissionToContinue'] },
  { key: 'professionalism', label: 'Professionalism & empathy', weight: 0.05, members: ['professionalism', 'empathy', 'communicationClarity'] },
]

export interface QualityResult {
  score: number
  /** Per-bucket contribution, for the coaching view. */
  buckets: { key: string; label: string; weight: number; value: number; weighted: number }[]
  /**
   * Critical compliance failures. Reported next to the score, NEVER folded into
   * it — a 92 with a mis-selling flag must not read as a good call (§7).
   */
  criticalFailures: string[]
  hasCriticalFailure: boolean
  /** Buckets whose member scores could not all be measured (e.g. no KB article). */
  unmeasuredNote: string | null
}

export function agentQualityScore(call: CallRecord): QualityResult {
  const c = call.qualityComponents
  let unmeasured = false
  const buckets = QUALITY_WEIGHTS.map((w) => {
    const vals = w.members
      .map((m) => c[m])
      .filter((v): v is number => typeof v === 'number')
    if (vals.length !== w.members.length) unmeasured = true
    // A bucket with no measurable member falls back to the call's average of
    // measurable buckets rather than scoring 0 — an unmeasurable parameter is
    // not a failure (§13).
    const value = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : NaN
    return { key: w.key, label: w.label, weight: w.weight, value, weighted: 0 }
  })

  const measurable = buckets.filter((b) => !Number.isNaN(b.value))
  const measurableWeight = measurable.reduce((s, b) => s + b.weight, 0)
  const raw = measurable.reduce((s, b) => s + b.value * b.weight, 0)
  // Re-normalise across measurable weight so an unmeasurable parameter neither
  // rewards nor penalises the agent.
  const score = measurableWeight > 0 ? round1(clamp(raw / measurableWeight)) : 0
  for (const b of buckets) {
    b.weighted = Number.isNaN(b.value) ? 0 : round1(b.value * b.weight)
    if (Number.isNaN(b.value)) b.value = 0
  }

  const criticalFailures = call.complianceFlags
    .filter((f) => COMPLIANCE_BY_ID[f]?.critical)
    .map((f) => COMPLIANCE_BY_ID[f].label)

  return {
    score,
    buckets,
    criticalFailures,
    hasCriticalFailure: criticalFailures.length > 0,
    unmeasuredNote: unmeasured
      ? 'One or more parameters were not measurable on this call (e.g. answer accuracy with no approved knowledge-base article). Weights were re-normalised across measurable parameters.'
      : null,
  }
}

/* ────────────────────────────────────────────────────────────────────────────
 * Coaching
 * ────────────────────────────────────────────────────────────────────────── */

export interface CoachingPoint {
  parameter: string
  score: number
  recommendation: string
}

const COACHING_COPY: Record<string, string> = {
  discovery: 'Ask two open discovery questions before proposing a product — layout, family size, cooking style.',
  solution: 'Tie the recommendation back to the need the customer stated, in their words.',
  product_faq: 'Refresh product knowledge on the series comparison and technical specification articles.',
  objection: 'Acknowledge the objection, then reframe on value with one concrete proof point.',
  next_step: 'Close every call with a named next step, an owner and a date the customer repeats back.',
  listening: 'Reduce talk time — let the customer finish before responding.',
  opening: 'Complete the opening: introduce yourself, state the reason, ask permission to continue.',
  professionalism: 'Acknowledge the emotion before solving the problem.',
}

export function coachingPoints(call: CallRecord, limit = 3): CoachingPoint[] {
  const q = agentQualityScore(call)
  return q.buckets
    .filter((b) => b.value < THRESHOLDS.coachingQualityScore)
    .sort((a, b) => a.value - b.value)
    .slice(0, limit)
    .map((b) => ({
      parameter: b.label,
      score: round1(b.value),
      recommendation: COACHING_COPY[b.key] ?? 'Review this parameter with the manager.',
    }))
}

/* ────────────────────────────────────────────────────────────────────────────
 * Call-level convenience
 * ────────────────────────────────────────────────────────────────────────── */

export interface CallScores {
  sentiment: SentimentScore
  readiness: number
  readinessBand: 'high' | 'medium' | 'low'
  quality: QualityResult
}

export function scoreCall(call: CallRecord): CallScores {
  const readiness = purchaseReadinessScore(call.readinessComponents)
  return {
    sentiment: customerSentimentScore(call.customerSentiment),
    readiness,
    readinessBand: readinessBand(readiness),
    quality: agentQualityScore(call),
  }
}

/** Calls that may enter management aggregates (§13). */
export function isAnalysable(call: CallRecord): boolean {
  return (
    call.transcriptAvailable &&
    call.transcriptionConfidence >= THRESHOLDS.minTranscriptConfidence &&
    call.extractionConfidence >= THRESHOLDS.minTranscriptConfidence
  )
}
