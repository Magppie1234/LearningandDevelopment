'use client'

import { useState } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MessageCircle, CheckCircle2, CornerDownRight, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import EmptyState from '@/components/EmptyState'

/**
 * Peer-to-peer Q&A tied to a module/academy (§3.2 item 4 — 360Learning
 * pattern). Demo mode persists locally; live mode maps 1:1 onto
 * module_questions / module_answers (migration 0015).
 */

interface Answer {
  id: string
  author: string
  body: string
  isAccepted: boolean
  createdAt: string
}
interface Question {
  id: string
  academyId: string
  author: string
  title: string
  body: string
  answers: Answer[]
  createdAt: string
}

const SEED: Question[] = [
  {
    id: 'q-1',
    academyId: 'factory-production',
    author: 'Priya Nair',
    title: 'OEE drops every shift changeover — where do I look first?',
    body: 'Availability dips ~8% at changeover on Line 2. Which loss category should I log this under?',
    createdAt: '2026-06-25T10:00:00+05:30',
    answers: [
      {
        id: 'a-1',
        author: 'Anil Kapoor',
        body: 'Log it as an availability loss (setup/adjustment). Track changeover time separately for a week first — most of ours came from tool staging, not the machine. The Productivity Standards module covers the loss categories.',
        isAccepted: true,
        createdAt: '2026-06-25T14:30:00+05:30',
      },
    ],
  },
  {
    id: 'q-2',
    academyId: 'business-development',
    author: 'Raj Patel',
    title: 'Prospect keeps rescheduling the qualification call — disqualify?',
    body: 'Three reschedules but they keep re-engaging on WhatsApp. BANT says two touchpoints for disqualification — does WhatsApp count?',
    createdAt: '2026-06-29T09:15:00+05:30',
    answers: [],
  },
]

interface QaState {
  questions: Question[]
  ask: (academyId: string, title: string, body: string) => void
  answer: (questionId: string, body: string) => void
  accept: (questionId: string, answerId: string) => void
}

const useQaStore = create<QaState>()(
  persist(
    (set) => ({
      questions: SEED,
      ask: (academyId, title, body) =>
        set((s) => ({
          questions: [
            {
              id: `q-${s.questions.length + 1}-${title.length}`,
              academyId,
              author: 'Aarav Sharma',
              title,
              body,
              answers: [],
              createdAt: new Date().toISOString(),
            },
            ...s.questions,
          ],
        })),
      answer: (questionId, body) =>
        set((s) => ({
          questions: s.questions.map((q) =>
            q.id === questionId
              ? {
                  ...q,
                  answers: [
                    ...q.answers,
                    {
                      id: `a-${q.answers.length + 1}-${body.length}`,
                      author: 'Aarav Sharma',
                      body,
                      isAccepted: false,
                      createdAt: new Date().toISOString(),
                    },
                  ],
                }
              : q,
          ),
        })),
      accept: (questionId, answerId) =>
        set((s) => ({
          questions: s.questions.map((q) =>
            q.id === questionId
              ? {
                  ...q,
                  answers: q.answers.map((a) => ({
                    ...a,
                    isAccepted: a.id === answerId,
                  })),
                }
              : q,
          ),
        })),
    }),
    { name: 'magppie-peer-qa-v1' },
  ),
)

function initials(name: string) {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

export default function DiscussionsTab({ academyId }: { academyId: string }) {
  const questions = useQaStore((s) => s.questions).filter(
    (q) => q.academyId === academyId,
  )
  const ask = useQaStore((s) => s.ask)
  const answer = useQaStore((s) => s.answer)
  const accept = useQaStore((s) => s.accept)

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [replyFor, setReplyFor] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  return (
    <div className="max-w-[760px] space-y-6">
      {/* Ask */}
      <div className="bg-cream rounded-2xl border border-[rgba(0,59,70,0.08)] p-5">
        <p className="text-sm font-semibold text-ink-primary flex items-center gap-2">
          <MessageCircle size={16} /> Ask your peers
        </p>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="One-line question…"
          className="mt-3 w-full bg-parchment border border-[rgba(0,59,70,0.12)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ink-primary"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Context (optional)"
          rows={2}
          className="mt-2 w-full bg-parchment border border-[rgba(0,59,70,0.12)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ink-primary resize-none"
        />
        <button
          type="button"
          disabled={!title.trim()}
          onClick={() => {
            ask(academyId, title.trim(), body.trim())
            setTitle('')
            setBody('')
          }}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-ink-primary px-4 py-2 text-xs font-medium text-parchment disabled:opacity-40 hover:opacity-90 transition"
        >
          <Send size={13} /> Post question
        </button>
      </div>

      {/* Threads */}
      {questions.length === 0 && (
        <EmptyState
          icon={MessageCircle}
          headline="Start the first discussion"
          support="Ask the question you'd normally ask a senior — the answer helps everyone after you."
        />
      )}
      {questions.map((q) => (
        <div
          key={q.id}
          className="bg-cream rounded-2xl border border-[rgba(0,59,70,0.08)] p-5"
        >
          <div className="flex items-start gap-3">
            <span className="w-8 h-8 shrink-0 rounded-full bg-surface-blue flex items-center justify-center text-[11px] font-semibold text-ink-primary">
              {initials(q.author)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink-primary">{q.title}</p>
              {q.body && (
                <p className="text-[13px] text-ink-secondary mt-1">{q.body}</p>
              )}
              <p className="text-[10px] text-ink-tertiary mt-1">
                {q.author} · {q.answers.length} answer{q.answers.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          {q.answers.map((a) => (
            <div
              key={a.id}
              className={cn(
                'mt-3 ml-11 rounded-xl px-4 py-3 border',
                a.isAccepted
                  ? 'border-surface-sage/50 bg-surface-sage/10'
                  : 'border-[rgba(0,59,70,0.06)] bg-parchment',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold text-ink-primary">{a.author}</p>
                {a.isAccepted ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-surface-sage">
                    <CheckCircle2 size={12} /> Accepted answer
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => accept(q.id, a.id)}
                    className="text-[10px] font-medium text-ink-tertiary hover:text-ink-primary transition-colors"
                  >
                    Mark accepted
                  </button>
                )}
              </div>
              <p className="text-[13px] text-ink-secondary mt-1">{a.body}</p>
            </div>
          ))}

          {replyFor === q.id ? (
            <div className="mt-3 ml-11 flex items-center gap-2">
              <input
                autoFocus
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && replyText.trim()) {
                    answer(q.id, replyText.trim())
                    setReplyText('')
                    setReplyFor(null)
                  }
                }}
                placeholder="Share what you know…"
                className="flex-1 bg-parchment border border-[rgba(0,59,70,0.12)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ink-primary"
              />
              <button
                type="button"
                disabled={!replyText.trim()}
                onClick={() => {
                  answer(q.id, replyText.trim())
                  setReplyText('')
                  setReplyFor(null)
                }}
                className="shrink-0 rounded-full bg-ink-primary p-2 text-parchment disabled:opacity-40"
              >
                <Send size={13} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setReplyFor(q.id)}
              className="mt-3 ml-11 inline-flex items-center gap-1 text-[11px] font-medium text-ink-tertiary hover:text-ink-primary transition-colors"
            >
              <CornerDownRight size={12} /> Answer
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
