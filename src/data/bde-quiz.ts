/**
 * BDE Monthly Quiz — bilingual question bank (English + Hindi).
 *
 * Grounded ONLY in the Magppie AI Bot Master Training Document (v1.0, May 2026)
 * — the single source of truth for the Business Development Executive (BDE) /
 * "Pooja" persona. Every answer + explanation is traceable to a section of that
 * document (see `source`). Many items are scenario-based to test application.
 *
 * The bank drives a MONTHLY quiz: a deterministic slice of questions is selected
 * per calendar month (see getMonthlySet) so BDEs get a fresh challenge every
 * month while the full bank is covered on rotation. Three difficulty levels —
 * easy, medium, hard — each carry different points. Every question is stored in
 * both English and Hindi; the learner chooses the language at runtime.
 */

export type QuizLevel = 'easy' | 'medium' | 'hard'
export type Language = 'en' | 'hi'

export interface QuizQuestion {
  id: string
  level: QuizLevel
  question: string
  questionHi: string
  options: string[]
  optionsHi: string[]
  /** Index into `options` / `optionsHi` of the correct answer (shared). */
  correctIndex: number
  explanation: string
  explanationHi: string
  /** Training-doc section this is grounded in (for auditability). */
  source: string
}

/** Points awarded for a correct answer, by level. */
export const LEVEL_POINTS: Record<QuizLevel, number> = {
  easy: 10,
  medium: 20,
  hard: 30,
}

export const LEVEL_LABELS: Record<QuizLevel, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

export const LEVEL_LABELS_I18N: Record<Language, Record<QuizLevel, string>> = {
  en: { easy: 'Easy', medium: 'Medium', hard: 'Hard' },
  hi: { easy: 'आसान', medium: 'मध्यम', hard: 'कठिन' },
}

/** How many questions of each level make up one monthly Full Challenge. */
export const MONTHLY_COUNTS: Record<QuizLevel, number> = {
  easy: 5,
  medium: 5,
  hard: 5,
}

/** Seconds allowed per question before it auto-skips. */
export const QUESTION_SECONDS = 30

/** Return the language-appropriate text for a question. */
export function localize(q: QuizQuestion, lang: Language) {
  return lang === 'hi'
    ? { question: q.questionHi, options: q.optionsHi, explanation: q.explanationHi }
    : { question: q.question, options: q.options, explanation: q.explanation }
}

/* ────────────────────────────────────────────────────────────────────────
 * EASY — brand foundation & headline facts (§1, §2, §8)
 * ──────────────────────────────────────────────────────────────────────── */
