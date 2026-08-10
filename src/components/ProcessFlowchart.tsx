'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Check, X } from 'lucide-react'
import { FLOWS } from '@/data/flows'
import { ICONS } from '@/data/flow-icons'
import { FLOW_EXPLAINER, STEP_ACTION, STEP_FORKS } from '@/data/flow-guidance'

/**
 * Process Flow as an actual flowchart.
 *
 * This replaces the earlier vertical step list. The point of the change is
 * that a list can only be read top-to-bottom, whereas the shape of a process —
 * how long it is, where it branches, where you are in it — is a thing you
 * should be able to take in at a glance. Boxes flow left to right and wrap;
 * each carries its own instruction so the diagram is the information rather
 * than an index into it; depth lives in a popover so the canvas stays calm.
 *
 * STATUS IS ILLUSTRATIVE. `completed / current / upcoming` follows the box you
 * click, not a real lead, deal or order — the portal has no per-record stage
 * feed. Wiring it to reality means reading a chosen record's stage from the
 * CRM. The page says as much under the progress bar rather than implying the
 * colours mean something they do not.
 */

type Status = 'done' | 'current' | 'todo'

interface Node {
  n: number
  title: string
  /** Imperative first line where one is authored; otherwise the description. */
  action: string
  desc: string
  icon: string
  captures: string[]
  forks: { label: string; kind: 'loop' | 'exit' | 'forward' }[]
}

const STATUS_LABEL: Record<Status, string> = {
  done: 'Completed',
  current: 'In Progress',
  todo: 'Not Started',
}

/**
 * One hue per step, cycled by position in the pipeline.
 *
 * This replaces an earlier green/gold/grey scheme where colour carried the
 * step's STATUS. Colour now carries identity instead — it makes a nineteen-step
 * pipeline scannable, which three repeated colours did not. Status has to be
 * shown some other way, so it moved onto shape and weight (see globals.css):
 *   done    → checkmark drawn into the hexagon
 *   current → ring/glow around the hexagon, plus the slow pulse
 *   todo    → reduced opacity
 * Drop a colour and you lose which step you are looking at; drop the treatment
 * above and you lose where you are. Both have to stay.
 *
 * Hues are held at a similar saturation and lightness so the row reads as one
 * family rather than a clown car, and each is dark enough for a white icon
 * disc to sit on it.
 */
const STEP_HUES = [
  '#7B4B8A', // violet
  '#C2456A', // rose
  '#5C6B7A', // slate
  '#D4863A', // amber
  '#C05340', // terracotta
  '#1F8A75', // teal
  '#3E6FA8', // blue
  '#8A7B34', // olive
] as const

const hueFor = (n: number) => STEP_HUES[n % STEP_HUES.length]

/**
 * Every pipeline renders as a zigzag: steps alternate above and below a
 * central spine as the flow runs left to right, each anchored by a hexagon
 * carrying that step's own action icon, with the title and instruction in a
 * plain card alongside. The hexagon is the visual anchor — the card is a
 * rounded rectangle because a hexagonal one would wreck the instruction's
 * line length.
 *
 * This applies to BD, Sales and Production alike; there is no per-flow opt-in,
 * so the three tabs cannot drift into different formats.
 */

