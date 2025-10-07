export interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  tag?: string
  data?: any
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
  requireInteraction?: boolean
  silent?: boolean
  timestamp?: number
  vibrate?: number[]
  sound?: string
}

export interface PushNotificationSettings {
  enabled: boolean
  permission: NotificationPermission
  categories: {
    credit: boolean
    dispute: boolean
    training: boolean
    payment: boolean
    system: boolean
    alerts: boolean
  }
  quietHours: {
    enabled: boolean
    start: string // HH:MM format
    end: string // HH:MM format
    timezone: string
  }
  frequency: 'immediate' | 'batched' | 'digest'
  digestInterval: number // minutes
}

class PushNotificationService {
  private settings: PushNotificationSettings
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null
  private isInitialized = false

  constructor() {
    this.settings = this.getDefaultSettings()
    this.initializeService()
  }

  private getDefaultSettings(): PushNotificationSettings {
    return {
      enabled: true,
      permission: 'default',
      categories: {
        credit: true,
        dispute: true,
        training: true,
        payment: true,
        system: true,
        alerts: true
      },
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      frequency: 'immediate',
      digestInterval: 60
    }
  }

  private async initializeService() {
    if (this.isInitialized) return

    this.loadSettings()
    await this.registerServiceWorker()
    this.isInitialized = true
    console.log('📱 Push notification service initialized')
  }

