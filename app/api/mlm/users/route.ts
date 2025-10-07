import { type NextRequest, NextResponse } from "next/server"
import { mlmDatabaseService } from "@/lib/mlm/database-service"
import { mlmCommissionEngine } from "@/lib/mlm/commission-engine"
import { requireAuth } from "@/lib/auth"
import { withRateLimit } from "@/lib/rate-limiter"

export const GET = withRateLimit(
  requireAuth(async (request: NextRequest, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const targetUserId = searchParams.get("userId") || user.id
      
      console.log('🔍 MLM User API - User ID:', user.id, 'Target User ID:', targetUserId)

      // Get MLM user data from database
      const mlmUser = await mlmDatabaseService.getMLMUser(targetUserId)
      
      if (!mlmUser) {
        return NextResponse.json({ 
          success: false, 
          error: "MLM user not found" 
        }, { status: 404 })
      }

      // Calculate team volume
      const teamVolume = await mlmCommissionEngine.calculateTeamVolume(mlmUser.id)
      
      // Check rank advancement eligibility
      const nextRank = await mlmCommissionEngine.checkRankAdvancement(mlmUser.id)

      // Calculate rank progress
      const rankProgress = nextRank ? {
        personalVolume: (mlmUser.personalVolume / nextRank.requirements.personalVolume) * 100,
        teamVolume: (teamVolume / nextRank.requirements.teamVolume) * 100,
        activeDownlines: (mlmUser.activeDownlines / nextRank.requirements.activeDownlines) * 100,
        qualifiedLegs: (mlmUser.qualifiedLegs / nextRank.requirements.qualifiedLegs) * 100,
      } : {
        personalVolume: 100,
        teamVolume: 100,
        activeDownlines: 100,
        qualifiedLegs: 100,
      }

      return NextResponse.json({
        success: true,
        data: {
          ...mlmUser,
          teamVolume, // Updated team volume
          nextRankAvailable: nextRank,
          rankProgress,
        },
      })
    } catch (error) {
      console.error("MLM user fetch error:", error)
      console.error("Error details:", (error as Error)?.message, (error as Error)?.stack)
      return NextResponse.json({ 
        success: false,
        error: "Failed to fetch MLM user data",
        details: (error as Error)?.message ?? 'Unknown error'
      }, { status: 500 })
    }
  }),
  'general'
)

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, updates } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // In a real app, you would:
    // 1. Validate user permissions
    // 2. Update MLM user data in database
    // 3. Recalculate volumes and commissions
    // 4. Check for rank advancement
    // 5. Send notifications if needed

    return NextResponse.json({
      success: true,
      message: "MLM user data updated successfully",
      data: { ...mockMLMUser, ...updates },
    })
  } catch (error) {
    console.error("MLM user update error:", error)
    return NextResponse.json({ error: "Failed to update MLM user data" }, { status: 500 })
  }
}
