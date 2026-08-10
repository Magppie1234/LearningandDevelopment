# Assumptions, Missing Dependencies & Build Status

**Deliverable 11 of 12.** Read this before trusting anything else in the folder.

## Build status — honest position

| Layer | Status |
|---|---|
| Taxonomy & controlled vocabularies | ✅ Complete (16 FAQs, 13 objections, 14 action types, 6 compliance flags, 18 alert rules, 6 roles) |
| Typed data model (§14) | ✅ Complete |
| Demo corpus generator | ✅ Complete — 420 calls from 14 authored scenarios |
| Scoring engine (3 scores, §7) | ✅ Complete |
| Metrics & aggregation (§2–§8) | ✅ Complete |
| Filter model + URL round-trip (§12) | ✅ Complete |
| Action & SLA engine (§9) | ✅ Complete |
| Alert rules engine (§10) | ✅ Complete |
| RBAC, masking, audit model (§13) | ✅ Complete (client-side; server enforcement pending) |
| Data-service layer + adapters (§16) | ✅ Contracts complete, mock implementation live |
| Validation harness | ✅ 105 assertions, all passing |
| **React UI — 10 pages** | ❌ **Not built** |
| **Routes under `/call-intelligence`** | ❌ **Not built** |
| **Sidebar navigation entry** | ❌ **Not added** |
| **Live integrations** | ❌ **None connected** |

Everything a page needs is available through one call:
`loadDataset(filters, viewer)` in `src/lib/call-intelligence/service.ts`.
The remaining work is presentation, not logic.

## Assumptions made (and why)

| # | Assumption | Rationale | Risk if wrong |
|---|---|---|---|
| 1 | Brand is **Sunroof**; taxonomy stays kitchen-industry | User chose this explicitly when asked | Low — brand is a constant; taxonomy is one file |
| 2 | The existing transcription feature produces **speaker-separated** turns with timestamps | Stated in the brief | High — talk metrics and evidence linkage both depend on it |
| 3 | Sentiment is **transcript-text only** | No audio-feature pipeline exists | None — this is stated on every screen |
| 4 | Revenue attribution is **last-call-touch** | Simplest defensible model | Medium — multi-touch attribution will change reported revenue |
| 5 | Default window 28 days, comparison the preceding 28 | Aligns with monthly review cadence | Low — configurable |
| 6 | Confidence gate at **0.70** | Industry-typical; not yet tuned on Sunroof audio | Medium — must be recalibrated on real STT output |
| 7 | Minimum sample size **20** | Below this, rate noise dominates | Low |
| 8 | Sales teams map to regions; service is national | Typical structure for this business | Medium — needs confirming against the real org chart |
| 9 | 4 of 6 compliance flags are "critical" | Discount, mis-selling, data exposure, legal threat | Low — configurable list |
| 10 | Purchase Readiness weights are the spec's recommendation | Not yet calibrated | **High — do not call it conversion probability** |

## Missing dependencies — blocking

| # | Dependency | Blocks | Owner |
|---|---|---|---|
| 1 | **Diarisation confidence** from the STT service | Talk-to-listen, interruptions, silence, speaking time (§8) | Engineering + STT vendor |
| 2 | **Telephony API** access | Everything — call metadata and recordings | Contact Centre Ops |
| 3 | **CRM read access** (Zoho) keyed by call/phone | Geography, product, stage, conversion, loss reason, revenue | Sales Ops |
| 4 | **Approved knowledge base** | Answer-accuracy scoring. Only relevance/completeness can be scored without it — currently 2 of 16 FAQs have no article | Sales Enablement |
| 5 | **Approved discount matrix** | The `unapproved_discount` rule needs a real threshold, not a placeholder | Sales Head |
| 6 | **Task system API** | Action write-back; `crmTaskUrl` is `null` until then | Sales Ops |
| 7 | **Server-side RBAC enforcement** | Any real customer data | Engineering |
| 8 | **Legal sign-off** on AI analysis of recorded calls | Go-live | Legal / DPO |

## Missing dependencies — non-blocking but material

| Dependency | Effect while missing |
|---|---|
| Historical call→order outcomes (≥ 2 quarters) | Purchase Readiness cannot be calibrated; must stay labelled "readiness, not probability" |
| Complaint-system API | Complaint severity and unresolved-complaint alerts run on CRM proxies only |
| Order/payment system | Revenue shown only where a CRM order exists |
| HRMS team/manager feed | Team and manager are denormalised onto the call record manually |
| Call-purpose disposition from the dialler | Purpose is currently derived from campaign, which is weaker |

## Fields explicitly NOT invented

Per §14, these are typed `null` with provenance `not_available` rather than
estimated, and the UI must render them as "Not available — integration
pending":

- `crmTaskUrl` — every action, until the task system is wired
- `crm.*` — every field, for the ~28% of calls with no matching CRM record
- `crmLossReason` — never substituted with the AI's hesitation summary
- `answerAccuracy` — for FAQs with no approved KB article
- `dynamics.*` — where diarisation confidence is below 0.75
- `recordingUrl` — for failed transcriptions

## Known limitations to state on screen

1. **Transcript sentiment misreads sarcasm and cultural politeness.** Treat a
   single call as a signal, a segment as a measure.
2. **Purchase Readiness is uncalibrated.** It ranks opportunities; it does not
   forecast revenue.
3. **Quality scores are developmental.** Consistent with the portal's existing
   §19 stance, they must not be the sole basis for compensation, promotion or
   disciplinary action.
4. **The demo corpus has no strong period-over-period drift**, so 5 of 18 alert
   rules did not fire during validation. Re-verify against the first real month.
5. **Small-city samples are almost all below the minimum** (11 of 13 cities).
   City-level analysis needs either a longer window or aggregation to state.

## Recommended sequence to production

1. Build the 10 UI pages against `loadDataset()` (no logic changes needed).
2. Wire the telephony + STT adapters; confirm diarisation confidence exists.
3. Re-tune `minTranscriptConfidence` and `minDiarisationConfidence` on real audio.
4. Wire the CRM adapter; verify conversion denominators against a manual count.
5. Move RBAC and pagination server-side.
6. Author the missing KB articles (finance/EMI, competitor comparison).
7. Run 4 weeks shadow-mode: managers correct AI outputs, nothing auto-executes.
8. Calibrate Purchase Readiness against the accumulated outcomes.
9. Only then enable action write-back to the task system.
