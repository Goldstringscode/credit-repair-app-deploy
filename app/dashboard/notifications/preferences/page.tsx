"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useNotifications } from "@/lib/notification-context"
import { 
  Settings, 
  Bell, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Mail, 
  MessageSquare,
  Clock,
  Shield,
  Zap,
  Save,
  RotateCcw
} from "lucide-react"

interface NotificationPreferences {
  userId: string
  sound: {
    enabled: boolean
    volume: number
    categories: {
      [category: string]: boolean
    }
    quietHours: {
      enabled: boolean
      start: string
      end: string
    }
  }
  push: {
    enabled: boolean
    categories: {
      [category: string]: boolean
    }
  }
  email: {
    enabled: boolean
    categories: {
      [category: string]: boolean
    }
    frequency: 'immediate' | 'daily' | 'weekly'
  }
  sms: {
    enabled: boolean
    categories: {
      [category: string]: boolean
    }
    phoneNumber?: string
  }
  general: {
    frequency: 'low' | 'medium' | 'high'
    priority: 'low' | 'medium' | 'high'
    autoExpire: number
    showInApp: boolean
    showInBell: boolean
  }
  categories: {
    [category: string]: {
      enabled: boolean
      priority: 'low' | 'medium' | 'high'
      sound: boolean
      push: boolean
      email: boolean
      sms: boolean
    }
  }
}

const categoryLabels = {
  credit: 'Credit Reports',
  training: 'Training & Education',
  system: 'System Updates',
  payment: 'Payment & Billing',
  milestone: 'Milestones & Achievements',
  alert: 'Alerts & Warnings',
  dispute: 'Dispute Updates',
  fcra: 'FCRA Compliance',
  mail: 'Mail & Letters'
}

const categoryIcons = {
  credit: '💳',
  training: '🎓',
  system: '⚙️',
  payment: '💰',
  milestone: '🏆',
  alert: '⚠️',
  dispute: '⚖️',
  fcra: '📋',
  mail: '📧'
}

