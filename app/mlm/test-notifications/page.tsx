"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { 
  Bell, 
  Send, 
  TestTube, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  DollarSign,
  Users,
  Trophy,
  BookOpen,
  Target
} from "lucide-react"
import { useMLMNotifications } from "@/lib/mlm-notification-context"
import { mlmNotificationService } from "@/lib/mlm-notification-service"
import { pushNotificationService } from "@/lib/push-notification-service"

export default function TestMLMNotificationsPage() {
  const { addNotification, notifications, unreadCount } = useMLMNotifications()
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])

  // Test notification form state
  const [testForm, setTestForm] = useState({
    title: "",
    message: "",
    type: "info",
    priority: "medium",
    category: "general"
  })

  const handleSendTestNotification = async () => {
    if (!testForm.title || !testForm.message) {
      alert("Please fill in title and message")
      return
    }

    setIsLoading(true)
    try {
      await addNotification({
        title: testForm.title,
        message: testForm.message,
        type: testForm.type as any,
        priority: testForm.priority as any,
        category: testForm.category,
        actions: [
          {
            label: "View Details",
            action: "view_details",
            variant: "default"
          }
        ]
      })

      setTestResults(prev => [...prev, {
        id: Date.now(),
        type: "success",
        message: "Test notification sent successfully!",
        timestamp: new Date().toISOString()
      }])

      // Reset form
      setTestForm({
        title: "",
        message: "",
        type: "info",
        priority: "medium",
        category: "general"
      })
    } catch (error) {
      setTestResults(prev => [...prev, {
        id: Date.now(),
        type: "error",
        message: `Error sending notification: ${error}`,
        timestamp: new Date().toISOString()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendPredefinedNotification = async (type: string) => {
    setIsLoading(true)
    try {
      switch (type) {
        case "team_join":
          mlmNotificationService.createTeamJoinNotification("John Smith", "Associate", "TEAM123")
          break
        case "rank_advancement":
          mlmNotificationService.createRankAdvancementNotification("Sarah Johnson", "Associate", "Manager")
          break
        case "commission_earned":
          mlmNotificationService.createCommissionEarnedNotification(125.50, "Team Bonus", "From team member sales")
          break
        case "payout_processed":
          mlmNotificationService.createPayoutProcessedNotification(500.00, "Bank Transfer")
          break
        case "training_completed":
          mlmNotificationService.createTrainingCompletedNotification("MLM Fundamentals", 50)
          break
        case "milestone":
          mlmNotificationService.createMilestoneNotification("Team Builder", "Built a team of 10+ members")
          break
        case "invitation_sent":
          mlmNotificationService.createInvitationSentNotification("test@example.com", "TEAM456")
          break
        case "alert":
          mlmNotificationService.createAlertNotification("System Maintenance", "Scheduled maintenance in 2 hours", "view_maintenance")
          break
        case "info":
          mlmNotificationService.createInfoNotification("New Feature", "Check out our new commission calculator", "view_calculator")
          break
        default:
          throw new Error("Unknown notification type")
      }

      setTestResults(prev => [...prev, {
        id: Date.now(),
        type: "success",
        message: `Predefined ${type} notification sent successfully!`,
        timestamp: new Date().toISOString()
      }])
    } catch (error) {
      setTestResults(prev => [...prev, {
        id: Date.now(),
        type: "error",
        message: `Error sending ${type} notification: ${error}`,
        timestamp: new Date().toISOString()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestPushNotification = async () => {
    try {
      await pushNotificationService.testNotification()
      setTestResults(prev => [...prev, {
        id: Date.now(),
        type: "success",
        message: "Push notification test sent!",
        timestamp: new Date().toISOString()
      }])
    } catch (error) {
      setTestResults(prev => [...prev, {
        id: Date.now(),
        type: "error",
        message: `Push notification test failed: ${error}`,
        timestamp: new Date().toISOString()
      }])
    }
  }

  const clearTestResults = () => {
    setTestResults([])
  }

  const predefinedNotifications = [
    { type: "team_join", title: "Team Join", description: "New member joined team", icon: Users },
    { type: "rank_advancement", title: "Rank Advancement", description: "Member promoted to new rank", icon: Trophy },
    { type: "commission_earned", title: "Commission Earned", description: "Earnings from team activities", icon: DollarSign },
    { type: "payout_processed", title: "Payout Processed", description: "Payment sent to bank account", icon: DollarSign },
    { type: "training_completed", title: "Training Completed", description: "Course finished successfully", icon: BookOpen },
    { type: "milestone", title: "Milestone Achieved", description: "Team goal reached", icon: Target },
    { type: "invitation_sent", title: "Invitation Sent", description: "Team invitation dispatched", icon: Bell },
    { type: "alert", title: "System Alert", description: "Important system notification", icon: AlertTriangle },
    { type: "info", title: "Info Update", description: "General information update", icon: Info },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Test MLM Notifications</h1>
        <p className="text-gray-600">
          Test the MLM notification system with various notification types and scenarios
        </p>
      </div>

      {/* Current Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Current Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{notifications.length}</div>
              <div className="text-sm text-gray-600">Total Notifications</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
              <div className="text-sm text-gray-600">Unread Notifications</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{testResults.length}</div>
              <div className="text-sm text-gray-600">Test Results</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Custom Notification Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TestTube className="h-5 w-5" />
              <span>Custom Notification</span>
            </CardTitle>
            <CardDescription>
              Create a custom notification to test the system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={testForm.title}
                onChange={(e) => setTestForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Notification title"
              />
            </div>
            
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={testForm.message}
                onChange={(e) => setTestForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Notification message"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={testForm.type} onValueChange={(value) => setTestForm(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="team_join">Team Join</SelectItem>
                    <SelectItem value="commission_earned">Commission Earned</SelectItem>
                    <SelectItem value="payout_processed">Payout Processed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={testForm.priority} onValueChange={(value) => setTestForm(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleSendTestNotification} 
              disabled={isLoading}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? "Sending..." : "Send Test Notification"}
            </Button>
          </CardContent>
        </Card>

        {/* Predefined Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Predefined Notifications</span>
            </CardTitle>
            <CardDescription>
              Test common MLM notification scenarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              {predefinedNotifications.map((notification) => {
                const IconComponent = notification.icon
                return (
                  <Button
                    key={notification.type}
                    variant="outline"
                    onClick={() => handleSendPredefinedNotification(notification.type)}
                    disabled={isLoading}
                    className="justify-start h-auto p-3"
                  >
                    <IconComponent className="h-4 w-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-xs text-gray-500">{notification.description}</div>
                    </div>
                  </Button>
                )
              })}
            </div>

            <Separator className="my-4" />

            <Button 
              onClick={handleTestPushNotification}
              variant="outline"
              className="w-full"
            >
              <Bell className="h-4 w-4 mr-2" />
              Test Push Notification
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Test Results</span>
              </CardTitle>
              <Button variant="outline" size="sm" onClick={clearTestResults}>
                Clear Results
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {testResults.map((result) => (
                <div
                  key={result.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    result.type === "success" 
                      ? "border-l-green-500 bg-green-50" 
                      : "border-l-red-500 bg-red-50"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {result.type === "success" ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm font-medium">{result.message}</span>
                    <span className="text-xs text-gray-500 ml-auto">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}