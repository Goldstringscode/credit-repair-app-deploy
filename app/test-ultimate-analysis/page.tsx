"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"

interface UltimateAnalysisResult {
  success: boolean
  analysis?: any
  processing_notes?: string[]
  stats?: any
  validation_results?: any
  raw_sections?: string[]
  error?: string
  details?: any
}

export default function UltimateAnalysisTest() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<UltimateAnalysisResult | null>(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<string>("checking")

  // Check API status on component mount
  useEffect(() => {
    checkApiStatus()
  }, [])

  const checkApiStatus = async () => {
    try {
      const response = await fetch("/api/v4/test")
      if (response.ok) {
        const data = await response.json()
        setApiStatus("online")
        console.log("✅ API Status:", data)
      } else {
        setApiStatus("offline")
        console.error("❌ API Status check failed:", response.status)
      }
    } catch (error) {
      setApiStatus("offline")
      console.error("❌ API Status check error:", error)
    }
  }

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
      setProgress((prev) => Math.min(prev + 8, 90))
    }, 800)

    try {
      const formData = new FormData()
      formData.append("file", file)

      console.log("🚀 Starting ultimate analysis for:", file.name)

      const response = await fetch("/api/v4/upload/ultimate-analysis", {
        method: "POST",
        body: formData,
      })

      console.log("📡 Response status:", response.status)
      console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Response not ok:", errorText)

        // Try to parse as JSON first, fallback to text
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText }
        }

        throw new Error(`HTTP ${response.status}: ${errorData.error || errorText}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await response.text()
        console.error("❌ Invalid content type:", contentType)
        console.error("❌ Response text:", responseText.substring(0, 500))
        throw new Error(`Expected JSON response, got: ${contentType}. Response: ${responseText.substring(0, 200)}...`)
      }

      const data = await response.json()
      console.log("✅ Ultimate analysis completed:", data)

      setResult(data)
      setProgress(100)
    } catch (error) {
      console.error("❌ Ultimate analysis error:", error)
      const errorMessage = error instanceof Error ? error.message : "Analysis failed"
      setError(errorMessage)
      setResult({
        success: false,
        error: errorMessage,
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
        <h1 className="text-4xl font-bold">🎯 Ultimate Credit Report Analysis</h1>
        <p className="text-muted-foreground text-lg">
          The most accurate multi-pass analysis system with 5-stage extraction and validation
        </p>
        <div className="flex justify-center gap-2 mt-4">
          <Badge variant="outline">Multi-Pass Extraction</Badge>
          <Badge variant="outline">Bureau-Specific Parsing</Badge>
          <Badge variant="outline">Context Validation</Badge>
          <Badge variant="outline">Fuzzy Matching</Badge>
          <Badge variant={apiStatus === "online" ? "default" : apiStatus === "offline" ? "destructive" : "secondary"}>
            API: {apiStatus}
          </Badge>
        </div>
      </div>

      {apiStatus === "offline" && (
        <Alert variant="destructive">
          <AlertDescription>
            ⚠️ API endpoint is not responding. Please check that the server is running and the route exists.
            <Button variant="outline" size="sm" onClick={checkApiStatus} className="ml-2 bg-transparent">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>📄 Upload Credit Report for Ultimate Analysis</CardTitle>
          <CardDescription>
            Advanced 5-stage analysis: Section-based → Pattern-based → Contextual → Bureau-specific → Fuzzy matching
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <input type="file" accept=".pdf,.txt" onChange={handleFileChange} className="flex-1 p-2 border rounded" />
            <Button onClick={handleUpload} disabled={!file || isUploading || apiStatus !== "online"} size="lg">
              {isUploading ? "🔄 Ultimate Analysis..." : "🎯 Start Ultimate Analysis"}
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
                <span>Running multi-pass analysis...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              <div className="text-xs text-muted-foreground">
                {progress < 20 && "🔍 Extracting text and identifying sections..."}
                {progress >= 20 && progress < 40 && "🎯 Running pattern-based extraction..."}
                {progress >= 40 && progress < 60 && "🧠 Performing contextual analysis..."}
                {progress >= 60 && progress < 80 && "🏦 Applying bureau-specific parsing..."}
                {progress >= 80 && progress < 95 && "🔧 Fuzzy matching and validation..."}
                {progress >= 95 && "✅ Finalizing results..."}
              </div>
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
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">📊 Overview</TabsTrigger>
            <TabsTrigger value="scores">🎯 Scores</TabsTrigger>
            <TabsTrigger value="accounts">💳 Accounts</TabsTrigger>
            <TabsTrigger value="negative">⚠️ Negative</TabsTrigger>
            <TabsTrigger value="validation">✅ Validation</TabsTrigger>
            <TabsTrigger value="process">🔧 Process</TabsTrigger>
            <TabsTrigger value="debug">🐛 Debug</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {result.success ? "✅" : "❌"} Ultimate Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {result.success ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-3xl font-bold text-blue-600">{result.stats?.total_scores || 0}</div>
                          <div className="text-sm text-blue-600">Credit Scores</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-3xl font-bold text-green-600">{result.stats?.total_accounts || 0}</div>
                          <div className="text-sm text-green-600">Accounts Found</div>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <div className="text-3xl font-bold text-red-600">
                            {result.stats?.total_negative_items || 0}
                          </div>
                          <div className="text-sm text-red-600">Negative Items</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-3xl font-bold text-purple-600">{result.stats?.total_inquiries || 0}</div>
                          <div className="text-sm text-purple-600">Inquiries</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-semibold">📈 Quality Metrics</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-gray-600">Overall Confidence</div>
                            <div className="text-2xl font-bold text-green-600">
                              {((result.stats?.confidence_score || 0) * 100).toFixed(1)}%
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Data Quality</div>
                            <div className="text-2xl font-bold text-blue-600">
                              {((result.analysis?.data_quality_score || 0) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">Bureau: {result.analysis?.bureau || "Unknown"}</Badge>
                          <Badge variant="outline">
                            High Confidence: {result.stats?.high_confidence_accounts || 0} accounts
                          </Badge>
                          <Badge variant="outline">Sections: {result.analysis?.sections_identified || 0}</Badge>
                        </div>
                      </div>
                    </>
                  ) : (
                    <Alert variant="destructive">
                      <AlertDescription>❌ Ultimate analysis failed: {result.error}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🔧 Extraction Methods Used</CardTitle>
                </CardHeader>
                <CardContent>
                  {result.stats?.extraction_methods_used ? (
                    <div className="space-y-2">
                      {result.stats.extraction_methods_used.map((method: string, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium">{method}</span>
                          <Badge variant="secondary">
                            {result.analysis?.accounts?.filter((a: any) => a.extraction_method === method).length || 0}{" "}
                            accounts
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No extraction methods data available</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="scores">
            <Card>
              <CardHeader>
                <CardTitle>🎯 Credit Scores Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {result.analysis?.credit_scores?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.analysis.credit_scores.map((score: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{score.model}</div>
                            {score.version && <div className="text-sm text-gray-600">Version {score.version}</div>}
                            <div className="text-sm text-gray-600">{score.bureau}</div>
                            {score.context && <div className="text-xs text-gray-500 mt-1">{score.context}</div>}
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-blue-600">{score.score}</div>
                            <Badge variant="outline" className="text-xs">
                              {(score.confidence * 100).toFixed(0)}% confident
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
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
                <CardTitle>💳 Comprehensive Accounts Analysis</CardTitle>
                <CardDescription>Accounts extracted using multiple methods with confidence scoring</CardDescription>
              </CardHeader>
              <CardContent>
                {result.analysis?.accounts?.length > 0 ? (
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {result.analysis.accounts.map((account: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium">{account.creditor_name}</div>
                              <div className="text-sm text-gray-600">
                                ****{account.account_number_last_4} • {account.account_type}
                              </div>
                              <div className="text-sm text-gray-600">Status: {account.account_status}</div>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  {account.extraction_method}
                                </Badge>
                                <Badge variant={account.confidence > 0.8 ? "default" : "outline"} className="text-xs">
                                  {(account.confidence * 100).toFixed(0)}% confidence
                                </Badge>
                              </div>
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
                          {account.raw_text && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                              Raw: {account.raw_text.substring(0, 100)}...
                            </div>
                          )}
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

          <TabsContent value="negative">
            <Card>
              <CardHeader>
                <CardTitle>⚠️ Negative Items</CardTitle>
              </CardHeader>
              <CardContent>
                {result.analysis?.negative_items?.length > 0 ? (
                  <ScrollArea className="h-60">
                    <div className="space-y-3">
                      {result.analysis.negative_items.map((item: any, index: number) => (
                        <div key={index} className="p-3 border rounded-lg bg-red-50">
                          <div className="font-medium text-red-800">{item.type}</div>
                          <div className="text-sm">{item.creditor_name}</div>
                          <div className="text-sm text-gray-600">Amount: ${item.amount?.toLocaleString() || "N/A"}</div>
                          <div className="text-sm text-gray-600">Status: {item.status}</div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <Alert>
                    <AlertDescription>✅ No negative items found</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="validation">
            <Card>
              <CardHeader>
                <CardTitle>✅ Data Validation Results</CardTitle>
              </CardHeader>
              <CardContent>
                {result.validation_results ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">
                          {result.validation_results.scores_valid || 0} / {result.validation_results.scores_total || 0}
                        </div>
                        <div className="text-sm text-green-600">Valid Credit Scores</div>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">
                          {result.validation_results.accounts_valid || 0} /{" "}
                          {result.validation_results.accounts_total || 0}
                        </div>
                        <div className="text-sm text-blue-600">Valid Accounts</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Overall Quality Score:</span>
                        <Badge variant="outline">
                          {((result.validation_results.overall_quality || 0) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Extraction Confidence:</span>
                        <Badge variant="outline">
                          {((result.validation_results.confidence || 0) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <AlertDescription>No validation data available</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="process">
            <Card>
              <CardHeader>
                <CardTitle>🔧 Processing Details</CardTitle>
                <CardDescription>Step-by-step analysis process with detailed notes</CardDescription>
              </CardHeader>
              <CardContent>
                {result.processing_notes ? (
                  <ScrollArea className="h-96 border rounded p-4">
                    <div className="space-y-1">
                      {result.processing_notes.map((note, index) => (
                        <div key={index} className="text-sm font-mono flex items-start gap-2">
                          <span className="text-gray-400 text-xs mt-1">{index + 1}.</span>
                          <span>{note}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <Alert>
                    <AlertDescription>No processing details available</AlertDescription>
                  </Alert>
                )}

                {result.raw_sections && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">📑 Document Sections Identified:</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.raw_sections.map((section: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {section}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="debug">
            <Card>
              <CardHeader>
                <CardTitle>🐛 Debug Information</CardTitle>
                <CardDescription>Complete analysis results for debugging</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 border rounded p-4">
                  <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
