"use client"

import { useState } from "react"
import { 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Download, 
  Share2, 
  Bookmark, 
  Archive,
  Flag,
  Reply,
  Forward,
  Copy,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  Star,
  Heart,
  ThumbsUp,
  MessageSquare,
  Calendar,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  FileText,
  Image,
  Video,
  Music,
  Link
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useNotifications } from "@/lib/notification-context"
import { useRouter } from "next/navigation"

interface NotificationAction {
  id: string
  label: string
  icon: React.ComponentType<any>
  action: string
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  category: 'primary' | 'secondary' | 'danger' | 'utility'
  requiresConfirmation?: boolean
  confirmationMessage?: string
  disabled?: boolean
  tooltip?: string
}

interface NotificationActionsProps {
  notification: any
  onActionComplete?: (action: string) => void
  compact?: boolean
}

export function NotificationActions({ notification, onActionComplete, compact = false }: NotificationActionsProps) {
  const { markAsRead, removeNotification, playNotificationSound } = useNotifications()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isArchived, setIsArchived] = useState(false)
  const [isFlagged, setIsFlagged] = useState(false)
  const router = useRouter()

  // Define available actions based on notification type and context
  const getAvailableActions = (): NotificationAction[] => {
    const baseActions: NotificationAction[] = [
      {
        id: 'mark-read',
        label: notification.read ? 'Mark Unread' : 'Mark Read',
        icon: notification.read ? EyeOff : Eye,
        action: 'toggle_read',
        variant: 'outline',
        category: 'primary',
        tooltip: notification.read ? 'Mark as unread' : 'Mark as read'
      },
      {
        id: 'bookmark',
        label: isBookmarked ? 'Unbookmark' : 'Bookmark',
        icon: Bookmark,
        action: 'toggle_bookmark',
        variant: 'outline',
        category: 'secondary',
        tooltip: isBookmarked ? 'Remove bookmark' : 'Add bookmark'
      },
      {
        id: 'archive',
        label: isArchived ? 'Unarchive' : 'Archive',
        icon: Archive,
        action: 'toggle_archive',
        variant: 'outline',
        category: 'secondary',
        tooltip: isArchived ? 'Remove from archive' : 'Archive notification'
      },
      {
        id: 'flag',
        label: isFlagged ? 'Unflag' : 'Flag',
        icon: Flag,
        action: 'toggle_flag',
        variant: isFlagged ? 'destructive' : 'outline',
        category: 'secondary',
        tooltip: isFlagged ? 'Remove flag' : 'Flag for follow-up'
      }
    ]

    // Add type-specific actions
    const typeSpecificActions: NotificationAction[] = []
    
    switch (notification.type) {
      case 'success':
        typeSpecificActions.push(
          {
            id: 'share-success',
            label: 'Share Success',
            icon: Share2,
            action: 'share_achievement',
            variant: 'default',
            category: 'primary',
            tooltip: 'Share your achievement'
          },
          {
            id: 'celebrate',
            label: 'Celebrate',
            icon: Star,
            action: 'celebrate',
            variant: 'default',
            category: 'primary',
            tooltip: 'Celebrate this achievement'
          }
        )
        break
        
      case 'error':
        typeSpecificActions.push(
          {
            id: 'get-help',
            label: 'Get Help',
            icon: MessageSquare,
            action: 'get_help',
            variant: 'default',
            category: 'primary',
            tooltip: 'Get help with this issue'
          },
          {
            id: 'report-issue',
            label: 'Report Issue',
            icon: Flag,
            action: 'report_issue',
            variant: 'destructive',
            category: 'danger',
            tooltip: 'Report this issue'
          }
        )
        break
        
      case 'warning':
        typeSpecificActions.push(
          {
            id: 'acknowledge',
            label: 'Acknowledge',
            icon: CheckCircle,
            action: 'acknowledge_warning',
            variant: 'default',
            category: 'primary',
            tooltip: 'Acknowledge this warning'
          },
          {
            id: 'dismiss',
            label: 'Dismiss',
            icon: XCircle,
            action: 'dismiss_warning',
            variant: 'outline',
            category: 'secondary',
            tooltip: 'Dismiss this warning'
          }
        )
        break
        
      case 'info':
        typeSpecificActions.push(
          {
            id: 'learn-more',
            label: 'Learn More',
            icon: ExternalLink,
            action: 'learn_more',
            variant: 'default',
            category: 'primary',
            tooltip: 'Learn more about this'
          }
        )
        break
    }

    // Add category-specific actions
    const categorySpecificActions: NotificationAction[] = []
    
    switch (notification.category) {
      case 'credit':
        categorySpecificActions.push(
          {
            id: 'view-report',
            label: 'View Report',
            icon: FileText,
            action: 'view_credit_report',
            variant: 'default',
            category: 'primary',
            tooltip: 'View your credit report'
          },
          {
            id: 'download-report',
            label: 'Download',
            icon: Download,
            action: 'download_report',
            variant: 'outline',
            category: 'secondary',
            tooltip: 'Download credit report'
          }
        )
        break
        
      case 'training':
        categorySpecificActions.push(
          {
            id: 'continue-learning',
            label: 'Continue',
            icon: Play,
            action: 'continue_learning',
            variant: 'default',
            category: 'primary',
            tooltip: 'Continue your learning'
          },
          {
            id: 'view-progress',
            label: 'View Progress',
            icon: TrendingUp,
            action: 'view_progress',
            variant: 'outline',
            category: 'secondary',
            tooltip: 'View your learning progress'
          }
        )
        break
        
      case 'payment':
        categorySpecificActions.push(
          {
            id: 'view-receipt',
            label: 'View Receipt',
            icon: Receipt,
            action: 'view_receipt',
            variant: 'default',
            category: 'primary',
            tooltip: 'View payment receipt'
          },
          {
            id: 'update-payment',
            label: 'Update Payment',
            icon: CreditCard,
            action: 'update_payment',
            variant: 'outline',
            category: 'secondary',
            tooltip: 'Update payment method'
          }
        )
        break
    }

    // Add utility actions
    const utilityActions: NotificationAction[] = [
      {
        id: 'copy-link',
        label: 'Copy Link',
        icon: Copy,
        action: 'copy_link',
        variant: 'ghost',
        category: 'utility',
        tooltip: 'Copy notification link'
      },
      {
        id: 'schedule-reminder',
        label: 'Remind Later',
        icon: Clock,
        action: 'schedule_reminder',
        variant: 'ghost',
        category: 'utility',
        tooltip: 'Set a reminder for later'
      },
      {
        id: 'delete',
        label: 'Delete',
        icon: Trash2,
        action: 'delete',
        variant: 'destructive',
        category: 'danger',
        requiresConfirmation: true,
        confirmationMessage: 'Are you sure you want to delete this notification?',
        tooltip: 'Delete this notification'
      }
    ]

    return [...baseActions, ...typeSpecificActions, ...categorySpecificActions, ...utilityActions]
  }

  const handleAction = async (action: NotificationAction) => {
    try {
      switch (action.action) {
        case 'toggle_read':
          if (notification.read) {
            // Mark as unread (would need API support)
            console.log('Mark as unread not implemented')
          } else {
            await markAsRead(notification.id)
          }
          break
          
        case 'toggle_bookmark':
          setIsBookmarked(!isBookmarked)
          await playNotificationSound('success')
          break
          
        case 'toggle_archive':
          setIsArchived(!isArchived)
          await playNotificationSound('success')
          break
          
        case 'toggle_flag':
          setIsFlagged(!isFlagged)
          await playNotificationSound('warning')
          break
          
        case 'share_achievement':
          if (navigator.share) {
            await navigator.share({
              title: notification.title,
              text: notification.message,
              url: window.location.href
            })
          } else {
            // Fallback to copying to clipboard
            await navigator.clipboard.writeText(`${notification.title}\n${notification.message}`)
          }
          await playNotificationSound('success')
          break
          
        case 'celebrate':
          await playNotificationSound('celebration')
          // Add celebration animation or effect
          break
          
        case 'get_help':
          router.push('/support')
          break
          
        case 'report_issue':
          router.push('/support?type=bug')
          break
          
        case 'acknowledge_warning':
          await markAsRead(notification.id)
          await playNotificationSound('success')
          break
          
        case 'dismiss_warning':
          await removeNotification(notification.id)
          break
          
        case 'learn_more':
          if (notification.data?.url) {
            window.open(notification.data.url, '_blank')
          }
          break
          
        case 'view_credit_report':
          router.push('/dashboard/credit-reports')
          break
          
        case 'download_report':
          // Trigger download
          console.log('Download report')
          break
          
        case 'continue_learning':
          router.push('/dashboard/training')
          break
          
        case 'view_progress':
          router.push('/dashboard/training/progress')
          break
          
        case 'view_receipt':
          router.push('/dashboard/billing')
          break
          
        case 'update_payment':
          router.push('/dashboard/billing/payment-methods')
          break
          
        case 'copy_link':
          await navigator.clipboard.writeText(window.location.href)
          await playNotificationSound('success')
          break
          
        case 'schedule_reminder':
          // Open reminder dialog
          console.log('Schedule reminder')
          break
          
        case 'delete':
          if (confirm(action.confirmationMessage)) {
            await removeNotification(notification.id)
            await playNotificationSound('warning')
          }
          break
          
        default:
          console.log('Unknown action:', action.action)
      }
      
      onActionComplete?.(action.action)
    } catch (error) {
      console.error('Error handling action:', error)
    }
  }

  const availableActions = getAvailableActions()
  const primaryActions = availableActions.filter(a => a.category === 'primary')
  const secondaryActions = availableActions.filter(a => a.category === 'secondary')
  const utilityActions = availableActions.filter(a => a.category === 'utility')
  const dangerActions = availableActions.filter(a => a.category === 'danger')

  if (compact) {
    return (
      <div className="flex items-center space-x-1">
        {primaryActions.slice(0, 2).map(action => (
          <Button
            key={action.id}
            variant={action.variant}
            size="sm"
            onClick={() => handleAction(action)}
            className="h-8 px-2"
            title={action.tooltip}
          >
            <action.icon className="h-3 w-3" />
          </Button>
        ))}
        {availableActions.length > 2 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 px-2"
          >
            <span className="text-xs">+{availableActions.length - 2}</span>
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Primary Actions */}
      {primaryActions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {primaryActions.map(action => (
            <Button
              key={action.id}
              variant={action.variant}
              size="sm"
              onClick={() => handleAction(action)}
              className="flex items-center space-x-2"
            >
              <action.icon className="h-4 w-4" />
              <span>{action.label}</span>
            </Button>
          ))}
        </div>
      )}

      {/* Secondary Actions */}
      {secondaryActions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {secondaryActions.map(action => (
            <Button
              key={action.id}
              variant={action.variant}
              size="sm"
              onClick={() => handleAction(action)}
              className="flex items-center space-x-2"
            >
              <action.icon className="h-4 w-4" />
              <span>{action.label}</span>
            </Button>
          ))}
        </div>
      )}

      {/* Expandable Utility Actions */}
      {utilityActions.length > 0 && (
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full"
          >
            {isExpanded ? 'Show Less' : 'More Actions'}
          </Button>
          
          {isExpanded && (
            <div className="mt-2 space-y-2">
              <Separator />
              <div className="grid grid-cols-2 gap-2">
                {utilityActions.map(action => (
                  <Button
                    key={action.id}
                    variant={action.variant}
                    size="sm"
                    onClick={() => handleAction(action)}
                    className="flex items-center space-x-2"
                    title={action.tooltip}
                  >
                    <action.icon className="h-4 w-4" />
                    <span>{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Danger Actions */}
      {dangerActions.length > 0 && (
        <div className="pt-2 border-t">
          <div className="flex flex-wrap gap-2">
            {dangerActions.map(action => (
              <Button
                key={action.id}
                variant={action.variant}
                size="sm"
                onClick={() => handleAction(action)}
                className="flex items-center space-x-2"
                title={action.tooltip}
              >
                <action.icon className="h-4 w-4" />
                <span>{action.label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Import missing icons
import { Play, TrendingUp, Receipt } from "lucide-react"
