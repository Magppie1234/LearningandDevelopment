/**
 * Day 1–3 onboarding content, the Keka reference videos, and the two
 * assessment stubs.
 *
 * PROVENANCE / GAPS — read before adding anything here:
 *
 *  • The five videos come from the Drive folder the brief pointed at
 *    (1oqRiCS…), owned by hrdelhi@magppie.com. Its real title is "HR Policy
 *    Briefing Videos", not a Keka folder, and its contents do not match the
 *    list in the brief. What is actually there is recorded below verbatim.
 *    Sharing is public and the /preview embed was confirmed to play without
 *    sign-in.
 *
 *  • The brief expected Keka videos for logging in, logging out and
 *    downloading payslips. None exist in the folder. They are listed as
 *    `pending` so the grid shows a tidy placeholder rather than a dead tile,
 *    and so dropping the real file in later is a one-line change.
 *
 *  • "Imp HR Policies .mov" is NOT a Keka how-to — it is an HR policy
 *    briefing, and at 840 MB it is by far the largest file. It is mapped to
 *    Day 1 (HR Policies & Code of Conduct), not into the Keka popup.
 *
 *  • NO assessment questions were provided. Both banks are deliberately empty
 *    with `questionsPending: true`. Do not invent questions to fill them.
 */

export interface OnboardingVideo {
  title: string
  /** Google Drive file id — embedded as /file/d/<id>/preview. */
  driveId?: string
  /** Self-hosted source, used in preference to a Drive embed when present. */
  src?: string
  /** True when the asset does not exist yet; the UI shows a placeholder. */
  pending?: boolean
  note?: string
}

export interface OnboardingDoc {
  title: string
  href?: string
  pending?: boolean
  note?: string
}

export interface OnboardingDay {
  id: 'day-1' | 'day-2' | 'day-3'
  day: string
  title: string
  blurb: string
  /**
   * Card colour, taken from the Onboarding Checklist's Soft Greens palette so
   * the two pages read as one family. Deliberately the palette's deeper,
   * fuller end rather than its pale end — these are three confident cards, not
   * a wash — but still the same low-saturation family, never a rainbow.
   * `ink` is stated per day rather than guessed from the hex at render time,
   * exactly as the checklist does it.
   */
  color: string
  ink: 'light' | 'dark'
  video: OnboardingVideo
  doc: OnboardingDoc
  /** Assessment id, or null for a day that ends in an action instead. */
  assessmentId: string | null
  /** Day 3 sends the person into their role academy rather than a quiz. */
  action?: { label: string; href: string }
}

export const ONBOARDING_DAYS: OnboardingDay[] = [
  {
    id: 'day-1',
    day: 'Day 1',
    color: '#6F8899', // soft slate-blue — the checklist's heavier-phase blue
    ink: 'light',
    title: 'Welcome & the essentials',
    blurb: 'Meet the company, then the policies and conduct standards everyone works to.',
    video: {
      title: 'Welcome to Magppie',
      pending: true,
      note: 'Welcome video not supplied yet.',
    },
    doc: {
      title: 'HR Policies & Code of Conduct',
      // The policy briefing recording from the HR Drive folder. The written
      // policy documents themselves have not been supplied.
      href: 'https://drive.google.com/file/d/1iz55NNTENP5Afo_H-X4quCNUmR4VH-4Y/preview',
      note: 'Policy briefing recording (840 MB). The written policy PDF has not been supplied.',
    },
    assessmentId: 'onb-hr-conduct',
  },
  {
    id: 'day-2',
    day: 'Day 2',
    color: '#6E8A6B', // deeper sage
    ink: 'light',
    title: 'Vision & culture',
    blurb: 'Where Magppie is going, and the standards behind how we get there.',
    video: {
      title: 'Our vision',
      pending: true,
      note: 'Vision video not available yet — drop the file in and remove `pending`.',
    },
    doc: {
      title: 'Vision document',
      pending: true,
      note: 'Vision document not supplied yet.',
    },
    assessmentId: 'onb-vision',
  },
  {
    id: 'day-3',
    day: 'Day 3',
    color: '#8CA687', // medium sage — too light for white, so dark ink here
    ink: 'dark',
    title: 'Your role & next steps',
    blurb: 'Meet your team, pick up the handover, and start your role academy.',
    video: {
      title: 'Your team and your role',
      pending: true,
      note: 'Team/role intro video not supplied yet.',
    },
    doc: {
      title: 'Role handover document',
      pending: true,
      note: 'Role handover document not supplied yet.',
    },
    assessmentId: null,
    action: { label: 'Go to my role academy', href: '/academies' },
  },
]

