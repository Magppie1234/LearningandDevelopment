'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { readinessBankFor, type ReadinessBank } from '@/data/readiness-banks'

/**
 * Readiness Check state (demo mode) — mirrors ld.readiness_responses. Stores
 * per-academy status, the latest Growth Map, and an attempt history for the
 * L&D admin/manager reporting view (team-wide gaps, not individual shaming).
 */

export interface GrowthArea {
  competencyTag: string
  confidence: number // 0..1 (1 = strong)
  recommendedLesson: string | null
  lessonLabel: string
  managerFlag: boolean // invert-scoring items trending high (e.g. timeline integrity)
}

export interface ReadinessResult {
  strengths: GrowthArea[]
  focus: GrowthArea[]
  takenAt: string
}

interface AcademyReadiness {
  status: 'not_taken' | 'dismissed' | 'completed'
  latest: ReadinessResult | null
  attempts: number
}

interface ReadinessState {
  byAcademy: Record<string, AcademyReadiness>
  get: (slug: string) => AcademyReadiness
  dismiss: (slug: string) => void
  reopen: (slug: string) => void
  submit: (slug: string, answers: Record<string, string>) => void
}

const EMPTY: AcademyReadiness = { status: 'not_taken', latest: null, attempts: 0 }

/** Per-question confidence 0..1 from the raw answer. */
function confidenceOf(bank: ReadinessBank, questionId: string, value: string): number {
  const q = bank.questions.find((x) => x.id === questionId)
  if (!q) return 0.5
  if (q.type === 'likert') {
    const v = Number(value) || 3
    const norm = v / 5
    return q.invertScoring ? 1 - norm + 0.2 : norm // invert: low answer = high confidence
  }
  // multiple_choice: ideal answer = strong, otherwise weak
  const opt = q.options?.find((o) => o.label === value)
  return opt?.isIdeal ? 1 : 0.25
}

function computeResult(slug: string, answers: Record<string, string>): ReadinessResult {
  const bank = readinessBankFor(slug)!
  const scored = bank.questions.map((q) => {
    const conf = Math.max(0, Math.min(1, confidenceOf(bank, q.id, answers[q.id] ?? '')))
    const lesson = bank.lessonMap.find((l) => l.competencyTag === q.competencyTag)
    const rawHigh = q.type === 'likert' ? (Number(answers[q.id]) || 0) >= 4 : false
    return {
      competencyTag: q.competencyTag,
      confidence: conf,
      recommendedLesson: lesson?.recommendedLesson ?? null,
      lessonLabel: lesson?.lessonLabel ?? q.competencyTag,
      // manager flag = invert-scoring item answered high (the behaviour we watch)
      managerFlag: Boolean(q.invertScoring && rawHigh),
    }
  })

  const sorted = [...scored].sort((a, b) => b.confidence - a.confidence)
  const strengths = sorted.filter((s) => s.confidence >= 0.6).slice(0, 3)
  // focus = lowest confidence, up to 2; always surface a flagged item even if it
  // isn't the very lowest, so a manager-watch behaviour never hides.
  const focusPool = sorted.filter((s) => s.confidence <= 0.5 || s.managerFlag)
  const focus = focusPool.slice(-2).reverse().slice(0, 2)

  return { strengths, focus, takenAt: new Date().toISOString() }
}

export const useReadiness = create<ReadinessState>()(
  persist(
    (set, getState) => ({
      byAcademy: {},
      get: (slug) => getState().byAcademy[slug] ?? EMPTY,
      dismiss: (slug) =>
        set((s) => ({
          byAcademy: { ...s.byAcademy, [slug]: { ...(s.byAcademy[slug] ?? EMPTY), status: 'dismissed' } },
        })),
      reopen: (slug) =>
        set((s) => ({
          byAcademy: { ...s.byAcademy, [slug]: { ...(s.byAcademy[slug] ?? EMPTY), status: 'not_taken' } },
        })),
      submit: (slug, answers) =>
        set((s) => {
          const prev = s.byAcademy[slug] ?? EMPTY
          return {
            byAcademy: {
              ...s.byAcademy,
              [slug]: {
                status: 'completed',
                latest: computeResult(slug, answers),
                attempts: prev.attempts + 1,
              },
            },
          }
        }),
    }),
    { name: 'magppie-readiness-v1' },
  ),
)
