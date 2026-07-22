import { NextRequest, NextResponse } from "next/server"
import { extractUserId, getServiceClient } from "@/lib/training/quiz-auth"
import { getCourseList } from "@/lib/training/course-data"

export const dynamic = "force-dynamic"

/**
 * GET /api/training/courses
 *
 * Returns the course catalog with each user's real progress (from
 * training_progress) and whether each course is locked based on the
 * user's actual subscription tier (public.users.subscription_tier,
 * defaulting to "free" — never the mock/demo subscription).
 */
export async function GET(request: NextRequest) {
  try {
    const userId = extractUserId(request)
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getServiceClient()

    const [{ data: userRow, error: userError }, { data: progressRows, error: progressError }] = await Promise.all([
      supabase.from("users").select("subscription_tier, subscription_status").eq("id", userId).maybeSingle(),
      supabase
        .from("training_progress")
        .select("course_id, lesson_id, is_completed, last_watched_at")
        .eq("user_id", userId),
    ])

    if (userError) {
      console.error("Failed to fetch user subscription tier:", userError)
    }
    if (progressError) {
      console.error("Failed to fetch training progress:", progressError)
      return NextResponse.json({ success: false, error: "Failed to fetch progress" }, { status: 500 })
    }

    const tier = (userRow?.subscription_tier || "free").toLowerCase()
    const isFreeTier = tier === "free"

    const rows = progressRows ?? []

    const courses = getCourseList().map(course => {
      const courseRows = rows.filter(r => r.course_id === course.id)
      const completedLessons = courseRows.filter(r => r.is_completed).length
      const progressPercentage =
        course.lessonCount > 0 ? Math.round((completedLessons / course.lessonCount) * 100) : 0
      const lastAccessed = courseRows.reduce<string | null>((latest, r) => {
        if (!r.last_watched_at) return latest
        if (!latest || r.last_watched_at > latest) return r.last_watched_at
        return latest
      }, null)

      return {
        ...course,
        locked: course.requiresPaid && isFreeTier,
        completedLessons,
        progressPercentage,
        completed: progressPercentage >= 100,
        lastAccessed,
      }
    })

    const totalCompletedLessons = rows.filter(r => r.is_completed).length
    const coursesCompleted = courses.filter(c => c.completed).length

    const stats = {
      coursesCompleted,
      lessonsCompleted: totalCompletedLessons,
      certificatesEarned: coursesCompleted,
      totalCourses: courses.length,
    }

    return NextResponse.json({ success: true, courses, stats, tier })
  } catch (error) {
    console.error("Error in training courses API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
