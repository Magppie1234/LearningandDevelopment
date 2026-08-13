'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  VISION_MISSION,
  VISION_FOUNDER,
  VISION_TIMELINE,
  VISION_WHY_STONE,
  VISION_PROMISE,
  VISION_VIDEO,
  VISION_LEADERSHIP,
  VISION_GLOBAL_PRESENCE,
  VISION_AWARD_CITATION,
  VISION_CORNER,
  VISION_HERO_VIDEO,
} from '@/data/vision'
import { ExternalLink, MapPin, Sparkles } from 'lucide-react'
import KitchenBackdrop from '@/components/KitchenBackdrop'

/**
 * Vision Corner — scroll-driven story section. Beats reveal progressively on
 * scroll (Framer Motion whileInView = IntersectionObserver under the hood),
 * mirroring magppie.com's scroll-triggered reveal pattern. Content lives in
 * src/data/vision.ts only.
 */

/**
 * Vision Corner's palette — white base, a teal range, two warm golds.
 *
 * Deliberately its own thing, separate from the warm-stone theme everywhere
 * else in the portal. Teal replaces the earlier pale green: it carries the
 * same wellness reading while sitting further from the sage used on
 * Onboarding, so the two pages no longer look like near-misses of each other.
 *
 * The range runs deep (TEAL_DEEP, dark grounds) → mid (TEAL, fills and seams)
 * → pale (NAVY_SOFT, the tint white gradients into). Two golds, because one
 * cannot serve both ends: GOLD is darkened for small text on white (lighter
 * golds fall under 4.5:1), GOLD_LIGHT is the warm gold that reads on a dark
 * teal ground (~7:1 on TEAL_DEEP). Both are used page-wide, not scoped to one
 * beat.
 *
 * The constant NAMES NAVY / NAVY_SOFT are unchanged from the original navy
 * treatment on purpose: they are referenced ~40 times across nine beats, and a
 * palette-only change should not touch a single line of layout.
 */
const NAVY = '#FFFFFF'
const NAVY_SOFT = '#BCD8D3'
// Dark enough for 11px text on white — lighter golds fall under 4.5:1.
const GOLD = '#7E6318'
/** The warm gold for dark teal grounds, where GOLD disappears. */
const GOLD_LIGHT = '#E3C275'
/** Mid teal — fills and seams only, never small text. */
const TEAL = '#8FC7C0'
/**
 * Teal dark enough for 11px text over the *scene*, not just over white.
 * #155E56 cleared white easily but fell to 4.16:1 on the lighter teal bands
 * once the backdrop was turned up — measured, not assumed. This clears 4.5
 * across the whole range the scrimmed ground actually spans (5.13:1 at its
 * darkest, 9.37:1 on white).
 */
const TEAL_INK = '#124F49'
const INK = '#2A2320'

/**
 * Backdrop rotation for this page: Magppie's own wide 3D hero visual first —
 * the asset the brief names as the best starting point — then real installed
 * kitchens from the Wellness Spaces gallery. All self-hosted; none hotlinked.
 */
const VISION_BACKDROP = [
  '/vision/kitchen-3d.jpg',
  '/kitchen/space-1.jpg',
  '/kitchen/space-3.jpg',
  '/login/kitchen-01.jpg',
] as const

/**
 * A seam between beats, in the page's teal and both golds. A nine-beat scroll
 * needs an obvious edge where one section ends.
 */
function SectionBreak() {
  return (
    <div aria-hidden className="flex h-2 w-full">
      {[GOLD, TEAL, GOLD_LIGHT, NAVY_SOFT].map((c, i) => (
        <span key={i} className="flex-1" style={{ backgroundColor: c }} />
      ))}
    </div>
  )
}

const reveal = {
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.35 },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
}

/* ─────────────────────── Beat 1 — Mission ─────────────────────── */
/**
 * Opens on the Wellness Kitchen itself: the photograph slowly pushes in
 * behind the mission line (cinematic Ken Burns), veiled by the navy
 * gradient so the existing text stays exactly as it was.
 */
