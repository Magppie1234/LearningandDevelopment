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
} as const

export default function KitchenBackdrop({ veil = 'light' }: { veil?: 'light' | 'dark' }) {
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
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 1.1 }, scale: { duration: 3.8, ease: 'linear' } }}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      </AnimatePresence>
      <div className="absolute inset-0" style={{ background: VEILS[veil] }} />
    </div>
  )
}
