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

// DELETE — revoke staff access (set role back to 'user')
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = getAdminFromRequest(request)
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    // Prevent revoking your own access
    if (admin.userId === id) {
      return NextResponse.json({ success: false, error: "Cannot revoke your own access" }, { status: 400 })
    }

    const supabase = getSupabaseClient()

    const { error } = await supabase
      .from("users")
      .update({ role: "user" })
      .eq("id", id)

    if (error) {
      console.error("Error revoking staff access:", error)
      return NextResponse.json({ success: false, error: "Failed to revoke access" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Staff access revoked" })
  } catch (err) {
    console.error("Staff DELETE error:", err)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
