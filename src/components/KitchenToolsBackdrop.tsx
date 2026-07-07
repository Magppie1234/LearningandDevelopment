'use client'

import type { CSSProperties } from 'react'

/**
 * Decorative, site-wide floating kitchen tools. A fixed full-viewport layer of
 * faint line-art utensils that slowly drift, sitting behind the page content on
 * every screen. Purely ornamental (aria-hidden) and never interactive
 * (pointer-events-none), so it never blocks clicks. Theme-adaptive: brass on the
 * dark theme, dark stone-ink on light. Motion fully disabled under
 * prefers-reduced-motion (see .kitchen-float in globals.css).
 */

const TOOLS: { d: string; style: CSSProperties; size: number }[] = [
  // whisk
  {
    d: 'M20 4c-3 5-4 9-4 14m0 0c-2 0-4-1-5-3m5 3c2 0 4-1 5-3m-9-3c-1-3-1-6 0-8m8 8c1-2 1-5 0-8',
    style: { top: '8%', left: '6%', '--kf-dur': '15s', '--kf-delay': '0s', '--kf-rot': '-6deg' } as CSSProperties,
    size: 62,
  },
  // spoon
  {
    d: 'M12 3c3 0 5 2 5 5s-2 5-5 5m0 0v9m0-9c-3 0-5-2-5-5',
    style: { top: '5%', right: '10%', '--kf-dur': '18s', '--kf-delay': '1.4s', '--kf-rot': '12deg' } as CSSProperties,
    size: 66,
  },
  // chef knife
  {
    d: 'M3 15c6-1 12-4 17-9l1 1c-3 6-8 9-14 10zM3 15l-1 5',
    style: { top: '30%', left: '3%', '--kf-dur': '16s', '--kf-delay': '0.8s', '--kf-rot': '8deg' } as CSSProperties,
    size: 70,
  },
  // fork
  {
    d: 'M8 3v6a3 3 0 0 0 6 0V3M11 3v18M8 3v4m3-4v4m3-4v4',
    style: { top: '38%', right: '5%', '--kf-dur': '19s', '--kf-delay': '0.4s', '--kf-rot': '-8deg' } as CSSProperties,
    size: 60,
  },
  // pot
  {
    d: 'M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM2 10h2m16 0h2M8 6V4m8 2V4',
    style: { top: '58%', left: '8%', '--kf-dur': '20s', '--kf-delay': '2.2s', '--kf-rot': '-10deg' } as CSSProperties,
    size: 76,
  },
  // rolling pin
  {
    d: 'M6 10 18 10M6 14 18 14M4 12h2m12 0h2M2 12h.5m19 0h.5',
    style: { top: '66%', right: '9%', '--kf-dur': '17s', '--kf-delay': '1s', '--kf-rot': '4deg' } as CSSProperties,
    size: 58,
  },
  // spatula
  {
    d: 'M12 22V10m0 0a3 3 0 0 1-3-3V3h6v4a3 3 0 0 1-3 3z',
    style: { bottom: '6%', left: '14%', '--kf-dur': '21s', '--kf-delay': '0.6s', '--kf-rot': '10deg' } as CSSProperties,
    size: 56,
  },
  // ladle
  {
    d: 'M8 3v9a5 5 0 0 0 5 5h1a4 4 0 0 0 4-4',
    style: { bottom: '9%', right: '16%', '--kf-dur': '18.5s', '--kf-delay': '1.8s', '--kf-rot': '-5deg' } as CSSProperties,
    size: 60,
  },
  // mug
  {
    d: 'M5 8h11v7a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4zM16 10h2a2 2 0 0 1 0 4h-2',
    style: { top: '48%', right: '22%', '--kf-dur': '16.5s', '--kf-delay': '2.6s', '--kf-rot': '6deg' } as CSSProperties,
    size: 52,
  },
]

export default function KitchenToolsBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {TOOLS.map((t, i) => (
        <svg
          key={i}
          className="kitchen-float absolute text-stone-ink/[0.32] dark:text-stone-brass/[0.55]"
          style={t.style}
          width={t.size * 1.25}
          height={t.size * 1.25}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={t.d} />
        </svg>
      ))}
    </div>
  )
}
