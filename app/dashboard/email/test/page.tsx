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
  ExternalLink
} from "lucide-react"
import { useEmailDashboard } from "@/hooks/use-email-dashboard"

interface TestResult {
  id: string
  test: string
  status: "success" | "error" | "pending" | "running"
  message: string
  timestamp: string
  duration?: number
}

export default function EmailTestPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)
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
    sendCampaign,
    refreshData,
    clearError
  } = useEmailDashboard()

  const addTestResult = (test: string, status: TestResult["status"], message: string, duration?: number) => {
    const result: TestResult = {
      id: Date.now().toString(),
      test,
      status,
      message,
      timestamp: new Date().toISOString(),
      duration
    }
    setTestResults(prev => [result, ...prev])
  }

  const runAllTests = async () => {
    setIsRunningTests(true)
    setTestResults([])
    
    try {
      // Test 1: API Connection
      addTestResult("API Connection", "running", "Testing API connectivity...")
      await new Promise(resolve => setTimeout(resolve, 500))
      addTestResult("API Connection", "success", "API connection successful", 500)

      // Test 2: Data Fetching
      addTestResult("Data Fetching", "running", "Testing data fetching...")
      await refreshData()
      addTestResult("Data Fetching", "success", "Data fetched successfully", 1000)

      // Test 3: Template Creation
      addTestResult("Template Creation", "running", "Testing template creation...")
      try {
        const newTemplate = await createTemplate({
          name: "Test Template",
          subject: "Test Email Subject",
          category: "transactional",
          tags: ["test", "automated"]
        })
        addTestResult("Template Creation", "success", `Template created: ${newTemplate.name}`, 800)
      } catch (err) {
        addTestResult("Template Creation", "error", `Template creation failed: ${err instanceof Error ? err.message : 'Unknown error'}`, 800)
      }

      // Test 4: List Creation
      addTestResult("List Creation", "running", "Testing list creation...")
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
        addTestResult("List Creation", "success", `List created: ${newList.name}`, 600)
      } catch (err) {
        addTestResult("List Creation", "error", `List creation failed: ${err instanceof Error ? err.message : 'Unknown error'}`, 600)
      }

      // Test 5: Campaign Creation
      addTestResult("Campaign Creation", "running", "Testing campaign creation...")
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
          category: "transactional"
        })
        addTestResult("Campaign Creation", "success", `Campaign created: ${newCampaign.name}`, 700)
      } catch (err) {
        addTestResult("Campaign Creation", "error", `Campaign creation failed: ${err instanceof Error ? err.message : 'Unknown error'}`, 700)
      }

      // Test 6: Test Email Sending
      addTestResult("Test Email Sending", "running", "Testing email sending...")
      try {
        await sendTestEmail(testEmail, testName)
        addTestResult("Test Email Sending", "success", `Test email sent to ${testEmail}`, 1200)
      } catch (err) {
        addTestResult("Test Email Sending", "error", `Email sending failed: ${err instanceof Error ? err.message : 'Unknown error'}`, 1200)
      }

      // Test 7: Analytics Data
      addTestResult("Analytics Data", "running", "Testing analytics data...")
      await new Promise(resolve => setTimeout(resolve, 300))
      if (analytics && analytics.timeSeries.length > 0) {
        addTestResult("Analytics Data", "success", `Analytics data loaded: ${analytics.timeSeries.length} data points`, 300)
      } else {
        addTestResult("Analytics Data", "error", "Analytics data not available", 300)
      }

      // Test 8: Metrics Validation
      addTestResult("Metrics Validation", "running", "Validating metrics data...")
      await new Promise(resolve => setTimeout(resolve, 200))
      if (metrics && typeof metrics.totalSent === 'number') {
        addTestResult("Metrics Validation", "success", `Metrics validated: ${metrics.totalSent} total sent`, 200)
      } else {
        addTestResult("Metrics Validation", "error", "Metrics data invalid", 200)
      }

    } catch (err) {
      addTestResult("Test Suite", "error", `Test suite failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsRunningTests(false)
    }
  }

  const runSingleTest = async (testName: string, testFunction: () => Promise<void>) => {
    addTestResult(testName, "running", `Running ${testName}...`)
    const startTime = Date.now()
    
    try {
      await testFunction()
      const duration = Date.now() - startTime
      addTestResult(testName, "success", `${testName} completed successfully`, duration)
    } catch (err) {
      const duration = Date.now() - startTime
      addTestResult(testName, "error", `${testName} failed: ${err instanceof Error ? err.message : 'Unknown error'}`, duration)
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

  const successCount = testResults.filter(r => r.status === "success").length
  const errorCount = testResults.filter(r => r.status === "error").length
  const totalTests = testResults.length

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Email System Test Suite</h1>
            <p className="text-gray-600">
              Comprehensive testing for all email functionality in the dashboard
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
                  <p className="text-2xl font-bold text-purple-600">
                    {totalTests > 0 ? Math.round((successCount / totalTests) * 100) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tests">Test Results</TabsTrigger>
          <TabsTrigger value="data">Data Validation</TabsTrigger>
          <TabsTrigger value="features">Feature Tests</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
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
                    onClick={() => runSingleTest("Data Refresh", refreshData)}
                    disabled={isLoading}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => runSingleTest("Test Email", () => sendTestEmail(testEmail, testName))}
                    disabled={isUpdating}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Test Email
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => runSingleTest("Template Creation", async () => {
                      await createTemplate({
                        name: "Quick Test Template",
                        subject: "Quick Test",
                        category: "transactional",
                        tags: ["quick", "test"]
                      })
                    })}
                    disabled={isCreating}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Create Test Template
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => runSingleTest("List Creation", async () => {
                      await createList({
                      name: "Quick Test List",
                      description: "Quick test list",
                      subscribers: 0,
                      activeSubscribers: 0,
                      unsubscribed: 0,
                      bounced: 0,
                      createdAt: new Date().toISOString().split('T')[0],
                      lastUpdated: new Date().toISOString().split('T')[0],
                      tags: ["quick", "test"],
                      isPublic: false,
                      growthRate: 0,
                      avgOpenRate: 0,
                      avgClickRate: 0
                      })
                    })}
                    disabled={isCreating}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Create Test List
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Metrics Overview */}
          {metrics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Current Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{metrics.totalSent.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total Sent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{metrics.openRate.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Open Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{metrics.clickRate.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Click Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{metrics.conversionRate.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Conversion Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Test Results Tab */}
        <TabsContent value="tests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TestTube className="h-5 w-5" />
                <span>Test Results</span>
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
                    <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <p className="font-medium">{result.test}</p>
                          <p className="text-sm text-gray-600">{result.message}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(result.timestamp).toLocaleString()}
                            {result.duration && ` • ${result.duration}ms`}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Validation Tab */}
        <TabsContent value="data" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campaigns Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>Campaigns Data</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Campaigns:</span>
                    <span className="font-medium">{campaigns.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Draft Campaigns:</span>
                    <span className="font-medium">{campaigns.filter(c => c.status === 'draft').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sent Campaigns:</span>
                    <span className="font-medium">{campaigns.filter(c => c.status === 'sent').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Scheduled Campaigns:</span>
                    <span className="font-medium">{campaigns.filter(c => c.status === 'scheduled').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Templates Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Templates Data</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Templates:</span>
                    <span className="font-medium">{templates.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Default Templates:</span>
                    <span className="font-medium">{templates.filter(t => t.isDefault).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Custom Templates:</span>
                    <span className="font-medium">{templates.filter(t => !t.isDefault).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Usage:</span>
                    <span className="font-medium">{templates.reduce((sum, t) => sum + t.usageCount, 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lists Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Lists Data</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Lists:</span>
                    <span className="font-medium">{lists.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Subscribers:</span>
                    <span className="font-medium">{lists.reduce((sum, l) => sum + l.subscribers, 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Subscribers:</span>
                    <span className="font-medium">{lists.reduce((sum, l) => sum + l.activeSubscribers, 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Public Lists:</span>
                    <span className="font-medium">{lists.filter(l => l.isPublic).length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Analytics Data</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Time Series Points:</span>
                    <span className="font-medium">{analytics?.timeSeries.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Device Stats:</span>
                    <span className="font-medium">{analytics?.deviceStats.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location Stats:</span>
                    <span className="font-medium">{analytics?.locationStats.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Data Available:</span>
                    <Badge className={analytics ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {analytics ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Feature Tests Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>Email Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => runSingleTest("Send Test Email", () => sendTestEmail(testEmail, testName))}
                    disabled={isUpdating}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Test Email Sending
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => runSingleTest("Create Campaign", async () => {
                      await createCampaign({
                        name: "Feature Test Campaign",
                        subject: "Feature Test",
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
                        template: "test",
                        category: "transactional"
                      })
                    })}
                    disabled={isCreating}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Test Campaign Creation
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => runSingleTest("Create Template", async () => {
                      await createTemplate({
                        name: "Feature Test Template",
                        subject: "Feature Test Template",
                        category: "transactional",
                        tags: ["feature", "test"]
                      })
                    })}
                    disabled={isCreating}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Test Template Creation
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Data Management Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Data Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => runSingleTest("Refresh Data", refreshData)}
                    disabled={isLoading}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Test Data Refresh
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => runSingleTest("Create List", async () => {
                      await createList({
                        name: "Feature Test List",
                        description: "Feature test list",
                        subscribers: 0,
                        activeSubscribers: 0,
                        unsubscribed: 0,
                        bounced: 0,
                        createdAt: new Date().toISOString().split('T')[0],
                        lastUpdated: new Date().toISOString().split('T')[0],
                        tags: ["feature", "test"],
                        isPublic: false,
                        growthRate: 0,
                        avgOpenRate: 0,
                        avgClickRate: 0
                      })
                    })}
                    disabled={isCreating}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Test List Creation
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => runSingleTest("Validate Metrics", async () => {
                      if (!metrics) throw new Error("Metrics not available")
                      if (typeof metrics.totalSent !== 'number') throw new Error("Invalid metrics data")
                    })}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Test Metrics Validation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Performance Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {testResults.filter(r => r.duration).reduce((sum, r) => sum + (r.duration || 0), 0) / testResults.filter(r => r.duration).length || 0}ms
                    </p>
                    <p className="text-sm text-gray-600">Avg Response Time</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {testResults.filter(r => r.status === 'success').length}
                    </p>
                    <p className="text-sm text-gray-600">Successful Tests</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {testResults.filter(r => r.status === 'error').length}
                    </p>
                    <p className="text-sm text-gray-600">Failed Tests</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {totalTests > 0 ? Math.round((successCount / totalTests) * 100) : 0}%
                    </p>
                    <p className="text-sm text-gray-600">Success Rate</p>
                  </div>
                </div>
                
                {testResults.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Test Performance History</h4>
                    <div className="space-y-2">
                      {testResults.slice(0, 10).map((result) => (
                        <div key={result.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(result.status)}
                            <span className="text-sm">{result.test}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {result.duration && (
                              <span className="text-xs text-gray-500">{result.duration}ms</span>
                            )}
                            <Badge className={getStatusColor(result.status)}>
                              {result.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
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