const EASY: QuizQuestion[] = [
  {
    id: 'e01',
    level: 'easy',
    question: 'What are Magppie Wellness Kitchens made from?',
    questionHi: 'Magppie Wellness Kitchens किससे बनी होती हैं?',
    options: [
      'Our patented SilverStone — 0% wood',
      'Marine-grade plywood',
      'Compressed MDF with a stone laminate',
      'Natural quarried granite',
    ],
    optionsHi: [
      'हमारे पेटेंटेड SilverStone से — 0% लकड़ी',
      'मरीन-ग्रेड प्लाईवुड से',
      'स्टोन लैमिनेट लगे कंप्रेस्ड MDF से',
      'प्राकृतिक खनन किए गए ग्रेनाइट से',
    ],
    correctIndex: 0,
    explanation:
      'Wellness Kitchens are made entirely from patented sanitised stone (SilverStone) — 0% wood, so no trees are cut and no formaldehyde is released.',
    explanationHi:
      'Wellness Kitchens पूरी तरह पेटेंटेड सैनिटाइज़्ड स्टोन (SilverStone) से बनी होती हैं — 0% लकड़ी, इसलिए न कोई पेड़ कटता है और न फॉर्मल्डिहाइड निकलता है।',
    source: '§1.3 What is a Wellness Kitchen?',
  },
  {
    id: 'e02',
    level: 'easy',
    question: "What is the bot persona's name and role?",
    questionHi: 'बॉट परसोना का नाम और भूमिका क्या है?',
    options: [
      'Pooja — Wellness Consultant',
      'Priya — Sales Executive',
      'Pooja — Customer Care Agent',
      'Neha — Design Consultant',
    ],
    optionsHi: [
      'पूजा — वेलनेस कंसल्टेंट',
      'प्रिया — सेल्स एग्ज़ीक्यूटिव',
      'पूजा — कस्टमर केयर एजेंट',
      'नेहा — डिज़ाइन कंसल्टेंट',
    ],
    correctIndex: 0,
    explanation:
      'The persona is Pooja, a Wellness Consultant for Magppie Wellness Kitchens and Wardrobes — warm, consultative, health-focused.',
    explanationHi:
      'परसोना है पूजा, Magppie Wellness Kitchens and Wardrobes की वेलनेस कंसल्टेंट — गर्मजोशी भरी, सलाहकार और हेल्थ-फोकस्ड।',
    source: '§2.1 Bot Identity',
  },
  {
    id: 'e03',
    level: 'easy',
    question: 'How does Magppie describe itself?',
    questionHi: 'Magppie खुद को कैसे बताती है?',
    options: [
      'A Wellness Movement, not a kitchen company',
      "India's cheapest modular kitchen brand",
      'A carpentry and interior contractor',
      'A natural-stone importer',
    ],
    optionsHi: [
      'एक वेलनेस मूवमेंट, कोई किचन कंपनी नहीं',
      'भारत का सबसे सस्ता मॉड्यूलर किचन ब्रांड',
      'एक कारपेंट्री और इंटीरियर कॉन्ट्रैक्टर',
      'एक नैचुरल-स्टोन इम्पोर्टर',
    ],
    correctIndex: 0,
    explanation:
      '"Magppie is not a kitchen company. Magppie is a Wellness Movement." We sell health, safety, and 25 years of peace of mind.',
    explanationHi:
      '"Magppie कोई किचन कंपनी नहीं है। Magppie एक वेलनेस मूवमेंट है।" हम बेचते हैं सेहत, सुरक्षा और 25 साल की निश्चिंतता।',
    source: '§1.1 Mission Statement',
  },
  {
    id: 'e04',
    level: 'easy',
    question: 'How many Safety Pillars does the SilverStone story use?',
    questionHi: 'SilverStone की कहानी में कितने सेफ्टी पिलर होते हैं?',
    options: ['7', '5', '10', '3'],
    optionsHi: ['7', '5', '10', '3'],
    correctIndex: 0,
    explanation:
      'There are 7 Safety Pillars, always presented in order: Stain, Scratch, High Load Bearing, Fire, Water, Impact, and More Storage.',
    explanationHi:
      '7 सेफ्टी पिलर होते हैं, हमेशा इसी क्रम में: Stain, Scratch, High Load Bearing, Fire, Water, Impact और More Storage।',
    source: '§1.5 The 7 Safety Pillars',
  },
  {
    id: 'e05',
    level: 'easy',
    question: 'What guarantee period comes with SilverStone cabinets and countertops?',
    questionHi: 'SilverStone कैबिनेट और काउंटरटॉप पर कितने साल की गारंटी मिलती है?',
    options: ['25 years', '10 years', '5 years', 'Lifetime, conditional'],
    optionsHi: ['25 साल', '10 साल', '5 साल', 'लाइफटाइम, शर्तों के साथ'],
    correctIndex: 0,
    explanation:
      'SilverStone carries a 25-year unconditional guarantee, plus 25 complimentary annual services.',
    explanationHi:
      'SilverStone पर 25 साल की अनकंडीशनल गारंटी है, साथ में 25 कॉम्प्लिमेंट्री सालाना सर्विस।',
    source: '§1.3 / §5 Q44',
  },
  {
    id: 'e06',
    level: 'easy',
    question: 'Which nano-particles is SilverStone infused with?',
    questionHi: 'SilverStone में कौन-से नैनो-पार्टिकल मिलाए जाते हैं?',
    options: ['Silver and Copper', 'Gold and Zinc', 'Silver and Titanium', 'Copper and Aluminium'],
    optionsHi: ['सिल्वर और कॉपर', 'गोल्ड और ज़िंक', 'सिल्वर और टाइटेनियम', 'कॉपर और एल्युमिनियम'],
    correctIndex: 0,
    explanation:
      'SilverStone is infused with silver and copper nano-particles, making it naturally anti-bacterial and anti-fungal.',
    explanationHi:
      'SilverStone में सिल्वर और कॉपर के नैनो-पार्टिकल मिले होते हैं, जिससे यह नैचुरली एंटी-बैक्टीरियल और एंटी-फंगल बनता है।',
    source: '§1.4 What is SilverStone?',
  },
  {
    id: 'e07',
    level: 'easy',
    question: 'How many complimentary annual services are included?',
    questionHi: 'कितनी कॉम्प्लिमेंट्री सालाना सर्विस शामिल हैं?',
    options: ['25', '10', '5', '15'],
    optionsHi: ['25', '10', '5', '15'],
    correctIndex: 0,
    explanation:
      '25 complimentary annual services — one every year — covering deep cleaning, sanitisation, and alignment/performance checks.',
    explanationHi:
      '25 कॉम्प्लिमेंट्री सालाना सर्विस — हर साल एक — जिसमें डीप क्लीनिंग, सैनिटाइज़ेशन और अलाइनमेंट/परफॉर्मेंस चेक शामिल हैं।',
    source: '§5 Q46',
  },
  {
    id: 'e08',
    level: 'easy',
    question: 'At what temperature is SilverStone baked?',
    questionHi: 'SilverStone को किस तापमान पर पकाया जाता है?',
    options: ['1,300°C', '800°C', '2,000°C', '500°C'],
    optionsHi: ['1,300°C', '800°C', '2,000°C', '500°C'],
    correctIndex: 0,
    explanation:
      'Porcelain clay is heated to around 1,300°C and infused with silver and copper nano-particles.',
    explanationHi:
      'पोर्सिलेन क्ले को लगभग 1,300°C पर गर्म किया जाता है और उसमें सिल्वर व कॉपर नैनो-पार्टिकल मिलाए जाते हैं।',
    source: '§1.4 / §5 Q1',
  },
  {
    id: 'e09',
    level: 'easy',
    question: 'Which award did Magppie win at KBIS 2026 in Orlando?',
    questionHi: 'KBIS 2026 (ऑरलैंडो) में Magppie ने कौन-सा अवॉर्ड जीता?',
    options: ['Most Unexpected Innovation', 'Best in Show', 'Product of the Year', 'Sustainability Leader'],
    optionsHi: ['Most Unexpected Innovation', 'Best in Show', 'Product of the Year', 'Sustainability Leader'],
    correctIndex: 0,
    explanation:
      "Magppie won the \"Most Unexpected Innovation\" award at KBIS 2026, the world's largest Kitchen & Bath Industry Show.",
    explanationHi:
      'Magppie ने KBIS 2026 में "Most Unexpected Innovation" अवॉर्ड जीता — यह दुनिया का सबसे बड़ा किचन एंड बाथ इंडस्ट्री शो है।',
    source: '§1.6 Awards & Recognition',
  },
  {
    id: 'e10',
    level: 'easy',
    question: 'How long has the Magppie Group been in business (the unified story)?',
    questionHi: 'यूनिफाइड स्टोरी के अनुसार Magppie ग्रुप कितने साल से बिज़नेस में है?',
    options: ['Over 50 years', '35 years', '40 years', 'Just under 20 years'],
    optionsHi: ['50 साल से ज़्यादा', '35 साल', '40 साल', '20 साल से थोड़ा कम'],
    correctIndex: 0,
    explanation:
      'Always lead with: 50+ years group heritage → 20+ years in kitchens → 9+ years SilverStone. Never open with 35 or 40 years.',
    explanationHi:
      'हमेशा इससे शुरू करें: 50+ साल ग्रुप हेरिटेज → 20+ साल किचन में → 9+ साल SilverStone में। 35 या 40 साल से कभी शुरू न करें।',
    source: '§1.2 Company Story',
  },
  {
    id: 'e11',
    level: 'easy',
    question: 'What is the per-square-foot price range for a Wellness Kitchen?',
    questionHi: 'Wellness Kitchen की प्रति वर्ग फुट कीमत रेंज क्या है?',
    options: ['Rs. 8,400 – 10,800', 'Rs. 3,000 – 5,000', 'Rs. 15,000 – 20,000', 'Rs. 500 – 1,000'],
    optionsHi: ['Rs. 8,400 – 10,800', 'Rs. 3,000 – 5,000', 'Rs. 15,000 – 20,000', 'Rs. 500 – 1,000'],
    correctIndex: 0,
    explanation:
      'Wellness Kitchens range from Rs. 8,400 to Rs. 10,800 per square foot, depending on the finish chosen.',
    explanationHi:
      'Wellness Kitchen की कीमत फिनिश के अनुसार Rs. 8,400 से 10,800 प्रति वर्ग फुट तक होती है।',
    source: '§7 Pricing / §8',
  },
  {
    id: 'e12',
    level: 'easy',
    question: 'Is SilverStone food-grade?',
    questionHi: 'क्या SilverStone फूड-ग्रेड है?',
    options: [
      'Yes — 100% food-grade, you can eat directly off it',
      'No — it needs a sealant first',
      'Only the countertop, not the cabinets',
      'Only after annual sanitisation',
    ],
    optionsHi: [
      'हाँ — 100% फूड-ग्रेड, आप इस पर सीधे खा सकते हैं',
      'नहीं — पहले सीलेंट लगाना पड़ता है',
      'सिर्फ काउंटरटॉप, कैबिनेट नहीं',
      'सिर्फ सालाना सैनिटाइज़ेशन के बाद',
    ],
    correctIndex: 0,
    explanation:
      'SilverStone is 100% food-grade; the silver and copper infusion prevents bacteria, so it is hygienic enough to eat directly on.',
    explanationHi:
      'SilverStone 100% फूड-ग्रेड है; सिल्वर और कॉपर इन्फ्यूज़न बैक्टीरिया रोकता है, इसलिए इस पर सीधे खाना हाइजीनिक है।',
    source: '§5 Q13',
  },
  {
    id: 'e13',
    level: 'easy',
    question: 'When was the first SilverStone kitchen installed?',
    questionHi: 'पहली SilverStone किचन कब इंस्टॉल हुई थी?',
    options: ['Late 2016', '2020', '2010', '2023'],
    optionsHi: ['2016 के अंत में', '2020', '2010', '2023'],
    correctIndex: 0,
    explanation:
      'The first SilverStone kitchen was installed in late 2016 — giving 9+ years of real-world performance validation.',
    explanationHi:
      'पहली SilverStone किचन 2016 के अंत में इंस्टॉल हुई थी — यानी 9+ साल का रियल-वर्ल्ड परफॉर्मेंस वैलिडेशन।',
    source: '§1.2 / §5 Q31',
  },
  {
    id: 'e14',
    level: 'easy',
    question: "What is Magppie's mission statement?",
    questionHi: 'Magppie का मिशन स्टेटमेंट क्या है?',
    options: [
      'To transform ordinary homes into wellness homes',
      'To make the most affordable kitchens in India',
      'To become the largest plywood brand',
      'To export granite worldwide',
    ],
    optionsHi: [
      'साधारण घरों को वेलनेस होम्स में बदलना',
      'भारत में सबसे सस्ती किचन बनाना',
      'सबसे बड़ा प्लाईवुड ब्रांड बनना',
      'दुनिया भर में ग्रेनाइट एक्सपोर्ट करना',
    ],
    correctIndex: 0,
    explanation:
      '"Our mission is to transform ordinary homes into wellness homes — spaces that keep you, your family, and the planet safe."',
    explanationHi:
      '"हमारा मिशन है साधारण घरों को वेलनेस होम्स में बदलना — ऐसी जगहें जो आपको, आपके परिवार और धरती को सुरक्षित रखें।"',
    source: '§1.1 Mission Statement',
  },
  {
    id: 'e15',
    level: 'easy',
    question: 'Where did Magppie start, and where does it operate now?',
    questionHi: 'Magppie ने कहाँ से शुरुआत की और अब कहाँ काम करती है?',
    options: [
      'Started in Delhi; now PAN India and in Florida, USA',
      'Started in Mumbai; India only',
      'Started in the USA; India only',
      'Started in Surat; South India only',
    ],
    optionsHi: [
      'दिल्ली से शुरू; अब पूरे भारत और फ्लोरिडा, USA में',
      'मुंबई से शुरू; सिर्फ भारत',
      'USA से शुरू; सिर्फ भारत',
      'सूरत से शुरू; सिर्फ दक्षिण भारत',
    ],
    correctIndex: 0,
    explanation:
      'Magppie started in Delhi and now provides services PAN India and internationally, with a store in Gainesville, Florida.',
    explanationHi:
      'Magppie ने दिल्ली से शुरुआत की और अब पूरे भारत में तथा इंटरनेशनली सेवा देती है, गेन्सविल, फ्लोरिडा में स्टोर के साथ।',
    source: '§5 Q35 / §9',
  },
  {
    id: 'e16',
    level: 'easy',
    question: 'What is the key phrase to remember about SilverStone?',
    questionHi: 'SilverStone के बारे में याद रखने वाली की-फ्रेज़ क्या है?',
    options: [
      '"It looks like a stone, but it does not behave like a regular stone."',
      '"Stronger than steel, cheaper than wood."',
      '"The world\'s only marble kitchen."',
      '"A stone that needs polishing every year."',
    ],
    optionsHi: [
      '"दिखता स्टोन जैसा है, पर आम स्टोन जैसा व्यवहार नहीं करता।"',
      '"स्टील से मज़बूत, लकड़ी से सस्ता।"',
      '"दुनिया की इकलौती मार्बल किचन।"',
      '"ऐसा स्टोन जिसे हर साल पॉलिश चाहिए।"',
    ],
    correctIndex: 0,
    explanation:
      'The signature line: "It looks like a stone, but it does not behave like a regular stone."',
    explanationHi:
      'सिग्नेचर लाइन: "यह दिखता स्टोन जैसा है, पर आम स्टोन जैसा व्यवहार नहीं करता।"',
    source: '§1.4 What is SilverStone?',
  },
]

/* ────────────────────────────────────────────────────────────────────────
 * MEDIUM — scripts, pacing, pricing mechanics, objection basics
 * ──────────────────────────────────────────────────────────────────────── */
