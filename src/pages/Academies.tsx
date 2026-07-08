'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Search,
  ChevronDown,
  BookOpen,
  Users,
  Star,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { academies, recentlyAddedCourses, learningPaths, iconMap } from '@/data/academies'
import AcademyProgressCard from '@/components/AcademyProgressCard'
import type { CourseLevel } from '@/data/academies'

function LevelBadge({ level }: { level: CourseLevel }) {
  return (
    <span
      className={cn(
        'inline-block text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-md',
        level === 'Beginner' && 'bg-surface-sage/20 text-surface-sage',
        level === 'Intermediate' && 'bg-surface-blue/20 text-ink-secondary',
        level === 'Advanced' && 'bg-surface-rose/20 text-ink-secondary'
      )}
    >
      {level}
    </span>
  )
}
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemFadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0, 0, 0.2, 1] as [number, number, number, number] },
  },
}

const levelFilters: ('All' | CourseLevel)[] = ['All', 'Beginner', 'Intermediate', 'Advanced']

export default function Academies() {
  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState<'All' | CourseLevel>('All')
  const [sortBy, setSortBy] = useState('Most Popular')

  const filteredAcademies = useMemo(() => {
    let result = [...academies]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.shortDescription.toLowerCase().includes(q) ||
          a.courses.some((c) => c.title.toLowerCase().includes(q))
      )
    }

    if (levelFilter !== 'All') {
      result = result.filter((a) => a.courses.some((c) => c.level === levelFilter))
    }

    if (sortBy === 'Most Popular') {
      result.sort((a, b) => b.enrollmentCount - a.enrollmentCount)
    } else if (sortBy === 'Highest Rated') {
      result.sort((a, b) => b.avgRating - a.avgRating)
    } else if (sortBy === 'Most Courses') {
      result.sort((a, b) => b.courseCount - a.courseCount)
    }

    return result
  }, [searchQuery, levelFilter, sortBy])

  const featuredAcademy = academies[0]

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      {/* Section 1: Page Header */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          ease: [0, 0, 0.2, 1] as [number, number, number, number],
        }}
        className="pb-6 border-b border-[rgba(0,59,70,0.08)]"
      >
        <h1 className="font-serif text-5xl font-normal text-ink-primary">
          Explore Our Academies
        </h1>
        <p className="text-lg text-ink-secondary mt-3 max-w-[640px] leading-relaxed">
          13 specialized academies designed to help you master your craft and advance your career at Magppie.
        </p>

        {/* Search + Filter Bar */}
        <div className="flex flex-wrap items-center gap-4 mt-6">
          <div className="relative w-[360px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary"
              size={18}
            />
            <input
              type="text"
              placeholder="Search academies or courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-cream border border-[rgba(0,59,70,0.12)] rounded-lg pl-10 pr-4 py-2.5 text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-ink-primary focus:ring-[3px] focus:ring-[rgba(0,59,70,0.08)] transition-all"
            />
          </div>

          {/* Level Filter */}
          <div className="relative">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as 'All' | CourseLevel)}
              className="appearance-none bg-cream border border-[rgba(0,59,70,0.12)] rounded-lg pl-4 pr-10 py-2.5 text-sm text-ink-primary focus:outline-none focus:border-ink-primary cursor-pointer"
            >
              {levelFilters.map((f) => (
                <option key={f} value={f}>
                  {f === 'All' ? 'All Levels' : f}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary pointer-events-none"
              size={14}
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-cream border border-[rgba(0,59,70,0.12)] rounded-lg pl-4 pr-10 py-2.5 text-sm text-ink-primary focus:outline-none focus:border-ink-primary cursor-pointer"
            >
              <option>Most Popular</option>
              <option>Highest Rated</option>
              <option>Most Courses</option>
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary pointer-events-none"
              size={14}
            />
          </div>
        </div>
      </motion.section>

      {/* Section 2: Featured Academy */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          ease: [0, 0, 0.2, 1] as [number, number, number, number],
          delay: 0.1,
        }}
        className="relative overflow-hidden rounded-3xl bg-card border border-[rgba(0,59,70,0.08)] shadow-card p-10"
      >
        {/* Decorative pattern */}
        <div
          className="absolute right-0 top-0 w-1/2 h-full opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 70% 30%, rgba(184,112,63,0.2) 0%, transparent 60%)`,
          }}
        />
        <div className="absolute right-10 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-accent-copper/15 opacity-40" />
        <div className="absolute right-24 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-accent-copper/10 opacity-30" />

        <div className="relative z-10 max-w-[600px]">
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-accent-copper mb-3">
            FEATURED ACADEMY
          </p>
          <h2 className="font-serif text-4xl font-normal text-ink-primary mb-3">
            {featuredAcademy.name}
          </h2>
          <p className="text-base text-ink-secondary leading-relaxed mb-6">
            Master the art of wellness product business development. From market
            analysis to client relationship management, this academy covers
            everything you need to drive growth.
          </p>

          <div className="flex flex-wrap gap-3 mb-6">
            {[
              { icon: BookOpen, label: `${featuredAcademy.courseCount} Courses` },
              { icon: Users, label: `${featuredAcademy.enrollmentCount} Enrolled` },
              { icon: Star, label: `${featuredAcademy.avgRating} Avg Rating` },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                className="flex items-center gap-2 bg-cream border border-[rgba(0,59,70,0.08)] rounded-full px-4 py-2"
              >
                <stat.icon size={16} className="text-ink-secondary" />
                <span className="text-sm text-ink-primary font-medium">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>

          <Link
            href={`/academy/${featuredAcademy.id}`}
            className="inline-flex items-center gap-2 bg-accent-copper text-stone-ivory px-7 py-3.5 rounded-full text-sm font-semibold hover:brightness-95 hover:-translate-y-px transition-all"
          >
            Explore Academy
            <ArrowRight size={16} />
          </Link>
        </div>
      </motion.section>

      {/* Section 3: Academy Grid */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="font-serif text-2xl font-normal text-ink-primary">
            All Academies
          </h2>
          <span className="inline-flex items-center justify-center bg-[rgba(0,59,70,0.06)] text-ink-secondary text-xs font-medium rounded-full px-3 py-1">
            {filteredAcademies.length}
          </span>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredAcademies.map((academy) => {
            const IconComponent = iconMap[academy.icon] || BookOpen
            const avgProgress = Math.round(
              academy.courses.reduce((sum, c) => sum + c.progress, 0) /
                academy.courses.length
            )
            const enrolledCourses = academy.courses.filter(
              (c) => c.progress > 0
            ).length
            const completedCourses = academy.courses.filter(
              (c) => c.progress === 100
            ).length

            return (
              <motion.div key={academy.id} variants={itemFadeUp}>
                <Link
                  href={`/academy/${academy.id}`}
                  className="group block bg-cream rounded-2xl border border-[rgba(0,59,70,0.08)] overflow-hidden shadow-card hover:shadow-elevated hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Top color strip */}
                  <div
                    className="h-1.5 w-full transition-all duration-300 group-hover:h-2"
                    style={{ backgroundColor: academy.color }}
                  />

                  <div className="p-5">
                    {/* Icon — a photo when the academy has one, else the Lucide glyph */}
                    {academy.image ? (
                      <img
                        src={academy.image}
                        alt={`${academy.name} thumbnail`}
                        className="w-11 h-11 rounded-full object-cover mb-4 border-2"
                        style={{ borderColor: academy.color }}
                      />
                    ) : (
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center mb-4"
                        style={{ backgroundColor: `${academy.color}25` }}
                      >
                        <IconComponent
                          size={22}
                          style={{ color: academy.color }}
                        />
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="text-base font-semibold text-ink-primary mb-1.5 leading-snug">
                      {academy.name.replace(' Academy', '')}
                    </h3>

                    {/* Description */}
                    <p className="text-[13px] text-ink-tertiary leading-relaxed line-clamp-2 mb-4">
                      {academy.shortDescription}
                    </p>

                    {/* Meta row */}
                    <div className="flex items-center gap-4 text-ink-tertiary">
                      <div className="flex items-center gap-1.5">
                        <BookOpen size={14} />
                        <span className="text-xs font-medium">
                          {academy.courseCount} Courses
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        <span className="text-xs font-medium">
                          {academy.totalHours}h avg
                        </span>
                      </div>
                    </div>

                    {/* Progress ring + status badge (modernization §1) */}
                    {enrolledCourses > 0 && (
                      <div className="mt-4 pt-4 border-t-[0.5px] border-[rgba(0,59,70,0.1)] dark:border-[rgba(255,255,255,0.08)]">
                        <AcademyProgressCard
                          variant="inline"
                          title="Your progress"
                          icon={IconComponent}
                          iconColor={academy.color}
                          completedModules={completedCourses}
                          totalModules={academy.courses.length}
                          progress={avgProgress}
                        />
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>

        {filteredAcademies.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search size={48} className="text-ink-tertiary mb-4" />
            <h3 className="font-serif text-xl text-ink-primary mb-2">
              Explore a different corner
            </h3>
            <p className="text-sm text-ink-tertiary">
              Nothing matches this search — try a broader term or clear the filters
            </p>
          </div>
        )}
      </section>

      {/* Section 4: Recently Added Courses */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-2xl font-normal text-ink-primary">
            Recently Added
          </h2>
          <Link
            href="/academies"
            className="text-sm font-medium text-ink-secondary hover:text-ink-primary flex items-center gap-1 transition-colors"
          >
            View All
            <ArrowRight size={14} />
          </Link>
        </div>

        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-5 pb-2">
            {recentlyAddedCourses.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: idx * 0.08,
                  duration: 0.5,
                  ease: [0, 0, 0.2, 1] as [number, number, number, number],
                }}
                className="w-[280px] flex-shrink-0"
              >
                <div className="bg-surface-cream rounded-xl border border-[rgba(0,59,70,0.08)] overflow-hidden shadow-card hover:shadow-elevated hover:-translate-y-1 transition-all duration-300">
                  {/* Thumbnail placeholder */}
                  <div className="relative h-[140px] bg-surface-mid/20 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen size={32} className="text-surface-mid/50" />
                    </div>
                    {course.isNew && (
                      <span className="absolute top-3 left-3 bg-surface-rose text-ink-primary text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-md">
                        NEW
                      </span>
                    )}
                  </div>

                  <div className="p-4 whitespace-normal">
                    <p className="text-[11px] font-medium text-ink-tertiary uppercase tracking-wide mb-1.5">
                      {course.academy}
                    </p>
                    <h3 className="text-[15px] font-semibold text-ink-primary mb-2 leading-snug line-clamp-2">
                      {course.title}
                    </h3>
                    <div className="flex items-center gap-3 text-ink-tertiary">
                      <span className="flex items-center gap-1 text-xs">
                        <BookOpen size={12} />
                        {course.modules} modules
                      </span>
                      <span className="flex items-center gap-1 text-xs">
                        <Clock size={12} />
                        {course.duration}
                      </span>
                    </div>
                    <div className="mt-3">
                      <LevelBadge level={course.level as CourseLevel} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </motion.section>

      {/* Section 5: Learning Paths */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        className="pb-4"
      >
        <div className="mb-5">
          <h2 className="font-serif text-2xl font-normal text-ink-primary mb-1">
            Learning Paths
          </h2>
          <p className="text-sm text-ink-tertiary">
            Structured career progression tracks
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {learningPaths.map((path, idx) => {
            const PathIcon = iconMap[path.icon] || BookOpen
            return (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: idx * 0.15,
                  duration: 0.5,
                  ease: [0, 0, 0.2, 1] as [number, number, number, number],
                }}
                className="bg-cream rounded-2xl border border-[rgba(0,59,70,0.08)] p-6 shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300"
              >
                {/* Top strip + icon + title */}
                <div className="flex items-start gap-4 mb-5">
                  <div
                    className="w-1 h-10 rounded-full flex-shrink-0"
                    style={{ backgroundColor: path.color }}
                  />
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${path.color}20` }}
                  >
                    <PathIcon size={18} style={{ color: path.color }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-ink-primary">
                      {path.title}
                    </h3>
                    <p className="text-xs text-ink-tertiary mt-0.5">
                      {path.department}
                    </p>
                  </div>
                </div>

                {/* Path visualization */}
                <div className="flex items-center gap-1 mb-4 px-1">
                  {path.stages.map((stage, sIdx) => (
                    <div key={stage.label} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className={cn(
                            'w-4 h-4 rounded-full border-2 transition-all',
                            stage.status === 'completed' &&
                              'bg-surface-sage border-surface-sage',
                            stage.status === 'current' &&
                              'bg-surface-blue border-surface-blue shadow-[0_0_0_3px_rgba(167,196,212,0.3)]',
                            stage.status === 'future' &&
                              'bg-transparent border-[rgba(0,59,70,0.2)]'
                          )}
                        />
                        <span className="text-[10px] font-medium text-ink-tertiary mt-1.5 text-center leading-tight">
                          {stage.label}
                        </span>
                      </div>
                      {sIdx < path.stages.length - 1 && (
                        <div
                          className={cn(
                            'h-[2px] flex-1 mb-5',
                            stage.status === 'completed'
                              ? 'bg-surface-sage'
                              : 'bg-[rgba(0,59,70,0.1)]'
                          )}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Description */}
                <p className="text-[13px] text-ink-tertiary leading-relaxed mb-4">
                  {path.description}
                </p>

                {/* CTA */}
                <button className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary hover:text-ink-primary hover:bg-[rgba(0,59,70,0.04)] px-3 py-1.5 rounded-full transition-all">
                  View Path
                  <ArrowRight size={14} />
                </button>
              </motion.div>
            )
          })}
        </div>
      </motion.section>
    </div>
  )
}
