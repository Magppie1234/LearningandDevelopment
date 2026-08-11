'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BD_MODULES } from '@/data/bd-academy'
import {
  applyAttempt,
  applyView,
  type CertifiedModuleResult,
} from '@/lib/module-certification'

/**
 * Business Development Executive progress (demo mode). A module is only
 * "complete" once its quiz is passed at BD_PASS_THRESHOLD (80%) — viewing the
 * content alone doesn't complete it. Persists locally; live mode would
 * read/write enrollments + quiz_attempts in Supabase.
 *
 * The certificate rule lives in lib/module-certification.ts so BD and Sales
 * cannot drift apart: the first PASSING attempt is certified permanently, and
 * later retakes are counted as activity without touching it.
 */

export type ModuleResult = CertifiedModuleResult

interface BdProgressState {
  results: Record<string, ModuleResult>
  markViewed: (moduleId: string) => void
  recordAttempt: (moduleId: string, correct: number, total: number, passed: boolean) => void
  completedCount: () => number
  overallPct: () => number
}

export const useBdProgress = create<BdProgressState>()(
  persist(
    (set, get) => ({
      results: {},
      markViewed: (moduleId) =>
        set((s) => ({
          results: { ...s.results, [moduleId]: applyView(s.results[moduleId]) },
        })),
      recordAttempt: (moduleId, correct, total, passed) =>
        set((s) => ({
          results: {
            ...s.results,
            [moduleId]: applyAttempt(s.results[moduleId], { correct, total, passed }),
          },
        })),
      completedCount: () =>
        BD_MODULES.filter((m) => get().results[m.id]?.passed).length,
      overallPct: () =>
        Math.round(
          (BD_MODULES.filter((m) => get().results[m.id]?.passed).length /
            BD_MODULES.length) *
            100,
        ),
    }),
    { name: 'magppie-bd-progress-v1' },
  ),
)
