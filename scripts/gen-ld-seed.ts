/**
 * Emits SQL that seeds the isolated `ld` schema from the approved source of
 * truth (src/data/bd-academy.ts). Content is passed through verbatim — this
 * script never rewrites or paraphrases module text or quiz questions.
 *
 * Run: npx tsx scripts/gen-ld-seed.ts > ../ld-seed.sql   (path is relative to cwd)
 */
import { BD_ACADEMY_ID, BD_MODULES, BD_QUIZ, BD_PASS_THRESHOLD } from '../src/data/bd-academy'

const TAG = '$ld$'
function dq(s: string): string {
  if (s.includes(TAG)) throw new Error('content contains the dollar-quote tag; pick another tag')
  return `${TAG}${s}${TAG}`
}
function jb(v: unknown): string {
  const s = JSON.stringify(v)
  if (s.includes(TAG)) throw new Error('json contains the dollar-quote tag; pick another tag')
  return `${TAG}${s}${TAG}::jsonb`
}

const out: string[] = []
out.push('begin;')

// Idempotent: clear the BD seed rows first, then re-insert.
out.push(`delete from ld.assessment_items where module_ref like 'bd-m%' and is_seed = true;`)
out.push(`delete from ld.academy_modules where academy_slug = ${dq(BD_ACADEMY_ID)} and is_seed = true;`)

for (const m of BD_MODULES) {
  out.push(
    `insert into ld.academy_modules (academy_slug, module_key, number, title, competency_tag, summary, body, status, is_seed, pass_threshold) values (` +
      `${dq(BD_ACADEMY_ID)}, ${dq(m.id)}, ${m.number}, ${dq(m.title)}, ${dq(m.competency)}, ${dq(m.summary)}, ${jb(m.blocks)}, 'published', true, ${BD_PASS_THRESHOLD});`,
  )
}

for (const q of BD_QUIZ) {
  out.push(
    `insert into ld.assessment_items (module_ref, competency_tag, item_type, status, source, question, options, correct_index, is_seed) values (` +
      `${dq(q.moduleId)}, ${dq(q.competency)}, 'mcq', 'published', 'human', ${dq(q.question)}, ${jb(q.options)}, ${q.correctIndex}, true);`,
  )
}

out.push('commit;')
process.stdout.write(out.join('\n') + '\n')
