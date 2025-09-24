import { mlmDatabaseService } from './database-service'
import { mlmNotificationSystem } from './notification-system'
import { mlmAnalyticsEngine } from './analytics-engine'

export interface MobileDevice {
  id: string
  userId: string
  deviceToken: string
  platform: 'ios' | 'android' | 'web'
  appVersion: string
  osVersion: string
  isActive: boolean
  lastSeen: Date
  pushEnabled: boolean
  locationEnabled: boolean
  timezone: string
}

export interface PushNotification {
  id: string
  userId: string
  title: string
  body: string
  data?: any
  imageUrl?: string
  actionUrl?: string
  priority: 'low' | 'normal' | 'high'
  category: string
  scheduledAt?: Date
  sentAt?: Date
  status: 'pending' | 'sent' | 'delivered' | 'failed'
  deliveryAttempts: number
  errorMessage?: string
}

export interface MobileAnalytics {
  userId: string
  sessionId: string
  events: MobileEvent[]
  deviceInfo: {
    platform: string
    appVersion: string
    osVersion: string
    screenSize: string
    networkType: string
  }
  location?: {
    latitude: number
    longitude: number
    accuracy: number
    timestamp: Date
  }
  timestamp: Date
}

export interface MobileEvent {
  type: 'screen_view' | 'button_click' | 'form_submit' | 'purchase' | 'share' | 'custom'
  name: string
  properties: any
  timestamp: Date
}

export interface MobileAppConfig {
  features: {
    pushNotifications: boolean
    locationTracking: boolean
    biometricAuth: boolean
    offlineMode: boolean
    darkMode: boolean
  }
  limits: {
    maxFileSize: number
    maxImageSize: number
    sessionTimeout: number
    maxRetries: number
  }
  endpoints: {
    apiBaseUrl: string
    websocketUrl: string
    cdnUrl: string
  }
}

export class MLMMobileIntegration {
  private db = mlmDatabaseService
  private notificationSystem = mlmNotificationSystem
  private analyticsEngine = mlmAnalyticsEngine
  private devices: Map<string, MobileDevice> = new Map()
  private pushQueue: PushNotification[] = []

  constructor() {
    this.initializePushService()
    this.startPushProcessor()
  }

  // Register mobile device
  async registerDevice(deviceData: {
    userId: string
    deviceToken: string
    platform: 'ios' | 'android' | 'web'
    appVersion: string
    osVersion: string
    timezone: string
  }): Promise<MobileDevice> {
    try {
      const device: MobileDevice = {
        id: `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: deviceData.userId,
        deviceToken: deviceData.deviceToken,
        platform: deviceData.platform,
        appVersion: deviceData.appVersion,
        osVersion: deviceData.osVersion,
        isActive: true,
        lastSeen: new Date(),
        pushEnabled: true,
        locationEnabled: false,
        timezone: deviceData.timezone
      }

      this.devices.set(device.id, device)
      
      // Send welcome push notification
      await this.sendPushNotification({
        userId: deviceData.userId,
        title: 'Welcome to MLM Mobile!',
        body: 'Your mobile app is now connected. Stay updated with your MLM performance.',
        category: 'welcome',
        priority: 'normal'
      })

      console.log(`📱 Device registered: ${device.platform} for user ${deviceData.userId}`)
      return device
    } catch (error) {
      console.error('Error registering device:', error)
      throw error
    }
  }

  // Send push notification
  async sendPushNotification(notification: {
    userId: string
    title: string
    body: string
    data?: any
    imageUrl?: string
    actionUrl?: string
    priority?: 'low' | 'normal' | 'high'
    category?: string
    scheduledAt?: Date
  }): Promise<PushNotification> {
    try {
      const pushNotification: PushNotification = {
        id: `push_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: notification.userId,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        imageUrl: notification.imageUrl,
        actionUrl: notification.actionUrl,
        priority: notification.priority || 'normal',
        category: notification.category || 'general',
        scheduledAt: notification.scheduledAt || new Date(),
        status: 'pending',
        deliveryAttempts: 0
      }

      this.pushQueue.push(pushNotification)
      
      // Process immediately if not scheduled
      if (!notification.scheduledAt) {
        await this.processPushNotification(pushNotification)
      }

      return pushNotification
    } catch (error) {
      console.error('Error sending push notification:', error)
      throw error
    }
  }

  // Process push notification
  private async processPushNotification(notification: PushNotification): Promise<void> {
    try {
      const device = this.getUserActiveDevice(notification.userId)
      if (!device) {
        notification.status = 'failed'
        notification.errorMessage = 'No active device found'
        return
      }

      // Send via appropriate platform
      switch (device.platform) {
        case 'ios':
          await this.sendIOSPush(device, notification)
          break
        case 'android':
          await this.sendAndroidPush(device, notification)
          break
        case 'web':
          await this.sendWebPush(device, notification)
          break
      }

      notification.status = 'sent'
      notification.sentAt = new Date()
      
      console.log(`📱 Push notification sent to ${device.platform} device for user ${notification.userId}`)
    } catch (error) {
      notification.status = 'failed'
      notification.errorMessage = error.message
      notification.deliveryAttempts++
      
      console.error('Error processing push notification:', error)
    }
  }

