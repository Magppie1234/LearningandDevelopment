/**
 * Vision Corner content — single source for the /vision scroll experience.
 * Every claim here is confined to what the build brief supplied (sourced from
 * magppie.com / the AI Bot training doc). Do NOT add milestones, dates, or
 * biographical claims without sign-off.
 */

export const VISION_MISSION =
  'Our mission is to transform ordinary homes into wellness homes. Spaces that keep you, your family, and the planet safe.'

export const VISION_FOUNDER = {
  name: 'Vinod Jain',
  title: 'Founder & CEO, Magppie Group',
  photo: '/founder-vinod-jain.jpg',
  /**
   * PLACEHOLDER COPY — pending review by Vinod Sir / Megha Ma'am before this
   * goes live. Do not treat as final; the UI shows a "draft copy" tag while
   * this flag is true.
   */
  noteIsPlaceholder: true,
  note: 'Magppie was built on a simple belief: that people, planet, and profit don’t have to compete with each other — good design can hold all three at once. Every Wellness Kitchen we build carries that same intent: not just a product, but a small part of a larger commitment to health, sustainability, and doing business in a way that gives back more than it takes.',
}

export interface VisionMilestone {
  year: string
  title: string
  detail: string
}

/** Real milestones only — exactly as supplied in the brief. */
export const VISION_TIMELINE: VisionMilestone[] = [
  {
    year: '2000',
    title: 'Magppie launches',
    detail: 'Introducing steel — and later stone-based design — to the Indian market.',
  },
  {
    year: '2007',
    title: 'Going global',
    detail: 'International expansion across 35+ countries; first international retail store opens in Sydney.',
  },
  {
    year: '2023',
    title: 'The Wellness Kitchen',
    detail: 'Launch of the Wellness Kitchen category — the world’s first 100% stone modular kitchen.',
  },
  {
    year: 'Feb 2026',
    title: 'KBIS Innovation Hour, Orlando',
    detail: '“Most Unexpected” honor at KBIS Innovation Hour, alongside Caesarstone and LG.',
  },
]

/** Leadership team — names, roles and portraits, verified from magppie.com's
 *  team page (§7). No bios, no invented detail. */
export const VISION_LEADERSHIP: { name: string; role: string; photo: string }[] = [
  // Mirrors magppie.com's own team page — names, titles and portraits are
  // theirs verbatim (photos downscaled and self-hosted under /public/team).
  // If the site's team page changes, re-pull it rather than editing here ad hoc.
  { name: 'Vinod Jain', role: 'Founder | Chief Mentor', photo: '/team/vinod-jain.png' },
  { name: 'Megha Jain', role: 'Co-Founder | Director', photo: '/team/megha-jain.jpg' },
  { name: 'Vikas Jain', role: 'Co-Founder | Innovations', photo: '/team/vikas-jain.jpg' },
  { name: 'Ishat Jain', role: 'Co-Founder | Director', photo: '/team/ishat-jain.jpg' },
  { name: 'Kishor Rico', role: 'Director | US Operations', photo: '/team/kishor-rico.png' },
  { name: 'Fernando Rico', role: 'Director | USA', photo: '/team/fernando-rico.jpg' },
  { name: 'Riccardo Remedi', role: 'Director | Magppie Europe', photo: '/team/riccardo-remedi.jpg' },
  { name: 'Stacy McCarthy', role: 'Design Consultant | USA', photo: '/team/stacy-mccarthy.jpg' },
  { name: 'Chaitanya Chavda', role: 'Director | Dallas', photo: '/team/chaitanya-chavda.jpg' },
  { name: 'Christoph Hoeynck', role: 'Director | Germany', photo: '/team/christoph-hoeynck.webp' },
  { name: 'Susan Sadolin', role: 'Sales Director | USA & Denmark', photo: '/team/susan-sadolin.webp' },
  { name: 'Sanjay Khandelwal', role: 'Director | Projects', photo: '/team/sanjay-khandelwal.jpg' },
]

/** Global presence — verified from magppie.com (§7). Retail stores are
 *  covered separately in the BD store directory. */
export const VISION_GLOBAL_PRESENCE: { label: string; place: string }[] = [
  { label: 'US Headquarters', place: 'Gainesville, Florida' },
  { label: 'US Factory', place: 'Alachua, Florida' },
  { label: 'Texas Office', place: 'Mansfield' },
  { label: 'India Headquarters', place: 'Delhi' },
  { label: 'India Factory', place: 'IMT Manesar, Haryana' },
]

/** Third-party citation for the KBIS 2026 award beat (§7). */
export const VISION_AWARD_CITATION = {
  label: 'Designers Today: Caesarstone, Magppie and LG win top honors at KBIS Innovation Hour',
  url: 'https://www.designerstoday.com/kitchen-bath/caesarstone-magppie-and-lg-win-top-honors-at-kbis-innovation-hour/',
}

export const VISION_WHY_STONE = {
  heading: 'Why stone, not wood',
  lines: [
    'Stone kitchens are termite-safe and fungus-safe — problems conventional wood kitchens quietly live with.',
    'They release no formaldehyde into the home.',
    'That is the whole philosophy: materials that protect the people who live with them.',
  ],
}

/**
 * Vision Corner flagship video slot (§3 of the visuals-expansion prompt).
 * Same technical model as the BD module videos: N language variants, each
 * { languageCode, videoUrl, subtitleUrl }, "coming soon" until a real file
 * exists — no filler asset. The actual video is produced separately once the
 * AI pipeline (style/voice/languages) is finalised; drop variants in here.
 *
 * The narration script below is a DRAFT assembled STRICTLY from lines already
 * verified in this file and the approved BD training content — nothing new
 * was invented. scriptIsDraft mirrors the founder-note noteIsPlaceholder
 * pattern: the UI shows a "draft — pending review" chip while true.
 *
 * FLAGGED GAP: the brief's content arc mentions "the Satvic Movement wellness
 * connection" — that connection appears in NO verified source in this repo,
 * so it is deliberately absent from this script until source material with
 * sign-off exists.
 */
