'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Lock,
  BookOpen,
  ClipboardCheck,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  BD_MODULES,
  BD_PASS_THRESHOLD,
  bdQuestionsForModule,
  bdQuizPassed,
  type BdModule,
  type ContentBlock,
} from '@/data/bd-academy'
import { useBdProgress } from '@/lib/bd-progress-store'
import { useBdTitles, bdEffectiveTitle } from '@/lib/bd-title-store'
import { apiRecordAttempt } from '@/lib/learning-dashboard-client'
import { TimeTrackingProvider } from '@/components/learning/TimeTrackingProvider'
import LiveSessionClock from '@/components/learning/LiveSessionClock'
import { ProgressRing, statusFromProgress } from '@/components/AcademyProgressCard'
import BdVideoPlayer from '@/components/BdVideoPlayer'

// Academy-scoped key for live time-tracking + attempts (real academies.id uuid
// via env; slug fallback keeps the call well-formed in demo).
const BD_ACADEMY_ID = process.env.NEXT_PUBLIC_BD_ACADEMY_ID ?? 'business-development'
import BdModuleVisual, { bdModuleHasVisual, bdModuleVisualLabel } from '@/components/BdModuleVisuals'
import BdDiagnosticBanner from '@/components/BdDiagnostic'
import BdFaqAccordion, { bdModuleHasFaq } from '@/components/BdFaqAccordion'

const COMP_COLOR: Record<string, string> = {
  'Product Knowledge': 'var(--status-ontrack)',
  'Objection Handling': 'var(--status-risk)',
  'Pricing Knowledge': '#8c6ba8',
  'Customer Communication': '#4a7fb0',
  'Trust & Credibility': '#b0894a',
}

function CompetencyChip({ competency }: { competency: string }) {
  return (
    <span
      className="inline-block rounded-lg px-2 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: `${COMP_COLOR[competency]}22`, color: COMP_COLOR[competency] }}
    >
      {competency}
    </span>
  )
}