  // Send iOS push notification
  private async sendIOSPush(device: MobileDevice, notification: PushNotification): Promise<void> {
    try {
      // In a real implementation, this would use Apple Push Notification service
      const apnsPayload = {
        aps: {
          alert: {
            title: notification.title,
            body: notification.body
          },
          badge: 1,
          sound: 'default',
          category: notification.category,
          'mutable-content': 1
        },
        data: notification.data,
        actionUrl: notification.actionUrl
      }

      console.log(`🍎 iOS push sent to ${device.deviceToken}:`, apnsPayload)
    } catch (error) {
      console.error('Error sending iOS push:', error)
      throw error
    }
  }

  // Send Android push notification
  private async sendAndroidPush(device: MobileDevice, notification: PushNotification): Promise<void> {
    try {
      // In a real implementation, this would use Firebase Cloud Messaging
      const fcmPayload = {
        to: device.deviceToken,
        notification: {
          title: notification.title,
          body: notification.body,
          image: notification.imageUrl
        },
        data: {
          ...notification.data,
          actionUrl: notification.actionUrl,
          category: notification.category
        },
        priority: notification.priority === 'high' ? 'high' : 'normal'
      }

      console.log(`🤖 Android push sent to ${device.deviceToken}:`, fcmPayload)
    } catch (error) {
      console.error('Error sending Android push:', error)
      throw error
    }
  }

  // Send web push notification
  private async sendWebPush(device: MobileDevice, notification: PushNotification): Promise<void> {
    try {
      // In a real implementation, this would use Web Push API
      const webPushPayload = {
        title: notification.title,
        body: notification.body,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        image: notification.imageUrl,
        data: {
          ...notification.data,
          actionUrl: notification.actionUrl,
          category: notification.category
        },
        actions: [
          {
            action: 'view',
            title: 'View',
            icon: '/view-icon.png'
          },
          {
            action: 'dismiss',
            title: 'Dismiss',
            icon: '/dismiss-icon.png'
          }
        ]
      }

      console.log(`🌐 Web push sent to ${device.deviceToken}:`, webPushPayload)
    } catch (error) {
      console.error('Error sending web push:', error)
      throw error
    }
  }

  // Start push processor
  private startPushProcessor(): void {
    // Process push queue every 30 seconds
    setInterval(() => {
      this.processPushQueue()
    }, 30 * 1000)

    console.log('📱 Push notification processor started')
  }

  // Process push queue
  private async processPushQueue(): Promise<void> {
    const pendingNotifications = this.pushQueue.filter(n => n.status === 'pending')
    
    for (const notification of pendingNotifications) {
      if (notification.scheduledAt && notification.scheduledAt > new Date()) {
        continue // Skip if not yet scheduled
      }
      
      await this.processPushNotification(notification)
    }
  }

  // Get user's active device
  private getUserActiveDevice(userId: string): MobileDevice | null {
    const userDevices = Array.from(this.devices.values())
      .filter(device => device.userId === userId && device.isActive)
      .sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime())
    
