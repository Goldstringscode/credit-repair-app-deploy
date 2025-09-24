export interface MLMPricingTier {
  id: string
  name: string
  price: number
  setupFee: number
  description: string
  features: string[]
  commissionRate: number
  maxLevels: number
  bonusEligibility: string[]
  color: string
  popular: boolean
  savings?: string
}

export interface MLMSubscription {
  id: string
  userId: string
  tierId: string
  status: "active" | "cancelled" | "suspended" | "pending"
  startDate: Date
  nextBillingDate: Date
  autoRenewal: boolean
  paymentMethodId: string
  totalPaid: number
  commissionEarned: number
  teamSize: number
}

export const mlmPricingTiers: MLMPricingTier[] = [
  {
    id: "starter",
    name: "MLM Starter",
    price: 97,
    setupFee: 0,
    description: "Perfect for getting started with MLM credit repair business",
    features: [
      "Personal MLM website",
      "Basic training materials",
      "Email marketing templates",
      "Commission tracking dashboard",
      "Up to 3 levels deep",
      "30% commission rate",
      "Basic support",
      "Mobile app access",
    ],
    commissionRate: 0.3,
    maxLevels: 3,
    bonusEligibility: ["fast_start"],
    color: "#10B981",
    popular: false,
  },
  {
    id: "professional",
    name: "MLM Professional",
    price: 197,
    setupFee: 0,
    description: "Most popular choice for serious MLM entrepreneurs",
    features: [
      "Everything in Starter",
      "Advanced training academy",
      "Custom landing pages",
      "Automated follow-up sequences",
      "Up to 7 levels deep",
      "40% commission rate",
      "Priority support",
      "Team management tools",
      "Advanced analytics",
      "Social media templates",
    ],
    commissionRate: 0.4,
    maxLevels: 7,
    bonusEligibility: ["fast_start", "matching_bonus", "leadership_bonus"],
    color: "#3B82F6",
    popular: true,
    savings: "Save $100/month",
  },
  {
    id: "enterprise",
    name: "MLM Enterprise",
    price: 397,
    setupFee: 97,
    description: "Complete MLM business solution for top performers",
    features: [
      "Everything in Professional",
      "White-label platform",
      "Custom domain setup",
      "Advanced automation tools",
      "Unlimited levels deep",
      "50% commission rate",
      "Dedicated account manager",
      "Custom integrations",
      "API access",
      "Advanced reporting",
      "Team coaching calls",
      "Marketing automation",
    ],
    commissionRate: 0.5,
    maxLevels: -1, // unlimited
    bonusEligibility: ["fast_start", "matching_bonus", "leadership_bonus", "infinity_bonus"],
    color: "#8B5CF6",
    popular: false,
    savings: "Save $200/month",
  },
]

export const mlmAddOns = [
  {
    id: "certified_mail",
    name: "Certified Mail Service",
    price: 49,
    description: "Professional certified mail service for dispute letters",
    features: ["USPS certified mail", "Tracking included", "Professional templates"],
  },
  {
    id: "personal_coach",
    name: "Personal MLM Coach",
    price: 297,
    description: "One-on-one coaching with MLM expert",
    features: ["Weekly 1-hour calls", "Personalized strategy", "Goal setting"],
  },
  {
    id: "marketing_suite",
    name: "Advanced Marketing Suite",
    price: 97,
    description: "Professional marketing tools and templates",
    features: ["Video templates", "Social media scheduler", "Lead magnets"],
  },
]

export function calculateMLMCommission(saleAmount: number, tier: MLMPricingTier, level: number): number {
  const baseCommission = saleAmount * tier.commissionRate
  const levelMultiplier = Math.max(0.1, 1 - (level - 1) * 0.1) // Decreases by 10% per level
  return baseCommission * levelMultiplier
}

export function getMLMTierById(tierId: string): MLMPricingTier | null {
  return mlmPricingTiers.find((tier) => tier.id === tierId) || null
}

export function calculateAnnualSavings(monthlyPrice: number): number {
  const annualPrice = monthlyPrice * 10 // 2 months free
  const monthlyCost = monthlyPrice * 12
  return monthlyCost - annualPrice
}

// Mock MLM subscription data
export const mockMLMSubscription: MLMSubscription = {
  id: "mlm_sub_123",
  userId: "user_123",
  tierId: "professional",
  status: "active",
  startDate: new Date("2024-01-01"),
  nextBillingDate: new Date("2024-02-01"),
  autoRenewal: true,
  paymentMethodId: "pm_123",
  totalPaid: 1970,
  commissionEarned: 2450,
  teamSize: 12,
}
