# HANDOFF — Sunroof Call Intelligence & Voice of Customer Dashboard

**Purpose of this file:** paste it (or upload this whole zip) into any AI coding
assistant so it can continue the work with full context. It contains the brief,
what was decided and why, what exists, what is left, and the exact next step.

**Date of handoff:** 2026-08-08 · **UI layer added:** 2026-08-10
**Repo:** `LearningandDevelopment` — Magppie/Sunroof L&D Portal (Next.js 15)
**Branch:** `main`
**Status:** Logic layer complete and validated (105 assertions passing).
**All ten pages, their routes, the shared primitives and the sidebar entry are
now built and were inspected in a running dev server** — see
`docs/call-intelligence/10-testing-and-validation.md` § "UI inspection".
Remaining: automated UI tests, a production `next build`, and the live
integrations (still none connected).

---

## 1. The brief, in one paragraph

Sunroof already has a call-transcription feature producing speaker-separated
transcripts. Build a production-ready Call Intelligence & Voice of Customer
dashboard on top of it, with 10 pages, that helps management decide — not a
dashboard that shows call counts. It must answer: what customers feel and ask;
what products, prices, competitors and objections come up; how well employees
handle conversations; what was committed; what needs attention today; and how
all of that differs by region, product, team, employee, campaign and customer
type. Full original spec sections are referenced throughout the code as §2–§17.

---

## 2. Decisions already made (do not re-litigate)

| Decision | Choice | Why |
|---|---|---|
| **Brand** | **Sunroof** | User was asked explicitly and chose "Sunroof" over "Magppie" |
| Domain taxonomy | Kitchen industry (product series, site visit, measurement, AMC, design drawings) | Matches the business; user chose to keep it |
| Where the code lives | Inside the existing Next.js portal, not a new app | Spec §16: preserve existing codebase, architecture, design system |
| View components location | `src/components/call-intelligence/` — **NOT** `src/pages/` | ⚠️ `src/pages/` is the Next.js **Pages Router** directory in this repo. Files there become real routes. Putting views there would collide with the App Router routes under `/call-intelligence`. |
| Demo data strategy | Deterministic seeded generator from 14 authored conversation scenarios | Every KPI derives from real transcript turns, so a number can be reconciled against a transcript by hand |
| Sentiment | Transcript text only, labelled as such everywhere | No audio-feature pipeline exists; spec §3 forbids claiming tone analysis |
| Purchase Readiness | Called "readiness", never "conversion probability" | Not back-tested against historical conversions (spec §7) |
| Credentials | **Not included in this bundle** | Committing keys into a zip uploaded to third-party AI tools leaks them permanently. `.env.example` + a credential checklist is included instead. |

---

## 3. The existing codebase (what you are building inside)

- **Next.js 15.5** App Router, React 19, TypeScript strict, `@/*` → `./src/*`
- **Tailwind 3.4** with a custom token system in `tailwind.config.cjs` +
  `src/app/globals.css`. Use these tokens, not raw hex:
  - Surfaces: `bg-parchment`, `bg-cream`, `bg-surface-warm`
  - Text: `text-ink-primary`, `text-ink-secondary`, `text-ink-tertiary`
  - Accent: `text-accent-copper` (primary), `accent-silver` (secondary)
  - Status: `--status-ontrack` (green), `--status-risk` (amber), `--status-overdue` (red)
  - Both light and dark themes are defined; dark ("Warm Stone") is the default
- **shadcn/ui** — full set already in `src/components/ui/` (52 components)
- **Recharts 2.15** for charts, **lucide-react** for icons, **zustand** for state
- **Page pattern:** `src/app/(portal)/<route>/page.tsx` is a 5-line wrapper that
  renders a component. The portal layout supplies sidebar, header, breadcrumb.
- **Reusable primitives worth copying:**
  `src/components/learning/ReadinessPrimitives.tsx` — exports `CARD`,
  `KpiTile` (with a built-in "How is this calculated?" disclosure showing
  formula/source/owner/as-of), `DemoDataNotice`. The `KpiTile` disclosure
  pattern is exactly what spec §15 requires; reuse or mirror it.
- **House style:** heavy comments explaining *why*, spec section references
  (§n), honest "we cannot measure this yet" panels instead of fake numbers.
  See `src/pages/ExecutiveDashboard.tsx` as the reference page.

---

## 4. What has been BUILT (all typechecks, all validated)

