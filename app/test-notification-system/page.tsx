"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Bell, Plus, Trash2, Eye, Volume2, VolumeX } from "lucide-react"
import { useNotifications } from "@/lib/notification-context"
import { notificationTemplateService } from "@/lib/notification-templates"
import { notificationAnalyticsService } from "@/lib/notification-analytics"
import { notificationSoundSystem } from "@/lib/notification-sound-system"
import { pushNotificationService } from "@/lib/push-notification-service"

export default function TestNotificationSystemPage() {
  const { 
    notifications, 
    unreadCount, 
    addNotification, 
    addNotificationFromTemplate,
    markAsRead, 
    removeNotification,
    getAnalytics,
    getUserEngagementProfile,
    playNotificationSound,
    getSoundSettings,
    updateSoundSettings
  } = useNotifications()

  const [testResults, setTestResults] = useState<string[]>([])
  const [customNotification, setCustomNotification] = useState({
    title: "",
    message: "",
    type: "info" as const,
    priority: "medium" as const,
    category: "system"
  })

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const testAddCustomNotification = async () => {
    try {
      await addNotification({
        title: customNotification.title || "Test Notification",
        message: customNotification.message || "This is a test notification",
        type: customNotification.type,
        priority: customNotification.priority,
        category: customNotification.category
      })
      addTestResult("✅ Custom notification added successfully")
    } catch (error) {
      addTestResult(`❌ Failed to add custom notification: ${error}`)
    }
  }

  const testTemplateNotification = async (templateId: string) => {
    try {
      const template = notificationTemplateService.getTemplate(templateId)
      if (!template) {
        addTestResult(`❌ Template not found: ${templateId}`)
        return
      }

      const sampleData = {
        bureau: "Experian",
        points: "15",
        newScore: "720",
        accountName: "Credit Card Account",
        result: "Account removed successfully",
        courseName: "Advanced Dispute Strategies",
        amount: "79.97",
        service: "FCRA Complaint Service"
      }

      await addNotificationFromTemplate(templateId, sampleData)
      addTestResult(`✅ Template notification added: ${template.name}`)
    } catch (error) {
      addTestResult(`❌ Failed to add template notification: ${error}`)
    }
  }

  const testSoundSystem = async () => {
    try {
      const settings = getSoundSettings()
      if (settings.enabled) {
        await playNotificationSound("success")
        addTestResult("✅ Sound system test successful")
      } else {
        addTestResult("⚠️ Sound system is disabled")
      }
    } catch (error) {
      addTestResult(`❌ Sound system test failed: ${error}`)
    }
  }

  const testPushNotifications = async () => {
    try {
      const status = pushNotificationService.getStatus()
      if (status.supported && status.permission === 'granted') {
        await pushNotificationService.testNotification()
        addTestResult("✅ Push notification test successful")
      } else if (status.permission === 'default') {
        const permission = await pushNotificationService.requestPermission()
        addTestResult(`📱 Push permission requested: ${permission}`)
      } else {
        addTestResult(`⚠️ Push notifications not available: ${status.permission}`)
      }
    } catch (error) {
      addTestResult(`❌ Push notification test failed: ${error}`)
    }
  }

  const testAnalytics = () => {
    try {
      const analytics = getAnalytics()
      const userProfile = getUserEngagementProfile()
      
      addTestResult(`📊 Analytics - Total sent: ${analytics.totalSent}, Read rate: ${analytics.readRate}%`)
      addTestResult(`👤 User profile - Engagement score: ${userProfile?.engagementScore || 0}`)
    } catch (error) {
      addTestResult(`❌ Analytics test failed: ${error}`)
    }
  }

  const clearAllNotifications = async () => {
    try {
      for (const notification of notifications) {
        await removeNotification(notification.id)
      }
      addTestResult("🧹 All notifications cleared")
    } catch (error) {
      addTestResult(`❌ Failed to clear notifications: ${error}`)
    }
  }

  const templates = notificationTemplateService.getAllTemplates()
  const soundSettings = getSoundSettings()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notification System Test</h1>
          <p className="text-gray-600">Test all aspects of the notification system</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Current Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Current Notifications ({notifications.length})</span>
                </CardTitle>
                <Badge variant={unreadCount > 0 ? "destructive" : "secondary"}>
                  {unreadCount} unread
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No notifications</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border ${
                        !notification.read ? "bg-blue-50 border-blue-200" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {notification.type}
                            </Badge>
                            <Badge 
                              variant={notification.priority === "high" ? "destructive" : "secondary"}
                              className="text-xs"
                            >
                              {notification.priority}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeNotification(notification.id)}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Controls */}
          <div className="space-y-6">
            {/* Custom Notification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Custom Notification</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={customNotification.title}
                    onChange={(e) => setCustomNotification(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Notification title"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={customNotification.message}
                    onChange={(e) => setCustomNotification(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Notification message"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={customNotification.type}
                      onValueChange={(value: any) => setCustomNotification(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={customNotification.priority}
                      onValueChange={(value: any) => setCustomNotification(prev => ({ ...prev, priority: value }))}
                    >
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
                <Button onClick={testAddCustomNotification} className="w-full">
                  Add Custom Notification
                </Button>
              </CardContent>
            </Card>

            {/* Template Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Template Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                  {templates.slice(0, 8).map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      size="sm"
                      onClick={() => testTemplateNotification(template.id)}
                      className="justify-start text-left h-auto p-2"
                    >
                      <div>
                        <div className="font-medium text-xs">{template.name}</div>
                        <div className="text-xs text-muted-foreground">{template.category}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Tests */}
            <Card>
              <CardHeader>
                <CardTitle>System Tests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {soundSettings.enabled ? (
                      <Volume2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <VolumeX className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm">Sound System</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={testSoundSystem}>
                    Test
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Push Notifications</span>
                  <Button variant="outline" size="sm" onClick={testPushNotifications}>
                    Test
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Analytics</span>
                  <Button variant="outline" size="sm" onClick={testAnalytics}>
                    Test
                  </Button>
                </div>

                <Separator />

                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={clearAllNotifications}
                  className="w-full"
                >
                  Clear All Notifications
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            {testResults.length === 0 ? (
              <p className="text-muted-foreground">No test results yet</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono bg-gray-100 p-2 rounded">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

