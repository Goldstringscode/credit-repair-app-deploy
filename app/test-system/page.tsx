"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, AlertCircle, Clock, RefreshCw, ExternalLink } from "lucide-react"

interface TestResult {
  status: "PASS" | "FAIL" | "ERROR" | "SKIP"
  message: string
  details?: any
  error?: string
}

interface SystemTestResults {
  timestamp: string
  tests: Record<string, TestResult>
  overall: {
    status: "PASS" | "FAIL"
    message: string
    summary: {
      total: number
      passed: number
      failed: number
      errors: number
      skipped: number
    }
    recommendations: string[]
  }
}

export default function SystemTestPage() {
  const [results, setResults] = useState<SystemTestResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runTests = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/test/system", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      // Even if response is not ok, we might have partial results
      if (data.tests) {
        setResults(data)
      } else {
        throw new Error(data.message || "Test failed with no results")
      }
    } catch (err) {
      console.error("Test error:", err)
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runTests()
  }, [])

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

  const formatTestName = (testName: string) => {
    return testName
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">System Status</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive system health check for the Credit Repair AI application
          </p>
        </div>
        <Button onClick={runTests} disabled={loading} size="lg">
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Run Tests
            </>
          )}
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700 font-medium">Test Error</span>
            </div>
            <p className="text-red-600 mt-2">{error}</p>
            <div className="mt-4">
              <Button onClick={runTests} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {results && (
        <>
          {/* Overall Status */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  {getStatusIcon(results.overall.status)}
                  <span>Overall System Status</span>
                </CardTitle>
                {getStatusBadge(results.overall.status)}
              </div>
              <CardDescription>Last run: {new Date(results.timestamp).toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-lg">{results.overall.message}</p>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{results.overall.summary.passed}</div>
                  <div className="text-sm text-green-700">Passed</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{results.overall.summary.failed}</div>
                  <div className="text-sm text-red-700">Failed</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{results.overall.summary.errors}</div>
                  <div className="text-sm text-red-700">Errors</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{results.overall.summary.skipped}</div>
                  <div className="text-sm text-yellow-700">Skipped</div>
                </div>
              </div>

              {/* Recommendations */}
              {results.overall.recommendations && results.overall.recommendations.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Recommendations:</h3>
                  <ul className="space-y-1">
                    {results.overall.recommendations.map((rec, index) => (
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

          {/* Individual Tests */}
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(results.tests).map(([testName, testResult]) => (
              <Card key={testName} className={testResult.status === "FAIL" ? "border-red-200" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      {getStatusIcon(testResult.status)}
                      <span>{formatTestName(testName)}</span>
                    </CardTitle>
                    {getStatusBadge(testResult.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-3">{testResult.message}</p>

                  {testResult.status === "SKIP" && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
                      <p className="text-yellow-700 font-medium text-sm">Test Skipped</p>
                      <p className="text-yellow-600 text-sm mt-1">
                        This test was skipped due to rate limits or configuration. This is normal and doesn't affect system functionality.
                      </p>
                    </div>
                  )}

                  {testResult.error && (
                    <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                      <p className="text-red-700 font-medium text-sm">Error Details:</p>
                      <p className="text-red-600 text-sm mt-1 font-mono">{testResult.error}</p>
                    </div>
                  )}

                  {testResult.details && (
                    <div className="bg-gray-50 border border-gray-200 rounded p-3">
                      <p className="font-medium mb-2 text-sm">Details:</p>
                      <div className="text-xs text-gray-600 space-y-1">
                        {typeof testResult.details === "object" ? (
                          Object.entries(testResult.details).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="font-medium">{key}:</span>
                              <span className="text-right ml-2">
                                {typeof value === "object" ? JSON.stringify(value) : String(value)}
                              </span>
                            </div>
                          ))
                        ) : (
                          <pre className="whitespace-pre-wrap">{JSON.stringify(testResult.details, null, 2)}</pre>
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

      {loading && !results && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
              <div className="text-center">
                <p className="text-lg font-medium">Running system tests...</p>
                <p className="text-sm text-muted-foreground">This may take a few moments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator className="my-8" />

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>Common issues and solutions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Database Connection Failed?</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Make sure your Neon database URL is correctly set in your .env.local file.
            </p>
            <code className="text-xs bg-gray-100 p-1 rounded">
              NEON_NEON_NEON_NEON_NEON_DATABASE_URL=postgresql://...
            </code>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Missing Database Tables?</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Run the database schema from scripts/upload-system-schema.sql in your Neon console.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">OpenAI API Issues?</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Verify your OpenAI API key starts with 'sk-' and has sufficient credits.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Rate Limit Exceeded?</h4>
            <p className="text-sm text-muted-foreground mb-2">
              The system test limits OpenAI API calls to 3 per hour to prevent rate limiting. 
              If you see "Too many requests" errors, wait an hour before running tests again.
            </p>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/test-upload" className="flex items-center">
                Test Upload System
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/dashboard" className="flex items-center">
                Go to Dashboard
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
