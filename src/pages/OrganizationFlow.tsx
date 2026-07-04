'use client'

import dynamic from 'next/dynamic'
import { Network } from 'lucide-react'

/**
 * Client-only import. The chart's store uses zustand `persist` against
 * localStorage at module-init time — that must never execute during Next's
 * server render, so this whole subtree is excluded from the server bundle.
 */
const OrgChart = dynamic(
  () => import('@/components/org/OrgChart').then((m) => m.OrgChart),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-center gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 w-56 rounded-2xl bg-cream" />
          ))}
        </div>
        <div className="mx-auto h-8 w-px bg-[rgba(0,59,70,0.15)]" />
        <div className="flex justify-center">
          <div className="h-20 w-56 rounded-2xl bg-cream" />
        </div>
      </div>
    ),
  },
)

export default function OrganizationFlow() {
  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      <section className="pb-6 border-b border-[rgba(0,59,70,0.08)]">
        <div className="flex items-center gap-2 text-ink-tertiary">
          <Network size={18} />
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em]">
            Organization Flow
          </span>
        </div>
        <h1 className="font-serif text-4xl font-normal text-ink-primary mt-2">
          Magppie Leadership &amp; Reporting Structure
        </h1>
        <p className="text-sm text-ink-secondary mt-2 max-w-[640px]">
          Click any position to assign or reassign someone. Drag the handle on a
          department to reorder it. Changes save instantly.
        </p>
      </section>

      <OrgChart />
    </div>
  )
}
