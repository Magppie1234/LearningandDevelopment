'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Clock,
  GraduationCap,
  Layers,
  Search,
  Star,
  Users,
} from 'lucide-react'
import {
  Button,
  Card,
  Drawer,
  Empty,
  FilterBar,
  PageHeader,
  Section,
  Segmented,
  StatusBadge,
  type FilterValues,
} from '@/components/ds'
import { academies, type Academy, type Course } from '@/data/academies'
import { useRole } from '@/lib/role-context'
import { departmentBySlug } from '@/data/workforce'
import { academyForDepartment } from '@/lib/learning-plan'
import { cn } from '@/lib/utils'

/**
 * Course Catalogue.
 *
 * Everything available to learn, separate from what has been assigned. The
 * catalogue answers the four things a learner needs before committing: what it
 * covers, how long it takes, what it assumes they already know, and what they
 * can do once it is finished.
 *
 * Course content here is the authored academy catalogue. Per-course progress
 * is deliberately NOT shown: the catalogue's `status`/`progress` fields are
 * fixed authoring defaults that are identical for every learner, so rendering
 * them as personal progress would be sample data presented as live data. A
 * learner's real position is on My Learning, which derives from their evidence.
 */

type View = 'paths' | 'courses'

const EMPTY_FILTERS: FilterValues = { level: 'all', academy: 'all' }

interface CatalogueCourse extends Course {
  academyId: string
  academyName: string
}

