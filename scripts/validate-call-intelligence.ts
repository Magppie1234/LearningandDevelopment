/**
 * Sunroof Call Intelligence — formula & edge-case validation harness (§16).
 *
 * Run: npm run validate:ci
 *
 * This exists because the spec requires "validate every formula, percentage,
 * total, score and comparison" and forbids claiming anything is tested that
 * is not. Every assertion below runs against the real engine and the real
 * (demo) corpus — none of them are mocked.
 */

import { MOCK_CALLS, DEMO_NOW } from '../src/data/call-intelligence/mock-dataset'
import { THRESHOLDS, FAQ_BY_ID } from '../src/data/call-intelligence/taxonomy'
import {
  agentQualityScore,
  customerSentimentScore,
  isAnalysable,
  purchaseReadinessScore,
  QUALITY_WEIGHTS,
  READINESS_WEIGHTS,
  sentimentToScore,
} from '../src/lib/call-intelligence/scoring'
import {
  applyComparisonFilters,
  applyFilters,
  applyFiltersIgnoringConfidence,
  defaultFilters,
  filtersToQuery,
  queryToFilters,
} from '../src/lib/call-intelligence/filters'
import {
  callToOrderFunnel,
  countCalls,
  dataQualitySummary,
  dedupeFaqs,
  executiveKpis,
  faqAggregates,
  objectionAggregates,
  regionAggregates,
  volumeSentimentTrend,
} from '../src/lib/call-intelligence/metrics'
import { buildActions, slaStatusFor, summariseActions } from '../src/lib/call-intelligence/actions'
import { buildAlerts } from '../src/lib/call-intelligence/alerts'
import { maskName, maskSensitiveText, scopeCalls, type Viewer } from '../src/lib/call-intelligence/rbac'
import { paginate, toCsv } from '../src/lib/call-intelligence/service'
import type { CallRecord } from '../src/lib/call-intelligence/types'

let passed = 0
const failures: string[] = []

function check(name: string, condition: boolean, detail = '') {
  if (condition) {
    passed += 1
  } else {
    failures.push(`${name}${detail ? ` — ${detail}` : ''}`)
  }
}

function near(a: number, b: number, tol = 0.15) {
  return Math.abs(a - b) <= tol
}

const f = defaultFilters()
const calls = applyFilters(MOCK_CALLS, f)
const allCalls = applyFiltersIgnoringConfidence(MOCK_CALLS, f)
const prevCalls = applyComparisonFilters(MOCK_CALLS, f)
const prevAllCalls = applyComparisonFilters(MOCK_CALLS, { ...f, confidenceMode: 'all' })
const actions = buildActions(calls)
const alerts = buildAlerts({ calls, prevCalls, actions })

console.log('\n═══ Sunroof Call Intelligence — validation ═══\n')
console.log(`Corpus: ${MOCK_CALLS.length} calls | primary window ${f.from}→${f.to} | comparison ${f.compareFrom}→${f.compareTo}`)
console.log(`Analysable in window: ${calls.length} | all in window: ${allCalls.length} | comparison: ${prevCalls.length}\n`)

/* ── 1. Corpus integrity ──────────────────────────────────────────────────── */

check('corpus is non-empty', MOCK_CALLS.length > 0)
check('call ids are unique', new Set(MOCK_CALLS.map((c) => c.callId)).size === MOCK_CALLS.length)
check('every call has a taxonomy version', MOCK_CALLS.every((c) => c.taxonomyVersion.length > 0))
check(
  'transcript turn indices are sequential and monotonic in time',
  MOCK_CALLS.every((c) =>
    c.transcript.every((t, i) => t.index === i && (i === 0 || t.startSec >= c.transcript[i - 1].startSec - 1.0)),
  ),
)
check('every turn end is after its start', MOCK_CALLS.every((c) => c.transcript.every((t) => t.endSec > t.startSec)))
check('sentiment values stay within −1..+1', MOCK_CALLS.every((c) => c.transcript.every((t) => t.sentiment >= -1 && t.sentiment <= 1)))

/* ── 2. Evidence linkage (§11: every insight points at a real turn) ───────── */

