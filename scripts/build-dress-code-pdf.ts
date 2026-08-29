/**
 * Renders the Dress Code Policy to a print-ready PDF.
 *
 * Covers every block kind in dress-code-policy.ts — intro, pull quote, points,
 * columns, the Do/Don't pairs, the compliance stages, highlight and footnote.
 * If a new block kind is added there, add it here too or it silently vanishes
 * from the download while still showing on the page.
 *
 * The source of truth is src/data/dress-code-policy.ts — the same module the
 * Onboarding page renders — so the download can never drift from what the
 * reader sees on screen. Regenerate with:
 *
 *   npx tsx scripts/build-dress-code-pdf.ts
 *
 * Why this exists at all: PowerPoint's `save as PDF` AppleScript verb is
 * broken in the installed build (-50 parameter error on every documented
 * spelling) and there is no LibreOffice on the machine, so the deck cannot be
 * converted slide-for-slide here. This re-typesets the deck's verbatim text
 * for A4 instead. The wording is untouched; only the layout is ours.
 */
import { chromium } from 'playwright'
import { writeFileSync } from 'node:fs'
import { DRESS_CODE_SECTIONS, DRESS_CODE_SELF_CHECK } from '../src/data/dress-code-policy'

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const section = (s: (typeof DRESS_CODE_SECTIONS)[number], i: number) => `
<section class="sec">
  <header>
    <span class="num">${String(i + 1).padStart(2, '0')}</span>
    <div>
      <p class="eyebrow">${esc(s.eyebrow)}</p>
      <h2>${esc(s.title)}</h2>
    </div>
  </header>
  ${s.intro ? `<p class="intro">${esc(s.intro)}</p>` : ''}
  ${s.pullQuote ? `<blockquote>${esc(s.pullQuote)}</blockquote>` : ''}
  ${
    s.points?.length
      ? `<ul class="points">${s.points
          .map(
            (p) =>
              `<li>${p.label ? `<strong>${esc(p.label)}</strong> ` : ''}${esc(p.text)}</li>`,
          )
          .join('')}</ul>`
      : ''
  }
  ${
    s.columns?.length
      ? `<div class="cols">${s.columns
          .map(
            (c) =>
              `<div class="col"><h3>${esc(c.heading)}</h3>${
                c.note ? `<p class="note">${esc(c.note)}</p>` : ''
              }<ul>${c.items.map((it) => `<li>${esc(it)}</li>`).join('')}</ul></div>`,
          )
          .join('')}</div>`
      : ''
  }
  ${
    s.pairs?.length
      ? `<table class="dd"><thead><tr><th class="do">Do</th><th class="dont">Don&rsquo;t</th></tr></thead><tbody>${s.pairs
          .map(
            (p) =>
              `<tr><td class="do">${esc(p.doItem)}</td><td class="dont">${esc(p.dontItem)}</td></tr>`,
          )
          .join('')}</tbody></table>`
      : ''
  }
  ${
    s.stages?.length
      ? `<ol class="stages">${s.stages
          .map(
            (st, n) =>
              `<li><strong>Stage ${n + 1} &mdash; ${esc(st.label)}.</strong> ${esc(st.text)}</li>`,
          )
          .join('')}</ol>`
      : ''
  }
  ${s.highlight ? `<p class="highlight">${esc(s.highlight)}</p>` : ''}
  ${s.footnote ? `<p class="foot">${esc(s.footnote)}</p>` : ''}
</section>`

