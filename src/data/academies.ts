import type { LucideIcon } from 'lucide-react'
import {
  Briefcase,
  Target,
  PenTool,
  Wrench,
  Factory,
  ShieldCheck,
  ShoppingCart,
  Package,
  Calculator,
  Users,
  Megaphone,
  Headset,
  Crown,
} from 'lucide-react'

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced'
export type CourseStatus = 'Not Started' | 'In Progress' | 'Completed'
export type ResourceType = 'PDF' | 'Video' | 'Link' | 'DOCX'

export interface Course {
  id: string
  title: string
  description: string
  duration: string
  durationHours: number
  modules: number
  level: CourseLevel
  status: CourseStatus
  progress: number
  learningObjectives: string[]
  moduleBreakdown: { title: string; duration: string }[]
  instructor: { name: string; role: string; initials: string }
}

export interface Resource {
  id: string
  title: string
  description: string
  type: ResourceType
  size?: string
  duration?: string
  date: string
}

export interface LeaderboardEntry {
  rank: number
  name: string
  initials: string
  department: string
  progress: number
  points: number
  isCurrentUser?: boolean
}

export interface LearningPathStage {
  label: string
  status: 'completed' | 'current' | 'future'
}

export interface LearningPath {
  id: string
  title: string
  department: string
  color: string
  icon: string
  stages: LearningPathStage[]
  description: string
}

export interface Academy {
  id: string
  name: string
  description: string
  shortDescription: string
  color: string
  colorClass: string
  icon: string
  iconFn: LucideIcon
  /** Optional photo shown in place of the icon on academy cards and headers. */
  image?: string
  courseCount: number
  enrollmentCount: number
  avgRating: number
  totalHours: number
  levelRange: string
  courses: Course[]
  resources: Resource[]
  leaderboard: LeaderboardEntry[]
}

export const iconMap: Record<string, LucideIcon> = {
  Briefcase,
  Target,
  PenTool,
  Wrench,
  Factory,
  ShieldCheck,
  ShoppingCart,
  Package,
  Calculator,
  Users,
  Megaphone,
  Headset,
  Crown,
}

