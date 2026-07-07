'use client'

import { cn } from '@/lib/utils'

/**
 * Two/three-column comparison. Rows are aligned across columns by their
 * shared `label`, so equivalent attributes always sit side by side. The last
 * column is treated as "ours" and gets the copper highlight — the config in
 * faq-data.ts orders columns accordingly.
 */

export interface CompareColumn {
  title: string
  rows: { label: string; value: string }[]
}

export default function CompareCards({ columns }: { columns: CompareColumn[] }) {
  const labels: string[] = []
  for (const col of columns) {
    for (const row of col.rows) {
      if (!labels.includes(row.label)) labels.push(row.label)
    }
  }

  return (
    <div
      className={cn(
        'grid gap-2',
        columns.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2',
      )}
    >
      {columns.map((col, ci) => {
        const highlighted = ci === columns.length - 1
        return (
          <div
            key={col.title}
            className={cn(
              'rounded-[12px] border-[0.5px] overflow-hidden',
              highlighted
                ? 'border-accent-copper/60 bg-accent-copper/[0.06]'
                : 'border-[rgba(0,59,70,0.14)] bg-cream',
            )}
          >
            <p
              className={cn(
                'px-4 py-2.5 text-[13px] font-semibold border-b-[0.5px]',
                highlighted
                  ? 'text-ink-primary bg-accent-copper/10 border-accent-copper/30'
                  : 'text-ink-secondary border-[rgba(0,59,70,0.1)]',
              )}
            >
              {col.title}
            </p>
            <dl className="divide-y divide-[rgba(0,59,70,0.06)]">
              {labels.map((label) => {
                const row = col.rows.find((r) => r.label === label)
                return (
                  <div key={label} className="px-4 py-2.5">
                    <dt className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-tertiary">
                      {label}
                    </dt>
                    <dd className="mt-0.5 text-[12.5px] leading-relaxed text-ink-secondary">
                      {row?.value ?? '—'}
                    </dd>
                  </div>
                )
              })}
            </dl>
          </div>
        )
      })}
    </div>
  )
}
