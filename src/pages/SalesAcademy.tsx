'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  PauseCircle,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  SALES_MODULES,
  SALES_PASS_THRESHOLD,
  salesQuestionsForModule,
  salesHeldQuestionsForModule,
  salesQuizPassed,
  type SalesModule,
} from '@/data/sales-academy'
import { useSalesProgress } from '@/lib/sales-progress-store'
import { apiRecordAttempt } from '@/lib/learning-dashboard-client'
import { TimeTrackingProvider } from '@/components/learning/TimeTrackingProvider'
import LiveSessionClock from '@/components/learning/LiveSessionClock'
import { Block } from '@/pages/BdAcademy'

// Academy-scoped key for live time-tracking + attempts (real uuid via env).
const SALES_ACADEMY_ID = process.env.NEXT_PUBLIC_SALES_ACADEMY_ID ?? 'sales'

/* ───────────────── quiz ───────────────── */
function Quiz({ module, onDone }: { module: SalesModule; onDone: () => void }) {
  const questions = useMemo(() => salesQuestionsForModule(module.id), [module.id])
  const held = useMemo(() => salesHeldQuestionsForModule(module.id), [module.id])
  const recordAttempt = useSalesProgress((s) => s.recordAttempt)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)

  const allAnswered = questions.every((q) => answers[q.id] !== undefined)
  const correct = questions.filter((q) => answers[q.id] === q.correctIndex).length
  const passed = salesQuizPassed(correct, questions.length)

  function submit() {
    if (!allAnswered) return
    // Local demo store (always) …
    recordAttempt(module.id, correct, questions.length, passed)
    // … and the live Supabase attempt (real auth only): topic-tagged per
    // question so the insight engine computes weak/strong topics + trend.
    void apiRecordAttempt({
      academyId: SALES_ACADEMY_ID,
      moduleId: module.id,
      scorePct: Math.round((correct / questions.length) * 100),
      passed,
      questionBreakdown: questions.map((q) => ({
        question_id: q.id,
        topic_tag: q.topic,
        correct: answers[q.id] === q.correctIndex,
      })),
    })
    setSubmitted(true)
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-[12px] border-l-[3px] border-accent-gold bg-accent-gold/10 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">
          Quiz held — source pending
        </p>
        <p className="text-[15px] leading-relaxed text-ink-primary mt-1">
          This module&apos;s quiz questions are built but their answer keys are held until the
          pending source content / conflicts are resolved. Nothing is graded here yet.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {held.length > 0 && (
        <div className="rounded-[12px] border-l-[3px] border-accent-gold bg-accent-gold/10 px-4 py-3">
          <p className="text-[13px] text-ink-primary">
            <PauseCircle size={14} className="inline mr-1.5 -mt-0.5" />
            {held.length} question{held.length === 1 ? ' is' : 's are'} held pending an unresolved
            source conflict (e.g. [CONFIRM PAYMENT SPLIT]) and not graded.
          </p>
        </div>
      )}

      {questions.map((q, qi) => (
        <div key={q.id} className="rounded-[12px] border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream p-4">
          <p className="text-sm font-medium text-ink-primary">
            {qi + 1}. {q.question}
          </p>
          <div className="mt-3 space-y-2">
            {q.options.map((opt, oi) => {
              const chosen = answers[q.id] === oi
              const isCorrect = oi === q.correctIndex
              const showState = submitted && (chosen || isCorrect)
              return (
                <button
                  key={oi}
                  type="button"
                  disabled={submitted}
                  onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                  className={cn(
                    'w-full text-left rounded-lg border px-3 py-2 text-[13px] transition-colors flex items-center gap-2',
                    !showState && chosen && 'border-ink-primary bg-[rgba(0,59,70,0.04)]',
                    !showState && !chosen && 'border-[rgba(0,59,70,0.12)] hover:bg-[rgba(0,59,70,0.02)]',
                    showState && 'border-transparent',
                  )}
                  style={
                    showState && isCorrect
                      ? { backgroundColor: 'var(--status-ontrack-bg)', color: 'var(--status-ontrack-fg)' }
                      : showState && chosen && !isCorrect
                        ? { backgroundColor: 'var(--status-overdue-bg)', color: 'var(--status-overdue-fg)' }
                        : undefined
                  }
                >
                  {submitted && isCorrect && <CheckCircle2 size={14} className="shrink-0" />}
                  {submitted && chosen && !isCorrect && <XCircle size={14} className="shrink-0" />}
                  <span>{opt}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {!submitted ? (
        <button
          type="button"
          onClick={submit}
          disabled={!allAnswered}
          className="rounded-lg bg-ink-primary px-4 py-2.5 text-sm font-medium text-parchment disabled:opacity-40 hover:opacity-90 transition"
        >
          Submit quiz
        </button>
      ) : (
        <div
          className="rounded-[12px] p-4 flex items-center justify-between gap-4"
          style={{
            backgroundColor: passed ? 'var(--status-ontrack-bg)' : 'var(--status-overdue-bg)',
            color: passed ? 'var(--status-ontrack-fg)' : 'var(--status-overdue-fg)',
          }}
        >
          <div>
            <p className="text-sm font-semibold">
              {passed ? 'Passed — module complete' : 'Not passed yet'}
            </p>
            <p className="text-[13px] mt-0.5">
              {correct} of {questions.length} correct ({Math.round((correct / questions.length) * 100)}%).
              Pass mark is {Math.round(SALES_PASS_THRESHOLD * 100)}%.
            </p>
          </div>
          {passed ? (
            <button
              type="button"
              onClick={onDone}
              className="shrink-0 rounded-lg bg-ink-primary px-3.5 py-2 text-xs font-medium text-parchment"
            >
              Back to dashboard
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAnswers({})
                setSubmitted(false)
              }}
              className="shrink-0 rounded-lg bg-ink-primary px-3.5 py-2 text-xs font-medium text-parchment"
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/* ───────────────── module reader ───────────────── */
function ModuleView({
  module,
  onOpenModule,
}: {
  module: SalesModule
  onOpenModule: (id: string) => void
}) {
  const markViewed = useSalesProgress((s) => s.markViewed)
  const [tab, setTab] = useState<'read' | 'quiz'>('read')
  const gradeable = salesQuestionsForModule(module.id).length

  return (
    <TimeTrackingProvider
      academyId={SALES_ACADEMY_ID}
      moduleId={module.id}
      activityType="study"
      viewerRole="learner"
    >
      <div className="max-w-[760px] mx-auto">
        {/* breadcrumb + live session stopwatch */}
        <div className="flex items-center gap-3 mb-4">
          <Link
            href="/academy/sales/dashboard"
            aria-label="Back to the Sales dashboard"
            className="shrink-0 w-8 h-8 rounded-full border border-[rgba(0,59,70,0.15)] flex items-center justify-center text-ink-secondary hover:text-ink-primary hover:bg-black/[0.03] transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <nav aria-label="Breadcrumb" className="text-[12px] text-ink-tertiary truncate">
            <Link href="/academies" className="hover:text-ink-primary transition-colors">
              Academies
            </Link>
            <span className="mx-1.5">→</span>
            <Link href="/academy/sales/dashboard" className="hover:text-ink-primary transition-colors">
              Sales Academy
            </Link>
            <span className="mx-1.5">→</span>
            <span className="text-ink-primary font-medium">Module {module.number}</span>
          </nav>
          <div className="ml-auto shrink-0">
            <LiveSessionClock />
          </div>
        </div>

        <span className="text-[11px] font-medium text-ink-tertiary">Module {module.number}</span>
        <h1 className="font-serif text-3xl text-ink-primary">{module.title}</h1>
        <p className="text-sm text-ink-secondary mt-1">{module.summary}</p>

        {/* tabs */}
        <div className="mt-6 flex gap-1 border-b border-[rgba(0,59,70,0.1)]">
          {(['read', 'quiz'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                if (t === 'quiz') markViewed(module.id)
                setTab(t)
              }}
              className={cn(
                'px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors flex items-center gap-1.5',
                tab === t
                  ? 'border-ink-primary text-ink-primary'
                  : 'border-transparent text-ink-tertiary hover:text-ink-secondary',
              )}
            >
              {t === 'read' ? <BookOpen size={15} /> : <ClipboardCheck size={15} />}
              {t === 'read'
                ? 'Content'
                : gradeable > 0
                  ? `Quiz (${gradeable} questions)`
                  : 'Quiz (held)'}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === 'read' ? (
            <div className="space-y-3.5">
              {module.blocks.map((b, i) => (
                <Block key={i} block={b} />
              ))}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => {
                    markViewed(module.id)
                    setTab('quiz')
                  }}
                  className="rounded-lg bg-ink-primary px-4 py-2.5 text-sm font-medium text-parchment hover:opacity-90 transition"
                >
                  I’ve read this — take the quiz
                </button>
              </div>
            </div>
          ) : (
            <Quiz
              module={module}
              onDone={() => {
                window.location.href = '/academy/sales/dashboard'
              }}
            />
          )}
        </div>

        {/* prev / next */}
        {(() => {
          const idx = SALES_MODULES.findIndex((m) => m.id === module.id)
          const prev = idx > 0 ? SALES_MODULES[idx - 1] : null
          const next = idx < SALES_MODULES.length - 1 ? SALES_MODULES[idx + 1] : null
          return (
            <div className="mt-8 flex items-center justify-between gap-3 border-t border-[rgba(0,59,70,0.08)] pt-4">
              {prev ? (
                <button
                  type="button"
                  onClick={() => onOpenModule(prev.id)}
                  className="group inline-flex items-center gap-2 rounded-full border-[0.5px] border-[rgba(0,59,70,0.16)] pl-2.5 pr-3.5 py-1.5 text-[12px] text-ink-secondary hover:border-accent-copper hover:text-accent-copper transition-colors max-w-[46%]"
                  title={`Module ${prev.number}: ${prev.title}`}
                >
                  <ArrowLeft size={14} className="shrink-0" />
                  <span className="text-left leading-tight">
                    <span className="block text-[10px] uppercase tracking-wide text-ink-tertiary group-hover:text-accent-copper">
                      Previous
                    </span>
                    <span className="block truncate">Module {prev.number}</span>
                  </span>
                </button>
              ) : (
                <span />
              )}
              {next ? (
                <button
                  type="button"
                  onClick={() => onOpenModule(next.id)}
                  className="group inline-flex items-center gap-2 rounded-full border-[0.5px] border-[rgba(0,59,70,0.16)] pl-3.5 pr-2.5 py-1.5 text-[12px] text-ink-secondary hover:border-accent-copper hover:text-accent-copper transition-colors max-w-[46%]"
                  title={`Module ${next.number}: ${next.title}`}
                >
                  <span className="text-right leading-tight">
                    <span className="block text-[10px] uppercase tracking-wide text-ink-tertiary group-hover:text-accent-copper">
                      Next
                    </span>
                    <span className="block truncate">Module {next.number}</span>
                  </span>
                  <ArrowRight size={14} className="shrink-0" />
                </button>
              ) : (
                <span />
              )}
            </div>
          )
        })()}
      </div>
    </TimeTrackingProvider>
  )
}

/* ───────────────── page ───────────────── */
export default function SalesAcademy() {
  // Deep-link: /academy/sales/modules?module=sa-m4 opens that module directly.
  const searchParams = useSearchParams()
  const initialId = searchParams?.get('module') ?? null
  const [activeId, setActiveId] = useState<string | null>(
    initialId && SALES_MODULES.some((m) => m.id === initialId) ? initialId : null,
  )
  const results = useSalesProgress((s) => s.results)

  useEffect(() => {
    if (initialId && SALES_MODULES.some((m) => m.id === initialId)) setActiveId(initialId)
  }, [initialId])

  const active = SALES_MODULES.find((m) => m.id === activeId) ?? null
  if (active)
    return (
      <ModuleView
        module={active}
        onOpenModule={(id) => {
          setActiveId(id)
          window.scrollTo(0, 0)
        }}
      />
    )

  // No module selected — compact index (the dashboard is the primary entry).
  return (
    <div className="max-w-[760px] mx-auto space-y-6">
      <div>
        <Link
          href="/academy/sales/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-ink-tertiary hover:text-ink-primary transition-colors mb-3"
        >
          <ArrowLeft size={15} /> Sales dashboard
        </Link>
        <h1 className="font-serif text-3xl text-ink-primary">Sales Academy modules</h1>
        <p className="text-sm text-ink-secondary mt-1">
          Eleven modules from the vetted sales training. Pass each quiz at{' '}
          {Math.round(SALES_PASS_THRESHOLD * 100)}% to complete it.
        </p>
      </div>
      <div className="space-y-2">
        {SALES_MODULES.map((m) => {
          const r = results[m.id]
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setActiveId(m.id)}
              className="w-full text-left rounded-[12px] border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream p-4 hover:shadow-card transition-shadow flex items-center gap-3"
            >
              {r?.passed ? (
                <CheckCircle2 size={18} className="shrink-0" style={{ color: 'var(--status-ontrack)' }} />
              ) : (
                <Circle size={18} className="shrink-0 text-ink-tertiary/40" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] text-ink-tertiary">Module {m.number}</span>
                <span className="block text-sm font-medium text-ink-primary truncate">{m.title}</span>
              </span>
              {m.sourcePending && (
                <span className="shrink-0 rounded-lg bg-accent-gold/15 px-2 py-0.5 text-[11px] font-medium text-accent-gold">
                  source pending
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
