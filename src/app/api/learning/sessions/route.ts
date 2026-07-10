import { NextResponse } from 'next/server'
import {
  ldConfigured,
  notConfigured,
  userClient,
  bearerFromRequest,
  actingUserId,
  startSession,
  type LearningActivityType,
} from '@/lib/learning-dashboard-api'

export const runtime = 'nodejs'

/**
 * POST /api/learning/sessions — open a learning session (study/video/quiz).
 * Time tracking is learner-only: the row is written as the authenticated user
 * (RLS: user_id = auth.uid()), so a manager/admin token cannot create a
 * session for someone else. Viewing never writes.
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
    activityType?: LearningActivityType
  } | null
  if (!body?.academyId || !body.moduleId || !body.activityType) {
    return NextResponse.json({ error: 'academyId, moduleId, activityType required' }, { status: 400 })
  }

  const { data, error } = await startSession(client, {
    userId: uid,
    academyId: body.academyId,
    moduleId: body.moduleId,
    activityType: body.activityType,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ session: data }, { status: 201 })
}
