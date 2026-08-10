'use client'

import Link from 'next/link'
import { Database, Plug } from 'lucide-react'
import { Card, DataTable, Notice, Section, StatusBadge, type Column } from '@/components/ds'
import { CiPageFrame } from './CiShell'
import { useCi } from './CiContext'
import { ConfidenceChip, NotMeasurable, ProvenanceBadge } from './CiPrimitives'
import { CompositionBar, RankedBars } from './CiCharts'
import { dataQualitySummary } from '@/lib/call-intelligence/metrics'
import { ALERT_RULES, ALERT_SLA_HOURS } from '@/lib/call-intelligence/alerts'
import { DATA_SOURCES, activeSource } from '@/lib/call-intelligence/service'
import { PROHIBITED_SCORING_ATTRIBUTES, ROLES } from '@/lib/call-intelligence/rbac'
import { QUALITY_WEIGHTS, READINESS_WEIGHTS } from '@/lib/call-intelligence/scoring'
import {
  FAQ_CATEGORIES,
  MODEL_VERSIONS,
  TAXONOMY_VERSION,
  THRESHOLDS,
} from '@/data/call-intelligence/taxonomy'
import type { CallRecord } from '@/lib/call-intelligence/types'

/**
 * Data Quality & Configuration — page 10.
 *
 * The page that decides whether the other nine can be trusted. It shows what
 * was excluded and why, not just what was included: a coverage number that only
 * counts successes is the most flattering and least useful metric a pipeline
 * can produce.
 *
 * It also carries the honest inventory — which upstream systems are actually
 * connected (none of them), which thresholds are placeholders, and which
 * questions cannot be scored for accuracy because nobody has written the
 * knowledge-base article yet.
 */

