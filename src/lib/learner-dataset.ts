/**
 * The one place learner progress is read from.
 *
 * THE PROBLEM THIS SOLVES. The dashboard and the certificate answer
 * overlapping questions from unrelated sources:
 *
 *   dashboard    data/capability-evidence.ts — a static fixture
 *                (EVIDENCE_IS_DEMO = true). Competency evidence had no table.
 *   certificate  bd/sales-progress-store — zustand `persist`, i.e. browser
 *                localStorage.
 *
 * Neither touches `module_attempts`, which has existed since migration 0019.
 * So "did this person pass the Lead Qualification quiz" has two answers that
 * are never reconciled, because nothing joins them. Migration 0020 adds the
 * missing tables and the FK that closes that gap.
 *
 * A schema alone would not have fixed it, though. Two subsystems reading two
 * sources through two code paths will drift again the moment someone adds a
 * stat to one of them. So both now read through this module. Swapping demo
 * for live becomes one change here, rather than a migration of two features
 * that must land simultaneously to stay consistent.
 *
 * WHAT IS ACTUALLY WIRED TODAY — stated so nobody reads this file as a
 * finished integration:
 *
 *   attempts + certification   demo: progress stores (per browser)
 *                              live: module_attempts + module_certifications
 *   competency evidence        demo: capability-evidence fixture
 *                              live: competency_evidence  (table now exists,
 *                                    NOTHING WRITES TO IT YET)
 *   snapshots                  demo: none — the dashboard reconstructs a trend
 *                                    from evidence dates instead, and says so
 *                              live: learner_progress_snapshots, once the
 *                                    scheduled capture job is running
 *
 * BLOCKER, unchanged and load-bearing: every live path here needs real
 * authentication. The portal runs behind one seeded demo identity, so there is
 * no per-person record to read. The schema is correct and empty.
 */

import { SUPABASE_CONFIGURED } from '@/lib/data-source'

/** A single quiz attempt — the immutable log entry. */
export interface AttemptRecord {
  moduleId: string
  attemptNumber: number
  scorePct: number
  passed: boolean
  attemptedAt: string
}

/**
 * The locked verdict. Derived from the attempt log, never edited afterwards —
 * the database enforces this too (trg_lock_module_certification), because an
 * application-side rule is one forgetful caller away from being bypassed.
 */
export interface CertificationRecord {
  moduleId: string
  certifiedScorePct: number | null
  certifiedAt: string | null
  /** Activity after the pass. Tracking only; never feeds the certified score. */
  retakesAfterPass: number
  rewatchesAfterPass: number
}

/** A stored point-in-time reading. Only these can power an honest trend. */
export interface SnapshotRecord {
  capturedOn: string
  roleReadinessPct: number | null
  planCompletionPct: number | null
  competenciesValidated: number
  competenciesTotal: number
  readinessStatus: string | null
}

export type DatasetBacking = 'demo-local' | 'supabase' | 'unavailable'

export interface LearnerDatasetStatus {
  backing: DatasetBacking
  /** True only when per-person records are genuinely being read. */
  isPerPerson: boolean
  /** Whether stored history exists. Governs whether a real trend is possible. */
  hasSnapshots: boolean
  /** Plain-language reason, for surfacing on screen rather than in a comment. */
  note: string
}

/**
 * What the dataset can currently answer, and what it cannot.
 *
 * Deliberately returns a status object rather than throwing or silently
 * falling back: the portal's rule throughout is that an unavailable source is
 * said out loud, never quietly substituted with someone else's numbers.
 */
export function datasetStatus(): LearnerDatasetStatus {
  if (!SUPABASE_CONFIGURED) {
    return {
      backing: 'demo-local',
      isPerPerson: false,
      hasSnapshots: false,
      note:
        'Reading the demo fixture and this browser’s local progress. Not per-person: the portal runs behind a single seeded identity, so these are the same records for every viewer. No stored history exists, so trends are reconstructed from evidence dates rather than read from snapshots.',
    }
  }

  return {
    backing: 'supabase',
    // Configured is not the same as authenticated. The caller still has to
    // resolve an actual user before any of this is per-person.
    isPerPerson: true,
    // Flipped on once the scheduled capture job has written rows. Until then a
    // configured project still has no history to chart.
    hasSnapshots: false,
    note:
      'Reading live records for the signed-in learner. Trend charts stay reconstructed until the snapshot capture job has accumulated readings — a configured database is not the same as a populated one.',
  }
}

/**
 * Whether a real, stored-history trend chart can be drawn.
 *
 * Kept as its own predicate because the answer is easy to get wrong from the
 * outside: having a snapshots table is not the same as having snapshots, and
 * drawing a chart from an empty table produces a confident flat line rather
 * than an obvious failure.
 */
export function canChartStoredHistory(status = datasetStatus()): boolean {
  return status.backing === 'supabase' && status.hasSnapshots
}
