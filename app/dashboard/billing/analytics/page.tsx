'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  CreditCard, 
  AlertTriangle,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Bell,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface BillingMetrics {
  totalRevenue: number
  monthlyRecurringRevenue: number
  annualRecurringRevenue: number
  averageRevenuePerUser: number
  lifetimeValue: number
  totalSubscriptions: number
  activeSubscriptions: number
  newSubscriptions: number
  canceledSubscriptions: number
  churnRate: number
  growthRate: number
  totalPayments: number
  successfulPayments: number
  failedPayments: number
  paymentSuccessRate: number
  averagePaymentAmount: number
  totalCustomers: number
  newCustomers: number
  activeCustomers: number
  churnedCustomers: number
  customerRetentionRate: number
  planMetrics: Array<{
    planId: string
    planName: string
    subscriptions: number
    revenue: number
    revenuePercentage: number
    averageRevenuePerUser: number
    churnRate: number
    growthRate: number
  }>
  dailyRevenue: Array<{ date: string; value: number }>
  monthlyRevenue: Array<{ date: string; value: number }>
  subscriptionGrowth: Array<{ date: string; value: number }>
  churnTrend: Array<{ date: string; value: number }>
}

interface BillingAlert {
  id: string
  name: string
  description: string
  type: string
  isActive: boolean
  lastTriggered?: string
  triggerCount: number
  recipients: string[]
}

export default function BillingAnalyticsPage() {
  const [metrics, setMetrics] = useState<BillingMetrics | null>(null)
  const [alerts, setAlerts] = useState<BillingAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedTab, setSelectedTab] = useState('overview')

  useEffect(() => {
    loadData()
  }, [timeRange])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load metrics
      const metricsResponse = await fetch('/api/billing/analytics?type=metrics')
      if (!metricsResponse.ok) throw new Error('Failed to load metrics')
      const metricsData = await metricsResponse.json()
      setMetrics(metricsData.metrics)

      // Load alerts
      const alertsResponse = await fetch('/api/billing/analytics?type=alerts')
      if (!alertsResponse.ok) throw new Error('Failed to load alerts')
      const alertsData = await alertsResponse.json()
      setAlerts(alertsData.alerts)

    } catch (err: any) {
      console.error('Failed to load data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const getTrendIcon = (value: number) => {
    return value >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    )
  }

  const getTrendColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600'
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>No metrics data available</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Billing Analytics</h1>
            <p className="text-gray-600">Comprehensive insights into your billing performance</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Recurring Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(metrics.monthlyRecurringRevenue)}</p>
                    <div className="flex items-center mt-1">
                      {getTrendIcon(metrics.growthRate)}
                      <span className={`text-sm ml-1 ${getTrendColor(metrics.growthRate)}`}>
                        {formatPercentage(metrics.growthRate)}
                      </span>
                    </div>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                    <p className="text-2xl font-bold">{metrics.activeSubscriptions.toLocaleString()}</p>
                    <div className="flex items-center mt-1">
                      {getTrendIcon(metrics.newSubscriptions)}
                      <span className="text-sm text-gray-600 ml-1">
                        +{metrics.newSubscriptions} this month
                      </span>
                    </div>
                  </div>
                  <CreditCard className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Churn Rate</p>
                    <p className="text-2xl font-bold">{formatPercentage(metrics.churnRate)}</p>
                    <div className="flex items-center mt-1">
                      {getTrendIcon(-metrics.churnRate)}
                      <span className={`text-sm ml-1 ${getTrendColor(-metrics.churnRate)}`}>
                        {metrics.canceledSubscriptions} canceled
                      </span>
                    </div>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Payment Success Rate</p>
                    <p className="text-2xl font-bold">{formatPercentage(metrics.paymentSuccessRate)}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-sm text-gray-600">
                        {metrics.successfulPayments.toLocaleString()} / {metrics.totalPayments.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Revenue chart would be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plan Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Plan Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.planMetrics.map((plan) => (
                  <div key={plan.planId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{plan.planName}</h4>
                      <p className="text-sm text-gray-600">{plan.subscriptions} subscriptions</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(plan.revenue)}</p>
                      <p className="text-sm text-gray-600">{formatPercentage(plan.revenuePercentage)} of total</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm text-gray-600">ARPU</p>
                      <p className="font-semibold">{formatCurrency(plan.averageRevenuePerUser)}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm text-gray-600">Churn</p>
                      <p className={`font-semibold ${plan.churnRate > 2 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatPercentage(plan.churnRate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Annual Recurring Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(metrics.annualRecurringRevenue)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Revenue Per User</p>
                    <p className="text-2xl font-bold">{formatCurrency(metrics.averageRevenuePerUser)}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue charts would go here */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Revenue breakdown charts would be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Subscriptions</p>
                    <p className="text-2xl font-bold">{metrics.totalSubscriptions.toLocaleString()}</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">New This Month</p>
                    <p className="text-2xl font-bold text-green-600">+{metrics.newSubscriptions}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Canceled This Month</p>
                    <p className="text-2xl font-bold text-red-600">-{metrics.canceledSubscriptions}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                    <p className="text-2xl font-bold">{formatPercentage(metrics.growthRate)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subscription charts would go here */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Subscription growth charts would be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Customers</p>
                    <p className="text-2xl font-bold">{metrics.totalCustomers.toLocaleString()}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Customers</p>
                    <p className="text-2xl font-bold text-green-600">{metrics.activeCustomers.toLocaleString()}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">New Customers</p>
                    <p className="text-2xl font-bold">+{metrics.newCustomers}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Retention Rate</p>
                    <p className="text-2xl font-bold">{formatPercentage(metrics.customerRetentionRate)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Billing Alerts</h3>
            <Button>
              <Bell className="h-4 w-4 mr-2" />
              Create Alert
            </Button>
          </div>

          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{alert.name}</h4>
                        <Badge variant={alert.isActive ? "default" : "secondary"}>
                          {alert.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Type: {alert.type}</span>
                        <span>Triggers: {alert.triggerCount}</span>
                        {alert.lastTriggered && (
                          <span>Last: {new Date(alert.lastTriggered).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        {alert.isActive ? "Disable" : "Enable"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}


