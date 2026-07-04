'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  Target,
  Users,
  Award,
  ArrowRight,
  Lock,
  CheckCircle,
  Clock,
  TrendingUp,
  BookOpen,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PRS_COMPONENT_LABELS, type PrsComponent } from '@/lib/prs'
import {
  demoPrsScore,
  demoPrsBand,
  demoPrsPoints,
} from '@/data/prs-demo'

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const radarData = [
  { skill: 'Product Knowledge', current: 85, required: 90 },
  { skill: 'Sales Skills', current: 92, required: 95 },
  { skill: 'Leadership', current: 65, required: 85 },
  { skill: 'Communication', current: 78, required: 85 },
  { skill: 'Strategic Thinking', current: 58, required: 80 },
  { skill: 'Team Management', current: 70, required: 85 },
]

const devPlan = [
  { skill: 'Leadership', current: 65, required: 85, gap: 20, action: 'Leadership Essentials course' },
  { skill: 'Strategic Thinking', current: 58, required: 80, gap: 22, action: 'Strategic Planning workshop' },
  { skill: 'Team Management', current: 70, required: 85, gap: 15, action: 'Team Management fundamentals' },
  { skill: 'Communication', current: 78, required: 85, gap: 7, action: 'Advanced Communication Skills' },
  { skill: 'Product Knowledge', current: 85, required: 90, gap: 5, action: 'Product Deep Dive series' },
  { skill: 'Sales Skills', current: 92, required: 95, gap: 3, action: 'Master Sales Techniques' },
]

const certifications = [
  {
    level: 3,
    name: 'Advanced',
    desc: 'Advanced certification in your domain',
    status: 'earned' as const,
    date: 'Earned Aug 2024',
    color: 'bg-surface-sage',
    btn: 'Verified',
  },
  {
    level: 4,
    name: 'Specialist',
    desc: 'Specialist-level expertise',
    status: 'in-progress' as const,
    date: 'Due Dec 2024',
    color: 'bg-surface-blue',
    btn: 'In Progress',
  },
  {
    level: 0,
    name: 'Leadership Essentials',
    desc: 'Management fundamentals',
    status: 'pending' as const,
    date: 'Due Jan 2025',
    color: 'bg-accent-gold',
    btn: 'Enroll Now',
  },
  {
    level: 0,
    name: 'Strategic Planning',
    desc: 'Strategic thinking certification',
    status: 'pending' as const,
    date: 'Due Feb 2025',
    color: 'bg-surface-mid',
    btn: 'Enroll Now',
  },
]

const careerPaths = [
  {
    from: 'Sales',
    to: 'Operations Manager',
    color: 'bg-surface-olive',
    desc: 'Customer-focused operations leader',
    skills: ['Sales', 'Logistics', 'Leadership'],
    roles: 5,
    years: 4,
  },
  {
    from: 'Quality',
    to: 'Product Manager',
    color: 'bg-surface-blue',
    desc: 'Product strategy and quality combined',
    skills: ['Quality', 'Design', 'Strategy'],
    roles: 4,
    years: 3,
  },
  {
    from: 'Design',
    to: 'R&D Lead',
    color: 'bg-accent-gold',
    desc: 'Innovation through design thinking',
    skills: ['Design', 'Engineering', 'Research'],
    roles: 5,
    years: 4,
  },
  {
    from: 'Any',
    to: 'General Leadership',
    color: 'bg-ink-primary',
    desc: 'Cross-functional leadership track',
    skills: ['Leadership', 'Strategy', 'Communication'],
    roles: 4,
    years: 3,
  },
]

const actions = [
  {
    priority: 'high' as const,
    tag: 'High Priority',
    title: 'Enroll in Leadership Essentials',
    desc: 'Required for next promotion. Covers team management, conflict resolution, and delegation.',
    due: 'Due Nov 15',
    btn: 'Enroll',
    btnStyle: 'primary' as const,
  },
  {
    priority: 'medium' as const,
    tag: 'Medium',
    title: 'Complete Strategic Planning Workshop',
    desc: 'Develop strategic thinking skills through case studies and simulations.',
    due: 'Due Dec 1',
    btn: 'Register',
    btnStyle: 'secondary' as const,
  },
  {
    priority: 'low' as const,
    tag: 'Recommended',
    title: 'Schedule 1:1 with Your Manager',
    desc: 'Discuss promotion readiness and create a development timeline.',
    due: 'Recommended',
    btn: 'Schedule',
    btnStyle: 'ghost' as const,
  },
]

