import { type NextRequest, NextResponse } from "next/server"

// Mock sponsor database
const sponsors = [
  {
    code: "SPONSOR001",
    name: "Sarah Johnson",
    rank: "Diamond Director",
    successRate: 89,
    teamMembers: 247,
    totalEarnings: 125000,
    joinDate: "2020-03-15",
    specialties: ["Credit Repair", "Team Building", "Social Media Marketing"],
    avatar: "/placeholder.svg?height=64&width=64&text=SJ",
  },
  {
    code: "MENTOR123",
    name: "Michael Chen",
    rank: "Executive Director",
    successRate: 92,
    teamMembers: 189,
    totalEarnings: 98000,
    joinDate: "2019-08-22",
    specialties: ["Sales Training", "Lead Generation", "Business Development"],
    avatar: "/placeholder.svg?height=64&width=64&text=MC",
  },
  {
    code: "LEADER456",
    name: "Jennifer Martinez",
    rank: "Regional Manager",
    successRate: 85,
    teamMembers: 156,
    totalEarnings: 87500,
    joinDate: "2021-01-10",
    specialties: ["Online Marketing", "Content Creation", "Team Leadership"],
    avatar: "/placeholder.svg?height=64&width=64&text=JM",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.json({ success: false, error: "Sponsor code is required" }, { status: 400 })
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const sponsor = sponsors.find((s) => s.code.toLowerCase() === code.toLowerCase())

    if (!sponsor) {
      return NextResponse.json({ success: false, error: "Invalid sponsor code" }, { status: 404 })
    }

    // Track sponsor verification attempt
    await trackAnalyticsEvent({
      event: "sponsor_verification_success",
      sponsorCode: code,
      sponsorName: sponsor.name,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      sponsor: {
        name: sponsor.name,
        rank: sponsor.rank,
        successRate: sponsor.successRate,
        teamMembers: sponsor.teamMembers,
        specialties: sponsor.specialties,
        avatar: sponsor.avatar,
      },
    })
  } catch (error) {
    console.error("Sponsor verification error:", error)

    // Track failed verification
    await trackAnalyticsEvent({
      event: "sponsor_verification_error",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 })
  }
}

async function trackAnalyticsEvent(event: any) {
  // In a real app, this would send to your analytics service
  console.log("Analytics Event:", event)
}
