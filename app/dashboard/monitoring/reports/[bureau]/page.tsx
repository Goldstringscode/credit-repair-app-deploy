"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Download,
  PrinterIcon as Print,
  Share,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  CreditCard,
  Building,
  Eye,
  FileText,
  Target,
} from "lucide-react"

export default function CreditReportPage() {
  const params = useParams()
  const router = useRouter()
  const bureau = params.bureau as string
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching detailed credit report data
    const fetchReportData = async () => {
      setLoading(true)
      // In real implementation, this would fetch from credit bureau APIs
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const mockReportData = {
        experian: {
          score: 742,
          scoreDate: "2024-01-20",
          model: "FICO Score 8",
          range: "300-850",
          previousScore: 740,
          factors: [
            { factor: "Payment History", impact: "Excellent", weight: 35, score: 95 },
            { factor: "Credit Utilization", impact: "Good", weight: 30, score: 78 },
            { factor: "Length of Credit History", impact: "Good", weight: 15, score: 82 },
            { factor: "Credit Mix", impact: "Fair", weight: 10, score: 65 },
            { factor: "New Credit", impact: "Good", weight: 10, score: 75 },
          ],
          accounts: [
            {
              id: "acc_1",
              creditor: "Chase Bank",
              accountType: "Credit Card",
              accountNumber: "****1234",
              status: "Open",
              balance: "$2,450",
              creditLimit: "$15,000",
              utilization: 16.3,
              paymentHistory: "Current",
              openDate: "2019-03-15",
              lastActivity: "2024-01-18",
              monthsReviewed: 24,
              latePayments: 0,
            },
            {
              id: "acc_2",
              creditor: "Capital One",
              accountType: "Credit Card",
              accountNumber: "****5678",
              status: "Open",
              balance: "$890",
              creditLimit: "$5,000",
              utilization: 17.8,
              paymentHistory: "Current",
              openDate: "2020-07-22",
              lastActivity: "2024-01-19",
              monthsReviewed: 24,
              latePayments: 1,
            },
            {
              id: "acc_3",
              creditor: "Wells Fargo",
              accountType: "Auto Loan",
              accountNumber: "****9012",
              status: "Open",
              balance: "$18,500",
              originalAmount: "$25,000",
              utilization: 0,
              paymentHistory: "Current",
              openDate: "2021-09-10",
              lastActivity: "2024-01-15",
              monthsReviewed: 24,
              latePayments: 0,
            },
          ],
          inquiries: [
            {
              id: "inq_1",
              creditor: "Chase Bank",
              date: "2024-01-20",
              type: "Hard Inquiry",
              purpose: "Credit Card Application",
            },
            {
              id: "inq_2",
              creditor: "Discover",
              date: "2023-11-15",
              type: "Hard Inquiry",
              purpose: "Credit Card Application",
            },
          ],
          publicRecords: [],
          personalInfo: {
            name: "John Doe",
            addresses: [
              {
                address: "123 Main St, Anytown, ST 12345",
                dateReported: "2024-01-01",
                source: "Chase Bank",
              },
            ],
            employment: [
              {
                employer: "Tech Corp",
                position: "Software Engineer",
                dateReported: "2023-06-01",
              },
            ],
          },
        },
      }

      setReportData(mockReportData[bureau as keyof typeof mockReportData])
      setLoading(false)
    }

    fetchReportData()
  }, [bureau])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your {bureau} credit report...</p>
        </div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Unable to load credit report data</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 740) return "text-green-600"
    if (score >= 670) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreRange = (score: number) => {
    if (score >= 800) return "Exceptional"
    if (score >= 740) return "Very Good"
    if (score >= 670) return "Good"
    if (score >= 580) return "Fair"
    return "Poor"
  }

  const getUtilizationColor = (utilization: number) => {
    if (utilization <= 10) return "text-green-600"
    if (utilization <= 30) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => router.back()} className="bg-transparent">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Monitoring
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 capitalize">{bureau} Credit Report</h1>
                <p className="text-gray-600">Detailed credit report analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" className="bg-transparent">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" className="bg-transparent">
                <Print className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Credit Score Overview */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Current Score</p>
                <p className={`text-4xl font-bold ${getScoreColor(reportData.score)}`}>{reportData.score}</p>
                <p className="text-sm text-gray-500">{reportData.model}</p>
                <Badge className={`mt-2 ${getScoreColor(reportData.score)} bg-transparent border`}>
                  {getScoreRange(reportData.score)}
                </Badge>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Previous Score</p>
                <p className="text-2xl font-semibold text-gray-700">{reportData.previousScore}</p>
                <div className="flex items-center justify-center mt-2">
                  {reportData.score > reportData.previousScore ? (
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span
                    className={`text-sm ${
                      reportData.score > reportData.previousScore ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {reportData.score > reportData.previousScore ? "+" : ""}
                    {reportData.score - reportData.previousScore} points
                  </span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Report Date</p>
                <p className="text-lg font-semibold text-gray-700">
                  {new Date(reportData.scoreDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500 mt-2">Range: {reportData.range}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="factors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="factors">Score Factors</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="factors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Credit Score Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {reportData.factors.map((factor: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">{factor.weight}%</span>
                          </div>
                          <div>
                            <p className="font-medium">{factor.factor}</p>
                            <p className="text-sm text-gray-600">Impact: {factor.impact}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{factor.score}/100</p>
                        </div>
                      </div>
                      <Progress value={factor.score} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-6">
            <div className="space-y-4">
              {reportData.accounts.map((account: any) => (
                <Card key={account.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {account.accountType === "Credit Card" ? (
                            <CreditCard className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Building className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{account.creditor}</h3>
                          <p className="text-sm text-gray-600">
                            {account.accountType} • {account.accountNumber}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={
                          account.status === "Open" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }
                      >
                        {account.status}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Balance</p>
                        <p className="font-semibold">{account.balance}</p>
                      </div>
                      {account.creditLimit && (
                        <div>
                          <p className="text-sm text-gray-600">Credit Limit</p>
                          <p className="font-semibold">{account.creditLimit}</p>
                        </div>
                      )}
                      {account.utilization > 0 && (
                        <div>
                          <p className="text-sm text-gray-600">Utilization</p>
                          <p className={`font-semibold ${getUtilizationColor(account.utilization)}`}>
                            {account.utilization}%
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-600">Payment History</p>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">{account.paymentHistory}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Opened</p>
                        <p className="font-medium">{new Date(account.openDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Last Activity</p>
                        <p className="font-medium">{new Date(account.lastActivity).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Late Payments</p>
                        <p className={`font-medium ${account.latePayments > 0 ? "text-red-600" : "text-green-600"}`}>
                          {account.latePayments} in {account.monthsReviewed} months
                        </p>
                      </div>
                    </div>

                    {account.latePayments > 0 && (
                      <div className="mt-4 p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <p className="text-sm text-red-800">
                            This account has late payments that may be impacting your score.
                          </p>
                        </div>
                        <Button
                          size="sm"
                          className="mt-2 bg-red-600 hover:bg-red-700"
                          onClick={() =>
                            router.push(
                              `/dashboard/letters/generate?type=late_payment&creditor=${encodeURIComponent(account.creditor)}&account=${encodeURIComponent(account.accountNumber)}`,
                            )
                          }
                        >
                          Dispute Late Payment
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="inquiries" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Credit Inquiries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.inquiries.map((inquiry: any) => (
                    <div key={inquiry.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <Eye className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium">{inquiry.creditor}</p>
                          <p className="text-sm text-gray-600">{inquiry.purpose}</p>
                          <p className="text-xs text-gray-500">{new Date(inquiry.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-orange-100 text-orange-800">{inquiry.type}</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 bg-transparent"
                          onClick={() =>
                            router.push(
                              `/dashboard/letters/generate?type=inquiry_dispute&creditor=${encodeURIComponent(inquiry.creditor)}&date=${encodeURIComponent(inquiry.date)}`,
                            )
                          }
                        >
                          Dispute
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personal" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{reportData.personalInfo.name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Addresses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.personalInfo.addresses.map((addr: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <p className="font-medium">{addr.address}</p>
                        <p className="text-sm text-gray-600">
                          Reported by: {addr.source} on {new Date(addr.dateReported).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-green-600" />
                    <span>Score Improvement Tips</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">Reduce Credit Utilization</h4>
                      <p className="text-sm text-green-700">
                        Your current utilization is 17%. Reducing it below 10% could increase your score by 10-20
                        points.
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Maintain Payment History</h4>
                      <p className="text-sm text-blue-700">
                        Continue making on-time payments to maintain your excellent payment history.
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h4 className="font-medium text-yellow-800 mb-2">Limit New Credit Applications</h4>
                      <p className="text-sm text-yellow-700">
                        Avoid applying for new credit for the next 6 months to let recent inquiries age.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span>Potential Disputes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Late Payment - Capital One</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Review the late payment reported by Capital One to ensure accuracy.
                      </p>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() =>
                          router.push("/dashboard/letters/generate?type=late_payment&creditor=Capital%20One")
                        }
                      >
                        Generate Dispute Letter
                      </Button>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Hard Inquiry - Chase Bank</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Recent hard inquiry from Chase Bank - verify if this was authorized.
                      </p>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() =>
                          router.push("/dashboard/letters/generate?type=inquiry_dispute&creditor=Chase%20Bank")
                        }
                      >
                        Dispute Inquiry
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
