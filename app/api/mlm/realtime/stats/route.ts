import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Import MLM database service
    const { mlmDatabaseService } = await import('@/lib/mlm/database-service')
    
    // Get real user data from database
    const user = await mlmDatabaseService.getMLMUser(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get notifications count
    const notifications = await mlmDatabaseService.getNotifications(userId, true)
    
    // Get team stats
    const teamStats = await mlmDatabaseService.getTeamStats(userId, 30)

    const stats = {
      monthlyEarnings: user.currentMonthEarnings,
      teamSize: teamStats.overview.totalMembers,
      currentRank: user.rank.name,
      activeRate: teamStats.overview.retentionRate,
      unreadMessages: notifications.length,
      pendingTasks: 2, // This would come from a tasks system
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching MLM stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventType, data } = body

    // In a real implementation, this would update database and broadcast to WebSocket clients
    console.log("MLM Event:", eventType, data)

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 100))

    return NextResponse.json({ success: true, message: "Event processed" })
  } catch (error) {
    console.error("Error processing MLM event:", error)
    return NextResponse.json({ error: "Failed to process event" }, { status: 500 })
  }
}
