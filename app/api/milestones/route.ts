import { type NextRequest, NextResponse } from "next/server"

interface CustomMilestone {
  id: string
  name: string
  description: string
  journeyId: string
  stepId?: string
  triggerType: "page_view" | "button_click" | "form_submit" | "time_spent" | "custom_event"
  triggerConditions: {
    selector?: string
    url?: string
    timeThreshold?: number
    customEventName?: string
    metadata?: Record<string, any>
  }
  points: number
  isRequired: boolean
  category: "onboarding" | "engagement" | "conversion" | "retention" | "custom"
  createdAt: string
  updatedAt: string
}

// Mock storage for milestones (in production, use a real database)
const milestones: Map<string, CustomMilestone> = new Map()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const journeyId = searchParams.get("journeyId")
    const category = searchParams.get("category")

    let filteredMilestones = Array.from(milestones.values())

    if (journeyId) {
      filteredMilestones = filteredMilestones.filter((m) => m.journeyId === journeyId)
    }

    if (category) {
      filteredMilestones = filteredMilestones.filter((m) => m.category === category)
    }

    return NextResponse.json({
      success: true,
      milestones: filteredMilestones,
      total: filteredMilestones.length,
    })
  } catch (error) {
    console.error("Milestones retrieval error:", error)
    return NextResponse.json({ success: false, error: "Failed to retrieve milestones" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const milestoneData: CustomMilestone = await request.json()

    // Validate required fields
    if (!milestoneData.name || !milestoneData.journeyId || !milestoneData.triggerType) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Store milestone
    milestones.set(milestoneData.id, milestoneData)

    console.log("Milestone created:", {
      id: milestoneData.id,
      name: milestoneData.name,
      journey: milestoneData.journeyId,
      trigger: milestoneData.triggerType,
    })

    return NextResponse.json({
      success: true,
      milestone: milestoneData,
    })
  } catch (error) {
    console.error("Milestone creation error:", error)
    return NextResponse.json({ success: false, error: "Failed to create milestone" }, { status: 500 })
  }
}