  private loadSettings() {
    if (typeof window === 'undefined') return

    try {
      const saved = localStorage.getItem('push-notification-settings')
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) }
      }
    } catch (error) {
      console.warn('Failed to load push notification settings:', error)
    }
  }

  private saveSettings() {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem('push-notification-settings', JSON.stringify(this.settings))
    } catch (error) {
      console.warn('Failed to save push notification settings:', error)
    }
  }

  private async registerServiceWorker() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    try {
      this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js')
      console.log('📱 Service worker registered')
    } catch (error) {
      console.warn('Failed to register service worker:', error)
    }
  }

  /**
   * Request push notification permission
   */
  async requestPermission(showPrompt: boolean = true): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied'
    }

    // If already granted, return immediately
    if (this.settings.permission === 'granted') {
      return 'granted'
    }

    // If denied and we're not showing a prompt, return current status
    if (this.settings.permission === 'denied' && !showPrompt) {
      return 'denied'
    }

    try {
      const permission = await Notification.requestPermission()
      this.settings.permission = permission
      this.saveSettings()
      console.log(`📱 Push notification permission: ${permission}`)
      
      if (permission === 'granted') {
        // Show welcome notification
        this.showNotification('Welcome! 🎉', 'You\'ll now receive important updates via push notifications.', {
          icon: '/icons/notification-bell.png',
          tag: 'welcome',
          requireInteraction: false
        })
      } else if (permission === 'denied') {
        // Show helpful message about enabling notifications
        this.showPermissionDeniedMessage()
      }
      
      return permission
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      return 'denied'
    }
  }

  private showPermissionDeniedMessage() {
    // Create a temporary notification in the UI to guide users
    if (typeof window !== 'undefined') {
      const message = document.createElement('div')
      message.className = 'fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm'
      message.innerHTML = `
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium">Notifications Blocked</h3>
            <p class="text-sm mt-1">To enable push notifications, click the lock icon in your browser's address bar and allow notifications.</p>
            <button onclick="this.parentElement.parentElement.remove()" class="text-sm underline mt-2">Dismiss</button>
          </div>
        </div>
      `
      document.body.appendChild(message)
      
      // Auto-remove after 10 seconds
      setTimeout(() => {
        if (message.parentElement) {
          message.remove()
        }
      }, 10000)
    }
  }

  /**
   * Get current permission status
   */
  getPermissionStatus(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied'
    }

    return Notification.permission
  }

  /**
   * Show notification (simple interface)
   */
  async showNotification(title: string, body: string, options?: Partial<PushNotificationPayload>): Promise<void> {
    const payload: PushNotificationPayload = {
      title,
      body,
      ...options
    }
    await this.sendNotification(payload)
  }

  /**
   * Send push notification
   */
  async sendNotification(payload: PushNotificationPayload): Promise<void> {
    if (!this.settings.enabled) return
    if (this.settings.permission !== 'granted') return
    if (this.isInQuietHours()) return

    try {
      if (this.serviceWorkerRegistration) {
        // Use service worker for better control
        await this.serviceWorkerRegistration.showNotification(payload.title, {
          body: payload.body,
          icon: payload.icon || '/favicon.ico',
          badge: payload.badge || '/favicon.ico',
          image: payload.image,
          tag: payload.tag,
          data: payload.data,
          actions: payload.actions,
          requireInteraction: payload.requireInteraction,
          silent: payload.silent,
          timestamp: payload.timestamp || Date.now(),
          vibrate: payload.vibrate,
          sound: payload.sound
        })
      } else {
        // Fall back to browser notification
        new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon || '/favicon.ico',
          tag: payload.tag,
          data: payload.data,
          requireInteraction: payload.requireInteraction,
          silent: payload.silent,
          timestamp: payload.timestamp || Date.now()
        })
      }

      console.log('📱 Push notification sent:', payload.title)
    } catch (error) {
      console.error('Failed to send push notification:', error)
    }
  }

  /**
   * Send notification by category
   */
  async sendNotificationByCategory(
    category: string,
    title: string,
    body: string,
    data?: any
  ): Promise<void> {
    if (!this.settings.categories[category as keyof typeof this.settings.categories]) {
      return
    }

    const payload: PushNotificationPayload = {
      title,
      body,
      icon: this.getCategoryIcon(category),
      tag: category,
      data: { category, ...data },
      requireInteraction: category === 'alerts' || category === 'payment'
    }

    await this.sendNotification(payload)
  }

  /**
   * Get icon for category
   */
  private getCategoryIcon(category: string): string {
    const icons = {
      credit: '/icons/credit.svg',
      dispute: '/icons/dispute.svg',
      training: '/icons/training.svg',
      payment: '/icons/payment.svg',
      system: '/icons/system.svg',
      alerts: '/icons/alert.svg'
    }
    return icons[category as keyof typeof icons] || '/favicon.ico'
  }

  /**
   * Check if currently in quiet hours
   */
  private isInQuietHours(): boolean {
    if (!this.settings.quietHours.enabled) return false

    const now = new Date()
    const currentTime = now.toLocaleTimeString('en-US', {
      hour12: false,
      timeZone: this.settings.quietHours.timezone
    }).slice(0, 5) // HH:MM format

    const start = this.settings.quietHours.start
    const end = this.settings.quietHours.end

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (start > end) {
      return currentTime >= start || currentTime <= end
    } else {
      return currentTime >= start && currentTime <= end
    }
  }

  /**
   * Get current settings
   */
  getSettings(): PushNotificationSettings {
    return { ...this.settings }
  }

  /**
   * Update settings
   */
  updateSettings(newSettings: Partial<PushNotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings }
    this.saveSettings()
    console.log('📱 Push notification settings updated')
  }

  /**
   * Enable/disable push notifications
   */
  setEnabled(enabled: boolean): void {
    this.settings.enabled = enabled
    this.saveSettings()
    console.log(`📱 Push notifications ${enabled ? 'enabled' : 'disabled'}`)
  }

  /**
   * Enable/disable category
   */
  setCategoryEnabled(category: string, enabled: boolean): void {
    if (category in this.settings.categories) {
      this.settings.categories[category as keyof typeof this.settings.categories] = enabled
      this.saveSettings()
      console.log(`📱 Category ${category} ${enabled ? 'enabled' : 'disabled'}`)
    }
  }

  /**
   * Set quiet hours
   */
  setQuietHours(enabled: boolean, start: string, end: string, timezone?: string): void {
    this.settings.quietHours = {
      enabled,
      start,
      end,
      timezone: timezone || this.settings.quietHours.timezone
    }
    this.saveSettings()
    console.log(`📱 Quiet hours ${enabled ? 'enabled' : 'disabled'}: ${start} - ${end}`)
  }

  /**
   * Set notification frequency
   */
  setFrequency(frequency: 'immediate' | 'batched' | 'digest', interval?: number): void {
    this.settings.frequency = frequency
    if (interval) {
      this.settings.digestInterval = interval
    }
    this.saveSettings()
    console.log(`📱 Notification frequency set to: ${frequency}`)
  }

  /**
   * Test push notification
   */
  async testNotification(): Promise<void> {
    await this.sendNotification({
      title: 'Test Notification',
      body: 'This is a test push notification from Credit Repair AI',
      icon: '/favicon.ico',
      tag: 'test'
    })
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<void> {
    if (this.serviceWorkerRegistration) {
      const notifications = await this.serviceWorkerRegistration.getNotifications()
      notifications.forEach(notification => notification.close())
    }
    console.log('📱 All notifications cleared')
  }

  /**
   * Get notification status
   */
  getStatus(): {
    supported: boolean
    permission: NotificationPermission
    enabled: boolean
    serviceWorkerRegistered: boolean
    inQuietHours: boolean
  } {
    return {
      supported: 'Notification' in window,
      permission: this.getPermissionStatus(),
      enabled: this.settings.enabled,
      serviceWorkerRegistered: this.serviceWorkerRegistration !== null,
      inQuietHours: this.isInQuietHours()
    }
  }

  /**
   * Reset to default settings
   */
  resetToDefaults(): void {
    this.settings = this.getDefaultSettings()
    this.saveSettings()
    console.log('📱 Push notification settings reset to defaults')
  }
}

export const pushNotificationService = new PushNotificationService()