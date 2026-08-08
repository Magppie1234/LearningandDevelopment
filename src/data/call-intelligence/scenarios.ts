/**
 * Sunroof Call Intelligence — mock conversation scripts.
 *
 * DEMO DATA. These are authored conversations, not real customer calls. They
 * exist so the extraction rules, scores and drill-downs can be reviewed before
 * the telephony + STT integration lands. Every insight the dashboard shows is
 * derived FROM these turns — nothing is hand-typed at the aggregate level, so
 * a KPI, a chart and a transcript always reconcile.
 *
 * Keep this file separate from any production service (§16).
 */

import type { ActionTypeId, FaqCategoryId, ObjectionId } from './taxonomy'
import type { AnswerStatus, ObjectionResolution, ObjectionTechnique } from '@/lib/call-intelligence/types'

export interface TurnSpec {
  s: 'agent' | 'customer'
  /** Line text. `{name}` `{city}` `{product}` `{agent}` are substituted. */
  t: string
  /** Authored Hindi original, when this scenario is used for a Hindi call. */
  hi?: string
  /** Text sentiment of this turn, −1..+1. */
  sent: number
  /** Customer turn asks this FAQ. */
  faq?: FaqCategoryId
  /** Agent turn answers the most recent open FAQ, to this standard. */
  answers?: AnswerStatus
  /** Customer turn raises this objection. */
  obj?: ObjectionId
  objIntensity?: 1 | 2 | 3
  /** Agent turn responds to the most recent open objection. */
  handles?: { resolution: ObjectionResolution; technique: ObjectionTechnique }
  /** A commitment is made on this turn. */
  commit?: { actionTypeId: ActionTypeId; party: 'employee' | 'customer'; dueInHours?: number }
  /** Compliance issue detected on this turn. */
  flag?: 'unapproved_discount' | 'false_commitment' | 'sensitive_data_exposure' | 'legal_threat_unescalated'
}

export interface Scenario {
  id: string
  label: string
  purpose:
    | 'New enquiry'
    | 'Follow-up'
    | 'Design discussion'
    | 'Quotation discussion'
    | 'Payment follow-up'
    | 'Service / complaint'
    | 'Post-handover check-in'
  outcome:
    | 'Meaningful conversation'
    | 'Information shared'
    | 'Follow-up scheduled'
    | 'Site visit booked'
    | 'Quotation requested'
    | 'Complaint logged'
    | 'Not connected'
    | 'Wrong number'
    | 'Call dropped'
  businessUnit: 'Retail Sales' | 'Customer Service'
  /** Relative frequency when sampling the corpus. */
  weight: number
  summary: string
  topics: string[]
  turns: TurnSpec[]
  signals: {
    need: string | null
    productInterest: string | null
    budgetInr: number | null
    timeline: 'immediate' | 'within_1_month' | 'within_3_months' | 'later' | null
    decisionMaker: 'sole' | 'joint' | 'not_decision_maker' | null
    requestedQuotation: boolean
    requestedDemo: boolean
    requestedSiteVisit: boolean
    requestedDesign: boolean
    buyingSignals: string[]
    crossSell: string[]
    competitors: string[]
    discountRequested: boolean
    hesitation: string[]
  }
  themes: {
    appreciation: string[]
    dissatisfaction: string[]
    featureRequests: string[]
    expectations: string[]
    painPoints: string[]
  }
  emotions: Partial<Record<'frustration' | 'confusion' | 'hesitation' | 'urgency' | 'trust' | 'interest' | 'satisfaction', number>>
  /** Base quality profile 0..100 before the employee modifier is applied. */
  qualityBase: number
  /** Base readiness components 0..100. */
  readiness: {
    needAndFit: number
    explicitIntent: number
    timeline: number
    nextStepCommitment: number
    decisionAuthority: number
    budgetReadiness: number
  }
  /** Recommended next actions the rules engine proposes for this shape of call. */
  recommend: { actionTypeId: ActionTypeId; reason: string; priority: 'critical' | 'high' | 'medium' | 'low' }[]
  /** Non-turn compliance issues (process omissions). */
  omissions?: ('missing_disclosure' | 'no_permission_to_continue')[]
  /** Marks the call as having ended with the customer still negative. */
  endsNegative?: boolean
}

const NO_THEMES = { appreciation: [], dissatisfaction: [], featureRequests: [], expectations: [], painPoints: [] }

