'use client'

import { useMemo } from 'react'
import {
  Award,
  CalendarClock,
  CheckCircle2,
  Clock,
  FileWarning,
  Info,
  ShieldCheck,
  Target,
} from 'lucide-react'
import {
  Button,
  DataTable,
  Empty,
  Kpi,
  KpiGrid,
  Notice,
  PageHeader,
  ProgressBar,
  Section,
  StatusBadge,
  type Column,
} from '@/components/ds'
import { useRole } from '@/lib/role-context'
import { DEMO_AS_OF } from '@/data/capability-evidence'
import { formatDate, formatDue, planFor } from '@/lib/learning-plan'
import { PROFICIENCY_LABEL } from '@/components/learning/ReadinessPrimitives'
import { departmentBySlug, daysBetween } from '@/data/workforce'
import type { ValidatedCompetency } from '@/lib/role-readiness'
import { CERTIFICATION_LEVELS } from '@/data/assessment-rules'
import { cn } from '@/lib/utils'

/**
 * Certifications.
 *
 * A "certification" in this portal is not a separate badge system — it is a
 * competency validated at or above the level its role requires, with a
 * recorded validation date and a revalidation date. Rebuilt from that
 * definition because the previous page displayed a fixed journey (Level 1
 * earned Oct 2023, Level 2 Mar 2024, 68% to Specialist) that was identical for
 * every signed-in user: authored sample content rendered as a personal record.
 *
 * Everything here traces to the same evidence the Skills Passport shows.
 */

type CertRow = ValidatedCompetency & { daysToExpiry: number | null }

