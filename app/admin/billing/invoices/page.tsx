'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Download, Plus, RefreshCw, Search, Send, Bell,
  Eye, MoreHorizontal, CheckCircle, AlertCircle,
  Clock, FileText, DollarSign, X, Loader2, Trash2,
} from 'lucide-react'

interface LineItem { id: string; description: string; quantity: number; unitPrice: number; total: number; type: string }
interface Invoice {
  id: string; number: string; customerId: string; customerName: string; customerEmail: string
  subscriptionId?: string; amount: number; currency: string
  status: 'draft'|'sent'|'paid'|'overdue'|'cancelled'|'refunded'
  description: string; createdAt: string; dueDate: string; paidAt?: string
  paymentMethod?: string; lineItems: LineItem[]; subtotal: number; tax: number; total: number
  notes?: string; pdfUrl?: string; sentAt?: string; source?: string
}
interface InvoiceMetrics {
  totalInvoices: number; draftInvoices: number; sentInvoices: number; paidInvoices: number
  overdueInvoices: number; totalRevenue: number; pendingRevenue: number; averageInvoiceAmount: number; paymentRate: number
}
interface User { id: string; email: string; first_name?: string; last_name?: string }
interface DraftLineItem { description: string; quantity: number; unitPrice: number; type: string }

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string,{color:string;icon:React.ElementType}> = {
    draft:     {color:'bg-gray-100 text-gray-800',    icon:Clock},
    sent:      {color:'bg-blue-100 text-blue-800',    icon:Send},
    paid:      {color:'bg-green-100 text-green-800',  icon:CheckCircle},
    overdue:   {color:'bg-red-100 text-red-800',      icon:AlertCircle},
    cancelled: {color:'bg-gray-100 text-gray-800',    icon:X},
    refunded:  {color:'bg-orange-100 text-orange-800',icon:RefreshCw},
  }
  const {color, icon:Icon} = cfg[status] ?? cfg.draft
  return <Badge className={`${color} border-0`}><Icon className="h-3 w-3 mr-1"/>{status.toUpperCase()}</Badge>
}

