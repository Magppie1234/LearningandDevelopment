'use client'

import dynamic from 'next/dynamic'
import { Network } from 'lucide-react'
import KitchenBackdrop from '@/components/KitchenBackdrop'

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
            <div key={i} className="h-20 w-56 rounded-2xl bg-black/5" />
          ))}
        </div>
        <div className="mx-auto h-8 w-px bg-black/10" />
        <div className="flex justify-center">
          <div className="h-20 w-56 rounded-2xl bg-black/5" />
        </div>
      </div>
    ),
  },
)

export default function OrganizationFlow() {
  return (
    <div className="-m-4 sm:-m-8 relative min-h-screen overflow-hidden">
      {/* Light rotating Wellness Kitchen backdrop (same imagery as login). */}
      <KitchenBackdrop veil="light" />

      <div className="relative px-4 sm:px-8 py-8 max-w-[1240px] mx-auto space-y-6">
        <section className="pb-6 border-b border-[rgba(0,59,70,0.10)]">
          <div className="flex items-center gap-2 text-accent-copper">
            <Network size={18} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em]">
              Organization Flow
            </span>
          </div>
          <h1 className="font-serif text-4xl font-normal text-ink-primary mt-2">
            Magppie Leadership &amp; Reporting Structure
          </h1>
          <p className="text-sm text-ink-secondary mt-2 max-w-[640px]">
            Browse the structure as a simple flow chart or a searchable table — switch
            views below. Click any position to expand it, assign people, or add a
            sub-unit beneath it.
          </p>
        </section>

        <OrgChart />
      </div>
    </div>
  )
}
