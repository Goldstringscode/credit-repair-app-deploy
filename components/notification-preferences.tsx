"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Bell, Volume2, VolumeX, Smartphone, Mail, MessageSquare, Settings } from "lucide-react"
import { useNotifications } from "@/lib/notification-context"
import { pushNotificationService } from "@/lib/push-notification-service"
import { notificationSoundSystem } from "@/lib/notification-sound-system"

export function NotificationPreferencesComponent() {
  const { getSoundSettings, updateSoundSettings, playNotificationSound } = useNotifications()
  const [soundSettings, setSoundSettings] = useState(getSoundSettings())
  const [pushSettings, setPushSettings] = useState(pushNotificationService.getSettings())
  const [isLoading, setIsLoading] = useState(false)

  // Email/SMS preferences (mock data)
  const [emailSettings, setEmailSettings] = useState({
    credit: true,
    dispute: true,
    training: false,
    payment: true,
    system: false,
    alerts: true
  })

  const [smsSettings, setSmsSettings] = useState({
    credit: false,
    dispute: true,
    training: false,
    payment: false,
    system: false,
    alerts: true
  })

  const handleSoundSettingChange = (key: string, value: any) => {
    const newSettings = { ...soundSettings, [key]: value }
    setSoundSettings(newSettings)
    updateSoundSettings(newSettings)
  }

  const handleSoundCategoryChange = (category: string, enabled: boolean) => {
    const newSettings = {
      ...soundSettings,
      categories: {
        ...soundSettings.categories,
        [category]: enabled
      }
    }
    setSoundSettings(newSettings)
    updateSoundSettings(newSettings)
  }

  const handlePushSettingChange = (key: string, value: any) => {
    const newSettings = { ...pushSettings, [key]: value }
    setPushSettings(newSettings)
    pushNotificationService.updateSettings(newSettings)
  }

  const handlePushCategoryChange = (category: string, enabled: boolean) => {
    const newSettings = {
      ...pushSettings,
      categories: {
        ...pushSettings.categories,
        [category]: enabled
      }
    }
    setPushSettings(newSettings)
    pushNotificationService.updateSettings(newSettings)
  }

  const handleEmailCategoryChange = (category: string, enabled: boolean) => {
    setEmailSettings(prev => ({
      ...prev,
      [category]: enabled
    }))
  }

  const handleSmsCategoryChange = (category: string, enabled: boolean) => {
    setSmsSettings(prev => ({
      ...prev,
      [category]: enabled
    }))
  }

  const testSound = async (category: string) => {
    await playNotificationSound(category)
  }

  const testPushNotification = async () => {
    await pushNotificationService.testNotification()
  }

  const requestPushPermission = async () => {
    setIsLoading(true)
    try {
      const permission = await pushNotificationService.requestPermission()
      setPushSettings(prev => ({ ...prev, permission }))
    } finally {
      setIsLoading(false)
    }
  }

  const getPermissionBadge = (permission: string) => {
    switch (permission) {
      case 'granted':
        return <Badge variant="default" className="bg-green-100 text-green-800">Granted</Badge>
      case 'denied':
        return <Badge variant="destructive">Denied</Badge>
      default:
        return <Badge variant="secondary">Not Set</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5" />
              <CardTitle className="text-lg">Push Notifications</CardTitle>
            </div>
            {getPermissionBadge(pushSettings.permission)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-enabled">Enable Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications even when the app is closed
              </p>
            </div>
            <Switch
              id="push-enabled"
              checked={pushSettings.enabled}
              onCheckedChange={(checked) => handlePushSettingChange('enabled', checked)}
            />
          </div>

          {pushSettings.permission === 'default' && (
            <Button onClick={requestPushPermission} disabled={isLoading} className="w-full">
              {isLoading ? 'Requesting...' : 'Request Permission'}
            </Button>
          )}

          {pushSettings.enabled && pushSettings.permission === 'granted' && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label>Notification Categories</Label>
                {Object.entries(pushSettings.categories).map(([category, enabled]) => (
                  <div key={category} className="flex items-center justify-between">
                    <Label htmlFor={`push-${category}`} className="capitalize">
                      {category.replace('_', ' ')}
                    </Label>
                    <Switch
                      id={`push-${category}`}
                      checked={enabled}
                      onCheckedChange={(checked) => handlePushCategoryChange(category, checked)}
                    />
                  </div>
                ))}
              </div>

              <Separator />
              <div className="space-y-3">
                <Label>Notification Frequency</Label>
                <Select
                  value={pushSettings.frequency}
                  onValueChange={(value) => handlePushSettingChange('frequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="batched">Batched (Every 15 minutes)</SelectItem>
                    <SelectItem value="digest">Daily Digest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" onClick={testPushNotification} className="w-full">
                Test Push Notification
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Sound Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            {soundSettings.enabled ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
            <CardTitle className="text-lg">Sound Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sound-enabled">Enable Sounds</Label>
              <p className="text-sm text-muted-foreground">
                Play sounds for notifications
              </p>
            </div>
            <Switch
              id="sound-enabled"
              checked={soundSettings.enabled}
              onCheckedChange={(checked) => handleSoundSettingChange('enabled', checked)}
            />
          </div>

          {soundSettings.enabled && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="volume">Volume</Label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(soundSettings.volume * 100)}%
                  </span>
                </div>
                <input
                  id="volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={soundSettings.volume}
                  onChange={(e) => handleSoundSettingChange('volume', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <Separator />
              <div className="space-y-3">
                <Label>Sound Categories</Label>
                {Object.entries(soundSettings.categories).map(([category, enabled]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`sound-${category}`} className="capitalize">
                        {category.replace('_', ' ')}
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => testSound(category)}
                        className="h-6 w-6 p-0"
                      >
                        🔊
                      </Button>
                    </div>
                    <Switch
                      id={`sound-${category}`}
                      checked={enabled}
                      onCheckedChange={(checked) => handleSoundCategoryChange(category, checked)}
                    />
                  </div>
                ))}
              </div>

              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="vibration">Vibration</Label>
                  <p className="text-sm text-muted-foreground">
                    Vibrate device for notifications
                  </p>
                </div>
                <Switch
                  id="vibration"
                  checked={soundSettings.vibration}
                  onCheckedChange={(checked) => handleSoundSettingChange('vibration', checked)}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <CardTitle className="text-lg">Email Notifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(emailSettings).map(([category, enabled]) => (
            <div key={category} className="flex items-center justify-between">
              <Label htmlFor={`email-${category}`} className="capitalize">
                {category.replace('_', ' ')}
              </Label>
              <Switch
                id={`email-${category}`}
                checked={enabled}
                onCheckedChange={(checked) => handleEmailCategoryChange(category, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <CardTitle className="text-lg">SMS Notifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(smsSettings).map(([category, enabled]) => (
            <div key={category} className="flex items-center justify-between">
              <Label htmlFor={`sms-${category}`} className="capitalize">
                {category.replace('_', ' ')}
              </Label>
              <Switch
                id={`sms-${category}`}
                checked={enabled}
                onCheckedChange={(checked) => handleSmsCategoryChange(category, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save Settings */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline">Reset to Defaults</Button>
        <Button>Save Settings</Button>
      </div>
    </div>
  )
}