import { type NextRequest, NextResponse } from "next/server"
import { competitors, getCompetitorsByCategory, getTopPerformers } from "@/lib/competitor-analysis"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const metric = searchParams.get("metric")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    let filteredCompetitors = competitors

    if (category && category !== "all") {
      filteredCompetitors = getCompetitorsByCategory(category)
    }

    if (metric) {
      filteredCompetitors = getTopPerformers(metric as any, limit)
    }

    // Calculate competitive insights
    const insights = {
      totalCompetitors: competitors.length,
      directCompetitors: competitors.filter((c) => c.category === "direct").length,
      indirectCompetitors: competitors.filter((c) => c.category === "indirect").length,
      averageCommissionRate:
        competitors.reduce((sum, c) => sum + c.affiliateProgram.commissionRate, 0) / competitors.length,
      averageConversionRate: competitors.reduce((sum, c) => sum + c.performance.conversionRate, 0) / competitors.length,
      topPerformersByMetric: {
        conversionRate: getTopPerformers("conversionRate", 3),
        marketShare: getTopPerformers("marketShare" as any, 3),
        brandStrength: getTopPerformers("brandStrength", 3),
      },
    }

    const marketAnalysis = {
      competitiveIntensity: "High",
      barrierToEntry: "Medium",
      marketConcentration: "Moderate", // Based on top 4 players having ~60% share
      innovationLevel: "Medium",
      priceCompetition: "High",
    }

    return NextResponse.json({
      success: true,
      data: {
        competitors: filteredCompetitors,
        insights,
        marketAnalysis,
        lastUpdated: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Competitor analysis error:", error)
    return NextResponse.json({ error: "Failed to fetch competitor data" }, { status: 500 })
  }
}
