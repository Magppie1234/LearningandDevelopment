/**
 * Generates one downloadable PDF "reading pack" per Sales module into
 * public/resources/sales/ — the real files behind the Sales Resources tab.
 * Mirrors scripts/gen-bd-resource-pdfs.ts.
 *
 * CONTENT RULE: nothing here is invented. Every page is assembled verbatim
 * from the two vetted sources:
 *   1. src/data/sales-academy.ts   — the reviewed module content (blocks),
 *      including the [CONFIRM PAYMENT SPLIT] / [CONFIRM YEAR] /
 *      [VERIFY: Red Dot] callouts, reproduced as-is
 *   2. src/data/sales-media.ts     — the approved video narration scripts
 *
 * Each pack: cover page → module reading → narration script (when the module
 * has one). Source-pending shells (3.9, 3.11) still get a pack — it honestly
 * carries their shell text and SOURCE NEEDED callouts.
 *
 * Run: node node_modules/tsx/dist/cli.mjs scripts/gen-sales-resource-pdfs.ts
 */
import fs from 'node:fs'
import path from 'node:path'
import PDFDocument from 'pdfkit'
import { SALES_MODULES } from '../src/data/sales-academy'
import type { ContentBlock } from '../src/data/bd-academy'
import { SALES_VIDEO_NARRATION } from '../src/data/sales-media'

const OUT_DIR = path.join(__dirname, '..', 'public', 'resources', 'sales')
fs.mkdirSync(OUT_DIR, { recursive: true })

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
for (const m of SALES_MODULES) {
  const file = path.join(OUT_DIR, `${m.id}-reading-pack.pdf`)
  const doc = newDoc(file)

  // ── Page 1: cover ──
  doc.rect(0, 0, doc.page.width, 8).fill(COPPER)
  doc.moveDown(6)
  doc.font('bold').fontSize(9).fillColor(COPPER).text('MAGPPIE L&D · SALES ACADEMY', { characterSpacing: 1.8 })
  doc.moveDown(1)
  doc.font('bold').fontSize(26).fillColor(NAVY).text(`Module ${m.number}`)
  doc.font('bold').fontSize(20).fillColor(NAVY).text(m.title)
  doc.moveDown(0.8)
  doc.font('body').fontSize(12).fillColor(INK2).text(m.summary, { lineGap: 3 })
  if (m.sourcePending) {
    doc.moveDown(0.8)
    doc.font('bold').fontSize(10).fillColor(COPPER)
      .text('SOURCE PENDING — this module is a structure-ready shell; its full content lands when the Notion source text is provided. Nothing in this pack is invented.')
  }
  doc.moveDown(1.2)
  doc.font('body').fontSize(10).fillColor(INK3).text(`Topics: ${m.topics.join(' · ')}`)
  doc.text('Reading pack contents: module reading · video narration script')
  doc.moveDown(6)
  doc.font('body').fontSize(9).fillColor(INK3)
    .text('Source: the AI Bot Master Training Document + the Sales Resources master index. All content reproduced verbatim from the vetted material — unresolved source conflicts ([CONFIRM PAYMENT SPLIT], [CONFIRM YEAR], [VERIFY: Red Dot]) are flagged, never silently resolved.', { lineGap: 2 })

  // ── Part 1: module reading ──
  doc.addPage()
  partLabel(doc, 'Part 1 · Module reading')
  doc.font('bold').fontSize(16).fillColor(NAVY).text(m.title)
  doc.moveDown(0.6)
  for (const b of m.blocks) renderBlock(doc, b)

  // ── Part 2: narration script ──
  const script = SALES_VIDEO_NARRATION[m.id]
  if (script) {
    doc.addPage()
    partLabel(doc, 'Part 2 · Video narration script (English)')
    para(doc, 'The narration for this module’s video — the same voiceover you hear on the module page.')
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
console.log(`\n${made} reading packs written to public/resources/sales/`)
