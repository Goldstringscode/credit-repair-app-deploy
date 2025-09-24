"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TestPdfProcessing() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [testResult, setTestResult] = useState<any>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setTestResult(null)
    }
  }

  const testProcessing = async () => {
    if (!file) return

    setIsAnalyzing(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/test-pdf-processing", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">PDF Processing Test & Debug</h1>
        <p className="text-gray-600">
          Upload your PDF to see detailed extraction results, pattern matching, and debug information.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload PDF for Testing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {file && (
            <div className="text-sm text-gray-600">
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
          <Button onClick={testProcessing} disabled={!file || isAnalyzing} className="w-full">
            {isAnalyzing ? "Testing PDF Processing..." : "Test PDF Processing"}
          </Button>
        </CardContent>
      </Card>

      {testResult && (
        <div className="space-y-6">
          {testResult.success ? (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="patterns">Pattern Results</TabsTrigger>
                <TabsTrigger value="text">Text Analysis</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>File Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {testResult.text_analysis?.total_length?.toLocaleString() || 0}
                        </div>
                        <div className="text-sm text-gray-600">Characters Extracted</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {testResult.text_analysis?.unique_3digit_numbers?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">Valid Credit Scores Found</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {testResult.recommendations?.likely_vantagescore || "N/A"}
                        </div>
                        <div className="text-sm text-gray-600">Likely VantageScore</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Content Detection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        {testResult.text_analysis?.contains_vantagescore ? (
                          <Badge className="bg-green-100 text-green-800">✓ Found</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">✗ Missing</Badge>
                        )}
                        <span className="text-sm">VantageScore 3.0</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {testResult.text_analysis?.contains_generic_risk ? (
                          <Badge className="bg-green-100 text-green-800">✓ Found</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">✗ Missing</Badge>
                        )}
                        <span className="text-sm">Generic Risk Score</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {testResult.text_analysis?.contains_insight ? (
                          <Badge className="bg-green-100 text-green-800">✓ Found</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">✗ Missing</Badge>
                        )}
                        <span className="text-sm">Insight Score</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-blue-100 text-blue-800">
                          {testResult.text_analysis?.line_breaks || 0}
                        </Badge>
                        <span className="text-sm">Line Breaks</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="patterns" className="space-y-4">
                {testResult.pattern_results?.map((result: any, index: number) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {result.pattern_name}
                        <Badge variant={result.matches_found > 0 ? "default" : "secondary"}>
                          {result.matches_found} matches
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-gray-600">{result.description}</p>
                    </CardHeader>
                    <CardContent>
                      {result.scores?.length > 0 ? (
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {result.scores.map((score: any, scoreIndex: number) => (
                            <div key={scoreIndex} className="p-3 border rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <div className="font-medium text-lg">Score: {score.score}</div>
                                <Badge variant={score.score >= 300 && score.score <= 850 ? "default" : "destructive"}>
                                  {score.score >= 300 && score.score <= 850 ? "Valid Range" : "Invalid Range"}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600 mb-2">
                                <strong>Match:</strong> "{score.fullMatch}"
                              </div>
                              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                <strong>Context:</strong> {score.context.substring(0, 200)}...
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-4">No matches found</div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="text" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>VantageScore Context</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap">
                      {testResult.text_analysis?.vantagescore_context || "VantageScore context not found"}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>First 1000 Characters</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
                      {testResult.text_analysis?.first_1000_chars || "No text extracted"}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>All Valid Credit Scores Found</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {testResult.text_analysis?.unique_3digit_numbers?.map((score: number, index: number) => (
                        <Badge key={index} variant="outline" className="text-lg p-2">
                          {score}
                        </Badge>
                      )) || <span className="text-gray-500">No valid scores found</span>}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Likely VantageScore</h4>
                      <p className="text-blue-700">
                        {testResult.recommendations?.likely_vantagescore || "Could not determine VantageScore"}
                      </p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">All Valid Scores</h4>
                      <div className="flex flex-wrap gap-2">
                        {testResult.recommendations?.all_valid_scores?.map((score: number, index: number) => (
                          <Badge key={index} className="bg-green-100 text-green-800">
                            {score}
                          </Badge>
                        )) || <span className="text-green-700">No valid scores detected</span>}
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h4 className="font-medium text-yellow-800 mb-2">Extraction Method</h4>
                      <p className="text-yellow-700">{testResult.recommendations?.extraction_method || "Unknown"}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Processing Failed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-600">{testResult.error}</p>
                {testResult.details && (
                  <div className="mt-4 text-sm text-gray-600">
                    <strong>Details:</strong>
                    <pre className="mt-2 bg-gray-50 p-2 rounded text-xs overflow-auto">{testResult.details}</pre>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
