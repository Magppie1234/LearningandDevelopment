import { JOURNEY_STEPS, JOURNEY_PHASES } from './kitchen-journey'
import { BD_FLOW } from './bd-flow'
import { SALES_FLOW } from './sales-flow'
import type { Flow } from './flow-types'

const PRODUCTION_FLOW: Flow = {
  id: 'production',
  label: 'Production Flow',
  eyebrow: 'Order → Handover',
  titlePrefix: 'The journey of your',
  titleEm: 'kitchen',
  phases: JOURNEY_PHASES,
  steps: JOURNEY_STEPS.map((s) => ({
    t: s.t,
    ic: s.ic,
    d: s.d,
    disp: s.disp?.map((label) => ({ label })),
  })),
}

/** All three process-flow tabs, in display order. */
export const FLOWS: Flow[] = [BD_FLOW, SALES_FLOW, PRODUCTION_FLOW]
