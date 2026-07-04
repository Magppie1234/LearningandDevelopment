/**
 * Seeds the competency dictionary (src/data/competencies.ts — 91 competencies
 * across 13 academies) into the `skills` table extended by migration 0009.
 * Idempotent: upserts by unique slug. Requires a real Supabase project
 * (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local).
 *
 * Run: npx tsx scripts/seed-competencies.ts
 */
import { createClient } from '@supabase/supabase-js'
import { COMPETENCIES } from '../src/data/competencies'

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must point to a real project.',
    )
  }
  const supabase = createClient(url, key)

  const rows = COMPETENCIES.map((c) => ({
    slug: c.id,
    name: c.name,
    category: c.type, // legacy free-text column kept in sync with the enum
    academy: c.academy,
    department_slug: c.departmentSlug,
    competency_type: c.type,
    core_topics: c.coreTopics,
    outcome: c.outcome,
    is_seed: true,
  }))

  const { error } = await supabase.from('skills').upsert(rows, { onConflict: 'slug' })
  if (error) throw error
  console.log(`Upserted ${rows.length} competencies into skills.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
