import { NextResponse } from 'next/server'
import { bdDb, bdConfigured, notConfigured, normalizeModuleKey } from '@/lib/bd-api'

export const runtime = 'nodejs'

/**
 * POST /api/academies/bd/modules/<moduleKey>/quiz/submit
 * Body: { "answers": { "<question_id>": <option_index>, ... } }
 *
 * Scoring happens entirely inside the bd_score_quiz DB function (SECURITY
 * DEFINER) — correct answers are never read into this route or sent to the
 * client. Returns score + pass/fail against the module's pass_threshold.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ moduleKey: string }> },
) {
  if (!bdConfigured) return NextResponse.json(notConfigured(), { status: 503 })
  const { moduleKey } = await params
  const key = normalizeModuleKey(moduleKey)

  let body: { answers?: Record<string, number | string> }
  try {
    body = (await req.json()) as { answers?: Record<string, number | string> }
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 })
  }

  // Coerce submitted option indices to ints so the RPC compares cleanly.
  const answers: Record<string, number> = {}
  for (const [qid, val] of Object.entries(body.answers ?? {})) {
    const n = typeof val === 'number' ? val : parseInt(String(val), 10)
    if (!Number.isNaN(n)) answers[qid] = n
  }

  const { data, error } = await bdDb.rpc('bd_score_quiz', {
    p_module_key: key,
    p_answers: answers,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
