import ProcessFlowchart from '@/components/ProcessFlowchart'

/**
 * Process Flow.
 *
 * One flowchart per pipeline: the whole shape of a process on a single page,
 * with each box carrying its own instruction and the longer detail behind a
 * click. This replaced an earlier vertical step list and, before that, a
 * left-to-right stage board — both are gone rather than stacked, because
 * three views of the same process on one page is the opposite of the calm
 * this page is meant to have.
 */
export default function Page() {
  return (
    <div className="max-w-[1180px] mx-auto">
      <ProcessFlowchart />
    </div>
  )
}
