'use client'

import { useEffect, useState } from 'react'
import KitchenScene3D from '@/components/KitchenScene3D'

/**
 * Magppie's 3D kitchen render as a fixed, low-opacity page background.
 *
 * Wraps KitchenScene3D (built from magppie.com's 1920x1080_3D_Visuals render,
 * self-hosted at /vision/kitchen-3d.jpg) and adds the three guards a
 * decorative animated layer needs when it sits behind real reading content:
 *
 *   1. TAB HIDDEN — a fixed, full-viewport element is never "off-screen" in
 *      the IntersectionObserver sense, so the meaningful check is the Page
 *      Visibility API. No point animating a background nobody is looking at.
 *   2. SMALL / LOW-POWER — phones and low-memory devices get the still frame.
 *      A 54s transform loop on a blurred 128%-overscanned image is cheap on a
 *      laptop and not on a mid-range phone.
 *   3. REDUCED MOTION — already honoured inside KitchenScene3D itself; the
 *      wrapper's `paused` class is a second, independent belt.
 *
 * The veil is overridden from the component's teal default to the portal's
 * warm-stone palette, and kept opaque enough that body text over it is
 * unchanged in contrast.
 */

/** Warm-stone scrim — matches the portal ground rather than Vision's teal. */
export const VEIL_STONE =
  'linear-gradient(180deg, rgb(var(--m-cream)/0.90) 0%, hsl(var(--background)/0.94) 45%, hsl(var(--background)/0.97) 100%)'

/**
 * Light-blue scrim for Onboarding. Cool and airy against the portal's warm
 * stone — a deliberate departure, since a new joiner's first screen is the one
 * place a different mood is welcome. Kept translucent at the top so the
 * kitchen actually reads, then closing to near-opaque so text lower down sits
 * on flat colour rather than on the render.
 */
/**
 * Light blue -> teal for the module pages: calm and airy, never dark, and it
 * ties them to the onboarding page's blue rather than leaving three different
 * backdrop moods across the portal. ~50% at the top so the kitchen shows
 * through softly, closing near-opaque so long-form text below sits on flat
 * colour. Section panels are solid on top of this, so body copy never
 * actually renders over the photograph.
 */
export const VEIL_TEAL =
  'linear-gradient(180deg, rgba(186,220,236,0.52) 0%, rgba(196,228,231,0.80) 40%, rgba(214,236,236,0.93) 100%)'

export const VEIL_BLUE =
  'linear-gradient(180deg, rgba(214,234,246,0.62) 0%, rgba(223,239,248,0.86) 42%, rgba(233,244,250,0.95) 100%)'

export default function ModuleBackdrop({ veil = VEIL_STONE }: { veil?: string } = {}) {
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const small = window.matchMedia('(max-width: 640px)')
    // navigator.deviceMemory is Chromium-only; absent elsewhere, which is fine
    // — we only use it to opt *out* of motion, never to opt in.
    const lowMem =
      typeof (navigator as { deviceMemory?: number }).deviceMemory === 'number' &&
      (navigator as { deviceMemory?: number }).deviceMemory! <= 4

    const sync = () => setPaused(document.hidden || small.matches || lowMem)
    sync()
    document.addEventListener('visibilitychange', sync)
    small.addEventListener('change', sync)
    return () => {
      document.removeEventListener('visibilitychange', sync)
      small.removeEventListener('change', sync)
    }
  }, [])

  return (
    <div
      aria-hidden
      className={`fixed inset-0 -z-10 pointer-events-none${paused ? ' backdrop-paused' : ''}`}
    >
      <KitchenScene3D blur={4} veil={veil} />
      <style>{`.backdrop-paused .kitchen3d-drift { animation: none; }`}</style>
    </div>
  )
}
