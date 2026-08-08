/**
 * Sunroof Call Intelligence — controlled vocabularies.
 *
 * Every extracted insight in the product resolves to an id in this file. The
 * taxonomy is versioned (TAXONOMY_VERSION) and stamped onto every extraction so
 * a number computed under v1.0.0 is never silently mixed with v1.1.0 output.
 *
 * Nothing here is inferred at runtime. If a conversation does not map to a
 * known id, the extractor must emit `unknown` — never a guess (§13).
 */

export const TAXONOMY_VERSION = '1.0.0'

/** Model provenance shown on the Data Quality page and stamped per record. */
export const MODEL_VERSIONS = {
  transcription: 'stt-diarised-v2.4',
  sentiment: 'text-sentiment-v1.3 (transcript-only)',
  extraction: 'convo-extract-v1.1',
  scoring: 'scoring-rules-v1.0.0',
} as const

/* ────────────────────────────────────────────────────────────────────────────
 * FAQ taxonomy (§4)
 * ────────────────────────────────────────────────────────────────────────── */

export type FaqCategoryId =
  | 'pricing_discounts'
  | 'features_benefits'
  | 'series_comparison'
  | 'customisation'
  | 'design_drawings_measurement'
  | 'installation_process'
  | 'delivery_timeline'
  | 'warranty_amc'
  | 'service_complaint'
  | 'payment_finance'
  | 'product_quality'
  | 'serviceable_locations'
  | 'competitor_comparison'
  | 'documents_process'
  | 'availability'
  | 'technical_specs'

export interface FaqCategory {
  id: FaqCategoryId
  /** The standardised question shown in management views. */
  standardQuestion: string
  shortLabel: string
  /** Which team is accountable for closing the knowledge gap. */
  owner: string
  /** Does an approved knowledge-base article exist? Gates accuracy scoring (§4). */
  kbArticleId: string | null
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: 'pricing_discounts',
    standardQuestion: 'What does a Sunroof kitchen cost, and what discount can I get?',
    shortLabel: 'Pricing & discounts',
    owner: 'Sales Enablement',
    kbArticleId: 'KB-PRICE-01',
  },
  {
    id: 'features_benefits',
    standardQuestion: 'What is engineered stone and why is it better than what I have now?',
    shortLabel: 'Features & benefits',
    owner: 'Product Marketing',
    kbArticleId: 'KB-PROD-04',
  },
  {
    id: 'series_comparison',
    standardQuestion: 'What is the difference between the product series?',
    shortLabel: 'Series comparison',
    owner: 'Product Marketing',
    kbArticleId: 'KB-PROD-09',
  },
  {
    id: 'customisation',
    standardQuestion: 'Can the kitchen be customised to my layout and finishes?',
    shortLabel: 'Customisation',
    owner: 'Design Studio',
    kbArticleId: 'KB-DES-02',
  },
  {
    id: 'design_drawings_measurement',
    standardQuestion: 'How do design, drawings and site measurement work?',
    shortLabel: 'Design, drawings & measurement',
    owner: 'Design Studio',
    kbArticleId: 'KB-DES-07',
  },
  {
    id: 'installation_process',
    standardQuestion: 'How is the kitchen installed and how long does installation take?',
    shortLabel: 'Installation process',
    owner: 'Projects',
    kbArticleId: 'KB-INS-01',
  },
  {
    id: 'delivery_timeline',
    standardQuestion: 'How long from order to handover?',
    shortLabel: 'Delivery & timeline',
    owner: 'Projects',
    kbArticleId: 'KB-INS-05',
  },
  {
    id: 'warranty_amc',
    standardQuestion: 'What warranty do I get and is there an AMC?',
    shortLabel: 'Warranty & AMC',
    owner: 'Customer Service',
    kbArticleId: 'KB-SVC-03',
  },
  {
    id: 'service_complaint',
    standardQuestion: 'How do I raise a service request or complaint after handover?',
    shortLabel: 'Service & complaints',
    owner: 'Customer Service',
    kbArticleId: 'KB-SVC-01',
  },
  {
    id: 'payment_finance',
    standardQuestion: 'What is the payment schedule and is EMI / finance available?',
    shortLabel: 'Payment & finance',
    owner: 'Finance',
    // No approved article yet — accuracy must NOT be scored for this FAQ (§4).
    kbArticleId: null,
  },
  {
    id: 'product_quality',
    standardQuestion: 'Will the stone chip, stain or discolour over time?',
    shortLabel: 'Product quality',
    owner: 'Quality',
    kbArticleId: 'KB-QC-02',
  },
  {
    id: 'serviceable_locations',
    standardQuestion: 'Do you deliver and install in my city?',
    shortLabel: 'Serviceable locations',
    owner: 'Projects',
    kbArticleId: 'KB-OPS-06',
  },
  {
    id: 'competitor_comparison',
    standardQuestion: 'How do you compare with other modular kitchen brands?',
    shortLabel: 'Competitor comparison',
    owner: 'Sales Enablement',
    kbArticleId: null,
  },
  {
    id: 'documents_process',
    standardQuestion: 'What documents and approvals are needed to book?',
    shortLabel: 'Documents & process',
    owner: 'Sales Operations',
    kbArticleId: 'KB-OPS-01',
  },
  {
    id: 'availability',
    standardQuestion: 'Is the finish / model I want available right now?',
    shortLabel: 'Availability',
    owner: 'Supply Chain',
    kbArticleId: 'KB-OPS-11',
  },
  {
    id: 'technical_specs',
    standardQuestion: 'What are the technical specifications — thickness, hinges, load, joints?',
    shortLabel: 'Technical specifications',
    owner: 'Product Engineering',
    kbArticleId: 'KB-PROD-12',
  },
]

