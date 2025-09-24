'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Users
} from 'lucide-react'
import { SubscriptionManager } from '@/components/subscription-manager'
import { PaymentMethods } from '@/components/payment-methods'
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
}

interface PaymentHistory {
  id: string
  date: string
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'failed'
  description: string
  invoiceUrl?: string
}

interface Subscription {
  id: string
  planId: string
  status: 'active' | 'cancelled' | 'past_due' | 'trialing'
  currentPeriodStart: string
  currentPeriodEnd: string
  trialEnd?: string
  cancelAtPeriodEnd: boolean
}

export default function BillingDashboard() {
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([])
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Mock data - in real app, this would come from API
  const plans: SubscriptionPlan[] = [
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
      icon: <Star className="h-5 w-5" />
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
      icon: <Crown className="h-5 w-5" />
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
      icon: <Zap className="h-5 w-5" />
    }
  ]

  const mockPaymentHistory: PaymentHistory[] = [
    {
      id: 'inv_001',
      date: '2024-01-15',
      amount: 59.99,
      currency: 'usd',
      status: 'paid',
      description: 'Premium Plan - Monthly',
      invoiceUrl: '#'
    },
    {
      id: 'inv_002',
      date: '2023-12-15',
      amount: 59.99,
      currency: 'usd',
      status: 'paid',
      description: 'Premium Plan - Monthly',
      invoiceUrl: '#'
    },
    {
      id: 'inv_003',
      date: '2023-11-15',
      amount: 29.99,
      currency: 'usd',
      status: 'paid',
      description: 'Basic Plan - Monthly',
      invoiceUrl: '#'
    }
  ]

  const mockSubscription: Subscription = {
    id: 'sub_123',
    planId: 'premium',
    status: 'active',
    currentPeriodStart: '2024-01-15',
    currentPeriodEnd: '2024-02-15',
    cancelAtPeriodEnd: false
  }

  const mockPaymentMethods = [
    {
      id: 'pm_1',
      type: 'card' as const,
      card: {
        brand: 'visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2025
      },
      isDefault: true,
      isExpired: false
    },
    {
      id: 'pm_2',
      type: 'card' as const,
      card: {
        brand: 'mastercard',
        last4: '5555',
        expMonth: 8,
        expYear: 2024
      },
      isDefault: false,
      isExpired: true
    }
  ]

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setCurrentPlan(plans.find(p => p.id === mockSubscription.planId) || plans[1])
      setSubscription(mockSubscription)
      setPaymentHistory(mockPaymentHistory)
      setPaymentMethods(mockPaymentMethods)
      setLoading(false)
    }

    loadData()
  }, [])

  const handlePlanChange = (planId: string) => {
    const plan = plans.find(p => p.id === planId)
    if (plan) {
      setCurrentPlan(plan)
      // In real app, this would call API to change subscription
      console.log('Changing plan to:', plan.name)
    }
  }

  const handleCancelSubscription = () => {
    if (subscription) {
      setSubscription({
        ...subscription,
        cancelAtPeriodEnd: true
      })
      // In real app, this would call API to cancel subscription
      console.log('Cancelling subscription')
    }
  }

  const handleReactivateSubscription = () => {
    if (subscription) {
      setSubscription({
        ...subscription,
        cancelAtPeriodEnd: false
      })
      // In real app, this would call API to reactivate subscription
      console.log('Reactivating subscription')
    }
  }

  const handleAddPaymentMethod = (method: any) => {
    const newMethod = {
      ...method,
      id: `pm_${Date.now()}`
    }
    setPaymentMethods(prev => [...prev, newMethod])
    console.log('Adding payment method:', newMethod)
  }

  const handleEditPaymentMethod = (id: string, updates: any) => {
    setPaymentMethods(prev => 
      prev.map(method => 
        method.id === id ? { ...method, ...updates } : method
      )
    )
    console.log('Editing payment method:', id, updates)
  }

  const handleDeletePaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== id))
    console.log('Deleting payment method:', id)
  }

  const handleSetDefaultPaymentMethod = (id: string) => {
    setPaymentMethods(prev => 
      prev.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    )
    console.log('Setting default payment method:', id)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
      past_due: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      trialing: { color: 'bg-blue-100 text-blue-800', icon: Calendar }
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
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      failed: { color: 'bg-red-100 text-red-800', icon: AlertCircle }
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
        <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
        <p className="text-gray-600">Manage your subscription, payment methods, and billing history</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
                      <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="plans">Plans</TabsTrigger>
                <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
                <TabsTrigger value="history">Payment History</TabsTrigger>
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <SubscriptionManager
            currentPlanId={currentPlan?.id || 'premium'}
            onPlanChange={handlePlanChange}
            onCancel={handleCancelSubscription}
            onReactivate={handleReactivateSubscription}
            subscription={subscription}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Latest Invoice
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Billing Settings
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paymentHistory.slice(0, 3).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">{payment.description}</p>
                        <p className="text-gray-600">{new Date(payment.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${payment.amount}</p>
                        {getPaymentStatusBadge(payment.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
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
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full"
                    variant={plan.id === currentPlan?.id ? "outline" : "default"}
                    onClick={() => handlePlanChange(plan.id)}
                    disabled={plan.id === currentPlan?.id}
                  >
                    {plan.id === currentPlan?.id ? 'Current Plan' : 'Select Plan'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Payment History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentHistory.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{payment.description}</p>
                        <p className="text-sm text-gray-600">{new Date(payment.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">${payment.amount}</p>
                        {getPaymentStatusBadge(payment.status)}
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Subscription Management</h3>
              <p className="text-sm text-gray-600">Manage customer subscriptions and billing cycles</p>
            </div>
            <Link href="/dashboard/billing/subscriptions">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Manage Subscriptions
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Subscriptions</p>
                    <p className="text-2xl font-bold">1,389</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active</p>
                    <p className="text-2xl font-bold text-green-600">1,250</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Trialing</p>
                    <p className="text-2xl font-bold text-blue-600">89</p>
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
                    <p className="text-2xl font-bold text-yellow-600">50</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: 'sub_001', customer: 'John Doe', plan: 'Premium', status: 'active', amount: 59.99 },
                  { id: 'sub_002', customer: 'Jane Smith', plan: 'Basic', status: 'trialing', amount: 29.99 },
                  { id: 'sub_003', customer: 'Bob Johnson', plan: 'Enterprise', status: 'past_due', amount: 99.99 }
                ].map((subscription) => (
                  <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{subscription.id}</p>
                      <p className="text-sm text-gray-600">{subscription.customer} • {subscription.plan}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium">${subscription.amount}</span>
                      <Badge className={
                        subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                        subscription.status === 'trialing' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {subscription.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link href="/dashboard/billing/subscriptions">
                  <Button variant="outline" className="w-full">
                    View All Subscriptions
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Invoice Management</h3>
              <p className="text-sm text-gray-600">View, download, and manage your invoices</p>
            </div>
            <Link href="/dashboard/invoices">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Manage Invoices
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Paid</p>
                    <p className="text-2xl font-bold text-green-600">8</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">4</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: '1', number: 'INV-2024-001', date: '2024-01-15', amount: 59.99, status: 'paid' },
                  { id: '2', number: 'INV-2024-002', date: '2024-01-20', amount: 29.99, status: 'sent' },
                  { id: '3', number: 'INV-2024-003', date: '2024-01-25', amount: 99.99, status: 'overdue' }
                ].map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{invoice.number}</p>
                      <p className="text-sm text-gray-600">{new Date(invoice.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium">${invoice.amount}</span>
                      <Badge className={
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link href="/dashboard/invoices">
                  <Button variant="outline" className="w-full">
                    View All Invoices
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Billing Analytics</h3>
              <p className="text-sm text-gray-600">Comprehensive insights into your billing performance</p>
            </div>
            <Link href="/dashboard/billing/analytics">
              <Button>
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Recurring Revenue</p>
                    <p className="text-2xl font-bold">$125,000</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600 ml-1">+3.2%</span>
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
                    <p className="text-sm font-medium text-gray-600">Payment Success Rate</p>
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
                    <p className="text-sm font-medium text-gray-600">Average Revenue Per User</p>
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
              <CardTitle>Quick Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Revenue Trends</h4>
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
              <div className="mt-6">
                <Link href="/dashboard/billing/analytics">
                  <Button variant="outline" className="w-full">
                    View Detailed Analytics
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <PaymentMethods
              paymentMethods={paymentMethods}
              onAdd={handleAddPaymentMethod}
              onEdit={handleEditPaymentMethod}
              onDelete={handleDeletePaymentMethod}
              onSetDefault={handleSetDefaultPaymentMethod}
            />

            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-gray-600">user@example.com</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Billing Address</label>
                  <p className="text-sm text-gray-600">
                    123 Main St<br />
                    City, State 12345
                  </p>
                </div>
                <Button variant="outline" className="w-full">
                  Update Billing Information
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}