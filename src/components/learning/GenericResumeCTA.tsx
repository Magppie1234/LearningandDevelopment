'use client'

import Link from 'next/link'
import { PlayCircle, ArrowRight } from 'lucide-react'
import { formatDuration } from '@/lib/learning-dashboard-client'
import type { DemoResume } from '@/lib/learning-demo-data'

/**
 * Home-dashboard-only "Continue Learning" CTA: jumps to whatever module the
 * learner last touched across ANY academy (most recent last_accessed_at).
 * Dark warm-stone surface. Never rendered on an academy-scoped dashboard.
 */
export default function GenericResumeCTA({ resume, href }: { resume: DemoResume; href: string }) {
  const at =
    resume.position != null
      ? resume.kind === 'video'
        ? `Continue from ${formatDuration(resume.position)}`
        : `Continue from ${resume.position}%`
      : 'Continue'

  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-4 rounded-2xl border border-accent-copper/40 bg-accent-copper/10 px-6 py-4 hover:bg-accent-copper/15 transition-colors"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-11 h-11 rounded-xl bg-accent-copper/20 flex items-center justify-center shrink-0">
          <PlayCircle size={22} className="text-accent-copper" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-accent-copper">
            Continue learning
          </p>
          <p className="text-sm font-semibold text-stone-ivory truncate">{resume.label}</p>
          <p className="text-[12px] text-stone-ivory/50 mt-0.5">{at}</p>
        </div>
      </div>
      <ArrowRight size={18} className="shrink-0 text-accent-copper transition-transform group-hover:translate-x-1" />
    </Link>
  )
}
