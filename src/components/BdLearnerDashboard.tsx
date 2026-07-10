'use client'

/**
 * BD Academy — Learner Progress Dashboard.
 *
 * A self-contained progress panel for the Business Development academy, modelled
 * on the "remote learning dashboard for tracking student progress" pattern:
 * top stat tiles (course, time spent, performance score), a per-module score
 * bar chart, and a lesson content & status donut. Rendered on /academies.
 *
 * Data is derived from the 10 approved BD modules (src/data/bd-academy.ts). The
 * per-learner progress figures are demo values here — when the Supabase
 * bd_module_progress views are wired in, swap `moduleProgress` for the live
 * query result; the chart/tile shapes stay identical.
 */

import { useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
} from 'recharts'
import {
  BookOpen,
  Clock,
  Gauge,
  CheckCircle2,
  ArrowRight,
  Flame,
} from 'lucide-react'
import { BD_MODULES, BD_COMPETENCIES } from '@/data/bd-academy'

/* Palette — matches the analytics recharts colours + brand ink. */
const INK = '#003b46'
const SAGE = '#7a8a7a'
const BLUE = '#a7c4d4'
const GOLD = '#c19a6b'
const ROSE = '#c4a48c'
const MUTED = 'rgba(0,59,70,0.12)'

type LessonStatus = 'completed' | 'in-progress' | 'not-started'

/**
 * Per-module learner progress. `score` is the best quiz score (0–100) for
 * completed modules; `status` drives the donut + tile counts. Demo data —
 * replace with the live bd_module_progress read.
 */
const moduleProgress: { score: number; status: LessonStatus }[] = [
  { score: 100, status: 'completed' },
  { score: 92, status: 'completed' },
  { score: 88, status: 'completed' },
  { score: 100, status: 'completed' },
  { score: 84, status: 'completed' },
  { score: 76, status: 'completed' },
  { score: 60, status: 'in-progress' },
  { score: 0, status: 'not-started' },
  { score: 0, status: 'not-started' },
  { score: 0, status: 'not-started' },
]

function barColor(status: LessonStatus, score: number) {
  if (status === 'in-progress') return GOLD
  if (status === 'not-started') return MUTED
  return score >= 90 ? INK : SAGE
}

