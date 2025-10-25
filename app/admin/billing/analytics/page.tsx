'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  TrendingDown,
  CreditCard,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw,
  Download,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { databaseService } from '@/lib/database-service'

interface BillingMetrics {
  totalRevenue: number
  monthlyRecurringRevenue: number
  activeSubscriptions: number
  totalSubscriptions: number
  churnRate: number
  averageRevenuePerUser: number
  paymentSuccessRate: number
  newSubscriptions: number
  canceledSubscriptions: number
  growthRate: number
}

interface PlanMetrics {
  planId: string
  planName: string
  subscriptions: number
  revenue: number
  revenuePercentage: number
  averageRevenuePerUser: number
  churnRate: number
}

interface AnalyticsDashboardProps {}

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<BillingMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('30d')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadMetrics()
  }, [timeRange])

  // Auto-refresh when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadMetrics()
      }
    }

    const handleFocus = () => {
      loadMetrics()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [timeRange])

  const loadMetrics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load data from unified database service
      const subscriptionsResponse = await databaseService.getSubscriptions()
      
      if (subscriptionsResponse.success && subscriptionsResponse.data) {
        const subscriptions = subscriptionsResponse.data.subscriptions
        const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active')
        const newSubscriptions = subscriptions.filter(sub => {
          const createdDate = new Date(sub.createdAt)
          const daysDiff = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
          return daysDiff <= 30
        })
        const canceledSubscriptions = subscriptions.filter(sub => sub.status === 'cancelled')
        
        const mrr = activeSubscriptions.reduce((sum, sub) => sum + (sub.amount || 0), 0)
        const arr = mrr * 12
        const arpu = activeSubscriptions.length > 0 ? mrr / activeSubscriptions.length : 0
        const churnRate = subscriptions.length > 0 ? (canceledSubscriptions.length / subscriptions.length) * 100 : 0
        const growthRate = subscriptions.length > 0 ? (newSubscriptions.length / subscriptions.length) * 100 : 0
        
        const billingMetrics: BillingMetrics = {
          totalRevenue: arr,
          monthlyRecurringRevenue: mrr,
          activeSubscriptions: activeSubscriptions.length,
          totalSubscriptions: subscriptions.length,
          churnRate: Math.round(churnRate * 10) / 10,
          averageRevenuePerUser: Math.round(arpu * 100) / 100,
          paymentSuccessRate: 99.0, // Static for now
          newSubscriptions: newSubscriptions.length,
          canceledSubscriptions: canceledSubscriptions.length,
          growthRate: Math.round(growthRate * 10) / 10
        }
        
        setMetrics(billingMetrics)
      } else {
        setError('Failed to load subscription data')
      }
    } catch (err: any) {
      console.error('Error loading metrics:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadMetrics()
    setRefreshing(false)
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
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Activity className="h-4 w-4 text-gray-500" />
  }

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-600'
    if (value < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Billing Analytics</h1>
            <p className="text-gray-600">Real-time billing metrics and insights</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Billing Analytics</h1>
            <p className="text-gray-600">Real-time billing metrics and insights</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Analytics</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadMetrics} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Billing Analytics</h1>
            <p className="text-gray-600">Real-time billing metrics and insights</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">No analytics data available</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing Analytics</h1>
          <p className="text-gray-600">Real-time billing metrics and insights</p>
        </div>
        <div className="flex items-center space-x-4">
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
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

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
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Subscriptions</p>
                <p className="text-2xl font-bold">{metrics.totalSubscriptions}</p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-gray-600">
                    {metrics.activeSubscriptions} active
                  </span>
                </div>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
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
                    {formatPercentage(100 - metrics.customerRetentionRate)} retention
                  </span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Revenue Per User</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.averageRevenuePerUser)}</p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-gray-600">
                    {metrics.totalCustomers} customers
                  </span>
                </div>
              </div>
              <CreditCard className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly recurring revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                    <p>Revenue chart would be here</p>
                    <p className="text-sm">Last 30 days: {formatCurrency(metrics.monthlyRecurringRevenue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Status */}
            <Card>
              <CardHeader>
                <CardTitle>Subscription Status</CardTitle>
                <CardDescription>Current subscription distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>Active</span>
                    </div>
                    <Badge variant="secondary">{metrics.activeSubscriptions}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <XCircle className="h-4 w-4 text-red-500 mr-2" />
                      <span>Canceled</span>
                    </div>
                    <Badge variant="destructive">{metrics.canceledSubscriptions}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                      <span>Past Due</span>
                    </div>
                    <Badge variant="outline">0</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Revenue</CardTitle>
                <CardDescription>All-time revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Annual Recurring Revenue</CardTitle>
                <CardDescription>Projected yearly revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatCurrency(metrics.annualRecurringRevenue)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lifetime Value</CardTitle>
                <CardDescription>Average customer value</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatCurrency(metrics.lifetimeValue)}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Growth</CardTitle>
                <CardDescription>New subscriptions over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                    <p>Growth chart would be here</p>
                    <p className="text-sm">New this month: {metrics.newSubscriptions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Churn Analysis</CardTitle>
                <CardDescription>Subscription cancellation trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <TrendingDown className="h-12 w-12 mx-auto mb-2" />
                    <p>Churn chart would be here</p>
                    <p className="text-sm">Churn rate: {formatPercentage(metrics.churnRate)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Customers</CardTitle>
                <CardDescription>All-time customer count</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{metrics.totalCustomers}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>New Customers</CardTitle>
                <CardDescription>Customers this month</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{metrics.newCustomers}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Retention Rate</CardTitle>
                <CardDescription>Customer retention percentage</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatPercentage(metrics.customerRetentionRate)}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <div className="space-y-4">
            {metrics.planMetrics.map((plan) => (
              <Card key={plan.planId}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{plan.planName}</h3>
                      <p className="text-sm text-gray-600">
                        {plan.subscriptions} subscriptions • {formatCurrency(plan.revenue)} revenue
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Revenue Share</p>
                      <p className="text-lg font-semibold">{formatPercentage(plan.revenuePercentage)}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">ARPU</p>
                      <p className="font-semibold">{formatCurrency(plan.averageRevenuePerUser)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Churn Rate</p>
                      <p className="font-semibold">{formatPercentage(plan.churnRate)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Growth</p>
                      <p className="font-semibold">{formatPercentage(plan.growthRate)}</p>
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