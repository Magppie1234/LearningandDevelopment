import RoleGuard from '@/components/RoleGuard'
import Governance from '@/screens/Governance'

export default function Page() {
  return (
    <RoleGuard requires="ld_admin">
      <Governance />
    </RoleGuard>
  )
}
