export interface MLMUser {
  id: string
  userId: string
  sponsorId: string | null
  uplineId: string | null
  mlmCode: string
  rank: MLMRank
  status: "active" | "inactive" | "suspended"
  joinDate: Date
  personalVolume: number
  teamVolume: number
  totalEarnings: number
  currentMonthEarnings: number
  lifetimeEarnings: number
  activeDownlines: number
  totalDownlines: number
  qualifiedLegs: number
  autoshipActive: boolean
  lastActivity: Date
  nextRankRequirement: RankRequirement | null
}

export interface MLMRank {
  id: string
  name: string
  level: number
  requirements: RankRequirement
  benefits: RankBenefit[]
  commissionRate: number
  bonusEligibility: string[]
  color: string
  icon: string
}

export interface RankRequirement {
  personalVolume: number
  teamVolume: number
  activeDownlines: number
  qualifiedLegs: number
  timeInRank?: number // months
  specialRequirements?: string[]
}

export interface RankBenefit {
  type: "commission" | "bonus" | "perk" | "recognition"
  description: string
  value: number | string
}

export interface MLMCommission {
  id: string
  userId: string
  type: CommissionType
  amount: number
  sourceUserId: string
  sourceOrderId?: string
  level: number
  percentage: number
  status: "pending" | "paid" | "cancelled"
  payoutDate?: Date
  createdAt: Date
}

export type CommissionType =
  | "direct_referral"
  | "unilevel"
  | "binary"
  | "matrix"
  | "matching_bonus"
  | "rank_advancement"
  | "leadership_bonus"
  | "fast_start"
  | "infinity_bonus"

export interface CompensationPlan {
  name: string
  description: string
  structure: "unilevel" | "binary" | "matrix" | "hybrid"
  maxLevels: number
  commissionRates: number[]
  bonuses: BonusStructure[]
  requirements: PlanRequirement[]
}

export interface BonusStructure {
  name: string
  type: "percentage" | "fixed" | "tiered"
  trigger: string
  amount: number
  eligibility: string[]
  frequency: "immediate" | "monthly" | "quarterly"
}

export interface PlanRequirement {
  type: "volume" | "activity" | "rank" | "team"
  description: string
  value: number
  period: "monthly" | "quarterly" | "annual"
}

export interface MLMTeam {
  id: string
  leaderId: string
  name: string
  description: string
  members: MLMUser[]
  totalVolume: number
  monthlyVolume: number
  rank: number
  achievements: Achievement[]
  goals: TeamGoal[]
  createdAt: Date
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: "sales" | "recruitment" | "leadership" | "training"
  points: number
  unlockedAt: Date
}

export interface TeamGoal {
  id: string
  title: string
  description: string
  target: number
  current: number
  deadline: Date
  reward: string
  status: "active" | "completed" | "expired"
}

export interface MLMTraining {
  id: string
  title: string
  description: string
  category: "onboarding" | "sales" | "leadership" | "product" | "compliance"
  level: "beginner" | "intermediate" | "advanced"
  duration: number // minutes
  modules: TrainingModule[]
  completionRate: number
  certificateAwarded: boolean
  requiredForRank?: string
}

export interface TrainingModule {
  id: string
  title: string
  type: "video" | "text" | "quiz" | "interactive"
  content: string
  duration: number
  completed: boolean
  score?: number
}

