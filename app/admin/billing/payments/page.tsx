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
  X,
  RefreshCcw,
  ExternalLink,
  Mail,
  Phone,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Target,
  Zap
} from 'lucide-react'
import Link from 'next/link'

interface Payment {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  subscriptionId?: string
  amount: number
  currency: string
  status: 'succeeded' | 'pending' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded'
  description: string
  paymentMethod: string
  paymentMethodType: 'card' | 'bank_account' | 'paypal' | 'apple_pay' | 'google_pay'
  createdAt: string
  processedAt?: string
  failureReason?: string
  refundAmount?: number
  refundReason?: string
  invoiceId?: string
  transactionId: string
  gateway: string
  fees: number
  netAmount: number
  metadata?: Record<string, any>
}

interface PaymentFilters {
  status: string
  paymentMethod: string
  dateRange: string
  search: string
  amountRange: string
}

interface PaymentMetrics {
  totalPayments: number
  successfulPayments: number
  failedPayments: number
  pendingPayments: number
  refundedPayments: number
  totalRevenue: number
  totalFees: number
  netRevenue: number
  averagePaymentAmount: number
  successRate: number
  refundRate: number
}

export default function AdminPaymentManagement() {
  const [selectedTab, setSelectedTab] = useState("all")
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<Payment[]>([])
  const [metrics, setMetrics] = useState<PaymentMetrics | null>(null)
  const [filters, setFilters] = useState<PaymentFilters>({
    status: 'all',
    paymentMethod: 'all',
    dateRange: 'all',
    search: '',
    amountRange: 'all'
  })

  // Mock data
  const mockPayments: Payment[] = [
    {
      id: 'pay_001',
      customerId: 'cus_001',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      subscriptionId: 'sub_001',
      amount: 59.99,
      currency: 'usd',
      status: 'succeeded',
      description: 'Premium Plan - Monthly',
      paymentMethod: 'Visa ****4242',
      paymentMethodType: 'card',
      createdAt: '2024-01-15T10:30:00Z',
      processedAt: '2024-01-15T10:30:15Z',
      invoiceId: 'inv_001',
      transactionId: 'txn_001',
      gateway: 'stripe',
      fees: 1.80,
      netAmount: 58.19
    },
    {
      id: 'pay_002',
      customerId: 'cus_002',
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      subscriptionId: 'sub_002',
      amount: 29.99,
      currency: 'usd',
      status: 'succeeded',
      description: 'Basic Plan - Monthly',
      paymentMethod: 'Mastercard ****5555',
      paymentMethodType: 'card',
      createdAt: '2024-01-14T14:20:00Z',
      processedAt: '2024-01-14T14:20:10Z',
      invoiceId: 'inv_002',
      transactionId: 'txn_002',
      gateway: 'stripe',
      fees: 0.90,
      netAmount: 29.09
    },
    {
      id: 'pay_003',
      customerId: 'cus_003',
      customerName: 'Bob Johnson',
      customerEmail: 'bob@example.com',
      subscriptionId: 'sub_003',
      amount: 99.99,
      currency: 'usd',
      status: 'failed',
      description: 'Enterprise Plan - Monthly',
      paymentMethod: 'Visa ****1234',
      paymentMethodType: 'card',
      createdAt: '2024-01-13T09:15:00Z',
      failureReason: 'Card declined - insufficient funds',
      transactionId: 'txn_003',
      gateway: 'stripe',
      fees: 0,
      netAmount: 0
    },
    {
      id: 'pay_004',
      customerId: 'cus_004',
      customerName: 'Alice Brown',
      customerEmail: 'alice@example.com',
      subscriptionId: 'sub_004',
      amount: 59.99,
      currency: 'usd',
      status: 'refunded',
      description: 'Premium Plan - Monthly',
      paymentMethod: 'Visa ****7890',
      paymentMethodType: 'card',
      createdAt: '2024-01-12T16:45:00Z',
      processedAt: '2024-01-12T16:45:20Z',
      refundAmount: 59.99,
      refundReason: 'Customer requested refund',
      invoiceId: 'inv_004',
      transactionId: 'txn_004',
      gateway: 'stripe',
      fees: 1.80,
      netAmount: -58.19
    },
    {
      id: 'pay_005',
      customerId: 'cus_005',
      customerName: 'Charlie Wilson',
      customerEmail: 'charlie@example.com',
      subscriptionId: 'sub_005',
      amount: 29.99,
      currency: 'usd',
      status: 'pending',
      description: 'Basic Plan - Monthly',
      paymentMethod: 'Bank Account ****1234',
      paymentMethodType: 'bank_account',
      createdAt: '2024-01-11T11:30:00Z',
      transactionId: 'txn_005',
      gateway: 'stripe',
      fees: 0.30,
      netAmount: 29.69
    }
  ]

  const mockMetrics: PaymentMetrics = {
    totalPayments: 1247,
    successfulPayments: 1180,
    failedPayments: 45,
    pendingPayments: 15,
    refundedPayments: 7,
    totalRevenue: 125000,
    totalFees: 3750,
    netRevenue: 121250,
    averagePaymentAmount: 89.99,
    successRate: 94.6,
    refundRate: 0.6
  }

  const statusCounts = {
    all: mockPayments.length,
    succeeded: mockPayments.filter(p => p.status === 'succeeded').length,
    pending: mockPayments.filter(p => p.status === 'pending').length,
    failed: mockPayments.filter(p => p.status === 'failed').length,
    refunded: mockPayments.filter(p => p.status === 'refunded').length,
    cancelled: mockPayments.filter(p => p.status === 'cancelled').length
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setPayments(mockPayments)
      setMetrics(mockMetrics)
      setLoading(false)
    }

    loadData()
  }, [])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      succeeded: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      failed: { color: 'bg-red-100 text-red-800', icon: X },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: X },
      refunded: { color: 'bg-blue-100 text-blue-800', icon: RefreshCcw },
      partially_refunded: { color: 'bg-orange-100 text-orange-800', icon: RefreshCcw }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.succeeded
    const Icon = config.icon

    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'card': return <CreditCard className="h-4 w-4" />
      case 'bank_account': return <Target className="h-4 w-4" />
      case 'paypal': return <Zap className="h-4 w-4" />
      case 'apple_pay': return <Zap className="h-4 w-4" />
      case 'google_pay': return <Zap className="h-4 w-4" />
      default: return <CreditCard className="h-4 w-4" />
    }
  }

  const handleRefund = (paymentId: string, amount?: number) => {
    console.log(`Processing refund for payment ${paymentId}`, amount ? `Amount: $${amount}` : 'Full refund')
    // In real app, this would call the refund API
  }

  const handleRetryPayment = (paymentId: string) => {
    console.log(`Retrying payment ${paymentId}`)
    // In real app, this would call the retry payment API
  }

  const filteredPayments = payments.filter(payment => {
    const matchesStatus = filters.status === 'all' || payment.status === filters.status
    const matchesPaymentMethod = filters.paymentMethod === 'all' || payment.paymentMethodType === filters.paymentMethod
    const matchesSearch = filters.search === '' || 
      payment.customerName.toLowerCase().includes(filters.search.toLowerCase()) ||
      payment.customerEmail.toLowerCase().includes(filters.search.toLowerCase()) ||
      payment.id.toLowerCase().includes(filters.search.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(filters.search.toLowerCase())
    
    return matchesStatus && matchesPaymentMethod && matchesSearch
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
            <h1 className="text-3xl font-bold mb-2">Payment Management</h1>
            <p className="text-gray-600">Monitor, manage, and process all payment transactions</p>
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
              Process Payment
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics?.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+3.2% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.successRate}%</div>
            <p className="text-xs text-muted-foreground">+0.5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalPayments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12.5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Payment</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics?.averagePaymentAmount}</div>
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
          <TabsTrigger value="succeeded">Succeeded ({statusCounts.succeeded})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({statusCounts.pending})</TabsTrigger>
          <TabsTrigger value="failed">Failed ({statusCounts.failed})</TabsTrigger>
          <TabsTrigger value="refunded">Refunded ({statusCounts.refunded})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({statusCounts.cancelled})</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters & Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search payments..."
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
                  <option value="succeeded">Succeeded</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  value={filters.paymentMethod}
                  onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Methods</option>
                  <option value="card">Card</option>
                  <option value="bank_account">Bank Account</option>
                  <option value="paypal">PayPal</option>
                  <option value="apple_pay">Apple Pay</option>
                  <option value="google_pay">Google Pay</option>
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
                <select
                  value={filters.amountRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, amountRange: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Amounts</option>
                  <option value="0-50">$0 - $50</option>
                  <option value="50-100">$50 - $100</option>
                  <option value="100-500">$100 - $500</option>
                  <option value="500+">$500+</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Payments Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payments</CardTitle>
                  <CardDescription>
                    {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''} found
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
                  <div className="col-span-2">Payment Details</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1">Amount</div>
                  <div className="col-span-2">Payment Method</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-1">Actions</div>
                </div>
                {filteredPayments.map((payment) => (
                  <div key={payment.id} className="grid grid-cols-12 gap-4 p-4 border-t hover:bg-gray-50">
                    <div className="col-span-3 flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {payment.customerName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{payment.customerName}</p>
                        <p className="text-sm text-gray-500">{payment.customerEmail}</p>
                        <p className="text-xs text-gray-400">ID: {payment.id}</p>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <p className="font-medium">{payment.description}</p>
                      <p className="text-sm text-gray-500">Transaction: {payment.transactionId}</p>
                      {payment.invoiceId && (
                        <p className="text-xs text-blue-600">Invoice: {payment.invoiceId}</p>
                      )}
                    </div>
                    <div className="col-span-1">
                      {getStatusBadge(payment.status)}
                      {payment.failureReason && (
                        <p className="text-xs text-red-600 mt-1">{payment.failureReason}</p>
                      )}
                    </div>
                    <div className="col-span-1">
                      <p className="font-medium">${payment.amount}</p>
                      <p className="text-xs text-gray-500">Net: ${payment.netAmount}</p>
                      {payment.fees > 0 && (
                        <p className="text-xs text-gray-400">Fees: ${payment.fees}</p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center space-x-2">
                        {getPaymentMethodIcon(payment.paymentMethodType)}
                        <span className="text-sm">{payment.paymentMethod}</span>
                      </div>
                      <p className="text-xs text-gray-500 capitalize">{payment.gateway}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm">{new Date(payment.createdAt).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(payment.createdAt).toLocaleTimeString()}
                      </p>
                      {payment.processedAt && (
                        <p className="text-xs text-green-600">
                          Processed: {new Date(payment.processedAt).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                    <div className="col-span-1">
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {payment.status === 'failed' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRetryPayment(payment.id)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                        {payment.status === 'succeeded' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRefund(payment.id)}
                          >
                            <RefreshCcw className="h-4 w-4" />
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
                  <Download className="h-4 w-4 mr-2" />
                  Export Selected
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Failed Payments
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Payment Receipts
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Payment Issues
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Failed Payments</span>
                  <Badge variant="destructive">{statusCounts.failed}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pending Payments</span>
                  <Badge variant="secondary">{statusCounts.pending}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Refunded This Month</span>
                  <Badge variant="outline">{statusCounts.refunded}</Badge>
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
                  <span className="text-sm">Total Revenue</span>
                  <span className="font-semibold">${metrics?.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Net Revenue</span>
                  <span className="font-semibold">${metrics?.netRevenue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Fees</span>
                  <span className="font-semibold">${metrics?.totalFees.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}




