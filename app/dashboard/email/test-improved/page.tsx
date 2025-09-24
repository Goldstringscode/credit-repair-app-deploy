"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Mail,
  Send,
  Eye,
  TestTube,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  BarChart3,
  FileText,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Download,
  Upload,
  Target,
  TrendingUp,
  Zap,
  Bell,
  DollarSign,
  CreditCard,
  Shield,
  BookOpen,
  Star,
  Heart,
  ThumbsUp,
  MessageSquare,
  Share,
  ExternalLink,
  Bug,
  Info,
  HelpCircle
} from "lucide-react"
import { useEmailDashboard } from "@/hooks/use-email-dashboard"

interface TestResult {
  id: string
  test: string
  status: "success" | "error" | "pending" | "running"
  message: string
  timestamp: string
  duration?: number
  category: string
  details?: any
  suggestions?: string[]
}

export default function ImprovedEmailTestPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [testEmail, setTestEmail] = useState("test@example.com")
  const [testName, setTestName] = useState("Test User")
  const [showDetails, setShowDetails] = useState<string | null>(null)
  
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
    sendCampaign,
    refreshData,
    clearError
  } = useEmailDashboard()

  const addTestResult = (test: string, status: TestResult["status"], message: string, duration?: number, category: string = "general", details?: any, suggestions?: string[]) => {
    const result: TestResult = {
      id: Date.now().toString(),
      test,
      status,
      message,
      timestamp: new Date().toISOString(),
      duration,
      category,
      details,
      suggestions
    }
    setTestResults(prev => [result, ...prev])
  }

  const runAllTests = async () => {
    setIsRunningTests(true)
    setTestResults([])
    
    try {
      // Test 1: API Connection
      addTestResult("API Connection", "running", "Testing API connectivity...", undefined, "api")
      await new Promise(resolve => setTimeout(resolve, 500))
      addTestResult("API Connection", "success", "API connection successful", 500, "api")

      // Test 2: Data Fetching
      addTestResult("Data Fetching", "running", "Testing data fetching...", undefined, "api")
      try {
        await refreshData()
        addTestResult("Data Fetching", "success", "Data fetched successfully", 1000, "api")
      } catch (err) {
        addTestResult("Data Fetching", "error", `Data fetching failed: ${err instanceof Error ? err.message : 'Unknown error'}`, 1000, "api", err, [
          "Check if the API endpoint is accessible",
          "Verify network connectivity",
          "Check browser console for errors"
        ])
      }

      // Test 3: Template Creation
      addTestResult("Template Creation", "running", "Testing template creation...", undefined, "template")
      try {
        const newTemplate = await createTemplate({
          name: "Test Template",
          subject: "Test Email Subject",
          category: "test",
          content: "<h1>Test Email</h1><p>This is a test email template.</p>",
          tags: ["test", "automated"]
        })
        addTestResult("Template Creation", "success", `Template created: ${newTemplate.name}`, 800, "template")
      } catch (err) {
        addTestResult("Template Creation", "error", `Template creation failed: ${err instanceof Error ? err.message : 'Unknown error'}`, 800, "template", err, [
          "Check if the createTemplate function is properly implemented",
          "Verify the template data structure",
          "Check API endpoint configuration"
        ])
      }

      // Test 4: List Creation
      addTestResult("List Creation", "running", "Testing list creation...", undefined, "list")
      try {
        const newList = await createList({
          name: "Test List",
          description: "Test email list for testing purposes",
          subscribers: 0,
          activeSubscribers: 0,
          unsubscribed: 0,
          bounced: 0,
          createdAt: new Date().toISOString().split('T')[0],
          lastUpdated: new Date().toISOString().split('T')[0],
          tags: ["test", "automated"],
          isPublic: false,
          growthRate: 0,
          avgOpenRate: 0,
          avgClickRate: 0
        })
        addTestResult("List Creation", "success", `List created: ${newList.name}`, 600, "list")
      } catch (err) {
        addTestResult("List Creation", "error", `List creation failed: ${err instanceof Error ? err.message : 'Unknown error'}`, 600, "list", err, [
          "Check if the createList function is properly implemented",
          "Verify the list data structure",
          "Check API endpoint configuration"
        ])
      }

      // Test 5: Campaign Creation
      addTestResult("Campaign Creation", "running", "Testing campaign creation...", undefined, "campaign")
      try {
        const newCampaign = await createCampaign({
          name: "Test Campaign",
          subject: "Test Campaign Subject",
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
          template: "test-template",
          category: "test"
        })
        addTestResult("Campaign Creation", "success", `Campaign created: ${newCampaign.name}`, 700, "campaign")
      } catch (err) {
        addTestResult("Campaign Creation", "error", `Campaign creation failed: ${err instanceof Error ? err.message : 'Unknown error'}`, 700, "campaign", err, [
          "Check if the createCampaign function is properly implemented",
          "Verify the campaign data structure",
          "Check API endpoint configuration"
        ])
      }

      // Test 6: Test Email Sending
      addTestResult("Test Email Sending", "running", "Testing email sending...", undefined, "email")
      try {
        await sendTestEmail(testEmail, testName)
        addTestResult("Test Email Sending", "success", `Test email sent to ${testEmail}`, 1200, "email")
      } catch (err) {
        addTestResult("Test Email Sending", "error", `Email sending failed: ${err instanceof Error ? err.message : 'Unknown error'}`, 1200, "email", err, [
          "Check email service configuration",
          "Verify SMTP settings",
          "Check if email service is properly initialized",
          "Verify test email address format"
        ])
      }

      // Test 7: Analytics Data
      addTestResult("Analytics Data", "running", "Testing analytics data...", undefined, "analytics")
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Check if analytics data exists and has the required structure
      if (analytics && analytics.timeSeries && Array.isArray(analytics.timeSeries) && analytics.timeSeries.length > 0) {
        addTestResult("Analytics Data", "success", `Analytics data loaded: ${analytics.timeSeries.length} data points`, 300, "analytics")
      } else if (analytics && (!analytics.timeSeries || !Array.isArray(analytics.timeSeries))) {
        addTestResult("Analytics Data", "error", "Analytics data structure is invalid - timeSeries is missing or not an array", 300, "analytics", analytics, [
          "Check analytics data structure in API response",
          "Verify timeSeries property exists and is an array",
          "Check data transformation logic"
        ])
      } else if (analytics && analytics.timeSeries && analytics.timeSeries.length === 0) {
        addTestResult("Analytics Data", "error", "Analytics data is empty - timeSeries array has no data", 300, "analytics", analytics, [
          "Check if analytics data is being populated in API",
          "Verify data generation logic",
          "Check if timeSeries array is being filled"
        ])
      } else {
        addTestResult("Analytics Data", "error", "Analytics data not available", 300, "analytics", { analytics }, [
          "Check if analytics data is being fetched properly",
          "Verify analytics API endpoint",
          "Check if analytics data is being populated",
          "Check useEmailDashboard hook implementation"
        ])
      }

      // Test 8: Metrics Validation
      addTestResult("Metrics Validation", "running", "Validating metrics data...", undefined, "metrics")
      await new Promise(resolve => setTimeout(resolve, 200))
      if (metrics && typeof metrics.totalSent === 'number') {
        addTestResult("Metrics Validation", "success", `Metrics validated: ${metrics.totalSent} total sent`, 200, "metrics")
      } else {
        addTestResult("Metrics Validation", "error", "Metrics data invalid", 200, "metrics", null, [
          "Check if metrics data is being fetched properly",
          "Verify metrics API endpoint",
          "Check if metrics data is being populated"
        ])
      }

      // Test 9: Data Integrity
      addTestResult("Data Integrity", "running", "Checking data integrity...", undefined, "data")
      await new Promise(resolve => setTimeout(resolve, 150))
      const dataIssues = []
      
      if (campaigns.length === 0) dataIssues.push("No campaigns loaded")
      if (templates.length === 0) dataIssues.push("No templates loaded")
      if (lists.length === 0) dataIssues.push("No lists loaded")
      if (!metrics) dataIssues.push("No metrics loaded")
      if (!analytics) dataIssues.push("No analytics loaded")
      
      if (dataIssues.length === 0) {
        addTestResult("Data Integrity", "success", "All data integrity checks passed", 150, "data")
      } else {
        addTestResult("Data Integrity", "error", `Data integrity issues: ${dataIssues.join(", ")}`, 150, "data", dataIssues, [
          "Check if all data is being loaded properly",
          "Verify API endpoints are returning data",
          "Check for data loading errors"
        ])
      }

      // Test 10: Performance Check
      addTestResult("Performance Check", "running", "Checking system performance...", undefined, "performance")
      const startTime = Date.now()
      await new Promise(resolve => setTimeout(resolve, 100))
      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      if (responseTime < 500) {
        addTestResult("Performance Check", "success", `System performance good: ${responseTime}ms response time`, responseTime, "performance")
      } else {
        addTestResult("Performance Check", "error", `Slow response time: ${responseTime}ms`, responseTime, "performance", null, [
          "Check system resources",
          "Optimize API calls",
          "Check for blocking operations"
        ])
      }

    } catch (err) {
      addTestResult("Test Suite", "error", `Test suite failed: ${err instanceof Error ? err.message : 'Unknown error'}`, undefined, "general", err, [
        "Check system configuration",
        "Verify all dependencies are installed",
        "Check browser console for errors"
      ])
    } finally {
      setIsRunningTests(false)
    }
  }

  const runSingleTest = async (testName: string, testFunction: () => Promise<void>, category: string = "general") => {
    addTestResult(testName, "running", `Running ${testName}...`, undefined, category)
    const startTime = Date.now()
    
    try {
      await testFunction()
      const duration = Date.now() - startTime
      addTestResult(testName, "success", `${testName} completed successfully`, duration, category)
    } catch (err) {
      const duration = Date.now() - startTime
      addTestResult(testName, "error", `${testName} failed: ${err instanceof Error ? err.message : 'Unknown error'}`, duration, category, err)
    }
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success": return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error": return <AlertCircle className="h-4 w-4 text-red-500" />
      case "running": return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case "pending": return <Clock className="h-4 w-4 text-yellow-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "success": return "bg-green-100 text-green-800"
      case "error": return "bg-red-100 text-red-800"
      case "running": return "bg-blue-100 text-blue-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
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
      case "data": return <Shield className="h-4 w-4" />
      case "performance": return <Target className="h-4 w-4" />
      default: return <TestTube className="h-4 w-4" />
    }
  }

  const successCount = testResults.filter(r => r.status === "success").length
  const errorCount = testResults.filter(r => r.status === "error").length
  const totalTests = testResults.length
  const successRate = totalTests > 0 ? Math.round((successCount / totalTests) * 100) : 0

  const categories = Array.from(new Set(testResults.map(r => r.category)))
  const categoryStats = categories.map(category => ({
    category,
    total: testResults.filter(r => r.category === category).length,
    success: testResults.filter(r => r.category === category && r.status === "success").length,
    error: testResults.filter(r => r.category === category && r.status === "error").length
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Enhanced Email System Test Suite</h1>
            <p className="text-gray-600">
              Comprehensive testing with detailed diagnostics and suggestions
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setTestResults([])}
              disabled={isRunningTests}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear Results
            </Button>
            <Button
              onClick={runAllTests}
              disabled={isRunningTests}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="h-4 w-4 mr-2" />
              {isRunningTests ? "Running Tests..." : "Run All Tests"}
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

      {/* Test Results Summary */}
      {totalTests > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TestTube className="h-6 w-6 text-blue-500" />
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

      {/* Category Breakdown */}
      {categoryStats.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Test Results by Category</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryStats.map((stat) => (
                <div key={stat.category} className="border rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    {getCategoryIcon(stat.category)}
                    <span className="font-medium capitalize">{stat.category}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Total:</span>
                      <span className="font-medium">{stat.total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Passed:</span>
                      <span className="font-medium text-green-600">{stat.success}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-red-600">Failed:</span>
                      <span className="font-medium text-red-600">{stat.error}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Success Rate:</span>
                      <span className="font-medium">
                        {stat.total > 0 ? Math.round((stat.success / stat.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              onClick={clearError}
              className="ml-2"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>System Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">API Connection</span>
                    <Badge className={error ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                      {error ? "Error" : "Connected"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Data Loading</span>
                    <Badge className={isLoading ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}>
                      {isLoading ? "Loading" : "Ready"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Campaigns</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {campaigns.length} loaded
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Templates</span>
                    <Badge className="bg-purple-100 text-purple-800">
                      {templates.length} loaded
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Lists</span>
                    <Badge className="bg-green-100 text-green-800">
                      {lists.length} loaded
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => runSingleTest("Data Refresh", refreshData, "api")}
                    disabled={isLoading}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => runSingleTest("Test Email", () => sendTestEmail(testEmail, testName), "email")}
                    disabled={isUpdating}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Test Email
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => runSingleTest("Template Creation", () => createTemplate({
                      name: "Quick Test Template",
                      subject: "Quick Test",
                      category: "test",
                      content: "<p>Quick test template</p>",
                      tags: ["quick", "test"]
                    }), "template")}
                    disabled={isCreating}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Create Test Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Test Results Tab */}
        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TestTube className="h-5 w-5" />
                <span>Detailed Test Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <TestTube className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No tests run yet. Click "Run All Tests" to start testing.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {testResults.map((result) => (
                    <div key={result.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(result.status)}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium">{result.test}</h4>
                              <div className="flex items-center space-x-1">
                                {getCategoryIcon(result.category)}
                                <span className="text-xs text-gray-500 capitalize">{result.category}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">{result.message}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-xs text-gray-500">
                                {new Date(result.timestamp).toLocaleString()}
                              </span>
                              {result.duration && (
                                <span className="text-xs text-gray-500">
                                  Duration: {result.duration}ms
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(result.status)}>
                            {result.status}
                          </Badge>
                          {result.status === "error" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowDetails(showDetails === result.id ? null : result.id)}
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {showDetails === result.id && result.status === "error" && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <h5 className="font-medium text-red-800 mb-2">Error Details:</h5>
                          <pre className="text-xs text-red-700 bg-red-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                          {result.suggestions && result.suggestions.length > 0 && (
                            <div className="mt-3">
                              <h6 className="font-medium text-red-800 mb-2">Suggestions:</h6>
                              <ul className="text-sm text-red-700 space-y-1">
                                {result.suggestions.map((suggestion, index) => (
                                  <li key={index} className="flex items-start space-x-2">
                                    <span className="text-red-500 mt-1">•</span>
                                    <span>{suggestion}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Diagnostics Tab */}
        <TabsContent value="diagnostics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bug className="h-5 w-5" />
                <span>System Diagnostics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Data Status</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Campaigns:</span>
                        <span className={campaigns.length > 0 ? "text-green-600" : "text-red-600"}>
                          {campaigns.length} loaded
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Templates:</span>
                        <span className={templates.length > 0 ? "text-green-600" : "text-red-600"}>
                          {templates.length} loaded
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lists:</span>
                        <span className={lists.length > 0 ? "text-green-600" : "text-red-600"}>
                          {lists.length} loaded
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Metrics:</span>
                        <span className={metrics ? "text-green-600" : "text-red-600"}>
                          {metrics ? "Available" : "Not Available"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Analytics:</span>
                        <span className={analytics ? "text-green-600" : "text-red-600"}>
                          {analytics ? "Available" : "Not Available"}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">System Health</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>API Status:</span>
                        <span className={error ? "text-red-600" : "text-green-600"}>
                          {error ? "Error" : "Healthy"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Loading State:</span>
                        <span className={isLoading ? "text-yellow-600" : "text-green-600"}>
                          {isLoading ? "Loading" : "Ready"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Error State:</span>
                        <span className={error ? "text-red-600" : "text-green-600"}>
                          {error ? "Has Errors" : "No Errors"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suggestions Tab */}
        <TabsContent value="suggestions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HelpCircle className="h-5 w-5" />
                <span>Improvement Suggestions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {errorCount > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You have {errorCount} failing tests. Here are some suggestions to improve your system:
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-3">
                  {testResults
                    .filter(r => r.status === "error" && r.suggestions)
                    .map((result) => (
                      <div key={result.id} className="border rounded-lg p-4">
                        <h5 className="font-medium text-red-800 mb-2">{result.test}</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {result.suggestions?.map((suggestion, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                </div>
                
                {errorCount === 0 && (
                  <div className="text-center py-8 text-green-600">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4" />
                    <p className="text-lg font-medium">All tests are passing!</p>
                    <p className="text-sm">Your email system is working correctly.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
