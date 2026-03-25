import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

/**
 * Extract user ID from the JWT token in Authorization header or cookies.
 * Returns null if token is missing or invalid.
 */
function extractUserId(request: NextRequest): string | null {
  try {
    let token: string | undefined

    // Check Authorization header first
    const authHeader = request.headers.get("authorization")
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7)
    }

    // Fall back to Supabase cookies
    if (!token) {
      token = request.cookies.get("sb-access-token")?.value
    }

    if (!token) {
      const cookies = request.cookies.getAll()
      for (const cookie of cookies) {
        if (cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token")) {
          try {
            const session = JSON.parse(cookie.value)
            token = session?.access_token
          } catch {
            token = cookie.value
          }
          break
        }
      }
    }

    if (!token) return null

    // Decode JWT payload (base64url)
    const parts = token.split(".")
    if (parts.length !== 3) return null
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=")
    const payload = JSON.parse(atob(padded))

    // Check expiry
    if (payload.exp && Date.now() / 1000 > payload.exp) return null

    return (payload.sub as string) || null
  } catch {
    return null
  }
}

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Missing Supabase configuration")
  return createClient(url, key)
}

/**
 * GET /api/training/progress?courseId=X[&lessonId=Y]
 * Returns progress records for the authenticated user.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = extractUserId(request)
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("courseId")
    const lessonId = searchParams.get("lessonId")

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "courseId is required" },
        { status: 400 }
      )
    }

    const supabase = getServiceClient()

    let query = supabase
      .from("training_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", courseId)

    if (lessonId) {
      query = query.eq("lesson_id", lessonId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Failed to fetch training progress:", error)
      return NextResponse.json(
        { success: false, error: "Failed to fetch progress" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: data || [] })
  } catch (error) {
    console.error("Training progress GET error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/training/progress
 * Body: { courseId, lessonId, videoProgressSeconds, videoDurationSeconds?, isCompleted? }
 * Upserts a training progress record for the authenticated user.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = extractUserId(request)
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { courseId, lessonId, videoProgressSeconds, videoDurationSeconds, isCompleted } = body

    if (!courseId || !lessonId || videoProgressSeconds === undefined) {
      return NextResponse.json(
        { success: false, error: "courseId, lessonId, and videoProgressSeconds are required" },
        { status: 400 }
      )
    }

    const supabase = getServiceClient()

    const now = new Date().toISOString()
    const record: Record<string, unknown> = {
      user_id: userId,
      course_id: courseId,
      lesson_id: lessonId,
      video_progress_seconds: videoProgressSeconds,
      last_watched_at: now,
    }

    if (videoDurationSeconds !== undefined) {
      record.video_duration_seconds = videoDurationSeconds
    }

    if (isCompleted !== undefined) {
      record.is_completed = isCompleted
      if (isCompleted) {
        record.completed_at = now
      }
    }

    const { data, error } = await supabase
      .from("training_progress")
      .upsert(record, { onConflict: "user_id,course_id,lesson_id" })
      .select()
      .single()

    if (error) {
      console.error("Failed to upsert training progress:", error)
      return NextResponse.json(
        { success: false, error: "Failed to save progress" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Training progress POST error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
