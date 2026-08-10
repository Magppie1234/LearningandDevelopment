'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Headphones, Languages } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Button,
  Card,
  ErrorState,
  LoadingRows,
  Notice,
  PageHeader,
  Section,
  StatusBadge,
  type Tone,
} from '@/components/ds'
import { useCi } from './CiContext'
import {
  AiGeneratedNote,
  ConfidenceChip,
  EvidenceLink,
  formatTimestamp,
  MethodDisclosure,
  NotMeasurable,
  NotMentioned,
  ProvenanceBadge,
  TextSentimentCaveat,
} from './CiPrimitives'
import { CompositionBar } from './CiCharts'
import { getCall } from '@/lib/call-intelligence/service'
import {
  agentQualityScore,
  coachingPoints,
  customerSentimentScore,
  purchaseReadinessScore,
  readinessBand,
  READINESS_WEIGHTS,
} from '@/lib/call-intelligence/scoring'
import { buildActions } from '@/lib/call-intelligence/actions'
import { can } from '@/lib/call-intelligence/rbac'
import type { CallRecord } from '@/lib/call-intelligence/types'
import {
  ACTION_TYPE_BY_ID,
  COMPLIANCE_BY_ID,
  EMPLOYEE_BY_ID,
  FAQ_BY_ID,
  OBJECTION_BY_ID,
  TEAM_BY_ID,
} from '@/data/call-intelligence/taxonomy'

/**
 * Call detail — where every AI claim on every other page has to be defensible.
 *
 * The layout is deliberately two-column: the transcript on the left, the
 * extraction on the right, and each extracted item links to the turn that
 * produced it. Clicking an insight scrolls and highlights the actual sentence
 * (§13). If a claim cannot point at a turn, it does not appear here at all.
 */

const ANSWER_TONE: Record<string, Tone> = {
  fully_answered: 'success',
  partially_answered: 'warning',
  unanswered: 'danger',
}

const RESOLUTION_TONE: Record<string, Tone> = {
  resolved: 'success',
  partially_resolved: 'warning',
  unresolved: 'danger',
}

