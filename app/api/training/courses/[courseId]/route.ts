import { NextRequest, NextResponse } from "next/server"
import { trainingService } from "@/lib/services/training-service"

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const courseId = params.courseId
    
    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "Course ID is required" },
        { status: 400 }
      )
    }

    const course = await trainingService.getCourseById(courseId)

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: course
    })

  } catch (error) {
    console.error("Failed to fetch course:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch course" },
      { status: 500 }
    )
  }
}
