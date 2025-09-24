'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Settings,
  Loader2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface MLMSubscriptionSettingsProps {
  subscription: {
    id: string
    status: string
    currentPeriodEnd: string
    cancelAtPeriodEnd: boolean
    planType: string
    commissionRate: number
    rank: string
    mlmStatus: string
    commissionEligible: boolean
  }
  onPlanChange: (planType: string) => void
  onCancel: () => void
  onReactivate: () => void
  onUpdatePaymentMethod: (paymentMethodId: string) => void
}

export function MLMSubscriptionSettings({
  subscription,
  onPlanChange,
  onCancel,
  onReactivate,
  onUpdatePaymentMethod
}: MLMSubscriptionSettingsProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const { toast } = useToast()

  const handlePlanChange = async (newPlanType: string) => {
    if (newPlanType === subscription?.planType) return

    setIsUpdating(true)
    try {
      const response = await fetch('/api/mlm/subscription', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'change_plan',
          planType: newPlanType
        })
      })

      if (response.ok) {
        onPlanChange(newPlanType)
        toast({
          title: "Plan Updated",
          description: "Your MLM subscription plan has been updated successfully.",
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update plan')
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : 'Failed to update plan',
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancel = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch('/api/mlm/subscription', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'cancel'
        })
      })

      if (response.ok) {
        onCancel()
        toast({
          title: "Subscription Cancelled",
          description: "Your subscription will end at the current period.",
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to cancel subscription')
      }
    } catch (error) {
      toast({
        title: "Cancellation Failed",
        description: error instanceof Error ? error.message : 'Failed to cancel subscription',
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
      setShowCancelConfirm(false)
    }
  }

  const handleReactivate = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch('/api/mlm/subscription', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reactivate'
        })
      })

      if (response.ok) {
        onReactivate()
        toast({
          title: "Subscription Reactivated",
          description: "Your subscription has been reactivated successfully.",
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to reactivate subscription')
      }
    } catch (error) {
      toast({
        title: "Reactivation Failed",
        description: error instanceof Error ? error.message : 'Failed to reactivate subscription',
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdatePaymentMethod = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch('/api/mlm/subscription', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_payment_method',
          paymentMethodId: 'pm_demo_123'
        })
      })

      if (response.ok) {
        const result = await response.json()
        onUpdatePaymentMethod(result.paymentMethodId || 'pm_demo_123')
        toast({
          title: "Payment Method Updated",
          description: result.message || "Your payment method has been updated successfully.",
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update payment method')
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : 'Failed to update payment method',
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      past_due: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
      trialing: { color: 'bg-blue-100 text-blue-800', icon: Calendar }
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

  const getMLMStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: AlertTriangle },
      suspended: { color: 'bg-red-100 text-red-800', icon: AlertTriangle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
    const Icon = config.icon

    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.toUpperCase()}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Subscription Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Current Plan</h4>
              <p className="text-lg font-bold capitalize">
                {subscription?.planType?.replace('mlm_', '').replace('_', ' ') || 'Starter'}
              </p>
              <p className="text-sm text-gray-600">
                Commission Rate: {((subscription?.commissionRate || 0.3) * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Status</h4>
              <div className="flex gap-2">
                {getStatusBadge(subscription?.status || 'active')}
                {getMLMStatusBadge(subscription?.mlmStatus || 'active')}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Current Period</h4>
              <p className="text-sm text-gray-600">
                Ends: {new Date(subscription?.currentPeriodEnd || new Date()).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">MLM Rank</h4>
              <Badge variant="outline" className="text-purple-700 border-purple-300">
                {subscription?.rank || 'Bronze'}
              </Badge>
            </div>
          </div>

          {subscription?.cancelAtPeriodEnd && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your subscription will end on {new Date(subscription?.currentPeriodEnd || new Date()).toLocaleDateString()}.
                You can reactivate it anytime before then to maintain your commission eligibility.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Plan Management */}
      <Card>
        <CardHeader>
          <CardTitle>Change Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'mlm_starter', name: 'Starter', price: 49.99, commission: 30 },
              { id: 'mlm_professional', name: 'Professional', price: 99.99, commission: 35 },
              { id: 'mlm_enterprise', name: 'Enterprise', price: 199.99, commission: 40 }
            ].map((plan) => (
              <div
                key={plan.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  subscription?.planType === plan.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handlePlanChange(plan.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{plan.name}</h4>
                  {subscription?.planType === plan.id && (
                    <Badge className="bg-blue-500 text-white">Current</Badge>
                  )}
                </div>
                <p className="text-2xl font-bold">${plan.price}</p>
                <p className="text-sm text-gray-600">{plan.commission}% commission</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subscription Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {subscription?.cancelAtPeriodEnd ? (
              <Button
                onClick={handleReactivate}
                disabled={isUpdating}
                className="flex items-center gap-2"
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Reactivate Subscription
              </Button>
            ) : (
              <Button
                onClick={() => setShowCancelConfirm(true)}
                disabled={isUpdating}
                variant="destructive"
                className="flex items-center gap-2"
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                Cancel Subscription
              </Button>
            )}

            <Button
              onClick={handleUpdatePaymentMethod}
              variant="outline"
              className="flex items-center gap-2"
              disabled={isUpdating}
            >
              <CreditCard className="h-4 w-4" />
              Update Payment Method
            </Button>
          </div>

          {showCancelConfirm && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="space-y-3">
                <p>
                  Are you sure you want to cancel your subscription? You'll continue to have access 
                  until the end of your current billing period, but you'll lose commission eligibility.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCancel}
                    disabled={isUpdating}
                    variant="destructive"
                    size="sm"
                  >
                    Yes, Cancel
                  </Button>
                  <Button
                    onClick={() => setShowCancelConfirm(false)}
                    variant="outline"
                    size="sm"
                  >
                    Keep Subscription
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