const MEDIUM: QuizQuestion[] = [
  {
    id: 'm01',
    level: 'medium',
    question: 'The word "carcinogen" is forbidden. What is the approved replacement?',
    questionHi: '"carcinogen" शब्द मना है। अप्रूव्ड रिप्लेसमेंट क्या है?',
    options: [
      '"can be very harmful for your health … reports link it to cancer"',
      '"is a proven cancer-causing agent"',
      '"is toxic and carcinogenic"',
      '"causes cancer, per WHO"',
    ],
    optionsHi: [
      '"आपकी सेहत के लिए बहुत हानिकारक हो सकता है … रिपोर्ट्स इसे कैंसर से जोड़ती हैं"',
      '"यह प्रूवन कैंसर पैदा करने वाला तत्व है"',
      '"यह टॉक्सिक और कार्सिनोजेनिक है"',
      '"WHO के अनुसार यह कैंसर करता है"',
    ],
    correctIndex: 0,
    explanation:
      'Never say "carcinogen". Use the softened WHO framing: "can be very harmful for your health … reports link it to cancer".',
    explanationHi:
      '"carcinogen" कभी न कहें। सॉफ्ट WHO फ्रेमिंग इस्तेमाल करें: "आपकी सेहत के लिए बहुत हानिकारक हो सकता है … रिपोर्ट्स इसे कैंसर से जोड़ती हैं।"',
    source: '§2.4 Forbidden Words',
  },
  {
    id: 'm02',
    level: 'medium',
    question: 'How long should Pooja pause after "Do you have a couple of minutes to talk?"',
    questionHi: '"क्या आपके पास बात करने के लिए दो मिनट हैं?" के बाद पूजा को कितनी देर रुकना चाहिए?',
    options: ['1.5–2 seconds', 'No pause — keep momentum', '5 seconds', '0.5 seconds'],
    optionsHi: ['1.5–2 सेकंड', 'बिल्कुल न रुकें — मोमेंटम बनाए रखें', '5 सेकंड', '0.5 सेकंड'],
    correctIndex: 0,
    explanation:
      'A mandatory 1.5–2 second silence after the greeting question — a non-negotiable pacing rule from live-call feedback.',
    explanationHi:
      'ग्रीटिंग के सवाल के बाद अनिवार्य 1.5–2 सेकंड की चुप्पी — लाइव-कॉल फीडबैक से आया नॉन-नेगोशिएबल पेसिंग नियम।',
    source: '§2.2 Mandatory Pacing Rules',
  },
  {
    id: 'm03',
    level: 'medium',
    question: 'What is the maximum sentence length in the pacing rules?',
    questionHi: 'पेसिंग नियमों में एक वाक्य की अधिकतम लंबाई कितनी है?',
    options: ['15–18 words', '25–30 words', 'No limit', '8–10 words'],
    optionsHi: ['15–18 शब्द', '25–30 शब्द', 'कोई सीमा नहीं', '8–10 शब्द'],
    correctIndex: 0,
    explanation:
      'Break long sentences: max 15–18 words per sentence, one idea per breath.',
    explanationHi:
      'लंबे वाक्य तोड़ें: प्रति वाक्य अधिकतम 15–18 शब्द, एक सांस में एक ही विचार।',
    source: '§2.2 Mandatory Pacing Rules',
  },
  {
    id: 'm04',
    level: 'medium',
    question: 'What does the 30-day water test demonstrate?',
    questionHi: '30-दिन का वॉटर टेस्ट क्या दिखाता है?',
    options: [
      'Wood swelled and weakened; the stone stayed unchanged',
      'Both the wood and stone absorbed water equally',
      'The stone cracked after two weeks',
      'The wood stayed dry; the stone discoloured',
    ],
    optionsHi: [
      'लकड़ी फूल गई और कमज़ोर हो गई; स्टोन जैसा का तैसा रहा',
      'लकड़ी और स्टोन दोनों ने बराबर पानी सोखा',
      'स्टोन दो हफ्ते में चटक गया',
      'लकड़ी सूखी रही; स्टोन का रंग उड़ गया',
    ],
    correctIndex: 0,
    explanation:
      'After 30 days submerged, the wood swelled and weakened while the SilverStone stayed exactly the same — it does not absorb water.',
    explanationHi:
      '30 दिन पानी में डूबे रहने के बाद लकड़ी फूलकर कमज़ोर हो गई जबकि SilverStone बिल्कुल वैसा ही रहा — यह पानी नहीं सोखता।',
    source: '§1.5 Water Safe / §5 Q12',
  },
  {
    id: 'm05',
    level: 'medium',
    question: 'Per the Safety Pillars, how much load does each drawer support?',
    questionHi: 'सेफ्टी पिलर के अनुसार, हर ड्रॉअर कितना वज़न सह सकता है?',
    options: ['Up to 60 kg each', 'Up to 20 kg each', 'Up to 100 kg each', 'Up to 5 kg each'],
    optionsHi: ['हर एक 60 kg तक', 'हर एक 20 kg तक', 'हर एक 100 kg तक', 'हर एक 5 kg तक'],
    correctIndex: 0,
    explanation:
      'High Load Bearing pillar: drawers support up to 60 kg each. (Note: the hardware itself is rated over 100 kg — a different figure.)',
    explanationHi:
      'High Load Bearing पिलर: हर ड्रॉअर 60 kg तक सह सकता है। (ध्यान दें: हार्डवेयर खुद 100 kg से ज़्यादा रेटेड है — अलग आँकड़ा।)',
    source: '§1.5 High Load Bearing',
  },
  {
    id: 'm06',
    level: 'medium',
    question: 'How much more storage do Magppie kitchens offer versus standard kitchens?',
    questionHi: 'स्टैंडर्ड किचन के मुकाबले Magppie किचन कितना ज़्यादा स्टोरेज देती है?',
    options: ['Up to 62% more', 'Up to 25% more', 'Up to 100% more', 'About 10% more'],
    optionsHi: ['62% तक ज़्यादा', '25% तक ज़्यादा', '100% तक ज़्यादा', 'लगभग 10% ज़्यादा'],
    correctIndex: 0,
    explanation:
      'Up to 62% more storage than standard kitchens — with extra depth and height designed to fit large Indian plates.',
    explanationHi:
      'स्टैंडर्ड किचन से 62% तक ज़्यादा स्टोरेज — एक्स्ट्रा डेप्थ और हाइट के साथ, बड़ी भारतीय थालियों के लिए डिज़ाइन किया गया।',
    source: '§1.5 More Storage / §5 Q18',
  },
  {
    id: 'm07',
    level: 'medium',
    question: 'What are the standard payment terms?',
    questionHi: 'स्टैंडर्ड पेमेंट टर्म्स क्या हैं?',
    options: [
      '50% advance, 40% before dispatch, 10% after installation',
      '100% advance',
      '25% advance, 25% mid, 50% on completion',
      '50% advance, 50% after installation',
    ],
    optionsHi: [
      '50% एडवांस, 40% डिस्पैच से पहले, 10% इंस्टॉलेशन के बाद',
      '100% एडवांस',
      '25% एडवांस, 25% बीच में, 50% पूरा होने पर',
      '50% एडवांस, 50% इंस्टॉलेशन के बाद',
    ],
    correctIndex: 0,
    explanation: 'Standard schedule: 50% advance, 40% before dispatch, 10% after installation.',
    explanationHi: 'स्टैंडर्ड शेड्यूल: 50% एडवांस, 40% डिस्पैच से पहले, 10% इंस्टॉलेशन के बाद।',
    source: '§8 Payment Terms / §5 Q30',
  },
  {
    id: 'm08',
    level: 'medium',
    question:
      'In the "too expensive" objection, what are the material costs of compressed wood vs SilverStone?',
    questionHi: '"बहुत महँगा है" ऑब्जेक्शन में, कंप्रेस्ड वुड बनाम SilverStone की मटेरियल कॉस्ट क्या है?',
    options: [
      'Wood under Rs. 100/sq.ft.; SilverStone around Rs. 500/sq.ft.',
      'Both around Rs. 500/sq.ft.',
      'Wood Rs. 500/sq.ft.; SilverStone Rs. 100/sq.ft.',
      'Wood Rs. 250/sq.ft.; SilverStone Rs. 250/sq.ft.',
    ],
    optionsHi: [
      'वुड Rs. 100/वर्ग फुट से कम; SilverStone लगभग Rs. 500/वर्ग फुट',
      'दोनों लगभग Rs. 500/वर्ग फुट',
      'वुड Rs. 500/वर्ग फुट; SilverStone Rs. 100/वर्ग फुट',
      'वुड Rs. 250/वर्ग फुट; SilverStone Rs. 250/वर्ग फुट',
    ],
    correctIndex: 0,
    explanation:
      'Compressed wood costs under Rs. 100/sq.ft.; SilverStone costs around Rs. 500/sq.ft. just for the material — while the finished-kitchen prices are comparable.',
    explanationHi:
      'कंप्रेस्ड वुड की कीमत Rs. 100/वर्ग फुट से कम; SilverStone की सिर्फ मटेरियल कॉस्ट लगभग Rs. 500/वर्ग फुट — जबकि तैयार किचन की कीमतें तुलनीय हैं।',
    source: '§4 Objection: too expensive',
  },
  {
    id: 'm09',
    level: 'medium',
    question: 'What is the approved replacement for the phrase "yearly deep cleaning"?',
    questionHi: '"yearly deep cleaning" फ्रेज़ का अप्रूव्ड रिप्लेसमेंट क्या है?',
    options: [
      '"25 complimentary annual services"',
      '"annual maintenance contract"',
      '"free yearly servicing"',
      '"lifetime cleaning plan"',
    ],
    optionsHi: [
      '"25 कॉम्प्लिमेंट्री सालाना सर्विस"',
      '"सालाना मेंटेनेंस कॉन्ट्रैक्ट"',
      '"फ्री yearly सर्विसिंग"',
      '"लाइफटाइम क्लीनिंग प्लान"',
    ],
    correctIndex: 0,
    explanation:
      'Never say "yearly deep cleaning". The correct framing is "25 complimentary annual services".',
    explanationHi:
      '"yearly deep cleaning" कभी न कहें। सही फ्रेमिंग है "25 कॉम्प्लिमेंट्री सालाना सर्विस।"',
    source: '§2.4 Forbidden Words',
  },
  {
    id: 'm10',
    level: 'medium',
    question: 'A customer asks for a discount. What should the bot do?',
    questionHi: 'ग्राहक डिस्काउंट माँगता है। बॉट को क्या करना चाहिए?',
    options: [
      'Escalate to a human consultant — only humans can discuss exceptions',
      'Offer a 10% festive discount immediately',
      'Say Magppie never negotiates and end the call',
      'Ask the customer to name their price',
    ],
    optionsHi: [
      'ह्यूमन कंसल्टेंट को एस्केलेट करें — छूट सिर्फ इंसान तय कर सकते हैं',
      'तुरंत 10% फेस्टिव डिस्काउंट दें',
      'कहें Magppie कभी मोलभाव नहीं करती और कॉल खत्म करें',
      'ग्राहक से उनकी कीमत पूछें',
    ],
    correctIndex: 0,
    explanation:
      'A discount / "final price" request is an immediate escalation trigger — only humans discuss pricing exceptions. The bot holds the fixed-price policy.',
    explanationHi:
      'डिस्काउंट / "फाइनल प्राइस" की माँग तुरंत एस्केलेशन ट्रिगर है — कीमत के अपवाद सिर्फ इंसान डिस्कस करते हैं। बॉट फिक्स्ड-प्राइस पॉलिसी पर टिका रहता है।',
    source: '§7 Handoff Rules / §2.4',
  },
  {
    id: 'm11',
    level: 'medium',
    question: 'What is the starting price for a Wellness Wardrobe?',
    questionHi: 'Wellness Wardrobe की शुरुआती कीमत क्या है?',
    options: [
      'Rs. 7,320 per sq. ft.',
      'Rs. 8,400 per sq. ft.',
      'Rs. 5,000 per sq. ft.',
      'Rs. 10,800 per sq. ft.',
    ],
    optionsHi: [
      'Rs. 7,320 प्रति वर्ग फुट',
      'Rs. 8,400 प्रति वर्ग फुट',
      'Rs. 5,000 प्रति वर्ग फुट',
      'Rs. 10,800 प्रति वर्ग फुट',
    ],
    correctIndex: 0,
    explanation: 'Wellness Wardrobes start at Rs. 7,320 per square foot.',
    explanationHi: 'Wellness Wardrobe की शुरुआत Rs. 7,320 प्रति वर्ग फुट से होती है।',
    source: '§7 Pricing / §8',
  },
  {
    id: 'm12',
    level: 'medium',
    question: 'Where is the patented hardware manufactured, and what is its load capacity?',
    questionHi: 'पेटेंटेड हार्डवेयर कहाँ बनता है और इसकी लोड कैपेसिटी कितनी है?',
    options: [
      'Same European facilities as Blum and Grass; over 100 kg capacity',
      'In-house in Delhi; 60 kg capacity',
      'Same facilities as Hettich; 50 kg capacity',
      'In China; 200 kg capacity',
    ],
    optionsHi: [
      'Blum और Grass वाली यूरोपियन फैसिलिटीज़ में; 100 kg से ज़्यादा कैपेसिटी',
      'दिल्ली में इन-हाउस; 60 kg कैपेसिटी',
      'Hettich वाली फैसिलिटी में; 50 kg कैपेसिटी',
      'चीन में; 200 kg कैपेसिटी',
    ],
    correctIndex: 0,
    explanation:
      'The specialised patented hardware is made in the same European facilities as Blum and Grass, with a load-bearing capacity of over 100 kg.',
    explanationHi:
      'स्पेशलाइज़्ड पेटेंटेड हार्डवेयर उन्हीं यूरोपियन फैसिलिटीज़ में बनता है जहाँ Blum और Grass बनते हैं, और यह 100 kg से ज़्यादा लोड सह सकता है।',
    source: '§5 Q15',
  },
  {
    id: 'm13',
    level: 'medium',
    question: 'How long should you pause after mentioning formaldehyde / WHO?',
    questionHi: 'formaldehyde / WHO का ज़िक्र करने के बाद कितनी देर रुकना चाहिए?',
    options: ['1 second', 'No pause', '5 seconds', '3 seconds'],
    optionsHi: ['1 सेकंड', 'बिल्कुल न रुकें', '5 सेकंड', '3 सेकंड'],
    correctIndex: 0,
    explanation:
      'Add a 1-second pause after health facts (formaldehyde/WHO) — let the point land before continuing.',
    explanationHi:
      'हेल्थ फैक्ट्स (formaldehyde/WHO) के बाद 1 सेकंड रुकें — बात आगे बढ़ाने से पहले पॉइंट को जमने दें।',
    source: '§2.2 Mandatory Pacing Rules',
  },
  {
    id: 'm14',
    level: 'medium',
    question: 'How many celebrity/high-profile names should you use per call?',
    questionHi: 'एक कॉल में कितने सेलिब्रिटी/हाई-प्रोफाइल नाम इस्तेमाल करने चाहिए?',
    options: [
      '2–3 names max — never read the whole list',
      'All of them, to maximise credibility',
      'Exactly one, always Mukesh Ambani',
      'None — social proof is not allowed',
    ],
    optionsHi: [
      'अधिकतम 2–3 नाम — पूरी लिस्ट कभी न पढ़ें',
      'सभी, क्रेडिबिलिटी बढ़ाने के लिए',
      'सिर्फ एक, हमेशा मुकेश अंबानी',
      'कोई नहीं — सोशल प्रूफ मना है',
    ],
    correctIndex: 0,
    explanation:
      'Use 2–3 names maximum per call as social proof; do not read the entire celebrity list.',
    explanationHi:
      'सोशल प्रूफ के लिए प्रति कॉल अधिकतम 2–3 नाम इस्तेमाल करें; पूरी सेलिब्रिटी लिस्ट न पढ़ें।',
    source: '§1.7 Celebrity & High-Profile Trust',
  },
  {
    id: 'm15',
    level: 'medium',
    question:
      "A customer's city has no Magppie store. What should you offer, and what must you avoid saying?",
    questionHi: 'ग्राहक के शहर में कोई Magppie स्टोर नहीं है। क्या ऑफर करें और क्या कहने से बचें?',
    options: [
      'Offer sample delivery or a video call; never say "we have stores all across the country"',
      'Say a store is opening there next week',
      'Tell them Magppie does not service that city',
      'Claim there are stores everywhere in India',
    ],
    optionsHi: [
      'सैंपल डिलीवरी या वीडियो कॉल ऑफर करें; कभी न कहें "पूरे देश में हमारे स्टोर हैं"',
      'कहें अगले हफ्ते वहाँ स्टोर खुल रहा है',
      'कहें Magppie उस शहर में सेवा नहीं देती',
      'दावा करें भारत में हर जगह स्टोर हैं',
    ],
    correctIndex: 0,
    explanation:
      'Never claim "stores all across the country" without specifics. If the city is not listed, offer a sample delivery or a video call.',
    explanationHi:
      'बिना ठोस जानकारी के कभी "पूरे देश में स्टोर" न कहें। अगर शहर लिस्ट में नहीं है, तो सैंपल डिलीवरी या वीडियो कॉल ऑफर करें।',
    source: '§9 Store Directory',
  },
  {
    id: 'm16',
    level: 'medium',
    question: 'What is the warranty on hinges and channels?',
    questionHi: 'हिंज और चैनल पर क्या वारंटी है?',
    options: ['10 years, rust-resistant', '25 years, same as the stone', '2 years', 'No warranty on hardware'],
    optionsHi: ['10 साल, रस्ट-रेज़िस्टेंट', '25 साल, स्टोन जैसी', '2 साल', 'हार्डवेयर पर कोई वारंटी नहीं'],
    correctIndex: 0,
    explanation:
      'All hinges and channels are rust-resistant and carry a 10-year warranty.',
    explanationHi:
      'सभी हिंज और चैनल रस्ट-रेज़िस्टेंट हैं और उन पर 10 साल की वारंटी है।',
    source: '§5 Q16 / Q44',
  },
  {
    id: 'm17',
    level: 'medium',
    question: 'Does a Magppie kitchen need buffing or polishing?',
    questionHi: 'क्या Magppie किचन को बफिंग या पॉलिशिंग की ज़रूरत होती है?',
    options: [
      'No — it is maintenance-free; a damp cloth keeps it as good as new',
      'Yes — annual polishing is required',
      'Yes — buffing every 6 months',
      'Only the countertop needs polishing',
    ],
    optionsHi: [
      'नहीं — यह मेंटेनेंस-फ्री है; गीले कपड़े से नई जैसी बनी रहती है',
      'हाँ — सालाना पॉलिशिंग ज़रूरी है',
      'हाँ — हर 6 महीने बफिंग',
      'सिर्फ काउंटरटॉप को पॉलिश चाहिए',
    ],
    correctIndex: 0,
    explanation:
      'SilverStone is completely maintenance-free — no buffing or polishing. Simple wiping with a damp cloth keeps it looking new.',
    explanationHi:
      'SilverStone पूरी तरह मेंटेनेंस-फ्री है — कोई बफिंग या पॉलिशिंग नहीं। गीले कपड़े से पोंछना ही इसे नई जैसा रखता है।',
    source: '§5 Q14',
  },
  {
    id: 'm18',
    level: 'medium',
    question: 'The opening line (Stage 1) must include which phrase?',
    questionHi: 'ओपनिंग लाइन (स्टेज 1) में कौन-सा वाक्य शामिल होना चाहिए?',
    options: [
      '"Magppie Wellness Kitchens — we make kitchens entirely from stone."',
      '"We are the cheapest kitchen brand in India."',
      '"We sell premium plywood kitchens."',
      '"Would you like a discount today?"',
    ],
    optionsHi: [
      '"Magppie Wellness Kitchens — हम किचन पूरी तरह स्टोन से बनाते हैं।"',
      '"हम भारत का सबसे सस्ता किचन ब्रांड हैं।"',
      '"हम प्रीमियम प्लाईवुड किचन बेचते हैं।"',
      '"क्या आज आपको डिस्काउंट चाहिए?"',
    ],
    correctIndex: 0,
    explanation:
      'The opening must state the brand clearly: "Magppie Wellness Kitchens — we make kitchens entirely from stone." Never assume the customer heard the name.',
    explanationHi:
      'ओपनिंग में ब्रांड साफ बताएँ: "Magppie Wellness Kitchens — हम किचन पूरी तरह स्टोन से बनाते हैं।" कभी न मानें कि ग्राहक ने नाम सुन लिया।',
    source: '§2.5 Brand Name Pronunciation',
  },
]

