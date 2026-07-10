'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import AdminRosterOverview from '@/components/learning/AdminRosterOverview'
import LearningDashboard from '@/components/learning/LearningDashboard'

/**
 * Admin roster screen (`/admin/learners`): every learner across every academy,
 * click-through to a read-only per-learner dashboard. Admin-only — the RLS
 * policies return no rows for a non-admin caller, and the roster query applies
 * no academy_scope filter for admins (unlike managers).
 */
export default function AdminLearners() {
  const [viewing, setViewing] = useState<{ userId: string; academyId: string } | null>(null)

  if (viewing) {
    return (
      <div className="max-w-[1000px] mx-auto space-y-5">
        <button
          type="button"
          onClick={() => setViewing(null)}
          className="inline-flex items-center gap-1.5 text-sm text-ink-tertiary hover:text-ink-primary transition-colors"
        >
          <ArrowLeft size={15} /> Back to roster
        </button>
        {/* Read-only viewing: admin role + viewingUserId disables all writes and
            the time-tracking engine, and RLS blocks any mutation regardless. */}
        <LearningDashboard
          academyId={viewing.academyId}
          viewerRole="admin"
          viewingUserId={viewing.userId}
          viewingLearnerName={viewing.userId}
          title="Learner dashboard"
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-ink-tertiary hover:text-ink-primary transition-colors"
      >
        <ArrowLeft size={15} /> Home
      </Link>
      <AdminRosterOverview onOpenLearner={(userId, academyId) => setViewing({ userId, academyId })} />
    </div>
  )
}
