'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { 
  Bell, 
  Settings, 
  HelpCircle, 
  Download, 
  Share2, 
  Calendar,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'

interface UserBillingEnhancementsProps {
  onRefresh: () => void
}

export function UserBillingEnhancements({ onRefresh }: UserBillingEnhancementsProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showBillingSettings, setShowBillingSettings] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common billing tasks and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => setShowNotifications(true)}
            >
              <Bell className="h-6 w-6" />
              <span>Billing Notifications</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => setShowBillingSettings(true)}
            >
              <Settings className="h-6 w-6" />
              <span>Billing Settings</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => setShowHelp(true)}
            >
              <HelpCircle className="h-6 w-6" />
              <span>Get Help</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing Alerts & Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Billing Alerts
          </CardTitle>
          <CardDescription>
            Important billing information and notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your next payment of $29.99 is scheduled for March 15, 2024
              </AlertDescription>
            </Alert>
            
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Your trial period ends in 7 days. Add a payment method to continue service.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Billing Notifications Dialog */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Billing Notifications</DialogTitle>
            <DialogDescription>
              Choose which billing notifications you'd like to receive
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="payment-reminders" defaultChecked />
              <Label htmlFor="payment-reminders">Payment reminders</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="payment-failed" defaultChecked />
              <Label htmlFor="payment-failed">Payment failed notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="subscription-changes" defaultChecked />
              <Label htmlFor="subscription-changes">Subscription changes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="billing-updates" />
              <Label htmlFor="billing-updates">General billing updates</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotifications(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowNotifications(false)}>
              Save Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Billing Settings Dialog */}
      <Dialog open={showBillingSettings} onOpenChange={setShowBillingSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Billing Settings</DialogTitle>
            <DialogDescription>
              Manage your billing preferences and settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="billing-email">Billing Email</Label>
              <Input 
                id="billing-email" 
                type="email" 
                defaultValue="demo@example.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="billing-address">Billing Address</Label>
              <Input 
                id="billing-address" 
                placeholder="Enter your billing address"
                className="mt-1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="auto-renewal" defaultChecked />
              <Label htmlFor="auto-renewal">Enable auto-renewal</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBillingSettings(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowBillingSettings(false)}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Help Dialog */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Billing Help & Support</DialogTitle>
            <DialogDescription>
              Get help with your billing questions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Common Questions</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>• How do I change my payment method?</p>
                <p>• How do I cancel my subscription?</p>
                <p>• How do I update my billing information?</p>
                <p>• How do I download my invoices?</p>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Contact Support</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Email: billing@creditrepair.com</p>
                <p>Phone: 1-800-CREDIT-1</p>
                <p>Hours: Mon-Fri 9AM-6PM EST</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHelp(false)}>
              Close
            </Button>
            <Button onClick={() => setShowHelp(false)}>
              Contact Support
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
