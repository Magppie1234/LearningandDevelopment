import React from 'react'
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'
import * as Lucide from 'lucide-react'

/** Professional line icons (the portal's own icon set). `name` is a Lucide
 *  export; anything unrecognized falls back to rendering as plain text. */
const Icon: React.FC<{ name?: string; size?: number; color?: string }> = ({ name, size = 40, color }) => {
  if (!name) return null
  const C = (Lucide as any)[name]
  if (C && (typeof C === 'function' || typeof C === 'object')) {
    return <C size={size} color={color ?? '#C88255'} strokeWidth={1.6} />
  }
  return <span style={{ fontSize: size }}>{name}</span>
}

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
      {/* slow-rotating conic sheen — a barely-there studio light */}
      <AbsoluteFill
        style={{
          background: `conic-gradient(from ${f / 4}deg at 78% 22%, transparent 0deg, rgba(200,130,85,0.05) 40deg, transparent 90deg, rgba(157,177,143,0.03) 200deg, transparent 260deg)`,
        }}
      />
      {/* drifting blueprint grid, very faint */}
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(245,239,230,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(245,239,230,0.022) 1px, transparent 1px)',
          backgroundSize: '90px 90px',
          backgroundPosition: `${-f * 0.18}px ${-f * 0.1}px`,
        }}
      />
      {/* fine grain vignette */}
      <AbsoluteFill style={{ boxShadow: 'inset 0 0 220px rgba(0,0,0,0.55)' }} />
    </AbsoluteFill>
  )
}

/* ── live narration waveform — a discreet equalizer in the footer that
   pulses while the voiceover plays, then settles flat. */
const VoiceWave: React.FC<{ talkEnd: number }> = ({ talkEnd }) => {
  const f = useCurrentFrame()
  const talking = f / FPS < talkEnd
  return (
    <div style={{ position: 'absolute', bottom: 38, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 3.5, height: 20 }}>
      {Array.from({ length: 9 }, (_, i) => {
        const h = talking
          ? 4 + 13 * Math.abs(Math.sin(f / (5 + (i % 4) * 1.3) + i * 1.8) * Math.sin(f / 17 + i))
          : 3
        return (
          <div
            key={i}
            style={{
              width: 3,
              height: h,
              borderRadius: 2,
              background: talking ? `rgba(200,130,85,${0.5 + 0.4 * Math.abs(Math.sin(f / 13 + i))})` : 'rgba(245,239,230,0.18)',
            }}
          />
        )
      })}
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
      padding: '124px 90px 96px 64px',
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
  const f = useCurrentFrame()
  // a light dot pings along the underline every few seconds
  const ping = ((f - 30) % 110) / 110
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
      <div style={{ position: 'relative', width: 64 * s, height: 3, background: COPPER_D, marginTop: 14 }}>
        {f > 30 && ping >= 0 && ping < 0.35 && (
          <div
            style={{
              position: 'absolute',
              left: `${(ping / 0.35) * 100}%`,
              top: -1.5,
              width: 10,
              height: 6,
              borderRadius: 3,
              background: 'rgba(245,239,230,0.9)',
              filter: 'blur(1px)',
              opacity: Math.sin((ping / 0.35) * Math.PI),
            }}
          />
        )}
      </div>
    </div>
  )
}

/* ── scenes ───────────────────────────────────────────────────────────── */

