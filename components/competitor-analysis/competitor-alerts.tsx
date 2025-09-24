"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, TrendingUp, TrendingDown, AlertTriangle, Info, Settings } from "lucide-react"

interface CompetitorAlert {
  id: string
  type: "performance" | "pricing" | "market" | "regulatory"
  severity: "low" | "medium" | "high" | "critical"
  title: string
  description: string
  competitor?: string
  metric?: string
  oldValue?: number
  newValue?: number
  timestamp: Date
  actionRequired: boolean
  dismissed: boolean
}

interface CompetitorAlertsProps {
  affiliateId: string
}

export function CompetitorAlerts({ affiliateId }: CompetitorAlertsProps) {
  const [alerts, setAlerts] = useState<CompetitorAlert[]>([])
  const [alertSettings, setAlertSettings] = useState({
    performanceAlerts: true,
    pricingAlerts: true,
    marketAlerts: true,
    regulatoryAlerts: true,
    emailNotifications: true,
    pushNotifications: false,
    alertFrequency: "immediate",
  })
  const [loading, setLoading] = useState(false)

  // Mock alerts data
  const mockAlerts: CompetitorAlert[] = [
    {
      id: "alert_1",
      type: "performance",
      severity: "high",
      title: "Credit Saint Increased Commission Rate",
      description:
        "Credit Saint raised their affiliate commission from 35% to 42%, potentially affecting affiliate recruitment",
      competitor: "Credit Saint",
      metric: "commission_rate",
      oldValue: 35,
      newValue: 42,
      timestamp: new Date("2024-01-20T10:30:00Z"),
      actionRequired: true,
      dismissed: false,
    },
    {
      id: "alert_2",
      type: "pricing",
      severity: "medium",
      title: "Sky Blue Credit Pricing Change",
      description: "Sky Blue reduced their monthly service fee by $10, improving their competitive position",
      competitor: "Sky Blue Credit",
      metric: "pricing",
      oldValue: 79,
      newValue: 69,
      timestamp: new Date("2024-01-19T14:15:00Z"),
      actionRequired: true,
      dismissed: false,
    },
    {
      id: "alert_3",
      type: "market",
      severity: "critical",
      title: "New Competitor Entered Market",
      description: "TurboCredit launched with aggressive pricing and 50% commission rates for affiliates",
      timestamp: new Date("2024-01-18T09:00:00Z"),
      actionRequired: true,
      dismissed: false,
    },
    {
      id: "alert_4",
      type: "regulatory",
      severity: "medium",
      title: "CFPB Updated Guidelines",
      description: "New disclosure requirements for credit repair marketing materials effective March 1st",
      timestamp: new Date("2024-01-17T16:45:00Z"),
      actionRequired: true,
      dismissed: false,
    },
    {
      id: "alert_5",
      type: "performance",
      severity: "low",
      title: "Lexington Law Traffic Decline",
      description: "Lexington Law's monthly traffic decreased by 8% compared to last month",
      competitor: "Lexington Law",
      metric: "monthly_traffic",
      oldValue: 2800000,
      newValue: 2576000,
      timestamp: new Date("2024-01-16T11:20:00Z"),
      actionRequired: false,
      dismissed: false,
    },
  ]

  useEffect(() => {
    setAlerts(mockAlerts)
  }, [])

  const getSeverityColor = (severity: string) => {
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "performance":
        return <TrendingUp className="h-4 w-4" />
      case "pricing":
        return <TrendingDown className="h-4 w-4" />
      case "market":
        return <AlertTriangle className="h-4 w-4" />
      case "regulatory":
        return <Info className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const dismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, dismissed: true } : alert)))
  }

  const updateAlertSettings = (key: string, value: any) => {
    setAlertSettings((prev) => ({ ...prev, [key]: value }))
  }

  const activeAlerts = alerts.filter((alert) => !alert.dismissed)
  const criticalAlerts = activeAlerts.filter((alert) => alert.severity === "critical")
  const actionRequiredAlerts = activeAlerts.filter((alert) => alert.actionRequired)

  return (
    <div className="space-y-6">
      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                <p className="text-2xl font-bold">{activeAlerts.length}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{criticalAlerts.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Action Required</p>
                <p className="text-2xl font-bold text-orange-600">{actionRequiredAlerts.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Settings</p>
                <Button variant="outline" size="sm" className="mt-1 bg-transparent">
                  <Settings className="h-4 w-4 mr-1" />
                  Configure
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Alerts */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeAlerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active alerts</p>
                  </div>
                ) : (
                  activeAlerts.map((alert) => (
                    <div key={alert.id} className={`p-4 border rounded-lg ${getSeverityColor(alert.severity)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="mt-1">{getTypeIcon(alert.type)}</div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium">{alert.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {alert.type}
                              </Badge>
                              {alert.actionRequired && (
                                <Badge variant="destructive" className="text-xs">
                                  Action Required
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm mb-2">{alert.description}</p>

                            {alert.competitor && (
                              <p className="text-xs text-gray-600 mb-1">Competitor: {alert.competitor}</p>
                            )}

                            {alert.oldValue && alert.newValue && (
                              <p className="text-xs text-gray-600 mb-1">
                                Changed from {alert.oldValue} to {alert.newValue}
                              </p>
                            )}

                            <p className="text-xs text-gray-500">
                              {alert.timestamp.toLocaleDateString()} at {alert.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => dismissAlert(alert.id)}>
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert Settings */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Alert Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">Alert Types</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Performance Changes</label>
                      <Switch
                        checked={alertSettings.performanceAlerts}
                        onCheckedChange={(checked) => updateAlertSettings("performanceAlerts", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Pricing Updates</label>
                      <Switch
                        checked={alertSettings.pricingAlerts}
                        onCheckedChange={(checked) => updateAlertSettings("pricingAlerts", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Market Changes</label>
                      <Switch
                        checked={alertSettings.marketAlerts}
                        onCheckedChange={(checked) => updateAlertSettings("marketAlerts", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Regulatory Updates</label>
                      <Switch
                        checked={alertSettings.regulatoryAlerts}
                        onCheckedChange={(checked) => updateAlertSettings("regulatoryAlerts", checked)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Notification Preferences</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Email Notifications</label>
                      <Switch
                        checked={alertSettings.emailNotifications}
                        onCheckedChange={(checked) => updateAlertSettings("emailNotifications", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Push Notifications</label>
                      <Switch
                        checked={alertSettings.pushNotifications}
                        onCheckedChange={(checked) => updateAlertSettings("pushNotifications", checked)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Alert Frequency</h4>
                  <Select
                    value={alertSettings.alertFrequency}
                    onValueChange={(value) => updateAlertSettings("alertFrequency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="hourly">Hourly Digest</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full" onClick={() => setLoading(true)}>
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
