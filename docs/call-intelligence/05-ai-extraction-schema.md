# AI Extraction Schema

**Deliverable 7 of 12.** One LLM call per transcript returns this object.
TypeScript source of truth: `src/lib/call-intelligence/types.ts`.

## Contract rules the extractor must obey

1. **Every insight carries evidence.** `turnIndex` must be a real index into
   the transcript array passed in. No evidence → drop the insight.
2. **Never guess.** If the transcript does not state it, emit `null`. The UI
   renders `null` as "Not mentioned".
3. **Deduplicate within a call.** The same FAQ id must appear at most once per
   call, however many times the customer asks it.
4. **Politeness is not intent.** "Thank you so much" is not a buying signal.
   `explicitIntent` requires explicit words about buying, booking or paying.
5. **Separate what was promised from what you recommend.** `commitments` =
   things actually said on the call. `recommendedActions` = your proposals.
   Never merge them.
6. **Analyse in the original language.** Put original text in `text`,
   English in `translation`. Do not translate-then-analyse.
7. **Accuracy only against approved sources.** Emit `answerAccuracy: null`
   when the FAQ has no approved knowledge-base article.
8. **Never use sensitive attributes.** Accent, gender, community, caste,
   religion, age and name must not influence any field.

## JSON Schema (abbreviated)

```jsonc
{
  "summary": "string — 2–3 sentences, factual, no speculation",
  "topics": ["string"],

  "faqs": [{
    "faqId": "pricing_discounts | features_benefits | series_comparison | customisation | design_drawings_measurement | installation_process | delivery_timeline | warranty_amc | service_complaint | payment_finance | product_quality | serviceable_locations | competitor_comparison | documents_process | availability | technical_specs",
    "originalQuestion": "string — verbatim",
    "kind": "explicit | implicit",
    "answerStatus": "fully_answered | partially_answered | unanswered",
    "responseTimeSec": "number | null",
    "sentimentAfter": "number(-1..1) | null",
    "answerRelevance": "number(0..100)",
    "answerAccuracy": "number(0..100) | null   // null when no approved KB article",
    "escalationRequired": "boolean",
    "confidence": "number(0..1)",
    "evidence": { "turnIndex": "int", "timestampSec": "number", "quote": "string" }
  }],

  "objections": [{
    "objectionId": "price_discount | budget | timing | product_suitability | product_quality | trust | installation | warranty_service | competitor_preference | decision_maker_unavailable | serviceability | payment_terms | not_interested",
    "intensity": "1 | 2 | 3",
    "employeeResponse": "string — verbatim agent reply",
    "technique": "Acknowledge & clarify | Feel-felt-found | Value reframe | Evidence / proof point | Comparison table | Trial close | Escalate to specialist | No technique detected",
    "resolution": "resolved | partially_resolved | unresolved",
    "customerReaction": "number(-1..1)",
    "confidence": "number(0..1)",
    "evidence": { "turnIndex": "int", "timestampSec": "number", "quote": "string" }
  }],

  "commitments": [{
    "actionTypeId": "call_back | send_catalogue | share_quotation | schedule_meeting | schedule_demo | arrange_site_visit | share_design | arrange_measurement | technical_clarification | payment_followup | escalate_complaint | assign_specialist | nurture | disqualify_after_approval",
    "party": "employee | customer",
    "text": "string — what was said",
    "spokenDueAt": "ISO datetime | null",
    "confidence": "number(0..1)",
    "evidence": { "turnIndex": "int", "timestampSec": "number", "quote": "string" }
  }],

  "recommendedActions": [{
    "actionTypeId": "…same enum…",
    "reason": "string — why, referencing the conversation",
    "priority": "critical | high | medium | low",
    "confidence": "number(0..1)",
    "evidence": "Evidence | null"
  }],

  "signals": {
    "customerNeed":     { "value": "string|null", "confidence": 0.0, "evidence": "Evidence|null" },
    "productInterest":  { "value": "string|null", "confidence": 0.0, "evidence": "Evidence|null" },
    "budgetInr":        { "value": "number|null", "confidence": 0.0, "evidence": "Evidence|null" },
    "purchaseTimeline": { "value": "immediate|within_1_month|within_3_months|later|null", "confidence": 0.0, "evidence": "Evidence|null" },
    "decisionMaker":    { "value": "sole|joint|not_decision_maker|null", "confidence": 0.0, "evidence": "Evidence|null" },
    "requestedQuotation": false, "requestedDemo": false,
    "requestedSiteVisit": false, "requestedDesign": false,
    "buyingSignals": ["string"], "crossSellOpportunities": ["string"],
    "competitorMentions": ["string"], "discountRequested": false,
    "hesitationReasons": ["string"],
    "aiHesitationSummary": "string|null   // NEVER presented as the CRM loss reason"
  },

  "themes": {
    "appreciation": ["string"], "dissatisfaction": ["string"],
    "featureRequests": ["string"], "expectations": ["string"], "painPoints": ["string"]
  },

  "emotions": {
    "frustration": 0.0, "confusion": 0.0, "hesitation": 0.0, "urgency": 0.0,
    "trust": 0.0, "interest": 0.0, "satisfaction": 0.0
  },

  "customerSentiment": { "opening": 0.0, "middle": 0.0, "closing": 0.0, "overall": 0.0 },
  "employeeSentiment": { "opening": 0.0, "middle": 0.0, "closing": 0.0, "overall": 0.0 },
  "unresolvedNegative": false,

  "qualityComponents": {
    "openingIntroduction": 0, "permissionToContinue": 0, "discoveryQuestions": 0,
    "needIdentification": 0, "activeListening": 0, "productKnowledge": 0,
    "answerRelevance": 0, "answerAccuracy": null, "objectionHandling": 0,
    "empathy": 0, "communicationClarity": 0, "professionalism": 0,
    "scriptAdherence": 0, "nextStepClarity": 0, "solutionRelevance": 0
  },

  "readinessComponents": {
    "needAndFit": 0, "explicitIntent": 0, "timeline": 0, "nextStepCommitment": 0,
    "decisionAuthority": 0, "budgetReadiness": 0, "sentiment": 0
  },

  "complianceFlags": ["unapproved_discount | false_commitment | missing_disclosure | sensitive_data_exposure | no_permission_to_continue | legal_threat_unescalated"],

  "extractionConfidence": 0.0,
  "taxonomyVersion": "1.0.0"
}
```