export const SCENARIOS: Scenario[] = [
  /* ── 1. High-intent new enquiry, well handled ─────────────────────────── */
  {
    id: 'sc-high-intent',
    label: 'High-intent new enquiry — well handled',
    purpose: 'New enquiry',
    outcome: 'Site visit booked',
    businessUnit: 'Retail Sales',
    weight: 14,
    summary:
      'Customer is renovating a 3BHK in {city} and wants a full modular kitchen before the family moves in. Budget band stated, decision joint with spouse, site visit booked for the measurement team.',
    topics: ['Modular kitchen', 'Site measurement', 'Budget', 'Timeline'],
    turns: [
      { s: 'agent', t: 'Good afternoon, this is {agent} from Sunroof. This call is recorded for quality. Is this a convenient time to talk about your kitchen enquiry?', sent: 0.2 },
      { s: 'customer', t: 'Yes, go ahead. We are renovating our flat in {city} and the kitchen is the main thing left.', sent: 0.3 },
      { s: 'agent', t: 'Understood. May I ask what the current layout is, and how many people cook at home?', sent: 0.2 },
      { s: 'customer', t: 'It is an L-shape right now, about 10 by 8. Two of us cook, and my mother stays with us.', sent: 0.2 },
      { s: 'customer', t: 'What is the difference between your Signature and Urban series? I saw both on the site.', sent: 0.1, faq: 'series_comparison' },
      { s: 'agent', t: 'Signature uses a single-piece engineered stone facia with a deeper 20mm profile and soft-close tandem hardware; Urban uses the same stone in a 12mm profile with standard hardware. The visible difference is the joint line and the shutter weight.', sent: 0.3, answers: 'fully_answered' },
      { s: 'customer', t: 'That helps. And what would a kitchen like mine cost, roughly?', sent: 0.2, faq: 'pricing_discounts' },
      { s: 'agent', t: 'For a 10 by 8 L-shape, Urban typically lands between nine and thirteen lakh depending on storage and appliances. I can give you an exact figure once we measure.', sent: 0.3, answers: 'fully_answered' },
      { s: 'customer', t: 'We have kept about twelve lakh for the kitchen. We want it done before Diwali.', sent: 0.4 },
      { s: 'agent', t: 'That is workable. From measurement to handover we plan seven to nine weeks, so starting this month keeps you comfortably ahead of Diwali.', sent: 0.4 },
      { s: 'customer', t: 'My wife will also need to approve the design, she handles the finishes.', sent: 0.2 },
      { s: 'agent', t: 'Of course. Shall I book our measurement team for Saturday morning, and we can do the design walkthrough with both of you together?', sent: 0.4, commit: { actionTypeId: 'arrange_measurement', party: 'employee', dueInHours: 72 } },
      { s: 'customer', t: 'Saturday works. Please send the catalogue on WhatsApp before that.', sent: 0.5 },
      { s: 'agent', t: 'Sending the Urban and Signature catalogue today, and I will confirm the Saturday slot by tonight.', sent: 0.5, commit: { actionTypeId: 'send_catalogue', party: 'employee', dueInHours: 24 } },
      { s: 'customer', t: 'Perfect, thank you. You have been very clear.', sent: 0.7 },
    ],
    signals: {
      need: 'Full modular kitchen for a renovated 3BHK, L-shaped 10x8, three cooks in the household',
      productInterest: 'Urban L-Shaped Kitchen (comparing with Signature)',
      budgetInr: 1_200_000,
      timeline: 'within_3_months',
      decisionMaker: 'joint',
      requestedQuotation: false,
      requestedDemo: false,
      requestedSiteVisit: true,
      requestedDesign: true,
      buyingSignals: ['Stated budget of ₹12 lakh', 'Fixed deadline before Diwali', 'Agreed to measurement visit'],
      crossSell: ['Wardrobe & Storage for the adjoining utility'],
      competitors: [],
      discountRequested: false,
      hesitation: [],
    },
    themes: {
      appreciation: ['Clear explanation of series differences'],
      dissatisfaction: [],
      featureRequests: [],
      expectations: ['Handover before Diwali', 'Spouse involved in design sign-off'],
      painPoints: ['Renovation running late overall'],
    },
    emotions: { interest: 0.85, trust: 0.7, urgency: 0.6, satisfaction: 0.8 },
    qualityBase: 84,
    readiness: { needAndFit: 90, explicitIntent: 80, timeline: 75, nextStepCommitment: 95, decisionAuthority: 60, budgetReadiness: 85 },
    recommend: [
      { actionTypeId: 'arrange_measurement', reason: 'Measurement slot verbally agreed for Saturday — confirm and dispatch the team.', priority: 'high' },
      { actionTypeId: 'share_design', reason: 'Joint decision-maker needs a design walkthrough before sign-off.', priority: 'medium' },
    ],
  },

  /* ── 2. Price objection, partially handled ───────────────────────────── */
  {
    id: 'sc-price-objection',
    label: 'Price objection — partially handled',
    purpose: 'Quotation discussion',
    outcome: 'Follow-up scheduled',
    businessUnit: 'Retail Sales',
    weight: 16,
    summary:
      'Customer received the quotation and finds it 20–25% above a competing quote. Agent reframed on material and warranty but did not fully close the gap; a revised option was promised.',
    topics: ['Quotation', 'Price', 'Competitor', 'Warranty'],
    turns: [
      { s: 'agent', t: 'Hello {name}, {agent} from Sunroof, on a recorded line. Did you get a chance to look at the quotation I sent?', hi: 'नमस्ते {name}, मैं सनरूफ़ से {agent} बोल रहा हूँ, यह कॉल रिकॉर्ड हो रही है। क्या आपने भेजा गया कोटेशन देख लिया?', sent: 0.1 },
      { s: 'customer', t: 'I saw it. Honestly it is much higher than what I expected.', hi: 'देख लिया। सच कहूँ तो यह मेरी उम्मीद से काफ़ी ज़्यादा है।', sent: -0.4, obj: 'price_discount', objIntensity: 3 },
      { s: 'customer', t: 'I have another quote which is almost two lakh less for the same size.', hi: 'मेरे पास एक और कोटेशन है जो उतने ही साइज़ के लिए लगभग दो लाख कम है।', sent: -0.5, obj: 'competitor_preference', objIntensity: 2 },
      { s: 'agent', t: 'I understand, and I would compare the same way. May I ask what the other quote uses for the shutter core and the counter?', hi: 'मैं समझ सकता हूँ, मैं भी ऐसे ही तुलना करता। क्या मैं पूछ सकता हूँ कि उस कोटेशन में शटर कोर और काउंटर किस मटीरियल का है?', sent: 0.1, handles: { resolution: 'partially_resolved', technique: 'Acknowledge & clarify' } },
      { s: 'customer', t: 'They said plywood with laminate, and granite on top.', hi: 'उन्होंने कहा प्लाईवुड पर लैमिनेट, और ऊपर ग्रेनाइट।', sent: 0 },
      { s: 'agent', t: 'That is the difference. Ours is 100% engineered stone through the section, so it does not swell, and it carries a ten-year warranty against warping. Plywood and laminate typically does not.', hi: 'यही अंतर है। हमारा पूरा सेक्शन इंजीनियर्ड स्टोन का है, इसलिए वह फूलता नहीं, और उस पर दस साल की वारंटी है। प्लाईवुड-लैमिनेट पर आमतौर पर नहीं होती।', sent: 0.3, handles: { resolution: 'partially_resolved', technique: 'Value reframe' } },
      { s: 'customer', t: 'I hear you, but two lakh is two lakh. Can you do something on the price?', hi: 'बात समझ आती है, लेकिन दो लाख आख़िर दो लाख हैं। कीमत में कुछ हो सकता है?', sent: -0.3, obj: 'price_discount', objIntensity: 2 },
      { s: 'customer', t: 'And what exactly does the warranty cover?', hi: 'और वारंटी में असल में क्या-क्या कवर होता है?', sent: -0.1, faq: 'warranty_amc' },
      { s: 'agent', t: 'The warranty covers the stone body and the hardware for ten years. I will send the exact terms with the revised option.', hi: 'वारंटी में स्टोन बॉडी और हार्डवेयर दस साल तक कवर हैं। सटीक शर्तें मैं संशोधित विकल्प के साथ भेज दूँगा।', sent: 0.2, answers: 'partially_answered' },
      { s: 'agent', t: 'On price — let me rework the storage mix and come back with a revised quotation by Wednesday. I would rather change the scope than the quality.', hi: 'कीमत पर — मैं स्टोरेज का मिक्स दोबारा देखकर बुधवार तक संशोधित कोटेशन भेजता हूँ। मैं क्वालिटी नहीं, स्कोप बदलना पसंद करूँगा।', sent: 0.3, commit: { actionTypeId: 'share_quotation', party: 'employee', dueInHours: 48 } },
      { s: 'customer', t: 'Fine, send it by Wednesday. I will decide after that.', hi: 'ठीक है, बुधवार तक भेज दीजिए। उसके बाद मैं तय करूँगा।', sent: -0.1 },
    ],
    signals: {
      need: 'Modular kitchen already quoted; customer comparing on price against a plywood-laminate alternative',
      productInterest: 'Urban Parallel Kitchen',
      budgetInr: null,
      timeline: 'within_1_month',
      decisionMaker: 'sole',
      requestedQuotation: true,
      requestedDemo: false,
      requestedSiteVisit: false,
      requestedDesign: false,
      buyingSignals: ['Asked for a revised quotation', 'Set a decision date'],
      crossSell: [],
      competitors: ['Local carpenter'],
      discountRequested: true,
      hesitation: ['Price gap of ~₹2 lakh against a plywood-laminate quote'],
    },
    themes: {
      appreciation: [],
      dissatisfaction: ['Quotation higher than expected'],
      featureRequests: [],
      expectations: ['Revised quotation by Wednesday', 'Written warranty terms'],
      painPoints: ['Comparing quotes with different material specifications'],
    },
    emotions: { frustration: 0.45, hesitation: 0.7, interest: 0.5, trust: 0.4 },
    qualityBase: 72,
    readiness: { needAndFit: 80, explicitIntent: 55, timeline: 65, nextStepCommitment: 70, decisionAuthority: 85, budgetReadiness: 30 },
    recommend: [
      { actionTypeId: 'share_quotation', reason: 'Revised quotation promised by Wednesday — the customer has set a decision date.', priority: 'high' },
      { actionTypeId: 'technical_clarification', reason: 'Send written warranty terms; the warranty question was only partially answered.', priority: 'medium' },
    ],
  },

  /* ── 3. Finance / EMI question that nobody can answer ────────────────── */
  {
    id: 'sc-finance-gap',
    label: 'Payment & finance — knowledge gap',
    purpose: 'New enquiry',
    outcome: 'Information shared',
    businessUnit: 'Retail Sales',
    weight: 12,
    summary:
      'Customer wants EMI and a staged payment plan. No approved knowledge-base article exists for finance, so the agent could not give a definitive answer and the question went out unanswered.',
    topics: ['Payment', 'EMI', 'Finance', 'Booking process'],
    turns: [
      { s: 'agent', t: 'Hello {name}, {agent} from Sunroof on a recorded line. You had enquired about a kitchen for your {city} flat.', sent: 0.2 },
      { s: 'customer', t: 'Yes. Before anything else — do you have an EMI option? I cannot pay it all upfront.', sent: 0, faq: 'payment_finance' },
      { s: 'agent', t: 'We do have a payment schedule in stages. On EMI specifically, I will have to check with our finance team and confirm.', sent: 0, answers: 'unanswered' },
      { s: 'customer', t: 'That is the main thing for me. Everything else depends on it.', sent: -0.2 },
      { s: 'customer', t: 'What is the payment schedule then?', sent: 0, faq: 'documents_process' },
      { s: 'agent', t: 'It is typically forty percent at booking, forty at production start and twenty at handover, with the booking amount adjusted in the first milestone.', sent: 0.2, answers: 'fully_answered' },
      { s: 'customer', t: 'Forty percent upfront is a lot. That is exactly why I asked about EMI.', sent: -0.4, obj: 'payment_terms', objIntensity: 2 },
      { s: 'agent', t: 'I hear you. Let me get you a proper answer on the finance options rather than guessing — I will call you back tomorrow.', sent: 0.1, handles: { resolution: 'unresolved', technique: 'Acknowledge & clarify' }, commit: { actionTypeId: 'call_back', party: 'employee', dueInHours: 24 } },
      { s: 'customer', t: 'Okay. If EMI is not possible I will probably have to wait a few months.', sent: -0.3 },
    ],
    signals: {
      need: 'Modular kitchen contingent on an EMI / staged finance option',
      productInterest: 'Essential Straight Kitchen',
      budgetInr: null,
      timeline: 'within_3_months',
      decisionMaker: 'sole',
      requestedQuotation: false,
      requestedDemo: false,
      requestedSiteVisit: false,
      requestedDesign: false,
      buyingSignals: ['Asked about booking process'],
      crossSell: [],
      competitors: [],
      discountRequested: false,
      hesitation: ['40% booking amount', 'No confirmed EMI option'],
    },
    themes: {
      appreciation: [],
      dissatisfaction: ['No clear answer on EMI availability'],
      featureRequests: ['EMI / no-cost finance option'],
      expectations: ['Call back tomorrow with finance options'],
      painPoints: ['Cannot fund 40% upfront'],
    },
    emotions: { hesitation: 0.8, confusion: 0.5, interest: 0.5, frustration: 0.35 },
    qualityBase: 68,
    readiness: { needAndFit: 70, explicitIntent: 45, timeline: 45, nextStepCommitment: 60, decisionAuthority: 80, budgetReadiness: 20 },
    recommend: [
      { actionTypeId: 'call_back', reason: 'Finance answer promised within 24 hours; the whole decision depends on it.', priority: 'high' },
      { actionTypeId: 'nurture', reason: 'If no finance option exists, move to a nurture track rather than losing the lead.', priority: 'low' },
    ],
  },

  /* ── 4. Service complaint, unresolved ────────────────────────────────── */
  {
    id: 'sc-complaint',
    label: 'Post-installation complaint — unresolved at call end',
    purpose: 'Service / complaint',
    outcome: 'Complaint logged',
    businessUnit: 'Customer Service',
    weight: 12,
    summary:
      'Second complaint about a misaligned shutter and a chipped edge four weeks after handover. Previous visit did not fix it. Customer is angry; a specialist visit was promised.',
    topics: ['Installation defect', 'Repeat complaint', 'Service visit'],
    turns: [
      { s: 'agent', t: 'Good morning {name}, {agent} from Sunroof service, recorded line. I am calling about the complaint you raised.', sent: 0.1 },
      { s: 'customer', t: 'This is the second time I am raising it. Your team came and did nothing.', sent: -0.7 },
      { s: 'customer', t: 'The tall unit shutter is still not aligned and there is a chip on the counter edge near the sink.', sent: -0.6 },
      { s: 'agent', t: 'That should not have happened, and I am sorry you had to call twice. Let me get the exact status.', sent: 0.1 },
      { s: 'customer', t: 'How does a chip appear in four weeks on a stone you say is scratch proof?', sent: -0.7, faq: 'product_quality', obj: 'product_quality', objIntensity: 3 },
      { s: 'agent', t: 'A chip on the edge is usually impact, not wear, but it is covered — I am raising it as a defect, not a chargeable repair.', sent: 0.2, answers: 'partially_answered', handles: { resolution: 'partially_resolved', technique: 'Acknowledge & clarify' } },
      { s: 'customer', t: 'And how long will it take this time? Last time I waited eleven days.', sent: -0.6, faq: 'service_complaint' },
      { s: 'agent', t: 'I am escalating this to a senior technician and requesting a visit within forty-eight hours. I will personally confirm the slot today.', sent: 0.2, answers: 'fully_answered', commit: { actionTypeId: 'escalate_complaint', party: 'employee', dueInHours: 8 } },
      { s: 'customer', t: 'I have heard this before. If it is not fixed this week I am going to write to the consumer forum.', sent: -0.8, flag: 'legal_threat_unescalated' },
      { s: 'agent', t: 'I understand. I am logging your escalation now and my manager will call you today.', sent: 0.1, commit: { actionTypeId: 'assign_specialist', party: 'employee', dueInHours: 24 } },
      { s: 'customer', t: 'Please make sure someone actually comes this time.', sent: -0.5 },
    ],
    signals: {
      need: 'Rectification of a misaligned tall-unit shutter and a chipped counter edge',
      productInterest: null,
      budgetInr: null,
      timeline: 'immediate',
      decisionMaker: 'sole',
      requestedQuotation: false,
      requestedDemo: false,
      requestedSiteVisit: true,
      requestedDesign: false,
      buyingSignals: [],
      crossSell: [],
      competitors: [],
      discountRequested: false,
      hesitation: [],
    },
    themes: {
      appreciation: [],
      dissatisfaction: ['Repeat visit did not resolve the defect', 'Eleven-day wait on the previous complaint'],
      featureRequests: [],
      expectations: ['Technician visit within 48 hours', 'Manager call today'],
      painPoints: ['Misaligned shutter', 'Chipped counter edge four weeks after handover'],
    },
    emotions: { frustration: 0.95, urgency: 0.85, trust: 0.15, satisfaction: 0.1 },
    qualityBase: 74,
    readiness: { needAndFit: 0, explicitIntent: 0, timeline: 0, nextStepCommitment: 60, decisionAuthority: 0, budgetReadiness: 0 },
    recommend: [
      { actionTypeId: 'escalate_complaint', reason: 'Repeat unresolved defect with a stated legal-forum threat — escalate immediately.', priority: 'critical' },
      { actionTypeId: 'assign_specialist', reason: 'Senior technician visit within 48 hours was promised on the call.', priority: 'critical' },
    ],
    endsNegative: true,
  },

  /* ── 5. Competitor comparison, trust objection ───────────────────────── */
  {
    id: 'sc-competitor',
    label: 'Competitor comparison — trust objection',
    purpose: 'Follow-up',
    outcome: 'Meaningful conversation',
    businessUnit: 'Retail Sales',
    weight: 11,
    summary:
      'Customer is shortlisting between Sunroof and two national brands and has read mixed reviews. Wants proof of installation quality and serviceability in their city.',
    topics: ['Competitor comparison', 'Reviews', 'Serviceability', 'Installation'],
    turns: [
      { s: 'agent', t: 'Hello {name}, {agent} from Sunroof, recorded line. Following up on your showroom visit last week.', sent: 0.2 },
      { s: 'customer', t: 'Yes. I am comparing you with Sleek and Livspace right now.', sent: 0, obj: 'competitor_preference', objIntensity: 2 },
      { s: 'customer', t: 'What actually makes you different from them?', sent: 0, faq: 'competitor_comparison' },
      { s: 'agent', t: 'The main difference is the material — we make 100% engineered stone kitchens, so the carcass and the shutter are the same stone. Most brands do board with a stone counter.', sent: 0.3, answers: 'partially_answered' },
      { s: 'customer', t: 'I read a few reviews about installation delays though. That worries me.', sent: -0.4, obj: 'trust', objIntensity: 2 },
      { s: 'agent', t: 'That is fair. I can share three recent handovers in {city} with dates, and you are welcome to speak to one of those customers.', sent: 0.3, handles: { resolution: 'resolved', technique: 'Evidence / proof point' } },
      { s: 'customer', t: 'That would help. Do you service {city} directly or through a franchise?', sent: 0.1, faq: 'serviceable_locations' },
      { s: 'agent', t: 'Directly — we have our own installation and service team in {city}, which is why we can commit to a 48-hour service response.', sent: 0.4, answers: 'fully_answered' },
      { s: 'customer', t: 'Okay, that is reassuring. Send me those references and the installation process document.', sent: 0.4 },
      { s: 'agent', t: 'I will send both today, and call you Friday once you have had a chance to look.', sent: 0.4, commit: { actionTypeId: 'send_catalogue', party: 'employee', dueInHours: 24 } },
      { s: 'agent', t: 'I will also block Friday for a call.', sent: 0.3, commit: { actionTypeId: 'call_back', party: 'employee', dueInHours: 96 } },
    ],
    signals: {
      need: 'Reassurance on installation reliability and local service before shortlisting',
      productInterest: 'Signature L-Shaped Kitchen',
      budgetInr: null,
      timeline: 'within_1_month',
      decisionMaker: 'joint',
      requestedQuotation: false,
      requestedDemo: false,
      requestedSiteVisit: false,
      requestedDesign: false,
      buyingSignals: ['Asked for customer references', 'Agreed to a Friday follow-up'],
      crossSell: [],
      competitors: ['Sleek', 'Livspace'],
      discountRequested: false,
      hesitation: ['Reviews mentioning installation delays'],
    },
    themes: {
      appreciation: ['Direct service team in the city'],
      dissatisfaction: [],
      featureRequests: [],
      expectations: ['Reference customers and installation document today'],
      painPoints: ['Uncertainty from mixed online reviews'],
    },
    emotions: { hesitation: 0.6, trust: 0.55, interest: 0.7, confusion: 0.3 },
    qualityBase: 81,
    readiness: { needAndFit: 75, explicitIntent: 55, timeline: 60, nextStepCommitment: 75, decisionAuthority: 55, budgetReadiness: 40 },
    recommend: [
      { actionTypeId: 'send_catalogue', reason: 'Reference handovers and installation process document promised today.', priority: 'high' },
      { actionTypeId: 'call_back', reason: 'Friday follow-up agreed while the customer is actively shortlisting.', priority: 'medium' },
    ],
  },

  /* ── 6. Unapproved discount (compliance breach) ──────────────────────── */
  {
    id: 'sc-discount-breach',
    label: 'Negotiation — unapproved discount offered',
    purpose: 'Quotation discussion',
    outcome: 'Meaningful conversation',
    businessUnit: 'Retail Sales',
    weight: 6,
    summary:
      'Under pressure to close before month-end, the agent verbally offered 18% off — above the approved 12% matrix — and promised a delivery date shorter than the standard lead time.',
    topics: ['Discount', 'Negotiation', 'Delivery timeline'],
    turns: [
      { s: 'agent', t: 'Hello {name}, {agent} from Sunroof, recorded line. I wanted to close this before month-end if we can.', sent: 0.2 },
      { s: 'customer', t: 'I am interested but the number has to come down. What is your best price?', sent: -0.1, obj: 'price_discount', objIntensity: 2 },
      { s: 'agent', t: 'Let me be direct — I can do eighteen percent off if you confirm this week. That is the best anyone will give you.', sent: 0.3, flag: 'unapproved_discount', handles: { resolution: 'resolved', technique: 'Trial close' } },
      { s: 'customer', t: 'Eighteen percent? Alright, that changes things. And delivery?', sent: 0.5 },
      { s: 'customer', t: 'I need it installed within four weeks.', sent: 0.2, faq: 'delivery_timeline' },
      { s: 'agent', t: 'Four weeks is fine, I will make it happen.', sent: 0.4, answers: 'fully_answered', flag: 'false_commitment' },
      { s: 'customer', t: 'Then send me the revised quotation with both those things in writing.', sent: 0.5 },
      { s: 'agent', t: 'I will send it tomorrow.', sent: 0.4, commit: { actionTypeId: 'share_quotation', party: 'employee', dueInHours: 48 } },
    ],
    signals: {
      need: 'Kitchen installed within four weeks at a negotiated price',
      productInterest: 'Urban L-Shaped Kitchen',
      budgetInr: null,
      timeline: 'immediate',
      decisionMaker: 'sole',
      requestedQuotation: true,
      requestedDemo: false,
      requestedSiteVisit: false,
      requestedDesign: false,
      buyingSignals: ['Asked for a revised quotation in writing', 'Ready to confirm this week'],
      crossSell: [],
      competitors: [],
      discountRequested: true,
      hesitation: ['Price'],
    },
    themes: {
      appreciation: [],
      dissatisfaction: [],
      featureRequests: [],
      expectations: ['18% discount in writing', 'Installation within four weeks'],
      painPoints: [],
    },
    emotions: { interest: 0.8, urgency: 0.7, trust: 0.6 },
    qualityBase: 58,
    readiness: { needAndFit: 80, explicitIntent: 85, timeline: 90, nextStepCommitment: 70, decisionAuthority: 85, budgetReadiness: 55 },
    recommend: [
      { actionTypeId: 'assign_specialist', reason: 'Commercial review required before any quotation goes out — the discount exceeds the approved matrix.', priority: 'critical' },
    ],
  },

  /* ── 7. Design & measurement follow-up ───────────────────────────────── */
  {
    id: 'sc-design',
    label: 'Design discussion — drawings and measurement',
    purpose: 'Design discussion',
    outcome: 'Follow-up scheduled',
    businessUnit: 'Retail Sales',
    weight: 10,
    summary:
      'Design review call. Customer wants two changes to the drawing and asks how customisation affects timeline and price. Revised drawings promised in three days.',
    topics: ['Design', 'Drawings', 'Customisation', 'Timeline'],
    turns: [
      { s: 'agent', t: 'Hello {name}, {agent} from Sunroof, recorded line. Did the drawings reach you?', sent: 0.2 },
      { s: 'customer', t: 'Yes, they look good overall. Two things — the tall unit is blocking the window, and I want a taller wall cabinet.', sent: 0.1 },
      { s: 'customer', t: 'Can these be changed, or is it a fixed layout?', sent: 0, faq: 'customisation' },
      { s: 'agent', t: 'Both are changeable. The tall unit can shift to the other run, and wall cabinets go up to 900 in the same finish.', sent: 0.3, answers: 'fully_answered' },
      { s: 'customer', t: 'Does that push the timeline or the price?', sent: 0, faq: 'delivery_timeline' },
      { s: 'agent', t: 'Moving the tall unit does not. The taller wall cabinet adds a small amount of stone — I will show the exact delta in the revised drawing.', sent: 0.2, answers: 'partially_answered' },
      { s: 'customer', t: 'Alright. And how accurate is the site measurement — my walls are not straight.', sent: 0, faq: 'design_drawings_measurement' },
      { s: 'agent', t: 'We laser-measure and build a tolerance into the stone cut, which is why we measure after civil work is finished.', sent: 0.3, answers: 'fully_answered' },
      { s: 'customer', t: 'Good. Send the revised drawing and I will confirm.', sent: 0.3 },
      { s: 'agent', t: 'Revised drawings in three working days, and I will call you the same day.', sent: 0.4, commit: { actionTypeId: 'share_design', party: 'employee', dueInHours: 96 } },
    ],
    signals: {
      need: 'Two layout changes to the approved drawing before booking',
      productInterest: 'Signature Island Kitchen',
      budgetInr: null,
      timeline: 'within_1_month',
      decisionMaker: 'sole',
      requestedQuotation: false,
      requestedDemo: false,
      requestedSiteVisit: false,
      requestedDesign: true,
      buyingSignals: ['Reviewing drawings', 'Said they will confirm after the revision'],
      crossSell: ['Wardrobe & Storage'],
      competitors: [],
      discountRequested: false,
      hesitation: ['Unclear price impact of the design change'],
    },
    themes: {
      appreciation: ['Drawings looked good overall'],
      dissatisfaction: [],
      featureRequests: ['Taller wall cabinets as a standard option'],
      expectations: ['Revised drawings in three working days', 'Exact price delta shown'],
      painPoints: ['Tall unit blocking the window', 'Walls are not square'],
    },
    emotions: { interest: 0.75, trust: 0.65, confusion: 0.3, satisfaction: 0.6 },
    qualityBase: 79,
    readiness: { needAndFit: 85, explicitIntent: 70, timeline: 65, nextStepCommitment: 80, decisionAuthority: 80, budgetReadiness: 50 },
    recommend: [
      { actionTypeId: 'share_design', reason: 'Revised drawings committed within three working days.', priority: 'high' },
      { actionTypeId: 'share_quotation', reason: 'Price delta for the taller wall cabinet still owed to the customer.', priority: 'medium' },
    ],
  },

  /* ── 8. Payment follow-up ────────────────────────────────────────────── */
  {
    id: 'sc-payment',
    label: 'Payment follow-up — milestone overdue',
    purpose: 'Payment follow-up',
    outcome: 'Meaningful conversation',
    businessUnit: 'Customer Service',
    weight: 8,
    summary:
      'Production-milestone payment is nine days overdue. Customer links payment to a pending snag from the last visit. Agent agreed to close the snag first, then collect.',
    topics: ['Payment', 'Milestone', 'Snag'],
    turns: [
      { s: 'agent', t: 'Good afternoon {name}, {agent} from Sunroof accounts, recorded line. I am calling about the production milestone.', sent: 0.1 },
      { s: 'customer', t: 'I know it is due. But the snag from the last visit is still open.', sent: -0.3 },
      { s: 'customer', t: 'Why should I release payment when a panel is still not replaced?', sent: -0.5, obj: 'payment_terms', objIntensity: 2 },
      { s: 'agent', t: 'That is a fair position. Let me get the panel replacement scheduled first and then we can align the payment.', sent: 0.2, handles: { resolution: 'partially_resolved', technique: 'Acknowledge & clarify' } },
      { s: 'customer', t: 'When will someone come?', sent: -0.2, faq: 'service_complaint' },
      { s: 'agent', t: 'I will confirm a slot within two working days and message you the technician details.', sent: 0.2, answers: 'fully_answered', commit: { actionTypeId: 'assign_specialist', party: 'employee', dueInHours: 48 } },
      { s: 'customer', t: 'Once that is done I will release the payment the same week.', sent: 0.1, commit: { actionTypeId: 'payment_followup', party: 'customer', dueInHours: 168 } },
      { s: 'agent', t: 'Thank you. I will call you once the panel is replaced.', sent: 0.3, commit: { actionTypeId: 'payment_followup', party: 'employee', dueInHours: 168 } },
    ],
    signals: {
      need: 'Snag closure before releasing the production milestone payment',
      productInterest: null,
      budgetInr: null,
      timeline: 'immediate',
      decisionMaker: 'sole',
      requestedQuotation: false,
      requestedDemo: false,
      requestedSiteVisit: true,
      requestedDesign: false,
      buyingSignals: [],
      crossSell: [],
      competitors: [],
      discountRequested: false,
      hesitation: [],
    },
    themes: {
      appreciation: [],
      dissatisfaction: ['Open snag from the previous visit'],
      featureRequests: [],
      expectations: ['Technician slot within two working days'],
      painPoints: ['Unreplaced panel blocking payment'],
    },
    emotions: { frustration: 0.55, urgency: 0.5, trust: 0.45 },
    qualityBase: 76,
    readiness: { needAndFit: 0, explicitIntent: 0, timeline: 0, nextStepCommitment: 75, decisionAuthority: 0, budgetReadiness: 0 },
    recommend: [
      { actionTypeId: 'assign_specialist', reason: 'Panel replacement blocks a ₹-value milestone — schedule within two working days.', priority: 'high' },
      { actionTypeId: 'payment_followup', reason: 'Customer committed to release payment the same week the snag closes.', priority: 'medium' },
    ],
  },

  /* ── 9. Low-intent enquiry, polite but not buying ────────────────────── */
  {
    id: 'sc-polite-low-intent',
    label: 'Polite enquiry — low intent (politeness ≠ intent)',
    purpose: 'New enquiry',
    outcome: 'Information shared',
    businessUnit: 'Retail Sales',
    weight: 11,
    summary:
      'A warm, courteous conversation with no stated need, no timeline and no budget. Sentiment is positive; purchase readiness is deliberately low — polite language is not buying intent (§3).',
    topics: ['General enquiry', 'Product information'],
    turns: [
      { s: 'agent', t: 'Good evening {name}, {agent} from Sunroof, recorded line. Thank you for filling the enquiry form.', sent: 0.3 },
      { s: 'customer', t: 'Thank you for calling, that is very kind of you.', sent: 0.6 },
      { s: 'customer', t: 'I was just browsing really. What sort of kitchens do you make?', sent: 0.3, faq: 'features_benefits' },
      { s: 'agent', t: 'We make 100% engineered stone kitchens — the same stone through the carcass and shutter, so no board, no swelling.', sent: 0.3, answers: 'fully_answered' },
      { s: 'customer', t: 'That sounds lovely. And what is the price range, just so I know?', sent: 0.4, faq: 'pricing_discounts' },
      { s: 'agent', t: 'Our Essential series starts around four and a half lakh and Signature can go past twenty-five, depending on size.', sent: 0.2, answers: 'fully_answered' },
      { s: 'customer', t: 'I see. We are not renovating right now, maybe next year sometime.', sent: 0.2 },
      { s: 'agent', t: 'Of course. Shall I send you the catalogue so you have it when the time comes?', sent: 0.3, commit: { actionTypeId: 'send_catalogue', party: 'employee', dueInHours: 24 } },
      { s: 'customer', t: 'Yes please, that would be very helpful. Thank you so much for your time.', sent: 0.7 },
    ],
    signals: {
      need: null,
      productInterest: null,
      budgetInr: null,
      timeline: 'later',
      decisionMaker: null,
      requestedQuotation: false,
      requestedDemo: false,
      requestedSiteVisit: false,
      requestedDesign: false,
      buyingSignals: [],
      crossSell: [],
      competitors: [],
      discountRequested: false,
      hesitation: ['No renovation planned this year'],
    },
    themes: {
      appreciation: ['Appreciated being called back'],
      dissatisfaction: [],
      featureRequests: [],
      expectations: ['Catalogue for future reference'],
      painPoints: [],
    },
    emotions: { interest: 0.35, trust: 0.7, satisfaction: 0.8, urgency: 0.05 },
    qualityBase: 77,
    readiness: { needAndFit: 20, explicitIntent: 10, timeline: 10, nextStepCommitment: 25, decisionAuthority: 0, budgetReadiness: 0 },
    recommend: [
      { actionTypeId: 'send_catalogue', reason: 'Catalogue requested; keep the relationship warm.', priority: 'low' },
      { actionTypeId: 'nurture', reason: 'No need, timeline or budget stated — nurture rather than working as a live opportunity.', priority: 'low' },
    ],
  },

  /* ── 10. Cancellation / refund risk ──────────────────────────────────── */
  {
    id: 'sc-cancellation',
    label: 'Cancellation and refund indication',
    purpose: 'Follow-up',
    outcome: 'Meaningful conversation',
    businessUnit: 'Customer Service',
    weight: 5,
    summary:
      'Booked customer is considering cancelling because the project has slipped twice. Explicitly asked about the refund process. Retention escalation required.',
    topics: ['Cancellation', 'Refund', 'Project delay'],
    turns: [
      { s: 'agent', t: 'Hello {name}, {agent} from Sunroof, recorded line. I am calling with an update on your project.', sent: 0.1 },
      { s: 'customer', t: 'Before the update — I want to know how a cancellation and refund would work.', sent: -0.6 },
      { s: 'customer', t: 'You have moved the date twice. My family is eating out every day.', sent: -0.8 },
      { s: 'agent', t: 'I am sorry. That is a genuine failure on our side and I will not defend it.', sent: 0, handles: { resolution: 'partially_resolved', technique: 'Acknowledge & clarify' } },
      { s: 'customer', t: 'So what is the refund policy?', sent: -0.6, faq: 'documents_process', obj: 'trust', objIntensity: 3 },
      { s: 'agent', t: 'Refunds after production start are governed by the booking terms; I would rather get you a firm installation date today than take you down that route.', sent: 0.1, answers: 'partially_answered' },
      { s: 'customer', t: 'Then give me a date I can rely on. One more slip and I am cancelling.', sent: -0.7 },
      { s: 'agent', t: 'I am escalating this to the projects head and you will have a committed date by tomorrow evening.', sent: 0.2, commit: { actionTypeId: 'escalate_complaint', party: 'employee', dueInHours: 24 } },
    ],
    signals: {
      need: 'A reliable installation date, or a refund',
      productInterest: null,
      budgetInr: null,
      timeline: 'immediate',
      decisionMaker: 'sole',
      requestedQuotation: false,
      requestedDemo: false,
      requestedSiteVisit: false,
      requestedDesign: false,
      buyingSignals: [],
      crossSell: [],
      competitors: [],
      discountRequested: false,
      hesitation: [],
    },
    themes: {
      appreciation: [],
      dissatisfaction: ['Installation date moved twice', 'No proactive communication'],
      featureRequests: [],
      expectations: ['Committed installation date by tomorrow evening'],
      painPoints: ['Household without a working kitchen'],
    },
    emotions: { frustration: 0.9, urgency: 0.9, trust: 0.15, satisfaction: 0.05 },
    qualityBase: 71,
    readiness: { needAndFit: 0, explicitIntent: 0, timeline: 0, nextStepCommitment: 65, decisionAuthority: 0, budgetReadiness: 0 },
    recommend: [
      { actionTypeId: 'escalate_complaint', reason: 'Explicit cancellation and refund enquiry on a booked order — retention escalation.', priority: 'critical' },
      { actionTypeId: 'assign_specialist', reason: 'Projects head must own the committed date.', priority: 'high' },
    ],
    endsNegative: true,
  },

  /* ── 11. Availability / serviceability dead end ──────────────────────── */
  {
    id: 'sc-serviceability',
    label: 'Serviceability — location not covered',
    purpose: 'New enquiry',
    outcome: 'Information shared',
    businessUnit: 'Retail Sales',
    weight: 7,
    summary:
      'Genuine interest but the delivery location is outside the serviced radius. The finish the customer wanted was also unavailable. Lead parked, not disqualified.',
    topics: ['Serviceability', 'Availability', 'Finish options'],
    turns: [
      { s: 'agent', t: 'Hello {name}, {agent} from Sunroof, recorded line. You had asked about a kitchen for a property near {city}.', sent: 0.2 },
      { s: 'customer', t: 'Yes, it is about ninety kilometres out. Do you install there?', sent: 0.1, faq: 'serviceable_locations' },
      { s: 'agent', t: 'Our direct installation radius is sixty kilometres from the {city} hub. Beyond that we can supply but installation would need a partner team.', sent: 0, answers: 'fully_answered' },
      { s: 'customer', t: 'I would not want a partner team doing it. That defeats the purpose.', sent: -0.4, obj: 'serviceability', objIntensity: 3 },
      { s: 'agent', t: 'I understand. I would rather tell you now than promise and disappoint.', sent: 0.1, handles: { resolution: 'unresolved', technique: 'Acknowledge & clarify' } },
      { s: 'customer', t: 'Also, is the matte graphite finish available? That is the one I liked.', sent: 0, faq: 'availability' },
      { s: 'agent', t: 'Matte graphite is on a twelve-week lead time at the moment.', sent: -0.1, answers: 'fully_answered' },
      { s: 'customer', t: 'Then this is not going to work for now. Keep me on your list.', sent: -0.2 },
      { s: 'agent', t: 'I will note it and come back when the radius or the finish changes.', sent: 0.2, commit: { actionTypeId: 'nurture', party: 'employee', dueInHours: 336 } },
    ],
    signals: {
      need: 'Kitchen for a property 90 km from the hub, matte graphite finish',
      productInterest: 'Urban L-Shaped Kitchen',
      budgetInr: null,
      timeline: 'within_3_months',
      decisionMaker: 'sole',
      requestedQuotation: false,
      requestedDemo: false,
      requestedSiteVisit: false,
      requestedDesign: false,
      buyingSignals: ['Asked to stay on the list'],
      crossSell: [],
      competitors: [],
      discountRequested: false,
      hesitation: ['Outside direct installation radius', 'Preferred finish on 12-week lead time'],
    },
    themes: {
      appreciation: ['Straight answer instead of a false promise'],
      dissatisfaction: ['Location not directly serviced'],
      featureRequests: ['Wider installation radius', 'Shorter lead time on matte graphite'],
      expectations: ['Contact when serviceability changes'],
      painPoints: ['No direct installation at the property'],
    },
    emotions: { interest: 0.5, hesitation: 0.7, trust: 0.6, frustration: 0.3 },
    qualityBase: 80,
    readiness: { needAndFit: 45, explicitIntent: 35, timeline: 40, nextStepCommitment: 30, decisionAuthority: 75, budgetReadiness: 20 },
    recommend: [
      { actionTypeId: 'nurture', reason: 'Genuine need blocked by serviceability — nurture until the radius or finish changes.', priority: 'low' },
    ],
  },

  /* ── 12. Rushed outbound, poor quality ───────────────────────────────── */
  {
    id: 'sc-rushed',
    label: 'Rushed outbound — no discovery, no next step',
    purpose: 'Follow-up',
    outcome: 'Meaningful conversation',
    businessUnit: 'Retail Sales',
    weight: 9,
    summary:
      'Agent pitched immediately without discovery, talked over the customer and ended without a next step. The customer was not negative — the call was simply poorly run.',
    topics: ['Product pitch', 'Follow-up'],
    turns: [
      { s: 'agent', t: 'Hi, {agent} from Sunroof. We have a festive offer running on modular kitchens this month, up to twelve percent off.', sent: 0.2 },
      { s: 'customer', t: 'Okay... I had enquired a while back, but—', sent: 0 },
      { s: 'agent', t: 'Right, so the offer covers the Urban and Essential series, and includes free installation.', sent: 0.2 },
      { s: 'customer', t: 'I was actually asking about a wardrobe, not a kitchen.', sent: -0.2 },
      { s: 'agent', t: 'We do wardrobes as well. The offer is valid till month end, so it is a good time.', sent: 0.1 },
      { s: 'customer', t: 'What sizes do the sliding wardrobes come in?', sent: 0, faq: 'technical_specs' },
      { s: 'agent', t: 'Standard sizes, I will send the brochure.', sent: 0, answers: 'partially_answered' },
      { s: 'customer', t: 'Alright, send it across.', sent: 0 },
      { s: 'agent', t: 'Sure, thank you.', sent: 0.1 },
    ],
    signals: {
      need: 'Sliding wardrobe (mis-identified as a kitchen enquiry on the call)',
      productInterest: 'Sliding Wardrobe',
      budgetInr: null,
      timeline: null,
      decisionMaker: null,
      requestedQuotation: false,
      requestedDemo: false,
      requestedSiteVisit: false,
      requestedDesign: false,
      buyingSignals: ['Asked for the brochure'],
      crossSell: [],
      competitors: [],
      discountRequested: false,
      hesitation: [],
    },
    themes: {
      appreciation: [],
      dissatisfaction: ['Agent pitched the wrong product category'],
      featureRequests: [],
      expectations: ['Wardrobe brochure with sizes'],
      painPoints: ['Had to correct the agent about what was enquired'],
    },
    emotions: { interest: 0.35, confusion: 0.6, frustration: 0.3, trust: 0.3 },
    qualityBase: 46,
    readiness: { needAndFit: 40, explicitIntent: 30, timeline: 0, nextStepCommitment: 20, decisionAuthority: 0, budgetReadiness: 0 },
    recommend: [
      { actionTypeId: 'send_catalogue', reason: 'Wardrobe brochure requested and not yet sent.', priority: 'medium' },
      { actionTypeId: 'call_back', reason: 'No next step was agreed on a live enquiry — re-open with proper discovery.', priority: 'medium' },
    ],
    omissions: ['no_permission_to_continue', 'missing_disclosure'],
  },

  /* ── 13. Not connected ───────────────────────────────────────────────── */
  {
    id: 'sc-not-connected',
    label: 'Not connected',
    purpose: 'Follow-up',
    outcome: 'Not connected',
    businessUnit: 'Retail Sales',
    weight: 8,
    summary: 'Call did not connect to the customer. No conversation content to analyse.',
    topics: [],
    turns: [{ s: 'agent', t: 'Hello? Hello, can you hear me?', sent: 0 }],
    signals: {
      need: null, productInterest: null, budgetInr: null, timeline: null, decisionMaker: null,
      requestedQuotation: false, requestedDemo: false, requestedSiteVisit: false, requestedDesign: false,
      buyingSignals: [], crossSell: [], competitors: [], discountRequested: false, hesitation: [],
    },
    themes: NO_THEMES,
    emotions: {},
    qualityBase: 0,
    readiness: { needAndFit: 0, explicitIntent: 0, timeline: 0, nextStepCommitment: 0, decisionAuthority: 0, budgetReadiness: 0 },
    recommend: [{ actionTypeId: 'call_back', reason: 'Call did not connect — retry at a different time of day.', priority: 'low' }],
  },

  /* ── 14. Cross-sell opportunity spotted ──────────────────────────────── */
  {
    id: 'sc-cross-sell',
    label: 'Post-handover check-in — cross-sell opportunity',
    purpose: 'Post-handover check-in',
    outcome: 'Quotation requested',
    businessUnit: 'Customer Service',
    weight: 8,
    summary:
      'Happy handover customer. During the check-in they mentioned redoing the two bedrooms — a wardrobe opportunity the agent correctly picked up and quoted.',
    topics: ['Handover feedback', 'Wardrobe', 'Cross-sell'],
    turns: [
      { s: 'agent', t: 'Good morning {name}, {agent} from Sunroof, recorded line. Calling to check how the kitchen has been these first two weeks.', sent: 0.3 },
      { s: 'customer', t: 'Very happy actually. The finish has held up and cleaning is much easier than our old one.', sent: 0.8 },
      { s: 'agent', t: 'That is good to hear. Anything at all not working as expected?', sent: 0.3 },
      { s: 'customer', t: 'Only one drawer feels slightly stiff, nothing serious.', sent: 0.2 },
      { s: 'agent', t: 'I will have that adjusted on a courtesy visit — no charge.', sent: 0.4, commit: { actionTypeId: 'assign_specialist', party: 'employee', dueInHours: 72 } },
      { s: 'customer', t: 'Thank you. We are actually redoing the two bedrooms next month.', sent: 0.5 },
      { s: 'customer', t: 'Do you make wardrobes in the same stone?', sent: 0.4, faq: 'features_benefits' },
      { s: 'agent', t: 'We do — the same engineered stone in sliding and walk-in formats, and we can match your kitchen finish exactly.', sent: 0.5, answers: 'fully_answered' },
      { s: 'customer', t: 'Then send me a quotation for both bedrooms.', sent: 0.6 },
      { s: 'agent', t: 'I will have it with you in two days, and I will include the finish match photos.', sent: 0.5, commit: { actionTypeId: 'share_quotation', party: 'employee', dueInHours: 48 } },
    ],
    signals: {
      need: 'Wardrobes for two bedrooms matching the existing kitchen finish',
      productInterest: 'Sliding Wardrobe',
      budgetInr: null,
      timeline: 'within_1_month',
      decisionMaker: 'sole',
      requestedQuotation: true,
      requestedDemo: false,
      requestedSiteVisit: false,
      requestedDesign: false,
      buyingSignals: ['Asked for a quotation unprompted', 'Renovation already scheduled next month'],
      crossSell: ['Sliding Wardrobe x2', 'Walk-in Wardrobe'],
      competitors: [],
      discountRequested: false,
      hesitation: [],
    },
    themes: {
      appreciation: ['Finish quality after two weeks', 'Easy to clean compared with the previous kitchen'],
      dissatisfaction: ['One stiff drawer'],
      featureRequests: [],
      expectations: ['Quotation in two days with finish-match photos', 'Courtesy visit for the drawer'],
      painPoints: [],
    },
    emotions: { satisfaction: 0.9, trust: 0.85, interest: 0.8 },
    qualityBase: 88,
    readiness: { needAndFit: 90, explicitIntent: 85, timeline: 75, nextStepCommitment: 90, decisionAuthority: 85, budgetReadiness: 45 },
    recommend: [
      { actionTypeId: 'share_quotation', reason: 'Customer asked for a two-bedroom wardrobe quotation — existing happy customer, high close likelihood.', priority: 'high' },
      { actionTypeId: 'assign_specialist', reason: 'Courtesy drawer adjustment promised on the call.', priority: 'medium' },
    ],
  },
]

export const SCENARIO_BY_ID: Record<string, Scenario> = Object.fromEntries(
  SCENARIOS.map((s) => [s.id, s]),
)