export default function ProcessFlowchart() {
  const [flowId, setFlowId] = useState(FLOWS[0].id)
  const [phaseName, setPhaseName] = useState<string | null>(null)
  const [position, setPosition] = useState<number | null>(null)
  const [openStep, setOpenStep] = useState<number | null>(null)

  const flow = FLOWS.find((f) => f.id === flowId) ?? FLOWS[0]
  const activePhase = phaseName ?? flow.phases[0]?.name
  const phase = flow.phases.find((p) => p.name === activePhase) ?? flow.phases[0]

  /** The steps of the selected pipeline, with their authored guidance merged in. */
  const nodes: Node[] = useMemo(() => {
    if (!phase) return []
    return flow.steps.slice(phase.start - 1, phase.start - 1 + phase.count).map((s, k) => {
      const key = `${flow.id}:${s.t}`
      return {
        n: phase.start + k,
        title: s.t,
        action: STEP_ACTION[key] ?? s.d,
        desc: s.d,
        icon: s.ic,
        captures: s.disp?.map((d) => d.label) ?? [],
        forks: STEP_FORKS[key] ?? [],
      }
    })
  }, [flow, phase])

  // Selecting a pipeline lands on its first step, so the status pattern is
  // visible without a click.
  const firstN = nodes[0]?.n ?? null
  useEffect(() => {
    setPosition(firstN)
    setOpenStep(null)
  }, [firstN])
  useEffect(() => {
    setPhaseName(null)
  }, [flowId])

  const statusOf = useCallback(
    (n: number): Status =>
      position === null ? 'todo' : n < position ? 'done' : n === position ? 'current' : 'todo',
    [position],
  )

  const doneCount = nodes.filter((x) => statusOf(x.n) === 'done').length
  const pct = nodes.length ? Math.round((doneCount / nodes.length) * 100) : 0
  const open = openStep === null ? null : (nodes.find((x) => x.n === openStep) ?? null)

  return (
    <section className="pf">
      {/* Kitchen scene behind the whole canvas, washed back so box text keeps
          its contrast. Same photograph set as the page headers. */}
      <div aria-hidden className="pf-bg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/kitchen/space-2.jpg" alt="" draggable={false} />
        <span />
      </div>

      <div className="pf-inner">
        <div className="pf-tabs" role="tablist" aria-label="Process">
          {FLOWS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={f.id === flowId}
              className={`pf-tab${f.id === flowId ? ' active' : ''}`}
              onClick={() => setFlowId(f.id)}
            >
              {f.label.replace(' Flow', '')}
            </button>
          ))}
        </div>

        {flow.phases.length > 1 && (
          <div className="pf-subtabs" role="tablist" aria-label="Pipeline">
            {flow.phases.map((p) => (
              <button
                key={p.name}
                type="button"
                role="tab"
                aria-selected={p.name === activePhase}
                className={`pf-subtab${p.name === activePhase ? ' active' : ''}`}
                onClick={() => setPhaseName(p.name)}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}

        {FLOW_EXPLAINER[flow.id] && <p className="pf-explainer">{FLOW_EXPLAINER[flow.id]}</p>}

        <div className="pf-progress">
          <div className="pf-progress-row">
            <span className="pf-progress-text">
              {doneCount} of {nodes.length} steps completed
            </span>
            <span className="pf-progress-pct">{pct}%</span>
          </div>
          <div className="pf-bar">
            <span style={{ width: `${pct}%` }} />
          </div>
          <p className="pf-note">
            Click any box to see its detail and to move the marker. This shows the process itself —
            it is not a live lead or order, which would need the CRM feed wired in.
          </p>
        </div>

        <div className="pf-canvas zigzag">
          {nodes.map((node, i) => {
            const status = statusOf(node.n)
            const isLast = i === nodes.length - 1
            return (
              <div
                key={node.n}
                className={`pf-unit ${i % 2 === 0 ? 'up' : 'down'} ${status}${node.forks.length > 0 ? ' has-fork' : ''}`}
              >
                <FlowBox
                  node={node}
                  status={status}
                  selected={openStep === node.n}
                  onClick={() => {
                    setOpenStep(openStep === node.n ? null : node.n)
                    setPosition(node.n)
                  }}
                />
                {node.forks.length > 0 ? (
                  <Decision forks={node.forks} />
                ) : (
                  !isLast && (
                    <span className="pf-arrow" aria-hidden>
                      <svg viewBox="0 0 24 24">
                        <path d="M4 12h14M13 7l5 5-5 5" />
                      </svg>
                    </span>
                  )
                )}
              </div>
            )
          })}
        </div>
      </div>

      {open && (
        <StepPopover
          node={open}
          status={statusOf(open.n)}
          hasAction={Boolean(STEP_ACTION[`${flow.id}:${open.title}`])}
          onClose={() => setOpenStep(null)}
        />
      )}
    </section>
  )
}

/** A single flowchart box: status colour, step number, title, instruction. */
function FlowBox({
  node,
  status,
  selected,
  onClick,
}: {
  node: Node
  status: Status
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={selected}
      className={`pf-box ${status}${selected ? ' selected' : ''}`}
    >
      {/* The hexagon is the step's anchor: its own action icon at full size,
          or the checkmark once complete. Its hue identifies the step; the
          status treatment lives in CSS off the status class. */}
      <span
        className={`pf-hex ${status}`}
        aria-hidden
        style={{ ['--pf-hue' as string]: hueFor(node.n) }}
      >
        <span className="pf-hex-inner">
          {status === 'done' ? (
            // Drawn in rather than switched on — see `pf-draw` in globals.css.
            <svg viewBox="0 0 24 24" className="pf-check">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: ICONS[node.icon] || ICONS.box }} />
          )}
        </span>
        <span className="pf-hex-n">{node.n}</span>
      </span>

      <span className="pf-card">
        <span className="pf-step-label">Step {node.n}</span>
        <span className="pf-box-title">{node.title}</span>
        <span className="pf-box-action">{node.action}</span>
      </span>
    </button>
  )
}

