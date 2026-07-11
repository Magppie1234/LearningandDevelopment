'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type {
  ModuleProgressRow,
  InsightSummaryRow,
  LearningActivityType,
  QuestionBreakdownItem,
} from '@/lib/learning-dashboard-api'

export type {
  ModuleProgressRow,
  InsightSummaryRow,
  LearningActivityType,
  QuestionBreakdownItem,
  LearningTrend,
  ModuleProgressStatus,
} from '@/lib/learning-dashboard-api'

export type ViewerRole = 'learner' | 'manager' | 'admin'

/** Attach the browser session's access token so API routes resolve auth.uid(). */
async function authedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return fetch(input, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  })
}

export type ProgressLoad =
  | { status: 'loading' }
  | { status: 'unconfigured' }
  | { status: 'unauthenticated' }
  | { status: 'error'; message: string }
  | {
      status: 'ready'
      scope: 'global' | 'academy'
      readOnly: boolean
      progress: ModuleProgressRow[]
      insights: InsightSummaryRow[]
    }

/**
 * Loads dashboard data for the current or a viewed learner. `academyId` scopes
 * to one academy (omit for global); `viewingUserId` targets another learner
 * (manager/admin). Distinguishes the demo/unconfigured (503) state so the UI
 * can explain itself rather than showing a hard error.
 */
export function useLearningProgress(opts: {
  academyId?: string
  viewingUserId?: string
}): ProgressLoad {
  const { academyId, viewingUserId } = opts
  const [state, setState] = useState<ProgressLoad>({ status: 'loading' })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    const params = new URLSearchParams()
    if (academyId) params.set('academyId', academyId)
    if (viewingUserId) params.set('userId', viewingUserId)

    authedFetch(`/api/learning/progress?${params.toString()}`)
      .then(async (res) => {
        if (!alive) return
        if (res.status === 503) return setState({ status: 'unconfigured' })
        if (res.status === 401) return setState({ status: 'unauthenticated' })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          return setState({ status: 'error', message: body.error ?? `HTTP ${res.status}` })
        }
        const body = await res.json()
        setState({
          status: 'ready',
          scope: body.scope,
          readOnly: body.readOnly,
          progress: body.progress ?? [],
          insights: body.insights ?? [],
        })
      })
      .catch((e) => alive && setState({ status: 'error', message: String(e) }))
    return () => {
      alive = false
    }
  }, [academyId, viewingUserId, tick])

  // Live sync (Section 3): re-fetch whenever this learner's rows change in
  // learning_sessions / quiz_attempts / module_progress. No session (demo) →
  // no channel, so this is inert until real auth is on. The subscription is
  // scoped to the target user (and academy when scoped) so cross-tab/device
  // updates land immediately without a manual refresh.
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null
    let alive = true
    supabase.auth.getSession().then(({ data }) => {
      const uid = viewingUserId ?? data.session?.user?.id
      if (!alive || !uid) return
      const bump = () => setTick((t) => t + 1)
      const filter = `user_id=eq.${uid}`
      channel = supabase.channel(`learning-${uid}-${academyId ?? 'global'}`)
      // module_attempts is where a quiz submission lands (it then triggers the
      // insight + module_progress rollups); include it so the report reacts the
      // instant an attempt is recorded.
      for (const table of [
        'learning_sessions',
        'quiz_attempts',
        'module_attempts',
        'module_progress',
        'insight_summary',
      ]) {
        channel.on('postgres_changes', { event: '*', schema: 'public', table, filter }, bump)
      }
      channel.subscribe()
    })
    return () => {
      alive = false
      if (channel) supabase.removeChannel(channel)
    }
  }, [academyId, viewingUserId])

  return state
}

/* ─────────────────────────  mutating helpers  ────────────────────────── */

export async function apiStartSession(input: {
  academyId: string
  moduleId: string
  activityType: LearningActivityType
}): Promise<{ id: string } | null> {
  const res = await authedFetch('/api/learning/sessions', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  if (!res.ok) return null
  const body = await res.json()
  return body.session ? { id: body.session.id } : null
}

export async function apiHeartbeatSession(
  sessionId: string,
  patch: {
    durationSeconds?: number
    videoPositionSeconds?: number | null
    scrollPosition?: number | null
    idleFlag?: boolean
    ended?: boolean
  },
): Promise<boolean> {
  const res = await authedFetch(`/api/learning/sessions/${sessionId}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
    keepalive: patch.ended, // survive tab close on the final write
  })
  return res.ok
}

export async function apiRecordAttempt(input: {
  academyId: string
  moduleId: string
  scorePct: number
  passed: boolean
  timeTakenSeconds?: number
  questionBreakdown: QuestionBreakdownItem[]
}): Promise<boolean> {
  const res = await authedFetch('/api/learning/attempts', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return res.ok
}

export function useResetModule() {
  return useCallback(async (academyId: string, moduleId: string): Promise<boolean> => {
    const res = await authedFetch(`/api/learning/progress/${moduleId}/reset`, {
      method: 'POST',
      body: JSON.stringify({ academyId }),
    })
    return res.ok
  }, [])
}

export interface RosterRow {
  userId: string
  academyId: string
  modules: number
  completed: number
  completionPct: number
  totalTimeSeconds: number
  trend: 'improving' | 'plateaued' | 'declining' | null
  lastActiveAt: string | null
}

export type RosterLoad =
  | { status: 'loading' }
  | { status: 'unconfigured' }
  | { status: 'unauthenticated' }
  | { status: 'error'; message: string }
  | { status: 'ready'; roster: RosterRow[] }

/** Admin/manager roster (RLS decides which learners are visible). */
export function useRoster(): RosterLoad {
  const [state, setState] = useState<RosterLoad>({ status: 'loading' })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    authedFetch('/api/learning/roster')
      .then(async (res) => {
        if (!alive) return
        if (res.status === 503) return setState({ status: 'unconfigured' })
        if (res.status === 401) return setState({ status: 'unauthenticated' })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          return setState({ status: 'error', message: body.error ?? `HTTP ${res.status}` })
        }
        const body = await res.json()
        setState({ status: 'ready', roster: body.roster ?? [] })
      })
      .catch((e) => alive && setState({ status: 'error', message: String(e) }))
    return () => {
      alive = false
    }
  }, [tick])

  // Live roster (Section 3): any learner's module_progress change re-fetches;
  // RLS already limits what this admin/manager may see. Inert without a session.
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null
    let alive = true
    supabase.auth.getSession().then(({ data }) => {
      if (!alive || !data.session) return
      channel = supabase.channel('learning-roster')
      for (const table of ['module_progress', 'insight_summary']) {
        channel.on('postgres_changes', { event: '*', schema: 'public', table }, () =>
          setTick((t) => t + 1),
        )
      }
      channel.subscribe()
    })
    return () => {
      alive = false
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  return state
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const hh = Math.floor(s / 3600)
  const mm = Math.floor((s % 3600) / 60)
  const ss = s % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}`
}
