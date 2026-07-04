'use client'

import { useMemo, useState } from 'react'
import { Check, Plus, X, UserPlus } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useOrgStore } from '@/lib/org-store'
import type { OrgPosition } from '@/data/org-chart'
import { readinessData } from '@/data/analytics'
import { prsBand } from '@/lib/prs'
import { skillAttainmentPct } from '@/lib/skill-gap'
import { requirementsForRole, demoCurrentLevels } from '@/data/role-requirements'
import AcademyProgressCard from '@/components/AcademyProgressCard'
import { academies, iconMap } from '@/data/academies'

/**
 * Org Flow drill-through (§3.4): clicking a person shows learning progress,
 * cert level and PRS — turning the org chart into a management tool.
 * PRS comes from the canonical engine where a learning record exists;
 * otherwise attainment is computed live from the skill-gap engine.
 */
const DEPT_TO_ACADEMY: Record<string, string> = {
  Production: 'factory-production',
  'Quality Control': 'quality-control',
  Operations: 'factory-production',
  Finance: 'accounts-finance',
  Technology: 'leadership',
  Marketing: 'marketing',
  Accounts: 'accounts-finance',
  'Supply Chain': 'purchase',
}

function PersonStats({ name, department }: { name: string; department?: string | null }) {
  const record = readinessData.find((e) => e.name === name)
  const academy = academies.find(
    (a) => a.id === (DEPT_TO_ACADEMY[department ?? ''] ?? 'business-development'),
  )
  const avg = academy
    ? Math.round(academy.courses.reduce((s, c) => s + c.progress, 0) / academy.courses.length)
    : 0

  const dept = 'business-development'
  const pct = skillAttainmentPct(
    requirementsForRole(dept, 1),
    demoCurrentLevels(name.toLowerCase().replace(/\s+/g, '-'), dept),
  )

  return (
    <div className="mt-1.5 space-y-1.5">
      {academy && (
        <AcademyProgressCard
          variant="compact"
          title={academy.name.replace(' Academy', '')}
          icon={iconMap[academy.icon]}
          iconColor={academy.color}
          completedModules={academy.courses.filter((c) => c.progress === 100).length}
          totalModules={academy.courses.length}
          progress={avg}
        />
      )}
      <span className="block text-[10px] text-ink-tertiary">
        {record
          ? `PRS ${record.readiness} · ${prsBand(record.readiness)} · certification level ${record.certsEarned} of ${record.totalCerts}`
          : `Skill attainment ${pct}% · PRS not computed yet`}
      </span>
    </div>
  )
}

export function PositionEditor({
  position,
  children,
  align = 'start',
}: {
  position: OrgPosition
  children: React.ReactNode
  align?: 'start' | 'center' | 'end'
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [custom, setCustom] = useState('')

  const roster = useOrgStore((s) => s.roster)
  const assignments = useOrgStore(
    useShallow((s) => s.assignments.filter((a) => a.positionId === position.id)),
  )
  const addAssignment = useOrgStore((s) => s.addAssignment)
  const removeAssignment = useOrgStore((s) => s.removeAssignment)

  const assignedIds = useMemo(
    () => new Set(assignments.map((a) => a.employeeId).filter(Boolean) as string[]),
    [assignments],
  )

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return roster
      .filter((e) => !assignedIds.has(e.id))
      .filter(
        (e) =>
          !q ||
          e.name.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q) ||
          e.currentPosition.toLowerCase().includes(q),
      )
      .slice(0, 8)
  }, [roster, assignedIds, query])

  function nameFor(a: { employeeId: string | null; customName: string | null }) {
    if (a.employeeId) return roster.find((e) => e.id === a.employeeId)?.name ?? 'Unknown'
    return a.customName ?? 'Unknown'
  }

  function assignEmployee(id: string) {
    addAssignment(position.id, { employeeId: id })
    setQuery('')
  }
  function assignCustom() {
    const name = custom.trim()
    if (!name) return
    addAssignment(position.id, { customName: name })
    setCustom('')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align={align} className="w-80 p-0 overflow-hidden">
        <div className="px-4 pt-3.5 pb-2 border-b border-border">
          <p className="text-sm font-semibold text-ink-primary leading-tight">
            {position.title}
          </p>
          {position.department && (
            <p className="text-[11px] text-ink-tertiary mt-0.5">{position.department}</p>
          )}
        </div>

        {/* Currently assigned — with learning drill-through (§3.4) */}
        {assignments.length > 0 && (
          <div className="px-4 py-3 space-y-2 border-b border-border">
            {assignments.map((a) => (
              <div key={a.id}>
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary text-secondary-foreground pl-2.5 pr-1 py-1 text-xs font-medium">
                  {nameFor(a)}
                  <button
                    type="button"
                    aria-label={`Remove ${nameFor(a)}`}
                    onClick={() => removeAssignment(a.id)}
                    className="rounded-full p-0.5 hover:bg-black/10 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
                <PersonStats name={nameFor(a)} department={position.department} />
              </div>
            ))}
          </div>
        )}

        {/* Searchable roster select */}
        <div className="p-2">
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search employees…"
            className="h-9 text-sm"
          />
          <div className="mt-1.5 max-h-48 overflow-y-auto">
            {results.length === 0 ? (
              <p className="px-2 py-3 text-xs text-ink-tertiary text-center">
                No matching employees.
              </p>
            ) : (
              results.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => assignEmployee(e.id)}
                  className={cn(
                    'w-full flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left',
                    'hover:bg-secondary/70 transition-colors',
                  )}
                >
                  <span className="min-w-0">
                    <span className="block text-sm text-ink-primary truncate">{e.name}</span>
                    <span className="block text-[11px] text-ink-tertiary truncate">
                      {e.currentPosition} · {e.department}
                    </span>
                  </span>
                  <Check size={14} className="opacity-0" />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Free-text fallback */}
        <div className="px-2 pb-3 pt-1 border-t border-border">
          <p className="px-2 pt-1.5 pb-1 text-[11px] font-medium text-ink-tertiary flex items-center gap-1">
            <UserPlus size={12} /> Not listed? Type a name
          </p>
          <div className="flex items-center gap-1.5 px-1">
            <Input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  assignCustom()
                }
              }}
              placeholder="e.g. Priya Sharma"
              className="h-9 text-sm"
            />
            <button
              type="button"
              onClick={assignCustom}
              disabled={!custom.trim()}
              className="shrink-0 inline-flex items-center gap-1 rounded-md bg-ink-primary px-2.5 py-2 text-xs font-medium text-parchment disabled:opacity-40 hover:opacity-90 transition"
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
