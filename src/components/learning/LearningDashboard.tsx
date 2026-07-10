'use client'

import { Eye, Layers, Clock, CheckCircle2, GraduationCap } from 'lucide-react'
import { useLearningProgress, formatDuration, type ViewerRole } from '@/lib/learning-dashboard-client'
import { summarizeProgress } from '@/lib/learning-summary'
import InsightCard from './InsightCard'
import ModuleProgressCard from './ModuleProgressCard'

/**
 * Top-level learning dashboard. Presence of `academyId` decides global vs
 * academy-scoped; `viewingUserId` + a non-learner `viewerRole` put it in
 * read-only "viewing someone else" mode (actions hidden, banner shown). The
 * hard academy/user scoping happens at the API + RLS layer — this component
 * only ever renders what the server returns for the requested scope.
 */
export default function LearningDashboard({
  academyId,
  viewerRole,
  viewingUserId,
  moduleLabel,
  viewingLearnerName,
  onContinueModule,
  title,
}: {
  /** Omit for the global (all-academy) dashboard; pass to scope to one academy. */
  academyId?: string
  viewerRole: ViewerRole
  /** Set when a manager/admin is viewing another learner's dashboard. */
  viewingUserId?: string
  viewingLearnerName?: string
  /** Human label for a module_id (e.g. "Module 3: …"). */
  moduleLabel?: (moduleId: string) => string
  onContinueModule?: (moduleId: string, position: number | null, kind: 'video' | 'scroll' | null) => void
  title?: string
}) {
  const load = useLearningProgress({ academyId, viewingUserId })
  const readOnly = viewerRole !== 'learner' && Boolean(viewingUserId)
  const labelFor = (m: string) => moduleLabel?.(m) ?? m

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

      {title && <h2 className="font-serif text-2xl font-normal text-ink-primary">{title}</h2>}

      {load.status === 'loading' && (
        <div className="rounded-2xl border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream p-6 animate-pulse h-28" />
      )}

      {load.status === 'unconfigured' && (
        <div className="rounded-2xl border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream p-6 text-sm text-ink-secondary">
          <p className="font-semibold text-ink-primary mb-1">Live dashboard pending backend</p>
          The learning dashboard reads from Supabase (sessions, attempts, insights). It activates
          once <code className="text-[12px]">NEXT_PUBLIC_SUPABASE_URL/ANON_KEY</code> and real auth
          are configured — the schema, API routes, and RLS are in place and waiting.
        </div>
      )}

      {load.status === 'unauthenticated' && (
        <div className="rounded-2xl border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream p-6 text-sm text-ink-secondary flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-ink-primary mb-1">Sign in to track your learning</p>
            You&apos;re browsing as a guest. Sign in with your Magppie email and this dashboard
            starts recording time, quiz attempts, and insights — synced across devices.
          </div>
          <a
            href="/login"
            className="shrink-0 rounded-full bg-ink-primary px-4 py-2 text-xs font-semibold text-parchment hover:opacity-90 transition"
          >
            Sign in
          </a>
        </div>
      )}

      {load.status === 'error' && (
        <div className="rounded-2xl border-[0.5px] border-[rgba(186,117,23,0.4)] bg-accent-copper/5 p-6 text-sm text-ink-secondary">
          Couldn&apos;t load progress: {load.message}
        </div>
      )}

      {load.status === 'ready' &&
        (() => {
          const s = summarizeProgress(load.progress, load.insights)
          const insightByModule = new Map(load.insights.map((i) => [i.module_id, i]))
          const withAttempts = load.progress.filter((p) => p.attempt_count > 0)

          if (load.progress.length === 0) {
            return (
              <div className="rounded-2xl border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream p-8 text-center">
                <GraduationCap size={26} className="mx-auto text-ink-tertiary mb-2" />
                <p className="text-sm text-ink-secondary">
                  No learning activity yet{academyId ? ' in this academy' : ''}. Open a module to start tracking.
                </p>
              </div>
            )
          }

          return (
            <>
              {/* headline stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: CheckCircle2, label: 'Complete', value: `${s.completionPct}%` },
                  { icon: Layers, label: 'In progress', value: String(s.inProgress) },
                  { icon: GraduationCap, label: 'Modules done', value: `${s.completed}/${s.totalModules}` },
                  { icon: Clock, label: 'Time invested', value: formatDuration(s.totalTimeSeconds) },
                ].map((k) => (
                  <div key={k.label} className="rounded-[12px] border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream p-4 shadow-card">
                    <k.icon size={16} className="text-ink-tertiary" />
                    <p className="text-2xl font-bold text-ink-primary tabular-nums mt-2">{k.value}</p>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-ink-tertiary mt-0.5">{k.label}</p>
                  </div>
                ))}
              </div>

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
                {load.progress.map((p) => (
                  <ModuleProgressCard
                    key={`${p.academy_id}:${p.module_id}`}
                    academyId={p.academy_id}
                    moduleLabel={labelFor(p.module_id)}
                    progress={p}
                    readOnly={readOnly}
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
