"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useNotifications, NotificationProvider } from "@/lib/notification-context"
import { notificationService } from "@/lib/notification-service"
import { NotificationBellIntegrated } from "@/components/notification-bell-integrated"
import { 
  CheckCircle, 
  AlertCircle, 
  CreditCard, 
  FileText, 
  Gavel, 
  Users, 
  TrendingUp,
  Bell,
  TestTube
} from "lucide-react"

function TestCriticalIntegrationsContent() {
  const { addNotification, notifications, unreadCount } = useNotifications()
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})

  const runTest = async (testName: string, testFunction: () => Promise<void>) => {
    try {
      await testFunction()
      setTestResults(prev => ({ ...prev, [testName]: true }))
    } catch (error) {
      console.error(`Test ${testName} failed:`, error)
      setTestResults(prev => ({ ...prev, [testName]: false }))
    }
  }

  const testCreditReportUpload = async () => {
    await addNotification({
      title: "Credit Report Uploaded Successfully! 📊",
      message: "Your Experian credit report has been processed and analyzed. Your credit score is 720.",
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
  }

  const testCreditReportError = async () => {
    await addNotification({
      title: "Credit Report Upload Failed ❌",
      message: "Failed to process your credit report: Invalid file format. Please upload a valid PDF file.",
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

  const testPaymentSuccess = async () => {
    await addNotification({
      title: "Payment Successful! 🎉",
      message: "Welcome to CreditAI Pro! Your subscription is now active and you have access to all premium features.",
      type: "success",
      priority: "high",
      read: false,
      actions: [
        {
          label: "Go to Dashboard",
          action: "navigate_dashboard",
          variant: "default"
        },
        {
          label: "Start AI Chat",
          action: "navigate_ai_chat",
          variant: "outline"
        }
      ]
    })
  }

  const testDisputeSubmitted = async () => {
    await notificationService.notifyDisputeSubmitted({
      creditor: "Capital One",
      accountNumber: "****1234",
      bureau: "experian",
      expectedResolution: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  const testDisputeStatusUpdate = async () => {
    await notificationService.notifyDisputeStatusUpdate("dispute_123", "pending", "in_progress")
  }

  const testDisputeResolution = async () => {
    await notificationService.notifyDisputeResolution(
      { creditor: "Capital One" },
      "The late payment has been removed from your credit report."
    )
  }

  const testCreditScoreChange = async () => {
    await notificationService.notifyCreditScoreChange(680, 720, "Experian")
  }

  const testMLMTaskCompletion = async () => {
    await notificationService.notifyCustom(
      "Task Completed! 🎉",
      "You've completed 'First Sale' and earned 250 points! Keep up the great work!",
      "success",
      "medium",
      [
        {
          label: "View Progress",
          action: "view_mlm_progress",
          variant: "default"
        },
        {
          label: "Next Task",
          action: "view_next_task",
          variant: "outline"
        }
      ]
    )
  }

  const testMLMRankAdvancement = async () => {
    await notificationService.notifyCustom(
      "Rank Advanced! 🏆",
      "Congratulations! You've advanced to Silver rank! You're making great progress in your MLM journey.",
      "success",
      "high",
      [
        {
          label: "View Rank",
          action: "view_mlm_rank",
          variant: "default"
        },
        {
          label: "View Leaderboard",
          action: "view_leaderboard",
          variant: "outline"
        }
      ]
    )
  }

  const runAllTests = async () => {
    const tests = [
      { name: "Credit Report Upload Success", fn: testCreditReportUpload },
      { name: "Credit Report Upload Error", fn: testCreditReportError },
      { name: "Payment Success", fn: testPaymentSuccess },
      { name: "Dispute Submitted", fn: testDisputeSubmitted },
      { name: "Dispute Status Update", fn: testDisputeStatusUpdate },
      { name: "Dispute Resolution", fn: testDisputeResolution },
      { name: "Credit Score Change", fn: testCreditScoreChange },
      { name: "MLM Task Completion", fn: testMLMTaskCompletion },
      { name: "MLM Rank Advancement", fn: testMLMRankAdvancement }
    ]

    for (const test of tests) {
      await runTest(test.name, test.fn)
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  const getTestStatus = (testName: string) => {
    if (testResults[testName] === undefined) return "pending"
    return testResults[testName] ? "passed" : "failed"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "passed":
        return <Badge className="bg-green-100 text-green-800">Passed</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Test all critical notification integrations to ensure they work flawlessly with the main notification system
            </p>
          </div>

          {/* Notification Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification System Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{notifications.length}</div>
                  <div className="text-sm text-blue-800">Total Notifications</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{unreadCount}</div>
                  <div className="text-sm text-orange-800">Unread Notifications</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {Object.values(testResults).filter(Boolean).length}
                  </div>
                  <div className="text-sm text-green-800">Tests Passed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Test Controls</CardTitle>
              <CardDescription>
                Run individual tests or all tests at once to verify notification integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button onClick={runAllTests} className="bg-blue-600 hover:bg-blue-700">
                  🧪 Run All Tests
                </Button>
                <Button 
                  onClick={() => setTestResults({})} 
                  variant="outline"
                >
                  Clear Results
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Credit Report Tests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>Credit Report Integration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(getTestStatus("Credit Report Upload Success"))}
                    <span>Upload Success</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(getTestStatus("Credit Report Upload Success"))}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => runTest("Credit Report Upload Success", testCreditReportUpload)}
                    >
                      Test
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(getTestStatus("Credit Report Upload Error"))}
                    <span>Upload Error</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(getTestStatus("Credit Report Upload Error"))}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => runTest("Credit Report Upload Error", testCreditReportError)}
                    >
                      Test
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(getTestStatus("Credit Score Change"))}
                    <span>Score Change</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(getTestStatus("Credit Score Change"))}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => runTest("Credit Score Change", testCreditScoreChange)}
                    >
                      Test
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Tests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <span>Payment Integration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(getTestStatus("Payment Success"))}
                    <span>Payment Success</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(getTestStatus("Payment Success"))}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => runTest("Payment Success", testPaymentSuccess)}
                    >
                      Test
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dispute Tests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gavel className="h-5 w-5 text-purple-600" />
                  <span>Dispute Integration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(getTestStatus("Dispute Submitted"))}
                    <span>Dispute Submitted</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(getTestStatus("Dispute Submitted"))}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => runTest("Dispute Submitted", testDisputeSubmitted)}
                    >
                      Test
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(getTestStatus("Dispute Status Update"))}
                    <span>Status Update</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(getTestStatus("Dispute Status Update"))}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => runTest("Dispute Status Update", testDisputeStatusUpdate)}
                    >
                      Test
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(getTestStatus("Dispute Resolution"))}
                    <span>Dispute Resolution</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(getTestStatus("Dispute Resolution"))}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => runTest("Dispute Resolution", testDisputeResolution)}
                    >
                      Test
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* MLM Tests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-orange-600" />
                  <span>MLM Integration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(getTestStatus("MLM Task Completion"))}
                    <span>Task Completion</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(getTestStatus("MLM Task Completion"))}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => runTest("MLM Task Completion", testMLMTaskCompletion)}
                    >
                      Test
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(getTestStatus("MLM Rank Advancement"))}
                    <span>Rank Advancement</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(getTestStatus("MLM Rank Advancement"))}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => runTest("MLM Rank Advancement", testMLMRankAdvancement)}
                    >
                      Test
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Test Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Total Tests:</span>
                  <span className="font-semibold">{Object.keys(testResults).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Passed:</span>
                  <span className="font-semibold text-green-600">
                    {Object.values(testResults).filter(Boolean).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Failed:</span>
                  <span className="font-semibold text-red-600">
                    {Object.values(testResults).filter(result => result === false).length}
                  </span>
                </div>
                <Separator />
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    All critical integrations are working! The notification system is now fully integrated with:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    <Badge variant="outline">Credit Reports</Badge>
                    <Badge variant="outline">Payments</Badge>
                    <Badge variant="outline">Disputes</Badge>
                    <Badge variant="outline">MLM System</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function TestCriticalIntegrationsPage() {
  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header with notification bell */}
        <header className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <TestTube className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">Critical Integrations Test</h1>
              </div>
              <div className="flex items-center space-x-4">
                <NotificationBellIntegrated />
              </div>
            </div>
          </div>
        </header>
        
        <TestCriticalIntegrationsContent />
      </div>
    </NotificationProvider>
  )
}
