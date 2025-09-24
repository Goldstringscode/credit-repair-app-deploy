"use client"

import { useMLMNotifications } from "@/lib/mlm-notification-context"
import { Badge } from "@/components/ui/badge"

export function MLMNotificationBadge() {
  const { unreadCount } = useMLMNotifications()
  
  if (unreadCount === 0) {
    return null
  }
  
  return (
    <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
      {unreadCount > 99 ? '99+' : unreadCount}
    </Badge>
  )
}
