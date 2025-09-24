import { type NextRequest, NextResponse } from "next/server"

interface CohortPeriod {
  period: number
  activeUsers: number
  retentionRate: number
  revenue: number
  avgRevenue: number
  churnedUsers: number
  newRevenue: number
}

interface CohortData {
  cohortMonth: string
  cohortSize: number
  periods: CohortPeriod[]
  ltv: {
    current: number
    predicted: number
    confidence: number
  }
  segments: {
    highValue: number
    mediumValue: number
    lowValue: number
    atRisk: number
  }
}

interface RetentionData {
  cohorts: CohortData[]
  ltvAnalysis: {
    averageLTV: number
    ltvByTier: {
      basic: number
      premium: number
      enterprise: number
    }
    churnImpact: number
    potentialLTV: number
    mlmBonus: number
  }
  segmentAnalysis: {
    byTier: {
      basic: number
      premium: number
      enterprise: number
    }
    byStatus: {
      active: number
      churned: number
      paused: number
    }
    byReferrals: {
      none: number
      low: number
      medium: number
      high: number
    }
  }
  summary: {
    totalUsers: number
    activeUsers: number
    avgLTV: number
    retentionRate: number
    churnRate: number
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cohortMonth = searchParams.get("cohortMonth")
    const period = Number.parseInt(searchParams.get("period") || "12")

    // Mock data generation for demonstration
    const mockCohorts: CohortData[] = [
      {
        cohortMonth: "2024-07",
        cohortSize: 245,
        periods: generateMockPeriods(245, 12),
        ltv: { current: 456.75, predicted: 523.4, confidence: 87 },
        segments: { highValue: 45, mediumValue: 89, lowValue: 78, atRisk: 33 },
      },
      {
        cohortMonth: "2024-06",
        cohortSize: 198,
        periods: generateMockPeriods(198, 12),
        ltv: { current: 423.2, predicted: 489.15, confidence: 92 },
        segments: { highValue: 38, mediumValue: 72, lowValue: 65, atRisk: 23 },
      },
      {
        cohortMonth: "2024-05",
        cohortSize: 312,
        periods: generateMockPeriods(312, 12),
        ltv: { current: 512.8, predicted: 578.25, confidence: 94 },
        segments: { highValue: 67, mediumValue: 124, lowValue: 89, atRisk: 32 },
      },
      {
        cohortMonth: "2024-04",
        cohortSize: 189,
        periods: generateMockPeriods(189, 12),
        ltv: { current: 398.45, predicted: 445.3, confidence: 89 },
        segments: { highValue: 32, mediumValue: 68, lowValue: 59, atRisk: 30 },
      },
      {
        cohortMonth: "2024-03",
        cohortSize: 267,
        periods: generateMockPeriods(267, 12),
        ltv: { current: 467.9, predicted: 521.85, confidence: 91 },
        segments: { highValue: 54, mediumValue: 98, lowValue: 82, atRisk: 33 },
      },
      {
        cohortMonth: "2024-02",
        cohortSize: 156,
        periods: generateMockPeriods(156, 12),
        ltv: { current: 389.25, predicted: 432.7, confidence: 85 },
        segments: { highValue: 28, mediumValue: 56, lowValue: 48, atRisk: 24 },
      },
    ]

    const retentionData: RetentionData = {
      cohorts: mockCohorts,
      ltvAnalysis: {
        averageLTV: 456.75,
        ltvByTier: {
          basic: 234.5,
          premium: 567.8,
          enterprise: 892.4,
        },
        churnImpact: 125.3,
        potentialLTV: 578.9,
        mlmBonus: 89.45,
      },
      segmentAnalysis: {
        byTier: {
          basic: 456,
          premium: 623,
          enterprise: 168,
        },
        byStatus: {
          active: 892,
          churned: 234,
          paused: 121,
        },
        byReferrals: {
          none: 345,
          low: 423,
          medium: 267,
          high: 212,
        },
      },
      summary: {
        totalUsers: 1247,
        activeUsers: 892,
        avgLTV: 456.75,
        retentionRate: 71.5,
        churnRate: 18.8,
      },
    }

    return NextResponse.json({
      success: true,
      data: retentionData,
    })
  } catch (error) {
    console.error("Cohort analysis error:", error)
    return NextResponse.json({ success: false, error: "Failed to load cohort data" }, { status: 500 })
  }
}

function generateMockPeriods(cohortSize: number, periods: number): CohortPeriod[] {
  const mockPeriods: CohortPeriod[] = []
  let remainingUsers = cohortSize

  for (let i = 0; i < periods; i++) {
    // Simulate natural retention decay
    const retentionRate = Math.max(20, 100 * Math.pow(0.85, i) + Math.random() * 10 - 5)
    const activeUsers = Math.floor(remainingUsers * (retentionRate / 100))
    const churnedUsers = remainingUsers - activeUsers
    const avgRevenue = 45 + Math.random() * 20
    const revenue = activeUsers * avgRevenue
    const newRevenue = Math.floor(activeUsers * 0.1) * avgRevenue

    mockPeriods.push({
      period: i,
      activeUsers,
      retentionRate: Math.round(retentionRate * 10) / 10,
      revenue: Math.round(revenue * 100) / 100,
      avgRevenue: Math.round(avgRevenue * 100) / 100,
      churnedUsers,
      newRevenue: Math.round(newRevenue * 100) / 100,
    })

    remainingUsers = activeUsers
  }

  return mockPeriods
}