    return userDevices[0] || null
  }

  // Track mobile analytics
  async trackMobileAnalytics(analytics: MobileAnalytics): Promise<void> {
    try {
      // Store analytics data
      await this.db.createAnalyticsRecord({
        userId: analytics.userId,
        type: 'mobile_analytics',
        value: analytics.events.length,
        data: {
          sessionId: analytics.sessionId,
          events: analytics.events,
          deviceInfo: analytics.deviceInfo,
          location: analytics.location
        },
        periodStart: analytics.timestamp,
        periodEnd: analytics.timestamp
      })

      // Process events for insights
      await this.processMobileEvents(analytics)
      
      console.log(`📊 Mobile analytics tracked for user ${analytics.userId}`)
    } catch (error) {
      console.error('Error tracking mobile analytics:', error)
    }
  }

  // Process mobile events for insights
  private async processMobileEvents(analytics: MobileAnalytics): Promise<void> {
    try {
      const events = analytics.events
      
      // Track screen views
      const screenViews = events.filter(e => e.type === 'screen_view')
      if (screenViews.length > 0) {
        await this.analyzeScreenUsage(analytics.userId, screenViews)
      }
      
      // Track user interactions
      const interactions = events.filter(e => e.type === 'button_click' || e.type === 'form_submit')
      if (interactions.length > 0) {
        await this.analyzeUserInteractions(analytics.userId, interactions)
      }
      
      // Track performance metrics
      await this.trackPerformanceMetrics(analytics)
    } catch (error) {
      console.error('Error processing mobile events:', error)
    }
  }

  // Analyze screen usage
  private async analyzeScreenUsage(userId: string, screenViews: MobileEvent[]): Promise<void> {
    const screenCounts = screenViews.reduce((acc, event) => {
      acc[event.name] = (acc[event.name] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Identify most used screens
    const mostUsedScreen = Object.entries(screenCounts)
      .sort(([,a], [,b]) => b - a)[0]

    if (mostUsedScreen) {
      console.log(`📱 Most used screen for user ${userId}: ${mostUsedScreen[0]} (${mostUsedScreen[1]} views)`)
    }
  }

  // Analyze user interactions
  private async analyzeUserInteractions(userId: string, interactions: MobileEvent[]): Promise<void> {
    const interactionCounts = interactions.reduce((acc, event) => {
      acc[event.name] = (acc[event.name] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Identify most common interactions
    const mostCommonInteraction = Object.entries(interactionCounts)
      .sort(([,a], [,b]) => b - a)[0]

    if (mostCommonInteraction) {
      console.log(`📱 Most common interaction for user ${userId}: ${mostCommonInteraction[0]} (${mostCommonInteraction[1]} times)`)
    }
  }

  // Track performance metrics
  private async trackPerformanceMetrics(analytics: MobileAnalytics): Promise<void> {
    // Track app performance metrics
    const performanceEvents = analytics.events.filter(e => e.name.includes('performance'))
    
    if (performanceEvents.length > 0) {
      console.log(`📱 Performance metrics tracked for user ${analytics.userId}: ${performanceEvents.length} events`)
    }
  }

  // Get mobile app configuration
  async getMobileAppConfig(): Promise<MobileAppConfig> {
    return {
      features: {
        pushNotifications: true,
        locationTracking: true,
        biometricAuth: true,
        offlineMode: true,
        darkMode: true
      },
      limits: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        maxImageSize: 5 * 1024 * 1024, // 5MB
        sessionTimeout: 30 * 60 * 1000, // 30 minutes
        maxRetries: 3
      },
      endpoints: {
        apiBaseUrl: process.env.API_BASE_URL || 'https://api.creditrepairmlm.com',
        websocketUrl: process.env.WEBSOCKET_URL || 'wss://api.creditrepairmlm.com/ws',
        cdnUrl: process.env.CDN_URL || 'https://cdn.creditrepairmlm.com'
      }
    }
  }

  // Send bulk push notifications
  async sendBulkPushNotifications(notifications: {
    userIds: string[]
    title: string
    body: string
    data?: any
    priority?: 'low' | 'normal' | 'high'
    category?: string
  }): Promise<PushNotification[]> {
    try {
      const pushNotifications: PushNotification[] = []
      
      for (const userId of notifications.userIds) {
        const pushNotification = await this.sendPushNotification({
          userId,
          title: notifications.title,
          body: notifications.body,
          data: notifications.data,
          priority: notifications.priority,
          category: notifications.category
        })
        
        pushNotifications.push(pushNotification)
      }
      
      console.log(`📱 Bulk push notifications sent to ${notifications.userIds.length} users`)
      return pushNotifications
    } catch (error) {
      console.error('Error sending bulk push notifications:', error)
      throw error
    }
  }

  // Get push notification statistics
  async getPushNotificationStats(userId?: string): Promise<any> {
    const notifications = this.pushQueue
    const filteredNotifications = userId 
      ? notifications.filter(n => n.userId === userId)
      : notifications

    const stats = {
      total: filteredNotifications.length,
      sent: filteredNotifications.filter(n => n.status === 'sent').length,
      delivered: filteredNotifications.filter(n => n.status === 'delivered').length,
      failed: filteredNotifications.filter(n => n.status === 'failed').length,
      pending: filteredNotifications.filter(n => n.status === 'pending').length
    }

    return stats
  }

  // Update device status
  async updateDeviceStatus(deviceId: string, updates: Partial<MobileDevice>): Promise<void> {
    const device = this.devices.get(deviceId)
    if (device) {
      Object.assign(device, updates)
      device.lastSeen = new Date()
      console.log(`📱 Device ${deviceId} updated`)
    }
  }

  // Deactivate device
  async deactivateDevice(deviceId: string): Promise<void> {
    const device = this.devices.get(deviceId)
    if (device) {
      device.isActive = false
      console.log(`📱 Device ${deviceId} deactivated`)
    }
  }

  // Get user devices
  async getUserDevices(userId: string): Promise<MobileDevice[]> {
    return Array.from(this.devices.values())
      .filter(device => device.userId === userId)
  }

  // Send location-based notifications
  async sendLocationBasedNotification(
    userId: string,
    location: { latitude: number; longitude: number },
    radius: number = 1000 // meters
  ): Promise<void> {
    try {
      // In a real implementation, this would check if user is near specific locations
      // For now, send a generic location-based notification
      await this.sendPushNotification({
        userId,
        title: 'Location Update',
        body: 'You are near a potential business opportunity!',
        category: 'location',
        priority: 'normal',
        data: {
          latitude: location.latitude,
          longitude: location.longitude,
          radius: radius
        }
      })
    } catch (error) {
      console.error('Error sending location-based notification:', error)
    }
  }

  // Send scheduled notifications
  async sendScheduledNotification(
    userId: string,
    title: string,
    body: string,
    scheduledAt: Date,
    data?: any
  ): Promise<PushNotification> {
    return await this.sendPushNotification({
      userId,
      title,
      body,
      data,
      scheduledAt,
      priority: 'normal'
    })
  }
}

// Export singleton instance
export const mlmMobileIntegration = new MLMMobileIntegration()
