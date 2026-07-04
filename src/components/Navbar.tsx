'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth'
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
  ChevronLeft,
  ChevronRight,
  Leaf,
  LogOut,
  FileCog,
  Compass,
  Menu,
  X,
} from 'lucide-react'

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Compass, label: 'Our story', path: '/vision' },
  { icon: Network, label: 'Organization Flow', path: '/organization-flow' },
  { icon: Footprints, label: 'Onboarding', path: '/onboarding' },
  { icon: BookOpen, label: 'My Learning', path: '/my-learning' },
  { icon: GraduationCap, label: 'Academies', path: '/academies' },
  { icon: Library, label: 'Knowledge Center', path: '/knowledge' },
  { icon: Award, label: 'Certifications', path: '/certifications' },
  { icon: Route, label: 'Career Path', path: '/career' },
  { icon: Bot, label: 'AI Assistant', path: '/ai-assistant' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: FileCog, label: 'Content Admin', path: '/admin/content' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, signOut } = useAuth()

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
                <span className="text-sm font-medium">{item.label}</span>
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
        className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-ink-primary text-parchment flex items-center justify-center hover:bg-ink-secondary transition-colors"
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
              <item.icon
                size={20}
                className={cn(
                  'flex-shrink-0',
                  isActive && 'text-accent-copper',
                  !isActive && 'group-hover:text-ink-primary'
                )}
              />
              {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap">
                  {item.label}
                </span>
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
          <>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-semibold text-ink-primary truncate">
                {displayName}
              </p>
              <p className="text-xs text-ink-tertiary truncate">{email}</p>
            </div>
            <button
              onClick={signOut}
              title="Sign out"
              aria-label="Sign out"
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-ink-tertiary hover:text-ink-primary hover:bg-[rgba(0,59,70,0.06)] transition-colors"
            >
              <LogOut size={16} />
            </button>
          </>
        )}
      </div>
    </nav>
    </>
  )
}
