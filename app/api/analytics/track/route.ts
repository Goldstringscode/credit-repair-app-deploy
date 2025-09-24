import { type NextRequest, NextResponse } from "next/server"

interface AnalyticsEvent {
  event: string
  page?: string
  actionId?: string
  userId?: string
  sessionId?: string
  timestamp: string
  metadata?: Record<string, any>
}

// Mock analytics storage (in production, use a real database)
const analyticsEvents: AnalyticsEvent[] = []

export async function POST(request: NextRequest) {
  try {
    const eventData: AnalyticsEvent = await request.json()

    // Add session and user tracking
    const sessionId = request.headers.get("x-session-id") || generateSessionId()
    const userId = request.headers.get("x-user-id") || "anonymous"

    const enrichedEvent: AnalyticsEvent = {
      ...eventData,
      sessionId,
      userId,
      metadata: {
        ...eventData.metadata,
        userAgent: request.headers.get("user-agent"),
        referer: request.headers.get("referer"),
        ip: request.headers.get("x-forwarded-for") || "unknown",
      },
    }

    // Store event (in production, send to analytics service)
    analyticsEvents.push(enrichedEvent)

    // Log for debugging
    console.log("Analytics Event Tracked:", enrichedEvent)

    // Send to external analytics services
    await Promise.all([
      sendToGoogleAnalytics(enrichedEvent),
      sendToMixpanel(enrichedEvent),
      updateConversionFunnel(enrichedEvent),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Analytics tracking error:", error)
    return NextResponse.json({ success: false, error: "Failed to track event" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventType = searchParams.get("event")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let filteredEvents = analyticsEvents

    if (eventType) {
      filteredEvents = filteredEvents.filter((event) => event.event === eventType)
    }

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      filteredEvents = filteredEvents.filter((event) => {
        const eventDate = new Date(event.timestamp)
        return eventDate >= start && eventDate <= end
      })
    }

    // Calculate metrics
    const metrics = calculateAnalyticsMetrics(filteredEvents)

    return NextResponse.json({
      success: true,
      events: filteredEvents,
      metrics,
    })
  } catch (error) {
    console.error("Analytics retrieval error:", error)
    return NextResponse.json({ success: false, error: "Failed to retrieve analytics" }, { status: 500 })
  }
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

async function sendToGoogleAnalytics(event: AnalyticsEvent) {
  // Mock Google Analytics integration
  console.log("Sending to Google Analytics:", event.event)
}

async function sendToMixpanel(event: AnalyticsEvent) {
  // Mock Mixpanel integration
  console.log("Sending to Mixpanel:", event.event)
}

async function updateConversionFunnel(event: AnalyticsEvent) {
  // Update conversion funnel metrics
  const funnelSteps = [
    "page_view",
    "onboarding_start",
    "sponsor_verification_success",
    "onboarding_complete",
    "first_login",
    "first_referral",
  ]

  if (funnelSteps.includes(event.event)) {
    console.log("Updating conversion funnel for:", event.event)
    // In production, update funnel metrics in database
  }
}

function calculateAnalyticsMetrics(events: AnalyticsEvent[]) {
  const totalEvents = events.length
  const uniqueUsers = new Set(events.map((e) => e.userId)).size
  const uniqueSessions = new Set(events.map((e) => e.sessionId)).size

  const eventCounts = events.reduce(
    (acc, event) => {
      acc[event.event] = (acc[event.event] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const conversionFunnel = calculateConversionFunnel(events)

  return {
    totalEvents,
    uniqueUsers,
    uniqueSessions,
    eventCounts,
    conversionFunnel,
    topEvents: Object.entries(eventCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10),
  }
}

function calculateConversionFunnel(events: AnalyticsEvent[]) {
  const funnelSteps = [
    { step: "page_view", name: "Page Views" },
    { step: "onboarding_start", name: "Started Onboarding" },
    { step: "sponsor_verification_success", name: "Verified Sponsor" },
    { step: "onboarding_complete", name: "Completed Onboarding" },
    { step: "first_login", name: "First Login" },
    { step: "first_referral", name: "First Referral" },
  ]

  const usersByStep = funnelSteps.map(({ step, name }) => {
    const users = new Set(events.filter((e) => e.event === step).map((e) => e.userId)).size

    return { step, name, users }
  })

  // Calculate conversion rates
  const funnelWithRates = usersByStep.map((current, index) => {
    const conversionRate =
      index === 0 ? 100 : usersByStep[0].users > 0 ? (current.users / usersByStep[0].users) * 100 : 0

    const stepConversionRate =
      index === 0 ? 100 : usersByStep[index - 1].users > 0 ? (current.users / usersByStep[index - 1].users) * 100 : 0

    return {
      ...current,
      conversionRate: Math.round(conversionRate * 100) / 100,
      stepConversionRate: Math.round(stepConversionRate * 100) / 100,
    }
  })

  return funnelWithRates
}
