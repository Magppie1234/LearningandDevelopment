'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import Link from 'next/link'
import { Loader2, X, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Buttons, overlays and the empty / loading / error states.
 *
 * These three states are components rather than ad-hoc markup on purpose: an
 * "empty" that looks like a bug, or a table that shows nothing while loading,
 * are the two failure modes that make a dashboard feel broken.
 */

/* ─────────────────────────────  BUTTON  ─────────────────────────────── */

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

const VARIANT: Record<Variant, string> = {
  primary:
    'bg-accent-copper text-white hover:brightness-95 active:brightness-90 border border-transparent',
  secondary:
    'bg-parchment text-ink-primary border border-hairline/15 hover:bg-cream active:bg-cream',
  ghost:
    'bg-transparent text-ink-secondary border border-transparent hover:bg-[rgb(var(--rule)/0.05)] hover:text-ink-primary',
  danger: 'bg-danger text-white hover:brightness-95 border border-transparent',
}

// Every size clears the 44px touch target on coarse pointers via min-h.
const SIZE: Record<Size, string> = {
  sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg min-h-[32px]',
  md: 'text-[13px] px-3.5 py-2 gap-2 rounded-lg min-h-[38px]',
}

const BUTTON_BASE =
  'inline-flex items-center justify-center font-medium transition-all disabled:opacity-50 ' +
  'disabled:pointer-events-none whitespace-nowrap [@media(pointer:coarse)]:min-h-[44px]'

export function Button({
  children,
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  loading = false,
  href,
  type = 'button',
  className,
  ...rest
}: {
  children: ReactNode
  variant?: Variant
  size?: Size
  icon?: LucideIcon
  loading?: boolean
  href?: string
  type?: 'button' | 'submit'
  className?: string
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'className' | 'children'>) {
  const cls = cn(BUTTON_BASE, VARIANT[variant], SIZE[size], className)
  const inner = (
    <>
      {loading ? (
        <Loader2 size={size === 'sm' ? 13 : 15} className="animate-spin flex-shrink-0" aria-hidden />
      ) : (
        Icon && <Icon size={size === 'sm' ? 13 : 15} className="flex-shrink-0" aria-hidden />
      )}
      {children}
    </>
  )
  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    )
  }
  return (
    <button type={type} className={cls} disabled={loading || rest.disabled} {...rest}>
      {inner}
    </button>
  )
}

/** Icon-only control. `label` is required and becomes the accessible name. */
export function IconButton({
  icon: Icon,
  label,
  onClick,
  className,
  badge,
}: {
  icon: LucideIcon
  label: string
  onClick?: () => void
  className?: string
  /** Small count overlay, e.g. unread notifications. */
  badge?: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'relative w-9 h-9 rounded-lg flex items-center justify-center text-ink-secondary',
        'hover:bg-[rgb(var(--rule)/0.06)] hover:text-ink-primary transition-colors',
        '[@media(pointer:coarse)]:w-11 [@media(pointer:coarse)]:h-11',
        className,
      )}
    >
      <Icon size={18} aria-hidden />
      {badge != null && badge > 0 && (
        <span className="absolute top-1 right-1 min-w-[15px] h-[15px] px-1 rounded-full bg-danger text-white text-[9px] font-semibold flex items-center justify-center tnum">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  )
}

/* ──────────────────────────  STATE SURFACES  ────────────────────────── */

/**
 * Empty state. `support` must say WHY it is empty and, where the answer is
 * "the data isn't wired up yet", which source is required — an empty
 * dashboard that doesn't explain itself reads as a broken dashboard.
 */
