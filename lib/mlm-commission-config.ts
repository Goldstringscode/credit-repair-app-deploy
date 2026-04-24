/**
 * lib/mlm-commission-config.ts
 * SINGLE SOURCE OF TRUTH for all MLM commission rates, rank thresholds, and payout rules.
 * Replaces the conflicting: MLM_COMMISSION_RATE=0.05 env var, README rates, STRIPE_MLM_SETUP rates.
 * Remove MLM_COMMISSION_RATE and ENABLE_MLM_V2 from your .env - they are now retired.
 */

export const MLM_RANKS = ['associate','consultant','manager','director','executive','presidential'] as const
export type MLMRank = typeof MLM_RANKS[number]

export interface RankConfig {
  label: string; level: number; directRate: number
  minPersonalVolume: number; minTeamVolume: number; minDirectDownlines: number; advancementBonus: number
}

export const RANK_CONFIG: Record<MLMRank, RankConfig> = {
  associate:    { label: 'Associate',    level: 1, directRate: 0.30, minPersonalVolume: 0,    minTeamVolume: 0,      minDirectDownlines: 0,  advancementBonus: 0    },
  consultant:   { label: 'Consultant',   level: 2, directRate: 0.35, minPersonalVolume: 500,  minTeamVolume: 1000,   minDirectDownlines: 2,  advancementBonus: 100  },
  manager:      { label: 'Manager',      level: 3, directRate: 0.40, minPersonalVolume: 1000, minTeamVolume: 5000,   minDirectDownlines: 5,  advancementBonus: 250  },
  director:     { label: 'Director',     level: 4, directRate: 0.45, minPersonalVolume: 2000, minTeamVolume: 15000,  minDirectDownlines: 10, advancementBonus: 500  },
  executive:    { label: 'Executive',    level: 5, directRate: 0.50, minPersonalVolume: 3000, minTeamVolume: 50000,  minDirectDownlines: 25, advancementBonus: 1000 },
  presidential: { label: 'Presidential', level: 6, directRate: 0.55, minPersonalVolume: 5000, minTeamVolume: 150000, minDirectDownlines: 50, advancementBonus: 2500 },
}

// Unilevel depth rates — hard-capped at 7 levels
export const UNILEVEL_DEPTH_RATES = [0.10, 0.08, 0.06, 0.05, 0.04, 0.03, 0.02]
export const MAX_UNILEVEL_DEPTH = UNILEVEL_DEPTH_RATES.length

export const FAST_START_BONUS_RATE = 0.10
export const FAST_START_WINDOW_DAYS = 30
export const MATCHING_BONUS_RATE = 0.05
export const MATCHING_BONUS_MIN_RANK: MLMRank = 'manager'
export const LEADERSHIP_BONUS_RATE = 0.02
export const LEADERSHIP_BONUS_MIN_RANK: MLMRank = 'director'

// Payout rules
export const PAYOUT_HOLD_DAYS = 15
export const PAYOUT_MINIMUM_USD = 25
export const PAYOUT_VELOCITY_HOURS = 24

// Plan config - canonical prices (replaces conflicting README/STRIPE_MLM_SETUP prices)
export interface MLMPlanConfig {
  key: string; name: string; monthlyPriceUsd: number
  stripePriceIdEnvKey: string; startingRank: MLMRank; features: string[]
}

export const MLM_PLAN_CONFIG: MLMPlanConfig[] = [
  { key: 'mlm_starter',      name: 'MLM Starter',      monthlyPriceUsd: 97,  stripePriceIdEnvKey: 'STRIPE_MLM_STARTER_PRICE_ID',      startingRank: 'associate',  features: ['Basic affiliate dashboard','Team visibility (2 levels)','Email support'] },
  { key: 'mlm_professional', name: 'MLM Professional', monthlyPriceUsd: 197, stripePriceIdEnvKey: 'STRIPE_MLM_PROFESSIONAL_PRICE_ID', startingRank: 'consultant', features: ['Advanced analytics','Team visibility (5 levels)','Custom referral page','Priority support'] },
  { key: 'mlm_enterprise',   name: 'MLM Enterprise',   monthlyPriceUsd: 397, stripePriceIdEnvKey: 'STRIPE_MLM_ENTERPRISE_PRICE_ID',   startingRank: 'manager',    features: ['Unlimited team visibility','White-label portal','API access','Dedicated account manager'] },
]

export function getDirectRate(rank: MLMRank): number {
  return RANK_CONFIG[rank]?.directRate ?? RANK_CONFIG.associate.directRate
}

export function getUnilevelRate(depth: number): number {
  if (depth < 0 || depth >= MAX_UNILEVEL_DEPTH) return 0
  return UNILEVEL_DEPTH_RATES[depth]
}

export function calculateCommission(saleAmountUsd: number, sponsorRank: MLMRank, depth: number, isFastStart: boolean): number {
  const directRate = getDirectRate(sponsorRank)
  const rate = depth === 0
    ? directRate + (isFastStart ? FAST_START_BONUS_RATE : 0)
    : directRate * getUnilevelRate(depth - 1)
  return parseFloat((saleAmountUsd * rate).toFixed(2))
}

export function qualifiesForRank(candidateRank: MLMRank, personalVolumeUsd: number, teamVolumeUsd: number, activeDirectDownlines: number): boolean {
  const c = RANK_CONFIG[candidateRank]
  return personalVolumeUsd >= c.minPersonalVolume && teamVolumeUsd >= c.minTeamVolume && activeDirectDownlines >= c.minDirectDownlines
}

export function computeEarnedRank(personalVolumeUsd: number, teamVolumeUsd: number, activeDirectDownlines: number): MLMRank {
  const ranksDesc = [...MLM_RANKS].reverse() as MLMRank[]
  for (const rank of ranksDesc) {
    if (qualifiesForRank(rank, personalVolumeUsd, teamVolumeUsd, activeDirectDownlines)) return rank
  }
  return 'associate'
}