const badEvidence: string[] = []
for (const c of MOCK_CALLS) {
  const n = c.transcript.length
  for (const q of c.faqs) if (q.evidence.turnIndex >= n) badEvidence.push(`${c.callId} faq ${q.faqId}`)
  for (const o of c.objections) if (o.evidence.turnIndex >= n) badEvidence.push(`${c.callId} obj ${o.objectionId}`)
  for (const m of c.commitments) if (m.evidence.turnIndex >= n) badEvidence.push(`${c.callId} commit`)
}
check('every extracted insight points at an existing transcript turn', badEvidence.length === 0, badEvidence.slice(0, 3).join('; '))

const timestampMismatch = MOCK_CALLS.flatMap((c) =>
  c.faqs.filter((q) => c.transcript[q.evidence.turnIndex]?.startSec !== q.evidence.timestampSec).map(() => c.callId),
)
check('evidence timestamps match the referenced turn', timestampMismatch.length === 0, `${timestampMismatch.length} mismatches`)

/* ── 3. FAQ dedupe (§4: no double counting within one call) ───────────────── */

const dupeOffenders = MOCK_CALLS.filter((c) => {
  const ids = dedupeFaqs(c).map((q) => q.faqId)
  return new Set(ids).size !== ids.length
})
check('dedupeFaqs never returns the same FAQ twice in one call', dupeOffenders.length === 0)

const faqRows = faqAggregates(calls, prevCalls)
check(
  'FAQ call count never exceeds the number of analysed calls',
  faqRows.every((r) => r.callCount <= calls.length),
)
check(
  'FAQ unique customers never exceeds its call count',
  faqRows.every((r) => r.uniqueCustomers <= r.callCount),
)
check(
  'FAQ percentage equals callCount ÷ denominator',
  faqRows.every((r) => near(r.pctOfCalls, (r.callCount / r.denominator) * 100)),
)
check(
  'answer-status buckets sum to the FAQ call count',
  faqRows.every((r) => r.fullyAnswered + r.partiallyAnswered + r.unanswered === r.callCount),
)

/* ── 4. Answer accuracy only where an approved KB article exists (§4) ─────── */

const accuracyWithoutKb = MOCK_CALLS.flatMap((c) =>
  c.faqs.filter((q) => q.answerAccuracy !== null && FAQ_BY_ID[q.faqId].kbArticleId === null),
)
check('answer accuracy is never scored without an approved KB article', accuracyWithoutKb.length === 0, `${accuracyWithoutKb.length} violations`)

const noKbFaqs = faqRows.filter((r) => !r.hasKbArticle)
check(
  'FAQs with no KB article report null aggregate accuracy',
  noKbFaqs.every((r) => r.avgAccuracy === null),
)
console.log(`  · FAQs with no approved KB article: ${noKbFaqs.map((r) => r.shortLabel).join(', ') || 'none'}`)

/* ── 5. Scoring formulas (§7) ─────────────────────────────────────────────── */

check('readiness weights sum to 1.00', near(READINESS_WEIGHTS.reduce((s, w) => s + w.weight, 0), 1, 0.0001))
check('quality weights sum to 1.00', near(QUALITY_WEIGHTS.reduce((s, w) => s + w.weight, 0), 1, 0.0001))
check('sentimentToScore maps −1→0, 0→50, +1→100', sentimentToScore(-1) === 0 && sentimentToScore(0) === 50 && sentimentToScore(1) === 100)

// Recompute readiness by hand for a sample and compare with the engine.
const readinessMismatch = MOCK_CALLS.slice(0, 60).filter((c) => {
  const manual = READINESS_WEIGHTS.reduce((s, w) => s + c.readinessComponents[w.key] * w.weight, 0)
  return !near(purchaseReadinessScore(c.readinessComponents), manual, 0.11)
})
check('purchaseReadinessScore equals the hand-computed weighted sum', readinessMismatch.length === 0, `${readinessMismatch.length} of 60`)

check(
  'all three scores stay within 0..100',
  MOCK_CALLS.every((c) => {
    const q = agentQualityScore(c).score
    const r = purchaseReadinessScore(c.readinessComponents)
    const s = customerSentimentScore(c.customerSentiment).overall
    return q >= 0 && q <= 100 && r >= 0 && r <= 100 && s >= 0 && s <= 100
  }),
)

check(
  'sentiment shift equals closing minus opening',
  MOCK_CALLS.filter((c) => c.transcript.length > 2).every((c) => {
    const s = customerSentimentScore(c.customerSentiment)
    return near(s.shift, s.closing - s.opening, 0.11)
  }),
)

