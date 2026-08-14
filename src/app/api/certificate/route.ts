import { NextResponse } from 'next/server'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import PDFDocument from 'pdfkit'

/**
 * Certificate PDF for a passed module.
 *
 * Layout follows the supplied reference — header banner, name field, award
 * seal, signature line — but the palette is Magppie's own gold/cream, not the
 * reference's navy-and-gold. The structure is borrowed; the brand is not.
 *
 * THE SCORE IS THE CERTIFIED SCORE. The caller passes the locked
 * first-passing-attempt figure. This route does not recompute anything and
 * does not accept a "best" score — a certificate that changed when someone
 * retook the quiz would defeat the entire rule it exists to express.
 *
 * SIGNATURE IS A HARD DEPENDENCY, NOT A PLACEHOLDER TO PAINT OVER.
 * The founder's real signature must exist at public/signature-vinod-jain.png.
 * It does not exist in this repo. Rather than draw a plausible-looking
 * squiggle — which would be a forged signature on a document the company
 * issues — this route refuses to render a signed certificate and returns 409
 * with the exact missing path. A fabricated signature is not a stand-in; it is
 * a fake credential.
 *
 * `?draft=1` renders the certificate with the signature block explicitly
 * marked UNSIGNED, for layout review only.
 */

const SIGNATURE_PATH = join(process.cwd(), 'public', 'signature-vinod-jain.png')
const LOGO_PATH = join(process.cwd(), 'public', 'magppie-logo.png')

const GOLD_DEEP = '#7E6318'
const GOLD = '#B08D3F'
const CREAM = '#FCFAF7'
const INK = '#2A2320'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const learner = url.searchParams.get('name')?.trim()
  const module = url.searchParams.get('module')?.trim()
  const score = url.searchParams.get('score')
  const total = url.searchParams.get('total')
  const issuedOn = url.searchParams.get('issuedOn')?.trim()
  const draft = url.searchParams.get('draft') === '1'

  if (!learner || !module || !score || !total) {
    return NextResponse.json(
      { error: 'name, module, score and total are all required' },
      { status: 400 },
    )
  }

  const hasSignature = existsSync(SIGNATURE_PATH)
  if (!hasSignature && !draft) {
    return NextResponse.json(
      {
        error: 'Founder signature file not provided',
        detail:
          "The certificate names Vinod Jain as signing authority, so it cannot be issued without his real signature. Add the scanned or digital signature to public/signature-vinod-jain.png. This route will not generate a substitute — a drawn signature on an issued credential is a forgery, not a placeholder. Use ?draft=1 to review the layout unsigned.",
        expectedPath: 'public/signature-vinod-jain.png',
      },
      { status: 409 },
    )
  }

  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 })
  const chunks: Buffer[] = []
  doc.on('data', (c: Buffer) => chunks.push(c))
  const done = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))))

  const W = doc.page.width
  const H = doc.page.height

  doc.rect(0, 0, W, H).fill(CREAM)
  // Double rule, the reference's framing device in Magppie's gold.
  doc.rect(24, 24, W - 48, H - 48).lineWidth(2.5).stroke(GOLD_DEEP)
  doc.rect(33, 33, W - 66, H - 66).lineWidth(0.75).stroke(GOLD)

  // Header banner
  doc.rect(24, 24, W - 48, 84).fill(GOLD_DEEP)
  if (existsSync(LOGO_PATH)) {
    try {
      doc.image(LOGO_PATH, W / 2 - 52, 44, { fit: [104, 44], align: 'center' })
    } catch {
      /* a logo that fails to decode must not take the certificate down */
    }
  }

  doc
    .fillColor(INK)
    .font('Helvetica')
    .fontSize(11)
    .text('CERTIFICATE OF COMPLETION', 0, 138, { align: 'center', characterSpacing: 3.4 })

  doc
    .fillColor(INK)
    .font('Helvetica')
    .fontSize(12)
    .text('This is to certify that', 0, 178, { align: 'center' })

  doc.fillColor(INK).font('Helvetica-Bold').fontSize(34).text(learner, 0, 202, { align: 'center' })
  // Name rule
  doc
    .moveTo(W / 2 - 190, 248)
    .lineTo(W / 2 + 190, 248)
    .lineWidth(0.75)
    .stroke(GOLD)

  doc
    .fillColor(INK)
    .font('Helvetica')
    .fontSize(12)
    .text('has successfully completed', 0, 264, { align: 'center' })

  doc.fillColor(GOLD_DEEP).font('Helvetica-Bold').fontSize(20).text(module, 0, 288, { align: 'center' })

  const pct = Math.round((Number(score) / Math.max(1, Number(total))) * 100)
  doc
    .fillColor(INK)
    .font('Helvetica')
    .fontSize(12)
    .text(`Certified score: ${score} of ${total}  (${pct}%)`, 0, 318, { align: 'center' })
  doc
    .fillColor(INK)
    .fontSize(8.5)
    .fillOpacity(0.68)
    .text(
      'Awarded on the first attempt to meet the passing threshold. Later retakes do not alter this result.',
      0,
      336,
      { align: 'center' },
    )
    .fillOpacity(1)

  // Seal
  const sealX = W / 2
  const sealY = 396
  doc.circle(sealX, sealY, 34).lineWidth(2).fillAndStroke(GOLD_DEEP, GOLD)
  doc
    .fillColor(CREAM)
    .font('Helvetica-Bold')
    .fontSize(8)
    .text('MAGPPIE', sealX - 34, sealY - 10, { width: 68, align: 'center' })
    .fontSize(6.5)
    .text('WELLNESS', sealX - 34, sealY + 1, { width: 68, align: 'center' })

  // Signature block
  const sigY = H - 118
  const sigX = W / 2 - 90
  if (hasSignature) {
    try {
      doc.image(readFileSync(SIGNATURE_PATH), sigX + 10, sigY - 42, { fit: [160, 40] })
    } catch {
      /* fall through to the rule alone rather than failing the render */
    }
  } else {
    doc
      .fillColor('#B4453C')
      .font('Helvetica-Bold')
      .fontSize(8)
      .text('UNSIGNED DRAFT — no signature file on record', sigX - 40, sigY - 26, {
        width: 260,
        align: 'center',
      })
  }

  doc.moveTo(sigX, sigY).lineTo(sigX + 180, sigY).lineWidth(0.75).stroke(GOLD)
  doc
    .fillColor(INK)
    .font('Helvetica-Bold')
    .fontSize(11)
    .text('Vinod Jain', sigX, sigY + 8, { width: 180, align: 'center' })
  doc
    .fillColor(INK)
    .font('Helvetica')
    .fontSize(9)
    .fillOpacity(0.7)
    .text('Founder | Chief Mentor', sigX, sigY + 23, { width: 180, align: 'center' })
    .fillOpacity(1)

  if (issuedOn) {
    doc
      .fillColor(INK)
      .fontSize(8.5)
      .fillOpacity(0.6)
      .text(`Issued ${issuedOn}`, 0, H - 52, { align: 'center' })
      .fillOpacity(1)
  }

  doc.end()
  const pdf = await done

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="magppie-certificate-${module
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')}.pdf"`,
    },
  })
}
