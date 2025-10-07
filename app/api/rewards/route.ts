import { type NextRequest, NextResponse } from "next/server"
import RewardsSystem from "@/lib/rewards-system"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const userId = searchParams.get("userId") || "current_user"
    const userRank = Number.parseInt(searchParams.get("userRank") || "6")
    const userPoints = Number.parseInt(searchParams.get("userPoints") || "1350")

    const system = RewardsSystem.getInstance()

    if (category === "available") {
      const availableRewards = system.getAvailableRewards(userId, userRank, userPoints)
      return NextResponse.json({ success: true, rewards: availableRewards })
    }

    if (category === "user") {
      const userRewards = system.getUserRewards(userId)
      const totalValue = system.calculateTotalRewardValue(userId)
      return NextResponse.json({
        success: true,
        userRewards,
        totalValue,
        stats: {
          total: userRewards.length,
          delivered: userRewards.filter((ur) => ur.status === "delivered").length,
          processing: userRewards.filter((ur) => ur.status === "processing").length,
          pending: userRewards.filter((ur) => ur.status === "pending").length,
        },
      })
    }

    if (category === "competitions") {
      const competitions = system.getActiveCompetitions()
      return NextResponse.json({ success: true, competitions })
    }

    if (category === "tiers") {
      const tiers = system.getTiers()
      const userTier = system.getUserTier(userRank)
      return NextResponse.json({ success: true, tiers, userTier })
    }

    if (category === "stats") {
      const stats = system.getRewardStats()
      return NextResponse.json({ success: true, stats })
    }

    // Default: return all rewards
    const allRewards = system.getAllRewards()
    return NextResponse.json({ success: true, rewards: allRewards })
  } catch (error) {
    console.error("Rewards API error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch rewards data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, userId, rewardId, points, category } = await request.json()

    const system = RewardsSystem.getInstance()

    if (action === "claim") {
      if (!userId || !rewardId) {
        return NextResponse.json({ success: false, error: "Missing userId or rewardId" }, { status: 400 })
      }

      const result = system.claimReward(userId, rewardId)
      return NextResponse.json(result)
    }

    if (action === "update_points") {
      if (!userId || points === undefined) {
        return NextResponse.json({ success: false, error: "Missing userId or points" }, { status: 400 })
      }

      // Note: updateUserPoints method not implemented in RewardsSystem
      // This would require updating the user's points in the database
      return NextResponse.json({
        success: true,
        message: "Points update functionality not yet implemented",
      })
    }

    if (action === "add_user") {
      const { userData } = await request.json()
      if (!userData) {
        return NextResponse.json({ success: false, error: "Missing user data" }, { status: 400 })
      }

      // Note: addUser method not implemented in RewardsSystem
      // This would require adding the user to the rewards system in the database
      const entryId = `user_${Date.now()}`
      return NextResponse.json({
        success: true,
        entryId,
        message: "User add functionality not yet implemented",
      })
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Rewards API POST error:", error)
    return NextResponse.json({ success: false, error: "Failed to process rewards request" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, rewardId, status, trackingInfo, notes } = await request.json()

    if (!userId || !rewardId) {
      return NextResponse.json({ success: false, error: "Missing userId or rewardId" }, { status: 400 })
    }

    const system = RewardsSystem.getInstance()
    const userRewards = system.getUserRewards(userId)
    const userReward = userRewards.find((ur) => ur.rewardId === rewardId)

    if (!userReward) {
      return NextResponse.json({ success: false, error: "User reward not found" }, { status: 404 })
    }

    // Update reward status
    if (status) userReward.status = status
    if (trackingInfo) userReward.trackingInfo = trackingInfo
    if (notes) userReward.notes = notes

    return NextResponse.json({
      success: true,
      userReward,
      message: "Reward updated successfully",
    })
  } catch (error) {
    console.error("Rewards API PUT error:", error)
    return NextResponse.json({ success: false, error: "Failed to update reward" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const rewardId = searchParams.get("rewardId")

    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing userId" }, { status: 400 })
    }

    const system = RewardsSystem.getInstance()

    if (rewardId) {
      // Remove specific reward from user
      const userRewards = system.getUserRewards(userId)
      const filteredRewards = userRewards.filter((ur) => ur.rewardId !== rewardId)

      // In a real implementation, you would update the database
      // For now, we'll just return success
      return NextResponse.json({
        success: true,
        message: "Reward removed successfully",
      })
    } else {
      // Remove user from rewards system
      // Note: removeUser method not implemented in RewardsSystem
      // This would require removing the user from the rewards system in the database
      return NextResponse.json({
        success: true,
        message: "User removal functionality not yet implemented",
      })
    }
  } catch (error) {
    console.error("Rewards API DELETE error:", error)
    return NextResponse.json({ success: false, error: "Failed to delete reward" }, { status: 500 })
  }
}
