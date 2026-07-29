/**
 * Process Learning Map — turns the raw process flows (BD, Sales, and the
 * 103-step Order-to-Handover journey) into a learning surface. Every stage
 * resolves to an owner department, responsible role, SLA band, risk level,
 * common mistakes, assessment method and linked competencies.
 *
 * Metadata resolves phase defaults first, then per-stage overrides. Both are
 * configurable baselines ("Sample – Requires SME Approval"), never hardcoded
 * operational truth — the approved process owner can edit sequencing and
 * details as the live Process Flow evolves.
 */

import { FLOWS } from './flows'
import type { Flow, FlowStepDef } from './flow-types'
import { COMPETENCIES, type Competency } from './competencies'

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface StageLearning {
  /** Department that owns the stage. */
  department: string
  /** Role responsible for executing it. */
  role: string
  /** Escalation owner when the stage stalls. */
  escalation: string
  /** SLA / TAT expectation (baseline — SME to confirm). */
  sla: string
  risk: RiskLevel
  /** Mistakes learners are trained to avoid at this stage. */
  commonMistakes: string[]
  /** How capability at this stage is assessed. */
  assessmentMethod: string
  /** Operational KPIs the stage feeds. */
  kpis: string[]
  /** Competency IDs from the Competency Dictionary. */
  competencyIds: string[]
}

type PartialLearning = Partial<StageLearning>

/* ── Phase-level defaults, keyed `${flowId}:${phaseName}` ──────────── */

