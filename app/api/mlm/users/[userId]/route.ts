import { NextRequest, NextResponse } from "next/server"
import { mlmDatabaseService } from "@/lib/mlm/database-service"
import { withRateLimit } from "@/lib/rate-limiter"

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  return withRateLimit(async (req) => {
    try {
      // For development, we'll allow access to any user data
      // In production, this would verify proper authentication
      const { userId } = params

      const mlmUser = await mlmDatabaseService.getMLMUser(userId)
      
      if (!mlmUser) {
        return NextResponse.json(
          { success: false, error: "MLM user not found" },
          { status: 404 }
        )
      }

      // Check if user is team leader (no sponsor)
      const isTeamLeader = !mlmUser.sponsorId

      const userData = {
        id: mlmUser.id,
        teamCode: mlmUser.teamCode || 'DEMO123',
        sponsorId: mlmUser.sponsorId,
        rank: {
          id: mlmUser.rank.id,
          name: mlmUser.rank.name,
          level: mlmUser.rank.level,
          requirements: {
            personalVolume: mlmUser.rank.requirements.personalVolume,
            teamVolume: mlmUser.rank.requirements.teamVolume,
            directRecruits: mlmUser.rank.requirements.activeDownlines
          }
        },
        status: mlmUser.status,
        personalVolume: mlmUser.personalVolume,
        teamVolume: mlmUser.teamVolume,
        currentMonthEarnings: mlmUser.currentMonthEarnings,
        joinDate: mlmUser.joinDate.toISOString(),
        downlineCount: mlmUser.totalDownlines,
        isTeamLeader
      }

      return NextResponse.json({
        success: true,
        user: userData
      })
    } catch (error) {
      console.error('Error fetching MLM user:', error)
      return NextResponse.json(
        { success: false, error: "Failed to fetch MLM user" },
        { status: 500 }
      )
    }
  })(request)
}
