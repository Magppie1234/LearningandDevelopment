'use client'

import { useRef, useState } from 'react'
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
} from '@/data/vision'
import { ExternalLink, MapPin } from 'lucide-react'

/**
 * Vision Corner — scroll-driven story section. Beats reveal progressively on
 * scroll (Framer Motion whileInView = IntersectionObserver under the hood),
 * mirroring magppie.com's scroll-triggered reveal pattern. Content lives in
 * src/data/vision.ts only.
 */

const NAVY = '#062a33'
const NAVY_SOFT = '#0b3947'
// §4 copper/silver update: Vision accents move from gold to copper. These
// beats are permanently dark, so we use the dark-surface copper variant
// (#C88255, same as the dark-mode --m-accent-copper) for legibility on navy.
const GOLD = '#C88255'

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
      {/* slow push-in kitchen photograph */}
      <motion.img
        src="/hero-magppie-kitchen.jpg"
        alt="Magppie Wellness Kitchen"
        initial={{ scale: 1 }}
        animate={{ scale: 1.12 }}
        transition={{ duration: 28, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
      {/* navy veil for legibility */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(165deg, ${NAVY}e8 0%, ${NAVY_SOFT}cc 55%, ${NAVY}f2 100%)`,
        }}
      />
      <motion.div {...reveal} className="relative max-w-[880px] text-center py-24">
        <p
          className="text-[11px] font-medium tracking-[0.35em] mb-8"
          style={{ color: GOLD }}
        >
          VISION CORNER
        </p>
        <h1 className="font-serif text-3xl sm:text-5xl leading-snug sm:leading-snug text-[#f3ede2]">
          “{VISION_MISSION}”
        </h1>
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="mx-auto mt-10 h-px w-24 origin-center"
          style={{ backgroundColor: GOLD }}
        />
        <p className="mt-6 text-sm text-[#f3ede2]/60">Scroll to read our story</p>
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
    <section className="bg-cream px-6 sm:px-12 py-20 sm:py-28">
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
                <p className="px-6 text-center text-[11px] text-red-300">{uploadError}</p>
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
      style={{ background: `linear-gradient(165deg, ${NAVY_SOFT} 0%, ${NAVY} 100%)` }}
    >
      <StoneVeil />
      <motion.div {...reveal} className="max-w-[880px] mx-auto">
        <p className="text-[11px] font-medium tracking-[0.35em] mb-3 text-center" style={{ color: GOLD }}>
          THE MAGPPIE FILM
        </p>
        <h2 className="font-serif text-2xl sm:text-4xl text-center text-[#f3ede2] mb-10">
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
                        ? 'text-[#062a33]'
                        : 'text-[#f3ede2]/70 hover:text-[#f3ede2]',
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
          <div className="rounded-2xl border border-[#f3ede2]/15 overflow-hidden">
            <div className="aspect-video flex flex-col items-center justify-center gap-3 bg-black/25">
              <span
                className="w-14 h-14 rounded-full flex items-center justify-center border"
                style={{ borderColor: GOLD }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={GOLD} aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <p className="text-sm font-semibold text-[#f3ede2]">Film coming soon</p>
              <p className="text-[13px] text-[#f3ede2]/60">
                In production — how it started, and how it’s going
              </p>
            </div>
            <div className="border-t border-[#f3ede2]/10 px-5 sm:px-8 py-5">
              <button
                type="button"
                onClick={() => setScriptOpen((s) => !s)}
                className="text-[12px] font-medium tracking-wide transition-opacity hover:opacity-80"
                style={{ color: GOLD }}
              >
                {scriptOpen ? 'Hide the narration script' : 'Read the narration script'}
              </button>
              {VISION_VIDEO.scriptIsDraft && (
                <span className="ml-3 inline-block rounded-full border border-[#f3ede2]/25 px-2 py-0.5 text-[10px] tracking-wide text-[#f3ede2]/60">
                  Draft copy — pending leadership review
                </span>
              )}
              {scriptOpen && (
                <p className="mt-4 text-[13.5px] leading-relaxed text-[#f3ede2]/80 whitespace-pre-line">
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
      style={{ background: `linear-gradient(180deg, ${NAVY_SOFT} 0%, ${NAVY} 100%)` }}
    >
      <StoneVeil />
      <motion.h2 {...reveal} className="text-center font-serif text-3xl sm:text-4xl text-[#f3ede2]">
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
            return (
              <div key={m.year} className={cn('relative', i > 0 && 'pt-16')}>
                {/* Spine segment for this milestone */}
                <motion.div
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="absolute left-[19px] sm:left-1/2 top-0 bottom-0 w-px origin-top"
                  style={{ backgroundColor: GOLD }}
                />
                <motion.div
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
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
                  <p className="mt-1 text-[15px] font-semibold text-[#f3ede2]">{m.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[#f3ede2]/65">{m.detail}</p>
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
            'radial-gradient(1100px circle at 85% 10%, rgba(200,130,85,0.07), transparent 60%)',
        }}
      />
    </div>
  )
}

/** Light section ground — SilverStone rose-marble sheet under a parchment
 *  veil, so the light beats read as stone rather than a plain white frame. */
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
            'linear-gradient(180deg, rgba(247,242,234,0.88) 0%, rgba(247,242,234,0.8) 50%, rgba(247,242,234,0.92) 100%)',
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
        <motion.h2 {...reveal} className="text-center font-serif text-3xl sm:text-4xl text-[#f3ede2]">
          The Wellness Kitchen, in depth
        </motion.h2>
        <motion.p {...reveal} className="mt-3 text-center text-[13.5px] text-[#f3ede2]/60">
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
                      `radial-gradient(600px circle at ${v} 30%, rgba(243,237,226,0.14), transparent 60%)`,
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
                    color: isActive ? '#141414' : '#f3ede2',
                    backgroundColor: isActive ? GOLD : 'rgba(6,42,51,0.7)',
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
          style={{ backgroundColor: 'rgba(243,237,226,0.05)', border: `1px solid ${GOLD}40` }}
        >
          <div className="flex-1">
            <p className="text-[11px] tracking-[0.3em] uppercase" style={{ color: GOLD }}>
              Stop {step + 1} of {WALKTHROUGH_STOPS.length}
            </p>
            <p className="mt-2 font-serif text-xl text-[#f3ede2]">{active.title}</p>
            <p className="mt-2 text-[14px] leading-relaxed text-[#f3ede2]/75">{active.body}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setStep((s) => (s + WALKTHROUGH_STOPS.length - 1) % WALKTHROUGH_STOPS.length)}
              className="rounded-full px-5 py-2 text-[13px] font-semibold"
              style={{ border: `1px solid ${GOLD}70`, color: '#f3ede2' }}
            >
              ← Prev
            </button>
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) % WALKTHROUGH_STOPS.length)}
              className="rounded-full px-5 py-2 text-[13px] font-semibold"
              style={{ backgroundColor: GOLD, color: '#141414' }}
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
      style={{ background: `linear-gradient(200deg, ${NAVY_SOFT} 0%, ${NAVY} 70%)` }}
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
        <motion.h2 {...reveal} className="mt-4 font-serif text-2xl sm:text-3xl text-[#f3ede2]">
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
                i === 0 ? 'text-[#f3ede2]/80' : 'text-[#f3ede2]',
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

/* ───────────── Beat 6 — Leadership (names + roles only, §7) ───────────── */
const initialsOf = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

/** Only the founder has an approved photo in the repo; everyone else gets a
 *  monogram medallion. Names + roles only, per the content rule. */
const LEADER_PHOTO: Record<string, string> = {
  'Vinod Jain': '/founder-vinod-jain.jpg',
}

/** Popup for a leader — kitchen visual behind, still names + roles only. */
function LeaderModal({
  person,
  onClose,
}: {
  person: { name: string; role: string }
  onClose: () => void
}) {
  const photo = LEADER_PHOTO[person.name]
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ backgroundColor: 'rgba(4,20,25,0.72)' }}
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
        className="relative w-full max-w-[440px] rounded-3xl overflow-hidden shadow-[0_40px_90px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* kitchen visual backdrop */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-magppie-kitchen.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(190deg, ${NAVY}d9 0%, ${NAVY}f5 78%)` }}
        />
        <div className="relative px-8 py-12 text-center">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
            className="mx-auto w-24 h-24 rounded-full p-[3px]"
            style={{ background: `conic-gradient(from 210deg, ${GOLD}, #f3ede2 40%, ${GOLD})` }}
          >
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo}
                alt={person.name}
                className="w-full h-full rounded-full object-cover"
                draggable={false}
              />
            ) : (
              <span
                className="w-full h-full rounded-full flex items-center justify-center font-serif text-2xl"
                style={{ color: GOLD, backgroundColor: 'rgba(6,42,51,0.92)' }}
              >
                {initialsOf(person.name)}
              </span>
            )}
          </motion.div>
          <p className="mt-6 font-serif text-3xl text-[#f3ede2]">{person.name}</p>
          <p className="mt-2 text-[13px] tracking-[0.18em] uppercase" style={{ color: GOLD }}>
            {person.role}
          </p>
          <p className="mt-6 text-[12.5px] text-[#f3ede2]/55">Magppie Group leadership</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-8 rounded-full px-6 py-2 text-[13px] font-semibold transition-colors hover:bg-[rgba(243,237,226,0.08)]"
            style={{ border: `1px solid ${GOLD}90`, color: '#f3ede2' }}
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
  featured,
  onSelect,
}: {
  person: { name: string; role: string }
  index: number
  featured?: boolean
  onSelect: () => void
}) {
  const photo = LEADER_PHOTO[person.name]
  // Same 3D pop as the kitchen walkthrough: the card tilts toward the
  // cursor and the medallion floats above the surface.
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const rotateY = useSpring(useTransform(mx, [0, 1], [-9, 9]), { stiffness: 180, damping: 18 })
  const rotateX = useSpring(useTransform(my, [0, 1], [7, -7]), { stiffness: 180, damping: 18 })
  const onMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width)
    my.set((e.clientY - r.top) / r.height)
  }
  const onLeave = () => {
    mx.set(0.5)
    my.set(0.5)
  }
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ type: 'spring', stiffness: 120, damping: 16, delay: (index % 4) * 0.07 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className={cn(
        'group relative text-center rounded-2xl border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream/85 transition-shadow hover:shadow-elevated',
        featured ? 'sm:col-span-2 px-6 py-7 flex items-center gap-6 text-left' : 'px-4 py-6',
      )}
    >
      {/* sheen sweep on hover (clipped to the card) */}
      <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <span
          className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:translate-x-[320%] transition-all duration-700"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(200,130,85,0.16), transparent)' }}
        />
      </span>
      {/* gold ring appears on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ boxShadow: `inset 0 0 0 1.5px ${GOLD}90` }}
      />
      <span
        className={cn(
          'rounded-full p-[2.5px] shrink-0 transition-transform duration-300 group-hover:scale-105',
          featured ? 'w-20 h-20' : 'mx-auto mb-3 block w-14 h-14',
        )}
        style={{
          background: `conic-gradient(from 210deg, ${GOLD}, rgba(0,59,70,0.2) 45%, ${GOLD})`,
          transform: 'translateZ(28px)',
        }}
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={person.name}
            className="w-full h-full rounded-full object-cover"
            draggable={false}
          />
        ) : (
          <span
            className="w-full h-full rounded-full flex items-center justify-center font-serif bg-parchment"
            style={{ color: '#0b3947', fontSize: featured ? 22 : 16 }}
          >
            {initialsOf(person.name)}
          </span>
        )}
      </span>
      <span className={featured ? '' : 'block'}>
        <p className={cn('font-semibold text-ink-primary', featured ? 'font-serif text-2xl' : 'text-[15px]')}>
          {person.name}
        </p>
        <p className={cn('text-ink-tertiary', featured ? 'mt-1 text-[13px] tracking-[0.14em] uppercase' : 'mt-0.5 text-[12.5px]')}>
          {person.role}
        </p>
        {featured && (
          <p className="mt-2 text-[12.5px] text-ink-secondary">Tap to meet the founder →</p>
        )}
      </span>
    </motion.button>
  )
}

function LeadershipBeat() {
  const [selected, setSelected] = useState<{ name: string; role: string } | null>(null)
  const founder = VISION_LEADERSHIP.find((p) => p.role === 'Founder')
  const rest = VISION_LEADERSHIP.filter((p) => p.role !== 'Founder')
  return (
    <MarbleSection>
      <div className="max-w-[860px] mx-auto">
        <motion.h2 {...reveal} className="text-center font-serif text-3xl sm:text-4xl text-ink-primary">
          The people behind it
        </motion.h2>
        <motion.p {...reveal} className="mt-3 text-center text-[13px] text-ink-tertiary">
          Tap a card to meet them.
        </motion.p>
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {founder && (
            <LeaderCard person={founder} index={0} featured onSelect={() => setSelected(founder)} />
          )}
          {rest.map((p, i) => (
            <LeaderCard key={p.name} person={p} index={i + 2} onSelect={() => setSelected(p)} />
          ))}
        </div>
      </div>
      <AnimatePresence>
        {selected && <LeaderModal person={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </MarbleSection>
  )
}

/* ───────────── Beat 7 — Global presence (§7) ───────────── */
function GlobalPresenceBeat() {
  return (
    <section
      className="px-6 sm:px-12 py-20 sm:py-28"
      style={{ background: `linear-gradient(180deg, ${NAVY} 0%, ${NAVY_SOFT} 100%)` }}
    >
      <div className="max-w-[820px] mx-auto">
        <motion.h2 {...reveal} className="text-center font-serif text-3xl sm:text-4xl text-[#f3ede2]">
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
                <p className="text-[13.5px] font-semibold text-[#f3ede2]">{g.label}</p>
                <p className="text-[12.5px] text-[#f3ede2]/60">{g.place}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.p {...reveal} className="mt-8 text-center text-[12.5px] text-[#f3ede2]/50">
          Retail stores across Delhi, Mohali, Mumbai, Surat and Florida are listed in the store
          directory.
        </motion.p>
      </div>
    </section>
  )
}

export default function Vision() {
  // Escape the portal shell's padding so beats run full-bleed.
  return (
    <div className="-m-4 sm:-m-8">
      <MissionBeat />
      <FounderBeat />
      <VideoBeat />
      <TimelineBeat />
      <LeadershipBeat />
      <GlobalPresenceBeat />
      <WhyStoneBeat />
      <KitchenDepthBeat />
      <PromiseBeat />
    </div>
  )
}
