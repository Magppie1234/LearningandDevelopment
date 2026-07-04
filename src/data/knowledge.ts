export type DocumentType = 'PDF' | 'DOCX' | 'XLSX' | 'MP4' | 'PPT' | 'Link'

export type DocumentCategory =
  | 'All'
  | 'SOPs'
  | 'Policies'
  | 'Process Documents'
  | 'Product Catalogs'
  | 'Installation Manuals'
  | 'Quality Standards'
  | 'Training Videos'
  | 'Templates'
  | 'Checklists'
  | 'Technical Drawings'

export interface KnowledgeDocument {
  id: string
  title: string
  description: string
  type: DocumentType
  category: DocumentCategory
  fileSize: string
  updatedAt: string
  author: string
  authorInitials: string
  department: string
  downloads: number
  views: number
}

export const categories: DocumentCategory[] = [
  'All',
  'SOPs',
  'Policies',
  'Process Documents',
  'Product Catalogs',
  'Installation Manuals',
  'Quality Standards',
  'Training Videos',
  'Templates',
  'Checklists',
  'Technical Drawings',
]

export const documents: KnowledgeDocument[] = [
  // SOPs (1-6)
  {
    id: 'sop-001',
    title: 'SOP-001: Customer Complaint Handling',
    description:
      'Standard procedure for receiving, documenting, and resolving customer complaints in a timely manner.',
    type: 'PDF',
    category: 'SOPs',
    fileSize: '2.4 MB',
    updatedAt: '2024-10-01',
    author: 'Anita Verma',
    authorInitials: 'AV',
    department: 'Customer Experience',
    downloads: 342,
    views: 1240,
  },
  {
    id: 'sop-002',
    title: 'SOP-002: Product Installation Procedure',
    description:
      'Step-by-step guide for on-site installation of wellness products, including safety checks and sign-off.',
    type: 'PDF',
    category: 'SOPs',
    fileSize: '5.1 MB',
    updatedAt: '2024-09-28',
    author: 'Ravi Kumar',
    authorInitials: 'RK',
    department: 'Installation',
    downloads: 521,
    views: 1890,
  },
  {
    id: 'sop-003',
    title: 'SOP-003: Quality Inspection Checklist',
    description:
      'Pre-dispatch quality inspection protocol for all finished goods leaving the factory.',
    type: 'PDF',
    category: 'SOPs',
    fileSize: '1.8 MB',
    updatedAt: '2024-09-15',
    author: 'Sunita Rao',
    authorInitials: 'SR',
    department: 'Quality Control',
    downloads: 410,
    views: 1420,
  },
  {
    id: 'sop-004',
    title: 'SOP-004: Inventory Receiving Process',
    description:
      'Workflow for receiving, inspecting, and recording incoming inventory items in the warehouse.',
    type: 'PDF',
    category: 'SOPs',
    fileSize: '3.2 MB',
    updatedAt: '2024-10-05',
    author: 'James Wilson',
    authorInitials: 'JW',
    department: 'Inventory',
    downloads: 289,
    views: 980,
  },
  {
    id: 'sop-005',
    title: 'SOP-005: Sales Order Processing',
    description:
      'End-to-end process for handling sales orders from receipt through fulfillment and invoicing.',
    type: 'PDF',
    category: 'SOPs',
    fileSize: '2.1 MB',
    updatedAt: '2024-08-20',
    author: 'Priya Sharma',
    authorInitials: 'PS',
    department: 'Sales',
    downloads: 378,
    views: 1150,
  },
  {
    id: 'sop-006',
    title: 'SOP-006: Employee Onboarding Steps',
    description:
      'Comprehensive onboarding checklist for new hires across all departments.',
    type: 'PDF',
    category: 'SOPs',
    fileSize: '4.5 MB',
    updatedAt: '2024-10-03',
    author: 'Meera Iyer',
    authorInitials: 'MI',
    department: 'HR & Admin',
    downloads: 456,
    views: 1560,
  },

  // Policies (7-11)
  {
    id: 'pol-001',
    title: 'Employee Handbook 2024',
    description:
      'Complete employee handbook covering company policies, benefits, code of conduct, and workplace guidelines.',
    type: 'PDF',
    category: 'Policies',
    fileSize: '6.2 MB',
    updatedAt: '2024-10-08',
    author: 'HR Department',
    authorInitials: 'HR',
    department: 'HR & Admin',
    downloads: 890,
    views: 2340,
  },
  {
    id: 'pol-002',
    title: 'Expense Reimbursement Policy',
    description:
      'Guidelines for submitting expense claims, eligible categories, and reimbursement timelines.',
    type: 'PDF',
    category: 'Policies',
    fileSize: '1.5 MB',
    updatedAt: '2024-09-20',
    author: 'Finance Team',
    authorInitials: 'FT',
    department: 'Finance',
    downloads: 567,
    views: 1560,
  },
  {
    id: 'pol-003',
    title: 'Annual Leave Policy 2024',
    description:
      'Updated leave entitlement, carry-forward rules, and holiday calendar for the current year.',
    type: 'DOCX',
    category: 'Policies',
    fileSize: '850 KB',
    updatedAt: '2024-10-08',
    author: 'Priya Sharma',
    authorInitials: 'PS',
    department: 'HR & Admin',
    downloads: 423,
    views: 1320,
  },
  {
    id: 'pol-004',
    title: 'Remote Work Policy',
    description:
      'Eligibility criteria, equipment provisions, and communication expectations for remote work arrangements.',
    type: 'PDF',
    category: 'Policies',
    fileSize: '1.2 MB',
    updatedAt: '2024-08-15',
    author: 'Meera Iyer',
    authorInitials: 'MI',
    department: 'HR & Admin',
    downloads: 312,
    views: 980,
  },
  {
    id: 'pol-005',
    title: 'IT Security & Data Privacy Policy',
    description:
      'Mandatory security protocols, password policies, data handling rules, and breach reporting procedures.',
    type: 'PDF',
    category: 'Policies',
    fileSize: '2.8 MB',
    updatedAt: '2024-09-10',
    author: 'IT Department',
    authorInitials: 'IT',
    department: 'IT',
    downloads: 298,
    views: 870,
  },

  // Process Documents (12-15)
  {
    id: 'proc-001',
    title: 'Vendor Evaluation Criteria',
    description:
      'Scoring framework for assessing new and existing vendors across quality, cost, and delivery metrics.',
    type: 'XLSX',
    category: 'Process Documents',
    fileSize: '1.1 MB',
    updatedAt: '2024-10-07',
    author: 'Raj Patel',
    authorInitials: 'RP',
    department: 'Procurement',
    downloads: 267,
    views: 920,
  },
  {
    id: 'proc-002',
    title: 'Product Development Lifecycle',
    description:
      'End-to-end process map from concept ideation through design, prototyping, testing, and launch.',
    type: 'PDF',
    category: 'Process Documents',
    fileSize: '4.2 MB',
    updatedAt: '2024-09-25',
    author: 'Design Team',
    authorInitials: 'DT',
    department: 'Design',
    downloads: 198,
    views: 760,
  },
  {
    id: 'proc-003',
    title: 'Customer Feedback Loop Process',
    description:
      'How customer feedback is collected, analyzed, and routed to the appropriate teams for action.',
    type: 'DOCX',
    category: 'Process Documents',
    fileSize: '920 KB',
    updatedAt: '2024-09-18',
    author: 'Anita Verma',
    authorInitials: 'AV',
    department: 'Customer Experience',
    downloads: 234,
    views: 810,
  },
  {
    id: 'proc-004',
    title: 'Return Merchandise Authorization (RMA) Flow',
    description:
      'Workflow for handling product returns, replacements, and refunds across all sales channels.',
    type: 'PDF',
    category: 'Process Documents',
    fileSize: '1.9 MB',
    updatedAt: '2024-08-30',
    author: 'Operations',
    authorInitials: 'OP',
    department: 'Operations',
    downloads: 345,
    views: 1120,
  },

  // Product Catalogs (16-18)
  {
    id: 'cat-001',
    title: 'Wellness Pro Series Catalog',
    description:
      'Full product catalog for the Wellness Pro series with specifications, pricing, and availability.',
    type: 'PDF',
    category: 'Product Catalogs',
    fileSize: '12.4 MB',
    updatedAt: '2024-10-06',
    author: 'Maria Santos',
    authorInitials: 'MS',
    department: 'Product',
    downloads: 678,
    views: 1980,
  },
  {
    id: 'cat-002',
    title: 'Spa Collection Product Guide',
    description:
      'Detailed guide covering the Spa Collection range with feature highlights and comparison tables.',
    type: 'PDF',
    category: 'Product Catalogs',
    fileSize: '8.6 MB',
    updatedAt: '2024-09-22',
    author: 'Marketing Team',
    authorInitials: 'MT',
    department: 'Marketing',
    downloads: 432,
    views: 1340,
  },
  {
    id: 'cat-003',
    title: 'Accessory & Add-on Price List',
    description:
      'Current price list for all accessories, add-ons, and spare parts with part numbers.',
    type: 'XLSX',
    category: 'Product Catalogs',
    fileSize: '780 KB',
    updatedAt: '2024-09-05',
    author: 'Sales Team',
    authorInitials: 'ST',
    department: 'Sales',
    downloads: 356,
    views: 1080,
  },

  // Installation Manuals (19-22)
  {
    id: 'inst-001',
    title: 'Product Installation Guide',
    description:
      'Comprehensive installation manual covering all product lines with diagrams and troubleshooting.',
    type: 'PDF',
    category: 'Installation Manuals',
    fileSize: '15.2 MB',
    updatedAt: '2024-09-30',
    author: 'Ravi Kumar',
    authorInitials: 'RK',
    department: 'Installation',
    downloads: 723,
    views: 1890,
  },
  {
    id: 'inst-002',
    title: 'Wellness Pro Installation Video',
    description:
      'Video walkthrough of the complete Wellness Pro installation process with expert commentary.',
    type: 'MP4',
    category: 'Installation Manuals',
    fileSize: '245 MB',
    updatedAt: '2024-09-12',
    author: 'Training Team',
    authorInitials: 'TT',
    department: 'Training',
    downloads: 412,
    views: 1340,
  },
  {
    id: 'inst-003',
    title: 'Spa System Setup Manual',
    description:
      'Detailed setup instructions for the Spa System including plumbing and electrical requirements.',
    type: 'PDF',
    category: 'Installation Manuals',
    fileSize: '9.8 MB',
    updatedAt: '2024-08-28',
    author: 'Ravi Kumar',
    authorInitials: 'RK',
    department: 'Installation',
    downloads: 298,
    views: 920,
  },
  {
    id: 'inst-004',
    title: 'Quick Start Installation Card',
    description:
      'One-page quick reference card for experienced installers covering key steps and safety reminders.',
    type: 'PDF',
    category: 'Installation Manuals',
    fileSize: '420 KB',
    updatedAt: '2024-10-02',
    author: 'Ravi Kumar',
    authorInitials: 'RK',
    department: 'Installation',
    downloads: 534,
    views: 1560,
  },

  // Quality Standards (23-25)
  {
    id: 'qs-001',
    title: 'Quality Standards Document',
    description:
      'Master quality standards reference defining acceptance criteria for all product categories.',
    type: 'PDF',
    category: 'Quality Standards',
    fileSize: '5.6 MB',
    updatedAt: '2024-09-28',
    author: 'Sunita Rao',
    authorInitials: 'SR',
    department: 'Quality Control',
    downloads: 445,
    views: 1420,
  },
  {
    id: 'qs-002',
    title: 'ISO 9001 Compliance Checklist',
    description:
      'Internal audit checklist aligned with ISO 9001 requirements for quality management systems.',
    type: 'XLSX',
    category: 'Quality Standards',
    fileSize: '1.3 MB',
    updatedAt: '2024-09-15',
    author: 'Sunita Rao',
    authorInitials: 'SR',
    department: 'Quality Control',
    downloads: 312,
    views: 980,
  },
  {
    id: 'qs-003',
    title: 'Material Testing Protocols',
    description:
      'Laboratory testing procedures for raw materials, components, and finished products.',
    type: 'PDF',
    category: 'Quality Standards',
    fileSize: '3.4 MB',
    updatedAt: '2024-08-22',
    author: 'Lab Team',
    authorInitials: 'LT',
    department: 'Quality Control',
    downloads: 267,
    views: 860,
  },

  // Training Videos (26-29)
  {
    id: 'tv-001',
    title: 'CRM Training Module 3',
    description:
      'Advanced CRM features including pipeline management, reporting, and automation workflows.',
    type: 'MP4',
    category: 'Training Videos',
    fileSize: '180 MB',
    updatedAt: '2024-10-04',
    author: 'Aisha Kumar',
    authorInitials: 'AK',
    department: 'Training',
    downloads: 389,
    views: 1250,
  },
  {
    id: 'tv-002',
    title: 'Sales Techniques Masterclass',
    description:
      'Advanced selling techniques, objection handling, and closing strategies for the wellness industry.',
    type: 'MP4',
    category: 'Training Videos',
    fileSize: '320 MB',
    updatedAt: '2024-09-20',
    author: 'Sales Trainer',
    authorInitials: 'ST',
    department: 'Sales',
    downloads: 567,
    views: 1780,
  },
  {
    id: 'tv-003',
    title: 'Product Knowledge Deep Dive',
    description:
      'In-depth product knowledge session covering all Wellness Pro features, benefits, and competitive advantages.',
    type: 'MP4',
    category: 'Training Videos',
    fileSize: '210 MB',
    updatedAt: '2024-09-08',
    author: 'Product Team',
    authorInitials: 'PT',
    department: 'Product',
    downloads: 478,
    views: 1450,
  },
  {
    id: 'tv-004',
    title: 'Safety Training for Installers',
    description:
      'Mandatory safety training covering PPE, hazard identification, and emergency procedures for installation teams.',
    type: 'MP4',
    category: 'Training Videos',
    fileSize: '156 MB',
    updatedAt: '2024-08-18',
    author: 'Safety Officer',
    authorInitials: 'SO',
    department: 'Installation',
    downloads: 623,
    views: 1920,
  },

  // Templates (30-33)
  {
    id: 'tpl-001',
    title: 'Expense Reimbursement Form',
    description:
      'Standard template for submitting expense claims with all required fields and approval routing.',
    type: 'DOCX',
    category: 'Templates',
    fileSize: '120 KB',
    updatedAt: '2024-09-25',
    author: 'Finance Team',
    authorInitials: 'FT',
    department: 'Finance',
    downloads: 789,
    views: 2100,
  },
  {
    id: 'tpl-002',
    title: 'Project Proposal Template',
    description:
      'Standardized project proposal format with executive summary, budget, timeline, and risk assessment sections.',
    type: 'DOCX',
    category: 'Templates',
    fileSize: '245 KB',
    updatedAt: '2024-09-14',
    author: 'PMO',
    authorInitials: 'PM',
    department: 'Operations',
    downloads: 456,
    views: 1380,
  },
  {
    id: 'tpl-003',
    title: 'Customer Visit Report Template',
    description:
      'Template for documenting customer visits, feedback collected, and follow-up actions required.',
    type: 'DOCX',
    category: 'Templates',
    fileSize: '98 KB',
    updatedAt: '2024-08-30',
    author: 'Sales Team',
    authorInitials: 'ST',
    department: 'Sales',
    downloads: 534,
    views: 1620,
  },
  {
    id: 'tpl-004',
    title: 'Training Needs Assessment Form',
    description:
      'Form for managers to assess and document team training requirements for quarterly L&D planning.',
    type: 'DOCX',
    category: 'Templates',
    fileSize: '156 KB',
    updatedAt: '2024-10-01',
    author: 'Training Team',
    authorInitials: 'TT',
    department: 'Training',
    downloads: 345,
    views: 1080,
  },

  // Checklists (34-37)
  {
    id: 'chk-001',
    title: 'Pre-Installation Site Checklist',
    description:
      'Site readiness checklist to verify before scheduling an installation visit.',
    type: 'PDF',
    category: 'Checklists',
    fileSize: '580 KB',
    updatedAt: '2024-09-28',
    author: 'Ravi Kumar',
    authorInitials: 'RK',
    department: 'Installation',
    downloads: 412,
    views: 1340,
  },
  {
    id: 'chk-002',
    title: 'Daily Warehouse Safety Checklist',
    description:
      'Daily safety inspection checklist for warehouse and factory floor areas.',
    type: 'PDF',
    category: 'Checklists',
    fileSize: '340 KB',
    updatedAt: '2024-09-10',
    author: 'Safety Officer',
    authorInitials: 'SO',
    department: 'Inventory',
    downloads: 356,
    views: 1180,
  },
  {
    id: 'chk-003',
    title: 'New Hire Onboarding Checklist',
    description:
      'Day-by-day checklist for the first week of a new employee ensuring nothing is missed.',
    type: 'PDF',
    category: 'Checklists',
    fileSize: '420 KB',
    updatedAt: '2024-10-03',
    author: 'Meera Iyer',
    authorInitials: 'MI',
    department: 'HR & Admin',
    downloads: 478,
    views: 1560,
  },
  {
    id: 'chk-004',
    title: 'Product Launch Readiness Checklist',
    description:
      'Comprehensive checklist covering marketing, sales training, inventory, and support readiness for new product launches.',
    type: 'XLSX',
    category: 'Checklists',
    fileSize: '890 KB',
    updatedAt: '2024-08-25',
    author: 'Product Team',
    authorInitials: 'PT',
    department: 'Product',
    downloads: 289,
    views: 920,
  },

  // Technical Drawings (38-40)
  {
    id: 'td-001',
    title: 'Wellness Pro Series Technical Drawings',
    description:
      'Complete CAD drawings and dimensional specifications for the Wellness Pro product range.',
    type: 'PDF',
    category: 'Technical Drawings',
    fileSize: '18.5 MB',
    updatedAt: '2024-09-28',
    author: 'Design Team',
    authorInitials: 'DT',
    department: 'Design',
    downloads: 234,
    views: 780,
  },
  {
    id: 'td-002',
    title: 'Plumbing Connection Diagrams',
    description:
      'Technical plumbing diagrams showing inlet, outlet, and drain connections for all models.',
    type: 'PDF',
    category: 'Technical Drawings',
    fileSize: '7.2 MB',
    updatedAt: '2024-09-15',
    author: 'Engineering',
    authorInitials: 'EN',
    department: 'Engineering',
    downloads: 312,
    views: 980,
  },
  {
    id: 'td-003',
    title: 'Electrical Specifications Sheet',
    description:
      'Voltage, current, and wiring requirements for all electronic components across the product line.',
    type: 'XLSX',
    category: 'Technical Drawings',
    fileSize: '1.4 MB',
    updatedAt: '2024-09-05',
    author: 'Engineering',
    authorInitials: 'EN',
    department: 'Engineering',
    downloads: 198,
    views: 670,
  },
]

