'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Users,
  Award,
  BookOpen,
  Activity,
  TrendingUp,
  Star,
  Trophy,
  Flame,
  CheckCircle,
  Zap,
  ChevronRight,
  ArrowRight,
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import DailyNudgeCard from '@/components/DailyNudgeCard'
import AcademyProgressCard from '@/components/AcademyProgressCard'
import { ContinueWatchingCard, ExploreVisuallyStrip } from '@/components/DashboardMediaSections'
import { academies, iconMap } from '@/data/academies'

/* ───────── Animation helpers ───────── */
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0, 0, 0.2, 1] as [number, number, number, number] },
  }),
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.12, duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number] },
  }),
}

/* ───────── Rotating Starburst Badge ───────── */
function RotatingStarburst() {
  return (
    <div className="absolute top-6 right-6 w-[140px] h-[140px] animate-spin-slow">
      <svg viewBox="0 0 140 140" className="w-full h-full">
        {/* 8 triangular rays */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const angle = (i * 45 * Math.PI) / 180
          const x1 = 70
          const y1 = 70
          const x2 = 70 + 50 * Math.cos(angle - 0.25)
          const y2 = 70 + 50 * Math.sin(angle - 0.25)
          const x3 = 70 + 50 * Math.cos(angle + 0.25)
          const y3 = 70 + 50 * Math.sin(angle + 0.25)
          const colors = ['#a7c4d4', '#8c8a6e', '#c19a6b', '#e8e0d4', '#a7c4d4', '#8c8a6e', '#c19a6b', '#e8e0d4']
          return (
            <polygon
              key={i}
              points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`}
              fill={colors[i]}
              opacity={0.8}
            />
          )
        })}
        {/* Center circle */}
        <circle cx="70" cy="70" r="28" fill="#f8f5f0" stroke="#003b46" strokeWidth="1.5" />
        {/* Curved text */}
        <defs>
          <path id="circlePath" d="M 70,70 m -22,0 a 22,22 0 1,1 44,0 a 22,22 0 1,1 -44,0" />
        </defs>
        <text
          fill="#003b46"
          fontSize="7"
          fontWeight="600"
          fontFamily="Inter, sans-serif"
          letterSpacing="1"
        >
          <textPath href="#circlePath" textLength="130">
            EMPOWER ✦ GROW ✦ TRANSFORM ✦
          </textPath>
        </text>
      </svg>
    </div>
  )
}

/* ───────── Infinite Ticker ───────── */
function InfiniteTicker({ items, vertical = false }: { items: string[]; vertical?: boolean }) {
  const content = items.join(' ✦ ')
  return (
    <div className={cn(
      'overflow-hidden whitespace-nowrap',
      vertical ? 'h-full' : 'w-full'
    )}>
      <div
        className={cn(
          vertical ? 'animate-ticker-vertical' : 'animate-ticker',
          vertical ? 'writing-mode-vertical' : ''
        )}
        style={vertical ? { writingMode: 'vertical-rl', textOrientation: 'mixed' } : undefined}
      >
        <span className="inline-block">{content} ✦&nbsp;&nbsp;&nbsp;</span>
        <span className="inline-block">{content} ✦&nbsp;&nbsp;&nbsp;</span>
      </div>
    </div>
  )
}

/* ───────── Progress Ring ───────── */
function ProgressRing({ progress, size = 100 }: { progress: number; size?: number }) {
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#ede9e1"
        strokeWidth={strokeWidth}
        fill="none"
        opacity={0.5}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#a7c4d4"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        transform={`rotate(90 ${size / 2} ${size / 2})`}
        fill="#003b46"
        fontSize="18"
        fontWeight="700"
        fontFamily="Inter, sans-serif"
      >
        {progress}%
      </text>
    </svg>
  )
}

/* ───────── Mood Selector ───────── */
function MoodSelector() {
  const [selected, setSelected] = useState<number | null>(null)
  const moods = [
    { emoji: '\uD83D\uDE0A', label: 'Happy' },
    { emoji: '\uD83D\uDE10', label: 'Neutral' },
    { emoji: '\uD83D\uDE14', label: 'Sad' },
    { emoji: '\uD83D\uDE24', label: 'Frustrated' },
    { emoji: '\uD83D\uDE34', label: 'Tired' },
  ]

  return (
    <div className="flex gap-2 mt-3">
      {moods.map((mood, i) => (
        <button
          key={i}
          onClick={() => setSelected(i)}
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all duration-200',
            selected === i
              ? 'ring-2 ring-surface-blue ring-offset-2 bg-surface-blue/10'
              : 'hover:bg-[rgba(0,59,70,0.04)]'
          )}
          title={mood.label}
        >
          {mood.emoji}
        </button>
      ))}
    </div>
  )
}

/* ───────── KPI Stat Card ───────── */
function StatCard({
  icon: Icon,
  iconColor,
  number,
  label,
  trend,
  index,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  iconColor: string
  number: string
  label: string
  trend: string
  index: number
}) {
  return (
    <motion.div
      custom={index}
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="bg-cream rounded-2xl border border-[rgba(0,59,70,0.08)] p-8 shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        <div className={cn('p-3 rounded-xl', iconColor.replace('text-', 'bg-').replace('600', '100').replace('500', '100'))}>
          <Icon size={24} className={iconColor} />
        </div>
        <div className="flex-1">
          <p className="text-[32px] font-bold text-ink-primary leading-none">{number}</p>
          <p className="text-[11px] font-semibold text-ink-tertiary uppercase tracking-wide mt-1.5">{label}</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp size={14} className="text-surface-sage" />
            <span className="text-xs font-medium text-surface-sage">{trend}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ───────── Course Card ───────── */
function CourseCard({
  title,
  image,
  modules,
  duration,
  rating,
  index,
}: {
  title: string
  image: string
  modules: number
  duration: string
  rating: number
  index: number
}) {
  return (
    <motion.div
      custom={index}
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
      className="flex-shrink-0 w-[300px] bg-surface-cream rounded-xl overflow-hidden shadow-card hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 cursor-pointer scroll-snap-align-start"
    >
      <div className="overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-[170px] object-cover hover:scale-[1.03] transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <h3 className="text-base font-semibold text-ink-primary truncate">{title}</h3>
        <p className="text-xs text-ink-tertiary mt-1">
          {modules} modules &middot; {duration}
        </p>
        <div className="flex items-center gap-1.5 mt-2.5">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={14}
                className={s <= Math.round(rating / 20) ? 'text-accent-gold fill-accent-gold' : 'text-surface-beige'}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-ink-secondary">{rating}% rated</span>
        </div>
      </div>
    </motion.div>
  )
}

/* ───────── Leaderboard Row ───────── */
function LeaderboardRow({
  rank,
  name,
  department,
  points,
}: {
  rank: number
  name: string
  department: string
  points: string
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[rgba(0,59,70,0.06)] last:border-0 hover:bg-[rgba(0,59,70,0.03)] transition-colors px-2 -mx-2 rounded-lg">
      <div
        className={cn(
          'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
          rank <= 3 ? 'bg-surface-blue text-ink-primary' : 'bg-cream text-ink-tertiary'
        )}
      >
        {rank}
      </div>
      <div className="w-9 h-9 rounded-full bg-surface-warm flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-semibold text-ink-primary">
          {name.split(' ').map((n) => n[0]).join('')}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink-primary truncate">{name}</p>
        <p className="text-xs text-ink-tertiary">{department}</p>
      </div>
      <p className="text-sm font-bold text-ink-primary flex-shrink-0">{points}</p>
    </div>
  )
}

/* ───────── Home Page ───────── */
export default function Home() {
  const galleryRef = useRef<HTMLDivElement>(null)

  // Mouse wheel horizontal scroll
  useEffect(() => {
    const el = galleryRef.current
    if (!el) return
    const handleWheel = (e: WheelEvent) => {
      if (el.scrollWidth > el.clientWidth) {
        e.preventDefault()
        el.scrollLeft += e.deltaY * 0.5
      }
    }
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [])

  const kpiData = [
    { icon: Users, iconColor: 'text-surface-blue', number: '1,850', label: 'Employees Trained', trend: '+12% this quarter' },
    // Certifications = accomplished → silver (§4 accent reclassification)
    { icon: Award, iconColor: 'text-accent-silver', number: '4,200', label: 'Certifications Earned', trend: '+8% this month' },
    { icon: BookOpen, iconColor: 'text-surface-olive', number: '12,400', label: 'Courses Completed', trend: '+15% this quarter' },
    { icon: Activity, iconColor: 'text-surface-blue', number: '1,623', label: 'Active Learners Now', trend: '94% engagement rate' },
  ]

  const courses = [
    { title: 'Business Development Masterclass', image: '/course-thumb-bd.jpg', modules: 12, duration: '4.5h', rating: 89 },
    { title: 'Wellness Product Sales Techniques', image: '/course-thumb-sales.jpg', modules: 8, duration: '3h', rating: 92 },
    { title: 'CAD Design for Wellness Products', image: '/course-thumb-design.jpg', modules: 15, duration: '6h', rating: 87 },
    { title: 'Installation Best Practices', image: '/course-thumb-install.jpg', modules: 10, duration: '4h', rating: 95 },
    { title: 'Factory Safety & Production', image: '/course-thumb-factory.jpg', modules: 14, duration: '5.5h', rating: 91 },
    { title: 'Quality Control Fundamentals', image: '/course-thumb-qc.jpg', modules: 11, duration: '4h', rating: 88 },
  ]

  const learners = [
    { rank: 1, name: 'Sarah Chen', department: 'Business Development', points: '2,450 pts' },
    { rank: 2, name: 'Raj Patel', department: 'Sales', points: '2,180 pts' },
    { rank: 3, name: 'Maria Santos', department: 'Quality Control', points: '1,950 pts' },
    { rank: 4, name: 'James Wilson', department: 'Installation', points: '1,720 pts' },
    { rank: 5, name: 'Aisha Kumar', department: 'Marketing', points: '1,540 pts' },
  ]

  const tickerItems = [
    '240+ COURSES',
    '1,850 EMPLOYEES TRAINED',
    '4,200 CERTIFICATIONS EARNED',
    '98% COMPLETION RATE',
    '13 ACADEMIES',
  ]

  return (
    <div className="space-y-8 relative">
      {/* ─── Glanceable strip: in-progress academy first, then today's nudge ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,360px)_1fr] gap-4">
        {(() => {
          const inProgress = academies
            .map((a) => {
              const enrolled = a.courses.filter((c) => c.progress > 0)
              const avg = Math.round(
                a.courses.reduce((s, c) => s + c.progress, 0) / a.courses.length,
              )
              return { a, enrolled: enrolled.length, avg }
            })
            .filter((x) => x.enrolled > 0 && x.avg < 100)
            .sort((x, y) => y.avg - x.avg)[0]
          if (!inProgress) return null
          return (
            <AcademyProgressCard
              title={inProgress.a.name.replace(' Academy', '')}
              icon={iconMap[inProgress.a.icon]}
              iconColor={inProgress.a.color}
              completedModules={inProgress.a.courses.filter((c) => c.progress === 100).length}
              totalModules={inProgress.a.courses.length}
              progress={inProgress.avg}
              href={`/academy/${inProgress.a.id}`}
            />
          )
        })()}
        <DailyNudgeCard />
      </div>

      {/* ─── Section 1: Hero Dashboard ─── */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative rounded-2xl overflow-hidden min-h-[480px] flex flex-col"
      >
        {/* Background — real Magppie kitchen visual (magppie.com hero, §2),
            with a left parchment gradient so the dark headline stays readable
            over real photography. */}
        <div className="absolute inset-0">
          <img
            src="/hero-magppie-kitchen.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(248,245,240,0.92)] via-[rgba(248,245,240,0.55)] to-[rgba(248,245,240,0.08)]" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: "url('/paper-grain-texture.png')",
              backgroundSize: '200px',
            }}
          />
        </div>

        {/* Starburst badge */}
        <RotatingStarburst />

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-10 py-16 max-w-[55%]">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
            className="font-serif text-[72px] font-light text-ink-primary leading-[1.05]"
          >
            Welcome to<br />Your Learning<br />Journey
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
            className="text-lg text-ink-secondary mt-5 max-w-[480px] leading-relaxed"
          >
            Empower yourself with world-class training. Master your craft, earn certifications, and grow your career at Magppie.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
            className="flex items-center gap-4 mt-8"
          >
            <Link
              href="/academies"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-ink-primary text-parchment rounded-full text-sm font-semibold hover:bg-ink-secondary hover:-translate-y-px transition-all duration-200"
            >
              Explore Academies
            </Link>
            <Link
              href="/my-learning"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-ink-secondary rounded-full text-sm font-semibold hover:bg-[rgba(0,59,70,0.06)] transition-all duration-200"
            >
              My Dashboard <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>

        {/* Horizontal Stat Ticker */}
        <div className="relative z-10 bg-surface-beige py-3">
          <div className="flex items-center text-xs font-medium text-ink-primary uppercase tracking-widest">
            <InfiniteTicker items={tickerItems} />
          </div>
        </div>
      </motion.section>

      {/* ─── Section 2: KPI Stat Cards ─── */}
      <section className="grid grid-cols-4 gap-6">
        {kpiData.map((kpi, i) => (
          <StatCard key={i} {...kpi} index={i} />
        ))}
      </section>

      {/* ─── §8: Continue watching + Explore visually (academy-agnostic) ─── */}
      <ContinueWatchingCard />
      <ExploreVisuallyStrip />

      {/* ─── Section 3: Quick Access Cards ─── */}
      <section>
        <div className="mb-6">
          <h2 className="font-serif text-[32px] font-normal text-ink-primary">Quick Access</h2>
          <p className="text-sm text-ink-tertiary mt-1">Jump back into your learning</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Continue Learning */}
          <motion.div
            custom={0}
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="bg-surface-blue/20 rounded-2xl border border-[rgba(0,59,70,0.08)] p-8 shadow-card hover:shadow-elevated transition-all duration-300"
          >
            <h3 className="text-lg font-semibold text-ink-primary">Continue Where You Left Off</h3>
            <p className="text-base font-medium text-ink-secondary mt-3">Advanced Wellness Product Installation</p>
            <p className="text-xs text-ink-tertiary mt-1">Module 4 of 7 &mdash; 57% complete</p>
            <div className="mt-3">
              <Progress value={57} className="h-1 bg-cream/60" />
            </div>
            <Link
              href="/my-learning"
              className="inline-flex items-center gap-1 mt-5 px-5 py-2.5 bg-surface-blue text-ink-primary rounded-full text-sm font-semibold hover:brightness-95 hover:-translate-y-px transition-all duration-200"
            >
              Resume <ChevronRight size={14} />
            </Link>
          </motion.div>

          {/* Assigned Courses */}
          <motion.div
            custom={1}
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="bg-surface-cream rounded-2xl border border-[rgba(0,59,70,0.08)] p-8 shadow-card hover:shadow-elevated transition-all duration-300"
          >
            <h3 className="text-lg font-semibold text-ink-primary">Your Assignments</h3>
            <div className="mt-4 space-y-3">
              {[
                { name: 'Sales Fundamentals', due: 'Oct 15', status: 'In Progress', color: 'bg-surface-blue' },
                { name: 'Quality Standards 2024', due: 'Oct 22', status: 'Not Started', color: 'bg-surface-beige' },
                { name: 'Leadership Essentials', due: 'Nov 1', status: 'In Progress', color: 'bg-surface-blue' },
              ].map((course, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={cn('w-2 h-2 rounded-full', course.color)} />
                  <span className="text-sm text-ink-primary flex-1">{course.name}</span>
                  <span className="text-xs text-ink-tertiary">Due {course.due}</span>
                </div>
              ))}
            </div>
            <Link
              href="/my-learning"
              className="inline-flex items-center gap-1 mt-5 px-5 py-2.5 text-ink-secondary hover:bg-[rgba(0,59,70,0.06)] rounded-full text-sm font-semibold transition-all duration-200"
            >
              View All <ChevronRight size={14} />
            </Link>
          </motion.div>

          {/* Certification Progress */}
          <motion.div
            custom={2}
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="bg-surface-olive/15 rounded-2xl border border-[rgba(0,59,70,0.08)] p-8 shadow-card hover:shadow-elevated transition-all duration-300 flex items-center gap-6"
          >
            <ProgressRing progress={68} size={100} />
            <div>
              <h3 className="text-lg font-semibold text-ink-primary">Certification Track</h3>
              <p className="text-base font-medium text-ink-secondary mt-1">Level 3 &mdash; Advanced</p>
              <p className="text-xs text-ink-tertiary mt-1">2 courses to Level 4</p>
              <Link
                href="/certifications"
                className="inline-flex items-center gap-1 mt-4 px-5 py-2.5 text-ink-secondary hover:bg-[rgba(0,59,70,0.06)] rounded-full text-sm font-semibold transition-all duration-200"
              >
                View Track <ChevronRight size={14} />
              </Link>
            </div>
          </motion.div>

          {/* Wellness Check-in */}
          <motion.div
            custom={3}
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="bg-surface-warm rounded-2xl border border-[rgba(0,59,70,0.08)] p-8 shadow-card hover:shadow-elevated transition-all duration-300"
          >
            <h3 className="text-lg font-semibold text-ink-primary">Daily Wellness Check</h3>
            <p className="text-sm text-ink-tertiary mt-2">
              Take a moment for your wellbeing. Complete today&apos;s check-in.
            </p>
            <MoodSelector />
            <button className="mt-5 px-5 py-2.5 bg-ink-primary text-parchment rounded-full text-sm font-semibold hover:bg-ink-secondary hover:-translate-y-px transition-all duration-200">
              Submit Check-in
            </button>
          </motion.div>
        </div>
      </section>

      {/* ─── Section 4: Featured Courses ─── */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-serif text-[32px] font-normal text-ink-primary">Featured Courses</h2>
            <p className="text-sm text-ink-tertiary mt-1">Handpicked for your role</p>
          </div>
          <Link
            href="/academies"
            className="text-sm font-medium text-ink-secondary hover:text-ink-primary transition-colors flex items-center gap-1"
          >
            View All <ChevronRight size={14} />
          </Link>
        </div>

        <div
          ref={galleryRef}
          className="flex gap-5 overflow-x-auto hide-scrollbar scroll-snap-x mandatory pb-2"
        >
          {courses.map((course, i) => (
            <CourseCard key={i} {...course} index={i} />
          ))}
        </div>
      </section>

      {/* ─── Section 5: Leaderboard & Engagement ─── */}
      <section className="grid grid-cols-2 gap-6">
        {/* Top Learners */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
          className="bg-cream rounded-2xl border border-[rgba(0,59,70,0.08)] p-8 shadow-card"
        >
          <div className="flex items-center gap-2 mb-5">
            <Trophy size={20} className="text-accent-gold" />
            <h3 className="text-lg font-semibold text-ink-primary">Top Learners This Month</h3>
          </div>
          <div className="space-y-1">
            {learners.map((learner) => (
              <LeaderboardRow key={learner.rank} {...learner} />
            ))}
          </div>
        </motion.div>

        {/* Points & Achievements */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
          className="bg-surface-warm rounded-2xl border border-[rgba(0,59,70,0.08)] p-8 shadow-card"
        >
          <h3 className="text-lg font-semibold text-ink-primary mb-4">Your Points</h3>
          <p className="text-[42px] font-bold text-ink-primary leading-none">1,240</p>
          <div className="mt-3">
            <span className="inline-flex items-center px-3 py-1 bg-accent-gold text-ink-primary rounded-full text-xs font-semibold">
              Gold Learner
            </span>
          </div>
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-ink-tertiary">260 points to Platinum</span>
            </div>
            <Progress value={82.7} className="h-2 bg-cream/60" />
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold text-ink-primary mb-3">Recent Achievements</p>
            <div className="flex gap-3">
              {[
                { icon: Flame, label: '7-Day Streak', color: 'bg-orange-100 text-orange-600' },
                { icon: CheckCircle, label: 'Course Completer', color: 'bg-green-100 text-green-600' },
                { icon: Zap, label: 'Quiz Master', color: 'bg-yellow-100 text-yellow-600' },
              ].map((ach, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    ach.color
                  )}
                  title={ach.label}
                >
                  <ach.icon size={18} />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Section 6: CTA Footer ─── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #003b46, #1a4a4e)',
        }}
      >
        <div className="flex items-center justify-between px-10 py-10">
          <div className="max-w-lg">
            <h2 className="font-serif text-[32px] font-normal text-parchment leading-tight">
              Need Help Finding Your Path?
            </h2>
            <p className="text-base text-parchment/80 mt-3 leading-relaxed">
              Ask our AI Learning Assistant for personalized course recommendations and career guidance.
            </p>
          </div>
          <Link
            href="/ai-assistant"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-accent-gold text-ink-primary rounded-full text-sm font-semibold hover:brightness-95 hover:-translate-y-px transition-all duration-200 flex-shrink-0"
          >
            Chat with AI Assistant <ArrowRight size={16} />
          </Link>
        </div>
      </motion.section>

      {/* ─── Vertical Ticker (Right Edge) ─── */}
      <div className="fixed right-0 top-0 bottom-0 w-10 bg-surface-olive z-40 overflow-hidden hidden lg:flex items-center justify-center">
        <div className="text-[11px] font-semibold text-parchment uppercase tracking-widest h-full">
          <InfiniteTicker
            items={['LEARN', 'GROW', 'LEAD', 'TRANSFORM', 'ELEVATE']}
            vertical
          />
        </div>
      </div>

      {/* Right padding to account for vertical ticker */}
      <div className="hidden lg:block h-0 w-10" />
    </div>
  )
}
