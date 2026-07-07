'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'
import { FLOWS } from '@/data/flows'

/* Icon library — inner SVG markup keyed by the `ic` field on each step. */
const ICONS: Record<string, string> = {
  payment: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 10h19"/>',
  assign: '<circle cx="9" cy="8" r="3.6"/><path d="M2.5 20a6.5 6.5 0 0 1 11-3"/><path d="M15 16l2.2 2.2L22 13.5"/>',
  ruler: '<rect x="3" y="8" width="18" height="8" rx="1"/><path d="M7 8v3M11 8v4M15 8v3M19 8v3"/>',
  review: '<circle cx="11" cy="11" r="7"/><path d="M20.5 20.5 17 17"/>',
  revisit: '<path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1"/><path d="M20.5 4.5v4h-4"/>',
  design: '<path d="M12 20h9"/><path d="M16.5 3.5a2 2 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  approve: '<circle cx="12" cy="12" r="8.5"/><path d="M8 12l3 3 5-5"/>',
  client: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  swatch: '<circle cx="12" cy="12" r="8.5"/><circle cx="8.5" cy="10" r="1.2"/><circle cx="12" cy="8" r="1.2"/><circle cx="15.5" cy="11" r="1.2"/>',
  cube: '<path d="M12 2.5 20.5 7v10L12 21.5 3.5 17V7z"/><path d="M3.5 7 12 11.5 20.5 7M12 11.5V21.5"/>',
  drawing: '<path d="M6 2.5h9l5 5v14H6z"/><path d="M15 2.5v5h5"/><path d="M9 13h6M9 17h6"/>',
  factory: '<path d="M2.5 21V10l6 4V10l6 4V7l6 4v10z"/><path d="M6 21v-3M12 21v-3M18 21v-3"/>',
  bom: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 5.2l1 1 2-2M4 11.2l1 1 2-2M4 17.2l1 1 2-2"/>',
  stock: '<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="8.5" y="13.5" width="7" height="7" rx="1"/>',
  alert: '<path d="M12 3 2.5 20h19z"/><path d="M12 9v5M12 17.5h.01"/>',
  optimize: '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="8" cy="18" r="2"/>',
  calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01"/>',
  purchase: '<circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/><path d="M2.5 3.5H5l2.4 11.5h10l1.8-8H6"/>',
  vendor: '<path d="M4 9h16v11H4z"/><path d="M3 9l2-5h14l2 5"/><path d="M9 20v-5h6v5"/>',
  truck: '<path d="M2.5 6h11v9h-11z"/><path d="M13.5 9h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>',
  clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4a3 3 0 0 1 6 0"/><path d="M9 12h6M9 16h6"/>',
  qc: '<path d="M12 3 5 6v6c0 4.6 3.3 6.9 7 8.8 3.7-1.9 7-4.2 7-8.8V6z"/><path d="M9 12l2 2 4-4"/>',
  cut: '<circle cx="6" cy="6" r="2.4"/><circle cx="6" cy="18" r="2.4"/><path d="M8 7.6 20 18M8 16.4 20 6"/>',
  cnc: '<rect x="7" y="7" width="10" height="10" rx="1"/><path d="M10 3v3M14 3v3M10 18v3M14 18v3M3 10h3M3 14h3M18 10h3M18 14h3"/>',
  drill: '<path d="M4 6h9v5H4z"/><path d="M13 8h4v2h-4"/><path d="M8.5 11v3"/><path d="M6.5 20h4l-1.5-6"/>',
  assembly: '<path d="M4 4h6v2.5a1.8 1.8 0 1 0 3.6 0V4H20v6h-2.5a1.8 1.8 0 1 0 0 3.6H20V20h-6.4v-2.5a1.8 1.8 0 1 0-3.6 0V20H4z"/>',
  hardware: '<path d="M15.5 6.5a4 4 0 0 0-5.3 5.1l-6.7 6.7 2.2 2.2 6.7-6.7a4 4 0 0 0 5.1-5.3l-2.7 2.7-2-2z"/>',
  finish: '<path d="M12 3l2.2 6.3L20.5 12l-6.3 2.2L12 20.5 9.8 14.2 3.5 12l6.3-2.2z"/>',
  package: '<path d="M3 8l9-4 9 4-9 4z"/><path d="M3 8v8l9 4 9-4V8"/><path d="M12 12v8"/>',
  label: '<path d="M3.5 3.5h8l9.5 9.5-8 8-9.5-9.5z"/><circle cx="7.5" cy="7.5" r="1.4"/>',
  box: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 10h16"/>',
  dispatch: '<path d="M21.5 2.5 11 13"/><path d="M21.5 2.5 14.5 21l-3.5-8-8-3.5z"/>',
  install: '<path d="M14 6.5l3.5 3.5-8 8-3.5-3.5z"/><path d="M14 6.5l3-3 3.5 3.5-3 3"/><path d="M6 14.5 2.5 18l2 2L8 16.5"/>',
  clean: '<path d="M19 4 9.5 13.5"/><path d="M13 7l4 4"/><path d="M8.5 12 3 17.5 6.5 21 12 15.5"/>',
  inspect: '<circle cx="11" cy="11" r="7"/><path d="M8 11l2 2 4-4"/><path d="M20.5 20.5 17 17"/>',
  handshake: '<path d="M8 12.5 11 15.5l3-3 3 3"/><path d="M2.5 10 6.5 6l5.5 3 5.5-3 4 4-6.5 6.5-3-2-3 2z"/>',
  warranty: '<path d="M12 3 5 6v6c0 4.6 3.3 6.9 7 8.8 3.7-1.9 7-4.2 7-8.8V6z"/><path d="M12 8v4M12 15h.01"/>',
  service: '<path d="M4 13a8 8 0 0 1 16 0"/><rect x="2.5" y="13" width="4" height="6" rx="2"/><rect x="17.5" y="13" width="4" height="6" rx="2"/><path d="M20 19a3 3 0 0 1-3 3h-3"/>',
  pen: '<path d="M3 17l10-10 4 4L7 21H3z"/><path d="M13.5 6.5l2-2 3 3-2 2"/>',
  flag: '<path d="M5 21V4"/><path d="M5 4h12l-2 4 2 4H5"/>',
  mappin: '<path d="M12 21.5S19 15.5 19 10a7 7 0 0 0-14 0c0 5.5 7 11.5 7 11.5z"/><circle cx="12" cy="10" r="2.4"/>',
  calendar: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
  send: '<path d="M21.5 2.5 11 13"/><path d="M21.5 2.5 14.5 21l-3.5-8-8-3.5z"/>',
  phone: '<path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.3 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.3 0 .7-.3 1z"/>',
  database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
}

