"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Clock, 
  Users,
  Bell,
  Target,
  Activity,
  Zap
} from "lucide-react"

interface NotificationMetrics {
  totalSent: number
  totalRead: number
  totalClicked: number
  totalDismissed: number
  totalExpired: number
  readRate: number
  clickRate: number
  dismissRate: number
  averageReadTime: number
  categoryMetrics: {
    [category: string]: {
      sent: number
      read: number
      clicked: number
      readRate: number
      clickRate: number
    }
  }
}

interface UserEngagementProfile {
  userId: string
  totalNotifications: number
  readRate: number
  clickRate: number
  averageReadTime: number
  preferredCategories: string[]
  preferredTypes: string[]
  preferredTimes: number[]
  engagementScore: number
  lastActiveAt: string
  notificationFrequency: 'low' | 'medium' | 'high'
  optOutCategories: string[]
  optOutTypes: string[]
}

interface NotificationInsights {
  topPerformingCategories: Array<{
    category: string
    engagement: number
    volume: number
  }>
  optimalSendTimes: number[]
  userEngagementTrends: Array<{
    date: string
    engagement: number
    volume: number
  }>
  recommendations: string[]
  riskFactors: string[]
}

export default function NotificationAnalyticsPage() {
  const [metrics, setMetrics] = useState<NotificationMetrics | null>(null)
  const [profile, setProfile] = useState<UserEngagementProfile | null>(null)
  const [insights, setInsights] = useState<NotificationInsights | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setIsLoading(true)
      
      // Load metrics
      const metricsResponse = await fetch('/api/notifications/analytics?type=metrics')
      const metricsData = await metricsResponse.json()
      if (metricsData.success) {
        setMetrics(metricsData.data)
      }

      // Load profile
      const profileResponse = await fetch('/api/notifications/analytics?type=profile')
      const profileData = await profileResponse.json()
      if (profileData.success) {
        setProfile(profileData.data)
      }

      // Load insights
      const insightsResponse = await fetch('/api/notifications/analytics?type=insights')
      const insightsData = await insightsResponse.json()
      if (insightsData.success) {
        setInsights(insightsData.data)
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getEngagementBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading notification analytics...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">Notification Analytics</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Track engagement, performance, and user behavior for your notification system
            </p>
          </div>

          {/* Key Metrics */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{metrics.totalSent}</p>
                      <p className="text-sm text-gray-600">Total Sent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">{metrics.readRate.toFixed(1)}%</p>
                      <p className="text-sm text-gray-600">Read Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <MousePointer className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">{metrics.clickRate.toFixed(1)}%</p>
                      <p className="text-sm text-gray-600">Click Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold">{metrics.averageReadTime.toFixed(1)}s</p>
                      <p className="text-sm text-gray-600">Avg Read Time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="engagement">User Engagement</TabsTrigger>
              <TabsTrigger value="insights">Insights & Recommendations</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {metrics && (
                <>
                  {/* Performance Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5" />
                        <span>Performance Metrics</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Read Rate</span>
                            <span className="text-sm text-gray-600">{metrics.readRate.toFixed(1)}%</span>
                          </div>
                          <Progress value={metrics.readRate} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Click Rate</span>
                            <span className="text-sm text-gray-600">{metrics.clickRate.toFixed(1)}%</span>
                          </div>
                          <Progress value={metrics.clickRate} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Dismiss Rate</span>
                            <span className="text-sm text-gray-600">{metrics.dismissRate.toFixed(1)}%</span>
                          </div>
                          <Progress value={metrics.dismissRate} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Category Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Target className="h-5 w-5" />
                        <span>Category Performance</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(metrics.categoryMetrics).map(([category, data]) => (
                          <div key={category} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium capitalize">{category}</h4>
                              <Badge variant="outline">{data.sent} sent</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm text-gray-600">Read Rate</span>
                                  <span className="text-sm font-medium">{data.readRate.toFixed(1)}%</span>
                                </div>
                                <Progress value={data.readRate} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm text-gray-600">Click Rate</span>
                                  <span className="text-sm font-medium">{data.clickRate.toFixed(1)}%</span>
                                </div>
                                <Progress value={data.clickRate} className="h-2" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* User Engagement Tab */}
            <TabsContent value="engagement" className="space-y-6">
              {profile && (
                <>
                  {/* Engagement Score */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Activity className="h-5 w-5" />
                        <span>User Engagement Profile</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className={`p-4 rounded-lg ${getEngagementBgColor(profile.engagementScore)}`}>
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium">Engagement Score</span>
                              <span className={`text-2xl font-bold ${getEngagementColor(profile.engagementScore)}`}>
                                {profile.engagementScore}
                              </span>
                            </div>
                            <Progress value={profile.engagementScore} className="h-2" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Total Notifications</p>
                              <p className="text-xl font-bold">{profile.totalNotifications}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Read Rate</p>
                              <p className="text-xl font-bold">{profile.readRate.toFixed(1)}%</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Click Rate</p>
                              <p className="text-xl font-bold">{profile.clickRate.toFixed(1)}%</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Avg Read Time</p>
                              <p className="text-xl font-bold">{profile.averageReadTime.toFixed(1)}s</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Preferred Categories</h4>
                            <div className="flex flex-wrap gap-2">
                              {profile.preferredCategories.map((category) => (
                                <Badge key={category} variant="outline">
                                  {category}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Preferred Types</h4>
                            <div className="flex flex-wrap gap-2">
                              {profile.preferredTypes.map((type) => (
                                <Badge key={type} variant="outline">
                                  {type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Notification Frequency</h4>
                            <Badge className={profile.notificationFrequency === 'high' ? 'bg-green-100 text-green-800' : 
                                           profile.notificationFrequency === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                           'bg-red-100 text-red-800'}>
                              {profile.notificationFrequency}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              {insights && (
                <>
                  {/* Recommendations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Zap className="h-5 w-5" />
                        <span>Recommendations</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {insights.recommendations.map((recommendation, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-sm">{recommendation}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Performing Categories */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5" />
                        <span>Top Performing Categories</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {insights.topPerformingCategories.map((category, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                              </div>
                              <div>
                                <h4 className="font-medium capitalize">{category.category}</h4>
                                <p className="text-sm text-gray-600">{category.volume} notifications</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold">{category.engagement.toFixed(1)}%</p>
                              <p className="text-sm text-gray-600">engagement</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Risk Factors */}
                  {insights.riskFactors.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-red-600">
                          <Activity className="h-5 w-5" />
                          <span>Risk Factors</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {insights.riskFactors.map((risk, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                              <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-sm">{risk}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

