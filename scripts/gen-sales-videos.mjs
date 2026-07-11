/**
 * Sales Academy video generator — fully free, fully local.
 *
 * Pipeline (same spirit as the BD films' "Remotion + Edge neural TTS"):
 *   1. Parse docs/sales-academy-video-scripts.md (scene VO + ON SCREEN cues).
 *   2. Render each scene as a brand-styled 1280x720 card → PNG via headless
 *      Microsoft Edge (--screenshot).
 *   3. Narrate each scene's VO with Microsoft Edge neural TTS (msedge-tts,
 *      free) — voice en-IN-NeerjaNeural to match the "Pooja" consultant persona.
 *   4. ffmpeg: card + narration per scene → segment; concat → en.mp4.
 *   5. Emit en.vtt subtitles (one cue per scene, timed from audio durations).
 *
 * Output: public/assets/sales-academy/module-{n}/en.mp4 + en.vtt — the paths
 * SalesVideoPlayer already points at, so the videos go live with no code change.
 *
 * Usage: node scripts/gen-sales-videos.mjs [moduleNumber ...]  (default: all)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'

const ROOT = resolve(import.meta.dirname, '..')
const SCRIPT_DOC = join(ROOT, 'docs', 'sales-academy-video-scripts.md')
const OUT_ROOT = join(ROOT, 'public', 'assets', 'sales-academy')
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const VOICE = 'en-IN-NeerjaNeural'
const W = 1280
const H = 720
const SCENE_PAD_S = 0.7 // silence after each scene's narration

// ── TTS provider ──────────────────────────────────────────────────────
// ElevenLabs when ELEVENLABS_API_KEY is set (in the environment or
// .env.local); Microsoft Edge neural TTS (free) otherwise. Voice override
// via ELEVENLABS_VOICE_ID (default: Rachel).
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

/* ── 1. Parse the scripts doc ─────────────────────────────────────────── */
function parseScripts() {
  const raw = readFileSync(SCRIPT_DOC, 'utf8')
  const modules = []
  const modRe = /^## Module (\d+) — (.+?) \(/gm
  const headers = [...raw.matchAll(modRe)]
  headers.forEach((h, i) => {
    const number = Number(h[1])
    const title = h[2].trim()
    const body = raw.slice(h.index, headers[i + 1]?.index ?? raw.length)
    const scenes = []
    const sceneRe = /\*\*Scene \d+ · (.+?)\*\*\n([\s\S]*?)(?=\n\*\*Scene |\n---|\n## |$)/g
    for (const s of body.matchAll(sceneRe)) {
      const name = s[1].trim()
      const vo = s[2].match(/- VO: "([\s\S]*?)"\s*(?:\n|$)/)?.[1] ?? ''
      const onScreen = s[2].match(/- ON SCREEN: ([\s\S]*?)(?:\n|$)/)?.[1] ?? ''
      if (vo) scenes.push({ name, vo, onScreen })
    }
    if (scenes.length) modules.push({ number, title, scenes })
  })
  return modules
}

/* ── 2. Scene card → PNG ──────────────────────────────────────────────── */
function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function sceneHtml(mod, scene, idx, total) {
  // ON SCREEN cues are production notes; show the readable part: strip
  // editor parentheticals, markdown bold, and leading graphic-type labels
  // ("Timeline graphic:", "Animated 8-node flowchart," …).
  const onScreen = scene.onScreen
    .replace(/\((?:Do NOT|No payment)[^)]*\)/g, '')
    .replace(/\*\*/g, '')
    .replace(
      /^[^:]{0,80}?(?:graphic|diagram|card|table|grid|list|map|flowchart|bars?|chips|panels?|timeline|checklist|quote cards?|mini-flow|rhythm bar|inset|wash)[^:]*:\s*/i,
      '',
    )
    .trim()
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  * { margin:0; padding:0; box-sizing:border-box; }
  /* Transparent body — the animated background is composited in ffmpeg. */
  body { width:${W}px; height:${H}px; overflow:hidden; font-family:Georgia,'Times New Roman',serif;
    background:transparent; color:#F5EFE6; position:relative; }
  body::before { content:''; position:absolute; inset:0;
    background:radial-gradient(120% 90% at 85% 10%, rgba(184,112,63,0.16), transparent 55%),
               radial-gradient(100% 80% at 10% 95%, rgba(124,139,111,0.10), transparent 50%); }
  .frame { position:relative; height:100%; padding:56px 72px; display:flex; flex-direction:column; }
  .eyebrow { font-family:Arial,Helvetica,sans-serif; font-size:15px; letter-spacing:4px;
    color:#C88255; text-transform:uppercase; }
  .module { font-family:Arial,Helvetica,sans-serif; font-size:15px; color:rgba(245,239,230,0.55);
    margin-top:6px; letter-spacing:1px; }
  .rule { width:64px; height:3px; background:#B8703F; margin:26px 0 30px; }
  .scene { font-size:44px; line-height:1.15; font-weight:normal; max-width:900px; }
  .cue { font-family:Arial,Helvetica,sans-serif; font-size:22px; line-height:1.55;
    color:rgba(245,239,230,0.82); margin-top:28px; max-width:980px; white-space:pre-wrap; }
  .counter { position:absolute; bottom:44px; right:72px; font-family:Arial,sans-serif;
    font-size:14px; color:rgba(245,239,230,0.4); letter-spacing:2px; }
  .brand { position:absolute; bottom:44px; left:72px; font-family:Arial,sans-serif;
    font-size:14px; color:rgba(200,130,85,0.75); letter-spacing:3px; }
  </style></head><body><div class="frame">
    <div class="eyebrow">Magppie · Sales Academy</div>
    <div class="module">Module ${mod.number} — ${esc(mod.title)}</div>
    <div class="rule"></div>
    <div class="scene">${esc(scene.name)}</div>
    <div class="cue">${esc(onScreen)}</div>
    <div class="brand">MAGPPIE</div>
    <div class="counter">${idx + 1} / ${total}</div>
  </div></body></html>`
}

function renderCard(html, pngPath, work) {
  const htmlPath = join(work, 'card.html')
  writeFileSync(htmlPath, html)
  const profile = join(work, `edge-prof-${Date.now()}`)
  execFileSync(EDGE, [
    '--headless', '--disable-gpu', '--no-sandbox', `--user-data-dir=${profile}`,
    `--screenshot=${pngPath}`, `--window-size=${W},${H}`, '--hide-scrollbars',
    '--force-device-scale-factor=1', '--default-background-color=00000000',
    `file:///${htmlPath.replace(/\\/g, '/')}`,
  ], { stdio: 'ignore', timeout: 60_000 })
  if (!existsSync(pngPath)) throw new Error(`card render failed: ${pngPath}`)
}

/* ── 3. Narration via Edge neural TTS ─────────────────────────────────── */
function cleanVo(vo) {
  // [PAUSE …] stage directions become a sentence break for the TTS.
  return vo.replace(/\[PAUSE[^\]]*\]/g, ' ').replace(/\s{2,}/g, ' ').trim()
}

