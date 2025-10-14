"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Upload } from "lucide-react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Scale,
  Download,
  Target,
  CheckCircle,
  AlertCircle,
  Percent,
} from "lucide-react"

interface AnalyticsData {
  score_history: Array<{
    date: string
    score: number
    bureau: string
    primary_score?: number
    experian_score?: number
    equifax_score?: number
    transunion_score?: number
  }>
  account_breakdown: Array<{ type: string; count: number; total_balance: number }>
  negative_items_by_type: Array<{ type: string; count: number }>
  monthly_progress: Array<{ month: string; score: number; items_resolved: number }>
  utilization_trend: Array<{ date: string; utilization: number }>
  data_quality?: {
    total_reports?: number
    bureaus_covered?: string[]
    average_confidence?: number
  }
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d")
  const [selectedMetric, setSelectedMetric] = useState("all")
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/dashboard/analytics")
      const data = await response.json()

      if (data.success) {
        setAnalyticsData(data.data)
      } else {
        setError(data.error || "Failed to load analytics data")
      }
    } catch (err) {
      setError("Failed to connect to server")
      console.error("Analytics data error:", err)
    } finally {
      setLoading(false)
    }
  }

  const creditScoreData = analyticsData?.score_history?.length
    ? analyticsData.score_history.map((item) => ({
        month: new Date(item.date).toLocaleDateString("en-US", { month: "short" }),
        avgScore: item.primary_score || item.experian_score || item.equifax_score || item.transunion_score || 0,
        experian: item.experian_score,
        equifax: item.equifax_score,
        transunion: item.transunion_score,
        improvement: Math.floor(Math.random() * 20) + 5, // Mock improvement data
      }))
    : []

  const disputePerformanceData = analyticsData?.negative_items_by_type?.length
    ? analyticsData.negative_items_by_type.map((item) => ({
        type: item.type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        successful: Math.floor(Math.random() * 50) + 50,
        failed: Math.floor(Math.random() * 20) + 5,
        pending: Math.floor(Math.random() * 15) + 3,
      }))
    : []

  const accountBreakdownData = analyticsData?.account_breakdown?.length
    ? analyticsData.account_breakdown.map((item) => ({
        name: item.type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        value: item.count,
        balance: item.total_balance,
        color: getAccountTypeColor(item.type),
      }))
    : []

  function getAccountTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      credit_card: "#ef4444",
      auto_loan: "#3b82f6",
      mortgage: "#10b981",
      personal_loan: "#f59e0b",
      student_loan: "#8b5cf6",
      other: "#6b7280",
    }
    return colors[type] || "#6b7280"
  }

  const utilizationTrendData = analyticsData?.utilization_trend?.length ? analyticsData.utilization_trend : []

  const kpiData = [
    {
      title: "Credit Reports",
      value: analyticsData?.data_quality?.total_reports?.toString() || "0",
      change: analyticsData?.data_quality?.total_reports ? "+12.5%" : "No data",
      trend: analyticsData?.data_quality?.total_reports ? "up" : "neutral",
      icon: Users,
      color: "text-blue-600",
      hasData: Boolean(analyticsData?.data_quality?.total_reports),
    },
    {
      title: "Avg Credit Score",
      value: creditScoreData.length
        ? Math.round(creditScoreData.reduce((sum, item) => sum + item.avgScore, 0) / creditScoreData.length).toString()
        : "N/A",
      change: creditScoreData.length ? "+18.7%" : "Upload reports",
      trend: creditScoreData.length ? "up" : "neutral",
      icon: TrendingUp,
      color: "text-green-600",
      hasData: creditScoreData.length > 0,
    },
    {
      title: "Total Accounts",
      value: accountBreakdownData.length
        ? accountBreakdownData.reduce((sum, item) => sum + item.value, 0).toString()
        : "0",
      change: accountBreakdownData.length ? "+2.1%" : "No accounts",
      trend: accountBreakdownData.length ? "up" : "neutral",
      icon: Target,
      color: "text-purple-600",
      hasData: accountBreakdownData.length > 0,
    },
    {
      title: "Negative Items",
      value: disputePerformanceData.length
        ? disputePerformanceData.reduce((sum, item) => sum + item.successful + item.failed + item.pending, 0).toString()
        : "0",
      change: disputePerformanceData.length ? "-15.2%" : "No items",
      trend: disputePerformanceData.length ? "down" : "neutral",
      icon: Scale,
      color: "text-red-600",
      hasData: disputePerformanceData.length > 0,
    },
    {
      title: "Total Debt",
      value: accountBreakdownData.length
        ? `$${Math.round(accountBreakdownData.reduce((sum, item) => sum + item.balance, 0) / 1000)}K`
        : "$0",
      change: accountBreakdownData.length ? "-8.3%" : "No data",
      trend: accountBreakdownData.length ? "down" : "neutral",
      icon: DollarSign,
      color: "text-indigo-600",
      hasData: accountBreakdownData.length > 0,
    },
    {
      title: "Avg Utilization",
      value: utilizationTrendData.length
        ? `${Math.round(utilizationTrendData.reduce((sum, item) => sum + (item.utilization || 0), 0) / utilizationTrendData.length)}%`
        : "N/A",
      change: utilizationTrendData.length ? "-5.7%" : "No data",
      trend: utilizationTrendData.length ? "down" : "neutral",
      icon: Percent,
      color: "text-orange-600",
      hasData: utilizationTrendData.length > 0,
    },
  ]

  const exportData = () => {
    const data = {
      kpis: kpiData,
      creditScores: creditScoreData,
      disputes: disputePerformanceData,
      accounts: accountBreakdownData,
      utilization: utilizationTrendData,
      analyticsData: analyticsData,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `credit-analytics-export-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
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
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Credit Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Comprehensive credit report analysis and progress tracking</p>
              {analyticsData?.data_quality && (
                <div className="flex items-center space-x-4 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {analyticsData.data_quality.total_reports} Reports
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {analyticsData.data_quality.bureaus_covered?.length || 0}/3 Bureaus
                  </Badge>
                  {analyticsData.data_quality.average_confidence && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        analyticsData.data_quality.average_confidence > 0.7
                          ? "border-green-500 text-green-700"
                          : analyticsData.data_quality.average_confidence > 0.4
                            ? "border-yellow-500 text-yellow-700"
                            : "border-red-500 text-red-700"
                      }`}
                    >
                      {Math.round(analyticsData.data_quality.average_confidence * 100)}% Confidence
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="90d">90 Days</SelectItem>
                  <SelectItem value="1y">1 Year</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={exportData} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button onClick={fetchAnalyticsData} variant="outline">
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Error State */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-900">Error Loading Analytics</h3>
                  <p className="text-sm text-red-700">{error}</p>
                  <Button variant="outline" size="sm" className="mt-2 bg-transparent" onClick={fetchAnalyticsData}>
                    Retry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!analyticsData?.score_history?.length && !loading && !error && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-900">No Credit Data Available</h3>
                  <p className="text-sm text-blue-700">
                    Upload credit reports to see detailed analytics and progress tracking.
                  </p>
                  <Link href="/dashboard/reports/upload">
                    <Button size="sm" className="mt-2">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Credit Report
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {analyticsData?.data_quality?.average_confidence && analyticsData.data_quality.average_confidence < 0.5 && (
          <Card className="mb-8 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-900">Low Data Confidence</h3>
                  <p className="text-sm text-yellow-700">
                    The uploaded credit reports may have incomplete data. Consider uploading clearer, more complete
                    reports for better analysis.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {kpiData.map((kpi, index) => {
            const Icon = kpi.icon
            return (
              <Card key={index} className={`${!kpi.hasData ? "opacity-60 border-gray-200" : ""}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${kpi.hasData ? kpi.color : "text-gray-400"}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${kpi.hasData ? "text-gray-900" : "text-gray-400"}`}>
                    {kpi.value}
                  </div>
                  <p
                    className={`text-xs flex items-center ${
                      kpi.trend === "up" && kpi.hasData
                        ? "text-green-600"
                        : kpi.trend === "down" && kpi.hasData
                          ? "text-red-600"
                          : "text-gray-500"
                    }`}
                  >
                    {kpi.trend === "up" && kpi.hasData && <TrendingUp className="h-3 w-3 mr-1" />}
                    {kpi.trend === "down" && kpi.hasData && <TrendingDown className="h-3 w-3 mr-1" />}
                    {kpi.change}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="credit">Credit Scores</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="disputes">Disputes</TabsTrigger>
            <TabsTrigger value="utilization">Utilization</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Credit Score Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={creditScoreData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[300, 850]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="avgScore" stroke="#3b82f6" strokeWidth={2} name="Credit Score" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={accountBreakdownData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {accountBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Credit Score Factors</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Payment History", value: 35, color: "#ef4444" },
                          { name: "Credit Utilization", value: 30, color: "#f97316" },
                          { name: "Length of History", value: 15, color: "#eab308" },
                          { name: "Credit Mix", value: 10, color: "#22c55e" },
                          { name: "New Credit", value: 10, color: "#3b82f6" },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: "Payment History", value: 35, color: "#ef4444" },
                          { name: "Credit Utilization", value: 30, color: "#f97316" },
                          { name: "Length of History", value: 15, color: "#eab308" },
                          { name: "Credit Mix", value: 10, color: "#22c55e" },
                          { name: "New Credit", value: 10, color: "#3b82f6" },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>FCRA Complaint Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { type: "No Response", count: 45, revenue: 1347, avgResolution: 32 },
                      { type: "Inadequate Investigation", count: 38, revenue: 1138, avgResolution: 28 },
                      { type: "Refused Correction", count: 29, revenue: 1159, avgResolution: 35 },
                      { type: "Repeated Violations", count: 22, revenue: 1099, avgResolution: 42 },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{item.type}</p>
                          <p className="text-xs text-gray-600">{item.count} complaints</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">${item.revenue}</p>
                          <p className="text-xs text-gray-600">{item.avgResolution}d avg</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Success Rate</span>
                      </div>
                      <span className="font-semibold">89.2%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Active Users</span>
                      </div>
                      <span className="font-semibold">8,934</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-sm">ARPU</span>
                      </div>
                      <span className="font-semibold">$22.15</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">Growth Rate</span>
                      </div>
                      <span className="font-semibold">+18.7%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Scale className="h-4 w-4 text-red-600" />
                        <span className="text-sm">FCRA Revenue</span>
                      </div>
                      <span className="font-semibold">$13,394</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="credit" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Credit Score Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={creditScoreData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[300, 850]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="avgScore"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        name="Average Credit Score"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Credit Score Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { range: "800-850 (Excellent)", count: 1247, percentage: 9.7, color: "bg-green-500" },
                      { range: "740-799 (Very Good)", count: 2894, percentage: 22.5, color: "bg-blue-500" },
                      { range: "670-739 (Good)", count: 3456, percentage: 26.9, color: "bg-yellow-500" },
                      { range: "580-669 (Fair)", count: 3892, percentage: 30.3, color: "bg-orange-500" },
                      { range: "300-579 (Poor)", count: 1358, percentage: 10.6, color: "bg-red-500" },
                    ].map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{item.range}</span>
                          <span>
                            {item.count} users ({item.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Types Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={accountBreakdownData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#3b82f6" name="Account Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Balances</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {accountBreakdownData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: item.color }} />
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-gray-600">{item.value} accounts</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">${item.balance?.toLocaleString() || 0}</p>
                          <p className="text-xs text-gray-600">Total balance</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="disputes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dispute Performance by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={disputePerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="successful" fill="#10b981" name="Successful" />
                    <Bar dataKey="failed" fill="#ef4444" name="Failed" />
                    <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart
                      data={[
                        { month: "Jan", disputes: 12500, fcra: 8900, training: 3200, mail: 5600 },
                        { month: "Feb", disputes: 14200, fcra: 9800, training: 3800, mail: 6200 },
                        { month: "Mar", disputes: 16800, fcra: 11200, training: 4200, mail: 7100 },
                        { month: "Apr", disputes: 18900, fcra: 12800, training: 4800, mail: 7800 },
                        { month: "May", disputes: 21200, fcra: 14500, training: 5200, mail: 8400 },
                        { month: "Jun", disputes: 23800, fcra: 16200, training: 5800, mail: 9200 },
                        { month: "Jul", disputes: 26500, fcra: 18100, training: 6400, mail: 10100 },
                        { month: "Aug", disputes: 29200, fcra: 19800, training: 7000, mail: 10800 },
                        { month: "Sep", disputes: 31800, fcra: 21600, training: 7600, mail: 11600 },
                        { month: "Oct", disputes: 34500, fcra: 23400, training: 8200, mail: 12400 },
                        { month: "Nov", disputes: 37200, fcra: 25200, training: 8800, mail: 13200 },
                        { month: "Dec", disputes: 39800, fcra: 27100, training: 9400, mail: 14100 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="disputes"
                        stackId="1"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        name="Dispute Letters"
                      />
                      <Area
                        type="monotone"
                        dataKey="fcra"
                        stackId="1"
                        stroke="#ef4444"
                        fill="#ef4444"
                        name="FCRA Complaints"
                      />
                      <Area
                        type="monotone"
                        dataKey="training"
                        stackId="1"
                        stroke="#f59e0b"
                        fill="#f59e0b"
                        name="Training Courses"
                      />
                      <Area
                        type="monotone"
                        dataKey="mail"
                        stackId="1"
                        stroke="#10b981"
                        fill="#10b981"
                        name="Certified Mail"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { service: "Dispute Letters", revenue: 39800, growth: "+15.2%", color: "text-blue-600" },
                      { service: "FCRA Complaints", revenue: 27100, growth: "+45.8%", color: "text-red-600" },
                      { service: "Certified Mail", revenue: 14100, growth: "+22.3%", color: "text-green-600" },
                      { service: "Training Courses", revenue: 9400, growth: "+18.7%", color: "text-orange-600" },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-semibold">{item.service}</p>
                          <p className={`text-sm ${item.color}`}>{item.growth} growth</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">${item.revenue.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">This month</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly User Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={[
                      { day: "Mon", logins: 1240, sessions: 2180, avgTime: 18 },
                      { day: "Tue", logins: 1180, sessions: 2050, avgTime: 16 },
                      { day: "Wed", logins: 1320, sessions: 2340, avgTime: 19 },
                      { day: "Thu", logins: 1280, sessions: 2210, avgTime: 17 },
                      { day: "Fri", logins: 1150, sessions: 1980, avgTime: 15 },
                      { day: "Sat", logins: 980, sessions: 1650, avgTime: 14 },
                      { day: "Sun", logins: 890, sessions: 1520, avgTime: 13 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="logins" fill="#3b82f6" name="Daily Logins" />
                    <Bar dataKey="sessions" fill="#10b981" name="Total Sessions" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="utilization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Credit Utilization Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={utilizationTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString("en-US", { month: "short" })}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="utilization" stroke="#ef4444" strokeWidth={3} name="Utilization %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
