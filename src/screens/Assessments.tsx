'use client'

import { useMemo, useState } from 'react'
import {
  Award,
  ClipboardCheck,
  ClipboardList,
  RotateCcw,
  Target,
  UserCheck,
} from 'lucide-react'
import {
  Button,
  DataTable,
  Empty,
  Kpi,
  KpiGrid,
  Notice,
  PageHeader,
  Section,
  StatusBadge,
  type Column,
} from '@/components/ds'
import { useRole } from '@/lib/role-context'
import { DEMO_AS_OF, evidenceFor } from '@/data/capability-evidence'
import { assessmentStats, competencyById, formatDate, planFor } from '@/lib/learning-plan'
import { PROFICIENCY_LABEL } from '@/components/learning/ReadinessPrimitives'
import { CHANNEL_LABEL } from '@/lib/role-readiness'
import { cn } from '@/lib/utils'

/**
 * Assessments.
 *
 * One place for everything about being assessed: what has been attempted, what
 * was scored, what the pass mark bought, and what is still waiting on an
 * assessor or a manager.
 *
 * The page is explicit about a rule the readiness engine enforces and learners
 * routinely misread — a passed quiz does not by itself make someone competent.
 * A knowledge pass raises the ceiling to Advanced; reaching Independent still
 * needs a manager attestation, and critical competencies still need a practical
 * observation. Showing the score without that context is how a portal teaches
 * people to game the quiz.
 */

interface AttemptRow {
  competencyId: string
  name: string
  scorePct: number
  passed: boolean
  takenOn: string
  attempts: number
  /** Ceiling this attempt unlocked. */
  ceiling: number
  validated: number
  required: number
  practicalStatus: string
  managerRated: boolean
}

const PASS_MARK = 70