// MLM Ranks Configuration
export const mlmRanks: MLMRank[] = [
  {
    id: "associate",
    name: "Associate",
    level: 1,
    requirements: {
      personalVolume: 0,
      teamVolume: 0,
      activeDownlines: 0,
      qualifiedLegs: 0,
    },
    benefits: [
      { type: "commission", description: "Direct referral commission", value: "30%" },
      { type: "perk", description: "Access to basic training", value: "included" },
    ],
    commissionRate: 0.3,
    bonusEligibility: ["fast_start"],
    color: "#94A3B8",
    icon: "user",
  },
  {
    id: "consultant",
    name: "Consultant",
    level: 2,
    requirements: {
      personalVolume: 500,
      teamVolume: 1000,
      activeDownlines: 2,
      qualifiedLegs: 1,
    },
    benefits: [
      { type: "commission", description: "Direct referral commission", value: "35%" },
      { type: "commission", description: "2-level unilevel", value: "5%" },
      { type: "perk", description: "Marketing materials access", value: "included" },
    ],
    commissionRate: 0.35,
    bonusEligibility: ["fast_start", "matching_bonus"],
    color: "#10B981",
    icon: "briefcase",
  },
  {
    id: "manager",
    name: "Manager",
    level: 3,
    requirements: {
      personalVolume: 1000,
      teamVolume: 5000,
      activeDownlines: 5,
      qualifiedLegs: 2,
    },
    benefits: [
      { type: "commission", description: "Direct referral commission", value: "40%" },
      { type: "commission", description: "4-level unilevel", value: "5-10%" },
      { type: "bonus", description: "Leadership bonus", value: 500 },
      { type: "perk", description: "Custom landing pages", value: "included" },
    ],
    commissionRate: 0.4,
    bonusEligibility: ["fast_start", "matching_bonus", "leadership_bonus"],
    color: "#3B82F6",
    icon: "users",
  },
  {
    id: "director",
    name: "Director",
    level: 4,
    requirements: {
      personalVolume: 2000,
      teamVolume: 15000,
      activeDownlines: 10,
      qualifiedLegs: 3,
      timeInRank: 3,
    },
    benefits: [
      { type: "commission", description: "Direct referral commission", value: "45%" },
      { type: "commission", description: "6-level unilevel", value: "5-15%" },
      { type: "bonus", description: "Leadership bonus", value: 1500 },
      { type: "bonus", description: "Car bonus", value: 500 },
      { type: "perk", description: "Personal mentor", value: "included" },
    ],
    commissionRate: 0.45,
    bonusEligibility: ["fast_start", "matching_bonus", "leadership_bonus", "infinity_bonus"],
    color: "#8B5CF6",
    icon: "crown",
  },
  {
    id: "executive",
    name: "Executive Director",
    level: 5,
    requirements: {
      personalVolume: 3000,
      teamVolume: 50000,
      activeDownlines: 25,
      qualifiedLegs: 5,
      timeInRank: 6,
    },
    benefits: [
      { type: "commission", description: "Direct referral commission", value: "50%" },
      { type: "commission", description: "Infinity bonus", value: "2%" },
      { type: "bonus", description: "Leadership bonus", value: 3000 },
      { type: "bonus", description: "Car bonus", value: 1000 },
      { type: "bonus", description: "Travel incentives", value: 5000 },
      { type: "recognition", description: "Annual recognition event", value: "included" },
    ],
    commissionRate: 0.5,
    bonusEligibility: ["fast_start", "matching_bonus", "leadership_bonus", "infinity_bonus"],
    color: "#F59E0B",
    icon: "star",
  },
  {
    id: "presidential",
    name: "Presidential Diamond",
    level: 6,
    requirements: {
      personalVolume: 5000,
      teamVolume: 150000,
      activeDownlines: 50,
      qualifiedLegs: 8,
      timeInRank: 12,
      specialRequirements: ["Maintain rank for 12 consecutive months"],
    },
    benefits: [
      { type: "commission", description: "Direct referral commission", value: "55%" },
      { type: "commission", description: "Infinity bonus", value: "3%" },
      { type: "bonus", description: "Presidential bonus", value: 10000 },
      { type: "bonus", description: "Luxury car bonus", value: 2000 },
      { type: "bonus", description: "Annual vacation", value: 15000 },
      { type: "recognition", description: "Presidential recognition", value: "included" },
      { type: "perk", description: "Equity participation", value: "0.1%" },
    ],
    commissionRate: 0.55,
    bonusEligibility: ["fast_start", "matching_bonus", "leadership_bonus", "infinity_bonus"],
    color: "#EF4444",
    icon: "diamond",
  },
]

// Compensation Plan Configuration
export const compensationPlan: CompensationPlan = {
  name: "CreditAI Pro MLM Compensation Plan",
  description: "Multi-tier compensation plan with 7 income streams",
  structure: "hybrid",
  maxLevels: 10,
  commissionRates: [0.3, 0.1, 0.08, 0.06, 0.05, 0.04, 0.03, 0.02, 0.02, 0.01],
  bonuses: [
    {
      name: "Fast Start Bonus",
      type: "percentage",
      trigger: "First 30 days referral",
      amount: 0.1,
      eligibility: ["all_ranks"],
      frequency: "immediate",
    },
    {
      name: "Matching Bonus",
      type: "percentage",
      trigger: "Downline commission earned",
      amount: 0.25,
      eligibility: ["consultant", "manager", "director", "executive", "presidential"],
      frequency: "immediate",
    },
    {
      name: "Leadership Bonus",
      type: "tiered",
      trigger: "Monthly team volume",
      amount: 2000,
      eligibility: ["manager", "director", "executive", "presidential"],
      frequency: "monthly",
    },
    {
      name: "Infinity Bonus",
      type: "percentage",
      trigger: "All downline volume",
      amount: 0.02,
      eligibility: ["executive", "presidential"],
      frequency: "monthly",
    },
  ],
  requirements: [
    {
      type: "volume",
      description: "Minimum personal volume",
      value: 100,
      period: "monthly",
    },
    {
      type: "activity",
      description: "Active status maintenance",
      value: 1,
      period: "monthly",
    },
  ],
}

