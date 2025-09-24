interface NotificationPreferences {
  // Push notifications
  pushNotifications: {
    enabled: boolean
    lessonCompleted: boolean
    quizCompleted: boolean
    milestoneAchieved: boolean
    courseCompleted: boolean
    taskCompleted: boolean
    creditScoreUpdate: boolean
    systemMaintenance: boolean
    featureUpdates: boolean
  }
  
  // In-app notifications
  inAppNotifications: {
    enabled: boolean
    lessonCompleted: boolean
    quizCompleted: boolean
    milestoneAchieved: boolean
    courseCompleted: boolean
    taskCompleted: boolean
    creditScoreUpdate: boolean
    systemMaintenance: boolean
    featureUpdates: boolean
  }
  
  // Email notifications (for future implementation)
  emailNotifications: {
    enabled: boolean
    lessonCompleted: boolean
    quizCompleted: boolean
    milestoneAchieved: boolean
    courseCompleted: boolean
    taskCompleted: boolean
    creditScoreUpdate: boolean
    systemMaintenance: boolean
    featureUpdates: boolean
  }
  
  // General preferences
  general: {
    soundEnabled: boolean
    vibrationEnabled: boolean
    showPreview: boolean
    autoMarkAsRead: boolean
    retentionDays: number
  }
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  pushNotifications: {
    enabled: true,
    lessonCompleted: true,
    quizCompleted: true,
    milestoneAchieved: true,
    courseCompleted: true,
    taskCompleted: true,
    creditScoreUpdate: true,
    systemMaintenance: true,
    featureUpdates: true,
  },
  inAppNotifications: {
    enabled: true,
    lessonCompleted: true,
    quizCompleted: true,
    milestoneAchieved: true,
    courseCompleted: true,
    taskCompleted: true,
    creditScoreUpdate: true,
    systemMaintenance: true,
    featureUpdates: true,
  },
  emailNotifications: {
    enabled: false,
    lessonCompleted: false,
    quizCompleted: false,
    milestoneAchieved: false,
    courseCompleted: true,
    taskCompleted: false,
    creditScoreUpdate: true,
    systemMaintenance: true,
    featureUpdates: false,
  },
  general: {
    soundEnabled: true,
    vibrationEnabled: true,
    showPreview: true,
    autoMarkAsRead: false,
    retentionDays: 30,
  }
}

class NotificationPreferencesService {
  private storageKey = 'notification-preferences'
  private preferences: NotificationPreferences

  constructor() {
    this.preferences = this.loadPreferences()
  }

  private loadPreferences(): NotificationPreferences {
    if (typeof window === 'undefined') {
      return DEFAULT_PREFERENCES
    }

    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Merge with defaults to handle new preference keys
        return this.mergeWithDefaults(parsed)
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error)
    }

    return DEFAULT_PREFERENCES
  }

  private mergeWithDefaults(stored: Partial<NotificationPreferences>): NotificationPreferences {
    return {
      pushNotifications: { ...DEFAULT_PREFERENCES.pushNotifications, ...stored.pushNotifications },
      inAppNotifications: { ...DEFAULT_PREFERENCES.inAppNotifications, ...stored.inAppNotifications },
      emailNotifications: { ...DEFAULT_PREFERENCES.emailNotifications, ...stored.emailNotifications },
      general: { ...DEFAULT_PREFERENCES.general, ...stored.general },
    }
  }

  private savePreferences(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.preferences))
    } catch (error) {
      console.error('Error saving notification preferences:', error)
    }
  }

  getPreferences(): NotificationPreferences {
    return { ...this.preferences }
  }

  updatePreferences(updates: Partial<NotificationPreferences>): void {
    this.preferences = {
      ...this.preferences,
      ...updates,
      pushNotifications: { ...this.preferences.pushNotifications, ...updates.pushNotifications },
      inAppNotifications: { ...this.preferences.inAppNotifications, ...updates.inAppNotifications },
      emailNotifications: { ...this.preferences.emailNotifications, ...updates.emailNotifications },
      general: { ...this.preferences.general, ...updates.general },
    }
    this.savePreferences()
  }

  updatePushNotificationPreference(key: keyof NotificationPreferences['pushNotifications'], value: boolean): void {
    this.preferences.pushNotifications[key] = value
    this.savePreferences()
  }

  updateInAppNotificationPreference(key: keyof NotificationPreferences['inAppNotifications'], value: boolean): void {
    this.preferences.inAppNotifications[key] = value
    this.savePreferences()
  }

  updateEmailNotificationPreference(key: keyof NotificationPreferences['emailNotifications'], value: boolean): void {
    this.preferences.emailNotifications[key] = value
    this.savePreferences()
  }

  updateGeneralPreference(key: keyof NotificationPreferences['general'], value: any): void {
    this.preferences.general[key] = value
    this.savePreferences()
  }

  resetToDefaults(): void {
    this.preferences = { ...DEFAULT_PREFERENCES }
    this.savePreferences()
  }

  // Check if a specific notification type should be shown
  shouldShowNotification(type: string, channel: 'push' | 'inApp' | 'email' = 'inApp'): boolean {
    const channelPrefs = this.preferences[`${channel}Notifications` as keyof NotificationPreferences] as any
    
    if (!channelPrefs.enabled) return false

    // Map notification types to preference keys
    const typeMap: Record<string, keyof NotificationPreferences['pushNotifications']> = {
      'lesson-completed': 'lessonCompleted',
      'quiz-completed': 'quizCompleted',
      'milestone-achieved': 'milestoneAchieved',
      'course-completed': 'courseCompleted',
      'task-completed': 'taskCompleted',
      'credit-score-update': 'creditScoreUpdate',
      'system-maintenance': 'systemMaintenance',
      'feature-update': 'featureUpdates',
    }

    const preferenceKey = typeMap[type]
    return preferenceKey ? channelPrefs[preferenceKey] : true
  }

  // Get notification sound settings
  getSoundSettings(): { enabled: boolean; vibrationEnabled: boolean } {
    return {
      enabled: this.preferences.general.soundEnabled,
      vibrationEnabled: this.preferences.general.vibrationEnabled,
    }
  }

  // Get retention settings
  getRetentionSettings(): { autoMarkAsRead: boolean; retentionDays: number } {
    return {
      autoMarkAsRead: this.preferences.general.autoMarkAsRead,
      retentionDays: this.preferences.general.retentionDays,
    }
  }
}

export const notificationPreferencesService = new NotificationPreferencesService()
export type { NotificationPreferences }




