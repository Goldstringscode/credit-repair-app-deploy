import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Subscription } from '@/lib/subscription-service'
import { 
  AlertTriangle, 
  Trash2, 
  Loader2,
  User,
  CreditCard,
  Calendar,
  DollarSign,
  X
} from 'lucide-react'

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  subscription: Subscription | null
  onConfirm: (subscriptionId: string, reason: string) => void
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  subscription
}: DeleteConfirmationModalProps) {
  const [deleting, setDeleting] = useState(false)
  const [reason, setReason] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const requiredConfirmText = `DELETE ${subscription?.customerName?.toUpperCase()}`

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!reason.trim()) {
      newErrors.reason = 'Deletion reason is required'
    }
    if (confirmText !== requiredConfirmText) {
      newErrors.confirmText = `Please type "${requiredConfirmText}" to confirm`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleDelete = async () => {
    if (!validateForm() || !subscription) {
      return
    }

    setDeleting(true)
    try {
      // Simulate API call to delete subscription
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      alert(`Subscription for ${subscription.customerName} has been permanently deleted.`)
      onClose()
    } catch (error) {
      alert('Failed to delete subscription. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const formatCurrency = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-6 w-6" />
            Delete Subscription
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. Please review the subscription details before proceeding.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Warning */}
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900">Warning: Permanent Deletion</h4>
                  <p className="text-sm text-red-700 mt-1">
                    This will permanently delete the subscription and all associated data. 
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Details */}
          {subscription && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Subscription to be Deleted</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="font-medium">{subscription.customerName}</div>
                      <div className="text-sm text-gray-500">{subscription.customerEmail}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="font-medium">{subscription.planName}</div>
                      <div className="text-sm text-gray-500">{subscription.billingCycle}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="font-medium">{formatCurrency(subscription.amount, subscription.currency)}</div>
                      <div className="text-sm text-gray-500">{subscription.paymentMethod}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="font-medium">Status: <Badge variant="outline">{subscription.status}</Badge></div>
                      <div className="text-sm text-gray-500">Created: {formatDate(subscription.createdAt)}</div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="text-sm text-gray-600">
                    <strong>Subscription ID:</strong> {subscription.id}
                  </div>
                  {subscription.stripeSubscriptionId && (
                    <div className="text-sm text-gray-600">
                      <strong>Stripe ID:</strong> {subscription.stripeSubscriptionId}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Deletion Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Deletion *</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for deleting this subscription"
            />
            {errors.reason && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" /> {errors.reason}
              </p>
            )}
          </div>

          {/* Confirmation */}
          <div className="space-y-2">
            <Label htmlFor="confirmText">
              Type <code className="bg-gray-100 px-1 rounded">{requiredConfirmText}</code> to confirm *
            </Label>
            <Input
              id="confirmText"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={requiredConfirmText}
            />
            {errors.confirmText && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" /> {errors.confirmText}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={deleting}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={deleting || confirmText !== requiredConfirmText}
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete Subscription
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
