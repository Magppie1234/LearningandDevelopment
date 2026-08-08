/**
 * Sunroof Call Intelligence — the typed data model (§14).
 *
 * This is the contract every layer honours: the mock adapter produces it, the
 * metrics layer consumes it, and a real telephony/STT/CRM integration must
 * populate exactly these fields. Fields that no upstream system supplies today
 * are typed `null` rather than invented — see docs/call-intelligence/
 * api-and-integrations.md for the gap list.
 */

import type {
  ActionTypeId,
  Campaign,
  CallOutcome,
  CallPurpose,
  ComplianceFlagId,
  CrmStage,
  CustomerSegment,
  FaqCategoryId,
  Language,
  LeadSource,
  ObjectionId,
  ObjectionTechnique,
} from '@/data/call-intelligence/taxonomy'

// Re-exported so consumers of this module get the taxonomy ids alongside the
// shapes that use them. Without this the type-only imports above are local,
// and `scenarios.ts` / `mock-dataset.ts` fail to resolve them at build time.
export type { ComplianceFlagId, ObjectionTechnique }

/* ── Provenance ───────────────────────────────────────────────────────────── */

/**
 * Where a value came from. The UI must never render an `ai_inferred` value with
 * the same visual weight as a `crm_verified` one (§13).
 */
export type Provenance = 'crm_verified' | 'ai_inferred' | 'human_corrected' | 'not_available'

/** Every extracted insight carries confidence + evidence. No exceptions (§13). */
export interface Evidence {
  /** Index into CallRecord.transcript — the exact supporting turn. */
  turnIndex: number
  /** Seconds from call start — drives the audio seek. */
  timestampSec: number
  /** Verbatim snippet actually used by the extractor. */
  quote: string
}

export interface AiField<T> {
  value: T
  confidence: number
  provenance: Provenance
  evidence: Evidence | null
}

/* ── Transcript ───────────────────────────────────────────────────────────── */

export type Speaker = 'customer' | 'agent'

export interface TranscriptTurn {
  index: number
  speaker: Speaker
  startSec: number
  endSec: number
  /** Text in the language the call was actually held in (§13). */
  text: string
  /** English translation, stored and displayed separately (§13). */
  translation: string | null
  /** Per-turn text sentiment, −1..+1. Transcript-derived only. */
  sentiment: number
  /** Word-level STT confidence for this turn. */
  confidence: number
}

/* ── Extraction payloads ──────────────────────────────────────────────────── */

export type AnswerStatus = 'fully_answered' | 'partially_answered' | 'unanswered'

export interface ExtractedFaq {
  faqId: FaqCategoryId
  /** What the customer actually said, verbatim. */
  originalQuestion: string
  /** Explicit question vs implied need surfaced by the extractor. */
  kind: 'explicit' | 'implicit'
  answerStatus: AnswerStatus
  /**
   * Seconds between the question turn and the agent's first substantive reply.
   * null when the question was never answered.
   */
  responseTimeSec: number | null
  /** Customer text sentiment in the 3 turns after the answer, −1..+1. */
  sentimentAfter: number | null
  /**
   * Relevance/completeness always scored. Factual accuracy scored ONLY when the
   * FAQ has an approved KB article; otherwise null (§4).
   */
  answerRelevance: number
  answerAccuracy: number | null
  escalationRequired: boolean
  confidence: number
  evidence: Evidence
}

export type ObjectionResolution = 'resolved' | 'partially_resolved' | 'unresolved'

export interface ExtractedObjection {
  objectionId: ObjectionId
  /** 1 = passing mention, 2 = firm, 3 = blocking. */
  intensity: 1 | 2 | 3
  employeeResponse: string
  technique: ObjectionTechnique
  resolution: ObjectionResolution
  /** Customer text sentiment change across the exchange, −1..+1. */
  customerReaction: number
  confidence: number
  evidence: Evidence
}

export interface ExtractedCommitment {
  id: string
  actionTypeId: ActionTypeId
  /** Who promised it. Customer promises are tracked but never SLA-owned by us. */
  party: 'employee' | 'customer'
  text: string
  /** Explicit due date if one was spoken; otherwise null → SLA default applies. */
  spokenDueAt: string | null
  confidence: number
  evidence: Evidence
}

export interface RecommendedAction {
  id: string
  actionTypeId: ActionTypeId
  reason: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  confidence: number
  evidence: Evidence | null
}

