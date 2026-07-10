'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import AdminRosterOverview from '@/components/learning/AdminRosterOverview'
import LearningDashboard from '@/components/learning/LearningDashboard'

/**
 * Admin roster screen (`/admin/learners`): every learner across every academy,
 * click-through to a read-only per-learner dashboard. Admin-only — the RLS
 * policies return no rows for a non-admin caller. Dark "Obsidian" canvas so the
 * dashboard system reads consistently.
 */
export default function AdminLearners() {
  const [viewing, setViewing] = useState<{ userId: string; academyId: string } | null>(null)

  return (
    <div className="-m-4 sm:-m-8 min-h-screen bg-stone-charcoal text-stone-ivory p-4 sm:p-8">
      {viewing ? (
        <div className="max-w-[1000px] mx-auto space-y-5">
          <button
            type="button"
            onClick={() => setViewing(null)}
            className="inline-flex items-center gap-1.5 text-sm text-stone-ivory/60 hover:text-stone-ivory transition-colors"
          >
            <ArrowLeft size={15} /> Back to roster
          </button>
          {/* Read-only: admin role + viewingUserId disables all writes and the
              time-tracking engine; RLS blocks any mutation regardless. */}
          <LearningDashboard
            academyId={viewing.academyId}
            viewerRole="admin"
            viewingUserId={viewing.userId}
            viewingLearnerName={viewing.userId}
            title="Learner dashboard"
          />
        </div>
      ) : (
        <div className="space-y-5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-stone-ivory/60 hover:text-stone-ivory transition-colors"
          >
            <ArrowLeft size={15} /> Home
          </Link>
          <AdminRosterOverview onOpenLearner={(userId, academyId) => setViewing({ userId, academyId })} />
        </div>
      )}
    </div>
  )
}
