'use client'

import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

/**
 * Thin Recharts wrapper switched by `chartType`. Colours come from the theme
 * CSS variables (copper primary, silver secondary, ink for quiet series) so
 * both light and dark "Warm Stone" modes render correctly — same pattern as
 * Analytics.tsx, kept minimal.
 */

const SERIES_COLORS = [
  'rgb(var(--m-accent-copper))',
  'rgb(var(--m-accent-silver))',
  'rgba(0,59,70,0.35)',
  'var(--status-ontrack)',
  'var(--status-risk)',
]

function ChartTooltip({
  active,
  payload,
  unit,
}: {
  active?: boolean
  payload?: { name?: string; value?: number; payload?: { label: string } }[]
  unit?: string
}) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div className="rounded-[8px] border-[0.5px] border-[rgba(0,59,70,0.14)] bg-cream px-2.5 py-1.5 shadow-card">
      <p className="text-[11px] text-ink-tertiary">{p.payload?.label}</p>
      <p className="text-[13px] font-semibold text-ink-primary tabular-nums">
        {p.value?.toLocaleString('en-IN')}
        {unit ? ` ${unit}` : ''}
      </p>
    </div>
  )
}

export default function DataChart({
  chartType,
  data,
  unit,
}: {
  chartType: 'bar' | 'pie' | 'line'
  data: { label: string; value: number }[]
  unit?: string
}) {
  if (chartType === 'pie') {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <ResponsiveContainer width="100%" height={200} className="max-w-[240px]">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={48}
              outerRadius={80}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={SERIES_COLORS[i % SERIES_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip unit={unit} />} />
          </PieChart>
        </ResponsiveContainer>
        <ul className="space-y-1.5">
          {data.map((d, i) => (
            <li key={d.label} className="flex items-center gap-2 text-[12.5px] text-ink-secondary">
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: SERIES_COLORS[i % SERIES_COLORS.length] }}
              />
              <span className="font-semibold text-ink-primary tabular-nums">{d.value}%</span>
              {d.label}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (chartType === 'line') {
    return (
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: 'rgb(var(--m-ink-tertiary))' }}
            axisLine={{ stroke: 'rgba(0,59,70,0.14)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'rgb(var(--m-ink-tertiary))' }}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip content={<ChartTooltip unit={unit} />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="rgb(var(--m-accent-copper))"
            strokeWidth={2}
            dot={{ r: 3, fill: 'rgb(var(--m-accent-copper))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(120, data.length * 44 + 24)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: 'rgb(var(--m-ink-tertiary))' }}
          axisLine={{ stroke: 'rgba(0,59,70,0.14)' }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={168}
          tick={{ fontSize: 11.5, fill: 'rgb(var(--m-ink-secondary))' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ fill: 'rgba(0,59,70,0.04)' }} />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={18}>
          {data.map((_, i) => (
            <Cell key={i} fill={i === 0 ? 'rgb(var(--m-accent-copper))' : 'rgb(var(--m-accent-silver))'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
