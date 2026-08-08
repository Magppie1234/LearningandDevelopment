import RoleGuard from '@/components/RoleGuard'
import LearningOps from '@/screens/LearningOps'

export default function Page() {
  return (
    <RoleGuard requires="ld_admin">
      <LearningOps />
    </RoleGuard>
  )
}
