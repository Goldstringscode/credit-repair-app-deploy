"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AnalysisResult {
  success: boolean
  analysis?: any
  stats?: any
  error?: string
  debug_info?: {
    text_sample: string
    text_length: number
    score_matches: any[]
    account_matches: any[]
    processing_notes: string[]
  }
}

export default function ComprehensiveAnalysisTest() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [rawResponse, setRawResponse] = useState<string>("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
      setRawResponse("")
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setResult(null)
    setRawResponse("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      console.log("🚀 Uploading file:", file.name)

      const response = await fetch("/api/v2/test/comprehensive-analysis", {
        method: "POST",
        body: formData,
      })

      console.log("📡 Response status:", response.status)
      console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()))

      // Get the raw response text first
      const responseText = await response.text()
      console.log("📄 Raw response:", responseText.substring(0, 500))
      setRawResponse(responseText)

      // Try to parse as JSON
      try {
        const data = JSON.parse(responseText)
        console.log("✅ Successfully parsed JSON")
        setResult(data)
      } catch (parseError) {
        console.error("❌ JSON Parse Error:", parseError)
        setResult({
          success: false,
          error: `JSON Parse Error: ${parseError instanceof Error ? parseError.message : "Unknown parse error"}`,
        })
      }
    } catch (error) {
      console.error("❌ Network Error:", error)
      setResult({
        success: false,
        error: `Network Error: ${error instanceof Error ? error.message : "Unknown network error"}`,
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">🔍 Comprehensive Credit Report Analysis Test</h1>
        <p className="text-muted-foreground">
          Upload your PDF to see detailed extraction and pattern matching analysis
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>📄 Upload Credit Report PDF</CardTitle>
          <CardDescription>
            This will perform comprehensive analysis and show detailed debugging information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <input type="file" accept=".pdf,.txt" onChange={handleFileChange} className="flex-1 p-2 border rounded" />
            <Button onClick={handleUpload} disabled={!file || isUploading}>
              {isUploading ? "🔄 Analyzing..." : "🚀 Analyze"}
            </Button>
          </div>

          {file && (
            <div className="text-sm text-muted-foreground">
              Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </div>
          )}
        </CardContent>
      </Card>

      {/* Show raw response for debugging */}
      {rawResponse && (
        <Card>
          <CardHeader>
            <CardTitle>🔧 Raw Response (First 1000 chars)</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-40 border rounded p-4">
              <pre className="text-xs whitespace-pre-wrap">{rawResponse.substring(0, 1000)}</pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {result && (
        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="summary">📊 Summary</TabsTrigger>
            <TabsTrigger value="scores">🎯 Scores</TabsTrigger>
            <TabsTrigger value="accounts">💳 Accounts</TabsTrigger>
            <TabsTrigger value="text">📝 Text</TabsTrigger>
            <TabsTrigger value="debug">🔧 Debug</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result.success ? "✅" : "❌"} Analysis Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.success ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {result.analysis?.credit_scores?.primary_score || "N/A"}
                      </div>
                      <div className="text-sm text-blue-600">Primary Score</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {result.analysis?.credit_scores?.vantage_score || "N/A"}
                      </div>
                      <div className="text-sm text-green-600">VantageScore 3.0</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{result.analysis?.accounts?.length || 0}</div>
                      <div className="text-sm text-purple-600">Accounts Found</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{result.stats?.text_length || 0}</div>
                      <div className="text-sm text-orange-600">Characters</div>
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <AlertDescription>❌ Analysis failed: {result.error}</AlertDescription>
                  </Alert>
                )}

                {result.analysis?.analysis_metadata && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">📈 Quality Metrics</h3>
                    <div className="flex gap-4">
                      <Badge variant="outline">
                        Confidence: {(result.analysis.analysis_metadata.confidence_score * 100).toFixed(1)}%
                      </Badge>
                      <Badge variant="outline">
                        Completeness: {(result.analysis.analysis_metadata.data_completeness * 100).toFixed(1)}%
                      </Badge>
                      <Badge variant="outline">Method: {result.analysis.analysis_metadata.extraction_method}</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scores">
            <Card>
              <CardHeader>
                <CardTitle>🎯 Credit Score Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {result.analysis?.credit_scores ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(result.analysis.credit_scores).map(([key, value]) => (
                        <div key={key} className="p-3 border rounded-lg">
                          <div className="font-medium capitalize">{key.replace("_", " ")}</div>
                          <div className="text-2xl font-bold text-blue-600">{value || "Not Found"}</div>
                        </div>
                      ))}
                    </div>

                    {result.debug_info?.score_matches && (
                      <div className="space-y-2">
                        <h3 className="font-semibold">🔍 Score Pattern Matches</h3>
                        <ScrollArea className="h-40 border rounded p-2">
                          {result.debug_info.score_matches.map((match, index) => (
                            <div key={index} className="text-sm mb-2 p-2 bg-gray-50 rounded">
                              <div className="font-medium">{match.pattern_name}</div>
                              <div>Score: {match.score}</div>
                              <div className="text-xs text-gray-600">Match: "{match.match_text}"</div>
                            </div>
                          ))}
                        </ScrollArea>
                      </div>
                    )}
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
                <CardTitle>💳 Account Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {result.analysis?.accounts?.length > 0 ? (
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Found {result.analysis.accounts.length} accounts
                    </div>
                    <ScrollArea className="h-60 border rounded">
                      <div className="p-4 space-y-2">
                        {result.analysis.accounts.map((account: any, index: number) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="font-medium">{account.creditor_name}</div>
                            <div className="text-sm text-gray-600">
                              ****{account.account_number_last_4} • {account.account_type}
                            </div>
                            <div className="text-sm">Balance: ${account.balance?.toLocaleString() || "N/A"}</div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    {result.debug_info?.account_matches && (
                      <div className="space-y-2">
                        <h3 className="font-semibold">🔍 Account Pattern Matches</h3>
                        <ScrollArea className="h-40 border rounded p-2">
                          {result.debug_info.account_matches.map((match, index) => (
                            <div key={index} className="text-sm mb-2 p-2 bg-gray-50 rounded">
                              <div className="font-medium">{match.pattern_name}</div>
                              <div className="text-xs text-gray-600">"{match.match_text}"</div>
                            </div>
                          ))}
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                ) : (
                  <Alert>
                    <AlertDescription>No accounts found</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="text">
            <Card>
              <CardHeader>
                <CardTitle>📝 Extracted Text Sample</CardTitle>
              </CardHeader>
              <CardContent>
                {result.debug_info?.text_sample ? (
                  <ScrollArea className="h-96 border rounded p-4">
                    <pre className="text-xs whitespace-pre-wrap">{result.debug_info.text_sample}</pre>
                  </ScrollArea>
                ) : (
                  <Alert>
                    <AlertDescription>No text sample available</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="debug">
            <Card>
              <CardHeader>
                <CardTitle>🔧 Debug Information</CardTitle>
              </CardHeader>
              <CardContent>
                {result.debug_info?.processing_notes ? (
                  <ScrollArea className="h-96 border rounded p-4">
                    <div className="space-y-1">
                      {result.debug_info.processing_notes.map((note, index) => (
                        <div key={index} className="text-sm font-mono">
                          {note}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <Alert>
                    <AlertDescription>No debug information available</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
