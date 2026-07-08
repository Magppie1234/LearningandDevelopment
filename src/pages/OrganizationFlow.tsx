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
            <div key={i} className="h-20 w-56 rounded-2xl bg-white/10" />
          ))}
        </div>
        <div className="mx-auto h-8 w-px bg-white/15" />
        <div className="flex justify-center">
          <div className="h-20 w-56 rounded-2xl bg-white/10" />
        </div>
      </div>
    ),
  },
)

/**
 * Full-bleed dark stage in the Our Story theme: Wellness Kitchen photography
 * under a navy veil, with the radial leadership wheel on top.
 */
export default function OrganizationFlow() {
  return (
    <div className="-m-4 sm:-m-8 relative min-h-screen overflow-hidden">
      {/* kitchen ground */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/login/kitchen-33.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(6,42,51,0.93) 0%, rgba(6,42,51,0.88) 45%, rgba(4,26,32,0.95) 100%)',
        }}
      />

      <div className="relative px-4 sm:px-8 py-8 max-w-[1240px] mx-auto space-y-6">
        <section className="pb-6 border-b border-white/10">
          <div className="flex items-center gap-2 text-[#C88255]">
            <Network size={18} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em]">
              Organization Flow
            </span>
          </div>
          <h1 className="font-serif text-4xl font-normal text-[#f3ede2] mt-2">
            Magppie Leadership &amp; Reporting Structure
          </h1>
          <p className="text-sm text-[#f3ede2]/65 mt-2 max-w-[640px]">
            Click any position to assign people or add a sub-unit beneath it. The wheel tilts
            with your cursor — Founder &amp; MD at the centre, every branch in its own colour.
          </p>
        </section>

        <OrgChart />
      </div>
    </div>
  )
}
