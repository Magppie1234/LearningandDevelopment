# Testing & Validation Results

**Deliverable 12 of 12.** Harness: `scripts/validate-call-intelligence.ts`.

```bash
npm run validate:ci
```

Everything below is **actual output**, not a claim. The spec forbids asserting
that anything is tested that is not — so where a thing has not been tested, it
says so.

## Result

```
═══ Sunroof Call Intelligence — validation ═══

Corpus: 420 calls | primary window 2026-07-07→2026-08-03 | comparison 2026-06-09→2026-07-06
Analysable in window: 186 | all in window: 203 | comparison: 186

  · FAQs with no approved KB article: Competitor comparison, Payment & finance
  · Calls with unreliable diarisation (talk metrics suppressed): 113
  · Region sample status: North=58(indicative), South=47(indicative), West=43(indicative), East=38(indicative)
  · Cities below the 20-call minimum: 11 of 13 — Mumbai(18), Gurugram(18), Bhubaneswar(17),
    Chennai(16), Pune(13), Ahmedabad(12), Bengaluru(11), Hyderabad(11), New Delhi(10), Kochi(9), Noida(8)
  · Actions: 599 (249 committed, 350 recommended) | overdue 379 | due today 11
  · Alerts raised: 160 — {"critical":33,"high":85,"medium":42}
  · Distinct rules fired: 13 of 18
  · Data quality: 186/203 analysable (8.4% excluded), 5 failed, 10 low-confidence, 6 unknown-language

─────────────────────────────────────────────
PASSED: 105
FAILED: 0
```

TypeScript: `npx tsc --noEmit` → **exit 0**, no errors, strict mode on.

## Coverage — 20 assertion groups, 105 assertions

| # | Group | Asserts |
|---|---|---|
| 1 | Corpus integrity | Unique ids, sequential turn indices, monotonic timestamps, end > start, sentiment in −1..+1 |
| 2 | **Evidence linkage** | Every FAQ / objection / commitment points at a transcript turn that exists; evidence timestamp matches that turn |
| 3 | **FAQ dedupe (§4)** | Same FAQ never counted twice in one call; counts ≤ analysed calls; unique customers ≤ call count; % = count ÷ denominator; answer buckets sum to total |
| 4 | **Accuracy guard (§4)** | Accuracy never scored without an approved KB article; aggregate accuracy is `null` for those FAQs |
| 5 | **Scoring formulas (§7)** | Both weight tables sum to 1.00; sentiment maps −1→0, 0→50, +1→100; readiness matches hand-computed weighted sum on 60 sampled calls; all scores in 0..100; shift = closing − opening |
| 6 | **Compliance separation (§7)** | Critical failures exist in the corpus, are reported separately, and are never subtracted from the score |
| 7 | **Diarisation gate (§8)** | `reliable` flag matches the declared threshold exactly |
| 8 | **Confidence gate (§13)** | Analysable set excludes every low-confidence transcript; the gate demonstrably removes rows (203 → 186); every excluded row is genuinely below threshold or failed |
| 9 | **KPI arithmetic (§15)** | Every percentage KPI has a denominator; every KPI has formula + source + owner; percentages equal numerator ÷ denominator; none exceeds 100; sentiment bands sum to total; coverage uses the pre-gate denominator |
| 10 | **CRM/AI denominator separation (§13)** | Call-to-order uses CRM-linked only; revenue is CRM-verified provenance and sums only verified orders; funnel narrows monotonically and labels the denominator switch |
| 11 | Trend & comparison (§15) | 28 daily points; totals reconcile with the filtered set; empty days report `null` not 0; comparison window does not overlap |
| 12 | **Regional rules (§5)** | Totals reconcile; every row has a sample label; per-100 rates correct; the low-sample rule fires (11 of 13 cities); sample level matches the threshold |
| 13 | **Objections (§6)** | Buckets sum to total; percentages correct; **every reported loss reason traces to a CRM field**, never AI inference |
| 14 | **Actions & SLA (§9)** | Every action links to a call in scope; committed and recommended stay separate; **customer promises never carry our SLA**; approval-required actions start `pending_approval`; `crmTaskUrl` is null everywhere; SLA status correct for past / future / completed; completion % = completed ÷ closable |
| 15 | **Alerts (§10)** | Alerts raised; every one has severity + owner + reason + response + deadline; every critical requires manual review; deadlines after raise time; customer alerts carry a call; ids unique |
| 16 | **RBAC & masking (§13)** | Agent sees only own calls (strict non-empty subset); manager sees only own team; head sees all; names masked; card numbers masked; emails masked |
| 17 | **Edge cases (§16)** | Failed transcripts produce no insights and are excluded; unknown-language calls labelled not guessed; 62-char customer name present; original + translation stored separately and differ; **empty dataset returns zeros with no NaN/Infinity and raises no alerts**; large order values finite; no NaN score anywhere |
| 18 | Filters, URL, paging, export | Filters narrow correctly and exactly; **filters survive a URL round-trip**; full-text search matches transcript content; pages don't overlap; sorting applied before slicing; CSV escapes commas and quotes |
| 19 | Data quality (§13) | Transcribed + failed = total; analysable ≤ transcribed; excluded % correct; language breakdown reconciles |
| 20 | Determinism | Re-running aggregation on identical input produces byte-identical output |

## Edge cases exercised — and what happened

