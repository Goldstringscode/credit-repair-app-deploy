import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import jwt from "jsonwebtoken"

export const dynamic = 'force-dynamic'

function getSupabaseClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase environment variables')
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

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

export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's action plan
    const supabase = getSupabaseClient()
    const { data: actionPlan, error } = await supabase
      .from("action_plans")
      .select("*")
      .eq("user_id", user.userId)
      .eq("status", "active")
      .single()

    if (error || !actionPlan) {
      // Create a default action plan if none exists
      const defaultPlan = createDefaultActionPlan()
      
      const { data: newPlan, error: createError } = await supabase
        .from("action_plans")
        .insert({
          user_id: user.userId,
          plan_data: defaultPlan,
          status: "active",
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (createError) {
        return NextResponse.json({ error: "Failed to create action plan" }, { status: 500 })
      }

      return NextResponse.json(defaultPlan)
    }

    // Calculate progress
    const planData = actionPlan.plan_data
    const completed = planData.steps.filter((step: any) => step.status === "completed").length
    const total = planData.steps.length
    const percentage = total > 0 ? (completed / total) * 100 : 0

    const responseData = {
      ...planData,
      progress: {
        completed,
        total,
        percentage,
      },
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Action plan error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function createDefaultActionPlan() {
  return {
    steps: [
      {
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
      },
      {
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
      },
      {
        id: 3,
        title: "Generate Dispute Letters",
        description: "Create professional dispute letters for identified issues",
        status: "pending",
        priority: "high",
        estimatedDays: 3,
        actions: [
          "Generate AI-powered dispute letters",
          "Review and customize letters",
          "Send via certified mail",
        ],
      },
      {
        id: 4,
        title: "Monitor Progress",
        description: "Track responses and credit score changes",
        status: "pending",
        priority: "medium",
        estimatedDays: 30,
        actions: [
          "Monitor credit bureau responses",
          "Track credit score improvements",
          "Follow up on unresolved disputes",
        ],
      },
      {
        id: 5,
        title: "Credit Building Strategy",
        description: "Implement positive credit building activities",
        status: "pending",
        priority: "medium",
        estimatedDays: 60,
        actions: [
          "Optimize credit utilization",
          "Set up payment reminders",
          "Consider secured credit cards if needed",
          "Build positive payment history",
        ],
      },
    ],
    estimatedTimeframe: "6-months",
    priority: "medium",
    goals: {
      currentScore: "unknown",
      targetScore: "700+",
      primaryGoal: "general-improvement",
    },
  }
}
