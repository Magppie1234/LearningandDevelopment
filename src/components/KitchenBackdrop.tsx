'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

/**
 * Rotating Wellness Kitchen photography backdrop — the same imagery as the
 * login page, crossfading every 3.5s. Rendered full-bleed behind a page's
 * content under a translucent veil.
 *
 * `veil="light"` (default) lays a parchment wash so foreground content stays
 * perfectly readable while the kitchens glow through; `veil="dark"` is the
 * navy login-style treatment. Honors prefers-reduced-motion by holding on the
 * first frame.
 */

const KITCHENS = [
  '/login/kitchen-00.jpg',
  '/login/kitchen-01.jpg',
  '/login/kitchen-02.jpg',
  '/login/kitchen-33.jpg',
  '/login/kitchen-black-kitchen.jpg',
]
const ROTATE_MS = 3500

const VEILS = {
  light:
    'linear-gradient(180deg, rgba(252,249,246,0.78) 0%, rgba(252,249,246,0.62) 45%, rgba(250,245,239,0.74) 100%)',
  dark: 'linear-gradient(180deg, rgba(6,42,51,0.93) 0%, rgba(6,42,51,0.88) 45%, rgba(4,26,32,0.95) 100%)',
  /**
   * Blue wash, tuned to sit behind fully saturated cards. Kept heavy on
   * purpose: the Onboarding phase cards are vivid violet/orange/emerald/blue/
   * amber, and a lighter veil left the photography competing with them. This
   * is atmospheric depth, not a second focal point.
   */
  blue: 'linear-gradient(180deg, rgba(18,42,74,0.90) 0%, rgba(24,54,92,0.84) 40%, rgba(14,32,58,0.93) 100%)',
} as const

export default function KitchenBackdrop({
  veil = 'light',
  /**
   * Slow continuous drift + scale on top of the crossfade, so the scene reads
   * as moving rather than as a slideshow of stills. Suppressed under
   * prefers-reduced-motion along with the rotation.
   */
  parallax = false,
}: {
  veil?: keyof typeof VEILS
  parallax?: boolean
}) {
  const [slide, setSlide] = useState(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion) return
    const t = setInterval(() => setSlide((s) => (s + 1) % KITCHENS.length), ROTATE_MS)
    return () => clearInterval(t)
  }, [reduceMotion])

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
      <AnimatePresence>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          key={slide}
          src={KITCHENS[slide]}
          alt=""
          initial={{ opacity: 0, scale: parallax && !reduceMotion ? 1.14 : 1.05 }}
          animate={
            parallax && !reduceMotion
              ? // Drift diagonally while easing the zoom out: the parallax of a
                // slow camera move is what sells depth on a flat photograph.
                { opacity: 1, scale: 1.04, x: [0, -18, 0], y: [0, 10, 0] }
              : { opacity: 1, scale: 1 }
          }
          exit={{ opacity: 0 }}
          transition={
            parallax && !reduceMotion
              ? {
                  opacity: { duration: 1.4 },
                  scale: { duration: 9, ease: 'linear' },
                  x: { duration: 18, ease: 'easeInOut', repeat: Infinity },
                  y: { duration: 22, ease: 'easeInOut', repeat: Infinity },
                }
              : { opacity: { duration: 1.1 }, scale: { duration: 3.8, ease: 'linear' } }
          }
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      </AnimatePresence>
      <div className="absolute inset-0" style={{ background: VEILS[veil] }} />
    </div>
  )
}
