'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  Download
} from 'lucide-react'

interface Plan {
  id: string
  name: string
  amount: number
  interval: string
  intervalCount: number
  features: string[]
}

interface Subscription {
  id: string
  planId: string
  status: string
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  trialStart?: string
  trialEnd?: string
}

interface BillingOverviewProps {
  subscription: Subscription | null
  currentPlan: Plan | null
  onRefresh: () => void
}

export function BillingOverview({ subscription, currentPlan, onRefresh }: BillingOverviewProps) {
  const [billingStats, setBillingStats] = useState({
    totalSpent: 0,
    nextPayment: 0,
    paymentMethod: 'card',
    lastPayment: null as any,
    upcomingPayments: [] as any[]
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBillingStats()
  }, [])

  const fetchBillingStats = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/billing/user/overview', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      })
      if (response.ok) {
        const data = await response.json()
        setBillingStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch billing stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'trialing':
        return <Clock className="h-5 w-5 text-blue-500" />
      case 'canceled':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'active':
        return 'Your subscription is active and will renew automatically'
      case 'trialing':
        return 'You are currently in your trial period'
      case 'canceled':
        return 'Your subscription has been canceled'
      default:
        return 'Subscription status unknown'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return <div className="text-center py-8">Loading billing overview...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Billing Overview</h2>
        <p className="text-gray-600 mt-2">Your subscription and payment summary</p>
      </div>

      {/* Subscription Status */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(subscription.status)}
              Subscription Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {getStatusMessage(subscription.status)}
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Current Plan</p>
                  <p className="text-lg font-semibold">{currentPlan?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Billing Cycle</p>
                  <p className="text-lg font-semibold">
                    {currentPlan ? `${currentPlan.intervalCount} ${currentPlan.interval}(s)` : 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Next Billing Date</p>
                  <p className="text-lg font-semibold">
                    {formatDate(subscription.currentPeriodEnd)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount</p>
                  <p className="text-lg font-semibold">
                    {currentPlan ? formatCurrency(currentPlan.amount) : 'Unknown'}
                  </p>
                </div>
              </div>

              {subscription.trialStart && subscription.trialEnd && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Trial Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-blue-700">Trial Started</p>
                      <p className="font-medium">{formatDate(subscription.trialStart)}</p>
                    </div>
                    <div>
                      <p className="text-blue-700">Trial Ends</p>
                      <p className="font-medium">{formatDate(subscription.trialEnd)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(billingStats.totalSpent)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(billingStats.nextPayment)}</div>
            <p className="text-xs text-muted-foreground">
              {subscription ? formatDate(subscription.currentPeriodEnd) : 'No active subscription'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Method</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{billingStats.paymentMethod}</div>
            <p className="text-xs text-muted-foreground">Primary method</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Payment</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {billingStats.lastPayment ? formatCurrency(billingStats.lastPayment.amount) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {billingStats.lastPayment ? formatDate(billingStats.lastPayment.date) : 'No payments yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common billing tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <CreditCard className="h-6 w-6" />
              <span>Manage Cards</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Download className="h-6 w-6" />
              <span>Download Invoice</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              <span>View History</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Payments */}
      {billingStats.upcomingPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Payments</CardTitle>
            <CardDescription>Your scheduled future payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {billingStats.upcomingPayments.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{payment.description}</p>
                    <p className="text-sm text-gray-500">{formatDate(payment.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                    <Badge variant="outline">{payment.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
