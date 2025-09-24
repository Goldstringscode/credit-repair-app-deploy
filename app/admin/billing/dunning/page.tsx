'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail, 
  CreditCard,
  RefreshCw,
  Play,
  Pause,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

interface DunningEvent {
  id: string
  subscriptionId: string
  customerId: string
  attemptNumber: number
  eventType: 'payment_failed' | 'payment_retry' | 'payment_succeeded' | 'subscription_canceled'
  amount: number
  currency: string
  failureReason?: string
  nextRetryAt?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}

interface DunningStatistics {
  totalEvents: number
  pendingEvents: number
  completedEvents: number
  failedEvents: number
  successRate: number
  averageResolutionTime: number
}

export default function DunningManagement() {
  const [events, setEvents] = useState<DunningEvent[]>([])
  const [statistics, setStatistics] = useState<DunningStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<DunningEvent | null>(null)

  useEffect(() => {
    loadDunningData()
  }, [])

  const loadDunningData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/billing/dunning')
      const data = await response.json()
      
      if (data.success) {
        setEvents(data.events || [])
        setStatistics(data.statistics || null)
      } else {
        setError(data.error || 'Failed to load dunning data')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRetryPayment = async (eventId: string) => {
    try {
      const response = await fetch(`/api/billing/dunning/${eventId}/retry`, {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        await loadDunningData()
      } else {
        setError(data.error || 'Failed to retry payment')
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleSuspendSubscription = async (eventId: string) => {
    try {
      const response = await fetch(`/api/billing/dunning/${eventId}/suspend`, {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        await loadDunningData()
      } else {
        setError(data.error || 'Failed to suspend subscription')
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleCancelSubscription = async (eventId: string) => {
    try {
      const response = await fetch(`/api/billing/dunning/${eventId}/cancel`, {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        await loadDunningData()
      } else {
        setError(data.error || 'Failed to cancel subscription')
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'payment_failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'payment_retry':
        return <RefreshCw className="h-4 w-4 text-yellow-500" />
      case 'payment_succeeded':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'subscription_canceled':
        return <Trash2 className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600">Pending</Badge>
      case 'processing':
        return <Badge variant="outline" className="text-blue-600">Processing</Badge>
      case 'completed':
        return <Badge variant="outline" className="text-green-600">Completed</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dunning Management</h1>
            <p className="text-gray-600">Manage failed payments and recovery processes</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dunning Management</h1>
            <p className="text-gray-600">Manage failed payments and recovery processes</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dunning Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadDunningData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dunning Management</h1>
          <p className="text-gray-600">Manage failed payments and recovery processes</p>
        </div>
        <Button onClick={loadDunningData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold">{statistics.totalEvents}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Events</p>
                  <p className="text-2xl font-bold text-yellow-600">{statistics.pendingEvents}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.successRate.toFixed(1)}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Resolution</p>
                  <p className="text-2xl font-bold">{statistics.averageResolutionTime.toFixed(1)}d</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dunning Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Dunning Events</CardTitle>
          <CardDescription>Recent payment failures and recovery attempts</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Next Retry</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getEventIcon(event.eventType)}
                      <span className="capitalize">{event.eventType.replace('_', ' ')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{event.subscriptionId}</div>
                      <div className="text-gray-500">Attempt {event.attemptNumber}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatCurrency(event.amount, event.currency)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(event.status)}
                  </TableCell>
                  <TableCell>
                    {formatDate(event.createdAt)}
                  </TableCell>
                  <TableCell>
                    {event.nextRetryAt ? formatDate(event.nextRetryAt) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {event.eventType === 'payment_failed' && event.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRetryPayment(event.id)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSuspendSubscription(event.id)}
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancelSubscription(event.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Event Details Modal */}
      {selectedEvent && (
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>Detailed information about the selected dunning event</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Basic Information</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Event ID:</strong> {selectedEvent.id}</div>
                  <div><strong>Type:</strong> {selectedEvent.eventType}</div>
                  <div><strong>Status:</strong> {selectedEvent.status}</div>
                  <div><strong>Attempt:</strong> {selectedEvent.attemptNumber}</div>
                  <div><strong>Amount:</strong> {formatCurrency(selectedEvent.amount, selectedEvent.currency)}</div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Timing</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Created:</strong> {formatDate(selectedEvent.createdAt)}</div>
                  <div><strong>Updated:</strong> {formatDate(selectedEvent.updatedAt)}</div>
                  <div><strong>Next Retry:</strong> {selectedEvent.nextRetryAt ? formatDate(selectedEvent.nextRetryAt) : 'N/A'}</div>
                </div>
              </div>
            </div>
            {selectedEvent.failureReason && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Failure Reason</h4>
                <p className="text-sm text-gray-600">{selectedEvent.failureReason}</p>
              </div>
            )}
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Metadata</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(selectedEvent.metadata, null, 2)}
              </pre>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setSelectedEvent(null)} variant="outline">
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


