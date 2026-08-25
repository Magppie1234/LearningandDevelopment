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
  /**
   * An inline React visual, keyed by id and resolved by the Block renderer
   * (see MODULE_VISUALS in screens/BdAcademy.tsx). Kept as an id rather than a
   * component so the content layer stays plain serialisable data.
   */
  | { kind: 'visual'; id: string }

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
  {
    id: 'bd-m11',
    number: 11,
    title: 'Pre-Sales: Calling and Qualification',
    competency: 'Customer Communication',
    summary:
      'Everything a Pre-Sales caller needs to qualify a lead properly, answer what a client asks on a first call, capture a floor plan, and hand over a client Sales can actually work with.',
    blocks: [
      { kind: 'heading', text: 'Start here' },
      { kind: 'paragraph', text: 'What this module is. Everything a Pre-Sales caller needs to qualify a lead properly, answer what a client asks on a first call, capture a floor plan, and hand over a client Sales can actually work with.' },
      { kind: 'paragraph', text: 'Who it is for. Anyone joining the Pre-Sales team, and everyone already in it doing their annual refresher.' },
      { kind: 'paragraph', text: 'Where the answers come from. These are real questions from recorded calls, answered by the company. We know exactly which ones the team has been getting wrong and how often. That data shapes the whole module, and Part 1 is ordered by it rather than by topic.' },
      { kind: 'paragraph', text: 'How long it takes. Around two hours for a new joiner, spread across the first month. Around an hour for the annual refresher.' },
      { kind: 'callout', label: 'By the end of this you should be able to', text: 'Answer the price question completely, including the part most people leave out. List what is included and what is excluded, both lists, without looking. Get a floor plan out of a call that was not going to give you one. Hand over a client whose record tells the whole story without anyone having to ring you.' },

      { kind: 'heading', text: 'Syllabus' },
      { kind: 'visual', id: 'presales-syllabus' },
      { kind: 'paragraph', text: 'Two notes on the order. Part 1 leads with price rather than with the brand, because that is where calls actually break. And Part 3 sits after the answers rather than before them, because the floor plan conversation only works once you can answer the questions that come before it.' },
      { kind: 'heading', text: 'How to use this' },
      { kind: 'list', items: [
        'If you are new. Read Parts 1 to 4 in your first week, before you take a live call. Part 5 tells you what should be happening each week after that. Assessment at the end of month one.',
        'If you are already in the role. Go to Part 6. It sends you back through Part 1 and Part 3, gives you a self-check that includes listening to your own recordings, and tells you what changed this year. Then the assessment.',
        'If you are looking something up between calls. Part 1 for the answer. Part 2 for who it belongs to.',
      ] },

      { kind: 'heading', text: 'What this role actually does' },
      { kind: 'paragraph', text: 'You are the first human being a client ever speaks to at Magppie. Whatever they end up believing about this company, it starts in your first thirty seconds.' },
      { kind: 'paragraph', text: 'The job has three parts, and only three:' },
      { kind: 'list', ordered: true, items: [
        'Work out whether this is a real opportunity',
        'Get the floor plan',
        'Hand over a client who is ready to be sold to',
      ] },
      { kind: 'paragraph', text: 'That is it. Everything else is in service of those three. Two things are worth saying plainly at the start, because both cut against instinct.' },
      { kind: 'callout', label: 'You are not the closer', text: 'When a call is going well and the client is engaged, there is a strong pull to keep going, to answer the deeper questions, to be the one who wins them over. Resist it. A client you over-serve on a first call arrives at Sales with half-formed expectations that somebody else now has to unpick.' },
      { kind: 'callout', label: 'A dropped lead is not a dead lead', text: 'They are on your list for a reason. Someone who went quiet four months ago may have simply been waiting on possession of their flat. The call to a dropped lead is a different call, not a lesser one.' },

      { kind: 'heading', text: 'What we know about these calls' },
      { kind: 'paragraph', text: 'This training exists because of something specific. We reviewed recorded calls and found 46 questions that customers actually asked where the team could not answer cleanly, and every one needed real company knowledge to answer.' },
      { kind: 'list', items: [
        'Price came up in 90 calls. More than a third of the time, the caller did not get a clean answer',
        'What the price includes came up in 45 calls. Nearly half of those went badly. This is the worst-performing question in the business',
        'Which cities we serve came up in 52 calls',
      ] },
      { kind: 'paragraph', text: 'Those three questions alone account for a large share of every call that ended badly. They are all in Part 1. Knowing them cold is most of the job.' },

      { kind: 'heading', text: 'The rule for this role' },
      { kind: 'callout', label: 'The rule', text: 'Answer anything that helps them decide to take the next step. Anything that needs to know their kitchen goes to Sales.' },
      { kind: 'visual', id: 'presales-answer-or-route' },
      { kind: 'paragraph', text: 'That line does a lot of work. Someone asking "what do your kitchens cost" is deciding whether to keep talking to you, and they deserve a real answer. Someone asking "what will mine cost" needs a quotation, and that is not a phone-call answer.' },
      { kind: 'paragraph', text: 'The same discipline the calling bot runs on applies to you: never guess a price, warranty, timeline, location, inclusion, specification or policy. If it is not in the approved answers, it does not get said. Offer the right person instead.' },

      { kind: 'heading', text: 'What clients ask you' },
      { kind: 'paragraph', text: 'Short answers. Say them naturally. Do not embellish.' },
      { kind: 'visual', id: 'presales-price-flow' },
      { kind: 'heading', text: 'Price, which is where most calls start' },
      { kind: 'table', columns: ['They ask', 'You say'], rows: [
        ['What do your kitchens cost?', 'Priced per square foot of cabinet area. For a 100 square foot kitchen, roughly ₹6 lakh for Wellness First up to roughly ₹12 lakh for Wellness Pro. Then, always: 100 square feet means the width and height of all the cabinets added together, not the floor area of the room.'],
        ['What is included in that price?', 'Included: Silverstone cabinets and doors, plus seven accessories — cutlery tray, dish rack, dustbin, detergent holder, corner unit, bottle pull-out, pantry unit. Not included: GST, transportation and handling, installation, countertop, wall cladding, sink, faucet, appliances. We can supply the countertop and wall cladding as part of a complete solution, at additional cost.'],
        ['How is it priced? Per square foot or running foot?', 'Per square foot of cabinet area. We use that method because it is clearer and fairer.'],
        ['Can you give me a quote for my kitchen?', 'Yes. Share your floor plan or kitchen details and our team will prepare an estimate and quotation.'],
        ['Any discount for my interior designer?', 'As a brand policy, our pricing is fixed and the same for everyone. No special designer discounts.'],
        ['Do I have to pay anything before I get a design or quote?', 'No. Nothing before we give you the basic design and quotation. Payment comes in once you decide to proceed, before we take actual site measurements.'],
        ['What are the payment terms?', 'Staggered in three stages: 50% at order booking, 30% when production drawings are finalised, 20% two weeks before dispatch. EMI is available through banks.'],
      ] },
      { kind: 'callout', label: 'The line most people leave out', text: 'The "cabinet area, not floor area" clarification is not optional. Skipping it is why the price question goes wrong so often. A client who thinks you mean floor area has just badly misjudged what their kitchen costs, and will find out later.' },

      { kind: 'heading', text: 'The material' },
      { kind: 'table', columns: ['They ask', 'You say'], rows: [
        ['What kind of stone is it? Granite, marble, quartz?', 'None of those. Our own patented material, Silverstone: a sanitised porcelain stone. Natural minerals fired with silver and copper nano-materials at around 1,260°C. Cabinets, door facias, shelves, drawers, internal fixtures, countertops and wall claddings are all this material.'],
        ['What else is in it? Wood?', 'No wood at all. Silver and copper infused into the material, which is what resists bacteria, fungus and termites. Hardware is industrial-grade steel.'],
        ['How is it made?', 'Natural minerals blended with silver and copper at nano scale, compacted under thousands of tonnes of pressure, sintered at around 1,260°C. One solid, non-porous body. The silver and copper are inside it, not coated on, so they cannot wear off.'],
        ['How long does it last?', '25-year guarantee on the material. Highly scratch and stain resistant, and 100% food-grade.'],
        ['Are the drawers and shelves the same stone?', 'Yes. Cupboards, doors, shelves, drawers and most internal modular components.'],
        ['Are wardrobes stone too?', 'Yes, entirely. About three times heavier than plywood, so more care in manufacturing and installation. Normal to use once installed.'],
      ] },

      { kind: 'heading', text: 'Where we work' },
      { kind: 'table', columns: ['They ask', 'You say'], rows: [
        ['Do you serve my city?', 'Yes. We provide services across cities throughout India. Installation too, across India.'],
        ['Which showrooms are open?', 'Seven experience centres: Delhi, Hyderabad, Bangalore, Mumbai, Surat, Mohali, Coimbatore. Seven more planned in the next 12 months.'],
        ['Have you done projects in my city?', 'Jaipur, Mumbai, Hyderabad, Bengaluru, Guwahati, Jodhpur, Nashik, Surat and all major Indian cities. More than 38,000 kitchens over 21 years.'],
        ['Can I come and see one?', 'Yes, at any of the seven experience centres. Then book it — a booked visit is a much stronger handover than a warm conversation.'],
      ] },

      { kind: 'heading', text: 'The rest' },
      { kind: 'table', columns: ['They ask', 'You say'], rows: [
        ['How does the whole process work?', 'Enquiry, then a conversation with our sales team, then a visit to an experience centre. Designers create the kitchen design. Design finalised, order closed, 50% paid. Site measurements taken and technical drawings prepared, then 30% paid. Kitchen manufactured, remaining 20% paid, then dispatch and installation.'],
        ['How long does installation take?', 'Around a week.'],
        ['Can I get a quote before I have possession of the flat?', 'Yes, absolutely. It lets you plan well in advance. Good question to hear — it usually means they are serious.'],
        ['Do you provide complete fittings?', 'Yes, a complete integrated solution: hardware, accessories, drawers, lighting and other components. Sink, faucet and appliances are not included.'],
        ['What is Sunrooof? Is the ceiling included?', 'Not included in the kitchen price. Sunrooof is Magppie’s sister company: a patented lighting system that creates the impression of natural daylight indoors, fitted on the ceiling like a skylight or a wall like a window.'],
        ['Are you related to Godrej or Reliance?', 'Sunrooof is our sister company, Satvic Movement is a daughter company. No connection to Godrej or Reliance.'],
        ['Do you appoint dealers or franchises?', 'No conventional dealers, distributors or franchises. Our stores are company-owned and run by our own teams. We are open to city-centric joint-venture partnerships.'],
      ] },

      { kind: 'heading', text: 'What you route to Sales' },
      { kind: 'table', columns: ['They ask about', 'Route it'], rows: [
        ['A full charge and package breakdown', 'Quotation conversation'],
        ['Warranty specifics by range', 'Two ranges, two answers'],
        ['Finishes and design options for their layout', 'Depends on range and space'],
        ['Civil work, demolition, plastering', 'We do not do it, and the scope needs explaining properly'],
        ['Retrofitting an existing kitchen', 'Conditional'],
        ['Design, manufacturing or installation dates for them', 'Factory commitment'],
        ['When we start after their civil work is done', 'Site-specific'],
        ['Local service arrangements in their city', 'Regional operations'],
        ['Visiting a customer’s home', 'Needs the homeowner’s permission'],
        ['Weight, density, test certificates in detail', 'Better handled with the material in front of them'],
      ] },
      { kind: 'callout', label: 'The line', text: '"That deserves a proper answer rather than a rough one, so I’ll have the right person come back to you. Before I do, can I get your floor plan so they have something to work with?" Note what that does — the handoff and the floor plan capture happen in the same sentence.' },

      { kind: 'heading', text: 'The floor plan' },
      { kind: 'paragraph', text: 'This is the part of the job that is actually yours, and the part nobody else can do for you. A client handed to Sales without a floor plan is a conversation. A client handed over with one is a project. The difference shows up weeks later.' },
      { kind: 'visual', id: 'presales-floorplan' },

      { kind: 'heading', text: 'The handover' },
      { kind: 'paragraph', text: 'A sales-ready client is not just a warm client.' },
      { kind: 'visual', id: 'presales-sales-ready' },

      { kind: 'heading', text: 'The learning path' },
      { kind: 'heading', text: 'Week 1: Learn the answers and listen' },
      { kind: 'list', items: [
        'Brand and product foundation: what Magppie is, what Silverstone is, what a Wellness Kitchen is',
        'Learn Part 1 properly. Start with price, inclusions and cities, in that order, because that is where the calls actually fail',
        'Zoho: how to log a call, update status, set next action',
        'Listen to at least ten recorded calls. Pick out where the answer went wrong',
        'Sit with a senior team member for a full day of live calls',
      ] },
      { kind: 'heading', text: 'Weeks 2 to 4: Start calling' },
      { kind: 'list', items: [
        'Call structure: opening, qualification, floor plan, next step',
        'Phone and video etiquette',
        'Objection handling at the qualification stage, which is different from the closing stage',
        'Floor plan reading: what a plan tells you and what to ask when it does not',
        'Working dropped leads, which needs a different opening',
        'Response times and call cadence: how quickly a new lead gets called, and how many attempts before it is set aside',
        'Your first live calls, reviewed afterwards with someone senior',
      ] },
      { kind: 'heading', text: 'Month 2' },
      { kind: 'list', items: [
        'The handover protocol, and what sales-ready actually means',
        'Shadow a Sales conversation with a client you handed over. This is the most useful hour in the whole programme, because you finally see what happens to your work',
        'Service standards and how to recover when a call goes badly',
        'Review your own recorded calls against Part 1',
      ] },

      { kind: 'heading', text: 'Annual refresher' },
      { kind: 'paragraph', text: 'For anyone already in the role. Under an hour. Re-read Part 1 in full, and Part 3. Then check yourself honestly:' },
      { kind: 'list', items: [
        'Do you still say the "cabinet area, not floor area" line every time, or have you started assuming they know?',
        'Can you list what is included and what is excluded, both lists, without looking?',
        'Of your last twenty handovers, how many went to Sales with a floor plan attached?',
        'Are you logging calls during the day, or reconstructing them at 6pm?',
        'When did you last listen to a recording of yourself?',
        'Have the cities, the price range or the payment terms changed this year? Confirm before you say any of them again',
      ] },
      { kind: 'callout', label: 'What changed this year', text: 'To be filled in by Learning and Development at each annual release.' },
      { kind: 'paragraph', text: 'Then take the assessment.' },
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

  /* ── bd-m11 · Pre-Sales — Calling and Qualification (15) ──────────────
     Verbatim from section 4A of the Pre-Sales build brief. Single correct
     answer each; graded like every other BD module at BD_PASS_THRESHOLD, so
     the first passing attempt is what gets certified. */
  { id: 'bd-q31', moduleId: 'bd-m11', competency: 'Pricing Knowledge', question: 'How is a Magppie kitchen priced?', options: ['A fixed price per kitchen', 'Per square foot of cabinet area', 'Per running foot', 'Per square foot of floor area'], correctIndex: 1 },
  { id: 'bd-q32', moduleId: 'bd-m11', competency: 'Pricing Knowledge', question: 'What is the approved price range for a 100 sq ft kitchen?', options: ['₹3–6 lakh', '₹6 lakh (Wellness First) to ₹12 lakh (Wellness Pro)', '₹10–20 lakh', '₹12–25 lakh'], correctIndex: 1 },
  { id: 'bd-q33', moduleId: 'bd-m11', competency: 'Pricing Knowledge', question: 'What does "100 square feet" mean — the line you must never skip?', options: ['The floor area of the room', 'The width and height of all cabinets added together', 'The total wall area', 'The countertop area'], correctIndex: 1 },
  { id: 'bd-q34', moduleId: 'bd-m11', competency: 'Pricing Knowledge', question: 'Which of these IS included in the quoted price?', options: ['GST and installation', 'Countertop and wall cladding', 'Silverstone cabinets and doors plus seven accessories', 'Sink, faucet and appliances'], correctIndex: 2 },
  { id: 'bd-q35', moduleId: 'bd-m11', competency: 'Pricing Knowledge', question: 'Which of these is NOT included in the quoted price?', options: ['Silverstone cabinets and doors', 'The seven listed accessories', 'Installation, countertop, sink and appliances', 'Door facias'], correctIndex: 2 },
  { id: 'bd-q36', moduleId: 'bd-m11', competency: 'Pricing Knowledge', question: 'What are the three payment stages?', options: ['50% booking / 40% before dispatch / 10% after installation', '50% at order booking / 30% when production drawings are finalised / 20% two weeks before dispatch', '30% / 30% / 40%', '100% at booking'], correctIndex: 1 },
  { id: 'bd-q37', moduleId: 'bd-m11', competency: 'Objection Handling', question: 'A client’s interior designer asks for a discount. The approved answer:', options: ['Offer a small designer discount', 'Pricing is fixed and the same for everyone; no designer discount', 'Route to Sales for a custom rate', 'Offer a discount on the countertop'], correctIndex: 1 },
  { id: 'bd-q38', moduleId: 'bd-m11', competency: 'Pricing Knowledge', question: 'Does the client pay anything before getting a design or quotation?', options: ['Yes, a booking fee', 'No — nothing before the basic design and quotation; payment comes once they decide to proceed, before site measurement', 'Yes, 10% upfront', 'Yes, a site-measurement fee'], correctIndex: 1 },
  { id: 'bd-q39', moduleId: 'bd-m11', competency: 'Product Knowledge', question: 'In one line, what is Silverstone?', options: ['A granite-quartz composite', 'A laminated engineered wood', 'A patented sanitised porcelain stone — natural minerals fired with silver and copper nano-materials at ~1,260°C', 'A marble with an anti-bacterial coating'], correctIndex: 2 },
  { id: 'bd-q40', moduleId: 'bd-m11', competency: 'Product Knowledge', question: 'What is the guarantee on the material itself?', options: ['5 years', '10 years', '25 years', 'Lifetime'], correctIndex: 2 },
  { id: 'bd-q41', moduleId: 'bd-m11', competency: 'Trust & Credibility', question: 'Which list names the seven open experience centres?', options: ['Delhi, Hyderabad, Bangalore, Mumbai, Surat, Mohali, Coimbatore', 'Delhi, Mumbai, Chennai, Kolkata, Pune, Jaipur, Kochi', 'Only Delhi and Mumbai', 'Delhi, Noida, Gurgaon, Mumbai, Pune, Surat, Ahmedabad'], correctIndex: 0 },
  { id: 'bd-q42', moduleId: 'bd-m11', competency: 'Customer Communication', question: 'The rule for the Pre-Sales role — where does your answer stop?', options: ['Answer everything, you’re the expert', 'Answer anything that helps them decide the next step; anything that needs their specific kitchen goes to Sales', 'Answer nothing about price', 'Route every question to Sales'], correctIndex: 1 },
  { id: 'bd-q43', moduleId: 'bd-m11', competency: 'Customer Communication', question: 'What must be true before a lead is "sales-ready" for handover?', options: ['The client sounded warm on the call', 'Floor plan/dimensions captured, requirement + timeline understood, budget set honestly, next step booked, and everything logged in Zoho', 'They’ve paid a deposit', 'They’ve visited an experience centre'], correctIndex: 1 },
  { id: 'bd-q44', moduleId: 'bd-m11', competency: 'Customer Communication', question: 'A client says they’ll send the floor plan "later." Best move inside the call?', options: ['End with "send it when you can"', 'Ask what they have right now — a builder’s PDF, a photo, even rough measurements', 'Tell them no quote without it', 'Book a site visit instead'], correctIndex: 1 },
  { id: 'bd-q45', moduleId: 'bd-m11', competency: 'Customer Communication', question: 'A caller asks something you have no approved answer for. What do you do?', options: ['Give your best guess', 'Never guess — offer to have the right person confirm and come back', 'Make up a safe-sounding number', 'End the call'], correctIndex: 1 },
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