/* ------------------------------------------------------------------ */
/*  ANIMATION                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  PROGRESS RING                                                      */
/* ------------------------------------------------------------------ */

function ReadinessRing({ pct }: { pct: number }) {
  const size = 100
  const stroke = 6
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 600)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#C88255"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={animated ? circ * (1 - pct / 100) : circ}
          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
        />
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  MAIN PAGE                                                          */
/* ------------------------------------------------------------------ */

export default function Career() {
  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* ── Section 1: Page Hero ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative rounded-3xl overflow-hidden"
      >
        {/* Background image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/career-path-bg.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-stone-charcoal/85" />

        <div className="relative z-10 p-10">
          <p className="text-accent-gold text-[11px] font-semibold uppercase tracking-[2px]">
            Career Development
          </p>
          <h1 className="font-serif text-[52px] font-normal text-stone-ivory mt-2 leading-tight">
            Your Career at Magppie
          </h1>
          <p className="text-stone-ivory/80 text-lg mt-3 max-w-[560px] leading-relaxed">
            Visualize your career progression, identify skill gaps, and take
            actionable steps toward your next promotion.
          </p>

          {/* Career Path Selector */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="flex items-center gap-3 mt-5"
          >
            <span className="text-stone-ivory/70 text-[13px] font-medium">
              Current Track:
            </span>
            <div
              className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-stone-ivory cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}
            >
              Sales &rarr; Management
              <TrendingUp size={14} className="text-accent-gold" />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Section 2: Career Progression Visual ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="bg-cream rounded-3xl p-8 shadow-card"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {/* Current Position */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
            className="bg-surface-sage/15 rounded-2xl p-6"
          >
            <p className="text-[10px] font-semibold uppercase text-surface-sage tracking-wide">
              Current Position
            </p>
            <h3 className="font-serif text-[28px] font-normal text-ink-primary mt-2">
              Sales Team Lead
            </h3>
            <p className="text-[13px] font-medium text-ink-tertiary mt-1">
              Sales
            </p>
            <p className="text-xs text-ink-tertiary mt-1">
              Since January 2024
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              {[
                { icon: Target, label: '120% of quota', color: 'text-surface-sage' },
                { icon: Users, label: '5 team members', color: 'text-surface-blue' },
                { icon: Award, label: 'Top performer Q3', color: 'text-accent-gold' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-1.5 bg-parchment rounded-full px-3 py-1.5"
                >
                  <s.icon size={14} className={s.color} />
                  <span className="text-[11px] font-medium text-ink-secondary">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Arrow connector */}
          <div className="hidden md:flex items-center justify-center">
            <motion.div
              animate={{ x: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ArrowRight size={48} className="text-accent-gold" />
            </motion.div>
          </div>

          {/* Next Position */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
            className="bg-surface-blue/15 rounded-2xl p-6"
          >
            <p className="text-[10px] font-semibold uppercase text-surface-blue tracking-wide">
              Next Position
            </p>
            <h3 className="font-serif text-[28px] font-normal text-ink-primary mt-2">
              Regional Sales Manager
            </h3>
            <p className="text-[13px] font-medium text-ink-tertiary mt-1">
              Sales
            </p>
            <p className="text-xs text-surface-blue mt-1 font-medium">
              Target: Q2 2025
            </p>
            <p className="text-xs text-ink-tertiary mt-1">
              Competitive uplift
            </p>

            {/* Promotion Readiness Score — computed via lib/prs.ts (35/25/25/15) */}
            <div className="mt-4 bg-stone-espresso rounded-xl p-5 text-center">
              <p className="text-[10px] font-semibold uppercase text-accent-gold tracking-wide">
                Readiness Score
              </p>
              <div className="flex items-center justify-center gap-4 mt-3">
                <ReadinessRing pct={demoPrsScore} />
                <div className="text-left">
                  <p className="text-[48px] font-bold text-stone-ivory leading-none">
                    {demoPrsScore}
                  </p>
                  <span className="inline-block bg-surface-sage text-stone-ivory text-[11px] font-semibold px-2.5 py-0.5 rounded-full mt-2">
                    {demoPrsBand}
                  </span>
                </div>
              </div>
              <div className="mt-4 space-y-1.5 text-left">
                {(Object.keys(demoPrsPoints) as PrsComponent[]).map((key) => (
                  <div key={key} className="flex items-center justify-between gap-3">
                    <span className="text-[11px] text-stone-ivory/70">
                      {PRS_COMPONENT_LABELS[key]}
                    </span>
                    <span className="text-[11px] font-semibold text-stone-ivory tabular-nums">
                      {demoPrsPoints[key].earned} / {demoPrsPoints[key].max}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-stone-ivory/70 mt-3">
                Promotion threshold: 75
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Section 3: Skill Gap Analysis ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-5">
        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-cream rounded-2xl p-6 shadow-card"
        >
          <h3 className="font-sans text-lg font-semibold text-ink-primary mb-4">
            Skill Gap Analysis
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="65%">
                <PolarGrid
                  stroke="rgba(0,59,70,0.08)"
                />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{ fontSize: 11, fill: '#1a4a4e', fontFamily: 'Inter', fontWeight: 500 }}
                />
                <Radar
                  name="Current"
                  dataKey="current"
                  stroke="#a7c4d4"
                  strokeWidth={2}
                  fill="#a7c4d4"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Required"
                  dataKey="required"
                  stroke="#B8703F"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  fill="none"
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, fontFamily: 'Inter' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Skill Development Plan */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-cream rounded-2xl p-6 shadow-card"
        >
          <h3 className="font-sans text-lg font-semibold text-ink-primary mb-4">
            Development Plan
          </h3>

          <div className="space-y-4">
            {devPlan.map((item, i) => (
              <motion.div
                key={item.skill}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] font-semibold text-ink-primary">
                    {item.skill}
                  </span>
                  <span className="text-[11px] text-ink-tertiary">
                    {item.current}/{item.required}
                  </span>
                </div>

                {/* Two-segment bar */}
                <div className="flex gap-0.5 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-surface-blue rounded-l-full transition-all duration-700"
                    style={{ width: `${(item.current / item.required) * 100}%` }}
                  />
                  <div
                    className="bg-accent-gold rounded-r-full transition-all duration-700"
                    style={{
                      width: `${((item.required - item.current) / item.required) * 100}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-ink-tertiary">
                    Gap: {item.gap} pts
                  </span>
                  <span className="text-[10px] text-surface-blue font-medium cursor-pointer hover:underline">
                    {item.action}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Section 4: Required Certifications ── */}
      <div>
        <h3 className="font-sans text-lg font-semibold text-ink-primary mb-4">
          Required Certifications
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {certifications.map((cert, i) => (
            <motion.div
              key={cert.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="bg-cream rounded-2xl p-5 shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all"
            >
              {/* Status icon */}
              <div className="flex justify-end mb-2">
                {cert.status === 'earned' && (
                  <CheckCircle size={20} className="text-surface-sage" />
                )}
                {cert.status === 'in-progress' && (
                  <Clock size={20} className="text-surface-blue" />
                )}
                {cert.status === 'pending' && (
                  <Lock size={20} className="text-ink-tertiary" />
                )}
              </div>

              {/* Level badge */}
              {cert.level > 0 ? (
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center mb-3',
                    cert.color,
                    'bg-opacity-20'
                  )}
                >
                  <span className="text-sm font-bold text-ink-primary">
                    L{cert.level}
                  </span>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-surface-mid/20 flex items-center justify-center mb-3">
                  <BookOpen size={18} className="text-surface-mid" />
                </div>
              )}

              <h4 className="text-sm font-semibold text-ink-primary">
                {cert.name}
              </h4>
              <p className="text-xs text-ink-tertiary mt-1">{cert.desc}</p>
              <p
                className={cn(
                  'text-[11px] mt-2',
                  cert.status === 'earned'
                    ? 'text-surface-sage'
                    : cert.status === 'in-progress'
                      ? 'text-surface-blue'
                      : 'text-ink-tertiary'
                )}
              >
                {cert.date}
              </p>

              <button
                className={cn(
                  'mt-3 w-full text-xs font-semibold py-2 rounded-full transition-colors',
                  cert.status === 'earned'
                    ? 'bg-surface-sage/15 text-surface-sage cursor-default'
                    : cert.status === 'in-progress'
                      ? 'bg-surface-blue/15 text-ink-primary hover:bg-surface-blue/25'
                      : 'bg-ink-primary text-parchment hover:bg-ink-secondary'
                )}
              >
                {cert.btn}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Section 5: Career Paths Explorer ── */}
      <div>
        <div className="mb-4">
          <h3 className="font-serif text-[28px] font-normal text-ink-primary">
            Explore Other Career Paths
          </h3>
          <p className="text-sm text-ink-tertiary mt-1">
            See how skills transfer across departments
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {careerPaths.map((path, i) => (
            <motion.div
              key={path.to}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.4 }}
              className="bg-cream rounded-2xl p-6 shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all"
            >
              {/* Color strip */}
              <div className={cn('h-1 w-full rounded-full mb-4', path.color)} />

              <p className="text-xs font-medium text-ink-tertiary">
                {path.from} &rarr; {path.to}
              </p>
              <h4 className="text-base font-semibold text-ink-primary mt-1">
                {path.to}
              </h4>
              <p className="text-xs text-ink-tertiary mt-1">{path.desc}</p>

              {/* Transferable skills */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {path.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-[11px] font-medium bg-[rgba(0,59,70,0.06)] text-ink-secondary px-2.5 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-ink-tertiary">
                  {path.roles} roles &rarr; {path.years} years avg
                </span>
                <button className="text-xs font-medium text-ink-secondary hover:text-ink-primary transition-colors flex items-center gap-1">
                  View Path <ArrowRight size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Section 6: Development Actions ── */}
      <div>
        <h3 className="font-sans text-lg font-semibold text-ink-primary mb-4">
          Recommended Next Steps
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actions.map((action, i) => {
            const borderColor =
              action.priority === 'high'
                ? 'border-l-red-500'
                : action.priority === 'medium'
                  ? 'border-l-amber-500'
                  : 'border-l-green-500'

            const tagColor =
              action.priority === 'high'
                ? 'bg-red-500/10 text-red-600'
                : action.priority === 'medium'
                  ? 'bg-amber-500/10 text-amber-600'
                  : 'bg-green-500/10 text-green-600'

            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: 'easeOut' }}
                className={cn(
                  'bg-cream rounded-2xl p-5 shadow-card border-l-4',
                  borderColor
                )}
              >
                <span
                  className={cn(
                    'inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full mb-3',
                    tagColor
                  )}
                >
                  {action.tag}
                </span>

                <h4 className="text-sm font-semibold text-ink-primary">
                  {action.title}
                </h4>
                <p className="text-xs text-ink-tertiary mt-1.5 leading-relaxed">
                  {action.desc}
                </p>

                <div className="flex items-center justify-between mt-4">
                  <span className="flex items-center gap-1 text-[11px] text-ink-tertiary">
                    <Calendar size={12} />
                    {action.due}
                  </span>
                  <button
                    className={cn(
                      'text-xs font-semibold px-4 py-2 rounded-full transition-colors',
                      action.btnStyle === 'primary' &&
                        'bg-ink-primary text-parchment hover:bg-ink-secondary',
                      action.btnStyle === 'secondary' &&
                        'bg-surface-blue text-ink-primary hover:bg-surface-blue/80',
                      action.btnStyle === 'ghost' &&
                        'text-ink-secondary hover:bg-[rgba(0,59,70,0.06)]'
                    )}
                  >
                    {action.btn}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
