'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { QuizLevel, Language } from '@/data/bde-quiz'
import { getMonthIndex } from '@/data/bde-quiz'

/**
 * BDE Monthly Quiz — attempt tracking, scoring, language preference, and a
 * monthly leaderboard.
 *
 * Persists to localStorage (demo mode, mirroring the other Magppie stores such
 * as magppie-admin-content-v1). In a real deployment these attempts would post
 * to Supabase (quiz_attempts / quiz_answers) — the shape here maps 1:1.
 */

export type QuizScope = 'full' | QuizLevel

export interface AnsweredQuestion {
  questionId: string
  level: QuizLevel
  /** The chosen option index, or -1 if the question timed out unanswered. */
  selectedIndex: number
  correct: boolean
  /** True when the timer expired before the BDE submitted an answer. */
  timedOut?: boolean
  /** Seconds spent on the question (for avg-response-time stats). */
  timeSpent?: number
}

export interface QuizAttempt {
  id: string
  monthId: string
  monthIndex: number
  scope: QuizScope
  completedAt: string
  correctCount: number
  totalQuestions: number
  /** Total score = basePoints + bonusPoints (this is what the leaderboard ranks on). */
  score: number
  /** Base points cap only (e.g. 300 for the full monthly challenge) — bonuses are on top. */
  maxScore: number
  /** Points from correct answers at their difficulty's base value. */
  basePoints?: number
  /** Speed + streak bonus points earned this attempt. */
  bonusPoints?: number
  byLevel: Record<QuizLevel, { correct: number; total: number }>
  answers: AnsweredQuestion[]
}

interface QuizState {
  attempts: QuizAttempt[]
  language: Language
  setLanguage: (language: Language) => void
  recordAttempt: (attempt: Omit<QuizAttempt, 'id'>) => void
  reset: () => void
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set) => ({
      attempts: [],
      language: 'en',
      setLanguage: (language) => set({ language }),
      recordAttempt: (attempt) =>
        set((s) => ({
          attempts: [{ ...attempt, id: `qa-${Date.now()}` }, ...s.attempts],
        })),
      reset: () => set({ attempts: [] }),
    }),
    { name: 'magppie-bde-quiz-v2' },
  ),
)

/* ────────────────────────────────────────────────────────────────────────
 * Selectors / helpers (pure — usable outside React)
 * ──────────────────────────────────────────────────────────────────────── */

/** The user's best FULL-challenge attempt for a given month (drives leaderboard). */
export function bestFullAttempt(
  attempts: QuizAttempt[],
  monthId: string,
): QuizAttempt | null {
  return (
    attempts
      .filter((a) => a.monthId === monthId && a.scope === 'full')
      .sort((a, b) => b.score - a.score)[0] ?? null
  )
}

/** Has the user completed the full monthly challenge this month? */
export function hasCompletedMonth(attempts: QuizAttempt[], monthId: string): boolean {
  return bestFullAttempt(attempts, monthId) !== null
}

/**
 * Consecutive-month streak of completed Full Challenges, counting back from the
 * current month (or last month, if this month isn't done yet).
 */
export function completionStreak(
  attempts: QuizAttempt[],
  currentMonthIndex: number = getMonthIndex(),
): number {
  const doneMonths = new Set(
    attempts.filter((a) => a.scope === 'full').map((a) => a.monthIndex),
  )
  let streak = 0
  let cursor = doneMonths.has(currentMonthIndex)
    ? currentMonthIndex
    : currentMonthIndex - 1
  while (doneMonths.has(cursor)) {
    streak++
    cursor--
  }
  return streak
}

/** All-time totals across every recorded attempt. */
export function lifetimeStats(attempts: QuizAttempt[]): {
  attemptsCount: number
  totalCorrect: number
  totalAnswered: number
  accuracy: number
  totalPoints: number
} {
  const totalCorrect = attempts.reduce((s, a) => s + a.correctCount, 0)
  const totalAnswered = attempts.reduce((s, a) => s + a.totalQuestions, 0)
  const totalPoints = attempts.reduce((s, a) => s + a.score, 0)
  return {
    attemptsCount: attempts.length,
    totalCorrect,
    totalAnswered,
    accuracy: totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0,
    totalPoints,
  }
}

/* ────────────────────────────────────────────────────────────────────────
 * Monthly leaderboard
 *
 * Peer scores are seeded deterministically from the monthIndex so the board is
 * stable within a month but refreshes every month. The signed-in user's best
 * full-challenge score is merged in and ranked live.
 * ──────────────────────────────────────────────────────────────────────── */

export interface LeaderboardRow {
  name: string
  initials: string
  points: number
  /** Accuracy (0–100) on Hard-tier questions — first tie-break below points. */
  hardAccuracy: number
  isCurrentUser: boolean
  rank: number
}

const PEER_BDES: { name: string; initials: string; base: number }[] = [
  { name: 'Aisha Kumar', initials: 'AK', base: 265 },
  { name: 'Rohan Mehta', initials: 'RM', base: 245 },
  { name: 'Sneha Iyer', initials: 'SI', base: 285 },
  { name: 'Vikram Rao', initials: 'VR', base: 220 },
  { name: 'Priya Nair', initials: 'PN', base: 255 },
  { name: 'Arjun Shah', initials: 'AS', base: 210 },
  { name: 'Neha Gupta', initials: 'NG', base: 280 },
]

// Small deterministic pseudo-random from an integer seed (mulberry32-style).
function seeded(seed: number): number {
  let t = (seed + 0x6d2b79f5) >>> 0
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

export function monthlyLeaderboard(
  monthIndex: number,
  currentUser: { name: string; initials: string; points: number; hardAccuracy?: number },
): LeaderboardRow[] {
  const peers = PEER_BDES.map((p, i) => {
    // Vary each peer's score by ±40 based on month + index, clamped to [0, 300].
    const jitter = Math.round((seeded(monthIndex * 31 + i) - 0.5) * 80)
    const points = Math.max(0, Math.min(300, p.base + jitter))
    // Synthetic Hard-tier accuracy (50–100%), deterministic per month + peer.
    const hardAccuracy = Math.round(50 + seeded(monthIndex * 53 + i * 7) * 50)
    return { name: p.name, initials: p.initials, points, hardAccuracy, isCurrentUser: false }
  })

  const rows = [
    ...peers,
    {
      name: currentUser.name,
      initials: currentUser.initials,
      points: currentUser.points,
      hardAccuracy: currentUser.hardAccuracy ?? 0,
      isCurrentUser: true,
    },
  ]

  // Rank by total points; ties broken by Hard-tier accuracy (rewards depth over
  // volume), then finally by keeping the signed-in user visually first among
  // exact ties so their row is easy to find.
  return rows
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.hardAccuracy - a.hardAccuracy ||
        (a.isCurrentUser ? -1 : 1),
    )
    .map((r, i) => ({ ...r, rank: i + 1 }))
}