export function Empty({
  icon: Icon,
  headline,
  support,
  action,
  compact = false,
  className,
}: {
  icon?: LucideIcon
  headline: string
  support: string
  action?: ReactNode
  compact?: boolean
  className?: string
}) {
  return (
    <div className={cn('text-center', compact ? 'py-8 px-4' : 'py-14 px-6', className)}>
      {Icon && (
        <span className="mx-auto mb-3 w-11 h-11 rounded-full bg-cream flex items-center justify-center">
          <Icon size={19} className="text-ink-tertiary" aria-hidden />
        </span>
      )}
      <p className={cn('font-semibold text-ink-primary', compact ? 'text-sm' : 'text-base')}>
        {headline}
      </p>
      <p
        className={cn(
          'text-ink-secondary mx-auto mt-1.5 max-w-md leading-relaxed',
          compact ? 'text-xs' : 'text-sm',
        )}
      >
        {support}
      </p>
      {action && <div className="mt-4 flex justify-center gap-2">{action}</div>}
    </div>
  )
}

/** Skeleton block. Sized by the caller so loading never shifts layout. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('rounded-lg bg-[rgb(var(--rule)/0.07)] animate-pulse', className)}
      aria-hidden
    />
  )
}

export function LoadingRows({ rows = 4, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn('space-y-2 p-1', className)} role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-11 w-full" />
      ))}
    </div>
  )
}

/** Failed-request state. Always offers a retry — a dead end is not a state. */
export function ErrorState({
  message,
  onRetry,
  compact = false,
}: {
  message: string
  onRetry?: () => void
  compact?: boolean
}) {
  return (
    <div className={cn('text-center', compact ? 'py-8 px-4' : 'py-12 px-6')}>
      <p className="text-sm font-semibold text-danger-fg">Couldn&apos;t load this</p>
      <p className="text-xs text-ink-secondary mt-1.5 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <div className="mt-4 flex justify-center">
          <Button size="sm" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}
    </div>
  )
}

/**
 * Notice bar. Used for the demo-data disclosure the portal is required to show
 * wherever placeholder data appears, and for page-level caveats.
 */
export function Notice({
  tone = 'warning',
  icon: Icon,
  children,
  className,
}: {
  tone?: 'warning' | 'info' | 'danger'
  icon?: LucideIcon
  children: ReactNode
  className?: string
}) {
  const cls =
    tone === 'danger'
      ? 'bg-danger-bg text-danger-fg border-danger/25'
      : tone === 'info'
        ? 'bg-info-bg text-info-fg border-info/25'
        : 'bg-warning-bg text-warning-fg border-warning/25'
  return (
    <div
      className={cn(
        'flex items-start gap-2.5 rounded-xl border px-4 py-2.5 text-xs leading-relaxed',
        cls,
        className,
      )}
    >
      {Icon && <Icon size={15} className="flex-shrink-0 mt-0.5" aria-hidden />}
      <div className="min-w-0">{children}</div>
    </div>
  )
}

/* ─────────────────────────────  DRAWER  ─────────────────────────────── */

/**
 * Right-hand detail drawer — the portal's progressive-disclosure surface.
 * Secondary detail opens here instead of being crammed onto the summary
 * screen. Closes on Escape and on backdrop click; scroll-locks the page.
 */
export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  footer,
  children,
  width = 'md',
}: {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: ReactNode
  footer?: ReactNode
  children: ReactNode
  width?: 'md' | 'lg'
}) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label={title}>
      <div
        className="absolute inset-0 bg-black/35 animate-in fade-in duration-150"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          'absolute right-0 top-0 h-full w-full bg-background shadow-elevated flex flex-col outline-none',
          'animate-in slide-in-from-right duration-200',
          width === 'lg' ? 'sm:w-[640px]' : 'sm:w-[480px]',
        )}
      >
        <header className="flex items-start justify-between gap-3 px-5 py-4 border-b border-hairline/10 flex-shrink-0">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-ink-primary truncate">{title}</h2>
            {subtitle && <p className="text-xs text-ink-secondary mt-0.5">{subtitle}</p>}
          </div>
          <IconButton icon={X} label="Close panel" onClick={onClose} />
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <footer className="px-5 py-3 border-t border-hairline/10 flex flex-wrap gap-2 justify-end flex-shrink-0">
            {footer}
          </footer>
        )}
      </div>
    </div>
  )
}
