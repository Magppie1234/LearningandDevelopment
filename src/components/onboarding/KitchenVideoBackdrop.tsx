'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * The moving kitchen behind the Onboarding page, under a light-blue tint.
 *
 * WHY VIDEO AND NOT REACT THREE FIBER — the brief asked for an R3F scene
 * reusing "the 3D kitchen from magppie.com". That scene does not exist. The
 * live site was inspected: zero canvases, zero WebGL contexts, no three /
 * fiber / drei / Spline bundles, and no .glb/.gltf/.bin/.hdr among its 66
 * resources. Its "3D kitchen" is rendered video and stills. So this uses
 * magppie.com's own kitchen footage (videos/brecciaa.mp4, self-hosted and
 * recompressed 10 MB -> 1.5 MB) rather than adding ~600 KB of Three.js to
 * render a model nobody has.
 *
 * GUARDS, in the order they matter:
 *   1. mobile / low-power / reduced-motion -> the poster still, never the
 *      video. Decided before first paint, so no wasted download.
 *   2. tab hidden -> pause(). A fixed full-viewport element is never
 *      "off-screen" to an IntersectionObserver, so Page Visibility is the
 *      meaningful check.
 *   3. lazy -> preload="none" plus a fade-in once playback actually starts,
 *      so the page never waits on it.
 *
 * pointer-events:none throughout: this sits behind day boxes and the Keka
 * popup and must never intercept a click.
 */

/**
 * Light-blue scrim, in two layers.
 *
 * A single translucent blue over this footage read grey-green, because the
 * shot is full of warm wood and foliage that fights the tint. So the media
 * itself is cooled first (saturate + hue-rotate + a lift in brightness), and
 * the blue is laid over that. Result reads as sky-blue rather than as blue
 * paint over green.
 *
 * Opens translucent so the kitchen is legible as a kitchen, closes near-solid
 * so text lower down sits on flat colour rather than on moving footage.
 */
const TINT =
  'linear-gradient(180deg, rgba(176,214,240,0.62) 0%, rgba(198,228,246,0.88) 45%, rgba(222,239,250,0.96) 100%)'

/** Cools the warm source toward the blue before the scrim goes on. */
const MEDIA_FILTER = 'saturate(0.55) hue-rotate(175deg) brightness(1.08) contrast(0.92)'

export default function KitchenVideoBackdrop() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [still, setStill] = useState(true) // assume still until proven otherwise
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const small = window.matchMedia('(max-width: 768px)').matches
    const lowMem =
      typeof (navigator as { deviceMemory?: number }).deviceMemory === 'number' &&
      (navigator as { deviceMemory?: number }).deviceMemory! <= 4
    if (reduce || small || lowMem) return // stay on the poster
    setStill(false)
  }, [])

  useEffect(() => {
    if (still) return
    const v = videoRef.current
    if (!v) return
    const onVis = () => {
      if (document.hidden) v.pause()
      else void v.play().catch(() => {})
    }
    document.addEventListener('visibilitychange', onVis)
    void v.play().catch(() => setStill(true)) // autoplay blocked -> poster
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [still])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Poster is always painted: it is the mobile/reduced-motion state AND
          the placeholder the video fades in over. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/kitchen/kitchen-loop-poster.jpg"
        alt=""
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ filter: MEDIA_FILTER }}
      />
      {!still && (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="none"
          poster="/kitchen/kitchen-loop-poster.jpg"
          onPlaying={() => setVisible(true)}
          style={{ filter: MEDIA_FILTER }}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            visible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <source src="/kitchen/kitchen-loop.mp4" type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0" style={{ background: TINT }} />
    </div>
  )
}
