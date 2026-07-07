import { D, type Flow, type FlowStepDef } from './flow-types'

const S = (t: string, ic: string, d: string, disp?: FlowStepDef['disp']): FlowStepDef => ({
  t,
  ic,
  d,
  ...(disp ? { disp } : {}),
})

const STEPS: FlowStepDef[] = [
  S('Validated by SM', 'approve', 'Opportunity validated by Sales Manager.'),
  S('Design Form', 'drawing', 'Design brief captured from the client — presentation style, theme, ceiling height, timeline, and location details.', [
    D('Design Presentation'),
    D('Design Theme'),
    D('Ceiling Height'),
    D('Design Required On'),
    D('City'),
    D('Zone'),
    D('Area Name'),
    D('Drawings Upload'),
    D('Video Files Upload'),
    D('Notes'),
  ]),
  S('Design Form Review', 'review', 'Approved proceeds to next stage. Revision Required loops back to Design Form.'),
  S('Design Discussion', 'client', 'Design discussion with the client.'),
  S('Under Follow-up', 'review', 'Opportunity is under follow-up with the client.'),
  S('On Hold', 'alert', 'Opportunity temporarily on hold.', [
    D('Budget Issue'),
    D('Construction Delay'),
    D('Family Decision Pending'),
    D('Architect Decision Pending'),
    D('Site Not Ready'),
    D('Other'),
  ]),
  S('Not Interested', 'flag', 'Client is not interested.', [
    D('Price was High'),
    D('Did Not Like Design'),
    D('Not Convinced with Wellness Product'),
    D('Not Responding'),
    D('Did Not Like Product Display Quality'),
    D('Architect Influence'),
    D('Negative Feedback from Existing Customer'),
    D('Expected More Discount'),
    D('Duplicate Lead'),
    D('Layout Not Received'),
  ]),
  S('Price Discussion', 'calc', 'Negotiating pricing with the client.'),
  S('Principally Closed', 'approve', 'Deal agreed in principle.', [D('Final Opportunity Value'), D('Expected Closure Date')]),
  S('Closure', 'handshake', 'Deal closed.', [
    D('Order Value'),
    D('Closure Date'),
    D('Payment Received Amount'),
    D('Approved Estimate'),
  ]),
  S('Handover to Post Design', 'factory', 'Handover to post-design team — site details and mandatory documents.', [
    D('Site Incharge Name'),
    D('Site Incharge Mobile'),
    D('Street Address'),
    D('City'),
    D('State'),
    D('ZIP Code'),
    D('Country'),
    D('Order Closure Form', 'Mandatory document'),
    D('Signed Estimate', 'Mandatory document'),
    D('Signed Drawings', 'Mandatory document'),
    D('Payment Confirmation', 'Mandatory document'),
  ]),
]

export const SALES_FLOW: Flow = {
  id: 'sales',
  label: 'Sales Flow',
  eyebrow: 'Opportunity → Handover',
  titlePrefix: 'Closing the',
  titleEm: 'deal',
  phases: [{ name: 'Opportunity Pipeline', start: 1, count: STEPS.length, color: '#B0562A' }],
  steps: STEPS,
}
