'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { demoPrsScore, demoPrsBand } from '@/data/prs-demo'
import { ProgressRing as StatusRing, statusFromProgress } from '@/components/AcademyProgressCard'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  BookOpen,
  Award,
  CheckCircle,
  Clock,
  Calendar,
  AlertTriangle,
  Lock,
  ChevronRight,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const assessmentData = [
  { name: 'Product Knowledge', score: 92 },
  { name: 'Installation', score: 87 },
  { name: 'Safety Protocol', score: 95 },
  { name: 'Sales Techniques', score: 78 },
  { name: 'Quality Control', score: 88 },
]

const courses = [
  {
    title: 'Advanced Wellness Product Installation',
    due: 'Oct 12',
    status: 'In Progress' as const,
    progress: 65,
    priority: 'high' as const,
  },
  {
    title: 'Quality Standards & Compliance 2024',
    due: 'Oct 18',
    status: 'Overdue' as const,
    progress: 30,
    priority: 'high' as const,
  },
  {
    title: 'Leadership Communication Skills',
    due: 'Oct 25',
    status: 'Not Started' as const,
    progress: 0,
    priority: 'medium' as const,
  },
  {
    title: 'Inventory Management Systems',
    due: 'Nov 2',
    status: 'In Progress' as const,
    progress: 45,
    priority: 'low' as const,
  },
]

const skillLabels = [
  'Product Knowledge',
  'Sales',
  'Installation',
  'Quality',
  'Leadership',
  'Communication',
]
const skillLevels = [
  [0, 1, 1, 0, 0], // Product Knowledge: through Advanced
  [0, 1, 1, 1, 0], // Sales: through Expert
  [0, 1, 0, 0, 0], // Installation: through Intermediate
  [0, 1, 1, 0, 0], // Quality: through Advanced
  [0, 1, 0, 0, 0], // Leadership: through Intermediate (in-progress)
  [0, 1, 1, 1, 0], // Communication: through Expert
]
const skillInProgress = [false, false, false, false, true, false]
const levelHeaders = ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master']

const certifications = [
  { level: 1, name: 'Foundation', status: 'earned' as const, date: 'Mar 2024' },
  { level: 2, name: 'Intermediate', status: 'earned' as const, date: 'Jun 2024' },
  { level: 3, name: 'Advanced', status: 'in-progress' as const, pct: 68 },
  { level: 4, name: 'Specialist', status: 'locked' as const },
  { level: 5, name: 'Trainer', status: 'locked' as const },
]

const alerts = [
  {
    title: 'Annual Safety Recertification',
    desc: 'Due by Oct 30, 2024',
  },
  {
    title: 'HR Policy Update Training',
    desc: 'Mandatory — Due Nov 5',
  },
  {
    title: 'Diversity & Inclusion Workshop',
    desc: 'Recommended — Available now',
  },
]

const learningPath = [
  { label: 'Orientation', state: 'completed' as const, date: 'Jan 2023' },
  { label: 'Foundation', state: 'completed' as const, date: 'Apr 2023' },
  { label: 'Product Basics', state: 'completed' as const, date: 'Sep 2023' },
  { label: 'Advanced Skills', state: 'current' as const, date: 'Current' },
  { label: 'Specialization', state: 'upcoming' as const, date: 'Q1 2025' },
  { label: 'Leadership', state: 'upcoming' as const, date: 'Q2 2025' },
  { label: 'Mastery', state: 'upcoming' as const, date: 'Q4 2025' },
]

/* ------------------------------------------------------------------ */
/*  ANIMATION VARIANTS                                                 */
/* ------------------------------------------------------------------ */

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const staggerItem = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.04,
      duration: 0.3,
      ease: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number],
    },
  }),
}

/* ------------------------------------------------------------------ */
/*  PROGRESS RING                                                      */
/* ------------------------------------------------------------------ */