/* ────────────────────────────────────────────────────────────────────────
 * HARD — scenario application, nuanced figures, edge FAQs, handoff detail
 * ──────────────────────────────────────────────────────────────────────── */
const HARD: QuizQuestion[] = [
  {
    id: 'h01',
    level: 'hard',
    question: 'What is the guarantee period on the lighting?',
    questionHi: 'लाइटिंग पर कितने साल की गारंटी है?',
    options: ['2 years', '10 years', '25 years', '5 years'],
    optionsHi: ['2 साल', '10 साल', '25 साल', '5 साल'],
    correctIndex: 0,
    explanation:
      'Guarantee tiers: 25 years on SilverStone cabinetry/countertops, 10 years on hardware and accessories, 2 years on lighting.',
    explanationHi:
      'गारंटी टियर: SilverStone कैबिनेटरी/काउंटरटॉप पर 25 साल, हार्डवेयर व एक्सेसरीज़ पर 10 साल, लाइटिंग पर 2 साल।',
    source: '§5 Q44 / §8',
  },
  {
    id: 'h02',
    level: 'hard',
    question: 'Are the in-built lights waterproof?',
    questionHi: 'क्या इन-बिल्ट लाइट्स वॉटरप्रूफ हैं?',
    options: [
      'No — but they are positioned so they are not exposed to water during cleaning',
      'Yes — fully waterproof to IP68',
      'Yes — but only the LED strips, not the drivers',
      'No — and they must be removed before washing',
    ],
    optionsHi: [
      'नहीं — पर इन्हें ऐसी जगह लगाया जाता है कि सफाई के दौरान पानी न लगे',
      'हाँ — IP68 तक पूरी तरह वॉटरप्रूफ',
      'हाँ — पर सिर्फ LED स्ट्रिप, ड्राइवर नहीं',
      'नहीं — और धोने से पहले हटानी पड़ती हैं',
    ],
    correctIndex: 0,
    explanation:
      'The in-built lights are NOT waterproof, but they are strategically positioned so they are not exposed to water during cleaning.',
    explanationHi:
      'इन-बिल्ट लाइट्स वॉटरप्रूफ नहीं हैं, पर इन्हें रणनीतिक रूप से ऐसी जगह लगाया जाता है कि सफाई के दौरान पानी न लगे।',
    source: '§5 Q12 / Q22',
  },
  {
    id: 'h03',
    level: 'hard',
    question: 'Which of these is NOT covered by the 25-year unconditional guarantee?',
    questionHi: '25-साल की अनकंडीशनल गारंटी में इनमें से क्या कवर नहीं होता?',
    options: ['Accidental damage', 'Termites', 'Warping and swelling', 'Discoloration'],
    optionsHi: ['एक्सिडेंटल डैमेज', 'दीमक', 'वॉर्पिंग और सूजन', 'रंग उड़ना (डिस्कलरेशन)'],
    correctIndex: 0,
    explanation:
      'The 25-year guarantee covers termites, water damage, discoloration, swelling, warping, and manufacturing defects. Accidental damage is chargeable — not covered.',
    explanationHi:
      '25-साल गारंटी में दीमक, वॉटर डैमेज, डिस्कलरेशन, सूजन, वॉर्पिंग और मैन्युफैक्चरिंग डिफेक्ट कवर होते हैं। एक्सिडेंटल डैमेज चार्जेबल है — कवर नहीं।',
    source: '§5 Q45 / §8',
  },
  {
    id: 'h04',
    level: 'hard',
    question: 'How is the kitchen cost calculated, and is depth included?',
    questionHi: 'किचन की कीमत कैसे कैलकुलेट होती है, और क्या डेप्थ शामिल है?',
    options: [
      'Per square foot of built-up area — yes, depth is included',
      'Per running foot — depth is charged separately',
      'Per cabinet unit — depth is not a factor',
      'Per square foot — but depth is excluded',
    ],
    optionsHi: [
      'बिल्ट-अप एरिया के प्रति वर्ग फुट — हाँ, डेप्थ शामिल है',
      'प्रति रनिंग फुट — डेप्थ अलग से चार्ज',
      'प्रति कैबिनेट यूनिट — डेप्थ मायने नहीं रखती',
      'प्रति वर्ग फुट — पर डेप्थ शामिल नहीं',
    ],
    correctIndex: 0,
    explanation:
      'Cost is per square foot of built-up area, and depth is included because storage depth, internal structure, and shutter thickness all affect material usage.',
    explanationHi:
      'कीमत बिल्ट-अप एरिया के प्रति वर्ग फुट होती है, और डेप्थ शामिल है क्योंकि स्टोरेज डेप्थ, इंटरनल स्ट्रक्चर और शटर थिकनेस सभी मटेरियल यूसेज पर असर डालते हैं।',
    source: '§5 Q26',
  },
  {
    id: 'h05',
    level: 'hard',
    question: 'A customer asks for sliding wardrobes. What is the correct guidance?',
    questionHi: 'ग्राहक स्लाइडिंग वॉर्डरोब माँगता है। सही सलाह क्या है?',
    options: [
      'Do not recommend them — recommend openable shutters instead',
      'Recommend them as the premium, most durable option',
      'Offer them only above Rs. 10,000/sq.ft.',
      'Say they are unavailable in India',
    ],
    optionsHi: [
      'इसकी सिफारिश न करें — इसके बजाय ओपनेबल शटर सुझाएँ',
      'इसे प्रीमियम, सबसे टिकाऊ ऑप्शन के रूप में सुझाएँ',
      'सिर्फ Rs. 10,000/वर्ग फुट से ऊपर ऑफर करें',
      'कहें भारत में उपलब्ध नहीं है',
    ],
    correctIndex: 0,
    explanation:
      'Sliding wardrobes are not recommended: tracks and rollers misalign, dust and moisture accumulate in slider gaps. Recommend openable shutters — safer, more durable, easier to operate.',
    explanationHi:
      'स्लाइडिंग वॉर्डरोब की सिफारिश नहीं: ट्रैक और रोलर मिसअलाइन होते हैं, स्लाइडर गैप में धूल-नमी जमती है। ओपनेबल शटर सुझाएँ — ज़्यादा सुरक्षित, टिकाऊ और आसान।',
    source: '§5 Q56',
  },
  {
    id: 'h06',
    level: 'hard',
    question: 'The drawer pillar cites 60 kg. What is the load-bearing capacity of the hardware itself?',
    questionHi: 'ड्रॉअर पिलर 60 kg बताता है। हार्डवेयर खुद कितना वज़न सह सकता है?',
    options: ['Over 100 kg', 'Exactly 60 kg', 'About 40 kg', 'Over 250 kg'],
    optionsHi: ['100 kg से ज़्यादा', 'ठीक 60 kg', 'लगभग 40 kg', '250 kg से ज़्यादा'],
    correctIndex: 0,
    explanation:
      'Two different figures: each drawer supports up to 60 kg (pillar), while the patented hardware is rated over 100 kg. Don\'t conflate them.',
    explanationHi:
      'दो अलग आँकड़े: हर ड्रॉअर 60 kg तक (पिलर) सहता है, जबकि पेटेंटेड हार्डवेयर 100 kg से ज़्यादा रेटेड है। इन्हें आपस में न मिलाएँ।',
    source: '§1.5 vs §5 Q15',
  },
  {
    id: 'h07',
    level: 'hard',
    question: 'In the call pricing stage, what does a 10×10 kitchen typically cost?',
    questionHi: 'कॉल प्राइसिंग स्टेज में, 10×10 किचन की सामान्य कीमत क्या होती है?',
    options: ['Rs. 12 to 15 lakhs', 'Rs. 5 to 8 lakhs', 'Rs. 20 to 25 lakhs', 'Exactly Rs. 10 lakhs'],
    optionsHi: ['Rs. 12 से 15 लाख', 'Rs. 5 से 8 लाख', 'Rs. 20 से 25 लाख', 'ठीक Rs. 10 लाख'],
    correctIndex: 0,
    explanation:
      'On calls and in the FAQ, a 10×10 kitchen typically costs Rs. 12 to 15 lakhs. (The Instagram template\'s "from Rs. 10 lakh" is a lead-in hook, not the call figure.)',
    explanationHi:
      'कॉल और FAQ में, 10×10 किचन की सामान्य कीमत Rs. 12 से 15 लाख होती है। (Instagram टेम्पलेट का "Rs. 10 लाख से" एक लीड-इन हुक है, कॉल का आँकड़ा नहीं।)',
    source: '§7 Pricing / §5 Q25',
  },
  {
    id: 'h08',
    level: 'hard',
    question: 'At KBIS 2026, Magppie placed alongside which global leaders?',
    questionHi: 'KBIS 2026 में Magppie किन ग्लोबल लीडर्स के साथ रही?',
    options: ['Caesarstone and LG', 'Samsung and Bosch', 'Kohler and Hettich', 'Ikea and Godrej'],
    optionsHi: ['Caesarstone और LG', 'Samsung और Bosch', 'Kohler और Hettich', 'Ikea और Godrej'],
    correctIndex: 0,
    explanation:
      'Magppie won the Most Unexpected Innovation award, placing alongside global leaders Caesarstone and LG as a top-three winner.',
    explanationHi:
      'Magppie ने Most Unexpected Innovation अवॉर्ड जीता, और टॉप-थ्री विनर के रूप में Caesarstone और LG जैसे ग्लोबल लीडर्स के साथ रही।',
    source: '§1.6 / §5 Q37',
  },
  {
    id: 'h09',
    level: 'hard',
    question: 'Who presented the KBIS 2026 award, and when?',
    questionHi: 'KBIS 2026 अवॉर्ड किसने और कब प्रज़ेंट किया?',
    options: [
      'Kishor Rico, Director of US Operations, on 17 February 2026',
      'The CEO, on 1 January 2026',
      'A KBIS official, in March 2026',
      'The Training Lead, in May 2026',
    ],
    optionsHi: [
      'किशोर रिको, डायरेक्टर ऑफ US ऑपरेशंस, 17 फरवरी 2026 को',
      'CEO ने, 1 जनवरी 2026 को',
      'एक KBIS अधिकारी ने, मार्च 2026 में',
      'ट्रेनिंग लीड ने, मई 2026 में',
    ],
    correctIndex: 0,
    explanation:
      'The award was presented by Kishor Rico, Director of US Operations, on February 17, 2026.',
    explanationHi:
      'अवॉर्ड किशोर रिको, डायरेक्टर ऑफ US ऑपरेशंस ने 17 फरवरी 2026 को प्रज़ेंट किया।',
    source: '§1.6 Awards & Recognition',
  },
  {
    id: 'h10',
    level: 'hard',
    question: "Where is Magppie's USA store located?",
    questionHi: 'Magppie का USA स्टोर कहाँ स्थित है?',
    options: ['Gainesville, Florida', 'Orlando, Florida', 'Dallas, Texas', 'Newark, New Jersey'],
    optionsHi: ['गेन्सविल, फ्लोरिडा', 'ऑरलैंडो, फ्लोरिडा', 'डलास, टेक्सास', 'न्यूअर्क, न्यू जर्सी'],
    correctIndex: 0,
    explanation:
      'The USA store is at 802 NW 5th Avenue, Suite 100, Gainesville, Florida. (KBIS was held in Orlando — a different city.)',
    explanationHi:
      'USA स्टोर 802 NW 5th Avenue, Suite 100, गेन्सविल, फ्लोरिडा में है। (KBIS ऑरलैंडो में हुआ था — अलग शहर।)',
    source: '§9 Store Directory',
  },
  {
    id: 'h11',
    level: 'hard',
    question: "Which items fall in the CUSTOMER's scope (not Magppie's)?",
    questionHi: 'इनमें से क्या ग्राहक के स्कोप में आता है (Magppie के नहीं)?',
    options: [
      'Electrical points, plumbing connections, civil changes, and appliances',
      'SilverStone cabinets and shutters',
      'Factory fabrication and transportation',
      'Soft-close hardware and internal shelves',
    ],
    optionsHi: [
      'इलेक्ट्रिकल पॉइंट, प्लंबिंग कनेक्शन, सिविल बदलाव और अप्लायंसेज़',
      'SilverStone कैबिनेट और शटर',
      'फैक्ट्री फैब्रिकेशन और ट्रांसपोर्टेशन',
      'सॉफ्ट-क्लोज़ हार्डवेयर और इंटरनल शेल्फ',
    ],
    correctIndex: 0,
    explanation:
      'Customer scope: electrical points per final drawings, plumbing connections, civil changes, and appliances. A scope matrix is shared before order confirmation.',
    explanationHi:
      'ग्राहक स्कोप: फाइनल ड्रॉइंग के अनुसार इलेक्ट्रिकल पॉइंट, प्लंबिंग कनेक्शन, सिविल बदलाव और अप्लायंसेज़। ऑर्डर कन्फर्मेशन से पहले स्कोप मैट्रिक्स शेयर किया जाता है।',
    source: '§5 Q29',
  },
  {
    id: 'h12',
    level: 'hard',
    question: 'When escalating to a human, what context summary must the warm transfer include?',
    questionHi: 'इंसान को एस्केलेट करते समय, वॉर्म ट्रांसफर में कौन-सी कॉन्टेक्स्ट समरी होनी चाहिए?',
    options: [
      'City, requirement, budget range, and objections raised',
      "Only the customer's phone number",
      'The full call transcript, verbatim',
      'Nothing — the human restarts discovery',
    ],
    optionsHi: [
      'शहर, ज़रूरत, बजट रेंज और उठाए गए ऑब्जेक्शन',
      'सिर्फ ग्राहक का फोन नंबर',
      'पूरा कॉल ट्रांसक्रिप्ट, शब्दशः',
      'कुछ नहीं — इंसान दोबारा डिस्कवरी शुरू करता है',
    ],
    correctIndex: 0,
    explanation:
      'A warm transfer passes a context summary: city, requirement, budget range, and objections raised — so the senior consultant continues seamlessly.',
    explanationHi:
      'वॉर्म ट्रांसफर में कॉन्टेक्स्ट समरी दी जाती है: शहर, ज़रूरत, बजट रेंज और उठाए गए ऑब्जेक्शन — ताकि सीनियर कंसल्टेंट बिना रुकावट आगे बढ़े।',
    source: '§7 Escalation Message Template',
  },
  {
    id: 'h13',
    level: 'hard',
    question: 'A customer threatens to take Magppie to consumer court. What do you do?',
    questionHi: 'ग्राहक Magppie को कंज़्यूमर कोर्ट ले जाने की धमकी देता है। आप क्या करेंगे?',
    options: [
      'Escalate to a human immediately — legal action is a hard trigger',
      'Reassure them and continue the pitch',
      'Offer a discount to calm them down',
      'Ask them to email the complaint and end the call',
    ],
    optionsHi: [
      'तुरंत इंसान को एस्केलेट करें — कानूनी कार्रवाई एक हार्ड ट्रिगर है',
      'उन्हें आश्वस्त करके पिच जारी रखें',
      'शांत करने के लिए डिस्काउंट दें',
      'उन्हें शिकायत ईमेल करने को कहें और कॉल खत्म करें',
    ],
    correctIndex: 0,
    explanation:
      'Any mention of legal action, consumer court, or a complaint is an immediate escalation trigger — hand off to a human wellness consultant.',
    explanationHi:
      'कानूनी कार्रवाई, कंज़्यूमर कोर्ट या शिकायत का कोई भी ज़िक्र तुरंत एस्केलेशन ट्रिगर है — इसे ह्यूमन वेलनेस कंसल्टेंट को सौंप दें।',
    source: '§7 When to Escalate Immediately',
  },
  {
    id: 'h14',
    level: 'hard',
    question:
      'A customer asks "Is this just artificial stone?" Which word must you avoid, and what do you say?',
    questionHi: 'ग्राहक पूछता है "क्या यह बस आर्टिफिशियल स्टोन है?" कौन-सा शब्द टालना है, और क्या कहना है?',
    options: [
      'Avoid "artificial stone" alone; say "engineered stone" or "our own patented stone"',
      'Agree it is artificial stone and move on',
      'Say it is 100% natural quarried stone',
      'Avoid the topic and change the subject',
    ],
    optionsHi: [
      '"artificial stone" अकेले न कहें; कहें "engineered stone" या "हमारा अपना पेटेंटेड स्टोन"',
      'मान लें यह आर्टिफिशियल स्टोन है और आगे बढ़ें',
      'कहें यह 100% नैचुरल खनन किया स्टोन है',
      'विषय टालकर बात बदल दें',
    ],
    correctIndex: 0,
    explanation:
      'Never say "artificial stone" on its own — the approved replacement is "engineered stone" or "our own patented stone".',
    explanationHi:
      '"artificial stone" अकेले कभी न कहें — अप्रूव्ड रिप्लेसमेंट है "engineered stone" या "हमारा अपना पेटेंटेड स्टोन।"',
    source: '§2.4 Forbidden Words / §5 Q4',
  },
  {
    id: 'h15',
    level: 'hard',
    question: 'How long should you pause before revealing any price?',
    questionHi: 'कोई भी कीमत बताने से पहले कितनी देर रुकना चाहिए?',
    options: ['1 second', 'No pause', '3 seconds', '10 seconds'],
    optionsHi: ['1 सेकंड', 'बिल्कुल न रुकें', '3 सेकंड', '10 सेकंड'],
    correctIndex: 0,
    explanation:
      'Add a 1-second pause before revealing any number — pricing lands better with a deliberate beat before it.',
    explanationHi:
      'कोई भी नंबर बताने से पहले 1 सेकंड रुकें — एक सोचे-समझे ठहराव के बाद कीमत बेहतर लैंड करती है।',
    source: '§2.2 Mandatory Pacing Rules',
  },
  {
    id: 'h16',
    level: 'hard',
    question: 'How often may the enthusiasm word "wonderful" be used per call?',
    questionHi: 'एक कॉल में एन्थुज़ियाज़्म वाला शब्द "wonderful" कितनी बार इस्तेमाल हो सकता है?',
    options: [
      'Once only — or replace it with great / amazing / fantastic',
      'As often as feels natural',
      'Exactly three times',
      'Never — it is fully forbidden',
    ],
    optionsHi: [
      'सिर्फ एक बार — या इसकी जगह great / amazing / fantastic',
      'जितना स्वाभाविक लगे उतनी बार',
      'ठीक तीन बार',
      'कभी नहीं — यह पूरी तरह मना है',
    ],
    correctIndex: 0,
    explanation:
      'A live call over-used "wonderful". Rule: use it once only per call, or swap in great / amazing / fantastic.',
    explanationHi:
      'एक लाइव कॉल में "wonderful" ज़्यादा इस्तेमाल हुआ। नियम: प्रति कॉल सिर्फ एक बार, या इसकी जगह great / amazing / fantastic।',
    source: '§2.4 / §10 Live Call Fixes',
  },
  {
    id: 'h17',
    level: 'hard',
    question: 'Two BDEs quote differently — one says "Rs. 9,380 per sq.ft." Why is that wrong?',
    questionHi: 'दो BDE अलग-अलग कोट करते हैं — एक कहता है "Rs. 9,380 प्रति वर्ग फुट।" यह गलत क्यों है?',
    options: [
      'Always quote the range Rs. 8,400–10,800; avoid a single precise number that clashes with the website',
      'Rs. 9,380 is too low and undercuts margin',
      'Prices must never be quoted on a call',
      'Wardrobes and kitchens share one flat price',
    ],
    optionsHi: [
      'हमेशा रेंज Rs. 8,400–10,800 कोट करें; वेबसाइट से टकराने वाला सिंगल सटीक नंबर न दें',
      'Rs. 9,380 बहुत कम है और मार्जिन घटाता है',
      'कॉल पर कीमत कभी नहीं बतानी चाहिए',
      'वॉर्डरोब और किचन की एक ही फ्लैट कीमत होती है',
    ],
    correctIndex: 0,
    explanation:
      'A live call said Rs. 9,380 while the website said Rs. 8,400. The fix: use the range approach — Rs. 8,400–10,800/sq.ft. depending on finish.',
    explanationHi:
      'एक लाइव कॉल में Rs. 9,380 कहा गया जबकि वेबसाइट पर Rs. 8,400 था। फिक्स: रेंज अप्रोच इस्तेमाल करें — फिनिश के अनुसार Rs. 8,400–10,800/वर्ग फुट।',
    source: '§10 Live Call Fixes',
  },
  {
    id: 'h18',
    level: 'hard',
    question:
      'A customer asks whether Magppie has done projects in their specific (non-store) city. Best response?',
    questionHi: 'ग्राहक पूछता है कि क्या Magppie ने उनके खास (नॉन-स्टोर) शहर में प्रोजेक्ट किए हैं। सबसे अच्छा जवाब?',
    options: [
      '"I can check with our team and let you know" — and offer a sample or video call',
      '"Yes, hundreds — in your exact neighbourhood."',
      '"No, we have never worked there."',
      '"We only work in cities with a store."',
    ],
    optionsHi: [
      '"मैं अपनी टीम से पता करके आपको बताती हूँ" — और सैंपल या वीडियो कॉल ऑफर करें',
      '"हाँ, सैकड़ों — बिल्कुल आपके इलाके में।"',
      '"नहीं, हमने वहाँ कभी काम नहीं किया।"',
      '"हम सिर्फ उन्हीं शहरों में काम करते हैं जहाँ स्टोर है।"',
    ],
    correctIndex: 0,
    explanation:
      'For a specific city you can\'t confirm, say "I can check with our team and let you know" (never invent installations), and offer a sample delivery or video call.',
    explanationHi:
      'जिस खास शहर की पुष्टि न कर सकें, वहाँ कहें "मैं टीम से पता करके बताती हूँ" (कभी झूठे इंस्टॉलेशन न गढ़ें), और सैंपल डिलीवरी या वीडियो कॉल ऑफर करें।',
    source: '§5 Q62 / §9',
  },
  {
    id: 'h19',
    level: 'hard',
    question:
      'A customer asks "Why not just use granite?" Which point is TRUE for SilverStone but NOT for granite?',
    questionHi: 'ग्राहक पूछता है "ग्रेनाइट क्यों नहीं?" कौन-सी बात SilverStone के लिए सही है पर ग्रेनाइट के लिए नहीं?',
    options: [
      'It is non-porous and anti-bacterial / anti-viral',
      'It is mined from the earth',
      'It needs periodic polishing',
      'It absorbs stains and harbours bacteria',
    ],
    optionsHi: [
      'यह नॉन-पोरस और एंटी-बैक्टीरियल / एंटी-वायरल है',
      'यह धरती से खनन किया जाता है',
      'इसे समय-समय पर पॉलिशिंग चाहिए',
      'यह दाग सोखता है और बैक्टीरिया पनपाता है',
    ],
    correctIndex: 0,
    explanation:
      'Granite is porous, absorbs stains/bacteria, and needs polishing. SilverStone is non-porous, anti-bacterial and anti-viral, and requires zero maintenance.',
    explanationHi:
      'ग्रेनाइट पोरस है, दाग/बैक्टीरिया सोखता है और पॉलिशिंग चाहता है। SilverStone नॉन-पोरस, एंटी-बैक्टीरियल व एंटी-वायरल है और ज़ीरो मेंटेनेंस चाहता है।',
    source: '§4 / §5 Q51',
  },
  {
    id: 'h20',
    level: 'hard',
    question: "Compared with tiles, what is SilverStone's key hygiene advantage?",
    questionHi: 'टाइल्स के मुकाबले SilverStone का मुख्य हाइजीन फायदा क्या है?',
    options: [
      'No grout lines — so no accumulation of dirt, grease, or fungus',
      'It is cheaper per square foot than tiles',
      'It can be installed over existing tiles',
      'It comes in more colours than tiles',
    ],
    optionsHi: [
      'कोई ग्राउट लाइन नहीं — इसलिए धूल, ग्रीस या फंगस नहीं जमते',
      'यह टाइल्स से प्रति वर्ग फुट सस्ता है',
      'इसे मौजूदा टाइल्स के ऊपर लगाया जा सकता है',
      'इसमें टाइल्स से ज़्यादा रंग मिलते हैं',
    ],
    correctIndex: 0,
    explanation:
      'Unlike tiles, SilverStone has no grout lines, so there is no accumulation of dirt, grease, or fungus; mould and fungus cannot grow on it.',
    explanationHi:
      'टाइल्स के उलट, SilverStone में कोई ग्राउट लाइन नहीं होती, इसलिए धूल, ग्रीस या फंगस नहीं जमते; इस पर मोल्ड और फंगस नहीं पनप सकते।',
    source: '§5 Q3',
  },
  {
    id: 'h21',
    level: 'hard',
    question: 'In the impact-safety test, what object was dropped on the surface?',
    questionHi: 'इम्पैक्ट-सेफ्टी टेस्ट में सतह पर क्या गिराया गया था?',
    options: ['A heavy ceramic jar', 'A steel hammer', 'A concrete block', 'A glass bottle'],
    optionsHi: ['एक भारी सिरेमिक जार', 'एक स्टील हथौड़ा', 'एक कंक्रीट ब्लॉक', 'एक काँच की बोतल'],
    correctIndex: 0,
    explanation:
      'Impact Safe pillar: a heavy ceramic jar was dropped on the surface and the stone stayed intact — stronger than granite.',
    explanationHi:
      'Impact Safe पिलर: सतह पर एक भारी सिरेमिक जार गिराया गया और स्टोन सही-सलामत रहा — ग्रेनाइट से मज़बूत।',
    source: '§1.5 Impact Safe / §5 Q7',
  },
  {
    id: 'h22',
    level: 'hard',
    question: 'Which of these is NOT one of the immediate escalation triggers?',
    questionHi: 'इनमें से क्या तुरंत एस्केलेशन ट्रिगर नहीं है?',
    options: [
      'The customer simply asks for the price',
      'The customer asks about dealership / B2B bulk orders',
      'The customer asks about refund policy or cancellation',
      'The customer is abusive after two objection-handling attempts',
    ],
    optionsHi: [
      'ग्राहक बस कीमत पूछता है',
      'ग्राहक डीलरशिप / B2B बल्क ऑर्डर पूछता है',
      'ग्राहक रिफंड पॉलिसी या कैंसलेशन पूछता है',
      'दो ऑब्जेक्शन-हैंडलिंग प्रयासों के बाद ग्राहक अपमानजनक है',
    ],
    correctIndex: 0,
    explanation:
      'Asking for the price is normal and handled in the pitch. Escalate for: discount/final price, legal/complaint, custom dimensions, abuse after 2 attempts, dealership/B2B, refund/cancellation, complex CAD layouts, or unanswered questions after 2 attempts.',
    explanationHi:
      'कीमत पूछना सामान्य है और पिच में हैंडल होता है। एस्केलेट करें: डिस्काउंट/फाइनल प्राइस, कानूनी/शिकायत, कस्टम डाइमेंशन, 2 प्रयासों के बाद अपमान, डीलरशिप/B2B, रिफंड/कैंसलेशन, कॉम्प्लेक्स CAD लेआउट, या 2 प्रयासों के बाद अनुत्तरित सवाल।',
    source: '§7 When to Escalate Immediately',
  },
  {
    id: 'h23',
    level: 'hard',
    question: 'How long does the full process take, from final order to installation?',
    questionHi: 'फाइनल ऑर्डर से इंस्टॉलेशन तक पूरी प्रक्रिया में कितना समय लगता है?',
    options: ['3 to 4 months', '2 to 3 weeks', '6 to 8 months', '1 month flat'],
    optionsHi: ['3 से 4 महीने', '2 से 3 हफ्ते', '6 से 8 महीने', 'सिर्फ 1 महीना'],
    correctIndex: 0,
    explanation:
      'The complete process — final order to installation — takes around 3 to 4 months, depending on site conditions and design complexity.',
    explanationHi:
      'पूरी प्रक्रिया — फाइनल ऑर्डर से इंस्टॉलेशन तक — साइट कंडीशन और डिज़ाइन कॉम्प्लेक्सिटी के अनुसार लगभग 3 से 4 महीने लेती है।',
    source: '§5 Q38',
  },
  {
    id: 'h24',
    level: 'hard',
    question: 'Beyond the silver/copper infusion, how is SilverStone described as being made?',
    questionHi: 'सिल्वर/कॉपर इन्फ्यूज़न के अलावा, SilverStone कैसे बनता है?',
    options: [
      'Porcelain clay baked at ~1,300°C with about 60 other particles',
      'Crushed granite mixed with epoxy resin',
      'Recycled plastic pressed into sheets',
      'Cement poured into moulds and cured',
    ],
    optionsHi: [
      'पोर्सिलेन क्ले को ~1,300°C पर लगभग 60 अन्य पार्टिकल के साथ पकाकर',
      'क्रश्ड ग्रेनाइट को एपॉक्सी रेज़िन में मिलाकर',
      'रीसायकल्ड प्लास्टिक को शीट में दबाकर',
      'सीमेंट को साँचों में डालकर सुखाकर',
    ],
    correctIndex: 0,
    explanation:
      'The stone is porcelain clay heated to ~1,300°C with about 60 other particles, then infused with silver and copper nano-particles — making it bacteria-proof and food-grade.',
    explanationHi:
      'स्टोन पोर्सिलेन क्ले है जिसे ~1,300°C पर लगभग 60 अन्य पार्टिकल के साथ गर्म किया जाता है, फिर सिल्वर व कॉपर नैनो-पार्टिकल मिलाए जाते हैं — जिससे यह बैक्टीरिया-प्रूफ और फूड-ग्रेड बनता है।',
    source: '§5 Q5',
  },
]

