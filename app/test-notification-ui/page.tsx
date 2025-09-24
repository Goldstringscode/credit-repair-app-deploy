"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useNotifications } from '@/lib/notification-context'
import { NotificationBellIntegrated } from '@/components/notification-bell-integrated'
import { SimpleNotificationBell } from '@/components/simple-notification-bell'
import { NotificationDebug } from '@/components/notification-debug'
import { Bell, CheckCircle, AlertCircle, Info, Zap } from 'lucide-react'

export default function TestNotificationUIPage() {
  const { addNotification, notifications, markAsRead, deleteNotification } = useNotifications()
  const [testResults, setTestResults] = useState<string[]>([])

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testBasicNotification = () => {
    try {
      addNotification({
        title: 'Test Notification',
        message: 'This is a test notification to verify the system is working!',
        type: 'info',
        priority: 'medium',
        category: 'system',
        userId: 'test-user-123',
        actions: [
          { label: 'Got it!', action: 'dismiss' }
        ]
      })
      addTestResult('✅ Basic notification created successfully')
    } catch (error) {
      addTestResult(`❌ Error creating notification: ${error}`)
    }
  }

  const testSuccessNotification = () => {
    try {
      addNotification({
        title: 'Success!',
        message: 'Your credit report has been uploaded successfully.',
        type: 'success',
        priority: 'high',
        category: 'credit-report',
        userId: 'test-user-123',
        actions: [
          { label: 'View Report', action: 'navigate', value: '/dashboard/reports' },
          { label: 'Start Analysis', action: 'navigate', value: '/dashboard/analysis' }
        ]
      })
      addTestResult('✅ Success notification created')
    } catch (error) {
      addTestResult(`❌ Error creating success notification: ${error}`)
    }
  }

  const testErrorNotification = () => {
    try {
      addNotification({
        title: 'Upload Failed',
        message: 'There was an error uploading your credit report. Please try again.',
        type: 'error',
        priority: 'high',
        category: 'credit-report',
        userId: 'test-user-123',
        actions: [
          { label: 'Retry Upload', action: 'navigate', value: '/dashboard/reports/upload' },
          { label: 'Contact Support', action: 'navigate', value: '/support' }
        ]
      })
      addTestResult('✅ Error notification created')
    } catch (error) {
      addTestResult(`❌ Error creating error notification: ${error}`)
    }
  }

  const testWarningNotification = () => {
    try {
      addNotification({
        title: 'System Maintenance',
        message: 'Scheduled maintenance will occur tonight from 2-4 AM EST.',
        type: 'warning',
        priority: 'medium',
        category: 'system',
        userId: 'test-user-123',
        actions: [
          { label: 'Learn More', action: 'navigate', value: '/support' }
        ]
      })
      addTestResult('✅ Warning notification created')
    } catch (error) {
      addTestResult(`❌ Error creating warning notification: ${error}`)
    }
  }

  const clearAllNotifications = () => {
    try {
      notifications.forEach(notification => {
        deleteNotification(notification.id)
      })
      addTestResult('✅ All notifications cleared')
    } catch (error) {
      addTestResult(`❌ Error clearing notifications: ${error}`)
    }
  }

  const markAllAsRead = () => {
    try {
      notifications.forEach(notification => {
        if (!notification.read) {
          markAsRead(notification.id)
        }
      })
      addTestResult('✅ All notifications marked as read')
    } catch (error) {
      addTestResult(`❌ Error marking notifications as read: ${error}`)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Notification System Test</h1>
            <p className="text-muted-foreground">
              Test the notification system UI and functionality
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Notifications</p>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {notifications.length}
              </Badge>
            </div>
            <div className="flex gap-2">
              <SimpleNotificationBell />
              <NotificationBellIntegrated />
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="flex justify-end">
          <NotificationDebug />
        </div>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Test Controls
            </CardTitle>
            <CardDescription>
              Click these buttons to test different types of notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button onClick={testBasicNotification} variant="outline">
                <Info className="h-4 w-4 mr-2" />
                Test Basic
              </Button>
              <Button onClick={testSuccessNotification} variant="outline" className="text-green-600">
                <CheckCircle className="h-4 w-4 mr-2" />
                Test Success
              </Button>
              <Button onClick={testErrorNotification} variant="outline" className="text-red-600">
                <AlertCircle className="h-4 w-4 mr-2" />
                Test Error
              </Button>
              <Button onClick={testWarningNotification} variant="outline" className="text-yellow-600">
                <AlertCircle className="h-4 w-4 mr-2" />
                Test Warning
              </Button>
            </div>
            
            <div className="flex gap-4 pt-4 border-t">
              <Button onClick={markAllAsRead} variant="secondary">
                Mark All as Read
              </Button>
              <Button onClick={clearAllNotifications} variant="destructive">
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Current Notifications ({notifications.length})
            </CardTitle>
            <CardDescription>
              All notifications currently in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No notifications yet</p>
                <p className="text-sm">Click the test buttons above to create notifications</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg ${
                      !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{notification.title}</h4>
                          <Badge variant={notification.type === 'error' ? 'destructive' : 'secondary'}>
                            {notification.type}
                          </Badge>
                          <Badge variant="outline">{notification.priority}</Badge>
                          {!notification.read && (
                            <Badge variant="default" className="bg-blue-500">New</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark Read
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Log of test actions and their results
            </CardDescription>
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