export default function DataQuality() {
  const { periodLabel, comparisonLabel } = useCi()

  return (
    <CiPageFrame
      title="Data Quality & Configuration"
      question="Can these numbers be trusted — what was excluded, what is still a placeholder, and what is not connected yet?"
    >
      {(data) => {
        const q = dataQualitySummary(data.allCalls)
        const failed = data.allCalls.filter((c) => !c.transcriptAvailable)
        const lowConf = data.allCalls.filter(
          (c) => c.transcriptAvailable && c.extractionConfidence < THRESHOLDS.minTranscriptConfidence,
        )
        const noKb = FAQ_CATEGORIES.filter((f) => f.kbArticleId === null)

        const excludedColumns: Column<CallRecord>[] = [
          {
            key: 'callId',
            header: 'Call',
            sortable: true,
            nowrap: true,
            value: (c) => c.callId,
            cell: (c) => (
              <Link
                href={`/call-intelligence/explorer/${c.callId}`}
                className="text-accent-copper hover:underline"
              >
                {c.callId}
              </Link>
            ),
          },
          {
            key: 'reason',
            header: 'Why it was excluded',
            sortable: true,
            value: (c) =>
              !c.transcriptAvailable
                ? 'Transcription failed'
                : c.transcriptionConfidence < THRESHOLDS.minTranscriptConfidence
                  ? 'Low transcription confidence'
                  : 'Low extraction confidence',
            cell: (c) => (
              <StatusBadge
                size="sm"
                tone="danger"
                label={
                  !c.transcriptAvailable
                    ? 'Transcription failed'
                    : c.transcriptionConfidence < THRESHOLDS.minTranscriptConfidence
                      ? 'Low transcription confidence'
                      : 'Low extraction confidence'
                }
              />
            ),
          },
          {
            key: 'language',
            header: 'Language',
            sortable: true,
            nowrap: true,
            value: (c) => c.language,
            cell: (c) => (
              <span className={c.language === 'Unknown' ? 'text-warning-fg' : undefined}>
                {c.language}
              </span>
            ),
          },
          {
            key: 'transcription',
            header: 'Transcription',
            sortable: true,
            nowrap: true,
            value: (c) => c.transcriptionConfidence,
            cell: (c) => <ConfidenceChip value={c.transcriptionConfidence} />,
          },
          {
            key: 'extraction',
            header: 'Extraction',
            sortable: true,
            nowrap: true,
            value: (c) => c.extractionConfidence,
            cell: (c) => <ConfidenceChip value={c.extractionConfidence} />,
          },
          {
            key: 'duration',
            header: 'Length',
            sortable: true,
            align: 'right',
            nowrap: true,
            secondary: true,
            value: (c) => c.durationSec,
            cell: (c) => <span className="tnum">{c.durationSec}s</span>,
          },
        ]

        const excluded = [...failed, ...lowConf]

        return (
          <div className="space-y-5">
            <Notice tone="warning" icon={Database}>
              <strong>Every number in this section comes from a generated demo corpus.</strong> No
              telephony system, speech-to-text service, CRM, task system, order system or complaint
              system is connected. The live data source is implemented as a hard failure rather than
              a silent fallback — a dashboard that quietly shows mock data as production is worse
              than one that refuses to load.
            </Notice>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <p className="text-[11px] uppercase tracking-wide text-ink-tertiary">
                  Analysable coverage
                </p>
                <p className="mt-1.5 text-[26px] font-semibold tnum text-ink-primary">
                  {q.total ? Math.round((q.analysable / q.total) * 1000) / 10 : 0}%
                </p>
                <p className="text-[11px] text-ink-tertiary">
                  {q.analysable} of {q.total} calls in the window
                </p>
                <div className="mt-2">
                  <CompositionBar
                    total={q.total}
                    segments={[
                      { label: 'Analysable', value: q.analysable, tone: 'success' },
                      { label: 'Low confidence', value: q.lowConfidence, tone: 'warning' },
                      { label: 'Failed', value: q.failed, tone: 'danger' },
                    ]}
                  />
                </div>
              </Card>
              <Card>
                <p className="text-[11px] uppercase tracking-wide text-ink-tertiary">
                  Talk metrics suppressed
                </p>
                <p className="mt-1.5 text-[26px] font-semibold tnum text-warning-fg">
                  {q.diarisationUnreliable}
                </p>
                <p className="text-[11px] text-ink-tertiary">
                  of {q.transcribed} transcribed calls, below{' '}
                  {THRESHOLDS.minDiarisationConfidence * 100}% diarisation
                </p>
                <p className="mt-2 text-[11px] text-ink-tertiary leading-snug">
                  Talk ratio, interruptions and silence are hidden on these calls rather than shown
                  as zero (§8).
                </p>
              </Card>
              <Card>
                <p className="text-[11px] uppercase tracking-wide text-ink-tertiary">CRM linkage</p>
                <p className="mt-1.5 text-[26px] font-semibold tnum text-ink-primary">
                  {q.crmLinkedPct}%
                </p>
                <p className="text-[11px] text-ink-tertiary">
                  {q.crmLinked} of {q.total} calls have a verified CRM record
                </p>
                <p className="mt-2 text-[11px] text-ink-tertiary leading-snug">
                  Every conversion figure in this section is computed on this smaller base, never on
                  total calls.
                </p>
              </Card>
              <Card>
                <p className="text-[11px] uppercase tracking-wide text-ink-tertiary">
                  Unknown language
                </p>
                <p className="mt-1.5 text-[26px] font-semibold tnum text-warning-fg">
                  {q.unknownLanguage}
                </p>
                <p className="text-[11px] text-ink-tertiary">
                  calls the STT service could not classify
                </p>
                <p className="mt-2 text-[11px] text-ink-tertiary leading-snug">
                  Excluded from language aggregates. Nothing has been guessed from the customer&apos;s
                  name or region.
                </p>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Section
                title="Confidence by language"
                description="Where transcription is weakest. A language with low confidence and high volume is a procurement conversation, not a data-cleaning one."
                meta={`${periodLabel} · compared with ${comparisonLabel} · ${q.total} calls`}
              >
                {q.byLanguage.length === 0 ? (
                  <p className="text-xs text-ink-secondary">No calls in this window.</p>
                ) : (
                  <RankedBars
                    max={100}
                    rows={q.byLanguage.map((l) => ({
                      id: l.language,
                      label: l.language,
                      value: l.avgConfidence,
                      valueLabel: `${l.avgConfidence}% avg confidence`,
                      sampleSize: l.calls,
                      tone:
                        l.language === 'Unknown'
                          ? 'danger'
                          : l.avgConfidence < 75
                            ? 'warning'
                            : 'success',
                    }))}
                  />
                )}
              </Section>

              <Section
                title="Pipeline health"
                description="The counts behind the coverage number, including the ones that make it look worse."
                meta="Thresholds are in taxonomy.ts → THRESHOLDS and are not tuned to flatter the numbers"
              >
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[13px]">
                  {[
                    ['Calls in window', q.total],
                    ['Transcribed', q.transcribed],
                    ['Transcription failed', q.failed],
                    ['Below confidence gate', q.lowConfidence],
                    ['Analysable', q.analysable],
                    ['Excluded from aggregates', `${q.excludedPct}%`],
                    ['Avg transcription confidence', `${q.avgTranscriptionConfidence}%`],
                    ['Avg extraction confidence', `${q.avgExtractionConfidence}%`],
                    ['Human-corrected records', q.corrected],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="flex items-baseline justify-between gap-2">
                      <dt className="text-[11px] text-ink-tertiary">{label}</dt>
                      <dd className="tnum font-medium text-ink-primary">{value}</dd>
                    </div>
                  ))}
                </dl>
                {q.corrected === 0 && (
                  <p className="mt-3 text-[11px] text-ink-tertiary leading-snug">
                    No record has been corrected by a human yet. Once the correction workflow is
                    live, a corrected field is marked as such everywhere it appears and stops being
                    labelled AI-inferred.
                  </p>
                )}
              </Section>
            </div>

            <Section
              title={`Excluded calls (${excluded.length})`}
              description="Exactly which calls the management aggregates left out, and why. Switching the confidence gate in the filter bar brings them back into every denominator on every page."
              meta={`${periodLabel} · ${q.excludedPct}% of the window`}
              padded={false}
            >
              <DataTable
                rows={excluded}
                columns={excludedColumns}
                rowKey={(c) => c.callId}
                pageSize={10}
                exportName="sunroof-excluded-calls"
                searchPlaceholder="Search excluded calls…"
                caption="Calls excluded from management aggregates"
                emptyHeadline="Nothing was excluded"
                emptySupport="Every call in this window passed transcription and the confidence gate."
              />
            </Section>

            {/* ── Configuration, stated rather than buried ────────────── */}
            <Section
              title="Upstream systems"
              description="What each adapter must supply, and whether it is connected. Every one of these is a blocking dependency for production."
              meta={`Active source: ${activeSource.label}`}
            >
              <ul className="space-y-2">
                {[
                  ['Telephony', 'Call metadata, parties, direction, duration, recording pointer'],
                  ['Transcription (STT)', 'Speaker-separated transcript, per-turn confidence, and diarisation confidence'],
                  ['CRM', 'Verified opportunity, order, loss reason — the only source of commercial truth'],
                  ['Task system', 'Where an approved action actually becomes work'],
                  ['Order system', 'Verified order value for revenue-influenced figures'],
                  ['Complaint system', 'Logged complaints and their severity'],
                ].map(([name, need]) => (
                  <li key={name} className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[13px] font-medium text-ink-primary">{name}</span>
                      <p className="text-[11px] text-ink-tertiary">{need}</p>
                    </div>
                    <StatusBadge size="sm" tone="danger" icon={Plug} label="Not connected" />
                  </li>
                ))}
              </ul>
              <Notice tone="warning" className="mt-3">
                <strong>Diarisation confidence is the one that blocks most.</strong> Until the STT
                service exposes it per call, every talk-ratio, interruption and silence metric stays
                hidden — which is why {q.diarisationUnreliable} calls in this window show
                &ldquo;not measurable&rdquo; instead of a number.
              </Notice>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {DATA_SOURCES.map((s) => (
                  <li key={s.id}>
                    <StatusBadge
                      size="sm"
                      tone={s.id === activeSource.id ? 'info' : 'neutral'}
                      label={`${s.label}${s.id === activeSource.id ? ' — active' : ''}`}
                    />
                  </li>
                ))}
              </ul>
            </Section>

            <div className="grid gap-4 lg:grid-cols-2">
              <Section
                title="Questions with no approved article"
                description="Answer accuracy cannot be scored for these, by design. Relevance and completeness still are."
                meta={`${noKb.length} of ${FAQ_CATEGORIES.length} FAQ categories`}
              >
                {noKb.length === 0 ? (
                  <p className="text-xs text-ink-secondary">
                    Every FAQ category has an approved knowledge-base article.
                  </p>
                ) : (
                  <>
                    <ul className="space-y-2">
                      {noKb.map((f) => (
                        <li key={f.id} className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <span className="text-[13px] text-ink-primary font-medium">
                              {f.shortLabel}
                            </span>
                            <p className="text-[11px] text-ink-tertiary">{f.standardQuestion}</p>
                          </div>
                          <span className="text-[11px] text-ink-tertiary whitespace-nowrap">
                            {f.owner}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3">
                      <NotMeasurable reason="no approved knowledge-base article exists to check an answer against, so scoring accuracy would mean inventing a benchmark." />
                    </div>
                  </>
                )}
              </Section>

              <Section
                title="Thresholds in force"
                description="Every rule the dashboard applies, in one place. Changing one of these changes numbers on every page."
                meta="taxonomy.ts → THRESHOLDS"
              >
                <dl className="space-y-2 text-[13px]">
                  {[
                    ['Minimum transcript confidence', `${THRESHOLDS.minTranscriptConfidence * 100}%`, 'Below this a call is excluded from management aggregates.'],
                    ['Minimum diarisation confidence', `${THRESHOLDS.minDiarisationConfidence * 100}%`, 'Below this all talk metrics are suppressed.'],
                    ['Minimum sample size', `${THRESHOLDS.minSampleSize} calls`, 'Below this a segment is labelled "low sample — not a trend".'],
                    ['High purchase readiness', `${THRESHOLDS.highIntentScore}`, 'Readiness at or above this is treated as high intent. Not a conversion probability.'],
                    ['Severe negative', `${THRESHOLDS.severeNegativeScore}`, 'Closing sentiment at or below this raises a high-severity alert.'],
                    ['Coaching threshold', `${THRESHOLDS.coachingQualityScore}`, 'Quality below this flags a coaching recommendation.'],
                    ['Emerging trend rise', `${THRESHOLDS.emergingTrendRise * 100}%`, 'Period-over-period rise that marks an FAQ or objection as emerging.'],
                  ].map(([label, value, note]) => (
                    <div key={label}>
                      <div className="flex items-baseline justify-between gap-2">
                        <dt className="text-ink-primary">{label}</dt>
                        <dd className="tnum font-medium text-ink-primary whitespace-nowrap">
                          {value}
                        </dd>
                      </div>
                      <p className="text-[11px] text-ink-tertiary">{note}</p>
                    </div>
                  ))}
                </dl>
              </Section>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Section
                title="Scoring weights"
                description="Rendered from the same constants the maths uses, so this page cannot drift from the calculation."
                meta="scoring.ts → QUALITY_WEIGHTS and READINESS_WEIGHTS"
              >
                <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary mb-2">
                  Agent quality
                </h3>
                <RankedBars
                  max={100}
                  rows={QUALITY_WEIGHTS.map((w) => ({
                    id: w.key,
                    label: w.label,
                    value: w.weight * 100,
                    valueLabel: `${Math.round(w.weight * 100)}%`,
                    tone: 'info' as const,
                  }))}
                />
                <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary mt-4 mb-2">
                  Purchase readiness
                </h3>
                <RankedBars
                  max={100}
                  rows={READINESS_WEIGHTS.map((w) => ({
                    id: w.key,
                    label: w.label,
                    value: w.weight * 100,
                    valueLabel: `${Math.round(w.weight * 100)}%`,
                    tone: 'warning' as const,
                  }))}
                />
              </Section>

              <Section
                title="Access, masking and audit"
                description="Six roles, each scoped before aggregation rather than after. Switching role in the filter bar changes the rows, not just the menu."
                meta="rbac.ts — policy definition"
              >
                <ul className="space-y-2.5">
                  {ROLES.map((r) => (
                    <li key={r.id}>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[13px] font-medium text-ink-primary">{r.label}</span>
                        <StatusBadge
                          size="sm"
                          tone="neutral"
                          label={`${r.pages.length} of 10 pages`}
                        />
                      </div>
                      <p className="text-[11px] text-ink-tertiary">{r.description}</p>
                    </li>
                  ))}
                </ul>
                <Notice tone="danger" className="mt-3">
                  <strong>This is a UX affordance, not a security boundary.</strong> The policy is
                  evaluated in the browser for the demo. In production the same policy object must be
                  applied server-side before any row leaves the API.
                </Notice>
              </Section>
            </div>

            <Section
              title="Model and taxonomy versions"
              description="Stamped onto every call record, so a number can always be traced to the version of the extractor that produced it."
              meta={`Taxonomy ${TAXONOMY_VERSION}`}
            >
              <div className="flex flex-wrap gap-2">
                <StatusBadge size="sm" tone="neutral" label={`Taxonomy ${TAXONOMY_VERSION}`} />
                {Object.entries(MODEL_VERSIONS).map(([k, v]) => (
                  <StatusBadge key={k} size="sm" tone="neutral" label={`${k} ${v}`} />
                ))}
                <ProvenanceBadge provenance="system" />
              </div>
              <p className="mt-3 text-[11px] text-ink-tertiary leading-snug">
                Alert rules: {ALERT_RULES.length} configured, with SLAs of{' '}
                {Object.entries(ALERT_SLA_HOURS)
                  .map(([sev, hrs]) => `${sev} ${hrs}h`)
                  .join(' · ')}
                .
              </p>
              <div className="mt-3 pt-3 border-t border-hairline/8">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary mb-2">
                  Never an input to any score
                </h3>
                <ul className="flex flex-wrap gap-1.5">
                  {PROHIBITED_SCORING_ATTRIBUTES.map((a) => (
                    <li key={a}>
                      <StatusBadge size="sm" tone="neutral" label={a} />
                    </li>
                  ))}
                </ul>
              </div>
            </Section>
          </div>
        )
      }}
    </CiPageFrame>
  )
}
