/**
 * Approved Masters — the single, version-controlled source of truth for
 * product series, prices, inclusions, claims, warranties and terminology.
 *
 * SAFEGUARD (per L&D Operating System spec §1): public pages contain differing
 * range names, prices and inclusions, so NOTHING here is treated as verified
 * fact. Every record ships as "Sample – Requires SME Approval" until a named
 * SME approves it, and all learning content must reference these records
 * instead of hardcoding product benefits, prices, guarantees or claims.
 */

export type MasterStatus = 'sample' | 'approved' | 'retired'

export interface MasterMeta {
  owner: string
  backupOwner: string
  smeReviewer: string
  approver: string
  source: string
  version: string
  effectiveDate: string
  reviewDate: string
  status: MasterStatus
}

export const SAMPLE_META: Omit<MasterMeta, 'source'> = {
  owner: 'HR Learning Programme Owner',
  backupOwner: 'Department Learning Champion — Sales',
  smeReviewer: 'Pending SME nomination',
  approver: 'Pending Department Head approval',
  version: '0.1-sample',
  effectiveDate: '2026-07-29',
  reviewDate: '2026-10-29',
  status: 'sample',
}

export const SAMPLE_LABEL = 'Sample – Requires SME Approval'

/* ── Product series master ─────────────────────────────────────────── */

export interface ProductSeriesRecord {
  id: string
  series: string
  positioning: string
  construction: string
  notes: string
  meta: MasterMeta
}

export const PRODUCT_MASTER: ProductSeriesRecord[] = [
  {
    id: 'series-gold',
    series: 'Gold',
    positioning: 'Entry point into Magppie wellness kitchens — core SilverStone construction with the essential wellness, hygiene and durability promise.',
    construction: '100% engineered-stone carcass and shutters; zero-wood build; sanitised-stone surfaces.',
    notes: 'Inclusions, finishes and hardware tiers to be confirmed by Product SME against the current commercial catalogue.',
    meta: { ...SAMPLE_META, source: 'magppie.com public pages (unverified)' },
  },
  {
    id: 'series-elite',
    series: 'Elite',
    positioning: 'Mid-tier series — expanded finish palette, lighting and accessory options over Gold.',
    construction: '100% engineered-stone build with upgraded hardware and storage systems.',
    notes: 'Exact deltas vs Gold (hardware brands, lighting, accessory packs) require SME confirmation.',
    meta: { ...SAMPLE_META, source: 'magppie.com public pages (unverified)' },
  },
  {
    id: 'series-signature',
    series: 'Signature',
    positioning: 'Flagship series — bespoke design depth, premium finishes and the fullest accessory and care programme.',
    construction: '100% engineered-stone build; premium finishing systems; full customisation.',
    notes: 'Signature-only inclusions and design services to be documented by Product SME.',
    meta: { ...SAMPLE_META, source: 'magppie.com public pages (unverified)' },
  },
]

/* ── Price & inclusion master ──────────────────────────────────────── */

export interface PriceRecord {
  id: string
  series: string
  priceBasis: string
  indicativePrice: string
  inclusions: string[]
  exclusions: string[]
  meta: MasterMeta
}

export const PRICE_MASTER: PriceRecord[] = [
  {
    id: 'price-gold',
    series: 'Gold',
    priceBasis: 'Per running foot / per kitchen — basis to be fixed by Commercial SME',
    indicativePrice: 'To be entered from the approved commercial rate card',
    inclusions: ['SilverStone carcass & shutters', 'Standard hardware pack', 'Installation'],
    exclusions: ['Appliances', 'Civil, electrical & plumbing work'],
    meta: { ...SAMPLE_META, source: 'Awaiting approved rate card' },
  },
  {
    id: 'price-elite',
    series: 'Elite',
    priceBasis: 'Per running foot / per kitchen — basis to be fixed by Commercial SME',
    indicativePrice: 'To be entered from the approved commercial rate card',
    inclusions: ['Everything in Gold', 'Upgraded hardware & lighting', 'Extended accessory options'],
    exclusions: ['Appliances', 'Civil, electrical & plumbing work'],
    meta: { ...SAMPLE_META, source: 'Awaiting approved rate card' },
  },
  {
    id: 'price-signature',
    series: 'Signature',
    priceBasis: 'Per running foot / per kitchen — basis to be fixed by Commercial SME',
    indicativePrice: 'To be entered from the approved commercial rate card',
    inclusions: ['Everything in Elite', 'Premium finishes', 'Full accessory & care programme'],
    exclusions: ['Appliances unless quoted'],
    meta: { ...SAMPLE_META, source: 'Awaiting approved rate card' },
  },
]

/* ── Approved claims master ────────────────────────────────────────── */

export interface ClaimRecord {
  id: string
  claim: string
  usage: 'approved-wording' | 'restricted' | 'prohibited'
  guidance: string
  meta: MasterMeta
}

