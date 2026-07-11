import { redirect } from 'next/navigation'
import AcademyDetail from '@/pages/AcademyDetail'

// Academies whose dashboard IS their landing page (spec §11): opening the
// academy goes straight to its real-time dashboard, not an intermediate
// overview. Module entry points live on the dashboard.
const DASHBOARD_LANDING: Record<string, string> = {
  'business-development': '/academy/business-development/dashboard',
  sales: '/academy/sales/dashboard',
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { id } = await params
  const { tab } = await searchParams
  // Deep links to a specific tab (resources/leaderboard/curriculum) still open
  // the overview; the default entry lands on the dashboard.
  const dest = DASHBOARD_LANDING[id]
  if (dest && !tab) redirect(dest)
  return <AcademyDetail />
}
