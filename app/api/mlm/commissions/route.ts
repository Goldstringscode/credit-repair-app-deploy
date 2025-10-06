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