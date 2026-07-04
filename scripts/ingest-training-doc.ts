/**
 * One-time (re-)ingestion of the Magppie AI Bot Training Document into the
 * `training_documents` Supabase table for vector similarity search.
 *
 * The document is already parsed and structured in src/data/training-doc.ts
 * (transcribed by hand from the source PDF, not auto-extracted — this keeps
 * chunk boundaries and verbatim scripts accurate). This script's only job is:
 * embed each chunk, then upsert. Re-running it after the source doc changes
 * (bump TRAINING_DOC_VERSION in training-doc.ts first) replaces that
 * document+version's rows — it never duplicates, thanks to the migration's
 * unique(source_document, document_version, chunk_key) constraint.
 *
 * Requires (not yet configured in this project — see README "AI Assistant"
 * section):
 *   - NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (a real project,
 *     not the demo-mode placeholder)
 *   - OPENAI_API_KEY (default embedding provider — see EMBEDDING_MODEL below
 *     to swap providers; this only needs to change in embedQuery())
 *
 * Run: npm run ingest:training-doc
 */
import { createClient } from '@supabase/supabase-js'
import {
  TRAINING_CHUNKS,
  TRAINING_DOC_SOURCE,
  TRAINING_DOC_VERSION,
} from '../src/data/training-doc'

const EMBEDDING_MODEL = 'text-embedding-3-small'
const EMBEDDING_DIMENSIONS = 1536

async function embed(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY is not set. Set it in .env.local (or swap embed() for a ' +
        'different provider) before running ingestion.',
    )
  }

  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: text }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Embedding request failed (${res.status}): ${errText}`)
  }

  const data = (await res.json()) as { data: { embedding: number[] }[] }
  const vector = data.data[0]?.embedding
  if (!vector || vector.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Unexpected embedding shape: got ${vector?.length ?? 'none'}, expected ${EMBEDDING_DIMENSIONS}`,
    )
  }
  return vector
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set to a ' +
        'real Supabase project (not demo/placeholder values) before ingesting.',
    )
  }

  const supabase = createClient(supabaseUrl, serviceKey)

  console.log(
    `Ingesting ${TRAINING_CHUNKS.length} chunks from ${TRAINING_DOC_SOURCE} ` +
      `(version ${TRAINING_DOC_VERSION})...`,
  )

  // Idempotent replace: clear this document+version's existing rows first,
  // so a partial content edit doesn't leave orphaned stale chunks behind.
  const { error: deleteError } = await supabase
    .from('training_documents')
    .delete()
    .eq('source_document', TRAINING_DOC_SOURCE)
    .eq('document_version', TRAINING_DOC_VERSION)
  if (deleteError) throw deleteError

  let done = 0
  for (const chunk of TRAINING_CHUNKS) {
    const embedding = await embed(`${chunk.sectionTitle}\n\n${chunk.content}`)

    const { error } = await supabase.from('training_documents').insert({
      source_document: TRAINING_DOC_SOURCE,
      document_version: TRAINING_DOC_VERSION,
      chunk_key: chunk.id,
      section_number: chunk.sectionNumber,
      section_title: chunk.sectionTitle,
      category: chunk.category,
      content: chunk.content,
      is_verbatim_script: chunk.isVerbatimScript,
      embedding,
    })
    if (error) throw error

    done += 1
    if (done % 10 === 0 || done === TRAINING_CHUNKS.length) {
      console.log(`  ${done}/${TRAINING_CHUNKS.length} chunks embedded + stored`)
    }
  }

  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
