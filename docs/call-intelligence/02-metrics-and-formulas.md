# Metric Definitions & Formulas

**Deliverable 4 of 12.** Implemented in `src/lib/call-intelligence/metrics.ts`.
Every formula below is asserted by `npm run validate:ci`.

## Governing rules

1. **Every percentage ships with its numerator and denominator.** The `Metric`
   type makes `numerator`/`denominator` non-optional for percentage units, and
   the validation harness fails the build if a percentage KPI omits them.
2. **AI-inferred and CRM-verified numbers never share a denominator.** The
   funnel visibly switches denominator at the CRM boundary and says so.
3. **Low-confidence transcripts are excluded from management aggregates** but
   remain visible on the Data Quality page, so exclusions are auditable.
4. **A rate over a small sample is labelled, not hidden.** Below 20 analysed
   calls a segment reads "Low sample — not a trend".

## Population definitions

| Term | Definition |
|---|---|
| **Total calls** | Every call record in the window, before any filter. |
| **Transcribed** | `transcriptAvailable === true`. |
| **Analysable** | Transcribed **and** `transcriptionConfidence ≥ 0.70` **and** `extractionConfidence ≥ 0.70`. This is the denominator for all AI-derived metrics. |
| **Meaningful** | Outcome ∈ {Meaningful conversation, Information shared, Follow-up scheduled, Site visit booked, Quotation requested, Complaint logged}. Excludes not-connected, wrong number, dropped. |
| **CRM-linked** | `crm.provenance === 'crm_verified'`. The only denominator for conversion and revenue. |

## Executive KPIs

| KPI | Formula | Denominator | Provenance |
|---|---|---|---|
| Total calls | count(calls in window) | — | System |
| Successfully transcribed | count(transcriptAvailable) | Total calls | System |
| Transcription coverage | transcribed ÷ total × 100 | **Total calls (pre-gate)** | System |
| Unique customers | distinct(customerId) | — | CRM |
| Meaningful conversations | count(outcome ∈ meaningful) | Analysable | Mixed |
| Positive sentiment | count(sentiment ≥ 60) ÷ analysable × 100 | Analysable | AI (text) |
| Neutral sentiment | count(40 ≤ sentiment < 60) ÷ analysable × 100 | Analysable | AI (text) |
| Negative sentiment | count(sentiment < 40) ÷ analysable × 100 | Analysable | AI (text) |
| Sentiment improvement rate | count(closing − opening ≥ 5) ÷ analysable × 100 | Analysable | AI (text) |
| High purchase readiness | count(readiness ≥ 70) | Analysable | AI |
| Average agent quality | mean(quality score) over calls with > 2 turns | Conversational calls | AI |
| Calls with a next action | count(≥1 employee commitment) ÷ meaningful × 100 | **Meaningful** | AI |
| Actions due today | count(slaStatus = due_today) | All open actions | AI |
| Overdue actions | count(slaStatus = overdue) | All open actions | AI |
| Unanswered questions | Σ FAQs with answerStatus = unanswered (deduped per call) | Analysable | AI |
| Critical complaints | count(complaintLogged ∧ severity = critical) | CRM-linked | **CRM** |
| Critical compliance failures | count(≥1 critical compliance flag) | Analysable | AI |
| Call-to-opportunity | opportunities ÷ CRM-linked × 100 | **CRM-linked** | **CRM** |
| Call-to-order | orders ÷ CRM-linked × 100 | **CRM-linked** | **CRM** |
| Revenue influenced | Σ orderValueInr where CRM-verified ∧ orderPlaced | CRM-linked | **CRM** |

**Revenue attribution is last-call-touch.** Calls with no CRM link contribute
zero — they are not estimated, extrapolated or pro-rated.

## Sentiment

Sentiment is **text-based**, computed from transcript turns only. No audio
feature is analysed; the UI must never label it "tone" or "emotion detection".

```
turnSentiment      ∈ [−1, +1]           per turn, customer turns only
opening / middle / closing = mean of each third of the customer's turns
overall            = mean of all customer turns
score              = ((s + 1) ÷ 2) × 100        → 0..100
band               = ≥60 positive | 40–59 neutral | <40 negative
shift              = closingScore − openingScore
improved           = shift ≥ +5
deteriorated       = shift ≤ −5
```

Employee sentiment is computed identically over agent turns and stored
separately. **A negative customer is never evidence of poor agent
performance** — the two scores are never combined.

## FAQ metrics

Deduplicated per call: one FAQ id counts at most once per call, however many
times it is asked. Enforced by `dedupeFaqs()` and asserted in validation.

| Field | Formula |
|---|---|
| Call count | calls containing the FAQ (deduped) |
| Unique customers | distinct customerId among those calls |
| % of analysed calls | callCount ÷ analysable × 100 |
| Period-over-period trend | (current − previous) ÷ previous × 100; `null` when previous = 0 |
| Unanswered rate | unanswered ÷ callCount × 100 |
| Avg response time | mean(answerTurn.startSec − questionTurn.endSec) |
| Sentiment after answer | mean customer sentiment over the 3 turns following the answer |
| Repeat-contact rate | customers with >1 call in the corpus ÷ customers asking this FAQ |
| Conversion impact | orders ÷ CRM-linked calls containing the FAQ × 100 |
| Answer relevance | always scored |
| **Answer accuracy** | **scored only where an approved KB article exists; otherwise `null`** |

Two FAQs currently have no approved article — *Payment & finance* and
*Competitor comparison*. Accuracy is `null` for both, by design.

## Objection metrics

| Field | Formula |
|---|---|
| Call count | calls containing the objection (deduped per call) |
| Avg intensity | mean(1–3) |
| Resolution rate | resolved ÷ callCount × 100 |
| Customer reaction | mean(post-exchange customer sentiment − objection-turn sentiment) |
| Technique effectiveness | resolved ÷ used, per technique |
| **Loss reason** | **read from `crm.crmLossReason` only.** The AI's hesitation summary is stored separately and never presented as the loss reason. |

## Regional metrics

Every regional figure is published **twice**: raw count and rate per 100
analysed calls, with the sample size and a confidence label.

```
ratePer100 = count ÷ callsInSegment × 100
sample     = n ≥ 60 reliable | n ≥ 20 indicative | n < 20 "Low sample — not a trend"
```

## Agent metrics

Talk-to-listen ratio, interruptions, longest silence and speaking time are
**only computed when `dynamics.reliable === true`** (diarisation confidence
≥ 0.75 and more than two turns). In this corpus that suppresses the metrics on
113 of 420 calls. Where unreliable, the UI shows "Not measurable — diarisation
confidence too low", never a zero.

```
talkToListenRatio = agentTalkSec ÷ (agentTalkSec + customerTalkSec)
```

## Comparison periods

Default window is the last 28 days; the comparison window is the immediately
preceding 28 days. Windows never overlap (asserted). Both are displayed on
every chart and KPI.

```
deltaPct = (current − previous) ÷ |previous| × 100   → null when previous = 0
```

## Empty, zero and null handling

- Division by zero returns `0`, never `NaN` or `Infinity` (asserted).
- A day with no calls reports `avgSentiment: null`, not `0` — an empty day is
  not a neutral day.
- A field the transcript never mentioned is `null` and renders as
  "Not mentioned", never as a default or an average.
