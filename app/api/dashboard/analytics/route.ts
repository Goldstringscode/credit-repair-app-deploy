import { NextResponse } from "next/server"
import { creditDataService } from "@/lib/credit-data"

export async function GET() {
  try {
    const userId = "user-123" // Match the user ID used in upload system
    const analytics = await creditDataService.getAnalyticsData(userId)

    return NextResponse.json({
      success: true,
      data: analytics,
    })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch analytics data",
      },
      { status: 500 },
    )
  }
}
