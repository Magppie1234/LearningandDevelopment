import RoleGuard from '@/components/RoleGuard'
import AdminContent from '@/screens/AdminContent'

export default function Page() {
  return (
    <RoleGuard requires="ld_admin">
      <AdminContent />
    </RoleGuard>
  )
}
