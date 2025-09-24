'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Search, 
  Filter,
  Plus,
  Calendar,
  DollarSign,
  Users,
  CreditCard,
  Settings,
  MoreHorizontal,
  Play,
  Pause,
  X,
  Edit,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react'

interface Subscription {
  id: string
  customerId: string
  planId: string
  status: 'active' | 'inactive' | 'past_due' | 'canceled' | 'unpaid' | 'trialing'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  canceledAt?: string
  trialStart?: string
  trialEnd?: string
  quantity: number
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}

interface Plan {
  id: string
  name: string
  description: string
  amount: number
  currency: string
  interval: string
  intervalCount: number
  trialPeriodDays?: number
  features: string[]
  isActive: boolean
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)

  // Mock data for demonstration
  const mockSubscriptions: Subscription[] = [
    {
      id: 'sub_1',
      customerId: 'cus_123',
      planId: 'premium',
      status: 'active',
      currentPeriodStart: '2024-01-01T00:00:00Z',
      currentPeriodEnd: '2024-02-01T00:00:00Z',
      cancelAtPeriodEnd: false,
      quantity: 1,
      metadata: {},
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'sub_2',
      customerId: 'cus_456',
      planId: 'basic',
      status: 'trialing',
      currentPeriodStart: '2024-01-15T00:00:00Z',
      currentPeriodEnd: '2024-02-15T00:00:00Z',
      cancelAtPeriodEnd: false,
      trialStart: '2024-01-15T00:00:00Z',
      trialEnd: '2024-01-22T00:00:00Z',
      quantity: 1,
      metadata: {},
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    },
    {
      id: 'sub_3',
      customerId: 'cus_789',
      planId: 'enterprise',
      status: 'past_due',
      currentPeriodStart: '2024-01-10T00:00:00Z',
      currentPeriodEnd: '2024-02-10T00:00:00Z',
      cancelAtPeriodEnd: false,
      quantity: 2,
      metadata: {},
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-10T00:00:00Z'
    },
    {
      id: 'sub_4',
      customerId: 'cus_101',
      planId: 'premium',
      status: 'canceled',
      currentPeriodStart: '2023-12-01T00:00:00Z',
      currentPeriodEnd: '2024-01-01T00:00:00Z',
      cancelAtPeriodEnd: true,
      canceledAt: '2024-01-01T00:00:00Z',
      quantity: 1,
      metadata: {},
      createdAt: '2023-12-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ]

  const mockPlans: Plan[] = [
    {
      id: 'basic',
      name: 'Basic Plan',
      description: 'Essential credit repair features',
      amount: 2999,
      currency: 'usd',
      interval: 'month',
      intervalCount: 1,
      trialPeriodDays: 7,
      features: ['Credit report analysis', 'Basic dispute letters', 'Email support'],
      isActive: true
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      description: 'Advanced credit repair with AI assistance',
      amount: 5999,
      currency: 'usd',
      interval: 'month',
      intervalCount: 1,
      trialPeriodDays: 14,
      features: ['Everything in Basic', 'Advanced dispute strategies', 'Priority support'],
      isActive: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      description: 'Full-featured solution for businesses',
      amount: 9999,
      currency: 'usd',
      interval: 'month',
      intervalCount: 1,
      trialPeriodDays: 30,
      features: ['Everything in Premium', 'Unlimited disputes', '24/7 phone support'],
      isActive: true
    }
  ]

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // In a real app, these would be API calls
        await new Promise(resolve => setTimeout(resolve, 1000))
        setSubscriptions(mockSubscriptions)
        setPlans(mockPlans)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      trialing: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      past_due: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
      canceled: { color: 'bg-gray-100 text-gray-800', icon: X },
      unpaid: { color: 'bg-red-100 text-red-800', icon: X },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: Pause }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive
    const Icon = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </Badge>
    )
  }

  const getPlanName = (planId: string) => {
    const plan = plans.find(p => p.id === planId)
    return plan ? plan.name : planId
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100)
  }

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = subscription.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.customerId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getSubscriptionStats = () => {
    const total = subscriptions.length
    const active = subscriptions.filter(s => s.status === 'active').length
    const trialing = subscriptions.filter(s => s.status === 'trialing').length
    const canceled = subscriptions.filter(s => s.status === 'canceled').length
    const pastDue = subscriptions.filter(s => s.status === 'past_due').length

    return { total, active, trialing, canceled, pastDue }
  }

  const stats = getSubscriptionStats()

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading subscriptions...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
            <p className="text-gray-600">Manage customer subscriptions and billing</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Subscription
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Trialing</p>
                <p className="text-2xl font-bold text-blue-600">{stats.trialing}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Past Due</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pastDue}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Canceled</p>
                <p className="text-2xl font-bold text-gray-600">{stats.canceled}</p>
              </div>
              <X className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList>
            <TabsTrigger value="all">All Subscriptions</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="trialing">Trialing</TabsTrigger>
            <TabsTrigger value="past_due">Past Due</TabsTrigger>
            <TabsTrigger value="canceled">Canceled</TabsTrigger>
          </TabsList>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search subscriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trialing">Trialing</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-4 font-medium">Subscription ID</th>
                      <th className="text-left p-4 font-medium">Customer</th>
                      <th className="text-left p-4 font-medium">Plan</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Current Period</th>
                      <th className="text-left p-4 font-medium">Quantity</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubscriptions.map((subscription) => (
                      <tr key={subscription.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-medium">{subscription.id}</td>
                        <td className="p-4">{subscription.customerId}</td>
                        <td className="p-4">{getPlanName(subscription.planId)}</td>
                        <td className="p-4">{getStatusBadge(subscription.status)}</td>
                        <td className="p-4">
                          <div className="text-sm">
                            <div>{new Date(subscription.currentPeriodStart).toLocaleDateString()}</div>
                            <div className="text-gray-600">to {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</div>
                          </div>
                        </td>
                        <td className="p-4">{subscription.quantity}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedSubscription(subscription)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs would have similar content but filtered by status */}
        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">Active subscriptions will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trialing" className="space-y-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600">Trialing subscriptions will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past_due" className="space-y-4">
          <Card>
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <p className="text-gray-600">Past due subscriptions will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="canceled" className="space-y-4">
          <Card>
            <CardContent className="p-6 text-center">
              <X className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600">Canceled subscriptions will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Subscription Detail Modal */}
      {selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Subscription Details
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSubscription(null)}
                >
                  Close
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Subscription ID</p>
                  <p className="font-mono text-sm">{selectedSubscription.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Customer ID</p>
                  <p className="font-mono text-sm">{selectedSubscription.customerId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Plan</p>
                  <p>{getPlanName(selectedSubscription.planId)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedSubscription.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Period</p>
                  <p className="text-sm">
                    {new Date(selectedSubscription.currentPeriodStart).toLocaleDateString()} - {' '}
                    {new Date(selectedSubscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Quantity</p>
                  <p>{selectedSubscription.quantity}</p>
                </div>
              </div>

              {selectedSubscription.trialStart && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Trial Period</p>
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm">
                      {new Date(selectedSubscription.trialStart).toLocaleDateString()} - {' '}
                      {selectedSubscription.trialEnd ? new Date(selectedSubscription.trialEnd).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Subscription
                </Button>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Billing Settings
                </Button>
                {selectedSubscription.status === 'active' && (
                  <Button variant="outline" className="text-red-600">
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}


