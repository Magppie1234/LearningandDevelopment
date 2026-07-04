import { Suspense } from 'react'
import BdAcademy from '@/pages/BdAcademy'

// BdAcademy reads useSearchParams (?module=…) for deep-linking, which Next
// requires to sit under a Suspense boundary so the build can prerender.
export default function Page() {
  return (
    <Suspense fallback={null}>
      <BdAcademy />
    </Suspense>
  )
}
