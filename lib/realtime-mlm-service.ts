"use client"

export interface MLMRealtimeEvent {
  type:
    | "team_join"
    | "rank_advancement"
    | "commission_earned"
    | "achievement_unlocked"
    | "training_completed"
    | "message_received"
  data: any
  timestamp: number
  userId?: string
}

export interface MLMStats {
  monthlyEarnings: number
  teamSize: number
  currentRank: string
  activeRate: number
  unreadMessages: number
  pendingTasks: number
}

export interface MLMNotification {
  id: string
  type: "success" | "info" | "warning" | "error"
  title: string
  message: string
  timestamp: number
  read: boolean
  actionUrl?: string
  actionText?: string
  priority: "low" | "medium" | "high"
}

class RealtimeMLMService {
  private static instance: RealtimeMLMService | null = null
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private heartbeatInterval: NodeJS.Timeout | null = null
  private eventListeners: Map<string, Set<(event: MLMRealtimeEvent) => void>> = new Map()
  private statsListeners: Set<(stats: MLMStats) => void> = new Set()
  private notificationListeners: Set<(notification: MLMNotification) => void> = new Set()
  private connectionStatusListeners: Set<(connected: boolean) => void> = new Set()
  private isConnected = false
  private fallbackPollingInterval: NodeJS.Timeout | null = null

  private constructor() {
    this.connect()
    this.startFallbackPolling()
  }

  public static getInstance(): RealtimeMLMService {
    if (!RealtimeMLMService.instance) {
      RealtimeMLMService.instance = new RealtimeMLMService()
    }
    return RealtimeMLMService.instance
  }

  private connect() {
    try {
      // In a real implementation, this would connect to your WebSocket server
      // For demo purposes, we'll simulate the connection
      this.simulateConnection()
    } catch (error) {
      console.error("Failed to connect to WebSocket:", error)
      this.scheduleReconnect()
    }
  }

