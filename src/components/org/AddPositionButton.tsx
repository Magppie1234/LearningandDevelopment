'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useOrgStore } from '@/lib/org-store'
import type { OrgTier } from '@/data/org-chart'

export function AddPositionButton({
  parentId,
  tier,
  department,
  label = 'Add Position',
  className,
}: {
  parentId: string | null
  tier: OrgTier
  department?: string | null
  label?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const addPosition = useOrgStore((s) => s.addPosition)

  function submit() {
    if (!title.trim()) return
    addPosition({ parentId, tier, department, title })
    setTitle('')
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'rounded-xl border-2 border-dashed border-[rgba(0,59,70,0.15)] text-ink-tertiary hover:border-ink-secondary hover:text-ink-secondary transition-colors flex items-center justify-center gap-1.5 py-3 text-xs font-medium',
            className ??
              'min-w-[168px] max-w-[220px] flex-1 self-stretch flex-col py-4',
          )}
        >
          <Plus size={16} />
          {label}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64">
        <p className="text-xs font-semibold text-ink-primary mb-2">New position title</p>
        <div className="flex items-center gap-1.5">
          <Input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                submit()
              }
            }}
            placeholder="e.g. Senior Executive"
            className="h-9 text-sm"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!title.trim()}
            className="shrink-0 rounded-md bg-ink-primary px-3 py-2 text-xs font-medium text-parchment disabled:opacity-40 hover:opacity-90 transition"
          >
            Add
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
