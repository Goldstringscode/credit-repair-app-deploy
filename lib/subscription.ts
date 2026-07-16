// Single source of truth for the app's subscription plans. Every part of
// the app that displays, sells, or enforces plan pricing/features should
// import from here instead of hardcoding its own copy of this data.
//
// Before this, plan names/prices/features were duplicated (and had already
// drifted out of sync) across the pricing page, the checkout page, the
// billing API, and the payment-intent creation flow — e.g. the checkout
// page showed "Basic Plan — $29.99" while the (now-removed) legacy payment
// endpoint actually charged $39.00 for the same plan, and had no
// "professional" plan at all despite the pricing page linking to it.
// Centralizing here means changing a price once, here, makes it correct
// everywhere, and the actual Stripe charge amount is computed server-side
// from this file rather than trusted from the client.

export interface SubscriptionTier {
  id: string
  name: string
  price: number // whole dollars
  period: string
  description: string
  buttonText: string
  popular: boolean
  icon: "Gift" | "Shield" | "Star" | "Zap"
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
  free: {
    id: "free",
    name: "Free",
    price: 0,
    period: "month",
    description: "Try it out with one dispute letter, on us",
    buttonText: "Get Started Free",
    popular: false,
    icon: "Gift",
    features: [
      "1 AI-powered dispute letter per month",
      "Manual credit report entry",
      "Email support",
      "Credit education resources",
      "You only pay for certified mail shipping",
    ],
    limits: {
      disputeLetters: 1,
      aiChat: 0,
      certifiedMail: false,
      expertSupport: false,
      prioritySupport: false,
    },
  },
  basic: {
    id: "basic",
    name: "Basic",
    price: 39,
    period: "month",
    description: "Perfect for getting started with credit repair",
    buttonText: "Start Basic Plan",
    popular: false,
    icon: "Shield",
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
    period: "month",
    description: "Most popular plan for serious credit repair",
    buttonText: "Start Professional Plan",
    popular: true,
    icon: "Star",
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
    period: "month",
    description: "Complete credit repair solution with expert support",
    buttonText: "Start Premium Plan",
    popular: false,
    icon: "Zap",
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

// Display order for the pricing page grid, etc.
export const orderedPlanIds = ["free", "basic", "professional", "premium"] as const

export function getAllPlans(): SubscriptionTier[] {
  return orderedPlanIds.map((id) => subscriptionTiers[id])
}

export function getPlan(planId: string | undefined | null): SubscriptionTier | undefined {
  if (!planId) return undefined
  return subscriptionTiers[planId.toLowerCase()]
}

/** Price in whole dollars, for display. Unknown plan ids resolve to 0. */
export function getPlanPrice(planId: string | undefined | null): number {
  return getPlan(planId)?.price ?? 0
}

/** Price in integer cents, for Stripe amounts. */
export function getPlanPriceCents(planId: string | undefined | null): number {
  return Math.round(getPlanPrice(planId) * 100)
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

// Used by a couple of dashboard pages as placeholder/demo data where a real
// subscription lookup isn't wired up yet. Kept here (not deleted) because
// removing it previously broke the build — components/subscription-gate.tsx
// consumers pass it as a fallback currentSubscription prop.
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

