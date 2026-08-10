# Sunroof Call Intelligence & Voice of Customer — Information Architecture

**Deliverable 1 of 12.** Status: specified and built — all ten routes exist and were
inspected in a browser (see `10-testing-and-validation.md` § "UI inspection").
Outstanding gaps are integrations and tests, not screens: see `09-assumptions-and-gaps.md`.

## Design premise

The dashboard exists to answer four management questions, in this order:

1. **What must happen today?** → Alerts, Next-Action Tracker
2. **Where are we losing money or trust?** → Executive Overview, Regional, Sales & Objection
3. **Why?** → Customer Voice, FAQs & Knowledge Gaps
4. **Who needs help?** → Agent Quality

Call counts are context, never the headline. Every page opens with a decision, not a total.

## Route map

Base path: `/call-intelligence`. Pages live in the existing `(portal)` route group and inherit the portal shell (sidebar, header, breadcrumb, theme).

| # | Page | Route | Primary user | The decision it drives |
|---|------|-------|--------------|------------------------|
| 1 | Executive Overview | `/call-intelligence` | Business Head | Where to intervene this week |
| 2 | Customer Voice & Sentiment | `/call-intelligence/voice` | CX / Business Head | What customers feel and expect |
| 3 | FAQs & Knowledge Gaps | `/call-intelligence/faqs` | Sales Enablement | What to publish, script or train |
| 4 | Regional Intelligence | `/call-intelligence/regional` | Regional Managers | Which region needs attention |
| 5 | Sales & Objection Intelligence | `/call-intelligence/sales` | Sales Head | What is blocking conversion |
| 6 | Agent Quality | `/call-intelligence/quality` | Quality / Managers | Who to coach, on what |
| 7 | Next-Action Tracker | `/call-intelligence/actions` | Managers / Agents | What is owed to customers today |
| 8 | Call Explorer | `/call-intelligence/explorer` | Everyone | Find and read a specific call |
| 9 | Alerts & Escalations | `/call-intelligence/alerts` | Managers / Compliance | What must not wait |
| 10 | Data Quality & Configuration | `/call-intelligence/data-quality` | Ops / Compliance | Can we trust these numbers |

Call detail: `/call-intelligence/explorer/[callId]` — the terminal node of every drill-down.

## Drill-down contract

Every number on every page resolves down the same four-step path:

```
KPI / chart point
   → segment breakdown   (region · team · product · FAQ · objection)
      → call list        (filtered, paginated, sortable)
         → call detail   (transcript + AI panel)
            → transcript turn + audio timestamp
```

This is implemented by serialising the global filter object into the URL
(`filtersToQuery` / `queryToFilters` in `src/lib/call-intelligence/filters.ts`).
A drill-down is therefore a *link*, which makes it shareable, back-button-safe
and identical whether reached from the Executive Overview or the Call Explorer.

Evidence linkage is enforced in data, not convention: every `ExtractedFaq`,
`ExtractedObjection` and `ExtractedCommitment` carries a mandatory `Evidence
{ turnIndex, timestampSec, quote }`. The validation harness asserts that every
one of these points at a transcript turn that actually exists
(`validate:ci`, assertion group 2).

## Global filter bar

Persistent across all 10 pages, serialised to the URL, with saved views, reset,
export and a last-refresh stamp. Full field list in
`src/lib/call-intelligence/types.ts` → `CallFilters` (24 dimensions).

Two rules the bar enforces visually:
- **Comparison period is always shown**, never implicit.
- **Confidence mode** defaults to `analysable_only`; switching to `all` is a
  visible, labelled state change because it alters every denominator on screen.

## Page anatomy (applies to all 10)

```
┌ Page header — title, the question this page answers, period + comparison
├ Governance strip — data source, last refresh, "demo data" badge, exclusions
├ Decision row — 3–5 KPI tiles, each with formula/denominator/owner disclosure
├ Primary visual — trend (line) or ranking (horizontal bar)
├ Secondary grid — heatmap / scatter / matrix, each with its own denominator
└ Action table — sortable, paginated, every row drilling to a call
```

## Navigation placement

Added to the existing sidebar (`src/components/Navbar.tsx`) as a single
top-level entry, **Call Intelligence**, with the ten pages as an in-page tab
strip rather than ten sidebar rows — the sidebar already carries 22 items and
another ten would break its scannability.

## Chart-type policy (§15)

| Purpose | Chart | Never |
|---|---|---|
| Change over time | Line | Bar-per-day |
| Ranking | Horizontal bar | Pie |
| Two-dimensional comparison | Heatmap with numeric labels | Colour alone |
| Relationship | Scatter with quadrant labels | Trend line without n |
| Stage loss | Funnel with per-stage denominator | Percent-of-total only |
| Geography | Sortable table (map optional, secondary) | Map alone |
| Themes | Ranked bar with counts | Word cloud |

Colour carries a text label in every case: green = positive, amber = attention,
red = risk, blue = neutral information.
