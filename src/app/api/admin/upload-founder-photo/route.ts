import { NextResponse } from 'next/server'
import { writeFile, access } from 'fs/promises'
import path from 'path'

export const runtime = 'nodejs'

/**
 * POST /api/admin/upload-founder-photo — accepts one image (multipart field
 * "photo") and writes it to public/founder-vinod-jain.jpg for the Vision
 * page. Always writes to that fixed filename — the client never controls the
 * path. Dev-oriented utility: in a production deployment, files written to
 * public/ after build aren't served, so this would move to Supabase Storage.
 */

const TARGET_NAME = 'founder-vinod-jain.jpg'
const MAX_BYTES = 10 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']

/**
 * `next dev <dir>` can leave process.cwd() at the launcher folder (E:\L&D),
 * not the app root — resolve the real public/ dir by probing for a file we
 * know lives there.
 */
async function resolvePublicDir(): Promise<string> {
  const candidates = [
    path.join(process.cwd(), 'public'),
    path.join(process.cwd(), 'L&D', 'ld-portal-next', 'public'),
  ]
  for (const dir of candidates) {
    try {
      await access(path.join(dir, 'manifest.webmanifest'))
      return dir
    } catch {
      /* try next */
    }
  }
  throw new Error('Could not locate the app public/ directory')
}

export async function POST(request: Request) {
  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 })
  }

  const file = form.get('photo')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing "photo" file field' }, { status: 400 })
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: `Unsupported type ${file.type} — use JPEG, PNG or WebP` },
      { status: 415 },
    )
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 413 })
  }

  try {
    const publicDir = await resolvePublicDir()
    const bytes = Buffer.from(await file.arrayBuffer())
    await writeFile(path.join(publicDir, TARGET_NAME), bytes)
    return NextResponse.json({ ok: true, path: `/${TARGET_NAME}`, bytes: bytes.length })
  } catch (err) {
    console.error('founder photo upload failed:', err)
    return NextResponse.json({ error: 'Could not save the file' }, { status: 500 })
  }
}
