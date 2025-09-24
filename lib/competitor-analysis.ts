export interface CompetitorData {
  id: string
  name: string
  domain: string
  category: "direct" | "indirect" | "adjacent"
  marketShare: number
  affiliateProgram: {
    commissionRate: number
    cookieDuration: number
    paymentTerms: string
    minPayout: number
    supportQuality: number
  }
  performance: {
    trafficRank: number
    monthlyVisitors: number
    conversionRate: number
    averageOrderValue: number
    customerRetention: number
    brandStrength: number
  }
  strengths: string[]
  weaknesses: string[]
  lastUpdated: Date
}

export interface IndustryBenchmark {
  metric: string
  category: string
  percentile25: number
  percentile50: number
  percentile75: number
  percentile90: number
  average: number
  unit: string
  description: string
  source: string
  lastUpdated: Date
}

export interface CompetitivePosition {
  metric: string
  yourValue: number
  industryAverage: number
  topPerformer: number
  percentileRank: number
  gap: number
  trend: "improving" | "declining" | "stable"
  recommendation: string
}

export interface MarketIntelligence {
  marketSize: number
  growthRate: number
  keyTrends: string[]
  opportunities: string[]
  threats: string[]
  regulatoryChanges: string[]
  seasonalPatterns: {
    month: string
    multiplier: number
    reason: string
  }[]
}

export const competitors: CompetitorData[] = [
  {
    id: "lexington-law",
    name: "Lexington Law",
    domain: "lexingtonlaw.com",
    category: "direct",
    marketShare: 25.3,
    affiliateProgram: {
      commissionRate: 35,
      cookieDuration: 30,
      paymentTerms: "Net 30",
      minPayout: 50,
      supportQuality: 8.5,
    },
    performance: {
      trafficRank: 1250,
      monthlyVisitors: 2800000,
      conversionRate: 3.2,
      averageOrderValue: 89,
      customerRetention: 68,
      brandStrength: 85,
    },
    strengths: [
      "Strong brand recognition",
      "Extensive marketing budget",
      "Established affiliate network",
      "Legal expertise",
    ],
    weaknesses: [
      "Higher pricing",
      "Complex onboarding",
      "Limited technology innovation",
      "Customer service complaints",
    ],
    lastUpdated: new Date("2024-01-15"),
  },
  {
    id: "credit-saint",
    name: "Credit Saint",
    domain: "creditsaint.com",
    category: "direct",
    marketShare: 18.7,
    affiliateProgram: {
      commissionRate: 40,
      cookieDuration: 45,
      paymentTerms: "Net 15",
      minPayout: 25,
      supportQuality: 9.2,
    },
    performance: {
      trafficRank: 2100,
      monthlyVisitors: 1900000,
      conversionRate: 4.1,
      averageOrderValue: 79,
      customerRetention: 72,
      brandStrength: 78,
    },
    strengths: [
      "High conversion rates",
      "Excellent affiliate support",
      "Competitive pricing",
      "Strong customer satisfaction",
    ],
    weaknesses: [
      "Smaller market presence",
      "Limited brand awareness",
      "Fewer marketing channels",
      "Resource constraints",
    ],
    lastUpdated: new Date("2024-01-15"),
  },
  {
    id: "sky-blue",
    name: "Sky Blue Credit",
    domain: "skyblue.com",
    category: "direct",
    marketShare: 12.4,
    affiliateProgram: {
      commissionRate: 25,
      cookieDuration: 60,
      paymentTerms: "Net 45",
      minPayout: 100,
      supportQuality: 7.8,
    },
    performance: {
      trafficRank: 3500,
      monthlyVisitors: 1200000,
      conversionRate: 2.8,
      averageOrderValue: 69,
      customerRetention: 65,
      brandStrength: 72,
    },
    strengths: ["Affordable pricing", "Simple process", "Good customer reviews", "Long cookie duration"],
    weaknesses: [
      "Lower commission rates",
      "Slower payment terms",
      "Limited marketing materials",
      "Basic technology platform",
    ],
    lastUpdated: new Date("2024-01-15"),
  },
  {
    id: "credit-karma",
    name: "Credit Karma",
    domain: "creditkarma.com",
    category: "indirect",
    marketShare: 35.2,
    affiliateProgram: {
      commissionRate: 15,
      cookieDuration: 7,
      paymentTerms: "Net 60",
      minPayout: 500,
      supportQuality: 6.5,
    },
    performance: {
      trafficRank: 85,
      monthlyVisitors: 45000000,
      conversionRate: 1.2,
      averageOrderValue: 0, // Free service
      customerRetention: 85,
      brandStrength: 95,
    },
    strengths: ["Massive user base", "Strong brand trust", "Free service model", "Comprehensive credit tools"],
    weaknesses: ["Low commission rates", "Short cookie duration", "High competition", "Different business model"],
    lastUpdated: new Date("2024-01-15"),
  },
]

