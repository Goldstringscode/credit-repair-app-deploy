import { useEffect } from 'react'
import { useNotificationIntegration } from './use-notification-integration'

/**
 * Hook to add notification triggers to specific pages
 * This integrates with existing page functionality without modifying it
 */

// Credit Report Upload Page
export function useCreditReportNotifications() {
  const { triggerEvent } = useNotificationIntegration()

  const notifyUploadSuccess = () => {
    triggerEvent('credit-report-uploaded')
  }

  const notifyUploadError = (error: string) => {
    triggerEvent('credit-report-error', { error })
  }

  return {
    notifyUploadSuccess,
    notifyUploadError
  }
}

// Analysis Page
export function useAnalysisNotifications() {
  const { triggerEvent } = useNotificationIntegration()

  const notifyAnalysisComplete = () => {
    triggerEvent('analysis-complete')
  }

  const notifyAnalysisError = (error: string) => {
    triggerEvent('analysis-error', { error })
  }

  return {
    notifyAnalysisComplete,
    notifyAnalysisError
  }
}

// Letter Generation Page
export function useLetterNotifications() {
  const { triggerEvent } = useNotificationIntegration()

  const notifyLetterGenerated = () => {
    triggerEvent('dispute-letter-generated')
  }

  const notifyLetterSent = () => {
    triggerEvent('dispute-letter-sent')
  }

  return {
    notifyLetterGenerated,
    notifyLetterSent
  }
}

// Payment/Checkout Page
export function usePaymentNotifications() {
  const { triggerEvent } = useNotificationIntegration()

  const notifyPaymentSuccess = () => {
    triggerEvent('payment-success')
  }

  const notifyPaymentError = (error: string) => {
    triggerEvent('payment-error', { error })
  }

  return {
    notifyPaymentSuccess,
    notifyPaymentError
  }
}

// Dashboard Page
export function useDashboardNotifications() {
  const { triggerEvent } = useNotificationIntegration()

  useEffect(() => {
    // Check for any pending notifications when dashboard loads
    const checkPendingNotifications = () => {
      // This could check for pending tasks, updates, etc.
      const hasPendingTasks = sessionStorage.getItem('has-pending-tasks') === 'true'
      if (hasPendingTasks) {
        triggerEvent('pending-tasks-reminder')
      }
    }

    checkPendingNotifications()
  }, [triggerEvent])

  const notifyTaskComplete = (taskName: string) => {
    triggerEvent('task-complete', { taskName })
  }

  return {
    notifyTaskComplete
  }
}
