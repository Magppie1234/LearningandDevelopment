import {
  TRAINING_CHUNKS,
  TRAINING_DOC_SOURCE,
  TRAINING_DOC_VERSION,
  type TrainingChunk,
} from '@/data/training-doc'

/**
 * Retrieval layer for the Magppie AI Bot Training Document.
 *
 * This is a deliberate "upgrade path" design: today, with no embedding
 * provider or live Supabase project configured, this scores chunks by
 * keyword/phrase overlap in plain TypeScript — zero external dependencies,
 * fully functional right now. Once an embedding provider + pgvector are
 * wired up (see scripts/ingest-training-doc.ts and the training_documents
 * migration), swap searchTrainingDoc()'s body for a real vector similarity
 * query — callers (the /api/assistant/chat route) don't need to change.
 */

const STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'do', 'does', 'did', 'i', 'you',
  'we', 'it', 'to', 'of', 'in', 'on', 'for', 'and', 'or', 'what', 'how', 'can',
  'will', 'my', 'your', 'our', 'me', 'about', 'if', 'with', 'be', 'that', 'this',
])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
}

export interface ScoredChunk {
  chunk: TrainingChunk
  score: number
}

/** Score every chunk against the query; higher is more relevant. */
export function searchTrainingDoc(query: string, topN = 6): ScoredChunk[] {
  const queryTokens = tokenize(query)
  if (queryTokens.length === 0) return []

  const lowerQuery = query.toLowerCase()

  const scored = TRAINING_CHUNKS.map((chunk) => {
    const haystack = `${chunk.sectionTitle} ${chunk.content}`.toLowerCase()
    const haystackTokens = tokenize(haystack)
    const haystackSet = new Set(haystackTokens)

    let score = 0
    for (const t of queryTokens) {
      if (haystackSet.has(t)) score += 1
      // Substring credit catches things like "emi" inside "premium" being
      // avoided (word-boundary tokenize already prevents that), while still
      // rewarding partial matches like "guarantee" vs "guaranteed".
      else if (haystack.includes(t)) score += 0.4
    }

    // Exact phrase bonus (e.g. the whole query appears verbatim in content).
    if (queryTokens.length > 1 && haystack.includes(lowerQuery)) score += 3

    // Title matches are a stronger signal than body matches.
    const titleTokens = new Set(tokenize(chunk.sectionTitle))
    for (const t of queryTokens) {
      if (titleTokens.has(t)) score += 1.5
    }

    // Normalize lightly by query length so short/long questions are comparable.
    score = score / Math.sqrt(queryTokens.length)

    return { chunk, score }
  })

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
}

/** Heuristic: is the user asking "what should I say" rather than "what is X"? */
function isScriptRequest(query: string): boolean {
  const q = query.toLowerCase()
  return (
    q.includes('what do i say') ||
    q.includes('what should i say') ||
    q.includes('how do i handle') ||
    q.includes('how do i respond') ||
    q.includes('script for') ||
    q.includes('how to pitch') ||
    q.includes('objection')
  )
}

export interface AssistantAnswer {
  found: boolean
  answer: string
  sources: { id: string; label: string }[]
  documentVersion: string
  documentSource: string
}

const RELEVANCE_THRESHOLD = 1.2
export const NOT_FOUND_MESSAGE =
  "I don't have that in the current training document — let me flag this for the Training Lead to add."

/** Relevant chunks above a confidence threshold — used by the API route to
 *  build LLM context. `minScore` defaults to the strict threshold used for
 *  direct chunk answers; when an LLM synthesizes the reply, callers pass a
 *  looser threshold and let the LLM judge relevance instead (it is
 *  instructed to answer "not in the document" when excerpts don't help). */
export function retrieveRelevantChunks(
  query: string,
  topN = 6,
  minScore = RELEVANCE_THRESHOLD,
): ScoredChunk[] {
  return searchTrainingDoc(query, topN).filter((r) => r.score >= minScore)
}

/**
 * Answers strictly from the training-doc chunks — never invents pricing,
 * guarantees, store locations, or claims not present in the source content.
 * Mirrors the system-prompt rules this whole feature is built around, just
 * enforced in code rather than via an LLM call (since no LLM is wired up yet).
 */
export function answerFromTrainingDoc(query: string): AssistantAnswer {
  const results = searchTrainingDoc(query, 4)
  const relevant = results.filter((r) => r.score >= RELEVANCE_THRESHOLD)

  if (relevant.length === 0) {
    return {
      found: false,
      answer: NOT_FOUND_MESSAGE,
      sources: [],
      documentVersion: TRAINING_DOC_VERSION,
      documentSource: TRAINING_DOC_SOURCE,
    }
  }

  const top = relevant[0].chunk
  const wantsScript = isScriptRequest(query)

  let answer: string
  if (top.isVerbatimScript && (wantsScript || top.category !== 'faq')) {
    // Reproduce closely rather than summarize — the exact wording is the point.
    answer = top.content
  } else {
    // FAQ content can be presented directly too; it's already the
    // human-approved answer text, not something to paraphrase further.
    answer = top.content
  }

  // If a second highly-relevant chunk adds distinct information, include it.
  const second = relevant[1]
  if (second && second.chunk.id !== top.id && second.score >= relevant[0].score * 0.7) {
    answer += `\n\n${second.chunk.content}`
  }

  const sources = relevant.slice(0, 3).map((r) => ({
    id: r.chunk.id,
    label: `§${r.chunk.sectionNumber} ${r.chunk.sectionTitle}`,
  }))

  return {
    found: true,
    answer,
    sources,
    documentVersion: TRAINING_DOC_VERSION,
    documentSource: TRAINING_DOC_SOURCE,
  }
}
