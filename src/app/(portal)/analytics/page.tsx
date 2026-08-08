import RoleGuard from '@/components/RoleGuard'
import Analytics from '@/screens/Analytics'

export default function Page() {
  return (
    <RoleGuard requires="hod">
      <Analytics />
    </RoleGuard>
  )
}
