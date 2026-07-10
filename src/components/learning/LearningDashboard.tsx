'use client'

import { Eye, Layers, Clock, CheckCircle2, GraduationCap } from 'lucide-react'
import {
  useLearningProgress,
  formatDuration,
  type ViewerRole,
  type ModuleProgressRow,
  type InsightSummaryRow,
} from '@/lib/learning-dashboard-client'
import { summarizeProgress } from '@/lib/learning-summary'
import { useDemoLearningData } from '@/lib/learning-demo-data'
import InsightCard from './InsightCard'
import ModuleProgressCard from './ModuleProgressCard'
import WeekMonthProgress from './WeekMonthProgress'
import GenericResumeCTA from './GenericResumeCTA'

/**
 * Top-level learning dashboard — dark "Obsidian" (warm-stone) surface that sits
 * on the home canvas / kitchen background. `academyId` decides global vs
 * academy-scoped; `viewingUserId` + a non-learner `viewerRole` = read-only
 * "viewing someone else". Hard academy/user scoping happens at the API + RLS
 * layer — this only renders what the server returns for the requested scope.
 *
 * `showGlobalExtras` adds the home-only pieces (week/month trend, generic
 * "continue where you left off" CTA) that must NEVER appear on an academy-
 * scoped dashboard.
 *
 * Demo-login mode renders the demo bridge (real BD quiz activity over a
 * representative scenario); real auth (NEXT_PUBLIC_REAL_AUTH=1) swaps in live
 * Supabase data + Realtime.
 */
const REAL_AUTH = process.env.NEXT_PUBLIC_REAL_AUTH === '1'

