import { computePrs } from '@/lib/prs';

export interface DepartmentReadiness {
  department: string;
  score: number;
}

export interface LearningActivity {
  month: string;
  enrollments: number;
  completions: number;
  hours: number;
}

export interface CertificationCoverage {
  level: string;
  percentage: number;
  color: string;
}

export interface DepartmentCertification {
  department: string;
  certified: number;
  total: number;
  percentage: number;
}

export interface SkillGapData {
  department: string;
  productKnowledge: number;
  sales: number;
  quality: number;
  leadership: number;
  communication: number;
  technical: number;
  safety: number;
  digital: number;
}

export interface PipelineTier {
  tier: string;
  count: number;
  label: string;
  color: string;
  width: number;
}

export interface ReadinessEmployee {
  name: string;
  initials: string;
  role: string;
  department: string;
  /** Computed via lib/prs.ts (35/25/25/15) — never hardcode this. */
  readiness: number;
  skillsMet: number;
  totalSkills: number;
  certsEarned: number;
  totalCerts: number;
  /** Avg of last two review scores, 0–100. */
  performance: number;
  /** Tenure & experience attainment, 0–100. */
  tenure: number;
}

export interface ROIMetric {
  label: string;
  value: string;
  subtext: string;
  trend: string;
  trendDirection: 'up' | 'down';
  trendLabel: string;
  color: string;
}

export interface CourseEffectiveness {
  course: string;
  effectiveness: number;
}

export interface KPIData {
  label: string;
  value: string;
  sublabel: string;
  trend: string;
  trendType: 'positive' | 'neutral';
  icon: string;
  iconColor: string;
  sparkline?: number[];
}

export const departmentReadinessData: DepartmentReadiness[] = [
  { department: 'Quality Control', score: 91 },
  { department: 'Sales', score: 88 },
  { department: 'Business Development', score: 85 },
  { department: 'Marketing', score: 82 },
  { department: 'Customer Experience', score: 80 },
  { department: 'Installation', score: 78 },
  { department: 'Leadership', score: 76 },
  { department: 'Accounts & Finance', score: 74 },
  { department: 'HR & Admin', score: 72 },
  { department: 'Purchase', score: 70 },
  { department: 'Post Design', score: 68 },
  { department: 'Inventory & Warehouse', score: 65 },
  { department: 'Factory & Production', score: 62 },
];

export const learningActivityData: LearningActivity[] = [
  { month: 'May', enrollments: 234, completions: 189, hours: 520 },
  { month: 'Jun', enrollments: 278, completions: 210, hours: 610 },
  { month: 'Jul', enrollments: 312, completions: 245, hours: 720 },
  { month: 'Aug', enrollments: 289, completions: 230, hours: 680 },
  { month: 'Sep', enrollments: 356, completions: 290, hours: 840 },
  { month: 'Oct', enrollments: 402, completions: 340, hours: 980 },
];

export const certificationCoverageData: CertificationCoverage[] = [
  { level: 'Level 5 (Trainer)', percentage: 8, color: '#c19a6b' },
  { level: 'Level 4 (Specialist)', percentage: 15, color: '#a7c4d4' },
  { level: 'Level 3 (Advanced)', percentage: 28, color: '#7a8a7a' },
  { level: 'Level 1-2 (Foundation)', percentage: 49, color: '#b0c4c7' },
];

export const departmentCertificationData: DepartmentCertification[] = [
  { department: 'Quality Control', certified: 85, total: 100, percentage: 85 },
  { department: 'Sales', certified: 78, total: 100, percentage: 78 },
  { department: 'Business Dev', certified: 72, total: 100, percentage: 72 },
  { department: 'Leadership', certified: 68, total: 100, percentage: 68 },
  { department: 'Marketing', certified: 65, total: 100, percentage: 65 },
  { department: 'Installation', certified: 60, total: 100, percentage: 60 },
  { department: 'Factory', certified: 55, total: 100, percentage: 55 },
  { department: 'HR & Admin', certified: 52, total: 100, percentage: 52 },
];

