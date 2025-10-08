import { NextRequest, NextResponse } from "next/server"
import { trainingService } from "@/lib/services/training-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("courseId")
    const lessonId = searchParams.get("lessonId")

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "Course ID is required" },
        { status: 400 }
      )
    }

    const quizzes = await trainingService.getCourseQuizzes(courseId)
    
    return NextResponse.json({
      success: true,
      data: {
        quizzes,
        total: quizzes.length
      }
    })
  } catch (error) {
    console.error("Quiz API GET error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch quiz data" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, quizId, courseId, answers, timeTaken } = body

    if (!userId || !quizId || !courseId || !answers) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: userId, quizId, courseId, answers" },
        { status: 400 }
      )
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { success: false, error: "Answers must be a non-empty array" },
        { status: 400 }
      )
    }

    const result = await trainingService.submitQuizAttempt(userId, quizId, courseId, answers, timeTaken || 0)
    
    if (!result) {
      return NextResponse.json(
        { success: false, error: "Failed to submit quiz attempt" },
        { status: 500 }
      )
    }

    // Check for new achievements
    const newAchievements = await trainingService.checkAndAwardAchievements(userId)

    return NextResponse.json({
      success: true,
      message: result.passed ? "Quiz passed!" : "Quiz completed",
      data: {
        ...result,
        newAchievements: newAchievements.length > 0 ? newAchievements : undefined
      }
    })
  } catch (error) {
    console.error("Quiz API POST error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to submit quiz" },
      { status: 500 }
    )
  }
}
