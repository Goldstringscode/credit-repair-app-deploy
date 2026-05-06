import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { creditDataService } from "@/lib/credit-data"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { user, isAuthenticated } = await getCurrentUser(request)
    if (!isAuthenticated || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const stats = await creditDataService.getDashboardStats(user.id)

    return NextResponse.json({ success: true, data: stats })
  } catch (error) {
    console.error("Dashboard stats API error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}