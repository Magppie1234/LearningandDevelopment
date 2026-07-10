'use client'

import { useState } from 'react'
import { Network, Table2 } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { cn } from '@/lib/utils'
import { useOrgStore } from '@/lib/org-store'
import { BoardRow } from './BoardRow'
import { CSuiteCard } from './CSuiteCard'
import { OrgChartTree } from './OrgChartTree'
import { OrgTable } from './OrgTable'

function ConnectorLine() {
  return <div className="mx-auto h-8 w-px bg-[rgba(0,59,70,0.15)]" />
}

function ChartSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-center gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 w-56 rounded-2xl bg-cream" />
        ))}
      </div>
      <ConnectorLine />
      <div className="max-w-[720px] mx-auto space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-2xl bg-cream" />
        ))}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="max-w-[480px] mx-auto text-center py-20">
      <div className="mx-auto w-14 h-14 rounded-full bg-cream flex items-center justify-center mb-4">
        <Network className="text-ink-tertiary" size={24} />
      </div>
      <h2 className="font-serif text-2xl text-ink-primary">No organization structure yet</h2>
      <p className="text-sm text-ink-secondary mt-2">
        Nothing has been added to the org chart. Reload the page to restore the default
        Magppie leadership structure, or start adding positions.
      </p>
    </div>
  )
}

type OrgView = 'flow' | 'table'

export function OrgChart() {
  const hydrated = useOrgStore((s) => s.hydrated)
  const positions = useOrgStore((s) => s.positions)
  const cSuite = useOrgStore(
    useShallow((s) =>
      s.positions
        .filter((p) => p.tier === 'c_suite')
        .sort((a, b) => a.sortOrder - b.sortOrder),
    ),
  )
  // Deep-linkable view (?view=table). This component mounts client-only
  // (next/dynamic ssr:false), so window is safe to read in the initializer.
  const [view, setView] = useState<OrgView>(() =>
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('view') === 'table'
      ? 'table'
      : 'flow',
  )

  // This component only ever mounts client-side (see pages/OrganizationFlow.tsx,
  // which loads it via next/dynamic ssr:false — the zustand persist middleware
  // touches localStorage at store-creation time, which must never run on the
  // server). `hydrated` still gives a brief, real loading state while the
  // localStorage read completes.
  if (!hydrated) return <ChartSkeleton />
  if (positions.length === 0) return <EmptyState />

  return (
    <div className="space-y-6">
      {/* view toggle */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-full border-[0.5px] border-[rgba(0,59,70,0.16)] bg-cream p-1 shadow-card">
          {(
            [
              { key: 'flow', label: 'Flow chart', icon: Network },
              { key: 'table', label: 'Table', icon: Table2 },
            ] as const
          ).map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => setView(v.key)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors',
                view === v.key
                  ? 'bg-ink-primary text-parchment'
                  : 'text-ink-secondary hover:text-ink-primary',
              )}
            >
              <v.icon size={14} />
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {view === 'table' ? (
        <OrgTable />
      ) : (
        <>
          {/* Desktop: branching tree — Board on top, trunk-and-branch
              connectors, one row of C-Suite nodes, one open panel at a time. */}
          <div className="hidden xl:block">
            <OrgChartTree cSuite={cSuite} />
          </div>

          {/* Narrower viewports: the accordion stack — a branching tree needs
              a single, non-wrapping row of six nodes to draw correctly, which
              doesn't reliably fit below the xl breakpoint (1280px). */}
          <div className="xl:hidden space-y-8">
            <BoardRow />
            <ConnectorLine />
            <div className="max-w-[760px] mx-auto space-y-4">
              {cSuite.map((c) => (
                <CSuiteCard key={c.id} position={c} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
