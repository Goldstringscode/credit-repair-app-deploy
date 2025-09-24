"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"

export interface MLMNotification {
  id: string
  title: string
  message: string
  type: "team_join" | "team_creation" | "rank_advancement" | "commission_earned" | "payout_processed" | "training_completed" | "task_completed" | "invitation_sent" | "new_member" | "milestone" | "alert" | "info" | "success" | "warning" | "error"
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

interface MLMNotificationContextType {
  notifications: MLMNotification[]
  unreadCount: number
  isConnected: boolean
  isLoading: boolean
  filters: {
    type: MLMNotification['type'] | 'all'
    priority: MLMNotification['priority'] | 'all'
    read: 'all' | 'read' | 'unread'
    search: string
    category: 'all' | string
  }
  addNotification: (notification: Omit<MLMNotification, "id" | "timestamp">) => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  removeNotification: (id: string) => Promise<void>
  clearAllNotifications: () => Promise<void>
  refreshNotifications: () => Promise<void>
  setFilter: (filterType: keyof MLMNotificationContextType['filters'], value: any) => void
  clearFilters: () => void
  getFilteredNotifications: () => MLMNotification[]
  markFilteredAsRead: () => Promise<void>
  deleteFiltered: () => Promise<void>
  markSelectedAsRead: (ids: string[]) => Promise<void>
  deleteSelected: (ids: string[]) => Promise<void>
}

const MLMNotificationContext = createContext<MLMNotificationContextType | undefined>(undefined)

export function useMLMNotifications() {
  const context = useContext(MLMNotificationContext)
  if (context === undefined) {
    throw new Error("useMLMNotifications must be used within a MLMNotificationProvider")
  }
  return context
}

export function MLMNotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<MLMNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    type: 'all' as MLMNotification['type'] | 'all',
    priority: 'all' as MLMNotification['priority'] | 'all',
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
      const response = await fetch(`/api/mlm/notifications?userId=${mockUserId}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      } else {
        console.log('MLM Notifications API not available, using sample notifications')
        // Fall back to sample notifications
        setNotifications(getSampleMLMNotifications())
      }
    } catch (error) {
      console.log('Failed to load MLM notifications, using sample data', error)
      // Fall back to sample notifications
      setNotifications(getSampleMLMNotifications())
    } finally {
      setIsLoading(false)
    }
  }

  const getSampleMLMNotifications = (): MLMNotification[] => [
    {
      id: "welcome-mlm",
      title: "Welcome to MLM Program! 🎉",
      message: "Congratulations on joining our MLM program. Start building your team and earning commissions!",
      type: "success",
      priority: "high",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      read: false,
      category: "welcome",
      actions: [
        {
          label: "View Dashboard",
          action: "view_dashboard",
          variant: "default"
        }
      ]
    },
    {
      id: "team-join-success",
      title: "New Team Member Joined! 👥",
      message: "John Smith has joined your team using code TEAM123. You earned a $50 referral bonus!",
      type: "team_join",
      priority: "high",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      category: "team",
      actions: [
        {
          label: "View Team",
          action: "view_team",
          variant: "default"
        }
      ]
    },
    {
      id: "rank-advancement",
      title: "Rank Advancement! 🏆",
      message: "Congratulations! You've been promoted to Silver rank. New benefits and higher commission rates unlocked!",
      type: "rank_advancement",
      priority: "high",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      read: true,
      category: "achievement",
      actions: [
        {
          label: "View Benefits",
          action: "view_benefits",
          variant: "default"
        }
      ]
    },
    {
      id: "commission-earned",
      title: "Commission Earned! 💰",
      message: "You earned $125.50 in commissions this week. Check your earnings breakdown in the dashboard.",
      type: "commission_earned",
      priority: "medium",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      read: false,
      category: "earnings",
      actions: [
        {
          label: "View Earnings",
          action: "view_earnings",
          variant: "default"
        }
      ]
    },
    {
      id: "training-completed",
      title: "Training Module Completed! 📚",
      message: "Great job completing 'MLM Fundamentals'. You earned 50 points and unlocked new training materials.",
      type: "training_completed",
      priority: "medium",
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      read: true,
      category: "training",
      actions: [
        {
          label: "Continue Training",
          action: "continue_training",
          variant: "outline"
        }
      ]
    },
    {
      id: "payout-processed",
      title: "Payout Processed! 💳",
      message: "Your payout of $500.00 has been processed and sent to your bank account. Expected delivery: 2-3 business days.",
      type: "payout_processed",
      priority: "high",
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      read: false,
      category: "payout",
      actions: [
        {
          label: "View Transaction",
          action: "view_transaction",
          variant: "default"
        }
      ]
    },
    {
      id: "milestone-achieved",
      title: "Team Milestone Achieved! 🎯",
      message: "Congratulations! Your team has reached 10 active members. You've unlocked the Team Leader bonus program!",
      type: "milestone",
      priority: "high",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      read: false,
      category: "achievement",
      actions: [
        {
          label: "View Milestone",
          action: "view_milestone",
          variant: "default"
        }
      ]
    }
  ]

  // Update unread count whenever notifications change
  useEffect(() => {
    const count = notifications.filter((notification) => !notification.read).length
    setUnreadCount(count)
  }, [notifications])

  // Add a new notification
  const addNotification = useCallback(async (notification: Omit<MLMNotification, "id" | "timestamp"> | MLMNotification) => {
    console.log('🔔 MLMNotificationContext.addNotification called:', notification)
    
    // Convert to MLMNotification format if needed
    const mlmNotification: MLMNotification = {
      ...notification,
      id: `mlm_notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false
    }
    
