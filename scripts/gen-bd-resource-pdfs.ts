/**
 * Generates one downloadable PDF "reading pack" per BD module into
 * public/resources/bd/ — the real files behind the Academy Resources tab.
 *
 * CONTENT RULE: nothing here is invented. Every page is assembled verbatim from
 * the three approved sources:
 *   1. src/data/bd-academy.ts        — the reviewed module reading content
 *   2. src/data/training-doc.ts      — verbatim scripts/FAQ from the master
 *                                      training document (same corpus Pooja uses)
 *   3. the prototype's bd_academy.db — the reviewed English narration scripts
 *
 * Each pack: cover page → reading content → verbatim source material
 * (scripts/FAQ for that module's sections) → narration script. Page breaks
 * between parts guarantee every pack is at least 4 pages.
 *
 * Run: node node_modules/tsx/dist/cli.mjs scripts/gen-bd-resource-pdfs.ts <path-to-bd_academy.db>
 */
import fs from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import PDFDocument from 'pdfkit'
import { BD_MODULES, BD_SOURCE_DOC, type ContentBlock } from '../src/data/bd-academy'
import { TRAINING_CHUNKS, TRAINING_DOC_VERSION } from '../src/data/training-doc'

const DB_PATH = process.argv[2]
if (!DB_PATH || !fs.existsSync(DB_PATH)) {
  console.error('Usage: tsx scripts/gen-bd-resource-pdfs.ts <path-to-bd_academy.db>')
  process.exit(1)
}
const OUT_DIR = path.join(__dirname, '..', 'public', 'resources', 'bd')
fs.mkdirSync(OUT_DIR, { recursive: true })

// Narration scripts (verbatim, reviewed) keyed m1..m10 in the prototype db.
const db = new DatabaseSync(DB_PATH)
const narration = new Map<string, string>()
for (const row of db
  .prepare('SELECT module_id, narration_script FROM module_videos WHERE language_code = ?')
  .all('en') as { module_id: string; narration_script: string }[]) {
  narration.set(`bd-${row.module_id}`, row.narration_script)
}
db.close()

/** Which training-doc chunks belong in each module's "source material" part.
 *  Mapped by the sections each module was built from (source_section in the
 *  backend port) — same grouping, nothing re-derived. */
const CHUNK_FILTER: Record<string, (c: (typeof TRAINING_CHUNKS)[number]) => boolean> = {
  'bd-m1': (c) => ['1.1', '1.2'].includes(c.sectionNumber),
  'bd-m2': (c) => ['1.3', '1.4'].includes(c.sectionNumber),
  'bd-m3': (c) => c.sectionNumber === '1.5',
  'bd-m4': (c) => ['1.6', '1.7'].includes(c.sectionNumber),
  'bd-m5': (c) => c.category === 'pitch_flow',
  'bd-m6': (c) => c.category === 'objection_handling',
  'bd-m7': (c) => c.category === 'faq' && /^5\.[AFG]\b/.test(c.sectionNumber),
  'bd-m8': (c) =>
    (c.category === 'faq' && /^5\.[BDE]\b/.test(c.sectionNumber)) || c.category === 'pricing',
  'bd-m9': (c) => c.category === 'persona_tone',
  'bd-m10': (c) =>
    ['handoff_rules', 'store_directory', 'cheat_sheet'].includes(c.category),
}

// Windows core fonts — full Unicode (₹, →, °C) unlike PDF base-14.
const FONT = 'C:/Windows/Fonts/arial.ttf'
const FONT_BOLD = 'C:/Windows/Fonts/arialbd.ttf'
const NAVY = '#003b46'
const COPPER = '#B8703F'
const INK2 = '#5c5245'
const INK3 = '#8a7c6a'

