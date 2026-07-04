'use client'

import { useEffect, useMemo, useState } from 'react'
import { PlayCircle, Captions, Globe2, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth'
import type { BdModule } from '@/data/bd-academy'
import { videoConfigForModule, DEFAULT_LANGUAGE_CODE } from '@/data/bd-media'

/**
 * BD academy video module (§2). Supports N language variants (data model in
 * bd-media.ts) with a language selector + toggleable subtitle track — never
 * burned-in, so a learner can turn subtitles off. No filler video: if no
 * variant exists yet for a module, shows a clear "coming soon" state with
 * the module's approved summary as readable text, not an empty/broken player.
 */
export default function BdVideoPlayer({ module }: { module: BdModule }) {
  const config = videoConfigForModule(module.id)
  const variants = config?.variants ?? []

  // Default to the learner's profile language preference if their record has
  // one (optional user_metadata field — no schema change required); fall
  // back to English, then to whatever variant exists first.
  const { user } = useAuth()
  const preferredLanguage = user?.user_metadata?.preferred_language as string | undefined

  const [languageCode, setLanguageCode] = useState(
    variants.find((v) => v.languageCode === preferredLanguage)?.languageCode ??
      variants.find((v) => v.languageCode === DEFAULT_LANGUAGE_CODE)?.languageCode ??
      variants[0]?.languageCode ??
      DEFAULT_LANGUAGE_CODE,
  )
  const [subtitlesOn, setSubtitlesOn] = useState(true)

  // Section 5 wiring: pull the real narration script (and future video_url) from
  // the BD backend route, so the "coming soon" state shows the actual approved
  // narration instead of the module summary. Falls back silently if the API
  // isn't reachable (e.g. Supabase env unset) — the summary still renders.
  const [narration, setNarration] = useState<string | null>(null)
  useEffect(() => {
    let alive = true
    fetch(`/api/academies/bd/modules/${module.id}/video?lang=${languageCode}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d?.narration_script) setNarration(d.narration_script as string)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [module.id, languageCode])

  const active = useMemo(
    () => variants.find((v) => v.languageCode === languageCode),
    [variants, languageCode],
  )

  if (variants.length === 0 || !active) {
    return (
      <div className="rounded-[12px] border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream overflow-hidden">
        <div className="aspect-video flex flex-col items-center justify-center gap-3 bg-[rgba(0,59,70,0.03)]">
          <span
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--status-risk-bg)' }}
          >
            <PlayCircle size={22} style={{ color: 'var(--status-risk)' }} />
          </span>
          <p className="text-sm font-semibold text-ink-primary">Video coming soon</p>
          <p className="text-[13px] text-ink-tertiary flex items-center gap-1.5">
            <Clock size={13} /> Narrated video for this module is in production
          </p>
        </div>
        <div className="p-4 border-t-[0.5px] border-[rgba(0,59,70,0.1)]">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary mb-1.5">
            {narration ? 'In the meantime — read the narration script' : 'In the meantime — module summary'}
          </p>
          <p className="text-[13px] text-ink-secondary leading-relaxed whitespace-pre-line">
            {narration ?? module.summary}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-[12px] border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream overflow-hidden">
      <div className="aspect-video bg-black">
        <video
          key={`${module.id}-${active.languageCode}-${subtitlesOn}`}
          controls
          className="w-full h-full"
          src={active.videoUrl}
        >
          {active.subtitleUrl && subtitlesOn && (
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

      <div className="flex items-center justify-between gap-3 px-4 py-3 border-t-[0.5px] border-[rgba(0,59,70,0.1)]">
        <div className="flex items-center gap-2">
          <Globe2 size={14} className="text-ink-tertiary" />
          <div className="flex gap-1">
            {variants.map((v) => (
              <button
                key={v.languageCode}
                type="button"
                onClick={() => setLanguageCode(v.languageCode)}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-[12px] font-medium transition-colors',
                  v.languageCode === languageCode
                    ? 'bg-ink-primary text-parchment'
                    : 'bg-[rgba(0,59,70,0.05)] text-ink-secondary hover:bg-[rgba(0,59,70,0.09)]',
                )}
              >
                {v.languageLabel}
              </button>
            ))}
          </div>
        </div>

        {active.subtitleUrl && (
          <button
            type="button"
            onClick={() => setSubtitlesOn((s) => !s)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-medium transition-colors',
              subtitlesOn
                ? 'bg-[rgba(0,59,70,0.09)] text-ink-primary'
                : 'text-ink-tertiary hover:text-ink-secondary',
            )}
          >
            <Captions size={13} /> Subtitles {subtitlesOn ? 'on' : 'off'}
          </button>
        )}
      </div>
    </div>
  )
}
