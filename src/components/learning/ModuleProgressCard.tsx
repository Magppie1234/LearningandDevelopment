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
 * Per-module status + time + resume/reset, on the dark warm-stone surface.
 * Read-only mode (manager/admin viewing, or demo) hides the actions. Zero-state
 * (Section 4): "not attempted" text rather than a numeric 0, and the resume
 * button reads "Start" instead of "Continue".
 */

const STATUS = {
  completed: { label: 'Completed', color: 'rgb(var(--stone-sage))', icon: CheckCircle2 },
  in_progress: { label: 'In progress', color: 'rgb(var(--m-accent-copper))', icon: ClipboardCheck },
  not_started: { label: 'Not started', color: 'rgba(245,239,230,0.45)', icon: Circle },
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
  const notStarted = progress.status === 'not_started'

  const resumeAt =
    progress.last_position != null
      ? progress.last_position_kind === 'video'
        ? `Resume ${formatDuration(progress.last_position)}`
        : `Resume ${progress.last_position}%`
      : 'Start'

  async function doReset() {
    setBusy(true)
    const ok = await reset(academyId, progress.module_id)
    setBusy(false)
    setConfirming(false)
    if (ok) onReset?.()
  }

  return (
    <div className="rounded-[12px] border border-white/10 bg-stone-espresso p-4">
      <div className="flex items-center gap-3">
        <s.icon size={18} className="shrink-0" style={{ color: s.color }} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-stone-ivory truncate">{moduleLabel}</p>
          <p className="flex items-center gap-2 text-[12px] text-stone-ivory/50 mt-0.5">
            <span style={{ color: s.color }}>{s.label}</span>
            <span className="inline-flex items-center gap-1">
              <Clock size={11} /> {notStarted ? '0m' : formatDuration(progress.total_time_spent_seconds)}
            </span>
            <span>· {progress.attempt_count > 0 ? `${progress.attempt_count} att.` : 'not attempted'}</span>
          </p>
        </div>
      </div>

      {!readOnly && (
        <div className="mt-3 flex items-center gap-2">
          {(progress.status === 'in_progress' || notStarted) && (
            <button
              type="button"
              onClick={() => onContinue?.(progress)}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent-copper px-3 py-1.5 text-xs font-medium text-stone-ink hover:brightness-95 transition"
            >
              <Play size={12} /> {notStarted ? 'Start' : resumeAt}
            </button>
          )}
          {progress.attempt_count > 0 &&
            (confirming ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-stone-ivory/70">
                Clear progress &amp; attempts? Insight trends restart.
                <button
                  type="button"
                  disabled={busy}
                  onClick={doReset}
                  className="rounded-full px-2.5 py-1 text-xs font-semibold text-stone-ink disabled:opacity-50"
                  style={{ backgroundColor: '#e0a04a' }}
                >
                  {busy ? '…' : 'Confirm'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="rounded-full px-2.5 py-1 text-xs font-medium text-stone-ivory/60 hover:text-stone-ivory"
                >
                  Cancel
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-stone-ivory/60',
                  'hover:border-white/30 hover:text-stone-ivory transition-colors',
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
