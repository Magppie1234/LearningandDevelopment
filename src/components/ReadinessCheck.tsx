'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Compass, X, Sparkles, ArrowRight, Flag, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useReadiness } from '@/lib/readiness-store'
import {
  readinessBankFor,
  COMPETENCY_LABELS,
  type ReadinessBank,
} from '@/data/readiness-banks'

/**
 * Readiness Check — reusable, cross-academy confidence self-assessment.
 * The academy's question bank is passed in by slug (not hardcoded). Pops as a
 * modal on first entry, is always one-tap skippable (never gates content), and
 * ends on a warm "Growth Map" that deep-links focus areas to the exact lesson.
 */

const LIKERT_LABELS = ['Not yet', '', 'Getting there', '', 'Very confident']

function LikertRow({
  value,
  onChange,
}: {
  value: number | undefined
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="group flex flex-col items-center gap-1.5"
          aria-label={`Rate ${n} of 5`}
        >
          <span
            className={cn(
              'w-8 h-8 rounded-full border-[1.5px] transition-colors',
              value === n
                ? 'bg-accent-copper border-accent-copper'
                : 'border-[rgba(0,59,70,0.2)] group-hover:border-accent-copper',
            )}
          />
          <span className="text-[10px] text-ink-tertiary h-3">{LIKERT_LABELS[n - 1]}</span>
        </button>
      ))}
    </div>
  )
}

/* ── Growth Map results ── */

