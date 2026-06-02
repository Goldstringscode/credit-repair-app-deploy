'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DollarSign, Users, TrendingUp, CreditCard, Search, RefreshCw, Mail, XCircle } from 'lucide-react'

function fmt(n:number){ return '$'+(n||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}) }
function fmtDate(s:string|null){ if(!s)return'—'; return new Date(s).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) }

const PLAN_COLORS:Record<string,string>={ basic:'bg-blue-100 text-blue-700', professional:'bg-purple-100 text-purple-700', premium:'bg-gold-100 text-yellow-700', free:'bg-gray-100 text-gray-600', enterprise:'bg-indigo-100 text-indigo-700' }
const STATUS_COLORS:Record<string,string>={ active:'bg-green-100 text-green-800', inactive:'bg-gray-100 text-gray-600', cancelled:'bg-red-100 text-red-800', trialing:'bg-blue-100 text-blue-800', past_due:'bg-orange-100 text-orange-800', succeeded:'bg-green-100 text-green-800', sent:'bg-green-100 text-green-800', pending_payment:'bg-yellow-100 text-yellow-800', failed:'bg-red-100 text-red-800' }

export default function AdminBillingPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const load = () => {
    setLoading(true); setError(null)
    fetch('/api/admin/billing')
      .then(r=>r.json())
      .then(d=>{ if(d.success)setData(d); else setError(d.error||'Failed to load') })
      .catch(e=>setError(e.message))
      .finally(()=>setLoading(false))
  }
  useEffect(()=>{ load() },[])

  const filteredSubs = (data?.subscriptions||[]).filter((s:any)=>{
    const q=search.toLowerCase()
    const matchSearch=!search||s.userName?.toLowerCase().includes(q)||s.userEmail?.toLowerCase().includes(q)
    const matchPlan=planFilter==='all'||s.plan===planFilter
    const matchStatus=statusFilter==='all'||s.status===statusFilter
    return matchSearch&&matchPlan&&matchStatus
  })

  const filteredPayments = (data?.payments||[]).filter((p:any)=>{
    const q=search.toLowerCase()
    return !search||p.userName?.toLowerCase().includes(q)||p.userEmail?.toLowerCase().includes(q)||p.description?.toLowerCase().includes(q)
  })

  if(loading) return(
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-4"/>
        <p className="text-gray-500">Loading billing data...</p>
      </div>
    </div>
  )
  if(error) return(
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <XCircle className="h-10 w-10 text-red-400 mx-auto mb-3"/>
        <p className="text-red-600 mb-3">{error}</p>
        <Button onClick={load} size="sm"><RefreshCw className="h-4 w-4 mr-2"/>Retry</Button>
      </div>
    </div>
  )

  const s = data?.summary || {}

  return(
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
          <p className="text-sm text-gray-500 mt-1">All subscription and payment activity</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-3.5 w-3.5 mr-1.5"/>Refresh</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-5">
          <div className="flex justify-between items-center">
            <div><p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Total Revenue</p><p className="text-2xl font-bold mt-1">{fmt(s.totalRevenue||0)}</p><p className="text-xs text-gray-400 mt-1">All time</p></div>
            <DollarSign className="h-8 w-8 text-green-500 opacity-70"/>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex justify-between items-center">
            <div><p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">This Month</p><p className="text-2xl font-bold mt-1">{fmt(s.monthlyRevenue||0)}</p><p className="text-xs text-gray-400 mt-1">Last: {fmt(s.lastMonthRevenue||0)}</p></div>
            <TrendingUp className="h-8 w-8 text-blue-500 opacity-70"/>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex justify-between items-center">
            <div><p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Active Subscribers</p><p className="text-2xl font-bold mt-1">{s.activeSubscribers||0}</p><p className="text-xs text-gray-400 mt-1">{s.freeUsers||0} on free plan</p></div>
            <Users className="h-8 w-8 text-purple-500 opacity-70"/>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex justify-between items-center">
            <div><p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">New This Month</p><p className="text-2xl font-bold mt-1">{s.newThisMonth||0}</p><p className="text-xs text-gray-400 mt-1">Total: {s.totalUsers||0} users</p></div>
            <CreditCard className="h-8 w-8 text-indigo-500 opacity-70"/>
          </div>
        </CardContent></Card>
      </div>

      {/* Plan breakdown */}
      {s.planCounts && Object.keys(s.planCounts).length>0 && (
        <Card><CardHeader><CardTitle className="text-sm">Users by Plan</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(s.planCounts).map(([plan,count]:any)=>(
                <div key={plan} className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-3 border">
                  <Badge className={PLAN_COLORS[plan]||'bg-gray-100 text-gray-600'}>{plan}</Badge>
                  <span className="font-bold text-gray-900">{count}</span>
                  <span className="text-xs text-gray-400">users</span>
                  {s.planRevenue?.[plan]&&<span className="text-xs text-green-600 font-medium">{fmt(s.planRevenue[plan])}</span>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="subscriptions">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
          <TabsList>
            <TabsTrigger value="subscriptions">Subscriptions ({filteredSubs.length})</TabsTrigger>
            <TabsTrigger value="payments">Payments ({filteredPayments.length})</TabsTrigger>
          </TabsList>
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400"/>
              <Input placeholder="Search..." className="pl-9 text-sm w-52" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <select value={planFilter} onChange={e=>setPlanFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="all">All Plans</option>
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="professional">Professional</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </select>
            <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="cancelled">Cancelled</option>
              <option value="past_due">Past Due</option>
            </select>
          </div>
        </div>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="mt-4">
          <Card><CardContent className="p-0">
            {filteredSubs.length===0?(
              <div className="text-center py-12 text-gray-400">
                <Users className="h-10 w-10 mx-auto mb-3 opacity-30"/>
                <p>No subscriptions found</p>
              </div>
            ):(
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-y border-gray-200">
                    <tr>{['User','Plan','Status','Stripe Customer','Joined'].map(h=>(
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredSubs.map((s:any)=>(
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3"><p className="font-medium text-gray-900">{s.userName}</p><p className="text-xs text-gray-400">{s.userEmail}</p></td>
                        <td className="px-4 py-3"><Badge className={PLAN_COLORS[s.plan]||'bg-gray-100 text-gray-600'}>{s.plan||'free'}</Badge></td>
                        <td className="px-4 py-3"><Badge className={STATUS_COLORS[s.status]||'bg-gray-100 text-gray-600'}>{s.status||'inactive'}</Badge></td>
                        <td className="px-4 py-3 text-xs font-mono text-gray-500">{s.stripeCustomerId||'—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{fmtDate(s.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-4 py-3 border-t text-xs text-gray-400">Showing {filteredSubs.length} of {data?.subscriptions?.length} subscriptions</div>
              </div>
            )}
          </CardContent></Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="mt-4">
          <Card><CardContent className="p-0">
            {filteredPayments.length===0?(
              <div className="text-center py-12 text-gray-400">
                <DollarSign className="h-10 w-10 mx-auto mb-3 opacity-30"/>
                <p>No payments found</p>
              </div>
            ):(
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-y border-gray-200">
                    <tr>{['Type','User','Description','Amount','Status','Date'].map(h=>(
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredPayments.map((p:any)=>(
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3"><Badge className={p.type==='subscription'?'bg-purple-100 text-purple-700':'bg-blue-100 text-blue-700'}>{p.type==='subscription'?'Subscription':'Certified Mail'}</Badge></td>
                        <td className="px-4 py-3"><p className="font-medium text-gray-900">{p.userName}</p><p className="text-xs text-gray-400">{p.userEmail}</p></td>
                        <td className="px-4 py-3 text-gray-700">{p.description}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900">{fmt(p.amount)}</td>
                        <td className="px-4 py-3"><Badge className={STATUS_COLORS[p.status]||'bg-gray-100 text-gray-600'}>{(p.status||'unknown').replace(/_/g,' ')}</Badge></td>
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(p.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-4 py-3 border-t text-xs text-gray-400 flex justify-between">
                  <span>Showing {filteredPayments.length} of {data?.payments?.length} payments</span>
                  <span className="font-medium text-gray-600">Total: {fmt(filteredPayments.filter((p:any)=>['succeeded','sent','delivered','completed'].includes(p.status)).reduce((s:number,p:any)=>s+p.amount,0))}</span>
                </div>
              </div>
            )}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}