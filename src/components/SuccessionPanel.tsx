'use client'

import { Users2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { successionPlan, successionSummary, type SuccessionReadiness } from '@/data/succession'

/** Succession planning rollup (§3.2 item 5, surfaced per §3.4). */

const READINESS_STYLE: Record<SuccessionReadiness, string> = {
  ready_now: 'bg-surface-sage/25 text-ink-primary',
  ready_soon: 'bg-accent-gold/20 text-ink-primary',
  develop: 'bg-black/5 text-ink-tertiary',
}
const READINESS_LABEL: Record<SuccessionReadiness, string> = {
  ready_now: 'Ready now',
  ready_soon: 'Ready soon',
  develop: 'Develop',
}

export default function SuccessionPanel() {
  return (
    <div className="bg-cream rounded-[12px] border-[0.5px] border-[rgba(0,59,70,0.14)] dark:border-[rgba(255,255,255,0.1)] overflow-hidden transition-shadow hover:shadow-card">
      <header className="px-5 py-4 border-b border-[rgba(0,59,70,0.06)] flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-ink-primary flex items-center gap-2">
          <Users2 size={16} /> Succession Pipeline
        </p>
        <p className="text-[11px] text-ink-tertiary">
          {successionSummary.withReadyNow}/{successionSummary.criticalRoles} critical roles
          have a ready-now successor
          {successionSummary.uncovered > 0 && ` · ${successionSummary.uncovered} uncovered`}
        </p>
      </header>
      <ul className="divide-y divide-[rgba(0,59,70,0.05)]">
        {successionPlan.map((r) => (
          <li key={r.role} className="px-5 py-3.5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-[13px] font-semibold text-ink-primary">
                {r.role} <span className="text-[10px] font-normal text-ink-tertiary">· {r.department}</span>
              </p>
              <p className="text-[10px] text-ink-tertiary">Incumbent: {r.incumbent}</p>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {r.candidates.length === 0 && (
                <span className="text-[11px] font-medium text-red-600">
                  No internal candidates — backfill risk
                </span>
              )}
              {r.candidates.map((c) => (
                <span
                  key={c.name}
                  title={`${c.currentRole} — PRS ${c.prs}`}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium',
                    READINESS_STYLE[c.readiness],
                  )}
                >
                  {c.name}
                  <span className="tabular-nums opacity-75">PRS {c.prs}</span>
                  <span className="text-[10px] opacity-75">
                    {READINESS_LABEL[c.readiness]}
                  </span>
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