function GrowthMap({ bank, onClose }: { bank: ReadinessBank; onClose: () => void }) {
  const result = useReadiness((s) => s.get(bank.academySlug)).latest
  const reopen = useReadiness((s) => s.reopen)
  if (!result) return null

  return (
    <div className="space-y-5">
      <div>
        <p className="flex items-center gap-2 text-sm font-semibold text-ink-primary">
          <Sparkles size={16} className="text-accent-copper" /> Your Growth Map
        </p>
        <p className="text-[12.5px] text-ink-tertiary mt-0.5">
          A quick read on where you’re strong and where a little practice will help. Nothing here is
          a pass or fail — and every module stays open.
        </p>
      </div>

      {result.strengths.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary mb-2">
            You’re starting strong in
          </p>
          <div className="flex flex-wrap gap-1.5">
            {result.strengths.map((s) => (
              <span
                key={s.competencyTag}
                className="inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium border-[0.5px] border-accent-silver/60 bg-accent-silver/15 text-ink-secondary"
              >
                {COMPETENCY_LABELS[s.competencyTag] ?? s.competencyTag}
              </span>
            ))}
          </div>
        </div>
      )}

      {result.focus.length > 0 ? (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary mb-2">
            Where a bit of practice will help
          </p>
          <div className="space-y-2">
            {result.focus.map((f) => {
              const href =
                bank.lessonHrefBase && f.recommendedLesson
                  ? `${bank.lessonHrefBase}${f.recommendedLesson}`
                  : null
              return (
                <div
                  key={f.competencyTag}
                  className="rounded-[10px] border-[0.5px] border-accent-copper/30 bg-accent-copper/[0.05] p-3.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-medium bg-accent-copper text-parchment">
                      {COMPETENCY_LABELS[f.competencyTag] ?? f.competencyTag}
                    </span>
                    {f.managerFlag && (
                      <span className="inline-flex items-center gap-1 text-[10.5px] text-ink-tertiary">
                        <Flag size={10} /> shared with your manager
                      </span>
                    )}
                  </div>
                  <p className="text-[12.5px] text-ink-secondary mt-2">{f.lessonLabel}</p>
                  {href ? (
                    <Link
                      href={href}
                      onClick={onClose}
                      className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-medium text-accent-copper hover:underline"
                    >
                      Go to lesson <ArrowRight size={13} />
                    </Link>
                  ) : (
                    <p className="mt-2 text-[11.5px] text-ink-tertiary italic">
                      Lesson arrives with this academy’s content build.
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <p className="text-[12.5px] text-ink-secondary">
          Nicely balanced across the board — keep practising and revisit this check anytime.
        </p>
      )}

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-ink-primary px-4 py-2.5 text-[13px] font-medium text-parchment hover:opacity-90 transition"
        >
          Start learning
        </button>
        <button
          type="button"
          onClick={() => reopen(bank.academySlug)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(0,59,70,0.15)] px-4 py-2.5 text-[13px] font-medium text-ink-secondary hover:bg-black/[0.03] transition"
        >
          <RotateCcw size={13} /> Retake
        </button>
      </div>
    </div>
  )
}

/* ── The question flow ── */

function Questions({ bank, onDone }: { bank: ReadinessBank; onDone: () => void }) {
  const submit = useReadiness((s) => s.submit)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const answered = bank.questions.every((q) => answers[q.id] !== undefined)

  return (
    <div className="space-y-4">
      <p className="text-[13px] text-ink-secondary">
        A 60-second gut-check — there are no wrong answers. It just points you to the lesson worth
        practising first.
      </p>
      {bank.questions.map((q, i) => (
        <div key={q.id} className="rounded-[12px] border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream p-4">
          <p className="text-[11px] font-medium text-ink-tertiary mb-1">Question {i + 1}</p>
          <p className="text-sm font-medium text-ink-primary mb-3">{q.text}</p>
          {q.type === 'likert' ? (
            <LikertRow
              value={answers[q.id] ? Number(answers[q.id]) : undefined}
              onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: String(v) }))}
            />
          ) : (
            <div className="space-y-1.5">
              {q.options?.map((opt) => {
                const chosen = answers[q.id] === opt.label
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt.label }))}
                    className={cn(
                      'w-full text-left rounded-lg border px-3 py-2 text-[13px] transition-colors',
                      chosen
                        ? 'border-accent-copper bg-accent-copper/[0.06]'
                        : 'border-[rgba(0,59,70,0.12)] hover:bg-[rgba(0,59,70,0.02)]',
                    )}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      ))}
      <button
        type="button"
        disabled={!answered}
        onClick={() => {
          submit(bank.academySlug, answers)
          onDone()
        }}
        className="rounded-lg bg-ink-primary px-4 py-2.5 text-sm font-medium text-parchment disabled:opacity-40 hover:opacity-90 transition"
      >
        See my Growth Map
      </button>
    </div>
  )
}

/* ── Modal shell ── */

function Modal({ bank, onClose }: { bank: ReadinessBank; onClose: () => void }) {
  const status = useReadiness((s) => s.get(bank.academySlug)).status
  const [started, setStarted] = useState(false)
  const showResults = status === 'completed'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#062a33]/50 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[560px] max-h-[85vh] flex flex-col rounded-2xl bg-parchment shadow-elevated overflow-hidden border-t-2 border-accent-copper"
      >
        <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4 border-b-[0.5px] border-[rgba(0,59,70,0.1)]">
          <div className="flex items-center gap-3">
            <span
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'rgba(184,112,63,0.14)' }}
            >
              <Compass size={19} className="text-accent-copper" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink-primary">
                {bank.academyName} — readiness check
              </p>
              <p className="text-[12px] text-ink-tertiary mt-0.5">
                {showResults ? 'Your growth map' : '5 quick questions · skip anytime'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Skip readiness check"
            className="shrink-0 text-ink-tertiary hover:text-ink-primary transition-colors mt-0.5"
          >
            <X size={17} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {showResults ? (
            <GrowthMap bank={bank} onClose={onClose} />
          ) : !started ? (
            <div className="space-y-4">
              <p className="text-[13px] text-ink-secondary leading-relaxed">
                Before you dive in, a quick self-check on how confident you feel — no right or wrong
                answers. It points you to the lesson worth practising first, and you can skip
                straight to the modules anytime.
              </p>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setStarted(true)}
                  className="rounded-lg bg-ink-primary px-4 py-2.5 text-[13px] font-medium text-parchment hover:opacity-90 transition"
                >
                  Start check
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-[rgba(0,59,70,0.15)] px-4 py-2.5 text-[13px] font-medium text-ink-secondary hover:bg-black/[0.03] transition"
                >
                  Skip for now
                </button>
              </div>
            </div>
          ) : (
            <Questions bank={bank} onDone={() => setStarted(false)} />
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── Public: auto-pop on first entry + a persistent retake affordance ── */

export default function ReadinessCheck({ academySlug }: { academySlug: string }) {
  const bank = readinessBankFor(academySlug)
  const status = useReadiness((s) => s.get(academySlug)).status
  const dismiss = useReadiness((s) => s.dismiss)
  const reopen = useReadiness((s) => s.reopen)
  const [closedThisView, setClosedThisView] = useState(false)

  if (!bank) return null

  const close = () => {
    setClosedThisView(true)
    if (useReadiness.getState().get(academySlug).status === 'not_taken') dismiss(academySlug)
  }

  // Persistent "Readiness Check" button — always available to (re)take.
  const trigger = (
    <button
      type="button"
      onClick={() => {
        setClosedThisView(false)
        reopen(academySlug)
      }}
      className="inline-flex items-center gap-1.5 rounded-full border-[0.5px] border-accent-copper/50 px-3 py-1.5 text-[12px] font-medium text-accent-copper hover:bg-accent-copper/[0.06] transition-colors"
    >
      <Compass size={13} /> Readiness check
    </button>
  )

  // Auto-pop only while untaken; once completed/dismissed the trigger button
  // re-opens it (reopen() sets status back to not_taken). Never gates content.
  const shouldShow = status === 'not_taken' && !closedThisView

  return (
    <>
      {trigger}
      <AnimatePresence>{shouldShow && <Modal bank={bank} onClose={close} />}</AnimatePresence>
    </>
  )
}

/** Manager/L&D reporting: attempt count + latest focus areas for an academy. */
export function ReadinessAdminPanel({ academySlug }: { academySlug: string }) {
  const bank = readinessBankFor(academySlug)
  const state = useReadiness((s) => s.get(academySlug))
  if (!bank) return null
  return (
    <div className="rounded-[12px] border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream p-5">
      <p className="text-sm font-semibold text-ink-primary flex items-center gap-2">
        <Compass size={16} /> Readiness check — {bank.academyName}
      </p>
      <p className="text-[12px] text-ink-tertiary mt-0.5 mb-3">
        Team-wide self-assessment (demo: this learner). {state.attempts} attempt
        {state.attempts === 1 ? '' : 's'} recorded.
      </p>
      {state.latest && state.latest.focus.length > 0 ? (
        <div className="space-y-1.5">
          {state.latest.focus.map((f) => (
            <div key={f.competencyTag} className="flex items-center justify-between gap-2 text-[12.5px]">
              <span className="text-ink-secondary">{COMPETENCY_LABELS[f.competencyTag] ?? f.competencyTag}</span>
              <span className="inline-flex items-center gap-1 text-[11px]">
                {f.managerFlag && <Flag size={11} className="text-accent-copper" />}
                <span className="text-ink-tertiary">focus area</span>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[12.5px] text-ink-tertiary italic">No readiness check taken yet.</p>
      )}
    </div>
  )
}
