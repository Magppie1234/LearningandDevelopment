# Data Dictionary

**Deliverable 5 of 12.** Canonical types: `src/lib/call-intelligence/types.ts`.
Controlled vocabularies: `src/data/call-intelligence/taxonomy.ts`.

Legend for **Source**:
`TEL` telephony · `STT` transcription · `CRM` CRM · `ORD` order system ·
`CMP` complaint system · `AI` extraction model · `CFG` configuration ·
**`GAP`** = no upstream system supplies this today (see `09-assumptions-and-gaps.md`).

## `CallRecord` — identity & routing

| Field | Type | Source | Notes |
|---|---|---|---|
| `callId` | string | TEL | Primary key. Unique (asserted). |
| `customerId` | string | CRM | Lead/customer id. `GAP` when the number is not in CRM → outcomes become `null`. |
| `customerName` | string | CRM | Masked per role before leaving the service layer. |
| `customerPhoneMasked` | string | TEL | Never stored unmasked in the analytics store. |
| `employeeId` | string | TEL/HRMS | |
| `teamId` | string | HRMS | |
| `managerName` | string | HRMS | Denormalised for filtering. |
| `startedAt` | ISO datetime | TEL | UTC. |
| `durationSec` | number | TEL | |
| `direction` | `inbound` \| `outbound` | TEL | |
| `callPurpose` | enum(7) | CRM/CFG | `GAP` — currently inferred from campaign; needs a dialler disposition field. |
| `recordingUrl` | string \| null | TEL | Short-lived signed URL in production. |

## Transcription & language

| Field | Type | Source | Notes |
|---|---|---|---|
| `transcript[]` | `TranscriptTurn[]` | STT | Speaker-separated. |
| `TranscriptTurn.speaker` | `customer` \| `agent` | STT | Diarisation output. |
| `TranscriptTurn.startSec` / `endSec` | number | STT | Drives audio seek + response-time maths. |
| `TranscriptTurn.text` | string | STT | **Original language.** |
| `TranscriptTurn.translation` | string \| null | STT | English, stored and displayed **separately**. |
| `TranscriptTurn.sentiment` | −1..+1 | AI | Text only. |
| `TranscriptTurn.confidence` | 0..1 | STT | |
| `language` | enum(7) incl. `Unknown` | STT | Never inferred from name or region. |
| `transcriptionConfidence` | 0..1 | STT | Gate for management aggregates (≥ 0.70). |
| `diarisationConfidence` | 0..1 | STT | Gate for talk-ratio metrics (≥ 0.75). |
| `transcriptAvailable` | boolean | STT | `false` = failed transcription. |

## Geography — CRM fields only

| Field | Type | Source | Notes |
|---|---|---|---|
| `region` / `state` / `city` / `pincode` | string | CRM | **Never inferred from accent, language, name or any other characteristic (§5).** |

## Commercial context

| Field | Type | Source |
|---|---|---|
| `brand`, `businessUnit` | string | CFG |
| `productId`, `productSeriesId` | string \| null | CRM |
| `leadSource` | enum(5) | CRM |
| `campaign` | enum(6) | CRM |
| `crmStage` | enum(8) | CRM |
| `customerSegment` | enum(5) | CRM |
| `callOutcome` | enum(9) | TEL + AI |

## `CrmOutcome` — verified facts only

| Field | Type | Source | Notes |
|---|---|---|---|
| `opportunityCreated` | boolean \| null | CRM | `null` when no CRM record exists. |
| `orderPlaced` | boolean \| null | ORD | |
| `orderValueInr` | number \| null | ORD | Only source for revenue. |
| `paymentStatus` | enum \| null | ORD | |
| `complaintLogged` | boolean \| null | CMP | |
| `complaintSeverity` | `critical`\|`major`\|`minor`\|null | CMP | |
| `crmLossReason` | string \| null | CRM | **The only loss reason shown anywhere.** |
| `provenance` | `crm_verified` \| `not_available` | — | Drives the visual weight of the value. |

## AI extraction

