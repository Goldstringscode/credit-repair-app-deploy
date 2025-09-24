"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Bell,
  Mail,
  CreditCard,
  FileText,
  Scale,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Settings,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Trash2,
  Archive,
  Star,
} from "lucide-react"
import { useNotifications } from "@/lib/notification-context"
import { NotificationFilters } from "@/components/notification-filters"
import { NotificationBulkActions } from "@/components/notification-bulk-actions"
import { NotificationPreferencesComponent } from "@/components/notification-preferences"

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showSettings, setShowSettings] = useState(false)
  
  const { 
    notifications, 
    unreadCount, 
    isLoading,
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    getFilteredNotifications,
    setFilter,
    clearFilters
  } = useNotifications()

  const filteredNotifications = getFilteredNotifications()
  const importantCount = notifications.filter((n) => n.priority === "high").length

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setFilter('search', query)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (tab === 'unread') {
      setFilter('read', 'unread')
    } else if (tab === 'important') {
      setFilter('priority', 'high')
    } else if (tab === 'all') {
      clearFilters()
    } else {
      setFilter('type', tab)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600 mt-1">Stay updated with your credit repair progress</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={() => setShowSettings(!showSettings)} 
                variant="outline"
              >
                <Settings className="h-4 w-4 mr-2" />
                {showSettings ? 'Notifications' : 'Settings'}
              </Button>
              {unreadCount > 0 && (
                <Button onClick={markAllAsRead} variant="outline">
                  Mark All Read
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {showSettings ? (
          <div className="max-w-4xl mx-auto">
            <NotificationPreferencesComponent />
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Notifications List */}
            <div className="lg:col-span-3 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Notifications</CardTitle>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search notifications..."
                          value={searchQuery}
                          onChange={(e) => handleSearch(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="mb-6">
                    <NotificationFilters />
                  </div>

                  {/* Bulk Actions */}
                  <div className="mb-6">
                    <NotificationBulkActions />
                  </div>

                  <Separator className="mb-6" />

                  <Tabs value={activeTab} onValueChange={handleTabChange}>
                    <TabsList className="grid w-full grid-cols-6">
                      <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
                      <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
                      <TabsTrigger value="important">Important ({importantCount})</TabsTrigger>
                      <TabsTrigger value="credit_score">Credit</TabsTrigger>
                      <TabsTrigger value="dispute">Disputes</TabsTrigger>
                      <TabsTrigger value="fcra">FCRA</TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab} className="mt-6">
                      {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      ) : filteredNotifications.length === 0 ? (
                        <div className="text-center py-8">
                          <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                          <p className="text-gray-500">You're all caught up!</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredNotifications.map((notification) => {
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
                                          >
                                            {action.label}
                                          </Button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Notifications</span>
                    <span className="font-semibold">{notifications.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Unread</span>
                    <Badge variant="destructive">{unreadCount}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Important</span>
                    <Badge variant="default">{importantCount}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">This Week</span>
                    <span className="font-semibold">
                      {
                        notifications.filter(
                          (n) => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) < new Date(n.timestamp),
                        ).length
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notification Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { type: "Credit Score Updates", icon: TrendingUp, color: "text-green-600", count: notifications.filter(n => n.type === 'credit_score').length },
                      { type: "Dispute Responses", icon: FileText, color: "text-blue-600", count: notifications.filter(n => n.type === 'dispute').length },
                      { type: "FCRA Complaints", icon: Scale, color: "text-red-600", count: notifications.filter(n => n.type === 'fcra').length },
                      { type: "Payment Confirmations", icon: CreditCard, color: "text-purple-600", count: notifications.filter(n => n.type === 'payment').length },
                      { type: "System Alerts", icon: AlertTriangle, color: "text-yellow-600", count: notifications.filter(n => n.type === 'alert').length },
                    ].map((item, index) => {
                      const Icon = item.icon
                      return (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Icon className={`h-4 w-4 ${item.color}`} />
                            <span className="text-sm">{item.type}</span>
                          </div>
                          <Badge variant="outline">{item.count}</Badge>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
