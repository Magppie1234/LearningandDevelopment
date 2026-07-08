/**
 * BD Academy FAQ visualizer — data model + populated config.
 *
 * Every FaqItem is derived directly from TRAINING_CHUNKS (src/data/training-doc.ts),
 * the same verbatim source the RAG assistant and BdFaqAccordion use — so `question`
 * and `answer` can never drift from the approved wording. Only the visual-shape
 * fields (nodes/edges/columns/chartData/cards) are authored here, and every value
 * in them is a direct restatement of a fact already present in that FAQ's answer.
 * Nothing is invented.
 */

import { TRAINING_CHUNKS } from '@/data/training-doc'

export type FaqType = 'flow' | 'decision' | 'compare' | 'chart' | 'cards' | 'accordion'

export interface FaqNode {
  id: string
  title: string
  subtitle?: string
  kind?: 'step' | 'decision' | 'branch' | 'outcome'
  /** Optional accent for outcome/branch nodes — e.g. the recommended vs. the off-path option. */
  tone?: 'positive' | 'muted'
  detail?: string
}

export interface FaqEdge {
  from: string
  to: string
  label?: string
}

export interface FaqItem {
  id: string
  question: string
  type: FaqType
  /** Which BD Academy module this FAQ's category belongs to (mirrors MODULE_CATEGORIES). */
  module?: string
  /** The raw source answer, verbatim. */
  answer: string
  /** Source category letter (A–H) and question number, parsed from the section number. */
  letter?: string
  qNum?: number
  /** Generic call-out badge (e.g. the EMI answer is explicitly unresolved in the source). */
  flag?: { label: string; tone: 'risk' }
  nodes?: FaqNode[]
  edges?: FaqEdge[]
  columns?: { title: string; rows: { label: string; value: string }[] }[]
  chartType?: 'bar' | 'pie' | 'line'
  chartData?: { label: string; value: number }[]
  cards?: { title: string; body: string }[]
}

/** Category letter → BD Academy module id (mirrors MODULE_CATEGORIES in BdFaqAccordion.tsx). */
const CATEGORY_TO_MODULE: Record<string, string> = {
  A: 'bd-m7',
  F: 'bd-m7',
  G: 'bd-m7',
  B: 'bd-m8',
  D: 'bd-m8',
  E: 'bd-m8',
  C: 'bd-m4',
  H: 'bd-m10',
  I: 'bd-m10',
}

type FaqClassification = Pick<
  FaqItem,
  'type' | 'flag' | 'nodes' | 'edges' | 'columns' | 'chartType' | 'chartData' | 'cards'
>

