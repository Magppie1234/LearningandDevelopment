'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import KitchenVideoBackdrop from '@/components/onboarding/KitchenVideoBackdrop'
import OnboardingWelcome from '@/screens/OnboardingWelcome'
import Onboarding from '@/screens/Onboarding'

/**
 * Onboarding.
 *
 * Two views, because this route already carried a working feature. "Welcome"
 * is the new first-three-days screen (day boxes + Keka). "New hire checklist"
 * is the pre-existing six-phase MAGPPIE checklist, untouched — it has learner
 * progress persisted against it in localStorage, so it is preserved rather
 * than replaced. Welcome leads because it is what a new joiner needs on the
 * day they arrive; the checklist is the HR-side runbook that spans 90 days.
 */
export default function Page() {
  const [view, setView] = useState<'welcome' | 'checklist'>('welcome')
  return (
    <div className="space-y-6">
      {/* Magppie's own kitchen footage under a light-blue tint, behind the
          whole page. Sits below content and never takes pointer events. */}
      <KitchenVideoBackdrop />
      <div
        className="inline-flex rounded-full bg-[rgb(var(--rule)/0.05)] p-1"
        role="tablist"
        aria-label="Onboarding view"
      >
        {([
          ['welcome', 'Welcome'],
          ['checklist', 'New hire checklist'],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={view === id}
            onClick={() => setView(id)}
            className={cn(
              'rounded-full px-4 py-2 text-[13px] font-semibold transition-colors',
              view === id
                ? 'bg-parchment text-ink-primary shadow-[0_2px_8px_rgba(30,42,54,0.1)]'
                : 'text-ink-tertiary hover:text-ink-primary',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {view === 'welcome' ? <OnboardingWelcome /> : <Onboarding />}
    </div>
  )
}
