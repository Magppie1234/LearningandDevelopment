'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy,
  Flame,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Crown,
  Medal,
  Award,
  Timer,
  SkipForward,
  Layers,
  ListChecks,
  Lock,
  Gauge,
  CornerDownLeft,
  Languages,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthOptional } from '@/lib/auth'
import {
  LEVEL_POINTS,
  LEVEL_LABELS_I18N,
  QUESTION_SECONDS,
  SPEED_BONUS,
  STREAK_THRESHOLD,
  UI,
  localize,
  getMonthlySet,
  getMonthlyChallenge,
  getMonthId,
  getMonthIndex,
  getMonthLabel,
  maxScoreFor,
  maxBonusFor,
  computeScore,
  type Language,
  type QuizLevel,
  type QuizQuestion,
} from '@/data/bde-quiz'
import {
  useQuizStore,
  bestFullAttempt,
  completionStreak,
  lifetimeStats,
  monthlyLeaderboard,
  type AnsweredQuestion,
} from '@/lib/quiz-store'

/* ------------------------------------------------------------------ */
/*  Design tokens                                                      */
/* ------------------------------------------------------------------ */

const LEVEL_ACCENT: Record<QuizLevel, string> = {
  easy: '#5f8a6b', // muted green
  medium: '#b98a3e', // ochre
  hard: '#a8503f', // clay red
}

