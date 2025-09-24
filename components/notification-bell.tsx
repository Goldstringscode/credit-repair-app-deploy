"use client"

import { useState, useEffect } from "react"
import { Bell, X, Eye, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useNotifications } from "@/lib/notification-context"
import { useRouter } from "next/navigation"
import { pushNotificationService } from "@/lib/push-notification-service"
import { NotificationFilters } from "./notification-filters"
import { NotificationBulkActions } from "./notification-bulk-actions"
import { NotificationPreferencesComponent } from "./notification-preferences"
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications"

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, getFilteredNotifications } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default')
  const [showSettings, setShowSettings] = useState(false)
  const router = useRouter()

  // Real-time notifications hook
  const { isConnected: realtimeConnected, connectionStatus } = useRealtimeNotifications()

  const filteredNotifications = getFilteredNotifications()
  const recentNotifications = filteredNotifications.slice(0, 10)

  // Check push notification permission on mount
  useEffect(() => {
    setPushPermission(pushNotificationService.getPermissionStatus())
  }, [])

  // Request push notification permission
  const requestPushPermission = async () => {
    const permission = await pushNotificationService.requestPermission()
    setPushPermission(permission)
  }

  // Handle notification action buttons
  const handleNotificationAction = (action: string, notificationId: string) => {
    // Mark notification as read when action is clicked
    markAsRead(notificationId)
    
    // Handle different actions
    switch (action) {
      case 'view_progress':
        router.push('/dashboard/training')
        break
      case 'view_certificate':
        router.push('/dashboard/training/certificates')
        break
      case 'view_quiz_results':
        router.push('/dashboard/training/quizzes')
        break
      case 'view_achievement':
        router.push('/dashboard/training/progress')
        break
      case 'start_next_course':
        router.push('/dashboard/training')
        break
      case 'view_action_plan':
        router.push('/dashboard/action-plans')
        break
      case 'view_credit_report':
        router.push('/dashboard/reports')
        break
      case 'view_progress_details':
        router.push('/dashboard/training/progress')
        break
      case 'view_feature_update':
        router.push('/dashboard/notifications')
        break
      default:
        console.log('Unknown action:', action)
    }
    
    // Close the popover
    setIsOpen(false)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "credit_score":
        return "📈"
      case "dispute":
        return "⚖️"
      case "fcra":
        return "📋"
      case "payment":
        return "💳"
      case "alert":
        return "⚠️"
      case "mail":
        return "📧"
      default:
        return "🔔"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500 bg-red-50"
      case "medium":
        return "border-l-yellow-500 bg-yellow-50"
      default:
        return "border-l-blue-500 bg-blue-50"
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CardTitle className="text-lg">Notifications</CardTitle>
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' :
                  connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                  connectionStatus === 'error' ? 'bg-red-500' :
                  'bg-gray-400'
                }`} title={`Real-time: ${connectionStatus}`} />
              </div>
              <div className="flex items-center space-x-2">
                {pushPermission === 'default' && (
                  <Button variant="ghost" size="sm" onClick={requestPushPermission} className="text-xs">
                    Enable Push
                  </Button>
                )}
                {!showSettings && unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                    Mark all read
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-xs"
                >
                  {showSettings ? 'Notifications' : 'Settings'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground">
                You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </p>
            )}
          </CardHeader>
          
          {showSettings ? (
            <CardContent className="p-6">
              <NotificationPreferencesComponent />
            </CardContent>
          ) : (
            <>
              {/* Filters */}
              <div className="px-6 pb-4">
                <NotificationFilters />
              </div>
              
              {/* Bulk Actions */}
              <div className="px-6 pb-4">
                <NotificationBulkActions />
              </div>
              <Separator />
            </>
          )}
          {!showSettings && (
            <CardContent className="p-0">
              <ScrollArea className="h-96">
              {recentNotifications.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No notifications yet</p>
                  <p className="text-xs mt-1">We'll notify you when something important happens</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-l-4 hover:bg-gray-50 transition-colors ${getPriorityColor(notification.priority)} ${
                        !notification.read ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-lg">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4
                              className={`text-sm font-medium ${!notification.read ? "text-gray-900" : "text-gray-700"}`}
                            >
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-1">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeNotification(notification.id)}
                                className="h-6 w-6 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className={`text-sm mt-1 ${!notification.read ? "text-gray-800" : "text-gray-600"}`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                            <Badge
                              variant={notification.priority === "high" ? "destructive" : "secondary"}
                              className="text-xs"
                            >
                              {notification.priority}
                            </Badge>
                          </div>
                          {notification.actions && (
                            <div className="flex space-x-2 mt-3">
                              {notification.actions.map((action, index) => (
                                <Button
                                  key={index}
                                  variant={action.variant || "outline"}
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => handleNotificationAction(action.action, notification.id)}
                                >
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            {notifications.length > 10 && (
              <>
                <Separator />
                <div className="p-3">
                  <Button variant="ghost" className="w-full text-sm" onClick={() => setIsOpen(false)}>
                    View all notifications
                  </Button>
                </div>
              </>
            )}
          </CardContent>
          )}
        </Card>
      </PopoverContent>
    </Popover>
  )
}
