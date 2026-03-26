import { NextRequest, NextResponse } from "next/server"
import { mlmDatabaseService } from "@/lib/mlm/database-service"
import { withRateLimit } from "@/lib/rate-limiter"
import { getAuthenticatedUser } from "@/lib/auth-helpers"

export async function GET(request: NextRequest) {
  return withRateLimit(async (req) => {
    try {
      const user = getAuthenticatedUser(req)
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        )
      }

      const userId = user.userId

      // Get commissions from database service
      const commissions = await mlmDatabaseService.getCommissions(userId)

      // Transform commissions to match dashboard format
      const formattedCommissions = commissions.map(comm => ({
        id: comm.id,
        type: comm.type,
        amount: comm.amount,
        description: `${comm.type.replace('_', ' ')} commission`,
        date: comm.createdAt.toISOString(),
        status: comm.status
      }))

      return NextResponse.json({
        success: true,
        commissions: formattedCommissions
      })
    } catch (error) {
      console.error('Error fetching commissions:', error)
      return NextResponse.json(
        { success: false, error: "Failed to fetch commissions" },
        { status: 500 }
      )
    }
  })(request)
}