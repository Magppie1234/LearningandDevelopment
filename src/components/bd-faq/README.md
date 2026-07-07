# BD FAQ visual primitives

Interactive, data-driven renderers for the BD Academy FAQ. Every question in
`src/lib/bd-faq/faq-data.ts` is classified with a `type`, and `FaqVisual`
dispatches it to the right primitive. No primitive contains question-specific
content — everything flows from the config.

## The primitives

| Component | `type` | Renders |
|---|---|---|
| `FlowChart.tsx` | `flow` | Vertical SVG process flow, clickable nodes expand a detail panel |
| `DecisionTree.tsx` | `decision` | SVG branching tree, outcomes colour-coded (positive vs muted) |
| `CompareCards.tsx` | `compare` | 2–3 columns, rows aligned by shared attribute label; last column highlighted |
| `DataChart.tsx` | `chart` | Recharts bar / pie / line, theme-token colours |
| `CategoryCards.tsx` | `cards` | Responsive grid of title + body cards |
| `FaqAccordion.tsx` | `accordion` | Expandable Q&A on the shadcn Accordion (fallback for single-fact answers) |
| `FaqVisual.tsx` | — | The dispatcher. The only component pages should import. |

## Adding a new FAQ

Edit `src/lib/bd-faq/faq-data.ts` only — no new component needed:

1. The question/answer pair must exist in `src/data/training-doc.ts`
   (`category: 'faq'`). `FAQ_ITEMS` is derived from it automatically, so a
   new source question appears as an `accordion` item with zero config.
2. To give it a visual, add an entry to `FAQ_CLASSIFICATION` keyed by the
   chunk id (e.g. `'faq-q63'`) with a `type` and that type's data:
   - `flow` / `decision` → `nodes` + `edges`
   - `compare` → `columns` (put "ours" last — it gets the highlight)
   - `chart` → `chartType` + `chartData`
   - `cards` → `cards`
3. Derive every node/row/card value from the source answer text only. The
   verbatim `answer` renders under the visual either way, so the diagram can
   stay terse.

## Rules the primitives assume

- Colours come from theme tokens (`--m-accent-copper`, `--status-ontrack-*`,
  `ink-*`, `bg-cream`) — no hardcoded brand hexes, so dark/light both work.
- No glassmorphism, no backdrop-blur — flat surfaces only.
- Node subtitles stay short (≤ 5 words); longer text belongs in `detail`,
  which shows in the click-to-expand panel.
- SVG diagrams carry `role="img"` + `<title>`/`<desc>`; nodes with detail are
  keyboard-focusable buttons.
- Copy: sentence case, no em dashes in generated labels, "and" not "&".
