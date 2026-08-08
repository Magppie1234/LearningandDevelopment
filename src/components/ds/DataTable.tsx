'use client'

import { useMemo, useState, type ReactNode } from 'react'
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  SearchX,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button, Empty, ErrorState, LoadingRows } from './Controls'

/**
 * The portal's one table.
 *
 * Every detailed report in the portal renders through this so search, sort,
 * pagination, sticky headers, export, row actions and the empty / loading /
 * error / no-results states behave identically everywhere. On narrow screens
 * each row collapses to a stacked card (label + value pairs) rather than
 * forcing a horizontal scroll through columns nobody can read.
 */

export interface Column<T> {
  /** Stable key; also the export header when `header` is not a string. */
  key: string
  header: ReactNode
  /** Cell renderer. */
  cell: (row: T) => ReactNode
  /**
   * Sort/search/export value. Required for a sortable or searchable column —
   * sorting rendered JSX is how tables end up sorting by markup.
   */
  value?: (row: T) => string | number | null
  sortable?: boolean
  align?: 'left' | 'right'
  /** Tailwind width utility, e.g. 'w-[180px]'. */
  width?: string
  /** Hide below `lg` — the column still appears in the mobile card and export. */
  secondary?: boolean
  /** Keep on one line (names, dates, percentages, scores, IDs, statuses). */
  nowrap?: boolean
}

export interface DataTableProps<T> {
  rows: T[]
  columns: Column<T>[]
  rowKey: (row: T) => string
  /** Placeholder implies which fields are matched. */
  searchPlaceholder?: string
  /** Turn off search for short, fixed lists. */
  searchable?: boolean
  pageSize?: number
  /** Filename stem for CSV export. Omit to hide the export control. */
  exportName?: string
  onRowClick?: (row: T) => void
  /** Right-aligned per-row controls. */
  rowActions?: (row: T) => ReactNode
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  emptyHeadline?: string
  emptySupport?: string
  emptyAction?: ReactNode
  /** Sticky header needs a scroll container height. */
  maxHeight?: string
  className?: string
  /** Caption for screen readers describing what the table lists. */
  caption?: string
}

function textOf(v: string | number | null | undefined): string {
  return v == null ? '' : String(v)
}

