'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  DollarSign,
  Users,
  Activity,
  Pause,
  Play,
  X,
  MoreHorizontal,
  Mail,
  Phone,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'

interface Subscription {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  planId: string
  planName: string
  status: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'paused' | 'incomplete'
  currentPeriodStart: string
  currentPeriodEnd: string
  trialEnd?: string
  cancelAtPeriodEnd: boolean
  amount: number
  currency: string
  nextBillingDate: string
  createdAt: string
  lastPaymentDate?: string
  lastPaymentAmount?: number
  paymentMethod: string
  billingCycle: 'month' | 'year'
  prorationEnabled: boolean
  dunningEnabled: boolean
  notes?: string
}

interface SubscriptionFilters {
  status: string
  plan: string
  dateRange: string
  search: string
}

export default function AdminSubscriptionManagement() {
  const [selectedTab, setSelectedTab] = useState("all")
  const [loading, setLoading] = useState(true)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [filters, setFilters] = useState<SubscriptionFilters>({
    status: 'all',
    plan: 'all',
    dateRange: 'all',
    search: ''
  })

  // Mock data
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
      currency: 'usd',
      nextBillingDate: '2024-02-15',
      createdAt: '2024-01-15',
      lastPaymentDate: '2024-01-15',
      lastPaymentAmount: 59.99,
      paymentMethod: 'Visa ****4242',
      billingCycle: 'month',
      prorationEnabled: true,
      dunningEnabled: true
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
      currency: 'usd',
      nextBillingDate: '2024-02-20',
      createdAt: '2024-01-20',
      paymentMethod: 'Mastercard ****5555',
      billingCycle: 'month',
      prorationEnabled: true,
      dunningEnabled: true
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
      currency: 'usd',
      nextBillingDate: '2024-02-10',
      createdAt: '2024-01-10',
      lastPaymentDate: '2024-01-10',
      lastPaymentAmount: 99.99,
      paymentMethod: 'Visa ****1234',
      billingCycle: 'month',
      prorationEnabled: true,
      dunningEnabled: true,
      notes: 'Payment failed - card expired'
    },
    {
      id: 'sub_004',
      customerId: 'cus_004',
      customerName: 'Alice Brown',
      customerEmail: 'alice@example.com',
      planId: 'premium',
      planName: 'Premium Plan',
      status: 'cancelled',
      currentPeriodStart: '2024-01-01',
      currentPeriodEnd: '2024-02-01',
      cancelAtPeriodEnd: true,
      amount: 59.99,
      currency: 'usd',
      nextBillingDate: '2024-02-01',
      createdAt: '2024-01-01',
      lastPaymentDate: '2024-01-01',
      lastPaymentAmount: 59.99,
      paymentMethod: 'Visa ****7890',
      billingCycle: 'month',
      prorationEnabled: true,
      dunningEnabled: true,
      notes: 'Customer requested cancellation'
    },
    {
      id: 'sub_005',
      customerId: 'cus_005',
      customerName: 'Charlie Wilson',
      customerEmail: 'charlie@example.com',
      planId: 'basic',
      planName: 'Basic Plan',
      status: 'paused',
      currentPeriodStart: '2024-01-05',
      currentPeriodEnd: '2024-02-05',
      cancelAtPeriodEnd: false,
      amount: 29.99,
      currency: 'usd',
      nextBillingDate: '2024-02-05',
      createdAt: '2024-01-05',
      lastPaymentDate: '2024-01-05',
      lastPaymentAmount: 29.99,
      paymentMethod: 'American Express ****1234',
      billingCycle: 'month',
      prorationEnabled: true,
      dunningEnabled: true,
      notes: 'Temporarily paused by customer request'
    }
  ]

  const statusCounts = {
    all: mockSubscriptions.length,
    active: mockSubscriptions.filter(s => s.status === 'active').length,
    trialing: mockSubscriptions.filter(s => s.status === 'trialing').length,
    past_due: mockSubscriptions.filter(s => s.status === 'past_due').length,
    cancelled: mockSubscriptions.filter(s => s.status === 'cancelled').length,
    paused: mockSubscriptions.filter(s => s.status === 'paused').length
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSubscriptions(mockSubscriptions)
      setLoading(false)
    }

    loadData()
  }, [])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: X },
      past_due: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      trialing: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      paused: { color: 'bg-gray-100 text-gray-800', icon: Pause },
      incomplete: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle }
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

  const handleStatusChange = (subscriptionId: string, newStatus: string) => {
    setSubscriptions(prev => 
      prev.map(sub => 
        sub.id === subscriptionId 
          ? { ...sub, status: newStatus as any }
          : sub
      )
    )
    console.log(`Changed subscription ${subscriptionId} status to ${newStatus}`)
  }

  const handleCancelSubscription = (subscriptionId: string) => {
    setSubscriptions(prev => 
      prev.map(sub => 
        sub.id === subscriptionId 
          ? { ...sub, cancelAtPeriodEnd: true, status: 'cancelled' as any }
          : sub
      )
    )
    console.log(`Cancelled subscription ${subscriptionId}`)
  }

  const handlePauseSubscription = (subscriptionId: string) => {
    setSubscriptions(prev => 
      prev.map(sub => 
        sub.id === subscriptionId 
          ? { ...sub, status: 'paused' as any }
          : sub
      )
    )
    console.log(`Paused subscription ${subscriptionId}`)
  }

  const handleResumeSubscription = (subscriptionId: string) => {
    setSubscriptions(prev => 
      prev.map(sub => 
        sub.id === subscriptionId 
          ? { ...sub, status: 'active' as any }
          : sub
      )
    )
    console.log(`Resumed subscription ${subscriptionId}`)
  }

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesStatus = filters.status === 'all' || subscription.status === filters.status
    const matchesPlan = filters.plan === 'all' || subscription.planId === filters.plan
    const matchesSearch = filters.search === '' || 
      subscription.customerName.toLowerCase().includes(filters.search.toLowerCase()) ||
      subscription.customerEmail.toLowerCase().includes(filters.search.toLowerCase()) ||
      subscription.id.toLowerCase().includes(filters.search.toLowerCase())
    
    return matchesStatus && matchesPlan && matchesSearch
  })

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
            <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
            <p className="text-gray-600">Manage customer subscriptions, billing cycles, and payment issues</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setLoading(true)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Subscription
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
          <TabsTrigger value="active">Active ({statusCounts.active})</TabsTrigger>
          <TabsTrigger value="trialing">Trialing ({statusCounts.trialing})</TabsTrigger>
          <TabsTrigger value="past_due">Past Due ({statusCounts.past_due})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({statusCounts.cancelled})</TabsTrigger>
          <TabsTrigger value="paused">Paused ({statusCounts.paused})</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters & Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search subscriptions..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="trialing">Trialing</option>
                  <option value="past_due">Past Due</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="paused">Paused</option>
                </select>
                <select
                  value={filters.plan}
                  onChange={(e) => setFilters(prev => ({ ...prev, plan: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Plans</option>
                  <option value="basic">Basic Plan</option>
                  <option value="premium">Premium Plan</option>
                  <option value="enterprise">Enterprise Plan</option>
                </select>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Subscriptions Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Subscriptions</CardTitle>
                  <CardDescription>
                    {filteredSubscriptions.length} subscription{filteredSubscriptions.length !== 1 ? 's' : ''} found
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Advanced Filters
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 font-medium text-sm">
                  <div className="col-span-3">Customer</div>
                  <div className="col-span-2">Plan</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1">Amount</div>
                  <div className="col-span-2">Next Billing</div>
                  <div className="col-span-1">Payment Method</div>
                  <div className="col-span-2">Actions</div>
                </div>
                {filteredSubscriptions.map((subscription) => (
                  <div key={subscription.id} className="grid grid-cols-12 gap-4 p-4 border-t hover:bg-gray-50">
                    <div className="col-span-3 flex items-center space-x-3">
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
                        <p className="text-xs text-gray-400">ID: {subscription.id}</p>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Badge variant="outline">{subscription.planName}</Badge>
                      <p className="text-xs text-gray-500 mt-1">{subscription.billingCycle}</p>
                    </div>
                    <div className="col-span-1">
                      {getStatusBadge(subscription.status)}
                    </div>
                    <div className="col-span-1">
                      <p className="font-medium">${subscription.amount}</p>
                      <p className="text-xs text-gray-500">{subscription.currency.toUpperCase()}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm">{new Date(subscription.nextBillingDate).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500">
                        {subscription.cancelAtPeriodEnd ? 'Cancels at period end' : 'Auto-renewal'}
                      </p>
                    </div>
                    <div className="col-span-1">
                      <p className="text-sm">{subscription.paymentMethod}</p>
                      {subscription.lastPaymentDate && (
                        <p className="text-xs text-gray-500">
                          Last: {new Date(subscription.lastPaymentDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {subscription.status === 'active' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handlePauseSubscription(subscription.id)}
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        )}
                        {subscription.status === 'paused' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleResumeSubscription(subscription.id)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        {subscription.status === 'active' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleCancelSubscription(subscription.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Bulk Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email to Selected
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Selected
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh All
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Alerts & Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Past Due Subscriptions</span>
                  <Badge variant="destructive">{statusCounts.past_due}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Expiring Trials</span>
                  <Badge variant="secondary">{statusCounts.trialing}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cancelled This Month</span>
                  <Badge variant="outline">{statusCounts.cancelled}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Revenue Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Monthly Recurring Revenue</span>
                  <span className="font-semibold">$125,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Subscriptions</span>
                  <span className="font-semibold">{statusCounts.active}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Average Revenue Per User</span>
                  <span className="font-semibold">$89.99</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}




