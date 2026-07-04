import { createClient } from '@supabase/supabase-js'

/**
 * Server-side data access for the BD academy API routes (Section 4 of the
 * backend port). Reads the isolated `ld` schema through the BD-scoped
 * `public.bd_*` views + the `bd_score_quiz` RPC, using the anon key — the
 * views expose no correct answers, and scoring happens inside the DB function,
 * so quiz answers never reach the client (matches the prototype + CLAUDE.md).
 */
export const BD_ACADEMY_SLUG = 'business-development'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const bdConfigured = Boolean(url && anon)

// Dedicated server client: no session persistence (route handlers are stateless).
export const bdDb = createClient(
  url ?? 'https://placeholder.supabase.co',
  anon ?? 'placeholder-anon',
  { auth: { persistSession: false, autoRefreshToken: false } },
)

/** Accept either the full key (`bd-m5`) or the prototype short id (`m5`). */
export function normalizeModuleKey(raw: string): string {
  const k = decodeURIComponent(raw).trim().toLowerCase()
  return k.startsWith('bd-') ? k : `bd-${k}`
}

export interface BdChunk {
  module_key: string
  source: string
  chunk_text: string
}

/**
 * Lightweight keyword retrieval over the scoped BD corpus — same role the real
 * pgvector pipeline would play, ranking by term frequency × unique-term
 * coverage. Runs over all 116 chunks (small enough to score in-process),
 * mirroring the prototype's TF-IDF search.
 */
const STOPWORDS = new Set([
  'the', 'and', 'for', 'are', 'you', 'your', 'what', 'when', 'where', 'which', 'who', 'how',
  'why', 'does', 'did', 'was', 'were', 'has', 'have', 'had', 'will', 'would', 'can', 'could',
  'should', 'that', 'this', 'these', 'those', 'with', 'from', 'into', 'about', 'their', 'there',
  'them', 'they', 'our', 'out', 'not', 'but', 'all', 'any', 'get', 'got', 'use', 'used',
])

export function rankChunks(query: string, chunks: BdChunk[], topK = 3) {
  const terms = (query.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter(
    (t) => t.length > 2 && !STOPWORDS.has(t),
  )
  if (terms.length === 0) return []

  const scored = chunks
    .map((c) => {
      const text = c.chunk_text.toLowerCase()
      let freq = 0
      for (const t of terms) {
        let idx = text.indexOf(t)
        while (idx !== -1) {
          freq++
          idx = text.indexOf(t, idx + t.length)
        }
      }
      const coverage = terms.filter((t) => text.includes(t)).length / terms.length
      return { chunk: c, relevance: freq * (0.5 + coverage) }
    })
    .filter((s) => s.relevance > 0)

  scored.sort((a, b) => b.relevance - a.relevance)
  return scored.slice(0, topK).map((s) => ({
    module_key: s.chunk.module_key,
    source: s.chunk.source,
    text: s.chunk.chunk_text,
    relevance: Number(s.relevance.toFixed(3)),
  }))
}

export function notConfigured() {
  return { error: 'Supabase not configured (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY unset)' }
}
