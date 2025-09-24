"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { notificationTemplateService } from "./notification-templates"
import { notificationScheduler } from "./notification-scheduler"
import { notificationAnalyticsService } from "./notification-analytics"
import { notificationSoundSystem } from "./notification-sound-system"

export interface Notification {
  id: string
  title: string
  message: string
  type: "credit_score" | "dispute" | "fcra" | "payment" | "alert" | "mail" | "info" | "success" | "warning" | "error"
  priority: "high" | "medium" | "low"
  timestamp: string
  read: boolean
  data?: any
  actions?: Array<{
    label: string
    action: string
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  }>
  category?: string
  templateId?: string
  icon?: string
  sound?: string
  vibration?: boolean
  autoExpire?: number
  analyticsId?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  isConnected: boolean
  isLoading: boolean
  filters: {
    type: Notification['type'] | 'all'
    priority: Notification['priority'] | 'all'
    read: 'all' | 'read' | 'unread'
    search: string
    category: 'all' | string
  }
  addNotification: (notification: Omit<Notification, "id" | "timestamp">) => Promise<void>
  addNotificationFromTemplate: (templateId: string, data?: Record<string, any>) => Promise<void>
  scheduleNotification: (templateId: string, delayMinutes: number, data?: Record<string, any>) => string
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  removeNotification: (id: string) => Promise<void>
  clearAllNotifications: () => Promise<void>
  refreshNotifications: () => Promise<void>
  setFilter: (filterType: keyof NotificationContextType['filters'], value: any) => void
  clearFilters: () => void
  getFilteredNotifications: () => Notification[]
  markFilteredAsRead: () => Promise<void>
  deleteFiltered: () => Promise<void>
  markSelectedAsRead: (ids: string[]) => Promise<void>
  deleteSelected: (ids: string[]) => Promise<void>
  // Analytics
  getAnalytics: () => any
  getUserEngagementProfile: () => any
  // Sound system
  playNotificationSound: (category: string) => Promise<void>
  getSoundSettings: () => any
  updateSoundSettings: (settings: any) => void
  // Templates
  getTemplates: () => any[]
  getTemplatesByCategory: (category: string) => any[]
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    type: 'all' as Notification['type'] | 'all',
    priority: 'all' as Notification['priority'] | 'all',
    read: 'all' as 'all' | 'read' | 'unread',
    search: '',
    category: 'all' as 'all' | string
  })

  // Mock user ID - in real app, get from auth context
  const mockUserId = '550e8400-e29b-41d4-a716-446655440000'

  // Load notifications from API
  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/notifications?userId=${mockUserId}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      } else {
        console.log('API not available, using sample notifications')
        // Fall back to sample notifications
        setNotifications(getSampleNotifications())
      }
    } catch (error) {
      console.log('Failed to load notifications, using sample data', error)
      // Fall back to sample notifications
      setNotifications(getSampleNotifications())
    } finally {
      setIsLoading(false)
    }
  }

  const getSampleNotifications = (): Notification[] => [
    {
      id: "welcome",
      title: "Welcome to Credit Repair AI",
      message: "Thank you for joining our platform. Let's improve your credit score together!",
      type: "info",
      priority: "medium",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: "credit-score-update",
      title: "Credit Score Updated",
      message: "Your TransUnion score has increased by 15 points!",
      type: "success",
      priority: "high",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
  ]

  // Update unread count whenever notifications change
  useEffect(() => {
    const count = notifications.filter((notification) => !notification.read).length
    setUnreadCount(count)
  }, [notifications])

  // Add a new notification
  const addNotification = useCallback(async (notification: Omit<Notification, "id" | "timestamp">) => {
    console.log('🔔 NotificationContext.addNotification called:', notification)
    
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...notification,
          userId: mockUserId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const newNotification = data.notification
        console.log('🔔 API response notification:', newNotification)
        setNotifications((prev) => {
          const updated = [newNotification, ...prev]
          console.log('🔔 Updated notifications array:', updated)
          return updated
        })
      } else {
        console.error('Failed to create notification')
        // Fall back to local state
        const newNotification: Notification = {
          ...notification,
          id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
        }
        console.log('🔔 Fallback notification:', newNotification)
        setNotifications((prev) => {
          const updated = [newNotification, ...prev]
          console.log('🔔 Updated notifications array (fallback):', updated)
          return updated
        })
      }
    } catch (error) {
      console.error('Error creating notification:', error)
      // Fall back to local state
      const newNotification: Notification = {
        ...notification,
        id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
      }
      console.log('🔔 Error fallback notification:', newNotification)
      setNotifications((prev) => {
        const updated = [newNotification, ...prev]
        console.log('🔔 Updated notifications array (error fallback):', updated)
        return updated
      })
    }
  }, [mockUserId])

  // Register the addNotification callback with the notification service
  useEffect(() => {
    console.log('🔔 Registering notification service callback')
    let notificationService: any = null
    
    import('./notification-service').then(({ notificationService: service }) => {
      notificationService = service
      console.log('🔔 Notification service imported, setting callback')
      notificationService.setAddNotificationCallback(addNotification)
      console.log('🔔 Callback registered successfully')
    })

    // Cleanup function to remove callback when component unmounts
    return () => {
      if (notificationService) {
        console.log('🔔 Cleaning up notification service callback')
        notificationService.removeAddNotificationCallback(addNotification)
      }
    }
  }, [addNotification])

  // Mark a notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          read: true,
          userId: mockUserId,
        }),
      })

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
        )
      } else {
        console.error('Failed to mark notification as read')
        // Fall back to local state
        setNotifications((prev) =>
          prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
        )
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      // Fall back to local state
      setNotifications((prev) =>
        prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
      )
    }
  }, [mockUserId])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      // Update all unread notifications
      const unreadNotifications = notifications.filter(n => !n.read)
      const updatePromises = unreadNotifications.map(notification => 
        fetch(`/api/notifications/${notification.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            read: true,
            userId: mockUserId,
          }),
        })
      )

      await Promise.all(updatePromises)
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true,
        })),
      )
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      // Fall back to local state
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true,
        })),
      )
    }
  }, [notifications, mockUserId])

  // Remove a notification
  const removeNotification = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}?userId=${mockUserId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setNotifications((prev) => prev.filter((notification) => notification.id !== id))
      } else {
        console.error('Failed to delete notification')
        // Fall back to local state
        setNotifications((prev) => prev.filter((notification) => notification.id !== id))
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
      // Fall back to local state
      setNotifications((prev) => prev.filter((notification) => notification.id !== id))
    }
  }, [mockUserId])

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    try {
      // Delete all notifications
      const deletePromises = notifications.map(notification => 
        fetch(`/api/notifications/${notification.id}?userId=${mockUserId}`, {
          method: 'DELETE',
        })
      )

      await Promise.all(deletePromises)
      setNotifications([])
    } catch (error) {
      console.error('Error clearing all notifications:', error)
      // Fall back to local state
      setNotifications([])
    }
  }, [notifications, mockUserId])

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    await loadNotifications()
  }, [])

  // Filter functions
  const setFilter = useCallback((filterType: keyof typeof filters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      type: 'all',
      priority: 'all',
      read: 'all',
      search: ''
    })
  }, [])

  const getFilteredNotifications = useCallback(() => {
    return notifications.filter(notification => {
      // Type filter
      if (filters.type !== 'all' && notification.type !== filters.type) {
        return false
      }

      // Priority filter
      if (filters.priority !== 'all' && notification.priority !== filters.priority) {
        return false
      }

      // Read status filter
      if (filters.read !== 'all') {
        const isRead = notification.read
        if (filters.read === 'read' && !isRead) return false
        if (filters.read === 'unread' && isRead) return false
      }

      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const matchesTitle = notification.title.toLowerCase().includes(searchTerm)
        const matchesMessage = notification.message.toLowerCase().includes(searchTerm)
        if (!matchesTitle && !matchesMessage) return false
      }

      return true
    })
  }, [notifications, filters])

  // Bulk operations
  const markFilteredAsRead = useCallback(async () => {
    const filteredNotifications = getFilteredNotifications()
    const unreadFiltered = filteredNotifications.filter(n => !n.read)
    
    if (unreadFiltered.length === 0) return

    try {
      // Mark all filtered unread notifications as read
      await Promise.all(unreadFiltered.map(notification => markAsRead(notification.id)))
    } catch (error) {
      console.error('Error marking filtered notifications as read:', error)
    }
  }, [getFilteredNotifications, markAsRead])

  const deleteFiltered = useCallback(async () => {
    const filteredNotifications = getFilteredNotifications()
    
    if (filteredNotifications.length === 0) return

    try {
      // Delete all filtered notifications
      await Promise.all(filteredNotifications.map(notification => removeNotification(notification.id)))
    } catch (error) {
      console.error('Error deleting filtered notifications:', error)
    }
  }, [getFilteredNotifications, removeNotification])

  const markSelectedAsRead = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return

    try {
      await Promise.all(ids.map(id => markAsRead(id)))
    } catch (error) {
      console.error('Error marking selected notifications as read:', error)
    }
  }, [markAsRead])

  const deleteSelected = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return

    try {
      await Promise.all(ids.map(id => removeNotification(id)))
    } catch (error) {
      console.error('Error deleting selected notifications:', error)
    }
  }, [removeNotification])

  // New enhanced methods

  // Add notification from template
  const addNotificationFromTemplate = useCallback(async (templateId: string, data: Record<string, any> = {}) => {
    try {
      const generatedNotification = notificationTemplateService.generateNotification(templateId, data, mockUserId)
      
      // Track analytics
      const analyticsId = notificationAnalyticsService.trackNotificationSent(
        generatedNotification.id,
        mockUserId,
        templateId,
        generatedNotification.category || 'info',
        generatedNotification.type,
        generatedNotification.priority
      )

      // Add analytics ID to notification
      generatedNotification.analyticsId = analyticsId

      // Play sound if specified
      if (generatedNotification.sound) {
        await notificationSoundSystem.playSoundByCategory(generatedNotification.sound)
      }

      // Add to notifications
      await addNotification(generatedNotification)
    } catch (error) {
      console.error('Error adding notification from template:', error)
    }
  }, [addNotification, mockUserId])

  // Schedule notification
  const scheduleNotification = useCallback((templateId: string, delayMinutes: number, data: Record<string, any> = {}) => {
    return notificationScheduler.scheduleDelayed(mockUserId, templateId, delayMinutes, data)
  }, [mockUserId])

  // Analytics methods
  const getAnalytics = useCallback(() => {
    return notificationAnalyticsService.getOverallMetrics()
  }, [])

  const getUserEngagementProfile = useCallback(() => {
    return notificationAnalyticsService.getUserEngagementProfile(mockUserId)
  }, [mockUserId])

  // Sound system methods
  const playNotificationSound = useCallback(async (category: string) => {
    await notificationSoundSystem.playSoundByCategory(category)
  }, [])

  const getSoundSettings = useCallback(() => {
    return notificationSoundSystem.getSettings()
  }, [])

  const updateSoundSettings = useCallback((settings: any) => {
    notificationSoundSystem.updateSettings(settings)
  }, [])

  // Template methods
  const getTemplates = useCallback(() => {
    return notificationTemplateService.getAllTemplates()
  }, [])

  const getTemplatesByCategory = useCallback((category: string) => {
    return notificationTemplateService.getTemplatesByCategory(category)
  }, [])

  // Update clearFilters to include category
  const clearFiltersWithCategory = useCallback(() => {
    setFilters({
      type: 'all',
      priority: 'all',
      read: 'all',
      search: '',
      category: 'all'
    })
  }, [])

  // Update getFilteredNotifications to include category filter
  const getFilteredNotificationsWithCategory = useCallback(() => {
    return notifications.filter(notification => {
      // Type filter
      if (filters.type !== 'all' && notification.type !== filters.type) {
        return false
      }

      // Priority filter
      if (filters.priority !== 'all' && notification.priority !== filters.priority) {
        return false
      }

      // Read status filter
      if (filters.read !== 'all') {
        const isRead = notification.read
        if (filters.read === 'read' && !isRead) return false
        if (filters.read === 'unread' && isRead) return false
      }

      // Category filter
      if (filters.category !== 'all' && notification.category !== filters.category) {
        return false
      }

      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const matchesTitle = notification.title.toLowerCase().includes(searchTerm)
        const matchesMessage = notification.message.toLowerCase().includes(searchTerm)
        if (!matchesTitle && !matchesMessage) return false
      }

      return true
    })
  }, [notifications, filters])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        isLoading,
        filters,
        addNotification,
        addNotificationFromTemplate,
        scheduleNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAllNotifications,
        refreshNotifications,
        setFilter,
        clearFilters: clearFiltersWithCategory,
        getFilteredNotifications: getFilteredNotificationsWithCategory,
        markFilteredAsRead,
        deleteFiltered,
        markSelectedAsRead,
        deleteSelected,
        // Analytics
        getAnalytics,
        getUserEngagementProfile,
        // Sound system
        playNotificationSound,
        getSoundSettings,
        updateSoundSettings,
        // Templates
        getTemplates,
        getTemplatesByCategory,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