function MissionBeat() {
  return (
    <section className="relative min-h-[82vh] flex items-center justify-center px-6 sm:px-12 overflow-hidden">
      {/* No photograph of its own. This beat used to paint a full-bleed kitchen
          here, which sat directly on top of the page's moving 3D scene and hid
          it at exactly the point where someone first looks. The hero is now
          transparent so the scene reads through it; only a light veil remains,
          for the type. */}
      {/*
        A soft dark pool behind the copy only — the same job the white scrim
        did on the light treatment, inverted for a dark ground. It deepens
        where the words are and fades to nothing before the section edges, so
        the kitchens stay visible around the type rather than being veiled a
        second time.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div
          className="h-[80%] w-[min(1040px,96%)]"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(16,12,9,0.60) 0%, rgba(16,12,9,0.42) 45%, rgba(16,12,9,0.15) 70%, rgba(16,12,9,0) 86%)',
          }}
        />
      </div>
      <motion.div {...reveal} className="relative max-w-[880px] text-center py-24">
        {/* Warm gold, not TEAL_INK: on a dark teal ground the teal ink
            disappears into it, exactly as GOLD does on the deep beats. */}
        <p
          className="text-[11px] font-medium tracking-[0.35em] mb-8"
          style={{ color: GOLD_LIGHT }}
        >
          VISION CORNER
        </p>
        <h1 className="font-serif text-3xl sm:text-5xl leading-snug sm:leading-snug text-white">
          “{VISION_MISSION}”
        </h1>
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="mx-auto mt-10 h-px w-24 origin-center"
          style={{ backgroundColor: GOLD_LIGHT }}
        />
        <p className="mt-6 text-sm text-white/75">Scroll to read our story</p>
      </motion.div>
    </section>
  )
}