/* ───────────────── content block renderer ───────────────── */
export function Block({ block }: { block: ContentBlock }) {
  switch (block.kind) {
    case 'heading':
      return <h3 className="font-semibold text-ink-primary mt-5 mb-1">{block.text}</h3>
    case 'paragraph':
      return <p className="text-[15px] leading-relaxed text-ink-secondary">{block.text}</p>
    case 'list':
      return block.ordered ? (
        <ol className="list-decimal pl-5 space-y-1.5 text-[15px] text-ink-secondary marker:text-ink-tertiary">
          {block.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ol>
      ) : (
        <ul className="list-disc pl-5 space-y-1.5 text-[15px] text-ink-secondary marker:text-ink-tertiary">
          {block.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      )
    case 'callout':
      return (
        <div className="rounded-[12px] border-l-[3px] border-accent-gold bg-accent-gold/10 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">
            {block.label}
          </p>
          <p className="text-[15px] leading-relaxed text-ink-primary mt-1">{block.text}</p>
        </div>
      )
    case 'table':
      return (
        <div className="overflow-x-auto rounded-[12px] border-[0.5px] border-[rgba(0,59,70,0.14)]">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="bg-[rgba(0,59,70,0.03)]">
                {block.columns.map((c) => (
                  <th key={c} className="px-3 py-2 font-semibold text-ink-primary whitespace-nowrap">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((r, ri) => (
                <tr key={ri} className="border-t-[0.5px] border-[rgba(0,59,70,0.08)]">
                  {r.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 text-ink-secondary align-top">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
  }
}

/* ───────────────── quiz ───────────────── */
function Quiz({ module, onDone }: { module: BdModule; onDone: () => void }) {
  const questions = useMemo(() => bdQuestionsForModule(module.id), [module.id])
  const recordAttempt = useBdProgress((s) => s.recordAttempt)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)

  const allAnswered = questions.every((q) => answers[q.id] !== undefined)
  const correct = questions.filter((q) => answers[q.id] === q.correctIndex).length
  const passed = bdQuizPassed(correct, questions.length)

  function submit() {
    if (!allAnswered) return
    // Local demo store (always) …
    recordAttempt(module.id, correct, questions.length, passed)
    // … and the live Supabase attempt (real auth only): every question tagged
    // by competency so the insight engine computes weak/strong topics + trend.
    void apiRecordAttempt({
      academyId: BD_ACADEMY_ID,
      moduleId: module.id,
      scorePct: Math.round((correct / questions.length) * 100),
      passed,
      questionBreakdown: questions.map((q) => ({
        question_id: q.id,
        topic_tag: q.competency,
        correct: answers[q.id] === q.correctIndex,
      })),
    })
    setSubmitted(true)
  }

  return (
    <div className="space-y-6">
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
                    showState && isCorrect && 'border-transparent',
                    showState && chosen && !isCorrect && 'border-transparent',
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
              Pass mark is {Math.round(BD_PASS_THRESHOLD * 100)}%.
            </p>
          </div>
          {passed ? (
            <button type="button" onClick={onDone} className="shrink-0 rounded-lg bg-ink-primary px-3.5 py-2 text-xs font-medium text-parchment">
              Back to modules
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
  onBack,
  onOpenModule,
}: {
  module: BdModule
  onBack: () => void
  onOpenModule?: (id: string) => void
}) {
  const markViewed = useBdProgress((s) => s.markViewed)
  const overrides = useBdTitles((s) => s.overrides)
  const title = bdEffectiveTitle(overrides, module.id, module.title)
  const [tab, setTab] = useState<'read' | 'quiz'>('read')

  // Deep links like ?module=bd-m5#module-visual (dashboard "Explore visually",
  // §8) land before this SPA content exists — scroll to the anchor post-render.
  useEffect(() => {
    if (window.location.hash === '#module-visual') {
      const t = setTimeout(
        () => document.getElementById('module-visual')?.scrollIntoView({ behavior: 'smooth' }),
        150,
      )
      return () => clearTimeout(t)
    }
  }, [module.id])

  return (
    <TimeTrackingProvider
      academyId={BD_ACADEMY_ID}
      moduleId={module.id}
      activityType="study"
      viewerRole="learner"
    >
    <div className="max-w-[760px] mx-auto">
      {/* §5 navigation: persistent back arrow + breadcrumb trail, with the live
          session stopwatch pinned to the right of the row. Kept in normal flow
          (not position:fixed) so framer-motion transforms on ancestor page
          wrappers can't reparent/clip it. */}
      <div className="flex items-center gap-3 mb-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to all modules"
          className="shrink-0 w-8 h-8 rounded-full border border-[rgba(0,59,70,0.15)] flex items-center justify-center text-ink-secondary hover:text-ink-primary hover:bg-black/[0.03] transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <nav aria-label="Breadcrumb" className="text-[12px] text-ink-tertiary truncate">
          <Link href="/academies" className="hover:text-ink-primary transition-colors">
            Academies
          </Link>
          <span className="mx-1.5">→</span>
          <Link href="/academy/business-development" className="hover:text-ink-primary transition-colors">
            Business Development
          </Link>
          <span className="mx-1.5">→</span>
          <span className="text-ink-primary font-medium">Module {module.number}</span>
        </nav>
        <div className="ml-auto shrink-0">
          <LiveSessionClock />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-1">
        <span className="text-[11px] font-medium text-ink-tertiary">Module {module.number}</span>
        <CompetencyChip competency={module.competency} />
      </div>
      <h1 className="font-serif text-3xl text-ink-primary">{title}</h1>
      <p className="text-sm text-ink-secondary mt-1">{module.summary}</p>

      <div className="mt-5">
        <BdVideoPlayer module={module} />
      </div>

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
            {t === 'read' ? 'Content' : 'Quiz (3 questions)'}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'read' ? (
          <div className="space-y-3.5">
            {module.blocks.map((b, i) => (
              <Block key={i} block={b} />
            ))}

            {bdModuleHasVisual(module.id) && (
              <div className="pt-2 scroll-mt-20" id="module-visual">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary mb-3">
                  {bdModuleVisualLabel(module.id)}
                </p>
                <BdModuleVisual moduleId={module.id} />
              </div>
            )}

            {/* §4: full FAQ bank as click-to-expand accordion (M7/M8/M4/M10) */}
            {bdModuleHasFaq(module.id) && (
              <div className="pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary mb-3">
                  Full FAQ bank — click a question to expand
                </p>
                <BdFaqAccordion moduleId={module.id} onOpenModule={onOpenModule} />
              </div>
            )}

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
          <Quiz module={module} onDone={onBack} />
        )}
      </div>

      {/* Prev / next module — small corner buttons for sequential movement. */}
      {(() => {
        const idx = BD_MODULES.findIndex((m) => m.id === module.id)
        const prev = idx > 0 ? BD_MODULES[idx - 1] : null
        const next = idx < BD_MODULES.length - 1 ? BD_MODULES[idx + 1] : null
        return (
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-[rgba(0,59,70,0.08)] pt-4">
            {prev ? (
              <button
                type="button"
                onClick={() => onOpenModule?.(prev.id)}
                className="group inline-flex items-center gap-2 rounded-full border-[0.5px] border-[rgba(0,59,70,0.16)] pl-2.5 pr-3.5 py-1.5 text-[12px] text-ink-secondary hover:border-accent-copper hover:text-accent-copper transition-colors max-w-[46%]"
                title={`Module ${prev.number}: ${bdEffectiveTitle(overrides, prev.id, prev.title)}`}
              >
                <ArrowLeft size={14} className="shrink-0" />
                <span className="text-left leading-tight">
                  <span className="block text-[10px] uppercase tracking-wide text-ink-tertiary group-hover:text-accent-copper">Previous</span>
                  <span className="block truncate">Module {prev.number}</span>
                </span>
              </button>
            ) : (
              <span />
            )}
            {next ? (
              <button
                type="button"
                onClick={() => onOpenModule?.(next.id)}
                className="group inline-flex items-center gap-2 rounded-full border-[0.5px] border-[rgba(0,59,70,0.16)] pl-3.5 pr-2.5 py-1.5 text-[12px] text-ink-secondary hover:border-accent-copper hover:text-accent-copper transition-colors max-w-[46%]"
                title={`Module ${next.number}: ${bdEffectiveTitle(overrides, next.id, next.title)}`}
              >
                <span className="text-right leading-tight">
                  <span className="block text-[10px] uppercase tracking-wide text-ink-tertiary group-hover:text-accent-copper">Next</span>
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

/* ───────────────── list ───────────────── */
export default function BdAcademy() {
  // Deep-link support: /…/modules?module=bd-m5 opens that module directly so
  // the academy curriculum can link straight into a specific module.
  const searchParams = useSearchParams()
  const initialId = searchParams?.get('module') ?? null
  const [activeId, setActiveId] = useState<string | null>(
    initialId && BD_MODULES.some((m) => m.id === initialId) ? initialId : null,
  )
  const results = useBdProgress((s) => s.results)
  const completed = useBdProgress((s) => s.completedCount)()
  const pct = useBdProgress((s) => s.overallPct)()
  const overrides = useBdTitles((s) => s.overrides)

  const active = BD_MODULES.find((m) => m.id === activeId) ?? null
  if (active)
    return (
      <ModuleView
        module={active}
        onBack={() => setActiveId(null)}
        onOpenModule={(id) => {
          setActiveId(id)
          window.scrollTo(0, 0)
        }}
      />
    )

  return (
    <div className="max-w-[900px] mx-auto space-y-8">
      <section className="pb-6 border-b border-[rgba(0,59,70,0.08)]">
        <Link
          href="/academy/business-development"
          className="inline-flex items-center gap-1.5 text-sm text-ink-tertiary hover:text-ink-primary transition-colors mb-3"
        >
          <ArrowLeft size={15} /> Business Development Executive
        </Link>
        <h1 className="font-serif text-4xl font-normal text-ink-primary">
          Wellness sales foundations
        </h1>
        <p className="text-sm text-ink-secondary mt-2 max-w-[620px]">
          Ten modules built from Magppie’s approved sales training. Read each module,
          then pass its quiz at {Math.round(BD_PASS_THRESHOLD * 100)}% to mark it complete.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-2.5 bg-cream rounded-full overflow-hidden max-w-[420px]">
            <div className="h-full bg-surface-sage rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-sm font-semibold text-ink-primary tabular-nums">
            {completed}/{BD_MODULES.length} complete
          </span>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <Link
            href="/academy/business-development/faq"
            className="inline-flex items-center gap-2 rounded-full border border-accent-copper/50 bg-accent-copper/5 px-4 py-2 text-[13px] font-semibold text-accent-copper hover:bg-accent-copper/10 transition-colors"
          >
            Browse the full BD FAQ — all 69 questions, with interactive visuals →
          </Link>
          <Link
            href="/academy/business-development/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(0,59,70,0.16)] px-4 py-2 text-[13px] font-semibold text-ink-secondary hover:text-ink-primary hover:bg-black/[0.03] transition-colors"
          >
            View your learning dashboard →
          </Link>
        </div>
      </section>

      {/* New-joiner diagnostic (§2): shows on first visit to the BD academy —
          the demo-mode stand-in for "assigned to BD academy for the first
          time". Informational only; modules below are never blocked by it. */}
      <BdDiagnosticBanner />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {BD_MODULES.map((m) => {
          const r = results[m.id]
          const status = r?.passed ? 'passed' : r?.viewed ? 'in_progress' : 'not_started'
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setActiveId(m.id)}
              className="text-left rounded-[12px] border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream p-4 hover:shadow-card transition-shadow flex items-start gap-3"
            >
              <span className="mt-0.5 shrink-0">
                {status === 'passed' ? (
                  <CheckCircle2 size={20} className="text-surface-sage" />
                ) : status === 'in_progress' ? (
                  <ProgressRing progress={33} status={statusFromProgress(33)} size={22} />
                ) : (
                  <Circle size={20} className="text-ink-tertiary/40" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] text-ink-tertiary">Module {m.number}</span>
                <span className="block text-sm font-medium text-ink-primary">
                  {bdEffectiveTitle(overrides, m.id, m.title)}
                </span>
                <span className="mt-1.5 block">
                  <CompetencyChip competency={m.competency} />
                </span>
                {r?.passed && (
                  <span className="mt-1.5 block text-[11px] text-surface-sage font-medium">
                    Passed · best {r.bestScore}/{r.total}
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>

      <p className="text-[11px] text-ink-tertiary flex items-center gap-1.5">
        <Lock size={12} /> Draft content — pending final publish approval. These modules are
        human-reviewed and don’t route through the AI review queue.
      </p>
    </div>
  )
}