export const skillGapData: SkillGapData[] = [
  { department: 'Quality Control', productKnowledge: 92, sales: 45, quality: 96, leadership: 72, communication: 78, technical: 88, safety: 95, digital: 70 },
  { department: 'Sales', productKnowledge: 85, sales: 95, quality: 60, leadership: 80, communication: 92, technical: 50, safety: 65, digital: 82 },
  { department: 'Business Development', productKnowledge: 90, sales: 88, quality: 70, leadership: 85, communication: 88, technical: 65, safety: 60, digital: 80 },
  { department: 'Marketing', productKnowledge: 82, sales: 75, quality: 65, leadership: 72, communication: 92, technical: 60, safety: 55, digital: 90 },
  { department: 'Customer Experience', productKnowledge: 88, sales: 78, quality: 72, leadership: 68, communication: 95, technical: 55, safety: 60, digital: 75 },
  { department: 'Installation', productKnowledge: 95, sales: 50, quality: 85, leadership: 70, communication: 72, technical: 92, safety: 90, digital: 65 },
  { department: 'Leadership', productKnowledge: 80, sales: 72, quality: 78, leadership: 95, communication: 90, technical: 60, safety: 70, digital: 72 },
  { department: 'Accounts & Finance', productKnowledge: 65, sales: 45, quality: 70, leadership: 68, communication: 75, technical: 72, safety: 55, digital: 85 },
  { department: 'HR & Admin', productKnowledge: 70, sales: 50, quality: 65, leadership: 82, communication: 88, technical: 58, safety: 60, digital: 78 },
  { department: 'Purchase', productKnowledge: 78, sales: 55, quality: 72, leadership: 62, communication: 75, technical: 60, safety: 65, digital: 70 },
  { department: 'Post Design', productKnowledge: 82, sales: 48, quality: 75, leadership: 60, communication: 68, technical: 88, safety: 70, digital: 72 },
  { department: 'Inventory & Warehouse', productKnowledge: 75, sales: 42, quality: 78, leadership: 58, communication: 65, technical: 70, safety: 88, digital: 62 },
  { department: 'Factory & Production', productKnowledge: 88, sales: 40, quality: 82, leadership: 55, communication: 60, technical: 85, safety: 92, digital: 50 },
];

export const skillLabels = [
  'Product Knowledge',
  'Sales',
  'Quality',
  'Leadership',
  'Communication',
  'Technical',
  'Safety',
  'Digital',
];

export const pipelineData: PipelineTier[] = [
  { tier: 'High Potential', count: 45, label: 'Tier 1 — High Potential', color: '#7a8a7a', width: 100 },
  { tier: 'Developing', count: 28, label: 'Tier 2 — Developing', color: '#a7c4d4', width: 75 },
  { tier: 'Ready Now', count: 12, label: 'Tier 3 — Ready Now', color: '#c19a6b', width: 50 },
  { tier: 'Placed', count: 5, label: 'Tier 4 — Placed', color: '#d4c4a8', width: 30 },
];

/**
 * `readiness` is computed through the canonical PRS formula (lib/prs.ts) from
 * the four component attainments — it is no longer a hand-typed number.
 * skills = skillsMet/totalSkills, certifications = certsEarned/totalCerts.
 */
const readinessSource: Omit<ReadinessEmployee, 'readiness'>[] = [
  { name: 'Sarah Chen', initials: 'SC', role: 'Sales Team Lead', department: 'Sales', skillsMet: 8, totalSkills: 8, certsEarned: 4, totalCerts: 4, performance: 90, tenure: 80 },
  { name: 'Raj Patel', initials: 'RP', role: 'Sr. Sales Assoc.', department: 'Business Development', skillsMet: 7, totalSkills: 8, certsEarned: 3, totalCerts: 4, performance: 88, tenure: 75 },
  { name: 'Maria Santos', initials: 'MS', role: 'QC Analyst', department: 'Quality Control', skillsMet: 7, totalSkills: 7, certsEarned: 4, totalCerts: 4, performance: 78, tenure: 60 },
  { name: 'James Wilson', initials: 'JW', role: 'Install Lead', department: 'Installation', skillsMet: 6, totalSkills: 7, certsEarned: 3, totalCerts: 4, performance: 80, tenure: 70 },
  { name: 'Aisha Kumar', initials: 'AK', role: 'Marketing Coord.', department: 'Marketing', skillsMet: 6, totalSkills: 8, certsEarned: 3, totalCerts: 4, performance: 82, tenure: 68 },
  { name: 'Tom Bradley', initials: 'TB', role: 'Factory Supervisor', department: 'Factory & Production', skillsMet: 6, totalSkills: 7, certsEarned: 3, totalCerts: 4, performance: 72, tenure: 65 },
  { name: 'Lisa Zhang', initials: 'LZ', role: 'Purchase Officer', department: 'Purchase', skillsMet: 5, totalSkills: 7, certsEarned: 2, totalCerts: 4, performance: 76, tenure: 62 },
  { name: 'David Kim', initials: 'DK', role: 'HR Specialist', department: 'HR & Admin', skillsMet: 5, totalSkills: 7, certsEarned: 2, totalCerts: 4, performance: 70, tenure: 55 },
];

