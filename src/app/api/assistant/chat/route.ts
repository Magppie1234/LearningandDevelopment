import { NextResponse } from 'next/server'
import {
  answerFromTrainingDoc,
  retrieveRelevantChunks,
  NOT_FOUND_MESSAGE,
} from '@/lib/training-search'
import {
  TRAINING_DOC_SOURCE,
  TRAINING_DOC_VERSION,
} from '@/data/training-doc'
import { computeGaps } from '@/lib/skill-gap'
import { COMPETENCIES } from '@/data/competencies'
import {
  demoUserRequirements,
  demoUserCurrentLevels,
} from '@/data/role-requirements'

export const runtime = 'nodejs'

/**
 * Phase 3 (§3.3): Pooja is connected to the skill-gap engine. When the
 * employee asks a learning/growth question, their live top gaps are injected
 * as context so the assistant proactively recommends the next module —
 * grounded in the competency dictionary, not general knowledge.
 * (Demo mode uses the demo user's gaps; live mode reads employee_skill_gaps.)
 */
function isLearningIntent(q: string): boolean {
  const s = q.toLowerCase()
  return /what should i (learn|study|do next)|next (module|course)|improve my|skill gap|recommend .*(course|module|learning)|my (weakest|development)|grow (in|to)|get promoted|readiness/.test(
    s,
  )
}

function skillGapContext(): string {
  const gaps = computeGaps(demoUserRequirements, demoUserCurrentLevels, COMPETENCIES).slice(0, 5)
  if (gaps.length === 0) return ''
  const lines = gaps
    .map(
      (g) =>
        `- ${g.name} (${g.academy}, ${g.type}): current level ${g.current}/5, required ${g.required}/5 — gap ${g.gap}`,
    )
    .join('\n')
  return `\n\nEMPLOYEE SKILL-GAP DATA (from the portal's skill-gap engine — their top development priorities, highest priority first):\n${lines}\n\nWhen the employee asks what to learn or how to grow, recommend the module matching their highest-priority gap and say why (current vs required level). These module names are real portal courses.`
}

interface ChatRequestBody {
  question?: string
}

const OPENROUTER_MODEL = 'anthropic/claude-haiku-4.5'

const SYSTEM_RULES = `You are the Magppie L&D Portal training assistant. Employees ask you questions about the Magppie Wellness Kitchens sales process, and you answer ONLY from the excerpts of the "Magppie AI Bot Master Training Document" (v${TRAINING_DOC_VERSION}) provided below.

Rules — follow every one:
1. Answer strictly from the provided excerpts. Never invent pricing, guarantees, store locations, timelines, or claims that are not in them.
2. If an excerpt is marked verbatim_script: true and the employee is asking what to say to a customer, reproduce that script wording closely — the exact phrasing is the point. Do not summarize it away.
3. Quote pricing, guarantee terms, and payment schedules exactly as written (e.g. "Rs. 8,400 to Rs. 10,800 per sq. ft."). Never round or approximate.
4. Never use these forbidden words yourself: "carcinogen" (say "can be very harmful for your health"), "cheap", "discount", "negotiate", repeated "wonderful", "yearly deep cleaning" (say "25 complimentary annual services").
5. If the excerpts do not actually answer the question, reply exactly: "${NOT_FOUND_MESSAGE}" — do not guess.
6. Be concise and practical. You are coaching a Magppie employee, not a customer.`

async function synthesizeWithLLM(
  question: string,
  chunks: ReturnType<typeof retrieveRelevantChunks>,
  apiKey: string,
  extraSystem = '',
): Promise<string | null> {
  const context = chunks
    .map(
      (r, i) =>
        `[Excerpt ${i + 1}] §${r.chunk.sectionNumber} — ${r.chunk.sectionTitle} (verbatim_script: ${r.chunk.isVerbatimScript})\n${r.chunk.content}`,
    )
    .join('\n\n')

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Title': 'Magppie L&D Portal AI Assistant',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        temperature: 0.2,
        max_tokens: 900,
        messages: [
          { role: 'system', content: `${SYSTEM_RULES}${extraSystem}\n\nDocument excerpts:\n\n${context}` },
          { role: 'user', content: question },
        ],
      }),
      signal: AbortSignal.timeout(30_000),
    })

    if (!res.ok) {
      console.error(`OpenRouter returned ${res.status}: ${await res.text()}`)
      return null
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const content = data.choices?.[0]?.message?.content?.trim()
    return content || null
  } catch (err) {
    console.error('OpenRouter call failed:', err)
    return null
  }
}

/**
 * POST /api/assistant/chat
 * Body: { question: string }
 *
 * Two-stage RAG over the Magppie AI Bot Training Document:
 *   1. Retrieval — keyword/phrase scoring over the structured chunks in
 *      src/data/training-doc.ts (src/lib/training-search.ts). Upgrades to
 *      pgvector similarity search once Supabase + an embedding key exist
 *      (see scripts/ingest-training-doc.ts).
 *   2. Synthesis — if OPENROUTER_API_KEY is set, the matched chunks are
 *      passed to an LLM that writes a natural answer under strict
 *      answer-only-from-the-document rules. If the key is missing or the
 *      call fails, we fall back to returning the top chunk text directly,
 *      so the assistant always works.
 */
export async function POST(request: Request) {
  let body: ChatRequestBody
  try {
    body = (await request.json()) as ChatRequestBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const question = body.question?.trim()
  if (!question) {
    return NextResponse.json({ error: 'question is required' }, { status: 400 })
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  const learningIntent = isLearningIntent(question)
  const gapContext = learningIntent && apiKey ? skillGapContext() : ''

  // With an LLM available, retrieve loosely (rephrased questions often share
  // few exact keywords with the document) and let the model judge relevance.
  // Without one, only a strict match is safe to return directly.
  const relevant = apiKey
    ? retrieveRelevantChunks(question, 8, 0.35)
    : retrieveRelevantChunks(question, 6)

  // Learning-intent questions can be answered from the skill-gap engine even
  // when the sales-training doc has nothing relevant.
  if (relevant.length === 0 && !gapContext) {
    return NextResponse.json({
      found: false,
      answer: NOT_FOUND_MESSAGE,
      sources: [],
      documentVersion: TRAINING_DOC_VERSION,
      documentSource: TRAINING_DOC_SOURCE,
    })
  }

  const sources = relevant.slice(0, 3).map((r) => ({
    id: r.chunk.id,
    label: `§${r.chunk.sectionNumber} ${r.chunk.sectionTitle}`,
  }))
  if (gapContext) {
    sources.unshift({ id: 'skill-gap-engine', label: 'Skill Gap Engine — your live gaps' })
  }

  if (apiKey) {
    const extra = gapContext
      ? `${gapContext}\n\n(For this learning question, rule 5 does not apply if the skill-gap data answers it.)`
      : ''
    const synthesized = await synthesizeWithLLM(question, relevant, apiKey, extra)
    if (synthesized) {
      // The model declares out-of-scope questions with the exact fallback
      // sentence (rule 5) — surface those as not-found, without sources.
      const notFound = synthesized.includes(NOT_FOUND_MESSAGE)
      return NextResponse.json({
        found: !notFound,
        answer: notFound ? NOT_FOUND_MESSAGE : synthesized,
        sources: notFound ? [] : sources,
        documentVersion: TRAINING_DOC_VERSION,
        documentSource: TRAINING_DOC_SOURCE,
      })
    }
  }

  // No key or LLM failure — direct chunk answer, same contract.
  return NextResponse.json(answerFromTrainingDoc(question))
}
