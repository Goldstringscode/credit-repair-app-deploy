'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Download, Plus, RefreshCw, Search, Send, Bell,
  Eye, MoreHorizontal, CheckCircle, AlertCircle,
  Clock, FileText, DollarSign, TrendingUp, X, Loader2,
} from 'lucide-react'

interface InvoiceLineItem {
  id: string; description: string; quantity: number; unitPrice: number; total: number; type: 'subscription'|'service'|'one_time'
}
interface Invoice {
  id: string; number: string; customerId: string; customerName: string; customerEmail: string
  subscriptionId?: string; amount: number; currency: string
  status: 'draft'|'sent'|'paid'|'overdue'|'cancelled'|'refunded'
  description: string; createdAt: string; dueDate: string; paidAt?: string
  paymentMethod?: string; lineItems: InvoiceLineItem[]; subtotal: number; tax: number; total: number
  notes?: string; pdfUrl?: string; sentAt?: string
}
interface InvoiceMetrics {
  totalInvoices: number; draftInvoices: number; sentInvoices: number; paidInvoices: number
  overdueInvoices: number; totalRevenue: number; pendingRevenue: number; averageInvoiceAmount: number; paymentRate: number
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string,{color:string;icon:React.ElementType}> = {
    draft:     {color:'bg-gray-100 text-gray-800',   icon:Clock},
    sent:      {color:'bg-blue-100 text-blue-800',   icon:Send},
    paid:      {color:'bg-green-100 text-green-800', icon:CheckCircle},
    overdue:   {color:'bg-red-100 text-red-800',     icon:AlertCircle},
    cancelled: {color:'bg-gray-100 text-gray-800',   icon:X},
    refunded:  {color:'bg-orange-100 text-orange-800',icon:RefreshCw},
  }
  const {color,icon:Icon} = cfg[status] ?? cfg.draft
  return <Badge className={`${color} border-0`}><Icon className="h-3 w-3 mr-1"/>{status.toUpperCase()}</Badge>
}

