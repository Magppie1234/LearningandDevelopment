/**
 * Sales Academy video generator v2 — real motion graphics via Remotion.
 *
 * Per module (spec: remotion/spec.mjs):
 *   1. Synthesize each scene's narration (ElevenLabs when ELEVENLABS_API_KEY
 *      is set in env/.env.local; free Edge neural TTS otherwise) → durations.
 *   2. `npx remotion render` the SalesModule composition with the scene spec
 *      + durations as props → animated visuals (flowcharts, bars, tables,
 *      count-ups, ambient motion).
 *   3. Build the padded narration track (ffmpeg) and mux it onto the render.
 *   4. Emit en.vtt subtitles timed per scene.
 *
 * Output: public/assets/sales-academy/module-{n}/en.mp4 + en.vtt
 * Usage:  node scripts/gen-sales-videos-v2.mjs [moduleNumber ...]  (default all)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, copyFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'
import { MODULE_SPECS } from '../remotion/spec.mjs'

const ROOT = resolve(import.meta.dirname, '..')
const OUT_ROOT = join(ROOT, 'public', 'assets', 'sales-academy')
const EDGE_VOICE = 'en-IN-NeerjaNeural'
const PAD_S = 0.7 // must match PAD_S in remotion/scenes.tsx

loadDotEnvLocal()
const EL_KEY = process.env.ELEVENLABS_API_KEY
const EL_VOICE = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'

function loadDotEnvLocal() {
  const p = join(ROOT, '.env.local')
  if (!existsSync(p)) return
  for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+?)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
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

/* ── ffmpeg helpers ──────────────────────────────────────────────────── */
const ffprobeDur = (f) =>
  parseFloat(
    execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString(),
  )

/** Pad each scene's narration to exactly (dur + PAD_S), then concat. */
function buildAudioTrack(clips, work) {
  const padded = clips.map((c, i) => {
    const out = join(work, `pad-${i}.m4a`)
    execFileSync('ffmpeg', [
      '-y', '-i', c.file,
      '-af', `apad=whole_dur=${(c.dur + PAD_S).toFixed(3)}`,
      '-ar', '44100', '-ac', '2', '-c:a', 'aac', '-b:a', '128k', out,
    ], { stdio: 'ignore', timeout: 120_000 })
    return out
  })
  const list = join(work, 'alist.txt')
  writeFileSync(list, padded.map((p) => `file '${p.replace(/\\/g, '/')}'`).join('\n'))
  const track = join(work, 'track.m4a')
  execFileSync('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', track], {
    stdio: 'ignore', timeout: 120_000,
  })
  return track
}

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
  const only = process.argv.slice(2).map(Number).filter(Boolean)
  const specs = MODULE_SPECS.filter((m) => only.length === 0 || only.includes(m.number))
  if (!specs.length) throw new Error('no modules matched')
  console.log(`TTS: ${EL_KEY ? `ElevenLabs (${EL_VOICE})` : `Edge neural (${EDGE_VOICE}) — set ELEVENLABS_API_KEY to upgrade`}`)

  for (const spec of specs) {
    const t0 = Date.now()
    const work = join(tmpdir(), `sales-v2-m${spec.number}-${Date.now()}`)
    mkdirSync(work, { recursive: true })
    const outDir = join(OUT_ROOT, `module-${spec.number}`)
    mkdirSync(outDir, { recursive: true })

    // 1. narration per scene → durations
    const clips = []
    for (let i = 0; i < spec.scenes.length; i++) {
      const dir = join(work, `aud-${i}`)
      mkdirSync(dir, { recursive: true })
      const file = await synthesize(spec.scenes[i].vo, dir)
      clips.push({ file, dur: ffprobeDur(file) })
      process.stdout.write(`  m${spec.number} vo ${i + 1}/${spec.scenes.length} (${clips[i].dur.toFixed(1)}s)\n`)
    }

    // 2. remotion render (visuals) with durations injected
    const props = {
      number: spec.number,
      title: spec.title,
      scenes: spec.scenes.map((s, i) => ({ type: s.type, dur: clips[i].dur, props: s.props })),
    }
    const propsFile = join(work, 'props.json')
    writeFileSync(propsFile, JSON.stringify(props))
    const silent = join(work, 'silent.mp4')
    execFileSync('npx', [
      'remotion', 'render', 'remotion/index.ts', 'SalesModule', silent,
      `--props=${propsFile}`, '--codec=h264', '--concurrency=4', '--log=error',
    ], { cwd: ROOT, stdio: 'inherit', timeout: 1_800_000, shell: true })

    // 3. audio track + mux
    const track = buildAudioTrack(clips, work)
    const finalMp4 = join(outDir, 'en.mp4')
    execFileSync('ffmpeg', [
      '-y', '-i', silent, '-i', track,
      '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'copy', '-shortest', finalMp4,
    ], { stdio: 'ignore', timeout: 300_000 })

    // 4. subtitles
    writeFileSync(
      join(outDir, 'en.vtt'),
      buildVtt(spec.scenes.map((s, i) => ({ text: s.vo, dur: clips[i].dur + PAD_S }))),
    )

    console.log(
      `module-${spec.number}: en.mp4 ${ffprobeDur(finalMp4).toFixed(1)}s (+en.vtt) in ${((Date.now() - t0) / 1000).toFixed(0)}s`,
    )
    rmSync(work, { recursive: true, force: true })
  }
  console.log('DONE')
}

main().catch((e) => {
  console.error('FAILED:', e.message)
  process.exit(1)
})
