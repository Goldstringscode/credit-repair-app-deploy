interface CustomMilestone {
  id: string
  name: string
  description: string
  journeyId: string
  stepId?: string
  triggerType: "page_view" | "button_click" | "form_submit" | "time_spent" | "custom_event"
  triggerConditions: {
    selector?: string // CSS selector for click/form events
    url?: string // URL pattern for page views
    timeThreshold?: number // Time in seconds
    customEventName?: string // Custom event name
    metadata?: Record<string, any> // Additional conditions
  }
  points: number
  isRequired: boolean
  category: "onboarding" | "engagement" | "conversion" | "retention" | "custom"
  createdAt: string
  updatedAt: string
}

interface MilestoneProgress {
  id: string
  userId: string
  sessionId: string
  milestoneId: string
  journeyId: string
  status: "not_started" | "in_progress" | "completed" | "failed"
  completedAt?: string
  timeToComplete?: number // Time in seconds
  metadata: Record<string, any>
  points: number
}

interface MilestoneAnalytics {
  milestoneId: string
  totalAttempts: number
  completions: number
  completionRate: number
  averageTimeToComplete: number
  pointsAwarded: number
  topFailureReasons: string[]
}

class MilestoneTracker {
  private static instance: MilestoneTracker
  private milestones: Map<string, CustomMilestone> = new Map()
  private userProgress: Map<string, MilestoneProgress[]> = new Map()
  private analytics: Map<string, MilestoneAnalytics> = new Map()
  private observers: Map<string, MutationObserver> = new Map()
  private eventListeners: Map<string, () => void> = new Map()

  private constructor() {
    this.initializeDefaultMilestones()
    this.startAnalyticsCalculation()
  }

  static getInstance(): MilestoneTracker {
    if (!MilestoneTracker.instance) {
      MilestoneTracker.instance = new MilestoneTracker()
    }
    return MilestoneTracker.instance
  }

