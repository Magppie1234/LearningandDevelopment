import React from 'react'
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'

/**
 * Animated scene system for the Sales Academy module videos — real motion
 * graphics: flowcharts whose nodes pop in sequence, bars that grow, tables
 * that reveal row by row, count-up stats, word-swap rows, drifting ambient
 * background. Warm-stone brand: charcoal #2B2420, ivory #F5EFE6, copper
 * #B8703F, sage #7C8B6F, amber #e0a04a.
 */

export const FPS = 30
export const PAD_S = 0.7

const INK = '#F5EFE6'
const COPPER = '#C88255'
const COPPER_D = '#B8703F'
const SAGE = '#9DB18F'
const AMBER = '#e0a04a'
const RED = '#d97662'
const DIM = 'rgba(245,239,230,0.55)'
const FAINT = 'rgba(245,239,230,0.35)'
const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = 'Arial, Helvetica, sans-serif'

/* ── scene spec types ─────────────────────────────────────────────────── */
export interface SceneSpec {
  type: string
  dur: number // narration seconds (scene lasts dur + PAD_S)
  props: Record<string, any>
}
export interface ModuleProps {
  number: number
  title: string
  scenes: SceneSpec[]
}

/* ── helpers ──────────────────────────────────────────────────────────── */
const useIn = (delayFrames = 0, damping = 14) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  return spring({ frame: frame - delayFrames, fps, config: { damping, mass: 0.7 } })
}

const Pop: React.FC<{ delay?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  delay = 0,
  children,
  style,
}) => {
  const s = useIn(delay)
  return (
    <div style={{ opacity: s, transform: `translateY(${(1 - s) * 26}px) scale(${0.96 + s * 0.04})`, ...style }}>
      {children}
    </div>
  )
}

/* ── ambient animated background ──────────────────────────────────────── */
// Deterministic pseudo-random for particle placement (no Math.random —
// renders must be reproducible frame to frame).
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

