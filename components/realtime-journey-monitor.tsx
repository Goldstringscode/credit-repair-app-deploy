"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Users, AlertTriangle, CheckCircle, Eye, Bell, X, Wifi, WifiOff } from "lucide-react"
import RealtimeJourneyTracker, { type RealtimeJourneyData, type JourneyAlert } from "@/lib/realtime-journey-tracker"

interface RealtimeJourneyMonitorProps {
  className?: string
}

export default function RealtimeJourneyMonitor({ className }: RealtimeJourneyMonitorProps) {
  const [data, setData] = useState<RealtimeJourneyData | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [tracker] = useState(() => RealtimeJourneyTracker.getInstance())

  useEffect(() => {
    setIsConnected(true)

    const unsubscribe = tracker.subscribe((newData) => {
      setData(newData)
    })

    return () => {
      unsubscribe()
      setIsConnected(false)
    }
  }, [tracker])

  const handleAcknowledgeAlert = (alertId: string) => {
    tracker.acknowledgeAlert(alertId)
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes.toFixed(1)}m`
    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    return `${hours}h ${mins}m`
  }

  const formatPercent = (percent: number) => `${percent.toFixed(1)}%`

  const getSeverityColor = (severity: JourneyAlert["severity"]) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (!data) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Connecting to real-time monitoring...</p>
          </div>
        </div>
      </div>
    )
  }

  const activeJourneys = Array.from(data.journeyMetrics.entries())
  const totalActiveUsers = Array.from(data.journeyMetrics.values()).reduce(
    (sum, metrics) => sum + metrics.activeUsers,
    0,
  )
  const unacknowledgedAlerts = data.alerts.filter((alert) => !alert.acknowledged)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Wifi className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">Real-time monitoring active</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-600">Connection lost</span>
            </>
          )}
        </div>
        <div className="text-xs text-gray-500">Last update: {new Date().toLocaleTimeString()}</div>
      </div>

      {/* Alerts */}
      {unacknowledgedAlerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="h-5 w-5 text-red-600" />
            Active Alerts ({unacknowledgedAlerts.length})
          </h3>
          {unacknowledgedAlerts.slice(0, 5).map((alert) => (
            <Alert key={alert.id} className={getSeverityColor(alert.severity)}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <div>
                  <strong>{alert.type.replace(/_/g, " ").toUpperCase()}</strong>: {alert.message}
                  <div className="text-xs mt-1">{new Date(alert.timestamp).toLocaleString()}</div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleAcknowledgeAlert(alert.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveUsers}</div>
            <p className="text-xs text-muted-foreground">Currently in journeys</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Journeys</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeJourneys.length}</div>
            <p className="text-xs text-muted-foreground">Journey types running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Events</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.recentEvents.length}</div>
            <p className="text-xs text-muted-foreground">Last 100 events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{unacknowledgedAlerts.length}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="journeys" className="space-y-4">
        <TabsList>
          <TabsTrigger value="journeys">Live Journeys</TabsTrigger>
          <TabsTrigger value="events">Recent Events</TabsTrigger>
          <TabsTrigger value="alerts">Alert History</TabsTrigger>
        </TabsList>

        <TabsContent value="journeys">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeJourneys.map(([journeyId, metrics]) => (
              <Card key={journeyId}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="capitalize">{journeyId.replace(/_/g, " ")}</span>
                    <Badge variant={metrics.activeUsers > 0 ? "default" : "secondary"}>
                      {metrics.activeUsers} active
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Completion Rate</span>
                      <span className="font-medium">{formatPercent(metrics.completionRate)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg Time/Step</span>
                      <span className="font-medium">{formatTime(metrics.avgTimePerStep)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Drop-off Rate</span>
                      <span className="font-medium text-red-600">{formatPercent(metrics.dropoffRate)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Revenue</span>
                      <span className="font-medium text-green-600">${metrics.revenueGenerated.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Recent Journey Events</CardTitle>
              <CardDescription>Live stream of user journey activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {data.recentEvents.slice(0, 20).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <div>
                        <div className="font-medium">
                          {event.stepName} - {event.event.replace(/_/g, " ")}
                        </div>
                        <div className="text-sm text-gray-600">
                          Journey: {event.journeyId} | User: {event.userId.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Alert History</CardTitle>
              <CardDescription>All journey monitoring alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {data.alerts.map((alert) => (
                  <div key={alert.id} className={`p-3 border rounded-lg ${getSeverityColor(alert.severity)}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{alert.type.replace(/_/g, " ").toUpperCase()}</div>
                        <div className="text-sm mt-1">{alert.message}</div>
                        <div className="text-xs mt-1">{new Date(alert.timestamp).toLocaleString()}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={alert.acknowledged ? "secondary" : "destructive"}>
                          {alert.acknowledged ? "Acknowledged" : "Active"}
                        </Badge>
                        {!alert.acknowledged && (
                          <Button size="sm" variant="ghost" onClick={() => handleAcknowledgeAlert(alert.id)}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
