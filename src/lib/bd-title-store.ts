'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Admin-editable BD course titles (§1). Titles live in bd-academy.ts as the
 * baseline, but a course can be renamed from the admin/content interface with
 * NO code change — an override is stored here keyed by module id and layered
 * over the baseline at read time. Clearing an override reverts to the baseline
 * title. In production this maps to academy_modules.title (migration 0018);
 * in demo mode it persists to localStorage.
 */

interface BdTitleState {
  /** moduleId -> overridden title. Absent means "use the baseline title". */
  overrides: Record<string, string>
  setTitle: (moduleId: string, title: string) => void
  clearTitle: (moduleId: string) => void
}

export const useBdTitles = create<BdTitleState>()(
  persist(
    (set) => ({
      overrides: {},
      setTitle: (moduleId, title) =>
        set((s) => {
          const trimmed = title.trim()
          if (!trimmed) {
            // Empty = revert to baseline rather than store a blank title.
            const next = { ...s.overrides }
            delete next[moduleId]
            return { overrides: next }
          }
          return { overrides: { ...s.overrides, [moduleId]: trimmed } }
        }),
      clearTitle: (moduleId) =>
        set((s) => {
          const next = { ...s.overrides }
          delete next[moduleId]
          return { overrides: next }
        }),
    }),
    { name: 'magppie-bd-titles-v1' },
  ),
)

/** Resolve the effective title: admin override if present, else baseline. */
export function bdEffectiveTitle(
  overrides: Record<string, string>,
  moduleId: string,
  baseline: string,
): string {
  return overrides[moduleId] ?? baseline
}