const PHASE_DEFAULTS: Record<string, StageLearning> = {
  'bd:Lead Sources': {
    department: 'Telecalling / Business Development',
    role: 'BD Executive',
    escalation: 'BD Team Lead',
    sla: 'First contact within 24 hours of lead creation',
    risk: 'medium',
    commonMistakes: [
      'Lead not entered in CRM (CRM is the single source of truth)',
      'Wrong lead-source attribution',
      'Duplicate lead not merged',
    ],
    assessmentMethod: 'CRM simulation + disposition-selection scenarios',
    kpis: ['Qualified-lead rate', 'CRM completeness', 'Follow-up compliance'],
    competencyIds: ['business-development-crm-usage', 'business-development-lead-qualification'],
  },
  'bd:Qualification Pipeline': {
    department: 'Telecalling / Business Development',
    role: 'BD Executive',
    escalation: 'BD Team Lead → Sales Manager (Human Intervention Required)',
    sla: 'Disposition updated same day as every call attempt',
    risk: 'high',
    commonMistakes: [
      'Incorrect disposition selected (e.g. Junk vs Will Buy in Future)',
      'Budget and intent not validated before qualifying',
      'Next action / follow-up date missing in CRM notes',
    ],
    assessmentMethod: 'Recorded role-play + call-listening assessment + manager-reviewed live-call sample',
    kpis: ['Qualification accuracy', 'Appointment rate', 'Incorrect-disposition rate', 'Call-quality score'],
    competencyIds: [
      'business-development-lead-qualification',
      'business-development-calling-skills',
      'business-development-crm-usage',
    ],
  },
  'sales:Opportunity Pipeline': {
    department: 'Sales',
    role: 'Sales Manager / Sales Consultant',
    escalation: 'Sales Head',
    sla: 'Stage ageing reviewed weekly; no silent stage beyond 7 days',
    risk: 'high',
    commonMistakes: [
      'Design Form submitted incomplete (missing drawings, ceiling height or zone)',
      'Discount offered outside approved discipline',
      'Handover documents missing at Post-Design handover',
    ],
    assessmentMethod: 'Sales role-play + Design Form simulation + handover-document audit',
    kpis: ['Conversion', 'Proposal accuracy', 'Stage ageing', 'Handover completeness'],
    competencyIds: [],
  },
  'production:Design & Measurement': {
    department: 'Post-Design',
    role: 'Post Designer',
    escalation: 'Design Head',
    sla: 'First measurement within 5 working days of booking payment',
    risk: 'high',
    commonMistakes: [
      'Measurement evidence incomplete (sheet, photos, videos, notes all mandatory)',
      'Revisit reason not recorded from the approved list',
      'Drawing version confusion — unsigned drawings sent to factory',
    ],
    assessmentMethod: 'Measurement exercise + drawing review + handover-readiness checklist',
    kpis: ['Measurement accuracy', 'Revisit rate', 'Approval-cycle time', 'Factory-handover readiness'],
    competencyIds: [],
  },
  'production:Procurement & Inventory': {
    department: 'Planning / Purchase / Store',
    role: 'Planner, Purchase Executive, Store In-Charge',
    escalation: 'Factory Head',
    sla: 'BOM validated within 2 working days of factory order receipt',
    risk: 'high',
    commonMistakes: [
      'BOM released without stock reservation',
      'GRN treated as QC approval — stock booked before the QC decision',
      'Shortage list raised without checking committed stock',
    ],
    assessmentMethod: 'Decision-matrix case + material inspection + document audit',
    kpis: ['BOM accuracy', 'Material availability', 'Vendor OTIF', 'Rejection/return rate'],
    competencyIds: [],
  },
  'production:Production': {
    department: 'Production',
    role: 'Production Supervisor / Machine Operators',
    escalation: 'Factory Head',
    sla: 'Plan adherence tracked per shift',
    risk: 'critical',
    commonMistakes: [
      'Skipping first-piece approval before batch runs',
      'Rework not routed through re-inspection',
      'Unsafe material handling around stone slabs',
    ],
    assessmentMethod: 'Observed practical assessment on every critical criterion + in-process checks',
    kpis: ['First-pass yield', 'Scrap', 'Rework', 'Plan adherence', 'Safety observations'],
    competencyIds: [],
  },
  'production:Packing & Dispatch': {
    department: 'Dispatch',
    role: 'Packing Team / Dispatch Coordinator',
    escalation: 'Factory Head',
    sla: 'Dispatch within the planned window; challan before vehicle release',
    risk: 'medium',
    commonMistakes: [
      'Box mapping mismatch — modules unmapped to delivery sets',
      'Dispatch without approval or challan',
      'Hardware kits packed incomplete',
    ],
    assessmentMethod: 'Packing checklist observation + documentation audit',
    kpis: ['On-time & complete dispatch', 'Packing accuracy', 'Damage/shortage rate', 'POD completeness'],
    competencyIds: [],
  },
  'production:Installation & Handover': {
    department: 'Installation',
    role: 'Installation Manager',
    escalation: 'Service Head',
    sla: 'Snag closure before customer inspection; no handover with open snags',
    risk: 'critical',
    commonMistakes: [
      'Installation started before site-readiness confirmation',
      'Snags closed verbally without evidence',
      'Handover documentation incomplete at sign-off',
    ],
    assessmentMethod: 'Site observation + photo/video evidence + handover simulation',
    kpis: ['Schedule adherence', 'Snag-closure time', 'Handover quality', 'Customer satisfaction'],
    competencyIds: [],
  },
}

/* ── Stage-level overrides, keyed `${flowId}:${stage title}` ───────── */

