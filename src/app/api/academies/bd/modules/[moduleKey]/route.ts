import { NextResponse } from 'next/server'
import { bdDb, bdConfigured, notConfigured, normalizeModuleKey } from '@/lib/bd-api'

export const runtime = 'nodejs'

/**
 * GET /api/academies/bd/modules/<moduleKey>
 * Full module detail (content, source section, video records). Accepts either
 * `bd-m5` or the short `m5`.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ moduleKey: string }> },
) {
  if (!bdConfigured) return NextResponse.json(notConfigured(), { status: 503 })
  const { moduleKey } = await params
  const key = normalizeModuleKey(moduleKey)

  const { data: module, error: mErr } = await bdDb
    .from('bd_modules')
    .select('*')
    .eq('module_key', key)
    .maybeSingle()
  if (mErr) return NextResponse.json({ error: mErr.message }, { status: 500 })
  if (!module) return NextResponse.json({ error: 'module not found' }, { status: 404 })

  const { data: videos, error: vErr } = await bdDb
    .from('bd_module_videos')
    .select('language_code, language_label, video_url, subtitle_url, status')
    .eq('module_key', key)
  if (vErr) return NextResponse.json({ error: vErr.message }, { status: 500 })

  return NextResponse.json({ ...module, videos: videos ?? [] })
}
