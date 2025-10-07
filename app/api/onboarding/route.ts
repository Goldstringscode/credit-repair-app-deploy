import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import jwt from "jsonwebtoken"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

function verifyToken(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  
  if (!token) {
    return null
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as any
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const onboardingData = await request.json()

    // Update user profile with onboarding data
    const { error: updateError } = await supabase
      .from("users")
      .update({
        first_name: onboardingData.personalInfo.firstName,
        last_name: onboardingData.personalInfo.lastName,
        phone: onboardingData.personalInfo.phone,
        address: onboardingData.personalInfo.address,
        city: onboardingData.personalInfo.city,
        state: onboardingData.personalInfo.state,
        zip_code: onboardingData.personalInfo.zipCode,
        date_of_birth: onboardingData.personalInfo.dateOfBirth,
        ssn_last_4: onboardingData.personalInfo.ssn,
        current_credit_score: onboardingData.creditGoals.currentScore,
        target_credit_score: onboardingData.creditGoals.targetScore,
        credit_goal_timeframe: onboardingData.creditGoals.timeframe,
        primary_goal: onboardingData.creditGoals.primaryGoal,
        urgency_level: onboardingData.creditGoals.urgency,
        has_disputed_before: onboardingData.creditHistory.hasDisputed,
        previous_disputes: onboardingData.creditHistory.previousDisputes,
        known_issues: onboardingData.creditHistory.knownIssues,
        bankruptcy_history: onboardingData.creditHistory.bankruptcyHistory,
        has_collections: onboardingData.creditHistory.collections,
        communication_method: onboardingData.preferences.communicationMethod,
        notifications_enabled: onboardingData.preferences.notifications,
        auto_dispute_enabled: onboardingData.preferences.autoDispute,
        interested_in_premium: onboardingData.preferences.premiumFeatures,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.userId)

    if (updateError) {
      console.error("Error updating user profile:", updateError)
      return NextResponse.json({ error: "Failed to save profile" }, { status: 500 })
    }

    // Create initial action plan based on onboarding data
    const actionPlan = generateActionPlan(onboardingData)
    
    const { error: planError } = await supabase
      .from("action_plans")
      .insert({
        user_id: user.userId,
        plan_data: actionPlan,
        status: "active",
        created_at: new Date().toISOString(),
      })

    if (planError) {
      console.error("Error creating action plan:", planError)
      // Don't fail the request if action plan creation fails
    }

    // Create welcome notification
    await supabase
      .from("notifications")
      .insert({
        user_id: user.userId,
        title: "Welcome to CreditAI Pro!",
        message: "Your personalized credit repair journey has begun. Check out your action plan to get started.",
        type: "welcome",
        priority: "high",
        read: false,
        created_at: new Date().toISOString(),
      })

    return NextResponse.json({
      success: true,
      message: "Onboarding completed successfully",
      actionPlan,
    })
  } catch (error) {
    console.error("Onboarding error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function generateActionPlan(data: any) {
  const plan = {
    steps: [] as Array<{
      id: number;
      title: string;
      description: string;
      status: string;
      priority: string;
      estimatedDays: number;
      actions: string[];
    }>,
    estimatedTimeframe: data.creditGoals.timeframe || "6-months",
    priority: data.creditGoals.urgency || "medium",
    goals: {
      currentScore: data.creditGoals.currentScore,
      targetScore: data.creditGoals.targetScore,
      primaryGoal: data.creditGoals.primaryGoal,
    },
  }

  // Step 1: Always start with credit report analysis
  plan.steps.push({
    id: 1,
    title: "Get Your Credit Reports",
    description: "Obtain free credit reports from all three bureaus",
    status: "pending",
    priority: "high",
    estimatedDays: 1,
    actions: [
      "Visit annualcreditreport.com",
      "Download reports from Experian, Equifax, and TransUnion",
      "Upload reports to CreditAI Pro for analysis",
    ],
  })

  // Step 2: Identify issues
  plan.steps.push({
    id: 2,
    title: "Identify Credit Issues",
    description: "AI analysis will identify errors and negative items",
    status: "pending",
    priority: "high",
    estimatedDays: 2,
    actions: [
      "AI scans for inaccuracies and errors",
      "Review flagged items",
      "Prioritize disputes by impact",
    ],
  })

  // Step 3: Generate disputes based on known issues
  if (data.creditHistory.knownIssues && data.creditHistory.knownIssues.length > 0) {
    plan.steps.push({
      id: 3,
      title: "Generate Dispute Letters",
      description: `Address ${data.creditHistory.knownIssues.length} known issues`,
      status: "pending",
      priority: "high",
      estimatedDays: 3,
      actions: data.creditHistory.knownIssues.map((issue: string) => `Dispute: ${issue}`),
    })
  }

  // Step 4: Credit building recommendations
  plan.steps.push({
    id: 4,
    title: "Credit Building Strategy",
    description: "Implement positive credit building activities",
    status: "pending",
    priority: "medium",
    estimatedDays: 30,
    actions: [
      "Optimize credit utilization",
      "Set up payment reminders",
      "Consider secured credit cards if needed",
      "Monitor credit score changes",
    ],
  })

  // Add urgency-specific steps
  if (data.creditGoals.urgency === "critical") {
    plan.steps.unshift({
      id: 0,
      title: "Rapid Response Plan",
      description: "Expedited credit repair for urgent needs",
      status: "pending",
      priority: "critical",
      estimatedDays: 1,
      actions: [
        "Consider premium attorney-reviewed disputes",
        "Use certified mail for faster processing",
        "Set up daily credit monitoring",
      ],
    })
  }

  return plan
}