```
src/data/call-intelligence/
  taxonomy.ts       ~560 lines — 16 FAQ categories (2 deliberately without an
                    approved KB article), 13 objections, 8 techniques, 14 action
                    types with SLA hours + approval flags, 6 compliance flags
                    (4 critical), 13 geographies, 8 products / 4 series,
                    4 teams, 10 employees, campaigns, stages, segments,
                    outcomes, competitors, THRESHOLDS, sampleConfidence()
  scenarios.ts      ~700 lines — 14 authored conversations covering: high-intent
                    enquiry, price objection (with authored Hindi original +
                    English translation), finance knowledge gap, unresolved
                    complaint with legal threat, competitor/trust, unapproved
                    discount + false commitment, design discussion, payment
                    follow-up, POLITE-BUT-LOW-INTENT (the anti-politeness test
                    case), cancellation/refund, serviceability dead end, rushed
                    low-quality outbound, not-connected, cross-sell
  mock-dataset.ts   ~470 lines — seeded mulberry32 PRNG → 420 CallRecords.
                    Builds transcripts with real timestamps, then DERIVES
                    everything: sentiment phases from turn thirds, talk ratios
                    from turn durations, FAQ response times from turn gaps,
                    evidence indices from actual turns. Seeds edge cases on
                    purpose: 5 failed transcripts, 10 low-confidence,
                    6 unknown-language, a 62-char customer name.

src/lib/call-intelligence/
  types.ts          The full §14 data model + Provenance + Evidence + AiField<T>
  scoring.ts        3 independent scores; READINESS_WEIGHTS and QUALITY_WEIGHTS
                    exported so the UI renders the methodology from the same
                    constants the maths uses; critical failures returned
                    SEPARATELY from the quality score; unmeasurable parameters
                    re-normalised rather than zeroed
  metrics.ts        ~900 lines — Metric envelope (value + numerator +
                    denominator + formula + source + owner + provenance + prev),
                    executiveKpis (20 KPIs), volumeSentimentTrend,
                    faqAggregates, objectionAggregates, regionAggregates,
                    agentAggregates, callToOrderFunnel, themeAggregates,
                    emotionAverages, sentimentByDimension, faqByRegionMatrix,
                    emergingItems, dataQualitySummary, qualityVsConversion
  filters.ts        24-dimension CallFilters, applyFilters /
                    applyComparisonFilters / applyFiltersIgnoringConfidence,
                    URL round-trip (filtersToQuery / queryToFilters)
  actions.ts        buildActions() → committed + recommended kept separate;
                    SLA engine; ACTION_TRANSITIONS state machine
  alerts.ts         18 rules with full metadata; buildAlerts(); trend rules
                    guarded by minimum sample size
  rbac.ts           6 roles, page matrix, scopeCalls(), maskCall(), maskName(),
                    maskSensitiveText(), AuditEntry, PROHIBITED_SCORING_ATTRIBUTES
  service.ts        6 adapter interfaces (Telephony / Transcription / CRM /
                    Task / Order / Complaint), mockSource, liveSource (THROWS
                    by design), loadDataset(), getCall(), paginate(), toCsv()

scripts/validate-call-intelligence.ts   105 assertions across 20 groups
docs/call-intelligence/                 10 markdown deliverables
```

**Verification actually run:**
- `npx tsc --noEmit` → exit 0
- `npm run validate:ci` → **PASSED 105, FAILED 0**

---

## 5. The UI layer (added 2026-08-10)

```
src/components/call-intelligence/
  CiPrimitives.tsx    MetricCard (a `Metric` + mandatory denominator + provenance
                      badge + comparison period + formula disclosure),
                      ProvenanceBadge, ConfidenceChip, SampleSizeNote,
                      DenominatorNote, EvidenceLink, NotMeasurable, NotMentioned,
                      MethodDisclosure, TextSentimentCaveat, AiGeneratedNote
  CiCharts.tsx        CiChartFrame (period AND comparisonPeriod are *required*
                      props — §15 made structural), RankedBars, IntensityHeatmap,
                      QuadrantScatter, ProvenanceFunnel, CompositionBar
  CiContext.tsx       CiProvider — the URL *is* the filter state (no mirrored
                      useState to reconcile); one dataset load shared by all ten
                      pages; demo viewer role; saved views in localStorage
  CiFilterBar.tsx     Persistent 24-dimension filter bar + GovernanceStrip
  CiShell.tsx         Tab strip, RBAC page gate, CiPageFrame
  ExecutiveOverview · CustomerVoice · FaqsKnowledgeGaps · RegionalIntelligence
  SalesObjections · AgentQuality · NextActions · AlertsEscalations
  CallExplorer · CallDetail · DataQuality

src/app/(portal)/call-intelligence/   layout.tsx + 10 routes + explorer/[callId]
src/lib/roles.ts                      sidebar entry, Lead group, requires: employee
```

