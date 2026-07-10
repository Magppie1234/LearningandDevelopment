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
 * Idle handling: for study/video reading, 3 minutes with no mouse/keyboard
 * activity auto-pauses and stops accumulating time. For `video`, the idle
 * signal is playback state instead (watching legitimately involves no mouse
 * movement) — pass `videoPlaying` from the player.
 *
 * No-ops entirely when viewerRole !== 'learner' or a viewingUserId is set:
 * a manager/admin reviewing someone's dashboard must never write session data.
 */

const IDLE_MS = 3 * 60 * 1000
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
  const enabled = viewerRole === 'learner' && !viewingUserId
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
      const isIdle =
        activityType === 'video'
          ? videoPlayingRef.current === false
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
