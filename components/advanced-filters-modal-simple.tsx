import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Filter, X, RotateCcw } from 'lucide-react'

interface AdvancedFilters {
  dateRange: {
    start: string
    end: string
  }
  amountRange: {
    min: string
    max: string
  }
  paymentMethods: string[]
  statuses: string[]
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

const STATUSES = ['active', 'cancelled', 'past_due', 'trialing', 'paused', 'grace_period', 'incomplete']

export default function AdvancedFiltersModal({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters
}: AdvancedFiltersModalProps) {
  const [filters, setFilters] = useState<AdvancedFilters>({
    dateRange: {
      start: currentFilters?.dateRange?.start || '',
      end: currentFilters?.dateRange?.end || ''
    },
    amountRange: {
      min: currentFilters?.amountRange?.min || '',
      max: currentFilters?.amountRange?.max || ''
    },
    paymentMethods: currentFilters?.paymentMethods || [],
    statuses: currentFilters?.statuses || [],
    search: currentFilters?.search || ''
  })

  const handlePaymentMethodToggle = (method: string) => {
    setFilters(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter(m => m !== method)
        : [...prev.paymentMethods, method]
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

  const handleApplyFilters = () => {
    onApplyFilters(filters)
    onClose()
  }

  const handleClearFilters = () => {
    setFilters({
      dateRange: { start: '', end: '' },
      amountRange: { min: '', max: '' },
      paymentMethods: [],
      statuses: [],
      search: ''
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.dateRange.start || filters.dateRange.end) count++
    if (filters.amountRange.min || filters.amountRange.max) count++
    if (filters.paymentMethods.length > 0) count++
    if (filters.statuses.length > 0) count++
    if (filters.search.trim()) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
                  <Input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      dateRange: { ...prev.dateRange, start: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">End Date</Label>
                  <Input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      dateRange: { ...prev.dateRange, end: e.target.value }
                    }))}
                  />
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
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      amountRange: { ...prev.amountRange, min: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Maximum Amount</Label>
                  <Input
                    type="number"
                    placeholder="999.99"
                    value={filters.amountRange.max}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      amountRange: { ...prev.amountRange, max: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

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
                      Start: {filters.dateRange.start}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(prev => ({ 
                        ...prev, 
                        dateRange: { ...prev.dateRange, start: '' }
                      }))} />
                    </Badge>
                  )}
                  {filters.dateRange.end && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      End: {filters.dateRange.end}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(prev => ({ 
                        ...prev, 
                        dateRange: { ...prev.dateRange, end: '' }
                      }))} />
                    </Badge>
                  )}
                  {filters.amountRange.min && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Min: ${filters.amountRange.min}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(prev => ({ 
                        ...prev, 
                        amountRange: { ...prev.amountRange, min: '' }
                      }))} />
                    </Badge>
                  )}
                  {filters.amountRange.max && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Max: ${filters.amountRange.max}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(prev => ({ 
                        ...prev, 
                        amountRange: { ...prev.amountRange, max: '' }
                      }))} />
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