export const FAQ_BY_ID: Record<FaqCategoryId, FaqCategory> = Object.fromEntries(
  FAQ_CATEGORIES.map((f) => [f.id, f]),
) as Record<FaqCategoryId, FaqCategory>

/* ────────────────────────────────────────────────────────────────────────────
 * Objection taxonomy (§6)
 * ────────────────────────────────────────────────────────────────────────── */

export type ObjectionId =
  | 'price_discount'
  | 'budget'
  | 'timing'
  | 'product_suitability'
  | 'product_quality'
  | 'trust'
  | 'installation'
  | 'warranty_service'
  | 'competitor_preference'
  | 'decision_maker_unavailable'
  | 'serviceability'
  | 'payment_terms'
  | 'not_interested'

export interface ObjectionType {
  id: ObjectionId
  label: string
  /** Coaching family — used to group the objection-handling playbook. */
  family: 'commercial' | 'product' | 'confidence' | 'process'
}

export const OBJECTIONS: ObjectionType[] = [
  { id: 'price_discount', label: 'Price / discount', family: 'commercial' },
  { id: 'budget', label: 'Budget', family: 'commercial' },
  { id: 'timing', label: 'Timing', family: 'process' },
  { id: 'product_suitability', label: 'Product suitability', family: 'product' },
  { id: 'product_quality', label: 'Product quality', family: 'product' },
  { id: 'trust', label: 'Trust', family: 'confidence' },
  { id: 'installation', label: 'Installation', family: 'process' },
  { id: 'warranty_service', label: 'Warranty / service', family: 'confidence' },
  { id: 'competitor_preference', label: 'Competitor preference', family: 'confidence' },
  { id: 'decision_maker_unavailable', label: 'Decision-maker unavailable', family: 'process' },
  { id: 'serviceability', label: 'Serviceability', family: 'process' },
  { id: 'payment_terms', label: 'Payment terms', family: 'commercial' },
  { id: 'not_interested', label: 'Not interested', family: 'confidence' },
]

export const OBJECTION_BY_ID: Record<ObjectionId, ObjectionType> = Object.fromEntries(
  OBJECTIONS.map((o) => [o.id, o]),
) as Record<ObjectionId, ObjectionType>

