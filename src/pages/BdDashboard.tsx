'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
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

/* Status palette for the charts — the app's reserved status tokens, so both
   themes stay on-brand. Identity is never color-alone: every use below pairs
   the swatch with an icon and a text label. */
const STATUS_VIZ = {
  passed: { color: 'var(--status-ontrack)', label: 'Passed', icon: CheckCircle2 },
  inProgress: { color: 'rgb(var(--m-accent-copper))', label: 'In progress', icon: ClipboardCheck },
  notStarted: { color: 'rgb(var(--m-ink-tertiary))', label: 'Not started', icon: Circle },
} as const

type StatusKey = keyof typeof STATUS_VIZ

/* ─────────────────── KPI card (reference: pill label + value) ─────────────────── */
function KpiCard({
  icon: Icon,
  pillColor,
  label,
  value,
  sub,
}: {
  icon: typeof BookOpen
  pillColor: string
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="rounded-2xl border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream p-5 flex flex-col items-center text-center">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center mb-3 border"
        style={{ borderColor: pillColor, color: pillColor }}
      >
        <Icon size={19} />
      </div>
      <span
        className="inline-block rounded-full px-3.5 py-1 text-[11px] font-semibold text-parchment"
        style={{ backgroundColor: pillColor }}
      >
        {label}
      </span>
      <p className="mt-3 text-xl font-bold text-ink-primary tabular-nums leading-tight">{value}</p>
      {sub && <p className="text-[11px] text-ink-tertiary mt-1">{sub}</p>}
    </div>
  )
}

