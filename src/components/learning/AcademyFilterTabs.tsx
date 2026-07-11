'use client'

import { Layers } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Domain / academy filter for the home "My Progress Report" (spec §5). Sits
 * above the dashboard and narrows every stat, the trend graph, and the module
 * list to a single academy — or "All modules" for the aggregate. It's a view
 * filter, not a route change; the page stays on the home dashboard.
 */
export interface AcademyFilterOption {
  id: string
  label: string
}

export default function AcademyFilterTabs({
  options,
  value,
  onChange,
}: {
  options: AcademyFilterOption[]
  /** null = All modules (aggregate). */
  value: string | null
  onChange: (id: string | null) => void
}) {
  // Only worth showing when there's more than one academy to choose between.
  if (options.length < 2) return null

  const tabs: { id: string | null; label: string }[] = [
    { id: null, label: 'All modules' },
    ...options,
  ]

  return (
    <div className="flex items-center gap-2 flex-wrap justify-end">
      <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-stone-ivory/40">
        <Layers size={12} /> Show
      </span>
      <div className="inline-flex rounded-full border border-white/10 bg-stone-espresso p-0.5">
        {tabs.map((t) => {
          const active = value === t.id
          return (
            <button
              key={t.id ?? 'all'}
              type="button"
              onClick={() => onChange(t.id)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors',
                active
                  ? 'bg-accent-copper text-stone-ink'
                  : 'text-stone-ivory/60 hover:text-stone-ivory',
              )}
            >
              {t.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
