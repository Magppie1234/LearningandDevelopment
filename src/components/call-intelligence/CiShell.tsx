'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ErrorState, LoadingRows, Notice, PageHeader } from '@/components/ds'
import type { Dataset } from '@/lib/call-intelligence/service'
import { CiFilterBar, GovernanceStrip } from './CiFilterBar'
import { useCi } from './CiContext'
import { canOpen, ROLE_BY_ID } from '@/lib/call-intelligence/rbac'

/**
 * The section shell: tab strip, filter bar, governance strip, RBAC gate.
 *
 * Ten sidebar rows would have broken the portal's nav (it already carries 22),
 * so Call Intelligence is one sidebar entry and ten tabs — see
 * docs/call-intelligence/01-information-architecture.md.
 */

export interface CiTab {
  /** Matches an id in rbac.ALL_PAGES. */
  id: string
  label: string
  href: string
  /** What the page is for, in one line. */
  hint: string
}

export const CI_TABS: CiTab[] = [
  { id: 'overview', label: 'Overview', href: '/call-intelligence', hint: 'Where to intervene this week' },
  { id: 'voice', label: 'Customer Voice', href: '/call-intelligence/voice', hint: 'What customers feel and expect' },
  { id: 'faqs', label: 'FAQs & Knowledge Gaps', href: '/call-intelligence/faqs', hint: 'What to publish, script or train' },
  { id: 'regional', label: 'Regional', href: '/call-intelligence/regional', hint: 'Which region needs attention' },
  { id: 'sales', label: 'Sales & Objections', href: '/call-intelligence/sales', hint: 'What is blocking conversion' },
  { id: 'quality', label: 'Agent Quality', href: '/call-intelligence/quality', hint: 'Who to coach, on what' },
  { id: 'actions', label: 'Next Actions', href: '/call-intelligence/actions', hint: 'What is owed to customers today' },
  { id: 'alerts', label: 'Alerts', href: '/call-intelligence/alerts', hint: 'What must not wait' },
  { id: 'explorer', label: 'Call Explorer', href: '/call-intelligence/explorer', hint: 'Find and read a specific call' },
  { id: 'data-quality', label: 'Data Quality', href: '/call-intelligence/data-quality', hint: 'Can we trust these numbers' },
]

function isActive(pathname: string, tab: CiTab): boolean {
  if (tab.href === '/call-intelligence') return pathname === '/call-intelligence'
  return pathname.startsWith(tab.href)
}

export function CiShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/call-intelligence'
  const { viewer, hrefWithFilters } = useCi()
  const role = ROLE_BY_ID[viewer.roleId]

  const current = CI_TABS.find((t) => isActive(pathname, t))
  const permitted = current ? canOpen(viewer, current.id) : true

  // Ten tabs overflow a laptop viewport, and the strip scrolls. Landing on a
  // tab you cannot see reads as a broken page, so the active one pulls itself
  // into view. `inline: 'nearest'` keeps an already-visible tab still.
  const activeRef = useRef<HTMLAnchorElement>(null)
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [pathname])

  return (
    <div className="space-y-4">
      {/* Filters travel with the tab, so switching page keeps the question. */}
      <nav aria-label="Call Intelligence sections" className="-mx-1 overflow-x-auto">
        <ul className="flex items-center gap-1 px-1 pb-1 min-w-max">
          {CI_TABS.map((tab) => {
            const active = isActive(pathname, tab)
            const allowed = canOpen(viewer, tab.id)
            if (!allowed) {
              return (
                <li key={tab.id}>
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] text-ink-tertiary/60 cursor-not-allowed whitespace-nowrap"
                    title={`${role.label} does not have access to ${tab.label}.`}
                  >
                    <Lock size={11} aria-hidden />
                    {tab.label}
                  </span>
                </li>
              )
            }
            return (
              <li key={tab.id}>
                <Link
                  ref={active ? activeRef : undefined}
                  href={hrefWithFilters(tab.href)}
                  aria-current={active ? 'page' : undefined}
                  title={tab.hint}
                  className={cn(
                    'inline-block px-3 py-1.5 rounded-lg text-[13px] whitespace-nowrap transition-colors',
                    active
                      ? 'bg-accent-copper text-white font-medium'
                      : 'text-ink-secondary hover:text-ink-primary hover:bg-[rgb(var(--rule)/0.05)]',
                  )}
                >
                  {tab.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <GovernanceStrip />
      <CiFilterBar />

      {permitted ? (
        children
      ) : (
        <Notice tone="warning" icon={Lock}>
          <strong>Not available for this role.</strong> {role.label} cannot open{' '}
          {current?.label ?? 'this page'}. {role.description} Switch role in the filter bar to see
          how the scoping changes.
          <span className="block mt-1 text-[11px] opacity-80">
            Note: this is a client-side affordance. Production must evaluate the same policy
            server-side before rows leave the API — see{' '}
            <code>docs/call-intelligence/08-rbac-and-governance.md</code>.
          </span>
        </Notice>
      )}
    </div>
  )
}

/**
 * Per-page frame. Every page states the decision it drives in its subtitle,
 * and none of them render half a dashboard while the dataset is still
 * resolving — the first load shows skeletons, later loads keep the previous
 * numbers on screen so a filter change does not blank the page.
 */
export function CiPageFrame({
  title,
  question,
  actions,
  children,
}: {
  title: string
  question: string
  actions?: ReactNode
  /** Called only once the dataset is present. */
  children: (data: Dataset) => ReactNode
}) {
  const { data, loading, error, reload } = useCi()

  return (
    <div className="space-y-5">
      <PageHeader title={title} description={question} actions={actions} />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data ? (
        loading ? (
          <LoadingRows rows={6} />
        ) : (
          <Notice tone="info">No dataset loaded.</Notice>
        )
      ) : (
        <div className={cn(loading && 'opacity-60 transition-opacity')}>{children(data)}</div>
      )}
    </div>
  )
}
