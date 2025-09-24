'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Crown, 
  Star, 
  Zap, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  DollarSign
} from 'lucide-react'

interface Plan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: 'month' | 'year'
  features: string[]
  popular?: boolean
  icon: React.ReactNode
}

interface SubscriptionManagerProps {
  currentPlanId: string
  onPlanChange: (planId: string) => void
  onCancel: () => void
  onReactivate: () => void
  subscription?: {
    status: string
    currentPeriodEnd: string
    cancelAtPeriodEnd: boolean
  }
}

export function SubscriptionManager({
  currentPlanId,
  onPlanChange,
  onCancel,
  onReactivate,
  subscription
}: SubscriptionManagerProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [showChangeDialog, setShowChangeDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const plans: Plan[] = [
    {
      id: 'basic',
      name: 'Basic Plan',
      description: 'Essential credit repair tools',
      price: 29.99,
      currency: 'usd',
      interval: 'month',
      features: [
        'Credit report analysis',
        'Basic dispute letters',
        'Email support',
        'Monthly credit monitoring'
      ],
      icon: <Star className="h-5 w-5" />
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      description: 'Advanced credit repair features',
      price: 59.99,
      currency: 'usd',
      interval: 'month',
      features: [
        'Everything in Basic',
        'Advanced dispute strategies',
        'Priority support',
        'Weekly credit monitoring',
        'Custom dispute letters',
        'Credit score tracking'
      ],
      popular: true,
      icon: <Crown className="h-5 w-5" />
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      description: 'Complete credit repair solution',
      price: 99.99,
      currency: 'usd',
      interval: 'month',
      features: [
        'Everything in Premium',
        'Unlimited disputes',
        '24/7 phone support',
        'Daily credit monitoring',
        'AI-powered recommendations',
        'White-label options',
        'API access'
      ],
      icon: <Zap className="h-5 w-5" />
    }
  ]

  const currentPlan = plans.find(p => p.id === currentPlanId)

  const handlePlanChange = () => {
    if (selectedPlan) {
      onPlanChange(selectedPlan)
      setShowChangeDialog(false)
      setSelectedPlan(null)
    }
  }

  const handleCancel = () => {
    onCancel()
    setShowCancelDialog(false)
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

  return (
    <div className="space-y-6">
      {/* Current Plan Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Current Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentPlan && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {currentPlan.icon}
                  <div>
                    <h3 className="font-semibold text-lg">{currentPlan.name}</h3>
                    <p className="text-gray-600">{currentPlan.description}</p>
                  </div>
                </div>
                {subscription && getStatusBadge(subscription.status)}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  ${currentPlan.price}
                  <span className="text-sm font-normal text-gray-600">/{currentPlan.interval}</span>
                </span>
              </div>

              {subscription && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current period ends:</span>
                    <span>{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
                  </div>
                  {subscription.cancelAtPeriodEnd && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Your subscription will end on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}.
                        You can reactivate it anytime before then.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Dialog open={showChangeDialog} onOpenChange={setShowChangeDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      Change Plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Choose Your Plan</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                      {plans.map((plan) => (
                        <Card 
                          key={plan.id} 
                          className={`cursor-pointer transition-all ${
                            selectedPlan === plan.id 
                              ? 'ring-2 ring-blue-500 bg-blue-50' 
                              : plan.popular 
                                ? 'ring-1 ring-blue-300' 
                                : ''
                          }`}
                          onClick={() => setSelectedPlan(plan.id)}
                        >
                          {plan.popular && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                              <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                            </div>
                          )}
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              {plan.icon}
                              {plan.name}
                            </CardTitle>
                            <div className="text-2xl font-bold">
                              ${plan.price}
                              <span className="text-sm font-normal text-gray-600">/{plan.interval}</span>
                            </div>
                            <p className="text-sm text-gray-600">{plan.description}</p>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-1 text-sm">
                              {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowChangeDialog(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handlePlanChange}
                        disabled={!selectedPlan || selectedPlan === currentPlanId}
                      >
                        {selectedPlan === currentPlanId ? 'Current Plan' : 'Change Plan'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {subscription?.cancelAtPeriodEnd ? (
                  <Button onClick={onReactivate} className="flex-1">
                    Reactivate
                  </Button>
                ) : (
                  <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="flex-1">
                        Cancel
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cancel Subscription</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <p className="text-sm text-gray-600 mb-4">
                          Are you sure you want to cancel your subscription? You'll continue to have access 
                          until the end of your current billing period.
                        </p>
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            You can reactivate your subscription anytime before it expires.
                          </AlertDescription>
                        </Alert>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                          Keep Subscription
                        </Button>
                        <Button variant="destructive" onClick={handleCancel}>
                          Cancel Subscription
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}





