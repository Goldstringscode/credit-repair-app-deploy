"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditReportsSkeleton } from "@/components/loading-skeletons"
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Download,
  RefreshCw,
  Eye,
  FileText,
  CreditCard,
  Calendar,
  Percent,
} from "lucide-react"

interface CreditReport {
  id: string
  bureau: string
  credit_score: number
  report_date: string
  file_name: string
  ai_analysis: any
}

interface CreditAccount {
  id: string
  account_name: string
  account_type: string
  balance: number
  credit_limit: number
  payment_status: string
  account_number_last_4: string
}

interface CreditInquiry {
  id: string
  company_name: string
  inquiry_type: string
  inquiry_date: string
  purpose: string
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [creditReports, setCreditReports] = useState<CreditReport[]>([])
  const [creditAccounts, setCreditAccounts] = useState<CreditAccount[]>([])
  const [creditInquiries, setCreditInquiries] = useState<CreditInquiry[]>([])
  const [error, setError] = useState<string | null>(null)

  const fetchCreditData = async () => {
    try {
      setError(null)

      // Fetch credit reports
      const reportsResponse = await fetch("/api/dashboard/stats")
      if (!reportsResponse.ok) throw new Error("Failed to fetch reports")
      const reportsData = await reportsResponse.json()

      // Fetch detailed credit data
      const detailsResponse = await fetch("/api/credit-reports/details")
      if (detailsResponse.ok) {
        const detailsData = await detailsResponse.json()
        setCreditReports(detailsData.reports || [])
        setCreditAccounts(detailsData.accounts || [])
        setCreditInquiries(detailsData.inquiries || [])
      }
    } catch (error) {
      console.error("Error fetching credit data:", error)
      setError("Failed to load credit report data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCreditData()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchCreditData()
    setRefreshing(false)
  }

  if (loading) {
    return <CreditReportsSkeleton />
  }

  const creditScores =
    creditReports.length > 0
      ? creditReports.map((report) => ({
          bureau: report.bureau,
          score: report.credit_score || 0,
          change: 0, // Could calculate from historical data
          lastUpdated: new Date(report.report_date).toLocaleDateString(),
          status: report.credit_score >= 700 ? "good" : report.credit_score >= 600 ? "fair" : "poor",
          factors: report.ai_analysis?.score_factors || [
            { factor: "Payment History", impact: "positive", description: "35% of score" },
            { factor: "Credit Utilization", impact: "neutral", description: "30% of score" },
            { factor: "Length of Credit History", impact: "positive", description: "15% of score" },
            { factor: "Credit Mix", impact: "positive", description: "10% of score" },
            { factor: "New Credit", impact: "negative", description: "10% of score" },
          ],
        }))
      : [
          // Fallback data when no reports uploaded
          {
            bureau: "No Reports",
            score: 0,
            change: 0,
            lastUpdated: "Never",
            status: "unknown",
            factors: [],
          },
        ]

  const averageScore =
    creditScores.length > 0 && creditScores[0].score > 0
      ? Math.round(creditScores.reduce((sum, score) => sum + score.score, 0) / creditScores.length)
      : 0

  const totalAccounts = creditAccounts.length
  const totalInquiries = creditInquiries.filter((inq) => inq.inquiry_type === "Hard Inquiry").length
  const totalUtilization =
    creditAccounts.length > 0
      ? Math.round(
          creditAccounts.reduce((sum, acc) => sum + (acc.balance / acc.credit_limit) * 100, 0) / creditAccounts.length,
        )
      : 0

  const overviewStats = [
    {
      title: "Average Score",
      value: averageScore || "No Data",
      change: 0,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Hard Inquiries",
      value: totalInquiries,
      change: 0,
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Active Accounts",
      value: totalAccounts,
      change: 0,
      icon: CreditCard,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Credit Utilization",
      value: totalUtilization > 0 ? `${totalUtilization}%` : "No Data",
      change: 0,
      icon: Percent,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  const quickActions = [
    {
      title: "Dispute Negative Item",
      icon: FileText,
      href: "/dashboard/letters/generate",
    },
    {
      title: "Upload New Report",
      icon: Download,
      href: "/dashboard/reports/upload",
    },
    {
      title: "View Full Report",
      icon: Eye,
      href: "#",
    },
    {
      title: "Schedule Monitoring",
      icon: Calendar,
      href: "/dashboard/monitoring",
    },
  ]

  if (creditReports.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Credit Reports</h1>
                <p className="text-gray-600 mt-1">Monitor your credit scores and track improvements</p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                  {refreshing ? "Updating..." : "Refresh"}
                </Button>
                <Button asChild>
                  <a href="/dashboard/reports/upload">
                    <Download className="h-4 w-4 mr-2" />
                    Upload Report
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Credit Reports Found</h3>
              <p className="text-gray-600 mb-6">
                Upload your first credit report to start monitoring your credit health.
              </p>
              <Button asChild>
                <a href="/dashboard/reports/upload">
                  <Download className="h-4 w-4 mr-2" />
                  Upload Credit Report
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Credit Reports</h1>
              <p className="text-gray-600 mt-1">Monitor your credit scores and track improvements</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Updating..." : "Refresh"}
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {overviewStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                      {stat.change !== 0 && (
                        <p className={`text-sm mt-1 ${stat.color}`}>
                          {stat.change > 0 ? "+" : ""}
                          {stat.change} this month
                        </p>
                      )}
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="scores" className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="scores">Credit Scores</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="scores" className="space-y-6">
            {/* Credit Scores */}
            <Card>
              <CardHeader>
                <CardTitle>Credit Scores by Bureau</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {creditScores.map((bureau, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{bureau.bureau}</h3>
                        <div className="flex items-center space-x-2">
                          {bureau.change >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          <span className={`text-sm ${bureau.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {bureau.change > 0 ? "+" : ""}
                            {bureau.change}
                          </span>
                        </div>
                      </div>
                      <div className="text-3xl font-bold mb-2">{bureau.score}</div>
                      <p className="text-sm text-gray-500 mb-3">Updated {bureau.lastUpdated}</p>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-600 mb-2">Score Factors:</p>
                        {bureau.factors.map((factor: any, factorIndex: number) => (
                          <div key={factorIndex} className="text-xs text-gray-500">
                            <span
                              className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                factor.impact === "positive"
                                  ? "bg-green-500"
                                  : factor.impact === "negative"
                                    ? "bg-red-500"
                                    : "bg-gray-400"
                              }`}
                            ></span>
                            {factor.factor} - {factor.description}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Credit Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                {creditAccounts.length > 0 ? (
                  <div className="space-y-4">
                    {creditAccounts.map((account, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <CreditCard className="h-5 w-5 text-gray-400" />
                            <div>
                              <h4 className="font-medium">{account.account_name}</h4>
                              <p className="text-sm text-gray-500">{account.account_type}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${account.balance?.toLocaleString() || "0"}</p>
                          <p className="text-sm text-gray-500">of ${account.credit_limit?.toLocaleString() || "0"}</p>
                        </div>
                        <div className="text-right ml-6">
                          <Badge variant={account.payment_status === "Current" ? "default" : "destructive"}>
                            {account.payment_status || "Unknown"}
                          </Badge>
                          <p className="text-sm text-gray-500 mt-1">
                            {account.credit_limit > 0 ? Math.round((account.balance / account.credit_limit) * 100) : 0}%
                            utilization
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No credit accounts found in uploaded reports.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inquiries" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Credit Inquiries</CardTitle>
              </CardHeader>
              <CardContent>
                {creditInquiries.length > 0 ? (
                  <div className="space-y-4">
                    {creditInquiries.map((inquiry, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-full ${inquiry.inquiry_type === "Hard Inquiry" ? "bg-red-100" : "bg-green-100"}`}
                          >
                            <Eye
                              className={`h-4 w-4 ${inquiry.inquiry_type === "Hard Inquiry" ? "text-red-600" : "text-green-600"}`}
                            />
                          </div>
                          <div>
                            <h4 className="font-medium">{inquiry.company_name}</h4>
                            <p className="text-sm text-gray-500">{inquiry.purpose || "Credit Check"}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={inquiry.inquiry_type === "Hard Inquiry" ? "destructive" : "secondary"}>
                            {inquiry.inquiry_type}
                          </Badge>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(inquiry.inquiry_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No credit inquiries found in uploaded reports.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Credit Score History</CardTitle>
              </CardHeader>
              <CardContent>
                {creditReports.length > 0 ? (
                  <div className="space-y-6">
                    {creditReports.map((report, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <span className="font-medium">{new Date(report.report_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex space-x-6">
                          <div className="text-center">
                            <p className="text-sm text-gray-500">{report.bureau}</p>
                            <p className="font-semibold">{report.credit_score}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      No credit history available. Upload more reports to track changes over time.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center bg-transparent"
                    asChild
                  >
                    <a href={action.href}>
                      <Icon className="h-6 w-6 mb-2" />
                      <span className="text-sm">{action.title}</span>
                    </a>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
