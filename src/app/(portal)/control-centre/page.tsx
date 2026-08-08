import RoleGuard from '@/components/RoleGuard'
import HrControlCentre from '@/screens/HrControlCentre'

export default function Page() {
  return (
    <RoleGuard requires="ld_admin">
      <HrControlCentre />
    </RoleGuard>
  )
}