export default function CallDetail({ callId }: { callId: string }) {
  const { viewer, hrefWithFilters } = useCi()
  const searchParams = useSearchParams()
  const focusTurn = Number(searchParams?.get('turn') ?? NaN)

  const [call, setCall] = useState<CallRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showTranslation, setShowTranslation] = useState(true)
  const [activeTurn, setActiveTurn] = useState<number | null>(
    Number.isFinite(focusTurn) ? focusTurn : null,
  )
  const turnRefs = useRef<Record<number, HTMLLIElement | null>>({})

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getCall(callId, viewer)
      .then((c) => {
        if (!cancelled) setCall(c)
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [callId, viewer])

  // Deep links from every other page land on a specific turn.
  useEffect(() => {
    if (activeTurn === null || !call) return
    const el = turnRefs.current[activeTurn]
    if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [activeTurn, call])

  const actions = useMemo(() => (call ? buildActions([call]) : []), [call])

  if (loading) return <LoadingRows rows={8} />
  if (error) return <ErrorState message={error} />
  if (!call) {
    return (
      <Notice tone="warning">
        <strong>Call not found, or not visible to your role.</strong> Row-level scoping is applied
        before anything is returned, so a call outside your team simply does not exist for you.{' '}
        <Link href="/call-intelligence/explorer" className="underline font-medium">
          Back to Call Explorer
        </Link>
      </Notice>
    )
  }

  const sentiment = customerSentimentScore(call.customerSentiment)
  const readiness = purchaseReadinessScore(call.readinessComponents)
  const quality = call.transcript.length > 2 ? agentQualityScore(call) : null
  const coaching = call.transcript.length > 2 ? coachingPoints(call) : []
  const employee = EMPLOYEE_BY_ID[call.employeeId]
  const hasTranslations = call.transcript.some((t) => t.translation)

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Call ${call.callId}`}
        description={`${call.customerName} · ${employee?.name ?? call.employeeId} (${TEAM_BY_ID[call.teamId]?.name ?? call.teamId}) · ${call.city}, ${call.region} · ${call.language}`}
        actions={
          <Button
            href={hrefWithFilters('/call-intelligence/explorer')}
            variant="secondary"
            size="sm"
            icon={ArrowLeft}
          >
            Back to Call Explorer
          </Button>
        }
      />

      {!call.transcriptAvailable && (
        <Notice tone="danger">
          <strong>Transcription failed for this call.</strong> No extraction was attempted, and the
          call is excluded from every management aggregate. It is counted in the coverage
          denominator on Data Quality so the failure is visible rather than silently dropped.
        </Notice>
      )}

      {call.extractionConfidence < 0.7 && call.transcriptAvailable && (
        <Notice tone="warning">
          <strong>Low extraction confidence ({Math.round(call.extractionConfidence * 100)}%).</strong>{' '}
          This call is excluded from management aggregates by default. Everything below is shown for
          review, not for reporting.
        </Notice>
      )}

      {/* ── Headline scores ─────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-[11px] uppercase tracking-wide text-ink-tertiary">
            Customer sentiment (text)
          </p>
          <p className="mt-1.5 text-[26px] font-semibold tnum text-ink-primary">
            {sentiment.overall}
          </p>
          <StatusBadge
            size="sm"
            tone={sentiment.band === 'positive' ? 'success' : sentiment.band === 'negative' ? 'danger' : 'neutral'}
            label={sentiment.band}
          />
          <dl className="mt-2 grid grid-cols-3 gap-1 text-[11px] text-ink-tertiary">
            <div>
              <dt>Opening</dt>
              <dd className="tnum text-ink-secondary">{call.customerSentiment.opening}</dd>
            </div>
            <div>
              <dt>Middle</dt>
              <dd className="tnum text-ink-secondary">{call.customerSentiment.middle}</dd>
            </div>
            <div>
              <dt>Closing</dt>
              <dd className="tnum text-ink-secondary">{call.customerSentiment.closing}</dd>
            </div>
          </dl>
          <TextSentimentCaveat className="mt-2" />
        </Card>

        <Card>
          <p className="text-[11px] uppercase tracking-wide text-ink-tertiary">Purchase readiness</p>
          <p className="mt-1.5 text-[26px] font-semibold tnum text-ink-primary">{readiness}</p>
          <StatusBadge
            size="sm"
            tone={readinessBand(readiness) === 'high' ? 'success' : readinessBand(readiness) === 'medium' ? 'warning' : 'neutral'}
            label={readinessBand(readiness)}
          />
          <p className="mt-2 text-[11px] text-ink-tertiary leading-snug">
            A readiness score, not a conversion probability. It has never been back-tested against
            historical conversions (§7).
          </p>
          <MethodDisclosure
            formula={READINESS_WEIGHTS.map((w) => `${w.label} ${Math.round(w.weight * 100)}%`).join(' · ')}
            source="Transcript extraction"
            owner="Sales Operations"
          />
        </Card>

        <Card>
          <p className="text-[11px] uppercase tracking-wide text-ink-tertiary">Agent quality</p>
          {quality ? (
            <>
              <p className="mt-1.5 text-[26px] font-semibold tnum text-ink-primary">{quality.score}</p>
              {quality.hasCriticalFailure ? (
                <div className="space-y-1">
                  <StatusBadge size="sm" tone="danger" label="Critical compliance failure" />
                  <ul className="text-[11px] text-danger-fg list-disc list-inside">
                    {quality.criticalFailures.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-ink-tertiary leading-snug">
                    Reported separately and never averaged into the score — a high score with a
                    mis-selling flag must not read as a good call (§7).
                  </p>
                </div>
              ) : (
                <StatusBadge size="sm" tone="success" label="No critical failures" />
              )}
              {quality.unmeasuredNote && (
                <p className="mt-2 text-[11px] text-ink-tertiary leading-snug">
                  {quality.unmeasuredNote}
                </p>
              )}
            </>
          ) : (
            <div className="mt-2">
              <NotMeasurable reason="this call had no real conversation (fewer than three turns), so there is nothing to score." />
            </div>
          )}
        </Card>

        <Card>
          <p className="text-[11px] uppercase tracking-wide text-ink-tertiary">CRM outcome</p>
          {call.crm.provenance === 'crm_verified' ? (
            <dl className="mt-1.5 space-y-1 text-[13px]">
              <div className="flex justify-between gap-2">
                <dt className="text-ink-tertiary text-[11px]">Opportunity</dt>
                <dd>{call.crm.opportunityCreated ? 'Yes' : 'No'}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-ink-tertiary text-[11px]">Order</dt>
                <dd>{call.crm.orderPlaced ? 'Yes' : 'No'}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-ink-tertiary text-[11px]">Order value</dt>
                <dd className="tnum">
                  {call.crm.orderValueInr === null ? (
                    can(viewer, 'view_revenue') ? (
                      <NotMentioned />
                    ) : (
                      <span className="text-ink-tertiary text-[11px]">Hidden for your role</span>
                    )
                  ) : (
                    `₹${call.crm.orderValueInr.toLocaleString('en-IN')}`
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-ink-tertiary text-[11px]">Loss reason</dt>
                <dd className="text-right">{call.crm.crmLossReason ?? '—'}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-2 text-[11px] text-ink-tertiary">
              This call is not linked to a CRM record, so no verified outcome exists. Nothing has
              been inferred in its place.
            </p>
          )}
          <div className="mt-2">
            <ProvenanceBadge provenance={call.crm.provenance} />
          </div>
        </Card>
      </div>

      {/* ── Transcript + extraction ─────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-start">
        <Section
          title="Transcript"
          description={
            call.transcriptAvailable
              ? 'Speaker-separated, in the language the call was held in. Clicking an insight on the right highlights the turn it came from.'
              : 'No transcript was produced for this call.'
          }
          meta={
            <span className="inline-flex flex-wrap items-center gap-2">
              <span>
                {call.language} · {call.transcript.length} turns ·{' '}
                {Math.floor(call.durationSec / 60)}m {call.durationSec % 60}s
              </span>
              <ConfidenceChip value={call.transcriptionConfidence} />
            </span>
          }
          action={
            hasTranslations ? (
              <Button
                size="sm"
                variant={showTranslation ? 'primary' : 'secondary'}
                icon={Languages}
                onClick={() => setShowTranslation((s) => !s)}
              >
                {showTranslation ? 'Hide translation' : 'Show translation'}
              </Button>
            ) : undefined
          }
        >
          {call.transcript.length === 0 ? (
            <p className="text-xs text-ink-secondary">Nothing to show.</p>
          ) : (
            <ol className="space-y-2 max-h-[720px] overflow-y-auto pr-1">
              {call.transcript.map((t) => (
                <li
                  key={t.index}
                  ref={(el) => {
                    turnRefs.current[t.index] = el
                  }}
                  className={cn(
                    'rounded-lg p-2.5 transition-colors scroll-mt-4',
                    t.speaker === 'agent'
                      ? 'bg-[rgb(var(--rule)/0.03)]'
                      : 'bg-accent-copper/[0.06]',
                    activeTurn === t.index && 'ring-2 ring-accent-copper',
                  )}
                >
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-ink-tertiary">
                      {t.speaker === 'agent' ? employee?.name ?? 'Agent' : call.customerName}
                    </span>
                    <span className="text-[11px] text-ink-tertiary tnum whitespace-nowrap">
                      {formatTimestamp(t.startSec)}
                    </span>
                  </div>
                  <p className="text-[13px] text-ink-primary leading-relaxed">{t.text}</p>
                  {showTranslation && t.translation && (
                    <p
                      className="mt-1 text-[12px] text-ink-secondary italic leading-relaxed border-l-2 border-hairline/20 pl-2"
                      title="English translation, stored separately from the original (§13)."
                    >
                      {t.translation}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          )}

          <div className="mt-3 pt-3 border-t border-hairline/8 flex flex-wrap items-center gap-2">
            <Headphones size={14} className="text-ink-tertiary" aria-hidden />
            {call.recordingUrl ? (
              <span className="text-[11px] text-ink-tertiary">
                Recording pointer: <code>{call.recordingUrl}</code> — playback needs the telephony
                adapter and a short-lived signed URL, which is not wired up yet.
              </span>
            ) : (
              <span className="text-[11px] text-ink-tertiary">
                No recording available{can(viewer, 'view_recording') ? '' : ' for your role'}.
              </span>
            )}
          </div>
        </Section>

        <div className="space-y-4">
          <Section
            title="What the model extracted"
            description="Every item below points at the transcript turn it came from. Nothing appears here without evidence."
            meta={<AiGeneratedNote what="extraction" />}
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary mb-1.5">
                  Summary
                </h3>
                <p className="text-[13px] text-ink-primary leading-relaxed">{call.summary}</p>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary mb-1.5">
                  Questions asked ({call.faqs.length})
                </h3>
                {call.faqs.length === 0 ? (
                  <p className="text-[12px] text-ink-tertiary">No questions were identified.</p>
                ) : (
                  <ul className="space-y-2.5">
                    {call.faqs.map((f, i) => (
                      <li key={`${f.faqId}-${i}`} className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[13px] text-ink-primary font-medium">
                            {FAQ_BY_ID[f.faqId].shortLabel}
                          </span>
                          <StatusBadge
                            size="sm"
                            tone={ANSWER_TONE[f.answerStatus]}
                            label={f.answerStatus.replace(/_/g, ' ')}
                          />
                          {f.answerAccuracy === null && (
                            <StatusBadge
                              size="sm"
                              tone="neutral"
                              label="Accuracy not scorable"
                              title="No approved knowledge-base article covers this question, so factual accuracy cannot be scored (§4)."
                            />
                          )}
                        </div>
                        <p className="text-[12px] text-ink-secondary italic">
                          “{f.originalQuestion}”
                        </p>
                        <p className="text-[11px] text-ink-tertiary tnum">
                          Relevance {f.answerRelevance}
                          {f.answerAccuracy !== null && ` · accuracy ${f.answerAccuracy}`}
                          {f.responseTimeSec !== null
                            ? ` · answered after ${f.responseTimeSec}s`
                            : ' · never answered'}
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveTurn(f.evidence.turnIndex)}
                          className="text-left"
                        >
                          <EvidenceLink callId={call.callId} evidence={f.evidence} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary mb-1.5">
                  Objections ({call.objections.length})
                </h3>
                {call.objections.length === 0 ? (
                  <p className="text-[12px] text-ink-tertiary">No objections were raised.</p>
                ) : (
                  <ul className="space-y-2.5">
                    {call.objections.map((o, i) => (
                      <li key={`${o.objectionId}-${i}`} className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[13px] text-ink-primary font-medium">
                            {OBJECTION_BY_ID[o.objectionId].label}
                          </span>
                          <StatusBadge
                            size="sm"
                            tone={RESOLUTION_TONE[o.resolution]}
                            label={o.resolution.replace(/_/g, ' ')}
                          />
                          <span className="text-[11px] text-ink-tertiary">
                            intensity {o.intensity}/3 · {o.technique.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTurn(o.evidence.turnIndex)}
                          className="text-left"
                        >
                          <EvidenceLink callId={call.callId} evidence={o.evidence} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary mb-1.5">
                  Sales signals
                </h3>
                <dl className="space-y-1.5 text-[13px]">
                  <SignalRow label="Stated need" field={call.signals.customerNeed} callId={call.callId} />
                  <SignalRow
                    label="Product interest"
                    field={call.signals.productInterest}
                    callId={call.callId}
                  />
                  <SignalRow
                    label="Budget"
                    field={call.signals.budgetInr}
                    callId={call.callId}
                    format={(v) => `₹${Number(v).toLocaleString('en-IN')}`}
                  />
                  <SignalRow
                    label="Timeline"
                    field={call.signals.purchaseTimeline}
                    callId={call.callId}
                    format={(v) => String(v).replace(/_/g, ' ')}
                  />
                  <SignalRow
                    label="Decision maker"
                    field={call.signals.decisionMaker}
                    callId={call.callId}
                    format={(v) => String(v).replace(/_/g, ' ')}
                  />
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-[11px] text-ink-tertiary pt-0.5">Competitors named</dt>
                    <dd className="text-right min-w-0">
                      {call.signals.competitorMentions.length ? (
                        call.signals.competitorMentions.join(', ')
                      ) : (
                        <NotMentioned />
                      )}
                    </dd>
                  </div>
                </dl>
                {call.signals.aiHesitationSummary && (
                  <p className="mt-2 text-[11px] text-ink-tertiary leading-snug border-l-2 border-warning/40 pl-2">
                    <strong className="text-ink-secondary">AI read on hesitation:</strong>{' '}
                    {call.signals.aiHesitationSummary}{' '}
                    <em>
                      This is never used as the loss reason — only the CRM&apos;s own field is (§6).
                    </em>
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary mb-1.5">
                  Emotional signals (from wording)
                </h3>
                <CompositionBar
                  total={100}
                  segments={[
                    { label: 'Trust', value: Math.round(call.emotions.trust * 100), tone: 'success' },
                    { label: 'Interest', value: Math.round(call.emotions.interest * 100), tone: 'info' },
                    {
                      label: 'Frustration',
                      value: Math.round(call.emotions.frustration * 100),
                      tone: 'danger',
                    },
                    {
                      label: 'Confusion',
                      value: Math.round(call.emotions.confusion * 100),
                      tone: 'warning',
                    },
                  ]}
                />
              </div>
            </div>
          </Section>

          <Section
            title={`Commitments & recommended actions (${actions.length})`}
            description="What was promised on the call is kept separate from what the model suggests. Only the first is something we owe the customer."
            meta="Nothing here auto-executes — every action needs a human (§13)."
          >
            {actions.length === 0 ? (
              <p className="text-[12px] text-ink-tertiary">
                No commitment was made and nothing is recommended.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {actions.map((a) => (
                  <li key={a.id} className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <StatusBadge
                        size="sm"
                        tone={a.origin === 'committed' ? 'info' : 'neutral'}
                        label={a.origin === 'committed' ? `Promised by ${a.committedBy}` : 'AI-recommended'}
                      />
                      <span className="text-[13px] text-ink-primary font-medium">
                        {ACTION_TYPE_BY_ID[a.actionTypeId].label}
                      </span>
                      <StatusBadge
                        size="sm"
                        tone={
                          a.slaStatus === 'overdue'
                            ? 'danger'
                            : a.slaStatus === 'due_today'
                              ? 'warning'
                              : 'success'
                        }
                        label={a.slaStatus.replace(/_/g, ' ')}
                      />
                    </div>
                    <p className="text-[12px] text-ink-secondary">{a.reason}</p>
                    <p className="text-[11px] text-ink-tertiary tnum">
                      Owner {a.ownerName} · due{' '}
                      {new Date(a.dueAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                    {a.evidence && (
                      <button
                        type="button"
                        onClick={() => setActiveTurn(a.evidence!.turnIndex)}
                        className="text-left"
                      >
                        <EvidenceLink callId={call.callId} evidence={a.evidence} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {coaching.length > 0 && (
            <Section
              title="Coaching points"
              description="The lowest-scoring parameters on this call, with what to practise. Derived from the agent's own behaviour — never from how the customer felt."
              meta="A negative customer never lowers the agent's score (§3)."
            >
              <ul className="space-y-2">
                {coaching.map((c) => (
                  <li key={c.parameter}>
                    <p className="text-[13px] text-ink-primary font-medium">
                      {c.parameter} <span className="tnum text-ink-tertiary">({c.score})</span>
                    </p>
                    <p className="text-[12px] text-ink-secondary">{c.recommendation}</p>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {call.complianceFlags.length > 0 && (
            <Section
              title="Compliance flags"
              description="Raised by rule, reviewed by a person. Critical flags are reported beside the quality score, never inside it."
              meta=""
            >
              <ul className="space-y-1.5">
                {call.complianceFlags.map((f) => {
                  const def = COMPLIANCE_BY_ID[f]
                  return (
                    <li key={f} className="flex items-start gap-2">
                      <StatusBadge
                        size="sm"
                        tone={def.critical ? 'danger' : 'warning'}
                        label={def.critical ? 'Critical' : 'Non-critical'}
                      />
                      <span className="text-[13px] text-ink-primary">{def.label}</span>
                    </li>
                  )
                })}
              </ul>
            </Section>
          )}
        </div>
      </div>
    </div>
  )
}

/** One AI-extracted field with its confidence and its evidence link. */
function SignalRow({
  label,
  field,
  callId,
  format,
}: {
  label: string
  field: { value: unknown; confidence: number; provenance: string; evidence: { turnIndex: number; timestampSec: number; quote: string } | null }
  callId: string
  format?: (v: unknown) => string
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-[11px] text-ink-tertiary pt-0.5 flex-shrink-0">{label}</dt>
      <dd className="text-right min-w-0">
        {field.value === null || field.value === undefined ? (
          <NotMentioned />
        ) : (
          <>
            <span className="text-[13px] text-ink-primary">
              {format ? format(field.value) : String(field.value)}
            </span>
            {field.evidence && (
              <span className="block">
                <EvidenceLink callId={callId} evidence={field.evidence} showQuote={false} />
              </span>
            )}
          </>
        )}
      </dd>
    </div>
  )
}
