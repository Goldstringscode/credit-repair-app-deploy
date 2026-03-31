import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabase-client"
import { verifyToken } from "@/lib/jwt"

function getAdminFromRequest(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie") ?? ""
  const token = cookieHeader
    .split("; ")
    .find(c => c.startsWith("auth-token="))
    ?.split("=")[1]
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload || payload.role !== "admin") return null
  return payload
}

// GET — list all staff members
export async function GET(request: NextRequest) {
  const admin = getAdminFromRequest(request)
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, role, created_at, last_sign_in_at, email_verified")
      .in("role", ["admin", "staff", "moderator"])
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching staff:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch staff" }, { status: 500 })
    }

    return NextResponse.json({ success: true, staff: data ?? [] })
  } catch (err) {
    console.error("Staff GET error:", err)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// POST — invite a new staff member
export async function POST(request: NextRequest) {
  const admin = getAdminFromRequest(request)
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json() as { email?: string; role?: string }
    const { email, role } = body

    if (!email || !role) {
      return NextResponse.json({ success: false, error: "email and role are required" }, { status: 400 })
    }

    if (!["admin", "staff", "moderator"].includes(role)) {
      return NextResponse.json({ success: false, error: "Invalid role" }, { status: 400 })
    }

    const supabase = getSupabaseClient()

    // Check if user already exists
    const { data: existing } = await supabase
      .from("users")
      .select("id, role")
      .eq("email", email)
      .maybeSingle()

    if (existing) {
      // Update their role to the new staff role
      const { error: updateError } = await supabase
        .from("users")
        .update({ role })
        .eq("id", existing.id)

      if (updateError) {
        console.error("Error updating user role:", updateError)
        return NextResponse.json({ success: false, error: "Failed to update user role" }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: "User role updated" })
    }

    // Invite new user via Supabase Auth admin API
    const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { role },
    })

    if (inviteError) {
      console.error("Error inviting user:", inviteError)
      return NextResponse.json({ success: false, error: inviteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Invitation sent" })
  } catch (err) {
    console.error("Staff POST error:", err)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