import type { VideoVariant } from '@/data/bd-media'

export const VISION_VIDEO: {
  title: string
  variants: VideoVariant[]
  scriptIsDraft: boolean
  script: string
} = {
  title: 'How it started, how it’s going',
  // Produced with the same film system and narrator as the BD module videos,
  // narrated from the draft script below (verified lines only) plus the
  // verified VISION_WHY_STONE lines. Re-render when the script is finalised.
  variants: [
    {
      languageCode: 'en',
      languageLabel: 'English',
      videoUrl: '/assets/vision/our-story-en.mp4',
      subtitleUrl: '/assets/vision/our-story-en.vtt',
    },
  ],
  scriptIsDraft: true,
  script: `“Our mission is to transform ordinary homes into wellness homes. Spaces that keep you, your family, and the planet safe.”

How it started: Magppie Group has been in business for over 50 years. Magppie launched in 2000, introducing steel — and later stone-based design — to the Indian market. By 2007 it had expanded internationally across 35+ countries, opening its first international retail store in Sydney.

The pivot: for the past 20+ years the focus has been kitchens and wardrobes — and the first SilverStone kitchen was installed in late 2016. In 2023 came the Wellness Kitchen category: the world’s first 100% stone modular kitchen.

How it’s going: in February 2026, the “Most Unexpected” honor at KBIS Innovation Hour in Orlando, alongside Caesarstone and LG — and a store now open in Florida, USA. Every Wellness Kitchen carries a 25-year unconditional guarantee, with a complimentary service visit every year.`,
}

export const VISION_PROMISE = {
  heading: 'The long-term promise',
  stat: '25 years',
  lines: [
    'Every Wellness Kitchen carries a 25-year unconditional guarantee, with a complimentary service visit every year.',
    'That is the same long-term thinking your training here is meant to build: do the work so well, and stand behind it so completely, that a promise can stretch across decades.',
  ],
}

/* ───────────────────────── Vision Corner ─────────────────────────
 * One self-hosted founder video, not an Instagram embed. The embed widget was
 * tried and rejected: it drags Instagram's own chrome (logo, like and comment
 * counts, "view on Instagram") into the page, which reads as bolted on.
 */

/**
 * The hero film: the AI-narrated vision video rendered by
 * scripts/gen-vision-video.mjs (script: remotion/vision-spec.mjs). Stock
 * neural narrator over the team's real published photographs — deliberately
 * NOT a synthetic likeness of the founder or a clone of his voice; the
 * spec file carries the full sourcing and likeness rules.
 *
 * The originally intended real founder reel was never obtainable from a
 * build machine (instagram.com login-walls unauthenticated fetches — see
 * VISION_HERO_CANDIDATES below). If someone signed-in ever saves one, it can
 * take this slot back; that swap is a data change here, not a layout change.
 */
export const VISION_HERO_VIDEO = {
  src: '/assets/vision/vision.mp4',
  subtitles: '/assets/vision/vision.vtt',
  poster: '/kitchen/space-3.jpg',
  /** 16/9 landscape (the Remotion film) — the reel slot was 9/16 portrait. */
  aspect: '16 / 9',
}

/**
 * The nine candidate reels. Kept ONLY so whoever downloads the video knows
 * which nine to watch — the page renders exactly one video and no list, by
 * instruction. Which reel is strongest depends on what is actually said in
 * them, so it is a human call, not one to fake here.
 */
export const VISION_HERO_CANDIDATES = [
  'https://www.instagram.com/reel/DWWQU4LkhUt/',
  'https://www.instagram.com/reel/DYpGgI9Sz6K/',
  'https://www.instagram.com/reel/DRkE70hEkGq/',
  'https://www.instagram.com/reel/C_nbHWjybor/',
  'https://www.instagram.com/reel/C_S9pVYSm6L/',
  'https://www.instagram.com/reel/DA_J9sRyv0r/',
  'https://www.instagram.com/reel/DYr5XGhyz_W/',
  'https://www.instagram.com/reel/C-u0_xXSwOk/',
  'https://www.instagram.com/reel/DV_KNXsEvtk/',
]

/**
 * The written anchor. Deliberately short — the video carries the emotional
 * weight; this exists so a cold reader still leaves knowing what the company
 * does, what makes it different, and what it is trying to achieve.
 */
export const VISION_CORNER = {
  eyebrow: 'Vision Corner',
  // Copy is honest about what plays below: an AI-narrated brand film over the
  // team's real photographs — not the founders speaking. "Straight from the
  // founders / in their own words" belonged to the (unobtainable) real reel
  // and would misattribute a synthetic narration.
  // Two minutes, not one: the narration grew when the reels' own recurring
  // ideas went into the script. Kept honest against the actual runtime (2:00)
  // rather than left at the older figure.
  heading: 'The vision, in two minutes',
  lede: 'What Magppie builds and why — an AI-narrated film from approved sources, over the team’s real photographs.',
  summary: [
    {
      label: 'What we do',
      text: 'We build wellness kitchens and wardrobes out of engineered stone — no wood anywhere in the structure.',
    },
    {
      label: 'What makes it different',
      text: 'SilverStone is stone infused with silver and copper at nano scale. Wood swells, harbours termites and off-gasses; stone does not. That is a health claim about the material, not a finish.',
    },
    {
      label: 'What we are trying to achieve',
      text: 'To turn ordinary homes into wellness homes — and to stand behind that for 25 years, with a service visit every single one of them.',
    },
  ],
}
