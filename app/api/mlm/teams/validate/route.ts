import { NextRequest, NextResponse } from "next/server"
import { mlmDatabaseService } from "@/lib/mlm/database-service"
import { withRateLimit } from "@/lib/rate-limiter"

export async function GET(request: NextRequest) {
  return withRateLimit(async (req) => {
    try {
      const { searchParams } = new URL(req.url)
      const teamCode = searchParams.get('code')

      if (!teamCode) {
        return NextResponse.json({
          success: false,
          error: "Team code is required"
        }, { status: 400 })
      }

      // Get team information
      const teamInfo = await mlmDatabaseService.getTeamByCode(teamCode)

      if (!teamInfo) {
        return NextResponse.json({
          success: false,
          error: "Team code not found"
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        team: {
          teamCode: teamInfo.team_code,
          teamName: teamInfo.team_name || `Team ${teamInfo.team_code}`,
          sponsorName: teamInfo.sponsor_name,
          memberCount: teamInfo.member_count || 0,
          teamRank: teamInfo.team_rank || 'Bronze'
        }
      })
    } catch (error) {
      console.error('Error validating team code:', error)
      return NextResponse.json({
        success: false,
        error: "Failed to validate team code"
      }, { status: 500 })
    }
  })(request)
}