/** Recognised objection-handling techniques (for coaching, not scoring alone). */
export const OBJECTION_TECHNIQUES = [
  'Acknowledge & clarify',
  'Feel-felt-found',
  'Value reframe',
  'Evidence / proof point',
  'Comparison table',
  'Trial close',
  'Escalate to specialist',
  'No technique detected',
] as const
export type ObjectionTechnique = (typeof OBJECTION_TECHNIQUES)[number]

/* ────────────────────────────────────────────────────────────────────────────
 * Next actions (§9)
 * ────────────────────────────────────────────────────────────────────────── */

export type ActionTypeId =
  | 'call_back'
  | 'send_catalogue'
  | 'share_quotation'
  | 'schedule_meeting'
  | 'schedule_demo'
  | 'arrange_site_visit'
  | 'share_design'
  | 'arrange_measurement'
  | 'technical_clarification'
  | 'payment_followup'
  | 'escalate_complaint'
  | 'assign_specialist'
  | 'nurture'
  | 'disqualify_after_approval'

export interface ActionType {
  id: ActionTypeId
  label: string
  /** SLA in hours from call end — drives the SLA status shown in the tracker. */
  slaHours: number
  defaultChannel: 'Phone' | 'WhatsApp' | 'Email' | 'In person'
  /** True = a human must approve before the action can execute (§9). */
  requiresApproval: boolean
}

export const ACTION_TYPES: ActionType[] = [
  { id: 'call_back', label: 'Call back', slaHours: 24, defaultChannel: 'Phone', requiresApproval: false },
  { id: 'send_catalogue', label: 'Send catalogue / brochure', slaHours: 24, defaultChannel: 'WhatsApp', requiresApproval: false },
  { id: 'share_quotation', label: 'Share quotation', slaHours: 48, defaultChannel: 'Email', requiresApproval: false },
  { id: 'schedule_meeting', label: 'Schedule meeting', slaHours: 48, defaultChannel: 'Phone', requiresApproval: false },
  { id: 'schedule_demo', label: 'Schedule demonstration', slaHours: 72, defaultChannel: 'Phone', requiresApproval: false },
  { id: 'arrange_site_visit', label: 'Arrange site visit', slaHours: 72, defaultChannel: 'Phone', requiresApproval: false },
  { id: 'share_design', label: 'Share design / drawings', slaHours: 96, defaultChannel: 'Email', requiresApproval: false },
  { id: 'arrange_measurement', label: 'Arrange measurement', slaHours: 72, defaultChannel: 'Phone', requiresApproval: false },
  { id: 'technical_clarification', label: 'Provide technical clarification', slaHours: 48, defaultChannel: 'Phone', requiresApproval: false },
  { id: 'payment_followup', label: 'Follow up on payment', slaHours: 48, defaultChannel: 'Phone', requiresApproval: false },
  { id: 'escalate_complaint', label: 'Escalate complaint', slaHours: 8, defaultChannel: 'Phone', requiresApproval: false },
  { id: 'assign_specialist', label: 'Assign a specialist', slaHours: 24, defaultChannel: 'In person', requiresApproval: true },
  { id: 'nurture', label: 'Nurture the customer', slaHours: 336, defaultChannel: 'WhatsApp', requiresApproval: false },
  { id: 'disqualify_after_approval', label: 'Disqualify the lead (after approval)', slaHours: 120, defaultChannel: 'Phone', requiresApproval: true },
]

export const ACTION_TYPE_BY_ID: Record<ActionTypeId, ActionType> = Object.fromEntries(
  ACTION_TYPES.map((a) => [a.id, a]),
) as Record<ActionTypeId, ActionType>

/* ────────────────────────────────────────────────────────────────────────────
 * Compliance & risk flags (§7, §10)
 * ────────────────────────────────────────────────────────────────────────── */

