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
const VEIL =
  'linear-gradient(180deg, rgb(var(--m-cream)/0.90) 0%, hsl(var(--background)/0.94) 45%, hsl(var(--background)/0.97) 100%)'

export default function ModuleBackdrop() {
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
      <KitchenScene3D blur={4} veil={VEIL} />
      <style>{`.backdrop-paused .kitchen3d-drift { animation: none; }`}</style>
    </div>
  )
}
