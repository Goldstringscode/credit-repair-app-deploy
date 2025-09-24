import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const affiliateId = searchParams.get("affiliateId")
    const period = searchParams.get("period") || "30"

    if (!affiliateId) {
      return NextResponse.json({ error: "Affiliate ID is required" }, { status: 400 })
    }

    // In a real app, you would fetch from database
    // This is mock data for demonstration
    const stats = {
      clicks: {
        total: 1247,
        period: Number.parseInt(period),
        data: [
          { date: "2024-01-01", clicks: 45, conversions: 2 },
          { date: "2024-01-02", clicks: 52, conversions: 1 },
          { date: "2024-01-03", clicks: 38, conversions: 3 },
          { date: "2024-01-04", clicks: 61, conversions: 2 },
          { date: "2024-01-05", clicks: 43, conversions: 1 },
        ],
      },
      conversions: {
        total: 18,
        rate: 0.0144,
        revenue: 2450.0,
      },
      referrals: {
        pending: 4,
        active: 12,
        cancelled: 2,
        total: 18,
      },
      earnings: {
        total: 2450.0,
        pending: 380.0,
        paid: 2070.0,
        nextPayout: "2024-02-15",
      },
    }

    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error("Stats fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
