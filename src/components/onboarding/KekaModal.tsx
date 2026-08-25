'use client'

import { useCallback, useEffect, useRef } from 'react'
import { X, Video } from 'lucide-react'
import { KEKA_VIDEOS, KEKA_FAQS, drivePreview } from '@/data/onboarding-days'

/**
 * The Keka reference popup — every Keka how-to video in one grid, reachable
 * any time from the Onboarding page.
 *
 * Videos are Drive `/preview` iframes rather than self-hosted files. That is a
 * hard constraint, not a preference: the source recordings run from 12 MB to
 * 840 MB and GitHub rejects any file over 100 MB, so the largest could never
 * live in the repo. Embedding also lets HR replace a recording in Drive
 * without a deploy.
 *
 * Accessibility: Escape closes, focus is trapped while open, focus returns to
 * the trigger on close, and the body is scroll-locked.
 */
export default function KekaModal({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const restoreTo = useRef<HTMLElement | null>(null)

  const trap = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || !ref.current) return
      const focusable = ref.current.querySelectorAll<HTMLElement>(
        'button, [href], iframe, input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    },
    [onClose],
  )

  useEffect(() => {
    restoreTo.current = document.activeElement as HTMLElement
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', trap)
    ref.current?.querySelector<HTMLElement>('button')?.focus()
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', trap)
      restoreTo.current?.focus?.()
    }
  }, [trap])

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-[rgba(28,23,18,0.55)] p-3 sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="keka-title"
        className="my-auto w-full max-w-[1000px] rounded-2xl border border-hairline/12 bg-parchment shadow-[0_30px_80px_rgba(30,42,54,0.3)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-hairline/10 px-5 py-4 sm:px-7">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent-copper">
              Everyday reference
            </p>
            <h2 id="keka-title" className="mt-1 font-serif text-2xl text-ink-primary">
              Keka — how to
            </h2>
            <p className="mt-1 text-[13px] text-ink-secondary">
              Attendance, leave and time-off, recorded by HR. Open this any time.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex-shrink-0 rounded-lg p-2 text-ink-tertiary transition-colors hover:bg-[rgb(var(--rule)/0.07)] hover:text-ink-primary"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-5 sm:px-7 sm:py-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {KEKA_VIDEOS.map((v) => (
              <div key={v.title} className="rounded-xl border border-hairline/12 bg-cream/50 p-3">
                <p className="mb-2 text-[13.5px] font-semibold text-ink-primary">{v.title}</p>
                {v.driveId ? (
                  <div className="overflow-hidden rounded-lg bg-black">
                    <iframe
                      src={drivePreview(v.driveId)}
                      title={v.title}
                      allow="autoplay"
                      allowFullScreen
                      className="aspect-video w-full border-0"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-hairline/25 bg-parchment text-center">
                    <Video size={20} className="text-ink-tertiary" aria-hidden />
                    <p className="text-[12.5px] font-medium text-ink-secondary">Coming soon</p>
                    {v.note && <p className="px-4 text-[11.5px] text-ink-tertiary">{v.note}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>

          <h3 className="mb-3 mt-7 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-tertiary">
            Common Keka questions
          </h3>
          <ul className="space-y-2">
            {KEKA_FAQS.map((f) => (
              <li key={f.q} className="rounded-xl border border-hairline/12 bg-cream/40 px-4 py-3">
                <p className="text-[13.5px] font-medium text-ink-primary">{f.q}</p>
                {f.a ? (
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-secondary">{f.a}</p>
                ) : (
                  <p className="mt-1 text-[12.5px] italic leading-relaxed text-ink-tertiary">
                    Approved answer not supplied yet.
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