const html = `<!doctype html><html><head><meta charset="utf-8">
<title>MAGPPIE Dress Code Policy</title>
<style>
  @page { size: A4; margin: 18mm 16mm 20mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    color: #2E2822; font-size: 10.5pt; line-height: 1.55;
  }
  .cover { page-break-after: always; padding-top: 55mm; }
  .cover .brand { font-size: 9pt; letter-spacing: .22em; text-transform: uppercase; color: #8a7f72; }
  .cover h1 { font-size: 30pt; line-height: 1.15; margin: 10mm 0 6mm; font-weight: 600; }
  .cover .sub { font-size: 12pt; color: #5c554c; max-width: 120mm; }
  .cover .rule { width: 26mm; height: 3px; background: #b8703f; margin: 8mm 0; }
  .cover .meta { margin-top: 22mm; font-size: 9pt; color: #8a7f72; }
  .sec { page-break-inside: avoid; margin: 0 0 11mm; }
  .sec header { display: flex; gap: 6mm; align-items: baseline;
    border-bottom: 1px solid #e2dace; padding-bottom: 3mm; margin-bottom: 4mm; }
  .num { font-size: 15pt; font-weight: 600; color: #b8703f; }
  .eyebrow { margin: 0 0 1mm; font-size: 8pt; letter-spacing: .16em;
    text-transform: uppercase; color: #8a7f72; }
  h2 { margin: 0; font-size: 14pt; font-weight: 600; }
  h3 { margin: 0 0 2mm; font-size: 10pt; font-weight: 600; color: #5c554c; }
  blockquote { margin: 0 0 4mm; padding-left: 5mm; border-left: 3px solid #b8703f;
    font-size: 11.5pt; font-style: italic; color: #4a443c; }
  .intro { margin: 0 0 4mm; }
  ul { margin: 0 0 4mm; padding-left: 5mm; }
  li { margin-bottom: 1.6mm; }
  .cols { display: flex; gap: 8mm; }
  .col { flex: 1; }
  .foot { margin: 3mm 0 0; padding: 3mm 4mm; background: #f7f2ea;
    border-radius: 2mm; font-size: 9.5pt; color: #5c554c; }
  .check { page-break-inside: avoid; margin-top: 6mm; padding: 6mm;
    border: 1px solid #e2dace; border-radius: 3mm; background: #faf6f0; }
  .check h2 { font-size: 12pt; margin-bottom: 3mm; }
  .check li { list-style: none; margin-bottom: 2.5mm; }
  .check li::before { content: "\\2610"; margin-right: 3mm; color: #b8703f; }
  .note { margin: 0 0 2mm; font-size: 9pt; font-style: italic; color: #6a6258; }
  .highlight { margin: 3mm 0 0; padding: 3mm 4mm; border-left: 3px solid #b8703f;
    background: #f7f2ea; font-weight: 600; font-size: 10pt; }
  table.dd { width: 100%; border-collapse: collapse; margin-bottom: 4mm; }
  table.dd th, table.dd td { border: 0.4pt solid #ddd4c6; padding: 2mm 3mm;
    text-align: left; vertical-align: top; font-size: 9.5pt; width: 50%; }
  table.dd th { font-size: 9pt; text-transform: uppercase; letter-spacing: .08em; }
  table.dd th.do, table.dd td.do { color: #2f5c40; }
  table.dd th.dont, table.dd td.dont { color: #8a2727; }
  /* No list marker: each item already names its own stage number. */
  ol.stages { margin: 4mm 0; padding-left: 0; list-style: none; }
  ol.stages li { margin-bottom: 3mm; }
  .check ul { padding-left: 0; margin-bottom: 0; }
</style></head><body>
<div class="cover">
  <p class="brand">MAGPPIE &middot; L&amp;D New Joiner Orientation Series</p>
  <h1>Dress Code Policy</h1>
  <div class="rule"></div>
  <p class="sub">How we present ourselves — an extension of the same elegance and comfort we promise every client.</p>
  <p class="meta">Official HR policy. Applies to every team member, every working day.</p>
</div>
${DRESS_CODE_SECTIONS.map(section).join('')}
<div class="check">
  <h2>Before you head out</h2>
  <ul>${DRESS_CODE_SELF_CHECK.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
</div>
</body></html>`

const out = 'public/policies/Dress_Code_Policy_MAGPPIE.pdf'

async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: 'load' })
  const pdf = await page.pdf({ format: 'A4', printBackground: true })
  // `--png <path>` renders the same markup at A4 width for eyeballing the
  // layout; headless Chromium cannot open a PDF, so this is how the output
  // gets visually checked.
  const pngAt = process.argv.indexOf('--png')
  if (pngAt !== -1 && process.argv[pngAt + 1]) {
    await page.setViewportSize({ width: 794, height: 1123 })
    await page.screenshot({ path: process.argv[pngAt + 1], fullPage: true })
  }
  await browser.close()
  writeFileSync(out, pdf)
  console.log(`wrote ${out} (${(pdf.length / 1024).toFixed(0)} KB)`)
}

main()