/** Per-question classification + derived visual shape. Anything not listed here defaults to `accordion`. */
const FAQ_CLASSIFICATION: Record<string, FaqClassification> = {
  // A. Product & Material
  'faq-q2': {
    type: 'compare',
    columns: [
      {
        title: 'Granite',
        rows: [
          { label: 'Origin', value: 'Natural stone, mined' },
          { label: 'Porosity', value: 'Porous — absorbs stains and bacteria' },
          { label: 'Maintenance', value: 'Requires periodic polishing' },
          { label: 'Strength and finish', value: '—' },
        ],
      },
      {
        title: 'SilverStone',
        rows: [
          { label: 'Origin', value: 'Engineered, sintered stone' },
          { label: 'Porosity', value: 'Non-porous, antibacterial, antifungal, stain-free' },
          { label: 'Maintenance', value: 'Extremely easy to maintain' },
          { label: 'Strength and finish', value: 'Stronger than granite, more elegant than marble' },
        ],
      },
    ],
  },
  'faq-q3': {
    type: 'compare',
    columns: [
      {
        title: 'Tiles',
        rows: [
          { label: 'Grout lines', value: 'Grout lines throughout' },
          { label: 'Dirt and grease buildup', value: 'Grout prone to dirt and grease buildup' },
          { label: 'Mould and fungus', value: 'Grout prone to contamination' },
          { label: 'Heat resistance', value: '—' },
        ],
      },
      {
        title: 'SilverStone',
        rows: [
          { label: 'Grout lines', value: 'None' },
          { label: 'Dirt and grease buildup', value: 'None — no grout to collect it' },
          { label: 'Mould and fungus', value: 'Cannot grow on the surface' },
          { label: 'Heat resistance', value: 'Heat-resistant' },
        ],
      },
    ],
  },
  'faq-q5': {
    type: 'flow',
    nodes: [
      { id: 'n1', title: 'Porcelain clay', kind: 'step', detail: 'The stone starts as porcelain clay.' },
      { id: 'n2', title: 'Heated to 1,300 degrees', kind: 'step', detail: 'The clay is heated to around 1,300 degrees.' },
      { id: 'n3', title: '60 particles added', kind: 'step', detail: 'We add 60 other particles during the process.' },
      { id: 'n4', title: 'Infused with silver and copper', kind: 'step', detail: 'The stone is infused with silver and copper nano-particles.' },
      {
        id: 'n5',
        title: 'Bacteria-proof, food-grade stone',
        kind: 'outcome',
        tone: 'positive',
        detail: 'This makes the entire stone bacteria-proof and food-grade. Food-grade means you can eat directly off the surface.',
      },
    ],
    edges: [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3' },
      { from: 'n3', to: 'n4' },
      { from: 'n4', to: 'n5' },
    ],
  },

  // B. Price & Value
  'faq-q24': {
    type: 'compare',
    columns: [
      {
        title: 'Compressed wood',
        rows: [
          { label: 'Material cost', value: 'Below Rs. 100 per sq. ft.' },
          { label: 'Termites, bacteria, fungus, mould', value: 'Not free from these' },
          { label: 'Price vs. branded modular kitchens', value: '—' },
        ],
      },
      {
        title: 'SilverStone',
        rows: [
          { label: 'Material cost', value: 'Around Rs. 500 per sq. ft.' },
          { label: 'Termites, bacteria, fungus, mould', value: 'Free from all of these' },
          { label: 'Price vs. branded modular kitchens', value: 'Commercially at par' },
        ],
      },
    ],
  },
  'faq-q25': {
    type: 'chart',
    chartType: 'bar',
    chartData: [
      { label: 'Kitchen — from', value: 8400 },
      { label: 'Kitchen — to', value: 10800 },
      { label: 'Wardrobe — from', value: 7320 },
    ],
  },
  'faq-q27': {
    type: 'compare',
    columns: [
      {
        title: 'Compressed wood',
        rows: [
          { label: 'Material cost', value: 'Under Rs. 100 per sq. ft.' },
          { label: 'Toxins', value: 'Contains toxins' },
          { label: 'Pest and stain resistance', value: 'Prone to termites, fungus, bacteria, cockroaches' },
          { label: 'Processing', value: '—' },
        ],
      },
      {
        title: 'SilverStone',
        rows: [
          { label: 'Material cost', value: 'About Rs. 500 per sq. ft.' },
          { label: 'Toxins', value: 'Toxin-free' },
          { label: 'Pest and stain resistance', value: 'Stain-proof, scratch-proof, harder than granite' },
          { label: 'Processing', value: 'Advanced water-jet machinery — capital-intensive, time-consuming' },
        ],
      },
    ],
  },
  'faq-q28': {
    type: 'cards',
    cards: [
      { title: 'Cabinets and shutters', body: 'SilverStone cabinets and shutters.' },
      { title: 'Shelves and partitions', body: 'Internal shelves and partitions.' },
      { title: 'Hardware and accessories', body: 'Soft-close hardware and accessories.' },
      { title: 'Fabrication and delivery', body: 'Factory fabrication, transportation, and installation.' },
      { title: 'Quoted separately', body: 'Appliances, accessories, and premium hardware upgrades.' },
    ],
  },
  'faq-q29': {
    type: 'cards',
    cards: [
      { title: 'Electrical points', body: 'As per final drawings.' },
      { title: 'Plumbing connections', body: 'Plumbing connections are in customer scope.' },
      { title: 'Civil changes', body: 'Civil changes, if any.' },
      { title: 'Appliances', body: 'Appliances are in customer scope.' },
    ],
  },
  'faq-q30': {
    type: 'chart',
    chartType: 'pie',
    chartData: [
      { label: 'Advance', value: 50 },
      { label: 'Before dispatch', value: 40 },
      { label: 'After installation', value: 10 },
    ],
    flag: { label: 'Unresolved', tone: 'risk' },
  },

  // C. Trust & Credibility
  'faq-q32': {
    type: 'cards',
    cards: [
      { title: 'Central manufacturing', body: 'Manufactured centrally with uniform quality standards.' },
      { title: 'Trained installation teams', body: 'In-house trained installation teams.' },
      { title: 'Written commitments', body: 'Written commitments, provided up front.' },
      { title: 'Pan-India guarantees and AMS', body: 'Pan-India guarantees and AMS support.' },
      { title: 'See it before deciding', body: 'A sample delivery, an expert video call, or a visit to an existing customer installation near you.' },
    ],
  },
  'faq-q36': {
    type: 'cards',
    cards: [
      { title: 'Business', body: 'Mukesh Ambani and Anant Ambani (Reliance).' },
      { title: 'Cricket', body: 'M.S. Dhoni and Harbhajan Singh.' },
      { title: 'Film', body: 'Ranbir Kapoor, Shilpa Shetty, Chiranjeevi, and Akhil Akkineni.' },
      { title: 'Business leaders', body: 'Peyush Bansal (Lenskart) and Rizwan Sajan (Danube Group).' },
    ],
  },

  // D. Process & Timeline
  'faq-q39': {
    type: 'flow',
    nodes: [
      { id: 'n1', title: 'Factory-engineered with CNC machines', kind: 'step', detail: 'Assembled using precision CNC machines.' },
      { id: 'n2', title: 'Panels pre-cut and edge-finished', kind: 'step', detail: 'SilverStone panels are pre-cut and edge-finished before reaching the site.' },
      { id: 'n3', title: 'Fixed on-site with specialised hardware', kind: 'step', detail: 'At installation, panels are technically fixed using specialised hardware, not just adhesives.' },
      { id: 'n4', title: 'Strength, alignment, stability', kind: 'outcome', tone: 'positive', detail: 'Ensures strength, alignment, and long-term stability.' },
    ],
    edges: [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3' },
      { from: 'n3', to: 'n4' },
    ],
  },
  'faq-q42': {
    type: 'flow',
    nodes: [
      { id: 'n1', title: 'You share your layout', kind: 'step' },
      { id: 'n2', title: 'Proposal and estimate prepared', kind: 'step', detail: 'We prepare a customised proposal and estimate based on your drawings.' },
      { id: 'n3', title: 'You review and approve budget', kind: 'step', detail: 'Once you review and approve the budget alignment.' },
      { id: 'n4', title: 'Technical drawings created', kind: 'step', detail: 'Our sales team creates detailed technical drawings.' },
      { id: 'n5', title: 'Order goes into production', kind: 'outcome', tone: 'positive', detail: 'After your confirmation, the order goes into production.' },
    ],
    edges: [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3' },
      { from: 'n3', to: 'n4' },
      { from: 'n4', to: 'n5' },
    ],
  },

  // E. Service & Warranty
  'faq-q44': {
    type: 'chart',
    chartType: 'bar',
    chartData: [
      { label: 'Stone cabinetry and countertops', value: 25 },
      { label: 'Hardware and accessories', value: 10 },
      { label: 'Lighting', value: 2 },
    ],
  },
  'faq-q45': {
    type: 'cards',
    cards: [
      { title: 'Termites', body: 'Covered under the 25-year unconditional guarantee.' },
      { title: 'Water damage', body: 'Covered under the 25-year unconditional guarantee.' },
      { title: 'Discoloration', body: 'Covered under the 25-year unconditional guarantee.' },
      { title: 'Swelling and warping', body: 'Covered under the 25-year unconditional guarantee.' },
      { title: 'Manufacturing defects', body: 'Covered under the 25-year unconditional guarantee, on the stone.' },
    ],
  },
  'faq-q46': {
    type: 'cards',
    cards: [
      { title: 'Deep cleaning', body: 'Included in every annual service visit.' },
      { title: 'Sanitisation', body: 'Included in every annual service visit.' },
      { title: 'Alignment and performance check', body: 'Included in every annual service visit.' },
    ],
  },
  'faq-q48': {
    type: 'decision',
    nodes: [
      { id: 'root', title: 'Replacement needed', kind: 'decision' },
      { id: 'defect', title: 'Manufacturing or ageing defect', kind: 'branch' },
      { id: 'accident', title: 'Accidental damage', kind: 'branch' },
      { id: 'covered', title: 'Covered under warranty', kind: 'outcome', tone: 'positive', detail: 'Replacements due to manufacturing or ageing defects are covered under warranty.' },
      { id: 'charged', title: 'Chargeable', kind: 'outcome', tone: 'muted', detail: 'Accidental damage is chargeable.' },
    ],
    edges: [
      { from: 'root', to: 'defect' },
      { from: 'root', to: 'accident' },
      { from: 'defect', to: 'covered' },
      { from: 'accident', to: 'charged' },
    ],
  },
  'faq-q50': {
    type: 'cards',
    cards: [
      { title: 'Trained and certified partners', body: 'Installation partners are trained and certified.' },
      { title: 'Guided local support', body: 'Most issues can be resolved via guided local support.' },
      { title: 'Standardised components', body: 'Critical components are standardised and replaceable.' },
    ],
  },

  // F. Comparison
  'faq-q51': {
    type: 'compare',
    columns: [
      {
        title: 'Granite',
        rows: [
          { label: 'Origin', value: 'Natural stone' },
          { label: 'Porosity', value: 'Porous — absorbs stains and bacteria' },
          { label: 'Quality consistency', value: 'Varies in quality' },
          { label: 'Antibacterial / antiviral', value: 'No' },
        ],
      },
      {
        title: 'SilverStone',
        rows: [
          { label: 'Origin', value: 'Next-generation, engineered stone' },
          { label: 'Porosity', value: 'Non-porous — hygienic and stain-proof' },
          { label: 'Quality consistency', value: 'Uniform strength, finish, and performance' },
          { label: 'Antibacterial / antiviral', value: 'Yes' },
        ],
      },
    ],
  },
  'faq-q52': {
    type: 'compare',
    columns: [
      {
        title: 'Natural stone (marble, granite)',
        rows: [
          { label: 'Source', value: 'Extracted through mining' },
          { label: 'Porosity', value: 'Porous — harbours micro-organisms' },
          { label: 'Maintenance', value: 'Requires periodic maintenance' },
          { label: 'Environmental impact', value: 'Irreversible environmental damage' },
        ],
      },
      {
        title: 'SilverStone',
        rows: [
          { label: 'Source', value: 'Engineered, not mined' },
          { label: 'Porosity', value: 'Non-porous, toxin-free' },
          { label: 'Maintenance', value: 'Zero maintenance' },
          { label: 'Environmental impact', value: 'Aligned with wellness philosophy' },
        ],
      },
    ],
  },
  'faq-q53': {
    type: 'compare',
    columns: [
      {
        title: 'Branded modular (wood)',
        rows: [
          { label: 'Pricing', value: 'At par commercially' },
          { label: 'Material cost', value: 'Below Rs. 100 per sq. ft.' },
          { label: 'Material properties', value: 'Contains formaldehyde, attracts termites, absorbs moisture' },
          { label: 'Guarantee', value: 'No 25-year guarantee' },
        ],
      },
      {
        title: 'Magppie SilverStone',
        rows: [
          { label: 'Pricing', value: 'At par commercially' },
          { label: 'Material cost', value: 'Rs. 500 per sq. ft. material cost' },
          { label: 'Material properties', value: 'Antibacterial, termite-proof, maintenance-free' },
          { label: 'Guarantee', value: '25-year guarantee with 25 annual services' },
        ],
      },
    ],
  },

  // G. Scope & Customisation
  'faq-q56': {
    type: 'decision',
    nodes: [
      { id: 'root', title: 'Choosing a wardrobe shutter type', kind: 'decision' },
      { id: 'sliding', title: 'Sliding wardrobes', kind: 'branch' },
      { id: 'openable', title: 'Openable shutters', kind: 'branch' },
      {
        id: 'not-rec',
        title: 'Not recommended',
        kind: 'outcome',
        tone: 'muted',
        detail:
          'Sliding wardrobes operate on tracks and rollers that tend to misalign over time. Dust and moisture accumulate in the slider gaps, leading to faster wear. Misaligned shutters can be unsafe.',
      },
      {
        id: 'rec',
        title: 'Recommended',
        kind: 'outcome',
        tone: 'positive',
        detail: 'Openable shutters are safer, more durable, and easier to operate.',
      },
    ],
    edges: [
      { from: 'root', to: 'sliding' },
      { from: 'root', to: 'openable' },
      { from: 'sliding', to: 'not-rec' },
      { from: 'openable', to: 'rec' },
    ],
  },
  'faq-q58': {
    type: 'cards',
    cards: [
      { title: 'Fascia', body: 'Front shutters made from stone.' },
      { title: 'Backsplash', body: 'Stone backsplash.' },
      { title: 'Cabinets', body: 'Stone cabinets.' },
      { title: 'Shelves', body: 'Stone shelves.' },
      { title: 'Carcass', body: 'Stone carcass.' },
    ],
  },

  // H. Locations & Availability
  'faq-q59': {
    type: 'cards',
    cards: [
      { title: 'Sultanpur, Delhi', body: '352, Upper Ground Floor, Sultanpur, MG Road, near Sultanpur Metro Station.' },
      { title: 'Kirti Nagar, Delhi', body: '12/1, W.H.S., Block-2.' },
      { title: 'Saket, Delhi', body: 'Shop 12, Ground Floor, Select City Walk Mall.' },
      { title: 'Mohali', body: 'SCO No.66, Airport Road, Sector 82, JLPL.' },
      { title: 'Mumbai', body: 'One Lodha Place, Office No.1615B, Senapati Bapat Marg, Lower Parel.' },
      { title: 'Surat', body: 'Solaris Cube, Ground Floor, Vesu, Maharana Pratap Road.' },
      { title: 'Bangalore', body: '1154, 12th Main Road, Indiranagar (under construction, ready in ~1 month).' },
      { title: 'Hyderabad', body: 'Road No.45, Jubilee Hills (under renovation, ready by end February).' },
      { title: 'USA', body: '802 NW 5th Avenue, Suite 100, Gainesville, Florida.' },
    ],
  },

  // I. Escalation & Quick Reference
  'faq-q63': {
    type: 'cards',
    cards: [
      { title: 'Discount or final price', body: 'Customer asks for a discount or says "final price" — only humans can discuss exceptions.' },
      { title: 'Legal action or complaint', body: 'Customer mentions legal action, consumer court, or a complaint.' },
      { title: 'Custom dimensions', body: 'Customer asks about custom dimensions or non-standard designs requiring technical review.' },
      { title: 'Angry or frustrated', body: 'Customer is angry, abusive, or repeatedly frustrated after two objection-handling attempts.' },
      { title: 'Partnership or B2B', body: 'Customer asks about partnership, dealership, or B2B bulk orders.' },
      { title: 'Refunds or cancellation', body: 'Customer asks about refund policy or order cancellation.' },
      { title: 'Complex layout', body: 'Customer provides complex layout details that require CAD review.' },
      { title: 'Not covered here', body: 'Customer asks a question not covered in the training document after two attempts.' },
    ],
  },
  'faq-q64': {
    type: 'flow',
    nodes: [
      {
        id: 'n1',
        title: 'Reassure the customer',
        kind: 'step',
        detail: '"[Name] Ji, I want to make sure you get the most accurate information."',
      },
      {
        id: 'n2',
        title: 'Offer the senior consultant',
        kind: 'step',
        detail: '"Let me connect you with one of our senior wellness consultants who can personally guide you on this. Please hold for a moment."',
      },
      {
        id: 'n3',
        title: 'Warm transfer with context',
        kind: 'outcome',
        tone: 'positive',
        detail: 'Pass along a context summary: city, requirement, budget range, and objections raised.',
      },
    ],
    edges: [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3' },
    ],
  },
  'faq-q65': {
    type: 'cards',
    cards: [
      { title: 'Entirely from stone', body: 'The world\'s first kitchens entirely from stone — zero wood, zero formaldehyde, zero termites.' },
      { title: 'Patented SilverStone', body: 'Antibacterial and scratch-proof.' },
      { title: '25 plus 25', body: 'A 25-year guarantee plus 25 annual services.' },
    ],
  },
  'faq-q66': {
    type: 'flow',
    nodes: [
      { id: 'n1', title: '1. Health', subtitle: 'Safe for your family', kind: 'step', detail: 'No formaldehyde, no termites, no fungus — safe for your family.' },
      { id: 'n2', title: '2. Durability', subtitle: 'Stronger than granite', kind: 'step', detail: 'Stronger than granite. 25-year guarantee. Zero maintenance.' },
      { id: 'n3', title: '3. Service', subtitle: '25 annual visits', kind: 'outcome', tone: 'positive', detail: '25 complimentary annual visits. Pan-India support.' },
    ],
    edges: [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3' },
    ],
  },
  'faq-q67': {
    type: 'chart',
    chartType: 'bar',
    chartData: [
      { label: 'Wood material — under', value: 100 },
      { label: 'SilverStone material — about', value: 500 },
      { label: 'Magppie kitchen — from', value: 8400 },
      { label: 'Magppie kitchen — to', value: 10800 },
    ],
  },
  'faq-q68': {
    type: 'cards',
    cards: [
      { title: '50+ years', body: 'Group heritage.' },
      { title: '20+ years', body: 'In kitchens.' },
      { title: '9+ years', body: 'In SilverStone.' },
      { title: 'KBIS 2026', body: 'Global Innovation Award.' },
      { title: 'Trusted by', body: 'Ambani, Dhoni, Ranbir Kapoor.' },
    ],
  },
}

function classificationFor(id: string): FaqClassification {
  return FAQ_CLASSIFICATION[id] ?? { type: 'accordion' }
}

export const FAQ_ITEMS: FaqItem[] = TRAINING_CHUNKS.filter((c) => c.category === 'faq').map((c) => {
  const m = c.sectionNumber.match(/5\.([A-I])\s+Q(\d+)/)
  const letter = m?.[1] ?? '?'
  const qNum = Number(m?.[2] ?? 0)
  return {
    id: c.id,
    question: c.sectionTitle,
    answer: c.content,
    module: CATEGORY_TO_MODULE[letter],
    letter,
    qNum,
    ...classificationFor(c.id),
  }
})

export function faqTypeCounts(): Record<FaqType, number> {
  const counts: Record<FaqType, number> = {
    flow: 0,
    decision: 0,
    compare: 0,
    chart: 0,
    cards: 0,
    accordion: 0,
  }
  for (const item of FAQ_ITEMS) counts[item.type]++
  return counts
}
