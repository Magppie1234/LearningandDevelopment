'use client'

import type { LucideIcon } from 'lucide-react'
import { Button, Empty } from '@/components/ds'

/**
 * Legacy empty-state wrapper.
 *
 * Superseded by `Empty` in the design system, which every new screen uses.
 * This shim keeps the older call sites working and — importantly — routes them
 * through the same component, so there is one empty-state look in the portal
 * rather than two. Prefer `Empty` directly in new code.
 */
export default function EmptyState({
  icon,
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
    <Empty
      icon={icon}
      headline={headline}
      support={support}
      compact={compact}
      action={
        actionLabel && (actionHref || onAction) ? (
          <Button size="sm" variant="primary" href={actionHref} onClick={onAction}>
            {actionLabel}
          </Button>
        ) : undefined
      }
    />
  )
}
