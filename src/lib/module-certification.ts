/**
 * Module certification rule — one implementation, used by every academy store.
 *
 * THE RULE: the certificate locks in on the **first attempt that passes**, not
 * the first attempt taken. Fail as many times as you like and nothing permanent
 * is recorded. The moment an attempt crosses the threshold, that attempt's score
 * and timestamp become the official record — permanently. Later retakes never
 * change it, never raise it, and never issue a second certificate.
 *
 * This deliberately replaces a best-score-wins rule (`bestScore: Math.max(...)`)
 * that used to feed the certificate. Under that rule, passing at 80% and later
 * retaking at 100% silently rewrote the certified figure to 100%. `bestScore`
 * survives below as an activity stat, but it is no longer what gets certified —
 * `certifiedScore` is, and only `certifiedScore` should ever be shown on a
 * certificate.
 *
 * Post-pass activity (retakes, revisits) is counted because it is genuinely
 * useful — it shows who reviews their material — but it is kept in fields whose
 * names say "activity", well away from the certified result.
 */

export interface CertifiedModuleResult {
  viewed: boolean
  /** Every quiz attempt ever, before and after passing. Activity stat. */
  attempts: number
  /**
   * Highest raw score ever achieved. ACTIVITY STAT ONLY — deliberately NOT the
   * certified figure. Show `certifiedScore` on certificates.
   */
  bestScore: number
  /** Question count of the most recent attempt (context for `bestScore`). */
  total: number
  passed: boolean
  /** Correct answers on the first passing attempt. Written once. */
  certifiedScore: number | null
  /** Question count of that same attempt, so the % is reconstructable. */
  certifiedTotal: number | null
  /** ISO timestamp of the first passing attempt. Written once. */
  passedAt: string | null
  /** Quiz retakes taken after the certificate was earned. Activity only. */
  retakesAfterPass: number
  /** Content revisits after the certificate was earned. Activity only. */
  rewatchesAfterPass: number
}

export const EMPTY_RESULT: CertifiedModuleResult = {
  viewed: false,
  attempts: 0,
  bestScore: 0,
  total: 0,
  passed: false,
  certifiedScore: null,
  certifiedTotal: null,
  passedAt: null,
  retakesAfterPass: 0,
  rewatchesAfterPass: 0,
}

/** Tolerate records written before these fields existed. */
export function normalizeResult(
  prev: Partial<CertifiedModuleResult> | undefined,
): CertifiedModuleResult {
  if (!prev) return { ...EMPTY_RESULT }
  const passed = prev.passed ?? false
  return {
    viewed: prev.viewed ?? false,
    attempts: prev.attempts ?? 0,
    bestScore: prev.bestScore ?? 0,
    total: prev.total ?? 0,
    passed,
    /**
     * Backfill for records that pre-date the rule: their original passing score
     * was never stored, so the best available stand-in is `bestScore`. It may
     * overstate a certificate whose holder later improved on a retake. New
     * passes are exact; only this historical backfill is approximate, and
     * `passedAt` stays null so a backfilled record is identifiable.
     */
    certifiedScore: prev.certifiedScore ?? (passed ? (prev.bestScore ?? 0) : null),
    certifiedTotal: prev.certifiedTotal ?? (passed ? (prev.total ?? 0) : null),
    passedAt: prev.passedAt ?? null,
    retakesAfterPass: prev.retakesAfterPass ?? 0,
    rewatchesAfterPass: prev.rewatchesAfterPass ?? 0,
  }
}

/**
 * Fold a quiz attempt into a module's record.
 *
 * `passed` is decided by the caller against that academy's own threshold
 * (BD_PASS_THRESHOLD / SALES_PASS_THRESHOLD) — this function never invents one.
 * `now` is injected so the caller controls the clock and tests stay deterministic.
 */
export function applyAttempt(
  prevRaw: Partial<CertifiedModuleResult> | undefined,
  attempt: { correct: number; total: number; passed: boolean; now?: string },
): CertifiedModuleResult {
  const prev = normalizeResult(prevRaw)
  const { correct, total, passed } = attempt

  const next: CertifiedModuleResult = {
    ...prev,
    viewed: true,
    attempts: prev.attempts + 1,
    bestScore: Math.max(prev.bestScore, correct),
    total,
  }

  if (prev.passed) {
    // Already certified. This is a retake: counted, but it cannot touch the
    // certificate — not even to raise it.
    next.retakesAfterPass = prev.retakesAfterPass + 1
    return next
  }

  if (passed) {
    // The first passing attempt. This — and only this — is what gets certified.
    next.passed = true
    next.certifiedScore = correct
    next.certifiedTotal = total
    next.passedAt = attempt.now ?? new Date().toISOString()
  }

  // A failed attempt before passing records nothing permanent.
  return next
}

/** Fold a content view. After certification, views count as revisits. */
export function applyView(
  prevRaw: Partial<CertifiedModuleResult> | undefined,
): CertifiedModuleResult {
  const prev = normalizeResult(prevRaw)
  return {
    ...prev,
    viewed: true,
    rewatchesAfterPass: prev.passed ? prev.rewatchesAfterPass + 1 : prev.rewatchesAfterPass,
  }
}

/** The certified percentage to print on a certificate, or null if uncertified. */
export function certifiedPct(r: Partial<CertifiedModuleResult> | undefined): number | null {
  const n = normalizeResult(r)
  if (!n.passed || n.certifiedScore == null || !n.certifiedTotal) return null
  return Math.round((n.certifiedScore / n.certifiedTotal) * 100)
}

/** Total post-certification activity — retakes plus revisits. */
export function activityAfterPass(r: Partial<CertifiedModuleResult> | undefined): number {
  const n = normalizeResult(r)
  return n.retakesAfterPass + n.rewatchesAfterPass
}
