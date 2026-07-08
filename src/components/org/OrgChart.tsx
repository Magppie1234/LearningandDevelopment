'use client'

import { Network } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useOrgStore } from '@/lib/org-store'
import { BoardRow } from './BoardRow'
import { CSuiteCard } from './CSuiteCard'
import { RadialOrgChart } from './RadialOrgChart'

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

  // This component only ever mounts client-side (see pages/OrganizationFlow.tsx,
  // which loads it via next/dynamic ssr:false — the zustand persist middleware
  // touches localStorage at store-creation time, which must never run on the
  // server). `hydrated` still gives a brief, real loading state while the
  // localStorage read completes.
  if (!hydrated) return <ChartSkeleton />
  if (positions.length === 0) return <EmptyState />

  return (
    <div className="space-y-8">
      {/* Desktop: radial org chart — Founder & MD at the centre, board on
          dashed orbits, each C-Suite branch fanned out with its accent. */}
      <div className="hidden xl:block">
        <RadialOrgChart />
      </div>

      {/* Narrower viewports: the original accordion stack — a branching tree
          needs a single, non-wrapping row of six nodes to draw correctly, which
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
    </div>
  )
}