    // Add to local state immediately
    setNotifications((prev) => {
      const updated = [mlmNotification, ...prev]
      console.log('🔔 Updated MLM notifications array:', updated)
      return updated
    })
    
    // Also send to API (but don't wait for it)
    try {
      const response = await fetch('/api/mlm/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...mlmNotification,
          userId: mockUserId,
        }),
      })

      if (response.ok) {
        console.log('🔔 MLM notification sent to API successfully')
      } else {
        console.error('Failed to create MLM notification in API')
      }
    } catch (error) {
      console.error('Error sending MLM notification to API:', error)
    }
  }, [mockUserId])

  // Register with MLM notification service after addNotification is defined
  useEffect(() => {
    console.log('🔔 MLMNotificationContext: Registering with notification service')
    
    // Import and register with the MLM notification service
    import('./mlm-notification-service').then(({ mlmNotificationService }) => {
      console.log('🔔 MLMNotificationContext: Notification service imported, setting callback')
      mlmNotificationService.setAddNotificationCallback(addNotification)
      console.log('🔔 MLMNotificationContext: Callback registered successfully')
    })

    // Cleanup function to remove callback when component unmounts
    return () => {
      import('./mlm-notification-service').then(({ mlmNotificationService }) => {
        console.log('🔔 MLMNotificationContext: Cleaning up notification service callback')
        mlmNotificationService.removeAddNotificationCallback(addNotification)
      })
    }
  }, [addNotification])

  // Mark a notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/mlm/notifications/${id}`, {
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
        console.error('Failed to mark MLM notification as read')
        // Fall back to local state
        setNotifications((prev) =>
          prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
        )
      }
    } catch (error) {
      console.error('Error marking MLM notification as read:', error)
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
        fetch(`/api/mlm/notifications/${notification.id}`, {
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
      console.error('Error marking all MLM notifications as read:', error)
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
      const response = await fetch(`/api/mlm/notifications/${id}?userId=${mockUserId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setNotifications((prev) => prev.filter((notification) => notification.id !== id))
      } else {
        console.error('Failed to delete MLM notification')
        // Fall back to local state
        setNotifications((prev) => prev.filter((notification) => notification.id !== id))
      }
    } catch (error) {
      console.error('Error deleting MLM notification:', error)
      // Fall back to local state
      setNotifications((prev) => prev.filter((notification) => notification.id !== id))
    }
  }, [mockUserId])

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    try {
      // Delete all notifications
      const deletePromises = notifications.map(notification => 
        fetch(`/api/mlm/notifications/${notification.id}?userId=${mockUserId}`, {
          method: 'DELETE',
        })
      )

      await Promise.all(deletePromises)
      setNotifications([])
    } catch (error) {
      console.error('Error clearing all MLM notifications:', error)
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
      search: '',
      category: 'all'
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

  // Bulk operations
  const markFilteredAsRead = useCallback(async () => {
    const filteredNotifications = getFilteredNotifications()
    const unreadFiltered = filteredNotifications.filter(n => !n.read)
    
    if (unreadFiltered.length === 0) return

    try {
      // Mark all filtered unread notifications as read
      await Promise.all(unreadFiltered.map(notification => markAsRead(notification.id)))
    } catch (error) {
      console.error('Error marking filtered MLM notifications as read:', error)
    }
  }, [getFilteredNotifications, markAsRead])

  const deleteFiltered = useCallback(async () => {
    const filteredNotifications = getFilteredNotifications()
    
    if (filteredNotifications.length === 0) return

    try {
      // Delete all filtered notifications
      await Promise.all(filteredNotifications.map(notification => removeNotification(notification.id)))
    } catch (error) {
      console.error('Error deleting filtered MLM notifications:', error)
    }
  }, [getFilteredNotifications, removeNotification])

  const markSelectedAsRead = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return

    try {
      await Promise.all(ids.map(id => markAsRead(id)))
    } catch (error) {
      console.error('Error marking selected MLM notifications as read:', error)
    }
  }, [markAsRead])

  const deleteSelected = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return

    try {
      await Promise.all(ids.map(id => removeNotification(id)))
    } catch (error) {
      console.error('Error deleting selected MLM notifications:', error)
    }
  }, [removeNotification])

  return (
    <MLMNotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        isLoading,
        filters,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAllNotifications,
        refreshNotifications,
        setFilter,
        clearFilters,
        getFilteredNotifications,
        markFilteredAsRead,
        deleteFiltered,
        markSelectedAsRead,
        deleteSelected,
      }}
    >
      {children}
    </MLMNotificationContext.Provider>
  )
}
