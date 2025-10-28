'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Filter,
  Search,
  Calendar,
  DollarSign,
  Shield,
  Crown,
  UserPlus,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface RecipientFilterModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (filters: RecipientFilters, recipientCount: number) => void
  currentRecipients?: number
}

interface RecipientFilters {
  userTypes: string[]
  subscriptionStatus: string[]
  joinDateRange: {
    start: string
    end: string
  }
  lastLoginRange: {
    start: string
    end: string
  }
  subscriptionPlans: string[]
  accountStatus: string[]
  customFilters: {
    hasActiveSubscription: boolean
    hasCompletedOnboarding: boolean
    hasMadePayment: boolean
    isEmailVerified: boolean
  }
  searchQuery: string
}

const USER_TYPES = [
  { id: 'premium', label: 'Premium Users', icon: Crown, description: 'Users with premium subscriptions' },
  { id: 'executive', label: 'Executive Users', icon: Shield, description: 'High-tier executive accounts' },
  { id: 'admin', label: 'Admin Users', icon: Shield, description: 'Administrative accounts' },
  { id: 'new', label: 'New Users', icon: UserPlus, description: 'Recently registered users' },
  { id: 'trial', label: 'Trial Users', icon: Clock, description: 'Users on trial periods' },
  { id: 'basic', label: 'Basic Users', icon: Users, description: 'Users with basic subscriptions' },
  { id: 'inactive', label: 'Inactive Users', icon: AlertCircle, description: 'Users who haven\'t logged in recently' }
]

const SUBSCRIPTION_STATUSES = [
  { id: 'active', label: 'Active', color: 'green' },
  { id: 'cancelled', label: 'Cancelled', color: 'red' },
  { id: 'paused', label: 'Paused', color: 'yellow' },
  { id: 'expired', label: 'Expired', color: 'gray' },
  { id: 'pending', label: 'Pending', color: 'blue' }
]

const SUBSCRIPTION_PLANS = [
  { id: 'basic', label: 'Basic Plan', price: '$29.99' },
  { id: 'premium', label: 'Premium Plan', price: '$59.99' },
  { id: 'executive', label: 'Executive Plan', price: '$99.99' },
  { id: 'enterprise', label: 'Enterprise Plan', price: '$199.99' },
  { id: 'trial', label: 'Trial', price: 'Free' }
]

const ACCOUNT_STATUSES = [
  { id: 'verified', label: 'Verified', color: 'green' },
  { id: 'unverified', label: 'Unverified', color: 'yellow' },
  { id: 'suspended', label: 'Suspended', color: 'red' },
  { id: 'pending', label: 'Pending', color: 'blue' }
]

