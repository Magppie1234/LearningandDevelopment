'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeft, Search } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PoojaWidget from '@/components/PoojaWidget'
import GlobalSearch from '@/components/shell/GlobalSearch'
import RoleSwitcher from '@/components/shell/RoleSwitcher'
import { NotificationBell, ThemeToggle } from '@/components/HeaderControls'
import { useRole } from '@/lib/role-context'
import { useDataSource } from '@/lib/data-source'
import { canAccessPath, navMatchForPath, ROLE_LABEL } from '@/lib/roles'
import { SidebarStateProvider, useSidebarState } from '@/lib/sidebar-state'
import { cn } from '@/lib/utils'
import { Notice } from '@/components/ds'
import KitchenHeaderBackdrop from '@/components/KitchenHeaderBackdrop'

/**
 * Portal shell: sidebar + header + content.
 *
 * Page titles and breadcrumbs are derived from the information architecture in
 * `lib/roles.ts` rather than from a hand-maintained path→title map, which had
 * already drifted (several routes fell through to a literal "Page"). One
 * source of truth means a new route is named correctly the moment it is added
 * to the nav.
 */

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarStateProvider>
      <PortalLayoutBody>{children}</PortalLayoutBody>
    </SidebarStateProvider>
  )
}

/** Prettify an unmapped segment, e.g. "business-development" → "Business development". */
function titleiseSegment(seg: string): string {
  const s = decodeURIComponent(seg).replace(/[-_]/g, ' ')
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function PortalLayoutBody({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebarState()
  const { role, member } = useRole()
  const { isSample, setSource } = useDataSource()
  const pathname = usePathname() ?? '/'
  const router = useRouter()
  const [searchOpen, setSearchOpen] = useState(false)

  const isHome = pathname === '/'
  const isStory = pathname === '/vision'
  const navMatch = navMatchForPath(pathname)
  const navItem = navMatch?.item
  const allowed = canAccessPath(role, pathname)

  // ⌘K / Ctrl-K opens search from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Title: the nav entry that owns this route; deeper routes append their own
  // leaf so /academy/sales/modules reads "Learning Paths / Sales / Modules".
  const title = navItem?.label ?? titleiseSegment(pathname.split('/').filter(Boolean).pop() ?? 'Home')
  // Trim the prefix that actually matched, not the entry's own path — for
  // routes claimed via `matches` those differ, and trimming the wrong one ate
  // the first letter of the next segment.
  const trail = navMatch
    ? pathname
        .slice(navMatch.prefix === '/' ? 1 : navMatch.prefix.length)
        .split('/')
        .filter(Boolean)
        .map(titleiseSegment)
    : []

  const displayName = member?.name ?? 'User'
  const initials = displayName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="min-h-[100dvh]">
      <Navbar />

      {/* overflow-x-hidden is deliberate: several pages use translate-based
          scroll-reveal animations (framer-motion `whileInView` with an x
          offset), and an element parked 20px to the right widens the document
          and gives the whole page a horizontal scrollbar on a phone. Clipping
          here contains that without affecting inner scroll containers, which
          manage their own overflow. */}
      <div
        className={cn(
          'min-h-[100dvh] flex flex-col overflow-x-hidden transition-[margin] duration-200',
          collapsed ? 'lg:ml-[68px]' : 'lg:ml-[248px]',
        )}
      >
        <header className="sticky top-0 z-40 h-14 bg-background/92 backdrop-blur-sm border-b border-hairline/10 flex items-center justify-between gap-3 pl-16 pr-3 lg:px-6">
          <div className="min-w-0 flex items-center gap-2.5">
            {!isHome && (
              <button
                type="button"
                onClick={() => router.back()}
                aria-label="Go back"
                className="hidden sm:flex flex-shrink-0 w-8 h-8 rounded-lg items-center justify-center text-ink-secondary hover:text-ink-primary hover:bg-[rgb(var(--rule)/0.06)] transition-colors"
              >
                <ArrowLeft size={17} />
              </button>
            )}
            <div className="min-w-0">
              <h1 className="text-[15px] font-semibold text-ink-primary truncate leading-tight">
                {title}
              </h1>
              <nav aria-label="Breadcrumb" className="text-[11px] text-ink-tertiary truncate">
                <Link href="/" className="hover:text-ink-secondary transition-colors">
                  Home
                </Link>
                {!isHome && navItem && (
                  <>
                    <span aria-hidden> / </span>
                    <Link
                      href={navItem.path}
                      className="hover:text-ink-secondary transition-colors"
                    >
                      {navItem.label}
                    </Link>
                  </>
                )}
                {trail.map((t) => (
                  <span key={t}>
                    <span aria-hidden> / </span>
                    {t}
                  </span>
                ))}
              </nav>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search the portal"
              className="hidden md:flex items-center gap-2 h-9 pl-2.5 pr-2 rounded-lg border border-hairline/15 bg-parchment text-ink-tertiary hover:text-ink-primary hover:border-hairline/25 transition-colors"
            >
              <Search size={15} aria-hidden />
              <span className="text-xs">Search</span>
              <kbd className="ml-2 text-[10px] font-sans rounded border border-hairline/15 px-1 py-0.5 text-ink-tertiary">
                ⌘K
              </kbd>
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search the portal"
              className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-ink-secondary hover:bg-[rgb(var(--rule)/0.06)]"
            >
              <Search size={18} />
            </button>

            <div className="hidden sm:block">
              <RoleSwitcher />
            </div>
            <NotificationBell />
            <ThemeToggle />
            <span
              className="w-8 h-8 rounded-full bg-accent-copper/15 text-accent-copper flex items-center justify-center text-[11px] font-semibold ml-0.5 flex-shrink-0"
              title={`${displayName} — ${ROLE_LABEL[role]}`}
            >
              {initials}
            </span>
          </div>
        </header>

        {/* Extra bottom padding clears the floating assistant button so it
            never covers a page's last action on small screens. */}
        <main className="relative flex-1 p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pb-24">
          {/* The kitchen sits behind the top band of every page, mounted once
              here rather than per-page. Our Story is excluded: it keeps its
              own design, and it already opens on a full-bleed kitchen of its
              own that this would sit behind and fight with. */}
          {!isStory && <KitchenHeaderBackdrop />}
          <div className="mx-auto w-full max-w-[1400px] space-y-6">
            {/* Only shown when the viewer has actually opted into sample
                records. It used to render unconditionally, which made it
                wallpaper — a warning that is always on screen stops being
                read. Live mode says nothing here; pages that cannot serve
                live data explain themselves in place instead. */}
            {isSample && (
              <Notice tone="warning">
                <strong>Sample data.</strong> You are viewing the labelled demo cohort as{' '}
                {ROLE_LABEL[role]}
                {member ? ` (${member.name})` : ''} — useful for reviewing a role you do not hold.
                These are placeholder records, not real employees, so nothing here should be
                reported or acted on.{' '}
                <button
                  type="button"
                  onClick={() => setSource('live')}
                  className="underline font-medium hover:no-underline"
                >
                  Switch to my data
                </button>
                .
              </Notice>
            )}

            {allowed ? (
              children
            ) : (
              <Notice tone="warning">
                <strong>Not available for your role.</strong> {ROLE_LABEL[role]} does not have
                access to this section.{' '}
                <Link href="/" className="underline font-medium">
                  Return to Home
                </Link>
                .
              </Notice>
            )}
          </div>
        </main>

        <Footer />
      </div>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <PoojaWidget />
    </div>
  )
}
