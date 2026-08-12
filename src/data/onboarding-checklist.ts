/**
 * MAGPPIE — New Hire Onboarding Checklist.
 *
 * Transcribed verbatim from "MAGPPIE Onboarding Checklist.xlsx" (16 tasks, 5
 * phases). Task wording and ownership are the HR team's own — do not reword
 * them here to fit a layout. If the spreadsheet changes, re-transcribe it
 * rather than editing tasks ad hoc.
 *
 * The shape of this process is the point: it is heavily front-loaded. Ten of
 * the sixteen tasks land on Day 1, and three phases carry one or two each. Any
 * view of this data should let Day 1 read as visibly heavier rather than
 * flattening all five phases into equal blocks — that evenness would be a lie
 * about the process.
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
  /** When it happens, for the roadmap spine. */
  when: string
  /** Distinct hue per phase. */
  color: string
  tasks: ChecklistTask[]
}

export const ONBOARDING_CHECKLIST: ChecklistPhase[] = [
  {
    id: 'pre-joining',
    title: 'Pre-Joining',
    when: 'Day −1',
    color: '#7B5EA7',
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
    color: '#C2603F',
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
    color: '#1F8A75',
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
    color: '#3E6FA8',
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
    id: 'day-30',
    title: 'Day 30',
    when: 'One month in',
    color: '#B08428',
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
