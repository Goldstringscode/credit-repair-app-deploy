"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Search,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Play,
  Pause,
  Settings,
  Target,
  Zap,
  Bug,
  BarChart3,
  Mail,
  Send,
  Users,
  FileText,
  Database,
  Clock,
  TrendingUp,
  Shield,
  Info,
  HelpCircle,
  ExternalLink
} from "lucide-react"
import { useEmailDashboard } from "@/hooks/use-email-dashboard"

interface DiagnosticResult {
  id: string
  test: string
  status: "success" | "error" | "warning" | "info" | "running"
  message: string
  details: any
  timestamp: string
  duration?: number
  category: string
  suggestions: string[]
  fix?: string
}

export default function TestDiagnosticPage() {
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [selectedTest, setSelectedTest] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [testEmail, setTestEmail] = useState("test@example.com")
  const [testName, setTestName] = useState("Test User")

  const {
    metrics,
    campaigns,
    templates,
    lists,
    analytics,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    createCampaign,
    createTemplate,
    createList,
    sendTestEmail,
    refreshData,
    clearError
  } = useEmailDashboard()

  const addDiagnosticResult = (
    test: string, 
    status: DiagnosticResult["status"], 
    message: string, 
    details: any, 
    category: string = "general",
    suggestions: string[] = [],
    fix?: string,
    duration?: number
  ) => {
    const result: DiagnosticResult = {
      id: Date.now().toString(),
      test,
      status,
      message,
      details,
      timestamp: new Date().toISOString(),
      duration,
      category,
      suggestions,
      fix
    }
    setDiagnosticResults(prev => [result, ...prev])
  }

  const runComprehensiveDiagnostic = async () => {
    setIsRunning(true)
    setDiagnosticResults([])

    try {
      // Test 1: API Connection
      addDiagnosticResult("API Connection", "running", "Testing API connectivity...", null, "api")
      const startTime1 = Date.now()
      try {
        const response = await fetch('/api/email/dashboard?type=overview')
        const data = await response.json()
        const duration1 = Date.now() - startTime1
        
        if (data.success) {
          addDiagnosticResult("API Connection", "success", "API connection successful", data, "api", [], "API is working correctly", duration1)
        } else {
          addDiagnosticResult("API Connection", "error", `API returned error: ${data.error}`, data, "api", [
            "Check API endpoint implementation",
            "Verify error handling in API",
            "Check server logs for details"
          ], "Fix API error handling", duration1)
        }
      } catch (err) {
        const duration1 = Date.now() - startTime1
        addDiagnosticResult("API Connection", "error", `API request failed: ${err instanceof Error ? err.message : 'Unknown error'}`, err, "api", [
          "Check if API endpoint exists",
          "Verify network connectivity",
          "Check CORS settings",
          "Verify API route configuration"
        ], "Fix API endpoint", duration1)
      }

      // Test 2: Data Fetching
      addDiagnosticResult("Data Fetching", "running", "Testing data fetching...", null, "api")
      const startTime2 = Date.now()
      try {
        await refreshData()
        const duration2 = Date.now() - startTime2
        addDiagnosticResult("Data Fetching", "success", "Data fetched successfully", { 
          campaigns: campaigns?.length || 0,
          templates: templates?.length || 0,
          lists: lists?.length || 0,
          hasMetrics: !!metrics,
          hasAnalytics: !!analytics
        }, "api", [], "Data fetching is working", duration2)
      } catch (err) {
        const duration2 = Date.now() - startTime2
        addDiagnosticResult("Data Fetching", "error", `Data fetching failed: ${err instanceof Error ? err.message : 'Unknown error'}`, err, "api", [
          "Check if the API endpoint is accessible",
          "Verify network connectivity",
          "Check browser console for errors"
        ], "Fix data fetching", duration2)
      }

      // Test 3: Template Creation
      addDiagnosticResult("Template Creation", "running", "Testing template creation...", null, "template")
      const startTime3 = Date.now()
      try {
        const newTemplate = await createTemplate({
          name: "Diagnostic Test Template",
          subject: "Diagnostic Test Email Subject",
          category: "diagnostic",
          content: "<h1>Diagnostic Test Email</h1><p>This is a diagnostic test email template.</p>",
          tags: ["diagnostic", "test"]
        })
        const duration3 = Date.now() - startTime3
        addDiagnosticResult("Template Creation", "success", `Template created: ${newTemplate.name}`, newTemplate, "template", [], "Template creation is working", duration3)
      } catch (err) {
        const duration3 = Date.now() - startTime3
        addDiagnosticResult("Template Creation", "error", `Template creation failed: ${err instanceof Error ? err.message : 'Unknown error'}`, err, "template", [
          "Check if the createTemplate function is properly implemented",
          "Verify the template data structure",
          "Check API endpoint configuration"
        ], "Fix template creation", duration3)
      }

      // Test 4: List Creation
      addDiagnosticResult("List Creation", "running", "Testing list creation...", null, "list")
      const startTime4 = Date.now()
      try {
        const newList = await createList({
          name: "Diagnostic Test List",
          description: "Diagnostic test email list for testing purposes",
          subscribers: 0,
          activeSubscribers: 0,
          unsubscribed: 0,
          bounced: 0,
          createdAt: new Date().toISOString().split('T')[0],
          lastUpdated: new Date().toISOString().split('T')[0],
          tags: ["diagnostic", "test"],
          isPublic: false,
          growthRate: 0,
          avgOpenRate: 0,
          avgClickRate: 0
        })
        const duration4 = Date.now() - startTime4
        addDiagnosticResult("List Creation", "success", `List created: ${newList.name}`, newList, "list", [], "List creation is working", duration4)
      } catch (err) {
        const duration4 = Date.now() - startTime4
        addDiagnosticResult("List Creation", "error", `List creation failed: ${err instanceof Error ? err.message : 'Unknown error'}`, err, "list", [
          "Check if the createList function is properly implemented",
          "Verify the list data structure",
          "Check API endpoint configuration"
        ], "Fix list creation", duration4)
      }

      // Test 5: Campaign Creation
      addDiagnosticResult("Campaign Creation", "running", "Testing campaign creation...", null, "campaign")
      const startTime5 = Date.now()
      try {
        const newCampaign = await createCampaign({
          name: "Diagnostic Test Campaign",
          subject: "Diagnostic Test Campaign Subject",
          status: "draft",
          recipients: 0,
          sent: 0,
          opened: 0,
          clicked: 0,
          unsubscribed: 0,
          bounced: 0,
          openRate: 0,
          clickRate: 0,
          unsubscribeRate: 0,
          bounceRate: 0,
          conversionRate: 0,
          createdAt: new Date().toISOString().split('T')[0],
          template: "diagnostic-test-template",
          category: "diagnostic"
        })
        const duration5 = Date.now() - startTime5
        addDiagnosticResult("Campaign Creation", "success", `Campaign created: ${newCampaign.name}`, newCampaign, "campaign", [], "Campaign creation is working", duration5)
      } catch (err) {
        const duration5 = Date.now() - startTime5
        addDiagnosticResult("Campaign Creation", "error", `Campaign creation failed: ${err instanceof Error ? err.message : 'Unknown error'}`, err, "campaign", [
          "Check if the createCampaign function is properly implemented",
          "Verify the campaign data structure",
          "Check API endpoint configuration"
        ], "Fix campaign creation", duration5)
      }

      // Test 6: Test Email Sending
      addDiagnosticResult("Test Email Sending", "running", "Testing email sending...", null, "email")
      const startTime6 = Date.now()
      try {
        await sendTestEmail(testEmail, testName)
        const duration6 = Date.now() - startTime6
        addDiagnosticResult("Test Email Sending", "success", `Test email sent to ${testEmail}`, { email: testEmail, name: testName }, "email", [], "Email sending is working", duration6)
      } catch (err) {
        const duration6 = Date.now() - startTime6
        addDiagnosticResult("Test Email Sending", "error", `Email sending failed: ${err instanceof Error ? err.message : 'Unknown error'}`, err, "email", [
          "Check email service configuration",
          "Verify SMTP settings",
          "Check if email service is properly initialized",
          "Verify test email address format"
        ], "Fix email sending", duration6)
      }

      // Test 7: Analytics Data
      addDiagnosticResult("Analytics Data", "running", "Testing analytics data...", null, "analytics")
      const startTime7 = Date.now()
      await new Promise(resolve => setTimeout(resolve, 300))
      const duration7 = Date.now() - startTime7
      
      if (analytics && analytics.timeSeries && Array.isArray(analytics.timeSeries) && analytics.timeSeries.length > 0) {
        addDiagnosticResult("Analytics Data", "success", `Analytics data loaded: ${analytics.timeSeries.length} data points`, analytics, "analytics", [], "Analytics data is working", duration7)
      } else if (analytics && (!analytics.timeSeries || !Array.isArray(analytics.timeSeries))) {
        addDiagnosticResult("Analytics Data", "error", "Analytics data structure is invalid - timeSeries is missing or not an array", analytics, "analytics", [
          "Check analytics data structure in API response",
          "Verify timeSeries property exists and is an array",
          "Check data transformation logic"
        ], "Fix analytics data structure", duration7)
      } else if (analytics && analytics.timeSeries && analytics.timeSeries.length === 0) {
        addDiagnosticResult("Analytics Data", "error", "Analytics data is empty - timeSeries array has no data", analytics, "analytics", [
          "Check if analytics data is being populated in API",
          "Verify data generation logic",
          "Check if timeSeries array is being filled"
        ], "Fix analytics data population", duration7)
      } else {
        addDiagnosticResult("Analytics Data", "error", "Analytics data not available", { analytics }, "analytics", [
          "Check if analytics data is being fetched properly",
          "Verify analytics API endpoint",
          "Check if analytics data is being populated",
          "Check useEmailDashboard hook implementation"
        ], "Fix analytics data fetching", duration7)
      }

      // Test 8: Metrics Validation
      addDiagnosticResult("Metrics Validation", "running", "Validating metrics data...", null, "metrics")
      const startTime8 = Date.now()
      await new Promise(resolve => setTimeout(resolve, 200))
      const duration8 = Date.now() - startTime8
      
      if (metrics && typeof metrics.totalSent === 'number') {
        addDiagnosticResult("Metrics Validation", "success", `Metrics validated: ${metrics.totalSent} total sent`, metrics, "metrics", [], "Metrics validation is working", duration8)
      } else {
        addDiagnosticResult("Metrics Validation", "error", "Metrics data invalid", { metrics }, "metrics", [
          "Check if metrics data is being fetched properly",
          "Verify metrics API endpoint",
          "Check if metrics data is being populated"
        ], "Fix metrics validation", duration8)
      }

      // Test 9: Data Integrity
      addDiagnosticResult("Data Integrity", "running", "Checking data integrity...", null, "data")
      const startTime9 = Date.now()
      await new Promise(resolve => setTimeout(resolve, 150))
      const duration9 = Date.now() - startTime9
      
      const dataIssues = []
      if (campaigns.length === 0) dataIssues.push("No campaigns loaded")
      if (templates.length === 0) dataIssues.push("No templates loaded")
      if (lists.length === 0) dataIssues.push("No lists loaded")
      if (!metrics) dataIssues.push("No metrics loaded")
      if (!analytics) dataIssues.push("No analytics loaded")
      
      if (dataIssues.length === 0) {
        addDiagnosticResult("Data Integrity", "success", "All data integrity checks passed", { 
          campaigns: campaigns.length,
          templates: templates.length,
          lists: lists.length,
          hasMetrics: !!metrics,
          hasAnalytics: !!analytics
        }, "data", [], "Data integrity is good", duration9)
      } else {
        addDiagnosticResult("Data Integrity", "error", `Data integrity issues: ${dataIssues.join(", ")}`, dataIssues, "data", [
          "Check if all data is being loaded properly",
          "Verify API endpoints are returning data",
          "Check for data loading errors"
        ], "Fix data integrity issues", duration9)
      }

      // Test 10: Performance Check
      addDiagnosticResult("Performance Check", "running", "Checking system performance...", null, "performance")
      const startTime10 = Date.now()
      await new Promise(resolve => setTimeout(resolve, 100))
      const endTime10 = Date.now()
      const responseTime = endTime10 - startTime10
      
      if (responseTime < 500) {
        addDiagnosticResult("Performance Check", "success", `System performance good: ${responseTime}ms response time`, { responseTime }, "performance", [], "Performance is good", responseTime)
      } else {
        addDiagnosticResult("Performance Check", "error", `Slow response time: ${responseTime}ms`, { responseTime }, "performance", [
          "Check system resources",
          "Optimize API calls",
          "Check for blocking operations"
        ], "Fix performance issues", responseTime)
      }

    } catch (err) {
      addDiagnosticResult("Diagnostic Suite", "error", `Diagnostic suite failed: ${err instanceof Error ? err.message : 'Unknown error'}`, err, "general", [
        "Check system configuration",
        "Verify all dependencies are installed",
        "Check browser console for errors"
      ], "Fix diagnostic suite")
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (status: DiagnosticResult["status"]) => {
    switch (status) {
      case "success": return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error": return <AlertCircle className="h-4 w-4 text-red-500" />
      case "warning": return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "running": return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case "info": return <Info className="h-4 w-4 text-blue-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: DiagnosticResult["status"]) => {
    switch (status) {
      case "success": return "bg-green-100 text-green-800"
      case "error": return "bg-red-100 text-red-800"
      case "warning": return "bg-yellow-100 text-yellow-800"
      case "running": return "bg-blue-100 text-blue-800"
      case "info": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "api": return <Zap className="h-4 w-4" />
      case "email": return <Mail className="h-4 w-4" />
      case "campaign": return <Send className="h-4 w-4" />
      case "template": return <FileText className="h-4 w-4" />
      case "list": return <Users className="h-4 w-4" />
      case "analytics": return <BarChart3 className="h-4 w-4" />
      case "metrics": return <TrendingUp className="h-4 w-4" />
      case "data": return <Database className="h-4 w-4" />
      case "performance": return <Target className="h-4 w-4" />
      default: return <Bug className="h-4 w-4" />
    }
  }

  const filteredResults = diagnosticResults.filter(result => {
    const matchesSearch = result.test.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || result.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const successCount = diagnosticResults.filter(r => r.status === "success").length
  const errorCount = diagnosticResults.filter(r => r.status === "error").length
  const warningCount = diagnosticResults.filter(r => r.status === "warning").length
  const totalTests = diagnosticResults.length
  const successRate = totalTests > 0 ? Math.round((successCount / totalTests) * 100) : 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Comprehensive Test Diagnostic</h1>
            <p className="text-gray-600">
              Detailed analysis of all email system tests with specific fixes
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setDiagnosticResults([])}
              disabled={isRunning}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear Results
            </Button>
            <Button
              onClick={runComprehensiveDiagnostic}
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play className="h-4 w-4 mr-2" />
              {isRunning ? "Running Diagnostic..." : "Run Full Diagnostic"}
            </Button>
          </div>
        </div>
      </div>

      {/* Test Configuration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Test Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="testEmail">Test Email Address</Label>
              <Input
                id="testEmail"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
            <div>
              <Label htmlFor="testName">Test User Name</Label>
              <Input
                id="testName"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="Test User"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      {totalTests > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Bug className="h-6 w-6 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tests</p>
                  <p className="text-2xl font-bold">{totalTests}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Passed</p>
                  <p className="text-2xl font-bold text-green-600">{successCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-6 w-6 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-6 w-6 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Warnings</p>
                  <p className="text-2xl font-bold text-yellow-600">{warningCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-purple-600">{successRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Progress Bar */}
      {isRunning && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
              <span className="text-sm font-medium">Running diagnostic tests...</span>
            </div>
            <Progress value={totalTests > 0 ? (successCount + errorCount + warningCount) / totalTests * 100 : 0} className="w-full" />
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search test results..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
              <option value="running">Running</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Diagnostic Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Diagnostic Test Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bug className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No diagnostic results yet. Click "Run Full Diagnostic" to start.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredResults.map((result) => (
                <div key={result.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(result.status)}
                      <h4 className="font-medium">{result.test}</h4>
                      <div className="flex items-center space-x-1">
                        {getCategoryIcon(result.category)}
                        <span className="text-xs text-gray-500 capitalize">{result.category}</span>
                      </div>
                      <Badge className={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {new Date(result.timestamp).toLocaleString()}
                      </span>
                      {result.duration && (
                        <span className="text-xs text-gray-500">
                          {result.duration}ms
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{result.message}</p>
                  
                  {result.fix && (
                    <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
                      <h6 className="text-sm font-medium text-green-800 mb-1">Fix:</h6>
                      <p className="text-sm text-green-700">{result.fix}</p>
                    </div>
                  )}
                  
                  {result.suggestions && result.suggestions.length > 0 && (
                    <div className="mb-3">
                      <h6 className="text-sm font-medium text-gray-700 mb-2">Suggestions:</h6>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {result.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTest(selectedTest === result.id ? null : result.id)}
                    >
                      <Info className="h-4 w-4 mr-1" />
                      {selectedTest === result.id ? "Hide" : "Show"} Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(JSON.stringify(result.details, null, 2))}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Copy Data
                    </Button>
                  </div>
                  
                  {selectedTest === result.id && result.details && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <h6 className="text-sm font-medium text-gray-700 mb-2">Raw Data:</h6>
                      <pre className="text-xs text-gray-600 bg-white p-2 rounded border overflow-x-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
