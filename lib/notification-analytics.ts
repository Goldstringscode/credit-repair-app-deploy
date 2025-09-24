export interface NotificationAnalytics {
  id: string
  notificationId: string
  userId: string
  templateId: string
  category: string
  type: string
  priority: string
  sentAt: Date
  readAt?: Date
  clickedAt?: Date
  actionClicked?: string
  dismissedAt?: Date
  expiredAt?: Date
  deliveryMethod: 'in_app' | 'push' | 'email' | 'sms'
  deviceInfo?: {
    userAgent: string
    platform: string
    browser?: string
  }
  sessionInfo?: {
    sessionId: string
    pageUrl: string
    referrer?: string
  }
}

export interface UserEngagementProfile {
  userId: string
  totalNotifications: number
  readRate: number
  clickRate: number
  averageReadTime: number // seconds
  preferredCategories: string[]
  preferredTypes: string[]
  preferredTimes: number[] // hours of day
  engagementScore: number // 0-100
  lastActiveAt: Date
  notificationFrequency: 'low' | 'medium' | 'high'
  optOutCategories: string[]
  optOutTypes: string[]
}

export interface NotificationMetrics {
  totalSent: number
  totalRead: number
  totalClicked: number
  totalDismissed: number
  totalExpired: number
  readRate: number
  clickRate: number
  dismissalRate: number
  expirationRate: number
  averageReadTime: number
  engagementScore: number
  topCategories: Array<{ category: string; count: number; rate: number }>
  topTypes: Array<{ type: string; count: number; rate: number }>
  topTemplates: Array<{ templateId: string; count: number; rate: number }>
  hourlyDistribution: number[]
  dailyDistribution: number[]
  weeklyDistribution: number[]
}

class NotificationAnalyticsService {
  private analytics: Map<string, NotificationAnalytics> = new Map()
  private userProfiles: Map<string, UserEngagementProfile> = new Map()
  private isInitialized = false

  constructor() {
    this.initializeService()
  }

  private initializeService() {
    if (this.isInitialized) return

    // Initialize with some sample data
    this.initializeSampleData()
    this.isInitialized = true
    console.log('📊 Notification analytics service initialized')
  }

