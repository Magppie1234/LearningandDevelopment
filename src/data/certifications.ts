export interface CertificationLevel {
  id: number;
  name: string;
  status: 'completed' | 'in-progress' | 'locked';
  completedDate?: string;
  progress?: number;
  description: string;
}

export interface Requirement {
  id: number;
  text: string;
  status: 'completed' | 'in-progress' | 'pending';
  detail: string;
  progress?: number;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  earnedDate: string;
  color: string;
  icon: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  department: string;
  level: number;
  levelName: string;
  badges: number;
  certifiedDate: string;
  avatar: string;
}

export interface ProcessStep {
  id: number;
  title: string;
  description: string;
  icon: string;
}

export const certificationLevels: CertificationLevel[] = [
  {
    id: 1,
    name: 'Foundation',
    status: 'completed',
    completedDate: 'Oct 2023',
    description: 'Complete 3 basic academy courses and pass the foundation assessment.',
  },
  {
    id: 2,
    name: 'Intermediate',
    status: 'completed',
    completedDate: 'Mar 2024',
    description: 'Complete 5 academy courses, score 75%+ on assessments, and attend live sessions.',
  },
  {
    id: 3,
    name: 'Advanced',
    status: 'completed',
    completedDate: 'Aug 2024',
    description: 'Complete 8 advanced courses, pass the skills assessment, and lead a team project.',
  },
  {
    id: 4,
    name: 'Specialist',
    status: 'in-progress',
    progress: 68,
    description: 'Complete advanced coursework, pass specialist exam, and mentor junior colleagues.',
  },
  {
    id: 5,
    name: 'Trainer',
    status: 'locked',
    description: 'Complete all specialist requirements, deliver training sessions, and be nominated by leadership.',
  },
];

export const currentLevelRequirements: Requirement[] = [
  {
    id: 1,
    text: 'Complete 5 Advanced Academy Courses',
    status: 'completed',
    detail: '5/5 done',
    progress: 100,
  },
  {
    id: 2,
    text: 'Pass Skills Assessment (80%+ score)',
    status: 'completed',
    detail: '87% achieved',
    progress: 100,
  },
  {
    id: 3,
    text: 'Submit Capstone Project',
    status: 'in-progress',
    detail: 'Draft submitted, under review',
    progress: 60,
  },
  {
    id: 4,
    text: 'Mentor 2 Junior Team Members',
    status: 'in-progress',
    detail: '1/2 completed',
    progress: 50,
  },
  {
    id: 5,
    text: 'Department Head Recommendation',
    status: 'pending',
    detail: 'Awaiting approval',
    progress: 0,
  },
];

export const earnedBadges: Badge[] = [
  { id: 1, name: 'First Course Complete', description: 'Completed your first course', earnedDate: 'Oct 2023', color: '#a7c4d4', icon: 'BookOpen' },
  // §4: earned badges are accomplishments → gold entries reclassified to silver #A8AEB8
  { id: 2, name: '7-Day Streak', description: 'Learned 7 days in a row', earnedDate: 'Nov 2023', color: '#A8AEB8', icon: 'Flame' },
  { id: 3, name: 'Level 1 Certified', description: 'Foundation certification earned', earnedDate: 'Oct 2023', color: '#7a8a7a', icon: 'Award' },
  { id: 4, name: 'Assessment Ace', description: 'Scored 90%+ on 3 assessments', earnedDate: 'Jan 2024', color: '#a7c4d4', icon: 'Target' },
  { id: 5, name: 'Team Mentor', description: 'Mentored a junior colleague', earnedDate: 'Mar 2024', color: '#8c8a6e', icon: 'Users' },
  { id: 6, name: 'Level 2 Certified', description: 'Intermediate certification earned', earnedDate: 'Mar 2024', color: '#7a8a7a', icon: 'Award' },
  { id: 7, name: 'Course Collector', description: 'Completed 10 courses', earnedDate: 'May 2024', color: '#A8AEB8', icon: 'Layers' },
  { id: 8, name: 'Perfect Attendance', description: '100% attendance in live sessions', earnedDate: 'Jun 2024', color: '#a7c4d4', icon: 'CheckCircle' },
  { id: 9, name: 'Level 3 Certified', description: 'Advanced certification earned', earnedDate: 'Aug 2024', color: '#7a8a7a', icon: 'Award' },
  { id: 10, name: 'Knowledge Sharer', description: 'Shared 5 resources with team', earnedDate: 'Sep 2024', color: '#8c8a6e', icon: 'Share2' },
  { id: 11, name: 'Quiz Master', description: 'Perfect score on 5 quizzes', earnedDate: 'Sep 2024', color: '#A8AEB8', icon: 'Zap' },
  { id: 12, name: '30-Day Streak', description: 'Learned 30 days in a row', earnedDate: 'Oct 2024', color: '#c4a0a0', icon: 'Flame' },
];

export const processSteps: ProcessStep[] = [
  { id: 1, title: 'Learn', description: 'Complete required academy courses and training modules', icon: 'BookOpen' },
  { id: 2, title: 'Practice', description: 'Apply your skills through hands-on projects and simulations', icon: 'Wrench' },
  { id: 3, title: 'Assess', description: 'Pass skills assessments with required scores', icon: 'ClipboardCheck' },
  { id: 4, title: 'Mentor', description: 'Guide junior team members and share knowledge', icon: 'Users' },
  { id: 5, title: 'Certify', description: 'Earn your certification badge and unlock new opportunities', icon: 'Award' },
];

export const leaderboardData: LeaderboardEntry[] = [
  { rank: 1, name: 'Sarah Chen', department: 'Sales', level: 5, levelName: 'Trainer', badges: 18, certifiedDate: 'Jun 2024', avatar: 'SC' },
  { rank: 2, name: 'Raj Patel', department: 'Business Development', level: 5, levelName: 'Trainer', badges: 16, certifiedDate: 'Aug 2024', avatar: 'RP' },
  { rank: 3, name: 'Maria Santos', department: 'Quality Control', level: 4, levelName: 'Specialist', badges: 14, certifiedDate: 'Sep 2024', avatar: 'MS' },
  { rank: 4, name: 'James Wilson', department: 'Installation', level: 4, levelName: 'Specialist', badges: 12, certifiedDate: 'Jul 2024', avatar: 'JW' },
  { rank: 5, name: 'Aisha Kumar', department: 'Marketing', level: 3, levelName: 'Advanced', badges: 12, certifiedDate: 'Oct 2024', avatar: 'AK' },
  { rank: 6, name: 'Tom Bradley', department: 'Factory & Production', level: 3, levelName: 'Advanced', badges: 11, certifiedDate: 'Sep 2024', avatar: 'TB' },
  { rank: 7, name: 'Lisa Zhang', department: 'Purchase', level: 2, levelName: 'Intermediate', badges: 10, certifiedDate: 'Aug 2024', avatar: 'LZ' },
  { rank: 8, name: 'David Kim', department: 'HR & Admin', level: 2, levelName: 'Intermediate', badges: 9, certifiedDate: 'Jul 2024', avatar: 'DK' },
];

export const userProgress = {
  currentLevel: 4,
  currentLevelName: 'Specialist',
  overallProgress: 68,
  levelsCompleted: 3,
  totalLevels: 5,
  nextLevel: 'Trainer',
  estimatedCompletion: 'November 15, 2024',
  nextAction: 'Complete your second mentorship session to check off requirement #4.',
};
