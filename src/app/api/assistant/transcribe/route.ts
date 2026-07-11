import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * POST /api/assistant/transcribe  (multipart/form-data, field `audio`)
 *
 * Voice-dictation ("whisper flow") for the AI Assistant: the browser records a
 * short clip and posts it here; we forward it to OpenAI Whisper (whisper-1) and
 * return the transcript, which the client drops into the chat input for the
 * user to review and send.
 *
 * Degrades gracefully like the rest of the portal: with no OPENAI_API_KEY it
 * returns 503 so the UI can explain that voice needs a key, rather than erroring.
 */
export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Voice input needs OPENAI_API_KEY (Whisper). Type your question instead for now.' },
      { status: 503 },
    )
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Expected multipart/form-data with an `audio` file.' }, { status: 400 })
  }

  const audio = form.get('audio')
  if (!(audio instanceof File) || audio.size === 0) {
    return NextResponse.json({ error: 'No audio provided.' }, { status: 400 })
  }
  // Guard against oversized uploads (Whisper caps at 25MB; keep clips short).
  if (audio.size > 25 * 1024 * 1024) {
    return NextResponse.json({ error: 'Recording too long — keep it under ~25MB.' }, { status: 413 })
  }

  const upstream = new FormData()
  upstream.append('file', audio, audio.name || 'dictation.webm')
  upstream.append('model', 'whisper-1')
  upstream.append('response_format', 'json')

  try {
    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: upstream,
      signal: AbortSignal.timeout(30_000),
    })
    if (!res.ok) {
      console.error(`Whisper returned ${res.status}: ${await res.text()}`)
      return NextResponse.json({ error: 'Transcription failed. Please try again.' }, { status: 502 })
    }
    const data = (await res.json()) as { text?: string }
    return NextResponse.json({ text: (data.text ?? '').trim() })
  } catch (err) {
    console.error('Whisper call failed:', err)
    return NextResponse.json({ error: 'Transcription request failed.' }, { status: 502 })
  }
}
