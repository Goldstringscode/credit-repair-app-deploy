"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function TestSimpleNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [testResults, setTestResults] = useState<string[]>([])

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const createNotification = (title: string, message: string, type: string) => {
    const newNotification = {
      id: `test-${Date.now()}`,
      title,
      message,
      type,
      priority: 'medium',
      timestamp: new Date().toISOString(),
      read: false
    }
    
    setNotifications(prev => [newNotification, ...prev])
    addTestResult(`✅ Created ${type} notification: ${title}`)
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    addTestResult(`✅ Marked notification as read`)
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    addTestResult(`✅ Deleted notification`)
  }

  const clearAll = () => {
    setNotifications([])
    addTestResults([])
    addTestResult(`✅ Cleared all notifications`)
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Simple Notification Test</h1>
            <p className="text-muted-foreground">
              Basic notification system test without external dependencies
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Notifications</p>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {notifications.length}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Unread</p>
              <Badge variant="destructive" className="text-lg px-3 py-1">
                {unreadCount}
              </Badge>
            </div>
          </div>
        </div>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button onClick={() => createNotification('Test Info', 'This is an info notification', 'info')}>
                Test Info
              </Button>
              <Button onClick={() => createNotification('Success!', 'This is a success notification', 'success')} className="text-green-600">
                Test Success
              </Button>
              <Button onClick={() => createNotification('Error!', 'This is an error notification', 'error')} className="text-red-600">
                Test Error
              </Button>
              <Button onClick={() => createNotification('Warning!', 'This is a warning notification', 'warning')} className="text-yellow-600">
                Test Warning
              </Button>
            </div>
            
            <div className="flex gap-4 pt-4 border-t">
              <Button onClick={clearAll} variant="destructive">
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Current Notifications ({notifications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
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
