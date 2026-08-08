'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useRole } from '@/lib/role-context'
import { Notice } from '@/components/ds'
import {
  BadgeCheck,
  CalendarClock,
  ChevronDown,
  ClipboardCheck,
  FileCheck2,
  Info,
  Target,
  UserCheck,
} from 'lucide-react'
import {
  CHANNEL_LABEL,
  type Channel,
  type ValidatedCompetency,
} from '@/lib/role-readiness'
import {
  DEMO_AS_OF,
  evidenceFor,
  onboardingDay,
  verdictFor,
} from '@/data/capability-evidence'
import {
  DEMO_USER_ID,
  daysBetween,
  departmentBySlug,
  memberById,
} from '@/data/workforce'
import { criticalityRationale } from '@/data/competency-policy'
import {
  CARD,
  CappingReason,
  CriticalityChip,
  DemoDataNotice,
  PROFICIENCY_LABEL,
  PracticalChip,
  ProficiencyMeter,
  ReadinessBadge,
} from '@/components/learning/ReadinessPrimitives'

/**
 * Skills Passport (L&D OS spec §16) — one employee's verified capability.
 *
 * The page exists to make one distinction unmissable: what the learner
 * *thinks* they can do, what they have *answered correctly*, and what has
 * actually been *observed*. §7 forbids collapsing those into an average, so
 * they are shown side by side and the validated number is explained by
 * whichever channel is holding it down.
 */

const CHANNEL_ORDER: Channel[] = ['knowledge', 'practical', 'manager', 'workProduct']

const CHANNEL_HINT: Record<Channel, string> = {
  knowledge:
    'Proves recall and judgement. A pass opens Advanced (4), a pass at 90%+ opens 5 — but on its own it validates nothing.',
  practical: 'An assessor observing the real task. Required for critical and operational competencies.',
  manager: 'The reporting manager attesting to unsupervised performance — the gate to Independent.',
  workProduct: 'A real deliverable reviewed and accepted — a measurement sheet, a PO, a QC report.',
}

function ChannelCeiling({ row, channel }: { row: ValidatedCompetency; channel: Channel }) {
  const ceiling = row.ceilings[channel]
  const isCapping = row.cappedBy.includes(channel)
  return (
    <div
      className={cn(
        'rounded-xl px-3 py-2 border',
        isCapping
          ? 'border-accent-copper/50 bg-accent-copper/10'
          : 'border-[rgb(var(--rule)/0.08)] bg-[rgb(var(--rule)/0.03)]',
      )}
    >
      <p className="text-[11px] uppercase tracking-wide text-ink-tertiary">{CHANNEL_LABEL[channel]}</p>
      <p className="text-sm text-ink-primary mt-0.5">
        Ceiling {ceiling}
        <span className="text-ink-tertiary"> — {PROFICIENCY_LABEL[ceiling]}</span>
      </p>
      <p className="text-[11px] text-ink-tertiary mt-1">{CHANNEL_HINT[channel]}</p>
    </div>
  )
}

