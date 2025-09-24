"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TrendingUp,
  Users,
  Eye,
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity,
  Download,
} from "lucide-react"

interface AnalyticsData {
  overview: {
    totalUsers: number
    activeUsers: number
    conversionRate: number
    completionRate: number
  }
  funnel: Array<{
    step: string
    name: string
    users: number
    conversionRate: number
    stepConversionRate: number
  }>
  events: Array<{
    event: string
    count: number
    trend: number
  }>
  timeRange: {
    startDate: string
    endDate: string
  }
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("7d")
  const [selectedMetric, setSelectedMetric] = useState("all")

  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange, selectedMetric])

  const loadAnalyticsData = async () => {
    setIsLoading(true)
    try {
      const endDate = new Date()
      const startDate = new Date()

      switch (timeRange) {
        case "1d":
          startDate.setDate(endDate.getDate() - 1)
          break
        case "7d":
          startDate.setDate(endDate.getDate() - 7)
          break
        case "30d":
          startDate.setDate(endDate.getDate() - 30)
          break
        case "90d":
          startDate.setDate(endDate.getDate() - 90)
          break
      }

      const response = await fetch(
        `/api/analytics/track?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
      )

      if (!response.ok) throw new Error("Failed to load analytics")

      const data = await response.json()

      // Mock enhanced data for demonstration
      const mockData: AnalyticsData = {
        overview: {
          totalUsers: 1247,
          activeUsers: 892,
          conversionRate: 23.5,
          completionRate: 67.8,
        },
        funnel: [
          { step: "page_view", name: "Page Views", users: 1247, conversionRate: 100, stepConversionRate: 100 },
          {
            step: "onboarding_start",
            name: "Started Onboarding",
            users: 856,
            conversionRate: 68.6,
            stepConversionRate: 68.6,
          },
          {
            step: "sponsor_verification_success",
            name: "Verified Sponsor",
            users: 634,
            conversionRate: 50.8,
            stepConversionRate: 74.1,
          },
          {
            step: "onboarding_complete",
            name: "Completed Onboarding",
            users: 423,
            conversionRate: 33.9,
            stepConversionRate: 66.7,
          },
          { step: "first_login", name: "First Login", users: 367, conversionRate: 29.4, stepConversionRate: 86.8 },
          {
            step: "first_referral",
            name: "First Referral",
            users: 293,
            conversionRate: 23.5,
            stepConversionRate: 79.8,
          },
        ],
        events: [
          { event: "page_view", count: 3421, trend: 12.3 },
          { event: "onboarding_start", count: 856, trend: 8.7 },
          { event: "sponsor_verification_success", count: 634, trend: -2.1 },
          { event: "onboarding_complete", count: 423, trend: 15.6 },
          { event: "quick_action_click", count: 1289, trend: 22.4 },
          { event: "first_login", count: 367, trend: 5.8 },
        ],
        timeRange: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      }

      setAnalyticsData(mockData)
    } catch (error) {
      console.error("Failed to load analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportData = async () => {
    try {
      const response = await fetch("/api/analytics/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeRange, metric: selectedMetric }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `analytics-${timeRange}-${Date.now()}.csv`
        a.click()
      }
    } catch (error) {
      console.error("Export failed:", error)
    }
  }

  if (isLoading || !analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">MLM Analytics Dashboard</h1>
            <p className="text-gray-600">Track conversion rates and optimize your onboarding funnel</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportData} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.overview.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+12.3% from last period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.overview.activeUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+8.7% from last period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.overview.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">+2.1% from last period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.overview.completionRate}%</div>
              <p className="text-xs text-muted-foreground">+5.4% from last period</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="funnel" className="space-y-6">
          <TabsList>
            <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
            <TabsTrigger value="events">Event Analytics</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
          </TabsList>

          <TabsContent value="funnel">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Conversion Funnel Analysis
                </CardTitle>
                <CardDescription>Track user progression through the onboarding process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {analyticsData.funnel.map((step, index) => (
                    <div key={step.step} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              step.stepConversionRate >= 70
                                ? "bg-green-100 text-green-700"
                                : step.stepConversionRate >= 50
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-medium">{step.name}</h3>
                            <p className="text-sm text-gray-600">{step.users.toLocaleString()} users</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{step.conversionRate}%</div>
                          <div
                            className={`text-sm ${
                              step.stepConversionRate >= 70
                                ? "text-green-600"
                                : step.stepConversionRate >= 50
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }`}
                          >
                            {step.stepConversionRate}% step conversion
                          </div>
                        </div>
                      </div>
                      <Progress value={step.conversionRate} className="h-2" />
                      {index < analyticsData.funnel.length - 1 && <div className="ml-4 h-4 w-px bg-gray-200"></div>}
                    </div>
                  ))}
                </div>

                {/* Optimization Suggestions */}
                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Optimization Opportunities</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Sponsor verification has a 74.1% conversion rate - consider simplifying the process</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>First login conversion is strong at 86.8% - good onboarding completion flow</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Event Analytics
                </CardTitle>
                <CardDescription>Detailed breakdown of user interactions and behaviors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analyticsData.events.map((event) => (
                    <div key={event.event} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium capitalize">{event.event.replace(/_/g, " ")}</h3>
                        <Badge variant={event.trend > 0 ? "default" : "destructive"}>
                          {event.trend > 0 ? "+" : ""}
                          {event.trend}%
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{event.count.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Total occurrences</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="optimization">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    A/B Test Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">Welcome Message Test</h3>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Variant A</div>
                          <div className="font-medium">23.5% conversion</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Variant B</div>
                          <div className="font-medium">26.8% conversion</div>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-green-600">Variant B performing 14% better</div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">Sponsor Verification Flow</h3>
                        <Badge variant="outline">Completed</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Original</div>
                          <div className="font-medium">68.2% completion</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Simplified</div>
                          <div className="font-medium">74.1% completion</div>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-green-600">Simplified flow increased completion by 8.6%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <h3 className="font-medium text-green-900">High Impact</h3>
                      </div>
                      <p className="text-sm text-green-800 mb-2">
                        Implement progressive disclosure in sponsor verification
                      </p>
                      <div className="text-xs text-green-700">Expected improvement: +12% conversion rate</div>
                    </div>

                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <h3 className="font-medium text-yellow-900">Medium Impact</h3>
                      </div>
                      <p className="text-sm text-yellow-800 mb-2">Add progress indicators to onboarding steps</p>
                      <div className="text-xs text-yellow-700">Expected improvement: +6% completion rate</div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="h-5 w-5 text-blue-600" />
                        <h3 className="font-medium text-blue-900">Monitor</h3>
                      </div>
                      <p className="text-sm text-blue-800 mb-2">Track mobile vs desktop completion rates</p>
                      <div className="text-xs text-blue-700">Current mobile rate: 18% lower than desktop</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
