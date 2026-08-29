/**
 * MAGPPIE Dress Code Policy — L&D New Joiner Orientation Series.
 *
 * Rebuilt 29 Aug 2026 from the UPDATED deck. This is not a patch of the
 * previous version: wording changed in several places (e.g. "well-fitted &
 * pressed" → "well-fitted and ironed"; men's and women's client-meeting lists
 * were both revised; "deep necklines" now also covers off-shoulders) and a few
 * points are new ("Blazers as appropriate", linen pants, "big checks").
 *
 * This is an official HR policy, so the wording here is the deck's, not a
 * paraphrase. The interface may reorganise it; nothing may reword it. If HR
 * revises the deck again, re-extract rather than editing prose here, and
 * regenerate the PDF with `npm run build:dress-code-pdf`.
 */

/** Icon key, resolved to a lucide component by the renderer. */
export type PolicyIcon = 'badge' | 'shirt' | 'ruler' | 'users' | 'scissors' | 'hand' | 'droplet' | 'wind'

export interface PolicyPoint {
  label?: string
  text: string
  icon?: PolicyIcon
}

export interface PolicyColumn {
  heading: string
  /** Shown under the heading, e.g. who the column applies to. */
  note?: string
  items: string[]
}

/** One Do paired with the Don't that sits opposite it (section 6). */
export interface DoDontPair {
  doItem: string
  dontItem: string
}

export interface ComplianceStage {
  label: string
  text: string
}

export interface PolicySection {
  id: string
  eyebrow: string
  title: string
  intro?: string
  /** Set apart and typeset larger than body copy. */
  pullQuote?: string
  points?: PolicyPoint[]
  /** Renders `points` as icon cards rather than a list. */
  pointsAsCards?: boolean
  columns?: PolicyColumn[]
  pairs?: DoDontPair[]
  stages?: ComplianceStage[]
  /** Highlighted line under the main content. */
  highlight?: string
  /** Quieter closing note. */
  footnote?: string
}

/**
 * The generated A4 PDF — built from THIS module by
 * scripts/build-dress-code-pdf.ts, so the download can never drift from the
 * page.
 *
 * NOTE: the original .pptx is deliberately NOT linked any more. The copy below
 * comes from the UPDATED deck, and the .pptx still in public/policies/ is the
 * superseded one — offering it beside current policy would let a new joiner
 * download outdated rules. Re-add a deck link only when the new .pptx is
 * supplied.
 */
export const DRESS_CODE_PDF = '/policies/Dress_Code_Policy_MAGPPIE.pdf'

