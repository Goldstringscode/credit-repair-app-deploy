"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, BellOff, Volume2, VolumeX, Smartphone, Mail, Settings } from 'lucide-react'
import { useNotifications } from '@/lib/notification-context'

interface NotificationSettings {
  enabled: boolean
  sound: boolean
  push: boolean
  email: boolean
  categories: {
    creditReport: boolean
    analysis: boolean
    letters: boolean
    billing: boolean
    system: boolean
    marketing: boolean
  }
  frequency: 'immediate' | 'daily' | 'weekly'
}

const defaultSettings: NotificationSettings = {
  enabled: true,
  sound: true,
  push: true,
  email: false,
  categories: {
    creditReport: true,
    analysis: true,
    letters: true,
    billing: true,
    system: true,
    marketing: false
  },
  frequency: 'immediate'
}

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(false)
  const { addNotification } = useNotifications()

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('notification-settings')
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) })
      } catch (error) {
        console.warn('Failed to load notification settings:', error)
      }
    }
  }, [])

  const saveSettings = async () => {
    setIsLoading(true)
    try {
      localStorage.setItem('notification-settings', JSON.stringify(settings))
      
      // Show success notification
      addNotification({
        title: 'Settings Saved',
        message: 'Your notification preferences have been updated.',
        type: 'success',
        priority: 'low',
        category: 'system',
        read: false
      })
    } catch (error) {
      addNotification({
        title: 'Save Failed',
        message: 'Failed to save notification settings. Please try again.',
        type: 'error',
        priority: 'medium',
        category: 'system',
        read: false
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testNotification = () => {
    addNotification({
      title: 'Test Notification',
      message: 'This is a test notification to verify your settings are working correctly.',
      type: 'info',
      priority: 'low',
      category: 'system',
      read: false,
      actions: [
        { label: 'Got it!', action: 'dismiss' }
      ]
    })
  }

  const updateSetting = (key: keyof NotificationSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const updateCategory = (category: keyof NotificationSettings['categories'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      categories: { ...prev.categories, [category]: value }
    }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Customize how and when you receive notifications from the Credit Repair AI platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications-enabled" className="text-base">
                Enable Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Turn all notifications on or off
              </p>
            </div>
            <Switch
              id="notifications-enabled"
              checked={settings.enabled}
              onCheckedChange={(checked) => updateSetting('enabled', checked)}
            />
          </div>

          {settings.enabled && (
            <>
              {/* Notification Channels */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Notification Channels</h4>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    <Label htmlFor="sound-enabled">Sound</Label>
                  </div>
                  <Switch
                    id="sound-enabled"
                    checked={settings.sound}
                    onCheckedChange={(checked) => updateSetting('sound', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <Label htmlFor="push-enabled">Push Notifications</Label>
                  </div>
                  <Switch
                    id="push-enabled"
                    checked={settings.push}
                    onCheckedChange={(checked) => updateSetting('push', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <Label htmlFor="email-enabled">Email Notifications</Label>
                  </div>
                  <Switch
                    id="email-enabled"
                    checked={settings.email}
                    onCheckedChange={(checked) => updateSetting('email', checked)}
                  />
                </div>
              </div>

              {/* Notification Categories */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Notification Categories</h4>
                
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Credit Reports</Label>
                      <p className="text-xs text-muted-foreground">Upload status, processing updates</p>
                    </div>
                    <Switch
                      checked={settings.categories.creditReport}
                      onCheckedChange={(checked) => updateCategory('creditReport', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Analysis</Label>
                      <p className="text-xs text-muted-foreground">Analysis completion, insights</p>
                    </div>
                    <Switch
                      checked={settings.categories.analysis}
                      onCheckedChange={(checked) => updateCategory('analysis', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Dispute Letters</Label>
                      <p className="text-xs text-muted-foreground">Letter generation, sending status</p>
                    </div>
                    <Switch
                      checked={settings.categories.letters}
                      onCheckedChange={(checked) => updateCategory('letters', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Billing</Label>
                      <p className="text-xs text-muted-foreground">Payments, subscriptions</p>
                    </div>
                    <Switch
                      checked={settings.categories.billing}
                      onCheckedChange={(checked) => updateCategory('billing', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>System</Label>
                      <p className="text-xs text-muted-foreground">Maintenance, updates</p>
                    </div>
                    <Switch
                      checked={settings.categories.system}
                      onCheckedChange={(checked) => updateCategory('system', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Marketing</Label>
                      <p className="text-xs text-muted-foreground">Tips, promotions, updates</p>
                    </div>
                    <Switch
                      checked={settings.categories.marketing}
                      onCheckedChange={(checked) => updateCategory('marketing', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Frequency */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Notification Frequency</h4>
                <div className="grid grid-cols-3 gap-2">
                  {(['immediate', 'daily', 'weekly'] as const).map((freq) => (
                    <Button
                      key={freq}
                      variant={settings.frequency === freq ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateSetting('frequency', freq)}
                    >
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button onClick={saveSettings} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
            <Button variant="outline" onClick={testNotification}>
              Test Notification
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
