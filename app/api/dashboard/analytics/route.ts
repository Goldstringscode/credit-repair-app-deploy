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
      .select("credit_score, bureau, created_at, confidence_score, experian_score, equifax_score, transunion_score")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })

    const { data: disputes } = await db().from("disputes")
      .select("id, status, created_at")
      .eq("user_id", user.id)

    const scoreHistory = (reports || [])
      .filter((r: any) => r.credit_score)
      .map((r: any) => ({
        date: r.created_at?.substring(0, 10),
        score: Number(r.credit_score),
        bureau: r.bureau,
        confidence: Number(r.confidence_score) || 0,
      }))

    const disputeStats = {
      total: disputes?.length || 0,
      pending: (disputes || []).filter((d: any) => d.status === "pending").length,
      successful: (disputes || []).filter((d: any) => ["resolved","won","removed"].includes(d.status)).length,
      failed: (disputes || []).filter((d: any) => ["lost","failed"].includes(d.status)).length,
    }

    const scoreImprovement = scoreHistory.length >= 2
      ? scoreHistory[scoreHistory.length - 1].score - scoreHistory[0].score
      : 0

    return NextResponse.json({
      success: true,
      data: {
        scoreHistory,
        scoreImprovement,
        disputeStats,
        totalReports: reports?.length || 0,
        lastUpdated: reports?.[reports.length - 1]?.created_at || null,
      },
    })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch analytics" }, { status: 500 })
  }
}