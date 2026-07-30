'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  AlertTriangle,
  CalendarClock,
  ClipboardCheck,
  Eye,
  Gauge,
  GraduationCap,
  Info,
  MessageSquare,
  RotateCcw,
  ShieldCheck,
  Undo2,
  Users,
} from 'lucide-react'
import {
  READINESS_LABEL,
  readinessMix,
  skillRisk,
  type ReadinessStatus,
  type ValidatedCompetency,
} from '@/lib/role-readiness'
import {
  DEMO_AS_OF,
  cohortFor,
  evidenceFor,
  onboardingDay,
  timeToProficiencyDays,
  verdictFor,
} from '@/data/capability-evidence'
import {
  DEMO_MANAGER_ID,
  daysBetween,
  departmentBySlug,
  managers,
  memberById,
  reportingLineOf,
  type WorkforceMember,
} from '@/data/workforce'
import {
  ACTION_LABEL,
  useCoachingQueue,
  useHydrated,
  type CoachingActionKind,
} from '@/lib/coaching-queue-store'
import {
  CARD,
  CriticalityChip,
  DemoDataNotice,
  PROFICIENCY_LABEL,
  ProficiencyMeter,
  ReadinessBadge,
  ReadinessDot,
} from '@/components/learning/ReadinessPrimitives'

/**
 * Manager Hub (L&D OS spec §13B).
 *
 * Built to answer a manager's four questions and nothing else: who on my team
 * cannot yet do the job, what exactly is missing, whose action is it, and what
 * do I do about it right now. Activity metrics (hours, logins) are deliberately
 * absent — §13 classes them as activity, not capability.
 *
 * Scope is the manager's own reporting line (§19). The manager selector exists
 * so this demo can be reviewed from more than one line; in live mode it is
 * replaced by the signed-in manager's line, with no way to widen it.
 */

const KPI_META: Record<string, { formula: string; source: string; owner: string }> = {
  ready: {
    formula: 'Role-ready team members ÷ team members with an authored competency framework',
    source: 'Portal competency evidence',
    owner: 'Reporting Manager',
  },
  critical: {
    formula: 'Count of approved-critical competencies below required level, across the team',
    source: 'Competency Dictionary + Process Learning Map risk links',
    owner: 'Department Head',
  },
  practicals: {
    formula: 'Practical observations with evidence submitted and no assessor decision',
    source: 'Practical evaluations',
    owner: 'Assessor',
  },
  expiring: {
    formula: 'Validations expired, or expiring within 90 days of ' + DEMO_AS_OF,
    source: 'Portal competency evidence',
    owner: 'Reporting Manager',
  },
  ttp: {
    formula: 'Median days from role start to role-ready, among team members who are role-ready',
    source: 'Portal competency evidence',
    owner: 'HR Learning Programme Owner',
  },
}

function KpiCard({
  label,
  value,
  sub,
  metaKey,
  tone = 'neutral',
  icon: Icon,
}: {
  label: string
  value: string
  sub: string
  metaKey: keyof typeof KPI_META
  tone?: 'neutral' | 'warn' | 'bad' | 'good'
  icon: typeof Users
}) {
  const [open, setOpen] = useState(false)
  const meta = KPI_META[metaKey]
  const toneCls =
    tone === 'bad'
      ? 'text-surface-rose'
      : tone === 'warn'
        ? 'text-accent-copper'
        : tone === 'good'
          ? 'text-surface-sage'
          : 'text-ink-primary'
  return (
    <div className={cn(CARD, 'p-4')}>
      {/* min-height keeps the values on one baseline when a label wraps. */}
      <p className="flex items-start gap-2 text-xs uppercase tracking-wide text-ink-tertiary min-h-[2.25rem]">
        <Icon size={14} className="text-accent-copper flex-shrink-0 mt-0.5" /> {label}
      </p>
      <p className={cn('text-2xl font-semibold leading-none', toneCls)}>{value}</p>
      <p className="text-[11px] text-ink-tertiary mt-1">{sub}</p>
      <button
        onClick={() => setOpen(!open)}
        className="mt-2 text-[11px] text-ink-secondary hover:text-ink-primary inline-flex items-center gap-1"
      >
        <Info size={11} /> {open ? 'Hide definition' : 'How is this calculated?'}
      </button>
      {open && (
        <div className="mt-1.5 text-[11px] text-ink-tertiary space-y-0.5 border-t border-[rgba(0,59,70,0.06)] pt-1.5">
          <p>
            <strong className="text-ink-secondary">Formula:</strong> {meta.formula}
          </p>
          <p>
            <strong className="text-ink-secondary">Source:</strong> {meta.source}
          </p>
          <p>
            <strong className="text-ink-secondary">Owner:</strong> {meta.owner}
          </p>
          <p>
            <strong className="text-ink-secondary">As of:</strong> {DEMO_AS_OF}
          </p>
        </div>
      )}
    </div>
  )
}

