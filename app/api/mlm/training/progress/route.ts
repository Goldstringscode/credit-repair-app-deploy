import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  console.error("Missing JWT_SECRET environment variable — /api/mlm/training/progress will reject all requests")
}

function extractUserId(request: NextRequest): string | null {
  // Prefer x-user-id header set by middleware (avoids re-decoding the JWT)
  const headerUserId = request.headers.get("x-user-id")
  if (headerUserId) return headerUserId

  try {
    if (!JWT_SECRET) return null

    // Check auth-token cookie (app's custom JWT)
    const cookieToken = request.cookies.get("auth-token")?.value
    if (cookieToken) {
      const decoded = jwt.verify(cookieToken, JWT_SECRET) as any
      return decoded?.userId ?? decoded?.sub ?? null
    }

    // Fallback: Authorization header
    const authHeader = request.headers.get("authorization")
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7)
      const decoded = jwt.verify(token, JWT_SECRET) as any
      return decoded?.userId ?? decoded?.sub ?? null
    }

    return null
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
 * POST /api/mlm/training/progress
 * Body: { lesson_id, course_id, video_progress_seconds?, completed_at? }
 * Saves lesson progress (partial or completed) for the authenticated user.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = extractUserId(request)
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { lesson_id, course_id, video_progress_seconds, completed_at } = body

    if (!lesson_id || !course_id) {
      return NextResponse.json(
        { success: false, error: "lesson_id and course_id are required" },
        { status: 400 }
      )
    }

    const supabase = getServiceClient()
    const now = new Date().toISOString()
    const is_completed = !!completed_at

    const { data, error } = await supabase
      .from("training_progress")
      .upsert(
        {
          user_id: userId,
          lesson_id,
          course_id,
          video_progress_seconds: video_progress_seconds ?? 0,
          is_completed,
          completed_at: is_completed ? (completed_at ?? now) : null,
          updated_at: now,
        },
        { onConflict: "user_id,course_id,lesson_id" }
      )
      .select()
      .maybeSingle()

    if (error) {
      // Table does not exist yet — treat as a no-op rather than crashing
      if ((error as any).code === "42P01") {
        return NextResponse.json({ success: true, data: null })
      }
      console.error("Failed to save training progress:", error)
      return NextResponse.json(
        { success: false, error: "Failed to save progress" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Training progress error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/mlm/training/progress?course_id=X
 * Returns completion records for the authenticated user.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = extractUserId(request)
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("course_id")

    const supabase = getServiceClient()
    let query = supabase
      .from("training_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("is_completed", true)

    if (courseId) {
      query = query.eq("course_id", courseId)
    }

    const { data, error } = await query

    if (error) {
      // Table does not exist yet — return empty progress gracefully
      if ((error as any).code === "42P01") {
        return NextResponse.json({ success: true, data: [] })
      }
      console.error("Failed to fetch training progress:", error)
      return NextResponse.json(
        { success: false, error: "Failed to fetch progress" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Training progress fetch error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