export default function BdLearnerDashboard() {
  const {
    completed,
    inProgress,
    notStarted,
    avgScore,
    percentComplete,
    barData,
    donutData,
    competencyData,
  } = useMemo(() => {
    const completed = moduleProgress.filter((m) => m.status === 'completed')
    const inProgress = moduleProgress.filter((m) => m.status === 'in-progress')
    const notStarted = moduleProgress.filter((m) => m.status === 'not-started')

    const scored = completed.map((m) => m.score)
    const avgScore = scored.length
      ? Math.round(scored.reduce((s, n) => s + n, 0) / scored.length)
      : 0

    const percentComplete = Math.round(
      (completed.length / moduleProgress.length) * 100
    )

    const barData = BD_MODULES.map((mod, i) => ({
      name: `M${mod.number}`,
      title: mod.title,
      score: moduleProgress[i]?.score ?? 0,
      status: moduleProgress[i]?.status ?? 'not-started',
    }))

    const donutData = [
      { name: 'Completed', value: completed.length, color: INK },
      { name: 'In Progress', value: inProgress.length, color: GOLD },
      { name: 'Not Started', value: notStarted.length, color: BLUE },
    ]

    // Competency mastery = avg score of completed modules per competency.
    const competencyData = BD_COMPETENCIES.map((comp) => {
      const idxs = BD_MODULES.map((m, i) => (m.competency === comp ? i : -1)).filter(
        (i) => i >= 0
      )
      const done = idxs
        .map((i) => moduleProgress[i])
        .filter((m) => m.status === 'completed')
      const mastery = done.length
        ? Math.round(done.reduce((s, m) => s + m.score, 0) / done.length)
        : 0
      return { competency: comp, mastery, total: idxs.length, done: done.length }
    })

    return {
      completed,
      inProgress,
      notStarted,
      avgScore,
      percentComplete,
      barData,
      donutData,
      competencyData,
    }
  }, [])

  const performanceScore = (avgScore / 10).toFixed(1) // 0–10 scale, like the reference

  const stats = [
    {
      icon: BookOpen,
      label: 'Current course',
      value: 'Business Development',
      sub: `${BD_MODULES.length} modules · SilverStone mastery`,
      color: INK,
    },
    {
      icon: Clock,
      label: 'Time spent',
      value: '08:24:15',
      sub: 'This enrolment',
      color: SAGE,
    },
    {
      icon: Gauge,
      label: 'Performance score',
      value: `${performanceScore} / 10`,
      sub: `${avgScore}% avg quiz score`,
      color: GOLD,
    },
    {
      icon: CheckCircle2,
      label: 'Modules completed',
      value: `${completed.length} / ${moduleProgress.length}`,
      sub: `${percentComplete}% of the academy`,
      color: BLUE,
    },
  ]

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
      aria-label="Business Development learning progress"
      className="rounded-3xl border border-[rgba(0,59,70,0.1)] bg-cream p-6 sm:p-8 shadow-card"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-7">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-[1px] text-parchment">
              <Flame size={12} className="text-accent-gold" />
              BD Academy
            </span>
            <span className="text-[11px] font-medium uppercase tracking-[1px] text-ink-tertiary">
              Learner progress
            </span>
          </div>
          <h2 className="font-serif text-3xl font-normal text-ink-primary">
            Your Learning Dashboard
          </h2>
          <p className="text-sm text-ink-tertiary mt-1.5 max-w-[560px] leading-relaxed">
            Track your progress through the Business Development academy — module
            scores, time invested, and where you are in the SilverStone pitch mastery path.
          </p>
        </div>

        <Link
          href="/academy/business-development/modules"
          className="inline-flex items-center gap-2 rounded-full bg-accent-gold px-5 py-2.5 text-sm font-semibold text-ink-primary transition-all hover:-translate-y-px hover:brightness-95"
        >
          Continue learning
          <ArrowRight size={15} />
        </Link>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }}
            className="rounded-2xl border border-[rgba(0,59,70,0.08)] bg-parchment/60 p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: `${s.color}22` }}
              >
                <s.icon size={16} style={{ color: s.color }} />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">
                {s.label}
              </span>
            </div>
            <p className="text-lg font-semibold text-ink-primary leading-tight truncate">
              {s.value}
            </p>
            <p className="text-[11px] text-ink-tertiary mt-1 leading-snug">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
        {/* Module scores bar chart */}
        <div className="rounded-2xl border border-[rgba(0,59,70,0.08)] bg-parchment/40 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-ink-primary">Module Scores</h3>
            <span className="text-[11px] text-ink-tertiary">Best quiz score · out of 100</span>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,59,70,0.08)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#5a6b6e' }}
                  axisLine={{ stroke: 'rgba(0,59,70,0.12)' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#5a6b6e' }}
                  axisLine={false}
                  tickLine={false}
                />
                {/* recharts' Tooltip generics can't express formatters that
                    change the name per datum — both callbacks are detached. */}
                <Tooltip
                  cursor={{ fill: 'rgba(0,59,70,0.04)' }}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid rgba(0,59,70,0.1)',
                    fontSize: 12,
                    boxShadow: '0 8px 24px rgba(0,59,70,0.12)',
                  }}
                  labelFormatter={((_label: string, payload: Array<{ payload?: { title?: string } }>) =>
                    payload?.[0]?.payload?.title ?? _label) as never}
                  formatter={((value: number, _n: string, item: { payload?: { status?: LessonStatus } }) => {
                    const status = item?.payload?.status
                    if (status === 'not-started') return ['Not started', 'Status']
                    return [`${value}%`, status === 'in-progress' ? 'In progress' : 'Score']
                  }) as never}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {barData.map((d, i) => (
                    <Cell key={i} fill={barColor(d.status as LessonStatus, d.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="mt-3 flex flex-wrap items-center gap-4">
            {[
              { c: INK, l: 'Mastered (90+)' },
              { c: SAGE, l: 'Passed' },
              { c: GOLD, l: 'In progress' },
              { c: MUTED, l: 'Not started' },
            ].map((x) => (
              <span key={x.l} className="flex items-center gap-1.5 text-[11px] text-ink-tertiary">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: x.c }} />
                {x.l}
              </span>
            ))}
          </div>
        </div>

        {/* Lesson content & status donut */}
        <div className="rounded-2xl border border-[rgba(0,59,70,0.08)] bg-parchment/40 p-5">
          <h3 className="text-sm font-semibold text-ink-primary mb-4">
            Lesson Content &amp; Status
          </h3>
          <div className="relative h-[190px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={82}
                  paddingAngle={2}
                  stroke="none"
                >
                  {donutData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid rgba(0,59,70,0.1)',
                    fontSize: 12,
                  }}
                  formatter={(value: number, name) => [`${value} modules`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-serif text-3xl text-ink-primary leading-none">
                {percentComplete}%
              </span>
              <span className="text-[10px] uppercase tracking-wide text-ink-tertiary mt-1">
                Complete
              </span>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {donutData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-ink-secondary">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name}
                </span>
                <span className="font-semibold text-ink-primary">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Competency mastery */}
      <div className="mt-6 rounded-2xl border border-[rgba(0,59,70,0.08)] bg-parchment/40 p-5">
        <h3 className="text-sm font-semibold text-ink-primary mb-4">Competency Mastery</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          {competencyData.map((c) => (
            <div key={c.competency}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-medium text-ink-secondary">{c.competency}</span>
                <span className="text-xs font-semibold text-ink-primary">
                  {c.done > 0 ? `${c.mastery}%` : `${c.done}/${c.total}`}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[rgba(0,59,70,0.08)]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${c.mastery}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{
                    backgroundColor:
                      c.mastery >= 90 ? INK : c.mastery >= 70 ? SAGE : c.mastery > 0 ? GOLD : ROSE,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