function CompetencyRow({
  row,
  evidenceNote,
  defaultOpen = false,
}: {
  row: ValidatedCompetency
  evidenceNote: string | null
  /** Opened on arrival when the URL points at this competency. */
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={cn(CARD, 'overflow-hidden')}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
      >
        <span className="flex-1 min-w-0">
          <span className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-ink-primary">{row.name}</span>
            <CriticalityChip criticality={row.criticality} />
            {row.expired && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-rose/30 text-ink-primary">
                Expired
              </span>
            )}
            {row.expiringSoon && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-accent-gold/25 text-ink-primary">
                Expires soon
              </span>
            )}
          </span>
          <span className="block mt-1">
            <CappingReason row={row} />
          </span>
        </span>
        <span className="flex items-center gap-3 flex-shrink-0">
          <ProficiencyMeter required={row.required} validated={row.validated} self={row.self} />
          <ChevronDown
            size={16}
            className={cn('text-ink-tertiary transition-transform', open && 'rotate-180')}
          />
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-[rgb(var(--rule)/0.06)] space-y-3 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <PracticalChip row={row} />
            <span className="text-[11px] text-ink-tertiary">
              Required: {row.required} — {PROFICIENCY_LABEL[row.required]}
            </span>
            <span className="text-[11px] text-ink-tertiary">
              Validated: {row.validated} — {PROFICIENCY_LABEL[row.validated]}
            </span>
          </div>

          {row.criticality !== 'unset' && criticalityRationale(row.competencyId) && (
            <p className="text-xs text-ink-secondary bg-surface-rose/10 border border-surface-rose/25 rounded-lg px-3 py-2">
              <strong>Why this is critical:</strong> {criticalityRationale(row.competencyId)}
              {row.criticality === 'proposed' && (
                <em className="block mt-0.5 not-italic text-ink-tertiary">
                  Sample – Requires SME Approval. It does not block readiness until the Department
                  Head approves it.
                </em>
              )}
            </p>
          )}

          <div className="grid sm:grid-cols-2 gap-2">
            {CHANNEL_ORDER.map((c) => (
              <ChannelCeiling key={c} row={row} channel={c} />
            ))}
          </div>

          {evidenceNote && <p className="text-xs text-ink-secondary">{evidenceNote}</p>}

          <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-ink-tertiary">
            <span>
              Self-rating:{' '}
              {row.self == null ? 'not given' : `${row.self} — ${PROFICIENCY_LABEL[row.self]}`}{' '}
              (never counted toward the validated number)
            </span>
            <span>Last validated: {row.validatedOn ?? 'never'}</span>
            <span>Next validation due: {row.nextValidationOn ?? '—'}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SkillsPassport() {
  const { member: actingMember, cohort } = useRole()
  const params = useSearchParams()

  // Drill-down targets from the Manager Hub and dashboards. A requested member
  // is honoured only when they are inside the viewer's authorised cohort —
  // otherwise a URL would be a way around the scope boundary.
  const requestedId = params?.get('member')
  const requested = requestedId ? memberById(requestedId) : undefined
  const viewingOther =
    requested && requested.id !== actingMember?.id && cohort.some((m) => m.id === requested.id)
      ? requested
      : undefined

  const member = viewingOther ?? actingMember ?? memberById(DEMO_USER_ID)!
  /** Competency to open on arrival, e.g. from a "see the evidence" link. */
  const focusCompetency = params?.get('competency') ?? null

  const department = departmentBySlug(member.departmentSlug)
  const verdict = verdictFor(member)
  const evidence = useMemo(() => evidenceFor(member), [member])
  const onboarding = onboardingDay(member)
  const tenureDays = daysBetween(member.joinedOn, DEMO_AS_OF)

  /** A short, human note per competency about what evidence actually exists. */
  const notesById = useMemo(() => {
    const map = new Map<string, string | null>()
    for (const e of evidence) {
      const bits: string[] = []
      if (e.knowledge) {
        bits.push(
          `Knowledge assessment ${e.knowledge.passed ? 'passed' : 'not passed'} at ${e.knowledge.scorePct}% on ${e.knowledge.takenOn} (${e.knowledge.attempts} attempt${e.knowledge.attempts === 1 ? '' : 's'}).`,
        )
      } else {
        bits.push('No knowledge assessment attempt on record.')
      }
      if (e.practical && e.practical.status !== 'none') {
        const p = e.practical
        bits.push(
          p.status === 'competent'
            ? `Practical observed by ${p.assessor} on ${p.assessedOn} — ${p.criticalCriteriaMet ? 'all critical criteria met' : 'a critical criterion was not met, so it cannot count as competent'}.`
            : p.status === 'pending'
              ? `Evidence submitted on ${p.assessedOn}, awaiting ${p.assessor}.`
              : `Assessed by ${p.assessor} as not yet competent on ${p.assessedOn}.`,
        )
      }
      if (e.manager == null) bits.push('No manager observation recorded.')
      if (e.workProduct) bits.push(`Work-product evidence: ${e.workProduct}.`)
      map.set(e.competencyId, bits.join(' '))
    }
    return map
  }, [evidence])

  const blocker = verdict.criticalBlockers[0]

  return (
    <div className="max-w-4xl space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-accent-copper flex items-center gap-2">
          <BadgeCheck size={14} /> Skills Passport
        </p>
        <h1 className="mt-2 font-serif text-[26px] sm:text-[30px] font-semibold text-ink-primary leading-tight">
          {viewingOther ? (
            <>
              What {member.name.split(' ')[0]} can <em className="italic">prove</em> they can do
            </>
          ) : (
            <>
              What you can <em className="italic">prove</em> you can do
            </>
          )}
        </h1>
        <p className="mt-2 text-sm text-ink-secondary max-w-2xl">
          Verified capability against what the role requires. Watching a lesson and passing a quiz
          are recorded here — but neither one alone makes a competency validated.
        </p>
      </header>

      {viewingOther && (
        <Notice tone="info">
          You are viewing <strong>{member.name}</strong>&apos;s record because they are in your
          reporting line. Developmental ratings are for capability development only.
        </Notice>
      )}

      <DemoDataNotice />

      {/* ── Identity + verdict ────────────────────────────────────────── */}
      <section className={cn(CARD, 'p-5')}>
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-ink-primary">{member.name}</h2>
            <p className="text-sm text-ink-secondary">
              {member.role} · {department?.name ?? member.departmentSlug}
            </p>
            <p className="text-xs text-ink-tertiary mt-1">
              {member.location} · {member.employmentType} · joined {member.joinedOn} ({tenureDays}{' '}
              days)
              {member.cohort ? ` · ${member.cohort}` : ''}
            </p>
            {onboarding != null && (
              <p className="mt-2 text-xs text-ink-secondary bg-surface-blue/20 rounded-lg px-3 py-1.5 inline-block">
                Day {onboarding} of the 90-day onboarding plan — being short of role-ready here is on
                plan, not off plan.
              </p>
            )}
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
            <ReadinessBadge status={verdict.status} />
            <p className="text-3xl font-semibold text-ink-primary leading-none">
              {verdict.coveragePct}%
            </p>
            <p className="text-[11px] text-ink-tertiary sm:text-right">
              competencies at or above
              <br className="hidden sm:block" /> required level ({verdict.rows.filter((r) => r.gap === 0).length}{' '}
              of {verdict.rows.length})
            </p>
          </div>
        </div>

        {blocker && (
          <div className="mt-4 rounded-xl bg-surface-rose/15 border border-surface-rose/40 px-4 py-3">
            <p className="text-sm font-semibold text-ink-primary flex items-center gap-2">
              <Target size={15} className="text-accent-copper" /> Why you are not role ready
            </p>
            <p className="mt-1 text-sm text-ink-secondary">
              <strong>{blocker.name}</strong> is a critical competency at {blocker.validated} against
              a required {blocker.required}. A critical gap blocks readiness on its own — a high
              average across everything else cannot compensate for it.
            </p>
            {verdict.coveragePct >= 80 && (
              <p className="mt-1 text-xs text-ink-tertiary">
                Your coverage is {verdict.coveragePct}%. That is deliberately not enough: the gate is
                per-critical-competency, not an average.
              </p>
            )}
          </div>
        )}

        {verdict.nextAction && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-xs uppercase tracking-wide text-ink-tertiary">Next action</span>
            <span className="text-ink-primary">{verdict.nextAction.label}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-ink-primary text-parchment">
              Owner: {verdict.nextAction.owner}
            </span>
          </div>
        )}

        {verdict.provisional && (
          <p className="mt-3 text-[11px] text-ink-tertiary flex items-start gap-1.5">
            <Info size={13} className="flex-shrink-0 mt-0.5" />
            Provisional verdict: criticality is approved for{' '}
            {verdict.rows.filter((r) => r.criticality === 'approved').length} of {verdict.rows.length}{' '}
            competencies in this role. Proposed criticality is shown but does not gate readiness
            until the Department Head approves it.
          </p>
        )}
      </section>

      {/* ── Attention strip ──────────────────────────────────────────── */}
      <section className="grid sm:grid-cols-3 gap-3">
        {[
          {
            icon: ClipboardCheck,
            label: 'With an assessor',
            value: verdict.awaitingAssessor.length,
            hint: 'Practical evidence submitted, waiting on review',
          },
          {
            icon: CalendarClock,
            label: 'Expired or expiring',
            value: verdict.expired.length + verdict.expiringSoon.length,
            hint: 'Validation past due or due within 90 days',
          },
          {
            icon: UserCheck,
            label: 'Awaiting manager observation',
            // Only the ones a missing manager attestation is actually holding
            // BELOW the required level — not every row the manager ceiling ties.
            value: verdict.rows.filter((r) => r.ceilings.manager < r.required).length,
            hint: 'Held below the required level until unsupervised performance is attested',
          },
        ].map((s) => (
          <div key={s.label} className={cn(CARD, 'p-4')}>
            <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-ink-tertiary">
              <s.icon size={14} className="text-accent-copper" /> {s.label}
            </p>
            <p className="mt-1.5 text-2xl font-semibold text-ink-primary">{s.value}</p>
            <p className="text-[11px] text-ink-tertiary mt-0.5">{s.hint}</p>
          </div>
        ))}
      </section>

      {/* ── Competency records ───────────────────────────────────────── */}
      <section className="space-y-2">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <h2 className="text-sm font-semibold text-ink-primary">
            Required competencies ({verdict.rows.length})
          </h2>
          <p className="text-[11px] text-ink-tertiary">
            Ringed marker = required level. Open a row to see every evidence channel.
          </p>
        </div>
        {verdict.rows.length === 0 ? (
          <p className="text-sm text-ink-tertiary py-6 text-center">
            No competency framework has been authored for this role yet, so readiness cannot be
            measured. Owner: Department Head.
          </p>
        ) : (
          [...verdict.rows]
            .sort(
              (a, b) =>
                Number(b.blocksReadiness) - Number(a.blocksReadiness) ||
                b.gap - a.gap ||
                a.name.localeCompare(b.name),
            )
            .map((row) => (
              <CompetencyRow
                key={row.competencyId}
                row={row}
                evidenceNote={notesById.get(row.competencyId) ?? null}
                defaultOpen={row.competencyId === focusCompetency}
              />
            ))
        )}
      </section>

      {/* ── How the number is derived ────────────────────────────────── */}
      <section className={cn(CARD, 'p-5')}>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-primary">
          <FileCheck2 size={15} className="text-accent-copper" /> How the validated number is derived
        </h2>
        <p className="mt-2 text-xs text-ink-secondary">
          Each evidence channel sets a <strong>ceiling</strong>. Your validated proficiency is the
          lowest ceiling — never an average, and never higher than what has been verified. Your own
          self-rating is recorded for the coaching conversation and is excluded from the calculation.
        </p>
        <div className="mt-3 grid sm:grid-cols-2 gap-2">
          {CHANNEL_ORDER.map((c) => (
            <div key={c} className="rounded-xl border border-[rgb(var(--rule)/0.08)] px-3 py-2">
              <p className="text-xs font-medium text-ink-primary">{CHANNEL_LABEL[c]}</p>
              <p className="text-[11px] text-ink-tertiary mt-0.5">{CHANNEL_HINT[c]}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {PROFICIENCY_LABEL.map((label, i) => (
            <span
              key={label}
              className="text-[11px] px-2 py-0.5 rounded-full bg-[rgb(var(--rule)/0.06)] text-ink-secondary"
            >
              {i} · {label}
            </span>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-ink-tertiary">
          Developmental ratings on this page are for capability development only. They must not be
          used on their own for compensation, promotion or disciplinary decisions (§19).
        </p>
      </section>
    </div>
  )
}
