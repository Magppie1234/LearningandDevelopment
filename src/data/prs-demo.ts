import { computePrs, prsBand, prsComponentPoints, type PrsBreakdown } from '@/lib/prs'

/**
 * Demo-mode PRS attainment for the signed-in demo user (Aarav Sharma).
 * Career.tsx and MyLearning.tsx both read the score from here so the number
 * is always produced by the canonical formula in lib/prs.ts — never
 * hardcoded. When live Supabase lands, this is replaced by a read from
 * promotion_readiness (whose breakdown uses the same four keys).
 */
export const demoPrsBreakdown: PrsBreakdown = {
  skills: 75, // 12 of 16 required proficiencies met
  certifications: 60, // 3 of 5 mandatory certifications at required level
  performance: 80, // avg of last two review scores
  tenure: 73, // time-in-role + cross-functional exposure credit
}

export const demoPrsScore = computePrs(demoPrsBreakdown)
export const demoPrsBand = prsBand(demoPrsScore)
export const demoPrsPoints = prsComponentPoints(demoPrsBreakdown)
