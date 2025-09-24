import { Notification } from './notification-context'

/**
 * Notification Middleware - Automatically triggers notifications for app events
 * This integrates with existing app functionality without modifying it
 */

export interface NotificationTrigger {
  event: string
  condition: () => boolean
  notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
}

export class NotificationMiddleware {
  private triggers: NotificationTrigger[] = []
  private addNotification: ((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void) | null = null

  constructor() {
    this.setupDefaultTriggers()
  }

  /**
   * Initialize the middleware with the notification context
   */
  initialize(addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void) {
    this.addNotification = addNotification
  }

  /**
   * Setup default notification triggers for common app events
   */
  private setupDefaultTriggers() {
    // Credit Report Upload Success
    this.addTrigger({
      event: 'credit-report-uploaded',
      condition: () => {
        // Check if we're on the dashboard and a credit report was recently uploaded
        return typeof window !== 'undefined' && 
               window.location.pathname.includes('/dashboard') &&
               sessionStorage.getItem('credit-report-uploaded') === 'true'
      },
      notification: {
        title: 'Credit Report Uploaded Successfully',
        message: 'Your credit report has been processed and is ready for analysis.',
        type: 'success',
        priority: 'high',
        category: 'credit-report',
        userId: 'current-user', // Will be replaced with actual user ID
        actions: [
          { label: 'View Report', action: 'navigate', value: '/dashboard/credit-reports' },
          { label: 'Start Analysis', action: 'navigate', value: '/dashboard/analysis' }
        ]
      }
    })

    // Analysis Complete
    this.addTrigger({
      event: 'analysis-complete',
      condition: () => {
        return typeof window !== 'undefined' && 
               sessionStorage.getItem('analysis-complete') === 'true'
      },
      notification: {
        title: 'Credit Analysis Complete',
        message: 'Your credit analysis is ready with personalized recommendations.',
        type: 'info',
        priority: 'high',
        category: 'analysis',
        userId: 'current-user',
        actions: [
          { label: 'View Results', action: 'navigate', value: '/dashboard/analysis' },
          { label: 'Generate Letters', action: 'navigate', value: '/dashboard/letters' }
        ]
      }
    })

    // Dispute Letter Generated
    this.addTrigger({
      event: 'dispute-letter-generated',
      condition: () => {
        return typeof window !== 'undefined' && 
               sessionStorage.getItem('dispute-letter-generated') === 'true'
      },
      notification: {
        title: 'Dispute Letter Generated',
        message: 'Your personalized dispute letter is ready for review and sending.',
        type: 'success',
        priority: 'medium',
        category: 'letters',
        userId: 'current-user',
        actions: [
          { label: 'Review Letter', action: 'navigate', value: '/dashboard/letters' },
          { label: 'Send Letter', action: 'navigate', value: '/dashboard/certified-mail' }
        ]
      }
    })

    // Payment Success
    this.addTrigger({
      event: 'payment-success',
      condition: () => {
        return typeof window !== 'undefined' && 
               sessionStorage.getItem('payment-success') === 'true'
      },
      notification: {
        title: 'Payment Successful',
        message: 'Your payment has been processed successfully. Thank you for your subscription!',
        type: 'success',
        priority: 'high',
        category: 'billing',
        userId: 'current-user',
        actions: [
          { label: 'View Billing', action: 'navigate', value: '/dashboard/billing' },
          { label: 'Continue', action: 'navigate', value: '/dashboard' }
        ]
      }
    })

    // System Maintenance
    this.addTrigger({
      event: 'system-maintenance',
      condition: () => {
        // Check if maintenance is scheduled (this would come from your backend)
        return typeof window !== 'undefined' && 
               localStorage.getItem('maintenance-notification-shown') !== 'true'
      },
      notification: {
        title: 'Scheduled Maintenance',
        message: 'System maintenance is scheduled for tonight from 2-4 AM EST. Some features may be temporarily unavailable.',
        type: 'warning',
        priority: 'medium',
        category: 'system',
        userId: 'current-user',
        actions: [
          { label: 'Learn More', action: 'navigate', value: '/support' }
        ]
      }
    })
  }

  /**
   * Add a custom notification trigger
   */
  addTrigger(trigger: NotificationTrigger) {
    this.triggers.push(trigger)
  }

  /**
   * Check all triggers and fire notifications
   */
  checkTriggers() {
    if (!this.addNotification) return

    this.triggers.forEach(trigger => {
      try {
        if (trigger.condition()) {
          this.addNotification(trigger.notification)
          
          // Mark certain events as processed to avoid duplicate notifications
          if (trigger.event === 'system-maintenance') {
            localStorage.setItem('maintenance-notification-shown', 'true')
          }
        }
      } catch (error) {
        console.warn('Notification trigger error:', error)
      }
    })
  }

  /**
   * Manually trigger a notification event
   */
  triggerEvent(eventName: string, data?: any) {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(eventName, 'true')
      
      // Auto-clear after 5 seconds to prevent stale triggers
      setTimeout(() => {
        sessionStorage.removeItem(eventName)
      }, 5000)
    }
  }

  /**
   * Start monitoring for events
   */
  startMonitoring() {
    if (typeof window === 'undefined') return

    // Check triggers every 2 seconds
    const interval = setInterval(() => {
      this.checkTriggers()
    }, 2000)

    // Also check on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkTriggers()
      }
    })

    // Check on page load
    this.checkTriggers()

    return () => clearInterval(interval)
  }
}

// Export singleton instance
export const notificationMiddleware = new NotificationMiddleware()
