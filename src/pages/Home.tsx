'use client'

import KitchenCommandCenter from '@/components/KitchenCommandCenter'
import { useAuthOptional } from '@/lib/auth'

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
  const auth = useAuthOptional()
  const firstName =
    (auth?.user?.user_metadata?.full_name as string | undefined)?.split(' ')[0] ||
    'there'

  return (
    // Bleed out of the portal <main> padding to make a full dark canvas, then
    // re-add padding inside; fills the viewport below the 64px top header.
    <div className="-m-4 sm:-m-8 flex min-h-[calc(100dvh-4rem)] flex-col justify-center gap-8 bg-stone-charcoal p-4 text-stone-ivory sm:p-8">
      <header className="mx-auto w-full max-w-[1100px]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-brass">
          Your kitchen
        </p>
        <h1 className="mt-2 font-serif text-3xl font-light leading-tight text-stone-ivory sm:text-4xl">
          Good to see you, {firstName}. Where to next?
        </h1>
        <p className="mt-2 max-w-[560px] text-sm leading-relaxed text-stone-ivory/60">
          Step into your kitchen and choose what to work on — every surface takes
          you somewhere.
        </p>
      </header>

      <div className="mx-auto w-full max-w-[1100px]">
        <KitchenCommandCenter />
      </div>
    </div>
  )
}