export type ComplianceFlagId =
  | 'unapproved_discount'
  | 'false_commitment'
  | 'missing_disclosure'
  | 'sensitive_data_exposure'
  | 'no_permission_to_continue'
  | 'legal_threat_unescalated'

export interface ComplianceFlag {
  id: ComplianceFlagId
  label: string
  /** Critical failures are reported separately, never averaged into quality (§7). */
  critical: boolean
  description: string
}

export const COMPLIANCE_FLAGS: ComplianceFlag[] = [
  {
    id: 'unapproved_discount',
    label: 'Unapproved discount offered',
    critical: true,
    description: 'A discount beyond the approved matrix was verbally offered on the call.',
  },
  {
    id: 'false_commitment',
    label: 'Mis-selling / false commitment',
    critical: true,
    description: 'A delivery date, specification or benefit was promised that policy cannot support.',
  },
  {
    id: 'sensitive_data_exposure',
    label: 'Sensitive data spoken aloud',
    critical: true,
    description: 'Card, bank or identity data was read out on a recorded line.',
  },
  {
    id: 'legal_threat_unescalated',
    label: 'Legal threat not escalated',
    critical: true,
    description: 'Customer referenced legal / consumer-forum action and no escalation was raised.',
  },
  {
    id: 'missing_disclosure',
    label: 'Recording disclosure missing',
    critical: false,
    description: 'The call-recording disclosure was not detected in the opening.',
  },
  {
    id: 'no_permission_to_continue',
    label: 'No permission to continue',
    critical: false,
    description: 'The agent did not ask whether it was a convenient time to talk.',
  },
]

export const COMPLIANCE_BY_ID: Record<ComplianceFlagId, ComplianceFlag> = Object.fromEntries(
  COMPLIANCE_FLAGS.map((c) => [c.id, c]),
) as Record<ComplianceFlagId, ComplianceFlag>

/* ────────────────────────────────────────────────────────────────────────────
 * Organisation & commercial reference data
 * ────────────────────────────────────────────────────────────────────────── */

export interface Geo {
  region: string
  state: string
  city: string
  pincode: string
}

/** CRM geography. Never inferred from language, accent or name (§5). */
export const GEOS: Geo[] = [
  { region: 'North', state: 'Delhi', city: 'New Delhi', pincode: '110024' },
  { region: 'North', state: 'Haryana', city: 'Gurugram', pincode: '122002' },
  { region: 'North', state: 'Uttar Pradesh', city: 'Noida', pincode: '201301' },
  { region: 'North', state: 'Punjab', city: 'Chandigarh', pincode: '160017' },
  { region: 'West', state: 'Maharashtra', city: 'Mumbai', pincode: '400058' },
  { region: 'West', state: 'Maharashtra', city: 'Pune', pincode: '411045' },
  { region: 'West', state: 'Gujarat', city: 'Ahmedabad', pincode: '380015' },
  { region: 'South', state: 'Karnataka', city: 'Bengaluru', pincode: '560066' },
  { region: 'South', state: 'Telangana', city: 'Hyderabad', pincode: '500081' },
  { region: 'South', state: 'Tamil Nadu', city: 'Chennai', pincode: '600096' },
  { region: 'South', state: 'Kerala', city: 'Kochi', pincode: '682024' },
  { region: 'East', state: 'West Bengal', city: 'Kolkata', pincode: '700091' },
  // Deliberately tiny sample — exercises the minimum-sample-size rule (§5).
  { region: 'East', state: 'Odisha', city: 'Bhubaneswar', pincode: '751024' },
]

export const REGIONS = ['North', 'West', 'South', 'East'] as const
export type RegionName = (typeof REGIONS)[number]

export interface ProductSeries {
  id: string
  name: string
  /** Indicative ticket band in INR — used only for CRM-verified order values. */
  band: [number, number]
}