export const industryBenchmarks: IndustryBenchmark[] = [
  {
    metric: "conversion_rate",
    category: "affiliate_marketing",
    percentile25: 1.8,
    percentile50: 2.5,
    percentile75: 3.8,
    percentile90: 5.2,
    average: 3.1,
    unit: "%",
    description: "Percentage of visitors who convert to paid customers",
    source: "Credit Repair Industry Report 2024",
    lastUpdated: new Date("2024-01-01"),
  },
  {
    metric: "commission_rate",
    category: "affiliate_programs",
    percentile25: 25,
    percentile50: 35,
    percentile75: 45,
    percentile90: 60,
    average: 38,
    unit: "%",
    description: "Commission percentage paid to affiliates",
    source: "Affiliate Marketing Benchmark Study",
    lastUpdated: new Date("2024-01-01"),
  },
  {
    metric: "cookie_duration",
    category: "affiliate_programs",
    percentile25: 30,
    percentile50: 45,
    percentile75: 60,
    percentile90: 90,
    average: 48,
    unit: "days",
    description: "Cookie tracking duration for affiliate attribution",
    source: "Affiliate Network Analysis",
    lastUpdated: new Date("2024-01-01"),
  },
  {
    metric: "customer_retention",
    category: "business_performance",
    percentile25: 55,
    percentile50: 68,
    percentile75: 78,
    percentile90: 85,
    average: 69,
    unit: "%",
    description: "Percentage of customers retained after 12 months",
    source: "Credit Services Retention Study",
    lastUpdated: new Date("2024-01-01"),
  },
  {
    metric: "average_order_value",
    category: "business_performance",
    percentile25: 65,
    percentile50: 79,
    percentile75: 95,
    percentile90: 125,
    average: 84,
    unit: "$",
    description: "Average revenue per customer acquisition",
    source: "Credit Repair Pricing Analysis",
    lastUpdated: new Date("2024-01-01"),
  },
  {
    metric: "monthly_traffic",
    category: "marketing_performance",
    percentile25: 50000,
    percentile50: 250000,
    percentile75: 850000,
    percentile90: 2500000,
    average: 680000,
    unit: "visitors",
    description: "Monthly website visitors",
    source: "Web Analytics Benchmark",
    lastUpdated: new Date("2024-01-01"),
  },
  {
    metric: "affiliate_support_rating",
    category: "affiliate_programs",
    percentile25: 6.5,
    percentile50: 7.8,
    percentile75: 8.5,
    percentile90: 9.2,
    average: 7.9,
    unit: "/10",
    description: "Affiliate satisfaction with program support",
    source: "Affiliate Satisfaction Survey",
    lastUpdated: new Date("2024-01-01"),
  },
]

export const marketIntelligence: MarketIntelligence = {
  marketSize: 4200000000, // $4.2B
  growthRate: 8.5,
  keyTrends: [
    "AI-powered credit analysis gaining traction",
    "Mobile-first customer experience becoming standard",
    "Regulatory compliance automation increasing",
    "Subscription-based pricing models growing",
    "Integration with financial wellness platforms",
    "Personalized credit improvement strategies",
  ],
  opportunities: [
    "Underserved millennial and Gen Z markets",
    "Small business credit repair services",
    "International market expansion",
    "White-label solutions for financial institutions",
    "Educational content monetization",
    "Credit monitoring integration",
  ],
  threats: [
    "Increased regulatory scrutiny",
    "Big tech companies entering market",
    "Economic downturn reducing demand",
    "Free credit monitoring services",
    "DIY credit repair education",
    "Consolidation of major players",
  ],
  regulatoryChanges: [
    "CFPB increased oversight of credit repair companies",
    "New state-level licensing requirements",
    "Enhanced disclosure requirements for fees",
    "Stricter advertising guidelines",
    "Data privacy regulations (CCPA, GDPR)",
  ],
  seasonalPatterns: [
    { month: "January", multiplier: 1.35, reason: "New Year financial resolutions" },
    { month: "February", multiplier: 1.15, reason: "Tax season preparation" },
    { month: "March", multiplier: 1.25, reason: "Spring home buying season" },
    { month: "April", multiplier: 1.1, reason: "Tax refund spending" },
    { month: "May", multiplier: 0.95, reason: "Spring/summer activities" },
    { month: "June", multiplier: 0.9, reason: "Vacation season begins" },
    { month: "July", multiplier: 0.85, reason: "Summer vacation peak" },
    { month: "August", multiplier: 0.88, reason: "Back-to-school expenses" },
    { month: "September", multiplier: 1.05, reason: "Fall financial planning" },
    { month: "October", multiplier: 1.2, reason: "Holiday preparation" },
    { month: "November", multiplier: 1.3, reason: "Black Friday promotions" },
    { month: "December", multiplier: 0.95, reason: "Holiday spending focus" },
  ],
}

