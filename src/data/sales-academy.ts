/**
 * Sales Academy — 11 modules (spec 3.1–3.11 of the Sales Academy Content
 * Pipeline prompt). Content authored ONLY from vetted sources:
 *   - Magppie AI Bot Master Training Document v1.0 ("Single Source of Truth",
 *     May 2026) — already human-reviewed in this repo (src/data/training-doc.ts).
 *   - The Sales Resources Master Index (structural facts: 50/30/20 definition,
 *     Four Phases, showroom flow step list, source statuses).
 *
 * DO-NOT-GUESS FLAGS (leave visible; never resolve silently):
 *   [CONFIRM PAYMENT SPLIT] — AI Bot doc: 50% advance / 40% before dispatch /
 *     10% after installation. Notion "50/30/20 Operating System" + Sales
 *     Manager Script: 50% advance / 30% design approval / 20% pre-dispatch.
 *     Quiz questions on the split carry keyPending and are NOT graded.
 *   [CONFIRM YEAR] — first SilverStone kitchen: AI Bot doc says late 2016;
 *     Notion Brand Story says 2018.
 *   [VERIFY: Red Dot award] — in the original Material Science doc and Brand
 *     Story; absent from the AI Bot doc. Not stated as confirmed fact.
 *   [SOURCE PENDING: …] — Notion-only content (Sales Manager Script verbatim,
 *     CRM Funnel Taxonomy, Glossary, Cross-team orientation, DRF/Closure Form)
 *     not yet pasted; modules 3.9/3.11 are structured shells until it is.
 *
 * Terminology: "SilverStone" (capital S) throughout — confirmed. The forbidden-
 * word replacements apply to ALL Sales content (module sa-m7 teaches them).
 */

import type { ContentBlock } from '@/data/bd-academy'

export const SALES_PASS_THRESHOLD = 0.8 // 80% per module

export interface SalesModule {
  id: string // 'sa-m1' … 'sa-m11'
  number: number
  title: string
  summary: string
  /** Spec quiz-topic tags covered by this module. */
  topics: string[]
  blocks: ContentBlock[]
  /** True while the module is a [SOURCE PENDING] shell (3.9, 3.11). */
  sourcePending?: boolean
}

export interface SalesQuizQuestion {
  id: string
  moduleId: string
  /** Spec topic tag — feeds insight_summary weak/strong detection. */
  topic: string
  question: string
  options: string[]
  correctIndex: number
  /**
   * Answer key held pending an unresolved source conflict (e.g. the payment
   * split). keyPending questions are excluded from grading — do not test a
   * specific answer until the conflict is resolved.
   */
  keyPending?: boolean
}

/* ═══════════════════════════════ MODULES ═══════════════════════════════ */

