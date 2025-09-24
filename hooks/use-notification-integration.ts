import { useEffect } from 'react'
import { useNotifications } from '@/lib/notification-context'
import { notificationMiddleware } from '@/lib/notification-middleware'

/**
 * Hook to integrate notification middleware with the notification context
 * This provides automatic notifications for app events without modifying existing components
 */
export function useNotificationIntegration() {
  const { addNotification } = useNotifications()

  useEffect(() => {
    // Initialize the middleware with the notification context
    notificationMiddleware.initialize(addNotification)

    // Start monitoring for events
    const cleanup = notificationMiddleware.startMonitoring()

    return cleanup
  }, [addNotification])

  return {
    /**
     * Manually trigger a notification event
     * Usage: triggerEvent('credit-report-uploaded')
     */
    triggerEvent: (eventName: string, data?: any) => {
      notificationMiddleware.triggerEvent(eventName, data)
    },

    /**
     * Add a custom notification trigger
     */
    addTrigger: (trigger: any) => {
      notificationMiddleware.addTrigger(trigger)
    }
  }
}