/** Text-derived emotion signals, 0..1. Explicitly NOT voice-tone analysis (§3). */
export interface EmotionSignals {
  frustration: number
  confusion: number
  hesitation: number
  urgency: number
  trust: number
  interest: number
  satisfaction: number
}

export interface SalesSignals {
  customerNeed: AiField<string | null>
  productInterest: AiField<string | null>
  /** Budget in INR when explicitly stated. null = "Not mentioned" (§13). */
  budgetInr: AiField<number | null>
  purchaseTimeline: AiField<'immediate' | 'within_1_month' | 'within_3_months' | 'later' | null>
  decisionMaker: AiField<'sole' | 'joint' | 'not_decision_maker' | null>
  requestedQuotation: boolean
  requestedDemo: boolean
  requestedSiteVisit: boolean
  requestedDesign: boolean
  buyingSignals: string[]
  crossSellOpportunities: string[]
  competitorMentions: string[]
  discountRequested: boolean
  hesitationReasons: string[]
  /** AI's read of why it might be lost. NEVER treated as the CRM loss reason (§6). */
  aiHesitationSummary: string | null
}

/** Voice-of-customer themes (§3). */
export interface VoiceThemes {
  appreciation: string[]
  dissatisfaction: string[]
  featureRequests: string[]
  expectations: string[]
  painPoints: string[]
}

/* ── Scoring components ───────────────────────────────────────────────────── */

/** Raw 0..100 components. Weights live in scoring.ts, never here. */
export interface QualityComponents {
  openingIntroduction: number
  permissionToContinue: number
  discoveryQuestions: number
  needIdentification: number
  activeListening: number
  productKnowledge: number
  answerRelevance: number
  /** null when no approved KB article covers what was asked (§4). */
  answerAccuracy: number | null
  objectionHandling: number
  empathy: number
  communicationClarity: number
  professionalism: number
  scriptAdherence: number
  nextStepClarity: number
  solutionRelevance: number
}

/** Diarisation-dependent metrics — only valid when diarisation is reliable (§8). */
export interface ConversationDynamics {
  reliable: boolean
  agentTalkSec: number
  customerTalkSec: number
  /** agentTalk ÷ (agentTalk + customerTalk), 0..1. */
  talkToListenRatio: number
  interruptions: number
  longestSilenceSec: number
}

export interface ReadinessComponents {
  needAndFit: number
  explicitIntent: number
  timeline: number
  nextStepCommitment: number
  decisionAuthority: number
  budgetReadiness: number
  sentiment: number
}

export interface SentimentPhases {
  opening: number
  middle: number
  closing: number
  overall: number
}

/* ── CRM-verified outcomes ────────────────────────────────────────────────── */

/**
 * Facts from CRM / order / complaint systems. Anything the CRM cannot confirm
 * is `null` + provenance `not_available`; the UI shows "Not available" rather
 * than an AI guess (§13).
 */
export interface CrmOutcome {
  opportunityCreated: boolean | null
  orderPlaced: boolean | null
  orderValueInr: number | null
  paymentStatus: 'not_applicable' | 'pending' | 'part_paid' | 'paid' | null
  complaintLogged: boolean | null
  complaintSeverity: 'critical' | 'major' | 'minor' | null
  /** CRM's own loss reason. The ONLY loss reason management views quote (§6). */
  crmLossReason: string | null
  provenance: Provenance
}

/* ── The call record ──────────────────────────────────────────────────────── */

export interface CallRecord {
  callId: string
  customerId: string
  /** Display name, already masked per role by the service layer (§13). */
  customerName: string
  customerPhoneMasked: string
  employeeId: string
  teamId: string
  managerName: string

  startedAt: string
  durationSec: number
  direction: 'inbound' | 'outbound'
  callPurpose: CallPurpose
  recordingUrl: string | null

  language: Language
  transcriptionConfidence: number
  diarisationConfidence: number
  /** false → the call failed transcription; excluded from language aggregates. */
  transcriptAvailable: boolean

  brand: string
  businessUnit: string
  region: string
  state: string
  city: string
  pincode: string

  productId: string | null
  productSeriesId: string | null
  leadSource: LeadSource
  campaign: Campaign
  crmStage: CrmStage
  customerSegment: CustomerSegment
  callOutcome: CallOutcome

  transcript: TranscriptTurn[]

  /** AI summary — always labelled as generated in the UI. */
  summary: string
  topics: string[]
  faqs: ExtractedFaq[]
  objections: ExtractedObjection[]
  commitments: ExtractedCommitment[]
  recommendedActions: RecommendedAction[]
  signals: SalesSignals
  themes: VoiceThemes
  emotions: EmotionSignals

