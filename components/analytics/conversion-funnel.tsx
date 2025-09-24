"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingDown, TrendingUp, Users, MousePointer, UserPlus, CreditCard, RefreshCw, Download } from "lucide-react"
import { conversionFunnelSteps, type FunnelData } from "@/lib/analytics"

interface ConversionFunnelProps {
  affiliateId: string
  period?: string
}

export function ConversionFunnel({ affiliateId, period = "30" }: ConversionFunnelProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(period)
  const [loading, setLoading] = useState(false)

  // Mock funnel data - in real app, fetch from API
  const funnelData: FunnelData[] = [
    {
      step: "visit",
      visitors: 2450,
      conversions: 2450,
      conversionRate: 100,
      dropoffRate: 0,
      revenue: 0,
      averageTimeToConvert: 0,
    },
    {
      step: "signup",
      visitors: 2450,
      conversions: 892,
      conversionRate: 36.4,
      dropoffRate: 63.6,
      revenue: 0,
      averageTimeToConvert: 0.5,
    },
    {
      step: "trial",
      visitors: 892,
      conversions: 634,
      conversionRate: 71.1,
      dropoffRate: 28.9,
      revenue: 0,
      averageTimeToConvert: 2.3,
    },
    {
      step: "subscription",
      visitors: 634,
      conversions: 187,
      conversionRate: 29.5,
      dropoffRate: 70.5,
      revenue: 14025,
      averageTimeToConvert: 7.2,
    },
    {
      step: "retention",
      visitors: 187,
      conversions: 156,
      conversionRate: 83.4,
      dropoffRate: 16.6,
      revenue: 11700,
      averageTimeToConvert: 30,
    },
  ]

  const getStepIcon = (step: string) => {
    switch (step) {
      case "visit":
        return <MousePointer className="h-5 w-5" />
      case "signup":
        return <UserPlus className="h-5 w-5" />
      case "trial":
        return <Users className="h-5 w-5" />
      case "subscription":
        return <CreditCard className="h-5 w-5" />
      case "retention":
        return <RefreshCw className="h-5 w-5" />
      default:
        return <Users className="h-5 w-5" />
    }
  }

  const getStepColor = (conversionRate: number) => {
    if (conversionRate >= 70) return "text-green-600 bg-green-50"
    if (conversionRate >= 50) return "text-yellow-600 bg-yellow-50"
    if (conversionRate >= 30) return "text-orange-600 bg-orange-50"
    return "text-red-600 bg-red-50"
  }

  const refreshData = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLoading(false)
  }

  const exportData = () => {
    const csvContent = [
      ["Step", "Visitors", "Conversions", "Conversion Rate", "Dropoff Rate", "Revenue", "Avg Time to Convert"],
      ...funnelData.map((data) => [
        conversionFunnelSteps.find((s) => s.step === data.step)?.name || data.step,
        data.visitors,
        data.conversions,
        `${data.conversionRate.toFixed(1)}%`,
        `${data.dropoffRate.toFixed(1)}%`,
        `$${data.revenue.toLocaleString()}`,
        `${data.averageTimeToConvert} days`,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `conversion-funnel-${selectedPeriod}days.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <TrendingDown className="h-5 w-5 mr-2" />
            Conversion Funnel Analysis
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
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
        <div className="space-y-6">
          {/* Funnel Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{funnelData[0]?.visitors.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total Visitors</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {funnelData[funnelData.length - 2]?.conversions.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Paid Conversions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {((funnelData[funnelData.length - 2]?.conversions / funnelData[0]?.visitors) * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600">Overall Conversion</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                ${funnelData[funnelData.length - 2]?.revenue.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
          </div>

          {/* Funnel Steps */}
          <div className="space-y-4">
            {funnelData.map((data, index) => {
              const step = conversionFunnelSteps.find((s) => s.step === data.step)
              const previousData = index > 0 ? funnelData[index - 1] : null

              return (
                <div key={data.step} className="relative">
                  {/* Connection Line */}
                  {index > 0 && <div className="absolute left-6 -top-4 w-0.5 h-4 bg-gray-300"></div>}

                  <div className="flex items-center space-x-4 p-4 border rounded-lg bg-white">
                    <div className={`p-3 rounded-full ${getStepColor(data.conversionRate)}`}>
                      {getStepIcon(data.step)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{step?.name}</h4>
                          <p className="text-sm text-gray-600">{step?.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{data.conversions.toLocaleString()} users</Badge>
                            {data.revenue > 0 && (
                              <Badge variant="outline" className="text-green-600">
                                ${data.revenue.toLocaleString()}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">Conversion Rate</span>
                            <span className="text-sm font-medium">{data.conversionRate.toFixed(1)}%</span>
                          </div>
                          <Progress value={data.conversionRate} className="h-2" />
                        </div>

                        {data.dropoffRate > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-600">Drop-off Rate</span>
                              <span className="text-sm font-medium text-red-600">{data.dropoffRate.toFixed(1)}%</span>
                            </div>
                            <Progress value={data.dropoffRate} className="h-2 bg-red-100" />
                          </div>
                        )}

                        {data.averageTimeToConvert > 0 && (
                          <div>
                            <span className="text-sm text-gray-600">Avg. Time to Convert</span>
                            <p className="text-sm font-medium">
                              {data.averageTimeToConvert < 1
                                ? `${(data.averageTimeToConvert * 24).toFixed(1)} hours`
                                : `${data.averageTimeToConvert.toFixed(1)} days`}
                            </p>
                          </div>
                        )}

                        {previousData && (
                          <div>
                            <span className="text-sm text-gray-600">From Previous Step</span>
                            <div className="flex items-center">
                              {data.conversions > previousData.conversions ? (
                                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                              )}
                              <span className="text-sm font-medium">
                                {((data.conversions / previousData.conversions) * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Insights */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Key Insights</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Signup conversion rate (36.4%) is above industry average (25-30%)</li>
              <li>• Trial-to-paid conversion (29.5%) has room for improvement - consider onboarding optimization</li>
              <li>• Strong retention rate (83.4%) indicates good product-market fit</li>
              <li>• Average customer lifetime value: $75 based on current retention</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
