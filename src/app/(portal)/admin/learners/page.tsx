import RoleGuard from '@/components/RoleGuard'
import AdminLearners from '@/screens/AdminLearners'

export default function Page() {
  return (
    <RoleGuard requires="ld_admin">
      <AdminLearners />
    </RoleGuard>
  )
}
