'use client'

import { usePathname } from 'next/navigation'
import { Leaf, Search } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Login from '@/components/Login'
import PoojaWidget from '@/components/PoojaWidget'
import { NotificationBell, ThemeToggle } from '@/components/HeaderControls'
import { useAuth } from '@/lib/auth'

const pageTitles: Record<string, { title: string; breadcrumb: string }> = {
  '/': { title: 'Dashboard', breadcrumb: 'Home' },
  '/vision': { title: 'Our story', breadcrumb: 'Home / Our story' },
  '/organization-flow': { title: 'Organization Flow', breadcrumb: 'Home / Organization Flow' },
  '/onboarding': { title: 'Onboarding', breadcrumb: 'Home / Onboarding' },
  '/my-learning': { title: 'My Learning', breadcrumb: 'Home / My Learning' },
  '/academies': { title: 'Academies', breadcrumb: 'Home / Academies' },
  '/academies/monthly-quiz': {
    title: 'BDE Monthly Quiz',
    breadcrumb: 'Home / Academies / Monthly Quiz',
  },
  '/knowledge': { title: 'Knowledge Center', breadcrumb: 'Home / Knowledge Center' },
  '/certifications': { title: 'Certifications', breadcrumb: 'Home / Certifications' },
  '/career': { title: 'Career Development', breadcrumb: 'Home / Career' },
  '/ai-assistant': { title: 'AI Assistant', breadcrumb: 'Home / AI Assistant' },
  '/analytics': { title: 'Analytics', breadcrumb: 'Home / Analytics' },
  '/admin/content': { title: 'Content Governance', breadcrumb: 'Home / Admin / Content' },
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { loading, session, user } = useAuth()
  const pathname = usePathname()

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-parchment">
        <Leaf className="animate-pulse text-surface-sage" size={36} />
      </div>
    )
  }

  if (!session) return <Login />

  const pageInfo = pageTitles[pathname ?? '/'] || { title: 'Page', breadcrumb: 'Home' }
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    user?.email ||
    'User'
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const initials = displayName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="min-h-[100dvh]">
      {/* Fixed left sidebar (desktop) / slide-over (mobile) */}
      <Navbar />

      {/* Main content area - offset for sidebar on desktop only */}
      <div className="lg:ml-[260px] min-h-[100dvh] flex flex-col">
        {/* Top header */}
        <header className="sticky top-0 z-40 h-16 bg-parchment/95 backdrop-blur-sm border-b border-[rgba(0,59,70,0.08)] flex items-center justify-between px-4 sm:px-8">
          <div className="min-w-0">
            <h1 className="font-sans text-lg font-semibold text-ink-primary truncate">
              {pageInfo.title}
            </h1>
            <p className="text-[11px] text-ink-tertiary mt-0.5 truncate">
              {pageInfo.breadcrumb}
            </p>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <button className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center text-ink-secondary hover:text-ink-primary hover:bg-[rgba(0,59,70,0.06)] transition-all">
              <Search size={20} />
            </button>
            <NotificationBell />
            <ThemeToggle />
            <div className="w-8 h-8 rounded-full bg-surface-blue flex items-center justify-center relative ml-1 overflow-hidden">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-semibold text-ink-primary">
                  {initials}
                </span>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-parchment" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-8">{children}</main>

        <Footer />
      </div>

      {/* Sticky AI widget — available on every page (§3.4) */}
      <PoojaWidget />
    </div>
  )
}
