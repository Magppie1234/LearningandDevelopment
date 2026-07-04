'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { isAllowedEmail } from './allowed-domains'

type AuthState = {
  loading: boolean
  session: Session | null
  user: User | null
  domainError: boolean
  isDemo: boolean
  signInWithGoogle: () => Promise<void>
  signInWithDemo: () => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

/**
 * Dev-only demo session. Lets anyone explore the full portal locally without a
 * Google account — pages render from seed/mock data, so no real backend is
 * needed. Guarded by import.meta.env.DEV at every call site and never touches
 * Supabase, so the real OAuth + RLS enforcement is completely unaffected.
 */
const DEMO_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'demo@mymagppie.com',
  email_confirmed_at: '2026-01-01T00:00:00.000Z',
  phone: '',
  app_metadata: { provider: 'demo', providers: ['demo'] },
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

const DEMO_SESSION = {
  access_token: 'demo-access-token',
  refresh_token: 'demo-refresh-token',
  expires_in: 3600,
  expires_at: 9999999999,
  token_type: 'bearer',
  user: DEMO_USER,
} as unknown as Session

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [domainError, setDomainError] = useState(false)
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    let active = true
    // Demo mode short-circuits Supabase entirely (dev only).
    if (isDemo) {
      setLoading(false)
      return () => {
        active = false
      }
    }

    async function handle(next: Session | null) {
      if (!active) return
      // Reject (and sign out) any session whose email isn't a Magppie domain.
      if (next?.user && !isAllowedEmail(next.user.email)) {
        setDomainError(true)
        setSession(null)
        await supabase.auth.signOut()
        if (active) setLoading(false)
        return
      }
      setDomainError(false)
      setSession(next)
      setLoading(false)
    }

    supabase.auth.getSession().then(({ data }) => handle(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) =>
      handle(next),
    )

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [isDemo])

  async function signInWithGoogle() {
    setDomainError(false)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { prompt: 'select_account' },
      },
    })
  }

  function signInWithDemo() {
    if (process.env.NODE_ENV === 'production') return
    setDomainError(false)
    setSession(DEMO_SESSION)
    setIsDemo(true)
    setLoading(false)
  }

  async function signOut() {
    if (isDemo) {
      setIsDemo(false)
      setSession(null)
      return
    }
    await supabase.auth.signOut()
    setSession(null)
  }

  return (
    <AuthContext.Provider
      value={{
        loading,
        session,
        user: session?.user ?? null,
        domainError,
        isDemo,
        signInWithGoogle,
        signInWithDemo,
        signOut,
      }}
    >
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