function CreateInvoiceModal({ onClose, onCreated }: { onClose: ()=>void; onCreated: (inv: any)=>void }) {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [dueDate, setDueDate] = useState(() => new Date(Date.now()+30*24*60*60*1000).toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [lineItems, setLineItems] = useState<DraftLineItem[]>([
    { description: 'Credit Repair Service', quantity: 1, unitPrice: 9900, type: 'service' }
  ])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(true)

  useEffect(() => {
    fetch('/api/admin/users?limit=200')
      .then(r=>r.json())
      .then(d => { setUsers(d.data?.users || d.users || []); setLoadingUsers(false) })
      .catch(() => setLoadingUsers(false))
  }, [])

  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase()
    if (!q) return false
    const name = [u.first_name, u.last_name].filter(Boolean).join(' ').toLowerCase()
    return name.includes(q) || u.email.toLowerCase().includes(q)
  }).slice(0, 6)

  const selectUser = (u: User) => {
    setSelectedUserId(u.id)
    const name = [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email.split('@')[0]
    setCustomerName(name)
    setCustomerEmail(u.email)
    setUserSearch(name)
    setShowDropdown(false)
  }

  const updateLineItem = (idx: number, field: keyof DraftLineItem, value: string|number) => {
    setLineItems(prev => prev.map((item, i) => i===idx ? {...item, [field]: value} : item))
  }
  const addLineItem = () => setLineItems(prev => [...prev, {description:'', quantity:1, unitPrice:0, type:'service'}])
  const removeLineItem = (idx: number) => setLineItems(prev => prev.filter((_,i)=>i!==idx))

  const subtotal = lineItems.reduce((s,i) => s + i.quantity * i.unitPrice, 0)
  const tax = Math.round(subtotal * 0.08)
  const total = subtotal + tax

  const handleSubmit = async () => {
    if (!customerName.trim()) { setError('Customer name is required'); return }
    if (!customerEmail.trim() || !customerEmail.includes('@')) { setError('Valid customer email is required'); return }
    if (lineItems.some(i => !i.description.trim())) { setError('All line items need a description'); return }
    if (lineItems.some(i => i.unitPrice <= 0)) { setError('All line items need a price > 0'); return }
    setSubmitting(true); setError('')
    try {
      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUserId||undefined, customerName, customerEmail, lineItems, dueDate, notes })
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      onCreated(data.data)
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={e => { if(e.target===e.currentTarget) onClose() }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold">Create Invoice</h2>
            <p className="text-sm text-gray-500 mt-0.5">Saved as Draft — send after reviewing</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X className="h-5 w-5"/></button>
        </div>
        <div className="p-6 space-y-6">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Customer</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
              <Input
                className="pl-9" placeholder="Search existing users..."
                value={userSearch}
                onFocus={() => setShowDropdown(true)}
                onChange={e => { setUserSearch(e.target.value); setShowDropdown(true); if(!e.target.value) { setSelectedUserId(''); setCustomerName(''); setCustomerEmail('') } }}
              />
              {showDropdown && userSearch && (
                <div className="absolute top-full left-0 right-0 z-20 border rounded-lg bg-white shadow-lg max-h-36 overflow-y-auto mt-1">
                  {loadingUsers ? <div className="p-3 text-sm text-gray-500">Loading...</div> :
                   filteredUsers.length === 0 ? <div className="p-3 text-sm text-gray-500">No matches — fill in manually below</div> :
                   filteredUsers.map(u => (
                    <button key={u.id} onClick={() => selectUser(u)} className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm border-b last:border-0">
                      <span className="font-medium">{[u.first_name,u.last_name].filter(Boolean).join(' ')||'—'}</span>
                      <span className="text-gray-400 ml-2 text-xs">{u.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">Name *</Label>
                <Input placeholder="Customer Name" value={customerName} onChange={e=>setCustomerName(e.target.value)} onFocus={()=>setShowDropdown(false)}/>
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">Email *</Label>
                <Input placeholder="customer@email.com" type="email" value={customerEmail} onChange={e=>setCustomerEmail(e.target.value)} onFocus={()=>setShowDropdown(false)}/>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Line Items</Label>
              <Button variant="outline" size="sm" onClick={addLineItem}><Plus className="h-3 w-3 mr-1"/>Add Item</Button>
            </div>
            <div className="space-y-2">
              {lineItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    {idx===0&&<Label className="text-xs text-gray-400 mb-1 block">Description</Label>}
                    <Input placeholder="e.g. Credit Repair Service" value={item.description} onChange={e=>updateLineItem(idx,'description',e.target.value)} onFocus={()=>setShowDropdown(false)}/>
                  </div>
                  <div className="col-span-2">
                    {idx===0&&<Label className="text-xs text-gray-400 mb-1 block">Qty</Label>}
                    <Input type="number" min="1" value={item.quantity} onChange={e=>updateLineItem(idx,'quantity',Number(e.target.value))}/>
                  </div>
                  <div className="col-span-3">
                    {idx===0&&<Label className="text-xs text-gray-400 mb-1 block">Price (cents)</Label>}
                    <Input type="number" min="0" placeholder="9900" value={item.unitPrice} onChange={e=>updateLineItem(idx,'unitPrice',Number(e.target.value))}/>
                  </div>
                  <div className="col-span-1">
                    {idx===0&&<div className="h-4 mb-1"/>}
                    <div className="h-10 flex items-center text-sm font-medium">${((item.quantity*item.unitPrice)/100).toFixed(2)}</div>
                  </div>
                  <div className="col-span-1">
                    {idx===0&&<div className="h-4 mb-1"/>}
                    {lineItems.length>1&&<Button variant="ghost" size="sm" onClick={()=>removeLineItem(idx)} className="h-10 w-10 p-0"><Trash2 className="h-3.5 w-3.5 text-red-400"/></Button>}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">Price is in cents: 9900 = $99.00 · 14900 = $149.00</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 space-y-1.5">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>${(subtotal/100).toFixed(2)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Tax (8%)</span><span>${(tax/100).toFixed(2)}</span></div>
            <div className="flex justify-between text-sm font-bold border-t pt-1.5 mt-1"><span>Total</span><span>${(total/100).toFixed(2)}</span></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold mb-1 block">Due Date</Label>
              <Input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)}/>
            </div>
            <div>
              <Label className="text-sm font-semibold mb-1 block">Notes (optional)</Label>
              <Textarea placeholder="Any notes..." value={notes} onChange={e=>setNotes(e.target.value)} className="h-10 resize-none"/>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between p-6 border-t bg-gray-50 sticky bottom-0">
          <p className="text-xs text-gray-400">Saved as <strong>Draft</strong> — you can send it afterwards</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting?<Loader2 className="h-4 w-4 animate-spin mr-2"/>:<FileText className="h-4 w-4 mr-2"/>}
              {submitting?'Creating...':'Create Invoice'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminInvoiceManagement() {
  const [selectedTab, setSelectedTab] = useState('all')
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [metrics, setMetrics] = useState<InvoiceMetrics | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  const [actionMessage, setActionMessage] = useState<{text:string;type:'success'|'error'|'info'}|null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const loadInvoices = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/invoices')
      const result = await res.json()
      if (result.success && result.data) { setInvoices(result.data.invoices||[]); setMetrics(result.data.metrics||null) }
    } catch (err: any) { showMessage('Failed to load: '+err.message,'error') }
    finally { setLoading(false) }
  }
  useEffect(() => { loadInvoices() }, [])

  const showMessage = (text: string, type: 'success'|'error'|'info'='info') => {
    setActionMessage({text,type}); setTimeout(()=>setActionMessage(null),5000)
  }
  const handleInvoiceCreated = (inv: any) => {
    showMessage('Invoice '+inv.number+' created for '+inv.customerName+' — $'+(inv.total/100).toFixed(2)+' (Draft)','success')
    loadInvoices()
  }
  const handleSendInvoice = (id: string) => { setInvoices(p=>p.map(i=>i.id===id?{...i,status:'sent' as const,sentAt:new Date().toISOString()}:i)); showMessage('Invoice sent.','success') }
  const handleMarkPaid = (id: string) => { setInvoices(p=>p.map(i=>i.id===id?{...i,status:'paid' as const,paidAt:new Date().toISOString()}:i)); showMessage('Marked as paid.','success') }
  const handleSendReminder = (id: string) => { const inv=invoices.find(i=>i.id===id); showMessage('Reminder queued for '+(inv?.customerName||id),'success') }
  const filteredInvoices = invoices.filter(inv => {
    const matchTab = selectedTab==='all'||inv.status===selectedTab
    const q = searchQuery.toLowerCase()
    return matchTab && (!q||inv.customerName.toLowerCase().includes(q)||inv.customerEmail.toLowerCase().includes(q)||inv.number.toLowerCase().includes(q))
  })
  const handleExport = () => {
    const list = filteredInvoices.length>0?filteredInvoices:invoices
    if(!list.length){showMessage('No invoices.','info');return}
    const rows=[['Invoice #','Customer','Email','Amount','Status','Date','Source'],...list.map(i=>[i.number,i.customerName,i.customerEmail,'$'+(i.total/100).toFixed(2),i.status,new Date(i.createdAt).toLocaleDateString(),(i as any).source||'payment'])]
    const csv=rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n')
    const blob=new Blob([csv],{type:'text/csv'});const url=URL.createObjectURL(blob);const a=document.createElement('a')
    a.href=url;a.download='invoices-'+new Date().toISOString().split('T')[0]+'.csv';a.click();URL.revokeObjectURL(url)
    showMessage('Exported '+list.length+' invoices.','success')
  }
  const handleViewInvoice = (invoice: Invoice) => {
    const items=invoice.lineItems.map(li=>'  '+li.description+' x'+li.quantity+' @ $'+(li.unitPrice/100).toFixed(2)+' = $'+(li.total/100).toFixed(2)).join('\n')
    alert(['Invoice: '+invoice.number,'Customer: '+invoice.customerName+' ('+invoice.customerEmail+')','Status: '+invoice.status.toUpperCase(),'Date: '+new Date(invoice.createdAt).toLocaleDateString(),'Due: '+new Date(invoice.dueDate).toLocaleDateString(),'','Line Items:',items,'','Total: $'+(invoice.total/100).toFixed(2),invoice.notes?'Notes: '+invoice.notes:''].filter(x=>x!==undefined).join('\n'))
  }
  const handleDownloadInvoice = (invoice: Invoice) => {
    const items=invoice.lineItems.map(li=>'  '+li.description+'  x'+li.quantity+'  $'+(li.unitPrice/100).toFixed(2)+'  $'+(li.total/100).toFixed(2)).join('\n')
    const text=['INVOICE','='.repeat(40),'Number:   '+invoice.number,'Customer: '+invoice.customerName,'Email:    '+invoice.customerEmail,'Date:     '+new Date(invoice.createdAt).toLocaleDateString(),'Due:      '+new Date(invoice.dueDate).toLocaleDateString(),'','LINE ITEMS','-'.repeat(40),items,'-'.repeat(40),'Total:    $'+(invoice.total/100).toFixed(2)].join('\n')
    const blob=new Blob([text],{type:'text/plain'});const url=URL.createObjectURL(blob);const a=document.createElement('a')
    a.href=url;a.download=invoice.number+'.txt';a.click();URL.revokeObjectURL(url)
    showMessage('Downloaded '+invoice.number,'success')
  }
  const handleMoreActions = (invoice: Invoice) => {
    if(invoice.status==='cancelled'){showMessage('Already cancelled.','info');return}
    if(window.confirm('Cancel invoice '+invoice.number+' for '+invoice.customerName+'?')){
      setInvoices(p=>p.map(i=>i.id===invoice.id?{...i,status:'cancelled' as const}:i))
      showMessage('Invoice '+invoice.number+' cancelled.','success')
    }
  }
  const handleToggleSelect=(id:string)=>setSelectedInvoices(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id])
  const handleSendSelected=()=>{if(!selectedInvoices.length){showMessage('None selected.','info');return};setInvoices(p=>p.map(i=>selectedInvoices.includes(i.id)?{...i,status:'sent' as const,sentAt:new Date().toISOString()}:i));showMessage('Sent '+selectedInvoices.length+'.','success');setSelectedInvoices([])}
  const handleExportSelected=()=>{const sel=invoices.filter(i=>selectedInvoices.includes(i.id));if(!sel.length){showMessage('None selected.','info');return};const rows=[['Invoice #','Customer','Email','Amount','Status','Date'],...sel.map(i=>[i.number,i.customerName,i.customerEmail,'$'+(i.total/100).toFixed(2),i.status,new Date(i.createdAt).toLocaleDateString()])];const csv=rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n');const blob=new Blob([csv],{type:'text/csv'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='invoices-selected.csv';a.click();URL.revokeObjectURL(url);showMessage('Exported '+sel.length+'.','success');setSelectedInvoices([])}
  const handleSendReminders=()=>{const od=invoices.filter(i=>i.status==='overdue');if(!od.length){showMessage('No overdue invoices.','info');return};showMessage('Reminders queued for '+od.length+' overdue: '+od.map(i=>i.customerName).join(', '),'success')}
  const statusCounts={all:metrics?.totalInvoices??invoices.length,draft:metrics?.draftInvoices??invoices.filter(i=>i.status==='draft').length,sent:metrics?.sentInvoices??invoices.filter(i=>i.status==='sent').length,paid:metrics?.paidInvoices??invoices.filter(i=>i.status==='paid').length,overdue:metrics?.overdueInvoices??invoices.filter(i=>i.status==='overdue').length,cancelled:invoices.filter(i=>i.status==='cancelled').length}

  if(loading)return(<div className="container mx-auto p-6 flex items-center justify-center h-64"><div className="text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600"/><p className="text-gray-500">Loading invoices...</p></div></div>)

  return (
    <>
      {showCreateModal&&<CreateInvoiceModal onClose={()=>setShowCreateModal(false)} onCreated={handleInvoiceCreated}/>}
      <div className="container mx-auto p-6">
        {actionMessage&&(
          <div className={`mb-4 p-3 rounded-lg text-sm flex items-center justify-between ${actionMessage.type==='success'?'bg-green-50 border border-green-200 text-green-800':actionMessage.type==='error'?'bg-red-50 border border-red-200 text-red-800':'bg-blue-50 border border-blue-200 text-blue-800'}`}>
            <span>{actionMessage.text}</span>
            <button onClick={()=>setActionMessage(null)} className="ml-4 opacity-60 hover:opacity-100">✕</button>
          </div>
        )}
        <div className="mb-8 flex items-start justify-between">
          <div><h1 className="text-3xl font-bold text-gray-900 mb-2">Invoice Management</h1><p className="text-gray-600">Create, manage, and track invoices</p></div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadInvoices}><RefreshCw className="h-4 w-4 mr-2"/>Refresh</Button>
            <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-2"/>Export</Button>
            <Button onClick={()=>setShowCreateModal(true)}><Plus className="h-4 w-4 mr-2"/>Create Invoice</Button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Invoices</CardTitle><FileText className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">{metrics?.totalInvoices??invoices.length}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Revenue</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">${((metrics?.totalRevenue??0)/100).toFixed(2)}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Paid</CardTitle><CheckCircle className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{metrics?.paidInvoices??0}</div><p className="text-xs text-muted-foreground">{metrics?.paymentRate?.toFixed(1)??0}% rate</p></CardContent></Card>
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
                {filteredInvoices.length===0?(
                  <div className="text-center py-16 text-gray-500">
                    <FileText className="h-10 w-10 mx-auto mb-3 opacity-20"/>
                    <p className="font-medium">No invoices found</p>
                    <p className="text-sm mt-1 mb-4">{invoices.length===0?'No payments yet.':'No invoices match filter.'}</p>
                    {invoices.length===0&&<Button onClick={()=>setShowCreateModal(true)}><Plus className="h-4 w-4 mr-2"/>Create first invoice</Button>}
                  </div>
                ):(
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b bg-gray-50">
                        <tr>
                          <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase"><input type="checkbox" className="rounded" checked={selectedInvoices.length===filteredInvoices.length&&filteredInvoices.length>0} onChange={e=>setSelectedInvoices(e.target.checked?filteredInvoices.map(i=>i.id):[])}/></th>
                          <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Invoice</th>
                          <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Customer</th>
                          <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredInvoices.map(invoice=>(
                          <tr key={invoice.id} className="hover:bg-gray-50">
                            <td className="p-4"><input type="checkbox" className="rounded" checked={selectedInvoices.includes(invoice.id)} onChange={()=>handleToggleSelect(invoice.id)}/></td>
                            <td className="p-4">
                              <div className="font-medium text-sm">{invoice.number}</div>
                              <div className="text-xs text-gray-400 truncate max-w-[140px]">{invoice.description}</div>
                              {(invoice as any).source==='manual'&&<span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded mt-0.5 inline-block">manual</span>}
                            </td>
                            <td className="p-4"><div className="font-medium text-sm">{invoice.customerName}</div><div className="text-xs text-gray-400">{invoice.customerEmail}</div></td>
                            <td className="p-4"><div className="font-medium text-sm">${(invoice.total/100).toFixed(2)}</div></td>
                            <td className="p-4"><StatusBadge status={invoice.status}/></td>
                            <td className="p-4 text-sm text-gray-600">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" onClick={()=>handleViewInvoice(invoice)} title="View"><Eye className="h-4 w-4"/></Button>
                                <Button variant="ghost" size="sm" onClick={()=>handleDownloadInvoice(invoice)} title="Download"><Download className="h-4 w-4"/></Button>
                                {invoice.status==='draft'&&<Button variant="ghost" size="sm" onClick={()=>handleSendInvoice(invoice.id)} title="Send"><Send className="h-4 w-4"/></Button>}
                                {(invoice.status==='sent'||invoice.status==='overdue')&&<Button variant="ghost" size="sm" onClick={()=>handleMarkPaid(invoice.id)} title="Mark Paid"><CheckCircle className="h-4 w-4"/></Button>}
                                {invoice.status==='overdue'&&<Button variant="ghost" size="sm" onClick={()=>handleSendReminder(invoice.id)} title="Reminder"><Bell className="h-4 w-4"/></Button>}
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
        {selectedInvoices.length>0&&(
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
    </>
  )
}