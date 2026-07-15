/**
 * Magppie Immersion Programme — Training & Onboarding tracker data.
 * Source: the team's Google Sheet "Immersion Programme" (received 2026-07-17),
 * condensed faithfully — 14 modules, 4 phases, ~30 working days, for new
 * joiners & existing employees across Magppie Living & SUNROOOF.
 *
 * [CONFIRM TERMINOLOGY]: this sheet mandates "sintered stone" / "nanoparticles"
 * and forbids "Silverstone" / "nanotechnology" in all communications — which
 * conflicts with the AI Bot Master Training Document ("SilverStone" is the
 * product name) that the Sales Academy is built on. Surfaced in the UI; not
 * resolved here.
 */

export interface ImmersionModule {
  id: string // '1.1' … '4.3'
  phase: 1 | 2 | 3 | 4
  name: string
  resource: string
  department: string
  duration: string
  assessment: string
  description: string
  objective: string
  activity: string
  submission: string
  evaluation: string
  notes?: string
}

export const IMMERSION_PHASES: Record<number, { title: string; bg: string; fg: string; blurb: string }> = {
  1: { title: 'Foundational Understanding', bg: '#EAF4FB', fg: '#1A6FA8', blurb: 'Virtual Buying Playlist · Website · FAQ' },
  2: { title: 'Product Deep Dive', bg: '#EEF8F0', fg: '#1E7C45', blurb: '4 catalogues: Kitchen · Wardrobe · Storage · Lifestyle' },
  3: { title: 'Brand Immersion', bg: '#FDF6EC', fg: '#B5651D', blurb: "Founder's Journey · Brand Story · Bigger Home · Wellness" },
  4: { title: 'Design & Functional Excellence', bg: '#F3EEFB', fg: '#6A3D9A', blurb: 'Design Fundamentals · Materials · Customer Consultation' },
}

