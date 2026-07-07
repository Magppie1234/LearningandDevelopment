/** Shared shape for every process-flow tab (BD Flow, Sales Flow, Production Flow). */

export type Disposition = {
  label: string
  desc?: string
  /** Marks a disposition as an end state (lead/opportunity exits the pipeline). */
  terminal?: boolean
}

export type FlowStepDef = {
  t: string
  /** Icon key — see ICONS in KitchenJourney.tsx. */
  ic: string
  d: string
  disp?: Disposition[]
}

export type FlowPhase = {
  name: string
  /** 1-based index of the first step in this phase. */
  start: number
  count: number
  /** Accent hex used for this phase's rows and header. */
  color: string
}

export type Flow = {
  id: string
  label: string
  eyebrow: string
  titlePrefix: string
  titleEm: string
  phases: FlowPhase[]
  steps: FlowStepDef[]
}

/** Shorthand for building a Disposition inline in step data. */
export const D = (label: string, desc?: string, terminal?: boolean): Disposition => ({
  label,
  ...(desc ? { desc } : {}),
  ...(terminal ? { terminal: true } : {}),
})