Built on the existing design system (`src/components/ds`) rather than beside it —
`Section`, `DataTable`, `TrendLine`, `StatusBadge`, `Segmented` and `Notice` are
reused throughout, so a status colour or table behaviour means the same thing
here as everywhere else in the portal.

### Still NOT built

- ❌ **Any live integration.** No telephony, STT, CRM, task, order or complaint
  system is connected. `liveSource` throws by design.
- ❌ **Automated UI tests.** The pages were inspected manually; no
  Playwright/Testing-Library suite guards them in CI.
- ❌ **A production `next build`.** Verified against `next dev` only.
- ❌ **Accessibility audit.** Colour-plus-label is implemented throughout but
  has not been audited with a screen reader or contrast tooling.
- ❌ **Server-side RBAC.** Still a client-side affordance (see §8 below).

### Two logic-layer defects found while wiring the UI

1. `APPROVAL_REQUIRED_ACTIONS` in `actions.ts` was aliased to the whole
   `ACTION_TYPE_BY_ID` map instead of the list of approval-gated action types.
   Unused until now; fixed to derive from `ACTION_TYPES`.
2. A hydration error from passing `Segmented` (a `<div>`) into `Section`'s
   `meta` prop (a `<p>`). Moved to the `action` prop.

---

## 6. THE NEXT STEP

Steps 1–7 below are **done**. What is left, in priority order:

1. **Run `next build`.** Only `next dev` has been exercised. Do this on a
   machine where no other dev server is sharing `.next` — two servers on one
   build directory corrupt the webpack cache and produce chunk 404s.
2. **Add UI regression tests.** The 105 logic assertions do not cover a single
   React component. The highest-value cases are the ones that encode the
   brief's rules: the funnel draws exactly one denominator break; a role switch
   changes the row count; a percentage never renders without its denominator.
3. **Stand up the adapters** (§8). Diarisation confidence first — it unblocks
   every talk metric.
4. Accessibility audit, then a server-side RBAC layer before any real data.

### How a page gets its data

Everything a page needs comes from **one call**, made once in `CiProvider` and
shared through `useCi()` — pages never call `loadDataset` themselves:

```ts
import { loadDataset } from '@/lib/call-intelligence/service'
import { defaultFilters } from '@/lib/call-intelligence/filters'
import { executiveKpis } from '@/lib/call-intelligence/metrics'
import type { Viewer } from '@/lib/call-intelligence/rbac'

const viewer: Viewer = { roleId: 'business_head', employeeId: null, teamId: null, name: 'Demo' }
const ds = await loadDataset(defaultFilters(), viewer)
// ds.calls, ds.allCalls, ds.prevCalls, ds.prevAllCalls, ds.actions, ds.alerts,
// ds.corpus, ds.lastRefreshedAt, ds.sourceLabel, ds.isLive

const kpis = executiveKpis({
  calls: ds.calls, allCalls: ds.allCalls,
  prevCalls: ds.prevCalls, prevAllCalls: ds.prevAllCalls,
  actions: ds.actions,
})
```

Inside a page, use the frame — it handles the loading, error and empty states
and keeps the previous numbers on screen while a filter change re-resolves:

```tsx
<CiPageFrame title="…" question="What decision does this page drive?">
  {(data) => { /* data is the Dataset above */ }}
</CiPageFrame>
```

Original build order, all complete: shared primitives → shell + filter bar +
route group → Executive Overview → Call Explorer + detail → remaining 8 pages →
sidebar entry → browser inspection.

---

## 7. Non-negotiable rules (the spec fails without them)

1. Every percentage renders its **denominator or sample size**.
2. Every chart shows the **selected period AND the comparison period**.
3. **AI-inferred ≠ CRM-verified.** Never the same denominator, never the same
   visual weight. The funnel must visibly say where the denominator switches.
4. Every AI insight links to its **transcript turn + audio timestamp**.
5. Sentiment is labelled **"text-based"**. Never "tone", never "emotion detection".
6. **Politeness is not purchase intent.** (Scenario `sc-polite-low-intent` is
   the regression test: high sentiment, low readiness.)
