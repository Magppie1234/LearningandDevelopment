import { NextResponse } from 'next/server'
import { COMPETENCIES } from '@/data/competencies'

export const runtime = 'nodejs'

/**
 * POST /api/admin/draft-questions  { competencyId: string }
 *
 * Phase 3 (§3.3): AI-drafts MCQs for a competency, grounded ONLY in that
 * competency's documented core topics + outcome. Returns DRAFTS — they enter
 * the admin review queue (status 'draft' → 'in_review' → 'published');
 * auto-publishing is blocked both app-side (admin-content-store) and DB-side
 * (trg_enforce_item_review, migration 0011).
 */
export async function POST(request: Request) {
  let body: { competencyId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const competency = COMPETENCIES.find((c) => c.id === body.competencyId)
  if (!competency) {
    return NextResponse.json({ error: 'Unknown competencyId' }, { status: 400 })
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENROUTER_API_KEY not configured — AI drafting unavailable' },
      { status: 503 },
    )
  }

  const prompt = `You are drafting assessment questions for an internal L&D platform of Magppie, a premium wellness-kitchen manufacturer. Draft exactly 3 multiple-choice questions testing the competency below. Ground every question ONLY in the documented topics/outcome — do not invent company facts, prices, or policies.

Competency: ${competency.name} (${competency.academy})
Core topics: ${competency.coreTopics}
Outcome bar: ${competency.outcome}

Reply with ONLY a JSON array (no markdown fences):
[{"question": "...", "options": ["...","...","...","..."], "correctIndex": 0, "explanation": "..."}]`

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Title': 'Magppie L&D Question Drafting',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-haiku-4.5',
        temperature: 0.4,
        max_tokens: 1200,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(45_000),
    })
    if (!res.ok) {
      return NextResponse.json(
        { error: `OpenRouter returned ${res.status}` },
        { status: 502 },
      )
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
    const raw = data.choices?.[0]?.message?.content?.trim() ?? ''
    const jsonText = raw.replace(/^```(?:json)?/m, '').replace(/```$/m, '').trim()
    const parsed = JSON.parse(jsonText) as {
      question: string
      options: string[]
      correctIndex: number
      explanation: string
    }[]

    const drafts = parsed
      .filter(
        (d) =>
          typeof d.question === 'string' &&
          Array.isArray(d.options) &&
          d.options.length >= 3 &&
          typeof d.correctIndex === 'number' &&
          d.correctIndex >= 0 &&
          d.correctIndex < d.options.length,
      )
      .map((d, i) => ({
        id: `ai-${competency.id}-${Date.now()}-${i}`,
        competencyId: competency.id,
        competencyName: competency.name,
        question: d.question,
        options: d.options,
        correctIndex: d.correctIndex,
        explanation: d.explanation ?? '',
      }))

    if (drafts.length === 0) {
      return NextResponse.json({ error: 'Model returned no valid drafts' }, { status: 502 })
    }
    return NextResponse.json({ drafts })
  } catch (err) {
    console.error('draft-questions failed:', err)
    return NextResponse.json({ error: 'Drafting failed' }, { status: 502 })
  }
}
