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

/**
 * Where the numbers on screen come from.
 *
 * The portal used to answer this implicitly: it always rendered the seeded
 * workforce and apologised for it in a permanent banner at the top of every
 * page. That is the wrong default twice over — a banner is not a control, and
 * "everything you are looking at is fake" is not something a product should
 * say on its own home page for the rest of its life.
 *
 * So the source is now explicit and it is a real setting:
 *
 *   live    the signed-in employee's own records. THE DEFAULT.
 *   sample  the labelled demo cohort, for QA and for reviewing a role you
 *           are not. Opt-in, never assumed.
 *
 * When `live` is selected but no backend is reachable, pages show an empty
 * state that names what is missing — they do NOT silently fall back to
 * `sample`, because a silent fallback is exactly how demo numbers end up in
 * a board pack.
 */

export type DataSource = 'live' | 'sample'

interface DataSourceState {
  source: DataSource
  setSource: (s: DataSource) => void
  /**
   * True when live data could actually be served: a Supabase project is
   * configured AND the viewer holds a real session. False in local demo runs.
   */
  liveAvailable: boolean
  /** Why live is unavailable — rendered by the empty state. */
  liveBlockedReason: 'unconfigured' | 'unauthenticated' | null
  /** Convenience: the viewer is looking at labelled sample records. */
  isSample: boolean
  /**
   * False until the stored preference has been read on the client.
   *
   * The provider has to start from a fixed value so server and first client
   * render agree, which means the real preference only lands one tick later.
   * Pages that switch layout on `source` must wait for this, or a viewer who
   * chose sample data sees the live-mode empty state flash first.
   */
  ready: boolean
}

const Ctx = createContext<DataSourceState | undefined>(undefined)

const STORAGE_KEY = 'magppie-ld-data-source'

/**
 * Whether a Supabase project is wired at all. `supabase.ts` substitutes
 * placeholder credentials when the env vars are absent so the client never
 * throws at import time, which means the client object existing proves
 * nothing — the env vars have to be checked directly.
 */
export const SUPABASE_CONFIGURED =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export function DataSourceProvider({ children }: { children: ReactNode }) {
  const auth = useAuthOptional()
  // Start at 'live' on both server and first client render so hydration
  // matches; the stored preference is applied in an effect.
  const [source, setSourceState] = useState<DataSource>('live')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored === 'live' || stored === 'sample') setSourceState(stored)
    } catch {
      /* storage unavailable (private mode) — the default still works */
    }
    setReady(true)
  }, [])

  const setSource = useCallback((s: DataSource) => {
    setSourceState(s)
    try {
      window.localStorage.setItem(STORAGE_KEY, s)
    } catch {
      /* non-fatal */
    }
  }, [])

  const value = useMemo<DataSourceState>(() => {
    const authed = auth?.isDemo === false
    const liveBlockedReason = !SUPABASE_CONFIGURED
      ? ('unconfigured' as const)
      : !authed
        ? ('unauthenticated' as const)
        : null
    return {
      source,
      setSource,
      liveAvailable: liveBlockedReason === null,
      liveBlockedReason,
      isSample: source === 'sample',
      ready,
    }
  }, [source, setSource, auth?.isDemo, ready])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useDataSource(): DataSourceState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useDataSource must be used within a DataSourceProvider')
  return ctx
}

/** Non-throwing variant for components rendered outside the portal shell. */
export function useDataSourceOptional(): DataSourceState | null {
  return useContext(Ctx) ?? null
}