export const academies: Academy[] = [
  {
    id: 'business-development',
    name: 'Business Development Executive',
    description: 'Magppie’s approved sales training, end to end: brand story and company credibility, the SilverStone wellness science, the 7 safety pillars, awards and clientele, the full 8-stage sales pitch, the objection-handling playbook, pricing and process FAQs, and customer-communication standards. Ten modules, each with a quiz to pass at 80%.',
    shortDescription: 'Brand story, SilverStone science, pitch, objection handling, pricing',
    color: '#a7c4d4',
    colorClass: 'bg-[#a7c4d4]',
    icon: 'Briefcase',
    iconFn: Briefcase,
    image: '/course-thumb-bd.jpg',
    courseCount: 10,
    enrollmentCount: 340,
    avgRating: 4.8,
    totalHours: 32,
    levelRange: 'Intermediate–Advanced',
    courses: [
      {
        id: 'bd-01', title: 'Introduction to Wellness Market Analysis', description: 'Learn the fundamentals of market research and analysis specific to the wellness industry.', duration: '2h', durationHours: 2, modules: 3, level: 'Beginner', status: 'Completed', progress: 100, learningObjectives: ['Understand wellness market segmentation', 'Analyze competitor positioning', 'Identify growth opportunities'], moduleBreakdown: [{ title: 'Market Overview', duration: '40min' }, { title: 'Competitive Landscape', duration: '45min' }, { title: 'Growth Opportunities', duration: '35min' }], instructor: { name: 'Sarah Chen', role: 'Senior Business Analyst', initials: 'SC' },
      },
      {
        id: 'bd-02', title: 'Client Relationship Management', description: 'Build and maintain strong client relationships that drive long-term business growth.', duration: '3h', durationHours: 3, modules: 4, level: 'Beginner', status: 'Completed', progress: 100, learningObjectives: ['Master CRM tools', 'Develop client communication skills', 'Build retention strategies'], moduleBreakdown: [{ title: 'CRM Fundamentals', duration: '45min' }, { title: 'Communication Excellence', duration: '50min' }, { title: 'Retention Strategies', duration: '45min' }, { title: 'Case Studies', duration: '40min' }], instructor: { name: 'James Wilson', role: 'Client Success Director', initials: 'JW' },
      },
      {
        id: 'bd-03', title: 'Strategic Business Planning', description: 'Develop comprehensive business plans aligned with organizational goals.', duration: '4h', durationHours: 4, modules: 5, level: 'Intermediate', status: 'In Progress', progress: 65, learningObjectives: ['Create actionable business plans', 'Set measurable KPIs', 'Align team objectives'], moduleBreakdown: [{ title: 'Planning Framework', duration: '50min' }, { title: 'KPI Setting', duration: '45min' }, { title: 'Resource Allocation', duration: '50min' }, { title: 'Risk Assessment', duration: '45min' }, { title: 'Plan Execution', duration: '50min' }], instructor: { name: 'Maria Santos', role: 'Strategy Consultant', initials: 'MS' },
      },
      {
        id: 'bd-04', title: 'Advanced Negotiation Techniques', description: 'Master advanced negotiation strategies for complex business deals.', duration: '3.5h', durationHours: 3.5, modules: 4, level: 'Intermediate', status: 'In Progress', progress: 30, learningObjectives: ['Apply principled negotiation', 'Handle difficult conversations', 'Close complex deals'], moduleBreakdown: [{ title: 'Negotiation Principles', duration: '55min' }, { title: 'Advanced Tactics', duration: '55min' }, { title: 'Difficult Conversations', duration: '55min' }, { title: 'Simulation Exercise', duration: '55min' }], instructor: { name: 'Raj Patel', role: 'Negotiation Expert', initials: 'RP' },
      },
      {
        id: 'bd-05', title: 'Product Portfolio Management', description: 'Learn to manage and optimize wellness product portfolios for maximum market impact.', duration: '4h', durationHours: 4, modules: 6, level: 'Advanced', status: 'Not Started', progress: 0, learningObjectives: ['Optimize product mix', 'Manage product lifecycle', 'Drive portfolio growth'], moduleBreakdown: [{ title: 'Portfolio Basics', duration: '40min' }, { title: 'Lifecycle Management', duration: '40min' }, { title: 'Market Positioning', duration: '40min' }, { title: 'Revenue Optimization', duration: '40min' }, { title: 'Innovation Pipeline', duration: '40min' }, { title: 'Case Study', duration: '40min' }], instructor: { name: 'Lisa Zhang', role: 'Product Director', initials: 'LZ' },
      },
      {
        id: 'bd-06', title: 'Sales Forecasting & Analytics', description: 'Use data analytics to forecast sales and drive informed business decisions.', duration: '3.5h', durationHours: 3.5, modules: 5, level: 'Intermediate', status: 'Not Started', progress: 0, learningObjectives: ['Build forecasting models', 'Interpret sales data', 'Create actionable reports'], moduleBreakdown: [{ title: 'Forecasting Basics', duration: '45min' }, { title: 'Data Collection', duration: '40min' }, { title: 'Model Building', duration: '45min' }, { title: 'Analytics Tools', duration: '45min' }, { title: 'Report Creation', duration: '45min' }], instructor: { name: 'David Kim', role: 'Sales Analytics Manager', initials: 'DK' },
      },
      {
        id: 'bd-07', title: 'Lead Generation Strategies', description: 'Develop effective strategies for generating high-quality leads in the wellness market.', duration: '3h', durationHours: 3, modules: 4, level: 'Intermediate', status: 'Not Started', progress: 0, learningObjectives: ['Identify lead sources', 'Qualify prospects', 'Nurture leads effectively'], moduleBreakdown: [{ title: 'Lead Sources', duration: '45min' }, { title: 'Qualification Process', duration: '45min' }, { title: 'Nurturing Campaigns', duration: '45min' }, { title: 'Conversion Tactics', duration: '45min' }], instructor: { name: 'Emma Davis', role: 'Marketing Manager', initials: 'ED' },
      },
      {
        id: 'bd-08', title: 'Partnership & Alliance Building', description: 'Learn to forge strategic partnerships that expand market reach and capabilities.', duration: '3.5h', durationHours: 3.5, modules: 4, level: 'Advanced', status: 'Not Started', progress: 0, learningObjectives: ['Identify partnership opportunities', 'Structure win-win agreements', 'Manage partner relationships'], moduleBreakdown: [{ title: 'Partnership Types', duration: '55min' }, { title: 'Deal Structuring', duration: '55min' }, { title: 'Relationship Management', duration: '55min' }, { title: 'Partnership Growth', duration: '55min' }], instructor: { name: 'Chris Morgan', role: 'Partnerships Director', initials: 'CM' },
      },
    ],
    resources: [
      { id: 'bd-r1', title: 'Business Development Playbook 2024', description: 'Comprehensive guide to BD strategies and tactics', type: 'PDF', size: '4.2MB', date: 'Sep 2024' },
      { id: 'bd-r2', title: 'Market Analysis Template', description: 'Excel template for conducting market analysis', type: 'DOCX', size: '1.8MB', date: 'Aug 2024' },
      { id: 'bd-r3', title: 'Client Pitch Video Series', description: 'Video tutorials on crafting winning pitches', type: 'Video', duration: '45min', date: 'Oct 2024' },
      { id: 'bd-r4', title: 'Competitive Landscape Report', description: 'Annual report on wellness industry competitors', type: 'PDF', size: '3.1MB', date: 'Jul 2024' },
      { id: 'bd-r5', title: 'ROI Calculator Tool', description: 'Interactive tool for calculating partnership ROI', type: 'Link', date: 'Sep 2024' },
      { id: 'bd-r6', title: 'Sales Script Templates', description: 'Ready-to-use scripts for various sales scenarios', type: 'DOCX', size: '890KB', date: 'Aug 2024' },
    ],
    leaderboard: [
      { rank: 1, name: 'Sarah Chen', initials: 'SC', department: 'Business Development', progress: 92, points: 2340 },
      { rank: 2, name: 'Raj Patel', initials: 'RP', department: 'Sales', progress: 88, points: 2120 },
      { rank: 3, name: 'Maria Santos', initials: 'MS', department: 'Marketing', progress: 85, points: 1980 },
      { rank: 4, name: 'James Wilson', initials: 'JW', department: 'Business Development', progress: 79, points: 1760 },
      { rank: 5, name: 'Aisha Kumar', initials: 'AK', department: 'Sales', progress: 74, points: 1640 },
      { rank: 6, name: 'Tom Bradley', initials: 'TB', department: 'Business Development', progress: 71, points: 1520 },
      { rank: 7, name: 'Lisa Zhang', initials: 'LZ', department: 'Accounts', progress: 68, points: 1450 },
      { rank: 8, name: 'David Kim', initials: 'DK', department: 'Marketing', progress: 64, points: 1320 },
      { rank: 9, name: 'Emma Davis', initials: 'ED', department: 'Sales', progress: 61, points: 1240 },
      { rank: 10, name: 'Chris Morgan', initials: 'CM', department: 'Business Development', progress: 58, points: 1180 },
    ],
  },
  {
    id: 'sales',
    name: 'Sales Academy',
    description: 'Develop world-class sales skills tailored for the wellness industry. From product pitching to closing techniques, this academy equips you with everything needed to exceed sales targets.',
    shortDescription: 'Product sales, pitching, closing techniques',
    color: '#c19a6b',
    colorClass: 'bg-[#c19a6b]',
    icon: 'Target',
    iconFn: Target,
    courseCount: 8,
    enrollmentCount: 285,
    avgRating: 4.7,
    totalHours: 28,
    levelRange: 'Beginner–Advanced',
    courses: [
      { id: 'sa-01', title: 'Sales Fundamentals', description: 'Core sales principles and the wellness product ecosystem.', duration: '2.5h', durationHours: 2.5, modules: 3, level: 'Beginner', status: 'Completed', progress: 100, learningObjectives: ['Master sales fundamentals', 'Understand wellness products', 'Build rapport with clients'], moduleBreakdown: [{ title: 'Sales Basics', duration: '50min' }, { title: 'Product Knowledge', duration: '50min' }, { title: 'Client Rapport', duration: '50min' }], instructor: { name: 'Mike Torres', role: 'Sales Trainer', initials: 'MT' } },
      { id: 'sa-02', title: 'Product Pitching Mastery', description: 'Create and deliver compelling product presentations.', duration: '3h', durationHours: 3, modules: 4, level: 'Beginner', status: 'Completed', progress: 100, learningObjectives: ['Craft compelling pitches', 'Handle objections', 'Close more deals'], moduleBreakdown: [{ title: 'Pitch Structure', duration: '45min' }, { title: 'Storytelling', duration: '45min' }, { title: 'Objection Handling', duration: '45min' }, { title: 'Practice Lab', duration: '45min' }], instructor: { name: 'Nina Foster', role: 'Senior Sales Rep', initials: 'NF' } },
      { id: 'sa-03', title: 'Closing Techniques', description: 'Advanced strategies to close deals effectively and consistently.', duration: '3.5h', durationHours: 3.5, modules: 4, level: 'Intermediate', status: 'In Progress', progress: 50, learningObjectives: ['Master closing techniques', 'Read buying signals', 'Overcome final objections'], moduleBreakdown: [{ title: 'Closing Fundamentals', duration: '55min' }, { title: 'Advanced Techniques', duration: '55min' }, { title: 'Reading Signals', duration: '55min' }, { title: 'Role Play', duration: '55min' }], instructor: { name: 'Oliver Grant', role: 'Sales Director', initials: 'OG' } },
      { id: 'sa-04', title: 'Wellness Consultative Selling', description: 'Use consultative selling approaches for wellness solutions.', duration: '4h', durationHours: 4, modules: 5, level: 'Intermediate', status: 'Not Started', progress: 0, learningObjectives: ['Adopt consultative approach', 'Identify client needs', 'Recommend solutions'], moduleBreakdown: [{ title: 'Consultative Mindset', duration: '50min' }, { title: 'Needs Assessment', duration: '50min' }, { title: 'Solution Mapping', duration: '50min' }, { title: 'Proposal Creation', duration: '50min' }, { title: 'Follow-up Strategies', duration: '50min' }], instructor: { name: 'Priya Sharma', role: 'Wellness Consultant', initials: 'PS' } },
      { id: 'sa-05', title: 'B2B Sales Excellence', description: 'Navigate complex B2B sales cycles in the wellness industry.', duration: '4h', durationHours: 4, modules: 5, level: 'Advanced', status: 'Not Started', progress: 0, learningObjectives: ['Navigate B2B cycles', 'Build stakeholder maps', 'Manage complex deals'], moduleBreakdown: [{ title: 'B2B Basics', duration: '50min' }, { title: 'Stakeholder Mapping', duration: '50min' }, { title: 'Deal Management', duration: '50min' }, { title: 'Proposal Writing', duration: '50min' }, { title: 'Case Studies', duration: '50min' }], instructor: { name: 'Quinn Blake', role: 'B2B Sales Lead', initials: 'QB' } },
      { id: 'sa-06', title: 'Digital Sales Tools', description: 'Leverage CRM and digital tools to enhance sales productivity.', duration: '2.5h', durationHours: 2.5, modules: 3, level: 'Beginner', status: 'Not Started', progress: 0, learningObjectives: ['Use CRM effectively', 'Automate sales tasks', 'Analyze sales data'], moduleBreakdown: [{ title: 'CRM Mastery', duration: '50min' }, { title: 'Sales Automation', duration: '50min' }, { title: 'Data Analytics', duration: '50min' }], instructor: { name: 'Rachel Adams', role: 'Sales Ops Manager', initials: 'RA' } },
      { id: 'sa-07', title: 'Objection Handling Advanced', description: 'Master the art of handling any objection with confidence.', duration: '3.5h', durationHours: 3.5, modules: 4, level: 'Intermediate', status: 'Not Started', progress: 0, learningObjectives: ['Handle any objection', 'Turn objections into opportunities', 'Build confidence'], moduleBreakdown: [{ title: 'Objection Types', duration: '55min' }, { title: 'Response Frameworks', duration: '55min' }, { title: 'Turning Tables', duration: '55min' }, { title: 'Live Practice', duration: '55min' }], instructor: { name: 'Steve Lewis', role: 'Sales Coach', initials: 'SL' } },
      { id: 'sa-08', title: 'Sales Leadership', description: 'Lead and motivate high-performing sales teams.', duration: '5h', durationHours: 5, modules: 6, level: 'Advanced', status: 'Not Started', progress: 0, learningObjectives: ['Lead sales teams', 'Set sales culture', 'Drive performance'], moduleBreakdown: [{ title: 'Leadership Basics', duration: '50min' }, { title: 'Team Building', duration: '50min' }, { title: 'Performance Management', duration: '50min' }, { title: 'Coaching Skills', duration: '50min' }, { title: 'Sales Culture', duration: '50min' }, { title: 'Strategic Planning', duration: '50min' }], instructor: { name: 'Tina Moore', role: 'VP of Sales', initials: 'TM' } },
    ],
    resources: [
      { id: 'sa-r1', title: 'Sales Playbook 2024', description: 'Complete sales strategies and tactics', type: 'PDF', size: '5.1MB', date: 'Oct 2024' },
      { id: 'sa-r2', title: 'Product Catalog Guide', description: 'Full wellness product catalog with selling points', type: 'PDF', size: '3.4MB', date: 'Sep 2024' },
      { id: 'sa-r3', title: 'CRM Quick Start Guide', description: 'Getting started with the sales CRM', type: 'Video', duration: '30min', date: 'Aug 2024' },
      { id: 'sa-r4', title: 'Objection Handling Cheat Sheet', description: 'Quick reference for common objections', type: 'DOCX', size: '520KB', date: 'Jul 2024' },
      { id: 'sa-r5', title: 'Sales KPI Dashboard', description: 'Interactive dashboard for tracking sales metrics', type: 'Link', date: 'Sep 2024' },
      { id: 'sa-r6', title: 'Top Performer Interview Series', description: 'Insights from top-performing sales reps', type: 'Video', duration: '60min', date: 'Oct 2024' },
    ],
    leaderboard: [
      { rank: 1, name: 'Mike Torres', initials: 'MT', department: 'Sales', progress: 90, points: 2180 },
      { rank: 2, name: 'Nina Foster', initials: 'NF', department: 'Sales', progress: 86, points: 2040 },
      { rank: 3, name: 'Oliver Grant', initials: 'OG', department: 'Sales', progress: 82, points: 1890 },
      { rank: 4, name: 'Priya Sharma', initials: 'PS', department: 'Sales', progress: 78, points: 1720 },
      { rank: 5, name: 'Rachel Adams', initials: 'RA', department: 'Sales', progress: 72, points: 1580 },
    ],
  },
  {
    id: 'post-design',
    name: 'Post Design Academy',
    description: 'Master the art and science of wellness product design. From CAD modeling to product customization and photorealistic rendering, build the skills needed to create innovative wellness solutions.',
    shortDescription: 'CAD design, product customization, rendering',
    color: '#8c8a6e',
    colorClass: 'bg-[#8c8a6e]',
    icon: 'PenTool',
    iconFn: PenTool,
    courseCount: 8,
    enrollmentCount: 198,
    avgRating: 4.6,
    totalHours: 30,
    levelRange: 'Beginner–Advanced',
    courses: [
      { id: 'pd-01', title: 'Design Fundamentals', description: 'Learn the core principles of product design for wellness.', duration: '2.5h', durationHours: 2.5, modules: 3, level: 'Beginner', status: 'Completed', progress: 100, learningObjectives: ['Understand design principles', 'Apply color theory', 'Create design specs'], moduleBreakdown: [{ title: 'Design Principles', duration: '50min' }, { title: 'Color & Material', duration: '50min' }, { title: 'Specification Creation', duration: '50min' }], instructor: { name: 'Anna Lee', role: 'Senior Designer', initials: 'AL' } },
      { id: 'pd-02', title: 'CAD Modeling Basics', description: 'Get started with CAD software for product modeling.', duration: '4h', durationHours: 4, modules: 5, level: 'Beginner', status: 'Completed', progress: 100, learningObjectives: ['Navigate CAD interface', 'Create basic models', 'Apply constraints'], moduleBreakdown: [{ title: 'CAD Interface', duration: '50min' }, { title: '2D Sketching', duration: '50min' }, { title: '3D Modeling', duration: '50min' }, { title: 'Constraints', duration: '50min' }, { title: 'Practice Project', duration: '50min' }], instructor: { name: 'Ben Carter', role: 'CAD Specialist', initials: 'BC' } },
      { id: 'pd-03', title: 'Advanced CAD Techniques', description: 'Complex modeling, assemblies, and parametric design.', duration: '4.5h', durationHours: 4.5, modules: 5, level: 'Intermediate', status: 'In Progress', progress: 45, learningObjectives: ['Build complex assemblies', 'Use parametric design', 'Create design families'], moduleBreakdown: [{ title: 'Advanced Features', duration: '55min' }, { title: 'Assemblies', duration: '55min' }, { title: 'Parametric Design', duration: '55min' }, { title: 'Design Tables', duration: '55min' }, { title: 'Advanced Project', duration: '55min' }], instructor: { name: 'Cathy Wong', role: 'Design Engineer', initials: 'CW' } },
      { id: 'pd-04', title: 'Product Customization', description: 'Design customizable wellness products for diverse client needs.', duration: '4h', durationHours: 4, modules: 5, level: 'Intermediate', status: 'Not Started', progress: 0, learningObjectives: ['Design for customization', 'Create option matrices', 'Manage configurations'], moduleBreakdown: [{ title: 'Customization Strategy', duration: '50min' }, { title: 'Option Design', duration: '50min' }, { title: 'Configuration Tools', duration: '50min' }, { title: 'Client Workflow', duration: '50min' }, { title: 'Case Study', duration: '50min' }], instructor: { name: 'Dan Rivera', role: 'Product Manager', initials: 'DR' } },
      { id: 'pd-05', title: 'Photorealistic Rendering', description: 'Create stunning product visualizations for presentations.', duration: '3.5h', durationHours: 3.5, modules: 4, level: 'Intermediate', status: 'Not Started', progress: 0, learningObjectives: ['Master rendering software', 'Set up lighting', 'Create presentations'], moduleBreakdown: [{ title: 'Rendering Basics', duration: '55min' }, { title: 'Materials & Textures', duration: '55min' }, { title: 'Lighting Setup', duration: '55min' }, { title: 'Final Output', duration: '55min' }], instructor: { name: 'Eva Johnson', role: 'Visualization Artist', initials: 'EJ' } },
      { id: 'pd-06', title: 'Design for Manufacturing', description: 'Optimize designs for efficient manufacturing processes.', duration: '3.5h', durationHours: 3.5, modules: 4, level: 'Advanced', status: 'Not Started', progress: 0, learningObjectives: ['Apply DFM principles', 'Reduce production costs', 'Ensure quality'], moduleBreakdown: [{ title: 'DFM Principles', duration: '55min' }, { title: 'Material Selection', duration: '55min' }, { title: 'Cost Optimization', duration: '55min' }, { title: 'Quality Gates', duration: '55min' }], instructor: { name: 'Frank Thomas', role: 'Manufacturing Engineer', initials: 'FT' } },
      { id: 'pd-07', title: 'AI in Wellness Product Design', description: 'Leverage AI tools to accelerate and enhance product design.', duration: '4h', durationHours: 4, modules: 5, level: 'Advanced', status: 'Not Started', progress: 0, learningObjectives: ['Use AI design tools', 'Generate concepts with AI', 'Optimize workflows'], moduleBreakdown: [{ title: 'AI Tools Overview', duration: '50min' }, { title: 'Concept Generation', duration: '50min' }, { title: 'Design Optimization', duration: '50min' }, { title: 'Workflow Integration', duration: '50min' }, { title: 'Future Trends', duration: '50min' }], instructor: { name: 'Grace Hill', role: 'AI Design Lead', initials: 'GH' } },
      { id: 'pd-08', title: 'Design Portfolio Building', description: 'Create a professional design portfolio showcasing your work.', duration: '3h', durationHours: 3, modules: 4, level: 'Intermediate', status: 'Not Started', progress: 0, learningObjectives: ['Curate best work', 'Present effectively', 'Build personal brand'], moduleBreakdown: [{ title: 'Portfolio Strategy', duration: '45min' }, { title: 'Case Study Format', duration: '45min' }, { title: 'Presentation Skills', duration: '45min' }, { title: 'Final Portfolio', duration: '45min' }], instructor: { name: 'Henry Clark', role: 'Design Director', initials: 'HC' } },
    ],
    resources: [
      { id: 'pd-r1', title: 'CAD Model Library', description: 'Repository of standard CAD models and components', type: 'Link', date: 'Oct 2024' },
      { id: 'pd-r2', title: 'Material Reference Guide', description: 'Comprehensive guide to wellness product materials', type: 'PDF', size: '6.2MB', date: 'Sep 2024' },
      { id: 'pd-r3', title: 'Rendering Tutorial Series', description: 'Step-by-step rendering tutorials', type: 'Video', duration: '90min', date: 'Aug 2024' },
      { id: 'pd-r4', title: 'Design Templates Pack', description: 'Ready-to-use design templates', type: 'DOCX', size: '12MB', date: 'Jul 2024' },
      { id: 'pd-r5', title: 'AI Design Tools Comparison', description: 'Comparison of AI design platforms', type: 'PDF', size: '2.1MB', date: 'Oct 2024' },
      { id: 'pd-r6', title: 'Design Standards Document', description: 'Internal design standards and guidelines', type: 'PDF', size: '3.5MB', date: 'Jun 2024' },
    ],
    leaderboard: [
      { rank: 1, name: 'Anna Lee', initials: 'AL', department: 'Post Design', progress: 88, points: 2100 },
      { rank: 2, name: 'Ben Carter', initials: 'BC', department: 'Post Design', progress: 84, points: 1920 },
      { rank: 3, name: 'Cathy Wong', initials: 'CW', department: 'Post Design', progress: 80, points: 1780 },
      { rank: 4, name: 'Eva Johnson', initials: 'EJ', department: 'Post Design', progress: 75, points: 1620 },
      { rank: 5, name: 'Grace Hill', initials: 'GH', department: 'Post Design', progress: 70, points: 1500 },
    ],
  },
  {
    id: 'installation',
    name: 'Installation Academy',
    description: 'Become an expert in wellness product installation. Cover on-site procedures, troubleshooting, safety protocols, and customer interaction best practices.',
    shortDescription: 'On-site installation, troubleshooting, safety',
    color: '#5a7a7e',
    colorClass: 'bg-[#5a7a7e]',
    icon: 'Wrench',
    iconFn: Wrench,
    courseCount: 8,
    enrollmentCount: 256,
    avgRating: 4.7,
    totalHours: 26,
    levelRange: 'Beginner–Advanced',
    courses: [
      { id: 'in-01', title: 'Installation Basics', description: 'Fundamentals of wellness product installation.', duration: '2h', durationHours: 2, modules: 3, level: 'Beginner', status: 'Completed', progress: 100, learningObjectives: ['Understand installation flow', 'Use tools correctly', 'Follow safety protocols'], moduleBreakdown: [{ title: 'Preparation', duration: '40min' }, { title: 'Tool Mastery', duration: '40min' }, { title: 'Safety Essentials', duration: '40min' }], instructor: { name: 'Jack Miller', role: 'Lead Installer', initials: 'JM' } },
      { id: 'in-02', title: 'Product-Specific Installation', description: 'Installation procedures for each Magppie product line.', duration: '3.5h', durationHours: 3.5, modules: 4, level: 'Beginner', status: 'Completed', progress: 100, learningObjectives: ['Install each product line', 'Follow product manuals', 'Handle variations'], moduleBreakdown: [{ title: 'Product Line A', duration: '55min' }, { title: 'Product Line B', duration: '55min' }, { title: 'Product Line C', duration: '55min' }, { title: 'Custom Installations', duration: '55min' }], instructor: { name: 'Karen Scott', role: 'Installation Supervisor', initials: 'KS' } },
      { id: 'in-03', title: 'Advanced Troubleshooting', description: 'Diagnose and resolve complex installation issues.', duration: '3.5h', durationHours: 3.5, modules: 4, level: 'Intermediate', status: 'In Progress', progress: 40, learningObjectives: ['Diagnose issues quickly', 'Apply fixes efficiently', 'Document problems'], moduleBreakdown: [{ title: 'Diagnostic Framework', duration: '55min' }, { title: 'Common Issues', duration: '55min' }, { title: 'Advanced Problems', duration: '55min' }, { title: 'Documentation', duration: '55min' }], instructor: { name: 'Leo Martinez', role: 'Technical Lead', initials: 'LM' } },
      { id: 'in-04', title: 'Safety Protocols & Compliance', description: 'Master safety standards and regulatory compliance.', duration: '3h', durationHours: 3, modules: 4, level: 'Intermediate', status: 'Not Started', progress: 0, learningObjectives: ['Follow safety standards', 'Ensure compliance', 'Handle emergencies'], moduleBreakdown: [{ title: 'Safety Standards', duration: '45min' }, { title: 'Compliance Checklist', duration: '45min' }, { title: 'Emergency Procedures', duration: '45min' }, { title: 'Audit Preparation', duration: '45min' }], instructor: { name: 'Nancy Wright', role: 'Safety Officer', initials: 'NW' } },
      { id: 'in-05', title: 'Customer Interaction', description: 'Professional communication during on-site visits.', duration: '2.5h', durationHours: 2.5, modules: 3, level: 'Beginner', status: 'Not Started', progress: 0, learningObjectives: ['Communicate professionally', 'Manage expectations', 'Handle complaints'], moduleBreakdown: [{ title: 'Professional Conduct', duration: '50min' }, { title: 'Expectation Management', duration: '50min' }, { title: 'Issue Resolution', duration: '50min' }], instructor: { name: 'Oscar White', role: 'Customer Success', initials: 'OW' } },
      { id: 'in-06', title: 'Electrical & Plumbing Integration', description: 'Integrate wellness products with existing building systems.', duration: '4h', durationHours: 4, modules: 5, level: 'Advanced', status: 'Not Started', progress: 0, learningObjectives: ['Understand building systems', 'Plan integrations', 'Execute safely'], moduleBreakdown: [{ title: 'Electrical Basics', duration: '50min' }, { title: 'Plumbing Basics', duration: '50min' }, { title: 'Integration Planning', duration: '50min' }, { title: 'Execution', duration: '50min' }, { title: 'Testing', duration: '50min' }], instructor: { name: 'Paul Garcia', role: 'Systems Engineer', initials: 'PG' } },
      { id: 'in-07', title: 'Quality Assurance for Installations', description: 'Ensure every installation meets Magppie quality standards.', duration: '3h', durationHours: 3, modules: 4, level: 'Intermediate', status: 'Not Started', progress: 0, learningObjectives: ['Follow QA processes', 'Conduct inspections', 'Document quality'], moduleBreakdown: [{ title: 'QA Framework', duration: '45min' }, { title: 'Inspection Checklist', duration: '45min' }, { title: 'Documentation', duration: '45min' }, { title: 'Continuous Improvement', duration: '45min' }], instructor: { name: 'Quinn Roberts', role: 'QA Manager', initials: 'QR' } },
      { id: 'in-08', title: 'Team Lead Installation Management', description: 'Lead installation teams effectively on large projects.', duration: '4h', durationHours: 4, modules: 5, level: 'Advanced', status: 'Not Started', progress: 0, learningObjectives: ['Lead install teams', 'Manage project timelines', 'Ensure quality at scale'], moduleBreakdown: [{ title: 'Team Leadership', duration: '50min' }, { title: 'Project Planning', duration: '50min' }, { title: 'Timeline Management', duration: '50min' }, { title: 'Quality at Scale', duration: '50min' }, { title: 'Case Studies', duration: '50min' }], instructor: { name: 'Rachel Green', role: 'Installation Director', initials: 'RG' } },
    ],
    resources: [
      { id: 'in-r1', title: 'Installation Manual Library', description: 'Complete collection of installation manuals', type: 'PDF', size: '15MB', date: 'Oct 2024' },
      { id: 'in-r2', title: 'Safety Checklist App', description: 'Digital safety checklist tool', type: 'Link', date: 'Sep 2024' },
      { id: 'in-r3', title: 'Troubleshooting Video Guide', description: 'Video walkthroughs of common issues', type: 'Video', duration: '120min', date: 'Aug 2024' },
      { id: 'in-r4', title: 'Tool Maintenance Guide', description: 'Proper care and maintenance of installation tools', type: 'PDF', size: '2.3MB', date: 'Jul 2024' },
      { id: 'in-r5', title: 'Customer Communication Templates', description: 'Email and report templates', type: 'DOCX', size: '1.1MB', date: 'Sep 2024' },
      { id: 'in-r6', title: 'Integration Diagrams', description: 'Technical diagrams for building system integration', type: 'PDF', size: '4.5MB', date: 'Jun 2024' },
    ],
    leaderboard: [
      { rank: 1, name: 'Jack Miller', initials: 'JM', department: 'Installation', progress: 91, points: 2250 },
      { rank: 2, name: 'Karen Scott', initials: 'KS', department: 'Installation', progress: 87, points: 2060 },
      { rank: 3, name: 'Leo Martinez', initials: 'LM', department: 'Installation', progress: 83, points: 1880 },
      { rank: 4, name: 'Paul Garcia', initials: 'PG', department: 'Installation', progress: 77, points: 1700 },
      { rank: 5, name: 'Rachel Green', initials: 'RG', department: 'Installation', progress: 72, points: 1560 },
    ],
  },
  {
    id: 'factory-production',
    name: 'Factory & Production Academy',
    description: 'Master manufacturing processes, lean production methodologies, and safety standards. Optimize production workflows and ensure consistent product quality at scale.',
    shortDescription: 'Manufacturing processes, lean production, safety',
    color: '#7a8a7a',
    colorClass: 'bg-[#7a8a7a]',
    icon: 'Factory',
    iconFn: Factory,
    courseCount: 8,
    enrollmentCount: 312,
    avgRating: 4.5,
    totalHours: 30,
    levelRange: 'Beginner–Advanced',
    courses: [
      { id: 'fp-01', title: 'Manufacturing Fundamentals', description: 'Introduction to wellness product manufacturing processes.', duration: '3h', durationHours: 3, modules: 4, level: 'Beginner', status: 'Completed', progress: 100, learningObjectives: ['Understand production flow', 'Learn manufacturing terms', 'Follow standard procedures'], moduleBreakdown: [{ title: 'Production Overview', duration: '45min' }, { title: 'Key Processes', duration: '45min' }, { title: 'Terminology', duration: '45min' }, { title: 'Standard Procedures', duration: '45min' }], instructor: { name: 'Sam Adams', role: 'Production Manager', initials: 'SA' } },
      { id: 'fp-02', title: 'Lean Production Principles', description: 'Apply lean methodology to eliminate waste and improve efficiency.', duration: '4h', durationHours: 4, modules: 5, level: 'Intermediate', status: 'Completed', progress: 100, learningObjectives: ['Identify waste types', 'Apply lean tools', 'Optimize workflows'], moduleBreakdown: [{ title: 'Lean Basics', duration: '50min' }, { title: 'Waste Identification', duration: '50min' }, { title: 'Lean Tools', duration: '50min' }, { title: 'Workflow Optimization', duration: '50min' }, { title: 'Kaizen Events', duration: '50min' }], instructor: { name: 'Tina Brooks', role: 'Lean Expert', initials: 'TB' } },
      { id: 'fp-03', title: 'Production Scheduling', description: 'Master production planning and scheduling for optimal throughput.', duration: '3.5h', durationHours: 3.5, modules: 4, level: 'Intermediate', status: 'In Progress', progress: 55, learningObjectives: ['Create schedules', 'Balance workloads', 'Handle disruptions'], moduleBreakdown: [{ title: 'Scheduling Basics', duration: '55min' }, { title: 'Capacity Planning', duration: '55min' }, { title: 'Workload Balancing', duration: '55min' }, { title: 'Contingency Planning', duration: '55min' }], instructor: { name: 'Uma Clarke', role: 'Planning Manager', initials: 'UC' } },
      { id: 'fp-04', title: 'Equipment Maintenance', description: 'Implement preventive maintenance programs for production equipment.', duration: '3h', durationHours: 3, modules: 4, level: 'Intermediate', status: 'Not Started', progress: 0, learningObjectives: ['Plan maintenance', 'Diagnose issues', 'Minimize downtime'], moduleBreakdown: [{ title: 'Maintenance Types', duration: '45min' }, { title: 'Preventive Schedules', duration: '45min' }, { title: 'Troubleshooting', duration: '45min' }, { title: 'Downtime Reduction', duration: '45min' }], instructor: { name: 'Victor Price', role: 'Maintenance Supervisor', initials: 'VP' } },
      { id: 'fp-05', title: 'Sustainable Manufacturing Practices', description: 'Implement eco-friendly manufacturing processes and reduce environmental impact.', duration: '3.5h', durationHours: 3.5, modules: 4, level: 'Intermediate', status: 'Not Started', progress: 0, learningObjectives: ['Apply green manufacturing', 'Reduce waste', 'Track sustainability'], moduleBreakdown: [{ title: 'Green Principles', duration: '55min' }, { title: 'Waste Reduction', duration: '55min' }, { title: 'Energy Efficiency', duration: '55min' }, { title: 'Sustainability Reporting', duration: '55min' }], instructor: { name: 'Wendy Hall', role: 'Sustainability Officer', initials: 'WH' } },
      { id: 'fp-06', title: 'Production Safety Standards', description: 'Comprehensive safety training for factory floor personnel.', duration: '3h', durationHours: 3, modules: 4, level: 'Beginner', status: 'Not Started', progress: 0, learningObjectives: ['Follow safety protocols', 'Identify hazards', 'Respond to incidents'], moduleBreakdown: [{ title: 'Safety Protocols', duration: '45min' }, { title: 'Hazard Identification', duration: '45min' }, { title: 'PPE Usage', duration: '45min' }, { title: 'Incident Response', duration: '45min' }], instructor: { name: 'Xavier King', role: 'Safety Manager', initials: 'XK' } },
      { id: 'fp-07', title: 'Quality Control on the Floor', description: 'Implement real-time quality checks during production.', duration: '3.5h', durationHours: 3.5, modules: 4, level: 'Intermediate', status: 'Not Started', progress: 0, learningObjectives: ['Set up quality checks', 'Use inspection tools', 'Document results'], moduleBreakdown: [{ title: 'QC Fundamentals', duration: '55min' }, { title: 'Inspection Methods', duration: '55min' }, { title: 'Tool Usage', duration: '55min' }, { title: 'Documentation', duration: '55min' }], instructor: { name: 'Yara Lewis', role: 'Floor QC Lead', initials: 'YL' } },
      { id: 'fp-08', title: 'Production Leadership', description: 'Lead production teams to achieve operational excellence.', duration: '4h', durationHours: 4, modules: 5, level: 'Advanced', status: 'Not Started', progress: 0, learningObjectives: ['Lead teams effectively', 'Drive continuous improvement', 'Manage change'], moduleBreakdown: [{ title: 'Leadership Skills', duration: '50min' }, { title: 'Team Motivation', duration: '50min' }, { title: 'Continuous Improvement', duration: '50min' }, { title: 'Change Management', duration: '50min' }, { title: 'KPI Management', duration: '50min' }], instructor: { name: 'Zack Turner', role: 'Plant Manager', initials: 'ZT' } },
    ],
    resources: [
      { id: 'fp-r1', title: 'Production Process Map', description: 'Visual map of the entire production process', type: 'PDF', size: '5.5MB', date: 'Oct 2024' },
      { id: 'fp-r2', title: 'Lean Toolkit', description: 'Digital templates for lean manufacturing', type: 'DOCX', size: '3.2MB', date: 'Sep 2024' },
      { id: 'fp-r3', title: 'Equipment Maintenance Logs', description: 'Digital maintenance tracking system', type: 'Link', date: 'Aug 2024' },
      { id: 'fp-r4', title: 'Sustainability Dashboard', description: 'Track sustainability KPIs', type: 'Link', date: 'Jul 2024' },
      { id: 'fp-r5', title: 'Safety Training Videos', description: 'Comprehensive safety training video series', type: 'Video', duration: '80min', date: 'Sep 2024' },
      { id: 'fp-r6', title: 'Production Standards Manual', description: 'Complete production standards documentation', type: 'PDF', size: '8.1MB', date: 'Jun 2024' },
    ],
    leaderboard: [
      { rank: 1, name: 'Sam Adams', initials: 'SA', department: 'Factory', progress: 89, points: 2200 },
      { rank: 2, name: 'Tina Brooks', initials: 'TB', department: 'Factory', progress: 85, points: 2020 },
      { rank: 3, name: 'Uma Clarke', initials: 'UC', department: 'Factory', progress: 81, points: 1860 },
      { rank: 4, name: 'Wendy Hall', initials: 'WH', department: 'Factory', progress: 76, points: 1680 },
      { rank: 5, name: 'Zack Turner', initials: 'ZT', department: 'Factory', progress: 71, points: 1540 },
    ],
  },
  {
    id: 'quality-control',
    name: 'Quality Control Academy',
    description: 'Ensure product excellence through rigorous quality control. Learn testing protocols, compliance standards, Six Sigma methodology, and defect prevention strategies.',
    shortDescription: 'Testing protocols, compliance, Six Sigma',
    color: '#c4a0a0',
    colorClass: 'bg-[#c4a0a0]',
    icon: 'ShieldCheck',
    iconFn: ShieldCheck,
    courseCount: 8,
    enrollmentCount: 224,
    avgRating: 4.6,
    totalHours: 28,
    levelRange: 'Intermediate–Advanced',
    courses: [
      { id: 'qc-01', title: 'Quality Control Fundamentals', description: 'Core principles of quality control for wellness products.', duration: '2.5h', durationHours: 2.5, modules: 3, level: 'Beginner', status: 'Completed', progress: 100, learningObjectives: ['Understand QC basics', 'Follow inspection procedures', 'Document findings'], moduleBreakdown: [{ title: 'QC Principles', duration: '50min' }, { title: 'Inspection Procedures', duration: '50min' }, { title: 'Documentation', duration: '50min' }], instructor: { name: 'Amy Foster', role: 'QC Specialist', initials: 'AF' } },
      { id: 'qc-02', title: 'Testing Protocols & Standards', description: 'Master industry-standard testing protocols for wellness products.', duration: '3.5h', durationHours: 3.5, modules: 4, level: 'Intermediate', status: 'Completed', progress: 100, learningObjectives: ['Apply testing standards', 'Use testing equipment', 'Interpret results'], moduleBreakdown: [{ title: 'Testing Standards', duration: '55min' }, { title: 'Equipment Usage', duration: '55min' }, { title: 'Result Interpretation', duration: '55min' }, { title: 'Report Writing', duration: '55min' }], instructor: { name: 'Brian Cole', role: 'Testing Engineer', initials: 'BC' } },
      { id: 'qc-03', title: 'Six Sigma Green Belt', description: 'Apply Six Sigma methodology to improve quality and reduce defects.', duration: '5h', durationHours: 5, modules: 6, level: 'Advanced', status: 'In Progress', progress: 35, learningObjectives: ['Apply DMAIC framework', 'Use statistical tools', 'Lead improvement projects'], moduleBreakdown: [{ title: 'DMAIC Overview', duration: '50min' }, { title: 'Define Phase', duration: '50min' }, { title: 'Measure Phase', duration: '50min' }, { title: 'Analyze Phase', duration: '50min' }, { title: 'Improve Phase', duration: '50min' }, { title: 'Control Phase', duration: '50min' }], instructor: { name: 'Cathy Reed', role: 'Six Sigma Black Belt', initials: 'CR' } },
      { id: 'qc-04', title: 'Compliance & Regulatory Standards', description: 'Navigate wellness industry regulations and compliance requirements.', duration: '3h', durationHours: 3, modules: 4, level: 'Intermediate', status: 'Not Started', progress: 0, learningObjectives: ['Understand regulations', 'Ensure compliance', 'Prepare for audits'], moduleBreakdown: [{ title: 'Regulatory Landscape', duration: '45min' }, { title: 'Compliance Requirements', duration: '45min' }, { title: 'Audit Preparation', duration: '45min' }, { title: 'Documentation', duration: '45min' }], instructor: { name: 'Derek Lane', role: 'Compliance Officer', initials: 'DL' } },
      { id: 'qc-05', title: 'Defect Prevention Strategies', description: 'Proactive approaches to preventing defects before they occur.', duration: '3h', durationHours: 3, modules: 4, level: 'Intermediate', status: 'Not Started', progress: 0, learningObjectives: ['Identify root causes', 'Implement prevention', 'Monitor effectiveness'], moduleBreakdown: [{ title: 'Root Cause Analysis', duration: '45min' }, { title: 'Prevention Methods', duration: '45min' }, { title: 'FMEA', duration: '45min' }, { title: 'Monitoring Systems', duration: '45min' }], instructor: { name: 'Eva Stone', role: 'Quality Engineer', initials: 'ES' } },
      { id: 'qc-06', title: 'Statistical Process Control', description: 'Use statistical methods to monitor and control production quality.', duration: '4h', durationHours: 4, modules: 5, level: 'Advanced', status: 'Not Started', progress: 0, learningObjectives: ['Create control charts', 'Analyze process capability', 'Make data-driven decisions'], moduleBreakdown: [{ title: 'SPC Basics', duration: '50min' }, { title: 'Control Charts', duration: '50min' }, { title: 'Process Capability', duration: '50min' }, { title: 'Data Analysis', duration: '50min' }, { title: 'Implementation', duration: '50min' }], instructor: { name: 'Frank Ross', role: 'Statistician', initials: 'FR' } },
      { id: 'qc-07', title: 'Supplier Quality Management', description: 'Ensure quality standards across the supplier network.', duration: '3h', durationHours: 3, modules: 4, level: 'Intermediate', status: 'Not Started', progress: 0, learningObjectives: ['Audit suppliers', 'Set quality requirements', 'Manage relationships'], moduleBreakdown: [{ title: 'Supplier Assessment', duration: '45min' }, { title: 'Quality Agreements', duration: '45min' }, { title: 'Audit Process', duration: '45min' }, { title: 'Performance Management', duration: '45min' }], instructor: { name: 'Gina Bell', role: 'Supplier Quality Manager', initials: 'GB' } },
      { id: 'qc-08', title: 'Quality Leadership', description: 'Lead quality initiatives and build a culture of excellence.', duration: '4h', durationHours: 4, modules: 5, level: 'Advanced', status: 'Not Started', progress: 0, learningObjectives: ['Lead quality programs', 'Build quality culture', 'Drive strategic initiatives'], moduleBreakdown: [{ title: 'Quality Leadership', duration: '50min' }, { title: 'Culture Building', duration: '50min' }, { title: 'Strategic Planning', duration: '50min' }, { title: 'Change Management', duration: '50min' }, { title: 'Metrics & KPIs', duration: '50min' }], instructor: { name: 'Henry West', role: 'Quality Director', initials: 'HW' } },
    ],
    resources: [
      { id: 'qc-r1', title: 'QC Testing Procedures Manual', description: 'Complete testing procedures documentation', type: 'PDF', size: '7.2MB', date: 'Oct 2024' },
      { id: 'qc-r2', title: 'Six Sigma Toolkit', description: 'Templates and tools for Six Sigma projects', type: 'DOCX', size: '4.5MB', date: 'Sep 2024' },
      { id: 'qc-r3', title: 'Compliance Checklist', description: 'Interactive compliance checklist', type: 'Link', date: 'Aug 2024' },
      { id: 'qc-r4', title: 'SPC Software Tutorial', description: 'Video guide to SPC software', type: 'Video', duration: '55min', date: 'Jul 2024' },
      { id: 'qc-r5', title: 'Defect Analysis Template', description: 'Template for analyzing defect patterns', type: 'DOCX', size: '1.3MB', date: 'Sep 2024' },
      { id: 'qc-r6', title: 'Supplier Audit Guide', description: 'Guide for conducting supplier audits', type: 'PDF', size: '3.8MB', date: 'Jun 2024' },
    ],
    leaderboard: [
      { rank: 1, name: 'Amy Foster', initials: 'AF', department: 'Quality Control', progress: 93, points: 2300 },
      { rank: 2, name: 'Brian Cole', initials: 'BC', department: 'Quality Control', progress: 88, points: 2100 },
      { rank: 3, name: 'Cathy Reed', initials: 'CR', department: 'Quality Control', progress: 84, points: 1940 },
      { rank: 4, name: 'Derek Lane', initials: 'DL', department: 'Quality Control', progress: 79, points: 1760 },
      { rank: 5, name: 'Eva Stone', initials: 'ES', department: 'Quality Control', progress: 73, points: 1600 },
    ],
  },
  {
    id: 'purchase',
    name: 'Purchase Academy',
    description: 'Develop expertise in procurement, vendor management, and negotiation. Learn to source high-quality materials at optimal costs while building strong supplier relationships.',
    shortDescription: 'Vendor management, negotiation, procurement',
    color: '#d4c4a8',
    colorClass: 'bg-[#d4c4a8]',
    icon: 'ShoppingCart',
    iconFn: ShoppingCart,
    courseCount: 8,
    enrollmentCount: 176,
    avgRating: 4.5,
    totalHours: 24,
    levelRange: 'Beginner–Advanced',
    courses: [
      { id: 'pu-01', title: 'Procurement Fundamentals', description: 'Introduction to procurement processes and best practices.', duration: '2h', durationHours: 2, modules: 3, level: 'Beginner', status: 'Completed', progress: 100, learningObjectives: ['Understand procurement cycle', 'Follow sourcing procedures', 'Manage purchase orders'], moduleBreakdown: [{ title: 'Procurement Cycle', duration: '40min' }, { title: 'Sourcing Basics', duration: '40min' }, { title: 'Purchase Orders', duration: '40min' }], instructor: { name: 'Iris Kim', role: 'Procurement Specialist', initials: 'IK' } },
      { id: 'pu-02', title: 'Vendor Selection & Evaluation', description: 'Identify, evaluate, and select the best suppliers.', duration: '3h', durationHours: 3, modules: 4, level: 'Beginner', status: 'Completed', progress: 100, learningObjectives: ['Evaluate vendors', 'Score suppliers', 'Build shortlists'], moduleBreakdown: [{ title: 'Vendor Identification', duration: '45min' }, { title: 'Evaluation Criteria', duration: '45min' }, { title: 'Scoring Systems', duration: '45min' }, { title: 'Selection Process', duration: '45min' }], instructor: { name: 'Jack Ryan', role: 'Vendor Manager', initials: 'JR' } },
      { id: 'pu-03', title: 'Negotiation for Procurement', description: 'Advanced negotiation tactics specific to procurement scenarios.', duration: '3.5h', durationHours: 3.5, modules: 4, level: 'Intermediate', status: 'In Progress', progress: 60, learningObjectives: ['Negotiate contracts', 'Achieve cost savings', 'Build win-win deals'], moduleBreakdown: [{ title: 'Procurement Negotiation', duration: '55min' }, { title: 'Cost Analysis', duration: '55min' }, { title: 'Contract Terms', duration: '55min' }, { title: 'Simulation', duration: '55min' }], instructor: { name: 'Kelly Zhang', role: 'Negotiation Expert', initials: 'KZ' } },
      { id: 'pu-04', title: 'Contract Management', description: 'Manage supplier contracts throughout their lifecycle.', duration: '3h', durationHours: 3, modules: 4, level: 'Intermediate', status: 'Not Started', progress: 0, learningObjectives: ['Draft contracts', 'Monitor compliance', 'Manage renewals'], moduleBreakdown: [{ title: 'Contract Basics', duration: '45min' }, { title: 'Drafting Skills', duration: '45min' }, { title: 'Compliance Monitoring', duration: '45min' }, { title: 'Renewal Management', duration: '45min' }], instructor: { name: 'Liam Hayes', role: 'Contract Manager', initials: 'LH' } },
      { id: 'pu-05', title: 'Strategic Sourcing', description: 'Develop long-term sourcing strategies for key materials.', duration: '3.5h', durationHours: 3.5, modules: 4, level: 'Advanced', status: 'Not Started', progress: 0, learningObjectives: ['Develop sourcing strategies', 'Manage risk', 'Optimize supply base'], moduleBreakdown: [{ title: 'Sourcing Strategy', duration: '55min' }, { title: 'Risk Management', duration: '55min' }, { title: 'Supply Base Optimization', duration: '55min' }, { title: 'Category Management', duration: '55min' }], instructor: { name: 'Mona Patel', role: 'Sourcing Director', initials: 'MP' } },
      { id: 'pu-06', title: 'Purchase Order Management', description: 'Streamline PO processes and reduce processing time.', duration: '2.5h', durationHours: 2.5, modules: 3, level: 'Beginner', status: 'Not Started', progress: 0, learningObjectives: ['Process POs efficiently', 'Track orders', 'Resolve issues'], moduleBreakdown: [{ title: 'PO Process', duration: '50min' }, { title: 'Tracking Systems', duration: '50min' }, { title: 'Issue Resolution', duration: '50min' }], instructor: { name: 'Noah Singh', role: 'PO Administrator', initials: 'NS' } },
      { id: 'pu-07', title: 'Supplier Relationship Management', description: 'Build and maintain strong supplier partnerships.', duration: '3h', durationHours: 3, modules: 4, level: 'Intermediate', status: 'Not Started', progress: 0, learningObjectives: ['Build partnerships', 'Manage performance', 'Resolve conflicts'], moduleBreakdown: [{ title: 'Partnership Building', duration: '45min' }, { title: 'Performance Reviews', duration: '45min' }, { title: 'Conflict Resolution', duration: '45min' }, { title: 'Joint Development', duration: '45min' }], instructor: { name: 'Olivia Park', role: 'SRM Manager', initials: 'OP' } },
      { id: 'pu-08', title: 'Procurement Analytics', description: 'Use data analytics to optimize procurement decisions.', duration: '3.5h', durationHours: 3.5, modules: 4, level: 'Advanced', status: 'Not Started', progress: 0, learningObjectives: ['Analyze spend data', 'Build dashboards', 'Identify savings'], moduleBreakdown: [{ title: 'Data Collection', duration: '55min' }, { title: 'Analysis Methods', duration: '55min' }, { title: 'Dashboard Creation', duration: '55min' }, { title: 'Savings Identification', duration: '55min' }], instructor: { name: 'Peter Wu', role: 'Analytics Manager', initials: 'PW' } },
    ],
    resources: [
      { id: 'pu-r1', title: 'Vendor Database', description: 'Complete vendor database and contact list', type: 'Link', date: 'Oct 2024' },
      { id: 'pu-r2', title: 'Contract Templates', description: 'Standard contract templates for various scenarios', type: 'DOCX', size: '2.8MB', date: 'Sep 2024' },
      { id: 'pu-r3', title: 'Procurement Policy Manual', description: 'Internal procurement policies and procedures', type: 'PDF', size: '4.1MB', date: 'Aug 2024' },
      { id: 'pu-r4', title: 'Negotiation Case Studies', description: 'Real negotiation case studies and outcomes', type: 'PDF', size: '3.3MB', date: 'Jul 2024' },
      { id: 'pu-r5', title: 'Spend Analysis Dashboard', description: 'Interactive spend analytics dashboard', type: 'Link', date: 'Sep 2024' },
      { id: 'pu-r6', title: 'Supplier Evaluation Scorecard', description: 'Template for evaluating suppliers', type: 'DOCX', size: '980KB', date: 'Jun 2024' },
    ],
    leaderboard: [
      { rank: 1, name: 'Iris Kim', initials: 'IK', department: 'Purchase', progress: 91, points: 2190 },
      { rank: 2, name: 'Jack Ryan', initials: 'JR', department: 'Purchase', progress: 86, points: 2010 },
      { rank: 3, name: 'Kelly Zhang', initials: 'KZ', department: 'Purchase', progress: 82, points: 1860 },
      { rank: 4, name: 'Mona Patel', initials: 'MP', department: 'Purchase', progress: 77, points: 1690 },
      { rank: 5, name: 'Olivia Park', initials: 'OP', department: 'Purchase', progress: 72, points: 1550 },
    ],
  },
  {
    id: 'inventory-warehouse',
    name: 'Inventory & Warehouse Academy',
    description: 'Master inventory management, warehouse operations, and ERP systems. Learn to optimize stock levels, streamline logistics, and maintain accurate records.',
    shortDescription: 'Stock management, logistics, ERP systems',
    color: '#e8e0d4',
    colorClass: 'bg-[#e8e0d4]',
    icon: 'Package',
    iconFn: Package,
    courseCount: 8,
    enrollmentCount: 203,
    avgRating: 4.4,
    totalHours: 26,
    levelRange: 'Beginner–Advanced',
    courses: [
      { id: 'iw-01', title: 'Inventory Management Basics', description: 'Fundamentals of inventory control and management.', duration: '2.5h', durationHours: 2.5, modules: 3, level: 'Beginner', status: 'Completed', progress: 100, learningObjectives: ['Understand inventory types', 'Apply control methods', 'Track stock levels'], moduleBreakdown: [{ title: 'Inventory Types', duration: '50min' }, { title: 'Control Methods', duration: '50min' }, { title: 'Tracking Systems', duration: '50min' }], instructor: { name: 'Alice Chen', role: 'Inventory Specialist', initials: 'AC' } },
      { id: 'iw-02', title: 'Warehouse Operations', description: 'Efficient warehouse layout, picking, packing, and shipping.', duration: '3.5h', durationHours: 3.5, modules: 4, level: 'Beginner', status: 'Completed', progress: 100, learningObjectives: ['Optimize layout', 'Streamline picking', 'Reduce errors'], moduleBreakdown: [{ title: 'Layout Design', duration: '55min' }, { title: 'Picking Systems', duration: '55min' }, { title: 'Packing Standards', duration: '55min' }, { title: 'Shipping Process', duration: '55min' }], instructor: { name: 'Bob Martin', role: 'Warehouse Manager', initials: 'BM' } },
      { id: 'iw-03', title: 'ERP Systems for Inventory', description: 'Master the inventory module of the ERP system.', duration: '3.5h', durationHours: 3.5, modules: 4, level: 'Intermediate', status: 'In Progress', progress: 50, learningObjectives: ['Navigate ERP', 'Process transactions', 'Generate reports'], moduleBreakdown: [{ title: 'ERP Overview', duration: '55min' }, { title: 'Transactions', duration: '55min' }, { title: 'Reporting', duration: '55min' }, { title: 'Advanced Features', duration: '55min' }], instructor: { name: 'Carol Davis', role: 'ERP Specialist', initials: 'CD' } },
      { id: 'iw-04', title: 'Stock Optimization', description: 'Use data-driven methods to optimize inventory levels.', duration: '3h', durationHours: 3, modules: 4, level: 'Intermediate', status: 'Not Started', progress: 0, learningObjectives: ['Calculate optimal levels', 'Reduce carrying costs', 'Prevent stockouts'], moduleBreakdown: [{ title: 'Optimization Basics', duration: '45min' }, { title: 'EOQ Models', duration: '45min' }, { title: 'Safety Stock', duration: '45min' }, { title: 'ABC Analysis', duration: '45min' }], instructor: { name: 'Dan Evans', role: 'Inventory Analyst', initials: 'DE' } },
      { id: 'iw-05', title: 'Logistics & Distribution', description: 'Manage the flow of goods from warehouse to customer.', duration: '3.5h', durationHours: 3.5, modules: 4, level: 'Intermediate', status: 'Not Started', progress: 0, learningObjectives: ['Plan logistics', 'Choose carriers', 'Track shipments'], moduleBreakdown: [{ title: 'Logistics Planning', duration: '55min' }, { title: 'Carrier Selection', duration: '55min' }, { title: 'Shipment Tracking', duration: '55min' }, { title: 'Cost Optimization', duration: '55min' }], instructor: { name: 'Ellen Fox', role: 'Logistics Manager', initials: 'EF' } },
      { id: 'iw-06', title: 'Cycle Counting & Audits', description: 'Implement accurate cycle counting and inventory audit processes.', duration: '2.5h', durationHours: 2.5, modules: 3, level: 'Beginner', status: 'Not Started', progress: 0, learningObjectives: ['Conduct cycle counts', 'Reconcile discrepancies', 'Maintain accuracy'], moduleBreakdown: [{ title: 'Counting Methods', duration: '50min' }, { title: 'Discrepancy Resolution', duration: '50min' }, { title: 'Accuracy Targets', duration: '50min' }], instructor: { name: 'Fred Hill', role: 'Audit Supervisor', initials: 'FH' } },
      { id: 'iw-07', title: 'Warehouse Safety', description: 'Ensure a safe working environment in warehouse operations.', duration: '2.5h', durationHours: 2.5, modules: 3, level: 'Beginner', status: 'Not Started', progress: 0, learningObjectives: ['Follow safety rules', 'Operate equipment safely', 'Handle emergencies'], moduleBreakdown: [{ title: 'Safety Rules', duration: '50min' }, { title: 'Equipment Safety', duration: '50min' }, { title: 'Emergency Procedures', duration: '50min' }], instructor: { name: 'Gina Rose', role: 'Safety Coordinator', initials: 'GR' } },
      { id: 'iw-08', title: 'Advanced Warehouse Management', description: 'Implement advanced WMS features and automation.', duration: '4h', durationHours: 4, modules: 5, level: 'Advanced', status: 'Not Started', progress: 0, learningObjectives: ['Configure WMS', 'Implement automation', 'Optimize processes'], moduleBreakdown: [{ title: 'WMS Configuration', duration: '50min' }, { title: 'Automation Options', duration: '50min' }, { title: 'Barcode Systems', duration: '50min' }, { title: 'Integration', duration: '50min' }, { title: 'Optimization', duration: '50min' }], instructor: { name: 'Harry Young', role: 'Warehouse Director', initials: 'HY' } },
    ],
    resources: [
      { id: 'iw-r1', title: 'ERP User Guide', description: 'Complete guide to the ERP inventory module', type: 'PDF', size: '6.5MB', date: 'Oct 2024' },
      { id: 'iw-r2', title: 'Warehouse Layout Templates', description: 'Templates for optimizing warehouse layout', type: 'DOCX', size: '3.8MB', date: 'Sep 2024' },
      { id: 'iw-r3', title: 'Safety Training Videos', description: 'Warehouse safety training series', type: 'Video', duration: '65min', date: 'Aug 2024' },
      { id: 'iw-r4', title: 'Inventory Dashboard', description: 'Real-time inventory analytics', type: 'Link', date: 'Jul 2024' },
      { id: 'iw-r5', title: 'Cycle Counting Procedures', description: 'Standard cycle counting procedures', type: 'PDF', size: '2.2MB', date: 'Sep 2024' },
      { id: 'iw-r6', title: 'Logistics Partner Directory', description: 'Directory of logistics partners and contacts', type: 'DOCX', size: '1.5MB', date: 'Jun 2024' },
    ],
    leaderboard: [
      { rank: 1, name: 'Alice Chen', initials: 'AC', department: 'Inventory', progress: 88, points: 2120 },
      { rank: 2, name: 'Bob Martin', initials: 'BM', department: 'Inventory', progress: 84, points: 1940 },
      { rank: 3, name: 'Carol Davis', initials: 'CD', department: 'Inventory', progress: 79, points: 1780 },
      { rank: 4, name: 'Dan Evans', initials: 'DE', department: 'Inventory', progress: 74, points: 1600 },
      { rank: 5, name: 'Ellen Fox', initials: 'EF', department: 'Inventory', progress: 69, points: 1460 },
    ],
  },
  {
    id: 'accounts-finance',
    name: 'Accounts & Finance Academy',
    description: 'Build strong financial acumen for the wellness industry. Covers financial reporting, budgeting, auditing, and strategic financial planning.',
    shortDescription: 'Financial reporting, budgeting, auditing',
    color: '#a7c4d4',
    colorClass: 'bg-[#a7c4d4]',
    icon: 'Calculator',
    iconFn: Calculator,
    courseCount: 8,
    enrollmentCount: 267,
    avgRating: 4.5,
    totalHours: 28,
    levelRange: 'Beginner–Advanced',
    courses: [
      { id: 'af-01', title: 'Financial Reporting Basics', description: 'Learn to prepare and interpret financial statements.', duration: '3h', durationHours: 3, modules: 4, level: 'Beginner', status: 'Completed', progress: 100, learningObjectives: ['Prepare financial statements', 'Interpret reports', 'Follow accounting standards'], moduleBreakdown: [{ title: 'Income Statement', duration: '45min' }, { title: 'Balance Sheet', duration: '45min' }, { title: 'Cash Flow', duration: '45min' }, { title: 'Notes & Disclosures', duration: '45min' }], instructor: { name: 'Irene Scott', role: 'Financial Analyst', initials: 'IS' } },
      { id: 'af-02', title: 'Budgeting & Forecasting', description: 'Create accurate budgets and financial forecasts.', duration: '3.5h', durationHours: 3.5, modules: 4, level: 'Intermediate', status: 'Completed', progress: 100, learningObjectives: ['Build budgets', 'Create forecasts', 'Track variances'], moduleBreakdown: [{ title: 'Budget Framework', duration: '55min' }, { title: 'Revenue Forecasting', duration: '55min' }, { title: 'Expense Planning', duration: '55min' }, { title: 'Variance Analysis', duration: '55min' }], instructor: { name: 'John Reed', role: 'Finance Manager', initials: 'JR' } },
      { id: 'af-03', title: 'Internal Auditing', description: 'Conduct effective internal audits to ensure compliance and efficiency.', duration: '3.5h', durationHours: 3.5, modules: 4, level: 'Intermediate', status: 'In Progress', progress: 40, learningObjectives: ['Plan audits', 'Execute procedures', 'Report findings'], moduleBreakdown: [{ title: 'Audit Planning', duration: '55min' }, { title: 'Fieldwork', duration: '55min' }, { title: 'Evidence Collection', duration: '55min' }, { title: 'Reporting', duration: '55min' }], instructor: { name: 'Kate Lee', role: 'Internal Auditor', initials: 'KL' } },
      { id: 'af-04', title: 'Financial Forecasting for Q4', description: 'Specialized forecasting techniques for Q4 planning.', duration: '2h', durationHours: 2, modules: 4, level: 'Intermediate', status: 'Not Started', progress: 0, learningObjectives: ['Apply Q4 forecasting', 'Analyze seasonal trends', 'Plan year-end'], moduleBreakdown: [{ title: 'Q4 Trends', duration: '30min' }, { title: 'Forecasting Models', duration: '30min' }, { title: 'Scenario Planning', duration: '30min' }, { title: 'Action Planning', duration: '30min' }], instructor: { name: 'Leo Wang', role: 'Forecasting Specialist', initials: 'LW' } },
      { id: 'af-05', title: 'Cost Accounting', description: 'Understand cost structures and optimize financial performance.', duration: '3.5h', durationHours: 3.5, modules: 4, level: 'Intermediate', status: 'Not Started', progress: 0, learningObjectives: ['Analyze cost structures', 'Allocate overhead', 'Improve margins'], moduleBreakdown: [{ title: 'Cost Types', duration: '55min' }, { title: 'Overhead Allocation', duration: '55min' }, { title: 'Margin Analysis', duration: '55min' }, { title: 'Improvement Strategies', duration: '55min' }], instructor: { name: 'Mia Taylor', role: 'Cost Accountant', initials: 'MT' } },
      { id: 'af-06', title: 'Tax Compliance', description: 'Navigate tax requirements for wellness industry operations.', duration: '3h', durationHours: 3, modules: 4, level: 'Intermediate', status: 'Not Started', progress: 0, learningObjectives: ['Understand tax rules', 'File returns', 'Plan tax strategy'], moduleBreakdown: [{ title: 'Tax Basics', duration: '45min' }, { title: 'Filing Requirements', duration: '45min' }, { title: 'Deductions', duration: '45min' }, { title: 'Tax Planning', duration: '45min' }], instructor: { name: 'Nick Brown', role: 'Tax Advisor', initials: 'NB' } },
      { id: 'af-07', title: 'Financial Risk Management', description: 'Identify and mitigate financial risks.', duration: '3.5h', durationHours: 3.5, modules: 4, level: 'Advanced', status: 'Not Started', progress: 0, learningObjectives: ['Identify risks', 'Assess impact', 'Implement controls'], moduleBreakdown: [{ title: 'Risk Types', duration: '55min' }, { title: 'Assessment Methods', duration: '55min' }, { title: 'Control Frameworks', duration: '55min' }, { title: 'Monitoring', duration: '55min' }], instructor: { name: 'Olivia Green', role: 'Risk Manager', initials: 'OG' } },
      { id: 'af-08', title: 'Strategic Financial Planning', description: 'Align financial planning with organizational strategy.', duration: '4h', durationHours: 4, modules: 5, level: 'Advanced', status: 'Not Started', progress: 0, learningObjectives: ['Link finance to strategy', 'Build financial models', 'Drive decisions'], moduleBreakdown: [{ title: 'Strategic Alignment', duration: '50min' }, { title: 'Financial Modeling', duration: '50min' }, { title: 'Capital Allocation', duration: '50min' }, { title: 'Investment Analysis', duration: '50min' }, { title: 'Board Reporting', duration: '50min' }], instructor: { name: 'Paul Adams', role: 'CFO Advisor', initials: 'PA' } },
    ],
    resources: [
      { id: 'af-r1', title: 'Financial Reporting Templates', description: 'Standard financial report templates', type: 'DOCX', size: '2.5MB', date: 'Oct 2024' },
      { id: 'af-r2', title: 'Budget Planning Workbook', description: 'Interactive budget planning workbook', type: 'DOCX', size: '1.8MB', date: 'Sep 2024' },
      { id: 'af-r3', title: 'Audit Checklist', description: 'Comprehensive internal audit checklist', type: 'PDF', size: '1.5MB', date: 'Aug 2024' },
      { id: 'af-r4', title: 'Tax Compliance Guide', description: 'Guide to tax compliance requirements', type: 'PDF', size: '3.2MB', date: 'Jul 2024' },
      { id: 'af-r5', title: 'Financial Dashboard', description: 'Interactive financial KPI dashboard', type: 'Link', date: 'Sep 2024' },
      { id: 'af-r6', title: 'Accounting Policy Manual', description: 'Complete accounting policies documentation', type: 'PDF', size: '4.5MB', date: 'Jun 2024' },
    ],
    leaderboard: [
      { rank: 1, name: 'Irene Scott', initials: 'IS', department: 'Accounts', progress: 92, points: 2280 },
      { rank: 2, name: 'John Reed', initials: 'JR', department: 'Accounts', progress: 87, points: 2080 },
      { rank: 3, name: 'Kate Lee', initials: 'KL', department: 'Accounts', progress: 83, points: 1920 },
      { rank: 4, name: 'Mia Taylor', initials: 'MT', department: 'Accounts', progress: 78, points: 1740 },
      { rank: 5, name: 'Paul Adams', initials: 'PA', department: 'Accounts', progress: 73, points: 1580 },
    ],
  },
  {
    id: 'hr-admin',
    name: 'HR & Admin Academy',
    description: 'Develop skills in recruitment, employee relations, policy development, and administrative excellence. Build a thriving workplace culture.',
    shortDescription: 'Recruitment, policies, employee relations',
    color: '#8c8a6e',
    colorClass: 'bg-[#8c8a6e]',
    icon: 'Users',
    iconFn: Users,
    courseCount: 8,
    enrollmentCount: 289,
    avgRating: 4.6,
    totalHours: 26,
    levelRange: 'Beginner–Advanced',
    courses: [
      { id: 'hr-01', title: 'Recruitment Excellence', description: 'Attract, screen, and hire top talent for the wellness industry.', duration: '3h', durationHours: 3, modules: 4, level: 'Beginner', status: 'Completed', progress: 100, learningObjectives: ['Write job descriptions', 'Screen candidates', 'Conduct interviews'], moduleBreakdown: [{ title: 'Job Analysis', duration: '45min' }, { title: 'Sourcing', duration: '45min' }, { title: 'Screening', duration: '45min' }, { title: 'Interviewing', duration: '45min' }], instructor: { name: 'Quinn Baker', role: 'Recruitment Specialist', initials: 'QB' } },
      { id: 'hr-02', title: 'Employee Onboarding', description: 'Create effective onboarding programs for new hires.', duration: '2.5h', durationHours: 2.5, modules: 3, level: 'Beginner', status: 'Completed', progress: 100, learningObjectives: ['Design onboarding', 'Build buddy programs', 'Measure success'], moduleBreakdown: [{ title: 'Onboarding Design', duration: '50min' }, { title: 'First Week Plan', duration: '50min' }, { title: '30-60-90 Day Plan', duration: '50min' }], instructor: { name: 'Ruth Cole', role: 'HR Manager', initials: 'RC' } },
      { id: 'hr-03', title: 'Performance Management', description: 'Implement effective performance review and development systems.', duration: '3.5h', durationHours: 3.5, modules: 4, level: 'Intermediate', status: 'In Progress', progress: 55, learningObjectives: ['Set SMART goals', 'Give feedback', 'Manage underperformance'], moduleBreakdown: [{ title: 'Goal Setting', duration: '55min' }, { title: 'Continuous Feedback', duration: '55min' }, { title: 'Review Process', duration: '55min' }, { title: 'Development Plans', duration: '55min' }], instructor: { name: 'Sam Davis', role: 'Performance Coach', initials: 'SD' } },
      { id: 'hr-04', title: 'Employee Relations', description: 'Handle employee concerns, grievances, and workplace conflicts.', duration: '3h', durationHours: 3, modules: 4, level: 'Intermediate', status: 'Not Started', progress: 0, learningObjectives: ['Resolve conflicts', 'Build trust', 'Ensure fairness'], moduleBreakdown: [{ title: 'Relations Framework', duration: '45min' }, { title: 'Conflict Resolution', duration: '45min' }, { title: 'Grievance Handling', duration: '45min' }, { title: 'Trust Building', duration: '45min' }], instructor: { name: 'Tina Evans', role: 'Employee Relations Lead', initials: 'TE' } },
      { id: 'hr-05', title: 'HR Policy Development', description: 'Create clear, comprehensive HR policies.', duration: '2.5h', durationHours: 2.5, modules: 3, level: 'Intermediate', status: 'Not Started', progress: 0, learningObjectives: ['Draft policies', 'Ensure compliance', 'Communicate effectively'], moduleBreakdown: [{ title: 'Policy Framework', duration: '50min' }, { title: 'Compliance Check', duration: '50min' }, { title: 'Communication', duration: '50min' }], instructor: { name: 'Uma Fisher', role: 'Policy Advisor', initials: 'UF' } },
      { id: 'hr-06', title: 'Compensation & Benefits', description: 'Design competitive compensation and benefits packages.', duration: '3h', durationHours: 3, modules: 4, level: 'Intermediate', status: 'Not Started', progress: 0, learningObjectives: ['Design packages', 'Benchmark salaries', 'Manage payroll'], moduleBreakdown: [{ title: 'Compensation Strategy', duration: '45min' }, { title: 'Benefits Design', duration: '45min' }, { title: 'Salary Benchmarking', duration: '45min' }, { title: 'Payroll Management', duration: '45min' }], instructor: { name: 'Victor Gray', role: 'Compensation Analyst', initials: 'VG' } },
      { id: 'hr-07', title: 'Training & Development', description: 'Build learning programs that drive employee growth.', duration: '3h', durationHours: 3, modules: 4, level: 'Intermediate', status: 'Not Started', progress: 0, learningObjectives: ['Assess training needs', 'Design programs', 'Measure impact'], moduleBreakdown: [{ title: 'Needs Assessment', duration: '45min' }, { title: 'Program Design', duration: '45min' }, { title: 'Delivery Methods', duration: '45min' }, { title: 'ROI Measurement', duration: '45min' }], instructor: { name: 'Wendy Hughes', role: 'L&D Manager', initials: 'WH' } },
      { id: 'hr-08', title: 'Strategic HR Leadership', description: 'Align HR strategy with business objectives.', duration: '4h', durationHours: 4, modules: 5, level: 'Advanced', status: 'Not Started', progress: 0, learningObjectives: ['Link HR to strategy', 'Drive culture', 'Lead transformation'], moduleBreakdown: [{ title: 'Strategic Alignment', duration: '50min' }, { title: 'Culture Building', duration: '50min' }, { title: 'Change Management', duration: '50min' }, { title: 'HR Metrics', duration: '50min' }, { title: 'Future of HR', duration: '50min' }], instructor: { name: 'Xander Ives', role: 'CHRO Consultant', initials: 'XI' } },
    ],
    resources: [
      { id: 'hr-r1', title: 'Employee Handbook', description: 'Complete employee handbook template', type: 'DOCX', size: '3.5MB', date: 'Oct 2024' },
      { id: 'hr-r2', title: 'Interview Guide', description: 'Structured interview question bank', type: 'PDF', size: '1.8MB', date: 'Sep 2024' },
      { id: 'hr-r3', title: 'Onboarding Checklist', description: 'Comprehensive onboarding checklist', type: 'DOCX', size: '890KB', date: 'Aug 2024' },
      { id: 'hr-r4', title: 'Performance Review Template', description: 'Standard performance review form', type: 'DOCX', size: '1.2MB', date: 'Jul 2024' },
      { id: 'hr-r5', title: 'HR Dashboard', description: 'HR analytics and metrics dashboard', type: 'Link', date: 'Sep 2024' },
      { id: 'hr-r6', title: 'Policy Template Library', description: 'Templates for common HR policies', type: 'DOCX', size: '2.6MB', date: 'Jun 2024' },
    ],
    leaderboard: [
      { rank: 1, name: 'Quinn Baker', initials: 'QB', department: 'HR', progress: 90, points: 2160 },
      { rank: 2, name: 'Ruth Cole', initials: 'RC', department: 'HR', progress: 86, points: 2000 },
      { rank: 3, name: 'Sam Davis', initials: 'SD', department: 'HR', progress: 82, points: 1840 },
      { rank: 4, name: 'Tina Evans', initials: 'TE', department: 'HR', progress: 77, points: 1680 },
      { rank: 5, name: 'Wendy Hughes', initials: 'WH', department: 'HR', progress: 72, points: 1540 },
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing Academy',
    description: 'Master brand strategy, digital marketing, and campaign management. Learn to position Magppie products effectively and drive customer engagement.',
    shortDescription: 'Brand strategy, digital marketing, campaigns',
    color: '#5a7a7e',
    colorClass: 'bg-[#5a7a7e]',
    icon: 'Megaphone',
    iconFn: Megaphone,
    courseCount: 8,
    enrollmentCount: 234,
    avgRating: 4.7,
    totalHours: 28,
    levelRange: 'Beginner–Advanced',
    courses: [
      { id: 'mk-01', title: 'Brand Strategy Fundamentals', description: 'Build and maintain a strong wellness brand.', duration: '3h', durationHours: 3, modules: 4, level: 'Beginner', status: 'Completed', progress: 100, learningObjectives: ['Define brand identity', 'Position effectively', 'Maintain consistency'], moduleBreakdown: [{ title: 'Brand Identity', duration: '45min' }, { title: 'Positioning', duration: '45min' }, { title: 'Brand Guidelines', duration: '45min' }, { title: 'Consistency', duration: '45min' }], instructor: { name: 'Yara Jackson', role: 'Brand Manager', initials: 'YJ' } },
      { id: 'mk-02', title: 'Digital Marketing Essentials', description: 'Master digital channels for wellness product marketing.', duration: '3.5h', durationHours: 3.5, modules: 4, level: 'Beginner', status: 'Completed', progress: 100, learningObjectives: ['Use social media', 'Run paid campaigns', 'Track performance'], moduleBreakdown: [{ title: 'Social Media', duration: '55min' }, { title: 'Paid Advertising', duration: '55min' }, { title: 'Content Marketing', duration: '55min' }, { title: 'Analytics', duration: '55min' }], instructor: { name: 'Zack Lee', role: 'Digital Marketer', initials: 'ZL' } },
      { id: 'mk-03', title: 'Content Creation', description: 'Create compelling content that resonates with wellness audiences.', duration: '3h', durationHours: 3, modules: 4, level: 'Intermediate', status: 'In Progress', progress: 65, learningObjectives: ['Write for wellness', 'Create visual content', 'Build content calendars'], moduleBreakdown: [{ title: 'Content Strategy', duration: '45min' }, { title: 'Writing Skills', duration: '45min' }, { title: 'Visual Content', duration: '45min' }, { title: 'Calendar Planning', duration: '45min' }], instructor: { name: 'Amy Chen', role: 'Content Lead', initials: 'AC' } },
      { id: 'mk-04', title: 'Campaign Management', description: 'Plan, execute, and measure marketing campaigns.', duration: '3.5h', durationHours: 3.5, modules: 4, level: 'Intermediate', status: 'Not Started', progress: 0, learningObjectives: ['Plan campaigns', 'Manage budgets', 'Measure ROI'], moduleBreakdown: [{ title: 'Campaign Planning', duration: '55min' }, { title: 'Budget Management', duration: '55min' }, { title: 'Execution', duration: '55min' }, { title: 'ROI Analysis', duration: '55min' }], instructor: { name: 'Brian Kim', role: 'Campaign Manager', initials: 'BK' } },
      { id: 'mk-05', title: 'SEO & SEM', description: 'Optimize search presence for wellness products.', duration: '3.5h', durationHours: 3.5, modules: 4, level: 'Intermediate', status: 'Not Started', progress: 0, learningObjectives: ['Optimize for SEO', 'Run SEM campaigns', 'Track rankings'], moduleBreakdown: [{ title: 'SEO Fundamentals', duration: '55min' }, { title: 'Keyword Strategy', duration: '55min' }, { title: 'SEM Campaigns', duration: '55min' }, { title: 'Tracking', duration: '55min' }], instructor: { name: 'Cathy Liu', role: 'SEO Specialist', initials: 'CL' } },
      { id: 'mk-06', title: 'Email Marketing', description: 'Build and nurture leads through effective email campaigns.', duration: '2.5h', durationHours: 2.5, modules: 3, level: 'Beginner', status: 'Not Started', progress: 0, learningObjectives: ['Build lists', 'Design campaigns', 'Optimize deliverability'], moduleBreakdown: [{ title: 'List Building', duration: '50min' }, { title: 'Campaign Design', duration: '50min' }, { title: 'Optimization', duration: '50min' }], instructor: { name: 'David Park', role: 'Email Marketer', initials: 'DP' } },
      { id: 'mk-07', title: 'Analytics & Reporting', description: 'Use data to drive marketing decisions.', duration: '3.5h', durationHours: 3.5, modules: 4, level: 'Intermediate', status: 'Not Started', progress: 0, learningObjectives: ['Set up analytics', 'Create reports', 'Make data-driven decisions'], moduleBreakdown: [{ title: 'Analytics Setup', duration: '55min' }, { title: 'Report Building', duration: '55min' }, { title: 'Attribution', duration: '55min' }, { title: 'Optimization', duration: '55min' }], instructor: { name: 'Ella Wong', role: 'Analytics Lead', initials: 'EW' } },
      { id: 'mk-08', title: 'Marketing Leadership', description: 'Lead marketing teams and drive strategic initiatives.', duration: '4h', durationHours: 4, modules: 5, level: 'Advanced', status: 'Not Started', progress: 0, learningObjectives: ['Lead teams', 'Drive strategy', 'Manage budgets'], moduleBreakdown: [{ title: 'Leadership Skills', duration: '50min' }, { title: 'Strategic Planning', duration: '50min' }, { title: 'Budget Management', duration: '50min' }, { title: 'Team Building', duration: '50min' }, { title: 'Innovation', duration: '50min' }], instructor: { name: 'Fred Chang', role: 'CMO Advisor', initials: 'FC' } },
    ],
    resources: [
      { id: 'mk-r1', title: 'Brand Guidelines', description: 'Complete brand guidelines document', type: 'PDF', size: '8.2MB', date: 'Oct 2024' },
      { id: 'mk-r2', title: 'Campaign Template', description: 'Marketing campaign planning template', type: 'DOCX', size: '2.1MB', date: 'Sep 2024' },
      { id: 'mk-r3', title: 'Social Media Playbook', description: 'Social media strategy and tactics', type: 'PDF', size: '3.5MB', date: 'Aug 2024' },
      { id: 'mk-r4', title: 'Analytics Dashboard', description: 'Marketing performance dashboard', type: 'Link', date: 'Jul 2024' },
      { id: 'mk-r5', title: 'Content Calendar Template', description: 'Monthly content calendar template', type: 'DOCX', size: '1.4MB', date: 'Sep 2024' },
      { id: 'mk-r6', title: 'SEO Checklist', description: 'Complete SEO optimization checklist', type: 'PDF', size: '1.9MB', date: 'Jun 2024' },
    ],
    leaderboard: [
      { rank: 1, name: 'Yara Jackson', initials: 'YJ', department: 'Marketing', progress: 91, points: 2200 },
      { rank: 2, name: 'Zack Lee', initials: 'ZL', department: 'Marketing', progress: 87, points: 2040 },
      { rank: 3, name: 'Amy Chen', initials: 'AC', department: 'Marketing', progress: 83, points: 1880 },
      { rank: 4, name: 'Brian Kim', initials: 'BK', department: 'Marketing', progress: 78, points: 1700 },
      { rank: 5, name: 'Ella Wong', initials: 'EW', department: 'Marketing', progress: 73, points: 1560 },
    ],
  },
  {
    id: 'customer-experience',
    name: 'Customer Experience Academy',
    description: 'Deliver exceptional customer experiences. Master customer service, complaint resolution, CRM tools, and relationship building for wellness products.',
    shortDescription: 'Customer service, complaint resolution, CRM',
    color: '#7a8a7a',
    colorClass: 'bg-[#7a8a7a]',
    icon: 'Headset',
    iconFn: Headset,
    courseCount: 8,
    enrollmentCount: 245,
    avgRating: 4.6,
    totalHours: 24,
    levelRange: 'Beginner–Advanced',
    courses: [
      { id: 'cx-01', title: 'Customer Service Excellence', description: 'Foundations of outstanding customer service.', duration: '2h', durationHours: 2, modules: 3, level: 'Beginner', status: 'Completed', progress: 100, learningObjectives: ['Serve with empathy', 'Follow service standards', 'Exceed expectations'], moduleBreakdown: [{ title: 'Service Mindset', duration: '40min' }, { title: 'Standards', duration: '40min' }, { title: 'Going Above', duration: '40min' }], instructor: { name: 'Grace Allen', role: 'CX Trainer', initials: 'GA' } },
      { id: 'cx-02', title: 'Complaint Resolution', description: 'Turn customer complaints into loyalty opportunities.', duration: '3h', durationHours: 3, modules: 4, level: 'Intermediate', status: 'Completed', progress: 100, learningObjectives: ['Listen actively', 'Resolve effectively', 'Follow up'], moduleBreakdown: [{ title: 'Listening Skills', duration: '45min' }, { title: 'Resolution Framework', duration: '45min' }, { title: 'De-escalation', duration: '45min' }, { title: 'Follow-up', duration: '45min' }], instructor: { name: 'Henry Brooks', role: 'Complaint Specialist', initials: 'HB' } },
      { id: 'cx-03', title: 'Advanced CRM Techniques', description: 'Leverage CRM tools to manage customer relationships.', duration: '3.5h', durationHours: 3.5, modules: 6, level: 'Intermediate', status: 'In Progress', progress: 45, learningObjectives: ['Master CRM', 'Track interactions', 'Build loyalty programs'], moduleBreakdown: [{ title: 'CRM Overview', duration: '35min' }, { title: 'Contact Management', duration: '35min' }, { title: 'Interaction Tracking', duration: '35min' }, { title: 'Automation', duration: '35min' }, { title: 'Reporting', duration: '35min' }, { title: 'Loyalty Integration', duration: '35min' }], instructor: { name: 'Ivy Collins', role: 'CRM Administrator', initials: 'IC' } },
      { id: 'cx-04', title: 'Product Knowledge Deep Dive', description: 'Comprehensive knowledge of all Magppie wellness products.', duration: '3h', durationHours: 3, modules: 4, level: 'Beginner', status: 'Not Started', progress: 0, learningObjectives: ['Know all products', 'Answer technical questions', 'Recommend solutions'], moduleBreakdown: [{ title: 'Product Line A', duration: '45min' }, { title: 'Product Line B', duration: '45min' }, { title: 'Product Line C', duration: '45min' }, { title: 'Comparisons', duration: '45min' }], instructor: { name: 'Jack Davis', role: 'Product Expert', initials: 'JD' } },
      { id: 'cx-05', title: 'Communication Skills', description: 'Master verbal and written communication with customers.', duration: '2.5h', durationHours: 2.5, modules: 3, level: 'Beginner', status: 'Not Started', progress: 0, learningObjectives: ['Communicate clearly', 'Write professionally', 'Use positive language'], moduleBreakdown: [{ title: 'Verbal Skills', duration: '50min' }, { title: 'Written Communication', duration: '50min' }, { title: 'Positive Language', duration: '50min' }], instructor: { name: 'Karen Edwards', role: 'Communication Coach', initials: 'KE' } },
      { id: 'cx-06', title: 'Customer Feedback & Insights', description: 'Collect and act on customer feedback.', duration: '3h', durationHours: 3, modules: 4, level: 'Intermediate', status: 'Not Started', progress: 0, learningObjectives: ['Collect feedback', 'Analyze insights', 'Drive improvements'], moduleBreakdown: [{ title: 'Collection Methods', duration: '45min' }, { title: 'Analysis', duration: '45min' }, { title: 'Action Planning', duration: '45min' }, { title: 'Closed-loop Process', duration: '45min' }], instructor: { name: 'Leo Foster', role: 'Insights Analyst', initials: 'LF' } },
      { id: 'cx-07', title: 'VIP Customer Management', description: 'Build and maintain relationships with high-value customers.', duration: '3h', durationHours: 3, modules: 4, level: 'Advanced', status: 'Not Started', progress: 0, learningObjectives: ['Identify VIPs', 'Build relationships', 'Deliver white-glove service'], moduleBreakdown: [{ title: 'VIP Identification', duration: '45min' }, { title: 'Relationship Building', duration: '45min' }, { title: 'Service Standards', duration: '45min' }, { title: 'Retention Strategies', duration: '45min' }], instructor: { name: 'Mia Garcia', role: 'VIP Relations', initials: 'MG' } },
      { id: 'cx-08', title: 'CX Leadership', description: 'Lead customer experience initiatives across the organization.', duration: '3.5h', durationHours: 3.5, modules: 4, level: 'Advanced', status: 'Not Started', progress: 0, learningObjectives: ['Design CX strategy', 'Lead CX teams', 'Drive transformation'], moduleBreakdown: [{ title: 'CX Strategy', duration: '55min' }, { title: 'Team Leadership', duration: '55min' }, { title: 'Transformation', duration: '55min' }, { title: 'Metrics & KPIs', duration: '55min' }], instructor: { name: 'Noah Harris', role: 'CX Director', initials: 'NH' } },
    ],
    resources: [
      { id: 'cx-r1', title: 'Customer Service Scripts', description: 'Ready-to-use customer service scripts', type: 'DOCX', size: '1.8MB', date: 'Oct 2024' },
      { id: 'cx-r2', title: 'Product Knowledge Base', description: 'Comprehensive product information database', type: 'Link', date: 'Sep 2024' },
      { id: 'cx-r3', title: 'Complaint Resolution Guide', description: 'Step-by-step complaint handling guide', type: 'PDF', size: '2.4MB', date: 'Aug 2024' },
      { id: 'cx-r4', title: 'CRM Training Videos', description: 'CRM system training video series', type: 'Video', duration: '75min', date: 'Jul 2024' },
      { id: 'cx-r5', title: 'Customer Satisfaction Dashboard', description: 'Real-time CSAT and NPS tracking', type: 'Link', date: 'Sep 2024' },
      { id: 'cx-r6', title: 'CX Best Practices Playbook', description: 'Industry best practices for CX', type: 'PDF', size: '3.6MB', date: 'Jun 2024' },
    ],
    leaderboard: [
      { rank: 1, name: 'Grace Allen', initials: 'GA', department: 'Customer Experience', progress: 93, points: 2260 },
      { rank: 2, name: 'Henry Brooks', initials: 'HB', department: 'Customer Experience', progress: 88, points: 2080 },
      { rank: 3, name: 'Ivy Collins', initials: 'IC', department: 'Customer Experience', progress: 84, points: 1920 },
      { rank: 4, name: 'Mia Garcia', initials: 'MG', department: 'Customer Experience', progress: 79, points: 1740 },
      { rank: 5, name: 'Noah Harris', initials: 'NH', department: 'Customer Experience', progress: 74, points: 1600 },
    ],
  },
  {
    id: 'leadership',
    name: 'Leadership Academy',
    description: 'Develop the skills to lead teams, drive strategic thinking, and build high-performing organizations. For current and aspiring leaders at Magppie.',
    shortDescription: 'Management, strategic thinking, team building',
    color: '#003b46',
    colorClass: 'bg-[#003b46]',
    icon: 'Crown',
    iconFn: Crown,
    courseCount: 8,
    enrollmentCount: 198,
    avgRating: 4.8,
    totalHours: 30,
    levelRange: 'Intermediate–Advanced',
    courses: [
      { id: 'ld-01', title: 'Foundations of Leadership', description: 'Core leadership principles and self-assessment.', duration: '3h', durationHours: 3, modules: 4, level: 'Intermediate', status: 'Completed', progress: 100, learningObjectives: ['Know leadership styles', 'Assess yourself', 'Build a plan'], moduleBreakdown: [{ title: 'Leadership Styles', duration: '45min' }, { title: 'Self-Assessment', duration: '45min' }, { title: 'Vision Setting', duration: '45min' }, { title: 'Action Plan', duration: '45min' }], instructor: { name: 'Oscar Irving', role: 'Leadership Coach', initials: 'OI' } },
      { id: 'ld-02', title: 'Strategic Thinking', description: 'Develop and execute business strategy.', duration: '4h', durationHours: 4, modules: 5, level: 'Intermediate', status: 'Completed', progress: 100, learningObjectives: ['Analyze markets', 'Formulate strategy', 'Execute effectively'], moduleBreakdown: [{ title: 'Strategic Analysis', duration: '50min' }, { title: 'Strategy Formulation', duration: '50min' }, { title: 'Execution Planning', duration: '50min' }, { title: 'Resource Allocation', duration: '50min' }, { title: 'Progress Tracking', duration: '50min' }], instructor: { name: 'Patricia Jones', role: 'Strategy Consultant', initials: 'PJ' } },
      { id: 'ld-03', title: 'Team Building & Development', description: 'Build, motivate, and develop high-performing teams.', duration: '3.5h', durationHours: 3.5, modules: 4, level: 'Intermediate', status: 'In Progress', progress: 70, learningObjectives: ['Build teams', 'Motivate members', 'Develop talent'], moduleBreakdown: [{ title: 'Team Formation', duration: '55min' }, { title: 'Motivation', duration: '55min' }, { title: 'Talent Development', duration: '55min' }, { title: 'Performance', duration: '55min' }], instructor: { name: 'Quinn Kelly', role: 'Team Development Lead', initials: 'QK' } },
      { id: 'ld-04', title: 'Decision Making', description: 'Make better decisions under pressure and uncertainty.', duration: '3h', durationHours: 3, modules: 4, level: 'Advanced', status: 'Not Started', progress: 0, learningObjectives: ['Use frameworks', 'Manage risk', 'Decide under pressure'], moduleBreakdown: [{ title: 'Decision Frameworks', duration: '45min' }, { title: 'Risk Assessment', duration: '45min' }, { title: 'Group Decisions', duration: '45min' }, { title: 'Pressure Situations', duration: '45min' }], instructor: { name: 'Rachel Long', role: 'Executive Coach', initials: 'RL' } },
      { id: 'ld-05', title: 'Change Management', description: 'Lead organizational change effectively.', duration: '3.5h', durationHours: 3.5, modules: 4, level: 'Advanced', status: 'Not Started', progress: 0, learningObjectives: ['Plan change', 'Manage resistance', 'Sustain change'], moduleBreakdown: [{ title: 'Change Models', duration: '55min' }, { title: 'Stakeholder Management', duration: '55min' }, { title: 'Resistance Handling', duration: '55min' }, { title: 'Sustaining Change', duration: '55min' }], instructor: { name: 'Steve Morris', role: 'Change Consultant', initials: 'SM' } },
      { id: 'ld-06', title: 'Communication for Leaders', description: 'Master executive communication skills.', duration: '3h', durationHours: 3, modules: 4, level: 'Intermediate', status: 'Not Started', progress: 0, learningObjectives: ['Present effectively', 'Write clearly', 'Influence others'], moduleBreakdown: [{ title: 'Executive Presence', duration: '45min' }, { title: 'Storytelling', duration: '45min' }, { title: 'Difficult Conversations', duration: '45min' }, { title: 'Influence', duration: '45min' }], instructor: { name: 'Tina Nelson', role: 'Communication Expert', initials: 'TN' } },
      { id: 'ld-07', title: 'Inclusive Leadership Strategies', description: 'Build and lead diverse, inclusive teams.', duration: '4h', durationHours: 4, modules: 7, level: 'Advanced', status: 'Not Started', progress: 0, learningObjectives: ['Foster inclusion', 'Manage diversity', 'Build equity'], moduleBreakdown: [{ title: 'Inclusion Fundamentals', duration: '35min' }, { title: 'Unconscious Bias', duration: '35min' }, { title: 'Inclusive Practices', duration: '35min' }, { title: 'Diverse Teams', duration: '35min' }, { title: 'Equity Building', duration: '35min' }, { title: 'Allyship', duration: '35min' }, { title: 'Measurement', duration: '35min' }], instructor: { name: 'Uma Owens', role: 'D&I Director', initials: 'UO' } },
      { id: 'ld-08', title: 'Executive Leadership', description: 'Lead at the highest levels with vision and impact.', duration: '4.5h', durationHours: 4.5, modules: 5, level: 'Advanced', status: 'Not Started', progress: 0, learningObjectives: ['Set vision', 'Drive culture', 'Lead transformation'], moduleBreakdown: [{ title: 'Vision & Purpose', duration: '55min' }, { title: 'Culture Building', duration: '55min' }, { title: 'Board Relations', duration: '55min' }, { title: 'Transformation', duration: '55min' }, { title: 'Legacy', duration: '55min' }], instructor: { name: 'Victor Perry', role: 'CEO Coach', initials: 'VP' } },
    ],
    resources: [
      { id: 'ld-r1', title: 'Leadership Assessment Tool', description: 'Self-assessment for leadership capabilities', type: 'Link', date: 'Oct 2024' },
      { id: 'ld-r2', title: 'Strategic Planning Framework', description: 'Framework for organizational strategy', type: 'DOCX', size: '2.8MB', date: 'Sep 2024' },
      { id: 'ld-r3', title: 'Team Building Activities Guide', description: 'Activities for team development', type: 'PDF', size: '3.2MB', date: 'Aug 2024' },
      { id: 'ld-r4', title: 'Change Management Playbook', description: 'Guide to leading organizational change', type: 'PDF', size: '4.1MB', date: 'Jul 2024' },
      { id: 'ld-r5', title: 'Executive Communication Guide', description: 'Best practices for executive communication', type: 'PDF', size: '2.6MB', date: 'Sep 2024' },
      { id: 'ld-r6', title: 'D&I Resource Library', description: 'Diversity and inclusion resources', type: 'Link', date: 'Jun 2024' },
    ],
    leaderboard: [
      { rank: 1, name: 'Oscar Irving', initials: 'OI', department: 'Leadership', progress: 95, points: 2400 },
      { rank: 2, name: 'Patricia Jones', initials: 'PJ', department: 'Leadership', progress: 91, points: 2240 },
      { rank: 3, name: 'Quinn Kelly', initials: 'QK', department: 'Leadership', progress: 87, points: 2060 },
      { rank: 4, name: 'Steve Morris', initials: 'SM', department: 'Leadership', progress: 82, points: 1880 },
      { rank: 5, name: 'Uma Owens', initials: 'UO', department: 'Leadership', progress: 77, points: 1720 },
    ],
  },
]

export const learningPaths: LearningPath[] = [
  {
    id: 'lp-1',
    title: 'Sales Career Track',
    department: 'Sales',
    color: '#c19a6b',
    icon: 'Target',
    stages: [
      { label: 'Junior Sales', status: 'completed' },
      { label: 'Sales Associate', status: 'completed' },
      { label: 'Senior Sales', status: 'current' },
      { label: 'Team Lead', status: 'future' },
      { label: 'Sales Manager', status: 'future' },
    ],
    description: 'Progress from junior sales representative to sales manager through structured skill development.',
  },
  {
    id: 'lp-2',
    title: 'Quality Expert Track',
    department: 'Quality Control',
    color: '#c4a0a0',
    icon: 'ShieldCheck',
    stages: [
      { label: 'Inspector', status: 'completed' },
      { label: 'Senior Inspector', status: 'current' },
      { label: 'Quality Analyst', status: 'future' },
      { label: 'QA Lead', status: 'future' },
      { label: 'Quality Manager', status: 'future' },
    ],
    description: 'Build expertise in quality assurance from inspector to quality management leadership.',
  },
  {
    id: 'lp-3',
    title: 'Design Engineer Track',
    department: 'Post Design',
    color: '#8c8a6e',
    icon: 'PenTool',
    stages: [
      { label: 'Junior Designer', status: 'completed' },
      { label: 'Product Designer', status: 'completed' },
      { label: 'Senior Designer', status: 'current' },
      { label: 'Design Lead', status: 'future' },
      { label: 'Chief Designer', status: 'future' },
    ],
    description: 'Advance your design career from junior designer to chief design officer.',
  },
  {
    id: 'lp-4',
    title: 'Leadership Track',
    department: 'Leadership',
    color: '#003b46',
    icon: 'Crown',
    stages: [
      { label: 'Team Member', status: 'completed' },
      { label: 'Team Lead', status: 'current' },
      { label: 'Department Head', status: 'future' },
      { label: 'Director', status: 'future' },
      { label: 'VP', status: 'future' },
    ],
    description: 'Develop leadership capabilities to advance from team member to vice president.',
  },
]

export const recentlyAddedCourses = [
  {
    id: 'rc-1',
    title: 'AI in Wellness Product Design',
    academy: 'Post Design Academy',
    academyId: 'post-design',
    thumbnail: '/course-thumb-design.jpg',
    modules: 5,
    duration: '3h',
    level: 'Advanced' as const,
    isNew: true,
  },
  {
    id: 'rc-2',
    title: 'Sustainable Manufacturing Practices',
    academy: 'Factory & Production Academy',
    academyId: 'factory-production',
    thumbnail: '/course-thumb-factory.jpg',
    modules: 8,
    duration: '4.5h',
    level: 'Intermediate' as const,
    isNew: true,
  },
  {
    id: 'rc-3',
    title: 'Advanced CRM Techniques',
    academy: 'Customer Experience Academy',
    academyId: 'customer-experience',
    thumbnail: '/course-thumb-cx.jpg',
    modules: 6,
    duration: '3.5h',
    level: 'Intermediate' as const,
    isNew: true,
  },
  {
    id: 'rc-4',
    title: 'Financial Forecasting for Q4',
    academy: 'Accounts & Finance Academy',
    academyId: 'accounts-finance',
    thumbnail: '/course-thumb-accounts.jpg',
    modules: 4,
    duration: '2h',
    level: 'Intermediate' as const,
    isNew: true,
  },
  {
    id: 'rc-5',
    title: 'Inclusive Leadership Strategies',
    academy: 'Leadership Academy',
    academyId: 'leadership',
    thumbnail: '/course-thumb-leadership.jpg',
    modules: 7,
    duration: '4h',
    level: 'Advanced' as const,
    isNew: true,
  },
]

export function getAcademyById(id: string) {
  return academies.find((a) => a.id === id)
}