export default function KitchenJourney() {
  const [flowId, setFlowId] = useState(FLOWS[0].id)
  const [fullscreen, setFullscreen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const flow = FLOWS.find((f) => f.id === flowId) ?? FLOWS[0]

  /* Group the flat step list under its phase, carrying each step's global number. */
  const groups = useMemo(
    () =>
      flow.phases.map((p) => ({
        phase: p,
        steps: flow.steps.slice(p.start - 1, p.start - 1 + p.count).map((s, k) => ({
          s,
          n: p.start + k,
        })),
      })),
    [flow],
  )

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === rootRef.current)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])
  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen?.()
    else rootRef.current?.requestFullscreen?.()
  }

  return (
    <div className={`kjt${fullscreen ? ' kjt-fs' : ''}`} ref={rootRef}>
      <div className="kjt-tabs" role="tablist" aria-label="Process flow">
        {FLOWS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={f.id === flowId}
            className={`kjt-tab${f.id === flowId ? ' active' : ''}`}
            onClick={() => setFlowId(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="kjt-head">
        <div>
          <p className="kjt-eyebrow">{flow.eyebrow}</p>
          <h2 className="kjt-title">
            {flow.titlePrefix} <em>{flow.titleEm}</em>
          </h2>
        </div>
        <div className="kjt-head-right">
          <span className="kjt-count">
            {flow.steps.length} steps · {flow.phases.length}{' '}
            {flow.phases.length === 1 ? 'phase' : 'phases'}
          </span>
          <button
            type="button"
            className="kjt-fs-btn"
            onClick={toggleFullscreen}
            aria-label={fullscreen ? 'Exit full screen' : 'Full screen'}
          >
            {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            <span>{fullscreen ? 'Exit' : 'Full screen'}</span>
          </button>
        </div>
      </div>

      <div className="kjt-scroll">
        {groups.map(({ phase, steps }) => (
          <section key={phase.name}>
            {flow.phases.length > 1 && (
              <div
                className="kjt-phase-head"
                style={{ ['--seg' as string]: phase.color }}
              >
                <span className="kjt-phase-dot" />
                <span className="kjt-phase-name">{phase.name}</span>
                <span className="kjt-phase-range">
                  Steps {phase.start}–{phase.start + phase.count - 1}
                </span>
              </div>
            )}

            {steps.map(({ s, n }) => (
              <div
                key={n}
                className="kjt-row"
                style={{ ['--seg' as string]: phase.color }}
              >
                <div className="kjt-rail">
                  <span className="kjt-node">{n}</span>
                </div>
                <div className="kjt-content">
                  <div className="kjt-row-title">
                    <svg
                      viewBox="0 0 24 24"
                      dangerouslySetInnerHTML={{ __html: ICONS[s.ic] || ICONS.box }}
                    />
                    <span>{s.t}</span>
                  </div>
                  <p className="kjt-row-desc">{s.d}</p>
                  {s.disp && (
                    <div className="kjt-row-chips">
                      {s.disp.map((x) => (
                        <span
                          className={`kjt-chip${x.terminal ? ' terminal' : ''}`}
                          key={x.label}
                          title={x.desc && x.desc !== x.label ? x.desc : undefined}
                        >
                          {x.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}
