/**
 * Seeds the Business Development academy modules + 30-question quiz from the
 * reviewed source of truth (src/data/bd-academy.ts) into Supabase
 * (academy_modules + assessment_items, per migration 0018).
 *
 * Idempotent: upserts modules by (academy_slug, module_key) and questions by
 * a deterministic key. The 30 questions are human-reviewed and go in as
 * status='published', source='human' — they bypass the AI review queue.
 * Assigns everything to academy_slug = 'business-development'.
 *
 * Requires a real Supabase project (NEXT_PUBLIC_SUPABASE_URL +
 * SUPABASE_SERVICE_ROLE_KEY). Run: npx tsx scripts/seed-bd-academy.ts
 */
import { createClient } from '@supabase/supabase-js'
import {
  BD_ACADEMY_ID,
  BD_MODULES,
  BD_QUIZ,
  BD_PASS_THRESHOLD,
} from '../src/data/bd-academy'

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.')
  }
  const supabase = createClient(url, key)

  // 1) Modules
  const moduleRows = BD_MODULES.map((m) => ({
    academy_slug: BD_ACADEMY_ID,
    module_key: m.id,
    number: m.number,
    title: m.title,
    competency_tag: m.competency,
    summary: m.summary,
    body: m.blocks,
    status: 'published',
    is_seed: true,
    pass_threshold: BD_PASS_THRESHOLD,
  }))
  const { error: mErr } = await supabase
    .from('academy_modules')
    .upsert(moduleRows, { onConflict: 'academy_slug,module_key' })
  if (mErr) throw mErr
  console.log(`Upserted ${moduleRows.length} BD modules.`)

  // 2) Quiz questions — published human content, no review queue.
  const questionRows = BD_QUIZ.map((q) => ({
    // Deterministic id so re-runs update in place rather than duplicating.
    // (assessment_items.id is a uuid default; we match on module_ref+question
    // via delete-then-insert to stay idempotent without a natural unique key.)
    module_ref: q.moduleId,
    competency_tag: q.competency,
    item_type: 'mcq',
    status: 'published',
    source: 'human',
    question: q.question,
    body: { options: q.options },
    correct: { index: q.correctIndex },
    is_seed: true,
  }))

  // Idempotent replace of this batch.
  const { error: delErr } = await supabase
    .from('assessment_items')
    .delete()
    .eq('source', 'human')
    .eq('is_seed', true)
    .like('module_ref', 'bd-m%')
  if (delErr) throw delErr

  const { error: qErr } = await supabase.from('assessment_items').insert(questionRows)
  if (qErr) throw qErr
  console.log(`Inserted ${questionRows.length} BD quiz questions (published, human).`)

  console.log('Done — BD academy content assigned to academy_slug=business-development.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
