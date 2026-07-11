'use client'

import { useState } from 'react'
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
import AcademyFilterTabs from './AcademyFilterTabs'
import StrongWeakModules from './StrongWeakModules'
import LearnerInsights from './LearnerInsights'

const BD_ID = process.env.NEXT_PUBLIC_BD_ACADEMY_ID ?? 'business-development'
const SALES_ID = process.env.NEXT_PUBLIC_SALES_ACADEMY_ID ?? 'sales'
function academyLabel(id: string): string {
  if (id === BD_ID) return 'Business Development'
  if (id === SALES_ID) return 'Sales'
  return id
}

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

  // Home-only domain filter (spec §5): All / one academy. View filter, not a route.
  const [filterAcademy, setFilterAcademy] = useState<string | null>(null)

  const useDemo = !REAL_AUTH && !viewingUserId && (load.status === 'unauthenticated' || load.status === 'unconfigured')

  const effective: { progress: ModuleProgressRow[]; insights: InsightSummaryRow[]; labels: Record<string, string> } | null =
    load.status === 'ready'
      ? { progress: load.progress, insights: load.insights, labels: {} }
      : useDemo
        ? { progress: demo.progress, insights: demo.insights, labels: demo.labels }
        : null

  const labelFor = (m: string) => moduleLabel?.(m) ?? effective?.labels[m] ?? m

  // Academy options for the home filter — distinct academies present in the data.
  const academyOptions =
    showGlobalExtras && effective
      ? [...new Set(effective.progress.map((p) => p.academy_id))].map((id) => ({
          id,
          label: academyLabel(id),
        }))
      : []

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

      {/* Domain / academy filter — home only, above the dashboard, right-aligned. */}
      {showGlobalExtras && academyOptions.length >= 2 && (
        <AcademyFilterTabs options={academyOptions} value={filterAcademy} onChange={setFilterAcademy} />
      )}

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
          // Apply the home domain filter (no-op when null or on scoped views).
          const fProgress = filterAcademy
            ? effective.progress.filter((p) => p.academy_id === filterAcademy)
            : effective.progress
          const fInsights = filterAcademy
            ? effective.insights.filter((i) => i.academy_id === filterAcademy)
            : effective.insights

          const s = summarizeProgress(fProgress, fInsights)
          const insightByModule = new Map(fInsights.map((i) => [i.module_id, i]))
          const withAttempts = fProgress.filter((p) => p.attempt_count > 0)
          const resumeMods = fProgress.filter((p) => p.status === 'in_progress')
          // Nothing studied yet → the report is just a "start to know" prompt.
          const nothingStarted = withAttempts.length === 0 && resumeMods.length === 0

          // Scale the demo week/month to the filtered academy's share of time.
          const allSec = effective.progress.reduce((a, p) => a + p.total_time_spent_seconds, 0)
          const filtSec = fProgress.reduce((a, p) => a + p.total_time_spent_seconds, 0)
          const scale = filterAcademy && allSec > 0 ? filtSec / allSec : 1
          const weekByDay = demo.weekByDayMinutes.map((m) => Math.round(m * scale))
          const monthByWeek = demo.monthByWeekMinutes.map((m) => Math.round(m * scale))
          const monthSec = Math.round(demo.monthTotalSeconds * scale)
          // Which modules the time went to (for the graph legend).
          const activeModuleLabels = fProgress
            .filter((p) => p.total_time_spent_seconds > 0)
            .map((p) => labelFor(p.module_id))

          // Fully empty (not even module rows to list) → a short prompt.
          if (fProgress.length === 0) {
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

              {showGlobalExtras ? (
                // ── Home "My Progress Report" ─────────────────────────────
                nothingStarted ? (
                  // Not studied anything yet → just show "start to know".
                  <div className="rounded-2xl border border-white/10 bg-stone-espresso p-8 text-center">
                    <GraduationCap size={26} className="mx-auto text-accent-copper mb-2" />
                    <p className="text-sm font-semibold text-stone-ivory">
                      You haven&apos;t started studying yet
                    </p>
                    <p className="text-sm text-stone-ivory/60 mt-1 max-w-[480px] mx-auto">
                      Open a module and take its quiz — this report will then show which quizzes you
                      retook or failed, which modules you rewatched, your time invested, and your
                      strong vs weak areas, live.
                    </p>
                    <a
                      href="/academies"
                      className="mt-4 inline-flex items-center rounded-full bg-accent-copper px-5 py-2 text-xs font-semibold text-stone-ink hover:brightness-95 transition"
                    >
                      Start to know
                    </a>
                  </div>
                ) : (
                  <>
                    {/* week + month with the Day/Week/Month toggle */}
                    {useDemo && (
                      <WeekMonthProgress
                        weekByDayMinutes={weekByDay}
                        monthByWeekMinutes={monthByWeek}
                        monthTotalSeconds={monthSec}
                        activeModules={activeModuleLabels}
                      />
                    )}

                    {/* Only the module(s) to resume — not the full list */}
                    {resumeMods.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-stone-ivory mb-2">
                          Continue where you left off
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {resumeMods.map((p) => (
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
                      </div>
                    )}

                    {/* Strong vs weak modules by quiz performance + retakes/fails */}
                    <StrongWeakModules progress={fProgress} labelFor={labelFor} />

                    {/* Insight-first learner analytics (AI insights, scores,
                        test analytics, readiness, revision recs, alerts). */}
                    <LearnerInsights progress={fProgress} insights={fInsights} />
                  </>
                )
              ) : (
                // ── Academy-scoped dashboard: week/month + strong/weak +
                //    insight cards + the full module list (cards = entry point).
                <>
                  {nothingStarted ? (
                    // Nothing studied here yet → say what the report will show.
                    <div className="rounded-2xl border border-white/10 bg-stone-espresso p-6 text-center">
                      <GraduationCap size={24} className="mx-auto text-accent-copper mb-2" />
                      <p className="text-sm font-semibold text-stone-ivory">Start to know</p>
                      <p className="text-sm text-stone-ivory/60 mt-1 max-w-[520px] mx-auto">
                        You haven&apos;t studied anything here yet. Open a module below and take its
                        quiz — this report will then show which quizzes you retook or failed, which
                        modules you rewatched, your time invested, and your strong vs weak areas, live.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* This academy's week/month trend (spec §9), with the
                          Day/Week/Month toggle and which-modules legend. */}
                      {useDemo && (
                        <WeekMonthProgress
                          weekByDayMinutes={weekByDay}
                          monthByWeekMinutes={monthByWeek}
                          monthTotalSeconds={monthSec}
                          activeModules={activeModuleLabels}
                        />
                      )}

                      {/* Strong vs weak + retakes/fails for this academy. */}
                      <StrongWeakModules progress={fProgress} labelFor={labelFor} />

                      {/* Insight-first learner analytics for this academy. */}
                      <LearnerInsights progress={fProgress} insights={fInsights} />
                    </>
                  )}

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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {fProgress.map((p) => (
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
              )}
            </>
          )
        })()}
    </section>
  )
}
