import RoleGuard from '@/components/RoleGuard'
import ManagerHub from '@/screens/ManagerHub'

export default function Page() {
  return (
    <RoleGuard requires="manager">
      <ManagerHub />
    </RoleGuard>
  )
}
