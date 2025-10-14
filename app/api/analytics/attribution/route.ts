import { type NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'
import { calculateAttribution, attributionModels } from "@/lib/analytics"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const affiliateId = searchParams.get("affiliateId")
    const model = searchParams.get("model") || "last-click"
    const period = searchParams.get("period") || "30"

    if (!affiliateId) {
      return NextResponse.json({ error: "Affiliate ID is required" }, { status: 400 })
    }

    // In a real app, you would:
    // 1. Query touchpoint data from database
    // 2. Apply attribution model calculations
    // 3. Group by traffic sources
    // 4. Calculate revenue attribution

    const mockTouchPoints = [
      {
        id: "tp_1",
        affiliateId,
        referralCode: "CREDITPRO2024",
        timestamp: new Date("2024-01-15"),
        source: "google-ads",
        medium: "cpc",
        campaign: "credit-repair",
        content: "hero-banner",
        userAgent: "Mozilla/5.0...",
        ip: "192.168.1.1",
        sessionId: "sess_123",
        pageUrl: "https://creditrepair.com/landing",
        referrer: "https://google.com",
      },
      // More touchpoints...
    ]

    const selectedModel = attributionModels.find((m) => m.model === model)
    if (!selectedModel) {
      return NextResponse.json({ error: "Invalid attribution model" }, { status: 400 })
    }

    const attribution = calculateAttribution(mockTouchPoints, selectedModel, 3375)

    const attributionData = {
      model: selectedModel,
      totalConversions: 45,
      totalRevenue: 3375,
      totalCommission: 1012.5,
      touchpoints: [
        { source: "Google Ads", conversions: 18, revenue: 1350, percentage: 40 },
        { source: "Facebook", conversions: 12, revenue: 900, percentage: 26.7 },
        { source: "Email", conversions: 8, revenue: 600, percentage: 17.8 },
        { source: "Direct", conversions: 7, revenue: 525, percentage: 15.5 },
      ],
      customerJourneys: [
        {
          journey: "Google Ads → Email → Direct",
          conversions: 12,
          percentage: 26.7,
          avgTouchpoints: 3,
          avgTimeToConvert: 14,
          revenue: 900,
        },
        // More journeys...
      ],
    }

    return NextResponse.json({
      success: true,
      data: attributionData,
    })
  } catch (error) {
    console.error("Attribution analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch attribution data" }, { status: 500 })
  }
}