  private initializeSampleData() {
    const sampleAnalytics: NotificationAnalytics[] = [
      {
        id: 'analytics_1',
        notificationId: 'notif_1',
        userId: '550e8400-e29b-41d4-a716-446655440000',
        templateId: 'credit-score-increase',
        category: 'credit',
        type: 'success',
        priority: 'high',
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        readAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
        clickedAt: new Date(Date.now() - 1.4 * 60 * 60 * 1000), // 1.4 hours ago
        actionClicked: 'view_credit_report',
        deliveryMethod: 'in_app',
        deviceInfo: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          platform: 'Windows',
          browser: 'Chrome'
        }
      },
      {
        id: 'analytics_2',
        notificationId: 'notif_2',
        userId: '550e8400-e29b-41d4-a716-446655440000',
        templateId: 'dispute-submitted',
        category: 'dispute',
        type: 'info',
        priority: 'medium',
        sentAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        readAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000), // 3.5 hours ago
        deliveryMethod: 'in_app'
      },
      {
        id: 'analytics_3',
        notificationId: 'notif_3',
        userId: '550e8400-e29b-41d4-a716-446655440000',
        templateId: 'course-completed',
        category: 'training',
        type: 'success',
        priority: 'medium',
        sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        readAt: new Date(Date.now() - 23 * 60 * 60 * 1000), // 23 hours ago
        clickedAt: new Date(Date.now() - 22.5 * 60 * 60 * 1000), // 22.5 hours ago
        actionClicked: 'view_certificate',
        deliveryMethod: 'in_app'
      }
    ]

    sampleAnalytics.forEach(analytics => {
      this.analytics.set(analytics.id, analytics)
    })

    // Initialize user profile
    const userProfile: UserEngagementProfile = {
      userId: '550e8400-e29b-41d4-a716-446655440000',
      totalNotifications: 3,
      readRate: 100, // 3/3 read
      clickRate: 66.7, // 2/3 clicked
      averageReadTime: 1800, // 30 minutes average
      preferredCategories: ['credit', 'dispute', 'training'],
      preferredTypes: ['success', 'info'],
      preferredTimes: [9, 14, 18], // 9 AM, 2 PM, 6 PM
      engagementScore: 85,
      lastActiveAt: new Date(),
      notificationFrequency: 'medium',
      optOutCategories: [],
      optOutTypes: ['error']
    }

    this.userProfiles.set(userProfile.userId, userProfile)
  }

  /**
   * Track when a notification is sent
   */
  trackNotificationSent(
    notificationId: string,
    userId: string,
    templateId: string,
    category: string,
    type: string,
    priority: string,
    deliveryMethod: 'in_app' | 'push' | 'email' | 'sms' = 'in_app'
  ): string {
    const analyticsId = `analytics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const analytics: NotificationAnalytics = {
      id: analyticsId,
      notificationId,
      userId,
      templateId,
      category,
      type,
      priority,
      sentAt: new Date(),
      deliveryMethod,
      deviceInfo: this.getDeviceInfo(),
      sessionInfo: this.getSessionInfo()
    }

    this.analytics.set(analyticsId, analytics)
    this.updateUserProfile(userId, 'sent')
    
    console.log(`📊 Tracked notification sent: ${analyticsId}`)
    return analyticsId
  }

  /**
   * Track when a notification is read
   */
  trackNotificationRead(analyticsId: string): void {
    const analytics = this.analytics.get(analyticsId)
    if (!analytics) {
      console.warn(`Analytics not found: ${analyticsId}`)
      return
    }

    analytics.readAt = new Date()
    this.analytics.set(analyticsId, analytics)
    this.updateUserProfile(analytics.userId, 'read')
    
    console.log(`📊 Tracked notification read: ${analyticsId}`)
  }

  /**
   * Track when a notification action is clicked
   */
  trackNotificationClick(analyticsId: string, action: string): void {
    const analytics = this.analytics.get(analyticsId)
    if (!analytics) {
      console.warn(`Analytics not found: ${analyticsId}`)
      return
    }

    analytics.clickedAt = new Date()
    analytics.actionClicked = action
    this.analytics.set(analyticsId, analytics)
    this.updateUserProfile(analytics.userId, 'clicked')
    
    console.log(`📊 Tracked notification click: ${analyticsId} - ${action}`)
  }

  /**
   * Track when a notification is dismissed
   */
  trackNotificationDismissed(analyticsId: string): void {
    const analytics = this.analytics.get(analyticsId)
    if (!analytics) {
      console.warn(`Analytics not found: ${analyticsId}`)
      return
    }

    analytics.dismissedAt = new Date()
    this.analytics.set(analyticsId, analytics)
    this.updateUserProfile(analytics.userId, 'dismissed')
    
    console.log(`📊 Tracked notification dismissed: ${analyticsId}`)
  }

  /**
   * Track when a notification expires
   */
  trackNotificationExpired(analyticsId: string): void {
    const analytics = this.analytics.get(analyticsId)
    if (!analytics) {
      console.warn(`Analytics not found: ${analyticsId}`)
      return
    }

    analytics.expiredAt = new Date()
    this.analytics.set(analyticsId, analytics)
    this.updateUserProfile(analytics.userId, 'expired')
    
    console.log(`📊 Tracked notification expired: ${analyticsId}`)
  }

  /**
   * Get overall metrics
   */
  getOverallMetrics(): NotificationMetrics {
    const allAnalytics = Array.from(this.analytics.values())
    
    if (allAnalytics.length === 0) {
      return this.getEmptyMetrics()
    }

    const totalSent = allAnalytics.length
    const totalRead = allAnalytics.filter(a => a.readAt).length
    const totalClicked = allAnalytics.filter(a => a.clickedAt).length
    const totalDismissed = allAnalytics.filter(a => a.dismissedAt).length
    const totalExpired = allAnalytics.filter(a => a.expiredAt).length

    const readRate = (totalRead / totalSent) * 100
    const clickRate = (totalClicked / totalSent) * 100
    const dismissalRate = (totalDismissed / totalSent) * 100
    const expirationRate = (totalExpired / totalSent) * 100

    // Calculate average read time
    const readAnalytics = allAnalytics.filter(a => a.readAt && a.clickedAt)
    const averageReadTime = readAnalytics.length > 0 
      ? readAnalytics.reduce((sum, a) => {
          const readTime = a.clickedAt!.getTime() - a.readAt!.getTime()
          return sum + readTime
        }, 0) / readAnalytics.length / 1000 // Convert to seconds
      : 0

    // Calculate engagement score
    const engagementScore = (readRate * 0.4 + clickRate * 0.6)

    // Category distribution
    const categoryCounts = allAnalytics.reduce((acc, a) => {
      acc[a.category] = (acc[a.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({
        category,
        count,
        rate: (count / totalSent) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Type distribution
    const typeCounts = allAnalytics.reduce((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topTypes = Object.entries(typeCounts)
      .map(([type, count]) => ({
        type,
        count,
        rate: (count / totalSent) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Template distribution
    const templateCounts = allAnalytics.reduce((acc, a) => {
      acc[a.templateId] = (acc[a.templateId] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topTemplates = Object.entries(templateCounts)
      .map(([templateId, count]) => ({
        templateId,
        count,
        rate: (count / totalSent) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Time distribution
    const hourlyDistribution = new Array(24).fill(0)
    const dailyDistribution = new Array(7).fill(0)
    const weeklyDistribution = new Array(52).fill(0)

    allAnalytics.forEach(analytics => {
      const hour = analytics.sentAt.getHours()
      const day = analytics.sentAt.getDay()
      const week = Math.floor((Date.now() - analytics.sentAt.getTime()) / (7 * 24 * 60 * 60 * 1000))
      
      hourlyDistribution[hour]++
      dailyDistribution[day]++
      if (week < 52) weeklyDistribution[week]++
    })

    return {
      totalSent,
      totalRead,
      totalClicked,
      totalDismissed,
      totalExpired,
      readRate: Math.round(readRate * 100) / 100,
      clickRate: Math.round(clickRate * 100) / 100,
      dismissalRate: Math.round(dismissalRate * 100) / 100,
      expirationRate: Math.round(expirationRate * 100) / 100,
      averageReadTime: Math.round(averageReadTime),
      engagementScore: Math.round(engagementScore * 100) / 100,
      topCategories,
      topTypes,
      topTemplates,
      hourlyDistribution,
      dailyDistribution,
      weeklyDistribution
    }
  }

  /**
   * Get user engagement profile
   */
  getUserEngagementProfile(userId: string): UserEngagementProfile | null {
    return this.userProfiles.get(userId) || null
  }

  /**
   * Get analytics for a specific notification
   */
  getNotificationAnalytics(notificationId: string): NotificationAnalytics | null {
    const analytics = Array.from(this.analytics.values())
      .find(a => a.notificationId === notificationId)
    return analytics || null
  }

  /**
   * Get analytics for a user
   */
  getUserAnalytics(userId: string): NotificationAnalytics[] {
    return Array.from(this.analytics.values())
      .filter(a => a.userId === userId)
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime())
  }

  /**
   * Update user profile based on interaction
   */
  private updateUserProfile(userId: string, interaction: 'sent' | 'read' | 'clicked' | 'dismissed' | 'expired'): void {
    let profile = this.userProfiles.get(userId)
    if (!profile) {
      profile = this.createDefaultUserProfile(userId)
      this.userProfiles.set(userId, profile)
    }

    // Update basic stats
    if (interaction === 'sent') {
      profile.totalNotifications++
    }

    // Recalculate rates
    const userAnalytics = this.getUserAnalytics(userId)
    if (userAnalytics.length > 0) {
      profile.readRate = (userAnalytics.filter(a => a.readAt).length / userAnalytics.length) * 100
      profile.clickRate = (userAnalytics.filter(a => a.clickedAt).length / userAnalytics.length) * 100
      
      // Calculate average read time
      const readAnalytics = userAnalytics.filter(a => a.readAt && a.clickedAt)
      if (readAnalytics.length > 0) {
        profile.averageReadTime = readAnalytics.reduce((sum, a) => {
          const readTime = a.clickedAt!.getTime() - a.readAt!.getTime()
          return sum + readTime
        }, 0) / readAnalytics.length / 1000
      }

      // Update preferred categories and types
      const categoryCounts = userAnalytics.reduce((acc, a) => {
        acc[a.category] = (acc[a.category] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const typeCounts = userAnalytics.reduce((acc, a) => {
        acc[a.type] = (acc[a.type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      profile.preferredCategories = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([category]) => category)

      profile.preferredTypes = Object.entries(typeCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([type]) => type)

      // Update engagement score
      profile.engagementScore = (profile.readRate * 0.4 + profile.clickRate * 0.6)
      
      // Update frequency
      if (profile.totalNotifications > 20) {
        profile.notificationFrequency = 'high'
      } else if (profile.totalNotifications > 10) {
        profile.notificationFrequency = 'medium'
      } else {
        profile.notificationFrequency = 'low'
      }
    }

    profile.lastActiveAt = new Date()
    this.userProfiles.set(userId, profile)
  }

  /**
   * Create default user profile
   */
  private createDefaultUserProfile(userId: string): UserEngagementProfile {
    return {
      userId,
      totalNotifications: 0,
      readRate: 0,
      clickRate: 0,
      averageReadTime: 0,
      preferredCategories: [],
      preferredTypes: [],
      preferredTimes: [],
      engagementScore: 0,
      lastActiveAt: new Date(),
      notificationFrequency: 'low',
      optOutCategories: [],
      optOutTypes: []
    }
  }

  /**
   * Get device info
   */
  private getDeviceInfo() {
    if (typeof window === 'undefined') return undefined

    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      browser: this.getBrowserName()
    }
  }

  /**
   * Get session info
   */
  private getSessionInfo() {
    if (typeof window === 'undefined') return undefined

    return {
      sessionId: this.getSessionId(),
      pageUrl: window.location.href,
      referrer: document.referrer || undefined
    }
  }

  /**
   * Get browser name from user agent
   */
  private getBrowserName(): string {
    if (typeof window === 'undefined') return 'Unknown'

    const userAgent = navigator.userAgent
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    return 'Other'
  }

  /**
   * Get or create session ID
   */
  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server-session'

    let sessionId = sessionStorage.getItem('notification-session-id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('notification-session-id', sessionId)
    }
    return sessionId
  }

  /**
   * Get empty metrics
   */
  private getEmptyMetrics(): NotificationMetrics {
    return {
      totalSent: 0,
      totalRead: 0,
      totalClicked: 0,
      totalDismissed: 0,
      totalExpired: 0,
      readRate: 0,
      clickRate: 0,
      dismissalRate: 0,
      expirationRate: 0,
      averageReadTime: 0,
      engagementScore: 0,
      topCategories: [],
      topTypes: [],
      topTemplates: [],
      hourlyDistribution: new Array(24).fill(0),
      dailyDistribution: new Array(7).fill(0),
      weeklyDistribution: new Array(52).fill(0)
    }
  }

  /**
   * Clean up old analytics data
   */
  cleanupOldData(daysOld: number = 90): void {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000)
    let deletedCount = 0

    for (const [id, analytics] of this.analytics.entries()) {
      if (analytics.sentAt < cutoffDate) {
        this.analytics.delete(id)
        deletedCount++
      }
    }

    console.log(`🧹 Cleaned up ${deletedCount} old analytics records`)
  }

  /**
   * Export analytics data
   */
  exportAnalytics(userId?: string): NotificationAnalytics[] {
    const allAnalytics = Array.from(this.analytics.values())
    return userId 
      ? allAnalytics.filter(a => a.userId === userId)
      : allAnalytics
  }
}

export { NotificationAnalyticsService }
export const notificationAnalyticsService = new NotificationAnalyticsService()