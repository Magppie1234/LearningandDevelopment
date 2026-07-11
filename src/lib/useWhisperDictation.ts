'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Push-to-talk voice dictation ("whisper flow"): records a short clip with the
 * browser's MediaRecorder, posts it to /api/assistant/transcribe (OpenAI
 * Whisper), and hands back the transcript. Toggle to start/stop.
 *
 *   const { status, error, supported, toggle } = useWhisperDictation(t => setInput(t))
 *
 * status: 'idle' → 'recording' → 'transcribing' → 'idle'. Errors (mic denied,
 * no key, transcription failure) surface via `error` and reset status to idle.
 */

export type DictationStatus = 'idle' | 'recording' | 'transcribing'

export function useWhisperDictation(onTranscript: (text: string) => void) {
  const [status, setStatus] = useState<DictationStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const onTranscriptRef = useRef(onTranscript)
  onTranscriptRef.current = onTranscript

  // Feature support (SSR-safe): needs mic capture + MediaRecorder.
  const [supported, setSupported] = useState(false)
  useEffect(() => {
    setSupported(
      typeof window !== 'undefined' &&
        !!navigator.mediaDevices?.getUserMedia &&
        typeof window.MediaRecorder !== 'undefined',
    )
  }, [])

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  const stop = useCallback(() => {
    const rec = recorderRef.current
    if (rec && rec.state !== 'inactive') rec.stop()
  }, [])

  const start = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []

      // Pick a mime type the browser actually supports; Whisper accepts webm/mp4.
      const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find(
        (m) => window.MediaRecorder.isTypeSupported?.(m),
      )
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
      recorderRef.current = rec

      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      rec.onstop = async () => {
        cleanupStream()
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' })
        chunksRef.current = []
        if (blob.size < 1200) {
          // Basically silence / too short to be a real utterance.
          setStatus('idle')
          return
        }
        setStatus('transcribing')
        try {
          const ext = (rec.mimeType || '').includes('mp4') ? 'mp4' : 'webm'
          const fd = new FormData()
          fd.append('audio', blob, `dictation.${ext}`)
          const res = await fetch('/api/assistant/transcribe', { method: 'POST', body: fd })
          const data = (await res.json().catch(() => ({}))) as { text?: string; error?: string }
          if (!res.ok) {
            setError(data.error ?? 'Transcription failed.')
          } else if (data.text) {
            onTranscriptRef.current(data.text)
          }
        } catch {
          setError('Could not reach the transcription service.')
        } finally {
          setStatus('idle')
        }
      }

      rec.start()
      setStatus('recording')
    } catch (err) {
      cleanupStream()
      setStatus('idle')
      const name = (err as { name?: string })?.name
      setError(
        name === 'NotAllowedError' || name === 'SecurityError'
          ? 'Microphone access was blocked. Allow it in your browser to use voice.'
          : 'Could not start recording. Check your microphone.',
      )
    }
  }, [cleanupStream])

  const toggle = useCallback(() => {
    if (status === 'recording') stop()
    else if (status === 'idle') void start()
    // transcribing → ignore
  }, [status, start, stop])

  // Safety: stop the mic if the component unmounts mid-recording.
  useEffect(() => () => {
    const rec = recorderRef.current
    if (rec && rec.state !== 'inactive') rec.stop()
    cleanupStream()
  }, [cleanupStream])

  return { status, error, supported, toggle, clearError: () => setError(null) }
}
