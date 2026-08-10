/**
 * Vision Corner video — scene spec + narration.
 *
 * SOURCING RULE. Every factual claim below is already approved elsewhere in
 * this repo: the mission verbatim and the four milestones from
 * src/data/vision.ts, the wood-vs-stone material points from the AI Bot Master
 * Training Document (the same source the portal assistant answers from), and
 * the leadership names/roles/photos from magppie.com's own team page. Nothing
 * here is invented. Connective narration is plain phrasing, not new claims.
 *
 * DELIBERATELY EXCLUDED: VISION_FOUNDER.note. It is flagged in vision.ts as
 * placeholder copy pending review by Vinod Sir / Megha Ma'am — putting draft
 * words in a founder's mouth, in a voiced video, is exactly the thing that
 * flag exists to prevent.
 *
 * SYNTHETIC-LIKENESS RULE. The narrator is a generic neural voice, not a clone
 * of anyone's. The visuals are photographs these people have already published,
 * not a generated likeness. See PortraitsScene in scenes.tsx.
 */

const TEAL = '#63b3af'
const GOLD = '#e0a04a'
const SAGE = '#7C8B6F'

export const VISION_SPEC = {
  number: 0,
  title: 'Vision Corner',
  kicker: 'MAGPPIE · VISION CORNER',
  scenes: [
    {
      type: 'title',
      vo: 'Magppie is not, in the end, a kitchen company. It is a wellness company that happens to build kitchens.',
      props: {
        kicker: 'Vision Corner',
        title: 'What we build, and why',
        subtitle: 'Magppie — a wellness movement, in about a minute.',
      },
    },
    {
      type: 'quote',
      vo: 'Our mission is to transform ordinary homes into wellness homes. Spaces that keep you, your family, and the planet safe.',
      props: {
        label: 'The mission — verbatim',
        text: 'Our mission is to transform ordinary homes into wellness homes. Spaces that keep you, your family, and the planet safe.',
      },
    },
    {
      type: 'timeline',
      vo: 'Magppie launched in two thousand, bringing steel, and later stone-based design, to Indian homes. By two thousand and seven it had gone global, across more than thirty-five countries. In twenty twenty-three came the Wellness Kitchen — the world’s first hundred per cent stone modular kitchen. And in February twenty twenty-six, recognition at the K B I S Innovation Hour in Orlando.',
      props: {
        heading: 'How it happened',
        items: [
          { value: 2000, label: 'Magppie launches' },
          { value: 35, label: 'countries by 2007' },
          { value: 2023, label: 'the Wellness Kitchen' },
        ],
      },
    },
    {
      type: 'swap',
      vo: 'The difference is the material. A Magppie kitchen is built from engineered stone rather than wood. There is nothing for termites to eat, nothing that swells when it gets wet, and no formaldehyde released into the room where you cook.',
      props: {
        heading: 'Why stone, not wood',
        rows: [
          { from: 'Termites and fungus', to: 'Nothing organic to eat', color: SAGE },
          { from: 'Swells with water', to: 'Unaffected by water', color: TEAL },
          { from: 'Releases formaldehyde', to: 'Releases nothing', color: GOLD },
        ],
      },
    },
    {
      type: 'portraits',
      vo: 'It is built by a team working across India, the United States, Europe and Denmark.',
      props: {
        heading: 'The people behind it',
        people: [
          { name: 'Vinod Jain', role: 'Founder | Chief Mentor', photo: '/team/vinod-jain.png' },
          { name: 'Megha Jain', role: 'Co-Founder | Director', photo: '/team/megha-jain.jpg' },
          { name: 'Vikas Jain', role: 'Co-Founder | Innovations', photo: '/team/vikas-jain.jpg' },
          { name: 'Ishat Jain', role: 'Co-Founder | Director', photo: '/team/ishat-jain.jpg' },
        ],
      },
    },
    {
      type: 'notes',
      vo: 'The objective is simple to say, and hard to do. Make an ordinary home a place that actively looks after the people living in it. That is the work.',
      props: {
        heading: 'The objective',
        items: [
          'Transform ordinary homes into wellness homes.',
          'Build from stone, so a kitchen lasts decades rather than years.',
          'Stand behind it — 25-year guarantee, 25 complimentary annual services.',
        ],
      },
    },
  ],
}
