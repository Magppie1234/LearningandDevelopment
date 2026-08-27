import { Suspense } from 'react'
import ModuleBackdrop, { VEIL_TEAL } from '@/components/ModuleBackdrop'
import BdAcademy from '@/screens/BdAcademy'

// BdAcademy reads useSearchParams (?module=…) for deep-linking, which Next
// requires to sit under a Suspense boundary so the build can prerender.
export default function Page() {
  return (
    <Suspense fallback={null}>
      {/* Magppie's 3D kitchen render, fixed behind the module content. */}
      <ModuleBackdrop veil={VEIL_TEAL} />
      <BdAcademy />
    </Suspense>
  )
}
