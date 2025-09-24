"use client"

import { useState, useEffect, useCallback } from "react"
import { realtimeMLMService } from "@/lib/realtime-mlm-service"
import type { MLMRealtimeEvent, MLMStats, MLMNotification } from "@/lib/realtime-mlm-service"

export function useRealtimeMLM() {
  const [stats, setStats] = useState<MLMStats>({
    monthlyEarnings: 0,
    teamSize: 0,
    currentRank: "Loading...",
    activeRate: 0,
    unreadMessages: 0,
    pendingTasks: 0,
  })
  const [notifications, setNotifications] = useState<MLMNotification[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Subscribe to stats updates
    const unsubscribeStats = realtimeMLMService.subscribeToStats((newStats) => {
      setStats(newStats)
    })

    // Subscribe to notifications
    const unsubscribeNotifications = realtimeMLMService.subscribeToNotifications((notification) => {
      setNotifications((prev) => [notification, ...prev].slice(0, 50))
      if (!notification.read) {
        setUnreadCount((prev) => prev + 1)
      }
    })

    // Subscribe to connection status
    const unsubscribeConnection = realtimeMLMService.subscribeToConnectionStatus((connected) => {
      setIsConnected(connected)
    })

    return () => {
      unsubscribeStats()
      unsubscribeNotifications()
      unsubscribeConnection()
    }
  }, [])

  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
    await realtimeMLMService.markNotificationAsRead(notificationId)
  }, [])

  const markAllNotificationsAsRead = useCallback(async () => {
    const unreadNotifications = notifications.filter((n) => !n.read)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)

    for (const notification of unreadNotifications) {
      await realtimeMLMService.markNotificationAsRead(notification.id)
    }
  }, [notifications])

  return {
    stats,
    notifications,
    isConnected,
    unreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  }
}

export function useMLMEvent(eventType: string, callback: (event: MLMRealtimeEvent) => void) {
  useEffect(() => {
    const unsubscribe = realtimeMLMService.subscribe(eventType, callback)
    return unsubscribe
  }, [eventType, callback])
}

export function useMLMStats() {
  const [stats, setStats] = useState<MLMStats>({
    monthlyEarnings: 0,
    teamSize: 0,
    currentRank: "Loading...",
    activeRate: 0,
    unreadMessages: 0,
    pendingTasks: 0,
  })

  useEffect(() => {
    const unsubscribe = realtimeMLMService.subscribeToStats(setStats)
    return unsubscribe
  }, [])

  return stats
}

export function useMLMNotifications() {
  const [notifications, setNotifications] = useState<MLMNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const unsubscribe = realtimeMLMService.subscribeToNotifications((notification) => {
      setNotifications((prev) => [notification, ...prev].slice(0, 50))
      if (!notification.read) {
        setUnreadCount((prev) => prev + 1)
      }
    })

    return unsubscribe
  }, [])

  const markAsRead = useCallback(async (notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
    await realtimeMLMService.markNotificationAsRead(notificationId)
  }, [])

  return {
    notifications,
    unreadCount,
    markAsRead,
  }
}

export function useMLMConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const unsubscribe = realtimeMLMService.subscribeToConnectionStatus(setIsConnected)
    return unsubscribe
  }, [])

  return isConnected
}
