"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, Filter, X } from "lucide-react"
import { useNotifications } from "@/lib/notification-context"

export function NotificationFilters() {
  const { filters, setFilter, clearFilters, getFilteredNotifications } = useNotifications()
  const [showAdvanced, setShowAdvanced] = useState(false)

  const filteredNotifications = getFilteredNotifications()
  const hasActiveFilters = filters.type !== 'all' || 
                          filters.priority !== 'all' || 
                          filters.read !== 'all' || 
                          filters.search !== '' ||
                          filters.category !== 'all'

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.type !== 'all') count++
    if (filters.priority !== 'all') count++
    if (filters.read !== 'all') count++
    if (filters.search !== '') count++
    if (filters.category !== 'all') count++
    return count
  }

  return (
    <div className="space-y-3">
      {/* Quick Filters */}
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-1"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {getActiveFilterCount() > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {getActiveFilterCount()}
            </Badge>
          )}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="flex items-center space-x-1"
          >
            <X className="h-4 w-4" />
            <span>Clear</span>
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <Select value={filters.type} onValueChange={(value) => setFilter('type', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="credit_score">Credit Score</SelectItem>
                <SelectItem value="dispute">Dispute</SelectItem>
                <SelectItem value="fcra">FCRA</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="alert">Alert</SelectItem>
                <SelectItem value="mail">Mail</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <Select value={filters.priority} onValueChange={(value) => setFilter('priority', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={filters.read} onValueChange={(value) => setFilter('read', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select value={filters.category} onValueChange={(value) => setFilter('category', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="dispute">Dispute</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="milestone">Milestone</SelectItem>
                <SelectItem value="alert">Alert</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="mail">Mail</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {hasActiveFilters && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
          {getActiveFilterCount() > 0 && (
            <span> with {getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? 's' : ''} applied</span>
          )}
        </div>
      )}
    </div>
  )
}