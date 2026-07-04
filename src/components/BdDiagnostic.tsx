'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClipboardList, CheckCircle2, XCircle, X, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useBdDiagnostic,
  diagnosticQuestions,
  type DiagnosticModuleResult,
} from '@/lib/bd-diagnostic-store'

/**
 * New-joiner diagnostic UI (§2). Informational, never gating: the banner
 * invites a first-time BD joiner to a 10-question baseline (one question per
 * module), and the result is a per-module strong/focus breakdown — no
 * aggregate pass/fail, and module access is unaffected either way.
 */

const CARD = 'rounded-[12px] border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream'

/* ── per-module breakdown (shared by employee + manager views) ── */

export function DiagnosticBreakdown({
  results,
  compact = false,
}: {
  results: DiagnosticModuleResult[]
  compact?: boolean
}) {
  return (
    <div className={cn('space-y-1.5', compact && 'space-y-1')}>
      {results.map((r) => (
        <div key={r.moduleId} className="flex items-center gap-2.5">
          <span className="w-6 shrink-0 text-[11px] text-ink-tertiary tabular-nums">
            {String(r.moduleNumber).padStart(2, '0')}
          </span>
          <span
            className={cn(
              'flex-1 truncate',
              compact ? 'text-[12px]' : 'text-[12.5px]',
              r.correct ? 'text-ink-secondary' : 'text-ink-primary font-medium',
            )}
          >
            {r.moduleTitle}
          </span>
          <span
            className="shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
            style={{
              backgroundColor: r.correct ? 'var(--status-ontrack-bg)' : 'var(--status-risk-bg)',
              color: r.correct ? 'var(--status-ontrack-fg)' : 'var(--status-risk-fg)',
            }}
          >
            {r.correct ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
            {r.correct ? '1/1' : '0/1'}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ── manager view (Analytics page) ──
   Demo mode reads the same local store as the employee view; in live mode
   this panel would aggregate diagnostic rows per direct report. */

export function BdDiagnosticManagerPanel() {
  const status = useBdDiagnostic((s) => s.status)
  const results = useBdDiagnostic((s) => s.results)
  const takenAt = useBdDiagnostic((s) => s.takenAt)

  return (
    <div className={cn(CARD, 'p-5')}>
      <div className="flex items-center justify-between gap-3 mb-1">
        <p className="text-sm font-semibold text-ink-primary flex items-center gap-2">
          <ClipboardList size={16} /> New-joiner diagnostic — BD academy
        </p>
        {takenAt && (
          <span className="text-[11px] text-ink-tertiary">
            Taken {new Date(takenAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        )}
      </div>
      <p className="text-[12px] text-ink-tertiary mb-3.5">
        Baseline knowledge per module before starting the academy — informational, not a gate.
      </p>
      {status === 'completed' && results.length > 0 ? (
        <DiagnosticBreakdown results={results} compact />
      ) : (
        <p className="text-[12.5px] text-ink-tertiary italic">
          Not taken yet — the new joiner sees the diagnostic prompt on their first visit to the
          BD academy.
        </p>
      )}
    </div>
  )
}

/* ── the quiz flow ── */

function DiagnosticQuiz({ onDone }: { onDone: () => void }) {
  const questions = diagnosticQuestions()
  const complete = useBdDiagnostic((s) => s.complete)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const allAnswered = questions.every((q) => answers[q.id] !== undefined)

  return (
    <div className="space-y-4">
      <p className="text-[13px] text-ink-secondary">
        One question from each of the 10 modules. There's no pass mark — this just shows
        where you're starting strong and where to focus first.
      </p>
      {questions.map((q, qi) => (
        <div key={q.id} className={cn(CARD, 'p-4')}>
          <p className="text-[11px] font-medium text-ink-tertiary mb-1">
            Module {qi + 1} · {q.competency}
          </p>
          <p className="text-sm font-medium text-ink-primary">{q.question}</p>
          <div className="mt-2.5 space-y-1.5">
            {q.options.map((opt, oi) => {
              const chosen = answers[q.id] === oi
              return (
                <button
                  key={oi}
                  type="button"
                  onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                  className={cn(
                    'w-full text-left rounded-lg border px-3 py-2 text-[13px] transition-colors',
                    chosen
                      ? 'border-ink-primary bg-[rgba(0,59,70,0.04)]'
                      : 'border-[rgba(0,59,70,0.12)] hover:bg-[rgba(0,59,70,0.02)]',
                  )}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </div>
      ))}
      <button
        type="button"
        disabled={!allAnswered}
        onClick={() => {
          complete(answers)
          onDone()
        }}
        className="rounded-lg bg-ink-primary px-4 py-2.5 text-sm font-medium text-parchment disabled:opacity-40 hover:opacity-90 transition"
      >
        See my baseline
      </button>
    </div>
  )
}

/* ── modal pop-up + inline results, dropped into the BD academy list page ──
   Opening the BD academy for the first time (status not_taken) pops the
   diagnostic as a MODAL. Closing it dismisses (a slim inline link remains to
   reopen); completing it swaps to the inline results card. Never gates. */

function DiagnosticModal({ onClose }: { onClose: () => void }) {
  const [started, setStarted] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[560px] max-h-[85vh] flex flex-col rounded-2xl bg-parchment shadow-elevated overflow-hidden"
      >
        {/* header */}
        <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4 border-b-[0.5px] border-[rgba(0,59,70,0.1)]">
          <div className="flex items-center gap-3">
            <span
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--status-ontrack-bg)' }}
            >
              <ClipboardList size={19} style={{ color: 'var(--status-ontrack-fg)' }} />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink-primary">
                Welcome to Business Development — quick baseline first?
              </p>
              <p className="text-[12px] text-ink-tertiary mt-0.5">
                10 questions, one per module, ~5 minutes. No pass mark, nothing locked.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close diagnostic"
            className="shrink-0 text-ink-tertiary hover:text-ink-primary transition-colors mt-0.5"
          >
            <X size={17} />
          </button>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {!started ? (
            <div className="space-y-4">
              <p className="text-[13px] text-ink-secondary leading-relaxed">
                Before you start the academy, this short diagnostic shows where you're
                already strong and which modules to focus on first. Your manager sees the
                same per-module view — it's informational, never a gate, and you can skip
                it and dive straight into the modules.
              </p>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setStarted(true)}
                  className="rounded-lg bg-ink-primary px-4 py-2.5 text-[13px] font-medium text-parchment hover:opacity-90 transition"
                >
                  Start diagnostic
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-[rgba(0,59,70,0.15)] px-4 py-2.5 text-[13px] font-medium text-ink-secondary hover:bg-black/[0.03] transition"
                >
                  Maybe later
                </button>
              </div>
            </div>
          ) : (
            <DiagnosticQuiz onDone={onClose} />
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function BdDiagnosticBanner() {
  const status = useBdDiagnostic((s) => s.status)
  const results = useBdDiagnostic((s) => s.results)
  const dismiss = useBdDiagnostic((s) => s.dismiss)
  const reopen = useBdDiagnostic((s) => s.reopen)
  // Local override so "Maybe later" closes instantly even before persist flushes.
  const [closedThisView, setClosedThisView] = useState(false)

  const close = () => {
    setClosedThisView(true)
    // Completing sets status to 'completed'; only mark dismissed if still untaken.
    if (useBdDiagnostic.getState().status === 'not_taken') dismiss()
  }

  if (status === 'completed') {
    const strong = results.filter((r) => r.correct).length
    return (
      <div className={cn(CARD, 'p-5')}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ClipboardList size={18} className="text-ink-tertiary" />
            <div>
              <p className="text-sm font-semibold text-ink-primary">
                Your baseline — starting strong in {strong} of {results.length} areas
              </p>
              <p className="text-[12px] text-ink-tertiary mt-0.5">
                Informational only — every module stays open. Focus first on the flagged ones.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setClosedThisView(false)
              reopen()
            }}
            className="shrink-0 inline-flex items-center gap-1 text-[11px] font-medium rounded-full border border-[rgba(0,59,70,0.15)] px-2.5 py-1 hover:bg-black/[0.03] transition"
          >
            <RotateCcw size={11} /> Retake
          </button>
        </div>
        <div className="mt-3.5">
          <DiagnosticBreakdown results={results} />
        </div>
      </div>
    )
  }

  if (status === 'dismissed') {
    // Slim reopen affordance — the pop-up never nags again once skipped.
    return (
      <button
        type="button"
        onClick={() => {
          setClosedThisView(false)
          reopen()
        }}
        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-tertiary hover:text-ink-primary transition-colors"
      >
        <ClipboardList size={13} /> Take the 10-question baseline diagnostic
      </button>
    )
  }

  // not_taken — pop the modal on open
  return (
    <AnimatePresence>
      {!closedThisView && <DiagnosticModal onClose={close} />}
    </AnimatePresence>
  )
}
