import { BD_MODULES } from './bd-academy'

/**
 * Real resources for the BD academy Resources tab — replaces the seed
 * placeholder cards. Three separated groups (per the resources build ask):
 *
 *  1. reading  — generated PDF reading packs, one per module (4–7 pages each),
 *                assembled VERBATIM from the reviewed module content, the
 *                master training document sections, and the narration scripts
 *                (scripts/gen-bd-resource-pdfs.ts). Real files in
 *                public/resources/bd/.
 *  2. provided — PDFs supplied by the team. Drop the file in
 *                public/resources/bd/ and add an entry here (or hand the file
 *                to the build assistant to wire in).
 *  3. video    — the module video series, kept separate; honest production
 *                status, never a fake "watch" link.
 */

export interface BdResource {
  id: string
  group: 'reading' | 'provided' | 'video'
  title: string
  description: string
  file?: string // public path — present means downloadable now
  pages?: number
  sizeKb?: number
  status?: string // for non-downloadable items (e.g. videos in production)
}

const PACK_META: Record<string, { pages: number; sizeKb: number }> = {
  'bd-m1': { pages: 4, sizeKb: 56 },
  'bd-m2': { pages: 4, sizeKb: 53 },
  'bd-m3': { pages: 4, sizeKb: 53 },
  'bd-m4': { pages: 4, sizeKb: 54 },
  'bd-m5': { pages: 5, sizeKb: 66 },
  'bd-m6': { pages: 5, sizeKb: 61 },
  'bd-m7': { pages: 7, sizeKb: 66 },
  'bd-m8': { pages: 6, sizeKb: 66 },
  'bd-m9': { pages: 4, sizeKb: 58 },
  'bd-m10': { pages: 4, sizeKb: 62 },
}

export const BD_RESOURCES: BdResource[] = [
  // ── Group 1: generated reading packs, one per module ──
  ...BD_MODULES.map((m): BdResource => ({
    id: `pack-${m.id}`,
    group: 'reading',
    title: `Module ${m.number} reading pack — ${m.title}`,
    description: `Module reading, verbatim source sections and the narration script. ${m.competency}.`,
    file: `/resources/bd/${m.id}-reading-pack.pdf`,
    pages: PACK_META[m.id]?.pages,
    sizeKb: PACK_META[m.id]?.sizeKb,
  })),

  // ── Group 2: provided by the team (add entries as files arrive) ──
  // { id: 'provided-example', group: 'provided', title: '…', description: '…', file: '/resources/bd/….pdf' },

  // ── Group 3: video series (kept separate; real status) ──
  {
    id: 'video-series',
    group: 'video',
    title: 'Module narration videos (10)',
    description:
      'One narrated video per module, multi-language. Narration scripts are finalized (readable in each reading pack and on every module page); video files are in production.',
    status: 'In production — scripts ready',
  },
]
