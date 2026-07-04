'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BD_MODULES } from '@/data/bd-academy'

/**
 * Business Development academy progress (demo mode). A module is only
 * "complete" once its quiz is passed at >= 80% — viewing the content alone
 * doesn't complete it. Persists locally; live mode would read/write
 * enrollments + quiz_attempts in Supabase.
 */

export interface ModuleResult {
  viewed: boolean
  bestScore: number // correct answers, best attempt
  total: number
  passed: boolean
  attempts: number
}

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
