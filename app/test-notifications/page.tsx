"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  Bell, 
  Settings,
  Play,
  Pause,
  Volume2,
  Calendar,
  BarChart3,
  Star,
  Zap,
  User
} from "lucide-react"

interface TestResult {
  testName: string
  status: "PASS" | "FAIL" | "ERROR" | "SKIP"
  message: string
  details?: any
  error?: string
  duration?: number
}

interface TestResponse {
  success: boolean
  timestamp: string
  testType: string
  userId: string
  overall: {
    status: "PASS" | "FAIL"
    message: string
    summary: {
      total: number
      passed: number
      failed: number
      errors: number
      skipped: number
      totalDuration: number
    }
  }
  results: TestResult[]
  recommendations: string[]
}

export default function NotificationTestPage() {
  const [testResults, setTestResults] = useState<TestResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTestType, setSelectedTestType] = useState<string>("all")
  const [userId, setUserId] = useState<string>("test-user-123")
  const [consoleOutput, setConsoleOutput] = useState<string[]>([])

  // Capture console output
  useEffect(() => {
    const originalLog = console.log
    const originalError = console.error
    const originalWarn = console.warn

    console.log = (...args) => {
      setConsoleOutput(prev => [...prev, `[LOG] ${args.join(' ')}`])
      originalLog(...args)
    }

    console.error = (...args) => {
      setConsoleOutput(prev => [...prev, `[ERROR] ${args.join(' ')}`])
      originalError(...args)
    }

    console.warn = (...args) => {
      setConsoleOutput(prev => [...prev, `[WARN] ${args.join(' ')}`])
      originalWarn(...args)
    }

    return () => {
      console.log = originalLog
      console.error = originalError
      console.warn = originalWarn
    }
  }, [])

  const runTests = async (testType: string = selectedTestType) => {
    setLoading(true)
    setError(null)
    setConsoleOutput([])
    console.log(`🚀 Starting notification tests: ${testType}`)

    try {
      const response = await fetch("/api/notifications/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testType,
          userId
        })
      })

      const data = await response.json()
      console.log("📊 Test results received:", data)

      if (data.success) {
        setTestResults(data)
        console.log(`✅ Tests completed: ${data.overall.status}`)
      } else {
        throw new Error(data.error || "Test failed with no results")
      }
    } catch (err) {
      console.error("❌ Test error:", err)
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PASS":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "FAIL":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "ERROR":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "SKIP":
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      PASS: "default",
      FAIL: "destructive",
      ERROR: "destructive",
      SKIP: "secondary",
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || "secondary"}>{status}</Badge>
  }

  const testTypes = [
    { id: "all", name: "All Tests", icon: <Bell className="h-4 w-4" />, description: "Run all notification tests" },
    { id: "basic", name: "Basic", icon: <Bell className="h-4 w-4" />, description: "Basic notification creation" },
    { id: "templates", name: "Templates", icon: <Settings className="h-4 w-4" />, description: "Template system" },
    { id: "scheduling", name: "Scheduling", icon: <Calendar className="h-4 w-4" />, description: "Scheduled notifications" },
    { id: "analytics", name: "Analytics", icon: <BarChart3 className="h-4 w-4" />, description: "Analytics tracking" },
    { id: "sound", name: "Sound", icon: <Volume2 className="h-4 w-4" />, description: "Sound system" },
    { id: "priority", name: "Priority", icon: <Star className="h-4 w-4" />, description: "Priority system" },
    { id: "realtime", name: "Real-time", icon: <Zap className="h-4 w-4" />, description: "Real-time delivery" },
    { id: "preferences", name: "Preferences", icon: <User className="h-4 w-4" />, description: "User preferences" }
  ]

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Notification System Tests
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive testing suite for the notification system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => runTests()} 
            disabled={loading} 
            size="lg"
            className="min-w-[120px]"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Tests
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Test Configuration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
          <CardDescription>Configure test parameters and select test types</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter user ID for testing"
              />
            </div>
            <div>
              <Label htmlFor="testType">Test Type</Label>
              <select
                id="testType"
                value={selectedTestType}
                onChange={(e) => setSelectedTestType(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {testTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name} - {type.description}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {testTypes.map(type => (
              <Button
                key={type.id}
                variant={selectedTestType === type.id ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedTestType(type.id)
                  runTests(type.id)
                }}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {type.icon}
                {type.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700 font-medium">Test Error</span>
            </div>
            <p className="text-red-600 mt-2">{error}</p>
            <div className="mt-4">
              <Button onClick={() => runTests()} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="results" className="space-y-4">
        <TabsList>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="console">Console Output</TabsTrigger>
          <TabsTrigger value="details">Detailed Results</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4">
          {testResults && (
            <>
              {/* Overall Status */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      {getStatusIcon(testResults.overall.status)}
                      <span>Overall Test Status</span>
                    </CardTitle>
                    {getStatusBadge(testResults.overall.status)}
                  </div>
                  <CardDescription>
                    Last run: {new Date(testResults.timestamp).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-lg">{testResults.overall.message}</p>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {testResults.overall.summary.passed}
                      </div>
                      <div className="text-sm text-green-700">Passed</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {testResults.overall.summary.failed}
                      </div>
                      <div className="text-sm text-red-700">Failed</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {testResults.overall.summary.errors}
                      </div>
                      <div className="text-sm text-red-700">Errors</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {testResults.overall.summary.skipped}
                      </div>
                      <div className="text-sm text-yellow-700">Skipped</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {testResults.overall.summary.totalDuration}ms
                      </div>
                      <div className="text-sm text-blue-700">Duration</div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {testResults.recommendations && testResults.recommendations.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">Recommendations:</h3>
                      <ul className="space-y-1">
                        {testResults.recommendations.map((rec, index) => (
                          <li key={index} className="text-blue-800 text-sm flex items-start">
                            <span className="mr-2">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Individual Test Results */}
              <div className="grid gap-4 md:grid-cols-2">
                {testResults.results.map((result, index) => (
                  <Card key={index} className={result.status === "FAIL" ? "border-red-200" : ""}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2 text-lg">
                          {getStatusIcon(result.status)}
                          <span>{result.testName}</span>
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(result.status)}
                          {result.duration && (
                            <Badge variant="outline">{result.duration}ms</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-3">{result.message}</p>

                      {result.error && (
                        <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                          <p className="text-red-700 font-medium text-sm">Error Details:</p>
                          <p className="text-red-600 text-sm mt-1 font-mono">{result.error}</p>
                        </div>
                      )}

                      {result.details && (
                        <div className="bg-gray-50 border border-gray-200 rounded p-3">
                          <p className="font-medium mb-2 text-sm">Details:</p>
                          <div className="text-xs text-gray-600 space-y-1">
                            {typeof result.details === "object" ? (
                              Object.entries(result.details).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="font-medium">{key}:</span>
                                  <span className="text-right ml-2">
                                    {typeof value === "object" ? JSON.stringify(value) : String(value)}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <pre className="whitespace-pre-wrap">{JSON.stringify(result.details, null, 2)}</pre>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {loading && !testResults && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center space-y-4 py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                  <div className="text-center">
                    <p className="text-lg font-medium">Running notification tests...</p>
                    <p className="text-sm text-muted-foreground">This may take a few moments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="console" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Console Output</CardTitle>
              <CardDescription>Real-time console output from the notification tests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
                {consoleOutput.length === 0 ? (
                  <div className="text-gray-500">No console output yet. Run tests to see output.</div>
                ) : (
                  consoleOutput.map((line, index) => (
                    <div key={index} className="mb-1">
                      {line}
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setConsoleOutput([])}
                >
                  Clear Console
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => runTests()}
                  disabled={loading}
                >
                  Run Tests Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Test Information</CardTitle>
              <CardDescription>Comprehensive information about each test type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testTypes.map(type => (
                  <div key={type.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {type.icon}
                      <h3 className="font-semibold">{type.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{type.description}</p>
                    <div className="text-xs text-gray-500">
                      Test ID: {type.id}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator className="my-8" />

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>Common issues and solutions for notification testing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Tests Failing?</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Check the console output tab for detailed error messages and ensure all notification services are properly configured.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">No Console Output?</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Make sure you're running the tests and check that the notification API endpoints are accessible.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Real-time Tests Not Working?</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Ensure the Server-Sent Events endpoint is properly configured and the browser supports SSE.
            </p>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/dashboard/notifications" className="flex items-center">
                Go to Notifications
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/test-system" className="flex items-center">
                System Tests
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
