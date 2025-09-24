"use client"

import { useNotifications } from '@/lib/notification-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function NotificationDebug() {
  const { notifications, unreadCount, isConnected, isLoading } = useNotifications()

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-sm">Notification Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm">Total Notifications:</span>
          <Badge variant="outline">{notifications.length}</Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Unread Count:</span>
          <Badge variant="outline">{unreadCount}</Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Connected:</span>
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Yes" : "No"}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Loading:</span>
          <Badge variant={isLoading ? "secondary" : "outline"}>
            {isLoading ? "Yes" : "No"}
          </Badge>
        </div>
        <div className="mt-4">
          <span className="text-sm font-medium">Recent Notifications:</span>
          <div className="mt-2 space-y-1">
            {notifications.slice(0, 3).map((notification) => (
              <div key={notification.id} className="text-xs p-2 bg-gray-100 rounded">
                <div className="font-medium">{notification.title}</div>
                <div className="text-gray-600">{notification.type} - {notification.priority}</div>
                <div className="text-gray-500">{notification.read ? "Read" : "Unread"}</div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="text-xs text-gray-500">No notifications</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