function newDoc(file: string) {
  const doc = new PDFDocument({ size: 'A4', margins: { top: 64, bottom: 64, left: 56, right: 56 } })
  doc.pipe(fs.createWriteStream(file))
  doc.registerFont('body', FONT)
  doc.registerFont('bold', FONT_BOLD)
  return doc
}
function partLabel(doc: PDFKit.PDFDocument, text: string) {
  doc.font('bold').fontSize(9).fillColor(COPPER).text(text.toUpperCase(), { characterSpacing: 1.5 })
  doc.moveDown(0.6)
}
function heading(doc: PDFKit.PDFDocument, text: string) {
  doc.moveDown(0.4)
  doc.font('bold').fontSize(12.5).fillColor(NAVY).text(text)
  doc.moveDown(0.3)
}
function para(doc: PDFKit.PDFDocument, text: string) {
  doc.font('body').fontSize(10.5).fillColor(INK2).text(text, { lineGap: 2.5 })
  doc.moveDown(0.45)
}
function bullet(doc: PDFKit.PDFDocument, text: string, n?: number) {
  doc.font('body').fontSize(10.5).fillColor(INK2)
  doc.text(`${n !== undefined ? `${n}.` : '•'}  ${text}`, { indent: 10, lineGap: 2.5 })
  doc.moveDown(0.2)
}
function callout(doc: PDFKit.PDFDocument, label: string, text: string) {
  doc.moveDown(0.2)
  doc.font('bold').fontSize(9.5).fillColor(COPPER).text(label)
  doc.font('body').fontSize(10.5).fillColor(NAVY).text(text, { indent: 10, lineGap: 2.5 })
  doc.moveDown(0.45)
}
function renderBlock(doc: PDFKit.PDFDocument, b: ContentBlock) {
  if (b.kind === 'heading') heading(doc, b.text)
  else if (b.kind === 'paragraph') para(doc, b.text)
  else if (b.kind === 'callout') callout(doc, b.label ?? 'Note', b.text)
  else if (b.kind === 'list') b.items.forEach((it, i) => bullet(doc, it, b.ordered ? i + 1 : undefined))
  else if (b.kind === 'table') {
    doc.moveDown(0.2)
    doc.font('bold').fontSize(9.5).fillColor(NAVY).text(b.columns.join('   |   '))
    doc.moveDown(0.2)
    for (const row of b.rows) {
      doc.font('body').fontSize(10).fillColor(INK2).text(row.join('  —  '), { indent: 6, lineGap: 2 })
      doc.moveDown(0.15)
    }
    doc.moveDown(0.35)
  }
}

let made = 0
for (const m of BD_MODULES) {
  const file = path.join(OUT_DIR, `${m.id}-reading-pack.pdf`)
  const doc = newDoc(file)

  // ── Page 1: cover ──
  doc.rect(0, 0, doc.page.width, 8).fill(COPPER)
  doc.moveDown(6)
  doc.font('bold').fontSize(9).fillColor(COPPER).text('MAGPPIE L&D · BUSINESS DEVELOPMENT EXECUTIVE', { characterSpacing: 1.8 })
  doc.moveDown(1)
  doc.font('bold').fontSize(26).fillColor(NAVY).text(`Module ${m.number}`)
  doc.font('bold').fontSize(20).fillColor(NAVY).text(m.title)
  doc.moveDown(0.8)
  doc.font('body').fontSize(12).fillColor(INK2).text(m.summary, { lineGap: 3 })
  doc.moveDown(1.2)
  doc.font('body').fontSize(10).fillColor(INK3).text(`Competency: ${m.competency}`)
  doc.text(`Reading pack contents: module reading · verbatim source material · narration script`)
  doc.moveDown(6)
  doc.font('body').fontSize(9).fillColor(INK3)
    .text(`Source: ${BD_SOURCE_DOC} (v${TRAINING_DOC_VERSION}). All content reproduced verbatim from the reviewed training material — nothing paraphrased or generated.`, { lineGap: 2 })

  // ── Part 2: module reading ──
  doc.addPage()
  partLabel(doc, `Part 1 · Module reading`)
  doc.font('bold').fontSize(16).fillColor(NAVY).text(m.title)
  doc.moveDown(0.6)
  for (const b of m.blocks) renderBlock(doc, b)

  // ── Part 3: verbatim source material ──
  const chunks = TRAINING_CHUNKS.filter(CHUNK_FILTER[m.id] ?? (() => false))
  if (chunks.length > 0) {
    doc.addPage()
    partLabel(doc, `Part 2 · Verbatim source material (${chunks.length} sections)`)
    para(doc, 'The sections of the master training document this module is built from — word for word, for reference and revision.')
    doc.moveDown(0.3)
    for (const c of chunks) {
      heading(doc, `§${c.sectionNumber} — ${c.sectionTitle}`)
      if (c.isVerbatimScript) {
        doc.font('bold').fontSize(8.5).fillColor(COPPER).text('VERBATIM SCRIPT — use this exact wording', { characterSpacing: 1 })
        doc.moveDown(0.2)
      }
      para(doc, c.content)
    }
  }

  // ── Part 4: narration script ──
  const script = narration.get(m.id)
  if (script) {
    doc.addPage()
    partLabel(doc, `Part 3 · Video narration script (English)`)
    para(doc, 'The narration for this module’s video — readable now, listenable once the video is produced.')
    doc.moveDown(0.3)
    for (const p of script.split('\n\n')) {
      doc.font('body').fontSize(11).fillColor(NAVY).text(p.trim(), { lineGap: 3.5 })
      doc.moveDown(0.6)
    }
  }

  doc.end()
  made++
  console.log(`✓ ${path.basename(file)}`)
}
console.log(`\n${made} reading packs written to public/resources/bd/`)