  private simulateConnection() {
    // Simulate successful connection
    setTimeout(() => {
      this.isConnected = true
      this.reconnectAttempts = 0
      this.notifyConnectionStatus(true)
      this.startHeartbeat()
      this.startSimulatedEvents()
    }, 1000)
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        // In real implementation, send ping to server
        this.simulateHeartbeat()
      }
    }, 30000)
  }

  private simulateHeartbeat() {
    // Simulate heartbeat response
    // In real implementation, handle pong from server
  }

  private startSimulatedEvents() {
    // Simulate various MLM events for demonstration
    const events = [
      {
        type: "team_join" as const,
        data: { memberName: "Sarah Johnson", rank: "Associate" },
        delay: 5000,
      },
      {
        type: "commission_earned" as const,
        data: { amount: 125, type: "Team Bonus" },
        delay: 10000,
      },
      {
        type: "rank_advancement" as const,
        data: { memberName: "Mike Chen", oldRank: "Associate", newRank: "Manager" },
        delay: 15000,
      },
      {
        type: "achievement_unlocked" as const,
        data: { achievement: "Team Builder", description: "Built a team of 50+ members" },
        delay: 20000,
      },
      {
        type: "training_completed" as const,
        data: { memberName: "Lisa Rodriguez", course: "Advanced Sales Techniques" },
        delay: 25000,
      },
      {
        type: "message_received" as const,
        data: { from: "Team Leader", subject: "Weekly Team Update" },
        delay: 30000,
      },
    ]

    events.forEach((event) => {
      setTimeout(() => {
        if (this.isConnected) {
          this.handleEvent({
            ...event,
            timestamp: Date.now(),
          })
        }
      }, event.delay)
    })

    // Continue simulating events every 35 seconds
    setTimeout(() => {
      if (this.isConnected) {
        this.startSimulatedEvents()
      }
    }, 35000)
  }

  private handleEvent(event: MLMRealtimeEvent) {
    // Notify event listeners
    const listeners = this.eventListeners.get(event.type)
    if (listeners) {
      listeners.forEach((listener) => listener(event))
    }

    // Create notification based on event
    const notification = this.createNotificationFromEvent(event)
    if (notification) {
      this.notificationListeners.forEach((listener) => listener(notification))
    }

    // Update stats if needed
    this.updateStatsFromEvent(event)
  }

  private createNotificationFromEvent(event: MLMRealtimeEvent): MLMNotification | null {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    switch (event.type) {
      case "team_join":
        return {
          id,
          type: "success",
          title: "New Team Member!",
          message: `${event.data.memberName} joined your team as ${event.data.rank}`,
          timestamp: event.timestamp,
          read: false,
          actionUrl: "/mlm/genealogy",
          actionText: "View Team",
          priority: "medium",
        }

      case "commission_earned":
        return {
          id,
          type: "success",
          title: "Commission Earned!",
          message: `You earned $${event.data.amount} in ${event.data.type}`,
          timestamp: event.timestamp,
          read: false,
          actionUrl: "/mlm/payouts",
          actionText: "View Earnings",
          priority: "high",
        }

      case "rank_advancement":
        return {
          id,
          type: "success",
          title: "Rank Advancement!",
          message: `${event.data.memberName} advanced from ${event.data.oldRank} to ${event.data.newRank}`,
          timestamp: event.timestamp,
          read: false,
          actionUrl: "/mlm/team-performance",
          actionText: "Celebrate",
          priority: "high",
        }

      case "achievement_unlocked":
        return {
          id,
          type: "info",
          title: "Achievement Unlocked!",
          message: `${event.data.achievement}: ${event.data.description}`,
          timestamp: event.timestamp,
          read: false,
          actionUrl: "/mlm/rewards",
          actionText: "View Rewards",
          priority: "medium",
        }

      case "training_completed":
        return {
          id,
          type: "info",
          title: "Training Completed",
          message: `${event.data.memberName} completed ${event.data.course}`,
          timestamp: event.timestamp,
          read: false,
          actionUrl: "/mlm/team-training",
          actionText: "View Progress",
          priority: "low",
        }

      case "message_received":
        return {
          id,
          type: "info",
          title: "New Message",
          message: `From ${event.data.from}: ${event.data.subject}`,
          timestamp: event.timestamp,
          read: false,
          actionUrl: "/mlm/communication",
          actionText: "Read Message",
          priority: "medium",
        }

      default:
        return null
    }
  }

  private updateStatsFromEvent(event: MLMRealtimeEvent) {
    // Simulate stats updates based on events
    const currentStats = this.getCurrentStats()
    let updated = false

    switch (event.type) {
      case "team_join":
        currentStats.teamSize += 1
        updated = true
        break

      case "commission_earned":
        currentStats.monthlyEarnings += event.data.amount
        updated = true
        break

      case "message_received":
        currentStats.unreadMessages += 1
        updated = true
        break
    }

    if (updated) {
      this.statsListeners.forEach((listener) => listener(currentStats))
    }
  }

  private getCurrentStats(): MLMStats {
    // In real implementation, this would fetch from server
    return {
      monthlyEarnings: 4250,
      teamSize: 47,
      currentRank: "Director",
      activeRate: 89,
      unreadMessages: 3,
      pendingTasks: 2,
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts)
      setTimeout(() => {
        this.reconnectAttempts++
        this.connect()
      }, delay)
    }
  }

  private startFallbackPolling() {
    // Fallback polling when WebSocket is not available
    this.fallbackPollingInterval = setInterval(() => {
      if (!this.isConnected) {
        this.pollForUpdates()
      }
    }, 10000)
  }

  private async pollForUpdates() {
    try {
      // In real implementation, make HTTP requests to get updates
      // For demo, we'll simulate some updates
      const stats = this.getCurrentStats()
      this.statsListeners.forEach((listener) => listener(stats))
    } catch (error) {
      console.error("Polling failed:", error)
    }
  }

  private notifyConnectionStatus(connected: boolean) {
    this.connectionStatusListeners.forEach((listener) => listener(connected))
  }

  // Public methods
  public subscribe(eventType: string, callback: (event: MLMRealtimeEvent) => void) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set())
    }
    this.eventListeners.get(eventType)!.add(callback)

    return () => {
      const listeners = this.eventListeners.get(eventType)
      if (listeners) {
        listeners.delete(callback)
      }
    }
  }

  public subscribeToStats(callback: (stats: MLMStats) => void) {
    this.statsListeners.add(callback)

    // Send current stats immediately
    callback(this.getCurrentStats())

    return () => {
      this.statsListeners.delete(callback)
    }
  }

  public subscribeToNotifications(callback: (notification: MLMNotification) => void) {
    this.notificationListeners.add(callback)

    return () => {
      this.notificationListeners.delete(callback)
    }
  }

  public subscribeToConnectionStatus(callback: (connected: boolean) => void) {
    this.connectionStatusListeners.add(callback)

    // Send current status immediately
    callback(this.isConnected)

    return () => {
      this.connectionStatusListeners.delete(callback)
    }
  }

  public async markNotificationAsRead(notificationId: string) {
    // In real implementation, make API call to mark as read
    try {
      await fetch("/api/mlm/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      })
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  public simulateEvent(eventType: string, data: any) {
    const event: MLMRealtimeEvent = {
      type: eventType as any,
      data,
      timestamp: Date.now(),
    }
    this.handleEvent(event)
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close()
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }
    if (this.fallbackPollingInterval) {
      clearInterval(this.fallbackPollingInterval)
    }
    this.isConnected = false
    this.notifyConnectionStatus(false)
  }

  public getConnectionStatus(): boolean {
    return this.isConnected
  }
}

// Create and export singleton instance
const realtimeMLMService = RealtimeMLMService.getInstance()

export { realtimeMLMService }
export default RealtimeMLMService
