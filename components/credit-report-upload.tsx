"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, CreditCard, TrendingUp } from "lucide-react"
import { useNotifications } from "@/lib/notification-context"

interface UploadResult {
  success: boolean
  message?: string
  error?: string
  report?: {
    id: number
    file_name: string
    bureau: string
  }
  analysis?: {
    credit_scores: {
      primary_score: number | null
      vantage_score: number | null
      fico_score: number | null
      experian: number | null
      equifax: number | null
      transunion: number | null
    }
    accounts: Array<{
      creditor_name: string
      account_number_last_4: string
      balance: number
      account_type: string
    }>
    summary: {
      total_accounts: number
      total_debt: number
      credit_utilization: number | null
    }
    recommendations: Array<{
      category: string
      priority: string
      action: string
      impact: string
    }>
  }
  stats?: {
    method: string
    text_length: number
    confidence_score: number
    accounts_found: number
    scores_found: number
    primary_score: number | null
  }
}

export function CreditReportUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [bureau, setBureau] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [uploadMethod, setUploadMethod] = useState<"regular" | "fallback" | "superior" | "ultimate">("ultimate")
  
  // Add notification integration
  const { addNotification } = useNotifications()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("bureau", bureau)

      // Choose endpoint based on upload method
      let endpoint: string
      switch (uploadMethod) {
        case "ultimate":
          endpoint = "/api/upload/credit-report-ultimate"
          break
        case "superior":
          endpoint = "/api/upload/credit-report-superior"
          break
        case "regular":
          endpoint = "/api/upload/credit-report"
          break
        case "fallback":
          endpoint = "/api/upload/credit-report-fallback"
          break
        default:
          endpoint = "/api/upload/credit-report-ultimate"
      }

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        console.log("Upload successful:", data)
        
        // Send success notification
        await addNotification({
          title: "Credit Report Uploaded Successfully! 📊",
          message: `Your ${bureau || 'credit report'} has been processed and analyzed. ${data.analysis?.credit_scores?.primary_score ? `Your credit score is ${data.analysis.credit_scores.primary_score}.` : ''}`,
          type: "success",
          priority: "high",
          read: false,
          actions: [
            {
              label: "View Analysis",
              action: "view_analysis",
              variant: "default"
            },
            {
              label: "View Report",
              action: "view_report",
              variant: "outline"
            }
          ]
        })
      } else {
        console.error("Upload failed:", data)
        
        // Send error notification
        await addNotification({
          title: "Credit Report Upload Failed ❌",
          message: `Failed to process your credit report: ${data.error || "Upload failed"}`,
          type: "error",
          priority: "high",
          read: false,
          actions: [
            {
              label: "Try Again",
              action: "retry_upload",
              variant: "default"
            },
            {
              label: "Contact Support",
              action: "contact_support",
              variant: "outline"
            }
          ]
        })
      }
    } catch (error) {
      console.error("Upload error:", error)
      setResult({
        success: false,
        error: "Network error occurred",
      })
      // Send network error notification
      await addNotification({
        title: "Network Error ❌",
        message: "Failed to upload your credit report due to a network error. Please check your connection and try again.",
        type: "error",
        priority: "high",
        read: false,
        actions: [
          {
            label: "Retry Upload",
            action: "retry_upload",
            variant: "default"
          },
          {
            label: "Contact Support",
            action: "contact_support",
            variant: "outline"
          }
        ]
      })
    } finally {
      setUploading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Credit Report Upload & Analysis
          </CardTitle>
          <CardDescription>Upload your credit report PDF for AI-powered analysis and insights</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Method Selection */}
          <div className="space-y-2">
            <Label>Upload Method</Label>
            <Tabs value={uploadMethod} onValueChange={(value) => setUploadMethod(value as "regular" | "fallback" | "superior" | "ultimate")}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="ultimate">Ultimate Parser ⭐</TabsTrigger>
                <TabsTrigger value="superior">Superior Parser</TabsTrigger>
                <TabsTrigger value="regular">AI-Powered</TabsTrigger>
                <TabsTrigger value="fallback">Pattern-Based</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="text-sm text-muted-foreground">
              {uploadMethod === "ultimate"
                ? "⭐ Uses the most advanced AI parser with 95%+ accuracy - Industry leading technology"
                : uploadMethod === "superior"
                ? "Uses advanced AI parser for high accuracy results"
                : uploadMethod === "regular"
                ? "Uses AI analysis for accurate credit report parsing"
                : "Uses pattern matching - works without OpenAI API"}
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Credit Report File</Label>
            <Input id="file" type="file" accept=".pdf,.txt" onChange={handleFileChange} disabled={uploading} />
            {file && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>

          {/* Bureau Selection */}
          <div className="space-y-2">
            <Label>Credit Bureau (Optional)</Label>
            <Select value={bureau} onValueChange={setBureau}>
              <SelectTrigger>
                <SelectValue placeholder="Select bureau (auto-detected if not specified)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="experian">Experian</SelectItem>
                <SelectItem value="equifax">Equifax</SelectItem>
                <SelectItem value="transunion">TransUnion</SelectItem>
                <SelectItem value="unknown">Unknown/Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Upload Button */}
          <Button onClick={handleUpload} disabled={!file || uploading} className="w-full">
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload & Analyze
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.success ? (
              <div className="space-y-6">
                {/* Success Message */}
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>

                {/* Stats */}
                {result.stats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{result.stats.primary_score || "N/A"}</div>
                      <div className="text-sm text-muted-foreground">Credit Score</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{result.stats.accounts_found}</div>
                      <div className="text-sm text-muted-foreground">Accounts Found</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {Math.round(result.stats.confidence_score * 100)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Confidence</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{result.stats.text_length.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Characters</div>
                    </div>
                  </div>
                )}

                {/* Credit Scores */}
                {result.analysis?.credit_scores && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Credit Scores Detected
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(result.analysis.credit_scores).map(([type, score]) => {
                          if (!score) return null
                          return (
                            <div key={type} className="text-center p-3 border rounded-lg">
                              <div className="text-xl font-bold">{score}</div>
                              <div className="text-sm text-muted-foreground capitalize">{type.replace(/_/g, " ")}</div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Accounts Summary */}
                {result.analysis?.accounts && result.analysis.accounts.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Accounts Found ({result.analysis.accounts.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {result.analysis.accounts.slice(0, 5).map((account, index) => (
                          <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                            <div>
                              <div className="font-medium">{account.creditor_name}</div>
                              <div className="text-sm text-muted-foreground">
                                ****{account.account_number_last_4} • {account.account_type}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{formatCurrency(account.balance)}</div>
                              <Badge variant="outline" className="text-xs">
                                Balance
                              </Badge>
                            </div>
                          </div>
                        ))}
                        {result.analysis.accounts.length > 5 && (
                          <div className="text-center text-sm text-muted-foreground">
                            And {result.analysis.accounts.length - 5} more accounts...
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Summary Stats */}
                {result.analysis?.summary && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Financial Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-xl font-bold">{formatCurrency(result.analysis.summary.total_debt)}</div>
                          <div className="text-sm text-muted-foreground">Total Debt</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-xl font-bold">{result.analysis.summary.total_accounts}</div>
                          <div className="text-sm text-muted-foreground">Total Accounts</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-xl font-bold">
                            {result.analysis.summary.credit_utilization
                              ? `${result.analysis.summary.credit_utilization.toFixed(1)}%`
                              : "N/A"}
                          </div>
                          <div className="text-sm text-muted-foreground">Credit Utilization</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recommendations */}
                {result.analysis?.recommendations && result.analysis.recommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {result.analysis.recommendations.map((rec, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary">High priority</Badge>
                              <Badge variant="outline">Credit Improvement</Badge>
                            </div>
                            <div className="font-medium mb-1">{rec}</div>
                            <div className="text-sm text-muted-foreground">Will help improve your credit score</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {result.error}
                  {result.details && (
                    <div className="mt-2 text-sm">
                      <strong>Details:</strong> {result.details}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