// Helper Functions
export function calculateCommissions(user: MLMUser, sale: any): MLMCommission[] {
  const commissions: MLMCommission[] = []

  // Direct referral commission
  commissions.push({
    id: `comm_${Date.now()}_direct`,
    userId: user.id,
    type: "direct_referral",
    amount: sale.amount * user.rank.commissionRate,
    sourceUserId: sale.customerId,
    sourceOrderId: sale.id,
    level: 0,
    percentage: user.rank.commissionRate,
    status: "pending",
    createdAt: new Date(),
  })

  // Unilevel commissions (up the upline)
  let currentUpline = user.uplineId
  let level = 1

  while (currentUpline && level <= compensationPlan.maxLevels) {
    const uplineUser = getUserById(currentUpline) // Mock function
    if (uplineUser && uplineUser.status === "active") {
      const rate = compensationPlan.commissionRates[level - 1] || 0

      commissions.push({
        id: `comm_${Date.now()}_unilevel_${level}`,
        userId: uplineUser.id,
        type: "unilevel",
        amount: sale.amount * rate,
        sourceUserId: user.id,
        sourceOrderId: sale.id,
        level,
        percentage: rate,
        status: "pending",
        createdAt: new Date(),
      })
    }

    currentUpline = uplineUser?.uplineId
    level++
  }

  return commissions
}

export function calculateRankAdvancement(user: MLMUser): MLMRank | null {
  const currentRankIndex = mlmRanks.findIndex((rank) => rank.id === user.rank.id)
  const nextRank = mlmRanks[currentRankIndex + 1]

  if (!nextRank) return null

  const meetsRequirements =
    user.personalVolume >= nextRank.requirements.personalVolume &&
    user.teamVolume >= nextRank.requirements.teamVolume &&
    user.activeDownlines >= nextRank.requirements.activeDownlines &&
    user.qualifiedLegs >= nextRank.requirements.qualifiedLegs

  return meetsRequirements ? nextRank : null
}

export function calculateTeamVolume(userId: string): number {
  // Mock calculation - in real app, would query database
  return 0
}

export function getDownlineUsers(userId: string): MLMUser[] {
  // Mock function - in real app, would query database
  return []
}

export function getUserById(userId: string): MLMUser | null {
  // Mock function - in real app, would query database
  return null
}

// Mock data for development
export const mockMLMUser: MLMUser = {
  id: "mlm_user_123",
  userId: "user_123",
  sponsorId: "mlm_user_456",
  uplineId: "mlm_user_456",
  mlmCode: "CREDITPRO2024",
  rank: mlmRanks[2], // Manager
  status: "active",
  joinDate: new Date("2024-01-01"),
  personalVolume: 1250,
  teamVolume: 8500,
  totalEarnings: 12450,
  currentMonthEarnings: 2100,
  lifetimeEarnings: 45600,
  activeDownlines: 8,
  totalDownlines: 23,
  qualifiedLegs: 2,
  autoshipActive: true,
  lastActivity: new Date(),
  nextRankRequirement: mlmRanks[3].requirements,
}

// Additional MLM Interfaces for Database Integration
export interface MLMGenealogy {
  id: string
  userId: string
  sponsorId: string | null
  uplineId: string | null
  level: number
  position?: string
  matrixPosition?: number
  binaryLeg?: string
  isActive: boolean
  joinDate: Date
  displayName?: string
  email?: string
}

export interface MLMPayout {
  id: string
  userId: string
  amount: number
  currency: string
  method: string
  details: any
  status: string
  periodStart: Date
  periodEnd: Date
  commissionIds: string[]
  stripePayoutId?: string
  bankAccountId?: string
  processedAt?: Date
  createdAt: Date
}

export interface MLMMarketing {
  id: string
  userId: string
  campaignType: string
  campaignName: string
  content: any
  targetAudience?: any
  status: string
  startDate?: Date
  endDate?: Date
  metrics: any
  createdAt: Date
}

export interface MLMAnalytics {
  id: string
  userId: string
  type: string
  value: number
  data: any
  periodStart: Date
  periodEnd: Date
  createdAt: Date
}

export interface MLMNotification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  data?: any
  isRead: boolean
  priority: string
  createdAt: Date
}

export const incomeStreams = [
  {
    name: "Direct Referral Commissions",
    description: "Earn 30-55% commission on every direct customer referral",
    potential: "$500-$5,000/month",
    difficulty: "Easy",
  },
  {
    name: "Unilevel Team Commissions",
    description: "Earn 1-10% on your entire downline organization",
    potential: "$200-$10,000/month",
    difficulty: "Medium",
  },
  {
    name: "Fast Start Bonuses",
    description: "Extra 10% bonus on referrals in first 30 days",
    potential: "$100-$1,000/month",
    difficulty: "Easy",
  },
  {
    name: "Matching Bonuses",
    description: "Earn 25% of what your direct recruits earn",
    potential: "$300-$3,000/month",
    difficulty: "Medium",
  },
  {
    name: "Leadership Bonuses",
    description: "Monthly bonuses based on team performance",
    potential: "$500-$5,000/month",
    difficulty: "Hard",
  },
  {
    name: "Rank Advancement Bonuses",
    description: "One-time bonuses for achieving new ranks",
    potential: "$1,000-$25,000",
    difficulty: "Hard",
  },
  {
    name: "Infinity Bonuses",
    description: "Lifetime 2-3% on all organizational volume",
    potential: "$1,000-$50,000/month",
    difficulty: "Expert",
  },
]
