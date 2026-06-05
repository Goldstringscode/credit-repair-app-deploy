'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Shield, CheckCircle, AlertTriangle, Clock, FileText, Users, CreditCard, Mail, RefreshCw, Loader2 } from 'lucide-react'

interface ComplianceStatus {
  gdpr: { requests: number; completed: number; pending: number; complianceRate: number }
  fcra: { disputes: number; freeReports: number; resolved: number; complianceRate: number }
  ccpa: { requests: number; completed: number; pending: number; complianceRate: number }
  hipaa: { requests: number; completed: number; breaches: number; complianceRate: number }
  pci: { cards: number; transactions: number; vulnerabilities: number; complianceRate: number }
  retention: { totalRecords: number; expired: number; deleted: number; exempt: number; complianceRate: number }
  audit: { totalEvents: number; criticalEvents: number; highRiskEvents: number; complianceRate: number }
}

export default function ComplianceDashboard() {
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [auditLog, setAuditLog] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/compliance')
      const data = await res.json()
      if (data.success && data.data) {
        setComplianceStatus(data.data.compliance)
        setAuditLog(data.data.auditLog || [])
        setSummary(data.data.summary || null)
      } else { setError(data.error || 'Failed to load compliance data') }
    } catch (err: any) { setError(err.message) }
    finally { setLoading(false); setRefreshing(false) }
  }

  useEffect(() => { loadData() }, [])

  const handleGDPRRequest = (requestType: string) => {
    alert('GDPR ' + requestType.replace(/_/g, ' ') + ': Data rights requests are managed through user profile settings.')
  }
  const handleFCRARequest = (action: string) => {
    if (action === 'dispute') { window.location.href = '/dashboard/disputes/new' }
    else { alert('FCRA: Direct users to their dispute dashboard for formal requests.') }
  }
  const handleCCPARequest = (requestType: string) => {
    alert('CCPA ' + requestType.replace(/_/g, ' ') + ': Managed through Account Settings.')
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-500">Loading compliance data...</p>
        </div>
      </div>
    )
  }

  const cs = complianceStatus

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Compliance Dashboard</h1>
          <p className="text-gray-600">Monitor and manage regulatory compliance across all frameworks</p>
          {summary && <p className="text-xs text-gray-400 mt-1">Last updated: {new Date(summary.lastUpdated).toLocaleString()} · {summary.totalUsers} users · {summary.totalDisputes} disputes</p>}
        </div>
        <Button variant="outline" size="sm" onClick={() => loadData(true)} disabled={refreshing}>
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}Refresh
        </Button>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"><AlertTriangle className="h-4 w-4 inline mr-2" />{error}</div>}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="gdpr">GDPR</TabsTrigger>
          <TabsTrigger value="fcra">FCRA</TabsTrigger>
          <TabsTrigger value="ccpa">CCPA</TabsTrigger>
          <TabsTrigger value="hipaa">HIPAA</TabsTrigger>
          <TabsTrigger value="pci">PCI DSS</TabsTrigger>
          <TabsTrigger value="retention">Data Retention</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'FCRA', value: cs?.fcra.complianceRate, sub: cs?.fcra.disputes + ' disputes' },
              { label: 'PCI DSS', value: cs?.pci.complianceRate, sub: cs?.pci.transactions + ' transactions' },
              { label: 'GDPR', value: cs?.gdpr.complianceRate, sub: cs?.gdpr.requests + ' users' },
              { label: 'CCPA', value: cs?.ccpa.complianceRate, sub: '0 pending requests' },
            ].map(item => (
              <Card key={item.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{item.label} Compliance</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={"text-2xl font-bold " + ((item.value ?? 100) >= 90 ? 'text-green-600' : (item.value ?? 100) >= 70 ? 'text-yellow-600' : 'text-red-600')}>
                    {item.value ?? 100}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{item.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Alerts</CardTitle>
                <CardDescription>Active notifications based on real data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {cs && cs.fcra.disputes > 0 ? (
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={cs.fcra.complianceRate >= 90 ? 'text-green-600 border-green-600' : 'text-yellow-600 border-yellow-600'}>
                      {cs.fcra.complianceRate >= 90 ? 'Good' : 'Review'}
                    </Badge>
                    <p className="text-sm">FCRA: {cs.fcra.resolved} of {cs.fcra.disputes} disputes resolved ({cs.fcra.complianceRate}%)</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-green-600 border-green-600">Good</Badge>
                    <p className="text-sm">No active disputes — FCRA compliance at 100%</p>
                  </div>
                )}
                {cs && cs.pci.transactions > 0 && (
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={cs.pci.complianceRate >= 95 ? 'text-green-600 border-green-600' : 'text-yellow-600 border-yellow-600'}>
                      {cs.pci.complianceRate >= 95 ? 'Good' : 'Review'}
                    </Badge>
                    <p className="text-sm">PCI DSS: {cs.pci.cards} of {cs.pci.transactions} payments succeeded</p>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-blue-600 border-blue-600">Info</Badge>
                  <p className="text-sm">GDPR & CCPA: {cs?.gdpr.requests ?? 0} users — 0 pending data rights requests</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Compliance Activity</CardTitle>
                <CardDescription>Latest events from real data</CardDescription>
              </CardHeader>
              <CardContent>
                {auditLog.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No compliance events yet.</p>
                ) : (
                  <div className="space-y-3 max-h-56 overflow-y-auto">
                    {auditLog.slice(0, 8).map((event: any) => (
                      <div key={event.id} className="flex items-start gap-3">
                        {event.status === 'compliant' ? <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" /> : <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{event.description}</p>
                          <span className="text-xs text-gray-400">{event.category} · {new Date(event.timestamp).toLocaleDateString()}</span>
                        </div>
                        <span className={"text-xs px-1.5 py-0.5 rounded flex-shrink-0 " + (event.status === 'compliant' ? 'bg-green-100 text-green-700' : event.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700')}>{event.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gdpr" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardHeader><CardTitle className="text-sm">Registered Users</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{cs?.gdpr.requests ?? 0}</div><p className="text-xs text-muted-foreground">Total data subjects</p></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Active Accounts</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{cs?.gdpr.completed ?? 0}</div><p className="text-xs text-muted-foreground">With active access</p></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Pending Requests</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{cs?.gdpr.pending ?? 0}</div><p className="text-xs text-muted-foreground">Erasure / export</p></CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle>GDPR Data Subject Rights</CardTitle><CardDescription>All {cs?.gdpr.requests ?? 0} users — {cs?.gdpr.pending ?? 0} pending requests</CardDescription></CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => handleGDPRRequest('data_access')}>Process Data Access</Button>
              <Button variant="outline" onClick={() => handleGDPRRequest('data_erasure')}>Process Erasure</Button>
              <Button variant="outline" onClick={() => handleGDPRRequest('data_portability')}>Data Portability</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fcra" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardHeader><CardTitle className="text-sm">Total Disputes</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{cs?.fcra.disputes ?? 0}</div><p className="text-xs text-muted-foreground">Credit disputes filed</p></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Resolved</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{cs?.fcra.resolved ?? 0}</div></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Compliance Rate</CardTitle></CardHeader><CardContent><div className={"text-2xl font-bold " + ((cs?.fcra.complianceRate ?? 100) >= 90 ? 'text-green-600' : 'text-yellow-600')}>{cs?.fcra.complianceRate ?? 100}%</div></CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle>FCRA Dispute Management</CardTitle><CardDescription>{cs?.fcra.disputes ?? 0} disputes in system — Fair Credit Reporting Act</CardDescription></CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => handleFCRARequest('dispute')}>File New Dispute</Button>
              <Button variant="outline" onClick={() => handleFCRARequest('report')}>Request Free Report</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ccpa" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardHeader><CardTitle className="text-sm">Users</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{cs?.ccpa.requests ?? 0}</div></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Pending</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{cs?.ccpa.pending ?? 0}</div></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Compliance</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{cs?.ccpa.complianceRate ?? 100}%</div></CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle>CCPA Consumer Rights</CardTitle><CardDescription>{cs?.ccpa.pending ?? 0} pending requests</CardDescription></CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => handleCCPARequest('right_to_know')}>Right to Know</Button>
              <Button variant="outline" onClick={() => handleCCPARequest('right_to_delete')}>Right to Delete</Button>
              <Button variant="outline" onClick={() => handleCCPARequest('opt_out')}>Opt-Out of Sale</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hipaa" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>HIPAA Status</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg mb-4">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <div>
                  <p className="font-medium text-green-800">HIPAA Not Applicable</p>
                  <p className="text-sm text-green-700">This application does not process Protected Health Information. No HIPAA obligations apply.</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Card><CardContent className="pt-4"><div className="text-2xl font-bold">0</div><p className="text-xs text-muted-foreground">PHI records</p></CardContent></Card>
                <Card><CardContent className="pt-4"><div className="text-2xl font-bold text-green-600">0</div><p className="text-xs text-muted-foreground">Breaches</p></CardContent></Card>
                <Card><CardContent className="pt-4"><div className="text-2xl font-bold text-green-600">100%</div><p className="text-xs text-muted-foreground">Compliance</p></CardContent></Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pci" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardHeader><CardTitle className="text-sm">Total Transactions</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{cs?.pci.transactions ?? 0}</div></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Succeeded</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{cs?.pci.cards ?? 0}</div></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Compliance Rate</CardTitle></CardHeader><CardContent><div className={"text-2xl font-bold " + ((cs?.pci.complianceRate ?? 100) >= 95 ? 'text-green-600' : 'text-yellow-600')}>{cs?.pci.complianceRate ?? 100}%</div></CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle>PCI DSS Payment Security</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-500" />
                <div>
                  <p className="font-medium text-blue-800">Stripe Handles PCI Compliance</p>
                  <p className="text-sm text-blue-700">Card data is processed by Stripe (PCI DSS Level 1). We never store raw card numbers.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardHeader><CardTitle className="text-sm">Total Records</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{cs?.retention.totalRecords ?? 0}</div></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Expired</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">{cs?.retention.expired ?? 0}</div></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Deleted</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{cs?.retention.deleted ?? 0}</div></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Compliance</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{cs?.retention.complianceRate ?? 100}%</div></CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Data Retention Policies</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: 'User accounts', period: '7 years after closure', icon: Users },
                  { label: 'Payment records', period: '7 years (IRS)', icon: CreditCard },
                  { label: 'Dispute records', period: '7 years (FCRA)', icon: FileText },
                  { label: 'Certified mail', period: '3 years', icon: Mail },
                  { label: 'Email campaigns', period: '2 years', icon: Mail },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{item.period}</span>
                      <Badge variant="outline" className="text-green-600 border-green-600 text-xs">Compliant</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}