| Field | Type | Notes |
|---|---|---|
| `summary` | string | Always labelled "AI-generated". |
| `topics[]` | string[] | |
| `faqs[]` | `ExtractedFaq[]` | Deduped per call. Each carries mandatory `evidence`. |
| `objections[]` | `ExtractedObjection[]` | intensity 1–3, technique, resolution, customer reaction, evidence. |
| `commitments[]` | `ExtractedCommitment[]` | **What was explicitly promised.** `party` = employee \| customer. |
| `recommendedActions[]` | `RecommendedAction[]` | **What the system suggests.** Kept structurally separate from commitments. |
| `signals` | `SalesSignals` | Need, product interest, budget, timeline, decision-maker, requests, buying signals, cross-sell, competitors, discount, hesitation. |
| `themes` | `VoiceThemes` | appreciation / dissatisfaction / featureRequests / expectations / painPoints. |
| `emotions` | `EmotionSignals` (0..1) | frustration, confusion, hesitation, urgency, trust, interest, satisfaction. **Text-derived, not voice-tone.** |
| `customerSentiment` / `employeeSentiment` | `SentimentPhases` | opening / middle / closing / overall. Tracked separately. |
| `unresolvedNegative` | boolean | Ended negative. |
| `qualityComponents` | `QualityComponents` (15 params) | `answerAccuracy` is `null` without an approved KB article. |
| `dynamics` | `ConversationDynamics` | `reliable` gates every talk metric. |
| `readinessComponents` | `ReadinessComponents` (7 params) | |
| `complianceFlags[]` | `ComplianceFlagId[]` | Critical flags reported separately from quality. |

## `AiField<T>` — the confidence envelope

Every soft-extracted scalar is wrapped:

```ts
{ value: T | null, confidence: number, provenance: Provenance, evidence: Evidence | null }
```

`value: null` renders as **"Not mentioned"**, never as a default.

## `Evidence` — mandatory on every insight

```ts
{ turnIndex: number, timestampSec: number, quote: string }
```

Validation asserts every FAQ, objection and commitment points at a transcript
turn that exists, and that the timestamp matches that turn.

## Provenance & versioning

| Field | Type | Notes |
|---|---|---|
| `extractionConfidence` | 0..1 | Gate for management aggregates. |
| `taxonomyVersion` | string | Currently `1.0.0`. |
| `modelVersions` | record | transcription / sentiment / extraction / scoring. |
| `correctedBy` / `correctedAt` | string \| null | Set when a manager corrects an AI output. |

## Derived records

**`ActionRecord`** — id, callId, customerId, customerName, `origin`
(`committed` \| `recommended`), actionTypeId, committedBy, owner, teamId,
region, priority, dueAt, channel, reason, evidence, confidence, status,
slaStatus, `crmTaskUrl` (**`GAP` — null until the task system is wired**).

**`AlertRecord`** — id, ruleId, severity, title, subject, customerId, callId,
ownerName, reason, evidence, evidenceNote, recommendedResponse, resolveBy,
raisedAt, requiresManualReview, status.

## Controlled vocabularies

| Vocabulary | Count | Location |
|---|---|---|
| FAQ categories | 16 | `FAQ_CATEGORIES` |
| Objection types | 13 | `OBJECTIONS` |
| Objection techniques | 8 | `OBJECTION_TECHNIQUES` |
| Action types | 14 | `ACTION_TYPES` (each with SLA hours + approval requirement) |
| Compliance flags | 6 (4 critical) | `COMPLIANCE_FLAGS` |
| Alert rules | 18 | `ALERT_RULES` |
| Roles | 6 | `ROLES` |
| Call outcomes | 9 | `CALL_OUTCOMES` |
| CRM stages | 8 | `CRM_STAGES` |
| Languages | 7 incl. `Unknown` | `LANGUAGES` |

## Thresholds (single source of truth: `THRESHOLDS`)

| Name | Value | Effect |
|---|---|---|
| `minTranscriptConfidence` | 0.70 | Excludes from management aggregates |
| `minDiarisationConfidence` | 0.75 | Suppresses talk-ratio metrics |
| `minSampleSize` | 20 | "Low sample — not a trend" |
| `highIntentScore` | 70 | High purchase readiness |
| `severeNegativeScore` | 25 | Severe-negative alert |
| `coachingQualityScore` | 65 | Coaching recommendation |
| `emergingTrendRise` | 0.50 | FAQ/objection spike alert |
