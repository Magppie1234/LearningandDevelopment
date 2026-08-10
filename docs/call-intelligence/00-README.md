# Sunroof — Call Intelligence & Voice of Customer

Turns speaker-separated call transcripts into decisions: what customers feel and
ask, what blocks conversion, how employees are performing, and what is owed to
customers today.

## Read in this order

| Doc | Deliverable |
|---|---|
| [01 — Information Architecture](./01-information-architecture.md) | 1. IA, routes, drill-down contract, chart policy |
| [02 — Metrics & Formulas](./02-metrics-and-formulas.md) | 4. Every KPI with numerator, denominator and provenance |
| [03 — Data Dictionary](./03-data-dictionary.md) | 5. Every field, its source, and what is missing |
| [04 — API, Integrations & Credentials](./04-api-integrations-and-credentials.md) | 6. Six adapter contracts + credential checklist |
| [05 — AI Extraction Schema](./05-ai-extraction-schema.md) | 7. The JSON the model must return, and the rules it must obey |
| [06 — Scoring Methodology](./06-scoring-methodology.md) | 8. Three independent scores and their limits |
| [07 — Alerts & SLA Rules](./07-alerts-and-sla.md) | 9. 18 alert rules, 14 action SLAs, approval gates |
| [08 — RBAC & Governance](./08-rbac-and-governance.md) | 10. Six roles, masking, audit, 13 governance controls |
| [09 — Assumptions & Gaps](./09-assumptions-and-gaps.md) | 11. **Build status and blocking dependencies — read this first if you are picking the work up** |
| [10 — Testing & Validation](./10-testing-and-validation.md) | 12. 105 assertions, actual output, and what is NOT tested |

Deliverables 2 (complete responsive UI) and 3 (functional navigation and
drill-downs) are **not yet built** — see doc 09.

## Code map

```
src/data/call-intelligence/
  taxonomy.ts      16 FAQs · 13 objections · 14 action types · 6 compliance flags
                   · geography · products · teams · employees · thresholds
  scenarios.ts     14 authored conversations (DEMO DATA — clearly labelled)
  mock-dataset.ts  Deterministic generator → 420 CallRecords

src/lib/call-intelligence/
  types.ts         The data contract (§14)
  scoring.ts       Three independent scores + weight tables (§7)
  metrics.ts       All aggregation; every metric carries its formula (§2–§8)
  filters.ts       24-dimension filter model + URL round-trip (§12)
  actions.ts       Commitments + recommendations, SLA engine (§9)
  alerts.ts        18-rule alert engine (§10)
  rbac.ts          Roles, row scoping, masking, audit model (§13)
  service.ts       Adapter contracts + mock source + pagination + export (§16)

scripts/validate-call-intelligence.ts   105 assertions — npm run validate:ci
```

## Commands

```bash
npm run validate:ci    # 105 formula / edge-case assertions
npx tsc --noEmit       # strict typecheck
npm run dev            # portal (Call Intelligence pages not built yet)
```

## The rules this product will not break

1. Every percentage shows its denominator.
2. AI-inferred and CRM-verified numbers never share a denominator.
3. Every insight links to the transcript turn and timestamp that produced it.
4. Sentiment is transcript text, and is labelled as such — never "tone".
5. Politeness is not purchase intent.
6. A negative customer is not evidence of a poor agent.
7. Critical compliance failures are never averaged into a quality score.
8. Loss reasons come from CRM, never from AI inference.
9. Nothing that changes commercial reality executes without human approval.
10. Missing data reads "Not mentioned" — never a guess, an average or a zero.