export const QUIZ_BANK: Record<QuizLevel, QuizQuestion[]> = {
  easy: EASY,
  medium: MEDIUM,
  hard: HARD,
}

export const ALL_QUESTIONS: QuizQuestion[] = [...EASY, ...MEDIUM, ...HARD]

/* ────────────────────────────────────────────────────────────────────────
 * Monthly rotation
 * ──────────────────────────────────────────────────────────────────────── */

export const MONTH_NAMES: Record<Language, string[]> = {
  en: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
  hi: [
    'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
    'जुलाई', 'अगस्त', 'सितंबर', 'अक्तूबर', 'नवंबर', 'दिसंबर',
  ],
}

/** Stable id for a month, e.g. "2026-07". */
export function getMonthId(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/** Monotonic integer that increments once per calendar month (rotation seed). */
export function getMonthIndex(date: Date = new Date()): number {
  return date.getFullYear() * 12 + date.getMonth()
}

/** Localised label for a month, e.g. "July 2026" / "जुलाई 2026". */
export function getMonthLabel(date: Date = new Date(), lang: Language = 'en'): string {
  return `${MONTH_NAMES[lang][date.getMonth()]} ${date.getFullYear()}`
}

function pick<T>(arr: T[], count: number, offset: number): T[] {
  const out: T[] = []
  const n = arr.length
  if (n === 0) return out
  for (let i = 0; i < Math.min(count, n); i++) {
    out.push(arr[(((offset + i) % n) + n) % n])
  }
  return out
}

/**
 * The deterministic set of questions for a given month, per level. The same
 * `monthIndex` always yields the same set, and consecutive months rotate
 * forward through the bank so the full bank is covered over time.
 */
export function getMonthlySet(
  monthIndex: number = getMonthIndex(),
): Record<QuizLevel, QuizQuestion[]> {
  return {
    easy: pick(EASY, MONTHLY_COUNTS.easy, monthIndex * MONTHLY_COUNTS.easy),
    medium: pick(MEDIUM, MONTHLY_COUNTS.medium, monthIndex * MONTHLY_COUNTS.medium),
    hard: pick(HARD, MONTHLY_COUNTS.hard, monthIndex * MONTHLY_COUNTS.hard),
  }
}

/** Flat, ordered (easy → medium → hard) list for the monthly Full Challenge. */
export function getMonthlyChallenge(monthIndex: number = getMonthIndex()): QuizQuestion[] {
  const set = getMonthlySet(monthIndex)
  return [...set.easy, ...set.medium, ...set.hard]
}

/** Max attainable score for a list of questions. */
export function maxScoreFor(questions: QuizQuestion[]): number {
  return questions.reduce((sum, q) => sum + LEVEL_POINTS[q.level], 0)
}

/* ────────────────────────────────────────────────────────────────────────
 * UI strings (chrome) — bilingual
 * ──────────────────────────────────────────────────────────────────────── */

export interface UiStrings {
  monthlyChallenge: string
  title: string
  subtitle: string
  questions: string
  levels: string
  perQuestion: string
  autoSkip: string
  bestThisMonth: string
  monthStreak: string
  accuracy: string
  completed: (score: number, max: number) => string
  recommended: string
  fullChallenge: string
  fullDesc: (n: number) => string
  pointsOnOffer: string
  start: string
  retake: string
  leaderboard: string
  loading: string
  you: string
  rulesEyebrow: string
  rulesTitle: string
  rulesSubtitle: string
  rulesQuestionsDetail: string
  rulesLevelsDetail: string
  rulesTimerDetail: string
  rulesAutoSkipDetail: string
  rulesLockTitle: string
  rulesLockDetail: string
  rulesScoringTitle: string
  rulesScoringDetail: string
  beginQuiz: string
  back: string
  questionOf: (a: number, b: number) => string
  pressKeys: (n: number) => string
  selectThenSubmit: string
  submit: string
  next: string
  seeResults: string
  timesUp: string
  correct: string
  notQuite: string
  source: string
  enterToSubmit: string
  enterForNext: string
  movingOn: string
  points: string
  of: (m: number) => string
  correctLabel: string
  accuracyShort: string
  avgTime: string
  timedOut: string
  review: string
  skippedTimedOut: string
  correctAnswer: string
  backToOverview: string
  verdict: (pct: number) => { title: string; note: string }
}

export const UI: Record<Language, UiStrings> = {
  en: {
    monthlyChallenge: 'Monthly Challenge',
    title: 'BDE Knowledge Quiz',
    subtitle:
      'A fresh set of questions every month, drawn straight from the Magppie AI Bot Master Training Document. Sharpen your command of the script across Easy, Medium, and Hard.',
    questions: 'questions',
    levels: '3 difficulty levels',
    perQuestion: `${QUESTION_SECONDS}s per question`,
    autoSkip: 'Auto-skips if unanswered',
    bestThisMonth: 'Best this month',
    monthStreak: 'Month streak',
    accuracy: 'Accuracy',
    completed: (s, m) =>
      `You've completed this month's Full Challenge — best score ${s}/${m}. Retake it any time to beat your record.`,
    recommended: 'Recommended · counts toward the leaderboard',
    fullChallenge: 'Full Monthly Challenge',
    fullDesc: (n) =>
      `All ${n} questions, timed. One deliberate run to test how well you know the pitch, the objections, and the numbers.`,
    pointsOnOffer: 'points on offer',
    start: 'Start',
    retake: 'Retake',
    leaderboard: "This month's BDE leaderboard",
    loading: 'Loading standings…',
    you: 'you',
    rulesEyebrow: 'Before you start',
    rulesTitle: 'Quick rules',
    rulesSubtitle: 'Read once, then dive in — the timer starts the moment question one appears.',
    rulesQuestionsDetail: 'One deliberate run through the full monthly set, no pausing.',
    rulesLevelsDetail: 'Easy, Medium, and Hard questions are mixed together — points scale with difficulty.',
    rulesTimerDetail: 'Each question auto-advances when the clock runs out, marked as skipped.',
    rulesAutoSkipDetail: 'An unanswered question counts as incorrect for scoring.',
    rulesLockTitle: 'Answers lock on submit',
    rulesLockDetail: "Once you submit a choice you can't change it — review it in your results instead.",
    rulesScoringTitle: 'Best score counts',
    rulesScoringDetail: 'Retake as many times as you like — only your best attempt each month counts toward the leaderboard.',
    beginQuiz: 'Begin quiz',
    back: 'Back',
    questionOf: (a, b) => `Question ${a} of ${b}`,
    pressKeys: (n) => `Press A–${String.fromCharCode(64 + n)} or 1–${n}`,
    selectThenSubmit: 'Select an option, then Submit',
    submit: 'Submit answer',
    next: 'Next question',
    seeResults: 'See results',
    timesUp: "Time's up — skipped",
    correct: 'Correct',
    notQuite: 'Not quite',
    source: 'Source',
    enterToSubmit: 'Enter to submit',
    enterForNext: 'Enter for next',
    movingOn: 'Moving on automatically…',
    points: 'Points',
    of: (m) => `of ${m}`,
    correctLabel: 'Correct',
    accuracyShort: 'Accuracy',
    avgTime: 'Avg time',
    timedOut: 'timed out',
    review: 'Review',
    skippedTimedOut: 'skipped (timed out)',
    correctAnswer: 'Correct answer:',
    backToOverview: 'Back to overview',
    verdict: (pct) =>
      pct >= 90
        ? { title: 'Outstanding.', note: 'You know the script cold — ready for live calls.' }
        : pct >= 70
          ? { title: 'Solid work.', note: 'A strong grip. Polish the misses below.' }
          : pct >= 50
            ? { title: 'Getting there.', note: 'Review the explanations, then retake to level up.' }
            : { title: 'Keep training.', note: 'Revisit the training doc and try again this month.' },
  },
  hi: {
    monthlyChallenge: 'मासिक चुनौती',
    title: 'BDE नॉलेज क्विज़',
    subtitle:
      'हर महीने नए सवालों का सेट, सीधे Magppie AI Bot मास्टर ट्रेनिंग डॉक्यूमेंट से। आसान, मध्यम और कठिन — तीनों स्तरों पर स्क्रिप्ट पर अपनी पकड़ मज़बूत करें।',
    questions: 'सवाल',
    levels: '3 कठिनाई स्तर',
    perQuestion: `${QUESTION_SECONDS} सेकंड प्रति सवाल`,
    autoSkip: 'जवाब न देने पर अपने-आप स्किप',
    bestThisMonth: 'इस महीने का बेस्ट',
    monthStreak: 'महीना स्ट्रीक',
    accuracy: 'सटीकता',
    completed: (s, m) =>
      `आपने इस महीने की फुल चैलेंज पूरी कर ली है — बेस्ट स्कोर ${s}/${m}। अपना रिकॉर्ड तोड़ने के लिए कभी भी दोबारा खेलें।`,
    recommended: 'सुझाया गया · लीडरबोर्ड में गिना जाता है',
    fullChallenge: 'फुल मासिक चैलेंज',
    fullDesc: (n) =>
      `सभी ${n} सवाल, समय के साथ। एक सोचा-समझा राउंड — जाँचें कि आप पिच, ऑब्जेक्शन और आँकड़े कितने अच्छे से जानते हैं।`,
    pointsOnOffer: 'पॉइंट दांव पर',
    start: 'शुरू करें',
    retake: 'दोबारा',
    leaderboard: 'इस महीने का BDE लीडरबोर्ड',
    loading: 'रैंकिंग लोड हो रही है…',
    you: 'आप',
    rulesEyebrow: 'शुरू करने से पहले',
    rulesTitle: 'ज़रूरी नियम',
    rulesSubtitle: 'एक बार पढ़ लें, फिर शुरू करें — पहला सवाल दिखते ही टाइमर चालू हो जाता है।',
    rulesQuestionsDetail: 'इस महीने के पूरे सेट का एक सोचा-समझा राउंड, बिना रुके।',
    rulesLevelsDetail: 'आसान, मध्यम और कठिन सवाल मिले-जुले आते हैं — पॉइंट कठिनाई के हिसाब से मिलते हैं।',
    rulesTimerDetail: 'समय खत्म होने पर सवाल अपने-आप आगे बढ़ जाता है और स्किप माना जाता है।',
    rulesAutoSkipDetail: 'बिना जवाब वाला सवाल स्कोरिंग में गलत माना जाता है।',
    rulesLockTitle: 'सबमिट करते ही जवाब लॉक',
    rulesLockDetail: 'एक बार जवाब सबमिट करने के बाद उसे बदला नहीं जा सकता — नतीजों में उसकी समीक्षा करें।',
    rulesScoringTitle: 'बेस्ट स्कोर मायने रखता है',
    rulesScoringDetail: 'जितनी बार चाहें दोबारा खेलें — हर महीने सिर्फ आपका बेस्ट स्कोर लीडरबोर्ड में गिना जाता है।',
    beginQuiz: 'क्विज़ शुरू करें',
    back: 'वापस',
    questionOf: (a, b) => `सवाल ${a} / ${b}`,
    pressKeys: (n) => `A–${String.fromCharCode(64 + n)} या 1–${n} दबाएँ`,
    selectThenSubmit: 'एक ऑप्शन चुनें, फिर सबमिट करें',
    submit: 'जवाब सबमिट करें',
    next: 'अगला सवाल',
    seeResults: 'नतीजे देखें',
    timesUp: 'समय समाप्त — स्किप',
    correct: 'सही',
    notQuite: 'बिल्कुल सही नहीं',
    source: 'स्रोत',
    enterToSubmit: 'सबमिट के लिए Enter',
    enterForNext: 'अगले के लिए Enter',
    movingOn: 'अपने-आप आगे बढ़ रहे हैं…',
    points: 'पॉइंट',
    of: (m) => `/ ${m}`,
    correctLabel: 'सही',
    accuracyShort: 'सटीकता',
    avgTime: 'औसत समय',
    timedOut: 'समय समाप्त',
    review: 'समीक्षा',
    skippedTimedOut: 'स्किप (समय समाप्त)',
    correctAnswer: 'सही जवाब:',
    backToOverview: 'ओवरव्यू पर वापस',
    verdict: (pct) =>
      pct >= 90
        ? { title: 'शानदार।', note: 'आपको स्क्रिप्ट पूरी तरह याद है — लाइव कॉल के लिए तैयार।' }
        : pct >= 70
          ? { title: 'अच्छा काम।', note: 'मज़बूत पकड़। नीचे दी गई गलतियाँ सुधारें।' }
          : pct >= 50
            ? { title: 'बस थोड़ा और।', note: 'एक्सप्लेनेशन पढ़ें, फिर दोबारा खेलकर बेहतर बनें।' }
            : { title: 'अभ्यास जारी रखें।', note: 'ट्रेनिंग डॉक्यूमेंट दोबारा देखें और इस महीने फिर कोशिश करें।' },
  },
}
