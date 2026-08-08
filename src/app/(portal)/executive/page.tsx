import RoleGuard from '@/components/RoleGuard'
import ExecutiveDashboard from '@/screens/ExecutiveDashboard'

export default function Page() {
  return (
    <RoleGuard requires="leadership">
      <ExecutiveDashboard />
    </RoleGuard>
  )
}
