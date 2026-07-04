'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BD_MODULES, BD_QUIZ, type BdQuizQuestion } from '@/data/bd-academy'

/**
 * New-joiner diagnostic (§2 of the visuals-expansion prompt): a one-time,
 * 10-question baseline check — one question per module — taken when an
 * employee first lands in the BD academy. NOT pass/fail and NOT a gate:
 * the output is a per-module breakdown so onboarding can focus on actual
 * gaps. Module access is never blocked by this.
 *
 * Question sourcing: REUSED one question per module from the existing
 * approved 30-question bank (flagged in the build notes) — no new questions
 * were written, so nothing here is un-reviewed content. The picks favour
 * each module's most representative fact/behaviour.
 */

// One question id per module, in module order (bd-q1..30 are grouped 3-per-module).
export const DIAGNOSTIC_QUESTION_IDS = [
  'bd-q1', // m1 — the company-story order rule
  'bd-q5', // m2 — 1,300°C firing temperature
  'bd-q8', // m3 — the 30-day water test
  'bd-q10', // m4 — the KBIS 2026 award
  'bd-q14', // m5 — confirm alignment before revealing pricing
  'bd-q16', // m6 — the "too expensive" reframe
  'bd-q21', // m7 — engineered vs natural stone
  'bd-q22', // m8 — the 50/40/10 payment schedule
  'bd-q26', // m9 — the "I don't know" replacement
  'bd-q28', // m10 — what triggers a human handoff
] as const

export function diagnosticQuestions(): BdQuizQuestion[] {
  return DIAGNOSTIC_QUESTION_IDS.map((id) => BD_QUIZ.find((q) => q.id === id)).filter(
    (q): q is BdQuizQuestion => Boolean(q),
  )
}

export interface DiagnosticModuleResult {
  moduleId: string
  moduleNumber: number
  moduleTitle: string
  competency: string
  correct: boolean
}

interface BdDiagnosticState {
  /** not_taken → prompt shows; dismissed → prompt hidden but retakeable; completed → results stored */
  status: 'not_taken' | 'dismissed' | 'completed'
  results: DiagnosticModuleResult[]
  takenAt: string | null
  dismiss: () => void
  reopen: () => void
  complete: (answers: Record<string, number>) => void
}

export const useBdDiagnostic = create<BdDiagnosticState>()(
  persist(
    (set) => ({
      status: 'not_taken',
      results: [],
      takenAt: null,
      dismiss: () => set({ status: 'dismissed' }),
      reopen: () => set({ status: 'not_taken' }),
      complete: (answers) => {
        const results: DiagnosticModuleResult[] = diagnosticQuestions().map((q) => {
          const mod = BD_MODULES.find((m) => m.id === q.moduleId)
          return {
            moduleId: q.moduleId,
            moduleNumber: mod?.number ?? 0,
            moduleTitle: mod?.title ?? q.moduleId,
            competency: q.competency,
            correct: answers[q.id] === q.correctIndex,
          }
        })
        set({ status: 'completed', results, takenAt: new Date().toISOString() })
      },
    }),
    { name: 'magppie-bd-diagnostic-v1' },
  ),
)
