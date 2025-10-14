import { type NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const affiliateId = searchParams.get("affiliateId")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")

    if (!affiliateId) {
      return NextResponse.json({ error: "Affiliate ID is required" }, { status: 400 })
    }

    // Mock referral data
    const allReferrals = [
      {
        id: "ref_001",
        affiliateId,
        referredUserId: "user_001",
        referralCode: "CREDITPRO2024",
        name: "Sarah Johnson",
        email: "sarah@example.com",
        status: "converted",
        signupDate: "2024-01-20",
        conversionDate: "2024-01-22",
        subscriptionTier: "professional",
        commission: 23.7,
        commissionRate: 0.3,
        lifetime: false,
      },
      {
        id: "ref_002",
        affiliateId,
        referredUserId: "user_002",
        referralCode: "CREDITPRO2024",
        name: "Mike Davis",
        email: "mike@example.com",
        status: "pending",
        signupDate: "2024-01-18",
        conversionDate: null,
        subscriptionTier: "basic",
        commission: 11.7,
        commissionRate: 0.3,
        lifetime: false,
      },
      {
        id: "ref_003",
        affiliateId,
        referredUserId: "user_003",
        referralCode: "CREDITPRO2024",
        name: "Emily Wilson",
        email: "emily@example.com",
        status: "converted",
        signupDate: "2024-01-15",
        conversionDate: "2024-01-16",
        subscriptionTier: "premium",
        commission: 38.7,
        commissionRate: 0.3,
        lifetime: false,
      },
    ]

    // Filter by status if provided
    let filteredReferrals = allReferrals
    if (status) {
      filteredReferrals = allReferrals.filter((ref) => ref.status === status)
    }

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedReferrals = filteredReferrals.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      referrals: paginatedReferrals,
      pagination: {
        page,
        limit,
        total: filteredReferrals.length,
        pages: Math.ceil(filteredReferrals.length / limit),
      },
    })
  } catch (error) {
    console.error("Referrals fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch referrals" }, { status: 500 })
  }
}
