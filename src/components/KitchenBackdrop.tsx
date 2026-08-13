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
   * Blue wash, deliberately light enough that the kitchen and its motion are
   * actually visible rather than a vague texture. It works at this strength
   * because the cards on top are bright and opaque — a darker card palette
   * would need a heavier veil and would bury the scene again.
   */
  blue: 'linear-gradient(180deg, rgba(16,38,70,0.62) 0%, rgba(20,48,86,0.52) 40%, rgba(12,28,54,0.68) 100%)',
  /**
   * Vision Corner: white stays the base, so this is a near-white wash with the
   * page's pale teal through the middle. Heavier than the blue veil because
   * that page's content is dark ink on white — the backdrop is atmosphere
   * here, not a feature.
   */
  teal: 'linear-gradient(180deg, rgba(255,255,255,0.90) 0%, rgba(231,241,240,0.84) 45%, rgba(255,255,255,0.92) 100%)',
  /**
   * Vision Corner: the same treatment as Onboarding's `blue`, in the page's
   * teal. Alphas are copied from it deliberately (0.62 / 0.52 / 0.68) rather
   * than re-tuned — the ask was for the identical backdrop with a different
   * palette, so only the hue changes and the kitchens read exactly as visibly
   * as they do there.
   */
  tealDark:
    'linear-gradient(180deg, rgba(10,52,50,0.62) 0%, rgba(14,68,64,0.52) 40%, rgba(6,36,35,0.68) 100%)',
  /**
   * Vision Corner: dark enough for the kitchen to read and for white type to
   * sit on it, but NEUTRAL — a warm near-black rather than a hue.
   *
   * Deliberately not `tealDark`. The brief is explicit that the photograph's
   * own browns and woods stay as they are, and that teal/gold belong to the
   * foreground content rather than to a recolouring of the image. A warm
   * background under cool-toned content is the intended contrast, not a
   * mismatch to be corrected. Slightly lighter than `blue` (0.56 vs 0.62)
   * because this page wants a softer presence than Onboarding's.
   */
  warmDim:
    'linear-gradient(180deg, rgba(26,20,15,0.56) 0%, rgba(32,25,19,0.46) 40%, rgba(20,15,11,0.62) 100%)',
} as const

export default function KitchenBackdrop({
  /**
   * Override the rotation. Vision Corner leads with Magppie's own wide 3D
   * hero visual — the asset the brief names as the best starting point —
   * followed by real installed kitchens, all self-hosted.
   */
  images = KITCHENS,
  veil = 'light',
  /**
   * Slow continuous drift + scale on top of the crossfade, so the scene reads
   * as moving rather than as a slideshow of stills. Suppressed under
   * prefers-reduced-motion along with the rotation.
   */
  parallax = false,
  /**
   * Softens the scene in px. Blur is what lets a backdrop stay present without
   * competing: motion and depth survive it, but edges and detail stop pulling
   * the eye off the content. Onboarding wants the kitchen legible and so
   * passes none; Vision Corner wants atmosphere only and blurs it.
   */
  blur = 0,
}: {
  images?: readonly string[]
  veil?: keyof typeof VEILS
  parallax?: boolean
  blur?: number
}) {
  const [slide, setSlide] = useState(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion) return
    const t = setInterval(() => setSlide((s) => (s + 1) % images.length), ROTATE_MS)
    return () => clearInterval(t)
  }, [reduceMotion, images.length])

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
      {/*
        Blur lives on this wrapper, not on the image: the image's transform is
        driven by framer-motion, and a style transform here would be overwritten
        by it. Scaling up compensates for blur sampling past the edges, which
        would otherwise feather the frame to transparent. The veil sits outside
        this wrapper so it stays crisp.
      */}
      <div
        className="absolute inset-0"
        style={blur ? { filter: `blur(${blur}px)`, transform: 'scale(1.08)' } : undefined}
      >
        <AnimatePresence>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          key={slide}
          src={images[slide % images.length]}
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
      </div>
      <div className="absolute inset-0" style={{ background: VEILS[veil] }} />
    </div>
  )
}
