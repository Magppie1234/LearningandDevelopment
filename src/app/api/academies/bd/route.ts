import { NextResponse } from 'next/server'
import { bdDb, bdConfigured, notConfigured, BD_ACADEMY_SLUG } from '@/lib/bd-api'

export const runtime = 'nodejs'

/** GET /api/academies/bd — academy summary + module count. */
export async function GET() {
  if (!bdConfigured) return NextResponse.json(notConfigured(), { status: 503 })

  const { count, error } = await bdDb
    .from('bd_modules')
    .select('*', { count: 'exact', head: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    id: BD_ACADEMY_SLUG,
    name: 'Business Development',
    description:
      'Sales knowledge, pitch flow, objection handling, and product mastery for the BD team, sourced from the Magppie AI Bot Master Training Document.',
    module_count: count ?? 0,
  })
}
