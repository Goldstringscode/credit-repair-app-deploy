'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import CreateSubscriptionModal from '@/components/subscription-create-modal'
import SubscriptionDetailsModal from '@/components/subscription-details-modal'
import SubscriptionEditModal from '@/components/subscription-edit-modal'
import { databaseService } from '@/lib/database-service'
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

interface Subscription {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  planId: string
  planName: string
  status: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'paused' | 'incomplete' | 'grace_period'
  currentPeriodStart: string
  currentPeriodEnd: string
  trialEnd?: string
  cancelAtPeriodEnd: boolean
  amount: number
  currency: string
  nextBillingDate: string
  createdAt: string
  lastPaymentDate?: string
  lastPaymentAmount?: number
  paymentMethod: string
  billingCycle: 'month' | 'year'
  prorationEnabled: boolean
  dunningEnabled: boolean
  notes?: string
  isExecutiveAccount?: boolean
  gracePeriodEndDate?: string
  gracePeriodDaysRemaining?: number
}

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
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([])
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [error, setError] = useState<string | null>(null)


  const loadSubscriptions = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('Loading subscriptions...', new Date().toISOString())
      
      // Use unified database service
      const response = await databaseService.getSubscriptions()
      
      if (response.success && response.data) {
        console.log('Database response:', response)
        console.log('Subscriptions data:', response.data.subscriptions)
        console.log('Subscriptions count:', response.data.subscriptions.length)
          setSubscriptions(response.data.subscriptions)
          setFilteredSubscriptions(response.data.subscriptions)
          setStatusCounts(response.data.statusCounts)
          setMetrics(response.data.metrics)
        console.log('Subscriptions loaded from database:', response.data.subscriptions.length)
      } else {
        console.log('Database failed:', response.error)
        setError(response.error || 'Failed to load subscriptions')
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error)
      setError(error instanceof Error ? error.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubscriptions()
  }, [])

  // Refresh data when page becomes visible (user navigates back to this page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
      loadSubscriptions()
      }
    }

    const handleFocus = () => {
      loadSubscriptions()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...subscriptions]

    if (filters.search) {
      filtered = filtered.filter(subscription =>
        subscription.customerName.toLowerCase().includes(filters.search.toLowerCase()) ||
        subscription.customerEmail.toLowerCase().includes(filters.search.toLowerCase()) ||
        subscription.id.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(subscription => subscription.status === filters.status)
    }

    if (filters.plan !== 'all') {
      filtered = filtered.filter(subscription => subscription.planId === filters.plan)
    }

    setFilteredSubscriptions(filtered)
  }, [subscriptions, filters])

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

    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  const handleCreateSubscription = () => {
    console.log('Opening create subscription modal...')
    console.log('Current modal state:', isCreateModalOpen)
    setIsCreateModalOpen(true)
    console.log('Modal state set to true')
  }

  const handleSubscriptionCreated = async (newSubscription: Subscription) => {
    console.log('New subscription created:', newSubscription)
    try {
      // First create the user
      const userData = {
        name: newSubscription.customerName,
        email: newSubscription.customerEmail,
        role: 'user',
        subscription: newSubscription.planName,
        phone: '',
        status: 'active'
      }
      
      const userResponse = await databaseService.createUser(userData)
      
      if (userResponse.success) {
        console.log('User created successfully:', userResponse.data.user)
        
        // Then create the subscription
        const subscriptionResponse = await databaseService.createSubscription(newSubscription)
        
        if (subscriptionResponse.success && subscriptionResponse.data) {
          const createdSubscription = subscriptionResponse.data.subscription
          setSubscriptions(prev => [...prev, createdSubscription])
          setFilteredSubscriptions(prev => [...prev, createdSubscription])
          setStatusCounts(prev => ({
            ...prev,
            all: prev.all + 1,
            [createdSubscription.status]: prev[createdSubscription.status as keyof typeof prev] + 1
          }))
          
          // Update metrics
          const activeSubs = [...subscriptions, createdSubscription].filter(s => s.status === "active")
          const mrr = activeSubs.reduce((sum, sub) => sum + sub.amount, 0)
          const arpu = activeSubs.length > 0 ? mrr / activeSubs.length : 0
          
          setMetrics({
            monthlyRecurringRevenue: mrr,
            activeSubscriptions: activeSubs.length,
            averageRevenuePerUser: arpu
          })
          
          setIsCreateModalOpen(false)
          alert('User and subscription created successfully!')
      } else {
          console.error('Failed to create subscription:', subscriptionResponse.error)
          alert(`Failed to create subscription: ${subscriptionResponse.error}`)
        }
      } else {
        console.error('Failed to create user:', userResponse.error)
        alert(`Failed to create user: ${userResponse.error}`)
      }
    } catch (error) {
      console.error('Error creating subscription:', error)
      alert('An error occurred while creating the subscription. Please try again.')
    }
  }

  const handleViewSubscription = (subscription: Subscription) => {
    console.log('Viewing subscription:', subscription.id)
    setSelectedSubscription(subscription)
    setIsDetailsModalOpen(true)
  }

  const handleEditSubscription = (subscription: Subscription) => {
    console.log('Editing subscription:', subscription.id)
    setSelectedSubscription(subscription)
    setIsEditModalOpen(true)
  }

  const handleDeleteSubscription = (subscription: Subscription) => {
    console.log('Deleting subscription:', subscription.id)
    setSelectedSubscription(subscription)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteSubscriptionConfirm = async () => {
    if (selectedSubscription) {
      console.log('Confirming delete for subscription:', selectedSubscription.id)
      try {
        // Call unified database service
        const response = await databaseService.deleteSubscription(selectedSubscription.id)
        
      if (response.success) {
          // Remove from local state
          setSubscriptions(prev => prev.filter(s => s.id !== selectedSubscription.id))
          setFilteredSubscriptions(prev => prev.filter(s => s.id !== selectedSubscription.id))
          setStatusCounts(prev => ({
            ...prev,
            all: prev.all - 1,
            [selectedSubscription.status]: prev[selectedSubscription.status as keyof typeof prev] - 1
          }))
          setIsDeleteModalOpen(false)
          setSelectedSubscription(null)
          alert('Subscription deleted successfully!')
      } else {
          console.error('Failed to delete subscription:', response.error)
          alert(`Failed to delete subscription: ${response.error}`)
      }
    } catch (error) {
        console.error('Error deleting subscription:', error)
        alert('An error occurred while deleting the subscription. Please try again.')
      }
    }
  }

  const handleSubscriptionUpdated = async (updatedSubscription: Subscription) => {
    console.log('Subscription updated:', updatedSubscription)
    try {
      // Call unified database service
      const response = await databaseService.updateSubscription(updatedSubscription.id, updatedSubscription)
      
      if (response.success && response.data) {
        const updatedSub = response.data.subscription
        setSubscriptions(prev => prev.map(s => s.id === updatedSub.id ? updatedSub : s))
        setFilteredSubscriptions(prev => prev.map(s => s.id === updatedSub.id ? updatedSub : s))
        setIsEditModalOpen(false)
        setSelectedSubscription(null)
        alert('Subscription updated successfully!')
      } else {
        console.error('Failed to update subscription:', response.error)
        alert(`Failed to update subscription: ${response.error}`)
      }
    } catch (error) {
      console.error('Error updating subscription:', error)
      alert('An error occurred while updating the subscription. Please try again.')
    }
  }

  const handleExportSubscriptions = () => {
    console.log('Exporting subscriptions...')
    // Create CSV export
    const csvContent = [
      ['ID', 'Customer Name', 'Email', 'Plan', 'Status', 'Amount', 'Next Billing', 'Payment Method'].join(','),
      ...filteredSubscriptions.map(sub => [
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading subscriptions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">Error loading subscriptions</p>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
          <Button onClick={loadSubscriptions} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
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
                      <p className="font-medium">${subscription.amount}</p>
                      <p className="text-xs text-gray-500">{subscription.currency.toUpperCase()}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm">
                        {subscription.nextBillingDate ? 
                          new Date(subscription.nextBillingDate).toLocaleDateString() : 
                          'No billing'
                        }
                      </p>
                      <p className="text-xs text-gray-500">
                        {subscription.cancelAtPeriodEnd ? 'Cancels at period end' : 'Auto-renewal'}
                      </p>
                    </div>
                    <div className="col-span-1">
                      <p className="text-sm">{subscription.paymentMethod}</p>
                      {subscription.lastPaymentDate && (
                        <p className="text-xs text-gray-500">
                          Last: {new Date(subscription.lastPaymentDate).toLocaleDateString()}
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
                          <Button 
                            variant="ghost" 
                            size="sm"
                          onClick={() => handleDeleteSubscription(subscription)}
                          title="Delete subscription"
                          >
                          <Trash2 className="h-4 w-4" />
                          </Button>
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
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={handleCreateSubscription}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Subscription
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={handleExportSubscriptions}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export All
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={loadSubscriptions}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh All
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Create Subscription</h2>
            <p className="mb-4">Test modal is working!</p>
            <div className="flex gap-2">
              <Button onClick={() => setIsCreateModalOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                console.log('Test subscription created')
                setIsCreateModalOpen(false)
              }}>
                Create Test Subscription
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <CreateSubscriptionModal
        isOpen={false}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleSubscriptionCreated}
      />

      <SubscriptionDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedSubscription(null)
        }}
        subscription={selectedSubscription}
        onEdit={handleEditSubscription}
        onPause={() => {}}
        onResume={() => {}}
        onCancel={() => {}}
        onDelete={() => {}}
      />

      <SubscriptionEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedSubscription(null)
        }}
        subscription={selectedSubscription}
        onSave={handleSubscriptionUpdated}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Subscription</h2>
            <p className="mb-4">
              Are you sure you want to delete the subscription for <strong>{selectedSubscription.customerName}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteSubscriptionConfirm}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}