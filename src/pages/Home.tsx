'use client'

import KitchenCommandCenter from '@/components/KitchenCommandCenter'
import LearningDashboard from '@/components/learning/LearningDashboard'
import OverallProgressPopup from '@/components/learning/OverallProgressPopup'

/**
 * Dashboard landing — an interactive-first "Kitchen Command Center".
 *
 * The page IS the scene: a full-bleed warm-dark (Warm Stone) canvas with a
 * short greeting and the stylized kitchen, which doubles as the primary
 * navigation surface. The previous marketing sections (glanceable strip, daily
 * nudge, continue-watching, explore-visually, quick-access, featured courses,
 * leaderboard, points, CTA — all hardcoded demo content) were intentionally
 * removed so the landing reads as one confident interactive choice, not a wall
 * of cards.
 */
export default function Home() {
  return (
    // Bleed out of the portal <main> padding to make a full dark canvas, then
    // re-add padding inside; fills the viewport below the 64px top header.
    <div className="-m-4 sm:-m-8 flex min-h-[calc(100dvh-4rem)] flex-col justify-start gap-12 bg-stone-charcoal p-4 pt-10 text-stone-ivory sm:p-8 sm:pt-12">
      <header className="mx-auto w-full max-w-[1100px]">
        <h1 className="font-serif text-3xl font-light leading-tight text-stone-ivory sm:text-4xl">
          Magppie AI Excellence
        </h1>
      </header>

      {/* Global Personal Learning Dashboard FIRST (user preference) —
          aggregates every academy the learner is enrolled in (no academyId =
          global scope). Cream cards sit on the dark canvas as solid panels
          (no glass), per the design spec. */}
      <div className="mx-auto w-full max-w-[1100px]">
        <div className="mb-4">
          <h2 className="font-serif text-3xl font-light text-stone-ivory">My Progress Report</h2>
          <p className="text-sm text-stone-ivory/55 mt-1">
            Your learning across every academy — time, scores, and insights, live as you go.
          </p>
        </div>
        <LearningDashboard
          viewerRole="learner"
          showGlobalExtras
          resumeHref={(aId, moduleId) =>
            aId === (process.env.NEXT_PUBLIC_SALES_ACADEMY_ID ?? 'sales')
              ? '/academy/sales?tab=curriculum'
              : `/academy/business-development/modules?module=${moduleId}`
          }
        />
      </div>

      {/* ...then the Kitchen Command Center and everything else. */}
      <div className="mx-auto w-full max-w-[1100px]">
        <KitchenCommandCenter />
      </div>

      {/* Every-login snapshot — learner-facing, once per session. */}
      <OverallProgressPopup />
    </div>
  )
}
