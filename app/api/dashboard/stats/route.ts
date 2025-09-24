import { NextResponse } from "next/server"
import { creditDataService } from "@/lib/credit-data"

export async function GET() {
  try {
    const userId = "user-123" // Match the user ID used in upload system
    const stats = await creditDataService.getDashboardStats(userId)

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("Dashboard stats API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard stats",
      },
      { status: 500 },
    )
  }
}
