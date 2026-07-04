'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  SEED_POSITIONS,
  SEED_ASSIGNMENTS,
  SEED_ROSTER,
  type OrgPosition,
  type OrgAssignment,
  type OrgTier,
  type RosterEmployee,
} from '@/data/org-chart'

let idCounter = 0
/** Deterministic-enough id for client-side optimistic inserts (no Date/random at module scope). */
function makeId(prefix: string): string {
  idCounter += 1
  return `${prefix}-${idCounter}-${idCounter * 2654435761 % 100000}`
}

interface OrgState {
  positions: OrgPosition[]
  assignments: OrgAssignment[]
  roster: RosterEmployee[]
  hydrated: boolean
  _setHydrated: () => void

  addAssignment: (
    positionId: string,
    payload: { employeeId?: string | null; customName?: string | null },
  ) => void
  removeAssignment: (assignmentId: string) => void
  addPosition: (input: {
    parentId: string | null
    title: string
    tier: OrgTier
    department?: string | null
  }) => string
  removePosition: (id: string) => void
  reorderChildren: (parentId: string, orderedIds: string[]) => void
  resetToSeed: () => void
}

const seed = () => ({
  positions: SEED_POSITIONS.map((p) => ({ ...p })),
  assignments: SEED_ASSIGNMENTS.map((a) => ({ ...a })),
  roster: SEED_ROSTER.map((r) => ({ ...r })),
})

export const useOrgStore = create<OrgState>()(
  persist(
    (set, get) => ({
      ...seed(),
      hydrated: false,
      _setHydrated: () => set({ hydrated: true }),

      addAssignment: (positionId, payload) => {
        const employeeId = payload.employeeId ?? null
        const customName = payload.customName?.trim() || null
        if (!employeeId && !customName) return
        // Avoid duplicate employee in the same position.
        const existing = get().assignments.find(
          (a) => a.positionId === positionId && employeeId && a.employeeId === employeeId,
        )
        if (existing) return
        const next: OrgAssignment = {
          id: makeId('asg'),
          positionId,
          employeeId,
          customName: employeeId ? null : customName,
        }
        set((s) => ({ assignments: [...s.assignments, next] }))
      },

      removeAssignment: (assignmentId) =>
        set((s) => ({
          assignments: s.assignments.filter((a) => a.id !== assignmentId),
        })),

      addPosition: (input) => {
        const siblings = get().positions.filter((p) => p.parentId === input.parentId)
        const sortOrder = siblings.reduce((m, p) => Math.max(m, p.sortOrder), -1) + 1
        const id = makeId(input.tier)
        const pos: OrgPosition = {
          id,
          title: input.title.trim() || 'Untitled',
          parentId: input.parentId,
          department: input.department ?? null,
          tier: input.tier,
          sortOrder,
        }
        set((s) => ({ positions: [...s.positions, pos] }))
        return id
      },

      removePosition: (id) => {
        // Collect the node + all descendants, then drop their assignments too.
        const all = get().positions
        const toRemove = new Set<string>([id])
        let grew = true
        while (grew) {
          grew = false
          for (const p of all) {
            if (p.parentId && toRemove.has(p.parentId) && !toRemove.has(p.id)) {
              toRemove.add(p.id)
              grew = true
            }
          }
        }
        set((s) => ({
          positions: s.positions.filter((p) => !toRemove.has(p.id)),
          assignments: s.assignments.filter((a) => !toRemove.has(a.positionId)),
        }))
      },

      reorderChildren: (parentId, orderedIds) =>
        set((s) => ({
          positions: s.positions.map((p) =>
            p.parentId === parentId && orderedIds.includes(p.id)
              ? { ...p, sortOrder: orderedIds.indexOf(p.id) }
              : p,
          ),
        })),

      resetToSeed: () => set({ ...seed() }),
    }),
    {
      name: 'magppie-org-chart-v1',
      // Roster comes from code (mirrors profiles); only persist editable structure.
      partialize: (s) => ({ positions: s.positions, assignments: s.assignments }),
      onRehydrateStorage: () => (state) => {
        state?._setHydrated()
      },
    },
  ),
)
