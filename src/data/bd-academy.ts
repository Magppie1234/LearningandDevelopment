/**
 * Business Development Executive — 10 modules + 30-question quiz bank.
 *
 * SOURCE OF TRUTH: BD_Academy_Modules_and_Quiz_Bank.md (human-reviewed,
 * approved). Content reframed from Magppie_AI_Bot_Master_Training_Document.pdf
 * v1.0 (May 2026) — the same document that powers the Pooja RAG assistant
 * (see src/data/training-doc.ts). Pricing, guarantee terms and the
 * forbidden-word list are carried over verbatim. Voice-bot-only mechanics
 * (TTS pacing/pause timings) were intentionally dropped in the review pass.
 *
 * These 30 questions are pre-approved human content — they publish directly
 * (status 'published', source 'human') and do NOT route through the AI review
 * queue. DB mirror: supabase/migrations/0018_bd_academy_content.sql.
 */

export const BD_ACADEMY_ID = 'business-development'
export const BD_SOURCE_DOC = 'Magppie_AI_Bot_Master_Training_Document.pdf'
export const BD_CONTENT_STATUS = 'draft' as const // pending final publish approval
export const BD_PASS_THRESHOLD = 0.8 // 80% per module

/** The five competencies BD modules & questions are tagged against. */
export type BdCompetency =
  | 'Product Knowledge'
  | 'Objection Handling'
  | 'Pricing Knowledge'
  | 'Customer Communication'
  | 'Trust & Credibility'

/** A block of rendered module content. */
export type ContentBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'heading'; text: string }
  | { kind: 'list'; ordered?: boolean; items: string[] }
  | { kind: 'callout'; label: string; text: string }
  | { kind: 'table'; columns: string[]; rows: string[][] }

export interface BdModule {
  id: string // 'bd-m1' … 'bd-m10'
  number: number
  title: string // learner-facing title (renamed per the video-scripts source)
  originalTitle?: string // the pre-rename descriptive title, kept for reference
  competency: BdCompetency
  summary: string
  blocks: ContentBlock[]
}

export interface BdQuizQuestion {
  id: string // 'bd-q1' … 'bd-q30'
  moduleId: string
  competency: BdCompetency
  question: string
  options: string[]
  correctIndex: number
}

/* ═══════════════════════════════ MODULES ═══════════════════════════════ */

