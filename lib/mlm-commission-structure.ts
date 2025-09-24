export interface CommissionLevel {
  level: number
  rate: number
  description: string
}

export interface MLMRank {
  id: string
  name: string
  level: number
  requirements: {
    personalSales: number
    teamSales: number
    activeDownlines: number
    timeInRank?: number
  }
  commissionBonus: number
  maxLevels: number
  color: string
  icon: string
}

export interface CommissionType {
  id: string
  name: string
  description: string
  baseRate: number
  applicableProducts: string[]
}

// Commission types for different products/services
export const commissionTypes: CommissionType[] = [
  {
    id: "credit_repair",
    name: "Credit Repair Subscribers",
    description: "Commission from credit repair service subscriptions",
    baseRate: 0.25, // 25% base rate
    applicableProducts: ["basic_plan", "premium_plan", "enterprise_plan"],
  },
  {
    id: "mlm_members",
    name: "MLM Member Recruitment",
    description: "Commission from recruiting new MLM members",
    baseRate: 0.4, // 40% base rate
    applicableProducts: ["starter_mlm", "professional_mlm", "enterprise_mlm"],
  },
  {
    id: "training_courses",
    name: "Training Courses",
    description: "Commission from training course sales",
    baseRate: 0.3, // 30% base rate
    applicableProducts: ["basic_training", "advanced_training", "certification"],
  },
  {
    id: "certified_mail",
    name: "Certified Mail Services",
    description: "Commission from certified mail service usage",
    baseRate: 0.15, // 15% base rate
    applicableProducts: ["certified_mail_package"],
  },
]

// MLM Ranks with increasing commission bonuses
export const mlmRanks: MLMRank[] = [
  {
    id: "associate",
    name: "Associate",
    level: 1,
    requirements: {
      personalSales: 0,
      teamSales: 0,
      activeDownlines: 0,
    },
    commissionBonus: 0, // No bonus
    maxLevels: 3,
    color: "#94A3B8",
    icon: "user",
  },
  {
    id: "consultant",
    name: "Consultant",
    level: 2,
    requirements: {
      personalSales: 1000,
      teamSales: 2500,
      activeDownlines: 3,
    },
    commissionBonus: 0.05, // +5% bonus
    maxLevels: 5,
    color: "#10B981",
    icon: "briefcase",
  },
  {
    id: "manager",
    name: "Manager",
    level: 3,
    requirements: {
      personalSales: 2500,
      teamSales: 7500,
      activeDownlines: 8,
    },
    commissionBonus: 0.1, // +10% bonus
    maxLevels: 7,
    color: "#3B82F6",
    icon: "users",
  },
  {
    id: "director",
    name: "Director",
    level: 4,
    requirements: {
      personalSales: 5000,
      teamSales: 20000,
      activeDownlines: 15,
      timeInRank: 3,
    },
    commissionBonus: 0.15, // +15% bonus
    maxLevels: 10,
    color: "#8B5CF6",
    icon: "crown",
  },
  {
    id: "executive",
    name: "Executive Director",
    level: 5,
    requirements: {
      personalSales: 10000,
      teamSales: 50000,
      activeDownlines: 25,
      timeInRank: 6,
    },
    commissionBonus: 0.2, // +20% bonus
    maxLevels: 15,
    color: "#F59E0B",
    icon: "star",
  },
  {
    id: "presidential",
    name: "Presidential Diamond",
    level: 6,
    requirements: {
      personalSales: 25000,
      teamSales: 150000,
      activeDownlines: 50,
      timeInRank: 12,
    },
    commissionBonus: 0.25, // +25% bonus
    maxLevels: -1, // Unlimited
    color: "#EF4444",
    icon: "diamond",
  },
]

// Commission rates by level (decreasing as levels go deeper)
export const levelCommissionRates: CommissionLevel[] = [
  { level: 1, rate: 1.0, description: "Direct referrals - Full commission" },
  { level: 2, rate: 0.5, description: "2nd level - 50% of base rate" },
  { level: 3, rate: 0.3, description: "3rd level - 30% of base rate" },
  { level: 4, rate: 0.2, description: "4th level - 20% of base rate" },
  { level: 5, rate: 0.15, description: "5th level - 15% of base rate" },
  { level: 6, rate: 0.1, description: "6th level - 10% of base rate" },
  { level: 7, rate: 0.08, description: "7th level - 8% of base rate" },
  { level: 8, rate: 0.06, description: "8th level - 6% of base rate" },
  { level: 9, rate: 0.05, description: "9th level - 5% of base rate" },
  { level: 10, rate: 0.04, description: "10th level - 4% of base rate" },
  { level: 11, rate: 0.03, description: "11th+ levels - 3% of base rate" },
]

