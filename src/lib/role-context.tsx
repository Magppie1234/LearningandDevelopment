'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuthOptional } from '@/lib/auth'
import {
  can,
  identityFor,
  scopeLabel,
  visibleWorkforce,
  type Permission,
  type Role,
} from '@/lib/roles'
import { DEMO_USER_ID, memberById, type WorkforceMember } from '@/data/workforce'

/**
 * The acting identity: who the viewer is, what role they hold, and therefore
 * which people their dashboards may cover.
 *
 * In a live deployment the role comes from the HRMS import keyed on the
 * authenticated user, and `setRole` does not exist. Until that import runs the
 * portal ships a **role switcher** so each experience can be reviewed against
 * the same dataset — `isSimulated` is true in that mode and the shell says so
 * on screen, because a dashboard that silently shows someone else's scope is
 * worse than one that shows nothing.
 */

interface RoleState {
  role: Role
  setRole: (r: Role) => void
  /** The workforce record the viewer is acting as. */
  member: WorkforceMember | undefined
  /** People this viewer is authorised to see. */
  cohort: WorkforceMember[]
  scope: string
  can: (p: Permission) => boolean
  /** True while the role comes from the demo switcher, not from an HRMS record. */
  isSimulated: boolean
}

const RoleContext = createContext<RoleState | undefined>(undefined)

const STORAGE_KEY = 'magppie-ld-role'

function isRole(v: unknown): v is Role {
  return (
    v === 'employee' || v === 'manager' || v === 'hod' || v === 'ld_admin' || v === 'leadership'
  )
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const auth = useAuthOptional()
  // Always start at 'employee' so server and first client render agree; the
  // stored preference is applied in an effect to avoid a hydration mismatch.
  const [role, setRoleState] = useState<Role>('employee')

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (isRole(stored)) setRoleState(stored)
    } catch {
      /* storage unavailable (private mode) — the default role still works */
    }
  }, [])

  const setRole = useCallback((r: Role) => {
    setRoleState(r)
    try {
      window.localStorage.setItem(STORAGE_KEY, r)
    } catch {
      /* non-fatal */
    }
  }, [])

  const value = useMemo<RoleState>(() => {
    // A real session keeps its own identity; the demo session adopts the
    // representative member for the selected role.
    const member = auth?.isDemo === false ? memberById(DEMO_USER_ID) : identityFor(role)
    const viewerId = member?.id ?? DEMO_USER_ID
    return {
      role,
      setRole,
      member,
      cohort: visibleWorkforce(role, viewerId),
      scope: scopeLabel(role, viewerId),
      can: (p: Permission) => can(role, p),
      isSimulated: auth?.isDemo !== false,
    }
  }, [role, setRole, auth?.isDemo])

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}

export function useRole(): RoleState {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error('useRole must be used within a RoleProvider')
  return ctx
}

/** Non-throwing variant for components rendered outside the portal shell. */
export function useRoleOptional(): RoleState | null {
  return useContext(RoleContext) ?? null
}
