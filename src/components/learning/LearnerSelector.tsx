'use client'

import { useMemo, useState } from 'react'
import { Search, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Manager-only learner picker. Filtered to the manager's scoped academies/team
 * (the parent passes only in-scope learners), lets a manager drill into any one
 * learner's read-only dashboard. Scoping is ultimately enforced server-side by
 * RLS — this is the navigation surface on top of it.
 */

export interface LearnerListItem {
  userId: string
  name: string
  academyLabel?: string
  completionPct?: number
}

export default function LearnerSelector({
  learners,
  selectedUserId,
  onSelect,
}: {
  learners: LearnerListItem[]
  selectedUserId?: string
  onSelect: (userId: string) => void
}) {
  const [q, setQ] = useState('')
  const filtered = useMemo(() => {
    if (!q.trim()) return learners
    const n = q.toLowerCase()
    return learners.filter(
      (l) => l.name.toLowerCase().includes(n) || (l.academyLabel ?? '').toLowerCase().includes(n),
    )
  }, [q, learners])

  return (
    <div className="rounded-2xl border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream shadow-card overflow-hidden">
      <div className="p-3 border-b border-[rgba(0,59,70,0.08)]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" size={14} />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search learners you oversee…"
            className="w-full bg-parchment border border-[rgba(0,59,70,0.12)] rounded-lg pl-8 pr-3 py-1.5 text-[13px] text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-ink-primary"
          />
        </div>
      </div>
      <div className="max-h-[420px] overflow-y-auto">
        {filtered.map((l) => (
          <button
            key={l.userId}
            type="button"
            onClick={() => onSelect(l.userId)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 text-left border-b border-[rgba(0,59,70,0.06)] last:border-b-0 hover:bg-[rgba(0,59,70,0.03)] transition-colors',
              selectedUserId === l.userId && 'bg-[rgba(0,59,70,0.04)]',
            )}
          >
            <span className="w-8 h-8 rounded-full bg-surface-warm flex items-center justify-center text-[11px] font-bold text-ink-secondary shrink-0">
              {l.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-ink-primary truncate">{l.name}</span>
              {l.academyLabel && <span className="block text-[12px] text-ink-tertiary truncate">{l.academyLabel}</span>}
            </span>
            {l.completionPct != null && (
              <span className="text-[12px] font-semibold text-ink-secondary tabular-nums">{l.completionPct}%</span>
            )}
            <ChevronRight size={15} className="text-ink-tertiary/60 shrink-0" />
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-ink-tertiary">No learners match “{q}”.</p>
        )}
      </div>
    </div>
  )
}
