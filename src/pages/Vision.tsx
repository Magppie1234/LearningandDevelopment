'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  VISION_MISSION,
  VISION_FOUNDER,
  VISION_TIMELINE,
  VISION_WHY_STONE,
  VISION_PROMISE,
  VISION_VIDEO,
} from '@/data/vision'

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
function MissionBeat() {
  return (
    <section
      className="min-h-[82vh] flex items-center justify-center px-6 sm:px-12"
      style={{ background: `linear-gradient(165deg, ${NAVY} 0%, ${NAVY_SOFT} 100%)` }}
    >
      <motion.div {...reveal} className="max-w-[880px] text-center py-24">
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
      className="px-6 sm:px-12 py-20 sm:py-28"
      style={{ background: `linear-gradient(165deg, ${NAVY_SOFT} 0%, ${NAVY} 100%)` }}
    >
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
      className="px-6 sm:px-12 py-20 sm:py-28"
      style={{ background: `linear-gradient(180deg, ${NAVY_SOFT} 0%, ${NAVY} 100%)` }}
    >
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
                </motion.div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────── Beat 4 — Why stone ─────────────────────── */
function WhyStoneBeat() {
  return (
    <section className="bg-parchment px-6 sm:px-12 py-20 sm:py-28">
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
    </section>
  )
}

/* ─────────────────────── Beat 5 — The promise ─────────────────────── */
function PromiseBeat() {
  return (
    <section
      className="min-h-[70vh] flex items-center px-6 sm:px-12"
      style={{ background: `linear-gradient(200deg, ${NAVY_SOFT} 0%, ${NAVY} 70%)` }}
    >
      <div className="max-w-[780px] mx-auto text-center py-24">
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

export default function Vision() {
  // Escape the portal shell's padding so beats run full-bleed.
  return (
    <div className="-m-4 sm:-m-8">
      <MissionBeat />
      <FounderBeat />
      <VideoBeat />
      <TimelineBeat />
      <WhyStoneBeat />
      <PromiseBeat />
    </div>
  )
}
