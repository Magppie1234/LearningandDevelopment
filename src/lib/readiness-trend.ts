/**
 * Validation trend — reconstructed from evidence dates, not from stored history.
 *
 * WHAT THIS IS. Every validated competency carries `validatedOn` (the latest of
 * its manager-rating / knowledge / practical evidence dates). Counting, for each
 * past month, how many competencies had been validated by the end of it
 * reconstructs the curve that got someone to today's number. The dates are real
 * — the same ones the readiness engine already uses to decide validity.
 *
 * WHAT THIS IS NOT, and it matters. There is no snapshot table in the schema:
 * nothing records what the dashboard actually said on a given day. So this
 * reconstruction reads history through TODAY's role requirements and TODAY's
 * evidence. Two consequences worth stating rather than hiding:
 *
 *   - If the role's required competencies changed, earlier months are shown
 *     against the current requirement list, not the one in force back then.
 *   - Evidence that was later revoked or re-dated moves the past with it.
 *
 * A true history needs periodic snapshots persisted somewhere. Until that
 * exists this is the honest maximum: a real curve, correctly labelled as
 * reconstructed. Callers must surface that label — see the chart's caption.
 *
 * Pure: no Date.now(). `asOf` is always passed in, matching learning-plan.ts.
 */

export interface TrendPoint {
  /** First day of the month, ISO. */
  month: string
  /** Short label for the axis, e.g. "Mar". */
  label: string
  /** Competencies validated at/above required level by the end of this month. */
  validated: number
  /** Required competencies (today's list — see the caveat above). */
  total: number
  /** validated ÷ total, 0–100. */
  pct: number
}

interface DatedRow {
  validated: number
  required: number
  validatedOn: string | null
}

function endOfMonthISO(year: number, monthIdx: number): string {
  // Day 0 of the next month is the last day of this one.
  const d = new Date(Date.UTC(year, monthIdx + 1, 0))
  return d.toISOString().slice(0, 10)
}

const MONTH_LABEL = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * Builds `months` points ending at `asOf`.
 *
 * A competency counts toward a month when it is validated at or above its
 * required level AND its evidence date is on or before the end of that month.
 * Rows with no evidence date never count — an undated validation cannot be
 * placed on a timeline, and guessing a position would be inventing the very
 * data this function exists to avoid inventing.
 */
export function buildValidationTrend(
  rows: readonly DatedRow[],
  asOf: string,
  months = 6,
): TrendPoint[] {
  const end = new Date(`${asOf}T00:00:00Z`)
  if (Number.isNaN(end.getTime()) || rows.length === 0) return []

  const total = rows.length
  const points: TrendPoint[] = []

  for (let back = months - 1; back >= 0; back--) {
    const y = end.getUTCFullYear()
    const m = end.getUTCMonth() - back
    const d = new Date(Date.UTC(y, m, 1))
    const cutoff = back === 0 ? asOf : endOfMonthISO(d.getUTCFullYear(), d.getUTCMonth())

    const validated = rows.filter(
      (r) => r.validatedOn != null && r.validatedOn <= cutoff && r.validated >= r.required,
    ).length

    points.push({
      month: d.toISOString().slice(0, 10),
      label: MONTH_LABEL[d.getUTCMonth()],
      validated,
      total,
      pct: total === 0 ? 0 : Math.round((validated / total) * 100),
    })
  }

  return points
}

/**
 * True when the trend carries no signal — every point identical, or nothing
 * dated at all. The dashboard shows an honest note instead of a flat line
 * pretending to be a chart.
 */
export function isFlat(points: readonly TrendPoint[]): boolean {
  if (points.length < 2) return true
  return points.every((p) => p.validated === points[0].validated)
}
