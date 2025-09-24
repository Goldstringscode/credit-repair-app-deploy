'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { CheckCircle, AlertCircle, Clock, DollarSign } from 'lucide-react'

interface Plan {
  id: string
  name: string
  amount: number
  interval: string
  intervalCount: number
  features: string[]
  description: string
}

interface Subscription {
  id: string
  planId: string
  status: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
}

interface PlanManagementProps {
  currentPlan: Plan | null
  subscription: Subscription | null
  onPlanChange: () => void
}

export function PlanManagement({ currentPlan, subscription, onPlanChange }: PlanManagementProps) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [changeType, setChangeType] = useState<'immediate' | 'next_cycle'>('immediate')
  const [showChangeDialog, setShowChangeDialog] = useState(false)
  const [changing, setChanging] = useState(false)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/billing/user/plans', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      })
      if (response.ok) {
        const data = await response.json()
        setPlans(data.plans)
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlanSelect = (plan: Plan) => {
    if (plan.id === currentPlan?.id) return
    
    if (!subscription) {
      alert('No active subscription found. Please contact support to get started.')
      return
    }
    
    setSelectedPlan(plan)
    setShowChangeDialog(true)
  }

  const handlePlanChange = async () => {
    if (!selectedPlan || !subscription) {
      alert('No active subscription found. Please contact support to get started.')
      return
    }

    try {
      setChanging(true)
      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/billing/user/change-plan', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          subscriptionId: subscription.id,
          newPlanId: selectedPlan.id,
          changeType: changeType,
          prorationBehavior: 'create_prorations'
        })
      })

      if (response.ok) {
        const data = await response.json()
        onPlanChange()
        setShowChangeDialog(false)
        setSelectedPlan(null)
      } else {
        const error = await response.json()
        alert(`Failed to change plan: ${error.message}`)
      }
    } catch (error) {
      console.error('Plan change failed:', error)
      alert('Failed to change plan. Please try again.')
    } finally {
      setChanging(false)
    }
  }

  const getPlanComparison = (plan: Plan) => {
    if (!currentPlan) return 'new'
    if (plan.amount > currentPlan.amount) return 'upgrade'
    if (plan.amount < currentPlan.amount) return 'downgrade'
    return 'same'
  }

  const canChangeImmediately = (plan: Plan) => {
    if (!subscription || !subscription.currentPeriodEnd) return false
    const nextBilling = new Date(subscription.currentPeriodEnd)
    const now = new Date()
    const hoursUntilBilling = (nextBilling.getTime() - now.getTime()) / (1000 * 60 * 60)
    return hoursUntilBilling > 24
  }

  if (loading) {
    return <div className="text-center py-8">Loading plans...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Manage Your Plan</h2>
        <p className="text-gray-600 mt-2">Choose a plan that fits your needs</p>
      </div>

      {!subscription && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have an active subscription. Please contact support to get started.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const comparison = getPlanComparison(plan)
          const isCurrentPlan = plan.id === currentPlan?.id
          const canImmediate = canChangeImmediately(plan)

          return (
            <Card 
              key={plan.id} 
              className={`relative ${isCurrentPlan ? 'ring-2 ring-blue-500' : ''} ${
                comparison === 'upgrade' ? 'border-green-200' : 
                comparison === 'downgrade' ? 'border-yellow-200' : ''
              }`}
            >
              {isCurrentPlan && (
                <div className="absolute -top-2 -right-2">
                  <Badge className="bg-blue-500">Current Plan</Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plan.name}
                  <span className="text-2xl font-bold">
                    ${(plan.amount / 100).toFixed(2)}
                  </span>
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Features:</h4>
                  <ul className="space-y-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {!isCurrentPlan && (
                  <div className="space-y-2">
                    {comparison === 'upgrade' && (
                      <Alert>
                        <DollarSign className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          Upgrade options: Pay immediately with proration or wait for next billing cycle
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {comparison === 'downgrade' && (
                      <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          Downgrade options: Switch immediately or wait for next billing cycle
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button 
                      onClick={() => handlePlanSelect(plan)}
                      className="w-full"
                      variant={comparison === 'upgrade' ? 'default' : 'outline'}
                    >
                      {comparison === 'upgrade' ? 'Upgrade Plan' : 
                       comparison === 'downgrade' ? 'Downgrade Plan' : 'Change Plan'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Plan Change Dialog */}
      <Dialog open={showChangeDialog} onOpenChange={setShowChangeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Plan</DialogTitle>
            <DialogDescription>
              You're changing from {currentPlan?.name} to {selectedPlan?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Change Options:</h4>
              <RadioGroup value={changeType} onValueChange={(value: 'immediate' | 'next_cycle') => setChangeType(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="immediate" id="immediate" />
                  <Label htmlFor="immediate" className="flex-1">
                    <div className="font-medium">Change Immediately</div>
                    <div className="text-sm text-gray-500">
                      {getPlanComparison(selectedPlan!) === 'upgrade' 
                        ? 'Pay prorated amount now, billing cycle resets to today'
                        : 'Switch to new plan immediately, no additional charge'
                      }
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="next_cycle" id="next_cycle" />
                  <Label htmlFor="next_cycle" className="flex-1">
                    <div className="font-medium">Change at Next Billing Cycle</div>
                    <div className="text-sm text-gray-500">
                      Plan will change on {subscription ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'Next billing cycle'}
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {changeType === 'immediate' && getPlanComparison(selectedPlan!) === 'upgrade' && (
              <Alert>
                <DollarSign className="h-4 w-4" />
                <AlertDescription>
                  You will be charged a prorated amount for the upgrade. Your billing cycle will reset to today.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePlanChange} disabled={changing}>
              {changing ? 'Changing...' : 'Confirm Change'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
