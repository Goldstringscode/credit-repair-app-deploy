import { NextRequest, NextResponse } from "next/server"
import { trainingService } from "@/lib/services/training-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, lessonId, courseId, progress } = body

    if (!userId || !lessonId || !courseId || !progress) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    const success = await trainingService.updateLessonProgress(
      userId,
      lessonId,
      courseId,
      progress
    )

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Progress updated successfully"
      })
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to update progress" },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error("Failed to update progress:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update progress" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      )
    }

    const stats = await trainingService.getUserTrainingStats(userId)

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error("Failed to fetch user stats:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch user stats" },
      { status: 500 }
    )
  }
}
