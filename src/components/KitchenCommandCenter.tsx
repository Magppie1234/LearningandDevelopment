'use client'

/**
 * Kitchen Command Center — the dashboard's primary navigation surface.
 *
 * A single hand-authored, stylized (flat-isometric) SVG kitchen, layered into
 * zone groups, that acts as the landing hero. Each real dashboard destination
 * maps onto a real kitchen element, so the scene reads as navigation, not
 * decoration. Deliberately CHEAP: no Three.js / WebGL / scene graph — the "3D"
 * is CSS `perspective` + a small pointer-driven tilt, and the art is one static
 * committed SVG themed entirely via CSS variables (the "Warm Stone" palette).
 *
 * Responsive: on a fine pointer (desktop) the scene is interactive with a
 * subtle tilt; on narrow/touch viewports it falls back to a decorative scene
 * banner + a tidy grid of the SAME links (same routes, same aria-labels),
 * because the overlaid hotspots can't lay out legibly at phone widths.
 */

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  GraduationCap,
  Compass,
  Award,
  Library,
  Route,
  Network,
} from 'lucide-react'

type Zone = {
  href: string
  label: string
  ariaLabel: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  /** Absolute placement over the SVG (percentages, desktop scene). */
  box: { left: string; top: string; width: string; height: string }
  align: 'center' | 'start'
  /** The island — the largest, closest zone; spans the mobile grid. */
  primary?: boolean
}

/* One source of truth for every zone → destination mapping. */
const ZONES: Zone[] = [
  {
    href: '/my-learning',
    label: 'Resume My Learning',
    ariaLabel: 'Go to My Learning and resume where you left off',
    icon: BookOpen,
    box: { left: '30%', top: '60%', width: '40%', height: '34%' },
    align: 'center',
    primary: true,
  },
  {
    href: '/academies',
    label: 'Academies',
    ariaLabel: 'Go to Academies',
    icon: GraduationCap,
    box: { left: '55%', top: '9%', width: '36%', height: '30%' },
    align: 'center',
  },
  {
    href: '/vision',
    label: 'Our Story',
    ariaLabel: 'Go to Our Story',
    icon: Compass,
    box: { left: '9%', top: '9%', width: '17%', height: '26%' },
    align: 'center',
  },
  {
    href: '/career',
    label: 'Career Path',
    ariaLabel: 'Go to Career Path',
    icon: Route,
    box: { left: '31%', top: '9%', width: '19%', height: '13%' },
    align: 'start',
  },
  {
    href: '/organization-flow',
    label: 'Organization Flow',
    ariaLabel: 'Go to Organization Flow',
    icon: Network,
    box: { left: '31%', top: '23%', width: '19%', height: '13%' },
    align: 'start',
  },
  {
    href: '/certifications',
    label: 'Certifications',
    ariaLabel: 'Go to Certifications',
    icon: Award,
    box: { left: '6%', top: '46%', width: '16%', height: '15%' },
    align: 'start',
  },
  {
    href: '/knowledge',
    label: 'Knowledge Center',
    ariaLabel: 'Go to Knowledge Center',
    icon: Library,
    box: { left: '22%', top: '46%', width: '16%', height: '15%' },
    align: 'start',
  },
]

/* Solid stone label plate — NO glass/backdrop-blur; legibility is baked in. */
function Plate({
  icon: Icon,
  label,
}: {
  icon: Zone['icon']
  label: string
}) {
  return (
    <span className="kcc-plate inline-flex items-center gap-2 rounded-full bg-stone-espresso px-3.5 py-2 text-stone-ivory shadow-[0_6px_20px_rgba(0,0,0,0.35)] ring-1 ring-inset ring-white/[0.06]">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-copper/90 text-stone-charcoal">
        <Icon size={14} />
      </span>
      <span className="text-[13px] font-semibold tracking-tight">{label}</span>
    </span>
  )
}

/* Desktop: an absolutely-positioned, keyboard-operable hotspot over the SVG. */
function Hotspot({ zone, index }: { zone: Zone; index: number }) {
  return (
    <Link
      href={zone.href}
      aria-label={zone.ariaLabel}
      // Staggered entrance delay (≈55ms between zones); disabled under
      // prefers-reduced-motion via CSS.
      style={{ ...zone.box, ['--kcc-delay' as string]: `${index * 55}ms` }}
      className={`kcc-hotspot group absolute flex flex-col ${
        zone.align === 'center' ? 'items-center text-center' : 'items-start text-left'
      } justify-end gap-2 rounded-2xl outline-none`}
    >
      <Plate icon={zone.icon} label={zone.label} />
    </Link>
  )
}

