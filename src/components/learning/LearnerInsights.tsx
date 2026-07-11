'use client'

import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Gauge,
  ClipboardList,
  Target,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react'
import { formatDuration, type ModuleProgressRow, type InsightSummaryRow } from '@/lib/learning-dashboard-client'
import { computeLearnerInsights } from '@/lib/learner-insights'

/**
 * Insight-first learner analytics — a decision tool, not just charts. Every
 * block answers "so what" and, where relevant, "do this next". Derived entirely
 * from the learner's real/demo rows. Renders only once there's ≥1 attempt.
 */

const TREND = {
  improving: { label: 'Improving', color: 'var(--status-ontrack)', icon: TrendingUp },
  plateaued: { label: 'Plateaued', color: 'var(--status-risk)', icon: Minus },
  declining: { label: 'Declining', color: 'var(--status-overdue)', icon: TrendingDown },
} as const

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-[12px] border border-white/10 bg-stone-espresso p-3">
      <p className="text-lg font-bold text-stone-ivory tabular-nums leading-tight">{value}</p>
      <p className="text-[10px] font-medium uppercase tracking-wide text-stone-ivory/45 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-stone-ivory/40 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function LearnerInsights({
  progress,
  insights,
}: {
  progress: ModuleProgressRow[]
  insights: InsightSummaryRow[]
}) {
  const d = computeLearnerInsights(progress, insights)
  if (d.attempted === 0) return null

  const tMeta = d.trend ? TREND[d.trend] : null
  const alertIcon = { good: CheckCircle2, warn: AlertTriangle, risk: AlertTriangle } as const
  const alertColor = {
    good: 'var(--status-ontrack)',
    warn: 'var(--status-risk)',
    risk: 'var(--status-overdue)',
  } as const

  return (
    <div className="space-y-3">
      {/* AI Insights + the single recommended action */}
      <div className="rounded-2xl border border-white/10 bg-stone-espresso p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-accent-copper" />
          <h3 className="text-sm font-semibold text-stone-ivory">AI insights</h3>
          {tMeta && (
            <span
              className="ml-auto inline-flex items-center gap-1 text-[12px] font-semibold"
              style={{ color: tMeta.color }}
            >
              <tMeta.icon size={13} />
              {tMeta.label}
            </span>
          )}
        </div>
        <ul className="space-y-1.5">
          {d.insights.map((line, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px] text-stone-ivory/75">
              <Info size={13} className="mt-0.5 shrink-0 text-stone-ivory/35" />
              {line}
            </li>
          ))}
        </ul>
        {d.recommendation && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-accent-copper/10 border border-accent-copper/30 px-3 py-2">
            <Lightbulb size={15} className="mt-0.5 shrink-0 text-accent-copper" />
            <p className="text-[13px] text-stone-ivory">
              <span className="font-semibold text-accent-copper">Do next:</span> {d.recommendation}
            </p>
          </div>
        )}
      </div>

      {/* Score summary + readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3">
        <div className="rounded-2xl border border-white/10 bg-stone-espresso p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target size={15} className="text-stone-ivory/50" />
            <h3 className="text-sm font-semibold text-stone-ivory">Score summary</h3>
            {d.vsPassStandard != null && (
              <span
                className="ml-auto text-[12px] font-semibold"
                style={{ color: d.vsPassStandard >= 0 ? 'var(--status-ontrack)' : 'var(--status-overdue)' }}
              >
                {d.vsPassStandard >= 0 ? '+' : ''}
                {d.vsPassStandard}% vs {d.passStandard}% pass mark
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Tile label="Best" value={d.bestScore != null ? `${d.bestScore}%` : '—'} />
            <Tile label="Average" value={d.avgScore != null ? `${d.avgScore}%` : '—'} />
            <Tile label="Lowest" value={d.lowScore != null ? `${d.lowScore}%` : '—'} />
            <Tile label="Pass rate" value={`${d.passRate}%`} />
          </div>
        </div>

        {/* Readiness meter */}
        <div className="rounded-2xl border border-white/10 bg-stone-espresso p-5 flex items-center gap-4 min-w-[220px]">
          <Ring value={d.readiness} />
          <div>
            <div className="flex items-center gap-1.5">
              <Gauge size={14} className="text-stone-ivory/50" />
              <p className="text-sm font-semibold text-stone-ivory">Readiness</p>
            </div>
            <p className="text-[12px] text-stone-ivory/55 mt-1 max-w-[150px]">
              {d.readiness >= 80
                ? 'Certification-ready on current performance.'
                : `${80 - d.readiness}% to certification readiness.`}
            </p>
          </div>
        </div>
      </div>

      {/* Test analytics */}
      <div className="rounded-2xl border border-white/10 bg-stone-espresso p-5">
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList size={15} className="text-stone-ivory/50" />
          <h3 className="text-sm font-semibold text-stone-ivory">Test analytics</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <Tile label="Tests taken" value={String(d.totalAttempts)} />
          <Tile label="Passed" value={String(d.passed)} />
          <Tile label="Failed" value={String(d.failed)} />
          <Tile label="Retaken" value={String(d.retaken)} />
          <Tile label="Avg tries / pass" value={d.avgAttemptsToPass != null ? String(d.avgAttemptsToPass) : '—'} />
          <Tile label="Avg time / module" value={d.avgTimeSeconds != null ? formatDuration(d.avgTimeSeconds) : '—'} />
        </div>
      </div>

      {/* Weak topics to revise */}
      {d.weakTopics.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-stone-espresso p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target size={15} style={{ color: '#e0a04a' }} />
            <h3 className="text-sm font-semibold text-stone-ivory">Topics to revise</h3>
          </div>
          <div className="space-y-2">
            {d.weakTopics.slice(0, 4).map((w) => (
              <div key={w.topic} className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.04] px-3 py-2">
                <span className="text-[13px] text-stone-ivory">{w.topic}</span>
                <span className="text-[12px] text-stone-ivory/55">
                  weak in {w.count} module{w.count === 1 ? '' : 's'} · revise ~2h
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Smart alerts */}
      {d.alerts.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-stone-espresso p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={15} className="text-stone-ivory/50" />
            <h3 className="text-sm font-semibold text-stone-ivory">Smart alerts</h3>
          </div>
          <div className="space-y-1.5">
            {d.alerts.map((a, i) => {
              const Icon = alertIcon[a.level]
              return (
                <div key={i} className="flex items-center gap-2 text-[13px] text-stone-ivory/80">
                  <Icon size={14} className="shrink-0" style={{ color: alertColor[a.level] }} />
                  {a.text}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function Ring({ value }: { value: number }) {
  const size = 64
  const sw = 7
  const r = (size - sw) / 2
  const c = 2 * Math.PI * r
  const color = value >= 80 ? 'var(--status-ontrack)' : value >= 55 ? 'var(--status-risk)' : 'var(--status-overdue)'
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(245,239,230,0.12)" strokeWidth={sw} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (value / 100) * c}
          style={{ transition: 'stroke-dashoffset 0.9s ease-out' }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-stone-ivory tabular-nums">
        {value}
      </span>
    </div>
  )
}
