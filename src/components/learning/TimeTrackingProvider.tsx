'use client'

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  apiStartSession,
  apiHeartbeatSession,
  type LearningActivityType,
  type ViewerRole,
} from '@/lib/learning-dashboard-client'

/**
 * Time-tracking engine. Opens a learning_sessions row on mount, writes a
 * heartbeat every 30s (so partial sessions survive a crash/tab-close), and
 * closes it on unmount / beforeunload.
 *
 * Idle handling is ACTIVITY-SPECIFIC (Section 2), not one rule for all:
 *  - video: a *state* signal — the timer runs only while `videoPlaying` is
 *    true; pausing the video freezes it immediately (no grace period).
 *  - study/reading: an *activity* signal — the timer runs only while there's
 *    been scroll/click/keypress within the last 60s; 60s idle → auto-pause.
 *  - quiz: no idle-pause — the timer runs from open to submission.
 *
 * No-ops when a viewingUserId is set (a manager/admin reviewing someone's
 * dashboard must never write session data). An admin studying their OWN module
 * still tracks — the gate is "viewing someone else", not role.
 */

const IDLE_MS = 60 * 1000 // 1 minute of no interaction (study/reading)
const HEARTBEAT_MS = 30 * 1000

interface TimeTrackingValue {
  activeSeconds: number
  idle: boolean
  tracking: boolean
}

const Ctx = createContext<TimeTrackingValue>({ activeSeconds: 0, idle: false, tracking: false })

export function useTimeTracking() {
  return useContext(Ctx)
}

export function TimeTrackingProvider({
  academyId,
  moduleId,
  activityType,
  viewerRole,
  viewingUserId,
  videoPlaying,
  getResumePosition,
  children,
}: {
  academyId: string
  moduleId: string
  activityType: LearningActivityType
  viewerRole: ViewerRole
  viewingUserId?: string
  /** For activityType 'video': the player's playing state (idle signal). */
  videoPlaying?: boolean
  /** Returns the current resume position (video seconds or scroll %). */
  getResumePosition?: () => number | null
  children: ReactNode
}) {
  // Track whenever this is the learner's OWN session (not a manager/admin
  // viewing someone else). `viewerRole` is kept in the signature for clarity
  // but the gate is viewingUserId — an admin studying their own module tracks.
  void viewerRole
  const enabled = !viewingUserId
  const [activeSeconds, setActiveSeconds] = useState(0)
  const [idle, setIdle] = useState(false)

  const sessionIdRef = useRef<string | null>(null)
  const lastActivityRef = useRef<number>(0)
  const activeSecondsRef = useRef(0)
  const videoPlayingRef = useRef(videoPlaying)
  videoPlayingRef.current = videoPlaying
  const resumeRef = useRef(getResumePosition)
  resumeRef.current = getResumePosition

  // Wall-clock seconds counter with idle gating.
  useEffect(() => {
    if (!enabled) return
    lastActivityRef.current = Date.now()
    const markActive = () => {
      lastActivityRef.current = Date.now()
    }
    const events = ['mousemove', 'keydown', 'pointerdown', 'scroll'] as const
    events.forEach((e) => window.addEventListener(e, markActive, { passive: true }))

    const tick = window.setInterval(() => {
      // Activity-specific idle: video → play state; quiz → never idle;
      // study → no interaction within IDLE_MS (1 min).
      const isIdle =
        activityType === 'video'
          ? videoPlayingRef.current === false
          : activityType === 'quiz'
            ? false
            : Date.now() - lastActivityRef.current > IDLE_MS
      setIdle(isIdle)
      if (!isIdle) {
        activeSecondsRef.current += 1
        setActiveSeconds(activeSecondsRef.current)
      }
    }, 1000)

    return () => {
      events.forEach((e) => window.removeEventListener(e, markActive))
      window.clearInterval(tick)
    }
  }, [enabled, activityType])

  // Open the session, heartbeat, and close on unmount / tab-close.
  useEffect(() => {
    if (!enabled) return
    let cancelled = false

    apiStartSession({ academyId, moduleId, activityType }).then((s) => {
      if (!cancelled && s) sessionIdRef.current = s.id
    })

    const beat = (ended = false) => {
      const id = sessionIdRef.current
      if (!id) return
      const pos = resumeRef.current?.() ?? null
      apiHeartbeatSession(id, {
        durationSeconds: activeSecondsRef.current,
        idleFlag: false,
        ...(activityType === 'video'
          ? { videoPositionSeconds: pos }
          : { scrollPosition: pos }),
        ended,
      })
    }

    const hb = window.setInterval(() => beat(false), HEARTBEAT_MS)
    const onUnload = () => beat(true)
    window.addEventListener('beforeunload', onUnload)

    return () => {
      cancelled = true
      window.clearInterval(hb)
      window.removeEventListener('beforeunload', onUnload)
      beat(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, academyId, moduleId, activityType])

  return (
    <Ctx.Provider value={{ activeSeconds, idle, tracking: enabled }}>{children}</Ctx.Provider>
  )
}
