'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { AnimatePresence, motion } from 'framer-motion'
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

// Same rotating Wellness Kitchen photography as the login page (3.5s per
// kitchen), but under a LIGHT parchment veil so the chart stays perfectly
// readable — the kitchens glow through softly instead of carrying the page.
const KITCHENS = [
  '/login/kitchen-00.jpg',
  '/login/kitchen-01.jpg',
  '/login/kitchen-02.jpg',
  '/login/kitchen-33.jpg',
  '/login/kitchen-black-kitchen.jpg',
]
const ROTATE_MS = 3500

export default function OrganizationFlow() {
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % KITCHENS.length), ROTATE_MS)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="-m-4 sm:-m-8 relative min-h-screen overflow-hidden">
      {/* rotating kitchen ground */}
      <AnimatePresence>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          key={slide}
          src={KITCHENS[slide]}
          alt=""
          aria-hidden
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 1.1 }, scale: { duration: 3.8, ease: 'linear' } }}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      </AnimatePresence>
      {/* light legibility veil — parchment, not navy, so the chart reads clearly */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(252,249,246,0.90) 0%, rgba(252,249,246,0.84) 45%, rgba(250,245,239,0.92) 100%)',
        }}
      />

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
