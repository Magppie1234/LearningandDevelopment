import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Server-side data access for the Personal Learning Dashboard API routes.
 *
 * Every query runs through a *request-scoped* client that forwards the caller's
 * Supabase access token, so Postgres RLS (migration 0019) decides what each
 * caller may read/write. That is the enforcement point — a manager/admin gets
 * SELECT-only on learners they oversee and cannot write another learner's data
 * even if a route tried to, because the DB policy rejects it.
 *
 * Mirrors src/lib/bd-api.ts: falls back to placeholders so imports never throw,
 * and exposes `ldConfigured` so routes can return 503 in demo mode (no Supabase
 * env / no real auth yet).
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const ldConfigured = Boolean(url && anon)

export function notConfigured() {
  return {
    error:
      'Supabase not configured (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY unset). The learning dashboard runs live once a project + auth are wired.',
  }
}

/** Pull the bearer token a Supabase-authenticated client sends. */
export function bearerFromRequest(req: Request): string | null {
  const h = req.headers.get('authorization') ?? ''
  return h.toLowerCase().startsWith('bearer ') ? h.slice(7).trim() : null
}

/** Request-scoped client carrying the caller's JWT so auth.uid()/RLS resolve. */
export function userClient(accessToken: string | null): SupabaseClient {
  return createClient(url ?? 'https://placeholder.supabase.co', anon ?? 'placeholder-anon', {
    auth: { persistSession: false, autoRefreshToken: false },
    global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {},
  })
}

/** Resolve the acting user id from the token; null when unauthenticated. */
export async function actingUserId(client: SupabaseClient): Promise<string | null> {
  const { data } = await client.auth.getUser()
  return data.user?.id ?? null
}

/* ─────────────────────────────  TYPES  ──────────────────────────────── */

export type LearningActivityType = 'study' | 'video' | 'quiz'
export type ModuleProgressStatus = 'not_started' | 'in_progress' | 'completed'
export type LearningTrend = 'improving' | 'plateaued' | 'declining'

export interface QuestionBreakdownItem {
  question_id: string
  topic_tag: string
  correct: boolean
}

export interface ModuleProgressRow {
  id: string
  user_id: string
  academy_id: string
  module_id: string
  status: ModuleProgressStatus
  last_position: number | null
  last_position_kind: 'video' | 'scroll' | null
  total_time_spent_seconds: number
  attempt_count: number
  /** Distinct video sessions opened (rewatches) — spec §4. Optional until the
   *  column is present; treat missing as 0. */
  video_watch_count?: number
  /** Best quiz score % across attempts (drives strong/weak). Optional. */
  best_score_pct?: number
  /** Quiz attempts that did not pass (retakes that failed). Optional. */
  failed_attempts?: number
  last_accessed_at: string | null
  updated_at: string
}

export interface InsightSummaryRow {
  id: string
  user_id: string
  academy_id: string
  module_id: string
  weak_topics: string[]
  strong_topics: string[]
  trend: LearningTrend | null
  updated_at: string
}

export interface LearningSessionRow {
  id: string
  user_id: string
  academy_id: string
  module_id: string
  activity_type: LearningActivityType
  started_at: string
  ended_at: string | null
  duration_seconds: number
  video_position_seconds: number | null
  scroll_position: number | null
  idle_flag: boolean
}

/* ────────────────────────  SCOPED QUERY HELPERS  ─────────────────────── */

/**
 * Progress rows for one learner. Pass `academyId` for the academy-scoped
 * dashboard — the filter is applied HERE, at the query layer, so a scoped
 * dashboard is physically incapable of returning another academy's rows.
 * Omit it for the global dashboard (all academies the learner is enrolled in).
 */
export async function getModuleProgress(
  client: SupabaseClient,
  userId: string,
  academyId?: string,
) {
  let q = client.from('module_progress').select('*').eq('user_id', userId)
  if (academyId) q = q.eq('academy_id', academyId)
  return q.order('updated_at', { ascending: false })
}

export async function getInsightSummaries(
  client: SupabaseClient,
  userId: string,
  academyId?: string,
) {
  let q = client.from('insight_summary').select('*').eq('user_id', userId)
  if (academyId) q = q.eq('academy_id', academyId)
  return q
}

export async function startSession(
  client: SupabaseClient,
  input: {
    userId: string
    academyId: string
    moduleId: string
    activityType: LearningActivityType
  },
) {
  return client
    .from('learning_sessions')
    .insert({
      user_id: input.userId,
      academy_id: input.academyId,
      module_id: input.moduleId,
      activity_type: input.activityType,
    })
    .select('*')
    .single()
}

/** Heartbeat / end. Setting `ended` fires the DB rollup trigger. */
export async function updateSession(
  client: SupabaseClient,
  sessionId: string,
  patch: {
    durationSeconds?: number
    videoPositionSeconds?: number | null
    scrollPosition?: number | null
    idleFlag?: boolean
    ended?: boolean
  },
) {
  const row: Record<string, unknown> = {}
  if (patch.durationSeconds !== undefined) row.duration_seconds = patch.durationSeconds
  if (patch.videoPositionSeconds !== undefined) row.video_position_seconds = patch.videoPositionSeconds
  if (patch.scrollPosition !== undefined) row.scroll_position = patch.scrollPosition
  if (patch.idleFlag !== undefined) row.idle_flag = patch.idleFlag
  if (patch.ended) row.ended_at = new Date().toISOString()
  return client.from('learning_sessions').update(row).eq('id', sessionId).select('*').single()
}

/** Record an attempt. attempt_number auto-derives from prior non-archived rows. */
export async function recordAttempt(
  client: SupabaseClient,
  input: {
    userId: string
    academyId: string
    moduleId: string
    scorePct: number
    passed: boolean
    timeTakenSeconds?: number
    questionBreakdown: QuestionBreakdownItem[]
  },
) {
  const { count } = await client
    .from('module_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', input.userId)
    .eq('academy_id', input.academyId)
    .eq('module_id', input.moduleId)
    .is('archived_at', null)

  return client
    .from('module_attempts')
    .insert({
      user_id: input.userId,
      academy_id: input.academyId,
      module_id: input.moduleId,
      attempt_number: (count ?? 0) + 1,
      score_pct: input.scorePct,
      passed: input.passed,
      time_taken_seconds: input.timeTakenSeconds ?? null,
      question_breakdown: input.questionBreakdown,
    })
    .select('*')
    .single()
}

/** Archive attempts/sessions and zero progress (never hard-deletes). */
export async function resetModule(client: SupabaseClient, academyId: string, moduleId: string) {
  return client.rpc('reset_module_progress', { p_academy: academyId, p_module: moduleId })
}
