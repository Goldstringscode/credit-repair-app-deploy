"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Send,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Target,
  Download,
  RefreshCw,
} from "lucide-react"

interface AnalyticsData {
  totalMails: number
  deliveredMails: number
  pendingMails: number
  failedMails: number
  totalRevenue: number
  averageCost: number
  successRate: number
  averageDeliveryTime: number
}

interface MailMetrics {
  date: string
  sent: number
  delivered: number
  revenue: number
}

interface TemplatePerformance {
  id: string
  name: string
  usage: number
  successRate: number
  revenue: number
  averageDeliveryTime: number
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d")
  const [activeTab, setActiveTab] = useState("overview")

  const [analyticsData] = useState<AnalyticsData>({
    totalMails: 1247,
    deliveredMails: 1089,
    pendingMails: 134,
    failedMails: 24,
    totalRevenue: 18705.5,
    averageCost: 15.0,
    successRate: 87.3,
    averageDeliveryTime: 2.4,
  })

  const [mailMetrics] = useState<MailMetrics[]>([
    { date: "2024-01-01", sent: 45, delivered: 42, revenue: 675.0 },
    { date: "2024-01-02", sent: 52, delivered: 48, revenue: 780.0 },
    { date: "2024-01-03", sent: 38, delivered: 35, revenue: 570.0 },
    { date: "2024-01-04", sent: 61, delivered: 56, revenue: 915.0 },
    { date: "2024-01-05", sent: 43, delivered: 39, revenue: 645.0 },
    { date: "2024-01-06", sent: 55, delivered: 51, revenue: 825.0 },
    { date: "2024-01-07", sent: 49, delivered: 44, revenue: 735.0 },
  ])

