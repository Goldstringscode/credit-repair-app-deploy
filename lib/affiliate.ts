export interface Affiliate {
  id: string
  userId: string
  affiliateCode: string
  status: "pending" | "active" | "suspended" | "inactive"
  tier: "bronze" | "silver" | "gold" | "platinum"
  joinDate: Date
  totalEarnings: number
  pendingEarnings: number
  paidEarnings: number
  totalReferrals: number
  activeReferrals: number
  conversionRate: number
  paymentMethod: "paypal" | "bank" | "check"
  paymentDetails: {
    email?: string
    accountNumber?: string
    routingNumber?: string
    address?: string
  }
}

export interface AffiliateReferral {
  id: string
  affiliateId: string
  referredUserId: string
  referralCode: string
  status: "pending" | "converted" | "cancelled"
  signupDate: Date
  conversionDate?: Date
  subscriptionTier: string
  commission: number
  commissionRate: number
  lifetime: boolean
}

export interface CommissionTier {
  tier: "bronze" | "silver" | "gold" | "platinum"
  minReferrals: number
  commissionRate: number
  bonusRate: number
  lifetimeCommission: boolean
  benefits: string[]
}

export const commissionTiers: Record<string, CommissionTier> = {
  bronze: {
    tier: "bronze",
    minReferrals: 0,
    commissionRate: 0.3, // 30%
    bonusRate: 0,
    lifetimeCommission: false,
    benefits: [
      "30% commission on first payment",
      "Real-time tracking dashboard",
      "Marketing materials access",
      "Email support",
    ],
  },
  silver: {
    tier: "silver",
    minReferrals: 10,
    commissionRate: 0.35, // 35%
    bonusRate: 0.05,
    lifetimeCommission: false,
    benefits: [
      "35% commission on first payment",
      "5% bonus on milestone achievements",
      "Priority support",
      "Custom landing pages",
      "Advanced analytics",
    ],
  },
  gold: {
    tier: "gold",
    minReferrals: 25,
    commissionRate: 0.4, // 40%
    bonusRate: 0.1,
    lifetimeCommission: true,
    benefits: [
      "40% commission on first payment",
      "10% lifetime recurring commission",
      "Dedicated account manager",
      "Custom promotional codes",
      "White-label materials",
    ],
  },
  platinum: {
    tier: "platinum",
    minReferrals: 50,
    commissionRate: 0.45, // 45%
    bonusRate: 0.15,
    lifetimeCommission: true,
    benefits: [
      "45% commission on first payment",
      "15% lifetime recurring commission",
      "VIP support line",
      "Custom integrations",
      "Revenue sharing opportunities",
    ],
  },
}

export const mockAffiliate: Affiliate = {
  id: "aff_123",
  userId: "user_123",
  affiliateCode: "CREDITPRO2024",
  status: "active",
  tier: "silver",
  joinDate: new Date("2024-01-01"),
  totalEarnings: 2450.0,
  pendingEarnings: 380.0,
  paidEarnings: 2070.0,
  totalReferrals: 15,
  activeReferrals: 12,
  conversionRate: 0.68,
  paymentMethod: "paypal",
  paymentDetails: {
    email: "affiliate@example.com",
  },
}

export function calculateCommission(subscriptionPrice: number, tier: string): number {
  const commissionTier = commissionTiers[tier]
  return subscriptionPrice * commissionTier.commissionRate
}

export function getNextTier(currentTier: string, referrals: number): string | null {
  const tiers = ["bronze", "silver", "gold", "platinum"]
  const currentIndex = tiers.indexOf(currentTier)

  for (let i = currentIndex + 1; i < tiers.length; i++) {
    const tier = commissionTiers[tiers[i]]
    if (referrals >= tier.minReferrals) {
      return tiers[i]
    }
  }

  return null
}
