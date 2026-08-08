'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CornerDownLeft, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRole } from '@/lib/role-context'
import { hasRole, NAV_ITEMS, type NavItem } from '@/lib/roles'
import { academies } from '@/data/academies'
import { COMPETENCIES } from '@/data/competencies'
import { DEPARTMENTS } from '@/data/workforce'

/**
 * Global search — the header's magnifying glass used to be a button that did
 * nothing at all.
 *
 * Searches four things a person actually looks for by name: sections, learning
 * paths/academies, competencies and departments. Results are filtered by role,
 * so search never surfaces a destination the viewer would then be refused at.
 */

type Result = {
  id: string
  title: string
  hint: string
  group: 'Go to' | 'Learning' | 'Skills' | 'Departments'
  href: string
}

function score(haystack: string, q: string): number {
  const h = haystack.toLowerCase()
  const i = h.indexOf(q)
  if (i < 0) return -1
  // Prefix matches rank above mid-word matches; shorter titles rank above long.
  return (i === 0 ? 0 : 100 + i) + h.length / 100
}

export default function GlobalSearch({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const { role } = useRole()
  const [q, setQ] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const corpus = useMemo<Result[]>(() => {
    const nav: Result[] = NAV_ITEMS.filter((i: NavItem) => hasRole(role, i.requires)).map((i) => ({
      id: `nav-${i.path}`,
      title: i.label,
      hint: i.hint,
      group: 'Go to',
      href: i.path,
    }))
    const paths: Result[] = academies.map((a) => ({
      id: `academy-${a.id}`,
      title: a.name,
      hint: `Learning path · ${a.courseCount} courses · ${a.totalHours}h`,
      group: 'Learning',
      href: `/academy/${a.id}`,
    }))
    const skills: Result[] = COMPETENCIES.map((c) => ({
      id: `comp-${c.id}`,
      title: c.name,
      hint: `${c.type} competency · ${c.departmentSlug}`,
      group: 'Skills',
      href: `/skills-passport?competency=${encodeURIComponent(c.id)}`,
    }))
    const depts: Result[] = DEPARTMENTS.map((d) => ({
      id: `dept-${d.slug}`,
      title: d.name,
      hint: `Department · ${d.frameworkStatus === 'built' ? 'framework authored' : 'framework pending'}`,
      group: 'Departments',
      href: `/department?dept=${d.slug}`,
    }))
    return [...nav, ...paths, ...skills, ...depts]
  }, [role])

  const results = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return corpus.filter((r) => r.group === 'Go to').slice(0, 7)
    return corpus
      .map((r) => {
        const s = Math.min(
          score(r.title, query) < 0 ? Infinity : score(r.title, query),
          score(r.hint, query) < 0 ? Infinity : score(r.hint, query) + 500,
        )
        return { r, s }
      })
      .filter((x) => x.s !== Infinity)
      .sort((a, b) => a.s - b.s)
      .slice(0, 12)
      .map((x) => x.r)
  }, [q, corpus])

  useEffect(() => {
    setCursor(0)
  }, [q])

  useEffect(() => {
    if (open) {
      // Focus after paint so the dialog is mounted and the caret lands.
      const t = window.setTimeout(() => inputRef.current?.focus(), 10)
      return () => window.clearTimeout(t)
    }
    setQ('')
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setCursor((c) => Math.min(results.length - 1, c + 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setCursor((c) => Math.max(0, c - 1))
      }
      if (e.key === 'Enter') {
        const hit = results[cursor]
        if (hit) {
          onClose()
          router.push(hit.href)
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, results, cursor, onClose, router])

  if (!open) return null

  let lastGroup: string | null = null

  return (
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-label="Search">
      <div className="absolute inset-0 bg-black/35" onClick={onClose} aria-hidden />
      <div className="absolute left-1/2 top-[12vh] -translate-x-1/2 w-[92vw] max-w-[560px] rounded-2xl bg-background border border-hairline/12 shadow-elevated overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-2.5 px-4 h-13 py-3 border-b border-hairline/10">
          <Search size={17} className="text-ink-tertiary flex-shrink-0" aria-hidden />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search sections, learning paths, skills, departments…"
            aria-label="Search the portal"
            className="flex-1 bg-transparent text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="text-ink-tertiary hover:text-ink-primary"
          >
            <X size={16} />
          </button>
        </div>

        <ul className="max-h-[52vh] overflow-y-auto py-2">
          {results.length === 0 && (
            <li className="px-4 py-8 text-center">
              <p className="text-sm font-medium text-ink-primary">No matches</p>
              <p className="text-xs text-ink-secondary mt-1">
                Nothing matches “{q}”. Try a section name, a course, a skill or a department.
              </p>
            </li>
          )}
          {results.map((r, i) => {
            const showHeader = r.group !== lastGroup
            lastGroup = r.group
            return (
              <li key={r.id}>
                {showHeader && (
                  <p className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-tertiary">
                    {r.group}
                  </p>
                )}
                <button
                  type="button"
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => {
                    onClose()
                    router.push(r.href)
                  }}
                  className={cn(
                    'w-full text-left px-4 py-2 flex items-center gap-3 transition-colors',
                    i === cursor ? 'bg-accent-copper/10' : 'hover:bg-[rgb(var(--rule)/0.04)]',
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium text-ink-primary truncate">
                      {r.title}
                    </span>
                    <span className="block text-[11px] text-ink-tertiary truncate">{r.hint}</span>
                  </span>
                  {i === cursor && (
                    <CornerDownLeft size={13} className="text-ink-tertiary flex-shrink-0" aria-hidden />
                  )}
                </button>
              </li>
            )
          })}
        </ul>

        <div className="px-4 py-2 border-t border-hairline/10 flex items-center gap-3 text-[10px] text-ink-tertiary">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  )
}