const TitleScene: React.FC<any> = ({ title, subtitle, kicker }) => {
  const s1 = useIn(4)
  const s2 = useIn(14)
  const f = useCurrentFrame()
  const words = String(title).split(' ')
  return (
    <Body center>
      {kicker && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18, opacity: s1 }}>
          <div style={{ width: 34 * s1, height: 2, background: COPPER }} />
          <div style={{ fontFamily: SANS, fontSize: 18, letterSpacing: 4 + (1 - s1) * 6, color: COPPER }}>
            {kicker.toUpperCase()}
          </div>
        </div>
      )}
      {/* words cascade in one by one */}
      <div style={{ fontFamily: SERIF, fontSize: 64, lineHeight: 1.08, color: INK, maxWidth: 1050 }}>
        {words.map((w, i) => {
          const ws = spring({ frame: f - (6 + i * 3), fps: FPS, config: { damping: 15, mass: 0.6 } })
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                marginRight: '0.26em',
                opacity: ws,
                transform: `translateY(${(1 - ws) * 34}px) rotate(${(1 - ws) * 2}deg)`,
              }}
            >
              {w}
            </span>
          )
        })}
      </div>
      {subtitle && (
        <div style={{ fontFamily: SANS, fontSize: 24, color: DIM, marginTop: 22, maxWidth: 900, lineHeight: 1.5, opacity: s2, transform: `translateY(${(1 - s2) * 20}px)` }}>
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
  const mark = useIn(2, 10)
  return (
    <Body center>
      {/* oversized ghost quotation mark drifting behind the text */}
      <div
        style={{
          position: 'absolute',
          top: 96,
          left: 34,
          fontFamily: SERIF,
          fontSize: 300,
          lineHeight: 1,
          color: `rgba(200,130,85,${0.09 * mark})`,
          transform: `scale(${0.7 + mark * 0.3}) translateY(${Math.sin(frame / 40) * 6}px)`,
        }}
      >
        “
      </div>
      {heading && <H text={heading} small />}
      <div style={{ display: 'flex', gap: 26, marginTop: heading ? 16 : 0 }}>
        <div
          style={{
            width: 5,
            background: COPPER_D,
            borderRadius: 3,
            transform: `scaleY(${bar})`,
            transformOrigin: 'top',
            boxShadow: `0 0 ${10 + 8 * Math.abs(Math.sin(frame / 14))}px rgba(200,130,85,0.5)`,
          }}
        />
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
                <div style={{ position: 'relative', width: 110, height: 3, background: `rgba(200,130,85,${s * 0.7})`, transform: `scaleX(${s})` }}>
                  {/* spark travelling along the connector */}
                  <div
                    style={{
                      position: 'absolute',
                      left: `${((frame * 1.6 + i * 40) % 130) - 10}%`,
                      top: -2,
                      width: 12,
                      height: 7,
                      borderRadius: 4,
                      background: 'rgba(245,239,230,0.85)',
                      filter: 'blur(1.5px)',
                      opacity: s * 0.8,
                    }}
                  />
                </div>
              )}
              <div style={{ position: 'relative', textAlign: 'center', opacity: s, transform: `scale(${0.8 + s * 0.2}) translateY(${Math.sin(frame / 26 + i * 2) * 4}px)` }}>
                {/* breathing halo behind each number */}
                <div
                  style={{
                    position: 'absolute',
                    inset: '-28px -20px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, rgba(200,130,85,${0.10 + 0.05 * Math.sin(frame / 18 + i)}), transparent 68%)`,
                  }}
                />
                <div style={{ position: 'relative', fontFamily: SERIF, fontSize: 84, color: COPPER, lineHeight: 1 }}>
                  {n}
                  <span style={{ fontSize: 44 }}>+</span>
                </div>
                <div style={{ position: 'relative', fontFamily: SANS, fontSize: 19, color: DIM, marginTop: 10, maxWidth: 200 }}>{it.label}</div>
              </div>
            </React.Fragment>
          )
        })}
      </div>
    </Body>
  )
}

