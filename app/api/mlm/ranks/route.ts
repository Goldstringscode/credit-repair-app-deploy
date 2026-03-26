import { type NextRequest, NextResponse } from "next/server"
import { mlmRanks, calculateRankAdvancement } from "@/lib/mlm-system"
import { mlmDatabaseService } from "@/lib/mlm/database-service"
import { getAuthenticatedUser } from "@/lib/auth-helpers"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const requestedUserId = searchParams.get("userId")

    // Prefer the authenticated user's ID; fall back to query param if provided
    const authUser = getAuthenticatedUser(request)
    const userId = authUser?.userId ?? requestedUserId

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const user = await mlmDatabaseService.getMLMUser(userId)
    if (!user) {
      return NextResponse.json({ error: "MLM user not found" }, { status: 404 })
    }

    const nextRank = calculateRankAdvancement(user)
    const currentRankIndex = mlmRanks.findIndex((rank) => rank.id === user.rank.id)

    const rankProgress = {
      currentRank: user.rank,
      nextRank,
      allRanks: mlmRanks,
      progress: {
        personalVolume: nextRank ? (user.personalVolume / nextRank.requirements.personalVolume) * 100 : 100,
        teamVolume: nextRank ? (user.teamVolume / nextRank.requirements.teamVolume) * 100 : 100,
        activeDownlines: nextRank ? (user.activeDownlines / nextRank.requirements.activeDownlines) * 100 : 100,
        qualifiedLegs: nextRank ? (user.qualifiedLegs / nextRank.requirements.qualifiedLegs) * 100 : 100,
      },
      rankIndex: currentRankIndex,
      totalRanks: mlmRanks.length,
    }

    return NextResponse.json({ success: true, data: rankProgress })
  } catch (error) {
    console.error("Error fetching rank data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, newRankId } = body

    if (!userId || !newRankId) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 })
    }

    // In a real app, you would:
    // 1. Validate rank advancement eligibility
    // 2. Update user rank in database
    // 3. Calculate rank advancement bonus
    // 4. Send congratulations notification
    // 5. Update team notifications
    // 6. Log rank advancement event

    const newRank = mlmRanks.find((rank) => rank.id === newRankId)
    if (!newRank) {
      return NextResponse.json({ error: "Invalid rank ID" }, { status: 400 })
    }

    // Calculate rank advancement bonus
    const rankBonus = newRank.level * 1000 // Example: $1000 per level

    return NextResponse.json({
      success: true,
      message: `Congratulations! You've advanced to ${newRank.name}!`,
      data: {
        newRank,
        rankBonus,
        advancementDate: new Date().toISOString(),
        benefits: newRank.benefits,
      },
    })
  } catch (error) {
    console.error("Rank advancement error:", error)
    return NextResponse.json({ error: "Failed to process rank advancement" }, { status: 500 })
  }
}
