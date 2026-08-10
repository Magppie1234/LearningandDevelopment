/**
 * Sunroof Call Intelligence — alert & escalation rules engine (§10).
 *
 * Every alert carries: severity, subject/customer, owner, reason, evidence,
 * recommended response and a resolution deadline. Nothing is raised without a
 * traceable cause — a rule either finds evidence in the corpus or stays silent.
 *
 * Critical alerts are flagged `requiresManualReview` and must be reviewed by a
 * human before any customer-facing action is taken (§13).
 */

import {
  COMPLIANCE_BY_ID,
  FAQ_BY_ID,
  OBJECTION_BY_ID,
  TEAM_BY_ID,
  THRESHOLDS,
  type ObjectionId,
} from '@/data/call-intelligence/taxonomy'
import { DEMO_NOW } from '@/data/call-intelligence/mock-dataset'
import type { ActionRecord, AlertRecord, AlertRuleId, AlertSeverity, CallRecord } from './types'
import { customerSentimentScore, purchaseReadinessScore } from './scoring'
import { dedupeFaqs } from './metrics'

/** Resolution SLA per severity, in hours (§10). */
export const ALERT_SLA_HOURS: Record<AlertSeverity, number> = {
  critical: 4,
  high: 24,
  medium: 72,
  low: 168,
}

export interface AlertRuleDef {
  id: AlertRuleId
  label: string
  severity: AlertSeverity
  trigger: string
  defaultOwner: string
  recommendedResponse: string
}

