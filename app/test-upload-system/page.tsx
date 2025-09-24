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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface UploadTestResult {
  success: boolean
  message?: string
  report?: any
  analysis?: any
  processing_notes?: string[]
  stats?: any
  validation_results?: any
  error?: string
  details?: any
}

export default function UploadSystemTest() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [results, setResults] = useState<{ [key: string]: UploadTestResult }>({})
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
    console.log("🔄 File change event:", e.target.files)
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      console.log("📁 File selected:", selectedFile.name, selectedFile.size, selectedFile.type)
      setFile(selectedFile)
      setResults({})
      setProgress(0)
      setError(null)
    } else {
      console.log("❌ No file selected")
      setFile(null)
    }
  }

  // Alternative file handler for debugging
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("🔍 Alternative file handler triggered")
    const files = e.target.files
    console.log("📂 Files array:", files)
    console.log("📂 Files length:", files?.length)
    
    if (files && files.length > 0) {
      const selectedFile = files[0]
      console.log("📁 File selected via alternative handler:", selectedFile)
      setFile(selectedFile)
    } else {
      console.log("❌ No files in alternative handler")
      setFile(null)
    }
  }

  // Debug effect to log state changes
  useEffect(() => {
    console.log("🔍 Current state:", { file, isUploading, buttonDisabled: !file || isUploading })
  }, [file, isUploading])

  const testUploadSystem = async (endpoint: string, name: string) => {
    if (!file) return

    setIsUploading(true)
    setProgress(0)
    setError(null)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90))
    }, 500)

    try {
      const formData = new FormData()
      formData.append("file", file)

      console.log(`🚀 Testing ${name} for:`, file.name)

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      })

      console.log(`📡 ${name} Response status:`, response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ ${name} Response not ok:`, errorText)

        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText }
        }

        setResults(prev => ({
          ...prev,
          [name]: {
            success: false,
            error: `HTTP ${response.status}: ${errorData.error || errorText}`,
            details: errorData
          }
        }))
      } else {
        const data = await response.json()
        console.log(`✅ ${name} completed:`, data)

        setResults(prev => ({
          ...prev,
          [name]: data
        }))
      }

      setProgress(100)
    } catch (error) {
      console.error(`❌ ${name} error:`, error)
      setResults(prev => ({
        ...prev,
        [name]: {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          details: error
        }
      }))
    } finally {
      clearInterval(progressInterval)
      setIsUploading(false)
    }
  }

  const runAllTests = async () => {
    if (!file) return

    const tests = [
      { endpoint: "/api/v5/upload/enhanced-ai-analysis", name: "Enhanced AI Analysis V5" },
      { endpoint: "/api/v4/upload/ultimate-analysis", name: "Ultimate Analysis V4" },
      { endpoint: "/api/v3/upload/advanced-analysis", name: "Advanced Analysis V3" },
      { endpoint: "/api/v2/upload/credit-reports", name: "Enhanced AI Analysis V2" },
      { endpoint: "/api/upload/credit-reports", name: "Basic AI Analysis V1" },
      { endpoint: "/api/upload-simple", name: "Simple Upload" }
    ]

    for (const test of tests) {
      await testUploadSystem(test.endpoint, test.name)
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500"
      case "offline": return "bg-red-500"
      default: return "bg-yellow-500"
    }
  }

  const getResultColor = (success: boolean) => {
    return success ? "bg-green-100 border-green-300" : "bg-red-100 border-red-300"
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧪 Upload System Test Suite
            <Badge className={getStatusColor(apiStatus)}>
              {apiStatus.toUpperCase()}
            </Badge>
          </CardTitle>
          <CardDescription>
            Comprehensive testing of all upload system endpoints and features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Select Credit Report File</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.txt,.csv"
              onChange={handleFileChange}
              disabled={isUploading}
              key={file ? 'file-selected' : 'no-file'} // Force re-render
            />
            <p className="text-sm text-gray-500">
              Supported formats: PDF, TXT, CSV (max 50MB)
            </p>
            
            {/* Alternative file input for testing */}
            <div className="p-2 bg-green-100 rounded text-xs">
              <p><strong>Alternative File Input (for testing):</strong></p>
              <Input
                id="file-alt"
                type="file"
                accept=".pdf,.txt,.csv"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
            </div>
            
            {/* Debug info */}
            <div className="p-2 bg-gray-100 rounded text-xs">
              <p><strong>Debug Info:</strong></p>
              <p>File selected: {file ? `✅ ${file.name} (${file.size} bytes)` : '❌ None'}</p>
              <p>Uploading: {isUploading ? '✅ Yes' : '❌ No'}</p>
              <p>Button disabled: {(!file || isUploading) ? '✅ Yes' : '❌ No'}</p>
            </div>
            
            {/* Manual file selection test */}
            <div className="p-2 bg-blue-100 rounded text-xs">
              <p><strong>Manual Test:</strong></p>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  const input = document.getElementById('file') as HTMLInputElement
                  if (input) {
                    input.click()
                  }
                }}
              >
                Click to Select File
              </Button>
            </div>
            
            {/* Test button that should always work */}
            <div className="p-2 bg-purple-100 rounded text-xs">
              <p><strong>Test Button (should always work):</strong></p>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => {
                  console.log("🧪 Test button clicked!")
                  alert("Test button works! File state: " + (file ? file.name : "None"))
                }}
              >
                Test Button
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={runAllTests}
              disabled={!file || isUploading}
              className="flex-1"
              title={`File: ${file ? file.name : 'None'}, Uploading: ${isUploading}`}
            >
              🚀 Run All Tests
            </Button>
            <Button
              onClick={() => testUploadSystem("/api/v5/upload/enhanced-ai-analysis", "Enhanced AI Analysis V5")}
              disabled={!file || isUploading}
              variant="outline"
              title={`File: ${file ? file.name : 'None'}, Uploading: ${isUploading}`}
            >
              Test V5 Enhanced AI
            </Button>
            <Button
              onClick={() => testUploadSystem("/api/v4/upload/ultimate-analysis", "Ultimate Analysis V4")}
              disabled={!file || isUploading}
              variant="outline"
              title={`File: ${file ? file.name : 'None'}, Uploading: ${isUploading}`}
            >
              Test V4 Only
            </Button>
          </div>
          
          {/* Button state debug */}
          <div className="p-2 bg-yellow-100 rounded text-xs">
            <p><strong>Button State:</strong></p>
            <p>File exists: {file ? '✅ Yes' : '❌ No'}</p>
            <p>Is uploading: {isUploading ? '✅ Yes' : '❌ No'}</p>
            <p>Button disabled: {(!file || isUploading) ? '✅ Yes' : '❌ No'}</p>
            <p>File details: {file ? `${file.name} (${file.size} bytes, ${file.type})` : 'None'}</p>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-center">Processing... {progress}%</p>
            </div>
          )}
        </CardContent>
      </Card>

      {Object.keys(results).length > 0 && (
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="results">Test Results</TabsTrigger>
            <TabsTrigger value="details">Detailed Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="space-y-4">
            {Object.entries(results).map(([name, result]) => (
              <Card key={name} className={getResultColor(result.success)}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {name}
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? "SUCCESS" : "FAILED"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result.success ? (
                    <div className="space-y-2">
                      {result.message && <p className="text-green-700">{result.message}</p>}
                      {result.stats && (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>Accounts: {result.stats.total_accounts}</div>
                          <div>Scores: {result.stats.total_scores}</div>
                          <div>Confidence: {(result.stats.confidence_score * 100).toFixed(1)}%</div>
                          <div>Processing: {result.stats.extraction_methods_used?.length || 0} methods</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-red-700 font-medium">{result.error}</p>
                      {result.details && (
                        <details className="text-sm">
                          <summary>Error Details</summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            {Object.entries(results).map(([name, result]) => (
              <Card key={name}>
                <CardHeader>
                  <CardTitle>{name} - Detailed Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96 w-full">
                    <pre className="text-xs p-4 bg-gray-100 rounded">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
