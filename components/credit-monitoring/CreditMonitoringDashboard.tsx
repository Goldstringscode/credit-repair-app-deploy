'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  RefreshCw,
  Bell,
  Settings,
  Eye,
  Download,
  BarChart3,
  CreditCard,
  Shield,
  Activity
} from 'lucide-react'
import { CreditScore, CreditAlert, CreditReport, MonitoringSettings } from '@/lib/credit-monitoring/credit-bureau-apis'

interface CreditMonitoringDashboardProps {
  onRefresh?: () => void
}

export function CreditMonitoringDashboard({ onRefresh }: CreditMonitoringDashboardProps) {
  const [scores, setScores] = useState<CreditScore[]>([])
  const [alerts, setAlerts] = useState<CreditAlert[]>([])
  const [reports, setReports] = useState<CreditReport[]>([])
  const [settings, setSettings] = useState<MonitoringSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchScores(),
        fetchAlerts(),
        fetchReports(),
        fetchSettings()
      ])
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchScores = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/credit-monitoring/scores', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setScores(data.scores || [])
      }
    } catch (error) {
      console.error('Failed to fetch scores:', error)
    }
  }

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/credit-monitoring/alerts', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAlerts(data.alerts || [])
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
    }
  }

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/credit-monitoring/reports', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setReports(data.reports || [])
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    }
  }

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/credit-monitoring/settings', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAllData()
    setRefreshing(false)
    onRefresh?.()
  }

  const getScoreColor = (score: number) => {
    if (score >= 750) return 'text-green-600'
    if (score >= 700) return 'text-blue-600'
    if (score >= 650) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 750) return 'Excellent'
    if (score >= 700) return 'Good'
    if (score >= 650) return 'Fair'
    return 'Poor'
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'score_change': return TrendingUp
      case 'new_account': return CreditCard
      case 'inquiry': return Eye
      case 'payment_missed': return AlertTriangle
      case 'balance_change': return BarChart3
      default: return Bell
    }
  }

  const calculateAverageScore = () => {
    if (scores.length === 0) return 0
    const sum = scores.reduce((acc, score) => acc + score.score, 0)
    return Math.round(sum / scores.length)
  }

  const getUnreadAlertsCount = () => {
    return alerts.filter(alert => alert.actionRequired).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Credit Monitoring</h2>
          <p className="text-gray-600">Real-time credit score tracking and alerts</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Average Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(calculateAverageScore())}`}>
                  {calculateAverageScore()}
                </p>
                <p className="text-xs text-gray-500">{getScoreLabel(calculateAverageScore())}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Alerts</p>
                <p className="text-2xl font-bold text-orange-600">{getUnreadAlertsCount()}</p>
                <p className="text-xs text-gray-500">Require attention</p>
              </div>
              <Bell className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Bureaus Monitored</p>
                <p className="text-2xl font-bold text-green-600">{scores.length}</p>
                <p className="text-xs text-gray-500">All 3 bureaus</p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Last Updated</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date().toLocaleTimeString()}
                </p>
                <p className="text-xs text-gray-500">Real-time monitoring</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scores">Credit Scores</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Credit Scores Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Credit Scores Overview
              </CardTitle>
              <CardDescription>
                Your credit scores across all three major bureaus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {scores.map((score) => (
                  <div key={score.bureau} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium capitalize">{score.bureau}</h4>
                      <Badge variant="outline">{score.scoreType}</Badge>
                    </div>
                    <div className="text-center">
                      <p className={`text-3xl font-bold ${getScoreColor(score.score)}`}>
                        {score.score}
                      </p>
                      <p className="text-sm text-gray-500">{getScoreLabel(score.score)}</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          score.score >= 750 ? 'bg-green-500' :
                          score.score >= 700 ? 'bg-blue-500' :
                          score.score >= 650 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(score.score / 850) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      Updated {new Date(score.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Alerts
              </CardTitle>
              <CardDescription>
                Latest credit monitoring alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.slice(0, 5).map((alert) => {
                  const Icon = getAlertIcon(alert.type)
                  return (
                    <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Icon className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{alert.title}</h4>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{alert.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(alert.date).toLocaleString()}
                        </p>
                      </div>
                      {alert.actionRequired && (
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      )}
                    </div>
                  )
                })}
                {alerts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>No recent alerts</p>
                    <p className="text-sm">Your credit is being monitored 24/7</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scores" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Credit Scores</CardTitle>
              <CardDescription>
                Comprehensive view of your credit scores and factors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {scores.map((score) => (
                  <div key={score.bureau} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold capitalize">{score.bureau}</h3>
                      <div className="text-right">
                        <p className={`text-3xl font-bold ${getScoreColor(score.score)}`}>
                          {score.score}
                        </p>
                        <p className="text-sm text-gray-500">{getScoreLabel(score.score)}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium">Credit Factors</h4>
                      {score.factors.map((factor, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{factor.description}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  factor.impact === 'positive' ? 'bg-green-500' :
                                  factor.impact === 'negative' ? 'bg-red-500' : 'bg-gray-500'
                                }`}
                                style={{ width: `${factor.weight * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {Math.round(factor.weight * 100)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Alerts</CardTitle>
              <CardDescription>
                Complete list of credit monitoring alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => {
                  const Icon = getAlertIcon(alert.type)
                  return (
                    <div key={alert.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
                      <Icon className="h-6 w-6 text-gray-500 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{alert.title}</h4>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {alert.bureau}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(alert.date).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {alert.actionRequired && (
                          <Button size="sm" variant="outline">
                            Take Action
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
                {alerts.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No alerts found</p>
                    <p className="text-sm">Your credit monitoring is active and will notify you of any changes</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Credit Reports</CardTitle>
              <CardDescription>
                Access your latest credit reports from all three bureaus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {reports.map((report) => (
                  <div key={report.bureau} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold capitalize">{report.bureau}</h3>
                      <Badge variant="outline">{report.reportId}</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Accounts:</span> {report.summary.totalAccounts}</p>
                      <p><span className="font-medium">Open:</span> {report.summary.openAccounts}</p>
                      <p><span className="font-medium">Total Debt:</span> ${report.summary.totalDebt.toLocaleString()}</p>
                      <p><span className="font-medium">Utilization:</span> {(report.summary.creditUtilization * 100).toFixed(1)}%</p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
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
