'use client'

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

/**
 * Empty state pattern (modernization §4): named headline, one supporting
 * line, optional next action. An invitation, never an apology.
 */
export default function EmptyState({
  icon: Icon,
  headline,
  support,
  actionLabel,
  actionHref,
  onAction,
  compact = false,
}: {
  icon?: LucideIcon
  headline: string
  support: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  compact?: boolean
}) {
  return (
    <div className={compact ? 'py-6 px-4 text-center' : 'py-12 px-6 text-center'}>
      {Icon && (
        <span className="mx-auto mb-3 w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--status-ontrack-bg)' }}>
          <Icon size={18} style={{ color: 'var(--status-ontrack)' }} />
        </span>
      )}
      <p className={compact ? 'text-[13px] font-semibold text-ink-primary' : 'text-base font-semibold text-ink-primary'}>
        {headline}
      </p>
      <p className={compact ? 'text-[11px] text-ink-tertiary mt-1' : 'text-sm text-ink-tertiary mt-1.5'}>
        {support}
      </p>
      {actionLabel && (actionHref || onAction) && (
        <div className="mt-3">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-block rounded-lg bg-ink-primary px-3.5 py-2 text-xs font-medium text-parchment hover:opacity-90 transition"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="rounded-lg bg-ink-primary px-3.5 py-2 text-xs font-medium text-parchment hover:opacity-90 transition"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