export default function LearningDashboard({
  academyId,
  viewerRole,
  viewingUserId,
  moduleLabel,
  viewingLearnerName,
  onContinueModule,
  title,
  showGlobalExtras = false,
  resumeHref,
}: {
  /** Omit for the global (all-academy) dashboard; pass to scope to one academy. */
  academyId?: string
  viewerRole: ViewerRole
  viewingUserId?: string
  viewingLearnerName?: string
  moduleLabel?: (moduleId: string) => string
  onContinueModule?: (moduleId: string, position: number | null, kind: 'video' | 'scroll' | null) => void
  title?: string
  /** Home-only: week/month trend + generic resume CTA. Never on scoped views. */
  showGlobalExtras?: boolean
  /** Where the generic resume CTA links to (resolved by the host page). */
  resumeHref?: (academyId: string, moduleId: string) => string
}) {
  const load = useLearningProgress({ academyId, viewingUserId })
  const demo = useDemoLearningData(academyId)
  const readOnly = viewerRole !== 'learner' && Boolean(viewingUserId)

  const useDemo = !REAL_AUTH && !viewingUserId && (load.status === 'unauthenticated' || load.status === 'unconfigured')

  const effective: { progress: ModuleProgressRow[]; insights: InsightSummaryRow[]; labels: Record<string, string> } | null =
    load.status === 'ready'
      ? { progress: load.progress, insights: load.insights, labels: {} }
      : useDemo
        ? { progress: demo.progress, insights: demo.insights, labels: demo.labels }
        : null

  const labelFor = (m: string) => moduleLabel?.(m) ?? effective?.labels[m] ?? m

  return (
    <section className="space-y-5">
      {readOnly && (
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium"
          style={{ backgroundColor: 'var(--status-risk-bg)', color: 'var(--status-risk-fg)' }}
        >
          <Eye size={15} />
          Viewing: {viewingLearnerName ?? viewingUserId}&apos;s progress — read-only
        </div>
      )}

      {title && <h2 className="font-serif text-2xl font-normal text-stone-ivory">{title}</h2>}

      {load.status === 'loading' && (
        <div className="rounded-2xl border border-white/10 bg-stone-espresso p-6 animate-pulse h-28" />
      )}

      {!useDemo && load.status === 'unconfigured' && (
        <div className="rounded-2xl border border-white/10 bg-stone-espresso p-6 text-sm text-stone-ivory/70">
          <p className="font-semibold text-stone-ivory mb-1">Live dashboard pending backend</p>
          The learning dashboard reads from Supabase (sessions, attempts, insights). It activates
          once <code className="text-[12px] text-accent-copper">NEXT_PUBLIC_SUPABASE_URL/ANON_KEY</code>{' '}
          and real auth are configured.
        </div>
      )}

      {!useDemo && load.status === 'unauthenticated' && (
        <div className="rounded-2xl border border-white/10 bg-stone-espresso p-6 text-sm text-stone-ivory/70 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-stone-ivory mb-1">Sign in to track your learning</p>
            You&apos;re browsing as a guest. Sign in and this dashboard starts recording time,
            attempts, and insights — synced across devices.
          </div>
          <a href="/login" className="shrink-0 rounded-full bg-accent-copper px-4 py-2 text-xs font-semibold text-stone-ink hover:brightness-95 transition">
            Sign in
          </a>
        </div>
      )}

      {load.status === 'error' && (
        <div className="rounded-2xl border border-[rgba(200,130,85,0.4)] bg-accent-copper/10 p-6 text-sm text-stone-ivory/70">
          Couldn&apos;t load progress: {load.message}
        </div>
      )}

      {effective &&
        (() => {
          const s = summarizeProgress(effective.progress, effective.insights)
          const insightByModule = new Map(effective.insights.map((i) => [i.module_id, i]))
          const withAttempts = effective.progress.filter((p) => p.attempt_count > 0)

          // Fully empty (not even module rows to list) → a short prompt.
          if (effective.progress.length === 0) {
            return (
              <div className="rounded-2xl border border-white/10 bg-stone-espresso p-8 text-center">
                <GraduationCap size={26} className="mx-auto text-accent-copper mb-2" />
                <p className="text-sm font-semibold text-stone-ivory">Let&apos;s get started</p>
                <p className="text-sm text-stone-ivory/60 mt-1">
                  Open a module to begin — your time, scores, and insights will appear here as you learn.
                </p>
              </div>
            )
          }

          // Zero-state (Section 4): render the real zeroed dashboard — 0% tiles,
          // an empty week graph, module cards at 0% / "not attempted" / Start —
          // never fabricated numbers, and no insight cards until ≥1 attempt.
          return (
            <>
              {/* generic resume (home only) */}
              {showGlobalExtras && useDemo && demo.resume && (
                <GenericResumeCTA
                  resume={demo.resume}
                  href={resumeHref?.(demo.resume.academyId, demo.resume.moduleId) ?? '#'}
                />
              )}

              {/* headline stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: CheckCircle2, label: 'Complete', value: `${s.completionPct}%` },
                  { icon: Layers, label: 'In progress', value: String(s.inProgress) },
                  { icon: GraduationCap, label: 'Modules done', value: `${s.completed}/${s.totalModules}` },
                  { icon: Clock, label: 'Time invested', value: formatDuration(s.totalTimeSeconds) },
                ].map((k) => (
                  <div key={k.label} className="rounded-[12px] border border-white/10 bg-stone-espresso p-4">
                    <k.icon size={16} className="text-accent-copper" />
                    <p className="text-2xl font-bold text-stone-ivory tabular-nums mt-2">{k.value}</p>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-stone-ivory/45 mt-0.5">{k.label}</p>
                  </div>
                ))}
              </div>

              {/* week + month (home only) */}
              {showGlobalExtras && useDemo && (
                <WeekMonthProgress
                  weekByDayMinutes={demo.weekByDayMinutes}
                  monthTotalSeconds={demo.monthTotalSeconds}
                />
              )}

              {/* insight cards (only modules with ≥1 attempt) */}
              {withAttempts.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {withAttempts.map((p) => (
                    <InsightCard
                      key={`${p.academy_id}:${p.module_id}`}
                      moduleLabel={labelFor(p.module_id)}
                      progress={p}
                      insight={insightByModule.get(p.module_id)}
                    />
                  ))}
                </div>
              )}

              {/* all module progress rows */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {effective.progress.map((p) => (
                  <ModuleProgressCard
                    key={`${p.academy_id}:${p.module_id}`}
                    academyId={p.academy_id}
                    moduleLabel={labelFor(p.module_id)}
                    progress={p}
                    readOnly={readOnly || useDemo}
                    onContinue={(pr) => onContinueModule?.(pr.module_id, pr.last_position, pr.last_position_kind)}
                  />
                ))}
              </div>
            </>
          )
        })()}
    </section>
  )
}
