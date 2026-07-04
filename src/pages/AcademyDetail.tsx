'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import DiscussionsTab from '@/components/DiscussionsTab'
import MonthlyQuiz from '@/pages/MonthlyQuiz'
import {
  BookOpen,
  Clock,
  Users,
  Star,
  BarChart3,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle2,
  Circle,
  PlayCircle,
  FileText,
  ExternalLink,
  Download,
  ArrowRight,
  Crown,
  Medal,
  Award,
} from 'lucide-react'
import { getAcademyById, iconMap } from '@/data/academies'
import type { Course, CourseStatus, CourseLevel } from '@/data/academies'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

/* ------------------------------------------------------------------ */
/*  Sub-components                                                      */
/* ------------------------------------------------------------------ */

function ProgressRing({
  value,
  size = 160,
  strokeWidth = 10,
  color = '#a7c4d4',
  children,
}: {
  value: number
  size?: number
  strokeWidth?: number
  color?: string
  children?: React.ReactNode
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0,59,70,0.06)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}

function StatusDot({ status }: { status: CourseStatus }) {
  return (
    <span
      className={cn(
        'w-2.5 h-2.5 rounded-full flex-shrink-0',
        status === 'Completed' && 'bg-surface-sage',
        status === 'In Progress' && 'bg-surface-blue',
        status === 'Not Started' && 'bg-[rgba(0,59,70,0.15)]'
      )}
    />
  )
}

function LevelBadge({ level }: { level: CourseLevel }) {
  return (
    <span
      className={cn(
        'inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md',
        level === 'Beginner' && 'bg-surface-sage/20 text-surface-sage',
        level === 'Intermediate' && 'bg-surface-blue/20 text-ink-secondary',
        level === 'Advanced' && 'bg-surface-rose/20 text-ink-secondary'
      )}
    >
      {level}
    </span>
  )
}

function CourseActionButton({ status }: { status: CourseStatus }) {
  if (status === 'Completed')
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-surface-sage bg-surface-sage/10 px-3 py-1.5 rounded-full">
        <CheckCircle2 size={13} />
        Review
      </span>
    )
  if (status === 'In Progress')
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-primary bg-surface-blue/20 px-3 py-1.5 rounded-full">
        <PlayCircle size={13} />
        Continue
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-secondary bg-[rgba(0,59,70,0.06)] px-3 py-1.5 rounded-full hover:bg-[rgba(0,59,70,0.1)] transition-colors cursor-pointer">
      <Circle size={13} />
      Start
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Tab: Curriculum                                                     */
/* ------------------------------------------------------------------ */

