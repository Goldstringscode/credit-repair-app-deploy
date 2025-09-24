"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowRight,
  Users,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Activity,
  Download,
  Eye,
  MousePointer,
  UserCheck,
  CreditCard,
  Star,
  MessageSquare,
} from "lucide-react"

interface JourneyStep {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  users: number
  conversionRate: number
  avgTimeSpent: number
  dropoffRate: number
  nextSteps: string[]
  revenue: number
}

interface UserJourney {
  id: string
  name: string
  description: string
  totalUsers: number
  completionRate: number
  avgDuration: number
  revenue: number
  steps: JourneyStep[]
}

interface JourneyAnalytics {
  journeys: UserJourney[]
  summary: {
    totalJourneys: number
    avgCompletionRate: number
    totalRevenue: number
    topPerformingJourney: string
  }
  pathAnalysis: {
    mostCommonPath: string[]
    shortestSuccessfulPath: string[]
    longestPath: string[]
    dropoffPoints: string[]
  }
}

export default function UserJourneysPage() {
  const [journeyData, setJourneyData] = useState<JourneyAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedJourney, setSelectedJourney] = useState<string>("all")
  const [timeRange, setTimeRange] = useState("30d")
  const [viewMode, setViewMode] = useState<"overview" | "detailed">("overview")

  useEffect(() => {
    loadJourneyData()
  }, [selectedJourney, timeRange])

  const loadJourneyData = async () => {
    setIsLoading(true)
    try {
      // Mock data for demonstration
      const mockData: JourneyAnalytics = {
        journeys: [
          {
            id: "onboarding",
            name: "User Onboarding",
            description: "Complete user registration and setup process",
            totalUsers: 1247,
            completionRate: 68.5,
            avgDuration: 12.5,
            revenue: 0,
            steps: [
              {
                id: "landing",
                name: "Landing Page",
                description: "User visits the main landing page",
                icon: <Eye className="h-4 w-4" />,
                users: 1247,
                conversionRate: 100,
                avgTimeSpent: 2.3,
                dropoffRate: 0,
                nextSteps: ["signup"],
                revenue: 0,
              },
              {
                id: "signup",
                name: "Account Creation",
                description: "User creates an account",
                icon: <UserCheck className="h-4 w-4" />,
                users: 856,
                conversionRate: 68.6,
                avgTimeSpent: 3.8,
                dropoffRate: 31.4,
                nextSteps: ["verification"],
                revenue: 0,
              },
              {
                id: "verification",
                name: "Email Verification",
                description: "User verifies their email address",
                icon: <CheckCircle className="h-4 w-4" />,
                users: 734,
                conversionRate: 85.8,
                avgTimeSpent: 1.2,
                dropoffRate: 14.2,
                nextSteps: ["profile"],
                revenue: 0,
              },
              {
                id: "profile",
                name: "Profile Setup",
                description: "User completes their profile",
                icon: <Users className="h-4 w-4" />,
                users: 623,
                conversionRate: 84.9,
                avgTimeSpent: 4.7,
                dropoffRate: 15.1,
                nextSteps: ["mlm_intro"],
                revenue: 0,
              },
              {
                id: "mlm_intro",
                name: "MLM Introduction",
                description: "User learns about MLM opportunities",
                icon: <Target className="h-4 w-4" />,
                users: 534,
                conversionRate: 85.7,
                avgTimeSpent: 6.2,
                dropoffRate: 14.3,
                nextSteps: ["sponsor_connect"],
                revenue: 0,
              },
              {
                id: "sponsor_connect",
                name: "Sponsor Connection",
                description: "User connects with a sponsor",
                icon: <MessageSquare className="h-4 w-4" />,
                users: 423,
                conversionRate: 79.2,
                avgTimeSpent: 8.5,
                dropoffRate: 20.8,
                nextSteps: ["complete"],
                revenue: 0,
              },
              {
                id: "complete",
                name: "Onboarding Complete",
                description: "User completes onboarding process",
                icon: <Star className="h-4 w-4" />,
                users: 367,
                conversionRate: 86.8,
                avgTimeSpent: 2.1,
                dropoffRate: 13.2,
                nextSteps: [],
                revenue: 0,
              },
            ],
          },
          {
            id: "subscription",
            name: "Subscription Journey",
            description: "User upgrades to paid subscription",
            totalUsers: 367,
            completionRate: 42.8,
            avgDuration: 8.3,
            revenue: 78450,
            steps: [
              {
                id: "trial_start",
                name: "Trial Start",
                description: "User starts free trial",
                icon: <Activity className="h-4 w-4" />,
                users: 367,
                conversionRate: 100,
                avgTimeSpent: 1.5,
                dropoffRate: 0,
                nextSteps: ["feature_exploration"],
                revenue: 0,
              },
              {
                id: "feature_exploration",
                name: "Feature Exploration",
                description: "User explores platform features",
                icon: <MousePointer className="h-4 w-4" />,
                users: 298,
                conversionRate: 81.2,
                avgTimeSpent: 15.7,
                dropoffRate: 18.8,
                nextSteps: ["value_realization"],
                revenue: 0,
              },
              {
                id: "value_realization",
                name: "Value Realization",
                description: "User sees value in the platform",
                icon: <TrendingUp className="h-4 w-4" />,
                users: 234,
                conversionRate: 78.5,
                avgTimeSpent: 12.3,
                dropoffRate: 21.5,
                nextSteps: ["pricing_view"],
                revenue: 0,
              },
              {
                id: "pricing_view",
                name: "Pricing Page",
                description: "User views pricing options",
                icon: <DollarSign className="h-4 w-4" />,
                users: 189,
                conversionRate: 80.8,
                avgTimeSpent: 4.2,
                dropoffRate: 19.2,
                nextSteps: ["payment"],
                revenue: 0,
              },
              {
                id: "payment",
                name: "Payment Process",
                description: "User enters payment information",
                icon: <CreditCard className="h-4 w-4" />,
                users: 157,
                conversionRate: 83.1,
                avgTimeSpent: 3.8,
                dropoffRate: 16.9,
                nextSteps: ["subscription_active"],
                revenue: 78450,
              },
              {
                id: "subscription_active",
                name: "Active Subscription",
                description: "User has active paid subscription",
                icon: <CheckCircle className="h-4 w-4" />,
                users: 157,
                conversionRate: 100,
                avgTimeSpent: 0,
                dropoffRate: 0,
                nextSteps: [],
                revenue: 78450,
              },
            ],
          },
          {
            id: "mlm_activation",
            name: "MLM Activation",
            description: "User becomes active in MLM program",
            totalUsers: 157,
            completionRate: 73.2,
            avgDuration: 21.7,
            revenue: 45230,
            steps: [
              {
                id: "mlm_training",
                name: "MLM Training",
                description: "User completes MLM training",
                icon: <Target className="h-4 w-4" />,
                users: 157,
                conversionRate: 100,
                avgTimeSpent: 45.2,
                dropoffRate: 0,
                nextSteps: ["first_referral"],
                revenue: 0,
              },
              {
                id: "first_referral",
                name: "First Referral",
                description: "User makes their first referral",
                icon: <Users className="h-4 w-4" />,
                users: 134,
                conversionRate: 85.4,
                avgTimeSpent: 120.5,
                dropoffRate: 14.6,
                nextSteps: ["team_building"],
                revenue: 6700,
              },
              {
                id: "team_building",
                name: "Team Building",
                description: "User builds their team",
                icon: <TrendingUp className="h-4 w-4" />,
                users: 123,
                conversionRate: 91.8,
                avgTimeSpent: 180.3,
                dropoffRate: 8.2,
                nextSteps: ["rank_advancement"],
                revenue: 18450,
              },
              {
                id: "rank_advancement",
                name: "Rank Advancement",
                description: "User advances to higher rank",
                icon: <Star className="h-4 w-4" />,
                users: 115,
                conversionRate: 93.5,
                avgTimeSpent: 240.7,
                dropoffRate: 6.5,
                nextSteps: ["mlm_success"],
                revenue: 34560,
              },
              {
                id: "mlm_success",
                name: "MLM Success",
                description: "User achieves MLM success",
                icon: <CheckCircle className="h-4 w-4" />,
                users: 115,
                conversionRate: 100,
                avgTimeSpent: 0,
                dropoffRate: 0,
                nextSteps: [],
                revenue: 45230,
              },
            ],
          },
        ],
        summary: {
          totalJourneys: 3,
          avgCompletionRate: 61.5,
          totalRevenue: 123680,
          topPerformingJourney: "MLM Activation",
        },
        pathAnalysis: {
          mostCommonPath: ["landing", "signup", "verification", "profile", "trial_start"],
          shortestSuccessfulPath: ["landing", "signup", "payment"],
          longestPath: [
            "landing",
            "signup",
            "verification",
            "profile",
            "mlm_intro",
            "sponsor_connect",
            "complete",
            "trial_start",
            "feature_exploration",
            "value_realization",
            "pricing_view",
            "payment",
            "mlm_training",
            "first_referral",
            "team_building",
            "rank_advancement",
          ],
          dropoffPoints: ["signup", "sponsor_connect", "feature_exploration", "first_referral"],
        },
      }

      setJourneyData(mockData)
    } catch (error) {
      console.error("Failed to load journey data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportJourneyData = async () => {
    try {
      const response = await fetch("/api/analytics/export-journeys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ journey: selectedJourney, timeRange }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `user-journeys-${Date.now()}.csv`
        a.click()
      }
    } catch (error) {
      console.error("Export failed:", error)
    }
  }

  if (isLoading || !journeyData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user journey data...</p>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`
  const formatPercent = (percent: number) => `${percent.toFixed(1)}%`
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes.toFixed(1)}m`
    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    return `${hours}h ${mins}m`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Journey Analytics</h1>
            <p className="text-gray-600">Visualize complete user lifecycle paths and optimize conversion funnels</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Select value={selectedJourney} onValueChange={setSelectedJourney}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Journeys</SelectItem>
                <SelectItem value="onboarding">Onboarding</SelectItem>
                <SelectItem value="subscription">Subscription</SelectItem>
                <SelectItem value="mlm_activation">MLM Activation</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportJourneyData} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Journeys</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{journeyData.summary.totalJourneys}</div>
              <p className="text-xs text-muted-foreground">Active user journeys</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercent(journeyData.summary.avgCompletionRate)}</div>
              <p className="text-xs text-green-600">+5.2% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(journeyData.summary.totalRevenue)}</div>
              <p className="text-xs text-green-600">+12.8% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Journey</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">MLM</div>
              <p className="text-xs text-muted-foreground">Highest completion rate</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="journeys" className="space-y-6">
          <TabsList>
            <TabsTrigger value="journeys">Journey Maps</TabsTrigger>
            <TabsTrigger value="paths">Path Analysis</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
          </TabsList>

          <TabsContent value="journeys">
            <div className="space-y-6">
              {journeyData.journeys.map((journey) => (
                <Card key={journey.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="h-5 w-5" />
                          {journey.name}
                        </CardTitle>
                        <CardDescription>{journey.description}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{formatPercent(journey.completionRate)}</div>
                        <div className="text-sm text-gray-600">Completion Rate</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Journey Stats */}
                    <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-semibold">{journey.totalUsers.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Total Users</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{formatTime(journey.avgDuration)}</div>
                        <div className="text-sm text-gray-600">Avg Duration</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{formatCurrency(journey.revenue)}</div>
                        <div className="text-sm text-gray-600">Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{journey.steps.length}</div>
                        <div className="text-sm text-gray-600">Steps</div>
                      </div>
                    </div>

                    {/* Journey Flow */}
                    <div className="space-y-4">
                      {journey.steps.map((step, index) => (
                        <div key={step.id} className="relative">
                          <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                {step.icon}
                              </div>
                            </div>

                            <div className="flex-grow">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-medium">{step.name}</h3>
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="text-gray-600">{step.users.toLocaleString()} users</span>
                                  <Badge
                                    variant={
                                      step.conversionRate >= 80
                                        ? "default"
                                        : step.conversionRate >= 60
                                          ? "secondary"
                                          : "destructive"
                                    }
                                  >
                                    {formatPercent(step.conversionRate)}
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{step.description}</p>

                              <div className="grid grid-cols-4 gap-4 text-xs">
                                <div>
                                  <span className="text-gray-500">Time Spent:</span>
                                  <span className="ml-1 font-medium">{formatTime(step.avgTimeSpent)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Drop-off:</span>
                                  <span className="ml-1 font-medium text-red-600">
                                    {formatPercent(step.dropoffRate)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Revenue:</span>
                                  <span className="ml-1 font-medium">{formatCurrency(step.revenue)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Next Steps:</span>
                                  <span className="ml-1 font-medium">{step.nextSteps.length}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Arrow to next step */}
                          {index < journey.steps.length - 1 && (
                            <div className="flex justify-center py-2">
                              <ArrowRight className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="paths">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Path Analysis
                  </CardTitle>
                  <CardDescription>Common user paths through the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h3 className="font-medium text-green-900 mb-2">Most Common Path</h3>
                      <div className="flex flex-wrap gap-2">
                        {journeyData.pathAnalysis.mostCommonPath.map((step, index) => (
                          <div key={index} className="flex items-center">
                            <Badge variant="outline" className="text-green-700 border-green-300">
                              {step.replace(/_/g, " ")}
                            </Badge>
                            {index < journeyData.pathAnalysis.mostCommonPath.length - 1 && (
                              <ArrowRight className="h-3 w-3 mx-1 text-green-600" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="font-medium text-blue-900 mb-2">Shortest Successful Path</h3>
                      <div className="flex flex-wrap gap-2">
                        {journeyData.pathAnalysis.shortestSuccessfulPath.map((step, index) => (
                          <div key={index} className="flex items-center">
                            <Badge variant="outline" className="text-blue-700 border-blue-300">
                              {step.replace(/_/g, " ")}
                            </Badge>
                            {index < journeyData.pathAnalysis.shortestSuccessfulPath.length - 1 && (
                              <ArrowRight className="h-3 w-3 mx-1 text-blue-600" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Drop-off Analysis
                  </CardTitle>
                  <CardDescription>Points where users commonly exit</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {journeyData.pathAnalysis.dropoffPoints.map((point, index) => (
                      <div key={point} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-red-700">{index + 1}</span>
                          </div>
                          <div>
                            <h3 className="font-medium capitalize">{point.replace(/_/g, " ")}</h3>
                            <p className="text-sm text-gray-600">High drop-off point</p>
                          </div>
                        </div>
                        <Badge variant="destructive">Critical</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="optimization">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Optimization Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <h3 className="font-medium text-green-900">High Impact</h3>
                      </div>
                      <p className="text-sm text-green-800 mb-2">Optimize signup flow to reduce 31.4% drop-off rate</p>
                      <div className="text-xs text-green-700">Expected improvement: +15-20% conversion</div>
                    </div>

                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <h3 className="font-medium text-yellow-900">Medium Impact</h3>
                      </div>
                      <p className="text-sm text-yellow-800 mb-2">
                        Improve sponsor connection process (20.8% drop-off)
                      </p>
                      <div className="text-xs text-yellow-700">Expected improvement: +8-12% conversion</div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="h-5 w-5 text-blue-600" />
                        <h3 className="font-medium text-blue-900">Monitor</h3>
                      </div>
                      <p className="text-sm text-blue-800 mb-2">Track feature exploration engagement patterns</p>
                      <div className="text-xs text-blue-700">Current avg time: 15.7 minutes</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Success Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h3 className="font-medium">MLM Activation Rate</h3>
                        <p className="text-sm text-gray-600">Users who become MLM active</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-600">73.2%</div>
                        <div className="text-xs text-green-600">+8.5% vs target</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Revenue per User</h3>
                        <p className="text-sm text-gray-600">Average revenue generated</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-blue-600">$288</div>
                        <div className="text-xs text-blue-600">+12.3% vs target</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Time to First Referral</h3>
                        <p className="text-sm text-gray-600">Average time to first MLM referral</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-purple-600">21.7 days</div>
                        <div className="text-xs text-purple-600">-3.2 days vs target</div>
                      </div>
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
