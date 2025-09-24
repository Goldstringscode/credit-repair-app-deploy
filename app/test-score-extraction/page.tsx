"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const sampleCreditReportText = `Date Pulled: 7/1/2021 
Name: John Doe 
DOB: 1/1/1960
Response From Equifax*
Full Name: John Doe
SSN: 666-03-1067 
File Pulled: 7/1/2021 
User ID/Member Number: 999AA00884 
Date of Birth: 1/1/1960

Generic Risk Score
604
Number Of Bank Revolving Accounts Reported 
Last 9 Months
Utilization Of Available Credit On Revolving Bank
Accounts
Number Of Personal Loan Company Installment
Accounts
Number Of Accounts Always Paid As Agreed
Score Range: N/A
Consumer Rank: N/A

VANTAGESCORE 3.0
609
Total Of All Balances On Bankcard Or Revolving
Accounts Is Too High
Balances On Bankcard Or Revolving Accounts Too
High Compared To Credit Limits
The Date That You Opened Your Oldest Account Is
Too Recent
The Total Of All Balances On Your Open Accounts
Is Too High
Number Of Inquiries Adversely Affected The Score
But Not Significantly
Score Range: 300 - 850
Consumer Rank: 24%

Insight Score
586
• Age of Revolving Accounts
• Bankcard Utilization
• Age of Non-Mortgage Installment Accounts
• Number of Recent Utility Inquiries
• Number of Accounts 30 Days Delinquent
Score Range: 364 to 825

Accounts Summary*
29
Revolving: 15
Installments: 10
Mortgage: 0
Line of Credit: 0
Other: 4

REVOLVING
RETAIL CARD CO 906DC00029
ACCOUNT NUMBER 1748-398434577
Account Type: N/A
Account Owner: Individual Account
Rate/Status: Pays account as agreed
Date Opened: 7/2011
Date Reported: 3/2021
Balance: $6,231
Credit Limit: $6,636
High Credit: $6,636
Scheduled Payment: $149

