import { NextResponse } from 'next/server'
import {
  ldConfigured,
  notConfigured,
  userClient,
  bearerFromRequest,
  actingUserId,
  type ModuleProgressRow,
  type InsightSummaryRow,
} from '@/lib/learning-dashboard-api'

export const runtime = 'nodejs'

/**
 * GET /api/learning/roster — admin/manager bird's-eye roster.
 *
 * Returns one aggregated row per (learner, academy): completion %, total time,
 * current trend, last active. RLS does the access control — an admin
 * (is_admin()) sees every learner across every academy; a manager sees only
 * learners in their manager scope / direct reports. We select the raw rows the
 * caller is *allowed* to read and aggregate in-process, so no privilege is
 * ever widened here beyond what the DB already permits.
 */
export async function GET(req: Request) {
  if (!ldConfigured) return NextResponse.json(notConfigured(), { status: 503 })

  const token = bearerFromRequest(req)
  const client = userClient(token)
  const uid = await actingUserId(client)
  if (!uid) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  // RLS filters these to rows the caller may oversee.
  const [{ data: progressRows, error: pErr }, { data: insightRows, error: iErr }] =
    await Promise.all([
      client.from('module_progress').select('*').returns<ModuleProgressRow[]>(),
      client.from('insight_summary').select('*').returns<InsightSummaryRow[]>(),
    ])
  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 })
  if (iErr) return NextResponse.json({ error: iErr.message }, { status: 500 })

  const trendByKey = new Map<string, InsightSummaryRow['trend']>()
  for (const r of insightRows ?? []) {
    // most-recent insight per learner+academy wins as the headline trend
    trendByKey.set(`${r.user_id}:${r.academy_id}`, r.trend)
  }

  type RosterRow = {
    userId: string
    academyId: string
    modules: number
    completed: number
    completionPct: number
    totalTimeSeconds: number
    trend: InsightSummaryRow['trend']
    lastActiveAt: string | null
  }
  const agg = new Map<string, RosterRow>()
  for (const r of (progressRows ?? []) as ModuleProgressRow[]) {
    const key = `${r.user_id}:${r.academy_id}`
    const row =
      agg.get(key) ??
      ({
        userId: r.user_id,
        academyId: r.academy_id,
        modules: 0,
        completed: 0,
        completionPct: 0,
        totalTimeSeconds: 0,
        trend: trendByKey.get(key) ?? null,
        lastActiveAt: null,
      } satisfies RosterRow)
    row.modules += 1
    if (r.status === 'completed') row.completed += 1
    row.totalTimeSeconds += r.total_time_spent_seconds
    if (r.last_accessed_at && (!row.lastActiveAt || r.last_accessed_at > row.lastActiveAt)) {
      row.lastActiveAt = r.last_accessed_at
    }
    agg.set(key, row)
  }
  const roster = [...agg.values()].map((r) => ({
    ...r,
    completionPct: r.modules ? Math.round((r.completed / r.modules) * 100) : 0,
  }))

  return NextResponse.json({ roster })
}