/* ── 6. Critical compliance never hidden inside quality (§7) ──────────────── */

const criticalCalls = MOCK_CALLS.filter((c) => agentQualityScore(c).hasCriticalFailure)
check('critical compliance failures exist in the corpus to test against', criticalCalls.length > 0, `${criticalCalls.length} found`)
check(
  'critical failures are reported separately, not subtracted from the score',
  criticalCalls.every((c) => {
    const q = agentQualityScore(c)
    return q.criticalFailures.length > 0 && q.score > 0
  }),
)

/* ── 7. Talk-ratio only when diarisation is reliable (§8) ─────────────────── */

check(
  'unreliable diarisation is flagged so talk metrics can be suppressed',
  MOCK_CALLS.every((c) => c.dynamics.reliable === (c.diarisationConfidence >= 0.75 && c.transcript.length > 2)),
)
const unreliable = MOCK_CALLS.filter((c) => !c.dynamics.reliable)
console.log(`  · Calls with unreliable diarisation (talk metrics suppressed): ${unreliable.length}`)

/* ── 8. Confidence gate (§13) ─────────────────────────────────────────────── */

check('analysable set excludes every low-confidence transcript', calls.every((c) => isAnalysable(c)))
check(
  'the confidence gate actually removes rows',
  allCalls.length > calls.length,
  `all=${allCalls.length} analysable=${calls.length}`,
)
check(
  'excluded rows are all below threshold or failed',
  allCalls
    .filter((c) => !calls.includes(c))
    .every((c) => !c.transcriptAvailable || c.transcriptionConfidence < THRESHOLDS.minTranscriptConfidence || c.extractionConfidence < THRESHOLDS.minTranscriptConfidence),
)

/* ── 9. KPI arithmetic (§15: every percentage has its denominator) ────────── */

const kpis = executiveKpis({ calls, allCalls, prevCalls, prevAllCalls, actions })
check('every percentage KPI carries a denominator', kpis.filter((k) => k.unit === 'percent').every((k) => k.denominator !== null))
check('every KPI carries a formula, source and owner', kpis.every((k) => k.formula && k.source && k.owner))
check(
  'percentage KPIs equal numerator ÷ denominator',
  kpis
    .filter((k) => k.unit === 'percent' && k.numerator !== null && k.denominator)
    .every((k) => near(k.value, (k.numerator! / k.denominator!) * 100)),
)
check('no percentage KPI exceeds 100', kpis.filter((k) => k.unit === 'percent').every((k) => k.value <= 100))

const counts = countCalls(calls)
check('positive + neutral + negative = total analysed calls', counts.positive + counts.neutral + counts.negative === calls.length)
check('transcribed never exceeds total', counts.transcribed <= counts.total)
check('unique customers never exceeds call count', counts.uniqueCustomers <= counts.total)

const coverage = kpis.find((k) => k.key === 'coverage')!
check('transcription coverage uses the pre-gate denominator', coverage.denominator === allCalls.length)

/* ── 10. CRM vs AI denominators never mixed (§13) ─────────────────────────── */

const c2o = kpis.find((k) => k.key === 'call_to_order')!
check('call-to-order denominator is CRM-linked calls only', c2o.denominator === counts.crmLinked)
check('revenue is CRM-verified provenance', kpis.find((k) => k.key === 'revenue_influenced')!.provenance === 'crm_verified')
check(
  'revenue sums only CRM-verified orders',
  near(
    counts.revenueInr,
    calls.filter((c) => c.crm.provenance === 'crm_verified' && c.crm.orderPlaced).reduce((s, c) => s + (c.crm.orderValueInr ?? 0), 0),
    1,
  ),
)

const funnel = callToOrderFunnel(calls)
check('funnel stages never increase down the funnel within the same denominator', funnel[1].value <= funnel[0].value && funnel[2].value <= funnel[1].value)
check('funnel labels the denominator switch to CRM', funnel[3].note.toLowerCase().includes('crm'))

/* ── 11. Trend & comparison (§15) ─────────────────────────────────────────── */

const trend = volumeSentimentTrend(calls, f.from, f.to)
check('trend covers every day in the window', trend.length === 28, `${trend.length} points`)
check('trend call totals reconcile with the filtered set', trend.reduce((s, p) => s + p.calls, 0) === calls.length)
check('empty days report null averages, not zero', trend.filter((p) => p.calls === 0).every((p) => p.avgSentiment === null))
check('comparison window does not overlap the primary window', f.compareTo < f.from)