interface QueueItem {
  member: WorkforceMember
  row: ValidatedCompetency
  /** Lower sorts first. */
  rank: number
  reason: string
  owner: 'Assessor' | 'Learner' | 'Reporting Manager'
  suggested: CoachingActionKind
  /** Day inside the 90-day onboarding plan, when the person is still in it. */
  onboardingDay: number | null
}

/**
 * The action queue. Ordered by what is actually blocking capability, not by
 * how overdue a course is: approved-critical blocks first, then stale
 * validation on a critical competency, then evidence sitting with an assessor.
 */
function buildQueue(team: WorkforceMember[]): QueueItem[] {
  const items: QueueItem[] = []
  for (const member of team) {
    const verdict = verdictFor(member)
    const day = onboardingDay(member)
    // Someone inside their first 90 days is on plan, so their gaps sort below
    // an equivalent gap on a tenured team member — same information, honest
    // priority.
    const onboardingPenalty = day == null ? 0 : 2
    const push = (item: Omit<QueueItem, 'member' | 'onboardingDay'>) =>
      items.push({ ...item, rank: item.rank + onboardingPenalty, member, onboardingDay: day })

    for (const row of verdict.rows) {
      if (row.practicalStatus === 'pending') {
        push({
          row,
          rank: row.blocksReadiness ? 1 : 3,
          reason: 'Evidence submitted — waiting on an assessor decision',
          owner: 'Assessor',
          suggested: 'assessor_chased',
        })
        continue
      }
      if (row.expired) {
        push({
          row,
          rank: row.blocksReadiness ? 1 : 4,
          reason: `Validation expired on ${row.nextValidationOn} — capability is no longer verified`,
          owner: 'Learner',
          suggested: 'remediation_assigned',
        })
        continue
      }
      if (row.gap <= 0) continue

      // No evidence at all is a different problem from failed evidence, and
      // needs a different action — assigning "remediation" to someone who has
      // not started anything misreads the situation.
      if (row.validated === 0) {
        push({
          row,
          rank: row.blocksReadiness ? 2 : 6,
          reason: row.blocksReadiness
            ? 'Critical competency with no evidence on record — learning and assessment not started'
            : 'No evidence on record yet — learning and assessment not started',
          owner: 'Learner',
          suggested: 'learning_assigned',
        })
        continue
      }

      if (row.blocksReadiness) {
        const practicalMissing = row.cappedBy.includes('practical')
        push({
          row,
          rank: 0,
          reason: practicalMissing
            ? 'Critical competency never observed — a passed quiz cannot close this'
            : row.cappedBy.includes('knowledge')
              ? 'Critical competency — knowledge assessment not passed'
              : 'Critical competency — no manager attestation of unsupervised performance',
          owner: practicalMissing ? 'Reporting Manager' : 'Learner',
          suggested: practicalMissing ? 'observation_requested' : 'remediation_assigned',
        })
        continue
      }
      if (row.cappedBy.includes('manager') && row.ceilings.knowledge >= row.required) {
        push({
          row,
          rank: 5,
          reason: 'Tested at the required level but not yet observed by you',
          owner: 'Reporting Manager',
          suggested: 'observation_requested',
        })
      }
    }
  }
  return items.sort(
    (a, b) => a.rank - b.rank || b.row.gap - a.row.gap || a.member.name.localeCompare(b.member.name),
  )
}

