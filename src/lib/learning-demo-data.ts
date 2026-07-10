'use client'

import { useMemo } from 'react'
import { BD_MODULES } from '@/data/bd-academy'
import { getAcademyById } from '@/data/academies'
import { useBdProgress } from '@/lib/bd-progress-store'
import type { ModuleProgressRow, InsightSummaryRow } from '@/lib/learning-dashboard-api'

/**
 * Demo-mode bridge for the live learning dashboard. While the portal runs on
 * demo login (no real accounts), the Supabase-backed dashboard has no session
 * to read, so we synthesize the same {progress, insights} shapes the API would
 * return — from the local BD quiz store (real when the learner has taken
 * quizzes) layered over a representative demo scenario, plus the Sales
 * academy's seeded course progress. The instant real auth is enabled
 * (NEXT_PUBLIC_REAL_AUTH=1) the dashboard reads live Supabase data instead and
 * this bridge is bypassed. Deterministic — same output every render.
 */

const BD_ACADEMY_ID = process.env.NEXT_PUBLIC_BD_ACADEMY_ID ?? 'business-development'
const SALES_ACADEMY_ID = process.env.NEXT_PUBLIC_SALES_ACADEMY_ID ?? 'sales'

type DemoStatus = 'completed' | 'in_progress' | 'not_started'

// Representative BD scenario — mirrors src/components/BdLearnerDashboard.tsx so
// the home dashboard and the academies-page panel agree. score = best quiz %,
// mins = synthesized time-on-task, attempts drives the trend.
const BD_DEMO: { score: number; status: DemoStatus; mins: number; attempts: number }[] = [
  { score: 100, status: 'completed', mins: 42, attempts: 1 },
  { score: 92, status: 'completed', mins: 51, attempts: 1 },
  { score: 88, status: 'completed', mins: 47, attempts: 2 },
  { score: 100, status: 'completed', mins: 38, attempts: 1 },
  { score: 84, status: 'completed', mins: 55, attempts: 2 },
  { score: 76, status: 'completed', mins: 61, attempts: 3 },
  { score: 60, status: 'in_progress', mins: 24, attempts: 2 },
  { score: 0, status: 'not_started', mins: 0, attempts: 0 },
  { score: 0, status: 'not_started', mins: 0, attempts: 0 },
  { score: 0, status: 'not_started', mins: 0, attempts: 0 },
]

const nowIso = () => new Date().toISOString()

function row(
  academyId: string,
  moduleId: string,
  status: DemoStatus,
  mins: number,
  attempts: number,
): ModuleProgressRow {
  return {
    id: `demo-${academyId}-${moduleId}`,
    user_id: 'demo',
    academy_id: academyId,
    module_id: moduleId,
    status,
    last_position: status === 'in_progress' ? 62 : null,
    last_position_kind: status === 'in_progress' ? 'scroll' : null,
    total_time_spent_seconds: Math.round(mins * 60),
    attempt_count: attempts,
    last_accessed_at: status === 'not_started' ? null : nowIso(),
    updated_at: nowIso(),
  }
}

export interface DemoResume {
  academyId: string
  moduleId: string
  label: string
  position: number | null
  kind: 'video' | 'scroll' | null
}

export interface DemoLearningData {
  progress: ModuleProgressRow[]
  insights: InsightSummaryRow[]
  labels: Record<string, string>
  /** Minutes invested per day for the current week (index 0 = Monday). */
  weekByDayMinutes: number[]
  /** Total seconds invested this month. */
  monthTotalSeconds: number
  /** Most-recently-accessed in-progress module for the generic resume CTA. */
  resume: DemoResume | null
}

// Deterministic weekly shape (share of a module's minutes spread across the
// last few days) — makes the week bars look like real daily activity.
const WEEK_SHAPE = [0.18, 0.14, 0.22, 0.1, 0.16, 0.12, 0.08]

/**
 * @param academyId  BD_ACADEMY_ID / SALES_ACADEMY_ID to scope, or undefined
 *                   for the global (all-academy) dashboard.
 */
export function useDemoLearningData(academyId?: string): DemoLearningData {
  const bdResults = useBdProgress((s) => s.results)

  return useMemo(() => {
    const progress: ModuleProgressRow[] = []
    const insights: InsightSummaryRow[] = []
    const labels: Record<string, string> = {}

    const wantBd = !academyId || academyId === BD_ACADEMY_ID
    const wantSales = !academyId || academyId === SALES_ACADEMY_ID

    // ── Business Development: real store overlaid on the demo scenario ──
    if (wantBd) {
      BD_MODULES.forEach((m, i) => {
        const demo = BD_DEMO[i] ?? { score: 0, status: 'not_started' as DemoStatus, mins: 0, attempts: 0 }
        const real = bdResults[m.id]

        // Real store activity wins over the demo baseline when present.
        let status: DemoStatus = demo.status
        let score = demo.score
        let attempts = demo.attempts
        let mins = demo.mins
        if (real && (real.viewed || real.attempts > 0)) {
          status = real.passed ? 'completed' : 'in_progress'
          score = real.total > 0 ? Math.round((real.bestScore / real.total) * 100) : demo.score
          attempts = real.attempts
          // Synthesize plausible time from real activity when the store has it.
          mins = Math.max(demo.mins, 8 + real.attempts * 6 + (real.passed ? 20 : 0))
        }

        labels[m.id] = `Module ${m.number}: ${m.title}`
        progress.push(row(BD_ACADEMY_ID, m.id, status, mins, attempts))

        if (attempts > 0) {
          const strong = status === 'completed' && score >= 88 ? [m.competency] : []
          const weak = score > 0 && score < 80 ? [m.competency] : []
          insights.push({
            id: `demo-ins-${m.id}`,
            user_id: 'demo',
            academy_id: BD_ACADEMY_ID,
            module_id: m.id,
            weak_topics: weak,
            strong_topics: strong,
            trend: attempts >= 2 ? 'improving' : null,
            updated_at: nowIso(),
          })
        }
      })
    }

    // ── Sales: from the seeded course catalogue (no quiz insights) ──
    if (wantSales) {
      const sales = getAcademyById('sales')
      for (const c of sales?.courses ?? []) {
        const status: DemoStatus =
          c.status === 'Completed' ? 'completed' : c.status === 'In Progress' ? 'in_progress' : 'not_started'
        const mins = Math.round((c.durationHours * c.progress) / 100 * 60)
        labels[c.id] = c.title
        progress.push(row(SALES_ACADEMY_ID, c.id, status, mins, status === 'not_started' ? 0 : 1))
      }
    }

    // Week / month rollups + the generic-resume target.
    const totalMins = progress.reduce((s, p) => s + p.total_time_spent_seconds / 60, 0)
    const weekMins = Math.round(totalMins * 0.32) // a slice of lifetime landed "this week"
    const weekByDayMinutes = WEEK_SHAPE.map((f) => Math.round(weekMins * f))
    const monthTotalSeconds = Math.round(totalMins * 0.62 * 60)

    const resumeRow = progress.find((p) => p.status === 'in_progress') ?? null
    const resume: DemoResume | null = resumeRow
      ? {
          academyId: resumeRow.academy_id,
          moduleId: resumeRow.module_id,
          label: labels[resumeRow.module_id] ?? resumeRow.module_id,
          position: resumeRow.last_position,
          kind: resumeRow.last_position_kind,
        }
      : null

    return { progress, insights, labels, weekByDayMinutes, monthTotalSeconds, resume }
  }, [academyId, bdResults])
}
