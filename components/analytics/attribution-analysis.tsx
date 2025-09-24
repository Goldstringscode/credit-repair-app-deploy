"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, DollarSign, Users, Clock, Target, Zap, RefreshCw, Download } from "lucide-react"
import { attributionModels } from "@/lib/analytics"

interface AttributionAnalysisProps {
  affiliateId: string
  period?: string
}

export function AttributionAnalysis({ affiliateId, period = "30" }: AttributionAnalysisProps) {
  const [selectedModel, setSelectedModel] = useState<string>("last-click")
  const [selectedPeriod, setSelectedPeriod] = useState(period)
  const [loading, setLoading] = useState(false)

  // Mock attribution data
  const attributionData = {
    "first-click": {
      conversions: 45,
      revenue: 3375,
      commission: 1012.5,
      touchpoints: [
        { source: "Google Ads", conversions: 18, revenue: 1350, percentage: 40 },
        { source: "Facebook", conversions: 12, revenue: 900, percentage: 26.7 },
        { source: "Email", conversions: 8, revenue: 600, percentage: 17.8 },
        { source: "Direct", conversions: 7, revenue: 525, percentage: 15.5 },
      ],
    },
    "last-click": {
      conversions: 45,
      revenue: 3375,
      commission: 1012.5,
      touchpoints: [
        { source: "Email", conversions: 15, revenue: 1125, percentage: 33.3 },
        { source: "Direct", conversions: 13, revenue: 975, percentage: 28.9 },
        { source: "Google Ads", conversions: 10, revenue: 750, percentage: 22.2 },
        { source: "Facebook", conversions: 7, revenue: 525, percentage: 15.6 },
      ],
    },
    linear: {
      conversions: 45,
      revenue: 3375,
      commission: 1012.5,
      touchpoints: [
        { source: "Google Ads", conversions: 14, revenue: 1050, percentage: 31.1 },
        { source: "Email", conversions: 12, revenue: 900, percentage: 26.7 },
        { source: "Facebook", conversions: 10, revenue: 750, percentage: 22.2 },
        { source: "Direct", conversions: 9, revenue: 675, percentage: 20 },
      ],
    },
    "time-decay": {
      conversions: 45,
      revenue: 3375,
      commission: 1012.5,
      touchpoints: [
        { source: "Email", conversions: 16, revenue: 1200, percentage: 35.6 },
        { source: "Direct", conversions: 12, revenue: 900, percentage: 26.7 },
        { source: "Google Ads", conversions: 11, revenue: 825, percentage: 24.4 },
        { source: "Facebook", conversions: 6, revenue: 450, percentage: 13.3 },
      ],
    },
    "position-based": {
      conversions: 45,
      revenue: 3375,
      commission: 1012.5,
      touchpoints: [
        { source: "Google Ads", conversions: 16, revenue: 1200, percentage: 35.6 },
        { source: "Email", conversions: 13, revenue: 975, percentage: 28.9 },
        { source: "Direct", conversions: 9, revenue: 675, percentage: 20 },
        { source: "Facebook", conversions: 7, revenue: 525, percentage: 15.5 },
      ],
    },
  }

  const customerJourneyData = [
    {
      journey: "Google Ads → Email → Direct",
      conversions: 12,
      percentage: 26.7,
      avgTouchpoints: 3,
      avgTimeToConvert: 14,
      revenue: 900,
    },
    {
      journey: "Facebook → Email → Direct",
      conversions: 8,
      percentage: 17.8,
      avgTouchpoints: 3,
      avgTimeToConvert: 18,
      revenue: 600,
    },
    {
      journey: "Direct → Email",
      conversions: 7,
      percentage: 15.6,
      avgTouchpoints: 2,
      avgTimeToConvert: 7,
      revenue: 525,
    },
    {
      journey: "Google Ads → Facebook → Email",
      conversions: 6,
      percentage: 13.3,
      avgTouchpoints: 3,
      avgTimeToConvert: 21,
      revenue: 450,
    },
    {
      journey: "Email Only",
      conversions: 5,
      percentage: 11.1,
      avgTouchpoints: 1,
      avgTimeToConvert: 3,
      revenue: 375,
    },
  ]

  const timeToConversionData = [
    { days: "0-1", conversions: 8, percentage: 17.8 },
    { days: "2-7", conversions: 12, percentage: 26.7 },
    { days: "8-14", conversions: 10, percentage: 22.2 },
    { days: "15-30", conversions: 9, percentage: 20 },
    { days: "31+", conversions: 6, percentage: 13.3 },
  ]

  const currentData = attributionData[selectedModel as keyof typeof attributionData]
  const selectedModelInfo = attributionModels.find((m) => m.model === selectedModel)

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]

  const refreshData = async () => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLoading(false)
  }

  const exportData = () => {
    const csvContent = [
      ["Attribution Model", "Source", "Conversions", "Revenue", "Commission", "Percentage"],
      ...currentData.touchpoints.map((tp) => [
        selectedModelInfo?.name,
        tp.source,
        tp.conversions,
        tp.revenue,
        tp.revenue * 0.3,
        `${tp.percentage}%`,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `attribution-analysis-${selectedModel}-${selectedPeriod}days.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Attribution Analysis
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {attributionModels.map((model) => (
                    <SelectItem key={model.model} value={model.model}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
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
          {selectedModelInfo && <p className="text-sm text-gray-600">{selectedModelInfo.description}</p>}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">{currentData.conversions}</p>
              <p className="text-sm text-gray-600">Total Conversions</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">${currentData.revenue.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">${currentData.commission.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Your Commission</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-600">
                ${(currentData.revenue / currentData.conversions).toFixed(0)}
              </p>
              <p className="text-sm text-gray-600">Avg. Order Value</p>
            </div>
          </div>

          <Tabs defaultValue="sources" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="sources">Traffic Sources</TabsTrigger>
              <TabsTrigger value="journeys">Customer Journeys</TabsTrigger>
              <TabsTrigger value="timing">Conversion Timing</TabsTrigger>
              <TabsTrigger value="comparison">Model Comparison</TabsTrigger>
            </TabsList>

            <TabsContent value="sources" className="space-y-4">
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4">Attribution by Source</h4>
                  <div className="space-y-3">
                    {currentData.touchpoints.map((source, index) => (
                      <div key={source.source} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <div>
                            <p className="font-medium">{source.source}</p>
                            <p className="text-sm text-gray-600">
                              {source.conversions} conversions • ${source.revenue.toLocaleString()} revenue
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{source.percentage.toFixed(1)}%</Badge>
                          <div className="w-20 mt-1">
                            <Progress value={source.percentage} className="h-2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Revenue Distribution</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={currentData.touchpoints}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ source, percentage }) => `${source} (${percentage.toFixed(1)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="revenue"
                      >
                        {currentData.touchpoints.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="journeys" className="space-y-4">
              <div>
                <h4 className="font-semibold mb-4">Top Customer Journeys</h4>
                <div className="space-y-3">
                  {customerJourneyData.map((journey, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{journey.journey}</h5>
                        <Badge variant="outline">{journey.percentage.toFixed(1)}%</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Conversions:</span>
                          <p className="font-medium">{journey.conversions}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Avg. Touchpoints:</span>
                          <p className="font-medium">{journey.avgTouchpoints}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Avg. Time:</span>
                          <p className="font-medium">{journey.avgTimeToConvert} days</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Revenue:</span>
                          <p className="font-medium text-green-600">${journey.revenue.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="timing" className="space-y-4">
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4">Time to Conversion</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={timeToConversionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="days" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="conversions" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Conversion Timeline</h4>
                  <div className="space-y-3">
                    {timeToConversionData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Clock className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium">{item.days} days</p>
                            <p className="text-sm text-gray-600">{item.conversions} conversions</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{item.percentage.toFixed(1)}%</Badge>
                          <div className="w-20 mt-1">
                            <Progress value={item.percentage} className="h-2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comparison" className="space-y-4">
              <div>
                <h4 className="font-semibold mb-4">Attribution Model Comparison</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 p-3 text-left">Model</th>
                        <th className="border border-gray-200 p-3 text-left">Description</th>
                        <th className="border border-gray-200 p-3 text-right">Conversions</th>
                        <th className="border border-gray-200 p-3 text-right">Revenue</th>
                        <th className="border border-gray-200 p-3 text-right">Commission</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attributionModels.map((model) => {
                        const data = attributionData[model.model as keyof typeof attributionData]
                        return (
                          <tr key={model.model} className={selectedModel === model.model ? "bg-blue-50" : ""}>
                            <td className="border border-gray-200 p-3 font-medium">{model.name}</td>
                            <td className="border border-gray-200 p-3 text-sm text-gray-600">{model.description}</td>
                            <td className="border border-gray-200 p-3 text-right">{data.conversions}</td>
                            <td className="border border-gray-200 p-3 text-right">${data.revenue.toLocaleString()}</td>
                            <td className="border border-gray-200 p-3 text-right text-green-600">
                              ${data.commission.toLocaleString()}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
