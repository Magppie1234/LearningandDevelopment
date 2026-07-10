'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, ClipboardCheck, Play, RotateCcw, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  formatDuration,
  useResetModule,
  type ModuleProgressRow,
} from '@/lib/learning-dashboard-client'

/**
 * Per-module status + time + resume/reset. In read-only mode (manager/admin
 * viewing) the Continue/Reset actions are hidden — you can see the learner's
 * state but never mutate it.
 */

const STATUS = {
  completed: { label: 'Completed', color: 'var(--status-ontrack)', icon: CheckCircle2 },
  in_progress: { label: 'In progress', color: 'rgb(var(--m-accent-copper))', icon: ClipboardCheck },
  not_started: { label: 'Not started', color: 'rgb(var(--m-ink-tertiary))', icon: Circle },
} as const

export default function ModuleProgressCard({
  academyId,
  moduleLabel,
  progress,
  readOnly = false,
  onContinue,
  onReset,
}: {
  academyId: string
  moduleLabel: string
  progress: ModuleProgressRow
  readOnly?: boolean
  onContinue?: (p: ModuleProgressRow) => void
  onReset?: () => void
}) {
  const reset = useResetModule()
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const s = STATUS[progress.status]

  async function doReset() {
    setBusy(true)
    const ok = await reset(academyId, progress.module_id)
    setBusy(false)
    setConfirming(false)
    if (ok) onReset?.()
  }

  return (
    <div className="rounded-[12px] border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream p-4 shadow-card">
      <div className="flex items-center gap-3">
        <s.icon size={18} className="shrink-0" style={{ color: s.color }} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink-primary truncate">{moduleLabel}</p>
          <p className="flex items-center gap-2 text-[12px] text-ink-tertiary mt-0.5">
            <span style={{ color: s.color }}>{s.label}</span>
            <span className="inline-flex items-center gap-1">
              <Clock size={11} /> {formatDuration(progress.total_time_spent_seconds)}
            </span>
            {progress.attempt_count > 0 && <span>· {progress.attempt_count} att.</span>}
          </p>
        </div>
      </div>

      {!readOnly && (
        <div className="mt-3 flex items-center gap-2">
          {progress.status === 'in_progress' && progress.last_position != null && (
            <button
              type="button"
              onClick={() => onContinue?.(progress)}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink-primary px-3 py-1.5 text-xs font-medium text-parchment hover:opacity-90 transition"
            >
              <Play size={12} /> Continue
            </button>
          )}
          {progress.attempt_count > 0 &&
            (confirming ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-ink-secondary">
                Clear progress &amp; attempt history? Insight trends restart.
                <button
                  type="button"
                  disabled={busy}
                  onClick={doReset}
                  className="rounded-full px-2.5 py-1 text-xs font-semibold text-parchment disabled:opacity-50"
                  style={{ backgroundColor: 'var(--status-overdue)' }}
                >
                  {busy ? '…' : 'Confirm'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="rounded-full px-2.5 py-1 text-xs font-medium text-ink-secondary hover:text-ink-primary"
                >
                  Cancel
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border border-[rgba(0,59,70,0.16)] px-3 py-1.5 text-xs font-medium text-ink-tertiary',
                  'hover:border-ink-secondary hover:text-ink-secondary transition-colors',
                )}
              >
                <RotateCcw size={12} /> Reset
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
