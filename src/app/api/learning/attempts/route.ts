import { NextResponse } from 'next/server'
import {
  ldConfigured,
  notConfigured,
  userClient,
  bearerFromRequest,
  actingUserId,
  recordAttempt,
  type QuestionBreakdownItem,
} from '@/lib/learning-dashboard-api'

export const runtime = 'nodejs'

/**
 * POST /api/learning/attempts — record a quiz attempt. Every attempt is a new
 * row (never overwritten); the DB trigger recomputes the module's
 * insight_summary (weak/strong topics + trend) and bumps module_progress.
 * Learner-only via RLS.
 */
export async function POST(req: Request) {
  if (!ldConfigured) return NextResponse.json(notConfigured(), { status: 503 })

  const token = bearerFromRequest(req)
  const client = userClient(token)
  const uid = await actingUserId(client)
  if (!uid) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const body = (await req.json().catch(() => null)) as {
    academyId?: string
    moduleId?: string
    scorePct?: number
    passed?: boolean
    timeTakenSeconds?: number
    questionBreakdown?: QuestionBreakdownItem[]
  } | null
  if (
    !body?.academyId ||
    !body.moduleId ||
    typeof body.scorePct !== 'number' ||
    typeof body.passed !== 'boolean'
  ) {
    return NextResponse.json(
      { error: 'academyId, moduleId, scorePct, passed required' },
      { status: 400 },
    )
  }

  const { data, error } = await recordAttempt(client, {
    userId: uid,
    academyId: body.academyId,
    moduleId: body.moduleId,
    scorePct: body.scorePct,
    passed: body.passed,
    timeTakenSeconds: body.timeTakenSeconds,
    questionBreakdown: body.questionBreakdown ?? [],
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ attempt: data }, { status: 201 })
}
