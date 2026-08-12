'use client'

/**
 * Onboarding progress — the single place both the Onboarding page and the
 * Policies acknowledgment read and write.
 *
 * This exists because the acknowledgment gate had to hook into how onboarding
 * is actually tracked rather than inventing a second, untracked confirmation.
 * Onboarding progress is a set of completed task ids in localStorage, so the
 * acknowledgment lives in the same record, under the same key, and the gate is
 * derived from it.
 *
 * LIMIT, stated plainly: this is per-browser. `onboarding_tasks` and
 * `onboarding_progress` exist in migration 0001 but nothing writes to them, so
 * HR cannot see an employee's real state and an acknowledgment does not reach
 * a server. Wiring those tables up is what makes this auditable; until then it
 * is a genuine gate in the UI but not a record of legal acceptance.
 */

const KEY = 'magppie-onboarding-progress-v2'

export interface OnboardingRecord {
  /** Completed checklist task ids. */
  done: string[]
  /** ISO timestamp of the policy acknowledgment, or null if not yet given. */
  policiesAcknowledgedAt: string | null
}

const EMPTY: OnboardingRecord = { done: [], policiesAcknowledgedAt: null }

/**
 * Reads the record, tolerating the older shape — v2 originally stored a bare
 * array of task ids, before the acknowledgment needed somewhere to live.
 */
export function readOnboarding(): OnboardingRecord {
  if (typeof window === 'undefined') return { ...EMPTY }
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...EMPTY }
    const parsed = JSON.parse(raw) as unknown
    if (Array.isArray(parsed)) return { done: parsed as string[], policiesAcknowledgedAt: null }
    const rec = parsed as Partial<OnboardingRecord>
    return {
      done: Array.isArray(rec.done) ? rec.done : [],
      policiesAcknowledgedAt: rec.policiesAcknowledgedAt ?? null,
    }
  } catch {
    return { ...EMPTY }
  }
}

function write(rec: OnboardingRecord) {
  try {
    localStorage.setItem(KEY, JSON.stringify(rec))
    // Same-tab listeners: the storage event only fires in *other* tabs.
    window.dispatchEvent(new CustomEvent('magppie-onboarding-changed'))
  } catch {
    /* storage unavailable — state still holds for this session */
  }
}

export function setDone(done: string[]) {
  write({ ...readOnboarding(), done })
}

/** Records the acknowledgment. Never overwritten once set — it is a signature. */
export function acknowledgePolicies(now = new Date().toISOString()) {
  const rec = readOnboarding()
  if (rec.policiesAcknowledgedAt) return rec.policiesAcknowledgedAt
  write({ ...rec, policiesAcknowledgedAt: now })
  return now
}

export function hasAcknowledgedPolicies(): boolean {
  return readOnboarding().policiesAcknowledgedAt !== null
}

/** Subscribe to changes from this tab or another one. */
export function onOnboardingChange(fn: () => void): () => void {
  window.addEventListener('magppie-onboarding-changed', fn)
  window.addEventListener('storage', fn)
  return () => {
    window.removeEventListener('magppie-onboarding-changed', fn)
    window.removeEventListener('storage', fn)
  }
}
