"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

export default function ParsingDebugPage() {
  const [file, setFile] = useState<File | null>(null)
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [debugText, setDebugText] = useState("")

  const handleFileUpload = async () => {
    if (!file) return

    setLoading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/upload/credit-reports-fallback", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Upload error:", error)
    } finally {
      setLoading(false)
    }
  }

  const testTextParsing = () => {
    if (!debugText) return

    // Simulate the parsing functions
    const mockAnalysis = {
      credit_scores: extractScoresFromText(debugText),
      accounts: extractAccountsFromText(debugText),
      accounts_by_type: {},
      score_breakdown: {},
    }

    // Create breakdowns
    mockAnalysis.accounts.forEach((account: any) => {
      const type = account.account_type || "Unknown"
      mockAnalysis.accounts_by_type[type] = (mockAnalysis.accounts_by_type[type] || 0) + 1
    })

    mockAnalysis.credit_scores.forEach((score: any) => {
      const key = `${score.bureau}_${score.model.replace(/\s+/g, "_")}`
      mockAnalysis.score_breakdown[key] = score.score
    })

    setResults({
      success: true,
      analysis: mockAnalysis,
      debug: true,
    })
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Credit Report Parsing Debug Tool</h1>
        <p className="text-gray-600">Test and debug the credit report parsing logic</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>File Upload Test</CardTitle>
            <CardDescription>Upload a credit report file to test parsing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <Button onClick={handleFileUpload} disabled={!file || loading} className="w-full">
              {loading ? "Processing..." : "Upload & Parse"}
            </Button>
          </CardContent>
        </Card>

        {/* Text Debug Section */}
        <Card>
          <CardHeader>
            <CardTitle>Text Debug Test</CardTitle>
            <CardDescription>Paste credit report text to test parsing logic</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste credit report text here..."
              value={debugText}
              onChange={(e) => setDebugText(e.target.value)}
              rows={8}
            />
            <Button onClick={testTextParsing} disabled={!debugText} className="w-full">
              Test Text Parsing
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      {results && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Parsing Results</CardTitle>
            <CardDescription>{results.success ? "✅ Parsing successful" : "❌ Parsing failed"}</CardDescription>
          </CardHeader>
          <CardContent>
            {results.success ? (
              <div className="space-y-6">
                {/* Credit Scores */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Credit Scores Found</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.analysis?.credit_scores && Array.isArray(results.analysis.credit_scores) ? (
                      results.analysis.credit_scores.map((score: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <Badge variant="outline">{score.bureau}</Badge>
                            <span className="text-2xl font-bold">{score.score}</span>
                          </div>
                          <p className="text-sm text-gray-600">{score.model}</p>
                          <p className="text-xs text-gray-500">
                            Confidence: {((score.confidence || 0) * 100).toFixed(0)}%
                          </p>
                          {score.context && <p className="text-xs text-gray-400 mt-2 truncate">{score.context}</p>}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No credit scores found</p>
                    )}
                  </div>
                </div>

                {/* Account Summary */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Accounts Found ({results.analysis?.accounts?.length || 0})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {results.analysis?.accounts_by_type &&
                      Object.entries(results.analysis.accounts_by_type).map(([type, count]) => (
                        <div key={type} className="text-center p-3 border rounded">
                          <div className="text-2xl font-bold">{count as number}</div>
                          <div className="text-sm text-gray-600">{type.replace("_", " ")}</div>
                        </div>
                      ))}
                  </div>

                  {/* Account Details */}
                  {results.analysis?.accounts && Array.isArray(results.analysis.accounts) && (
                    <div className="max-h-64 overflow-y-auto">
                      <div className="space-y-2">
                        {results.analysis.accounts.slice(0, 10).map((account: any, index: number) => (
                          <div key={index} className="p-3 border rounded text-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{account.creditor_name}</span>
                              <span className="text-gray-500">****{account.account_number_last_4}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-600 mt-1">
                              <span>{account.account_type}</span>
                              <span>${(account.balance || 0).toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                        {results.analysis.accounts.length > 10 && (
                          <p className="text-center text-gray-500 text-sm">
                            ... and {results.analysis.accounts.length - 10} more accounts
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Score Breakdown */}
                {results.analysis?.score_breakdown && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Score Breakdown</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(results.analysis.score_breakdown).map(([key, score]) => (
                        <div key={key} className="flex justify-between p-3 border rounded">
                          <span className="font-medium">{key.replace(/_/g, " ")}</span>
                          <span className="font-bold">{score as number}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw Response */}
                <details className="mt-6">
                  <summary className="cursor-pointer font-semibold">Raw Response Data</summary>
                  <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-96">
                    {JSON.stringify(results, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <div className="text-red-600">
                <p className="font-semibold">Error: {results.error}</p>
                {results.details && <p className="text-sm mt-2">{results.details}</p>}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Helper functions for text debugging
function extractScoresFromText(text: string) {
  const scores = []
  const scorePatterns = [
    { pattern: /VantageScore\s*:?\s*(\d{3})/gi, model: "VantageScore", bureau: "Generic" },
    { pattern: /Equifax\s*:?\s*(\d{3})/gi, model: "Equifax Score", bureau: "Equifax" },
    { pattern: /FICO\s*:?\s*(\d{3})/gi, model: "FICO", bureau: "Generic" },
    { pattern: /Insight\s*Score\s*:?\s*(\d{3})/gi, model: "Insight Score", bureau: "Generic" },
    { pattern: /Generic\s*Risk\s*Score\s*:?\s*(\d{3})/gi, model: "Generic Risk Score", bureau: "Generic" },
  ]

  for (const pattern of scorePatterns) {
    const matches = Array.from(text.matchAll(pattern.pattern))
    for (const match of matches) {
      const score = Number.parseInt(match[1])
      if (score >= 300 && score <= 850) {
        scores.push({
          score,
          model: pattern.model,
          bureau: pattern.bureau,
          confidence: 0.9,
          context: match[0],
        })
      }
    }
  }

  return scores
}

function extractAccountsFromText(text: string) {
  const accounts = []
  const lines = text.split(/\r?\n/)

  for (const line of lines) {
    if (line.length > 10 && /[A-Z]/.test(line) && /\d{4}/.test(line)) {
      const creditorMatch = line.match(/([A-Z][A-Z\s&\-.,']{4,40})/)
      const accountMatch = line.match(/(\d{4})/)

      if (creditorMatch && accountMatch) {
        accounts.push({
          creditor_name: creditorMatch[1].trim(),
          account_number_last_4: accountMatch[1],
          account_type: "Credit Card",
          balance: 0,
        })
      }
    }
  }

  return accounts.slice(0, 30) // Limit for debugging
}