/* ─────────────────────── Beat 2 — Founder ─────────────────────── */
function FounderBeat() {
  const [photoOk, setPhotoOk] = useState(true)
  const [photoSrc, setPhotoSrc] = useState(VISION_FOUNDER.photo)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function handleUpload(file: File) {
    setUploading(true)
    setUploadError(null)
    try {
      const form = new FormData()
      form.append('photo', file)
      const res = await fetch('/api/admin/upload-founder-photo', {
        method: 'POST',
        body: form,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
      // Cache-bust so the fresh file shows immediately.
      setPhotoSrc(`${data.path}?v=${Date.now()}`)
      setPhotoOk(true)
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <section
      className="px-6 sm:px-12 py-20 sm:py-28"
      style={{ background: `linear-gradient(180deg, ${NAVY}e0 0%, ${NAVY_SOFT}f2 100%)` }}
    >
      <div className="max-w-[980px] mx-auto grid grid-cols-1 md:grid-cols-[minmax(260px,380px)_1fr] gap-10 items-center">
        <motion.div {...reveal}>
          {photoOk ? (
            // Full-quality photo, no filters — rounded corners only.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoSrc}
              alt={`${VISION_FOUNDER.name} — ${VISION_FOUNDER.title}`}
              onError={() => setPhotoOk(false)}
              className="w-full rounded-[12px] object-cover aspect-[9/10]"
            />
          ) : (
            <div
              className="w-full rounded-[12px] aspect-[9/10] flex flex-col items-center justify-center gap-5"
              style={{ backgroundColor: NAVY }}
            >
              <span className="font-serif text-6xl" style={{ color: GOLD }}>
                VJ
              </span>
              <label
                className={cn(
                  'cursor-pointer rounded-lg px-3.5 py-2 text-xs font-medium transition',
                  uploading ? 'opacity-60 cursor-wait' : 'hover:opacity-90',
                )}
                style={{ backgroundColor: GOLD, color: NAVY }}
              >
                {uploading ? 'Uploading…' : 'Upload founder photo'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleUpload(f)
                    e.target.value = ''
                  }}
                />
              </label>
              {uploadError && (
                <p className="px-6 text-center text-[11px] text-danger-fg">{uploadError}</p>
              )}
            </div>
          )}
        </motion.div>

        <motion.div
          {...reveal}
          transition={{ ...reveal.transition, delay: 0.15 }}
        >
          <h2 className="font-serif text-3xl sm:text-4xl text-ink-primary">
            {VISION_FOUNDER.name}
          </h2>
          <p className="mt-1 text-sm font-medium" style={{ color: GOLD }}>
            {VISION_FOUNDER.title}
          </p>
          <p className="mt-6 text-[15px] leading-relaxed text-ink-secondary">
            “{VISION_FOUNDER.note}”
          </p>
          {VISION_FOUNDER.noteIsPlaceholder && (
            <span className="mt-4 inline-block rounded-lg px-2 py-0.5 text-[11px] font-medium bg-accent-gold/15 text-ink-secondary">
              Draft copy — pending leadership review
            </span>
          )}
        </motion.div>
      </div>
    </section>
  )
}

/* ──────────── Beat 2.5 — Flagship film (video slot, §3) ────────────
   Slot + data model only: multi-language variants live in VISION_VIDEO
   (same shape as the BD module videos). Until a real file exists this
   renders a "film coming soon" state with the draft narration script
   visible — never an empty player, never filler footage. */
function VideoBeat() {
  const [scriptOpen, setScriptOpen] = useState(false)
  const hasVideo = VISION_VIDEO.variants.length > 0
  const [langCode, setLangCode] = useState(VISION_VIDEO.variants[0]?.languageCode ?? 'en')
  const active = VISION_VIDEO.variants.find((v) => v.languageCode === langCode)

  return (
    <section
      className="relative overflow-hidden px-6 sm:px-12 py-20 sm:py-28"
      style={{ background: `linear-gradient(165deg, ${NAVY_SOFT}f2 0%, ${NAVY}e0 100%)` }}
    >
      <StoneVeil />
      <motion.div {...reveal} className="max-w-[880px] mx-auto">
        <p className="text-[11px] font-medium tracking-[0.35em] mb-3 text-center" style={{ color: TEAL_INK }}>
          THE MAGPPIE FILM
        </p>
        <h2 className="font-serif text-2xl sm:text-4xl text-center text-[#2A2320] mb-10">
          {VISION_VIDEO.title}
        </h2>

        {hasVideo && active ? (
          <>
            <div className="aspect-video rounded-2xl overflow-hidden bg-black shadow-elevated">
              <video key={active.languageCode} controls className="w-full h-full" src={active.videoUrl}>
                {active.subtitleUrl && (
                  <track
                    kind="subtitles"
                    src={active.subtitleUrl}
                    srcLang={active.languageCode}
                    label={active.languageLabel}
                    default
                  />
                )}
              </video>
            </div>
            {VISION_VIDEO.variants.length > 1 && (
              <div className="mt-4 flex justify-center gap-1.5">
                {VISION_VIDEO.variants.map((v) => (
                  <button
                    key={v.languageCode}
                    type="button"
                    onClick={() => setLangCode(v.languageCode)}
                    className={cn(
                      'rounded-lg px-3 py-1 text-[12px] font-medium transition-colors',
                      v.languageCode === langCode
                        ? 'text-[#FFFFFF]'
                        : 'text-[#2A2320]/82 hover:text-[#2A2320]',
                    )}
                    style={v.languageCode === langCode ? { backgroundColor: GOLD } : undefined}
                  >
                    {v.languageLabel}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-[#2A2320]/15 overflow-hidden">
            <div className="aspect-video flex flex-col items-center justify-center gap-3 bg-black/25">
              <span
                className="w-14 h-14 rounded-full flex items-center justify-center border"
                style={{ borderColor: GOLD }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={GOLD} aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <p className="text-sm font-semibold text-[#2A2320]">Film coming soon</p>
              <p className="text-[13px] text-[#2A2320]/76">
                In production — how it started, and how it’s going
              </p>
            </div>
            <div className="border-t border-[#2A2320]/10 px-5 sm:px-8 py-5">
              <button
                type="button"
                onClick={() => setScriptOpen((s) => !s)}
                className="text-[12px] font-medium tracking-wide transition-opacity hover:opacity-80"
                style={{ color: GOLD }}
              >
                {scriptOpen ? 'Hide the narration script' : 'Read the narration script'}
              </button>
              {VISION_VIDEO.scriptIsDraft && (
                <span className="ml-3 inline-block rounded-full border border-[#2A2320]/25 px-2 py-0.5 text-[10px] tracking-wide text-[#2A2320]/76">
                  Draft copy — pending leadership review
                </span>
              )}
              {scriptOpen && (
                <p className="mt-4 text-[13.5px] leading-relaxed text-[#2A2320]/88 whitespace-pre-line">
                  {VISION_VIDEO.script}
                </p>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </section>
  )
}

/* ─────────────────────── Beat 3 — Timeline ─────────────────────── */
function TimelineBeat() {
  return (
    <section
      className="relative overflow-hidden px-6 sm:px-12 py-20 sm:py-28"
      style={{ background: `linear-gradient(180deg, ${NAVY_SOFT}f2 0%, ${NAVY}e0 100%)` }}
    >
      <StoneVeil />
      <motion.h2 {...reveal} className="text-center font-serif text-3xl sm:text-4xl text-[#2A2320]">
        Twenty-five years in the making
      </motion.h2>

      <div className="relative max-w-[760px] mx-auto mt-16">
        {/* Static track; the gold spine fills in per-milestone as each one
            scrolls into view — the site's progressive-slider pattern, driven
            purely by IntersectionObserver. */}
        <div className="absolute left-[19px] sm:left-1/2 top-0 bottom-0 w-px bg-white/15" />

        <div>
          {VISION_TIMELINE.map((m, i) => {
            const leftSide = i % 2 === 0
            // Perspective belongs on the PARENT of the rotating element. Put it
            // on the card itself and it applies to that card's children
            // instead, and the unfold collapses into a flat horizontal squash
            // with no depth at all.
            return (
              <div
                key={m.year}
                className={cn('relative', i > 0 && 'pt-16')}
                style={{ perspective: '1100px' }}
              >
                {/* Spine segment for this milestone */}
                <motion.div
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="absolute left-[19px] sm:left-1/2 top-0 bottom-0 w-px origin-top"
                  style={{ backgroundColor: GOLD }}
                />
                {/*
                  The history's 3D reveal — the one place in the portal where
                  depth is felt in the interaction rather than implied by a
                  backdrop. Process Flow and the Onboarding cards stay flat;
                  this is the scoped exception.

                  Each milestone UNFOLDS from the timeline spine: the hinge is
                  the card's spine-facing edge, so it swings open like a page
                  rather than sliding or fading. `perspective` on the wrapper
                  is what makes it read as real depth — without it the rotation
                  flattens into a horizontal squash. The two columns hinge on
                  opposite edges and rotate in opposite directions, so both
                  sides open away from the same centre line.
                */}
                <motion.div
                  initial={{ opacity: 0, rotateY: leftSide ? -72 : 72, y: 14 }}
                  whileInView={{ opacity: 1, rotateY: 0, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.85, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    transformStyle: 'preserve-3d',
                    transformOrigin: leftSide ? 'right center' : 'left center',
                    backfaceVisibility: 'hidden',
                  }}
                  className={cn(
                    'relative pl-12 sm:pl-0 sm:w-[calc(50%-32px)]',
                    leftSide ? 'sm:mr-auto sm:text-right' : 'sm:ml-auto',
                  )}
                >
                  {/* Gold marker on the spine */}
                  <span
                    className={cn(
                      'absolute top-1.5 w-3 h-3 rounded-full ring-4',
                      'left-[13.5px] sm:left-auto',
                      leftSide ? 'sm:-right-[38.5px]' : 'sm:-left-[38.5px]',
                    )}
                    style={{ backgroundColor: GOLD, ['--tw-ring-color' as never]: 'rgba(201,160,107,0.2)' }}
                  />
                  <p className="font-serif text-2xl" style={{ color: GOLD }}>
                    {m.year}
                  </p>
                  <p className="mt-1 text-[15px] font-semibold text-[#2A2320]">{m.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[#2A2320]/80">{m.detail}</p>
                  {/* §7: third-party citation on the KBIS award beat */}
                  {m.year === 'Feb 2026' && (
                    <a
                      href={VISION_AWARD_CITATION.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'mt-2 inline-flex items-center gap-1.5 text-[12px] underline-offset-2 hover:underline',
                        leftSide && 'sm:flex-row-reverse',
                      )}
                      style={{ color: GOLD }}
                    >
                      <ExternalLink size={11} className="shrink-0" />
                      <span>{VISION_AWARD_CITATION.label}</span>
                    </a>
                  )}
                </motion.div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/** Stone-finish film for the dark beats — the rose-marble sheet blended
 *  softly over the navy so nothing reads as a blank panel. Pointer-safe. */
function StoneVeil() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/marble-rose-photo.png"
        alt=""
        className="w-full h-full object-cover opacity-[0.08]"
        style={{ mixBlendMode: 'soft-light' }}
        draggable={false}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(1100px circle at 85% 10%, rgba(168,95,50,0.07), transparent 60%)',
        }}
      />
    </div>
  )
}

/** Light section ground — SilverStone rose-marble sheet under a white/pale-teal
 *  veil, so the light beats read as stone rather than a plain white frame. The
 *  veil was parchment when this page was warm-stone; it is cooled here so the
 *  teal/gold/white palette holds across every beat rather than breaking on the
 *  marble ones. The stone photograph itself stays — it is the brand's material
 *  story, not decoration. */
function MarbleSection({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('relative overflow-hidden px-6 sm:px-12 py-20 sm:py-28', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/marble-rose-photo.png"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(188,216,211,0.66) 50%, rgba(255,255,255,0.76) 100%)',
        }}
      />
      <div className="relative">{children}</div>
    </section>
  )
}

/* ─────────────────────── Beat 4 — Why stone ─────────────────────── */
function WhyStoneBeat() {
  return (
    <MarbleSection>
      <div className="max-w-[720px] mx-auto text-center">
        <motion.h2 {...reveal} className="font-serif text-3xl sm:text-4xl text-ink-primary">
          {VISION_WHY_STONE.heading}
        </motion.h2>
        <div className="mt-8 space-y-4">
          {VISION_WHY_STONE.lines.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.55, delay: i * 0.12 }}
              className={cn(
                'text-[15px] leading-relaxed',
                i === VISION_WHY_STONE.lines.length - 1
                  ? 'text-ink-primary font-medium'
                  : 'text-ink-secondary',
              )}
            >
              {line}
            </motion.p>
          ))}
        </div>
      </div>
    </MarbleSection>
  )
}

/* ─────────── Beat 4b — The kitchen, in depth (guided walkthrough) ─────────── */
/**
 * Guided product walkthrough over the Wellness Kitchen photo: numbered
 * hotspots on the actual parts of the product, stepped with prev/next or
 * tapped directly. Every stop restates approved training content (master
 * doc Q3/Q9/Q13/Q15/Q22/Q58 and the safety pillars) — nothing invented.
 * The mouse-tracked 3D tilt stays.
 */
const WALKTHROUGH_STOPS: {
  title: string
  body: string
  x: string
  y: string
}[] = [
  {
    title: 'Stone fascia — the front shutters',
    body: 'Every part is made from stone, inside and out — starting with the fascia, the front shutters you see and touch. Zero wood anywhere.',
    x: '30%',
    y: '64%',
  },
  {
    title: 'Stone backsplash — no grout lines',
    body: 'Unlike tiles, the SilverStone backsplash has no grout lines, so there is no accumulation of dirt, grease, or fungus behind the hob.',
    x: '20%',
    y: '44%',
  },
  {
    title: 'Food-grade countertop',
    body: 'SilverStone is a 100% food-grade stone — hygienic enough to eat directly on. Daily chopping and knife work won’t leave marks.',
    x: '66%',
    y: '58%',
  },
  {
    title: 'Cabinets, shelves and carcass — all stone',
    body: 'Stone cabinets, stone shelves, stone carcass. Drawers support up to 60 kg each, on patented hardware made in the same European facilities as Blum and Grass, load-rated beyond 100 kg.',
    x: '50%',
    y: '26%',
  },
  {
    title: 'In-built lighting',
    body: 'The in-built lights are strategically positioned so they are not exposed to water during cleaning, and carry their own 2-year guarantee.',
    x: '9%',
    y: '22%',
  },
]

function KitchenDepthBeat() {
  const ref = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const rotateY = useSpring(useTransform(mx, [0, 1], [-8, 8]), { stiffness: 150, damping: 20 })
  const rotateX = useSpring(useTransform(my, [0, 1], [6, -6]), { stiffness: 150, damping: 20 })
  const sheenX = useTransform(mx, [0, 1], ['20%', '80%'])

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    mx.set((e.clientX - r.left) / r.width)
    my.set((e.clientY - r.top) / r.height)
  }
  const onLeave = () => {
    mx.set(0.5)
    my.set(0.5)
  }

  const active = WALKTHROUGH_STOPS[step]

  return (
    <section className="relative overflow-hidden px-6 sm:px-12 py-20 sm:py-28" style={{ backgroundColor: NAVY }}>
      <StoneVeil />
      <div className="relative max-w-[860px] mx-auto">
        <motion.h2 {...reveal} className="text-center font-serif text-3xl sm:text-4xl text-[#2A2320]">
          The Wellness Kitchen, in depth
        </motion.h2>
        <motion.p {...reveal} className="mt-3 text-center text-[13.5px] text-[#2A2320]/76">
          A guided walkthrough of the product — tap the numbered points, or step through.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7 }}
          className="mt-10"
          style={{ perspective: 1100 }}
        >
          <motion.div
            ref={ref}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            className="relative rounded-3xl overflow-visible select-none"
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
          >
            <div className="rounded-3xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.45)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hero-magppie-kitchen.jpg"
                alt="Magppie Wellness Kitchen — SilverStone, zero wood"
                className="w-full aspect-[16/9] object-cover"
                draggable={false}
              />
              {/* moving sheen */}
              <motion.div
                className="absolute inset-0 pointer-events-none rounded-3xl"
                style={{
                  background: useTransform(
                    sheenX,
                    (v) =>
                      `radial-gradient(600px circle at ${v} 30%, rgba(42,35,32,0.08), transparent 60%)`,
                  ),
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none rounded-3xl"
                style={{ boxShadow: 'inset 0 0 80px rgba(0,0,0,0.35)' }}
              />
            </div>

            {/* numbered walkthrough hotspots, floating above the surface */}
            {WALKTHROUGH_STOPS.map((s, i) => {
              const isActive = i === step
              return (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => setStep(i)}
                  aria-label={`Walkthrough stop ${i + 1}: ${s.title}`}
                  className="absolute w-9 h-9 rounded-full font-serif text-[15px] flex items-center justify-center transition-all"
                  style={{
                    left: s.x,
                    top: s.y,
                    transform: `translateZ(${isActive ? 85 : 55}px)`,
                    color: isActive ? '#FFFFFF' : INK,
                    backgroundColor: isActive ? GOLD : 'rgba(255,255,255,0.9)',
                    border: `1.5px solid ${GOLD}`,
                    boxShadow: isActive ? `0 0 0 7px ${GOLD}30, 0 8px 24px rgba(0,0,0,0.5)` : '0 6px 18px rgba(0,0,0,0.45)',
                  }}
                >
                  {i + 1}
                </button>
              )
            })}
          </motion.div>
        </motion.div>

        {/* walkthrough detail card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-8 rounded-2xl px-6 sm:px-8 py-6 flex flex-col sm:flex-row sm:items-center gap-5"
          style={{ backgroundColor: 'rgba(42,35,32,0.035)', border: `1px solid ${GOLD}40` }}
        >
          <div className="flex-1">
            <p className="text-[11px] tracking-[0.3em] uppercase" style={{ color: TEAL_INK }}>
              Stop {step + 1} of {WALKTHROUGH_STOPS.length}
            </p>
            <p className="mt-2 font-serif text-xl text-[#2A2320]">{active.title}</p>
            <p className="mt-2 text-[14px] leading-relaxed text-[#2A2320]/85">{active.body}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setStep((s) => (s + WALKTHROUGH_STOPS.length - 1) % WALKTHROUGH_STOPS.length)}
              className="rounded-full px-5 py-2 text-[13px] font-semibold"
              style={{ border: `1px solid ${GOLD}70`, color: INK }}
            >
              ← Prev
            </button>
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) % WALKTHROUGH_STOPS.length)}
              className="rounded-full px-5 py-2 text-[13px] font-semibold"
              style={{ backgroundColor: GOLD, color: '#FFFFFF' }}
            >
              Next →
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────────────────── Beat 5 — The promise ─────────────────────── */
function PromiseBeat() {
  return (
    <section
      className="relative overflow-hidden min-h-[70vh] flex items-center px-6 sm:px-12"
      style={{ background: `linear-gradient(200deg, ${NAVY_SOFT}f2 0%, ${NAVY}e0 70%)` }}
    >
      <StoneVeil />
      <div className="relative max-w-[780px] mx-auto text-center py-24">
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif text-6xl sm:text-7xl"
          style={{ color: GOLD }}
        >
          {VISION_PROMISE.stat}
        </motion.p>
        <motion.h2 {...reveal} className="mt-4 font-serif text-2xl sm:text-3xl text-[#2A2320]">
          {VISION_PROMISE.heading}
        </motion.h2>
        <div className="mt-8 space-y-5">
          {VISION_PROMISE.lines.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.15 }}
              className={cn(
                'text-[15px] leading-relaxed',
                i === 0 ? 'text-[#2A2320]/88' : 'text-[#2A2320]',
              )}
            >
              {line}
            </motion.p>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────────── Beat 6 — Our Team (mirrors magppie.com's team page) ───────────── */

type TeamMember = { name: string; role: string; photo: string }

/**
 * Portraits render grayscale — the same black-and-white treatment as
 * magppie.com's own team section. It reads more premium than colour headshots
 * and keeps twelve different photo styles from fighting the copper accent.
 */
const BW = 'grayscale contrast-[1.05]'

/** Popup for a team member — kitchen visual behind, names + roles only. */
function LeaderModal({ person, onClose }: { person: TeamMember; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ backgroundColor: 'rgba(255,255,255,0.86)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${person.name} — ${person.role}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 26, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.97 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[440px] rounded-3xl overflow-hidden bg-white shadow-[0_40px_90px_rgba(0,0,0,0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={person.photo}
          alt={person.name}
          className={cn('w-full aspect-[4/5] object-cover object-top', BW)}
          draggable={false}
        />
        <div className="px-8 py-8 text-center">
          <p className="font-serif text-3xl text-[#2A2320]">{person.name}</p>
          <p className="mt-2 text-[13px] tracking-[0.18em] uppercase" style={{ color: TEAL_INK }}>
            {person.role}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-7 rounded-full px-6 py-2 text-[13px] font-semibold transition-colors hover:bg-[rgba(42,35,32,0.06)]"
            style={{ border: `1px solid ${GOLD}90`, color: INK }}
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function LeaderCard({
  person,
  index,
  onSelect,
}: {
  person: TeamMember
  index: number
  onSelect: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: 'spring', stiffness: 120, damping: 16, delay: (index % 4) * 0.06 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="group relative text-left rounded-2xl overflow-hidden bg-white border-[0.5px] border-[rgb(var(--rule)/0.14)] transition-shadow hover:shadow-elevated"
    >
      <span className="block overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={person.photo}
          alt={person.name}
          loading="lazy"
          className={cn(
            'w-full aspect-[4/5] object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]',
            BW,
          )}
          draggable={false}
        />
      </span>
      {/* copper baseline grows on hover — the one accent on the card */}
      <span
        aria-hidden
        className="block h-[3px] w-8 group-hover:w-full transition-all duration-500"
        style={{ backgroundColor: GOLD }}
      />
      <span className="block px-4 pt-3.5 pb-4">
        <span className="block font-serif text-[17px] font-bold leading-snug text-[#2A2320]">
          {person.name}
        </span>
        <span className="mt-1 block text-[12px] leading-snug text-[#2A2320]/74">
          {person.role}
        </span>
      </span>
    </motion.button>
  )
}

function LeadershipBeat() {
  const [selected, setSelected] = useState<TeamMember | null>(null)
  return (
    <MarbleSection>
      <div className="max-w-[980px] mx-auto">
        <motion.p
          {...reveal}
          className="text-center text-[11px] font-semibold tracking-[0.3em] uppercase"
          style={{ color: TEAL_INK }}
        >
          Our Team
        </motion.p>
        <motion.h2 {...reveal} className="mt-3 text-center font-serif text-3xl sm:text-4xl text-ink-primary">
          The people behind it
        </motion.h2>
        <motion.p {...reveal} className="mt-3 text-center text-[13px] text-ink-tertiary">
          Tap a card to meet them.
        </motion.p>
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {VISION_LEADERSHIP.map((p, i) => (
            <LeaderCard key={p.name} person={p} index={i} onSelect={() => setSelected(p)} />
          ))}
        </div>
      </div>
      <AnimatePresence>
        {selected && <LeaderModal person={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </MarbleSection>
  )
}

/* ───────────── Beat 2.6 — Vision Corner (founder reels) ─────────────
 *
 * The one beat that is deliberately LOUDER than the rest of Our Story. The
 * page elsewhere is white + pale green + gold; this section takes a deeper sea
 * green and a real photographed kitchen behind it, because a flat pale panel
 * was the actual complaint. Everything here is a step up in saturation and
 * visual density, on purpose — it is meant to be the part you remember.
 */

/**
 * The deep end of the page's teal range — markedly more saturated than the
 * pale TEAL used for fills. Same family, turned up.
 */
const SEA = '#1C6F66'
const SEA_DEEP = '#0E3A38'
/**
 * The page's GOLD (#7E6318) is darkened for 11px text on white and disappears
 * against deep teal, so the dark grounds use the page's second gold — ~7:1 on
 * SEA_DEEP.
 */
const GOLD_ON_SEA = GOLD_LIGHT

/**
 * The hero film, self-hosted and played in a normal <video> with subtitles.
 *
 * Currently the AI-narrated vision film (see VISION_HERO_VIDEO in
 * data/vision.ts for the sourcing and likeness rules). Deliberately NOT an
 * Instagram embed: the widget drags Instagram's own branding into the page,
 * which reads as bolted on rather than part of the portal.
 *
 * If the file is missing (fresh clone — the render is reproducible, not
 * vendored), `onError` plus a HEAD probe swap in a labelled placeholder with
 * the regeneration command, so the page degrades to an honest empty state
 * rather than a dead player.
 */
function HeroVideo() {
  const [failed, setFailed] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  /**
   * React's onError on <video> is not reliable for media errors: the error
   * event fires on the element but does not bubble like a DOM error, so the
   * fallback below silently never rendered and the section showed a blank
   * rectangle. Two belts here — a native listener, and an explicit HEAD so a
   * 404 is caught even if no error event arrives at all.
   */
  useEffect(() => {
    let alive = true
    const el = videoRef.current
    const onErr = () => alive && setFailed(true)
    el?.addEventListener('error', onErr)
    // A missing file is the common case and is knowable without waiting.
    fetch(VISION_HERO_VIDEO.src, { method: 'HEAD' })
      .then((r) => {
        if (alive && !r.ok) setFailed(true)
      })
      .catch(() => alive && setFailed(true))
    // Catch an error that landed before the listener attached.
    if (el?.error) setFailed(true)
    return () => {
      alive = false
      el?.removeEventListener('error', onErr)
    }
  }, [])

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl"
      style={{
        aspectRatio: VISION_HERO_VIDEO.aspect,
        background: SEA_DEEP,
        border: `1px solid ${GOLD_ON_SEA}55`,
      }}
    >
      {!failed ? (
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src={VISION_HERO_VIDEO.src}
          poster={VISION_HERO_VIDEO.poster}
          controls
          playsInline
          preload="metadata"
          crossOrigin="anonymous"
          onError={() => setFailed(true)}
        >
          {VISION_HERO_VIDEO.subtitles && (
            <track
              kind="subtitles"
              srcLang="en"
              label="English"
              src={VISION_HERO_VIDEO.subtitles}
            />
          )}
        </video>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-7 text-center">
          <Sparkles size={26} style={{ color: GOLD_ON_SEA }} />
          <p className="text-sm font-medium text-white">Vision film not rendered yet</p>
          <p className="text-[12px] leading-relaxed" style={{ color: '#CBE4E1' }}>
            Run{' '}
            <code className="rounded px-1" style={{ background: 'rgba(255,255,255,0.12)' }}>
              node scripts/gen-vision-video.mjs
            </code>{' '}
            to render it — free neural narration, no API key needed. The output
            lands at{' '}
            <code className="rounded px-1" style={{ background: 'rgba(255,255,255,0.12)' }}>
              public{VISION_HERO_VIDEO.src}
            </code>
            .
          </p>
        </div>
      )}
    </div>
  )
}

function VisionCornerBeat() {
  return (
    <section className="relative overflow-hidden" style={{ background: SEA_DEEP }}>
      {/* Real kitchen photography, kept genuinely visible — flatness was the
          complaint, so this sits high and the gradient does only enough work
          to hold text contrast. */}
      <div aria-hidden className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/kitchen/space-1.jpg"
          alt=""
          className="h-full w-full object-cover"
          style={{ opacity: 0.42 }}
          draggable={false}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${SEA_DEEP}F2 0%, ${SEA}CC 42%, ${SEA_DEEP}F2 100%)`,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs uppercase tracking-[0.28em]" style={{ color: GOLD_ON_SEA }}>
            {VISION_CORNER.eyebrow}
          </p>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl text-white">
            {VISION_CORNER.heading}
          </h2>
          <p className="mt-2 text-base md:text-lg" style={{ color: '#D8EBE8' }}>
            {VISION_CORNER.lede}
          </p>
        </motion.div>

        {/* Video leads; the written anchor sits beside it so the section still
            lands for someone who will not press play. The film is 16/9, so it
            takes the wide column — the narrow reel column it replaced would
            letterbox a landscape render down to a strip. */}
        <div className="mt-10 grid gap-8 md:grid-cols-[1fr_minmax(0,340px)] md:items-start">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <HeroVideo />
          </motion.div>

          <div className="grid gap-4">
            {VISION_CORNER.summary.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-2xl p-5"
                style={{
                  background: 'rgba(255,255,255,0.09)',
                  border: `1px solid ${GOLD_ON_SEA}44`,
                }}
              >
                <p className="text-[11px] uppercase tracking-[0.16em]" style={{ color: GOLD_ON_SEA }}>
                  {s.label}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/90">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}


/* ───────────── Beat 7 — Global presence (§7) ───────────── */
function GlobalPresenceBeat() {
  return (
    <section
      className="px-6 sm:px-12 py-20 sm:py-28"
      style={{ background: `linear-gradient(180deg, ${NAVY}e0 0%, ${NAVY_SOFT}f2 100%)` }}
    >
      <div className="max-w-[820px] mx-auto">
        <motion.h2 {...reveal} className="text-center font-serif text-3xl sm:text-4xl text-[#2A2320]">
          Two continents, one standard
        </motion.h2>
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {VISION_GLOBAL_PRESENCE.map((g, i) => (
            <motion.div
              key={g.label}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-4 flex items-start gap-3"
            >
              <MapPin size={16} className="shrink-0 mt-0.5" style={{ color: GOLD }} />
              <div>
                <p className="text-[13.5px] font-semibold text-[#2A2320]">{g.label}</p>
                <p className="text-[12.5px] text-[#2A2320]/76">{g.place}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.p {...reveal} className="mt-8 text-center text-[12.5px] text-[#2A2320]/72">
          Retail stores across Delhi, Mohali, Mumbai, Surat and Florida are listed in the store
          directory.
        </motion.p>
      </div>
    </section>
  )
}

export default function Vision() {
  // Escape the portal shell's padding so beats run full-bleed.
  //
  // `story-legacy-surface` pins the shared surface tokens this page reads
  // (parchment, cream, page ground) to their pre-light-theme values, so the
  // light beats keep the exact colour the navy-and-copper beats were matched
  // against. The portal's warm-stone restyle stops at this page's edge.
  return (
    <div className="bleed story-legacy-surface relative">
      {/*
        A moving kitchen scene, blurred. Different treatment from Onboarding on
        purpose: there the kitchen is meant to be seen, here it is meant to be
        felt — blur plus a near-white veil keeps it as atmosphere behind dark
        ink on white rather than something competing with the story.
      */}
      {/*
        The same backdrop Onboarding runs — real Magppie kitchens crossfading
        with a slow parallax drift — but under a NEUTRAL dark veil, not a teal
        one. The photograph keeps its own browns and woods; teal and gold live
        on the content above it. Warm background under cool-toned content is
        the intended contrast rather than a clash to be corrected.

        Dark is what earlier attempts here were missing. A blurred photo, a
        hand-drawn isometric scene and the brand's 3D render all failed the
        same way — a light veil over a light page cannot show a photograph.

        z-0, NOT -z-10: the body paints an opaque cream ground, and a negative
        z-index puts this behind it.
      */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <KitchenBackdrop images={VISION_BACKDROP} veil="warmDim" parallax blur={2} />
      </div>
      <MissionBeat />
      <SectionBreak />
      <FounderBeat />
      <SectionBreak />
      <VideoBeat />
      {/* No SectionBreak either side: Vision Corner brings its own dark ground,
          and a pale seam against it would read as a gap rather than a join. */}
      <VisionCornerBeat />
      <TimelineBeat />
      <SectionBreak />
      <LeadershipBeat />
      <SectionBreak />
      <GlobalPresenceBeat />
      <SectionBreak />
      <WhyStoneBeat />
      <SectionBreak />
      <KitchenDepthBeat />
      <SectionBreak />
      <PromiseBeat />
    </div>
  )
}
