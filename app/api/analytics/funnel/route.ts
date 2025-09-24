import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const affiliateId = searchParams.get("affiliateId")
    const period = searchParams.get("period") || "30"

    if (!affiliateId) {
      return NextResponse.json({ error: "Affiliate ID is required" }, { status: 400 })
    }

    // In a real app, you would:
    // 1. Query database for conversion events
    // 2. Calculate funnel metrics for each step
    // 3. Apply date filters based on period
    // 4. Return structured funnel data

    const funnelData = [
      {
        step: "visit",
        visitors: 2450,
        conversions: 2450,
        conversionRate: 100,
        dropoffRate: 0,
        revenue: 0,
        averageTimeToConvert: 0,
      },
      {
        step: "signup",
        visitors: 2450,
        conversions: 892,
        conversionRate: 36.4,
        dropoffRate: 63.6,
        revenue: 0,
        averageTimeToConvert: 0.5,
      },
      {
        step: "trial",
        visitors: 892,
        conversions: 634,
        conversionRate: 71.1,
        dropoffRate: 28.9,
        revenue: 0,
        averageTimeToConvert: 2.3,
      },
      {
        step: "subscription",
        visitors: 634,
        conversions: 187,
        conversionRate: 29.5,
        dropoffRate: 70.5,
        revenue: 14025,
        averageTimeToConvert: 7.2,
      },
      {
        step: "retention",
        visitors: 187,
        conversions: 156,
        conversionRate: 83.4,
        dropoffRate: 16.6,
        revenue: 11700,
        averageTimeToConvert: 30,
      },
    ]

    return NextResponse.json({
      success: true,
      data: {
        affiliateId,
        period: Number.parseInt(period),
        funnel: funnelData,
        insights: [
          "Signup conversion rate (36.4%) is above industry average",
          "Trial-to-paid conversion needs improvement",
          "Strong retention indicates good product-market fit",
          "Focus on month 3 engagement to reduce churn",
        ],
      },
    })
  } catch (error) {
    console.error("Funnel analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch funnel data" }, { status: 500 })
  }
}
