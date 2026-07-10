'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  Crown,
  FolderOpen,
  Medal,
  Target,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getAcademyById, type Course, type CourseLevel, type CourseStatus } from '@/data/academies'
import {
  STATUS_VIZ,
  type StatusKey,
  KpiCard,
  ProgressBarsChart,
  Pictograph,
  StatTile,
  ChartCard,
} from '@/components/AcademyDashboardViz'

const LEVELS: CourseLevel[] = ['Beginner', 'Intermediate', 'Advanced']
const LEVEL_COLOR: Record<CourseLevel, string> = {
  Beginner: 'var(--status-ontrack)',
  Intermediate: '#4a7fb0',
  Advanced: '#8c6ba8',
}

function statusKey(status: CourseStatus): StatusKey {
  return status === 'Completed' ? 'passed' : status === 'In Progress' ? 'inProgress' : 'notStarted'
}

export default function SalesDashboard() {
  const academy = getAcademyById('sales')
  const courses: Course[] = useMemo(() => academy?.courses ?? [], [academy])

  const overallPct = courses.length
    ? Math.round(courses.reduce((s, c) => s + c.progress, 0) / courses.length)
    : 0
  const completedCount = courses.filter((c) => c.status === 'Completed').length
  const startedCount = courses.filter((c) => c.progress > 0).length

  const hoursLearned =
    Math.round(
      courses
        .filter((c) => c.progress > 0)
        .reduce((s, c) => s + (c.durationHours * c.progress) / 100, 0) * 10,
    ) / 10

  const statusCounts = useMemo(() => {
    const c: Record<StatusKey, number> = { passed: 0, inProgress: 0, notStarted: 0 }
    for (const course of courses) c[statusKey(course.status)]++
    return c
  }, [courses])

  const nextCourse =
    courses.find((c) => c.status === 'In Progress') ??
    courses.find((c) => c.status === 'Not Started') ??
    null

  if (!academy) return null

  return (
    <div className="max-w-[1000px] mx-auto space-y-8">
      {/* ── header ── */}
      <section className="pb-6 border-b border-[rgba(0,59,70,0.08)]">
        <Link
          href="/academy/sales"
          className="inline-flex items-center gap-1.5 text-sm text-ink-tertiary hover:text-ink-primary transition-colors mb-3"
        >
          ← Sales Academy
        </Link>
        <h1 className="font-serif text-4xl font-normal text-ink-primary">
          Sales learning dashboard
        </h1>
        <p className="text-sm text-ink-secondary mt-2 max-w-[620px]">
          Track your Sales Academy progress — courses taken and completed, hours
          invested, and where to pick up next, all in one place.
        </p>
      </section>

      {/* ── KPI row (reference: course / time spent / progress) ── */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          icon={BookOpen}
          pillColor="rgb(var(--m-accent-copper))"
          label="Academy"
          value={academy.name}
          sub={`${courses.length} courses · ${academy.totalHours}h total · ${academy.levelRange}`}
        />
        <KpiCard
          icon={Target}
          pillColor="var(--status-ontrack)"
          label="Progress"
          value={`${overallPct}%`}
          sub={`${completedCount}/${courses.length} courses completed · ${startedCount} taken`}
          delay={0.08}
        />
        <KpiCard
          icon={Clock}
          pillColor="#4a7fb0"
          label="Hours learned"
          value={hoursLearned ? `${hoursLearned}h` : '—'}
          sub={hoursLearned ? `of ${academy.totalHours}h of course content` : 'No courses started yet'}
          delay={0.16}
        />
      </section>

      {/* ── charts row (bar chart + pictograph) ── */}
      <section className="grid grid-cols-1 lg:grid-cols-[58%_1fr] gap-4">
        <ChartCard icon={BarChart3} title="Progress by course">
          <ProgressBarsChart
            data={courses.map((c, i) => ({
              id: c.id,
              label: `C${i + 1}`,
              pct: c.progress > 0 ? c.progress : null,
              lines: [
                `C${i + 1} · ${c.title}`,
                c.progress > 0
                  ? `${c.progress}% complete · ${c.level} · ${c.duration}`
                  : `Not started · ${c.level} · ${c.duration}`,
              ],
            }))}
          />
        </ChartCard>
        <ChartCard icon={Target} title="Courses completed — each target is one course">
          <Pictograph
            items={courses.map((c, i) => ({
              id: c.id,
              href: '/academy/sales?tab=curriculum',
              label: `C${i + 1}`,
              lines: [
                `C${i + 1} · ${c.title}`,
                `${STATUS_VIZ[statusKey(c.status)].label}${c.progress > 0 ? ` · ${c.progress}%` : ''}`,
              ],
              status: statusKey(c.status),
            }))}
            icon={Target}
            counts={statusCounts}
            unitLabel="completed"
            cols={4}
          />
        </ChartCard>
      </section>

      {/* ── continue learning ── */}
      {nextCourse ? (
        <Link
          href="/academy/sales?tab=curriculum"
          className="group flex items-center justify-between gap-4 rounded-2xl border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream px-6 py-5 shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300"
        >
          <div className="flex items-center gap-4 min-w-0">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--status-ontrack-bg)' }}
            >
              <Target size={22} style={{ color: 'var(--status-ontrack)' }} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">
                {nextCourse.status === 'In Progress' ? 'Continue learning' : 'Up next'}
              </p>
              <p className="text-sm font-semibold text-ink-primary truncate">{nextCourse.title}</p>
              <p className="text-[13px] text-ink-tertiary mt-0.5 truncate">{nextCourse.description}</p>
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
            <p className="text-sm font-semibold">All courses completed — academy complete.</p>
            <p className="text-[13px] mt-0.5">Revisit any course below to keep your edge sharp.</p>
          </div>
        </div>
      )}

      {/* ── level mastery ── */}
      <section>
        <h2 className="font-serif text-2xl font-normal text-ink-primary mb-1">Level mastery</h2>
        <p className="text-[13px] text-ink-tertiary mb-4">
          Each bar counts courses completed at that level.
        </p>
        <div className="rounded-2xl border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream p-6 space-y-4 shadow-card">
          {LEVELS.map((level) => {
            const levelCourses = courses.filter((c) => c.level === level)
            const done = levelCourses.filter((c) => c.status === 'Completed').length
            const levelPct = levelCourses.length ? Math.round((done / levelCourses.length) * 100) : 0
            const color = LEVEL_COLOR[level]
            return (
              <div key={level}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] font-medium text-ink-primary">{level}</span>
                  <span className="text-[12px] font-semibold text-ink-secondary tabular-nums">
                    {done}/{levelCourses.length} courses
                  </span>
                </div>
                <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: `${color}22` }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${levelPct}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── course list ── */}
      <section>
        <h2 className="font-serif text-2xl font-normal text-ink-primary mb-4">Courses</h2>
        <div className="rounded-2xl border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream overflow-hidden shadow-card">
          {courses.map((c, i) => {
            const sKey = statusKey(c.status)
            const StatusIcon = STATUS_VIZ[sKey].icon
            const levelColor = LEVEL_COLOR[c.level]
            return (
              <Link
                key={c.id}
                href="/academy/sales?tab=curriculum"
                className={cn(
                  'group flex items-center gap-4 px-5 py-3.5 hover:bg-[rgba(0,59,70,0.03)] transition-colors',
                  i > 0 && 'border-t-[0.5px] border-[rgba(0,59,70,0.08)]',
                )}
              >
                <StatusIcon size={18} className="shrink-0" style={{ color: STATUS_VIZ[sKey].color }} />
                <span className="text-xs font-medium text-ink-tertiary w-6 shrink-0 tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="flex-1 min-w-0 text-sm font-medium text-ink-primary truncate">
                  {c.title}
                </span>
                <span
                  className="hidden sm:inline-block rounded-lg px-2 py-0.5 text-[11px] font-medium shrink-0"
                  style={{ backgroundColor: `color-mix(in srgb, ${levelColor} 13%, transparent)`, color: levelColor }}
                >
                  {c.level}
                </span>
                <span className="hidden md:flex items-center gap-2 w-28 shrink-0">
                  <span className="flex-1 h-1.5 rounded-full bg-[rgba(0,59,70,0.07)] overflow-hidden">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${c.progress}%`,
                        backgroundColor: c.progress === 100 ? 'var(--status-ontrack)' : 'rgb(var(--m-accent-copper))',
                      }}
                    />
                  </span>
                  <span className="text-[11px] font-semibold text-ink-secondary tabular-nums w-8 text-right">
                    {c.progress}%
                  </span>
                </span>
                <span className="hidden lg:block w-20 text-right text-[12px] text-ink-tertiary tabular-nums shrink-0">
                  {c.modules} mod · {c.duration}
                </span>
                <ArrowRight size={15} className="shrink-0 text-ink-tertiary/50 group-hover:text-ink-primary transition-colors" />
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── standing ── */}
      <section>
        <h2 className="font-serif text-2xl font-normal text-ink-primary mb-4">Where you stand</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatTile
            label="Enrolled learners"
            value={academy.enrollmentCount.toLocaleString()}
            sub="Across the Sales Academy"
          />
          <StatTile label="Academy rating" value={`${academy.avgRating} ★`} sub="Average learner rating" />
          <StatTile
            label="Certificates"
            value={String(Math.floor(completedCount / 4))}
            sub="One per four courses completed"
          />
        </div>
        {/* top-3 leaderboard teaser */}
        <div className="mt-3 rounded-2xl border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-ink-tertiary" />
              <h3 className="text-sm font-semibold text-ink-primary">Top learners this month</h3>
            </div>
            <Link
              href="/academy/sales?tab=leaderboard"
              className="text-[13px] font-medium text-ink-secondary hover:text-ink-primary transition-colors"
            >
              Full leaderboard →
            </Link>
          </div>
          <div className="space-y-2">
            {academy.leaderboard.slice(0, 3).map((entry) => (
              <div key={entry.rank} className="flex items-center gap-3">
                <span className="w-5 flex justify-center">
                  {entry.rank === 1 ? (
                    <Crown size={15} className="text-accent-silver" />
                  ) : entry.rank === 2 ? (
                    <Medal size={15} className="text-surface-mid" />
                  ) : (
                    <Award size={15} className="text-accent-silver/60" />
                  )}
                </span>
                <span className="flex-1 text-[13px] font-medium text-ink-primary truncate">{entry.name}</span>
                <span className="w-24 h-1.5 rounded-full bg-[rgba(0,59,70,0.07)] overflow-hidden">
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${entry.progress}%`, backgroundColor: 'rgb(var(--m-accent-copper))' }}
                  />
                </span>
                <span className="text-[13px] font-semibold text-ink-primary tabular-nums w-14 text-right">
                  {entry.points.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── quick links ── */}
      <section className="pb-4">
        <h2 className="font-serif text-2xl font-normal text-ink-primary mb-4">Quick links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              href: '/academy/sales?tab=curriculum',
              icon: BookOpen,
              title: 'Curriculum',
              sub: `${courses.length} courses from fundamentals to sales leadership`,
            },
            {
              href: '/academy/sales?tab=resources',
              icon: FolderOpen,
              title: 'Resources',
              sub: 'Playbooks, cheat sheets and the interview series',
            },
            {
              href: '/academy/sales?tab=leaderboard',
              icon: Users,
              title: 'Leaderboard',
              sub: 'See how you rank against the sales team',
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
