'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth'
import { useSidebarState } from '@/lib/sidebar-state'
import {
  Home,
  BookOpen,
  GraduationCap,
  Library,
  Award,
  Route,
  Bot,
  BarChart3,
  Network,
  Footprints,
  Workflow,
  ChevronLeft,
  ChevronRight,
  Leaf,
  FileCog,
  Compass,
  Menu,
  X,
} from 'lucide-react'

/** Build-out status per section — shown as a colored dot beside the label. */
type NavStatus = 'done' | 'in-progress' | 'todo'

const STATUS_DOT: Record<NavStatus, string> = {
  done: 'bg-emerald-500',
  'in-progress': 'bg-amber-400',
  todo: 'bg-red-500',
}

const navItems: { icon: typeof Home; label: string; path: string; status: NavStatus }[] = [
  { icon: Home, label: 'Home', path: '/', status: 'done' },
  { icon: Compass, label: 'Our story', path: '/vision', status: 'done' },
  { icon: Network, label: 'Organization Flow', path: '/organization-flow', status: 'in-progress' },
  { icon: Footprints, label: 'Onboarding', path: '/onboarding', status: 'todo' },
  { icon: BookOpen, label: 'My Learning', path: '/my-learning', status: 'todo' },
  { icon: GraduationCap, label: 'Academies', path: '/academies', status: 'in-progress' },
  { icon: Workflow, label: 'Process Flow', path: '/journey', status: 'done' },
  { icon: Library, label: 'Knowledge Center', path: '/knowledge', status: 'todo' },
  { icon: Award, label: 'Certifications', path: '/certifications', status: 'todo' },
  { icon: Route, label: 'Career Path', path: '/career', status: 'todo' },
  { icon: Bot, label: 'AI Assistant', path: '/ai-assistant', status: 'todo' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics', status: 'todo' },
  { icon: FileCog, label: 'Content Admin', path: '/admin/content', status: 'todo' },
]

export default function Navbar() {
  const pathname = usePathname()
  const { collapsed, setCollapsed } = useSidebarState()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useAuth()

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    user?.email ||
    'User'
  const email = user?.email ?? ''
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const initials = displayName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <>
    {/* Mobile: hamburger + slide-over (mobile-first pass, §3.4) */}
    <button
      type="button"
      aria-label="Open navigation"
      onClick={() => setMobileOpen(true)}
      className="lg:hidden fixed bottom-6 left-5 z-[60] w-12 h-12 rounded-full bg-ink-primary text-parchment shadow-elevated flex items-center justify-center"
    >
      <Menu size={20} />
    </button>
    {mobileOpen && (
      <div className="lg:hidden fixed inset-0 z-[70]">
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setMobileOpen(false)}
        />
        <div className="absolute left-0 top-0 h-full w-[280px] bg-parchment shadow-elevated flex flex-col">
          <div className="flex items-center justify-between px-5 h-16 border-b border-[rgba(0,59,70,0.08)]">
            <span className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/magppie-logo-navy.png" alt="Magppie" className="h-5 w-auto dark:hidden" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/magppie-logo.png" alt="Magppie" className="h-5 w-auto hidden dark:block" />
            </span>
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
              className="text-ink-tertiary hover:text-ink-primary"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-full transition-all',
                  pathname === item.path
                    ? 'bg-ink-primary text-parchment'
                    : 'text-ink-secondary hover:bg-[rgba(0,59,70,0.06)] hover:text-ink-primary',
                )}
              >
                <item.icon size={19} className="flex-shrink-0" />
                <span className="text-sm font-medium flex-1">{item.label}</span>
                <span
                  className={cn('w-2 h-2 rounded-full flex-shrink-0', STATUS_DOT[item.status])}
                  aria-hidden
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    )}

    <nav
      className={cn(
        'fixed left-0 top-0 h-full bg-parchment border-r border-[rgba(0,59,70,0.08)] z-50 hidden lg:flex flex-col transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
      style={{
        backgroundImage: "url('/paper-grain-texture.png')",
        backgroundSize: '200px',
        backgroundBlendMode: 'overlay',
      }}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-3 w-6 h-6 rounded-full bg-ink-primary text-parchment flex items-center justify-center hover:bg-ink-secondary transition-colors"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Logo — real Magppie wordmark (§2). White original for dark mode,
          navy-tinted variant for the light sidebar; collapsed shows the leaf. */}
      <div className={cn('flex items-center gap-2 px-5 h-16', collapsed && 'justify-center px-2')}>
        {collapsed ? (
          <Leaf className="text-surface-sage flex-shrink-0" size={24} />
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/magppie-logo-navy.png" alt="Magppie" className="h-6 w-auto dark:hidden" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/magppie-logo.png" alt="Magppie" className="h-6 w-auto hidden dark:block" />
          </>
        )}
      </div>

      {/* Nav Items */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto hide-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-full transition-all duration-200 group',
                isActive
                  ? 'bg-ink-primary text-parchment shadow-md'
                  : 'text-ink-secondary hover:bg-[rgba(0,59,70,0.06)] hover:text-ink-primary',
                collapsed && 'justify-center px-2'
              )}
            >
              {/* §4: active nav state carries the copper primary accent */}
              <span className="relative flex-shrink-0">
                <item.icon
                  size={20}
                  className={cn(
                    isActive && 'text-accent-copper',
                    !isActive && 'group-hover:text-ink-primary'
                  )}
                />
                {collapsed && (
                  <span
                    className={cn(
                      'absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-parchment',
                      STATUS_DOT[item.status]
                    )}
                    aria-hidden
                  />
                )}
              </span>
              {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap flex-1">
                  {item.label}
                </span>
              )}
              {!collapsed && (
                <span
                  className={cn('w-2 h-2 rounded-full flex-shrink-0', STATUS_DOT[item.status])}
                  aria-hidden
                />
              )}
            </Link>
          )
        })}
      </div>

      {/* User card at bottom */}
      <div
        className={cn(
          'px-4 py-4 border-t border-[rgba(0,59,70,0.08)] flex items-center gap-3',
          collapsed && 'justify-center px-2'
        )}
      >
        <div className="w-9 h-9 rounded-full bg-surface-blue flex items-center justify-center flex-shrink-0 overflow-hidden">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-semibold text-ink-primary">
              {initials}
            </span>
          )}
        </div>
        {!collapsed && (
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-semibold text-ink-primary truncate">
              {displayName}
            </p>
            <p className="text-xs text-ink-tertiary truncate">{email}</p>
          </div>
        )}
      </div>
    </nav>
    </>
  )
}