/** The full rule catalogue — rendered verbatim on the configuration page. */
export const ALERT_RULES: AlertRuleDef[] = [
  { id: 'legal_threat', label: 'Legal threat', severity: 'critical', trigger: 'Customer references legal action, consumer forum or a lawyer and no escalation was raised on the call.', defaultOwner: 'Head of Customer Service', recommendedResponse: 'Legal + service head to call the customer within 4 hours. Do not respond by template.' },
  { id: 'mis_selling', label: 'Mis-selling / false commitment', severity: 'critical', trigger: 'Agent promised a date, price or specification that policy cannot support.', defaultOwner: 'Compliance Officer', recommendedResponse: 'Review the recording, correct the commitment with the customer in writing, and coach the agent.' },
  { id: 'unapproved_discount', label: 'Unapproved discount', severity: 'critical', trigger: 'A discount above the approved matrix was verbally offered.', defaultOwner: 'Sales Head', recommendedResponse: 'Hold the quotation. Commercial review before anything goes to the customer.' },
  { id: 'sensitive_data', label: 'Sensitive data exposure', severity: 'critical', trigger: 'Card, bank or identity data spoken on a recorded line.', defaultOwner: 'Data Protection Officer', recommendedResponse: 'Redact the recording segment, log the incident, retrain the agent on payment handling.' },
  { id: 'cancellation_refund', label: 'Cancellation / refund indication', severity: 'critical', trigger: 'Customer asked about cancelling or a refund on a booked order.', defaultOwner: 'Head of Customer Service', recommendedResponse: 'Retention call from a manager within 4 hours with a committed resolution date.' },
  { id: 'severe_negative', label: 'Severe-negative customer', severity: 'high', trigger: `Closing customer sentiment score ≤ ${THRESHOLDS.severeNegativeScore}.`, defaultOwner: 'Reporting Manager', recommendedResponse: 'Manager call-back the same day. Acknowledge before solving.' },
  { id: 'unresolved_complaint', label: 'Unresolved complaint', severity: 'high', trigger: 'Complaint logged and the call ended with the customer still negative.', defaultOwner: 'Service Manager', recommendedResponse: 'Assign a named owner and confirm a visit slot with the customer today.' },
  { id: 'repeat_negative', label: 'Repeat-negative customer', severity: 'high', trigger: 'The same customer had ≥ 2 negative calls in the period.', defaultOwner: 'Head of Customer Service', recommendedResponse: 'Senior ownership of the whole relationship, not the individual ticket.' },
  { id: 'high_intent_no_followup', label: 'High-intent customer with no follow-up', severity: 'high', trigger: `Purchase Readiness ≥ ${THRESHOLDS.highIntentScore} and no employee commitment on the call.`, defaultOwner: 'Sales Manager', recommendedResponse: 'Assign an owner and a next step today — this is a live opportunity going cold.' },
  { id: 'commitment_overdue', label: 'Commitment overdue', severity: 'high', trigger: 'A quotation, callback, meeting or site-visit commitment is past its SLA.', defaultOwner: 'Action owner', recommendedResponse: 'Close it today or call the customer to reset expectations honestly.' },
  { id: 'high_value_escalation', label: 'High-value customer escalation', severity: 'high', trigger: 'Verified order value in the top band with negative sentiment on a call.', defaultOwner: 'Business Head', recommendedResponse: 'Senior relationship call within 24 hours.' },
  { id: 'compliance_failure', label: 'Compliance failure (non-critical)', severity: 'medium', trigger: 'Recording disclosure or permission-to-continue missing.', defaultOwner: 'Quality Team', recommendedResponse: 'Add to the agent’s coaching queue; re-check on the next 5 calls.' },
  { id: 'faq_spike', label: 'FAQ spike', severity: 'medium', trigger: `An FAQ rose ≥ ${THRESHOLDS.emergingTrendRise * 100}% versus the comparison period.`, defaultOwner: 'FAQ owner team', recommendedResponse: 'Update the website / script before the volume reaches the contact centre.' },
  { id: 'objection_spike_region', label: 'Objection spike in a region', severity: 'medium', trigger: 'An objection rose sharply within one region above the minimum sample size.', defaultOwner: 'Regional Sales Manager', recommendedResponse: 'Check local pricing, competitor activity and the regional pitch.' },
  { id: 'emerging_unanswered', label: 'Emerging unanswered question', severity: 'medium', trigger: 'An FAQ with a high unanswered rate and no approved knowledge-base article.', defaultOwner: 'Sales Enablement', recommendedResponse: 'Author the knowledge-base article and push it to the agent console.' },
  { id: 'competitor_mentions_rising', label: 'Competitor mentions rising', severity: 'medium', trigger: 'Competitor mentions grew materially versus the comparison period.', defaultOwner: 'Product Marketing', recommendedResponse: 'Refresh the battlecard and brief the field.' },
  { id: 'declining_region_product', label: 'Declining region / product', severity: 'medium', trigger: 'A region or product shows falling sentiment or conversion over a reliable sample.', defaultOwner: 'Business Head', recommendedResponse: 'Regional review: pricing, staffing, competitor pressure, serviceability.' },
  { id: 'low_transcription_confidence', label: 'Low transcription confidence', severity: 'low', trigger: `Transcription confidence below ${THRESHOLDS.minTranscriptConfidence * 100}% on a material share of calls.`, defaultOwner: 'Contact Centre Ops', recommendedResponse: 'Check line quality, headsets and the STT language model for the affected segment.' },
]

export const ALERT_RULE_BY_ID: Record<AlertRuleId, AlertRuleDef> = Object.fromEntries(
  ALERT_RULES.map((r) => [r.id, r]),
) as Record<AlertRuleId, AlertRuleDef>

function deadline(raisedAt: string, severity: AlertSeverity): string {
  return new Date(new Date(raisedAt).getTime() + ALERT_SLA_HOURS[severity] * 3600_000).toISOString()
}

let alertSeq = 0
function mkAlert(
  ruleId: AlertRuleId,
  partial: Omit<AlertRecord, 'id' | 'ruleId' | 'severity' | 'recommendedResponse' | 'resolveBy' | 'requiresManualReview' | 'status' | 'title'>,
): AlertRecord {
  const rule = ALERT_RULE_BY_ID[ruleId]
  alertSeq += 1
  return {
    id: `ALERT-${String(10000 + alertSeq)}`,
    ruleId,
    severity: rule.severity,
    title: rule.label,
    recommendedResponse: rule.recommendedResponse,
    resolveBy: deadline(partial.raisedAt, rule.severity),
    requiresManualReview: rule.severity === 'critical',
    status: 'open',
    ...partial,
  }
}

