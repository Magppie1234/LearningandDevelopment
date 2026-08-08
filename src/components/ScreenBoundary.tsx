import { Suspense, type ReactNode } from 'react'
import { LoadingRows } from '@/components/ds'

/**
 * Suspense boundary for screens that read the URL query string.
 *
 * `useSearchParams()` opts a route into client-side rendering, and Next
 * requires an explicit boundary so the rest of the shell can still be
 * prerendered — without one the production build fails at the export step.
 * The fallback is a skeleton rather than a spinner so the page does not shift
 * when the real content arrives.
 */
export default function ScreenBoundary({ children }: { children: ReactNode }) {
  return <Suspense fallback={<LoadingRows rows={6} />}>{children}</Suspense>
}
