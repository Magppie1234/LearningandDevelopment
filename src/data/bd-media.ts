/**
 * BD academy video config — infrastructure only. NO video files, narration
 * scripts, or renamed course titles are invented here; those come verbatim
 * from BD_Academy_Video_Scripts_and_Reading_Material.md once supplied.
 * Until then every module shows the "video coming soon" state, using the
 * already-approved module summary/content from bd-academy.ts as interim
 * readable text — never an empty or broken player.
 *
 * Data model supports N language variants per module from day one (§2):
 * each entry is { languageCode, videoUrl, subtitleUrl }. Only 'en' is wired
 * as the default fallback language; nothing assumes a fixed language list.
 */

export interface VideoVariant {
  languageCode: string // 'en', 'hi', …
  languageLabel: string // 'English', 'हिन्दी', …
  videoUrl: string
  subtitleUrl?: string
}

export interface ModuleVideoConfig {
  moduleId: string // matches BdModule.id
  variants: VideoVariant[]
}

/**
 * Expected local asset path convention (§2): /assets/bd-academy/module-{n}/{lang}.mp4
 * No entries exist yet for any module — every module currently renders the
 * "coming soon" state. As real files are dropped in, add a variant here
 * (or wire this to admin/content once that CMS reaches BD academy).
 */
export const BD_VIDEO_CONFIG: ModuleVideoConfig[] = []

export function videoConfigForModule(moduleId: string): ModuleVideoConfig | undefined {
  return BD_VIDEO_CONFIG.find((m) => m.moduleId === moduleId)
}

export const DEFAULT_LANGUAGE_CODE = 'en'
