'use client'

import { useReducedMotion } from 'framer-motion'

/**
 * Vision Corner's backdrop: Magppie's own 3D kitchen visual, moving and
 * softened.
 *
 * The source is the brand's wide 3D render (1920x1080_3D_Visuals.png from
 * magppie.com), downloaded and self-hosted at /vision/kitchen-3d.jpg rather
 * than hotlinked, and re-encoded 3.1 MB PNG → 590 KB JPEG since it is
 * decoration behind a blur, not something anyone inspects at full fidelity.
 *
 * This replaced a hand-drawn isometric SVG. That version was genuinely 3D and
 * genuinely moving, but it was not Magppie's kitchen — the brief asks for
 * their imagery, the same as the rest of the portal, and a stylised drawing
 * reads as a different product than the photoreal render the brand actually
 * sells.
 *
 * WARM SOURCE, COOL PALETTE — the thing the brief said to check rather than
 * assume. The render is warm: cream marble, gold LED strips, wood slats. The
 * page is teal. Left alone those fight, so three things reconcile them:
 *
 *   1. `saturate(0.72)` pulls the warmth back without draining the image,
 *   2. the veil is teal rather than neutral white, so the midtones cool
 *      toward the palette instead of staying cream,
 *   3. the gold LED highlights are deliberately NOT neutralised — they are
 *      the same warm gold as the page's GOLD/GOLD_LIGHT accents, so the
 *      image ends up carrying both halves of the palette rather than only
 *      opposing one of them.
 *
 * The motion is a slow 3D push: `perspective` on the frame, a drifting
 * rotate/translate on the image inside it. Held still under
 * prefers-reduced-motion.
 */

export default function KitchenScene3D({
  /** Slight, per the brief — present, not a focal element. */
  blur = 3,
  /**
   * Teal-leaning veil. Cools the render's cream midtones toward the page
   * palette while leaving the warm highlights, and keeps the type readable.
   */
  veil = 'linear-gradient(180deg, rgba(178,214,208,0.70) 0%, rgba(132,186,178,0.60) 45%, rgba(190,222,216,0.74) 100%)',
}: {
  blur?: number
  veil?: string
}) {
  const reduceMotion = useReducedMotion()

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ perspective: '1600px', perspectiveOrigin: '50% 45%' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/vision/kitchen-3d.jpg"
          alt=""
          draggable={false}
          className={reduceMotion ? undefined : 'kitchen3d-drift'}
          style={{
            position: 'absolute',
            // Overscanned: a rotated plane pulls its own corners inward, and
            // blur samples past the edges. Without this you see the frame.
            inset: '-14%',
            width: '128%',
            height: '128%',
            objectFit: 'cover',
            filter: `blur(${blur}px) saturate(0.72)`,
            transform: reduceMotion ? 'rotateX(4deg) scale(1.06)' : undefined,
          }}
        />
      </div>

      <div className="absolute inset-0" style={{ background: veil }} />

      <style>{`
        @keyframes kitchen3dDrift {
          0%   { transform: rotateX(3deg)  rotateY(-3deg) translate3d(0,0,0)        scale(1.04); }
          50%  { transform: rotateX(6deg)  rotateY(3deg)  translate3d(-1.5%,1%,60px) scale(1.10); }
          100% { transform: rotateX(3deg)  rotateY(-3deg) translate3d(0,0,0)        scale(1.04); }
        }
        .kitchen3d-drift {
          animation: kitchen3dDrift 54s ease-in-out infinite;
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .kitchen3d-drift { animation: none; }
        }
      `}</style>
    </div>
  )
}