async function synthesize(text, outDir) {
  if (EL_KEY) return synthesizeElevenLabs(text, outDir)
  const tts = new MsEdgeTTS()
  await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3)
  const res = await tts.toFile(outDir, text)
  const file = typeof res === 'string' ? res : res.audioFilePath
  if (!file || !existsSync(file)) throw new Error('TTS produced no audio file')
  return file
}

/** ElevenLabs TTS (needs ELEVENLABS_API_KEY; ELEVENLABS_VOICE_ID optional). */
async function synthesizeElevenLabs(text, outDir) {
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
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const file = join(outDir, 'audio.mp3')
  writeFileSync(file, Buffer.from(await res.arrayBuffer()))
  return file
}

/* ── 4. ffmpeg helpers ────────────────────────────────────────────────── */
function ffprobeDuration(file) {
  const out = execFileSync('ffprobe', [
    '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file,
  ]).toString().trim()
  return parseFloat(out)
}

/**
 * Animated scene segment:
 *  - background: slow-drifting warm gradient (ffmpeg `gradients` source)
 *  - card: fades in (0.6s) and out (0.5s), composited over the background
 *  - motion: gentle Ken Burns push-in on the whole composite, anchor
 *    alternating left/right per scene for variety
 */
function makeSegment(png, mp3, dur, outMp4, sceneIdx = 0) {
  const T = +(dur + SCENE_PAD_S).toFixed(2)
  const fadeOutStart = Math.max(0, T - 0.5).toFixed(2)
  // Alternate the push-in anchor: even scenes drift toward the left third,
  // odd scenes toward the right third.
  const xExpr = sceneIdx % 2 === 0 ? 'iw/2-(iw/zoom/2)-((iw/12)*(zoom-1))' : 'iw/2-(iw/zoom/2)+((iw/12)*(zoom-1))'
  const filter =
    `[1:v]format=rgba,fade=t=in:st=0:d=0.6:alpha=1,fade=t=out:st=${fadeOutStart}:d=0.5:alpha=1[card];` +
    `[0:v][card]overlay=0:0[comp];` +
    `[comp]zoompan=z='min(1.06,1+0.00055*on)':d=1:x='${xExpr}':y='ih/2-(ih/zoom/2)':s=${W}x${H}:fps=30,format=yuv420p[v]`
  execFileSync('ffmpeg', [
    '-y',
    '-f', 'lavfi',
    '-i', `gradients=s=${W}x${H}:c0=0x2B2420:c1=0x533926:c2=0x1C1712:nb_colors=3:speed=0.02:rate=30:duration=${T + 1}`,
    '-loop', '1', '-framerate', '30', '-i', png,
    '-i', mp3,
    '-filter_complex', filter,
    '-map', '[v]', '-map', '2:a',
    '-t', String(T),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '22',
    '-c:a', 'aac', '-b:a', '128k',
    '-af', `apad=pad_dur=${SCENE_PAD_S + 0.8}`,
    outMp4,
  ], { stdio: 'ignore', timeout: 300_000 })
}

