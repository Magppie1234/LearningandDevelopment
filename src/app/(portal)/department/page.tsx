import RoleGuard from '@/components/RoleGuard'
import ScreenBoundary from '@/components/ScreenBoundary'
import DepartmentDashboard from '@/screens/DepartmentDashboard'

export default function Page() {
  return (
    <RoleGuard requires="hod">
      <ScreenBoundary>
        <DepartmentDashboard />
      </ScreenBoundary>
    </RoleGuard>
  )
}