export function calculateCompetitivePosition(yourValue: number, benchmark: IndustryBenchmark): CompetitivePosition {
  const percentileRank = calculatePercentileRank(yourValue, benchmark)
  const gap = yourValue - benchmark.average
  const gapPercentage = (gap / benchmark.average) * 100

  let trend: "improving" | "declining" | "stable" = "stable"
  // In real implementation, this would be calculated from historical data
  if (Math.random() > 0.6) trend = "improving"
  else if (Math.random() < 0.3) trend = "declining"

  const recommendation = generateRecommendation(percentileRank, benchmark.metric, gapPercentage)

  return {
    metric: benchmark.metric,
    yourValue,
    industryAverage: benchmark.average,
    topPerformer: benchmark.percentile90,
    percentileRank,
    gap,
    trend,
    recommendation,
  }
}

function calculatePercentileRank(value: number, benchmark: IndustryBenchmark): number {
  if (value <= benchmark.percentile25) return 25
  if (value <= benchmark.percentile50) return 50
  if (value <= benchmark.percentile75) return 75
  if (value <= benchmark.percentile90) return 90
  return 95
}

function generateRecommendation(percentileRank: number, metric: string, gapPercentage: number): string {
  const recommendations: { [key: string]: { [key: number]: string } } = {
    conversion_rate: {
      25: "Focus on landing page optimization and A/B testing to improve conversion rates",
      50: "Implement advanced targeting and personalization to boost conversions",
      75: "Maintain current performance and test incremental improvements",
      90: "Share best practices and consider expanding successful strategies",
    },
    commission_rate: {
      25: "Consider increasing commission rates to attract top-performing affiliates",
      50: "Evaluate competitive positioning and adjust rates strategically",
      75: "Current rates are competitive, focus on other value propositions",
      90: "Excellent rates - leverage this advantage in affiliate recruitment",
    },
    customer_retention: {
      25: "Implement customer success programs and improve onboarding experience",
      50: "Develop loyalty programs and enhance customer support",
      75: "Focus on premium service offerings and customer expansion",
      90: "Excellent retention - use as competitive advantage in marketing",
    },
  }

  const metricRecommendations = recommendations[metric]
  if (!metricRecommendations) {
    return gapPercentage > 0
      ? "Performance above average - maintain current strategies"
      : "Performance below average - analyze top performers and implement improvements"
  }

  return metricRecommendations[percentileRank] || metricRecommendations[75]
}

export function getCompetitorsByCategory(category?: string): CompetitorData[] {
  if (!category) return competitors
  return competitors.filter((c) => c.category === category)
}

export function getTopPerformers(metric: keyof CompetitorData["performance"], limit = 3): CompetitorData[] {
  return competitors.sort((a, b) => b.performance[metric] - a.performance[metric]).slice(0, limit)
}

export function calculateMarketOpportunity(
  yourPerformance: any,
  competitors: CompetitorData[],
): {
  totalMarketSize: number
  yourMarketShare: number
  growthPotential: number
  competitiveGaps: string[]
  recommendations: string[]
} {
  const totalMarketSize = marketIntelligence.marketSize
  const totalCompetitorShare = competitors.reduce((sum, c) => sum + c.marketShare, 0)
  const yourMarketShare = Math.max(0, 100 - totalCompetitorShare)

  const growthPotential = (marketIntelligence.growthRate / 100) * totalMarketSize

  const competitiveGaps = [
    "Mobile-first experience optimization",
    "AI-powered credit analysis tools",
    "Subscription pricing flexibility",
    "Educational content library",
    "Real-time credit monitoring",
  ]

  const recommendations = [
    "Focus on underserved millennial market segment",
    "Develop mobile app with enhanced UX",
    "Create educational content marketing strategy",
    "Implement AI-driven personalization",
    "Expand affiliate program with competitive rates",
  ]

  return {
    totalMarketSize,
    yourMarketShare,
    growthPotential,
    competitiveGaps,
    recommendations,
  }
}
