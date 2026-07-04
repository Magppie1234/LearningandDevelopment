/**
 * Section 6 of the BD backend port: ingest the full 62-question FAQ bank into
 * the scoped BD retrieval corpus (ld.content_chunks, source='faq'). The FAQ
 * Q&A is already transcribed verbatim in src/data/training-doc.ts (category
 * 'faq') — we reuse that rather than re-parsing the PDF. Emits SQL to stdout.
 *
 * Run: node --experimental-strip-types scripts/gen-ld-faq-chunks.mjs > faq.sql
 * (or via tsx). Node 24 strips TS types natively.
 */
import { TRAINING_CHUNKS } from '../src/data/training-doc.ts'

const TAG = '$ld$'
const dq = (s) => {
  if (String(s).includes(TAG)) throw new Error('content contains dollar tag')
  return TAG + String(s) + TAG
}

const faqs = TRAINING_CHUNKS.filter((c) => c.category === 'faq')
const out = []
out.push(`delete from ld.content_chunks where academy_slug='business-development' and source='faq';`)
for (const f of faqs) {
  const text = `[FAQ §${f.sectionNumber}] ${f.sectionTitle}\n${f.content}`
  out.push(
    `insert into ld.content_chunks (academy_slug, module_key, source, chunk_text) values (` +
      `'business-development', $ld$bd-faq$ld$, 'faq', ${dq(text)});`,
  )
}
console.log(out.join('\n'))
console.error(`faq_chunks=${faqs.length}`)
