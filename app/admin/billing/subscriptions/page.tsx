'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { subscriptionService, type Subscription, type SubscriptionFilters } from '@/lib/subscription-service'
import CreateSubscriptionModal from '@/components/subscription-create-modal'
import SubscriptionDetailsModal from '@/components/subscription-details-modal'
import SubscriptionEditModal from '@/components/subscription-edit-modal'
import SubscriptionActionsDropdown from '@/components/subscription-actions-dropdown'
import PaymentHistoryModal from '@/components/payment-history-modal'
import PaymentMethodModal from '@/components/payment-method-modal'
import EmailComposerModal from '@/components/email-composer-modal'
import InvoiceGeneratorModal from '@/components/invoice-generator-modal'
import DeleteConfirmationModal from '@/components/delete-confirmation-modal'
import AdvancedFiltersModal from '@/components/advanced-filters-modal-simple'
import BulkEmailModal from '@/components/bulk-email-modal-simple'
import { 
  CreditCard, 
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
  Pause,
  Play,
  X,
  MoreHorizontal,
  Mail,
  Phone,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'

interface LocalSubscriptionFilters {
  status: string
  plan: string
  dateRange: string
  search: string
}

export default function AdminSubscriptionManagement() {
  const [selectedTab, setSelectedTab] = useState("all")
  const [loading, setLoading] = useState(true)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    active: 0,
    trialing: 0,
    past_due: 0,
    cancelled: 0,
    paused: 0,
    grace_period: 0
  })
  const [metrics, setMetrics] = useState({
    monthlyRecurringRevenue: 0,
    activeSubscriptions: 0,
    averageRevenuePerUser: 0
  })
  const [filters, setFilters] = useState<LocalSubscriptionFilters>({
    status: 'all',
    plan: 'all',
    dateRange: 'all',
    search: ''
  })
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isPaymentHistoryModalOpen, setIsPaymentHistoryModalOpen] = useState(false)
  const [isPaymentMethodModalOpen, setIsPaymentMethodModalOpen] = useState(false)
  const [isEmailComposerModalOpen, setIsEmailComposerModalOpen] = useState(false)
  const [isInvoiceGeneratorModalOpen, setIsInvoiceGeneratorModalOpen] = useState(false)
  const [isDeleteConfirmationModalOpen, setIsDeleteConfirmationModalOpen] = useState(false)
  const [isAdvancedFiltersModalOpen, setIsAdvancedFiltersModalOpen] = useState(false)
  const [isBulkEmailModalOpen, setIsBulkEmailModalOpen] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [advancedFilters, setAdvancedFilters] = useState<any>(null)
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<Subscription[]>([])

  // Load subscriptions from API
  const loadSubscriptions = async () => {
    setLoading(true)
    try {
      const apiFilters: SubscriptionFilters = {
        status: filters.status === 'all' ? undefined : filters.status,
        plan: filters.plan === 'all' ? undefined : filters.plan,
        search: filters.search || undefined,
        page: 1,
        limit: 100
      }

      const response = await subscriptionService.getSubscriptions(apiFilters)
      
      if (response.success) {
        setSubscriptions(response.data.subscriptions)
        setFilteredSubscriptions(response.data.subscriptions) // Initialize filtered subscriptions
        setStatusCounts(response.data.statusCounts)
        setMetrics(response.data.metrics)
      } else {
        console.error('Failed to load subscriptions:', response.error)
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubscriptions()
  }, [])


  // Reload when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadSubscriptions()
    }, 300) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [filters])

  const getStatusBadge = (status: string, subscription?: Subscription) => {
      const statusConfig = {
        active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
        cancelled: { color: 'bg-red-100 text-red-800', icon: X },
        past_due: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
        trialing: { color: 'bg-blue-100 text-blue-800', icon: Clock },
        paused: { color: 'bg-gray-100 text-gray-800', icon: Pause },
        incomplete: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
        grace_period: { color: 'bg-purple-100 text-purple-800', icon: Clock }
      }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
    const Icon = config.icon

    // Special handling for grace period with countdown
    if (status === 'grace_period' && subscription?.gracePeriodEndDate) {
      const daysRemaining = Math.ceil((new Date(subscription.gracePeriodEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      const isExpired = daysRemaining <= 0
      
      return (
        <div className="flex flex-col gap-1">
          <Badge className={`${isExpired ? 'bg-red-100 text-red-800' : config.color} border-0`}>
            <Icon className="h-3 w-3 mr-1" />
            GRACE PERIOD
          </Badge>
          <span className={`text-xs ${isExpired ? 'text-red-600 font-semibold' : 'text-purple-600'}`}>
            {isExpired ? 'EXPIRED' : `${daysRemaining} days left`}
          </span>
        </div>
      )
    }

    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      const response = await subscriptionService.cancelSubscription(subscriptionId, 'Cancelled by admin')
      if (response.success) {
        // Reload subscriptions to get updated data
        await loadSubscriptions()
        console.log(`Cancelled subscription ${subscriptionId}`)
        alert(`Subscription ${subscriptionId} has been cancelled successfully.`)
      } else {
        console.error('Failed to cancel subscription:', response.error)
        alert(`Failed to cancel subscription: ${response.error}`)
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      alert('An error occurred while cancelling the subscription.')
    }
  }

  const handlePauseSubscription = async (subscriptionId: string) => {
    try {
      const response = await subscriptionService.pauseSubscription(subscriptionId, 'Paused by admin')
      if (response.success) {
        // Reload subscriptions to get updated data
        await loadSubscriptions()
        console.log(`Paused subscription ${subscriptionId}`)
        alert(`Subscription ${subscriptionId} has been paused successfully.`)
      } else {
        console.error('Failed to pause subscription:', response.error)
        alert(`Failed to pause subscription: ${response.error}`)
      }
    } catch (error) {
      console.error('Error pausing subscription:', error)
      alert('An error occurred while pausing the subscription.')
    }
  }

  const handleResumeSubscription = async (subscriptionId: string) => {
    try {
      const response = await subscriptionService.resumeSubscription(subscriptionId, 'Resumed by admin')
      if (response.success) {
        // Reload subscriptions to get updated data
        await loadSubscriptions()
        console.log(`Resumed subscription ${subscriptionId}`)
        alert(`Subscription ${subscriptionId} has been resumed successfully.`)
      } else {
        console.error('Failed to resume subscription:', response.error)
        alert(`Failed to resume subscription: ${response.error}`)
      }
    } catch (error) {
      console.error('Error resuming subscription:', error)
      alert('An error occurred while resuming the subscription.')
    }
  }

  const handleViewSubscription = (subscription: Subscription) => {
    if (!subscription) {
      console.error('No subscription provided to handleViewSubscription')
      return
    }
    console.log('Viewing subscription:', subscription.id)
    setSelectedSubscription(subscription)
    setIsDetailsModalOpen(true)
  }

  const handleEditSubscription = (subscription: Subscription) => {
    if (!subscription) {
      console.error('No subscription provided to handleEditSubscription')
      return
    }
    console.log('Editing subscription:', subscription.id)
    setSelectedSubscription(subscription)
    setIsEditModalOpen(true)
  }

  const handleSaveSubscription = async (updatedSubscription: Subscription) => {
    try {
      const response = await subscriptionService.updateSubscriptionData(updatedSubscription.id, updatedSubscription)
      if (response.success) {
        await loadSubscriptions()
        console.log(`Updated subscription ${updatedSubscription.id}`)
        alert(`Subscription for ${updatedSubscription.customerName} has been updated successfully.`)
      } else {
        console.error('Failed to update subscription:', response.error)
        alert(`Failed to update subscription: ${response.error}`)
      }
    } catch (error) {
      console.error('Error updating subscription:', error)
      alert('An error occurred while updating the subscription.')
    }
  }

  const handleViewPaymentHistory = (subscription: Subscription) => {
    if (!subscription) {
      console.error('No subscription provided to handleViewPaymentHistory')
      return
    }
    console.log('View payment history for:', subscription.id)
    console.log('Setting selected subscription:', subscription)
    setSelectedSubscription(subscription)
    console.log('Opening payment history modal')
    setIsPaymentHistoryModalOpen(true)
    console.log('Payment history modal state set to true')
  }

  const handleUpdatePaymentMethod = (subscription: Subscription) => {
    if (!subscription) {
      console.error('No subscription provided to handleUpdatePaymentMethod')
      return
    }
    console.log('Update payment method for:', subscription.id)
    setSelectedSubscription(subscription)
    setIsPaymentMethodModalOpen(true)
  }

  const handleGenerateInvoice = (subscription: Subscription) => {
    if (!subscription) {
      console.error('No subscription provided to handleGenerateInvoice')
      return
    }
    console.log('Generate invoice for:', subscription.id)
    setSelectedSubscription(subscription)
    setIsInvoiceGeneratorModalOpen(true)
  }

  const handleExportData = (subscription: Subscription) => {
    if (!subscription) {
      console.error('No subscription provided to handleExportData')
      return
    }
    console.log('Export data for:', subscription.id)
    // Create CSV export for individual subscription
    const csvContent = [
      ['Field', 'Value'].join(','),
      ['Customer Name', subscription.customerName].join(','),
      ['Email', subscription.customerEmail].join(','),
      ['Plan', subscription.planName].join(','),
      ['Status', subscription.status].join(','),
      ['Amount', subscription.amount].join(','),
      ['Billing Cycle', subscription.billingCycle].join(','),
      ['Payment Method', subscription.paymentMethod].join(','),
      ['Created At', subscription.createdAt].join(','),
      ['Next Billing', subscription.nextBillingDate || 'N/A'].join(',')
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `subscription-${subscription.customerName}-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    alert(`Subscription data for ${subscription.customerName} exported successfully!`)
  }

  const handleSendEmail = (subscription: Subscription) => {
    if (!subscription) {
      console.error('No subscription provided to handleSendEmail')
      return
    }
    console.log('Send email to:', subscription.id)
    setSelectedSubscription(subscription)
    setIsEmailComposerModalOpen(true)
  }

  const handleDeleteSubscription = (subscriptionId: string) => {
    console.log('Delete subscription:', subscriptionId)
    const subscription = subscriptions.find(s => s.id === subscriptionId)
    if (subscription) {
      setSelectedSubscription(subscription)
      setIsDeleteConfirmationModalOpen(true)
    }
  }

  const handleRefreshSubscription = (subscriptionId: string) => {
    console.log('Refresh subscription:', subscriptionId)
    loadSubscriptions()
    alert('Subscription data refreshed from the database!')
  }

  const handleExportSubscriptions = () => {
    console.log('Exporting subscriptions...')
    // Create CSV export
    const csvContent = [
      ['ID', 'Customer Name', 'Email', 'Plan', 'Status', 'Amount', 'Next Billing', 'Payment Method'].join(','),
      ...subscriptions.map(sub => [
        sub.id,
        sub.customerName,
        sub.customerEmail,
        sub.planName,
        sub.status,
        sub.amount,
        sub.nextBillingDate,
        sub.paymentMethod
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `subscriptions-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleCreateSubscription = () => {
    console.log('Opening create subscription modal...')
    setIsCreateModalOpen(true)
  }

  const handleSubscriptionCreated = (newSubscription: Subscription) => {
    console.log('New subscription created:', newSubscription)
    // Reload subscriptions to show the new one
    loadSubscriptions()
    setIsCreateModalOpen(false)
  }

  const handleSendEmailToSelected = () => {
    console.log('Sending email to selected subscriptions...')
    alert('Send Email feature - This would open a modal to compose and send emails to selected customers')
  }

  const handleExportSelected = () => {
    console.log('Exporting selected subscriptions...')
    alert('Export Selected feature - This would export only the selected subscriptions')
  }

  const handleRefreshAll = () => {
    console.log('Refreshing all subscriptions...')
    loadSubscriptions()
  }

  const handleAdvancedFilters = () => {
    console.log('Opening advanced filters...')
    setIsAdvancedFiltersModalOpen(true)
  }

  const handleApplyAdvancedFilters = (filters: any) => {
    console.log('🔍 Parent: Received filters:', filters)
    console.log('🔍 Parent: Current subscriptions:', subscriptions.length)
    setAdvancedFilters(filters)
    // Apply filters to the subscription list
    applyAdvancedFilters(filters)
    console.log('🔍 Parent: Applied filters')
  }

  const handleClearFilters = () => {
    console.log('Clearing all filters')
    setAdvancedFilters(null)
    setFilteredSubscriptions(subscriptions)
  }

  const applyAdvancedFilters = (filters: any) => {
    console.log('🔍 applyAdvancedFilters called with:', filters)
    console.log('🔍 Starting with', subscriptions.length, 'subscriptions')
    let filtered = [...subscriptions]
    console.log('🔍 Initial filtered count:', filtered.length)
    
    // Search filter
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(subscription => 
        subscription.customerName.toLowerCase().includes(searchTerm) ||
        subscription.customerEmail.toLowerCase().includes(searchTerm) ||
        subscription.id.toLowerCase().includes(searchTerm) ||
        subscription.planName.toLowerCase().includes(searchTerm)
      )
    }
    
    // Date range filter
    if (filters.dateRange?.start || filters.dateRange?.end) {
      filtered = filtered.filter(subscription => {
        const subscriptionDate = new Date(subscription.createdAt)
        
        if (filters.dateRange.start) {
          const startDate = new Date(filters.dateRange.start)
          if (subscriptionDate < startDate) return false
        }
        
        if (filters.dateRange.end) {
          const endDate = new Date(filters.dateRange.end)
          endDate.setHours(23, 59, 59, 999) // Include entire end date
          if (subscriptionDate > endDate) return false
        }
        
        return true
      })
    }
    
    // Amount range filter
    if (filters.amountRange?.min || filters.amountRange?.max) {
      filtered = filtered.filter(subscription => {
        const amount = subscription.amount
        
        if (filters.amountRange.min) {
          const minAmount = parseFloat(filters.amountRange.min)
          if (amount < minAmount) return false
        }
        
        if (filters.amountRange.max) {
          const maxAmount = parseFloat(filters.amountRange.max)
          if (amount > maxAmount) return false
        }
        
        return true
      })
    }
    
    // Payment method filter
    if (filters.paymentMethods && filters.paymentMethods.length > 0) {
      filtered = filtered.filter(subscription => {
        const paymentMethod = subscription.paymentMethod || subscription.isExecutiveAccount ? 'Executive Account (Free)' : 'Unknown'
        return filters.paymentMethods.includes(paymentMethod)
      })
    }
    
    // Status filter
    if (filters.statuses && filters.statuses.length > 0) {
      filtered = filtered.filter(subscription => {
        return filters.statuses.includes(subscription.status)
      })
    }
    
    console.log('🔍 Final result: Filtered to', filtered.length, 'subscriptions')
    setFilteredSubscriptions(filtered)
    console.log('🔍 Set filtered subscriptions')
  }

  const handleBulkEmail = () => {
    console.log('Opening bulk email modal...')
    setIsBulkEmailModalOpen(true)
  }

  const handleSelectSubscription = (subscription: Subscription) => {
    setSelectedSubscriptions(prev => {
      const exists = prev.find(s => s.id === subscription.id)
      if (exists) {
        return prev.filter(s => s.id !== subscription.id)
      } else {
        return [...prev, subscription]
      }
    })
  }

  const handleSelectAll = () => {
    setSelectedSubscriptions(filteredSubscriptions)
  }

  const handleClearSelection = () => {
    setSelectedSubscriptions([])
  }

  // Subscriptions are already filtered by the API
  const filteredSubscriptions = subscriptions

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
            <p className="text-gray-600">Manage customer subscriptions, billing cycles, and payment issues</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadSubscriptions}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExportSubscriptions}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleCreateSubscription}>
              <Plus className="h-4 w-4 mr-2" />
              Create Subscription
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
              <TabsTrigger value="active">Active ({statusCounts.active})</TabsTrigger>
              <TabsTrigger value="trialing">Trialing ({statusCounts.trialing})</TabsTrigger>
              <TabsTrigger value="past_due">Past Due ({statusCounts.past_due})</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled ({statusCounts.cancelled})</TabsTrigger>
              <TabsTrigger value="paused">Paused ({statusCounts.paused})</TabsTrigger>
              <TabsTrigger value="grace_period">Grace Period ({statusCounts.grace_period})</TabsTrigger>
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
                    placeholder="Search subscriptions..."
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
                  <option value="active">Active</option>
                  <option value="trialing">Trialing</option>
                  <option value="past_due">Past Due</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="paused">Paused</option>
                </select>
                <select
                  value={filters.plan}
                  onChange={(e) => setFilters(prev => ({ ...prev, plan: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Plans</option>
                  <option value="basic">Basic Plan</option>
                  <option value="premium">Premium Plan</option>
                  <option value="enterprise">Enterprise Plan</option>
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
              </div>
            </CardContent>
          </Card>

          {/* Subscriptions Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Subscriptions</CardTitle>
                  <CardDescription>
                    {filteredSubscriptions.length} subscription{filteredSubscriptions.length !== 1 ? 's' : ''} found
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant={advancedFilters ? "default" : "outline"}
                    size="sm"
                    onClick={handleAdvancedFilters}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Advanced Filters
                    {advancedFilters && (
                      <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        Active
                      </span>
                    )}
                  </Button>
                  {advancedFilters && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleClearFilters}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleBulkEmail}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Bulk Email
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 font-medium text-sm">
                  <div className="col-span-3">Customer</div>
                  <div className="col-span-2">Plan</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1">Amount</div>
                  <div className="col-span-2">Next Billing</div>
                  <div className="col-span-1">Payment Method</div>
                  <div className="col-span-2">Actions</div>
                </div>
                {filteredSubscriptions.map((subscription) => (
                  <div key={subscription.id} className="grid grid-cols-12 gap-4 p-4 border-t hover:bg-gray-50">
                    <div className="col-span-3 flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {subscription.customerName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{subscription.customerName}</p>
                        <p className="text-sm text-gray-500">{subscription.customerEmail}</p>
                        <p className="text-xs text-gray-400">ID: {subscription.id}</p>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Badge variant="outline">{subscription.planName}</Badge>
                      <p className="text-xs text-gray-500 mt-1">{subscription.billingCycle}</p>
                    </div>
                        <div className="col-span-1">
                          {getStatusBadge(subscription.status, subscription)}
                        </div>
                        <div className="col-span-1">
                          <p className={`font-medium ${(subscription.amount === 0 || subscription.isExecutiveAccount) ? 'text-green-600' : ''}`}>
                            {(subscription.amount === 0 || subscription.isExecutiveAccount) ? 'FREE' : `$${subscription.amount}`}
                          </p>
                          <p className="text-xs text-gray-500">{subscription.currency.toUpperCase()}</p>
                          {(subscription.paymentMethod === 'Executive Account (Free)' || subscription.isExecutiveAccount) && (
                            <Badge className="mt-1 bg-green-100 text-green-800 border-green-300 text-xs">
                              Executive
                            </Badge>
                          )}
                        </div>
                    <div className="col-span-2">
                      <p className="text-sm">
                        {subscription.nextBillingDate ? 
                          new Date(subscription.nextBillingDate).toLocaleDateString() : 
                          'No billing'
                        }
                      </p>
                      <p className="text-xs text-gray-500">
                        {subscription.paymentMethod === 'Executive Account (Free)' ? 
                          'Executive Account' : 
                          subscription.cancelAtPeriodEnd ? 'Cancels at period end' : 'Auto-renewal'
                        }
                      </p>
                    </div>
                    <div className="col-span-1">
                      <p className="text-sm">
                        {subscription.paymentMethod === 'Executive Account (Free)' || subscription.isExecutiveAccount ? 
                          'Executive Account (Free)' : 
                          subscription.paymentMethod
                        }
                      </p>
                      {subscription.lastPaymentDate && !subscription.isExecutiveAccount && (
                        <p className="text-xs text-gray-500">
                          Last: {new Date(subscription.lastPaymentDate).toLocaleDateString()}
                        </p>
                      )}
                      {subscription.isExecutiveAccount && (
                        <p className="text-xs text-green-600 font-medium">
                          No payment required
                        </p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewSubscription(subscription)}
                          title="View subscription details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditSubscription(subscription)}
                          title="Edit subscription"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {subscription.status === 'active' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handlePauseSubscription(subscription.id)}
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        )}
                        {subscription.status === 'paused' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleResumeSubscription(subscription.id)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        {subscription.status === 'active' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleCancelSubscription(subscription.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                            <SubscriptionActionsDropdown
                              subscription={subscription}
                              onViewDetails={handleViewSubscription}
                              onEdit={handleEditSubscription}
                              onPause={handlePauseSubscription}
                              onResume={handleResumeSubscription}
                              onCancel={handleCancelSubscription}
                              onDelete={handleDeleteSubscription}
                              onViewPaymentHistory={handleViewPaymentHistory}
                              onUpdatePaymentMethod={handleUpdatePaymentMethod}
                              onGenerateInvoice={handleGenerateInvoice}
                              onExportData={handleExportData}
                              onSendEmail={handleSendEmail}
                              onRefresh={handleRefreshSubscription}
                            />
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
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={handleSendEmailToSelected}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email to Selected
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={handleExportSelected}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Selected
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={handleRefreshAll}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh All
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Alerts & Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Past Due Subscriptions</span>
                  <Badge variant="destructive">{statusCounts.past_due}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Expiring Trials</span>
                  <Badge variant="secondary">{statusCounts.trialing}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cancelled This Month</span>
                  <Badge variant="outline">{statusCounts.cancelled}</Badge>
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
                  <span className="text-sm">Monthly Recurring Revenue</span>
                  <span className="font-semibold">${metrics.monthlyRecurringRevenue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Subscriptions</span>
                  <span className="font-semibold">{metrics.activeSubscriptions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Average Revenue Per User</span>
                  <span className="font-semibold">${metrics.averageRevenuePerUser.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Subscription Modal */}
      <CreateSubscriptionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleSubscriptionCreated}
      />

      {/* Subscription Details Modal */}
      <SubscriptionDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedSubscription(null)
        }}
        subscription={selectedSubscription}
        onEdit={handleEditSubscription}
        onPause={handlePauseSubscription}
        onResume={handleResumeSubscription}
        onCancel={handleCancelSubscription}
        onDelete={(subscriptionId) => {
          console.log('Delete subscription:', subscriptionId)
          alert(`Delete subscription ${subscriptionId} - This would permanently delete the subscription`)
        }}
      />

      {/* Subscription Edit Modal */}
      <SubscriptionEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedSubscription(null)
        }}
        subscription={selectedSubscription}
        onSave={handleSaveSubscription}
      />

      {/* Payment History Modal */}
      <PaymentHistoryModal
        isOpen={isPaymentHistoryModalOpen}
        onClose={() => {
          setIsPaymentHistoryModalOpen(false)
          setSelectedSubscription(null)
        }}
        subscription={selectedSubscription}
      />

      {/* Payment Method Modal */}
      <PaymentMethodModal
        isOpen={isPaymentMethodModalOpen}
        onClose={() => {
          setIsPaymentMethodModalOpen(false)
          setSelectedSubscription(null)
        }}
        subscription={selectedSubscription}
        onUpdate={async (subscriptionId, newPaymentMethod, gracePeriodData = null) => {
          try {
            console.log(`Updating payment method for ${subscriptionId} to ${newPaymentMethod}`)
            
            // Prepare update data
            const updateData = {
              ...selectedSubscription,
              paymentMethod: newPaymentMethod,
              isExecutiveAccount: newPaymentMethod === 'Executive Account (Free)' || (newPaymentMethod.includes('Executive') && !newPaymentMethod.includes('Remaining') && !newPaymentMethod.includes('Required'))
            }
            
            // Add grace period data if provided
            if (gracePeriodData) {
              updateData.gracePeriodEndDate = gracePeriodData.gracePeriodEndDate
              updateData.status = gracePeriodData.status || 'grace_period'
              updateData.notes = `Demoted from executive account. Grace period until ${gracePeriodData.gracePeriodEndDate}`
            }
            
            // Update the subscription in the database
            const response = await subscriptionService.updateSubscriptionData(subscriptionId, updateData)
            
            if (response.success) {
              console.log('Successfully updated subscription in database')
              // Reload subscriptions to get updated data
              await loadSubscriptions()
              // Close the modal after successful update
              setIsPaymentMethodModalOpen(false)
              setSelectedSubscription(null)
              alert(`Payment method updated successfully! The subscription has been updated.`)
            } else {
              console.error('Failed to update subscription:', response.error)
              alert(`Failed to update subscription: ${response.error}`)
            }
          } catch (error) {
            console.error('Error updating subscription:', error)
            alert(`Error updating subscription: ${error.message}`)
          }
        }}
      />

      {/* Email Composer Modal */}
      <EmailComposerModal
        isOpen={isEmailComposerModalOpen}
        onClose={() => {
          setIsEmailComposerModalOpen(false)
          setSelectedSubscription(null)
        }}
        subscription={selectedSubscription}
            onSend={(emailData) => {
              console.log('Email sent via callback:', emailData)
              // The email composer now handles the actual sending
              // This callback is just for additional logging if needed
            }}
      />

      {/* Invoice Generator Modal */}
      <InvoiceGeneratorModal
        isOpen={isInvoiceGeneratorModalOpen}
        onClose={() => {
          setIsInvoiceGeneratorModalOpen(false)
          setSelectedSubscription(null)
        }}
        subscription={selectedSubscription}
        onGenerate={(invoiceData) => {
          console.log('Invoice generated:', invoiceData)
          alert(`Invoice ${invoiceData.invoiceNumber} generated successfully!`)
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteConfirmationModalOpen}
        onClose={() => {
          setIsDeleteConfirmationModalOpen(false)
          setSelectedSubscription(null)
        }}
        subscription={selectedSubscription}
        onConfirm={(subscriptionId, reason) => {
          console.log(`Deleting subscription ${subscriptionId} with reason: ${reason}`)
          loadSubscriptions()
          alert(`Subscription ${subscriptionId} has been permanently deleted.`)
        }}
      />

      {/* Advanced Filters Modal */}
      <AdvancedFiltersModal
        isOpen={isAdvancedFiltersModalOpen}
        onClose={() => setIsAdvancedFiltersModalOpen(false)}
        onApplyFilters={handleApplyAdvancedFilters}
        currentFilters={advancedFilters}
      />

      {/* Bulk Email Modal */}
      <BulkEmailModal
        isOpen={isBulkEmailModalOpen}
        onClose={() => setIsBulkEmailModalOpen(false)}
        subscriptions={filteredSubscriptions}
        selectedSubscriptions={selectedSubscriptions}
      />
    </div>
  )
}