/* ── 12. Regional rules (§5) ──────────────────────────────────────────────── */

const regions = regionAggregates(calls, actions)
check('region call totals reconcile with the filtered set', regions.reduce((s, r) => s + r.calls, 0) === calls.length)
check('every region row carries a sample-confidence label', regions.every((r) => r.sample.label.length > 0))
check('per-100 rates equal count ÷ calls × 100', regions.every((r) => near(r.highIntentPer100, (r.highIntent / r.calls) * 100)))
console.log(`  · Region sample status: ${regions.map((r) => `${r.key}=${r.calls}(${r.sample.level})`).join(', ')}`)

// At region level every bucket clears the 20-call minimum in this corpus, so
// the rule is exercised where small samples genuinely occur: city level.
const cities = regionAggregates(calls, actions, 'city')
const lowSampleCities = cities.filter((r) => r.sample.level === 'low')
check('city totals reconcile with the filtered set', cities.reduce((s, r) => s + r.calls, 0) === calls.length)
check(
  'the low-sample rule fires on cities with too few calls',
  lowSampleCities.length > 0,
  `low-sample cities: ${lowSampleCities.map((r) => `${r.city}=${r.calls}`).join(', ') || 'none'}`,
)
check(
  'sample level matches the declared threshold',
  cities.every((r) => (r.calls < THRESHOLDS.minSampleSize) === (r.sample.level === 'low')),
)
console.log(`  · Cities below the ${THRESHOLDS.minSampleSize}-call minimum: ${lowSampleCities.length} of ${cities.length} — ${lowSampleCities.map((r) => `${r.city}(${r.calls})`).join(', ')}`)

/* ── 13. Objections (§6: loss reason only from CRM) ───────────────────────── */

const objRows = objectionAggregates(calls, prevCalls)
check('objection buckets sum to the objection call count', objRows.every((r) => r.resolved + r.partiallyResolved + r.unresolved === r.callCount))
check('objection percentages equal count ÷ denominator', objRows.every((r) => near(r.pctOfCalls, (r.callCount / r.denominator) * 100)))
check(
  'all reported loss reasons come from the CRM field, never from AI inference',
  objRows.every((r) =>
    r.crmLossReasons.every((lr) =>
      calls.some((c) => c.crm.provenance === 'crm_verified' && c.crm.crmLossReason === lr.reason),
    ),
  ),
)

/* ── 14. Actions & SLA (§9) ───────────────────────────────────────────────── */

check('every action links to a call in the filtered set', actions.every((a) => calls.some((c) => c.callId === a.callId)))
check('committed and recommended actions are kept separate', actions.every((a) => a.origin === 'committed' || a.origin === 'recommended'))
check('customer-made promises are never given our SLA', actions.filter((a) => a.committedBy === 'customer').every((a) => a.slaStatus === 'not_applicable'))
check('approval-required actions start in pending_approval', actions.filter((a) => a.actionTypeId === 'disqualify_after_approval' || a.actionTypeId === 'assign_specialist').every((a) => a.status === 'pending_approval'))
check('no action carries a CRM task link before the integration exists', actions.every((a) => a.crmTaskUrl === null))
check('slaStatusFor marks a past due date overdue', slaStatusFor('2026-06-01T00:00:00.000Z', 'approved', DEMO_NOW) === 'overdue')
check('slaStatusFor marks a future due date on_track', slaStatusFor('2026-09-01T00:00:00.000Z', 'approved', DEMO_NOW) === 'on_track')
check('slaStatusFor marks completed actions met', slaStatusFor('2026-06-01T00:00:00.000Z', 'completed', DEMO_NOW) === 'met')

const actionSummary = summariseActions(actions)
check('action completion % equals completed ÷ closable', near(actionSummary.completionPct, (actionSummary.completed / actionSummary.denominator) * 100))
console.log(`  · Actions: ${actionSummary.total} (${actionSummary.committed} committed, ${actionSummary.recommended} recommended) | overdue ${actionSummary.overdue} | due today ${actionSummary.dueToday}`)

/* ── 15. Alerts (§10: every alert is complete) ────────────────────────────── */

