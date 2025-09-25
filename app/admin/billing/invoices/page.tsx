'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { 
  FileText, 
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
  Mail,
  Phone,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  Send,
  Printer,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'

interface Invoice {
  id: string
  number: string
  customerId: string
  customerName: string
  customerEmail: string
  subscriptionId?: string
  amount: number
  currency: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'refunded'
  description: string
  createdAt: string
  dueDate: string
  paidAt?: string
  paymentMethod?: string
  lineItems: InvoiceLineItem[]
  subtotal: number
  tax: number
  total: number
  notes?: string
  pdfUrl?: string
  sentAt?: string
  reminderSentAt?: string
}

interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  type: 'subscription' | 'one_time' | 'credit' | 'discount'
}

interface InvoiceFilters {
  status: string
  dateRange: string
  search: string
  amountRange: string
}

interface InvoiceMetrics {
  totalInvoices: number
  draftInvoices: number
  sentInvoices: number
  paidInvoices: number
  overdueInvoices: number
  totalRevenue: number
  pendingRevenue: number
  averageInvoiceAmount: number
  paymentRate: number
}

export default function AdminInvoiceManagement() {
  const [selectedTab, setSelectedTab] = useState("all")
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [metrics, setMetrics] = useState<InvoiceMetrics | null>(null)
  const [filters, setFilters] = useState<InvoiceFilters>({
    status: 'all',
    dateRange: 'all',
    search: '',
    amountRange: 'all'
  })

  // Mock data
  const mockInvoices: Invoice[] = [
    {
      id: 'inv_001',
      number: 'INV-2024-001',
      customerId: 'cus_001',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      subscriptionId: 'sub_001',
      amount: 59.99,
      currency: 'usd',
      status: 'paid',
      description: 'Premium Plan - Monthly Subscription',
      createdAt: '2024-01-15T10:30:00Z',
      dueDate: '2024-02-15T23:59:59Z',
      paidAt: '2024-01-15T10:35:00Z',
      paymentMethod: 'Visa ****4242',
      lineItems: [
        {
          id: 'line_001',
          description: 'Premium Plan - Monthly',
          quantity: 1,
          unitPrice: 59.99,
          total: 59.99,
          type: 'subscription'
        }
      ],
      subtotal: 59.99,
      tax: 0,
      total: 59.99,
      pdfUrl: '/invoices/inv_001.pdf'
    },
    {
      id: 'inv_002',
      number: 'INV-2024-002',
      customerId: 'cus_002',
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      subscriptionId: 'sub_002',
      amount: 29.99,
      currency: 'usd',
      status: 'sent',
      description: 'Basic Plan - Monthly Subscription',
      createdAt: '2024-01-14T14:20:00Z',
      dueDate: '2024-02-14T23:59:59Z',
      lineItems: [
        {
          id: 'line_002',
          description: 'Basic Plan - Monthly',
          quantity: 1,
          unitPrice: 29.99,
          total: 29.99,
          type: 'subscription'
        }
      ],
      subtotal: 29.99,
      tax: 0,
      total: 29.99,
      sentAt: '2024-01-14T14:25:00Z',
      pdfUrl: '/invoices/inv_002.pdf'
    },
    {
      id: 'inv_003',
      number: 'INV-2024-003',
      customerId: 'cus_003',
      customerName: 'Bob Johnson',
      customerEmail: 'bob@example.com',
      subscriptionId: 'sub_003',
      amount: 99.99,
      currency: 'usd',
      status: 'overdue',
      description: 'Enterprise Plan - Monthly Subscription',
      createdAt: '2024-01-10T09:15:00Z',
      dueDate: '2024-02-10T23:59:59Z',
      lineItems: [
        {
          id: 'line_003',
          description: 'Enterprise Plan - Monthly',
          quantity: 1,
          unitPrice: 99.99,
          total: 99.99,
          type: 'subscription'
        }
      ],
      subtotal: 99.99,
      tax: 0,
      total: 99.99,
      sentAt: '2024-01-10T09:20:00Z',
      reminderSentAt: '2024-02-12T10:00:00Z',
      pdfUrl: '/invoices/inv_003.pdf'
    },
    {
      id: 'inv_004',
      number: 'INV-2024-004',
      customerId: 'cus_004',
      customerName: 'Alice Brown',
      customerEmail: 'alice@example.com',
      amount: 150.00,
      currency: 'usd',
      status: 'draft',
      description: 'Custom Services - One-time Payment',
      createdAt: '2024-01-20T16:45:00Z',
      dueDate: '2024-02-20T23:59:59Z',
      lineItems: [
        {
          id: 'line_004',
          description: 'Custom Credit Repair Consultation',
          quantity: 2,
          unitPrice: 75.00,
          total: 150.00,
          type: 'one_time'
        }
      ],
      subtotal: 150.00,
      tax: 0,
      total: 150.00,
      notes: 'Custom services for advanced credit repair'
    }
  ]

  const mockMetrics: InvoiceMetrics = {
    totalInvoices: 1247,
    draftInvoices: 45,
    sentInvoices: 89,
    paidInvoices: 1080,
    overdueInvoices: 33,
    totalRevenue: 125000,
    pendingRevenue: 15000,
    averageInvoiceAmount: 89.99,
    paymentRate: 86.6
  }

  const statusCounts = {
    all: mockInvoices.length,
    draft: mockInvoices.filter(i => i.status === 'draft').length,
    sent: mockInvoices.filter(i => i.status === 'sent').length,
    paid: mockInvoices.filter(i => i.status === 'paid').length,
    overdue: mockInvoices.filter(i => i.status === 'overdue').length,
    cancelled: mockInvoices.filter(i => i.status === 'cancelled').length
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setInvoices(mockInvoices)
      setMetrics(mockMetrics)
      setLoading(false)
    }

    loadData()
  }, [])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: Edit },
      sent: { color: 'bg-blue-100 text-blue-800', icon: Send },
      paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      overdue: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: X },
      refunded: { color: 'bg-orange-100 text-orange-800', icon: RefreshCw }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    const Icon = config.icon

    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.toUpperCase()}
      </Badge>
    )
  }

  const handleSendInvoice = (invoiceId: string) => {
    setInvoices(prev => 
      prev.map(invoice => 
        invoice.id === invoiceId 
          ? { 
              ...invoice, 
              status: 'sent' as any,
              sentAt: new Date().toISOString()
            }
          : invoice
      )
    )
    console.log(`Sending invoice ${invoiceId}`)
  }

  const handleMarkPaid = (invoiceId: string) => {
    setInvoices(prev => 
      prev.map(invoice => 
        invoice.id === invoiceId 
          ? { 
              ...invoice, 
              status: 'paid' as any,
              paidAt: new Date().toISOString()
            }
          : invoice
      )
    )
    console.log(`Marking invoice ${invoiceId} as paid`)
  }

  const handleSendReminder = (invoiceId: string) => {
    setInvoices(prev => 
      prev.map(invoice => 
        invoice.id === invoiceId 
          ? { 
              ...invoice, 
              reminderSentAt: new Date().toISOString()
            }
          : invoice
      )
    )
    console.log(`Sending reminder for invoice ${invoiceId}`)
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesStatus = filters.status === 'all' || invoice.status === filters.status
    const matchesSearch = filters.search === '' || 
      invoice.customerName.toLowerCase().includes(filters.search.toLowerCase()) ||
      invoice.customerEmail.toLowerCase().includes(filters.search.toLowerCase()) ||
      invoice.number.toLowerCase().includes(filters.search.toLowerCase())
    
    return matchesStatus && matchesSearch
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
            <h1 className="text-3xl font-bold mb-2">Invoice Management</h1>
            <p className="text-gray-600">Create, manage, and track all customer invoices</p>
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
              Create Invoice
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalInvoices.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12.5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics?.paidInvoices.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{metrics?.paymentRate}% payment rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics?.overdueInvoices.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

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
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({statusCounts.draft})</TabsTrigger>
          <TabsTrigger value="sent">Sent ({statusCounts.sent})</TabsTrigger>
          <TabsTrigger value="paid">Paid ({statusCounts.paid})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({statusCounts.overdue})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({statusCounts.cancelled})</TabsTrigger>
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
                    placeholder="Search invoices..."
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
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
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

          {/* Invoices Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Invoices</CardTitle>
                  <CardDescription>
                    {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''} found
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
                  <div className="col-span-2">Invoice Details</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1">Amount</div>
                  <div className="col-span-2">Dates</div>
                  <div className="col-span-1">Payment</div>
                  <div className="col-span-2">Actions</div>
                </div>
                {filteredInvoices.map((invoice) => (
                  <div key={invoice.id} className="grid grid-cols-12 gap-4 p-4 border-t hover:bg-gray-50">
                    <div className="col-span-3 flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {invoice.customerName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{invoice.customerName}</p>
                        <p className="text-sm text-gray-500">{invoice.customerEmail}</p>
                        <p className="text-xs text-gray-400">{invoice.number}</p>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <p className="font-medium">{invoice.description}</p>
                      <p className="text-sm text-gray-500">
                        {invoice.lineItems.length} item{invoice.lineItems.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="col-span-1">
                      {getStatusBadge(invoice.status)}
                    </div>
                    <div className="col-span-1">
                      <p className="font-medium">${invoice.amount}</p>
                      <p className="text-xs text-gray-500">{invoice.currency.toUpperCase()}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm">Created: {new Date(invoice.createdAt).toLocaleDateString()}</p>
                      <p className="text-sm">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                      {invoice.sentAt && (
                        <p className="text-xs text-gray-500">
                          Sent: {new Date(invoice.sentAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="col-span-1">
                      {invoice.paymentMethod && (
                        <p className="text-sm">{invoice.paymentMethod}</p>
                      )}
                      {invoice.paidAt && (
                        <p className="text-xs text-green-600">
                          Paid: {new Date(invoice.paidAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {invoice.pdfUrl && (
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        {invoice.status === 'draft' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleSendInvoice(invoice.id)}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        {invoice.status === 'sent' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleMarkPaid(invoice.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {invoice.status === 'overdue' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleSendReminder(invoice.id)}
                          >
                            <Mail className="h-4 w-4" />
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
                  <Send className="h-4 w-4 mr-2" />
                  Send Selected Invoices
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Selected
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Reminders
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Invoice Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Overdue Invoices</span>
                  <Badge variant="destructive">{statusCounts.overdue}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Draft Invoices</span>
                  <Badge variant="secondary">{statusCounts.draft}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sent This Week</span>
                  <Badge variant="outline">{statusCounts.sent}</Badge>
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
                  <span className="text-sm">Pending Revenue</span>
                  <span className="font-semibold">${metrics?.pendingRevenue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Average Invoice</span>
                  <span className="font-semibold">${metrics?.averageInvoiceAmount}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}



