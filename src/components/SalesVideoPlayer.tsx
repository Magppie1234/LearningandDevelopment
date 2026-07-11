'use client'

import { useMemo, useState } from 'react'
import { PlayCircle, Captions, Globe2, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthOptional } from '@/lib/auth'
import type { SalesModule } from '@/data/sales-academy'
import {
  salesVideoConfigForModule,
  SALES_VIDEO_NARRATION,
  DEFAULT_LANGUAGE_CODE,
} from '@/data/sales-media'

/**
 * Sales academy video module — same infrastructure as BdVideoPlayer: N
 * language variants, toggleable subtitles (never burned in), and a real
 * "coming soon" state that shows the approved narration script (the Colossyan
 * VO from docs/sales-academy-video-scripts.md) instead of an empty player.
 * Drop a rendered MP4 into public/assets/sales-academy/module-{n}/en.mp4 and
 * it plays with no code change. Videos exist for a module only once the file
 * is actually present — the <video> element falls back to the poster state on
 * a 404, so we probe nothing and rely on the same convention BD uses.
 */
export default function SalesVideoPlayer({ module }: { module: SalesModule }) {
  const config = salesVideoConfigForModule(module.id)
  const variants = config?.variants ?? []
  const narration = SALES_VIDEO_NARRATION[module.id] ?? null

  const auth = useAuthOptional()
  const preferredLanguage = auth?.user?.user_metadata?.preferred_language as string | undefined

  const [languageCode, setLanguageCode] = useState(
    variants.find((v) => v.languageCode === preferredLanguage)?.languageCode ??
      variants.find((v) => v.languageCode === DEFAULT_LANGUAGE_CODE)?.languageCode ??
      variants[0]?.languageCode ??
      DEFAULT_LANGUAGE_CODE,
  )
  const [subtitlesOn, setSubtitlesOn] = useState(true)
  // If the conventional asset path 404s (film not rendered/dropped yet),
  // fall back to the narration state rather than a broken player.
  const [videoMissing, setVideoMissing] = useState(false)

  const active = useMemo(
    () => variants.find((v) => v.languageCode === languageCode),
    [variants, languageCode],
  )

  if (variants.length === 0 || !active || videoMissing) {
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
            <Clock size={13} />
            {narration
              ? 'Script ready — video in production (Colossyan)'
              : 'Script pending source content'}
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
          onError={() => setVideoMissing(true)}
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