export const readinessData: ReadinessEmployee[] = readinessSource
  .map((e) => ({
    ...e,
    readiness: computePrs({
      skills: (e.skillsMet / e.totalSkills) * 100,
      certifications: (e.certsEarned / e.totalCerts) * 100,
      performance: e.performance,
      tenure: e.tenure,
    }),
  }))
  .sort((a, b) => b.readiness - a.readiness);

export const roiMetrics: ROIMetric[] = [
  {
    label: 'Cost per Employee',
    value: '$1,240',
    subtext: 'Cost per employee trained',
    trend: '-8%',
    trendDirection: 'down',
    trendLabel: 'vs last quarter',
    color: '#003b46',
  },
  {
    label: 'Productivity Impact',
    value: '+14%',
    subtext: 'Productivity increase post-training',
    trend: 'Measured via KPIs',
    trendDirection: 'up',
    trendLabel: '',
    color: '#7a8a7a',
  },
  {
    label: 'Retention Impact',
    value: '-22%',
    subtext: 'Turnover reduction',
    trend: 'Trained vs untrained employees',
    trendDirection: 'down',
    trendLabel: '',
    color: '#a7c4d4',
  },
];

export const courseEffectivenessData: CourseEffectiveness[] = [
  { course: 'Installation Masterclass', effectiveness: 96 },
  { course: 'Sales Techniques Advanced', effectiveness: 94 },
  { course: 'Leadership Essentials', effectiveness: 92 },
  { course: 'Quality Standards', effectiveness: 90 },
  { course: 'Product Knowledge Deep Dive', effectiveness: 88 },
  { course: 'Safety Protocol Training', effectiveness: 85 },
];

export const kpiData: KPIData[] = [
  {
    label: 'Learning score',
    value: '78',
    sublabel: 'Company Learning Score',
    trend: '+4% vs last month',
    trendType: 'positive',
    icon: 'TrendingUp',
    iconColor: '#003b46',
    sparkline: [72, 74, 73, 75, 76, 78],
  },
  {
    label: 'Active learners',
    value: '1,623',
    sublabel: '94% of workforce',
    trend: '+5% vs last month',
    trendType: 'positive',
    icon: 'Users',
    iconColor: '#a7c4d4',
    sparkline: [1520, 1550, 1580, 1600, 1610, 1623],
  },
  {
    label: 'Avg completion rate',
    value: '82%',
    sublabel: 'Across all academies',
    trend: '+6% vs last month',
    trendType: 'positive',
    icon: 'BarChart3',
    iconColor: '#7a8a7a',
    sparkline: [74, 76, 78, 79, 80, 82],
  },
  {
    label: 'Certifications earned',
    value: '127',
    sublabel: 'This month',
    trend: '+23 vs September',
    trendType: 'positive',
    icon: 'Award',
    iconColor: '#c19a6b',
    sparkline: [95, 102, 98, 110, 115, 127],
  },
  {
    label: 'Training hours',
    value: '3,420',
    sublabel: 'Total this month',
    trend: '+12% vs last month',
    trendType: 'positive',
    icon: 'Clock',
    iconColor: '#8c8a6e',
    sparkline: [2800, 2950, 3100, 3050, 3200, 3420],
  },
];