export interface AlertInput {
  calls: CallRecord[]
  prevCalls: CallRecord[]
  actions: ActionRecord[]
  now?: string
}

export function buildAlerts({ calls, prevCalls, actions, now = DEMO_NOW }: AlertInput): AlertRecord[] {
  alertSeq = 0
  const out: AlertRecord[] = []
  const ownerOf = (c: CallRecord) => TEAM_BY_ID[c.teamId]?.manager ?? 'Unassigned'

  /* ── Call-level rules ───────────────────────────────────────────────── */
  const negativeByCustomer = new Map<string, CallRecord[]>()

  for (const call of calls) {
    const s = customerSentimentScore(call.customerSentiment)
    const readiness = purchaseReadinessScore(call.readinessComponents)

    if (s.band === 'negative') {
      if (!negativeByCustomer.has(call.customerId)) negativeByCustomer.set(call.customerId, [])
      negativeByCustomer.get(call.customerId)!.push(call)
    }

    // Compliance-driven rules, one alert per flag.
    for (const flag of call.complianceFlags) {
      const def = COMPLIANCE_BY_ID[flag]
      if (!def) continue
      const ruleId: AlertRuleId =
        flag === 'unapproved_discount' ? 'unapproved_discount'
          : flag === 'false_commitment' ? 'mis_selling'
            : flag === 'sensitive_data_exposure' ? 'sensitive_data'
              : flag === 'legal_threat_unescalated' ? 'legal_threat'
                : 'compliance_failure'
      out.push(mkAlert(ruleId, {
        subject: call.customerName,
        customerId: call.customerId,
        callId: call.callId,
        ownerName: ALERT_RULE_BY_ID[ruleId].defaultOwner,
        ownerTeamId: call.teamId,
        reason: `${def.label} detected on ${call.callId} (${call.region}, ${ownerOf(call)}’s team). ${def.description}`,
        evidence: call.transcript.length
          ? { turnIndex: call.transcript.at(-1)!.index, timestampSec: call.transcript.at(-1)!.startSec, quote: call.transcript.at(-1)!.text }
          : null,
        evidenceNote: `Compliance flag raised by ${call.modelVersions.extraction}. Confidence ${Math.round(call.extractionConfidence * 100)}%.`,
        raisedAt: call.startedAt,
      }))
    }

    // Severe negative.
    if (s.closing <= THRESHOLDS.severeNegativeScore && call.transcript.length > 2) {
      out.push(mkAlert('severe_negative', {
        subject: call.customerName,
        customerId: call.customerId,
        callId: call.callId,
        ownerName: ownerOf(call),
        ownerTeamId: call.teamId,
        reason: `Closing sentiment score ${s.closing} (opening ${s.opening}, shift ${s.shift}). Text-based sentiment on customer turns only.`,
        evidence: call.transcript.filter((t) => t.speaker === 'customer').sort((a, b) => a.sentiment - b.sentiment)[0]
          ? (() => { const t = call.transcript.filter((x) => x.speaker === 'customer').sort((a, b) => a.sentiment - b.sentiment)[0]; return { turnIndex: t.index, timestampSec: t.startSec, quote: t.translation ?? t.text } })()
          : null,
        evidenceNote: 'Most negative customer turn on the call.',
        raisedAt: call.startedAt,
      }))
    }

    // Unresolved complaint.
    if (call.crm.complaintLogged && call.unresolvedNegative) {
      out.push(mkAlert('unresolved_complaint', {
        subject: call.customerName,
        customerId: call.customerId,
        callId: call.callId,
        ownerName: ownerOf(call),
        ownerTeamId: call.teamId,
        reason: `Complaint logged in the complaint system (severity ${call.crm.complaintSeverity ?? 'unknown'}) and the call ended with the customer still negative.`,
        evidence: call.commitments[0]?.evidence ?? null,
        evidenceNote: 'CRM-verified complaint record combined with closing-third sentiment.',
        raisedAt: call.startedAt,
      }))
    }

    // Cancellation / refund language.
    const refundTurn = call.transcript.find(
      (t) => t.speaker === 'customer' && /cancel|refund/i.test(t.translation ?? t.text),
    )
    if (refundTurn) {
      out.push(mkAlert('cancellation_refund', {
        subject: call.customerName,
        customerId: call.customerId,
        callId: call.callId,
        ownerName: ALERT_RULE_BY_ID.cancellation_refund.defaultOwner,
        ownerTeamId: call.teamId,
        reason: 'Customer explicitly raised cancellation or a refund during the call.',
        evidence: { turnIndex: refundTurn.index, timestampSec: refundTurn.startSec, quote: refundTurn.translation ?? refundTurn.text },
        evidenceNote: 'Verbatim customer turn.',
        raisedAt: call.startedAt,
      }))
    }

    // High intent with no employee commitment.
    if (readiness >= THRESHOLDS.highIntentScore && !call.commitments.some((c) => c.party === 'employee')) {
      out.push(mkAlert('high_intent_no_followup', {
        subject: call.customerName,
        customerId: call.customerId,
        callId: call.callId,
        ownerName: ownerOf(call),
        ownerTeamId: call.teamId,
        reason: `Purchase Readiness ${readiness} with no next step committed by the employee. Readiness is not a conversion forecast — it is a prioritisation signal.`,
        evidence: call.recommendedActions[0]?.evidence ?? null,
        evidenceNote: 'No employee commitment found in the transcript.',
        raisedAt: call.startedAt,
      }))
    }

    // High-value customer with negative sentiment.
    if (call.crm.orderPlaced && (call.crm.orderValueInr ?? 0) >= 1_500_000 && s.band === 'negative') {
      out.push(mkAlert('high_value_escalation', {
        subject: call.customerName,
        customerId: call.customerId,
        callId: call.callId,
        ownerName: ALERT_RULE_BY_ID.high_value_escalation.defaultOwner,
        ownerTeamId: call.teamId,
        reason: `CRM-verified order value ${(call.crm.orderValueInr! / 100000).toFixed(1)}L with negative sentiment on this call.`,
        evidence: null,
        evidenceNote: 'Order value is CRM-verified; sentiment is AI-inferred from transcript text.',
        raisedAt: call.startedAt,
      }))
    }
  }

  /* ── Repeat-negative customers ──────────────────────────────────────── */
  for (const [customerId, rows] of negativeByCustomer.entries()) {
    if (rows.length < 2) continue
    const latest = rows[0]
    out.push(mkAlert('repeat_negative', {
      subject: latest.customerName,
      customerId,
      callId: latest.callId,
      ownerName: ALERT_RULE_BY_ID.repeat_negative.defaultOwner,
      ownerTeamId: latest.teamId,
      reason: `${rows.length} negative calls from this customer in the selected period (${rows.map((r) => r.callId).join(', ')}).`,
      evidence: null,
      evidenceNote: 'Customer-level pattern across calls, not a judgement on any one agent.',
      raisedAt: latest.startedAt,
    }))
  }

  /* ── Overdue commitments ────────────────────────────────────────────── */
  const overdueTypes = new Set(['share_quotation', 'call_back', 'schedule_meeting', 'arrange_site_visit'])
  for (const a of actions) {
    if (a.slaStatus !== 'overdue' || a.origin !== 'committed') continue
    if (!overdueTypes.has(a.actionTypeId)) continue
    out.push(mkAlert('commitment_overdue', {
      subject: a.customerName,
      customerId: a.customerId,
      callId: a.callId,
      ownerName: a.ownerName,
      ownerTeamId: a.teamId,
      reason: `${a.actionTypeId.replace(/_/g, ' ')} was promised and is past its SLA (due ${a.dueAt.slice(0, 16).replace('T', ' ')}).`,
      evidence: a.evidence,
      evidenceNote: 'Commitment extracted from the transcript; SLA from the action-type policy.',
      raisedAt: a.dueAt,
    }))
  }

  /* ── Trend rules (aggregate, not customer-specific) ─────────────────── */
  const nowIso = now

  // FAQ spikes + emerging unanswered questions.
  const faqNow = new Map<string, number>()
  const faqPrev = new Map<string, number>()
  const faqUnanswered = new Map<string, number>()
  for (const c of calls) for (const f of dedupeFaqs(c)) {
    faqNow.set(f.faqId, (faqNow.get(f.faqId) ?? 0) + 1)
    if (f.answerStatus === 'unanswered') faqUnanswered.set(f.faqId, (faqUnanswered.get(f.faqId) ?? 0) + 1)
  }
  for (const c of prevCalls) for (const f of dedupeFaqs(c)) faqPrev.set(f.faqId, (faqPrev.get(f.faqId) ?? 0) + 1)

  for (const [faqId, n] of faqNow.entries()) {
    const prev = faqPrev.get(faqId) ?? 0
    const def = FAQ_BY_ID[faqId as keyof typeof FAQ_BY_ID]
    if (!def) continue
    if (n >= 5 && prev > 0 && (n - prev) / prev >= THRESHOLDS.emergingTrendRise) {
      out.push(mkAlert('faq_spike', {
        subject: def.shortLabel,
        customerId: null,
        callId: null,
        ownerName: def.owner,
        ownerTeamId: null,
        reason: `"${def.standardQuestion}" appeared in ${n} calls this period versus ${prev} last period (+${Math.round(((n - prev) / prev) * 100)}%).`,
        evidence: null,
        evidenceNote: `Deduplicated per call. Denominator: ${calls.length} analysed calls this period, ${prevCalls.length} last period.`,
        raisedAt: nowIso,
      }))
    }
    const unanswered = faqUnanswered.get(faqId) ?? 0
    if (unanswered >= 3 && def.kbArticleId === null) {
      out.push(mkAlert('emerging_unanswered', {
        subject: def.shortLabel,
        customerId: null,
        callId: null,
        ownerName: def.owner,
        ownerTeamId: null,
        reason: `${unanswered} of ${n} calls containing this question went unanswered, and there is no approved knowledge-base article for it.`,
        evidence: null,
        evidenceNote: 'Answer accuracy is deliberately not scored for this FAQ — no approved source of truth exists.',
        raisedAt: nowIso,
      }))
    }
  }

  // Objection spike within a region.
  const regions = Array.from(new Set(calls.map((c) => c.region)))
  for (const region of regions) {
    const nowRows = calls.filter((c) => c.region === region)
    const prevRows = prevCalls.filter((c) => c.region === region)
    if (nowRows.length < THRESHOLDS.minSampleSize) continue
    const countObj = (rows: CallRecord[]) => {
      const m = new Map<ObjectionId, number>()
      for (const c of rows) for (const id of new Set(c.objections.map((o) => o.objectionId))) m.set(id, (m.get(id) ?? 0) + 1)
      return m
    }
    const a = countObj(nowRows)
    const b = countObj(prevRows)
    for (const [id, n] of a.entries()) {
      const prev = b.get(id) ?? 0
      if (n >= 4 && prev > 0 && (n - prev) / prev >= THRESHOLDS.emergingTrendRise) {
        out.push(mkAlert('objection_spike_region', {
          subject: `${OBJECTION_BY_ID[id].label} — ${region}`,
          customerId: null,
          callId: null,
          ownerName: 'Regional Sales Manager',
          ownerTeamId: null,
          reason: `"${OBJECTION_BY_ID[id].label}" appeared in ${n} of ${nowRows.length} ${region} calls, up from ${prev} of ${prevRows.length}.`,
          evidence: null,
          evidenceNote: `Sample size ${nowRows.length} — above the minimum of ${THRESHOLDS.minSampleSize}.`,
          raisedAt: nowIso,
        }))
      }
    }
  }

  // Competitor mentions rising.
  const compNow = calls.reduce((n, c) => n + c.signals.competitorMentions.length, 0)
  const compPrev = prevCalls.reduce((n, c) => n + c.signals.competitorMentions.length, 0)
  if (compNow >= 10 && compPrev > 0 && (compNow - compPrev) / compPrev >= 0.3) {
    out.push(mkAlert('competitor_mentions_rising', {
      subject: 'Competitor mentions across all regions',
      customerId: null,
      callId: null,
      ownerName: 'Product Marketing',
      ownerTeamId: null,
      reason: `${compNow} competitor mentions this period versus ${compPrev} last period (+${Math.round(((compNow - compPrev) / compPrev) * 100)}%).`,
      evidence: null,
      evidenceNote: `Denominator: ${calls.length} analysed calls this period, ${prevCalls.length} last period.`,
      raisedAt: nowIso,
    }))
  }

  // Declining region on sentiment, over a reliable sample only.
  for (const region of regions) {
    const nowRows = calls.filter((c) => c.region === region)
    const prevRows = prevCalls.filter((c) => c.region === region)
    if (nowRows.length < THRESHOLDS.minSampleSize || prevRows.length < THRESHOLDS.minSampleSize) continue
    const avg = (rows: CallRecord[]) => rows.reduce((a, c) => a + customerSentimentScore(c.customerSentiment).overall, 0) / rows.length
    const drop = avg(prevRows) - avg(nowRows)
    if (drop >= 5) {
      out.push(mkAlert('declining_region_product', {
        subject: `${region} region — sentiment decline`,
        customerId: null,
        callId: null,
        ownerName: 'Business Head',
        ownerTeamId: null,
        reason: `Average customer sentiment fell ${drop.toFixed(1)} points (${avg(prevRows).toFixed(1)} → ${avg(nowRows).toFixed(1)}).`,
        evidence: null,
        evidenceNote: `Sample: ${nowRows.length} calls this period, ${prevRows.length} last period — both above the minimum of ${THRESHOLDS.minSampleSize}.`,
        raisedAt: nowIso,
      }))
    }
  }

  // Low transcription confidence as a systemic issue.
  const lowConf = calls.filter((c) => c.transcriptAvailable && c.transcriptionConfidence < THRESHOLDS.minTranscriptConfidence)
  if (lowConf.length >= 5) {
    out.push(mkAlert('low_transcription_confidence', {
      subject: 'Transcription quality',
      customerId: null,
      callId: null,
      ownerName: 'Contact Centre Ops',
      ownerTeamId: null,
      reason: `${lowConf.length} calls fell below the ${THRESHOLDS.minTranscriptConfidence * 100}% confidence threshold and were excluded from management aggregates.`,
      evidence: null,
      evidenceNote: `Affected languages: ${Array.from(new Set(lowConf.map((c) => c.language))).join(', ')}.`,
      raisedAt: nowIso,
    }))
  }

  const order: Record<AlertSeverity, number> = { critical: 0, high: 1, medium: 2, low: 3 }
  return out.sort((a, b) => order[a.severity] - order[b.severity] || b.raisedAt.localeCompare(a.raisedAt))
}

export function alertSummary(alerts: AlertRecord[]) {
  return {
    total: alerts.length,
    critical: alerts.filter((a) => a.severity === 'critical').length,
    high: alerts.filter((a) => a.severity === 'high').length,
    medium: alerts.filter((a) => a.severity === 'medium').length,
    low: alerts.filter((a) => a.severity === 'low').length,
    awaitingReview: alerts.filter((a) => a.requiresManualReview && a.status === 'open').length,
  }
}
