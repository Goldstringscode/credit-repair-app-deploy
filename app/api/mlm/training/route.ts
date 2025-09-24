import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const category = searchParams.get("category") || "all"

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Mock training data
    const trainingPrograms = [
      {
        id: "mlm_basics",
        title: "MLM Fundamentals",
        description: "Master the basics of network marketing and our compensation plan",
        category: "onboarding",
        level: "beginner",
        duration: 120, // minutes
        modules: [
          {
            id: "module_1",
            title: "Introduction to MLM",
            type: "video",
            duration: 30,
            completed: true,
            score: 95,
          },
          {
            id: "module_2",
            title: "Compensation Plan Overview",
            type: "video",
            duration: 45,
            completed: true,
            score: 88,
          },
          {
            id: "module_3",
            title: "Getting Started Checklist",
            type: "interactive",
            duration: 25,
            completed: false,
            score: null,
          },
          {
            id: "module_4",
            title: "Knowledge Check",
            type: "quiz",
            duration: 20,
            completed: false,
            score: null,
          },
        ],
        completionRate: 50,
        certificateAwarded: false,
        requiredForRank: "consultant",
      },
      {
        id: "prospecting_mastery",
        title: "Prospecting & Recruiting Mastery",
        description: "Advanced techniques for finding and recruiting quality team members",
        category: "sales",
        level: "intermediate",
        duration: 180,
        modules: [
          {
            id: "module_1",
            title: "Identifying Prospects",
            type: "video",
            duration: 40,
            completed: true,
            score: 92,
          },
          {
            id: "module_2",
            title: "Approach Scripts & Techniques",
            type: "video",
            duration: 50,
            completed: true,
            score: 87,
          },
          {
            id: "module_3",
            title: "Handling Objections",
            type: "interactive",
            duration: 45,
            completed: false,
            score: null,
          },
          {
            id: "module_4",
            title: "Closing Techniques",
            type: "video",
            duration: 35,
            completed: false,
            score: null,
          },
          {
            id: "module_5",
            title: "Role-Play Scenarios",
            type: "interactive",
            duration: 10,
            completed: false,
            score: null,
          },
        ],
        completionRate: 40,
        certificateAwarded: false,
        requiredForRank: "manager",
      },
      {
        id: "leadership_development",
        title: "Leadership Development",
        description: "Build the skills needed to lead and motivate your team",
        category: "leadership",
        level: "advanced",
        duration: 240,
        modules: [
          {
            id: "module_1",
            title: "Leadership Principles",
            type: "video",
            duration: 60,
            completed: false,
            score: null,
          },
          {
            id: "module_2",
            title: "Team Motivation Strategies",
            type: "video",
            duration: 50,
            completed: false,
            score: null,
          },
          {
            id: "module_3",
            title: "Coaching & Mentoring",
            type: "interactive",
            duration: 70,
            completed: false,
            score: null,
          },
          {
            id: "module_4",
            title: "Building Team Culture",
            type: "video",
            duration: 40,
            completed: false,
            score: null,
          },
          {
            id: "module_5",
            title: "Leadership Assessment",
            type: "quiz",
            duration: 20,
            completed: false,
            score: null,
          },
        ],
        completionRate: 0,
        certificateAwarded: false,
        requiredForRank: "director",
      },
      {
        id: "product_knowledge",
        title: "Credit Repair Product Mastery",
        description: "Deep dive into our credit repair services and how to present them",
        category: "product",
        level: "beginner",
        duration: 90,
        modules: [
          {
            id: "module_1",
            title: "Credit Repair Fundamentals",
            type: "video",
            duration: 30,
            completed: true,
            score: 94,
          },
          {
            id: "module_2",
            title: "AI Technology Overview",
            type: "video",
            duration: 25,
            completed: true,
            score: 91,
          },
          {
            id: "module_3",
            title: "Service Packages & Pricing",
            type: "text",
            duration: 20,
            completed: true,
            score: 89,
          },
          {
            id: "module_4",
            title: "Product Knowledge Quiz",
            type: "quiz",
            duration: 15,
            completed: true,
            score: 96,
          },
        ],
        completionRate: 100,
        certificateAwarded: true,
        requiredForRank: null,
      },
      {
        id: "compliance_training",
        title: "Legal Compliance & Ethics",
        description: "Essential compliance training for network marketing",
        category: "compliance",
        level: "beginner",
        duration: 60,
        modules: [
          {
            id: "module_1",
            title: "FTC Guidelines",
            type: "text",
            duration: 20,
            completed: true,
            score: 100,
          },
          {
            id: "module_2",
            title: "Income Disclaimers",
            type: "video",
            duration: 15,
            completed: true,
            score: 98,
          },
          {
            id: "module_3",
            title: "Ethical Recruiting",
            type: "video",
            duration: 15,
            completed: true,
            score: 95,
          },
          {
            id: "module_4",
            title: "Compliance Quiz",
            type: "quiz",
            duration: 10,
            completed: true,
            score: 100,
          },
        ],
        completionRate: 100,
        certificateAwarded: true,
        requiredForRank: "associate",
      },
    ]

    const filteredPrograms =
      category === "all" ? trainingPrograms : trainingPrograms.filter((program) => program.category === category)

    const userProgress = {
      totalPrograms: trainingPrograms.length,
      completedPrograms: trainingPrograms.filter((p) => p.completionRate === 100).length,
      inProgressPrograms: trainingPrograms.filter((p) => p.completionRate > 0 && p.completionRate < 100).length,
      certificatesEarned: trainingPrograms.filter((p) => p.certificateAwarded).length,
      totalHoursCompleted: 4.5,
      averageScore: 93.2,
    }

    return NextResponse.json({
      success: true,
      data: {
        programs: filteredPrograms,
        userProgress,
        categories: ["onboarding", "sales", "leadership", "product", "compliance"],
      },
    })
  } catch (error) {
    console.error("Training data fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch training data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, programId, moduleId, action, score } = body

    if (!userId || !programId || !action) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 })
    }

    // In a real app, you would:
    // 1. Update user progress in database
    // 2. Calculate completion percentage
    // 3. Award certificates if applicable
    // 4. Update user rank requirements
    // 5. Send progress notifications

    let message = ""
    switch (action) {
      case "complete_module":
        message = "Module completed successfully"
        break
      case "start_program":
        message = "Training program started"
        break
      case "complete_program":
        message = "Congratulations! Program completed and certificate awarded"
        break
      default:
        message = "Progress updated"
    }

    return NextResponse.json({
      success: true,
      message,
      data: {
        programId,
        moduleId,
        action,
        score,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Training progress update error:", error)
    return NextResponse.json({ error: "Failed to update training progress" }, { status: 500 })
  }
}
