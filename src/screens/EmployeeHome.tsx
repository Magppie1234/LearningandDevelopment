'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  GraduationCap,
  Megaphone,
  Sparkles,
  Target,
} from 'lucide-react'
import {
  Button,
  Card,
  Empty,
  Kpi,
  KpiGrid,
  Notice,
  PageHeader,
  ProgressBar,
  Section,
  StatusBadge,
} from '@/components/ds'
import { useRole } from '@/lib/role-context'
import { useDataSource } from '@/lib/data-source'
import ReadinessRing from '@/components/learning/ReadinessRing'
import DataFreshness from '@/components/learning/DataFreshness'
import ValidationTrend from '@/components/learning/ValidationTrend'
import { buildValidationTrend, isFlat } from '@/lib/readiness-trend'
import { canChartStoredHistory } from '@/lib/learner-dataset'
import {
  DUE_POLICY_NOTE,
  STATUS_LABEL,
  STATUS_TONE,
  formatDate,
  formatDue,
  planFor,
  type LearningItem,
} from '@/lib/learning-plan'
import { DEMO_AS_OF } from '@/data/capability-evidence'
import { READINESS_LABEL } from '@/lib/role-readiness'
import { departmentBySlug } from '@/data/workforce'
import { useNotificationStore } from '@/lib/notification-store'
import { cn } from '@/lib/utils'

/**
 * Employee home.
 *
 * The previous landing was a decorative kitchen illustration plus an empty
 * progress panel: it answered none of the six questions a learner opens the
 * portal with. This page answers them in order of urgency — what is overdue,
 * what to do next, how far along am I, which skills are short, what expires,
 * what is recommended — and puts the single next action in the first card so
 * resuming is one click, not a hunt.
 *
 * Every number is derived by `lib/learning-plan.ts` from the person's role
 * competency framework and their recorded evidence. Nothing is hardcoded, and
 * where a framework has not been authored the page says so instead of
 * rendering a confident zero.
 */