export const BD_MODULES: BdModule[] = [
  {
    id: 'bd-m1',
    number: 1,
    title: 'The Magppie Story: 50 Years to Wellness Kitchens',
    originalTitle: 'Brand Foundation & Company Story',
    competency: 'Trust & Credibility',
    summary: 'Magppie as a Wellness Movement, and the one unified company story.',
    blocks: [
      {
        kind: 'callout',
        label: 'Mission statement (verbatim — do not alter)',
        text: 'Our mission is to transform ordinary homes into wellness homes. Spaces that keep you, your family, and the planet safe.',
      },
      {
        kind: 'paragraph',
        text: 'Magppie positions itself as a Wellness Movement, not a kitchen company — the sale is health, safety, and 25 years of peace of mind, not just a product.',
      },
      { kind: 'heading', text: 'The company story — one unified version, no variations' },
      {
        kind: 'list',
        items: [
          'Never lead with "35 years old" / "40 years old" / "we were into stainless steel".',
          'Always lead with: 50+ years group heritage → 20+ years in kitchens → 9+ years of SilverStone (first SilverStone kitchen installed late 2016).',
          'Recently opened a store in Florida, USA, and won the Most Unexpected Innovation award at KBIS 2026, Orlando — the world’s largest kitchen show.',
        ],
      },
    ],
  },
  {
    id: 'bd-m2',
    number: 2,
    title: 'Inside SilverStone: The Science of the Stone',
    originalTitle: 'Wellness Kitchen & SilverStone — The Science',
    competency: 'Product Knowledge',
    summary: 'What a Wellness Kitchen is, and the science behind SilverStone.',
    blocks: [
      { kind: 'heading', text: 'What is a Wellness Kitchen' },
      {
        kind: 'paragraph',
        text: 'Made entirely from patented sanitised stone — 0% wood. No trees cut, no formaldehyde released. Contains real silver and copper nano-particles — naturally anti-bacterial and anti-fungal. Termite-proof, waterproof, fire-safe. 25-year unconditional guarantee plus 25 complimentary annual services.',
      },
      { kind: 'heading', text: 'What is SilverStone' },
      {
        kind: 'paragraph',
        text: 'Porcelain clay heated to 1,300°C, infused with silver and copper nano-particles. Anti-bacterial, anti-fungal, non-porous, stain-proof, scratch-resistant, impact-resistant, 100% food-grade (safe to eat directly off). Stronger than granite, more elegant than marble. Engineered, not mined — does not harm the environment.',
      },
      {
        kind: 'callout',
        label: 'Key phrase to remember',
        text: 'It looks like a stone, but it does not behave like a regular stone.',
      },
    ],
  },
  {
    id: 'bd-m3',
    number: 3,
    title: 'Proof, Not Promises: The 7 Safety Pillars',
    originalTitle: 'The 7 Safety Pillars & Proof Points',
    competency: 'Product Knowledge',
    summary: 'The seven safety pillars, always presented in order, with their proof points.',
    blocks: [
      { kind: 'paragraph', text: 'Always present in this order:' },
      {
        kind: 'list',
        ordered: true,
        items: [
          'Stain Safe — non-porous; coffee, haldi, oil wipe off easily.',
          'Scratch Safe — daily chopping leaves no marks.',
          'High Load Bearing — drawers support up to 60 kg each.',
          'Fire Safe — does not catch fire or spread flames.',
          'Water Safe — 30-day water test: wood swelled, stone unchanged.',
          'Impact Safe — heavy ceramic jar drop test: stone stayed intact, stronger than granite.',
          'More Storage — up to 62% more storage than standard kitchens; fits large Indian plates.',
        ],
      },
    ],
  },
  {
    id: 'bd-m4',
    number: 4,
    title: 'Why They Trust Us: Awards & Client Credibility',
    originalTitle: 'Awards, Trust & Celebrity Clientele',
    competency: 'Trust & Credibility',
    summary: 'The KBIS 2026 award and how to use celebrity trust without over-listing.',
    blocks: [
      {
        kind: 'paragraph',
        text: 'Awards: Most Unexpected Innovation award, KBIS 2026, Orlando USA — the world’s largest Kitchen & Bath Industry Show. Won alongside global leaders Caesarstone and LG. Presented to Director of US Operations, Kishor Rico, on February 17, 2026.',
      },
      {
        kind: 'callout',
        label: 'Trusted by (use 2–3 names max per customer call — never read the full list)',
        text: 'Mukesh Ambani and Anant Ambani (Reliance), M.S. Dhoni and Harbhajan Singh (cricket), Ranbir Kapoor, Shilpa Shetty, Chiranjeevi, Akhil Akkineni (film), Peyush Bansal (Lenskart), Rizwan Sajan (Danube Group).',
      },
    ],
  },
  {
    id: 'bd-m5',
    number: 5,
    title: 'The Magppie Pitch: From Hello to Handoff',
    originalTitle: 'The Complete Sales Pitch (8-Stage Flow)',
    competency: 'Customer Communication',
    summary: 'The eight-stage conversation from opening to WhatsApp handoff.',
    blocks: [
      {
        kind: 'list',
        ordered: true,
        items: [
          'Opening — introduce as Magppie Wellness Kitchens and Wardrobes, confirm the enquiry source, ask if they have a couple of minutes, branch on new build vs. renovation.',
          'Discovery & Qualification — city, own home vs. investment property, working with a designer/architect.',
          'Problem Agitation — most wooden kitchens have hidden problems (termites, mould, water sagging); introduce formaldehyde risk via the WHO reference.',
          'Solution Introduction — Magppie is the world’s first kitchen company to build entirely from stone instead of wood — Wellness Kitchens and Wellness Wardrobes.',
          'Product Deep Dive — SilverStone material, silver/copper nano-particles, non-porous, termite/fungus/fire/water-safe, 25-year guarantee + 25 annual services, KBIS 2026 award mention.',
          'Budget Qualification — confirm premium wellness solution vs. basic carpentry comparison before revealing price.',
          'Pricing — ₹8,400–₹10,800/sq.ft. for kitchens, wardrobes from ₹7,320/sq.ft.; 10×10 kitchen ≈ ₹12–15 lakhs. Confirm the range aligns with customer expectations.',
          'Next Steps / WhatsApp Handoff — request layout, offer WhatsApp handoff to a wellness consultant.',
        ],
      },
    ],
  },
  {
    id: 'bd-m6',
    number: 6,
    title: 'Turning No Into Not Yet: Objection Handling',
    originalTitle: 'Objection Handling Playbook',
    competency: 'Objection Handling',
    summary: 'The six core objections and their approved response strategies.',
    blocks: [
      { kind: 'paragraph', text: 'Six core objections and the approved response strategy for each:' },
      {
        kind: 'list',
        items: [
          '"Too expensive" → compare material cost (wood <₹100/sq.ft. vs. SilverStone ~₹500/sq.ft.), reframe around lifetime cost and the 25-year guarantee.',
          '"Need to think about it" → offer a video, customer installation photos, a video call, or a home sample.',
          '"Already have a vendor/designer" → position Magppie as collaborative, not competitive — offer to coordinate with their existing team.',
          '"No showroom in my city" → trust built through systems, not showrooms; offer sample delivery, video call, or a nearby customer visit.',
          '"Never heard of Magppie" → lead with 50+ years group heritage and celebrity trust, offer brochure/video.',
          '"Why not granite/marble?" → natural stone is porous and mined (environmental harm); SilverStone is non-porous, engineered, uniform quality.',
        ],
      },
    ],
  },
  {
    id: 'bd-m7',
    number: 7,
    title: 'Ask Me Anything: Product & Material FAQ',
    originalTitle: 'Master FAQ — Product, Material & Comparisons',
    competency: 'Product Knowledge',
    summary: 'Composition, comparisons vs. granite and tiles, and material properties.',
    blocks: [
      {
        kind: 'paragraph',
        text: 'Covers composition (porcelain + silver/copper nano-particles, baked at 1,300°C), comparison vs. granite (porous vs. non-porous), comparison vs. tiles (no grout lines, no mould accumulation), confirmation SilverStone is engineered not natural, weight/hardware load-bearing (100+ kg capacity, European-standard hardware), scratch/fire/water safety, food-grade status, and storage capacity.',
      },
    ],
  },
  {
    id: 'bd-m8',
    number: 8,
    title: 'The Real Numbers: Pricing, Process & Service',
    originalTitle: 'Master FAQ — Pricing, Process & Service',
    competency: 'Pricing Knowledge',
    summary: 'The full pricing matrix, payment terms, and process timeline.',
    blocks: [
      { kind: 'heading', text: 'Pricing matrix' },
      {
        kind: 'table',
        columns: ['Item', 'Price', 'Inclusions', 'Exclusions'],
        rows: [
          ['Wellness Kitchen', '₹8,400–10,800/sq.ft.', 'SilverStone cabinets, shutters, shelves, hardware, fabrication, transport, installation', 'Accessories, appliances, premium upgrades'],
          ['Wellness Wardrobe', '₹7,320/sq.ft.', 'Same as above', 'Same as above'],
          ['10×10 Kitchen', '₹12–15 lakhs', 'Full kitchen build', 'Accessories, appliances, GST'],
          ['25 Annual Services', 'Complimentary', 'Deep cleaning, sanitisation, alignment check', '—'],
          ['Stone Guarantee', '25 years', 'Termites, water, discoloration, swelling, warping', 'Accidental damage'],
          ['Hardware Guarantee', '10 years', 'Rust, defect, malfunction', 'Accidental damage'],
          ['Lighting Guarantee', '2 years', 'Defect, failure', 'Accidental damage'],
        ],
      },
      { kind: 'paragraph', text: 'Payment terms: 50% advance, 40% before dispatch, 10% after installation.' },
      { kind: 'paragraph', text: 'Process timeline: 3–4 months from final order to installation, depending on site conditions and design complexity.' },
      {
        kind: 'callout',
        label: '⚠ Note on EMI/payment plans',
        text: 'The source document marks this as unresolved — "Check with finance team for current EMI partners." Do not present EMI details as settled fact. This is excluded from the quiz for that reason.',
      },
    ],
  },
  {
    id: 'bd-m9',
    number: 9,
    title: 'How We Talk: The Magppie Voice',
    originalTitle: 'Customer Communication Standards',
    competency: 'Customer Communication',
    summary: 'Convert statements to questions, the forbidden-word list, and pronunciation.',
    blocks: [
      {
        kind: 'paragraph',
        text: 'Convert statements into questions — e.g., instead of "These are the most commonly used materials," say "These are the most commonly used materials, right sir?" This keeps the customer engaged rather than being talked at.',
      },
      { kind: 'heading', text: 'Forbidden words and their replacements' },
      {
        kind: 'table',
        columns: ['Forbidden', 'Use instead'],
        rows: [
          ['carcinogen', '"can be very harmful for your health… reports link it to cancer"'],
          ['wonderful (repeated)', 'use once only, or vary with great/amazing/fantastic'],
          ['yearly deep cleaning', '25 complimentary annual services'],
          ['wooden kitchens are bad', 'most regular wooden kitchens have hidden issues'],
          ['artificial stone (alone)', 'engineered stone / our own patented stone'],
          ['cheap / discount / negotiate', 'fixed price policy / complete transparency'],
          ['I don’t know', 'Let me check with our team and get back to you'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'Brand pronunciation: "Magppie" (mag-pee). Never assume the customer heard the name correctly — if asked "which brand?", slow down and repeat clearly.',
      },
    ],
  },
  {
    id: 'bd-m10',
    number: 10,
    title: 'Know When to Hand Off: Escalation & Quick Reference',
    originalTitle: 'Store Directory, Escalation Rules & Quick Reference',
    competency: 'Customer Communication',
    summary: 'When to escalate to a human, store locations, and the elevator pitch.',
    blocks: [
      {
        kind: 'paragraph',
        text: 'Escalate to a human consultant immediately if: the customer asks for a discount/final price, mentions legal action or a complaint, asks about custom dimensions needing technical review, becomes angry/abusive after two objection-handling attempts, asks about partnership/dealership/B2B, asks about refunds/cancellations, provides complex layout details needing CAD review, or asks something not covered in the training document after two attempts.',
      },
      {
        kind: 'paragraph',
        text: 'Store locations (as of source document): Delhi (Sultanpur, Kirti Nagar, Saket), Mohali, Mumbai, Surat, Bangalore (under construction, ~1 month), Hyderabad (under renovation, opening end of February), and Florida, USA.',
      },
      {
        kind: 'callout',
        label: 'The 5-second elevator pitch',
        text: 'Magppie makes the world’s first kitchens entirely from stone — zero wood, zero formaldehyde, zero termites. Our patented SilverStone is antibacterial, scratch-proof, and comes with a 25-year guarantee plus 25 annual services.',
      },
    ],
  },
]

/* ═══════════════════════════════ QUIZ BANK ═══════════════════════════════ */

export const BD_QUIZ: BdQuizQuestion[] = [
  // ── Module 1 ──
  { id: 'bd-q1', moduleId: 'bd-m1', competency: 'Trust & Credibility', question: 'What is the correct order to present Magppie’s company history?', options: ['35 years old, then stainless steel, then stone', '50+ years group heritage → 20+ years in kitchens → 9+ years SilverStone', '40 years old, always lead with this number', 'Founded in 2016, no prior history'], correctIndex: 1 },
  { id: 'bd-q2', moduleId: 'bd-m1', competency: 'Trust & Credibility', question: 'When was Magppie’s first SilverStone kitchen installed?', options: ['Early 2020', 'Late 2016', '2007', '2023'], correctIndex: 1 },
  { id: 'bd-q3', moduleId: 'bd-m1', competency: 'Trust & Credibility', question: 'According to the mission statement, what three things does Magppie’s product protect?', options: ['Home value, resale price, warranty', 'You, your family, and the planet', 'Kitchen aesthetics, budget, and time', 'Wood, stone, and steel'], correctIndex: 1 },

  // ── Module 2 ──
  { id: 'bd-q4', moduleId: 'bd-m2', competency: 'Product Knowledge', question: 'What percentage of a Wellness Kitchen is made from wood?', options: ['10%', '25%', '0%', '50%'], correctIndex: 2 },
  { id: 'bd-q5', moduleId: 'bd-m2', competency: 'Product Knowledge', question: 'At what temperature is porcelain clay heated to create SilverStone?', options: ['800°C', '1,300°C', '1,800°C', '500°C'], correctIndex: 1 },
  { id: 'bd-q6', moduleId: 'bd-m2', competency: 'Product Knowledge', question: 'Which two nano-particles are infused into SilverStone?', options: ['Gold and platinum', 'Silver and copper', 'Iron and zinc', 'Titanium and silver'], correctIndex: 1 },

  // ── Module 3 ──
  { id: 'bd-q7', moduleId: 'bd-m3', competency: 'Product Knowledge', question: 'How much weight can each SilverStone drawer bear?', options: ['Up to 30 kg', 'Up to 60 kg', 'Up to 100 kg', 'Up to 15 kg'], correctIndex: 1 },
  { id: 'bd-q8', moduleId: 'bd-m3', competency: 'Product Knowledge', question: 'In the 30-day water test, what happened to the wood panel compared to the stone sample?', options: ['Both stayed unchanged', 'The wood swelled and weakened; the stone stayed exactly the same', 'The stone absorbed water faster than wood', 'Both swelled equally'], correctIndex: 1 },
  { id: 'bd-q9', moduleId: 'bd-m3', competency: 'Product Knowledge', question: 'How much more storage do Magppie wall cabinets offer compared to standard kitchens?', options: ['Up to 25%', 'Up to 40%', 'Up to 62%', 'Up to 80%'], correctIndex: 2 },

  // ── Module 4 ──
  { id: 'bd-q10', moduleId: 'bd-m4', competency: 'Trust & Credibility', question: 'At which show did Magppie win the "Most Unexpected Innovation" award?', options: ['IMM Cologne', 'KBIS 2026, Orlando', 'Salone del Mobile', 'Dubai Design Week'], correctIndex: 1 },
  { id: 'bd-q11', moduleId: 'bd-m4', competency: 'Trust & Credibility', question: 'Which two other brands did Magppie place alongside as a top-three winner?', options: ['IKEA and Bosch', 'Caesarstone and LG', 'Samsung and Whirlpool', 'Hafele and Blum'], correctIndex: 1 },
  { id: 'bd-q12', moduleId: 'bd-m4', competency: 'Trust & Credibility', question: 'How many client names should a rep mention per call when discussing celebrity trust?', options: ['The full list, for maximum credibility', '2–3 names maximum', 'Just one, always the same one', 'None — this topic should be avoided'], correctIndex: 1 },

  // ── Module 5 ──
  { id: 'bd-q13', moduleId: 'bd-m5', competency: 'Customer Communication', question: 'In Stage 3 (Problem Agitation), what invisible health risk is introduced via the WHO reference?', options: ['Radiation', 'Formaldehyde gas', 'Lead paint', 'Asbestos'], correctIndex: 1 },
  { id: 'bd-q14', moduleId: 'bd-m5', competency: 'Customer Communication', question: 'Before revealing pricing in Stage 6, what must the rep confirm first?', options: ['The customer’s exact budget number', 'Whether the customer is looking for a premium wellness solution or comparing with basic carpentry', 'The customer’s preferred payment method', 'Nothing — pricing should be shared immediately'], correctIndex: 1 },
  { id: 'bd-q15', moduleId: 'bd-m5', competency: 'Customer Communication', question: 'What is the approximate price range for a 10×10 kitchen?', options: ['₹5–7 lakhs', '₹12–15 lakhs', '₹20–25 lakhs', '₹8–9 lakhs'], correctIndex: 1 },

  // ── Module 6 ──
  { id: 'bd-q16', moduleId: 'bd-m6', competency: 'Objection Handling', question: 'When a customer says "that’s too expensive," what is the correct price comparison to use?', options: ['Compare to unbranded local carpentry only', 'Compare compressed wood material cost (<₹100/sq.ft.) to SilverStone material cost (~₹500/sq.ft.), then reframe around lifetime cost', 'Immediately offer a discount to close the deal', 'Avoid discussing price and change the subject'], correctIndex: 1 },
  { id: 'bd-q17', moduleId: 'bd-m6', competency: 'Objection Handling', question: 'What should a rep offer when a customer says they already have an interior designer?', options: ['Tell the customer to drop their designer', 'Offer to collaborate and coordinate directly with the existing design team', 'Refuse to proceed without a Magppie-appointed designer', 'End the call'], correctIndex: 1 },
  { id: 'bd-q18', moduleId: 'bd-m6', competency: 'Objection Handling', question: 'What is the correct response to "Why not use natural granite or marble?"', options: ['Agree that granite is a better choice', 'Explain that natural stone is porous and mined (environmental harm), while SilverStone is non-porous and engineered', 'Say granite and SilverStone are functionally identical', 'Avoid answering and change topics'], correctIndex: 1 },

  // ── Module 7 ──
  { id: 'bd-q19', moduleId: 'bd-m7', competency: 'Product Knowledge', question: 'What is the key difference between SilverStone and grouted tile surfaces?', options: ['SilverStone has more grout lines', 'SilverStone has no grout lines, so there’s no accumulation of dirt, grease, or fungus', 'Tiles are more hygienic than SilverStone', 'There is no meaningful difference'], correctIndex: 1 },
  { id: 'bd-q20', moduleId: 'bd-m7', competency: 'Product Knowledge', question: 'What is the load-bearing capacity of Magppie’s patented hardware?', options: ['Under 20 kg', 'Around 50 kg', 'Over 100 kg', 'Not specified'], correctIndex: 2 },
  { id: 'bd-q21', moduleId: 'bd-m7', competency: 'Product Knowledge', question: 'Is SilverStone a natural or engineered stone?', options: ['Fully natural, mined from quarries', 'Engineered — made by baking porcelain clay and infusing nano-particles', 'A blend of 50% natural, 50% synthetic', 'Reclaimed natural stone'], correctIndex: 1 },

  // ── Module 8 ──
  { id: 'bd-q22', moduleId: 'bd-m8', competency: 'Pricing Knowledge', question: 'What is the standard payment schedule?', options: ['100% advance', '50% advance, 40% before dispatch, 10% after installation', '30% advance, 70% on completion', 'Payment only after installation'], correctIndex: 1 },
  { id: 'bd-q23', moduleId: 'bd-m8', competency: 'Pricing Knowledge', question: 'How long is the process from final order to installation?', options: ['1–2 weeks', '1 month', '3–4 months', '8–10 months'], correctIndex: 2 },
  { id: 'bd-q24', moduleId: 'bd-m8', competency: 'Pricing Knowledge', question: 'What does the 25-year stone guarantee cover?', options: ['Only manufacturing defects', 'Termites, water damage, discoloration, swelling, warping, and manufacturing defects', 'Accidental damage of any kind', 'Only the countertop, not the cabinets'], correctIndex: 1 },

  // ── Module 9 ──
  { id: 'bd-q25', moduleId: 'bd-m9', competency: 'Customer Communication', question: 'What should replace the word "carcinogen" when discussing formaldehyde with a customer?', options: ['"Deadly poison"', '"Can be very harmful for your health… reports link it to cancer"', 'Avoid the topic entirely', '"A minor health concern"'], correctIndex: 1 },
  { id: 'bd-q26', moduleId: 'bd-m9', competency: 'Customer Communication', question: 'How should a rep respond if they genuinely don’t know the answer to a customer’s question?', options: ['Guess an answer that sounds plausible', 'Say "I don’t know" directly', 'Say "Let me check with our team and get back to you"', 'Change the subject'], correctIndex: 2 },
  { id: 'bd-q27', moduleId: 'bd-m9', competency: 'Customer Communication', question: 'What is the correct pronunciation guidance for the brand name?', options: ['"Mag-pie" like the bird, no correction needed', '"Mag-pee" — and always repeat clearly if the customer didn’t catch it', 'Pronunciation doesn’t matter', '"Ma-ja-pee"'], correctIndex: 1 },

  // ── Module 10 ──
  { id: 'bd-q28', moduleId: 'bd-m10', competency: 'Customer Communication', question: 'Which of these should trigger an immediate handoff to a human consultant?', options: ['A customer asking about the material composition', 'A customer asking for a discount or "final price"', 'A customer asking about store locations', 'A customer asking about the warranty period'], correctIndex: 1 },
  { id: 'bd-q29', moduleId: 'bd-m10', competency: 'Customer Communication', question: 'As of this document, what is the status of the Hyderabad store?', options: ['Fully open', 'Permanently closed', 'Under renovation, opening by end of February', 'Not yet planned'], correctIndex: 2 },
  { id: 'bd-q30', moduleId: 'bd-m10', competency: 'Customer Communication', question: 'What is the correct response if a customer’s city has no Magppie store?', options: ['Tell them Magppie doesn’t serve their area', 'Offer sample delivery or a video call instead', 'End the conversation', 'Give a vague answer and move on'], correctIndex: 1 },
]

/* ─────────────────────────── helpers ─────────────────────────── */

export function bdQuestionsForModule(moduleId: string): BdQuizQuestion[] {
  return BD_QUIZ.filter((q) => q.moduleId === moduleId)
}

/** 80% per module. With 3 questions, that means all 3 correct to pass. */
export function bdQuizPassed(correct: number, total: number): boolean {
  return total > 0 && correct / total >= BD_PASS_THRESHOLD
}

export const BD_COMPETENCIES: BdCompetency[] = [
  'Product Knowledge',
  'Objection Handling',
  'Pricing Knowledge',
  'Customer Communication',
  'Trust & Credibility',
]
