'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Bell, Monitor, Moon, ShieldCheck, Sun, User } from 'lucide-react'
import { Card, PageHeader, Section, StatusBadge } from '@/components/ds'
import { useRole } from '@/lib/role-context'
import { ROLE_DESCRIPTION, ROLE_LABEL } from '@/lib/roles'
import { departmentBySlug, memberById } from '@/data/workforce'
import { useNotificationStore } from '@/lib/notification-store'
import { formatDate } from '@/lib/learning-plan'
import { cn } from '@/lib/utils'

/**
 * Settings — profile, appearance and notifications.
 *
 * Notification preferences are stored locally and clearly labelled as such:
 * the delivery job that would honour them server-side is not wired up yet, and
 * a toggle that silently does nothing is worse than one that says so.
 */

function Toggle({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-hairline/6 last:border-0">
      <div className="min-w-0">
        <label htmlFor={id} className="text-[13px] font-medium text-ink-primary cursor-pointer">
          {label}
        </label>
        <p className="text-[11px] text-ink-secondary mt-0.5">{description}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-10 h-6 rounded-full flex-shrink-0 transition-colors',
          checked ? 'bg-accent-copper' : 'bg-[rgb(var(--rule)/0.18)]',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-xs transition-transform',
            checked ? 'translate-x-[18px]' : 'translate-x-0.5',
          )}
        />
      </button>
    </div>
  )
}

const PREF_KEY = 'magppie-ld-notification-prefs'

const PREFS = [
  { id: 'due', label: 'Due-date reminders', description: 'A reminder before each item falls due.' },
  { id: 'overdue', label: 'Overdue alerts', description: 'An alert the day an item passes its due date.' },
  { id: 'expiry', label: 'Expiry warnings', description: 'A warning 90 days before a validation lapses.' },
  { id: 'approvals', label: 'Approvals and attestations', description: 'When a manager rating or assessor observation is filed against you.' },
] as const

export default function Settings() {
  const { role, member } = useRole()
  const { theme, setTheme } = useTheme()
  const notifications = useNotificationStore((s) => s.notifications)
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    due: true,
    overdue: true,
    expiry: true,
    approvals: true,
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const raw = window.localStorage.getItem(PREF_KEY)
      if (raw) setPrefs((p) => ({ ...p, ...JSON.parse(raw) }))
    } catch {
      /* storage unavailable — defaults still apply */
    }
  }, [])

  function update(id: string, v: boolean) {
    const next = { ...prefs, [id]: v }
    setPrefs(next)
    try {
      window.localStorage.setItem(PREF_KEY, JSON.stringify(next))
    } catch {
      /* non-fatal */
    }
  }

  const dept = member ? departmentBySlug(member.departmentSlug) : undefined
  const manager = memberById(member?.managerId)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Your profile, how the portal looks, and what it tells you about."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Profile" description="Read from the workforce register.">
          {member ? (
            <dl className="space-y-2 text-[13px]">
              {[
                ['Name', member.name],
                ['Job title', member.role],
                ['Department', dept?.name ?? member.departmentSlug],
                ['Location', member.location],
                ['Employment type', member.employmentType],
                ['Joined', formatDate(member.joinedOn)],
                ['Reports to', manager?.name ?? 'No manager on record'],
                ['Cohort', member.cohort ?? 'Not part of an intake cohort'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-ink-secondary">{k}</dt>
                  <dd className="text-ink-primary text-right">{v}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-[13px] text-ink-secondary">
              No employee record is linked to this account.
            </p>
          )}
          <p className="text-[11px] text-ink-tertiary mt-4 pt-3 border-t border-hairline/8">
            <User size={11} className="inline mr-1" aria-hidden />
            Profile fields come from the HRMS and are not editable here. Raise a change with Human
            Resources.
          </p>
        </Section>

        <Section title="Access" description="What your portal role lets you see.">
          <div className="flex items-center gap-2">
            <StatusBadge tone="info" label={ROLE_LABEL[role]} icon={ShieldCheck} />
          </div>
          <p className="text-[13px] text-ink-secondary mt-2.5">{ROLE_DESCRIPTION[role]}</p>
          <p className="text-[11px] text-ink-tertiary mt-4 pt-3 border-t border-hairline/8">
            Roles are derived from job level in the HRMS import (level 1 Executive, 2 Manager, 3
            Head) and can be overridden per person by an L&amp;D administrator. You cannot change
            your own role.
          </p>
        </Section>
      </div>

      <Section
        title="Appearance"
        description="Light is the default. Dark mode is fully supported across every screen."
      >
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['light', 'Light', Sun],
              ['dark', 'Dark', Moon],
              ['system', 'Match system', Monitor],
            ] as const
          ).map(([value, label, Icon]) => {
            const on = mounted && theme === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                aria-pressed={on}
                className={cn(
                  'inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-[13px] font-medium transition-colors',
                  on
                    ? 'border-accent-copper bg-accent-copper/10 text-ink-primary'
                    : 'border-hairline/15 bg-parchment text-ink-secondary hover:text-ink-primary',
                )}
              >
                <Icon size={15} aria-hidden />
                {label}
              </button>
            )
          })}
        </div>
      </Section>

      <Section
        title="Notifications"
        description="What the portal should tell you about."
        meta={`${notifications.filter((n) => !n.read).length} unread in your notification centre`}
      >
        <div>
          {PREFS.map((p) => (
            <Toggle
              key={p.id}
              id={`pref-${p.id}`}
              label={p.label}
              description={p.description}
              checked={prefs[p.id] ?? true}
              onChange={(v) => update(p.id, v)}
            />
          ))}
        </div>
        <p className="text-[11px] text-ink-tertiary mt-4 pt-3 border-t border-hairline/8">
          <Bell size={11} className="inline mr-1" aria-hidden />
          These preferences are saved to this browser. Email and WhatsApp delivery honour them once
          the scheduled notification job is connected — until then, notifications appear in the
          portal only.
        </p>
      </Section>
    </div>
  )
}