export const popularDocuments = [
  { rank: 1, title: 'Employee Handbook 2024', views: 2340, category: 'Policies' as DocumentCategory },
  { rank: 2, title: 'Product Installation Guide', views: 1890, category: 'Installation Manuals' as DocumentCategory },
  { rank: 3, title: 'Expense Reimbursement Policy', views: 1560, category: 'Policies' as DocumentCategory },
  { rank: 4, title: 'Quality Standards Document', views: 1420, category: 'Quality Standards' as DocumentCategory },
  { rank: 5, title: 'Safety Protocol Handbook', views: 1280, category: 'SOPs' as DocumentCategory },
]

export const recentlyUpdated = [
  { id: 'pol-003', title: 'Annual Leave Policy 2024', category: 'Policies' as DocumentCategory, updatedAt: '2024-10-08', author: 'Priya Sharma', authorInitials: 'PS', type: 'DOCX' as DocumentType },
  { id: 'proc-001', title: 'Vendor Evaluation Criteria', category: 'Process Documents' as DocumentCategory, updatedAt: '2024-10-07', author: 'Raj Patel', authorInitials: 'RP', type: 'XLSX' as DocumentType },
  { id: 'cat-001', title: 'Wellness Pro Series Catalog', category: 'Product Catalogs' as DocumentCategory, updatedAt: '2024-10-06', author: 'Maria Santos', authorInitials: 'MS', type: 'PDF' as DocumentType },
  { id: 'sop-004', title: 'Factory Safety Guidelines', category: 'SOPs' as DocumentCategory, updatedAt: '2024-10-05', author: 'James Wilson', authorInitials: 'JW', type: 'PDF' as DocumentType },
  { id: 'tv-001', title: 'CRM Training Module 3', category: 'Training Videos' as DocumentCategory, updatedAt: '2024-10-04', author: 'Aisha Kumar', authorInitials: 'AK', type: 'MP4' as DocumentType },
]