function initialsOf(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/* ------------------------------------------------------------------ */
/*  Countdown ring                                                     */
/* ------------------------------------------------------------------ */

function TimerRing({ seconds }: { seconds: number }) {
  const size = 54
  const sw = 4
  const r = (size - sw) / 2
  const circ = 2 * Math.PI * r
  const frac = Math.max(0, seconds) / QUESTION_SECONDS
  const danger = seconds <= 10
  const color = seconds <= 10 ? '#dc2626' : seconds <= 20 ? '#c07a1e' : '#5f8a6b'

  return (
    <div
      className={cn('relative flex-shrink-0', danger && 'animate-pulse')}
      style={{ width: size, height: size }}
      aria-label={`${seconds} seconds left`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(0,59,70,0.1)"
          strokeWidth={sw}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - frac)}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center leading-none">
        <span className="text-base font-bold tabular-nums" style={{ color }}>
          {Math.max(0, seconds)}
        </span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

type Phase = 'intro' | 'rules' | 'quiz' | 'results'

export default function MonthlyQuiz() {
  const auth = useAuthOptional()
  const user = auth?.user ?? null
  const attempts = useQuizStore((s) => s.attempts)
  const recordAttempt = useQuizStore((s) => s.recordAttempt)
  const storeLang = useQuizStore((s) => s.language)
  const setLanguage = useQuizStore((s) => s.setLanguage)

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Gate persisted/date-derived state on mount to avoid hydration mismatch.
  const lang: Language = mounted ? storeLang : 'en'
  const t = UI[lang]
  const levelLabel = (lvl: QuizLevel) => LEVEL_LABELS_I18N[lang][lvl]

  const monthIndex = getMonthIndex()
  const monthId = getMonthId()
  const monthlySet = useMemo(() => getMonthlySet(monthIndex), [monthIndex])
  const monthLabel = getMonthLabel(new Date(), lang)

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    user?.email ||
    (lang === 'hi' ? 'आप' : 'You')

  const [phase, setPhase] = useState<Phase>('intro')
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const [timeLeft, setTimeLeft] = useState(QUESTION_SECONDS)
  const [answers, setAnswers] = useState<AnsweredQuestion[]>([])

  // Live refs so timers / keyboard handlers read current values without rebinding.
  const timeLeftRef = useRef(timeLeft)
  timeLeftRef.current = timeLeft
  const submittedRef = useRef(submitted)
  submittedRef.current = submitted
  const selectedRef = useRef(selected)
  selectedRef.current = selected
  const answersRef = useRef(answers)
  answersRef.current = answers
  const finishedRef = useRef(false)

  const best = mounted ? bestFullAttempt(attempts, monthId) : null
  const streak = mounted ? completionStreak(attempts, monthIndex) : 0
  const life = mounted ? lifetimeStats(attempts) : null

  // Shuffle option display order per question (the bank stores the correct
  // answer at a fixed index) — recomputed only when the question changes, so
  // it stays stable across re-renders (e.g. the per-second timer tick).
  const optionOrder = useMemo(() => {
    const q = questions[current]
    if (!q) return []
    const order = q.options.map((_, i) => i)
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[order[i], order[j]] = [order[j], order[i]]
    }
    return order
  }, [current, questions])
  const optionOrderRef = useRef(optionOrder)
  optionOrderRef.current = optionOrder

  /* ---- flow control -------------------------------------------------- */

  const startQuiz = useCallback(() => {
    setQuestions(getMonthlyChallenge(monthIndex))
    setCurrent(0)
    setSelected(null)
    setSubmitted(false)
    setTimedOut(false)
    setTimeLeft(QUESTION_SECONDS)
    setAnswers([])
    finishedRef.current = false
    setPhase('quiz')
  }, [monthIndex])

  // Pick (but do not lock) an option.
  const handleSelectOption = useCallback(
    (optionIndex: number) => {
      if (submittedRef.current) return
      const q = questions[current]
      if (!q || optionIndex < 0 || optionIndex >= q.options.length) return
      setSelected(optionIndex)
    },
    [questions, current],
  )

  // Lock in the currently-selected option.
  const handleSubmit = useCallback(() => {
    if (submittedRef.current) return
    const q = questions[current]
    const sel = selectedRef.current
    if (!q || sel === null) return
    setSubmitted(true)
    setAnswers((prev) => [
      ...prev,
      {
        questionId: q.id,
        level: q.level,
        selectedIndex: sel,
        correct: sel === q.correctIndex,
        timeSpent: QUESTION_SECONDS - timeLeftRef.current,
      },
    ])
  }, [questions, current])

  const handleTimeout = useCallback(() => {
    if (submittedRef.current) return
    const q = questions[current]
    if (!q) return
    setSubmitted(true)
    setTimedOut(true)
    setAnswers((prev) => [
      ...prev,
      {
        questionId: q.id,
        level: q.level,
        selectedIndex: -1,
        correct: false,
        timedOut: true,
        timeSpent: QUESTION_SECONDS,
      },
    ])
  }, [questions, current])

  const finish = useCallback(
    (finalAnswers: AnsweredQuestion[], qs: QuizQuestion[]) => {
      if (finishedRef.current) return
      finishedRef.current = true
      const byLevel: Record<QuizLevel, { correct: number; total: number }> = {
        easy: { correct: 0, total: 0 },
        medium: { correct: 0, total: 0 },
        hard: { correct: 0, total: 0 },
      }
      let correctCount = 0
      for (const a of finalAnswers) {
        byLevel[a.level].total += 1
        if (a.correct) {
          byLevel[a.level].correct += 1
          correctCount += 1
        }
      }
      const breakdown = computeScore(finalAnswers)
      recordAttempt({
        monthId,
        monthIndex,
        scope: 'full',
        completedAt: new Date().toISOString(),
        correctCount,
        totalQuestions: qs.length,
        score: breakdown.total,
        maxScore: maxScoreFor(qs),
        basePoints: breakdown.basePoints,
        bonusPoints: breakdown.speedBonus + breakdown.streakBonus,
        byLevel,
        answers: finalAnswers,
      })
      setPhase('results')
    },
    [recordAttempt, monthId, monthIndex],
  )

  const goNext = useCallback(() => {
    setTimedOut(false)
    if (current < questions.length - 1) {
      setSelected(null)
      setSubmitted(false)
      setTimeLeft(QUESTION_SECONDS)
      setCurrent((c) => c + 1)
    } else {
      finish(answersRef.current, questions)
    }
  }, [current, questions, finish])

  /* ---- timers -------------------------------------------------------- */

  useEffect(() => {
    if (phase !== 'quiz' || submitted || timeLeft <= 0) return
    const id = setTimeout(() => setTimeLeft((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [phase, submitted, timeLeft])

  useEffect(() => {
    if (phase === 'quiz' && !submitted && timeLeft <= 0) handleTimeout()
  }, [phase, submitted, timeLeft, handleTimeout])

  useEffect(() => {
    if (!timedOut) return
    const id = setTimeout(() => goNext(), 2600)
    return () => clearTimeout(id)
  }, [timedOut, goNext])

  /* ---- keyboard ------------------------------------------------------ */

  useEffect(() => {
    if (phase !== 'quiz') return
    function onKey(e: KeyboardEvent) {
      const q = questions[current]
      if (!q) return
      if (!submittedRef.current) {
        if (e.key === 'Enter' || e.key === ' ') {
          if (selectedRef.current !== null) {
            e.preventDefault()
            handleSubmit()
          }
          return
        }
        let pos = -1
        if (/^[1-9]$/.test(e.key)) pos = parseInt(e.key, 10) - 1
        else if (/^[a-dA-D]$/.test(e.key)) pos = e.key.toLowerCase().charCodeAt(0) - 97
        if (pos >= 0 && pos < q.options.length) {
          const originalIndex = optionOrderRef.current[pos]
          if (originalIndex !== undefined) {
            e.preventDefault()
            handleSelectOption(originalIndex)
          }
        }
      } else if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault()
        goNext()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, current, questions, handleSelectOption, handleSubmit, goNext])

  /* ---- language toggle (shared across phases) ------------------------ */

  const LangToggle = (
    <div className="inline-flex items-center rounded-full border border-[rgba(0,59,70,0.12)] bg-cream p-0.5">
      <Languages size={13} className="text-ink-tertiary mx-1.5" />
      {(['en', 'hi'] as Language[]).map((l) => (
        <button
          key={l}
          onClick={() => setLanguage(l)}
          className={cn(
            'px-2.5 py-1 rounded-full text-xs font-semibold transition-colors',
            lang === l
              ? 'bg-ink-primary text-parchment'
              : 'text-ink-secondary hover:text-ink-primary',
          )}
        >
          {l === 'en' ? 'EN' : 'हिं'}
        </button>
      ))}
    </div>
  )

  /* ================================================================== */
  /*  INTRO                                                             */
  /* ================================================================== */
  if (phase === 'intro') {
    const challenge = getMonthlyChallenge(monthIndex)
    const maxFull = maxScoreFor(challenge)
    const maxBonus = maxBonusFor(challenge)
    const userPoints = best?.score ?? 0
    const userHardAccuracy = best
      ? best.byLevel.hard.total
        ? Math.round((best.byLevel.hard.correct / best.byLevel.hard.total) * 100)
        : 0
      : 0
    const board = mounted
      ? monthlyLeaderboard(monthIndex, {
          name: displayName,
          initials: initialsOf(displayName),
          points: userPoints,
          hardAccuracy: userHardAccuracy,
        })
      : []

    const rules = [
      { icon: ListChecks, label: `${challenge.length} ${t.questions}` },
      { icon: Layers, label: t.levels },
      { icon: Timer, label: t.perQuestion },
      { icon: SkipForward, label: t.autoSkip },
    ]

    return (
      <div className="space-y-8">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-6 pb-6 border-b border-[rgba(0,59,70,0.08)]">
          <div className="max-w-[560px]">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary mb-3">
              <Calendar size={13} className="text-accent-gold" />
              <span>{t.monthlyChallenge}</span>
              <span className="w-1 h-1 rounded-full bg-ink-tertiary/50" />
              <span>{monthLabel}</span>
            </div>
            <h3 className="font-serif text-4xl font-normal text-ink-primary leading-tight">
              {t.title}
            </h3>
            <p className="text-[15px] text-ink-secondary mt-3 leading-relaxed">{t.subtitle}</p>

            <div className="flex flex-wrap gap-2 mt-5">
              {rules.map((r) => (
                <span
                  key={r.label}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-secondary bg-cream border border-[rgba(0,59,70,0.1)] rounded-full px-3 py-1.5"
                >
                  <r.icon size={13} className="text-ink-tertiary" />
                  {r.label}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-end gap-4">
            {LangToggle}
            <div className="grid grid-cols-3 gap-3">
              <StatTile icon={Trophy} value={best ? String(best.score) : '—'} label={t.bestThisMonth} />
              <StatTile icon={Flame} value={String(streak)} label={t.monthStreak} />
              <StatTile icon={Gauge} value={life ? `${life.accuracy}%` : '—'} label={t.accuracy} />
            </div>
          </div>
        </header>

        {mounted && best && (
          <div className="flex items-start gap-2.5 rounded-xl bg-[#5f8a6b]/10 border border-[#5f8a6b]/25 px-4 py-3 text-sm text-ink-secondary">
            <CheckCircle2 size={16} className="text-[#5f8a6b] flex-shrink-0 mt-0.5" />
            <span>{t.completed(best.score, best.maxScore)}</span>
          </div>
        )}

        {/* Full Challenge — primary CTA */}
        <button
          onClick={() => setPhase('rules')}
          className="group w-full text-left bg-cream rounded-2xl border border-[rgba(0,59,70,0.1)] shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all overflow-hidden"
        >
          <div className="h-1 w-full bg-gradient-to-r from-[#5f8a6b] via-[#b98a3e] to-[#a8503f]" />
          <div className="flex flex-wrap items-center justify-between gap-6 p-6 sm:p-7">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent-gold mb-1.5">
                {t.recommended}
              </p>
              <h4 className="font-serif text-2xl text-ink-primary">{t.fullChallenge}</h4>
              <p className="text-sm text-ink-secondary mt-1.5 max-w-[460px] leading-relaxed">
                {t.fullDesc(challenge.length)}
              </p>
              <div className="flex items-center gap-2 mt-4 text-xs font-medium text-ink-tertiary">
                {(['easy', 'medium', 'hard'] as QuizLevel[]).map((lvl, i) => (
                  <span key={lvl} className="inline-flex items-center gap-2">
                    {i > 0 && <span className="w-1 h-1 rounded-full bg-ink-tertiary/40" />}
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: LEVEL_ACCENT[lvl] }} />
                    {monthlySet[lvl].length} {levelLabel(lvl)}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-6 flex-shrink-0">
              <div className="text-right">
                <p className="font-serif text-4xl text-ink-primary leading-none">{maxFull}</p>
                <p className="text-[10px] uppercase tracking-wide text-ink-tertiary mt-1.5">
                  {t.pointsOnOffer}
                </p>
                <p className="text-[10px] text-accent-gold font-medium mt-0.5">{t.bonusOnOffer(maxBonus)}</p>
              </div>
              <span className="inline-flex items-center gap-2 bg-ink-primary text-parchment px-6 py-3.5 rounded-full text-sm font-semibold group-hover:bg-ink-secondary transition-colors">
                {best ? t.retake : t.start}
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </div>
        </button>

        {/* Leaderboard */}
        <section className="bg-cream rounded-2xl border border-[rgba(0,59,70,0.1)] p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy size={17} className="text-accent-gold" />
              <h4 className="text-base font-semibold text-ink-primary">{t.leaderboard}</h4>
            </div>
            <span className="text-xs text-ink-tertiary">{monthLabel}</span>
          </div>
          {!mounted ? (
            <p className="text-sm text-ink-tertiary py-4">{t.loading}</p>
          ) : (
            <div className="space-y-0.5">
              {board.map((row) => (
                <div
                  key={`${row.name}-${row.rank}`}
                  className={cn(
                    'grid grid-cols-[36px_1fr_72px] gap-3 items-center px-3 py-2.5 rounded-lg transition-colors',
                    row.isCurrentUser
                      ? 'bg-surface-blue/20 ring-1 ring-surface-blue/50'
                      : 'hover:bg-[rgba(0,59,70,0.03)]',
                  )}
                >
                  <div className="flex items-center justify-center">
                    {row.rank === 1 ? (
                      <Crown size={16} className="text-accent-gold" />
                    ) : row.rank === 2 ? (
                      <Medal size={16} className="text-surface-mid" />
                    ) : row.rank === 3 ? (
                      <Award size={16} className="text-accent-gold/60" />
                    ) : (
                      <span className="text-xs font-bold text-ink-tertiary tabular-nums">{row.rank}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-8 h-8 rounded-full bg-surface-blue/40 flex items-center justify-center text-[10px] font-bold text-ink-primary flex-shrink-0">
                      {row.initials}
                    </span>
                    <span className="text-sm font-medium text-ink-primary truncate">
                      {row.name}
                      {row.isCurrentUser && <span className="text-ink-tertiary font-normal"> · {t.you}</span>}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-ink-primary text-right tabular-nums">
                    {row.points}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    )
  }

  /* ================================================================== */
  /*  RULES — shown once before every attempt, scored or retaken        */
  /* ================================================================== */
  if (phase === 'rules') {
    const challenge = getMonthlyChallenge(monthIndex)
    const maxFull = maxScoreFor(challenge)
    const maxBonus = maxBonusFor(challenge)

    const ruleItems = [
      { icon: ListChecks, title: `${challenge.length} ${t.questions}`, detail: t.rulesQuestionsDetail },
      { icon: Layers, title: t.levels, detail: t.rulesLevelsDetail },
      { icon: Timer, title: t.perQuestion, detail: t.rulesTimerDetail },
      { icon: SkipForward, title: t.autoSkip, detail: t.rulesAutoSkipDetail },
      { icon: Lock, title: t.rulesLockTitle, detail: t.rulesLockDetail },
      { icon: Trophy, title: t.rulesScoringTitle, detail: t.rulesScoringDetail },
      { icon: Flame, title: t.rulesBonusTitle, detail: t.rulesBonusDetail },
    ]

    return (
      <div className="max-w-[640px] mx-auto space-y-6">
        <div className="bg-cream rounded-2xl border border-[rgba(0,59,70,0.1)] shadow-card overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-[#5f8a6b] via-[#b98a3e] to-[#a8503f]" />
          <div className="p-7 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent-gold mb-2">
                  {t.rulesEyebrow}
                </p>
                <h3 className="font-serif text-3xl text-ink-primary">{t.rulesTitle}</h3>
                <p className="text-sm text-ink-secondary mt-2 leading-relaxed max-w-[440px]">
                  {t.rulesSubtitle}
                </p>
              </div>
              {LangToggle}
            </div>

            <div className="mt-6 space-y-3">
              {ruleItems.map((r) => (
                <div
                  key={r.title}
                  className="flex items-start gap-3 rounded-xl bg-parchment/60 border border-[rgba(0,59,70,0.08)] px-4 py-3"
                >
                  <span className="w-8 h-8 rounded-lg bg-[rgba(0,59,70,0.06)] flex items-center justify-center flex-shrink-0">
                    <r.icon size={16} className="text-ink-secondary" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink-primary">{r.title}</p>
                    <p className="text-xs text-ink-tertiary mt-0.5 leading-relaxed">{r.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-4 mt-7 pt-6 border-t border-[rgba(0,59,70,0.08)]">
              <div>
                <p className="font-serif text-2xl text-ink-primary leading-none">{maxFull}</p>
                <p className="text-[10px] uppercase tracking-wide text-ink-tertiary mt-1">
                  {t.pointsOnOffer}
                </p>
                <p className="text-[10px] text-accent-gold font-medium mt-0.5">{t.bonusOnOffer(maxBonus)}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPhase('intro')}
                  className="inline-flex items-center gap-2 bg-transparent border border-[rgba(0,59,70,0.15)] text-ink-secondary px-5 py-3 rounded-full text-sm font-semibold hover:bg-[rgba(0,59,70,0.04)] transition-colors"
                >
                  {t.back}
                </button>
                <button
                  onClick={startQuiz}
                  className="inline-flex items-center gap-2 bg-ink-primary text-parchment px-6 py-3 rounded-full text-sm font-semibold hover:bg-ink-secondary transition-colors"
                >
                  {t.beginQuiz}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ================================================================== */
  /*  QUIZ                                                              */
  /* ================================================================== */
  if (phase === 'quiz') {
    const q = questions[current]
    const loc = localize(q, lang)
    const liveScore = computeScore(answers)
    const runningScore = liveScore.total

    return (
      <div className="max-w-[720px] mx-auto">
        {/* Top control strip */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="text-xs font-medium text-ink-secondary truncate">
            {t.fullChallenge}
            <span className="text-ink-tertiary"> · {t.questionOf(current + 1, questions.length)}</span>
          </span>
          {LangToggle}
        </div>

        <div className="flex items-center gap-4 mb-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-medium text-ink-tertiary">
                <span className="inline-flex items-center gap-1.5 font-semibold" style={{ color: LEVEL_ACCENT[q.level] }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: LEVEL_ACCENT[q.level] }} />
                  {levelLabel(q.level)} · {LEVEL_POINTS[q.level]} pts
                </span>
                <span className="text-ink-tertiary/70"> · {t.fastBonusHint(SPEED_BONUS[q.level])}</span>
              </span>
              <span className="font-semibold text-ink-primary tabular-nums">{runningScore} {t.points.toLowerCase()}</span>
            </div>
            <div className="flex items-center gap-1">
              {questions.map((_, i) => {
                const a = answers[i]
                const state =
                  i === current ? 'current' : a ? (a.correct ? 'correct' : 'wrong') : 'todo'
                return (
                  <div
                    key={i}
                    className={cn(
                      'h-1.5 flex-1 rounded-full transition-colors',
                      state === 'current' && 'bg-ink-primary',
                      state === 'correct' && 'bg-[#5f8a6b]',
                      state === 'wrong' && 'bg-[#a8503f]',
                      state === 'todo' && 'bg-[rgba(0,59,70,0.1)]',
                    )}
                  />
                )
              })}
            </div>
          </div>
          <TimerRing seconds={timeLeft} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="bg-cream rounded-2xl border border-[rgba(0,59,70,0.1)] p-6 sm:p-8 shadow-card"
          >
            <div className="flex items-center justify-end mb-3">
              <span className="text-[11px] text-ink-tertiary font-medium">
                {t.pressKeys(q.options.length)}
              </span>
            </div>

            <h4 className="text-xl font-semibold text-ink-primary leading-snug mb-6">{loc.question}</h4>

            <div className="space-y-2.5">
              {optionOrder.map((originalIndex, pos) => {
                const opt = loc.options[originalIndex]
                const isSelected = selected === originalIndex
                const isRight = originalIndex === q.correctIndex
                const showRight = submitted && isRight
                const showWrong = submitted && isSelected && !isRight
                const showPending = !submitted && isSelected

                return (
                  <button
                    key={originalIndex}
                    onClick={() => handleSelectOption(originalIndex)}
                    disabled={submitted}
                    className={cn(
                      'w-full text-left flex items-center gap-3 rounded-xl border px-4 py-3.5 transition-all',
                      !submitted && !isSelected &&
                        'border-[rgba(0,59,70,0.12)] hover:border-ink-primary/50 hover:bg-[rgba(0,59,70,0.02)] cursor-pointer',
                      showPending && 'border-ink-primary bg-ink-primary/[0.04] cursor-pointer',
                      showRight && 'border-[#5f8a6b] bg-[#5f8a6b]/10',
                      showWrong && 'border-[#a8503f] bg-[#a8503f]/8',
                      submitted && !showRight && !showWrong && 'border-[rgba(0,59,70,0.08)] opacity-55',
                    )}
                  >
                    <span
                      className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0',
                        showRight && 'bg-[#5f8a6b] text-white',
                        showWrong && 'bg-[#a8503f] text-white',
                        showPending && 'bg-ink-primary text-parchment',
                        !showRight && !showWrong && !showPending && 'bg-[rgba(0,59,70,0.07)] text-ink-secondary',
                      )}
                    >
                      {showRight ? (
                        <CheckCircle2 size={16} />
                      ) : showWrong ? (
                        <XCircle size={16} />
                      ) : (
                        String.fromCharCode(65 + pos)
                      )}
                    </span>
                    <span
                      className={cn(
                        'text-sm leading-snug',
                        showRight
                          ? 'text-[#3f6049] font-medium'
                          : showWrong
                            ? 'text-[#7a3529] font-medium'
                            : 'text-ink-primary',
                      )}
                    >
                      {opt}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Submit button (pre-lock) */}
            {!submitted && (
              <div className="flex items-center justify-between mt-6">
                <span className="text-[11px] text-ink-tertiary">{t.selectThenSubmit}</span>
                <button
                  onClick={handleSubmit}
                  disabled={selected === null}
                  className={cn(
                    'inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all',
                    selected === null
                      ? 'bg-[rgba(0,59,70,0.08)] text-ink-tertiary cursor-not-allowed'
                      : 'bg-ink-primary text-parchment hover:bg-ink-secondary',
                  )}
                >
                  {t.submit}
                  <CornerDownLeft size={15} />
                </button>
              </div>
            )}

            {/* Feedback (post-lock) */}
            <AnimatePresence>
              {submitted && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="overflow-hidden"
                >
                  {(() => {
                    const isCorrect = selected === q.correctIndex && !timedOut
                    const prevBreakdown = computeScore(answers.slice(0, -1))
                    const afterBreakdown = computeScore(answers)
                    const speedBonusThis = afterBreakdown.speedBonus - prevBreakdown.speedBonus
                    const streakBonusThis = afterBreakdown.streakBonus - prevBreakdown.streakBonus
                    const tone = timedOut
                      ? { bg: 'bg-[#b98a3e]/10', border: 'border-[#b98a3e]/30', text: 'text-[#8a6420]' }
                      : isCorrect
                        ? { bg: 'bg-[#5f8a6b]/10', border: 'border-[#5f8a6b]/30', text: 'text-[#3f6049]' }
                        : { bg: 'bg-[#a8503f]/8', border: 'border-[#a8503f]/30', text: 'text-[#7a3529]' }
                    return (
                      <div className={cn('mt-5 rounded-xl p-4 border', tone.bg, tone.border)}>
                        <p className={cn('text-sm font-semibold mb-1 flex items-center gap-1.5', tone.text)}>
                          {timedOut ? (
                            <>
                              <Timer size={15} /> {t.timesUp}
                            </>
                          ) : isCorrect ? (
                            <>
                              <CheckCircle2 size={15} /> {t.correct} · +{LEVEL_POINTS[q.level] + speedBonusThis}
                            </>
                          ) : (
                            <>
                              <XCircle size={15} /> {t.notQuite}
                            </>
                          )}
                        </p>
                        {(speedBonusThis > 0 || streakBonusThis > 0) && (
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {speedBonusThis > 0 && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent-gold bg-accent-gold/10 rounded-full px-2 py-0.5">
                                <Gauge size={11} /> {t.speedBonusLabel} +{speedBonusThis}
                              </span>
                            )}
                            {streakBonusThis > 0 && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent-gold bg-accent-gold/10 rounded-full px-2 py-0.5">
                                <Flame size={11} /> {t.streakBonusLabel} +{streakBonusThis}
                              </span>
                            )}
                          </div>
                        )}
                        <p className="text-sm text-ink-secondary leading-relaxed">{loc.explanation}</p>
                        <p className="text-[11px] text-ink-tertiary mt-2">
                          {t.source}: {q.source}
                        </p>
                      </div>
                    )
                  })()}

                  <div className="flex items-center justify-between mt-5">
                    <span className="text-[11px] text-ink-tertiary flex items-center gap-1.5">
                      {timedOut ? (
                        t.movingOn
                      ) : (
                        <>
                          <CornerDownLeft size={12} /> {t.enterForNext}
                        </>
                      )}
                    </span>
                    <button
                      onClick={goNext}
                      className="inline-flex items-center gap-2 bg-ink-primary text-parchment px-6 py-3 rounded-full text-sm font-semibold hover:bg-ink-secondary transition-colors"
                    >
                      {current < questions.length - 1 ? t.next : t.seeResults}
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  /* ================================================================== */
  /*  RESULTS                                                           */
  /* ================================================================== */
  const correctCount = answers.filter((a) => a.correct).length
  const scoreBreakdown = computeScore(answers)
  const score = scoreBreakdown.total
  const maxScore = maxScoreFor(questions)
  const pct = questions.length ? Math.round((correctCount / questions.length) * 100) : 0
  const timedOutCount = answers.filter((a) => a.timedOut).length
  const avgTime = answers.length
    ? Math.round(answers.reduce((s, a) => s + (a.timeSpent ?? 0), 0) / answers.length)
    : 0

  const byLevel: Record<QuizLevel, { correct: number; total: number }> = {
    easy: { correct: 0, total: 0 },
    medium: { correct: 0, total: 0 },
    hard: { correct: 0, total: 0 },
  }
  for (const a of answers) {
    byLevel[a.level].total += 1
    if (a.correct) byLevel[a.level].correct += 1
  }

  const verdict = t.verdict(pct)

  return (
    <div className="max-w-[720px] mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="bg-cream rounded-2xl border border-[rgba(0,59,70,0.1)] shadow-card overflow-hidden"
      >
        <div className="h-1 w-full bg-gradient-to-r from-[#5f8a6b] via-[#b98a3e] to-[#a8503f]" />
        <div className="p-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary mb-2">
            {t.fullChallenge} · {monthLabel}
          </p>
          <h3 className="font-serif text-3xl text-ink-primary">{verdict.title}</h3>
          <p className="text-sm text-ink-secondary mt-2">{verdict.note}</p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-8">
            <ResultStat value={`${score}`} sub={t.of(maxScore)} label={t.points} />
            <ResultStat value={`+${scoreBreakdown.speedBonus + scoreBreakdown.streakBonus}`} label={t.bonusLabel} />
            <ResultStat value={`${correctCount}/${questions.length}`} label={t.correctLabel} />
            <ResultStat value={`${pct}%`} label={t.accuracyShort} />
            <ResultStat value={`${avgTime}s`} label={t.avgTime} />
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {scoreBreakdown.fastCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-accent-gold/10 text-accent-gold">
                <Gauge size={12} /> {t.speedBonusLabel} +{scoreBreakdown.speedBonus}
              </span>
            )}
            {scoreBreakdown.streakAchieved && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-accent-gold/10 text-accent-gold">
                <Flame size={12} /> {t.streakBonusLabel} +{scoreBreakdown.streakBonus}
              </span>
            )}
            {timedOutCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-[rgba(0,59,70,0.06)] text-ink-secondary">
                <Timer size={12} /> {timedOutCount} {t.timedOut}
              </span>
            )}
          </div>

          {/* Points breakdown — base points earned per difficulty tier */}
          <div className="mt-7 max-w-[420px] mx-auto space-y-2.5 text-left">
            <p className="text-[10px] uppercase tracking-wide text-ink-tertiary text-center mb-1">
              {t.pointsBreakdown}
            </p>
            {(['easy', 'medium', 'hard'] as QuizLevel[])
              .filter((lvl) => byLevel[lvl].total > 0)
              .map((lvl) => {
                const earned = byLevel[lvl].correct * LEVEL_POINTS[lvl]
                const cap = byLevel[lvl].total * LEVEL_POINTS[lvl]
                const width = cap ? Math.round((earned / cap) * 100) : 0
                return (
                  <div key={lvl}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium" style={{ color: LEVEL_ACCENT[lvl] }}>
                        {levelLabel(lvl)}
                      </span>
                      <span className="text-ink-tertiary tabular-nums">
                        {earned}/{cap} {t.points.toLowerCase()}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[rgba(0,59,70,0.08)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${width}%`, backgroundColor: LEVEL_ACCENT[lvl] }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <button
              onClick={() => setPhase('rules')}
              className="inline-flex items-center gap-2 bg-ink-primary text-parchment px-6 py-3 rounded-full text-sm font-semibold hover:bg-ink-secondary transition-colors"
            >
              <RotateCcw size={15} />
              {t.retake}
            </button>
            <button
              onClick={() => setPhase('intro')}
              className="inline-flex items-center gap-2 bg-transparent border border-[rgba(0,59,70,0.15)] text-ink-secondary px-6 py-3 rounded-full text-sm font-semibold hover:bg-[rgba(0,59,70,0.04)] transition-colors"
            >
              {t.backToOverview}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Answer review */}
      <div className="bg-cream rounded-2xl border border-[rgba(0,59,70,0.1)] p-6 shadow-card">
        <h4 className="text-base font-semibold text-ink-primary mb-4">{t.review}</h4>
        <div className="divide-y divide-[rgba(0,59,70,0.06)]">
          {questions.map((q, i) => {
            const a = answers[i]
            const ok = a?.correct
            const skipped = a?.timedOut
            const loc = localize(q, lang)
            return (
              <div key={q.id} className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
                <span className="flex-shrink-0 mt-0.5">
                  {ok ? (
                    <CheckCircle2 size={18} className="text-[#5f8a6b]" />
                  ) : skipped ? (
                    <Timer size={18} className="text-[#b98a3e]" />
                  ) : (
                    <XCircle size={18} className="text-[#a8503f]" />
                  )}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${LEVEL_ACCENT[q.level]}18`, color: LEVEL_ACCENT[q.level] }}
                    >
                      {levelLabel(q.level)}
                    </span>
                    {skipped && (
                      <span className="text-[11px] text-[#8a6420] font-medium">{t.skippedTimedOut}</span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-ink-primary">{loc.question}</p>
                  {!ok && (
                    <p className="text-xs text-[#3f6049] mt-1">
                      {t.correctAnswer} {loc.options[q.correctIndex]}
                    </p>
                  )}
                  <p className="text-xs text-ink-tertiary mt-1 leading-relaxed">{loc.explanation}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Small presentational helpers                                       */
/* ------------------------------------------------------------------ */

function StatTile({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Trophy
  value: string
  label: string
}) {
  return (
    <div className="bg-cream rounded-xl border border-[rgba(0,59,70,0.1)] px-4 py-3 text-center shadow-card min-w-[92px]">
      <Icon size={15} className="text-accent-gold mx-auto mb-1" />
      <p className="text-xl font-bold text-ink-primary tabular-nums leading-none">{value}</p>
      <p className="text-[9px] font-medium uppercase tracking-wide text-ink-tertiary mt-1.5">{label}</p>
    </div>
  )
}

function ResultStat({ value, sub, label }: { value: string; sub?: string; label: string }) {
  return (
    <div>
      <p className="font-serif text-3xl text-ink-primary leading-none tabular-nums">
        {value}
        {sub && <span className="text-sm text-ink-tertiary font-sans ml-1">{sub}</span>}
      </p>
      <p className="text-[10px] uppercase tracking-wide text-ink-tertiary mt-2">{label}</p>
    </div>
  )
}