function concatSegments(segments, outMp4, work) {
  const list = join(work, 'list.txt')
  writeFileSync(list, segments.map((s) => `file '${s.replace(/\\/g, '/').replace(/'/g, "'\\''")}'`).join('\n'))
  execFileSync('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', outMp4], {
    stdio: 'ignore', timeout: 300_000,
  })
}

/* ── 5. VTT ───────────────────────────────────────────────────────────── */
function ts(sec) {
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
    // Split long VO into <=2-line chunks across the scene window.
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

/* ── main ─────────────────────────────────────────────────────────────── */
async function main() {
  const only = process.argv.slice(2).map(Number).filter(Boolean)
  const modules = parseScripts().filter((m) => only.length === 0 || only.includes(m.number))
  if (modules.length === 0) throw new Error('no modules matched')
  console.log(`TTS: ${EL_KEY ? `ElevenLabs (voice ${EL_VOICE})` : `Edge neural (${VOICE}) — set ELEVENLABS_API_KEY in .env.local to upgrade`}`)

  for (const mod of modules) {
    const t0 = Date.now()
    const work = join(tmpdir(), `sales-video-m${mod.number}-${Date.now()}`)
    mkdirSync(work, { recursive: true })
    const outDir = join(OUT_ROOT, `module-${mod.number}`)
    mkdirSync(outDir, { recursive: true })

    const segments = []
    const cues = []
    for (let i = 0; i < mod.scenes.length; i++) {
      const scene = mod.scenes[i]
      const png = join(work, `scene-${i}.png`)
      renderCard(sceneHtml(mod, scene, i, mod.scenes.length), png, work)

      const voText = cleanVo(scene.vo)
      const audDir = join(work, `aud-${i}`)
      mkdirSync(audDir, { recursive: true })
      const mp3 = await synthesize(voText, audDir)
      const dur = ffprobeDuration(mp3)

      const seg = join(work, `seg-${i}.mp4`)
      makeSegment(png, mp3, dur, seg, i)
      segments.push(seg)
      cues.push({ text: voText, dur: dur + SCENE_PAD_S })
      process.stdout.write(`  m${mod.number} scene ${i + 1}/${mod.scenes.length} (${dur.toFixed(1)}s)\n`)
    }

    const outMp4 = join(outDir, 'en.mp4')
    concatSegments(segments, outMp4, work)
    writeFileSync(join(outDir, 'en.vtt'), buildVtt(cues))
    const total = ffprobeDuration(outMp4)
    console.log(`module-${mod.number}: en.mp4 ${total.toFixed(1)}s (+en.vtt) in ${((Date.now() - t0) / 1000).toFixed(0)}s`)
    rmSync(work, { recursive: true, force: true })
  }
  console.log('DONE')
}

main().catch((e) => {
  console.error('FAILED:', e.message)
  process.exit(1)
})
