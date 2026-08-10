# Role-Based Access & Data/AI Governance

**Deliverable 10 of 12.** Implementation: `src/lib/call-intelligence/rbac.ts`.

> **Security boundary.** The policy in `rbac.ts` is applied client-side for the
> demo. In production the *same policy object* must be evaluated **server-side**
> before rows leave the API. Client-side masking is a UX affordance, not a
> security control. This is a blocking item before any real customer data is
> loaded.

## Roles

| Role | Scope | Sees revenue | Sees customer PII | Can correct AI | Can approve actions |
|---|---|---|---|---|---|
| **Business Head** | All regions | ✅ | Masked | — | — |
| **Sales Manager** | Own team | — | Masked | ✅ | ✅ |
| **Customer Service Manager** | Own team | — | Masked | ✅ | ✅ |
| **Quality Analyst** | All regions | — | Masked | ✅ | — |
| **Compliance Officer** | All regions | — | ✅ | — | — |
| **Employee (Agent)** | Own calls only | — | Masked | — | — |

### Page access

| Page | Head | Sales Mgr | Svc Mgr | Quality | Compliance | Agent |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| Executive Overview | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Customer Voice | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| FAQs & Knowledge Gaps | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| Regional Intelligence | ✅ | ✅ | ✅ | — | — | — |
| Sales & Objections | ✅ | ✅ | — | — | — | — |
| Agent Quality | ✅ | ✅ | ✅ | ✅ | — | ✅ (own) |
| Next-Action Tracker | ✅ | ✅ | ✅ | — | — | ✅ (own) |
| Call Explorer | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (own) |
| Alerts & Escalations | ✅ | ✅ | ✅ | — | ✅ | — |
| Data Quality & Config | ✅ | — | — | ✅ | ✅ | — |

### Row-level scoping

Applied **before** any aggregation, never after — otherwise an agent could
infer team-level numbers from a company-level total.

```
view_all_regions → everything
view_own_team    → calls where teamId === viewer.teamId
view_own_calls   → calls where employeeId === viewer.employeeId
```

Asserted in validation: an agent viewer sees a strict, non-empty subset;
a manager sees exactly their team; the business head sees the full corpus.

## Data & AI governance controls

| # | Control | How it is implemented |
|---|---|---|
| 1 | Distinguish AI-inferred from CRM-verified | `Provenance` on every outcome; the funnel visibly switches denominator at the CRM boundary and says so |
| 2 | Confidence on every insight | Mandatory `confidence` on FAQ, objection, commitment, recommendation, and every `AiField<T>` |
| 3 | Exclude low-confidence from aggregates | `isAnalysable()` gate at 0.70; exclusions counted and shown on the Data Quality page |
| 4 | "Not mentioned" instead of assumptions | `null` values render as "Not mentioned"; missing budget scores 0, never the mean |
| 5 | Analyse in the original language | `TranscriptTurn.text` holds the original; extraction runs on it |
| 6 | Translation shown separately | `TranscriptTurn.translation` is a distinct field, never overwrites `text` |
| 7 | Mask sensitive customer info | `maskCall`, `maskName`, `maskSensitiveText` (card/long-number/email patterns) |
| 8 | Role-based access | `ROLES`, `can()`, `canOpen()`, `scopeCalls()` |
| 9 | Audit logs | `AuditEntry` with 9 auditable actions |
| 10 | Taxonomy & model versions stored | `taxonomyVersion` + `modelVersions` on every record |
| 11 | Managers can correct AI output | `correctedBy` / `correctedAt`; corrected values take provenance `human_corrected` |
| 12 | Critical alerts reviewed manually | `requiresManualReview: true` on every critical alert (asserted) |
| 13 | No sensitive-attribute scoring | `PROHIBITED_SCORING_ATTRIBUTES` + explicit prompt constraints |

## Masking rules

| Data | Masked form | Who sees the real value |
|---|---|---|
| Customer name | `Rahul A●●●●●●` — first name kept for usability | Compliance Officer |
| Phone | `+91 ●●●●● ●●●●●` | Compliance Officer |
| Card-like numbers in transcript | `●●●● ●●●● ●●●● ●●●●` | Nobody — masked at rest |
| Long numeric strings (6+) | `●●●●●●` | Nobody |
| Email addresses | `●●●●@●●●●` | Nobody |
| Order value | hidden unless `view_revenue` | Business Head |
| Recording URL | hidden unless `view_recording` | All except Agent-of-other-calls |

Masking is applied to the **record itself** in the service layer, so a masked
value cannot leak through a chart tooltip, a CSV export or a URL.

## Audit log

Recorded actions: `view_transcript`, `correct_extraction`, `approve_action`,
`reject_action`, `reschedule_action`, `complete_action`, `resolve_alert`,
`export`, `change_filters`.

Each entry: `{ id, at, actor, role, action, target, detail }`.

Retention should match the recording-retention policy. **Open question for
Legal:** how long call recordings and derived transcripts may be retained under
the DPDP Act, and whether customers must be told that calls are analysed by AI
rather than only recorded. See `09-assumptions-and-gaps.md`.

## Correction workflow

1. A manager opens a call and edits an extracted field (FAQ classification,
   objection, commitment, next action).
2. The record gets `correctedBy` + `correctedAt`; the field's provenance
   becomes `human_corrected`.
3. An audit entry is written.
4. Aggregates recompute from the corrected value — corrections are not a
   cosmetic overlay.
5. Corrections accumulate as the **evaluation set** for the next model version.
   This is the single highest-value governance loop in the product: it is what
   turns manager scepticism into training data.

## Model & taxonomy versioning

`MODEL_VERSIONS` = transcription `stt-diarised-v2.4`, sentiment
`text-sentiment-v1.3 (transcript-only)`, extraction `convo-extract-v1.1`,
scoring `scoring-rules-v1.0.0`. `TAXONOMY_VERSION` = `1.0.0`.

Rule: **never mix taxonomy versions in one aggregate.** When the taxonomy
changes, either re-extract the history or fence the comparison period. The
version is stamped per record so this is detectable rather than silent.
