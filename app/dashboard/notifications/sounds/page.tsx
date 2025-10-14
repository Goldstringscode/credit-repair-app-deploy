"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNotifications } from "@/lib/notification-context"
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Settings, 
  TestTube,
  Clock,
  Vibrate,
  Bell,
  Music,
  Zap
} from "lucide-react"

interface SoundFile {
  id: string
  name: string
  category: string
  url: string
  duration: number
  description: string
}

interface SoundSettings {
  enabled: boolean
  volume: number
  categories: {
    [category: string]: boolean
  }
  customSounds: {
    [category: string]: string
  }
  vibration: boolean
  vibrationPattern: number[]
}

export default function NotificationSoundsPage() {
  const { addNotification } = useNotifications()
  const [sounds, setSounds] = useState<SoundFile[]>([])
  const [settings, setSettings] = useState<SoundSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [playingSounds, setPlayingSounds] = useState<Set<string>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadSoundData()
  }, [])

  const loadSoundData = async () => {
    try {
      setIsLoading(true)
      
      // Load sounds
      const soundsResponse = await fetch('/api/notifications/sounds?action=list')
      const soundsData = await soundsResponse.json()
      if (soundsData.success) {
        setSounds(soundsData.sounds)
      }

      // Load settings
      const settingsResponse = await fetch('/api/notifications/sounds?action=settings')
      const settingsData = await settingsResponse.json()
      if (settingsData.success) {
        setSettings(settingsData.settings)
      }
    } catch (error) {
      console.error('Error loading sound data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const playSound = async (soundId: string) => {
    try {
      setPlayingSounds(prev => new Set(prev).add(soundId))
      
      const response = await fetch('/api/notifications/sounds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'play',
          soundId
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        // Remove from playing sounds after duration
        const sound = sounds.find(s => s.id === soundId)
        if (sound) {
          setTimeout(() => {
            setPlayingSounds(prev => {
              const newSet = new Set(prev)
              newSet.delete(soundId)
              return newSet
            })
          }, sound.duration * 1000)
        }
      } else {
        setPlayingSounds(prev => {
          const newSet = new Set(prev)
          newSet.delete(soundId)
          return newSet
        })
        addNotification({
          title: "Sound Playback Failed ❌",
          message: result.error || "Failed to play sound",
          type: "error",
          priority: "medium",
          category: "system",
          read: false
        })
      }
    } catch (error) {
      console.error('Error playing sound:', error)
      setPlayingSounds(prev => {
        const newSet = new Set(prev)
        newSet.delete(soundId)
        return newSet
      })
    }
  }

  const testCategorySound = async (category: string) => {
    try {
      const response = await fetch('/api/notifications/sounds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'play-by-category',
          category
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        addNotification({
          title: "Category Sound Test ✅",
          message: `Played ${category} notification sound`,
          type: "success",
          priority: "medium",
          category: "system",
          read: false
        })
      } else {
        addNotification({
          title: "Sound Test Failed ❌",
          message: result.error || "Failed to play category sound",
          type: "error",
          priority: "medium",
          category: "system",
          read: false
        })
      }
    } catch (error) {
      console.error('Error testing category sound:', error)
    }
  }

  const updateSettings = async (newSettings: SoundSettings) => {
    try {
      const response = await fetch('/api/notifications/sounds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update-settings',
          settings: newSettings
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        setSettings(newSettings)
        addNotification({
          title: "Sound Settings Updated! ⚙️",
          message: "Your notification sound settings have been saved",
          type: "success",
          priority: "medium",
          category: "system",
          read: false
        })
      } else {
        addNotification({
          title: "Settings Update Failed ❌",
          message: result.error || "Failed to update sound settings",
          type: "error",
          priority: "high",
          category: "system",
          read: false
        })
      }
    } catch (error) {
      console.error('Error updating settings:', error)
    }
  }

  const updateSetting = (key: string, value: any) => {
    if (!settings) return
    
    const newSettings = { ...settings, [key]: value }
    updateSettings(newSettings)
  }

  const updateCategorySetting = (category: string, enabled: boolean) => {
    if (!settings) return
    
    const newSettings = {
      ...settings,
      categories: {
        ...settings.categories,
        [category]: enabled
      }
    }
    updateSettings(newSettings)
  }

  const updateCustomSound = (category: string, soundId: string) => {
    if (!settings) return
    
    const newSettings = {
      ...settings,
      customSounds: {
        ...settings.customSounds,
        [category]: soundId
      }
    }
    updateSettings(newSettings)
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      success: '✅',
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
      credit: '💳',
      dispute: '⚖️',
      training: '🎓',
      payment: '💰',
      system: '⚙️'
    }
    return icons[category as keyof typeof icons] || '🔊'
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      success: 'bg-green-100 text-green-800',
      info: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      credit: 'bg-purple-100 text-purple-800',
      dispute: 'bg-orange-100 text-orange-800',
      training: 'bg-indigo-100 text-indigo-800',
      payment: 'bg-emerald-100 text-emerald-800',
      system: 'bg-gray-100 text-gray-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const filteredSounds = selectedCategory === 'all' 
    ? sounds 
    : sounds.filter(sound => sound.category === selectedCategory)

  const categories = Array.from(new Set(sounds.map(s => s.category)))

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading notification sounds...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Volume2 className="h-8 w-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">Notification Sounds</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Customize notification sounds for different types of alerts and updates
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Music className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{sounds.length}</p>
                    <p className="text-sm text-gray-600">Available Sounds</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{categories.length}</p>
                    <p className="text-sm text-gray-600">Categories</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Volume2 className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{settings ? Math.round(settings.volume * 100) : 0}%</p>
                    <p className="text-sm text-gray-600">Volume</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Vibrate className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">{settings?.vibration ? 'On' : 'Off'}</p>
                    <p className="text-sm text-gray-600">Vibration</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings and Sounds */}
          <Tabs defaultValue="settings" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="sounds">Sound Library</TabsTrigger>
            </TabsList>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              {settings && (
                <>
                  {/* General Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Settings className="h-5 w-5" />
                        <span>General Settings</span>
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
                          checked={settings.enabled}
                          onCheckedChange={(checked) => updateSetting('enabled', checked)}
                        />
                      </div>

                      {settings.enabled && (
                        <>
                          <div>
                            <Label htmlFor="volume">Volume</Label>
                            <div className="mt-2">
                              <Slider
                                id="volume"
                                min={0}
                                max={1}
                                step={0.1}
                                value={[settings.volume]}
                                onValueChange={(value) => updateSetting('volume', value[0])}
                                className="w-full"
                              />
                              <div className="flex justify-between text-sm text-gray-600 mt-1">
                                <span>0%</span>
                                <span>{Math.round(settings.volume * 100)}%</span>
                                <span>100%</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="vibration">Vibration</Label>
                              <p className="text-sm text-gray-600">Vibrate device for notifications</p>
                            </div>
                            <Switch
                              id="vibration"
                              checked={settings.vibration}
                              onCheckedChange={(checked) => updateSetting('vibration', checked)}
                            />
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Category Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Bell className="h-5 w-5" />
                        <span>Category Settings</span>
                      </CardTitle>
                      <CardDescription>
                        Enable or disable sounds for different notification categories
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(settings.categories).map(([category, enabled]) => (
                          <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{getCategoryIcon(category)}</span>
                              <div>
                                <h4 className="font-medium capitalize">{category}</h4>
                                <p className="text-sm text-gray-600">
                                  {category === 'success' && 'Success notifications and achievements'}
                                  {category === 'info' && 'General information and updates'}
                                  {category === 'warning' && 'Warning alerts and cautions'}
                                  {category === 'error' && 'Error messages and failures'}
                                  {category === 'credit' && 'Credit score changes and reports'}
                                  {category === 'dispute' && 'Dispute status updates'}
                                  {category === 'training' && 'Training progress and completions'}
                                  {category === 'payment' && 'Payment confirmations and billing'}
                                  {category === 'system' && 'System maintenance and updates'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => testCategorySound(category)}
                                disabled={!enabled}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                              <Switch
                                checked={enabled}
                                onCheckedChange={(checked) => updateCategorySetting(category, checked)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Custom Sound Assignments */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Music className="h-5 w-5" />
                        <span>Custom Sound Assignments</span>
                      </CardTitle>
                      <CardDescription>
                        Assign specific sounds to notification categories
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {categories.map((category) => {
                          const categorySounds = sounds.filter(s => s.category === category)
                          const currentSound = settings.customSounds[category] || `${category}-default`
                          
                          return (
                            <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">{getCategoryIcon(category)}</span>
                                <div>
                                  <h4 className="font-medium capitalize">{category}</h4>
                                  <p className="text-sm text-gray-600">Choose a custom sound</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Select
                                  value={currentSound}
                                  onValueChange={(value) => updateCustomSound(category, value)}
                                >
                                  <SelectTrigger className="w-48">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {categorySounds.map((sound) => (
                                      <SelectItem key={sound.id} value={sound.id}>
                                        {sound.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => playSound(currentSound)}
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* Sound Library Tab */}
            <TabsContent value="sounds" className="space-y-6">
              {/* Category Filter */}
              <Card>
                <CardHeader>
                  <CardTitle>Sound Library</CardTitle>
                  <CardDescription>
                    Browse and test all available notification sounds
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Label htmlFor="categoryFilter">Filter by Category:</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            <div className="flex items-center space-x-2">
                              <span>{getCategoryIcon(category)}</span>
                              <span className="capitalize">{category}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Sound Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSounds.map((sound) => (
                  <Card key={sound.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <CardTitle className="text-lg">{sound.name}</CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge className={getCategoryColor(sound.category)}>
                              {sound.category}
                            </Badge>
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <Clock className="h-3 w-3" />
                              <span>{sound.duration}s</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => playSound(sound.id)}
                          disabled={playingSounds.has(sound.id)}
                        >
                          {playingSounds.has(sound.id) ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{sound.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredSounds.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No sounds found</h3>
                    <p className="text-gray-600">
                      {selectedCategory !== 'all' 
                        ? `No sounds found for the ${selectedCategory} category.`
                        : 'No notification sounds are available.'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}














