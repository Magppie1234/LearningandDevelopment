'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronDown, UserCog } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useRole } from '@/lib/role-context'
import { ROLE_DESCRIPTION, ROLE_LABEL, ROLES, identityFor, type Role } from '@/lib/roles'

/**
 * Role / company context control.
 *
 * While the HRMS import is pending there is no authoritative role per user, so
 * the portal lets a reviewer switch between the five experiences against the
 * same dataset. The control states plainly that the role is being simulated —
 * a dashboard silently showing someone else's scope would be worse than one
 * showing nothing.
 */
export default function RoleSwitcher() {
  const { role, setRole, member } = useRole()
  const [open, setOpen] = useState(false)
  const router = useRouter()

  function choose(r: Role) {
    setRole(r)
    setOpen(false)
    // A role change can revoke the current route; land somewhere always valid.
    router.push('/')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 h-9 pl-2.5 pr-2 rounded-lg border border-hairline/15 bg-parchment text-ink-primary hover:bg-cream transition-colors max-w-[190px]"
          aria-label={`Viewing as ${ROLE_LABEL[role]}. Change role`}
        >
          <UserCog size={14} className="text-ink-tertiary flex-shrink-0" aria-hidden />
          <span className="text-xs font-medium truncate">{ROLE_LABEL[role]}</span>
          <ChevronDown size={13} className="text-ink-tertiary flex-shrink-0" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[300px] p-0 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border">
          <p className="text-xs font-semibold text-ink-primary">View the portal as</p>
          <p className="text-[11px] text-ink-tertiary mt-0.5">
            Role simulation for review. Live deployments read the role from the HRMS record.
          </p>
        </div>
        <ul className="py-1">
          {ROLES.map((r) => {
            const who = identityFor(r)
            const on = r === role
            return (
              <li key={r}>
                <button
                  type="button"
                  onClick={() => choose(r)}
                  className={cn(
                    'w-full text-left px-4 py-2.5 flex items-start gap-2.5 transition-colors',
                    on ? 'bg-accent-copper/10' : 'hover:bg-secondary/60',
                  )}
                >
                  <Check
                    size={14}
                    className={cn(
                      'mt-0.5 flex-shrink-0',
                      on ? 'text-accent-copper' : 'text-transparent',
                    )}
                    aria-hidden
                  />
                  <span className="min-w-0">
                    <span className="block text-[13px] font-medium text-ink-primary">
                      {ROLE_LABEL[r]}
                    </span>
                    <span className="block text-[11px] text-ink-tertiary leading-snug">
                      {ROLE_DESCRIPTION[r]}
                    </span>
                    {who && (
                      <span className="block text-[11px] text-ink-tertiary mt-0.5">
                        as {who.name} · {who.role}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        {member && (
          <p className="px-4 py-2 border-t border-border text-[11px] text-ink-tertiary">
            Currently acting as <strong className="text-ink-secondary">{member.name}</strong>
          </p>
        )}
      </PopoverContent>
    </Popover>
  )
}
