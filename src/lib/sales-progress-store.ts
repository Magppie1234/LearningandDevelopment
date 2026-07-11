'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SALES_MODULES } from '@/data/sales-academy'

/**
 * Sales Academy progress (demo mode) — mirrors bd-progress-store. A module is
 * only "complete" once its quiz is passed at >= 80%; viewing content alone
 * doesn't complete it. Persists locally; live mode writes module_attempts /
 * module_progress in Supabase through the same quiz submit path.
 */

export interface SalesModuleResult {
  viewed: boolean
  bestScore: number // correct answers, best attempt
  total: number
  passed: boolean
  attempts: number
}

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
          results: {
            ...s.results,
            [moduleId]: {
              viewed: true,
              bestScore: s.results[moduleId]?.bestScore ?? 0,
              total: s.results[moduleId]?.total ?? 0,
              passed: s.results[moduleId]?.passed ?? false,
              attempts: s.results[moduleId]?.attempts ?? 0,
            },
          },
        })),
      recordAttempt: (moduleId, correct, total, passed) =>
        set((s) => {
          const prev = s.results[moduleId]
          return {
            results: {
              ...s.results,
              [moduleId]: {
                viewed: true,
                bestScore: Math.max(prev?.bestScore ?? 0, correct),
                total,
                passed: (prev?.passed ?? false) || passed,
                attempts: (prev?.attempts ?? 0) + 1,
              },
            },
          }
        }),
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
