'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Flame,
  FolderOpen,
  Gauge,
  GraduationCap,
  HelpCircle,
  ListChecks,
  Target,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { BD_MODULES, BD_PASS_THRESHOLD, type BdCompetency } from '@/data/bd-academy'
import { getMonthId, getMonthIndex, getMonthLabel } from '@/data/bde-quiz'
import { useBdProgress } from '@/lib/bd-progress-store'
import { useBdDiagnostic } from '@/lib/bd-diagnostic-store'
import { useBdTitles, bdEffectiveTitle } from '@/lib/bd-title-store'
import { useQuizStore, bestFullAttempt, completionStreak, lifetimeStats } from '@/lib/quiz-store'
import {
  STATUS_VIZ,
  type StatusKey,
  KpiCard,
  ProgressBarsChart,
  Pictograph,
  StatTile,
  ChartCard,
} from '@/components/AcademyDashboardViz'

const COMP_COLOR: Record<string, string> = {
  'Product Knowledge': 'var(--status-ontrack)',
  'Objection Handling': 'var(--status-risk)',
  'Pricing Knowledge': '#8c6ba8',
  'Customer Communication': '#4a7fb0',
  'Trust & Credibility': '#b0894a',
}

const COMPETENCIES: BdCompetency[] = [
  'Product Knowledge',
  'Objection Handling',
  'Pricing Knowledge',
  'Customer Communication',
  'Trust & Credibility',
]