| Case | Present | Behaviour |
|---|---|---|
| Failed transcription | 5 calls | No insights extracted, excluded from aggregates, `recordingUrl: null` |
| Low transcription confidence | 10 calls | Excluded from management aggregates, visible on Data Quality |
| Unknown language | 6 calls | Labelled `Unknown`, never inferred from name or region |
| Unreliable diarisation | 113 calls | Talk-ratio / interruption / silence metrics suppressed, not zeroed |
| Very long customer name | 62 chars | Stored and masked correctly |
| Empty dataset | synthetic | Zeros, no NaN, no Infinity, no alerts, no crash |
| Large order values | up to ₹32L | Finite, formatted as Cr/L |
| Non-English transcripts | Hindi scenario | Original in `text`, English in `translation`, both retained |
| Cities below minimum sample | 11 of 13 | Labelled "Low sample — not a trend" |
| FAQ with no KB article | 2 of 16 | Accuracy returns `null`, relevance still scored |
| Customer-made commitments | present | Tracked, excluded from our SLA and completion stats |

## UI inspection — 2026-08-10

The ten React pages now exist. Everything below was checked in a running dev
server (Next 15 dev, Chromium) by querying the live DOM, not by reading the
source. Where a check was done by DOM inspection rather than by eye, it says so.

### Pages rendered

All ten routes were walked via the in-page tab strip (client-side navigation)
and each was confirmed to mount its own component with real data:

| Route | Heading rendered | Rendered text |
|---|---|---|
| `/call-intelligence` | Executive Overview | 10,162 chars, 7 figures |
| `/voice` | Customer Voice & Sentiment | 11,001 chars |
| `/faqs` | FAQs & Knowledge Gaps | 7,418 chars |
| `/regional` | Regional Intelligence | 4,238 chars |
| `/sales` | Sales & Objection Intelligence | 7,641 chars |
| `/quality` | Agent Quality & Coaching | 11,418 chars |
| `/actions` | Next-Action Tracker | 7,442 chars |
| `/alerts` | Alerts & Escalations | 10,481 chars |
| `/explorer` | Call Explorer | 5,235 chars |
| `/data-quality` | Data Quality & Configuration | 9,181 chars |

No page rendered `NaN`, `undefined` or `[object Object]`, and no page contained
invalid element nesting (`<div>`/`<table>`/`[role=tablist]` inside a `<p>`).

### Behaviour verified

- **Drill-down to the terminal node.** Clicking a row in Call Explorer opened
  `/explorer/CALL-100043`, which rendered an 11-turn transcript, the extraction
  panel, **8 evidence links** carrying `?turn=&t=` back into the transcript, and
  3 fields honestly showing "Not mentioned".
- **RBAC scoping is real, not cosmetic.** Switching the demo viewer from
  Business Head to Employee (Agent) took the Call Explorer from **186 calls to
  32**, re-scoped the governance strip to `Nisha Verma`, and locked **5 of the
  10 tabs**. Switching back restored 186.
- **Filters round-trip through the URL.** Loading
  `/explorer?region=North~West&sentiment=negative` cold produced three removable
  filter chips and narrowed the set to **33 analysable of 35 calls in window**.
- **Filters travel between tabs.** Every tab link carries the current query
  string, so a drill-down keeps its question when the page changes.
- **The funnel marks its denominator break exactly once**, at the AI→CRM
  boundary (`base changes: 48 → 158`). An earlier version keyed the break off
  the provenance *label* and drew three warnings; keying it off whether the
  funnel still chains (`stage.denominator === previous.value`) yields the one
  break that is real.
- **Responsive.** At 375 px the document scroll width equals the viewport width
  on Overview, FAQs and Agent Quality — no horizontal overflow. Heatmaps and
  tables scroll inside their own containers, and the active tab scrolls itself
  into view.

### Two defects found and fixed during UI inspection

1. **`APPROVAL_REQUIRED_ACTIONS` was a stub.** It was aliased to the whole
   `ACTION_TYPE_BY_ID` map rather than the list of action types its name
   promises. It had no consumers, so nothing was previously wrong on screen, but
   the Next-Action Tracker needs the real list. Now derived from the taxonomy:
   `ACTION_TYPES.filter(a => a.requiresApproval).map(a => a.id)`.
2. **Hydration error from invalid nesting.** The origin/severity `Segmented`
   controls were passed to `Section`'s `meta` prop, which renders inside a
   `<p>` — and `Segmented` is a `<div role="tablist">`. Moved to the `action`
   prop, which is div-hosted.

## One failure found and fixed during validation

The low-sample rule initially asserted at **region** level and failed — all four
regions cleared the 20-call minimum (38–58 calls each), so the rule never fired
there. The assertion was wrong, not the rule: small samples occur at **city**
level. Re-pointed at city level, it fires on 11 of 13 cities, and a second
assertion now checks the sample level matches the declared threshold exactly.

## What has NOT been tested

Stated plainly, because the spec forbids claiming otherwise:

- **No automated UI test.** The pages were inspected manually in a dev server
  (see above). There is no Playwright/Testing-Library suite, so nothing in the
  UI is protected against regression by CI — only the logic layer is.
- **No integration test.** No telephony, STT, CRM, task, order or complaint
  system is connected. `liveSource` throws by design.
- **No production build test.** Verification ran against `next dev`. `next
  build` has not been run since the pages were added.
- **No extraction-accuracy test.** The corpus is generated from authored
  scenarios, so extraction is correct by construction. This proves the
  *pipeline*, not the *model*. Real accuracy requires a human-labelled sample of
  real calls.
- **No load test.** Aggregation is in-memory over 420 records. Server-side
  filtering and pagination must be re-tested at production volume.
- **No accessibility audit.** Colour-plus-label is specified but not verified.
- **No browser test.** Nothing has been opened in a browser.

## Regression protocol

Run `npm run validate:ci` and `npx tsc --noEmit` before any merge that touches
`src/lib/call-intelligence/**` or `src/data/call-intelligence/**`. The corpus is
deterministic (seeded PRNG, no `Date.now()` at module scope), so any change in
output is a real behavioural change, not noise.