/* ── Keka reference videos ──────────────────────────────────────────────
   Titles and order exactly as they appear in the Drive folder. `pending`
   entries are the three the brief expected but the folder does not contain. */

export const KEKA_VIDEOS: OnboardingVideo[] = [
  { title: 'Attendance — Keka App', driveId: '1nIE5M6IC6Gt2UWik1EfMB_4gXSs_kRK0' },
  { title: 'Attendance regularization', driveId: '1jHQgnZSq4TVNwdkt3DoGiJiVeJnvJ35Z' },
  { title: 'Leave application', driveId: '1y2KmyrwOQAHy_JY_2e2RquVqlb8xwSIC' },
  { title: 'Monday Weekly-Off', driveId: '1eMCTFyiYsbPpznL0LAxUALJ2VnD6Be_G' },
  { title: 'Logging in', pending: true, note: 'Not in the HR Drive folder.' },
  { title: 'Logging out', pending: true, note: 'Not in the HR Drive folder.' },
  { title: 'Downloading payslips', pending: true, note: 'Not in the HR Drive folder.' },
]

/** Drive preview embed for a file id. */
export const drivePreview = (id: string) => `https://drive.google.com/file/d/${id}/preview`

/**
 * "Common Keka questions". The brief names password reset and missed-punch as
 * examples; no approved answer text was supplied for either, so each carries
 * the question with an explicit pending answer rather than an invented one.
 */
export interface KekaFaq {
  q: string
  a?: string
  pending?: boolean
}

export const KEKA_FAQS: KekaFaq[] = [
  { q: 'I have forgotten my Keka password — how do I reset it?', pending: true },
  { q: 'I missed a punch. How do I get it corrected?', pending: true },
  { q: 'How do I regularise my attendance?', a: 'Covered in the "Attendance regularization" video above.' },
  { q: 'How do I apply for leave?', a: 'Covered in the "Leave application" video above.' },
  { q: 'How does the Monday weekly-off work?', a: 'Covered in the "Monday Weekly-Off" video above.' },
]

/* ── Assessments ────────────────────────────────────────────────────────
   Same shape as the academy quiz banks so these plug into the existing
   scoring + certificate flow unchanged. Both are EMPTY pending the real
   questions — see the file header. */

export interface OnboardingQuizQuestion {
  id: string
  assessmentId: string
  question: string
  options: string[]
  correctIndex: number
}

export interface OnboardingAssessment {
  id: string
  title: string
  /** True while no questions have been supplied. */
  questionsPending: boolean
  questions: OnboardingQuizQuestion[]
}

/** Matches BD_PASS_THRESHOLD / SALES_PASS_THRESHOLD. */
export const ONBOARDING_PASS_THRESHOLD = 0.8

export const ONBOARDING_ASSESSMENTS: OnboardingAssessment[] = [
  {
    id: 'onb-hr-conduct',
    title: 'HR & Code of Conduct assessment',
    questionsPending: true,
    // ← Day 1 questions slot in here. If HR wants the Dress Code Policy tested
    // too, the obvious candidates are client-meeting attire and the two-stage
    // corrective process (verbal, then written) — but NO questions have been
    // supplied for either, so none are written here.
    questions: [],
  },
  {
    id: 'onb-vision',
    title: 'Vision assessment',
    questionsPending: true,
    questions: [], // ← Day 2 questions slot in here.
  },
]

export function onboardingAssessment(id: string | null): OnboardingAssessment | undefined {
  return id ? ONBOARDING_ASSESSMENTS.find((a) => a.id === id) : undefined
}
