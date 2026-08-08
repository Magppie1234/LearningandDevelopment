/**
 * Authored guidance layered over the process-flow data.
 *
 * ⚠️ EVERYTHING IN THIS FILE IS WRITTEN FOR THE PORTAL — it is not exported
 * from the CRM and has not been signed off by a process owner. It exists
 * because the flow data (`bd-flow`, `sales-flow`, `kitchen-journey`) describes
 * what each stage *means* but never says what a person should *do*, and a
 * training surface needs the instruction, not the definition.
 *
 * Three kinds of thing live here, all optional — the UI falls back to the
 * flow's own copy wherever a key is missing:
 *
 *   EXPLAINER   one plain sentence per flow, for someone opening the page cold
 *   ACTION      the imperative first line for a step ("Call the lead back…")
 *   FORKS       the branches a step can take, where the flow's own description
 *               says in prose that it loops or exits
 *
 * Production (103 steps) is deliberately NOT given action lines: writing a
 * hundred instructions for a manufacturing process without the factory's
 * input would be inventing process, not documenting it. Those steps fall back
 * to their recorded description and the page says so.
 */

/** One plain-language sentence per flow — no stage names, no jargon. */
export const FLOW_EXPLAINER: Record<string, string> = {
  bd: 'This is how a new enquiry becomes a serious prospect: someone gets in touch, we call them, and we work out whether they are ready to buy.',
  sales: 'This is how a serious prospect becomes a signed order: we design what they want, agree a price, and close the deal.',
  production: 'This is how a signed order becomes a finished kitchen in someone’s home: we measure, make it in the factory, deliver it and install it.',
}

/**
 * Imperative first line, keyed `${flowId}:${step title}`. Kept to one short
 * sentence — the recorded description still renders underneath it.
 */
export const STEP_ACTION: Record<string, string> = {
  // ── BD: lead sources ──
  'bd:Paid Digital Marketing': 'Check the campaign source before calling, so the opening line matches the ad they clicked.',
  'bd:Organic Digital Marketing': 'Check which page or post brought them in before you call.',
  'bd:Walkins': 'Log the walk-in the same day, while the conversation is still fresh.',
  'bd:Direct IVR Calls': 'Return the call the same working day.',
  'bd:Client Referrals': 'Ask who referred them and mention that client by name when you call.',
  'bd:Architects': 'Record the architect and the project they are specifying for.',
  'bd:Exhibitions': 'Enter the badge details into the CRM within 24 hours of the show.',
  'bd:Scanners': 'Confirm the scanned contact details are readable before the lead is worked.',

  // ── BD: qualification pipeline ──
  'bd:CRM': 'Work every lead from the CRM — never from a personal list or a spreadsheet.',
  'bd:Not Contacted Yet': 'Make first contact within 24 hours of the lead arriving.',
  'bd:Not Responding / Call Back Later': 'Set a disposition and a callback time on every failed attempt.',
  'bd:Under Follow Up': 'Agree the next contact date with the lead before ending the call.',
  'bd:Not Interested': 'Record the reason the lead went cold before closing it.',
  'bd:Junk Lead': 'Mark it junk so it stops consuming follow-up time.',
  'bd:Will Buy in Future': 'Set the re-engagement date now, while you know their timeline.',
  'bd:Qualified / Drawings Awaited': 'Enter the estimated value and client type, then chase the drawings.',
  'bd:Human Intervention Required': 'Write the note explaining what a senior needs to decide.',
  'bd:BD Calls Again': 'Open the previous disposition first, so the call picks up where it left off.',
  'bd:No Response Again': 'Update the disposition and check the attempt count before retrying.',
  'bd:Client Picks Up': 'Establish budget and intent on this call, then set the stage accordingly.',
  'bd:Lead Qualified → Opportunity Flow': 'Confirm scope and budget are aligned, then hand over to Sales.',

  // ── Sales: opportunity pipeline ──
  'sales:Validated by SM': 'Have the Sales Manager confirm the handover is complete before you start.',
  'sales:Design Form': 'Fill every field and upload the drawings — an incomplete form stalls the design.',
  'sales:Design Form Review': 'Check the form for completeness before it reaches the design team.',
  'sales:Design Discussion': 'Walk the client through the design and capture what they want changed.',
  'sales:Under Follow-up': 'Agree the next step with the client before ending the conversation.',
  'sales:On Hold': 'Record why it is on hold and when to revisit it.',
  'sales:Not Interested': 'Capture the reason before closing the opportunity.',
  'sales:Price Discussion': 'Quote from the approved price list and record any discount.',
  'sales:Principally Closed': 'Record the final value and the committed closure date.',
  'sales:Closure': 'Collect the payment and get the estimate approved before marking it closed.',
  'sales:Handover to Post Design': 'Attach all four handover documents before passing it on.',
}

export interface ForkPath {
  label: string
  /** 'loop' returns to an earlier step, 'exit' leaves the pipeline. */
  kind: 'loop' | 'exit' | 'forward'
}

/**
 * Steps that genuinely branch. Each entry is taken from the wording of that
 * step's own recorded description — e.g. "the cycle may repeat or the lead may
 * be moved to Not Interested after maximum attempts."
 */
export const STEP_FORKS: Record<string, ForkPath[]> = {
  'bd:Not Responding / Call Back Later': [
    { label: 'Retry contact', kind: 'loop' },
    { label: 'Not Interested', kind: 'exit' },
  ],
  'bd:No Response Again': [
    { label: 'Repeat the cycle', kind: 'loop' },
    { label: 'Not Interested (max attempts)', kind: 'exit' },
  ],
  'bd:Client Picks Up': [
    { label: 'Under Follow Up', kind: 'forward' },
    { label: 'Qualified', kind: 'forward' },
  ],
}
