'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, ClipboardCheck, FileText, Video, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import KekaModal from '@/components/onboarding/KekaModal'
import {
  ONBOARDING_DAYS,
  onboardingAssessment,
  drivePreview,
  type OnboardingDay,
} from '@/data/onboarding-days'

/**
 * "Welcome to Magppie" — the first-three-days view.
 *
 * Three Day boxes across the top are the entry point; the content lives inside
 * them. Opening a day expands a panel below the row rather than navigating, so
 * the three boxes stay on screen as context and the back-and-forth of
 * day-hopping costs nothing.
 *
 * Keka sits apart from the days deliberately — it is not a day-one task but a
 * permanent everyday reference, so it gets its own card and opens as a popup
 * from anywhere on the page.
 */
export default function OnboardingWelcome() {
  const [openDay, setOpenDay] = useState<string | null>(null)
  const [kekaOpen, setKekaOpen] = useState(false)

  const active = ONBOARDING_DAYS.find((d) => d.id === openDay) ?? null

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl sm:text-4xl text-ink-primary">Welcome to Magppie</h1>
        <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-ink-secondary">
          Your first three days, in order. Each day has a short video, a document to read, and a
          check that it landed.
        </p>
      </header>

      {/* Day boxes */}
      <div className="grid gap-4 sm:grid-cols-3">
        {ONBOARDING_DAYS.map((d) => (
          <DayBox
            key={d.id}
            day={d}
            open={openDay === d.id}
            onClick={() => setOpenDay(openDay === d.id ? null : d.id)}
          />
        ))}
      </div>

      {active && <DayPanel day={active} onClose={() => setOpenDay(null)} />}

      {/* Keka — separate from the days, permanently available */}
      <section className="rounded-2xl border border-hairline/12 bg-parchment p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent-copper">
              Everyday reference
            </p>
            <h2 className="mt-1 font-serif text-xl text-ink-primary">Keka — the HR app</h2>
            <p className="mt-1 max-w-[54ch] text-[13.5px] leading-relaxed text-ink-secondary">
              Attendance, regularisation, leave and weekly-off, recorded by HR. Not a day-one task —
              come back to it whenever you need it.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setKekaOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-accent-copper px-5 py-2.5 text-[13.5px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            Open Keka guide <ArrowRight size={15} aria-hidden />
          </button>
        </div>
      </section>

      {kekaOpen && <KekaModal onClose={() => setKekaOpen(false)} />}
    </div>
  )
}

/** A marker chip showing what a day contains. */
function Marker({ icon: Icon, label, pending }: { icon: typeof Video; label: string; pending?: boolean }) {
  return (
    <span
      // Pending markers used to be dimmed to /70, which fell to 3.06:1 —
      // under AA. The "(soon)" word already carries the distinction, so the
      // colour does not need to (and shouldn't be the only signal anyway).
      className="inline-flex items-center gap-1.5 text-[11px] text-ink-tertiary"
    >
      <Icon size={12} aria-hidden />
      {label}
      {pending && <span className="text-[10px]">(soon)</span>}
    </span>
  )
}

function DayBox({ day, open, onClick }: { day: OnboardingDay; open: boolean; onClick: () => void }) {
  const assessment = onboardingAssessment(day.assessmentId)
  // A "done" tick would come from the quiz store once questions exist; with no
  // questions supplied there is nothing that can legitimately be marked passed.
  const done = false
  const bandInk = day.ink === 'light' ? '#FFFFFF' : '#26201B'
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      // Same construction as the checklist's phase cards: rounded-2xl, a 2px
      // border in the item's own colour, a filled header band, and FLAT —
      // no shadow, no gradient standing in for depth.
      className={cn(
        'flex h-full w-full flex-col overflow-hidden rounded-2xl border-2 bg-parchment text-left transition-transform',
        open ? 'translate-y-[-2px]' : 'hover:translate-y-[-2px]',
      )}
      style={{ borderColor: day.color }}
    >
      <span
        className="flex items-baseline gap-x-3 px-4 py-3"
        style={{ backgroundColor: day.color }}
      >
        <span className="font-serif text-2xl" style={{ color: bandInk }}>
          {day.day}
        </span>
        {done && (
          <span
            className="ml-auto grid h-5 w-5 place-items-center rounded-full"
            style={{ backgroundColor: 'rgb(255 255 255 / 0.85)' }}
            aria-label="Completed"
          >
            <Check size={12} style={{ color: day.color }} />
          </span>
        )}
      </span>

      <span className="flex flex-1 flex-col p-4">
        <span className="text-[15.5px] font-semibold leading-snug text-ink-primary">
          {day.title}
        </span>
        <span className="mt-1 text-[13px] leading-relaxed text-ink-secondary">{day.blurb}</span>
        <span className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-4">
          <Marker icon={Video} label="Video" pending={day.video.pending} />
          <Marker icon={FileText} label="Document" pending={day.doc.pending} />
          {assessment ? (
            <Marker icon={ClipboardCheck} label="Assessment" pending={assessment.questionsPending} />
          ) : (
            <Marker icon={ArrowRight} label="Role academy" />
          )}
        </span>
      </span>
    </button>
  )
}