/**
 * A real decision node. Steps whose own recorded description says they loop or
 * exit get a diamond with two labelled arrows, rather than being flattened
 * into the straight line that follows them.
 */
function Decision({ forks }: { forks: { label: string; kind: 'loop' | 'exit' | 'forward' }[] }) {
  return (
    <span className="pf-decision">
      <span className="pf-diamond" aria-hidden />
      <span className="pf-branches">
        {forks.map((f) => (
          <span key={f.label} className={`pf-branch ${f.kind}`}>
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M4 12h14M13 7l5 5-5 5" />
            </svg>
            {f.label}
          </span>
        ))}
      </span>
    </span>
  )
}

/**
 * Detail popover. Anchored to the clicked box when there is room, centred on
 * small screens. Closes on Esc, on a click outside, and on scroll — a popover
 * left floating away from its anchor is worse than one that dismisses.
 */
function StepPopover({
  node,
  status,
  hasAction,
  onClose,
}: {
  node: Node
  status: Status
  hasAction: boolean
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)

  /** Anchor under the selected box, flipping above it near the viewport foot. */
  const place = useCallback(() => {
    const anchor = document.querySelector<HTMLElement>(`.pf-box.selected`)
    const card = ref.current
    if (!anchor || !card) return
    const a = anchor.getBoundingClientRect()
    const w = card.offsetWidth
    const h = card.offsetHeight
    const gap = 10
    let left = a.left + a.width / 2 - w / 2
    left = Math.max(12, Math.min(left, window.innerWidth - w - 12))
    let top = a.bottom + gap
    if (top + h > window.innerHeight - 12) top = Math.max(12, a.top - h - gap)
    setPos({ top, left })
  }, [])

  useLayoutEffect(place, [place, node.n])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (!ref.current?.contains(t) && !t.closest('.pf-box')) onClose()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    // Track the anchor rather than dismissing: closing on any scroll event
    // meant the card vanished the moment the page settled after a click.
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
    }
  }, [onClose, place])

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={`${node.title} — ${STATUS_LABEL[status]}`}
      className="pf-pop"
      style={pos ? { top: pos.top, left: pos.left } : { opacity: 0 }}
    >
      <div className="pf-pop-head">
        <span className={`pf-badge ${status}`}>{STATUS_LABEL[status]}</span>
        <button type="button" onClick={onClose} aria-label="Close" className="pf-pop-close">
          <X size={14} />
        </button>
      </div>
      <p className="pf-pop-step">Step {node.n}</p>
      <h3 className="pf-pop-title">{node.title}</h3>
      {hasAction && <p className="pf-pop-action">{node.action}</p>}
      <p className="pf-pop-desc">{node.desc}</p>
      {node.captures.length > 0 && (
        <>
          <p className="pf-pop-sub">Recorded at this step</p>
          <ul className="pf-checklist">
            {node.captures.map((c) => (
              <li key={c}>
                <Check size={12} aria-hidden />
                {c}
              </li>
            ))}
          </ul>
        </>
      )}
      {node.forks.length > 0 && (
        <>
          <p className="pf-pop-sub">This step can go two ways</p>
          <ul className="pf-checklist forks">
            {node.forks.map((f) => (
              <li key={f.label}>{f.label}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
