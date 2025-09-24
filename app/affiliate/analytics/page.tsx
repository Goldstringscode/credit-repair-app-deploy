"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  TrendingUp,
  DollarSign,
  MousePointer,
  Target,
  BarChart3,
  PieChartIcon,
  Download,
  RefreshCw,
} from "lucide-react"
import { ConversionFunnel } from "@/components/analytics/conversion-funnel"
import { AttributionAnalysis } from "@/components/analytics/attribution-analysis"
import { CohortAnalysis } from "@/components/analytics/cohort-analysis"

export default function AffiliateAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("30")
  const [loading, setLoading] = useState(false)

  const affiliateId = "aff_123" // In real app, get from auth context

  // Mock performance data
  const performanceData = [
    { date: "2024-01-01", clicks: 45, conversions: 2, revenue: 150 },
    { date: "2024-01-02", clicks: 52, conversions: 1, revenue: 75 },
    { date: "2024-01-03", clicks: 38, conversions: 3, revenue: 225 },
    { date: "2024-01-04", clicks: 61, conversions: 2, revenue: 150 },
    { date: "2024-01-05", clicks: 43, conversions: 1, revenue: 75 },
    { date: "2024-01-06", clicks: 55, conversions: 4, revenue: 300 },
    { date: "2024-01-07", clicks: 48, conversions: 2, revenue: 150 },
  ]

  const topContentData = [
    { name: "Hero Banner", clicks: 1250, conversions: 23, revenue: 1725, ctr: 1.84 },
    { name: "Email Template", clicks: 890, conversions: 18, revenue: 1350, ctr: 2.02 },
    { name: "Social Media Kit", clicks: 650, conversions: 12, revenue: 900, ctr: 1.85 },
    { name: "Landing Page", clicks: 2100, conversions: 45, revenue: 3375, ctr: 2.14 },
  ]

  const deviceData = [
    { name: "Desktop", value: 45, color: "#3B82F6" },
    { name: "Mobile", value: 35, color: "#10B981" },
    { name: "Tablet", value: 20, color: "#F59E0B" },
  ]

  const trafficSourceData = [
    { source: "Google Ads", clicks: 850, conversions: 18, revenue: 1350 },
    { source: "Facebook", clicks: 720, conversions: 15, revenue: 1125 },
    { source: "Email", clicks: 650, conversions: 12, revenue: 900 },
    { source: "Direct", clicks: 480, conversions: 8, revenue: 600 },
    { source: "Twitter", clicks: 320, conversions: 5, revenue: 375 },
  ]

  const refreshData = async () => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLoading(false)
  }

  const exportAllData = () => {
    // In real app, this would export comprehensive analytics data
    const data = {
      performance: performanceData,
      topContent: topContentData,
      trafficSources: trafficSourceData,
      deviceBreakdown: deviceData,
    }

    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `affiliate-analytics-${selectedPeriod}days.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Advanced Analytics</h1>
              <p className="text-purple-100">Deep insights into your affiliate performance</p>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32 bg-white text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="secondary" onClick={refreshData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button variant="secondary" onClick={exportAllData}>
                <Download className="h-4 w-4 mr-1" />
                Export All
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                  <p className="text-2xl font-bold text-blue-600">3,247</p>
                </div>
                <MousePointer className="h-8 w-8 text-blue-600" />
              </div>
              <div className="mt-2 text-xs text-green-600">+18.2% vs last period</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversions</p>
                  <p className="text-2xl font-bold text-green-600">68</p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <div className="mt-2 text-xs text-green-600">+12.5% vs last period</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-purple-600">2.09%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="mt-2 text-xs text-red-600">-0.3% vs last period</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-orange-600">$5,100</p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-600" />
              </div>
              <div className="mt-2 text-xs text-green-600">+25.8% vs last period</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="funnel">Funnel</TabsTrigger>
            <TabsTrigger value="attribution">Attribution</TabsTrigger>
            <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="traffic">Traffic</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Performance Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Performance Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Bar yAxisId="left" dataKey="clicks" fill="#3B82F6" opacity={0.3} />
                      <Line yAxisId="right" type="monotone" dataKey="conversions" stroke="#10B981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Device Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChartIcon className="h-5 w-5 mr-2" />
                    Device Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name} (${value}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {deviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Top Performing Content */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topContentData.map((content, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{content.name}</p>
                          <p className="text-sm text-gray-600">
                            {content.clicks.toLocaleString()} clicks • {content.conversions} conversions
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="outline">{content.ctr.toFixed(2)}% CTR</Badge>
                          <Badge className="bg-green-100 text-green-800">${content.revenue.toLocaleString()}</Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          ${(content.revenue / content.conversions).toFixed(0)} per conversion
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="funnel">
            <ConversionFunnel affiliateId={affiliateId} period={selectedPeriod} />
          </TabsContent>

          <TabsContent value="attribution">
            <AttributionAnalysis affiliateId={affiliateId} period={selectedPeriod} />
          </TabsContent>

          <TabsContent value="cohorts">
            <CohortAnalysis affiliateId={affiliateId} period={selectedPeriod} />
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Performance Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={topContentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Bar yAxisId="left" dataKey="clicks" fill="#3B82F6" name="Clicks" />
                      <Bar yAxisId="right" dataKey="conversions" fill="#10B981" name="Conversions" />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Content Insights</h4>
                      <div className="space-y-2 text-sm">
                        <p>• Landing Page has highest conversion rate (2.14%)</p>
                        <p>• Email Template shows best engagement quality</p>
                        <p>• Hero Banner drives most traffic volume</p>
                        <p>• Social Media Kit needs optimization</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Recommendations</h4>
                      <div className="space-y-2 text-sm">
                        <p>• A/B test social media creative variations</p>
                        <p>• Scale successful email template approach</p>
                        <p>• Optimize hero banner for mobile devices</p>
                        <p>• Create more landing page variations</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="traffic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Source Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={trafficSourceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="source" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="clicks" fill="#3B82F6" name="Clicks" />
                      <Bar dataKey="conversions" fill="#10B981" name="Conversions" />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="grid md:grid-cols-3 gap-4">
                    {trafficSourceData.map((source, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <h5 className="font-medium mb-2">{source.source}</h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Clicks:</span>
                            <span className="font-medium">{source.clicks.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Conversions:</span>
                            <span className="font-medium">{source.conversions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Conv. Rate:</span>
                            <span className="font-medium">
                              {((source.conversions / source.clicks) * 100).toFixed(2)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Revenue:</span>
                            <span className="font-medium text-green-600">${source.revenue.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
