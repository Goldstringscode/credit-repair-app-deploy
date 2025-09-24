import { type NextRequest, NextResponse } from "next/server"
import { industryBenchmarks, calculateCompetitivePosition } from "@/lib/competitor-analysis"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const affiliateId = searchParams.get("affiliateId")
    const metric = searchParams.get("metric")

    if (!affiliateId) {
      return NextResponse.json({ error: "Affiliate ID is required" }, { status: 400 })
    }

    // In a real app, you would:
    // 1. Fetch affiliate's actual performance data from database
    // 2. Calculate competitive positions for all metrics
    // 3. Provide historical trend data
    // 4. Include peer group comparisons

    // Mock affiliate performance data
    const affiliatePerformance = {
      conversion_rate: 3.8,
      commission_rate: 45,
      cookie_duration: 60,
      customer_retention: 75,
      average_order_value: 89,
      monthly_traffic: 450000,
      affiliate_support_rating: 8.8,
    }

    let benchmarks = industryBenchmarks
    if (metric) {
      benchmarks = benchmarks.filter((b) => b.metric === metric)
    }

    const competitivePositions = benchmarks.map((benchmark) => {
      const affiliateValue = affiliatePerformance[benchmark.metric as keyof typeof affiliatePerformance]
      return calculateCompetitivePosition(affiliateValue, benchmark)
    })

    const summary = {
      overallScore: 78,
      percentileRank: 75,
      topPerformingMetrics: competitivePositions.filter((p) => p.percentileRank >= 75).map((p) => p.metric),
      improvementAreas: competitivePositions.filter((p) => p.percentileRank < 50).map((p) => p.metric),
      trendDirection: "improving", // Would be calculated from historical data
    }

    return NextResponse.json({
      success: true,
      data: {
        affiliateId,
        benchmarks,
        competitivePositions,
        summary,
        lastUpdated: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Benchmark analysis error:", error)
    return NextResponse.json({ error: "Failed to fetch benchmark data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { affiliateId, performanceData } = body

    if (!affiliateId || !performanceData) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 })
    }

    // In a real app, you would:
    // 1. Validate and sanitize performance data
    // 2. Store performance metrics in database
    // 3. Trigger benchmark recalculation
    // 4. Update competitive positioning
    // 5. Send alerts if significant changes detected

    const updatedPositions = industryBenchmarks
      .map((benchmark) => {
        const value = performanceData[benchmark.metric]
        if (value !== undefined) {
          return calculateCompetitivePosition(value, benchmark)
        }
        return null
      })
      .filter(Boolean)

    return NextResponse.json({
      success: true,
      data: {
        affiliateId,
        updatedPositions,
        message: "Performance data updated successfully",
      },
    })
  } catch (error) {
    console.error("Performance update error:", error)
    return NextResponse.json({ error: "Failed to update performance data" }, { status: 500 })
  }
}
