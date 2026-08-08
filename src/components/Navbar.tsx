'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight, Leaf, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebarState } from '@/lib/sidebar-state'
import { useRole } from '@/lib/role-context'
import { navFor, navItemForPath, ROLE_LABEL } from '@/lib/roles'
import { IconButton } from '@/components/ds'

/**
 * Primary navigation.
 *
 * Replaces a flat 22-entry list that carried build-status dots (red / amber /
 * green) straight from the delivery plan into the end-user UI — an employee
 * has no use for "this section is still to-do", and a red dot beside
 * "My Learning" reads as an error. Entries are now grouped into the five bands
 * of the information architecture and filtered by role, so a BD executive sees
 * eleven relevant entries instead of twenty-two mostly-forbidden ones.
 */

function NavList({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname() ?? '/'
  const { role } = useRole()
  const groups = navFor(role)
  const active = navItemForPath(pathname)

  return (
    <div className="flex-1 px-2.5 py-3 overflow-y-auto hide-scrollbar">
      {groups.map((group) => (
        <div key={group.title ?? 'top'} className={cn(group.title && 'mt-4 first:mt-0')}>
          {group.title && !collapsed && (
            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.09em] text-ink-tertiary">
              {group.title}
            </p>
          )}
          {group.title && collapsed && (
            <div className="mx-3 my-2.5 border-t border-hairline/10" aria-hidden />
          )}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const isActive = active?.path === item.path
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    onClick={onNavigate}
                    aria-current={isActive ? 'page' : undefined}
                    title={collapsed ? `${item.label} — ${item.hint}` : undefined}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors group relative',
                      '[@media(pointer:coarse)]:py-2.5',
                      isActive
                        ? 'bg-accent-copper/10 text-ink-primary font-medium'
                        : 'text-ink-secondary hover:bg-[rgb(var(--rule)/0.05)] hover:text-ink-primary',
                      collapsed && 'justify-center px-2',
                    )}
                  >
                    {/* Active state is carried by an accent rail as well as the
                        tint, so it survives a greyscale render. */}
                    {isActive && (
                      <span
                        className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-accent-copper"
                        aria-hidden
                      />
                    )}
                    <item.icon
                      size={18}
                      className={cn('flex-shrink-0', isActive && 'text-accent-copper')}
                      aria-hidden
                    />
                    {!collapsed && (
                      <span className="text-[13px] leading-tight truncate">{item.label}</span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}

function Wordmark({ collapsed }: { collapsed?: boolean }) {
  if (collapsed) {
    return <Leaf className="text-accent-copper flex-shrink-0" size={22} aria-label="Magppie" />
  }
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/magppie-logo-navy.png" alt="Magppie" className="h-5 w-auto dark:hidden" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/magppie-logo.png" alt="Magppie" className="h-5 w-auto hidden dark:block" />
    </>
  )
}

export default function Navbar() {
  const { collapsed, setCollapsed } = useSidebarState()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { member, role } = useRole()

  const displayName = member?.name ?? 'User'
  const initials = displayName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const identity = (
    <div
      className={cn(
        'px-3 py-3 border-t border-hairline/10 flex items-center gap-2.5',
        collapsed && 'justify-center px-2',
      )}
    >
      <span className="w-8 h-8 rounded-full bg-accent-copper/15 text-accent-copper flex items-center justify-center flex-shrink-0 text-xs font-semibold">
        {initials}
      </span>
      {!collapsed && (
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-medium text-ink-primary truncate">
            {displayName}
          </span>
          <span className="block text-[11px] text-ink-tertiary truncate">
            {member?.role ?? ROLE_LABEL[role]}
          </span>
        </span>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile trigger — top-left so it sits with the header, not over content. */}
      <button
        type="button"
        aria-label="Open navigation"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-[60] w-10 h-10 rounded-lg bg-parchment border border-hairline/12 shadow-card flex items-center justify-center text-ink-primary"
      >
        <Menu size={19} />
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[70]">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <nav
            aria-label="Main"
            className="absolute left-0 top-0 h-full w-[280px] max-w-[85vw] bg-background shadow-elevated flex flex-col animate-in slide-in-from-left duration-200"
          >
            <div className="flex items-center justify-between px-4 h-14 border-b border-hairline/10 flex-shrink-0">
              <Wordmark />
              <IconButton icon={X} label="Close navigation" onClick={() => setMobileOpen(false)} />
            </div>
            <NavList collapsed={false} onNavigate={() => setMobileOpen(false)} />
            {identity}
          </nav>
        </div>
      )}

      <nav
        aria-label="Main"
        className={cn(
          'fixed left-0 top-0 h-full bg-parchment border-r border-hairline/10 z-50 hidden lg:flex flex-col transition-[width] duration-200',
          collapsed ? 'w-[68px]' : 'w-[248px]',
        )}
      >
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
          className="absolute -right-3 top-4 w-6 h-6 rounded-full bg-parchment border border-hairline/15 shadow-card text-ink-secondary flex items-center justify-center hover:text-ink-primary transition-colors z-10"
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>

        <div
          className={cn(
            'flex items-center gap-2 px-4 h-14 flex-shrink-0 border-b border-hairline/8',
            collapsed && 'justify-center px-2',
          )}
        >
          <Wordmark collapsed={collapsed} />
        </div>

        <NavList collapsed={collapsed} />
        {identity}
      </nav>
    </>
  )
}