export default function BdDashboard() {
  const results = useBdProgress((s) => s.results)
  const completed = useBdProgress((s) => s.completedCount)()
  const pct = useBdProgress((s) => s.overallPct)()
  const overrides = useBdTitles((s) => s.overrides)
  const diagnostic = useBdDiagnostic()
  const attempts = useQuizStore((s) => s.attempts)

  const moduleData = useMemo(
    () =>
      BD_MODULES.map((m) => {
        const r = results[m.id]
        const status: StatusKey = r?.passed ? 'passed' : r?.viewed ? 'inProgress' : 'notStarted'
        const title = bdEffectiveTitle(overrides, m.id, m.title)
        const scorePct = r && r.total > 0 ? Math.round((r.bestScore / r.total) * 100) : null
        return { id: m.id, number: m.number, title, pct: scorePct, status }
      }),
    [results, overrides],
  )

  const statusCounts = useMemo(() => {
    const c: Record<StatusKey, number> = { passed: 0, inProgress: 0, notStarted: 0 }
    for (const d of moduleData) c[d.status]++
    return c
  }, [moduleData])

  // Performance score out of 10, like the reference dashboard's "7.2".
  const perfScore = useMemo(() => {
    const attempted = moduleData.filter((d) => d.pct !== null)
    if (attempted.length === 0) return null
    const avgPct = attempted.reduce((s, d) => s + (d.pct ?? 0), 0) / attempted.length
    return Math.round(avgPct) / 10
  }, [moduleData])

  const totalAttempts = useMemo(
    () => BD_MODULES.reduce((s, m) => s + (results[m.id]?.attempts ?? 0), 0),
    [results],
  )

  const nextModule = BD_MODULES.find((m) => !results[m.id]?.passed) ?? null

  const monthId = getMonthId()
  const monthIndex = getMonthIndex()
  const monthBest = bestFullAttempt(attempts, monthId)
  const streak = completionStreak(attempts, monthIndex)
  const lifetime = lifetimeStats(attempts)
  const baselineCorrect = diagnostic.results.filter((r) => r.correct).length

  return (
    <div className="max-w-[1000px] mx-auto space-y-8">
      {/* ── header ── */}
      <section className="pb-6 border-b border-[rgba(0,59,70,0.08)]">
        <Link
          href="/academy/business-development"
          className="inline-flex items-center gap-1.5 text-sm text-ink-tertiary hover:text-ink-primary transition-colors mb-3"
        >
          ← Business Development Executive
        </Link>
        <h1 className="font-serif text-4xl font-normal text-ink-primary">
          BD learning dashboard
        </h1>
        <p className="text-sm text-ink-secondary mt-2 max-w-[620px]">
          Track your Business Development academy progress — course details, quiz
          performance, module status and your diagnostic baseline in one place.
        </p>
      </section>

      {/* ── KPI row (reference: course / progress / performance) ── */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          icon={BookOpen}
          pillColor="rgb(var(--m-accent-copper))"
          label="Course name"
          value="Wellness sales foundations"
          sub={`${BD_MODULES.length} modules · Business Development`}
        />
        <KpiCard
          icon={Target}
          pillColor="var(--status-ontrack)"
          label="Progress"
          value={`${pct}%`}
          sub={`${completed}/${BD_MODULES.length} modules passed · ${totalAttempts} quiz attempts`}
          delay={0.08}
        />
        <KpiCard
          icon={Gauge}
          pillColor="#4a7fb0"
          label="Performance score"
          value={perfScore === null ? '—' : perfScore.toFixed(1)}
          sub={perfScore === null ? 'No quizzes taken yet' : 'Avg best quiz score, out of 10'}
          delay={0.16}
        />
      </section>

      {/* ── charts row (bar chart + pictograph) ── */}
      <section className="grid grid-cols-1 lg:grid-cols-[58%_1fr] gap-4">
        <ChartCard icon={ClipboardCheck} title="Quiz scores by module">
          <ProgressBarsChart
            data={moduleData.map((d) => ({
              id: d.id,
              label: `M${d.number}`,
              pct: d.pct,
              lines: [
                `M${d.number} · ${d.title}`,
                d.pct === null
                  ? 'Quiz not attempted'
                  : `Best score ${d.pct}%${d.status === 'passed' ? ' · passed' : ''}`,
              ],
            }))}
            refLine={{ pct: Math.round(BD_PASS_THRESHOLD * 100), label: `Pass ${Math.round(BD_PASS_THRESHOLD * 100)}%` }}
          />
        </ChartCard>
        <ChartCard icon={GraduationCap} title="Modules completed — each cap is one module">
          <Pictograph
            items={moduleData.map((d) => ({
              id: d.id,
              href: `/academy/business-development/modules?module=${d.id}`,
              label: `M${d.number}`,
              lines: [
                `M${d.number} · ${d.title}`,
                `${STATUS_VIZ[d.status].label}${d.pct !== null ? ` · best score ${d.pct}%` : ''}`,
              ],
              status: d.status,
            }))}
            icon={GraduationCap}
            counts={statusCounts}
            unitLabel="completed"
            cols={5}
          />
        </ChartCard>
      </section>

      {/* ── continue learning ── */}
      {nextModule ? (
        <Link
          href={`/academy/business-development/modules?module=${nextModule.id}`}
          className="group flex items-center justify-between gap-4 rounded-2xl border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream px-6 py-5 shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300"
        >
          <div className="flex items-center gap-4 min-w-0">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--status-ontrack-bg)' }}
            >
              <GraduationCap size={22} style={{ color: 'var(--status-ontrack)' }} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">
                Continue learning
              </p>
              <p className="text-sm font-semibold text-ink-primary truncate">
                Module {nextModule.number}:{' '}
                {bdEffectiveTitle(overrides, nextModule.id, nextModule.title)}
              </p>
              <p className="text-[13px] text-ink-tertiary mt-0.5 truncate">{nextModule.summary}</p>
            </div>
          </div>
          <ArrowRight size={18} className="shrink-0 text-ink-tertiary group-hover:text-ink-primary transition-colors" />
        </Link>
      ) : (
        <div
          className="rounded-2xl px-6 py-5 flex items-center gap-4"
          style={{ backgroundColor: 'var(--status-ontrack-bg)', color: 'var(--status-ontrack-fg)' }}
        >
          <CheckCircle2 size={22} className="shrink-0" />
          <div>
            <p className="text-sm font-semibold">All ten modules passed — academy complete.</p>
            <p className="text-[13px] mt-0.5">
              Keep sharp with the monthly quiz, or revisit any module below.
            </p>
          </div>
        </div>
      )}

      {/* ── competency mastery ── */}
      <section>
        <h2 className="font-serif text-2xl font-normal text-ink-primary mb-1">Competency mastery</h2>
        <p className="text-[13px] text-ink-tertiary mb-4">
          Each bar counts modules passed within that competency.
        </p>
        <div className="rounded-2xl border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream p-6 space-y-4 shadow-card">
          {COMPETENCIES.map((comp) => {
            const mods = BD_MODULES.filter((m) => m.competency === comp)
            const passed = mods.filter((m) => results[m.id]?.passed).length
            const compPct = mods.length ? Math.round((passed / mods.length) * 100) : 0
            const color = COMP_COLOR[comp]
            return (
              <div key={comp}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] font-medium text-ink-primary">{comp}</span>
                  <span className="text-[12px] font-semibold text-ink-secondary tabular-nums">
                    {passed}/{mods.length} modules
                  </span>
                </div>
                <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: `${color}22` }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${compPct}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── diagnostic baseline ── */}
      <section>
        <h2 className="font-serif text-2xl font-normal text-ink-primary mb-1">Diagnostic baseline</h2>
        {diagnostic.status === 'completed' ? (
          <>
            <p className="text-[13px] text-ink-tertiary mb-4">
              You scored {baselineCorrect}/{diagnostic.results.length} on the new-joiner
              diagnostic. Modules you missed at baseline and have since passed count as gaps closed.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {diagnostic.results.map((r) => {
                const passedNow = results[r.moduleId]?.passed ?? false
                const gapClosed = !r.correct && passedNow
                return (
                  <div
                    key={r.moduleId}
                    className="flex items-center gap-3 rounded-[12px] border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream px-4 py-3"
                  >
                    {r.correct ? (
                      <CheckCircle2 size={17} className="shrink-0" style={{ color: 'var(--status-ontrack)' }} />
                    ) : (
                      <XCircle size={17} className="shrink-0" style={{ color: 'var(--status-overdue)' }} />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-ink-primary truncate">
                        Module {r.moduleNumber}:{' '}
                        {bdEffectiveTitle(overrides, r.moduleId, r.moduleTitle)}
                      </p>
                      <p className="text-[11px] text-ink-tertiary">
                        Baseline {r.correct ? 'correct' : 'missed'}
                        {gapClosed && (
                          <span className="ml-1.5 font-semibold" style={{ color: 'var(--status-ontrack)' }}>
                            · gap closed
                          </span>
                        )}
                        {!r.correct && !passedNow && (
                          <span className="ml-1.5 font-semibold" style={{ color: 'var(--status-risk)' }}>
                            · focus here
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream px-6 py-5 flex flex-wrap items-center justify-between gap-4 shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-accent-copper/15 flex items-center justify-center shrink-0">
                <Target size={22} className="text-accent-copper" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-primary">
                  Take the 10-question diagnostic to set your baseline
                </p>
                <p className="text-[13px] text-ink-tertiary mt-0.5">
                  One question per module, not pass/fail — it shows which modules to focus on first.
                </p>
              </div>
            </div>
            <Link
              href="/academy/business-development/modules"
              className="shrink-0 rounded-full bg-ink-primary px-4 py-2 text-xs font-semibold text-parchment hover:opacity-90 transition"
            >
              Start it
            </Link>
          </div>
        )}
      </section>

      {/* ── module status list ── */}
      <section>
        <h2 className="font-serif text-2xl font-normal text-ink-primary mb-4">Modules</h2>
        <div className="rounded-2xl border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream overflow-hidden shadow-card">
          {BD_MODULES.map((m, i) => {
            const r = results[m.id]
            const status: StatusKey = r?.passed ? 'passed' : r?.viewed ? 'inProgress' : 'notStarted'
            const StatusIcon = STATUS_VIZ[status].icon
            const compColor = COMP_COLOR[m.competency]
            return (
              <Link
                key={m.id}
                href={`/academy/business-development/modules?module=${m.id}`}
                className={cn(
                  'group flex items-center gap-4 px-5 py-3.5 hover:bg-[rgba(0,59,70,0.03)] transition-colors',
                  i > 0 && 'border-t-[0.5px] border-[rgba(0,59,70,0.08)]',
                )}
              >
                <StatusIcon
                  size={18}
                  className="shrink-0"
                  style={{ color: STATUS_VIZ[status].color }}
                />
                <span className="text-xs font-medium text-ink-tertiary w-6 shrink-0 tabular-nums">
                  {String(m.number).padStart(2, '0')}
                </span>
                <span className="flex-1 min-w-0 text-sm font-medium text-ink-primary truncate">
                  {bdEffectiveTitle(overrides, m.id, m.title)}
                </span>
                <span
                  className="hidden sm:inline-block rounded-lg px-2 py-0.5 text-[11px] font-medium shrink-0"
                  style={{ backgroundColor: `${compColor}22`, color: compColor }}
                >
                  {m.competency}
                </span>
                <span className="hidden md:block w-24 text-right text-[12px] text-ink-tertiary tabular-nums shrink-0">
                  {r && r.total > 0 ? `Best ${r.bestScore}/${r.total}` : '—'}
                </span>
                <span className="hidden md:block w-20 text-right text-[12px] text-ink-tertiary tabular-nums shrink-0">
                  {r?.attempts ? `${r.attempts} att.` : ''}
                </span>
                <ArrowRight size={15} className="shrink-0 text-ink-tertiary/50 group-hover:text-ink-primary transition-colors" />
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── monthly quiz ── */}
      <section>
        <h2 className="font-serif text-2xl font-normal text-ink-primary mb-4">BDE Monthly Quiz</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatTile
            label={`${getMonthLabel()} best`}
            value={monthBest ? `${monthBest.score}/${monthBest.maxScore}` : '—'}
            sub={
              monthBest
                ? `${monthBest.correctCount}/${monthBest.totalQuestions} correct`
                : 'Full challenge not taken yet'
            }
          />
          <div className="rounded-[12px] border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream p-4 shadow-card">
            <p className="text-2xl font-bold text-ink-primary tabular-nums flex items-center gap-1.5">
              {streak}
              {streak > 0 && <Flame size={18} className="text-accent-copper" />}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-tertiary mt-0.5">
              Month streak
            </p>
            <p className="text-[11px] text-ink-tertiary mt-1">Consecutive full challenges</p>
          </div>
          <StatTile
            label="Lifetime accuracy"
            value={lifetime.totalAnswered ? `${lifetime.accuracy}%` : '—'}
            sub={
              lifetime.totalAnswered
                ? `${lifetime.totalCorrect}/${lifetime.totalAnswered} across ${lifetime.attemptsCount} attempts`
                : 'No attempts recorded'
            }
          />
        </div>
        <Link
          href="/academies/monthly-quiz"
          className="mt-3 inline-flex items-center gap-2 rounded-full border border-accent-copper/50 bg-accent-copper/5 px-4 py-2 text-[13px] font-semibold text-accent-copper hover:bg-accent-copper/10 transition-colors"
        >
          <ListChecks size={15} />
          {monthBest ? 'Retake the monthly quiz' : 'Take this month’s quiz'} →
        </Link>
      </section>

      {/* ── quick links ── */}
      <section className="pb-4">
        <h2 className="font-serif text-2xl font-normal text-ink-primary mb-4">Quick links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              href: '/academy/business-development/modules',
              icon: GraduationCap,
              title: 'All modules',
              sub: 'Wellness sales foundations — 10 modules + quizzes',
            },
            {
              href: '/academy/business-development/faq',
              icon: HelpCircle,
              title: 'BD FAQ bank',
              sub: 'All 69 questions with interactive visuals',
            },
            {
              href: '/academy/business-development?tab=resources',
              icon: FolderOpen,
              title: 'Resources',
              sub: 'Reading packs, team uploads and the video series',
            },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="group rounded-[12px] border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream p-4 shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300"
            >
              <l.icon size={18} className="text-ink-tertiary group-hover:text-ink-primary transition-colors" />
              <p className="text-sm font-semibold text-ink-primary mt-2">{l.title}</p>
              <p className="text-[12px] text-ink-tertiary mt-0.5">{l.sub}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