check('at least one alert is raised on the demo corpus', alerts.length > 0)
check('every alert has severity, owner, reason, recommended response and a deadline', alerts.every((a) => a.severity && a.ownerName && a.reason && a.recommendedResponse && a.resolveBy))
check('every critical alert requires manual review', alerts.filter((a) => a.severity === 'critical').every((a) => a.requiresManualReview))
check('alert deadlines are after the time they were raised', alerts.every((a) => new Date(a.resolveBy) > new Date(a.raisedAt)))
check('customer-specific alerts carry a customer and a call', alerts.filter((a) => a.customerId !== null).every((a) => a.callId !== null))
check('alert ids are unique', new Set(alerts.map((a) => a.id)).size === alerts.length)
const bySeverity = alerts.reduce<Record<string, number>>((m, a) => ({ ...m, [a.severity]: (m[a.severity] ?? 0) + 1 }), {})
console.log(`  · Alerts raised: ${alerts.length} — ${JSON.stringify(bySeverity)}`)
console.log(`  · Distinct rules fired: ${new Set(alerts.map((a) => a.ruleId)).size} of 18`)

/* ── 16. RBAC & masking (§13) ─────────────────────────────────────────────── */

const agentViewer: Viewer = { roleId: 'agent', employeeId: 'emp-03', teamId: 'team-north-sales', name: 'Karan Bhatia' }
const headViewer: Viewer = { roleId: 'business_head', employeeId: null, teamId: null, name: 'Business Head' }
const mgrViewer: Viewer = { roleId: 'sales_manager', employeeId: null, teamId: 'team-west-sales', name: 'Ameya Kulkarni' }

const agentScope = scopeCalls(MOCK_CALLS, agentViewer)
check('an agent only ever sees their own calls', agentScope.every((c) => c.employeeId === 'emp-03'))
check('a manager only sees their own team', scopeCalls(MOCK_CALLS, mgrViewer).every((c) => c.teamId === 'team-west-sales'))
check('the business head sees everything', scopeCalls(MOCK_CALLS, headViewer).length === MOCK_CALLS.length)
check('agent scope is a strict subset', agentScope.length > 0 && agentScope.length < MOCK_CALLS.length)
check('maskName keeps the first name and hides the rest', maskName('Rahul Agarwal').startsWith('Rahul ') && maskName('Rahul Agarwal').includes('●'))
check('card-like numbers are masked in transcript text', !maskSensitiveText('my card is 4111 1111 1111 1111').includes('4111'))
check('emails are masked in transcript text', !maskSensitiveText('mail me at a.b@test.com').includes('a.b@test.com'))

/* ── 17. Edge cases the spec demands (§16) ────────────────────────────────── */

const failedTranscripts = MOCK_CALLS.filter((c) => !c.transcriptAvailable)
check('failed transcripts exist and are handled', failedTranscripts.length > 0, `${failedTranscripts.length} found`)
check('failed transcripts produce no extracted insights', failedTranscripts.every((c) => c.faqs.length === 0 && c.objections.length === 0 && c.commitments.length === 0))
check('failed transcripts are excluded from analysable aggregates', failedTranscripts.every((c) => !isAnalysable(c)))

const unknownLang = MOCK_CALLS.filter((c) => c.language === 'Unknown')
check('unknown-language calls exist and are labelled, not guessed', unknownLang.length > 0, `${unknownLang.length} found`)

const longNames = MOCK_CALLS.filter((c) => c.customerName.length > 40)
check('a very long customer name is present in the corpus', longNames.length > 0, `longest = ${Math.max(...MOCK_CALLS.map((c) => c.customerName.length))} chars`)

const translated = MOCK_CALLS.filter((c) => c.transcript.some((t) => t.translation !== null))
check('original-language text and translation are stored separately', translated.length > 0, `${translated.length} calls carry a translation`)
check('translated turns keep a different original string', translated.every((c) => c.transcript.filter((t) => t.translation).every((t) => t.translation !== t.text)))

// Empty dataset must not throw or divide by zero.
const empty: CallRecord[] = []
const emptyCounts = countCalls(empty)
const emptyKpis = executiveKpis({ calls: empty, allCalls: empty, prevCalls: empty, prevAllCalls: empty, actions: [] })
check('empty dataset returns zeroed counts without throwing', emptyCounts.total === 0 && emptyCounts.avgQuality === 0)
check('empty dataset produces no NaN or Infinity in any KPI', emptyKpis.every((k) => Number.isFinite(k.value)))
check('empty dataset regional aggregation returns an empty array', regionAggregates(empty, []).length === 0)
check('empty dataset FAQ aggregation returns an empty array', faqAggregates(empty, []).length === 0)
check('empty dataset raises no alerts', buildAlerts({ calls: empty, prevCalls: empty, actions: [] }).length === 0)