  private initializeDefaultMilestones() {
    const defaultMilestones: CustomMilestone[] = [
      {
        id: "onboarding_start",
        name: "Started Onboarding",
        description: "User began the onboarding process",
        journeyId: "mlm_onboarding",
        stepId: "welcome",
        triggerType: "page_view",
        triggerConditions: { url: "/mlm/onboarding" },
        points: 10,
        isRequired: true,
        category: "onboarding",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "personal_info_complete",
        name: "Personal Information Completed",
        description: "User completed personal information step",
        journeyId: "mlm_onboarding",
        stepId: "personal_info",
        triggerType: "form_submit",
        triggerConditions: { selector: "form[data-step='personal-info']" },
        points: 25,
        isRequired: true,
        category: "onboarding",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "sponsor_verified",
        name: "Sponsor Verified",
        description: "User successfully verified their sponsor",
        journeyId: "mlm_onboarding",
        stepId: "sponsor_verification",
        triggerType: "custom_event",
        triggerConditions: { customEventName: "sponsor_verified" },
        points: 50,
        isRequired: true,
        category: "onboarding",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "goals_set",
        name: "Goals Set",
        description: "User defined their income and time goals",
        journeyId: "mlm_onboarding",
        stepId: "goal_setting",
        triggerType: "form_submit",
        triggerConditions: { selector: "form[data-step='goals']" },
        points: 30,
        isRequired: true,
        category: "onboarding",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "preferences_saved",
        name: "Preferences Saved",
        description: "User configured their communication preferences",
        journeyId: "mlm_onboarding",
        stepId: "preferences",
        triggerType: "form_submit",
        triggerConditions: { selector: "form[data-step='preferences']" },
        points: 20,
        isRequired: true,
        category: "onboarding",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "onboarding_complete",
        name: "Onboarding Completed",
        description: "User completed the entire onboarding process",
        journeyId: "mlm_onboarding",
        stepId: "completion",
        triggerType: "page_view",
        triggerConditions: { url: "/mlm/welcome" },
        points: 100,
        isRequired: true,
        category: "onboarding",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "first_dashboard_visit",
        name: "First Dashboard Visit",
        description: "User visited the MLM dashboard for the first time",
        journeyId: "mlm_engagement",
        triggerType: "page_view",
        triggerConditions: { url: "/mlm/dashboard" },
        points: 15,
        isRequired: false,
        category: "engagement",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "genealogy_explored",
        name: "Genealogy Tree Explored",
        description: "User explored their genealogy tree",
        journeyId: "mlm_engagement",
        triggerType: "page_view",
        triggerConditions: { url: "/mlm/genealogy" },
        points: 20,
        isRequired: false,
        category: "engagement",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "calculator_used",
        name: "Income Calculator Used",
        description: "User used the compensation calculator",
        journeyId: "mlm_engagement",
        triggerType: "button_click",
        triggerConditions: { selector: "[data-action='calculate-income']" },
        points: 25,
        isRequired: false,
        category: "engagement",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "first_referral_sent",
        name: "First Referral Sent",
        description: "User sent their first referral invitation",
        journeyId: "mlm_conversion",
        triggerType: "custom_event",
        triggerConditions: { customEventName: "referral_sent" },
        points: 75,
        isRequired: false,
        category: "conversion",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "team_builder_accessed",
        name: "Team Builder Accessed",
        description: "User accessed the team building tools",
        journeyId: "mlm_engagement",
        triggerType: "page_view",
        triggerConditions: { url: "/mlm/team-builder" },
        points: 30,
        isRequired: false,
        category: "engagement",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "time_engagement_5min",
        name: "5 Minutes Engaged",
        description: "User spent at least 5 minutes on the platform",
        journeyId: "mlm_engagement",
        triggerType: "time_spent",
        triggerConditions: { timeThreshold: 300 }, // 5 minutes
        points: 10,
        isRequired: false,
        category: "engagement",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    defaultMilestones.forEach((milestone) => {
      this.milestones.set(milestone.id, milestone)
    })
  }

  // Public API methods
  createMilestone(milestone: Omit<CustomMilestone, "id" | "createdAt" | "updatedAt">): string {
    const id = `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newMilestone: CustomMilestone = {
      ...milestone,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.milestones.set(id, newMilestone)
    this.setupMilestoneTracking(newMilestone)
    this.saveMilestone(newMilestone)

    return id
  }

  updateMilestone(id: string, updates: Partial<CustomMilestone>): boolean {
    const milestone = this.milestones.get(id)
    if (!milestone) return false

    const updatedMilestone: CustomMilestone = {
      ...milestone,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    }

    this.milestones.set(id, updatedMilestone)
    this.setupMilestoneTracking(updatedMilestone)
    this.saveMilestone(updatedMilestone)

    return true
  }

  deleteMilestone(id: string): boolean {
    const milestone = this.milestones.get(id)
    if (!milestone) return false

    this.milestones.delete(id)
    this.cleanupMilestoneTracking(id)
    this.deleteMilestoneFromStorage(id)

    return true
  }

  getMilestone(id: string): CustomMilestone | undefined {
    return this.milestones.get(id)
  }

  getMilestonesByJourney(journeyId: string): CustomMilestone[] {
    return Array.from(this.milestones.values()).filter((m) => m.journeyId === journeyId)
  }

  getAllMilestones(): CustomMilestone[] {
    return Array.from(this.milestones.values())
  }

  // User progress tracking
  startTracking(userId: string, sessionId: string, journeyId: string) {
    const journeyMilestones = this.getMilestonesByJourney(journeyId)

    journeyMilestones.forEach((milestone) => {
      this.initializeMilestoneProgress(userId, sessionId, milestone)
      this.setupMilestoneTracking(milestone, userId, sessionId)
    })
  }

  private initializeMilestoneProgress(userId: string, sessionId: string, milestone: CustomMilestone) {
    const progress: MilestoneProgress = {
      id: `progress_${userId}_${milestone.id}_${Date.now()}`,
      userId,
      sessionId,
      milestoneId: milestone.id,
      journeyId: milestone.journeyId,
      status: "not_started",
      metadata: {},
      points: 0,
    }

    const userProgressList = this.userProgress.get(userId) || []
    userProgressList.push(progress)
    this.userProgress.set(userId, userProgressList)
  }

  private setupMilestoneTracking(milestone: CustomMilestone, userId?: string, sessionId?: string) {
    const trackingId = `${milestone.id}_${userId || "global"}`

    // Clean up existing tracking
    this.cleanupMilestoneTracking(trackingId)

    switch (milestone.triggerType) {
      case "page_view":
        this.setupPageViewTracking(milestone, userId, sessionId, trackingId)
        break
      case "button_click":
        this.setupClickTracking(milestone, userId, sessionId, trackingId)
        break
      case "form_submit":
        this.setupFormSubmitTracking(milestone, userId, sessionId, trackingId)
        break
      case "time_spent":
        this.setupTimeTracking(milestone, userId, sessionId, trackingId)
        break
      case "custom_event":
        this.setupCustomEventTracking(milestone, userId, sessionId, trackingId)
        break
    }
  }

  private setupPageViewTracking(milestone: CustomMilestone, userId?: string, sessionId?: string, trackingId?: string) {
    if (typeof window === "undefined") return

    const checkUrl = () => {
      const currentUrl = window.location.pathname
      const targetUrl = milestone.triggerConditions.url

      if (targetUrl && currentUrl.includes(targetUrl)) {
        this.triggerMilestone(milestone.id, userId, sessionId, {
          url: currentUrl,
          timestamp: new Date().toISOString(),
        })
      }
    }

    // Check current URL
    checkUrl()

    // Listen for navigation changes
    const handleNavigation = () => {
      setTimeout(checkUrl, 100) // Small delay to ensure URL has changed
    }

    window.addEventListener("popstate", handleNavigation)
    window.addEventListener("pushstate", handleNavigation)
    window.addEventListener("replacestate", handleNavigation)

    if (trackingId) {
      this.eventListeners.set(trackingId, () => {
        window.removeEventListener("popstate", handleNavigation)
        window.removeEventListener("pushstate", handleNavigation)
        window.removeEventListener("replacestate", handleNavigation)
      })
    }
  }

  private setupClickTracking(milestone: CustomMilestone, userId?: string, sessionId?: string, trackingId?: string) {
    if (typeof window === "undefined") return

    const selector = milestone.triggerConditions.selector
    if (!selector) return

    const handleClick = (event: Event) => {
      const target = event.target as Element
      if (target.matches(selector)) {
        this.triggerMilestone(milestone.id, userId, sessionId, {
          element: selector,
          timestamp: new Date().toISOString(),
          elementText: target.textContent?.trim(),
        })
      }
    }

    document.addEventListener("click", handleClick)

    if (trackingId) {
      this.eventListeners.set(trackingId, () => {
        document.removeEventListener("click", handleClick)
      })
    }
  }

  private setupFormSubmitTracking(
    milestone: CustomMilestone,
    userId?: string,
    sessionId?: string,
    trackingId?: string,
  ) {
    if (typeof window === "undefined") return

    const selector = milestone.triggerConditions.selector
    if (!selector) return

    const handleSubmit = (event: Event) => {
      const target = event.target as Element
      if (target.matches(selector)) {
        this.triggerMilestone(milestone.id, userId, sessionId, {
          form: selector,
          timestamp: new Date().toISOString(),
        })
      }
    }

    document.addEventListener("submit", handleSubmit)

    if (trackingId) {
      this.eventListeners.set(trackingId, () => {
        document.removeEventListener("submit", handleSubmit)
      })
    }
  }

  private setupTimeTracking(milestone: CustomMilestone, userId?: string, sessionId?: string, trackingId?: string) {
    const threshold = milestone.triggerConditions.timeThreshold
    if (!threshold) return

    const startTime = Date.now()

    const timeoutId = setTimeout(() => {
      this.triggerMilestone(milestone.id, userId, sessionId, {
        timeSpent: threshold,
        timestamp: new Date().toISOString(),
      })
    }, threshold * 1000)

    if (trackingId) {
      this.eventListeners.set(trackingId, () => {
        clearTimeout(timeoutId)
      })
    }
  }

  private setupCustomEventTracking(
    milestone: CustomMilestone,
    userId?: string,
    sessionId?: string,
    trackingId?: string,
  ) {
    if (typeof window === "undefined") return

    const eventName = milestone.triggerConditions.customEventName
    if (!eventName) return

    const handleCustomEvent = (event: CustomEvent) => {
      this.triggerMilestone(milestone.id, userId, sessionId, {
        customEvent: eventName,
        eventData: event.detail,
        timestamp: new Date().toISOString(),
      })
    }

    window.addEventListener(eventName, handleCustomEvent as EventListener)

    if (trackingId) {
      this.eventListeners.set(trackingId, () => {
        window.removeEventListener(eventName, handleCustomEvent as EventListener)
      })
    }
  }

  private cleanupMilestoneTracking(trackingId: string) {
    const cleanup = this.eventListeners.get(trackingId)
    if (cleanup) {
      cleanup()
      this.eventListeners.delete(trackingId)
    }

    const observer = this.observers.get(trackingId)
    if (observer) {
      observer.disconnect()
      this.observers.delete(trackingId)
    }
  }

  triggerMilestone(milestoneId: string, userId?: string, sessionId?: string, metadata: Record<string, any> = {}) {
    const milestone = this.milestones.get(milestoneId)
    if (!milestone) return

    if (userId) {
      const userProgressList = this.userProgress.get(userId) || []
      const progress = userProgressList.find((p) => p.milestoneId === milestoneId && p.status !== "completed")

      if (progress) {
        progress.status = "completed"
        progress.completedAt = new Date().toISOString()
        progress.metadata = { ...progress.metadata, ...metadata }
        progress.points = milestone.points

        // Update analytics
        this.updateMilestoneAnalytics(milestoneId, true)

        // Save progress
        this.saveMilestoneProgress(progress)

        // Send milestone achievement notification
        this.sendMilestoneNotification(milestone, progress, userId)

        // Dispatch custom event for other systems to listen
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("milestone_completed", {
              detail: { milestone, progress, userId, sessionId },
            }),
          )
        }

        console.log(`Milestone completed: ${milestone.name} by user ${userId}`)
      }
    }
  }

  // Send milestone achievement notification
  private async sendMilestoneNotification(milestone: any, progress: any, userId: string) {
    try {
      // Import notification service dynamically to avoid circular dependencies
      const { notificationService } = await import('./notification-service')
      
      await notificationService.notifyMilestoneAchieved(
        milestone.name,
        milestone.description || `You've achieved the ${milestone.name} milestone!`
      )
      
      console.log(`Milestone notification sent for: ${milestone.name}`)
    } catch (error) {
      console.error('Failed to send milestone notification:', error)
    }
  }

