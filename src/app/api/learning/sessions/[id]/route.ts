import { NextResponse } from 'next/server'
import {
  ldConfigured,
  notConfigured,
  userClient,
  bearerFromRequest,
  actingUserId,
  updateSession,
} from '@/lib/learning-dashboard-api'

export const runtime = 'nodejs'

/**
 * PATCH /api/learning/sessions/:id — heartbeat (every ~30s) or close a session.
 * Body: { durationSeconds?, videoPositionSeconds?, scrollPosition?, idleFlag?,
 * ended? }. Setting `ended: true` fires the DB rollup trigger that folds the
 * active duration into module_progress and captures the resume position.
 * RLS restricts the update to the owning learner.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!ldConfigured) return NextResponse.json(notConfigured(), { status: 503 })

  const { id } = await params
  const token = bearerFromRequest(req)
  const client = userClient(token)
  const uid = await actingUserId(client)
  if (!uid) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const body = (await req.json().catch(() => null)) as {
    durationSeconds?: number
    videoPositionSeconds?: number | null
    scrollPosition?: number | null
    idleFlag?: boolean
    ended?: boolean
  } | null
  if (!body) return NextResponse.json({ error: 'Body required' }, { status: 400 })

  const { data, error } = await updateSession(client, id, body)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ session: data })
}