export const PRODUCT_SERIES: ProductSeries[] = [
  { id: 'signature', name: 'Signature Series', band: [1_400_000, 3_200_000] },
  { id: 'urban', name: 'Urban Series', band: [750_000, 1_500_000] },
  { id: 'essential', name: 'Essential Series', band: [420_000, 800_000] },
  { id: 'wardrobe', name: 'Wardrobe & Storage', band: [180_000, 620_000] },
]

export const PRODUCTS: { id: string; name: string; seriesId: string }[] = [
  { id: 'sig-island', name: 'Signature Island Kitchen', seriesId: 'signature' },
  { id: 'sig-lshape', name: 'Signature L-Shaped Kitchen', seriesId: 'signature' },
  { id: 'urb-parallel', name: 'Urban Parallel Kitchen', seriesId: 'urban' },
  { id: 'urb-lshape', name: 'Urban L-Shaped Kitchen', seriesId: 'urban' },
  { id: 'ess-straight', name: 'Essential Straight Kitchen', seriesId: 'essential' },
  { id: 'ess-ushape', name: 'Essential U-Shaped Kitchen', seriesId: 'essential' },
  { id: 'wdr-sliding', name: 'Sliding Wardrobe', seriesId: 'wardrobe' },
  { id: 'wdr-walkin', name: 'Walk-in Wardrobe', seriesId: 'wardrobe' },
]

export interface Team {
  id: string
  name: string
  manager: string
  businessUnit: 'Retail Sales' | 'Customer Service'
}

export const TEAMS: Team[] = [
  { id: 'team-north-sales', name: 'North Sales', manager: 'Ritika Malhotra', businessUnit: 'Retail Sales' },
  { id: 'team-west-sales', name: 'West Sales', manager: 'Ameya Kulkarni', businessUnit: 'Retail Sales' },
  { id: 'team-south-sales', name: 'South Sales', manager: 'Deepak Iyer', businessUnit: 'Retail Sales' },
  { id: 'team-service', name: 'Customer Service Desk', manager: 'Farah Qureshi', businessUnit: 'Customer Service' },
]

export interface Employee {
  id: string
  name: string
  teamId: string
  role: 'Sales Consultant' | 'Senior Consultant' | 'Service Executive'
  /** Tenure in months — context for coaching, never an input to any score. */
  tenureMonths: number
}

export const EMPLOYEES: Employee[] = [
  { id: 'emp-01', name: 'Aarav Sharma', teamId: 'team-north-sales', role: 'Senior Consultant', tenureMonths: 34 },
  { id: 'emp-02', name: 'Nisha Verma', teamId: 'team-north-sales', role: 'Sales Consultant', tenureMonths: 11 },
  { id: 'emp-03', name: 'Karan Bhatia', teamId: 'team-north-sales', role: 'Sales Consultant', tenureMonths: 5 },
  { id: 'emp-04', name: 'Sneha Deshmukh', teamId: 'team-west-sales', role: 'Senior Consultant', tenureMonths: 41 },
  { id: 'emp-05', name: 'Rohit Pawar', teamId: 'team-west-sales', role: 'Sales Consultant', tenureMonths: 18 },
  { id: 'emp-06', name: 'Priya Nair', teamId: 'team-south-sales', role: 'Senior Consultant', tenureMonths: 27 },
  { id: 'emp-07', name: 'Vikram Reddy', teamId: 'team-south-sales', role: 'Sales Consultant', tenureMonths: 8 },
  { id: 'emp-08', name: 'Ananya Krishnamurthy', teamId: 'team-south-sales', role: 'Sales Consultant', tenureMonths: 3 },
  { id: 'emp-09', name: 'Imran Sheikh', teamId: 'team-service', role: 'Service Executive', tenureMonths: 22 },
  { id: 'emp-10', name: 'Meera Joshi', teamId: 'team-service', role: 'Service Executive', tenureMonths: 14 },
]

export const EMPLOYEE_BY_ID: Record<string, Employee> = Object.fromEntries(
  EMPLOYEES.map((e) => [e.id, e]),
)
export const TEAM_BY_ID: Record<string, Team> = Object.fromEntries(TEAMS.map((t) => [t.id, t]))

