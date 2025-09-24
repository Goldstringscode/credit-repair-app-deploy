"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, Trash2, Archive, Star, MoreHorizontal } from "lucide-react"
import { useNotifications } from "@/lib/notification-context"

export function NotificationBulkActions() {
  const { 
    notifications, 
    getFilteredNotifications, 
    markSelectedAsRead, 
    deleteSelected,
    markFilteredAsRead,
    deleteFiltered
  } = useNotifications()
  
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)

  const filteredNotifications = getFilteredNotifications()
  const hasSelected = selectedIds.length > 0
  const hasFiltered = filteredNotifications.length > 0

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    if (checked) {
      setSelectedIds(filteredNotifications.map(n => n.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectNotification = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id])
    } else {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id))
    }
  }

  const handleMarkSelectedAsRead = async () => {
    if (selectedIds.length === 0) return
    await markSelectedAsRead(selectedIds)
    setSelectedIds([])
    setSelectAll(false)
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return
    await deleteSelected(selectedIds)
    setSelectedIds([])
    setSelectAll(false)
  }

  const handleMarkFilteredAsRead = async () => {
    await markFilteredAsRead()
    setSelectedIds([])
    setSelectAll(false)
  }

  const handleDeleteFiltered = async () => {
    await deleteFiltered()
    setSelectedIds([])
    setSelectAll(false)
  }

  // Update select all state when individual selections change
  const isAllSelected = selectedIds.length === filteredNotifications.length && filteredNotifications.length > 0
  const isPartiallySelected = selectedIds.length > 0 && selectedIds.length < filteredNotifications.length

  return (
    <div className="space-y-3">
      {/* Selection Controls */}
      {hasFiltered && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={isAllSelected}
                ref={(el) => {
                  if (el) {
                    el.indeterminate = isPartiallySelected
                  }
                }}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm font-medium">
                Select All
              </label>
            </div>
            
            {hasSelected && (
              <Badge variant="secondary" className="text-xs">
                {selectedIds.length} selected
              </Badge>
            )}
          </div>

          {/* Bulk Actions */}
          <div className="flex items-center space-x-2">
            {hasSelected ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkSelectedAsRead}
                  className="flex items-center space-x-1"
                >
                  <Eye className="h-4 w-4" />
                  <span>Mark Read</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteSelected}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkFilteredAsRead}
                  className="flex items-center space-x-1"
                >
                  <Eye className="h-4 w-4" />
                  <span>Mark All Read</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteFiltered}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete All</span>
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {!hasSelected && hasFiltered && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Quick actions:</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkFilteredAsRead}
            className="text-xs"
          >
            Mark all read
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteFiltered}
            className="text-xs text-red-600 hover:text-red-700"
          >
            Delete all
          </Button>
        </div>
      )}

      {/* Selection Summary */}
      {hasSelected && (
        <div className="text-sm text-muted-foreground">
          {selectedIds.length} of {filteredNotifications.length} notifications selected
        </div>
      )}
    </div>
  )
}