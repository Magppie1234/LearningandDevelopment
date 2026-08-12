/**
 * Onboarding walkthrough video generator.
 *
 * Same pipeline as the Sales Academy videos (scripts/gen-sales-videos-v2.mjs) —
 * per-scene neural TTS → Remotion render → narration track muxed on → VTT —
 * reusing remotion/scenes.tsx rather than standing up a second one. The only
 * departure: ffmpeg/ffprobe are invoked through `npx remotion`, which ships
 * its own binaries, because this machine has no system ffmpeg. Everything
 * downstream is identical.
 *
 * Voice: free Edge neural TTS, or ElevenLabs when ELEVENLABS_API_KEY is set.
 * Either way it is a stock voice — never a clone of a real person's. See the
 * sourcing note in remotion/onboarding-spec.mjs. No presenter or avatar
 * appears on screen — the roadmap is the only visual.
 *
 * Output: public/assets/onboarding/onboarding.mp4 + onboarding.vtt
 * Usage:  node scripts/gen-onboarding-video.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, copyFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'
import { ONBOARDING_VIDEO_SPEC } from '../remotion/onboarding-spec.mjs'

const ROOT = resolve(import.meta.dirname, '..')
const OUT_DIR = join(ROOT, 'public', 'assets', 'onboarding')
const EDGE_VOICE = 'en-IN-NeerjaNeural'
const PAD_S = 0.7 // must match PAD_S in remotion/scenes.tsx

loadDotEnv()
const EL_KEY = process.env.ELEVENLABS_API_KEY
const EL_VOICE = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'

function loadDotEnv() {
  for (const name of ['.env.local', '.env']) {
    const p = join(ROOT, name)
    if (!existsSync(p)) continue
    for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+?)\s*$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
    }
  }
}

/* ── TTS ─────────────────────────────────────────────────────────────── */
async function synthesize(text, outDir) {
  if (EL_KEY) {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${EL_VOICE}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: { 'xi-api-key': EL_KEY, 'content-type': 'application/json' },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      },
    )
    if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 200)}`)
    const f = join(outDir, 'audio.mp3')
    writeFileSync(f, Buffer.from(await res.arrayBuffer()))
    return f
  }
  const tts = new MsEdgeTTS()
  await tts.setMetadata(EDGE_VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3)
  const res = await tts.toFile(outDir, text)
  const f = typeof res === 'string' ? res : res.audioFilePath
  if (!f || !existsSync(f)) throw new Error('Edge TTS produced no audio')
  return f
}

/* ── ffmpeg via Remotion's bundled binaries ──────────────────────────── */
const npx = (args, opts = {}) =>
  execFileSync('npx', args, { cwd: ROOT, shell: true, timeout: 600_000, ...opts })

const ffprobeDur = (f) =>
  parseFloat(
    npx(
      ['remotion', 'ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f],
      { stdio: ['ignore', 'pipe', 'ignore'] },
    )
      .toString()
      .trim()
      .split(/\s+/)
      .pop(),
  )

/* ── VTT ─────────────────────────────────────────────────────────────── */
const ts = (sec) => {
  const h = String(Math.floor(sec / 3600)).padStart(2, '0')
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0')
  const s = (sec % 60).toFixed(3).padStart(6, '0')
  return `${h}:${m}:${s}`
}
function buildVtt(cues) {
  let out = 'WEBVTT\n\n'
  let t = 0
  cues.forEach((c, i) => {
    const end = t + c.dur
    const sentences = c.text.match(/[^.!?]+[.!?]+["']?\s*/g) ?? [c.text]
    const per = c.dur / sentences.length
    sentences.forEach((sent, j) => {
      const s0 = t + per * j
      const s1 = j === sentences.length - 1 ? end : t + per * (j + 1)
      out += `${i + 1}.${j + 1}\n${ts(s0)} --> ${ts(s1)}\n${sent.trim()}\n\n`
    })
    t = end
  })
  return out
}

/* ── main ────────────────────────────────────────────────────────────── */
async function main() {
  const t0 = Date.now()
  const work = join(tmpdir(), `onboarding-${Date.now()}`)
  mkdirSync(work, { recursive: true })
  mkdirSync(OUT_DIR, { recursive: true })
  console.log(
    `TTS: ${EL_KEY ? `ElevenLabs (${EL_VOICE})` : `Edge neural (${EDGE_VOICE}) — free, no key needed`}`,
  )

  // 1. narration per scene, written under public/ so Remotion can staticFile()
  //    it, → durations
  const voDir = join(OUT_DIR, 'vo')
  mkdirSync(voDir, { recursive: true })
  const clips = []
  for (let i = 0; i < ONBOARDING_VIDEO_SPEC.scenes.length; i++) {
    const dir = join(work, `aud-${i}`)
    mkdirSync(dir, { recursive: true })
    const tmp = await synthesize(ONBOARDING_VIDEO_SPEC.scenes[i].vo, dir)
    const file = join(voDir, `scene-${i + 1}.mp3`)
    copyFileSync(tmp, file)
    const dur = ffprobeDur(file)
    if (!Number.isFinite(dur) || dur <= 0) throw new Error(`bad duration for scene ${i + 1}`)
    clips.push({ file, dur, rel: `assets/onboarding/vo/scene-${i + 1}.mp3` })
    process.stdout.write(`  vo ${i + 1}/${ONBOARDING_VIDEO_SPEC.scenes.length} (${dur.toFixed(1)}s)\n`)
  }

  // 2. render — Remotion mixes the narration in itself, so there is no
  //    separate mux step. Its bundled ffmpeg is a minimal build with no
  //    mp4/m4a audio muxer, which is exactly what a mux would have needed.
  const props = {
    number: ONBOARDING_VIDEO_SPEC.number,
    title: ONBOARDING_VIDEO_SPEC.title,
    kicker: ONBOARDING_VIDEO_SPEC.kicker,
    scenes: ONBOARDING_VIDEO_SPEC.scenes.map((s, i) => ({
      type: s.type,
      dur: clips[i].dur,
      props: s.props,
      audio: clips[i].rel,
    })),
  }
  const propsFile = join(work, 'props.json')
  writeFileSync(propsFile, JSON.stringify(props))
  const finalMp4 = join(OUT_DIR, 'onboarding.mp4')
  execFileSync(
    'npx',
    ['remotion', 'render', 'remotion/index.ts', 'SalesModule', finalMp4,
      `--props=${propsFile}`, '--codec=h264', '--concurrency=2', '--log=error'],
    { cwd: ROOT, stdio: 'inherit', timeout: 1_800_000, shell: true },
  )

  // 3. subtitles
  writeFileSync(
    join(OUT_DIR, 'onboarding.vtt'),
    buildVtt(ONBOARDING_VIDEO_SPEC.scenes.map((s, i) => ({ text: s.vo, dur: clips[i].dur + PAD_S }))),
  )

  console.log(
    `onboarding.mp4 ${ffprobeDur(finalMp4).toFixed(1)}s (+onboarding.vtt) in ${((Date.now() - t0) / 1000).toFixed(0)}s`,
  )
  rmSync(work, { recursive: true, force: true })
}

main().catch((e) => {
  console.error('FAILED:', e.message)
  process.exit(1)
})
