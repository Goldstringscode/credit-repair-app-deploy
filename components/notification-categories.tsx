"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNotifications } from "@/lib/notification-context"
import { 
  CreditCard, 
  GraduationCap, 
  Trophy, 
  Settings, 
  DollarSign, 
  AlertTriangle,
  TrendingUp,
  Mail,
  Bell,
  Star
} from "lucide-react"

interface CategoryStats {
  category: string
  total: number
  unread: number
  readRate: number
  clickRate: number
  engagementScore: number
  trend: 'up' | 'down' | 'stable'
}

export function NotificationCategories() {
  const { notifications, getFilteredNotifications, setFilter, filters } = useNotifications()
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    {
      id: 'credit',
      name: 'Credit',
      description: 'Credit score updates and reports',
      icon: CreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'training',
      name: 'Training',
      description: 'Lessons, quizzes, and courses',
      icon: GraduationCap,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 'milestone',
      name: 'Milestones',
      description: 'Achievements and accomplishments',
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      id: 'system',
      name: 'System',
      description: 'Maintenance and feature updates',
      icon: Settings,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    },
    {
      id: 'payment',
      name: 'Payments',
      description: 'Billing and transaction updates',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      id: 'alert',
      name: 'Alerts',
      description: 'Important notifications and warnings',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  ]

  // Calculate category statistics
  useEffect(() => {
    const stats: CategoryStats[] = categories.map(category => {
      const categoryNotifications = notifications.filter(n => n.category === category.id)
      const total = categoryNotifications.length
      const unread = categoryNotifications.filter(n => !n.read).length
      const read = categoryNotifications.filter(n => n.read).length
      const clicked = categoryNotifications.filter(n => n.analyticsId).length // Simplified
      
      const readRate = total > 0 ? read / total : 0
      const clickRate = total > 0 ? clicked / total : 0
      const engagementScore = (readRate * 0.6 + clickRate * 0.4) * 100

      // Simple trend calculation (mock)
      const trend: 'up' | 'down' | 'stable' = 
        engagementScore > 70 ? 'up' : 
        engagementScore < 30 ? 'down' : 'stable'

      return {
        category: category.id,
        total,
        unread,
        readRate,
        clickRate,
        engagementScore,
        trend
      }
    })

    setCategoryStats(stats)
  }, [notifications])

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setFilter('category', categoryId)
  }

  const getCategoryStats = (categoryId: string) => {
    return categoryStats.find(stat => stat.category === categoryId)
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />
      case 'down':
        return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
      default:
        return <div className="h-3 w-3 bg-gray-400 rounded-full" />
    }
  }

  const getEngagementColor = (score: number) => {
    if (score >= 70) return 'text-green-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Notification Categories</CardTitle>
          <Badge variant="outline" className="text-xs">
            {notifications.length} total
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={selectedCategory} onValueChange={handleCategorySelect} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-2 h-auto p-1">
            <TabsTrigger value="all" className="flex flex-col items-center space-y-1 p-3">
              <Bell className="h-4 w-4" />
              <span className="text-xs">All</span>
            </TabsTrigger>
            {categories.map(category => {
              const stats = getCategoryStats(category.id)
              const Icon = category.icon
              
              return (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="flex flex-col items-center space-y-1 p-3 relative"
                >
                  <div className="relative">
                    <Icon className="h-4 w-4" />
                    {stats && stats.unread > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {stats.unread}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs">{category.name}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(category => {
                  const stats = getCategoryStats(category.id)
                  const Icon = category.icon
                  
                  if (!stats || stats.total === 0) return null
                  
                  return (
                    <Card key={category.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className={`p-2 rounded-lg ${category.bgColor}`}>
                              <Icon className={`h-4 w-4 ${category.color}`} />
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">{category.name}</h4>
                              <p className="text-xs text-muted-foreground">{category.description}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCategorySelect(category.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Star className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span>Total: {stats.total}</span>
                            <span className="text-muted-foreground">Unread: {stats.unread}</span>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs">
                            <span>Read Rate: {Math.round(stats.readRate * 100)}%</span>
                            <span className="text-muted-foreground">Click Rate: {Math.round(stats.clickRate * 100)}%</span>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs">
                            <span className={getEngagementColor(stats.engagementScore)}>
                              Engagement: {Math.round(stats.engagementScore)}%
                            </span>
                            <div className="flex items-center space-x-1">
                              {getTrendIcon(stats.trend)}
                              <span className="text-muted-foreground capitalize">{stats.trend}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
              
              {notifications.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No notifications yet</p>
                  <p className="text-sm">We'll notify you when something important happens</p>
                </div>
              )}
            </div>
          </TabsContent>

          {categories.map(category => {
            const stats = getCategoryStats(category.id)
            const Icon = category.icon
            
            return (
              <TabsContent key={category.id} value={category.id} className="mt-4">
                <div className="space-y-4">
                  {/* Category Header */}
                  <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
                    <div className={`p-3 rounded-lg ${category.bgColor}`}>
                      <Icon className={`h-6 w-6 ${category.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                    {stats && (
                      <div className="ml-auto text-right">
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <div className="text-xs text-muted-foreground">notifications</div>
                      </div>
                    )}
                  </div>

                  {/* Category Stats */}
                  {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">{stats.unread}</div>
                          <div className="text-xs text-muted-foreground">Unread</div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {Math.round(stats.readRate * 100)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Read Rate</div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {Math.round(stats.clickRate * 100)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Click Rate</div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className={`text-2xl font-bold ${getEngagementColor(stats.engagementScore)}`}>
                            {Math.round(stats.engagementScore)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Engagement</div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Category Notifications */}
                  <div className="space-y-2">
                    {getFilteredNotifications()
                      .filter(n => n.category === category.id)
                      .map(notification => (
                        <Card key={notification.id} className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${category.bgColor}`}>
                              <Icon className={`h-4 w-4 ${category.color}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm">{notification.title}</h4>
                                <Badge 
                                  variant={notification.priority === 'high' ? 'destructive' : 'secondary'}
                                  className="text-xs"
                                >
                                  {notification.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-muted-foreground">
                                  {new Date(notification.timestamp).toLocaleDateString()}
                                </span>
                                {!notification.read && (
                                  <Badge variant="outline" className="text-xs">
                                    Unread
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                  </div>

                  {getFilteredNotifications().filter(n => n.category === category.id).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No {category.name.toLowerCase()} notifications</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
      </CardContent>
    </Card>
  )
}
