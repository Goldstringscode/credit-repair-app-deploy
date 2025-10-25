'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Star,
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  Settings,
  Gift,
  TestTube,
  BarChart3
} from 'lucide-react'
import { PricingPlan, PromotionalPricing, ABTest } from '@/lib/pricing-plan-manager'

export default function PricingPlansManagement() {
  const [plans, setPlans] = useState<PricingPlan[]>([])
  const [promotions, setPromotions] = useState<PromotionalPricing[]>([])
  const [abTests, setABTests] = useState<ABTest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreatePlan, setShowCreatePlan] = useState(false)
  const [showCreatePromotion, setShowCreatePromotion] = useState(false)
  const [showCreateABTest, setShowCreateABTest] = useState(false)
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null)

  useEffect(() => {
    loadPricingData()
  }, [])

  // Auto-refresh when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadPricingData()
      }
    }

    const handleFocus = () => {
      loadPricingData()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const loadPricingData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/billing/plans')
      const data = await response.json()
      
      if (data.success && data.data) {
        setPlans(data.data.plans || [])
        setPromotions(data.data.promotions || [])
        setABTests(data.data.abTests || [])
      } else {
        setError(data.error || 'Failed to load pricing data')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePlan = async (planData: Omit<PricingPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/billing/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData)
      })
      
      const data = await response.json()
      if (data.success) {
        await loadPricingData()
        setShowCreatePlan(false)
      } else {
        setError(data.error || 'Failed to create plan')
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleUpdatePlan = async (planId: string, updates: Partial<PricingPlan>) => {
    try {
      const response = await fetch(`/api/billing/plans/${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      const data = await response.json()
      if (data.success) {
        await loadPricingData()
        setEditingPlan(null)
      } else {
        setError(data.error || 'Failed to update plan')
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return
    
    try {
      const response = await fetch(`/api/billing/plans/${planId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      if (data.success) {
        await loadPricingData()
      } else {
        setError(data.error || 'Failed to delete plan')
      }
    } catch (err: any) {
      setError(err.message)
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
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pricing Plans</h1>
            <p className="text-gray-600">Manage subscription plans and pricing</p>
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
            <h1 className="text-3xl font-bold">Pricing Plans</h1>
            <p className="text-gray-600">Manage subscription plans and pricing</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Pricing Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadPricingData} variant="outline">
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
          <h1 className="text-3xl font-bold">Pricing Plans</h1>
          <p className="text-gray-600">Manage subscription plans and pricing</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowCreatePlan(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Plan
          </Button>
          <Button onClick={() => setShowCreatePromotion(true)} variant="outline">
            <Gift className="h-4 w-4 mr-2" />
            Promotion
          </Button>
          <Button onClick={() => setShowCreateABTest(true)} variant="outline">
            <TestTube className="h-4 w-4 mr-2" />
            A/B Test
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Plans</p>
                <p className="text-2xl font-bold">{plans.length}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Plans</p>
                <p className="text-2xl font-bold text-green-600">
                  {plans.filter(plan => plan.isActive).length}
                </p>
              </div>
              <Star className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Promotions</p>
                <p className="text-2xl font-bold text-orange-600">
                  {promotions.filter(promo => promo.isActive).length}
                </p>
              </div>
              <Gift className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">A/B Tests</p>
                <p className="text-2xl font-bold text-purple-600">
                  {abTests.filter(test => test.isActive).length}
                </p>
              </div>
              <TestTube className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Plans</CardTitle>
          <CardDescription>Manage your subscription plans and pricing</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Interval</TableHead>
                <TableHead>Features</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div>
                        <div className="font-medium">{plan.name}</div>
                        <div className="text-sm text-gray-500">{plan.description}</div>
                      </div>
                      {plan.isPopular && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatCurrency(plan.amount, plan.currency)}
                    </div>
                    {plan.trialPeriodDays && (
                      <div className="text-sm text-gray-500">
                        {plan.trialPeriodDays} day trial
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      Every {plan.intervalCount} {plan.interval}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {plan.features.length} features
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={plan.isActive ? "default" : "secondary"}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      {formatDate(plan.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingPlan(plan)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeletePlan(plan.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Plan Dialog */}
      {(showCreatePlan || editingPlan) && (
        <Dialog open={showCreatePlan || !!editingPlan} onOpenChange={() => {
          setShowCreatePlan(false)
          setEditingPlan(null)
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? 'Edit Plan' : 'Create New Plan'}
              </DialogTitle>
            </DialogHeader>
            <PlanForm
              plan={editingPlan}
              onSubmit={editingPlan ? 
                (data) => handleUpdatePlan(editingPlan.id, data) :
                handleCreatePlan
              }
              onCancel={() => {
                setShowCreatePlan(false)
                setEditingPlan(null)
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Plan Form Component
function PlanForm({ 
  plan, 
  onSubmit, 
  onCancel 
}: { 
  plan: PricingPlan | null
  onSubmit: (data: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: plan?.name || '',
    description: plan?.description || '',
    amount: plan?.amount || 0,
    currency: plan?.currency || 'usd',
    interval: plan?.interval || 'month',
    intervalCount: plan?.intervalCount || 1,
    trialPeriodDays: plan?.trialPeriodDays || 0,
    features: plan?.features || [],
    isActive: plan?.isActive ?? true,
    isPopular: plan?.isPopular ?? false,
    sortOrder: plan?.sortOrder || 0
  })

  const [newFeature, setNewFeature] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }))
      setNewFeature('')
    }
  }

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Plan Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="amount">Price (in cents)</Label>
          <Input
            id="amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: parseInt(e.target.value) }))}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="usd">USD</SelectItem>
              <SelectItem value="eur">EUR</SelectItem>
              <SelectItem value="gbp">GBP</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="interval">Interval</Label>
          <Select value={formData.interval} onValueChange={(value) => setFormData(prev => ({ ...prev, interval: value as 'day' | 'week' | 'month' | 'year' }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="intervalCount">Interval Count</Label>
          <Input
            id="intervalCount"
            type="number"
            min="1"
            value={formData.intervalCount}
            onChange={(e) => setFormData(prev => ({ ...prev, intervalCount: parseInt(e.target.value) }))}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="trialPeriodDays">Trial Period (days)</Label>
        <Input
          id="trialPeriodDays"
          type="number"
          min="0"
          value={formData.trialPeriodDays}
          onChange={(e) => setFormData(prev => ({ ...prev, trialPeriodDays: parseInt(e.target.value) }))}
        />
      </div>

      <div>
        <Label>Features</Label>
        <div className="space-y-2">
          <div className="flex space-x-2">
            <Input
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="Add a feature"
            />
            <Button type="button" onClick={addFeature} variant="outline">
              Add
            </Button>
          </div>
          <div className="space-y-1">
            {formData.features.map((feature, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-sm">{feature}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => removeFeature(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="isPopular"
            checked={formData.isPopular}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPopular: checked }))}
          />
          <Label htmlFor="isPopular">Popular</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {plan ? 'Update Plan' : 'Create Plan'}
        </Button>
      </div>
    </form>
  )
}