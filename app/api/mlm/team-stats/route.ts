import { NextRequest, NextResponse } from "next/server"
import { mlmDatabaseService } from "@/lib/mlm/database-service"
import { withRateLimit } from "@/lib/rate-limiter"

export async function GET(request: NextRequest) {
  return withRateLimit(async (req) => {
    try {
      const { searchParams } = new URL(req.url)
      const userId = searchParams.get('userId')

      if (!userId) {
        return NextResponse.json(
          { success: false, error: "User ID is required" },
          { status: 400 }
        )
      }

      // Get team stats from database service
      const teamStats = await mlmDatabaseService.getTeamStats(userId)

      return NextResponse.json({
        success: true,
        stats: teamStats.overview
      })
    } catch (error) {
      console.error('Error fetching team stats:', error)
      return NextResponse.json(
        { success: false, error: "Failed to fetch team stats" },
        { status: 500 }
      )
    }
  })(request)
}