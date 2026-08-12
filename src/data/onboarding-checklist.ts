/**
 * MAGPPIE — New Hire Onboarding Checklist.
 *
 * Transcribed verbatim from "MAGPPIE Onboarding Checklist.xlsx" (16 tasks, 5
 * phases). Task wording and ownership are the HR team's own — do not reword
 * them here to fit a layout. If the spreadsheet changes, re-transcribe it
 * rather than editing tasks ad hoc.
 *
 * The shape of this process is the point: it is heavily front-loaded. Ten of
 * the sixteen tasks land on Day 1, and the other four phases carry one or two
 * each. The page steps through one phase at a time, so that imbalance shows up
 * as Day 1 simply having a longer list — the short phases are NOT padded with
 * invented tasks to match it.
 *
 * NOTE ON COUNTS: the build brief described Pre-Joining and Day 30 as one task
 * each, which would total 14. The spreadsheet has two in each, which is what
 * makes 16. The file wins; these are its numbers.
 */

export type TaskOwner = 'HR' | 'HR / Manager'

export interface ChecklistTask {
  /** Row number in the spreadsheet — the HR team's own reference. */
  n: number
  id: string
  title: string
  owner: TaskOwner
}

export interface ChecklistPhase {
  id: string
  /** Phase heading as written in the file. */
  title: string
  /** When it happens. */
  when: string
  /**
   * Soft Greens palette — dusty blue-grey, pale/medium/deeper sage, plus a
   * warm sage and a soft slate-blue mixed from inside the same family for the
   * two heavier phases. All low-saturation and clearly related; that
   * relatedness is what reads as coordinated rather than as a rainbow. Cream
   * is the neutral base (card surfaces) and is deliberately NOT an accent.
   */
  color: string
  /**
   * Whether text on this colour should be light or dark. The palette spans
   * pale sage to deeper sage, so a single choice would fail at one end —
   * stated per phase rather than guessed from the hex at render time.
   */
  ink: 'light' | 'dark'
  tasks: ChecklistTask[]
  /**
   * Set only where the checklist genuinely has no tasks. Used for the gap
   * between Day 7 and Day 30 so the jump reads as expected rather than
   * broken — no invented checklist items to fill it.
   */
  note?: string
}

export const ONBOARDING_CHECKLIST: ChecklistPhase[] = [
  {
    id: 'pre-joining',
    title: 'Pre-Joining',
    when: 'Day −1',
    color: '#8CA3B2',
    ink: 'light',
    tasks: [
      {
        n: 1,
        id: 'ob-t1',
        title:
          'HR calls to confirm reporting time, discuss commute, and offer help with directions/parking',
        owner: 'HR',
      },
      {
        n: 2,
        id: 'ob-t2',
        title:
          'Send WhatsApp/email note with joining essentials — documents to carry, dress code, reception contact',
        owner: 'HR',
      },
    ],
  },
  {
    id: 'day-1',
    title: 'Day 1',
    when: 'First day',
    color: '#A9B183',
    ink: 'dark',
    tasks: [
      { n: 3, id: 'ob-t3', title: 'Welcome kit', owner: 'HR' },
      { n: 4, id: 'ob-t4', title: 'Hand over company-allotted assets & Stationery', owner: 'HR' },
      { n: 5, id: 'ob-t5', title: 'Share credentials — email ID, Keka login', owner: 'HR' },
      { n: 6, id: 'ob-t6', title: 'Brief on HR policy', owner: 'HR' },
      {
        n: 7,
        id: 'ob-t7',
        title:
          'Send welcome email with HR policy along with MAGPPIE study materials attached',
        owner: 'HR',
      },
      {
        n: 8,
        id: 'ob-t8',
        title:
          'Joining formalities - Joining form, NDA, LOA, self-attestation of documents etc.',
        owner: 'HR',
      },
      { n: 9, id: 'ob-t9', title: 'Introduce to leaders and relevant departments', owner: 'HR' },
      {
        n: 10,
        id: 'ob-t10',
        title:
          'Add to “MAGPPIE Champions” and other company WhatsApp group with an intro post',
        owner: 'HR',
      },
      {
        n: 11,
        id: 'ob-t11',
        title: 'Send personalized welcome message (once company phone/number issued)',
        owner: 'HR',
      },
      {
        n: 12,
        id: 'ob-t12',
        title: 'Send message with POC contact details relevant to their role',
        owner: 'HR',
      },
    ],
  },
  {
    id: 'week-1',
    title: 'Week 1',
    when: 'First week',
    color: '#B7C7AE',
    ink: 'dark',
    tasks: [
      {
        n: 13,
        id: 'ob-t13',
        title: "Assign a buddy from the new hire's own team",
        owner: 'HR / Manager',
      },
    ],
  },
  {
    id: 'day-7',
    title: 'Day 7',
    when: 'One week in',
    color: '#8CA687',
    ink: 'light',
    tasks: [
      {
        n: 14,
        id: 'ob-t14',
        title:
          'Hold informal feedback conversation — overall experience, positives & negatives',
        owner: 'HR',
      },
    ],
  },
  {
    // The real checklist has no HR checkpoint for ~23 days here. Rather than
    // invent tasks or leave an unexplained jump, the gap is named.
    id: 'weeks-2-4',
    title: 'Weeks 2–4',
    when: 'Settling in',
    color: '#6E8A6B',
    ink: 'light',
    tasks: [],
    note: 'No formal HR checkpoints during this window — that’s normal. Focus on your role, and reach out to your buddy or manager anytime.',
  },
  {
    id: 'day-30',
    title: 'Day 30',
    when: 'One month in',
    color: '#6F8899',
    ink: 'light',
    tasks: [
      { n: 15, id: 'ob-t15', title: 'Conduct formal HR review meeting with new hire', owner: 'HR' },
      {
        n: 16,
        id: 'ob-t16',
        title: 'Collect manager feedback — conduct, fitment, work quality, values',
        owner: 'HR / Manager',
      },
    ],
  },
]

/**
 * Header fields the spreadsheet captures per new hire. Shown as a labelled
 * record on the page; not yet bound to the HRMS import, so they render as
 * empty fields rather than invented names.
 */
export const CHECKLIST_HEADER_FIELDS = [
  'Name',
  'Designation / Role',
  'Department',
  'Date of Joining',
  'Reporting Manager',
  'Buddy Assigned',
] as const

/**
 * The walkthrough film. Rendered by scripts/gen-onboarding-video.mjs from
 * remotion/onboarding-spec.mjs, using the roadmap above as its visual spine —
 * no presenter, no avatar, stock neural narration scripted from these exact
 * tasks. Reproducible rather than vendored: if the file is missing the page
 * shows the regeneration command instead of a dead player.
 */
export const ONBOARDING_VIDEO = {
  src: '/assets/onboarding/onboarding.mp4',
  subtitles: '/assets/onboarding/onboarding.vtt',
  title: 'Walk me through it',
  blurb:
    'A two-minute walkthrough of the same roadmap — what happens before you arrive, on Day 1, and at each review point.',
}

export const ALL_CHECKLIST_TASKS: ChecklistTask[] = ONBOARDING_CHECKLIST.flatMap((p) => p.tasks)

export const TOTAL_CHECKLIST_TASKS = ALL_CHECKLIST_TASKS.length // 16
