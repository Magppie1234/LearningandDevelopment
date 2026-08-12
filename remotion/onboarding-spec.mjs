/**
 * Onboarding walkthrough video — scene spec + narration.
 *
 * SOURCING RULE. Every task named in the narration is transcribed from
 * "MAGPPIE Onboarding Checklist.xlsx" (16 tasks, 5 phases) via
 * src/data/onboarding-checklist.ts. Nothing is invented, softened or added:
 * where the narration says "NDA, LOA, self-attestation of documents", those
 * are the file's own words. Connective phrasing is plain English, not new
 * facts.
 *
 * VISUAL SPINE. Every scene is the roadmap itself (RoadmapScene in
 * scenes.tsx), the same shape as the /onboarding page — an overview, then one
 * focused scene per phase, then the overview again. The film walks the viewer
 * along the roadmap they will actually use rather than showing them unrelated
 * graphics.
 *
 * NO PRESENTER. By instruction there is no AI assistant, avatar or character
 * on screen — the roadmap is the only thing shown, under a stock neural voice.
 */

const PHASES = [
  { title: 'Pre-Joining', when: 'Day −1', color: '#7B5EA7', count: '2 tasks' },
  { title: 'Day 1', when: 'First day', color: '#C2603F', count: '10 tasks' },
  { title: 'Week 1', when: 'First week', color: '#1F8A75', count: '1 task' },
  { title: 'Day 7', when: 'One week in', color: '#3E6FA8', count: '1 task' },
  { title: 'Day 30', when: 'One month in', color: '#B08428', count: '2 tasks' },
]

/** Focused scenes carry that phase's real task lines, trimmed for legibility. */
const TASKS = {
  0: ['HR calls to confirm reporting time, commute, directions & parking', 'Joining essentials note — documents, dress code, reception contact'],
  1: [
    'Welcome kit',
    'Company-allotted assets & stationery',
    'Credentials — email ID, Keka login',
    'Brief on HR policy',
    'Welcome email + MAGPPIE study materials',
    'Joining formalities — form, NDA, LOA, self-attestation',
    'Introductions to leaders & relevant departments',
    'Added to “MAGPPIE Champions” WhatsApp group',
    'Personalised welcome message',
    'POC contact details for your role',
  ],
  2: ['Assign a buddy from the new hire’s own team  (HR / Manager)'],
  3: ['Informal feedback conversation — positives & negatives'],
  4: ['Formal HR review meeting', 'Manager feedback — conduct, fitment, work quality, values  (HR / Manager)'],
}

const withFocus = (focus) => ({
  phases: PHASES.map((p, i) => (i === focus ? { ...p, tasks: TASKS[focus] } : p)),
  focus,
})

export const ONBOARDING_VIDEO_SPEC = {
  number: 0,
  title: 'Onboarding walkthrough',
  kicker: 'MAGPPIE · ONBOARDING',
  scenes: [
    {
      type: 'roadmap',
      vo: 'Your first month at Magppie is sixteen tasks across five phases — from the day before you join, to your one-month review. It is heavily front-loaded: ten of those sixteen happen on your first day.',
      props: { heading: 'Your first month, end to end', phases: PHASES, focus: -1 },
    },
    {
      type: 'roadmap',
      vo: 'It starts the day before you arrive. H R calls to confirm your reporting time, talk through your commute, and offer help with directions or parking. You also get a note with the joining essentials — which documents to carry, the dress code, and who to ask for at reception.',
      props: { heading: 'Before you arrive', ...withFocus(0) },
    },
    {
      type: 'roadmap',
      vo: 'Day one carries ten of the sixteen tasks. Your welcome kit. Your company-allotted assets and stationery. Your credentials — email I D and Keka login. A briefing on H R policy, and a welcome email with that policy attached along with your Magppie study materials. Joining formalities are completed — the joining form, N D A, L O A, and self-attestation of documents. Then introductions to leaders and the departments you will work with, you are added to the Magppie Champions WhatsApp group with an intro post, you receive a personalised welcome message once your company number is issued, and finally the contact details of the people most relevant to your role.',
      props: { heading: 'Day 1 — ten of the sixteen', ...withFocus(1) },
    },
    {
      type: 'roadmap',
      vo: 'In your first week, H R and your reporting manager assign you a buddy from your own team.',
      props: { heading: 'Week 1 — your buddy', ...withFocus(2) },
    },
    {
      type: 'roadmap',
      vo: 'At day seven there is an informal feedback conversation about your overall experience so far — the positives and the negatives both.',
      props: { heading: 'Day 7 — how is it going', ...withFocus(3) },
    },
    {
      type: 'roadmap',
      vo: 'At thirty days it becomes formal: an H R review meeting with you, and manager feedback on conduct, fitment, work quality and values.',
      props: { heading: 'Day 30 — the first review', ...withFocus(4) },
    },
    {
      type: 'roadmap',
      vo: 'That is the whole first month. Sixteen tasks, five phases, and a named owner on every single one — so nothing is left to chance, and nobody has to guess what happens next.',
      props: { heading: 'Sixteen tasks. Five phases. Every one owned.', phases: PHASES, focus: -1 },
    },
  ],
}
