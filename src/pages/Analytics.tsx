'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import SkillGapHeatmap from '@/components/SkillGapHeatmap';
import SuccessionPanel from '@/components/SuccessionPanel';
import { BdDiagnosticManagerPanel } from '@/components/BdDiagnostic';
import { ReadinessAdminPanel } from '@/components/ReadinessCheck';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Award,
  Clock,
  BarChart3,
  Calendar,
  Download,
  ChevronDown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { SkillGapData } from '../data/analytics';
import {
  departmentReadinessData,
  learningActivityData,
  certificationCoverageData,
  departmentCertificationData,
  skillGapData,
  skillLabels,
  pipelineData,
  readinessData,
  roiMetrics,
  courseEffectivenessData,
  kpiData,
  type DepartmentReadiness,
  type CertificationCoverage,
  type CourseEffectiveness,
} from '@/data/analytics';

/* ────────────────────── animation helpers ────────────────────── */
const easeOut = [0, 0, 0.2, 1] as [number, number, number, number];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: easeOut },
  }),
};

/* ────────────────────── Animated Counter ────────────────────── */
function AnimatedCounter({ value, duration = 1000 }: { value: string; duration?: number }) {
  const numericMatch = value.match(/[\d,]+/);
  const numericValue = numericMatch ? parseInt(numericMatch[0].replace(/,/g, ''), 10) : 0;
  const prefix = value.match(/^[^\d]/) ? value.match(/^[^\d]/)?.[0] : '';
  const suffix = value.match(/%/) ? '%' : '';
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!numericMatch) return;
    let start = 0;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.floor(eased * numericValue);
      setDisplay(start);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [numericValue, duration, numericMatch]);

  if (!numericMatch) return <span>{value}</span>;

  return (
    <span>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ────────────────────── Sparkline ────────────────────── */
function MiniSparkline({ data, color, width = 60, height = 24 }: { data: number[]; color: string; width?: number; height?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - min) / range) * height,
  }));
  const path = points.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ────────────────────── KPI Card ────────────────────── */
const kpiIconMap: Record<string, React.ElementType> = {
  TrendingUp,
  Users,
  BarChart3,
  Award,
  Clock,
};

