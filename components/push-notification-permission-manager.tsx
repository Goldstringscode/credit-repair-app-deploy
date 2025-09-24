"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Bell, 
  BellOff, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Smartphone,
  Shield,
  Zap
} from "lucide-react"
import { pushNotificationService } from "@/lib/push-notification-service"

interface PermissionStatus {
  supported: boolean
  permission: NotificationPermission
  canRequest: boolean
  isBlocked: boolean
}

export function PushNotificationPermissionManager() {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>({
    supported: false,
    permission: 'default',
    canRequest: false,
    isBlocked: false
  })
  const [isRequesting, setIsRequesting] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    checkPermissionStatus()
  }, [])

  const checkPermissionStatus = () => {
    const status = pushNotificationService.getStatus()
    setPermissionStatus({
      supported: status.supported,
      permission: status.permission,
      canRequest: status.permission === 'default',
      isBlocked: status.permission === 'denied'
    })
  }

  const handleRequestPermission = async () => {
    setIsRequesting(true)
    try {
      const permission = await pushNotificationService.requestPermission()
      checkPermissionStatus()
      
      if (permission === 'granted') {
        // Show success message
        setTimeout(() => {
          // Could trigger a success notification here
        }, 1000)
      }
    } catch (error) {
      console.error('Error requesting permission:', error)
    } finally {
      setIsRequesting(false)
    }
  }

  const getPermissionIcon = () => {
    switch (permissionStatus.permission) {
      case 'granted':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'denied':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
    }
  }

  const getPermissionBadge = () => {
    switch (permissionStatus.permission) {
      case 'granted':
        return <Badge className="bg-green-100 text-green-800">Enabled</Badge>
      case 'denied':
        return <Badge className="bg-red-100 text-red-800">Blocked</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Not Set</Badge>
    }
  }

  const getPermissionMessage = () => {
    if (!permissionStatus.supported) {
      return "Push notifications are not supported in this browser."
    }
    
    switch (permissionStatus.permission) {
      case 'granted':
        return "You'll receive push notifications for important updates."
      case 'denied':
        return "Push notifications are blocked. You can enable them in your browser settings."
      default:
        return "Allow push notifications to receive important updates even when the app is closed."
    }
  }

  const getBrowserInstructions = () => {
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : ''
    
    if (userAgent.includes('Chrome')) {
      return "Click the lock icon in the address bar, then select 'Allow' for notifications."
    } else if (userAgent.includes('Firefox')) {
      return "Click the shield icon in the address bar, then allow notifications."
    } else if (userAgent.includes('Safari')) {
      return "Go to Safari > Preferences > Websites > Notifications, then allow for this site."
    } else if (userAgent.includes('Edge')) {
      return "Click the lock icon in the address bar, then select 'Allow' for notifications."
    }
    
    return "Look for a notification permission prompt or check your browser's site settings."
  }

  if (!permissionStatus.supported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BellOff className="h-5 w-5 text-gray-500" />
            <span>Push Notifications Not Supported</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your browser doesn't support push notifications. Please use a modern browser like Chrome, Firefox, Safari, or Edge.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getPermissionIcon()}
            <div>
              <CardTitle>Push Notifications</CardTitle>
              <CardDescription>{getPermissionMessage()}</CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getPermissionBadge()}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {permissionStatus.permission === 'default' && (
          <div className="space-y-3">
            <Alert>
              <Bell className="h-4 w-4" />
              <AlertDescription>
                Enable push notifications to stay updated with important credit repair alerts, dispute updates, and milestone achievements.
              </AlertDescription>
            </Alert>
            
            <Button
              onClick={handleRequestPermission}
              disabled={isRequesting}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Bell className="h-4 w-4 mr-2" />
              {isRequesting ? 'Requesting Permission...' : 'Enable Push Notifications'}
            </Button>
          </div>
        )}

        {permissionStatus.permission === 'denied' && (
          <div className="space-y-3">
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Push notifications are currently blocked. To enable them:
              </AlertDescription>
            </Alert>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                <strong>How to enable notifications:</strong>
              </p>
              <p className="text-sm text-gray-600">
                {getBrowserInstructions()}
              </p>
            </div>
            
            <Button
              onClick={handleRequestPermission}
              disabled={isRequesting}
              variant="outline"
              className="w-full"
            >
              <Bell className="h-4 w-4 mr-2" />
              {isRequesting ? 'Checking...' : 'Try Again'}
            </Button>
          </div>
        )}

        {permissionStatus.permission === 'granted' && (
          <div className="space-y-3">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Push notifications are enabled! You'll receive important updates even when the app is closed.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                <Smartphone className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Mobile Ready</span>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Secure</span>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg">
                <Zap className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Instant</span>
              </div>
            </div>
          </div>
        )}

        {showDetails && (
          <div className="border-t pt-4 space-y-3">
            <h4 className="font-medium">Notification Types</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm">Credit Score Changes</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Dispute Updates</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Payment Confirmations</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Milestone Achievements</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">System Alerts</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Training Reminders</span>
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Privacy:</strong> We only send notifications for important updates related to your credit repair journey. 
                You can customize which types of notifications you receive in your preferences.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
























