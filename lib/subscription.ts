export interface SubscriptionTier {
  id: string
  name: string
  price: number
  features: string[]
  limits: {
    disputeLetters: number | "unlimited"
    aiChat: number | "unlimited"
    certifiedMail: boolean
    expertSupport: boolean
    prioritySupport: boolean
  }
}

export const subscriptionTiers: Record<string, SubscriptionTier> = {
  basic: {
    id: "basic",
    name: "Basic",
    price: 39,
    features: [
      "AI-powered dispute letter generation",
      "Basic credit score tracking",
      "Email support",
      "Up to 5 disputes per month",
      "Credit education resources",
      "Mobile app access",
    ],
    limits: {
      disputeLetters: 5,
      aiChat: 50,
      certifiedMail: false,
      expertSupport: false,
      prioritySupport: false,
    },
  },
  professional: {
    id: "professional",
    name: "Professional",
    price: 79,
    features: [
      "Everything in Basic",
      "Unlimited dispute letters",
      "24/7 AI chat support",
      "Advanced credit analytics",
      "Priority processing",
      "Phone support",
      "Credit monitoring alerts",
      "Personalized action plans",
    ],
    limits: {
      disputeLetters: "unlimited",
      aiChat: "unlimited",
      certifiedMail: false,
      expertSupport: true,
      prioritySupport: false,
    },
  },
  premium: {
    id: "premium",
    name: "Premium",
    price: 129,
    features: [
      "Everything in Professional",
      "Certified mail service",
      "Dedicated credit specialist",
      "Legal document review",
      "Identity theft protection",
      "Credit builder recommendations",
      "Mortgage readiness reports",
      "120% money-back guarantee",
      "White-glove service",
    ],
    limits: {
      disputeLetters: "unlimited",
      aiChat: "unlimited",
      certifiedMail: true,
      expertSupport: true,
      prioritySupport: true,
    },
  },
}

export interface UserSubscription {
  tier: keyof typeof subscriptionTiers
  status: "active" | "cancelled" | "past_due"
  currentPeriodEnd: Date
  usage: {
    disputeLetters: number
    aiChat: number
    certifiedMail: number
  }
}

// Mock user subscription - in real app, this would come from your database
export const mockUserSubscription: UserSubscription = {
  tier: "professional",
  status: "active",
  currentPeriodEnd: new Date("2024-02-15"),
  usage: {
    disputeLetters: 12,
    aiChat: 47,
    certifiedMail: 0,
  },
}

export function hasFeatureAccess(subscription: UserSubscription, feature: keyof SubscriptionTier["limits"]): boolean {
  const tier = subscriptionTiers[subscription.tier]
  return tier.limits[feature] === true
}

export function getUsageLimit(
  subscription: UserSubscription,
  feature: "disputeLetters" | "aiChat",
): number | "unlimited" {
  const tier = subscriptionTiers[subscription.tier]
  return tier.limits[feature] as number | "unlimited"
}

export function isUsageLimitReached(subscription: UserSubscription, feature: "disputeLetters" | "aiChat"): boolean {
  const limit = getUsageLimit(subscription, feature)
  if (limit === "unlimited") return false
  return subscription.usage[feature] >= limit
}
