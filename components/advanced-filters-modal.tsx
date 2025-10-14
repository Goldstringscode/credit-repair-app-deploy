import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Filter, X, RotateCcw } from 'lucide-react'
import { format } from 'date-fns'

interface AdvancedFilters {
  dateRange: {
    start: Date | null
    end: Date | null
  }
  amountRange: {
    min: string
    max: string
  }
  paymentMethods: string[]
  billingCycles: string[]
  statuses: string[]
  executiveAccounts: boolean | null
  gracePeriod: boolean | null
  search: string
}

interface AdvancedFiltersModalProps {
  isOpen: boolean
  onClose: () => void
  onApplyFilters: (filters: AdvancedFilters) => void
  currentFilters?: Partial<AdvancedFilters>
}

const PAYMENT_METHODS = [
  'Credit Card',
  'Bank Account',
  'PayPal',
  'Executive Account (Free)',
  'Apple Pay',
  'Google Pay'
]

const BILLING_CYCLES = ['month', 'year']
const STATUSES = ['active', 'cancelled', 'past_due', 'trialing', 'paused', 'grace_period', 'incomplete']

export default function AdvancedFiltersModal({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters
}: AdvancedFiltersModalProps) {
  const [filters, setFilters] = useState<AdvancedFilters>({
    dateRange: {
      start: currentFilters?.dateRange?.start || null,
      end: currentFilters?.dateRange?.end || null
    },
    amountRange: {
      min: currentFilters?.amountRange?.min || '',
      max: currentFilters?.amountRange?.max || ''
    },
    paymentMethods: currentFilters?.paymentMethods || [],
    billingCycles: currentFilters?.billingCycles || [],
    statuses: currentFilters?.statuses || [],
    executiveAccounts: currentFilters?.executiveAccounts || null,
    gracePeriod: currentFilters?.gracePeriod || null,
    search: currentFilters?.search || ''
  })

  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic')

  const handleDateRangeChange = (field: 'start' | 'end', date: Date | null) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: date
      }
    }))
  }

  const handleAmountRangeChange = (field: 'min' | 'max', value: string) => {
    setFilters(prev => ({
      ...prev,
      amountRange: {
        ...prev.amountRange,
        [field]: value
      }
    }))
  }

  const handlePaymentMethodToggle = (method: string) => {
    setFilters(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter(m => m !== method)
        : [...prev.paymentMethods, method]
    }))
  }

  const handleBillingCycleToggle = (cycle: string) => {
    setFilters(prev => ({
      ...prev,
      billingCycles: prev.billingCycles.includes(cycle)
        ? prev.billingCycles.filter(c => c !== cycle)
        : [...prev.billingCycles, cycle]
    }))
  }

  const handleStatusToggle = (status: string) => {
    setFilters(prev => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter(s => s !== status)
        : [...prev.statuses, status]
    }))
  }

  const handleExecutiveAccountsChange = (value: boolean | null) => {
    setFilters(prev => ({
      ...prev,
      executiveAccounts: value
    }))
  }

  const handleGracePeriodChange = (value: boolean | null) => {
    setFilters(prev => ({
      ...prev,
      gracePeriod: value
    }))
  }

  const handleApplyFilters = () => {
    onApplyFilters(filters)
    onClose()
  }

  const handleClearFilters = () => {
    setFilters({
      dateRange: { start: null, end: null },
      amountRange: { min: '', max: '' },
      paymentMethods: [],
      billingCycles: [],
      statuses: [],
      executiveAccounts: null,
      gracePeriod: null,
      search: ''
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.dateRange.start || filters.dateRange.end) count++
    if (filters.amountRange.min || filters.amountRange.max) count++
    if (filters.paymentMethods.length > 0) count++
    if (filters.billingCycles.length > 0) count++
    if (filters.statuses.length > 0) count++
    if (filters.executiveAccounts !== null) count++
    if (filters.gracePeriod !== null) count++
    if (filters.search.trim()) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} active
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Apply detailed filters to find specific subscriptions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('basic')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'basic'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Basic Filters
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'advanced'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Advanced Filters
            </button>
          </div>

          {/* Basic Filters */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              {/* Search */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Search</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    placeholder="Search by customer name, email, or subscription ID..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </CardContent>
              </Card>

              {/* Date Range */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Date Range</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-600">Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.dateRange.start ? format(filters.dateRange.start, 'PPP') : 'Select start date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={filters.dateRange.start || undefined}
                            onSelect={(date) => handleDateRangeChange('start', date || null)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.dateRange.end ? format(filters.dateRange.end, 'PPP') : 'Select end date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={filters.dateRange.end || undefined}
                            onSelect={(date) => handleDateRangeChange('end', date || null)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Amount Range */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Amount Range</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-600">Minimum Amount</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={filters.amountRange.min}
                        onChange={(e) => handleAmountRangeChange('min', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Maximum Amount</Label>
                      <Input
                        type="number"
                        placeholder="999.99"
                        value={filters.amountRange.max}
                        onChange={(e) => handleAmountRangeChange('max', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Advanced Filters */}
          {activeTab === 'advanced' && (
            <div className="space-y-4">
              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Payment Methods</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {PAYMENT_METHODS.map((method) => (
                      <div key={method} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`payment-${method}`}
                          checked={filters.paymentMethods.includes(method)}
                          onChange={() => handlePaymentMethodToggle(method)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={`payment-${method}`} className="text-sm">
                          {method}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Billing Cycles */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Billing Cycles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {BILLING_CYCLES.map((cycle) => (
                      <div key={cycle} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`cycle-${cycle}`}
                          checked={filters.billingCycles.includes(cycle)}
                          onChange={() => handleBillingCycleToggle(cycle)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={`cycle-${cycle}`} className="text-sm capitalize">
                          {cycle}ly
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Statuses */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Subscription Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {STATUSES.map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`status-${status}`}
                          checked={filters.statuses.includes(status)}
                          onChange={() => handleStatusToggle(status)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={`status-${status}`} className="text-sm capitalize">
                          {status.replace('_', ' ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Special Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Special Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Executive Accounts</Label>
                      <p className="text-xs text-gray-600">Filter by executive account status</p>
                    </div>
                    <Select
                      value={filters.executiveAccounts === null ? 'all' : filters.executiveAccounts ? 'yes' : 'no'}
                      onValueChange={(value) => handleExecutiveAccountsChange(
                        value === 'all' ? null : value === 'yes'
                      )}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Grace Period</Label>
                      <p className="text-xs text-gray-600">Filter by grace period status</p>
                    </div>
                    <Select
                      value={filters.gracePeriod === null ? 'all' : filters.gracePeriod ? 'yes' : 'no'}
                      onValueChange={(value) => handleGracePeriodChange(
                        value === 'all' ? null : value === 'yes'
                      )}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Active Filters Summary */}
          {activeFiltersCount > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Active Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {filters.dateRange.start && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Start: {format(filters.dateRange.start, 'MMM dd')}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => handleDateRangeChange('start', null)} />
                    </Badge>
                  )}
                  {filters.dateRange.end && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      End: {format(filters.dateRange.end, 'MMM dd')}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => handleDateRangeChange('end', null)} />
                    </Badge>
                  )}
                  {filters.amountRange.min && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Min: ${filters.amountRange.min}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => handleAmountRangeChange('min', '')} />
                    </Badge>
                  )}
                  {filters.amountRange.max && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Max: ${filters.amountRange.max}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => handleAmountRangeChange('max', '')} />
                    </Badge>
                  )}
                  {filters.paymentMethods.map((method) => (
                    <Badge key={method} variant="secondary" className="flex items-center gap-1">
                      {method}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => handlePaymentMethodToggle(method)} />
                    </Badge>
                  ))}
                  {filters.statuses.map((status) => (
                    <Badge key={status} variant="secondary" className="flex items-center gap-1">
                      {status.replace('_', ' ')}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => handleStatusToggle(status)} />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleClearFilters} className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Clear All
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleApplyFilters}>
              Apply Filters ({activeFiltersCount})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
