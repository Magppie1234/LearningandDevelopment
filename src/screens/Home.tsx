'use client'

import EmployeeHome from '@/screens/EmployeeHome'
import { useRole } from '@/lib/role-context'

/**
 * Home is role-routed.
 *
 * Everyone is a learner first, so every role lands on their own learning
 * picture — a manager who opens the portal still needs to know what *they*
 * owe. Team, department and company views are one click away in the sidebar
 * rather than replacing the personal home, which is what made the previous
 * landing page unable to serve anybody in particular.
 */
export default function Home() {
  // Read the role so a role switch re-renders this subtree; the personal
  // learning picture is the same component for every role today, and any
  // role-specific landing added later branches here.
  useRole()
  return <EmployeeHome />
}