export const IMMERSION_MODULES: ImmersionModule[] = [
  {
    id: '1.1',
    phase: 1,
    name: 'Virtual Buying Playlist',
    resource: 'Video playlist',
    department: 'Training & L&D / HR',
    duration: '3 days (~4h viewing + 2h notes)',
    assessment: 'Written assessment (70% pass, one retake)',
    description:
      'Curated video series simulating a complete Magppie kitchen buying journey — first inquiry to final handover: product range, pricing tiers, design consultation flow, customer experience touchpoints.',
    objective: 'Understand the end-to-end customer buying journey and articulate the Magppie purchase process confidently.',
    activity:
      'Watch all videos sequentially. Structured notes under 4 headings — Product, Process, Price, Experience — and highlight 3 moments that define Magppie’s premium positioning.',
    submission: 'Assessment link (shared by L&D on Day 1)',
    evaluation: 'Minimum 70% on assessment; notes must cover all 4 headings; accuracy of process understanding.',
    notes: 'Retake allowed once.',
  },
  {
    id: '1.2',
    phase: 1,
    name: 'Magppie Website Exploration',
    resource: 'magppie.com',
    department: 'Marketing / Digital',
    duration: '2 days (~3h exploration + 2h mapping)',
    assessment: 'Mind map (visual)',
    description:
      'Deep-dive into magppie.com — product categories, design stories, lifestyle photography, blog, client testimonials, studio locator, digital inquiry flow.',
    objective: 'Navigate and articulate the site’s key sections; identify how the brand communicates luxury, wellness and design digitally.',
    activity:
      'Explore the full website independently, then create a mind map: Products | Brand Story | Customer Journey | Design Language | Differentiators (MindMeister, Canva, or hand-drawn).',
    submission: 'Exported PDF or image via email / drive folder',
    evaluation: 'Minimum 5 branches with sub-nodes; depth of observation, brand-language accuracy, visual clarity.',
    notes: 'Mind-map template on the shared drive; personal colour-coding encouraged.',
  },
  {
    id: '1.3',
    phase: 1,
    name: 'Magppie FAQ Mastery',
    resource: 'FAQ document',
    department: 'Sales & Customer Experience',
    duration: '2 days (~2h reading + 1h teaching task)',
    assessment: 'Verbal demonstration + understanding check',
    description:
      'Comprehensive FAQ: product queries, installation, warranty, customisation, material durability, pricing, after-sales support, common objections.',
    objective: 'Answer the top 30 customer FAQs confidently without reference material — understanding the reasoning, not just the text.',
    activity:
      'Read the FAQ twice; self-test on the second pass. Then a teaching task: explain 10 randomly selected FAQs verbally to a buddy / manager as if to a real customer.',
    submission: 'Buddy sign-off sheet (Excellent / Satisfactory / Needs Revision per FAQ)',
    evaluation: '“Satisfactory” or above on at least 9 of 10; tone, accuracy, customer-friendly language.',
    notes: 'Buddy assigned by the manager; use only the latest FAQ version.',
  },
  {
    id: '2.1',
    phase: 2,
    name: 'Catalogue Study — Kitchen',
    resource: 'Kitchen catalogue',
    department: 'Product / Design',
    duration: '3 days (~3h study + 2h cheat sheet + 1h prep)',
    assessment: 'Quiz (75% pass) + showcase',
    description:
      'Full range of modular kitchen systems, material options (sintered stone, laminates, lacquers), handle styles, colour palettes, finish combinations.',
    objective: 'Identify and describe all kitchen product lines, material specs and design configurations in the current catalogue.',
    activity:
      'Create a 1-page Product Cheat Sheet: all kitchen lines with key specs, price tier and ideal customer profile. Present to manager.',
    submission: 'Cheat sheet (PDF) + 10-min verbal presentation',
    evaluation: 'Quiz ≥75%; cheat sheet covers all lines accurately; presentation handles 2–3 follow-up questions.',
  },
  {
    id: '2.2',
    phase: 2,
    name: 'Catalogue Study — Wardrobe',
    resource: 'Wardrobe catalogue',
    department: 'Product / Design',
    duration: '2 days (~2h study + 1.5h matrix)',
    assessment: 'Quiz (75% pass) + matrix submission',
    description:
      'Wardrobe systems, internal fittings, sliding vs hinged doors, materials and finishes, locking mechanisms, space-optimisation configurations.',
    objective: 'Explain standard vs premium configurations and match wardrobe solutions to room sizes and customer needs.',
    activity:
      'Create a Comparison Matrix: standard vs premium across 6 parameters — material, fittings, price range, lead time, customisation level, best use case.',
    submission: 'Matrix (PDF / Excel) + quiz via Google Form',
    evaluation: 'Quiz ≥75%; matrix accurate, well-formatted, all 6 parameters. Assessed by Product Team lead.',
  },
  {
    id: '2.3',
    phase: 2,
    name: 'Catalogue Study — Storage & Accessories',
    resource: 'Storage & accessories catalogue',
    department: 'Product / Sales',
    duration: '2 days (~2h study + 1.5h scenarios)',
    assessment: 'Scenario-based assessment',
    description:
      'Smart storage solutions, pull-out units, organisers, handles, knobs and lifestyle accessories complementing the kitchen and wardrobe ecosystems.',
    objective: 'Know the full accessories range, functional benefits, upsell potential, and integration into a complete Magppie solution.',
    activity:
      'Customer Upsell Scenario: for 3 fictional customer briefs, recommend the ideal storage/accessory add-ons with written justification.',
    submission: 'Written scenario responses (PDF / Word) to manager',
    evaluation: 'Each recommendation: product name, functional rationale, estimated value addition. Product knowledge + upsell thinking.',
  },
  {
    id: '2.4',
    phase: 2,
    name: 'Catalogue Study — Lifestyle & Brand',
    resource: 'Lifestyle catalogue',
    department: 'Marketing / Brand',
    duration: '2 days (~1.5h study + 1.5h writing + 1h prep)',
    assessment: 'Written brief + image showcase',
    description:
      'Curated lifestyle imagery, aspirational home environments, material storytelling — the visual language positioning Magppie as a premium wellness-led brand.',
    objective: 'Describe the Magppie aesthetic to a customer in clear, evocative language; understand visual storytelling of brand values.',
    activity:
      'Write a 200-word Brand Aesthetic Brief (how Magppie looks, feels, communicates), then showcase 3 favourite catalogue images to the team.',
    submission: 'Brief (PDF) + 5-min team showcase',
    evaluation: 'Language quality, brand accuracy, originality; communication ability. No “right answer” — judgment and insight.',
    notes: 'All 4 catalogue modules form the product assessment block — mandatory before Phase 3.',
  },
  {
    id: '3.1',
    phase: 3,
    name: "Founder's Journey",
    resource: 'Video / document / session',
    department: 'Leadership / HR',
    duration: '1 day (~1.5h content + 1h writing)',
    assessment: 'Reflective writing',
    description:
      'The origin story — the founder’s vision, the problem, early challenges, pivotal decisions, and the values that became the company’s foundation.',
    objective: 'Understand the “why” behind Magppie; tell the Founder’s Journey as a compelling narrative connected to present-day purpose.',
    activity:
      'Write a 1-Page Story Summary in your own words — Origin, Challenge, Vision, and What It Means for Your Role.',
    submission: '1-page summary (PDF / Word) to manager',
    evaluation: 'Authenticity, comprehension, connection of the founder’s vision to the learner’s own role.',
    notes: 'Schedule a live founder session during this module if available.',
  },
  {
    id: '3.2',
    phase: 3,
    name: 'Brand Story',
    resource: 'Document / video / workshop',
    department: 'Marketing / Brand',
    duration: '2 days (~2h content + 2h writing + peer review)',
    assessment: 'Brand voice exercise + peer review',
    description:
      'The complete brand narrative — core values, brand promise, tone of voice, visual identity principles, premium positioning, and how every touchpoint communicates the brand.',
    objective: 'Articulate Magppie’s story, values and positioning consistently across design, language and customer experience.',
    activity:
      'Brand Voice Exercise: rewrite 3 generic product descriptions in authentic Magppie language (tone, values, aspiration). Peer-review with a buddy first.',
    submission: '3 rewritten descriptions (PDF) + buddy peer-review form',
    evaluation: 'Correct tone, brand values, premium positioning — evaluated by Marketing; buddy feedback factored in.',
  },
  {
    id: '3.3',
    phase: 3,
    name: 'Bigger Home Concept',
    resource: 'Document / video / presentation',
    department: 'Sales / Marketing',
    duration: '1.5 days (~1.5h content + 1h prep + recording)',
    assessment: 'Video pitch simulation',
    description:
      'The “Bigger Home” philosophy — intelligent space planning, smart storage and the right materials make any home feel larger, freer, more liveable.',
    objective: 'Explain Bigger Home to a customer in a relatable, inspiring way; identify products that embody the philosophy.',
    activity:
      'Customer Pitch Simulation: write and record a 3-minute pitch explaining Bigger Home to a first-time apartment buyer (phone camera fine).',
    submission: 'Video recording (MP4 / link) to manager',
    evaluation: 'Clarity, concept language, product integration, natural delivery — minimum 3/5 on each rubric point.',
    notes: 'Rubric shared in advance; written feedback within 2 working days.',
  },
  {
    id: '3.4',
    phase: 3,
    name: 'Seeds of Wellness Philosophy',
    resource: 'Document / video / discussion',
    department: 'Brand / Product',
    duration: '1.5 days (~1.5h content + 1h prep + role-play)',
    assessment: 'Role-play + reflection',
    description:
      'The wellness-led design philosophy — material choices (sintered stone, nanoparticle surfaces, hygienic finishes), spatial design and UX principles for healthier home environments.',
    objective: 'Explain Seeds of Wellness, connect it to product features, and use wellness as a differentiator in conversations.',
    activity:
      'Wellness Conversation role-play: “How is Magppie different from other premium kitchen brands?” — answer weaving the wellness narrative with real product examples.',
    submission: 'Live role-play (manager sign-off) + 150-word reflection',
    evaluation: 'Natural integration of the wellness narrative, product accuracy, customer-friendly language; reflection shows personal connection.',
    notes:
      'Terminology per this sheet: use “sintered stone” and “nanoparticles / at a molecular level”; avoid “nanotechnology” / “Silverstone”. [CONFIRM TERMINOLOGY — conflicts with the AI Bot doc’s “SilverStone”.]',
  },
  {
    id: '4.1',
    phase: 4,
    name: 'Design Training — Fundamentals',
    resource: 'Workshop / presentation / video',
    department: 'Design / L&D',
    duration: '2 days (~3h training + 2h review task)',
    assessment: 'Design review task',
    description:
      'Core design principles for kitchen and living spaces — space planning, ergonomics, the kitchen triangle, zonal planning, light and material interplay.',
    objective: 'Apply space-planning principles to evaluate a kitchen layout; identify design errors and improvements in floor plans.',
    activity:
      'Layout Review Task: analyse 2 provided kitchen floor plans — mark design issues and suggest Magppie-specific improvements on the structured template.',
    submission: 'Annotated floor plans (PDF / image) + feedback form',
    evaluation: 'Minimum 3 valid design issues per plan with product-relevant improvements. Evaluated by Design Team lead.',
  },
  {
    id: '4.2',
    phase: 4,
    name: 'Design Training — Materials & Finishes',
    resource: 'Workshop / showroom session',
    department: 'Design',
    duration: '2 days (~2h workshop + 2h challenge)',
    assessment: 'Material match challenge',
    description:
      'The material palette — sintered stone properties, finishes (matte, gloss, textured), colour families, durability benchmarks, maintenance guidelines.',
    objective: 'Identify all current materials and finishes by sight and name; explain sintered-stone benefits simply and confidently.',
    activity:
      'Material Match Challenge: for 5 customer mood boards, recommend the ideal material + finish combination with written rationale.',
    submission: '5 written recommendations (PDF / form) to Design Team',
    evaluation: 'Exact material/finish named, mood-board cues referenced, 1-line durability/care note. 4 of 5 must be approved.',
    notes: 'Physical sample kit should be available — coordinate with the showroom team.',
  },
  {
    id: '4.3',
    phase: 4,
    name: 'Design Training — Customer Consultation',
    resource: 'Workshop / role-play / live shadowing',
    department: 'Design / Sales',
    duration: '3 days (1 shadowing + 1 prep + mock session)',
    assessment: 'Mock consultation (end-to-end)',
    description:
      'The design consultation process — needs assessment, lifestyle and aesthetic preferences, translating a brief into recommendations, closing professionally.',
    objective: 'Conduct a structured consultation resulting in a clear recommendation aligned to the customer’s brief and budget.',
    activity:
      'Shadow one live consultation, then run a full Mock Consultation with the manager as customer: Needs Assessment → Design Brief → Product Recommendation → Next Steps.',
    submission: 'Live mock session; assessor 5-point rubric; sign-off required',
    evaluation: 'Needs assessment | product accuracy | confidence | empathy | recommendation clarity — 3/5+ on all parameters.',
    notes: 'Capstone — completion marks readiness for live customers. Certificate of Completion issued after sign-off.',
  },
]

export const IMMERSION_RULES = [
  'Modules must be completed in phase sequence (Phase 1 → 2 → 3 → 4).',
  'Each module requires a Reviewer Sign-off before the next phase begins.',
  'Assessment retakes are allowed once unless otherwise noted.',
  'Certificate of Completion is issued after Module 4.3 sign-off.',
  'Existing employees may complete Phases 1–2 as an accelerated refresher.',
]

export type ImmersionStatus = 'not_started' | 'in_progress' | 'completed'