const STAGE_OVERRIDES: Record<string, PartialLearning> = {
  'bd:Lead Qualified': {
    risk: 'critical',
    commonMistakes: [
      'Value by BD (in lakhs) not recorded',
      'Client type missing',
      'Qualification evidence absent — budget, intent and drawing requirement unvalidated',
    ],
    kpis: ['Qualification accuracy', 'Qualified-lead rate'],
  },
  'sales:Design Form': {
    risk: 'critical',
    commonMistakes: [
      'Drawings or video files not uploaded',
      'Ceiling height / zone / area left blank',
      'Form submitted without completeness validation',
    ],
    assessmentMethod: 'Design Form simulation scored on completeness and quality',
  },
  'sales:Principally Closed': {
    risk: 'critical',
    commonMistakes: ['Final opportunity value missing', 'Expected closure date not committed', 'Approval documentation incomplete'],
  },
  'sales:Closure': {
    risk: 'critical',
    commonMistakes: ['Payment received amount unrecorded', 'Estimate not approved before closure'],
    kpis: ['Conversion', 'Discount compliance', 'Forecast accuracy'],
  },
  'sales:Handover to Post Design': {
    risk: 'critical',
    commonMistakes: [
      'Any of the four mandatory documents missing (Order Closure Form, Signed Estimate, Signed Drawings, Payment Confirmation)',
      'Site in-charge contact details incomplete',
    ],
    assessmentMethod: 'Handover-document audit — all mandatory documents verified',
    kpis: ['Handover completeness'],
  },
  'production:First Measurement Done': {
    risk: 'critical',
    commonMistakes: ['Any of the four evidence items missing (sheet, photos, videos, notes)'],
    assessmentMethod: 'Practical measurement exercise with full evidence capture',
  },
  'production:QC Decision Matrix': {
    department: 'Quality Control',
    role: 'QC Inspector',
    escalation: 'Factory Head + Purchase (on rejection)',
    risk: 'critical',
    commonMistakes: [
      'Accepting material without recording the decision path (warning / debit note / return / reorder)',
      'Skipping repeat incoming QC on replacement material',
    ],
    assessmentMethod: 'Decision-matrix case study + observed inspection',
    kpis: ['Defect detection', 'Defect escape', 'Inspection TAT'],
  },
  'production:Internal Production QC': {
    department: 'Quality Control',
    role: 'QC Inspector',
    escalation: 'Factory Head',
    risk: 'critical',
    commonMistakes: ['Approving after rework without re-inspection', 'Hold/scrap decisions not traceable'],
    assessmentMethod: 'Image-based defect identification + observed inspection',
    kpis: ['First-pass quality', 'Repeat defects', 'Rework and scrap'],
  },
  'production:Snag Closure': {
    risk: 'critical',
    commonMistakes: ['Closing snags without customer-visible evidence', 'New snags found at final inspection left unlogged'],
  },
  'production:Customer Sign-Off': {
    risk: 'critical',
    commonMistakes: ['Sign-off collected with pending commitments undocumented'],
    kpis: ['Handover quality', 'Customer satisfaction'],
  },
}

/* ── Resolution ────────────────────────────────────────────────────── */

const FALLBACK: StageLearning = {
  department: 'To be assigned',
  role: 'To be assigned',
  escalation: 'Department Head',
  sla: 'To be defined by process owner',
  risk: 'medium',
  commonMistakes: [],
  assessmentMethod: 'Knowledge check',
  kpis: [],
  competencyIds: [],
}

function phaseNameFor(flow: Flow, stepIndex: number): string {
  const step = stepIndex + 1
  const phase = flow.phases.find((p) => step >= p.start && step <= p.start + p.count - 1)
  return phase?.name ?? flow.phases[0]?.name ?? ''
}

/** Resolve the learning metadata for a stage: phase defaults + overrides. */
export function getStageLearning(flow: Flow, stepIndex: number): StageLearning {
  const base = PHASE_DEFAULTS[`${flow.id}:${phaseNameFor(flow, stepIndex)}`] ?? FALLBACK
  const override = STAGE_OVERRIDES[`${flow.id}:${flow.steps[stepIndex]?.t}`]
  return override ? { ...base, ...override } : base
}

export function competenciesFor(learning: StageLearning): Competency[] {
  return learning.competencyIds
    .map((id) => COMPETENCIES.find((c) => c.id === id))
    .filter((c): c is Competency => Boolean(c))
}

export interface MapStage {
  flow: Flow
  step: FlowStepDef
  index: number
  phaseName: string
  phaseColor: string
  learning: StageLearning
}

/** Flatten a flow into map stages with resolved learning metadata. */
export function stagesOf(flow: Flow): MapStage[] {
  return flow.steps.map((step, index) => {
    const stepNo = index + 1
    const phase =
      flow.phases.find((p) => stepNo >= p.start && stepNo <= p.start + p.count - 1) ?? flow.phases[0]
    return {
      flow,
      step,
      index,
      phaseName: phase?.name ?? '',
      phaseColor: phase?.color ?? '#B0562A',
      learning: getStageLearning(flow, index),
    }
  })
}

export const MAP_FLOWS = FLOWS