export const DRESS_CODE_SECTIONS: PolicySection[] = [
  {
    id: 'philosophy',
    eyebrow: 'Our philosophy',
    title: 'Why the dress code matters at MAGPPIE',
    intro:
      'At MAGPPIE, every interaction is a reflection of who we are — a luxury brand built on precision, care, and comfort. Our dress code isn’t about restricting who you are; it’s simply an extension of the same elegance and comfort we promise every client, worn by the people who bring it to life.',
    pullQuote:
      'Culture isn’t just what we say — it’s what we choose to wear, every single day.',
    points: [
      { text: 'Builds trust with every client interaction' },
      { text: 'Reflects your own professionalism and confidence' },
      { text: 'Protects the reputation you and MAGPPIE share' },
    ],
  },
  {
    id: 'principles',
    eyebrow: 'General principles',
    title: 'For every team member',
    pointsAsCards: true,
    points: [
      {
        icon: 'badge',
        label: 'Professional and presentable',
        text: 'Attire should be professional and presentable at all times.',
      },
      {
        icon: 'shirt',
        label: 'Neat and modest',
        text: 'Dress in a manner that is neat, modest, and appropriate for a professional workplace.',
      },
      {
        icon: 'ruler',
        label: 'Well-fitted and ironed',
        text: 'Clean, well-fitted attire that looks put together.',
      },
      {
        icon: 'users',
        label: 'Respectful and comfortable',
        text: 'Maintains a respectful, comfortable environment for all colleagues.',
      },
    ],
    highlight: 'When in doubt: choose the more professional, understated option.',
  },
  {
    id: 'men',
    eyebrow: 'Guidelines for men',
    title: 'Everyday attire & client meetings',
    columns: [
      {
        heading: 'Everyday attire',
        items: [
          'Collared shirts, long or short sleeved, tucked into trousers, linen pants or chinos',
          'Smart casuals — polo T-shirts with smart jeans, for non-client-dealing members only',
          'Clean, well-fitted clothing that looks put together',
          'Closed shoes or neat sneakers',
          'Blazers as appropriate',
        ],
      },
      {
        heading: 'Client meetings',
        note: 'For the Sales team and client-facing roles',
        items: [
          'Collared shirts in solid colours or subtle textures, tucked in. Avoid loud prints and big checks',
          'Formal trousers, linen pants or well-fitted chinos in neutral tones — navy, charcoal, beige, black',
          'Leather shoes or loafers, well maintained, with a matching belt',
          'Trimmed hair and beard, minimal accessories',
        ],
      },
    ],
    footnote:
      'Neat hair and well-maintained facial hair — attention to detail makes all the difference.',
  },
  {
    id: 'women',
    eyebrow: 'Guidelines for women',
    title: 'Everyday attire & client meetings',
    columns: [
      {
        heading: 'Everyday attire',
        items: [
          'Formal tops, shirts, tunics or formal dresses',
          'Ethnic wear is warmly welcomed — saris, salwar kameez and similar styles are a beautiful part of our workplace',
        ],
      },
      {
        heading: 'Client meetings',
        note: 'For the Sales team and client-facing roles',
        items: [
          'Formal shirts, kurtas with trousers, or well-fitted formal dresses longer than knee length, in sober colours',
          'Saree or salwar-kameez as an optional traditional-wear choice',
          'Blazers as appropriate',
          'Closed-toe flats or heels — practical for walking or active sites',
          'Minimal jewellery and makeup, hair neatly tied back',
        ],
      },
    ],
    footnote:
      'Neat and well-maintained hair, with minimal or no makeup and accessories, as per personal choice, and comfortable footwear.',
  },
  {
    id: 'grooming',
    eyebrow: 'Grooming standards',
    title: 'Presenting yourself with polish',
    pointsAsCards: true,
    points: [
      {
        icon: 'scissors',
        label: 'Hair',
        text: 'Neat, well-maintained hair, styled appropriately for a professional setting.',
      },
      {
        icon: 'hand',
        label: 'Nails',
        text: 'Trimmed, clean nails. If nail polish is worn, keep it neat and chip-free.',
      },
      {
        icon: 'droplet',
        label: 'Personal hygiene',
        text: 'Maintain good personal hygiene, including managing body odour through daily hygiene and deodorant use.',
      },
      {
        icon: 'wind',
        label: 'Fragrance and breath',
        text: 'Keep breath fresh, use mild fragrances, avoid overpowering perfumes or deodorants.',
      },
    ],
    footnote:
      'Grooming reflects professionalism. Kept simple and gender-neutral, it protects the dignity of our brand and of everyone who represents it.',
  },
  {
    id: 'dos-donts',
    eyebrow: 'Quick reference',
    title: 'Do’s and Don’ts',
    pairs: [
      {
        doItem: 'Clean, well-fitted, ironed clothing',
        dontItem: 'Excessively short or cropped clothing, ripped jeans',
      },
      {
        doItem: 'Collared shirts, formal tops or professional dresses',
        dontItem: 'Garments with deep necklines, off-shoulders',
      },
      {
        doItem: 'Ethnic wear — sarees, salwar kameez, co-ord sets',
        dontItem: 'Overly casual, unkempt or wrinkled attire',
      },
      {
        doItem: 'Business formal for client meetings',
        dontItem: 'Polo T-shirts and jeans for client-facing roles',
      },
      {
        doItem: 'Solid colours or subtle patterns',
        dontItem: 'Loud prints, oversized graphics, big visible logos',
      },
      {
        doItem: 'Polished, role-appropriate footwear',
        dontItem: 'Bulky, overly casual or distracting footwear',
      },
      {
        doItem: 'Neat hair and well-maintained grooming',
        dontItem: 'Casual or lounge attire on video calls while working remotely',
      },
    ],
  },
  {
    id: 'compliance',
    eyebrow: 'Compliance and corrective measures',
    title: 'What’s expected, and what happens if something’s off',
    points: [
      {
        text: 'This dress code applies to every team member, every working day. Adherence reflects your professionalism and your respect for colleagues and clients, and it upholds the image our guests trust MAGPPIE for.',
      },
      {
        text: 'Failure to adhere may result in corrective action — so if you’re ever unsure what’s appropriate, ask before you dress, not after.',
      },
      {
        text: 'In a grey area, discuss with your manager or HR. We’d always rather clarify upfront than correct after the fact.',
      },
    ],
    stages: [
      {
        label: 'Verbal feedback',
        text: 'If something doesn’t align with our guidelines, HR will offer a quick, private conversation to help you course-correct. It’s a simple, respectful heads-up, not a formal mark against you.',
      },
      {
        label: 'Written feedback',
        text: 'If the same concern comes up again, HR will share written feedback outlining the guideline and next steps. This may include a brief request to go home, change, and return — simply so you can meet clients at your best, never as a penalty.',
      },
    ],
    footnote:
      'This process exists to protect the trust our clients place in MAGPPIE, not to penalise anyone. Our goal is always to guide with care, so every team member feels confident representing our brand.',
  },
]

/** The closing self-check. Not scored, not stored, gates nothing. */
export const DRESS_CODE_SELF_CHECK = [
  'Is my outfit clean and fitted?',
  'Is it appropriate for my role today?',
  'Am I representing MAGPPIE confidently?',
]
