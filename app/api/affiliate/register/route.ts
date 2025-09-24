import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "experience",
      "audience",
      "promotion",
      "paymentMethod",
      "agreeTerms",
    ]
    const missingFields = requiredFields.filter((field) => !body[field])

    if (missingFields.length > 0) {
      return NextResponse.json({ error: "Missing required fields", fields: missingFields }, { status: 400 })
    }

    // Generate affiliate code
    const affiliateCode = `${body.firstName.substring(0, 3).toUpperCase()}${Date.now().toString().slice(-6)}`

    // In a real app, you would:
    // 1. Save to database
    // 2. Send welcome email
    // 3. Create affiliate account
    // 4. Set up tracking

    const affiliateData = {
      id: `aff_${Date.now()}`,
      ...body,
      affiliateCode,
      status: "pending", // Requires approval
      tier: "bronze",
      joinDate: new Date().toISOString(),
      totalEarnings: 0,
      pendingEarnings: 0,
      paidEarnings: 0,
      totalReferrals: 0,
      activeReferrals: 0,
      conversionRate: 0,
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully! We'll review your application within 24-48 hours.",
      affiliate: affiliateData,
    })
  } catch (error) {
    console.error("Affiliate registration error:", error)
    return NextResponse.json({ error: "Failed to process application" }, { status: 500 })
  }
}
