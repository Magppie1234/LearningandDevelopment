import PipelineBoard from '@/components/PipelineBoard'
import KitchenJourney from '@/components/KitchenJourney'

/**
 * Process Flow.
 *
 * The BD → Sales journey board leads: pipeline stages left to right with the
 * touchpoints recorded at each. The existing step-by-step flows stay beneath
 * as the detail layer — the board is the summary, not a replacement for the
 * 130-odd documented steps.
 */
export default function Page() {
  return (
    <div className="max-w-[1100px] mx-auto space-y-8">
      <PipelineBoard />
      <div>
        <h2 className="mb-3 font-serif text-xl text-ink-primary">Step by step</h2>
        <p className="mb-4 text-[13.5px] text-ink-secondary max-w-[62ch]">
          Every documented step behind those stages, including the CRM dispositions a lead can be
          parked under and the post-sale production flow.
        </p>
        <KitchenJourney />
      </div>
    </div>
  )
}