export const LANGUAGES = ['Hindi', 'English', 'Marathi', 'Tamil', 'Telugu', 'Bengali', 'Unknown'] as const
export type Language = (typeof LANGUAGES)[number]

export const CAMPAIGNS = [
  'Festive Kitchen 2026',
  'Meta Lead Gen — Metro',
  'Google Search — Modular Kitchen',
  'Architect Referral Programme',
  'Showroom Walk-in',
  'Not attributed',
] as const
export type Campaign = (typeof CAMPAIGNS)[number]

export const LEAD_SOURCES = ['Digital', 'Referral', 'Walk-in', 'Channel partner', 'Repeat customer'] as const
export type LeadSource = (typeof LEAD_SOURCES)[number]

export const CRM_STAGES = ['New', 'Contacted', 'Qualified', 'Design', 'Quotation', 'Negotiation', 'Won', 'Lost'] as const
export type CrmStage = (typeof CRM_STAGES)[number]

export const CUSTOMER_SEGMENTS = ['Homeowner', 'Builder / Developer', 'Architect / Designer', 'Repeat customer', 'Unknown'] as const
export type CustomerSegment = (typeof CUSTOMER_SEGMENTS)[number]

export const CALL_PURPOSES = [
  'New enquiry',
  'Follow-up',
  'Design discussion',
  'Quotation discussion',
  'Payment follow-up',
  'Service / complaint',
  'Post-handover check-in',
] as const
export type CallPurpose = (typeof CALL_PURPOSES)[number]

export const CALL_OUTCOMES = [
  'Meaningful conversation',
  'Information shared',
  'Follow-up scheduled',
  'Site visit booked',
  'Quotation requested',
  'Complaint logged',
  'Not connected',
  'Wrong number',
  'Call dropped',
] as const
export type CallOutcome = (typeof CALL_OUTCOMES)[number]

/** Outcomes that count as a connected, meaningful conversation (§2 KPI). */
export const MEANINGFUL_OUTCOMES: readonly CallOutcome[] = [
  'Meaningful conversation',
  'Information shared',
  'Follow-up scheduled',
  'Site visit booked',
  'Quotation requested',
  'Complaint logged',
]

export const COMPETITORS = ['Sleek', 'Häcker', 'Godrej Interio', 'Local carpenter', 'Livspace', 'Hettich-based local'] as const

/* ────────────────────────────────────────────────────────────────────────────
 * Thresholds — every rule the dashboard applies, in one auditable place.
 * ────────────────────────────────────────────────────────────────────────── */

export const THRESHOLDS = {
  /** Transcripts below this confidence are excluded from management aggregates (§13). */
  minTranscriptConfidence: 0.7,
  /** Diarisation below this is not trustworthy enough for talk-ratio metrics (§8). */
  minDiarisationConfidence: 0.75,
  /** A region/segment below this call count is shown as "low sample" (§5). */
  minSampleSize: 20,
  /** Purchase Readiness ≥ this is treated as "high intent" (§7). */
  highIntentScore: 70,
  /** Customer sentiment score ≤ this at close is "severe negative" (§10). */
  severeNegativeScore: 25,
  /** Agent quality below this triggers a coaching recommendation (§8). */
  coachingQualityScore: 65,
  /** Period-over-period rise in an FAQ/objection that raises a trend alert (§10). */
  emergingTrendRise: 0.5,
} as const

/** Minimum-sample confidence label used wherever a rate is shown (§5, §15). */
export function sampleConfidence(n: number): {
  level: 'reliable' | 'indicative' | 'low'
  label: string
} {
  if (n >= THRESHOLDS.minSampleSize * 3) return { level: 'reliable', label: 'Reliable' }
  if (n >= THRESHOLDS.minSampleSize) return { level: 'indicative', label: 'Indicative' }
  return { level: 'low', label: 'Low sample — not a trend' }
}
