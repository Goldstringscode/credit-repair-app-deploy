import { type NextRequest, NextResponse } from "next/server"

// Mock real-time events for demonstration
const generateMockEvents = () => {
  const journeys = ["onboarding", "subscription", "mlm_activation"]
  const steps = {
    onboarding: ["landing", "signup", "verification", "profile", "mlm_intro", "sponsor_connect", "complete"],
    subscription: [
      "trial_start",
      "feature_exploration",
      "value_realization",
      "pricing_view",
      "payment",
      "subscription_active",
    ],
    mlm_activation: ["mlm_training", "first_referral", "team_building", "rank_advancement", "mlm_success"],
  }
  const events = ["step_start", "step_complete", "step_abandon", "journey_complete"]

  const mockEvents = []
  const now = Date.now()

  for (let i = 0; i < 20; i++) {
    const journeyId = journeys[Math.floor(Math.random() * journeys.length)]
    const stepOptions = steps[journeyId as keyof typeof steps]
    const stepId = stepOptions[Math.floor(Math.random() * stepOptions.length)]
    const event = events[Math.floor(Math.random() * events.length)]

    mockEvents.push({
      id: `event_${now}_${i}`,
      userId: `user_${Math.floor(Math.random() * 1000)}`,
      sessionId: `session_${Math.floor(Math.random() * 500)}`,
      journeyId,
      stepId,
      stepName: stepId.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      event,
      timestamp: new Date(now - i * 30000).toISOString(), // Events every 30 seconds
      metadata: {
        timeSpent: Math.floor(Math.random() * 300) + 30, // 30-330 seconds
        userAgent: "Mozilla/5.0 (compatible; RealtimeTracker/1.0)",
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
      },
    })
  }

  return mockEvents
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const since = searchParams.get("since")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    // Generate mock events for demonstration
    const events = generateMockEvents()

    // Filter by timestamp if 'since' parameter is provided
    let filteredEvents = events
    if (since) {
      const sinceDate = new Date(since)
      filteredEvents = events.filter((event) => new Date(event.timestamp) > sinceDate)
    }

    // Apply limit
    const limitedEvents = filteredEvents.slice(0, limit)

    return NextResponse.json({
      success: true,
      events: limitedEvents,
      total: filteredEvents.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Events polling error:", error)
    return NextResponse.json({ success: false, error: "Failed to retrieve events" }, { status: 500 })
  }
}
