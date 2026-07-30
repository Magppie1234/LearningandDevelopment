'use client'

import { useEffect, useState } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Manager coaching-queue actions (L&D OS spec §13B: "direct assign, coach and
 * observe actions"; §20 failed-assessment and incident workflows).
 *
 * A manager's action against a capability gap is recorded here so the hub
 * reflects it — a requested observation shows as requested, and the queue
 * shrinks. In demo mode it persists locally; live mode writes the same rows to
 * the practical-evaluation, coaching and notification tables. It deliberately
 * does NOT change any score or proficiency: only an assessor closes a
 * practical, and no manager action can silently edit assessment history (§19).
 */

export type CoachingActionKind =
  /** Ask an assessor to observe the task and score the rubric. */
  | 'observation_requested'
  /** A coaching conversation happened; note the topic. */
  | 'coaching_logged'
  /** Remedial learning assigned before a retake (§11 failure workflow). */
  | 'remediation_assigned'
  /** First-time learning assigned — nothing has been attempted yet. */
  | 'learning_assigned'
  /** Chase evidence that is sitting with an assessor. */
  | 'assessor_chased'

export const ACTION_LABEL: Record<CoachingActionKind, string> = {
  observation_requested: 'Observation requested',
  coaching_logged: 'Coaching logged',
  remediation_assigned: 'Remediation assigned',
  learning_assigned: 'Learning assigned',
  assessor_chased: 'Assessor chased',
}

export interface CoachingAction {
  id: string
  memberId: string
  competencyId: string
  kind: CoachingActionKind
  /** ISO timestamp — set at click time on the client only. */
  at: string
  note?: string
  /** Who the action is now waiting on. */
  waitingOn: 'Assessor' | 'Learner' | 'Reporting Manager'
}

interface CoachingQueueState {
  actions: CoachingAction[]
  record: (input: Omit<CoachingAction, 'id' | 'at'>) => void
  undo: (id: string) => void
  /** Latest action for a member+competency, or undefined. */
  latestFor: (memberId: string, competencyId: string) => CoachingAction | undefined
  clearAll: () => void
}

let seq = 0

export const useCoachingQueue = create<CoachingQueueState>()(
  persist(
    (set, get) => ({
      actions: [],
      record: (input) => {
        seq += 1
        const action: CoachingAction = {
          ...input,
          id: `ca-${Date.now().toString(36)}-${seq}`,
          at: new Date().toISOString(),
        }
        set((s) => ({ actions: [action, ...s.actions] }))
      },
      undo: (id) => set((s) => ({ actions: s.actions.filter((a) => a.id !== id) })),
      latestFor: (memberId, competencyId) =>
        get().actions.find((a) => a.memberId === memberId && a.competencyId === competencyId),
      clearAll: () => set({ actions: [] }),
    }),
    { name: 'magppie-coaching-queue-v1' },
  ),
)

/**
 * True once the persisted store has rehydrated in the browser. Action state is
 * rendered only after this flips, so the server HTML and the first client
 * render agree.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])
  return hydrated
}
