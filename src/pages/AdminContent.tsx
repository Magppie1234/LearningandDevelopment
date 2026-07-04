'use client'

import { useState } from 'react'
import {
  FileText,
  Bot,
  CheckCircle2,
  XCircle,
  Send,
  Loader2,
  ShieldAlert,
  Pencil,
  RotateCcw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { COMPETENCIES } from '@/data/competencies'
import {
  useAdminContentStore,
  type ContentStatus,
  type DraftQuestion,
} from '@/lib/admin-content-store'
import { BD_MODULES } from '@/data/bd-academy'
import { useBdTitles } from '@/lib/bd-title-store'
import EmptyState from '@/components/EmptyState'

const STATUS_STYLES: Record<ContentStatus, string> = {
  draft: 'bg-surface-blue/20 text-ink-secondary',
  in_review: 'bg-accent-gold/20 text-ink-primary',
  published: 'bg-surface-sage/25 text-ink-primary',
  retired: 'bg-black/5 text-ink-tertiary line-through',
}

function StatusBadge({ status }: { status: ContentStatus | DraftQuestion['status'] }) {
  return (
    <span
      className={cn(
        'inline-block text-[11px] font-medium px-2 py-0.5 rounded-lg',
        STATUS_STYLES[status as ContentStatus] ?? 'bg-red-100 text-red-700',
      )}
    >
      {(status.charAt(0).toUpperCase() + status.slice(1)).replace('_', ' ')}
    </span>
  )
}

function VersionsPanel() {
  const versions = useAdminContentStore((s) => s.versions)
  const setStatus = useAdminContentStore((s) => s.setVersionStatus)

  return (
    <div className="bg-cream rounded-2xl border border-[rgba(0,59,70,0.08)] overflow-hidden">
      <header className="px-5 py-4 border-b border-[rgba(0,59,70,0.06)]">
        <p className="text-sm font-semibold text-ink-primary flex items-center gap-2">
          <FileText size={16} /> Content versions
        </p>
        <p className="text-[11px] text-ink-tertiary mt-0.5">
          Only published versions feed the RAG assistant; publishing retires the previous version automatically.
        </p>
      </header>
      <ul className="divide-y divide-[rgba(0,59,70,0.05)]">
        {versions.map((v) => (
          <li key={v.id} className="px-5 py-3.5 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink-primary truncate">
                {v.docName} <span className="text-ink-tertiary">v{v.version}</span>
              </p>
              <p className="text-[11px] text-ink-tertiary truncate mt-0.5">{v.changeNote}</p>
            </div>
            <StatusBadge status={v.status} />
            <div className="flex gap-1.5 shrink-0">
              {v.status === 'draft' && (
                <button
                  type="button"
                  onClick={() => setStatus(v.id, 'in_review')}
                  className="text-[11px] font-medium rounded-full border border-[rgba(0,59,70,0.15)] px-2.5 py-1 hover:bg-black/[0.03] transition"
                >
                  Send to review
                </button>
              )}
              {v.status === 'in_review' && (
                <button
                  type="button"
                  onClick={() => setStatus(v.id, 'published')}
                  className="text-[11px] font-medium rounded-full bg-ink-primary text-parchment px-2.5 py-1 hover:opacity-90 transition"
                >
                  Publish
                </button>
              )}
              {v.status === 'published' && (
                <button
                  type="button"
                  onClick={() => setStatus(v.id, 'retired')}
                  className="text-[11px] font-medium rounded-full border border-red-200 text-red-600 px-2.5 py-1 hover:bg-red-50 transition"
                >
                  Retire
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ReviewQueuePanel() {
  const queue = useAdminContentStore((s) => s.reviewQueue)
  const addDrafts = useAdminContentStore((s) => s.addDrafts)
  const setDraftStatus = useAdminContentStore((s) => s.setDraftStatus)

  const [competencyId, setCompetencyId] = useState(COMPETENCIES[0].id)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function draft() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/draft-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competencyId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
      addDrafts(data.drafts)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Drafting failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-cream rounded-2xl border border-[rgba(0,59,70,0.08)] overflow-hidden">
      <header className="px-5 py-4 border-b border-[rgba(0,59,70,0.06)]">
        <p className="text-sm font-semibold text-ink-primary flex items-center gap-2">
          <Bot size={16} /> AI question drafts — review queue
        </p>
        <p className="text-[11px] text-ink-tertiary mt-0.5 flex items-center gap-1">
          <ShieldAlert size={11} /> AI drafts can never publish without passing human review.
        </p>
      </header>

      <div className="px-5 py-4 flex flex-wrap items-center gap-2 border-b border-[rgba(0,59,70,0.06)]">
        <select
          value={competencyId}
          onChange={(e) => setCompetencyId(e.target.value)}
          className="flex-1 min-w-[220px] bg-parchment border border-[rgba(0,59,70,0.12)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ink-primary"
        >
          {COMPETENCIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.academy.replace(' Academy', '')} — {c.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={draft}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink-primary px-4 py-2 text-xs font-medium text-parchment disabled:opacity-50 hover:opacity-90 transition"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
          {loading ? 'Drafting…' : 'Draft 3 questions'}
        </button>
        {error && <p className="w-full text-[11px] text-red-600">{error}</p>}
      </div>

      {queue.length === 0 ? (
        <EmptyState
          icon={Bot}
          headline="Draft your first questions"
          support="Pick a competency above and Pooja will draft three questions for your review."
        />
      ) : (
        <ul className="divide-y divide-[rgba(0,59,70,0.05)]">
          {queue.map((q) => (
            <li key={q.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-tertiary">
                    {q.competencyName}
                  </p>
                  <p className="text-sm text-ink-primary mt-1">{q.question}</p>
                </div>
                <StatusBadge status={q.status} />
              </div>
              <ol className="mt-2 space-y-1">
                {q.options.map((opt, i) => (
                  <li
                    key={i}
                    className={cn(
                      'text-[12px] px-2.5 py-1 rounded-md',
                      i === q.correctIndex
                        ? 'bg-surface-sage/15 text-ink-primary font-medium'
                        : 'text-ink-secondary',
                    )}
                  >
                    {String.fromCharCode(65 + i)}. {opt}
                    {i === q.correctIndex && ' ✓'}
                  </li>
                ))}
              </ol>
              <div className="mt-2.5 flex gap-1.5">
                {q.status === 'draft' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setDraftStatus(q.id, 'in_review')}
                      className="text-[11px] font-medium rounded-full border border-[rgba(0,59,70,0.15)] px-2.5 py-1 hover:bg-black/[0.03] transition"
                    >
                      Start review
                    </button>
                    <button
                      type="button"
                      onClick={() => setDraftStatus(q.id, 'rejected')}
                      className="text-[11px] font-medium rounded-full border border-red-200 text-red-600 px-2.5 py-1 hover:bg-red-50 transition inline-flex items-center gap-1"
                    >
                      <XCircle size={11} /> Reject
                    </button>
                  </>
                )}
                {q.status === 'in_review' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setDraftStatus(q.id, 'published')}
                      className="text-[11px] font-medium rounded-full bg-ink-primary text-parchment px-2.5 py-1 hover:opacity-90 transition inline-flex items-center gap-1"
                    >
                      <CheckCircle2 size={11} /> Approve & publish
                    </button>
                    <button
                      type="button"
                      onClick={() => setDraftStatus(q.id, 'rejected')}
                      className="text-[11px] font-medium rounded-full border border-red-200 text-red-600 px-2.5 py-1 hover:bg-red-50 transition"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function BdTitlesPanel() {
  const overrides = useBdTitles((s) => s.overrides)
  const setTitle = useBdTitles((s) => s.setTitle)
  const clearTitle = useBdTitles((s) => s.clearTitle)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')

  function startEdit(moduleId: string, current: string) {
    setEditingId(moduleId)
    setDraft(current)
  }
  function save() {
    if (editingId) setTitle(editingId, draft)
    setEditingId(null)
    setDraft('')
  }

  return (
    <div className="bg-cream rounded-2xl border border-[rgba(0,59,70,0.08)] overflow-hidden">
      <header className="px-5 py-4 border-b border-[rgba(0,59,70,0.06)]">
        <p className="text-sm font-semibold text-ink-primary flex items-center gap-2">
          <Pencil size={16} /> Business Development — course titles
        </p>
        <p className="text-[11px] text-ink-tertiary mt-0.5">
          Rename any of the 10 BD courses here. Changes apply instantly to the academy — no code change needed.
        </p>
      </header>
      <ul className="divide-y divide-[rgba(0,59,70,0.05)]">
        {BD_MODULES.map((m) => {
          const override = overrides[m.id]
          const effective = override ?? m.title
          const isEditing = editingId === m.id
          return (
            <li key={m.id} className="px-5 py-3.5 flex items-center gap-3">
              <span className="shrink-0 text-[11px] font-medium text-ink-tertiary w-16">
                Module {m.number}
              </span>
              {isEditing ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') save()
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    autoFocus
                    className="flex-1 bg-parchment border border-ink-primary rounded-lg px-3 py-1.5 text-sm focus:outline-none"
                    placeholder={m.title}
                  />
                  <button
                    type="button"
                    onClick={save}
                    className="text-[11px] font-medium rounded-full bg-ink-primary text-parchment px-3 py-1.5 hover:opacity-90 transition"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="text-[11px] font-medium rounded-full border border-[rgba(0,59,70,0.15)] px-3 py-1.5 hover:bg-black/[0.03] transition"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink-primary truncate">{effective}</p>
                    {override && (
                      <p className="text-[11px] text-ink-tertiary truncate mt-0.5">
                        Renamed from “{m.title}”
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(m.id, effective)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium rounded-full border border-[rgba(0,59,70,0.15)] px-2.5 py-1 hover:bg-black/[0.03] transition"
                    >
                      <Pencil size={11} /> Rename
                    </button>
                    {override && (
                      <button
                        type="button"
                        onClick={() => clearTitle(m.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium rounded-full border border-[rgba(0,59,70,0.15)] px-2.5 py-1 hover:bg-black/[0.03] transition"
                      >
                        <RotateCcw size={11} /> Reset
                      </button>
                    )}
                  </div>
                </>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default function AdminContent() {
  return (
    <div className="max-w-[900px] mx-auto space-y-6">
      <section className="pb-5 border-b border-[rgba(0,59,70,0.08)]">
        <h1 className="font-serif text-4xl font-normal text-ink-primary">Content Governance</h1>
        <p className="text-sm text-ink-secondary mt-2">
          Author, version, publish and retire training content — and review AI-drafted
          assessment questions before they can reach employees.
        </p>
      </section>
      <BdTitlesPanel />
      <VersionsPanel />
      <ReviewQueuePanel />
    </div>
  )
}
