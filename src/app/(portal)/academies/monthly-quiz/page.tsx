import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import MonthlyQuiz from '@/pages/MonthlyQuiz'

export default function Page() {
  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      <div className="flex items-center gap-1.5 text-xs text-ink-tertiary">
        <Link href="/academies" className="hover:text-ink-primary transition-colors">
          Academies
        </Link>
        <ChevronRight size={12} />
        <Link
          href="/academy/business-development"
          className="hover:text-ink-primary transition-colors"
        >
          Business Development Academy
        </Link>
        <ChevronRight size={12} />
        <span className="text-ink-primary font-medium">Monthly Quiz</span>
      </div>
      <MonthlyQuiz />
    </div>
  )
}
