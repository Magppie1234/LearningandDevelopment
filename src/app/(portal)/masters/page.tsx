import RoleGuard from '@/components/RoleGuard'
import ApprovedMasters from '@/screens/ApprovedMasters'

export default function Page() {
  return (
    <RoleGuard requires="ld_admin">
      <ApprovedMasters />
    </RoleGuard>
  )
}
