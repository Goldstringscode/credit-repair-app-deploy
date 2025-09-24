"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"

interface AdvancedAnalysisResult {
  success: boolean
  analysis?: any
  processing_notes?: string[]
  stats?: any
  error?: string
  details?: any
}

export default function AdvancedAnalysisTest() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<AdvancedAnalysisResult | null>(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
      setProgress(0)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setResult(null)
    setProgress(0)
    setError(null)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90))
    }, 500)

    try {
      const formData = new FormData()
      formData.append("file", file)

      console.log("🚀 Uploading file:", file.name)

      const response = await fetch("/api/v3/upload/advanced-analysis", {
        method: "POST",
        body: formData,
      })

      console.log("📡 Response status:", response.status)
      console.log("📡 Response headers:", response.headers)

      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Response not ok:", errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      // Check content type
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await response.text()
        console.error("❌ Invalid content type:", contentType)
        console.error("❌ Response text:", responseText)
        throw new Error(`Expected JSON response, got: ${contentType}`)
      }

      const data = await response.json()
      console.log("✅ Parsed JSON response:", data)

      setResult(data)
      setProgress(100)
    } catch (error) {
      console.error("❌ Upload error:", error)
      setError(error instanceof Error ? error.message : "Upload failed")
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      })
      setProgress(100)
    } finally {
      clearInterval(progressInterval)
      setIsUploading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">🚀 Advanced AI Credit Report Analysis</h1>
        <p className="text-muted-foreground">
          Multi-stage AI-powered analysis with format-specific parsing and validation
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>📄 Upload Credit Report</CardTitle>
          <CardDescription>
            Advanced analysis with enhanced parsing, format detection, and comprehensive validation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <input type="file" accept=".pdf,.txt" onChange={handleFileChange} className="flex-1 p-2 border rounded" />
            <Button onClick={handleUpload} disabled={!file || isUploading}>
              {isUploading ? "🔄 Analyzing..." : "🚀 Advanced Analysis"}
            </Button>
          </div>

          {file && (
            <div className="text-sm text-muted-foreground">
              Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </div>
          )}

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>❌ Error: {error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {result && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">📊 Overview</TabsTrigger>
            <TabsTrigger value="scores">🎯 Scores</TabsTrigger>
            <TabsTrigger value="accounts">💳 Accounts</TabsTrigger>
            <TabsTrigger value="process">🔧 Process</TabsTrigger>
            <TabsTrigger value="debug">🐛 Debug</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result.success ? "✅" : "❌"} Analysis Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {result.success ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{result.stats?.total_scores || 0}</div>
                        <div className="text-sm text-blue-600">Credit Scores</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{result.stats?.total_accounts || 0}</div>
                        <div className="text-sm text-green-600">Accounts</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{result.stats?.total_negative_items || 0}</div>
                        <div className="text-sm text-red-600">Negative Items</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{result.stats?.total_inquiries || 0}</div>
                        <div className="text-sm text-purple-600">Inquiries</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold">📈 Quality Metrics</h3>
                      <div className="flex gap-4">
                        <Badge variant="outline">
                          Confidence: {((result.stats?.confidence_score || 0) * 100).toFixed(1)}%
                        </Badge>
                        <Badge variant="outline">
                          Data Quality: {((result.analysis?.data_quality_score || 0) * 100).toFixed(1)}%
                        </Badge>
                        <Badge variant="outline">Bureau: {result.analysis?.bureau || "Unknown"}</Badge>
                      </div>
                    </div>
                  </>
                ) : (
                  <Alert variant="destructive">
                    <AlertDescription>❌ Analysis failed: {result.error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scores">
            <Card>
              <CardHeader>
                <CardTitle>🎯 Credit Scores Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {result.analysis?.credit_scores?.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.analysis.credit_scores.map((score: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{score.model}</div>
                              {score.version && <div className="text-sm text-gray-600">Version {score.version}</div>}
                              <div className="text-sm text-gray-600">{score.bureau}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">{score.score}</div>
                              <Badge variant="outline" className="text-xs">
                                {(score.confidence * 100).toFixed(0)}% confident
                              </Badge>
                            </div>
                          </div>
                          {score.date && <div className="text-xs text-gray-500 mt-2">Date: {score.date}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <AlertDescription>No credit scores found</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts">
            <Card>
              <CardHeader>
                <CardTitle>💳 Accounts Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {result.analysis?.accounts?.length > 0 ? (
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {result.analysis.accounts.map((account: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{account.creditor_name}</div>
                              <div className="text-sm text-gray-600">
                                ****{account.account_number_last_4} • {account.account_type}
                              </div>
                              <div className="text-sm text-gray-600">Status: {account.account_status}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">Balance: ${account.balance?.toLocaleString() || "N/A"}</div>
                              {account.credit_limit && (
                                <div className="text-sm text-gray-600">
                                  Limit: ${account.credit_limit.toLocaleString()}
                                </div>
                              )}
                              <Badge
                                variant={account.payment_status === "Current" ? "default" : "destructive"}
                                className="text-xs mt-1"
                              >
                                {account.payment_status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <Alert>
                    <AlertDescription>No accounts found</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="process">
            <Card>
              <CardHeader>
                <CardTitle>🔧 Processing Details</CardTitle>
              </CardHeader>
              <CardContent>
                {result.processing_notes ? (
                  <ScrollArea className="h-96 border rounded p-4">
                    <div className="space-y-1">
                      {result.processing_notes.map((note, index) => (
                        <div key={index} className="text-sm font-mono">
                          {note}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <Alert>
                    <AlertDescription>No processing details available</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="debug">
            <Card>
              <CardHeader>
                <CardTitle>🐛 Debug Information</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 border rounded p-4">
                  <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
