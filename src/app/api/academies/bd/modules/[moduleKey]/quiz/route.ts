import { NextResponse } from 'next/server'
import { bdDb, bdConfigured, notConfigured, normalizeModuleKey } from '@/lib/bd-api'

export const runtime = 'nodejs'

/**
 * GET /api/academies/bd/modules/<moduleKey>/quiz
 * Quiz questions + options for a module. The correct answer is NEVER included —
 * bd_quiz_questions is a view with no correct_index. Options are returned as an
 * indexed list; submit answers as { "<question_id>": <option_index> }.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ moduleKey: string }> },
) {
  if (!bdConfigured) return NextResponse.json(notConfigured(), { status: 503 })
  const { moduleKey } = await params
  const key = normalizeModuleKey(moduleKey)

  const { data, error } = await bdDb
    .from('bd_quiz_questions')
    .select('question_id, question_text, competency_tag, options')
    .eq('module_key', key)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const questions = (data ?? []).map((q) => ({
    id: q.question_id,
    question_text: q.question_text,
    competency_tag: q.competency_tag,
    options: (q.options as string[]).map((text, index) => ({ index, text })),
  }))

  return NextResponse.json({ module_key: key, questions })
}
