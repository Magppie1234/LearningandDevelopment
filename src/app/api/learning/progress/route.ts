import { NextResponse } from 'next/server'
import {
  ldConfigured,
  notConfigured,
  userClient,
  bearerFromRequest,
  actingUserId,
  getModuleProgress,
  getInsightSummaries,
} from '@/lib/learning-dashboard-api'

export const runtime = 'nodejs'

/**
 * GET /api/learning/progress?academyId=&userId=
 *
 * Scoping (enforced at the query layer + RLS):
 *  - No academyId → GLOBAL dashboard, all academies for the learner.
 *  - academyId    → ACADEMY-SCOPED dashboard, that academy only.
 *  - userId       → manager/admin viewing another learner. RLS's
 *    can_view_learning() decides if the caller may read those rows; if not,
 *    the query simply returns nothing (never another academy/learner's data).
 *
 * Read-only: this route never writes, so a manager/admin viewing a learner
 * cannot perturb that learner's time or progress data.
 */
export async function GET(req: Request) {
  if (!ldConfigured) return NextResponse.json(notConfigured(), { status: 503 })

  const token = bearerFromRequest(req)
  const client = userClient(token)
  const callerId = await actingUserId(client)
  if (!callerId) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const academyId = searchParams.get('academyId') ?? undefined
  const targetUserId = searchParams.get('userId') ?? callerId

  const [progress, insights] = await Promise.all([
    getModuleProgress(client, targetUserId, academyId),
    getInsightSummaries(client, targetUserId, academyId),
  ])
  if (progress.error) return NextResponse.json({ error: progress.error.message }, { status: 500 })
  if (insights.error) return NextResponse.json({ error: insights.error.message }, { status: 500 })

  return NextResponse.json({
    scope: academyId ? 'academy' : 'global',
    academyId: academyId ?? null,
    userId: targetUserId,
    readOnly: targetUserId !== callerId,
    progress: progress.data ?? [],
    insights: insights.data ?? [],
  })
}
