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

interface JourneyMetrics {
  activeUsers: number
  completionRate: number
  avgTimePerStep: number
  dropoffRate: number
  revenueGenerated: number
}

interface RealtimeJourneyData {
  currentUsers: Map<string, JourneyEvent>
  journeyMetrics: Map<string, JourneyMetrics>
  recentEvents: JourneyEvent[]
  alerts: JourneyAlert[]
}

interface JourneyAlert {
  id: string
  type: "high_dropoff" | "low_conversion" | "unusual_activity" | "revenue_spike"
  severity: "low" | "medium" | "high" | "critical"
  message: string
  journeyId: string
  stepId?: string
  timestamp: string
  acknowledged: boolean
}

class RealtimeJourneyTracker {
  private static instance: RealtimeJourneyTracker
  private data: RealtimeJourneyData
  private subscribers: Set<(data: RealtimeJourneyData) => void>
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  private constructor() {
    this.data = {
      currentUsers: new Map(),
      journeyMetrics: new Map(),
      recentEvents: [],
      alerts: [],
    }
    this.subscribers = new Set()
    this.initializeWebSocket()
    this.startMetricsCalculation()
  }

  static getInstance(): RealtimeJourneyTracker {
    if (!RealtimeJourneyTracker.instance) {
      RealtimeJourneyTracker.instance = new RealtimeJourneyTracker()
    }
    return RealtimeJourneyTracker.instance
  }

