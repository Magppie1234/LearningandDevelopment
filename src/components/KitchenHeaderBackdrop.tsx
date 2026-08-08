'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * The Wellness Kitchen behind the header band of every data page — the same
 * treatment as the login page's `KitchenBackdrop` (slow crossfade + gentle
 * push-in), retuned for pages people read numbers on:
 *
 *   - real installed Magppie kitchens from the "Our Wellness Spaces" gallery,
 *     downscaled and self-hosted under /public/kitchen (never the shop CDN);
 *   - a much slower rotation than login's 3.5s — movement should register at
 *     the edge of attention, not compete with a KPI;
 *   - confined to a band that resolves to flat page ground well before the
 *     first card, so content below sits on plain cream;
 *   - `prefers-reduced-motion` holds the first frame, exactly like login.
 */

const KITCHENS = [
  '/kitchen/hero-wide.jpg',
  '/kitchen/space-3.jpg',
  '/kitchen/space-1.jpg',
]
const ROTATE_MS = 11000

export default function KitchenHeaderBackdrop({
  className,
  /** Height of the band the scene occupies. */
  height = 'h-[380px]',
}: {
  className?: string
  height?: string
}) {
  const [slide, setSlide] = useState(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion) return
    const t = setInterval(() => setSlide((s) => (s + 1) % KITCHENS.length), ROTATE_MS)
    return () => clearInterval(t)
  }, [reduceMotion])

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-x-0 top-0 overflow-hidden -z-10',
        height,
        className,
      )}
    >
      <AnimatePresence>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          key={slide}
          src={KITCHENS[slide]}
          alt=""
          draggable={false}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: reduceMotion ? 1.04 : 1.1 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 1.6 },
            scale: { duration: ROTATE_MS / 1000 + 2, ease: 'linear' },
          }}
          className="absolute inset-0 h-full w-full object-cover blur-[5px] opacity-[0.55] saturate-[0.8] dark:opacity-[0.16] dark:blur-xl"
        />
      </AnimatePresence>
      {/* Cream wash: fully opaque by the bottom edge so the scene has resolved
          to page colour before any content sits on it. Lighter at the top than
          the old static treatment — the scene is meant to be seen now. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgb(var(--m-cream)/0.12) 0%, rgb(var(--m-cream)/0.5) 55%, hsl(var(--background)) 100%)',
        }}
      />
    </div>
  )
}