## Fields computed by the platform, NOT the model

These are derived deterministically from the transcript and must not be
supplied by the LLM — the reference implementation computes them in
`src/data/call-intelligence/mock-dataset.ts` and they are asserted in
validation:

- `dynamics.*` — talk seconds, talk-to-listen ratio, interruptions, longest
  silence, and the `reliable` gate. From timestamps + diarisation confidence.
- `customerSentiment` / `employeeSentiment` phases — mean of each third of that
  speaker's turns. (The model supplies per-turn sentiment; the platform
  aggregates.)
- `faqs[].responseTimeSec` — `answerTurn.startSec − questionTurn.endSec`.
- All three composite scores — see `06-scoring-methodology.md`.

Keeping these out of the model's hands means an aggregate can always be
re-derived and audited against the raw transcript.

## Prompt skeleton

```
SYSTEM
You extract structured business intelligence from a speaker-separated sales or
service call transcript for Sunroof, a maker of 100% engineered-stone kitchens.

Return ONLY the tool call. Obey these rules without exception:
- Every faq, objection and commitment MUST include evidence.turnIndex pointing
  at a real turn in the transcript provided. If you cannot cite a turn, omit
  the item entirely.
- If something was not said, return null. Never infer, average or default.
- Do not count the same faqId twice in one call.
- Politeness, warmth and thanks are NOT buying intent.
- Put commitments (what was actually promised) and recommendedActions (what you
  suggest) in separate arrays. Never move an item between them.
- Set answerAccuracy to null unless an approved knowledge-base article is
  supplied for that FAQ in APPROVED_KB.
- Never let accent, gender, community, religion, caste, age or the customer's
  name influence any score or field.
- Analyse the transcript in its original language.

USER
TAXONOMY: <FAQ_CATEGORIES, OBJECTIONS, ACTION_TYPES, COMPLIANCE_FLAGS ids>
APPROVED_KB: <faqId → article id, omitted where none exists>
TRANSCRIPT: [{ index, speaker, startSec, endSec, text }]
```

## Quality gates before a result is persisted

| Gate | Rule | On failure |
|---|---|---|
| Evidence integrity | every `turnIndex < transcript.length` | drop the insight |
| Timestamp match | `evidence.timestampSec === transcript[turnIndex].startSec` | repair from the turn |
| FAQ dedupe | unique `faqId` per call | keep first occurrence |
| Enum validity | all ids ∈ taxonomy | drop the insight, log |
| Confidence floor | `extractionConfidence ≥ 0.70` | flag; exclude from aggregates |
| Accuracy guard | `answerAccuracy === null` where no KB article | force to `null` |

All six are implemented as assertions in `npm run validate:ci`.