export default function NotificationPreferencesPage() {
  const { addNotification } = useNotifications()
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/notifications/preferences')
      const data = await response.json()
      
      if (data.success) {
        setPreferences(data.preferences)
      } else {
        console.error('Failed to load preferences:', data.error)
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const savePreferences = async () => {
    if (!preferences) return

    try {
      setIsSaving(true)
      const response = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: preferences.userId,
          preferences
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        addNotification({
          title: "Preferences Saved! ✅",
          message: "Your notification preferences have been updated successfully",
          type: "success",
          priority: "medium",
          category: "system"
        })
        setHasChanges(false)
      } else {
        addNotification({
          title: "Save Failed ❌",
          message: data.error || "Failed to save preferences",
          type: "error",
          priority: "high",
          category: "system"
        })
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
      addNotification({
        title: "Save Error ❌",
        message: "An error occurred while saving your preferences",
        type: "error",
        priority: "high",
        category: "system"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const resetToDefaults = async () => {
    try {
      setIsSaving(true)
      const response = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: preferences?.userId || '550e8400-e29b-41d4-a716-446655440000',
          preferences: null // This will reset to defaults
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setPreferences(data.preferences)
        setHasChanges(false)
        addNotification({
          title: "Preferences Reset! 🔄",
          message: "Your notification preferences have been reset to defaults",
          type: "success",
          priority: "medium",
          category: "system"
        })
      }
    } catch (error) {
      console.error('Error resetting preferences:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const updatePreference = (section: keyof NotificationPreferences, key: string, value: any) => {
    if (!preferences) return

    setPreferences(prev => {
      if (!prev) return prev
      const updated = { ...prev }
      ;(updated[section] as any)[key] = value
      return updated
    })
    setHasChanges(true)
  }

  const updateCategoryPreference = (category: string, key: string, value: any) => {
    if (!preferences) return

    setPreferences(prev => {
      if (!prev) return prev
      const updated = { ...prev }
      updated.categories[category] = { ...updated.categories[category], [key]: value }
      return updated
    })
    setHasChanges(true)
  }

  const updateSoundCategory = (category: string, enabled: boolean) => {
    if (!preferences) return

    setPreferences(prev => {
      if (!prev) return prev
      const updated = { ...prev }
      updated.sound.categories[category] = enabled
      return updated
    })
    setHasChanges(true)
  }

  const updatePushCategory = (category: string, enabled: boolean) => {
    if (!preferences) return

    setPreferences(prev => {
      if (!prev) return prev
      const updated = { ...prev }
      updated.push.categories[category] = enabled
      return updated
    })
    setHasChanges(true)
  }

  const updateEmailCategory = (category: string, enabled: boolean) => {
    if (!preferences) return

    setPreferences(prev => {
      if (!prev) return prev
      const updated = { ...prev }
      updated.email.categories[category] = enabled
      return updated
    })
    setHasChanges(true)
  }

  const updateSmsCategory = (category: string, enabled: boolean) => {
    if (!preferences) return

    setPreferences(prev => {
      if (!prev) return prev
      const updated = { ...prev }
      updated.sms.categories[category] = enabled
      return updated
    })
    setHasChanges(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading notification preferences...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!preferences) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load preferences</h3>
              <p className="text-gray-600">Please try refreshing the page.</p>
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
              <Settings className="h-8 w-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">Notification Preferences</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Customize how and when you receive notifications across all channels
            </p>
          </div>

          {/* Save/Reset Actions */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {hasChanges && (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  Unsaved Changes
                </Badge>
              )}
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={resetToDefaults}
                disabled={isSaving}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
              <Button
                onClick={savePreferences}
                disabled={isSaving || !hasChanges}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>

          {/* Preferences Tabs */}
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="sound">Sound</TabsTrigger>
              <TabsTrigger value="push">Push</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="sms">SMS</TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>General Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="frequency">Notification Frequency</Label>
                      <Select 
                        value={preferences.general.frequency} 
                        onValueChange={(value: any) => updatePreference('general', 'frequency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low - Only important notifications</SelectItem>
                          <SelectItem value="medium">Medium - Balanced notifications</SelectItem>
                          <SelectItem value="high">High - All notifications</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Default Priority</Label>
                      <Select 
                        value={preferences.general.priority} 
                        onValueChange={(value: any) => updatePreference('general', 'priority', value)}
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
                  
                  <div>
                    <Label htmlFor="autoExpire">Auto-expire Time (minutes)</Label>
                    <Input
                      id="autoExpire"
                      type="number"
                      min="1"
                      max="1440"
                      value={preferences.general.autoExpire}
                      onChange={(e) => updatePreference('general', 'autoExpire', parseInt(e.target.value) || 60)}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="showInApp">Show in App</Label>
                        <p className="text-sm text-gray-600">Display notifications in the app interface</p>
                      </div>
                      <Switch
                        id="showInApp"
                        checked={preferences.general.showInApp}
                        onCheckedChange={(checked) => updatePreference('general', 'showInApp', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="showInBell">Show in Bell</Label>
                        <p className="text-sm text-gray-600">Display notifications in the notification bell</p>
                      </div>
                      <Switch
                        id="showInBell"
                        checked={preferences.general.showInBell}
                        onCheckedChange={(checked) => updatePreference('general', 'showInBell', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Category Settings</span>
                  </CardTitle>
                  <CardDescription>
                    Configure notification settings for each category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(preferences.categories).map(([category, settings]) => (
                      <div key={category} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{categoryIcons[category as keyof typeof categoryIcons]}</span>
                            <div>
                              <h4 className="font-medium">{categoryLabels[category as keyof typeof categoryLabels]}</h4>
                              <p className="text-sm text-gray-600 capitalize">{category}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={settings.enabled}
                              onCheckedChange={(checked) => updateCategoryPreference(category, 'enabled', checked)}
                            />
                            <Badge variant={settings.priority === 'high' ? 'destructive' : settings.priority === 'medium' ? 'default' : 'secondary'}>
                              {settings.priority}
                            </Badge>
                          </div>
                        </div>
                        
                        {settings.enabled && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={settings.sound}
                                onCheckedChange={(checked) => updateCategoryPreference(category, 'sound', checked)}
                                size="sm"
                              />
                              <Label className="text-sm">Sound</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={settings.push}
                                onCheckedChange={(checked) => updateCategoryPreference(category, 'push', checked)}
                                size="sm"
                              />
                              <Label className="text-sm">Push</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={settings.email}
                                onCheckedChange={(checked) => updateCategoryPreference(category, 'email', checked)}
                                size="sm"
                              />
                              <Label className="text-sm">Email</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={settings.sms}
                                onCheckedChange={(checked) => updateCategoryPreference(category, 'sms', checked)}
                                size="sm"
                              />
                              <Label className="text-sm">SMS</Label>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sound Tab */}
            <TabsContent value="sound" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Volume2 className="h-5 w-5" />
                    <span>Sound Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="soundEnabled">Enable Sounds</Label>
                      <p className="text-sm text-gray-600">Play notification sounds</p>
                    </div>
                    <Switch
                      id="soundEnabled"
                      checked={preferences.sound.enabled}
                      onCheckedChange={(checked) => updatePreference('sound', 'enabled', checked)}
                    />
                  </div>

                  {preferences.sound.enabled && (
                    <>
                      <div>
                        <Label htmlFor="volume">Volume</Label>
                        <div className="mt-2">
                          <Slider
                            id="volume"
                            min={0}
                            max={1}
                            step={0.1}
                            value={[preferences.sound.volume]}
                            onValueChange={(value) => updatePreference('sound', 'volume', value[0])}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm text-gray-600 mt-1">
                            <span>0%</span>
                            <span>{Math.round(preferences.sound.volume * 100)}%</span>
                            <span>100%</span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium mb-4">Sound Categories</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(preferences.sound.categories).map(([category, enabled]) => (
                            <div key={category} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span>{categoryIcons[category as keyof typeof categoryIcons]}</span>
                                <Label className="text-sm">{categoryLabels[category as keyof typeof categoryLabels]}</Label>
                              </div>
                              <Switch
                                checked={enabled}
                                onCheckedChange={(checked) => updateSoundCategory(category, checked)}
                                size="sm"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium mb-4">Quiet Hours</h4>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <Label htmlFor="quietHoursEnabled">Enable Quiet Hours</Label>
                            <p className="text-sm text-gray-600">Disable sounds during specified hours</p>
                          </div>
                          <Switch
                            id="quietHoursEnabled"
                            checked={preferences.sound.quietHours.enabled}
                            onCheckedChange={(checked) => updatePreference('sound', 'quietHours', { ...preferences.sound.quietHours, enabled: checked })}
                          />
                        </div>
                        
                        {preferences.sound.quietHours.enabled && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="quietStart">Start Time</Label>
                              <Input
                                id="quietStart"
                                type="time"
                                value={preferences.sound.quietHours.start}
                                onChange={(e) => updatePreference('sound', 'quietHours', { ...preferences.sound.quietHours, start: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="quietEnd">End Time</Label>
                              <Input
                                id="quietEnd"
                                type="time"
                                value={preferences.sound.quietHours.end}
                                onChange={(e) => updatePreference('sound', 'quietHours', { ...preferences.sound.quietHours, end: e.target.value })}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Push Tab */}
            <TabsContent value="push" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Smartphone className="h-5 w-5" />
                    <span>Push Notification Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pushEnabled">Enable Push Notifications</Label>
                      <p className="text-sm text-gray-600">Receive push notifications on your device</p>
                    </div>
                    <Switch
                      id="pushEnabled"
                      checked={preferences.push.enabled}
                      onCheckedChange={(checked) => updatePreference('push', 'enabled', checked)}
                    />
                  </div>

                  {preferences.push.enabled && (
                    <div>
                      <h4 className="font-medium mb-4">Push Categories</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(preferences.push.categories).map(([category, enabled]) => (
                          <div key={category} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span>{categoryIcons[category as keyof typeof categoryIcons]}</span>
                              <Label className="text-sm">{categoryLabels[category as keyof typeof categoryLabels]}</Label>
                            </div>
                            <Switch
                              checked={enabled}
                              onCheckedChange={(checked) => updatePushCategory(category, checked)}
                              size="sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Email Tab */}
            <TabsContent value="email" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mail className="h-5 w-5" />
                    <span>Email Notification Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailEnabled">Enable Email Notifications</Label>
                      <p className="text-sm text-gray-600">Receive notifications via email</p>
                    </div>
                    <Switch
                      id="emailEnabled"
                      checked={preferences.email.enabled}
                      onCheckedChange={(checked) => updatePreference('email', 'enabled', checked)}
                    />
                  </div>

                  {preferences.email.enabled && (
                    <>
                      <div>
                        <Label htmlFor="emailFrequency">Email Frequency</Label>
                        <Select 
                          value={preferences.email.frequency} 
                          onValueChange={(value: any) => updatePreference('email', 'frequency', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediate">Immediate</SelectItem>
                            <SelectItem value="daily">Daily Digest</SelectItem>
                            <SelectItem value="weekly">Weekly Digest</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <h4 className="font-medium mb-4">Email Categories</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(preferences.email.categories).map(([category, enabled]) => (
                            <div key={category} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span>{categoryIcons[category as keyof typeof categoryIcons]}</span>
                                <Label className="text-sm">{categoryLabels[category as keyof typeof categoryLabels]}</Label>
                              </div>
                              <Switch
                                checked={enabled}
                                onCheckedChange={(checked) => updateEmailCategory(category, checked)}
                                size="sm"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* SMS Tab */}
            <TabsContent value="sms" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>SMS Notification Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="smsEnabled">Enable SMS Notifications</Label>
                      <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                    </div>
                    <Switch
                      id="smsEnabled"
                      checked={preferences.sms.enabled}
                      onCheckedChange={(checked) => updatePreference('sms', 'enabled', checked)}
                    />
                  </div>

                  {preferences.sms.enabled && (
                    <>
                      <div>
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                          id="phoneNumber"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          value={preferences.sms.phoneNumber || ''}
                          onChange={(e) => updatePreference('sms', 'phoneNumber', e.target.value)}
                        />
                      </div>

                      <div>
                        <h4 className="font-medium mb-4">SMS Categories</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(preferences.sms.categories).map(([category, enabled]) => (
                            <div key={category} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span>{categoryIcons[category as keyof typeof categoryIcons]}</span>
                                <Label className="text-sm">{categoryLabels[category as keyof typeof categoryLabels]}</Label>
                              </div>
                              <Switch
                                checked={enabled}
                                onCheckedChange={(checked) => updateSmsCategory(category, checked)}
                                size="sm"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
