export default function Certifications() {
  const { member } = useRole()

  const data = useMemo(() => {
    if (!member) return null
    const plan = planFor(member, DEMO_AS_OF)
    const rows: CertRow[] = plan.verdict.rows.map((r) => ({
      ...r,
      daysToExpiry:
        r.nextValidationOn == null
          ? null
          : r.nextValidationOn >= DEMO_AS_OF
            ? daysBetween(DEMO_AS_OF, r.nextValidationOn)
            : -daysBetween(r.nextValidationOn, DEMO_AS_OF),
    }))
    return {
      plan,
      earned: rows.filter((r) => r.gap === 0 && r.validatedOn && !r.expired),
      expired: rows.filter((r) => r.expired),
      expiring: rows.filter((r) => r.expiringSoon && !r.expired),
      inProgress: rows.filter((r) => r.gap > 0 && !r.expired),
      all: rows,
    }
  }, [member])

  if (!member || !data) {
    return (
      <Empty
        icon={Award}
        headline="No employee record linked to this account"
        support="Certifications are held against your employee record. Ask your L&D administrator to link it."
      />
    )
  }

  const { plan, earned, expired, expiring, inProgress, all } = data
  const dept = departmentBySlug(member.departmentSlug)

  if (!plan.hasFramework) {
    return (
      <div className="space-y-6">
        <PageHeader title="Certifications" description={`${member.role} · ${dept?.name}`} />
        <Empty
          icon={FileWarning}
          headline="No certifiable competencies for your department yet"
          support={`${dept?.name ?? 'Your department'} has no competency framework authored, so there is nothing that can be certified. ${dept?.head ?? 'The Department Head'} owns approving one.`}
        />
      </div>
    )
  }

  const columns: Column<CertRow>[] = [
    {
      key: 'name',
      header: 'Competency',
      sortable: true,
      value: (r) => r.name,
      cell: (r) => (
        <span className="flex flex-col gap-0.5">
          <span className="font-medium text-ink-primary">{r.name}</span>
          <span className="text-[11px] text-ink-tertiary">{r.academy}</span>
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      nowrap: true,
      value: (r) => (r.expired ? 'Expired' : r.gap === 0 ? 'Certified' : 'In progress'),
      cell: (r) => (
        <StatusBadge
          size="sm"
          tone={r.expired ? 'danger' : r.gap === 0 ? 'success' : 'info'}
          label={r.expired ? 'Expired' : r.gap === 0 ? 'Certified' : 'In progress'}
        />
      ),
    },
    {
      key: 'level',
      header: 'Level',
      sortable: true,
      nowrap: true,
      value: (r) => r.validated,
      cell: (r) => (
        <span className="text-[12px] text-ink-secondary tnum">
          {r.validated}/{r.required} · {PROFICIENCY_LABEL[r.validated]}
        </span>
      ),
    },
    {
      key: 'validated',
      header: 'Validated',
      sortable: true,
      nowrap: true,
      align: 'right',
      value: (r) => r.validatedOn,
      cell: (r) => (
        <span className="text-[12px] text-ink-secondary tnum">{formatDate(r.validatedOn)}</span>
      ),
    },
    {
      key: 'expiry',
      header: 'Valid until',
      sortable: true,
      nowrap: true,
      align: 'right',
      value: (r) => r.nextValidationOn,
      cell: (r) => (
        <span
          className={cn(
            'text-[12px] tnum',
            r.expired ? 'text-danger-fg font-medium' : r.expiringSoon ? 'text-warning-fg' : 'text-ink-secondary',
          )}
        >
          {formatDate(r.nextValidationOn)}
          {r.daysToExpiry != null && (r.expired || r.expiringSoon) && (
            <span className="block text-[10px]">{formatDue(r.daysToExpiry)}</span>
          )}
        </span>
      ),
    },
    {
      key: 'criticality',
      header: 'Criticality',
      secondary: true,
      nowrap: true,
      sortable: true,
      value: (r) => r.criticality,
      cell: (r) => (
        <span className="text-[12px] text-ink-secondary capitalize">
          {r.criticality === 'approved'
            ? 'Critical'
            : r.criticality === 'proposed'
              ? 'Critical (proposed)'
              : 'Standard'}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certifications"
        description="A competency is certified once it is validated at the level your role requires, with a recorded date. Certifications expire — a lapsed validation drops the competency back to Guided."
        actions={
          <Button href="/skills-passport" icon={ShieldCheck}>
            Evidence detail
          </Button>
        }
      />

      {expired.length > 0 && (
        <Notice tone="danger" icon={CalendarClock}>
          <strong>
            {expired.length} {expired.length === 1 ? 'certification has' : 'certifications have'}{' '}
            expired.
          </strong>{' '}
          An expired validation is not current evidence, so the competency has dropped back to
          Guided (level 2) and your role readiness has fallen with it. Book revalidation with your
          reporting manager.
        </Notice>
      )}
      {expiring.length > 0 && expired.length === 0 && (
        <Notice tone="warning" icon={Clock}>
          <strong>
            {expiring.length} {expiring.length === 1 ? 'certification lapses' : 'certifications lapse'}{' '}
            within 90 days.
          </strong>{' '}
          Schedule revalidation before the date to avoid a drop in readiness.
        </Notice>
      )}

      <KpiGrid columns={4}>
        <Kpi
          label="Certified"
          value={String(earned.length)}
          caption={`of ${all.length} required competencies`}
          tone={earned.length === all.length ? 'success' : 'info'}
          statusLabel={earned.length === all.length ? 'Fully certified' : 'In progress'}
          icon={Award}
          definition={{
            formula:
              'Competencies validated at or above the required level, with a recorded validation date and no lapse',
            source: 'Evidence across the four validation channels',
          }}
        />
        <Kpi
          label="In progress"
          value={String(inProgress.length)}
          caption="Below the required level"
          tone={inProgress.length === 0 ? 'success' : 'warning'}
          icon={Target}
          href="/my-learning"
          definition={{
            formula: 'Required competencies whose validated level is below the required level',
            source: 'Role competency framework + evidence',
          }}
        />
        <Kpi
          label="Expiring in 90 days"
          value={String(expiring.length)}
          caption="Revalidation due soon"
          tone={expiring.length === 0 ? 'success' : 'warning'}
          statusLabel={expiring.length === 0 ? 'None due' : 'Schedule'}
          icon={CalendarClock}
          definition={{
            formula: 'Validations whose next validation date falls within 90 days',
            source: 'Validation date + revalidation window',
          }}
        />
        <Kpi
          label="Expired"
          value={String(expired.length)}
          caption="Outside the revalidation window"
          tone={expired.length === 0 ? 'success' : 'danger'}
          statusLabel={expired.length === 0 ? 'All current' : 'Revalidate'}
          icon={FileWarning}
          definition={{
            formula: 'Validations whose next validation date has passed',
            source: 'Validation date + revalidation window (12 months critical, 24 months standard)',
          }}
        />
      </KpiGrid>

      <Section
        title="Role certification progress"
        description="Certification for your role is complete when every required competency is validated and current."
      >
        <ProgressBar
          value={all.length === 0 ? 0 : (earned.length / all.length) * 100}
          tone={earned.length === all.length ? 'success' : 'info'}
          label="Role certification progress"
        />
        <p className="text-[12px] text-ink-secondary mt-2.5">
          {earned.length} of {all.length} competencies certified.{' '}
          {plan.verdict.criticalBlockers.length > 0 && (
            <>
              <strong className="text-danger-fg">
                {plan.verdict.criticalBlockers.length} approved-critical{' '}
                {plan.verdict.criticalBlockers.length === 1 ? 'competency is' : 'competencies are'}{' '}
                short
              </strong>{' '}
              — these hard-gate certification regardless of the others.
            </>
          )}
        </p>
      </Section>

      <Section
        title="Your certifications"
        description="Every required competency with its validation and expiry dates."
        meta={`As of ${formatDate(DEMO_AS_OF)}`}
        padded={false}
      >
        <DataTable
          rows={all}
          columns={columns}
          rowKey={(r) => r.competencyId}
          searchPlaceholder="Search competencies…"
          exportName={`certifications-${member.name.replace(/\s+/g, '-').toLowerCase()}`}
          pageSize={12}
          caption="Certifications with level, validation date and expiry"
          emptyHeadline="No certifiable competencies"
          emptySupport="Your role has no competency framework authored yet."
        />
      </Section>

      <Section
        title="How certification levels work"
        description="The company-wide certification scale, from the L&D governance rules."
      >
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {CERTIFICATION_LEVELS.map((l, i) => (
            <li
              key={l.level}
              className="flex items-start gap-2.5 rounded-xl border border-hairline/10 px-3 py-2.5"
            >
              <span className="w-5 h-5 rounded-full bg-cream text-ink-tertiary text-[10px] font-semibold flex items-center justify-center flex-shrink-0 tnum">
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-[12px] font-semibold text-ink-primary">{l.level}</span>
                <span className="block text-[11px] text-ink-secondary leading-relaxed mt-0.5">
                  {l.meaning}
                </span>
              </span>
            </li>
          ))}
        </ol>
        <p className="text-[11px] text-ink-tertiary mt-3 flex items-start gap-1.5">
          <Info size={12} className="flex-shrink-0 mt-0.5" aria-hidden />
          Approved-critical competencies revalidate every 12 months; standard competencies every 24.
          A lapsed validation caps the competency at Guided (2) until it is reassessed.
        </p>
      </Section>

      {earned.length > 0 && (
        <Section
          title="Certificates earned"
          description="Available to download once certificate generation is connected."
          padded={false}
        >
          <ul className="px-5 py-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {earned.map((c) => (
              <li
                key={c.competencyId}
                className="flex items-start gap-2.5 rounded-xl border border-hairline/10 bg-cream px-3 py-2.5"
              >
                <CheckCircle2 size={15} className="text-success mt-0.5 flex-shrink-0" aria-hidden />
                <span className="min-w-0">
                  <span className="block text-[13px] font-medium text-ink-primary">{c.name}</span>
                  <span className="block text-[11px] text-ink-tertiary">
                    Level {c.validated} · validated {formatDate(c.validatedOn)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  )
}