7. **A negative customer is not a bad agent.** Never correlate the two scores.
8. **Critical compliance failures are shown separately**, never averaged into
   the quality score.
9. **Loss reasons come from `crm.crmLossReason` only** — never from the AI's
   hesitation summary.
10. **Talk-ratio/silence/interruption metrics only when `dynamics.reliable`.**
    Otherwise show "Not measurable — diarisation confidence too low", not 0.
11. **Missing data reads "Not mentioned"** — never a guess, average or zero.
12. **Nothing auto-executes.** No discount, no lead closure, no disqualification,
    no CRM stage change from transcript inference.
13. **Never infer geography** from accent, language or name. CRM fields only.
14. FAQ counts are **deduplicated per call**.

---

## 8. Blocking dependencies before production

1. **Diarisation confidence** must be exposed by the STT service — without it
   all talk metrics stay hidden.
2. Telephony API, CRM read access (Zoho MCP tooling is available in this
   workspace), task system, order system, complaint system.
3. **Approved knowledge base** — 2 of 16 FAQs have no article, so answer
   accuracy cannot be scored for them (by design).
4. **Approved discount matrix** — the `unapproved_discount` rule needs a real
   threshold.
5. **Server-side RBAC enforcement.** `rbac.ts` is client-side; it is a UX
   affordance, not a security boundary.
6. Legal/DPO sign-off on AI analysis of recorded calls (DPDP Act).

Full list with owners: `docs/call-intelligence/09-assumptions-and-gaps.md`.

---

## 9. Credentials

**No live keys are in this bundle, deliberately.** Fill them in locally in
`.env` (git-ignored). Names and sources: `.env.example` and
`docs/call-intelligence/04-api-integrations-and-credentials.md`.

Already used by the repo: `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`NEXT_PUBLIC_BD_ACADEMY_ID`, `NEXT_PUBLIC_SALES_ACADEMY_ID`,
`NEXT_PUBLIC_REAL_AUTH`, `OPENAI_API_KEY`, `OPENROUTER_API_KEY`.

Newly required: `TELEPHONY_API_KEY/SECRET/BASE_URL`, `STT_API_KEY/BASE_URL`,
`ZOHO_CLIENT_ID/CLIENT_SECRET/REFRESH_TOKEN/API_DOMAIN`, `ANTHROPIC_API_KEY`,
`TASK_SYSTEM_API_KEY/BASE_URL`, `CI_RECORDING_SIGNING_SECRET`.

Vercel project `lnd2` (`prj_KXXNnarmq3w294XIXvdb0ve6oJsh`). **Env var changes
only take effect on redeploy.**

---

## 10. Commands

```bash
npm install
npm run validate:ci    # 105 assertions — must stay at 0 failures
npx tsc --noEmit       # strict typecheck — must stay at exit 0
npm run dev            # portal on :3000
```

---

## 11. Prompt to paste into a fresh AI session

> You are continuing work on the Sunroof Call Intelligence & Voice of Customer
> dashboard inside an existing Next.js 15 App Router portal. Read
> `HANDOFF-CALL-INTELLIGENCE.md` and `docs/call-intelligence/00-README.md`
> first, then `09-assumptions-and-gaps.md`.
>
> Both layers are built. The logic layer — taxonomy, typed data model,
> deterministic demo corpus, three scoring engines, the metrics/aggregation
> layer, filters with URL round-trip, action + SLA engine, an 18-rule alert
> engine, RBAC/masking, six adapter contracts — passes 105 assertions via
> `npm run validate:ci`, and `npx tsc --noEmit` is clean. The UI layer is ten
> pages under `src/app/(portal)/call-intelligence/` with view components in
> `src/components/call-intelligence/`. Do not rewrite either.
>
> Read section 6 for what is left. In short: run `next build` (never with a
> second dev server sharing `.next`), add UI regression tests for the rules in
> section 7, and connect the adapters in section 8 — diarisation confidence
> first, because it unblocks every talk metric.
>
> Data comes from `useCi()`, never from `loadDataset` directly — the provider
> loads once for the whole section. Build UI from `src/components/ds` and
> `src/components/call-intelligence/CiPrimitives.tsx`; do not restyle cards,
> badges or tables locally.
>
> Obey the 14 non-negotiable rules in section 7 without exception. Re-run
> `npm run validate:ci` and `npx tsc --noEmit` before you finish, actually open
> the pages in a browser, and only claim something works if you tested it.
