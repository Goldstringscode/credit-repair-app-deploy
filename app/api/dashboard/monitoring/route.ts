import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getCurrentUser } from "@/lib/auth"

export const dynamic = 'force-dynamic'

const db = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { user, isAuthenticated } = await getCurrentUser(request)
    if (!isAuthenticated || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { data: reports } = await db().from("credit_reports")
      .select("credit_score, bureau, created_at, confidence_score, status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)

    const { data: disputes } = await db().from("disputes")
      .select("id, status, created_at, bureau, account_name")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)

    const latestScore = reports?.[0]?.credit_score || null
    const previousScore = reports?.[1]?.credit_score || null
    const scoreChange = latestScore && previousScore ? latestScore - previousScore : 0

    const recentActivity = [
      ...(reports || []).slice(0, 3).map((r: any) => ({
        type: "report",
        date: r.created_at,
        description: `Credit report analyzed - Score: ${r.credit_score || "N/A"}`,
        bureau: r.bureau,
        status: r.status,
      })),
      ...(disputes || []).slice(0, 3).map((d: any) => ({
        type: "dispute",
        date: d.created_at,
        description: `Dispute ${d.status} - ${d.account_name || d.bureau || "Account"}`,
        status: d.status,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

    return NextResponse.json({
      success: true,
      data: {
        latestScore,
        scoreChange,
        recentReports: reports?.slice(0, 5) || [],
        recentDisputes: disputes?.slice(0, 5) || [],
        recentActivity,
        totalReports: reports?.length || 0,
      },
    })
  } catch (error) {
    console.error("Monitoring API error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch monitoring data" }, { status: 500 })
  }
}