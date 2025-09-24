"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DebugPdfExtraction() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [debugResult, setDebugResult] = useState<any>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setDebugResult(null)
    }
  }

  const debugExtraction = async () => {
    if (!file) return

    setIsAnalyzing(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/v2/upload/credit-reports", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      setDebugResult(result)
    } catch (error) {
      setDebugResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🔍 Enhanced PDF Extraction Debug</h1>
        <p className="text-gray-600">
          Upload your PDF to see detailed extraction results with enhanced pattern matching and validation.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload PDF for Enhanced Debugging</CardTitle>
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
          <Button onClick={debugExtraction} disabled={!file || isAnalyzing} className="w-full">
            {isAnalyzing ? "🔄 Analyzing PDF..." : "🚀 Debug PDF Extraction"}
          </Button>
        </CardContent>
      </Card>

      {debugResult && (
        <div className="space-y-6">
          {debugResult.success ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>🎯 Extraction Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {debugResult.stats?.text_length?.toLocaleString() || 0}
                      </div>
                      <div className="text-sm text-gray-600">Characters</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{debugResult.stats?.accounts_found || 0}</div>
                      <div className="text-sm text-gray-600">Accounts</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {debugResult.analysis?.credit_scores?.primary_score || "N/A"}
                      </div>
                      <div className="text-sm text-gray-600">Primary Score</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {debugResult.analysis?.bureau_info?.primary_bureau || "Unknown"}
                      </div>
                      <div className="text-sm text-gray-600">Bureau</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold">
                        {debugResult.stats?.scores_found?.generic_risk_score || "N/A"}
                      </div>
                      <div className="text-sm text-gray-600">Generic Risk</div>
                      {debugResult.stats?.scores_found?.generic_risk_score === 604 && (
                        <Badge className="mt-1 bg-green-100 text-green-800">✅ Expected: 604</Badge>
                      )}
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold">{debugResult.stats?.scores_found?.vantage_score || "N/A"}</div>
                      <div className="text-sm text-gray-600">VantageScore</div>
                      {debugResult.stats?.scores_found?.vantage_score === 609 ? (
                        <Badge className="mt-1 bg-green-100 text-green-800">✅ Expected: 609</Badge>
                      ) : (
                        <Badge className="mt-1 bg-red-100 text-red-800">❌ Expected: 609</Badge>
                      )}
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold">{debugResult.stats?.scores_found?.insight_score || "N/A"}</div>
                      <div className="text-sm text-gray-600">Insight Score</div>
                      {debugResult.stats?.scores_found?.insight_score === 586 && (
                        <Badge className="mt-1 bg-green-100 text-green-800">✅ Expected: 586</Badge>
                      )}
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold">{debugResult.stats?.scores_found?.fico_score || "N/A"}</div>
                      <div className="text-sm text-gray-600">FICO Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>📝 Processing Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {debugResult.analysis?.analysis_metadata?.processing_notes?.map((note: string, index: number) => (
                      <div
                        key={index}
                        className={`text-sm p-2 rounded ${
                          note.includes("✅")
                            ? "bg-green-50 text-green-800"
                            : note.includes("❌")
                              ? "bg-red-50 text-red-800"
                              : note.includes("🎯")
                                ? "bg-purple-50 text-purple-800"
                                : "bg-gray-50"
                        }`}
                      >
                        {note}
                      </div>
                    )) || <div className="text-gray-500">No processing notes available</div>}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>💳 Extracted Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                  {debugResult.analysis?.accounts?.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {debugResult.analysis.accounts.slice(0, 10).map((account: any, index: number) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{account.creditor_name}</div>
                              <div className="text-sm text-gray-600">****{account.account_number_last_4}</div>
                              <div className="text-sm text-gray-600">{account.account_status}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">Balance: ${account.balance?.toLocaleString() || "N/A"}</div>
                              <div className="text-sm text-gray-600">Type: {account.account_type}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">No accounts extracted</div>
                  )}
                </CardContent>
              </Card>

              {debugResult.analysis?.analysis_metadata?.confidence_score && (
                <Card>
                  <CardHeader>
                    <CardTitle>📊 Analysis Quality</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.round(debugResult.analysis.analysis_metadata.confidence_score * 100)}%
                        </div>
                        <div className="text-sm text-gray-600">Confidence Score</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {Math.round(debugResult.analysis.analysis_metadata.data_completeness * 100)}%
                        </div>
                        <div className="text-sm text-gray-600">Data Completeness</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">❌ Extraction Failed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-600">{debugResult.error}</p>
                {debugResult.details && (
                  <div className="mt-4 text-sm text-gray-600">
                    <strong>Details:</strong>
                    <pre className="mt-2 bg-gray-50 p-2 rounded text-xs overflow-auto">{debugResult.details}</pre>
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
