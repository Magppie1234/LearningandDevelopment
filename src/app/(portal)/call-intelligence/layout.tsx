import { Suspense } from 'react'
import { LoadingRows } from '@/components/ds'
import { CiProvider } from '@/components/call-intelligence/CiContext'
import { CiShell } from '@/components/call-intelligence/CiShell'

/**
 * Route-group layout for Call Intelligence.
 *
 * The provider reads filters from the query string, so everything below it
 * depends on `useSearchParams` and has to sit inside a Suspense boundary —
 * without one, Next 15 opts the whole route out of static rendering and warns
 * at build time.
 */
export default function CallIntelligenceLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingRows rows={6} />}>
      <CiProvider>
        <CiShell>{children}</CiShell>
      </CiProvider>
    </Suspense>
  )
}
