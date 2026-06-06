'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TrendingUp, Users, Target, AlertTriangle, CheckCircle,
  BarChart3, Activity, Download, RefreshCw, Loader2,
  CreditCard, FileText, Mail, TrendingDown,
} from "lucide-react"

interface AnalyticsData {
  overview: {
    totalUsers: number; activeUsers: number; newUsers: number
    totalDisputes: number; resolvedDisputes: number
    totalPayments: number; succeededPayments: number
    totalCertifiedMail: number; totalRevenue: string
    signupToDispute: number; disputeResolution: number
    signupToPayment: number; activeRate: number
  }
  funnel: Array<{ step: string; name: string; users: number; conversionRate: number; stepConversionRate: number }>
  events: Array<{ event: string; name: string; count: number; periodCount: number; trend: number }>
  dailyData: Array<{ date: string; users: number; disputes: number; revenue: number }>
  recommendations: Array<{ type: string; title: string; description: string; impact: string }>
  timeRange: { startDate: string; endDate: string; days: number }
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30d")
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAnalyticsData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/analytics?range=' + timeRange)
      const data = await res.json()
      if (data.success && data.data) {
        setAnalyticsData(data.data)
      } else {
        setError(data.error || 'Failed to load analytics')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { loadAnalyticsData() }, [timeRange])

