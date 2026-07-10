import { NextResponse } from 'next/server'
import {
  ldConfigured,
  notConfigured,
  userClient,
  bearerFromRequest,
  actingUserId,
  resetModule,
} from '@/lib/learning-dashboard-api'

export const runtime = 'nodejs'

/**
 * POST /api/learning/progress/:moduleId/reset  Body: { academyId }
 *
 * Archives (never hard-deletes) the learner's attempts + sessions for this
 * module and zeroes module_progress; insight trends restart. Owner-only: the
 * DB function scopes to auth.uid(), so a manager/admin can never reset another
 * learner's module.
 */
export async function POST(req: Request, { params }: { params: Promise<{ moduleId: string }> }) {
  if (!ldConfigured) return NextResponse.json(notConfigured(), { status: 503 })

  const { moduleId } = await params
  const token = bearerFromRequest(req)
  const client = userClient(token)
  const uid = await actingUserId(client)
  if (!uid) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const body = (await req.json().catch(() => null)) as { academyId?: string } | null
  if (!body?.academyId) return NextResponse.json({ error: 'academyId required' }, { status: 400 })

  const { error } = await resetModule(client, body.academyId, moduleId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, moduleId, academyId: body.academyId })
}
