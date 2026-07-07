'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Users,
  Lock,
  Wrench,
  ChevronRight,
  Flame,
  Target,
  Layers,
  Share2,
  Zap,
} from 'lucide-react';
import {
  certificationLevels,
  currentLevelRequirements,
  earnedBadges,
  processSteps,
  leaderboardData,
  userProgress,
} from '@/data/certifications';

/* ────────────────────── animation helpers ────────────────────── */
const easeSpring = [0.175, 0.885, 0.32, 1.275] as [number, number, number, number];
const easeOut = [0, 0, 0.2, 1] as [number, number, number, number];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: easeOut },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: easeSpring },
  },
};

/* ────────────────────── SVG Level Badges ────────────────────── */
const levelGradients = [
  { from: '#7a8a7a', to: '#b0c4c7', label: '#7a8a7a' },
  { from: '#a7c4d4', to: '#d4e4ec', label: '#a7c4d4' },
  { from: '#8c8a6e', to: '#c2b59b', label: '#8c8a6e' },
  { from: '#c19a6b', to: '#e8d4b8', label: '#c19a6b' },
  { from: '#003b46', to: '#4a6b6e', label: '#003b46' },
];

function LevelBadgeSVG({
  level,
  size = 72,
  status,
  progress,
}: {
  level: number;
  size?: number;
  status: string;
  progress?: number;
}) {
  const g = levelGradients[level - 1] || levelGradients[0];
  const r = size / 2 - 4;
  const circumference = 2 * Math.PI * (r - 6);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <radialGradient id={`grad-${level}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={g.to} />
          <stop offset="100%" stopColor={g.from} />
        </radialGradient>
        <linearGradient id={`ring-${level}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={g.from} />
          <stop offset="100%" stopColor={g.to} />
        </linearGradient>
      </defs>
      {/* Outer ring */}
      {status === 'in-progress' && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r - 6}
          fill="none"
          stroke="rgba(0,59,70,0.08)"
          strokeWidth="4"
        />
      )}
      {status === 'in-progress' && (
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r - 6}
          fill="none"
          stroke={`url(#ring-${level})`}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset: circumference * (1 - (progress || 0) / 100),
          }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      )}
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill={status === 'locked' ? '#ede9e1' : `url(#grad-${level})`}
        stroke={status === 'locked' ? '#b0c4c7' : g.from}
        strokeWidth="3"
        strokeDasharray={status === 'locked' ? '6 4' : 'none'}
      />
      {/* Content */}
      {status === 'completed' && (
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#fff"
          fontSize={size * 0.35}
          fontWeight="700"
          fontFamily="Inter, sans-serif"
        >
          {level}
        </text>
      )}
      {status === 'in-progress' && (
        <>
          <text
            x={size / 2}
            y={size / 2 - 4}
            textAnchor="middle"
            dominantBaseline="central"
            fill="rgb(200 130 85)"
            fontSize={size * 0.3}
            fontWeight="700"
            fontFamily="Inter, sans-serif"
          >
            {progress}%
          </text>
          <text
            x={size / 2}
            y={size / 2 + size * 0.2}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#4a6b6e"
            fontSize={size * 0.13}
            fontWeight="500"
            fontFamily="Inter, sans-serif"
          >
            IN PROGRESS
          </text>
        </>
      )}
      {status === 'locked' && (
        <Lock size={size * 0.3} x={size / 2 - size * 0.15} y={size / 2 - size * 0.15} color="#b0c4c7" />
      )}
    </svg>
  );
}

/* ────────────────────── Progress Ring ────────────────────── */
function ProgressRing({
  size,
  progress,
  color,
  label,
}: {
  size: number;
  progress: number;
  color: string;
  label: string;
}) {
  const r = size / 2 - 8;
  const circumference = 2 * Math.PI * r;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,59,70,0.08)" strokeWidth="8" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - progress / 100) }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x={size / 2}
          y={size / 2 - 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill="rgb(200 130 85)"
          fontSize="24"
          fontWeight="700"
          fontFamily="Inter, sans-serif"
        >
          {progress}%
        </text>
        <text
          x={size / 2}
          y={size / 2 + 18}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#4a6b6e"
          fontSize="11"
          fontWeight="500"
          fontFamily="Inter, sans-serif"
        >
          {label}
        </text>
      </svg>
    </div>
  );
}

