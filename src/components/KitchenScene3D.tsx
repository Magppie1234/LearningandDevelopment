'use client'

import { useReducedMotion } from 'framer-motion'
import { KitchenSVG } from '@/components/KitchenCommandCenter'

/**
 * The isometric kitchen, used as a moving 3D backdrop.
 *
 * This exists because the previous Vision Corner backdrop was a blurred
 * photograph — atmospheric, but flat. The brief asked for a moving 3D kitchen
 * scene, and the repo already had one: the hand-authored flat-isometric SVG
 * that KitchenCommandCenter uses as its navigation hero. Reusing it beats both
 * a photo and a second scene drawn from scratch, so KitchenSVG is exported
 * from there rather than duplicated here.
 *
 * The depth is CSS, not WebGL: `perspective` on the frame plus a slow,
 * continuous rotate/translate on the scene inside it. That is the same
 * technique KitchenCommandCenter uses for its pointer tilt, driven by a
 * keyframe animation instead of the cursor, because a backdrop should move on
 * its own and must never react to a pointer aimed at the content above it.
 *
 * Re-skinnable: the scene's fills are CSS variables, so `palette` recolours it
 * without touching geometry. Vision Corner passes teal; the Warm Stone
 * defaults are what KitchenCommandCenter still renders.
 *
 * Honors prefers-reduced-motion by holding the scene still.
 */

/** Teal re-skin — the same range the Vision Corner page is built from. */
const TEAL_PALETTE: React.CSSProperties = {
  ['--stone-espresso' as never]: '14 58 56',
  ['--stone-charcoal' as never]: '20 74 70',
  ['--stone-ivory' as never]: '231 241 240',
  ['--stone-brass' as never]: '227 194 117',
  ['--m-accent-copper' as never]: '201 160 107',
  ['--kcc-floor-deep' as never]: '10 44 43',
  ['--kcc-island-hi' as never]: '46 111 102',
  ['--kcc-island-lo' as never]: '28 79 74',
  ['--kcc-counter-hi' as never]: '38 98 92',
  ['--kcc-counter-lo' as never]: '22 66 62',
}

export default function KitchenScene3D({
  palette = 'teal',
  /** Softens the scene so it stays behind the content rather than competing. */
  blur = 1.5,
  /**
   * Veil painted over the scene, so text above it stays readable. Tuned by
   * looking: heavier than this and the scene reads as a coloured wash with no
   * kitchen in it, which defeats the point of using a scene at all.
   */
  veil = 'linear-gradient(180deg, rgba(255,255,255,0.46) 0%, rgba(214,232,229,0.34) 45%, rgba(255,255,255,0.50) 100%)',
  opacity = 1,
}: {
  palette?: 'teal' | 'stone'
  blur?: number
  veil?: string
  opacity?: number
}) {
  const reduceMotion = useReducedMotion()

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/*
        The perspective lives on the frame; the child is what rotates inside
        it. Scaled well past the viewport because a rotated plane pulls its
        own corners inward — without the overscale you see the scene's edges.
      */}
      <div
        className="absolute inset-0"
        style={{
          perspective: '1400px',
          perspectiveOrigin: '50% 45%',
          filter: blur ? `blur(${blur}px)` : undefined,
          opacity,
        }}
      >
        <div
          className={reduceMotion ? undefined : 'kitchen3d-drift'}
          style={{
            position: 'absolute',
            inset: '-18%',
            transformStyle: 'preserve-3d',
            transform: reduceMotion
              ? 'rotateX(8deg) rotateY(-4deg) scale(1.12)'
              : undefined,
            ...(palette === 'teal' ? TEAL_PALETTE : {}),
          }}
        >
          <KitchenSVG />
        </div>
      </div>

      <div className="absolute inset-0" style={{ background: veil }} />

      {/*
        Keyframes are declared here rather than in globals so the component
        stays self-contained — it is the only thing that uses them.
      */}
      <style>{`
        @keyframes kitchen3dDrift {
          0%   { transform: rotateX(7deg)  rotateY(-6deg) translate3d(0,0,0)      scale(1.12); }
          50%  { transform: rotateX(10deg) rotateY(5deg)  translate3d(-2%,1%,40px) scale(1.16); }
          100% { transform: rotateX(7deg)  rotateY(-6deg) translate3d(0,0,0)      scale(1.12); }
        }
        .kitchen3d-drift {
          animation: kitchen3dDrift 46s ease-in-out infinite;
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .kitchen3d-drift { animation: none; }
        }
      `}</style>
    </div>
  )
}