// Calculate commission for a specific sale
export function calculateCommission(
  saleAmount: number,
  commissionTypeId: string,
  userRank: MLMRank,
  level: number,
): number {
  const commissionType = commissionTypes.find((ct) => ct.id === commissionTypeId)
  if (!commissionType) return 0

  const levelRate = levelCommissionRates.find((lr) => lr.level === level)?.rate || 0.03
  const baseCommission = saleAmount * commissionType.baseRate * levelRate
  const rankBonus = baseCommission * userRank.commissionBonus

  return baseCommission + rankBonus
}

// Get maximum commission rate for a tier
export function getMaxCommissionRate(tierId: string): number {
  const tier = mlmPricingTiers.find((t) => t.id === tierId)
  if (!tier) return 0

  // Calculate max possible rate (base rate + highest rank bonus)
  const maxRank = mlmRanks[mlmRanks.length - 1]
  const maxRate = tier.baseCommissionRate * (1 + maxRank.commissionBonus)

  return Math.round(maxRate * 100) // Return as percentage
}

// Updated pricing tiers with detailed commission structure
export const mlmPricingTiers = [
  {
    id: "starter",
    name: "Starter",
    price: 97,
    setupFee: 0,
    description: "Perfect for beginners starting their MLM journey",
    baseCommissionRate: 0.25, // 25% base rate
    maxLevels: 3,
    popular: false,
    commissionDetails: {
      creditRepair: "Up to 31%", // 25% + 25% rank bonus
      mlmRecruitment: "Up to 50%", // 40% + 25% rank bonus
      trainingCourses: "Up to 38%", // 30% + 25% rank bonus
      certifiedMail: "Up to 19%", // 15% + 25% rank bonus
    },
    features: [
      "25% base commission on credit repair sales",
      "40% base commission on MLM recruitment",
      "30% base commission on training courses",
      "15% base commission on certified mail",
      "Up to 3 levels deep earning potential",
      "Rank advancement bonuses up to +25%",
      "Basic training materials",
      "Email support",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: 197,
    setupFee: 0,
    description: "Most popular choice for serious entrepreneurs",
    baseCommissionRate: 0.3, // 30% base rate
    maxLevels: 7,
    popular: true,
    commissionDetails: {
      creditRepair: "Up to 38%", // 30% + 25% rank bonus
      mlmRecruitment: "Up to 50%", // 40% + 25% rank bonus
      trainingCourses: "Up to 38%", // 30% + 25% rank bonus
      certifiedMail: "Up to 19%", // 15% + 25% rank bonus
    },
    features: [
      "30% base commission on credit repair sales",
      "40% base commission on MLM recruitment",
      "30% base commission on training courses",
      "15% base commission on certified mail",
      "Up to 7 levels deep earning potential",
      "Rank advancement bonuses up to +25%",
      "Advanced training academy",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 397,
    setupFee: 0,
    description: "Ultimate package for MLM professionals",
    baseCommissionRate: 0.35, // 35% base rate
    maxLevels: -1,
    popular: false,
    commissionDetails: {
      creditRepair: "Up to 44%", // 35% + 25% rank bonus
      mlmRecruitment: "Up to 50%", // 40% + 25% rank bonus
      trainingCourses: "Up to 38%", // 30% + 25% rank bonus
      certifiedMail: "Up to 19%", // 15% + 25% rank bonus
    },
    features: [
      "35% base commission on credit repair sales",
      "40% base commission on MLM recruitment",
      "30% base commission on training courses",
      "15% base commission on certified mail",
      "Unlimited levels deep earning potential",
      "Rank advancement bonuses up to +25%",
      "VIP training & certification",
      "24/7 support",
    ],
  },
]

// Commission examples for different scenarios
export const commissionExamples = [
  {
    scenario: "Credit Repair Sale - $97/month",
    starter: "$24.25 (25%)",
    professional: "$29.10 (30%)",
    enterprise: "$33.95 (35%)",
    withRankBonus: "Up to +25% more with rank advancement",
  },
  {
    scenario: "MLM Recruitment - $197",
    starter: "$78.80 (40%)",
    professional: "$78.80 (40%)",
    enterprise: "$78.80 (40%)",
    withRankBonus: "Up to +25% more with rank advancement",
  },
  {
    scenario: "Training Course - $297",
    starter: "$89.10 (30%)",
    professional: "$89.10 (30%)",
    enterprise: "$89.10 (30%)",
    withRankBonus: "Up to +25% more with rank advancement",
  },
]
