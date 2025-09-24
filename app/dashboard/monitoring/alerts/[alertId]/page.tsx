"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, AlertTriangle, CheckCircle, Clock, Eye, Download, Share } from "lucide-react"

export default function AlertDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const alertId = params.alertId as string
  const [alertData, setAlertData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching alert details
    const fetchAlertData = async () => {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock alert data - in real app, this would come from API
      const mockAlertData = {
        id: alertId,
        type: "new_inquiry",
        severity: "high",
        title: "New Hard Inquiry Detected",
        description:
          "Chase Bank performed a hard inquiry on your Experian credit report. This may impact your credit score by 5-10 points.",
        date: "2024-01-20T10:30:00Z",
        bureau: "Experian",
        status: "new",
        impact: "Negative",
        scoreChange: -7,
        details: {
          creditor: "Chase Bank",
          inquiryType: "Credit Card Application",
          inquiryDate: "2024-01-20",
          expectedImpact: "5-10 point decrease",
          inquiryPurpose: "New credit card application",
          accountType: "Revolving Credit",
          requestedAmount: "$15,000",
        },
        timeline: [
          {
            date: "2024-01-20T10:30:00Z",
            event: "Hard inquiry detected",
            description: "Chase Bank performed a hard inquiry on your Experian credit report",
            status: "detected",
          },
          {
            date: "2024-01-20T10:31:00Z",
            event: "Alert generated",
            description: "System generated alert for new hard inquiry",
            status: "generated",
          },
          {
            date: "2024-01-20T10:32:00Z",
            event: "Notification sent",
            description: "Email and SMS notifications sent to user",
            status: "notified",
          },
        ],
        recommendations: [
          {
            title: "Verify Authorization",
            description: "Confirm that you authorized this credit inquiry with Chase Bank",
            priority: "high",
            action: "Contact Chase Bank to verify the application",
          },
          {
            title: "Monitor Score Impact",
            description: "Watch for score changes over the next 30 days",
            priority: "medium",
            action: "Check your credit score weekly for the next month",
          },
          {
            title: "Consider Dispute",
            description: "If unauthorized, dispute this inquiry immediately",
            priority: "high",
            action: "Generate dispute letter if inquiry was not authorized",
          },
        ],
        relatedAlerts: [
          {
            id: "alert_456",
            title: "Credit Score Decreased",
            date: "2024-01-20T14:00:00Z",
            severity: "medium",
          },
          {
            id: "alert_789",
            title: "New Account Application",
            date: "2024-01-20T10:25:00Z",
            severity: "low",
          },
        ],
      }

      setAlertData(mockAlertData)
      setLoading(false)
    }

    fetchAlertData()
  }, [alertId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading alert details...</p>
        </div>
      </div>
    )
  }

  if (!alertData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Alert not found</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "Positive":
        return "text-green-600"
      case "Negative":
        return "text-red-600"
      case "Neutral":
        return "text-gray-600"
      default:
        return "text-gray-600"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
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
                <h1 className="text-2xl font-bold text-gray-900">Alert Details</h1>
                <p className="text-gray-600">Alert ID: {alertData.id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" className="bg-transparent">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" className="bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Alert Overview */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className="mt-1">
                  {alertData.severity === "high" && <AlertTriangle className="h-6 w-6 text-red-600" />}
                  {alertData.severity === "medium" && <Clock className="h-6 w-6 text-yellow-600" />}
                  {alertData.severity === "low" && <CheckCircle className="h-6 w-6 text-green-600" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h2 className="text-xl font-semibold">{alertData.title}</h2>
                    <Badge className={getSeverityColor(alertData.severity)}>{alertData.severity}</Badge>
                    <Badge variant="outline">{alertData.bureau}</Badge>
                  </div>
                  <p className="text-gray-600 mb-4">{alertData.description}</p>
                  <div className="grid md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Date Detected</p>
                      <p className="font-medium">{new Date(alertData.date).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Impact</p>
                      <p className={`font-medium ${getImpactColor(alertData.impact)}`}>
                        {alertData.impact}
                        {alertData.scoreChange !== 0 && (
                          <span className="ml-1">
                            ({alertData.scoreChange > 0 ? "+" : ""}
                            {alertData.scoreChange} points)
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Status</p>
                      <p className="font-medium capitalize">{alertData.status}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Bureau</p>
                      <p className="font-medium">{alertData.bureau}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() =>
                    router.push(
                      `/dashboard/letters/generate?type=${alertData.type}&bureau=${alertData.bureau}&creditor=${alertData.details.creditor}`,
                    )
                  }
                >
                  Generate Dispute Letter
                </Button>
                <Button variant="outline" className="bg-transparent">
                  Mark as Resolved
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="related">Related Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Alert Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {Object.entries(alertData.details).map(([key, value]) => (
                    <div key={key} className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-600 capitalize mb-1">{key.replace(/([A-Z])/g, " $1")}</p>
                      <p className="font-medium">{value as string}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Alert Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alertData.timeline.map((event: any, index: number) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{event.event}</h4>
                          <span className="text-sm text-gray-500">{new Date(event.date).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-600">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <div className="space-y-4">
              {alertData.recommendations.map((rec: any, index: number) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold">{rec.title}</h3>
                          <Badge className={getPriorityColor(rec.priority)}>{rec.priority}</Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{rec.description}</p>
                        <p className="text-sm font-medium text-blue-600">{rec.action}</p>
                      </div>
                      <Button
                        size="sm"
                        className="ml-4 bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          if (rec.title.includes("Dispute")) {
                            router.push(`/dashboard/letters/generate?type=${alertData.type}&bureau=${alertData.bureau}`)
                          }
                        }}
                      >
                        Take Action
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="related" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Related Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alertData.relatedAlerts.map((alert: any) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/dashboard/monitoring/alerts/${alert.id}`)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <Eye className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">{alert.title}</p>
                          <p className="text-sm text-gray-600">{new Date(alert.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