export const CLAIMS_MASTER: ClaimRecord[] = [
  {
    id: 'claim-zero-wood',
    claim: 'Magppie kitchens are 100% engineered stone with a zero-wood build.',
    usage: 'approved-wording',
    guidance: 'Company-approved positioning claim. Use verbatim; do not extend into comparative durability numbers without SME sign-off.',
    meta: { ...SAMPLE_META, source: 'Brand story (docs/magppie-brand-story.md)' },
  },
  {
    id: 'claim-sanitised-stone',
    claim: 'SilverStone surfaces are sanitised-stone technology designed for hygiene.',
    usage: 'approved-wording',
    guidance: 'Treat as company-approved claim, not independently verified science. Never add specific bacteria/lab percentages without an approved test report reference.',
    meta: { ...SAMPLE_META, source: 'magppie.com public pages (unverified)' },
  },
  {
    id: 'claim-health-outcomes',
    claim: 'Specific health-outcome statements (e.g. prevents illness, medical benefits).',
    usage: 'prohibited',
    guidance: 'No employee or AI-generated content may state or imply medical outcomes. Escalate any such draft to Legal.',
    meta: { ...SAMPLE_META, source: 'Content governance rule' },
  },
  {
    id: 'claim-load-timelines',
    claim: 'Load capacities, guarantees in years, and delivery timelines.',
    usage: 'restricted',
    guidance: 'Quote only the figure recorded in this master for the current version. If the field is blank, say "confirmed at proposal stage".',
    meta: { ...SAMPLE_META, source: 'Awaiting engineering & service SME inputs' },
  },
]

/* ── Warranty & service master ─────────────────────────────────────── */

export interface WarrantyRecord {
  id: string
  item: string
  coverage: string
  duration: string
  meta: MasterMeta
}

export const WARRANTY_MASTER: WarrantyRecord[] = [
  {
    id: 'warranty-structure',
    item: 'Stone structure (carcass & shutters)',
    coverage: 'Manufacturing defects in the engineered-stone build',
    duration: 'To be confirmed from the approved warranty document',
    meta: { ...SAMPLE_META, source: 'Awaiting approved warranty policy' },
  },
  {
    id: 'warranty-hardware',
    item: 'Hardware (hinges, runners, lift-ups)',
    coverage: 'Mechanical failure under normal domestic use',
    duration: 'To be confirmed from the approved warranty document',
    meta: { ...SAMPLE_META, source: 'Awaiting approved warranty policy' },
  },
  {
    id: 'warranty-annual-care',
    item: 'Annual care & service programme',
    coverage: 'Scheduled service visits and support commitments post-handover',
    duration: 'To be confirmed from the approved service policy',
    meta: { ...SAMPLE_META, source: 'Awaiting approved service policy' },
  },
]

/* ── Terminology master (glossary) ─────────────────────────────────── */

export interface TermRecord {
  id: string
  term: string
  definition: string
  avoid: string
  meta: MasterMeta
}

export const TERMINOLOGY_MASTER: TermRecord[] = [
  {
    id: 'term-silverstone',
    term: 'SilverStone',
    definition: "Magppie's engineered-stone material system used across carcasses and shutters.",
    avoid: 'Do not call it "quartz", "marble" or "artificial stone" in client communication.',
    meta: { ...SAMPLE_META, source: 'Brand story (docs/magppie-brand-story.md)' },
  },
  {
    id: 'term-wellness-kitchen',
    term: 'Wellness Kitchen',
    definition: 'The customer-facing category name for a Magppie kitchen — health, hygiene, durability and design as one promise.',
    avoid: 'Avoid "modular kitchen" as the primary descriptor.',
    meta: { ...SAMPLE_META, source: 'magppie.com public pages (unverified)' },
  },
  {
    id: 'term-principally-closed',
    term: 'Principally Closed',
    definition: 'Sales stage where the deal is agreed in principle — final opportunity value and expected closure date must be recorded.',
    avoid: 'Not the same as Closure; payment and approved estimate belong to Closure.',
    meta: { ...SAMPLE_META, source: 'Magppie OS Process Flow' },
  },
  {
    id: 'term-grn',
    term: 'GRN (Goods Receipt Note)',
    definition: 'Factory document created on material receipt, before quantity verification and incoming QC.',
    avoid: 'A GRN is not QC approval — stock enters inventory only after the QC decision matrix.',
    meta: { ...SAMPLE_META, source: 'Magppie OS Process Flow' },
  },
  {
    id: 'term-snag',
    term: 'Snag List',
    definition: 'Defect/pending list raised at site after final installation; every snag must be rectified and closed before handover.',
    avoid: 'Do not close a site with open snags — handover documentation requires snag closure.',
    meta: { ...SAMPLE_META, source: 'Magppie OS Process Flow' },
  },
]

export const MASTER_SECTIONS = [
  { id: 'products', label: 'Product Series' },
  { id: 'prices', label: 'Price & Inclusions' },
  { id: 'claims', label: 'Approved Claims' },
  { id: 'warranty', label: 'Warranty & Service' },
  { id: 'terminology', label: 'Terminology' },
] as const

export type MasterSectionId = (typeof MASTER_SECTIONS)[number]['id']
