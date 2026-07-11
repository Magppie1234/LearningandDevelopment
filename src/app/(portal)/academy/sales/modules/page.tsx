import { Suspense } from 'react'
import SalesAcademy from '@/pages/SalesAcademy'

// SalesAcademy reads useSearchParams (?module=…) for deep-linking, which Next
// requires to sit under a Suspense boundary so the build can prerender.
export default function Page() {
  return (
    <Suspense fallback={null}>
      <SalesAcademy />
    </Suspense>
  )
}