function ProgressRing({
  pct,
  size = 100,
  stroke = 8,
  trackColor = 'rgba(255,255,255,0.15)',
  fillColor = '#a7c4d4',
  label,
  sublabel,
  textColor = '#f8f5f0',
  delay = 0,
}: {
  pct: number
  size?: number
  stroke?: number
  trackColor?: string
  fillColor?: string
  label?: string
  sublabel?: string
  textColor?: string
  delay?: number
}) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={fillColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={animated ? circ * (1 - pct / 100) : circ}
          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
        />
      </svg>
      {label && (
        <div className="text-center -mt-1">
          <p className="text-[22px] font-bold" style={{ color: textColor }}>
            {label}
          </p>
          {sublabel && (
            <p
              className="text-[11px] font-medium mt-0.5"
              style={{ color: textColor, opacity: 0.7 }}
            >
              {sublabel}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  SKILL MATRIX CELL                                                  */
/* ------------------------------------------------------------------ */

function SkillCell({
  filled,
  inProgress,
  index,
}: {
  filled: boolean
  inProgress: boolean
  index: number
}) {
  const [hovered, setHovered] = useState(false)

  let bgClass = 'bg-cream'
  if (filled && !inProgress) bgClass = 'bg-surface-blue'
  if (inProgress) bgClass = 'bg-accent-gold'

  return (
    <motion.div
      custom={index}
      variants={scaleIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'w-10 h-10 rounded-md transition-all duration-200 relative',
        bgClass,
        inProgress && 'animate-pulse',
        hovered && 'ring-2 ring-ink-primary/20 scale-110'
      )}
    >
      {inProgress && (
        <div className="absolute inset-0 rounded-md bg-accent-gold/30 animate-ping" />
      )}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  MAIN PAGE                                                          */
/* ------------------------------------------------------------------ */

export default function MyLearning() {
  const [ringTriggered, setRingTriggered] = useState(false)
  const bannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setRingTriggered(true), 400)
    return () => clearTimeout(t)
  }, [])

  const statusBadge = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'bg-surface-blue text-ink-primary'
      case 'Overdue':
        return 'bg-surface-rose text-ink-primary'
      case 'Not Started':
        return 'bg-cream text-ink-tertiary'
      default:
        return 'bg-cream text-ink-tertiary'
    }
  }

  const priorityDot = (p: string) => {
    switch (p) {
      case 'high':
        return 'bg-red-500'
      case 'medium':
        return 'bg-amber-500'
      case 'low':
        return 'bg-green-500'
      default:
        return 'bg-gray-400'
    }
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* ── Section 1: KPI Banner ── */}
      <motion.div
        ref={bannerRef}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative bg-card border border-[rgba(0,59,70,0.08)] shadow-card rounded-2xl p-8 overflow-hidden"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="font-serif text-[28px] font-normal text-ink-primary">
              Good morning, Sarah
            </h2>
            <p className="text-ink-secondary text-base mt-1">
              Here&apos;s your learning progress for October 2024
            </p>

            {/* Stat Pills */}
            <div className="flex flex-wrap gap-3 mt-5">
              {[
                { icon: BookOpen, num: '7', label: 'COURSES IN PROGRESS' },
                { icon: Award, num: '3', label: 'CERTIFICATIONS' },
                { icon: CheckCircle, num: '12', label: 'COMPLETED' },
                { icon: Clock, num: '48h', label: 'LEARNING TIME' },
              ].map((pill) => (
                <div
                  key={pill.label}
                  className="flex items-center gap-2 rounded-full px-5 py-2.5 bg-cream border border-[rgba(0,59,70,0.08)]"
                >
                  <pill.icon size={16} className="text-accent-copper flex-shrink-0" />
                  <span className="text-ink-primary text-lg font-bold">{pill.num}</span>
                  <span className="text-ink-tertiary text-[11px] font-medium uppercase">
                    {pill.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Ring */}
          <div className="flex-shrink-0 ml-6">
            <ProgressRing
              pct={68}
              size={100}
              stroke={8}
              trackColor="rgba(0,59,70,0.08)"
              fillColor="#B8703F"
              label={ringTriggered ? '68%' : '0%'}
              sublabel="Overall Progress"
              textColor="#3a2a1c"
              delay={200}
            />
          </div>
        </div>
      </motion.div>

      {/* ── Section 2: Main 2-Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-5">
        {/* ── Left Column ── */}
        <div className="space-y-5">
          {/* Assigned Courses */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
            className="bg-cream rounded-2xl p-6 shadow-card"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-sans text-lg font-semibold text-ink-primary">
                  Assigned Courses
                </h3>
                <span className="bg-surface-rose text-ink-primary text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  3 pending
                </span>
              </div>
              <button className="text-ink-secondary text-sm font-medium hover:text-ink-primary transition-colors flex items-center gap-1">
                View All <ChevronRight size={14} />
              </button>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {courses.map((c) => (
                <motion.div
                  key={c.title}
                  variants={staggerItem}
                  className="flex items-center gap-3 py-2.5 border-b border-[rgba(0,59,70,0.08)] last:border-0 hover:bg-[rgba(0,59,70,0.03)] rounded-md px-1 transition-colors"
                >
                  <div
                    className={cn(
                      'w-2.5 h-2.5 rounded-full flex-shrink-0',
                      priorityDot(c.priority)
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-ink-primary truncate">
                      {c.title}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-ink-tertiary text-xs">
                        <Calendar size={12} />
                        Due {c.due}
                      </span>
                      <span
                        className={cn(
                          'text-[11px] font-medium px-2 py-0.5 rounded-full',
                          statusBadge(c.status)
                        )}
                      >
                        {c.status}
                      </span>
                    </div>
                  </div>
                  <StatusRing
                    progress={c.progress}
                    status={statusFromProgress(c.progress, c.status === 'Overdue')}
                    size={44}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Assessment Scores */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-cream rounded-2xl p-6 shadow-card"
          >
            <h3 className="font-sans text-lg font-semibold text-ink-primary mb-4">
              Recent Assessments
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assessmentData} barSize={40} margin={{ top: 16, right: 8, bottom: 8, left: -8 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(0,59,70,0.08)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#4a6b6e', fontFamily: 'Inter' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: '#4a6b6e', fontFamily: 'Inter' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {assessmentData.map((_, idx) => (
                      <Cell key={idx} fill="#a7c4d4" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Skill Matrix */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-cream rounded-2xl p-6 shadow-card"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-sans text-lg font-semibold text-ink-primary">
                Your Skill Matrix
              </h3>
              <span className="text-xs text-ink-tertiary">
                Last updated: Oct 1, 2024
              </span>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[120px_repeat(5,1fr)] gap-1 mb-1">
              <div />
              {levelHeaders.map((h) => (
                <div
                  key={h}
                  className="text-[10px] font-medium uppercase text-ink-tertiary text-center"
                >
                  {h}
                </div>
              ))}
            </div>

            {/* Rows */}
            <div className="space-y-1">
              {skillLabels.map((skill, rowIdx) => (
                <div key={skill} className="grid grid-cols-[120px_repeat(5,1fr)] gap-1 items-center">
                  <span className="text-xs font-medium text-ink-secondary truncate">
                    {skill}
                  </span>
                  {skillLevels[rowIdx].map((filled, colIdx) => (
                    <SkillCell
                      key={colIdx}
                      filled={filled === 1}
                      inProgress={skillInProgress[rowIdx] && colIdx === 1}
                      index={rowIdx * 5 + colIdx}
                    />
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Right Column ── */}
        <div className="space-y-5">
          {/* My Certifications */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
            className="bg-cream rounded-2xl p-6 shadow-card"
          >
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-sans text-lg font-semibold text-ink-primary">
                My Certifications
              </h3>
              <span className="bg-surface-blue/20 text-ink-primary text-[11px] font-semibold px-2 py-0.5 rounded-full">
                5
              </span>
            </div>

            <div className="space-y-3">
              {certifications.map((cert, i) => (
                <motion.div
                  key={cert.level}
                  custom={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.2 + i * 0.1,
                    duration: 0.4,
                    ease: 'easeOut',
                  }}
                  className="flex items-center gap-3"
                >
                  {/* Badge circle */}
                  <div className="relative w-14 h-14 flex-shrink-0">
                    {cert.status === 'earned' && (
                      <div className="w-14 h-14 rounded-full border-[3px] border-surface-sage bg-surface-sage/15 flex items-center justify-center">
                        <CheckCircle size={22} className="text-surface-sage" />
                      </div>
                    )}
                    {cert.status === 'in-progress' && (
                      <div className="w-14 h-14 rounded-full border-[3px] border-accent-gold flex items-center justify-center relative">
                        <svg
                          width={56}
                          height={56}
                          className="absolute -rotate-90"
                        >
                          <circle
                            cx={28}
                            cy={28}
                            r={24}
                            fill="none"
                            stroke="rgba(193,154,107,0.2)"
                            strokeWidth={3}
                          />
                          <circle
                            cx={28}
                            cy={28}
                            r={24}
                            fill="none"
                            stroke="#c19a6b"
                            strokeWidth={3}
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 24}
                            strokeDashoffset={
                              2 * Math.PI * 24 * (1 - (cert.pct || 0) / 100)
                            }
                            style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                          />
                        </svg>
                        <span className="text-[11px] font-bold text-accent-gold">
                          {cert.pct}%
                        </span>
                      </div>
                    )}
                    {cert.status === 'locked' && (
                      <div className="w-14 h-14 rounded-full border-2 border-dashed border-gray-400 bg-cream flex items-center justify-center">
                        <Lock size={18} className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-ink-primary">
                      Level {cert.level} — {cert.name}
                    </p>
                    <p
                      className={cn(
                        'text-[11px] mt-0.5',
                        cert.status === 'earned' && 'text-surface-sage',
                        cert.status === 'in-progress' && 'text-accent-gold',
                        cert.status === 'locked' && 'text-ink-tertiary'
                      )}
                    >
                      {cert.status === 'earned'
                        ? `Earned ${cert.date}`
                        : cert.status === 'in-progress'
                          ? 'In Progress'
                          : 'Locked'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Career Progress */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25, ease: 'easeOut' }}
            className="bg-cream rounded-2xl p-6 shadow-card"
          >
            <h3 className="font-sans text-lg font-semibold text-ink-primary mb-4">
              Career Progress
            </h3>

            {/* Timeline */}
            <div className="relative flex items-start justify-between px-2 mb-6">
              {/* Connector line */}
              <div className="absolute top-5 left-8 right-8 h-0.5 border-t-2 border-dashed border-cream z-0" />

              {/* Node 1 - Past */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.4,
                  duration: 0.4,
                  ease: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number],
                }}
                className="relative z-10 flex flex-col items-center"
              >
                <div className="w-10 h-10 rounded-full bg-surface-sage flex items-center justify-center">
                  <CheckCircle size={18} className="text-white" />
                </div>
                <p className="text-xs font-medium text-ink-tertiary mt-2 text-center max-w-[80px]">
                  Senior Sales Associate
                </p>
                <p className="text-[10px] text-ink-tertiary mt-0.5">Jan 2023</p>
              </motion.div>

              {/* Node 2 - Current */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.55,
                  duration: 0.4,
                  ease: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number],
                }}
                className="relative z-10 flex flex-col items-center"
              >
                <div className="w-11 h-11 rounded-full bg-surface-blue flex items-center justify-center ring-4 ring-surface-blue/20 animate-pulse">
                  <span className="text-xs font-bold text-white">Now</span>
                </div>
                <p className="text-[13px] font-semibold text-ink-primary mt-2 text-center max-w-[80px]">
                  Sales Team Lead
                </p>
                <p className="text-[10px] text-surface-blue mt-0.5 font-medium">
                  Current
                </p>
              </motion.div>

              {/* Node 3 - Future */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.7,
                  duration: 0.4,
                  ease: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number],
                }}
                className="relative z-10 flex flex-col items-center"
              >
                <div className="w-10 h-10 rounded-full bg-cream border-2 border-cream flex items-center justify-center">
                  <ArrowRight size={16} className="text-ink-tertiary" />
                </div>
                <p className="text-xs font-medium text-ink-tertiary mt-2 text-center max-w-[80px]">
                  Regional Sales Manager
                </p>
                <p className="text-[10px] text-ink-tertiary mt-0.5">
                  Target: Q2 2025
                </p>
              </motion.div>
            </div>

            {/* Readiness Score — computed via lib/prs.ts, same source as Career page */}
            <div className="pt-4 border-t border-[rgba(0,59,70,0.08)]">
              <p className="text-xs font-medium text-ink-tertiary">
                Promotion Readiness
              </p>
              <p className="text-[28px] font-bold text-surface-blue mt-1">{demoPrsScore}</p>
              <div className="w-full h-2 bg-parchment rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-surface-blue rounded-full transition-all duration-1000"
                  style={{ width: `${demoPrsScore}%` }}
                />
              </div>
              <p className="text-[11px] text-ink-tertiary mt-2">
                {demoPrsBand} · threshold 75
              </p>
            </div>
          </motion.div>

          {/* Pending Training */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35, ease: 'easeOut' }}
            className="bg-cream rounded-2xl p-6 shadow-card"
          >
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-sans text-lg font-semibold text-ink-primary">
                Pending Training
              </h3>
              <span className="bg-surface-rose text-ink-primary text-[11px] font-semibold px-2 py-0.5 rounded-full">
                {alerts.length}
              </span>
            </div>

            <div className="space-y-3">
              {alerts.map((alert, i) => (
                <motion.div
                  key={alert.title}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.4, ease: 'easeOut' }}
                  className="bg-surface-rose/[0.08] rounded-lg p-4 flex items-start gap-3"
                >
                  <AlertTriangle
                    size={20}
                    className="text-surface-rose flex-shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-ink-primary">
                      {alert.title}
                    </p>
                    <p className="text-[11px] text-ink-tertiary mt-0.5">
                      {alert.desc}
                    </p>
                  </div>
                  <button className="text-[11px] font-semibold bg-ink-primary text-parchment px-3 py-1.5 rounded-full hover:bg-ink-secondary transition-colors flex-shrink-0">
                    Enroll
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Section 3: Learning Path Timeline ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="bg-cream rounded-2xl p-6 shadow-card"
      >
        <h3 className="font-serif text-[28px] font-normal text-ink-primary mb-6">
          Your Learning Path
        </h3>

        <div className="relative flex items-start justify-between overflow-x-auto pb-4 px-2">
          {/* Connector line */}
          <div className="absolute top-5 left-8 right-8 h-[3px] bg-parchment z-0" />
          {/* Progress fill */}
          <div
            className="absolute top-5 left-8 h-[3px] bg-surface-blue z-0 transition-all duration-1000"
            style={{ width: 'calc(42% - 32px)' }}
          />

          {learningPath.map((node, i) => (
            <motion.div
              key={node.label}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: i * 0.15,
                duration: 0.4,
                ease: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number],
              }}
              className="relative z-10 flex flex-col items-center flex-shrink-0"
              style={{ width: `${100 / learningPath.length}%` }}
            >
              {node.state === 'completed' && (
                <div className="w-11 h-11 rounded-full bg-surface-sage flex items-center justify-center">
                  <CheckCircle size={20} className="text-white" />
                </div>
              )}
              {node.state === 'current' && (
                <div className="w-12 h-12 rounded-full bg-surface-blue flex items-center justify-center ring-4 ring-surface-blue/20 animate-pulse">
                  <ArrowRight size={20} className="text-white" />
                </div>
              )}
              {node.state === 'upcoming' && (
                <div className="w-11 h-11 rounded-full bg-cream border-2 border-dashed border-parchment flex items-center justify-center">
                  <Clock size={18} className="text-ink-tertiary" />
                </div>
              )}
              <p className="text-[11px] font-medium text-ink-secondary mt-2 text-center">
                {node.label}
              </p>
              <p className="text-[10px] text-ink-tertiary mt-0.5">{node.date}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Section 4: Wellness Quiz CTA ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative rounded-3xl overflow-hidden min-h-[200px] flex items-center"
        style={{
          backgroundImage: "url('/wellness-quiz-bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'rgba(248,245,240,0.85)',
            backdropFilter: 'blur(10px)',
          }}
        />
        <div className="relative z-10 flex items-center justify-between w-full p-10">
          <div>
            <h3 className="font-serif text-[28px] font-normal text-ink-primary">
              Boost Your Learning with Wellness
            </h3>
            <p className="text-ink-secondary text-base mt-2 max-w-[400px]">
              Research shows that wellbeing directly impacts learning retention.
              Take our 2-minute wellness quiz to get personalized tips.
            </p>
          </div>
          <button className="bg-ink-primary text-parchment px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-ink-secondary transition-all hover:-translate-y-0.5 flex-shrink-0 flex items-center gap-2">
            Take Wellness Quiz
            <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>
    </div>
  )
}