/* ────────────────────── Icon Map ────────────────────── */
const iconMap: Record<string, React.ElementType> = {
  BookOpen,
  Wrench,
  ClipboardCheck,
  Users,
  Award,
  Flame,
  Target,
  Layers,
  Share2,
  Zap,
  CheckCircle2,
};

/* ────────────────────── Requirement Row ────────────────────── */
function RequirementRow({ req, index }: { req: (typeof currentLevelRequirements)[0]; index: number }) {
  const statusColors = {
    completed: 'bg-[#7a8a7a] text-stone-ivory',
    'in-progress': 'bg-accent-copper/15 text-ink-primary',
    pending: 'bg-card text-ink-tertiary',
  };

  const statusLabels = {
    completed: 'Completed',
    'in-progress': 'In Progress',
    pending: 'Pending',
  };

  const barColors = {
    completed: '#7a8a7a',
    'in-progress': '#a7c4d4',
    pending: '#b0c4c7',
  };

  return (
    <motion.div
      custom={index}
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="flex items-start gap-3 py-3 border-b border-[rgba(0,59,70,0.08)] last:border-0"
    >
      <div
        className={`w-[22px] h-[22px] rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
          req.status === 'completed' ? 'bg-[#7a8a7a]' : 'border border-[#4a6b6e]'
        }`}
      >
        {req.status === 'completed' && <CheckCircle2 size={14} className="text-stone-ivory" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-ink-primary font-normal">{req.text}</p>
        <p className="text-xs text-ink-tertiary mt-0.5">{req.detail}</p>
        {req.status === 'in-progress' && (
          <div className="w-full h-1.5 bg-card rounded-full mt-2 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: barColors[req.status] }}
              initial={{ width: 0 }}
              animate={{ width: `${req.progress || 0}%` }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            />
          </div>
        )}
      </div>
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[req.status]}`}>
        {statusLabels[req.status]}
      </span>
    </motion.div>
  );
}

/* ────────────────────── Process Step Icon ────────────────────── */
function ProcessStepIcon({ iconName }: { iconName: string }) {
  const Icon = iconMap[iconName] || BookOpen;
  return <Icon size={24} className="text-ink-tertiary" />;
}

/* ────────────────────── Main Page ────────────────────── */
export default function Certifications() {
  const [selectedLevel, setSelectedLevel] = useState(3);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const currentLevel = certificationLevels.find((l) => l.id === selectedLevel) || certificationLevels[3];

  const completedBadges = earnedBadges;

  return (
    <div className="space-y-10">
      {/* ─────── Section 1: Page Hero ─────── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeOut }}
        className="relative rounded-3xl overflow-hidden bg-card border border-[rgba(0,59,70,0.08)] shadow-card"
      >
        <div className="p-10 flex items-center justify-between gap-8">
          <div className="flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[2px] text-accent-copper mb-3">
              CERTIFICATION PROGRAM
            </p>
            <h1 className="font-serif text-[52px] font-normal leading-tight mb-4 text-ink-primary">
              Your Certification Journey
            </h1>
            <p className="text-lg leading-relaxed max-w-[600px] text-ink-secondary">
              Magppie&apos;s certification framework recognizes your expertise across five levels.
              Each level unlocks new opportunities, responsibilities, and career advancement.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-2xl p-6 flex-shrink-0 w-[260px] bg-cream border border-[rgba(0,59,70,0.08)]"
          >
            <p className="text-sm font-semibold text-ink-primary">
              Level {userProgress.currentLevel} — {userProgress.currentLevelName}
            </p>
            <div className="flex items-center gap-4 mt-4">
              <ProgressRing size={80} progress={userProgress.overallProgress} color="#B8703F" label="" />
              <div>
                <p className="text-[13px] text-ink-secondary">
                  {userProgress.levelsCompleted} of {userProgress.totalLevels} Levels Complete
                </p>
                <p className="text-xs mt-1 text-accent-copper">
                  Next: Level {userProgress.currentLevel + 1} — {userProgress.nextLevel}
                </p>
              </div>
            </div>
            <button className="mt-4 w-full py-2.5 rounded-full text-sm font-semibold transition-all hover:-translate-y-px bg-[#B8703F] text-stone-ivory hover:brightness-95">
              Continue Progress <ChevronRight size={14} className="inline ml-1" />
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* ─────── Section 2: Certification Level Path ─────── */}
      <section>
        <div className="relative mt-6">
          {/* Connector line */}
          <div className="absolute top-[36px] left-[5%] right-[5%] h-1 bg-card rounded-full" />
          <motion.div
            className="absolute top-[36px] left-[5%] h-1 bg-[#B8703F] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: '55%' }}
            transition={{ duration: 1.2, ease: easeOut, delay: 0.3 }}
          />
          {/* Nodes */}
          <div className="relative flex justify-between px-[5%]">
            {certificationLevels.map((level, i) => (
              <motion.div
                key={level.id}
                className="flex flex-col items-center cursor-pointer"
                onClick={() => setSelectedLevel(level.id)}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.15, ease: easeSpring }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="relative">
                  <LevelBadgeSVG
                    level={level.id}
                    size={72}
                    status={level.status}
                    progress={level.progress}
                  />
                  {level.status === 'completed' && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#7a8a7a] rounded-full flex items-center justify-center">
                      <CheckCircle2 size={12} className="text-stone-ivory" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] font-medium uppercase mt-3 text-ink-tertiary">
                  Level {level.id}
                </p>
                <p className="text-[13px] font-semibold text-ink-primary mt-0.5">{level.name}</p>
                <p
                  className={`text-[11px] mt-0.5 ${
                    level.status === 'completed'
                      ? 'text-[#7a8a7a]'
                      : level.status === 'in-progress'
                        ? 'text-[#B8703F]'
                        : 'text-[#b0c4c7]'
                  }`}
                >
                  {level.status === 'completed'
                    ? `Earned ${level.completedDate}`
                    : level.status === 'in-progress'
                      ? `${level.progress}% Complete`
                      : 'Locked'}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────── Section 3: Current Level Detail ─────── */}
      <section className="grid grid-cols-[60%_40%] gap-6">
        {/* Left — Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-card rounded-2xl p-8 border border-[rgba(0,59,70,0.08)]"
          style={{ boxShadow: '0 4px 20px rgba(0,59,70,0.08)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-sans text-lg font-semibold text-ink-primary">
              Level {currentLevel.id} — {currentLevel.name} Requirements
            </h3>
            <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-accent-copper/25 text-ink-primary">
              {userProgress.overallProgress}% Complete
            </span>
          </div>
          <div>
            {currentLevelRequirements.map((req, i) => (
              <RequirementRow key={req.id} req={req} index={i} />
            ))}
          </div>
        </motion.div>

        {/* Right — Progress Detail */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-card rounded-2xl p-8 border border-[rgba(0,59,70,0.08)] flex flex-col items-center"
          style={{ boxShadow: '0 4px 20px rgba(0,59,70,0.08)' }}
        >
          <h3 className="font-sans text-lg font-semibold text-ink-primary mb-4 self-start">
            Your Progress
          </h3>
          <ProgressRing size={120} progress={userProgress.overallProgress} color="#c19a6b" label="To Level 4" />

          {/* Mini bar chart */}
          <div className="w-full mt-6 space-y-2">
            {currentLevelRequirements.map((req) => (
              <div key={req.id} className="flex items-center gap-2">
                <span className="text-[10px] text-ink-tertiary w-16 truncate">{req.text.split(' ').slice(0, 2).join(' ')}</span>
                <div className="flex-1 h-2 bg-[rgba(0,59,70,0.06)] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor:
                        req.status === 'completed'
                          ? '#7a8a7a'
                          : req.status === 'in-progress'
                            ? '#a7c4d4'
                            : '#b0c4c7',
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${req.progress || 0}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-6 p-3 rounded-xl bg-[rgba(122,138,122,0.12)] w-full">
            <Calendar size={16} className="text-[#7a8a7a]" />
            <div>
              <p className="text-[13px] font-medium text-[#7a8a7a]">
                Estimated: {userProgress.estimatedCompletion}
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-[rgba(0,59,70,0.04)] w-full">
            <p className="text-[13px] text-ink-secondary">{userProgress.nextAction}</p>
            <button className="mt-3 py-2 px-5 rounded-full text-sm font-semibold transition-all hover:-translate-y-px bg-stone-espresso text-stone-ivory hover:bg-stone-charcoal">
              Schedule Mentorship <ChevronRight size={14} className="inline ml-1" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* ─────── Section 4: Earned Badges ─────── */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-[28px] font-normal text-ink-primary">Your Badges</h2>
          <span className="text-sm font-medium text-ink-tertiary">
            {completedBadges.length} earned
          </span>
        </div>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-4 gap-5"
        >
          {completedBadges.map((badge) => {
            const Icon = iconMap[badge.icon] || Award;
            return (
              <motion.div
                key={badge.id}
                variants={scaleIn}
                whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
                className="bg-card rounded-2xl p-5 flex flex-col items-center text-center border border-[rgba(0,59,70,0.08)] transition-shadow hover:shadow-lg cursor-pointer"
                style={{ boxShadow: '0 4px 20px rgba(0,59,70,0.08)' }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${badge.color}, rgb(var(--stone-espresso)))` }}
                >
                  <Icon size={28} className="text-ink-primary" />
                </div>
                <p className="text-sm font-semibold text-ink-primary mt-3">{badge.name}</p>
                <p className="text-[11px] text-ink-tertiary mt-1">{badge.description}</p>
                <p className="text-[10px] text-ink-tertiary mt-2">Earned {badge.earnedDate}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ─────── Section 5: Certification Process ─────── */}
      <section>
        <h2 className="font-serif text-[28px] font-normal text-ink-primary mb-6">
          How Certification Works
        </h2>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex items-start gap-0"
        >
          {processSteps.map((step, i) => (
            <div key={step.id} className="flex-1 flex items-start relative">
              <div className="flex flex-col items-center text-center w-full px-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.2, ease: easeSpring }}
                  className="w-9 h-9 rounded-full bg-stone-espresso flex items-center justify-center flex-shrink-0"
                >
                  <span className="text-sm font-bold" style={{ color: '#f8f5f0' }}>
                    {step.id}
                  </span>
                </motion.div>
                <p className="text-sm font-semibold text-ink-primary mt-3">{step.title}</p>
                <ProcessStepIcon iconName={step.icon} />
                <p className="text-xs text-ink-tertiary mt-2 leading-relaxed px-2">
                  {step.description}
                </p>
              </div>
              {i < processSteps.length - 1 && (
                <motion.div
                  className="absolute top-[18px] left-[60%] right-[-20%] h-0.5 bg-card"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.2 + 0.2 }}
                  style={{ transformOrigin: 'left' }}
                />
              )}
            </div>
          ))}
        </motion.div>
      </section>

      {/* ─────── Section 6: Leaderboard ─────── */}
      <section>
        <h3 className="font-sans text-lg font-semibold text-ink-primary mb-4">
          Certification Leaders
        </h3>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-card rounded-2xl border border-[rgba(0,59,70,0.08)] overflow-hidden"
          style={{ boxShadow: '0 4px 20px rgba(0,59,70,0.08)' }}
        >
          <table className="w-full">
            <thead>
              <tr className="bg-[rgba(0,59,70,0.04)]">
                <th className="text-left text-[11px] font-semibold uppercase text-ink-tertiary px-5 py-3">
                  Rank
                </th>
                <th className="text-left text-[11px] font-semibold uppercase text-ink-tertiary px-5 py-3">
                  Employee
                </th>
                <th className="text-left text-[11px] font-semibold uppercase text-ink-tertiary px-5 py-3">
                  Level
                </th>
                <th className="text-left text-[11px] font-semibold uppercase text-ink-tertiary px-5 py-3">
                  Badges
                </th>
                <th className="text-left text-[11px] font-semibold uppercase text-ink-tertiary px-5 py-3">
                  Certified Date
                </th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((entry, i) => (
                <motion.tr
                  key={entry.rank}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  className="border-t border-[rgba(0,59,70,0.08)] hover:bg-[rgba(0,59,70,0.03)] transition-colors"
                >
                  <td className="px-5 py-3">
                    <span
                      className={`text-sm font-bold ${
                        entry.rank <= 3 ? 'text-accent-copper' : 'text-ink-primary'
                      }`}
                    >
                      #{entry.rank}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent-copper/15 flex items-center justify-center text-xs font-semibold text-ink-primary">
                        {entry.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-ink-primary">{entry.name}</p>
                        <p className="text-[11px] text-ink-tertiary">{entry.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-medium text-ink-primary">
                      Level {entry.level} — {entry.levelName}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <Award size={14} className="text-accent-copper" />
                      <span className="text-sm font-medium text-ink-primary">{entry.badges}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-ink-tertiary">{entry.certifiedDate}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </section>
    </div>
  );
}