const Backdrop: React.FC = () => {
  const f = useCurrentFrame()
  const x1 = 62 + Math.sin(f / 95) * 14
  const y1 = 12 + Math.cos(f / 120) * 10
  const x2 = 14 + Math.cos(f / 140) * 12
  const y2 = 88 + Math.sin(f / 110) * 8
  const sweep = ((f / 6) % 200) - 50
  return (
    <AbsoluteFill style={{ background: '#241E1A', overflow: 'hidden' }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(52% 46% at ${x1}% ${y1}%, rgba(184,112,63,0.20), transparent 70%),
                       radial-gradient(46% 42% at ${x2}% ${y2}%, rgba(124,139,111,0.12), transparent 65%)`,
        }}
      />
      {/* slow diagonal light sweep */}
      <div
        style={{
          position: 'absolute',
          top: '-30%',
          left: `${sweep}%`,
          width: '22%',
          height: '160%',
          transform: 'rotate(18deg)',
          background: 'linear-gradient(90deg, transparent, rgba(200,130,85,0.07), transparent)',
        }}
      />
      {/* floating copper motes */}
      {Array.from({ length: 18 }, (_, i) => {
        const baseX = rnd(i) * 100
        const baseY = rnd(i + 50) * 100
        const size = 2 + rnd(i + 100) * 4
        const speed = 0.15 + rnd(i + 150) * 0.3
        const y = (baseY - f * speed * 0.12 + 100) % 110 - 5
        const x = baseX + Math.sin(f / 60 + i * 2) * 2.5
        const tw = 0.25 + 0.35 * Math.abs(Math.sin(f / 40 + i * 1.7))
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              borderRadius: '50%',
              background: i % 3 === 0 ? 'rgba(200,130,85,0.8)' : 'rgba(245,239,230,0.55)',
              opacity: tw,
              filter: 'blur(0.6px)',
            }}
          />
        )
      })}
      {/* fine grain vignette */}
      <AbsoluteFill style={{ boxShadow: 'inset 0 0 220px rgba(0,0,0,0.55)' }} />
    </AbsoluteFill>
  )
}

/* ── the storyteller — an animated illustrated consultant ─────────────────
   Blinks, breathes, gestures toward the content, and "speaks" while the
   narration runs (mouth cadence). Free, on-brand stand-in for a filmed
   presenter; swap for a Colossyan avatar render later if desired. */
const Storyteller: React.FC<{ talkEnd: number }> = ({ talkEnd }) => {
  const f = useCurrentFrame()
  const enter = spring({ frame: f - 4, fps: FPS, config: { damping: 15 } })
  const talking = f / FPS < talkEnd
  // breathing sway
  const sway = Math.sin(f / 22) * 1.6
  const bob = Math.sin(f / 18) * 1.4
  // blink every ~2.8s
  const blinkT = f % 84
  const blink = blinkT < 4 ? 1 - Math.abs(blinkT - 2) / 2 : 0
  const eyeH = 3.4 * (1 - blink * 0.9)
  // mouth cadence while narration is playing
  const mouth = talking ? 2.2 + 4.6 * Math.abs(Math.sin(f * 0.55) * Math.sin(f * 0.21 + 1.3)) : 1.6
  // gesturing forearm — periodically points toward the content
  const gesture = Math.sin(f / 34) * 14 + Math.sin(f / 9) * (talking ? 3 : 0.5)
  const brow = Math.sin(f / 47) > 0.86 ? -2.2 : 0
  return (
    <div
      style={{
        position: 'absolute',
        right: 34,
        bottom: 0,
        opacity: enter,
        transform: `translateY(${(1 - enter) * 90}px)`,
      }}
    >
      {/* soft spotlight behind the presenter */}
      <div
        style={{
          position: 'absolute',
          right: -30,
          bottom: -40,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200,130,85,0.14), transparent 65%)',
        }}
      />
      <svg width="220" height="250" viewBox="0 0 220 250" style={{ display: 'block' }}>
        <g transform={`translate(${sway} ${bob})`}>
          {/* body */}
          <path d="M52 250 C52 196 78 172 110 172 C142 172 168 196 168 250 Z" fill="#8a5a38" />
          <path d="M52 250 C52 196 78 172 110 172 C142 172 168 196 168 250 Z" fill="url(#shade)" opacity="0.35" />
          {/* collar */}
          <path d="M96 176 L110 196 L124 176 L110 184 Z" fill="#F5EFE6" opacity="0.9" />
          {/* gesturing arm (left of body, pointing to content) */}
          <g transform={`rotate(${-30 + gesture} 74 196)`}>
            <rect x="20" y="188" width="60" height="17" rx="8.5" fill="#8a5a38" />
            <circle cx="22" cy="196" r="10" fill="#c98f66" />
          </g>
          {/* resting arm */}
          <rect x="146" y="192" width="18" height="46" rx="9" fill="#7c4f30" />
          {/* neck */}
          <rect x="99" y="152" width="22" height="26" rx="9" fill="#c98f66" />
          {/* head */}
          <ellipse cx="110" cy="118" rx="42" ry="46" fill="#d8a077" />
          {/* hair — swept back into a bun */}
          <path d="M68 110 C66 74 92 58 110 58 C128 58 154 74 152 110 C152 88 136 72 110 72 C84 72 68 88 68 110 Z" fill="#3a2a20" />
          <circle cx="152" cy="86" r="13" fill="#3a2a20" />
          {/* earring */}
          <circle cx="72" cy="128" r="3.4" fill={COPPER} />
          {/* brows */}
          <rect x="86" y={96 + brow} width="17" height="3.6" rx="1.8" fill="#3a2a20" />
          <rect x="117" y={96 + brow} width="17" height="3.6" rx="1.8" fill="#3a2a20" />
          {/* eyes (blinking) */}
          <ellipse cx="94" cy="110" rx="4.6" ry={eyeH} fill="#241E1A" />
          <ellipse cx="126" cy="110" rx="4.6" ry={eyeH} fill="#241E1A" />
          {/* nose */}
          <path d="M110 116 L107 128 L113 128 Z" fill="#c48b62" />
          {/* mouth (talking) */}
          <ellipse cx="110" cy="140" rx="9.5" ry={mouth} fill="#7c3b2e" />
          <ellipse cx="110" cy={140 - mouth * 0.25} rx="7" ry={Math.max(0.8, mouth * 0.4)} fill="#a35545" />
          {/* bindi */}
          <circle cx="110" cy="94" r="2.4" fill={COPPER} />
        </g>
        <defs>
          <linearGradient id="shade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#000" stopOpacity="0.35" />
            <stop offset="0.5" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

/* ── chrome (eyebrow + footer) ────────────────────────────────────────── */
const Chrome: React.FC<{ mod: ModuleProps; idx: number; total: number }> = ({ mod, idx, total }) => (
  <>
    <div style={{ position: 'absolute', top: 46, left: 64 }}>
      <div style={{ fontFamily: SANS, fontSize: 15, letterSpacing: 5, color: COPPER, fontWeight: 700 }}>
        MAGPPIE · SALES ACADEMY
      </div>
      <div style={{ fontFamily: SANS, fontSize: 14, color: DIM, marginTop: 6, letterSpacing: 1 }}>
        Module {mod.number} — {mod.title}
      </div>
    </div>
    <div style={{ position: 'absolute', bottom: 40, left: 64, fontFamily: SANS, fontSize: 13, letterSpacing: 3, color: 'rgba(200,130,85,0.7)' }}>
      MAGPPIE
    </div>
    <div style={{ position: 'absolute', bottom: 40, right: 64, fontFamily: SANS, fontSize: 13, letterSpacing: 2, color: FAINT }}>
      {idx + 1} / {total}
    </div>
  </>
)

const Body: React.FC<{ children: React.ReactNode; center?: boolean }> = ({ children, center }) => (
  <AbsoluteFill
    style={{
      // right padding leaves room for the storyteller presenter
      padding: '124px 250px 96px 64px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: center ? 'center' : 'flex-start',
    }}
  >
    {children}
  </AbsoluteFill>
)

const H: React.FC<{ text: string; small?: boolean }> = ({ text, small }) => {
  const s = useIn(2)
  return (
    <div
      style={{
        fontFamily: SERIF,
        fontSize: small ? 34 : 46,
        color: INK,
        marginBottom: 8,
        opacity: s,
        transform: `translateY(${(1 - s) * 18}px)`,
      }}
    >
      {text}
      <div
        style={{
          width: 64 * s,
          height: 3,
          background: COPPER_D,
          marginTop: 14,
        }}
      />
    </div>
  )
}

/* ── scenes ───────────────────────────────────────────────────────────── */

const TitleScene: React.FC<any> = ({ title, subtitle, kicker }) => {
  const s1 = useIn(4)
  const s2 = useIn(14)
  return (
    <Body center>
      {kicker && (
        <div style={{ fontFamily: SANS, fontSize: 18, letterSpacing: 4, color: COPPER, marginBottom: 18, opacity: s1 }}>
          {kicker.toUpperCase()}
        </div>
      )}
      <div style={{ fontFamily: SERIF, fontSize: 64, lineHeight: 1.08, color: INK, maxWidth: 940, opacity: s1, transform: `translateY(${(1 - s1) * 30}px)` }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontFamily: SANS, fontSize: 24, color: DIM, marginTop: 22, maxWidth: 860, lineHeight: 1.5, opacity: s2, transform: `translateY(${(1 - s2) * 20}px)` }}>
          {subtitle}
        </div>
      )}
    </Body>
  )
}

const QuoteScene: React.FC<any> = ({ label, text, heading }) => {
  const frame = useCurrentFrame()
  const bar = useIn(4)
  const chars = Math.floor(interpolate(frame, [8, 60], [0, text.length], { extrapolateRight: 'clamp' }))
  return (
    <Body center>
      {heading && <H text={heading} small />}
      <div style={{ display: 'flex', gap: 26, marginTop: heading ? 16 : 0 }}>
        <div style={{ width: 5, background: COPPER_D, borderRadius: 3, transform: `scaleY(${bar})`, transformOrigin: 'top' }} />
        <div style={{ maxWidth: 950 }}>
          {label && (
            <div style={{ fontFamily: SANS, fontSize: 15, letterSpacing: 3, color: AMBER, marginBottom: 14 }}>
              {label.toUpperCase()}
            </div>
          )}
          <div style={{ fontFamily: SERIF, fontSize: 33, lineHeight: 1.45, color: INK }}>
            “{text.slice(0, chars)}
            <span style={{ opacity: chars < text.length ? 1 : 0 }}>▍</span>”
          </div>
        </div>
      </div>
    </Body>
  )
}

const TimelineScene: React.FC<any> = ({ heading, items }) => {
  const frame = useCurrentFrame()
  return (
    <Body center>
      {heading && <H text={heading} />}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: 44 }}>
        {items.map((it: any, i: number) => {
          const s = useIn(10 + i * 14)
          const n = Math.round(interpolate(frame, [10 + i * 14, 40 + i * 14], [0, it.value], { extrapolateRight: 'clamp' }))
          return (
            <React.Fragment key={i}>
              {i > 0 && (
                <div style={{ width: 110, height: 3, background: `rgba(200,130,85,${s * 0.7})`, transform: `scaleX(${s})` }} />
              )}
              <div style={{ textAlign: 'center', opacity: s, transform: `scale(${0.8 + s * 0.2})` }}>
                <div style={{ fontFamily: SERIF, fontSize: 84, color: COPPER, lineHeight: 1 }}>
                  {n}
                  <span style={{ fontSize: 44 }}>+</span>
                </div>
                <div style={{ fontFamily: SANS, fontSize: 19, color: DIM, marginTop: 10, maxWidth: 200 }}>{it.label}</div>
              </div>
            </React.Fragment>
          )
        })}
      </div>
    </Body>
  )
}

const DoDontScene: React.FC<any> = ({ heading, dont, dos }) => (
  <Body>
    <H text={heading ?? 'Never say · Always say'} />
    <div style={{ display: 'flex', gap: 28, marginTop: 26 }}>
      {[
        { title: 'NEVER', items: dont, color: RED, mark: '✕' },
        { title: 'ALWAYS', items: dos, color: SAGE, mark: '✓' },
      ].map((col, c) => (
        <div key={c} style={{ flex: 1 }}>
          <Pop delay={6 + c * 6}>
            <div style={{ fontFamily: SANS, fontSize: 16, letterSpacing: 3, color: col.color, marginBottom: 16 }}>{col.title}</div>
          </Pop>
          {col.items.map((t: string, i: number) => (
            <Pop key={i} delay={12 + c * 6 + i * 8}>
              <div
                style={{
                  display: 'flex',
                  gap: 14,
                  alignItems: 'flex-start',
                  background: 'rgba(255,255,255,0.045)',
                  border: `1px solid ${col.color}33`,
                  borderRadius: 12,
                  padding: '16px 18px',
                  marginBottom: 12,
                }}
              >
                <span style={{ color: col.color, fontFamily: SANS, fontSize: 20, lineHeight: 1.3 }}>{col.mark}</span>
                <span style={{ fontFamily: SANS, fontSize: 21, color: INK, lineHeight: 1.4 }}>{t}</span>
              </div>
            </Pop>
          ))}
        </div>
      ))}
    </div>
  </Body>
)

const IconFlowScene: React.FC<any> = ({ heading, items, to }) => {
  const f = useCurrentFrame()
  const arrow = useIn(14 + items.length * 8)
  const target = useIn(20 + items.length * 8)
  return (
    <Body center>
      {heading && <H text={heading} />}
      <div style={{ display: 'flex', alignItems: 'center', gap: 26, marginTop: 40, flexWrap: 'wrap' }}>
        {items.map((it: any, i: number) => (
          <Pop key={i} delay={8 + i * 8}>
            <div
              style={{
                width: 150,
                textAlign: 'center',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(245,239,230,0.12)',
                borderRadius: 16,
                padding: '22px 12px',
                transform: `translateY(${Math.sin(f / 19 + i * 1.4) * 5}px)`,
              }}
            >
              <div style={{ fontSize: 44 }}>{it.icon}</div>
              <div style={{ fontFamily: SANS, fontSize: 17, color: DIM, marginTop: 10 }}>{it.label}</div>
            </div>
          </Pop>
        ))}
        {to && (
          <>
            <div style={{ fontFamily: SANS, fontSize: 44, color: COPPER, opacity: arrow, transform: `translateX(${(1 - arrow) * -16}px)` }}>→</div>
            <div style={{ opacity: target, transform: `scale(${0.85 + target * 0.15})` }}>
              <div
                style={{
                  width: 190,
                  textAlign: 'center',
                  background: 'rgba(184,112,63,0.16)',
                  border: `1.5px solid ${COPPER_D}`,
                  borderRadius: 16,
                  padding: '26px 14px',
                }}
              >
                <div style={{ fontSize: 50 }}>{to.icon}</div>
                <div style={{ fontFamily: SANS, fontSize: 18, color: INK, marginTop: 10, fontWeight: 700 }}>{to.label}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </Body>
  )
}

const TableScene: React.FC<any> = ({ heading, columns, rows, accentCol }) => (
  <Body>
    <H text={heading} small />
    <div style={{ marginTop: 18, borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(245,239,230,0.12)' }}>
      <div style={{ display: 'flex', background: 'rgba(184,112,63,0.18)' }}>
        {columns.map((c: string, i: number) => (
          <div key={i} style={{ flex: i === 0 ? 1.1 : 2, padding: '13px 20px', fontFamily: SANS, fontSize: 17, fontWeight: 700, letterSpacing: 1, color: COPPER }}>
            {c.toUpperCase()}
          </div>
        ))}
      </div>
      {rows.map((r: string[], ri: number) => {
        const s = useIn(8 + ri * 6)
        return (
          <div
            key={ri}
            style={{
              display: 'flex',
              background: ri % 2 ? 'rgba(255,255,255,0.028)' : 'rgba(255,255,255,0.055)',
              opacity: s,
              transform: `translateX(${(1 - s) * 34}px)`,
            }}
          >
            {r.map((cell, ci) => (
              <div
                key={ci}
                style={{
                  flex: ci === 0 ? 1.1 : 2,
                  padding: '12px 20px',
                  fontFamily: SANS,
                  fontSize: 18.5,
                  lineHeight: 1.35,
                  color: ci === 0 ? (accentCol ? COPPER : INK) : ci === accentCol ? SAGE : 'rgba(245,239,230,0.8)',
                  fontWeight: ci === 0 ? 700 : 400,
                }}
              >
                {cell}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  </Body>
)

const BarsScene: React.FC<any> = ({ heading, bars, caption }) => {
  const frame = useCurrentFrame()
  const max = Math.max(...bars.map((b: any) => b.value))
  return (
    <Body>
      <H text={heading} />
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 70, height: 320, marginTop: 40, paddingLeft: 30 }}>
        {bars.map((b: any, i: number) => {
          const grow = spring({ frame: frame - (10 + i * 10), fps: FPS, config: { damping: 16 } })
          const h = (b.value / max) * 260 * grow
          const shown = Math.round(interpolate(grow, [0, 1], [0, b.value]))
          return (
            <div key={i} style={{ textAlign: 'center', width: 200 }}>
              <div style={{ fontFamily: SERIF, fontSize: 30, color: b.color ?? COPPER, marginBottom: 10, opacity: grow }}>
                {b.display ? b.display.replace('{n}', String(shown.toLocaleString('en-IN'))) : shown}
              </div>
              <div
                style={{
                  height: Math.max(6, h),
                  borderRadius: '10px 10px 4px 4px',
                  background: `linear-gradient(180deg, ${b.color ?? COPPER_D}, ${b.color ?? COPPER_D}88)`,
                  boxShadow: `0 0 30px ${(b.color ?? COPPER_D)}44`,
                }}
              />
              <div style={{ fontFamily: SANS, fontSize: 18, color: DIM, marginTop: 14, lineHeight: 1.3 }}>{b.label}</div>
            </div>
          )
        })}
      </div>
      {caption && (
        <Pop delay={40}>
          <div style={{ fontFamily: SANS, fontSize: 20, color: AMBER, marginTop: 26 }}>{caption}</div>
        </Pop>
      )}
    </Body>
  )
}

const FlowScene: React.FC<any> = ({ heading, nodes, gates, vertical }) => {
  const f = useCurrentFrame()
  return (
  <Body center={!vertical}>
    <H text={heading} small />
    <div
      style={{
        display: 'flex',
        flexDirection: vertical ? 'column' : 'row',
        alignItems: vertical ? 'flex-start' : 'center',
        flexWrap: vertical ? 'nowrap' : 'wrap',
        gap: vertical ? 10 : 6,
        marginTop: 30,
        rowGap: 26,
      }}
    >
      {nodes.map((n: any, i: number) => {
        const s = useIn(8 + i * 7)
        const conn = useIn(12 + i * 7)
        const bob = vertical ? 0 : Math.sin(f / 21 + i * 1.1) * 3.5
        return (
          <React.Fragment key={i}>
            {i > 0 && !vertical && (
              <div style={{ display: 'flex', alignItems: 'center', opacity: conn }}>
                {gates && i % Math.ceil(nodes.length / 3) === 0 ? (
                  <div style={{ width: 16, height: 16, transform: `rotate(45deg) scale(${conn})`, background: AMBER, margin: '0 6px' }} />
                ) : (
                  <div style={{ width: 26, height: 2.5, background: COPPER, transform: `scaleX(${conn})` }} />
                )}
              </div>
            )}
            {i > 0 && vertical && (
              <div style={{ width: 2.5, height: 16, background: COPPER, marginLeft: 30, opacity: conn }} />
            )}
            <div
              style={{
                opacity: s,
                transform: `translateY(${(1 - s) * 20 + bob}px) scale(${0.9 + s * 0.1})`,
                background: `${n.color ?? '#5a4634'}${n.color ? '33' : ''}`,
                backgroundColor: n.color ? `${n.color}2e` : 'rgba(255,255,255,0.06)',
                border: `1.5px solid ${n.color ?? 'rgba(200,130,85,0.55)'}`,
                borderRadius: 14,
                padding: vertical ? '12px 22px' : '16px 20px',
                minWidth: vertical ? 420 : 118,
                textAlign: vertical ? 'left' : 'center',
              }}
            >
              <div style={{ fontFamily: SANS, fontSize: 14, color: n.color ?? COPPER, fontWeight: 700, letterSpacing: 1 }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 19, color: INK, marginTop: 4, lineHeight: 1.25 }}>{n.label}</div>
              {n.sub && <div style={{ fontFamily: SANS, fontSize: 15, color: DIM, marginTop: 4 }}>{n.sub}</div>}
            </div>
          </React.Fragment>
        )
      })}
    </div>
  </Body>
  )
}

const StatsScene: React.FC<any> = ({ heading, stats, caption }) => {
  const frame = useCurrentFrame()
  return (
    <Body center>
      {heading && <H text={heading} />}
      <div style={{ display: 'flex', gap: 26, marginTop: 36 }}>
        {stats.map((st: any, i: number) => {
          const s = useIn(8 + i * 9)
          const isNum = typeof st.value === 'number'
          const n = isNum ? Math.round(interpolate(frame, [8 + i * 9, 42 + i * 9], [0, st.value], { extrapolateRight: 'clamp' })) : st.value
          return (
            <div
              key={i}
              style={{
                flex: 1,
                opacity: s,
                transform: `translateY(${(1 - s) * 30}px)`,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(245,239,230,0.12)',
                borderRadius: 18,
                padding: '34px 22px',
                textAlign: 'center',
                minWidth: 200,
              }}
            >
              <div style={{ fontFamily: SERIF, fontSize: 62, color: COPPER, lineHeight: 1 }}>
                {n}
                {st.suffix && <span style={{ fontSize: 30 }}>{st.suffix}</span>}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 18, color: DIM, marginTop: 12, lineHeight: 1.35 }}>{st.label}</div>
            </div>
          )
        })}
      </div>
      {caption && (
        <Pop delay={44}>
          <div style={{ fontFamily: SANS, fontSize: 20, color: DIM, marginTop: 30, textAlign: 'center' }}>{caption}</div>
        </Pop>
      )}
    </Body>
  )
}

const CardsScene: React.FC<any> = ({ heading, cards }) => (
  <Body>
    <H text={heading} small />
    <div style={{ display: 'flex', gap: 22, marginTop: 26, flexWrap: 'wrap' }}>
      {cards.map((c: any, i: number) => (
        <Pop key={i} delay={8 + i * 9} style={{ flex: 1, minWidth: 300 }}>
          <div
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(245,239,230,0.13)',
              borderTop: `3px solid ${c.color ?? COPPER_D}`,
              borderRadius: 16,
              padding: '22px 24px',
              height: '100%',
            }}
          >
            {c.icon && <div style={{ fontSize: 34, marginBottom: 10 }}>{c.icon}</div>}
            <div style={{ fontFamily: SERIF, fontSize: 25, color: INK, marginBottom: 10 }}>{c.title}</div>
            {(c.lines ?? []).map((l: string, j: number) => (
              <div key={j} style={{ fontFamily: SANS, fontSize: 18.5, color: 'rgba(245,239,230,0.75)', lineHeight: 1.5, marginBottom: 6 }}>
                {l}
              </div>
            ))}
          </div>
        </Pop>
      ))}
    </div>
  </Body>
)

const ChecklistScene: React.FC<any> = ({ heading, items }) => (
  <Body>
    <H text={heading} small />
    <div style={{ marginTop: 22, maxWidth: 1000 }}>
      {items.map((t: string, i: number) => {
        const s = useIn(8 + i * 8)
        return (
          <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 16, opacity: s, transform: `translateX(${(1 - s) * 30}px)` }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                background: `rgba(157,177,143,${0.15 + s * 0.15})`,
                border: `1.5px solid ${SAGE}`,
                color: SAGE,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 17,
                flexShrink: 0,
                marginTop: 2,
              }}
            >
              ✓
            </div>
            <div style={{ fontFamily: SANS, fontSize: 22, color: INK, lineHeight: 1.45 }}>{t}</div>
          </div>
        )
      })}
    </div>
  </Body>
)

const SwapScene: React.FC<any> = ({ heading, rows }) => (
  <Body>
    <H text={heading} small />
    <div style={{ marginTop: 20 }}>
      {rows.map((r: any, i: number) => {
        const s = useIn(8 + i * 8)
        const flip = useIn(16 + i * 8)
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 13, opacity: s }}>
            <div
              style={{
                flex: 1,
                fontFamily: SANS,
                fontSize: 20,
                color: RED,
                textDecoration: `line-through rgba(217,118,98,${flip})`,
                background: 'rgba(217,118,98,0.08)',
                border: '1px solid rgba(217,118,98,0.3)',
                borderRadius: 10,
                padding: '11px 18px',
              }}
            >
              {r.from}
            </div>
            <div style={{ fontFamily: SANS, fontSize: 26, color: COPPER, opacity: flip, transform: `translateX(${(1 - flip) * -10}px)` }}>→</div>
            <div
              style={{
                flex: 1.4,
                fontFamily: SANS,
                fontSize: 20,
                color: SAGE,
                background: 'rgba(157,177,143,0.08)',
                border: '1px solid rgba(157,177,143,0.3)',
                borderRadius: 10,
                padding: '11px 18px',
                opacity: flip,
                transform: `translateX(${(1 - flip) * 20}px)`,
              }}
            >
              {r.to}
            </div>
          </div>
        )
      })}
    </div>
  </Body>
)

const WarningScene: React.FC<any> = ({ label, text, heading }) => {
  const frame = useCurrentFrame()
  const pulse = 0.35 + 0.25 * Math.sin(frame / 9)
  const s = useIn(6)
  return (
    <Body center>
      {heading && <H text={heading} />}
      <div
        style={{
          marginTop: 20,
          maxWidth: 980,
          border: `2px solid rgba(224,160,74,${pulse + 0.3})`,
          boxShadow: `0 0 ${30 * pulse + 10}px rgba(224,160,74,0.25)`,
          background: 'rgba(224,160,74,0.08)',
          borderRadius: 18,
          padding: '30px 36px',
          opacity: s,
          transform: `translateY(${(1 - s) * 24}px)`,
        }}
      >
        <div style={{ fontFamily: SANS, fontSize: 17, letterSpacing: 3, color: AMBER, fontWeight: 700, marginBottom: 14 }}>
          ⚠ {label}
        </div>
        <div style={{ fontFamily: SANS, fontSize: 23, color: INK, lineHeight: 1.55 }}>{text}</div>
      </div>
    </Body>
  )
}

const PillsScene: React.FC<any> = ({ heading, items }) => (
  <Body>
    <H text={heading} small />
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginTop: 24 }}>
      {items.map((it: any, i: number) => {
        const s = useIn(6 + i * 5)
        const open = it.status.toLowerCase() === 'open'
        return (
          <div
            key={i}
            style={{
              opacity: s,
              transform: `scale(${0.92 + s * 0.08})`,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(245,239,230,0.12)',
              borderRadius: 14,
              padding: '16px 18px',
            }}
          >
            <div style={{ fontFamily: SANS, fontSize: 20, color: INK, fontWeight: 700 }}>{it.name}</div>
            <div
              style={{
                display: 'inline-block',
                marginTop: 8,
                fontFamily: SANS,
                fontSize: 14,
                letterSpacing: 1,
                color: open ? SAGE : AMBER,
                background: open ? 'rgba(157,177,143,0.12)' : 'rgba(224,160,74,0.12)',
                border: `1px solid ${open ? SAGE : AMBER}55`,
                borderRadius: 999,
                padding: '3px 12px',
              }}
            >
              {it.status.toUpperCase()}
            </div>
          </div>
        )
      })}
    </div>
  </Body>
)

const SCENE_MAP: Record<string, React.FC<any>> = {
  title: TitleScene,
  quote: QuoteScene,
  timeline: TimelineScene,
  dodont: DoDontScene,
  iconflow: IconFlowScene,
  table: TableScene,
  bars: BarsScene,
  flow: FlowScene,
  stats: StatsScene,
  cards: CardsScene,
  checklist: ChecklistScene,
  swap: SwapScene,
  warning: WarningScene,
  pills: PillsScene,
}

/* ── the composition ──────────────────────────────────────────────────── */
export const SalesModuleVideo: React.FC<ModuleProps> = (mod) => {
  const { fps } = useVideoConfig()
  let from = 0
  return (
    <AbsoluteFill>
      <Backdrop />
      {mod.scenes.map((sc, i) => {
        const frames = Math.round((sc.dur + PAD_S) * fps)
        const seq = (
          <Sequence key={i} from={from} durationInFrames={frames}>
            <SceneTransition frames={frames} idx={i}>
              {React.createElement(SCENE_MAP[sc.type] ?? TitleScene, sc.props)}
              <Chrome mod={mod} idx={i} total={mod.scenes.length} />
            </SceneTransition>
            {/* the storyteller rides above every scene, talking through the
                narration and idling in the pad */}
            <Storyteller talkEnd={sc.dur} />
          </Sequence>
        )
        from += frames
        return seq
      })}
    </AbsoluteFill>
  )
}

/** Directional scene transitions — alternating slide/rise + fade. */
const SceneTransition: React.FC<{ frames: number; idx: number; children: React.ReactNode }> = ({
  frames,
  idx,
  children,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const enter = spring({ frame, fps, config: { damping: 18, mass: 0.8 } })
  const opacity = interpolate(frame, [0, 10, frames - 12, frames - 1], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const dir = idx % 3 // 0: rise, 1: slide from right, 2: slide from left
  const x = dir === 1 ? (1 - enter) * 90 : dir === 2 ? (1 - enter) * -90 : 0
  const y = dir === 0 ? (1 - enter) * 60 : 0
  const exitScale = interpolate(frame, [frames - 12, frames - 1], [1, 0.985], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  return (
    <AbsoluteFill style={{ opacity, transform: `translate(${x}px, ${y}px) scale(${exitScale})` }}>
      {children}
    </AbsoluteFill>
  )
}
