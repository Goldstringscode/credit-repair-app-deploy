import { type NextRequest, NextResponse } from "next/server"

interface MilestoneProgress {
  id: string
  userId: string
  sessionId: string
  milestoneId: string
  journeyId: string
  status: "not_started" | "in_progress" | "completed" | "failed"
  completedAt?: string
  timeToComplete?: number
  metadata: Record<string, any>
  points: number
}

// Mock storage for milestone progress (in production, use a real database)
const milestoneProgress: Map<string, MilestoneProgress[]> = new Map()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const journeyId = searchParams.get("journeyId")

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    let userProgress = milestoneProgress.get(userId) || []

    if (journeyId) {
      userProgress = userProgress.filter((p) => p.journeyId === journeyId)
    }

    const stats = {
      totalMilestones: userProgress.length,
      completedMilestones: userProgress.filter((p) => p.status === "completed").length,
      totalPoints: userProgress.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.points, 0),
      completionRate:
        userProgress.length > 0
          ? (userProgress.filter((p) => p.status === "completed").length / userProgress.length) * 100
          : 0,
    }

    return NextResponse.json({
      success: true,
      progress: userProgress,
      stats,
    })
  } catch (error) {
    console.error("Milestone progress retrieval error:", error)
    return NextResponse.json({ success: false, error: "Failed to retrieve milestone progress" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const progressData: MilestoneProgress = await request.json()

    // Validate required fields
    if (!progressData.userId || !progressData.milestoneId || !progressData.journeyId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Get or create user progress array
    const userProgress = milestoneProgress.get(progressData.userId) || []

    // Update existing progress or add new
    const existingIndex = userProgress.findIndex((p) => p.milestoneId === progressData.milestoneId)

    if (existingIndex >= 0) {
      userProgress[existingIndex] = progressData
    } else {
      userProgress.push(progressData)
    }

    milestoneProgress.set(progressData.userId, userProgress)

    console.log("Milestone progress updated:", {
      userId: progressData.userId,
      milestone: progressData.milestoneId,
      status: progressData.status,
      points: progressData.points,
    })

    return NextResponse.json({
      success: true,
      progress: progressData,
    })
  } catch (error) {
    console.error("Milestone progress update error:", error)
    return NextResponse.json({ success: false, error: "Failed to update milestone progress" }, { status: 500 })
  }
}
