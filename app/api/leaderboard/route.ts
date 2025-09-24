import { type NextRequest, NextResponse } from "next/server"
import LeaderboardSystem from "@/lib/leaderboard-system"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "all_time"
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const userId = searchParams.get("userId")

    const system = LeaderboardSystem.getInstance()

    if (userId) {
      // Get specific user rank
      const userRank = system.getUserRank(userId, period)
      return NextResponse.json({
        success: true,
        userRank,
      })
    }

    // Get full leaderboard
    const leaderboard = system.getLeaderboard(period, limit)
    const stats = system.getLeaderboardStats()

    return NextResponse.json({
      success: true,
      leaderboard,
      stats,
      period,
      total: leaderboard.length,
    })
  } catch (error) {
    console.error("Leaderboard retrieval error:", error)
    return NextResponse.json({ success: false, error: "Failed to retrieve leaderboard" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, points, category = "custom" } = body

    if (!userId || typeof points !== "number") {
      return NextResponse.json({ success: false, error: "Invalid request data" }, { status: 400 })
    }

    const system = LeaderboardSystem.getInstance()
    const success = system.updateUserPoints(userId, points, category)

    if (!success) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    const updatedRank = system.getUserRank(userId)

    return NextResponse.json({
      success: true,
      message: "Points updated successfully",
      userRank: updatedRank,
    })
  } catch (error) {
    console.error("Leaderboard update error:", error)
    return NextResponse.json({ success: false, error: "Failed to update leaderboard" }, { status: 500 })
  }
}
