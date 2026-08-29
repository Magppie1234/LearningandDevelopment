/**
 * MAGPPIE Dress Code Policy — content lifted verbatim from
 * public/policies/Dress_Code_Policy_MAGPPIE.pptx (11 slides, L&D New Joiner
 * Orientation Series).
 *
 * This is an official HR policy, so the wording is the deck's, not a
 * paraphrase. Where the deck's slide layout put a label and its body in
 * separate text runs they are joined here, and the two "Grooming tips" asides
 * are kept with the section they sat beside — no meaning is added, removed or
 * softened. If HR revises the deck, re-extract rather than editing prose here.
 */

export interface PolicyPoint {
  label?: string
  text: string
}

export interface PolicySection {
  id: string
  /** Small caps eyebrow, as on the slide. */
  eyebrow?: string
  title: string
  intro?: string
  quote?: string
  points?: PolicyPoint[]
  /** Two-column groups, used by Men / Women / Do's & Don'ts. */
  columns?: { heading: string; items: string[] }[]
  footnote?: string
}

export const DRESS_CODE_DECK = '/policies/Dress_Code_Policy_MAGPPIE.pptx'

export const DRESS_CODE_SECTIONS: PolicySection[] = [
  {
    id: 'philosophy',
    eyebrow: 'Our philosophy',
    title: 'Why the dress code matters at MAGPPIE',
    quote:
      'Our workplace environment should reflect professionalism, mutual respect, and comfort for everyone.',
    intro:
      'At MAGPPIE, every interaction is a reflection of who we are — a luxury brand built on precision, care, and comfort. Our dress code isn’t about restricting who you are; it’s simply an extension of the same elegance and comfort we promise every client, worn by the people who bring it to life.',
    points: [
      { label: 'Why it matters', text: 'Builds trust with every client interaction' },
      { text: 'Reflects your own professionalism and confidence' },
      { text: 'Protects the reputation you and MAGPPIE share' },
    ],
    footnote:
      'Culture isn’t just what we say — it’s what we choose to wear, every single day.',
  },
  {
    id: 'principles',
    eyebrow: 'General principles',
    title: 'For every team member',
    points: [
      { label: 'Professional & presentable', text: 'Attire should be professional and presentable at all times.' },
      { label: 'Neat & modest', text: 'Dress in a manner that is neat, modest, and appropriate for a professional workplace.' },
      { label: 'Well-fitted & pressed', text: 'Clean, well-fitted attire that’s put together.' },
      { label: 'Respectful & comfortable', text: 'Maintains a respectful, comfortable environment for all colleagues.' },
    ],
    footnote:
      'When in doubt: choose the more professional, understated option. It’s easy to remember, and guides judgment gently.',
  },
  {
    id: 'men',
    eyebrow: 'Guidelines for men',
    title: 'Everyday attire & client meetings',
    columns: [
      {
        heading: 'Everyday attire',
        items: [
          'Collared shirts (long or short sleeved), tucked into trousers, pants, or chinos',
          'Smart casuals — Polo T-shirts with smart jeans (for non-client-dealing members only)',
          'Clean, well-fitted clothing that looks put together',
          'Closed shoes or neat sneakers',
        ],
      },
      {
        heading: 'Client meetings (Sales team & client-facing roles)',
        items: [
          'Blazers or suits, with ties as appropriate',
          'Collared shirts in solid colours or subtle textures (avoid loud prints), tucked in',
          'Formal trousers or well-fitted chinos in neutral tones — navy, charcoal, beige, black',
          'Leather shoes or loafers, well-maintained, with a matching belt',
          'Trimmed hair/beard, minimal accessories',
        ],
      },
    ],
    footnote:
      'Grooming tip: neat hair and well-maintained facial hair — attention to detail makes all the difference.',
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
          'Ethnic wear is warmly welcomed — saris, salwar kameez, and similar styles are a beautiful part of our workplace',
        ],
      },
      {
        heading: 'Client meetings (Sales team & client-facing roles)',
        items: [
          'Blazers or suits, with ties as appropriate',
          'Blouses or formal shirts, kurtas with trousers, or well-fitted formal dresses (knee-length or longer), in sober colours',
          'Saree or salwar-kameez as an optional traditional-wear choice, if it fits your brand culture',
          'Closed-toe flats or low heels — practical for walking client homes or active sites',
          'Minimal jewellery and makeup, hair neatly tied back',
        ],
      },
    ],
    footnote:
      'Grooming tip: neat and well-maintained hair, with minimal or no makeup/accessories, as per personal choice, and comfortable footwear.',
  },
  {
    id: 'grooming',
    eyebrow: 'Grooming standards',
    title: 'Presenting yourself with polish',
    points: [
      { label: 'Hair', text: 'Neat, well-maintained hair, styled appropriately for a professional setting.' },
      { label: 'Nails', text: 'Trimmed, clean nails. If nail polish is worn, keep it neat and chip-free.' },
      { label: 'Personal hygiene', text: 'Maintain good personal hygiene, including managing body odour through daily hygiene and deodorant use.' },
      { label: 'Fragrance & breath', text: 'Keep breath fresh; use mild fragrances and avoid overpowering perfumes or deodorants.' },
    ],
    footnote:
      'Grooming reflects professionalism: kept simple and gender-neutral, it protects the dignity of our brand and of everyone who represents it.',
  },
  {
    id: 'dos-donts',
    eyebrow: 'Quick reference',
    title: 'Do’s and Don’ts',
    columns: [
      {
        heading: 'Do',
        items: [
          'Clean, well-fitted, ironed clothing',
          'Collared shirts, formal tops or professional dresses',
          'Ethnic wear — sarees, salwar kameez, co-ord sets',
          'Business formal for client meetings',
          'Solid colours or subtle patterns',
          'Polished, role-appropriate footwear',
          'Neat hair and well-maintained grooming',
        ],
      },
      {
        heading: 'Don’t',
        items: [
          'Excessively short/cropped clothing, ripped jeans',
          'Garments with very deep necklines',
          'Overly casual, unkempt or wrinkled attire',
          'Polo T-shirts + jeans for client-facing roles',
          'Loud prints, oversized graphics, big visible logos',
          'Bulky, overly casual or distracting footwear',
          'Casual/lounge attire on video calls while working remotely',
        ],
      },
    ],
  },
  {
    id: 'compliance',
    eyebrow: 'Compliance & accountability',
    title: 'What’s expected, and what happens if something’s off',
    intro:
      'This dress code applies to every team member, every working day. Adherence reflects your professionalism and your respect for colleagues and clients — and it upholds the image our guests trust MAGPPIE for.',
    points: [
      {
        text: 'Failure to adhere to the dress code may result in corrective action — so if you’re ever unsure what’s appropriate, ask before you dress, not after.',
      },
      {
        text: 'In case of a grey area, discuss with your manager or HR. We’d always rather clarify upfront than correct after the fact.',
      },
      {
        label: 'Stage 1 — Verbal feedback',
        text: 'If something doesn’t align with our guidelines, HR will offer a quick, private conversation to help you course-correct. It’s a simple, respectful heads-up — not a formal mark against you.',
      },
      {
        label: 'Stage 2 — Written feedback',
        text: 'If the same concern comes up again, HR will share written feedback outlining the guideline and next steps. This may include a brief request to go home, change, and return — simply so you can meet clients at your best, never as a penalty.',
      },
    ],
    footnote:
      'This process exists to protect the trust our clients place in MAGPPIE — not to penalize anyone. Our goal is always to guide with care, so every team member feels confident representing our brand.',
  },
]

/** Slide 10, "Before you head out". */
export const DRESS_CODE_SELF_CHECK = [
  'Is my outfit clean and fitted?',
  'Is it appropriate for my role today?',
  'Am I representing MAGPPIE confidently?',
]
