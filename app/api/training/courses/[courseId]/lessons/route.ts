import { NextRequest, NextResponse } from "next/server"
import { trainingService } from "@/lib/services/training-service"

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const courseId = params.courseId
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "Course ID is required" },
        { status: 400 }
      )
    }

    const lessons = await trainingService.getLessons(courseId, userId || undefined)

    return NextResponse.json({
      success: true,
      data: lessons
    })

  } catch (error) {
    console.error("Failed to fetch lessons:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch lessons" },
      { status: 500 }
    )
  }
}