  const handleExport = async () => {
    if (!analyticsData) return
    const blob = new Blob([JSON.stringify(analyticsData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'analytics-' + timeRange + '-' + new Date().toISOString().split('T')[0] + '.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-500">Loading analytics from database...</p>
        </div>
      </div>
    )
  }

  const d = analyticsData
  if (!d) return null

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Real-time insights from your Supabase database</p>
          <p className="text-xs text-gray-400 mt-1">Showing data for the last {d.timeRange.days} days</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => loadAnalyticsData(true)} disabled={refreshing}>
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />}Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />Export
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertTriangle className="h-4 w-4 inline mr-2" />{error}
        </div>
      )}

      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="events">Event Analytics</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{d.overview.totalUsers}</div>
                <p className="text-xs text-muted-foreground">{d.overview.newUsers} new this period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{d.overview.activeUsers}</div>
                <p className="text-xs text-muted-foreground">{d.overview.activeRate}% of total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Disputes Filed</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{d.overview.totalDisputes}</div>
                <p className="text-xs text-muted-foreground">{d.overview.resolvedDisputes} resolved ({d.overview.disputeResolution}%)</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${d.overview.totalRevenue}</div>
                <p className="text-xs text-muted-foreground">{d.overview.succeededPayments} successful payments</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Conversion Rates</CardTitle>
                <CardDescription>Real percentages from your actual user data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Active User Rate', value: d.overview.activeRate, desc: d.overview.activeUsers + ' of ' + d.overview.totalUsers + ' users active' },
                  { label: 'Signup to Dispute', value: d.overview.signupToDispute, desc: d.overview.totalDisputes + ' users filed disputes' },
                  { label: 'Dispute Resolution', value: d.overview.disputeResolution, desc: d.overview.resolvedDisputes + ' of ' + d.overview.totalDisputes + ' resolved' },
                  { label: 'Signup to Payment', value: d.overview.signupToPayment, desc: d.overview.succeededPayments + ' paying users' },
                ].map(item => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.label}</span>
                      <span className={item.value >= 50 ? 'text-green-600 font-bold' : item.value >= 20 ? 'text-yellow-600 font-bold' : 'text-red-600 font-bold'}>
                        {item.value}%
                      </span>
                    </div>
                    <Progress value={Math.min(item.value, 100)} className="h-2" />
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity Summary</CardTitle>
                <CardDescription>All counts from your database</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Registered Users', value: d.overview.totalUsers, icon: Users, color: 'text-blue-600' },
                  { label: 'Active Subscriptions', value: d.overview.activeUsers, icon: CheckCircle, color: 'text-green-600' },
                  { label: 'Credit Disputes', value: d.overview.totalDisputes, icon: FileText, color: 'text-purple-600' },
                  { label: 'Payments Processed', value: d.overview.totalPayments, icon: CreditCard, color: 'text-orange-600' },
                  { label: 'Certified Mail Sent', value: d.overview.totalCertifiedMail, icon: Mail, color: 'text-teal-600' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <item.icon className={"h-4 w-4 " + item.color} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <span className={"text-lg font-bold " + item.color}>{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Daily Activity (Last 7 Days)</CardTitle>
              <CardDescription>New users, disputes, and revenue by day</CardDescription>
            </CardHeader>
            <CardContent>
              {d.dailyData.every(day => day.users === 0 && day.disputes === 0 && day.revenue === 0) ? (
                <p className="text-sm text-gray-500 text-center py-8">No activity in the last 7 days yet.</p>
              ) : (
                <div className="space-y-3">
                  {d.dailyData.map(day => (
                    <div key={day.date} className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-24 flex-shrink-0">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex-1 flex gap-3">
                        <div className="flex items-center gap-1">
                          <div className="h-4 bg-blue-200 rounded min-w-0" style={{ width: Math.max(day.users * 24, day.users > 0 ? 6 : 0) + 'px' }} />
                          {day.users > 0 && <span className="text-xs text-gray-500">{day.users}u</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-4 bg-purple-200 rounded" style={{ width: Math.max(day.disputes * 24, day.disputes > 0 ? 6 : 0) + 'px' }} />
                          {day.disputes > 0 && <span className="text-xs text-gray-500">{day.disputes}d</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-4 bg-green-200 rounded" style={{ width: Math.max(day.revenue * 2, day.revenue > 0 ? 6 : 0) + 'px' }} />
                          {day.revenue > 0 && <span className="text-xs text-gray-500">${day.revenue.toFixed(0)}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-4 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-200 rounded inline-block" /> Users</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-purple-200 rounded inline-block" /> Disputes</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-200 rounded inline-block" /> Revenue</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Conversion Funnel</CardTitle>
              <CardDescription>Real progression based on {d.overview.totalUsers} actual users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {d.funnel.map((step, idx) => (
                <div key={step.step} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</div>
                      <div>
                        <p className="font-medium text-sm">{step.name}</p>
                        <p className="text-xs text-gray-400">{step.users} users</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={"font-bold text-sm " + (step.conversionRate >= 50 ? 'text-green-600' : step.conversionRate >= 20 ? 'text-yellow-600' : 'text-red-600')}>
                        {step.conversionRate}% overall
                      </p>
                      {idx > 0 && <p className="text-xs text-gray-400">{step.stepConversionRate}% from prev</p>}
                    </div>
                  </div>
                  <Progress value={Math.min(step.conversionRate, 100)} className="h-3" />
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardHeader><CardTitle className="text-sm">Signup to Active</CardTitle></CardHeader><CardContent><div className={"text-2xl font-bold " + (d.overview.activeRate >= 50 ? 'text-green-600' : 'text-yellow-600')}>{d.overview.activeRate}%</div><p className="text-xs text-muted-foreground">{d.overview.activeUsers} of {d.overview.totalUsers}</p></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Dispute Resolution</CardTitle></CardHeader><CardContent><div className={"text-2xl font-bold " + (d.overview.disputeResolution >= 80 ? 'text-green-600' : 'text-yellow-600')}>{d.overview.disputeResolution}%</div><p className="text-xs text-muted-foreground">{d.overview.resolvedDisputes} of {d.overview.totalDisputes}</p></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Signup to Payment</CardTitle></CardHeader><CardContent><div className={"text-2xl font-bold " + (d.overview.signupToPayment >= 20 ? 'text-green-600' : 'text-yellow-600')}>{d.overview.signupToPayment}%</div><p className="text-xs text-muted-foreground">{d.overview.succeededPayments} paying users</p></CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Analytics</CardTitle>
              <CardDescription>Real counts from your database tables</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {d.events.map(event => (
                  <div key={event.event} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{event.name}</p>
                        <p className="text-xs text-gray-400">{event.count} total · {event.periodCount} this period</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg">{event.count}</span>
                      {event.trend !== 0 && (
                        <Badge variant="outline" className={event.trend > 0 ? 'text-green-600 border-green-300' : 'text-red-600 border-red-300'}>
                          {event.trend > 0 ? <TrendingUp className="h-3 w-3 mr-1 inline" /> : <TrendingDown className="h-3 w-3 mr-1 inline" />}
                          {Math.abs(event.trend)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Recommendations</CardTitle>
              <CardDescription>Data-driven insights based on your actual metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {d.recommendations.map((rec, idx) => (
                <div key={idx} className={"p-4 rounded-lg border-l-4 " + (rec.type === 'warning' ? 'bg-yellow-50 border-yellow-400' : rec.type === 'success' ? 'bg-green-50 border-green-400' : 'bg-blue-50 border-blue-400')}>
                  <div className="flex items-start gap-3">
                    {rec.type === 'warning' ? <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" /> : rec.type === 'success' ? <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" /> : <Target className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{rec.title}</p>
                        <Badge variant="outline" className={"text-xs " + (rec.impact === 'high' ? 'text-red-600 border-red-300' : rec.impact === 'medium' ? 'text-yellow-600 border-yellow-300' : 'text-gray-500 border-gray-300')}>{rec.impact} impact</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardHeader><CardTitle className="text-sm">Active Rate</CardTitle></CardHeader><CardContent><div className={"text-2xl font-bold " + (d.overview.activeRate >= 60 ? 'text-green-600' : d.overview.activeRate >= 30 ? 'text-yellow-600' : 'text-red-600')}>{d.overview.activeRate}%</div><p className="text-xs text-muted-foreground">Target: 60%+</p><Progress value={Math.min(d.overview.activeRate / 60 * 100, 100)} className="h-2 mt-2" /></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Dispute Resolution</CardTitle></CardHeader><CardContent><div className={"text-2xl font-bold " + (d.overview.disputeResolution >= 80 ? 'text-green-600' : d.overview.disputeResolution >= 50 ? 'text-yellow-600' : 'text-red-600')}>{d.overview.disputeResolution}%</div><p className="text-xs text-muted-foreground">Target: 80%+</p><Progress value={Math.min(d.overview.disputeResolution / 80 * 100, 100)} className="h-2 mt-2" /></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Payment Success</CardTitle></CardHeader><CardContent><div className={"text-2xl font-bold " + (d.overview.totalPayments === 0 || d.overview.succeededPayments / d.overview.totalPayments >= 0.9 ? 'text-green-600' : 'text-yellow-600')}>{d.overview.totalPayments > 0 ? Math.round(d.overview.succeededPayments / d.overview.totalPayments * 100) : 100}%</div><p className="text-xs text-muted-foreground">Target: 90%+</p><Progress value={d.overview.totalPayments > 0 ? Math.min(d.overview.succeededPayments / d.overview.totalPayments * 100, 100) : 100} className="h-2 mt-2" /></CardContent></Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}