/** Tidy placeholder used wherever an asset has not been supplied. */
function Pending({ label, note }: { label: string; note?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-hairline/25 bg-cream/40 px-6 py-10 text-center">
      <p className="text-[13px] font-medium text-ink-secondary">{label}</p>
      {note && <p className="max-w-[46ch] text-[12px] leading-relaxed text-ink-tertiary">{note}</p>}
    </div>
  )
}

function DayPanel({ day, onClose }: { day: OnboardingDay; onClose: () => void }) {
  const assessment = onboardingAssessment(day.assessmentId)
  return (
    <section className="rounded-2xl border-2 bg-parchment p-5 sm:p-7" style={{ borderColor: day.color }}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-[0.16em]"
            style={{ color: day.color }}
          >
            {day.day}
          </p>
          <h2 className="mt-1 font-serif text-2xl text-ink-primary">{day.title}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close day"
          className="rounded-lg p-2 text-ink-tertiary transition-colors hover:bg-[rgb(var(--rule)/0.07)] hover:text-ink-primary"
        >
          <X size={17} />
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-tertiary">
            Watch
          </h3>
          {day.video.pending ? (
            <Pending label={`${day.video.title} — coming soon`} note={day.video.note} />
          ) : day.video.driveId ? (
            <div className="overflow-hidden rounded-xl bg-black">
              <iframe
                src={drivePreview(day.video.driveId)}
                title={day.video.title}
                allow="autoplay"
                allowFullScreen
                className="aspect-video w-full border-0"
              />
            </div>
          ) : (
            <video controls className="aspect-video w-full rounded-xl bg-black" src={day.video.src} />
          )}
        </div>

        <div>
          <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-tertiary">
            Read
          </h3>
          {day.doc.pending ? (
            <Pending label={`${day.doc.title} — to be added`} note={day.doc.note} />
          ) : day.doc.href?.includes('drive.google.com') ? (
            <div className="overflow-hidden rounded-xl bg-black">
              <iframe
                src={day.doc.href}
                title={day.doc.title}
                allow="autoplay"
                allowFullScreen
                className="aspect-video w-full border-0"
              />
              {day.doc.note && (
                <p className="bg-cream/60 px-3 py-2 text-[11.5px] text-ink-tertiary">{day.doc.note}</p>
              )}
            </div>
          ) : (
            <a
              href={day.doc.href}
              className="flex items-center gap-3 rounded-xl border border-hairline/12 bg-cream/40 px-4 py-4 text-[13.5px] font-medium text-ink-primary hover:bg-cream"
            >
              <FileText size={16} className="text-accent-copper" aria-hidden />
              {day.doc.title}
            </a>
          )}
        </div>
      </div>

      <div className="mt-6 border-t border-hairline/10 pt-5">
        {assessment ? (
          assessment.questionsPending ? (
            <Pending
              label={`${assessment.title} — questions to be added`}
              note="Wired into the same scoring and certificate flow as the module quizzes. The certificate will lock on the first passing attempt once questions are supplied."
            />
          ) : (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-accent-copper px-5 py-2.5 text-[13.5px] font-semibold text-white"
            >
              Start {assessment.title} <ArrowRight size={15} aria-hidden />
            </button>
          )
        ) : day.action ? (
          <Link
            href={day.action.href}
            className="inline-flex items-center gap-2 rounded-full bg-accent-copper px-5 py-2.5 text-[13.5px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            {day.action.label} <ArrowRight size={15} aria-hidden />
          </Link>
        ) : null}
      </div>
    </section>
  )
}
