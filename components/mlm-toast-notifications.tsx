"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react"
import { useMLMNotifications } from "@/lib/mlm-notification-context"

interface ToastProps {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  message: string
  duration?: number
  onClose: () => void
}

function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case "info":
        return <Info className="h-5 w-5 text-blue-600" />
      default:
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getBorderColor = () => {
    switch (type) {
      case "success":
        return "border-l-green-500"
      case "error":
        return "border-l-red-500"
      case "warning":
        return "border-l-yellow-500"
      case "info":
        return "border-l-blue-500"
      default:
        return "border-l-blue-500"
    }
  }

  return (
    <Card className={`w-full max-w-sm border-l-4 ${getBorderColor()} shadow-lg animate-in slide-in-from-right-full`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900">{title}</h4>
            <p className="text-sm text-gray-600 mt-1">{message}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function MLMToastNotifications() {
  const { notifications } = useMLMNotifications()
  const [toasts, setToasts] = useState<
    Array<{ id: string; type: "success" | "error" | "warning" | "info"; title: string; message: string }>
  >([])

  useEffect(() => {
    // Convert new MLM notifications to toasts
    const newNotifications = notifications.filter((n) => !n.read).slice(0, 3) // Show max 3 toasts

    const newToasts = newNotifications.map((notification) => ({
      id: notification.id,
      type:
        notification.priority === "high"
          ? ("warning" as const)
          : notification.type === "success" || notification.type === "milestone" || notification.type === "rank_advancement"
            ? ("success" as const)
            : notification.type === "alert" || notification.type === "error"
              ? ("error" as const)
              : ("info" as const),
      title: notification.title,
      message: notification.message,
    }))

    setToasts((prev) => {
      const existingIds = prev.map((t) => t.id)
      const uniqueNewToasts = newToasts.filter((t) => !existingIds.includes(t.id))
      return [...prev, ...uniqueNewToasts]
    })
  }, [notifications])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}