  private initializeWebSocket() {
    try {
      // In production, use your WebSocket server URL
      const wsUrl =
        process.env.NODE_ENV === "production"
          ? "wss://your-domain.com/ws/journey-tracking"
          : "ws://localhost:3001/ws/journey-tracking"

      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log("Journey tracking WebSocket connected")
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = (event) => {
        try {
          const journeyEvent: JourneyEvent = JSON.parse(event.data)
          this.handleJourneyEvent(journeyEvent)
        } catch (error) {
          console.error("Error parsing journey event:", error)
        }
      }

      this.ws.onclose = () => {
        console.log("Journey tracking WebSocket disconnected")
        this.attemptReconnect()
      }

      this.ws.onerror = (error) => {
        console.error("Journey tracking WebSocket error:", error)
      }
    } catch (error) {
      console.error("Failed to initialize WebSocket:", error)
      // Fallback to polling if WebSocket fails
      this.startPolling()
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = Math.pow(2, this.reconnectAttempts) * 1000 // Exponential backoff

      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
        this.initializeWebSocket()
      }, delay)
    } else {
      console.log("Max reconnection attempts reached, falling back to polling")
      this.startPolling()
    }
  }

  private startPolling() {
    // Fallback polling mechanism
    setInterval(async () => {
      try {
        const response = await fetch("/api/journey-tracking/events")
        const events = await response.json()
        events.forEach((event: JourneyEvent) => this.handleJourneyEvent(event))
      } catch (error) {
        console.error("Polling error:", error)
      }
    }, 5000) // Poll every 5 seconds
  }

  private handleJourneyEvent(event: JourneyEvent) {
    // Update current users
    if (event.event === "step_start") {
      this.data.currentUsers.set(event.userId, event)
    } else if (event.event === "journey_complete" || event.event === "step_abandon") {
      this.data.currentUsers.delete(event.userId)
    }

    // Add to recent events
    this.data.recentEvents.unshift(event)
    if (this.data.recentEvents.length > 100) {
      this.data.recentEvents = this.data.recentEvents.slice(0, 100)
    }

    // Update metrics
    this.updateJourneyMetrics(event)

    // Check for alerts
    this.checkForAlerts(event)

    // Notify subscribers
    this.notifySubscribers()
  }

  private updateJourneyMetrics(event: JourneyEvent) {
    const journeyId = event.journeyId
    let metrics = this.data.journeyMetrics.get(journeyId)

    if (!metrics) {
      metrics = {
        activeUsers: 0,
        completionRate: 0,
        avgTimePerStep: 0,
        dropoffRate: 0,
        revenueGenerated: 0,
      }
    }

    // Update active users count
    metrics.activeUsers = Array.from(this.data.currentUsers.values()).filter((e) => e.journeyId === journeyId).length

    // Calculate completion rate (simplified)
    const recentJourneyEvents = this.data.recentEvents.filter((e) => e.journeyId === journeyId).slice(0, 50) // Last 50 events

    const completions = recentJourneyEvents.filter((e) => e.event === "journey_complete").length
    const starts = recentJourneyEvents.filter((e) => e.event === "step_start" && e.stepId === "landing").length
    metrics.completionRate = starts > 0 ? (completions / starts) * 100 : 0

    // Calculate average time per step
    const timeSpentEvents = recentJourneyEvents.filter((e) => e.metadata.timeSpent)
    if (timeSpentEvents.length > 0) {
      const totalTime = timeSpentEvents.reduce((sum, e) => sum + (e.metadata.timeSpent || 0), 0)
      metrics.avgTimePerStep = totalTime / timeSpentEvents.length
    }

    // Calculate dropoff rate
    const abandons = recentJourneyEvents.filter((e) => e.event === "step_abandon").length
    metrics.dropoffRate = starts > 0 ? (abandons / starts) * 100 : 0

    this.data.journeyMetrics.set(journeyId, metrics)
  }

  private checkForAlerts(event: JourneyEvent) {
    const metrics = this.data.journeyMetrics.get(event.journeyId)
    if (!metrics) return

    // High dropoff alert
    if (metrics.dropoffRate > 50) {
      this.addAlert({
        id: `dropoff_${event.journeyId}_${Date.now()}`,
        type: "high_dropoff",
        severity: "high",
        message: `High dropoff rate detected in ${event.journeyId}: ${metrics.dropoffRate.toFixed(1)}%`,
        journeyId: event.journeyId,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      })
    }

    // Low conversion alert
    if (metrics.completionRate < 20) {
      this.addAlert({
        id: `conversion_${event.journeyId}_${Date.now()}`,
        type: "low_conversion",
        severity: "medium",
        message: `Low conversion rate in ${event.journeyId}: ${metrics.completionRate.toFixed(1)}%`,
        journeyId: event.journeyId,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      })
    }

    // Unusual activity alert
    if (metrics.activeUsers > 100) {
      this.addAlert({
        id: `activity_${event.journeyId}_${Date.now()}`,
        type: "unusual_activity",
        severity: "low",
        message: `Unusual high activity in ${event.journeyId}: ${metrics.activeUsers} active users`,
        journeyId: event.journeyId,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      })
    }
  }

  private addAlert(alert: JourneyAlert) {
    // Avoid duplicate alerts
    const existingAlert = this.data.alerts.find(
      (a) => a.type === alert.type && a.journeyId === alert.journeyId && !a.acknowledged,
    )

    if (!existingAlert) {
      this.data.alerts.unshift(alert)
      if (this.data.alerts.length > 50) {
        this.data.alerts = this.data.alerts.slice(0, 50)
      }
    }
  }

  private startMetricsCalculation() {
    // Recalculate metrics every 30 seconds
    setInterval(() => {
      this.data.journeyMetrics.forEach((metrics, journeyId) => {
        // Recalculate metrics based on recent events
        const recentEvents = this.data.recentEvents.filter((e) => e.journeyId === journeyId).slice(0, 100)

        // Update metrics...
        this.notifySubscribers()
      })
    }, 30000)
  }

  private notifySubscribers() {
    this.subscribers.forEach((callback) => {
      try {
        callback(this.data)
      } catch (error) {
        console.error("Error notifying subscriber:", error)
      }
    })
  }

  // Public methods
  subscribe(callback: (data: RealtimeJourneyData) => void): () => void {
    this.subscribers.add(callback)

    // Send initial data
    callback(this.data)

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback)
    }
  }

  trackEvent(event: Omit<JourneyEvent, "id" | "timestamp">) {
    const fullEvent: JourneyEvent = {
      ...event,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    }

    // Send to server if WebSocket is connected
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(fullEvent))
    } else {
      // Fallback to HTTP API
      fetch("/api/journey-tracking/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullEvent),
      }).catch((error) => console.error("Failed to track event:", error))
    }

    // Handle locally for immediate feedback
    this.handleJourneyEvent(fullEvent)
  }

  acknowledgeAlert(alertId: string) {
    const alert = this.data.alerts.find((a) => a.id === alertId)
    if (alert) {
      alert.acknowledged = true
      this.notifySubscribers()
    }
  }

  getCurrentData(): RealtimeJourneyData {
    return { ...this.data }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.subscribers.clear()
  }
}

export default RealtimeJourneyTracker
export type { JourneyEvent, JourneyMetrics, RealtimeJourneyData, JourneyAlert }
