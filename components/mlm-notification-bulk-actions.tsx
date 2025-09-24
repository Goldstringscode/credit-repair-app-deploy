"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle, 
  Trash2, 
  Archive, 
  MoreHorizontal,
  ChevronDown
} from "lucide-react"
import { useMLMNotifications } from "@/lib/mlm-notification-context"

export function MLMNotificationBulkActions() {
  const { 
    notifications, 
    getFilteredNotifications, 
    markSelectedAsRead, 
    deleteSelected,
    markFilteredAsRead,
    deleteFiltered
  } = useMLMNotifications()
  
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)

  const filteredNotifications = getFilteredNotifications()
  const unreadFiltered = filteredNotifications.filter(n => !n.read)
  const selectedCount = selectedIds.length

  const handleSelectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredNotifications.map(n => n.id))
    }
  }

  const handleSelectNotification = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    )
  }

  const handleMarkSelectedAsRead = async () => {
    if (selectedCount === 0) return
    await markSelectedAsRead(selectedIds)
    setSelectedIds([])
  }

  const handleDeleteSelected = async () => {
    if (selectedCount === 0) return
    await deleteSelected(selectedIds)
    setSelectedIds([])
  }

  const handleMarkFilteredAsRead = async () => {
    if (unreadFiltered.length === 0) return
    await markFilteredAsRead()
  }

  const handleDeleteFiltered = async () => {
    if (filteredNotifications.length === 0) return
    await deleteFiltered()
  }

  const isAllSelected = selectedIds.length === filteredNotifications.length && filteredNotifications.length > 0
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < filteredNotifications.length

  return (
    <div className="space-y-3">
      {/* Selection Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={isAllSelected}
              ref={(el) => {
                if (el) el.indeterminate = isIndeterminate
              }}
              onCheckedChange={handleSelectAll}
            />
            <label 
              htmlFor="select-all" 
              className="text-sm font-medium cursor-pointer"
            >
              Select All ({filteredNotifications.length})
            </label>
          </div>
          
          {selectedCount > 0 && (
            <Badge variant="secondary">
              {selectedCount} selected
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {selectedCount > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkSelectedAsRead}
                className="flex items-center space-x-1"
              >
                <CheckCircle className="h-4 w-4" />
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
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBulkActions(!showBulkActions)}
            className="flex items-center space-x-1"
          >
            <MoreHorizontal className="h-4 w-4" />
            <ChevronDown className={`h-3 w-3 transition-transform ${showBulkActions ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {showBulkActions && (
        <div className="p-3 bg-gray-50 rounded-lg space-y-3">
          <div className="text-sm font-medium text-gray-700">Bulk Actions</div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="text-xs text-gray-600">Filtered Notifications</div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkFilteredAsRead}
                  disabled={unreadFiltered.length === 0}
                  className="flex items-center space-x-1"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Mark All Read ({unreadFiltered.length})</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteFiltered}
                  disabled={filteredNotifications.length === 0}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete All ({filteredNotifications.length})</span>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-gray-600">Selected Notifications</div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkSelectedAsRead}
                  disabled={selectedCount === 0}
                  className="flex items-center space-x-1"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Mark Read ({selectedCount})</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteSelected}
                  disabled={selectedCount === 0}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete ({selectedCount})</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Notification Selection - Optimized */}
      {filteredNotifications.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">
            Individual Selection ({selectedCount} of {filteredNotifications.length} selected)
          </div>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {filteredNotifications.slice(0, 5).map((notification) => (
              <div 
                key={notification.id}
                className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded"
              >
                <Checkbox
                  id={`select-${notification.id}`}
                  checked={selectedIds.includes(notification.id)}
                  onCheckedChange={() => handleSelectNotification(notification.id)}
                />
                <label 
                  htmlFor={`select-${notification.id}`}
                  className="flex-1 text-sm cursor-pointer truncate"
                >
                  {notification.title}
                </label>
                <Badge 
                  variant={notification.priority === "high" ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {notification.priority}
                </Badge>
              </div>
            ))}
            {filteredNotifications.length > 5 && (
              <div className="text-xs text-gray-500 text-center py-2 border-t">
                Showing 5 of {filteredNotifications.length} notifications
                <br />
                Use "Select All" or bulk actions for all notifications
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
