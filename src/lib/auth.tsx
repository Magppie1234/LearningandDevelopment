'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

type AuthState = {
  user: User
  /** True when `user` is the demo identity, not a real Supabase session. */
  isDemo: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

/**
 * Demo fallback identity. When no real Supabase session exists the portal
 * still works as this single user (all-demo mode predates real auth), so
 * every page keeps functioning for guests. Real sessions — established via
 * the login page's magic-link flow — take precedence the moment they exist,
 * which is what activates the Supabase-backed learning dashboard (RLS keys
 * off auth.uid()).
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
  const [sessionUser, setSessionUser] = useState<User | null>(null)

  useEffect(() => {
    let alive = true
    supabase.auth.getSession().then(({ data }) => {
      if (alive) setSessionUser(data.session?.user ?? null)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser(session?.user ?? null)
    })
    return () => {
      alive = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const value: AuthState = {
    user: sessionUser ?? PORTAL_USER,
    isDemo: sessionUser === null,
    signOut: async () => {
      await supabase.auth.signOut()
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
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
