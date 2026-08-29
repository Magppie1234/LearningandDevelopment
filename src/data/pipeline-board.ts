import { CRM_STAGES, type CrmStage } from '@/data/call-intelligence/taxonomy'
import { BD_FLOW } from '@/data/bd-flow'
import { SALES_FLOW } from '@/data/sales-flow'

/**
 * The BD → Sales journey board: the deal pipeline as columns, and the real
 * touchpoints recorded inside each stage as cards.
 *
 * TWO SOURCES, BOTH REAL, AND ONE GAP BETWEEN THEM — worth stating plainly
 * because it shapes what this page can honestly show:
 *
 *  1. The columns are `CRM_STAGES` from the call-intelligence taxonomy.
 *
 *     CORRECTION (29 Aug 2026): this file used to claim the names "match what
 *     appears on the CRM record". They do not. Checked against the mirrored
 *     Zoho data: of 7,295 Deals carrying a Stage, ZERO use any of New /
 *     Contacted / Qualified / Design / Quotation / Negotiation / Won / Lost.
 *     The live pipeline is ~57 operational values ("Sent for Approval",
 *     "Final Handover", "PD Approvals", "Price Discussion", …) with no
 *     canonical ordering stored anywhere.
 *
 *     `CRM_STAGES` in fact belongs to Sunroof Call Intelligence — a different
 *     product, whose own dataset module is labelled DEMO DATA ONLY. It is a
 *     generic funnel vocabulary, not Magppie's kitchen pipeline.
 *
 *     Left in place rather than swapped: the real stage list has no stored
 *     order, so authoring a sequence would be inventing process truth — the
 *     exact thing point 3 below refuses to do. Treat these columns as an
 *     illustrative funnel, not as this business's stages, until the BD/Sales
 *     process owner supplies the canonical ordered list.
 *
 *  2. The cards are steps from the BD and Sales process flows, together with
 *     the fields those steps actually capture (`disp`).
 *
 *  3. There is NO mapping in the app between (1) and (2). Nothing links a CRM
 *     stage to the flow steps that happen inside it. Rather than author one
 *     and present a guess as process truth, this file matches only where a
 *     flow step corresponds to a stage unambiguously by name and meaning —
 *     four of them do. The remaining stages render an explicit empty state.
 *
 * The honest consequence: this board shows real touchpoints for Qualified,
 * Design and Won, and says "nothing recorded" for New, Contacted, Quotation
 * and Negotiation. That gap is a data gap for the BD/Sales process owner to
 * close, not something this page should paper over.
 */

export interface Touchpoint {
  /** The flow step this card represents. */
  title: string
  /** Which flow it comes from — shown as provenance on the card. */
  source: 'Business Development' | 'Sales'
  /** Fields the step records. Empty when the step captures nothing. */
  captures: string[]
}

export interface BoardColumn {
  stage: CrmStage
  /** One short line describing the stage. */
  summary: string
  touchpoints: Touchpoint[]
}

/**
 * The only step→stage correspondences defensible without a process owner:
 * each is a direct name/meaning match, not an interpretation.
 *   Qualified ← BD marks the lead qualified and records its value
 *   Design    ← Sales collects the design brief
 *   Won       ← Sales closes the order and hands over
 * Deliberately absent: Negotiation. "Principally Closed" sits after
 * negotiation rather than inside it, and guessing at that is exactly the kind
 * of invention this file exists to avoid.
 */
const MATCHES: Partial<Record<CrmStage, { flow: 'bd' | 'sales'; step: string }[]>> = {
  Qualified: [{ flow: 'bd', step: 'Qualified / Drawings Awaited' }],
  Design: [{ flow: 'sales', step: 'Design Form' }],
  Won: [
    { flow: 'sales', step: 'Closure' },
    { flow: 'sales', step: 'Handover to Post Design' },
  ],
}

/** One short, plain line per stage. */
const SUMMARY: Record<CrmStage, string> = {
  New: 'Enquiry arrives',
  Contacted: 'First conversation',
  Qualified: 'Budget and intent confirmed',
  Design: 'Requirements and drawings',
  Quotation: 'Priced and sent',
  Negotiation: 'Terms agreed',
  Won: 'Order closed and handed over',
  Lost: 'Dropped or declined',
}

function lookup(flow: 'bd' | 'sales', stepTitle: string): Touchpoint | null {
  const f = flow === 'bd' ? BD_FLOW : SALES_FLOW
  const step = f.steps.find((s) => s.t === stepTitle)
  if (!step) return null
  return {
    title: step.t,
    source: flow === 'bd' ? 'Business Development' : 'Sales',
    captures: step.disp?.map((d) => d.label) ?? [],
  }
}

/** The seven progressing stages. Lost is an exit, not a column. */
export const BOARD: BoardColumn[] = CRM_STAGES.filter((s) => s !== 'Lost').map((stage) => ({
  stage,
  summary: SUMMARY[stage],
  touchpoints: (MATCHES[stage] ?? []).map((m) => lookup(m.flow, m.step)).filter(Boolean) as Touchpoint[],
}))

/** Stages with no recorded touchpoint — surfaced on the page, not hidden. */
export const STAGES_WITHOUT_TOUCHPOINTS = BOARD.filter((c) => c.touchpoints.length === 0).map(
  (c) => c.stage,
)

/**
 * Whether the app holds what the optional trend line and "moments that matter"
 * axis would need: per-deal stage-change timestamps and milestone events.
 *
 * It does not. `mock-dataset.ts` assigns each synthetic call a single current
 * `crmStage` with no transition history, and no table records stage changes.
 * A trend line drawn from that would be a shape with nothing behind it, so the
 * page states the gap instead of rendering one.
 */
export const HAS_STAGE_HISTORY = false
