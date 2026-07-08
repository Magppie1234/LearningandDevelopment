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
 * Modules without an entry render the "coming soon" state. As real files are
 * dropped in, add a variant here (or wire this to admin/content once that
 * CMS reaches BD academy).
 */
export const BD_VIDEO_CONFIG: ModuleVideoConfig[] = [
  {
    // Module 1 — "The Magppie Story" brand film (Section 1 script, narrated,
    // cinematic monochrome). Rendered locally via Remotion + Edge neural TTS.
    moduleId: 'bd-m1',
    variants: [
      {
        languageCode: 'en',
        languageLabel: 'English',
        videoUrl: '/assets/bd-academy/module-1/en.mp4',
        subtitleUrl: '/assets/bd-academy/module-1/en.vtt',
      },
    ],
  },
  {
    // Module 2 — "Inside SilverStone" (bd-m2 content + training doc 1.3/1.4
    // scripts). Same film system and narrator as Module 1.
    moduleId: 'bd-m2',
    variants: [
      {
        languageCode: 'en',
        languageLabel: 'English',
        videoUrl: '/assets/bd-academy/module-2/en.mp4',
        subtitleUrl: '/assets/bd-academy/module-2/en.vtt',
      },
    ],
  },
  // Modules 3–9 — same film system and narrator as Modules 1–2. Each is
  // narrated from its reading-pack Part 3 script, with the module's key
  // visuals (pillar rail, comparison tables, pricing charts, payment split,
  // consultant/customer dialogue scenes) rendered on screen.
  // Extend this list as each module's film lands in public/assets/bd-academy.
  ...[3, 4, 5, 6, 7, 8, 9].map((n) => ({
    moduleId: `bd-m${n}`,
    variants: [
      {
        languageCode: 'en',
        languageLabel: 'English',
        videoUrl: `/assets/bd-academy/module-${n}/en.mp4`,
        subtitleUrl: `/assets/bd-academy/module-${n}/en.vtt`,
      },
    ],
  })),
  {
    // Module 10 — "Know When to Hand Off" (the FAQ/escalation module).
    // Narrated from the Module 10 reading pack Part 3 script (master doc
    // §7/§9/§11), same film system and narrator as Modules 1–2, with the
    // escalation trigger grid, store map + status chart, and 5-second
    // pitch rendered as on-screen visuals.
    moduleId: 'bd-m10',
    variants: [
      {
        languageCode: 'en',
        languageLabel: 'English',
        videoUrl: '/assets/bd-academy/module-10/en.mp4',
        subtitleUrl: '/assets/bd-academy/module-10/en.vtt',
      },
    ],
  },
]

export function videoConfigForModule(moduleId: string): ModuleVideoConfig | undefined {
  return BD_VIDEO_CONFIG.find((m) => m.moduleId === moduleId)
}

export const DEFAULT_LANGUAGE_CODE = 'en'
