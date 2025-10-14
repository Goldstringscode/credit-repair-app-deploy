import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import jwt from "jsonwebtoken"
import { notificationService } from "@/lib/notification-service"

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

export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { stepId } = await request.json()

    // Get current action plan
    const supabase = getSupabaseClient()
    const { data: actionPlan, error: fetchError } = await supabase
      .from("action_plans")
      .select("*")
      .eq("user_id", user.userId)
      .eq("status", "active")
      .single()

    if (fetchError || !actionPlan) {
      return NextResponse.json({ error: "Action plan not found" }, { status: 404 })
    }

    // Update the specific step
    const planData = actionPlan.plan_data
    const updatedSteps = planData.steps.map((step: any) =>
      step.id === stepId
        ? { ...step, status: "completed", completedAt: new Date().toISOString() }
        : step
    )

    const updatedPlanData = {
      ...planData,
      steps: updatedSteps,
    }

    // Save updated plan
    const { error: updateError } = await supabase
      .from("action_plans")
      .update({
        plan_data: updatedPlanData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", actionPlan.id)

    if (updateError) {
      return NextResponse.json({ error: "Failed to update action plan" }, { status: 500 })
    }

    // Create a notification for the completed step
    const completedStep = updatedSteps.find((step: any) => step.id === stepId)
    if (completedStep) {
      // Use our notification service instead of direct database insertion
      await notificationService.notifyTaskCompleted(
        completedStep.title,
        actionPlan.plan_name || "Action Plan"
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Complete step error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
