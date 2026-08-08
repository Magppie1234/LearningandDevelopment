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
    <div className="rounded-2xl border border-stone-veil/10 bg-stone-espresso overflow-hidden">
      <div className="p-3 border-b border-stone-veil/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-ivory/70" size={14} />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search learners you oversee…"
            className="w-full bg-stone-charcoal border border-stone-veil/10 rounded-lg pl-8 pr-3 py-1.5 text-[13px] text-stone-ivory placeholder:text-stone-ivory/70 focus:outline-none focus:border-accent-copper"
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
              'w-full flex items-center gap-3 px-4 py-3 text-left border-b border-stone-veil/5 last:border-b-0 hover:bg-stone-veil/[0.04] transition-colors',
              selectedUserId === l.userId && 'bg-stone-veil/[0.05]',
            )}
          >
            <span className="w-8 h-8 rounded-full bg-stone-veil/10 flex items-center justify-center text-[11px] font-bold text-stone-ivory/80 shrink-0">
              {l.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-stone-ivory truncate">{l.name}</span>
              {l.academyLabel && <span className="block text-[12px] text-stone-ivory/74 truncate">{l.academyLabel}</span>}
            </span>
            {l.completionPct != null && (
              <span className="text-[12px] font-semibold text-stone-ivory/80 tabular-nums">{l.completionPct}%</span>
            )}
            <ChevronRight size={15} className="text-stone-ivory/70 shrink-0" />
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-stone-ivory/74">No learners match “{q}”.</p>
        )}
      </div>
    </div>
  )
}
