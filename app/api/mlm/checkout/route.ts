import { type NextRequest, NextResponse } from "next/server"

interface MLMCheckoutData {
  email: string
  firstName: string
  lastName: string
  phone: string
  tierId: string
  billing: string
  amount: number
  cardNumber: string
  expiryDate: string
  cvv: string
  sponsorCode?: string
}

export async function POST(request: NextRequest) {
  try {
    const data: MLMCheckoutData = await request.json()

    // Validate required fields
    if (!data.email || !data.firstName || !data.lastName || !data.tierId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Simulate payment processing with Stripe
    // In production, you would integrate with Stripe here
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Create MLM user record
    const mlmUser = {
      id: `mlm_${Date.now()}`,
      userId: `user_${Date.now()}`,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      tierId: data.tierId,
      billing: data.billing,
      sponsorCode: data.sponsorCode,
      status: "active",
      joinDate: new Date(),
      nextBillingDate: new Date(Date.now() + (data.billing === "annual" ? 365 : 30) * 24 * 60 * 60 * 1000),
      totalPaid: data.amount,
      commissionEarned: 0,
      teamSize: 0,
    }

    // Process sponsor relationship if sponsor code provided
    if (data.sponsorCode) {
      // In production, you would:
      // 1. Verify sponsor exists and is active
      // 2. Create upline/downline relationship
      // 3. Award sponsor recruitment bonus
      console.log(`Processing sponsor relationship: ${data.sponsorCode}`)
    }

    // Send welcome email
    await sendWelcomeEmail(mlmUser)

    // Create initial commission structure
    await setupCommissionStructure(mlmUser)

    return NextResponse.json({
      success: true,
      mlmUser,
      message: "MLM registration completed successfully",
    })
  } catch (error) {
    console.error("MLM checkout error:", error)
    return NextResponse.json({ success: false, error: "Payment processing failed" }, { status: 500 })
  }
}

async function sendWelcomeEmail(mlmUser: any) {
  // In production, integrate with email service (SendGrid, etc.)
  console.log(`Sending welcome email to ${mlmUser.email}`)

  const emailContent = {
    to: mlmUser.email,
    subject: "Welcome to CreditAI MLM - Your Journey Starts Now!",
    template: "mlm-welcome",
    data: {
      firstName: mlmUser.firstName,
      tierId: mlmUser.tierId,
      dashboardUrl: "/mlm/dashboard",
      trainingUrl: "/mlm/training",
      referralCode: `${mlmUser.firstName.toUpperCase()}${Date.now().toString().slice(-4)}`,
    },
  }

  // Mock email sending
  return Promise.resolve(emailContent)
}

async function setupCommissionStructure(mlmUser: any) {
  // In production, set up commission tracking structure
  console.log(`Setting up commission structure for ${mlmUser.id}`)

  const commissionStructure = {
    userId: mlmUser.id,
    tierId: mlmUser.tierId,
    directCommissionRate: getCommissionRate(mlmUser.tierId),
    maxLevels: getMaxLevels(mlmUser.tierId),
    bonusEligibility: getBonusEligibility(mlmUser.tierId),
    createdAt: new Date(),
  }

  return Promise.resolve(commissionStructure)
}

function getCommissionRate(tierId: string): number {
  const rates = {
    starter: 0.3,
    professional: 0.4,
    enterprise: 0.5,
  }
  return rates[tierId as keyof typeof rates] || 0.3
}

function getMaxLevels(tierId: string): number {
  const levels = {
    starter: 3,
    professional: 7,
    enterprise: -1, // unlimited
  }
  return levels[tierId as keyof typeof levels] || 3
}

function getBonusEligibility(tierId: string): string[] {
  const bonuses = {
    starter: ["fast_start"],
    professional: ["fast_start", "matching_bonus", "leadership_bonus"],
    enterprise: ["fast_start", "matching_bonus", "leadership_bonus", "infinity_bonus"],
  }
  return bonuses[tierId as keyof typeof bonuses] || ["fast_start"]
}
