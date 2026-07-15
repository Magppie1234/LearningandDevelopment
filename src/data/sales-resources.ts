import { SALES_MODULES } from './sales-academy'
import { salesVideoConfigForModule } from './sales-media'

/**
 * Real resources for the Sales academy Resources tab — replaces the seed
 * placeholder cards (mirrors src/data/bd-resources.ts):
 *
 *  1. reading — generated PDF reading packs, one per module (incl. the 3.9 and
 *               3.11 source-pending shells, which honestly carry their shell
 *               text). Assembled VERBATIM by scripts/gen-sales-resource-pdfs.ts
 *               into public/resources/sales/.
 *  2. provided — PDFs supplied by the team; drop the file in
 *               public/resources/sales/ and add an entry here.
 *  3. video   — the module video series: all 10 rendered videos, linked to
 *               their module pages. Module 11 stays honestly pending.
 */

export interface SalesResource {
  id: string
  group: 'reading' | 'provided' | 'video'
  title: string
  description: string
  file?: string // public path — present means downloadable now
  href?: string // in-app link (video entries)
  pages?: number
  sizeKb?: number
  status?: string // for non-available items (e.g. module 11's video)
}

const PACK_META: Record<string, { pages: number; sizeKb: number }> = {
  'sa-m1': { pages: 3, sizeKb: 55 },
  'sa-m2': { pages: 4, sizeKb: 58 },
  'sa-m3': { pages: 3, sizeKb: 55 },
  'sa-m4': { pages: 3, sizeKb: 58 },
  'sa-m5': { pages: 3, sizeKb: 56 },
  'sa-m6': { pages: 3, sizeKb: 56 },
  'sa-m7': { pages: 3, sizeKb: 54 },
  'sa-m8': { pages: 3, sizeKb: 53 },
  'sa-m9': { pages: 3, sizeKb: 52 },
  'sa-m10': { pages: 3, sizeKb: 53 },
  'sa-m11': { pages: 2, sizeKb: 51 },
}

export const SALES_RESOURCES: SalesResource[] = [
  // ── Group 1: generated reading packs, one per module ──
  ...SALES_MODULES.map(
    (m): SalesResource => ({
      id: `pack-${m.id}`,
      group: 'reading',
      title: `Module ${m.number} reading pack — ${m.title}`,
      description: m.sourcePending
        ? `${m.summary} (Source-pending shell — the pack carries its structure and flags.)`
        : `Module reading + the video narration script. ${m.summary}`,
      file: `/resources/sales/${m.id}-reading-pack.pdf`,
      pages: PACK_META[m.id]?.pages,
      sizeKb: PACK_META[m.id]?.sizeKb,
    }),
  ),

  // ── Group 2: provided by the team (add entries as files arrive) ──
  // { id: 'provided-example', group: 'provided', title: '…', description: '…', file: '/resources/sales/….pdf' },

  // ── Group 3: video series — one entry per rendered module video ──
  ...SALES_MODULES.map((m): SalesResource => {
    const hasVideo = Boolean(salesVideoConfigForModule(m.id))
    return {
      id: `video-${m.id}`,
      group: 'video',
      title: `Module ${m.number} video — ${m.title}`,
      description: hasVideo
        ? m.sourcePending
          ? 'Awaiting-source explainer: what the module will cover, honestly flagged.'
          : 'Animated explainer with narrated Key Notes recap and subtitles.'
        : 'No video yet — it is authored when the Notion source text arrives.',
      href: hasVideo ? `/academy/sales/modules?module=${m.id}` : undefined,
      status: hasVideo ? undefined : 'Awaiting Notion source',
    }
  }),
]
