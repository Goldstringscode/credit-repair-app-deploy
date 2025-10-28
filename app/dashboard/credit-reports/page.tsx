"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  FileText, 
  Upload, 
  BookOpen, 
  Target,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  ArrowRight
} from "lucide-react"

interface CreditReport {
  id: string
  file_name: string
  bureau: string
  credit_score: number
  upload_date: string
  status: string
  confidence: number
  processing_method: string
  ai_models_used: string[]
  analysis_duration: number
  risk_level: string
  data_quality: number
}

interface CreditReportDetails {
  personal_info: any
  credit_scores: any[]
  accounts: any[]
  negative_items: any[]
  inquiries: any[]
  risk_analysis: any
  recommendations: any[]
  validation_results: any
}

export default function CreditReportsDashboard() {
  const [reports, setReports] = useState<CreditReport[]>([])
  const [selectedReport, setSelectedReport] = useState<CreditReport | null>(null)
  const [reportDetails, setReportDetails] = useState<CreditReportDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCreditReports()
  }, [])

  const fetchCreditReports = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/credit-reports")
      if (response.ok) {
        const data = await response.json()
        setReports(data.reports || [])
      } else {
        setError("Failed to fetch credit reports")
      }
    } catch (error) {
      setError("Error fetching credit reports")
    } finally {
      setLoading(false)
    }
  }

  const fetchReportDetails = async (reportId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/credit-reports/${reportId}`)
      if (response.ok) {
        const data = await response.json()
        setReportDetails(data)
      } else {
        setError("Failed to fetch report details")
      }
    } catch (error) {
      setError("Error fetching report details")
    } finally {
      setLoading(false)
    }
  }

  const generateImprovementStrategy = async (reportData: any) => {
    try {
      setLoading(true)
      const response = await fetch("/api/credit-improvement/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creditData: reportData,
          strategyType: "comprehensive",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Handle strategy generation success
        console.log("Strategy generated:", data)
      } else {
        setError("Failed to generate improvement strategy")
      }
    } catch (error) {
      setError("Error generating improvement strategy")
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case "low": return "bg-green-100 text-green-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "high": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 750) return "text-green-600"
    if (score >= 700) return "text-blue-600"
    if (score >= 650) return "text-yellow-600"
    if (score >= 600) return "text-orange-600"
    return "text-red-600"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 750) return "Excellent"
    if (score >= 700) return "Good"
    if (score >= 650) return "Fair"
    if (score >= 600) return "Poor"
    return "Very Poor"
  }

  if (loading && reports.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading credit reports...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Credit Reports Dashboard</h1>
          <p className="text-gray-600">Manage and analyze your credit reports with AI-powered insights</p>
        </div>
        <Button onClick={() => window.location.href = "/test-upload-system"}>
          📄 Upload New Report
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Manual Upload System Introduction */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                🎯 New: Manual Credit Report System
              </h2>
              <p className="text-gray-700 mb-4">
                Get started quickly with our manual credit report system. Learn how to get your free 
                credit reports, enter your data, and generate professional dispute letters.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => window.location.href = '/dashboard/credit-reports/guide'}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Complete Guide
                </Button>
                <Button 
                  onClick={() => window.location.href = '/dashboard/credit-reports/upload'}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Start Data Entry
                </Button>
              </div>
            </div>
            <div className="ml-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <CreditCard className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Free Reports</p>
                  <p className="text-xs text-gray-600">AnnualCreditReport.com</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <FileText className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">AI Letters</p>
                  <p className="text-xs text-gray-600">Professional Disputes</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Total Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{reports.length}</div>
            <p className="text-sm text-gray-600">Credit reports uploaded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎯 Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {reports.length > 0
                ? Math.round(reports.reduce((sum, r) => sum + (r.credit_score || 0), 0) / reports.length)
                : 0}
            </div>
            <p className="text-sm text-gray-600">Across all reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⚠️ High Risk Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {reports.filter(r => r.risk_level === "High").length}
            </div>
            <p className="text-sm text-gray-600">Need attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Reports List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Credit Reports</CardTitle>
              <CardDescription>Select a report to view details</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedReport?.id === report.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => {
                        setSelectedReport(report)
                        fetchReportDetails(report.id)
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm truncate">{report.file_name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {report.bureau}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-lg font-bold ${getScoreColor(report.credit_score)}`}>
                          {report.credit_score}
                        </span>
                        <span className="text-xs text-gray-500">
                          {getScoreLabel(report.credit_score)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${getRiskColor(report.risk_level)}`}>
                          {report.risk_level}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(report.upload_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Report Details */}
        <div className="lg:col-span-3">
          {selectedReport ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedReport.file_name}</CardTitle>
                    <CardDescription>
                      {selectedReport.bureau} • {new Date(selectedReport.upload_date).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateImprovementStrategy(reportDetails)}
                      disabled={!reportDetails}
                    >
                      💡 Generate Strategy
                    </Button>
                    <Button variant="outline" size="sm">
                      📋 Export Report
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {reportDetails ? (
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="scores">Scores</TabsTrigger>
                      <TabsTrigger value="accounts">Accounts</TabsTrigger>
                      <TabsTrigger value="negative">Negative Items</TabsTrigger>
                      <TabsTrigger value="insights">AI Insights</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium mb-2">Processing Details</h4>
                          <div className="space-y-1 text-sm">
                            <div>Method: {selectedReport.processing_method}</div>
                            <div>AI Models: {selectedReport.ai_models_used?.join(", ")}</div>
                            <div>Duration: {selectedReport.analysis_duration}ms</div>
                            <div>Confidence: {(selectedReport.confidence * 100).toFixed(1)}%</div>
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium mb-2">Data Quality</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Overall Quality</span>
                              <span className="text-sm font-medium">
                                {(selectedReport.data_quality * 100).toFixed(1)}%
                              </span>
                            </div>
                            <Progress value={selectedReport.data_quality * 100} className="w-full" />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="scores" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reportDetails.credit_scores?.map((score, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">{score.model}</span>
                                <Badge variant="outline">{score.version || "N/A"}</Badge>
                              </div>
                              <div className={`text-2xl font-bold ${getScoreColor(score.score)}`}>
                                {score.score}
                              </div>
                              <div className="text-sm text-gray-600">
                                {getScoreLabel(score.score)} • {score.date || "N/A"}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="accounts" className="space-y-4">
                      <div className="space-y-2">
                        {reportDetails.accounts?.map((account, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">{account.creditor_name}</h4>
                                <Badge variant="outline">****{account.account_number_last_4}</Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Balance:</span>
                                  <span className="ml-2 font-medium">
                                    ${account.balance?.toLocaleString() || "N/A"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Limit:</span>
                                  <span className="ml-2 font-medium">
                                    ${account.credit_limit?.toLocaleString() || "N/A"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Status:</span>
                                  <span className="ml-2 font-medium">{account.account_status}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Type:</span>
                                  <span className="ml-2 font-medium">{account.account_type}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="negative" className="space-y-4">
                      <div className="space-y-2">
                        {reportDetails.negative_items?.map((item, index) => (
                          <Card key={index} className="border-red-200">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-red-800">{item.item_type}</h4>
                                <Badge variant="destructive">{item.status}</Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Creditor:</span>
                                  <span className="ml-2 font-medium">{item.creditor_name}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Amount:</span>
                                  <span className="ml-2 font-medium">
                                    ${item.amount?.toLocaleString() || "N/A"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Date:</span>
                                  <span className="ml-2 font-medium">{item.date_reported || "N/A"}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Dispute:</span>
                                  <span className="ml-2 font-medium">{item.dispute_status}</span>
                                </div>
                              </div>
                              {item.description && (
                                <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="insights" className="space-y-4">
                      {reportDetails.risk_analysis && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Risk Analysis</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span>Risk Score</span>
                                <Badge className={getRiskColor(reportDetails.risk_analysis.risk_level)}>
                                  {reportDetails.risk_analysis.risk_score}/100
                                </Badge>
                              </div>
                              <Progress 
                                value={reportDetails.risk_analysis.risk_score} 
                                className="w-full" 
                              />
                              <div>
                                <h5 className="font-medium mb-2">Risk Factors:</h5>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  {reportDetails.risk_analysis.risk_factors?.map((factor: string, index: number) => (
                                    <li key={index}>{factor}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {reportDetails.recommendations && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Improvement Recommendations</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {reportDetails.recommendations.map((rec, index) => (
                                <div key={index} className="p-3 bg-blue-50 rounded-lg">
                                  <div className="flex items-center justify-between mb-1">
                                    <h5 className="font-medium">{rec.action}</h5>
                                    <Badge variant="outline">{rec.priority}</Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-1">{rec.expected_impact}</p>
                                  <p className="text-xs text-gray-500">Timeline: {rec.timeline}</p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p>Loading report details...</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-gray-500">
                  <p>Select a credit report to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

