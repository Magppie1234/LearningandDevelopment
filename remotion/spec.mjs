/**
 * Scene specs for the Sales Academy module videos — drives both the narration
 * (vo, synthesized per scene) and the Remotion animation (type + props).
 * Content mirrors docs/sales-academy-video-scripts.md; every do-not-guess flag
 * holds: no payment split voiced or shown as fact, no first-kitchen year, no
 * Red Dot. Modules 9 & 11 are [SOURCE PENDING] and have no spec.
 */

const CORAL = '#e8836f'
const PURPLE = '#a98bd4'
const TEAL = '#63b3af'
const GREY = '#9aa0a6'

export const MODULE_SPECS = [
  {
    number: 1,
    title: 'Brand Foundation & Company Story',
    scenes: [
      {
        type: 'title',
        vo: "Before you sell a single kitchen, you need to know what Magppie actually is. Here's the surprise — it isn't a kitchen company.",
        props: { kicker: 'Module 1', title: 'Brand Foundation & Company Story', subtitle: 'What Magppie actually is — and the one story we tell about it.' },
      },
      {
        type: 'quote',
        vo: "Our mission is to transform ordinary homes into wellness homes. Spaces that keep you, your family, and the planet safe. Magppie is a Wellness Movement. We don't sell kitchens — we sell health, safety, and twenty-five years of peace of mind.",
        props: { label: 'The mission — verbatim', text: 'Our mission is to transform ordinary homes into wellness homes. Spaces that keep you, your family, and the planet safe.' },
      },
      {
        type: 'timeline',
        vo: 'There is exactly one version of the company story, and it never changes. Magppie Group has been in business for over fifty years. For the past twenty-plus years, we have been creating kitchens and wardrobes. And our first SilverStone kitchen gave us nine-plus years of real-world performance validation.',
        props: {
          heading: 'The one story',
          items: [
            { value: 50, label: 'years of group heritage' },
            { value: 20, label: 'years in kitchens & wardrobes' },
            { value: 9, label: 'years of SilverStone' },
          ],
        },
      },
      {
        type: 'dodont',
        vo: "Never say we're thirty-five or forty years old. Never open with stainless steel. One story, one order: group heritage, kitchens, SilverStone.",
        props: {
          heading: 'One story — no variations',
          dont: ['“We are 35 / 40 years old”', '“We were into stainless steel”'],
          dos: ['50+ years group heritage', '20+ years in kitchens', '9+ years SilverStone'],
        },
      },
      {
        type: 'iconflow',
        vo: "Through twenty years of building kitchens we kept seeing the same failures — termites, mould, water sagging, and formaldehyde from plywood and MDF. The industry kept selling finishes. Nobody fixed the material. That gap is why SilverStone exists — and it's the story every sales conversation is anchored on.",
        props: {
          heading: 'Why the industry missed it',
          items: [
            { icon: '🐛', label: 'Termites' },
            { icon: '🍄', label: 'Mould' },
            { icon: '💧', label: 'Water sagging' },
            { icon: '☁️', label: 'Formaldehyde' },
          ],
          to: { icon: '🪨', label: 'SilverStone' },
        },
      },
      {
        type: 'title',
        vo: 'Learn the story word for word — then take the quiz.',
        props: { title: 'Next: the quiz', subtitle: 'Pass mark 80%' },
      },
    ],
  },

  {
    number: 2,
    title: 'SilverStone — The Material Science',
    scenes: [
      {
        type: 'title',
        vo: 'It looks like a stone. But it does not behave like a regular stone. This is SilverStone — and this module makes you fluent in it.',
        props: { kicker: 'Module 2', title: 'SilverStone — The Material Science', subtitle: '“It looks like a stone, but it does not behave like a regular stone.”' },
      },
      {
        type: 'iconflow',
        vo: "SilverStone is our patented wellness stone. We take porcelain clay, heat it to thirteen hundred degrees Celsius, and infuse it with silver and copper nano-particles. That makes it anti-bacterial, non-porous, stain-proof, scratch-resistant, and impact-resistant. It's one hundred percent food-grade — you can eat directly off it. Stronger than granite. More elegant than marble. Engineered, not mined.",
        props: {
          heading: 'How SilverStone is made',
          items: [
            { icon: '🏺', label: 'Porcelain clay' },
            { icon: '🔥', label: '1,300°C' },
            { icon: '✨', label: 'Silver + copper nano-particles' },
          ],
          to: { icon: '🪨', label: 'SilverStone' },
        },
      },
      {
        type: 'table',
        vo: 'Present the seven safety pillars in this order, every time. Stain safe. Scratch safe. High load bearing — drawers hold up to sixty kilos each. Fire safe. Water safe — in a thirty-day water test, wood swelled while the stone stayed unchanged. Impact safe — a heavy ceramic jar dropped on it left it intact. And more storage — up to sixty-two percent more than standard kitchens.',
        props: {
          heading: 'The 7 Safety Pillars — always in this order',
          columns: ['Pillar', 'What it means'],
          rows: [
            ['1 · Stain Safe', 'Non-porous. Coffee, haldi, oil wipe off easily.'],
            ['2 · Scratch Safe', 'Daily chopping won’t leave marks.'],
            ['3 · High Load Bearing', 'Drawers support up to 60 kg each.'],
            ['4 · Fire Safe', 'Does not catch fire or spread flames.'],
            ['5 · Water Safe', '30-day water test: wood swelled, stone unchanged.'],
            ['6 · Impact Safe', 'Ceramic-jar drop test: intact. Stronger than granite.'],
            ['7 · More Storage', 'Up to 62% more than standard kitchens.'],
          ],
        },
      },
      {
        type: 'table',
        vo: 'Granite is porous — it absorbs stains and bacteria and needs polishing. Marble comes from mining and needs constant care. Tiles trap dirt and fungus in their grout lines. SilverStone is non-porous, antibacterial, uniform — with no grout lines at all.',
        props: {
          heading: 'Versus granite, marble, and tiles',
          columns: ['Material', 'The problem', 'SilverStone'],
          rows: [
            ['Granite', 'Porous — absorbs stains & bacteria, needs polishing', 'Non-porous, antibacterial'],
            ['Marble', 'Mined; high maintenance; quality varies', 'Engineered, uniform, zero maintenance'],
            ['Tiles', 'Grout lines trap dirt, grease, fungus', 'No grout lines at all'],
          ],
          accentCol: 2,
        },
      },
      {
        type: 'bars',
        vo: 'And the big one — compressed wood. The material costs under one hundred rupees a square foot and brings formaldehyde, termites, and moisture damage. SilverStone material is around five hundred rupees a square foot — antibacterial, termite-proof, maintenance-free — at a similar finished kitchen price.',
        props: {
          heading: 'The material truth',
          bars: [
            { label: 'Compressed wood (per sq.ft. material)', value: 100, display: '< ₹{n}', color: '#8a7a68' },
            { label: 'SilverStone (per sq.ft. material)', value: 500, display: '~ ₹{n}' },
          ],
          caption: 'Similar finished kitchen price — completely different material.',
        },
      },
      {
        type: 'checklist',
        vo: "Know these cold. The cabinet structure balances the stone's weight — no impact on flooring. It won't warp, bend, or sag. The hardware is patented, built in the same European facilities as Blum and Grass, carries over a hundred kilos, and is rust-resistant with a ten-year warranty. And maintenance? A damp cloth. Nothing else, ever.",
        props: {
          heading: 'Technical facts to know cold',
          items: [
            'Weight is engineered into the cabinet structure — no flooring impact',
            'Dimensionally stable — no warping, bending, or sagging',
            'Patented hardware (same European facilities as Blum & Grass) — 100+ kg, 10-yr warranty',
            'Maintenance: a damp cloth. No buffing or polishing, ever',
          ],
        },
      },
      {
        type: 'title',
        vo: 'Stronger than granite, more elegant than marble, safer than wood. Now prove it — take the quiz.',
        props: { title: 'Next: the quiz', subtitle: 'Pass mark 80%' },
      },
    ],
  },

  {
    number: 3,
    title: 'Awards, Trust & Social Proof',
    scenes: [
      {
        type: 'title',
        vo: "Trust is won in the first two minutes. Here's the proof you carry into every conversation.",
        props: { kicker: 'Module 3', title: 'Awards, Trust & Social Proof', subtitle: 'The proof you carry into every conversation.' },
      },
      {
        type: 'quote',
        vo: "Magppie was honoured at KBIS twenty-twenty-six in Orlando — the world's largest Kitchen and Bath Industry Show. We won the Most Unexpected Innovation award, placing alongside global leaders like Caesarstone and LG.",
        props: { label: 'KBIS 2026 · Orlando, USA', text: 'Most Unexpected Innovation — alongside Caesarstone and LG, at the world’s largest kitchen & bath show.' },
      },
      {
        type: 'swap',
        vo: "One correction worth remembering: the award is Most Unexpected Innovation — not 'Most Innovative Kitchen Brand'. Precision builds credibility.",
        props: {
          heading: 'Say the award right',
          rows: [{ from: '“Most Innovative Kitchen Brand”', to: '“Most Unexpected Innovation” — KBIS 2026' }],
        },
      },
      {
        type: 'cards',
        vo: "Our kitchens are trusted by the Ambanis, M.S. Dhoni, Ranbir Kapoor, Shilpa Shetty, and business leaders like Peyush Bansal of Lenskart. But here's the rule: use two or three names, maximum. Never read the whole list — it sounds like a script.",
        props: {
          heading: 'Social proof — used sparingly',
          cards: [
            { icon: '🏛', title: 'Business', lines: ['Mukesh & Anant Ambani', 'Peyush Bansal (Lenskart)'] },
            { icon: '🏏', title: 'Sport', lines: ['M.S. Dhoni', 'Harbhajan Singh'] },
            { icon: '🎬', title: 'Film', lines: ['Ranbir Kapoor', 'Shilpa Shetty'] },
            { icon: '☝️', title: 'The rule', lines: ['2–3 names max per call', 'Never read the full list'], color: '#e0a04a' },
          ],
        },
      },
      {
        type: 'cards',
        vo: 'When there is no showroom nearby, trust comes from systems: central manufacturing with uniform standards, in-house installation teams, written commitments, and pan-India guarantees. Then always offer one of three things — a sample to their home, a video call with an expert, or a visit to a customer installation near them.',
        props: {
          heading: 'No showroom in their city? Offer one of three',
          cards: [
            { icon: '📦', title: 'Sample delivery', lines: ['SilverStone sample to their home'] },
            { icon: '🎥', title: 'Expert video call', lines: ['Quick call with a wellness consultant'] },
            { icon: '🏠', title: 'Customer site visit', lines: ['See a real installation nearby'] },
          ],
        },
      },
      {
        type: 'title',
        vo: 'Proof, precision, and three concrete offers. Quiz time.',
        props: { title: 'Next: the quiz', subtitle: 'Pass mark 80%' },
      },
    ],
  },

  {
    number: 4,
    title: 'The Consultative Sales Pitch',
    scenes: [
      {
        type: 'title',
        vo: "One flow. Two channels. Whether you're on a call or standing in the showroom, the logic of a Magppie pitch never changes.",
        props: { kicker: 'Module 4', title: 'The Consultative Sales Pitch', subtitle: 'One flow · two channels — call and showroom.' },
      },
      {
        type: 'flow',
        vo: 'Eight stages. Open. Discover. Agitate the real problem. Introduce the solution. Go deep on the product. Qualify the budget — before any number. Price with confidence. And close on a concrete next step.',
        props: {
          heading: 'The 8-stage flow',
          nodes: [
            { label: 'Opening' },
            { label: 'Discovery' },
            { label: 'Problem' },
            { label: 'Solution' },
            { label: 'Deep dive' },
            { label: 'Budget' },
            { label: 'Pricing' },
            { label: 'Next steps' },
          ],
        },
      },
      {
        type: 'checklist',
        vo: "The opening earns two minutes: introduce yourself, confirm it's a good time — then pause. Genuinely pause. Then discover three things: their city, for serviceability. Own home or investment, for budget context. And whether a designer is involved, for coordination.",
        props: {
          heading: 'Open, pause, discover',
          items: [
            'Introduce → “Do you have a couple of minutes to talk?” → pause 2 seconds',
            'City — confirms serviceability',
            'Own home vs investment — budget context',
            'Designer involved? — coordination',
          ],
        },
      },
      {
        type: 'quote',
        vo: 'Then the truth most customers have never heard: most regular wooden kitchens have hidden issues — termites, mould, sagging. And the one nobody can see: formaldehyde gas from plywood and MDF. The World Health Organisation says formaldehyde can be very harmful for your health — reports link it to cancer. Deliver that slowly. It matters.',
        props: { label: 'Problem agitation — the heart', heading: 'The WHO framing', text: 'Formaldehyde can be very harmful for your health. It can lead to skin issues, asthma — and multiple reports link it to cancer.' },
      },
      {
        type: 'cards',
        vo: 'Never quote before qualifying. Ask: are you looking at a premium wellness solution, or comparing with basic carpentry? Magppie is not in the carpentry segment — say it kindly, and say it early.',
        props: {
          heading: 'Budget before price',
          cards: [
            { icon: '💎', title: 'Premium wellness', lines: ['→ Proceed to pricing'], color: '#9DB18F' },
            { icon: '🪚', title: 'Basic carpentry', lines: ['“Magppie is not in the carpentry segment.”', '→ Value conversation first'], color: '#e0a04a' },
          ],
        },
      },
      {
        type: 'stats',
        vo: "Then the range: eighty-four hundred to ten thousand eight hundred rupees per square foot, by finish. A ten-by-ten kitchen typically lands between twelve and fifteen lakhs. Check alignment — does this range fit what you're considering? — then close on the layout: share your kitchen layout, and we'll prepare a customised estimate on WhatsApp.",
        props: {
          heading: 'Price with confidence',
          stats: [
            { value: '₹8.4–10.8k', label: 'per sq.ft, by finish' },
            { value: '₹12–15 L', label: 'typical 10×10 kitchen' },
            { value: '→ WhatsApp', label: 'layout → customised estimate' },
          ],
          caption: 'Payment schedule: confirmed by the wellness consultant during design. Never quote a split from memory.',
        },
      },
      {
        type: 'flow',
        vo: 'In the showroom the same logic wears different clothes: re-qualify the visitor, reframe the category, walk the material science live, justify the premium, frame the fifteen-year value — then pricing, terms, and closure intent.',
        props: {
          heading: 'The showroom version',
          vertical: true,
          nodes: [
            { label: 'Re-qualify the visitor' },
            { label: 'Category reframe — wellness, not modular' },
            { label: 'Material-science walkthrough (live demos)' },
            { label: 'Premium justification + 15-year value frame' },
            { label: 'Pricing → terms → closure intent' },
          ],
        },
      },
      {
        type: 'title',
        vo: 'Same flow, every channel. Take the quiz.',
        props: { title: 'Next: the quiz', subtitle: 'Pass mark 80%' },
      },
    ],
  },

  {
    number: 5,
    title: 'Objection Handling',
    scenes: [
      {
        type: 'title',
        vo: "An objection isn't a no. It's a request for a better answer. Here are the seven you'll hear most — and exactly how to answer them.",
        props: { kicker: 'Module 5', title: 'Objection Handling', subtitle: 'Seven objections · seven confident answers.' },
      },
      {
        type: 'bars',
        vo: 'Too expensive? Compare materials, then lifetimes. Compressed wood costs under a hundred rupees a square foot; SilverStone is around five hundred — for the material alone. Wood kitchens fight termites, water, and fungus, and often need replacing within five to seven years. Stone stays as good as new for decades. On lifetime cost, Magppie is usually the smarter investment.',
        props: {
          heading: '“That’s too expensive.”',
          bars: [
            { label: 'Wood: replaced in 5–7 years', value: 7, display: '{n} yrs', color: '#8a7a68' },
            { label: 'SilverStone: guaranteed for 25', value: 25, display: '{n} yrs' },
          ],
          caption: 'Lifetime cost, not sticker price — plus 25 annual services included.',
        },
      },
      {
        type: 'cards',
        vo: 'Need to think about it? Never push. Equip. Offer a short SilverStone video and installation photos on WhatsApp, a quick expert video call, or a sample sent home. Then let them choose: which would work better for you?',
        props: {
          heading: '“I need to think about it.”',
          cards: [
            { icon: '🎬', title: 'WhatsApp video', lines: ['SilverStone film + real installations'] },
            { icon: '🎥', title: 'Expert call', lines: ['10 minutes with a consultant'] },
            { icon: '📦', title: 'Home sample', lines: ['Feel the material yourself'] },
          ],
        },
      },
      {
        type: 'checklist',
        vo: "Already have a designer? Welcome it — we collaborate with designers constantly: technical drawings, 3-D renders, seamless coordination. Many designers recommend us because SilverStone raises the value of their projects. No showroom in their city? Systems build trust: central manufacturing, trained in-house installers, written commitments, pan-India support. Never heard of Magppie? We're premium — we don't mass-market. Fifty-plus years of heritage, the Ambanis and Dhoni, and a KBIS twenty-twenty-six award.",
        props: {
          heading: 'Designer · trust · brand',
          items: [
            '“I have a designer” → collaborate: drawings, 3D renders, direct coordination',
            '“No showroom here” → systems: central manufacturing, in-house installers, written commitments',
            '“Never heard of you” → premium positioning: 50+ yrs, Ambani/Dhoni/Ranbir, KBIS 2026',
          ],
        },
      },
      {
        type: 'cards',
        vo: 'The technical three. Why not natural stone? Mining harms the environment, and granite and marble are porous — they stain and harbour bacteria. Too heavy? The cabinet structure distributes the load — no flooring impact. Brittle? Stronger than granite — the ceramic-jar drop test left it intact.',
        props: {
          heading: 'The technical three',
          cards: [
            { icon: '🌍', title: 'Why not granite/marble?', lines: ['Mining harms the planet', 'Porous → stains & bacteria'] },
            { icon: '⚖️', title: '“Too heavy?”', lines: ['Load engineered into the structure', 'Zero flooring impact'] },
            { icon: '🏺', title: '“Will it break?”', lines: ['Stronger than granite', 'Jar-drop tested — intact'] },
          ],
        },
      },
      {
        type: 'title',
        vo: 'Seven objections, seven confident answers. Quiz time.',
        props: { title: 'Next: the quiz', subtitle: 'Pass mark 80%' },
      },
    ],
  },

  {
    number: 6,
    title: 'Pricing & Payment Terms',
    scenes: [
      {
        type: 'title',
        vo: 'Price with total confidence — because everything about Magppie pricing is fixed, transparent, and defensible.',
        props: { kicker: 'Module 6', title: 'Pricing & Payment Terms', subtitle: 'Fixed price · complete transparency.' },
      },
      {
        type: 'table',
        vo: 'Wellness Kitchens: eighty-four hundred to ten thousand eight hundred rupees per square foot, by finish. Wellness Wardrobes: seven thousand three hundred twenty. A typical ten-by-ten kitchen: twelve to fifteen lakhs, excluding accessories, appliances, and GST.',
        props: {
          heading: 'The pricing matrix',
          columns: ['Item', 'Price'],
          rows: [
            ['Wellness Kitchen', '₹8,400 – 10,800 / sq.ft (by finish)'],
            ['Wellness Wardrobe', '₹7,320 / sq.ft'],
            ['10×10 kitchen (typical)', '₹12 – 15 lakhs (excl. accessories, appliances, GST)'],
          ],
        },
      },
      {
        type: 'checklist',
        vo: "Included: SilverStone cabinets and shutters, internal shelves, soft-close hardware, factory fabrication, transport, and installation. Quoted separately: accessories, appliances, premium upgrades. And the customer's scope — electrical, plumbing, civil — goes into a written scope matrix before confirmation. No surprises.",
        props: {
          heading: 'Included vs quoted separately',
          items: [
            'Included: cabinets, shutters, shelves, soft-close hardware, fabrication, transport, installation',
            'Separate: accessories, appliances, premium upgrades',
            'Customer scope (electrical, plumbing, civil) → written scope matrix before confirmation',
          ],
        },
      },
      {
        type: 'stats',
        vo: 'The guarantees do the selling: twenty-five years, unconditional, on the stone. Ten years on hardware. Two on lighting. And twenty-five complimentary annual services — deep cleaning, sanitisation, alignment.',
        props: {
          heading: 'The guarantees do the selling',
          stats: [
            { value: 25, suffix: ' yrs', label: 'stone — unconditional' },
            { value: 10, suffix: ' yrs', label: 'hardware' },
            { value: 2, suffix: ' yrs', label: 'lighting' },
            { value: 25, label: 'complimentary annual services' },
          ],
        },
      },
      {
        type: 'bars',
        vo: 'When price pressure comes, anchor it: wood material under one hundred rupees a square foot. SilverStone, around five hundred. A Magppie kitchen, eighty-four hundred to ten-eight all-inclusive — while a branded wood kitchen costs about the same and brings toxins and maintenance with it.',
        props: {
          heading: 'The price anchor',
          bars: [
            { label: 'Wood material / sq.ft', value: 100, display: '< ₹{n}', color: '#8a7a68' },
            { label: 'SilverStone material / sq.ft', value: 500, display: '~ ₹{n}', color: '#C88255' },
            { label: 'Magppie kitchen / sq.ft (all-in)', value: 10800, display: '₹8,400–10,800' },
          ],
          caption: 'A branded wood kitchen: similar price — plus toxins and maintenance.',
        },
      },
      {
        type: 'warning',
        vo: 'On payment milestones: the schedule starts with a fifty percent advance, and your wellness consultant confirms the full schedule during the design phase. Do not quote a full split from memory — the standard is under review.',
        props: {
          heading: 'Payment terms — say this carefully',
          label: 'CONFIRM PAYMENT SPLIT — under review',
          text: 'Sources conflict (50/40/10 vs 50/30/20). Only the 50% advance is common ground. Never state a full split to a customer — the consultant confirms the schedule during design.',
        },
      },
      {
        type: 'title',
        vo: 'Fixed price. Complete transparency. Never the words cheap, discount, or negotiate. Quiz time.',
        props: { title: 'Next: the quiz', subtitle: 'Pass mark 80%' },
      },
    ],
  },

  {
    number: 7,
    title: 'Approved Language & Messaging Standards',
    scenes: [
      {
        type: 'title',
        vo: 'Every rule in this module came from a real customer call that went wrong. This is how Magppie sounds — on every channel.',
        props: { kicker: 'Module 7', title: 'Approved Language', subtitle: 'Rules learned from real customer calls.' },
      },
      {
        type: 'swap',
        vo: "Seven swaps, non-negotiable. Never 'carcinogen' — say it can be very harmful for your health, and that reports link it to cancer. 'Wonderful' — once per conversation. Never 'yearly deep cleaning' — it's twenty-five complimentary annual services. Never 'wooden kitchens are bad' — most regular wooden kitchens have hidden issues.",
        props: {
          heading: 'Forbidden → approved (1 of 2)',
          rows: [
            { from: 'carcinogen', to: '“very harmful for your health … reports link it to cancer”' },
            { from: 'wonderful (repeated)', to: 'once only — or great / amazing / fantastic' },
            { from: 'yearly deep cleaning', to: '25 complimentary annual services' },
            { from: 'wooden kitchens are bad', to: 'most regular wooden kitchens have hidden issues' },
          ],
        },
      },
      {
        type: 'swap',
        vo: "Never 'artificial stone' alone — engineered stone, or our own patented stone. Never cheap, discount, or negotiate — fixed price policy, complete transparency. And never 'I don't know' — let me check with our team and get back to you.",
        props: {
          heading: 'Forbidden → approved (2 of 2)',
          rows: [
            { from: 'artificial stone (alone)', to: 'engineered stone / our own patented stone' },
            { from: 'cheap · discount · negotiate', to: 'fixed price policy · complete transparency' },
            { from: '“I don’t know”', to: '“Let me check with our team and get back to you”' },
          ],
        },
      },
      {
        type: 'quote',
        vo: "Flat statements lose people. Convert them: 'these are the most commonly used materials' becomes 'these are the most commonly used materials, right sir?' Small question, full engagement.",
        props: { label: 'Statements → confirmation questions', heading: 'The questioning tone', text: 'These are the most commonly used materials… right sir?' },
      },
      {
        type: 'checklist',
        vo: 'And pacing: pause two seconds after asking for their time. One second before any price. One second after a health fact. Keep sentences under eighteen words. One idea per breath. And pronounce it mag-pee — repeat it if they ask.',
        props: {
          heading: 'Pacing discipline',
          items: [
            'Pause 2s after “do you have a couple of minutes?”',
            'Pause 1s before any price · 1s after any health fact',
            'Max 15–18 words per sentence — one idea per breath',
            'Say “MAG-PEE” clearly; repeat if asked',
          ],
        },
      },
      {
        type: 'title',
        vo: 'Language is the product before the product arrives. Quiz time.',
        props: { title: 'Next: the quiz', subtitle: 'Pass mark 80%' },
      },
    ],
  },

  {
    number: 8,
    title: 'Process & Timeline',
    scenes: [
      {
        type: 'title',
        vo: 'The customer asked: what happens after I share my layout? This module gives you the whole journey — theirs and ours.',
        props: { kicker: 'Module 8', title: 'Process & Timeline', subtitle: 'From layout to installation — and the journey around it.' },
      },
      {
        type: 'flow',
        vo: 'Three steps. We prepare a customised proposal and estimate from their drawings. Once the budget aligns, Sales creates the detailed technical drawings. And on confirmation, the order enters production.',
        props: {
          heading: 'After the layout is shared',
          nodes: [
            { label: 'Layout shared' },
            { label: 'Proposal + estimate' },
            { label: 'Technical drawings' },
            { label: 'Production' },
          ],
        },
      },
      {
        type: 'checklist',
        vo: 'End to end, final order to installation runs about three to four months, depending on site conditions and design complexity. Site visits come after design discussion and commercial alignment. Samples are always available. And assembly is factory-engineered: CNC-precision panels, pre-cut, edge-finished, fixed with specialised hardware — not just adhesives.',
        props: {
          heading: 'The timeline facts',
          items: [
            '3–4 months, final order → installation',
            'Site visits after design discussion + commercial alignment',
            'Samples: home delivery or experience centre, anytime',
            'CNC-precision panels, fixed with specialised hardware — not just adhesives',
          ],
        },
      },
      {
        type: 'flow',
        vo: "Now zoom out. The full Magppie journey runs in four phases. Phase one, sales-led acquisition — that's you, with BD. Phase two, design-led detailing. Phase three, factory-led production. Phase four, aftercare. Know what happens before and after your phase — it's how you speak about the whole company with confidence.",
        props: {
          heading: 'The Full Journey Map — four phases',
          gates: true,
          nodes: [
            { label: 'Sales-led acquisition', sub: 'BD + Sales', color: CORAL },
            { label: 'Design-led detailing', sub: 'Design', color: PURPLE },
            { label: 'Factory-led production', sub: 'Factory', color: TEAL },
            { label: 'Aftercare', sub: 'Service', color: GREY },
          ],
        },
      },
      {
        type: 'title',
        vo: 'Three steps after the layout, three to four months to installation, four phases around it all. Quiz time.',
        props: { title: 'Next: the quiz', subtitle: 'Pass mark 80%' },
      },
    ],
  },

  {
    number: 10,
    title: 'Locations & Serviceability',
    scenes: [
      {
        type: 'title',
        vo: "Where are your stores? It's one of the first questions — and one of the easiest to get wrong.",
        props: { kicker: 'Module 10', title: 'Locations & Serviceability', subtitle: 'Know the list. Never deflect vaguely.' },
      },
      {
        type: 'dodont',
        vo: "Never say 'we have stores all across the country' as a vague deflection. If their city isn't on the list, always offer a sample delivery or a video call with an expert.",
        props: {
          heading: 'The golden rule',
          dont: ['“We have stores all across the country”'],
          dos: ['Offer a sample delivery', 'Offer an expert video call'],
        },
      },
      {
        type: 'pills',
        vo: 'Open today: three Delhi stores — Sultanpur, Kirti Nagar, and Saket at Select City Walk. Mohali. Mumbai at Lower Parel. Surat. And internationally, Gainesville, Florida. Coming up: Bangalore, Indiranagar — about a month out. And Hyderabad, Jubilee Hills — under renovation.',
        props: {
          heading: 'The store directory',
          items: [
            { name: 'Delhi — Sultanpur', status: 'Open' },
            { name: 'Delhi — Kirti Nagar', status: 'Open' },
            { name: 'Delhi — Saket', status: 'Open' },
            { name: 'Mohali', status: 'Open' },
            { name: 'Mumbai — Lower Parel', status: 'Open' },
            { name: 'Surat', status: 'Open' },
            { name: 'Florida, USA', status: 'Open' },
            { name: 'Bangalore — Indiranagar', status: 'Soon' },
            { name: 'Hyderabad — Jubilee Hills', status: 'Soon' },
          ],
        },
      },
      {
        type: 'quote',
        vo: "Service is pan-India, with international expansion under way. Asked about projects in a specific city? We've done multiple projects across India — I can check with our team about installations in your city. Precise, honest, helpful.",
        props: { label: 'The approved line', heading: 'Pan-India serviceability', text: 'We have done multiple projects across India. I can check with our team and let you know about installations in your city.' },
      },
      {
        type: 'title',
        vo: 'Know the list, keep it current — store status changes fast. Quiz time.',
        props: { title: 'Next: the quiz', subtitle: 'Pass mark 80%' },
      },
    ],
  },
]