/* ─────────────────── bar chart: best quiz score per module ─────────────────── */
function ModuleScoresChart({
  data,
}: {
  data: { id: string; number: number; title: string; pct: number | null; passed: boolean }[]
}) {
  const [hover, setHover] = useState<string | null>(null)
  const gridLines = [0, 20, 40, 60, 80, 100]
  const passPct = Math.round(BD_PASS_THRESHOLD * 100)

  return (
    <div>
      <div className="relative h-[190px]">
        {/* grid */}
        {gridLines.map((g) => (
          <div
            key={g}
            className="absolute inset-x-0 flex items-center gap-2"
            style={{ bottom: `${(g / 100) * 100}%` }}
          >
            <span className="w-7 text-right text-[10px] text-ink-tertiary tabular-nums -translate-y-1/2">
              {g}
            </span>
            <div
              className={cn('flex-1 border-t', g === passPct ? 'border-dashed' : '')}
              style={{
                borderColor:
                  g === passPct ? 'var(--status-ontrack)' : 'rgba(0,59,70,0.07)',
              }}
            />
          </div>
        ))}
        {/* pass-line tag */}
        <span
          className="absolute right-0 -translate-y-1/2 rounded px-1.5 py-0.5 text-[9px] font-semibold"
          style={{
            bottom: `${passPct}%`,
            backgroundColor: 'var(--status-ontrack-bg)',
            color: 'var(--status-ontrack-fg)',
          }}
        >
          Pass {passPct}%
        </span>
        {/* bars */}
        <div className="absolute inset-y-0 left-9 right-0 flex items-end justify-between gap-[6px] px-1">
          {data.map((d) => (
            <div
              key={d.id}
              className="relative flex-1 h-full flex items-end justify-center"
              onMouseEnter={() => setHover(d.id)}
              onMouseLeave={() => setHover(null)}
            >
              {d.pct === null ? (
                <div className="w-full max-w-[26px] h-[3px] rounded-full bg-[rgba(0,59,70,0.10)]" />
              ) : (
                <div
                  className="w-full max-w-[26px] rounded-t-[4px] transition-all duration-700"
                  style={{
                    height: `${Math.max(d.pct, 2)}%`,
                    backgroundColor: 'rgb(var(--m-accent-copper))',
                  }}
                />
              )}
              {hover === d.id && (
                <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap rounded-lg bg-ink-primary px-2.5 py-1.5 text-[11px] text-parchment shadow-card pointer-events-none">
                  <span className="font-semibold">M{d.number}</span> · {d.title}
                  <br />
                  {d.pct === null ? 'Quiz not attempted' : `Best score ${d.pct}%${d.passed ? ' · passed' : ''}`}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* x labels */}
      <div className="mt-1.5 ml-9 flex justify-between gap-[6px] px-1">
        {data.map((d) => (
          <span key={d.id} className="flex-1 text-center text-[10px] text-ink-tertiary tabular-nums">
            M{d.number}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────── pictograph: one cap per module ───────────────────
   Each GraduationCap is one module, colored by its status — the fastest
   read of "how many taken vs completed". Hover shows the module + score;
   click opens it. Identity never rides on color alone: the legend pairs
   every color with an icon, label and count. */
function ModulePictograph({
  data,
  counts,
}: {
  data: { id: string; number: number; title: string; pct: number | null; status: StatusKey }[]
  counts: Record<StatusKey, number>
}) {
  const [hover, setHover] = useState<string | null>(null)
  const [hoverStatus, setHoverStatus] = useState<StatusKey | null>(null)
  const order: StatusKey[] = ['passed', 'inProgress', 'notStarted']

  return (
    <div>
      <p className="text-[28px] font-bold text-ink-primary tabular-nums leading-none">
        {counts.passed}
        <span className="text-base font-semibold text-ink-tertiary"> of {data.length} completed</span>
      </p>
      <div className="mt-4 grid grid-cols-5 gap-2">
        {data.map((d) => {
          const dimmed = hoverStatus !== null && d.status !== hoverStatus
          return (
            <Link
              key={d.id}
              href={`/academy/business-development/modules?module=${d.id}`}
              onMouseEnter={() => setHover(d.id)}
              onMouseLeave={() => setHover(null)}
              className="relative flex flex-col items-center rounded-xl py-2.5 hover:bg-[rgba(0,59,70,0.04)] transition-all"
              style={{ opacity: dimmed ? 0.3 : 1 }}
              aria-label={`Module ${d.number}: ${d.title} — ${STATUS_VIZ[d.status].label}`}
            >
              <GraduationCap
                size={30}
                strokeWidth={d.status === 'notStarted' ? 1.5 : 2.2}
                style={{ color: STATUS_VIZ[d.status].color }}
              />
              <span className="mt-1 text-[10px] font-medium text-ink-tertiary tabular-nums">
                M{d.number}
              </span>
              {hover === d.id && (
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap rounded-lg bg-ink-primary px-2.5 py-1.5 text-[11px] text-parchment shadow-card pointer-events-none">
                  <span className="font-semibold">M{d.number}</span> · {d.title}
                  <br />
                  {STATUS_VIZ[d.status].label}
                  {d.pct !== null && ` · best score ${d.pct}%`}
                </div>
              )}
            </Link>
          )
        })}
      </div>
      {/* legend — icon + label + count, never color alone */}
      <div className="mt-4 pt-4 border-t border-[rgba(0,59,70,0.08)] space-y-2">
        {order.map((k) => {
          const { color, label, icon: Icon } = STATUS_VIZ[k]
          return (
            <button
              key={k}
              type="button"
              onMouseEnter={() => setHoverStatus(k)}
              onMouseLeave={() => setHoverStatus(null)}
              className="flex items-center gap-2.5 text-left w-full"
            >
              <span className="w-3 h-3 rounded-[3px] shrink-0" style={{ backgroundColor: color }} />
              <Icon size={14} className="shrink-0 text-ink-tertiary" />
              <span className="text-[13px] text-ink-secondary flex-1">{label}</span>
              <span className="text-[13px] font-semibold text-ink-primary tabular-nums">
                {counts[k]}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ─────────────────── small stat tile ─────────────────── */
function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-[12px] border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream p-4">
      <p className="text-2xl font-bold text-ink-primary tabular-nums">{value}</p>
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink-tertiary mt-0.5">{label}</p>
      {sub && <p className="text-[11px] text-ink-tertiary mt-1">{sub}</p>}
    </div>
  )
}

/* ═══════════════════════════════ page ═══════════════════════════════ */
export default function BdDashboard() {
  const results = useBdProgress((s) => s.results)
  const completed = useBdProgress((s) => s.completedCount)()
  const pct = useBdProgress((s) => s.overallPct)()
  const overrides = useBdTitles((s) => s.overrides)
  const diagnostic = useBdDiagnostic()
  const attempts = useQuizStore((s) => s.attempts)

  const scoreData = useMemo(
    () =>
      BD_MODULES.map((m) => {
        const r = results[m.id]
        const status: StatusKey = r?.passed ? 'passed' : r?.viewed ? 'inProgress' : 'notStarted'
        return {
          id: m.id,
          number: m.number,
          title: bdEffectiveTitle(overrides, m.id, m.title),
          pct: r && r.total > 0 ? Math.round((r.bestScore / r.total) * 100) : null,
          passed: r?.passed ?? false,
          status,
        }
      }),
    [results, overrides],
  )

  const statusCounts = useMemo(() => {
    const c: Record<StatusKey, number> = { passed: 0, inProgress: 0, notStarted: 0 }
    for (const m of BD_MODULES) {
      const r = results[m.id]
      if (r?.passed) c.passed++
      else if (r?.viewed) c.inProgress++
      else c.notStarted++
    }
    return c
  }, [results])

  // Performance score out of 10, like the reference dashboard's "7.2".
  const perfScore = useMemo(() => {
    const attempted = scoreData.filter((d) => d.pct !== null)
    if (attempted.length === 0) return null
    const avgPct = attempted.reduce((s, d) => s + (d.pct ?? 0), 0) / attempted.length
    return Math.round(avgPct) / 10
  }, [scoreData])

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
          <ArrowLeft size={15} /> Business Development Executive
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
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
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
        />
        <KpiCard
          icon={Gauge}
          pillColor="#4a7fb0"
          label="Performance score"
          value={perfScore === null ? '—' : perfScore.toFixed(1)}
          sub={perfScore === null ? 'No quizzes taken yet' : 'Avg best quiz score, out of 10'}
        />
      </motion.section>

      {/* ── charts row (reference: bar chart + donut) ── */}
      <section className="grid grid-cols-1 lg:grid-cols-[58%_1fr] gap-4">
        <div className="rounded-2xl border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream p-5">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardCheck size={16} className="text-ink-tertiary" />
            <h2 className="text-sm font-semibold text-ink-primary">Quiz scores by module</h2>
          </div>
          <ModuleScoresChart data={scoreData} />
        </div>
        <div className="rounded-2xl border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream p-5">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap size={16} className="text-ink-tertiary" />
            <h2 className="text-sm font-semibold text-ink-primary">
              Modules completed — each cap is one module
            </h2>
          </div>
          <ModulePictograph data={scoreData} counts={statusCounts} />
        </div>
      </section>

      {/* ── continue learning ── */}
      {nextModule ? (
        <Link
          href={`/academy/business-development/modules?module=${nextModule.id}`}
          className="group flex items-center justify-between gap-4 rounded-2xl border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream px-6 py-5 hover:shadow-card transition-shadow"
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
        <div className="rounded-2xl border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream p-6 space-y-4">
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
          <div className="rounded-2xl border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream px-6 py-5 flex flex-wrap items-center justify-between gap-4">
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
        <div className="rounded-2xl border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream overflow-hidden">
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
          <div className="rounded-[12px] border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream p-4">
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
              className="group rounded-[12px] border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream p-4 hover:shadow-card transition-shadow"
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