export default function RecipientFilterModal({ isOpen, onClose, onApply, currentRecipients = 0 }: RecipientFilterModalProps) {
  const [filters, setFilters] = useState<RecipientFilters>({
    userTypes: [],
    subscriptionStatus: [],
    joinDateRange: { start: '', end: '' },
    lastLoginRange: { start: '', end: '' },
    subscriptionPlans: [],
    accountStatus: [],
    customFilters: {
      hasActiveSubscription: false,
      hasCompletedOnboarding: false,
      hasMadePayment: false,
      isEmailVerified: false
    },
    searchQuery: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [recipientCount, setRecipientCount] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Calculate recipient count based on filters
  useEffect(() => {
    if (isOpen) {
      calculateRecipientCount()
    }
  }, [filters, isOpen])

  const calculateRecipientCount = async () => {
    setLoading(true)
    try {
      // In a real app, this would make an API call to get the actual count
      // For now, we'll simulate based on filter complexity
      let count = 0
      
      if (filters.userTypes.length === 0 && 
          filters.subscriptionStatus.length === 0 && 
          filters.subscriptionPlans.length === 0 &&
          !filters.searchQuery) {
        count = 9999 // All users
      } else {
        // Simulate count based on selected filters
        count = Math.floor(Math.random() * 500) + 50
      }
      
      setRecipientCount(count)
    } catch (error) {
      console.error('Error calculating recipient count:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (filterType: keyof RecipientFilters, value: any) => {
    setFilters(prev => ({ ...prev, [filterType]: value }))
  }

  const handleUserTypeToggle = (userType: string) => {
    setFilters(prev => ({
      ...prev,
      userTypes: prev.userTypes.includes(userType)
        ? prev.userTypes.filter(t => t !== userType)
        : [...prev.userTypes, userType]
    }))
  }

  const handleStatusToggle = (statusType: 'subscriptionStatus' | 'accountStatus', status: string) => {
    setFilters(prev => ({
      ...prev,
      [statusType]: prev[statusType].includes(status)
        ? prev[statusType].filter(s => s !== status)
        : [...prev[statusType], status]
    }))
  }

  const handlePlanToggle = (plan: string) => {
    setFilters(prev => ({
      ...prev,
      subscriptionPlans: prev.subscriptionPlans.includes(plan)
        ? prev.subscriptionPlans.filter(p => p !== plan)
        : [...prev.subscriptionPlans, plan]
    }))
  }

  const handleCustomFilterToggle = (filter: keyof RecipientFilters['customFilters']) => {
    setFilters(prev => ({
      ...prev,
      customFilters: {
        ...prev.customFilters,
        [filter]: !prev.customFilters[filter]
      }
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      userTypes: [],
      subscriptionStatus: [],
      joinDateRange: { start: '', end: '' },
      lastLoginRange: { start: '', end: '' },
      subscriptionPlans: [],
      accountStatus: [],
      customFilters: {
        hasActiveSubscription: false,
        hasCompletedOnboarding: false,
        hasMadePayment: false,
        isEmailVerified: false
      },
      searchQuery: ''
    })
  }

  const handleApply = () => {
    onApply(filters, recipientCount)
    onClose()
  }

  const getActiveFilterCount = () => {
    let count = 0
    count += filters.userTypes.length
    count += filters.subscriptionStatus.length
    count += filters.subscriptionPlans.length
    count += filters.accountStatus.length
    count += Object.values(filters.customFilters).filter(Boolean).length
    if (filters.joinDateRange.start || filters.joinDateRange.end) count++
    if (filters.lastLoginRange.start || filters.lastLoginRange.end) count++
    if (filters.searchQuery) count++
    return count
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Recipient Filtering
          </DialogTitle>
          <DialogDescription>
            Select specific user groups and apply advanced filters to target your email campaigns
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Selection Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Filter Summary</span>
                <div className="flex items-center gap-2">
                  {getActiveFilterCount() > 0 && (
                    <Badge variant="secondary">
                      {getActiveFilterCount()} filters active
                    </Badge>
                  )}
                  <Button variant="outline" size="sm" onClick={clearAllFilters}>
                    Clear All
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">
                    {loading ? (
                      <span className="flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Calculating...
                      </span>
                    ) : (
                      `${recipientCount.toLocaleString()} recipients selected`
                    )}
                  </span>
                </div>
                {currentRecipients > 0 && (
                  <div className="text-sm text-gray-500">
                    Previous: {currentRecipients.toLocaleString()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="user-types" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="user-types">User Types</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
              <TabsTrigger value="dates">Date Ranges</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* User Types Tab */}
            <TabsContent value="user-types" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {USER_TYPES.map((userType) => {
                  const Icon = userType.icon
                  const isSelected = filters.userTypes.includes(userType.id)
                  
                  return (
                    <Card 
                      key={userType.id}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleUserTypeToggle(userType.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Checkbox 
                            checked={isSelected}
                            onChange={() => handleUserTypeToggle(userType.id)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <Icon className="h-4 w-4" />
                              <span className="font-medium">{userType.label}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{userType.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            {/* Subscription Tab */}
            <TabsContent value="subscription" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Subscription Status</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {SUBSCRIPTION_STATUSES.map((status) => (
                      <div key={status.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={status.id}
                          checked={filters.subscriptionStatus.includes(status.id)}
                          onCheckedChange={() => handleStatusToggle('subscriptionStatus', status.id)}
                        />
                        <Label htmlFor={status.id} className="text-sm">
                          {status.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Subscription Plans</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {SUBSCRIPTION_PLANS.map((plan) => (
                      <div key={plan.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={plan.id}
                          checked={filters.subscriptionPlans.includes(plan.id)}
                          onCheckedChange={() => handlePlanToggle(plan.id)}
                        />
                        <Label htmlFor={plan.id} className="text-sm">
                          {plan.label} - {plan.price}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Account Status</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {ACCOUNT_STATUSES.map((status) => (
                      <div key={status.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={status.id}
                          checked={filters.accountStatus.includes(status.id)}
                          onCheckedChange={() => handleStatusToggle('accountStatus', status.id)}
                        />
                        <Label htmlFor={status.id} className="text-sm">
                          {status.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Date Ranges Tab */}
            <TabsContent value="dates" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Join Date Range</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <Label htmlFor="join-start" className="text-xs">From</Label>
                        <Input
                          id="join-start"
                          type="date"
                          value={filters.joinDateRange.start}
                          onChange={(e) => handleFilterChange('joinDateRange', {
                            ...filters.joinDateRange,
                            start: e.target.value
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="join-end" className="text-xs">To</Label>
                        <Input
                          id="join-end"
                          type="date"
                          value={filters.joinDateRange.end}
                          onChange={(e) => handleFilterChange('joinDateRange', {
                            ...filters.joinDateRange,
                            end: e.target.value
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Last Login Range</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <Label htmlFor="login-start" className="text-xs">From</Label>
                        <Input
                          id="login-start"
                          type="date"
                          value={filters.lastLoginRange.start}
                          onChange={(e) => handleFilterChange('lastLoginRange', {
                            ...filters.lastLoginRange,
                            start: e.target.value
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="login-end" className="text-xs">To</Label>
                        <Input
                          id="login-end"
                          type="date"
                          value={filters.lastLoginRange.end}
                          onChange={(e) => handleFilterChange('lastLoginRange', {
                            ...filters.lastLoginRange,
                            end: e.target.value
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Search Query</Label>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, email, or other criteria..."
                      value={filters.searchQuery}
                      onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Custom Filters</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="active-subscription"
                        checked={filters.customFilters.hasActiveSubscription}
                        onCheckedChange={() => handleCustomFilterToggle('hasActiveSubscription')}
                      />
                      <Label htmlFor="active-subscription" className="text-sm">
                        Has Active Subscription
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="completed-onboarding"
                        checked={filters.customFilters.hasCompletedOnboarding}
                        onCheckedChange={() => handleCustomFilterToggle('hasCompletedOnboarding')}
                      />
                      <Label htmlFor="completed-onboarding" className="text-sm">
                        Completed Onboarding
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="made-payment"
                        checked={filters.customFilters.hasMadePayment}
                        onCheckedChange={() => handleCustomFilterToggle('hasMadePayment')}
                      />
                      <Label htmlFor="made-payment" className="text-sm">
                        Has Made Payment
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="email-verified"
                        checked={filters.customFilters.isEmailVerified}
                        onCheckedChange={() => handleCustomFilterToggle('isEmailVerified')}
                      />
                      <Label htmlFor="email-verified" className="text-sm">
                        Email Verified
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Apply Filters ({recipientCount.toLocaleString()})
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
