import { D, type Flow, type FlowStepDef } from './flow-types'

const S = (t: string, ic: string, d: string, disp?: FlowStepDef['disp']): FlowStepDef => ({
  t,
  ic,
  d,
  ...(disp ? { disp } : {}),
})

const STEPS: FlowStepDef[] = [
  // Lead sources (1–8)
  S('Paid Digital Marketing', 'bolt', 'Leads generated through paid digital marketing campaigns across search engines, social media, and display networks.'),
  S('Organic Digital Marketing', 'optimize', 'Leads generated through organic digital channels — SEO, content marketing, social media engagement, and organic search.'),
  S('Walkins', 'mappin', 'Leads from walk-in visitors to the showroom, office, or experience center — face-to-face inquiries and spontaneous visits.'),
  S('Direct IVR Calls', 'phone', 'Inbound leads from direct IVR (Interactive Voice Response) calls — prospects who called through advertised phone numbers.'),
  S('Client Referrals', 'handshake', 'Leads referred by existing and past clients — word-of-mouth recommendations from satisfied customers.'),
  S('Architects', 'design', 'Direct referrals and inquiries from architects and interior designers specifying materials for their projects.'),
  S('Exhibitions', 'flag', 'Leads collected from trade shows, expos, and industry exhibitions — face-to-face engagement with potential clients.'),
  S('Scanners', 'qc', 'Leads captured through scanning devices at events, showrooms, and other touchpoints — digital lead capture via QR and badge scanning.'),

  // Qualification pipeline (9–21)
  S('CRM', 'database', 'All leads from every source automatically flow into the CRM system. This is the single source of truth for the entire pipeline.'),
  S('Not Contacted Yet', 'alert', 'Every newly created lead starts here. The BD team has not yet made the first contact. This is the entry point to the qualification pipeline.'),
  S('Not Responding / Call Back Later', 'revisit', 'The lead did not answer the call, or requested a callback at a later time. This is a looping stage — the BD team will retry contact based on internal dispositions.', [
    D('Switched Off', 'Phone is powered off.'),
    D('Missed Call', 'Call went through but was not picked up.'),
    D('Not Reachable', 'Network unavailable / out of coverage.'),
    D('Invalid Number', 'Wrong or non-existent number.'),
    D('Call Back Later', 'Lead asked to be called at another time.'),
    D('Ringing No Response', 'Phone rang but no one answered.'),
  ]),
  S('Under Follow Up', 'review', 'The lead is interested but needs more time or additional steps before committing. The BD team maintains regular follow-up contact via Call, Meeting, WhatsApp message, or Email.', [
    D('Switched Off', 'Phone is powered off.'),
    D('Missed Call', 'Call went through but was not picked up.'),
    D('Not Reachable', 'Network unavailable / out of coverage.'),
    D('Call Back Later', 'Lead asked to be called at another time.'),
    D('Ringing No Response', 'Phone rang but no one answered.'),
    D('Follow up Required', 'Further follow-up is needed to move the lead forward.'),
    D('Drawing Requested', 'Architectural drawings or floor plans have been requested from the lead.'),
    D('Rough Budget Shared', 'A preliminary budget estimate has been shared with the lead.'),
    D('Will Visit Showroom', 'The lead plans to visit the showroom. Appointment is scheduled.'),
    D('Visited Showroom', 'The lead has visited the showroom and seen the materials.'),
    D('Outside India', 'Lead is currently outside India. Follow-up scheduled for return.'),
    D('Delayed', 'Project timeline delayed. Lead to be re-engaged later.'),
  ]),
  S('Not Interested', 'flag', 'The lead explicitly stated they are not interested in the product or service. Reason of Cold captures why the lead went cold.', [
    D('Budget Issue', 'Lead cannot afford the quoted price.', true),
    D('Did not like the Product', 'Lead is not satisfied with the product offering.', true),
    D('Always No Response', 'Lead never responds to any communication attempt.', true),
    D('Interested in other Brand', 'Lead is pursuing a competitor brand.', true),
    D('Going for Wooden Option', 'Lead has decided to go with wooden surfaces instead.', true),
    D('Just Exploring', 'Lead was only researching, not seriously interested.', true),
    D('Immediate Delivery Required', 'Lead needs immediate delivery which cannot be met.', true),
    D('Invalid Lead', 'Lead is not relevant or was submitted in error.', true),
    D('Price Was High', "Quoted price was above the lead's budget.", true),
    D('Architect Influence', "Lead's architect influenced them toward another option.", true),
  ]),
  S('Junk Lead', 'box', 'Leads that are invalid, fraudulent, or completely irrelevant — wrong contact details, spam submissions, or accidental entries.', [
    D('Invalid number', 'The contact number is incorrect or does not exist.', true),
    D('Marketing', 'Lead is a marketing/solicitation contact, not a genuine prospect.', true),
    D('Job', 'Lead is a job seeker, not a potential client.', true),
    D('Insurance', 'Lead is an insurance solicitation.', true),
    D('Duplicate lead', 'This lead already exists in the CRM.', true),
  ]),
  S('Will Buy in Future', 'calendar', 'The lead is genuinely interested but the project timeline does not require immediate purchase. Added to long-term nurture pipeline with periodic check-ins.', [
    D('Switched Off', 'Phone is powered off.'),
    D('Not Reachable', 'Network unavailable / out of coverage.'),
    D('Invalid Number', 'Wrong or non-existent number.'),
    D('Call Back Later', 'Lead asked to be called at another time.'),
    D('Ringing No Response', 'Phone rang but no one answered.'),
    D('Follow up Required', 'Further follow-up is needed.'),
    D('Rough Budget Shared', 'A preliminary budget estimate has been shared.'),
    D('Will Visit Showroom', 'The lead plans to visit the showroom.'),
    D('Visited Showroom', 'The lead has visited the showroom.'),
    D('Outside India', 'Lead is currently outside India.'),
    D('Delayed', 'Project timeline delayed.'),
  ]),
  S('Qualified / Drawings Awaited', 'drawing', 'The lead is mutually qualified — the prospect has the budget and intent. They are ready to proceed and are only waiting to share drawings to finalize the scope.', [
    D('Value by BD (Lacs)', 'Estimated project value entered by the Business Development executive (in Lacs).'),
    D('Type of client', 'Classification of the client type.'),
  ]),
  S('Human Intervention Required', 'client', 'This lead requires manual review or special handling by a senior team member.', [
    D('Notes', 'Free-text notes documenting why human intervention is required and what action needs to be taken.'),
  ]),
  S('BD Calls Again', 'phone', 'The Business Development executive makes a follow-up call based on the disposition set in the previous attempt.'),
  S('No Response Again', 'revisit', 'The lead still did not answer. The disposition is updated and the cycle may repeat or the lead may be moved to Not Interested after maximum attempts.'),
  S('Client Picks Up', 'phone', 'The client answered the call. Based on the conversation, the lead can now move to Under Follow Up or Qualified During Awarded.'),
  S('Lead Qualified → Opportunity Flow', 'approve', 'After receiving drawings, the lead is fully qualified. The project scope is confirmed, budget is aligned, and the lead moves to the Opportunity / Sales Pipeline.'),
]

export const BD_FLOW: Flow = {
  id: 'bd',
  label: 'BD Flow',
  eyebrow: 'Lead → Qualified Opportunity',
  titlePrefix: 'Turning enquiries into',
  titleEm: 'opportunities',
  phases: [
    { name: 'Lead Sources', start: 1, count: 8, color: '#7C8B6F' },
    { name: 'Qualification Pipeline', start: 9, count: 13, color: '#B8703F' },
  ],
  steps: STEPS,
}