export default function KitchenCommandCenter() {
  const stageRef = useRef<HTMLDivElement>(null)

  // CSS-only "3D": a small pointer-driven tilt. No JS animation loop beyond one
  // rAF-throttled CSS-var write. Runs ONLY on a fine pointer (real mouse) with
  // motion allowed — never on touch or when the user prefers reduced motion.
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!fine.matches || reduce.matches) return

    let raf = 0
    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        stage.style.setProperty('--kcc-ry', `${(px * 6).toFixed(2)}deg`)
        stage.style.setProperty('--kcc-rx', `${(-py * 5).toFixed(2)}deg`)
      })
    }
    const reset = () => {
      cancelAnimationFrame(raf)
      stage.style.setProperty('--kcc-ry', '0deg')
      stage.style.setProperty('--kcc-rx', '0deg')
    }
    stage.addEventListener('pointermove', onMove)
    stage.addEventListener('pointerleave', reset)
    return () => {
      stage.removeEventListener('pointermove', onMove)
      stage.removeEventListener('pointerleave', reset)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section
      aria-label="Kitchen command center — choose where to go next"
      className="kcc-root relative w-full overflow-hidden rounded-2xl bg-stone-charcoal ring-1 ring-white/[0.06]"
    >
      {/* ── Desktop: interactive tilt scene with overlaid hotspots ── */}
      <div
        ref={stageRef}
        className="kcc-stage relative hidden w-full md:block"
        style={{ aspectRatio: '1200 / 620' }}
      >
        <KitchenSVG />
        <div className="absolute inset-0">
          {ZONES.map((zone, i) => (
            <Hotspot key={zone.href} zone={zone} index={i} />
          ))}
        </div>
      </div>

      {/* ── Mobile / touch fallback: decorative banner + grid of same links ── */}
      <div className="md:hidden">
        <div className="relative h-32 w-full overflow-hidden">
          <KitchenSVG />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-charcoal via-stone-charcoal/40 to-transparent" />
        </div>
        <div className="grid grid-cols-2 gap-2.5 p-3">
          {ZONES.map((zone) => (
            <Link
              key={zone.href}
              href={zone.href}
              aria-label={zone.ariaLabel}
              className={`kcc-tile flex items-center gap-2.5 rounded-xl bg-stone-espresso px-3.5 py-3 text-stone-ivory ring-1 ring-inset ring-white/[0.06] outline-none ${
                zone.primary ? 'col-span-2' : ''
              }`}
            >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent-copper/90 text-stone-charcoal">
                <zone.icon size={16} />
              </span>
              <span className="text-sm font-semibold tracking-tight">{zone.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────────────────────────
 * The scene. Stylized flat-isometric kitchen. Layered <g id> groups so the
 * palette can be re-skinned via CSS vars without touching geometry. Fills use
 * the Warm Stone tokens; gradients handle the warm window light + stone sheen.
 * ──────────────────────────────────────────────────────────────────────── */
function KitchenSVG() {
  return (
    <svg
      viewBox="0 0 1200 620"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      role="img"
      aria-label="A stylized Magppie kitchen: a window, a wall display, a run of cabinets, a counter with an open recipe book, and a central stone island."
    >
      <defs>
        <linearGradient id="kccWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgb(var(--stone-espresso))" />
          <stop offset="1" stopColor="rgb(var(--stone-charcoal))" />
        </linearGradient>
        <linearGradient id="kccFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgb(var(--stone-charcoal))" />
          <stop offset="1" stopColor="rgb(28 23 18)" />
        </linearGradient>
        <linearGradient id="kccLight" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="rgb(var(--stone-ivory))" />
          <stop offset="0.55" stopColor="rgb(var(--stone-brass))" />
          <stop offset="1" stopColor="rgb(var(--m-accent-copper))" />
        </linearGradient>
        <radialGradient id="kccGlow" cx="0.22" cy="0.28" r="0.6">
          <stop offset="0" stopColor="rgb(var(--stone-brass) / 0.35)" />
          <stop offset="1" stopColor="rgb(var(--stone-brass) / 0)" />
        </radialGradient>
        <linearGradient id="kccIslandTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgb(84 70 58)" />
          <stop offset="1" stopColor="rgb(61 49 40)" />
        </linearGradient>
        <linearGradient id="kccCounter" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgb(72 60 50)" />
          <stop offset="1" stopColor="rgb(52 42 34)" />
        </linearGradient>
      </defs>

      {/* Base surfaces */}
      <g id="room">
        <rect x="0" y="0" width="1200" height="330" fill="url(#kccWall)" />
        <rect x="0" y="330" width="1200" height="290" fill="url(#kccFloor)" />
        <rect x="0" y="0" width="1200" height="620" fill="url(#kccGlow)" />
      </g>

      {/* Window — warm dawn light + muntin cross → Our Story */}
      <g id="window">
        <rect x="108" y="54" width="216" height="172" rx="10" fill="rgb(28 23 18)" />
        <rect x="120" y="66" width="192" height="148" rx="6" fill="url(#kccLight)" />
        <rect x="210" y="66" width="12" height="148" fill="rgb(var(--stone-espresso))" />
        <rect x="120" y="134" width="192" height="12" fill="rgb(var(--stone-espresso))" />
        <rect x="104" y="50" width="224" height="180" rx="12" fill="none" stroke="rgb(var(--stone-brass) / 0.5)" strokeWidth="2" />
        {/* soft light beam onto the counter */}
        <path d="M120 214 L312 214 L392 300 L96 300 Z" fill="rgb(var(--stone-brass) / 0.08)" />
      </g>

      {/* Wall display panel → Career Path + Organization Flow */}
      <g id="wall-panel">
        <rect x="372" y="66" width="252" height="180" rx="10" fill="rgb(var(--stone-espresso))" stroke="rgb(var(--stone-brass) / 0.35)" strokeWidth="2" />
        {/* a simple 'pathway / org' node motif */}
        <g stroke="rgb(var(--m-accent-copper))" strokeWidth="2.5" fill="rgb(var(--stone-charcoal))">
          <line x1="420" y1="112" x2="576" y2="112" strokeDasharray="4 6" />
          <line x1="498" y1="112" x2="498" y2="196" strokeDasharray="4 6" />
          <line x1="420" y1="196" x2="576" y2="196" strokeDasharray="4 6" />
          <circle cx="420" cy="112" r="9" />
          <circle cx="576" cy="112" r="9" />
          <circle cx="498" cy="112" r="11" fill="rgb(var(--m-accent-copper))" />
          <circle cx="420" cy="196" r="9" />
          <circle cx="576" cy="196" r="9" />
        </g>
      </g>

      {/* Cabinet run → Academies */}
      <g id="cabinets">
        <rect x="660" y="60" width="432" height="196" rx="8" fill="rgb(var(--stone-charcoal))" />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect
              x={672 + i * 140}
              y={72}
              width={126}
              height={172}
              rx="7"
              fill="rgb(var(--stone-espresso))"
              stroke="rgb(var(--stone-brass) / 0.3)"
              strokeWidth="1.5"
            />
            {/* copper knob */}
            <circle cx={672 + i * 140 + 110} cy="158" r="5" fill="rgb(var(--m-accent-copper))" />
          </g>
        ))}
      </g>

      {/* Counter / base run behind the island */}
      <g id="counter">
        <rect x="60" y="300" width="1080" height="54" rx="6" fill="url(#kccCounter)" />
        <rect x="60" y="300" width="1080" height="10" rx="5" fill="rgb(96 80 66)" />
        <rect x="72" y="354" width="1056" height="70" fill="rgb(var(--stone-espresso))" />
      </g>

      {/* Open recipe book on the counter → Certifications + Knowledge */}
      <g id="recipe-book">
        <path d="M96 300 L300 300 L300 250 L200 268 L96 250 Z" fill="rgb(var(--stone-ivory))" />
        <path d="M200 268 L200 300" stroke="rgb(var(--stone-ink) / 0.25)" strokeWidth="2" />
        <g stroke="rgb(var(--stone-ink) / 0.18)" strokeWidth="2">
          <line x1="116" y1="270" x2="188" y2="278" />
          <line x1="116" y1="282" x2="188" y2="290" />
          <line x1="212" y1="278" x2="284" y2="270" />
          <line x1="212" y1="290" x2="284" y2="282" />
        </g>
      </g>

      {/* Kettle with steam — the single ambient detail */}
      <g id="kettle">
        <path d="M980 300 q0 -42 44 -42 q44 0 44 42 Z" fill="rgb(38 32 27)" />
        <rect x="1016" y="238" width="16" height="14" rx="3" fill="rgb(var(--stone-espresso))" />
        <path
          className="kcc-steam"
          d="M1024 236 q-10 -14 0 -28 q10 -14 0 -28"
          fill="none"
          stroke="rgb(var(--stone-ivory) / 0.5)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>

      {/* Island — foreground centre, largest, closest. Isometric slab. */}
      <g id="island">
        {/* front face */}
        <path d="M360 470 L840 470 L840 560 L360 560 Z" fill="rgb(var(--stone-espresso))" />
        {/* right side face for depth */}
        <path d="M840 470 L900 452 L900 540 L840 560 Z" fill="rgb(44 36 30)" />
        {/* stone top */}
        <path d="M360 470 L420 452 L900 452 L840 470 Z" fill="url(#kccIslandTop)" />
        {/* copper accent edge */}
        <path d="M360 470 L840 470" stroke="rgb(var(--m-accent-copper))" strokeWidth="3" />
        <path d="M840 470 L900 452" stroke="rgb(var(--m-accent-copper) / 0.6)" strokeWidth="3" />
        {/* subtle veining on the stone top */}
        <g stroke="rgb(var(--stone-ivory) / 0.10)" strokeWidth="2" fill="none">
          <path d="M470 462 q80 -8 160 2 t180 -2" />
          <path d="M520 466 q60 -4 120 0" />
        </g>
      </g>
    </svg>
  )
}
