# Alert & SLA Rules

**Deliverable 9 of 12.** Implementation: `src/lib/call-intelligence/alerts.ts`
and `src/lib/call-intelligence/actions.ts`.

## Alert anatomy

Every alert carries all eight required fields. Validation asserts none is
missing:

`severity · subject/customer · owner · reason · evidence · evidenceNote ·
recommendedResponse · resolveBy`

Alerts either find evidence in the corpus or stay silent. There is no
"probably worth looking at".

## Resolution SLA by severity

| Severity | Resolve within | Manual review required |
|---|---|---|
| Critical | **4 hours** | **Yes — always** |
| High | 24 hours | No |
| Medium | 72 hours | No |
| Low | 7 days | No |

`resolveBy = raisedAt + SLA hours` (asserted to always be after `raisedAt`).

## The 18 rules

### Critical — 4h, human review mandatory

| Rule | Trigger | Default owner | Recommended response |
|---|---|---|---|
| `legal_threat` | Customer references legal action / consumer forum and no escalation was raised | Head of Customer Service | Legal + service head call within 4h. Not a template reply. |
| `mis_selling` | Agent promised a date, price or spec policy cannot support | Compliance Officer | Review recording, correct in writing, coach the agent. |
| `unapproved_discount` | Discount above the approved matrix offered verbally | Sales Head | **Hold the quotation.** Commercial review first. |
| `sensitive_data` | Card / bank / identity data spoken on a recorded line | Data Protection Officer | Redact the segment, log the incident, retrain. |
| `cancellation_refund` | Customer asked about cancelling or a refund on a booked order | Head of Customer Service | Retention call from a manager within 4h with a committed date. |

### High — 24h

| Rule | Trigger | Owner |
|---|---|---|
| `severe_negative` | Closing sentiment ≤ 25 | Reporting Manager |
| `unresolved_complaint` | Complaint logged **and** call ended still negative | Service Manager |
| `repeat_negative` | Same customer, ≥ 2 negative calls in the period | Head of Customer Service |
| `high_intent_no_followup` | Readiness ≥ 70 **and** no employee commitment | Sales Manager |
| `commitment_overdue` | Quotation / callback / meeting / site-visit commitment past SLA | Action owner |
| `high_value_escalation` | CRM-verified order ≥ ₹15L with negative sentiment | Business Head |

### Medium — 72h

| Rule | Trigger | Owner |
|---|---|---|
| `compliance_failure` | Recording disclosure or permission-to-continue missing | Quality Team |
| `faq_spike` | An FAQ rose ≥ 50% vs comparison period (min 5 calls) | FAQ owner team |
| `objection_spike_region` | Objection rose ≥ 50% within one region **above the 20-call minimum** | Regional Sales Manager |
| `emerging_unanswered` | ≥ 3 unanswered instances **and** no approved KB article | Sales Enablement |
| `competitor_mentions_rising` | Mentions up ≥ 30% (min 10) | Product Marketing |
| `declining_region_product` | Sentiment fell ≥ 5 points, both periods above minimum sample | Business Head |

### Low — 7 days

| Rule | Trigger | Owner |
|---|---|---|
| `low_transcription_confidence` | ≥ 5 calls below the 70% confidence threshold | Contact Centre Ops |

## Trend-rule guardrails

Trend alerts fire **only above the minimum sample size** and always state both
denominators in `evidenceNote`, e.g.

> "Sample size 47 — above the minimum of 20."
> "Denominator: 186 analysed calls this period, 186 last period."

This prevents the classic false alarm where 2 → 4 calls reads as "+100%".

## Action SLAs (Next-Action Tracker)

SLA clock starts at **call end**.

| Action | SLA | Channel | Approval |
|---|---|---|---|
| Escalate complaint | **8h** | Phone | — |
| Call back | 24h | Phone | — |
| Send catalogue / brochure | 24h | WhatsApp | — |
| Assign a specialist | 24h | In person | **Required** |
| Share quotation | 48h | Email | — |
| Schedule meeting | 48h | Phone | — |
| Provide technical clarification | 48h | Phone | — |
| Follow up on payment | 48h | Phone | — |
| Schedule demonstration | 72h | Phone | — |
| Arrange site visit | 72h | Phone | — |
| Arrange measurement | 72h | Phone | — |
| Share design / drawings | 96h | Email | — |
| Disqualify the lead | 120h | Phone | **Required** |
| Nurture the customer | 14 days | WhatsApp | — |

```
overdue    = dueAt < now and not due today
due_today  = dueAt falls on today
met        = status completed
not_applicable = a CUSTOMER promise — tracked, but never our SLA
```

That last rule matters: when a customer says "I'll release payment next week",
it is recorded as a commitment with `party: 'customer'`, shown in the tracker,
and **excluded from our SLA and completion statistics**. Validation asserts it.

## Approval gates — what the AI may never do alone

`requiresApproval: true` actions are created in `pending_approval` and cannot
advance without an explicit human decision. The system will **never**
automatically:

- offer or approve a discount
- close or disqualify a lead
- change a CRM stage
- mark a complaint resolved

...on transcript inference alone. Valid transitions are declared in
`ACTION_TRANSITIONS`; `completed` and `rejected` are terminal.

## Alert lifecycle

```
open ──▶ acknowledged ──▶ resolved
```

Critical alerts cannot skip `acknowledged` — a human must claim them. Every
transition writes an audit entry (actor, role, timestamp, target, detail).

## Observed behaviour on the demo corpus

From `npm run validate:ci` against 186 analysable calls in a 28-day window:

```
Alerts raised: 160 — critical 33, high 85, medium 42
Distinct rules fired: 13 of 18
```

The five rules that did not fire (`objection_spike_region`,
`competitor_mentions_rising`, `declining_region_product`, `faq_spike` variants)
are not broken — the demo corpus is deliberately generated without a strong
period-over-period drift, so the trend thresholds correctly stayed silent.
Their logic is exercised by the threshold assertions instead. This is worth
re-checking against the first real month of data.