  const [templatePerformance] = useState<TemplatePerformance[]>([
    {
      id: "1",
      name: "Credit Bureau Dispute Letter",
      usage: 342,
      successRate: 89.2,
      revenue: 5130.0,
      averageDeliveryTime: 2.1,
    },
    {
      id: "2",
      name: "Goodwill Letter Template",
      usage: 287,
      successRate: 76.4,
      revenue: 4305.0,
      averageDeliveryTime: 2.3,
    },
    {
      id: "3",
      name: "Debt Validation Letter",
      usage: 198,
      successRate: 94.1,
      revenue: 2970.0,
      averageDeliveryTime: 2.0,
    },
    {
      id: "4",
      name: "Identity Theft Affidavit",
      usage: 156,
      successRate: 96.8,
      revenue: 2340.0,
      averageDeliveryTime: 1.9,
    },
    {
      id: "5",
      name: "Pay for Delete Agreement",
      usage: 134,
      successRate: 68.7,
      revenue: 2010.0,
      averageDeliveryTime: 2.6,
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "text-green-600 bg-green-100"
      case "pending":
        return "text-yellow-600 bg-yellow-100"
      case "failed":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const calculateGrowth = (current: number, previous: number) => {
    const growth = ((current - previous) / previous) * 100
    return growth
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mail Analytics</h1>
              <p className="text-gray-600 mt-1">Track performance and optimize your certified mail campaigns</p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Mails Sent</p>
                      <p className="text-2xl font-bold text-gray-900">{analyticsData.totalMails.toLocaleString()}</p>
                      <div className="flex items-center mt-1">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600">+12.5% from last month</span>
                      </div>
                    </div>
                    <div className="bg-blue-100 rounded-lg p-3">
                      <Send className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
                      <p className="text-2xl font-bold text-gray-900">{formatPercentage(analyticsData.successRate)}</p>
                      <div className="flex items-center mt-1">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600">+2.1% from last month</span>
                      </div>
                    </div>
                    <div className="bg-green-100 rounded-lg p-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.totalRevenue)}</p>
                      <div className="flex items-center mt-1">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600">+18.3% from last month</span>
                      </div>
                    </div>
                    <div className="bg-green-100 rounded-lg p-3">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg. Delivery Time</p>
                      <p className="text-2xl font-bold text-gray-900">{analyticsData.averageDeliveryTime} days</p>
                      <div className="flex items-center mt-1">
                        <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600">-0.3 days faster</span>
                      </div>
                    </div>
                    <div className="bg-yellow-100 rounded-lg p-3">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Status Breakdown */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Mail Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">Delivered</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{analyticsData.deliveredMails}</span>
                        <Badge className={getStatusColor("delivered")}>
                          {formatPercentage((analyticsData.deliveredMails / analyticsData.totalMails) * 100)}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={(analyticsData.deliveredMails / analyticsData.totalMails) * 100} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm font-medium">Pending</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{analyticsData.pendingMails}</span>
                        <Badge className={getStatusColor("pending")}>
                          {formatPercentage((analyticsData.pendingMails / analyticsData.totalMails) * 100)}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={(analyticsData.pendingMails / analyticsData.totalMails) * 100} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium">Failed</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{analyticsData.failedMails}</span>
                        <Badge className={getStatusColor("failed")}>
                          {formatPercentage((analyticsData.failedMails / analyticsData.totalMails) * 100)}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={(analyticsData.failedMails / analyticsData.totalMails) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Daily Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mailMetrics.slice(-7).map((metric, index) => (
                      <div key={metric.date} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-sm font-medium">
                            {new Date(metric.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {metric.sent} sent
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {metric.delivered} delivered
                            </Badge>
                          </div>
                        </div>
                        <div className="text-sm font-semibold">{formatCurrency(metric.revenue)}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Success Rate Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {formatPercentage(analyticsData.successRate)}
                      </div>
                      <p className="text-sm text-gray-600">Overall Success Rate</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>This Week</span>
                        <span className="font-semibold">89.2%</span>
                      </div>
                      <Progress value={89.2} className="h-2" />
                      <div className="flex justify-between text-sm">
                        <span>Last Week</span>
                        <span className="font-semibold">85.7%</span>
                      </div>
                      <Progress value={85.7} className="h-2" />
                      <div className="flex justify-between text-sm">
                        <span>Last Month</span>
                        <span className="font-semibold">87.3%</span>
                      </div>
                      <Progress value={87.3} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Delivery Time Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{analyticsData.averageDeliveryTime} days</div>
                      <p className="text-sm text-gray-600">Average Delivery Time</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>1-2 days</span>
                        <span className="font-semibold">45%</span>
                      </div>
                      <Progress value={45} className="h-2" />
                      <div className="flex justify-between text-sm">
                        <span>2-3 days</span>
                        <span className="font-semibold">35%</span>
                      </div>
                      <Progress value={35} className="h-2" />
                      <div className="flex justify-between text-sm">
                        <span>3+ days</span>
                        <span className="font-semibold">20%</span>
                      </div>
                      <Progress value={20} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Issues */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Performance Issues & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <h4 className="font-semibold text-yellow-800">Address Validation Issues</h4>
                    </div>
                    <p className="text-sm text-yellow-700 mb-2">
                      12% of failed deliveries are due to invalid addresses. Consider implementing address validation.
                    </p>
                    <Button size="sm" variant="outline">
                      Enable Address Validation
                    </Button>
                  </div>

                  <div className="border-l-4 border-blue-400 bg-blue-50 p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-800">Peak Performance Times</h4>
                    </div>
                    <p className="text-sm text-blue-700 mb-2">
                      Mails sent on Tuesday-Thursday have 15% higher success rates. Consider scheduling bulk sends
                      accordingly.
                    </p>
                    <Button size="sm" variant="outline">
                      View Scheduling Options
                    </Button>
                  </div>

                  <div className="border-l-4 border-green-400 bg-green-50 p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-green-800">Template Optimization</h4>
                    </div>
                    <p className="text-sm text-green-700 mb-2">
                      Your "Debt Validation Letter" template has a 94.1% success rate. Consider using it as a model for
                      other templates.
                    </p>
                    <Button size="sm" variant="outline">
                      Analyze Template
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Template Performance Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {templatePerformance.map((template, index) => (
                    <div key={template.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{template.name}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span>{template.usage} uses</span>
                            <span>{formatCurrency(template.revenue)} revenue</span>
                            <span>{template.averageDeliveryTime} days avg. delivery</span>
                          </div>
                        </div>
                        <Badge
                          className={
                            template.successRate >= 90
                              ? "bg-green-100 text-green-800"
                              : template.successRate >= 80
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {formatPercentage(template.successRate)} success
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Usage Trend</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={(template.usage / 350) * 100} className="flex-1 h-2" />
                            <span className="text-xs font-medium">{template.usage}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Success Rate</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={template.successRate} className="flex-1 h-2" />
                            <span className="text-xs font-medium">{formatPercentage(template.successRate)}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Revenue</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={(template.revenue / 6000) * 100} className="flex-1 h-2" />
                            <span className="text-xs font-medium">{formatCurrency(template.revenue)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.totalRevenue)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Average per Mail</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.averageCost)}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Monthly Growth</p>
                      <p className="text-2xl font-bold text-green-600">+18.3%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Projected Monthly</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(22150)}</p>
                    </div>
                    <Target className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Revenue Breakdown by Service
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="font-medium">Certified Mail</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">1,089 mails</span>
                      <span className="font-semibold">{formatCurrency(16335)}</span>
                      <span className="text-sm text-gray-500">87.3%</span>
                    </div>
                  </div>
                  <Progress value={87.3} className="h-2" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="font-medium">Return Receipt</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">234 receipts</span>
                      <span className="font-semibold">{formatCurrency(1170)}</span>
                      <span className="text-sm text-gray-500">6.3%</span>
                    </div>
                  </div>
                  <Progress value={6.3} className="h-2" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-purple-500 rounded"></div>
                      <span className="font-medium">Premium Templates</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">78 purchases</span>
                      <span className="font-semibold">{formatCurrency(1200.5)}</span>
                      <span className="text-sm text-gray-500">6.4%</span>
                    </div>
                  </div>
                  <Progress value={6.4} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Revenue Projections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue Projections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(22150)}</div>
                    <p className="text-sm text-gray-600">Next Month</p>
                    <div className="flex items-center justify-center mt-1">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">+18.3%</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(65000)}</div>
                    <p className="text-sm text-gray-600">Next Quarter</p>
                    <div className="flex items-center justify-center mt-1">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">+22.7%</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{formatCurrency(280000)}</div>
                    <p className="text-sm text-gray-600">Annual Projection</p>
                    <div className="flex items-center justify-center mt-1">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">+25.4%</span>
                    </div>
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
