"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessagingService } from "@/lib/messaging"
import { Bell } from "lucide-react"

export function MessageNotification() {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Initial load
    updateUnreadCount()

    // Update every 30 seconds
    const interval = setInterval(updateUnreadCount, 30000)

    return () => clearInterval(interval)
  }, [])

  const updateUnreadCount = () => {
    const count = MessagingService.getUnreadCount()
    setUnreadCount(count)
  }

  if (unreadCount === 0) {
    return null
  }

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" className="relative">
        <Bell className="h-4 w-4" />
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      </Button>
    </div>
  )
}
