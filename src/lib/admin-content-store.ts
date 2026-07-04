'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TRAINING_DOC_SOURCE, TRAINING_DOC_VERSION } from '@/data/training-doc'

/**
 * Admin content-governance state: content version lifecycle (§3.2 item 7,
 * DB mirror: content_versions in 0017) and the AI question review queue
 * (§3.3 — AI drafts NEVER publish without human review; DB enforcement is
 * the trg_enforce_item_review trigger in 0011).
 */

export type ContentStatus = 'draft' | 'in_review' | 'published' | 'retired'

export interface ContentVersion {
  id: string
  docName: string
  version: string
  status: ContentStatus
  changeNote: string
  updatedAt: string
}

export interface DraftQuestion {
  id: string
  competencyId: string
  competencyName: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  status: 'draft' | 'in_review' | 'published' | 'rejected'
  source: 'ai'
}

const CONTENT_SEED: ContentVersion[] = [
  {
    id: 'cv-1',
    docName: TRAINING_DOC_SOURCE,
    version: TRAINING_DOC_VERSION,
    status: 'published',
    changeNote: 'Initial ingestion — powers the Pooja assistant (95 chunks).',
    updatedAt: '2026-07-02T10:00:00+05:30',
  },
  {
    id: 'cv-2',
    docName: 'Installation Safety SOP',
    version: '2.1',
    status: 'published',
    changeNote: 'Added lockout/tagout section per live-call feedback.',
    updatedAt: '2026-06-20T11:00:00+05:30',
  },
  {
    id: 'cv-3',
    docName: 'Installation Safety SOP',
    version: '2.0',
    status: 'retired',
    changeNote: 'Superseded by 2.1.',
    updatedAt: '2026-05-02T09:00:00+05:30',
  },
  {
    id: 'cv-4',
    docName: 'Wellness Kitchen Pricing Sheet',
    version: '3.0-draft',
    status: 'draft',
    changeNote: 'FY27 price revision — awaiting finance sign-off.',
    updatedAt: '2026-07-01T16:30:00+05:30',
  },
]

interface AdminContentState {
  versions: ContentVersion[]
  reviewQueue: DraftQuestion[]
  setVersionStatus: (id: string, status: ContentStatus) => void
  addDrafts: (drafts: Omit<DraftQuestion, 'status' | 'source'>[]) => void
  setDraftStatus: (id: string, status: DraftQuestion['status']) => void
}

export const useAdminContentStore = create<AdminContentState>()(
  persist(
    (set) => ({
      versions: CONTENT_SEED,
      reviewQueue: [],
      setVersionStatus: (id, status) =>
        set((s) => {
          let versions = s.versions.map((v) =>
            v.id === id ? { ...v, status, updatedAt: new Date().toISOString() } : v,
          )
          // Publishing retires the previous published version of the same doc
          // (mirrors trg_retire_previous in migration 0017).
          const target = versions.find((v) => v.id === id)
          if (target && status === 'published') {
            versions = versions.map((v) =>
              v.docName === target.docName && v.id !== id && v.status === 'published'
                ? { ...v, status: 'retired' as const, updatedAt: new Date().toISOString() }
                : v,
            )
          }
          return { versions }
        }),
      addDrafts: (drafts) =>
        set((s) => ({
          reviewQueue: [
            ...drafts.map((d) => ({ ...d, status: 'draft' as const, source: 'ai' as const })),
            ...s.reviewQueue,
          ],
        })),
      setDraftStatus: (id, status) =>
        set((s) => ({
          reviewQueue: s.reviewQueue.map((q) => {
            if (q.id !== id) return q
            // Guard (mirrors DB trigger): AI drafts may only publish FROM in_review.
            if (status === 'published' && q.status !== 'in_review') return q
            return { ...q, status }
          }),
        })),
    }),
    { name: 'magppie-admin-content-v1' },
  ),
)
