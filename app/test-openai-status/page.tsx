"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, Loader2, RefreshCw } from "lucide-react"

interface OpenAIStatus {
  available: boolean
  error?: string
  details?: {
    hasApiKey: boolean
    keyFormat: string
    testResult?: string
    usage?: {
      total_tokens?: number
      total_cost?: string
    }
  }
}

export default function OpenAIStatusPage() {
  const [status, setStatus] = useState<OpenAIStatus | null>(null)
  const [loading, setLoading] = useState(false)

  const checkStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test/openai-status")
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      setStatus({
        available: false,
        error: "Failed to check OpenAI status",
        details: {
          hasApiKey: false,
          keyFormat: "unknown",
        },
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">OpenAI API Status</h1>
          <p className="text-muted-foreground">Check your OpenAI API configuration and usage</p>
        </div>
        <Button onClick={checkStatus} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh Status
        </Button>
      </div>

      {status && (
        <div className="space-y-4">
          {/* Main Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {status.available ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                OpenAI API Status
              </CardTitle>
              <CardDescription>
                {status.available ? "Your OpenAI API is working correctly" : "There are issues with your OpenAI API"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={status.available ? "default" : "destructive"}>
                  {status.available ? "Available" : "Unavailable"}
                </Badge>
                {status.details?.hasApiKey && <Badge variant="outline">API Key: {status.details.keyFormat}</Badge>}
              </div>

              {status.error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{status.error}</AlertDescription>
                </Alert>
              )}

              {status.details?.testResult && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Test Result:</strong> {status.details.testResult}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Configuration Details */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium">API Key Present</div>
                  <div className="flex items-center gap-2">
                    {status.details?.hasApiKey ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">{status.details?.hasApiKey ? "Yes" : "No"}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Key Format</div>
                  <div className="text-sm text-muted-foreground">{status.details?.keyFormat || "Unknown"}</div>
                </div>
              </div>

              {status.details?.usage && (
                <div className="pt-4 border-t">
                  <div className="text-sm font-medium mb-2">Usage Information</div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {status.details.usage.total_tokens && (
                      <div>
                        <span className="text-muted-foreground">Total Tokens:</span>{" "}
                        {status.details.usage.total_tokens.toLocaleString()}
                      </div>
                    )}
                    {status.details.usage.total_cost && (
                      <div>
                        <span className="text-muted-foreground">Estimated Cost:</span> {status.details.usage.total_cost}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          {!status.available && (
            <Card>
              <CardHeader>
                <CardTitle>Troubleshooting Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                    <div>
                      <div className="font-medium">Check your OpenAI API key</div>
                      <div className="text-muted-foreground">
                        Make sure you have a valid OpenAI API key in your environment variables (OPENAI_API_KEY)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <div>
                      <div className="font-medium">Check your billing</div>
                      <div className="text-muted-foreground">
                        Visit{" "}
                        <a
                          href="https://platform.openai.com/account/billing"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          OpenAI Billing Dashboard
                        </a>{" "}
                        to ensure you have credits available
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      3
                    </div>
                    <div>
                      <div className="font-medium">Check usage limits</div>
                      <div className="text-muted-foreground">
                        Visit{" "}
                        <a
                          href="https://platform.openai.com/account/limits"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          OpenAI Usage Limits
                        </a>{" "}
                        to see if you've hit any rate limits
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      4
                    </div>
                    <div>
                      <div className="font-medium">Use the fallback system</div>
                      <div className="text-muted-foreground">
                        While fixing OpenAI, you can use the pattern-based upload system which doesn't require OpenAI
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success Actions */}
          {status.available && (
            <Card>
              <CardHeader>
                <CardTitle>✅ OpenAI is Working!</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Your OpenAI API is configured correctly. You can now use the AI-powered credit report analysis.
                  </p>
                  <div className="flex gap-2">
                    <Button asChild>
                      <a href="/dashboard/reports/upload">Upload Credit Report</a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href="/dashboard">Go to Dashboard</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {loading && !status && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground">Checking OpenAI API status...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
