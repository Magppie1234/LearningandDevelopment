'use client'

import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDuration } from '@/lib/learning-dashboard-client'
import { useTimeTracking } from './TimeTrackingProvider'

/**
 * Minimal monospace stopwatch for the active learning session, counting up in
 * HH:MM:SS with a soft copper glow. Dims + pulses when idle-paused. Renders
 * nothing when not tracking (manager/admin viewing, or tracking disabled).
 */
export default function LiveSessionClock({ className }: { className?: string }) {
  const { activeSeconds, idle, tracking } = useTimeTracking()
  if (!tracking) return null

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[13px] tabular-nums transition-opacity',
        idle ? 'opacity-50 animate-pulse' : 'opacity-100',
        className,
      )}
      style={{
        borderColor: 'rgba(184,112,63,0.4)',
        color: 'rgb(var(--m-accent-copper))',
        backgroundColor: 'color-mix(in srgb, rgb(var(--m-accent-copper)) 8%, transparent)',
        boxShadow: idle ? 'none' : '0 0 12px rgba(184,112,63,0.25)',
      }}
      aria-label={idle ? 'Session paused (idle)' : 'Session time'}
      title={idle ? 'Paused — no activity' : 'Active session time'}
    >
      <Clock size={13} />
      {formatDuration(activeSeconds)}
      {idle && <span className="text-[10px] uppercase tracking-wide">idle</span>}
    </div>
  )
}