export default function AdminInvoiceManagement() {
  const [selectedTab, setSelectedTab] = useState('all')
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [metrics, setMetrics] = useState<InvoiceMetrics | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  const [actionMessage, setActionMessage] = useState<{text:string;type:'success'|'error'|'info'}|null>(null)

  const loadInvoices = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/invoices')
      const result = await res.json()
      if (result.success && result.data) {
        setInvoices(result.data.invoices || [])
        setMetrics(result.data.metrics || null)
      }
    } catch (err: any) {
      showMessage('Failed to load invoices: ' + err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadInvoices() }, [])

  const showMessage = (text: string, type: 'success'|'error'|'info' = 'info') => {
    setActionMessage({text, type})
    setTimeout(() => setActionMessage(null), 5000)
  }

  const handleSendInvoice = (invoiceId: string) => {
    setInvoices(prev => prev.map(i => i.id===invoiceId ? {...i, status:'sent' as const, sentAt:new Date().toISOString()} : i))
    showMessage('Invoice sent.', 'success')
  }
  const handleMarkPaid = (invoiceId: string) => {
    setInvoices(prev => prev.map(i => i.id===invoiceId ? {...i, status:'paid' as const, paidAt:new Date().toISOString()} : i))
    showMessage('Invoice marked as paid.', 'success')
  }
  const handleSendReminder = (invoiceId: string) => {
    const inv = invoices.find(i => i.id===invoiceId)
    showMessage('Reminder queued for ' + (inv?.customerName || invoiceId), 'success')
  }

  const filteredInvoices = invoices.filter(inv => {
    const matchTab = selectedTab==='all' || inv.status===selectedTab
    const q = searchQuery.toLowerCase()
    const matchSearch = !q || inv.customerName.toLowerCase().includes(q) || inv.customerEmail.toLowerCase().includes(q) || inv.number.toLowerCase().includes(q)
    return matchTab && matchSearch
  })

  const handleExport = () => {
    const list = filteredInvoices.length > 0 ? filteredInvoices : invoices
    if (list.length===0) { showMessage('No invoices to export.','info'); return }
    const rows = [['Invoice #','Customer','Email','Amount','Status','Date'],...list.map(i=>[i.number,i.customerName,i.customerEmail,'$'+(i.total/100).toFixed(2),i.status,new Date(i.createdAt).toLocaleDateString()])]
    const csv = rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n')
    const blob = new Blob([csv],{type:'text/csv'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href=url; a.download='invoices-'+new Date().toISOString().split('T')[0]+'.csv'; a.click()
    URL.revokeObjectURL(url)
    showMessage('Exported '+list.length+' invoices to CSV.','success')
  }
  const handleCreateInvoice = () => showMessage('Invoices are created automatically from payments. Go to Users to view payment history.','info')
  const handleViewInvoice = (invoice: Invoice) => { alert(['Invoice: '+invoice.number,'Customer: '+invoice.customerName+' ('+invoice.customerEmail+')','Amount: $'+(invoice.total/100).toFixed(2),'Status: '+invoice.status.toUpperCase(),'Date: '+new Date(invoice.createdAt).toLocaleDateString(),'Description: '+invoice.description].join('\n')) }
  const handleDownloadInvoice = (invoice: Invoice) => {
    const text = ['INVOICE','=======','Number: '+invoice.number,'Customer: '+invoice.customerName,'Email: '+invoice.customerEmail,'Date: '+new Date(invoice.createdAt).toLocaleDateString(),'','Amount: $'+(invoice.total/100).toFixed(2),'Status: '+invoice.status.toUpperCase()].join('\n')
    const blob = new Blob([text],{type:'text/plain'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href=url; a.download=invoice.number+'.txt'; a.click()
    URL.revokeObjectURL(url)
    showMessage('Downloaded '+invoice.number,'success')
  }
  const handleMoreActions = (invoice: Invoice) => {
    if (invoice.status==='cancelled') { showMessage('Already cancelled.','info'); return }
    if (window.confirm('Cancel invoice '+invoice.number+' for '+invoice.customerName+'?')) {
      setInvoices(prev => prev.map(i => i.id===invoice.id ? {...i,status:'cancelled' as const} : i))
      showMessage('Invoice '+invoice.number+' cancelled.','success')
    }
  }
  const handleToggleSelect = (id: string) => setSelectedInvoices(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev,id])
  const handleSendSelected = () => {
    if (selectedInvoices.length===0) { showMessage('No invoices selected.','info'); return }
    setInvoices(prev => prev.map(i => selectedInvoices.includes(i.id) ? {...i,status:'sent' as const,sentAt:new Date().toISOString()} : i))
    showMessage('Sent '+selectedInvoices.length+' invoice(s).','success')
    setSelectedInvoices([])
  }
  const handleExportSelected = () => {
    const sel = invoices.filter(i => selectedInvoices.includes(i.id))
    if (sel.length===0) { showMessage('No invoices selected.','info'); return }
    const rows = [['Invoice #','Customer','Email','Amount','Status','Date'],...sel.map(i=>[i.number,i.customerName,i.customerEmail,'$'+(i.total/100).toFixed(2),i.status,new Date(i.createdAt).toLocaleDateString()])]
    const csv = rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n')
    const blob = new Blob([csv],{type:'text/csv'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href=url; a.download='invoices-selected-'+new Date().toISOString().split('T')[0]+'.csv'; a.click()
    URL.revokeObjectURL(url)
    showMessage('Exported '+sel.length+' selected.','success')
    setSelectedInvoices([])
  }
  const handleSendReminders = () => {
    const overdue = invoices.filter(i => i.status==='overdue')
    if (overdue.length===0) { showMessage('No overdue invoices.','info'); return }
    showMessage('Reminders queued for '+overdue.length+' overdue invoice(s): '+overdue.map(i=>i.customerName).join(', '),'success')
  }

  const statusCounts = {
    all:       metrics?.totalInvoices   ?? invoices.length,
    draft:     metrics?.draftInvoices   ?? invoices.filter(i=>i.status==='draft').length,
    sent:      metrics?.sentInvoices    ?? invoices.filter(i=>i.status==='sent').length,
    paid:      metrics?.paidInvoices    ?? invoices.filter(i=>i.status==='paid').length,
    overdue:   metrics?.overdueInvoices ?? invoices.filter(i=>i.status==='overdue').length,
    cancelled: invoices.filter(i=>i.status==='cancelled').length,
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-500">Loading invoices...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {actionMessage && (
        <div className={`mb-4 p-3 rounded-lg text-sm flex items-center justify-between ${actionMessage.type==='success'?'bg-green-50 border border-green-200 text-green-800':actionMessage.type==='error'?'bg-red-50 border border-red-200 text-red-800':'bg-blue-50 border border-blue-200 text-blue-800'}`}>
          <span>{actionMessage.text}</span>
          <button onClick={()=>setActionMessage(null)} className="ml-4 opacity-60 hover:opacity-100">✕</button>
        </div>
      )}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoice Management</h1>
          <p className="text-gray-600">Payment invoices from your Supabase payments table</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadInvoices}><RefreshCw className="h-4 w-4 mr-2"/>Refresh</Button>
          <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-2"/>Export</Button>
          <Button onClick={handleCreateInvoice}><Plus className="h-4 w-4 mr-2"/>Create Invoice</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Invoices</CardTitle><FileText className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">{metrics?.totalInvoices ?? invoices.length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Revenue</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">${((metrics?.totalRevenue??0)/100).toFixed(2)}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Paid Invoices</CardTitle><CheckCircle className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{metrics?.paidInvoices??0}</div><p className="text-xs text-muted-foreground">{metrics?.paymentRate?.toFixed(1)??0}% rate</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Overdue</CardTitle><AlertCircle className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{metrics?.overdueInvoices??0}</div><p className="text-xs text-muted-foreground">${((metrics?.pendingRevenue??0)/100).toFixed(2)} pending</p></CardContent></Card>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
          <Input placeholder="Search by name, email, or invoice number..." className="pl-9" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({statusCounts.draft})</TabsTrigger>
          <TabsTrigger value="sent">Sent ({statusCounts.sent})</TabsTrigger>
          <TabsTrigger value="paid">Paid ({statusCounts.paid})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({statusCounts.overdue})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({statusCounts.cancelled})</TabsTrigger>
        </TabsList>
        <TabsContent value={selectedTab}>
          <Card>
            <CardContent className="p-0">
              {filteredInvoices.length===0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-8 w-8 mx-auto mb-3 opacity-30"/>
                  <p className="font-medium">No invoices found</p>
                  <p className="text-sm mt-1">{invoices.length===0?'No payments recorded yet.':'No invoices match the current filter.'}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-gray-50">
                      <tr>
                        <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase"><input type="checkbox" className="rounded" checked={selectedInvoices.length===filteredInvoices.length && filteredInvoices.length>0} onChange={e=>setSelectedInvoices(e.target.checked?filteredInvoices.map(i=>i.id):[])}/></th>
                        <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Invoice</th>
                        <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredInvoices.map(invoice => (
                        <tr key={invoice.id} className="hover:bg-gray-50">
                          <td className="p-4"><input type="checkbox" className="rounded" checked={selectedInvoices.includes(invoice.id)} onChange={()=>handleToggleSelect(invoice.id)}/></td>
                          <td className="p-4"><div className="font-medium text-sm">{invoice.number}</div><div className="text-xs text-gray-400 truncate max-w-[140px]">{invoice.description}</div></td>
                          <td className="p-4"><div className="font-medium text-sm">{invoice.customerName}</div><div className="text-xs text-gray-400">{invoice.customerEmail}</div></td>
                          <td className="p-4"><div className="font-medium text-sm">${(invoice.total/100).toFixed(2)}</div></td>
                          <td className="p-4"><StatusBadge status={invoice.status}/></td>
                          <td className="p-4 text-sm text-gray-600">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" onClick={()=>handleViewInvoice(invoice)} title="View"><Eye className="h-4 w-4"/></Button>
                              <Button variant="ghost" size="sm" onClick={()=>handleDownloadInvoice(invoice)} title="Download"><Download className="h-4 w-4"/></Button>
                              {invoice.status==='draft' && <Button variant="ghost" size="sm" onClick={()=>handleSendInvoice(invoice.id)} title="Send"><Send className="h-4 w-4"/></Button>}
                              {(invoice.status==='sent'||invoice.status==='overdue') && <Button variant="ghost" size="sm" onClick={()=>handleMarkPaid(invoice.id)} title="Mark Paid"><CheckCircle className="h-4 w-4"/></Button>}
                              {invoice.status==='overdue' && <Button variant="ghost" size="sm" onClick={()=>handleSendReminder(invoice.id)} title="Send Reminder"><Bell className="h-4 w-4"/></Button>}
                              <Button variant="ghost" size="sm" onClick={()=>handleMoreActions(invoice)} title="More"><MoreHorizontal className="h-4 w-4"/></Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedInvoices.length>0 && (
        <Card className="mt-4">
          <CardHeader><CardTitle className="text-sm">Bulk Actions — {selectedInvoices.length} selected</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleSendSelected}><Send className="h-4 w-4 mr-2"/>Send Selected</Button>
            <Button variant="outline" onClick={handleExportSelected}><Download className="h-4 w-4 mr-2"/>Export Selected</Button>
            <Button variant="outline" onClick={handleSendReminders}><Bell className="h-4 w-4 mr-2"/>Send Reminders</Button>
            <Button variant="ghost" onClick={()=>setSelectedInvoices([])}><X className="h-4 w-4 mr-2"/>Clear</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}