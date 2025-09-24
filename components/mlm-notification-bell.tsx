"use client"

import { useState, useEffect } from "react"
import { Bell, X, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useMLMNotifications } from "@/lib/mlm-notification-context"
import { useRouter } from "next/navigation"
import { pushNotificationService } from "@/lib/push-notification-service"
import { MLMNotificationFilters } from "./mlm-notification-filters"
import { useRealtimeMLM } from "@/hooks/use-realtime-mlm"

export function MLMNotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, getFilteredNotifications } = useMLMNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default')
  const [showSettings, setShowSettings] = useState(false)
  const router = useRouter()

  // Real-time MLM notifications hook
  const { isConnected: realtimeConnected } = useRealtimeMLM()

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
    
    // Handle different MLM-specific actions
    switch (action) {
      case 'view_dashboard':
        router.push('/mlm/dashboard')
        break
      case 'view_team':
        router.push('/mlm/genealogy')
        break
      case 'view_benefits':
        router.push('/mlm/rank-progression')
        break
      case 'view_earnings':
        router.push('/mlm/payouts')
        break
      case 'continue_training':
        router.push('/mlm/training')
        break
      case 'view_transaction':
        router.push('/mlm/payouts')
        break
      case 'view_milestone':
        router.push('/mlm/team-performance')
        break
      case 'view_leaderboard':
        router.push('/mlm/leaderboard')
        break
      case 'view_commission':
        router.push('/mlm/commission-calculator')
        break
      default:
        console.log('Unknown MLM action:', action)
    }
    
    // Close the popover
    setIsOpen(false)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "team_join":
        return "👥"
      case "team_creation":
        return "🏗️"
      case "rank_advancement":
        return "🏆"
      case "commission_earned":
        return "💰"
      case "payout_processed":
        return "💳"
      case "training_completed":
        return "📚"
      case "task_completed":
        return "✅"
      case "invitation_sent":
        return "📤"
      case "new_member":
        return "🆕"
      case "milestone":
        return "🎯"
      case "alert":
        return "⚠️"
      case "success":
        return "✅"
      case "warning":
        return "⚠️"
      case "error":
        return "❌"
      case "info":
        return "ℹ️"
      default:
        return "🔔"
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "team_join":
      case "rank_advancement":
      case "commission_earned":
      case "payout_processed":
      case "milestone":
      case "success":
        return "text-green-600"
      case "alert":
      case "warning":
      case "error":
        return "text-red-600"
      case "training_completed":
      case "task_completed":
      case "info":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const notificationTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <div className="relative">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs p-0"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">MLM Notifications</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(!showSettings)}
                    className="h-8 w-8 p-0"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Connection Status */}
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <div className={`w-2 h-2 rounded-full ${realtimeConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>{realtimeConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </CardHeader>

            <Separator />

            {/* Settings Panel */}
            {showSettings && (
              <>
                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Push Notifications</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Enable push notifications</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={requestPushPermission}
                        disabled={pushPermission === 'granted'}
                      >
                        {pushPermission === 'granted' ? 'Enabled' : 'Enable'}
                      </Button>
                    </div>
                  </div>
                  
                  <MLMNotificationFilters />
                </div>
                <Separator />
              </>
            )}

            {/* Notifications List */}
            <CardContent className="p-0">
              {recentNotifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No notifications yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    You'll see MLM updates here when they arrive
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-3 border-b bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {unreadCount} unread notifications
                      </span>
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={markAllAsRead}
                          className="text-xs h-6 px-2"
                        >
                          Mark all read
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <ScrollArea className="h-80">
                    <div className="space-y-1">
                      {recentNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                            !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-0.5">
                              <span className="text-lg">
                                {getNotificationIcon(notification.type)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className={`text-sm font-medium ${getNotificationColor(notification.type)}`}>
                                  {notification.title}
                                </h4>
                                <span className="text-xs text-gray-500">
                                  {formatTimeAgo(notification.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              
                              {/* Action Buttons */}
                              {notification.actions && notification.actions.length > 0 && (
                                <div className="flex space-x-2 mt-2">
                                  {notification.actions.map((action, index) => (
                                    <Button
                                      key={index}
                                      variant={action.variant || "outline"}
                                      size="sm"
                                      className="text-xs h-6 px-2"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleNotificationAction(action.action, notification.id)
                                      }}
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
                  </ScrollArea>
                </>
              )}
            </CardContent>

            {/* Footer */}
            {recentNotifications.length > 0 && (
              <>
                <Separator />
                <div className="p-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => router.push('/mlm/notifications')}
                  >
                    View All Notifications
                  </Button>
                </div>
              </>
            )}
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  )
}