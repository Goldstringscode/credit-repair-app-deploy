"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { Users, TrendingUp, DollarSign, Calendar, RefreshCw, Download, Info } from "lucide-react"

interface CohortAnalysisProps {
  affiliateId: string
  period?: string
}

export function CohortAnalysis({ affiliateId, period = "30" }: CohortAnalysisProps) {
  const [selectedMetric, setSelectedMetric] = useState<"retention" | "revenue" | "ltv">("retention")
  const [selectedPeriod, setSelectedPeriod] = useState(period)
  const [loading, setLoading] = useState(false)

  // Mock cohort data
  const cohortData = [
    {
      cohort: "2024-01",
      month0: { users: 45, retained: 45, revenue: 3375, ltv: 75 },
      month1: { users: 45, retained: 38, revenue: 2850, ltv: 63 },
      month2: { users: 45, retained: 32, revenue: 2400, ltv: 53 },
      month3: { users: 45, retained: 28, revenue: 2100, ltv: 47 },
      month4: { users: 45, retained: 25, revenue: 1875, ltv: 42 },
      month5: { users: 45, retained: 23, revenue: 1725, ltv: 38 },
    },
    {
      cohort: "2023-12",
      month0: { users: 38, retained: 38, revenue: 2850, ltv: 75 },
      month1: { users: 38, retained: 31, revenue: 2325, ltv: 61 },
      month2: { users: 38, retained: 26, revenue: 1950, ltv: 51 },
      month3: { users: 38, retained: 23, revenue: 1725, ltv: 45 },
      month4: { users: 38, retained: 20, revenue: 1500, ltv: 39 },
      month5: { users: 38, retained: 18, revenue: 1350, ltv: 36 },
      month6: { users: 38, retained: 17, revenue: 1275, ltv: 34 },
    },
    {
      cohort: "2023-11",
      month0: { users: 42, retained: 42, revenue: 3150, ltv: 75 },
      month1: { users: 42, retained: 34, revenue: 2550, ltv: 61 },
      month2: { users: 42, retained: 29, revenue: 2175, ltv: 52 },
      month3: { users: 42, retained: 25, revenue: 1875, ltv: 45 },
      month4: { users: 42, retained: 22, revenue: 1650, ltv: 39 },
      month5: { users: 42, retained: 20, revenue: 1500, ltv: 36 },
      month6: { users: 42, retained: 19, revenue: 1425, ltv: 34 },
      month7: { users: 42, retained: 18, revenue: 1350, ltv: 32 },
    },
  ]

  const retentionTrendData = [
    { month: "Month 0", "2024-01": 100, "2023-12": 100, "2023-11": 100, "2023-10": 100 },
    { month: "Month 1", "2024-01": 84.4, "2023-12": 81.6, "2023-11": 81.0, "2023-10": 78.9 },
    { month: "Month 2", "2024-01": 71.1, "2023-12": 68.4, "2023-11": 69.0, "2023-10": 65.8 },
    { month: "Month 3", "2024-01": 62.2, "2023-12": 60.5, "2023-11": 59.5, "2023-10": 57.9 },
    { month: "Month 4", "2024-01": 55.6, "2023-12": 52.6, "2023-11": 52.4, "2023-10": 50.0 },
    { month: "Month 5", "2024-01": 51.1, "2023-12": 47.4, "2023-11": 47.6, "2023-10": 44.7 },
    { month: "Month 6", "2024-01": null, "2023-12": 44.7, "2023-11": 45.2, "2023-10": 42.1 },
  ]

  const ltvTrendData = [
    { month: "Month 0", "2024-01": 75, "2023-12": 75, "2023-11": 75, "2023-10": 75 },
    { month: "Month 1", "2024-01": 138, "2023-12": 136, "2023-11": 136, "2023-10": 134 },
    { month: "Month 2", "2024-01": 191, "2023-12": 187, "2023-11": 189, "2023-10": 184 },
    { month: "Month 3", "2024-01": 238, "2023-12": 232, "2023-11": 234, "2023-10": 227 },
    { month: "Month 4", "2024-01": 280, "2023-12": 271, "2023-11": 273, "2023-10": 264 },
    { month: "Month 5", "2024-01": 318, "2023-12": 307, "2023-11": 309, "2023-10": 298 },
    { month: "Month 6", "2024-01": null, "2023-12": 341, "2023-11": 343, "2023-10": 330 },
  ]

  const getCohortColor = (retentionRate: number) => {
    if (retentionRate >= 80) return "bg-green-100 text-green-800"
    if (retentionRate >= 60) return "bg-yellow-100 text-yellow-800"
    if (retentionRate >= 40) return "bg-orange-100 text-orange-800"
    return "bg-red-100 text-red-800"
  }

  const formatValue = (value: number, metric: string) => {
    switch (metric) {
      case "retention":
        return `${value.toFixed(1)}%`
      case "revenue":
      case "ltv":
        return `$${value.toLocaleString()}`
      default:
        return value.toString()
    }
  }

  const refreshData = async () => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLoading(false)
  }

  const exportData = () => {
    const headers = ["Cohort", "Month 0", "Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6"]
    const rows = cohortData.map((cohort) => [
      cohort.cohort,
      cohort.month0[selectedMetric === "retention" ? "retained" : selectedMetric],
      cohort.month1[selectedMetric === "retention" ? "retained" : selectedMetric],
      cohort.month2[selectedMetric === "retention" ? "retained" : selectedMetric],
      cohort.month3[selectedMetric === "retention" ? "retained" : selectedMetric],
      cohort.month4[selectedMetric === "retention" ? "retained" : selectedMetric],
      cohort.month5[selectedMetric === "retention" ? "retained" : selectedMetric],
      cohort.month6?.[selectedMetric === "retention" ? "retained" : selectedMetric] || "",
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `cohort-analysis-${selectedMetric}-${selectedPeriod}days.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Cohort Analysis
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="retention">Retention</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="ltv">LTV</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="180">Last 6 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={refreshData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportData}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="table" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="table">Cohort Table</TabsTrigger>
            <TabsTrigger value="trends">Retention Trends</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="table" className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg flex items-start space-x-2">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">How to read this table:</p>
                <p>
                  Each row represents a cohort (users who signed up in the same month). Columns show their{" "}
                  {selectedMetric} over time. Darker colors indicate better performance.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 p-3 text-left">Cohort</th>
                    <th className="border border-gray-200 p-3 text-center">Month 0</th>
                    <th className="border border-gray-200 p-3 text-center">Month 1</th>
                    <th className="border border-gray-200 p-3 text-center">Month 2</th>
                    <th className="border border-gray-200 p-3 text-center">Month 3</th>
                    <th className="border border-gray-200 p-3 text-center">Month 4</th>
                    <th className="border border-gray-200 p-3 text-center">Month 5</th>
                    <th className="border border-gray-200 p-3 text-center">Month 6</th>
                  </tr>
                </thead>
                <tbody>
                  {cohortData.map((cohort) => (
                    <tr key={cohort.cohort}>
                      <td className="border border-gray-200 p-3 font-medium">{cohort.cohort}</td>
                      <td className="border border-gray-200 p-3 text-center">
                        <Badge className="bg-blue-100 text-blue-800">
                          {formatValue(
                            selectedMetric === "retention"
                              ? (cohort.month0.retained / cohort.month0.users) * 100
                              : cohort.month0[selectedMetric],
                            selectedMetric,
                          )}
                        </Badge>
                      </td>
                      <td className="border border-gray-200 p-3 text-center">
                        <Badge className={getCohortColor((cohort.month1.retained / cohort.month1.users) * 100)}>
                          {formatValue(
                            selectedMetric === "retention"
                              ? (cohort.month1.retained / cohort.month1.users) * 100
                              : cohort.month1[selectedMetric],
                            selectedMetric,
                          )}
                        </Badge>
                      </td>
                      <td className="border border-gray-200 p-3 text-center">
                        <Badge className={getCohortColor((cohort.month2.retained / cohort.month2.users) * 100)}>
                          {formatValue(
                            selectedMetric === "retention"
                              ? (cohort.month2.retained / cohort.month2.users) * 100
                              : cohort.month2[selectedMetric],
                            selectedMetric,
                          )}
                        </Badge>
                      </td>
                      <td className="border border-gray-200 p-3 text-center">
                        <Badge className={getCohortColor((cohort.month3.retained / cohort.month3.users) * 100)}>
                          {formatValue(
                            selectedMetric === "retention"
                              ? (cohort.month3.retained / cohort.month3.users) * 100
                              : cohort.month3[selectedMetric],
                            selectedMetric,
                          )}
                        </Badge>
                      </td>
                      <td className="border border-gray-200 p-3 text-center">
                        <Badge className={getCohortColor((cohort.month4.retained / cohort.month4.users) * 100)}>
                          {formatValue(
                            selectedMetric === "retention"
                              ? (cohort.month4.retained / cohort.month4.users) * 100
                              : cohort.month4[selectedMetric],
                            selectedMetric,
                          )}
                        </Badge>
                      </td>
                      <td className="border border-gray-200 p-3 text-center">
                        <Badge className={getCohortColor((cohort.month5.retained / cohort.month5.users) * 100)}>
                          {formatValue(
                            selectedMetric === "retention"
                              ? (cohort.month5.retained / cohort.month5.users) * 100
                              : cohort.month5[selectedMetric],
                            selectedMetric,
                          )}
                        </Badge>
                      </td>
                      <td className="border border-gray-200 p-3 text-center">
                        {cohort.month6 ? (
                          <Badge className={getCohortColor((cohort.month6.retained / cohort.month6.users) * 100)}>
                            {formatValue(
                              selectedMetric === "retention"
                                ? (cohort.month6.retained / cohort.month6.users) * 100
                                : cohort.month6[selectedMetric],
                              selectedMetric,
                            )}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-4">Retention Rate Trends</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={retentionTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, "Retention Rate"]} />
                    <Line type="monotone" dataKey="2024-01" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="2023-12" stroke="#10B981" strokeWidth={2} />
                    <Line type="monotone" dataKey="2023-11" stroke="#F59E0B" strokeWidth={2} />
                    <Line type="monotone" dataKey="2023-10" stroke="#EF4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Customer Lifetime Value</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={ltvTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, "LTV"]} />
                    <Area
                      type="monotone"
                      dataKey="2024-01"
                      stackId="1"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="2023-12"
                      stackId="2"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="2023-11"
                      stackId="3"
                      stroke="#F59E0B"
                      fill="#F59E0B"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">68.2%</p>
                <p className="text-sm text-gray-600">Avg. 3-Month Retention</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">$234</p>
                <p className="text-sm text-gray-600">Avg. Customer LTV</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">+12.5%</p>
                <p className="text-sm text-gray-600">LTV Growth Rate</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Key Insights</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
                    <p className="text-sm font-medium text-green-800">Strong Month 1 Retention</p>
                    <p className="text-xs text-green-700">
                      Average 82% retention in month 1 indicates good product-market fit
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                    <p className="text-sm font-medium text-blue-800">Improving Cohort Performance</p>
                    <p className="text-xs text-blue-700">Recent cohorts show 5-8% better retention than older ones</p>
                  </div>
                  <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                    <p className="text-sm font-medium text-yellow-800">Month 3 Drop-off</p>
                    <p className="text-xs text-yellow-700">
                      Significant drop-off at month 3 - consider engagement campaigns
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 border-l-4 border-purple-400 rounded">
                    <p className="text-sm font-medium text-purple-800">High LTV Potential</p>
                    <p className="text-xs text-purple-700">
                      Users who stay past month 3 have 85% chance of 6+ month retention
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Recommendations</h4>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm font-medium">1. Onboarding Optimization</p>
                    <p className="text-xs text-gray-600">
                      Focus on improving month 1-3 experience to reduce early churn
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm font-medium">2. Engagement Campaigns</p>
                    <p className="text-xs text-gray-600">
                      Implement targeted campaigns at 60-90 day mark to prevent drop-off
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm font-medium">3. Value Demonstration</p>
                    <p className="text-xs text-gray-600">Show clear progress and results within first 30 days</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm font-medium">4. Loyalty Programs</p>
                    <p className="text-xs text-gray-600">Reward long-term users to maintain high retention rates</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
