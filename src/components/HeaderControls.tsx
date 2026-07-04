'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { Bell, Moon, Sun, CheckCheck } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useNotificationStore } from '@/lib/notification-store'
import EmptyState from '@/components/EmptyState'

/** Notification center bell (§3.4) — surfaces the §3.2 notification system. */
export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const notifications = useNotificationStore((s) => s.notifications)
  const markRead = useNotificationStore((s) => s.markRead)
  const markAllRead = useNotificationStore((s) => s.markAllRead)
  const unread = notifications.filter((n) => !n.read).length

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`}
          className="w-9 h-9 rounded-full flex items-center justify-center text-ink-secondary hover:text-ink-primary hover:bg-[rgba(0,59,70,0.06)] transition-all relative"
        >
          <Bell size={20} />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0 overflow-hidden">
        <header className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold text-ink-primary">Notifications</p>
          {unread > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-tertiary hover:text-ink-primary transition-colors"
            >
              <CheckCheck size={12} /> Mark all read
            </button>
          )}
        </header>
        <ul className="max-h-80 overflow-y-auto divide-y divide-border">
          {notifications.length === 0 && (
            <li>
              <EmptyState
                compact
                headline="You're all caught up"
                support="Certification reminders, approvals and nudges will land here."
              />
            </li>
          )}
          {notifications.map((n) => (
            <li key={n.id}>
              <Link
                href={n.linkUrl}
                onClick={() => {
                  markRead(n.id)
                  setOpen(false)
                }}
                className={cn(
                  'block px-4 py-3 hover:bg-secondary/60 transition-colors',
                  !n.read && 'bg-secondary/40',
                )}
              >
                <div className="flex items-start gap-2">
                  {!n.read && (
                    <span className="mt-1.5 w-2 h-2 shrink-0 rounded-full bg-accent-gold" />
                  )}
                  <div className={cn('min-w-0', n.read && 'pl-4')}>
                    <p className="text-[13px] font-medium text-ink-primary">{n.title}</p>
                    <p className="text-[11px] text-ink-tertiary mt-0.5 line-clamp-2">
                      {n.body}
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

/** Light ⇄ Obsidian toggle (§3.4 dark mode). */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  return (
    <button
      type="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to Obsidian dark mode'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="w-9 h-9 rounded-full flex items-center justify-center text-ink-secondary hover:text-ink-primary hover:bg-[rgba(0,59,70,0.06)] transition-all"
    >
      {isDark ? <Sun size={19} /> : <Moon size={19} />}
    </button>
  )
}
