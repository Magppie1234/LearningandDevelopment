/**
 * Sales Academy FAQ visualizer — same system as the BD FAQ (src/lib/bd-faq).
 *
 * Every item's `question` and `answer` restate content already present in
 * SALES_MODULES (src/data/sales-academy.ts), which itself carries only vetted
 * source text — nothing here is invented. The three do-not-guess flags stay
 * visible and unresolved: [CONFIRM PAYMENT SPLIT], [CONFIRM YEAR], and
 * [VERIFY: Red Dot]. Visual-shape fields (nodes/edges/columns/chartData/cards)
 * only restate facts already in that item's answer.
 */

import type { FaqItem } from '@/lib/bd-faq/faq-data'

export const SALES_FAQ_ITEMS: FaqItem[] = [
  /* ── Module 1 · Brand Foundation & Company Story ─────────────────────── */
  {
    id: 'sfaq-1',
    qNum: 1,
    module: 'sa-m1',
    question: 'What is Magppie’s mission — and what does Magppie actually sell?',
    type: 'accordion',
    answer:
      'Our mission is to transform ordinary homes into wellness homes — spaces that keep you, your family, and the planet safe. Magppie is not a kitchen company; it is a Wellness Movement. We do not sell kitchens — we sell health, safety, and 25 years of peace of mind. Every conversation starts from that positioning, not from product features.',
  },
  {
    id: 'sfaq-2',
    qNum: 2,
    module: 'sa-m1',
    question: 'What is the one company story — in the right order?',
    type: 'flow',
    flag: { label: '[CONFIRM YEAR]', tone: 'risk' },
    answer:
      'Magppie Group has been in business for over 50 years. For the past 20+ years we have been creating kitchens and wardrobes. Our first SilverStone kitchen gave us 9+ years of real-world performance validation — the AI Bot doc says late 2016, the Notion Brand Story says 2018; this [CONFIRM YEAR] conflict stays flagged until leadership confirms. We are now expanding globally: a store in Florida, USA, and the Most Unexpected Innovation award at KBIS 2026 in Orlando. Never say "35 / 40 years old" and never open with "we were into stainless steel."',
    nodes: [
      { id: 'n1', title: '50+ years', subtitle: 'Group heritage', kind: 'step' },
      { id: 'n2', title: '20+ years', subtitle: 'Kitchens & wardrobes', kind: 'step' },
      { id: 'n3', title: '9+ years', subtitle: 'SilverStone validation', kind: 'step', detail: 'First kitchen: late 2016 per the AI Bot doc, 2018 per Notion — [CONFIRM YEAR] unresolved.' },
      { id: 'n4', title: 'Global expansion', kind: 'outcome', tone: 'positive', detail: 'Florida store + Most Unexpected Innovation, KBIS 2026, Orlando.' },
    ],
    edges: [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3' },
      { from: 'n3', to: 'n4' },
    ],
  },
  {
    id: 'sfaq-3',
    qNum: 3,
    module: 'sa-m1',
    question: 'Why did Magppie build SilverStone at all?',
    type: 'cards',
    answer:
      'Through 20+ years of building kitchens, Magppie saw the same failures repeat: most regular wooden kitchens have hidden issues — termites, mould, water sagging, and formaldehyde released from plywood and MDF. The industry kept selling finishes; nobody fixed the material. That is the gap SilverStone was built to close, and it is the story a Sales conversation is anchored on.',
    cards: [
      { title: 'Termites', body: 'A repeating hidden failure of wooden kitchens.' },
      { title: 'Mould', body: 'A repeating hidden failure of wooden kitchens.' },
      { title: 'Water sagging', body: 'A repeating hidden failure of wooden kitchens.' },
      { title: 'Formaldehyde', body: 'Released from plywood and MDF — the problem nobody can see.' },
      { title: 'The gap', body: 'The industry sold finishes; nobody fixed the material. SilverStone closes that gap.' },
    ],
  },

  {
    id: 'sfaq-28',
    qNum: 28,
    module: 'sa-m1',
    question: 'How was the stone kitchen invented — the Brand Story timeline?',
    type: 'flow',
    flag: { label: '[CONFIRM YEAR]', tone: 'risk' },
    answer:
      'Per the canonical Brand Story: in 2007 founder Mr Vinod Jain asked why stone couldn\'t be engineered into an all-stone, zero-wood kitchen — an 11-year research journey. In 2018 the world\'s first stone-built kitchen was installed in a New Delhi home (the AI Bot doc says late 2016 — [CONFIRM YEAR] stays unresolved). In 2021, silver and copper were infused via nano technology to create SilverStone — the first Wellness Kitchen, with global patents. In 2023 came the world\'s first Wellness Wardrobe, and in 2026 global recognition at KBIS. The category created: Wellness Interiors Systems — kitchens, wardrobes, bath vanities, and wellness surfaces.',
    nodes: [
      { id: 'n1', title: '2007 — the question', kind: 'step', detail: 'Founder Mr Vinod Jain: why can\'t stone be engineered into an all-stone, zero-wood kitchen? 11-year research journey begins.' },
      { id: 'n2', title: '2018 — first stone kitchen', kind: 'step', detail: 'World\'s first stone-built kitchen, installed in a New Delhi home. [CONFIRM YEAR: AI Bot doc says late 2016]' },
      { id: 'n3', title: '2021 — SilverStone & Wellness Kitchen', kind: 'step', detail: 'Silver + copper infused via nano technology; global patents acquired.' },
      { id: 'n4', title: '2023 — Wellness Wardrobe', kind: 'step', detail: 'World\'s first wardrobe built entirely in stone.' },
      { id: 'n5', title: '2026 — global recognition', kind: 'outcome', tone: 'positive', detail: 'KBIS recognition (award name carries a flag — see Module 3) and the Wellness Interiors Systems category.' },
    ],
    edges: [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3' },
      { from: 'n3', to: 'n4' },
      { from: 'n4', to: 'n5' },
    ],
  },

  /* ── Module 2 · SilverStone — The Material Science ───────────────────── */
  {
    id: 'sfaq-4',
    qNum: 4,
    module: 'sa-m2',
    question: 'What is SilverStone and how is it made?',
    type: 'flow',
    answer:
      'SilverStone is our patented wellness stone. We take porcelain clay, heat it to 1,300°C, and infuse it with silver and copper nano-particles. This makes it anti-bacterial, anti-fungal, non-porous, stain-proof, scratch-resistant, and impact-resistant. It is 100% food-grade — you can eat directly off it. It is stronger than granite and more elegant than marble. And because it is engineered, not mined, it does not harm the environment.',
    nodes: [
      { id: 'n1', title: 'Porcelain clay', kind: 'step' },
      { id: 'n2', title: 'Heated to 1,300°C', kind: 'step' },
      { id: 'n3', title: 'Silver + copper nano-particles', kind: 'step' },
      {
        id: 'n4',
        title: 'Patented wellness stone',
        kind: 'outcome',
        tone: 'positive',
        detail: 'Anti-bacterial, non-porous, stain-proof, scratch- and impact-resistant, 100% food-grade — stronger than granite, more elegant than marble.',
      },
    ],
    edges: [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3' },
      { from: 'n3', to: 'n4' },
    ],
  },
  {
    id: 'sfaq-5',
    qNum: 5,
    module: 'sa-m2',
    question: 'What are the 7 Safety Pillars — and in what order?',
    type: 'cards',
    answer:
      'Always present the pillars in this order: 1. Stain Safe — non-porous; coffee, haldi, oil wipe off easily. 2. Scratch Safe — daily chopping won’t leave marks. 3. High Load Bearing — drawers support up to 60 kg each. 4. Fire Safe — stone does not catch fire or spread flames. 5. Water Safe — 30-day water test: wood swelled, stone unchanged. 6. Impact Safe — heavy ceramic jar drop test: stone stayed intact; stronger than granite. 7. More Storage — up to 62% more storage than standard kitchens.',
    cards: [
      { title: '1 · Stain Safe', body: 'Non-porous. Coffee, haldi, oil wipe off easily.' },
      { title: '2 · Scratch Safe', body: 'Daily chopping won’t leave marks.' },
      { title: '3 · High Load Bearing', body: 'Drawers support up to 60 kg each.' },
      { title: '4 · Fire Safe', body: 'Does not catch fire or spread flames.' },
      { title: '5 · Water Safe', body: '30-day water test: wood swelled, stone unchanged.' },
      { title: '6 · Impact Safe', body: 'Ceramic-jar drop test: intact. Stronger than granite.' },
      { title: '7 · More Storage', body: 'Up to 62% more than standard kitchens.' },
    ],
  },
  {
    id: 'sfaq-6',
    qNum: 6,
    module: 'sa-m2',
    question: 'How does SilverStone compare to granite, marble, and tiles?',
    type: 'compare',
    answer:
      'Granite is porous — it absorbs stains and bacteria, needs periodic polishing, and its quality varies. Marble and natural stones come from mining (environmental damage) and are porous and high-maintenance. Tiles have grout lines that trap dirt, grease, and fungus. SilverStone is non-porous, antibacterial, uniform, has no grout lines at all, and needs zero maintenance.',
    columns: [
      {
        title: 'Granite · marble · tiles',
        rows: [
          { label: 'Porosity', value: 'Porous — absorbs stains and bacteria' },
          { label: 'Origin', value: 'Mined — environmental damage' },
          { label: 'Grout lines', value: 'Tiles: trap dirt, grease, fungus' },
          { label: 'Maintenance', value: 'Periodic polishing; quality varies' },
        ],
      },
      {
        title: 'SilverStone',
        rows: [
          { label: 'Porosity', value: 'Non-porous, antibacterial' },
          { label: 'Origin', value: 'Engineered, not mined' },
          { label: 'Grout lines', value: 'None at all' },
          { label: 'Maintenance', value: 'Zero — uniform strength and finish' },
        ],
      },
    ],
  },
  {
    id: 'sfaq-7',
    qNum: 7,
    module: 'sa-m2',
    question: 'Is the stone too heavy? Brittle? Will it warp? Is it waterproof?',
    type: 'cards',
    answer:
      'Weight: stone is denser than compressed wood, but the cabinet structure is engineered to balance the load — no impact on flooring; patented hardware keeps operations smooth. Brittleness: stronger than granite — heavy-utensil and ceramic-jar drop tested, impact-safe. Warping: dimensionally stable — does not bend, warp, or sag with moisture, heat, or time. Waterproof: 30-day submersion test — wood swelled, stone unchanged (in-built lights are NOT waterproof; they are positioned away from water exposure). Hardware: patented, made in the same European facilities as Blum and Grass, 100+ kg load capacity, rust-resistant with a 10-year warranty. Maintenance: a damp cloth — no buffing or polishing, ever.',
    cards: [
      { title: 'Weight', body: 'Load engineered into the cabinet structure — no flooring impact.' },
      { title: 'Brittleness', body: 'Stronger than granite; ceramic-jar drop tested — impact-safe.' },
      { title: 'Warping', body: 'Dimensionally stable — no bending, warping, or sagging.' },
      { title: 'Water', body: '30-day submersion: wood swelled, stone unchanged. (In-built lights are not waterproof.)' },
      { title: 'Hardware', body: 'Patented; same European facilities as Blum & Grass; 100+ kg; 10-year warranty.' },
      { title: 'Maintenance', body: 'A damp cloth. No buffing or polishing, ever.' },
    ],
  },

  /* ── Module 3 · Awards, Trust & Social Proof ─────────────────────────── */
  {
    id: 'sfaq-8',
    qNum: 8,
    module: 'sa-m3',
    question: 'What award did Magppie win — and how do I say it right?',
    type: 'accordion',
    flag: { label: '[VERIFY: Red Dot]', tone: 'risk' },
    answer:
      'Magppie was honoured at KBIS 2026 in Orlando, USA — the world’s largest Kitchen & Bath Industry Show — winning the Most Unexpected Innovation award, alongside global leaders like Caesarstone and LG, presented February 17, 2026. The correct name is "Most Unexpected Innovation" — it supersedes the older "Most Innovative Kitchen Brand" phrasing. A Red Dot award appears in older material but is absent from the AI Bot doc — do not state it as confirmed fact.',
  },
  {
    id: 'sfaq-9',
    qNum: 9,
    module: 'sa-m3',
    question: 'Who trusts Magppie — and how many names may I use?',
    type: 'cards',
    answer:
      'Trusted by Mukesh Ambani and Anant Ambani (Reliance), M.S. Dhoni and Harbhajan Singh (cricket), Ranbir Kapoor, Shilpa Shetty, Chiranjeevi, and Akhil Akkineni (film), and business leaders like Peyush Bansal (Lenskart) and Rizwan Sajan (Danube Group). The rule: use 2–3 names max per conversation — never read the entire list.',
    cards: [
      { title: 'Business', body: 'Mukesh & Anant Ambani (Reliance); Peyush Bansal (Lenskart); Rizwan Sajan (Danube Group).' },
      { title: 'Cricket', body: 'M.S. Dhoni and Harbhajan Singh.' },
      { title: 'Film', body: 'Ranbir Kapoor, Shilpa Shetty, Chiranjeevi, Akhil Akkineni.' },
      { title: 'The rule', body: '2–3 names max per conversation. Never read the full list.' },
    ],
  },
  {
    id: 'sfaq-10',
    qNum: 10,
    module: 'sa-m3',
    question: 'How do I build trust when there is no showroom in the customer’s city?',
    type: 'cards',
    answer:
      'Trust is built through systems, accountability, and proven performance: central manufacturing with uniform quality standards, in-house trained installation teams, written commitments, and pan-India guarantees and AMS support. Always offer one of three things: a sample delivery to their home, a video call with an expert, or a visit to an existing customer installation nearby.',
    cards: [
      { title: 'Central manufacturing', body: 'Uniform quality standards.' },
      { title: 'In-house teams', body: 'Trained installation teams.' },
      { title: 'Written commitments', body: 'Provided up front, with pan-India guarantees and AMS support.' },
      { title: 'Then offer one of three', body: 'Sample delivery · expert video call · visit to a customer installation nearby.' },
    ],
  },

  /* ── Module 4 · The Consultative Sales Pitch ─────────────────────────── */
  {
    id: 'sfaq-11',
    qNum: 11,
    module: 'sa-m4',
    question: 'What are the 8 stages of the pitch?',
    type: 'flow',
    answer:
      'One flow, two channels — the logic never changes: open (15s, confirm time, pause 2s) → discovery (city, own home vs investment, designer involved) → problem agitation (hidden problems of wooden kitchens → formaldehyde, WHO framing) → solution intro (world’s first kitchens entirely from stone — Wellness Kitchens) → product deep dive (SilverStone, 25-year guarantee + 25 services, KBIS 2026) → budget qualification BEFORE pricing ("Magppie is not in the carpentry segment") → pricing (₹8,400–10,800/sq.ft, alignment check) → next steps (layout → customised estimate on WhatsApp).',
    nodes: [
      { id: 'n1', title: '1 · Opening', subtitle: '15s — confirm time, pause', kind: 'step' },
      { id: 'n2', title: '2 · Discovery', subtitle: 'City · home vs investment · designer', kind: 'step' },
      { id: 'n3', title: '3 · Problem agitation', subtitle: 'Formaldehyde — WHO framing', kind: 'step' },
      { id: 'n4', title: '4 · Solution intro', subtitle: 'Wellness Kitchens', kind: 'step' },
      { id: 'n5', title: '5 · Deep dive', subtitle: '25-yr guarantee + 25 services', kind: 'step' },
      { id: 'n6', title: '6 · Budget qualification', subtitle: 'Before any number', kind: 'step' },
      { id: 'n7', title: '7 · Pricing', subtitle: '₹8,400–10,800 / sq.ft', kind: 'step' },
      { id: 'n8', title: '8 · Next steps', kind: 'outcome', tone: 'positive', detail: 'Layout → customised estimate on WhatsApp.' },
    ],
    edges: [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3' },
      { from: 'n3', to: 'n4' },
      { from: 'n4', to: 'n5' },
      { from: 'n5', to: 'n6' },
      { from: 'n6', to: 'n7' },
      { from: 'n7', to: 'n8' },
    ],
  },
  {
    id: 'sfaq-12',
    qNum: 12,
    module: 'sa-m4',
    question: 'When do I talk price?',
    type: 'decision',
    answer:
      'Qualify the budget BEFORE any number: is the customer looking at a premium wellness solution, or comparing with basic carpentry? "Magppie is not in the carpentry segment." Only after qualification do you share the range — ₹8,400–10,800 per sq.ft — and check alignment: "Does this range align with what you’re considering?"',
    nodes: [
      { id: 'root', title: 'Budget qualification — before any number', kind: 'decision' },
      { id: 'prem', title: 'Premium wellness solution', kind: 'branch' },
      { id: 'carp', title: 'Comparing with basic carpentry', kind: 'branch' },
      { id: 'price', title: 'Proceed to pricing', kind: 'outcome', tone: 'positive', detail: '₹8,400–10,800/sq.ft — then "Does this range align with what you’re considering?"' },
      { id: 'value', title: 'Value conversation first', kind: 'outcome', tone: 'muted', detail: '"Magppie is not in the carpentry segment" — said kindly, and early.' },
    ],
    edges: [
      { from: 'root', to: 'prem' },
      { from: 'root', to: 'carp' },
      { from: 'prem', to: 'price' },
      { from: 'carp', to: 'value' },
    ],
  },

  /* ── Module 5 · Objection Handling ───────────────────────────────────── */
  {
    id: 'sfaq-13',
    qNum: 13,
    module: 'sa-m5',
    question: '“That’s too expensive.” — what is the answer?',
    type: 'chart',
    chartType: 'bar',
    chartData: [
      { label: 'Wood kitchen — often replaced within (years)', value: 7 },
      { label: 'SilverStone — guaranteed for (years)', value: 25 },
    ],
    answer:
      'Compressed wood costs under Rs. 100 per square foot, while SilverStone costs around Rs. 500 per square foot just for the material. Wood kitchens face termites, water damage, fungus, and formaldehyde — repairs, pest treatment, often full replacement within 5 to 7 years. Stone kitchens stay as good as new for decades. On lifetime cost, Magppie often works out to be the smarter investment — plus a 25-year guarantee and 25 annual services.',
  },
  {
    id: 'sfaq-14',
    qNum: 14,
    module: 'sa-m5',
    question: '“I need to think about it / discuss with family.”',
    type: 'cards',
    answer:
      'Never push. Offer materials that sell in your absence: a short SilverStone video plus customer installation photos on WhatsApp, a quick expert video call, or a sample sent to their home. End with a choice: "Which would work better for you?"',
    cards: [
      { title: 'WhatsApp video', body: 'Short SilverStone video + customer installation photos.' },
      { title: 'Expert video call', body: 'A quick call with a consultant.' },
      { title: 'Home sample', body: 'A sample sent to their home.' },
      { title: 'Then choose', body: '"Which would work better for you?"' },
    ],
  },
  {
    id: 'sfaq-15',
    qNum: 15,
    module: 'sa-m5',
    question: '“I already have a vendor / interior designer.”',
    type: 'accordion',
    answer:
      'Welcome it: we regularly collaborate with architects and designers — technical drawings, 3D renders, seamless coordination. Many designers recommend us because SilverStone adds value to their projects. Offer to connect with the designer directly.',
  },
  {
    id: 'sfaq-16',
    qNum: 16,
    module: 'sa-m5',
    question: '“I’ve never heard of Magppie.”',
    type: 'accordion',
    answer:
      'We are a premium brand — we don’t mass-market like carpentry shops. 50+ years group heritage; trusted by the Ambanis, M.S. Dhoni, Ranbir Kapoor; KBIS 2026 global innovation award. Offer the brochure and the video.',
  },

  /* ── Module 6 · Pricing & Payment Terms ──────────────────────────────── */
  {
    id: 'sfaq-17',
    qNum: 17,
    module: 'sa-m6',
    question: 'What does a Magppie kitchen or wardrobe cost?',
    type: 'chart',
    chartType: 'bar',
    chartData: [
      { label: 'Wellness Kitchen — from', value: 8400 },
      { label: 'Wellness Kitchen — to', value: 10800 },
      { label: 'Wellness Wardrobe', value: 7320 },
    ],
    answer:
      'Wellness Kitchens: Rs. 8,400–10,800 per sq.ft by finish. Wellness Wardrobes: Rs. 7,320 per sq.ft. A typical 10x10 kitchen: Rs. 12–15 lakhs, excluding accessories, appliances, and GST. Pricing is per square foot of built-up area, depth included — transparent, unlike running-feet estimates. Fixed price policy, complete transparency — never "cheap", "discount", or "negotiate".',
  },
  {
    id: 'sfaq-18',
    qNum: 18,
    module: 'sa-m6',
    question: 'What is included in the price — and what is not?',
    type: 'compare',
    answer:
      'Included: SilverStone cabinets and shutters, internal shelves, soft-close hardware, factory fabrication, transportation, and installation. Quoted separately: accessories, appliances, and premium hardware upgrades. Customer scope: electrical points per final drawings, plumbing connections, civil changes, and appliances — shared as a scope matrix before order confirmation.',
    columns: [
      {
        title: 'Included',
        rows: [
          { label: 'Cabinetry', value: 'SilverStone cabinets, shutters, internal shelves' },
          { label: 'Hardware', value: 'Soft-close hardware' },
          { label: 'Execution', value: 'Factory fabrication, transportation, installation' },
        ],
      },
      {
        title: 'Separate / customer scope',
        rows: [
          { label: 'Quoted separately', value: 'Accessories, appliances, premium hardware upgrades' },
          { label: 'Customer scope', value: 'Electrical points, plumbing, civil changes, appliances' },
          { label: 'How it’s shared', value: 'A written scope matrix before order confirmation' },
        ],
      },
    ],
  },
  {
    id: 'sfaq-19',
    qNum: 19,
    module: 'sa-m6',
    question: 'What are the guarantees?',
    type: 'chart',
    chartType: 'bar',
    chartData: [
      { label: 'Stone — unconditional', value: 25 },
      { label: 'Hardware', value: 10 },
      { label: 'Lighting', value: 2 },
    ],
    answer:
      'Stone: 25 years, unconditional — covering termites, water damage, discoloration, swelling, and warping. Hardware: 10 years — rust, defect, malfunction. Lighting: 2 years. Plus 25 complimentary annual services — deep cleaning, sanitisation, and alignment check.',
  },
  {
    id: 'sfaq-20',
    qNum: 20,
    module: 'sa-m6',
    question: 'What is the payment schedule?',
    type: 'compare',
    flag: { label: '[CONFIRM PAYMENT SPLIT]', tone: 'risk' },
    answer:
      'The two sources conflict and this is deliberately unresolved: the AI Bot Master Training Document says 50% advance · 40% before dispatch · 10% after installation, while the Notion 50/30/20 Operating System and Sales Manager Script say 50% advance · 30% design approval · 20% pre-dispatch. These cannot both be right. Until leadership resolves it, do not quote a specific split to a customer — only the 50% advance is common ground; say the wellness consultant will confirm the payment schedule during the design phase.',
    columns: [
      {
        title: 'AI Bot Master Training Document',
        rows: [
          { label: 'Advance', value: '50%' },
          { label: 'Before dispatch', value: '40%' },
          { label: 'After installation', value: '10%' },
        ],
      },
      {
        title: 'Notion 50/30/20 Operating System',
        rows: [
          { label: 'Advance', value: '50%' },
          { label: 'Design approval', value: '30%' },
          { label: 'Pre-dispatch', value: '20%' },
        ],
      },
    ],
  },

  /* ── Module 7 · Approved Language ────────────────────────────────────── */
  {
    id: 'sfaq-21',
    qNum: 21,
    module: 'sa-m7',
    question: 'Which words are forbidden — and what do I say instead?',
    type: 'compare',
    answer:
      'Never "carcinogen" — say "can be very harmful for your health … reports link it to cancer". "Wonderful" once only, or vary it. Never "yearly deep cleaning" — say "25 complimentary annual services". Never "wooden kitchens are bad" — say "most regular wooden kitchens have hidden issues". Never "artificial stone" alone — say "engineered stone" or "our own patented stone". Never "cheap", "discount", or "negotiate" — say "fixed price policy" and "complete transparency". Never "I don’t know" — say "Let me check with our team and get back to you."',
    columns: [
      {
        title: 'Never say',
        rows: [
          { label: '1', value: 'carcinogen' },
          { label: '2', value: 'yearly deep cleaning' },
          { label: '3', value: 'wooden kitchens are bad' },
          { label: '4', value: 'artificial stone (alone)' },
          { label: '5', value: 'cheap · discount · negotiate' },
          { label: '6', value: '"I don’t know"' },
        ],
      },
      {
        title: 'Say instead',
        rows: [
          { label: '1', value: '"very harmful for your health … reports link it to cancer"' },
          { label: '2', value: '25 complimentary annual services' },
          { label: '3', value: 'most regular wooden kitchens have hidden issues' },
          { label: '4', value: 'engineered stone / our own patented stone' },
          { label: '5', value: 'fixed price policy / complete transparency' },
          { label: '6', value: '"Let me check with our team and get back to you"' },
        ],
      },
    ],
  },
  {
    id: 'sfaq-22',
    qNum: 22,
    module: 'sa-m7',
    question: 'How should I pace a Sales conversation?',
    type: 'accordion',
    answer:
      'Pause 1.5–2 seconds after "Do you have a couple of minutes to talk?" Pause 1 second before revealing any price, and 1 second after health facts (formaldehyde / WHO). Keep sentences to 15–18 words — one idea per breath. Say "Magppie" (mag-pee) clearly and repeat it if asked. And convert flat statements into confirmation questions: "These are the most commonly used materials, right sir?"',
  },

  /* ── Module 8 · Process & Timeline ───────────────────────────────────── */
  {
    id: 'sfaq-23',
    qNum: 23,
    module: 'sa-m8',
    question: 'What happens after the customer shares a layout?',
    type: 'flow',
    answer:
      'We prepare a customised proposal and estimate from the drawings. The customer reviews; once budget alignment is approved, Sales creates detailed technical drawings. After confirmation, the order goes into production. End-to-end: about 3–4 months from final order to installation, depending on site conditions and design complexity.',
    nodes: [
      { id: 'n1', title: 'Layout shared', kind: 'step' },
      { id: 'n2', title: 'Proposal + estimate', kind: 'step', detail: 'Prepared from the customer’s drawings.' },
      { id: 'n3', title: 'Budget approved → technical drawings', kind: 'step', detail: 'Sales creates detailed technical drawings.' },
      { id: 'n4', title: 'Production', kind: 'outcome', tone: 'positive', detail: '≈ 3–4 months from final order to installation.' },
    ],
    edges: [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3' },
      { from: 'n3', to: 'n4' },
    ],
  },
  {
    id: 'sfaq-24',
    qNum: 24,
    module: 'sa-m8',
    question: 'What are the Four Phases of the full Magppie journey?',
    type: 'flow',
    answer:
      'Phase 1: Sales-led acquisition (BD + Sales — coral on the journey map). Phase 2: Design-led detailing (Design — purple). Phase 3: Factory-led production (Factory — teal). Phase 4: Aftercare (Service, SOP pending — grey). Sales owns Phase 1; knowing what surrounds it lets you speak about the whole company with confidence.',
    nodes: [
      { id: 'n1', title: '1 · Sales-led acquisition', subtitle: 'BD + Sales', kind: 'step' },
      { id: 'n2', title: '2 · Design-led detailing', subtitle: 'Design', kind: 'step' },
      { id: 'n3', title: '3 · Factory-led production', subtitle: 'Factory', kind: 'step' },
      { id: 'n4', title: '4 · Aftercare', subtitle: 'Service (SOP pending)', kind: 'outcome', tone: 'muted' },
    ],
    edges: [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3' },
      { from: 'n3', to: 'n4' },
    ],
  },
  {
    id: 'sfaq-25',
    qNum: 25,
    module: 'sa-m8',
    question: 'When do site visits and samples happen?',
    type: 'accordion',
    answer:
      'Site visits happen after design discussion and commercial alignment; video consultations cover the initial stage. Samples are always available before deciding — home/office delivery or an experience-centre visit. Assembly is factory-engineered: CNC-precision panels, pre-cut and edge-finished, fixed with specialised hardware — not just adhesives.',
  },

  /* ── Module 10 · Locations & Serviceability ──────────────────────────── */
  {
    id: 'sfaq-26',
    qNum: 26,
    module: 'sa-m10',
    question: 'Where are Magppie’s stores?',
    type: 'cards',
    answer:
      'Open: Delhi — Sultanpur (352, UGF, MG Road, near Sultanpur Metro), Delhi — Kirti Nagar (12/1, W.H.S., Block-2), Delhi — Saket (Shop 12, GF, Select City Walk Mall), Mohali (SCO No.66, Airport Road, Sector 82, JLPL), Mumbai (One Lodha Place, Office 1615B, Lower Parel), Surat (Solaris Cube, GF, Vesu), and Gainesville, Florida, USA (802 NW 5th Avenue, Suite 100). Coming up: Bangalore — Indiranagar (under construction, ~1 month) and Hyderabad — Jubilee Hills (under renovation). Store statuses change fast — keep this current.',
    cards: [
      { title: 'Delhi — Sultanpur', body: '352, UGF, MG Road, near Sultanpur Metro. Open.' },
      { title: 'Delhi — Kirti Nagar', body: '12/1, W.H.S., Block-2. Open.' },
      { title: 'Delhi — Saket', body: 'Shop 12, GF, Select City Walk Mall. Open.' },
      { title: 'Mohali', body: 'SCO No.66, Airport Road, Sector 82, JLPL. Open.' },
      { title: 'Mumbai', body: 'One Lodha Place, 1615B, Lower Parel. Open.' },
      { title: 'Surat', body: 'Solaris Cube, GF, Vesu. Open.' },
      { title: 'Florida, USA', body: '802 NW 5th Avenue, Suite 100, Gainesville. Open.' },
      { title: 'Bangalore', body: 'Indiranagar — under construction (~1 month).' },
      { title: 'Hyderabad', body: 'Jubilee Hills — under renovation.' },
    ],
  },
  {
    id: 'sfaq-27',
    qNum: 27,
    module: 'sa-m10',
    question: 'What do I say when the customer’s city has no store?',
    type: 'decision',
    answer:
      'NEVER say "we have stores all across the country" without specifics. If the city is listed, share the exact store address. If it is not listed, always offer a sample delivery or a quick video call with an expert — never a vague deflection. For projects in a specific city: "We have done multiple projects across India. I can check with our team and let you know about installations in your city." Services are PAN India, plus international expansion.',
    nodes: [
      { id: 'root', title: 'Customer asks: "Do you have a store in my city?"', kind: 'decision' },
      { id: 'yes', title: 'City is on the directory', kind: 'branch' },
      { id: 'no', title: 'City is not listed', kind: 'branch' },
      { id: 'share', title: 'Share the exact address', kind: 'outcome', tone: 'positive', detail: 'Specifics only — never a vague "stores all across the country".' },
      { id: 'offer', title: 'Offer sample delivery or expert video call', kind: 'outcome', tone: 'positive', detail: '"We have done multiple projects across India. I can check with our team about installations in your city."' },
    ],
    edges: [
      { from: 'root', to: 'yes' },
      { from: 'root', to: 'no' },
      { from: 'yes', to: 'share' },
      { from: 'no', to: 'offer' },
    ],
  },
]

export function salesFaqTypeCounts(): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const item of SALES_FAQ_ITEMS) counts[item.type] = (counts[item.type] ?? 0) + 1
  return counts
}
