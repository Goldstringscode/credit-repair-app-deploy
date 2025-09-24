"use client"

import { Wifi, WifiOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from "@/lib/notification-context"

export function RealTimeStatus() {
  const { isConnected } = useNotifications()

  return (
    <div className="flex items-center space-x-2">
      {isConnected ? (
        <>
          <Wifi className="h-4 w-4 text-green-600" />
          <Badge variant="outline" className="text-green-600 border-green-600">
            Live Updates
          </Badge>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-600" />
          <Badge variant="outline" className="text-red-600 border-red-600">
            Offline
          </Badge>
        </>
      )}
    </div>
  )
}
