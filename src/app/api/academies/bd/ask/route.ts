import { NextResponse } from 'next/server'
import { bdDb, bdConfigured, notConfigured, rankChunks, type BdChunk } from '@/lib/bd-api'

export const runtime = 'nodejs'

/**
 * GET /api/academies/bd/ask?q=...
 * Free-text search over the SCOPED BD corpus only (module content + narration +
 * the full 62-question FAQ bank) — decision §3: BD search is its own index, not
 * merged into the Pooja assistant. Ranks with a keyword scorer (stands in for
 * the pgvector pipeline) and returns the best-matching chunks.
 */
export async function GET(req: Request) {
  if (!bdConfigured) return NextResponse.json(notConfigured(), { status: 503 })
  const query = new URL(req.url).searchParams.get('q')?.trim() ?? ''
  if (!query) return NextResponse.json({ error: 'provide a query with ?q=' }, { status: 400 })

  const { data, error } = await bdDb
    .from('bd_content_chunks')
    .select('module_key, source, chunk_text')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const results = rankChunks(query, (data ?? []) as BdChunk[], 3)
  return NextResponse.json({ query, results })
}