function CurriculumTab({
  courses,
  academyColor,
}: {
  courses: Course[]
  academyColor: string
}) {
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null)
  const [courseSearch, setCourseSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<'All' | CourseLevel>('All')
  const [statusFilter, setStatusFilter] = useState<'All' | CourseStatus>('All')
  const [expandAll, setExpandAll] = useState(false)

  const filteredCourses = useMemo(() => {
    let result = [...courses]
    if (courseSearch.trim()) {
      const q = courseSearch.toLowerCase()
      result = result.filter((c) => c.title.toLowerCase().includes(q))
    }
    if (levelFilter !== 'All') result = result.filter((c) => c.level === levelFilter)
    if (statusFilter !== 'All') result = result.filter((c) => c.status === statusFilter)
    return result
  }, [courses, courseSearch, levelFilter, statusFilter])

  const toggleExpand = (id: string) => {
    setExpandedCourse((prev) => (prev === id ? null : id))
  }

  const toggleExpandAll = () => {
    if (expandAll) {
      setExpandedCourse(null)
      setExpandAll(false)
    } else {
      setExpandAll(true)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header + Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="font-serif text-2xl font-normal text-ink-primary">
            Curriculum
          </h3>
          <span className="text-sm text-ink-tertiary">
            {courses.length} courses
          </span>
        </div>
        <button
          onClick={toggleExpandAll}
          className="text-sm font-medium text-ink-secondary hover:text-ink-primary transition-colors"
        >
          {expandAll ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-[280px]">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary"
            size={15}
          />
          <input
            type="text"
            placeholder="Search within academy..."
            value={courseSearch}
            onChange={(e) => setCourseSearch(e.target.value)}
            className="w-full bg-cream border border-[rgba(0,59,70,0.12)] rounded-lg pl-9 pr-3 py-2 text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-ink-primary transition-all"
          />
        </div>

        {/* Level filter pills */}
        {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map(
          (level) => (
            <button
              key={level}
              onClick={() => setLevelFilter(level)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                levelFilter === level
                  ? 'bg-ink-primary text-parchment'
                  : 'bg-[rgba(0,59,70,0.06)] text-ink-secondary hover:bg-[rgba(0,59,70,0.1)]'
              )}
            >
              {level}
            </button>
          )
        )}

        {/* Status filter pills */}
        {(['All', 'Not Started', 'In Progress', 'Completed'] as const).map(
          (status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                statusFilter === status
                  ? 'bg-ink-primary text-parchment'
                  : 'bg-[rgba(0,59,70,0.06)] text-ink-secondary hover:bg-[rgba(0,59,70,0.1)]'
              )}
            >
              {status}
            </button>
          )
        )}
      </div>

      {/* Course List */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.04 } },
        }}
        className="space-y-2"
      >
        {filteredCourses.map((course, idx) => {
          const isExpanded = expandAll || expandedCourse === course.id
          return (
            <motion.div
              key={course.id}
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
              }}
              className="bg-cream rounded-xl border border-[rgba(0,59,70,0.08)] overflow-hidden"
            >
              {/* Accordion Header */}
              <button
                onClick={() => toggleExpand(course.id)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-[rgba(0,59,70,0.02)] transition-colors"
              >
                {isExpanded ? (
                  <ChevronUp
                    size={18}
                    className="text-ink-tertiary flex-shrink-0"
                  />
                ) : (
                  <ChevronDown
                    size={18}
                    className="text-ink-tertiary flex-shrink-0"
                  />
                )}

                <span className="text-xs font-medium text-ink-tertiary w-6 flex-shrink-0">
                  {String(idx + 1).padStart(2, '0')}
                </span>

                <div className="flex-1 min-w-0">
                  <h4 className="text-[15px] font-semibold text-ink-primary truncate">
                    {course.title}
                  </h4>
                </div>

                <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                  <span className="flex items-center gap-1 text-xs text-ink-tertiary">
                    <Clock size={12} />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-ink-tertiary">
                    <BookOpen size={12} />
                    {course.modules} modules
                  </span>
                  <LevelBadge level={course.level} />
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                  <StatusDot status={course.status} />
                  <div className="hidden md:block">
                    <CourseActionButton status={course.status} />
                  </div>
                </div>
              </button>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                      duration: 0.3,
                      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
                    }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-1 border-t border-[rgba(0,59,70,0.06)]">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                        {/* Description + Objectives */}
                        <div>
                          <p className="text-sm text-ink-secondary leading-relaxed mb-4">
                            {course.description}
                          </p>

                          <h5 className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary mb-2.5">
                            Learning Objectives
                          </h5>
                          <ul className="space-y-2">
                            {course.learningObjectives.map((obj, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-sm text-ink-secondary"
                              >
                                <CheckCircle2
                                  size={14}
                                  className="text-surface-sage flex-shrink-0 mt-0.5"
                                />
                                {obj}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Module Breakdown + Instructor */}
                        <div>
                          <h5 className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary mb-2.5">
                            Module Breakdown
                          </h5>
                          <ul className="space-y-2 mb-5">
                            {course.moduleBreakdown.map((mod, i) => (
                              <li
                                key={i}
                                className="flex items-center justify-between text-sm py-1.5 border-b border-[rgba(0,59,70,0.04)] last:border-0"
                              >
                                <span className="text-ink-secondary">
                                  {i + 1}. {mod.title}
                                </span>
                                <span className="text-ink-tertiary text-xs">
                                  {mod.duration}
                                </span>
                              </li>
                            ))}
                          </ul>

                          {/* Instructor */}
                          <div className="flex items-center gap-3 bg-[rgba(0,59,70,0.03)] rounded-lg p-3">
                            <Avatar className="w-9 h-9">
                              <AvatarFallback
                                className="text-xs font-semibold"
                                style={{
                                  backgroundColor: `${academyColor}30`,
                                  color: academyColor,
                                }}
                              >
                                {course.instructor.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-ink-primary">
                                {course.instructor.name}
                              </p>
                              <p className="text-xs text-ink-tertiary">
                                {course.instructor.role}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tab: My Progress                                                    */
/* ------------------------------------------------------------------ */

function MyProgressTab({
  courses,
  academyColor,
}: {
  courses: Course[]
  academyColor: string
}) {
  const overallProgress = Math.round(
    courses.reduce((s, c) => s + c.progress, 0) / courses.length
  )
  const completedCount = courses.filter(
    (c) => c.status === 'Completed'
  ).length
  const totalHoursLearned = Math.round(
    courses
      .filter((c) => c.progress > 0)
      .reduce((s, c) => s + (c.durationHours * c.progress) / 100, 0)
  )

  const sortedCourses = useMemo(() => {
    const order: Record<CourseStatus, number> = {
      'In Progress': 0,
      'Not Started': 1,
      'Completed': 2,
    }
    return [...courses].sort((a, b) => order[a.status] - order[b.status])
  }, [courses])

  const nextCourse =
    courses.find((c) => c.status === 'In Progress') ||
    courses.find((c) => c.status === 'Not Started')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-6">
      {/* Left — Overall Progress */}
      <div className="bg-cream rounded-2xl border border-[rgba(0,59,70,0.08)] p-8 shadow-card">
        <div className="flex flex-col items-center text-center">
          <ProgressRing
            value={overallProgress}
            size={180}
            strokeWidth={12}
            color={academyColor}
          >
            <div className="text-center">
              <p className="text-4xl font-bold text-ink-primary">
                {overallProgress}%
              </p>
              <p className="text-xs font-medium text-ink-tertiary uppercase tracking-wide mt-1">
                Complete
              </p>
            </div>
          </ProgressRing>

          {/* Stats below ring */}
          <div className="grid grid-cols-3 gap-6 w-full mt-8 pt-6 border-t border-[rgba(0,59,70,0.06)]">
            <div className="text-center">
              <p className="text-xl font-bold text-ink-primary">
                {completedCount}/{courses.length}
              </p>
              <p className="text-[11px] font-medium text-ink-tertiary uppercase tracking-wide mt-0.5">
                Completed
              </p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-ink-primary">
                {totalHoursLearned}h
              </p>
              <p className="text-[11px] font-medium text-ink-tertiary uppercase tracking-wide mt-0.5">
                Hours Learned
              </p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-ink-primary">
                {Math.floor(completedCount / 4)}
              </p>
              <p className="text-[11px] font-medium text-ink-tertiary uppercase tracking-wide mt-0.5">
                Certificates
              </p>
            </div>
          </div>

          {/* Next Milestone */}
          {nextCourse && (
            <div className="mt-6 p-4 bg-[rgba(0,59,70,0.03)] rounded-xl w-full text-left">
              <p className="text-xs font-medium text-ink-tertiary mb-1.5 uppercase tracking-wide">
                Next Milestone
              </p>
              <p className="text-sm text-ink-secondary mb-3">
                Complete &ldquo;{nextCourse.title}&rdquo; to continue your
                certification journey.
              </p>
              <button className="inline-flex items-center gap-1.5 bg-ink-primary text-parchment text-xs font-semibold px-4 py-2 rounded-full hover:bg-ink-secondary transition-colors">
                Continue Course
                <ArrowRight size={13} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right — Course-by-Course Progress */}
      <div className="bg-cream rounded-2xl border border-[rgba(0,59,70,0.08)] p-6 shadow-card">
        <h3 className="text-lg font-semibold text-ink-primary mb-4">
          Course Progress
        </h3>

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 hide-scrollbar">
          {sortedCourses.map((course) => (
            <div key={course.id} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[13px] font-medium text-ink-primary truncate">
                    {course.title}
                  </p>
                  <span className="text-xs font-semibold text-ink-secondary ml-2 flex-shrink-0">
                    {course.progress}%
                  </span>
                </div>
                <div className="h-1 w-full bg-[rgba(0,59,70,0.06)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${course.progress}%`,
                      backgroundColor:
                        course.progress === 100
                          ? '#7a8a7a'
                          : course.progress > 0
                            ? academyColor
                            : 'rgba(0,59,70,0.12)',
                    }}
                  />
                </div>
              </div>
              {course.progress === 100 && (
                <CheckCircle2
                  size={16}
                  className="text-surface-sage flex-shrink-0"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tab: Resources                                                      */
/* ------------------------------------------------------------------ */

function ResourcesTab({
  resources,
}: {
  resources: Array<{
    id: string
    title: string
    description: string
    type: 'PDF' | 'Video' | 'Link' | 'DOCX'
    size?: string
    duration?: string
    date: string
  }>
}) {
  const resourceIcons = {
    PDF: { icon: FileText, color: 'bg-surface-rose/15 text-surface-rose' },
    Video: {
      icon: PlayCircle,
      color: 'bg-surface-blue/15 text-ink-secondary',
    },
    Link: {
      icon: ExternalLink,
      color: 'bg-surface-olive/15 text-surface-olive',
    },
    DOCX: {
      icon: Download,
      color: 'bg-surface-sage/15 text-surface-sage',
    },
  }

  return (
    <div className="space-y-5">
      <h3 className="font-serif text-2xl font-normal text-ink-primary">
        Academy Resources
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {resources.map((res, idx) => {
          const { icon: ResIcon, color } = resourceIcons[res.type]
          return (
            <motion.div
              key={res.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: idx * 0.06,
                duration: 0.4,
                ease: [0, 0, 0.2, 1] as [number, number, number, number],
              }}
              className="bg-cream rounded-xl border border-[rgba(0,59,70,0.08)] p-5 shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300"
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center mb-4',
                  color
                )}
              >
                <ResIcon size={20} />
              </div>

              <h4 className="text-sm font-semibold text-ink-primary mb-1.5 line-clamp-2">
                {res.title}
              </h4>
              <p className="text-xs text-ink-tertiary leading-relaxed line-clamp-2 mb-4">
                {res.description}
              </p>

              <div className="flex items-center justify-between text-[11px] text-ink-tertiary">
                <span>
                  {res.type === 'Link' ? 'External' : res.size || res.duration}
                </span>
                <span>{res.date}</span>
              </div>

              <button className="mt-4 w-full text-center text-xs font-semibold text-ink-secondary bg-[rgba(0,59,70,0.06)] hover:bg-[rgba(0,59,70,0.1)] py-2 rounded-full transition-colors">
                {res.type === 'Video'
                  ? 'Watch'
                  : res.type === 'Link'
                    ? 'Open'
                    : 'Download'}
              </button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tab: Leaderboard                                                    */
/* ------------------------------------------------------------------ */

function LeaderboardTab({
  leaderboard,
  academyColor,
}: {
  leaderboard: Array<{
    rank: number
    name: string
    initials: string
    department: string
    progress: number
    points: number
    isCurrentUser?: boolean
  }>
  academyColor: string
}) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={16} className="text-accent-gold" />
    if (rank === 2) return <Medal size={16} className="text-surface-mid" />
    if (rank === 3)
      return <Award size={16} className="text-accent-gold/60" />
    return (
      <span className="text-xs font-bold text-ink-tertiary w-4 text-center">
        {rank}
      </span>
    )
  }

  return (
    <div className="bg-cream rounded-2xl border border-[rgba(0,59,70,0.08)] p-6 shadow-card">
      <h3 className="text-lg font-semibold text-ink-primary mb-5">
        Top Learners
      </h3>

      <div className="space-y-1">
        {/* Header */}
        <div className="grid grid-cols-[50px_1fr_120px_100px] gap-3 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">
          <span>Rank</span>
          <span>Learner</span>
          <span>Progress</span>
          <span className="text-right">Points</span>
        </div>

        {/* Rows */}
        {leaderboard.map((entry, idx) => (
          <motion.div
            key={entry.rank}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: idx * 0.05,
              duration: 0.4,
              ease: [0, 0, 0.2, 1] as [number, number, number, number],
            }}
            className={cn(
              'grid grid-cols-[50px_1fr_120px_100px] gap-3 items-center px-4 py-3 rounded-lg transition-colors',
              entry.isCurrentUser
                ? 'bg-surface-blue/8'
                : 'hover:bg-[rgba(0,59,70,0.02)]'
            )}
          >
            {/* Rank */}
            <div className="flex items-center justify-center w-6 h-6">
              {getRankIcon(entry.rank)}
            </div>

            {/* Learner */}
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="w-8 h-8">
                <AvatarFallback
                  className="text-[10px] font-bold"
                  style={{
                    backgroundColor: `${academyColor}25`,
                    color: academyColor,
                  }}
                >
                  {entry.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink-primary truncate">
                  {entry.name}
                </p>
                <p className="text-[11px] text-ink-tertiary">
                  {entry.department}
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-[rgba(0,59,70,0.06)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${entry.progress}%`,
                    backgroundColor: academyColor,
                  }}
                />
              </div>
              <span className="text-[11px] font-semibold text-ink-secondary flex-shrink-0">
                {entry.progress}%
              </span>
            </div>

            {/* Points */}
            <p className="text-sm font-semibold text-ink-primary text-right">
              {entry.points.toLocaleString()}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                 */
/* ------------------------------------------------------------------ */

export default function AcademyDetail() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const [activeTab, setActiveTab] = useState<
    'curriculum' | 'progress' | 'resources' | 'leaderboard' | 'discussions' | 'monthly-quiz'
  >('curriculum')

  const academy = getAcademyById(id || '')

  if (!academy) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-full bg-surface-rose/20 flex items-center justify-center mb-4">
          <Search size={32} className="text-surface-rose" />
        </div>
        <h2 className="font-serif text-3xl font-normal text-ink-primary mb-2">
          Academy Not Found
        </h2>
        <p className="text-ink-tertiary max-w-md mb-6">
          The academy you are looking for does not exist.
        </p>
        <Link
          href="/academies"
          className="inline-flex items-center gap-2 bg-ink-primary text-parchment px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-ink-secondary transition-colors"
        >
          Back to Academies
          <ArrowRight size={14} />
        </Link>
      </div>
    )
  }

  const IconComponent = iconMap[academy.icon] || BookOpen
  // The Monthly Quiz is a Business Development Executive (BDE) drill grounded in
  // the AI-Bot training script — surfaced only in the BD Academy for now.
  const hasMonthlyQuiz = academy.id === 'business-development'
  const tabs = [
    { key: 'curriculum' as const, label: 'Curriculum' },
    ...(hasMonthlyQuiz
      ? [{ key: 'monthly-quiz' as const, label: 'Monthly Quiz' }]
      : []),
    { key: 'progress' as const, label: 'My Progress' },
    { key: 'resources' as const, label: 'Resources' },
    { key: 'leaderboard' as const, label: 'Leaderboard' },
    { key: 'discussions' as const, label: 'Discussions' },
  ]

  const overallProgress = Math.round(
    academy.courses.reduce((s, c) => s + c.progress, 0) / academy.courses.length
  )

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Section 1: Academy Hero */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-3xl p-8 overflow-hidden"
        style={{ backgroundColor: `${academy.color}15` }}
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-ink-tertiary mb-5">
          <Link
            href="/academies"
            className="hover:text-ink-primary transition-colors"
          >
            Academies
          </Link>
          <ChevronRight size={12} />
          <span className="text-ink-primary font-medium">
            {academy.name}
          </span>
        </div>

        <div className="flex items-start gap-5 mb-5">
          {/* Academy Icon */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${academy.color}30` }}
          >
            <IconComponent size={28} style={{ color: academy.color }} />
          </div>

          <div className="flex-1">
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="font-serif text-5xl font-normal text-ink-primary mb-3"
            >
              {academy.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-lg text-ink-secondary leading-relaxed max-w-[720px]"
            >
              {academy.description}
            </motion.p>
          </div>
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap gap-6 mb-6"
        >
          {[
            {
              icon: BookOpen,
              value: `${academy.courseCount} Courses`,
              label: 'Courses',
            },
            {
              icon: Clock,
              value: `${academy.totalHours} Total Hours`,
              label: 'Hours',
            },
            {
              icon: Users,
              value: `${academy.enrollmentCount} Enrolled`,
              label: 'Learners',
            },
            {
              icon: Star,
              value: `${academy.avgRating} Rating`,
              label: 'Rating',
            },
            {
              icon: BarChart3,
              value: academy.levelRange,
              label: 'Level',
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.08, duration: 0.4 }}
              className="flex items-center gap-3"
            >
              <stat.icon size={20} className="text-ink-tertiary" />
              <div>
                <p className="text-lg font-bold text-ink-primary leading-tight">
                  {stat.value}
                </p>
                <p className="text-[10px] font-medium uppercase tracking-wide text-ink-tertiary">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          {overallProgress > 0 ? (
            <div className="inline-flex items-center gap-4">
              <button className="inline-flex items-center gap-2 bg-ink-primary text-parchment px-7 py-3 rounded-full text-sm font-semibold hover:bg-ink-secondary transition-colors">
                Continue Learning
                <ArrowRight size={16} />
              </button>
              <span className="text-sm font-medium text-ink-secondary">
                {overallProgress}% complete
              </span>
            </div>
          ) : (
            <button className="inline-flex items-center gap-2 bg-ink-primary text-parchment px-7 py-3 rounded-full text-sm font-semibold hover:bg-ink-secondary transition-colors">
              Enroll in Academy
              <ArrowRight size={16} />
            </button>
          )}
        </motion.div>
      </motion.section>

      {/* Section 2: Tab Navigation */}
      <div className="sticky top-0 z-30 bg-parchment/95 backdrop-blur-sm border-b border-[rgba(0,59,70,0.08)] -mx-8 px-8">
        <div className="max-w-[1200px] mx-auto flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'relative px-5 py-4 text-sm font-medium transition-colors border-b-2',
                activeTab === tab.key
                  ? 'text-ink-primary border-ink-primary'
                  : 'text-ink-tertiary border-transparent hover:text-ink-secondary'
              )}
              style={
                activeTab === tab.key
                  ? { borderBottomColor: academy.color }
                  : undefined
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section 3+: Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="pb-8"
        >
          {activeTab === 'curriculum' && (
            <CurriculumTab
              courses={academy.courses}
              academyColor={academy.color}
            />
          )}
          {activeTab === 'progress' && (
            <MyProgressTab
              courses={academy.courses}
              academyColor={academy.color}
            />
          )}
          {activeTab === 'resources' && (
            <ResourcesTab resources={academy.resources} />
          )}
          {activeTab === 'leaderboard' && (
            <LeaderboardTab
              leaderboard={academy.leaderboard}
              academyColor={academy.color}
            />
          )}
          {activeTab === 'monthly-quiz' && <MonthlyQuiz />}
          {activeTab === 'discussions' && <DiscussionsTab academyId={academy.id} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
