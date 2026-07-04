'use client'

import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { computeGaps, type SkillGap } from '@/lib/skill-gap'
import { requirementsForRole, demoCurrentLevels } from '@/data/role-requirements'
import { COMPETENCIES } from '@/data/competencies'
import { readinessData } from '@/data/analytics'

/**
 * Skill-gap heatmap (§3.4 — Disprz pattern): team members × their top gapped
 * competencies, colour intensity = gap size, so managers spot at-risk
 * employees in seconds. Powered entirely by the §3.2 skill-gap engine.
 */

const DEPT_SLUGS: Record<string, string> = {
  Sales: 'sales',
  'Business Development': 'business-development',
  'Quality Control': 'quality-control',
  Installation: 'installation',
  Marketing: 'marketing',
  'Factory & Production': 'factory-production',
  Purchase: 'purchase',
  'HR & Admin': 'hr-admin',
}

function gapCellClass(gap: number): string {
  if (gap >= 3) return 'bg-red-500/70 text-white'
  if (gap === 2) return 'bg-accent-gold/70 text-ink-primary'
  if (gap === 1) return 'bg-surface-gold/40 text-ink-primary'
  return 'bg-surface-sage/25 text-ink-tertiary'
}

interface Row {
  name: string
  role: string
  gaps: SkillGap[]
  worst: number
}

function SeverityBadge({ worst }: { worst: number }) {
  const style =
    worst >= 3
      ? { backgroundColor: 'var(--status-overdue-bg)', color: 'var(--status-overdue-fg)' }
      : worst === 2
        ? { backgroundColor: 'var(--status-risk-bg)', color: 'var(--status-risk-fg)' }
        : { backgroundColor: 'var(--status-ontrack-bg)', color: 'var(--status-ontrack-fg)' }
  const label = worst >= 3 ? 'At risk' : worst === 2 ? 'Falling behind' : 'On track'
  return (
    <span
      className="inline-block rounded-lg px-2 py-0.5 text-[11px] font-medium leading-4"
      style={style}
    >
      {label}
    </span>
  )
}

export default function SkillGapHeatmap() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const rows: Row[] = useMemo(
    () =>
      readinessData.map((e) => {
        const slug = DEPT_SLUGS[e.department] ?? 'sales'
        const isSenior = /lead|sr\.|supervisor|manager/i.test(e.role)
        const gaps = computeGaps(
          requirementsForRole(slug, isSenior ? 2 : 1),
          demoCurrentLevels(e.name.toLowerCase().replace(/\s+/g, '-'), slug),
          COMPETENCIES,
        ).slice(0, 4)
        return {
          name: e.name,
          role: e.role,
          gaps,
          worst: gaps[0]?.gap ?? 0,
        }
      }).sort((a, b) => b.worst - a.worst),
    [],
  )

  return (
    <div className="bg-cream rounded-[12px] border-[0.5px] border-[rgba(0,59,70,0.14)] dark:border-[rgba(255,255,255,0.1)] overflow-hidden transition-shadow hover:shadow-card">
      <header className="px-5 py-4 border-b border-[rgba(0,59,70,0.06)] flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-ink-primary">Skill-Gap Heatmap</p>
          <p className="text-[11px] text-ink-tertiary mt-0.5">
            Top development gaps per team member — darker = larger gap (required − current proficiency)
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-ink-tertiary">
          <span className="inline-block w-3 h-3 rounded-sm bg-surface-gold/40" /> 1
          <span className="inline-block w-3 h-3 rounded-sm bg-accent-gold/70" /> 2
          <span className="inline-block w-3 h-3 rounded-sm bg-red-500/70" /> 3+
        </div>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="border-b-[0.5px] border-[rgba(0,59,70,0.06)] dark:border-[rgba(255,255,255,0.06)] last:border-0 align-top">
                <td className="px-5 py-3 whitespace-nowrap w-64">
                  <button
                    type="button"
                    onClick={() => setExpanded(expanded === r.name ? null : r.name)}
                    className="text-left group"
                  >
                    <p className="text-[13px] font-medium text-ink-primary flex items-center gap-1.5">
                      {r.name}
                      <ChevronDown
                        size={12}
                        className={cn(
                          'text-ink-tertiary transition-transform',
                          expanded === r.name && 'rotate-180',
                        )}
                      />
                    </p>
                    <p className="text-[10px] text-ink-tertiary">{r.role}</p>
                    <div className="mt-1">
                      <SeverityBadge worst={r.worst} />
                    </div>
                  </button>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {r.gaps.length === 0 && (
                      <span className="text-[11px] font-medium" style={{ color: 'var(--status-ontrack)' }}>
                        No gaps against role requirements
                      </span>
                    )}
                    {r.gaps.map((g) => (
                      <button
                        key={g.competencyId}
                        type="button"
                        onClick={() => setExpanded(expanded === r.name ? null : r.name)}
                        title={`${g.name}: current ${g.current}/5, required ${g.required}/5`}
                        className={cn(
                          'inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium cursor-pointer hover:ring-1 hover:ring-ink-tertiary/40 transition-shadow',
                          gapCellClass(g.gap),
                        )}
                      >
                        {g.name}
                        <span className="opacity-80 tabular-nums">−{g.gap}</span>
                      </button>
                    ))}
                  </div>
                  {expanded === r.name && (
                    <div className="mt-3 rounded-[12px] border-[0.5px] border-[rgba(0,59,70,0.12)] dark:border-[rgba(255,255,255,0.1)] bg-parchment p-3">
                      <p className="text-[11px] font-medium text-ink-secondary mb-2">
                        {r.name} — proficiency vs role requirement
                      </p>
                      <div className="space-y-1.5">
                        {r.gaps.map((g) => (
                          <div key={g.competencyId} className="flex items-center gap-2">
                            <span className="w-44 truncate text-[11px] text-ink-primary">{g.name}</span>
                            <div className="flex-1 flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((lvl) => (
                                <span
                                  key={lvl}
                                  className="h-2 flex-1 rounded-sm"
                                  style={{
                                    backgroundColor:
                                      lvl <= g.current
                                        ? 'var(--status-ontrack)'
                                        : lvl <= g.required
                                          ? 'var(--status-risk)'
                                          : 'var(--ring-track)',
                                  }}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] text-ink-tertiary tabular-nums w-14 text-right">
                              {g.current} → {g.required}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
