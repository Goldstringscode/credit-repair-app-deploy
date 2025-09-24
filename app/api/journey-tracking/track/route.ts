import { type NextRequest, NextResponse } from "next/server"

interface JourneyEvent {
  id: string
  userId: string
  sessionId: string
  journeyId: string
  stepId: string
  stepName: string
  event: "step_start" | "step_complete" | "step_abandon" | "journey_complete"
  timestamp: string
  metadata: {
    timeSpent?: number
    previousStep?: string
    userAgent?: string
    referrer?: string
    ip?: string
  }
}

// Mock storage for journey events (in production, use a real database)
const journeyEvents: JourneyEvent[] = []

export async function POST(request: NextRequest) {
  try {
    const eventData: JourneyEvent = await request.json()

    // Validate required fields
    if (!eventData.userId || !eventData.journeyId || !eventData.stepId || !eventData.event) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Enrich event with server-side data
    const enrichedEvent: JourneyEvent = {
      ...eventData,
      metadata: {
        ...eventData.metadata,
        userAgent: request.headers.get("user-agent") || undefined,
        referrer: request.headers.get("referer") || undefined,
        ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
      },
    }

    // Store event
    journeyEvents.unshift(enrichedEvent)

    // Keep only last 1000 events in memory
    if (journeyEvents.length > 1000) {
      journeyEvents.splice(1000)
    }

    // In production, you would:
    // 1. Store in database
    // 2. Send to analytics service
    // 3. Broadcast to WebSocket clients
    // 4. Trigger real-time alerts

    console.log("Journey event tracked:", {
      userId: enrichedEvent.userId,
      journey: enrichedEvent.journeyId,
      step: enrichedEvent.stepName,
      event: enrichedEvent.event,
    })

    // Simulate WebSocket broadcast (in production, use actual WebSocket server)
    broadcastToWebSocketClients(enrichedEvent)

    return NextResponse.json({
      success: true,
      eventId: enrichedEvent.id,
      timestamp: enrichedEvent.timestamp,
    })
  } catch (error) {
    console.error("Journey tracking error:", error)
    return NextResponse.json({ success: false, error: "Failed to track journey event" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const journeyId = searchParams.get("journeyId")
    const userId = searchParams.get("userId")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    let filteredEvents = journeyEvents

    if (journeyId) {
      filteredEvents = filteredEvents.filter((event) => event.journeyId === journeyId)
    }

    if (userId) {
      filteredEvents = filteredEvents.filter((event) => event.userId === userId)
    }

    const events = filteredEvents.slice(0, limit)

    return NextResponse.json({
      success: true,
      events,
      total: filteredEvents.length,
    })
  } catch (error) {
    console.error("Journey events retrieval error:", error)
    return NextResponse.json({ success: false, error: "Failed to retrieve journey events" }, { status: 500 })
  }
}

// Mock WebSocket broadcast function
function broadcastToWebSocketClients(event: JourneyEvent) {
  // In production, implement actual WebSocket broadcasting
  console.log("Broadcasting to WebSocket clients:", event.event)

  // You would typically:
  // 1. Get list of connected WebSocket clients
  // 2. Send event to all subscribed clients
  // 3. Handle client disconnections
  // 4. Implement rooms/channels for different journey types
}
