'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SALES_MODULES } from '@/data/sales-academy'
import {
  applyAttempt,
  applyView,
  type CertifiedModuleResult,
} from '@/lib/module-certification'

/**
 * Sales Academy progress (demo mode) — mirrors bd-progress-store. A module is
 * only "complete" once its quiz is passed at SALES_PASS_THRESHOLD (80%);
 * viewing content alone doesn't complete it. Persists locally; live mode
 * writes module_attempts / module_progress in Supabase through the same quiz
 * submit path.
 *
 * Certificate rule is shared with BD via lib/module-certification.ts.
 */

export type SalesModuleResult = CertifiedModuleResult

interface SalesProgressState {
  results: Record<string, SalesModuleResult>
  markViewed: (moduleId: string) => void
  recordAttempt: (moduleId: string, correct: number, total: number, passed: boolean) => void
  completedCount: () => number
  overallPct: () => number
}

export const useSalesProgress = create<SalesProgressState>()(
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
        SALES_MODULES.filter((m) => get().results[m.id]?.passed).length,
      overallPct: () =>
        Math.round(
          (SALES_MODULES.filter((m) => get().results[m.id]?.passed).length /
            SALES_MODULES.length) *
            100,
        ),
    }),
    { name: 'magppie-sales-progress-v1' },
  ),
)
