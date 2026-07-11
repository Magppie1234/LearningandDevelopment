import { redirect } from 'next/navigation'
import AcademyDetail from '@/pages/AcademyDetail'

// Academies whose dashboard IS their landing page (spec §11): opening the
// academy goes straight to its real-time dashboard, not an intermediate
// overview. Module entry points live on the dashboard.
const DASHBOARD_LANDING: Record<string, string> = {
  'business-development': '/academy/business-development/dashboard',
  sales: '/academy/sales/dashboard',
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const dest = DASHBOARD_LANDING[id]
  if (dest) redirect(dest)
  return <AcademyDetail />
}
