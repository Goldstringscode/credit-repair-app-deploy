import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.json({ success: false, error: "Sponsor code is required" }, { status: 400 })
    }

    return await lookupSponsor(code)
  } catch (error) {
    console.error("Sponsor verification error:", error)
    return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sponsorCode } = await request.json()

    if (!sponsorCode) {
      return NextResponse.json({ success: false, error: "Sponsor code is required" }, { status: 400 })
    }

    return await lookupSponsor(sponsorCode)
  } catch (error) {
    console.error("Sponsor verification error:", error)
    return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 })
  }
}

async function lookupSponsor(code: string): Promise<NextResponse> {
  try {
    const supabase = getSupabaseClient()

    const { data: member, error } = await supabase
      .from("mlm_members")
      .select("user_id, tier_id, status, referral_code")
      .eq("referral_code", code.toUpperCase())
      .eq("status", "active")
      .maybeSingle()

    if (error) {
      console.error("Supabase sponsor lookup error:", error)
      return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 })
    }

    if (!member) {
      return NextResponse.json({ success: false, error: "Invalid sponsor code" }, { status: 404 })
    }

    // Get user details
    const { data: sponsorUser } = await supabase
      .from("users")
      .select("email, first_name, last_name")
      .eq("id", member.user_id)
      .maybeSingle()

    const name = sponsorUser
      ? [sponsorUser.first_name, sponsorUser.last_name].filter(Boolean).join(" ") || sponsorUser.email
      : "Unknown"

    return NextResponse.json({
      success: true,
      sponsor: {
        name,
        rank: member.tier_id ? member.tier_id.charAt(0).toUpperCase() + member.tier_id.slice(1) : "Member",
        email: sponsorUser?.email ?? "",
      },
    })
  } catch (error) {
    console.error("Sponsor lookup error:", error)
    return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 })
  }
}
