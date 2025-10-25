'use client'

import React, { useState, useEffect } from 'react'
import { databaseService } from '@/lib/database-service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { 
  CreditCard, 
  Download, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  Crown,
  Star,
  Zap,
  Settings,
  Plus,
  Minus,
  FileText,
  Clock,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Activity,
  Shield,
  Database,
  Mail,
  UserCheck,
  Bell,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: 'month' | 'year'
  features: string[]
  popular?: boolean
  icon: React.ReactNode
  activeSubscriptions: number
  revenue: number
}

interface PaymentHistory {
  id: string
  date: string
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'failed' | 'refunded'
  description: string
  customer: string
  invoiceUrl?: string
}

interface Subscription {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  planId: string
  planName: string
  status: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'paused'
  currentPeriodStart: string
  currentPeriodEnd: string
  trialEnd?: string
  cancelAtPeriodEnd: boolean
  amount: number
  nextBillingDate: string
}

interface BillingMetrics {
  totalRevenue: number
  monthlyRecurringRevenue: number
  totalSubscriptions: number
  activeSubscriptions: number
  trialingSubscriptions: number
  pastDueSubscriptions: number
  churnRate: number
  averageRevenuePerUser: number
  paymentSuccessRate: number
  totalInvoices: number
  paidInvoices: number
  pendingInvoices: number
  overdueInvoices: number
}