export default function Catalogue() {
  const { member } = useRole()
  const [view, setView] = useState<View>('paths')
  const [filters, setFilters] = useState<FilterValues>(EMPTY_FILTERS)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<CatalogueCourse | null>(null)

  const dept = member ? departmentBySlug(member.departmentSlug) : undefined
  const myAcademy = member ? academyForDepartment(member.departmentSlug) : undefined

  const allCourses = useMemo<CatalogueCourse[]>(
    () =>
      academies.flatMap((a) =>
        a.courses.map((c) => ({ ...c, academyId: a.id, academyName: a.name })),
      ),
    [],
  )

  const courses = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allCourses.filter((c) => {
      if (filters.level !== 'all' && c.level !== filters.level) return false
      if (filters.academy !== 'all' && c.academyId !== filters.academy) return false
      if (
        q &&
        !c.title.toLowerCase().includes(q) &&
        !c.description.toLowerCase().includes(q) &&
        !c.academyName.toLowerCase().includes(q)
      )
        return false
      return true
    })
  }, [allCourses, filters, query])

  const paths = useMemo(() => {
    if (filters.academy === 'all') return academies
    return academies.filter((a) => a.id === filters.academy)
  }, [filters.academy])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course catalogue"
        description="Every learning path and course available to you, with the time it takes and what it prepares you for. What has been assigned to you is on My Learning."
        actions={
          <Button href="/my-learning" icon={BookOpen}>
            My assigned learning
          </Button>
        }
      >
        <div className="flex flex-wrap items-center gap-3">
          <Segmented
            label="Catalogue view"
            value={view}
            onChange={setView}
            options={[
              { value: 'paths', label: 'Learning paths', count: academies.length },
              { value: 'courses', label: 'All courses', count: allCourses.length },
            ]}
          />
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary pointer-events-none"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses and paths…"
              aria-label="Search the catalogue"
              className="w-full h-9 pl-8 pr-3 rounded-lg border border-hairline/15 bg-parchment text-[13px] text-ink-primary placeholder:text-ink-tertiary focus:border-accent-copper focus:outline-none transition-colors"
            />
          </div>
        </div>
        <FilterBar
          filters={[
            {
              id: 'academy',
              label: 'Learning path',
              options: academies.map((a) => ({
                value: a.id,
                label: a.name,
                count: a.courses.length,
              })),
            },
            {
              id: 'level',
              label: 'Level',
              options: ['Beginner', 'Intermediate', 'Advanced'].map((l) => ({
                value: l,
                label: l,
                count: allCourses.filter((c) => c.level === l).length,
              })),
            },
          ]}
          values={filters}
          onChange={setFilters}
          onReset={() => {
            setFilters(EMPTY_FILTERS)
            setQuery('')
          }}
          scopeNote={
            view === 'courses'
              ? `${courses.length} of ${allCourses.length} courses`
              : `${paths.length} of ${academies.length} paths`
          }
        />
      </PageHeader>

      {myAcademy && dept && (
        <Section
          title={`Recommended for ${dept.name}`}
          description="The learning path aligned to your department's competency framework."
        >
          <PathCard academy={myAcademy} highlight />
        </Section>
      )}

      {view === 'paths' ? (
        paths.length === 0 ? (
          <Empty
            icon={GraduationCap}
            headline="No learning paths match"
            support="Clear the filters to see every authored path."
            action={<Button onClick={() => setFilters(EMPTY_FILTERS)}>Reset filters</Button>}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paths.map((a) => (
              <PathCard key={a.id} academy={a} />
            ))}
          </div>
        )
      ) : courses.length === 0 ? (
        <Empty
          icon={Search}
          headline="No courses match"
          support={
            query
              ? `Nothing matches “${query}”. Try a shorter term or clear the filters.`
              : 'Clear the filters to see the whole catalogue.'
          }
          action={
            <Button
              onClick={() => {
                setFilters(EMPTY_FILTERS)
                setQuery('')
              }}
            >
              Reset
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((c) => (
            <button
              key={`${c.academyId}-${c.id}`}
              type="button"
              onClick={() => setOpen(c)}
              className="text-left rounded-2xl bg-parchment border border-hairline/10 shadow-card p-4 hover:shadow-raised transition-shadow"
            >
              <p className="text-[11px] text-ink-tertiary truncate">{c.academyName}</p>
              <h3 className="text-[14px] font-semibold text-ink-primary mt-1 leading-snug">
                {c.title}
              </h3>
              <p className="text-[12px] text-ink-secondary mt-1.5 line-clamp-2">{c.description}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3 text-[11px] text-ink-tertiary">
                <span className="inline-flex items-center gap-1">
                  <Clock size={11} aria-hidden /> {c.duration}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Layers size={11} aria-hidden /> {c.modules} modules
                </span>
                <StatusBadge
                  size="sm"
                  tone={c.level === 'Beginner' ? 'success' : c.level === 'Advanced' ? 'danger' : 'info'}
                  label={c.level}
                  icon={GraduationCap}
                />
              </div>
            </button>
          ))}
        </div>
      )}

      <Drawer
        open={open != null}
        onClose={() => setOpen(null)}
        title={open?.title ?? ''}
        subtitle={open ? `${open.academyName} · ${open.level}` : undefined}
        width="lg"
        footer={
          open && (
            <>
              <Button onClick={() => setOpen(null)}>Close</Button>
              <Button variant="primary" href={`/academy/${open.academyId}`}>
                Open learning path
              </Button>
            </>
          )
        }
      >
        {open && (
          <div className="space-y-5">
            <p className="text-[13px] text-ink-secondary leading-relaxed">{open.description}</p>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Duration', value: open.duration },
                { label: 'Modules', value: String(open.modules) },
                { label: 'Level', value: open.level },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-cream px-3 py-2.5">
                  <p className="text-[11px] uppercase tracking-wide text-ink-tertiary">{s.label}</p>
                  <p className="text-[15px] font-semibold text-ink-primary">{s.value}</p>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-[13px] font-semibold text-ink-primary">
                What you will be able to do
              </h3>
              <ul className="mt-2 space-y-1.5">
                {open.learningObjectives.map((o) => (
                  <li key={o} className="flex items-start gap-2 text-[13px] text-ink-secondary">
                    <Star size={12} className="text-accent-copper mt-1 flex-shrink-0" aria-hidden />
                    {o}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[13px] font-semibold text-ink-primary">Module breakdown</h3>
              <ol className="mt-2 space-y-1.5">
                {open.moduleBreakdown.map((m, i) => (
                  <li
                    key={m.title}
                    className="flex items-center gap-3 rounded-xl border border-hairline/10 px-3 py-2"
                  >
                    <span className="w-5 h-5 rounded-full bg-cream text-ink-tertiary text-[10px] font-semibold flex items-center justify-center flex-shrink-0 tnum">
                      {i + 1}
                    </span>
                    <span className="text-[13px] text-ink-primary flex-1 min-w-0">{m.title}</span>
                    <span className="text-[11px] text-ink-tertiary tnum whitespace-nowrap">
                      {m.duration}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <h3 className="text-[13px] font-semibold text-ink-primary">Facilitator</h3>
              <p className="text-[13px] text-ink-secondary mt-1">
                {open.instructor.name} — {open.instructor.role}
              </p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}

function PathCard({ academy, highlight }: { academy: Academy; highlight?: boolean }) {
  const Icon = academy.iconFn
  return (
    <Link
      href={`/academy/${academy.id}`}
      className={cn(
        'block rounded-2xl bg-parchment border shadow-card p-5 hover:shadow-raised transition-shadow',
        highlight ? 'border-accent-copper/35' : 'border-hairline/10',
      )}
    >
      <div className="flex items-start gap-3">
        <span className="w-10 h-10 rounded-xl bg-accent-copper/12 text-accent-copper flex items-center justify-center flex-shrink-0">
          <Icon size={19} aria-hidden />
        </span>
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-ink-primary leading-snug">{academy.name}</h3>
          <p className="text-[12px] text-ink-secondary mt-1 line-clamp-2">
            {academy.shortDescription}
          </p>
        </div>
      </div>
      <dl className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-hairline/8">
        {[
          { label: 'Courses', value: academy.courseCount, icon: BookOpen },
          { label: 'Hours', value: academy.totalHours, icon: Clock },
          { label: 'Enrolled', value: academy.enrollmentCount, icon: Users },
        ].map((s) => (
          <div key={s.label}>
            <dt className="text-[10px] uppercase tracking-wide text-ink-tertiary">{s.label}</dt>
            <dd className="text-[14px] font-semibold text-ink-primary tnum">{s.value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-[11px] text-ink-tertiary mt-2">{academy.levelRange}</p>
    </Link>
  )
}
