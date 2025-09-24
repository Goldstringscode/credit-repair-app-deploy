"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Users, Award, Activity, Wifi, WifiOff, MessageSquare, CheckSquare } from "lucide-react"
import { realtimeMLMService, type MLMStats } from "@/lib/realtime-mlm-service"

interface StatsWidgetProps {
  className?: string
}

export function RealtimeStatsWidget({ className }: StatsWidgetProps) {
  const [stats, setStats] = useState<MLMStats>({
    monthlyEarnings: 0,
    teamSize: 0,
    currentRank: "Loading...",
    activeRate: 0,
    unreadMessages: 0,
    pendingTasks: 0,
  })
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Subscribe to real-time stats updates
    const unsubscribeStats = realtimeMLMService.subscribeToStats((newStats) => {
      setStats(newStats)
      setIsLoading(false)
    })

    // Subscribe to connection status
    const unsubscribeConnection = realtimeMLMService.subscribeToConnectionStatus((connected) => {
      setIsConnected(connected)
    })

    return () => {
      unsubscribeStats()
      unsubscribeConnection()
    }
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getConnectionStatus = () => {
    if (isLoading) {
      return { text: "Connecting...", color: "bg-yellow-500", icon: <Activity className="h-3 w-3 animate-spin" /> }
    }
    if (isConnected) {
      return { text: "Live", color: "bg-green-500", icon: <Wifi className="h-3 w-3" /> }
    }
    return { text: "Offline", color: "bg-red-500", icon: <WifiOff className="h-3 w-3" /> }
  }

  const connectionStatus = getConnectionStatus()

  const quickStats = [
    {
      label: "Monthly Earnings",
      value: formatCurrency(stats.monthlyEarnings),
      change: "+18.2%",
      changeType: "positive" as const,
      icon: <DollarSign className="h-5 w-5 text-green-600" />,
      loading: isLoading,
    },
    {
      label: "Team Size",
      value: stats.teamSize.toString(),
      change: "+3 this week",
      changeType: "positive" as const,
      icon: <Users className="h-5 w-5 text-blue-600" />,
      loading: isLoading,
    },
    {
      label: "Current Rank",
      value: stats.currentRank,
      change: "65% to Executive",
      changeType: "neutral" as const,
      icon: <Award className="h-5 w-5 text-purple-600" />,
      loading: isLoading,
    },
    {
      label: "Active Rate",
      value: `${stats.activeRate}%`,
      change: "+5.2%",
      changeType: "positive" as const,
      icon: <Activity className="h-5 w-5 text-orange-600" />,
      loading: isLoading,
    },
  ]

  return (
    <div className={className}>
      {/* Connection Status */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Live Dashboard</h2>
        <Badge className={`${connectionStatus.color} text-white border-0`}>
          {connectionStatus.icon}
          <span className="ml-1">{connectionStatus.text}</span>
        </Badge>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {quickStats.map((stat, index) => (
          <Card
            key={index}
            className="bg-white/80 backdrop-blur-sm border-0 shadow-lg transition-all duration-300 hover:shadow-xl"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  {stat.loading ? (
                    <div className="h-8 bg-gray-200 rounded animate-pulse mb-2" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  )}
                  <p
                    className={`text-sm ${
                      stat.changeType === "positive"
                        ? "text-green-600"
                        : stat.changeType === "negative"
                          ? "text-red-600"
                          : "text-gray-600"
                    }`}
                  >
                    {stat.change}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-full">{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Unread Messages</p>
                  <p className="text-sm text-gray-600">Team communications</p>
                </div>
              </div>
              <div className="text-right">
                {isLoading ? (
                  <div className="h-6 w-8 bg-gray-200 rounded animate-pulse" />
                ) : (
                  <Badge className={stats.unreadMessages > 0 ? "bg-red-500" : "bg-gray-500"}>
                    {stats.unreadMessages}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <CheckSquare className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Pending Tasks</p>
                  <p className="text-sm text-gray-600">Action items</p>
                </div>
              </div>
              <div className="text-right">
                {isLoading ? (
                  <div className="h-6 w-8 bg-gray-200 rounded animate-pulse" />
                ) : (
                  <Badge className={stats.pendingTasks > 0 ? "bg-orange-500" : "bg-gray-500"}>
                    {stats.pendingTasks}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Activity Indicator */}
      {isConnected && !isLoading && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-sm text-green-700 font-medium">Real-time updates active</p>
          </div>
        </div>
      )}
    </div>
  )
}