function ItemRow({ item, showDue = true }: { item: LearningItem; showDue?: boolean }) {
  const late = item.status === 'overdue' || item.status === 'expired'
  return (
    <li className="flex items-start gap-3 py-3 border-b border-hairline/6 last:border-0">
      <span
        className={cn(
          'mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
          late ? 'bg-danger-bg text-danger' : 'bg-cream text-ink-tertiary',
        )}
        aria-hidden
      >
        {late ? <AlertTriangle size={15} /> : <BookOpen size={15} />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link
            href={item.href}
            className="text-[13px] font-medium text-ink-primary hover:text-accent-copper transition-colors"
          >
            {item.title}
          </Link>
          {item.mandatory && (
            <StatusBadge tone="danger" label="Mandatory" size="sm" icon={Target} />
          )}
          <StatusBadge
            tone={STATUS_TONE[item.status]}
            label={STATUS_LABEL[item.status]}
            size="sm"
          />
        </div>
        <p className="text-[11px] text-ink-secondary mt-1">{item.nextStep}</p>
        <div className="mt-1.5 flex items-center gap-3 max-w-[260px]">
          <ProgressBar
            value={item.progressPct}
            tone={late ? 'danger' : item.progressPct > 0 ? 'info' : 'neutral'}
            size="sm"
            label={`${item.title} progress`}
          />
          <span className="text-[11px] text-ink-tertiary tnum whitespace-nowrap">
            Level {item.validated}/{item.required}
          </span>
        </div>
      </div>
      {showDue && (
        <span
          className={cn(
            'text-[11px] tnum whitespace-nowrap flex-shrink-0 text-right',
            late ? 'text-danger-fg font-medium' : 'text-ink-tertiary',
          )}
          title={`Due ${formatDate(item.dueOn)}`}
        >
          {formatDue(item.daysRemaining)}
        </span>
      )}
    </li>
  )
}

/**
 * Shown when Home is asked for the signed-in employee's own record and the
 * portal cannot produce one. It names the specific missing piece rather than
 * shrugging, because the two causes have completely different owners: an
 * unconfigured project is a deployment task, an unauthenticated viewer just
 * needs to sign in.
 */
function LiveDataUnavailable({
  reason,
  onUseSample,
}: {
  reason: 'unconfigured' | 'unauthenticated' | null
  onUseSample: () => void
}) {
  const unconfigured = reason === 'unconfigured'
  return (
    <div className="space-y-6">
      <PageHeader
        title="Your learning data isn't connected yet"
        description="Home shows your own record — not a sample of someone else's."
      />
      <Empty
        icon={Target}
        headline={
          unconfigured
            ? 'This deployment has no learning backend attached'
            : 'Sign in to see your learning plan'
        }
        support={
          unconfigured
            ? 'Your progress, role readiness and deadlines are read from your own records at sign-in. This build has no Supabase project configured, so there are no records to read. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, run the migrations in supabase/migrations, and import the workforce from the HRMS. Note that competency evidence — manager ratings, knowledge and practical assessments, work-product sign-off — has no table in the current schema, so role readiness needs that added before it can be computed from live data.'
            : 'You are browsing as a guest. Sign in with your Magppie account and Home will show your assigned courses, deadlines, role readiness and skill gaps.'
        }
        action={
          <Button variant="secondary" onClick={onUseSample}>
            Explore with sample data
          </Button>
        }
      />
    </div>
  )
}

export default function EmployeeHome() {
  const { member } = useRole()
  const { source, setSource, liveAvailable, liveBlockedReason, ready } = useDataSource()
  const notifications = useNotificationStore((s) => s.notifications)

  const plan = useMemo(() => (member ? planFor(member, DEMO_AS_OF) : null), [member])

  /**
   * Trend reconstructed from evidence dates — see lib/readiness-trend.ts for
   * why this is not the same thing as stored history, and what that costs.
   */
  const trend = useMemo(
    () => (plan ? buildValidationTrend(plan.verdict.rows, plan.asOf, 6) : []),
    [plan],
  )

  // Hold the frame until the stored source preference has been read, so a
  // viewer who chose sample data does not see the live-mode empty state flash
  // past first.
  if (!ready) {
    return <div className="min-h-[60vh]" aria-busy="true" aria-label="Loading your learning plan" />
  }

  // Live is the default source. When it cannot be served we say so and stop —
  // we do NOT quietly render the sample cohort, because a learner cannot tell
  // the difference and would act on someone else's numbers.
  if (source === 'live' && !liveAvailable) {
    return <LiveDataUnavailable reason={liveBlockedReason} onUseSample={() => setSource('sample')} />
  }

  if (!member || !plan) {
    return (
      <Empty
        icon={BookOpen}
        headline="No employee record linked to this account"
        support="Your learning plan is built from your role's competency framework in the HRMS. Ask your L&D administrator to link your employee record."
      />
    )
  }

  const dept = departmentBySlug(member.departmentSlug)
  const { counts, verdict } = plan
  const urgent = plan.items.filter((i) => i.status === 'overdue' || i.status === 'expired')
  const upcoming = plan.items
    .filter((i) => i.status !== 'completed' && i.daysRemaining >= 0)
    .slice(0, 5)
  const gaps = verdict.gaps.slice(0, 5)
  const unread = notifications.filter((n) => !n.read)

  const hour = new Date(DEMO_AS_OF).getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = member.name.split(' ')[0]

  if (!plan.hasFramework) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={`${greeting}, ${firstName}`}
          description={`${member.role} · ${dept?.name ?? member.departmentSlug}`}
        />
        <Empty
          icon={Compass}
          headline="Your department's competency framework hasn't been authored yet"
          support={`No competencies have been defined for ${dept?.name ?? 'your department'}, so there is nothing to assign, measure or certify against yet. Your Department Head (${dept?.head ?? 'not set'}) and Learning Champion (${dept?.champion ?? 'not set'}) own authoring it. Until then you can still browse the catalogue and the SOP library.`}
          action={
            <>
              <Button href="/catalogue" variant="primary" icon={GraduationCap}>
                Browse catalogue
              </Button>
              <Button href="/knowledge">Open SOP library</Button>
            </>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting}, ${firstName}`}
        description={
          <>
            {member.role} · {dept?.name ?? member.departmentSlug}
            {plan.onboardingDay != null && (
              <> · Day {plan.onboardingDay} of your 90-day onboarding</>
            )}
          </>
        }
        actions={
          <>
            <Button href="/my-learning" icon={BookOpen}>
              All my learning
            </Button>
            <Button href="/skills-passport" icon={BadgeCheck} variant="secondary">
              My skills
            </Button>
          </>
        }
      />

      {/*
        Freshness stated once, at the top, instead of a fixed date repeated on
        every card. The old "As of 30 Jul 2026" was the reporting date — real,
        but read as "last refreshed", which promised a currency the page did
        not have. Live mode gets a wall-clock time and a working Refresh;
        sample mode gets neither, because the fixture cannot go stale and a
        Refresh button over it would be theatre.
      */}
      <DataFreshness
        source={source}
        asOfLabel={formatDate(plan.asOf)}
        onRefresh={source === 'live' ? () => window.location.reload() : undefined}
      />

      {/* 1 — What requires attention. Only rendered when something does. */}
      {urgent.length > 0 && (
        <Notice tone="danger" icon={AlertTriangle}>
          {(() => {
            const mandatory = urgent.filter((i) => i.mandatory).length
            const one = urgent.length === 1
            return (
              <>
                <strong>
                  {one ? '1 item is' : `${urgent.length} items are`} past due.
                </strong>{' '}
                {mandatory > 0 &&
                  (one
                    ? 'It is mandatory, so it is blocking your role readiness. '
                    : `${mandatory} of them ${mandatory === 1 ? 'is' : 'are'} mandatory and ${mandatory === 1 ? 'is' : 'are'} blocking your role readiness. `)}
                {one ? 'Next step:' : (
                  <>
                    Start with <strong>{urgent[0].title}</strong> —{' '}
                  </>
                )}{' '}
                {urgent[0].nextStep.charAt(0).toLowerCase() + urgent[0].nextStep.slice(1)}.
              </>
            )
          })()}
        </Notice>
      )}

      {/* 2 — Continue learning: the single next action, one click away. */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-tertiary">
              {plan.next ? 'Continue learning' : 'Your plan'}
            </p>
            {plan.next ? (
              <>
                <h2 className="font-serif text-2xl font-semibold text-ink-primary mt-1.5 leading-tight">
                  {plan.next.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <StatusBadge
                    tone={STATUS_TONE[plan.next.status]}
                    label={STATUS_LABEL[plan.next.status]}
                    size="sm"
                  />
                  {plan.next.mandatory && (
                    <StatusBadge tone="danger" label="Mandatory" size="sm" icon={Target} />
                  )}
                  <span className="text-[11px] text-ink-tertiary">
                    {plan.next.academy} · due {formatDate(plan.next.dueOn)} (
                    {formatDue(plan.next.daysRemaining)})
                  </span>
                </div>
                <p className="text-sm text-ink-secondary mt-3">
                  <strong className="text-ink-primary">Next step:</strong> {plan.next.nextStep}.
                  {plan.next.heldBackBy && (
                    <> Currently held at level {plan.next.validated} by {plan.next.heldBackBy}.</>
                  )}
                </p>
                <div className="mt-3 max-w-sm">
                  <ProgressBar
                    value={plan.next.progressPct}
                    tone={plan.next.status === 'overdue' ? 'danger' : 'info'}
                    label="Progress on this competency"
                  />
                </div>
              </>
            ) : (
              <>
                <h2 className="font-serif text-2xl font-semibold text-ink-primary mt-1.5">
                  Everything on your plan is validated
                </h2>
                <p className="text-sm text-ink-secondary mt-2">
                  All {counts.total} competencies your role requires are validated at or above the
                  required level. Keep an eye on the expiry dates below.
                </p>
              </>
            )}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {plan.next ? (
              <>
                <Button href={plan.next.href} variant="primary" icon={ArrowRight}>
                  {plan.next.owner === 'Learner' ? 'Resume' : 'Open'}
                </Button>
                <Button href="/my-learning">See all {counts.total - counts.completed} open items</Button>
              </>
            ) : (
              <Button href="/catalogue" variant="primary" icon={GraduationCap}>
                Explore optional learning
              </Button>
            )}
          </div>
        </Card>

        {/* Role readiness — the one number that says whether they can do the job. */}
        <Card className="flex flex-col">
          <p className="text-[11px] font-medium uppercase tracking-wide text-ink-tertiary">
            Role readiness
          </p>
          {/*
            The ring supplements the figure and the badge — it never replaces
            them. Coverage alone cannot say whether someone is role ready: one
            approved-critical gap holds the verdict regardless of how high the
            percentage runs. So the arc is tinted by the VERDICT, not by the
            number, and 90% with a critical gap draws red rather than
            near-complete green.
          */}
          <div className="mt-3 flex justify-center">
            <ReadinessRing
              pct={verdict.coveragePct}
              tone={
                verdict.status === 'role_ready'
                  ? 'success'
                  : verdict.status === 'not_role_ready'
                    ? 'danger'
                    : verdict.status === 'developing'
                      ? 'warning'
                      : 'neutral'
              }
              label={`${counts.completed} of ${counts.total} validated`}
            />
          </div>
          <div className="mt-3">
            <StatusBadge
              tone={
                verdict.status === 'role_ready'
                  ? 'success'
                  : verdict.status === 'not_role_ready'
                    ? 'danger'
                    : verdict.status === 'developing'
                      ? 'warning'
                      : 'neutral'
              }
              label={READINESS_LABEL[verdict.status]}
            />
          </div>
          {verdict.nextAction && (
            <p className="text-[11px] text-ink-secondary mt-3 leading-relaxed">
              <strong className="text-ink-primary">To progress:</strong> {verdict.nextAction.label}
              <span className="text-ink-tertiary"> ({verdict.nextAction.owner})</span>
            </p>
          )}
          {/*
            The one thing on this dashboard that shows change rather than a
            single number. Reconstructed from the evidence dates already on
            record — real dates, but NOT a stored history, and the caption says
            so. When every month is identical there is no trend to draw, and a
            flat line would imply a measurement that was never taken, so the
            honest note replaces the chart.
          */}
          {trend.length >= 2 && (
            <div className="mt-4 pt-4 border-t border-hairline/8">
              <p className="text-[11px] font-medium uppercase tracking-wide text-ink-tertiary">
                Validated over time
              </p>
              {isFlat(trend) ? (
                <p className="mt-2 text-[11px] leading-relaxed text-ink-tertiary">
                  No change across the last {trend.length} months — nothing new has been
                  validated in this window, so there is no trend to plot.
                </p>
              ) : (
                <ValidationTrend points={trend} height={96} />
              )}
              {/*
                Derived from the dataset's own state, not hardcoded. The
                caption was a fixed sentence saying no snapshots exist — true
                today, and exactly the kind of claim that goes stale silently
                the day the capture job starts running. Asking the dataset
                means the page stops overclaiming on its own.
              */}
              <p className="mt-2 text-[10px] leading-relaxed text-ink-tertiary">
                {canChartStoredHistory()
                  ? 'Read from stored point-in-time snapshots.'
                  : 'Rebuilt from recorded evidence dates, read against today’s requirements — no point-in-time snapshots are stored yet.'}
              </p>
            </div>
          )}

          <div className="mt-auto pt-4">
            <Button href="/skills-passport" size="sm" className="w-full">
              Open Skills Passport
            </Button>
          </div>
        </Card>
      </div>

      {/* 3 — Current performance at a glance. */}
      <KpiGrid columns={4}>
        <Kpi
          label="Plan completion"
          value={`${plan.completionPct}%`}
          caption={`${counts.completed} of ${counts.total} competencies validated`}
          tone={plan.completionPct >= 80 ? 'success' : plan.completionPct >= 50 ? 'warning' : 'danger'}
          statusLabel={
            plan.completionPct >= 80 ? 'On track' : plan.completionPct >= 50 ? 'Behind' : 'At risk'
          }
          icon={CheckCircle2}
          href="/my-learning"
          definition={{
            formula: 'Competencies validated at or above required level ÷ competencies your role requires',
            source: 'Role competency framework + recorded evidence',
            owner: dept?.champion,
          }}
        />
        <Kpi
          label="Mandatory compliance"
          value={plan.compliancePct == null ? '—' : `${plan.compliancePct}%`}
          caption={
            plan.compliancePct == null
              ? 'No approved-critical competencies for this role'
              : `${counts.mandatoryCompleted} of ${counts.mandatory} approved-critical validated`
          }
          tone={plan.compliancePct === 100 ? 'success' : 'danger'}
          statusLabel={plan.compliancePct === 100 ? 'Compliant' : 'Gap'}
          icon={ClipboardCheck}
          href="/my-learning?filter=mandatory"
          definition={{
            formula:
              'Approved-critical competencies validated ÷ approved-critical competencies required. Only approved criticality gates readiness.',
            source: 'Competency policy (approved-critical list) + evidence',
          }}
        />
        <Kpi
          label="Overdue"
          value={String(counts.overdue + counts.expired)}
          caption={
            counts.expired > 0
              ? `${counts.overdue} past due · ${counts.expired} expired validation`
              : 'Items past their derived due date'
          }
          tone={counts.overdue + counts.expired === 0 ? 'success' : 'danger'}
          statusLabel={counts.overdue + counts.expired === 0 ? 'Clear' : 'Action needed'}
          icon={AlertTriangle}
          href="/my-learning?filter=overdue"
          definition={{ formula: DUE_POLICY_NOTE, source: 'Role start date + competency criticality' }}
        />
        <Kpi
          label="Expiring in 90 days"
          value={String(plan.expiringSoon.length)}
          caption="Validations needing renewal soon"
          tone={plan.expiringSoon.length === 0 ? 'success' : 'warning'}
          statusLabel={plan.expiringSoon.length === 0 ? 'None due' : 'Plan renewal'}
          icon={CalendarClock}
          href="/certifications"
          definition={{
            formula: 'Competencies whose next validation date falls within 90 days of the reporting date',
            source: 'Evidence date + revalidation window (12 months critical, 24 months standard)',
          }}
        />
      </KpiGrid>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* 4 — Upcoming deadlines. */}
        <Section
          title="Upcoming deadlines"
          description="Your open items, soonest first."
          meta={DUE_POLICY_NOTE}
          action={
            <Link
              href="/my-learning"
              className="text-[11px] font-medium text-accent-copper hover:underline"
            >
              View all
            </Link>
          }
          padded={false}
        >
          {upcoming.length === 0 ? (
            <Empty
              compact
              icon={CheckCircle2}
              headline="Nothing due"
              support="You have no open items with a future due date. Anything overdue is called out at the top of this page."
            />
          ) : (
            <ul className="px-5 py-1">
              {upcoming.map((i) => (
                <ItemRow key={i.competencyId} item={i} />
              ))}
            </ul>
          )}
        </Section>

        {/* 5 — Which skills need improving. */}
        <Section
          title="Skills to improve"
          description="Where your validated level is below what the role requires."
          meta={`Proficiency scale 0–5 · reporting date ${formatDate(plan.asOf)}`}
          action={
            <Link
              href="/skills-passport"
              className="text-[11px] font-medium text-accent-copper hover:underline"
            >
              Skills Passport
            </Link>
          }
          padded={false}
        >
          {gaps.length === 0 ? (
            <Empty
              compact
              icon={BadgeCheck}
              headline="No skill gaps"
              support="Every competency your role requires is validated at or above the required level."
            />
          ) : (
            <ul className="px-5 py-1">
              {gaps.map((g) => (
                <li
                  key={g.competencyId}
                  className="flex items-start gap-3 py-3 border-b border-hairline/6 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13px] font-medium text-ink-primary">{g.name}</span>
                      {g.blocksReadiness && (
                        <StatusBadge tone="danger" label="Critical" size="sm" icon={Target} />
                      )}
                    </div>
                    <p className="text-[11px] text-ink-tertiary mt-0.5 capitalize">
                      {g.type} · {g.academy}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[13px] font-semibold text-ink-primary tnum">
                      {g.validated}
                      <span className="text-ink-tertiary font-normal">/{g.required}</span>
                    </p>
                    <p className="text-[11px] text-danger-fg tnum">
                      {g.gap} {g.gap === 1 ? 'level' : 'levels'} short
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* 6 — What's recommended for my role. */}
        <Section
          title="Recommended for your role"
          description={`Optional competencies in ${dept?.name ?? 'your department'} beyond your required set.`}
          className="lg:col-span-2"
          padded={false}
        >
          {(() => {
            const optional = plan.items.filter((i) => !i.mandatory && i.status !== 'completed')
            if (optional.length === 0) {
              return (
                <Empty
                  compact
                  icon={Sparkles}
                  headline="Nothing else recommended right now"
                  support="Everything beyond your mandatory set is already validated. The full catalogue is always open to browse."
                  action={
                    <Button size="sm" href="/catalogue">
                      Browse catalogue
                    </Button>
                  }
                />
              )
            }
            return (
              <ul className="px-5 py-1">
                {optional.slice(0, 4).map((i) => (
                  <ItemRow key={i.competencyId} item={i} />
                ))}
              </ul>
            )
          })()}
        </Section>

        {/* Announcements — real notifications, not invented marketing copy. */}
        <Section title="Announcements" description="Reminders and approvals for you." padded={false}>
          {unread.length === 0 ? (
            <Empty
              compact
              icon={Megaphone}
              headline="Nothing new"
              support="Certification reminders, approvals and nudges appear here."
            />
          ) : (
            <ul className="px-5 py-1">
              {unread.slice(0, 4).map((n) => (
                <li key={n.id} className="py-3 border-b border-hairline/6 last:border-0">
                  <Link href={n.linkUrl} className="block group">
                    <p className="text-[13px] font-medium text-ink-primary group-hover:text-accent-copper transition-colors">
                      {n.title}
                    </p>
                    <p className="text-[11px] text-ink-secondary mt-0.5 line-clamp-2">{n.body}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      {/* Certificates earned — derived, and honest when there are none. */}
      <Section
        title="Certifications"
        description="Competencies validated with a recorded validation date."
        meta={`Reporting date ${formatDate(plan.asOf)}`}
        action={
          <Link href="/certifications" className="text-[11px] font-medium text-accent-copper hover:underline">
            View all
          </Link>
        }
        padded={false}
      >
        {(() => {
          const certified = verdict.rows.filter((r) => r.gap === 0 && r.validatedOn && !r.expired)
          if (certified.length === 0) {
            return (
              <Empty
                compact
                icon={Award}
                headline="No certifications yet"
                support="A competency is certified once it is validated at the required level with a recorded validation date. Complete an assessment or book a practical observation to start."
                action={
                  plan.next ? (
                    <Button size="sm" variant="primary" href={plan.next.href}>
                      Start {plan.next.title}
                    </Button>
                  ) : undefined
                }
              />
            )
          }
          return (
            <ul className="px-5 py-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {certified.slice(0, 6).map((c) => (
                <li
                  key={c.competencyId}
                  className="flex items-start gap-2.5 rounded-xl border border-hairline/10 bg-cream px-3 py-2.5"
                >
                  <Award size={15} className="text-success mt-0.5 flex-shrink-0" aria-hidden />
                  <span className="min-w-0">
                    <span className="block text-[13px] font-medium text-ink-primary truncate">
                      {c.name}
                    </span>
                    <span className="block text-[11px] text-ink-tertiary">
                      Level {c.validated} · valid to {formatDate(c.nextValidationOn)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )
        })()}
      </Section>
    </div>
  )
}