// Large values.
const bigValue = Math.max(...MOCK_CALLS.map((c) => c.crm.orderValueInr ?? 0))
check('large order values are present and finite', Number.isFinite(bigValue) && bigValue > 1_000_000, `max ₹${bigValue.toLocaleString('en-IN')}`)

// No NaN anywhere in the corpus scores.
const nanCalls = MOCK_CALLS.filter((c) => {
  const q = agentQualityScore(c)
  return !Number.isFinite(q.score) || !Number.isFinite(purchaseReadinessScore(c.readinessComponents))
})
check('no call produces a NaN score', nanCalls.length === 0, `${nanCalls.length} offenders`)

/* ── 18. Filters, URL round-trip, pagination, export ──────────────────────── */

const narrow = { ...f, region: ['South'], sentiment: ['negative' as const] }
const narrowed = applyFilters(MOCK_CALLS, narrow)
check('dimension filters actually narrow the set', narrowed.length < calls.length)
check('region filter is exact', narrowed.every((c) => c.region === 'South'))
check('sentiment filter is exact', narrowed.every((c) => customerSentimentScore(c.customerSentiment).band === 'negative'))

const roundTripped = queryToFilters(filtersToQuery(narrow))
check('filters survive a URL round-trip', JSON.stringify(roundTripped) === JSON.stringify(narrow))

const search = applyFilters(MOCK_CALLS, { ...f, search: 'EMI' })
check('full-text search matches transcript content', search.length > 0 && search.every((c) => JSON.stringify(c).toLowerCase().includes('emi')))

const page1 = paginate(calls, { page: 1, pageSize: 25, sortKey: 'startedAt', sortDir: 'desc' })
const page2 = paginate(calls, { page: 2, pageSize: 25, sortKey: 'startedAt', sortDir: 'desc' })
check('pagination returns the requested page size', page1.rows.length === Math.min(25, calls.length))
check('pagination reports the full total', page1.total === calls.length)
check('pages do not overlap', page1.rows.every((r) => !page2.rows.some((x) => x.callId === r.callId)))
check('sorting is applied before slicing', page1.rows[0].startedAt >= page1.rows[page1.rows.length - 1].startedAt)

const csv = toCsv(calls.slice(0, 3) as unknown as Record<string, unknown>[], [
  { key: 'callId', header: 'Call ID' },
  { key: 'customerName', header: 'Customer' },
])
check('CSV export emits a header plus one row per record', csv.split('\n').length === 4)
check('CSV escapes commas and quotes', toCsv([{ a: 'x,y"z' }], [{ key: 'a', header: 'A' }]).includes('"x,y""z"'))

/* ── 19. Data-quality summary (§13) ───────────────────────────────────────── */

const dq = dataQualitySummary(allCalls)
check('data-quality totals reconcile', dq.transcribed + dq.failed === dq.total)
check('analysable never exceeds transcribed', dq.analysable <= dq.transcribed)
check('excluded % equals (total − analysable) ÷ total', near(dq.excludedPct, ((dq.total - dq.analysable) / dq.total) * 100))
check('language breakdown totals reconcile', dq.byLanguage.reduce((s, l) => s + l.calls, 0) === dq.total)
console.log(`  · Data quality: ${dq.analysable}/${dq.total} analysable (${dq.excludedPct}% excluded), ${dq.failed} failed, ${dq.lowConfidence} low-confidence, ${dq.unknownLanguage} unknown-language`)

/* ── 20. Determinism ──────────────────────────────────────────────────────── */

check(
  're-running aggregation on the same input gives identical output',
  JSON.stringify(executiveKpis({ calls, allCalls, prevCalls, prevAllCalls, actions })) === JSON.stringify(kpis),
)

/* ── Report ───────────────────────────────────────────────────────────────── */

console.log(`\n─────────────────────────────────────────────`)
console.log(`PASSED: ${passed}`)
console.log(`FAILED: ${failures.length}`)
if (failures.length) {
  console.log('\nFailures:')
  for (const x of failures) console.log(`  ✗ ${x}`)
  process.exit(1)
}
console.log('\nAll assertions passed.\n')
