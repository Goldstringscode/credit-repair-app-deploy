import { NextRequest, NextResponse } from "next/server"
import { trainingService } from "@/lib/services/training-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId")
    const level = searchParams.get("level")
    const isPublished = searchParams.get("isPublished")
    const isFeatured = searchParams.get("isFeatured")
    const userId = searchParams.get("userId")
    const limit = searchParams.get("limit")
    const offset = searchParams.get("offset")

    const options: any = {}
    
    if (categoryId) options.categoryId = categoryId
    if (level) options.level = level
    if (isPublished !== null) options.isPublished = isPublished === "true"
    if (isFeatured !== null) options.isFeatured = isFeatured === "true"
    if (userId) options.userId = userId
    if (limit) options.limit = parseInt(limit)
    if (offset) options.offset = parseInt(offset)

    const courses = await trainingService.getCourses(options)
    const categories = await trainingService.getCategories()

    return NextResponse.json({
      success: true,
      data: {
        courses,
        categories,
        total: courses.length
      }
    })
  } catch (error) {
    console.error("Training API error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch training data" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId, courseId, lessonId, progress } = body

    if (!action || !userId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    switch (action) {
      case "enroll":
        if (!courseId) {
          return NextResponse.json(
            { success: false, error: "Course ID required for enrollment" },
            { status: 400 }
          )
        }
        
        const enrolled = await trainingService.enrollUserInCourse(userId, courseId)
        if (enrolled) {
          return NextResponse.json({
            success: true,
            message: "Successfully enrolled in course",
            data: { courseId }
          })
        } else {
          return NextResponse.json(
            { success: false, error: "Failed to enroll in course" },
            { status: 500 }
          )
        }

      case "update_progress":
        if (!lessonId || !courseId) {
          return NextResponse.json(
            { success: false, error: "Lesson ID and Course ID required for progress update" },
            { status: 400 }
          )
        }
        
        const progressUpdated = await trainingService.updateLessonProgress(
          userId,
          lessonId,
          courseId,
          progress
        )
        
        if (progressUpdated) {
          return NextResponse.json({
            success: true,
            message: "Progress updated successfully",
            data: { lessonId, courseId, progress }
          })
        } else {
          return NextResponse.json(
            { success: false, error: "Failed to update progress" },
            { status: 500 }
          )
        }

      case "complete_lesson":
        if (!lessonId || !courseId) {
          return NextResponse.json(
            { success: false, error: "Lesson ID and Course ID required" },
            { status: 400 }
          )
        }
        
        const lessonCompleted = await trainingService.updateLessonProgress(
          userId,
          lessonId,
          courseId,
          { isCompleted: true }
        )
        
        if (lessonCompleted) {
          // Check for new achievements
          const newAchievements = await trainingService.checkAndAwardAchievements(userId)
          
          return NextResponse.json({
            success: true,
            message: "Lesson completed successfully",
            data: { 
              lessonId, 
              courseId, 
              newAchievements: newAchievements.length > 0 ? newAchievements : undefined
            }
          })
        } else {
          return NextResponse.json(
            { success: false, error: "Failed to complete lesson" },
            { status: 500 }
          )
        }

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("Training API POST error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to process training action" },
      { status: 500 }
    )
  }
}
