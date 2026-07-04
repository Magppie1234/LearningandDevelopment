'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'

type AuthState = {
  user: User
}

const AuthContext = createContext<AuthState | undefined>(undefined)

/**
 * The portal has no login — every visitor is this single identity. Modeled
 * as a Supabase User so components reading user_metadata/email need no
 * special-casing beyond their existing null-safe fallback chains.
 */
const PORTAL_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'demo@mymagppie.com',
  email_confirmed_at: '2026-01-01T00:00:00.000Z',
  phone: '',
  app_metadata: { provider: 'none', providers: [] },
  user_metadata: {
    full_name: 'Aarav Sharma',
    name: 'Aarav Sharma',
    email: 'demo@mymagppie.com',
    avatar_url: '',
  },
  identities: [],
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
} as unknown as User

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider value={{ user: PORTAL_USER }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

/**
 * Non-throwing variant. Returns null when no AuthProvider is present — used by
 * components under src/pages/, which Next also exposes as standalone (legacy
 * Pages Router) routes that get prerendered without the portal's AuthProvider.
 */
export function useAuthOptional(): AuthState | null {
  return useContext(AuthContext) ?? null
}