function KPICard({ data, index }: { data: (typeof kpiData)[0]; index: number }) {
  const Icon = kpiIconMap[data.icon] || BarChart3;

  return (
    <motion.div
      custom={index}
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="bg-cream rounded-[12px] p-4 border-[0.5px] border-[rgba(0,59,70,0.14)] dark:border-[rgba(255,255,255,0.1)] flex flex-col justify-between transition-shadow hover:shadow-card"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium text-ink-tertiary">
            {data.label}
          </p>
          <p className="text-4xl font-bold text-ink-primary mt-2">
            <AnimatedCounter value={data.value} />
          </p>
        </div>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${data.iconColor}20` }}
        >
          <Icon size={20} style={{ color: data.iconColor }} />
        </div>
      </div>
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs font-medium text-[#7a8a7a]">{data.trend}</span>
        {data.sparkline && <MiniSparkline data={data.sparkline} color={data.iconColor} />}
      </div>
    </motion.div>
  );
}

/* ────────────────────── Custom Tooltip ────────────────────── */
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#003b46] text-[#f8f5f0] px-3 py-2 rounded-lg text-xs shadow-lg">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

/* ────────────────────── Heatmap Cell Color ────────────────────── */
function getHeatmapColor(value: number): string {
  if (value >= 90) return '#7a8a7a';
  if (value >= 75) return '#a7c4d4';
  if (value >= 60) return '#b0c4c7';
  return 'rgba(196,160,160,0.5)';
}

function getHeatmapTextColor(value: number): string {
  if (value >= 90) return '#fff';
  if (value >= 75) return '#003b46';
  if (value >= 60) return '#003b46';
  return '#003b46';
}

/* ────────────────────── Skill Key Type ────────────────────── */
type SkillKey = keyof Omit<SkillGapData, 'department'>;

/* ────────────────────── Main Page ────────────────────── */
export default function Analytics() {
  const [activityTab, setActivityTab] = useState<'enrollments' | 'completions' | 'hours'>('enrollments');

  const tabConfig = {
    enrollments: { key: 'enrollments' as const, color: '#a7c4d4' },
    completions: { key: 'completions' as const, color: '#7a8a7a' },
    hours: { key: 'hours' as const, color: '#c19a6b' },
  };

  const currentTab = tabConfig[activityTab];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getBarColor = useCallback((entry: { department: string; score: number }) => {
    const sorted = [...departmentReadinessData].sort((a, b) => b.score - a.score);
    const rank = sorted.findIndex((d) => d.department === entry.department);
    if (rank < 3) return '#7a8a7a';
    if (rank >= sorted.length - 2) return 'rgba(196,160,160,0.6)';
    return '#a7c4d4';
  }, []);

  return (
    <div className="space-y-8">
      {/* ─────── Section 1: Page Header ─────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easeOut }}
        className="pb-4 border-b border-[rgba(0,59,70,0.08)] flex items-start justify-between"
      >
        <div>
          <h1 className="font-serif text-5xl font-normal text-[#003b46]">Learning Analytics</h1>
          <p className="text-lg text-[#1a4a4e] mt-2">Company-wide learning performance and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#ede9e1] rounded-lg text-sm text-[#003b46] border border-[rgba(0,59,70,0.08)] hover:bg-[#e8dfcf] transition-colors">
            <Calendar size={16} />
            Oct 1 – Oct 31, 2024
            <ChevronDown size={14} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#a7c4d4] rounded-lg text-sm text-[#003b46] font-medium hover:brightness-95 transition-all">
            <Download size={16} />
            Export Report
          </button>
        </div>
      </motion.div>

      {/* ─────── Section 2: Executive KPI Row ─────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpiData.map((kpi, i) => (
          <KPICard key={kpi.label} data={kpi} index={i} />
        ))}
      </div>

      {/* ─────── Skill-gap heatmap + succession pipeline (§3.4) ─────── */}
      <SkillGapHeatmap />
      {/* Manager view of the BD new-joiner diagnostic (§2) */}
      <BdDiagnosticManagerPanel />
      {/* Readiness-check reporting — team-wide self-assessment gaps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ReadinessAdminPanel academySlug="business-development" />
        <ReadinessAdminPanel academySlug="sales" />
      </div>
      <SuccessionPanel />

      {/* ─────── Section 3: Main Charts (2-Column) ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-5">
        {/* Left — Department Readiness */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-[#ede9e1] rounded-2xl p-6 border border-[rgba(0,59,70,0.08)]"
          style={{ boxShadow: '0 4px 20px rgba(0,59,70,0.08)' }}
        >
          <div className="mb-4">
            <h3 className="font-sans text-lg font-semibold text-[#003b46]">
              Department Learning Readiness
            </h3>
            <p className="text-xs text-[#4a6b6e] mt-1">Average score by department</p>
          </div>
          <ResponsiveContainer width="100%" height={420}>
            <BarChart
              data={[...departmentReadinessData].reverse()}
              layout="vertical"
              margin={{ top: 0, right: 40, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,59,70,0.08)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#4a6b6e' }} />
              <YAxis
                type="category"
                dataKey="department"
                tick={{ fontSize: 11, fill: '#1a4a4e' }}
                width={140}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload as DepartmentReadiness;
                  return (
                    <div className="bg-[#003b46] text-[#f8f5f0] px-3 py-2 rounded-lg text-xs shadow-lg">
                      <p className="font-semibold">{data.department}</p>
                      <p>Score: {data.score}</p>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="score"
                radius={[0, 4, 4, 0]}
                barSize={18}
                fill="#a7c4d4"
              >
                {[...departmentReadinessData].reverse().map((entry, i) => (
                  <Cell key={i} fill={getBarColor(entry)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Right — Learning Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-[#ede9e1] rounded-2xl p-6 border border-[rgba(0,59,70,0.08)]"
          style={{ boxShadow: '0 4px 20px rgba(0,59,70,0.08)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-sans text-lg font-semibold text-[#003b46]">
                Learning Activity Trend
              </h3>
              <p className="text-xs text-[#4a6b6e] mt-1">Last 6 months</p>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 mb-4 bg-[rgba(0,59,70,0.06)] rounded-lg p-1">
            {(['enrollments', 'completions', 'hours'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActivityTab(tab)}
                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all capitalize ${
                  activityTab === tab
                    ? 'bg-[#003b46] text-[#f8f5f0]'
                    : 'text-[#4a6b6e] hover:text-[#003b46]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={340}>
            <AreaChart data={learningActivityData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={currentTab.color} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={currentTab.color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,59,70,0.08)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#4a6b6e' }} />
              <YAxis tick={{ fontSize: 11, fill: '#4a6b6e' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={currentTab.key}
                stroke={currentTab.color}
                strokeWidth={2}
                fill="url(#areaFill)"
                dot={{ r: 4, fill: currentTab.color }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ─────── Section 4: Certification Coverage ─────── */}
      <div className="grid grid-cols-[40%_60%] gap-5">
        {/* Left — Donut Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="bg-[#ede9e1] rounded-2xl p-6 border border-[rgba(0,59,70,0.08)] flex flex-col items-center"
          style={{ boxShadow: '0 4px 20px rgba(0,59,70,0.08)' }}
        >
          <h3 className="font-sans text-lg font-semibold text-[#003b46] mb-4 self-start">
            Certification Coverage
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={certificationCoverageData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="percentage"
                startAngle={90}
                endAngle={-270}
              >
                {certificationCoverageData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload as CertificationCoverage;
                  return (
                    <div className="bg-[#003b46] text-[#f8f5f0] px-3 py-2 rounded-lg text-xs shadow-lg">
                      <p className="font-semibold">{data.level}</p>
                      <p>{data.percentage}%</p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center -mt-4">
            <p className="text-3xl font-bold text-[#003b46]">68%</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#4a6b6e]">Covered</p>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {certificationCoverageData.map((item) => (
              <div key={item.level} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[11px] text-[#4a6b6e]">{item.level}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right — Department Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-[#ede9e1] rounded-2xl p-6 border border-[rgba(0,59,70,0.08)]"
          style={{ boxShadow: '0 4px 20px rgba(0,59,70,0.08)' }}
        >
          <h3 className="font-sans text-lg font-semibold text-[#003b46] mb-4">
            By Department
          </h3>
          <div className="space-y-3">
            {departmentCertificationData.map((dept, i) => (
              <motion.div
                key={dept.department}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#1a4a4e] w-28 truncate">{dept.department}</span>
                  <span className="text-xs font-semibold text-[#003b46]">{dept.percentage}%</span>
                </div>
                <div className="h-1 bg-[rgba(0,59,70,0.08)] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, #a7c4d4 ${dept.percentage}%, #7a8a7a ${dept.percentage}%)`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${dept.percentage}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ─────── Section 5: Skill Gap Heatmap ─────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="bg-[#ede9e1] rounded-2xl p-6 border border-[rgba(0,59,70,0.08)]"
        style={{ boxShadow: '0 4px 20px rgba(0,59,70,0.08)' }}
      >
        <div className="mb-4">
          <h3 className="font-sans text-lg font-semibold text-[#003b46]">
            Company Skill Gap Heatmap
          </h3>
          <p className="text-xs text-[#4a6b6e] mt-1">Average proficiency by department</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-[10px] font-semibold uppercase text-[#4a6b6e] pb-2 pr-2 w-32">
                  Department
                </th>
                {skillLabels.map((skill) => (
                  <th
                    key={skill}
                    className="text-center text-[10px] font-semibold uppercase text-[#4a6b6e] pb-2 px-0.5"
                    style={{ minWidth: 60 }}
                  >
                    {skill}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {skillGapData.map((row, ri) => (
                <motion.tr
                  key={row.department}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: ri * 0.03 }}
                >
                  <td className="text-[11px] font-medium text-[#1a4a4e] pr-2 py-1">
                    {row.department}
                  </td>
                  {(['productKnowledge', 'sales', 'quality', 'leadership', 'communication', 'technical', 'safety', 'digital'] as const).map(
                    (key, ci) => {
                      const value = row[key as SkillKey];
                      return (
                        <motion.td
                          key={key}
                          className="p-0.5"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: ri * 0.03 + ci * 0.02, duration: 0.2 }}
                        >
                          <div
                            className="w-full h-9 rounded flex items-center justify-center text-[10px] font-medium"
                            style={{
                              backgroundColor: getHeatmapColor(value),
                              color: getHeatmapTextColor(value),
                            }}
                          >
                            {value}
                          </div>
                        </motion.td>
                      );
                    }
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 justify-end">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#7a8a7a' }} />
            <span className="text-[10px] text-[#4a6b6e]">Strong (90–100)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#a7c4d4' }} />
            <span className="text-[10px] text-[#4a6b6e]">Good (75–89)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#b0c4c7' }} />
            <span className="text-[10px] text-[#4a6b6e]">Developing (60–74)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(196,160,160,0.5)' }} />
            <span className="text-[10px] text-[#4a6b6e]">Gap (0–59)</span>
          </div>
        </div>
      </motion.div>

      {/* ─────── Section 6: Leadership Pipeline ─────── */}
      <div className="grid grid-cols-2 gap-5">
        {/* Left — Funnel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-[#ede9e1] rounded-2xl p-6 border border-[rgba(0,59,70,0.08)]"
          style={{ boxShadow: '0 4px 20px rgba(0,59,70,0.08)' }}
        >
          <h3 className="font-sans text-lg font-semibold text-[#003b46] mb-6">
            Leadership Pipeline
          </h3>
          <div className="space-y-4">
            {pipelineData.map((tier, i) => (
              <motion.div
                key={tier.tier}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.2 }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-[#4a6b6e] w-28 truncate">{tier.label}</span>
                  <div className="flex-1 h-10 bg-[rgba(0,59,70,0.06)] rounded-lg overflow-hidden relative">
                    <motion.div
                      className="h-full rounded-lg flex items-center justify-end pr-3"
                      style={{ backgroundColor: tier.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${tier.width}%` }}
                      transition={{ duration: 0.6, delay: i * 0.2, ease: easeOut }}
                    >
                      <span className="text-sm font-bold text-[#003b46]">{tier.count}</span>
                    </motion.div>
                  </div>
                  <span className="text-[11px] text-[#4a6b6e] w-12 text-right">
                    {Math.round((tier.count / 45) * 100)}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right — Readiness Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="bg-[#ede9e1] rounded-2xl p-6 border border-[rgba(0,59,70,0.08)]"
          style={{ boxShadow: '0 4px 20px rgba(0,59,70,0.08)' }}
        >
          <h3 className="font-sans text-lg font-semibold text-[#003b46] mb-4">
            Promotion-Ready Employees
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(0,59,70,0.08)]">
                  <th className="text-left text-[10px] font-semibold uppercase text-[#4a6b6e] pb-2 pr-2">
                    Name
                  </th>
                  <th className="text-left text-[10px] font-semibold uppercase text-[#4a6b6e] pb-2 px-2">
                    Role
                  </th>
                  <th className="text-left text-[10px] font-semibold uppercase text-[#4a6b6e] pb-2 px-2">
                    Readiness
                  </th>
                  <th className="text-left text-[10px] font-semibold uppercase text-[#4a6b6e] pb-2 px-2">
                    Skills
                  </th>
                  <th className="text-left text-[10px] font-semibold uppercase text-[#4a6b6e] pb-2 pl-2">
                    Certs
                  </th>
                </tr>
              </thead>
              <tbody>
                {readinessData.map((emp, i) => (
                  <motion.tr
                    key={emp.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="border-b border-[rgba(0,59,70,0.06)] last:border-0"
                  >
                    <td className="py-2 pr-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#a7c4d4] flex items-center justify-center text-[10px] font-semibold text-[#003b46]">
                          {emp.initials}
                        </div>
                        <span className="text-xs font-medium text-[#003b46]">{emp.name}</span>
                      </div>
                    </td>
                    <td className="py-2 px-2">
                      <span className="text-[11px] text-[#1a4a4e]">{emp.role}</span>
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-[rgba(0,59,70,0.08)] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-[#7a8a7a]"
                            initial={{ width: 0 }}
                            animate={{ width: `${emp.readiness}%` }}
                            transition={{ duration: 0.6, delay: i * 0.05 }}
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-[#003b46]">{emp.readiness}%</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-[11px] text-[#4a6b6e]">
                      {emp.skillsMet}/{emp.totalSkills}
                    </td>
                    <td className="py-2 pl-2 text-[11px] text-[#4a6b6e]">
                      {emp.certsEarned}/{emp.totalCerts}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* ─────── Section 7: Training ROI ─────── */}
      <div className="grid grid-cols-[40%_60%] gap-5">
        {/* Left — ROI Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="bg-[#ede9e1] rounded-2xl p-6 border border-[rgba(0,59,70,0.08)]"
          style={{ boxShadow: '0 4px 20px rgba(0,59,70,0.08)' }}
        >
          <h3 className="font-sans text-lg font-semibold text-[#003b46] mb-5">
            Training ROI
          </h3>
          <div className="space-y-4">
            {roiMetrics.map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.2 }}
                className="bg-[rgba(0,59,70,0.04)] rounded-xl p-4"
              >
                <p className="text-3xl font-bold" style={{ color: metric.color }}>
                  <AnimatedCounter value={metric.value} />
                </p>
                <p className="text-[11px] text-[#4a6b6e] mt-1">{metric.subtext}</p>
                <div className="flex items-center gap-1 mt-2">
                  {metric.trendDirection === 'down' ? (
                    <TrendingDown size={14} className="text-[#7a8a7a]" />
                  ) : (
                    <TrendingUp size={14} className="text-[#7a8a7a]" />
                  )}
                  <span className="text-[11px] font-medium text-[#7a8a7a]">{metric.trend}</span>
                  {metric.trendLabel && (
                    <span className="text-[10px] text-[#4a6b6e]"> {metric.trendLabel}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right — Course Effectiveness */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.55 }}
          className="bg-[#ede9e1] rounded-2xl p-6 border border-[rgba(0,59,70,0.08)]"
          style={{ boxShadow: '0 4px 20px rgba(0,59,70,0.08)' }}
        >
          <div className="mb-4">
            <h3 className="font-sans text-lg font-semibold text-[#003b46]">
              Course Effectiveness
            </h3>
            <p className="text-xs text-[#4a6b6e] mt-1">Top performing courses</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={courseEffectivenessData}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,59,70,0.08)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#4a6b6e' }} />
              <YAxis
                type="category"
                dataKey="course"
                tick={{ fontSize: 11, fill: '#1a4a4e' }}
                width={150}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload as CourseEffectiveness;
                  return (
                    <div className="bg-[#003b46] text-[#f8f5f0] px-3 py-2 rounded-lg text-xs shadow-lg">
                      <p className="font-semibold">{data.course}</p>
                      <p>Effectiveness: {data.effectiveness}%</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="effectiveness" fill="#a7c4d4" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-[10px] text-[#4a6b6e] mt-3 italic">
            Effectiveness = Completion rate × Assessment score × Learner satisfaction
          </p>
        </motion.div>
      </div>
    </div>
  );
}
