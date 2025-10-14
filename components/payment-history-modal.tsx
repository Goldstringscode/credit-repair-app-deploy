import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Subscription } from '@/lib/subscription-service'
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Search, 
  Filter,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  FileText,
  Loader2
} from 'lucide-react'

interface PaymentHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  subscription: Subscription | null
}

interface PaymentTransaction {
  id: string
  date: string
  amount: number
  currency: string
  status: 'succeeded' | 'failed' | 'pending' | 'refunded'
  paymentMethod: string
  description: string
  transactionId: string
  invoiceId?: string
  failureReason?: string
  refundAmount?: number
  refundDate?: string
}

// Mock payment data - in real app, this would come from API
const generateMockPayments = (subscription: Subscription): PaymentTransaction[] => {
  const payments: PaymentTransaction[] = []
  const startDate = new Date(subscription.createdAt)
  const currentDate = new Date()
  
  // Generate payments for each billing cycle
  let paymentDate = new Date(startDate)
  let paymentNumber = 1
  
  while (paymentDate <= currentDate) {
    const isFailed = Math.random() < 0.1 // 10% chance of failure
    const isRefunded = Math.random() < 0.05 // 5% chance of refund
    
    payments.push({
      id: `pay_${subscription.id}_${paymentNumber}`,
      date: paymentDate.toISOString().split('T')[0],
      amount: subscription.amount,
      currency: subscription.currency,
      status: isFailed ? 'failed' : isRefunded ? 'refunded' : 'succeeded',
      paymentMethod: subscription.paymentMethod,
      description: `Payment for ${subscription.planName} - ${paymentDate.toLocaleDateString()}`,
      transactionId: `txn_${Math.random().toString(36).substr(2, 9)}`,
      invoiceId: `inv_${subscription.id}_${paymentNumber}`,
      failureReason: isFailed ? 'Card declined' : undefined,
      refundAmount: isRefunded ? subscription.amount * 0.5 : undefined,
      refundDate: isRefunded ? new Date(paymentDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined
    })
    
    // Move to next billing cycle
    if (subscription.billingCycle === 'month') {
      paymentDate.setMonth(paymentDate.getMonth() + 1)
    } else {
      paymentDate.setFullYear(paymentDate.getFullYear() + 1)
    }
    paymentNumber++
  }
  
  return payments.reverse() // Most recent first
}

export default function PaymentHistoryModal({
  isOpen,
  onClose,
  subscription
}: PaymentHistoryModalProps) {
  console.log('PaymentHistoryModal rendered with:', { isOpen, subscription: subscription?.id })
  const [payments, setPayments] = useState<PaymentTransaction[]>([])
  const [filteredPayments, setFilteredPayments] = useState<PaymentTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  useEffect(() => {
    if (subscription && isOpen) {
      setLoading(true)
      // Simulate API call
      setTimeout(() => {
        const mockPayments = generateMockPayments(subscription)
        setPayments(mockPayments)
        setFilteredPayments(mockPayments)
        setLoading(false)
      }, 1000)
    }
  }, [subscription, isOpen])

  useEffect(() => {
    let filtered = payments

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(payment => 
        payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const filterDate = new Date()
      
      switch (dateFilter) {
        case 'last30':
          filterDate.setDate(now.getDate() - 30)
          break
        case 'last90':
          filterDate.setDate(now.getDate() - 90)
          break
        case 'lastyear':
          filterDate.setFullYear(now.getFullYear() - 1)
          break
      }
      
      filtered = filtered.filter(payment => new Date(payment.date) >= filterDate)
    }

    setFilteredPayments(filtered)
  }, [payments, searchTerm, statusFilter, dateFilter])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      succeeded: { color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800 border-red-300', icon: XCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Clock },
      refunded: { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: RefreshCw }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.succeeded
    const Icon = config.icon

    return (
      <Badge className={`${config.color} border`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.toUpperCase()}
      </Badge>
    )
  }

  const formatCurrency = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const exportPayments = () => {
    const csvContent = [
      ['Date', 'Amount', 'Status', 'Payment Method', 'Transaction ID', 'Description'].join(','),
      ...filteredPayments.map(payment => [
        payment.date,
        payment.amount,
        payment.status,
        payment.paymentMethod,
        payment.transactionId,
        payment.description
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payment-history-${subscription?.customerName}-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0)
  const successfulPayments = filteredPayments.filter(p => p.status === 'succeeded').length
  const failedPayments = filteredPayments.filter(p => p.status === 'failed').length

  console.log('PaymentHistoryModal render - isOpen:', isOpen, 'subscription:', subscription?.id)
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            Payment History
          </DialogTitle>
          <DialogDescription>
            Transaction history for {subscription?.customerName} - {subscription?.planName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredPayments.length}</div>
                <p className="text-xs text-muted-foreground">All transactions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalAmount, subscription?.currency)}</div>
                <p className="text-xs text-muted-foreground">All payments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Successful</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{successfulPayments}</div>
                <p className="text-xs text-muted-foreground">Completed payments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Failed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{failedPayments}</div>
                <p className="text-xs text-muted-foreground">Failed payments</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="succeeded">Succeeded</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="last30">Last 30 Days</SelectItem>
                    <SelectItem value="last90">Last 90 Days</SelectItem>
                    <SelectItem value="lastyear">Last Year</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={exportPayments} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Payment Transactions</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {filteredPayments.length} of {payments.length} transactions
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filteredPayments.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No payment transactions found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPayments.map((payment) => (
                    <div key={payment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {getStatusBadge(payment.status)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{formatCurrency(payment.amount, payment.currency)}</span>
                              {payment.refundAmount && (
                                <Badge variant="outline" className="text-blue-600">
                                  Refunded: {formatCurrency(payment.refundAmount, payment.currency)}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{payment.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(payment.date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <CreditCard className="h-3 w-3" />
                                {payment.paymentMethod}
                              </span>
                              <span className="font-mono">{payment.transactionId}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {payment.invoiceId && (
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {payment.failureReason && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          <AlertTriangle className="h-4 w-4 inline mr-1" />
                          Failure reason: {payment.failureReason}
                        </div>
                      )}
                      {payment.refundDate && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                          <RefreshCw className="h-4 w-4 inline mr-1" />
                          Refunded on: {formatDate(payment.refundDate)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