  customerSentiment: SentimentPhases
  /** Tracked separately so a negative customer never scores the agent (§3). */
  employeeSentiment: SentimentPhases
  /** True when the call ended with the customer still negative (§3). */
  unresolvedNegative: boolean

  qualityComponents: QualityComponents
  dynamics: ConversationDynamics
  readinessComponents: ReadinessComponents
  complianceFlags: ComplianceFlagId[]

  crm: CrmOutcome

  /** Overall extraction confidence — the gate for management aggregates (§13). */
  extractionConfidence: number
  taxonomyVersion: string
  modelVersions: Record<string, string>
  /** Set when a manager has corrected any AI output on this call (§13). */
  correctedBy: string | null
  correctedAt: string | null
}

/* ── Derived records ──────────────────────────────────────────────────────── */

export type ActionStatus = 'pending_approval' | 'approved' | 'in_progress' | 'completed' | 'rejected' | 'rescheduled'
export type SlaStatus = 'on_track' | 'due_today' | 'overdue' | 'met' | 'not_applicable'

export interface ActionRecord {
  id: string
  callId: string
  customerId: string
  customerName: string
  /** 'committed' = explicitly promised on the call; 'recommended' = AI proposal (§9). */
  origin: 'committed' | 'recommended'
  actionTypeId: ActionTypeId
  /** Who made the promise, for committed actions. */
  committedBy: 'employee' | 'customer' | null
  ownerEmployeeId: string
  ownerName: string
  teamId: string
  region: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  dueAt: string
  channel: string
  reason: string
  evidence: Evidence | null
  confidence: number
  status: ActionStatus
  slaStatus: SlaStatus
  /** Deep link into the CRM/task system. null until the integration is wired. */
  crmTaskUrl: string | null
}

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low'

export type AlertRuleId =
  | 'high_intent_no_followup'
  | 'commitment_overdue'
  | 'severe_negative'
  | 'repeat_negative'
  | 'unresolved_complaint'
  | 'cancellation_refund'
  | 'legal_threat'
  | 'mis_selling'
  | 'unapproved_discount'
  | 'compliance_failure'
  | 'sensitive_data'
  | 'high_value_escalation'
  | 'faq_spike'
  | 'objection_spike_region'
  | 'emerging_unanswered'
  | 'competitor_mentions_rising'
  | 'low_transcription_confidence'
  | 'declining_region_product'

export interface AlertRecord {
  id: string
  ruleId: AlertRuleId
  severity: AlertSeverity
  title: string
  /** Subject line — a customer, or a segment for trend alerts. */
  subject: string
  customerId: string | null
  callId: string | null
  ownerName: string
  ownerTeamId: string | null
  reason: string
  evidence: Evidence | null
  evidenceNote: string
  recommendedResponse: string
  /** SLA deadline for resolving the alert itself. */
  resolveBy: string
  raisedAt: string
  /** Critical alerts must be reviewed by a human before action (§13). */
  requiresManualReview: boolean
  status: 'open' | 'acknowledged' | 'resolved'
}

/* ── Filters & paging ─────────────────────────────────────────────────────── */

export interface CallFilters {
  from: string
  to: string
  /** Comparison window, always shown alongside the primary period (§15). */
  compareFrom: string
  compareTo: string
  brand: string[]
  businessUnit: string[]
  productSeriesId: string[]
  productId: string[]
  direction: ('inbound' | 'outbound')[]
  callPurpose: string[]
  campaign: string[]
  leadSource: string[]
  teamId: string[]
  managerName: string[]
  employeeId: string[]
  region: string[]
  state: string[]
  city: string[]
  language: string[]
  customerSegment: string[]
  crmStage: string[]
  callOutcome: string[]
  sentiment: ('positive' | 'neutral' | 'negative')[]
  readiness: ('high' | 'medium' | 'low')[]
  faqId: string[]
  topic: string[]
  objectionId: string[]
  minDurationSec: number | null
  maxDurationSec: number | null
  actionStatus: string[]
  slaStatus: string[]
  complianceFlag: string[]
  /** 'all' includes low-confidence transcripts; default excludes them (§13). */
  confidenceMode: 'analysable_only' | 'all'
  search: string
}

export interface Page<T> {
  rows: T[]
  total: number
  page: number
  pageSize: number
}

export interface SavedView {
  id: string
  name: string
  filters: CallFilters
  createdAt: string
}
