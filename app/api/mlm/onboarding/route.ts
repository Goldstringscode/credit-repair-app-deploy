import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const onboardingData = await request.json()

    // Validate required fields
    const { personalInfo, goals, preferences, sponsor } = onboardingData

    if (!personalInfo.firstName || !personalInfo.lastName || !personalInfo.phone) {
      return NextResponse.json({ success: false, error: "Missing required personal information" }, { status: 400 })
    }

    // In a real app, you would save this to your database
    const newMLMUser = {
      id: `mlm_${Date.now()}`,
      ...onboardingData,
      status: "active",
      rank: "Associate",
      joinDate: new Date().toISOString(),
      welcomeBonus: 50,
      completedOnboarding: true,
      nextSteps: [
        {
          id: 1,
          title: "Complete Training",
          description: "Start with our beginner course",
          completed: false,
          url: "/mlm/training",
        },
        {
          id: 2,
          title: "Set Up Profile",
          description: "Customize your marketing materials",
          completed: false,
          url: "/mlm/profile",
        },
        {
          id: 3,
          title: "Connect with Sponsor",
          description: "Schedule your first mentoring call",
          completed: false,
          url: "/mlm/sponsor-connect",
        },
        {
          id: 4,
          title: "Make First Referral",
          description: "Start earning with your first referral",
          completed: false,
          url: "/mlm/referrals",
        },
      ],
    }

    // Mock database save
    console.log("New MLM user onboarded:", newMLMUser)

    // Send welcome email (mock)
    await sendWelcomeEmail(newMLMUser)

    // Create initial commission structure
    await createCommissionStructure(newMLMUser.id)

    return NextResponse.json({
      success: true,
      user: newMLMUser,
      message: "Onboarding completed successfully!",
      redirectUrl: "/mlm/dashboard",
    })
  } catch (error) {
    console.error("Onboarding error:", error)
    return NextResponse.json({ success: false, error: "Failed to complete onboarding" }, { status: 500 })
  }
}

async function sendWelcomeEmail(user: any) {
  // Mock email service
  console.log(`Sending welcome email to ${user.personalInfo.firstName} ${user.personalInfo.lastName}`)

  const emailContent = {
    to: user.personalInfo.email || `${user.personalInfo.firstName.toLowerCase()}@example.com`,
    subject: "Welcome to Your MLM Journey! 🎉",
    template: "mlm-welcome",
    data: {
      firstName: user.personalInfo.firstName,
      sponsorName: user.sponsor.sponsorName,
      welcomeBonus: user.welcomeBonus,
      nextSteps: user.nextSteps,
    },
  }

  // In a real app, integrate with email service like SendGrid, Mailgun, etc.
  return Promise.resolve(emailContent)
}

async function createCommissionStructure(userId: string) {
  // Mock commission structure creation
  const commissionStructure = {
    userId,
    personalSalesRate: 0.25, // 25%
    teamBonusRate: 0.05, // 5%
    leadershipBonusRate: 0.03, // 3%
    rankBonusRate: 0.02, // 2%
    generationBonuses: [0.1, 0.05, 0.03, 0.02, 0.01], // 5 levels
    created: new Date().toISOString(),
  }

  console.log("Commission structure created:", commissionStructure)
  return Promise.resolve(commissionStructure)
}
