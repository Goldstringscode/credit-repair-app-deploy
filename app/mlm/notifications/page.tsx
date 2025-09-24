"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Bell, 
  Filter, 
  Search, 
  Settings, 
  RefreshCw, 
  Trash2, 
  CheckCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  DollarSign,
  Users,
  Trophy,
  BookOpen,
  Target
} from "lucide-react"
import { useMLMNotifications } from "@/lib/mlm-notification-context"
import { MLMNotificationFilters } from "@/components/mlm-notification-filters"
import { MLMNotificationBulkActions } from "@/components/mlm-notification-bulk-actions"
import { useRouter } from "next/navigation"

export default function MLMNotificationsPage() {
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    getFilteredNotifications,
    refreshNotifications
  } = useMLMNotifications()
  
  const [showFilters, setShowFilters] = useState(false)
  const [showBulkActions, setShowBulkActions] = useState(false)
  const router = useRouter()

  const filteredNotifications = getFilteredNotifications()

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "team_join":
        return <Users className="h-5 w-5 text-blue-500" />
      case "team_creation":
        return <Users className="h-5 w-5 text-green-500" />
      case "rank_advancement":
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case "commission_earned":
        return <DollarSign className="h-5 w-5 text-green-500" />
      case "payout_processed":
        return <DollarSign className="h-5 w-5 text-green-600" />
      case "training_completed":
        return <BookOpen className="h-5 w-5 text-blue-500" />
      case "task_completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "invitation_sent":
        return <Bell className="h-5 w-5 text-purple-500" />
      case "new_member":
        return <Users className="h-5 w-5 text-blue-600" />
      case "milestone":
        return <Target className="h-5 w-5 text-orange-500" />
      case "alert":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
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
        return "border-l-green-500 bg-green-50"
      case "alert":
      case "warning":
      case "error":
        return "border-l-red-500 bg-red-50"
      case "training_completed":
      case "task_completed":
      case "info":
        return "border-l-blue-500 bg-blue-50"
      default:
        return "border-l-gray-500 bg-gray-50"
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

  const handleNotificationAction = (action: string, notificationId: string) => {
    markAsRead(notificationId)
    
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
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Loading notifications...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">MLM Notifications</h1>
            <p className="text-gray-600">
              Stay updated with your team activities, earnings, and achievements
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowBulkActions(!showBulkActions)}
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Bulk Actions</span>
            </Button>
            <Button
              variant="outline"
              onClick={refreshNotifications}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Earnings</p>
                <p className="text-2xl font-bold text-green-600">
                  {notifications.filter(n => n.type === 'commission_earned' || n.type === 'payout_processed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Team</p>
                <p className="text-2xl font-bold text-blue-600">
                  {notifications.filter(n => n.type === 'team_join' || n.type === 'new_member').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filter Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MLMNotificationFilters />
          </CardContent>
        </Card>
      )}

      {/* Bulk Actions */}
      {showBulkActions && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Bulk Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MLMNotificationBulkActions />
          </CardContent>
        </Card>
      )}

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Notifications</CardTitle>
              <CardDescription>
                {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
                {unreadCount > 0 && ` (${unreadCount} unread)`}
              </CardDescription>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                onClick={markAllAsRead}
                className="flex items-center space-x-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Mark All Read</span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No notifications found</h3>
              <p className="text-sm text-gray-400">
                {notifications.length === 0 
                  ? "You don't have any notifications yet. They'll appear here when you receive them."
                  : "No notifications match your current filters. Try adjusting your search criteria."
                }
              </p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-1">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${
                      !notification.read ? getNotificationColor(notification.type) : 'border-l-gray-200'
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-medium ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                            <Badge 
                              variant={notification.priority === "high" ? "destructive" : "secondary"}
                              className="text-xs"
                            >
                              {notification.priority}
                            </Badge>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        
                        {/* Action Buttons */}
                        {notification.actions && notification.actions.length > 0 && (
                          <div className="flex space-x-2 mt-3">
                            {notification.actions.map((action, index) => (
                              <Button
                                key={index}
                                variant={action.variant || "outline"}
                                size="sm"
                                className="text-xs h-7 px-3"
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
                      <div className="flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeNotification(notification.id)
                          }}
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}