const ACTION_ICON: Record<CoachingActionKind, typeof Eye> = {
  observation_requested: Eye,
  coaching_logged: MessageSquare,
  remediation_assigned: GraduationCap,
  learning_assigned: GraduationCap,
  assessor_chased: ClipboardCheck,
}

function QueueRow({ item }: { item: QueueItem }) {
  const hydrated = useHydrated()
  const { record, undo, actions } = useCoachingQueue()
  const existing = hydrated
    ? actions.find((a) => a.memberId === item.member.id && a.competencyId === item.row.competencyId)
    : undefined
  const Icon = ACTION_ICON[item.suggested]

  return (
    <div className={cn(CARD, 'p-4 flex flex-col gap-2')}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-primary">
            {item.member.name}
            <span className="text-ink-tertiary font-normal"> · {item.member.role}</span>
          </p>
          <p className="mt-0.5 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-ink-secondary">{item.row.name}</span>
            <CriticalityChip criticality={item.row.criticality} />
          </p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-1">
          <ProficiencyMeter required={item.row.required} validated={item.row.validated} />
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-ink-primary text-parchment whitespace-nowrap">
            Owner: {item.owner}
          </span>
        </div>
      </div>
      <p className="text-xs text-ink-secondary">
        {item.reason}
        {item.onboardingDay != null && (
          <span className="ml-1.5 text-[11px] px-2 py-0.5 rounded-full bg-surface-blue/25 text-ink-primary whitespace-nowrap">
            Onboarding day {item.onboardingDay} of 90 — on plan
          </span>
        )}
      </p>
      {existing ? (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-sage/25 text-ink-primary">
            <ShieldCheck size={12} /> {ACTION_LABEL[existing.kind]} — waiting on {existing.waitingOn}
          </span>
          <button
            onClick={() => undo(existing.id)}
            className="inline-flex items-center gap-1 text-ink-tertiary hover:text-ink-primary"
          >
            <Undo2 size={12} /> Undo
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() =>
              record({
                memberId: item.member.id,
                competencyId: item.row.competencyId,
                kind: item.suggested,
                waitingOn: item.suggested === 'observation_requested' ? 'Assessor' : item.owner,
              })
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-ink-primary text-parchment hover:opacity-90"
          >
            <Icon size={13} /> {ACTION_LABEL[item.suggested]}
          </button>
          <button
            onClick={() =>
              record({
                memberId: item.member.id,
                competencyId: item.row.competencyId,
                kind: 'coaching_logged',
                waitingOn: 'Reporting Manager',
              })
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[rgba(0,59,70,0.06)] text-ink-secondary hover:text-ink-primary"
          >
            <MessageSquare size={13} /> Log coaching
          </button>
        </div>
      )}
    </div>
  )
}

/** Critical-competency heatmap: one row per person, one column per competency. */
function CriticalHeatmap({ team }: { team: WorkforceMember[] }) {
  const { columns, grid } = useMemo(() => {
    const cols = new Map<string, { id: string; name: string }>()
    const rows: { member: WorkforceMember; cells: Map<string, ValidatedCompetency> }[] = []
    for (const member of team) {
      const verdict = verdictFor(member)
      const cells = new Map<string, ValidatedCompetency>()
      for (const row of verdict.rows) {
        if (row.criticality === 'unset') continue
        cols.set(row.competencyId, { id: row.competencyId, name: row.name })
        cells.set(row.competencyId, row)
      }
      rows.push({ member, cells })
    }
    return { columns: [...cols.values()], grid: rows }
  }, [team])

  if (columns.length === 0) {
    return (
      <p className="text-sm text-ink-tertiary py-4">
        No critical or proposed-critical competencies are defined for this team’s roles yet. Owner:
        Department Head (§7).
      </p>
    )
  }

  const cellCls = (row: ValidatedCompetency | undefined) => {
    if (!row) return 'bg-[rgba(0,59,70,0.04)]'
    if (row.expired) return 'bg-surface-rose/50'
    if (row.gap === 0) return 'bg-surface-sage/45'
    if (row.gap === 1) return 'bg-accent-gold/40'
    return 'bg-surface-rose/45'
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-xs border-separate border-spacing-0.5">
        <thead>
          <tr>
            <th className="text-left font-medium text-ink-tertiary p-1.5 w-40 sticky left-0 bg-parchment">
              Team member
            </th>
            {columns.map((c) => (
              <th key={c.id} className="p-1.5 align-bottom">
                <span className="block text-ink-tertiary font-normal leading-tight [writing-mode:vertical-rl] rotate-180 h-24 mx-auto whitespace-nowrap">
                  {c.name}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grid.map(({ member, cells }) => (
            <tr key={member.id}>
              <td className="p-1.5 text-ink-primary sticky left-0 bg-parchment whitespace-nowrap">
                {member.name}
              </td>
              {columns.map((c) => {
                const row = cells.get(c.id)
                return (
                  <td key={c.id} className="p-0">
                    <div
                      className={cn('h-8 rounded flex items-center justify-center', cellCls(row))}
                      title={
                        row
                          ? `${member.name} · ${c.name}: validated ${row.validated} (${PROFICIENCY_LABEL[row.validated]}), required ${row.required}${row.expired ? ' — validation expired' : ''}`
                          : `${c.name} is not required for ${member.role}`
                      }
                    >
                      <span className="text-[10px] text-ink-primary/70">
                        {row ? `${row.validated}/${row.required}` : '—'}
                      </span>
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex flex-wrap gap-3 mt-3 text-[11px] text-ink-tertiary">
        {[
          ['bg-surface-sage/45', 'At or above required'],
          ['bg-accent-gold/40', 'One level short'],
          ['bg-surface-rose/45', 'Two or more levels short'],
          ['bg-surface-rose/50', 'Validation expired'],
          ['bg-[rgba(0,59,70,0.04)]', 'Not required for the role'],
        ].map(([cls, label]) => (
          <span key={label} className="inline-flex items-center gap-1.5">
            <span className={cn('w-3.5 h-3.5 rounded', cls)} /> {label}
          </span>
        ))}
      </div>
    </div>
  )
}

const TABS = [
  { id: 'queue', label: 'Action queue', icon: AlertTriangle },
  { id: 'team', label: 'Team readiness', icon: Users },
  { id: 'critical', label: 'Critical skills', icon: ShieldCheck },
  { id: 'onboarding', label: 'Onboarding', icon: CalendarClock },
] as const

type TabId = (typeof TABS)[number]['id']

export default function ManagerHub() {
  const [managerId, setManagerId] = useState(DEMO_MANAGER_ID)
  const [tab, setTab] = useState<TabId>('queue')
  const [statusFilter, setStatusFilter] = useState<ReadinessStatus | 'all'>('all')

  const managerOptions = useMemo(() => managers(), [])
  const manager = memberById(managerId) ?? memberById(DEMO_MANAGER_ID)!
  const team = useMemo(() => reportingLineOf(manager.id), [manager.id])
  const cohort = useMemo(() => cohortFor(team), [team])
  const mix = useMemo(() => readinessMix(cohort), [cohort])
  const risk = useMemo(() => skillRisk(cohort), [cohort])
  const ttp = useMemo(() => timeToProficiencyDays(cohort), [cohort])
  const queue = useMemo(() => buildQueue(team), [team])

  const criticalGapCount = cohort.reduce((n, c) => n + c.verdict.criticalBlockers.length, 0)
  const practicalsPending = cohort.reduce((n, c) => n + c.verdict.awaitingAssessor.length, 0)
  const expiryExposure = cohort.reduce(
    (n, c) => n + c.verdict.expired.length + c.verdict.expiringSoon.length,
    0,
  )

  const visibleTeam =
    statusFilter === 'all'
      ? cohort
      : cohort.filter((c) => c.verdict.status === statusFilter)

  const newJoiners = team
    .map((m) => ({ member: m, day: onboardingDay(m) }))
    .filter((x): x is { member: WorkforceMember; day: number } => x.day != null)
    .sort((a, b) => a.day - b.day)

  /** Repeat-failure analysis (§13B) — read straight off assessment attempts. */
  const repeatFailures = useMemo(
    () =>
      team
        .map((member) => {
          const fails = evidenceFor(member).filter(
            (e) => e.knowledge && !e.knowledge.passed && e.knowledge.attempts >= 2,
          )
          return { member, count: fails.length }
        })
        .filter((x) => x.count > 0)
        .sort((a, b) => b.count - a.count),
    [team],
  )

  return (
    <div className="max-w-5xl mx-auto px-5 py-8 space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-accent-copper flex items-center gap-2">
          <Users size={14} /> Manager Hub
        </p>
        <h1 className="mt-2 text-2xl md:text-3xl font-semibold text-ink-primary">
          Who on your team can <em className="italic">actually</em> do the job
        </h1>
        <p className="mt-2 text-sm text-ink-secondary max-w-2xl">
          Verified capability for your reporting line, the gaps that are blocking it, and whose
          action closes each one. Learning hours and logins are not shown here — they are activity,
          not capability.
        </p>
      </header>

      <DemoDataNotice />

      {/* ── Scope ────────────────────────────────────────────────────── */}
      <section className={cn(CARD, 'p-4 flex flex-col sm:flex-row sm:items-center gap-3')}>
        <label className="text-xs uppercase tracking-wide text-ink-tertiary" htmlFor="manager-select">
          Reporting line
        </label>
        <select
          id="manager-select"
          value={managerId}
          onChange={(e) => setManagerId(e.target.value)}
          className="flex-1 sm:flex-none sm:min-w-[280px] rounded-full bg-[rgba(0,59,70,0.05)] px-4 py-2 text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-accent-copper/40"
        >
          {managerOptions.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} — {m.role}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-ink-tertiary sm:ml-auto sm:text-right max-w-xs">
          {team.length} {team.length === 1 ? 'person' : 'people'} in {manager.name}’s line ·{' '}
          {departmentBySlug(manager.departmentSlug)?.name}. In live mode a manager sees only their own
          line — this selector exists for demo review (§19).
        </p>
      </section>

      {/* ── KPI strip ────────────────────────────────────────────────── */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard
          label="Role ready"
          value={`${mix.readyPct}%`}
          sub={`${mix.role_ready} of ${mix.total - mix.no_framework} with a framework`}
          metaKey="ready"
          tone={mix.readyPct >= 70 ? 'good' : mix.readyPct >= 40 ? 'warn' : 'bad'}
          icon={Gauge}
        />
        <KpiCard
          label="Critical gaps"
          value={String(criticalGapCount)}
          sub="Approved-critical competencies below required"
          metaKey="critical"
          tone={criticalGapCount === 0 ? 'good' : 'bad'}
          icon={ShieldCheck}
        />
        <KpiCard
          label="With an assessor"
          value={String(practicalsPending)}
          sub="Practical evidence awaiting a decision"
          metaKey="practicals"
          tone={practicalsPending === 0 ? 'neutral' : 'warn'}
          icon={ClipboardCheck}
        />
        <KpiCard
          label="Expiry exposure"
          value={String(expiryExposure)}
          sub="Expired, or expiring within 90 days"
          metaKey="expiring"
          tone={expiryExposure === 0 ? 'good' : 'warn'}
          icon={CalendarClock}
        />
        <KpiCard
          label="Time to proficiency"
          value={ttp.median == null ? 'No data' : `${ttp.median}d`}
          sub={
            ttp.median == null
              ? 'Nobody in this line is role-ready yet'
              : `Median, n=${ttp.sampleSize}`
          }
          metaKey="ttp"
          icon={RotateCcw}
        />
      </section>

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors',
              tab === t.id
                ? 'bg-ink-primary text-parchment'
                : 'bg-[rgba(0,59,70,0.06)] text-ink-secondary hover:text-ink-primary',
            )}
          >
            <t.icon size={15} /> {t.label}
            {t.id === 'queue' && queue.length > 0 && (
              <span className="ml-0.5 text-[11px] px-1.5 rounded-full bg-surface-rose/40 text-ink-primary">
                {queue.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'queue' && (
        <section className="space-y-3">
          {queue.length === 0 ? (
            <p className="text-sm text-ink-tertiary py-8 text-center">
              Nothing is blocking capability in this line right now.
            </p>
          ) : (
            <>
              <p className="text-xs text-ink-secondary">
                Ordered by what is blocking capability — approved-critical gaps first. Recording an
                action never changes a score: only an assessor can close a practical (§19).
              </p>
              {queue.slice(0, 25).map((item) => (
                <QueueRow key={`${item.member.id}:${item.row.competencyId}:${item.rank}`} item={item} />
              ))}
              {queue.length > 25 && (
                <p className="text-[11px] text-ink-tertiary text-center">
                  Showing the top 25 of {queue.length} items by blocking severity.
                </p>
              )}
            </>
          )}
        </section>
      )}

      {tab === 'team' && (
        <section className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {(['all', 'not_role_ready', 'developing', 'role_ready', 'not_assessed', 'no_framework'] as const).map(
              (s) => {
                const count =
                  s === 'all' ? cohort.length : cohort.filter((c) => c.verdict.status === s).length
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={cn(
                      'text-xs px-3 py-1.5 rounded-full transition-colors',
                      statusFilter === s
                        ? 'bg-ink-primary text-parchment'
                        : 'bg-[rgba(0,59,70,0.06)] text-ink-secondary hover:text-ink-primary',
                    )}
                  >
                    {s === 'all' ? 'Everyone' : READINESS_LABEL[s]} ({count})
                  </button>
                )
              },
            )}
          </div>

          {visibleTeam.length === 0 ? (
            <p className="text-sm text-ink-tertiary py-8 text-center">
              Nobody in this line is in that state.
            </p>
          ) : (
            visibleTeam.map(({ member, verdict }) => {
              const day = onboardingDay(member)
              return (
                <article key={member.id} className={cn(CARD, 'p-4')}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-sm font-medium text-ink-primary">
                        <ReadinessDot status={verdict.status} />
                        {member.name}
                        <span className="font-normal text-ink-tertiary">· {member.role}</span>
                      </p>
                      <p className="text-[11px] text-ink-tertiary mt-0.5">
                        {member.location} · {member.employmentType} · {daysBetween(member.joinedOn, DEMO_AS_OF)}{' '}
                        days in role
                        {day != null ? ` · onboarding day ${day} of 90` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <ReadinessBadge status={verdict.status} size="sm" />
                      <span className="text-sm text-ink-primary font-medium">
                        {verdict.coveragePct}%
                      </span>
                    </div>
                  </div>

                  {verdict.criticalBlockers.length > 0 && (
                    <p className="mt-2 text-xs text-ink-secondary">
                      <strong className="text-ink-primary">Blocked by:</strong>{' '}
                      {verdict.criticalBlockers.map((b) => b.name).join(', ')}
                    </p>
                  )}
                  {verdict.nextAction && (
                    <p className="mt-1.5 text-xs text-ink-secondary flex flex-wrap items-center gap-1.5">
                      <span className="text-ink-tertiary uppercase tracking-wide text-[10px]">
                        Next
                      </span>
                      {verdict.nextAction.label}
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[rgba(0,59,70,0.08)]">
                        {verdict.nextAction.owner}
                      </span>
                    </p>
                  )}
                </article>
              )
            })
          )}

          {repeatFailures.length > 0 && (
            <div className={cn(CARD, 'p-4')}>
              <h3 className="text-sm font-semibold text-ink-primary">Repeated assessment failures</h3>
              <p className="text-[11px] text-ink-tertiary mt-0.5">
                Two or more attempts without a pass. §14: check for a non-training root cause before
                assigning more learning — the content, the system or the process may be the problem.
              </p>
              <ul className="mt-2 space-y-1">
                {repeatFailures.map(({ member, count }) => (
                  <li key={member.id} className="text-xs text-ink-secondary">
                    <span className="text-ink-primary">{member.name}</span> — {count}{' '}
                    {count === 1 ? 'competency' : 'competencies'} with repeated failures
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {tab === 'critical' && (
        <section className="space-y-4">
          <div className={cn(CARD, 'p-5')}>
            <h3 className="text-sm font-semibold text-ink-primary">Critical skill-gap heatmap</h3>
            <p className="text-[11px] text-ink-tertiary mt-0.5 mb-3">
              Approved-critical and proposed-critical competencies only. Each cell shows validated
              against required.
            </p>
            <CriticalHeatmap team={team} />
          </div>

          <div className={cn(CARD, 'p-5')}>
            <h3 className="text-sm font-semibold text-ink-primary">Weighted skill risk</h3>
            <p className="text-[11px] text-ink-tertiary mt-0.5 mb-3">
              Total gap × criticality weight × people affected — the order to fix things in.
            </p>
            <div className="space-y-2">
              {risk.slice(0, 10).map((r) => (
                <div
                  key={r.competencyId}
                  className="flex items-center gap-3 border-b border-[rgba(0,59,70,0.06)] last:border-0 pb-2 last:pb-0"
                >
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm text-ink-primary truncate">{r.name}</span>
                    <span className="flex items-center gap-1.5 mt-0.5">
                      <CriticalityChip criticality={r.criticality} />
                      <span className="text-[11px] text-ink-tertiary">
                        {r.affected} of {r.applicable} short · coverage {r.coveragePct}%
                      </span>
                    </span>
                  </span>
                  <span className="w-24 flex-shrink-0">
                    <span
                      className="block h-2 rounded-full bg-accent-copper"
                      style={{
                        width: `${Math.max(6, Math.round((r.weightedRisk / (risk[0]?.weightedRisk || 1)) * 100))}%`,
                      }}
                    />
                  </span>
                  <span className="text-xs text-ink-secondary w-8 text-right flex-shrink-0">
                    {r.weightedRisk}
                  </span>
                </div>
              ))}
              {risk.length === 0 && (
                <p className="text-sm text-ink-tertiary">No competency requirements to assess yet.</p>
              )}
            </div>
          </div>
        </section>
      )}

      {tab === 'onboarding' && (
        <section className="space-y-3">
          <p className="text-xs text-ink-secondary">
            The 0/30/60/90-day plan (§20). A new joiner who is not yet role-ready is on plan — this
            view exists so they are coached, not flagged.
          </p>
          {newJoiners.length === 0 ? (
            <p className="text-sm text-ink-tertiary py-8 text-center">
              Nobody in this line is inside their first 90 days.
            </p>
          ) : (
            newJoiners.map(({ member, day }) => {
              const verdict = verdictFor(member)
              const milestone = day <= 30 ? 30 : day <= 60 ? 60 : 90
              return (
                <article key={member.id} className={cn(CARD, 'p-4')}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-sm font-medium text-ink-primary">
                        {member.name}
                        <span className="font-normal text-ink-tertiary"> · {member.role}</span>
                      </p>
                      <p className="text-[11px] text-ink-tertiary">
                        Joined {member.joinedOn}
                        {member.cohort ? ` · ${member.cohort}` : ''}
                      </p>
                    </div>
                    <ReadinessBadge status={verdict.status} size="sm" />
                  </div>
                  <div className="mt-3">
                    <div className="h-2 rounded-full bg-[rgba(0,59,70,0.08)] overflow-hidden">
                      <div
                        className="h-full bg-accent-copper"
                        style={{ width: `${Math.min(100, Math.round((day / 90) * 100))}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-ink-tertiary">
                      Day {day} of 90 — next review at day {milestone}. Verified coverage{' '}
                      {verdict.coveragePct}%.
                    </p>
                  </div>
                  {verdict.nextAction && (
                    <p className="mt-2 text-xs text-ink-secondary">
                      Next: {verdict.nextAction.label}{' '}
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[rgba(0,59,70,0.08)]">
                        {verdict.nextAction.owner}
                      </span>
                    </p>
                  )}
                </article>
              )
            })
          )}
        </section>
      )}

      <p className="text-[11px] text-ink-tertiary">
        Capability ratings here are developmental. §19: they must not be the sole basis for
        compensation, promotion or disciplinary decisions. Individual learner detail is in the{' '}
        <Link href="/skills-passport" className="underline hover:text-ink-primary">
          Skills Passport
        </Link>
        .
      </p>
    </div>
  )
}
