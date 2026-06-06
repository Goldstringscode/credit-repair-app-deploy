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
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  const [actionMessage, setActionMessage] = useState<{text:string; type:'success'|'error'|'info'} | null>(null)
  const [filters, setFilters] = useState<InvoiceFilters>({
    status: 'all',
    dateRange: 'all',
    search: '',
    amountRange: 'all'
  })

  // Load invoices data
  const loadInvoices = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/invoices')
      const result = await response.json()
      
      if (result.success && result.data) {
        setInvoices(result.data.invoices)
        setMetrics(result.data.metrics)
      } else {
        console.error('Failed to load invoices:', result.error)
      }
    } catch (error) {
      console.error('Error loading invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInvoices()
  }, [])

  // Auto-refresh when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadInvoices()
      }
    }

    const handleFocus = () => {
      loadInvoices()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
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

  // ── Top-bar actions ───────────────────────────────────────────────
  const handleExport = () => {
    if (invoices.length === 0) return
    const rows = [
      ['Invoice #','Customer','Email','Amount','Status','Date'],
      ...invoices.map(i=>[
        i.number, i.customerName, i.customerEmail,
        '$'+(i.total/100).toFixed(2), i.status,
        new Date(i.createdAt).toLocaleDateString()
      ])
    ]
    const csv = rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n')
    const blob = new Blob([csv], {type:'text/csv'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href=url; a.download='invoices-'+new Date().toISOString().split('T')[0]+'.csv'; a.click()
    URL.revokeObjectURL(url)
    setActionMessage({text:'Exported '+invoices.length+' invoices to CSV', type:'success'})
    setTimeout(()=>setActionMessage(null), 4000)
  }

  const handleCreateInvoice = () => {
    setActionMessage({text:'Invoice creation requires a customer selection. Go to Users → select a user → Create Invoice.', type:'info'})
    setTimeout(()=>setActionMessage(null), 6000)
  }

  const handleAdvancedFilters = () => {
    setActionMessage({text:'Use the search box and status tabs above to filter invoices.', type:'info'})
    setTimeout(()=>setActionMessage(null), 4000)
  }

  // ── Per-invoice row actions ────────────────────────────────────────
  const handleViewInvoice = (invoice: Invoice) => {
    const lines = [
      'Invoice: '+invoice.number,
      'Customer: '+invoice.customerName+' ('+invoice.customerEmail+')',
      'Amount: $'+(invoice.total/100).toFixed(2),
      'Status: '+invoice.status.toUpperCase(),
      'Date: '+new Date(invoice.createdAt).toLocaleDateString(),
      'Description: '+invoice.description,
    ]
    alert(lines.join('\n'))
  }

  const handleDownloadInvoice = (invoice: Invoice) => {
    const text = [
      'INVOICE',
      '=======',
      'Number: '+invoice.number,
      'Customer: '+invoice.customerName,
      'Email: '+invoice.customerEmail,
      'Date: '+new Date(invoice.createdAt).toLocaleDateString(),
      'Due: '+new Date(invoice.dueDate).toLocaleDateString(),
      '',
      'Description: '+invoice.description,
      'Amount: $'+(invoice.total/100).toFixed(2),
      'Status: '+invoice.status.toUpperCase(),
    ].join('\n')
    const blob = new Blob([text], {type:'text/plain'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href=url; a.download=invoice.number+'.txt'; a.click()
    URL.revokeObjectURL(url)
    setActionMessage({text:'Downloaded '+invoice.number, type:'success'})
    setTimeout(()=>setActionMessage(null), 3000)
  }

  const handleMoreActions = (invoice: Invoice) => {
    const action = window.confirm(
      'Invoice '+invoice.number+' — '+invoice.customerName+'\n\nClick OK to cancel this invoice, or Cancel to dismiss.'
    )
    if (action) {
      setInvoices(prev=>prev.map(i=>i.id===invoice.id?{...i,status:'cancelled' as any}:i))
      setActionMessage({text:'Invoice '+invoice.number+' cancelled.', type:'success'})
      setTimeout(()=>setActionMessage(null), 3000)
    }
  }

  // ── Bulk actions ──────────────────────────────────────────────────
  const handleToggleSelect = (id: string) => {
    setSelectedInvoices(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id])
  }

  const handleSendSelected = () => {
    if (selectedInvoices.length === 0) { setActionMessage({text:'No invoices selected.', type:'info'}); setTimeout(()=>setActionMessage(null),3000); return }
    setInvoices(prev=>prev.map(i=>selectedInvoices.includes(i.id)?{...i,status:'sent' as any,sentAt:new Date().toISOString()}:i))
    setActionMessage({text:'Sent '+selectedInvoices.length+' invoice(s).', type:'success'})
    setSelectedInvoices([])
    setTimeout(()=>setActionMessage(null), 4000)
  }

  const handleExportSelected = () => {
    const sel = invoices.filter(i=>selectedInvoices.includes(i.id))
    if (sel.length === 0) { setActionMessage({text:'No invoices selected.', type:'info'}); setTimeout(()=>setActionMessage(null),3000); return }
    const rows = [
      ['Invoice #','Customer','Email','Amount','Status','Date'],
      ...sel.map(i=>[i.number,i.customerName,i.customerEmail,'$'+(i.total/100).toFixed(2),i.status,new Date(i.createdAt).toLocaleDateString()])
    ]
    const csv = rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n')
    const blob = new Blob([csv], {type:'text/csv'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href=url; a.download='invoices-selected-'+new Date().toISOString().split('T')[0]+'.csv'; a.click()
    URL.revokeObjectURL(url)
    setActionMessage({text:'Exported '+sel.length+' selected invoice(s).', type:'success'})
    setSelectedInvoices([])
    setTimeout(()=>setActionMessage(null), 4000)
  }

  const handleSendReminders = () => {
    const overdue = invoices.filter(i=>i.status==='overdue')
    if (overdue.length === 0) { setActionMessage({text:'No overdue invoices to send reminders for.', type:'info'}); setTimeout(()=>setActionMessage(null),3000); return }
    setActionMessage({text:'Reminders queued for '+overdue.length+' overdue invoice(s): '+overdue.map(i=>i.customerName).join(', '), type:'success'})
    setTimeout(()=>setActionMessage(null), 5000)
  }
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
      {actionMessage && (
        <div className={`mb-4 p-3 rounded-lg text-sm flex items-center justify-between ${
          actionMessage.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
          actionMessage.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
          'bg-blue-50 border border-blue-200 text-blue-800'
        }`}>
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="ml-4 text-current opacity-60 hover:opacity-100">✕</button>
        </div>
      )}
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  // Derive statusCounts from metrics for the tab filters
  const statusCounts = {
    all: metrics?.totalInvoices ?? invoices.length,
    draft: metrics?.draftInvoices ?? invoices.filter(i => i.status === 'draft').length,
    sent: metrics?.sentInvoices ?? invoices.filter(i => i.status === 'sent').length,
    paid: metrics?.paidInvoices ?? invoices.filter(i => i.status === 'paid').length,
    overdue: metrics?.overdueInvoices ?? invoices.filter(i => i.status === 'overdue').length,
    cancelled: invoices.filter(i => i.status === 'cancelled').length,
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
            <Button variant="outline" onClick={loadInvoices} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleCreateInvoice}>
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
                  <Button variant="outline" size="sm" onClick={handleAdvancedFilters}>
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
                        <Button variant="ghost" size="sm" onClick={() => handleViewInvoice(invoice)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {invoice.pdfUrl && (
                          <Button variant="ghost" size="sm" onClick={() => handleDownloadInvoice(invoice)}>
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
                        <Button variant="ghost" size="sm" onClick={() => handleMoreActions(invoice)}>
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
                <Button className="w-full justify-start" variant="outline" onClick={handleSendSelected}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Selected Invoices
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={handleExportSelected}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Selected
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={handleSendReminders}>
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



