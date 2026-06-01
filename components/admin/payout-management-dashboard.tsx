'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DollarSign, Mail, Clock, XCircle, Search, TrendingUp, RefreshCw, CreditCard } from 'lucide-react'

interface Transaction {
  id: string
  type: 'subscription' | 'certified_mail'
  category: string
  userId: string
  userName: string
  userEmail: string
  description: string
  status: string
  amount: number
  currency: string
  stripePaymentIntentId: string
  trackingNumber: string
  bureauName: string
  serviceTier?: string
  createdAt: string
  sentAt: string | null
}

interface Summary {
  totalRevenue: number
  monthlyRevenue: number
  lastMonthRevenue: number
  subscriptionRevenue: number
  certMailRevenue: number
  totalTransactions: number
  paidTransactions: number
  pendingTransactions: number
  failedTransactions: number
  subscriptionCount: number
  certMailCount: number
}

const STATUS_COLORS: Record<string, string> = {
  succeeded:       'bg-green-100 text-green-800',
  sent:            'bg-green-100 text-green-800',
  delivered:       'bg-green-100 text-green-800',
  completed:       'bg-green-100 text-green-800',
  processing:      'bg-blue-100 text-blue-800',
  pending_payment: 'bg-yellow-100 text-yellow-800',
  pending:         'bg-yellow-100 text-yellow-800',
  failed:          'bg-red-100 text-red-800',
  cancelled:       'bg-gray-100 text-gray-600',
}

const TYPE_COLORS: Record<string, string> = {
  subscription:  'bg-purple-100 text-purple-700',
  certified_mail: 'bg-blue-100 text-blue-700',
}

function fmt(n: number) {
  return '$' + (n||0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function fmtDate(s: string | null) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function PayoutManagementDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const load = () => {
    setLoading(true); setError(null)
    fetch('/api/admin/payouts')
      .then(r => r.json())
      .then(d => {
        if (d.success) { setTransactions(d.transactions || []); setSummary(d.summary || null) }
        else setError(d.error || 'Failed to load payouts')
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = transactions.filter(t => {
    const q = search.toLowerCase()
    const matchSearch = !search ||
      t.userName?.toLowerCase().includes(q) ||
      t.userEmail?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.trackingNumber?.toLowerCase().includes(q) ||
      t.bureauName?.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || t.status === statusFilter
    const matchType = typeFilter === 'all' || t.type === typeFilter
    return matchSearch && matchStatus && matchType
  })

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-4" />
        <p className="text-gray-500">Loading payment data...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <XCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
        <p className="text-red-600 font-medium mb-3">{error}</p>
        <Button onClick={load} size="sm"><RefreshCw className="h-4 w-4 mr-2" />Retry</Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{fmt(summary?.totalRevenue || 0)}</p>
                <p className="text-xs text-gray-400 mt-1">All time</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500 opacity-70" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">This Month</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{fmt(summary?.monthlyRevenue || 0)}</p>
                <p className="text-xs text-gray-400 mt-1">Last month: {fmt(summary?.lastMonthRevenue || 0)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500 opacity-70" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Subscriptions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{fmt(summary?.subscriptionRevenue || 0)}</p>
                <p className="text-xs text-gray-400 mt-1">{summary?.subscriptionCount || 0} payments</p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-500 opacity-70" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Certified Mail</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{fmt(summary?.certMailRevenue || 0)}</p>
                <p className="text-xs text-gray-400 mt-1">{summary?.certMailCount || 0} letters</p>
              </div>
              <Mail className="h-8 w-8 text-blue-500 opacity-70" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base">All Transactions ({filtered.length})</CardTitle>
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />Refresh
            </Button>
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input placeholder="Search name, email, description..." className="pl-9 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="all">All Types</option>
              <option value="subscription">Subscriptions</option>
              <option value="certified_mail">Certified Mail</option>
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="all">All Status</option>
              <option value="succeeded">Succeeded</option>
              <option value="sent">Sent</option>
              <option value="processing">Processing</option>
              <option value="pending_payment">Pending Payment</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <DollarSign className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No transactions found</p>
              <p className="text-sm mt-1">Transactions appear here when users purchase subscriptions or send certified mail</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-y border-gray-200">
                  <tr>
                    {['Type','User','Description','Amount','Status','Date'].map(h=>(
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <Badge className={'text-xs ' + (TYPE_COLORS[t.type] || 'bg-gray-100 text-gray-600')}>
                          {t.category}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{t.userName}</p>
                        <p className="text-xs text-gray-400">{t.userEmail}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-700">{t.description}</p>
                        {t.trackingNumber && (
                          <a href={'https://tools.usps.com/go/TrackConfirmAction?tLabels='+t.trackingNumber}
                            target="_blank" rel="noopener noreferrer"
                            className="text-xs font-mono text-blue-500 hover:underline">
                            {t.trackingNumber}
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{fmt(t.amount)}</td>
                      <td className="px-4 py-3">
                        <Badge className={'text-xs ' + (STATUS_COLORS[t.status] || 'bg-gray-100 text-gray-600')}>
                          {(t.status||'unknown').replace(/_/g,' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(t.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400 flex items-center justify-between">
              <span>Showing {filtered.length} of {transactions.length} transactions</span>
              <span className="font-medium text-gray-600">
                Filtered total: {fmt(filtered.filter(t=>['succeeded','sent','delivered','completed'].includes(t.status)).reduce((s,t)=>s+t.amount,0))}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
