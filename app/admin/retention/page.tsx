"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity,
  Download,
  ArrowUp,
  ArrowDown,
} from "lucide-react"

interface RetentionData {
  cohorts: Array<{
    cohortMonth: string
    cohortSize: number
    periods: Array<{
      period: number
      activeUsers: number
      retentionRate: number
      revenue: number
      avgRevenue: number
      churnedUsers: number
      newRevenue: number
    }>
    ltv: {
      current: number
      predicted: number
      confidence: number
    }
    segments: {
      highValue: number
      mediumValue: number
      lowValue: number
      atRisk: number
    }
  }>
  ltvAnalysis: {
    averageLTV: number
    ltvByTier: {
      basic: number
      premium: number
      enterprise: number
    }
    churnImpact: number
    potentialLTV: number
    mlmBonus: number
  }
  segmentAnalysis: {
    byTier: {
      basic: number
      premium: number
      enterprise: number
    }
    byStatus: {
      active: number
      churned: number
      paused: number
    }
    byReferrals: {
      none: number
      low: number
      medium: number
      high: number
    }
  }
  summary: {
    totalUsers: number
    activeUsers: number
    avgLTV: number
    retentionRate: number
    churnRate: number
  }
}

export default function RetentionPage() {
  const [retentionData, setRetentionData] = useState<RetentionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCohort, setSelectedCohort] = useState<string>("all")
  const [viewType, setViewType] = useState<"table" | "chart">("table")

  useEffect(() => {
    loadRetentionData()
  }, [selectedCohort])

  const loadRetentionData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/analytics/cohorts?cohortMonth=${selectedCohort}&period=12`)

      if (!response.ok) throw new Error("Failed to load retention data")

      const result = await response.json()
      setRetentionData(result.data)
    } catch (error) {
      console.error("Failed to load retention data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportRetentionData = async () => {
    try {
      const response = await fetch("/api/analytics/export-retention", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cohort: selectedCohort, type: "retention" }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `retention-analysis-${Date.now()}.csv`
        a.click()
      }
    } catch (error) {
      console.error("Export failed:", error)
    }
  }

  if (isLoading || !retentionData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading retention analysis...</p>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`
  const formatPercent = (percent: number) => `${percent.toFixed(1)}%`

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Retention & LTV Analysis</h1>
            <p className="text-gray-600">Track user retention patterns and lifetime value metrics</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Select value={selectedCohort} onValueChange={setSelectedCohort}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cohorts</SelectItem>
                <SelectItem value="2024-07">July 2024</SelectItem>
                <SelectItem value="2024-06">June 2024</SelectItem>
                <SelectItem value="2024-05">May 2024</SelectItem>
                <SelectItem value="2024-04">April 2024</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportRetentionData} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{retentionData.summary.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across all cohorts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercent(retentionData.summary.retentionRate)}</div>
              <p className="text-xs text-green-600 flex items-center">
                <ArrowUp className="h-3 w-3 mr-1" />
                +2.3% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average LTV</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(retentionData.ltvAnalysis.averageLTV)}</div>
              <p className="text-xs text-green-600 flex items-center">
                <ArrowUp className="h-3 w-3 mr-1" />
                +8.7% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercent(retentionData.summary.churnRate)}</div>
              <p className="text-xs text-red-600 flex items-center">
                <ArrowDown className="h-3 w-3 mr-1" />
                -1.2% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">MLM Bonus</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(retentionData.ltvAnalysis.mlmBonus)}</div>
              <p className="text-xs text-muted-foreground">Avg per user</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="cohorts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="cohorts">Cohort Analysis</TabsTrigger>
            <TabsTrigger value="ltv">Lifetime Value</TabsTrigger>
            <TabsTrigger value="segments">User Segments</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
          </TabsList>

          <TabsContent value="cohorts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Cohort Retention Analysis
                </CardTitle>
                <CardDescription>Track how user cohorts perform over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {retentionData.cohorts.slice(0, 6).map((cohort) => (
                    <div key={cohort.cohortMonth} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {new Date(cohort.cohortMonth + "-01").toLocaleDateString("en-US", {
                              month: "long",
                              year: "numeric",
                            })}
                          </h3>
                          <p className="text-sm text-gray-600">{cohort.cohortSize} users</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold">{formatCurrency(cohort.ltv.current)}</div>
                          <div className="text-sm text-gray-600">Current LTV</div>
                        </div>
                      </div>

                      {/* Retention Timeline */}
                      <div className="grid grid-cols-6 md:grid-cols-12 gap-2 mb-4">
                        {cohort.periods.slice(0, 12).map((period) => (
                          <div key={period.period} className="text-center">
                            <div className="text-xs text-gray-500 mb-1">M{period.period}</div>
                            <div
                              className={`h-8 rounded flex items-center justify-center text-xs font-medium ${
                                period.retentionRate >= 80
                                  ? "bg-green-100 text-green-800"
                                  : period.retentionRate >= 60
                                    ? "bg-yellow-100 text-yellow-800"
                                    : period.retentionRate >= 40
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-red-100 text-red-800"
                              }`}
                            >
                              {formatPercent(period.retentionRate)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* User Segments */}
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">{cohort.segments.highValue}</div>
                          <div className="text-xs text-gray-600">High Value</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600">{cohort.segments.mediumValue}</div>
                          <div className="text-xs text-gray-600">Medium Value</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-600">{cohort.segments.lowValue}</div>
                          <div className="text-xs text-gray-600">Low Value</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-red-600">{cohort.segments.atRisk}</div>
                          <div className="text-xs text-gray-600">At Risk</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ltv">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    LTV by Subscription Tier
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Enterprise</h3>
                        <p className="text-sm text-gray-600">Premium tier users</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">
                          {formatCurrency(retentionData.ltvAnalysis.ltvByTier.enterprise)}
                        </div>
                        <div className="text-sm text-gray-600">Average LTV</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Premium</h3>
                        <p className="text-sm text-gray-600">Mid-tier users</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-blue-600">
                          {formatCurrency(retentionData.ltvAnalysis.ltvByTier.premium)}
                        </div>
                        <div className="text-sm text-gray-600">Average LTV</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Basic</h3>
                        <p className="text-sm text-gray-600">Entry-level users</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-600">
                          {formatCurrency(retentionData.ltvAnalysis.ltvByTier.basic)}
                        </div>
                        <div className="text-sm text-gray-600">Average LTV</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    LTV Optimization Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <h3 className="font-medium text-green-900">Potential LTV</h3>
                      </div>
                      <div className="text-2xl font-bold text-green-800 mb-1">
                        {formatCurrency(retentionData.ltvAnalysis.potentialLTV)}
                      </div>
                      <p className="text-sm text-green-700">
                        +{formatCurrency(retentionData.ltvAnalysis.potentialLTV - retentionData.ltvAnalysis.averageLTV)}{" "}
                        improvement possible
                      </p>
                    </div>

                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <h3 className="font-medium text-red-900">Churn Impact</h3>
                      </div>
                      <div className="text-2xl font-bold text-red-800 mb-1">
                        {formatCurrency(retentionData.ltvAnalysis.churnImpact)}
                      </div>
                      <p className="text-sm text-red-700">Revenue lost to churn</p>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-5 w-5 text-blue-600" />
                        <h3 className="font-medium text-blue-900">MLM Bonus Impact</h3>
                      </div>
                      <div className="text-2xl font-bold text-blue-800 mb-1">
                        {formatCurrency(retentionData.ltvAnalysis.mlmBonus)}
                      </div>
                      <p className="text-sm text-blue-700">Average MLM earnings per user</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="segments">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    By Subscription Tier
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Enterprise</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${
                                (retentionData.segmentAnalysis.byTier.enterprise / retentionData.summary.totalUsers) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{retentionData.segmentAnalysis.byTier.enterprise}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Premium</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${
                                (retentionData.segmentAnalysis.byTier.premium / retentionData.summary.totalUsers) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{retentionData.segmentAnalysis.byTier.premium}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Basic</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gray-600 h-2 rounded-full"
                            style={{
                              width: `${
                                (retentionData.segmentAnalysis.byTier.basic / retentionData.summary.totalUsers) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{retentionData.segmentAnalysis.byTier.basic}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    By Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${
                                (retentionData.segmentAnalysis.byStatus.active / retentionData.summary.totalUsers) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{retentionData.segmentAnalysis.byStatus.active}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Churned</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-600 h-2 rounded-full"
                            style={{
                              width: `${
                                (retentionData.segmentAnalysis.byStatus.churned / retentionData.summary.totalUsers) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{retentionData.segmentAnalysis.byStatus.churned}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Paused</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-600 h-2 rounded-full"
                            style={{
                              width: `${
                                (retentionData.segmentAnalysis.byStatus.paused / retentionData.summary.totalUsers) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{retentionData.segmentAnalysis.byStatus.paused}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    By Referral Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">High (10+)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{
                              width: `${
                                (retentionData.segmentAnalysis.byReferrals.high / retentionData.summary.totalUsers) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{retentionData.segmentAnalysis.byReferrals.high}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Medium (4-10)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${
                                (retentionData.segmentAnalysis.byReferrals.medium / retentionData.summary.totalUsers) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{retentionData.segmentAnalysis.byReferrals.medium}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Low (1-3)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${
                                (retentionData.segmentAnalysis.byReferrals.low / retentionData.summary.totalUsers) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{retentionData.segmentAnalysis.byReferrals.low}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">None (0)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gray-600 h-2 rounded-full"
                            style={{
                              width: `${
                                (retentionData.segmentAnalysis.byReferrals.none / retentionData.summary.totalUsers) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{retentionData.segmentAnalysis.byReferrals.none}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="predictions">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    LTV Predictions
                  </CardTitle>
                  <CardDescription>Predicted lifetime value for recent cohorts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {retentionData.cohorts.slice(0, 4).map((cohort) => (
                      <div key={cohort.cohortMonth} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">
                            {new Date(cohort.cohortMonth + "-01").toLocaleDateString("en-US", {
                              month: "short",
                              year: "numeric",
                            })}
                          </h3>
                          <p className="text-sm text-gray-600">{cohort.cohortSize} users</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold">{formatCurrency(cohort.ltv.predicted)}</div>
                          <div className="text-sm text-gray-600">
                            {cohort.ltv.confidence}% confidence
                            <Badge variant={cohort.ltv.confidence >= 80 ? "default" : "secondary"} className="ml-2">
                              {cohort.ltv.confidence >= 80 ? "High" : cohort.ltv.confidence >= 60 ? "Medium" : "Low"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Retention Improvement Strategies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <h3 className="font-medium text-green-900">High Impact</h3>
                      </div>
                      <p className="text-sm text-green-800 mb-2">Implement personalized onboarding for new users</p>
                      <div className="text-xs text-green-700">Expected LTV increase: +15-25%</div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-5 w-5 text-blue-600" />
                        <h3 className="font-medium text-blue-900">Medium Impact</h3>
                      </div>
                      <p className="text-sm text-blue-800 mb-2">Launch re-engagement campaigns for at-risk users</p>
                      <div className="text-xs text-blue-700">Expected churn reduction: -8-12%</div>
                    </div>

                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <h3 className="font-medium text-yellow-900">Monitor</h3>
                      </div>
                      <p className="text-sm text-yellow-800 mb-2">Track MLM performance impact on retention</p>
                      <div className="text-xs text-yellow-700">MLM users show 23% higher retention</div>
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