const DoDontScene: React.FC<any> = ({ heading, dont, dos }) => {
  const f = useCurrentFrame()
  return (
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
            {col.items.map((t: string, i: number) => {
              const markIn = useIn(18 + c * 6 + i * 8, 9)
              return (
                <Pop key={i} delay={12 + c * 6 + i * 8}>
                  <div
                    style={{
                      display: 'flex',
                      gap: 14,
                      alignItems: 'flex-start',
                      background: 'rgba(255,255,255,0.045)',
                      border: `1px solid ${col.color}${Math.round(32 + 24 * Math.abs(Math.sin(f / 22 + i))).toString(16)}`,
                      borderRadius: 12,
                      padding: '16px 18px',
                      marginBottom: 12,
                    }}
                  >
                    <span
                      style={{
                        color: col.color,
                        fontFamily: SANS,
                        fontSize: 20,
                        lineHeight: 1.3,
                        display: 'inline-block',
                        transform: `scale(${0.4 + markIn * 0.6}) rotate(${(1 - markIn) * (c === 0 ? -90 : 90)}deg)`,
                        opacity: markIn,
                      }}
                    >
                      {col.mark}
                    </span>
                    <span style={{ fontFamily: SANS, fontSize: 21, color: INK, lineHeight: 1.4 }}>{t}</span>
                  </div>
                </Pop>
              )
            })}
          </div>
        ))}
      </div>
    </Body>
  )
}

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
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Icon name={it.icon} size={42} color="rgba(245,239,230,0.85)" />
              </div>
              <div style={{ fontFamily: SANS, fontSize: 17, color: DIM, marginTop: 12 }}>{it.label}</div>
            </div>
          </Pop>
        ))}
        {to && (
          <>
            <div style={{ fontFamily: SANS, fontSize: 44, color: COPPER, opacity: arrow, transform: `translateX(${(1 - arrow) * -16 + Math.sin(f / 11) * 4}px)` }}>→</div>
            <div style={{ opacity: target, transform: `scale(${0.85 + target * 0.15 + Math.sin(f / 20) * 0.012})` }}>
              <div
                style={{
                  width: 190,
                  textAlign: 'center',
                  background: 'rgba(184,112,63,0.16)',
                  border: `1.5px solid ${COPPER_D}`,
                  borderRadius: 16,
                  padding: '26px 14px',
                  boxShadow: `0 0 ${16 + 12 * Math.abs(Math.sin(f / 15))}px rgba(184,112,63,0.30)`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Icon name={to.icon} size={48} />
                </div>
                <div style={{ fontFamily: SANS, fontSize: 18, color: INK, marginTop: 12, fontWeight: 700 }}>{to.label}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </Body>
  )
}

const TableScene: React.FC<any> = ({ heading, columns, rows, accentCol }) => {
  const f = useCurrentFrame()
  const scanY = ((f * 1.1) % 160) / 100 // scanning light passes down the table
  return (
  <Body>
    <H text={heading} small />
    <div style={{ position: 'relative', marginTop: 18, borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(245,239,230,0.12)' }}>
      {/* soft scan light drifting down the rows */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: `${scanY * 100}%`,
          height: 46,
          background: 'linear-gradient(180deg, transparent, rgba(200,130,85,0.07), transparent)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />
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
}

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
                  position: 'relative',
                  height: Math.max(6, h),
                  borderRadius: '10px 10px 4px 4px',
                  background: `linear-gradient(180deg, ${b.color ?? COPPER_D}, ${b.color ?? COPPER_D}88)`,
                  boxShadow: `0 0 ${26 + 10 * Math.abs(Math.sin(frame / 16 + i))}px ${(b.color ?? COPPER_D)}44`,
                  overflow: 'hidden',
                }}
              >
                {/* gloss shine sweeping up the bar after it grows */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: `${100 - (((frame * 1.4 + i * 45) % 170) / 170) * 130}%`,
                    height: 34,
                    background: 'linear-gradient(180deg, transparent, rgba(245,239,230,0.28), transparent)',
                    opacity: grow,
                  }}
                />
              </div>
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
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      transform: `rotate(${45 + Math.sin(f / 15 + i) * 10}deg) scale(${conn})`,
                      background: AMBER,
                      margin: '0 6px',
                      boxShadow: `0 0 ${8 + 6 * Math.abs(Math.sin(f / 12 + i))}px rgba(224,160,74,0.6)`,
                    }}
                  />
                ) : (
                  <div style={{ position: 'relative', width: 26, height: 2.5, background: COPPER, transform: `scaleX(${conn})` }}>
                    {/* pulse dot travelling node to node */}
                    <div
                      style={{
                        position: 'absolute',
                        left: `${((f * 3 + i * 37) % 120) - 10}%`,
                        top: -2.2,
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: 'rgba(245,239,230,0.9)',
                        filter: 'blur(0.8px)',
                      }}
                    />
                  </div>
                )}
              </div>
            )}
            {i > 0 && vertical && (
              <div style={{ position: 'relative', width: 2.5, height: 16, background: COPPER, marginLeft: 30, opacity: conn }}>
                <div
                  style={{
                    position: 'absolute',
                    top: `${((f * 4 + i * 30) % 120) - 10}%`,
                    left: -2,
                    width: 6.5,
                    height: 6.5,
                    borderRadius: '50%',
                    background: 'rgba(245,239,230,0.9)',
                    filter: 'blur(0.8px)',
                  }}
                />
              </div>
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
                transform: `translateY(${(1 - s) * 30 + Math.sin(frame / 24 + i * 1.7) * 4}px)`,
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid rgba(245,239,230,${0.1 + 0.07 * Math.abs(Math.sin(frame / 20 + i))})`,
                borderRadius: 18,
                padding: '34px 22px',
                textAlign: 'center',
                minWidth: 200,
                boxShadow: `0 ${6 + Math.sin(frame / 24 + i * 1.7) * 3}px 26px rgba(0,0,0,0.28)`,
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

const CardsScene: React.FC<any> = ({ heading, cards }) => {
  const f = useCurrentFrame()
  return (
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
              transform: `translateY(${Math.sin(f / 23 + i * 1.9) * 4}px)`,
              boxShadow: `0 ${8 + Math.sin(f / 23 + i * 1.9) * 3}px 24px rgba(0,0,0,0.25)`,
            }}
          >
            {c.icon && (
              <div style={{ marginBottom: 12, display: 'inline-block', transform: `rotate(${Math.sin(f / 17 + i * 2.3) * 6}deg)` }}>
                <Icon name={c.icon} size={30} color={c.color ?? COPPER} />
              </div>
            )}
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
}

const ChecklistScene: React.FC<any> = ({ heading, items }) => {
  const f = useCurrentFrame()
  return (
  <Body>
    <H text={heading} small />
    <div style={{ marginTop: 22, maxWidth: 1050 }}>
      {items.map((t: string, i: number) => {
        const s = useIn(8 + i * 8)
        const tick = useIn(14 + i * 8, 9)
        return (
          <div key={i} style={{ position: 'relative', display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 16, opacity: s, transform: `translateX(${(1 - s) * 30}px)` }}>
            {/* sweep highlight passing behind the row as it lands */}
            <div
              style={{
                position: 'absolute',
                left: -12,
                top: -4,
                bottom: -4,
                width: `${Math.min(1, tick) * 100}%`,
                borderRadius: 8,
                background: `linear-gradient(90deg, rgba(157,177,143,${0.10 * (1 - tick * 0.7)}), transparent)`,
              }}
            />
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
                transform: `scale(${0.3 + tick * 0.7}) rotate(${(1 - tick) * -80}deg)`,
                boxShadow: `0 0 ${6 + 5 * Math.abs(Math.sin(f / 19 + i))}px rgba(157,177,143,0.35)`,
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
}

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
            <div style={{ fontFamily: SANS, fontSize: 26, color: COPPER, opacity: flip, transform: `translateX(${(1 - flip) * -10 + Math.sin(useCurrentFrame() / 12 + i) * 3}px)` }}>→</div>
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

const PillsScene: React.FC<any> = ({ heading, items }) => {
  const f = useCurrentFrame()
  return (
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
              transform: `scale(${0.92 + s * 0.08}) translateY(${Math.sin(f / 25 + i * 1.3) * 3}px)`,
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
}

/** "Key notes" — a ruled notebook page on the dark canvas; each note writes
 *  itself in with a copper highlighter sweep, like revision notes being read. */
const NotesScene: React.FC<any> = ({ heading = 'Key notes', items }) => {
  const paper = useIn(4)
  const f = useCurrentFrame()
  const LINE_H = 52
  return (
    <Body center>
      <div
        style={{
          width: 1010,
          background: '#F1EAD9',
          borderRadius: 14,
          padding: '30px 42px 34px 86px',
          position: 'relative',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
          opacity: paper,
          transform: `translateY(${(1 - paper) * 40}px) rotate(${(1 - paper) * 1.2 - 0.4}deg)`,
          backgroundImage: `repeating-linear-gradient(transparent, transparent ${LINE_H - 1}px, rgba(43,36,32,0.10) ${LINE_H - 1}px, rgba(43,36,32,0.10) ${LINE_H}px)`,
          backgroundPositionY: 76,
        }}
      >
        {/* red margin rule + spiral holes */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 62, width: 2, background: 'rgba(217,118,98,0.45)' }} />
        {Array.from({ length: 7 }, (_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 24,
              top: 44 + i * 58,
              width: 13,
              height: 13,
              borderRadius: '50%',
              background: '#241E1A',
              boxShadow: 'inset 0 2px 3px rgba(0,0,0,0.65)',
            }}
          />
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{ display: 'inline-block', transform: `rotate(${Math.sin(f / 9) * 7}deg)`, transformOrigin: '20% 90%' }}>
            <Icon name="NotebookPen" size={30} color="#B8703F" />
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 30, color: '#2B2420', fontWeight: 700 }}>{heading}</div>
        </div>
        {items.map((t: string, i: number) => {
          const s = useIn(14 + i * 14, 16)
          const hl = useIn(20 + i * 14, 20)
          return (
            <div key={i} style={{ position: 'relative', minHeight: LINE_H, display: 'flex', alignItems: 'center' }}>
              {/* highlighter sweep behind the text */}
              <div
                style={{
                  position: 'absolute',
                  left: -8,
                  right: undefined,
                  width: `${hl * 100}%`,
                  maxWidth: '100%',
                  height: 30,
                  borderRadius: 4,
                  background: 'rgba(224,160,74,0.28)',
                }}
              />
              <div
                style={{
                  position: 'relative',
                  fontFamily: SERIF,
                  fontStyle: 'italic',
                  fontSize: 22.5,
                  color: '#2B2420',
                  lineHeight: 1.3,
                  opacity: s,
                  transform: `translateX(${(1 - s) * 24}px)`,
                }}
              >
                <span style={{ color: '#B8703F', fontStyle: 'normal', fontWeight: 700, marginRight: 12 }}>{i + 1}.</span>
                {t}
              </div>
            </div>
          )
        })}
      </div>
    </Body>
  )
}

const SCENE_MAP: Record<string, React.FC<any>> = {
  notes: NotesScene,
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
            {/* discreet equalizer pulsing with the narration */}
            <VoiceWave talkEnd={sc.dur} />
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
