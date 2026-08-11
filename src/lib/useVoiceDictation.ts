'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Voice dictation with a live preview of what you are saying.
 *
 * TWO ENGINES, and the choice is not arbitrary:
 *
 *   'speech'  — the browser's own SpeechRecognition. Streams *interim* results
 *               while you talk, so the words appear as you speak them. Needs no
 *               API key and costs nothing. Chrome/Edge/Safari.
 *   'whisper' — POSTs a recorded clip to /api/assistant/transcribe (OpenAI
 *               Whisper). Used only where SpeechRecognition is missing
 *               (Firefox). Batch by nature: nothing exists to preview until
 *               the clip is uploaded and processed, so `interim` stays empty.
 *
 * Whisper was the original implementation, and it is why voice appeared broken:
 * without OPENAI_API_KEY the route returns 503, and a live preview was never
 * possible through it at all. SpeechRecognition is therefore the primary path
 * and Whisper the fallback, not the other way round.
 *
 *   const { status, interim, toggle } = useVoiceDictation(t => setInput(t))
 *
 * status: 'idle' → 'listening' → ('transcribing' for whisper) → 'idle'.
 * `interim` is the not-yet-final text — render it as a preview, never send it.
 */

export type DictationStatus = 'idle' | 'listening' | 'transcribing'
export type DictationEngine = 'speech' | 'whisper' | null

/** Minimal shape of the Web Speech API — it is not in the standard DOM lib. */
interface SpeechRecognitionAlternativeLike {
  transcript: string
}
interface SpeechRecognitionResultLike {
  isFinal: boolean
  0: SpeechRecognitionAlternativeLike
}
interface SpeechRecognitionEventLike {
  resultIndex: number
  results: { length: number; [i: number]: SpeechRecognitionResultLike }
}
interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((e: SpeechRecognitionEventLike) => void) | null
  onerror: ((e: { error?: string }) => void) | null
  onend: (() => void) | null
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function useVoiceDictation(
  onTranscript: (text: string) => void,
  { lang = 'en-IN' }: { lang?: string } = {},
) {
  const [status, setStatus] = useState<DictationStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [interim, setInterim] = useState('')
  const [engine, setEngine] = useState<DictationEngine>(null)
  const [supported, setSupported] = useState(false)

  const onTranscriptRef = useRef(onTranscript)
  onTranscriptRef.current = onTranscript

  // speech engine
  const recogRef = useRef<SpeechRecognitionLike | null>(null)
  const finalRef = useRef('')
  /** True between the user's start and stop — distinct from the engine's own
   *  start/stop, which fires repeatedly during one dictation. */
  const wantListeningRef = useRef(false)

  // whisper engine
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    const hasSpeech = !!getSpeechRecognition()
    const hasRecorder =
      typeof window !== 'undefined' &&
      !!navigator.mediaDevices?.getUserMedia &&
      typeof window.MediaRecorder !== 'undefined'
    setEngine(hasSpeech ? 'speech' : hasRecorder ? 'whisper' : null)
    setSupported(hasSpeech || hasRecorder)
  }, [])

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  /** Hand the accumulated text to the caller and reset. */
  const commit = useCallback(() => {
    const text = finalRef.current.trim()
    finalRef.current = ''
    setInterim('')
    if (text) onTranscriptRef.current(text)
  }, [])

  /* ── speech engine ─────────────────────────────────────────────────── */
  const startSpeech = useCallback(() => {
    const Ctor = getSpeechRecognition()
    if (!Ctor) return
    const rec = new Ctor()
    rec.lang = lang
    rec.continuous = true
    rec.interimResults = true // the whole point: live preview
    rec.maxAlternatives = 1

    rec.onresult = (e) => {
      let live = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        const text = r[0]?.transcript ?? ''
        if (r.isFinal) finalRef.current += (finalRef.current ? ' ' : '') + text.trim()
        else live += text
      }
      setInterim(live)
    }

    rec.onerror = (e) => {
      const code = e?.error
      // 'no-speech' and 'aborted' are normal during a pause — not failures.
      if (code === 'no-speech' || code === 'aborted') return
      wantListeningRef.current = false
      setError(
        code === 'not-allowed' || code === 'service-not-allowed'
          ? 'Microphone access was blocked. Allow it in your browser to use voice.'
          : code === 'network'
            ? 'Speech recognition needs a network connection.'
            : 'Voice input stopped unexpectedly. Try again.',
      )
      setStatus('idle')
      setInterim('')
    }

    rec.onend = () => {
      // Chrome ends the session on a pause even with continuous = true.
      // Restart while the user still wants to dictate, so a thinking pause
      // does not silently end the recording.
      if (wantListeningRef.current) {
        try {
          rec.start()
          return
        } catch {
          /* fall through to stopping */
        }
      }
      recogRef.current = null
      setStatus('idle')
      commit()
    }

    recogRef.current = rec
    wantListeningRef.current = true
    finalRef.current = ''
    setInterim('')
    try {
      rec.start()
      setStatus('listening')
    } catch {
      wantListeningRef.current = false
      setError('Could not start voice input.')
      setStatus('idle')
    }
  }, [lang, commit])

  /* ── whisper engine (fallback) ─────────────────────────────────────── */
  const startWhisper = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []
      const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((m) =>
        window.MediaRecorder.isTypeSupported?.(m),
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
          if (!res.ok) setError(data.error ?? 'Transcription failed.')
          else if (data.text) onTranscriptRef.current(data.text)
        } catch {
          setError('Could not reach the transcription service.')
        } finally {
          setStatus('idle')
        }
      }
      rec.start()
      setStatus('listening')
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

  const stop = useCallback(() => {
    if (engine === 'speech') {
      wantListeningRef.current = false
      recogRef.current?.stop()
      return
    }
    const rec = recorderRef.current
    if (rec && rec.state !== 'inactive') rec.stop()
  }, [engine])

  const toggle = useCallback(() => {
    setError(null)
    if (status === 'listening') stop()
    else if (status === 'idle') {
      if (engine === 'speech') startSpeech()
      else if (engine === 'whisper') void startWhisper()
    }
    // transcribing → ignore
  }, [status, engine, stop, startSpeech, startWhisper])

  // Stop the mic if the component unmounts mid-dictation.
  useEffect(
    () => () => {
      wantListeningRef.current = false
      recogRef.current?.abort()
      const rec = recorderRef.current
      if (rec && rec.state !== 'inactive') rec.stop()
      streamRef.current?.getTracks().forEach((t) => t.stop())
    },
    [],
  )

  return {
    status,
    error,
    supported,
    engine,
    /** Live, not-yet-final words. Preview only — never send this. */
    interim,
    toggle,
    clearError: () => setError(null),
  }
}
