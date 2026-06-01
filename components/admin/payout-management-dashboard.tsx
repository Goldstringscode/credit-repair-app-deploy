'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DollarSign, Mail, Clock, XCircle, Search, TrendingUp, RefreshCw } from 'lucide-react'

interface Transaction {
  id: string
  userId: string
  userName: string
  userEmail: string
  bureauName: string
  serviceTier: string
  status: string
  amount: number
  amountCents: number
  trackingNumber: string
  stripePaymentIntentId: string
  createdAt: string
  sentAt: string | null
}

interface Summary {
  totalRevenue: number
  monthlyRevenue: number
  lastMonthRevenue: number
  totalTransactions: number
  paidTransactions: number
  pendingTransactions: number
  failedTransactions: number
}

const STATUS_COLORS: Record<string, string> = {
  sent:            'bg-green-100 text-green-800',
  delivered:       'bg-green-100 text-green-800',
  completed:       'bg-green-100 text-green-800',
  processing:      'bg-blue-100 text-blue-800',
  pending_payment: 'bg-yellow-100 text-yellow-800',
  failed:          'bg-red-100 text-red-800',
  cancelled:       'bg-gray-100 text-gray-600',
}

function fmt(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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

  const load = () => {
    setLoading(true)
    setError(null)
    fetch('/api/admin/payouts')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setTransactions(d.transactions || [])
          setSummary(d.summary || null)
        } else {
          setError(d.error || 'Failed to load payouts')
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = transactions.filter(t => {
    const matchSearch = !search ||
      t.userName?.toLowerCase().includes(search.toLowerCase()) ||
      t.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
      t.bureauName?.toLowerCase().includes(search.toLowerCase()) ||
      t.trackingNumber?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || t.status === statusFilter
    return matchSearch && matchStatus
  })

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-4" />
        <p className="text-gray-500">Loading payout data...</p>
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
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{fmt(summary?.totalRevenue || 0)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">This Month</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{fmt(summary?.monthlyRevenue || 0)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Letters Sent</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{summary?.paidTransactions || 0}</p>
              </div>
              <Mail className="h-8 w-8 text-purple-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Pending</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{summary?.pendingTransactions || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Certified Mail Transactions</CardTitle>
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />Refresh
            </Button>
          </div>
          <div className="flex gap-3 mt-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input placeholder="Search by name, email, bureau, tracking..." className="pl-9 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="all">All Status</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="processing">Processing</option>
              <option value="pending_payment">Pending Payment</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Mail className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-y border-gray-200">
                  <tr>
                    {['User','Bureau','Amount','Status','Tracking','Date'].map(h=>(
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{t.userName || 'Unknown'}</p>
                        <p className="text-xs text-gray-400">{t.userEmail}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-700">{t.bureauName}</p>
                        <p className="text-xs text-gray-400 capitalize">{t.serviceTier}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{fmt(t.amount || 0)}</td>
                      <td className="px-4 py-3">
                        <Badge className={'text-xs font-medium ' + (STATUS_COLORS[t.status] || 'bg-gray-100 text-gray-600')}>
                          {t.status?.replace(/_/g,' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {t.trackingNumber ? (
                          <a href={'https://tools.usps.com/go/TrackConfirmAction?tLabels='+t.trackingNumber}
                            target="_blank" rel="noopener noreferrer"
                            className="text-xs font-mono text-blue-600 hover:underline">
                            {t.trackingNumber}
                          </a>
                        ) : <span className="text-xs text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{fmtDate(t.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
              Showing {filtered.length} of {transactions.length} transactions
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
