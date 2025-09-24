"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useNotifications } from "@/lib/notification-context"
import { PushNotificationPermissionManager } from "@/components/push-notification-permission-manager"
import { 
  Smartphone, 
  Bell, 
  Settings, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Send,
  Clock,
  Shield,
  Zap
} from "lucide-react"

interface PushNotificationStatus {
  supported: boolean
  permission: NotificationPermission
  canRequest: boolean
  isBlocked: boolean
}

interface PushNotificationSettings {
  enabled: boolean
  permission: NotificationPermission
  categories: {
    [category: string]: boolean
  }
  quietHours: {
    enabled: boolean
    start: string
    end: string
    timezone: string
  }
  frequency: 'immediate' | 'batched' | 'digest'
  digestInterval: number
}

export default function PushNotificationPage() {
  const { addNotification } = useNotifications()
  const [status, setStatus] = useState<PushNotificationStatus | null>(null)
  const [settings, setSettings] = useState<PushNotificationSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isTesting, setIsTesting] = useState(false)
  const [testForm, setTestForm] = useState({
    title: 'Test Notification',
    body: 'This is a test push notification',
    category: 'system'
  })

  useEffect(() => {
    loadPushNotificationData()
  }, [])

  const loadPushNotificationData = async () => {
    try {
      setIsLoading(true)
      
      // Load status
      const statusResponse = await fetch('/api/notifications/push?action=status')
      const statusData = await statusResponse.json()
      if (statusData.success) {
        setStatus(statusData.status)
      }

      // Load settings
      const settingsResponse = await fetch('/api/notifications/push?action=settings')
      const settingsData = await settingsResponse.json()
      if (settingsData.success) {
        setSettings(settingsData.settings)
      }
    } catch (error) {
      console.error('Error loading push notification data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestNotification = async () => {
    try {
      setIsTesting(true)
      const response = await fetch('/api/notifications/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test-notification'
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        addNotification({
          title: "Test Notification Sent! 🧪",
          message: "Check your device for the test push notification",
          type: "success",
          priority: "medium",
          category: "system"
        })
      } else {
        addNotification({
          title: "Test Failed ❌",
          message: result.error || "Failed to send test notification",
          type: "error",
          priority: "high",
          category: "system"
        })
      }
    } catch (error) {
      console.error('Error testing notification:', error)
      addNotification({
        title: "Test Error ❌",
        message: "An error occurred while testing the notification",
        type: "error",
        priority: "high",
        category: "system"
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleSendCustomNotification = async () => {
    try {
      setIsTesting(true)
      const response = await fetch('/api/notifications/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send-notification',
          title: testForm.title,
          body: testForm.body,
          options: {
            icon: '/icons/notification-bell.png',
            tag: 'custom-test',
            requireInteraction: false
          }
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        addNotification({
          title: "Custom Notification Sent! 📱",
          message: "Your custom push notification has been sent",
          type: "success",
          priority: "medium",
          category: "system"
        })
      } else {
        addNotification({
          title: "Send Failed ❌",
          message: result.error || "Failed to send custom notification",
          type: "error",
          priority: "high",
          category: "system"
        })
      }
    } catch (error) {
      console.error('Error sending custom notification:', error)
      addNotification({
        title: "Send Error ❌",
        message: "An error occurred while sending the notification",
        type: "error",
        priority: "high",
        category: "system"
      })
    } finally {
      setIsTesting(false)
    }
  }

  const updateCategorySetting = async (category: string, enabled: boolean) => {
    if (!settings) return

    const updatedSettings = {
      ...settings,
      categories: {
        ...settings.categories,
        [category]: enabled
      }
    }

    try {
      const response = await fetch('/api/notifications/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update-settings',
          settings: updatedSettings
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        setSettings(updatedSettings)
        addNotification({
          title: "Settings Updated! ⚙️",
          message: "Push notification settings have been updated",
          type: "success",
          priority: "medium",
          category: "system"
        })
      }
    } catch (error) {
      console.error('Error updating settings:', error)
    }
  }

  const getStatusIcon = () => {
    if (!status) return <AlertTriangle className="h-5 w-5 text-gray-500" />
    
    switch (status.permission) {
      case 'granted':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'denied':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
    }
  }

  const getStatusBadge = () => {
    if (!status) return <Badge variant="outline">Unknown</Badge>
    
    switch (status.permission) {
      case 'granted':
        return <Badge className="bg-green-100 text-green-800">Enabled</Badge>
      case 'denied':
        return <Badge className="bg-red-100 text-red-800">Blocked</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Not Set</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading push notification settings...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Smartphone className="h-8 w-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">Push Notifications</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Manage push notifications to stay updated with important alerts and updates
            </p>
          </div>

          {/* Status Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon()}
                  <div>
                    <CardTitle>Push Notification Status</CardTitle>
                    <CardDescription>
                      {status?.supported 
                        ? 'Push notifications are supported in your browser'
                        : 'Push notifications are not supported in your browser'
                      }
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge()}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Secure</span>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                  <Zap className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Instant</span>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">24/7</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permission Manager */}
          <PushNotificationPermissionManager />

          {/* Settings */}
          {status?.permission === 'granted' && settings && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Notification Categories</span>
                </CardTitle>
                <CardDescription>
                  Choose which types of notifications you want to receive via push
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(settings.categories).map(([category, enabled]) => (
                    <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Bell className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium capitalize">{category}</h4>
                          <p className="text-sm text-gray-600">
                            {category === 'credit' && 'Credit score changes and report updates'}
                            {category === 'dispute' && 'Dispute status updates and responses'}
                            {category === 'training' && 'Training progress and course completions'}
                            {category === 'payment' && 'Payment confirmations and billing updates'}
                            {category === 'system' && 'System maintenance and feature updates'}
                            {category === 'alerts' && 'Important alerts and warnings'}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) => updateCategorySetting(category, checked)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Test Notifications */}
          {status?.permission === 'granted' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TestTube className="h-5 w-5" />
                  <span>Test Notifications</span>
                </CardTitle>
                <CardDescription>
                  Send test notifications to verify your push notification setup
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex space-x-4">
                  <Button
                    onClick={handleTestNotification}
                    disabled={isTesting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    {isTesting ? 'Sending...' : 'Send Test Notification'}
                  </Button>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">Custom Test Notification</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="testTitle">Title</Label>
                      <Input
                        id="testTitle"
                        value={testForm.title}
                        onChange={(e) => setTestForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter notification title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="testBody">Message</Label>
                      <Textarea
                        id="testBody"
                        value={testForm.body}
                        onChange={(e) => setTestForm(prev => ({ ...prev, body: e.target.value }))}
                        placeholder="Enter notification message"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="testCategory">Category</Label>
                      <Select value={testForm.category} onValueChange={(value) => setTestForm(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="credit">Credit</SelectItem>
                          <SelectItem value="dispute">Dispute</SelectItem>
                          <SelectItem value="training">Training</SelectItem>
                          <SelectItem value="payment">Payment</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                          <SelectItem value="alerts">Alerts</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={handleSendCustomNotification}
                      disabled={isTesting || !testForm.title || !testForm.body}
                      variant="outline"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isTesting ? 'Sending...' : 'Send Custom Notification'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help & Support */}
          <Card>
            <CardHeader>
              <CardTitle>Help & Support</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Not receiving notifications?</strong> Make sure your browser allows notifications for this site. 
                    Check your browser's notification settings and ensure this site is not blocked.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Chrome/Edge</h4>
                    <p className="text-sm text-gray-600">
                      Click the lock icon in the address bar → Site settings → Notifications → Allow
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Firefox</h4>
                    <p className="text-sm text-gray-600">
                      Click the shield icon in the address bar → Permissions → Notifications → Allow
                    </p>
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
























