"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, Calculator, CreditCard, TrendingUp, CheckCircle, Zap, Target, BarChart3 } from "lucide-react"

export default function MonitoringToolsPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [simulationResults, setSimulationResults] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)

  // Credit Report Analysis Tool
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  const analyzeReport = async () => {
    if (!uploadedFile) return

    setIsAnalyzing(true)
    // Simulate analysis
    await new Promise((resolve) => setTimeout(resolve, 3000))

    setAnalysisResults({
      totalItems: 47,
      negativeItems: 8,
      potentialErrors: 3,
      scoreImpact: -45,
      recommendations: [
        "Dispute late payment on Capital One account",
        "Verify collection account from ABC Collections",
        "Request goodwill letter for Wells Fargo late payment",
      ],
      errorDetails: [
        {
          type: "Incorrect Date",
          account: "Chase Credit Card",
          description: "Account shows opened 2019, but actual date is 2020",
          impact: "Low",
        },
        {
          type: "Duplicate Account",
          account: "Student Loan - Navient",
          description: "Same loan appears twice with different balances",
          impact: "High",
        },
        {
          type: "Incorrect Status",
          account: "Auto Loan - Ford Credit",
          description: "Shows as 'Late' but payments are current",
          impact: "Medium",
        },
      ],
    })
    setIsAnalyzing(false)
  }

  // Score Simulator
  const [simulationInputs, setSimulationInputs] = useState({
    currentScore: 720,
    payOffAmount: 5000,
    newCreditLimit: 10000,
    closeAccount: false,
    paymentHistory: "current",
  })

  const runSimulation = async () => {
    setIsSimulating(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setSimulationResults({
      currentScore: simulationInputs.currentScore,
      projectedScore: simulationInputs.currentScore + 25,
      scoreChange: 25,
      factors: [
        { factor: "Credit Utilization", impact: +20, description: "Paying off $5,000 reduces utilization" },
        { factor: "Credit Limit Increase", impact: +8, description: "Higher limits improve utilization ratio" },
        { factor: "Payment History", impact: +2, description: "Continued on-time payments" },
        { factor: "Account Age", impact: -5, description: "Closing old account reduces average age" },
      ],
      timeline: "2-3 months for full impact",
    })
    setIsSimulating(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Target className="h-6 w-6 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Monitoring Tools</h1>
              <p className="text-gray-600 mt-1">Advanced credit analysis and simulation tools</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="analyzer" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analyzer">Report Analyzer</TabsTrigger>
            <TabsTrigger value="simulator">Score Simulator</TabsTrigger>
            <TabsTrigger value="calculator">Utilization Calculator</TabsTrigger>
            <TabsTrigger value="tracker">Dispute Tracker</TabsTrigger>
          </TabsList>

          <TabsContent value="analyzer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Credit Report Analysis Tool</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="report-upload">Upload Credit Report</Label>
                    <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          Drag and drop your credit report here, or click to browse
                        </p>
                        <input
                          id="report-upload"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Button variant="outline" onClick={() => document.getElementById("report-upload")?.click()}>
                          Choose File
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Supported formats: PDF, JPG, PNG (Max 10MB)</p>
                    </div>
                    {uploadedFile && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">
                            {uploadedFile.name} uploaded successfully
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={analyzeReport}
                    disabled={!uploadedFile || isAnalyzing}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Analyzing Report...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Analyze Report
                      </>
                    )}
                  </Button>

                  {analysisResults && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                          <p className="text-2xl font-bold text-blue-600">{analysisResults.totalItems}</p>
                          <p className="text-sm text-gray-600">Total Items</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg text-center">
                          <p className="text-2xl font-bold text-red-600">{analysisResults.negativeItems}</p>
                          <p className="text-sm text-gray-600">Negative Items</p>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg text-center">
                          <p className="text-2xl font-bold text-yellow-600">{analysisResults.potentialErrors}</p>
                          <p className="text-sm text-gray-600">Potential Errors</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                          <p className="text-2xl font-bold text-green-600">{Math.abs(analysisResults.scoreImpact)}</p>
                          <p className="text-sm text-gray-600">Point Impact</p>
                        </div>
                      </div>

                      <Card>
                        <CardHeader>
                          <CardTitle>Detected Errors</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {analysisResults.errorDetails.map((error: any, index: number) => (
                              <div key={index} className="border rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <h4 className="font-medium">{error.type}</h4>
                                      <Badge
                                        variant={
                                          error.impact === "High"
                                            ? "destructive"
                                            : error.impact === "Medium"
                                              ? "default"
                                              : "secondary"
                                        }
                                      >
                                        {error.impact} Impact
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1">{error.account}</p>
                                    <p className="text-sm">{error.description}</p>
                                  </div>
                                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                    Dispute
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Recommendations</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {analysisResults.recommendations.map((rec: string, index: number) => (
                              <div key={index} className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm">{rec}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="simulator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5" />
                  <span>Credit Score Simulator</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="current-score">Current Credit Score</Label>
                        <Input
                          id="current-score"
                          type="number"
                          value={simulationInputs.currentScore}
                          onChange={(e) =>
                            setSimulationInputs({
                              ...simulationInputs,
                              currentScore: Number.parseInt(e.target.value),
                            })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="payoff-amount">Pay Off Credit Card Debt ($)</Label>
                        <Input
                          id="payoff-amount"
                          type="number"
                          value={simulationInputs.payOffAmount}
                          onChange={(e) =>
                            setSimulationInputs({
                              ...simulationInputs,
                              payOffAmount: Number.parseInt(e.target.value),
                            })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="credit-limit">Request Credit Limit Increase ($)</Label>
                        <Input
                          id="credit-limit"
                          type="number"
                          value={simulationInputs.newCreditLimit}
                          onChange={(e) =>
                            setSimulationInputs({
                              ...simulationInputs,
                              newCreditLimit: Number.parseInt(e.target.value),
                            })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="payment-history">Payment History</Label>
                        <Select
                          value={simulationInputs.paymentHistory}
                          onValueChange={(value) =>
                            setSimulationInputs({
                              ...simulationInputs,
                              paymentHistory: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="current">Keep Current</SelectItem>
                            <SelectItem value="improve">Improve (catch up on late payments)</SelectItem>
                            <SelectItem value="maintain">Maintain Perfect Record</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Button
                        onClick={runSimulation}
                        disabled={isSimulating}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {isSimulating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Running Simulation...
                          </>
                        ) : (
                          <>
                            <Calculator className="h-4 w-4 mr-2" />
                            Run Simulation
                          </>
                        )}
                      </Button>

                      {simulationResults && (
                        <div className="space-y-4">
                          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg text-center">
                            <div className="flex items-center justify-center space-x-4 mb-4">
                              <div>
                                <p className="text-sm text-gray-600">Current Score</p>
                                <p className="text-2xl font-bold text-blue-600">{simulationResults.currentScore}</p>
                              </div>
                              <TrendingUp className="h-8 w-8 text-green-600" />
                              <div>
                                <p className="text-sm text-gray-600">Projected Score</p>
                                <p className="text-2xl font-bold text-green-600">{simulationResults.projectedScore}</p>
                              </div>
                            </div>
                            <Badge className="bg-green-100 text-green-800">
                              +{simulationResults.scoreChange} Point Increase
                            </Badge>
                            <p className="text-sm text-gray-600 mt-2">{simulationResults.timeline}</p>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-medium">Impact Breakdown:</h4>
                            {simulationResults.factors.map((factor: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                  <p className="font-medium">{factor.factor}</p>
                                  <p className="text-sm text-gray-600">{factor.description}</p>
                                </div>
                                <Badge variant={factor.impact > 0 ? "default" : "destructive"}>
                                  {factor.impact > 0 ? "+" : ""}
                                  {factor.impact}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calculator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Credit Utilization Calculator</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Why Credit Utilization Matters</h3>
                    <p className="text-sm text-gray-600">
                      Credit utilization accounts for 30% of your credit score. Keeping it below 30% (ideally under 10%)
                      can significantly improve your score.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Current Credit Cards</h4>
                      <div className="space-y-3">
                        {[
                          { name: "Chase Freedom", balance: 1200, limit: 5000 },
                          { name: "Capital One", balance: 800, limit: 3000 },
                          { name: "Discover", balance: 0, limit: 2000 },
                        ].map((card, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium">{card.name}</span>
                              <span className="text-sm text-gray-600">
                                {((card.balance / card.limit) * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Balance: ${card.balance.toLocaleString()}</span>
                                <span>Limit: ${card.limit.toLocaleString()}</span>
                              </div>
                              <Progress value={(card.balance / card.limit) * 100} className="h-2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-3">Overall Utilization</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Total Balance:</span>
                            <span className="font-medium">$2,000</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Limits:</span>
                            <span className="font-medium">$10,000</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Current Utilization:</span>
                            <span className="font-medium text-yellow-600">20%</span>
                          </div>
                        </div>
                        <Progress value={20} className="h-3 mt-3" />
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium">Optimization Recommendations</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Pay down Chase Freedom by $700 to reach 10% utilization</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Request credit limit increase on Capital One</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Keep Discover card at $0 balance</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracker" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Dispute Tracker</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600">12</p>
                      <p className="text-sm text-gray-600">Active Disputes</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600">8</p>
                      <p className="text-sm text-gray-600">Resolved</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-yellow-600">3</p>
                      <p className="text-sm text-gray-600">Pending Response</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        id: "D001",
                        item: "Late Payment - Capital One",
                        bureau: "Experian",
                        status: "In Progress",
                        filed: "2024-01-15",
                        dueDate: "2024-02-14",
                        progress: 60,
                      },
                      {
                        id: "D002",
                        item: "Collection Account - ABC Collections",
                        bureau: "Equifax",
                        status: "Resolved",
                        filed: "2024-01-10",
                        dueDate: "2024-02-09",
                        progress: 100,
                      },
                      {
                        id: "D003",
                        item: "Incorrect Balance - Chase Card",
                        bureau: "TransUnion",
                        status: "Pending",
                        filed: "2024-01-20",
                        dueDate: "2024-02-19",
                        progress: 25,
                      },
                    ].map((dispute) => (
                      <div key={dispute.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium">{dispute.item}</h4>
                              <Badge variant="outline">{dispute.bureau}</Badge>
                              <Badge
                                className={
                                  dispute.status === "Resolved"
                                    ? "bg-green-100 text-green-800"
                                    : dispute.status === "In Progress"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-yellow-100 text-yellow-800"
                                }
                              >
                                {dispute.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>Dispute ID: {dispute.id}</p>
                              <p>
                                Filed: {dispute.filed} | Due: {dispute.dueDate}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{dispute.progress}%</span>
                          </div>
                          <Progress value={dispute.progress} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <FileText className="h-4 w-4 mr-2" />
                    File New Dispute
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