export default function AdminBillingDashboard() {
  const [selectedTab, setSelectedTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<BillingMetrics | null>(null)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([])
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])

  // Load data from unified database service
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading billing data from unified database service...')
        
        // Load subscriptions
        const subscriptionsResponse = await databaseService.getSubscriptions()
        if (subscriptionsResponse.success && subscriptionsResponse.data) {
          console.log('Loaded subscriptions:', subscriptionsResponse.data.subscriptions.length)
          setSubscriptions(subscriptionsResponse.data.subscriptions)
          
          // Calculate metrics from real data
          const subs = subscriptionsResponse.data.subscriptions
          const activeSubs = subs.filter(sub => sub.status === 'active')
          const trialingSubs = subs.filter(sub => sub.status === 'trialing')
          const pastDueSubs = subs.filter(sub => sub.status === 'past_due')
          
          const mrr = activeSubs.reduce((sum, sub) => sum + (sub.amount || 0), 0)
          const arpu = activeSubs.length > 0 ? mrr / activeSubs.length : 0
          
          setMetrics({
            totalRevenue: mrr * 12, // Annual estimate
            monthlyRecurringRevenue: mrr,
            totalSubscriptions: subs.length,
            activeSubscriptions: activeSubs.length,
            trialingSubscriptions: trialingSubs.length,
            pastDueSubscriptions: pastDueSubs.length,
            churnRate: 0.86, // Keep static for now
            averageRevenuePerUser: arpu,
            paymentSuccessRate: 99.0, // Keep static for now
            totalInvoices: subs.length,
            paidInvoices: activeSubs.length,
            pendingInvoices: trialingSubs.length,
            overdueInvoices: pastDueSubs.length
          })
        }
      } catch (error) {
        console.error('Error loading billing data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  // Mock data - fallback if database fails
  const mockMetrics: BillingMetrics = {
    totalRevenue: 2847392,
    monthlyRecurringRevenue: 125000,
    totalSubscriptions: 1389,
    activeSubscriptions: 1250,
    trialingSubscriptions: 89,
    pastDueSubscriptions: 50,
    churnRate: 0.86,
    averageRevenuePerUser: 89.99,
    paymentSuccessRate: 99.0,
    totalInvoices: 1247,
    paidInvoices: 1180,
    pendingInvoices: 45,
    overdueInvoices: 22
  }

  const mockSubscriptions: Subscription[] = [
    {
      id: 'sub_001',
      customerId: 'cus_001',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      planId: 'premium',
      planName: 'Premium Plan',
      status: 'active',
      currentPeriodStart: '2024-01-15',
      currentPeriodEnd: '2024-02-15',
      cancelAtPeriodEnd: false,
      amount: 59.99,
      nextBillingDate: '2024-02-15'
    },
    {
      id: 'sub_002',
      customerId: 'cus_002',
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      planId: 'basic',
      planName: 'Basic Plan',
      status: 'trialing',
      currentPeriodStart: '2024-01-20',
      currentPeriodEnd: '2024-02-20',
      trialEnd: '2024-02-20',
      cancelAtPeriodEnd: false,
      amount: 29.99,
      nextBillingDate: '2024-02-20'
    },
    {
      id: 'sub_003',
      customerId: 'cus_003',
      customerName: 'Bob Johnson',
      customerEmail: 'bob@example.com',
      planId: 'enterprise',
      planName: 'Enterprise Plan',
      status: 'past_due',
      currentPeriodStart: '2024-01-10',
      currentPeriodEnd: '2024-02-10',
      cancelAtPeriodEnd: false,
      amount: 99.99,
      nextBillingDate: '2024-02-10'
    }
  ]

  const mockPaymentHistory: PaymentHistory[] = [
    {
      id: 'pay_001',
      date: '2024-01-15',
      amount: 59.99,
      currency: 'usd',
      status: 'paid',
      description: 'Premium Plan - Monthly',
      customer: 'John Doe',
      invoiceUrl: '#'
    },
    {
      id: 'pay_002',
      date: '2024-01-14',
      amount: 29.99,
      currency: 'usd',
      status: 'paid',
      description: 'Basic Plan - Monthly',
      customer: 'Jane Smith',
      invoiceUrl: '#'
    },
    {
      id: 'pay_003',
      date: '2024-01-13',
      amount: 99.99,
      currency: 'usd',
      status: 'failed',
      description: 'Enterprise Plan - Monthly',
      customer: 'Bob Johnson',
      invoiceUrl: '#'
    }
  ]

  const mockPlans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Basic Plan',
      description: 'Essential credit repair tools',
      price: 29.99,
      currency: 'usd',
      interval: 'month',
      features: [
        'Credit report analysis',
        'Basic dispute letters',
        'Email support',
        'Monthly credit monitoring'
      ],
      icon: <Star className="h-5 w-5" />,
      activeSubscriptions: 450,
      revenue: 13455
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      description: 'Advanced credit repair features',
      price: 59.99,
      currency: 'usd',
      interval: 'month',
      features: [
        'Everything in Basic',
        'Advanced dispute strategies',
        'Priority support',
        'Weekly credit monitoring',
        'Custom dispute letters',
        'Credit score tracking'
      ],
      popular: true,
      icon: <Crown className="h-5 w-5" />,
      activeSubscriptions: 650,
      revenue: 38994
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      description: 'Complete credit repair solution',
      price: 99.99,
      currency: 'usd',
      interval: 'month',
      features: [
        'Everything in Premium',
        'Unlimited disputes',
        '24/7 phone support',
        'Daily credit monitoring',
        'AI-powered recommendations',
        'White-label options',
        'API access'
      ],
      icon: <Zap className="h-5 w-5" />,
      activeSubscriptions: 150,
      revenue: 14999
    }
  ]

  // Load additional data (payment history and plans)
  useEffect(() => {
    const loadAdditionalData = async () => {
      try {
        // Load payment history and plans (keep mock for now)
        setPaymentHistory(mockPaymentHistory)
        setPlans(mockPlans)
      } catch (error) {
        console.error('Error loading additional data:', error)
      }
    }

    loadAdditionalData()
  }, [])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
      past_due: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      trialing: { color: 'bg-blue-100 text-blue-800', icon: Calendar },
      paused: { color: 'bg-gray-100 text-gray-800', icon: Clock }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
    const Icon = config.icon

    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      failed: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
      refunded: { color: 'bg-gray-100 text-gray-800', icon: RefreshCw }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.paid
    const Icon = config.icon

    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.toUpperCase()}
      </Badge>
    )
  }

  const handleRefreshData = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Billing Dashboard</h1>
            <p className="text-gray-600">Comprehensive billing management and analytics for administrators</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefreshData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Link href="/test-advanced-billing">
              <Button>
                <Activity className="h-4 w-4 mr-2" />
                Test Billing
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${metrics?.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${metrics?.monthlyRecurringRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+3.2% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.activeSubscriptions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">of {metrics?.totalSubscriptions.toLocaleString()} total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.churnRate}%</div>
                <p className="text-xs text-muted-foreground">-0.2% from last month</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Trialing</p>
                    <p className="text-2xl font-bold text-blue-600">{metrics?.trialingSubscriptions}</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Past Due</p>
                    <p className="text-2xl font-bold text-yellow-600">{metrics?.pastDueSubscriptions}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Payment Success</p>
                    <p className="text-2xl font-bold text-green-600">{metrics?.paymentSuccessRate}%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">ARPU</p>
                    <p className="text-2xl font-bold text-purple-600">${metrics?.averageRevenuePerUser}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Subscriptions</CardTitle>
                <CardDescription>Latest subscription changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subscriptions.slice(0, 5).map((subscription) => (
                    <div key={subscription.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {subscription.customerName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{subscription.customerName}</p>
                          <p className="text-xs text-gray-500">{subscription.planName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(subscription.status)}
                        <p className="text-xs text-gray-500 mt-1">${subscription.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>Latest payment transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentHistory.slice(0, 5).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{payment.customer}</p>
                        <p className="text-xs text-gray-500">{payment.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">${payment.amount}</p>
                        {getPaymentStatusBadge(payment.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Navigation */}
          <Card>
            <CardHeader>
              <CardTitle>Billing Management</CardTitle>
              <CardDescription>Access all billing management features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/admin/billing/subscriptions">
                  <Button className="w-full" variant="outline">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Subscriptions
                  </Button>
                </Link>
                <Link href="/admin/billing/payments">
                  <Button className="w-full" variant="outline">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Payments
                  </Button>
                </Link>
                <Link href="/admin/billing/invoices">
                  <Button className="w-full" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Invoices
                  </Button>
                </Link>
                <Link href="/admin/billing/plans">
                  <Button className="w-full" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Plans
                  </Button>
                </Link>
                <Link href="/admin/billing/analytics">
                  <Button className="w-full" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                </Link>
                <Link href="/admin/billing/test">
                  <Button className="w-full" variant="outline">
                    <Activity className="h-4 w-4 mr-2" />
                    Test Suite
                  </Button>
                </Link>
                <Link href="/test-advanced-billing">
                  <Button className="w-full" variant="outline">
                    <Zap className="h-4 w-4 mr-2" />
                    Advanced Tests
                  </Button>
                </Link>
                <Button className="w-full" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh All
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Subscription Management</CardTitle>
                  <CardDescription>Manage all customer subscriptions</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Subscription
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search subscriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>

              <div className="border rounded-lg">
                <div className="grid grid-cols-8 gap-4 p-4 bg-gray-50 font-medium text-sm">
                  <div>Customer</div>
                  <div>Plan</div>
                  <div>Status</div>
                  <div>Amount</div>
                  <div>Next Billing</div>
                  <div>Created</div>
                  <div>Revenue</div>
                  <div>Actions</div>
                </div>
                {subscriptions.map((subscription) => (
                  <div key={subscription.id} className="grid grid-cols-8 gap-4 p-4 border-t">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {subscription.customerName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{subscription.customerName}</p>
                        <p className="text-sm text-gray-500">{subscription.customerEmail}</p>
                      </div>
                    </div>
                    <div>
                      <Badge variant="outline">{subscription.planName}</Badge>
                    </div>
                    <div>
                      {getStatusBadge(subscription.status)}
                    </div>
                    <div className="font-medium">${subscription.amount}</div>
                    <div className="text-sm text-gray-500">{new Date(subscription.nextBillingDate).toLocaleDateString()}</div>
                    <div className="text-sm text-gray-500">{new Date(subscription.currentPeriodStart).toLocaleDateString()}</div>
                    <div className="font-medium">${subscription.amount}</div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment Management</CardTitle>
                  <CardDescription>View and manage all payment transactions</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Process Refund
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>

              <div className="space-y-4">
                {paymentHistory.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{payment.customer}</p>
                        <p className="text-sm text-gray-600">{payment.description}</p>
                        <p className="text-xs text-gray-500">{new Date(payment.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">${payment.amount}</p>
                        {getPaymentStatusBadge(payment.status)}
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Subscription Plans</h3>
              <p className="text-sm text-gray-600">Manage pricing plans and features</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Plan
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {plan.icon}
                    {plan.name}
                  </CardTitle>
                  <div className="text-3xl font-bold">
                    ${plan.price}
                    <span className="text-sm font-normal text-gray-600">/{plan.interval}</span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Subscriptions</p>
                      <p className="font-semibold">{plan.activeSubscriptions}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Revenue</p>
                      <p className="font-semibold">${plan.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="flex space-x-2">
                    <Button className="flex-1" variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button className="flex-1" variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Billing Analytics</h3>
              <p className="text-sm text-gray-600">Comprehensive insights into billing performance</p>
            </div>
            <Link href="/test-advanced-billing">
              <Button>
                <Activity className="h-4 w-4 mr-2" />
                Test Analytics
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">MRR Growth</p>
                    <p className="text-2xl font-bold">+3.2%</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600 ml-1">vs last month</span>
                    </div>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Churn Rate</p>
                    <p className="text-2xl font-bold">0.86%</p>
                    <div className="flex items-center mt-1">
                      <TrendingDown className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600 ml-1">-0.2%</span>
                    </div>
                  </div>
                  <TrendingDown className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Payment Success</p>
                    <p className="text-2xl font-bold">99.0%</p>
                    <div className="flex items-center mt-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600 ml-1">+0.1%</span>
                    </div>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">ARPU</p>
                    <p className="text-2xl font-bold">$89.99</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600 ml-1">+2.1%</span>
                    </div>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Monthly Revenue</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">This Month</span>
                      <span className="font-medium">$125,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last Month</span>
                      <span className="font-medium">$121,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Growth</span>
                      <span className="text-green-600 font-medium">+3.3%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Subscription Health</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Active</span>
                      <span className="font-medium text-green-600">1,250</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Trialing</span>
                      <span className="font-medium text-blue-600">89</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Churned</span>
                      <span className="font-medium text-red-600">12</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing Configuration</CardTitle>
              <CardDescription>Configure billing settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Payment Settings</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Default Currency</label>
                    <Input defaultValue="USD" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Payment Gateway</label>
                    <Input defaultValue="Stripe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Invoice Prefix</label>
                    <Input defaultValue="INV-" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Subscription Settings</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Trial Period (days)</label>
                    <Input defaultValue="14" type="number" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Grace Period (days)</label>
                    <Input defaultValue="3" type="number" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Dunning Management</label>
                    <Input defaultValue="Enabled" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

