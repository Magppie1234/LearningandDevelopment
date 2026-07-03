import { NextResponse } from 'next/server'
import { bdDb, bdConfigured, notConfigured } from '@/lib/bd-api'

export const runtime = 'nodejs'

/**
 * GET /api/academies/bd/modules
 * List all BD modules with video-language status and quiz question counts.
 */
export async function GET() {
  if (!bdConfigured) return NextResponse.json(notConfigured(), { status: 503 })

  const [{ data: modules, error: mErr }, { data: videos, error: vErr }, { data: quiz, error: qErr }] =
    await Promise.all([
      bdDb.from('bd_modules').select('*').order('number'),
      bdDb.from('bd_module_videos').select('module_key, language_code, status'),
      bdDb.from('bd_quiz_questions').select('module_key'),
    ])

  const err = mErr || vErr || qErr
  if (err) return NextResponse.json({ error: err.message }, { status: 500 })

  const quizCounts = new Map<string, number>()
  for (const q of quiz ?? []) quizCounts.set(q.module_key, (quizCounts.get(q.module_key) ?? 0) + 1)

  const videosByModule = new Map<string, { language_code: string; status: string }[]>()
  for (const v of videos ?? []) {
    const list = videosByModule.get(v.module_key) ?? []
    list.push({ language_code: v.language_code, status: v.status })
    videosByModule.set(v.module_key, list)
  }

  const result = (modules ?? []).map((m) => ({
    ...m,
    video_languages: videosByModule.get(m.module_key) ?? [],
    quiz_question_count: quizCounts.get(m.module_key) ?? 0,
  }))

  return NextResponse.json({ academy: 'bd', modules: result })
}