export default function Assessments() {
  const { member } = useRole()
  const [tab, setTab] = useState<'attempted' | 'pending'>('attempted')

  const data = useMemo(() => {
    if (!member) return null
    const plan = planFor(member, DEMO_AS_OF)
    const evidence = evidenceFor(member)
    const byId = new Map(evidence.map((e) => [e.competencyId, e]))

    const attempted: AttemptRow[] = plan.verdict.rows
      .filter((r) => byId.get(r.competencyId)?.knowledge)
      .map((r) => {
        const k = byId.get(r.competencyId)!.knowledge!
        return {
          competencyId: r.competencyId,
          name: r.name,
          scorePct: k.scorePct,
          passed: k.passed,
          takenOn: k.takenOn,
          attempts: k.attempts,
          ceiling: r.ceilings.knowledge,
          validated: r.validated,
          required: r.required,
          practicalStatus: r.practicalStatus,
          managerRated: r.ceilings.manager > 2,
        }
      })
      .sort((a, b) => b.takenOn.localeCompare(a.takenOn))

    const pending = plan.verdict.rows
      .filter((r) => !byId.get(r.competencyId)?.knowledge && r.gap > 0)
      .map((r) => ({
        competencyId: r.competencyId,
        name: r.name,
        required: r.required,
        validated: r.validated,
        blocks: r.blocksReadiness,
      }))

    return { plan, attempted, pending, stats: assessmentStats([member], DEMO_AS_OF) }
  }, [member])

  if (!member || !data) {
    return (
      <Empty
        icon={ClipboardList}
        headline="No employee record linked to this account"
        support="Assessment results are held against your employee record. Ask your L&D administrator to link it."
      />
    )
  }

  const { stats, attempted, pending, plan } = data
  const awaiting = plan.verdict.awaitingAssessor

  const columns: Column<AttemptRow>[] = [
    {
      key: 'name',
      header: 'Assessment',
      sortable: true,
      value: (r) => r.name,
      cell: (r) => <span className="font-medium text-ink-primary">{r.name}</span>,
    },
    {
      key: 'score',
      header: 'Best score',
      sortable: true,
      align: 'right',
      nowrap: true,
      value: (r) => r.scorePct,
      cell: (r) => (
        <span
          className={cn(
            'text-[13px] font-semibold tnum',
            r.passed ? 'text-success-fg' : 'text-danger-fg',
          )}
        >
          {r.scorePct}%
        </span>
      ),
    },
    {
      key: 'result',
      header: 'Result',
      sortable: true,
      nowrap: true,
      value: (r) => (r.passed ? 'Passed' : 'Failed'),
      cell: (r) => (
        <StatusBadge
          size="sm"
          tone={r.passed ? 'success' : 'danger'}
          label={r.passed ? 'Passed' : 'Not passed'}
        />
      ),
    },
    {
      key: 'attempts',
      header: 'Attempts',
      sortable: true,
      align: 'right',
      nowrap: true,
      value: (r) => r.attempts,
      cell: (r) => <span className="text-[12px] tnum text-ink-secondary">{r.attempts}</span>,
    },
    {
      key: 'unlocked',
      header: 'Level unlocked',
      sortable: true,
      nowrap: true,
      value: (r) => r.ceiling,
      cell: (r) => (
        <span className="text-[12px] text-ink-secondary">
          Up to {r.ceiling} — {PROFICIENCY_LABEL[r.ceiling]}
        </span>
      ),
    },
    {
      key: 'validated',
      header: 'Actually validated',
      sortable: true,
      nowrap: true,
      secondary: true,
      value: (r) => r.validated,
      cell: (r) => (
        <span className="text-[12px] tnum text-ink-secondary">
          {r.validated}/{r.required}
          {r.validated < r.ceiling && (
            <span className="text-ink-tertiary"> · held by another channel</span>
          )}
        </span>
      ),
    },
    {
      key: 'taken',
      header: 'Taken',
      sortable: true,
      align: 'right',
      nowrap: true,
      secondary: true,
      value: (r) => r.takenOn,
      cell: (r) => (
        <span className="text-[12px] tnum text-ink-secondary">{formatDate(r.takenOn)}</span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assessments"
        description="Your attempts, scores and what each result actually unlocked."
        actions={
          <Button href="/academies/monthly-quiz" variant="primary" icon={ClipboardCheck}>
            Take an assessment
          </Button>
        }
      />

      <Notice tone="info" icon={Target}>
        <strong>A pass raises a ceiling; it does not confer competence.</strong> Passing a knowledge
        assessment lifts the ceiling to Advanced (level 4), and a pass at 90%+ to Expert (5). Your
        validated level is the <em>lowest</em> ceiling across all four evidence channels, so
        reaching Independent (3) still requires your manager to attest to unsupervised performance,
        and critical competencies still require a practical observation. Pass mark is {PASS_MARK}%.
      </Notice>

      <KpiGrid columns={4}>
        <Kpi
          label="Attempts recorded"
          value={String(stats.attempts)}
          caption={`Across ${plan.counts.total} required competencies`}
          icon={ClipboardList}
          definition={{
            formula: 'Competencies with at least one recorded knowledge attempt',
            source: 'Knowledge-assessment evidence channel',
          }}
        />
        <Kpi
          label="Pass rate"
          value={stats.passRatePct == null ? '—' : `${stats.passRatePct}%`}
          caption={
            stats.attempts === 0
              ? 'Nothing attempted yet'
              : `${stats.passed} passed · ${stats.failed} not passed`
          }
          tone={stats.passRatePct == null ? 'neutral' : stats.passRatePct >= 80 ? 'success' : 'warning'}
          statusLabel={stats.passRatePct == null ? 'No data' : stats.passRatePct >= 80 ? 'Strong' : 'Review'}
          icon={Award}
          definition={{
            formula: 'Passed attempts ÷ recorded attempts',
            source: 'Knowledge-assessment evidence channel',
          }}
        />
        <Kpi
          label="Average score"
          value={stats.averageScorePct == null ? '—' : `${stats.averageScorePct}%`}
          caption={`Pass mark ${PASS_MARK}%`}
          tone={
            stats.averageScorePct == null
              ? 'neutral'
              : stats.averageScorePct >= 90
                ? 'success'
                : stats.averageScorePct >= PASS_MARK
                  ? 'info'
                  : 'danger'
          }
          statusLabel={
            stats.averageScorePct == null
              ? 'No data'
              : stats.averageScorePct >= 90
                ? 'Opens level 5'
                : stats.averageScorePct >= PASS_MARK
                  ? 'Opens level 4'
                  : 'Below pass mark'
          }
          icon={Target}
          definition={{
            formula: 'Mean best score across recorded attempts',
            source: 'Knowledge-assessment evidence channel',
          }}
        />
        <Kpi
          label="Needs reassessment"
          value={String(stats.needsReassessment)}
          caption="Attempts below the pass mark"
          tone={stats.needsReassessment === 0 ? 'success' : 'danger'}
          statusLabel={stats.needsReassessment === 0 ? 'None' : 'Retake'}
          icon={RotateCcw}
          definition={{
            formula: 'Recorded attempts that did not pass and are still short of the required level',
            source: 'Knowledge-assessment evidence channel',
          }}
        />
      </KpiGrid>

      {awaiting.length > 0 && (
        <Section
          title="With an assessor"
          description="Practical evidence you have submitted that is waiting on an observation."
          padded={false}
        >
          <ul className="divide-y divide-hairline/6">
            {awaiting.map((a) => (
              <li key={a.competencyId} className="flex items-center gap-3 px-5 py-3">
                <UserCheck size={15} className="text-info flex-shrink-0" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium text-ink-primary">{a.name}</span>
                  <span className="block text-[11px] text-ink-secondary">
                    {a.practicalReason ?? 'Practical observation required'}
                  </span>
                </span>
                <StatusBadge tone="info" label="Awaiting assessor" size="sm" />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section
        title="Your attempts"
        description="What you scored, and what that score actually unlocked."
        meta={`As of ${formatDate(DEMO_AS_OF)} · pass mark ${PASS_MARK}%`}
        padded={false}
      >
        <DataTable
          rows={attempted}
          columns={columns}
          rowKey={(r) => r.competencyId}
          searchPlaceholder="Search assessments…"
          exportName="my-assessment-results"
          pageSize={10}
          caption="Assessment attempts with score, result and the proficiency ceiling unlocked"
          emptyHeadline="No assessments attempted yet"
          emptySupport="Once you sit a knowledge assessment, your score, attempt count and the level it unlocks appear here."
          emptyAction={
            <Button size="sm" variant="primary" href="/academies/monthly-quiz">
              Take your first assessment
            </Button>
          }
        />
      </Section>

      <Section
        title="Not yet attempted"
        description="Required competencies with no assessment on record."
        meta={`${pending.length} of ${plan.counts.total} competencies`}
        padded={false}
      >
        {pending.length === 0 ? (
          <Empty
            compact
            icon={ClipboardCheck}
            headline="Everything has been attempted"
            support="Every required competency has at least one recorded assessment attempt."
          />
        ) : (
          <ul className="divide-y divide-hairline/6">
            {pending.map((p) => {
              const c = competencyById(p.competencyId)
              return (
                <li key={p.competencyId} className="flex items-start gap-3 px-5 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-medium text-ink-primary">{p.name}</span>
                      {p.blocks && <StatusBadge tone="danger" label="Critical" size="sm" icon={Target} />}
                    </span>
                    {c && (
                      <span className="block text-[11px] text-ink-tertiary mt-0.5 line-clamp-1">
                        {c.coreTopics}
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] text-ink-tertiary tnum whitespace-nowrap flex-shrink-0">
                    Needs level {p.required}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </Section>

      <Section title="How a validated level is decided" padded>
        <p className="text-[13px] text-ink-secondary leading-relaxed">
          Four independent channels each set a ceiling on your proficiency. Your validated level is
          the lowest of the four — never an average, and never above what has actually been
          verified.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2 mt-3">
          {(
            [
              ['knowledge', 'A pass opens level 4; a pass at 90%+ opens 5. No attempt or a fail holds you at Awareness (1).'],
              ['manager', 'Only your reporting manager can attest to unsupervised performance. With no rating on file the ceiling is Guided (2).'],
              ['practical', 'For critical and operational competencies, an assessor must observe the real task with every critical criterion met.'],
              ['workProduct', 'A real deliverable — a measurement sheet, a PO, a QC report — reviewed and accepted.'],
            ] as const
          ).map(([key, text]) => (
            <li key={key} className="rounded-xl border border-hairline/10 px-3 py-2.5">
              <p className="text-[12px] font-semibold text-ink-primary">{CHANNEL_LABEL[key]}</p>
              <p className="text-[11px] text-ink-secondary mt-0.5 leading-relaxed">{text}</p>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  )
}
