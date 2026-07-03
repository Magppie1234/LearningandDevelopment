import { NextResponse } from 'next/server'
import { bdDb, bdConfigured, notConfigured, normalizeModuleKey } from '@/lib/bd-api'

export const runtime = 'nodejs'

/**
 * GET /api/academies/bd/modules/<moduleKey>/video?lang=en
 * Video record for a language. Returns is_playable=false plus the narration
 * script until a real video file is attached (status flips to generated/published).
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ moduleKey: string }> },
) {
  if (!bdConfigured) return NextResponse.json(notConfigured(), { status: 503 })
  const { moduleKey } = await params
  const key = normalizeModuleKey(moduleKey)
  const lang = new URL(req.url).searchParams.get('lang') ?? 'en'

  const { data, error } = await bdDb
    .from('bd_module_videos')
    .select('*')
    .eq('module_key', key)
    .eq('language_code', lang)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) {
    return NextResponse.json(
      { error: `no video record for module ${key} in language ${lang}` },
      { status: 404 },
    )
  }

  const is_playable = ['generated', 'published'].includes(data.status) && Boolean(data.video_url)
  return NextResponse.json({ ...data, is_playable })
}
