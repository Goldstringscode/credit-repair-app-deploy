"use client"

import { useState, useEffect } from "react"
import { 
  Bell, 
  X, 
  Eye, 
  Trash2, 
  MoreVertical, 
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Settings,
  Filter,
  Search,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useNotifications } from "@/lib/notification-context"
import { useIsMobile } from "@/hooks/use-mobile"
import { NotificationActions } from "./notification-actions"
import { NotificationCategories } from "./notification-categories"

interface MobileNotificationProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileNotificationCenter({ isOpen, onClose }: MobileNotificationProps) {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    removeNotification, 
    getFilteredNotifications,
    playNotificationSound,
    getSoundSettings,
    updateSoundSettings
  } = useNotifications()
  
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'categories'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [swipeActions, setSwipeActions] = useState<Record<string, 'left' | 'right' | null>>({})
  const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set())

  const soundSettings = getSoundSettings()

  useEffect(() => {
    setSoundEnabled(soundSettings.enabled)
  }, [soundSettings])

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled)
    updateSoundSettings({ enabled })
  }

  const handleSwipeStart = (notificationId: string, direction: 'left' | 'right') => {
    setSwipeActions(prev => ({ ...prev, [notificationId]: direction }))
  }

  const handleSwipeEnd = (notificationId: string) => {
    const action = swipeActions[notificationId]
    if (action === 'left') {
      markAsRead(notificationId)
    } else if (action === 'right') {
      removeNotification(notificationId)
    }
    setSwipeActions(prev => ({ ...prev, [notificationId]: null }))
  }

  const toggleExpanded = (notificationId: string) => {
    setExpandedNotifications(prev => {
      const newSet = new Set(prev)
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId)
      } else {
        newSet.add(notificationId)
      }
      return newSet
    })
  }

  const filteredNotifications = getFilteredNotifications().filter(notification => {
    if (activeTab === 'unread' && notification.read) return false
    if (searchQuery && !notification.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !notification.message.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "credit_score":
        return "📈"
      case "dispute":
        return "⚖️"
      case "fcra":
        return "📋"
      case "payment":
        return "💳"
      case "alert":
        return "⚠️"
      case "mail":
        return "📧"
      default:
        return "🔔"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500 bg-red-50"
      case "medium":
        return "border-l-yellow-500 bg-yellow-50"
      default:
        return "border-l-blue-500 bg-blue-50"
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  if (!isMobile) {
    return null
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <SheetTitle>Notifications</SheetTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Search and Filters */}
          <div className="p-4 border-b space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex space-x-1">
                <Button
                  variant={activeTab === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('all')}
                >
                  All
                </Button>
                <Button
                  variant={activeTab === 'unread' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('unread')}
                >
                  Unread
                </Button>
                <Button
                  variant={activeTab === 'categories' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('categories')}
                >
                  Categories
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSoundToggle(!soundEnabled)}
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'categories' ? (
              <div className="p-4">
                <NotificationCategories />
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No notifications found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => {
                    const isExpanded = expandedNotifications.has(notification.id)
                    const swipeAction = swipeActions[notification.id]
                    
                    return (
                      <Card
                        key={notification.id}
                        className={`transition-all duration-200 ${
                          swipeAction === 'left' ? 'transform -translate-x-20' :
                          swipeAction === 'right' ? 'transform translate-x-20' : ''
                        } ${getPriorityColor(notification.priority)} ${
                          !notification.read ? "bg-blue-50/50" : ""
                        }`}
                        onTouchStart={(e) => {
                          const touch = e.touches[0]
                          const startX = touch.clientX
                          const startY = touch.clientY
                          
                          const handleTouchMove = (moveEvent: TouchEvent) => {
                            const moveTouch = moveEvent.touches[0]
                            const deltaX = moveTouch.clientX - startX
                            const deltaY = moveTouch.clientY - startY
                            
                            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                              if (deltaX > 0) {
                                handleSwipeStart(notification.id, 'right')
                              } else {
                                handleSwipeStart(notification.id, 'left')
                              }
                            }
                          }
                          
                          const handleTouchEnd = () => {
                            handleSwipeEnd(notification.id)
                            document.removeEventListener('touchmove', handleTouchMove)
                            document.removeEventListener('touchend', handleTouchEnd)
                          }
                          
                          document.addEventListener('touchmove', handleTouchMove)
                          document.addEventListener('touchend', handleTouchEnd)
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className="text-lg">{getNotificationIcon(notification.type)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4
                                  className={`text-sm font-medium ${
                                    !notification.read ? "text-gray-900" : "text-gray-700"
                                  }`}
                                >
                                  {notification.title}
                                </h4>
                                <div className="flex items-center space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleExpanded(notification.id)}
                                    className="h-6 w-6 p-0"
                                  >
                                    {isExpanded ? (
                                      <ChevronUp className="h-3 w-3" />
                                    ) : (
                                      <ChevronDown className="h-3 w-3" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                              
                              <p className={`text-sm mt-1 ${
                                !notification.read ? "text-gray-800" : "text-gray-600"
                              }`}>
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-muted-foreground">
                                  {formatTimeAgo(notification.timestamp)}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <Badge
                                    variant={notification.priority === "high" ? "destructive" : "secondary"}
                                    className="text-xs"
                                  >
                                    {notification.priority}
                                  </Badge>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                  )}
                                </div>
                              </div>

                              {/* Expanded Actions */}
                              {isExpanded && (
                                <div className="mt-3 pt-3 border-t">
                                  <NotificationActions 
                                    notification={notification} 
                                    compact={true}
                                    onActionComplete={() => {
                                      setExpandedNotifications(prev => {
                                        const newSet = new Set(prev)
                                        newSet.delete(notification.id)
                                        return newSet
                                      })
                                    }}
                                  />
                                </div>
                              )}

                              {/* Swipe Actions Indicator */}
                              {swipeAction && (
                                <div className="absolute inset-0 flex items-center justify-center bg-opacity-90">
                                  {swipeAction === 'left' && (
                                    <div className="flex items-center space-x-2 text-green-600">
                                      <Eye className="h-4 w-4" />
                                      <span className="text-sm font-medium">Mark Read</span>
                                    </div>
                                  )}
                                  {swipeAction === 'right' && (
                                    <div className="flex items-center space-x-2 text-red-600">
                                      <Trash2 className="h-4 w-4" />
                                      <span className="text-sm font-medium">Delete</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            )}
          </div>

          {/* Quick Actions Footer */}
          <div className="p-4 border-t bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Label htmlFor="sound-toggle" className="text-xs">
                  Sound
                </Label>
                <Switch
                  id="sound-toggle"
                  checked={soundEnabled}
                  onCheckedChange={handleSoundToggle}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    filteredNotifications.forEach(n => {
                      if (!n.read) markAsRead(n.id)
                    })
                  }}
                  className="text-xs"
                >
                  Mark All Read
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    filteredNotifications.forEach(n => removeNotification(n.id))
                  }}
                  className="text-xs text-destructive"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Mobile-optimized notification bell
export function MobileNotificationBell() {
  const { unreadCount } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useIsMobile()

  if (!isMobile) {
    return null
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setIsOpen(true)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>
      
      <MobileNotificationCenter 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  )
}