  // Custom event trigger for external systems
  triggerCustomEvent(eventName: string, data: any = {}) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(eventName, { detail: data }))
    }
  }

  // Analytics and reporting
  private updateMilestoneAnalytics(milestoneId: string, completed: boolean) {
    let analytics = this.analytics.get(milestoneId)

    if (!analytics) {
      analytics = {
        milestoneId,
        totalAttempts: 0,
        completions: 0,
        completionRate: 0,
        averageTimeToComplete: 0,
        pointsAwarded: 0,
        topFailureReasons: [],
      }
    }

    analytics.totalAttempts++
    if (completed) {
      analytics.completions++
      const milestone = this.milestones.get(milestoneId)
      if (milestone) {
        analytics.pointsAwarded += milestone.points
      }
    }

    analytics.completionRate = (analytics.completions / analytics.totalAttempts) * 100

    this.analytics.set(milestoneId, analytics)
  }

  getMilestoneAnalytics(milestoneId: string): MilestoneAnalytics | undefined {
    return this.analytics.get(milestoneId)
  }

  getAllAnalytics(): MilestoneAnalytics[] {
    return Array.from(this.analytics.values())
  }

  getUserProgress(userId: string): MilestoneProgress[] {
    return this.userProgress.get(userId) || []
  }

  getUserMilestoneStats(userId: string) {
    const progress = this.getUserProgress(userId)
    const completed = progress.filter((p) => p.status === "completed")
    const totalPoints = completed.reduce((sum, p) => sum + p.points, 0)

    return {
      totalMilestones: progress.length,
      completedMilestones: completed.length,
      completionRate: progress.length > 0 ? (completed.length / progress.length) * 100 : 0,
      totalPoints,
      recentCompletions: completed
        .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
        .slice(0, 5),
    }
  }

  // Storage methods (mock implementation - replace with real database)
  private async saveMilestone(milestone: CustomMilestone) {
    try {
      await fetch("/api/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(milestone),
      })
    } catch (error) {
      console.error("Failed to save milestone:", error)
    }
  }

  private async saveMilestoneProgress(progress: MilestoneProgress) {
    try {
      await fetch("/api/milestones/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(progress),
      })
    } catch (error) {
      console.error("Failed to save milestone progress:", error)
    }
  }

  private async deleteMilestoneFromStorage(id: string) {
    try {
      await fetch(`/api/milestones/${id}`, {
        method: "DELETE",
      })
    } catch (error) {
      console.error("Failed to delete milestone:", error)
    }
  }

  private startAnalyticsCalculation() {
    // Recalculate analytics every minute
    setInterval(() => {
      this.analytics.forEach((analytics, milestoneId) => {
        // Recalculate metrics based on recent data
        // This would typically query the database for fresh data
      })
    }, 60000)
  }

  // Cleanup
  destroy() {
    this.eventListeners.forEach((cleanup) => cleanup())
    this.observers.forEach((observer) => observer.disconnect())
    this.eventListeners.clear()
    this.observers.clear()
  }
}

export default MilestoneTracker
export type { CustomMilestone, MilestoneProgress, MilestoneAnalytics }
