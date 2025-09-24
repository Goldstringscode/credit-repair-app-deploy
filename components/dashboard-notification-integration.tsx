"use client"

import { useNotificationIntegration } from "@/hooks/use-notification-integration"

/**
 * Component to integrate notification system with dashboard
 * This enables automatic notifications for dashboard events
 */
export function DashboardNotificationIntegration() {
  // Initialize the notification integration
  useNotificationIntegration()
  
  // This component doesn't render anything, it just initializes the notification system
  return null
}