export const SALES_MODULES: SalesModule[] = [
  /* ── 3.1 Brand Foundation & Company Story ─────────────────────────── */
  {
    id: 'sa-m1',
    number: 1,
    title: 'Brand Foundation & Company Story',
    summary:
      'The mission, the one unified company story, and why Magppie positions as a wellness movement — with the exact no-variations wording.',
    topics: ['company-story', 'mission-positioning'],
    blocks: [
      {
        kind: 'callout',
        label: 'MISSION (VERBATIM — DO NOT ALTER)',
        text: 'Our mission is to transform ordinary homes into wellness homes. Spaces that keep you, your family, and the planet safe.',
      },
      {
        kind: 'paragraph',
        text: 'Magppie is not a kitchen company. Magppie is a Wellness Movement. We do not sell kitchens — we sell health, safety, and 25 years of peace of mind. Every conversation starts from that positioning, not from product features.',
      },
      { kind: 'heading', text: 'The company story — one version, no variations' },
      {
        kind: 'callout',
        label: 'SAY THIS (VERBATIM)',
        text: 'Magppie Group has been in business for over 50 years. For the past 20+ years, we have been creating kitchens and wardrobes. Our first SilverStone kitchen was installed in late 2016, giving us 9+ years of real-world performance validation. We are now expanding globally — we recently opened a store in Florida, USA, and won the Most Unexpected Innovation award at KBIS 2026 in Orlando, the world’s largest kitchen show.',
      },
      {
        kind: 'list',
        items: [
          'ALWAYS lead: 50+ years group heritage → 20+ years in kitchens → 9+ years SilverStone.',
          'NEVER say: "35 years old", "40 years old", or open with "we were into stainless steel".',
        ],
      },
      {
        kind: 'callout',
        label: '[CONFIRM YEAR] — UNRESOLVED CONFLICT',
        text: 'The AI Bot Master Training Document ("no variations") says the first SilverStone kitchen was late 2016. The Notion Brand Story (canonical founder narrative, full text received 2026-07-15) says the first stone kitchen was 2018 — an 11-year research journey that began with the founder\'s 2007 question, ending with an installation in a New Delhi home. Do not resolve this yourself — flag stays until leadership confirms. The quiz does not test the year.',
      },
      { kind: 'heading', text: 'Why material science was ignored in kitchens' },
      {
        kind: 'paragraph',
        text: 'Through 20+ years of building kitchens, Magppie saw the same failures repeat: most regular wooden kitchens have hidden issues — termites, mould, water sagging, and formaldehyde released from plywood and MDF. The industry kept selling finishes; nobody fixed the material. That is the gap SilverStone was built to close, and it is the story a Sales conversation is anchored on.',
      },

      /* ── The Material Science story (Notion Brand Story — canonical) ── */
      { kind: 'heading', text: 'The Material Science story (Brand Story — canonical founder narrative)' },
      {
        kind: 'paragraph',
        text: 'Nature never makes mistakes: every material carries unique properties suited to specific applications — copper carries electricity, steel carries structural strength, glass carries transparency, and stone withstands heat, water, pressure and time. The principle: the right material in the right place creates the best performance. A car cannot be made from wood; a bridge cannot be built from paper.',
      },
      {
        kind: 'paragraph',
        text: 'The kitchen is not furniture — it is a food preparation laboratory, exposed daily to fire, steam, water, oil, heat, acids, heavy usage and food-contamination risks, operating 10–14 hours a day. Yet the material most commonly used worldwide for kitchen cabinets is compressed wood — particle boards, MDF, HDF, HDHMR, plywood — made from wood fibres, waste, glue, chemicals and resins. Wood was nature\'s fuel: the material traditionally used to create fire now surrounds the fire.',
      },
      {
        kind: 'paragraph',
        text: 'History already knew the answer: less than a century ago kitchens were built primarily from stone — naturally water-resistant, fire-resistant, durable, hygienic, long-lasting (temples and the Taj Mahal are stone). The challenge was never stone\'s performance; it was manufacturability and cost — stone has always been 5–7 times more expensive than compressed wood and hard to engineer, fabricate and commercialise at scale. Industrialisation chose easier and cheaper materials, not better ones.',
      },
      {
        kind: 'table',
        columns: ['Year', 'Milestone (per the Brand Story)'],
        rows: [
          ['2007', 'Founder Mr Vinod Jain asks: why can\'t we engineer stone to build an all-stone, zero-wood kitchen? An 11-year research journey begins.'],
          ['2018', 'World\'s first stone-built kitchen installed in a New Delhi home. [CONFIRM YEAR — the AI Bot doc says late 2016]'],
          ['2021', 'SilverStone: silver + copper infused via nano technology — world\'s first Wellness Kitchen; global patents acquired.'],
          ['2023', 'World\'s first Wellness Wardrobe — clothes touch skin daily; conventional wardrobes use particle board/MDF with chemical adhesives.'],
          ['2026', 'Global recognition at KBIS + Red Dot asserted by the Brand Story. [Award name and Red Dot carry flags — see Module 3]'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'The category this created: Wellness Interiors Systems — Wellness Kitchens, Wellness Wardrobes, Wellness Bath Vanities, and Wellness Surfaces for walls and floors. The closing frame: the future of homes will be defined by material intelligence, not decoration — as copper transformed electrical systems and silicon transformed computing, SilverStone transforms the spaces where we cook, live and thrive. Nature already chose the right materials; Magppie rediscovered them and engineered them for modern life.',
      },
    ],
  },

  /* ── 3.2 SilverStone — The Material Science ────────────────────────── */
  {
    id: 'sa-m2',
    number: 2,
    title: 'SilverStone — The Material Science',
    summary:
      'Composition, the 7 Safety Pillars, comparisons to granite/marble/tiles/wood, and the technical FAQ answers every Sales rep must know cold.',
    topics: ['material-composition', 'safety-pillars', 'material-comparisons'],
    blocks: [
      {
        kind: 'callout',
        label: 'WHAT IS SILVERSTONE (VERBATIM)',
        text: 'SilverStone is our patented wellness stone. We take porcelain clay, heat it to 1,300°C, and infuse it with silver and copper nano-particles. This makes it anti-bacterial, anti-fungal, non-porous, stain-proof, scratch-resistant, and impact-resistant. It is 100% food-grade — you can eat directly off it. It is stronger than granite and more elegant than marble. And because it is engineered, not mined, it does not harm the environment.',
      },
      {
        kind: 'paragraph',
        text: 'Key phrase to remember: "It looks like a stone, but it does not behave like a regular stone." Every part of the kitchen is stone — shutters, cabinets, shelves, and the carcass. 0% wood.',
      },
      { kind: 'heading', text: 'The 7 Safety Pillars — always in this order' },
      {
        kind: 'table',
        columns: ['Pillar', 'What it means'],
        rows: [
          ['1. Stain Safe', 'Non-porous. Coffee, haldi, oil wipe off easily.'],
          ['2. Scratch Safe', 'Daily chopping won’t leave marks.'],
          ['3. High Load Bearing', 'Drawers support up to 60 kg each.'],
          ['4. Fire Safe', 'Stone does not catch fire or spread flames.'],
          ['5. Water Safe', '30-day water test: wood swelled, stone unchanged.'],
          ['6. Impact Safe', 'Heavy ceramic jar drop test: stone stayed intact. Stronger than granite.'],
          ['7. More Storage', 'Up to 62% more storage than standard kitchens. Fits large Indian plates.'],
        ],
      },
      { kind: 'heading', text: 'Material comparisons' },
      {
        kind: 'table',
        columns: ['vs', 'The answer'],
        rows: [
          [
            'Granite',
            'Granite is porous — absorbs stains and bacteria, needs periodic polishing, quality varies. SilverStone is non-porous, antibacterial, uniform, stronger than granite.',
          ],
          [
            'Marble',
            'Natural stones come from mining (environmental damage), are porous and high-maintenance. SilverStone is engineered: toxin-free, non-porous, zero maintenance.',
          ],
          [
            'Tiles',
            'Tiles have grout lines that trap dirt, grease, and fungus. SilverStone has no grout lines — mould and fungus cannot grow on it.',
          ],
          [
            'Wood / branded modular',
            'Compressed wood (< Rs. 100/sq.ft. material) contains formaldehyde, attracts termites, absorbs moisture. SilverStone (~Rs. 500/sq.ft. material) is antibacterial, termite-proof, maintenance-free — at a similar finished price.',
          ],
        ],
      },
      { kind: 'heading', text: 'Technical FAQ facts to know cold' },
      {
        kind: 'list',
        items: [
          'Weight: stone is denser than compressed wood; the cabinet structure is engineered to balance the load — no impact on flooring; patented hardware keeps operations smooth.',
          'Brittleness: stronger than granite; heavy-utensil and ceramic-jar drop tested — impact-safe.',
          'Warping: dimensionally stable — does not bend, warp, or sag with moisture, heat, or time.',
          'Waterproof: 30-day submersion test — wood swelled, stone unchanged. (In-built lights are NOT waterproof; they are positioned away from water exposure.)',
          'Food-grade: silver + copper infusion prevents bacteria — you can eat directly off the surface.',
          'Hardware: patented, made in the same European facilities as Blum and Grass; 100+ kg load capacity; rust-resistant with a 10-year warranty.',
          'Maintenance: no buffing or polishing ever — a damp cloth is enough.',
        ],
      },
      {
        kind: 'callout',
        label: 'VIDEO NOTE (COLOSSYAN)',
        text: 'The 7 Safety Pillars table and the granite/tiles/wood comparisons are the natural comparison-graphic segments for this module’s video.',
      },
    ],
  },

  /* ── 3.3 Awards, Trust & Social Proof ──────────────────────────────── */
  {
    id: 'sa-m3',
    number: 3,
    title: 'Awards, Trust & Social Proof',
    summary:
      'The KBIS 2026 award, the celebrity client list (used sparingly), and the trust-without-a-local-showroom answer.',
    topics: ['awards-credibility', 'social-proof'],
    blocks: [
      {
        kind: 'callout',
        label: 'AWARDS (VERBATIM — USE EARLY IN CONVERSATION)',
        text: 'Magppie was recently honoured at KBIS 2026 in Orlando, USA — the world’s largest Kitchen & Bath Industry Show. We won the Most Unexpected Innovation award, placing alongside global leaders like Caesarstone and LG. This was presented by our Director of US Operations, Kishor Rico, on February 17, 2026.',
      },
      {
        kind: 'paragraph',
        text: 'The correct award name is "Most Unexpected Innovation" — this supersedes the earlier "Most Innovative Kitchen Brand" phrasing seen in older material.',
      },
      { kind: 'heading', text: 'Celebrity & high-profile trust' },
      {
        kind: 'paragraph',
        text: 'Trusted by Mukesh Ambani and Anant Ambani (Reliance), M.S. Dhoni and Harbhajan Singh (cricket), Ranbir Kapoor, Shilpa Shetty, Chiranjeevi, and Akhil Akkineni (film), and business leaders like Peyush Bansal (Lenskart) and Rizwan Sajan (Danube Group).',
      },
      {
        kind: 'callout',
        label: 'RULE',
        text: 'Use 2–3 names max per conversation. Do not read the entire list — the source itself forbids it.',
      },
      { kind: 'heading', text: 'Trust without a local showroom' },
      {
        kind: 'paragraph',
        text: 'Trust is built not just through showrooms, but through systems, accountability, and proven performance: central manufacturing with uniform quality standards, in-house trained installation teams, written commitments, and pan-India guarantees and AMS support. Always offer one of: a sample delivery to their home, a video call with an expert, or a visit to an existing customer installation nearby.',
      },
      {
        kind: 'callout',
        label: '[CONFIRM YEAR] + [VERIFY: Red Dot] + [CONFIRM AWARD NAME]',
        text: 'Company-age claims here inherit the [CONFIRM YEAR] conflict (2016 vs 2018 first stone kitchen). The full Notion Brand Story (received 2026-07-15) asserts a Red Dot international design award in 2026 — still absent from the AI Bot doc, so do not state it as confirmed fact. The Brand Story also names the KBIS award "World\'s Most Innovative Kitchen Brand", while the AI Bot doc\'s correction says "Most Unexpected Innovation" supersedes exactly that phrasing — until leadership reconciles the two, use "Most Unexpected Innovation" (the newer correction) with customers. The quiz tests neither.',
      },
    ],
  },

  /* ── 3.4 The Consultative Sales Pitch ──────────────────────────────── */
  {
    id: 'sa-m4',
    number: 4,
    title: 'The Consultative Sales Pitch',
    summary:
      'The 8-stage flow — opening to next-steps handoff — in both channels: the phone/online version (verbatim) and the in-showroom version (same logic, different delivery).',
    topics: ['pitch-flow', 'discovery-qualification', 'problem-agitation'],
    blocks: [
      {
        kind: 'paragraph',
        text: 'One flow, two channels. The logic never changes: open → discover → agitate the real problem → introduce the solution → go deep on the product → qualify budget BEFORE pricing → price with confidence → move to a concrete next step. Delivery differs by context.',
      },
      { kind: 'heading', text: 'The 8 stages (phone/online — verbatim source)' },
      {
        kind: 'table',
        columns: ['Stage', 'What happens', 'Key line / rule'],
        rows: [
          ['1. Opening (15s)', 'Introduce, confirm time, building vs renovating', '"Do you have a couple of minutes to talk?" [PAUSE 2s]'],
          ['2. Discovery (30s)', 'City, own home vs investment, designer involved?', 'Confirms serviceability, budget context, coordination'],
          ['3. Problem agitation (45s)', 'Hidden problems of wooden kitchens → formaldehyde', '"Are you familiar with the World Health Organisation?" — WHO framing, softened language'],
          ['4. Solution intro (30s)', 'World’s first kitchens entirely from stone', '"We call them Wellness Kitchens… designed to keep your family safe and healthy."'],
          ['5. Product deep dive (60s)', 'SilverStone: silver/copper nano-particles, non-porous, guarantees', '25-year unconditional guarantee + 25 annual services + KBIS 2026'],
          ['6. Budget qualification', 'Premium wellness vs basic carpentry — BEFORE any number', '"Magppie is not in the carpentry segment."'],
          ['7. Pricing (30s)', 'Range, what’s included, alignment check', 'Rs. 8,400–10,800/sq.ft; "Does this range align with what you’re considering?"'],
          ['8. Next steps (20s)', 'Layout → customised estimate → WhatsApp handoff', '"Can I send you a customised proposal for your layout on WhatsApp?"'],
        ],
      },
      {
        kind: 'callout',
        label: 'PROBLEM AGITATION (VERBATIM CORE)',
        text: 'Most regular wooden kitchens have a lot of hidden problems… the biggest concern is something people can’t even see — formaldehyde gas, released from plywood and MDF. WHO says formaldehyde can be very harmful for your health. It can lead to skin issues, asthma, and multiple reports say it can also cause cancer.',
      },
      { kind: 'heading', text: 'The showroom version (Sales Manager Script)' },
      {
        kind: 'list',
        ordered: true,
        items: [
          'Re-qualify the visitor (who, city, project stage, designer involved)',
          'Category reframe — wellness movement, not modular kitchens',
          'Material-science walkthrough (SilverStone, live demos)',
          'Wellness / premium justification',
          'The 15-year value frame (lifetime cost vs wood)',
          'Pricing',
          'Payment terms [CONFIRM PAYMENT SPLIT]',
          'Closure intent',
        ],
      },
      {
        kind: 'callout',
        label: '[SOURCE PENDING: Sales Manager Script verbatim]',
        text: 'The step order above comes from the Notion Sales Manager Script summary in the Sales Resources index. The full showroom wording has not been pasted yet — teach the flow logic now; the verbatim script lands when the Notion text is provided.',
      },
      {
        kind: 'callout',
        label: '[CONFIRM PAYMENT SPLIT]',
        text: 'The payment-terms stage carries the unresolved 50/40/10 (AI Bot doc) vs 50/30/20 (Notion) conflict. See Module 6 — the quiz does not test a specific split.',
      },
    ],
  },

  /* ── 3.5 Objection Handling ────────────────────────────────────────── */
  {
    id: 'sa-m5',
    number: 5,
    title: 'Objection Handling',
    summary:
      'The seven full objection scripts — price, need-to-think, existing designer, no showroom, never heard of you, natural stone, and weight/brittleness.',
    topics: ['objection-price', 'objection-trust', 'objection-technical'],
    blocks: [
      { kind: 'heading', text: '“That’s too expensive.”' },
      {
        kind: 'callout',
        label: 'SCRIPT (VERBATIM)',
        text: 'Compressed wood costs under Rs. 100 per square foot, while our SilverStone costs around Rs. 500 per square foot just for the material. Wood kitchens face termites, water damage, fungus, and release formaldehyde — repairs, pest treatment, often full replacement within 5 to 7 years. Our stone kitchens stay as good as new for decades. When you add up the lifetime cost, Magppie often works out to be the smarter investment. Plus a 25-year guarantee and 25 annual services.',
      },
      { kind: 'heading', text: '“I need to think about it / discuss with family.”' },
      {
        kind: 'paragraph',
        text: 'Never push. Offer materials that sell in your absence: a short SilverStone video + customer installation photos on WhatsApp, a quick expert video call, or a sample sent to their home. End with a choice: "Which would work better for you?"',
      },
      { kind: 'heading', text: '“I already have a vendor / interior designer.”' },
      {
        kind: 'paragraph',
        text: 'Welcome it: we regularly collaborate with architects and designers — technical drawings, 3D renders, seamless coordination. Many designers recommend us because SilverStone adds value to their projects. Offer to connect with the designer directly.',
      },
      { kind: 'heading', text: '“How do I trust you without a showroom in my city?”' },
      {
        kind: 'paragraph',
        text: 'Systems, accountability, proven performance: central manufacturing, in-house installation teams, written commitments, pan-India guarantees and AMS support — then offer sample delivery / video call / customer-site visit.',
      },
      { kind: 'heading', text: '“I’ve never heard of Magppie.”' },
      {
        kind: 'paragraph',
        text: 'We are a premium brand — we don’t mass-market like carpentry shops. 50+ years group heritage; trusted by the Ambanis, M.S. Dhoni, Ranbir Kapoor; KBIS 2026 global innovation award. Offer the brochure + video.',
      },
      { kind: 'heading', text: '“Why not natural stone (granite/marble)?” + weight & brittleness' },
      {
        kind: 'list',
        items: [
          'Natural stone: mining harms the environment (against the wellness philosophy); porous, harbours bacteria, needs polishing; quality varies. SilverStone: non-porous, antibacterial, zero maintenance, uniform, stronger than granite.',
          'Weight: denser than compressed wood, but the cabinet structure distributes the load — no flooring impact; smoother operation via patented hardware.',
          'Brittleness: stronger than granite; heavy-utensil and ceramic-jar drop tested — impact-safe.',
        ],
      },
      {
        kind: 'callout',
        label: 'SCOPE NOTE',
        text: 'This module covers the AI Bot doc’s objection scripts. The live "Sales Assist — Plays" database (30+ plays) is not yet accessible — this module expands when it is.',
      },
    ],
  },

  /* ── 3.6 Pricing & Payment Terms ───────────────────────────────────── */
  {
    id: 'sa-m6',
    number: 6,
    title: 'Pricing & Payment Terms',
    summary:
      'The pricing matrix, what’s included vs quoted separately, guarantees — and the unresolved payment-split conflict, presented as exactly that.',
    topics: ['pricing-matrix', 'payment-terms'],
    blocks: [
      { kind: 'heading', text: 'The pricing matrix' },
      {
        kind: 'table',
        columns: ['Item', 'Price / term'],
        rows: [
          ['Wellness Kitchen', 'Rs. 8,400 – 10,800 / sq.ft (by finish)'],
          ['Wellness Wardrobe', 'Rs. 7,320 / sq.ft'],
          ['10x10 kitchen (typical)', 'Rs. 12 – 15 lakhs (excl. accessories, appliances, GST)'],
          ['Stone guarantee', '25 years, unconditional — termites, water, discoloration, swelling, warping'],
          ['Hardware guarantee', '10 years — rust, defect, malfunction'],
          ['Lighting guarantee', '2 years — defect, failure'],
          ['Annual services', '25 complimentary — deep cleaning, sanitisation, alignment check'],
        ],
      },
      {
        kind: 'list',
        items: [
          'Included: SilverStone cabinets & shutters, internal shelves, soft-close hardware, factory fabrication, transportation, installation.',
          'Quoted separately: accessories, appliances, premium hardware upgrades.',
          'Customer scope: electrical points per final drawings, plumbing, civil changes, appliances — shared as a scope matrix before order confirmation.',
          'Pricing is per square foot of built-up area, depth included — transparent, unlike running-feet estimates.',
          'Fixed price policy, complete transparency — never "cheap", "discount", or "negotiate".',
        ],
      },
      {
        kind: 'callout',
        label: 'THE PRICE ANCHOR (VERBATIM)',
        text: 'Wood material < Rs. 100/sq.ft.; SilverStone material ~Rs. 500/sq.ft.; Magppie kitchen Rs. 8,400–10,800/sq.ft. (all-inclusive); branded wood kitchen: similar price, but toxic + high maintenance.',
      },
      { kind: 'heading', text: 'Payment milestones — UNRESOLVED CONFLICT' },
      {
        kind: 'table',
        columns: ['Source', 'Claimed split'],
        rows: [
          ['AI Bot Master Training Document ("Single Source of Truth")', '50% advance · 40% before dispatch · 10% after installation'],
          ['Notion "50/30/20 Operating System" + Sales Manager Script', '50% advance · 30% design approval · 20% pre-dispatch'],
        ],
      },
      {
        kind: 'callout',
        label: '[CONFIRM PAYMENT SPLIT] — DO NOT TELL CUSTOMERS EITHER SPLIT AS FACT',
        text: 'These cannot both be right. Until leadership resolves it, do not quote a specific split to a customer — say the wellness consultant will confirm the payment schedule during the design phase. The quiz question on this is built but its answer key is held; it is not graded.',
      },
      {
        kind: 'paragraph',
        text: 'What the milestones unlock (per the Notion 50/30/20 page): each payment milestone transfers the project between teams — the advance starts the engagement, the mid-milestone gates design/production, and the final milestone precedes dispatch/installation. The exact percentages await [CONFIRM PAYMENT SPLIT].',
      },
    ],
  },

  /* ── 3.7 Approved Language & Messaging Standards ───────────────────── */
  {
    id: 'sa-m7',
    number: 7,
    title: 'Approved Language & Messaging Standards',
    summary:
      'The forbidden-word table, converting statements to confirmation questions, and pacing discipline — real communication standards from live call feedback.',
    topics: ['approved-language', 'communication-standards'],
    blocks: [
      {
        kind: 'paragraph',
        text: 'These came from real customer calls, not theory. They apply to every Sales conversation — showroom, phone, WhatsApp — not just the bot.',
      },
      { kind: 'heading', text: 'Forbidden words → approved language' },
      {
        kind: 'table',
        columns: ['Never say', 'Say instead'],
        rows: [
          ['carcinogen', '"can be very harmful for your health … reports link it to cancer"'],
          ['wonderful (repeated)', 'once only, or vary: great / amazing / fantastic'],
          ['yearly deep cleaning', '25 complimentary annual services'],
          ['wooden kitchens are bad', 'most regular wooden kitchens have hidden issues'],
          ['artificial stone (alone)', 'engineered stone / our own patented stone'],
          ['cheap / discount / negotiate', 'fixed price policy / complete transparency'],
          ['I don’t know', 'Let me check with our team and get back to you'],
        ],
      },
      { kind: 'heading', text: 'Statements → confirmation questions' },
      {
        kind: 'callout',
        label: 'TECHNIQUE (VERBATIM EXAMPLE)',
        text: 'WRONG: "These are the most commonly used materials." RIGHT: "These are the most commonly used materials, right sir?" — convert flat statements into confirmation questions so the customer stays engaged.',
      },
      { kind: 'heading', text: 'Pacing discipline' },
      {
        kind: 'list',
        items: [
          'Pause 1.5–2 seconds after "Do you have a couple of minutes to talk?"',
          'Pause 1 second before revealing any price.',
          'Pause 1 second after health facts (formaldehyde / WHO).',
          'Max 15–18 words per sentence — one idea per breath.',
          'Say "Magppie" (mag-pee) clearly; repeat if asked — never assume they heard it.',
        ],
      },
    ],
  },

  /* ── 3.8 Process & Timeline ────────────────────────────────────────── */
  {
    id: 'sa-m8',
    number: 8,
    title: 'Process & Timeline',
    summary:
      'What happens after a layout is shared, the 3–4 month end-to-end process, site visits — and the Four Phases so Sales knows what surrounds their own stage.',
    topics: ['process-timeline', 'journey-phases'],
    blocks: [
      { kind: 'heading', text: 'After the layout is shared' },
      {
        kind: 'list',
        ordered: true,
        items: [
          'We prepare a customised proposal and estimate from the drawings.',
          'Customer reviews; once budget alignment is approved, Sales creates detailed technical drawings.',
          'After confirmation, the order goes into production.',
        ],
      },
      {
        kind: 'list',
        items: [
          'End-to-end: ~3–4 months from final order to installation, depending on site conditions and design complexity (fast-track may be available).',
          'Site visits happen after design discussion and commercial alignment; video consultations cover the initial stage.',
          'Samples: home/office delivery or an experience-centre visit — always available before deciding.',
          'Assembly: factory-engineered, CNC-precision panels, pre-cut and edge-finished; fixed with specialised hardware, not just adhesives.',
        ],
      },
      { kind: 'heading', text: 'The Four Phases (context — Sales owns Phase 1)' },
      {
        kind: 'table',
        columns: ['Phase', 'Owner', 'Journey-map colour'],
        rows: [
          ['1. Sales-led acquisition', 'BD + Sales', 'Coral'],
          ['2. Design-led detailing', 'Design', 'Purple'],
          ['3. Factory-led production', 'Factory', 'Teal'],
          ['4. Aftercare', 'Service (SOP pending)', 'Grey'],
        ],
      },
      {
        kind: 'callout',
        label: 'VIDEO NOTE (COLOSSYAN)',
        text: 'The Full Journey Map is explicitly flowchart-shaped in the source — build this module’s video as an animated flowchart, colour-coded by phase (coral/purple/teal/grey).',
      },
      {
        kind: 'callout',
        label: '[SOURCE PENDING: Full Journey Map detail]',
        text: 'The stage-gate detail of the Notion Full Journey Map (three stage gates across the four phases) lands here once the Notion content is pasted. Phase names and colours above come from the Sales Resources index.',
      },
    ],
  },

  /* ── 3.9 CRM & Lead Vocabulary — SHELL ─────────────────────────────── */
  {
    id: 'sa-m9',
    number: 9,
    title: 'CRM & Lead Vocabulary',
    summary:
      'Lead statuses, lead types, opportunity stages, and the shared vocabulary (DRF, Closure Form, Principally Agreed, BOQ) — awaiting the Notion source text.',
    topics: ['crm-vocabulary', 'lead-taxonomy'],
    sourcePending: true,
    blocks: [
      {
        kind: 'callout',
        label: '[SOURCE NEEDED: Notion — CRM Funnel Taxonomy + Glossary]',
        text: 'This module’s content comes from two complete Notion pages (CRM Funnel Taxonomy; Glossary) that have not been pasted yet. To keep training accurate, nothing here is invented — the module unlocks once the source text is provided.',
      },
      { kind: 'heading', text: 'What this module will cover (structure ready)' },
      {
        kind: 'list',
        items: [
          'Lead statuses — the canonical list and what each means.',
          'Lead types and opportunity stages.',
          'Shared vocabulary Sales must recognise: DRF, Closure Form, Principally Agreed, BOQ (even where Design/Factory own the work).',
          'Why identical CRM notes matter: the same words must mean the same thing to BD, Sales, and Management.',
        ],
      },
      {
        kind: 'paragraph',
        text: 'Quiz shells for this module are built (flashcard-style matching) but held — no answer keys until the taxonomy text arrives.',
      },
    ],
  },

  /* ── 3.10 Locations & Serviceability ───────────────────────────────── */
  {
    id: 'sa-m10',
    number: 10,
    title: 'Locations & Serviceability',
    summary:
      'The verified store directory, PAN-India and international serviceability, and exactly what to say when a customer’s city isn’t listed.',
    topics: ['locations-serviceability'],
    blocks: [
      {
        kind: 'callout',
        label: 'RULE (VERBATIM)',
        text: 'NEVER say: "We have stores all across the country" without specifics. ALWAYS offer: sample delivery or a video call if the customer’s city is not listed.',
      },
      { kind: 'heading', text: 'Store directory (verified)' },
      {
        kind: 'table',
        columns: ['Location', 'Address', 'Status'],
        rows: [
          ['Delhi — Sultanpur', '352, UGF, Sultanpur, MG Road, near Sultanpur Metro', 'Open'],
          ['Delhi — Kirti Nagar', '12/1, W.H.S., Block-2', 'Open'],
          ['Delhi — Saket', 'Shop 12, GF, Select City Walk Mall', 'Open'],
          ['Mohali', 'SCO No.66, Airport Road, Sector 82, JLPL', 'Open'],
          ['Mumbai', 'One Lodha Place, Office 1615B, Senapati Bapat Marg, Lower Parel', 'Open'],
          ['Surat', 'Solaris Cube, GF, Vesu, Maharana Pratap Road', 'Open'],
          ['Bangalore', '1154, 12th Main Road, Indiranagar', 'Under construction (~1 month)'],
          ['Hyderabad', 'Road No.45, Jubilee Hills', 'Under renovation (by end Feb)'],
          ['USA (Florida)', '802 NW 5th Avenue, Suite 100, Gainesville', 'Open'],
        ],
      },
      {
        kind: 'list',
        items: [
          'Services are PAN India, plus international expansion (Florida store open).',
          'City not listed? Offer a sample delivery or a quick video call with an expert — never a vague deflection.',
          'Projects in a specific city: "We have done multiple projects across India. I can check with our team and let you know about installations in your city."',
        ],
      },
      {
        kind: 'callout',
        label: 'MAINTENANCE NOTE',
        text: 'Store statuses (Bangalore/Hyderabad openings) change faster than the rest of this content — this module is deliberately structured for easy updates.',
      },
    ],
  },

  /* ── 3.11 Handoffs — What Sales Needs to Know — SHELL ──────────────── */
  {
    id: 'sa-m11',
    number: 11,
    title: 'Handoffs — What Sales Needs to Know',
    summary:
      'What BD validates before a lead reaches Sales, why DRF completeness matters, and the 50% handover to Design — awaiting the Notion source text.',
    topics: ['handoff-protocol'],
    sourcePending: true,
    blocks: [
      {
        kind: 'callout',
        label: '[SOURCE NEEDED: Notion — Cross-team orientation + Sales Playbook (DRF, Closure Form)]',
        text: 'This module’s content comes from Notion pages (Cross-team orientation; Sales Playbook — DRF, Closure Form & 50% handover) not yet pasted. Nothing here is invented — the module unlocks once the source text is provided.',
      },
      { kind: 'heading', text: 'What this module will cover (structure ready)' },
      {
        kind: 'list',
        items: [
          'What BD already validated before the lead reached Sales (so Sales doesn’t re-do or contradict it).',
          'The DRF: what it contains and why its completeness decides Design’s speed and accuracy.',
          'The Closure Form and the 50% handover: what transfers to Design at that milestone, and where Sales’ involvement ends.',
          'The boundary: what Sales does and does not own after handover.',
        ],
      },
      {
        kind: 'callout',
        label: '[CONFIRM PAYMENT SPLIT]',
        text: 'The "50% handover" milestone is the one point both payment-split sources agree on (50% advance). What follows it (40/10 vs 30/20) remains unresolved — see Module 6.',
      },
    ],
  },

  /* ── 3.12 Client Ownership (Sales Training doc) ────────────────────────
     Source: content/source-docs/Sales_Training.docx — "Sales — Client
     Ownership Training". Rendered faithfully; the doc's final "Before this
     goes live" section is an L&D note and is deliberately NOT included.

     OVERLAP, FLAGGED NOT RESOLVED: this module states the payment split as
     50/30/20 because its source doc states it plainly. Module sa-m6 still
     carries [CONFIRM PAYMENT SPLIT] and holds its split questions ungraded.
     The conflict is now one-sided in favour of 50/30/20 but has NOT been
     closed out here — that is a call for the process owner, not this file.
     Module sa-m6 also prices at Rs. 8,400-10,800/sq.ft, where this doc says
     Rs. 6-12 lakh per 100 sq ft of CABINET area. Both remain visible. */
  {
    id: 'sa-m12',
    number: 12,
    title: 'Client Ownership — From Handover to Installed Kitchen',
    summary:
      'Every approved answer in the business, plus the process and the pressure points, for the person who owns a client from handover to installed kitchen.',
    topics: ['pricing', 'payment-terms', 'warranty', 'materials', 'objection-handling', 'process-timeline', 'handoff-protocol'],
    blocks: [
      { kind: 'visual', id: 'sales-syllabus' },

      { kind: 'heading', text: 'Start here' },
      { kind: 'paragraph', text: 'What this module is. Every approved answer in the business, plus the process and the pressure points, for the person who owns a client from handover to installed kitchen.' },
      { kind: 'paragraph', text: 'Who it is for. Anyone joining Sales, and everyone already in it doing their annual refresher.' },
      { kind: 'callout', label: 'Scope note', text: 'Written for the person who takes a qualified client from Pre-Sales and owns them through design, quotation, negotiation and closure, whether that happens at an experience centre or over a call. If Sales is split into separate in-store and online roles, this divides cleanly at Part 4 and should become two modules.' },
      { kind: 'paragraph', text: 'Where the answers come from. All 46 are real client questions from recorded calls, answered by the company. This module carries the complete set rather than a subset, because Store Managers and Pre-Sales can pass a hard question to you and you cannot pass it anywhere.' },
      { kind: 'paragraph', text: 'How long it takes. Around three hours for a new joiner, spread across the first three months. Around an hour for the annual refresher.' },
      { kind: 'paragraph', text: 'By the end of this you should be able to:' },
      { kind: 'list', items: [
        'Answer any of the 46 without reaching for a document',
        'State both lists, included and excluded, cold',
        'Explain the guarantee correctly for both ranges, including where they are the same',
        'Take a client through all three payment stages with nobody surprised by anything',
        'Recognise when a price objection is actually an arithmetic problem',
      ] },

      { kind: 'heading', text: 'What this role actually does' },
      { kind: 'paragraph', text: 'Store Managers own the experience. Pre-Sales owns the first conversation. You own the client.' },
      { kind: 'paragraph', text: 'That word is doing real work. Owning a client means that from the moment they are handed to you until their kitchen is installed and working, you are the person who knows where things stand. Not the designer, not the factory, not the installer. You.' },
      { kind: 'paragraph', text: 'It also means you are the only person in this chain who has to answer every question. A Store Manager can hand a hard question to you. Pre-Sales can hand a hard question to you. You cannot hand it anywhere. That is why this document contains all 46 approved answers rather than a subset, and why knowing them properly is not optional.' },
      { kind: 'callout', label: 'The one thing you may never do', text: 'Guess. Everything you say becomes a commitment the company has to honour. If a question falls outside the approved answers, the correct move is to say you will confirm and come back, and then actually confirm. That is not weakness. Improvising a number and being wrong about it two months later, in front of a client who has already paid 50%, is much worse.' },

      { kind: 'heading', text: 'Part 1: The complete approved answers' },
      { kind: 'paragraph', text: 'All 46. Read them once end to end. Then keep this open.' },

      { kind: 'heading', text: 'Pricing and quotations' },
      { kind: 'list', items: [
        'What do your kitchens cost? — Priced per square foot of cabinet area. 100 square foot kitchen: roughly Rs. 6 lakh for Wellness First, up to roughly Rs. 12 lakh for Wellness Pro. Always add: 100 square feet means the width and height of all cabinets added together, not the floor area of the room.',
        'What is included and what is not? — Included: Silverstone cabinets and doors, plus seven accessories (cutlery tray, dish rack, dustbin, detergent holder, corner unit, bottle pull-out, pantry unit). Not included: GST, transportation and handling, installation, countertop, wall cladding, sink, faucet, appliances. We can supply countertop and wall cladding as part of a complete solution, at additional cost.',
        'Can you quote from my floor plan? — Yes. Share the floor plan or kitchen details and we will prepare an estimate and quotation.',
        'Is it per square foot or running foot? — Per square foot of cabinet area. We use that method because it is clearer and fairer.',
        'Explain the charges and how pricing is calculated. — Per square foot of cabinet area; 100 square feet runs roughly Rs. 6 lakh (Wellness First) to Rs. 12 lakh (Wellness Pro); that covers Silverstone cabinets and doors and the seven accessories; GST, transport and handling, installation, countertop, wall cladding, sink, faucet and appliances are additional.',
        'Any discount for interior designers? — Brand policy is fair and transparent pricing. Prices are fixed and apply equally to everyone, so no special designer discounts.',
      ] },

      { kind: 'heading', text: 'Payment' },
      { kind: 'list', items: [
        'What are the payment terms? — Three stages: 50% at order booking, 30% when production drawings are finalised, 20% two weeks before dispatch. EMI available through banks.',
        'Do I pay before design or measurement? — No. Nothing before the basic design and quotation. Once you decide to proceed, payment is required before we take actual site measurements.',
      ] },

      { kind: 'heading', text: 'Warranty and after-sales' },
      { kind: 'visual', id: 'sales-guarantee' },
      { kind: 'list', items: [
        'What about termites in the wall behind the shelves? — Silverstone is termite, bacteria and fungus resistant, guaranteed 25 years. The manufacturing-defect guarantee varies by range, but the termite guarantee is 25 years either way.',
        'Paid service continues after the complimentary visits.',
      ] },

      { kind: 'heading', text: 'Materials' },
      { kind: 'list', items: [
        'What else besides stone? Wood? Hardware? — Silverstone for cabinets, door facias, shelves, drawers, internal modular fixtures, countertops and wall claddings. Infused with silver and copper, which is what resists bacteria, fungus and termites. No wood at all. Hardware is industrial-grade steel.',
        'What kind of stone? Granite, marble, quartz? — None of those, and not conventional engineered stone either. Our own patented material, Silverstone: a specially sanitised porcelain stone. Natural materials fired with silver and copper nano-materials at around 1,260°C.',
        'How durable is it? Does the polish hold? — 25-year guarantee. Highly scratch and stain resistant. 100% food-grade.',
        'Is the ceiling or Sunrooof included? What is it? — Sunrooof lighting is not included in the kitchen price. Sunrooof is Magppie’s sister company, and many clients take it alongside their kitchen. A patented lighting system creating the impression of natural daylight indoors, fitted on a ceiling like a skylight or a wall like a window.',
        'Are cupboards, doors, shelves and drawers all the same material? — Yes, and most internal modular components too.',
        'Are wardrobes stone? Are they heavy? — Yes, entirely Silverstone. Around three times heavier than plywood, so more care during manufacturing and installation. Very easy to use once installed.',
        'How is it manufactured? — Similar process to porcelain stone. Natural minerals blended with silver and copper at nano scale, compacted under thousands of tonnes of hydraulic pressure, sintered at around 1,260°C. Fuses into one solid non-porous body. Silver and copper sit inside the material rather than as a surface coating, so they cannot wear off.',
        'Do you manufacture or import? — We manufacture Silverstone in India. Hardware is imported from Germany, using Magppie’s patented technology, through specialised facilities there.',
        'Can I see MTC reports or a material list? — Every kitchen is dispatched with a named Bill of Materials. Available test certificates can be provided. We encourage every client to personally examine and test the material before ordering.',
        'What is the weight and density? — Around 2.2 tonnes per cubic metre. Harder to handle during manufacturing and installation, no difference in daily use.',
        'Do you use laminate or fabric? — No. Silverstone provides the durability and finish on its own, with no lamination needed.',
      ] },

      { kind: 'heading', text: 'Product range and inclusions' },
      { kind: 'list', items: [
        'Do you provide complete fittings? — Yes, a complete integrated solution: hardware, accessories, drawers, lighting and other components. Countertop and wall cladding available at additional cost. Sink, faucet and appliances not included, and can come from a specialist agency of their choice.',
        'Is the sink or basin included? — No. Sink, basin, faucets and water fittings are not included. A specialist agency of their choice handles those.',
        'Can I see display kitchens or samples first? — Yes. Experience centres in Delhi, Mumbai, Bangalore, Hyderabad, Surat, Mohali and Coimbatore.',
      ] },

      { kind: 'heading', text: 'Customisation and design' },
      { kind: 'list', items: [
        'What finishes and design options are there? — Wellness Pro offers multiple design and door-finish options. Wellness First is more standardised, with four design options.',
      ] },

      { kind: 'heading', text: 'Installation and site work' },
      { kind: 'list', items: [
        'Do you do civil work? Demolition, plastering? — No. We do not undertake civil work such as demolition, wall breaking, plastering or structural modification. A specialist civil or interior agency handles that.',
        'Factory-made or built on site? — Fully manufactured at the Magppie factory, installed on site. Arrives flat-packed with most hardware pre-assembled. An installation team of typically three to four engineers assembles cabinets, door facias and lighting on site.',
        'Do you install Sunrooof? — Yes, Sunrooof comes with installation. Requires around 12 inches of space between the ceiling and the lighting system.',
        'Can you install into my existing kitchen? — Yes, if you are replacing your existing kitchen with a Magppie kitchen. We do not provide installation-only services for kitchens made by other brands.',
      ] },

      { kind: 'heading', text: 'Timelines' },
      { kind: 'list', items: [
        'How long does installation take? — Around a week for a typical Wellness Kitchen.',
        'When do you start after civil work? — Once the kitchen civil work is complete and the electrical lines, plumbing lines and flooring are ready.',
        'How long does design take? How are appliances handled? — Initial design around a week, assuming no major changes. Typically one round of changes taking around three more days, so generally finalised within 10 days. You select the appliances and our design team integrates them into the design.',
        'How long is manufacturing? — Normally around 75 to 90 days. For an urgent requirement we can sometimes bring it to around 60 days.',
        'When do I get the quotation and design? — First quotation and rough design generally within five days.',
        'Is the showroom open? When is my city? — Seven open now: Delhi, Hyderabad, Bangalore, Mumbai, Surat, Mohali, Coimbatore. Seven more planned within the next 12 months.',
      ] },

      { kind: 'heading', text: 'Coverage and locations' },
      { kind: 'list', items: [
        'Do you serve my city? — Yes, services across cities throughout India.',
        'Do you install in Chennai, Kochi, Mumbai, Jaipur, Jodhpur? — Yes, installation across cities throughout India.',
        'Modular kitchen services all over India? — Yes, across India.',
        'Can I visit a real installed kitchen? — Yes, wherever we have an executed project in your city. Subject to the homeowner’s permission.',
        'Who handles service locally? — Regional service centres across North, South and West. Service teams operate from those centres and travel to the cities they serve.',
      ] },

      { kind: 'heading', text: 'Company credentials' },
      { kind: 'list', items: [
        'Have you done projects in my city? — Jaipur, Mumbai, Hyderabad, Bengaluru, Guwahati, Jodhpur, Nashik, Surat and all major Indian cities. More than 38,000 kitchens over 21 years across India.',
        'Are you connected to Sunrooof, Godrej or Reliance? — Sunrooof is our sister company, Satvic Movement is a daughter company. Not associated with Godrej or Reliance.',
      ] },

      { kind: 'heading', text: 'Process and business model' },
      { kind: 'list', ordered: true, items: [
        'Enquiry online, then a conversation with a sales representative',
        'Visit an experience centre',
        'Designers create the kitchen design',
        'Design finalised, order closed, 50% paid',
        'Site measurements taken, technical drawings prepared',
        'Drawings frozen, 30% paid, drawings go to the factory',
        'Kitchen manufactured, remaining 20% paid',
        'Factory dispatches, our team installs on site',
      ] },
      { kind: 'list', items: [
        'Can I get a quote before possession? — Yes, so you can plan well in advance.',
        'Can I become a dealer or partner? — We do not appoint conventional dealers or distributors in other cities. Business is managed by the parent company through our own operations and teams. We are open to city-centric joint-venture partnerships.',
        'Do you have franchises or authorised representatives? — No conventional franchisees, dealers or distributors. Stores are primarily company-owned and run by our own teams.',
      ] },
      { kind: 'callout', label: 'Escalation', text: 'Anyone seriously interested in a joint venture goes up, not sideways.' },

      { kind: 'heading', text: 'Part 2: The five that actually lose deals' },
      { kind: 'paragraph', text: 'Across the recorded calls, these performed worst. Not because they are hard, but because they are answered loosely.' },
      { kind: 'table', columns: ['Question', 'Call volume', 'What goes wrong'], rows: [
        ['What does it cost', '90 calls', 'More than a third got no clean answer. There is a clean answer. It is in Part 1.'],
        ['What is included', '45 calls', 'Nearly half went badly. The worst-performing question in the business. No way to answer it well without knowing both lists cold.'],
        ['Which cities do you serve', '52 calls', 'The answer is short and it is yes.'],
        ['Can you quote from my floor plan', '30 calls', 'The answer is yes, and it should end with you having the floor plan.'],
        ['Per square foot or running foot', '20 calls', 'Per square foot of cabinet area, and here is why that is fairer.'],
      ] },
      { kind: 'callout', label: 'The payoff', text: 'Five answers. Learn only these five properly and you fix more than half of every conversation that currently goes wrong.' },

      { kind: 'heading', text: 'Part 3: The things a client will push on' },
      { kind: 'paragraph', text: 'Approved answers give you the facts. These are the moments where the facts are not the problem.' },
      { kind: 'visual', id: 'sales-objections' },

      { kind: 'heading', text: 'Part 4: Owning the client through the process' },
      { kind: 'paragraph', text: 'Where the money moves is where the relationship is either built or damaged. There are three payment moments and each has a conversation attached.' },
      { kind: 'visual', id: 'sales-journey-gates' },
      { kind: 'paragraph', text: 'Between those points, the parts most often mishandled:' },
      { kind: 'list', items: [
        'Design takes about ten days, including one round of changes. Say ten, not one week, because one round of changes is normal rather than exceptional.',
        'Civil work is not ours. Say this early and clearly. A client discovering it late feels misled, even though it was always true.',
        'Appliances are selected by the client and integrated by our design team. That order matters.',
        'Installation needs electrical, plumbing and flooring finished. Flag it well before it becomes the reason for a delay.',
      ] },

      { kind: 'heading', text: 'Part 5: The learning path for a new joiner' },
      { kind: 'heading', text: 'Weeks 1 and 2: Know the product' },
      { kind: 'list', items: [
        'Brand foundation: what Magppie is, what a Wellness Kitchen is, the founder’s story',
        'Material science: what Silverstone is, how it is made, why silver and copper are inside it rather than on it',
        'The two ranges, and what actually differs between Wellness First and Wellness Pro',
        'Learn Part 1. Start with the five in Part 2',
        'Spend a day at an experience centre with the material in front of you',
      ] },
      { kind: 'heading', text: 'Weeks 3 and 4: Know the process' },
      { kind: 'list', items: [
        'End to end from enquiry to installation, including which team does what',
        'The three payment stages and what each one gates',
        'What Pre-Sales hands you, and what a good handover contains',
        'CRM: how records move, what you must log',
        'Sit in on live client conversations without speaking',
      ] },
      { kind: 'heading', text: 'Month 2: Start selling' },
      { kind: 'list', items: [
        'Running a client conversation end to end',
        'The objections in Part 3, practised out loud',
        'Quotation preparation',
        'Working with designers',
        'Your first clients, with someone senior reviewing afterwards',
      ] },
      { kind: 'heading', text: 'Month 3: Own it' },
      { kind: 'list', items: [
        'Take a client from handover to closure',
        'Handle a live objection unaided',
        'Sit with the installation team for a day. Seeing a kitchen go in changes how you sell it',
        'Review your own recorded conversations against Part 1',
      ] },

      { kind: 'heading', text: 'Part 6: Annual refresher' },
      { kind: 'paragraph', text: 'For anyone already in the role. Around an hour. Re-read Part 1 in full, and Part 3. Then check yourself honestly:' },
      { kind: 'list', items: [
        'Can you say both lists, included and excluded, without looking?',
        'Do you still open the price conversation with the cabinet-area clarification, or have you started assuming?',
        'Can you state the guarantee correctly for both ranges, including the difference between the defect guarantee and the termite guarantee?',
        'Have you offered a 60-day timeline recently? Was it genuinely an urgent case?',
        'Think of your last lost deal. Which question in Part 1 was involved?',
        'Have prices, cities, timelines or payment terms changed this year? Confirm before you quote any of them again.',
      ] },
      { kind: 'callout', label: 'What changed this year', text: '(to be filled in by L and D at each annual release)' },
    ],
  },
]

/* ═══════════════════════════════ QUIZ BANK ═══════════════════════════════ */

export const SALES_QUIZ: SalesQuizQuestion[] = [
  // ── sa-m1 Brand Foundation ──
  {
    id: 'sa-q1',
    moduleId: 'sa-m1',
    topic: 'company-story',
    question: 'What is the ONLY approved order for telling the company story?',
    options: [
      '9+ years SilverStone → 20+ years kitchens → 50+ years group',
      '50+ years group heritage → 20+ years in kitchens → 9+ years SilverStone',
      '35 years in business → stainless steel → kitchens',
      'Start with the KBIS award, then the group heritage',
    ],
    correctIndex: 1,
  },
  {
    id: 'sa-q2',
    moduleId: 'sa-m1',
    topic: 'mission-positioning',
    question: 'How does Magppie position itself?',
    options: [
      'A premium modular kitchen company',
      'A stone-processing manufacturer',
      'A Wellness Movement — selling health, safety, and 25 years of peace of mind',
      'An interior design studio',
    ],
    correctIndex: 2,
  },
  {
    id: 'sa-q3',
    moduleId: 'sa-m1',
    topic: 'company-story',
    question: 'Which opening line is explicitly forbidden?',
    options: [
      '"Magppie Group has been in business for over 50 years."',
      '"We recently won an award at KBIS 2026."',
      '"We are 35 years old and started in stainless steel."',
      '"For the past 20+ years we have been creating kitchens."',
    ],
    correctIndex: 2,
  },

  // ── sa-m2 Material Science ──
  {
    id: 'sa-q4',
    moduleId: 'sa-m2',
    topic: 'material-composition',
    question: 'What makes SilverStone naturally antibacterial?',
    options: [
      'A chemical coating applied after installation',
      'Silver and copper nano-particles infused into porcelain baked at 1,300°C',
      'An epoxy resin layer',
      'Regular sanitisation services',
    ],
    correctIndex: 1,
  },
  {
    id: 'sa-q5',
    moduleId: 'sa-m2',
    topic: 'safety-pillars',
    question: 'In the Water Safe pillar’s 30-day test, what happened?',
    options: [
      'Both wood and stone swelled slightly',
      'The stone changed colour but stayed strong',
      'The wood swelled and weakened; the stone stayed exactly the same',
      'The test lasted 7 days, not 30',
    ],
    correctIndex: 2,
  },
  {
    id: 'sa-q6',
    moduleId: 'sa-m2',
    topic: 'material-comparisons',
    question: 'Why is SilverStone better than tiles specifically?',
    options: [
      'It is cheaper than tiles',
      'It has no grout lines, so dirt, grease, and fungus cannot accumulate',
      'It comes in more colours',
      'Tiles cannot be used in kitchens at all',
    ],
    correctIndex: 1,
  },

  // ── sa-m3 Awards & Trust ──
  {
    id: 'sa-q7',
    moduleId: 'sa-m3',
    topic: 'awards-credibility',
    question: 'What award did Magppie win at KBIS 2026 in Orlando?',
    options: [
      'Most Innovative Kitchen Brand',
      'Best Sustainable Design',
      'Most Unexpected Innovation',
      'Red Dot Design Award',
    ],
    correctIndex: 2,
  },
  {
    id: 'sa-q8',
    moduleId: 'sa-m3',
    topic: 'social-proof',
    question: 'How should the celebrity client list be used on a call?',
    options: [
      'Read the full list to maximise impact',
      'Use 2–3 names max — never read the entire list',
      'Only mention clients from the customer’s own city',
      'Never mention clients at all',
    ],
    correctIndex: 1,
  },
  {
    id: 'sa-q9',
    moduleId: 'sa-m3',
    topic: 'awards-credibility',
    question: 'A customer has no Magppie showroom in their city. What do you offer?',
    options: [
      'A discount for the inconvenience',
      'Sample delivery, an expert video call, or a visit to a nearby customer installation',
      'Tell them to wait until a store opens',
      'Say "we have stores all across the country"',
    ],
    correctIndex: 1,
  },

  // ── sa-m4 Pitch ──
  {
    id: 'sa-q10',
    moduleId: 'sa-m4',
    topic: 'pitch-flow',
    question: 'What must happen BEFORE revealing any price?',
    options: [
      'The problem-agitation stage',
      'Budget qualification — premium wellness vs basic carpentry',
      'Sharing the celebrity client list',
      'Sending the WhatsApp proposal',
    ],
    correctIndex: 1,
  },
  {
    id: 'sa-q11',
    moduleId: 'sa-m4',
    topic: 'problem-agitation',
    question: 'What is the "biggest concern" the problem-agitation stage builds to?',
    options: [
      'Termites in old kitchens',
      'The high maintenance cost of wood',
      'Formaldehyde gas released from plywood and MDF — the WHO health framing',
      'Water sagging in cabinets',
    ],
    correctIndex: 2,
  },
  {
    id: 'sa-q12',
    moduleId: 'sa-m4',
    topic: 'discovery-qualification',
    question: 'Which three things does the discovery stage confirm?',
    options: [
      'Age, income, and family size',
      'City (serviceability), own home vs investment (budget context), designer involvement (coordination)',
      'Preferred colour, finish, and appliances',
      'Whether they saw the Instagram ad',
    ],
    correctIndex: 1,
  },

  // ── sa-m5 Objections ──
  {
    id: 'sa-q13',
    moduleId: 'sa-m5',
    topic: 'objection-price',
    question: 'The core of the price-objection answer is:',
    options: [
      'Offer a limited-time discount',
      'Material economics + lifetime cost: wood < Rs. 100/sq.ft vs SilverStone ~Rs. 500/sq.ft, wood needs replacement in 5–7 years, stone lasts decades',
      'Suggest a smaller kitchen to fit the budget',
      'Compare against local carpenters',
    ],
    correctIndex: 1,
  },
  {
    id: 'sa-q14',
    moduleId: 'sa-m5',
    topic: 'objection-trust',
    question: '“I’ve never heard of Magppie.” The right response leads with:',
    options: [
      'An apology for weak marketing',
      'Premium positioning: we don’t mass-market; 50+ years heritage, Ambani/Dhoni/Ranbir trust, KBIS 2026 award',
      'A list of all nine stores',
      'The payment schedule',
    ],
    correctIndex: 1,
  },
  {
    id: 'sa-q15',
    moduleId: 'sa-m5',
    topic: 'objection-technical',
    question: 'A customer worries stone will damage their floor. The answer:',
    options: [
      'Recommend reinforcing the floor first',
      'The cabinet structure distributes the load evenly — no flooring impact, and operations are smoother thanks to patented hardware',
      'Suggest a thinner stone variant',
      'Admit it is a known issue but rare',
    ],
    correctIndex: 1,
  },

  // ── sa-m6 Pricing ──
  {
    id: 'sa-q16',
    moduleId: 'sa-m6',
    topic: 'pricing-matrix',
    question: 'What is the Wellness Kitchen price range?',
    options: [
      'Rs. 5,000 – 7,000 / sq.ft',
      'Rs. 7,320 flat / sq.ft',
      'Rs. 8,400 – 10,800 / sq.ft depending on finish',
      'Rs. 12,000 – 15,000 / sq.ft',
    ],
    correctIndex: 2,
  },
  {
    id: 'sa-q17',
    moduleId: 'sa-m6',
    topic: 'pricing-matrix',
    question: 'Which of these is NOT included in the standard kitchen price?',
    options: [
      'Factory fabrication and transportation',
      'SilverStone cabinets, shutters, and internal shelves',
      'Appliances and premium hardware upgrades',
      'Installation',
    ],
    correctIndex: 2,
  },
  {
    id: 'sa-q18',
    moduleId: 'sa-m6',
    topic: 'payment-terms',
    question:
      '[KEY HELD — CONFIRM PAYMENT SPLIT] What is the standard payment milestone split?',
    options: [
      '50% advance · 40% before dispatch · 10% after installation',
      '50% advance · 30% design approval · 20% pre-dispatch',
      '100% advance',
      '25% × 4 equal milestones',
    ],
    // Placeholder — NOT graded. Sources conflict (AI Bot doc: option A;
    // Notion 50/30/20: option B). Resolve [CONFIRM PAYMENT SPLIT] first.
    correctIndex: 0,
    keyPending: true,
  },

  // ── sa-m7 Approved Language ──
  {
    id: 'sa-q19',
    moduleId: 'sa-m7',
    topic: 'approved-language',
    question: 'Instead of the word “carcinogen”, you should say:',
    options: [
      '"cancer-causing chemical"',
      '"can be very harmful for your health … reports link it to cancer"',
      '"toxic gas"',
      'Nothing — never mention health risks',
    ],
    correctIndex: 1,
  },
  {
    id: 'sa-q20',
    moduleId: 'sa-m7',
    topic: 'approved-language',
    question: 'Instead of “yearly deep cleaning”, the correct framing is:',
    options: [
      '"annual maintenance contract"',
      '"free servicing whenever you need"',
      '"25 complimentary annual services"',
      '"lifetime cleaning support"',
    ],
    correctIndex: 2,
  },
  {
    id: 'sa-q21',
    moduleId: 'sa-m7',
    topic: 'communication-standards',
    question: 'If you don’t know an answer, the approved response is:',
    options: [
      '"I don’t know."',
      '"That’s not my department."',
      '"Let me check with our team and get back to you."',
      'Change the subject to pricing',
    ],
    correctIndex: 2,
  },

  // ── sa-m8 Process & Timeline ──
  {
    id: 'sa-q22',
    moduleId: 'sa-m8',
    topic: 'process-timeline',
    question: 'How long does the process take from final order to installation?',
    options: ['2–3 weeks', '1–2 months', '3–4 months', '6–8 months'],
    correctIndex: 2,
  },
  {
    id: 'sa-q23',
    moduleId: 'sa-m8',
    topic: 'process-timeline',
    question: 'What happens immediately after a customer shares their layout?',
    options: [
      'The order goes straight to production',
      'A customised proposal and estimate are prepared from the drawings',
      'A site visit is scheduled the same week',
      'Payment is collected',
    ],
    correctIndex: 1,
  },
  {
    id: 'sa-q24',
    moduleId: 'sa-m8',
    topic: 'journey-phases',
    question: 'Which is the correct order of the Four Phases?',
    options: [
      'Design → Sales → Factory → Aftercare',
      'Sales-led acquisition → Design-led detailing → Factory-led production → Aftercare',
      'Factory → Design → Sales → Aftercare',
      'Sales → Factory → Design → Aftercare',
    ],
    correctIndex: 1,
  },

  // ── sa-m9 CRM Vocabulary — SHELLS (key held: source pending) ──
  {
    id: 'sa-q25',
    moduleId: 'sa-m9',
    topic: 'crm-vocabulary',
    question: '[KEY HELD — SOURCE PENDING] Match the term "DRF" to its definition.',
    options: ['[Pending Notion Glossary]', '—', '—', '—'],
    correctIndex: 0,
    keyPending: true,
  },
  {
    id: 'sa-q26',
    moduleId: 'sa-m9',
    topic: 'lead-taxonomy',
    question: '[KEY HELD — SOURCE PENDING] Identify the correct sequence of opportunity stages.',
    options: ['[Pending Notion CRM Funnel Taxonomy]', '—', '—', '—'],
    correctIndex: 0,
    keyPending: true,
  },

  // ── sa-m10 Locations ──
  {
    id: 'sa-q27',
    moduleId: 'sa-m10',
    topic: 'locations-serviceability',
    question: 'A customer’s city has no store. What must you NEVER do?',
    options: [
      'Offer a sample delivery',
      'Offer a video call with an expert',
      'Say "we have stores all across the country" as a vague deflection',
      'Check upcoming store openings',
    ],
    correctIndex: 2,
  },
  {
    id: 'sa-q28',
    moduleId: 'sa-m10',
    topic: 'locations-serviceability',
    question: 'Which two stores are NOT yet open?',
    options: [
      'Mumbai and Surat',
      'Bangalore (under construction) and Hyderabad (under renovation)',
      'Delhi Saket and Mohali',
      'Florida and Mumbai',
    ],
    correctIndex: 1,
  },

  // ── sa-m11 Handoffs — SHELL (key held: source pending) ──
  {
    id: 'sa-q29',
    moduleId: 'sa-m11',
    topic: 'handoff-protocol',
    question: '[KEY HELD — SOURCE PENDING] What transfers to Design at the 50% handover?',
    options: ['[Pending Notion Sales Playbook]', '—', '—', '—'],
    correctIndex: 0,
    keyPending: true,
  },

  /* ── sa-m12 Client Ownership (Sales Training doc, section 4B) ──────────
     16 questions, all graded. The payment-split question here IS graded
     (50/30/20) because its source doc states it plainly — unlike sa-m6,
     whose split questions stay keyPending pending the process owner. */
  { id: 'sa-q-co1', moduleId: 'sa-m12', topic: 'pricing', question: 'How is a Magppie kitchen priced?', options: ['Fixed price per kitchen', 'Per square foot of cabinet area', 'Per running foot', 'Per square foot of floor area'], correctIndex: 1 },
  { id: 'sa-q-co2', moduleId: 'sa-m12', topic: 'pricing', question: 'The 100 sq ft price range, and what ‘100 sq ft’ means:', options: ['Rs. 6–12 lakh; width + height of all cabinets summed (not floor area)', 'Rs. 6–12 lakh; the floor area of the room', 'Rs. 10–20 lakh; the countertop area', 'Rs. 3–6 lakh; the wall area'], correctIndex: 0 },
  { id: 'sa-q-co3', moduleId: 'sa-m12', topic: 'pricing', question: 'Which is the correct ‘included’ list?', options: ['Silverstone cabinets and doors + seven accessories', 'Cabinets, countertop, sink and appliances', 'Everything except GST', 'Cabinets and installation'], correctIndex: 0 },
  { id: 'sa-q-co4', moduleId: 'sa-m12', topic: 'pricing', question: 'Which group is entirely EXCLUDED from the quoted price?', options: ['The seven accessories', 'GST, transport/handling, installation, countertop, wall cladding, sink, faucet, appliances', 'Door facias', 'Drawers and shelves'], correctIndex: 1 },
  { id: 'sa-q-co5', moduleId: 'sa-m12', topic: 'payment-terms', question: 'The three payment stages and what they gate:', options: ['50% booking / 40% dispatch / 10% installation', '50% at order booking / 30% at drawing finalisation (drawings freeze and go to the factory) / 20% two weeks before dispatch', '40% / 40% / 20%', '60% booking / 20% / 20%'], correctIndex: 1 },
  { id: 'sa-q-co6', moduleId: 'sa-m12', topic: 'warranty', question: 'The warranty, stated correctly:', options: ['Flat 25-year guarantee on everything, 25 complimentary services', 'Manufacturing defects: 5 yr (First) / 25 yr (Pro); termite, bacteria and fungus: 25 yr on both; complimentary services: 1 (First) / 5 (Pro)', '10 yr on both ranges', '5 yr on both ranges, no termite cover'], correctIndex: 1 },
  { id: 'sa-q-co7', moduleId: 'sa-m12', topic: 'objection-handling', question: 'The one thing a Sales owner may never do:', options: ['Offer a visit', 'Guess — everything you say becomes a commitment the company must honour', 'Discuss price', 'Mention Sunrooof'], correctIndex: 1 },
  { id: 'sa-q-co8', moduleId: 'sa-m12', topic: 'objection-handling', question: 'A client says ‘that’s more than I expected.’ What do you check first?', options: ['Whether they can get a loan', 'Whether they’ve misunderstood the square footage — many price objections are arithmetic', 'Which competitor quoted lower', 'Whether to offer a discount'], correctIndex: 1 },
  { id: 'sa-q-co9', moduleId: 'sa-m12', topic: 'objection-handling', question: '‘Can you do anything on the price?’ Best handling:', options: ['Offer a small discount to close', 'Pricing is fixed for everyone; move the conversation to scope — what a complete solution includes, which range fits', 'Route to your manager', 'Match a competitor’s price'], correctIndex: 1 },
  { id: 'sa-q-co10', moduleId: 'sa-m12', topic: 'process-timeline', question: 'Manufacturing timeline:', options: ['30–45 days always', 'Around 75–90 days; ~60 possible for genuine urgent cases (an exception, not a lever)', '6 months', '2 weeks'], correctIndex: 1 },
  { id: 'sa-q-co11', moduleId: 'sa-m12', topic: 'materials', question: '‘Will the silver wear off over time?’ Correct answer:', options: ['It may fade after some years', 'Silver and copper are infused inside the material, not coated on, so they cannot wear off', 'We reapply the coating during service visits', 'Only the surface layer has silver'], correctIndex: 1 },
  { id: 'sa-q-co12', moduleId: 'sa-m12', topic: 'objection-handling', question: 'A client wants to see an installed kitchen. What can you promise?', options: ['A visit on a fixed date next week', 'Yes, where there’s a project in their city, subject to the homeowner’s permission — never promise a date you don’t control', 'Only showroom visits, never homes', 'A visit anywhere in India tomorrow'], correctIndex: 1 },
  { id: 'sa-q-co13', moduleId: 'sa-m12', topic: 'materials', question: 'Do you manufacture or import?', options: ['Everything is imported from Germany', 'Silverstone is manufactured in India; hardware is imported from Germany', 'Everything is made in India', 'Silverstone imported, hardware made in India'], correctIndex: 1 },
  { id: 'sa-q-co14', moduleId: 'sa-m12', topic: 'process-timeline', question: 'Civil work (demolition, plastering) — what’s true?', options: ['We include it in the price', 'We don’t do civil work; a specialist agency handles it — flag this early so the client isn’t surprised later', 'We do it at extra cost', 'Only for Wellness Pro'], correctIndex: 1 },
  { id: 'sa-q-co15', moduleId: 'sa-m12', topic: 'payment-terms', question: 'What happens when technical drawings are ‘frozen’ (the 30% stage)?', options: ['Nothing changes yet', 'Drawings lock and go to the factory; the client should understand this before signing, not after', 'The client can still change the layout freely', 'It’s only a formality'], correctIndex: 1 },
  { id: 'sa-q-co16', moduleId: 'sa-m12', topic: 'objection-handling', question: 'A client asks a question you have no approved answer for. What do you do?', options: ['Give your best estimate to keep momentum', 'Say you’ll confirm and come back — then actually confirm; never improvise a number', 'Route it back to Pre-Sales', 'Tell them it’s not possible'], correctIndex: 1 },
]

/* ═══════════════════════════════ HELPERS ═══════════════════════════════ */

/** Gradeable questions for a module — keyPending shells are excluded. */
export function salesQuestionsForModule(moduleId: string): SalesQuizQuestion[] {
  return SALES_QUIZ.filter((q) => q.moduleId === moduleId && !q.keyPending)
}

/** Held (keyPending) questions for a module — shown as a notice, not graded. */
export function salesHeldQuestionsForModule(moduleId: string): SalesQuizQuestion[] {
  return SALES_QUIZ.filter((q) => q.moduleId === moduleId && q.keyPending)
}

export function salesQuizPassed(correct: number, total: number): boolean {
  if (total === 0) return false
  return correct / total >= SALES_PASS_THRESHOLD
}
