# Scoring Methodology

**Deliverable 8 of 12.** Implementation: `src/lib/call-intelligence/scoring.ts`.
Weight tables are exported so the UI renders them from the same constants the
maths uses — the documentation cannot drift from the code.

## Three independent scores

They are never blended, never averaged together, and never used as proxies for
one another.

| Score | Answers | Range | About |
|---|---|---|---|
| Customer Sentiment | How did the customer feel? | 0–100 | The customer |
| Purchase Readiness | How ready is this customer to buy? | 0–100 | The opportunity |
| Agent Quality | How well was the conversation run? | 0–100 | The employee |

**A negative customer is not evidence of a poor agent.** A service call about a
genuine defect can carry sentiment 18 and quality 88 simultaneously, and the
dashboard must show both without implying a relationship.

---

## 1. Customer Sentiment Score

**Text-based.** Computed from transcript words on customer turns only. No audio
feature is analysed. The UI labels it "text-based sentiment" everywhere and
must never call it tone, voice or emotion detection.

```
score  = ((meanTurnSentiment + 1) ÷ 2) × 100
opening = first third of customer turns
middle  = middle third
closing = last third
shift   = closingScore − openingScore
```

| Output | Definition |
|---|---|
| Opening score | Sentiment at the start |
| Closing score | Sentiment at the end |
| Overall score | Across all customer turns |
| Shift | closing − opening |
| Band | ≥ 60 positive · 40–59 neutral · < 40 negative |
| Improved | shift ≥ +5 |
| Deteriorated | shift ≤ −5 |

Employee sentiment uses the identical method over agent turns and is stored in
a separate field.

**Limitation to state on screen:** sarcasm, cultural politeness conventions and
code-switching are known weaknesses of transcript-only sentiment. Treat a
single call's score as a signal, a segment's mean as a measure.

---

## 2. Purchase Readiness Score

> **This is a Purchase Readiness Score, not a conversion probability.** It has
> **not** been back-tested against historical CRM conversions. `scoring.ts`
> exports `PURCHASE_READINESS_VALIDATION.validatedAgainstConversions = false`,
> and the UI must surface that statement wherever the score appears.
> Once ≥ 2 quarters of matched call→order outcomes exist, run calibration and
> replace the statement with the measured lift.

| Component | Weight | What earns points |
|---|---|---|
| Need and product fit | **25%** | A stated need mapped to a product we sell |
| Explicit buying intent | **20%** | Explicit words. Politeness is not intent |
| Purchase timeline | **15%** | A stated timeframe; "not mentioned" scores 0 |
| Next-step commitment | **15%** | A concrete agreed next step, not "I'll think about it" |
| Decision-making authority | **10%** | Sole / joint / not the decision maker |
| Budget readiness | **10%** | A figure or band actually spoken |
| Sentiment | **5%** | Deliberately the smallest weight — a warm call is not a sale |

```
readiness = Σ (component × weight)          weights sum to 1.00 (asserted)
band      = ≥ 70 high · 40–69 medium · < 40 low
```

**Design note on the 5% sentiment weight.** This is the anti-politeness
safeguard. The demo corpus contains a deliberate test case — a warm, courteous
enquiry with no need, timeline or budget. It scores high on sentiment and low
on readiness, which is the correct answer.

**"Not mentioned" scores 0, not the average.** Imputing a mean for a missing
budget would manufacture pipeline that does not exist.

---

## 3. Agent Quality Score

| Bucket | Weight | Measured parameters |
|---|---|---|
| Discovery & need identification | **20%** | discoveryQuestions, needIdentification |
| Solution relevance | **15%** | solutionRelevance |
| Product & FAQ handling | **15%** | productKnowledge, answerRelevance, answerAccuracy |
| Objection handling | **15%** | objectionHandling |
| Next-step clarity | **15%** | nextStepClarity |
| Listening behaviour | **10%** | activeListening |
| Opening & introduction | **5%** | openingIntroduction, permissionToContinue |
| Professionalism & empathy | **5%** | professionalism, empathy, communicationClarity |

Multi-parameter buckets average their members, then the bucket weight applies.

### Unmeasurable parameters are re-normalised, not zeroed

If `answerAccuracy` is `null` (no approved KB article), that member is dropped
and the remaining weights are re-normalised:

```
score = Σ(measurable bucket × weight) ÷ Σ(measurable weights)
```

An agent is never penalised for a parameter the business cannot yet measure.
The UI shows the note: *"One or more parameters were not measurable on this
call. Weights were re-normalised."*

### Critical compliance failures are NEVER inside the score

```ts
{ score: 91.4, criticalFailures: ['Unapproved discount offered'], hasCriticalFailure: true }
```

Four flags are critical: unapproved discount, mis-selling / false commitment,
sensitive-data exposure, unescalated legal threat. They are returned alongside
the score and rendered as a separate red banner. A 91 with a mis-selling flag
must never read as a good call. Validation asserts that critical-failure calls
still return a positive score *and* a populated `criticalFailures` array — i.e.
the failure is visible, not silently subtracted.

### Diarisation-gated parameters

Talk-to-listen ratio, interruptions, longest silence and speaking time are only
computed when `dynamics.reliable === true` (diarisation confidence ≥ 0.75 and
> 2 turns). In the demo corpus this suppresses them on 113 of 420 calls, where
the UI shows "Not measurable — diarisation confidence too low" rather than 0.

Listening behaviour scores highest near a 45% agent talk share and falls away
symmetrically in both directions — talking too little is also a failure.

### Coaching output

Buckets below 65 are returned as ranked coaching points with a specific
behavioural recommendation. Coaching targets **behaviour**, never outcome:
"ask two open discovery questions before proposing a product", not "convert
more".

---

## Prohibited scoring inputs

Enforced as a documented constant (`PROHIBITED_SCORING_ATTRIBUTES`) and by the
extraction prompt:

- Accent or pronunciation
- Gender
- Community, religion or caste
- Regional or mother-tongue origin
- Age
- Customer name

Language is used **only** to route the correct STT model and to report coverage
— never as a scoring input, and never to infer geography.

---

## Score → decision mapping

| Signal | Threshold | Action |
|---|---|---|
| Readiness ≥ 70 with no next step | — | High-intent-no-follow-up alert |
| Closing sentiment ≤ 25 | severe | Manager call-back same day |
| Quality bucket < 65 | coaching | Added to the coaching queue |
| Any critical compliance flag | critical | Separate escalation, manual review |
| Segment n < 20 | low sample | Shown, but labelled "not a trend" |
