'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * In-app notification center state (§3.2 item 2 system + §3.4 bell UI).
 * Demo mode seeds representative notifications matching the kinds the DB
 * machinery produces (migration 0013 + course due dates); live mode swaps
 * the seed for a `notifications` table read.
 */

export interface AppNotification {
  id: string
  kind: 'recertification' | 'overdue_course' | 'nudge' | 'approval' | 'system'
  title: string
  body: string
  linkUrl: string
  createdAt: string // ISO
  read: boolean
}

const SEED: AppNotification[] = [
  {
    id: 'n-1',
    kind: 'recertification',
    title: 'Certification expiring soon',
    body: 'Your Level 1 (Foundation) certification expires in 43 days. Recertification has been scheduled.',
    linkUrl: '/certifications',
    createdAt: '2026-07-01T09:00:00+05:30',
    read: false,
  },
  {
    id: 'n-2',
    kind: 'overdue_course',
    title: 'Course overdue: Lead Qualification',
    body: 'This mandatory Level 1 course passed its due date. Complete it to stay on your learning path.',
    linkUrl: '/my-learning',
    createdAt: '2026-06-30T09:00:00+05:30',
    read: false,
  },
  {
    id: 'n-3',
    kind: 'nudge',
    title: 'Today’s 5-minute nudge is ready',
    body: 'A quick refresher targeting your top skill gap is waiting on your dashboard.',
    linkUrl: '/',
    createdAt: '2026-07-02T08:00:00+05:30',
    read: false,
  },
  {
    id: 'n-4',
    kind: 'approval',
    title: 'Assignment approved',
    body: 'Your practice calling assignment was approved by your manager.',
    linkUrl: '/my-learning',
    createdAt: '2026-06-28T15:20:00+05:30',
    read: true,
  },
]

interface NotificationState {
  notifications: AppNotification[]
  unreadCount: () => number
  markRead: (id: string) => void
  markAllRead: () => void
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: SEED,
      unreadCount: () => get().notifications.filter((n) => !n.read).length,
      markRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        })),
      markAllRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),
    }),
    { name: 'magppie-notifications-v1' },
  ),
)