function toCsv<T>(rows: T[], columns: Column<T>[]): string {
  const cols = columns.filter((c) => c.value)
  const head = cols.map((c) => (typeof c.header === 'string' ? c.header : c.key))
  const escape = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s)
  const lines = [head.map(escape).join(',')]
  for (const r of rows) {
    lines.push(cols.map((c) => escape(textOf(c.value!(r)))).join(','))
  }
  return lines.join('\n')
}

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  searchPlaceholder = 'Search…',
  searchable = true,
  pageSize = 10,
  exportName,
  onRowClick,
  rowActions,
  loading = false,
  error = null,
  onRetry,
  emptyHeadline = 'Nothing here yet',
  emptySupport = 'Records will appear once there is data to show.',
  emptyAction,
  maxHeight,
  className,
  caption,
}: DataTableProps<T>) {
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(0)

  const searchable_cols = useMemo(() => columns.filter((c) => c.value), [columns])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) =>
      searchable_cols.some((c) => textOf(c.value!(r)).toLowerCase().includes(q)),
    )
  }, [rows, query, searchable_cols])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    const col = columns.find((c) => c.key === sortKey)
    if (!col?.value) return filtered
    const dir = sortDir === 'asc' ? 1 : -1
    return [...filtered].sort((a, b) => {
      const av = col.value!(a)
      const bv = col.value!(b)
      // Nulls always sort last, regardless of direction — "no data" is not a
      // value that should win a ranking.
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
      return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir
    })
  }, [filtered, sortKey, sortDir, columns])

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(page, pageCount - 1)
  const pageRows = sorted.slice(safePage * pageSize, safePage * pageSize + pageSize)

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(0)
  }

  function exportCsv() {
    const csv = toCsv(sorted, columns)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${exportName}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const showToolbar = (searchable && searchable_cols.length > 0) || exportName
  const visible = columns.filter((c) => !c.secondary)

  return (
    <div className={cn('flex flex-col', className)}>
      {showToolbar && (
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-hairline/8">
          {searchable && searchable_cols.length > 0 && (
            <div className="relative flex-1 min-w-[180px] max-w-sm">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary pointer-events-none"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(0)
                }}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="w-full h-9 pl-8 pr-8 rounded-lg border border-hairline/15 bg-parchment text-[13px] text-ink-primary placeholder:text-ink-tertiary focus:border-accent-copper focus:outline-none transition-colors"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-ink-tertiary hover:text-ink-primary hover:bg-[rgb(var(--rule)/0.06)]"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          )}
          <span className="text-[11px] text-ink-tertiary tnum whitespace-nowrap">
            {sorted.length === rows.length
              ? `${rows.length} ${rows.length === 1 ? 'record' : 'records'}`
              : `${sorted.length} of ${rows.length}`}
          </span>
          <div className="ml-auto flex items-center gap-2">
            {exportName && sorted.length > 0 && (
              <Button size="sm" variant="ghost" icon={Download} onClick={exportCsv}>
                Export CSV
              </Button>
            )}
          </div>
        </div>
      )}

      {error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : loading ? (
        <LoadingRows rows={Math.min(pageSize, 5)} className="p-4" />
      ) : rows.length === 0 ? (
        <Empty
          headline={emptyHeadline}
          support={emptySupport}
          action={emptyAction}
          icon={SearchX}
        />
      ) : sorted.length === 0 ? (
        <Empty
          compact
          icon={SearchX}
          headline="No matching records"
          support={`Nothing matches “${query}”. Try a shorter search term, or clear the search to see all ${rows.length}.`}
          action={
            <Button size="sm" onClick={() => setQuery('')}>
              Clear search
            </Button>
          }
        />
      ) : (
        <>
          {/* Desktop / tablet: real table with a sticky header. */}
          <div
            className="hidden md:block overflow-auto"
            style={maxHeight ? { maxHeight } : undefined}
          >
            <table className="w-full border-collapse text-[13px]">
              {caption && <caption className="sr-only">{caption}</caption>}
              <thead className="sticky top-0 z-10 bg-cream">
                <tr>
                  {visible.map((c) => (
                    <th
                      key={c.key}
                      scope="col"
                      className={cn(
                        'px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary border-b border-hairline/10',
                        c.align === 'right' ? 'text-right' : 'text-left',
                        c.width,
                      )}
                      aria-sort={
                        sortKey === c.key
                          ? sortDir === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : undefined
                      }
                    >
                      {c.sortable && c.value ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(c.key)}
                          className={cn(
                            'inline-flex items-center gap-1 hover:text-ink-primary transition-colors',
                            c.align === 'right' && 'flex-row-reverse',
                          )}
                        >
                          {c.header}
                          {sortKey === c.key ? (
                            sortDir === 'asc' ? (
                              <ArrowUp size={11} />
                            ) : (
                              <ArrowDown size={11} />
                            )
                          ) : (
                            <ArrowUp size={11} className="opacity-25" />
                          )}
                        </button>
                      ) : (
                        c.header
                      )}
                    </th>
                  ))}
                  {rowActions && (
                    <th scope="col" className="px-4 py-2.5 border-b border-hairline/10 w-px">
                      <span className="sr-only">Actions</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r) => (
                  <tr
                    key={rowKey(r)}
                    onClick={onRowClick ? () => onRowClick(r) : undefined}
                    className={cn(
                      'border-b border-hairline/6 last:border-0',
                      onRowClick && 'cursor-pointer hover:bg-[rgb(var(--rule)/0.03)] transition-colors',
                    )}
                  >
                    {visible.map((c) => (
                      <td
                        key={c.key}
                        className={cn(
                          'px-4 py-3 text-ink-primary align-middle',
                          c.align === 'right' && 'text-right tnum',
                          c.nowrap && 'whitespace-nowrap',
                        )}
                      >
                        {c.cell(r)}
                      </td>
                    ))}
                    {rowActions && (
                      <td
                        className="px-4 py-3 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {rowActions(r)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: one card per row, every column as a label/value pair.
              Columns whose header is not plain text (a select-all checkbox,
              for instance) are skipped — their header is a control, not a
              label, and would render as one inside every card. */}
          <ul className="md:hidden divide-y divide-hairline/8">
            {pageRows.map((r) => {
              const pairs = columns.filter((c) => typeof c.header === 'string')
              const body = (
                <div className="space-y-2">
                  {pairs.map((c, i) => (
                    <div
                      key={c.key}
                      className={cn('flex items-start justify-between gap-3', i === 0 && 'pb-1')}
                    >
                      <span className="text-[11px] uppercase tracking-wide text-ink-tertiary flex-shrink-0 pt-0.5">
                        {c.header}
                      </span>
                      <span className="text-[13px] text-ink-primary text-right min-w-0">
                        {c.cell(r)}
                      </span>
                    </div>
                  ))}
                </div>
              )
              return (
                <li key={rowKey(r)} className="p-4">
                  {onRowClick ? (
                    <button
                      type="button"
                      onClick={() => onRowClick(r)}
                      className="w-full text-left [@media(pointer:coarse)]:min-h-[44px]"
                    >
                      {body}
                    </button>
                  ) : (
                    body
                  )}
                  {rowActions && (
                    <div className="mt-3 flex flex-wrap gap-2 justify-end">{rowActions(r)}</div>
                  )}
                </li>
              )
            })}
          </ul>

          {pageCount > 1 && (
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-hairline/8">
              <p className="text-[11px] text-ink-tertiary tnum">
                {safePage * pageSize + 1}–{Math.min((safePage + 1) * pageSize, sorted.length)} of{' '}
                {sorted.length}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  icon={ChevronLeft}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={safePage === 0}
                >
                  Prev
                </Button>
                <span className="text-[11px] text-ink-secondary tnum px-2">
                  {safePage + 1} / {pageCount}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                  disabled={safePage >= pageCount - 1}
                >
                  Next
                  <ChevronRight size={13} aria-hidden />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