REVOLVING
ACME CREDIT 404BB08169
ACCOUNT NUMBER 1245401
Account Type: N/A
Account Owner: Individual Account
Rate/Status: Pays account as agreed
Date Opened: 6/2013
Date Reported: 3/2021
Balance: $972
Credit Limit: $1,000
High Credit: $1,000`

interface AnalysisResult {
  credit_scores: {
    primary_score: number | null
    vantage_score: number | null
    fico_score: number | null
    generic_risk_score: number | null
    insight_score: number | null
    experian: number | null
    equifax: number | null
    transunion: number | null
    score_model: string | null
  }
  personal_info: {
    name: string | null
    ssn_last_4: string | null
  }
  accounts: Array<{
    creditor_name: string
    account_number_last_4: string
    balance: number | null
    credit_limit: number | null
    account_status: string
  }>
  analysis_metadata: {
    confidence_score: number
    processing_notes: string[]
  }
}

export default function TestScoreExtraction() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const testScoreExtraction = async () => {
    setIsAnalyzing(true)
    setError(null)
    setAnalysisResult(null)

    try {
      // Create a test file with the sample text
      const blob = new Blob([sampleCreditReportText], { type: "text/plain" })
      const file = new File([blob], "test-credit-report.txt", { type: "text/plain" })

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/v2/upload/credit-reports", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setAnalysisResult(result.analysis)
      } else {
        setError(result.error || "Analysis failed")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Credit Score Extraction Test</h1>
        <p className="text-gray-600">
          Testing AI analysis with the provided credit report document containing multiple scores.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Expected Scores from Document</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">604</div>
              <div className="text-sm text-gray-600">Generic Risk Score</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">609</div>
              <div className="text-sm text-gray-600">VantageScore 3.0</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">586</div>
              <div className="text-sm text-gray-600">Insight Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testScoreExtraction} disabled={isAnalyzing} className="w-full">
            {isAnalyzing ? "Analyzing Credit Report..." : "Test Score Extraction"}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="mb-6 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {analysisResult && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Extracted Credit Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold">{analysisResult.credit_scores.primary_score || "N/A"}</div>
                  <div className="text-sm text-gray-600">Primary Score</div>
                  {analysisResult.credit_scores.primary_score === 609 && (
                    <Badge className="mt-1 bg-green-100 text-green-800">✓ Should be 609</Badge>
                  )}
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">
                    {analysisResult.credit_scores.generic_risk_score || "N/A"}
                  </div>
                  <div className="text-sm text-gray-600">Generic Risk</div>
                  {analysisResult.credit_scores.generic_risk_score === 604 && (
                    <Badge className="mt-1 bg-green-100 text-green-800">✓ Correct</Badge>
                  )}
                  {analysisResult.credit_scores.generic_risk_score !== 604 &&
                    analysisResult.credit_scores.generic_risk_score && (
                      <Badge className="mt-1 bg-red-100 text-red-800">✗ Should be 604</Badge>
                    )}
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">
                    {analysisResult.credit_scores.vantage_score || "N/A"}
                  </div>
                  <div className="text-sm text-gray-600">VantageScore</div>
                  {analysisResult.credit_scores.vantage_score === 609 && (
                    <Badge className="mt-1 bg-green-100 text-green-800">✓ Correct</Badge>
                  )}
                  {analysisResult.credit_scores.vantage_score !== 609 && analysisResult.credit_scores.vantage_score && (
                    <Badge className="mt-1 bg-red-100 text-red-800">✗ Should be 609</Badge>
                  )}
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">
                    {analysisResult.credit_scores.insight_score || "N/A"}
                  </div>
                  <div className="text-sm text-gray-600">Insight Score</div>
                  {analysisResult.credit_scores.insight_score === 586 && (
                    <Badge className="mt-1 bg-green-100 text-green-800">✓ Correct</Badge>
                  )}
                  {analysisResult.credit_scores.insight_score !== 586 && analysisResult.credit_scores.insight_score && (
                    <Badge className="mt-1 bg-red-100 text-red-800">✗ Should be 586</Badge>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold">{analysisResult.credit_scores.fico_score || "N/A"}</div>
                  <div className="text-sm text-gray-600">FICO Score</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold">{analysisResult.credit_scores.experian || "N/A"}</div>
                  <div className="text-sm text-gray-600">Experian</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold">{analysisResult.credit_scores.equifax || "N/A"}</div>
                  <div className="text-sm text-gray-600">Equifax</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <div className="text-lg">{analysisResult.personal_info.name || "Not found"}</div>
                  {analysisResult.personal_info.name === "John Doe" && (
                    <Badge className="mt-1 bg-green-100 text-green-800">✓ Correct</Badge>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">SSN Last 4</label>
                  <div className="text-lg">{analysisResult.personal_info.ssn_last_4 || "Not found"}</div>
                  {analysisResult.personal_info.ssn_last_4 === "1067" && (
                    <Badge className="mt-1 bg-green-100 text-green-800">✓ Correct</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Extracted Accounts ({analysisResult.accounts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {analysisResult.accounts.length > 0 ? (
                <div className="space-y-3">
                  {analysisResult.accounts.slice(0, 5).map((account, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{account.creditor_name}</div>
                          <div className="text-sm text-gray-600">****{account.account_number_last_4}</div>
                          <div className="text-sm text-gray-600">{account.account_status}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">Balance: ${account.balance?.toLocaleString() || "N/A"}</div>
                          <div className="text-sm text-gray-600">
                            Limit: ${account.credit_limit?.toLocaleString() || "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {analysisResult.accounts.length > 5 && (
                    <div className="text-center text-gray-600">
                      ... and {analysisResult.accounts.length - 5} more accounts
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-600">No accounts extracted</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analysis Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Confidence Score</label>
                  <div className="text-lg">{(analysisResult.analysis_metadata.confidence_score * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Processing Notes</label>
                  <div className="space-y-1">
                    {analysisResult.analysis_metadata.processing_notes.map((note, index) => (
                      <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                        {note}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Results Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Generic Risk Score (Expected: 604)</span>
                  <Badge variant={analysisResult.credit_scores.generic_risk_score === 604 ? "default" : "destructive"}>
                    {analysisResult.credit_scores.generic_risk_score === 604 ? "✓ PASS" : "✗ FAIL"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>VantageScore 3.0 (Expected: 609)</span>
                  <Badge variant={analysisResult.credit_scores.vantage_score === 609 ? "default" : "destructive"}>
                    {analysisResult.credit_scores.vantage_score === 609 ? "✓ PASS" : "✗ FAIL"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Insight Score (Expected: 586)</span>
                  <Badge variant={analysisResult.credit_scores.insight_score === 586 ? "default" : "destructive"}>
                    {analysisResult.credit_scores.insight_score === 586 ? "✓ PASS" : "✗ FAIL"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Personal Info Extracted</span>
                  <Badge variant={analysisResult.personal_info.name ? "default" : "destructive"}>
                    {analysisResult.personal_info.name ? "✓ PASS" : "✗ FAIL"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Primary Score (Should be 609)</span>
                  <Badge variant={analysisResult.credit_scores.primary_score === 609 ? "default" : "destructive"}>
                    {analysisResult.credit_scores.primary_score === 609
                      ? "✓ PASS"
                      : `✗ FAIL (Got: ${analysisResult.credit_scores.primary_score})`}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
