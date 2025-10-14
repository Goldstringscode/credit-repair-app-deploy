"use client"

import { useState, useEffect } from "react"
import { 
  Bell, 
  TrendingUp, 
  Settings, 
  BarChart3, 
  Clock, 
  Volume2,
  VolumeX,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Eye,
  EyeOff,
  Star,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useNotifications } from "@/lib/notification-context"
import { NotificationCategories } from "./notification-categories"
import { NotificationActions } from "./notification-actions"
import { MobileNotificationBell } from "./notification-mobile"
import { useIsMobile } from "@/hooks/use-mobile"

export function NotificationDashboard() {
  const { 
    notifications, 
    unreadCount, 
    getAnalytics, 
    getUserEngagementProfile,
    getSoundSettings,
    updateSoundSettings,
    playNotificationSound,
    getTemplates,
    getTemplatesByCategory
  } = useNotifications()
  
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState('overview')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const analytics = getAnalytics()
  const userProfile = getUserEngagementProfile()
  const soundSettings = getSoundSettings()
  const templates = getTemplates()

  useEffect(() => {
    setSoundEnabled(soundSettings.enabled)
  }, [soundSettings])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled)
    updateSoundSettings({ enabled })
    if (enabled) {
      playNotificationSound('success')
    }
  }

  const getNotificationStats = () => {
    const total = notifications.length
    const unread = notifications.filter(n => !n.read).length
    const read = total - unread
    const highPriority = notifications.filter(n => n.priority === 'high').length
    const mediumPriority = notifications.filter(n => n.priority === 'medium').length
    const lowPriority = notifications.filter(n => n.priority === 'low').length

    return {
      total,
      unread,
      read,
      highPriority,
      mediumPriority,
      lowPriority,
      readRate: total > 0 ? (read / total) * 100 : 0
    }
  }

  const getCategoryStats = () => {
    const categories = ['credit', 'training', 'milestone', 'system', 'payment', 'alert']
    return categories.map(category => {
      const categoryNotifications = notifications.filter(n => n.category === category)
      const unread = categoryNotifications.filter(n => !n.read).length
      return {
        category,
        total: categoryNotifications.length,
        unread,
        percentage: notifications.length > 0 ? (categoryNotifications.length / notifications.length) * 100 : 0
      }
    }).filter(stat => stat.total > 0)
  }

  const stats = getNotificationStats()
  const categoryStats = getCategoryStats()

  if (isMobile) {
    return <MobileNotificationBell />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notification Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and monitor your notification system
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSoundToggle(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.readRate.toFixed(1)}% read rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.unread}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? ((stats.unread / stats.total) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.highPriority}</div>
            <p className="text-xs text-muted-foreground">
              Urgent notifications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analytics.engagementScore ? Math.round(analytics.engagementScore * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Overall engagement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Priority Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Priority Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      <span className="text-sm">High Priority</span>
                    </div>
                    <span className="text-sm font-medium">{stats.highPriority}</span>
                  </div>
                  <Progress 
                    value={stats.total > 0 ? (stats.highPriority / stats.total) * 100 : 0} 
                    className="h-2"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                      <span className="text-sm">Medium Priority</span>
                    </div>
                    <span className="text-sm font-medium">{stats.mediumPriority}</span>
                  </div>
                  <Progress 
                    value={stats.total > 0 ? (stats.mediumPriority / stats.total) * 100 : 0} 
                    className="h-2"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full" />
                      <span className="text-sm">Low Priority</span>
                    </div>
                    <span className="text-sm font-medium">{stats.lowPriority}</span>
                  </div>
                  <Progress 
                    value={stats.total > 0 ? (stats.lowPriority / stats.total) * 100 : 0} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Category Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Category Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryStats.map(stat => (
                    <div key={stat.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="capitalize">
                            {stat.category}
                          </Badge>
                          {stat.unread > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {stat.unread} unread
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm font-medium">{stat.total}</span>
                      </div>
                      <Progress value={stat.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.slice(0, 5).map(notification => (
                  <div
                    key={notification.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="text-lg">
                      {notification.type === 'success' ? '✅' :
                       notification.type === 'error' ? '❌' :
                       notification.type === 'warning' ? '⚠️' : 'ℹ️'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium truncate">
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={notification.priority === 'high' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {notification.priority}
                          </Badge>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {notification.message}
                      </p>
                    </div>
                    <NotificationActions notification={notification} compact={true} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <NotificationCategories />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Delivery Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.deliveryRate ? Math.round(analytics.deliveryRate * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Notifications delivered
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Read Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.readRate ? Math.round(analytics.readRate * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Notifications read
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Click Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.clickRate ? Math.round(analytics.clickRate * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Notifications clicked
                </p>
              </CardContent>
            </Card>
          </div>

          {userProfile && (
            <Card>
              <CardHeader>
                <CardTitle>Your Engagement Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Notifications</span>
                    <span className="font-medium">{userProfile.totalNotifications}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Read Rate</span>
                    <span className="font-medium">{Math.round(userProfile.readRate * 100)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Click Rate</span>
                    <span className="font-medium">{Math.round(userProfile.clickRate * 100)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Engagement Score</span>
                    <span className="font-medium">{Math.round(userProfile.averageEngagementScore * 100)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="text-sm">{template.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-2">
                    {template.description}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                    <Badge
                      variant={template.priority === 'high' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {template.priority}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Sound Notifications</h4>
                  <p className="text-xs text-muted-foreground">
                    Play sounds for new notifications
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSoundToggle(!soundEnabled)}
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Master Volume</h4>
                  <p className="text-xs text-muted-foreground">
                    Overall notification volume
                  </p>
                </div>
                <div className="w-24">
                  <Progress value={soundSettings.masterVolume * 100} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
