'use client'

import { Lock } from 'lucide-react'
import { Button, Empty } from '@/components/ds'
import { useRole } from '@/lib/role-context'
import { hasRole, ROLE_LABEL, type Role } from '@/lib/roles'

/**
 * Route-level authorisation. Wraps a page whose data covers people other than
 * the viewer, so a manager dashboard cannot be reached by typing its URL.
 *
 * The refusal names the role required and offers a way back — a bare 403 in a
 * portal where roles are switchable reads as a bug, not as a boundary.
 */
export default function RoleGuard({
  requires,
  children,
}: {
  requires: Role
  children: React.ReactNode
}) {
  const { role } = useRole()
  if (hasRole(role, requires)) return <>{children}</>
  return (
    <Empty
      icon={Lock}
      headline={`${ROLE_LABEL[requires]} access required`}
      support={`You are signed in as ${ROLE_LABEL[role]}. This section covers people beyond your scope, so it is only available to ${ROLE_LABEL[requires]} and above. Ask your L&D administrator if you need access.`}
      action={
        <>
          <Button href="/" variant="primary">
            Back to Home
          </Button>
          <Button href="/my-learning">Go to My Learning</Button>
        </>
      }
    />
  )
}
