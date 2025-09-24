export interface ConversionFunnelStep {
  step: string
  name: string
  description: string
  order: number
}

export interface FunnelData {
  step: string
  visitors: number
  conversions: number
  conversionRate: number
  dropoffRate: number
  revenue: number
  averageTimeToConvert: number
}

export interface AttributionModel {
  model: "first-click" | "last-click" | "linear" | "time-decay" | "position-based"
  name: string
  description: string
  weight: number[]
}

export interface TouchPoint {
  id: string
  affiliateId: string
  referralCode: string
  timestamp: Date
  source: string
  medium: string
  campaign: string
  content: string
  userAgent: string
  ip: string
  sessionId: string
  pageUrl: string
  referrer: string
}

export interface ConversionEvent {
  id: string
  userId: string
  affiliateId: string
  eventType: "visit" | "signup" | "trial" | "subscription" | "upgrade" | "churn"
  timestamp: Date
  value: number
  subscriptionTier: string
  touchPoints: TouchPoint[]
  attribution: {
    firstClick: TouchPoint
    lastClick: TouchPoint
    assistingClicks: TouchPoint[]
    timeToConversion: number
    touchPointCount: number
  }
}

export interface CohortData {
  cohort: string
  period: number
  users: number
  retained: number
  retentionRate: number
  revenue: number
  ltv: number
}

export interface AffiliateAnalytics {
  affiliateId: string
  period: {
    start: Date
    end: Date
  }
  funnel: FunnelData[]
  attribution: {
    [key: string]: {
      conversions: number
      revenue: number
      commission: number
    }
  }
  cohorts: CohortData[]
  performance: {
    clicks: number
    impressions: number
    ctr: number
    conversions: number
    conversionRate: number
    revenue: number
    roas: number
    cpa: number
    ltv: number
  }
  topPerformingContent: {
    id: string
    name: string
    type: string
    clicks: number
    conversions: number
    revenue: number
  }[]
}

export const conversionFunnelSteps: ConversionFunnelStep[] = [
  {
    step: "visit",
    name: "Landing Page Visit",
    description: "User clicks affiliate link and visits landing page",
    order: 1,
  },
  {
    step: "signup",
    name: "Account Registration",
    description: "User creates an account",
    order: 2,
  },
  {
    step: "trial",
    name: "Trial Activation",
    description: "User starts free trial or uses free features",
    order: 3,
  },
  {
    step: "subscription",
    name: "Paid Subscription",
    description: "User converts to paid subscription",
    order: 4,
  },
  {
    step: "retention",
    name: "30-Day Retention",
    description: "User remains active after 30 days",
    order: 5,
  },
]

export const attributionModels: AttributionModel[] = [
  {
    model: "first-click",
    name: "First-Click Attribution",
    description: "100% credit to the first touchpoint",
    weight: [1.0],
  },
  {
    model: "last-click",
    name: "Last-Click Attribution",
    description: "100% credit to the last touchpoint",
    weight: [1.0],
  },
  {
    model: "linear",
    name: "Linear Attribution",
    description: "Equal credit distributed across all touchpoints",
    weight: [],
  },
  {
    model: "time-decay",
    name: "Time-Decay Attribution",
    description: "More credit to recent touchpoints",
    weight: [],
  },
  {
    model: "position-based",
    name: "Position-Based Attribution",
    description: "40% first, 40% last, 20% middle touchpoints",
    weight: [0.4, 0.2, 0.4],
  },
]

export function calculateAttribution(
  touchPoints: TouchPoint[],
  model: AttributionModel,
  conversionValue: number,
): { [affiliateId: string]: number } {
  if (touchPoints.length === 0) return {}

  const attribution: { [affiliateId: string]: number } = {}

  switch (model.model) {
    case "first-click":
      const firstTouch = touchPoints[0]
      attribution[firstTouch.affiliateId] = conversionValue
      break

    case "last-click":
      const lastTouch = touchPoints[touchPoints.length - 1]
      attribution[lastTouch.affiliateId] = conversionValue
      break

    case "linear":
      const linearValue = conversionValue / touchPoints.length
      touchPoints.forEach((touch) => {
        attribution[touch.affiliateId] = (attribution[touch.affiliateId] || 0) + linearValue
      })
      break

    case "time-decay":
      const halfLife = 7 // 7 days half-life
      const now = new Date()
      let totalWeight = 0

      const weights = touchPoints.map((touch) => {
        const daysSince = (now.getTime() - touch.timestamp.getTime()) / (1000 * 60 * 60 * 24)
        const weight = Math.pow(0.5, daysSince / halfLife)
        totalWeight += weight
        return { affiliateId: touch.affiliateId, weight }
      })

      weights.forEach(({ affiliateId, weight }) => {
        const value = (weight / totalWeight) * conversionValue
        attribution[affiliateId] = (attribution[affiliateId] || 0) + value
      })
      break

    case "position-based":
      if (touchPoints.length === 1) {
        attribution[touchPoints[0].affiliateId] = conversionValue
      } else if (touchPoints.length === 2) {
        attribution[touchPoints[0].affiliateId] = conversionValue * 0.5
        attribution[touchPoints[1].affiliateId] = conversionValue * 0.5
      } else {
        // First touch: 40%
        attribution[touchPoints[0].affiliateId] = conversionValue * 0.4

        // Last touch: 40%
        const lastIndex = touchPoints.length - 1
        attribution[touchPoints[lastIndex].affiliateId] =
          (attribution[touchPoints[lastIndex].affiliateId] || 0) + conversionValue * 0.4

        // Middle touches: 20% distributed equally
        const middleTouches = touchPoints.slice(1, -1)
        const middleValue = (conversionValue * 0.2) / middleTouches.length
        middleTouches.forEach((touch) => {
          attribution[touch.affiliateId] = (attribution[touch.affiliateId] || 0) + middleValue
        })
      }
      break
  }

  return attribution
}

export function calculateCohortAnalysis(conversions: ConversionEvent[], periodDays = 30): CohortData[] {
  const cohorts: { [key: string]: CohortData[] } = {}

  conversions.forEach((conversion) => {
    const cohortMonth = new Date(conversion.timestamp.getFullYear(), conversion.timestamp.getMonth(), 1)
    const cohortKey = cohortMonth.toISOString().substring(0, 7) // YYYY-MM

    if (!cohorts[cohortKey]) {
      cohorts[cohortKey] = []
    }

    // Calculate retention for different periods
    for (let period = 0; period <= 12; period++) {
      const periodStart = new Date(cohortMonth)
      periodStart.setMonth(periodStart.getMonth() + period)

      const periodEnd = new Date(periodStart)
      periodEnd.setMonth(periodEnd.getMonth() + 1)

      // In a real implementation, you'd check if the user was still active in this period
      const retained = Math.floor(Math.random() * 100) // Mock data

      cohorts[cohortKey][period] = {
        cohort: cohortKey,
        period,
        users: 100, // Mock data
        retained,
        retentionRate: retained / 100,
        revenue: retained * 50, // Mock revenue per user
        ltv: retained * 50 * (12 - period), // Mock LTV calculation
      }
    }
  })

  return Object.values(cohorts).flat()
}
