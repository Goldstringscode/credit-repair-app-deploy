'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Calendar,
  BarChart3,
  PieChart,
  Download,
  RefreshCw
} from 'lucide-react'

interface BillingAnalyticsProps {
  onRefresh: () => void
}

interface AnalyticsData {
  totalSpent: number
  monthlySpent: number
  averageMonthlySpent: number
  totalInvoices: number
  paidInvoices: number
  pendingInvoices: number
  overdueInvoices: number
  paymentMethods: number
  subscriptionLength: number
  savings: number
  spendingTrend: 'up' | 'down' | 'stable'
  monthlyBreakdown: Array<{
    month: string
    amount: number
    invoices: number
  }>
  categoryBreakdown: Array<{
    category: string
    amount: number
    percentage: number
  }>
}

export function BillingAnalytics({ onRefresh }: BillingAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('12months')
  const [viewType, setViewType] = useState('overview')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`/api/billing/user/analytics?range=${timeRange}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.analytics)
      } else {
        // Generate sample data for demo
        setAnalytics(generateSampleAnalytics())
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      setAnalytics(generateSampleAnalytics())
    } finally {
      setLoading(false)
    }
  }

  const generateSampleAnalytics = (): AnalyticsData => {
    return {
      totalSpent: 8997, // $89.97
      monthlySpent: 2999, // $29.99
      averageMonthlySpent: 2999,
      totalInvoices: 12,
      paidInvoices: 10,
      pendingInvoices: 1,
      overdueInvoices: 1,
      paymentMethods: 2,
      subscriptionLength: 12, // months
      savings: 599, // $5.99
      spendingTrend: 'stable',
      monthlyBreakdown: [
        { month: 'Jan 2024', amount: 2999, invoices: 1 },
        { month: 'Feb 2024', amount: 2999, invoices: 1 },
        { month: 'Mar 2024', amount: 2999, invoices: 1 },
        { month: 'Apr 2024', amount: 2999, invoices: 1 },
        { month: 'May 2024', amount: 2999, invoices: 1 },
        { month: 'Jun 2024', amount: 2999, invoices: 1 },
        { month: 'Jul 2024', amount: 2999, invoices: 1 },
        { month: 'Aug 2024', amount: 2999, invoices: 1 },
        { month: 'Sep 2024', amount: 2999, invoices: 1 },
        { month: 'Oct 2024', amount: 2999, invoices: 1 },
        { month: 'Nov 2024', amount: 2999, invoices: 1 },
        { month: 'Dec 2024', amount: 2999, invoices: 1 }
      ],
      categoryBreakdown: [
        { category: 'Subscription', amount: 8997, percentage: 100 },
        { category: 'Late Fees', amount: 0, percentage: 0 },
        { category: 'Taxes', amount: 0, percentage: 0 }
      ]
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-500" />
      default:
        return <BarChart3 className="h-4 w-4 text-blue-500" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-red-600'
      case 'down':
        return 'text-green-600'
      default:
        return 'text-blue-600'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!analytics) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Billing Analytics</h2>
          <p className="text-gray-600">Insights into your billing patterns and spending</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 months</SelectItem>
              <SelectItem value="6months">Last 6 months</SelectItem>
              <SelectItem value="12months">Last 12 months</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Spent</p>
                <p className="text-2xl font-bold">${(analytics.totalSpent / 100).toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              {getTrendIcon(analytics.spendingTrend)}
              <span className={`text-sm ml-1 ${getTrendColor(analytics.spendingTrend)}`}>
                {analytics.spendingTrend === 'stable' ? 'Stable' : 
                 analytics.spendingTrend === 'up' ? 'Increasing' : 'Decreasing'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Monthly Average</p>
                <p className="text-2xl font-bold">${(analytics.averageMonthlySpent / 100).toFixed(2)}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Over {analytics.subscriptionLength} months
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Invoices</p>
                <p className="text-2xl font-bold">{analytics.totalInvoices}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="default" className="bg-green-100 text-green-800">
                {analytics.paidInvoices} Paid
              </Badge>
              {analytics.pendingInvoices > 0 && (
                <Badge variant="secondary">
                  {analytics.pendingInvoices} Pending
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Payment Methods</p>
                <p className="text-2xl font-bold">{analytics.paymentMethods}</p>
              </div>
              <CreditCard className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Active payment methods
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Monthly Spending Breakdown
          </CardTitle>
          <CardDescription>
            Your spending pattern over the selected time period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.monthlyBreakdown.slice(-6).map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">{month.month}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">{month.invoices} invoice(s)</span>
                  <span className="font-semibold">${(month.amount / 100).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Spending by Category
          </CardTitle>
          <CardDescription>
            How your spending is distributed across different categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.categoryBreakdown.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ 
                      backgroundColor: index === 0 ? '#3B82F6' : 
                                     index === 1 ? '#EF4444' : '#10B981' 
                    }}
                  ></div>
                  <span className="font-medium">{category.category}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">{category.percentage}%</span>
                  <span className="font-semibold">${(category.amount / 100).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Analytics */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Export Analytics Report</h3>
              <p className="text-sm text-gray-500">
                Download a detailed analytics report for your records
              </p>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
