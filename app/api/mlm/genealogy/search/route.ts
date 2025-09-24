import { type NextRequest, NextResponse } from "next/server"
import { mlmDatabaseService } from "@/lib/mlm/database-service"
import { requireAuth } from "@/lib/auth"
import { withRateLimit } from "@/lib/rate-limiter"

export const GET = withRateLimit(
  requireAuth(async (request: NextRequest, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const query = searchParams.get("q")
      const targetUserId = searchParams.get("userId") || user.id

      if (!query) {
        return NextResponse.json({ 
          success: false,
          error: "Search query is required" 
        }, { status: 400 })
      }

      // Search for team members by name or email
      const searchResults = await mlmDatabaseService.searchTeamMembers(targetUserId, query)

      return NextResponse.json({
        success: true,
        data: searchResults,
        query,
        count: searchResults.length
      })
    } catch (error) {
      console.error("Team search error:", error)
      return NextResponse.json({ 
        success: false,
        error: "Failed to search team members" 
      }, { status: 500 })
    }
  }),
  'general'
)
