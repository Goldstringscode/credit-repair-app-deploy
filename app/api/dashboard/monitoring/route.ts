import { NextResponse } from "next/server"
import { creditDataService } from "@/lib/credit-data"

export async function GET() {
  try {
    const userId = "user-123" // Match the user ID used in upload system
    const monitoring = await creditDataService.getMonitoringData(userId)

    return NextResponse.json({
      success: true,
      data: monitoring,
    })
  } catch (error) {
    console.error("Monitoring API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch monitoring data",
      },
      { status: 500 },
    )
  }
}
