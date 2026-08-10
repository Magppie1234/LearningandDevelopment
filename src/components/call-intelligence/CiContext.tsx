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
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  comparisonLabel as comparisonLabelOf,
  defaultFilters,
  filtersToQuery,
  periodLabel as periodLabelOf,
  queryToFilters,
} from '@/lib/call-intelligence/filters'
import { loadDataset, type Dataset } from '@/lib/call-intelligence/service'
import { ROLE_BY_ID, type RoleId, type Viewer } from '@/lib/call-intelligence/rbac'
import type { CallFilters, SavedView } from '@/lib/call-intelligence/types'
import { EMPLOYEE_BY_ID } from '@/data/call-intelligence/taxonomy'

/**
 * The one place Call Intelligence holds state.
 *
 * Two deliberate decisions:
 *
 * 1. **The URL is the filter state, not a mirror of it.** `filters` is derived
 *    from the query string on every render, and changing a filter is a
 *    `router.replace`. That makes every drill-down a plain link — shareable,
 *    back-button-safe, and identical whether it was reached from the Executive
 *    Overview or typed by hand. A separate `useState` copy would need
 *    reconciliation, and reconciliation is where filter bars go to die.
 *
 * 2. **The dataset is loaded once for the whole section.** Ten pages calling
 *    `loadDataset` themselves would rebuild 420 calls, 599 actions and 160
 *    alerts ten times over, and — worse — could disagree with each other. One
 *    load in the layout, shared by context.
 */

interface CiState {
  filters: CallFilters
  setFilters: (next: CallFilters) => void
  patchFilters: (patch: Partial<CallFilters>) => void
  resetFilters: () => void

  viewer: Viewer
  setViewerRole: (roleId: RoleId) => void

  data: Dataset | null
  loading: boolean
  error: string | null
  reload: () => void

  /** "2026-07-07 → 2026-08-03" */
  periodLabel: string
  /** "2026-06-09 → 2026-07-06" — never implied (§15). */
  comparisonLabel: string

  savedViews: SavedView[]
  saveView: (name: string) => void
  applyView: (view: SavedView) => void
  deleteView: (id: string) => void

  /** Build a link to another CI page carrying the current filters. */
  hrefWithFilters: (path: string, patch?: Partial<CallFilters>) => string
}

const CiContext = createContext<CiState | null>(null)

const VIEWS_KEY = 'sunroof.ci.savedViews'
const ROLE_KEY = 'sunroof.ci.viewerRole'

/**
 * Demo viewer identities. `sales_manager` and `agent` are scoped to a real team
 * and employee from the taxonomy so switching role visibly changes the row set
 * rather than just the page list.
 */
const VIEWER_FOR: Record<RoleId, Omit<Viewer, 'roleId'>> = {
  business_head: { employeeId: null, teamId: null, name: 'Business Head (demo)' },
  sales_manager: { employeeId: null, teamId: 'team-north-sales', name: 'Sales Manager (demo)' },
  service_manager: { employeeId: null, teamId: 'team-service', name: 'Service Manager (demo)' },
  quality_analyst: { employeeId: null, teamId: null, name: 'Quality Analyst (demo)' },
  compliance_officer: { employeeId: null, teamId: null, name: 'Compliance Officer (demo)' },
  agent: { employeeId: 'emp-02', teamId: 'team-north-sales', name: 'Employee (demo)' },
}

function viewerFor(roleId: RoleId): Viewer {
  const base = VIEWER_FOR[roleId]
  const emp = base.employeeId ? EMPLOYEE_BY_ID[base.employeeId] : null
  return {
    roleId,
    employeeId: base.employeeId,
    teamId: emp?.teamId ?? base.teamId,
    name: emp?.name ?? base.name,
  }
}

export function CiProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname() ?? '/call-intelligence'
  const searchParams = useSearchParams()
  const query = searchParams?.toString() ?? ''

  // The URL is the source of truth. Nothing to reconcile.
  const filters = useMemo(() => queryToFilters(query), [query])

  const [roleId, setRoleId] = useState<RoleId>('business_head')
  const [savedViews, setSavedViews] = useState<SavedView[]>([])
  const [data, setData] = useState<Dataset | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)

  // Restore the demo role and saved views. localStorage is read in an effect
  // rather than during render so the server and first client render agree.
  useEffect(() => {
    try {
      const storedRole = window.localStorage.getItem(ROLE_KEY)
      if (storedRole && storedRole in ROLE_BY_ID) setRoleId(storedRole as RoleId)
      const storedViews = window.localStorage.getItem(VIEWS_KEY)
      if (storedViews) setSavedViews(JSON.parse(storedViews) as SavedView[])
    } catch {
      // A blocked or corrupt localStorage is not worth failing the page over.
    }
  }, [])

  const viewer = useMemo(() => viewerFor(roleId), [roleId])

  const setViewerRole = useCallback((next: RoleId) => {
    setRoleId(next)
    try {
      window.localStorage.setItem(ROLE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  const setFilters = useCallback(
    (next: CallFilters) => {
      const qs = filtersToQuery(next)
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router],
  )

  const patchFilters = useCallback(
    (patch: Partial<CallFilters>) => setFilters({ ...filters, ...patch }),
    [filters, setFilters],
  )

  const resetFilters = useCallback(() => setFilters(defaultFilters()), [setFilters])

  const reload = useCallback(() => setNonce((n) => n + 1), [])

  // One load for the whole section, re-run when the filters or the viewer
  // change. `cancelled` guards the classic out-of-order-resolution bug: a slow
  // earlier query landing after a fast later one and overwriting it.
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    loadDataset(filters, viewer)
      .then((ds) => {
        if (!cancelled) setData(ds)
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [filters, viewer, nonce])

  const persistViews = useCallback((next: SavedView[]) => {
    setSavedViews(next)
    try {
      window.localStorage.setItem(VIEWS_KEY, JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }, [])

  const saveView = useCallback(
    (name: string) => {
      const view: SavedView = {
        id: `view-${Date.now().toString(36)}`,
        name,
        filters,
        createdAt: new Date().toISOString(),
      }
      persistViews([...savedViews, view])
    },
    [filters, savedViews, persistViews],
  )

  const applyView = useCallback((view: SavedView) => setFilters(view.filters), [setFilters])

  const deleteView = useCallback(
    (id: string) => persistViews(savedViews.filter((v) => v.id !== id)),
    [savedViews, persistViews],
  )

  const hrefWithFilters = useCallback(
    (path: string, patch?: Partial<CallFilters>) => {
      const qs = filtersToQuery(patch ? { ...filters, ...patch } : filters)
      return qs ? `${path}?${qs}` : path
    },
    [filters],
  )

  const value: CiState = {
    filters,
    setFilters,
    patchFilters,
    resetFilters,
    viewer,
    setViewerRole,
    data,
    loading,
    error,
    reload,
    periodLabel: periodLabelOf(filters),
    comparisonLabel: comparisonLabelOf(filters),
    savedViews,
    saveView,
    applyView,
    deleteView,
    hrefWithFilters,
  }

  return <CiContext.Provider value={value}>{children}</CiContext.Provider>
}

export function useCi(): CiState {
  const ctx = useContext(CiContext)
  if (!ctx) throw new Error('useCi must be used inside <CiProvider>')
  return ctx
}
